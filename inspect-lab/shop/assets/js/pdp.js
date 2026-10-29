/* Maison Velluto — PDP: la pagina arriva dal server, qui si chiede a SAP (OCC) prezzo, varianti e dettagli */
(function () {
  'use strict';

  var state = window.__VL_STATE__;
  var code = state.page.pid;
  var params = new URLSearchParams(location.search);
  var product = null;
  var colors = [];
  var color = null;
  var selected = null;

  var $ = function (sel) { return document.querySelector(sel); };
  var addBtn = $('[data-add-to-cart]');

  function qualifier(variant, name) {
    return variant.variantOptionQualifiers.filter(function (q) { return q.qualifier === name; })[0];
  }

  // Le caratteristiche arrivano dalle classificazioni SAP: si cercano per la parte finale del codice
  function feature(name) {
    var all = [];
    product.classifications.forEach(function (c) { all = all.concat(c.features); });
    return all.filter(function (f) { return f.code.split('.').pop() === name; })[0];
  }
  function featureValue(name) {
    var f = feature(name);
    return f ? f.featureValues[0].value : '';
  }

  function setDetail(attr, value) {
    var el = $('[data-attr="' + attr + '"] [data-value]');
    if (el) el.textContent = value;
  }

  function renderDetails() {
    setDetail('material', featureValue('material'));
    // SAP manda i millimetri (featureUnit "mm"): qui si convertono in centimetri
    setDetail('heel', (Number(featureValue('heel_height')) / 10).toLocaleString(VL.market.locale) + ' cm');
    setDetail('line', featureValue('line'));
    $('[data-price]').textContent = VL.formatPrice(product.price.value);
    $('[data-price]').setAttribute('data-loaded', 'true');
  }

  function renderSwatches() {
    var seen = {};
    colors = [];
    product.variantOptions.forEach(function (v) {
      var c = qualifier(v, 'color');
      if (!seen[c.code]) { seen[c.code] = true; colors.push(c); }
    });
    var box = $('[data-swatches]');
    box.innerHTML = colors.map(function (c) {
      return '<button type="button" class="swatch" data-color="' + c.code + '" style="--swatch:' + c.hex + '" aria-label="' + c.value + '"></button>';
    }).join('');
    box.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-color]');
      if (btn) selectColor(btn.getAttribute('data-color'));
    });
  }

  function selectColor(colorCode) {
    var c = colors.filter(function (x) { return x.code === colorCode; })[0] || colors[0];
    color = c.code;
    var image = product.images.filter(function (img) { return img.url && img.url.indexOf(color) > -1; })[0];
    if (image) $('[data-main-image]').src = image.url;
    $('[data-color-name]').textContent = c.value;
    document.querySelectorAll('.swatch').forEach(function (s) {
      s.classList.toggle('is-active', s.getAttribute('data-color') === color);
    });
    selected = null;
    renderSizes();
  }

  function isPurchasable(variant) {
    return variant.stock.stockLevelStatus !== 'outOfStock';
  }

  function renderSizes() {
    var box = $('[data-sizes]');
    var variants = product.variantOptions.filter(function (v) { return qualifier(v, 'color').code === color; });
    box.innerHTML = variants.map(function (v) {
      var ok = isPurchasable(v);
      var size = qualifier(v, 'size').value;
      return '<button type="button" class="size' + (ok ? '' : ' is-soldout') + '" data-sku="' + v.code + '" data-size="' + size + '"' +
        (ok ? '' : ' disabled title="' + VL.t('pdp.soldOut') + '"') + '>' + size +
        (v.stock.stockLevelStatus === 'lowStock' ? '<small>' + VL.t('pdp.lastPiece') + '</small>' : '') + '</button>';
    }).join('');
    updateButton();
  }

  function updateButton() {
    addBtn.disabled = !selected;
    addBtn.textContent = selected ? VL.t('pdp.addToCart') : VL.t('pdp.selectSize');
  }

  $('[data-sizes]').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-sku]');
    if (!btn || btn.disabled) return;
    selected = { sku: btn.getAttribute('data-sku'), size: btn.getAttribute('data-size') };
    document.querySelectorAll('.size').forEach(function (s) { s.classList.toggle('is-selected', s === btn); });
    updateButton();
  });

  addBtn.addEventListener('click', function () {
    if (!selected) return;
    VL.cart.add({ sku: selected.sku, pid: code, color: color, size: selected.size });
    VL.track('add-to-cart', {
      product: { productID: code, sku: selected.sku, color: color, size: selected.size, price: product.price.value, quantity: 1 }
    }, {
      pageName: 'vl:' + VL.market.lang + ':pdp:' + code,
      events: 'scAdd',
      products: ';' + code + ';1;' + product.price.value + ';;eVar12=' + color + '|eVar13=' + selected.size
    });
    VL.toast(VL.t('pdp.added'));
  });

  function loadReferences() {
    return VL.occ('/products/' + code + '/references', { referenceType: 'SIMILAR', fields: 'DEFAULT' }).then(function (res) {
      $('[data-recs]').hidden = false;
      $('[data-recs-grid]').innerHTML = res.references.map(function (r) { return '<a href="' + r.target.url + '">' + r.target.name + '</a>'; }).join('');
    }).catch(function () { /* nessun consiglio: la sezione resta nascosta */ });
  }

  Promise.all([VL.occ('/products/' + code, { fields: 'FULL' }), VL.loadTranslations()]).then(function (results) {
    product = results[0];
    renderDetails();
    renderSwatches();
    selectColor(params.get('color') || state.product.defaultColor);
    VL.track('product-view', {
      product: { productID: code, name: product.name, color: color, price: product.price.value, currency: product.price.currencyIso }
    }, {
      pageName: 'vl:' + VL.market.lang + ':pdp:' + code,
      events: 'prodView',
      products: ';' + code + ';;;;eVar12=' + color
    });
    loadReferences();
  });
})();
