// Lane today-track's Node tests for the status page "Your Harbor" (offline/src/ui-status.js, PLAN-V3.md section 3, V-01a).
// node:test, no dependencies. The pure functions run directly; the page renders on a tiny stand-in DOM and the test
// walks the node tree it returns (the harness of today-track.test.mjs).
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
const classic = (file, name) => vm.runInThisContext(`(function () {
${readFileSync(src(file), 'utf8')}
return ${name};
})()`, { filename: src(file) });
const STP = require(src('ui-status.js'));
globalThis.GameUI = require(src('ui-game.js'));
globalThis.HarborUI = classic('ui-harbor.js', 'HarborUI');
const ST = classic('ui-status.js', 'StatusUI');
const CODE = readFileSync(src('ui-status.js'), 'utf8');

const at = (y, mo, d, hr = 9, mi = 0) => new Date(y, mo - 1, d, hr, mi);
const NOW = at(2026, 11, 7, 9);
let seq = 0;
const ev = (type, payload, when) => ({ id: 'e' + (++seq), type, at: (when || NOW).toISOString(), payload: payload || {} });
const viewOf = (rows) => E.makeView(rows);
const coveSkill = Content.skills.find((s) => s.region === 'cove').id;
const settingsRow = (o) => Object.assign({ key: 'app', counters: true, showCurrentRun: false, discreet: false, tips: true, calm: false, maintenance: false,
  lastTipDay: null, lastBackupAt: null, backupReminderDismissedAt: null, milestonesSeen: [] }, o || {});

function fakeDom() {
  class Node {
    constructor(tag) { this.tagName = tag; this.nodeType = tag === '#text' ? 3 : 1; this.children = []; this.attrs = {}; this.on = {}; this.style = {}; this.hidden = false; this._text = ''; this.parentNode = null; }
    appendChild(c) { this.children.push(c); c.parentNode = this; return c; }
    setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'hidden') this.hidden = true; }
    removeAttribute(k) { delete this.attrs[k]; if (k === 'hidden') this.hidden = false; }
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null; }
    addEventListener(t, fn) { (this.on[t] = this.on[t] || []).push(fn); }
    fire(t, extra) { const e = Object.assign({ type: t, target: this, preventDefault() {}, key: '' }, extra || {}); (this.on[t] || []).forEach((fn) => fn(e)); }
    closest(sel) { const k = /^\[([a-z-]+)\]$/.exec(sel)[1]; let n = this; while (n && !(n.getAttribute && n.getAttribute(k) !== null)) n = n.parentNode; return n || null; }
    set textContent(v) { this.children = []; this._text = String(v); }
    get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
    all(pred, out = []) { for (const c of this.children) { if (pred(c)) out.push(c); c.all(pred, out); } return out; }
  }
  return { createElement: (t) => new Node(t), createTextNode: (s) => { const n = new Node('#text'); n._text = String(s); return n; } };
}
const byTest = (root, v) => root.all((n) => n.getAttribute && n.getAttribute('data-test') === v);
function uiStub(sheetEl) {
  const sheets = [];
  return {
    sheets, pages: {},
    svg: (tag, attrs, ...kids) => {
      const n = document.createElement(tag);
      for (const [k, v] of Object.entries(attrs || {})) if (v != null && v !== false) n.setAttribute(k, v === true ? '' : String(v));
      for (const k of kids.flat(5)) if (k != null && k !== false && k !== true) n.appendChild(typeof k === 'object' ? k : document.createTextNode(String(k)));
      return n;
    },
    sheet: (title, body) => { sheets.push({ title, body }); return { el: sheetEl === undefined ? body : sheetEl, close() {} }; },
  };
}
function withDom(fn, sheetEl) {
  globalThis.document = fakeDom();
  globalThis.UI = uiStub(sheetEl);
  try { return fn(globalThis.UI); } finally { delete globalThis.document; delete globalThis.UI; }
}
function ctxFor(rows, extra) {
  const view = viewOf(rows);
  const profile = view.get('profile', 'me') || {};
  const settings = view.get('settings', 'app') || {};
  return Object.assign({ view, E, profile, settings, now: NOW, features: E.revealed(view), calm: !!settings.calm,
    route: { path: '/status', parts: ['status'], query: {} } }, extra || {});
}
const render = (rows, extra) => ST.page(ctxFor(rows, extra));
/* The model as the page builds it, from a view. */
function modelOf(rows, extra) {
  const view = viewOf(rows);
  const gs = E.gameState(view, NOW);
  const rm = E.roadmap(view.get('profile', 'me') || {}, new Set(gs.modulesDone), NOW, new Set(gs.lessonsDone));
  return STP.model(gs, Object.assign({ explorer: E.explorer(view), explorerDone: E.explorerDone(view), quests: E.quests(view), nextLesson: E.nextLesson(view),
    focus: rm.focus, counters: true, discreet: false, calm: false, now: NOW }, extra || {}));
}
const levels = (m) => Object.fromEntries(m.regions.map((r) => [r.id, r.level]));
const sampleRows = () => ({
  profile: [{ key: 'me', name: 'Asha', companion: 'Kite', startDate: '2026-10-01', term: 'sober', pace: 'steady' }],
  settings: [settingsRow({ showCurrentRun: true })],
  events: [ev('LessonCompleted', { lessonId: 'm0-l1' }, at(2026, 11, 5, 10)), ev('CheckinCompleted', { kind: 'evening' }, at(2026, 11, 6, 21)),
    ev('SkillUsed', { skillId: coveSkill, helpful: true }, at(2026, 11, 4, 12)), ev('SkillUsed', { skillId: coveSkill, helpful: true }, at(2026, 11, 5, 12)),
    ev('SkillUsed', { skillId: coveSkill, helpful: true }, at(2026, 11, 6, 12)), ev('SlipLogged', { date: '2026-10-20' }, at(2026, 10, 20, 22))],
  logs: [{ id: 'l-c', type: 'craving', at: at(2026, 11, 6, 19).toISOString(), date: '2026-11-06', intensity: 6, triggerIds: [] },
    { id: 'l-s', type: 'slip', at: at(2026, 10, 20, 22).toISOString(), date: '2026-10-20' }],
});
const PLACES = ['lighthouse', 'cove', 'garden', 'pier', 'compass', 'weather'];

test('status model is pure and deterministic', () => {
  const rows = sampleRows();
  const gs = E.gameState(viewOf(rows), NOW);
  const extra = { explorer: E.explorer(viewOf(rows)), quests: E.quests(viewOf(rows)), nextLesson: null, focus: null, counters: true, discreet: false, now: NOW };
  const gsBefore = JSON.stringify(gs); const exBefore = JSON.stringify(extra);
  const a = STP.model(gs, extra); const b = STP.model(gs, extra);
  assert.deepEqual(a, b);
  assert.deepEqual(JSON.parse(JSON.stringify(a)), a, 'plain data only');
  assert.equal(JSON.stringify(gs), gsBefore, 'gameState untouched');
  assert.equal(JSON.stringify(extra), exBefore, 'extra untouched');
  assert.deepEqual(a.regions.map((r) => r.id), PLACES);
  for (const k of ['regions', 'xp', 'rank', 'badges', 'days', 'next']) assert.ok(k in a, k);
  const r0 = a.regions[1];
  for (const k of ['id', 'name', 'title', 'level', 'max', 'uses', 'skills']) assert.ok(k in r0, k);
  assert.deepEqual(Object.keys(r0.skills[0]).sort(), ['id', 'level', 'name', 'next', 'uses']);
  assert.deepEqual(STP.model(null, null).regions.map((r) => r.level), [0, 0, 0, 0, 0, 0], 'no state: all levels 0, no throw');
  assert.deepEqual(STP.diff(a, b), { items: [] });
});

test('SkillUsed raises its region and the diff names it', () => {
  const base = { profile: [{ key: 'me', startDate: '2026-10-01' }], settings: [settingsRow()], events: [] };
  const before = modelOf(base);
  const after = modelOf(Object.assign({}, base, { events: [ev('SkillUsed', { skillId: coveSkill, helpful: true })] }));
  assert.equal(levels(before).cove, 0);
  assert.equal(levels(after).cove, 1);
  const d = STP.diff(before, after);
  const reg = d.items.filter((i) => i.kind === 'region');
  assert.equal(reg.length, 1);
  assert.equal(reg[0].id, 'cove');
  assert.equal(reg[0].from, 0); assert.equal(reg[0].to, 1);
  assert.match(reg[0].text, /The Cove/);
  assert.ok(d.items.every((i) => typeof i.text === 'string' && i.text && !/down|lost|lower/i.test(i.text)));
});

test('SlipLogged plus a slip log leaves every level equal and the diff empty', () => {
  const base = sampleRows();
  base.events = base.events.filter((e) => e.type !== 'SlipLogged');
  base.logs = base.logs.filter((l) => l.type !== 'slip');
  const before = modelOf(base);
  const slipped = Object.assign({}, base, { events: base.events.concat([ev('SlipLogged', { date: '2026-11-07' })]),
    logs: base.logs.concat([{ id: 'l-s2', type: 'slip', at: NOW.toISOString(), date: '2026-11-07' }]) });
  const after = modelOf(slipped);
  assert.deepEqual(levels(after), levels(before));
  assert.ok(levels(before).cove >= 1, 'the sample has a lit place');
  assert.deepEqual(STP.diff(before, after), { items: [] });
  const lv = (rows) => withDom(() => byTest(render(rows), 'status-place').map((n) => n.getAttribute('data-level')));
  assert.deepEqual(lv(slipped), lv(base), 'data-level equal on the page');
});

test('status diff lists rises only', () => {
  const m = modelOf(sampleRows());
  assert.deepEqual(STP.diff(m, m), { items: [] });
  const higher = JSON.parse(JSON.stringify(m));
  higher.regions[0].level = 3; higher.xp.total += 10; higher.badges.earned += 1; higher.days.total += 2; higher.ticks.explorer += 1; higher.ticks.quests += 1;
  const up = STP.diff(m, higher);
  assert.deepEqual(up.items.map((i) => i.kind).sort(), ['badge', 'day', 'explorer', 'quest', 'region', 'xp']);
  assert.deepEqual(STP.diff(higher, m), { items: [] }, 'a fall is never listed');
  assert.deepEqual(STP.diff(null, m), { items: [] });
  const ranks = Content.ranks.map((r) => r.id);
  if (ranks.length > 1) {
    const r1 = Object.assign({}, m, { rank: { id: ranks[0], name: 'a' } }); const r2 = Object.assign({}, m, { rank: { id: ranks[1], name: 'b' } });
    assert.deepEqual(STP.diff(r1, r2).items.map((i) => i.kind), ['rank']);
    assert.deepEqual(STP.diff(r2, r1), { items: [] });
  }
});

test('calm: no scene, no XP, no badges, places as a list', () => withDom(() => {
  const root = render({ ...sampleRows(), settings: [settingsRow({ calm: true })] });
  assert.equal(byTest(root, 'status-scene').length, 0);
  assert.equal(byTest(root, 'harbor-scene').length, 0);
  assert.equal(byTest(root, 'game-xp').length, 0);
  assert.equal(byTest(root, 'rank-card').length, 0);
  assert.doesNotMatch(root.textContent, /badges|XP/);
  const places = byTest(root, 'status-place');
  assert.deepEqual(places.map((p) => p.getAttribute('data-region')), PLACES);
  assert.ok(places.every((p) => p.tagName === 'button' && p.getAttribute('type') === 'button'));
  assert.equal(byTest(root, 'status-next').length, 1);
}));

test('discreet: no scene, no days', () => withDom(() => {
  const root = render({ ...sampleRows(), settings: [settingsRow({ discreet: true })] });
  assert.equal(byTest(root, 'status-scene').length, 0);
  assert.equal(byTest(root, 'status-days').length, 0);
  assert.doesNotMatch(root.textContent, /Days in all/);
  assert.equal(byTest(root, 'status-sos')[0].textContent, 'Help');
  assert.equal(byTest(root, 'status-place').length, 6);
}));

test('days show only with counters on and discreet off, never the current run', () => {
  const gs = E.gameState(viewOf(sampleRows()), NOW);
  assert.ok(gs.counters.total > 0);
  assert.deepEqual(STP.model(gs, { counters: true, discreet: false }).days, { show: true, total: gs.counters.total });
  assert.equal(STP.model(gs, { counters: false }).days.show, false);
  assert.equal(STP.model(gs, { counters: true, discreet: true }).days.show, false);
  assert.equal(STP.model(E.gameState(viewOf({}), NOW), { counters: true }).days.show, false, 'no start date: no day count');
  assert.ok(!/current|run|streak/i.test(JSON.stringify(Object.keys(STP.model(gs, {})))), 'no current-run field');
  withDom(() => {
    const root = render(sampleRows());
    assert.equal(byTest(root, 'status-days')[0].textContent, 'Days in all: ' + gs.counters.total);
    assert.doesNotMatch(root.textContent, /in a row|current run|streak/i);
    assert.equal(byTest(render({ ...sampleRows(), settings: [settingsRow({ counters: false })] }), 'status-days').length, 0);
    assert.equal(byTest(render({}), 'status-days').length, 0, 'empty profile: no Days in all: 0');
  });
});

test('next step order: explorer, lesson, focus, quest', () => {
  const ex = [{ id: 'tour', label: 'Take the tour', done: true }, { id: 'reasons', label: 'Write a reason', done: false }];
  const lesson = { id: 'm0-l1', title: 'First lesson' };
  const focus = { moduleId: Content.modules[0].id, lessonsLeft: 2 };
  const quests = { q1: { steps: [{ id: 's1', label: 'Step one', done: true }, { id: 's2', label: 'Step two', done: false }], done: 1, total: 2, complete: false } };
  assert.deepEqual(STP.nextStep({ explorer: ex, nextLesson: lesson, focus, quests }), { kind: 'explorer', id: 'reasons', label: 'Write a reason', href: '#/workbook/reasons' });
  assert.equal(STP.nextStep({ explorer: [{ id: 'odd', label: 'x', done: false }] }).href, '#/today');
  assert.deepEqual(STP.nextStep({ explorer: ex, explorerDone: true, nextLesson: lesson, focus, quests }), { kind: 'lesson', id: 'm0-l1', label: 'Lesson: First lesson', href: '#/lesson/m0-l1' });
  const f = STP.nextStep({ nextLesson: null, focus, quests });
  assert.equal(f.kind, 'focus'); assert.equal(f.href, '#/learn/' + focus.moduleId);
  assert.deepEqual(STP.nextStep({ focus: { moduleId: 'm0', lessonsLeft: 0 }, quests }), { kind: 'quest', id: 'q1', label: 'Step two', href: '#/actions/quests' });
  assert.equal(STP.nextStep({ quests: { q1: Object.assign({}, quests.q1, { complete: true }) } }), null);
  assert.equal(STP.nextStep({}), null);
});

test('place sheet lists skills with level, uses and next count', () => withDom((U) => {
  const root = render(sampleRows());
  const cove = byTest(root, 'status-place').find((p) => p.getAttribute('data-region') === 'cove');
  assert.match(cove.textContent, /^The Cove, level \d of 5$/);
  cove.fire('click');
  assert.equal(U.sheets.length, 1);
  assert.equal(U.sheets[0].title, 'The Cove');
  const text = U.sheets[0].body.textContent;
  const skill = Content.skills.find((s) => s.id === coveSkill);
  assert.match(text, new RegExp(skill.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ', level 2, used 3 times; 4 more uses to reach level 3'));
  assert.match(text, /Level \d of 5/);
  assert.doesNotMatch(text, /XP/);
  const lines = STP.placeLines({ name: 'X', title: 'T', level: 5, skills: [{ id: 'a', name: 'A', level: 5, uses: 40, next: null }] });
  assert.deepEqual(lines, ['T', 'Level 5 of 5', 'A, level 5, used 40 times; top level']);
  // the scene's places open the same sheet
  const scene = byTest(root, 'status-scene')[0];
  assert.ok(scene && byTest(scene, 'harbor-scene').length === 1);
  const g = scene.all((n) => n.getAttribute && n.getAttribute('data-place') === 'garden')[0];
  scene.on.click[0]({ target: g });
  assert.equal(U.sheets[1].title, 'The Garden');
}));

test('status renders empty and sample profile, no dead button, SOS link present', () => {
  for (const rows of [{}, sampleRows()]) withDom(() => {
    const root = render(rows);
    assert.equal(root.getAttribute('data-test'), 'status-page');
    assert.equal(root.all((n) => n.tagName === 'h1')[0].textContent, 'Your Harbor');
    for (const t of ['status-stand', 'status-next', 'status-back', 'status-sos']) assert.equal(byTest(root, t).length, 1, t);
    assert.equal(byTest(root, 'status-place').length, 6);
    assert.equal(byTest(root, 'status-sos')[0].getAttribute('href'), '#/sos');
    assert.equal(byTest(root, 'status-back')[0].getAttribute('href'), '#/today');
    for (const b of root.all((n) => n.tagName === 'button')) {
      assert.ok((b.on.click || []).length > 0, 'button has a handler'); assert.ok(b.textContent.trim(), 'button has a name');
    }
    for (const a of root.all((n) => n.tagName === 'a')) {
      assert.match(a.getAttribute('href') || '', /^#\//); assert.ok(a.textContent.trim(), 'link has a name');
    }
  });
  withDom(() => { // empty profile: a next step exists (the Explorer)
    const go = byTest(render({}), 'status-next-go');
    assert.equal(go.length, 1);
    assert.equal(go[0].getAttribute('data-kind'), 'explorer');
  });
  withDom(() => { // no dialog: the place opens in place, never a dead button
    const root = render(sampleRows());
    const p = byTest(root, 'status-place')[1];
    const more = p.parentNode.children[1];
    assert.equal(more.hidden, true);
    p.fire('click');
    assert.equal(more.hidden, false);
    assert.match(more.textContent, /Level \d of 5/);
  }, null);
  withDom(() => { // the Engine fails: the frame, Back and SOS stay
    const root = render({}, { E: { gameState() { throw new Error('x'); } } });
    assert.match(root.textContent, /Not available right now/);
    assert.equal(byTest(root, 'status-sos').length, 1);
    assert.equal(byTest(root, 'status-back').length, 1);
  });
  withDom((U) => { // registration through UI.pages, no ui-core edit
    classic('ui-status.js', 'StatusUI');
    assert.equal(typeof U.pages.status, 'function');
    assert.equal(U.pages.status(ctxFor({})).getAttribute('data-test'), 'status-page');
  });
});

test('status text goes in as text', () => {
  assert.doesNotMatch(CODE, /innerHTML|outerHTML|insertAdjacentHTML|document\.write/);
  assert.doesNotMatch(CODE, /\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource|import\(/, 'no network');
  assert.doesNotMatch(CODE, /localStorage|indexedDB|\.recordEvent|Store\./, 'no write');
  const old = Content.regions.cove.name;
  try {
    Content.regions.cove.name = '<img src=x onerror=alert(1)>';
    withDom((U) => {
      const p = byTest(render(sampleRows()), 'status-place').find((n) => n.getAttribute('data-region') === 'cove');
      assert.equal(p.textContent, '<img src=x onerror=alert(1)>, level 2 of 5');
      assert.equal(p.children.length, 0, 'no element parsed from data');
      p.fire('click');
      assert.equal(U.sheets[0].title, '<img src=x onerror=alert(1)>');
    });
  } finally { Content.regions.cove.name = old; }
});

test('status module has pure exports only', () => {
  assert.deepEqual(Object.keys(STP).sort(), ['TEXT', 'diff', 'model', 'nextStep', 'placeLines', 'strip']);
  assert.equal(STP.page, undefined);
  assert.equal(STP.watchCard, undefined);
  assert.equal(typeof globalThis.document, 'undefined');
  assert.ok(STP.model(E.gameState(viewOf({}), NOW), {}).regions.length === 6, 'runs without a DOM');
  for (const k of ST.PURE) assert.ok(k in STP, k);
  assert.equal(STP.TEXT.title, 'Your Harbor');
});

/* ── V-01b: what changed, the strip, what to watch, the way in ───────────────────────────── */
const cls = (n) => (n.getAttribute && n.getAttribute('class')) || '';
const grewNodes = (root) => root.all((n) => /\bhb-grew\b/.test(cls(n)));
const changeItems = (root) => byTest(root, 'status-change-item');
const changeText = (root) => byTest(root, 'status-change')[0].textContent;
const baseRows = () => ({ profile: [{ key: 'me', startDate: '2026-10-01' }], settings: [settingsRow()], events: [], logs: [] });
const withSkill = (rows) => Object.assign({}, rows, { events: rows.events.concat([ev('SkillUsed', { skillId: coveSkill, helpful: true })]) });
const withSlip = (rows) => Object.assign({}, rows, {
  events: rows.events.concat([ev('SlipLogged', { date: '2026-11-07' })]),
  logs: rows.logs.concat([{ id: 'l-slip', type: 'slip', at: NOW.toISOString(), date: '2026-11-07' }]),
});

test('first open says where you stand, a second draw says nothing new', () => withDom(() => {
  ST._reset();
  const first = render(baseRows());
  assert.equal(byTest(first, 'status-change').length, 1);
  assert.equal(byTest(first, 'status-change')[0].getAttribute('data-tour'), 'status-change');
  assert.match(changeText(first), /Here is where you stand\./);
  assert.equal(changeItems(first).length, 0);
  const second = render(baseRows());
  assert.match(changeText(second), /Nothing new since you last looked\./);
  assert.equal(changeItems(second).length, 0);
  assert.equal(grewNodes(second).length, 0);
}));

test('diff after a quick log names the rise', () => withDom(() => {
  ST._reset();
  const rows = baseRows();
  render(rows);
  const after = render(withSkill(rows));
  const items = changeItems(after);
  const reg = items.filter((n) => n.getAttribute('data-kind') === 'region');
  assert.equal(reg.length, 1);
  assert.match(reg[0].textContent, /The Cove grew to level 1\./);
  assert.ok(items.some((n) => n.getAttribute('data-kind') === 'xp'), 'the XP rise is named');
  for (const n of items) assert.doesNotMatch(n.textContent, /down|lost|lower|streak/i);
  const grew = grewNodes(after);
  assert.equal(grew.length, 1, 'the place that grew pulses once');
  assert.equal(grew[0].getAttribute('data-place'), 'cove');
  assert.equal(byTest(after, 'status-place').find((n) => n.getAttribute('data-region') === 'cove').getAttribute('data-level'), '1');
  // then a slip: nothing changes, nothing pulses, no level falls
  const slip = render(withSlip(withSkill(rows)));
  assert.equal(changeItems(slip).length, 0, 'a slip is not a change on this page');
  assert.match(changeText(slip), /Nothing new since you last looked\./);
  assert.equal(grewNodes(slip).length, 0);
  assert.equal(byTest(slip, 'status-place').find((n) => n.getAttribute('data-region') === 'cove').getAttribute('data-level'), '1');
  // Calm: the rise of a place is still named, XP is not
  ST._reset();
  const calmRows = Object.assign(baseRows(), { settings: [settingsRow({ calm: true })] });
  render(calmRows);
  const calm = changeItems(render(withSkill(calmRows)));
  assert.deepEqual(calm.map((n) => n.getAttribute('data-kind')), ['region']);
}));

test('reduced motion adds no hb-grew class', () => withDom(() => {
  for (const extra of [{ settings: settingsRow({ reducedMotion: true }) }, { route: { path: '/sos', parts: ['sos'], query: {} } }]) {
    ST._reset();
    const rows = baseRows();
    render(rows, extra);
    const after = render(withSkill(rows), extra);
    assert.equal(byTest(after, 'status-scene').length, 1, 'the scene is drawn');
    assert.equal(grewNodes(after).length, 0, 'no moving class');
    assert.ok(changeItems(after).some((n) => n.getAttribute('data-kind') === 'region'), 'the words carry the change');
  }
  ST._reset();
}));

test('a redraw while the page is on screen keeps the change and pulses once', () => withDom(() => {
  ST._reset();
  const rows = baseRows();
  const onScreen = (n) => { n.isConnected = true; return n; }; // as the real DOM reports a node not yet swapped out
  const first = onScreen(render(rows));
  assert.match(changeText(first), /Here is where you stand\./);
  const rise = onScreen(render(withSkill(rows))); // a Store change re-renders the route
  assert.ok(changeItems(rise).some((n) => n.getAttribute('data-kind') === 'region'));
  assert.equal(grewNodes(rise).length, 1);
  const again = onScreen(render(withSkill(rows))); // another re-render on the same visit
  assert.ok(changeItems(again).some((n) => n.getAttribute('data-kind') === 'region'), 'the change stays while the page is shown');
  assert.equal(grewNodes(again).length, 0, 'no second pulse');
  again.isConnected = false; // the person leaves and comes back
  const back = render(withSkill(rows));
  assert.match(changeText(back), /Nothing new since you last looked\./);
  ST._reset();
}));

test('strip has 14 dated days and no count', () => {
  const days = STP.strip(['2026-11-07', '2026-11-01', '2026-10-24', 'junk'], NOW);
  assert.equal(days.length, 14);
  assert.equal(days[0].date, '2026-10-25');
  assert.equal(days[13].date, '2026-11-07');
  assert.deepEqual(days.filter((d) => d.active).map((d) => d.date), ['2026-11-01', '2026-11-07']);
  assert.equal(days[13].label, 'Sat 7 Nov');
  withDom(() => {
    const root = render(sampleRows());
    const card = byTest(root, 'status-strip')[0];
    const dots = byTest(card, 'status-strip-day');
    assert.equal(dots.length, 14);
    for (const d of dots) {
      assert.match(d.getAttribute('data-date'), /^\d{4}-\d{2}-\d{2}$/);
      assert.match(d.getAttribute('data-active'), /^(true|false)$/);
    }
    const on = dots.filter((d) => d.getAttribute('data-active') === 'true').map((d) => d.getAttribute('data-date'));
    assert.deepEqual(on, E.gameState(viewOf(sampleRows()), NOW).momentum.dates);
    assert.doesNotMatch(card.textContent, /\b\d+\s*(of 14|days? (active|in a row))|streak|run\b/i, 'a history, no count headline');
    assert.match(dots[13].textContent, /^Sat 7 Nov: (active|no entry)$/);
  });
});

test('watch card: own plan wins, empty state', () => withDom(() => {
  const empty = render(baseRows());
  const w = byTest(empty, 'status-watch');
  assert.equal(w.length, 1);
  assert.equal(w[0].getAttribute('data-tour'), 'status-watch');
  assert.match(w[0].textContent, /Nothing to watch right now\./);
  assert.equal(byTest(empty, 'status-watch-item').length, 0);
  const signs = [{ signId: 'poorSleep', label: 'Short sleep', evidence: 'Less than 6 hours of sleep on 3 of your last 5 check-ins.', plan: 'Phone off at ten, then my wind-down list.', own: true },
    { signId: 'noMeeting', label: 'No meetings lately', evidence: 'No meeting logged in the last 14 days.', plan: 'Find one meeting this week.', own: false }];
  const stub = Object.assign({}, E, { warningSigns: () => signs });
  const card = ST.watchCard({ view: viewOf({}), E: stub, now: NOW });
  const items = byTest(card, 'status-watch-item');
  assert.deepEqual(items.map((n) => n.getAttribute('data-sign')), ['poorSleep', 'noMeeting']);
  assert.match(items[0].textContent, /Your plan: Phone off at ten, then my wind-down list\./, 'the own plan the Engine chose is shown');
  assert.equal(items[0].getAttribute('data-own'), 'true');
  for (const n of card.all(() => true)) assert.doesNotMatch(cls(n), /danger|error|red|warn/, 'gentle, never red');
  assert.doesNotMatch(card.textContent, /score|risk level|\d+%/i, 'no score');
  const broken = ST.watchCard({ view: viewOf({}), E: { warningSigns() { throw new Error('x'); } }, now: NOW });
  assert.match(broken.textContent, /Nothing to watch right now\./);
}));

test('radar renders on #/track/radar', () => withDom(() => {
  globalThis.StatusUI = ST;
  try {
    const TR = classic('ui-track.js', 'TrackUI');
    const R = (path) => ({ path, parts: path.split('/').filter(Boolean), query: {} });
    assert.deepEqual(TR.routeOf(R('/track/radar')), { view: 'radar' });
    const base = { view: viewOf({}), E, A: {}, settings: {}, profile: {}, now: NOW };
    const pg = TR.page(Object.assign({ route: R('/track/radar') }, base));
    assert.equal(pg.getAttribute('data-test'), 'track-radar');
    assert.equal(byTest(pg, 'status-watch').length, 1);
    assert.equal(byTest(pg, 'track-back')[0].getAttribute('href'), '#/track');
    const home = (features) => TR.page(Object.assign({ route: R('/track'), features }, base));
    const go = byTest(home(new Set(['radar'])), 'track-radar-link');
    assert.equal(go.length, 1, 'Track links the radar once it is revealed');
    assert.equal(go[0].getAttribute('href'), '#/track/radar');
    assert.equal(byTest(home(new Set()), 'track-radar-link').length, 0);
    delete globalThis.StatusUI;
    const bare = classic('ui-track.js', 'TrackUI').page(Object.assign({ route: R('/track/radar') }, base));
    assert.match(bare.textContent, /cannot be shown right now/, 'without StatusUI the page says so, no dead link');
  } finally { delete globalThis.StatusUI; }
}));

test('Today chip routes to #/status and the harbor card links', () => withDom(() => {
  const TD = classic('ui-today.js', 'TodayUI');
  const A = new Proxy({}, { get: (t, k) => (k === 'then' ? undefined : () => Promise.resolve(null)) });
  const today = (rows, extra) => TD.page(ctxFor(rows, Object.assign({ A, route: { path: '/today', parts: ['today'], query: {} } }, extra || {})));
  const root = today(sampleRows());
  const chip = byTest(root, 'today-status');
  assert.equal(chip.length, 1);
  assert.equal(chip[0].getAttribute('href'), '#/status');
  assert.equal(chip[0].getAttribute('data-tour'), 'status-open');
  assert.equal(chip[0].textContent, 'Your harbor');
  assert.match(cls(chip[0].parentNode), /\btd-quick\b/, 'in the quick row');
  assert.ok(chip[0].parentNode.children.some((n) => n.getAttribute('data-test') === 'today-sos'), 'beside SOS');
  const go = byTest(root, 'today-harbor-go');
  assert.equal(go.length, 1);
  assert.equal(go[0].getAttribute('href'), '#/status');
  assert.equal(byTest(go[0], 'harbor-scene').length, 1, 'the scene is the link');
  assert.equal(byTest(root, 'new-dot').length, 0, 'no dot before Content.features.status exists');
  for (const s of [settingsRow({ calm: true }), settingsRow({ discreet: true })]) {
    const r = today(Object.assign(sampleRows(), { settings: [s] }), { settings: s, calm: s.calm });
    assert.equal(byTest(r, 'today-status').length, 1, 'the chip stays in Calm and discreet');
    assert.equal(byTest(r, 'today-status')[0].textContent, 'Your harbor');
  }
  const had = Object.prototype.hasOwnProperty.call(Content.features, 'status');
  Content.features.status = { name: 'Your Harbor' };
  globalThis.GuidanceUI = { dot: (id) => { const n = document.createElement('span'); n.setAttribute('data-test', 'new-dot'); n.setAttribute('data-feature', id); return n; } };
  try {
    const d = byTest(byTest(today(sampleRows()), 'today-status')[0], 'new-dot');
    assert.equal(d.length, 1);
    assert.equal(d[0].getAttribute('data-feature'), 'status');
  } finally { delete globalThis.GuidanceUI; if (!had) delete Content.features.status; }
}));

/* ── V-43: the growth in the scene, Your way, the run in Where you stand ─────────────────────── */
// The real engine with a test Content.objectives pool for growth; stub Engine.questLine until content V-42 merges.
const stubE = (o) => Object.assign(Object.create(E), o || {});
const OBJECTIVES = [
  { id: 'o-a', title: 'Take a slow breath', line: 'One minute.', doneBy: 'tap', grows: 'boat' },
  { id: 'o-b', title: 'Write one reason', line: 'Just one.', doneBy: 'tap', grows: 'bell' },
  { id: 'o-c', title: 'Drink some water', line: 'A glass.', doneBy: 'tap', grows: 'tree' },
  { id: 'o-d', title: 'Step outside', line: 'Five minutes.', doneBy: 'tap', grows: 'flag' },
];
function withPool(fn) {
  const had = Object.prototype.hasOwnProperty.call(Content, 'objectives'); const old = Content.objectives;
  Content.objectives = OBJECTIVES;
  try { return fn(); } finally { if (had) Content.objectives = old; else delete Content.objectives; }
}
const doneOn = (id, d) => ev('ObjectiveDone', { id, date: `2026-11-0${d}` }, at(2026, 11, d, 10));
const growRows = (...evs) => Object.assign(baseRows(), { events: evs });
const kindsOf = (root) => byTest(root, 'status-growth-item').map((n) => n.getAttribute('data-kind'));
const layer = (root) => byTest(root, 'status-growth-layer')[0];
const layerKinds = (root) => (layer(root) ? layer(root).children.map((n) => n.getAttribute('data-kind')) : []);

test('growth: a done objective adds one growth element and never removes one', () => withPool(() => withDom((U) => {
  ST._reset();
  const one = render(growRows(doneOn('o-a', 5)));
  assert.deepEqual(kindsOf(one), ['boat'], 'the kind of the objective it grew from');
  assert.deepEqual(layerKinds(one), ['boat'], 'one element drawn in the scene');
  const two = render(growRows(doneOn('o-a', 5), doneOn('o-b', 6)));
  assert.deepEqual(kindsOf(two), ['boat', 'bell']);
  assert.deepEqual(layerKinds(two), ['boat', 'bell']);
  assert.match(byTest(two, 'status-growth')[0].textContent, /2 things growing in your harbor\./);
  assert.ok(changeItems(two).some((n) => n.getAttribute('data-kind') === 'growth'), 'the rise is named');
  assert.equal(kindsOf(render(growRows(doneOn('o-a', 5), doneOn('o-b', 6), doneOn('o-c', 6)))).length, 2, 'one unit per objective day');
  const slip = growRows(doneOn('o-a', 5), doneOn('o-b', 6), ev('SlipLogged', { date: '2026-11-07' }));
  slip.logs = [{ id: 'l-slip', type: 'slip', at: NOW.toISOString(), date: '2026-11-07' }];
  assert.deepEqual(kindsOf(render(slip)), ['boat', 'bell'], 'a slip removes nothing');
  const empty = render(growRows());
  assert.match(byTest(empty, 'status-growth')[0].textContent, /Nothing growing yet\./);
  assert.equal(layer(empty), undefined);
  for (let n = 0; n <= 60; n++) assert.deepEqual(HarborUI.growthSpots(n + 1).slice(0, n), HarborUI.growthSpots(n), `spots ${n} to ${n + 1} only add`);
  assert.equal(layer(two).getAttribute('pointer-events'), 'none');
  assert.equal(layer(two).getAttribute('data-place'), null);
  const cove = byTest(two, 'harbor-scene')[0].all((n) => n.getAttribute && n.getAttribute('data-place') === 'cove')[0];
  byTest(two, 'status-scene')[0].fire('click', { target: cove });
  assert.equal(U.sheets.length, 1, 'the place taps still work');
  assert.match(byTest(two, 'harbor-scene')[0].getAttribute('aria-label'), /2 things growing\.$/);
})));

test('growth: same units give the same elements', () => withPool(() => withDom(() => {
  const rows = () => growRows(doneOn('o-c', 3), doneOn('o-a', 5));
  const a = render(rows()); const b = render(rows());
  assert.deepEqual(kindsOf(a), ['tree', 'boat']);
  assert.deepEqual(kindsOf(b), kindsOf(a));
  const pos = (root) => layer(root).children.map((n) => n.getAttribute('transform'));
  assert.deepEqual(pos(b), pos(a));
  assert.deepEqual(HarborUI.growthSpots(9).map((p) => p.kind), [...HarborUI.GROW_KINDS, 'lantern'], 'without items: the 8-kind cycle');
  const all = HarborUI.growthSpots(500);
  assert.equal(all.length, 60, 'at most 60 drawn');
  assert.equal(new Set(all.map((p) => `${p.x},${p.y}`)).size, 60, 'each spot its own');
  const TAPS = [[38, 58, 34, 132], [10, 172, 132, 198], [176, 286, 138, 171], [196, 360, 70, 140], [330, 350, 48, 88], [308, 336, 162, 190]];
  for (const p of all) assert.ok(!TAPS.some(([x0, x1, y0, y1]) => p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1), `spot ${p.x},${p.y} is off the places`);
  const many = render(growRows(), { E: stubE({ growth: () => 75, growthItems: () => [] }) });
  assert.equal(kindsOf(many).length, 60);
  assert.match(byTest(many, 'status-growth')[0].textContent, /75 things growing in your harbor\.[\s\S]*and 15 more/);
})));

test('growth: Calm shows the count as words, no elements', () => withPool(() => withDom(() => {
  const root = render(Object.assign(growRows(doneOn('o-a', 5), doneOn('o-b', 6)), { settings: [settingsRow({ calm: true })] }));
  assert.equal(byTest(root, 'status-growth').length, 1);
  assert.match(byTest(root, 'status-growth')[0].textContent, /2 things growing in your harbor\./);
  assert.equal(byTest(root, 'status-growth-item').length, 0);
  assert.equal(byTest(root, 'status-scene').length + byTest(root, 'status-growth-layer').length, 0);
})));

test('growth: discreet draws nothing new', () => withPool(() => withDom(() => {
  const rows = Object.assign(growRows(doneOn('o-a', 5)), { settings: [settingsRow({ discreet: true })] });
  const root = render(rows);
  for (const k of ['status-growth', 'status-growth-item', 'status-growth-layer', 'status-scene', 'harbor-scene']) assert.equal(byTest(root, k).length, 0, k);
  assert.equal(HarborUI.scene(ctxFor(rows)), null, 'the scene stays hidden');
})));

const STEPS = () => [
  { id: 'q1', title: 'First light', line: 'Log one craving.', reward: 'tReward', opened: 'You opened the test tool.', state: 'done', doneAt: NOW.toISOString(), progress: { have: 1, need: 1 }, claimable: false },
  { id: 'q2', title: 'Second step', line: 'Use a skill three times.', reward: 'tReward', opened: 'x', condition: { event: 'SkillUsed', count: 3 }, state: 'current', progress: { have: 1, need: 3 }, claimable: false },
  { id: 'q3', title: 'Third step', line: 'A hidden line.', reward: 'tReward', opened: 'A hidden opening.', condition: { event: 'SkillUsed', count: 9 }, state: 'locked', progress: { have: 1, need: 9 }, claimable: false },
];
const wayE = (steps) => stubE({ questLine: () => { const s = steps || STEPS(); return { steps: s, current: s.find((x) => x.state === 'current') || null, done: s.filter((x) => x.state === 'done').length, total: s.length }; } });
function withReward(fn) {
  const had = Object.prototype.hasOwnProperty.call(Content, 'features'); const F = Content.features;
  Content.features = Object.assign({}, F || {}, { tReward: { name: 'The Test Tool', gist: 'A tool for the test.', route: '#/today' } });
  try { return fn(); } finally { if (had) Content.features = F; else delete Content.features; }
}
const stepEl = (root, state) => byTest(root, 'questline-step').filter((n) => n.getAttribute('data-state') === state);

test('way: a locked step shows its title only', () => withReward(() => withDom(() => {
  const root = render(sampleRows(), { E: wayE() });
  assert.equal(byTest(root, 'status-way').length, 1);
  const locked = stepEl(root, 'locked');
  assert.equal(locked.length, 1);
  assert.equal(locked[0].textContent, 'Later: Third step');
  assert.equal(locked[0].all((n) => n.tagName === 'a' || n.tagName === 'button').length, 0);
})));

test('way: current shows reward and progress, done shows opened', () => withReward(() => withDom(() => {
  const root = render(sampleRows(), { E: wayE() });
  const cur = stepEl(root, 'current')[0];
  assert.match(cur.textContent, /^Now: Second step/);
  assert.match(cur.textContent, /Use a skill three times\./);
  assert.match(cur.textContent, /Unlocks: The Test Tool/);
  assert.match(cur.textContent, /Progress: 1 of 3/);
  assert.equal(cur.all((n) => n.tagName === 'a').length, 0, 'not claimable: no link');
  const done = stepEl(root, 'done')[0];
  assert.match(done.textContent, /^Done: First light/);
  assert.match(done.textContent, /You opened the test tool\./);
  const ix = (k) => root.children.indexOf(byTest(root, k)[0]);
  assert.equal(ix('status-way'), ix('status-stand') + 1, 'Your way follows Where you stand');
  const s = STEPS(); s[1].claimable = true; s[1].progress = { have: 3, need: 3 };
  const go = stepEl(render(sampleRows(), { E: wayE(s) }), 'current')[0].all((n) => n.tagName === 'a');
  assert.equal(go.length, 1);
  assert.equal(go[0].getAttribute('href'), '#/today');
  assert.equal(go[0].textContent, 'Claim it on Today');
  const disc = Object.assign(sampleRows(), { settings: [settingsRow({ discreet: true })] });
  assert.doesNotMatch(byTest(render(disc, { E: wayE() }), 'status-way')[0].textContent, /Test Tool/, 'discreet: no reward names');
})));

test("run: a break shows 'you came back' and the same best and total", () => withDom(() => {
  const days = [1, 2, 3].map((d) => ev('CheckinCompleted', { kind: 'evening' }, at(2026, 11, d, 21)));
  const rows = () => Object.assign(baseRows(), { events: days.slice() });
  const nums = (root) => ['run-current', 'run-best', 'run-total'].map((k) => byTest(byTest(root, 'status-stand')[0], k)[0].textContent);
  assert.deepEqual(nums(render(rows(), { now: at(2026, 11, 3, 22) })), ['Now 3', 'Best 3', 'In all 3']);
  const gap = render(rows(), { now: at(2026, 11, 6, 9) });
  assert.deepEqual(nums(gap).slice(1), ['Best 3', 'In all 3'], 'a break keeps best and total');
  assert.equal(byTest(gap, 'run-back').length, 0);
  const back = rows(); back.events.push(ev('CheckinCompleted', { kind: 'morning' }, at(2026, 11, 7, 8)));
  const after = render(back);
  assert.equal(byTest(after, 'run-back')[0].textContent, 'You came back.');
  assert.deepEqual(nums(after), ['Now 1', 'Best 3', 'In all 4'], 'the same best; the day back adds to the total');
  assert.doesNotMatch(byTest(after, 'status-stand')[0].textContent, /streak|lost|broken|reset|in a row|current run/i);
  assert.match(byTest(render(Object.assign(back, { settings: [settingsRow({ discreet: true })] })), 'status-stand')[0].textContent, /Days active: /);
}));

test('diff: growth, best and total only rise', () => {
  const gs = E.gameState(viewOf({}), NOW);
  const mk = (count, best, total, current) => STP.model(gs, { growth: { count, kinds: [] }, run: { current, best, total, holding: null, cameBack: false } });
  const kinds = (a, b) => STP.diff(a, b).items.map((i) => i.kind).filter((k) => ['growth', 'best', 'total'].includes(k));
  assert.deepEqual(kinds(mk(2, 3, 5, 3), mk(3, 4, 6, 4)), ['growth', 'best', 'total']);
  assert.deepEqual(kinds(mk(3, 4, 6, 4), mk(2, 3, 5, 0)), [], 'lower: nothing');
  assert.deepEqual(kinds(mk(3, 4, 6, 4), mk(3, 4, 6, 0)), [], 'a run that starts again is not a change');
  for (const i of STP.diff(mk(2, 3, 5, 3), mk(3, 4, 6, 4)).items) assert.doesNotMatch(i.text, /down|lost|lower|streak|reset|broken/i);
  const bare = STP.model(gs, {});
  assert.deepEqual([bare.growth, bare.shownUp, bare.way], [null, null, null]);
});

test('way: Engine.questLine absent means no block and no dead button', () => withDom(() => {
  const engines = [stubE({ questLine: undefined }), stubE({ questLine: () => { throw new Error('x'); } })].concat(Array.isArray(Content.questLine) ? [] : [E]);
  for (const E2 of engines) {
    const root = render(sampleRows(), { E: E2 });
    assert.equal(byTest(root, 'status-way').length, 0);
    for (const b of root.all((n) => n.tagName === 'button')) assert.ok((b.on.click || []).length > 0, 'button acts');
    for (const a of root.all((n) => n.tagName === 'a')) assert.match(a.getAttribute('href') || '', /^#\//);
  }
  assert.equal(byTest(withPool(() => render(growRows(doneOn('o-a', 5)), { E: stubE({ growth: undefined }) })), 'status-growth').length, 0, 'no Engine.growth: no growth block');
}));
