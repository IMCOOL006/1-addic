process.env.TZ = 'Asia/Kolkata';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

/* U-06: roadmap, reveal, Explorer, tips, quests, artifacts, Recovery Plan prefill (BUILD-PLAN 3.2, 3.10, 3.11). */
const require = createRequire(import.meta.url);
const E = require('../src/engine.js');
const C = require('../src/content-core.js');

const at = (d, t = '10:00') => `${d}T${t}:00+05:30`;
const TODAY = '2026-11-07'; // a Saturday
const NOW = at(TODAY, '12:00');
const day = (k) => E.addDays(TODAY, k);
let n = 0;
const nid = (p) => `${p}${String(++n).padStart(5, '0')}`;
const ev = (type, payload = {}, when = NOW) => ({ id: nid('e'), type, at: when, payload });
const resp = (exerciseId, payload, when = NOW, draft = false) => ({ id: nid('r'), exerciseId, schemaVersion: 1, payload, at: when, mode: 'workbook', draft });
const log = (type, extra = {}, when = NOW) => Object.assign({ id: nid('l'), type, at: when, triggerIds: [], feelings: [], skills: [], drill: false }, extra);
const V = (rows) => E.makeView(rows);
const allLessons = () => C.modules.flatMap((m) => m.lessons.map((l) => l.id));
const modLessons = (mid) => C.modules.find((m) => m.id === mid).lessons.map((l) => l.id);

/* ── roadmap ───────────────────────────────────────────────────────────────────────────── */

test('roadmap: modules in Content order, one week per module at Steady from the roadmapStart week', () => {
  const r = E.roadmap({ pace: 'steady', roadmapStart: TODAY }, new Set(), NOW);
  assert.deepEqual(r.order, C.modules.map((m) => m.id));
  assert.equal(r.free, false);
  assert.equal(r.weeks.length, C.modules.length);
  assert.equal(r.weeks[0].start, E.weekStart(TODAY));
  assert.equal(r.weeks[1].start, E.addDays(E.weekStart(TODAY), 7));
  assert.deepEqual(r.weeks.map((w) => w.moduleIds.length), C.modules.map(() => 1));
  assert.equal(r.current, 'm0');
  assert.equal(r.next, 'm1');
  assert.equal(r.behindWeeks, 0);
});

test('roadmap: Gentle is one module every two weeks, Focused two a week, Custom uses customPerWeek', () => {
  const g = E.roadmap({ pace: 'gentle', roadmapStart: TODAY }, [], NOW);
  assert.equal(g.weeks[1].start, E.addDays(E.weekStart(TODAY), 14));
  const f = E.roadmap({ pace: 'focused', roadmapStart: TODAY }, [], NOW);
  assert.deepEqual(f.weeks[0].moduleIds, ['m0', 'm1']);
  const c = E.roadmap({ pace: 'custom', customPerWeek: 4, roadmapStart: TODAY }, [], NOW);
  assert.deepEqual(c.weeks[0].moduleIds, C.modules.slice(0, 4).map((m) => m.id));
  const c0 = E.roadmap({ pace: 'custom', roadmapStart: TODAY }, [], NOW);
  assert.equal(c0.weeks.length, C.modules.length, 'custom without a number falls back to one a week');
  const unknown = E.roadmap({ pace: 'nope', roadmapStart: TODAY }, [], NOW);
  assert.equal(unknown.weeks.length, C.modules.length, 'an unknown pace reads as Steady');
});

test('roadmap: Free pace gives the order and progress, no weeks and never behind', () => {
  const r = E.roadmap({ pace: 'free', roadmapStart: '2025-01-01' }, new Set(['m0']), NOW);
  assert.equal(r.free, true);
  assert.deepEqual(r.weeks, []);
  assert.equal(r.behindWeeks, 0);
  assert.equal(r.current, 'm1');
});

test('roadmap: behindWeeks counts weeks past the plan, never negative; done weeks are marked', () => {
  const start = E.addDays(TODAY, -35); // five weeks ago
  const r = E.roadmap({ pace: 'steady', roadmapStart: start }, new Set(['m0']), NOW);
  assert.equal(r.weeks[0].done, true);
  assert.equal(r.weeks[1].done, false);
  assert.equal(r.current, 'm1');
  assert.equal(r.behindWeeks, 4);
  const ahead = E.roadmap({ pace: 'steady', roadmapStart: TODAY }, new Set(['m0', 'm1', 'm2']), NOW);
  assert.equal(ahead.behindWeeks, 0);
  const all = E.roadmap({ pace: 'steady', roadmapStart: start }, new Set(C.modules.map((m) => m.id)), NOW);
  assert.equal(all.current, null);
  assert.equal(all.behindWeeks, 0);
  assert.equal(all.focus.moduleId, null);
});

test('roadmap: focus is the current module, its lessons left and minutes', () => {
  const m1 = C.modules.find((m) => m.id === 'm1');
  const r = E.roadmap({ pace: 'steady', roadmapStart: TODAY }, new Set(['m0']), NOW, new Set([m1.lessons[0].id]));
  assert.equal(r.focus.moduleId, 'm1');
  assert.equal(r.focus.lessonsLeft, m1.lessons.length - 1);
  assert.equal(r.focus.minutes, m1.lessons.slice(1).reduce((s, l) => s + l.minutes, 0));
  assert.ok('practiceGoal' in r.focus);
  assert.doesNotThrow(() => E.roadmap(null, null, NOW));
});

test('nextLesson: the first lesson without LessonCompleted, then null', () => {
  assert.equal(E.nextLesson(V({})).id, 'm0-l1');
  const done = (ids) => V({ events: ids.map((lessonId) => ev('LessonCompleted', { lessonId })) });
  assert.equal(E.nextLesson(done(['m0-l1'])).id, 'm0-l2');
  assert.equal(E.nextLesson(done(modLessons('m0'))).id, modLessons('m1')[0]);
  assert.equal(E.nextLesson(done(allLessons())), null);
});

/* ── reveal ────────────────────────────────────────────────────────────────────────────── */

test('revealed: day-one features always, a module reveals its own, rows and showAll add', () => {
  const base = E.revealed(V({}));
  assert.deepEqual([...base].sort(), [...C.reveal.always].sort());
  const m2 = V({ events: [ev('ModuleCompleted', { moduleId: 'm2' })] });
  for (const f of C.reveal.m2) assert.ok(E.isRevealed(m2, f), f);
  assert.equal(E.isRevealed(m2, 'planner'), false);
  const viaLessons = V({ events: modLessons('m3').map((lessonId) => ev('LessonCompleted', { lessonId })) });
  for (const f of C.reveal.m3) assert.ok(E.isRevealed(viaLessons, f), f);
  const shown = V({ reveals: [{ id: 'planner', revealedAt: NOW, seenAt: null, forced: true }] });
  assert.ok(E.isRevealed(shown, 'planner'), 'Show now');
  const all = E.revealed(V({ settings: [{ key: 'app', showAll: true }] }));
  for (const k of Object.keys(C.reveal)) for (const f of C.reveal[k]) assert.ok(all.has(f), f);
  for (const f of Object.keys(C.features)) assert.ok(all.has(f), f);
});

test('newDots: revealed beyond day one with no seenAt; a visit clears the dot', () => {
  const ev2 = ev('ModuleCompleted', { moduleId: 'm2' });
  const dots = E.newDots(V({ events: [ev2] }));
  assert.deepEqual([...dots].sort(), [...C.reveal.m2].sort());
  const seen = E.newDots(V({ events: [ev2], reveals: [{ id: 'workbook', revealedAt: NOW, seenAt: NOW }] }));
  assert.equal(seen.has('workbook'), false);
  assert.equal(seen.has('glossary'), true);
  for (const f of C.reveal.always) assert.equal(dots.has(f), false);
});

/* ── Explorer ──────────────────────────────────────────────────────────────────────────── */

test('explorer: the 12 items in content order, none done on an empty view', () => {
  const items = E.explorer(V({}));
  assert.deepEqual(items.map((x) => x.id), C.explorer.map((x) => x.id));
  assert.equal(items.length, 12);
  assert.ok(items.every((x) => x.done === false && typeof x.label === 'string'));
  assert.equal(E.explorerDone(V({})), false);
});

test('explorer: each item derives from its rows or events, and all 12 make explorerDone', () => {
  const rows = {
    tutorials: [{ id: 'tour', completedAt: NOW, skipped: false }],
    events: [ev('TutorialCompleted', { id: 'drill', skipped: false }), ev('LessonCompleted', { lessonId: 'm0-l1' }), ev('ExerciseDone', { exerciseId: 'breathing', kind: 'practice' })],
    responses: [resp('quick-reasons', { reasons: ['My kids'] })],
    contacts: [{ id: 'c1', name: 'Asha', role: 'safetyNet', phone: '1', active: true }],
    logs: [log('craving', { intensity: 5 }), log('checkin', { checkin: { kind: 'evening', mood: 3 } })],
    reveals: [{ id: 'workbook', revealedAt: NOW, seenAt: NOW }],
    plans: [{ id: 'p1', date: TODAY, start: '19:00', end: '21:00', title: 'Film', kind: 'want' }],
    profile: [{ key: 'me', pace: 'steady' }],
  };
  const items = E.explorer(V(rows));
  for (const it of items) assert.equal(it.done, true, it.id);
  assert.equal(E.explorerDone(V(rows)), true);
  const skippedTour = E.explorer(V({ tutorials: [{ id: 'tour', completedAt: NOW, skipped: true }] }));
  assert.equal(skippedTour.find((x) => x.id === 'tour').done, false, 'a skipped tour is not taken');
  const inactive = E.explorer(V({ contacts: [{ id: 'c1', role: 'safetyNet', active: false }] }));
  assert.equal(inactive.find((x) => x.id === 'safetyNet').done, false);
  const morning = E.explorer(V({ logs: [log('checkin', { checkin: { kind: 'morning' } })] }));
  assert.equal(morning.find((x) => x.id === 'checkin').done, false, 'only an evening check-in counts');
  const drillLog = E.explorer(V({ logs: [log('craving', { drill: true })] }));
  assert.equal(drillLog.find((x) => x.id === 'log').done, false, 'a drill row never counts');
  const draft = E.explorer(V({ responses: [resp('quick-reasons', { reasons: ['x'] }, NOW, true)] }));
  assert.equal(draft.find((x) => x.id === 'reasons').done, false, 'a draft is not the artifact');
  const unseen = E.explorer(V({ reveals: [{ id: 'workbook', revealedAt: NOW, seenAt: null }] }));
  assert.equal(unseen.find((x) => x.id === 'workbook').done, false);
  const shouldOnly = E.explorer(V({ plans: [{ id: 'p', date: TODAY, kind: 'should' }] }));
  assert.equal(shouldOnly.find((x) => x.id === 'plan').done, true);
  assert.equal(shouldOnly.find((x) => x.id === 'wantTo').done, false);
});

test('explorerDone: ExplorerCompleted keeps it done whatever the rows say', () => {
  assert.equal(E.explorerDone(V({ events: [ev('ExplorerCompleted', {})] })), true);
});

/* ── tips ──────────────────────────────────────────────────────────────────────────────── */

const tipView = (rows = {}) => V(Object.assign({ settings: [{ key: 'app', tips: true, lastTipDay: null }] }, rows));

test('pickTip: never on an SOS route, never when switched off, at most one a day', () => {
  const v = tipView();
  assert.ok(E.pickTip(v, NOW), 'a tip on an empty Today');
  for (const route of ['#/sos', '#/sos/craving', '#/sos/urgent', '#/sos?drill=1']) assert.equal(E.pickTip(v, NOW, { route }), null, route);
  assert.ok(E.pickTip(v, NOW, { route: '#/today' }));
  assert.equal(E.pickTip(V({ settings: [{ key: 'app', tips: false }] }), NOW), null);
  assert.equal(E.pickTip(V({ settings: [{ key: 'app', lastTipDay: TODAY }] }), NOW), null);
  assert.equal(E.pickTip(tipView({ tips: [{ id: 'backup', shownAt: at(TODAY, '08:00') }] }), NOW), null, 'a tip row from today');
  assert.ok(E.pickTip(V({ settings: [{ key: 'app', lastTipDay: day(-1) }] }), NOW), 'yesterday does not block today');
});

test('pickTip: a tip shown in the last 14 days is skipped; deterministic', () => {
  const first = E.pickTip(tipView(), NOW);
  const recent = E.pickTip(tipView({ tips: [{ id: first.id, shownAt: at(day(-13)) }] }), NOW);
  assert.notEqual(recent && recent.id, first.id);
  const old = E.pickTip(tipView({ tips: [{ id: first.id, shownAt: at(day(-14)) }] }), NOW);
  assert.equal(old.id, first.id);
  assert.deepEqual(E.pickTip(tipView(), NOW), E.pickTip(tipView(), NOW));
});

/* Each rule fires on data that meets it and stays quiet otherwise (other rules are silenced). */
const quiet = () => ({
  settings: [{ key: 'app', tips: true, lastBackupAt: at(day(-1)) }],
  profile: [{ key: 'me', reviewDay: 1 }],
  responses: [resp('quick-reasons', { reasons: ['a', 'b', 'c'] })],
  contacts: [],
  plans: [{ id: 'pw', date: day(1), kind: 'want', start: '18:00', end: '19:00', title: 'Walk' }],
  events: [-1, -2, -3, -4].map((k) => ev('ExerciseDone', { exerciseId: 'breathing', kind: 'practice' }, at(day(k)))),
  logs: [],
});
const tipFor = (patch) => { const r = quiet(); patch(r); const t = E.pickTip(V(r), NOW); return t ? t.when : undefined; };

test('pickTip: the quiet baseline gives no tip', () => {
  assert.equal(tipFor(() => {}), undefined);
});

test('pickTip rules: redFlagLogNoTrial, eveningCravings, thinReasons, oneSafetyNet', () => {
  assert.equal(tipFor((r) => { r.logs.push(log('craving', { redFlag: true, thought: 'Just one.' }, at(day(-2)))); }), 'redFlagLogNoTrial');
  assert.equal(tipFor((r) => { r.logs.push(log('craving', { redFlag: true }, at(day(-2)))); r.responses.push(resp('trial', { thought: 'Just one.', closing: 'One is never one.' }, at(day(-1)))); }), undefined);
  assert.equal(tipFor((r) => { r.logs.push(log('craving', { redFlag: true }, at(day(-20)))); }), undefined, 'older than 14 days');
  const evening = (r, k) => { for (let i = 1; i <= k; i++) r.logs.push(log('craving', { intensity: 5 }, at(day(-i), '20:30'))); };
  assert.equal(tipFor((r) => evening(r, 3)), 'eveningCravings');
  assert.equal(tipFor((r) => evening(r, 2)), undefined);
  assert.equal(tipFor((r) => { evening(r, 3); r.plans.push({ id: 'pt', date: TODAY, kind: 'should' }); }), undefined, 'tonight is planned');
  assert.equal(tipFor((r) => { r.responses = [resp('quick-reasons', { reasons: ['a', 'b'] })]; }), 'thinReasons');
  assert.equal(tipFor((r) => { r.contacts = [{ id: 'c', role: 'safetyNet', active: true }]; }), 'oneSafetyNet');
  assert.equal(tipFor((r) => { r.contacts = [{ id: 'c', role: 'safetyNet', active: true }, { id: 'd', role: 'safetyNet', active: true }]; }), undefined);
});

test('pickTip rules: noPractice, noBackup, lowMomentum, noWantTo, reviewDue', () => {
  assert.equal(tipFor((r) => { r.events = [ev('LessonCompleted', { lessonId: 'm0-l1' }, at(day(-8)))]; }), 'noPractice');
  assert.equal(tipFor((r) => { r.events.push(ev('MindfulMinute', {}, at(day(-1)))); }), undefined);
  const many = (r) => { for (let i = 0; i < 10; i++) r.logs.push(log('feeling', { intensity: 3 }, at(day(-1), '09:00'))); };
  assert.equal(tipFor((r) => { many(r); r.settings[0].lastBackupAt = null; }), 'noBackup');
  assert.equal(tipFor((r) => { many(r); r.settings[0].lastBackupAt = at(day(-31)); }), 'noBackup');
  assert.equal(tipFor((r) => { r.settings[0].lastBackupAt = null; }), undefined, 'nothing worth backing up yet');
  assert.equal(tipFor((r) => { r.events = [-1, -2].map((k) => ev('ExerciseDone', { exerciseId: 'breathing', kind: 'practice' }, at(day(k)))); }), 'lowMomentum');
  assert.equal(tipFor((r) => { r.plans = []; }), 'noWantTo');
  assert.equal(tipFor((r) => { r.plans = [{ id: 'x', date: day(7), kind: 'want' }]; }), 'noWantTo', 'a week away does not count');
  assert.equal(tipFor((r) => { r.profile[0].reviewDay = 6; }), 'reviewDue', 'Saturday is the review day');
  assert.equal(tipFor((r) => { r.profile[0].reviewDay = 6; r.events.push(ev('WeeklyReviewCompleted', { weekStart: day(-5) }, at(day(-2)))); }), undefined);
});

/* ── quests ────────────────────────────────────────────────────────────────────────────── */

test('quests: every Content quest, steps ticked from the quests row, complete by ticks or completedAt', () => {
  const q0 = E.quests(V({}));
  assert.deepEqual(Object.keys(q0), C.quests.map((q) => q.id));
  for (const q of C.quests) assert.deepEqual(q0[q.id], { steps: q.steps.map((s) => ({ id: s.id, label: s.label, done: false })), done: 0, total: q.steps.length, complete: false });
  const half = E.quests(V({ quests: [{ id: 'clear-space', startedAt: NOW, ticks: { list: NOW }, completedAt: null }] }))['clear-space'];
  assert.equal(half.done, 1);
  assert.equal(half.complete, false);
  const all = E.quests(V({ quests: [{ id: 'clear-space', ticks: { list: NOW, helper: NOW, done: NOW } }] }))['clear-space'];
  assert.equal(all.complete, true);
  assert.equal(E.quests(V({ quests: [{ id: 'scripts', ticks: {}, completedAt: NOW }] })).scripts.complete, true);
});

test('quests: seven-days from evening check-ins, prediction-lab from completed predictions, crew from contacts and reach-outs', () => {
  const nights = [1, 2, 3].map((k) => log('checkin', { checkin: { kind: 'evening' } }, at(day(-k), '21:00')));
  nights.push(log('checkin', { checkin: { kind: 'evening' } }, at(day(-1), '22:00')), log('checkin', { checkin: { kind: 'morning' } }, at(day(-4), '08:00')));
  const s = E.quests(V({ logs: nights }))['seven-days'];
  assert.equal(s.done, 3, 'distinct evenings only');
  assert.deepEqual(s.steps.map((x) => x.done), [true, true, true, false, false, false, false]);
  const preds = [{ id: 'a', predicted: 3, actual: 5, completedAt: NOW }, { id: 'b', predicted: 2, actual: null, completedAt: null }];
  assert.equal(E.quests(V({ predictions: preds }))['prediction-lab'].done, 1);
  const crew = E.quests(V({
    contacts: [1, 2, 3].map((i) => ({ id: 'c' + i, role: 'safetyNet', active: i !== 3 })),
    events: [ev('ContactReached', { contactId: 'c1', how: 'call' })],
    logs: [log('activity', { activity: { kind: 'meeting', minutes: 60 } })],
  })).crew;
  assert.deepEqual(crew.steps.map((x) => [x.id, x.done]), [['nets', true], ['reach1', true], ['reach2', false], ['meeting', true]]);
});

/* ── artifacts ─────────────────────────────────────────────────────────────────────────── */

test('latest and history: latest non-draft is the artifact; history newest first, drafts left out', () => {
  const rows = [resp('triggers', { v: 1 }, at(day(-3))), resp('triggers', { v: 2 }, at(day(-1))), resp('triggers', { v: 3 }, NOW, true), resp('other', { v: 9 })];
  const v = V({ responses: rows });
  assert.equal(E.latest(v, 'triggers').payload.v, 2);
  assert.deepEqual(E.history(v, 'triggers').map((r) => r.payload.v), [2, 1]);
  assert.equal(E.latest(v, 'none'), null);
  assert.deepEqual(E.history(V({}), 'triggers'), []);
});

test('reasonsCard: one list of strings (the SOS contract), the four 3.2 lists in reasonsCardSections', () => {
  const v = V({ responses: [
    resp('quick-reasons', { reasons: ['My daughter', ' ', 'Sleep again'] }, at(day(-2))),
    resp('balance', { drawbacks: ['Lost money'], benefits: [{ text: 'Mornings back' }] }),
    resp('four-lenses', { different: 'I would show up' }),
  ] });
  assert.deepEqual(E.reasonsCardSections(v), { quick: ['My daughter', 'Sleep again'], drawbacks: ['Lost money'], benefits: ['Mornings back'], different: ['I would show up'] });
  assert.deepEqual(E.reasonsCard(v), ['My daughter', 'Sleep again', 'Lost money', 'Mornings back', 'I would show up']);
  assert.deepEqual(E.reasonsCard(V({})), []);
  assert.deepEqual(E.reasonsCard(V({ responses: [resp('quick-reasons', { first: 'Health', second: ['Work'] })] })), ['Health', 'Work'], 'unknown payload keys still read');
});

test('comebacks: closing statements from trial, newest first, as strings; comebackRows keeps the thought', () => {
  const v = V({ responses: [resp('trial', { thought: 'Just one.', closing: 'One is never one for me.' }, at(day(-2))), resp('trial', { thought: 'Bad day.', comeback: 'A bad day passes.' }), resp('trial', { thought: 'No reply yet' })] });
  assert.deepEqual(E.comebacks(v), ['A bad day passes.', 'One is never one for me.']);
  assert.deepEqual(E.comebackRows(v)[0], { thought: 'Bad day.', response: 'A bad day passes.', at: NOW });
  assert.deepEqual(E.comebacks(V({})), []);
});

test('distractionDeck: the person\'s own list, else the catalog', () => {
  assert.deepEqual(E.distractionDeck(V({ responses: [resp('distractions', { picks: ['Walk to the shop', 'Call Asha'] })] })), ['Walk to the shop', 'Call Asha']);
  assert.deepEqual(E.distractionDeck(V({})), C.catalogs.distractions);
});

test('spiralThoughts: [{thought, reply}] with the person\'s replies, a self-talk line when none', () => {
  const pairs = E.spiralThoughts(V({ responses: [resp('spiral', { pairs: [{ thought: 'I blew it.', reply: 'One slip is one day.' }, { thought: 'I have no willpower.' }] })] }));
  assert.deepEqual(pairs[0], { thought: 'I blew it.', reply: 'One slip is one day.' });
  assert.equal(pairs[1].thought, 'I have no willpower.');
  assert.ok(pairs[1].reply.length > 0);
  const listed = E.spiralThoughts(V({ responses: [resp('spiral', { thoughts: ['I am hopeless.'], replies: ['I am learning.'] })] }));
  assert.deepEqual(listed, [{ thought: 'I am hopeless.', reply: 'I am learning.' }]);
  assert.deepEqual(E.spiralThoughts(V({})), []);
});

test('triggerChips: the catalog with the person\'s marks, frequent first, then theirs, then the rest', () => {
  const base = E.triggerChips(V({}));
  const catCount = Object.values(C.catalogs.triggers).reduce((s, l) => s + l.length, 0);
  assert.equal(base.length, catCount);
  assert.ok(base.every((c) => c.id && c.label && c.kind && c.frequent === false && c.anger === false));
  assert.equal(new Set(base.map((c) => c.id)).size, base.length, 'ids are unique');
  const v = V({ responses: [resp('triggers', { internal: ['Stress', { label: 'Anger', frequent: true }], places: ['A friend\'s house'], frequent: ['A friend\'s house'], anger: ['Stress'], custom: ['Cricket nights'] })] });
  const chips = E.triggerChips(v);
  assert.deepEqual(chips.slice(0, 2).map((c) => c.label).sort(), ['A friend\'s house', 'Anger']);
  assert.ok(chips.slice(0, 2).every((c) => c.frequent));
  const stress = chips.find((c) => c.label === 'Stress');
  assert.equal(stress.anger, true);
  assert.equal(stress.frequent, false);
  assert.ok(chips.indexOf(stress) < chips.findIndex((c) => !c.mine));
  assert.ok(chips.some((c) => c.label === 'Cricket nights' && c.kind === 'custom'));
});

/* ── My Recovery Plan prefill ──────────────────────────────────────────────────────────── */

test('prefillRecoveryPlan: nine sections, each {items, confirmed:false}, empty on an empty view', () => {
  const p = E.prefillRecoveryPlan(V({}), NOW);
  assert.deepEqual(Object.keys(p), ['motivation', 'wellness', 'situation', 'people', 'mood', 'triggers', 'warnings', 'battlePlans', 'support']);
  for (const k of Object.keys(p)) assert.deepEqual(p[k], { items: [], confirmed: false }, k);
});

test('prefillRecoveryPlan: each section from its source (3.10)', () => {
  const skills = C.skills;
  const ofKind = (k) => skills.filter((s) => s.kind === k);
  const used = (skillId, times, helpful = true) => Array.from({ length: times }, () => ev('SkillUsed', { skillId, helpful }));
  const wellness = ofKind('wellness');
  const events = [];
  wellness.slice(0, 8).forEach((s, i) => events.push(...used(s.id, 8 - i)));
  events.push(...used(ofKind('mood')[0].id, 2), ...used(ofKind('mood')[1].id, 1, false), ...used(ofKind('situation')[0].id, 1));
  const v = V({
    events,
    responses: [
      resp('quick-reasons', { reasons: ['My daughter'] }),
      resp('triggers', { internal: [{ label: 'Stress', frequent: true }] }),
      resp('warning-signs', { top: [{ id: 'poor-sleep', plan: 'Bed by 11' }, { id: 'isolating', plan: 'Call Asha' }] }),
      resp('slip-review', { support: ['Tuesday group'] }),
      resp('expand-network', { support: ['The clinic on MG Road'] }),
    ],
    motivation: [{ id: 'm1', at: at(day(-3)), stage: 'action', score: 6, plusOne: 'I slept well' }, { id: 'm2', at: NOW, stage: 'action', score: 7, plusOne: 'I called my sister' }],
    contacts: [
      { id: 'c1', name: 'Asha', role: 'safetyNet', active: true }, { id: 'c2', name: 'Dr Rao', role: 'therapist', active: true },
      { id: 'c3', name: 'Old friend', role: 'risky', active: true }, { id: 'c4', name: 'Gone', role: 'safetyNet', active: false },
    ],
    logs: [log('craving', { triggerIds: ['places:a-friend-s-house', 'internal:stress'] }), log('craving', { triggerIds: ['places:a-friend-s-house'] })],
    plans: [
      { id: 'b1', date: day(-7), kind: 'risky', title: 'Friday party', battlePlan: { situation: 'Office party', plan: 'Leave by 9' } },
      { id: 'b2', date: day(-1), kind: 'risky', title: 'Friday party', battlePlan: { situation: 'Office party', plan: 'Drive myself, leave by 9' } },
      { id: 'b3', date: day(-2), kind: 'risky', title: 'Wedding', battlePlan: { situation: 'Cousin\'s wedding', plan: 'Stay with Asha' } },
      { id: 'n1', date: TODAY, kind: 'want', title: 'Film' },
    ],
  });
  const p = E.prefillRecoveryPlan(v, NOW);
  assert.deepEqual(p.motivation.items, ['My daughter', 'I called my sister']);
  assert.deepEqual(p.wellness.items, wellness.slice(0, 6).map((s) => s.name));
  assert.deepEqual(p.mood.items, [ofKind('mood')[0].name], 'a skill rated unhelpful scores 0 and is left out');
  assert.deepEqual(p.situation.items, [ofKind('situation')[0].name]);
  assert.deepEqual(p.people.items, ['Asha (Safety Net)', 'Dr Rao (therapist)']);
  assert.deepEqual(p.triggers.items, ['Stress', 'A friend\'s house']);
  assert.deepEqual(p.warnings.items, ['Poor or too little sleep: Bed by 11', 'Pulling away from people: Call Asha']);
  assert.deepEqual(p.battlePlans.items, ['Office party: Drive myself, leave by 9', 'Cousin\'s wedding: Stay with Asha']);
  assert.deepEqual(p.support.items, ['Tuesday group', 'The clinic on MG Road']);
  for (const k of Object.keys(p)) assert.equal(p[k].confirmed, false);
});

test('U-06 functions never throw on missing or odd rows', () => {
  const odd = V({ responses: [null, { exerciseId: 'trial', at: 'bad' }, resp('triggers', null), resp('spiral', 'text')], logs: [null, { type: 'craving' }], plans: [null, { battlePlan: 'x' }], contacts: [{}], quests: [{ id: 'crew', ticks: null }] });
  for (const fn of ['nextLesson', 'revealed', 'newDots', 'explorer', 'explorerDone', 'quests', 'reasonsCard', 'comebacks', 'distractionDeck', 'spiralThoughts', 'triggerChips']) {
    assert.doesNotThrow(() => E[fn](odd), fn);
    assert.doesNotThrow(() => E[fn](undefined), fn + ' (no view)');
  }
  assert.doesNotThrow(() => E.pickTip(odd, NOW));
  assert.doesNotThrow(() => E.prefillRecoveryPlan(odd, NOW));
  assert.doesNotThrow(() => E.prefillRecoveryPlan(undefined, NOW));
});
