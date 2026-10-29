/* Maison Velluto — PLP: lista prodotti da Algolia, renderizzata lato client */
(function () {
  'use strict';

  var state = window.__VL_STATE__;
  var grid = document.querySelector('[data-grid]');
  var countEl = document.querySelector('[data-count]');
  var sortEl = document.querySelector('[data-sort]');
  var translationsReady = VL.loadTranslations();

  // Ogni ordinamento ha la sua replica dell'indice Algolia
  var REPLICAS = { 'newest': '', 'price-asc': '_price_asc', 'price-desc': '_price_desc' };

  function isDisplayable(hit) {
    // Regola di visualizzazione: niente immagini → niente card
    return hit.isOnline && hit.images.length > 0;
  }

  function tileHtml(hit) {
    var img = hit.images[0];
    var badges = hit.badges.map(function (b) {
      return '<span class="badge badge--' + b.type + '">' + b.label + '</span>';
    }).join('');
    var dots = hit.colors.length > 1 ? '<span class="tile-colors">' + hit.colors.map(function (c) {
      return '<i style="background:' + c.hex + '" title="' + c.name + '" data-color="' + c.code + '"></i>';
    }).join('') + '</span>' : '';
    return '' +
      '<article class="product-tile" data-pid="' + hit.objectID + '" data-color-code="' + hit.colorCode + '" data-position="' + hit.position + '">' +
        '<a href="' + hit.url + '">' +
          '<div class="tile-media">' +
            '<img src="' + img.url + '" alt="' + img.alt + '" loading="lazy" width="400" height="400">' +
            badges +
          '</div>' +
          '<h3 class="tile-name">' + hit.name + '</h3>' +
          '<p class="tile-color">' + hit.colorName + dots + '</p>' +
          '<p class="tile-price" data-price-for="' + hit.objectID + '">' + VL.formatPrice(hit.price[VL.market.currency]) + '</p>' +
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

  function load(sort) {
    var search = VL.algolia(VL.market.index + REPLICAS[sort], {
      query: '',
      hitsPerPage: state.search.hitsPerPage,
      filters: state.search.filters
    });
    return Promise.all([search, translationsReady]).then(function (results) {
      var res = results[0];
      var visible = res.hits.filter(isDisplayable);
      render(visible);
      countEl.textContent = VL.t('plp.results', { n: res.nbHits });

      VL.track('product-list-view', {
        productList: {
          listId: state.page.categoryId,
          listName: 'Calzature Donna',
          index: res.index,
          items: visible.map(function (hit, i) {
            return { productID: hit.objectID, name: hit.name, color: hit.colorCode, price: hit.price[VL.market.currency], position: i + 1 };
          })
        }
      }, {
        pageName: 'vl:' + VL.market.lang + ':plp:' + state.page.categoryId,
        events: 'event20',
        products: visible.map(function (hit) { return ';' + hit.objectID; }).join(',')
      });
    }).catch(function () {
      grid.removeAttribute('aria-busy');
      grid.innerHTML = '<p class="plp-error">' + VL.t('plp.error') + '</p>';
    });
  }

  load(state.search.sort);
  sortEl.addEventListener('change', function () { load(sortEl.value); });
})();
