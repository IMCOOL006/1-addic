// Lane core's Node tests (node:test, no dependencies). Real modules are loaded by path; every stand-in (a fake
// Store, Engine, localStorage or speech engine) is defined inside this file and removed after its test.
// U-03: the UI core in Node (no DOM). U-04 adds the encrypted store's tests below.
import { describe, test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const UI = require('../src/ui-core.js');
const Content = require('../src/content-core.js');
const UI_PATH = require.resolve('../src/ui-core.js');
// A copy of ui-core that has not booted yet (boot runs once per copy).
function freshUi() {
  delete require.cache[UI_PATH];
  return require(UI_PATH);
}

const STAND_INS = ['Store', 'Engine', 'Actions', 'Content', 'location', 'history', 'document', 'localStorage', 'window',
  'SpeechSynthesisUtterance'];
function clearStandIns() {
  for (const k of STAND_INS) delete globalThis[k];
}

describe('ui-core (U-03)', () => {
  afterEach(clearStandIns);

  test('loads in Node with no DOM and exposes the contract names', () => {
    const names = ['h', 'svg', 'icon', 'toast', 'sheet', 'confirm', 'form', 'card', 'tile', 'chips', 'ring', 'meter',
      'empty', 'go', 'route', 'render', 'ctx', 'applyTheme', 'applyDiscreet', 'night', 'speak', 'stopSpeaking', 'printDoc', 'download', 'boot'];
    for (const n of names) assert.equal(typeof UI[n], 'function', 'UI.' + n);
    assert.equal(typeof UI.pages, 'object');
    assert.equal(UI.toast('hello'), null, 'no #toasts in Node: nothing to do, no throw');
    assert.doesNotThrow(() => UI.render());
  });

  test('UI.route parses path, parts and query from the hash', () => {
    globalThis.location = { hash: '#/exercise/e-reasons?mode=tutorial&from=l1&note=two+words%21' };
    assert.deepEqual(UI.route(), {
      path: '/exercise/e-reasons', parts: ['exercise', 'e-reasons'],
      query: { mode: 'tutorial', from: 'l1', note: 'two words!' },
    });
    globalThis.location = { hash: '#/sos?drill=1' };
    assert.deepEqual(UI.route(), { path: '/sos', parts: ['sos'], query: { drill: '1' } });
    globalThis.location = { hash: '' };
    assert.deepEqual(UI.route(), { path: '/', parts: [], query: {} });
    delete globalThis.location;
    assert.deepEqual(UI.route(), { path: '/', parts: [], query: {} }, 'no location (Node): the empty route');
    assert.deepEqual(UI.parse('#/workbook/50%ZZ'), { path: '/workbook/50%ZZ', parts: ['workbook', '50%ZZ'], query: {} },
      'a broken escape is kept as written, never thrown');
  });

  test('UI.ctx gives safe defaults when Store, Engine and Actions are absent', () => {
    const c = UI.ctx();
    assert.equal(c.view.get('profile', 'me'), null);
    assert.deepEqual(c.view.list('events'), []);
    assert.equal(c.view.count('events'), 0);
    assert.equal(c.E, null);
    assert.equal(c.A, null);
    assert.deepEqual(c.profile, {});
    assert.deepEqual(c.settings, {});
    assert.equal(c.calm, false);
    assert.ok(c.term && typeof c.term.days === 'string');
    assert.ok(c.features instanceof Set);
    assert.ok(c.now instanceof Date);
    assert.deepEqual(c.route, { path: '/', parts: [], query: {} });
  });

  test('UI.ctx reads profile "me" and settings "app" through Store.view, and survives a Store that throws', () => {
    globalThis.Content = Content;
    globalThis.Store = {
      view: {
        get: (s, id) => (s === 'settings' && id === 'app' ? { key: 'app', calm: true }
          : s === 'profile' && id === 'me' ? { key: 'me', term: 'clean' } : null),
        list: () => [], count: () => 0,
      },
    };
    const c = UI.ctx();
    assert.equal(c.calm, true);
    assert.equal(c.profile.term, 'clean');
    assert.equal(c.term.word, 'clean', 'the Content term of the profile when Engine is absent');
    assert.deepEqual([...c.features].sort(), [...Content.reveal.always].sort());
    globalThis.Store = { view: { get() { throw new Error('locked'); }, list: () => [], count: () => 0 } };
    assert.deepEqual(UI.ctx().settings, {});
  });

  test('the saved label says plainly where the data is', () => {
    assert.equal(UI.savedText(null), 'Not saved — export before closing', 'no Store at all');
    assert.equal(UI.savedText({ persistence: 'memory' }), 'Not saved — export before closing');
    assert.equal(UI.savedText({ persistence: 'localstorage', lastSavedAt: null }), 'Saved (fallback)');
    assert.equal(UI.savedText({ persistence: 'indexeddb', lastSavedAt: null }), 'Saved on this device');
    assert.match(UI.savedText({ persistence: 'indexeddb', lastSavedAt: '2026-11-07T07:40:00.000Z' }), /^Saved on this device · \S/);
    assert.equal(UI.savedText({ persistence: 'indexeddb' }, false), 'Loading', 'before Store.load resolves');
  });

  test('night rule: 20:00 to 06:00 without Engine; Engine.isNight wins when present', () => {
    const at = (hr, min) => new Date(2026, 10, 7, hr, min);
    assert.equal(UI.night(at(19, 59)), false);
    assert.equal(UI.night(at(20, 0)), true);
    assert.equal(UI.night(at(5, 59)), true);
    assert.equal(UI.night(at(6, 0)), false);
    globalThis.Engine = { isNight: () => false };
    assert.equal(UI.night(at(23, 0)), false);
    globalThis.Engine = { isNight() { throw new Error('bad'); } };
    assert.equal(UI.night(at(23, 0)), true, 'a failing Engine falls back to the hour rule');
  });

  test('applyTheme stores the choice under 1-addic:theme, clears it for system, and survives blocked storage', () => {
    const box = new Map();
    globalThis.localStorage = {
      getItem: (k) => (box.has(k) ? box.get(k) : null), setItem: (k, v) => box.set(k, String(v)), removeItem: (k) => box.delete(k),
    };
    assert.equal(UI.applyTheme('dark'), 'dark');
    assert.equal(box.get('1-addic:theme'), 'dark');
    assert.equal(UI.applyTheme('light'), 'light');
    assert.equal(box.get('1-addic:theme'), 'light');
    assert.equal(UI.applyTheme('system'), 'system');
    assert.equal(box.has('1-addic:theme'), false);
    UI.applyTheme('dark');
    assert.equal(UI.applyTheme('purple'), 'system', 'an unknown theme is system, never stored');
    assert.equal(box.has('1-addic:theme'), false);
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('SecurityError'); } });
    assert.equal(UI.applyTheme('light'), 'light', 'blocked storage: the theme still applies, nothing throws');
  });

  test('speak() reads aloud with a voice on the device only, and refuses otherwise', () => {
    assert.equal(UI.speak('Breathe out slowly.'), false, 'no speechSynthesis: false');
    const spoken = [];
    let voices = [{ name: 'Online voice', lang: 'en-US', localService: false }];
    let cancels = 0;
    globalThis.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
    globalThis.window = { speechSynthesis: { getVoices: () => voices, speak: (u) => spoken.push(u), cancel: () => { cancels += 1; } } };
    assert.equal(UI.speak('Breathe out slowly.'), false, 'only a network voice: refused, so the text never leaves the device');
    assert.equal(spoken.length, 0);
    voices = [{ name: 'Online voice', lang: 'en-US', localService: false }, { name: 'Device voice', lang: 'en-IN', localService: true }];
    assert.equal(UI.speak('   '), false, 'nothing to say');
    assert.equal(UI.speak('Breathe out slowly.'), true);
    assert.equal(spoken.length, 1);
    assert.equal(spoken[0].text, 'Breathe out slowly.');
    assert.equal(spoken[0].voice.name, 'Device voice');
    const before = cancels;
    UI.stopSpeaking();
    assert.equal(cancels, before + 1);
  });
});

// The smallest DOM that ui-core's render path touches. A stand-in of this file only (never offline/tests/helpers/).
function fakeDom() {
  const ids = {};
  class Txt {
    constructor(t) { this.data = String(t); this.parentNode = null; }
    get nodeType() { return 3; }
    get textContent() { return this.data; }
  }
  class El {
    constructor(tag) {
      this.tagName = String(tag).toUpperCase(); this.attrs = {}; this.kids = []; this.dataset = {}; this.parentNode = null;
      this.style = { setProperty() {} }; this.hidden = false; this.own = ''; this.on = {};
      const cls = new Set();
      this.classList = {
        toggle: (c, f) => { if (f === undefined ? !cls.has(c) : f) cls.add(c); else cls.delete(c); },
        contains: (c) => cls.has(c), add: (c) => cls.add(c), remove: (c) => cls.delete(c),
      };
    }
    get nodeType() { return 1; }
    setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'hidden') this.hidden = true; if (k === 'id') this.id = String(v); }
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null; }
    removeAttribute(k) { delete this.attrs[k]; }
    appendChild(c) { c.parentNode = this; this.kids.push(c); return c; }
    removeChild(c) { this.kids = this.kids.filter((x) => x !== c); return c; }
    insertBefore(c) { c.parentNode = this; this.kids.unshift(c); return c; }
    replaceChildren(...cs) { this.kids = []; this.own = ''; for (const c of cs) this.appendChild(typeof c === 'string' ? new Txt(c) : c); }
    get children() { return this.kids.filter((k) => k.nodeType === 1); }
    get firstChild() { return this.kids[0] || null; }
    get textContent() { return [this.own].concat(this.kids.map((k) => k.textContent)).join(' '); }
    set textContent(v) { this.own = String(v); this.kids = []; }
    addEventListener(t, f) { (this.on[t] = this.on[t] || []).push(f); }
    removeEventListener() {}
    querySelectorAll() { return []; }
    querySelector() { return null; }
    focus() { doc.activeElement = this; }
    contains(x) { for (let n = x; n; n = n.parentNode) if (n === this) return true; return false; }
    matches() { return false; }
    all() { return [this].concat(...this.children.map((k) => k.all())); }
  }
  const doc = {
    title: '', activeElement: null, events: [],
    documentElement: new El('html'), body: new El('body'),
    createElement: (t) => new El(t), createElementNS: (n, t) => new El(t), createTextNode: (t) => new Txt(t),
    getElementById: (id) => ids[id] || null,
    dispatchEvent(e) { this.events.push(e.type); return true; },
    contains: () => true,
  };
  for (const [id, tag] of [['main', 'main'], ['sos-btn', 'a'], ['nav', 'nav'], ['saved-label', 'span'], ['app-name', 'span'],
    ['coach', 'div'], ['toasts', 'div'], ['dialog', 'dialog'], ['settings-btn', 'a'], ['theme-btn', 'button'], ['print-root', 'div']]) {
    const e = new El(tag); e.id = id; ids[id] = e;
  }
  return doc;
}

describe('ui-core render and the lock gate (U-03, stand-in DOM)', () => {
  const added = ['today', 'sos', 'track', 'workbook'];
  let errors;
  const realError = console.error;
  afterEach(() => {
    clearStandIns();
    for (const k of added) delete UI.pages[k];
    console.error = realError;
  });
  const at = (hash) => {
    globalThis.location = { hash };
    globalThis.history = { state: null, replaceState(s, t, url) { globalThis.location.hash = url; } };
  };
  const page = (text) => () => { const p = globalThis.document.createElement('p'); p.textContent = text; return p; };
  const main = () => globalThis.document.getElementById('main');
  const hrefs = () => main().all().map((e) => e.getAttribute('href')).filter(Boolean);
  const lockedStore = (unlockWith) => {
    const s = {
      locked: true, tried: [],
      view: { get: () => null, list: () => [], count: () => 0 },
      status: () => ({ persistence: 'memory', lastSavedAt: null, hasLock: true, locked: s.locked }),
      lock: { unlock: async (pin) => { s.tried.push(pin); if (pin === unlockWith) { s.locked = false; return true; } return false; } },
    };
    return s;
  };
  const setup = () => {
    globalThis.document = fakeDom();
    globalThis.Content = Content;
    errors = [];
    console.error = (...a) => errors.push(a.join(' '));
  };
  // The dialog as a browser runs it: close() shuts it at once, but its 'close' event waits in a queue until flush(),
  // as the HTML rule says (the event is a queued task, never fired inside close()). Escape fires 'cancel' first.
  const dialogStandIn = () => {
    const dlg = globalThis.document.getElementById('dialog');
    const queued = [];
    const fire = (type) => {
      const ev = { type, target: dlg, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
      for (const f of [].concat(dlg.on[type] || [])) f(ev);
      return ev;
    };
    Object.assign(dlg, {
      open: false,
      showModal() { dlg.open = true; },
      close() { if (!dlg.open) return; dlg.open = false; queued.push('close'); },
      removeEventListener(t, f) { dlg.on[t] = (dlg.on[t] || []).filter((x) => x !== f); },
      escape() { if (!fire('cancel').defaultPrevented) dlg.close(); },
      flush() { while (queued.length) fire(queued.shift()); },
    });
    return dlg;
  };
  const button = (root, label) => root.all().find((e) => e.tagName === 'BUTTON' && e.textContent.trim() === label);

  test('locked: no page with the person’s data is drawn; the lock screen offers urgent help without the PIN', async () => {
    setup();
    globalThis.Store = lockedStore('2468');
    UI.pages.today = page('PRIVATE today');
    UI.pages.workbook = page('PRIVATE reasons');
    for (const hash of ['#/today', '#/workbook/reasons', '#/settings/data']) {
      at(hash);
      await UI.render();
      assert.equal(location.hash, '#/lock', hash + ' goes to the lock screen');
      assert.ok(!main().textContent.includes('PRIVATE'), 'no private page drawn for ' + hash);
    }
    assert.match(main().textContent, /Locked/);
    assert.ok(hrefs().includes('#/sos/urgent') && hrefs().includes('#/sos/craving'), 'urgent help and Ride the wave, no PIN needed');
    assert.equal(document.getElementById('nav').hidden, true, 'the tabs are hidden while locked');
    assert.equal(document.getElementById('settings-btn').hidden, true);
    assert.equal(document.getElementById('sos-btn').hidden, false, 'the SOS button stays on the lock screen');
  });

  test('locked: a wrong PIN is refused and changes nothing; the right one opens Today', async () => {
    setup();
    const S = lockedStore('2468');
    globalThis.Store = S;
    at('#/lock');
    await UI.render();
    const all = () => main().all();
    const form = all().find((e) => e.tagName === 'FORM');
    const pin = all().find((e) => e.id === 'lock-pin');
    const msg = all().find((e) => e.id === 'lock-msg');
    assert.ok(form && pin && msg, 'the fallback lock form is drawn');
    pin.value = '1111';
    await form.on.submit[0]({ preventDefault() {} });
    assert.deepEqual(S.tried, ['1111']);
    assert.equal(S.locked, true);
    assert.equal(location.hash, '#/lock', 'a wrong PIN stays on the lock screen');
    assert.equal(msg.hidden, false);
    assert.match(msg.textContent, /did not match/);
    assert.equal(pin.value, '', 'the typed PIN is cleared');
    await form.on.submit[0]({ preventDefault() {} });
    assert.deepEqual(S.tried, ['1111'], 'an empty PIN is never sent');
    pin.value = '2468';
    await form.on.submit[0]({ preventDefault() {} });
    assert.equal(S.locked, false);
    assert.equal(location.hash, '#/today');
    assert.match(main().textContent, /Today is coming together/);
  });

  test('locked: SOS is never gated, and the SOS button hides inside SOS', async () => {
    setup();
    globalThis.Store = lockedStore('2468');
    UI.pages.sos = page('SOS PAGE');
    for (const hash of ['#/sos', '#/sos/craving', '#/sos/urgent', '#/sos?drill=1']) {
      at(hash);
      await UI.render();
      assert.equal(location.hash, hash, hash + ' is not redirected');
      assert.match(main().textContent, /SOS PAGE/);
      assert.equal(document.getElementById('sos-btn').hidden, true);
      assert.equal(document.documentElement.getAttribute('data-route'), 'sos');
    }
  });

  test('RC4, RC10: an SOS route holds the lock open, once, with no ticks of its own; leaving SOS ends the hold', async (t) => {
    setup();
    const held = [];
    let touched = 0;
    globalThis.Store = { view: { get: () => null, list: () => [], count: () => 0 },
      status: () => ({ persistence: 'memory', lastSavedAt: null, hasLock: true, locked: false }),
      lock: { touch: () => { touched += 1; }, hold: (on) => { held.push(on); } } };
    UI.pages.sos = page('SOS PAGE');
    UI.pages.today = page('TODAY');
    at('#/today');
    await UI.render(); // no hold left from an earlier test
    held.length = 0;
    t.mock.timers.enable({ apis: ['setInterval', 'setTimeout'] });
    at('#/sos/craving');
    await UI.render();
    assert.deepEqual(held, [true], 'entering SOS holds the lock open');
    t.mock.timers.tick(120000);
    assert.equal(touched, 0, 'no keep-alive ticks: they would hide how long the page was left');
    at('#/sos');
    await UI.render();
    assert.deepEqual(held, [true], 'one hold, never two');
    at('#/today');
    await UI.render();
    assert.deepEqual(held, [true, false], 'leaving SOS ends the hold');
  });

  test('unlocked: #/lock goes to Today', async () => {
    setup();
    const S = lockedStore('2468');
    S.locked = false;
    globalThis.Store = S;
    at('#/lock');
    await UI.render();
    assert.equal(location.hash, '#/today');
  });

  test('a page that throws shows one line; an absent or failing SOS page shows the urgent numbers', async () => {
    setup();
    UI.pages.track = () => { throw new Error('boom'); };
    at('#/track');
    await UI.render();
    assert.match(main().textContent, /This page could not open\. SOS still works\./);
    assert.equal(errors.length, 1, 'the failure is reported once');
    for (const sos of [undefined, () => { throw new Error('sos boom'); }, () => 'not a node']) {
      if (sos) UI.pages.sos = sos; else delete UI.pages.sos;
      at('#/sos/craving');
      await UI.render();
      const text = main().textContent;
      assert.match(text, /Urgent help/);
      assert.match(text, /112/);
      assert.match(text, /14416/);
      assert.match(text, /please verify/);
      assert.ok(hrefs().includes('tel:112'), 'one tap calls the emergency number');
    }
  });

  test('(c): the PIN field asks for a number pad, and no password manager keeps it', async () => {
    setup();
    globalThis.Store = lockedStore('2468');
    at('#/lock');
    await UI.render();
    const pin = main().all().find((e) => e.id === 'lock-pin');
    assert.ok(pin, 'the fallback lock page has its PIN field');
    assert.equal(pin.getAttribute('type'), 'password');
    assert.equal(pin.getAttribute('inputmode'), 'numeric');
    assert.equal(pin.getAttribute('pattern'), '[0-9]*');
    assert.equal(pin.getAttribute('autocomplete'), 'one-time-code');
  });

  test('(e): h() never sets a string on* handler, and drops a javascript: href or src in any case or spacing', () => {
    setup();
    const onAttrs = (el) => Object.keys(el.attrs).filter((k) => /^on/i.test(k));
    const a = UI.h('a', { href: '  JavaScript:alert(1)', onclick: 'alert(1)', onClick: 'alert(2)', ONMOUSEOVER: 'x', text: 'Go' });
    assert.equal(a.getAttribute('href'), null);
    assert.deepEqual(onAttrs(a), []);
    assert.deepEqual(Object.keys(a.on), [], 'no string became a listener');
    for (const src of ['javascript:x', '\tjavascript:x', 'JAVA\nSCRIPT:x', ' jAvAsCrIpT:void(0)']) {
      assert.equal(UI.h('img', { src }).getAttribute('src'), null, JSON.stringify(src));
      assert.equal(UI.h('a', { href: src }).getAttribute('href'), null, JSON.stringify(src));
    }
    const s = UI.svg('a', { href: 'javascript:x', 'xlink:href': ' javascript:x', onload: 'x' });
    assert.equal(s.getAttribute('href'), null);
    assert.equal(s.getAttribute('xlink:href'), null);
    assert.deepEqual(onAttrs(s), []);
    const ok = UI.h('a', { href: '#/sos', onClick: () => {} });
    assert.equal(ok.getAttribute('href'), '#/sos', 'a route link stays');
    assert.equal(ok.on.click.length, 1, 'a function handler is still a listener');
    assert.equal(UI.h('a', { href: 'tel:112' }).getAttribute('href'), 'tel:112', 'a number to tap stays');
  });

  test('(d): the fallback lock page says, in one plain line, what to do about a forgotten PIN', async () => {
    setup();
    globalThis.Store = lockedStore('2468');
    at('#/lock');
    await UI.render();
    const lines = main().all().filter((e) => e.tagName === 'P' && /Forgot your PIN\?/.test(e.textContent));
    assert.equal(lines.length, 1);
    assert.equal(lines[0].textContent.trim(), 'Forgot your PIN? You can erase this notebook and restore a backup.');
  });

  test('RS8: with Content missing, unreadable or its list empty, the built-in urgent page still has one number to tap', async () => {
    const contents = [undefined, { resources: { in: { emergency: [], crisis: [] } } }, { resources: { in: { emergency: 'x' } } },
      { get resources() { throw new Error('unreadable'); } }];
    for (const content of contents) {
      setup();
      if (content) globalThis.Content = content; else delete globalThis.Content;
      delete UI.pages.sos;
      at('#/sos');
      await UI.render();
      assert.deepEqual(hrefs().filter((x) => x.startsWith('tel:')), ['tel:112'], 'one tap calls 112');
      assert.match(main().textContent, /Urgent help/);
      assert.match(main().textContent, /please verify/);
    }
  });

  test('routes: unknown renders Today, a known unregistered page says coming soon, and each render is announced', async () => {
    setup();
    at('#/nowhere/at/all');
    await UI.render();
    assert.match(main().textContent, /Today is coming together/);
    assert.ok(hrefs().includes('#/learn') && hrefs().includes('#/sos'));
    assert.equal(document.getElementById('saved-label').textContent, 'Not saved — export before closing', 'no Store: said plainly');
    at('#/games/refusal');
    await UI.render();
    assert.match(main().textContent, /coming soon/);
    assert.ok(hrefs().includes('#/today'), 'never a dead end');
    assert.ok(document.events.includes('ui:route') && document.events.includes('ui:rendered'));
    assert.equal(document.title, '1-addic');
  });

  test('discreet mode: the name becomes Notebook and SOS reads Help', async () => {
    setup();
    globalThis.Store = {
      view: { get: (s, id) => (s === 'settings' && id === 'app' ? { key: 'app', discreet: true } : null), list: () => [], count: () => 0 },
      status: () => ({ persistence: 'indexeddb', lastSavedAt: null, hasLock: false, locked: false }),
    };
    at('#/today');
    await UI.render();
    assert.equal(document.title, 'Notebook');
    assert.equal(document.getElementById('app-name').textContent.trim(), 'Notebook');
    assert.equal(document.getElementById('sos-btn').textContent.trim(), 'Help');
    assert.equal(document.documentElement.getAttribute('data-counters'), 'off');
  });

  test('C5: discreet mode while locked: the device flag 1-addic:discreet keeps the lock screen Notebook and Help', async () => {
    setup();
    const dlg = dialogStandIn();
    const box = new Map();
    globalThis.localStorage = {
      getItem: (k) => (box.has(k) ? box.get(k) : null), setItem: (k, v) => box.set(k, String(v)), removeItem: (k) => box.delete(k),
    };
    const looks = () => [document.title, document.getElementById('app-name').textContent.trim(),
      document.getElementById('sos-btn').textContent.trim()];
    const sheetLink = () => {
      const s = UI.sheet('About', page('about')());
      const t = dlg.all().find((e) => e.tagName === 'A' && e.getAttribute('href') === '#/sos').textContent.trim();
      s.close();
      dlg.flush();
      return t;
    };
    globalThis.Store = lockedStore('2468'); // the sealed settings row reads null while locked
    box.set('1-addic:discreet', '1');
    at('#/lock');
    await UI.render();
    assert.match(main().textContent, /Locked/);
    assert.deepEqual(looks(), ['Notebook', 'Notebook', 'Help'], 'locked, the flag keeps discreet mode');
    assert.equal(document.getElementById('sos-btn').getAttribute('aria-label'), 'Help');
    assert.equal(sheetLink(), 'Help', 'a sheet link says Help too');
    box.delete('1-addic:discreet');
    await UI.render();
    assert.deepEqual(looks(), ['1-addic', '1-addic', 'SOS'], 'no flag: the plain name');
    assert.equal(sheetLink(), 'SOS');
    // Unlocked, settings.discreet is the record and the flag follows it.
    let settings = { key: 'app', discreet: true };
    globalThis.Store = {
      view: { get: (s, id) => (s === 'settings' && id === 'app' ? settings : null), list: () => [], count: () => 0 },
      status: () => ({ persistence: 'indexeddb', lastSavedAt: null, hasLock: true, locked: false }),
    };
    UI.pages.today = page('today');
    at('#/today');
    await UI.render();
    assert.equal(box.get('1-addic:discreet'), '1', 'an unlocked render sets the flag from settings');
    assert.deepEqual(looks(), ['Notebook', 'Notebook', 'Help']);
    settings = { key: 'app', discreet: false };
    await UI.render();
    assert.equal(box.has('1-addic:discreet'), false, 'and removes it when discreet mode is off');
    assert.deepEqual(looks(), ['1-addic', '1-addic', 'SOS']);
    assert.equal(UI.applyDiscreet(true), true);
    assert.equal(box.get('1-addic:discreet'), '1');
    assert.deepEqual(looks(), ['Notebook', 'Notebook', 'Help'], 'applyDiscreet repaints at once');
    assert.equal(UI.applyDiscreet(false), false);
    assert.equal(box.has('1-addic:discreet'), false);
    assert.deepEqual(looks(), ['1-addic', '1-addic', 'SOS']);
    box.set('1-addic:discreet', '1');
    globalThis.Store.view.get = () => { throw new Error('sealed'); };
    await UI.render();
    assert.equal(box.get('1-addic:discreet'), '1', 'an unreadable settings row never clears the flag');
    assert.deepEqual(looks(), ['Notebook', 'Notebook', 'Help']);
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('SecurityError'); } });
    globalThis.Store = lockedStore('2468');
    at('#/lock');
    await UI.render();
    assert.deepEqual(looks(), ['1-addic', '1-addic', 'SOS'], 'blocked storage: the plain name, nothing throws');
    assert.equal(UI.applyDiscreet(true), true);
    assert.deepEqual(looks(), ['Notebook', 'Notebook', 'Help']);
    assert.equal(UI.applyDiscreet(false), false);
  });

  test('C2: a sheet that replaces another is not closed by the first sheet’s queued close event', () => {
    setup();
    const dlg = dialogStandIn();
    const why = [];
    UI.sheet('First', page('one')(), { onClose: (w) => why.push('first ' + w) });
    const second = UI.sheet('Second', page('two')(), { onClose: (w) => why.push('second ' + w) });
    assert.deepEqual(why, ['first replaced']);
    dlg.flush(); // the browser now delivers the close event that the first sheet queued
    assert.equal(dlg.open, true, 'the second sheet stays open');
    assert.match(dlg.textContent, /Second/);
    assert.deepEqual(why, ['first replaced'], 'an event that was not its own never closes the second sheet');
    dlg.escape(); // a real dismissal still closes it
    dlg.flush();
    assert.deepEqual(why, ['first replaced', 'second dismissed']);
    assert.equal(dlg.open, false);
    assert.equal(dlg.kids.length, 0, 'the dialog is emptied');
    second.close();
    assert.deepEqual(why, ['first replaced', 'second dismissed'], 'closing twice does nothing twice');
  });

  test('C2: a confirm from inside a sheet, and a sheet opened as the confirm answers, wait for the person', async () => {
    setup();
    const dlg = dialogStandIn();
    UI.sheet('Your plan', page('PRIVATE plan')());
    const asked = UI.confirm({ title: 'Delete this line?', confirmLabel: 'Delete', danger: true });
    dlg.flush();
    assert.equal(dlg.open, true, 'the confirm is still open after the sheet’s queued close event');
    button(dlg, 'Delete').on.click[0]();
    assert.equal(await asked, true, 'the person’s answer, never a false from an old event');
    const next = UI.sheet('Deleted', page('done')());
    dlg.flush(); // the confirm's own close event arrives after the next sheet opened
    assert.equal(dlg.open, true, 'the sheet opened after the answer stays open');
    assert.match(dlg.textContent, /Deleted/);
    next.close();
    dlg.flush();
    assert.equal(dlg.open, false);
  });

  test('C3: an open sheet closes when the app locks and nothing of it stays; inside SOS the lock never interrupts it', async () => {
    setup();
    const dlg = dialogStandIn();
    const S = lockedStore('2468');
    S.locked = false;
    globalThis.Store = S;
    UI.pages.today = page('today');
    at('#/today');
    await UI.render();
    const why = [];
    UI.sheet('Your reasons', page('PRIVATE reason')(), { onClose: (w) => why.push(w) });
    assert.equal(dlg.open, true);
    assert.match(dlg.textContent, /PRIVATE/);
    S.locked = true; // the app locks
    await UI.render();
    assert.deepEqual(why, ['locked']);
    assert.equal(dlg.open, false);
    assert.equal(dlg.kids.length, 0, 'nothing of the person’s stays in the dialog');
    assert.equal(location.hash, '#/lock');
    assert.match(main().textContent, /Locked/);
    assert.ok(!main().textContent.includes('PRIVATE'));
    dlg.flush();
    S.locked = false;
    UI.pages.sos = page('SOS PAGE');
    at('#/sos/craving');
    await UI.render();
    const sos = UI.sheet('Breathe', page('Breathe out slowly.')(), { onClose: (w) => why.push(w) });
    S.locked = true; // the app locks during SOS
    await UI.render();
    assert.equal(location.hash, '#/sos/craving', 'SOS is never gated');
    assert.equal(dlg.open, true, 'a sheet inside SOS is never interrupted by the lock');
    assert.match(dlg.textContent, /Breathe out slowly/);
    assert.deepEqual(why, ['locked']);
    sos.close();
    dlg.flush();
  });

  test('F1: a route change closes an open sheet, and a pending confirm answers false', async () => {
    setup();
    const dlg = dialogStandIn();
    const S = lockedStore('2468');
    S.locked = false;
    globalThis.Store = S;
    UI.pages.today = page('today');
    UI.pages.sos = page('SOS PAGE');
    at('#/today');
    await UI.render();
    const why = [];
    UI.sheet('Your reasons', page('PRIVATE reason')(), { onClose: (w) => why.push(w) });
    await UI.render('store'); // the same route drawn again: the sheet stays
    assert.equal(dlg.open, true);
    assert.deepEqual(why, []);
    at('#/sos/craving');
    await UI.render();
    assert.deepEqual(why, ['route']);
    assert.equal(dlg.open, false);
    assert.equal(dlg.kids.length, 0, 'nothing of the sheet stays over SOS');
    assert.match(main().textContent, /SOS PAGE/);
    dlg.flush();
    at('#/today');
    await UI.render();
    const asked = UI.confirm({ title: 'Delete this line?', confirmLabel: 'Delete', danger: true });
    at('#/track');
    await UI.render();
    assert.equal(await asked, false, 'a confirm left open by a route change answers false');
    assert.equal(dlg.open, false);
    dlg.flush();
  });

  test('F2: every sheet header carries its own SOS link: one tap closes the sheet and opens SOS; Help when discreet', async () => {
    setup();
    const dlg = dialogStandIn();
    UI.pages.today = page('today');
    at('#/today');
    await UI.render();
    const why = [];
    UI.sheet('Your plan', page('PRIVATE plan')(), { onClose: (w) => why.push(w), dismissable: false });
    const sosLink = () => dlg.all().find((e) => e.tagName === 'A' && e.getAttribute('href') === '#/sos');
    const link = sosLink();
    assert.ok(link, 'a link to SOS, even in a sheet that cannot be dismissed');
    assert.ok(dlg.children[0].children.includes(link), 'it sits in the sheet header');
    assert.equal(link.textContent.trim(), 'SOS');
    assert.match(link.getAttribute('class'), /\bsheet-sos\b/);
    let prevented = false;
    link.on.click[0]({ preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
    assert.deepEqual(why, ['route']);
    assert.equal(dlg.open, false);
    assert.equal(dlg.kids.length, 0);
    assert.equal(location.hash, '#/sos', 'one tap goes to SOS');
    dlg.flush();
    globalThis.Store = {
      view: { get: (s, id) => (s === 'settings' && id === 'app' ? { discreet: true } : null), list: () => [], count: () => 0 },
      status: () => ({ persistence: 'memory', lastSavedAt: null, hasLock: false, locked: false }),
    };
    at('#/today');
    await UI.render();
    const s = UI.sheet('Notes', page('notes')());
    assert.equal(sosLink().textContent.trim(), 'Help', 'discreet mode says Help');
    s.close();
    dlg.flush();
    const css = fs.readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
    const rule = (css.match(/\.sheet-sos\s*\{([^}]*)\}/) || [])[1] || '';
    assert.match(rule, /min-height:\s*44px/);
    assert.match(rule, /min-width:\s*44px/);
  });

  // Last in this group: UI.boot runs once per module, so it stays booted (and loaded) for any test after it.
  test('C5: opened at #/sos before the Store has loaded, the discreet flag decides and is never cleared', async (t) => {
    setup();
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const box = new Map([['1-addic:discreet', '1']]);
    globalThis.localStorage = {
      getItem: (k) => (box.has(k) ? box.get(k) : null), setItem: (k, v) => box.set(k, String(v)), removeItem: (k) => box.delete(k),
    };
    globalThis.window = { addEventListener() {} };
    document.addEventListener = () => {};
    let st = { persistence: 'indexeddb', lastSavedAt: null, hasLock: false, locked: false };
    let opened;
    const loading = new Promise((res) => { opened = res; });
    globalThis.Store = { view: { get: () => null, list: () => [], count: () => 0 }, status: () => st, load: () => loading };
    at('#/sos');
    const booting = UI.boot();
    await new Promise((r) => setImmediate(r));
    assert.ok(main().textContent.length > 0, 'SOS draws before the Store loads');
    assert.equal(document.title, 'Notebook', 'and the flag decides');
    assert.equal(box.get('1-addic:discreet'), '1', 'an unloaded Store never clears the flag');
    st = { persistence: 'indexeddb', lastSavedAt: null, hasLock: true, locked: true };
    opened();
    await booting;
    assert.equal(box.get('1-addic:discreet'), '1');
    assert.equal(document.title, 'Notebook', 'loaded and locked: still Notebook');
    assert.equal(document.getElementById('sos-btn').textContent.trim(), 'Help');
  });

  // Boots a fresh ui-core at a hash with a Store whose load waits for opened(); on.<type> holds window listeners.
  const bootPending = async (t, hash, box) => {
    setup();
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const U = freshUi();
    const on = {};
    const store = box || new Map();
    globalThis.localStorage = {
      getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k),
    };
    globalThis.window = { addEventListener: (type, f) => { (on[type] = on[type] || []).push(f); } };
    document.addEventListener = (type, f) => { (on['doc:' + type] = on['doc:' + type] || []).push(f); };
    let opened;
    const loading = new Promise((res) => { opened = res; });
    globalThis.Store = {
      view: { get: () => null, list: () => [], count: () => 0 },
      status: () => ({ persistence: 'indexeddb', lastSavedAt: null, hasLock: false, locked: false }),
      load: () => loading,
    };
    at(hash);
    const booting = U.boot();
    await new Promise((r) => setImmediate(r));
    return { U, on, booting, opened: () => opened() };
  };

  test('RS6: SOS opened while the Store is still loading is never drawn again when the load ends', async (t) => {
    const b = await bootPending(t, '#/today');
    b.U.pages.sos = () => { const p = globalThis.document.createElement('div'); p.textContent = 'Breathe in'; return p; };
    at('#/sos'); // the person taps SOS at once
    for (const f of b.on.hashchange) f();
    await new Promise((r) => setImmediate(r));
    const drawn = main().firstChild;
    assert.match(main().textContent, /Breathe in/);
    b.opened();
    await b.booting;
    assert.equal(main().firstChild, drawn, 'the same SOS node: the step goes on, focus stays');
    assert.match(main().textContent, /Breathe in/);
  });

  test('RS6: a route other than SOS is drawn when the load ends', async (t) => {
    const b = await bootPending(t, '#/today');
    b.U.pages.today = () => { const p = globalThis.document.createElement('p'); p.textContent = 'Today, loaded'; return p; };
    b.opened();
    await b.booting;
    assert.match(main().textContent, /Today, loaded/);
  });

  test('RS7: discreet, the name and the button read Notebook and Help before the Store has loaded, at any route', async (t) => {
    const b = await bootPending(t, '#/today', new Map([['1-addic:discreet', '1']]));
    assert.equal(document.title, 'Notebook');
    assert.equal(document.getElementById('app-name').textContent.trim(), 'Notebook');
    assert.equal(document.getElementById('sos-btn').textContent.trim(), 'Help');
    b.opened();
    await b.booting; // loaded and open, the settings row decides from here (C5)
  });

  test('(a): locked, nothing waits in #print-root: render empties it, and so does a lock inside SOS', async (t) => {
    setup();
    const pr = document.getElementById('print-root');
    pr.appendChild(document.createElement('p')); // a worksheet sent to print, waiting for afterprint
    globalThis.Store = lockedStore('2468');
    at('#/workbook');
    await UI.render();
    assert.equal(pr.children.length, 0, 'render while locked empties it');
    clearStandIns();
    const b = await bootPending(t, '#/sos');
    let lockFn = null;
    globalThis.Store.lock = { onLock: (f) => { lockFn = f; } };
    b.opened();
    await b.booting;
    const doc = document.getElementById('print-root');
    doc.appendChild(document.createElement('p'));
    lockFn({ reason: 'auto' });
    assert.equal(doc.children.length, 0, 'a lock inside SOS empties it too');
  });

  test('(b): ui-core touches the lock on input, on pageshow and when the page is visible again, never while hidden', async (t) => {
    const b = await bootPending(t, '#/today');
    const touches = [];
    globalThis.Store.lock = { touch: () => { touches.push(1); } };
    b.opened();
    await b.booting;
    const fire = (type, ev) => { for (const f of b.on[type] || []) f(ev || {}); };
    fire('doc:input');
    assert.equal(touches.length, 1, 'typing keeps the lock open');
    document.visibilityState = 'hidden';
    fire('doc:visibilitychange');
    assert.equal(touches.length, 1, 'hidden: no touch');
    document.visibilityState = 'visible';
    fire('doc:visibilitychange');
    assert.equal(touches.length, 2, 'visible again: the Store checks the idle time at once, past the 2 s throttle');
    fire('pageshow', { persisted: true });
    assert.equal(touches.length, 3, 'back from the back-forward cache');
  });

  test('RS7: discreet, the head script names the tab Notebook before first paint, and the CSS keeps name and button discreet', () => {
    const html = fs.readFileSync(new URL('../1-addic.html', import.meta.url), 'utf8');
    const m = /<title>1-addic<\/title>\s*<script>([\s\S]*?)<\/script>/.exec(html);
    assert.ok(m, 'the head script follows the title');
    const run = (get) => {
      const root = { attrs: {}, setAttribute(k, v) { this.attrs[k] = String(v); } };
      const doc = { title: '1-addic', documentElement: root };
      new Function('localStorage', 'window', 'document', m[1])({ getItem: get }, { matchMedia: () => ({ matches: false }) }, doc);
      return { title: doc.title, discreet: 'data-discreet' in root.attrs, theme: root.attrs['data-theme'] };
    };
    assert.deepEqual(run((k) => (k === '1-addic:discreet' ? '1' : null)), { title: 'Notebook', discreet: true, theme: 'light' });
    assert.deepEqual(run(() => null), { title: '1-addic', discreet: false, theme: 'light' });
    assert.deepEqual(run(() => { throw new Error('SecurityError'); }), { title: '1-addic', discreet: false, theme: 'light' });
    assert.match(html, /html\[data-discreet\]:not\(\[data-route\]\) #app-name::after \{ content: "Notebook"/);
    assert.match(html, /html\[data-discreet\]:not\(\[data-route\]\) #sos-btn::after \{ content: "Help"/);
  });

  test('RC5: each of the five tabs is the only one marked aria-current, and #main takes focus on every move', async () => {
    setup();
    const S = lockedStore('2468');
    S.locked = false;
    globalThis.Store = S;
    const nav = document.getElementById('nav');
    const tabs = ['today', 'learn', 'workbook', 'track', 'actions'];
    for (const t of tabs) { const a = document.createElement('a'); a.setAttribute('data-route', t); nav.appendChild(a); }
    nav.querySelectorAll = (sel) => (sel === 'a[data-route]' ? nav.children.filter((a) => a.getAttribute('data-route') !== null) : []);
    const current = () => nav.children.filter((a) => a.getAttribute('aria-current') === 'page').map((a) => a.getAttribute('data-route'));
    at('#/settings'); // somewhere else first, so every tab below is a move
    await UI.render();
    assert.deepEqual(current(), [], 'no tab is current on a page that is not a tab');
    for (const t of tabs) {
      document.activeElement = null;
      at('#/' + t);
      await UI.render();
      assert.deepEqual(current(), [t], 'only ' + t + ' is current');
      assert.equal(document.activeElement, main(), '#main takes focus on the move to ' + t);
    }
  });

  test('RC6: SOS is dark at night unless the theme is forced light; away from SOS the theme follows the device', () => {
    setup();
    globalThis.Engine = { isNight: () => true };
    let deviceDark = false;
    globalThis.window = { matchMedia: () => ({ matches: deviceDark }) };
    const theme = () => document.documentElement.getAttribute('data-theme');
    at('#/sos');
    UI.applyTheme('system');
    assert.equal(theme(), 'dark', 'SOS at night on a light device is dark');
    UI.applyTheme('light');
    assert.equal(theme(), 'light', 'a theme forced light stays light, even in SOS at night');
    UI.applyTheme('dark');
    assert.equal(theme(), 'dark');
    at('#/today');
    UI.applyTheme('system');
    assert.equal(theme(), 'light', 'away from SOS the system theme follows the device, at night too');
    deviceDark = true;
    UI.applyTheme('system');
    assert.equal(theme(), 'dark');
    globalThis.Engine = { isNight: () => false };
    deviceDark = false;
    at('#/sos');
    UI.applyTheme('system');
    assert.equal(theme(), 'light', 'SOS by day follows the device');
  });

  // querySelector by tag (with one optional [attr]) inside this stand-in DOM, for the form tests only.
  const findIn = (doc) => {
    Object.getPrototypeOf(doc.body).querySelector = function (sel) {
      const want = sel.split(',').map((s) => s.trim().match(/^([a-z]+)(?:\[([a-z-]+)\])?$/)).filter(Boolean);
      return this.all().slice(1).find((e) => want.some(([, tag, attr]) => e.tagName === tag.toUpperCase() && (!attr || e.getAttribute(attr) !== null))) || null;
    };
  };

  test('RC7: UI.form: validate marks every empty required field and focuses the first; number bounds; values() and set()', () => {
    setup();
    findIn(globalThis.document);
    const f = UI.form({ fields: [
      { name: 'name', type: 'text', label: 'Name', required: true },
      { name: 'feel', type: 'chips', label: 'Feeling', required: true, options: [{ value: 'calm', label: 'Calm' }, { value: 'tense', label: 'Tense' }] },
      { name: 'pick', type: 'radio', label: 'Pick one', required: true, options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] },
      { name: 'agree', type: 'checkbox', label: 'I agree', required: true },
      { name: 'n', type: 'number', label: 'How strong', min: 1, max: 10 },
    ] });
    const field = (name) => f.el.children.find((e) => e.dataset.name === name);
    const ctl = (name) => field(name).all().find((e) => e.tagName === 'INPUT');
    const shown = (name) => field(name).all().some((e) => e.getAttribute('class') === 'field-error' && !e.hidden);
    f.set('n', null);
    assert.equal(f.validate(), false);
    for (const n of ['name', 'feel', 'pick', 'agree']) assert.equal(shown(n), true, n + ' says what is missing');
    for (const n of ['name', 'pick', 'agree']) assert.equal(ctl(n).getAttribute('aria-invalid'), 'true', n + ' is marked invalid');
    assert.equal(shown('n'), false, 'an empty number that is not required is fine');
    assert.equal(document.activeElement, ctl('name'), 'the first failing field takes focus');
    f.set('name', 'Asha');
    f.set('feel', ['calm']);
    f.set('pick', 'b');
    f.set('agree', true);
    f.set('n', 0);
    assert.equal(f.validate(), false);
    assert.match(field('n').textContent, /smallest is 1/);
    assert.equal(document.activeElement, ctl('n'));
    for (const n of ['name', 'pick', 'agree']) assert.equal(ctl(n).getAttribute('aria-invalid'), null, n + ' is no longer marked');
    assert.equal(shown('feel'), false);
    f.set('n', 11);
    assert.equal(f.validate(), false);
    assert.match(field('n').textContent, /largest is 10/);
    f.set('n', 7);
    assert.equal(f.validate(), true);
    const all = { name: 'Asha', feel: ['calm'], pick: 'b', agree: true, n: 7 };
    assert.deepEqual(f.values(), all);
    f.set('nope', 'x'); // a name the form does not have changes nothing
    assert.deepEqual(f.values(), all);
  });

  test('RS9: on SOS the whole coach layer is hidden, its tap-catching overlay too, and ui-core empties it', async () => {
    setup();
    UI.pages.sos = page('SOS PAGE');
    const coach = document.getElementById('coach');
    const overlay = document.createElement('div');
    overlay.setAttribute('class', 'coach-overlay');
    coach.appendChild(overlay);
    at('#/sos');
    await UI.render();
    assert.equal(coach.hidden, true);
    assert.equal(coach.children.length, 0);
    const built = new URL('../1-addic.html', import.meta.url);
    const sheets = [fs.readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')];
    if (fs.existsSync(built)) sheets.push(fs.readFileSync(built, 'utf8'));
    for (const css of sheets) {
      const rule = css.split('}').find((r) => /\[data-route="sos"\]\s+#coach\b/.test(r)) || '';
      assert.match(rule, /\[data-route="sos"\]\s+\.coach-overlay\b/, 'the overlay is named');
      assert.match(rule, /display:\s*none\s*!important/);
    }
  });

  test('RS12: a lock page that throws or gives no node still shows the PIN field, Forgot PIN and urgent help', async (t) => {
    setup();
    t.after(() => { delete UI.pages.lock; });
    const S = lockedStore('2468');
    globalThis.Store = S;
    for (const bad of [() => { throw new Error('lock boom'); }, () => 'not a node']) {
      UI.pages.lock = bad;
      at('#/lock');
      await UI.render();
      assert.ok(main().all().some((e) => e.id === 'lock-pin'), 'the PIN field is there');
      assert.match(main().textContent, /Forgot your PIN/);
      assert.ok(hrefs().includes('#/sos/urgent'), 'urgent help, no PIN needed');
    }
    const form = main().all().find((e) => e.tagName === 'FORM');
    main().all().find((e) => e.id === 'lock-pin').value = '2468';
    await form.on.submit[0]({ preventDefault() {} });
    assert.equal(S.locked, false);
    assert.equal(location.hash, '#/today');
  });

  test('RS14: discreet, the Today placeholder and a page that fails say Help, never SOS', async () => {
    setup();
    globalThis.Store = {
      view: { get: (s, id) => (s === 'settings' && id === 'app' ? { key: 'app', discreet: true } : null), list: () => [], count: () => 0 },
      status: () => ({ persistence: 'indexeddb', lastSavedAt: null, hasLock: false, locked: false }),
    };
    delete UI.pages.today;
    at('#/today');
    await UI.render();
    assert.match(main().textContent, /Open Help/);
    assert.ok(!main().textContent.includes('SOS'), 'Today never names SOS');
    UI.pages.track = () => { throw new Error('boom'); };
    at('#/track');
    await UI.render();
    assert.match(main().textContent, /This page could not open\. Help still works\./);
    assert.ok(!main().textContent.includes('SOS'));
  });

  test('RS13: unlocked, a settings row that will not open (absent from view, Q4) keeps the discreet flag', async () => {
    setup();
    const box = new Map([['1-addic:discreet', '1']]);
    globalThis.localStorage = {
      getItem: (k) => (box.has(k) ? box.get(k) : null), setItem: (k, v) => box.set(k, String(v)), removeItem: (k) => box.delete(k),
    };
    globalThis.Store = {
      view: { get: () => null, list: () => [], count: () => 0 },
      status: () => ({ persistence: 'indexeddb', lastSavedAt: null, hasLock: true, locked: false, unreadable: 1 }),
    };
    UI.pages.today = page('today');
    at('#/today');
    await UI.render();
    assert.equal(box.get('1-addic:discreet'), '1', 'the flag stays');
    assert.equal(document.title, 'Notebook');
    assert.equal(document.getElementById('sos-btn').textContent.trim(), 'Help');
  });

  test('RC12: UI.form: a required chips field is marked on its group and a chip takes the focus', () => {
    setup();
    findIn(globalThis.document);
    const f = UI.form({ fields: [
      { name: 'feel', type: 'chips', label: 'Feeling', required: true, options: [{ value: 'calm', label: 'Calm' }, { value: 'tense', label: 'Tense' }] },
    ] });
    const field = f.el.children.find((e) => e.dataset.name === 'feel');
    const group = field.all().find((e) => e.getAttribute('role') === 'group');
    assert.equal(f.validate(), false);
    assert.equal(group.getAttribute('aria-invalid'), 'true', 'the group is marked invalid');
    assert.equal(document.activeElement && document.activeElement.tagName, 'BUTTON', 'a chip takes the focus');
    assert.equal(document.activeElement.textContent.trim(), 'Calm');
    f.set('feel', ['tense']);
    assert.equal(f.validate(), true);
    assert.equal(group.getAttribute('aria-invalid'), null, 'no longer marked');
  });

  test('RC11: the fallback lock page says a PIN is not available on this device when the Store has no crypto', async () => {
    setup();
    globalThis.Store = { view: { get: () => null, list: () => [], count: () => 0 },
      status: () => ({ persistence: 'indexeddb', lastSavedAt: null, hasLock: true, locked: true }),
      lock: { unlock: async () => { const e = new Error('no crypto'); e.code = 'NO_CRYPTO'; throw e; } } };
    at('#/lock');
    await UI.render();
    const form = main().all().find((e) => e.tagName === 'FORM');
    main().all().find((e) => e.id === 'lock-pin').value = '2468';
    await form.on.submit[0]({ preventDefault() {} });
    const msg = main().all().find((e) => e.id === 'lock-msg');
    assert.equal(msg.hidden, false);
    assert.equal(msg.textContent, 'A PIN is not available on this device.');
  });

  test('RC10, RS10: the real Store: no lock fires in SOS, a wake there never locks, and leaving it past the limit draws the lock', async (t) => {
    setup();
    t.mock.timers.enable({ apis: ['setTimeout', 'setInterval', 'Date'], now: Date.now() });
    const S = freshStore();
    globalThis.Store = S;
    await S.commit('t', (d) => { d.put('events', { id: 'e1', type: 'CravingLogged', note: MARK }); });
    await S.lock.set('2468', { autoLockMin: 1 });
    UI.pages.today = page('TODAY ' + MARK);
    UI.pages.sos = page('SOS PAGE');
    at('#/today');
    await UI.render();
    at('#/sos/craving');
    await UI.render();
    t.mock.timers.tick(10 * 60000); // the page is left on SOS
    assert.equal(S.status().locked, false, 'no auto-lock fires in SOS (Q1)');
    t.mock.timers.setTime(Date.now() + 10 * 60000); // the phone slept on SOS; now it wakes
    S.lock.touch();
    t.mock.timers.tick(1000);
    assert.equal(S.status().locked, false, 'a wake inside SOS never locks (RC10)');
    at('#/today'); // someone else taps Today
    await UI.render();
    assert.equal(S.status().locked, true, 'leaving SOS past the limit locks first (RS10)');
    assert.equal(location.hash, '#/lock');
    assert.ok(!main().textContent.includes(MARK), 'Today is never drawn');
    assert.equal(await S.lock.unlock('2468'), true);
    at('#/sos');
    await UI.render();
    for (let i = 0; i < 6; i++) { t.mock.timers.tick(30000); S.lock.touch(); }
    at('#/today');
    await UI.render();
    assert.equal(S.status().locked, false, 'a person active in SOS keeps it open');
    assert.match(main().textContent, /TODAY/);
    at('#/sos');
    await UI.render();
    S.lock.lockNow();
    assert.equal(S.status().locked, true, 'Lock now still locks at once inside SOS');
    at('#/today');
    await UI.render();
    assert.equal(location.hash, '#/lock');
  });

  test('RC7: confirm answers true only on its confirm button; Cancel, the close button, the backdrop and Esc answer false', async () => {
    setup();
    const dlg = dialogStandIn();
    const ask = () => UI.confirm({ title: 'Delete this line?', confirmLabel: 'Delete', cancelLabel: 'Keep it', danger: true });
    let a = ask();
    assert.equal(document.activeElement, button(dlg, 'Keep it'), 'focus starts on the safe answer');
    button(dlg, 'Delete').on.click[0]();
    dlg.flush();
    assert.equal(await a, true, 'the confirm button');
    a = ask();
    button(dlg, 'Keep it').on.click[0]();
    dlg.flush();
    assert.equal(await a, false, 'Cancel');
    a = ask();
    dlg.all().find((e) => e.tagName === 'BUTTON' && e.getAttribute('aria-label') === 'Close').on.click[0]();
    dlg.flush();
    assert.equal(await a, false, 'the close button');
    a = ask();
    for (const fn of [].concat(dlg.on.click || [])) fn({ target: dlg });
    dlg.flush();
    assert.equal(await a, false, 'a tap on the backdrop');
    a = ask();
    dlg.escape();
    dlg.flush();
    assert.equal(await a, false, 'Esc');
    assert.equal(dlg.open, false);
  });
});

/* ── U-04: the encrypted store (store.js by path; each test loads a fresh copy) ─────────────── */
const STORE_PATH = require.resolve('../src/store.js');
function freshStore() {
  delete require.cache[STORE_PATH];
  return require(STORE_PATH);
}
const MARK = 'PRIVATE-MARKER-7f3a';

// The smallest IndexedDB that store.js uses: open with one upgrade, transactions that apply all or nothing, getAll,
// put, delete, clear. A stand-in of this file only. dump() is what DevTools would show.
function fakeIndexedDB() {
  const dbs = new Map();
  const cp = (v) => JSON.parse(JSON.stringify(v));
  const fake = { failOpen: false, failWrites: false, opened: 0 };
  function makeDb(rec) {
    return {
      objectStoreNames: { contains: (n) => rec.stores.has(n) },
      createObjectStore(n, o) { rec.stores.set(n, { keyPath: o.keyPath, rows: new Map() }); },
      close() {},
      transaction(names, mode) {
        for (const n of names) if (!rec.stores.has(n)) throw new Error('NotFoundError');
        const t = { error: null, aborted: false, abort() { t.aborted = true; } };
        const ops = [];
        const request = (fn) => { const r = {}; ops.push(() => { r.result = fn(); if (r.onsuccess) r.onsuccess(); }); return r; };
        t.objectStore = (n) => {
          const st = rec.stores.get(n);
          return {
            getAll: () => request(() => Array.from(st.rows.values()).map(cp)),
            get: (id) => request(() => (st.rows.has(id) ? cp(st.rows.get(id)) : undefined)),
            put: (row) => request(() => { st.rows.set(row[st.keyPath], cp(row)); }),
            delete: (id) => request(() => { st.rows.delete(id); }),
            clear: () => request(() => { st.rows.clear(); }),
          };
        };
        setTimeout(() => {
          if (fake.failWrites && mode === 'readwrite') { t.error = new Error('QuotaExceededError'); t.onerror && t.onerror(); return; }
          for (const op of ops) { if (t.aborted) break; op(); }
          if (t.aborted) { t.onabort && t.onabort(); return; }
          t.oncomplete && t.oncomplete();
        }, 0);
        return t;
      },
    };
  }
  fake.open = (name, version) => {
    const r = {};
    setTimeout(() => {
      if (fake.failOpen) { r.error = new Error('InvalidStateError'); r.onerror && r.onerror(); return; }
      fake.opened += 1;
      let rec = dbs.get(name);
      if (!rec) { rec = { version: 0, stores: new Map() }; dbs.set(name, rec); }
      r.result = makeDb(rec);
      if (rec.version < version) { rec.version = version; r.onupgradeneeded && r.onupgradeneeded(); }
      r.onsuccess && r.onsuccess();
    }, 0);
    return r;
  };
  fake.failDelete = null; // 'fail', or 'blocked' (another tab holds the database open)
  fake.deleteDatabase = (name) => {
    const r = {};
    setTimeout(() => {
      if (fake.failDelete === 'fail') { r.error = new Error('UnknownError'); r.onerror && r.onerror(); return; }
      if (fake.failDelete === 'blocked') { r.onblocked && r.onblocked(); return; }
      dbs.delete(name);
      r.onsuccess && r.onsuccess();
    }, 0);
    return r;
  };
  fake.rows = (store) => { const rec = dbs.get('1-addic'); return rec ? Array.from(rec.stores.get(store).rows.values()) : []; };
  fake.storeNames = () => Array.from(dbs.get('1-addic').stores.keys());
  fake.dump = () => JSON.stringify(Array.from(dbs.values()).map((rec) => Array.from(rec.stores).map(([n, st]) => [n, Array.from(st.rows.values())])));
  return fake;
}
function fakeLocalStorage() {
  const m = new Map();
  return {
    m, full: false,
    getItem(k) { return m.has(k) ? m.get(k) : null; },
    setItem(k, v) { if (this.full) throw new Error('QuotaExceededError'); m.set(k, String(v)); },
    removeItem(k) { m.delete(k); },
  };
}

describe('store (U-04): the person’s data, sealed with a PIN', () => {
  const realNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  afterEach(() => {
    for (const k of ['indexedDB', 'localStorage', 'window', 'Store']) delete globalThis[k];
    if (realNavigator) Object.defineProperty(globalThis, 'navigator', realNavigator);
  });
  const addRows = (S) => S.commit('test', (d) => {
    d.put('profile', { key: 'me', name: 'Asha ' + MARK });
    d.put('events', { id: 'e1', type: 'CravingLogged', note: MARK });
    d.put('events', { id: 'e2', type: 'CravingLogged' });
    return 'wrote';
  });

  test('memory mode in Node: round trip through commit, get, list and count; drafts are copies; bad rows refused', async () => {
    const S = freshStore();
    assert.deepEqual(S.STORES, { profile: 'key', settings: 'key', meta: 'key', events: 'id', logs: 'id', responses: 'id',
      contacts: 'id', plans: 'id', todos: 'id', motivation: 'id', predictions: 'id', quests: 'id', tutorials: 'id',
      reveals: 'id', tips: 'id', recoveryPlan: 'key' });
    await S.load();
    assert.deepEqual(S.status(), { persistence: 'memory', lastSavedAt: null, hasLock: false, locked: false, autoLockMin: null, unreadable: 0 });
    assert.equal(await addRows(S), 'wrote', 'commit resolves with what the rule returned');
    assert.equal(S.view.get('profile', 'me').name, 'Asha ' + MARK);
    assert.deepEqual(S.view.list('events').map((e) => e.id), ['e1', 'e2']);
    assert.equal(S.view.count('events'), 2);
    assert.equal(S.view.get('events', 'nope'), null);
    assert.deepEqual(S.view.list('nope'), []);
    await S.commit('edit', (d) => {
      const me = d.get('profile', 'me');
      me.name = 'changed';
      assert.equal(S.view.get('profile', 'me').name, 'Asha ' + MARK, 'a draft row is a copy until it is put');
      d.put('profile', me);
      d.del('events', 'e2');
      assert.deepEqual(d.list('events').map((e) => e.id), ['e1'], 'the draft sees its own writes');
    });
    assert.equal(S.view.get('profile', 'me').name, 'changed');
    assert.equal(S.view.count('events'), 1);
    for (const [rule, code] of [[(d) => d.put('nope', { id: 'x' }), 'UNKNOWN_STORE'], [(d) => d.put('events', { type: 'x' }), 'BAD_ROW'],
      [(d) => d.put('meta', { key: 'lock', salt: 'x' }), 'RESERVED']]) {
      await assert.rejects(S.commit('bad', rule), (e) => e.code === code, code);
    }
    assert.equal(S.view.count('meta'), 0);
  });

  test('a thrown rule rolls the working set back, rejects and notifies no one; a failed save changes nothing', async () => {
    globalThis.indexedDB = fakeIndexedDB();
    const S = freshStore();
    await S.load();
    await addRows(S);
    let heard = 0;
    S.subscribe(() => { heard += 1; });
    const before = indexedDB.dump();
    await assert.rejects(S.commit('rule', (d) => { d.put('events', { id: 'e3' }); d.del('events', 'e1'); throw new Error('a rule said no'); }),
      /a rule said no/);
    assert.deepEqual(S.view.list('events').map((e) => e.id), ['e1', 'e2']);
    assert.equal(indexedDB.dump(), before, 'nothing written');
    indexedDB.failWrites = true;
    await assert.rejects(S.commit('full', (d) => d.put('events', { id: 'e4' })), (e) => e.code === 'WRITE_FAILED');
    assert.equal(S.view.get('events', 'e4'), null, 'a save the browser refused never shows as saved');
    assert.equal(indexedDB.dump(), before);
    assert.equal(heard, 0);
  });

  test('one notification per commit and one per bulk; unsubscribe stops them', async () => {
    const S = freshStore();
    const heard = [];
    const off = S.subscribe((info) => heard.push(info.label));
    await S.commit('a', (d) => d.put('todos', { id: 't1' }));
    await S.commit('b', (d) => d.put('todos', { id: 't2' }));
    assert.deepEqual(heard, ['a', 'b']);
    await S.bulk(async () => {
      for (let i = 3; i < 8; i++) await S.commit('c' + i, (d) => d.put('todos', { id: 't' + i }));
    });
    assert.deepEqual(heard, ['a', 'b', 'bulk']);
    assert.equal(S.view.count('todos'), 7);
    off();
    await S.commit('d', (d) => d.put('todos', { id: 't9' }));
    assert.equal(heard.length, 3);
  });

  test('indexeddb: every store made in one upgrade; with a PIN the rows hold only their key, iv and ct; a reload keeps them locked', async () => {
    const idb = globalThis.indexedDB = fakeIndexedDB();
    let persisted = 0;
    Object.defineProperty(globalThis, 'navigator', { configurable: true, writable: true,
      value: { storage: { persist: () => { persisted += 1; return Promise.resolve(true); } } } });
    const S = freshStore();
    await S.load();
    assert.equal(S.status().persistence, 'indexeddb');
    assert.deepEqual(idb.storeNames().sort(), Object.keys(S.STORES).sort());
    await addRows(S);
    assert.match(S.status().lastSavedAt, /^\d{4}-\d\d-\d\dT/);
    assert.match(UI.savedText(S.status(), true), /^Saved on this device/);
    assert.ok(idb.dump().includes(MARK), 'without a PIN the rows are plain (a PIN is offered, never forced)');
    await S.lock.set('2468');
    assert.equal(persisted, 1, 'storage persistence is asked for once, on the first write');
    const dump = idb.dump();
    assert.ok(!dump.includes(MARK) && !dump.includes('Asha') && !dump.includes('CravingLogged'), 'no plaintext of a row');
    for (const r of idb.rows('events').concat(idb.rows('profile'))) {
      assert.deepEqual(Object.keys(r).sort(), [r.id ? 'id' : 'key', 'enc'].sort());
      assert.deepEqual(Object.keys(r.enc).sort(), ['ct', 'iv']);
      assert.equal(Buffer.from(r.enc.iv, 'base64').length, 12);
    }
    const lockRow = idb.rows('meta').find((r) => r.key === 'lock');
    assert.deepEqual(Object.keys(lockRow).sort(), ['autoLockMin', 'check', 'iterations', 'key', 'salt', 'setAt']);
    assert.equal(lockRow.iterations, 310000);
    assert.equal(Buffer.from(lockRow.salt, 'base64').length, 16);
    assert.equal(lockRow.autoLockMin, 5, 'auto-lock defaults to 5 minutes');
    const iv1 = idb.rows('events').find((r) => r.id === 'e1').enc.iv;
    await S.commit('again', (d) => d.put('events', d.get('events', 'e1')));
    assert.notEqual(idb.rows('events').find((r) => r.id === 'e1').enc.iv, iv1, 'a fresh iv for every row write');
    const R = freshStore(); // the page reloads
    await R.load();
    assert.deepEqual(R.status(), { persistence: 'indexeddb', lastSavedAt: null, hasLock: true, locked: true, autoLockMin: 5, unreadable: 0 });
    assert.equal(R.view.get('profile', 'me'), null);
    assert.equal(R.view.count('events'), 0);
    assert.equal(await R.lock.unlock('2468'), true);
    assert.equal(R.view.get('profile', 'me').name, 'Asha ' + MARK);
    assert.equal(R.view.get('events', 'e1').note, MARK);
  });

  test('lock: lockNow drops the rows and tells onLock; locked reads are empty and writes refused; unlock restores', async () => {
    const S = freshStore();
    await addRows(S);
    await assert.rejects(S.lock.set('12'), (e) => e.code === 'BAD_PIN');
    assert.equal(S.status().hasLock, false, 'a refused PIN sets nothing');
    S.lock.lockNow();
    assert.equal(S.status().locked, false, 'with no PIN there is nothing to lock');
    await S.lock.set('2468', { autoLockMin: 'never' });
    const heard = [];
    S.lock.onLock((info) => heard.push(info.reason));
    S.lock.lockNow();
    assert.deepEqual(heard, ['manual']);
    assert.deepEqual(S.status(), { persistence: 'memory', lastSavedAt: null, hasLock: true, locked: true, autoLockMin: 0, unreadable: 0 });
    assert.equal(S.view.get('profile', 'me'), null);
    assert.deepEqual(S.view.list('events'), []);
    assert.equal(S.view.count('events'), 0);
    await assert.rejects(S.commit('x', (d) => d.put('todos', { id: 't1' })), (e) => e.code === 'LOCKED');
    assert.throws(() => S.exportJson(), (e) => e.code === 'LOCKED');
    await assert.rejects(S.replaceAll({ stores: {} }), (e) => e.code === 'LOCKED');
    await assert.rejects(S.lock.set('1357'), (e) => e.code === 'LOCKED');
    assert.equal(await S.lock.unlock('2468'), true);
    assert.equal(S.status().locked, false);
    assert.equal(S.view.get('profile', 'me').name, 'Asha ' + MARK);
    assert.equal(S.view.count('todos'), 0, 'the refused write never happened');
  });

  test('a wrong PIN is refused by unlock, verify and remove, and changes nothing; the right one removes the lock', async () => {
    const idb = globalThis.indexedDB = fakeIndexedDB();
    const S = freshStore();
    await addRows(S);
    assert.equal(await S.lock.verify('2468'), false, 'no lock: nothing to verify');
    await S.lock.set('2468');
    const before = idb.dump();
    assert.equal(await S.lock.verify('1111'), false);
    assert.equal(await S.lock.remove('1111'), false);
    assert.equal(S.status().hasLock, true);
    assert.equal(idb.dump(), before);
    S.lock.lockNow();
    for (const wrong of ['1111', '', null, '24680']) assert.equal(await S.lock.unlock(wrong), false);
    assert.equal(S.status().locked, true);
    assert.equal(S.view.count('events'), 0);
    assert.equal(idb.dump(), before, 'wrong PINs wrote nothing');
    assert.equal(await S.lock.verify('2468'), true);
    assert.equal(S.status().locked, true, 'verify never unlocks');
    assert.equal(await S.lock.remove('2468'), true, 'remove works from the lock screen too');
    assert.equal(S.status().hasLock, false);
    assert.equal(S.status().locked, false);
    assert.equal(S.view.get('events', 'e1').note, MARK);
    assert.ok(idb.dump().includes(MARK), 'the rows are stored plain again');
    assert.ok(!idb.rows('meta').some((r) => r.key === 'lock'), 'the lock row is gone');
  });

  test('localstorage fallback and memory: the label says where the data is; sealed rows stay sealed in the snapshot', async () => {
    const idb = globalThis.indexedDB = fakeIndexedDB();
    idb.failOpen = true;
    const ls = globalThis.localStorage = fakeLocalStorage();
    const S = freshStore();
    await addRows(S);
    assert.equal(S.status().persistence, 'localstorage');
    assert.equal(UI.savedText(S.status(), true), 'Saved (fallback)');
    assert.ok(ls.getItem('1-addic:snapshot').includes(MARK));
    await S.lock.set('2468');
    assert.ok(!ls.getItem('1-addic:snapshot').includes(MARK), 'no plaintext in the snapshot with a PIN');
    const R = freshStore();
    await R.load();
    assert.equal(R.status().locked, true);
    assert.equal(await R.lock.unlock('2468'), true);
    assert.equal(R.view.get('events', 'e1').note, MARK);
    ls.full = true;
    await assert.rejects(R.commit('full', (d) => d.put('todos', { id: 't1' })), (e) => e.code === 'WRITE_FAILED');
    assert.equal(R.view.count('todos'), 0);
    delete globalThis.localStorage; // nothing works: memory, said plainly
    const M = freshStore();
    await M.load();
    assert.equal(M.status().persistence, 'memory');
    assert.match(UI.savedText(M.status(), true), /^Not saved/);
  });

  test('snapshot adoption: an empty IndexedDB takes the snapshot’s rows as they are and the snapshot goes; a full one leaves it', async () => {
    const idb = globalThis.indexedDB = fakeIndexedDB();
    idb.failOpen = true;
    const ls = globalThis.localStorage = fakeLocalStorage();
    const F = freshStore();
    await addRows(F);
    await F.lock.set('2468');
    idb.failOpen = false; // the next visit, IndexedDB works
    const S = freshStore();
    await S.load();
    assert.equal(S.status().persistence, 'indexeddb');
    assert.equal(ls.getItem('1-addic:snapshot'), null, 'the snapshot is removed once adopted');
    assert.equal(S.status().locked, true, 'sealed rows came across sealed, with their lock');
    assert.ok(!idb.dump().includes(MARK));
    assert.equal(await S.lock.unlock('2468'), true);
    assert.equal(S.view.get('events', 'e1').note, MARK);
    ls.setItem('1-addic:snapshot', JSON.stringify({ app: '1-addic', v: 1, stores: { todos: [{ id: 'old' }] } }));
    const T = freshStore();
    await T.load();
    assert.ok(ls.getItem('1-addic:snapshot'), 'a non-empty IndexedDB never overwrites or drops a snapshot');
    assert.equal(await T.lock.unlock('2468'), true);
    assert.deepEqual(T.view.get('todos', 'old'), { id: 'old' }, 'RS1: with the key in hand its rows are sealed in');
    assert.equal(ls.getItem('1-addic:snapshot'), null, 'RS1: and the plain copy goes');
  });

  test('exportJson, replaceAll (replaces, never merges, keeps the lock) and resetAll (also the forgotten-PIN path)', async () => {
    const idb = globalThis.indexedDB = fakeIndexedDB();
    const ls = globalThis.localStorage = fakeLocalStorage();
    const S = freshStore();
    await addRows(S);
    await S.lock.set('2468');
    const out = S.exportJson();
    assert.deepEqual(Object.keys(out), ['app', 'schemaVersion', 'exportedAt', 'stores']);
    assert.equal(out.app, '1-addic');
    assert.equal(out.schemaVersion, 1);
    assert.ok(!Number.isNaN(Date.parse(out.exportedAt)));
    assert.deepEqual(Object.keys(out.stores).sort(), Object.keys(S.STORES).sort());
    assert.equal(out.stores.events.find((e) => e.id === 'e1').note, MARK, 'export holds the decrypted rows');
    assert.equal(out.stores.meta.length, 0, 'never the lock row');
    const heard = [];
    S.subscribe((i) => heard.push(i.label));
    await assert.rejects(S.replaceAll({ stores: { events: 'nope' } }), (e) => e.code === 'BAD_BACKUP');
    await assert.rejects(S.replaceAll({ stores: { events: [{ type: 'no id' }] } }), (e) => e.code === 'BAD_ROW');
    assert.equal(S.view.count('events'), 2, 'a refused backup changes nothing');
    await S.replaceAll({ app: '1-addic', schemaVersion: 1, stores: { todos: [{ id: 'n1', text: 'NEW-ROW' }],
      meta: [{ key: 'lock', salt: 'x', check: 'x' }] } });
    assert.deepEqual(heard, ['replaceAll']);
    assert.equal(S.view.count('events'), 0, 'replaced, never merged');
    assert.equal(S.view.get('todos', 'n1').text, 'NEW-ROW');
    assert.equal(S.status().hasLock, true, 'the lock stays');
    assert.ok(!idb.dump().includes('NEW-ROW'), 'the new rows are sealed under it');
    // C4: the lock row outlives the import: a reload is locked, a wrong PIN opens nothing, the same PIN opens it all
    const R = freshStore();
    await R.load();
    assert.equal(R.status().locked, true, 'a reload after the import is still locked');
    assert.equal(R.view.get('todos', 'n1'), null);
    assert.equal(await R.lock.unlock('1357'), false, 'a wrong PIN is refused');
    assert.equal(R.status().locked, true);
    assert.equal(R.view.get('todos', 'n1'), null, 'and opens nothing');
    assert.equal(await R.lock.unlock('2468'), true, 'the same PIN opens the imported rows');
    assert.equal(R.view.get('todos', 'n1').text, 'NEW-ROW');
    assert.equal(R.view.count('events'), 0, 'replaced, never merged, after a reload too');
    R.lock.lockNow();
    S.lock.lockNow();
    ls.setItem('1-addic:snapshot', '{"app":"1-addic","stores":{}}');
    await S.resetAll(); // Forgot PIN: erase, then start again from a backup
    assert.deepEqual(S.status(), { persistence: 'indexeddb', lastSavedAt: null, hasLock: false, locked: false, autoLockMin: null, unreadable: 0 });
    assert.equal(S.view.count('todos'), 0);
    for (const n of Object.keys(S.STORES)) assert.equal(idb.rows(n).length, 0, n + ' is empty');
    assert.equal(ls.getItem('1-addic:snapshot'), null);
  });

  test('C5: resetAll removes the discreet flag 1-addic:discreet, with IndexedDB and in the fallback', async () => {
    globalThis.indexedDB = fakeIndexedDB();
    const ls = globalThis.localStorage = fakeLocalStorage();
    ls.setItem('1-addic:discreet', '1');
    const S = freshStore();
    await S.load();
    await S.lock.set('2468');
    S.lock.lockNow();
    await S.resetAll(); // Forgot PIN: the flag goes with the data
    assert.equal(ls.getItem('1-addic:discreet'), null);
    globalThis.indexedDB = fakeIndexedDB();
    globalThis.indexedDB.failOpen = true;
    ls.setItem('1-addic:discreet', '1');
    const T = freshStore();
    await T.load();
    assert.equal(T.status().persistence, 'localstorage');
    await T.resetAll();
    assert.equal(ls.getItem('1-addic:discreet'), null);
  });

  test('RS5: resetAll in a fallback session also deletes the IndexedDB database, so a later visit finds nothing', async () => {
    const idb = globalThis.indexedDB = fakeIndexedDB();
    globalThis.localStorage = fakeLocalStorage();
    const S = freshStore();
    await S.load();
    await addRows(S);
    assert.equal(S.status().persistence, 'indexeddb');
    idb.failOpen = true; // the next visit, IndexedDB does not open
    const T = freshStore();
    await T.load();
    assert.equal(T.status().persistence, 'localstorage');
    await T.resetAll(); // Erase everything, or Forgot PIN
    idb.failOpen = false; // a third visit, IndexedDB works again
    const U = freshStore();
    await U.load();
    assert.equal(U.status().persistence, 'indexeddb');
    assert.equal(U.view.count('events'), 0);
    assert.equal(U.view.get('profile', 'me'), null);
    assert.ok(!idb.dump().includes(MARK), 'nothing of the erased rows stays on the device');
  });

  test('RS5: a delete that fails or stays blocked rejects with ERASE_PARTIAL; the snapshot and the flag still go', async (t) => {
    for (const how of ['fail', 'blocked']) {
      const idb = globalThis.indexedDB = fakeIndexedDB();
      const ls = globalThis.localStorage = fakeLocalStorage();
      idb.failOpen = true;
      const T = freshStore();
      await T.load();
      await addRows(T);
      ls.setItem('1-addic:discreet', '1');
      assert.ok(ls.getItem('1-addic:snapshot'));
      idb.failDelete = how;
      t.mock.timers.enable({ apis: ['setTimeout'] });
      const p = T.resetAll();
      const caught = p.then(() => null, (e) => e);
      for (let i = 0; i < 20; i++) await new Promise((r) => setImmediate(r));
      t.mock.timers.tick(60000);
      const err = await caught;
      t.mock.timers.reset();
      assert.ok(err, how + ': resetAll does not claim a full erase');
      assert.equal(err.code, 'ERASE_PARTIAL', how);
      assert.equal(ls.getItem('1-addic:snapshot'), null, how + ': the snapshot is erased');
      assert.equal(ls.getItem('1-addic:discreet'), null, how);
      assert.equal(T.view.count('events'), 0, how);
    }
  });

  test('auto-lock after the idle minutes; touch keeps it open; a touch after the limit (a phone that slept) locks', async (t) => {
    const S = freshStore();
    await addRows(S);
    await S.lock.set('2468', { autoLockMin: 1 });
    const heard = [];
    S.lock.onLock((info) => heard.push(info.reason));
    t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: Date.now() });
    S.lock.touch();
    t.mock.timers.tick(59000);
    S.lock.touch();
    t.mock.timers.tick(59000);
    assert.equal(S.status().locked, false, 'activity keeps it open');
    t.mock.timers.tick(1000);
    assert.equal(S.status().locked, true);
    assert.deepEqual(heard, ['auto']);
    assert.equal(S.view.count('events'), 0);
    assert.equal(await S.lock.unlock('2468'), true);
    t.mock.timers.setTime(Date.now() + 120000); // time passes without the timer running
    S.lock.touch();
    assert.equal(S.status().locked, true);
    assert.deepEqual(heard, ['auto', 'auto']);
  });

  test('RC1, RS2: a lock while a new PIN is derived erases nothing; the change completes and the new PIN opens every row', async () => {
    const idb = globalThis.indexedDB = fakeIndexedDB();
    const S = freshStore();
    await S.load();
    await addRows(S);
    await S.lock.set('1357');
    const sub = globalThis.crypto.subtle;
    let hook = () => S.lock.lockNow(); // the idle timer, or 'Lock now', fires while the new key is derived
    sub.deriveKey = async function (...a) {
      const k = await Object.getPrototypeOf(sub).deriveKey.apply(this, a);
      const f = hook;
      hook = null;
      if (f) f();
      return k;
    };
    try {
      await S.lock.set('2468');
    } finally {
      delete sub.deriveKey;
    }
    assert.equal(hook, null, 'the lock fired inside the derivation');
    assert.equal(S.status().locked, true);
    assert.equal(idb.rows('events').length, 2, 'no row erased');
    assert.ok(!idb.dump().includes(MARK), 'every row still sealed');
    const R = freshStore(); // a reload
    await R.load();
    assert.equal(await R.lock.unlock('1357'), false, 'the old PIN no longer opens');
    assert.equal(await R.lock.unlock('2468'), true);
    assert.equal(R.view.get('profile', 'me').name, 'Asha ' + MARK);
    assert.equal(R.view.count('events'), 2);
  });

  test('RC2, RS3: two tabs on one storage: a tab that has not seen the PIN set, changed or removed writes nothing', async () => {
    const idb = globalThis.indexedDB = fakeIndexedDB();
    const A = freshStore();
    await A.load();
    await addRows(A);
    const B = freshStore(); // the same file in a second tab, opened before the PIN is set
    await B.load();
    const heard = [];
    B.lock.onLock((i) => heard.push(i.reason));
    await A.lock.set('2468');
    const backup = { app: '1-addic', schemaVersion: 1, stores: { events: [{ id: 'b1', type: 'CravingLogged', note: MARK }] } };
    await assert.rejects(B.replaceAll(backup), (e) => e.code === 'LOCKED');
    assert.ok(idb.rows('meta').some((r) => r.key === 'lock'), 'the lock row stays');
    assert.deepEqual(idb.rows('events').map((r) => r.id).sort(), ['e1', 'e2']);
    assert.ok(!idb.dump().includes(MARK), 'no plain row beside the lock');
    assert.equal(B.status().locked, true, 'the second tab takes the stored lock');
    assert.deepEqual(heard, ['auto']);
    assert.equal(await B.lock.unlock('2468'), true);
    assert.equal(B.view.get('profile', 'me').name, 'Asha ' + MARK);
    await A.lock.set('1357'); // the PIN changed in the first tab
    await assert.rejects(B.commit('t', (d) => d.put('events', { id: 'e3', type: 'CravingLogged' })), (e) => e.code === 'LOCKED');
    assert.equal(idb.rows('events').length, 2, 'no row sealed under the old key');
    B.lock.lockNow();
    A.lock.lockNow();
    const C = freshStore(); // a third tab, loaded now
    await C.load();
    await A.lock.unlock('1357');
    await A.lock.set('9753'); // changed again while the other tabs are locked
    assert.equal(await C.lock.unlock('9753'), true, 'a locked tab reads the stored lock before it opens');
    assert.equal(C.view.count('events'), 2);
    assert.equal(await A.lock.remove('9753'), true); // the PIN removed in the first tab
    await assert.rejects(C.commit('t', (d) => d.put('events', { id: 'e4', type: 'CravingLogged', note: MARK })), (e) => e.code === 'LOCKED');
    assert.equal(idb.rows('events').length, 2, 'nothing written under a removed lock');
    assert.equal(C.status().hasLock, false, 'that tab now knows there is no PIN');
    assert.equal(C.view.get('profile', 'me').name, 'Asha ' + MARK);

    delete globalThis.indexedDB; // the fallback: the snapshot is shared the same way
    globalThis.indexedDB = fakeIndexedDB();
    globalThis.indexedDB.failOpen = true;
    const ls = globalThis.localStorage = fakeLocalStorage();
    const D = freshStore();
    await D.load();
    await addRows(D);
    const E = freshStore();
    await E.load();
    assert.equal(E.status().persistence, 'localstorage');
    await D.lock.set('2468');
    await assert.rejects(E.commit('t', (d) => d.put('events', { id: 'e5', type: 'CravingLogged', note: MARK })), (e) => e.code === 'LOCKED');
    assert.ok(!ls.getItem('1-addic:snapshot').includes(MARK), 'the snapshot holds no plain row beside the lock');
    assert.equal(E.status().locked, true);
    assert.equal(await E.lock.unlock('2468'), true);
    await E.commit('t', (d) => d.put('events', { id: 'e6', type: 'CravingLogged' }));
    assert.equal(await D.lock.unlock('2468'), true);
    assert.equal(JSON.parse(ls.getItem('1-addic:snapshot')).stores.events.length, 3, 'a write keeps what the other tab saved');
  });

  test('RS1: a stale snapshot beside a PIN is sealed into IndexedDB when a key is in hand, and no plain copy stays', async () => {
    const idb = globalThis.indexedDB = fakeIndexedDB();
    const ls = globalThis.localStorage = fakeLocalStorage();
    const S = freshStore();
    await S.load();
    await addRows(S);
    await S.lock.set('2468');
    const stale = (stores) => ls.setItem('1-addic:snapshot', JSON.stringify({ app: '1-addic', v: 1, stores }));
    // a fallback session, while IndexedDB would not open, saved plain rows in the snapshot
    stale({ events: [{ id: 'f1', type: 'CravingLogged', note: MARK + '-fallback' }, { id: 'e1', type: 'CravingLogged', note: 'older' }],
      profile: [{ key: 'me', name: 'older' }] });
    const R = freshStore(); // the next visit: IndexedDB opens again
    await R.load();
    assert.equal(R.status().locked, true);
    assert.equal(await R.lock.unlock('2468'), true);
    assert.equal(ls.getItem('1-addic:snapshot'), null, 'no plain copy stays');
    assert.equal(R.view.get('events', 'f1').note, MARK + '-fallback', 'its rows are kept');
    assert.equal(R.view.get('events', 'e1').note, MARK, 'a row this device has wins');
    assert.equal(R.view.get('profile', 'me').name, 'Asha ' + MARK);
    assert.ok(!idb.dump().includes(MARK) && !idb.dump().includes('older'), 'sealed in IndexedDB');
    const T = freshStore();
    await T.load();
    assert.equal(await T.lock.unlock('2468'), true);
    assert.equal(T.view.count('events'), 3, 'a reload keeps them');

    const idb2 = globalThis.indexedDB = fakeIndexedDB(); // without a PIN the contract leaves it, until a PIN is set
    const U = freshStore();
    await U.load();
    await addRows(U);
    stale({ events: [{ id: 'f2', type: 'CravingLogged', note: MARK }] });
    const V = freshStore();
    await V.load();
    assert.ok(ls.getItem('1-addic:snapshot'), 'no PIN: left as it is');
    await V.lock.set('1357');
    assert.equal(ls.getItem('1-addic:snapshot'), null);
    assert.equal(V.view.get('events', 'f2').note, MARK);
    assert.ok(!idb2.dump().includes(MARK), 'sealed in IndexedDB');
  });

  test('RC3: status() gives the auto-lock minutes in force, so the settings screen can show the choice', async () => {
    const S = freshStore();
    await S.load();
    assert.equal(S.status().autoLockMin, null, 'no PIN, no auto-lock');
    await S.lock.set('2468', { autoLockMin: 15 });
    assert.equal(S.status().autoLockMin, 15);
    await S.lock.set('2468', { autoLockMin: 'never' });
    assert.equal(S.status().autoLockMin, 0, 'never is 0');
    await S.lock.set('2468', { autoLockMin: 7 });
    assert.equal(S.status().autoLockMin, 5, 'anything else means 5');
    S.lock.lockNow();
    assert.equal(S.status().autoLockMin, 5, 'also while locked: the lock row is plain');
    assert.equal(await S.lock.remove('2468'), true);
    assert.equal(S.status().autoLockMin, null);
  });

  test('RC8: the refusal branches: a rule that stages nothing writes nothing; no lock, no opening; a PIN out of bounds', async () => {
    globalThis.indexedDB = fakeIndexedDB();
    const S = freshStore();
    await S.load();
    let heard = 0;
    S.subscribe(() => { heard += 1; });
    assert.equal(typeof S.subscribe('not a function'), 'function', 'a listener that is not a function gets a no-op unsubscribe');
    assert.equal(await S.commit('read only', (d) => d.list('events').length), 0);
    assert.equal(S.status().lastSavedAt, null, 'nothing was written');
    assert.equal(heard, 0, 'and no one was told');
    assert.equal(await S.lock.unlock('2468'), false, 'no lock: unlock, verify and remove are false');
    assert.equal(await S.lock.verify('2468'), false);
    assert.equal(await S.lock.remove('2468'), false);
    for (const bad of ['123', 'x'.repeat(65), 2468, null]) await assert.rejects(S.lock.set(bad), (e) => e.code === 'BAD_PIN');
    assert.equal(S.status().hasLock, false);
    const realError = console.error;
    const errs = [];
    console.error = (...a) => errs.push(a.join(' '));
    try {
      await S.lock.set('x'.repeat(64)); // the longest PIN is taken, and its notification reaches only real listeners
    } finally {
      console.error = realError;
    }
    assert.equal(S.status().hasLock, true);
    assert.equal(heard, 1);
    assert.deepEqual(errs, [], 'the listener that is not a function was never kept');
  });

  test('Q3: view.get and view.list give frozen rows: a change throws and the row stays; drafts are still copies', async () => {
    const S = freshStore();
    await addRows(S);
    const me = S.view.get('profile', 'me');
    assert.equal(Object.isFrozen(me), true);
    assert.throws(() => { me.name = 'changed'; }, TypeError);
    assert.ok(S.view.list('events').every((r) => Object.isFrozen(r)), 'every listed row is frozen');
    assert.throws(() => { S.view.list('events')[0].type = 'changed'; }, TypeError);
    assert.equal(S.view.get('profile', 'me').name, 'Asha ' + MARK, 'the row stays as it was');
    await S.commit('t', (d) => {
      const r = d.get('profile', 'me');
      assert.equal(Object.isFrozen(r), false, 'a draft is a copy the rule may change');
      r.name = 'Asha';
      d.put('profile', r);
    });
    assert.equal(S.view.get('profile', 'me').name, 'Asha');
    assert.equal(Object.isFrozen(S.view.get('profile', 'me')), true);
  });

  const ids = (rows) => rows.map((r) => r.id);
  const cba = (S) => S.commit('t', (d) => { for (const id of ['c', 'a', 'b']) d.put('events', { id, type: 'CravingLogged' }); });
  // IndexedDB, events written c, a, b behind PIN 2468, and the stored row b damaged: it holds a's box, which is sealed
  // for another place, so it will not open. Unlocked again when it returns.
  const damaged = async () => {
    const fake = fakeIndexedDB();
    globalThis.indexedDB = fake;
    const S = freshStore();
    await cba(S);
    await S.lock.set('2468');
    const ev = (id) => fake.rows('events').find((r) => r.id === id);
    ev('b').enc = JSON.parse(JSON.stringify(ev('a').enc));
    const bad = JSON.parse(JSON.stringify(ev('b')));
    S.lock.lockNow();
    assert.equal(await S.lock.unlock('2468'), true);
    return { S, ev, bad };
  };

  test('RC9: list() and exportJson() give rows in key order in every mode, the same after a lock, an unlock and a reload', async () => {
    const M = freshStore(); // memory
    await cba(M);
    assert.deepEqual(ids(M.view.list('events')), ['a', 'b', 'c']);
    assert.deepEqual(ids(M.exportJson().stores.events), ['a', 'b', 'c']);
    await M.lock.set('2468');
    M.lock.lockNow();
    assert.equal(await M.lock.unlock('2468'), true);
    assert.deepEqual(ids(M.view.list('events')), ['a', 'b', 'c'], 'the same ids in the same order after the unlock');
    globalThis.indexedDB = fakeIndexedDB(); // this stand-in gives rows back in the order they were written
    const S = freshStore();
    await cba(S);
    await S.lock.set('2468');
    const T = freshStore(); // a reload
    assert.equal(await T.lock.unlock('2468'), true);
    assert.deepEqual(ids(T.view.list('events')), ['a', 'b', 'c']);
    assert.deepEqual(ids(T.exportJson().stores.events), ['a', 'b', 'c']);
  });

  test('Q4: a row that will not open is kept as stored: lock.set, remove and replaceAll carry it; status() counts it', async () => {
    const { S, ev, bad } = await damaged();
    assert.deepEqual(ids(S.view.list('events')), ['a', 'c']);
    assert.equal(S.status().unreadable, 1);
    assert.deepEqual(ids(S.exportJson().stores.events), ['a', 'c']);
    S.lock.lockNow();
    assert.equal(S.status().unreadable, 0, 'nothing is counted while locked');
    assert.equal(await S.lock.unlock('2468'), true);
    await S.lock.set('1357'); // a new PIN
    assert.deepEqual(ev('b'), bad, 'lock.set kept the row as it was stored');
    S.lock.lockNow();
    assert.equal(await S.lock.unlock('1357'), true);
    assert.equal(S.status().unreadable, 1);
    assert.equal(await S.lock.remove('1357'), true);
    assert.deepEqual(ev('b'), bad, 'remove kept it, sealed as stored');
    assert.equal(ev('a').enc, undefined, 'the rows that opened are plain again');
    const T = freshStore(); // a reload: no lock now, and the row still will not open
    await T.load();
    assert.equal(T.status().unreadable, 1);
    assert.deepEqual(ids(T.view.list('events')), ['a', 'c']);
    await T.replaceAll(T.exportJson());
    assert.deepEqual(ev('b'), bad, 'replaceAll kept it too');
    assert.equal(T.status().unreadable, 1);
    await T.commit('t', (d) => d.del('events', 'b'));
    assert.equal(T.status().unreadable, 0, 'deleted on purpose, it is gone');
    await T.lock.set('2468');
    assert.equal(ev('b'), undefined, 'a deleted row is never written back');
  });

  test('RC11: without crypto.subtle, unlock, verify and remove reject with NO_CRYPTO, count no wrong try and change nothing', async () => {
    const S = freshStore();
    await S.commit('t', (d) => { d.put('events', { id: 'e1', type: 'CravingLogged', note: MARK }); });
    await S.lock.set('2468');
    S.lock.lockNow();
    const real = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
    const c = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', { configurable: true, value: { getRandomValues: (b) => c.getRandomValues(b) } });
    try {
      for (const [name, call] of [['unlock', () => S.lock.unlock('2468')], ['verify', () => S.lock.verify('2468')], ['remove', () => S.lock.remove('2468')]]) {
        await assert.rejects(call(), (e) => e.code === 'NO_CRYPTO', name);
      }
      assert.equal(S.status().locked, true);
      assert.equal(S.status().hasLock, true);
    } finally {
      Object.defineProperty(globalThis, 'crypto', real);
    }
    assert.equal(await S.lock.unlock('2468'), true, 'with crypto back, the PIN opens as before');
    assert.equal(S.view.get('events', 'e1').note, MARK);
  });

  test('Q4: a backup that holds the same id replaces the row that will not open; resetAll leaves nothing to count', async () => {
    const one = await damaged();
    await one.S.replaceAll({ stores: { events: [{ id: 'b', type: 'CravingLogged', note: 'from the backup' }] } });
    assert.equal(one.S.status().unreadable, 0);
    assert.notDeepEqual(one.ev('b'), one.bad, 'the backup’s row replaced the stored one');
    one.S.lock.lockNow();
    assert.equal(await one.S.lock.unlock('2468'), true);
    assert.equal(one.S.view.get('events', 'b').note, 'from the backup');
    const two = await damaged();
    await two.S.resetAll();
    assert.equal(two.S.status().unreadable, 0);
  });
});

/* ── boot.js (the CORE chat's ruling Q2): a start failure still shows urgent help ─────────────── */
describe('boot.js: a start failure shows one line and the urgent-help numbers', () => {
  const BOOT = require.resolve('../src/boot.js');
  const el = (tag) => ({
    tagName: tag.toUpperCase(), children: [], attrs: {}, textContent: '', href: '',
    setAttribute(k, v) { this.attrs[k] = String(v); },
    appendChild(c) { this.children.push(c); return c; },
    replaceChildren(...c) { this.children = c; },
  });
  const run = (ui, content) => {
    const main = el('main');
    globalThis.document = { readyState: 'complete', createElement: el, getElementById: (id) => (id === 'main' ? main : null) };
    if (ui) globalThis.UI = ui;
    if (content) globalThis.Content = content;
    delete require.cache[BOOT];
    require(BOOT);
    return main;
  };
  const text = (n) => [n.textContent].concat(n.children.map(text)).join(' ');
  const links = (n) => n.children.flatMap((c) => (c.tagName === 'A' ? [c.href] : []).concat(links(c)));
  afterEach(() => { for (const k of ['document', 'UI', 'Content']) delete globalThis[k]; });

  test('UI.boot throws: the line, the urgent numbers as tel: links, marked please verify', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] }); // the error is re-thrown later, for the console
    const main = run({ boot() { throw new Error('start failed'); } }, Content);
    assert.match(text(main), /The app did not start/);
    assert.ok(links(main).length >= 1 && links(main).every((h) => /^tel:\+?\d+$/.test(h)), 'tel: links');
    assert.match(text(main), /please verify/i);
    assert.equal(main.children[0].attrs.role, 'alert');
  });

  test('UI.boot rejects and Content is unreadable: the line and the emergency sentence', async (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const main = run({ boot: () => Promise.reject(new Error('start failed')) }, null);
    await new Promise((res) => setImmediate(res));
    assert.match(text(main), /The app did not start\. If you are in danger, call your local emergency number\./);
  });

  test('C1: the start-failure lines live in one block marked clinicalReview: true, and the page shows them from it', (t) => {
    const src = fs.readFileSync(BOOT, 'utf8');
    const block = (src.match(/var COPY = \{([\s\S]*?)\n {2}\};/) || [])[1] || '';
    assert.match(block, /clinicalReview: true/);
    for (const s of ['The app did not start. If you are in danger, call your local emergency number.',
      'The app did not start. For urgent help, call:', 'Please verify these numbers.']) {
      assert.ok(block.includes(s), 'in the block: ' + s);
      assert.equal(src.split(s).length, 2, 'written once: ' + s);
    }
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const main = run({ boot() { throw new Error('start failed'); } }, Content);
    assert.match(text(main), /For urgent help, call:/);
  });

  test('no ui-core in the build: the bare shell stays, quietly', () => {
    const main = run(null, Content);
    assert.equal(main.children.length, 0);
  });
});
