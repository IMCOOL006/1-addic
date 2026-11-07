/* 1-addic · boot.js · the last part: starts the app once the shell is in the page (BUILD-PLAN 3.1).
   Calls UI.boot() only when ui-core.js is in the build; without it the page stays the bare shell,
   quietly (no console error). Loads in Node as a no-op. Owned by lane core.
   A start failure (the CORE chat's ruling Q2) shows one short line and the urgent-help numbers from
   Content.resources when they can be read, else the emergency sentence: help stays the first thing in reach. */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;

  function numbers() {
    try {
      var local = (typeof Content !== 'undefined' && Content && Content.resources && Content.resources.in) || {};
      return [].concat(local.emergency || [], local.crisis || []).filter(function (x) { return x && x.number; });
    } catch (e) {
      return [];
    }
  }

  function line(text) {
    var p = document.createElement('p');
    p.textContent = text;
    return p;
  }

  function showFailure() {
    try {
      var main = document.getElementById('main');
      if (!main) return;
      var box = document.createElement('div');
      box.className = 'boot-failure';
      box.setAttribute('role', 'alert');
      var list = numbers();
      if (!list.length) {
        box.appendChild(line('The app did not start. If you are in danger, call your local emergency number.'));
      } else {
        box.appendChild(line('The app did not start. For urgent help, call:'));
        for (var i = 0; i < list.length; i++) {
          var a = document.createElement('a');
          a.className = 'sos-target';
          a.href = 'tel:' + String(list[i].number).replace(/[^0-9+]/g, '');
          a.textContent = (list[i].name ? list[i].name + ': ' : '') + list[i].number;
          box.appendChild(a);
        }
        box.appendChild(line('Please verify these numbers.'));
      }
      if (typeof main.replaceChildren === 'function') main.replaceChildren(box);
      else { main.textContent = ''; main.appendChild(box); }
    } catch (e) {
      /* nothing more can be shown */
    }
  }

  function later(err) {
    setTimeout(function () { throw err; }); // still reported in the console, after the help is on screen
  }

  function start() {
    var started;
    try {
      if (typeof UI === 'undefined' || !UI || typeof UI.boot !== 'function') return;
      started = UI.boot();
    } catch (err) {
      showFailure();
      later(err);
      return;
    }
    if (started && typeof started.then === 'function') {
      started.then(null, function (err) {
        showFailure();
        later(err);
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
