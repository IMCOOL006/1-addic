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
