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
  assert.ok(!/current|run|streak/i.test(JSON.stringify(Object.keys(STP.model(gs, {})))), 'no current-run field');
  withDom(() => {
    const root = render(sampleRows());
    assert.equal(byTest(root, 'status-days')[0].textContent, 'Days in all: ' + gs.counters.total);
    assert.doesNotMatch(root.textContent, /in a row|current run|streak/i);
    assert.equal(byTest(render({ ...sampleRows(), settings: [settingsRow({ counters: false })] }), 'status-days').length, 0);
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
  assert.deepEqual(Object.keys(STP).sort(), ['TEXT', 'diff', 'model', 'nextStep', 'placeLines']);
  assert.equal(STP.page, undefined);
  assert.equal(typeof globalThis.document, 'undefined');
  assert.ok(STP.model(E.gameState(viewOf({}), NOW), {}).regions.length === 6, 'runs without a DOM');
  for (const k of ST.PURE) assert.ok(k in STP, k);
  assert.equal(STP.TEXT.title, 'Your Harbor');
});
