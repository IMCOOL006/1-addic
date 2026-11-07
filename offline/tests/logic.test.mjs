process.env.TZ = 'Asia/Kolkata';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const E = require('../src/engine.js');
const C = require('../src/content-core.js');
const SRC = readFileSync(new URL('../src/engine.js', import.meta.url), 'utf8');

/* Local (IST) timestamps: at('2026-11-07', '19:40') */
const at = (d, t = '10:00') => `${d}T${t}:00+05:30`;
const NOW = at('2026-11-07', '12:00');
const TODAY = '2026-11-07';
let n = 0;
const ev = (type, payload = {}, when = NOW) => ({ id: `e${String(++n).padStart(5, '0')}`, type, at: when, payload });
const day = (k) => E.addDays(TODAY, k);
const xpTotal = (events) => E.xpFromEvents(events, NOW).total;
const XP_SETTINGS = ['mindfulDailyCap', 'repeatFull', 'repeatHalf', 'onceOnly'];
const ZERO_XP = ['SlipLogged', 'ContactReached', 'ScriptUsed', 'FeatureRevealed', 'MilestoneSeen', 'ModuleCompleted', 'RecoveryPlanConfirmed', 'OnboardingCompleted'];

function shuffle(list, seed) {
  const a = list.slice();
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── shape and loading ─────────────────────────────────────────────────────────────────── */

test('engine loads the content under Node and exports the U-05 names', () => {
  for (const name of ['id', 'todayStr', 'dateStr', 'addDays', 'daysBetween', 'weekStart', 'fmtDate', 'fmtTime', 'fmtDateTime', 'hourOf', 'isNight',
    'term', 'greeting', 'companionName', 'xpFromEvents', 'mastery', 'regionLevels', 'momentum', 'rank', 'badges', 'modulesDone', 'lessonsDone',
    'counters', 'gameState', 'makeView']) {
    assert.equal(typeof E[name], 'function', name);
  }
  assert.ok(Array.isArray(C.modules) && C.modules.length >= 1, 'lesson files merged into Content');
});

test('no random rewards and no network: Math.random only inside id(), no fetch or XHR', () => {
  const hits = SRC.match(/Math\.random/g) || [];
  assert.ok(hits.length <= 1);
  const idFn = SRC.slice(SRC.indexOf('function randomPart'), SRC.indexOf('function toDate'));
  if (hits.length) assert.ok(idFn.includes('Math.random'));
  assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/.test(SRC));
  assert.ok(!/localStorage|indexedDB|document\./.test(SRC));
});

/* ── ids and dates ─────────────────────────────────────────────────────────────────────── */

test('id() is unique and time-sortable', () => {
  const ids = Array.from({ length: 2000 }, () => E.id());
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(ids.slice().sort(), ids);
  assert.match(ids[0], /^[0-9a-z]{18}$/);
});

test('todayStr and dateStr use the local calendar date', () => {
  assert.equal(E.todayStr('2026-11-07T20:00:00Z'), '2026-11-08');
  assert.equal(E.todayStr(new Date('2026-11-07T18:00:00Z')), '2026-11-07');
  assert.equal(E.todayStr(Date.parse('2026-11-07T18:29:59Z')), '2026-11-07');
  assert.equal(E.dateStr('2026-02-03'), '2026-02-03');
  assert.equal(E.dateStr('not a date'), '');
  assert.equal(E.dateStr(undefined), '');
});

test('addDays and daysBetween across month and year ends', () => {
  assert.equal(E.addDays('2026-01-31', 1), '2026-02-01');
  assert.equal(E.addDays('2026-03-01', -1), '2026-02-28');
  assert.equal(E.addDays('2028-03-01', -1), '2028-02-29');
  assert.equal(E.addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(E.daysBetween('2026-01-31', '2026-03-01'), 29);
  assert.equal(E.daysBetween('2026-11-07', '2026-11-01'), -6);
  assert.equal(E.daysBetween('2026-12-25', '2027-01-05'), 11);
  assert.equal(E.daysBetween('x', '2026-01-01'), 0);
});

test('daysBetween and addDays are DST-safe', () => {
  const was = process.env.TZ;
  try {
    for (const tz of ['America/New_York', 'Europe/London']) {
      process.env.TZ = tz;
      assert.equal(E.daysBetween('2026-03-07', '2026-03-09'), 2, tz);
      assert.equal(E.daysBetween('2026-10-24', '2026-11-02'), 9, tz);
      assert.equal(E.addDays('2026-03-08', 1), '2026-03-09', tz);
      assert.equal(E.addDays('2026-11-01', 1), '2026-11-02', tz);
      assert.equal(E.daysBetween(E.dateStr('2026-03-08T12:00:00'), E.dateStr('2026-03-09T00:30:00')), 1, tz);
    }
  } finally {
    process.env.TZ = was;
  }
  assert.equal(E.todayStr('2026-11-07T20:00:00Z'), '2026-11-08');
});

test('weekStart for Monday and Sunday weeks', () => {
  assert.equal(E.weekStart('2026-11-07'), '2026-11-02');
  assert.equal(E.weekStart('2026-11-02'), '2026-11-02');
  assert.equal(E.weekStart('2026-11-08'), '2026-11-02');
  assert.equal(E.weekStart('2026-11-07', 0), '2026-11-01');
  assert.equal(E.weekStart('2026-11-08', 0), '2026-11-08');
  assert.equal(E.weekStart('2026-03-01'), '2026-02-23');
});

test('fmtDate, fmtTime, fmtDateTime and hourOf', () => {
  assert.equal(E.fmtTime(at(TODAY, '19:40')), '7:40 pm');
  assert.equal(E.fmtTime(at(TODAY, '00:05')), '12:05 am');
  assert.equal(E.fmtTime(at(TODAY, '12:00')), '12:00 pm');
  assert.equal(E.fmtDate('2026-11-07'), '7 Nov 2026');
  assert.equal(E.fmtDateTime(at(TODAY, '19:40')), '7 Nov 2026, 7:40 pm');
  assert.equal(E.fmtDate('nope'), '');
  assert.equal(E.hourOf(at(TODAY, '19:40')), 19);
  assert.equal(E.hourOf('2026-11-07T20:00:00Z'), 1);
});

test('isNight is 20:00 to 05:59', () => {
  assert.equal(E.isNight(at(TODAY, '19:59')), false);
  assert.equal(E.isNight(at(TODAY, '20:00')), true);
  assert.equal(E.isNight(at(TODAY, '05:59')), true);
  assert.equal(E.isNight(at(TODAY, '06:00')), false);
  assert.equal(E.isNight('garbage'), false);
});

/* ── profile ───────────────────────────────────────────────────────────────────────────── */

test('term, greeting and companionName', () => {
  assert.deepEqual(E.term({ term: 'clean' }), { word: 'clean', days: 'clean days', adjective: 'clean' });
  assert.deepEqual(E.term({ term: 'recovery' }).days, 'days in recovery');
  assert.deepEqual(E.term({ term: 'unknown' }), E.term({ term: 'sober' }));
  assert.deepEqual(E.term(null), { word: 'sober', days: 'sober days', adjective: 'sober' });
  assert.equal(E.greeting(at(TODAY, '08:00'), 'Asha'), 'Good morning, Asha.');
  assert.equal(E.greeting(at(TODAY, '14:00'), ' '), 'Good afternoon.');
  assert.equal(E.greeting(at(TODAY, '19:00')), 'Good evening.');
  assert.equal(E.greeting(at(TODAY, '02:00'), 'Asha'), 'Hello, Asha.');
  assert.equal(E.companionName({ companion: ' Saathi ' }), 'Saathi');
  assert.equal(E.companionName({}), 'Companion');
  assert.equal(E.companionName(null), 'Companion');
});

/* ── XP ────────────────────────────────────────────────────────────────────────────────── */

test('xp: every event type earns exactly its Content.xp number once', () => {
  const types = Object.keys(C.xp).filter((k) => !XP_SETTINGS.includes(k));
  assert.ok(types.length >= 16);
  for (const t of types) {
    const payload = t === 'ArtifactSaved' ? { exerciseId: 'x', kind: 'build' } : {};
    const r = E.xpFromEvents([ev(t, payload)], NOW);
    assert.equal(r.total, C.xp[t], t);
    assert.equal(r.byType[t], C.xp[t], t);
  }
});

test('xp: zero-XP, unknown and settings-named types earn nothing; no points for claimed sober days', () => {
  for (const t of ZERO_XP.concat(['SoberDayClaimed', 'DayCompleted', 'constructor', 'toString'], XP_SETTINGS)) {
    assert.equal(xpTotal([ev(t)]), 0, t);
  }
  assert.ok(!Object.keys(C.xp).some((k) => /sober|clean|streak|day/i.test(k) && !XP_SETTINGS.includes(k)));
  const view = E.makeView({ profile: [{ key: 'me', startDate: day(-400) }], events: [] });
  assert.equal(E.gameState(view, NOW).xp.total, 0);
});

test('xp: diminishing returns per type per local day (3 full, 3 half, then none)', () => {
  for (const t of ['LogCreated', 'CheckinCompleted', 'SkillUsed', 'ActivityDone']) {
    const base = C.xp[t];
    const same = Array.from({ length: 8 }, (_, i) => ev(t, { skillId: 'trial' }, at(TODAY, `0${i + 1}:00`)));
    assert.equal(xpTotal(same), base * 3 + Math.floor(base / 2) * 3, t);
    const next = same.concat([ev(t, { skillId: 'trial' }, at(day(1), '09:00'))]);
    assert.equal(xpTotal(next), base * 4 + Math.floor(base / 2) * 3, `${t} resets the next day`);
  }
  const mixed = [ev('LogCreated'), ev('LogCreated'), ev('LogCreated'), ev('CheckinCompleted'), ev('LogCreated')];
  assert.equal(xpTotal(mixed), 5 * 3 + 5 + 2);
});

test('xp: once-only by payload id', () => {
  assert.equal(xpTotal([ev('LessonCompleted', { lessonId: 'm0-l1' }), ev('LessonCompleted', { lessonId: 'm0-l1' })]), 10);
  assert.equal(xpTotal([ev('LessonCompleted', { lessonId: 'm0-l1' }), ev('LessonCompleted', { lessonId: 'm0-l2' })]), 20);
  assert.equal(xpTotal([ev('TutorialCompleted', { id: 'tour' }), ev('TutorialCompleted', { id: 'tour' }, at(day(1)))]), 5);
  assert.equal(xpTotal([ev('TutorialCompleted', { id: 'tour' }), ev('TutorialCompleted', { id: 'drill' })]), 10);
  assert.equal(xpTotal([ev('CheckpointCompleted', { moduleId: 'm1' }), ev('CheckpointCompleted', { moduleId: 'm1' })]), 10);
  assert.equal(xpTotal([ev('ExplorerCompleted'), ev('ExplorerCompleted', {}, at(day(2)))]), 25);
});

test('xp: a duplicate event id never counts twice', () => {
  const a = ev('SosCompleted', { outcome: 'passed' });
  assert.equal(xpTotal([a, { ...a }, { ...a }]), 15);
});

test('xp: MindfulMinute is capped per local day', () => {
  const cap = C.xp.mindfulDailyCap;
  const many = Array.from({ length: cap + 7 }, (_, i) => ev('MindfulMinute', {}, at(TODAY, `10:${String(i).padStart(2, '0')}`)));
  assert.equal(xpTotal(many), cap);
  assert.equal(xpTotal(many.concat([ev('MindfulMinute', {}, at(day(1)))])), cap + 1);
});

test('xp: ArtifactSaved once per exercise per day, only for build, assess and plan', () => {
  const s = (exerciseId, kind, d = TODAY) => ev('ArtifactSaved', { exerciseId, kind }, at(d));
  assert.equal(xpTotal([s('reasons', 'build'), s('reasons', 'build')]), 20);
  assert.equal(xpTotal([s('reasons', 'build'), s('reasons', 'build', day(1))]), 40);
  assert.equal(xpTotal([s('reasons', 'build'), s('triggers', 'assess'), s('weekly', 'plan')]), 60);
  assert.equal(xpTotal([s('body-scan', 'practice'), s('journal', 'reflect'), s('breath', 'tool')]), 0);
  assert.equal(xpTotal([s('mystery', undefined)]), 20, 'unknown kind counts as build');
});

test('xp: today counts only the local day of now', () => {
  const r = E.xpFromEvents([ev('SosCompleted', {}, at(day(-1), '23:50')), ev('SosCompleted', {}, at(TODAY, '00:10'))], NOW);
  assert.equal(r.total, 30);
  assert.equal(r.today, 15);
  assert.deepEqual(E.xpFromEvents([], NOW), { total: 0, today: 0, byType: {} });
  assert.deepEqual(E.xpFromEvents(undefined, NOW), { total: 0, today: 0, byType: {} });
});

/* ── mastery, regions, momentum ────────────────────────────────────────────────────────── */

test('mastery: levels at 1/3/7/15/30 uses, helpfulAvg and lastAt', () => {
  const uses = (k, skillId = 'trial', helpful = true) => Array.from({ length: k }, (_, i) => ev('SkillUsed', { skillId, helpful }, at(day(-i))));
  const expect = { 0: 0, 1: 1, 2: 1, 3: 2, 6: 2, 7: 3, 15: 4, 29: 4, 30: 5, 40: 5 };
  for (const [k, lvl] of Object.entries(expect)) {
    const m = E.mastery(uses(Number(k)));
    assert.equal(k === '0' ? 0 : m.trial.level, lvl, `${k} uses`);
  }
  const m = E.mastery([ev('SkillUsed', { skillId: 'sober', helpful: true }, at(day(-2))), ev('SkillUsed', { skillId: 'sober', helpful: false }, at(day(-1))), ev('SkillUsed', { skillId: 'sober' })]);
  assert.deepEqual(m.sober, { uses: 3, level: 2, helpfulAvg: 0.5, lastAt: NOW });
  assert.equal(E.mastery([ev('SkillUsed', { skillId: 'x', helpful: 5 }), ev('SkillUsed', { skillId: 'x', helpful: 0 })]).x.helpfulAvg, 0.5);
  assert.equal(E.mastery([ev('SkillUsed', { skillId: 'y' })]).y.helpfulAvg, null);
  assert.deepEqual(E.mastery([ev('SkillUsed', {})]), {});
});

test('regionLevels: all six regions, total uses over the region skills', () => {
  const r0 = E.regionLevels({});
  assert.deepEqual(Object.keys(r0).sort(), ['compass', 'cove', 'garden', 'lighthouse', 'pier', 'weather']);
  assert.ok(Object.values(r0).every((v) => v === 0));
  const light = C.skills.filter((s) => s.region === 'lighthouse').map((s) => s.id);
  assert.ok(light.length >= 2);
  const m = { [light[0]]: { uses: 4 }, [light[1]]: { uses: 3 }, notASkill: { uses: 99 } };
  const r = E.regionLevels(m);
  assert.equal(r.lighthouse, 3);
  assert.equal(r.cove, 0);
  assert.equal(E.regionLevels(undefined).weather, 0);
});

test('momentum: distinct local dates with an XP-bearing event in the last 14 days', () => {
  const events = [ev('LogCreated', {}, at(TODAY)), ev('LogCreated', {}, at(TODAY, '18:00')), ev('SosCompleted', {}, at(day(-13))),
    ev('SosCompleted', {}, at(day(-14))), ev('SlipLogged', { date: day(-3) }, at(day(-3))), ev('MilestoneSeen', { milestone: 1 }, at(day(-5)))];
  const m = E.momentum(events, NOW);
  assert.deepEqual(m, { days: 2, of: 14, dates: [day(-13), TODAY] });
  assert.deepEqual(E.momentum([], NOW), { days: 0, of: 14, dates: [] });
});

/* ── lessons, modules, rank ────────────────────────────────────────────────────────────── */

test('lessonsDone and modulesDone (all lessons, or ModuleCompleted)', () => {
  const m0 = C.modules.find((m) => m.id === 'm0');
  const all = m0.lessons.map((l) => ev('LessonCompleted', { lessonId: l.id }));
  assert.deepEqual(E.lessonsDone(all), new Set(m0.lessons.map((l) => l.id)));
  assert.ok(E.modulesDone(all).has('m0'));
  assert.ok(!E.modulesDone(all.slice(1)).has('m0'));
  assert.ok(E.modulesDone([ev('ModuleCompleted', { moduleId: 'm5' })]).has('m5'));
  assert.equal(E.modulesDone([]).size, 0);
});

test('rank: the highest Content.ranks row whose condition holds', () => {
  assert.equal(E.rank([], null), null);
  assert.equal(E.rank([ev('ExplorerCompleted')], null).id, 'explorer');
  const pairs = { m5: 'self-expert', m6: 'strategist', m7: 'navigator', m9: 'builder', m10: 'guide' };
  for (const [mod, id] of Object.entries(pairs)) {
    assert.equal(E.rank([ev('ExplorerCompleted'), ev('ModuleCompleted', { moduleId: mod })], null).id, id, mod);
  }
  assert.equal(E.rank([ev('ModuleCompleted', { moduleId: 'm5' }), ev('ModuleCompleted', { moduleId: 'm9' })], null).id, 'builder');
  assert.equal(E.rank([ev('ModuleCompleted', { moduleId: 'm8' })], null), null);
});

/* ── badges ────────────────────────────────────────────────────────────────────────────── */

function badgeIds(rows) {
  return E.badges(E.makeView(rows), NOW).map((b) => b.id);
}
test('badges: each of the 13 by its predicate, each once, with earnedAt', () => {
  assert.equal(C.badges.length, 13);
  assert.deepEqual(E.badges(E.makeView({}), NOW), []);
  const passed = (k) => Array.from({ length: k }, (_, i) => ev('SosCompleted', { outcome: 'passed' }, at(day(-60 + i))));
  const steps = (qid) => Object.fromEntries(C.quests.find((q) => q.id === qid).steps.map((s, i) => [s.id, at(day(-10 + i))]));
  const resp = (exerciseId, k, draft = false) => Array.from({ length: k }, (_, i) => ({ id: `r${exerciseId}${i}`, exerciseId, at: at(day(-20 + i)), draft, payload: {} }));
  const cases = {
    'smart-not-strong': [{ quests: [{ id: 'clear-space', ticks: steps('clear-space') }] }, { quests: [{ id: 'clear-space', ticks: { list: NOW } }] }],
    'first-wave': [{ events: passed(1) }, { events: [ev('SosCompleted', { outcome: 'used' })] }],
    'wave-rider-10': [{ events: passed(10) }, { events: passed(9) }],
    'wave-rider-50': [{ events: passed(50) }, { events: passed(49) }],
    'self-expert': [{ responses: resp('triggers', 1).concat(resp('red-flags', 1)) }, { responses: resp('triggers', 1).concat(resp('red-flags', 1, true)) }],
    objection: [{ responses: resp('trial', 10) }, { responses: resp('trial', 9).concat(resp('trial-d', 3, true)) }],
    'net-weaver': [{ contacts: [1, 2, 3].map((i) => ({ id: `c${i}`, role: 'safetyNet', active: i !== 2, at: at(day(-i)) })) },
      { contacts: [{ id: 'c1', role: 'safetyNet', active: true }, { id: 'c2', role: 'safetyNet', active: true }, { id: 'c3', role: 'risky', active: true }] }],
    'said-it': [{ events: [ev('ScriptUsed', { responseId: 'r1' })] }, { events: [] }],
    'mood-lies': [{ predictions: [{ id: 'p1', predicted: 3, actual: 7, at: at(day(-3)), completedAt: at(day(-2)) }] }, { predictions: [{ id: 'p1', predicted: 7, actual: 3 }, { id: 'p2', predicted: 4 }] }],
    'calm-core': [{ quests: [{ id: 'sober-training', completedAt: at(day(-1)), ticks: {} }] }, { quests: [{ id: 'sober-training', ticks: { imagined: NOW, stress: NOW } }] }],
    planner: [{ events: [1, 2, 3, 4].map((i) => ev('WeeklyReviewCompleted', { weekStart: day(-7 * i) }, at(day(-7 * i)))) }, { events: [1, 2, 3].map((i) => ev('WeeklyReviewCompleted', {}, at(day(-i)))) }],
    comeback: [{ events: [ev('SlipReviewed', {}, at(day(-2))), ev('SlipReviewed', {}, at(day(-1)))] }, { events: [ev('SlipLogged', { date: TODAY })] }],
    graduate: [{ events: [ev('RecoveryPlanConfirmed')] }, { events: [ev('OnboardingCompleted')] }],
  };
  assert.deepEqual(Object.keys(cases).sort(), C.badges.map((b) => b.id).sort());
  for (const [id, [yes, no]] of Object.entries(cases)) {
    const got = E.badges(E.makeView(yes), NOW).filter((b) => b.id === id);
    assert.equal(got.length, 1, `${id} earned once`);
    assert.ok(typeof got[0].earnedAt === 'string', `${id} has earnedAt`);
    assert.ok(!badgeIds(no).includes(id), `${id} not earned yet`);
  }
  assert.equal(E.badges(E.makeView({ events: passed(12) }), NOW).find((b) => b.id === 'wave-rider-10').earnedAt, at(day(-51)));
  assert.equal(E.badges(E.makeView({ events: passed(3) }), NOW).find((b) => b.id === 'first-wave').earnedAt, at(day(-60)));
  assert.equal(E.badges(E.makeView(cases.comeback[0]), NOW).find((b) => b.id === 'comeback').earnedAt, at(day(-2)));
  assert.equal(E.badges(E.makeView(cases['smart-not-strong'][0]), NOW)[0].earnedAt, at(day(-8)));
  assert.equal(E.badges(E.makeView(cases['mood-lies'][0]), NOW)[0].earnedAt, at(day(-2)));
});

/* ── counters ──────────────────────────────────────────────────────────────────────────── */

const slip = (date, loggedOn = date, t = '21:00') => ev('SlipLogged', { date }, at(loggedOn, t));

test('counters: total counts completed days, current is the run since the last slip', () => {
  const p = { startDate: day(-10) };
  assert.deepEqual(E.counters(p, [], NOW), { tracking: true, total: 10, current: 10, nextMilestone: 14, reached: [1, 3, 7] });
  const c = E.counters(p, [slip(day(-3))], NOW);
  assert.equal(c.total, 9);
  assert.equal(c.current, 2);
  assert.deepEqual(E.counters({ startDate: TODAY }, [], NOW), { tracking: true, total: 0, current: 0, nextMilestone: 1, reached: [] });
  assert.deepEqual(E.counters({}, [], NOW), { tracking: false, total: 0, current: 0, nextMilestone: null, reached: [] });
  assert.deepEqual(E.counters(null, undefined, NOW).total, 0);
  assert.equal(E.counters({ startDate: day(5) }, [], NOW).total, 0);
});

test('counters: slip logs and SlipLogged events both count, one per date', () => {
  const p = { startDate: day(-10) };
  const logRow = { id: 'l1', type: 'slip', date: day(-4), at: at(day(-4), '22:00') };
  const c = E.counters(p, [logRow, slip(day(-4))], NOW);
  assert.equal(c.total, 9);
  assert.equal(c.current, 3);
  assert.equal(E.counters(p, [{ id: 'l2', type: 'craving', date: day(-4), at: at(day(-4)) }], NOW).total, 10);
});

test('counters: a slip logged later for an earlier date never removes a banked day', () => {
  const p = { startDate: day(-10) };
  const late = E.counters(p, [slip(day(-7), TODAY)], NOW);
  assert.equal(late.total, 10);
  assert.equal(late.current, 6);
  const todays = E.counters(p, [slip(TODAY, TODAY)], NOW);
  assert.equal(todays.total, 10);
  assert.equal(todays.current, 0);
  const tomorrow = E.counters(p, [slip(TODAY, TODAY)], at(day(1)));
  assert.equal(tomorrow.total, 10, 'the slip day is not banked, nothing falls');
});

test('counters: total never falls, day over day, as slips are appended', () => {
  const p = { startDate: day(-30) };
  const all = [slip(day(-25)), slip(day(-12), day(-10)), slip(day(-5)), slip(day(-20), day(-1)), slip(day(-1))];
  let prevTotal = -1;
  const prevReached = new Set();
  for (let k = -30; k <= 3; k++) {
    const now = at(day(k), '23:59');
    const known = all.filter((e) => e.at <= now);
    const c = E.counters(p, known, now);
    assert.ok(c.total >= prevTotal, `total fell on ${day(k)}`);
    for (const m of prevReached) assert.ok(c.reached.includes(m));
    c.reached.forEach((m) => prevReached.add(m));
    prevTotal = c.total;
  }
});

test('counters: milestones from total, a celebrated milestone never un-reaches', () => {
  const c = E.counters({ startDate: day(-2) }, [ev('MilestoneSeen', { milestone: 7 }), ev('MilestoneSeen', { milestone: 1 })], NOW);
  assert.deepEqual(c.reached, [1, 7]);
  assert.equal(c.nextMilestone, 3);
  assert.equal(E.counters({ startDate: day(-400) }, [], NOW).nextMilestone, null);
});

/* ── gameState, determinism, a slip lowers nothing ─────────────────────────────────────── */

function richRows() {
  n = 0;
  const events = [];
  for (let i = 0; i < 40; i++) {
    const d = day(-i % 20);
    events.push(ev('SkillUsed', { skillId: ['trial', 'sober', 'spot-trap'][i % 3], helpful: i % 2 === 0 }, at(d, `0${i % 9}:1${i % 6}`)));
    if (i % 4 === 0) events.push(ev('LogCreated', { logId: `l${i}`, type: 'craving' }, at(d, '19:00')));
    if (i % 5 === 0) events.push(ev('SosCompleted', { kind: 'craving', outcome: 'passed' }, at(d, '20:00')));
    if (i % 7 === 0) events.push(ev('MindfulMinute', {}, at(d, '07:00')));
  }
  for (const l of C.modules[0].lessons) events.push(ev('LessonCompleted', { lessonId: l.id }, at(day(-15), '10:00')));
  events.push(ev('ExplorerCompleted', {}, at(day(-9))), ev('WeeklyReviewCompleted', {}, at(day(-8))), ev('ArtifactSaved', { exerciseId: 'reasons', kind: 'build' }, at(day(-6))));
  events.push(ev('MilestoneSeen', { milestone: 7 }, at(day(-3))));
  return {
    profile: [{ key: 'me', name: 'Asha', term: 'sober', startDate: day(-30) }],
    events,
    logs: [{ id: 'lg1', type: 'slip', date: day(-18), at: at(day(-18), '23:00') }],
    responses: [{ id: 'r1', exerciseId: 'triggers', at: at(day(-12)), payload: {} }, { id: 'r2', exerciseId: 'red-flags', at: at(day(-11)), payload: {} }],
    contacts: [],
    predictions: [],
    quests: [],
  };
}

test('gameState has the contract shape', () => {
  const g = E.gameState(E.makeView(richRows()), NOW);
  assert.deepEqual(Object.keys(g).sort(), ['badges', 'counters', 'lessonsDone', 'mastery', 'modulesDone', 'momentum', 'rank', 'regions', 'xp'].sort());
  assert.ok(g.xp.total > 0 && g.modulesDone instanceof Set && g.lessonsDone instanceof Set);
  assert.equal(g.rank.id, 'explorer');
  assert.ok(g.badges.some((b) => b.id === 'self-expert'));
  assert.equal(g.counters.total, 29);
  const empty = E.gameState(E.makeView({}), NOW);
  assert.equal(empty.xp.total, 0);
  assert.equal(empty.rank, null);
  assert.deepEqual(empty.badges, []);
  assert.equal(empty.counters.tracking, false);
  assert.doesNotThrow(() => E.gameState(undefined, NOW));
});

test('determinism: shuffled and repeated events give the same state', () => {
  const rows = richRows();
  const base = E.gameState(E.makeView(rows), NOW);
  for (const seed of [1, 7, 42]) {
    const events = shuffle(rows.events.concat(rows.events.slice(0, 15).map((e) => ({ ...e }))), seed);
    assert.deepEqual(E.gameState(E.makeView({ ...rows, events }), NOW), base, `seed ${seed}`);
  }
  assert.deepEqual(E.gameState(E.makeView(rows), NOW), base, 'recomputing gives the same state');
});

test('a slip lowers nothing: today and backdated SlipLogged leave every number equal or higher', () => {
  const rows = richRows();
  const before = E.gameState(E.makeView(rows), NOW);
  const events = rows.events.concat([ev('SlipLogged', { date: TODAY }, at(TODAY, '11:00')), ev('SlipLogged', { date: day(-7) }, at(TODAY, '11:05'))]);
  const after = E.gameState(E.makeView({ ...rows, events }), NOW);
  assert.ok(after.xp.total >= before.xp.total && after.xp.today >= before.xp.today);
  assert.deepEqual(after.xp, before.xp);
  assert.deepEqual(after.mastery, before.mastery);
  assert.deepEqual(after.regions, before.regions);
  assert.deepEqual(after.momentum, before.momentum);
  assert.deepEqual(after.badges, before.badges);
  assert.deepEqual(after.rank, before.rank);
  assert.deepEqual(after.modulesDone, before.modulesDone);
  assert.deepEqual(after.lessonsDone, before.lessonsDone);
  assert.equal(after.counters.total, before.counters.total);
  assert.deepEqual(after.counters.reached, before.counters.reached);
  assert.ok(before.counters.current > 0);
  assert.equal(after.counters.current, 0, 'only the opt-in current run restarts');
  const tomorrow = E.gameState(E.makeView({ ...rows, events }), at(day(1)));
  assert.ok(tomorrow.counters.total >= after.counters.total, 'total does not fall the next day');
  assert.ok(tomorrow.xp.total >= after.xp.total);
});

test('makeView: get by keyPath, list copies, count; missing stores give []', () => {
  const v = E.makeView({ profile: [{ key: 'me', name: 'A' }], events: [ev('LogCreated')] });
  assert.equal(v.get('profile', 'me').name, 'A');
  assert.equal(v.get('profile', 'you'), null);
  assert.equal(v.count('events'), 1);
  assert.deepEqual(v.list('plans'), []);
  v.list('events').push({});
  assert.equal(v.count('events'), 1);
});
