import manifest from '../images.json';
type Entry = { id: string; w: number; h: number; widths: number[]; alpha: boolean };
const entries = Object.entries(manifest as Record<string, Entry>);
/** Find an optimized image by any fragment of its original URL (uuid or filename). */
export function find(key: string): Entry {
  const hit = entries.find(([u]) => u.includes(key));
  if (!hit) throw new Error(`Image not in manifest: ${key}`);
  return hit[1];
}
export const src = (e: Entry, w: number, ext: 'avif' | 'webp') => `/img/${e.id}-${w}.${ext}`;
export function srcset(e: Entry, ext: 'avif' | 'webp') {
  return e.widths.map((w) => `${src(e, w, ext)} ${w}w`).join(', ');
}
export const largest = (e: Entry) => e.widths[e.widths.length - 1];
