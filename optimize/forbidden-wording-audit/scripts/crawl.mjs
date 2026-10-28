// Crawl a site with Chrome DevTools MCP, find forbidden wording, take highlighted screenshots.
//
//   node crawl.mjs --site https://win777.us --rules ../rules/win777-house-rules.json --out <dir>
//     [--urls urls.json]   audit only these URLs (skips the sitemap)
//     [--no-follow]        do not add internal pages linked from the audited pages
//     [--max 300]          page cap
//
// Writes <out>/results.jsonl (one line per page, appended, so a rerun resumes) and
// <out>/shots/*.jpeg. A page that rendered a not-found or empty body is retried once at
// the end; report.py keeps the last record per URL.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {startMcp, parseEval} from './mcp.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const SITE = new URL(opt('site')).origin;
const RULES = JSON.parse(fs.readFileSync(opt('rules'), 'utf8')).rules;
const OUT = path.resolve(opt('out'));
const MAX = +opt('max', 300), FOLLOW = !argv.includes('--no-follow'), MAXSHOTS = 30;
fs.mkdirSync(path.join(OUT, 'shots'), {recursive: true});
const RES = path.join(OUT, 'results.jsonl');
const SCAN = fs.readFileSync(path.join(HERE, 'scan.js'), 'utf8').split('__RULES_JSON__').join(JSON.stringify(RULES));
const SHOOT = fs.readFileSync(path.join(HERE, 'shoot.js'), 'utf8');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const norm = u => { const x = new URL(u); x.hash = ''; return x.origin + (x.pathname.replace(/\/$/, '') || '/') + x.search; };
const host = new URL(SITE).hostname;
const okExtra = u => { const x = new URL(u); return x.hostname === host && !x.search && !/\.\w{2,4}$/.test(x.pathname) && !/^\/games\/play\//.test(x.pathname); };
const broken = r => !r.error && (/not found|^404\b/i.test(r.title || '') || (r.h1 || '').trim() === '404' || !r.title || (r.words ?? 999) < 60);

let m = await startMcp();
const setup = () => m.call('resize_page', {pageId: 1, width: 1366, height: 900});
await setup();

async function sitemapUrls() {
  await m.call('navigate_page', {pageId: 1, type: 'url', url: SITE + '/', timeout: 60000});
  const fn = `async () => {
    const seen = new Set(), pages = [];
    const robots = await fetch('/robots.txt').then(r => r.ok ? r.text() : '').catch(() => '');
    const queue = [...robots.matchAll(/^sitemap:\\s*(\\S+)/gim)].map(x => x[1]);
    if (!queue.length) queue.push(location.origin + '/sitemap.xml');
    while (queue.length) {
      const u = queue.shift(); if (seen.has(u)) continue; seen.add(u);
      const t = await fetch(u).then(r => r.ok ? r.text() : '').catch(() => '');
      const locs = [...t.matchAll(/<loc>\\s*([^<\\s]+)\\s*<\\/loc>/g)].map(x => x[1].replace(/&amp;/g, '&'));
      if (/<sitemapindex/i.test(t)) queue.push(...locs); else pages.push(...locs);
    }
    return pages;
  }`;
  return parseEval(await m.call('evaluate_script', {pageId: 1, function: fn}));
}

const prior = fs.existsSync(RES) ? fs.readFileSync(RES, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];
const done = new Set(prior.filter(r => !r.error && !broken(r)).map(r => r.req));
const seed = opt('urls') ? JSON.parse(fs.readFileSync(opt('urls'), 'utf8')) : await sitemapUrls();
console.log('seed URLs:', seed.length);
const queue = seed.map(norm); const seen = new Set(queue); const inSeed = new Set(queue);
for (const r of prior) for (const l of r.links || []) { const n = norm(l); if (FOLLOW && !seen.has(n) && okExtra(n)) { seen.add(n); queue.push(n); } }
const seenShared = new Set(prior.flatMap(r => (r.hits || []).filter(h => h.region !== 'main' && h.shot).map(h => h.region + '|' + h.context)));

async function auditPage(url, attempt) {
  const rec = {req: url, inSitemap: inSeed.has(url), attempt, shots: []};
  try {
    const nav = await m.call('navigate_page', {pageId: 1, type: 'url', url, timeout: 60000});
    if (/Unable to navigate/.test(nav)) throw new Error(nav.split('\n')[0]);
    await sleep(1500);
    // scroll once to trigger lazy content, then back to the top
    await m.call('evaluate_script', {pageId: 1, function: 'async()=>{for(let y=0;y<document.body.scrollHeight;y+=800){scrollTo(0,y);await new Promise(r=>setTimeout(r,60));}scrollTo(0,0);return 1}'});
    Object.assign(rec, parseEval(await m.call('evaluate_script', {pageId: 1, function: SCAN})));
    if (FOLLOW) for (const l of rec.links) { const n = norm(l); if (!seen.has(n) && okExtra(n) && queue.length < MAX) { seen.add(n); queue.push(n); } }
    // screenshot blocks holding a screenshot-worthy hit; header/footer blocks only the first time the same text shows up
    const byBlock = {};
    for (const h of rec.hits) (byBlock[h.block] ??= []).push(h);
    const targets = [];
    for (const [b, hs] of Object.entries(byBlock)) {
      if (!hs.some(h => h.shoot)) continue;
      if (hs[0].region !== 'main') { const key = hs[0].region + '|' + hs[0].context; if (seenShared.has(key)) continue; seenShared.add(key); }
      targets.push(+b);
    }
    await m.call('evaluate_script', {pageId: 1, function: `()=>{window.__targets=${JSON.stringify(targets)};delete window.__shots;return 1}`});
    const slug = (rec.path === '/' ? 'home' : rec.path.slice(1).replace(/[^a-z0-9]+/gi, '_')).slice(0, 80) + (attempt > 1 ? '_r' : '');
    for (let s = 0; s < MAXSHOTS && targets.length; s++) {
      const st = parseEval(await m.call('evaluate_script', {pageId: 1, function: SHOOT}));
      if (st.done) break;
      await sleep(250);
      const file = `shots/${slug}_${String(st.shot).padStart(2, '0')}.jpeg`;
      await m.call('take_screenshot', {pageId: 1, format: 'jpeg', quality: 62, filePath: path.join(OUT, file)});
      rec.shots.push({file, blocks: st.covered});
      for (const h of rec.hits) if (st.covered.includes(h.block)) h.shot = file;
    }
  } catch (e) {
    rec.error = String(e.message || e).slice(0, 300);
    if (/timeout|closed|Target/.test(rec.error)) { try { m.kill(); } catch {} m = await startMcp(); await setup(); }
  }
  fs.appendFileSync(RES, JSON.stringify(rec) + '\n');
  return rec;
}

const retry = [];
for (let qi = 0; qi < queue.length && qi < MAX; qi++) {
  const url = queue[qi];
  if (done.has(url)) continue;
  const rec = await auditPage(url, 1);
  if (broken(rec) || rec.error) retry.push(url);
  console.log(qi + 1, '/', queue.length, url, rec.error ? 'ERR ' + rec.error : `hits=${rec.hits.length} shots=${rec.shots.length}${broken(rec) ? ' (did not load, will retry)' : ''}`);
}
// the site can intermittently serve a not-found body; one more try settles real vs. flaky
for (const url of retry) {
  await sleep(2000);
  const rec = await auditPage(url, 2);
  console.log('retry', url, rec.error ? 'ERR ' + rec.error : `title="${rec.title}" hits=${rec.hits.length}${broken(rec) ? ' (still not loading)' : ''}`);
}
m.kill();
console.log('FINISHED');
process.exit(0);
