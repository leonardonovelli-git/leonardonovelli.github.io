// Genera il negozio-palestra e il coach.
//   node inspect-lab/_src/build.mjs
// La cartella _src non viene pubblicata da GitHub Pages (Jekyll ignora le cartelle "_").
//
// "Sistemi" simulati (file statici con i formati delle API vere):
//   Algolia  → shop/algolia/1/indexes/<indice>          (PLP, un indice per mercato + repliche per l'ordinamento)
//   SAP CC   → shop/occ/v2/<baseSite>/products/<codice> (PDP, API OCC)
//   Adobe    → shop/b/ss/...                            (beacon di Adobe Analytics)

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { BASE, ORIGIN, SIZES, products, markets, optionLabels, i18n } from './data.mjs';
import { shoeSvg } from './svg.mjs';
import { UNITS } from './lessons.mjs';
import { norm } from './norm.mjs';

const SRC = path.dirname(fileURLToPath(import.meta.url));
const LAB = path.resolve(SRC, '..');

function write(rel, content) {
  const file = path.join(LAB, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, typeof content === 'string' || Buffer.isBuffer(content) ? content : JSON.stringify(content, null, 2) + '\n');
}
for (const dir of ['shop/api', 'shop/algolia', 'shop/occ', 'shop/b', 'shop/media']) fs.rmSync(path.join(LAB, dir), { recursive: true, force: true });

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const it = i18n['it-IT'];
const media = (file) => `${BASE}/media/${file}`;
const pdpUrl = (p) => `${BASE}/p/${p.slug}/`;
const imgFile = (p, color) => `${p.id}-${color}.svg`;
// Etichetta Akeneo nella lingua richiesta; se manca, i sistemi a valle ricevono il codice dell'opzione
const label = (group, code, lang) => optionLabels[group][code]?.[lang] ?? code;

// ---------------------------------------------------------------- media
for (const p of products) {
  if (p.noImages) continue;
  for (const c of p.colors) write(`shop/media/${imgFile(p, c.code)}`, shoeSvg(p.shape, c.hex, `${p.name} ${label('color', c.code, 'it')}`));
}

// ---------------------------------------------------------------- Algolia
const SORTS = { '': null, _price_asc: (a, b) => a.price - b.price, _price_desc: (a, b) => b.price - a.price };
for (const [country, m] of Object.entries(markets)) {
  const indexed = products.filter((p) => !(p.notIndexed || []).includes(country));
  const hits = indexed.map((p, i) => ({
    objectID: p.id,
    name: p.name,
    url: pdpUrl(p),
    hierarchicalCategories: { lvl0: 'Donna', lvl1: 'Donna > Calzature', lvl2: `Donna > Calzature > ${p.cat2}` },
    categoryPageId: ['calzature-donna'],
    position: i + 1,
    colorCode: p.colors[0].code,
    colorName: label('color', p.colors[0].code, m.lang),
    colors: p.colors.map((c) => ({ code: c.code, name: label('color', c.code, m.lang), hex: c.hex })),
    material: { code: p.material, label: optionLabels.material[p.material][m.lang] },
    madeIn: label('country', p.madeIn ?? 'IT', m.lang),
    heelHeightMm: p.heel,
    price: { [m.currency]: p.algoliaPrice?.[country] ?? p.price[country] },
    images: p.noImages ? [] : [{ url: media(p.searchImage ?? imgFile(p, p.colors[0].code)), alt: p.alt }],
    badges: p.badges ?? [],
    isOnline: true,
    lastIndexedAt: p.indexedAt ?? '2026-10-28T03:00:05Z',
  }));
  for (const [suffix, sort] of Object.entries(SORTS)) {
    const index = m.index + suffix;
    const sorted = sort ? hits.slice().sort((a, b) => sort({ price: a.price[m.currency] }, { price: b.price[m.currency] })) : hits;
    const nbHits = 23 - (products.length - indexed.length);
    write(`shop/algolia/1/indexes/${index}`, {
      hits: sorted,
      nbHits,
      page: 0,
      nbPages: Math.ceil(nbHits / 9),
      hitsPerPage: 9,
      exhaustiveNbHits: true,
      query: '',
      params: 'query=&hitsPerPage=9&filters=categoryPageId%3Acalzature-donna',
      index,
      processingTimeMS: 2,
    });
  }
}

// ---------------------------------------------------------------- SAP Commerce Cloud (OCC)
const FEATURE = 'VLClassification/1.0/shoes.';
for (const [country, m] of Object.entries(markets)) {
  for (const p of products) {
    const sapColors = p.colors.filter((c) => !p.sapColors || p.sapColors.includes(c.code));
    const feature = (code, name, value, unit) => ({ code: FEATURE + code, name, ...(unit ? { featureUnit: unit } : {}), featureValues: [{ value: String(value) }] });
    const price = p.price[country];
    const fmt = new Intl.NumberFormat(m.locale, { style: 'currency', currency: m.currency }).format(price);
    write(`shop/occ/v2/${m.site}/products/${p.id}`, {
      code: p.id,
      name: p.name,
      url: pdpUrl(p),
      description: p.desc,
      manufacturer: 'Maison Velluto',
      purchasable: true,
      price: { currencyIso: m.currency, value: price, formattedValue: fmt, priceType: 'BUY' },
      stock: { stockLevelStatus: 'inStock' },
      categories: [{ code: 'calzature-donna', name: it['plp.title'] }],
      images: sapColors.map((c) => ({ imageType: 'PRIMARY', format: 'zoom', url: p.noImages ? null : media(imgFile(p, c.code)), altText: p.alt })),
      classifications: [{
        code: 'shoes',
        name: 'Calzature',
        features: [
          feature('material', 'Materiale', label('material', p.material, m.lang)),
          feature('heel_height', 'Altezza tacco', p.heel, { symbol: 'mm', name: 'millimetri', unitType: 'length' }),
          feature('made_in', 'Made in', label('country', p.sapMadeIn ?? p.madeIn ?? 'IT', m.lang)),
          feature('line', 'Linea', p.line),
          feature('season', 'Stagione', p.season),
          feature('care_code', 'Istruzioni di cura', p.care),
        ],
      }],
      variantOptions: sapColors.flatMap((c, ci) => SIZES.map((s, si) => {
        let level, status;
        if (p.stock && ci === 0) [level, status] = p.stock[s];
        else {
          level = (p.id.charCodeAt(4) + si * 3 + ci * 5) % 7;
          status = level === 0 ? 'outOfStock' : level === 1 ? 'lowStock' : 'inStock';
        }
        return {
          code: `${p.id}-${c.code}-${s}`,
          stock: { stockLevel: level, stockLevelStatus: status },
          variantOptionQualifiers: [
            { qualifier: 'color', value: label('color', c.code, m.lang), code: c.code, hex: c.hex },
            { qualifier: 'size', value: s },
          ],
        };
      })),
      modifiedTime: p.sapModified ?? '2026-10-21T14:02:11Z',
    });
  }
}

// ---------------------------------------------------------------- Adobe Analytics (pixel 1x1)
write('shop/b/ss/vlprod-eu/1/JS-2.27.0/s4417', Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));

// ---------------------------------------------------------------- testi del front
for (const [loc, dict] of Object.entries(i18n)) write(`shop/assets/i18n/${loc}.json`, dict);

// ---------------------------------------------------------------- pagine
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">';

function header() {
  return `<div class="promo">Spedizione gratuita sopra i 300 € · Resi entro 30 giorni</div>
<header class="site-header">
  <a class="logo" href="${BASE}/donna/calzature/">Maison <em>Velluto</em></a>
  <nav class="main-nav" aria-label="Principale">
    <a href="#" data-i18n="nav.women" class="is-active">Donna</a>
    <a href="#" data-i18n="nav.men">Uomo</a>
    <a href="#" data-i18n="nav.bags">Borse</a>
    <a href="${BASE}/donna/calzature/" data-i18n="nav.shoes">Calzature</a>
    <a href="#" data-i18n="nav.new">Novità</a>
  </nav>
  <div class="header-tools">
    <span class="market" data-market title="Paese e valuta">IT · EUR</span>
    <a class="cart" href="#" aria-label="Carrello"><span data-i18n="cart.label">Carrello</span> <span class="cart-count" data-cart-count>0</span></a>
  </div>
</header>`;
}
function footer() {
  return `<footer class="site-footer">
  <div class="logo">Maison <em>Velluto</em></div>
  <p data-i18n="footer.note">${it['footer.note']}</p>
  <p class="footer-lab"><a href="/inspect-lab/">← Torna a Inspect Lab</a></p>
</footer>`;
}
function page({ title, desc, head = '', body, scripts, bodyClass }) {
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
${head}
${FONTS}
<link rel="stylesheet" href="${BASE}/assets/shop.css">
</head>
<body class="${bodyClass}">
${body}
${scripts.map((s) => `<script src="${s}" defer></script>`).join('\n')}
<script src="/inspect-lab/coach/coach.js" defer></script>
</body>
</html>
`;
}

// PLP: renderizzata lato client (CSR) con i dati di Algolia — nel sorgente non ci sono prodotti.
const plpState = {
  page: { type: 'PLP', categoryId: 'calzature-donna', breadcrumb: ['donna', 'calzature'] },
  search: { provider: 'algolia', appId: 'VLDEMO01', hitsPerPage: 9, sort: 'newest', filters: 'categoryPageId:calzature-donna' },
  features: { quickView: false, plpGridAB: true, wishlist: true },
  env: 'production',
  build: '2026.10.3-4f1c2a9',
};
write('shop/donna/calzature/index.html', page({
  title: 'Calzature Donna | Maison Velluto',
  desc: 'Décolleté, mocassini, stivaletti e sneaker da donna Maison Velluto.',
  bodyClass: 'page-plp',
  head: `<link rel="canonical" href="${ORIGIN}${BASE}/donna/calzature/">
<script>window.__VL_STATE__ = ${JSON.stringify(plpState)};</script>`,
  scripts: [`${BASE}/assets/js/app.js`, `${BASE}/assets/js/plp.js`],
  body: `${header()}
<main class="plp">
  <nav class="breadcrumb" aria-label="Breadcrumb"><a href="#" data-i18n="nav.women">Donna</a><span>/</span><span data-i18n="nav.shoes">Calzature</span></nav>
  <div class="plp-head">
    <div>
      <h1 data-i18n="plp.title">Calzature Donna</h1>
      <p class="plp-count" data-count>&nbsp;</p>
    </div>
    <label class="plp-sort"><span data-i18n="plp.sort">Ordina per</span>
      <select data-sort>
        <option value="newest" data-i18n="sort.newest">Novità</option>
        <option value="price-asc" data-i18n="sort.price-asc">Prezzo crescente</option>
        <option value="price-desc" data-i18n="sort.price-desc">Prezzo decrescente</option>
      </select>
    </label>
  </div>
  <div class="plp-grid" data-grid aria-busy="true">
    ${'<div class="tile-skeleton"><div></div><span></span><span></span></div>'.repeat(8)}
  </div>
</main>
${footer()}`,
}));

// PDP: renderizzate lato server (SSR) con i dati di SAP — nome, descrizione, JSON-LD e "Made in" sono nel sorgente.
const countryName = { IT: 'Italy', RO: 'Romania' };
for (const p of products) {
  if (p.noImages) continue;
  const c0 = p.colors[0];
  const madeIn = p.sapMadeIn ?? p.madeIn ?? 'IT';
  const url = `${ORIGIN}${pdpUrl(p)}`;
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    sku: `${p.id}-${c0.code}`,
    mpn: p.id,
    gtin13: p.gtin,
    brand: { '@type': 'Brand', name: 'Maison Velluto' },
    color: label('color', c0.code, 'it'),
    material: label('material', p.material, 'it'),
    countryOfOrigin: madeIn,
    image: [`${ORIGIN}${media(imgFile(p, c0.code))}`],
    description: p.desc,
    url,
  };
  const state = {
    page: { type: 'PDP', pid: p.id, breadcrumb: ['donna', 'calzature', p.cat2.toLowerCase()] },
    product: { code: p.id, name: p.name, defaultColor: c0.code },
    commerce: { provider: 'sap-commerce-cloud', occBase: '/occ/v2' },
    env: 'production',
    build: '2026.10.3-4f1c2a9',
  };
  write(`shop/p/${p.slug}/index.html`, page({
    title: `${p.name} | Maison Velluto`,
    desc: p.desc,
    bodyClass: 'page-pdp',
    head: `<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="it-it" href="${url}">
<link rel="alternate" hreflang="fr-fr" href="${ORIGIN}${BASE}/fr/p/${p.slug}/">
<link rel="alternate" hreflang="en-gb" href="${ORIGIN}${BASE}/gb/p/${p.slug}/">
<link rel="alternate" hreflang="x-default" href="${url}">
<meta property="og:type" content="product">
<meta property="og:title" content="${esc(p.name)} | Maison Velluto">
<meta property="og:image" content="${ORIGIN}${media(imgFile(p, c0.code))}">
<meta property="og:url" content="${url}">
<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
</script>
<script>window.__VL_STATE__ = ${JSON.stringify(state)};</script>`,
    scripts: [`${BASE}/assets/js/app.js`, `${BASE}/assets/js/pdp.js`],
    body: `<!-- vl-render node=fe-eu-west-03 rendered=${p.id === 'VL2041' ? '2026-09-14T08:15:02Z' : '2026-10-28T22:40:05Z'} cache=HIT template=pdp-v7 -->
${header()}
<main class="pdp" data-pid="${p.id}">
  <nav class="breadcrumb" aria-label="Breadcrumb"><a href="#" data-i18n="nav.women">Donna</a><span>/</span><a href="${BASE}/donna/calzature/" data-i18n="nav.shoes">Calzature</a><span>/</span><span>${esc(p.cat2)}</span></nav>
  <div class="pdp-layout">
    <div class="pdp-gallery">
      <img src="${media(imgFile(p, c0.code))}" alt="${esc(p.alt)}" width="800" height="800" data-main-image>
    </div>
    <div class="pdp-info">
      <p class="pdp-eyebrow">${esc(p.cat2)}</p>
      <h1 class="pdp-name">${esc(p.name)}</h1>
      <p class="pdp-price" data-price>—</p>
      <div class="pdp-block">
        <p class="pdp-label"><span data-i18n="pdp.color">Colore</span>: <strong data-color-name>${esc(label('color', c0.code, 'it'))}</strong></p>
        <div class="swatches" data-swatches></div>
      </div>
      <div class="pdp-block">
        <p class="pdp-label" data-i18n="pdp.size">Taglia</p>
        <div class="sizes" data-sizes><span class="sizes-loading">…</span></div>
      </div>
      <button class="btn-add" data-add-to-cart disabled><span data-i18n="pdp.selectSize">Seleziona la taglia</span></button>
      <p class="pdp-desc">${esc(p.desc)}</p>
      <details class="pdp-details" open>
        <summary data-i18n="pdp.details">Dettagli</summary>
        <ul>
          <li data-attr="material"><span data-i18n="pdp.material">Materiale</span><span data-value>—</span></li>
          <li data-attr="heel"><span data-i18n="pdp.heel">Tacco</span><span data-value>—</span></li>
          <li data-attr="line"><span data-i18n="pdp.line">Linea</span><span data-value>—</span></li>
          <li data-attr="made_in"><span data-i18n="pdp.origin">Origine</span><span>Made in ${countryName[madeIn]}</span></li>
          <li data-attr="code"><span>Cod.</span><span>${p.id}-${c0.code}</span></li>
        </ul>
      </details>
    </div>
  </div>
  <section class="pdp-recs" data-recs hidden>
    <h2 data-i18n="pdp.recs">Ti potrebbe piacere</h2>
    <div class="recs-grid" data-recs-grid></div>
  </section>
</main>
${footer()}`,
  }));
}

// ---------------------------------------------------------------- coach
function hash(id, value) {
  return crypto.createHash('sha256').update(`ilab|${id}|${value}`).digest('hex').slice(0, 24);
}
function prepare(units) {
  return units.map((u) => ({
    ...u,
    lessons: u.lessons.map((l) => ({
      ...l,
      steps: l.steps.map((s, i) => {
        const id = `${l.id}.${i + 1}`;
        const out = { ...s, id };
        if (s.answers) {
          out.h = [...new Set(s.answers.map((a) => hash(id, norm(a, s.mode))))];
          delete out.answers;
        }
        if (s.check) out.check = s.check.toString();
        return out;
      }),
    })),
  }));
}
const blob = Buffer.from(JSON.stringify(prepare(UNITS)), 'utf8').toString('base64');
const coach = fs.readFileSync(path.join(SRC, 'coach.src.js'), 'utf8')
  .replace('/*__NORM__*/', norm.toString())
  .replace('__DATA__', blob);
write('coach/coach.js', coach);

const steps = UNITS.flatMap((u) => u.lessons.flatMap((l) => l.steps)).length;
console.log(`ok · ${UNITS.length} unità · ${UNITS.reduce((n, u) => n + u.lessons.length, 0)} lezioni · ${steps} step`);
