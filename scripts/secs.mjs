// usage: node scripts/secs.mjs /path 390 1440  → section tops/heights, ref vs new, side by side
import { chromium } from '/var/home/uruk/arkhitektonian-lab/.local/lib/node_modules/playwright/index.mjs';
const [,, path, ...ws] = process.argv;
const b = await chromium.launch();
const sel = { ref: 'main section.page-section, main .blog-item-wrapper, main .blog-basic-grid, main .blog-alternating-side-by-side, main .products-flex-container, main .ProductItem, footer.sections', new: 'main > *, footer' };
try {
  for (const w of ws.map(Number)) {
    const res = {};
    for (const [tag, base] of [['ref', 'https://www.soundsinme.com'], ['new', 'http://127.0.0.1:4321']]) {
      const ctx = await b.newContext({ viewport: { width: w, height: 900 } }); const pg = await ctx.newPage();
      await pg.goto(base + path, { waitUntil: 'load' });
      await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); });
      await pg.waitForTimeout(1200);
      res[tag] = await pg.evaluate((s) => [...document.querySelectorAll(s)].filter(e => !e.parentElement.closest('section.page-section')).map(e => { const r = e.getBoundingClientRect(); return [e.tagName.toLowerCase() + '.' + String(e.className).trim().split(/\s+/).slice(0, 2).join('.').slice(0, 24), +(r.y + scrollY).toFixed(1), +r.height.toFixed(1)]; }), sel[tag]);
      await ctx.close();
    }
    console.log(`== ${path} @${w}`);
    for (let i = 0; i < Math.max(res.ref.length, res.new.length); i++) {
      const a = res.ref[i] || ['-', 0, 0], n = res.new[i] || ['-', 0, 0];
      console.log(`  ${a[0].padEnd(26)} ${String(a[1]).padStart(8)} ${String(a[2]).padStart(7)}   ${n[0].padEnd(26)} ${String(n[1]).padStart(8)} ${String(n[2]).padStart(7)}   Δtop ${(n[1] - a[1]).toFixed(1).padStart(6)}  Δh ${(n[2] - a[2]).toFixed(1)}`);
    }
  }
} finally { await b.close(); }
