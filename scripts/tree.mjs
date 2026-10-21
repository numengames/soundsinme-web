// usage: node scripts/tree.mjs <ref|new> /path width y0 y1  → every visible element in [y0,y1] with rect, margin, padding, line-height
import { chromium } from '/var/home/uruk/arkhitektonian-lab/.local/lib/node_modules/playwright/index.mjs';
const [,, base, path, w, y0, y1] = process.argv;
const b = await chromium.launch();
try {
  const pg = await (await b.newContext({ viewport: { width: +w, height: 900 } })).newPage();
  await pg.goto((base == 'ref' ? 'https://www.soundsinme.com' : 'http://127.0.0.1:4321') + path, { waitUntil: 'load' });
  await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } window.scrollTo(0, 0); });
  await pg.waitForTimeout(1500);
  console.log(await pg.evaluate(([a, z]) => {
    const depth = e => { let d = 0; while (e.parentElement) { e = e.parentElement; d++; } return d; };
    const px = (c, p) => ['Top', 'Right', 'Bottom', 'Left'].map(s => parseFloat(c[p + s]) || 0).map(Math.round).join('/');
    return [...document.querySelectorAll('body *')].map(e => {
      const r = e.getBoundingClientRect(); const c = getComputedStyle(e);
      if (r.width < 2 || r.height < 2 || c.display == 'none') return null;
      const y = r.y + scrollY; if (y + r.height < a || y > z) return null;
      const own = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').slice(0, 20);
      const m = px(c, 'margin'), p = px(c, 'padding');
      return ' '.repeat(Math.max(0, depth(e) - 3)) + `${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0].slice(0, 22)} [${r.x.toFixed(1)},${y.toFixed(1)},${r.width.toFixed(1)},${r.height.toFixed(1)}]` +
        (m != '0/0/0/0' ? ` m${m}` : '') + (p != '0/0/0/0' ? ` p${p}` : '') + (own ? ` fs${parseFloat(c.fontSize).toFixed(1)} lh${c.lineHeight} "${own}"` : '') + (c.borderTopWidth != '0px' || c.borderBottomWidth != '0px' ? ` b${c.borderTopWidth}/${c.borderBottomWidth}` : '');
    }).filter(Boolean).join('\n');
  }, [+y0, +y1]));
} finally { await b.close(); }
