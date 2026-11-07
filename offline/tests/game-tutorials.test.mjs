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

/* ── U-28: the tools and mini-games (offline/src/ui-tools.js) ─────────────────────────────────
   Content.games and the exercises trial, should-i-go, obstacles and rewrite-scene come from the content lane
   (be0f806d); these stand-ins have exactly that shape and are put in place only for the test that needs them. */
const T = require(src('ui-tools.js'));
const GAMES_STANDIN = {
  sort: [
    { id: 'st1', thought: 'One bad meeting and the whole week is lost.', trap: 'black-white' },
    { id: 'st2', thought: 'Nothing I do ever works out.', trap: 'black-white' },
    { id: 'st3', thought: 'She was only being polite.', trap: 'discount' },
  ],
  flag: { title: 'A test chat', lines: [{ who: 'A', t: 'Long day.' }, { who: 'A', t: 'I deserve it.' }, { who: 'B', t: 'Food?' }, { who: 'A', t: 'Just one.' }],
    redFlags: [1, 3], why: ['Why one.', 'Why two.'] },
  bigGame: { title: 'A test evening', character: { name: 'Asha', bio: 'A test character.' }, clinicalReview: true, start: 'b1',
    scenes: [
      { id: 'b1', text: 'Scene one.', choices: [{ t: 'Go on', to: 'b2', note: 'Note one.' }, { t: 'Stop here', to: null, note: 'An early end.' }] },
      { id: 'b2', text: 'Scene two.', choices: [{ t: 'Go home', to: null, note: 'A safe end.' }] },
    ] },
  refusal: [
    { id: 'rf1', clinicalReview: true, scene: 'Someone offers you a drink.', responses: [
      { t: '"No, thank you."', rating: 'best', why: 'Clear.' }, { t: '"Maybe later."', rating: 'weak', why: 'Invites a second ask.' }] },
  ],
};
const EXERCISES_STANDIN = [
  { id: 'trial', title: 'Put it on trial', kind: 'tool', skill: 'trial', fields: [
    { id: 'mode', type: 'single', label: 'What kind of thought is it?', optional: true, options: [{ id: 'redflag', label: 'A red-flag thought' }, { id: 'mood', label: 'A mood thought' }] },
    { id: 'thought', type: 'text', label: 'The thought, word for word' },
    { id: 'trap', type: 'single', label: 'Does it fall into a thinking trap?', from: 'catalogs.distortions', optional: true },
    { id: 'against', type: 'textarea', label: 'The evidence against it' },
    { id: 'thenWhat', type: 'textarea', label: 'And then what?', optional: true },
    { id: 'comeback', type: 'text', label: 'Your closing statement' }],
    tutorial: { example: { cast: 'meera', values: { mode: 'redflag', thought: 'Just one.', against: 'It never is.', comeback: 'One is never one for me.' } }, built: 'Your comeback is saved.' } },
  { id: 'should-i-go', title: 'Should I go?', kind: 'tool', skill: 'should-i-go', fields: [
    { id: 'choice', type: 'text', label: 'What are you deciding?' }, { id: 'steps', type: 'check', label: 'Which steps?', from: 'catalogs.sid' },
    { id: 'options', type: 'list', label: 'Your options', max: 5 }, { id: 'pick', type: 'text', label: 'The most protective option' },
    { id: 'exit', type: 'textarea', label: 'Your exit plan', optional: true }] },
  { id: 'obstacles', title: 'Get past an obstacle', kind: 'tool', skill: 'problem-solve', fields: [
    { id: 'obstacle', type: 'text', label: 'What gets in the way?' },
    { id: 'options', type: 'rows', label: 'Ways around it', max: 5, columns: [{ id: 'option', label: 'A way' }, { id: 'pros', label: 'Good' }, { id: 'cons', label: 'Bad' }] },
    { id: 'pick', type: 'text', label: 'The one you will try' }] },
  { id: 'rewrite-scene', title: 'Replay and rewrite', kind: 'reflect', skill: 'beat', clinicalReview: true, fields: [
    { id: 'scene', type: 'textarea', label: 'What happened?' }, { id: 'did', type: 'textarea', label: 'What did you do?' }, { id: 'rewrite', type: 'textarea', label: 'Next time?' }] },
];
function toolsWorld(opts) {
  const o = opts || {};
  const doc = fakeDom();
  const calls = [];
  const saved = { games: C.games, exercises: C.exercises };
  if (o.games) C.games = o.games; else delete C.games;
  C.exercises = o.exercises ? arrOf(saved.exercises).filter((x) => !o.exercises.some((s) => s.id === x.id)).concat(o.exercises) : arrOf(saved.exercises).filter((x) => !EXERCISES_STANDIN.some((s) => s.id === x.id));
  globalThis.document = doc;
  globalThis.location = { hash: '#/tools' };
  globalThis.Actions = {
    saveResponse: async (id, p, x) => { calls.push(['save', id, p, x]); return { response: { id: 'r1' } }; },
    recordEvent: async (t, p) => { calls.push(['event', t, p]); return {}; },
  };
  return { doc, calls, restore() { C.games = saved.games; if (saved.games === undefined) delete C.games; C.exercises = saved.exercises; for (const k of ['document', 'location', 'Actions']) delete globalThis[k]; } };
}
function arrOf(x) { return Array.isArray(x) ? x : []; }
function routeCtx(hash) {
  const [path, qs] = hash.replace(/^#/, '').split('?');
  const query = {};
  for (const pair of (qs || '').split('&').filter(Boolean)) { const [k, v] = pair.split('='); query[k] = decodeURIComponent(v || ''); }
  return { route: { path, parts: path.split('/').filter(Boolean), query } };
}
const page = (hash) => { const c = routeCtx(hash); return c.route.parts[0] === 'tools' ? T.toolsPage(c) : T.gamesPage(c); };
const one = (n, t) => { const r = byTest(n, t); assert.equal(r.length, 1, 'one [data-test=' + t + ']'); return r[0]; };
function type(n, value) { n.value = value; (n.on.input || []).forEach((fn) => fn({ type: 'input', target: n })); }
const ROUTES = ['#/tools', '#/tools/trial', '#/tools/trial?mode=redflag&thought=Just%20one', '#/tools/should-i-go', '#/tools/problem-solver', '#/tools/nowhere',
  '#/games', '#/games/big-game', '#/games/distortion-sort', '#/games/spot-red-flag', '#/games/refusal', '#/games/rewrite', '#/games/nowhere',
  '#/tools/trial?drill=1', '#/games/refusal?drill=1'];

test('tools: every route renders a node or a stub', () => {
  for (const full of [false, true]) {
    const w = toolsWorld(full ? { games: GAMES_STANDIN, exercises: EXERCISES_STANDIN } : {});
    try {
      for (const r of ROUTES) {
        const n = page(r);
        assert.ok(n && n.tagName === 'section', r);
        assert.ok(['tools-page', 'games-page'].includes(n.getAttribute('data-test')), r + ' is a tools or games page');
        const stub = byTest(n, 'tool-stub');
        const sub = routeCtx(r).route.parts[1];
        if (stub.length) assert.ok(n.all((x) => x.tagName === 'a' && x.getAttribute('href')).length >= 1, r + ': a stub has a way back');
        if (!sub) assert.equal(stub.length, 0, r + ': an index is never a stub');
        if (full && sub && sub !== 'nowhere') assert.equal(stub.length, 0, r + ' plays from content');
        if (!full && ['trial', 'should-i-go', 'problem-solver', 'big-game', 'refusal', 'rewrite'].includes(sub)) assert.equal(stub.length, 1, r + ' is an honest stub without its content');
        if (['distortion-sort', 'spot-red-flag'].includes(sub)) assert.equal(stub.length, 0, r + ' plays from catalogs');
        if (sub === 'nowhere') assert.equal(stub.length, 1);
      }
      const idx = page('#/games');
      for (const g of T.GAMES) one(idx, 'tool-link-' + g.id);
      const cards = byTest(idx, 'game-card');
      assert.equal(cards.length, T.GAMES.length, 'one game-card per game on #/games');
      assert.deepEqual(cards.map((x) => x.getAttribute('data-game')), T.GAMES.map((g) => g.id));
      assert.equal(byTest(page('#/tools'), 'game-card').length, 0, 'no game-card on #/tools');
    } finally { w.restore(); }
  }
});

test('tools: distortion sort scores from catalogs', async () => {
  const w = toolsWorld({});
  try {
    const items = T.sortItems(C);
    assert.equal(items.length, C.catalogs.distortions.length);
    for (const it of items) assert.ok(C.catalogs.distortions.some((d) => d.id === it.trap));
    assert.deepEqual(T.sortSummary(items, items.map((it) => it.trap)), { firstTry: items.length, total: items.length });
    assert.equal(T.sortSummary(items, items.map(() => 'nope')).firstTry, 0);
    const n = page('#/games/distortion-sort');
    items.forEach((it, i) => {
      const wrong = C.catalogs.distortions.find((d) => d.id !== it.trap).id;
      one(n, 'sort-bin-' + (i === 0 ? wrong : it.trap)).click();
      assert.ok(one(n, 'sort-feedback').textContent.length > 0, 'feedback after a pick');
      one(n, 'sort-next').click();
    });
    assert.equal(one(n, 'sort-score').textContent, T.TEXT.sorted(items.length - 1, items.length));
    one(n, 'game-helped-yes').click();
    await flush();
    assert.deepEqual(w.calls, [['event', 'SkillUsed', { skillId: 'spot-trap', helpful: true }]]);
  } finally { w.restore(); }
  const w2 = toolsWorld({ games: GAMES_STANDIN });
  try {
    assert.deepEqual(T.sortItems(C).map((x) => x.id), ['st1', 'st3', 'st2'], 'own items, traps round-robin');
  } finally { w2.restore(); }
});

test('tools: trial saves one Comeback', async () => {
  const w = toolsWorld({ exercises: EXERCISES_STANDIN });
  try {
    const n = page('#/tools/trial?mode=redflag&thought=Just%20one');
    assert.equal(one(n, 'tl-field-thought').value, 'Just one', 'the thought prefills');
    one(n, 'tl-next').click(); // the charge
    one(n, 'tl-next').click(); // the case for it (optional)
    one(n, 'tl-next').click(); // the case against: evidence missing
    assert.match(one(n, 'tl-live').textContent, /evidence against/);
    type(one(n, 'tl-field-against'), 'It never stays at one.');
    one(n, 'tl-next').click();
    one(n, 'tl-next').click(); // the verdict (optional)
    one(n, 'tl-save').click();
    await flush();
    assert.equal(w.calls.length, 0, 'no save without a closing statement');
    assert.equal(byTest(n, 'tl-field-comeback').length, 0, 'the closing field carries the contract hook');
    type(one(n, 'trial-closing'), 'One is never one for me.');
    one(n, 'tl-save').click();
    one(n, 'tl-save').click();
    await flush();
    const saves = w.calls.filter((c) => c[0] === 'save');
    assert.equal(saves.length, 1, 'exactly one save');
    assert.equal(saves[0][1], 'trial');
    assert.deepEqual(saves[0][3], { mode: 'workbook' });
    assert.equal(saves[0][2].comeback, 'One is never one for me.');
    assert.equal(saves[0][2].thought, 'Just one');
    assert.equal(saves[0][2].mode, 'redflag');
    one(n, 'tl-done');
  } finally { w.restore(); }
});

test('tools: drill saves nothing', async () => {
  const w = toolsWorld({ games: GAMES_STANDIN, exercises: EXERCISES_STANDIN });
  try {
    const n = page('#/tools/trial?drill=1');
    one(n, 'drill-banner');
    assert.equal(one(n, 'tl-field-thought').value, 'Just one.', 'a drill uses the sample answers');
    for (let i = 0; i < 4; i++) one(n, 'tl-next').click();
    one(n, 'tl-save').click();
    await flush();
    one(n, 'tl-done');
    const r = page('#/games/refusal?drill=1');
    one(r, 'drill-banner');
    one(r, 'rf-option-0').click();
    one(r, 'rf-next').click();
    assert.equal(byTest(r, 'game-helped-yes').length, 0, 'a drill offers no event');
    await flush();
    assert.deepEqual(w.calls, [], 'nothing saved, nothing recorded');
  } finally { w.restore(); }
});

test('tools: refusal is a stub without Content.games.refusal', async () => {
  const w = toolsWorld({});
  try {
    assert.equal(T.refusalModel(C), null);
    one(page('#/games/refusal'), 'tool-stub');
    assert.equal(T.bigGameModel(C), null);
    one(page('#/games/big-game'), 'tool-stub');
  } finally { w.restore(); }
  const w2 = toolsWorld({ games: GAMES_STANDIN });
  try {
    const n = page('#/games/refusal');
    one(n, 'rf-option-1').click();
    assert.match(one(n, 'rf-feedback').textContent, /Invites a second ask/);
    assert.ok(n.textContent.includes(T.TEXT.strongHere + '"No, thank you."'), 'the strong answer is shown');
    for (const k of C.catalogs.refusal) assert.ok(n.textContent.includes(k), 'feedback against catalogs.refusal');
    one(n, 'rf-next').click();
    one(n, 'rf-end');
    one(n, 'game-helped-no').click();
    await flush();
    assert.deepEqual(w2.calls, [['event', 'SkillUsed', { skillId: 'refuse', helpful: false }]]);
  } finally { w2.restore(); }
});

test('tools: big game branches and ends on to: null; red flags score from Content.games.flag or catalogs', () => {
  const w = toolsWorld({ games: GAMES_STANDIN });
  try {
    const m = T.bigGameModel(C);
    assert.equal(m.character.name, 'Asha');
    assert.equal(T.bigGameNext(m, 'b1', 0), 'b2');
    assert.equal(T.bigGameNext(m, 'b1', 1), null);
    const n = page('#/games/big-game');
    one(n, 'bg-character');
    one(n, 'bg-choice-0').click();
    assert.equal(one(n, 'bg-note').textContent, 'Note one.');
    one(n, 'bg-next').click();
    assert.equal(one(n, 'bg-text').textContent, 'Scene two.');
    one(n, 'bg-choice-0').click();
    one(n, 'bg-next').click();
    assert.ok(one(n, 'bg-end').textContent.includes('A safe end.'));
    one(n, 'bg-restart').click();
    assert.equal(one(n, 'bg-text').textContent, 'Scene one.');
    const f = page('#/games/spot-red-flag');
    one(f, 'flag-line-1').click();
    one(f, 'flag-line-2').click();
    one(f, 'flag-check').click();
    assert.equal(one(f, 'flag-result').textContent, T.TEXT.found(1, 2));
    assert.deepEqual(T.scoreFlags(T.flagModel(C), new Set([1, 2])), { found: 1, missed: 1, extra: 1, total: 2 });
  } finally { w.restore(); }
  const w2 = toolsWorld({});
  try {
    const fm = T.flagModel(C);
    assert.ok(fm.flags.size > 0 && fm.lines.length > fm.flags.size, 'built from catalogs.redFlags with plain lines between');
    for (const i of fm.flags) assert.ok(C.catalogs.redFlags.includes(fm.lines[i].t));
  } finally { w2.restore(); }
});

/* ── FIX-TOUR: UI.tour.* never keeps a caller waiting ───────────────────────────────────── */

test('guidance: UI.tour.start returns nothing and opens the coach', async () => {
  const w = world({ hash: '#/today' });
  const path = require.resolve(src('ui-guidance.js'));
  const cached = require.cache[path];
  globalThis.UI = {};
  delete require.cache[path];
  let G2 = null;
  try {
    G2 = require(path); // a fresh copy attaches UI.tour at load, as the page does
    G2._reset();
    assert.equal(typeof globalThis.UI.tour.start, 'function');
    const tour = C.tutorials.find((t) => t.id === 'tour');
    for (const s of tour.steps) target(w.doc, s.target);
    const r = globalThis.UI.tour.start('tour');
    assert.equal(r, undefined, 'not a thenable: page.evaluate does not wait for the tour to close');
    const layer = w.doc.getElementById('coach');
    assert.equal(layer.hasAttribute('hidden'), false, 'the coach layer is open');
    assert.equal(byClass(layer, 'coach-layer').length, 1);
    assert.deepEqual(w.calls[0], ['replay', 'tour']);
    for (let i = 0; i < tour.steps.length; i++) byClass(layer, 'coach-next')[0].click();
    await flush();
    assert.deepEqual(w.calls.filter((c) => c[0] === 'done'), [['done', 'tour', undefined]], 'the end is TutorialCompleted');
    assert.equal(globalThis.UI.tour.replay(), undefined, 'replay returns nothing too');
    assert.equal(byClass(layer, 'coach-layer').length, 1, 'replay opens the coach');
    assert.equal(typeof G2.coach('tour', { replay: true }).then, 'function', 'GuidanceUI.coach still returns its Promise');
  } finally {
    if (G2) G2._reset();
    if (cached) require.cache[path] = cached; else delete require.cache[path];
    delete globalThis.UI;
    cleanup();
  }
});

test('guidance: the coach popover keeps clear of the SOS button', async () => {
  const w = world({ hash: '#/today' });
  try {
    const sos = w.doc.createElement('a'); sos.setAttribute('id', 'sos-btn'); sos.setAttribute('data-tour', 'sos-button');
    sos.rect = { top: 664, left: 318, bottom: 720, right: 374, width: 56, height: 56 };
    w.doc.body.appendChild(sos);
    const tour = C.tutorials.find((t) => t.id === 'tour');
    for (const s of tour.steps) if (s.target !== 'sos-button') target(w.doc, s.target, { top: 736, bottom: 800, left: 0, right: 78 });
    const p = G.coach('tour', { replay: true });
    const layer = w.doc.getElementById('coach');
    const bottomOf = () => parseInt(byClass(layer, 'coach-pop')[0].style.bottom, 10);
    for (let i = 0; i < tour.steps.length; i++) {
      assert.ok(bottomOf() >= 800 - 664 + 12, 'step ' + (i + 1) + ': the popover sits above SOS, so SOS never lands on its buttons');
      byClass(layer, 'coach-next')[0].click();
    }
    assert.equal(await p, 'done');
  } finally { cleanup(); }
});
