import sharp from 'sharp'; import fs from 'fs';
const man=JSON.parse(fs.readFileSync('src/images.json','utf8'));
const id=(k)=>Object.entries(man).find(([u])=>u.includes(k))[1].id;
const logo=await sharp('assets-src/'+id('4da038f5')).trim().toBuffer();
const Y={r:255,g:252,b:82,alpha:1};
for(const [n,s] of [['favicon-32',32],['apple-touch-icon',180],['icon-192',192],['icon-512',512]]){
  const inner=await sharp(logo).resize({height:Math.round(s*.78),fit:'inside'}).toBuffer();
  await sharp({create:{width:s,height:s,channels:4,background:Y}}).composite([{input:inner,gravity:'center'}]).png().toFile(`public/${n}.png`);
}
await sharp('assets-src/'+id('486d567b')).resize(1200,630,{fit:'cover',position:'centre'}).composite([{input:await sharp(logo).resize({height:190}).toBuffer(),left:60,top:60}]).jpeg({quality:82,mozjpeg:true}).toFile('public/og.jpg');
console.log('brand ok');
