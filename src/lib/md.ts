// tiny markdown-ish fallback for post bodies that came through as plain markdown
export function md(src: string, title = ''): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const inl = (s: string) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|\W)_(.+?)_(?=\W|$)/g, '$1<em>$2</em>');
  return src.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean).map((b) => {
    const h = b.match(/^(#{1,3})\s+(.*)$/);
    if (h) return h[2].trim() === title ? '' : `<h2>${inl(h[2])}</h2>`;
    return `<p>${inl(b).replace(/\n/g, '<br>')}</p>`;
  }).join('');
}
