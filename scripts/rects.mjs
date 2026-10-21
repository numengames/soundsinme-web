import { chromium } from '/var/home/uruk/arkhitektonian-lab/.local/lib/node_modules/playwright/index.mjs';
const [,, base, path, w, y0, y1]=process.argv; const b=await chromium.launch(); const pg=await (await b.newContext({viewport:{width:+w,height:900}})).newPage();
await pg.goto((base=='ref'?'https://www.soundsinme.com':'http://127.0.0.1:4321')+path,{waitUntil:'networkidle'});
console.log((await pg.evaluate(([a,z])=>[...document.querySelectorAll('main section,main h1,main h2,main h3,main p,main a,main img,main .yt,main span,main hr,main div')].map(e=>{const r=e.getBoundingClientRect();return [e.tagName.toLowerCase()+'.'+(e.className||'').toString().slice(0,14),Math.round(r.x),Math.round(r.y+scrollY),Math.round(r.width),Math.round(r.height)]}).filter(x=>x[4]>2&&x[2]>=a&&x[2]<=z).map(x=>x.join(' ')).join('\n'),[+y0,+y1])));
await b.close();
