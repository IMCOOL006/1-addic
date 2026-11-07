// Lane today-track's Node tests (node:test, no dependencies). U-15: the Today screen in offline/src/ui-today.js
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
        assert.ok(KNOWN.includes(first), `${name}: ${href} goes to a page of 3.5`);
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
