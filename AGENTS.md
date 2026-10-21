# Sounds In Me — guía para IAs y personas
Sitio estático Astro (https://www.soundsinme.com). Sin plantillas ni CMS: el contenido vive en `src/data/*.json` y `src/pages/*.astro`.
- Build: `npm ci && npm run build` → `dist/`. Preview local: `node scripts/serve.mjs` (puerto 4321).
- Imágenes: originales en `assets-src/`; `node scripts/images.mjs` genera AVIF/WebP en `public/img/` y `src/images.json`. Usar siempre `<Pic k="…">`.
- Estilos: `src/styles/tokens.css` (tipografía fluida) y `global.css`. Colores: amarillo #FFFC52, negro, blanco.
- Antes de cada PR: `npm run build` sin errores y Lighthouse >= 95 en móvil (`tools/lh.sh` si existe).
- Despliegue: Cloudflare Pages (rama `main` = producción, el resto = previews). Cabeceras en `public/_headers`.
- Reglas: no añadir JS de terceros, no cargar fuentes externas, `alt` en toda imagen, un solo `h1` por página.
