(function () {
  var SCRIPT = document.currentScript;
  if (!SCRIPT) return;

  var storeUrl = (SCRIPT.getAttribute('data-store') || '').replace(/\/$/, '');
  if (!storeUrl) {
    console.error('[AssetLane] embed.js requires data-store="https://your-store.com" on the script tag.');
    return;
  }

  var apiBase = storeUrl + '/api';
  var defaultProduct = SCRIPT.getAttribute('data-product') || '';
  var analyticsEnabled = SCRIPT.getAttribute('data-analytics') !== 'false';

  function createAnalyticsBus() {
    var listeners = {};

    return {
      on: function (eventName, callback) {
        if (!listeners[eventName]) {
          listeners[eventName] = [];
        }
        listeners[eventName].push(callback);
      },
      emit: function (eventName, detail) {
        if (!analyticsEnabled) {
          return;
        }

        if (typeof window.CustomEvent === 'function') {
          window.dispatchEvent(new CustomEvent(eventName, { detail: detail }));
        }

        (listeners[eventName] || []).forEach(function (callback) {
          try {
            callback(detail);
          } catch (error) {
            console.error('[AssetLane] analytics listener failed', error);
          }
        });
      },
    };
  }

  if (!window.AssetLaneEmbed) {
    window.AssetLaneEmbed = createAnalyticsBus();
  }

  var analytics = window.AssetLaneEmbed;

  function formatMoney(cents, currency) {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'BDT' }).format(cents / 100);
    } catch (_error) {
      return (cents / 100).toFixed(2) + ' ' + (currency || 'BDT');
    }
  }

  function injectStyles() {
    if (document.getElementById('assetlane-embed-styles')) return;
    var style = document.createElement('style');
    style.id = 'assetlane-embed-styles';
    style.textContent =
      '.assetlane-embed{font-family:Inter,system-ui,sans-serif;border:1px solid #dbe3ec;border-radius:14px;padding:18px;max-width:420px;background:#fff;color:#142033;box-shadow:0 12px 30px rgba(15,23,42,.08)}' +
      '.assetlane-embed h3{margin:0 0 6px;font-size:18px;line-height:1.25}' +
      '.assetlane-embed p{margin:0 0 14px;color:#5b6b7f;font-size:14px;line-height:1.5}' +
      '.assetlane-embed-price{font-size:22px;font-weight:700;margin-bottom:14px}' +
      '.assetlane-embed-btn{display:inline-flex;align-items:center;justify-content:center;width:100%;padding:12px 16px;border:0;border-radius:10px;background:#111827;color:#fff;font-size:14px;font-weight:600;cursor:pointer}' +
      '.assetlane-embed-btn:disabled{opacity:.65;cursor:wait}' +
      '.assetlane-embed-error{margin-top:10px;color:#b42318;font-size:13px}' +
      '.assetlane-embed-form{display:grid;gap:10px;margin-bottom:12px}' +
      '.assetlane-embed-form input{width:100%;padding:10px 12px;border:1px solid #cfd8e3;border-radius:8px;font-size:14px}';
    document.head.appendChild(style);
  }

  function renderWidget(host, product, slug) {
    injectStyles();
    host.innerHTML = '';
    host.classList.add('assetlane-embed');

    var title = document.createElement('h3');
    title.textContent = product.title;
    host.appendChild(title);

    var summary = document.createElement('p');
    summary.textContent = product.summary;
    host.appendChild(summary);

    var price = document.createElement('div');
    price.className = 'assetlane-embed-price';
    price.textContent = formatMoney(product.priceCents, product.currency);
    host.appendChild(price);

    var form = document.createElement('form');
    form.className = 'assetlane-embed-form';

    var emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.required = true;
    emailInput.placeholder = 'Email for receipt';
    form.appendChild(emailInput);

    var nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Name (optional)';
    form.appendChild(nameInput);

    host.appendChild(form);

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'assetlane-embed-btn';
    button.textContent = 'Buy now';
    host.appendChild(button);

    var error = document.createElement('div');
    error.className = 'assetlane-embed-error';
    error.hidden = true;
    host.appendChild(error);

    var successUrl = host.getAttribute('data-assetlane-success-url') || SCRIPT.getAttribute('data-success-url') || '';
    var cancelUrl = host.getAttribute('data-assetlane-cancel-url') || SCRIPT.getAttribute('data-cancel-url') || '';

    button.addEventListener('click', function () {
      if (!emailInput.value) {
        emailInput.focus();
        return;
      }

      button.disabled = true;
      error.hidden = true;

      analytics.emit('assetlane:checkout-start', {
        slug: slug,
        product: product,
        customerEmail: emailInput.value,
        customerName: nameInput.value || null,
      });

      fetch(apiBase + '/checkout/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerEmail: emailInput.value,
          customerName: nameInput.value,
          successUrl: successUrl || undefined,
          cancelUrl: cancelUrl || undefined,
        }),
      })
        .then(function (response) {
          return response.json().then(function (payload) {
            if (!response.ok) throw new Error(payload.message || 'Checkout failed');
            return payload;
          });
        })
        .then(function (payload) {
          analytics.emit('assetlane:checkout-redirect', {
            slug: slug,
            product: product,
            checkoutUrl: payload.url,
          });
          if (payload.url) window.location.href = payload.url;
        })
        .catch(function (err) {
          analytics.emit('assetlane:checkout-error', {
            slug: slug,
            product: product,
            message: err.message || 'Unable to start checkout.',
          });
          error.textContent = err.message || 'Unable to start checkout.';
          error.hidden = false;
          button.disabled = false;
        });
    });
  }

  function mountHost(host) {
    var slug = host.getAttribute('data-assetlane-product') || defaultProduct;
    if (!slug) {
      host.textContent = 'Missing data-assetlane-product';
      return;
    }

    host.textContent = 'Loading product…';

    fetch(apiBase + '/products/slug/' + encodeURIComponent(slug))
      .then(function (response) {
        return response.json().then(function (payload) {
          if (!response.ok) throw new Error(payload.message || 'Product not found');
          return payload;
        });
      })
      .then(function (product) {
        analytics.emit('assetlane:product-loaded', {
          slug: slug,
          product: product,
        });
        renderWidget(host, product, slug);
      })
      .catch(function (err) {
        analytics.emit('assetlane:product-error', {
          slug: slug,
          message: err.message || 'Unable to load product.',
        });
        host.textContent = err.message || 'Unable to load product.';
      });
  }

  var hosts = document.querySelectorAll('[data-assetlane-product]');
  if (!hosts.length && defaultProduct) {
    var autoHost = document.createElement('div');
    autoHost.setAttribute('data-assetlane-product', defaultProduct);
    SCRIPT.insertAdjacentElement('afterend', autoHost);
    hosts = [autoHost];
  }

  hosts.forEach(mountHost);
})();
