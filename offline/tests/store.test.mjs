// Lane core's Node tests (node:test, no dependencies). Real modules are loaded by path; every stand-in (a fake
// Store, Engine, localStorage or speech engine) is defined inside this file and removed after its test.
// U-03: the UI core in Node (no DOM). U-04 adds the encrypted store's tests below.
import { describe, test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const UI = require('../src/ui-core.js');
const Content = require('../src/content-core.js');

const STAND_INS = ['Store', 'Engine', 'Actions', 'Content', 'location', 'localStorage', 'window', 'SpeechSynthesisUtterance'];
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
