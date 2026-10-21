import posts from '../data/posts.json';
export type Post = (typeof posts)[number];
export const all: Post[] = [...posts].sort((a, b) => +new Date(b.date) - +new Date(a.date));
export const slug = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const labels = (p: Post) => [...new Set([...(p.categories || []), ...(p.tags || [])])];
export const fmt = (d: string) => { const x = new Date(d); return `${x.getUTCDate()}/${x.getUTCMonth() + 1}/${String(x.getUTCFullYear()).slice(2)}`; };
export const tagMap = (() => { const m = new Map<string, { name: string; posts: Post[] }>(); for (const p of all) for (const t of labels(p)) { const k = slug(t); if (!k) continue; if (!m.has(k)) m.set(k, { name: t, posts: [] }); m.get(k)!.posts.push(p); } return m; })();
export const plain = (h: string) => h.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
export const dshort = (d: string) => { const x = new Date(d); return `${x.getUTCDate()} ${['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][x.getUTCMonth()]}`; };
