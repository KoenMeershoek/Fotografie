// Fires one silent pageview beacon per page load. Uses an <img> request
// instead of fetch() so it never needs CORS permission to *send* data
// (we don't read the response) and never fails loudly if the backend
// is briefly unreachable.
(function () {
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;
  if (!window.ANALYTICS_WORKER_URL || window.ANALYTICS_WORKER_URL.indexOf('REPLACE-ME') !== -1) return;

  var beacon = new Image();
  beacon.src = window.ANALYTICS_WORKER_URL + '/collect?path=' + encodeURIComponent(location.pathname) +
    '&ref=' + encodeURIComponent(document.referrer || '');
})();
