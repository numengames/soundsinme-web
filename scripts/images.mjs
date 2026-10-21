// Downloads originals, outputs AVIF+WebP at several widths into public/img, writes src/images.json manifest.
import fs from 'fs'; import crypto from 'crypto'; import sharp from 'sharp';
const urls=JSON.parse(fs.readFileSync('scripts/image-urls.json','utf8'));
const mpath='src/images.json'; const man=fs.existsSync(mpath)?JSON.parse(fs.readFileSync(mpath,'utf8')):{};
const W=[320,480,640,800,1024,1280,1600,1920];
const id=u=>crypto.createHash('sha1').update(u).digest('hex').slice(0,10);
async function one(u){
  if(man[u]) return;
  const h=id(u), f=`assets-src/${h}`;
  try{
    if(!fs.existsSync(f)){ const r=await fetch(u.includes('squarespace')?u+'?format=original':u); if(!r.ok) throw new Error(r.status); fs.writeFileSync(f,Buffer.from(await r.arrayBuffer())); }
    const img=sharp(f,{animated:false}); const m=await img.metadata();
    const ws=W.filter(w=>w<m.width); if(!ws.length||ws.at(-1)<m.width) ws.push(Math.min(m.width,1920));
    const widths=[...new Set(ws.map(w=>Math.min(w,m.width)))];
    const alpha=m.hasAlpha;
    for(const w of widths){
      const base=sharp(f).rotate().resize({width:w,withoutEnlargement:true});
      await base.clone().avif({quality:55,effort:4}).toFile(`public/img/${h}-${w}.avif`);
      await base.clone().webp({quality:78}).toFile(`public/img/${h}-${w}.webp`);
    }
    const o=m.orientation&&m.orientation>=5; const W0=o?m.height:m.width, H0=o?m.width:m.height;
    man[u]={id:h,w:W0,h:H0,widths:widths,alpha};
  }catch(e){ console.log('FAIL',u.slice(-70),e.message); }
}
const q=[...urls]; let n=0;
await Promise.all(Array.from({length:4},async()=>{while(q.length){const u=q.shift(); await one(u); if(++n%20==0) console.log(n);}}));
fs.writeFileSync(mpath,JSON.stringify(man,null,1));
console.log('done',Object.keys(man).length,'/',urls.length);
