// usage: node scripts/match.mjs /path 390 1440 [tol]
// Matches leaf text blocks (by text) and images (by order) between the live site and the local build.
// Prints per-element Δx,Δy,Δw,Δh, the *incremental* Δy (drift introduced at that element) and style diffs.
import { chromium } from '/var/home/uruk/arkhitektonian-lab/.local/lib/node_modules/playwright/index.mjs';
const [,, path, ...rest] = process.argv;
const tol = rest.length > 2 && rest[rest.length - 1].startsWith('t') ? +rest.pop().slice(1) : 1;
const ws = rest.map(Number);
const b = await chromium.launch();
const grab = () => {
  const out = [];
  const r1 = v => isNaN(parseFloat(v)) ? v : (Math.round(parseFloat(v) * 2) / 2) + 'px';
  const st = (e) => { const c = getComputedStyle(e); return [r1(c.fontSize), c.fontWeight, r1(c.lineHeight), c.letterSpacing, c.color, c.fontStyle, c.textTransform == 'none' ? '' : 'uc'].join(' '); };
  const blk = (e) => { let x = e; while (x.parentElement && getComputedStyle(x).display.startsWith('inline') && !['A','BUTTON'].includes(x.tagName)) x = x.parentElement; return x; };
  const seen = new Set();
  for (const e of document.querySelectorAll('body *')) {
    const c = getComputedStyle(e);
    if (c.display === 'none' || c.visibility === 'hidden') continue;
    const r = e.getBoundingClientRect(); if (r.width < 3 || r.height < 3) continue;
    const tag = e.tagName.toLowerCase();
    if (['img', 'video', 'iframe', 'svg'].includes(tag)) { out.push({ k: tag == 'svg' ? 'svg' : 'img', t: '', r: [r.x, r.y + scrollY, r.width, r.height].map(Math.round), s: '' }); continue; }
    const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (!own) continue;
    const t = e.innerText.trim().replace(/\s+/g, ' ').toLowerCase().slice(0, 28);
    if (!t) continue;
    const B = blk(e); if (seen.has(B)) continue; seen.add(B); const R = B.getBoundingClientRect();
    out.push({ k: 'txt', tag: B.tagName.toLowerCase(), t: B.innerText.trim().replace(/\s+/g, ' ').toLowerCase().slice(0, 28), r: [R.x, R.y + scrollY, R.width, R.height].map(Math.round), s: st(e) });
  }
  return { h: document.documentElement.scrollHeight, out };
};
for (const w of ws) {
  const res = {};
  for (const [tag, base] of [['ref', 'https://www.soundsinme.com'], ['new', 'http://127.0.0.1:4321']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
    const pg = await ctx.newPage();
    await pg.goto(base + path, { waitUntil: 'load' });
    await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } window.scrollTo(0, 0); });
    await pg.waitForTimeout(1500);
    res[tag] = await pg.evaluate(grab);
    await ctx.close();
  }
  console.log(`\n== ${path} @${w}  ref h ${res.ref.h}  new h ${res.new.h}  Δ ${res.new.h - res.ref.h}`);
  const used = new Set(); let prevDy = 0; let imgi = { ref: 0 };
  const newImgs = res.new.out.map((n, i) => [n, i]).filter(([n]) => n.k === 'img');
  const refImgCount = { n: 0 };
  for (const a of res.ref.out) {
    if (a.k === 'svg') continue;
    let j = -1;
    if (a.k === 'img') { const p = newImgs[refImgCount.n++]; if (p) j = p[1]; }
    else j = res.new.out.findIndex((n, i) => !used.has(i) && n.k === 'txt' && n.t === a.t);
    if (j < 0) { console.log('  MISSING', a.k, a.tag || '', JSON.stringify(a.t), a.r.join(',')); continue; }
    used.add(j); const n = res.new.out[j];
    const d = n.r.map((v, i) => v - a.r[i]); const inc = d[1] - prevDy; prevDy = d[1];
    const sd = a.s !== n.s;
    if (d.some(v => Math.abs(v) > tol) || sd)
      console.log(`  ${a.k.padEnd(3)} ${(a.t || '').padEnd(28)} ref ${a.r.join(',').padEnd(18)} Δ ${d.join(',').padEnd(14)} inc ${inc}${sd ? `\n        ref: ${a.s}\n        new: ${n.s}` : ''}`);
  }
  const extra = res.new.out.filter((n, i) => !used.has(i) && n.k === 'txt');
  if (extra.length) console.log('  EXTRA in new:', extra.map(n => n.t).join(' | '));
}
await b.close();
