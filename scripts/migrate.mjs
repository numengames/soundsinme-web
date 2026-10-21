// Squarespace → clean semantic HTML. Reads ../soundsinme-ref, writes src/data/*.json and scripts/image-urls.json
import fs from 'fs'; import * as cheerio from 'cheerio';
const ref='../soundsinme-ref/'; fs.mkdirSync('src/data',{recursive:true});
const norm=u=>decodeURI(u.split('?')[0]).replace(/ /g,'+');
const imgs=new Set(JSON.parse(fs.existsSync('scripts/image-urls.json')?fs.readFileSync('scripts/image-urls.json','utf8'):'[]'));
const yts=new Set();
const esc=s=>s.replace(/"/g,'&quot;');
function clean($,c){ c.find('*').removeAttr('style').removeAttr('data-rte-preserve-empty').removeAttr('data-preserve-html-node').removeAttr('data-sqsp-text-block-content');
  c.find('p,h1,h2,h3,h4').each((_,p)=>{ if(!$(p).text().replace(/\u00a0/g,' ').trim() && !$(p).find('img').length){ if(p.name==='p') $(p).replaceWith('<p class="sp" aria-hidden="true"></p>'); else $(p).remove(); } });
  c.find('*').not('p.sp').removeAttr('class');
  c.find('a').each((_,a)=>{const h=$(a).attr('href')||''; if(/^https?:/.test(h)&&!/soundsinme\.com/.test(h)) $(a).attr('rel','noopener');});
  return c.html().trim(); }
export function blocks($,root){
  const parts=[];
  $(root).find('.sqs-block').each((_,b)=>{
    const $b=$(b); if($b.parents('.sqs-block').length) return;
    const cls=$b.attr('class')||'';
    if(/image-block/.test(cls)){
      const im=$b.find('img').first(); const src=im.attr('data-src')||im.attr('src'); if(!src) return;
      const cap=$b.find('figcaption').text().trim(); imgs.add(norm(src));
      parts.push({t:'img',src:norm(src),alt:im.attr('alt')||'',cap});
    } else if(/video-block/.test(cls)){
      let dh=$b.find('.sqs-video-wrapper').attr('data-html')||''; if(!/embed\//.test(dh)){ const raw=$b.html()||''; const m2=raw.match(/youtube\.com%2Fembed%2F([\w-]{11})(?:%3Fstart%3D(\d+))?/); if(m2) dh=`embed/${m2[1]}${m2[2]?'?start='+m2[2]:''}`; } const m=dh.match(/embed\/([\w-]{11})(?:\?start=(\d+))?/); const ti=(dh.match(/title="([^"]*)"/)||[])[1]||'';
      if(m){ yts.add(m[1]); parts.push({t:'yt',id:m[1],start:m[2]||'',title:ti}); }
      const cp=$b.find('.video-caption'); if(cp.length){const h=clean($,cp); if(h) parts.push({t:'html',html:h});}
    } else if(/horizontalrule/.test(cls)) parts.push({t:'hr'});
    else if(/spacer/.test(cls)) {}
    else if(/button/.test(cls)){ const a=$b.find('a').first(); if(a.attr('href')) parts.push({t:'btn',href:a.attr('href'),text:a.text().trim()}); }
    else if(/quote/.test(cls)) parts.push({t:'html',html:`<blockquote>${$b.find('blockquote').html()||$b.text()}</blockquote>`});
    else if(/html-block|sqs-block-html/.test(cls)){ const c=$b.find('.sqs-html-content').first(); if(c.length){ const h=clean($,c); if(h) parts.push({t:'html',html:h}); } }
  });
  return parts;
}
const load=f=>{const $=cheerio.load(fs.readFileSync(ref+f,'utf8')); $('style,script,svg,link,nav').remove(); return $;};
// posts
const items=JSON.parse(fs.readFileSync(ref+'posts.json','utf8'));
const posts=items.map(it=>{ const $=cheerio.load(it.body,{},false); $('style,script,svg,nav,link').remove();
  const cover=it.assetUrl?norm(it.assetUrl):null; if(cover) imgs.add(cover);
  return {title:it.title,slug:it.urlId,date:new Date(it.addedOn).toISOString(),updated:new Date(it.updatedOn).toISOString(),tags:it.tags,categories:it.categories,
    excerpt:(it.excerpt||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(),seoTitle:it.seoData?.seoTitle||'',seoDescription:(it.seoData?.seoDescription||'').slice(0,300),cover,parts:blocks($,$.root())}; });
fs.writeFileSync('src/data/posts.json',JSON.stringify(posts,null,1));
// pages
const conv=load('pg-conversation.html'); const convParts=blocks(conv,conv('main'));
fs.writeFileSync('src/data/conversation.json',JSON.stringify(convParts,null,1));
const staff=load('pg-staff.html'); fs.writeFileSync('src/data/staff.json',JSON.stringify(blocks(staff,staff('main')),null,1));
for(const n of ['sounds-in-me-1','faq-1','colabora']){const $=load('pg-'+n+'.html'); fs.writeFileSync('src/data/'+n+'.json',JSON.stringify(blocks($,$('main')),null,1));}
for(const f of fs.readdirSync(ref).filter(f=>f.startsWith('pg-'))) for(const m of fs.readFileSync(ref+f,'utf8').matchAll(/https:\/\/images\.squarespace-cdn\.com\/content\/v1\/[^"'\s)&;<]+/g)) imgs.add(norm(m[0]));
for(const id of yts) imgs.add(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
fs.writeFileSync('scripts/image-urls.json',JSON.stringify([...imgs],null,1));
console.log('posts',posts.length,'conv parts',convParts.length,'yt',yts.size,'images',imgs.size);
