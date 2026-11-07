process.env.TZ = 'Asia/Kolkata';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/* V-40 (R-O-6): quest-line, unlocked, daily objectives, growth, run. Until content V-42 merges, the steps and
   objectives are an inline fixture shaped as contracts/engine.md "V3 R-O-6", set on Content and restored. */
const require = createRequire(import.meta.url);
const E = require('../src/engine.js');
const C = require('../src/content-core.js');

const at = (d, t = '10:00') => `${d}T${t}:00+05:30`;
const TODAY = '2026-11-08'; // a Sunday
const NOW = at(TODAY, '12:00');
const day = (k) => E.addDays(TODAY, k);
let n = 0;
const nid = (p) => `${p}${String(++n).padStart(5, '0')}`;
const ev = (type, payload = {}, when = NOW) => ({ id: nid('e'), type, at: when, payload });
const V = (rows) => E.makeView(rows);
const onDays = (type, days, payload = {}) => days.map((d) => ev(type, payload, at(d)));

const STEPS = [
  { id: 'q1', title: 'Write it down', line: 'Make one log.', condition: { event: 'LogCreated', count: 1 }, reward: 'fxTool1', opened: 'A new tool is open.' },
  { id: 'q2', title: 'Try the drill', line: 'Run the SOS drill once.', condition: { event: 'TutorialCompleted', count: 1, where: { id: 'drill' } }, reward: 'fxTool2', opened: 'A new tool is open.' },
  { id: 'q3', title: 'One lesson', line: 'Finish a lesson.', condition: { event: 'LessonCompleted', count: 1 }, reward: 'fxTool3', opened: 'A new tool is open.' },
  { id: 'q4', title: 'Make a plan', line: 'Make one battle plan.', condition: { event: 'BattlePlanCreated', count: 1 }, reward: 'fxTool4', opened: 'A new tool is open.' },
  { id: 'q5', title: 'Reach out', line: 'Reach one person.', condition: { event: 'ContactReached', count: 1 }, reward: 'fxTool5', opened: 'A new tool is open.' },
  { id: 'q6', title: 'Three skills', line: 'Use a skill three times in one week.', condition: { event: 'SkillUsed', count: 3, within: 'week' }, reward: 'fxTool6', opened: 'A new tool is open.' },
  { id: 'q7', title: 'Look back', line: 'Do one weekly review.', condition: { event: 'WeeklyReviewCompleted', count: 1 }, reward: 'fxTool7', opened: 'A new tool is open.' },
  { id: 'q8', title: 'Two exercises', line: 'Do two exercises.', condition: { event: 'ExerciseDone', count: 2 }, reward: 'fxTool8', opened: 'A new tool is open.' },
  { id: 'q9', title: 'Keep one', line: 'Save one piece of work.', condition: { event: 'ArtifactSaved', count: 1 }, reward: 'fxTool9', opened: 'A new tool is open.' },
];
const OBJECTIVES = [
  { id: 'o1', title: 'Drink a glass of water', line: 'Tap when done.', doneBy: 'tap', grows: 'a leaf' },
  { id: 'o2', title: 'Step outside for five minutes', line: 'Tap when done.', doneBy: 'tap', grows: 'a leaf' },
  { id: 'o3', title: 'Text someone kind', line: 'Tap when done.', doneBy: 'tap', grows: 'a leaf' },
  { id: 'o4', title: 'Make a log', line: 'Done when you log.', doneBy: { event: 'LogCreated' }, grows: 'a leaf' },
  { id: 'o5', title: 'Use a skill', line: 'Done when you use a skill.', doneBy: { event: 'SkillUsed' }, grows: 'a leaf' },
  { id: 'o6', title: 'Read a lesson', line: 'Done when you finish one.', doneBy: { event: 'LessonCompleted' }, grows: 'a leaf' },
  { id: 'o7', title: 'A mindful minute', line: 'Done after one minute.', doneBy: { event: 'MindfulMinute' }, grows: 'a leaf' },
  { id: 'o8', title: 'Check in', line: 'Done when you check in.', doneBy: { event: 'CheckinCompleted' }, grows: 'a leaf' },
];

/* Set the fixture on the shared Content object for fn, and put everything back after. */
function withContent(fn, over = {}) {
  const had = { questLine: Object.prototype.hasOwnProperty.call(C, 'questLine'), objectives: Object.prototype.hasOwnProperty.call(C, 'objectives') };
  const keep = { questLine: C.questLine, objectives: C.objectives, xpO: C.xp.ObjectiveDone, xpQ: C.xp.QuestLineStepDone, hadO: 'ObjectiveDone' in C.xp, hadQ: 'QuestLineStepDone' in C.xp };
  const added = [];
  try {
    for (let i = 1; i <= 9; i++) if (!C.features[`fxTool${i}`]) { C.features[`fxTool${i}`] = { name: `Tool ${i}`, gist: 'A practice tool.', tab: 'actions' }; added.push(`fxTool${i}`); }
    C.questLine = over.questLine || STEPS.map((s) => Object.assign({}, s));
    C.objectives = over.objectives || OBJECTIVES.map((o) => Object.assign({}, o));
    C.xp.ObjectiveDone = 5;
    C.xp.QuestLineStepDone = 20;
    return fn();
  } finally {
    for (const f of added) delete C.features[f];
    if (had.questLine) C.questLine = keep.questLine; else delete C.questLine;
    if (had.objectives) C.objectives = keep.objectives; else delete C.objectives;
    if (keep.hadO) C.xp.ObjectiveDone = keep.xpO; else delete C.xp.ObjectiveDone;
    if (keep.hadQ) C.xp.QuestLineStepDone = keep.xpQ; else delete C.xp.QuestLineStepDone;
  }
}
/* Hide the real keys (once content V-42 merges) for fn, and put them back after. */
function withoutContent(fn) {
  const keep = {};
  for (const k of ['questLine', 'objectives']) if (Object.prototype.hasOwnProperty.call(C, k)) { keep[k] = C[k]; delete C[k]; }
  try { return fn(); } finally { Object.assign(C, keep); }
}
const shuffle = (a) => a.map((x, i) => [((i * 7919) % 13), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);

/* ── empty shapes ──────────────────────────────────────────────────────────────────────── */

test('absent Content.questLine and Content.objectives give the empty shapes and never throw', () => withoutContent(() => {
  const v = V({ events: [ev('LogCreated'), ev('QuestLineStepDone', { id: 'q1' })] });
  assert.deepEqual(E.questLine(v, NOW), { steps: [], current: null, done: 0, total: 0 });
  assert.deepEqual([...E.unlocked(v)].sort(), [...E.revealed(v)].sort());
  assert.deepEqual(E.dailyObjectives(v, NOW), { date: TODAY, items: [], growth: 0, swapped: false });
  assert.equal(E.growth(v), 0);
  assert.deepEqual(E.run(V({}), NOW), { current: 0, best: 0, total: 0, kept: [], cameBack: false, lastDay: null, holding: null });
  for (const bad of [null, undefined, {}, V({ events: [null, 7, { type: 'LogCreated', at: 'nope' }] })]) {
    assert.doesNotThrow(() => { E.questLine(bad, NOW); E.unlocked(bad); E.dailyObjectives(bad, NOW); E.growth(bad); E.run(bad, NOW); });
  }
}));

/* ── quest-line ────────────────────────────────────────────────────────────────────────── */

test('questLine: steps in order; done needs a claim; the first unclaimed is current; a met later step stays locked', () => withContent(() => {
  let q = E.questLine(V({}), NOW);
  assert.equal(q.total, 9);
  assert.equal(q.done, 0);
  assert.deepEqual(q.steps.map((s) => s.state), ['current', 'locked', 'locked', 'locked', 'locked', 'locked', 'locked', 'locked', 'locked']);
  assert.equal(q.current.id, 'q1');
  assert.equal(q.current.claimable, false);
  const log = ev('LogCreated', {}, at(day(-1)));
  const lesson = ev('LessonCompleted', { lessonId: 'm1-l1' }, at(day(-1)));
  q = E.questLine(V({ events: [log, lesson] }), NOW);
  assert.equal(q.current.id, 'q1');
  assert.equal(q.current.claimable, true);
  assert.deepEqual(q.current.progress, { have: 1, need: 1 });
  assert.equal(q.steps[2].met, true);
  assert.equal(q.steps[2].state, 'locked');
  assert.equal(q.steps[2].claimable, false);
  const claim = ev('QuestLineStepDone', { id: 'q1' }, at(day(-1), '11:00'));
  q = E.questLine(V({ events: [log, lesson, claim] }), NOW);
  assert.equal(q.steps[0].state, 'done');
  assert.equal(q.steps[0].doneAt, claim.at);
  assert.equal(q.done, 1);
  assert.equal(q.current.id, 'q2');
  assert.equal(q.current.claimable, false);
  assert.equal(q.steps[1].doneAt, undefined);
}));

test('questLine: where matches the payload (only the drill counts) and within week takes the best week', () => withContent(() => {
  const claims = ['q1', 'q2', 'q3', 'q4', 'q5'].map((id) => ev('QuestLineStepDone', { id }, at(day(-20))));
  let q = E.questLine(V({ events: [ev('TutorialCompleted', { id: 'tour' })] }), NOW);
  assert.equal(q.steps[1].met, false);
  q = E.questLine(V({ events: [ev('TutorialCompleted', { id: 'drill' })] }), NOW);
  assert.equal(q.steps[1].met, true);
  // 2 in one week, 1 in the next: not met; 3 in one week: met. Weeks start Monday (2026-11-02, 2026-11-09).
  const split = onDays('SkillUsed', ['2026-10-31', '2026-11-01', '2026-11-03']);
  q = E.questLine(V({ events: [...claims, ...split] }), NOW);
  assert.equal(q.current.id, 'q6');
  assert.equal(q.current.met, false);
  assert.deepEqual(q.current.progress, { have: 2, need: 3 });
  const one = onDays('SkillUsed', ['2026-11-02', '2026-11-04', '2026-11-08']);
  q = E.questLine(V({ events: [...claims, ...one] }), NOW);
  assert.equal(q.current.claimable, true);
}));

test('questLine: a sample claim or event counts for nothing; shuffled input gives the same result', () => withContent(() => {
  const s = Object.assign(ev('QuestLineStepDone', { id: 'q1' }), { sample: true });
  const l = Object.assign(ev('LogCreated'), { sample: true });
  const q = E.questLine(V({ events: [s, l] }), NOW);
  assert.equal(q.done, 0);
  assert.equal(q.current.claimable, false);
  const events = [ev('LogCreated', {}, at(day(-3))), ev('QuestLineStepDone', { id: 'q1' }, at(day(-3), '11:00')),
    ev('TutorialCompleted', { id: 'drill' }, at(day(-2))), ev('QuestLineStepDone', { id: 'q2' }, at(day(-2), '11:00'))];
  assert.deepEqual(E.questLine(V({ events: shuffle(events) }), NOW), E.questLine(V({ events }), NOW));
}));

/* ── unlocked and protected features ───────────────────────────────────────────────────── */

test('unlocked is a superset of revealed; a claimed reward is in, an unclaimed met reward is not', () => withContent(() => {
  const log = ev('LogCreated', {}, at(day(-1)));
  let v = V({ events: [log] });
  let u = E.unlocked(v);
  for (const f of E.revealed(v)) assert.ok(u.has(f), f);
  assert.equal(u.has('fxTool1'), false);
  v = V({ events: [log, ev('QuestLineStepDone', { id: 'q1' })] });
  u = E.unlocked(v);
  for (const f of E.revealed(v)) assert.ok(u.has(f), f);
  assert.equal(u.has('fxTool1'), true);
  v = V({ events: [ev('FeatureUnlocked', { feature: 'fxTool5', by: 'questline' })] });
  assert.equal(E.unlocked(v).has('fxTool5'), true);
  v = V({ events: [Object.assign(ev('QuestLineStepDone', { id: 'q2' }), { sample: true })] });
  assert.equal(E.unlocked(v).has('fxTool2'), false);
}));

test('a protected reward is never added and validateContent names it', () => {
  for (const id of ['sos', 'urgent', 'help', 'lessons', 'learn', 'settings', 'export', 'data', 'backup', 'today', 'talkBack', 'training', 'glossary']) assert.equal(E.isProtectedFeature(id), true, id);
  for (const id of ['planner', 'insights', 'workbook', 'fxTool1', '', null, 3]) assert.equal(E.isProtectedFeature(id), false, String(id));
  const bad = STEPS.map((s) => Object.assign({}, s));
  bad[0] = Object.assign({}, bad[0], { reward: 'talkBack' });
  bad[1] = Object.assign({}, bad[1], { reward: 'sos' });
  withContent(() => {
    const v = V({ events: [ev('QuestLineStepDone', { id: 'q1' }), ev('FeatureUnlocked', { feature: 'training' }), ev('FeatureUnlocked', { feature: 'settings' })] });
    const u = E.unlocked(v);
    assert.equal(u.has('talkBack'), false);
    assert.equal(u.has('training'), false);
    assert.equal(u.has('settings'), false);
    const errs = E.validateContent();
    assert.ok(errs.includes('questLine step q1: reward talkBack is a protected feature'), errs.join('\n'));
    assert.ok(errs.includes('questLine step q2: reward sos is a protected feature'), errs.join('\n'));
  }, { questLine: bad });
});

test('validateContent: the fixture is clean; bad steps and objectives are named; absent keys are skipped', () => {
  assert.deepEqual(E.validateContent().filter((e) => /^(questLine|objective)/.test(e)), []);
  withContent(() => assert.deepEqual(E.validateContent(), []));
  const steps = STEPS.slice(0, 8).map((s) => Object.assign({}, s));
  steps[2] = Object.assign({}, steps[2], { id: 'q2' });
  steps[3] = Object.assign({}, steps[3], { condition: { event: 'Nope', count: 0, within: 'month' } });
  steps[4] = Object.assign({}, steps[4], { reward: 'noSuchTool', title: '' });
  const objectives = OBJECTIVES.slice(0, 5).concat([{ id: 'o1', title: 'x', doneBy: { event: 'ObjectiveDone' }, grows: '' }]);
  withContent(() => {
    const errs = E.validateContent();
    for (const want of ['questLine step q2: id is used twice', 'questLine step q4: condition.event Nope is not a known event',
      'questLine step q4: condition.count is not a whole number of 1 or more', 'questLine step q4: condition.within is not day or week',
      'questLine step q5: reward noSuchTool is not in Content.features', 'questLine step q5: title is empty',
      'objective o1: id is used twice', "objective o1: doneBy is not 'tap' or a known event", 'objective o1: grows is empty']) {
      assert.ok(errs.includes(want), `${want}\n--\n${errs.join('\n')}`);
    }
    assert.equal(errs.some((e) => e.startsWith('objectives: has')), false);
  }, { questLine: steps, objectives });
  withContent(() => assert.ok(E.validateContent().includes('questLine: has 7 steps (8 to 12)')), { questLine: STEPS.slice(0, 7) });
});

/* ── run ───────────────────────────────────────────────────────────────────────────────── */

test('run: days in a row, one grace day per Monday-week kept, a second miss in that week starts a new run', () => {
  // Mon 2 Nov .. Sun 8 Nov. Shown up 2, 3, (4 missed), 5, (6 missed), 7, 8.
  const days = ['2026-11-02', '2026-11-03', '2026-11-05', '2026-11-07', '2026-11-08'];
  const r = E.run(V({ events: onDays('LogCreated', days) }), NOW);
  assert.deepEqual(r.kept, ['2026-11-04']);
  assert.equal(r.current, 2);
  assert.equal(r.best, 3);
  assert.equal(r.total, 5);
  assert.equal(r.lastDay, TODAY);
  assert.equal(r.holding, null);
  // the next week gets its own grace day: Tue 10 missed, Wed 11 shown up
  const r2 = E.run(V({ events: onDays('LogCreated', [...days, '2026-11-09', '2026-11-11']) }), at('2026-11-11'));
  assert.deepEqual(r2.kept, ['2026-11-04', '2026-11-10']);
  assert.equal(r2.current, 4);
});

test('run: yesterday missed with grace left holds the run open; two missed days restart it quietly', () => {
  const ev3 = onDays('CheckinCompleted', [day(-4), day(-3), day(-2)]);
  // Today is Sunday 8 Nov; yesterday Sat 7 is in the week of Mon 2 Nov, which has no kept day yet.
  let r = E.run(V({ events: ev3 }), NOW);
  assert.equal(r.current, 3);
  assert.equal(r.holding, day(-1));
  assert.deepEqual(r.kept, []);
  r = E.run(V({ events: ev3 }), at(day(1)));
  assert.equal(r.current, 0);
  assert.equal(r.best, 3);
  assert.equal(r.total, 3);
  assert.equal(r.holding, null);
  // the person shows up today: the held day joins kept
  r = E.run(V({ events: [...ev3, ev('LogCreated')] }), NOW);
  assert.equal(r.current, 4);
  assert.deepEqual(r.kept, [day(-1)]);
});

test('run: a break never lowers best or total, kept never shrinks, cameBack on the first day back only', () => {
  const shown = ['2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-27', '2026-10-28', '2026-11-03', '2026-11-06', '2026-11-07'];
  let prev = { best: 0, total: 0, kept: [] };
  const events = [];
  for (let d = '2026-10-19'; d <= '2026-11-12'; d = E.addDays(d, 1)) {
    if (shown.includes(d)) events.push(ev('SkillUsed', { skillId: 's1' }, at(d)));
    const r = E.run(V({ events: events.slice() }), at(d, '22:00'));
    assert.ok(r.best >= prev.best, `best fell on ${d}`);
    assert.ok(r.total >= prev.total, `total fell on ${d}`);
    assert.ok(prev.kept.every((k) => r.kept.includes(k)), `kept shrank on ${d}`);
    assert.ok(r.best >= r.current);
    if (d === '2026-10-27') assert.equal(r.cameBack, true);
    if (d === '2026-10-28') assert.equal(r.cameBack, false);
    prev = r;
  }
  assert.equal(prev.best, 4);
  assert.equal(prev.total, shown.length);
  const first = E.run(V({ events: [ev('LogCreated')] }), NOW);
  assert.equal(first.cameBack, false);
  assert.equal(first.current, 1);
});

test('run: a slip, a milestone, a counter, a sample row or a drill log is not a day shown up; the SOS drill and ObjectiveDone are', () => {
  const v = V({
    events: [ev('SlipLogged', {}, at(day(-3))), ev('MilestoneSeen', { milestone: 7 }, at(day(-2))), Object.assign(ev('LogCreated', {}, at(day(-1))), { sample: true }),
      ev('TutorialCompleted', { id: 'tour' }, at(day(-4)))],
    logs: [{ id: 'l1', type: 'urge', at: at(day(-5)), drill: true }, { id: 'l2', type: 'urge', at: at(day(-6)), sample: true }],
    profile: [{ key: 'me', startDate: day(-30), soberSince: day(-30) }],
    meta: [{ key: 'counters', days: 30 }],
  });
  assert.deepEqual(E.run(v, NOW), { current: 0, best: 0, total: 0, kept: [], cameBack: false, lastDay: null, holding: null });
  const w = V({ events: [ev('TutorialCompleted', { id: 'drill' }, at(day(-1))), ev('ObjectiveDone', { id: 'o1', date: TODAY }, at(day(1), '00:10'))], logs: [{ id: 'l3', type: 'urge', at: at(day(-2)) }] });
  assert.deepEqual(E.shownUpDays(w, NOW), [day(-2), day(-1), TODAY]);
  assert.equal(E.run(w, NOW).current, 3);
});

/* ── daily objectives and growth ───────────────────────────────────────────────────────── */

test('dailyObjectives: three items; the same date and state give the same draw; the draw is fixed inside the day', () => withContent(() => {
  const base = [ev('LogCreated', {}, at(day(-2))), ev('QuestLineStepDone', { id: 'q1' }, at(day(-2), '11:00'))];
  const a = E.dailyObjectives(V({ events: base }), NOW);
  assert.equal(a.date, TODAY);
  assert.equal(a.items.length, 3);
  assert.equal(new Set(a.items.map((i) => i.id)).size, 3);
  assert.deepEqual(E.dailyObjectives(V({ events: shuffle(base) }), NOW), a);
  assert.deepEqual(E.dailyObjectives(V({ events: base }), at(TODAY, '23:30')).items.map((i) => i.id), a.items.map((i) => i.id));
  // events on the day itself, or after it, never change that day's draw
  const later = [...base, ev('LessonCompleted', { lessonId: 'm1-l1' }), ev('QuestLineStepDone', { id: 'q2' }, at(TODAY, '13:00')), ev('LogCreated', {}, at(day(2)))];
  assert.deepEqual(E.dailyObjectives(V({ events: later }), NOW).items.map((i) => i.id), a.items.map((i) => i.id));
  const ids = new Set();
  for (let k = 0; k < 10; k++) ids.add(E.dailyObjectives(V({ events: base }), at(day(k))).items.map((i) => i.id).join(','));
  assert.ok(ids.size > 1, 'the draw never changes from day to day');
  const states = new Set();
  for (let k = 0; k < 6; k++) states.add(E.dailyObjectives(V({ events: [...base, ...onDays('LogCreated', Array.from({ length: k }, (_, j) => day(-10 - j)))] }), NOW).items.map((i) => i.id).join(','));
  assert.ok(states.size > 1, 'the draw never changes with the state');
  const src = readFileSync(fileURLToPath(new URL('../src/engine.js', import.meta.url)), 'utf8');
  const block = src.slice(src.indexOf('quest-line, objectives, run (R-O-6'), src.indexOf('/* ── views'));
  assert.ok(block.length > 1000);
  assert.equal(/Math\.random/.test(block), false);
}));

test('dailyObjectives: done by tap or by the matching event on that day; a swap replaces once and is honoured', () => withContent(() => {
  // find a date whose draw holds a tap objective and an event objective
  let d = TODAY;
  let o;
  for (let k = 0; k < 60; k++) {
    o = E.dailyObjectives(V({}), at(d));
    if (o.items.some((i) => i.doneBy === 'tap') && o.items.some((i) => typeof i.doneBy === 'object')) break;
    d = E.addDays(d, 1);
  }
  const tap = o.items.find((i) => i.doneBy === 'tap');
  const evo = o.items.find((i) => typeof i.doneBy === 'object');
  assert.ok(o.items.every((i) => i.done === false && i.swappable === true && typeof i.swapTo === 'string'));
  assert.ok(!o.items.some((i) => i.id === o.items[0].swapTo));
  const doneEvents = [ev('ObjectiveDone', { id: tap.id, date: d }, at(d, '09:00')), ev(evo.doneBy.event, { lessonId: 'm1-l1', skillId: 's1' }, at(d, '09:30'))];
  let r = E.dailyObjectives(V({ events: doneEvents }), at(d, '20:00'));
  assert.equal(r.items.find((i) => i.id === tap.id).done, true);
  assert.equal(r.items.find((i) => i.id === evo.id).done, true);
  assert.equal(r.items.find((i) => i.id === tap.id).swappable, false);
  // the same event on the next day does not make it done on d (and leaves d's draw alone)
  r = E.dailyObjectives(V({ events: [ev(evo.doneBy.event, {}, at(E.addDays(d, 1)))] }), at(d, '20:00'));
  assert.deepEqual(r.items.map((i) => i.id), o.items.map((i) => i.id));
  assert.equal(r.items.find((i) => i.id === evo.id).done, false);
  // swap
  const from = o.items[1].id;
  const to = o.items[1].swapTo;
  const swap = ev('ObjectiveSwapped', { from, to, date: d }, at(d, '08:00'));
  r = E.dailyObjectives(V({ events: [swap] }), at(d, '20:00'));
  assert.equal(r.swapped, true);
  assert.deepEqual(r.items.map((i) => i.id), o.items.map((i) => (i.id === from ? to : i.id)));
  assert.ok(r.items.every((i) => i.swappable === false && i.swapTo === null));
  const second = ev('ObjectiveSwapped', { from: o.items[0].id, to: from, date: d }, at(d, '09:00'));
  assert.deepEqual(E.dailyObjectives(V({ events: [swap, second] }), at(d, '20:00')).items.map((i) => i.id), r.items.map((i) => i.id));
}));

test('growth: days with an objective done; never decreases after a missed day or later events; sample rows count nothing', () => withContent(() => {
  const events = [];
  let prev = 0;
  for (let k = -12; k <= 0; k++) {
    const d = day(k);
    if (k % 4 !== 0) {
      const o = E.dailyObjectives(V({ events: events.slice() }), at(d, '08:00'));
      const pick = o.items[0];
      if (pick.doneBy === 'tap') events.push(ev('ObjectiveDone', { id: pick.id, date: d }, at(d, '09:00')));
      else events.push(ev(pick.doneBy.event, { lessonId: `m1-l${k + 20}`, skillId: 's1' }, at(d, '09:00')));
    }
    const g = E.growth(V({ events: events.slice() }), at(d, '22:00'));
    assert.ok(g >= prev, `growth fell on ${d}`);
    assert.equal(E.dailyObjectives(V({ events: events.slice() }), at(d, '22:00')).growth, g);
    prev = g;
  }
  assert.equal(prev, 9);
  // a later event never lowers it
  assert.ok(E.growth(V({ events: [...events, ev('SlipLogged', {}, at(day(1))), ev('QuestLineStepDone', { id: 'q1' }, at(day(1)))] })) >= prev);
  assert.equal(E.growth(V({ events: [Object.assign(ev('ObjectiveDone', { id: 'o1', date: TODAY }), { sample: true })] })), 0);
}));

/* ── XP ────────────────────────────────────────────────────────────────────────────────── */

test('XP: ObjectiveDone once per id and day, QuestLineStepDone once per step; rows come from Content.xp only', () => {
  const events = [ev('ObjectiveDone', { id: 'o1', date: TODAY }), ev('ObjectiveDone', { id: 'o1', date: TODAY }), ev('ObjectiveDone', { id: 'o1', date: day(-1) }, at(day(-1))),
    ev('ObjectiveDone', { id: 'o2', date: TODAY }), ev('QuestLineStepDone', { id: 'q1' }), ev('QuestLineStepDone', { id: 'q1' }), ev('QuestLineStepDone', { id: 'q2' })];
  assert.equal(E.xpFromEvents(events, NOW).total, 0);
  withContent(() => {
    const x = E.xpFromEvents(events, NOW);
    assert.equal(x.byType.ObjectiveDone, 15);
    assert.equal(x.byType.QuestLineStepDone, 40);
    assert.equal(x.total, 55);
    assert.equal(E.xpFromEvents([ev('LessonCompleted', { lessonId: 'zz' }, at(day(-1)))], NOW).byType.ObjectiveDone, undefined);
  });
});
