/* Maison Velluto — front-end condiviso: mercato, testi, Algolia, SAP OCC, carrello, Adobe Analytics */
(function () {
  'use strict';

  var SHOP = '/inspect-lab/shop';
  var COOKIE_PATH = '/inspect-lab/';
  var ALGOLIA = { appId: 'VLDEMO01', apiKey: '3f9c1e0b7a6d4c2e9b8a5f1d0c7e6a42', host: SHOP + '/algolia' };
  var OCC_BASE = SHOP + '/occ/v2';
  var ADOBE = { rsid: 'vlprod-eu', server: SHOP };
  var MARKETS = {
    IT: { locale: 'it-IT', lang: 'it', currency: 'EUR', index: 'vl_prod_it_IT', site: 'vl-it' },
    FR: { locale: 'fr-FR', lang: 'fr', currency: 'EUR', index: 'vl_prod_fr_FR', site: 'vl-fr' },
    GB: { locale: 'en-GB', lang: 'en', currency: 'GBP', index: 'vl_prod_en_GB', site: 'vl-gb' }
  };

  // ---- cookie ------------------------------------------------------------
  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }
  function setCookie(name, value, days) {
    document.cookie = name + '=' + encodeURIComponent(value) + '; path=' + COOKIE_PATH +
      '; max-age=' + days * 86400 + '; SameSite=Lax';
  }

  // Primo accesso: paese, test A/B, sessione, wishlist di esempio
  if (!getCookie('vl_country')) setCookie('vl_country', 'IT', 30);
  if (!getCookie('vl_ab')) setCookie('vl_ab', 'plp_grid:B', 30);
  if (!getCookie('vl_sid')) setCookie('vl_sid', 's_' + Math.random().toString(36).slice(2, 10), 1);
  try {
    if (localStorage.getItem('vl_wishlist') === null) localStorage.setItem('vl_wishlist', JSON.stringify(['VL2188']));
  } catch (e) { /* storage non disponibile */ }

  var country = String(getCookie('vl_country') || 'IT').toUpperCase();
  if (!MARKETS[country]) country = 'IT';
  var market = MARKETS[country];
  document.documentElement.lang = market.lang;

  var abVariant = (getCookie('vl_ab') || '').split(':')[1] || 'A';
  document.documentElement.classList.add('ab-grid-' + abVariant);

  // ---- chiamate ------------------------------------------------------------
  function getJson(url, headers) {
    return fetch(url, { headers: Object.assign({ 'Accept': 'application/json' }, headers) }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + url);
      return res.json();
    });
  }
  function query(params) {
    return Object.keys(params).map(function (k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');
  }

  // Algolia: liste prodotto e ricerca (un indice per mercato, una replica per ogni ordinamento)
  function algoliaSearch(indexName, params) {
    return getJson(ALGOLIA.host + '/1/indexes/' + indexName + '?' + query(params), {
      'x-algolia-application-id': ALGOLIA.appId,
      'x-algolia-api-key': ALGOLIA.apiKey,
      'x-algolia-agent': 'Algolia for JavaScript (4.24.0); Browser'
    });
  }

  // SAP Commerce Cloud: API OCC per il baseSite del mercato
  function occGet(path, params) {
    var all = Object.assign({ lang: market.lang, curr: market.currency }, params);
    return getJson(OCC_BASE + '/' + market.site + path + '?' + query(all));
  }

  // Testi dell'interfaccia (asset del front)
  var dictionary = {};
  function t(key, vars) {
    var value = Object.prototype.hasOwnProperty.call(dictionary, key) ? dictionary[key] : key;
    if (vars) Object.keys(vars).forEach(function (k) { value = value.replace('{' + k + '}', vars[k]); });
    return value;
  }
  function loadTranslations() {
    return getJson(SHOP + '/assets/i18n/' + market.locale + '.json').then(function (data) {
      dictionary = data;
      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        el.textContent = t(el.getAttribute('data-i18n'));
      });
      return data;
    });
  }

  function formatPrice(value) {
    return new Intl.NumberFormat(market.locale, {
      style: 'currency', currency: market.currency, maximumFractionDigits: 0
    }).format(value);
  }

  // ---- carrello (salvato nel Local Storage) -------------------------------
  function getCart() {
    try { return JSON.parse(localStorage.getItem('vl_cart')) || []; } catch (e) { return []; }
  }
  function addToCart(line) {
    var cart = getCart();
    var existing = cart.filter(function (l) { return l.sku === line.sku; })[0];
    if (existing) existing.qty += 1; else cart.push(Object.assign({ qty: 1 }, line));
    localStorage.setItem('vl_cart', JSON.stringify(cart));
    renderCartCount();
  }
  function renderCartCount() {
    var count = getCart().reduce(function (n, l) { return n + l.qty; }, 0);
    document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = count; });
  }

  // ---- Adobe Analytics ----------------------------------------------------
  // 1) Adobe Client Data Layer: il sito "racconta" cosa succede
  window.adobeDataLayer = window.adobeDataLayer || [];
  // 2) Beacon verso Adobe (/b/ss/<report suite>/...): è quello che finisce davvero nei report
  function sendBeacon(vars) {
    var params = Object.assign({
      AQB: 1, ndh: 1,
      pageName: vars.pageName,
      g: location.href,
      ch: 'calzature',
      v1: country,
      v2: market.lang,
      c5: getCookie('vl_ab')
    }, vars, { AQE: 1 });
    new Image().src = ADOBE.server + '/b/ss/' + ADOBE.rsid + '/1/JS-2.27.0/s4417?' + query(params);
  }
  function track(event, payload, beacon) {
    window.adobeDataLayer.push(Object.assign({ event: event }, payload));
    if (beacon) sendBeacon(beacon);
  }

  var state = window.__VL_STATE__ || { page: {} };
  window.adobeDataLayer.push({
    event: 'page-view',
    page: { type: state.page.type, country: country, language: market.lang, abTest: getCookie('vl_ab') }
  });

  // ---- UI ----------------------------------------------------------------
  function toast(message) {
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(function () { el.classList.add('is-out'); }, 1800);
    setTimeout(function () { el.remove(); }, 2300);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-market]').forEach(function (el) {
      el.textContent = country + ' · ' + market.currency;
    });
    renderCartCount();
  });

  window.VL = {
    country: country,
    market: market,
    algolia: algoliaSearch,
    occ: occGet,
    t: t,
    loadTranslations: loadTranslations,
    formatPrice: formatPrice,
    cart: { get: getCart, add: addToCart },
    track: track,
    toast: toast
  };
})();
