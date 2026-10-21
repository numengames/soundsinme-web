// usage: node scripts/compare.mjs /path 390 768 1024 1440  → screenshots + page height + pixel diff % + element-rect dump for both
import { chromium } from '/var/home/uruk/arkhitektonian-lab/.local/lib/node_modules/playwright/index.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
const [,, path, ...ws]=process.argv; fs.mkdirSync('shots',{recursive:true});
const b=await chromium.launch();
const sel='header,header img,main section,main h1,main h2,main h3,main h4,main p,main a,main img,main video,main iframe,footer,footer a';
for (const w of ws.map(Number)) {
  const res={};
  for (const [tag,base] of [['ref','https://www.soundsinme.com'],['new','http://127.0.0.1:4321']]) {
    const pg=await (await b.newContext({viewport:{width:w,height:900}})).newPage();
    await pg.goto(base+path,{waitUntil:'load'});
    await pg.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,100));}window.scrollTo(0,0)}); await pg.waitForTimeout(2500);
    const f=`shots/cmp-${path.replace(/\W/g,'_')}-${w}-${tag}.png`; await pg.screenshot({path:f,fullPage:true});
    const rects=await pg.evaluate(()=>[...document.querySelectorAll('header,main section,main h1,main h2,main h3,main h4,main p,main a,main img,main video,main iframe,main .yt,footer,footer a')].map(e=>{const r=e.getBoundingClientRect();const t=(e.innerText||e.alt||'').trim().replace(/\s+/g,' ').slice(0,18);return [e.tagName.toLowerCase(),t,Math.round(r.x),Math.round(r.y+scrollY),Math.round(r.width),Math.round(r.height)]}).filter(a=>a[4]>2&&a[5]>2));
    res[tag]={f,h:await pg.evaluate(()=>document.documentElement.scrollHeight),rects};
  }
  console.log(w,'ref h',res.ref.h,'new h',res.new.h);
  const used=new Set();
  for(const a of res.ref.rects){ if(!a[1]&&a[0]!='img'&&a[0]!='section')continue; if(a[0]=='section'&&!a[1])continue;
    let j=res.new.rects.findIndex((n,i)=>!used.has(i)&&(a[1]?n[1]==a[1]:n[0]==a[0])&&(a[1]||true)); if(j<0){ if(a[0]!='img'&&a[0]!='section')console.log('  MISSING',a.join('|')); continue;} used.add(j); const n=res.new.rects[j];
    const d=[n[2]-a[2],n[3]-a[3],n[4]-a[4],n[5]-a[5]]; if(d.some(v=>Math.abs(v)>2)) console.log('  ',a[0],a[1].padEnd(18),'ref',a.slice(2).join(','),'new',n.slice(2).join(','),'Δ',d.join(','));}
}
await b.close();
