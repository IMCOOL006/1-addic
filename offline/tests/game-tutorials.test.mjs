// Lane game-tutorials' Node tests (node:test, no dependencies). U-27: the guidance layer in offline/src/ui-guidance.js
// (BUILD-PLAN 3.11; tracks/SCREENS/contracts/game-tutorials.md "GuidanceUI"): the pure rules (tour, JIT, reveal,
// training) and the coach-mark overlay on a tiny stand-in DOM that walks the returned tree.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const src = (f) => join(SRC, f);

globalThis.Content = require(src('content-core.js'));
for (const f of readdirSync(SRC).filter((n) => /^content-.+\.js$/.test(n) && n !== 'content-core.js').sort()) require(src(f));
const C = globalThis.Content;
const G = require(src('ui-guidance.js'));

/* ── a tiny stand-in DOM ─────────────────────────────────────────────────────────────────── */
function fakeDom() {
  const listeners = {};
  class Node {
    constructor(tag) { this.tagName = tag; this.nodeType = tag === '#text' ? 3 : 1; this.children = []; this.attrs = {}; this.on = {}; this.style = {}; this._text = ''; this.parentNode = null; this.rect = null; }
    appendChild(c) { if (c.parentNode) c.parentNode.removeChild(c); this.children.push(c); c.parentNode = this; return c; }
    prepend(c) { if (c.parentNode) c.parentNode.removeChild(c); this.children.unshift(c); c.parentNode = this; return c; }
    removeChild(c) { this.children = this.children.filter((x) => x !== c); c.parentNode = null; return c; }
    setAttribute(k, v) { this.attrs[k] = String(v); }
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null; }
    hasAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attrs, k); }
    removeAttribute(k) { delete this.attrs[k]; }
    addEventListener(t, fn) { (this.on[t] = this.on[t] || []).push(fn); }
    removeEventListener(t, fn) { this.on[t] = (this.on[t] || []).filter((f) => f !== fn); }
    click() { if (this.hasAttribute('disabled')) return; const e = { type: 'click', target: this, preventDefault() {} }; (this.on.click || []).slice().forEach((fn) => fn(e)); }
    focus() { doc.activeElement = this; }
    getBoundingClientRect() { return this.rect || { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 }; }
    set textContent(v) { this.children = []; this._text = String(v); }
    get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
    all(pred, out = []) { for (const c of this.children) { if (pred(c)) out.push(c); c.all(pred, out); } return out; }
    find(pred) { return this.all(pred)[0] || null; }
    get className() { return this.getAttribute('class') || ''; }
  }
  const body = new Node('body');
  const root = new Node('html');
  root.appendChild(body);
  const main = body.appendChild(new Node('main')); main.setAttribute('id', 'main');
  const coach = body.appendChild(new Node('div')); coach.setAttribute('id', 'coach'); coach.setAttribute('class', 'coach'); coach.setAttribute('hidden', '');
  const doc = {
    body, documentElement: root, activeElement: null,
    createElement: (t) => new Node(t),
    createTextNode: (s) => { const n = new Node('#text'); n._text = String(s); return n; },
    getElementById: (id) => root.find((n) => n.getAttribute('id') === id),
    querySelectorAll: (sel) => { const m = /^\[data-tour="([^"]+)"\]$/.exec(sel); return m ? root.all((n) => n.getAttribute('data-tour') === m[1]) : []; },
    contains: (n) => root.all((x) => x === n).length > 0,
    addEventListener: (t, fn) => { (listeners[t] = listeners[t] || []).push(fn); },
    removeEventListener: (t, fn) => { listeners[t] = (listeners[t] || []).filter((f) => f !== fn); },
    fire: (t, e) => (listeners[t] || []).slice().forEach((fn) => fn(Object.assign({ type: t, preventDefault() {} }, e || {}))),
    listeners,
  };
  return doc;
}
const byClass = (n, cls) => n.all((x) => (' ' + x.className + ' ').includes(' ' + cls + ' '));
const byTest = (n, t) => n.all((x) => x.getAttribute('data-test') === t);

/* a stand-in world: DOM, window, location, Actions recorder, Engine stub, Store view */
function world(opts) {
  const o = opts || {};
  const doc = fakeDom();
  const win = { on: {}, addEventListener(t, fn) { (this.on[t] = this.on[t] || []).push(fn); }, removeEventListener(t, fn) { this.on[t] = (this.on[t] || []).filter((f) => f !== fn); },
    fire(t) { (this.on[t] || []).slice().forEach((fn) => fn({ type: t })); } };
  const calls = [];
  const rows = Object.assign({ events: [], tutorials: [], reveals: [], tips: [], profile: [], settings: [] }, o.rows || {});
  const view = { list: (s) => rows[s] || [], get: (s, k) => (rows[s] || []).find((r) => r.key === k || r.id === k) || null };
  globalThis.document = doc;
  globalThis.window = win;
  globalThis.location = { hash: o.hash || '#/today' };
  globalThis.innerWidth = 390; globalThis.innerHeight = 800;
  globalThis.Actions = {
    tutorial: { done: async (id, x) => { calls.push(['done', id, x]); return {}; }, replay: async (id) => { calls.push(['replay', id]); return {}; } },
    reveal: async (id, x) => { calls.push(['reveal', id, x]); return { reveal: { id } }; },
    markTipShown: async (id) => { calls.push(['tip', id]); return {}; },
    recordEvent: async (t, p) => { calls.push(['event', t, p]); return {}; },
  };
  globalThis.Engine = Object.assign({
    tutorialDone: () => false,
    revealed: () => new Set(C.reveal.always),
    newDots: () => new Set(),
    pickTip: (v, now, ctx) => (String(ctx && ctx.route).startsWith('#/sos') ? null : { id: 'reasons', text: 'A tip.', route: '#/workbook/reasons' }),
    explorer: () => C.explorer.map((x) => ({ id: x.id, label: x.label, done: false })),
    explorerDone: () => false,
  }, o.engine || {});
  globalThis.Store = { view, status: () => ({ locked: o.locked === true }) };
  G._reset();
  return { doc, win, calls, view, rows };
}
function cleanup() {
  G._reset();
  for (const k of ['document', 'window', 'location', 'Actions', 'Engine', 'Store', 'innerWidth', 'innerHeight']) delete globalThis[k];
}
/* place a visible [data-tour] element in the stand-in page */
function target(doc, name, rect) {
  const n = doc.createElement('a'); n.setAttribute('data-tour', name);
  n.rect = Object.assign({ top: 700, left: 10, bottom: 744, right: 80, width: 70, height: 44 }, rect || {});
  doc.getElementById('main').appendChild(n);
  return n;
}
const flush = () => new Promise((r) => setTimeout(r, 0));

/* ── the pure rules ──────────────────────────────────────────────────────────────────────── */

test('guidance: tour never starts on SOS routes', async () => {
  const p = { onboardedAt: '2026-11-07T10:00:00.000Z' };
  for (const path of ['#/sos', '#/sos/craving', '#/sos?drill=1', '#/sos/urgent', '#/lock', '#/onboarding', '#/onboarding/2']) {
    assert.equal(G.shouldTour({ profile: p, path }), false, path);
  }
  assert.equal(G.shouldTour({ profile: p, path: '#/today' }), true);
  assert.equal(G.shouldTour({ profile: p, path: '#/today', locked: true }), false, 'never while locked');
  assert.equal(G.shouldTour({ profile: p, path: '#/today', busy: true }), false, 'never over an open sheet');
  // coach() itself refuses on SOS, and SOS opening mid-tour closes it and marks nothing
  const w = world({ hash: '#/sos' });
  try {
    assert.equal(await G.coach('tour'), 'aborted');
    globalThis.location.hash = '#/today';
    const p2 = G.coach('tour');
    assert.equal(G.isOpen(), true);
    globalThis.location.hash = '#/sos';
    w.win.fire('hashchange');
    assert.equal(await p2, 'aborted');
    assert.equal(G.isOpen(), false);
    assert.deepEqual(w.calls.filter((c) => c[0] === 'done'), [], 'nothing is marked');
    assert.equal(w.doc.getElementById('coach').children.length, 0, 'the overlay is gone');
    // and the after-render hook on an SOS route never starts the tour
    G._reset();
    w.rows.profile = [{ key: 'me', onboardedAt: '2026-11-07T10:00:00.000Z' }];
    G.afterRender({ route: { path: '/sos', parts: ['sos'], query: {} }, view: w.view, profile: w.rows.profile[0], features: new Set(C.reveal.always) });
    assert.equal(G.isOpen(), false);
  } finally { cleanup(); }
});

test('guidance: tour waits for onboarding', () => {
  assert.equal(G.shouldTour({ profile: {}, path: '#/today' }), false);
  assert.equal(G.shouldTour({ profile: { onboardedAt: '2026-11-07T10:00:00.000Z' }, path: '#/today' }), true);
  assert.equal(G.shouldTour({ profile: {}, onboarded: true, path: '#/today' }), true, 'an OnboardingCompleted event counts');
  assert.equal(G.shouldTour({ profile: { onboardedAt: 'x' }, path: '#/today', tourDone: true }), false, 'done or skipped: never again by itself');
  assert.equal(G.shouldTour({ profile: { onboardedAt: 'x' }, path: '#/learn' }), false, 'only on Today');
  const w = world({ hash: '#/today' });
  try {
    const ctx = { route: { path: '/today', parts: ['today'], query: {} }, view: w.view, profile: {}, features: new Set(C.reveal.always) };
    assert.equal(G.maybeTour(ctx), false, 'not before onboarding');
    w.rows.events.push({ type: 'OnboardingCompleted', at: '2026-11-07T10:00:00.000Z', payload: {} });
    assert.equal(G.maybeTour(ctx), true, 'starts once onboarding is done');
    assert.equal(G.isOpen(), true);
    G.coach('tour'); // replaced, not stacked
    assert.equal(byClass(w.doc.getElementById('coach'), 'coach-layer').length, 1);
  } finally { cleanup(); }
});

test('guidance: featureOfRoute, JIT once a day and never on SOS', () => {
  assert.equal(G.featureOfRoute('#/actions/planner?day=1'), 'planner');
  assert.equal(G.featureOfRoute('/actions/battle/new'), 'battlePlans');
  assert.equal(G.featureOfRoute('#/track'), 'quicklog');
  assert.equal(G.featureOfRoute('#/track/insights'), 'insights');
  assert.equal(G.featureOfRoute('#/workbook'), 'workbook');
  assert.equal(G.featureOfRoute('#/workbook/plan'), 'recoveryPlan');
  assert.equal(G.featureOfRoute('#/nowhere'), null);
  const all = new Set(Object.keys(C.features).concat(C.reveal.always));
  const base = { revealed: all, isDone: () => false, asked: {}, today: '2026-11-07' };
  assert.equal(G.jitFor(Object.assign({}, base, { path: '#/actions/planner' })).id, 'planner');
  assert.equal(G.jitFor(Object.assign({}, base, { path: '#/sos' })), null);
  assert.equal(G.jitFor(Object.assign({}, base, { path: '#/actions/planner', revealed: new Set(C.reveal.always) })), null, 'not before it is revealed');
  assert.equal(G.jitFor(Object.assign({}, base, { path: '#/actions/planner', isDone: (id) => id === 'planner' })), null, 'not once done');
  assert.equal(G.jitFor(Object.assign({}, base, { path: '#/actions/planner', asked: { planner: '2026-11-07' } })), null, 'Later: not again today');
  assert.equal(G.jitFor(Object.assign({}, base, { path: '#/actions/planner', asked: { planner: '2026-11-06' } })).id, 'planner', 'asks again another day');
});

test('guidance: training lists the drills, the SOS drill, the tour and every JIT', () => {
  const t = G.training();
  for (const x of t) for (const k of ['id', 'name', 'route', 'kind']) assert.ok(typeof x[k] === 'string' && x[k], `${x.id} has ${k}`);
  const routes = t.map((x) => x.route);
  for (const r of ['#/practice/sober?drill=1', '#/actions/battle?new=1&drill=1', '#/tools/trial?drill=1', '#/games/refusal?drill=1', '#/sos?drill=1', '#/today?tour=1']) assert.ok(routes.includes(r), r);
  assert.ok(t.some((x) => x.id === 'train-quicklog'));
  for (const j of C.tutorials.filter((x) => x.kind === 'jit')) assert.ok(t.some((x) => x.kind === 'jit' && x.id === j.id && x.route.includes('tutorial=' + j.id)), j.id);
  assert.equal(new Set(t.map((x) => x.kind + ':' + x.id)).size, t.length, 'no duplicates');
});

test('guidance: moreTools lists only unrevealed with their module', async () => {
  const revealed = new Set(C.reveal.always.concat(C.reveal.m2));
  const locked = G.lockedFeatures(revealed);
  assert.ok(locked.length > 0);
  for (const f of locked) assert.ok(!revealed.has(f.id), f.id + ' is not revealed');
  for (const f of C.reveal.m2) assert.ok(!locked.some((x) => x.id === f), f + ' is revealed, so not listed');
  const mot = locked.find((x) => x.id === 'motivation');
  assert.equal(mot.module.id, 'm3');
  const m3 = (C.modules || []).find((m) => m.id === 'm3');
  if (m3) assert.equal(mot.module.name, m3.name);
  assert.equal(locked.length, Object.keys(C.features).filter((f) => !revealed.has(f)).length);
  const w = world({ engine: { revealed: () => revealed } });
  try {
    const node = G.moreTools({ view: w.view, features: revealed });
    assert.equal(node.getAttribute('data-tour'), 'more-tools');
    const btns = byTest(node, 'show-now');
    assert.equal(btns.length, locked.length);
    btns.find((b) => b.getAttribute('data-feature') === 'motivation').click();
    await flush();
    assert.deepEqual(w.calls.find((c) => c[0] === 'reveal'), ['reveal', 'motivation', { forced: true }]);
    const all = new Set(Object.keys(C.features));
    assert.equal(G.moreTools({ view: w.view, features: all }), null, 'nothing locked: nothing shown');
  } finally { cleanup(); }
});

test('guidance: New dot while unseen; first visit marks it seen', () => {
  const w = world({ hash: '#/actions/planner', engine: { newDots: () => new Set(['planner']), tutorialDone: () => true } });
  try {
    const d = G.dot('planner', { view: w.view });
    assert.ok(d && d.textContent === 'New');
    assert.equal(G.dot('workbook', { view: w.view }), null);
    const ctx = { route: { path: '/actions/planner', parts: ['actions', 'planner'], query: {} }, view: w.view, profile: {}, features: new Set(['planner']) };
    G.afterRender(ctx); G.afterRender(ctx);
    assert.deepEqual(w.calls.filter((c) => c[0] === 'reveal'), [['reveal', 'planner', { seen: true }]], 'once');
  } finally { cleanup(); }
});

test('guidance: tip null on SOS and when off', () => {
  const w = world();
  try {
    assert.equal(G.tipCard({ route: { path: '/sos' }, view: w.view, settings: {} }), null);
    assert.equal(G.tipCard({ route: { path: '/today' }, view: w.view, settings: { tips: false } }), null);
    assert.equal(G.tipCard({ route: { path: '/learn' }, view: w.view, settings: {} }), null, 'Today only');
    const card = G.tipCard({ route: { path: '/today' }, view: w.view, settings: {} });
    assert.equal(card.getAttribute('data-tour'), 'tips-card');
    w.doc.getElementById('main').appendChild(card);
    byTest(card, 'tip-got-it')[0].click();
    assert.deepEqual(w.calls.find((c) => c[0] === 'tip'), ['tip', 'reasons']);
    assert.equal(card.parentNode, null, 'Got it removes the card');
  } finally { cleanup(); }
});

test('guidance: missing target falls back to a card', async () => {
  const w = world({ hash: '#/track' });
  try {
    const p = G.coach('quicklog');
    const layer = w.doc.getElementById('coach');
    assert.equal(layer.hasAttribute('hidden'), false);
    const pop = byClass(layer, 'coach-pop')[0];
    assert.ok(pop.className.includes('coach-center'), 'a centred card');
    assert.ok(byClass(layer, 'coach-ring')[0].hasAttribute('hidden'), 'no spotlight on nothing');
    assert.ok(pop.textContent.includes(C.tutorials.find((t) => t.id === 'quicklog').steps[0].text));
    const sos = byClass(pop, 'coach-sos')[0];
    assert.equal(sos.getAttribute('href'), '#/sos', 'the overlay carries its own SOS link');
    target(w.doc, 'quicklog-intensity');
    byClass(layer, 'coach-next')[0].click();
    assert.ok(!byClass(layer, 'coach-pop')[0].className.includes('coach-center'), 'a present target is spotlit');
    assert.equal(byClass(layer, 'coach-ring')[0].hasAttribute('hidden'), false);
    sos.click();
    assert.equal(await p, 'aborted');
    assert.equal(w.calls.filter((c) => c[0] === 'done').length, 0, 'leaving for SOS marks nothing');
  } finally { cleanup(); }
});

test('guidance: skip marks skipped, finish marks done', async () => {
  const w = world({ hash: '#/today' });
  try {
    const tour = C.tutorials.find((t) => t.id === 'tour');
    for (const s of tour.steps) target(w.doc, s.target);
    const p = G.coach('tour', { replay: true });
    assert.deepEqual(w.calls[0], ['replay', 'tour']);
    const layer = w.doc.getElementById('coach');
    assert.equal(w.doc.activeElement, byClass(layer, 'coach-next')[0], 'focus moves to the step');
    for (let i = 0; i < tour.steps.length; i++) byClass(layer, 'coach-next')[0].click();
    assert.equal(await p, 'done');
    assert.deepEqual(w.calls.filter((c) => c[0] === 'done'), [['done', 'tour', undefined]]);
    globalThis.location.hash = '#/track/insights';
    const p2 = G.coach('insights');
    byClass(layer, 'coach-skip')[0].click();
    assert.equal(await p2, 'skipped');
    assert.deepEqual(w.calls.filter((c) => c[0] === 'done')[1], ['done', 'insights', { skipped: true }]);
    const p3 = G.coach('insights');
    w.doc.fire('keydown', { key: 'Escape' });
    assert.equal(await p3, 'skipped', 'Escape closes it');
    const p4 = G.coach('insights');
    byClass(layer, 'coach-overlay')[0].click();
    assert.equal(await p4, 'skipped', 'one tap outside closes it');
    assert.equal(await G.coach('drill'), 'aborted', 'the drill hands over to SOS');
    assert.equal(globalThis.location.hash, '#/sos?drill=1');
    assert.equal(await G.coach('nope'), 'aborted');
  } finally { cleanup(); }
});

test('guidance: JIT bar is non-modal; Later marks nothing', () => {
  const w = world({ hash: '#/actions/planner', engine: { revealed: () => new Set(['planner']) } });
  try {
    const ctx = { route: { path: '/actions/planner', parts: ['actions', 'planner'], query: {} }, view: w.view, profile: {}, features: new Set(['planner']) };
    G.afterRender(ctx);
    const main = w.doc.getElementById('main');
    const bar = byTest(main, 'jit-bar')[0];
    assert.ok(bar, 'the bar sits in the page, not over it');
    assert.equal(w.doc.getElementById('coach').children.length, 0);
    byTest(bar, 'jit-later')[0].click();
    assert.equal(byTest(main, 'jit-bar').length, 0);
    G.afterRender(ctx);
    assert.equal(byTest(main, 'jit-bar').length, 0, 'not again today');
    assert.equal(w.calls.length, 0, 'Later writes nothing');
  } finally { cleanup(); }
});

test('guidance: Explorer ring opens the list; ExplorerCompleted once on full completion', () => {
  const w = world();
  try {
    const ring = G.explorerRing({ view: w.view });
    assert.equal(ring.getAttribute('data-tour'), 'explorer-ring');
    assert.equal(G.explorerRing({ view: w.view, calm: true }), null, 'calm mode hides it');
    globalThis.Engine.explorerDone = () => true;
    assert.equal(G.explorerRing({ view: w.view }), null, 'done: gone');
    globalThis.Engine.explorer = () => C.explorer.map((x) => ({ id: x.id, label: x.label, done: true }));
    assert.equal(G.checkExplorer(w.view), true);
    assert.equal(G.checkExplorer(w.view), false);
    assert.deepEqual(w.calls.filter((c) => c[0] === 'event'), [['event', 'ExplorerCompleted', {}]]);
    w.rows.events.push({ type: 'ExplorerCompleted' });
    G._reset();
    assert.equal(G.checkExplorer(w.view), false, 'already logged: never again');
  } finally { cleanup(); }
});

test('guidance: every tutorial target is named as data-tour in ui-*.js or shell.html', () => {
  const files = readdirSync(SRC).filter((n) => /^ui-.+\.js$/.test(n) || n === 'shell.html');
  const hay = files.map((f) => readFileSync(src(f), 'utf8')).join('\n');
  const has = (n) => new RegExp(`data-tour['"]?\\s*[:=]\\s*['"]${n.replace(/[-]/g, '\\-')}['"]`).test(hay);
  // targets on screens of lanes not merged into this tree (baselines.md): actions (planner, Battle Plans, Weekly
  // Review) and workbook-settings (Workbook, My Recovery Plan). Each must come from its own lane, never faked here.
  const PENDING = new Set(['planner-day', 'planner-gaps', 'planner-add', 'bp-new', 'bp-form', 'review-start', 'workbook-groups', 'workbook-card', 'plan-sections', 'plan-print']);
  const missing = [];
  for (const t of C.tutorials) for (const s of t.steps || []) if (!has(s.target)) missing.push(s.target);
  assert.deepEqual(missing.filter((n) => !PENDING.has(n)), [], 'only other lanes\' pending targets may be missing');
  for (const n of ['tips-card', 'explorer-ring', 'more-tools']) assert.ok(new RegExp(`'data-tour': '${n}'`).test(readFileSync(src('ui-guidance.js'), 'utf8')), n);
});

test('guidance: nothing covers SOS (the layer sits under the SOS button and hides on SOS)', () => {
  const css = readFileSync(src('styles.css'), 'utf8');
  const z = (sel) => Number((new RegExp(sel.replace('.', '\\.') + '\\s*\\{[^}]*z-index:\\s*(\\d+)').exec(css) || [])[1]);
  assert.ok(z('.coach') < z('.sos-btn'), 'coach layer under the SOS button');
  assert.match(css, /\[data-route="sos"\][^{]*#coach/);
  const g = readFileSync(src('ui-guidance.js'), 'utf8');
  assert.ok(!/setTimeout\([^)]*sos/i.test(g), 'no delay on the way to SOS');
});

test('guidance: a tap elsewhere closes the overlay and goes through; a tap toward SOS marks nothing', async () => {
  const w = world({ hash: '#/today' });
  try {
    const p = G.coach('tour');
    const btn = w.doc.createElement('button'); w.doc.getElementById('main').appendChild(btn);
    w.doc.fire('click', { target: btn });
    assert.equal(await p, 'skipped');
    assert.deepEqual(w.calls.filter((c) => c[0] === 'done'), [['done', 'tour', { skipped: true }]]);
    const p2 = G.coach('tour');
    const sos = w.doc.createElement('a'); sos.setAttribute('id', 'sos-btn'); sos.setAttribute('href', '#/sos'); w.doc.body.appendChild(sos);
    const inner = w.doc.createElement('span'); sos.appendChild(inner);
    w.doc.fire('click', { target: inner });
    assert.equal(await p2, 'aborted');
    assert.equal(w.calls.filter((c) => c[0] === 'done').length, 1, 'SOS marks nothing');
    const p3 = G.coach('tour');
    const pop = byClass(w.doc.getElementById('coach'), 'coach-pop')[0];
    w.doc.fire('click', { target: pop });
    assert.equal(G.isOpen(), true, 'a tap inside the popover keeps it open');
    w.doc.fire('keydown', { key: 'Escape' });
    assert.equal(await p3, 'skipped');
  } finally { cleanup(); }
});

/* ── U-26: the game surfaces (offline/src/ui-game.js), over the real Engine ─────────────────── */

const GameUI = require(src('ui-game.js'));
const RealEngine = require(src('engine.js'));
const NOW = new Date('2026-11-07T12:00:00+05:30');
let seq = 0;
const ev = (type, at, payload) => ({ id: 'e' + (++seq), type, at, payload: payload || {} });
function gameView(rows) {
  const r = Object.assign({ events: [], logs: [], responses: [], contacts: [], quests: [], predictions: [], plans: [], profile: [], settings: [] }, rows || {});
  return { rows: r, list: (s) => r[s] || [], get: (s, k) => (r[s] || []).find((x) => x.key === k || x.id === k) || null };
}
function gameWorld(opts) {
  const o = opts || {};
  const doc = fakeDom();
  if (o.bodyClass) doc.body.setAttribute('class', o.bodyClass);
  if (o.motion) doc.documentElement.setAttribute('data-motion', o.motion);
  globalThis.document = doc;
  globalThis.window = { addEventListener() {}, removeEventListener() {} };
  globalThis.location = { hash: o.hash || '#/today' };
  GameUI._reset();
  return doc;
}
function gameCleanup() {
  GameUI._reset();
  for (const k of ['document', 'window', 'location']) delete globalThis[k];
}
function practisedView() {
  const v = gameView({ profile: [{ key: 'me', startDate: '2026-10-20' }] });
  const e = v.rows.events;
  for (let i = 0; i < 8; i += 1) e.push(ev('SkillUsed', `2026-11-0${1 + (i % 6)}T10:0${i}:00+05:30`, { skillId: 'sober', helpful: true }));
  e.push(ev('SkillUsed', '2026-11-02T09:00:00+05:30', { skillId: 'trial', helpful: false }));
  e.push(ev('SosCompleted', '2026-11-03T21:00:00+05:30', { outcome: 'passed' }));
  e.push(ev('LessonCompleted', '2026-11-04T08:00:00+05:30', { lessonId: 'm1-l1' }));
  e.push(ev('SlipReviewed', '2026-11-05T08:00:00+05:30', {}));
  return v;
}
const ctxOf = (view) => ({ view, E: RealEngine, now: NOW });

test('game: xp, mastery, badges never decrease after SlipLogged', () => {
  const v = practisedView();
  const before = GameUI.model(RealEngine.gameState(v, NOW));
  assert.ok(before.xp.total > 0, 'practice earns XP');
  assert.ok(before.badges.some((b) => b.earned), 'a badge is earned');
  // logged now (the log is append-only: a slip is written when it is told, never back in time)
  v.rows.events.push(ev('SlipLogged', '2026-11-07T11:00:00+05:30', { date: '2026-11-06' }));
  v.rows.events.push(ev('SlipLogged', '2026-11-07T11:05:00+05:30', { date: '2026-11-07' }));
  v.rows.logs.push({ id: 'l1', type: 'slip', date: '2026-11-06', at: '2026-11-07T11:00:00+05:30' });
  const after = GameUI.model(RealEngine.gameState(v, NOW));
  assert.ok(after.xp.total >= before.xp.total, 'xp');
  for (const s of before.skills) {
    const a = after.skills.find((x) => x.id === s.id);
    assert.ok(a.level >= s.level && a.uses >= s.uses, 'mastery of ' + s.id);
  }
  for (const r of before.regions) assert.ok(after.regions.find((x) => x.id === r.id).level >= r.level, 'region ' + r.id);
  for (const b of before.badges.filter((x) => x.earned)) assert.ok(after.badges.find((x) => x.id === b.id).earned, 'badge ' + b.id);
  assert.ok(after.days.total >= before.days.total, 'total days');
  assert.deepEqual(after.rank, before.rank);
  // a SlipLogged is worth no points: the slip itself adds nothing and takes nothing
  assert.equal(after.xp.total, before.xp.total);
  // the panel shows no run that a slip could reset
  gameWorld();
  try {
    const p = GameUI.panel(ctxOf(v));
    assert.ok(!/streak/i.test(p.textContent));
    assert.equal(byTest(p, 'xp-total')[0].textContent, String(after.xp.total));
  } finally { gameCleanup(); }
});

test('game: celebrate skipped in calm mode and on SOS', () => {
  for (const o of [{ bodyClass: 'calm' }, { hash: '#/sos' }, { hash: '#/sos?drill=1' }, { motion: 'reduce' }]) {
    const doc = gameWorld(o);
    try {
      assert.equal(GameUI.celebrate('badge', 'First Wave'), false, JSON.stringify(o));
      assert.equal(byTest(doc.body, 'celebrate').length, 0);
    } finally { gameCleanup(); }
  }
  const doc = gameWorld();
  try {
    assert.equal(GameUI.celebrate('badge', 'First Wave'), true);
    const n = byTest(doc.body, 'celebrate');
    assert.equal(n.length, 1);
    assert.equal(n[0].getAttribute('role'), 'status');
    assert.ok(n[0].textContent.includes('First Wave'));
    GameUI.celebrate('rank', 'Explorer');
    assert.equal(byTest(doc.body, 'celebrate').length, 1, 'one at a time');
    // the 240 ms entrance stays under 300 ms, and the styles switch it off under reduced motion and in Calm mode
    const css = readFileSync(src('styles.css'), 'utf8');
    const sec = css.slice(css.indexOf('/* -- game-tutorials -- */'), css.indexOf('/* -- end game-tutorials -- */'));
    const ms = /\.gm-celebrate\s*\{[^}]*animation:\s*gm-pop\s+(\d+)ms/.exec(sec);
    assert.ok(ms && Number(ms[1]) < 300);
    assert.ok(/\[data-motion="reduce"\] \.gm-celebrate \{ animation: none/.test(sec));
    assert.ok(/body\.calm \.gm-panel, body\.calm \.gm-celebrate/.test(sec));
  } finally { gameCleanup(); }
});

test('game: shelf lists every Content.badges', () => {
  gameWorld();
  try {
    const v = practisedView();
    const shelf = GameUI.badgeShelf(ctxOf(v));
    const items = byTest(shelf, 'badge');
    assert.deepEqual(items.map((n) => n.getAttribute('data-badge')), C.badges.map((b) => b.id));
    const earned = new Set(RealEngine.badges(v, NOW).map((b) => b.id));
    for (const n of items) {
      const id = n.getAttribute('data-badge');
      assert.equal(n.getAttribute('data-earned'), earned.has(id) ? 'true' : 'false', id);
      if (!earned.has(id)) assert.ok(n.textContent.includes('How to earn: '), id);
      assert.ok(!/\d+ (more|to go|left)/i.test(n.textContent), 'no countdown on ' + id);
    }
    for (const b of C.badges) assert.ok(Object.prototype.hasOwnProperty.call(GameUI.HOW, b.id), 'a how-to-earn line for ' + b.id);
  } finally { gameCleanup(); }
});

test('game: regionLight 0..5', () => {
  const empty = gameView();
  for (const r of Object.keys(C.regions)) assert.equal(GameUI.regionLight(ctxOf(empty), r), 0);
  const v = gameView();
  for (let i = 0; i < 40; i += 1) v.rows.events.push(ev('SkillUsed', `2026-11-01T10:${String(i).padStart(2, '0')}:00+05:30`, { skillId: 'sober' }));
  v.rows.events.push(ev('SkillUsed', '2026-11-02T10:00:00+05:30', { skillId: 'call' }));
  const ctx = ctxOf(v);
  for (const r of Object.keys(C.regions)) {
    const l = GameUI.regionLight(ctx, r);
    assert.ok(Number.isInteger(l) && l >= 0 && l <= 5, r + ' ' + l);
    assert.equal(l, RealEngine.gameState(v, NOW).regions[r]);
  }
  assert.equal(GameUI.regionLight(ctx, 'cove'), 5);
  assert.equal(GameUI.regionLight(ctx, 'pier'), 1);
  assert.equal(GameUI.regionLight(ctx, 'nowhere'), 0);
  assert.equal(GameUI.regionLight({ view: v, E: null, now: NOW }, 'cove') >= 0, true);
});

test('game: panel renders from the Engine, hides in Calm mode, celebrates only what is new', () => {
  const doc = gameWorld();
  try {
    const v = practisedView();
    assert.equal(GameUI.panel(Object.assign(ctxOf(v), { calm: true })), null);
    const p = GameUI.panel(ctxOf(v));
    assert.equal(p.getAttribute('data-tour'), 'game-panel');
    assert.equal(byTest(p, 'region-light').length, Object.keys(C.regions).length);
    assert.equal(byTest(p, 'badge').length, C.badges.length);
    assert.ok(byTest(p, 'rank-card').length === 1 && byTest(p, 'game-xp').length === 1);
    assert.equal(byTest(doc.body, 'celebrate').length, 0, 'the first panel only remembers');
    v.rows.events.push(ev('WeeklyReviewCompleted', '2026-11-06T09:00:00+05:30'));
    GameUI.panel(ctxOf(v));
    assert.equal(byTest(doc.body, 'celebrate').length, 0, 'no new badge, no celebration');
    for (let i = 0; i < 3; i += 1) v.rows.events.push(ev('WeeklyReviewCompleted', `2026-11-06T1${i}:00:00+05:30`));
    GameUI.panel(ctxOf(v));
    const c = byTest(doc.body, 'celebrate');
    assert.equal(c.length, 1);
    assert.ok(c[0].textContent.includes('Planner'));
  } finally { gameCleanup(); }
});
