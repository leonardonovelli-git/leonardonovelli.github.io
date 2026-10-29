/* Maison Velluto — PLP: lista prodotti renderizzata lato client */
(function () {
  'use strict';

  var state = window.__VL_STATE__;
  var grid = document.querySelector('[data-grid]');
  var countEl = document.querySelector('[data-count]');
  var sortEl = document.querySelector('[data-sort]');
  var hits = [];
  var translationsReady = VL.loadTranslations();

  function isDisplayable(product) {
    // Regola di visualizzazione: niente immagini → niente card
    return product.online && product.images.length > 0;
  }

  function tileHtml(p) {
    var img = p.images[0];
    var badges = p.badges.map(function (b) {
      return '<span class="badge badge--' + b.type + '">' + b.label + '</span>';
    }).join('');
    return '' +
      '<article class="product-tile" data-pid="' + p.id + '" data-color-code="' + p.color_code + '" data-position="' + p.position + '">' +
        '<a href="' + p.url + '">' +
          '<div class="tile-media">' +
            '<img src="' + img.src + '" alt="' + img.alt + '" loading="lazy" width="400" height="400">' +
            badges +
          '</div>' +
          '<h3 class="tile-name">' + p.name + '</h3>' +
          '<p class="tile-color">' + VL.t('color.' + p.color_code) + '</p>' +
          '<p class="tile-price" data-price-for="' + p.id + '">—</p>' +
        '</a>' +
      '</article>';
  }

  function render(list) {
    grid.innerHTML = list.map(tileHtml).join('');
    grid.removeAttribute('aria-busy');
    grid.querySelectorAll('.tile-media img').forEach(function (img) {
      img.addEventListener('error', function () { img.parentNode.classList.add('is-broken'); });
    });
  }

  function loadPrices(list) {
    var ids = list.map(function (p) { return p.id; });
    return VL.api('/prices/' + VL.country + '.json', {
      country: VL.country,
      currency: VL.market.currency,
      pids: ids.join(',')
    }).then(function (res) {
      ids.forEach(function (id) {
        var el = grid.querySelector('[data-price-for="' + id + '"]');
        var price = res.prices[id];
        if (el && price) {
          el.textContent = VL.formatPrice(price.list);
          el.setAttribute('data-loaded', 'true');
        }
      });
    }).catch(function () {
      grid.querySelectorAll('.tile-price').forEach(function (el) {
        el.textContent = VL.t('price.unavailable');
        el.classList.add('is-unavailable');
      });
    });
  }

  function sortHits(list, sort) {
    var copy = list.slice();
    if (sort === 'price-asc') copy.sort(function (a, b) { return a.price.value - b.price.value; });
    if (sort === 'price-desc') copy.sort(function (a, b) { return b.price.value - a.price.value; });
    return copy;
  }

  function load(sort) {
    var search = VL.api('/search/' + state.page.categoryId + '.json', {
      page: 1,
      pageSize: state.search.pageSize,
      sort: sort
    });
    return Promise.all([search, translationsReady]).then(function (results) {
      var res = results[0];
      hits = sortHits(res.hits, sort);
      var visible = hits.filter(isDisplayable);
      render(visible);
      countEl.textContent = VL.t('plp.results', { n: res.total });

      VL.track({
        event: 'view_item_list',
        ecommerce: {
          item_list_id: state.page.categoryId,
          item_list_name: 'Calzature Donna',
          items: visible.map(function (p, i) {
            return {
              item_id: p.id,
              item_name: p.name,
              item_brand: 'Maison Velluto',
              item_category: 'Calzature',
              item_category2: p.category2,
              item_variant: p.color_code,
              price: p.price.value,
              index: i + 1
            };
          })
        }
      });
      return loadPrices(visible);
    });
  }

  load(state.search.sort);

  sortEl.addEventListener('change', function () { load(sortEl.value); });
})();
