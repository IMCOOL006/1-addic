/* 1-addic · boot.js · the last part: starts the app once the shell is in the page (BUILD-PLAN 3.1).
   Calls UI.boot() only when ui-core.js is in the build; without it the page stays the bare shell,
   quietly (no console error). Loads in Node as a no-op. Owned by lane core. */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;

  function showFailure() {
    var main = document.getElementById('main');
    if (!main) return;
    var p = document.createElement('p');
    p.className = 'boot-failure';
    p.setAttribute('role', 'alert');
    p.textContent = 'The app could not start. Please reload the page.';
    main.replaceChildren(p);
  }

  function start() {
    if (typeof UI === 'undefined' || !UI || typeof UI.boot !== 'function') return;
    var started;
    try {
      started = UI.boot();
    } catch (err) {
      showFailure();
      throw err;
    }
    if (started && typeof started.then === 'function') {
      started.then(null, function (err) {
        showFailure();
        setTimeout(function () { throw err; });
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
