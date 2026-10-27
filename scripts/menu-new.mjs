import { chromium } from '/var/home/uruk/arkhitektonian-lab/.local/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();
for(const [n,u] of [['ref','https://www.soundsinme.com/'],['new','http://127.0.0.1:4321/']]){
 const pg=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); await pg.goto(u,{waitUntil:'load'}); await pg.waitForTimeout(1500);
 for(const x of await pg.$$('header button, .burger')){ if(await x.isVisible()){await x.click();break;} }
 await pg.waitForTimeout(1200); await pg.screenshot({path:`shots/menu-${n}.png`});}
await b.close();
