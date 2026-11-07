process.env.TZ = 'Asia/Kolkata';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

/* U-07: insights, radar, planner, review, the SOS guide sequence and crisis keywords (BUILD-PLAN 3.9). */
const require = createRequire(import.meta.url);
const E = require('../src/engine.js');

const at = (d, t = '10:00') => `${d}T${t}:00+05:30`;
const TODAY = '2026-11-07'; // a Saturday; its week starts Monday 2026-11-02
const NOW = at(TODAY, '12:00');
const day = (k) => E.addDays(TODAY, k);
let n = 0;
const nid = (p) => `${p}${String(++n).padStart(5, '0')}`;
const ev = (type, payload = {}, when = NOW) => ({ id: nid('e'), type, at: when, payload });
const log = (type, extra = {}, when = NOW) => Object.assign({ id: nid('l'), type, at: when, triggerIds: [], feelings: [], skills: [], drill: false }, extra);
const craving = (d, t, intensity, triggerIds = []) => log('craving', { intensity, triggerIds }, at(d, t));
const feeling = (d, intensity) => log('feeling', { intensity, emotion: 'anxious' }, at(d, '15:00'));
const checkin = (d, c, t = '21:00') => log('checkin', { checkin: Object.assign({ kind: 'evening' }, c) }, at(d, t));
const resp = (exerciseId, payload) => ({ id: nid('r'), exerciseId, schemaVersion: 1, payload, at: NOW, mode: 'workbook', draft: false });
const plan = (date, start, end, extra = {}) => Object.assign({ id: nid('p'), date, start, end, title: 'Block', kind: 'should', risky: false, status: 'planned' }, extra);
const V = (rows) => E.makeView(rows);
const signs = (rows) => E.warningSigns(V(rows), NOW);
const has = (rows, id) => signs(rows).some((s) => s.signId === id);

/* ── insights ─────────────────────────────────────────────────────────────────────────── */

test('insights: ready at 7 logs of craving, feeling and check-in; activity, slip, drill and sample rows do not count', () => {
  const six = [craving(day(-1), '19:00', 5), craving(day(-2), '19:00', 6), feeling(day(-1), 4), feeling(day(-3), 5), checkin(day(-1), { mood: 6 }), checkin(day(-2), { mood: 5 })];
  const extra = [log('activity', { activity: { kind: 'pleasant', minutes: 30 } }), log('slip', { date: day(-1) }), Object.assign(craving(day(-1), '20:00', 7), { drill: true }), Object.assign(craving(day(-1), '21:00', 7), { sample: true })];
  const a = E.insights(V({ logs: six.concat(extra) }), NOW);
  assert.equal(a.count, 6);
  assert.equal(a.ready, false);
  const b = E.insights(V({ logs: six.concat(extra, [craving(day(-4), '18:00', 3)]) }), NOW);
  assert.equal(b.count, 7);
  assert.equal(b.ready, true);
});

test('insights: under 14 logs every card carries the small-sample caveat; at 14 it goes', () => {
  const logs = Array.from({ length: 13 }, (_, i) => craving(day(-i), '19:00', 5));
  assert.match(E.insights(V({ logs }), NOW).caveat, /13 logs.*small sample/);
  assert.equal(E.insights(V({ logs: logs.concat([craving(day(-20), '19:00', 5)]) }), NOW).caveat, null);
  assert.match(E.insights(V({}), NOW).caveat, /0 logs/);
});

test('insights: craving trend is the weekly mean for the last 8 weeks, oldest first', () => {
  const logs = [craving('2026-11-02', '19:00', 4), craving('2026-11-06', '19:00', 6), craving('2026-10-27', '19:00', 9), craving('2026-09-01', '19:00', 9)];
  const t = E.insights(V({ logs }), NOW).cravingTrend;
  assert.equal(t.length, 8);
  assert.equal(t[7].weekStart, '2026-11-02');
  assert.equal(t[0].weekStart, '2026-09-14');
  assert.deepEqual(t[7], { weekStart: '2026-11-02', count: 2, mean: 5 });
  assert.deepEqual(t[6], { weekStart: '2026-10-26', count: 1, mean: 9 });
  assert.deepEqual(t[0], { weekStart: '2026-09-14', count: 0, mean: null });
});

test('insights: top triggers are the 5 most counted trigger ids of craving logs, with labels', () => {
  const ids = ['people:a', 'places:b', 'people:c', 'feelings:d', 'times:e', 'things:f'];
  const logs = [];
  ids.forEach((tid, i) => { for (let k = 0; k <= 5 - i; k += 1) logs.push(craving(day(-k), '19:00', 5, [tid])); });
  logs.push(feeling(day(-1), 5));
  const top = E.insights(V({ logs }), NOW).topTriggers;
  assert.deepEqual(top.map((x) => x.id), ids.slice(0, 5));
  assert.deepEqual(top.map((x) => x.count), [6, 5, 4, 3, 2]);
  assert.equal(top[0].label, 'a');
});

test('insights: heatmap is 7 x 24 counts of craving logs with mean intensity (row 0 = Sunday)', () => {
  const logs = [craving(TODAY, '19:40', 6), craving('2026-10-31', '19:05', 8), craving('2026-11-01', '07:10', 3), feeling(TODAY, 9)];
  const h = E.insights(V({ logs }), NOW).heatmap;
  assert.equal(h.length, 7);
  assert.ok(h.every((row) => row.length === 24));
  assert.deepEqual(h[6][19], { count: 2, mean: 7 });
  assert.deepEqual(h[0][7], { count: 1, mean: 3 });
  assert.deepEqual(h[6][15], { count: 0, mean: null });
});

test('insights: mood vs activities compares evening check-ins with and without a pleasant activity, in plain sentences', () => {
  const logs = [
    checkin(day(-1), { mood: 7, peakCraving: 2, pleasantCount: 2 }), checkin(day(-2), { mood: 6, peakCraving: 3, pleasantCount: 1 }),
    checkin(day(-3), { mood: 3, peakCraving: 6, pleasantCount: 0 }), checkin(day(-4), { mood: 9, peakCraving: 0, pleasantCount: 3 }, '08:00'),
    log('checkin', { checkin: { kind: 'morning', mood: 1, pleasantCount: 0 } }, at(day(-5))),
  ];
  logs[3].checkin.kind = 'morning';
  const m = E.insights(V({ logs }), NOW).moodVsActivities;
  assert.deepEqual(m.withActivity, { days: 2, mood: 6.5, craving: 2.5 });
  assert.deepEqual(m.withoutActivity, { days: 1, mood: 3, craving: 6 });
  assert.equal(m.sentences[0], 'On 2 days with at least one pleasant activity, your mood averaged 6.5/10 and your peak craving 2.5/10.');
  assert.equal(m.sentences[1], 'On 1 day with none, your mood averaged 3/10 and your peak craving 6/10.');
  assert.match(m.sentences[2], /not what caused what/);
  assert.deepEqual(E.insights(V({}), NOW).moodVsActivities.sentences, []);
});

test('insights: skill ranking is mean helpful x ln(uses+1), top 8', () => {
  const skills = ['sober', 'ride-wave', 'call', 'distract', 'reasons', 'talk-back', 'delay', 'leave', 'trial'];
  const events = [];
  skills.forEach((sid, i) => { for (let k = 0; k <= i; k += 1) events.push(ev('SkillUsed', { skillId: sid, helpful: true }, at(day(-k)))); });
  events.push(ev('SkillUsed', { skillId: 'beat', helpful: false }));
  const r = E.insights(V({ events }), NOW).skillRanking;
  assert.equal(r.length, 8);
  assert.equal(r[0].skillId, 'trial');
  assert.equal(r[0].score, Math.round(Math.log(10) * 1000) / 1000);
  assert.ok(!r.some((s) => s.skillId === 'beat' || s.skillId === 'sober'));
});

test('insights: predictions give mean predicted vs actual; motivation history is the series in time order', () => {
  const predictions = [{ id: 'p1', activity: 'Cycling', predicted: 3, actual: 7, at: NOW }, { id: 'p2', activity: 'Reading', predicted: 5, actual: 4, at: NOW }, { id: 'p3', activity: 'Swim', predicted: 4, at: NOW }];
  const motivation = [{ id: 'm2', at: at(day(-1)), stage: 'action', score: 8, plusOne: 'My kids' }, { id: 'm1', at: at(day(-9)), stage: 'preparation', score: 6 }];
  const a = E.insights(V({ predictions, motivation }), NOW);
  assert.deepEqual(a.predictions, { count: 2, predicted: 4, actual: 5.5, better: 1 });
  assert.deepEqual(a.motivationHistory.map((m) => [m.id, m.score, m.plusOne]), [['m1', 6, null], ['m2', 8, 'My kids']]);
});

test('insights: shuffled rows give the same result', () => {
  const logs = [craving(day(-1), '19:00', 5, ['people:a']), craving(day(-2), '20:00', 6, ['people:b']), checkin(day(-1), { mood: 5, pleasantCount: 1 }), feeling(day(-3), 4)];
  assert.deepEqual(E.insights(V({ logs: logs.slice().reverse() }), NOW), E.insights(V({ logs }), NOW));
});

/* ── Warning Sign Radar ─────────────────────────────────────────────────────────────── */

test('radar noMeeting: none in 14 days after 2 or more in the 28 before; not with a recent one or only one before', () => {
  const prior = [checkin(day(-20), { meeting: true }), log('activity', { activity: { kind: 'meeting', minutes: 60 } }, at(day(-30)))];
  assert.equal(has({ logs: prior }, 'noMeeting'), true);
  assert.equal(has({ logs: prior.concat([checkin(day(-3), { meeting: true })]) }, 'noMeeting'), false);
  assert.equal(has({ logs: prior, events: [ev('SkillUsed', { skillId: 'meeting', helpful: true }, at(day(-2)))] }, 'noMeeting'), false);
  assert.equal(has({ logs: prior.slice(0, 1) }, 'noMeeting'), false);
});

test('radar fewPleasant: under 2 pleasant activities in the last 7 check-ins; needs 7', () => {
  const seven = (counts) => counts.map((c, i) => checkin(day(-i), { pleasantCount: c }));
  assert.equal(has({ logs: seven([1, 0, 0, 0, 0, 0, 0]) }, 'fewPleasant'), true);
  assert.equal(has({ logs: seven([1, 1, 0, 0, 0, 0, 0]) }, 'fewPleasant'), false);
  assert.equal(has({ logs: seven([0, 0, 0, 0, 0, 0]) }, 'fewPleasant'), false);
});

test('radar poorSleep: under 6 hours on 3 of the last 5 check-ins', () => {
  const five = (hours) => hours.map((h, i) => checkin(day(-i), { sleep: h }));
  assert.equal(has({ logs: five([5, 4, 8, 5.5, 7]) }, 'poorSleep'), true);
  assert.equal(has({ logs: five([5, 8, 8, 5, 7]) }, 'poorSleep'), false);
  assert.equal(has({ logs: five([4, 4, 4, 4]) }, 'poorSleep'), false);
});

test('radar noContact: a crew and no ContactReached in 14 days, only after 14 days of data', () => {
  const contacts = [{ id: 'c1', name: 'Asha', role: 'safetyNet', active: true }];
  const old = [craving(day(-20), '19:00', 4)];
  assert.equal(has({ contacts, logs: old }, 'noContact'), true);
  assert.equal(has({ contacts, logs: old, events: [ev('ContactReached', { contactId: 'c1', how: 'call' }, at(day(-2)))] }, 'noContact'), false);
  assert.equal(has({ contacts: [{ id: 'c2', name: 'X', role: 'risky', active: true }], logs: old }, 'noContact'), false);
  assert.equal(has({ contacts, logs: [craving(day(-2), '19:00', 4)] }, 'noContact'), false);
});

test('radar weekendUnplanned: open Fri/Sat/Sun evenings from today on, only in a week the planner is in use', () => {
  const wed = plan('2026-11-04', '10:00', '11:00');
  const s = signs({ plans: [wed] }).find((x) => x.signId === 'weekendUnplanned');
  assert.ok(s);
  assert.match(s.evidence, /Saturday evening, Sunday evening/);
  assert.doesNotMatch(s.evidence, /Friday/);
  assert.equal(has({ plans: [wed, plan(TODAY, '19:00', '21:00'), plan('2026-11-08', '17:00', '18:30')] }, 'weekendUnplanned'), false);
  assert.equal(has({ plans: [] }, 'weekendUnplanned'), false);
  assert.equal(has({ plans: [plan('2026-10-28', '10:00', '11:00')] }, 'weekendUnplanned'), false);
});

test('radar feelingsRising: the last 7 days average 2 or more above the 7 before', () => {
  const f = (a, b) => a.map((x, i) => feeling(day(-i), x)).concat(b.map((x, i) => feeling(day(-7 - i), x)));
  assert.equal(has({ logs: f([7, 8], [4, 5]) }, 'feelingsRising'), true);
  assert.equal(has({ logs: f([5, 6], [4, 5]) }, 'feelingsRising'), false);
  assert.equal(has({ logs: f([9], [2, 2]) }, 'feelingsRising'), false);
});

test('radar: the person\'s own top-3 plan wins; otherwise the general suggestion; wording stays gentle', () => {
  const logs = [5, 4, 8, 5, 3].map((h, i) => checkin(day(-i), { sleep: h, pleasantCount: 0 })).concat([0, 0].map((c, i) => checkin(day(-5 - i), { pleasantCount: c })));
  const responses = [resp('warning-signs', { top: [{ id: 'poor-sleep', plan: 'Tell my therapist or counsellor' }, { id: 'lying', plan: 'x' }] })];
  const out = signs({ logs, responses });
  const sleep = out.find((s) => s.signId === 'poorSleep');
  assert.equal(sleep.plan, 'Tell my therapist or counsellor');
  assert.equal(sleep.own, true);
  const few = out.find((s) => s.signId === 'fewPleasant');
  assert.equal(few.own, false);
  assert.match(few.plan, /want-to/);
  for (const s of out) for (const t of [s.label, s.evidence, s.plan]) assert.doesNotMatch(t, /\b(red|danger|fail|overdue|addicts?)\b/i);
  assert.deepEqual(E.warningSigns(V({}), NOW), []);
  assert.deepEqual(E.warningSigns(null, NOW), []);
});

/* ── planner ─────────────────────────────────────────────────────────────────────────── */

test('gaps: uncovered stretches of 2 h or more between 07:00 and 23:00', () => {
  assert.deepEqual(E.gaps([], TODAY), [{ start: '07:00', end: '23:00', hours: 16 }]);
  const items = [plan(TODAY, '06:00', '09:00'), plan(TODAY, '10:30', '12:00'), plan(TODAY, '11:00', '13:00'), plan(TODAY, '15:00', '20:30'),
    plan(TODAY, '21:00', '22:00', { status: 'skipped' }), plan(day(1), '13:00', '15:00')];
  assert.deepEqual(E.gaps(items, TODAY), [{ start: '13:00', end: '15:00', hours: 2 }, { start: '20:30', end: '23:00', hours: 2.5 }]);
  assert.deepEqual(E.gaps([plan(TODAY, '07:00', '22:59')], TODAY), []);
  assert.deepEqual(E.gaps(V({ plans: [plan(TODAY, '07:00', '21:00')] }), TODAY), [{ start: '21:00', end: '23:00', hours: 2 }]);
});

test('riskyHours: the hours with the most craving logs across the week', () => {
  const logs = [craving(TODAY, '19:10', 5), craving(day(-1), '19:20', 5), craving(day(-2), '21:00', 9), craving(day(-3), '08:00', 2), craving(day(-4), '21:30', 3), craving(day(-5), '14:00', 9)];
  const hm = E.insights(V({ logs }), NOW).heatmap;
  assert.deepEqual(E.riskyHours(hm), [21, 19, 14]);
  assert.deepEqual(E.riskyHours([]), []);
});

test('suggestions: want-tos at the top craving hours that fall inside an open gap, deterministic', () => {
  const logs = [craving(day(-1), '19:10', 5), craving(day(-2), '19:30', 6), craving(day(-3), '20:10', 5), craving(day(-4), '09:00', 4)];
  const responses = [resp('activity-menu', { wantTos: ['Cycling', 'Reading'] })];
  const plans = [plan(TODAY, '08:00', '10:30')];
  const s = E.suggestions(V({ logs, responses, plans }), TODAY);
  assert.deepEqual(s.map((x) => x.hour), [19, 20]);
  assert.ok(s.every((x) => ['Cycling', 'Reading'].includes(x.activity)));
  assert.notEqual(s[0].activity, s[1].activity);
  assert.deepEqual(E.suggestions(V({ logs, responses, plans }), TODAY), s);
  const fallback = E.suggestions(V({ logs, plans }), TODAY);
  assert.equal(fallback.length, 2);
  assert.ok(fallback.every((x) => typeof x.activity === 'string' && x.activity));
  assert.deepEqual(E.suggestions(V({ logs, responses, plans: plans.concat([plan(TODAY, '17:00', '23:00')]) }), TODAY), []);
  assert.deepEqual(E.suggestions(V({}), TODAY), []);
});

/* ── Weekly Review ──────────────────────────────────────────────────────────────────── */

test('forecastCheck: planned risky blocks and Battle Plans beside the logs of each day, as reflection', () => {
  const plans = [plan('2026-11-05', '19:00', '21:00', { risky: true, title: 'Office party', battlePlan: { situation: 'Office party', plan: 'Leave at 9' } }),
    plan('2026-11-06', '18:00', '19:00', { kind: 'risky', risky: true }), plan('2026-11-04', '10:00', '11:00')];
  const logs = [craving('2026-11-05', '19:40', 6), feeling('2026-11-05', 3), craving('2026-11-03', '10:00', 2)];
  const f = E.forecastCheck(V({ plans, logs }), '2026-11-02');
  assert.deepEqual(f.map((d) => d.date), ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08']);
  const thu = f[3];
  assert.equal(thu.planned.length, 1);
  assert.equal(thu.planned[0].battlePlan, true);
  assert.equal(thu.logged.length, 2);
  assert.equal(thu.line, 'You planned for rough weather on Thursday evening; the log shows a 6/10 at 7:40 pm, and your plan was there.');
  assert.equal(f[4].line, 'You planned for rough weather on Friday evening; no craving or feeling was logged that day.');
  assert.equal(f[2].planned.length, 0);
  assert.equal(f[1].line, null);
  assert.deepEqual(E.forecastCheck(V({}), 'nope'), []);
});

test('weekSummary: what happened in the week, with no score and no XP', () => {
  const ws = '2026-11-02';
  const logs = [craving('2026-11-03', '19:00', 4), craving('2026-11-04', '19:00', 6), checkin('2026-11-04', { pleasantCount: 2 }), log('activity', { activity: { kind: 'pleasant', minutes: 20 } }, at('2026-11-05')), craving('2026-10-30', '19:00', 9)];
  const events = [ev('SkillUsed', { skillId: 'call', helpful: true }, at('2026-11-03')), ev('SkillUsed', { skillId: 'call', helpful: true }, at('2026-11-04')),
    ev('SkillUsed', { skillId: 'sober', helpful: false }, at('2026-11-04')), ev('SosCompleted', { outcome: 'passed' }, at('2026-11-04')), ev('SosCompleted', { outcome: 'still' }, at('2026-11-05'))];
  const plans = [plan('2026-11-04', '18:00', '19:00', { status: 'done' }), plan('2026-11-06', '18:00', '19:00')];
  const s = E.weekSummary(V({ logs, events, plans }), ws);
  assert.equal(s.weekStart, ws);
  assert.equal(s.end, '2026-11-08');
  assert.deepEqual(s.logs, { craving: 2, feeling: 0, checkin: 1, activity: 1 });
  assert.equal(s.cravingMean, 5);
  assert.equal(s.skillsUsed, 3);
  assert.deepEqual(s.topSkills, ['Call or text a Safety Net']);
  assert.equal(s.pleasant, 3);
  assert.deepEqual(s.plans, { total: 2, done: 1, debriefed: 0 });
  assert.deepEqual(s.sos, { sessions: 2, passed: 1 });
  assert.ok(s.highlights.includes('You rode out 1 craving with SOS.'));
  assert.ok(s.highlights.includes('3 pleasant activities made it into your week.'));
  const keys = JSON.stringify(Object.keys(s));
  assert.doesNotMatch(keys, /score|xp|points/i);
  assert.equal(E.weekSummary(V({}), 'nope'), null);
});

/* ── SOS: guide sequence and crisis keywords ───────────────────────────────────────────── */

test('guideSequence: wave (with SOBER) first, never empty; the other places go to the most helpful tools', () => {
  assert.deepEqual(E.guideSequence(V({})), ['wave', 'why', 'distract']);
  assert.deepEqual(E.guideSequence(null), ['wave', 'why', 'distract']);
  const used = (sid, helpful, k = 3) => Array.from({ length: k }, (_, i) => ev('SkillUsed', { skillId: sid, helpful }, at(day(-i))));
  const g = E.guideSequence(V({ events: used('call', true).concat(used('reasons', false), used('talk-back', true, 1), used('distract', false)) }));
  assert.deepEqual(g, ['wave', 'call', 'talkback']);
  const g2 = E.guideSequence(V({ events: used('ride-wave', false) }));
  assert.equal(g2[0], 'wave');
  const sample = used('call', true).map((e) => Object.assign(e, { sample: true }));
  assert.deepEqual(E.guideSequence(V({ events: sample })), ['wave', 'why', 'distract']);
  const ids = E.SOS_TOOLS.map((t) => t.id);
  assert.deepEqual(ids, ['wave', 'why', 'distract', 'call', 'talkback']);
});

const CRISIS_YES = [
  'I want to kill myself', 'I keep thinking about killing myself', 'kms', 'I feel suicidal', 'suicide',
  'I want to die', 'he wants to die', 'I wanted to die last night', 'wanting to die again', 'I just wanna die',
  'I am hurting myself', 'I hurt myself', 'harming myself', 'I cut myself', 'cutting myself', 'I might hang myself', 'self-harm', 'self harm', 'selfharm', 'self-harming again',
  'I don’t want to live', 'i dont want to be here anymore', "I don't want to be alive", 'I do not want to wake up',
  "I can't go on", 'i cant go on', 'I cannot go on', 'I want to end it all', 'maybe I should end it', 'ending my life', 'I will take my own life',
  'nothing to live for', 'there is no reason to live', 'no point in living', 'life is not worth living', "it isn't worth living", 'I hope I never wake up',
  'thinking about death', 'thoughts of dying', 'I keep thinking about suicide', 'better off dead', 'they would be better off without me',
  'I wish I was dead', 'an overdose on purpose', 'I WANT TO DIE',
];
const CRISIS_NO = ['I killed that workout', 'This traffic is killing the mood', 'I want to live well', 'I am dying to see that film', 'the weekend is coming', 'we spent it all', 'I cut the onions', 'thinking about dinner', 'I feel better today', ''];

test('crisisKeywords: every crisis phrase routes to urgent help, with curly, straight and missing apostrophes', () => {
  for (const text of CRISIS_YES) {
    const got = E.crisisKeywords(text);
    assert.ok(Array.isArray(got) && got.length > 0, `missed: ${text}`);
    assert.ok(got.every((w) => typeof w === 'string' && text.toLowerCase().replace(/’/g, "'").includes(w)), `matched words come from the text: ${text}`);
  }
  assert.deepEqual(E.crisisKeywords('I don’t want to live. I want to die. I want to die.'), ["don't want to live", 'want to die']);
});

test('crisisKeywords: ordinary sentences do not trigger; non-strings give an empty list; the list is marked for clinical review', () => {
  for (const text of CRISIS_NO) assert.deepEqual(E.crisisKeywords(text), [], `false alarm: ${text}`);
  for (const x of [null, undefined, 42, {}, ['kill myself'], true]) assert.deepEqual(E.crisisKeywords(x), []);
  assert.equal(E.CRISIS.clinicalReview, true);
  assert.ok(E.CRISIS.patterns.length >= 15);
});
