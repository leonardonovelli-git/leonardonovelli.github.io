/* Maison Velluto — front-end condiviso: mercato, traduzioni, API, carrello, analytics */
(function () {
  'use strict';

  var API_BASE = '/inspect-lab/shop/api/v1';
  var COOKIE_PATH = '/inspect-lab/';
  var MARKETS = {
    IT: { locale: 'it-IT', currency: 'EUR' },
    FR: { locale: 'fr-FR', currency: 'EUR' },
    GB: { locale: 'en-GB', currency: 'GBP' }
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
  document.documentElement.lang = market.locale.slice(0, 2);

  var abVariant = (getCookie('vl_ab') || '').split(':')[1] || 'A';
  document.documentElement.classList.add('ab-grid-' + abVariant);

  // ---- API ---------------------------------------------------------------
  function requestId() {
    return 'req-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }
  function apiGet(path, params) {
    var url = API_BASE + path + (params ? '?' + new URLSearchParams(params).toString() : '');
    return fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-Channel': 'WEB-EU',
        'X-Country': country,
        'X-Request-Id': requestId()
      }
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + url);
      return res.json();
    });
  }

  // ---- traduzioni --------------------------------------------------------
  var dictionary = {};
  function t(key, vars) {
    // Se la chiave non esiste, restituisce la chiave stessa (così si vede a schermo)
    var value = Object.prototype.hasOwnProperty.call(dictionary, key) ? dictionary[key] : key;
    if (vars) Object.keys(vars).forEach(function (k) { value = value.replace('{' + k + '}', vars[k]); });
    return value;
  }
  function loadTranslations() {
    return apiGet('/i18n/' + market.locale + '.json').then(function (data) {
      dictionary = data;
      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        el.textContent = t(el.getAttribute('data-i18n'));
      });
      return data;
    });
  }

  // ---- prezzi ------------------------------------------------------------
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

  // ---- analytics (GA4 / Tag Manager) --------------------------------------
  window.dataLayer = window.dataLayer || [];
  function track(payload) { window.dataLayer.push(payload); }

  var state = window.__VL_STATE__ || { page: {} };
  track({
    event: 'page_view',
    page_type: state.page.type,
    country: country,
    language: market.locale,
    ab_test: getCookie('vl_ab')
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
    api: apiGet,
    t: t,
    loadTranslations: loadTranslations,
    formatPrice: formatPrice,
    cart: { get: getCart, add: addToCart },
    track: track,
    toast: toast
  };
})();
