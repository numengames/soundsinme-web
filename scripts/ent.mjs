import { chromium } from '/var/home/uruk/arkhitektonian-lab/.local/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();
for(const [n,u,sel] of [['ref','https://www.soundsinme.com/blog','article'],['new','http://127.0.0.1:4321/blog','article.entry']]){
 const pg=await b.newPage({viewport:{width:+(process.argv[2]||1440),height:900}}); await pg.goto(u,{waitUntil:'load'}); await pg.waitForTimeout(1500);
 console.log(n,JSON.stringify(await pg.evaluate((s)=>[...document.querySelectorAll(s)].map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.y+scrollY),Math.round(r.height)]}),sel)));}
await b.close();
