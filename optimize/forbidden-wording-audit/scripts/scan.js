// Runs inside the page (via Chrome DevTools MCP evaluate_script). crawl.mjs replaces
// the rules placeholder with the rules array before sending it.
// Finds every rule match in the rendered DOM (including collapsed FAQ text), wraps it in
// a highlighted <mark>, tags its text block with data-hit-block, and returns the hits.
() => {
  const path = location.pathname.replace(/\/$/, '') || '/';
  const RULES = (__RULES_JSON__)
    .filter(r => !r.onlyPaths || r.onlyPaths.includes(path))
    .map(r => ({...r, re: new RegExp(r.pattern, 'gi'), ex: (r.exemptContext || []).map(p => new RegExp(p, 'i'))}));
  const exempt = (r, txt, idx, m) => {
    if (!r.ex.length) return false;
    const win = txt.slice(Math.max(0, idx - 40), idx + m.length + 5);
    return r.ex.some(e => e.test(win));
  };
  const isBlock = el => { const d = getComputedStyle(el).display; return !/^inline/.test(d) && d !== 'contents'; };
  const blockOf = el => { while (el && el !== document.body && !isBlock(el)) el = el.parentElement; return el || document.body; };
  const visible = el => { for (let e = el; e && e !== document.documentElement; e = e.parentElement) { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || (s.maxHeight === '0px' && s.overflow !== 'visible') || s.opacity === '0') return false; } return true; };
  // header/footer guess; report.py only treats it as site-wide when the text repeats on 3+ pages
  const region = el => {
    if (el.closest('footer,[class*="footer" i],[id*="footer" i]')) return 'footer';
    if (el.closest('header,nav,[class*="header" i],[id*="header" i]')) return 'header';
    return 'main';
  };
  const headings = [...document.querySelectorAll('h1,h2,h3,h4')];
  const nearestHeading = el => {
    let best = null;
    for (const h of headings) { if (h === el || h.contains(el)) return {tag: h.tagName, text: h.innerText.trim()}; if (h.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) best = h; }
    return best ? {tag: best.tagName, text: best.textContent.trim().replace(/\s+/g, ' ')} : null;
  };
  const scanText = txt => {
    const found = [];
    for (const r of RULES) { r.re.lastIndex = 0; let m; while ((m = r.re.exec(txt))) { if (!exempt(r, txt, m.index, m[0])) found.push({i: m.index, len: m[0].length, r, s: m[0]}); } }
    // overlapping matches: keep the earlier/longer one ("licensed gambling site" beats "gambling")
    found.sort((a, b) => a.i - b.i || b.len - a.len);
    for (let k = found.length - 1; k > 0; k--) { const p = found[k - 1], q = found[k]; if (q.i < p.i + p.len) found.splice(k, 1); }
    return found;
  };

  const head = [];
  const title = document.title || '';
  const desc = document.querySelector('meta[name="description"]')?.content || '';
  for (const [field, txt] of [['<title>', title], ['meta description', desc]])
    for (const f of scanText(txt)) head.push({field, rule: f.r.id, label: f.r.label, match: f.s, text: txt});

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {acceptNode: n => n.parentElement.closest('script,style,noscript,template,svg') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT});
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  const hits = []; const blocks = new Map(); let bid = 0;
  for (const node of nodes) {
    const txt = node.nodeValue;
    const found = scanText(txt);
    if (!found.length) continue;
    const parent = node.parentElement; const blk = blockOf(parent);
    if (!blocks.has(blk)) blocks.set(blk, ++bid);
    const b = blocks.get(blk);
    const blkText = blk.textContent.replace(/\s+/g, ' ').trim();
    const vis = visible(parent);
    const h = nearestHeading(blk);
    let cur = node; let last = txt.length;
    for (const f of found.slice().reverse()) {
      if (f.i + f.len > last) continue;
      cur.splitText(f.i + f.len); const mid = cur.splitText(f.i);
      const mk = document.createElement('mark'); mk.textContent = mid.nodeValue; mid.replaceWith(mk);
      mk.style.cssText = f.r.screenshot ? 'background:#ffeb3b;color:#000;outline:2px solid #e00;padding:0 2px;font-weight:700' : 'background:transparent;color:inherit';
      last = f.i;
      hits.push({rule: f.r.id, label: f.r.label, match: f.s, shoot: !!f.r.screenshot, block: b, visible: vis, region: region(parent),
                 inHeading: !!parent.closest('h1,h2,h3,h4,h5,h6'), headingTag: h?.tag || '', heading: h?.text?.slice(0, 160) || '', context: blkText.slice(0, 600)});
    }
    blk.dataset.hitBlock = b;
  }
  const links = [...new Set([...document.querySelectorAll('a[href]')].map(a => a.href.split('#')[0]).filter(u => u.startsWith(location.origin)))];
  const words = (document.body.innerText || '').split(/\s+/).filter(Boolean).length;
  return {url: location.href, path, title, desc, h1: document.querySelector('h1')?.innerText.trim() || '', words, head, hits, links};
}
