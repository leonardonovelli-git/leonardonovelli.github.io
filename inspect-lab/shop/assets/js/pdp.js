/* Maison Velluto — PDP: la pagina arriva dal server, qui si caricano prezzo, taglie e dettagli */
(function () {
  'use strict';

  var state = window.__VL_STATE__;
  var pid = state.page.pid;
  var params = new URLSearchParams(location.search);
  var color = params.get('color') || state.product.defaultColor;
  var product = null;
  var availability = [];
  var selectedSku = null;
  var price = null;

  var $ = function (sel) { return document.querySelector(sel); };
  var addBtn = $('[data-add-to-cart]');

  function setDetail(attr, value) {
    var el = $('[data-attr="' + attr + '"] [data-value]');
    if (el) el.textContent = value;
  }

  function renderDetails(p) {
    var a = p.attributes;
    setDetail('material', VL.t('material.' + a.material_code));
    // Il back-end manda i millimetri: qui si convertono in centimetri
    setDetail('heel', (a.heel_height_mm / 10).toLocaleString(VL.market.locale) + ' cm');
    setDetail('line', a.line);
  }

  function renderSwatches(p) {
    var box = $('[data-swatches]');
    box.innerHTML = p.colors.map(function (c) {
      return '<button type="button" class="swatch' + (c.code === color ? ' is-active' : '') + '" ' +
        'data-color="' + c.code + '" style="--swatch:' + c.hex + '" aria-label="' + VL.t(c.name_key) + '"></button>';
    }).join('');
    box.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-color]');
      if (!btn) return;
      selectColor(btn.getAttribute('data-color'));
    });
  }

  function selectColor(code) {
    color = code;
    var c = product.colors.filter(function (x) { return x.code === code; })[0];
    $('[data-main-image]').src = c.images[0];
    $('[data-color-name]').textContent = VL.t(c.name_key);
    document.querySelectorAll('.swatch').forEach(function (s) {
      s.classList.toggle('is-active', s.getAttribute('data-color') === code);
    });
    history.replaceState(null, '', '?color=' + code);
    selectedSku = null;
    renderSizes();
  }

  function isPurchasable(item) {
    return item.status !== 'OUT_OF_STOCK';
  }

  function renderSizes() {
    var box = $('[data-sizes]');
    var items = availability.filter(function (i) { return i.color_code === color; });
    box.innerHTML = items.map(function (i) {
      var ok = isPurchasable(i);
      return '<button type="button" class="size' + (ok ? '' : ' is-soldout') + '" data-sku="' + i.sku + '" data-size="' + i.size + '"' +
        (ok ? '' : ' disabled title="' + VL.t('pdp.soldOut') + '"') + '>' + i.size +
        (i.status === 'LOW_STOCK' ? '<small>' + VL.t('pdp.lastPiece') + '</small>' : '') + '</button>';
    }).join('');
    updateButton();
  }

  function updateButton() {
    addBtn.disabled = !selectedSku;
    addBtn.textContent = selectedSku ? VL.t('pdp.addToCart') : VL.t('pdp.selectSize');
  }

  $('[data-sizes]').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-sku]');
    if (!btn || btn.disabled) return;
    selectedSku = btn.getAttribute('data-sku');
    document.querySelectorAll('.size').forEach(function (s) { s.classList.toggle('is-selected', s === btn); });
    VL.track({ event: 'select_size', size: btn.getAttribute('data-size'), sku: selectedSku });
    updateButton();
  });

  addBtn.addEventListener('click', function () {
    if (!selectedSku) return;
    var size = selectedSku.split('-').pop();
    VL.cart.add({ sku: selectedSku, pid: pid, color: color, size: size });
    VL.track({
      event: 'add_to_cart',
      ecommerce: {
        currency: VL.market.currency,
        value: price,
        items: [{
          item_id: pid,
          item_name: product.name,
          item_brand: product.brand,
          item_category: 'Calzature',
          item_variant: color,
          item_size: size,
          price: price,
          quantity: 1
        }]
      }
    });
    VL.toast(VL.t('pdp.added'));
  });

  function loadPrice() {
    return VL.api('/prices/' + VL.country + '.json', { country: VL.country, currency: VL.market.currency, pids: pid })
      .then(function (res) {
        price = res.prices[pid].list;
        $('[data-price]').textContent = VL.formatPrice(price);
        $('[data-price]').setAttribute('data-loaded', 'true');
      })
      .catch(function () { $('[data-price]').textContent = VL.t('price.unavailable'); });
  }

  function loadAvailability() {
    return VL.api('/availability/' + pid + '.json', { color: color }).then(function (res) {
      availability = res.items;
      renderSizes();
    });
  }

  function loadRecommendations() {
    return VL.api('/recommendations/' + pid + '.json', { limit: 4 }).then(function (res) {
      $('[data-recs]').hidden = false;
      $('[data-recs-grid]').innerHTML = res.items.map(function (r) { return '<a href="' + r.url + '">' + r.name + '</a>'; }).join('');
    }).catch(function () { /* nessun consiglio: la sezione resta nascosta */ });
  }

  Promise.all([VL.api('/products/' + pid + '.json'), VL.loadTranslations()]).then(function (results) {
    product = results[0];
    renderDetails(product);
    renderSwatches(product);
    if (color !== state.product.defaultColor) selectColor(color);
    return Promise.all([loadPrice(), loadAvailability()]);
  }).then(function () {
    VL.track({
      event: 'view_item',
      ecommerce: {
        currency: VL.market.currency,
        value: price,
        items: [{ item_id: pid, item_name: product.name, item_variant: color, price: price }]
      }
    });
    loadRecommendations();
  });
})();
