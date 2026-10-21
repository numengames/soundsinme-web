// Static server mimicking Cloudflare Pages (clean URLs, ranges, immutable asset cache) for local testing
import http from 'http'; import zlib from 'zlib'; import fs from 'fs'; import path from 'path';
const root = path.resolve('dist');
const T = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.xml': 'application/xml', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm', '.txt': 'text/plain' };
http.createServer((q, r) => {
  let u = decodeURIComponent(q.url.split('?')[0]); if (u.endsWith('/') && u !== '/') u = u.slice(0, -1);
  const c = [u === '/' ? '/index.html' : u, u + '.html', u + '/index.html'].map((x) => path.join(root, x)).find((f) => f.startsWith(root) && fs.existsSync(f) && fs.statSync(f).isFile());
  if (!c) { r.writeHead(404, { 'content-type': 'text/html' }); return r.end(fs.existsSync(root + '/404.html') ? fs.readFileSync(root + '/404.html') : '404'); }
  const st = fs.statSync(c), ext = path.extname(c);
  const h = { 'content-type': T[ext] || 'application/octet-stream', 'accept-ranges': 'bytes', 'cache-control': /\/(img|fonts|media)\//.test(c) ? 'public,max-age=31536000,immutable' : 'no-cache' };
  const rg = q.headers.range;
  if (rg) { const [a, b] = rg.replace('bytes=', '').split('-'); const s = +a, e = b ? +b : st.size - 1; r.writeHead(206, { ...h, 'content-range': `bytes ${s}-${e}/${st.size}`, 'content-length': e - s + 1 }); return fs.createReadStream(c, { start: s, end: e }).pipe(r); }
  if (/\.(html|css|js|json|xml|svg|txt)$/.test(ext) && /br/.test(q.headers['accept-encoding'] || '')) { r.writeHead(200, { ...h, 'content-encoding': 'br', vary: 'Accept-Encoding' }); return fs.createReadStream(c).pipe(zlib.createBrotliCompress()).pipe(r); }
  r.writeHead(200, { ...h, 'content-length': st.size }); fs.createReadStream(c).pipe(r);
}).listen(4321, '127.0.0.1');
