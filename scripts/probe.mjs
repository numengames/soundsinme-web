// node scripts/probe.mjs <url> "<js expression returning string>" w1 w2 ...   → evaluates expr at each width
import { chromium } from '/var/home/uruk/arkhitektonian-lab/.local/lib/node_modules/playwright/index.mjs';
const [,, url, expr, ...ws] = process.argv; const b = await chromium.launch();
try { for (const w of ws) { const ctx = await b.newContext({ viewport: { width: +w, height: 900 } }); const pg = await ctx.newPage(); await pg.goto(url, { waitUntil: 'load' }); await pg.waitForTimeout(800); console.log(w, await pg.evaluate(expr)); await ctx.close(); } } finally { await b.close(); }
