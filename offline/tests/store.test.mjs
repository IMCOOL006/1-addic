// Lane core's Node tests (node:test, no dependencies). Real modules are loaded by path; every stand-in (a fake
// Store, Engine, localStorage or speech engine) is defined inside this file and removed after its test.
// U-03: the UI core in Node (no DOM). U-04 adds the encrypted store's tests below.
import { describe, test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

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
      'empty', 'go', 'route', 'render', 'ctx', 'applyTheme', 'night', 'speak', 'stopSpeaking', 'printDoc', 'download', 'boot'];
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
});
