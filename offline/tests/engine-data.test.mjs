process.env.TZ = 'Asia/Kolkata';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

/* U-08: export, import, migrate, the .ics file, AppError and validateContent (BUILD-PLAN 3.2, 3.3). */
const require = createRequire(import.meta.url);
const E = require('../src/engine.js');
const Content = require('../src/content-core.js');

const NOW = '2026-11-07T12:00:00+05:30';
const STORE_NAMES = Object.keys(E.STORES);

function fullRows() {
  return {
    profile: [{ key: 'me', name: 'Asha', term: 'sober', reviewDay: 0, substances: ['alcohol'], checkin: { morning: '08:00', evening: '21:00' } }],
    settings: [{ key: 'app', theme: 'auto', calm: false, milestonesSeen: [1, 3] }],
    meta: [{ key: 'lock', salt: 'c2FsdA==', iterations: 310000, check: { iv: 'aXY=', ct: 'Y3Q=' }, autoLockMin: 5 }, { key: 'sample', loadedAt: NOW }],
    events: [{ id: 'e2', type: 'LessonCompleted', at: '2026-11-07T10:00:00+05:30', payload: { lessonId: 'm0-l1' } }, { id: 'e1', type: 'SkillUsed', at: '2026-11-06T20:00:00+05:30', payload: { skillId: 'trial', helpful: true } }],
    logs: [{ id: 'l1', type: 'craving', at: NOW, date: '2026-11-07', hour: 12, intensity: 6, triggerIds: ['t1'], feelings: [], skills: [], drill: false }],
    responses: [{ id: 'r1', exerciseId: 'quick-reasons', schemaVersion: 1, payload: { reasons: ['My kids', 'Sleep, "real" sleep'] }, at: NOW, mode: 'workbook', draft: false }],
    contacts: [{ id: 'c1', name: 'Ravi', role: 'safetyNet', phone: '+91 98000 00000', active: true }],
    plans: [{ id: 'p1', date: '2026-11-08', start: '19:00', end: '20:00', title: 'Walk', kind: 'want', risky: false, status: 'planned' }],
    todos: [{ id: 't1', text: 'Add a Safety Net', source: 'm0-l1', done: false, at: NOW }],
    motivation: [{ id: 'mo1', at: NOW, stage: 'action', score: 7, plusOne: 'call Ravi', source: 'review' }],
    predictions: [{ id: 'pr1', activity: 'Walk', predicted: 4, at: NOW, notes: '' }],
    quests: [{ id: 'first-week', startedAt: NOW, ticks: { s1: NOW }, completedAt: null }],
    tutorials: [{ id: 'drill', completedAt: NOW, skipped: false, replays: 0, stepsSeen: 3 }],
    reveals: [{ id: 'insights', revealedAt: NOW, seenAt: null, forced: false }],
    tips: [{ id: 'backup', shownAt: NOW }],
    recoveryPlan: [{ key: 'plan', sections: { why: ['My kids'] }, confirmedAt: null }],
  };
}

/* ── export, import, migrate ────────────────────────────────────────────────────────────── */

test('export: the shape, all 16 stores, the view order kept, the lock row never exported, the sample marker kept', () => {
  const rows = fullRows();
  const b = E.exportBackup(E.makeView(rows), { now: NOW });
  assert.equal(b.app, '1-addic');
  assert.equal(b.schemaVersion, Content.schemaVersion);
  assert.equal(b.exportedAt, '2026-11-07T06:30:00.000Z');
  assert.deepEqual(Object.keys(b.stores).sort(), STORE_NAMES.slice().sort());
  assert.equal(STORE_NAMES.length, 16);
  assert.ok(!b.stores.meta.some((r) => r.key === 'lock'));
  assert.deepEqual(b.stores.meta, [{ key: 'sample', loadedAt: NOW }]);
  assert.deepEqual(b.stores.events.map((e) => e.id), ['e2', 'e1']);
  for (const s of STORE_NAMES) if (s !== 'meta') assert.deepEqual(b.stores[s], rows[s], s);
  assert.equal(E.exportBackup(E.makeView({}), NOW).exportedAt, '2026-11-07T06:30:00.000Z');
  assert.deepEqual(E.exportBackup(E.makeView({}), {}).stores.events, []);
});

test('export then import round-trips identically, through JSON text', () => {
  const view = E.makeView(fullRows());
  const first = E.exportBackup(view, { now: NOW });
  const parsed = JSON.parse(JSON.stringify(first));
  assert.deepEqual(E.validateBackup(parsed), { ok: true, errors: [] });
  const migrated = E.migrateBackup(parsed);
  assert.deepEqual(migrated, first);
  const again = E.exportBackup(E.makeView(migrated.stores), { exportedAt: first.exportedAt });
  assert.deepEqual(again, first);
  // a rule reading the imported view sees the same as before
  assert.deepEqual(E.xpFromEvents(E.makeView(migrated.stores), NOW), E.xpFromEvents(view, NOW));
});

test('export does not share rows with the view (a later edit cannot change a backup)', () => {
  const rows = fullRows();
  const b = E.exportBackup(E.makeView(rows), NOW);
  rows.events[0].payload.lessonId = 'changed';
  assert.equal(b.stores.events[0].payload.lessonId, 'm0-l1');
});

test('a bad import is refused with a reason, and nothing throws', () => {
  const good = () => JSON.parse(JSON.stringify(E.exportBackup(E.makeView(fullRows()), NOW)));
  const cases = {
    'null': null,
    'a string': '{"app":"1-addic"}',
    'an array': [],
    'a number': 3,
    'the wrong app': Object.assign(good(), { app: 'other-app' }),
    'no app': (() => { const b = good(); delete b.app; return b; })(),
    'a newer schema': Object.assign(good(), { schemaVersion: Content.schemaVersion + 1 }),
    'a schemaVersion string': Object.assign(good(), { schemaVersion: '1' }),
    'no stores': (() => { const b = good(); delete b.stores; return b; })(),
    'a store that is not a list': (() => { const b = good(); b.stores.events = { e1: {} }; return b; })(),
    'a row without its key': (() => { const b = good(); delete b.stores.logs[0].id; return b; })(),
    'a profile without its key': (() => { const b = good(); delete b.stores.profile[0].key; return b; })(),
    'a row that is not an object': (() => { const b = good(); b.stores.todos.push('text'); return b; })(),
    'the same id twice': (() => { const b = good(); b.stores.events.push(Object.assign({}, b.stores.events[0])); return b; })(),
    'an event without a type': (() => { const b = good(); delete b.stores.events[0].type; return b; })(),
    'an event without a time': (() => { const b = good(); b.stores.events[0].at = 'yesterday-ish'; return b; })(),
    'a getter that throws': Object.defineProperty({}, 'app', { get() { throw new Error('boom'); }, enumerable: true }),
  };
  for (const [name, obj] of Object.entries(cases)) {
    let r;
    assert.doesNotThrow(() => { r = E.validateBackup(obj); }, name);
    assert.equal(r.ok, false, name);
    assert.ok(r.errors.length >= 1 && r.errors.every((e) => typeof e === 'string' && e.length > 0), name);
  }
  assert.match(E.validateBackup(cases['a newer schema']).errors.join(' '), /newer version/);
  assert.match(E.validateBackup(cases['the wrong app']).errors.join(' '), /not a 1-addic backup/);
  assert.match(E.validateBackup(cases['a store that is not a list']).errors.join(' '), /stores\.events is not a list/);
});

test('validateBackup caps its list of errors', () => {
  const b = JSON.parse(JSON.stringify(E.exportBackup(E.makeView({}), NOW)));
  b.stores.logs = Array.from({ length: 200 }, () => ({}));
  const r = E.validateBackup(b);
  assert.equal(r.ok, false);
  assert.ok(r.errors.length <= 20);
});

test('migrate: an older or partial backup gains every missing store as [], unknown stores and a lock row are dropped', () => {
  const old = { app: '1-addic', schemaVersion: 1, exportedAt: null, stores: { events: [{ id: 'e1', type: 'LessonCompleted', at: NOW, payload: { lessonId: 'm0-l1' } }], meta: [{ key: 'lock', salt: 'x' }, { key: 'sample', loadedAt: NOW }], somethingElse: [{ id: 'x' }] } };
  assert.equal(E.validateBackup(old).ok, true);
  const m = E.migrateBackup(old);
  assert.deepEqual(Object.keys(m.stores).sort(), STORE_NAMES.slice().sort());
  for (const s of STORE_NAMES) assert.ok(Array.isArray(m.stores[s]), s);
  assert.deepEqual(m.stores.logs, []);
  assert.deepEqual(m.stores.meta, [{ key: 'sample', loadedAt: NOW }]);
  assert.equal(m.schemaVersion, Content.schemaVersion);
  assert.ok(!('somethingElse' in m.stores));
  assert.ok('somethingElse' in old.stores, 'the input is not changed');
  assert.equal(old.stores.meta.length, 2);
  assert.equal(E.migrateBackup(null), null);
  assert.equal(E.migrateBackup('text'), null);
  const noStores = E.migrateBackup({ app: '1-addic', schemaVersion: 1 });
  assert.deepEqual(noStores.stores.events, []);
});

/* ── .ics ───────────────────────────────────────────────────────────────────────────────── */

const octets = (s) => Buffer.byteLength(s, 'utf8');
const unfold = (s) => s.replace(/\r\n[ \t]/g, '');

test('ics: CRLF lines of at most 75 octets, folded without splitting a character, escaped text', () => {
  const title = 'Evening walk; with Ravi, by the lake \\ then home — चलो ' + 'and a long tail of words '.repeat(6);
  const out = E.ics([{ id: 'p1', title, date: '2026-11-08', start: '19:00', end: '20:00', notes: 'Line one\nLine two, with a comma' }], { now: NOW });
  assert.ok(out.endsWith('\r\n'));
  assert.ok(!/[^\r]\n/.test(out), 'no bare LF');
  const lines = out.split('\r\n').slice(0, -1);
  for (const l of lines) assert.ok(octets(l) <= 75, `${octets(l)} octets: ${l}`);
  assert.ok(lines.some((l) => l.startsWith(' ')), 'a long line was folded');
  assert.ok(!out.includes('�'));
  const flat = unfold(out);
  assert.ok(flat.includes('SUMMARY:Evening walk\\; with Ravi\\, by the lake \\\\ then home — चलो and a long tail'));
  assert.ok(flat.includes('DESCRIPTION:Line one\\nLine two\\, with a comma'));
  assert.equal(lines[0], 'BEGIN:VCALENDAR');
  assert.ok(lines.includes('VERSION:2.0'));
  assert.ok(lines.some((l) => l.startsWith('PRODID:')));
  assert.equal(lines[lines.length - 1], 'END:VCALENDAR');
});

test('ics: floating local DTSTART and DTEND, UID from the id, DTSTAMP in UTC, an end past midnight', () => {
  const out = unfold(E.ics([
    { id: 'p1', title: 'Walk', date: '2026-11-08', start: '19:00', end: '20:30' },
    { id: 'p2', title: 'Late shift', date: '2026-11-08', start: '23:00', end: '01:00' },
    { id: 'p3', title: 'A day of rest', date: '2026-11-09' },
    { id: 'p4', title: 'No date' },
    { id: 'p5', title: 'Bad date', date: '2026-13-40' },
  ], { now: NOW }));
  assert.ok(out.includes('UID:p1@1-addic'));
  assert.ok(out.includes('DTSTAMP:20261107T063000Z'));
  assert.ok(out.includes('DTSTART:20261108T190000\r\nDTEND:20261108T203000'));
  assert.ok(!/DTSTART:\d{8}T\d{6}Z/.test(out), 'start times float (no Z)');
  assert.ok(out.includes('DTSTART:20261108T230000\r\nDTEND:20261109T010000'));
  assert.ok(out.includes('DTSTART;VALUE=DATE:20261109\r\nDTEND;VALUE=DATE:20261110'));
  assert.equal((out.match(/BEGIN:VEVENT/g) || []).length, 3);
  assert.equal((out.match(/END:VEVENT/g) || []).length, 3);
  assert.ok(!out.includes('No date') && !out.includes('Bad date'));
  assert.equal(E.ics([]), 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//1-addic//offline edition//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nEND:VCALENDAR\r\n');
  assert.equal(E.ics([{ id: 'x', title: 'T', date: '2026-11-08' }]), E.ics([{ id: 'x', title: 'T', date: '2026-11-08' }]), 'no clock: the same input gives the same file');
});

test('ics: the Weekly Review repeats weekly on profile.reviewDay', () => {
  assert.equal(E.weeklyRrule(0), 'FREQ=WEEKLY;BYDAY=SU');
  assert.equal(E.weeklyRrule(6), 'FREQ=WEEKLY;BYDAY=SA');
  assert.equal(E.weeklyRrule(7), null);
  assert.equal(E.weeklyRrule('1'), null);
  const review = (rrule) => unfold(E.ics([{ id: 'review', title: 'Weekly Review', date: '2026-11-08', start: '19:00', end: '19:30', rrule }], { now: NOW }));
  assert.ok(review(E.weeklyRrule(0)).includes('RRULE:FREQ=WEEKLY;BYDAY=SU\r\n'));
  assert.ok(review({ freq: 'weekly', byDay: 1 }).includes('RRULE:FREQ=WEEKLY;BYDAY=MO\r\n'));
  assert.ok(review('RRULE:FREQ=WEEKLY;BYDAY=TU').includes('RRULE:FREQ=WEEKLY;BYDAY=TU\r\n'));
  assert.ok(!review('FREQ=WEEKLY\r\nX-EVIL:1').includes('RRULE'), 'a malformed rule is left out');
  assert.ok(!review(undefined).includes('RRULE'));
});

/* ── AppError ───────────────────────────────────────────────────────────────────────────── */

test('AppError: an Error with a code, with or without new', () => {
  const a = E.AppError('Backup is from a newer version', 'import-newer');
  const b = new E.AppError('Not found');
  assert.ok(a instanceof Error && a instanceof E.AppError);
  assert.equal(a.name, 'AppError');
  assert.equal(a.message, 'Backup is from a newer version');
  assert.equal(a.code, 'import-newer');
  assert.equal(b.code, 'error');
  assert.ok(typeof a.stack === 'string');
});

/* ── validateContent ────────────────────────────────────────────────────────────────────── */

test('validateContent: zero errors on the base content, called as the validate gate calls it', () => {
  const r = E.validateContent();
  assert.ok(Array.isArray(r));
  assert.deepEqual(r, []);
  assert.deepEqual(E.validateContent(Content), []);
});

test('validateContent: catches each planted error in a cloned content, and never throws', () => {
  const c = JSON.parse(JSON.stringify(Content));
  const l0 = c.modules[0].lessons[0];
  const l1 = c.modules[0].lessons[1];
  const l2 = c.modules[0].lessons[2];
  l0.refs = ['R999'];
  l1.refs = [];
  l1.moment.cast = 'nobody';
  l2.tryIt = { route: '#/nowhere', label: 'x' };
  l0.cards[0].link = '#/workbook/not-an-artifact';
  c.skills[0].region = 'atlantis';
  l0.cards[1].text = 'Every addict knows this.';
  c.tips[0].route = '#/lesson/m9-l9';
  const r = E.validateContent(c);
  const has = (re) => assert.ok(r.some((e) => re.test(e)), `${re} in ${JSON.stringify(r)}`);
  has(/^lesson m0-l1: cites unknown reference R999$/);
  has(/^lesson m0-l2: cites no reference$/);
  has(/^lesson m0-l2: moment\.cast nobody is not in Content\.cast$/);
  has(/route #\/nowhere is not in the route table/);
  has(/modules\[0\]\.lessons\[0\]\.cards\[0\]\.link: route #\/workbook\/not-an-artifact/);
  has(/^skill [a-z-]+: region atlantis is not in Content\.regions$/);
  has(/modules\[0\]\.lessons\[0\]\.cards\[1\]\.text: uses "addict" as a noun/);
  has(/tips\[0\]\.route: route #\/lesson\/m9-l9 names no lesson m9-l9/);
  assert.equal(r.length, 8, JSON.stringify(r));
  for (const bad of [null, 'text', 4, []]) assert.doesNotThrow(() => E.validateContent(bad));
  assert.deepEqual(E.validateContent(null), ['content: not an object']);
  const cyc = JSON.parse(JSON.stringify(Content));
  cyc.self = cyc;
  assert.doesNotThrow(() => E.validateContent(cyc));
});

test('validateContent: the tryIt exercise check waits for Content.exercises, then runs', () => {
  const c = JSON.parse(JSON.stringify(Content));
  assert.equal(c.exercises, undefined, 'the base has no Content.exercises');
  const tried = [];
  for (const m of c.modules) for (const l of m.lessons) if (l.tryIt && l.tryIt.exercise) tried.push(l.tryIt.exercise);
  assert.ok(tried.length > 0);
  assert.deepEqual(E.validateContent(c), []);
  c.exercises = tried.slice(1).map((id) => ({ id }));
  const r = E.validateContent(c);
  assert.ok(r.some((e) => e.includes(`tryIt.exercise ${tried[0]} is not in Content.exercises`)), JSON.stringify(r));
  c.exercises = Object.fromEntries(tried.map((id) => [id, {}]));
  assert.deepEqual(E.validateContent(c), []);
  assert.deepEqual(E.validateContent(Object.assign(c, { tips: [{ id: 'x', text: 'y', route: '#/exercise/not-one' }] })).length, 1);
});

test('validateContent: "1-addic", "addicted brain", "addiction" and a quoted thought pass; "addicts" does not', () => {
  const base = JSON.parse(JSON.stringify(Content));
  const withText = (text) => { const c = JSON.parse(JSON.stringify(base)); c.modules[0].lessons[0].cards[0].text = text; return E.validateContent(c); };
  assert.deepEqual(withText('1-addic helps with addiction; the addicted brain is fast.'), []);
  assert.deepEqual(withText('"I slipped, so I\'m a hopeless addict."'), []);
  assert.equal(withText('Many addicts feel this.').length, 1);
  assert.equal(withText('She said "I am an addict" and then laughed.').length, 1);
});

test('knownRoute: the 3.5 route table, by path', () => {
  for (const r of ['#/today', '#/sos?drill=1', '#/actions/battle?new=1', '#/workbook/reasons', '#/practice/urge-surf', '#/settings/data', '#/track/log/craving', '#/learn/m0', '#/lesson/m0-l1', '#/exercise/anything', '#/tools/trial?mode=redflag&thought=x']) assert.ok(E.knownRoute(r), r);
  for (const r of ['#/nowhere', 'today', '#/workbook/nope', '#/track/log/party', '#/learn/m99', '#/settings/data/extra', '#/sos/urgent/2']) assert.ok(!E.knownRoute(r), r);
});
