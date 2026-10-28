// Runs inside the page, once per screenshot. crawl.mjs sets window.__targets (block ids to
// capture) first. Each call scrolls the next uncaptured block near the top, boxes every
// target block that fits in the viewport in red, and returns which blocks that shot covers.
() => {
  // fixed pop-ups (push prompts, chat widgets, spin wheels) cover the copy; sticky headers eat the top of the shot
  for (const e of document.querySelectorAll('body *')) { const p = getComputedStyle(e).position; if (p === 'fixed') e.style.setProperty('display', 'none', 'important'); else if (p === 'sticky') e.style.setProperty('position', 'relative', 'important'); }
  const TOP = 10, VH = innerHeight;
  const sel = id => document.querySelector(`[data-hit-block="${id}"]`);
  if (window.__shots === undefined) window.__shots = {pending: window.__targets.slice(), n: 0};
  const st = window.__shots;
  document.querySelectorAll('[data-hl]').forEach(e => { e.style.outline = e.dataset.hl; e.removeAttribute('data-hl'); });
  while (st.pending.length) {
    const id = st.pending[0]; const el = sel(id);
    if (!el) { st.pending.shift(); continue; }
    // open collapsed FAQ answers / accordions so the word is visible in the shot
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (e.tagName === 'DETAILS') e.open = true;
      if (s.display === 'none') e.style.setProperty('display', 'block', 'important');
      if (s.visibility === 'hidden') e.style.setProperty('visibility', 'visible', 'important');
      if (s.maxHeight === '0px' || (s.overflow === 'hidden' && e.clientHeight < 4)) { e.style.setProperty('max-height', 'none', 'important'); e.style.setProperty('height', 'auto', 'important'); }
      if (s.opacity === '0') e.style.setProperty('opacity', '1', 'important');
    }
    window.scrollBy(0, el.getBoundingClientRect().top - TOP - 40);
    const covered = [];
    for (const id2 of st.pending.slice()) {
      const e2 = sel(id2); if (!e2) continue; const r = e2.getBoundingClientRect();
      if (id2 === id || (r.top >= TOP && r.bottom <= VH && r.height > 0)) { covered.push(id2); e2.dataset.hl = e2.style.outline || ''; e2.style.outline = '4px solid #ff1744'; e2.style.outlineOffset = '4px'; }
    }
    st.pending = st.pending.filter(x => !covered.includes(x));
    st.n++;
    return {done: false, covered, shot: st.n};
  }
  return {done: true};
}
