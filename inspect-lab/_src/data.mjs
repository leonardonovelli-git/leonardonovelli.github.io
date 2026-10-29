// Catalogo finto di "Maison Velluto": la sorgente unica da cui build.mjs genera
// pagine SSR, risposte API (JSON) e immagini. I "bug" sono voluti: sono il
// materiale delle lezioni (vedi lessons.mjs).

export const BASE = '/inspect-lab/shop';
export const ORIGIN = 'https://leonardonovelli.design';

export const SIZES = ['35', '36', '37', '38', '39', '40', '41'];

export const products = [
  {
    id: 'VL2041', name: 'Décolleté Aurora', slug: 'decollete-aurora-vl2041', shape: 'pump',
    cat2: 'Décolleté', material: 'CA01', heel: 85, gtin: '8056789204110',
    colors: [{ code: 'N001', hex: '#1f1c1b' }, { code: 'B014', hex: '#d8b4a4' }],
    price: { IT: 950, FR: 990, GB: 850 },
    madeIn: 'RO', ssrMadeIn: 'IT', // BUG: PIM aggiornato, HTML in cache vecchio
    line: 'Archivio 1987', season: 'FW26', care: 'CR-07',
    alt: 'Décolleté Aurora in pelle di vitello nera, vista laterale',
    desc: 'Décolleté a punta in pelle di vitello liscia, tacco a spillo da 8,5 cm. Suola in cuoio cucita a mano, sottopiede imbottito.',
    // BUG: taglia 40 con qty 0 ma status IN_STOCK
    stock: { 35: [4, 'IN_STOCK'], 36: [3, 'IN_STOCK'], 37: [0, 'OUT_OF_STOCK'], 38: [5, 'IN_STOCK'], 39: [1, 'LOW_STOCK'], 40: [0, 'IN_STOCK'], 41: [2, 'IN_STOCK'] },
  },
  {
    id: 'VL2188', name: 'Mocassino Brera', slug: 'mocassino-brera-vl2188', shape: 'loafer',
    cat2: 'Mocassini', material: 'CA01', heel: 20, gtin: '8056789218810',
    colors: [{ code: 'R022', hex: '#6a1d29' }],
    price: { IT: 790, FR: 820, GB: 700 },
    badges: [{ type: 'limited', label: 'Edizione limitata' }], // BUG: nascosto dal CSS
    line: 'Città', season: 'FW26', care: 'CR-07',
    alt: 'Mocassino Brera bordeaux con mascherina, vista laterale',
    desc: 'Mocassino con mascherina in pelle di vitello spazzolata. Fondo in cuoio con tacco in gomma antiscivolo.',
  },
  {
    id: 'VL2210', name: 'Stivaletto Navigli', slug: 'stivaletto-navigli-vl2210', shape: 'boot',
    cat2: 'Stivaletti', material: 'SUEDE02', heel: 55, gtin: '8056789221018',
    colors: [{ code: 'M031', hex: '#4b3326' }],
    price: { IT: 1150, FR: 1190, GB: 1020 },
    searchPrice: 1090, // BUG: indice di ricerca con prezzo vecchio (finisce nel dataLayer)
    line: 'Archivio 1987', season: 'FW26', care: 'CR-11',
    alt: 'Stivaletto Navigli in camoscio testa di moro, vista laterale',
    desc: 'Stivaletto alla caviglia in camoscio, zip laterale nascosta e tacco a blocco da 5,5 cm.',
  },
  {
    id: 'VL2275', name: 'Sneaker Lumen', slug: 'sneaker-lumen-vl2275', shape: 'sneaker',
    cat2: 'Sneaker', material: 'CA02', heel: 35, gtin: '8056789227515',
    colors: [{ code: 'W001', hex: '#f2efe9' }],
    price: { IT: 690, FR: 720, GB: 610 },
    alt: '', // BUG: alt vuoto (manca la descrizione immagine a monte)
    line: 'Lumen', season: 'SS26', care: 'CR-02',
    desc: 'Sneaker in nappa morbida con suola in gomma sagomata e lacci tono su tono.',
  },
  {
    id: 'VL2302', name: 'Slingback Riva', slug: 'slingback-riva-vl2302', shape: 'slingback',
    cat2: 'Décolleté', material: 'CA03', heel: 65, gtin: '8056789230218',
    colors: [{ code: 'W010', hex: '#efe4cf' }],
    price: { IT: 880, FR: 910, GB: 780 },
    searchImage: 'VL2302-W01O.svg', // BUG: O (lettera) al posto di 0 (zero)
    line: 'Riviera', season: 'SS26', care: 'CR-04',
    alt: 'Slingback Riva in vernice avorio, vista laterale',
    desc: 'Slingback in vernice con cinturino regolabile e tacco a rocchetto da 6,5 cm.',
  },
  {
    id: 'VL2319', name: 'Ballerina Duomo', slug: 'ballerina-duomo-vl2319', shape: 'ballerina',
    cat2: 'Ballerine', material: 'CA02', heel: 5, gtin: '8056789231918',
    colors: [{ code: 'N001', hex: '#1f1c1b' }],
    price: { IT: 620, FR: 650, GB: 550 },
    line: 'Città', season: 'FW26', care: 'CR-02',
    alt: 'Ballerina Duomo in nappa nera con fiocco, vista laterale',
    desc: 'Ballerina in nappa con fiocco in gros-grain e suola flessibile.',
  },
  {
    id: 'VL3307', name: 'Sandalo Capri', slug: 'sandalo-capri-vl3307', shape: 'sandal',
    cat2: 'Sandali', material: 'CA01', heel: 30, gtin: '8056789330710',
    colors: [{ code: 'O007', hex: '#c69a5c' }],
    price: { IT: 680, FR: 710, GB: 600 },
    noImages: true, // BUG: nessuna immagine → il front lo scarta
    line: 'Riviera', season: 'SS27', care: 'CR-07',
    alt: 'Sandalo Capri in cuoio',
    desc: 'Sandalo a fasce in cuoio naturale.',
  },
  {
    id: 'VL2350', name: 'Stivale Ticino', slug: 'stivale-ticino-vl2350', shape: 'tallboot',
    cat2: 'Stivali', material: 'CA01', heel: 40, gtin: '8056789235018',
    colors: [{ code: 'N001', hex: '#1f1c1b' }],
    price: { IT: 1450, FR: 1500, GB: 1290 },
    line: 'Archivio 1987', season: 'FW26', care: 'CR-07',
    alt: 'Stivale Ticino in pelle nera al ginocchio, vista laterale',
    desc: 'Stivale al ginocchio in pelle di vitello con gambale morbido e tacco a blocco da 4 cm.',
  },
  {
    id: 'VL2366', name: 'Mule Sempione', slug: 'mule-sempione-vl2366', shape: 'mule',
    cat2: 'Mules', material: 'SUEDE02', heel: 45, gtin: '8056789236619',
    colors: [{ code: 'G020', hex: '#8c9d86' }],
    price: { IT: 720, FR: 750, GB: 640 },
    badges: [{ type: 'new', label: 'Novità' }],
    line: 'Riviera', season: 'FW26', care: 'CR-11',
    alt: 'Mule Sempione in camoscio salvia, vista laterale',
    desc: 'Mule a punta in camoscio con tacco a blocchetto da 4,5 cm.',
  },
];

export const markets = {
  IT: { locale: 'it-IT', currency: 'EUR' },
  FR: { locale: 'fr-FR', currency: 'EUR' },
  GB: { locale: 'en-GB', currency: 'GBP' },
};

// Traduzioni. BUG voluto: in it-IT manca material.SUEDE02.
export const i18n = {
  'it-IT': {
    'nav.women': 'Donna', 'nav.men': 'Uomo', 'nav.bags': 'Borse', 'nav.shoes': 'Calzature', 'nav.new': 'Novità',
    'plp.title': 'Calzature Donna', 'plp.results': '{n} prodotti', 'plp.sort': 'Ordina per',
    'sort.newest': 'Novità', 'sort.price-asc': 'Prezzo crescente', 'sort.price-desc': 'Prezzo decrescente',
    'price.unavailable': 'Prezzo non disponibile',
    'pdp.color': 'Colore', 'pdp.size': 'Taglia', 'pdp.selectSize': 'Seleziona la taglia', 'pdp.addToCart': 'Aggiungi al carrello',
    'pdp.added': 'Aggiunto al carrello', 'pdp.details': 'Dettagli', 'pdp.material': 'Materiale', 'pdp.heel': 'Tacco',
    'pdp.line': 'Linea', 'pdp.origin': 'Origine', 'pdp.soldOut': 'Esaurita', 'pdp.lastPiece': 'Ultimo pezzo', 'pdp.recs': 'Ti potrebbe piacere',
    'cart.label': 'Carrello', 'footer.note': 'Negozio dimostrativo per esercitarsi con i DevTools. Nessun prodotto è in vendita.',
    'material.CA01': 'Pelle di vitello', 'material.CA02': 'Nappa', 'material.CA03': 'Vernice',
    'color.N001': 'Nero', 'color.B014': 'Cipria', 'color.R022': 'Bordeaux', 'color.M031': 'Testa di moro',
    'color.W001': 'Bianco', 'color.W010': 'Avorio', 'color.O007': 'Cuoio', 'color.G020': 'Salvia',
  },
  'fr-FR': {
    'nav.women': 'Femme', 'nav.men': 'Homme', 'nav.bags': 'Sacs', 'nav.shoes': 'Chaussures', 'nav.new': 'Nouveautés',
    'plp.title': 'Chaussures Femme', 'plp.results': '{n} produits', 'plp.sort': 'Trier par',
    'sort.newest': 'Nouveautés', 'sort.price-asc': 'Prix croissant', 'sort.price-desc': 'Prix décroissant',
    'price.unavailable': 'Prix indisponible',
    'pdp.color': 'Couleur', 'pdp.size': 'Taille', 'pdp.selectSize': 'Choisissez la taille', 'pdp.addToCart': 'Ajouter au panier',
    'pdp.added': 'Ajouté au panier', 'pdp.details': 'Détails', 'pdp.material': 'Matière', 'pdp.heel': 'Talon',
    'pdp.line': 'Ligne', 'pdp.origin': 'Origine', 'pdp.soldOut': 'Épuisée', 'pdp.lastPiece': 'Dernière pièce', 'pdp.recs': 'Vous aimerez aussi',
    'cart.label': 'Panier', 'footer.note': 'Boutique de démonstration pour s’entraîner avec les DevTools. Aucun produit n’est en vente.',
    'material.CA01': 'Cuir de veau', 'material.CA02': 'Nappa', 'material.CA03': 'Cuir verni', 'material.SUEDE02': 'Daim',
    'color.N001': 'Noir', 'color.B014': 'Poudre', 'color.R022': 'Bordeaux', 'color.M031': 'Chocolat',
    'color.W001': 'Blanc', 'color.W010': 'Ivoire', 'color.O007': 'Cognac', 'color.G020': 'Sauge',
  },
  'en-GB': {
    'nav.women': 'Women', 'nav.men': 'Men', 'nav.bags': 'Bags', 'nav.shoes': 'Shoes', 'nav.new': 'New in',
    'plp.title': "Women's Shoes", 'plp.results': '{n} products', 'plp.sort': 'Sort by',
    'sort.newest': 'Newest', 'sort.price-asc': 'Price low to high', 'sort.price-desc': 'Price high to low',
    'price.unavailable': 'Price unavailable',
    'pdp.color': 'Colour', 'pdp.size': 'Size', 'pdp.selectSize': 'Select a size', 'pdp.addToCart': 'Add to bag',
    'pdp.added': 'Added to bag', 'pdp.details': 'Details', 'pdp.material': 'Material', 'pdp.heel': 'Heel',
    'pdp.line': 'Line', 'pdp.origin': 'Origin', 'pdp.soldOut': 'Sold out', 'pdp.lastPiece': 'Last one', 'pdp.recs': 'You may also like',
    'cart.label': 'Bag', 'footer.note': 'Demo store to practise with DevTools. Nothing is for sale.',
    'material.CA01': 'Calf leather', 'material.CA02': 'Nappa', 'material.CA03': 'Patent leather', 'material.SUEDE02': 'Suede',
    'color.N001': 'Black', 'color.B014': 'Powder', 'color.R022': 'Burgundy', 'color.M031': 'Dark brown',
    'color.W001': 'White', 'color.W010': 'Ivory', 'color.O007': 'Tan', 'color.G020': 'Sage',
  },
};
