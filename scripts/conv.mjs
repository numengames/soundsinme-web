import { chromium } from '/var/home/uruk/arkhitektonian-lab/.local/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();
for(const [n,u,sel] of [['ref','https://www.soundsinme.com/conversation','main iframe, main h1, main h2, main h3, main p'],['new','http://127.0.0.1:4321/conversation','main .yt, main h1, main h2, main h3, main p']]){
 const pg=await b.newPage({viewport:{width:1440,height:900}}); await pg.goto(u,{waitUntil:'load'}); await pg.waitForTimeout(2500);
 console.log(n,(await pg.evaluate((s)=>[...document.querySelectorAll(s)].map(e=>{const r=e.getBoundingClientRect();return e.tagName[0]+(e.innerText||'').slice(0,12).replace(/\n/g,' ')+':'+Math.round(r.y+scrollY)+'/'+Math.round(r.height)}).join(' | '),sel)));}
await b.close();
