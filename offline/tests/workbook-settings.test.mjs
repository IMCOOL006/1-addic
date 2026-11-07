// Lane workbook-settings's Node tests (node:test, no dependencies). U-19: Settings (offline/src/ui-settings.js,
// tracks/SCREENS/contracts/workbook-settings.md). The pure helpers, a smoke render of every tab on a tiny stand-in
// DOM (the node tree a page returns, as learn.test.mjs does), and round trips through the real Actions and the real
// Store in memory mode. The real screens are proven by tests-docs' browser harness.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const src = (f) => join(SRC, f);

globalThis.Content = require(src('content-core.js'));
for (const f of readdirSync(SRC).filter((n) => /^content-.+\.js$/.test(n) && n !== 'content-core.js').sort()) require(src(f));
globalThis.Engine = require(src('engine.js'));
globalThis.Store = require(src('store.js'));
globalThis.Actions = require(src('actions.js'));
const P = require(src('ui-settings.js'));

/* ── a tiny stand-in DOM: enough for the settings tabs to render and their controls to fire ─────── */
function fakeDom() {
  class Node {
    constructor(tag) { this.tagName = tag; this.nodeType = tag === '#text' ? 3 : 1; this.children = []; this.attrs = {}; this.on = {}; this.style = {}; this.dataset = {}; this.hidden = false; this._text = ''; this.parentNode = null;
      this.classList = { toggle: () => {}, add: () => {}, remove: () => {}, contains: () => false }; }
    appendChild(c) { this.children.push(c); c.parentNode = this; return c; }
    setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'hidden') this.hidden = true; }
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null; }
    removeAttribute(k) { delete this.attrs[k]; }
    addEventListener(t, fn) { (this.on[t] = this.on[t] || []).push(fn); }
    fire(t) { const e = { type: t, preventDefault() {}, key: '' }; (this.on[t] || []).forEach((fn) => fn(e)); }
    focus() {}
    set textContent(v) { this.children = []; this._text = String(v); }
    get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
    all(pred, out = []) { for (const c of this.children) { if (pred(c)) out.push(c); c.all(pred, out); } return out; }
    querySelector() { return null; }
    querySelectorAll() { return []; }
  }
  return { createElement: (t) => new Node(t), createElementNS: (n, t) => new Node(t), createTextNode: (s) => { const n = new Node('#text'); n._text = String(s); return n; },
    getElementById: () => null, contains: () => false, activeElement: null };
}
globalThis.document = fakeDom();

// ui-core and ui-settings are classic scripts: load them as the browser does (their DOM functions are not exported).
const classic = (file, name) => vm.runInThisContext(`(function () {
${readFileSync(src(file), 'utf8')}
return ${name};
})()`, { filename: src(file) });
const REAL_UI = classic('ui-core.js', 'UI');
const calls = { downloads: [], toasts: [], go: [], printed: [], theme: [], discreet: [], sheets: [], confirms: [] };
let confirmAnswer = true;
globalThis.UI = Object.assign({}, REAL_UI, {
  pages: {},
  toast: (m, t) => { calls.toasts.push([m, t]); },
  go: (r) => { calls.go.push(r); },
  render: () => {},
  printDoc: (n) => { calls.printed.push(n); },
  download: (name, text, mime) => { calls.downloads.push({ name, text, mime }); return true; },
  applyTheme: (t) => { calls.theme.push(t); return t; },
  applyDiscreet: (v) => { calls.discreet.push(v); return v; },
  confirm: async (o) => { calls.confirms.push(o); return confirmAnswer; },
  sheet: (title, body, o) => { const s = { title, body, closed: null, el: {}, close: (w) => { if (s.closed) return; s.closed = w; o.onClose(w); } }; calls.sheets.push(s); return s; },
});
const SUI = classic('ui-settings.js', 'SettingsUI');

const S = () => globalThis.Store;
const tick = () => new Promise((r) => setTimeout(r, 0));
async function until(fn, ms = 20000) {
  const t0 = Date.now();
  while (!fn()) { if (Date.now() - t0 > ms) throw new Error('timed out'); await new Promise((r) => setTimeout(r, 10)); }
}
const ctx = (tab) => ({ view: S().view, settings: S().view.get('settings', 'app') || {}, profile: S().view.get('profile', 'me') || {},
  route: { parts: tab == null ? ['settings'] : ['settings', tab], query: {} }, now: new Date() });
const hooks = (node) => node.all((n) => n.getAttribute && n.getAttribute('data-test') !== null).map((n) => n.getAttribute('data-test'));
const byTest = (node, id) => node.all((n) => n.getAttribute && n.getAttribute('data-test') === id)[0];
function snapshot(stores) {
  const out = {};
  for (const name of Object.keys(stores).sort()) {
    if (name === 'meta') continue;
    out[name] = [...stores[name]].sort((a, b) => String(a.id ?? a.key).localeCompare(String(b.id ?? b.key)));
  }
  return out;
}
function lastSheet() { return calls.sheets[calls.sheets.length - 1]; }
async function fillSheet(values) {
  const s = lastSheet();
  for (const [k, v] of Object.entries(values)) { const i = byTest(s.body, k); assert.ok(i, 'sheet field ' + k); i.value = v; }
  s.body.fire('submit');
}
const sheetError = (s) => s.body.all((n) => n.getAttribute && n.getAttribute('role') === 'alert')[0];

test('workbook-settings: pure helpers', () => {
  assert.equal(P.normalTab('data'), 'data');
  assert.equal(P.normalTab('LOOK'), 'look');
  for (const bad of [undefined, null, '', 'nope', 'constructor']) assert.equal(P.normalTab(bad), 'privacy');
  assert.deepEqual(P.TABS.map((t) => t.id), ['privacy', 'look', 'rhythm', 'names', 'help', 'about', 'data']);
  for (const ok of ['1234', '000000', '123456789012']) assert.equal(P.pinOk(ok), true, ok);
  for (const bad of ['123', '1234567890123', '12a4', ' 1234', '', null, 1234]) assert.equal(P.pinOk(bad), false, String(bad));
  assert.equal(P.pinError('1234', '1234'), '');
  assert.equal(P.pinError('1234', '4321'), P.TEXT.pinSame);
  assert.equal(P.pinError('12', '12'), P.TEXT.pinRule);
  assert.equal(P.backupName(new Date(2026, 10, 7, 23, 59)), '1-addic-2026-11-07.json');
  assert.match(P.backupName(), /^1-addic-\d{4}-\d{2}-\d{2}\.json$/);
  const rows = P.logRows([
    { id: 'a', type: 'craving', at: '2026-11-01T08:00:00.000Z', date: '2026-11-01', intensity: 6, feelings: [], skills: ['surf'] },
    { id: 'b', type: 'checkin', at: '2026-11-03T08:00:00.000Z', date: '2026-11-03', checkin: { kind: 'evening', mood: 3 } },
    { id: 'c', type: 'craving', at: '2026-11-04T08:00:00.000Z', date: '2026-11-04', intensity: 2, drill: true },
    null, { id: 'd' },
  ]);
  assert.deepEqual(rows.map((r) => r.date), ['2026-11-03', '2026-11-01'], 'newest first, drills and broken rows left out');
  assert.equal(rows[0].kind, 'Check-in');
  assert.match(rows[1].detail, /strength 6\/10/);
  assert.equal(P.ERASE_PARTIAL_TEXT, 'Most of your notebook was erased, but an older copy may still be on this device. Close other tabs of this file and erase again.');
  assert.equal(P.errorText({ code: 'ERASE_PARTIAL' }), P.ERASE_PARTIAL_TEXT);
  assert.equal(P.TEXT.pinHelp, 'Set a PIN before you write anything private.');
  assert.equal(P.TEXT.eraseSampleLater, 'Erasing only the sample comes with the next update. Erase everything removes it too.');
  assert.equal(P.importErrorText({ errors: ['a', 'b', 'c', 'd'] }), 'This file is not a backup this app can read. a; b; c.');
  assert.equal(P.ABOUT.clinicalReview, true, 'the About safety line is marked for clinical review');
});

test('workbook-settings: the source reads globals safely and never writes HTML', () => {
  const text = readFileSync(src('ui-settings.js'), 'utf8');
  const never = (re, why) => assert.ok(!re.test(text), why + ' (' + re + ')');
  never(/globalThis\.(Content|Engine|Store|Actions)/, 'globals are read with typeof');
  never(/innerHTML|outerHTML|insertAdjacentHTML|document\.write/, 'text only');
  never(/\b(Store|S)\.(replaceAll|resetAll|commit)\(/, 'data actions go through Actions only');
  never(/\baddicts?\b/i, 'person-first');
  never(/fetch\(|XMLHttpRequest|sendBeacon|WebSocket/, 'no network');
  never(/console\.(log|info|debug)/, 'nothing is logged, a PIN least of all');
  // A guard: in a fresh context with no globals, loading the file does not throw a ReferenceError. It only loads
  // (the screens need UI.h); the tab renders run on the stand-in DOM in the next test.
  const sandbox = { module: { exports: {} } };
  vm.runInNewContext(text, sandbox, { filename: 'ui-settings.js' });
  assert.equal(typeof sandbox.module.exports.normalTab, 'function');
});

test('workbook-settings: every tab renders with its hooks; unknown tab is privacy (stand-in DOM)', async () => {
  await S().resetAll();
  assert.equal(typeof UI.pages.settings, 'function', 'UI.pages.settings registers from ui-settings.js');
  const want = {
    privacy: ['set-pin', 'discreet-toggle', 'store-status'],
    look: ['theme-system', 'theme-light', 'theme-dark', 'calm-toggle', 'contrast-toggle', 'motion-toggle', 'counters-toggle', 'run-toggle', 'text-size-large'],
    rhythm: ['checkin-morning', 'review-day', 'pace', 'custom-per-week', 'rhythm-save'],
    names: ['name-input', 'companion-input', 'term-select', 'names-save'],
    help: ['tips-toggle', 'show-all-toggle'],
    about: ['early-notice', 'version'],
    data: ['export-btn', 'import-file', 'erase-all', 'erase-sample', 'load-sample', 'print-logs', 'backup-reminder', 'last-backup'],
  };
  for (const tab of Object.keys(want)) {
    const page = UI.pages.settings(ctx(tab));
    const hs = hooks(page);
    for (const t of P.TABS) assert.ok(hs.includes('settings-tab-' + t.id), `${tab}: tab link ${t.id}`);
    for (const h of want[tab]) assert.ok(hs.includes(h), `${tab}: hook ${h}`);
    const current = page.all((n) => n.getAttribute && n.getAttribute('aria-current') === 'page');
    assert.equal(current.length, 1); assert.equal(current[0].getAttribute('data-test'), 'settings-tab-' + tab);
    const buttons = page.all((n) => n.tagName === 'button');
    for (const b of buttons) assert.ok(b.on.click || b.getAttribute('type') === 'submit' || b.getAttribute('disabled') !== null, `${tab}: no dead button (${b.textContent})`);
  }
  for (const r of [ctx(null), ctx('nope')]) assert.equal(UI.pages.settings(r).all((n) => n.getAttribute && n.getAttribute('aria-current') === 'page')[0].getAttribute('data-test'), 'settings-tab-privacy');
  const privacy = UI.pages.settings(ctx('privacy'));
  assert.match(privacy.textContent, /Set a PIN before you write anything private\./);
  const about = UI.pages.settings(ctx('about'));
  assert.match(byTest(about, 'version').textContent, new RegExp(Content.version.replace(/\./g, '\\.')));
  assert.equal(about.all((n) => n.tagName === 'ol')[0].children.length, Content.references.length, 'one entry per reference');
  assert.match(about.textContent, /not been clinically tested and it is not medical advice/);
  const help = UI.pages.settings(ctx('help'));
  assert.equal(help.all((n) => n.tagName === 'details').length, Content.help.length);
  if (typeof globalThis.GuidanceUI === 'undefined') assert.ok(byTest(help, 'tour-later') && byTest(help, 'drills-later'), 'tour and drills say they come later');
});

test('workbook-settings: settings persist through Actions.settings.patch', async () => {
  await S().resetAll();
  let page = UI.pages.settings(ctx('look'));
  const dark = byTest(page, 'theme-dark'); dark.checked = true; dark.fire('change');
  await until(() => (S().view.get('settings', 'app') || {}).theme === 'dark');
  assert.equal(calls.theme.at(-1), 'dark', 'the theme is applied');
  page = UI.pages.settings(ctx('look'));
  assert.equal(byTest(page, 'theme-dark').checked, true, 'the saved theme is shown');
  for (const [hook, key] of [['calm-toggle', 'calm'], ['contrast-toggle', 'highContrast'], ['motion-toggle', 'reducedMotion'], ['run-toggle', 'showCurrentRun']]) {
    const b = byTest(UI.pages.settings(ctx('look')), hook); b.checked = true; b.fire('change');
    await until(() => (S().view.get('settings', 'app') || {})[key] === true);
  }
  const large = byTest(UI.pages.settings(ctx('look')), 'text-size-larger'); large.checked = true; large.fire('change');
  await until(() => S().view.get('settings', 'app').textSize === 'larger');
  const disc = byTest(UI.pages.settings(ctx('privacy')), 'discreet-toggle'); disc.checked = true; disc.fire('change');
  await until(() => S().view.get('settings', 'app').discreet === true);
  assert.equal(calls.discreet.at(-1), true, 'the discreet flag is written for the lock screen');
  const tips = byTest(UI.pages.settings(ctx('help')), 'tips-toggle'); tips.checked = false; tips.fire('change');
  await until(() => S().view.get('settings', 'app').tips === false);
  const about = UI.pages.settings(ctx('about'));
  byTest(about, 'early-notice-ok').fire('click');
  await until(() => S().view.get('settings', 'app').earlyNoticeSeen === true);
  assert.equal(byTest(UI.pages.settings(ctx('about')), 'early-notice-ok'), undefined, 'the notice is marked seen');
  const remind = byTest(UI.pages.settings(ctx('data')), 'backup-reminder'); remind.checked = false; remind.fire('change');
  await until(() => typeof S().view.get('settings', 'app').backupReminderDismissedAt === 'string');
});

test('workbook-settings: names and rhythm save through Actions.onboard', async () => {
  await S().resetAll();
  let page = UI.pages.settings(ctx('names'));
  byTest(page, 'name-input').value = '  Sam ';
  byTest(page, 'companion-input').value = 'Juno';
  byTest(page, 'term-select').value = 'clean';
  page.all((n) => n.tagName === 'form')[0].fire('submit');
  await until(() => (S().view.get('profile', 'me') || {}).name === 'Sam');
  assert.equal(S().view.get('profile', 'me').companion, 'Juno');
  assert.equal(S().view.get('profile', 'me').term, 'clean');
  page = UI.pages.settings(ctx('rhythm'));
  byTest(page, 'checkin-morning').value = '07:30';
  byTest(page, 'review-day').value = '3';
  byTest(page, 'pace').value = 'custom';
  byTest(page, 'custom-per-week').value = '9';
  page.all((n) => n.tagName === 'form')[0].fire('submit');
  await tick();
  assert.match(page.textContent, /choose 1 to 7 steps a week/, 'a bad custom pace is said plainly');
  byTest(page, 'custom-per-week').value = '3';
  page.all((n) => n.tagName === 'form')[0].fire('submit');
  await until(() => S().view.get('profile', 'me').pace === 'custom');
  const p = S().view.get('profile', 'me');
  assert.equal(p.customPerWeek, 3); assert.equal(p.reviewDay, 3); assert.equal(p.checkin.morning, '07:30'); assert.equal(p.checkin.evening, null);
  assert.equal(p.name, 'Sam', 'an edit merges, never drops');
});

test('workbook-settings: export -> erase everything -> import gives back the same notebook', async () => {
  await S().resetAll();
  await Actions.onboard({ name: 'Ari' });
  await Actions.logCraving({ intensity: 5, triggerIds: [], feelings: [], skills: [] });
  await Actions.logCraving({ intensity: 3, triggerIds: [], feelings: [], skills: [] });
  await Actions.contacts.add({ name: 'Mo', role: 'safetyNet', phone: '+91 98 7654 3210' });
  const before = snapshot(S().exportJson().stores);
  calls.downloads.length = 0;
  assert.equal(await SUI.doExport(), true);
  const dl = calls.downloads[0];
  assert.match(dl.name, /^1-addic-\d{4}-\d{2}-\d{2}\.json$/); assert.equal(dl.mime, 'application/json');
  assert.ok(!/"key":\s*"lock"/.test(dl.text), 'the lock row never leaves');
  assert.equal(typeof S().view.get('settings', 'app').lastBackupAt, 'string', 'the backup date is recorded');
  assert.match(byTest(UI.pages.settings(ctx('data')), 'last-backup').textContent, /\d{4}-\d{2}-\d{2}/);
  confirmAnswer = false;
  assert.equal(await SUI.doErase(), false, 'Cancel erases nothing');
  assert.equal(S().view.list('logs').length, 2);
  confirmAnswer = true;
  await SUI.doErase();
  assert.equal(calls.confirms.at(-1).danger, true);
  assert.equal(S().view.list('logs').length, 0); assert.equal(S().view.list('events').length, 0);
  assert.match(byTest(UI.pages.settings(ctx('data')), 'settings-message').textContent, /erased/);
  const input = { value: 'x', files: [{ text: async () => dl.text }] };
  calls.go.length = 0;
  assert.equal(await SUI.doImport(input), true);
  assert.match(calls.confirms.at(-1).message, /This replaces everything on this device\. Your PIN stays\./);
  assert.equal(calls.go.at(-1), '#/today');
  assert.match(calls.toasts.at(-1)[0], /Backup restored: 2 logs/);
  assert.deepEqual(snapshot(S().exportJson().stores), before, 'every store comes back the same');
  const bad = { value: 'x', files: [{ text: async () => '{not json' }] };
  assert.equal(await SUI.doImport(bad), false);
  assert.match(byTest(UI.pages.settings(ctx('data')), 'settings-message').textContent, /could not be read/);
  const wrong = { value: 'x', files: [{ text: async () => JSON.stringify({ app: 'other', stores: 3 }) }] };
  assert.equal(await SUI.doImport(wrong), false);
  assert.match(byTest(UI.pages.settings(ctx('data')), 'settings-message').textContent, /not a backup this app can read/);
  assert.equal(S().view.list('logs').length, 2, 'a bad file replaces nothing');
});

test('workbook-settings: ERASE_PARTIAL is said plainly', async () => {
  const real = globalThis.Actions;
  globalThis.Actions = Object.assign({}, real, { eraseAll: async () => { throw Object.assign(new Error('partial'), { code: 'ERASE_PARTIAL' }); } });
  try {
    await SUI.doErase();
    assert.equal(byTest(UI.pages.settings(ctx('data')), 'settings-message').textContent, P.ERASE_PARTIAL_TEXT);
  } finally { globalThis.Actions = real; }
});

test('workbook-settings: sample data is marked, and the buttons are honest (O6, O7)', async () => {
  await S().resetAll();
  const page = UI.pages.settings(ctx('data'));
  const load = byTest(page, 'load-sample'); const erase = byTest(page, 'erase-sample');
  const hasSample = !!(Content.sample && typeof Content.sample.generate === 'function');
  assert.equal(load.getAttribute('disabled') !== null, !hasSample, 'Load is enabled only when the sample exists');
  if (!hasSample) assert.match(page.textContent, /Sample data is not in this version yet\./);
  if (typeof Actions.eraseSample !== 'function') {
    assert.notEqual(erase.getAttribute('disabled'), null, 'no eraseSample yet: the button is disabled');
    assert.equal(byTest(page, 'erase-sample-note').textContent, P.TEXT.eraseSampleLater);
  }
  if (hasSample && typeof Actions.eraseSample === 'function') {
    await SUI.doLoadSample();
    assert.ok(S().view.get('meta', 'sample'));
    assert.ok(byTest(UI.pages.settings(ctx('data')), 'sample-loaded'));
    await Actions.logCraving({ intensity: 4, triggerIds: [], feelings: [], skills: [] });
    const mine = S().view.list('logs').filter((l) => !l.sample).map((l) => l.id);
    await SUI.doEraseSample();
    const left = S().view.list('logs').map((l) => l.id);
    for (const id of mine) assert.ok(left.includes(id), 'own rows stay');
    assert.equal(S().view.list('logs').filter((l) => l.sample).length, 0);
  }
});

test('workbook-settings: print logs is a dated table, newest first', async () => {
  await S().resetAll();
  await Actions.logCraving({ intensity: 2, triggerIds: [], feelings: [], skills: [] });
  await new Promise((r) => setTimeout(r, 5));
  await Actions.logCraving({ intensity: 7, triggerIds: [], feelings: [], skills: [] });
  calls.printed.length = 0;
  byTest(UI.pages.settings(ctx('data')), 'print-logs').fire('click');
  const node = calls.printed[0];
  assert.ok(node, 'UI.printDoc is called');
  const rows = node.all((n) => n.tagName === 'tr');
  assert.equal(rows.length, 3, 'a head row and two logs');
  assert.match(rows[1].textContent, /strength 7\/10/, 'newest first');
  assert.match(node.textContent, /My logs/);
});

test('workbook-settings: PIN set, export asks it, auto-lock asks it, remove (real Store, memory)', { timeout: 120000 }, async () => {
  await S().resetAll();
  await Actions.logCraving({ intensity: 5, triggerIds: [], feelings: [], skills: [] });
  let page = UI.pages.settings(ctx('privacy'));
  byTest(page, 'set-pin').fire('click');
  let s = lastSheet();
  for (const k of ['pin-input', 'pin-input2']) {
    const i = byTest(s.body, k);
    assert.equal(i.getAttribute('type'), 'password'); assert.equal(i.getAttribute('inputmode'), 'numeric');
    assert.equal(i.getAttribute('pattern'), '[0-9]*'); assert.equal(i.getAttribute('autocomplete'), 'one-time-code');
    assert.equal(i.getAttribute('maxlength'), '12');
  }
  await fillSheet({ 'pin-input': '12a4', 'pin-input2': '12a4' });
  await until(() => !sheetError(s).hidden);
  assert.equal(sheetError(s).textContent, P.TEXT.pinRule);
  await fillSheet({ 'pin-input': '2468', 'pin-input2': '2469' });
  await until(() => sheetError(s).textContent === P.TEXT.pinSame);
  await fillSheet({ 'pin-input': '2468', 'pin-input2': '2468' });
  await until(() => s.closed === 'confirmed');
  assert.equal(S().status().hasLock, true);
  assert.equal(byTest(s.body, 'pin-input').value, '', 'the PIN is not kept in the sheet');
  page = UI.pages.settings(ctx('privacy'));
  assert.ok(byTest(page, 'lock-now') && byTest(page, 'remove-pin') && byTest(page, 'auto-lock'));
  calls.downloads.length = 0;
  const exp = SUI.doExport();
  await until(() => lastSheet() !== s);
  s = lastSheet();
  await fillSheet({ 'pin-input': '1111' });
  await until(() => sheetError(s).textContent === P.TEXT.pinWrong);
  assert.equal(calls.downloads.length, 0, 'a wrong PIN saves nothing');
  await fillSheet({ 'pin-input': '2468' });
  assert.equal(await exp, true);
  assert.equal(calls.downloads.length, 1);
  assert.ok(!calls.downloads[0].text.includes('2468'), 'the PIN is never in the backup');
  const sel = byTest(UI.pages.settings(ctx('privacy')), 'auto-lock');
  sel.value = '15'; sel.fire('change');
  await until(() => lastSheet() !== s);
  s = lastSheet();
  await fillSheet({ 'pin-input': '2468' });
  await until(() => S().status().autoLockMin === 15);
  byTest(UI.pages.settings(ctx('privacy')), 'remove-pin').fire('click');
  await until(() => lastSheet() !== s);
  s = lastSheet();
  await fillSheet({ 'pin-input': '0000' });
  await until(() => sheetError(s).textContent === 'That PIN did not match');
  await fillSheet({ 'pin-input': '2468' });
  await until(() => S().status().hasLock === false);
  assert.equal(S().view.list('logs').length, 1, 'removing the PIN keeps every note');
});

test('workbook-settings: high contrast comes back after a reload, before Settings opens (C3)', async () => {
  await S().resetAll();
  await Actions.settings.patch({ highContrast: true });
  const root = document.createElement('html');
  document.documentElement = root;
  try {
    classic('ui-settings.js', 'SettingsUI'); // a reload: the file runs again; Settings is never rendered here
    await until(() => root.getAttribute('data-contrast') === 'high');
    await Actions.settings.patch({ highContrast: false });
    assert.equal(root.getAttribute('data-contrast'), null, 'a store change applies it too');
    await Actions.settings.patch({ highContrast: true });
    assert.equal(root.getAttribute('data-contrast'), 'high');
  } finally {
    await Actions.settings.patch({ highContrast: false });
    delete document.documentElement;
  }
});

/* ── U-20a: the Reasons Card and the Support Network (offline/src/ui-workbook.js) ─────────────────────────── */
const W = require(src('ui-workbook.js'));
const WUI = classic('ui-workbook.js', 'WorkbookUI');
const wctx = (parts, query) => ({ view: S().view, settings: S().view.get('settings', 'app') || {}, profile: S().view.get('profile', 'me') || {},
  route: { parts: ['workbook'].concat(parts || []), query: query || {} }, now: new Date() });
const texts = (node) => node.all((n) => n.tagName === 'li').map((n) => n.textContent);
const isTest = (node, id) => node.getAttribute('data-test') === id; // a page's root carries its own hook

test('workbook-settings U-20a: wrap, contact payload, check and grouping (pure)', () => {
  assert.deepEqual(W.wrapLines('I want to be there for my kids every morning', 12), ['I want to be', 'there for my', 'kids every', 'morning']);
  assert.deepEqual(W.wrapLines('  ', 10), []);
  assert.deepEqual(W.wrapLines('abcdefghijkl xy', 5), ['abcde', 'fghij', 'kl xy']);
  assert.deepEqual(W.wrapLines('one\ntwo three', 20), ['one', 'two three']);
  for (const line of W.wrapLines('a long sentence with several words in it to wrap', 9)) assert.ok(line.length <= 9);

  assert.deepEqual(W.contactPayload({ name: '  Asha ', role: 'safetyNet', strategy: 'avoid', phone: ' +91 98 ', note: ' sister ' }),
    { name: 'Asha', role: 'safetyNet', strategy: null, phone: '+91 98', note: 'sister' }, 'strategy only for risky people');
  assert.deepEqual(W.contactPayload({ name: 'R', role: 'risky', strategy: 'setLimits' }), { name: 'R', role: 'risky', strategy: 'setLimits', phone: '', note: '' });
  assert.equal(W.contactPayload({ name: 'X', role: 'boss' }).role, 'safetyNet');
  assert.match(W.contactError(W.contactPayload({ name: ' ' })), /name/);
  assert.match(W.contactError(W.contactPayload({ name: 'A', phone: 'call me' })), /phone/);
  assert.match(W.contactError(W.contactPayload({ name: 'A', note: 'x'.repeat(301) })), /300/);
  assert.equal(W.contactError(W.contactPayload({ name: 'A', phone: '(022) 555-0101' })), '');

  const g = W.groupContacts([
    { id: 'c1', name: 'Zed', role: 'risky', active: true }, { id: 'c2', name: 'bea', role: 'safetyNet', active: true },
    { id: 'c3', name: 'Al', role: 'safetyNet', active: true }, { id: 'c4', name: 'Old', role: 'sponsor', active: false },
  ]);
  assert.deepEqual(g.map((x) => x.role), ['safetyNet', 'risky'], 'ROLES order, empty roles left out, hidden left out');
  assert.deepEqual(g[0].items.map((c) => c.name), ['Al', 'bea']);
  assert.deepEqual(W.hiddenContacts([{ id: 'c4', name: 'Old', active: false }, { id: 'c5', name: 'N', active: true }]).map((c) => c.id), ['c4']);
  assert.equal(WUI.telHref('+91 (22) 555-0101'), 'tel:+91225550101');
  assert.equal(W.TEXT.stays, 'Stays on this device. It is in your backup file.');
});

test('workbook-settings U-20a: the card reads the four lists; empty is honest; big view from SOS', async () => {
  await S().resetAll();
  let page = UI.pages.workbook(wctx(['reasons']));
  assert.ok(byTest(page, 'reasons-card'));
  assert.ok(byTest(page, 'reasons-big'));
  assert.equal(byTest(page, 'reasons-export'), undefined, 'no image of an empty card');
  if (W.exerciseKnown('quick-reasons')) assert.ok(byTest(page, 'reasons-write'));
  else { assert.equal(byTest(page, 'reasons-write'), undefined, 'never a link to an exercise that is not here (O7)'); assert.ok(byTest(page, 'reasons-later')); }

  await Actions.saveResponse('quick-reasons', { reasons: ['My health', 'My kids'] });
  await Actions.saveResponse('balance', { drawbacks: ['Lost money'], benefits: ['Clear mornings', 'my health'] });
  const sec = W.reasonsSections(S().view);
  assert.deepEqual(sec.quick, ['My health', 'My kids']);
  assert.deepEqual(sec.drawbacks, ['Lost money']);
  assert.deepEqual(W.flatReasons(sec), ['My health', 'My kids', 'Lost money', 'Clear mornings'], 'each reason once, in the card order');
  assert.deepEqual(W.flatReasons(sec), Engine.reasonsCard(S().view), 'the same list SOS reads');

  page = UI.pages.workbook(wctx(['reasons']));
  assert.deepEqual(texts(byTest(page, 'reasons-card')), ['My health', 'My kids', 'Lost money', 'Clear mornings', 'my health']);
  assert.ok(byTest(page, 'reasons-export'));
  assert.equal(byTest(page, 'reasons-big').getAttribute('href'), '#/workbook/reasons?big=1&from=card');

  const big = UI.pages.workbook(wctx(['reasons'], { big: '1' }));
  assert.ok(isTest(big, 'reasons-big-view'));
  assert.deepEqual(texts(big), ['My health', 'My kids', 'Lost money', 'Clear mornings']);
  assert.equal(byTest(big, 'reasons-back').getAttribute('href'), '#/sos', 'from SOS, one tap back to SOS');
  assert.equal(byTest(big, 'reasons-call').getAttribute('href'), '#/workbook/network');
  assert.doesNotMatch(big.textContent, /tip|tour/i);

  const discreet = Object.assign(wctx(['reasons'], { big: '1' }), { settings: { discreet: true } });
  assert.match(UI.pages.workbook(discreet).textContent, /Notes/);
  assert.doesNotMatch(UI.pages.workbook(discreet).textContent, /Remember why/);
});

test('workbook-settings U-20a: the lock-screen image is drawn on a canvas and saved with UI.download', async () => {
  calls.toasts.length = 0; calls.downloads.length = 0;
  assert.equal(await WUI.exportImage('My Reasons Card', ['One'], 'reasons-card.png'), false, 'the stand-in DOM has no canvas');
  assert.equal(calls.downloads.length, 0);
  assert.equal(calls.toasts.pop()[0], W.TEXT.noCanvas);

  const drawn = [];
  const g = { fillRect() {}, fillText: (t) => drawn.push(t), set font(v) { this._f = v; }, get font() { return this._f; } };
  const canvas = { getContext: (k) => (k === '2d' ? g : null), toBlob: (cb, type) => cb(new Blob(['png'], { type })) };
  const make = document.createElement;
  document.createElement = (t) => (t === 'canvas' ? canvas : make(t));
  try {
    const long = 'I want to wake up clear and be there for the people I love, every single day of the week';
    assert.equal(await WUI.exportImage('My Reasons Card', ['My kids', long], 'reasons-card.png'), true);
  } finally { document.createElement = make; }
  assert.equal(canvas.width, 1080); assert.equal(canvas.height, 1920);
  assert.match(g.font, /system-ui/); assert.doesNotMatch(g.font, /url\(|https?:/, 'system font only');
  assert.ok(drawn.includes('My Reasons Card') && drawn.includes('My kids'));
  const d = calls.downloads.pop();
  assert.equal(d.name, 'reasons-card.png'); assert.equal(d.mime, 'image/png'); assert.ok(d.text instanceof Blob);
});

test('workbook-settings U-20a: contacts add -> edit -> I reached out -> hide -> show, on the device only', async () => {
  await S().resetAll();
  let page = UI.pages.workbook(wctx(['network']));
  assert.ok(byTest(page, 'network-empty'));
  assert.equal(byTest(page, 'network-stays').textContent, W.TEXT.stays);

  byTest(page, 'contact-add').fire('click');
  await fillSheet({ 'contact-name': 'Asha', 'contact-role': 'safetyNet', 'contact-phone': 'not a number' });
  await until(() => sheetError(lastSheet()) && !sheetError(lastSheet()).hidden);
  assert.match(sheetError(lastSheet()).textContent, /phone/);
  assert.equal(S().view.list('contacts').length, 0, 'nothing saved while the form is wrong');
  await fillSheet({ 'contact-phone': '+91 98200 00000', 'contact-note': 'Sister, evenings' });
  await until(() => S().view.list('contacts').length === 1);
  const asha = S().view.list('contacts')[0];
  assert.deepEqual([asha.name, asha.role, asha.phone, asha.note, asha.active], ['Asha', 'safetyNet', '+91 98200 00000', 'Sister, evenings', true]);
  assert.equal(lastSheet().closed, 'saved');

  await WUI.saveContact({ name: 'Ravi', role: 'risky', strategy: 'avoid' });
  page = UI.pages.workbook(wctx(['network']));
  assert.ok(byTest(page, 'contact-' + asha.id) && byTest(page, 'reached-' + asha.id));
  assert.equal(byTest(page, 'call-' + asha.id).getAttribute('href'), 'tel:+919820000000');
  const ravi = S().view.list('contacts').find((c) => c.name === 'Ravi');
  assert.match(byTest(page, 'contact-' + ravi.id).textContent, /My plan: Stay away for now/);
  assert.equal(byTest(page, 'reached-' + ravi.id), undefined, 'no "reached out" for a person I am careful around');

  byTest(page, 'contact-edit-' + asha.id).fire('click');
  assert.equal(byTest(lastSheet().body, 'contact-name').value, 'Asha', 'the edit sheet opens with the saved values');
  await fillSheet({ 'contact-name': 'Asha Didi' });
  await until(() => S().view.get('contacts', asha.id).name === 'Asha Didi');

  byTest(page, 'reached-' + asha.id).fire('click');
  byTest(lastSheet().body, 'reach-text').fire('click');
  await until(() => S().view.list('events').some((e) => e.type === 'ContactReached'));
  const ev = S().view.list('events').filter((e) => e.type === 'ContactReached');
  assert.equal(ev.length, 1); assert.ok(JSON.stringify(ev[0]).includes(asha.id) && JSON.stringify(ev[0]).includes('text'));

  confirmAnswer = true;
  byTest(page, 'contact-hide-' + asha.id).fire('click');
  await until(() => S().view.get('contacts', asha.id).active === false);
  assert.equal(S().view.list('contacts').length, 2, 'hidden, never deleted');
  page = UI.pages.workbook(wctx(['network']));
  assert.equal(byTest(page, 'reached-' + asha.id), undefined);
  byTest(page, 'contact-show-' + asha.id).fire('click');
  await until(() => S().view.get('contacts', asha.id).active === true);
  assert.equal(S().view.list('events').filter((e) => e.type === 'ContactReached').length, 1, 'events only grow');
});

test('workbook-settings U-20a: the workbook routes render (U-20b); locked is kind; source rules', async () => {
  assert.ok(isTest(UI.pages.workbook(wctx([])), 'workbook-page'));
  assert.ok(isTest(UI.pages.workbook(wctx(['motivation'])), 'artifact-motivation'));
  const plan = UI.pages.workbook(wctx(['plan']));
  assert.ok(isTest(plan, 'workbook-later') || isTest(plan, 'plan-page'));
  const real = globalThis.Store;
  globalThis.Store = Object.assign(Object.create(real), { status: () => Object.assign(real.status(), { locked: true }) });
  try { assert.ok(isTest(UI.pages.workbook(wctx(['reasons'], { big: '1' })), 'workbook-locked')); } finally { globalThis.Store = real; }
  const text = readFileSync(src('ui-workbook.js'), 'utf8');
  const never = (re, why) => assert.ok(!re.test(text), why + ' (' + re + ')');
  never(/globalThis\.(Content|Engine|Store|Actions)/, 'globals are read with typeof');
  never(/innerHTML|outerHTML|insertAdjacentHTML|document\.write/, 'text only');
  never(/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|navigator\.share|https?:\/\//, 'no network; contacts never leave the device');
  never(/\baddicts?\b/i, 'person-first');
  never(/\bat risk\b|\bpoints?\b/i, 'no scoring, no "at risk" wording');
  assert.ok(!/\bscore\b/i.test(text.replace(/\.score\b/g, '')), 'no score in the words (the motivation row field r.score is read, never called a score)');
  const sandbox = { module: { exports: {} } };
  vm.runInNewContext(text, sandbox, { filename: 'ui-workbook.js' }); // loads with no globals (it only loads)
  assert.equal(JSON.stringify(sandbox.module.exports.wrapLines('a b', 1)), '["a","b"]'); // another realm's array
});

/* ── U-20b: the workbook browser and the artifacts ──────────────────────────────────────────────────────── */
const ROUTE_ARTIFACTS = ['reasons', 'balance', 'motivation', 'triggers', 'redflags', 'journal', 'spiral', 'signature', 'anger', 'network',
  'scripts', 'activities', 'balance-sw', 'distractions', 'warnings', 'plan', 'signs', 'risks']; // BUILD-PLAN 3.5
const tours = (node) => node.all((n) => n.getAttribute && n.getAttribute('data-tour') !== null).map((n) => n.getAttribute('data-tour'));

test('workbook-settings U-20b: the map covers 3.5, the groups, the sensitive card, the readable text (pure)', () => {
  assert.deepEqual(Object.keys(W.ARTIFACTS).sort(), ROUTE_ARTIFACTS.slice().sort());
  const g = W.groupsFor(false);
  assert.deepEqual(g.map((x) => x.id), ['why', 'self', 'people', 'joys']);
  assert.deepEqual(g.map((x) => x.label), ['My Why', 'Know Myself', 'My People', 'My Joys']);
  assert.deepEqual(g[0].items, ['reasons', 'balance', 'motivation', 'signs']);
  assert.deepEqual(g[1].items, ['triggers', 'redflags', 'journal', 'spiral', 'signature', 'anger', 'warnings']);
  assert.deepEqual(g[2].items, ['network', 'scripts']);
  assert.deepEqual(g[3].items, ['activities', 'balance-sw', 'distractions']);
  assert.ok(W.groupsFor(true)[1].items.includes('risks'), 'risk factors only behind the tap');
  for (const [key, a] of Object.entries(W.ARTIFACTS)) {
    assert.ok(Array.isArray(a.exerciseIds), key);
    if (!a.own) assert.ok(a.exerciseIds.length && typeof a.will === 'string' && a.will, key + ' names what it will be');
    if (!a.own) assert.equal(W.isStub(a), !a.exerciseIds.some(W.exerciseKnown), key + ': a stub exactly when none of its exercises is in Content.exercises');
  }
  assert.deepEqual(W.ARTIFACTS.journal.exerciseIds, ['trial']);
  assert.deepEqual(W.ARTIFACTS.signature.exerciseIds, ['craving-signature']);
  assert.deepEqual(W.ARTIFACTS.risks.exerciseIds, ['risk-factors']);
  assert.equal(W.humanize('peakCraving'), 'Peak craving');
  assert.equal(W.humanize('balance-sw'), 'Balance sw');
  assert.deepEqual(W.readable({ drawbacks: ['Lost money', ' '], often: true, n: 3, empty: [], plan: { when: 'Friday', who: 'Asha' } }, null),
    [{ label: 'Drawbacks', text: 'Lost money' }, { label: 'Often', text: 'Yes' }, { label: 'N', text: '3' }, { label: 'Plan', text: 'When: Friday, Who: Asha' }]);
  assert.deepEqual(W.readable({ line: 'No thanks, I am driving', x: 'y' }, { fields: [{ id: 'line', type: 'text', label: 'What I will say' }] }),
    [{ label: 'What I will say', text: 'No thanks, I am driving' }, { label: 'X', text: 'y' }], 'the spec labels first, then the rest');
  assert.deepEqual(W.readable('just text', null), [{ label: 'Answer', text: 'just text' }]);
  assert.deepEqual(W.readable(null, null), []);
});

test('workbook-settings U-20b: browser, every artifact opens; stubs are honest; edit, history, print, I said it', async () => {
  await S().resetAll();
  const home = UI.pages.workbook(wctx([]));
  assert.ok(isTest(home, 'workbook-page'));
  assert.ok(tours(home).includes('workbook-groups') && tours(home).filter((t) => t === 'workbook-card').length === 1);
  const hs = hooks(home);
  for (const id of ['why', 'self', 'people', 'joys']) assert.ok(hs.includes('workbook-group-' + id), id);
  assert.ok(hs.includes('workbook-card-plan') && hs.includes('risks-reveal') && !hs.includes('workbook-card-risks'));
  assert.equal(byTest(home, 'risks-reveal').getAttribute('href'), '#/workbook?sensitive=1');
  assert.ok(hooks(UI.pages.workbook(wctx([], { sensitive: '1' }))).includes('workbook-card-risks'));
  assert.ok(isTest(UI.pages.workbook(wctx(['no-such-page'])), 'workbook-page'), 'unknown -> the browser');
  assert.doesNotMatch(home.textContent, /\bat risk\b|\bscore\b/i);

  for (const key of ROUTE_ARTIFACTS.filter((k) => !W.ARTIFACTS[k].own)) {
    const pg = UI.pages.workbook(wctx([key]));
    assert.ok(isTest(pg, 'artifact-' + key), key);
    if (W.isStub(W.ARTIFACTS[key])) {
      assert.match(byTest(pg, 'artifact-stub').textContent, /^Coming in a later version: .+\.$/, key);
      assert.equal(byTest(pg, 'artifact-edit'), undefined, key + ': never an edit button for an exercise that is not here (O7)');
    }
    assert.equal(byTest(pg, 'artifact-print'), undefined, key + ': nothing saved, nothing to print');
    const pr = byTest(pg, 'artifact-practise');
    if (pr) assert.equal(typeof UI.pages[pr.getAttribute('href').slice(2).split(/[/?]/)[0]], 'function', key + ': a practise link only to a live page');
  }

  // Saved answers show as text, with history newest first, and print through UI.printDoc.
  await Actions.saveResponse('trial', { thought: 'One will not hurt', comeback: 'One has never stayed one' });
  await Actions.saveResponse('trial', { thought: 'I earned it', comeback: 'I earned a good morning more' });
  let pg = UI.pages.workbook(wctx(['journal']));
  assert.match(byTest(pg, 'artifact-part-trial').textContent, /I earned it/);
  const hist = byTest(pg, 'artifact-history');
  assert.match(hist.textContent, /^History \(2\)/);
  const items = hist.all((n) => n.tagName === 'li').map((n) => n.textContent);
  assert.ok(/I earned it/.test(items[0]) && /One will not hurt/.test(items[1]), 'newest first');
  assert.deepEqual(texts(byTest(pg, 'journal-comebacks')), Engine.comebacks(S().view));
  const before = calls.printed.length;
  byTest(pg, 'artifact-print').fire('click');
  assert.equal(calls.printed.length, before + 1);
  const doc = calls.printed[calls.printed.length - 1];
  assert.match(doc.textContent, /^Thought Journal/);
  assert.match(doc.textContent, /I earned a good morning more/);
  assert.equal(hooks(doc).length, 0, 'the print view has no controls');

  await Actions.saveResponse('distractions', { distractions: ['Cold water on my face', 'Walk round the block'] });
  assert.deepEqual(texts(byTest(UI.pages.workbook(wctx(['distractions'])), 'distraction-deck')), ['Cold water on my face', 'Walk round the block']);

  // A known exercise: Edit opens it in workbook mode; "I said it" writes ScriptUsed through Actions.
  const saved = globalThis.Content.exercises;
  globalThis.Content.exercises = [{ id: 'assertive-script', title: 'Say it straight', kind: 'build', fields: [{ id: 'line', type: 'text', label: 'What I will say' }] }];
  try {
    pg = UI.pages.workbook(wctx(['scripts']));
    assert.equal(byTest(pg, 'artifact-stub'), undefined);
    assert.equal(byTest(pg, 'artifact-edit').getAttribute('href'), '#/exercise/assertive-script?mode=workbook');
    assert.equal(byTest(pg, 'script-said'), undefined, 'nothing saved, nothing to say');
    await Actions.saveResponse('assertive-script', { line: 'No thanks, I am driving' });
    pg = UI.pages.workbook(wctx(['scripts']));
    assert.match(byTest(pg, 'artifact-part-assertive-script').textContent, /What I will sayNo thanks, I am driving/);
    byTest(pg, 'script-said').fire('click');
    await until(() => S().view.list('events').some((e) => e.type === 'ScriptUsed'));
    const r = Engine.latest(S().view, 'assertive-script');
    assert.equal(S().view.list('events').find((e) => e.type === 'ScriptUsed').payload.responseId, r.id);
  } finally { if (saved === undefined) delete globalThis.Content.exercises; else globalThis.Content.exercises = saved; }
  assert.ok(byTest(UI.pages.workbook(wctx([])), 'workbook-card-journal').textContent.includes('Saved '));
});
