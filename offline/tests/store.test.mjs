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
    ['coach', 'div'], ['toasts', 'div'], ['dialog', 'dialog'], ['settings-btn', 'a'], ['theme-btn', 'button']]) {
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
        const t = { error: null };
        const ops = [];
        const request = (fn) => { const r = {}; ops.push(() => { r.result = fn(); if (r.onsuccess) r.onsuccess(); }); return r; };
        t.objectStore = (n) => {
          const st = rec.stores.get(n);
          return {
            getAll: () => request(() => Array.from(st.rows.values()).map(cp)),
            put: (row) => request(() => { st.rows.set(row[st.keyPath], cp(row)); }),
            delete: (id) => request(() => { st.rows.delete(id); }),
            clear: () => request(() => { st.rows.clear(); }),
          };
        };
        setTimeout(() => {
          if (fake.failWrites && mode === 'readwrite') { t.error = new Error('QuotaExceededError'); t.onerror && t.onerror(); return; }
          for (const op of ops) op();
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
    assert.deepEqual(S.status(), { persistence: 'memory', lastSavedAt: null, hasLock: false, locked: false });
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
    assert.deepEqual(R.status(), { persistence: 'indexeddb', lastSavedAt: null, hasLock: true, locked: true });
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
    assert.deepEqual(S.status(), { persistence: 'memory', lastSavedAt: null, hasLock: true, locked: true });
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
    await T.lock.unlock('2468');
    assert.equal(T.view.get('todos', 'old'), null);
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
    assert.deepEqual(S.status(), { persistence: 'indexeddb', lastSavedAt: null, hasLock: false, locked: false });
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
});
