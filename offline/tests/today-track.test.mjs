// Lane today-track's Node tests (node:test, no dependencies). U-15: the Today screen in offline/src/ui-today.js; U-16: the
// Track screen in offline/src/ui-track.js, saving through the real Actions over the real Store in Node memory mode.
// (BUILD-PLAN 3.5 #/today, tracks/SCREENS/contracts/today-track.md "TodayUI"). The pure functions run directly; the
// page renders on a tiny stand-in DOM and the test walks the node tree it returns (as learn.test.mjs does).
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
const E = require(src('engine.js'));
const T = require(src('ui-today.js'));
const classic = (file, name) => vm.runInThisContext(`(function () {
${readFileSync(src(file), 'utf8')}
return ${name};
})()`, { filename: src(file) });
const TD = classic('ui-today.js', 'TodayUI');
const TRK = require(src('ui-track.js'));
const TR = classic('ui-track.js', 'TrackUI');
const KNOWN = JSON.parse('[' + /const KNOWN = \[([^\]]+)\]/.exec(readFileSync(src('ui-core.js'), 'utf8'))[1].replace(/'/g, '"') + ']');

const at = (y, mo, d, hr = 9, mi = 0) => new Date(y, mo - 1, d, hr, mi);
const NOW = at(2026, 11, 7, 9);
const TODAY = '2026-11-07';
let seq = 0;
const ev = (type, payload, when) => ({ id: 'e' + (++seq), type, at: (when || NOW).toISOString(), payload: payload || {} });
const checkinLog = (kind, when, extra) => Object.assign({ id: 'l' + (++seq), type: 'checkin', at: when.toISOString(), date: T.localDate(when), checkin: { kind } }, extra || {});
const viewOf = (rows) => E.makeView(rows);

function fakeDom() {
  class Node {
    constructor(tag) { this.tagName = tag; this.nodeType = tag === '#text' ? 3 : 1; this.children = []; this.attrs = {}; this.on = {}; this.style = {}; this.hidden = false; this._text = ''; this.parentNode = null; }
    appendChild(c) { this.children.push(c); c.parentNode = this; return c; }
    setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'hidden') this.hidden = true; }
    removeAttribute(k) { delete this.attrs[k]; if (k === 'hidden') this.hidden = false; }
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null; }
    addEventListener(t, fn) { (this.on[t] = this.on[t] || []).push(fn); }
    fire(t) { const e = { type: t, preventDefault() {}, key: '' }; (this.on[t] || []).forEach((fn) => fn(e)); }
    set textContent(v) { this.children = []; this._text = String(v); }
    get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
    all(pred, out = []) { for (const c of this.children) { if (pred(c)) out.push(c); c.all(pred, out); } return out; }
  }
  return { createElement: (t) => new Node(t), createTextNode: (s) => { const n = new Node('#text'); n._text = String(s); return n; } };
}
const byTest = (root, v) => root.all((n) => n.getAttribute && n.getAttribute('data-test') === v);
const tick = () => new Promise((r) => setTimeout(r, 0));

function stubActions() {
  const calls = [];
  const ok = (name) => async (...a) => { calls.push([name, ...a]); return {}; };
  return { calls, markTipShown: ok('markTipShown'), recordEvent: ok('recordEvent'), settings: { patch: ok('settings.patch') } };
}
function ctxFor(rows, extra) {
  const view = viewOf(rows);
  const profile = view.get('profile', 'me') || {};
  const settings = view.get('settings', 'app') || {};
  return Object.assign({ view, E, A: stubActions(), profile, settings, term: E.term(profile), now: NOW, features: E.revealed(view), calm: !!settings.calm,
    route: { path: '/today', parts: ['today'], query: {} } }, extra || {});
}
function render(rows, extra) {
  const c = ctxFor(rows, extra);
  TD._resetTip();
  return { c, root: TD.page(c) };
}
const settingsRow = (o) => Object.assign({ key: 'app', counters: true, showCurrentRun: false, discreet: false, tips: true, calm: false, maintenance: false,
  lastTipDay: null, lastBackupAt: null, backupReminderDismissedAt: null, milestonesSeen: [] }, o || {});

/* A sample profile: the person's own rows plus rows marked sample (O6), with something on every card. */
function sampleRows() {
  const t = (d, hr) => at(2026, 11, d, hr);
  return {
    profile: [{ key: 'me', name: 'Asha', companion: 'Kite', startDate: '2026-10-01', term: 'sober', pace: 'steady', checkin: { morning: '08:00', evening: '21:00' } }],
    settings: [settingsRow({ showCurrentRun: true, lastBackupAt: t(1, 9).toISOString() })],
    events: [ev('LessonCompleted', { lessonId: 'm0-l1' }, t(5, 10)), ev('CheckinCompleted', { kind: 'evening' }, t(6, 21)), ev('SlipLogged', { date: '2026-10-20' }, at(2026, 10, 20, 22))],
    logs: [checkinLog('evening', t(6, 21)), { id: 'l-c', type: 'craving', at: t(6, 19).toISOString(), date: '2026-11-06', intensity: 6, triggerIds: [] },
      { id: 'l-s', type: 'slip', at: at(2026, 10, 20, 22).toISOString(), date: '2026-10-20' },
      { id: 'l-x', type: 'craving', at: t(6, 18).toISOString(), date: '2026-11-06', intensity: 3, sample: true }],
    responses: [{ id: 'r1', exerciseId: 'quick-reasons', payload: { reasons: ['To be there for my kids', 'To sleep well again'] }, at: t(2, 9).toISOString(), draft: false }],
    plans: [
      { id: 'p2', date: TODAY, start: '19:00', end: '21:00', title: 'Evening at home', kind: 'risky', risky: true, status: 'planned',
        battlePlan: { situation: 'Alone after work', plan: 'Call Ravi and go for a walk', backups: ['Cook dinner'] } },
      { id: 'p1', date: TODAY, start: '07:00', end: '08:00', title: 'Walk by the lake', kind: 'want', risky: false, status: 'planned' },
      { id: 'p3', date: TODAY, start: '12:00', end: '13:00', title: 'Lunch with Meera', kind: 'should', status: 'planned', sample: true },
      { id: 'p0', date: '2026-11-06', start: '10:00', title: 'Yesterday', kind: 'should', status: 'planned' },
      { id: 'p9', date: TODAY, start: '15:00', title: 'Skipped', kind: 'should', status: 'skipped' }],
    quests: [{ id: 'crew', startedAt: t(3, 9).toISOString(), ticks: { nets: t(3, 9).toISOString() }, completedAt: null }],
    reveals: [{ id: 'planner', revealedAt: t(1, 9).toISOString() }, { id: 'battlePlans', revealedAt: t(1, 9).toISOString() }, { id: 'quests', revealedAt: t(1, 9).toISOString() }],
  };
}

test('today: greeting by hour', () => {
  for (const eng of [E, null]) {
    assert.equal(T.greetingFor(at(2026, 11, 7, 8), { name: 'Asha' }, eng), 'Good morning, Asha.');
    assert.equal(T.greetingFor(at(2026, 11, 7, 14), { name: ' Asha ' }, eng), 'Good afternoon, Asha.');
    assert.equal(T.greetingFor(at(2026, 11, 7, 20), {}, eng), 'Good evening.');
    assert.equal(T.greetingFor(at(2026, 11, 7, 3), { name: '' }, eng), 'Hello.');
  }
});

test('today: check-in kind by time and done-state', () => {
  const v = (logs) => viewOf({ logs });
  const m = checkinLog('morning', at(2026, 11, 7, 8));
  const e = checkinLog('evening', at(2026, 11, 7, 18));
  assert.equal(T.checkinKind(v([]), at(2026, 11, 7, 8), {}), 'morning');
  assert.equal(T.checkinKind(v([m]), at(2026, 11, 7, 9), {}), null, 'morning done before noon');
  assert.equal(T.checkinKind(v([]), at(2026, 11, 7, 13), {}), 'morning', 'between: the one not done');
  assert.equal(T.checkinKind(v([m]), at(2026, 11, 7, 13), {}), 'evening');
  assert.equal(T.checkinKind(v([m, e]), at(2026, 11, 7, 13), {}), null);
  assert.equal(T.checkinKind(v([m]), at(2026, 11, 7, 17), {}), 'evening', 'from 17:00');
  assert.equal(T.checkinKind(v([e]), at(2026, 11, 7, 20), {}), null);
  assert.equal(T.checkinKind(v([checkinLog('evening', at(2026, 11, 6, 21))]), at(2026, 11, 7, 20), {}), 'evening', 'yesterday does not count');
  assert.equal(T.checkinKind(v([checkinLog('evening', at(2026, 11, 7, 18), { drill: true })]), at(2026, 11, 7, 20), {}), 'evening', 'a drill does not count');
  // With the person's own times (profile.checkin 'HH:MM'): morning until the midpoint, evening from two hours before.
  const own = { checkin: { morning: '06:00', evening: '22:00' } }; // midpoint 14:00, evening from 20:00
  assert.deepEqual(T.checkinWindows(own), [14 * 60, 20 * 60]);
  assert.deepEqual(T.checkinWindows({ checkin: { morning: null, evening: null } }), [12 * 60, 17 * 60], 'no times: the fixed rule');
  assert.deepEqual(T.checkinWindows({ checkin: { morning: '07:00' } }), [12 * 60, 17 * 60], 'one time only: the fixed rule');
  assert.equal(T.checkinKind(v([m]), at(2026, 11, 7, 13), own), null, 'before the midpoint: morning, and it is done');
  assert.equal(T.checkinKind(v([]), at(2026, 11, 7, 13, 59), own), 'morning');
  assert.equal(T.checkinKind(v([]), at(2026, 11, 7, 14), own), 'morning', 'between: the one not done');
  assert.equal(T.checkinKind(v([m]), at(2026, 11, 7, 17), own), 'evening', 'between: morning done, so evening');
  assert.equal(T.checkinKind(v([]), at(2026, 11, 7, 20), own), 'evening', 'from two hours before the evening time');
  assert.equal(T.checkinKind(v([e]), at(2026, 11, 7, 21), own), null);
  const close = { checkin: { morning: '08:00', evening: '09:00' } }; // evening-2h falls before the midpoint
  assert.deepEqual(T.checkinWindows(close), [8 * 60 + 30, 8 * 60 + 30]);
  globalThis.document = fakeDom();
  try {
    const { root } = render({ logs: [] }, { now: at(2026, 11, 7, 18) });
    assert.equal(byTest(root, 'today-checkin-go')[0].getAttribute('href'), '#/track/log/checkin?kind=evening');
    assert.equal(byTest(render({ logs: [e] }, { now: at(2026, 11, 7, 19) }).root, 'today-checkin').length, 0, 'hidden when done');
  } finally { delete globalThis.document; }
});

test('today: plan data with a risky block and its Battle Plan', () => {
  const rows = T.planToday(viewOf(sampleRows()), NOW);
  assert.deepEqual(rows.map((p) => p.id), ['p1', 'p3', 'p2'], 'today only, by start, skipped left out');
  const risky = rows.find((p) => p.id === 'p2');
  assert.equal(risky.risky, true);
  assert.equal(risky.battlePlan.plan, 'Call Ravi and go for a walk');
  assert.equal(rows.find((p) => p.id === 'p1').battlePlan, null);
  globalThis.document = fakeDom();
  try {
    const { root } = render(sampleRows());
    const plan = byTest(root, 'today-plan')[0];
    assert.match(plan.textContent, /Risky time/, 'risky is said in words, not by colour alone');
    const bp = byTest(plan, 'today-battle');
    assert.equal(bp.length, 1);
    assert.equal(bp[0].tagName, 'details', 'the Battle Plan sits in a collapsed detail');
    assert.match(bp[0].textContent, /Alone after work/);
    assert.match(plan.textContent, /Sample/, 'a sample row carries its tag');
    const empty = render({}).root;
    assert.match(byTest(empty, 'today-plan')[0].textContent, /Nothing planned|opens up as you learn/);
  } finally { delete globalThis.document; }
});

test('today: no overdue wording', () => {
  globalThis.document = fakeDom();
  try {
    const rows = sampleRows();
    rows.plans.push({ id: 'p4', date: TODAY, start: '06:00', end: '06:30', title: 'Stretch', kind: 'should', status: 'planned' });
    const { root } = render(rows, { now: at(2026, 11, 7, 23) });
    assert.doesNotMatch(root.textContent, /\b(overdue|late|missed|behind|failed|broke|streak)\b/i);
    assert.doesNotMatch(readFileSync(src('ui-today.js'), 'utf8'), /\baddicts?\b(?!ed|ion)/i, 'person-first words');
  } finally { delete globalThis.document; }
});

test('today: counters hidden unless opted in; a slip lowers no total', () => {
  const rows = sampleRows();
  const gs = E.gameState(viewOf(rows), NOW);
  assert.equal(gs.counters.tracking, true);
  assert.equal(T.countersData(gs.counters, { counters: false }, false), null, 'off');
  assert.equal(T.countersData(gs.counters, { counters: true }, true), null, 'discreet hides counters');
  assert.equal(T.countersData({ tracking: false, total: 0 }, { counters: true }, false), null, 'no start date: no counter');
  const on = T.countersData(gs.counters, { counters: true, showCurrentRun: false }, false);
  assert.equal(on.current, null, 'the current run only when asked for');
  assert.equal(on.total, gs.counters.total);
  const after = Object.assign({}, rows, {
    logs: rows.logs.concat([{ id: 'l-s2', type: 'slip', at: NOW.toISOString(), date: TODAY }]),
    events: rows.events.concat([ev('SlipLogged', { date: TODAY }, NOW)]),
  });
  const gs2 = E.gameState(viewOf(after), NOW);
  assert.equal(gs2.counters.total, gs.counters.total, 'a slip today lowers no total');
  assert.ok(gs2.xp >= gs.xp, 'nor XP');
  globalThis.document = fakeDom();
  try {
    assert.equal(byTest(render(rows).root, 'today-counters').length, 1);
    const off = sampleRows(); off.settings = [settingsRow({ counters: false })];
    assert.equal(byTest(render(off).root, 'today-counters').length, 0);
    const disc = sampleRows(); disc.settings = [settingsRow({ discreet: true })];
    const d = render(disc).root;
    assert.equal(byTest(d, 'today-counters').length, 0);
    assert.equal(byTest(d, 'today-harbor').length, 0, 'no Harbor in discreet mode');
    assert.equal(byTest(d, 'today-sos')[0].textContent, 'Help');
  } finally { delete globalThis.document; }
});

test('today: milestone shown once', async () => {
  const c = { tracking: true, total: 9, current: 3, nextMilestone: 14, reached: [1, 3, 7] };
  assert.equal(T.milestoneDue(c, { counters: true, milestonesSeen: [] }), 7, 'one card for the highest new one');
  assert.equal(T.milestoneDue(c, { counters: true, milestonesSeen: [1, 3, 7] }), null);
  assert.equal(T.milestoneDue(c, { counters: false, milestonesSeen: [] }), null, 'only with counters on');
  globalThis.document = fakeDom();
  try {
    const rows = sampleRows();
    const { c: ctx, root } = render(rows);
    const card = byTest(root, 'today-milestone');
    assert.equal(card.length, 1);
    assert.doesNotMatch(card[0].textContent, /\bXP\b|points/i, 'words only, no points');
    byTest(card[0], 'today-milestone-thanks')[0].fire('click');
    await tick(); await tick(); await tick();
    const reached = E.gameState(ctx.view, NOW).counters.reached;
    const top = Math.max(...reached);
    const callOf = (name) => ctx.A.calls.filter((x) => x[0] === name);
    assert.deepEqual(callOf('recordEvent'), [['recordEvent', 'MilestoneSeen', { milestone: top }]], 'one MilestoneSeen');
    assert.deepEqual(callOf('settings.patch'), [['settings.patch', { milestonesSeen: reached }]], 'one settings.patch');
    assert.equal(card[0].hidden, true);
    rows.settings = [settingsRow({ showCurrentRun: true, lastBackupAt: rows.settings[0].lastBackupAt, milestonesSeen: reached })];
    assert.equal(byTest(render(rows).root, 'today-milestone').length, 0, 'not shown again');
  } finally { delete globalThis.document; }
});

test('today: backup reminder rules', async () => {
  const data = viewOf({ logs: [{ id: 'l1', type: 'craving', at: NOW.toISOString(), intensity: 4 }] });
  const none = viewOf({});
  const sampleOnly = viewOf({ logs: [{ id: 'l1', type: 'craving', at: NOW.toISOString(), sample: true }] });
  const days = (n) => new Date(NOW.getTime() - n * 86400000).toISOString();
  assert.equal(T.backupDue(none, {}, NOW), false, 'nothing to lose');
  assert.equal(T.backupDue(sampleOnly, {}, NOW), false, 'sample rows do not count');
  assert.equal(T.backupDue(data, { lastBackupAt: null }, NOW), true);
  assert.equal(T.backupDue(data, { lastBackupAt: days(3) }, NOW), false);
  assert.equal(T.backupDue(data, { lastBackupAt: days(15) }, NOW), true);
  assert.equal(T.backupDue(data, { lastBackupAt: days(15), backupReminderDismissedAt: days(2) }, NOW), false);
  assert.equal(T.backupDue(data, { lastBackupAt: null, backupReminderDismissedAt: days(20) }, NOW), true);
  globalThis.document = fakeDom();
  try {
    const { c, root } = render({ logs: [{ id: 'l1', type: 'craving', at: NOW.toISOString(), intensity: 4 }], settings: [settingsRow()] });
    const card = byTest(root, 'today-backup')[0];
    assert.ok(card.all((n) => n.getAttribute && n.getAttribute('href') === '#/settings/data').length === 1);
    byTest(card, 'today-backup-dismiss')[0].fire('click');
    await tick(); await tick();
    const call = c.A.calls.find((x) => x[0] === 'settings.patch');
    assert.deepEqual(call, ['settings.patch', { backupReminderDismissedAt: NOW.toISOString() }]);
    assert.equal(card.hidden, true);
  } finally { delete globalThis.document; }
});

test('today: maintenance variant', () => {
  assert.deepEqual(T.cardsFor({ maintenance: true }), ['checkin', 'plan', 'reasons', 'tip', 'backup']);
  assert.ok(!T.cardsFor({ calm: true }).includes('momentum') && !T.cardsFor({ calm: true }).includes('harbor'), 'calm hides rings and the Harbor');
  globalThis.document = fakeDom();
  try {
    const rows = sampleRows(); rows.settings = [settingsRow({ maintenance: true })];
    const { root } = render(rows);
    for (const k of ['today-maintenance', 'today-plan', 'today-reasons', 'today-sos', 'today-log-craving']) assert.equal(byTest(root, k).length, 1, k);
    for (const k of ['today-quests', 'today-counters', 'today-momentum', 'today-explorer', 'today-learn', 'today-harbor', 'today-milestone', 'today-want']) assert.equal(byTest(root, k).length, 0, k);
  } finally { delete globalThis.document; }
});

test('today: empty and sample profile render with no dead button', async () => {
  globalThis.document = fakeDom();
  try {
    for (const [name, rows] of [['empty', {}], ['sample', sampleRows()]]) {
      const { c, root } = render(rows);
      for (const a of root.all((n) => n.tagName === 'a')) {
        const href = a.getAttribute('href') || '';
        assert.match(href, /^#\//, `${name}: ${href} is a route`);
        const first = href.slice(2).split(/[/?]/)[0];
        // 'status' registers from ui-status.js through UI.pages (ui-core's pageKey accepts any UI.pages key; V-01a)
        assert.ok(KNOWN.includes(first) || first === 'status', `${name}: ${href} goes to a page of 3.5`);
        assert.ok(a.textContent.trim().length > 0, `${name}: ${href} has words`);
      }
      for (const b of root.all((n) => n.tagName === 'button')) assert.ok((b.on.click || []).length > 0, `${name}: button "${b.textContent}" acts`);
      assert.equal(byTest(root, 'today-sos')[0].getAttribute('href'), '#/sos', `${name}: SOS one tap away`);
      assert.equal(byTest(root, 'today-log-craving')[0].getAttribute('href'), '#/track/log/craving');
      for (const k of ['today-checkin', 'today-plan', 'today-reasons', 'today-learn']) assert.equal(byTest(root, k).length, 1, `${name}: ${k}`);
      if (name === 'sample') {
        for (const k of ['today-want', 'today-quests', 'today-counters', 'today-momentum', 'today-explorer']) assert.equal(byTest(root, k).length, 1, `sample: ${k}`);
        assert.match(byTest(root, 'today-reasons')[0].textContent, /my kids|sleep well/);
        assert.match(root.textContent, /Kite is here/);
      }
      const tip = E.pickTip(c.view, NOW, { route: '#/today' });
      if (tip) {
        assert.equal(byTest(root, 'today-tip').length, 1, `${name}: tip shown`);
        TD.page(c); await tick();
        assert.equal(c.A.calls.filter((x) => x[0] === 'markTipShown').length, 1, `${name}: the tip is marked once`);
      }
    }
    const { c } = render({});
    assert.equal(byTest(TD.page(Object.assign({}, c, { route: { path: '/sos', parts: ['sos'], query: {} } })), 'today-tip').length, 0, 'no tip on an SOS route');
  } finally { delete globalThis.document; }
});

test('today: ui-today.js inserts text as text, makes no network call and exports pure names only', () => {
  const code = readFileSync(src('ui-today.js'), 'utf8');
  assert.doesNotMatch(code, /\.innerHTML\s*=|outerHTML\s*=|insertAdjacentHTML|document\.write/);
  assert.doesNotMatch(code, /\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|https?:\/\//);
  assert.doesNotMatch(code, /localStorage|sessionStorage|indexedDB|Math\.random/);
  assert.doesNotMatch(code, /globalThis\.(Content|Engine|Store|Actions|UI)\b/);
  assert.equal(T.page, undefined);
  for (const k of ['greetingFor', 'checkinKind', 'planToday', 'backupDue', 'milestoneDue']) assert.equal(typeof T[k], 'function', k);
});

/* ── U-16 Track ────────────────────────────────────────────────────────────────────────── */
globalThis.Engine = E;
globalThis.Store = require(src('store.js'));
const Actions = require(src('actions.js'));
const Store = globalThis.Store;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (fn, n = 200) => { for (let i = 0; i < n && !fn(); i++) await sleep(2); return fn(); };
async function freshStore() { if (typeof Store.load === 'function') await Store.load(); await Store.resetAll(); }
const trackCtx = (route, extra) => {
  const view = Store.view;
  const settings = view.get('settings', 'app') || {};
  return Object.assign({ view, E, A: Actions, profile: view.get('profile', 'me') || {}, settings, now: new Date(), calm: false,
    route: TR.routeOf ? Object.assign({ query: {} }, route) : route }, extra || {});
};
const R = (path, query) => ({ path, parts: path.split('/').filter(Boolean), query: query || {} });
const tours = (root) => root.all((n) => n.getAttribute && n.getAttribute('data-tour') !== null).map((n) => n.getAttribute('data-tour'));
const todayStr = () => T.localDate(new Date());
const VALUES = () => ({
  craving: { intensity: '7', triggerIds: [TRK.triggerOptions(Store.view, E)[0].id], thought: 'Maybe later', redFlag: true, tried: ['trial'], helped: ['trial'], notes: '' },
  feeling: { emotion: 'angry', intensity: '4', triggerIds: [], tried: [], helped: [] },
  checkin: { kind: 'evening', mood: '6', anxiety: '3', peakCraving: '2', pleasantCount: '3', used: 'no', sleep: '7', meeting: 'yes', intention: '' },
  activity: { kind: 'exercise', minutes: '30', name: 'Walk', enjoyment: '7' },
  slip: { date: todayStr(), substance: '', situation: 'After work', notes: '' },
});

test('track: each kind saves through Actions and is first on the timeline', async () => {
  await freshStore();
  const verbs = { craving: 'logCraving', feeling: 'logFeeling', checkin: 'checkin', activity: 'logActivity', slip: 'logSlip' };
  for (const [type, values] of Object.entries(VALUES())) {
    assert.equal(TRK.formToLog(type, values).verb, verbs[type], `${type}: its own verb`);
    const r = await TRK.save(Actions, type, values);
    assert.equal(r.ok, true, `${type}: ${r.message || ''}`);
    const first = TRK.timeline(Store.view)[0].rows[0];
    assert.equal(first.type, type);
    assert.equal(first.id, r.log.id, `${type}: the new row is first`);
    await sleep(3);
  }
  const rows = Store.view.list('logs');
  const craving = rows.find((l) => l.type === 'craving');
  assert.equal(craving.intensity, 7);
  assert.equal(craving.redFlag, true);
  assert.deepEqual(craving.skills, [{ skillId: 'trial', helpful: true }]);
  assert.equal(rows.find((l) => l.type === 'feeling').emotion, 'angry');
  assert.deepEqual(rows.find((l) => l.type === 'checkin').checkin, { kind: 'evening', mood: 6, anxiety: 3, peakCraving: 2, pleasantCount: 3, used: false, sleep: 7, meeting: true });
  assert.deepEqual(rows.find((l) => l.type === 'activity').activity, { kind: 'exercise', minutes: 30, name: 'Walk', enjoyment: 7 });
  // Through the page: the + and the tour names, a craving typed and saved, back on Track with the row on top.
  globalThis.document = fakeDom();
  try {
    const home = TR.page(trackCtx(R('/track')));
    assert.deepEqual(tours(home), ['quicklog-button']);
    assert.equal(byTest(home, 'track-add')[0].getAttribute('href'), '#/track/log');
    assert.equal(byTest(home, 'timeline-row')[0].getAttribute('data-type'), 'slip', 'the last saved is shown first');
    let went = null;
    const pg = TR.page(trackCtx(R('/track/log/craving'), { go: (r) => { went = r; } }));
    assert.deepEqual(tours(pg).sort(), ['quicklog-intensity', 'quicklog-save']);
    const slider = pg.all((n) => n.getAttribute && n.getAttribute('data-tour') === 'quicklog-intensity')[0];
    slider.value = '8'; slider.fire('input');
    byTest(pg, 'log-triggerIds')[0].children[0].fire('click');
    pg.all((n) => n.tagName === 'form')[0].fire('submit');
    assert.equal(await until(() => went !== null), true, 'it went somewhere');
    assert.equal(went, '#/track');
    const top = TRK.timeline(Store.view)[0].rows[0];
    assert.equal(top.type, 'craving'); assert.equal(top.intensity, 8); assert.equal(top.triggerIds.length, 1);
    assert.equal(byTest(TR.page(trackCtx(R('/track'))), 'timeline-row')[0].getAttribute('data-type'), 'craving');
    // A check-in opened from Today with its kind; a slip goes to its kind words, then the next steps.
    const ev = TR.page(trackCtx(R('/track/log/checkin', { kind: 'evening' })));
    assert.equal(ev.getAttribute('data-kind'), 'evening');
    assert.equal(byTest(ev, 'log-peakCraving').length, 1);
    assert.equal(byTest(TR.page(trackCtx(R('/track/log/checkin', { kind: 'morning' }))), 'log-peakCraving').length, 0, 'morning asks less');
    let slipWent = null;
    const sp = TR.page(trackCtx(R('/track/log/slip'), { go: (r) => { slipWent = r; } }));
    sp.all((n) => n.tagName === 'form')[0].fire('submit');
    assert.equal(await until(() => slipWent !== null), true);
    assert.equal(slipWent, '#/track/log/slip?saved=1');
    const done = TR.page(trackCtx(R('/track/log/slip', { saved: '1' })));
    assert.equal(byTest(done, 'slip-next')[0].getAttribute('href'), '#/sos/slip?logged=1');
    assert.equal(byTest(done, 'slip-back')[0].getAttribute('href'), '#/track');
  } finally { delete globalThis.document; }
});

test('track: validation messages shown, nothing written', async () => {
  await freshStore();
  const before = Store.view.list('logs').length;
  const bad = await TRK.save(Actions, 'activity', { kind: 'exercise', minutes: '' });
  assert.equal(bad.ok, false); assert.equal(bad.code, 'bad-activity'); assert.match(bad.message, /Minutes/);
  assert.equal((await TRK.save(Actions, 'craving', { intensity: '11' })).code, 'bad-log');
  assert.equal((await TRK.save(Actions, 'slip', { date: '2999-01-01' })).code, 'bad-slip');
  assert.equal((await TRK.save(Actions, 'activity', { kind: '', minutes: '20' })).ok, false, 'a kind is needed');
  assert.equal(Store.view.list('logs').length, before, 'nothing written');
  const locked = await TRK.save({ logCraving: async () => { const e = new Error('Locked.'); e.code = 'LOCKED'; throw e; } }, 'craving', { intensity: '3' });
  assert.equal(locked.code, 'LOCKED'); assert.equal(locked.message, TRK.TEXT.locked);
  globalThis.document = fakeDom();
  try {
    let went = null;
    const pg = TR.page(trackCtx(R('/track/log/activity'), { go: (r) => { went = r; } }));
    const name = byTest(pg, 'log-name')[0]; name.value = 'Swim';
    const err = byTest(pg, 'log-error')[0];
    assert.equal(err.hidden, true);
    pg.all((n) => n.tagName === 'form')[0].fire('submit');
    assert.equal(await until(() => err.hidden === false), true, 'the error shows');
    assert.ok(err.textContent.length > 0);
    assert.equal(err.getAttribute('aria-live'), 'polite');
    assert.equal(name.value, 'Swim', 'the form keeps its values');
    assert.equal(went, null);
    assert.equal(Store.view.list('logs').length, before);
  } finally { delete globalThis.document; }
});

test('track: slip leaves counters.total and xp unchanged', async () => {
  await freshStore();
  const d = new Date(); d.setDate(d.getDate() - 20);
  await Actions.onboard({ name: 'Asha', startDate: T.localDate(d) });
  await Actions.settings.patch({ counters: true, showCurrentRun: true });
  assert.equal((await TRK.save(Actions, 'craving', { intensity: '5' })).ok, true);
  const g0 = E.gameState(Store.view, new Date());
  assert.equal(g0.counters.tracking, true);
  assert.ok(g0.counters.total >= 20);
  assert.equal((await TRK.save(Actions, 'slip', { date: todayStr(), situation: 'A hard evening' })).ok, true);
  const g1 = E.gameState(Store.view, new Date());
  assert.equal(g1.counters.total, g0.counters.total, 'total days unchanged');
  assert.ok(g1.xp >= g0.xp, 'xp never falls');
  for (const k of Object.keys(g0.regions || {})) assert.ok(g1.regions[k] >= g0.regions[k], `region ${k} never falls`);
  assert.equal(Store.view.get('profile', 'me').startDate, T.localDate(d), 'startDate untouched');
  const settings = Store.view.get('settings', 'app');
  assert.deepEqual(TRK.countersData(g1.counters, settings, false), { total: g0.counters.total, current: g1.counters.current });
  assert.equal(TRK.countersData(g1.counters, Object.assign({}, settings, { counters: false }), false), null, 'opt-in only');
  assert.equal(TRK.countersData(g1.counters, settings, true), null, 'hidden in discreet mode');
  globalThis.document = fakeDom();
  try {
    const home = TR.page(trackCtx(R('/track')));
    assert.match(byTest(home, 'track-counters')[0].textContent, new RegExp(`${g0.counters.total} in total`));
    const sp = TR.page(trackCtx(R('/track/log/slip')));
    const words = sp.textContent;
    assert.doesNotMatch(words, /streak|reset|fail|relapse|clean|addict|should have|start over/i, 'kind words only');
    assert.equal(byTest(sp, 'slip-steps')[0].getAttribute('href'), '#/sos/slip?preview=1');
    assert.equal(byTest(sp, 'track-sos')[0].getAttribute('href'), '#/sos', 'SOS one tap away');
  } finally { delete globalThis.document; }
});

test('track: timeline order and grouping', () => {
  const iso = (dd, hr, mi = 0) => at(2026, 11, dd, hr, mi).toISOString();
  const logs = [
    { id: 'a', type: 'craving', at: iso(6, 9), intensity: 3 },
    { id: 'b', type: 'activity', at: iso(7, 8), activity: { kind: 'exercise', minutes: 20 } },
    { id: 'c', type: 'feeling', at: iso(7, 10), intensity: 5, emotion: 'sad', sample: true },
    { id: 'd', type: 'craving', at: iso(7, 9), intensity: 6, drill: true },
    { id: 'e', type: 'checkin', at: iso(5, 21), checkin: { kind: 'evening', mood: 4 } },
  ];
  const tl = TRK.timeline(viewOf({ logs }));
  assert.deepEqual(tl.map((g) => g.date), ['2026-11-07', '2026-11-06', '2026-11-05']);
  assert.deepEqual(tl[0].rows.map((r) => r.id), ['c', 'b'], 'newest first; a drill never shows');
  assert.equal(TRK.timeline(viewOf({ logs }), 2).flatMap((g) => g.rows).length, 2, 'a limit');
  assert.equal(TRK.rowText(logs[2]).sample, true);
  assert.match(TRK.rowText(logs[2]).text, /Sad or low · 5 out of 10/);
  assert.equal(TRK.rowText(logs[4]).word, 'Evening check-in');
  globalThis.document = fakeDom();
  try {
    const many = Array.from({ length: 35 }, (_, i) => ({ id: 'm' + i, type: 'craving', at: at(2026, 11, 7, 0, i).toISOString(), intensity: i % 11 }));
    const ctx = { view: viewOf({ logs: many.concat(logs) }), E, A: stubActions(), settings: {}, profile: {}, now: NOW, route: R('/track') };
    const home = TR.page(ctx);
    assert.equal(byTest(home, 'timeline-row').length, 30, '30 at first');
    const more = byTest(home, 'timeline-more')[0];
    assert.equal(more.hidden, false);
    more.fire('click');
    assert.equal(byTest(home, 'timeline-row').length, 39, 'then the rest');
    assert.equal(more.hidden, true);
    assert.ok(byTest(home, 'timeline-row').some((r) => /Sample/.test(r.textContent)), 'the Sample mark');
    assert.equal(byTest(home, 'track-counters').length, 0, 'counters only when opted in');
    assert.equal(byTest(home, 'track-insights-link')[0].getAttribute('href'), '#/track/insights', 'insights after seven logs');
    const few = TR.page(Object.assign({}, ctx, { view: viewOf({ logs }) }));
    assert.match(byTest(few, 'insights-empty')[0].textContent, /after seven logs\. You have 2 so far/, 'sample rows and drills do not count (the engine rule)');
    assert.equal(byTest(few, 'track-insights-link').length, 0);
    const none = TR.page(Object.assign({}, ctx, { view: viewOf({}) }));
    assert.equal(byTest(none, 'timeline-row').length, 0);
    assert.equal(byTest(none, 'timeline-log-first')[0].getAttribute('href'), '#/track/log');
  } finally { delete globalThis.document; }
});

test('track: chips list frequent triggers first', () => {
  const stub = { triggerChips: () => [{ id: 'people:a', label: 'A' }, { id: 'places:b', label: 'B', frequent: true }, { id: 'x', label: '' }, { id: 'times:c', label: 'C', frequent: true }] };
  assert.deepEqual(TRK.triggerOptions(viewOf({}), stub).map((c) => c.id), ['places:b', 'times:c', 'people:a']);
  const real = TRK.triggerOptions(viewOf({}), E);
  assert.ok(real.length > 0, 'the catalog gives chips');
  assert.equal(TRK.triggerOptions(viewOf({}), null).length, 0, 'no engine: no chips, no crash');
  globalThis.document = fakeDom();
  try {
    const pg = TR.page({ view: viewOf({}), E: stub, A: stubActions(), settings: {}, profile: {}, now: NOW, route: R('/track/log/craving') });
    const chips = byTest(pg, 'log-triggerIds')[0].children.map((b) => b.textContent);
    assert.deepEqual(chips, ['B', 'C', 'A']);
  } finally { delete globalThis.document; }
});

test('track: every route renders with no dead button and SOS one tap away', () => {
  globalThis.document = fakeDom();
  try {
    const paths = [R('/track'), R('/track/log'), R('/track/insights'), R('/track/log/slip', { saved: '1' }), R('/track/log/nope')]
      .concat(TRK.KINDS.map((k) => R('/track/log/' + k)));
    for (const r of paths) {
      const root = TR.page({ view: viewOf({}), E, A: stubActions(), settings: {}, profile: {}, now: NOW, route: r });
      assert.ok(root, r.path);
      for (const a of root.all((n) => n.tagName === 'a')) {
        const href = a.getAttribute('href');
        assert.match(href, /^#\//, `${r.path}: ${href}`);
        assert.ok(KNOWN.includes(href.slice(2).split(/[/?]/)[0]), `${r.path}: ${href} is a known route`);
      }
      for (const b of root.all((n) => n.tagName === 'button')) assert.ok(b.getAttribute('type') === 'submit' || (b.on.click || []).length, `${r.path}: a live button`);
      assert.equal(byTest(root, 'track-sos')[0].getAttribute('href'), '#/sos');
    }
    assert.equal(byTest(TR.page({ view: viewOf({}), E, settings: { discreet: true }, route: R('/track') }), 'track-sos')[0].textContent, 'Help');
  } finally { delete globalThis.document; }
});

test('track: ui-track.js inserts text as text, makes no network call and exports pure names only', () => {
  const code = readFileSync(src('ui-track.js'), 'utf8');
  assert.doesNotMatch(code, /\.innerHTML\s*=|outerHTML\s*=|insertAdjacentHTML|document\.write/);
  assert.doesNotMatch(code, /\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|https?:\/\//);
  assert.doesNotMatch(code, /localStorage|sessionStorage|indexedDB|Math\.random/);
  assert.doesNotMatch(code, /globalThis\.(Content|Engine|Store|Actions|UI)\b/);
  assert.doesNotMatch(code, /\baddicts?\b(?!-)/i);
  assert.equal(TRK.page, undefined);
  for (const k of ['timeline', 'formToLog', 'save', 'triggerOptions', 'countersData']) assert.equal(typeof TRK[k], 'function', k);
  const tourNames = [...new Set([...code.matchAll(/'(quicklog-[a-z]+|insights-(?:triggers|heatmap))'/g)].map((m) => m[1]))].sort();
  assert.deepEqual(tourNames, ['insights-heatmap', 'insights-triggers', 'quicklog-button', 'quicklog-intensity', 'quicklog-save']);
});

/* ── U-17 Insights ─────────────────────────────────────────────────────────────────────── */
/* UI.svg stand-in on the fake DOM: the real one (ui-core.js) needs createElementNS. */
const uiStub = () => ({
  svg: (tag, attrs, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) if (v != null && v !== false) n.setAttribute(k, v === true ? '' : String(v));
    for (const k of kids.flat(5)) if (k != null && k !== false && k !== true) n.appendChild(typeof k === 'object' ? k : document.createTextNode(String(k)));
    return n;
  },
});
function withDom(fn) {
  globalThis.document = fakeDom();
  globalThis.UI = uiStub();
  try { return fn(); } finally { delete globalThis.document; delete globalThis.UI; }
}
const craving = (d, hr, intensity, triggerIds) => {
  const when = at(2026, 11, d, hr);
  return { id: 'c' + (++seq), type: 'craving', at: when.toISOString(), date: T.localDate(when), intensity, triggerIds: triggerIds || [] };
};
function synthLogs(n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(craving(1 + (i % 7), 18 + (i % 3), 3 + (i % 5), i % 2 ? ['people:work-stress'] : ['place:bar', 'people:work-stress']));
  return out;
}
const insightsAt = (logs) => TR.page({ view: viewOf({ logs }), E, A: stubActions(), settings: {}, profile: {}, now: NOW, route: R('/track/insights') });

test('insights: hidden below 7 logs', () => withDom(() => {
  const root = insightsAt(synthLogs(6));
  assert.equal(byTest(root, 'insights-empty').length, 1);
  assert.match(byTest(root, 'insights-empty')[0].textContent, /appear after seven logs\. You have 6 so far/);
  assert.equal(byTest(root, 'insights-card').length, 0);
  assert.equal(root.all((n) => n.tagName === 'svg').length, 0, 'nothing drawn');
  assert.equal(byTest(root, 'insights-log')[0].getAttribute('href'), '#/track/log');
  const home = TR.page({ view: viewOf({ logs: synthLogs(6) }), E, A: stubActions(), settings: {}, profile: {}, now: NOW, route: R('/track') });
  assert.equal(byTest(home, 'track-insights-link').length, 0);
  assert.equal(TRK.insightsView(viewOf({ logs: synthLogs(6) }), NOW, E).ready, false);
}));

test('insights: cards from synthetic logs (svg present, heatmap 7x24)', () => withDom(() => {
  const logs = synthLogs(10);
  const iv = TRK.insightsView(viewOf({ logs }), NOW, E);
  assert.equal(iv.ready, true);
  assert.equal(iv.heatmap.length, 7);
  assert.ok(iv.heatmap.every((r) => r.length === 24));
  assert.equal(iv.cravings, 10);
  assert.equal(iv.triggers[0].count, 10, 'work stress is in every log');
  const root = insightsAt(logs);
  const names = byTest(root, 'insights-card').map((n) => n.getAttribute('data-card'));
  for (const k of ['trend', 'triggers', 'heatmap']) assert.ok(names.includes(k), k);
  const heat = byTest(root, 'insights-heat')[0];
  assert.equal(heat.tagName, 'svg');
  assert.equal(heat.all((n) => n.tagName === 'rect').length, 168, '7 x 24 cells');
  for (const id of ['insights-trend', 'insights-bars', 'insights-heat']) {
    const s = byTest(root, id)[0];
    assert.equal(s.getAttribute('role'), 'img', id);
    assert.match(s.getAttribute('aria-label'), /\d/, id + ' says its numbers');
  }
  assert.equal(byTest(root, 'insights-bars')[0].all((n) => n.tagName === 'rect').length, iv.triggers.length);
  assert.ok(byTest(root, 'insights-heat-table')[0].all((n) => n.tagName === 'tr').length > 1, 'a text table alternative');
  assert.deepEqual(tours(root).sort(), ['insights-heatmap', 'insights-triggers']);
  const home = TR.page({ view: viewOf({ logs }), E, A: stubActions(), settings: {}, profile: {}, now: NOW, route: R('/track') });
  assert.equal(byTest(home, 'track-insights-link')[0].getAttribute('href'), '#/track/insights');
  for (const a of root.all((n) => n.tagName === 'a')) assert.ok(KNOWN.includes(a.getAttribute('href').slice(2).split(/[/?]/)[0]));
}));

test('insights: caveat under 14', () => withDom(() => {
  const few = insightsAt(synthLogs(10));
  const cards = byTest(few, 'insights-card');
  assert.ok(cards.length >= 3);
  for (const c of cards) assert.equal(byTest(c, 'insights-caveat').length, 1, c.getAttribute('data-card'));
  const many = insightsAt(synthLogs(15));
  assert.ok(byTest(many, 'insights-card').length >= 3);
  assert.equal(byTest(many, 'insights-caveat').length, 0);
}));

test('insights: without UI.svg the numbers still show as text', () => {
  globalThis.document = fakeDom();
  try {
    const root = insightsAt(synthLogs(8));
    assert.equal(root.all((n) => n.tagName === 'svg').length, 0);
    assert.ok(byTest(root, 'insights-card').length >= 3);
    assert.ok(byTest(root, 'insights-heat-table').length, 'the table stays');
  } finally { delete globalThis.document; }
});

/* ── U-18 Harbor scene ─────────────────────────────────────────────────────────────────── */
const HBM = require(src('ui-harbor.js'));
const HB = classic('ui-harbor.js', 'HarborUI');
const used = (skillId, d, hr) => ev('SkillUsed', { skillId, helpful: true }, at(2026, 11, d, hr));
const harborRows = () => ({
  profile: [{ key: 'me', name: 'Asha', startDate: '2026-10-01' }],
  events: [used('trial', 1, 9), used('trial', 2, 9), used('trial', 3, 9), used('sober', 3, 10), used('call', 4, 11), used('reasons', 5, 9), used('log-craving', 6, 9)],
});
const harborCtx = (extra) => Object.assign({ view: viewOf(harborRows()), E, settings: {}, now: NOW, calm: false, route: R('/today') }, extra || {});

test('harbor: levels never fall after a slip', () => {
  const rows = harborRows();
  const before = HBM.lightLevels(viewOf(rows), NOW, E);
  assert.deepEqual(Object.keys(before), ['lighthouse', 'cove', 'garden', 'pier', 'compass', 'weather']);
  assert.equal(before.lighthouse, 2, 'three uses of a lighthouse skill');
  assert.ok(before.cove >= 1 && before.pier >= 1 && before.compass >= 1 && before.weather >= 1);
  const after = HBM.lightLevels(viewOf(Object.assign({}, rows, {
    events: rows.events.concat([ev('SlipLogged', { date: TODAY }, at(2026, 11, 7, 8))]),
    logs: [{ id: 'slip1', type: 'slip', at: at(2026, 11, 7, 8).toISOString(), date: TODAY }],
  })), at(2026, 11, 30, 9), E);
  for (const k of HBM.PLACES) assert.ok(after[k] >= before[k], `${k} does not fall after a slip or with time`);
  for (let n = 0; n < 5; n++) assert.ok(HBM.lightOpacity(n + 1) > HBM.lightOpacity(n), 'the glow rises with each level');
  assert.equal(HBM.lightOpacity(0), 0);
  assert.equal(HBM.lightOpacity(5), 1);
  assert.deepEqual(HBM.lightLevels(viewOf({}), NOW, null), { lighthouse: 0, cove: 0, garden: 0, pier: 0, compass: 0, weather: 0 }, 'no engine: all unlit');
});

test('harbor: renders 6 places', () => withDom(() => {
  const root = HB.scene(harborCtx());
  assert.ok(root);
  const svgEl = byTest(root, 'harbor-scene')[0];
  assert.equal(svgEl.getAttribute('role'), 'img');
  const places = svgEl.all((n) => n.getAttribute && n.getAttribute('data-place') !== null);
  assert.deepEqual(places.map((n) => n.getAttribute('data-place')).sort(), ['compass', 'cove', 'garden', 'lighthouse', 'pier', 'weather']);
  const label = svgEl.getAttribute('aria-label');
  assert.match(label, /Lit: The Lighthouse, level 2 of 5/);
  assert.match(label, /Waiting for light: The Garden/);
  const lh = places.find((n) => n.getAttribute('data-place') === 'lighthouse');
  assert.equal(lh.getAttribute('data-level'), '2');
  assert.equal(lh.all((n) => n.getAttribute && /hb-light/.test(n.getAttribute('class') || ''))[0].getAttribute('opacity'), String(HBM.lightOpacity(2)));
  const pier = places.find((n) => n.getAttribute('data-place') === 'pier');
  assert.equal(pier.all((n) => /hb-lit/.test((n.getAttribute && n.getAttribute('class')) || '')).length, Number(pier.getAttribute('data-level')), 'a lantern per level');
  globalThis.HarborUI = HB;
  try {
    const { root: today } = render(sampleRows());
    const card = byTest(today, 'today-harbor')[0];
    assert.ok(card && byTest(card, 'harbor-scene').length === 1, 'Today shows the scene once HarborUI is loaded');
    assert.equal(card.getAttribute('aria-hidden'), null);
  } finally { delete globalThis.HarborUI; }
}));

test('harbor: null in calm mode', () => withDom(() => {
  assert.equal(HB.scene(harborCtx({ calm: true })), null);
  assert.equal(HB.scene(harborCtx({ settings: { calm: true } })), null);
  assert.equal(HB.scene(harborCtx({ settings: { discreet: true } })), null, 'and in discreet mode');
  assert.ok(HB.scene(harborCtx()));
}));

test('harbor: reduced-motion class', () => withDom(() => {
  const cls = (extra) => byTest(HB.scene(harborCtx(extra)), 'harbor-scene')[0].getAttribute('class');
  assert.match(cls(), /hb-moving/);
  assert.match(cls({ settings: { reducedMotion: true } }), /hb-still/);
  assert.match(cls({ route: R('/sos') }), /hb-still/, 'never animates in SOS');
  globalThis.window = { matchMedia: (q) => ({ matches: /reduce/.test(q) }) };
  try { assert.match(cls(), /hb-still/, 'the system setting'); } finally { delete globalThis.window; }
  const css = readFileSync(src('styles.css'), 'utf8');
  const sec = css.slice(css.indexOf('/* -- today-track -- */'));
  assert.match(sec, /@media \(prefers-reduced-motion: no-preference\) \{\s*\.hb-moving/);
  assert.match(sec, /\.hb-still \*[^{]*\{ animation: none !important; \}/);
  for (const m of sec.matchAll(/@keyframes hb-[a-z]+ \{([^}]*\}){2} \}/g)) assert.doesNotMatch(m[0], /opacity/, 'motion never dims the light');
}));

test('harbor: ui-harbor.js inserts text as text, makes no network call and exports pure names only', () => {
  const code = readFileSync(src('ui-harbor.js'), 'utf8');
  assert.doesNotMatch(code, /\.innerHTML\s*=|outerHTML\s*=|insertAdjacentHTML|document\.write/);
  assert.doesNotMatch(code, /\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|https?:\/\//);
  assert.doesNotMatch(code, /localStorage|sessionStorage|indexedDB|Math\.random/);
  assert.doesNotMatch(code, /globalThis\.(Content|Engine|Store|Actions|UI)\b/);
  assert.equal(HBM.scene, undefined);
  for (const k of ['lightLevels', 'lightOpacity', 'ariaLabel']) assert.equal(typeof HBM[k], 'function', k);
});

/* ── FIX-EMBED: game-tutorials' pieces on Today (contracts/game-tutorials.md lines 9 and 11) ── */
const SLOT_TESTS = ['game-panel', 'explorer-ring', 'more-tools', 'tip-card', 'new-dot', 'today-explorer', 'today-tip'];
const countOf = (root) => Object.fromEntries(SLOT_TESTS.map((k) => [k, byTest(root, k).length]));
function withEmbeds(G, M, fn) {
  globalThis.document = fakeDom();
  if (G) globalThis.GuidanceUI = G;
  if (M) globalThis.GameUI = M;
  try { return fn(); } finally { delete globalThis.GuidanceUI; delete globalThis.GameUI; delete globalThis.document; }
}
const realGuidance = () => classic('ui-guidance.js', 'GuidanceUI');
const realGame = () => classic('ui-game.js', 'GameUI');
const sampleWith = (o) => { const rows = sampleRows(); rows.settings = [settingsRow(Object.assign({ showCurrentRun: true }, o || {}))]; return rows; };

test('today: FIX-EMBED slots in cardsFor keep the Calm, discreet and maintenance rules', () => {
  const all = T.cardsFor({});
  assert.ok(all.indexOf('game') === all.indexOf('momentum') + 1, 'game follows momentum');
  assert.ok(all.indexOf('more') === all.indexOf('tip') + 1, 'more follows tip');
  assert.deepEqual(T.cardsFor({ maintenance: true }), ['checkin', 'plan', 'reasons', 'tip', 'backup']);
  for (const k of ['game', 'momentum', 'explorer', 'harbor']) assert.ok(!T.cardsFor({ calm: true }).includes(k), `calm hides ${k}`);
  for (const k of ['game', 'harbor', 'counters']) assert.ok(!T.cardsFor({ discreet: true }).includes(k), `discreet hides ${k}`);
});

test('today: FIX-EMBED with GuidanceUI and GameUI absent Today renders as before', () => withEmbeds(null, null, () => {
  const { root } = render(sampleRows());
  const n = countOf(root);
  assert.deepEqual([n['game-panel'], n['explorer-ring'], n['more-tools'], n['tip-card'], n['new-dot']], [0, 0, 0, 0, 0]);
  assert.equal(n['today-explorer'], 1, 'Today keeps its own Explorer card');
}));

test('today: FIX-EMBED with the real GuidanceUI and GameUI: one panel, the ring in place of Explorer, one More tools, one tip', async () => {
  let c;
  const root = withEmbeds(realGuidance(), realGame(), () => { const r = render(sampleRows()); c = r.c; return r.root; });
  const n = countOf(root);
  assert.equal(n['game-panel'], 1, 'GameUI.panel once');
  assert.equal(n['explorer-ring'], 1, 'GuidanceUI.explorerRing once');
  assert.equal(n['today-explorer'], 0, 'never the own Explorer card beside the ring');
  assert.equal(n['more-tools'], 1, 'GuidanceUI.moreTools once');
  assert.equal(n['tip-card'], 0, 'GuidanceUI.tipCard is never rendered on Today');
  assert.ok(n['today-tip'] <= 1, 'at most one tip card');
  await tick();
  assert.ok(c.A.calls.filter((x) => x[0] === 'markTipShown').length <= 1, 'the tip is marked at most once');
  const links = root.all((x) => x.tagName === 'a');
  assert.equal(byTest(root, 'today-sos')[0].getAttribute('href'), '#/sos', 'SOS one tap away');
  assert.equal(links.filter((a) => a.getAttribute('data-test') === 'today-sos').length, 1);
  for (const b of root.all((x) => x.tagName === 'button')) assert.ok((b.on.click || []).length > 0, `button "${b.textContent}" acts`);
  const kids = root.children.slice(1).filter(Boolean).map((x) => x.getAttribute('data-test') || (x.children[0] && x.children[0].getAttribute('data-test')));
  assert.ok(kids.indexOf('game-panel') > kids.indexOf('today-momentum'), 'the panel comes after Momentum');
  assert.ok(kids.indexOf('more-tools') > kids.indexOf('explorer-ring'), 'More tools comes after the ring');
});

test('today: FIX-EMBED Calm, discreet and maintenance keep their card rules with both modules present', () => {
  const cases = [
    ['calm', sampleWith({ calm: true }), { calm: true }, { 'game-panel': 0, 'explorer-ring': 0, 'today-explorer': 0 }],
    ['discreet', sampleWith({ discreet: true }), { settings: settingsRow({ discreet: true }) }, { 'game-panel': 0 }],
    ['maintenance', sampleWith({ maintenance: true }), null, { 'game-panel': 0, 'explorer-ring': 0, 'more-tools': 0, 'today-explorer': 0 }],
  ];
  for (const [name, rows, extra, want] of cases) {
    withEmbeds(realGuidance(), realGame(), () => {
      const root = TD.page(Object.assign(ctxFor(rows), extra || {}));
      const n = countOf(root);
      for (const k of Object.keys(want)) assert.equal(n[k], want[k], `${name}: ${k}`);
      assert.equal(byTest(root, 'today-sos').length, 1, `${name}: SOS stays`);
    });
  }
});

test('today: FIX-EMBED stand-ins: a null ring shows nothing, a throw never breaks Today, a dot sits by its own link', () => {
  const span = (t) => { const s = document.createElement('span'); s.setAttribute('data-test', t); return s; };
  const seen = [];
  withEmbeds({ explorerRing: () => null, moreTools: () => null, dot: (id) => { seen.push(id); return id === 'planner' ? span('new-dot') : null; } },
    { panel: () => { throw new Error('boom'); } }, () => {
      const { root } = render(sampleRows());
      const n = countOf(root);
      assert.deepEqual([n['explorer-ring'], n['today-explorer'], n['game-panel'], n['more-tools']], [0, 0, 0, 0], 'null ring: no fallback to the own card');
      assert.equal(n['new-dot'], 1, 'one New dot, beside the Planner link');
      assert.ok(seen.every((id) => id === 'planner' || id === 'quests' || id === 'status'), 'dots only for one-to-one feature ids'); // status: the Your harbor chip's own dot, once content V-10's feature exists
      for (const k of ['today-plan', 'today-reasons', 'today-momentum', 'today-sos']) assert.equal(byTest(root, k).length, 1, k);
    });
  withEmbeds({ explorerRing: () => { throw new Error('boom'); }, moreTools: () => { throw new Error('boom'); }, dot: () => { throw new Error('boom'); } }, null, () => {
    const { root } = render(sampleRows());
    assert.equal(byTest(root, 'today-sos').length, 1);
    assert.equal(byTest(root, 'today-plan').length, 1, 'a dot that throws leaves the card');
    assert.equal(byTest(root, 'today-explorer').length, 0, 'a ring that throws shows nothing');
  });
});

/* ── V-43: today's objectives, the run line, the quest-line step ─────────────────────────────── */
// Stub Engine/Actions for the names not merged yet (actions-sos V-41, content V-42); the real engine elsewhere.
const stubE = (o) => Object.assign(Object.create(E), o || {});
const OBJ = (id, o) => Object.assign({ id, title: 'Objective ' + id, line: 'One small thing.', doneBy: 'tap', grows: 'tree', done: false, swappable: true, swapTo: 'o-d' }, o || {});
const daily = (o) => Object.assign({ date: TODAY, items: [OBJ('o-a'), OBJ('o-b', { done: true, swappable: false }), OBJ('o-c')], growth: 2, swapped: false }, o || {});
function v43Actions(res) {
  const A = stubActions();
  const reply = (name) => async (id) => { A.calls.push([name, id]); if (res instanceof Error) throw res; return res || { ok: true }; };
  A.objective = { done: reply('objective.done'), swap: reply('objective.swap') };
  A.questLine = { claim: reply('questLine.claim') };
  return A;
}
const STEP = (o) => Object.assign({ id: 'q1', title: 'First light', line: 'Log one craving.', reward: 'planner', opened: 'It opens the Planner.', state: 'current',
  met: false, progress: { have: 0, need: 1 }, claimable: false }, o || {});
const ql = (cur, o) => Object.assign({ steps: cur ? [cur, STEP({ id: 'q2', title: 'Second', state: 'locked' })] : [STEP({ state: 'done' }), STEP({ id: 'q2', state: 'done' })],
  current: cur, done: 0, total: 2 }, o || {});
const msgOf = (card) => card.all((n) => n.getAttribute && n.getAttribute('role') === 'status')[0];
const withDoc = async (fn) => { globalThis.document = fakeDom(); try { return await fn(); } finally { delete globalThis.document; delete globalThis.GuidanceUI; } };
const discreetRows = () => { const r = sampleRows(); r.settings = [settingsRow({ discreet: true })]; return r; };

test('objectives: card absent when Engine.dailyObjectives is absent', () => withDoc(() => {
  assert.equal(byTest(render(sampleRows(), { E: stubE({ dailyObjectives: undefined }), A: v43Actions() }).root, 'objectives-card').length, 0, 'absent: no card');
  if (!Array.isArray(Content.objectives)) assert.equal(byTest(render(sampleRows()).root, 'objectives-card').length, 0, 'no Content.objectives yet: no card');
  const { root } = render(sampleRows(), { E: stubE({ dailyObjectives: () => daily() }) });
  assert.equal(byTest(root, 'objectives-card').length, 1);
  assert.equal(byTest(root, 'objectives-card')[0].getAttribute('data-tour'), 'objectives-card');
  assert.equal(byTest(root, 'objective-done').length + byTest(root, 'objective-swap').length, 0, 'no Actions.objective: no dead button');
  const keys = T.withObjectives(T.cardsFor({}), {});
  assert.deepEqual(keys.slice(keys.indexOf('checkin'), keys.indexOf('checkin') + 3), ['checkin', 'objectives', 'questline']);
  assert.deepEqual(T.withObjectives(T.cardsFor({ maintenance: true }), { maintenance: true }), ['checkin', 'objectives', 'plan', 'reasons', 'tip', 'backup']);
  assert.ok(!T.withObjectives(T.cardsFor({ discreet: true }), { discreet: true }).includes('questline'), 'discreet: no quest-line');
}));

test('objectives: done button only on an undone item, swap hidden once swapped', () => withDoc(async () => {
  const A = v43Actions();
  const { root } = render(sampleRows(), { E: stubE({ dailyObjectives: () => daily() }), A });
  const rows = byTest(root, 'objective');
  assert.deepEqual(rows.map((r) => [r.getAttribute('data-id'), r.getAttribute('data-done')]), [['o-a', 'false'], ['o-b', 'true'], ['o-c', 'false']]);
  assert.equal(byTest(rows[1], 'objective-done').length + byTest(rows[1], 'objective-swap').length, 0, 'a done item has no button');
  assert.match(rows[1].textContent, /Done/);
  assert.equal(byTest(root, 'objective-done').length, 2);
  assert.equal(byTest(root, 'objective-swap').length, 2);
  byTest(rows[0], 'objective-done')[0].fire('click'); await tick();
  byTest(rows[2], 'objective-swap')[0].fire('click'); await tick();
  assert.deepEqual(A.calls.filter((x) => /^objective/.test(x[0])), [['objective.done', 'o-a'], ['objective.swap', 'o-c']]);
  assert.match(byTest(root, 'objectives-card')[0].textContent, /2 things growing in your harbor\./);
  const swapped = render(sampleRows(), { E: stubE({ dailyObjectives: () => daily({ swapped: true }) }), A }).root;
  assert.equal(byTest(swapped, 'objective-swap').length, 0, 'one swap a day');
  assert.equal(byTest(swapped, 'objective-done').length, 2);
  const one = render(sampleRows(), { E: stubE({ dailyObjectives: () => daily({ growth: 0, items: [OBJ('o-a', { swapTo: null, swappable: false })] }) }), A }).root;
  assert.equal(byTest(one, 'objective-swap').length, 0, 'nothing to swap to: no swap');
  assert.match(byTest(one, 'objectives-card')[0].textContent, /The first one grows when you do one\./);
}));

test('objectives: a refusal shows its message and never throws', () => withDoc(async () => {
  const no = render(sampleRows(), { E: stubE({ dailyObjectives: () => daily() }), A: v43Actions({ ok: false, code: 'not-today', message: 'That one is not on today.' }) }).root;
  byTest(no, 'objective-done')[0].fire('click'); await tick();
  assert.equal(msgOf(byTest(no, 'objectives-card')[0]).textContent, 'That one is not on today.');
  const boom = render(sampleRows(), { E: stubE({ dailyObjectives: () => daily() }), A: v43Actions(new Error('disk full')) }).root;
  byTest(boom, 'objective-swap')[0].fire('click'); await tick();
  assert.equal(msgOf(byTest(boom, 'objectives-card')[0]).textContent, 'disk full');
  const thrown = render(sampleRows(), { E: stubE({ dailyObjectives: () => { throw new Error('x'); } }) }).root;
  assert.equal(byTest(thrown, 'objectives-card').length, 0, 'an Engine throw: no card');
  assert.equal(byTest(thrown, 'today-sos').length, 1, 'SOS stays');
}));

test('run: kept only when holding, back only when cameBack, no countdown words', () => withDoc(() => {
  const runOf = (o) => () => Object.assign({ current: 3, best: 5, total: 9, kept: [], holding: null, cameBack: false, lastDay: TODAY }, o);
  const line = (o, rows) => byTest(render(rows || sampleRows(), { E: stubE({ run: runOf(o) }) }).root, 'run-line')[0];
  const held = line({ holding: '2026-11-06' });
  assert.equal(held.getAttribute('data-tour'), 'run-line');
  assert.deepEqual(['run-current', 'run-best', 'run-total'].map((k) => byTest(held, k)[0].textContent), ['Now 3', 'Best 5', 'In all 9']);
  assert.equal(byTest(held, 'run-kept').length, 1);
  assert.equal(byTest(held, 'run-back').length, 0);
  const back = line({ current: 1, cameBack: true });
  assert.equal(byTest(back, 'run-kept').length, 0);
  assert.equal(byTest(back, 'run-back')[0].textContent, 'You came back.');
  assert.deepEqual(['run-best', 'run-total'].map((k) => byTest(back, k)[0].textContent), ['Best 5', 'In all 9']);
  for (const n of [held, back]) assert.doesNotMatch(n.textContent, /streak|lost|broken|reset|\bleft\b|hours?|countdown|until|missed|\bXP\b|points/i);
  assert.equal(line({ current: 0, best: 0, total: 0 }), undefined, 'nothing shown up yet: no line');
  assert.equal(byTest(render(sampleRows(), { E: stubE({ run: undefined }) }).root, 'run-line').length, 0, 'Engine.run absent: no line');
  const maint = sampleRows(); maint.settings = [settingsRow({ maintenance: true })];
  assert.equal(line({}, maint), undefined, 'maintenance: objectives only');
  assert.match(line({}, discreetRows()).textContent, /^Days active: /, 'discreet: neutral words');
  const had = Object.prototype.hasOwnProperty.call(Content, 'runWords'); const old = Content.runWords;
  try {
    Content.runWords = { header: 'Days you showed up', keptLine: '' };
    const w = line({ holding: '2026-11-06' });
    assert.match(w.textContent, /^Days you showed up: /);
    assert.equal(byTest(w, 'run-kept')[0].textContent, 'Kept. One quiet day a week still counts.', 'a missing word falls back');
  } finally { if (had) Content.runWords = old; else delete Content.runWords; }
}));

test('questline: claim only when claimable, card absent when questLine absent', () => withDoc(async () => {
  const A = v43Actions();
  const card = (q, extra) => byTest(render(sampleRows(), Object.assign({ E: stubE({ questLine: () => q }), A }, extra || {})).root, 'questline-card')[0];
  const waiting = card(ql(STEP()));
  assert.equal(waiting.getAttribute('data-tour'), 'questline-card');
  assert.equal(byTest(waiting, 'questline-step')[0].getAttribute('data-state'), 'current');
  assert.match(waiting.textContent, /First light/);
  assert.match(waiting.textContent, /Progress: 0 of 1/);
  assert.equal(byTest(waiting, 'questline-claim').length, 0, 'not met: no claim');
  const ready = card(ql(STEP({ met: true, claimable: true, progress: { have: 1, need: 1 } })));
  byTest(ready, 'questline-claim')[0].fire('click'); await tick();
  assert.deepEqual(A.calls.filter((x) => x[0] === 'questLine.claim'), [['questLine.claim', 'q1']]);
  assert.equal(byTest(card(ql(STEP({ claimable: true })), { A: stubActions() }), 'questline-claim').length, 0, 'no Actions.questLine: no dead button');
  assert.equal(card(ql(STEP()), { E: stubE({ questLine: undefined }) }), undefined, 'Engine.questLine absent: no card');
  assert.equal(card(ql(null, { steps: [], total: 0 })), undefined, 'no steps: no card');
  assert.match(card(ql(null, { done: 2 })).textContent, /Every step is done\./);
  assert.equal(byTest(render(discreetRows(), { E: stubE({ questLine: () => ql(STEP({ claimable: true })) }), A }).root, 'questline-card').length, 0, 'discreet: no card');
}));

test('questline: absent GuidanceUI.rewardSheet does not throw', () => withDoc(async () => {
  const unlocked = { ok: true, events: [{ type: 'QuestLineStepDone', payload: { id: 'q1' } }, { type: 'FeatureUnlocked', payload: { feature: 'planner' } }] };
  const claimBtn = () => byTest(render(sampleRows(), { E: stubE({ questLine: () => ql(STEP({ claimable: true })) }), A: v43Actions(unlocked) }).root, 'questline-claim')[0];
  const b = claimBtn(); b.fire('click'); await tick();
  assert.equal(msgOf(b.parentNode.parentNode).textContent, '', 'no sheet, no error');
  const seen = [];
  globalThis.GuidanceUI = { rewardSheet: (f, ctx) => { seen.push([f, !!(ctx && ctx.view)]); return null; } };
  claimBtn().fire('click'); await tick();
  assert.deepEqual(seen, [['planner', true]], 'the FeatureUnlocked reward, with the page ctx');
  globalThis.GuidanceUI = { rewardSheet: () => { throw new Error('boom'); } };
  const c = claimBtn(); c.fire('click'); await tick();
  assert.equal(msgOf(c.parentNode.parentNode).textContent, '', 'a sheet that throws breaks nothing');
}));

test('today: the sober-day counters card is unchanged', () => withDoc(() => {
  const full = stubE({ dailyObjectives: () => daily(), run: () => ({ current: 4, best: 6, total: 20, kept: [], holding: '2026-11-06', cameBack: false }),
    questLine: () => ql(STEP({ claimable: true })) });
  const plain = byTest(render(sampleRows(), { E: stubE({ dailyObjectives: undefined, run: undefined, questLine: undefined }) }).root, 'today-counters');
  const withAll = byTest(render(sampleRows(), { E: full, A: v43Actions() }).root, 'today-counters');
  assert.equal(plain.length, 1);
  assert.equal(withAll.length, 1);
  assert.equal(withAll[0].textContent, plain[0].textContent, 'the O6 counters show the same words and numbers');
  assert.doesNotMatch(withAll[0].textContent, /shown up|In all|growing/);
}));
