// Lane actions-sos's Node tests (node:test, no dependencies). U-09: the Actions verbs of BUILD-PLAN 3.2 in Node memory
// mode. The real offline/src/store.js and engine.js are loaded by path when they exist (the merged trunk); while one is
// absent, the stand-in at the bottom of this file takes its place: the Store of contract E (tracks/CORE/contracts/core.md)
// in memory, and only the Engine names U-09 calls, with the shapes of tracks/CORE/contracts/engine.md.
import { describe, test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
// The test clock is pinned (FIX-ONB-EMO CLOCK): a fixed local noon that still ticks, so no run meets midnight, a new
// week or a month end. A Date made with no argument, and Date.now, read it; a Date with arguments is untouched.
const RealDate = Date;
const PINNED_AT = new RealDate(2026, 2, 11, 12, 0, 0).getTime(); // Wednesday 11 March 2026, 12:00 local
let CLOCK_SHIFT = PINNED_AT - RealDate.now(); // RC16 moves it on past a midnight and back (shiftClock)
globalThis.Date = class PinnedDate extends RealDate {
  constructor(...a) { if (a.length) super(...a); else super(RealDate.now() + CLOCK_SHIFT); }
  static now() { return RealDate.now() + CLOCK_SHIFT; }
};
const shiftClock = (ms) => { CLOCK_SHIFT += ms; };
const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const src = (f) => join(SRC, f);

globalThis.Content = require(src('content-core.js'));
for (const f of readdirSync(SRC).filter((n) => /^content-.+\.js$/.test(n) && n !== 'content-core.js').sort()) require(src(f));
const REAL_ENGINE = existsSync(src('engine.js'));
const REAL_STORE = existsSync(src('store.js'));
globalThis.Engine = REAL_ENGINE ? require(src('engine.js')) : engineStandIn();
globalThis.Store = REAL_STORE ? require(src('store.js')) : storeStandIn();
const Actions = require(src('actions.js'));

const S = () => globalThis.Store;
const E = () => globalThis.Engine;
const C = () => globalThis.Content;
const STORES = () => S().STORES || E().STORES;
const list = (store) => S().view.list(store) || [];
const events = (type) => list('events').filter((e) => !type || e.type === type);
const tick = () => new Promise((r) => setTimeout(r, 0));
// FIX-R8 C-R7-1: a wait for a condition. The real Store (the merged trunk) makes a real key (PBKDF2) for lock.set,
// unlock and remove, about a second and far longer than a settle. This looks every few ms, each look after a timer
// (so the work a tap queued has run), and fails with msg when cond() does not hold within ms; a throw from cond()
// fails at once. It never passes on its own.
async function until(cond, msg, ms = 30000) {
  const end = RealDate.now() + ms;
  for (;;) {
    await new Promise((r) => setTimeout(r, 3));
    if (cond()) return;
    if (RealDate.now() > end) assert.fail(`${msg} (not within ${ms} ms)`);
  }
}
// FIX-R8 C-R7-1: the Store with its lock.set calls counted. On the real Store a PIN being set still reads as no lock,
// so a refusal before the Store is proven by no call, not by a lock that has not come yet.
function setSpy() {
  const real = S();
  const calls = [];
  const store = Object.create(real);
  store.lock = Object.assign(Object.create(real.lock), { set: (...a) => { calls.push(a[0]); return real.lock.set(...a); } });
  return { store, calls };
}
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
function sortStores(stores) {
  const out = {};
  for (const name of Object.keys(stores).sort()) {
    const kp = STORES()[name] || 'id';
    out[name] = [...stores[name]].sort((a, b) => String(a[kp]).localeCompare(String(b[kp])));
  }
  return out;
}
async function snapshot() { return sortStores((await S().exportJson()).stores); }
function watch() {
  let n = 0;
  const off = S().subscribe(() => { n += 1; });
  return { get count() { return n; }, off };
}
async function refused(promise, code) {
  await assert.rejects(promise, (err) => { assert.equal(err.code, code, `expected ${code}, got ${err.code}: ${err.message}`); return true; });
}
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return E().todayStr(d); }
const firstModule = () => C().modules[0];
// The event a saved response writes, from Content: ArtifactSaved only for the kinds build, assess and plan.
function savedType(exerciseId) {
  const ex = C().exercises;
  const row = Array.isArray(ex) ? ex.find((x) => x && x.id === exerciseId) : ex && ex[exerciseId];
  const kind = row ? row.kind || null : null;
  if (['build', 'assess', 'plan'].includes(kind)) return 'ArtifactSaved';
  return ['practice', 'reflect', 'tool'].includes(kind) ? 'ExerciseDone' : null; // null: no kind, or one 3.7 names in neither list (RC17)
}
// RS9T: fn runs with a stub Content, the real one's fields without `sample` (the real Content is never changed); the
// real one goes back after
async function withoutSample(fn) {
  const real = globalThis.Content;
  const stub = Object.assign({}, real);
  delete stub.sample;
  globalThis.Content = stub;
  try { return await fn(); } finally { globalThis.Content = real; }
}
// Content.sample may be loaded (content-sample.js, BUILD-PLAN 3.1): a test that sets it, or needs it absent, puts it back after.
async function withSample(sample, fn) {
  const had = Object.prototype.hasOwnProperty.call(C(), 'sample');
  const old = C().sample;
  if (sample === undefined) delete C().sample; else C().sample = sample;
  try { return await fn(); } finally { if (had) C().sample = old; else delete C().sample; }
}
// the trunk's Content.sample (content U-33, 42d2467d content-sample.js) by a stand-in of its shape: generate(nowIso)
// gives {stores}, every row marked sample: true, the profile 'me' among them; a settings 'app' row too, as RS-SAMPLE names it
const TRUNK_SAMPLE = { name: 'Sample', generate: (now) => ({ stores: {
  profile: [{ key: 'me', name: 'Sample', companion: 'Kite', substances: ['Alcohol'], term: 'sober', startDate: daysAgo(28), notSure: false,
    stage: 'action', region: 'in', checkin: { morning: '08:30', evening: '21:30' }, reviewDay: 0, pace: 'steady', customPerWeek: null,
    roadmapStart: daysAgo(28), onboardedAt: now, medical: { heavyDaily: false, sedatives: false, opioids: false }, locale: 'en', sample: true }],
  settings: [{ key: 'app', theme: 'light', sample: true }],
  events: [{ id: 'smp-ev-1', type: 'OnboardingCompleted', at: now, payload: {}, sample: true }],
  logs: [{ id: 'smp-log-1', type: 'craving', at: now, date: E().todayStr(now), hour: 20, intensity: 6, triggerIds: [], feelings: [], skills: [],
    drill: false, sample: true }],
} }) };
async function someData() {
  await Actions.onboard({ name: 'Asha', startDate: daysAgo(12), substances: ['Alcohol'] });
  await Actions.sosSession({ kind: 'craving', ratingBefore: 7, ratingAfter: 3, tools: [{ skillId: 'ride-wave', helpful: true }] });
  await Actions.logCraving({ intensity: 5, triggerIds: ['evening'], skills: [{ skillId: 'distract', helpful: true }] });
  const c = await Actions.contacts.add({ name: 'Ravi', role: 'safetyNet', phone: '+91 98765 43210' });
  await Actions.contacts.reached(c.id, 'call');
  await Actions.saveResponse('quick-reasons', { reasons: ['my health', 'my kids'] });
  await Actions.completeLesson(firstModule().lessons[0].id);
  await Actions.settings.patch({ theme: 'dark', milestonesSeen: [1, 3] });
  await Actions.recoveryPlan.save({ motivation: { items: ['my kids'] } }, { confirm: true });
  await Actions.todos.add({ text: 'Do the slip review', source: 'sos', route: '#/exercise/slip-review' });
  return { contactId: c.id };
}

describe(`actions (U-09; store: ${REAL_STORE ? 'real' : 'stand-in'}, engine: ${REAL_ENGINE ? 'real' : 'stand-in'})`, () => {
  before(async () => { if (typeof S().load === 'function') await S().load(); });
  beforeEach(async () => { await S().resetAll(); });

  test('every 3.2 verb is a function', () => {
    const verbs = ['onboard', 'settings.patch', 'recordEvent', 'logCraving', 'logFeeling', 'checkin', 'logActivity', 'logSlip',
      'sosSession', 'completeLesson', 'checkpoint', 'saveResponse', 'contacts.add', 'contacts.update', 'contacts.deactivate',
      'contacts.reached', 'plans.add', 'plans.update', 'plans.remove', 'plans.debrief', 'weeklyReview', 'todos.add', 'todos.done',
      'todos.remove', 'motivation.add', 'predictions.add', 'predictions.complete', 'quests.tick', 'tutorial.done',
      'tutorial.replay', 'reveal', 'markTipShown', 'recoveryPlan.save', 'scriptUsed', 'loadSample', 'eraseAll', 'importBackup'];
    for (const v of verbs) assert.equal(typeof v.split('.').reduce((o, k) => o && o[k], Actions), 'function', `Actions.${v}`);
  });

  test('sos craving writes a log and SkillUsed events', async () => {
    const r = await Actions.sosSession({ kind: 'craving', ratingBefore: 8, ratingAfter: 3, delays: 1, risky: true,
      tools: [{ skillId: 'ride-wave', helpful: true }, { skillId: 'reasons', helpful: false }] });
    const logs = list('logs');
    assert.equal(logs.length, 1);
    const log = logs[0];
    assert.equal(log.type, 'craving');
    assert.equal(log.drill, false);
    assert.equal(log.intensity, 8);
    assert.equal(log.date, E().todayStr(log.at));
    assert.deepEqual(log.skills, [{ skillId: 'ride-wave', helpful: true }, { skillId: 'reasons', helpful: false }]);
    assert.deepEqual(events('SkillUsed').map((e) => [e.payload.skillId, e.payload.helpful, e.payload.logId]).sort(),
      [['reasons', false, log.id], ['ride-wave', true, log.id]]);
    assert.deepEqual(events('LogCreated').map((e) => e.payload), [{ logId: log.id, type: 'craving' }]);
    assert.deepEqual(events('SosCompleted').map((e) => e.payload),
      [{ kind: 'craving', outcome: 'passed', ratingBefore: 8, ratingAfter: 3, delays: 1, logId: log.id }]);
    assert.equal(events('SlipLogged').length, 0);
    for (const e of events()) {
      assert.equal(typeof e.id, 'string');
      assert.match(e.at, ISO_RE);
      assert.equal(typeof e.payload, 'object');
    }
    assert.equal(r.log.id, log.id);
    assert.deepEqual(r.events.map((e) => e.type), ['LogCreated', 'SkillUsed', 'SkillUsed', 'SosCompleted']);
    if (typeof E().mastery === 'function') assert.equal(E().mastery(events())['ride-wave'].uses, 1);
  });

  test('sos with used:true logs the slip too; outcome still when the rating holds', async () => {
    await Actions.sosSession({ kind: 'craving', ratingBefore: 6, ratingAfter: 6 });
    assert.equal(events('SosCompleted')[0].payload.outcome, 'still');
    await S().resetAll();
    const r = await Actions.sosSession({ kind: 'craving', ratingBefore: 9, ratingAfter: 9, used: true });
    assert.equal(r.log.used, true);
    assert.equal(events('SosCompleted')[0].payload.outcome, 'used');
    assert.deepEqual(events('SlipLogged').map((e) => e.payload), [{ date: r.log.date, logId: r.log.id }]);
  });

  test('sos drill writes nothing', async () => {
    await Actions.onboard({ name: 'Asha' });
    const before = await snapshot();
    const r = await Actions.sosSession({ kind: 'craving', ratingBefore: 7, ratingAfter: 2, used: true, drill: true,
      tools: [{ skillId: 'ride-wave', helpful: true }] });
    assert.equal(r.drill, true);
    const after = await snapshot();
    assert.equal(list('logs').length, 0);
    for (const t of ['LogCreated', 'SkillUsed', 'SosCompleted', 'SlipLogged']) assert.equal(events(t).length, 0, t);
    const added = after.events.filter((e) => !before.events.some((b) => b.id === e.id));
    assert.deepEqual(added.map((e) => [e.type, e.payload.id]), [['TutorialCompleted', 'drill']]);
    for (const name of Object.keys(after)) if (name !== 'events') assert.deepEqual(after[name], before[name], name);
  });

  test('drill TutorialCompleted written once', async () => {
    await Actions.sosSession({ kind: 'feeling', drill: true });
    const before = await snapshot();
    const savedAt = S().status().lastSavedAt;
    const w = watch();
    const r = await Actions.sosSession({ kind: 'craving', ratingBefore: 5, drill: true });
    await Actions.tutorial.done('drill');
    await tick();
    w.off();
    assert.deepEqual(r, { drill: true, events: [] });
    assert.equal(events('TutorialCompleted').filter((e) => e.payload.id === 'drill').length, 1);
    assert.deepEqual((await snapshot()).events, before.events);
    assert.equal(list('logs').length, 0);
    assert.ok(w.count <= 1, 'the second drill notified no one');
    if (w.count === 0) assert.equal(S().status().lastSavedAt, savedAt);
    /* a view that has not caught up yet: the check inside the commit still keeps it to one */
    const v = S().view;
    const realList = v.list;
    let patched = false;
    try { v.list = (name) => (name === 'events' ? [] : realList.call(v, name)); patched = v.list !== realList; } catch (e) { patched = false; }
    if (patched) {
      try { await Actions.sosSession({ kind: 'craving', drill: true }); } finally { v.list = realList; }
      assert.equal(events('TutorialCompleted').filter((e) => e.payload.id === 'drill').length, 1);
    }
  });

  test('slip restarts only the run', async () => {
    await Actions.onboard({ startDate: daysAgo(10) });
    await Actions.sosSession({ kind: 'craving', ratingBefore: 6, ratingAfter: 2, tools: [{ skillId: 'ride-wave', helpful: true }] });
    await Actions.completeLesson(firstModule().lessons[0].id);
    const now = new Date();
    const derive = () => {
      const slipRows = list('logs').filter((l) => l.type === 'slip');
      return E().counters(S().view.get('profile', 'me'), events().concat(slipRows), now);
    };
    const xp = () => (typeof E().xpFromEvents === 'function' ? E().xpFromEvents(events(), now).total : null);
    const c0 = derive();
    const xp0 = xp();
    assert.equal(c0.total, 10);
    assert.equal(c0.current, 10);
    const r = await Actions.logSlip({ date: daysAgo(3), situation: 'a party' });
    assert.equal(r.log.type, 'slip');
    assert.equal(r.log.date, daysAgo(3));
    assert.equal(E().todayStr(r.log.at), E().todayStr(now), 'at is the time of logging');
    assert.deepEqual(events('SlipLogged').map((e) => e.payload), [{ date: daysAgo(3), logId: r.log.id }]);
    const c1 = derive();
    assert.equal(c1.current, 2, 'the opt-in run restarts the day after the slip');
    assert.equal(c1.total, 10, 'banked days stay banked');
    for (const m of c0.reached) assert.ok(c1.reached.includes(m), `milestone ${m} still reached`);
    assert.equal(S().view.get('profile', 'me').startDate, daysAgo(10));
    if (xp0 !== null) assert.ok(xp() >= xp0, 'XP never falls');
  });

  test('slip lowers nothing', async () => {
    await someData();
    const before = await snapshot();
    await Actions.logSlip({});
    await Actions.logSlip({ date: daysAgo(1), substance: 'Alcohol', notes: 'after work' });
    const after = await snapshot();
    for (const name of Object.keys(before)) {
      const kp = STORES()[name];
      for (const row of before[name]) assert.deepEqual(after[name].find((x) => x[kp] === row[kp]), row, `${name} ${row[kp]} unchanged`);
    }
    assert.equal(after.logs.length, before.logs.length + 2);
    assert.equal(after.events.length, before.events.length + 2);
    await refused(Actions.logSlip({ date: '2999-01-01' }), 'bad-slip');
  });

  test('export reset import is identical', async () => {
    const { contactId } = await someData();
    await Actions.contacts.deactivate(contactId);
    await Actions.logSlip({ date: daysAgo(2) });
    await Actions.quests.tick('clear-space', 'list');
    const exported = JSON.parse(JSON.stringify(await S().exportJson()));
    const before = sortStores(exported.stores);
    assert.ok(before.events.length >= 10);
    await Actions.eraseAll();
    for (const name of Object.keys(STORES())) assert.equal(list(name).length, 0, `${name} empty after erase`);
    const r = await Actions.importBackup(exported);
    assert.equal(r.imported, true);
    assert.deepEqual(await snapshot(), before);
  });

  test('import of a bad backup changes nothing', async () => {
    await someData();
    const before = await snapshot();
    const good = JSON.parse(JSON.stringify(await S().exportJson()));
    const bad = [null, 'a file', [], {}, Object.assign({}, good, { app: 'other-app' }), Object.assign({}, good, { schemaVersion: 99 }),
      Object.assign({}, good, { stores: 'none' }), Object.assign({}, good, { stores: { logs: 'not a list' } }),
      Object.assign({}, good, { stores: { mystery: [] } }), Object.assign({}, good, { stores: { logs: [{ type: 'craving' }] } }),
      Object.assign({}, good, { stores: { logs: [{ id: 'x' }, { id: 'x' }] } })];
    for (const b of bad) await refused(Actions.importBackup(b), 'bad-backup');
    assert.deepEqual(await snapshot(), before);
  });

  test('onboard sets locale en and region', async () => {
    const r = await Actions.onboard({ name: 'Asha', region: 'intl', term: 'clean', substances: ['Alcohol'], medical: { heavyDaily: true } });
    const p = S().view.get('profile', 'me');
    assert.equal(p.locale, 'en');
    assert.equal(p.region, 'intl');
    assert.match(p.onboardedAt, ISO_RE);
    assert.deepEqual(p.medical, { heavyDaily: true, sedatives: false, opioids: false });
    assert.deepEqual(r.profile, p);
    const s = S().view.get('settings', 'app');
    assert.equal(s.showCurrentRun, false, 'the current run is opt-in');
    assert.equal(s.discreet, false);
    assert.equal(events('OnboardingCompleted').length, 1);
    await Actions.onboard({ companion: 'Kiran' });
    const p2 = S().view.get('profile', 'me');
    assert.equal(p2.name, 'Asha');
    assert.equal(p2.companion, 'Kiran');
    assert.equal(p2.onboardedAt, p.onboardedAt);
    assert.equal(events('OnboardingCompleted').length, 1, 'once');
    await S().resetAll();
    await Actions.onboard({});
    assert.equal(S().view.get('profile', 'me').region, 'in', 'India by default');
    await refused(Actions.onboard({ locale: 'gu' }), 'bad-profile');
    const backup = JSON.parse(JSON.stringify(await S().exportJson()));
    backup.stores.profile[0].locale = 'gu';
    await Actions.importBackup(backup);
    await Actions.onboard({ name: 'Asha' });
    assert.equal(S().view.get('profile', 'me').locale, 'en', 'O5: locale en everywhere');
    await refused(Actions.onboard({ region: 'mars' }), 'bad-profile');
  });

  test('settings patch rejects unknown keys', async () => {
    const s = await Actions.settings.patch({ theme: 'dark', calm: true, milestonesSeen: [1, 3] });
    assert.equal(s.theme, 'dark');
    assert.deepEqual(S().view.get('settings', 'app'), s);
    await Actions.settings.patch({ milestonesSeen: [7] });
    assert.deepEqual(S().view.get('settings', 'app').milestonesSeen, [1, 3, 7], 'milestones seen only grow');
    const before = await snapshot();
    await refused(Actions.settings.patch({ bogus: 1 }), 'bad-setting');
    await refused(Actions.settings.patch({ theme: 'neon' }), 'bad-setting');
    await refused(Actions.settings.patch({ calm: 'yes' }), 'bad-setting');
    await refused(Actions.settings.patch(null), 'bad-setting');
    assert.deepEqual(await snapshot(), before);
  });

  test('validation failures write nothing', async () => {
    const { contactId } = await someData();
    const before = await snapshot();
    const w = watch();
    const cases = [
      [() => Actions.sosSession({ kind: 'party' }), 'bad-session'],
      [() => Actions.sosSession({ kind: 'craving', ratingBefore: 11 }), 'bad-session'],
      [() => Actions.sosSession({ kind: 'craving', tools: [{ skillId: 'no-such-skill', helpful: true }] }), 'bad-session'],
      [() => Actions.sosSession({ kind: 'craving', tools: [{ skillId: 'ride-wave', helpful: 'yes' }] }), 'bad-session'],
      [() => Actions.sosSession({ kind: 'craving', used: true, outcome: 'passed' }), 'bad-session'],
      [() => Actions.sosSession({ kind: 'craving', drill: true, ratingBefore: -1 }), 'bad-session'],
      [() => Actions.logCraving({ intensity: 12 }), 'bad-log'],
      [() => Actions.logFeeling({ intensity: 3, emotion: 'no-such-feeling' }), 'bad-log'],
      [() => Actions.checkin('noon', {}), 'bad-checkin'],
      [() => Actions.logActivity({ kind: 'nap', minutes: 10 }), 'bad-activity'],
      [() => Actions.logSlip({ date: 'yesterday' }), 'bad-slip'],
      [() => Actions.recordEvent('SoberDayClaimed', {}), 'bad-event'],
      [() => Actions.recordEvent('SkillUsed', { skillId: 'ride-wave', helpful: 3 }), 'USE_VERB'],
      [() => Actions.completeLesson('m99-l9'), 'unknown-lesson'],
      [() => Actions.checkpoint('m99', []), 'bad-checkpoint'],
      [() => Actions.saveResponse('quick-reasons', 'plain text'), 'bad-response'],
      [() => Actions.contacts.add({ name: '' }), 'bad-contact'],
      [() => Actions.contacts.add({ name: 'Ravi', phone: 'call me' }), 'bad-contact'],
      [() => Actions.contacts.reached('no-such-contact', 'call'), 'bad-contact'],
      [() => Actions.contacts.reached(contactId, 'pigeon'), 'bad-contact'],
      [() => Actions.plans.add({ date: '2026-11-07', start: '10:00', end: '09:00', title: 'Walk' }), 'bad-plan'],
      [() => Actions.todos.add({ text: ' ' }), 'bad-plan'],
      [() => Actions.motivation.add({ stage: 'no-such-stage', score: 5 }), 'bad-motivation'],
      [() => Actions.predictions.add({ activity: '', predicted: 3 }), 'bad-prediction'],
      [() => Actions.quests.tick('clear-space', 'no-such-step'), 'bad-quest'],
      [() => Actions.tutorial.done('no-such-tutorial'), 'bad-tutorial'],
      [() => Actions.reveal('no-such-feature'), 'bad-feature'],
      [() => Actions.markTipShown('no-such-tip'), 'bad-tip'],
      [() => Actions.recoveryPlan.save('my plan'), 'bad-plan'],
      [() => Actions.scriptUsed('no-such-response'), 'bad-script'],
      [() => Actions.onboard({ admin: true }), 'bad-profile'],
      [() => withoutSample(() => Actions.loadSample()), 'no-sample'], // RS9T: a stub Content without `sample`, whatever this tree loads
      [() => withSample(TRUNK_SAMPLE, () => withoutSample(() => Actions.loadSample())), 'no-sample'], // and with the trunk's Content.sample there
    ];
    for (const [call, code] of cases) await refused(call(), code);
    await tick();
    w.off();
    assert.equal(w.count, 0, 'no refused call notified the screens');
    assert.deepEqual(await snapshot(), before);
  });

  test('a throw inside commit leaves no partial rows', async () => {
    await someData();
    const before = await snapshot();
    const realId = E().id;
    let n = 0;
    E().id = () => { n += 1; if (n === 3) throw new Error('disk full'); return realId(); };
    try {
      await assert.rejects(Actions.sosSession({ kind: 'craving', ratingBefore: 5, ratingAfter: 1,
        tools: [{ skillId: 'ride-wave', helpful: true }, { skillId: 'call', helpful: true }] }), /disk full/);
    } finally { E().id = realId; }
    assert.ok(n >= 3, 'the throw came after the log row was put');
    assert.deepEqual(await snapshot(), before);
  });

  test('a locked store refuses writes and keeps them out', async () => {
    if (!S().lock || typeof S().lock.set !== 'function') return;
    await someData();
    await S().lock.set('2468', { autoLockMin: 5 });
    S().lock.lockNow();
    try {
      await refused(Actions.logCraving({ intensity: 4 }), 'LOCKED');
      await refused(Actions.sosSession({ kind: 'craving', ratingBefore: 4 }), 'LOCKED');
    } finally {
      assert.equal(await S().lock.unlock('2468'), true);
    }
    assert.equal(events('LogCreated').filter((e) => e.payload.type === 'craving').length, 2, 'only someData\'s two');
    await S().lock.remove('2468');
  });

  test('recoveryPlan confirm once', async () => {
    const r0 = await Actions.recoveryPlan.save({ warnings: { items: ['skipping meals'] } });
    assert.equal(r0.plan.confirmedAt, null);
    assert.equal(events('RecoveryPlanConfirmed').length, 0);
    await Actions.recoveryPlan.save({ warnings: { items: ['skipping meals', 'no sleep'] } }, { confirm: true });
    const first = S().view.get('recoveryPlan', 'plan');
    assert.match(first.confirmedAt, ISO_RE);
    await Actions.recoveryPlan.save({ warnings: { items: ['no sleep'] } }, { confirm: true });
    const second = S().view.get('recoveryPlan', 'plan');
    assert.equal(events('RecoveryPlanConfirmed').length, 1);
    assert.equal(second.confirmedAt, first.confirmedAt, 'the first confirmation stands');
    assert.deepEqual(second.sections, { warnings: { items: ['no sleep'] } });
  });

  test('contacts reached event', async () => {
    const c = await Actions.contacts.add({ name: ' Ravi ', role: 'sponsor', phone: '+91 98765 43210', note: 'evenings' });
    assert.deepEqual(S().view.get('contacts', c.id), c);
    assert.equal(c.name, 'Ravi');
    assert.equal(c.active, true);
    const r = await Actions.contacts.reached(c.id, 'call');
    assert.deepEqual(r.events.map((e) => [e.type, e.payload]), [['ContactReached', { contactId: c.id, how: 'call' }]]);
    await Actions.contacts.update(c.id, { phone: '98765 00000' });
    await Actions.contacts.deactivate(c.id);
    const row = S().view.get('contacts', c.id);
    assert.equal(row.active, false, 'deactivated, never deleted');
    assert.equal(row.phone, '98765 00000');
    await Actions.contacts.reached(c.id, 'text');
    assert.equal(events('ContactReached').length, 2);
    assert.equal(list('contacts').length, 1);
  });

  test('logs, check-ins and activities write their rows and events', async () => {
    const f = await Actions.logFeeling({ intensity: 6, emotion: C().emotions[0].id, feelings: ['tense'], skills: ['beat'] });
    assert.equal(f.log.type, 'feeling');
    assert.deepEqual(f.events.map((e) => e.type), ['LogCreated', 'SkillUsed']);
    const ci = await Actions.checkin('evening', { mood: 6, peakCraving: 4, used: false, sleep: 7.5, intention: 'walk after dinner' });
    assert.equal(ci.log.type, 'checkin');
    assert.equal(ci.log.checkin.kind, 'evening');
    assert.deepEqual(events('CheckinCompleted').map((e) => e.payload), [{ logId: ci.log.id, kind: 'evening' }]);
    const a = await Actions.logActivity({ kind: 'exercise', minutes: 20, name: 'walk', enjoyment: 7 });
    assert.deepEqual(events('ActivityDone').map((e) => e.payload), [{ kind: 'exercise', minutes: 20, logId: a.log.id }]);
    assert.equal(list('logs').length, 3);
    for (const l of list('logs')) assert.equal(l.drill, false);
  });

  test('lessons, checkpoints, responses, tutorials, reveals and tips', async () => {
    const m = firstModule();
    for (const l of m.lessons) { await Actions.completeLesson(l.id); await Actions.completeLesson(l.id); }
    assert.equal(events('LessonCompleted').length, m.lessons.length, 'once per lesson');
    await Actions.checkpoint(m.id, [1, 0, 2]);
    await Actions.checkpoint(m.id, [1, 1, 2]);
    assert.equal(events('CheckpointCompleted').length, 1);
    assert.deepEqual(events('ModuleCompleted').map((e) => e.payload), [{ moduleId: m.id }]);
    const d = await Actions.saveResponse('quick-reasons', { reasons: ['health'] }, { mode: 'tutorial', draft: true });
    assert.equal(d.events.length, 0, 'a draft earns nothing');
    const s = await Actions.saveResponse('quick-reasons', { reasons: ['health', 'family'] });
    const want = savedType('quick-reasons');
    assert.deepEqual(s.events.map((e) => [e.type, e.payload.exerciseId, e.payload.responseId]), want === null ? [] : [[want, 'quick-reasons', s.response.id]], 'RC17: a kind 3.7 does not name earns neither');
    assert.equal(list('responses').length, 2, 'append-only');
    await Actions.scriptUsed(s.response.id);
    assert.equal(events('ScriptUsed').length, 1);
    await Actions.tutorial.done('tour', { skipped: true });
    await Actions.tutorial.done('tour');
    await Actions.tutorial.replay('tour');
    assert.equal(events('TutorialCompleted').length, 1);
    assert.equal(S().view.get('tutorials', 'tour').replays, 1);
    const feature = Object.keys(C().features)[0];
    await Actions.reveal(feature);
    await Actions.reveal(feature, { seen: true });
    assert.equal(events('FeatureRevealed').length, 1);
    assert.match(S().view.get('reveals', feature).seenAt, ISO_RE);
    const tip = C().tips[0].id;
    await Actions.markTipShown(tip);
    assert.match(S().view.get('tips', tip).shownAt, ISO_RE);
    assert.equal(S().view.get('settings', 'app').lastTipDay, E().todayStr(new Date()));
    await Actions.recordEvent('MilestoneSeen', { milestone: 7 });
    await Actions.recordEvent('MilestoneSeen', { milestone: 7 });
    await Actions.recordEvent('MindfulMinute');
    assert.equal(events('MilestoneSeen').length, 1);
    assert.equal(events('MindfulMinute').length, 1);
  });

  test('plans, reviews, to-dos, motivation, predictions and quests', async () => {
    const p = await Actions.plans.add({ date: daysAgo(0), start: '18:00', end: '19:00', title: 'Wedding', kind: 'risky',
      battlePlan: { situation: 'drinks offered', plan: 'soda in hand', backups: ['call Ravi'], exit: 'leave by 9' } });
    assert.equal(p.plan.risky, true);
    assert.deepEqual(events('BattlePlanCreated').map((e) => e.payload), [{ planId: p.plan.id }]);
    await Actions.plans.update(p.plan.id, { end: '20:00' });
    await Actions.plans.debrief(p.plan.id, { usedPlan: true, how: 'left early' });
    await Actions.plans.debrief(p.plan.id, { usedPlan: true, how: 'left early, felt fine' });
    assert.equal(events('BattlePlanDebriefed').length, 1);
    assert.equal(S().view.get('plans', p.plan.id).debrief.how, 'left early, felt fine');
    const q = await Actions.plans.add({ date: daysAgo(0), start: '07:00', end: '07:30', title: 'Walk', kind: 'want' });
    await Actions.plans.remove(q.plan.id);
    assert.equal(list('plans').length, 1);
    await Actions.weeklyReview({ wins: 'two walks' });
    await Actions.weeklyReview({ wins: 'three walks' });
    assert.equal(events('WeeklyReviewCompleted').length, 1);
    const t = await Actions.todos.add({ text: 'Call the clinic' });
    await Actions.todos.done(t.id);
    assert.equal(S().view.get('todos', t.id).done, true);
    await Actions.todos.remove(t.id);
    assert.equal(list('todos').length, 0);
    await Actions.motivation.add({ stage: C().stages[1].id, score: 6, plusOne: 'my kids' });
    assert.equal(list('motivation').length, 1);
    const pr = await Actions.predictions.add({ activity: 'cricket', predicted: 3 });
    await Actions.predictions.complete(pr.id, { actual: 7 });
    assert.equal(S().view.get('predictions', pr.id).actual, 7);
    const quest = C().quests[0];
    for (const step of quest.steps) await Actions.quests.tick(quest.id, step.id);
    assert.match(S().view.get('quests', quest.id).completedAt, ISO_RE);
  });

  test('sample data loads marked and erases with everything else', async () => {
    const at = new Date().toISOString();
    const sample = { generate: (now) => ({ stores: { logs: [{ id: 'sample-1', type: 'craving', at: now, date: E().todayStr(now), hour: 9,
      intensity: 4, triggerIds: [], feelings: [], skills: [], drill: false }] } }) };
    await withSample(sample, async () => {
      const r = await Actions.loadSample();
      assert.equal(r.count, 1);
      assert.ok(S().view.get('meta', 'sample').loadedAt >= at.slice(0, 10));
      assert.equal(list('logs').length, 1);
      await Actions.eraseAll();
      assert.equal(S().view.get('meta', 'sample'), null);
      assert.equal(list('logs').length, 0);
    });
  });

  test('sample never overwrites the person\'s rows and erases only its own', async () => {
    await Actions.onboard({ name: 'Asha', startDate: daysAgo(5), substances: ['Alcohol'] });
    await Actions.recoveryPlan.save({ motivation: { items: ['my kids'] } }, { confirm: true });
    const mine = await Actions.logCraving({ intensity: 6, triggerIds: ['evening'], skills: [] });
    const before = { profile: S().view.get('profile', 'me'), settings: S().view.get('settings', 'app'),
      plan: S().view.get('recoveryPlan', 'plan'), log: S().view.get('logs', mine.log.id) };
    const row = (id, n) => ({ id, type: 'craving', at: n, date: E().todayStr(n), hour: 9, intensity: 2, triggerIds: [], feelings: [], skills: [], drill: false });
    const sample = { generate: (now) => ({ stores: {
      profile: [{ key: 'me', name: 'Sample person', startDate: daysAgo(90) }],
      settings: [{ key: 'app', theme: 'light', showCurrentRun: true }],
      recoveryPlan: [{ key: 'plan', sections: {} }],
      meta: [{ key: 'lock', salt: 'x', check: 'y' }],
      logs: [row(mine.log.id, now), row('sample-1', now)],
    } }) };
    await withSample(sample, async () => {
      const r = await Actions.loadSample();
      assert.equal(r.count, 1);
      assert.deepEqual(S().view.get('profile', 'me'), before.profile);
      assert.deepEqual(S().view.get('settings', 'app'), before.settings);
      assert.deepEqual(S().view.get('recoveryPlan', 'plan'), before.plan);
      assert.deepEqual(S().view.get('logs', mine.log.id), before.log);
      assert.equal(S().view.get('meta', 'lock'), null);
      assert.equal(S().view.get('logs', 'sample-1').sample, true);
      const eventsBefore = list('events').length;
      const e = await Actions.eraseSample();
      assert.equal(e.erased, 1);
      assert.equal(S().view.get('logs', 'sample-1'), null);
      assert.equal(S().view.get('meta', 'sample'), null);
      assert.deepEqual(S().view.get('logs', mine.log.id), before.log);
      assert.deepEqual(S().view.get('profile', 'me'), before.profile);
      assert.equal(list('events').length, eventsBefore);
    });
  });

  test('RS-SAMPLE: an onboarded profile and settings survive loadSample then eraseSample unchanged', async () => {
    await Actions.onboard({ name: 'Asha', startDate: daysAgo(5), substances: ['Alcohol'] });
    await Actions.settings.patch({ theme: 'dark' });
    const mine = { profile: S().view.get('profile', 'me'), settings: S().view.get('settings', 'app') };
    assert.ok(mine.profile && mine.settings && mine.profile.sample !== true && mine.settings.sample !== true);
    await withSample(TRUNK_SAMPLE, async () => {
      await Actions.loadSample();
      assert.deepEqual(S().view.get('profile', 'me'), mine.profile, 'loadSample leaves the own profile as it was');
      assert.deepEqual(S().view.get('settings', 'app'), mine.settings, 'and the own settings');
      assert.equal(S().view.get('logs', 'smp-log-1').sample, true, 'the rest of the sample loads');
      await Actions.eraseSample();
    });
    assert.deepEqual(S().view.get('profile', 'me'), mine.profile, 'eraseSample leaves the own profile as it was');
    assert.deepEqual(S().view.get('settings', 'app'), mine.settings, 'and the own settings');
    assert.equal(S().view.get('logs', 'smp-log-1'), null, 'the sample rows are gone');
  });

  test("RS-SAMPLE: a fresh notebook gets the sample profile, marked, and eraseSample takes it; the person's own acts over sample rows are theirs and stay", async () => {
    const tip = C().tips[0].id;
    await withSample(TRUNK_SAMPLE, async () => {
      await Actions.loadSample();
      const p = S().view.get('profile', 'me');
      assert.ok(p && p.name === 'Sample' && p.sample === true, 'a fresh store gets the sample profile, marked');
      assert.equal(S().view.get('settings', 'app').sample, true, 'and the sample settings, marked');
      await Actions.eraseSample();
      assert.equal(S().view.get('profile', 'me'), null, 'eraseSample takes the sample profile');
      assert.equal(S().view.get('settings', 'app'), null, 'and the sample settings');
      const acts = [ // [what, the act, the keyed rows it writes]
        ['onboarding', () => Actions.onboard({ name: 'Asha', startDate: daysAgo(3), substances: ['Alcohol'] }), [['profile', 'me'], ['settings', 'app']]],
        ['a settings change', () => Actions.settings.patch({ theme: 'dark' }), [['settings', 'app']]],
        ['a tip shown', () => Actions.markTipShown(tip), [['settings', 'app']]],
      ];
      for (const [what, act, rows] of acts) {
        await S().resetAll();
        await Actions.loadSample();
        await act();
        const kept = rows.map(([s, k]) => S().view.get(s, k));
        rows.forEach(([s], i) => assert.ok(kept[i] && kept[i].sample !== true, what + ': the ' + s + ' row is the person\'s own, not marked'));
        if (rows[0][0] === 'profile') {
          assert.equal(kept[0].name, 'Asha');
          assert.notEqual(kept[0].companion, 'Kite', what + ': nothing of the sample profile in it');
        }
        await Actions.eraseSample();
        rows.forEach(([s, k], i) => assert.deepEqual(S().view.get(s, k), kept[i], what + ': eraseSample keeps the ' + s + ' row'));
        assert.equal(S().view.get('logs', 'smp-log-1'), null, what + ': the sample rows are gone');
      }
    });
  });

  test('RC3: sample events never stand in for the person’s own once-only events', async () => {
    const lesson = firstModule().lessons[0].id;
    const ev = (id, type, payload) => ({ id, type, at: new Date().toISOString(), payload });
    const sample = { generate: () => ({ stores: { events: [ev('sample-e1', 'LessonCompleted', { lessonId: lesson }),
      ev('sample-e2', 'TutorialCompleted', { id: 'drill', skipped: false })] } }) };
    await withSample(sample, async () => {
      assert.equal((await Actions.loadSample()).count, 2);
      await Actions.completeLesson(lesson);
      await Actions.sosSession({ kind: 'craving', drill: true });
      await Actions.eraseSample();
    });
    assert.deepEqual(events('LessonCompleted').map((e) => e.payload.lessonId), [lesson], 'the person’s own lesson stays when the sample goes');
    assert.deepEqual(events('TutorialCompleted').map((e) => e.payload.id), ['drill'], 'and the drill mark');
  });

  test('RC9: a backup the engine calls not valid is refused, even with no reason given', async () => {
    await someData();
    const backup = await S().exportJson();
    const eng = E();
    const had = Object.prototype.hasOwnProperty.call(eng, 'validateBackup');
    const old = eng.validateBackup;
    eng.validateBackup = () => ({ ok: false, errors: [] });
    try { await refused(Actions.importBackup(backup), 'bad-backup'); } finally { if (had) eng.validateBackup = old; else delete eng.validateBackup; }
  });

  test('RC11: the last lesson completes its module even when the draft lists only the rows written before', async () => {
    const m = firstModule();
    const ids = m.lessons.map((l) => l.id);
    for (const id of ids.slice(0, -1)) await Actions.completeLesson(id);
    await Actions.checkpoint(m.id, [1, 0, 2]);
    assert.equal(events('ModuleCompleted').length, 0);
    const real = globalThis.Store;
    globalThis.Store = Object.assign(Object.create(real), {
      commit: (label, fn) => real.commit(label, (draft) => {
        const seen = {};
        return fn(Object.assign({}, draft, { list: (s) => (seen[s] = seen[s] || draft.list(s)) }));
      }),
    });
    try { await Actions.completeLesson(ids[ids.length - 1]); } finally { globalThis.Store = real; }
    assert.deepEqual(events('ModuleCompleted').map((e) => e.payload.moduleId), [m.id]);
  });

  test('RC12: an import never brings a lock row with it', async () => {
    await someData();
    const backup = await S().exportJson();
    backup.stores.meta = [...backup.stores.meta, { key: 'lock', salt: 'x', check: 'y' }];
    await Actions.importBackup(backup);
    assert.equal(S().view.get('meta', 'lock'), null);
    assert.ok(list('logs').length > 0, 'the rest came in');
  });

  test('RC13: an SOS slip session is always a use and logs the slip', async () => {
    const r = await Actions.sosSession({ kind: 'slip' });
    assert.equal(r.log.used, true);
    assert.equal(r.log.type, 'slip');
    assert.deepEqual(events('SosCompleted').map((e) => e.payload.outcome), ['used']);
    assert.equal(events('SlipLogged').length, 1);
    await refused(Actions.sosSession({ kind: 'slip', outcome: 'passed' }), 'bad-session');
  });

  // -- fix round: U-09 tests above this line --
});

/* ── stand-ins, used only while the real file is absent ─────────────────────────────────────── */
function storesMap() {
  return { profile: 'key', settings: 'key', meta: 'key', events: 'id', logs: 'id', responses: 'id', contacts: 'id', plans: 'id', todos: 'id',
    motivation: 'id', predictions: 'id', quests: 'id', tutorials: 'id', reveals: 'id', tips: 'id', recoveryPlan: 'key' };
}

function engineStandIn() {
  const pad = (n) => String(n).padStart(2, '0');
  const DAY = /^\d{4}-\d{2}-\d{2}$/;
  const dateStr = (x) => {
    if (typeof x === 'string' && DAY.test(x)) return x;
    const d = x instanceof Date ? x : new Date(x);
    return isNaN(d) ? '' : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const utc = (s) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  const addDays = (s, n) => { const t = new Date(utc(s) + n * 86400000); return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`; };
  const daysBetween = (a, b) => Math.round((utc(b) - utc(a)) / 86400000);
  let n = 0;
  return {
    STORES: storesMap(),
    id: () => `t${Date.now().toString(36)}-${(n += 1).toString(36)}`,
    todayStr: (now) => dateStr(now === undefined ? new Date() : now),
    dateStr,
    addDays,
    daysBetween,
    hourOf: (iso) => new Date(iso).getHours(),
    weekStart: (s) => addDays(s, -((new Date(utc(s)).getUTCDay() + 6) % 7)),
    /* contract engine.md: total counts completed dates and never falls; only `current` restarts after a slip */
    counters(profile, items, now) {
      const today = dateStr(now);
      const start = profile && profile.startDate ? dateStr(profile.startDate) : '';
      const ms = (globalThis.Content.milestones || []).slice().sort((a, b) => a - b);
      if (!start) return { tracking: false, total: 0, current: 0, nextMilestone: null, reached: [] };
      const slips = new Map();
      for (const it of items || []) {
        const date = it && it.type === 'SlipLogged' ? it.payload && it.payload.date : it && it.type === 'slip' ? it.date : '';
        if (!date) continue;
        const knownOn = dateStr(it.at) || today;
        if (!slips.has(date) || knownOn < slips.get(date)) slips.set(date, knownOn);
      }
      let total = Math.max(0, daysBetween(start, today));
      let last = '';
      for (const [d, knownOn] of slips) {
        if (d >= start && d < today && knownOn <= d) total -= 1;
        if (d >= start && d <= today && d > last) last = d;
      }
      total = Math.max(0, total);
      const current = Math.max(0, daysBetween(last ? addDays(last, 1) : start, today));
      const next = ms.find((m) => m > total);
      return { tracking: true, total, current, nextMilestone: next === undefined ? null : next, reached: ms.filter((m) => m <= total) };
    },
  };
}

function storeStandIn() {
  const STORES = storesMap();
  const clone = (x) => structuredClone(x);
  const empty = () => Object.fromEntries(Object.keys(STORES).map((s) => [s, new Map()]));
  const lockedError = () => Object.assign(new Error('The notebook is locked.'), { code: 'LOCKED' });
  const known = (s) => { if (!Object.prototype.hasOwnProperty.call(STORES, s)) throw new Error(`unknown store ${s}`); return s; };
  let data = empty();
  let lastSavedAt = null;
  let pin = null;
  let locked = false;
  let depth = 0;
  let pending = false;
  const subs = new Set();
  const lockSubs = new Set();
  function notify(label) {
    if (depth) { pending = true; return; }
    for (const fn of subs) fn({ label }); // as the real Store: a subscriber gets { label } (C2)
  }
  function fromBackup(obj) {
    const next = empty();
    for (const [s, rows] of Object.entries((obj && obj.stores) || {})) for (const r of rows) next[known(s)].set(r[STORES[s]], clone(r));
    return next;
  }
  return {
    STORES,
    view: {
      get: (s, id) => (locked || !data[known(s)].has(id) ? null : clone(data[s].get(id))),
      list: (s) => (locked ? [] : [...data[known(s)].values()].map(clone)),
      count: (s) => (locked ? 0 : data[known(s)].size),
    },
    async load() {},
    async commit(label, fn) {
      if (locked) throw lockedError();
      const work = Object.fromEntries(Object.entries(data).map(([s, m]) => [s, new Map(m)]));
      const draft = {
        get: (s, id) => (work[known(s)].has(id) ? clone(work[s].get(id)) : null),
        list: (s) => [...work[known(s)].values()].map(clone),
        put(s, row) {
          const key = row && row[STORES[known(s)]];
          if (typeof key !== 'string' || !key) throw new Error(`a ${s} row without its ${STORES[s]}`);
          work[s].set(key, clone(row));
        },
        del: (s, id) => { work[known(s)].delete(id); },
      };
      const out = fn(draft); // a throw here leaves `data` as it was: the working set is rolled back
      data = work;
      lastSavedAt = new Date().toISOString();
      notify();
      return out;
    },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
    async bulk(fn) {
      depth += 1;
      try { return await fn(); } finally { depth -= 1; if (!depth && pending) { pending = false; notify(); } }
    },
    status: () => ({ persistence: 'memory', lastSavedAt, hasLock: pin !== null, locked }),
    exportJson() {
      if (locked) throw lockedError();
      return { app: '1-addic', schemaVersion: 1, exportedAt: new Date().toISOString(),
        stores: Object.fromEntries(Object.entries(data).map(([s, m]) => [s, [...m.values()].map(clone)])) };
    },
    async replaceAll(obj) {
      if (locked) throw lockedError();
      data = fromBackup(obj);
      lastSavedAt = new Date().toISOString();
      notify('replaceAll');
    },
    async resetAll() { data = empty(); pin = null; locked = false; lastSavedAt = null; notify('resetAll'); },
    lock: {
      async set(p) { const s = String(p); if (s.length < 4 || s.length > 64) throw Object.assign(new Error('A PIN has 4 to 64 characters.'), { code: 'BAD_PIN' }); pin = s; },
      async unlock(p) { if (pin !== null && String(p) === pin) { locked = false; notify(); return true; } return false; }, // the real Store notifies 'unlock'
      async verify(p) { return pin !== null && String(p) === pin; },
      async remove(p) { if (pin !== null && String(p) === pin) { pin = null; locked = false; return true; } return false; },
      lockNow() { if (pin !== null) { locked = true; for (const fn of lockSubs) fn({ reason: 'manual' }); } },
      touch() {},
      onLock(fn) { lockSubs.add(fn); return () => lockSubs.delete(fn); },
    },
  };
}

// ── U-10: the SOS screens' pure parts (offline/src/ui-sos.js loads in Node without UI or a DOM) ──────────────────
describe('sos screens (U-10)', () => {
  const H = require(src('ui-sos.js'));
  const SOS_SRC = readFileSync(src('ui-sos.js'), 'utf8');
  before(async () => { if (typeof S().load === 'function') await S().load(); });
  beforeEach(async () => { await S().resetAll(); });

  test('urgent list: India first, every number a tel link with please verify, then the international list', () => {
    const m = H.urgentList('in', C());
    assert.equal(m.region, 'in');
    assert.deepEqual(m.sections.map((s) => s.id), ['in', 'intl']);
    const india = m.sections[0];
    const want = [...C().resources.in.emergency, ...C().resources.in.crisis].map((x) => x.number);
    assert.deepEqual(india.items.map((i) => i.number), want, 'emergency then crisis, all from Content.resources');
    assert.equal(india.items[0].number, '112');
    for (const i of india.items) {
      assert.match(i.tel, /^tel:\+?[0-9]+$/, i.name);
      assert.equal(i.verify, true, i.name + ' carries verify');
    }
    assert.equal(H.telHref('1800-891-4416'), 'tel:18008914416');
    assert.equal(H.telHref('+91 9999 666 555'), 'tel:+919999666555');
    assert.equal(india.verifyNote, C().resources.in.verifyNote);
    assert.ok(m.sections[1].items.length >= 3 && m.sections[1].items.every((i) => i.verify === true));
    assert.ok(m.overdose.length >= 3 && m.withdrawal.length >= 2, 'overdose and withdrawal steps from Content');
  });

  test('urgent list: intl region leads with the international list; anything else means India', () => {
    assert.deepEqual(H.urgentList('intl', C()).sections.map((s) => s.id), ['intl', 'in']);
    assert.equal(H.urgentList(undefined, C()).region, 'in');
    assert.equal(H.urgentList('xx', C()).region, 'in');
    const bare = H.urgentList('in', {});
    assert.deepEqual(bare.sections.map((s) => s.items.map((i) => i.number)), [['112']], 'no Content: only the built-in emergency number (Q-BUILTIN), no throw');
  });

  test('crisis routing: hopeless and crisis words go to the numbers at once', () => {
    assert.equal(H.isCrisisEmotion('hopeless', C()), true);
    for (const id of ['angry', 'sad', 'anxious', 'other', 'nope']) assert.equal(H.isCrisisEmotion(id, C()), false, id);
    for (const t of ['I want to die', 'thinking about suicide', 'better off dead', 'I might kill myself']) assert.equal(H.isCrisisText(t, null), true, t);
    for (const t of ['', 'tired and bored', 'I am angry at work']) assert.equal(H.isCrisisText(t, null), false, t);
    assert.equal(H.isCrisisText('a quiet phrase', { crisisKeywords: (s) => s.includes('quiet') }), true, 'Engine.crisisKeywords is used when present');
    assert.equal(H.isCrisisText('I want to die', { crisisKeywords: () => false }), true, 'the in-file list still applies: never fewer');
  });

  test('outcome and session payloads match Actions.sosSession', async () => {
    assert.equal(H.outcomeFrom(7, 3, false), 'passed');
    assert.equal(H.outcomeFrom(5, 6, false), 'still');
    assert.equal(H.outcomeFrom(5, 0, false), 'passed');
    assert.equal(H.outcomeFrom(null, null, false), 'passed');
    assert.equal(H.outcomeFrom(2, 9, true), 'used');
    const p = H.sessionFrom({ kind: 'craving', ratingBefore: 8, ratingAfter: 2, delays: 1, risky: true,
      tools: [{ skillId: 'ride-wave', helpful: false }, { skillId: 'ride-wave', helpful: true }, { skillId: 'reasons', helpful: false }] });
    assert.deepEqual(p.tools, [{ skillId: 'ride-wave', helpful: true }, { skillId: 'reasons', helpful: false }]);
    assert.equal(p.outcome, 'passed');
    const r = await Actions.sosSession(p);
    assert.equal(r.log.sos.delays, 1);
    assert.equal(events('SkillUsed').length, 2);
    assert.equal(events('SosCompleted')[0].payload.outcome, 'passed');
    const skills = new Set(C().skills.map((s) => s.id));
    for (const t of H.TOOLS) assert.ok(skills.has(t.skillId), t.id + ' credits a known skill');
    for (const k of Object.keys(H.FEEL_SKILLS)) assert.ok(skills.has(H.FEEL_SKILLS[k]), k);
    const used = H.sessionFrom({ kind: 'craving', ratingBefore: 6, used: true });
    assert.equal(used.outcome, 'used');
    await Actions.sosSession(used);
    assert.equal(events('SlipLogged').length, 1, 'used: the slip is logged by the session itself');
  });

  test('sos drill payload writes no log', async () => {
    const p = H.sessionFrom({ kind: 'craving', ratingBefore: 6, ratingAfter: 2, drill: true, tools: [{ skillId: 'ride-wave', helpful: true }] });
    assert.equal(p.drill, true);
    await Actions.sosSession(p);
    await Actions.sosSession(p);
    assert.equal(list('logs').length, 0);
    assert.equal(events('SkillUsed').length + events('SosCompleted').length + events('LogCreated').length, 0);
    assert.equal(events('TutorialCompleted').length, 1);
  });

  test('routes: hub, flows, drill, preview', () => {
    const r = (path, query) => H.parseSos({ parts: path.split('/').filter(Boolean), query: query || {} });
    assert.deepEqual(r('sos'), { flow: 'hub', drill: false, preview: false, logged: false, kept: false });
    assert.equal(r('sos/slip', { kept: '1' }).kept, true, 'RS21: kept for the unlock');
    assert.equal(r('sos', { drill: '1' }).flow, 'craving');
    assert.equal(r('sos', { drill: '1' }).drill, true);
    assert.equal(r('sos/craving').drill, false);
    assert.equal(r('sos/feeling').flow, 'feeling');
    assert.equal(r('sos/slip', { preview: '1' }).preview, true);
    assert.equal(r('sos/slip', { logged: '1' }).logged, true);
    assert.equal(r('sos/urgent').flow, 'urgent');
    assert.equal(r('sos/what').flow, 'hub');
    assert.equal(H.parseSos(undefined).flow, 'hub');
  });

  test('the person’s lists: reasons, contacts, spiral replies, guide order, plan only when confirmed', async () => {
    const view = S().view;
    assert.deepEqual(H.reasonsFrom(view, null), []);
    await Actions.saveResponse('quick-reasons', { reasons: ['my health', 'my kids'] });
    assert.deepEqual(H.reasonsFrom(view, null), ['my health', 'my kids']);
    const a = await Actions.contacts.add({ name: 'Ravi', role: 'safetyNet', phone: '+91 98765 43210' });
    await Actions.contacts.add({ name: 'No phone', role: 'safetyNet' });
    assert.deepEqual(H.activeContacts(view).map((x) => x.id), [a.id]);
    await Actions.contacts.deactivate(a.id);
    assert.equal(H.activeContacts(view).length, 0, 'an inactive contact is not offered');
    const pairs = H.spiralPairs(view, null, C());
    assert.equal(pairs.length, C().catalogs.spiral.filter((t) => !/hopeless/i.test(t) && !H.isCrisisText(t, null)).length, 'RS9 skips some');
    assert.ok(pairs.every((p) => p.thought && p.reply), 'every thought has a reply');
    assert.equal(pairs[0].reply, H.FALLBACK.spiralReply);
    assert.deepEqual(H.spiralPairs(view, { spiralThoughts: () => [{ thought: 'mine', reply: 'my answer' }] }, C()), [{ thought: 'mine', reply: 'my answer' }]);
    assert.deepEqual(H.guideOrder(view, null), ['wave', 'why', 'distract']);
    assert.deepEqual(H.guideOrder(view, { sos: { guideSequence: () => ['distract', 'bogus', 'wave'] } }), ['distract', 'wave']);
    assert.equal(H.planFor(view), null);
    await Actions.recoveryPlan.save({ motivation: { items: ['my kids'] } }, { confirm: false });
    assert.equal(H.planFor(view), null, 'a draft plan is not shown in SOS');
    await Actions.recoveryPlan.save({ motivation: { items: ['my kids'] } }, { confirm: true });
    assert.deepEqual(H.planSections(H.planFor(view)), [{ id: 'motivation', items: ['my kids'] }]);
    assert.ok(H.soberSteps(C()).length === 5 && H.deckFrom(view, null, C()).length > 3 && H.comebacksFrom(view, null).length > 0);
  });

  test('RC1: Talk back shows the reply, never the craving thought; the reasons card is read in full', () => {
    const view = S().view;
    const eng = {
      comebacks: () => [{ thought: 'I need it now', response: 'I want it. I do not need it.', at: '2026-11-07T09:00:00.000Z' }, 'A plain line'],
      reasonsCard: () => ({ quick: ['my health'], drawbacks: ['the arguments'], benefits: [{ text: 'more money' }], different: ['mornings with my kids'] }),
    };
    assert.deepEqual(H.comebacksFrom(view, eng), ['I want it. I do not need it.', 'A plain line']);
    assert.deepEqual(H.reasonsFrom(view, eng), ['my health', 'the arguments', 'more money', 'mornings with my kids']);
    assert.deepEqual(H.comebacksFrom(view, { comebacks: () => ['one', 'two'] }), ['one', 'two'], 'a list of strings (engine.md) still works');
    assert.deepEqual(H.reasonsFrom(view, { reasonsCard: () => ['a', 'b'] }), ['a', 'b']);
    assert.deepEqual(H.comebacksFrom(view, { comebacks: () => [{ thought: 'only a thought' }] }), H.FALLBACK.talkback, 'a thought with no reply is never shown');
  });

  test('wave timer counts 15 minutes down and never below zero', () => {
    assert.equal(H.WAVE_MIN, 15);
    assert.equal(H.clock(900), '15:00');
    assert.equal(H.clock(61), '1:01');
    assert.equal(H.remaining(0, 0), 900);
    assert.equal(H.remaining(0, 65 * 1000), 835);
    assert.equal(H.remaining(0, 3600 * 1000), 0);
  });

  test('sos copy: one title and at most one short line per screen, person-first', () => {
    for (const [k, v] of Object.entries(H.COPY)) {
      if (k === 'clinicalReview') continue;
      if (typeof v === 'string') { assert.ok(v.length <= 60, k); continue; }
      assert.ok(v.title && v.title.length <= 40, k + ' title');
      for (const f of ['line', 'empty', 'none', 'drill']) if (v[f]) assert.ok(v[f].length <= 70, `${k}.${f} is short`);
    }
    assert.equal(H.COPY.clinicalReview, true);
    assert.equal(H.FALLBACK.clinicalReview, true);
    for (const t of [...H.FALLBACK.sober, ...H.FALLBACK.talkback, H.FALLBACK.spiralReply]) assert.ok(t.length <= 60, t);
    assert.doesNotMatch(SOS_SRC, /\baddicts?\b/i);
  });

  test('sos is never gated and makes no network call', () => {
    assert.doesNotMatch(SOS_SRC, /https?:\/\//, 'no web address in the file');
    assert.doesNotMatch(SOS_SRC, /\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|innerHTML|console\.log/);
    assert.doesNotMatch(SOS_SRC, /UI\.confirm|UI\.tour|lock\.(unlock|verify|set)|onboardedAt|markTipShown/, 'no PIN, tour, tip or confirm inside SOS');
    assert.match(SOS_SRC, /data-tour': o\.tour|'data-tour'/);
    for (const name of ['sos-urgent', 'sos-craving']) assert.match(SOS_SRC, new RegExp(`'data-tour': '${name}'`), name + ' tour target');
  });
});

// ── U-10: in a browser each part is its own classic script, so Content and Engine are const globals, not globalThis properties ──
describe('sos screens read const globals like a browser (U-10)', () => {
  test('ui-sos finds Content and Engine declared by other scripts', () => {
    const vm = require('node:vm');
    const ctx = vm.createContext({});
    vm.runInContext('var module = { exports: {} };', ctx);
    vm.runInContext(readFileSync(src('content-core.js'), 'utf8').replace(/if \(typeof module[^\n]*\n?/g, ''), ctx, { filename: 'content-core.js' });
    vm.runInContext('const Engine = { crisisKeywords: (s) => s === "only the engine knows" };', ctx);
    vm.runInContext(readFileSync(src('ui-sos.js'), 'utf8'), ctx, { filename: 'ui-sos.js' });
    assert.equal(vm.runInContext('typeof globalThis.Content', ctx), 'undefined', 'the test scope is browser-like');
    assert.equal(vm.runInContext('module.exports.isCrisisEmotion("hopeless")', ctx), true);
    assert.equal(vm.runInContext('module.exports.isCrisisText("only the engine knows")', ctx), true);
    assert.equal(vm.runInContext('module.exports.soberSteps(Content).length', ctx), 5);
  });
});

// ── fix round (2026-11-07): the SOS flows themselves, run in Node in a small stand-in DOM (UI.h builds plain nodes; a tap calls the handler) ──
function sosDom(opts) {
  const o = opts || {};
  const vm = require('node:vm');
  const go = [];
  const replaced = [];
  const docOn = {};
  const toasts = [];
  class N {
    constructor(tag) {
      this.tag = tag; this.nodeType = tag === '#text' ? 3 : 1; this.kids = []; this.parent = null; this.own = '';
      this.attrs = {}; this.dataset = {}; this.style = {}; this.on = {}; this.disabled = false; this.value = '';
    }
    get isConnected() { let n = this; while (n.parent) n = n.parent; return n === body; }
    get textContent() { return [this.own, ...this.kids.map((k) => k.textContent)].join(' '); }
    set textContent(v) { for (const k of this.kids) k.parent = null; this.kids = []; this.own = String(v); }
    appendChild(c) { if (c.parent) c.remove(); c.parent = this; this.kids.push(c); return c; }
    replaceChildren(...cs) { this.textContent = ''; for (const c of cs) if (c != null) this.appendChild(c); }
    remove() { if (this.parent) { this.parent.kids = this.parent.kids.filter((k) => k !== this); this.parent = null; } }
    setAttribute(k, v) { this.attrs[k] = String(v); }
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null; }
    addEventListener(type, fn) { (this.on[type] = this.on[type] || []).push(fn); }
    focus() { doc.activeElement = this; } // RS30: a test reads what has the focus
    select() {}
    matches(sel) {
      if (sel.startsWith('.')) return String(this.attrs.class || '').split(' ').includes(sel.slice(1));
      const m = /^\[data-([a-z-]+)(?:="([^"]*)")?\]$/.exec(sel);
      if (!m) return this.tag === sel;
      const k = m[1].replace(/-([a-z])/g, (x, ch) => ch.toUpperCase());
      return Object.prototype.hasOwnProperty.call(this.dataset, k) && (m[2] === undefined || this.dataset[k] === m[2]);
    }
    querySelectorAll(sel) {
      const out = [];
      const walk = (n) => { for (const k of n.kids) { if (k.nodeType === 1 && k.matches(sel)) out.push(k); walk(k); } };
      walk(this);
      return out;
    }
    querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
    click() { if (!this.disabled) for (const fn of this.on.click || []) fn({ preventDefault() {} }); }
  }
  const text = (s) => { const t = new N('#text'); t.own = String(s); return t; };
  function h(tag, attrs, ...children) {
    const n = new N(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') { const c = Array.isArray(v) ? v.filter(Boolean).join(' ') : String(v); if (c) n.attrs.class = c; }
      else if (k === 'text') n.textContent = String(v);
      else if (k === 'dataset') { for (const d of Object.keys(v)) if (v[d] != null) n.dataset[d] = String(v[d]); }
      else if (k === 'style') Object.assign(n.style, v);
      else if (/^on[A-Z]/.test(k) && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'value' || k === 'disabled' || k === 'hidden') n[k] = v;
      else n.attrs[k] = v === true ? '' : String(v);
    }
    const add = (c) => {
      if (c == null || c === false || c === true) return;
      if (Array.isArray(c)) c.forEach(add);
      else if (typeof c === 'object' && typeof c.nodeType === 'number') n.appendChild(c);
      else n.appendChild(text(c));
    };
    children.forEach(add);
    return n;
  }
  const body = new N('body');
  const UI = { h, pages: {}, go: (r, op) => { go.push(r); if (op && op.replace) replaced.push(r); }, toast: (m, tone) => { toasts.push([m, tone]); }, speak: () => false, stopSpeaking: () => {} };
  const doc = { body, title: '', createElement: (t) => new N(t), createTextNode: text, documentElement: { hasAttribute: () => false },
    addEventListener: (t, fn) => { (docOn[t] = docOn[t] || []).push(fn); } };
  const ctx = vm.createContext({ UI, document: doc, navigator: {}, crypto: o.crypto, localStorage: o.localStorage,
    setInterval: () => 0, clearInterval: () => {}, setTimeout, Date, Content: C(), Store: o.store || S(), module: { exports: {} } }); // Date: the pinned clock, one clock as in a browser (RC16)
  vm.runInContext(readFileSync(src('ui-sos.js'), 'utf8'), ctx, { filename: 'ui-sos.js' });
  if (o.onboarding) vm.runInContext(readFileSync(src('ui-onboarding.js'), 'utf8'), ctx, { filename: 'ui-onboarding.js' });
  const byId = (root, id) => {
    const n = root.querySelector(`[data-testid="${id}"]`);
    if (!n) throw new Error(`no ${id} on: ${root.textContent.slice(0, 160)}`);
    return n;
  };
  const button = (root, label) => {
    const b = root.querySelectorAll('button').find((x) => x.textContent.trim() === label);
    if (!b) throw new Error(`no "${label}" button on: ${root.textContent.slice(0, 160)}`);
    return b;
  };
  return {
    UI, go, replaced, toasts, byId, docOn, doc,
    fire: (type, detail) => { for (const fn of docOn[type] || []) fn({ type, detail }); },
    onb(c) {
      const root = UI.pages.onboarding(Object.assign({ A: Actions, settings: {} }, c));
      body.replaceChildren(root);
      return root;
    },
    tap: (root, label) => button(root, label).click(),
    tapId: (root, id) => byId(root, id).click(),
    rate: (root, n) => byId(root, 'sos-rating').querySelectorAll('button')[n].click(),
    open(parts, query, A) {
      const root = UI.pages.sos({ route: { parts, query: query || {} }, A: A || Actions, view: S().view, E: null,
        profile: S().view.get('profile', 'me') || {} });
      body.replaceChildren(root);
      return root;
    },
    // the feeling flow's calm path, tapped through to its closing rating
    toRating(root) {
      for (let k = 0; !root.querySelector('[data-testid="sos-rating"]'); k += 1) {
        assert.ok(k < 30, 'the closing rating comes');
        const b = root.querySelectorAll('button').find((x) => ['Next', 'Done'].includes(x.textContent.trim()));
        assert.ok(b, 'a way on from: ' + root.textContent.slice(0, 160));
        b.click();
      }
    },
    calm: () => C().emotions.find((e) => e && e.crisisCheck !== true && e.id !== 'other' && e.tools !== 'anger').id,
    settle: async () => { for (let k = 0; k < 5; k += 1) await new Promise((r) => setTimeout(r, 2)); },
  };
}

describe('sos flows in a stand-in DOM (fix round)', () => {
  before(async () => { if (typeof S().load === 'function') await S().load(); });
  beforeEach(async () => { await S().resetAll(); });

  test('RS1: the crisis view shows the numbers at once and says little else', () => {
    const d = sosDom();
    const crisis = d.UI.sosUrgentView({}, { crisis: true });
    assert.ok(crisis.querySelector('[data-testid="urgent-number-1"]'), 'the first number is there');
    assert.ok(crisis.querySelectorAll('[data-testid="urgent-verify"]').length > 0, 'please verify still shows');
    assert.equal(crisis.querySelectorAll('details').length, 0, 'no overdose or withdrawal reading in a crisis');
    assert.equal(d.UI.sosUrgentView({}, {}).querySelectorAll('details').length, 2, 'the urgent page keeps both');
    const root = d.open(['sos', 'feeling']);
    d.tapId(root, 'sos-feeling-' + C().emotions.find((e) => e && e.crisisCheck === true).id);
    const shown = d.byId(root, 'sos-crisis');
    assert.equal(shown.querySelectorAll('details').length, 0);
    assert.ok(shown.querySelector('[data-testid="urgent-number-1"]'));
  });

  test('RC4: a feeling session is one verb, rated or not, and keeps the feeling', async () => {
    const d = sosDom();
    const id = d.calm();
    for (const n of [4, null]) {
      const root = d.open(['sos', 'feeling']);
      d.tapId(root, 'sos-feeling-' + id);
      d.toRating(root);
      if (n === null) d.tap(root, 'Skip'); else d.rate(root, n);
      await d.settle();
    }
    assert.deepEqual(events('SosCompleted').map((e) => [e.payload.kind, e.payload.ratingAfter]), [['feeling', 4], ['feeling', null]]);
    assert.deepEqual(list('logs').map((l) => l.emotion), [id, id], 'the feeling is kept on both paths');
    assert.deepEqual(d.toasts.filter((t) => t[1] === 'warn'), []);
    await refused(Actions.sosSession({ kind: 'feeling', emotion: 'no-such-feeling' }), 'bad-session');
  });

  test('RC2: a second tap while the save runs writes nothing more', async () => {
    const d = sosDom();
    let root = d.open(['sos', 'craving']);
    d.tap(root, 'Skip');
    d.tap(root, 'Check in with the craving');
    d.tapId(root, 'sos-reassess-passed');
    const no = d.byId(root, 'sos-used-no');
    no.click(); no.click();
    await d.settle();
    assert.equal(list('logs').length, 1, 'one craving log for one session');
    assert.equal(events('SosCompleted').length, 1);
    root = d.open(['sos', 'feeling']);
    d.tapId(root, 'sos-feeling-' + d.calm());
    d.toRating(root);
    const four = d.byId(root, 'sos-rating').querySelectorAll('button')[4];
    four.click(); four.click();
    await d.settle();
    assert.equal(list('logs').length, 2, 'one feeling log for one session');
    assert.equal(events('SosCompleted').length, 2);
    root = d.open(['sos', 'slip']);
    d.tapId(root, 'sos-slip-continue');
    d.tapId(root, 'sos-slip-safe');
    d.tap(root, 'Continue');
    d.tap(root, 'Done');
    const todo = d.byId(root, 'sos-slip-todo');
    todo.click(); todo.click();
    await d.settle();
    assert.equal(list('todos').length, 1, 'one to-do for one tap');
    assert.deepEqual(d.toasts.filter((t) => t[1] === 'warn'), [], 'every save went through');
  });

  test('RC5: It passed is what the session records', async () => {
    const d = sosDom();
    const root = d.open(['sos', 'craving']);
    d.rate(root, 6);
    d.tap(root, 'Check in with the craving');
    d.rate(root, 6);
    d.tapId(root, 'sos-reassess-passed');
    d.tapId(root, 'sos-used-no');
    await d.settle();
    assert.deepEqual(events('SosCompleted').map((e) => [e.payload.outcome, e.payload.ratingBefore, e.payload.ratingAfter]), [['passed', 6, 6]]);
    assert.match(root.textContent, /Wave surfed/);
    const again = d.open(['sos', 'craving']);
    d.tap(again, 'Skip');
    d.tap(again, 'Check in with the craving');
    d.tapId(again, 'sos-reassess-passed');
    d.tapId(again, 'sos-used-yes');
    await d.settle();
    assert.deepEqual(events('SosCompleted').map((e) => e.payload.outcome), ['passed', 'used'], 'a use after It passed is saved as used');
    assert.equal(events('SlipLogged').length, 1);
    assert.deepEqual(d.go, ['#/sos/slip?logged=1']);
    assert.equal(d.UI.sosHelpers.sessionFrom({ kind: 'craving', outcome: 'passed', used: true }).outcome, 'used');
    assert.deepEqual(d.toasts.filter((t) => t[1] === 'warn'), []);
  });

  test('RC6: a lock inside SOS hides the person’s rows at once, the flow goes on, nothing navigates', async () => {
    const d = sosDom();
    await Actions.saveResponse('quick-reasons', { reasons: ['my health'] });
    await Actions.contacts.add({ name: 'Ravi', role: 'safetyNet', phone: '+91 98765 43210' });
    await Actions.recoveryPlan.save({ motivation: { items: ['my kids'] } }, { confirm: true });
    await S().lock.set('2468');
    const hub = d.open(['sos']);
    assert.match(hub.textContent, /my kids/);
    S().lock.lockNow();
    assert.doesNotMatch(hub.textContent, /my kids/, 'My plan is hidden');
    assert.match(hub.textContent, /Locked/);
    assert.ok(await S().lock.unlock('2468'));
    for (const [tool, own] of [['why', /my health/], ['call', /Ravi/]]) {
      const root = d.open(['sos', 'craving']);
      d.tap(root, 'Skip');
      d.tapId(root, 'sos-tool-' + tool);
      assert.match(root.textContent, own, tool);
      S().lock.lockNow();
      assert.doesNotMatch(root.textContent, own, tool + ': hidden while locked');
      d.tap(root, 'Done');
      assert.match(root.textContent, /Did that help/, 'the flow goes on');
      assert.ok(await S().lock.unlock('2468'));
    }
    assert.deepEqual(d.go, [], 'a lock never moves the person out of SOS');
  });

  // -- fix round: stand-in DOM tests above this line --
});

// ── U-11: the lock screen and onboarding, their pure parts (offline/src/ui-onboarding.js loads in Node) ─────────────
describe('lock screen and onboarding (U-11)', () => {
  const O = require(src('ui-onboarding.js'));
  const SOS = require(src('ui-sos.js'));
  const ONB_SRC = readFileSync(src('ui-onboarding.js'), 'utf8');
  before(async () => { if (typeof S().load === 'function') await S().load(); });
  beforeEach(async () => { await S().resetAll(); });
  const fullAnswers = () => ({
    earlyNoticeSeen: true, discreet: true, substances: ['Alcohol'], substanceOther: 'Gutka', term: 'clean', startDate: daysAgo(3), notSure: false,
    stage: 'preparation', score: 7, medical: { heavyDaily: true, sedatives: false, opioids: false },
    reasons: ['my health', '', 'my daughter'], contact: { name: 'Ravi', phone: '+91 98765 43210' }, region: 'intl',
    checkin: { morning: '07:30', evening: '21:00' }, reviewDay: 0, pace: 'steady',
  });

  test('onboarding has eight steps and only the safety notice cannot be skipped', () => {
    assert.deepEqual(O.STEPS.map((s) => s.n), [1, 2, 3, 4, 5, 6, 7, 8]);
    assert.deepEqual(O.STEPS.filter((s) => !s.skip).map((s) => s.id), ['safety']);
    for (const s of O.STEPS) assert.ok(O.COPY.steps[s.id].title && O.COPY.steps[s.id].line.length <= 80, s.id);
    assert.match(ONB_SRC, /testid: 'onb-safety-ok'/);
    assert.match(ONB_SRC, /step\.id === 'safety'\) \{\n\s*nav = \[btn\(COPY\.safetyOk/, 'the safety step offers "I understand" and no Skip');
  });

  test('onboarding full writes the profile, settings, reasons, contact and motivation', async () => {
    const r = await O.finishOnboarding(Actions, fullAnswers(), C());
    assert.equal(r.ok, true);
    assert.deepEqual(r.errors, []);
    const me = S().view.get('profile', 'me');
    assert.equal(me.locale, 'en');
    assert.equal(me.region, 'intl');
    assert.deepEqual(me.substances, ['Alcohol', 'Gutka']);
    assert.equal(me.term, 'clean');
    assert.equal(me.stage, 'preparation');
    assert.deepEqual(me.checkin, { morning: '07:30', evening: '21:00' });
    assert.equal(me.medical.heavyDaily, true);
    assert.ok(me.onboardedAt);
    const set = S().view.get('settings', 'app');
    assert.equal(set.discreet, true);
    assert.equal(set.earlyNoticeSeen, true);
    assert.equal(events('OnboardingCompleted').length, 1);
    const resp = list('responses').filter((x) => x.exerciseId === 'quick-reasons');
    assert.deepEqual(resp[0].payload.reasons, ['my health', 'my daughter']);
    assert.deepEqual(list('contacts').map((x) => [x.name, x.role, x.active]), [['Ravi', 'safetyNet', true]]);
    assert.deepEqual(list('motivation').map((x) => [x.stage, x.score]), [['preparation', 7]]);
    assert.deepEqual(SOS.reasonsFrom(S().view, null), ['my health', 'my daughter'], 'SOS day 1: Remind me why has the reasons');
  });

  test('onboarding skip all lands with defaults and writes nothing extra', async () => {
    const r = await O.finishOnboarding(Actions, {}, C());
    assert.equal(r.ok, true);
    const me = S().view.get('profile', 'me');
    assert.equal(me.region, 'in');
    assert.equal(me.locale, 'en');
    assert.ok(me.onboardedAt);
    for (const s of ['contacts', 'motivation', 'responses']) assert.equal(list(s).length, 0, s);
    assert.equal(S().view.get('settings', 'app').earlyNoticeSeen, false, 'the notice shows again until dismissed');
    await O.finishOnboarding(Actions, {}, C());
    assert.equal(events('OnboardingCompleted').length, 1, 'once only');
    assert.equal((await O.finishOnboarding(null, {}, C())).ok, false, 'no Actions: no throw');
  });

  test('onboarding answers that Actions would refuse are dropped, not sent', () => {
    const p = O.buildPatch({ term: 'nope', stage: 'nope', score: 7, startDate: '2026-13-45', reasons: ['  ', 'x'.repeat(201)],
      contact: { name: '  ', phone: '123' }, region: 'mars', checkin: { morning: '25:00' }, reviewDay: 9, pace: 'warp', medical: { opioids: 'yes' } }, C());
    assert.deepEqual(p.profile, { medical: { heavyDaily: false, sedatives: false, opioids: false }, region: 'in' });
    assert.equal(p.motivation, null, 'no stage, no motivation row');
    assert.equal(p.reasons, null);
    assert.equal(p.contact, null);
    const unsure = O.buildPatch({ notSure: true, startDate: '2026-01-01' }, C()).profile;
    assert.equal(unsure.notSure, true);
    assert.equal(unsure.startDate, null, '"not sure yet" wins over a date');
    assert.equal(O.needsMedicalCard({ sedatives: true }), true);
    assert.equal(O.needsMedicalCard({ heavyDaily: false, sedatives: false, opioids: false }), false);
    assert.equal(O.needsMedicalCard(undefined), false);
  });

  test('unlock: a wrong PIN pauses and says so; the right PIN opens', async () => {
    await S().lock.set('2468', { autoLockMin: 5 });
    S().lock.lockNow();
    assert.equal(S().status().locked, true);
    const t0 = Date.now();
    const wrong = await O.attemptUnlock(S(), '1111', { delayMs: 40 });
    assert.deepEqual(wrong, { ok: false, message: O.COPY.wrong });
    assert.ok(Date.now() - t0 >= 35, 'the pause comes before the message');
    assert.equal(S().status().locked, true);
    assert.deepEqual(await O.attemptUnlock(S(), '', { delayMs: 0 }), { ok: false, message: O.COPY.wrong });
    assert.deepEqual(await O.attemptUnlock(S(), '2468', { delayMs: 0 }), { ok: true, message: '' });
    assert.equal(S().status().locked, false);
    assert.equal(O.WRONG_PAUSE_MS, 1000);
    const thrown = await O.attemptUnlock({ lock: { unlock: async () => { throw Object.assign(new Error('x'), { code: 'NO_CRYPTO' }); } } }, '9999', { delayMs: 0 });
    assert.deepEqual(thrown, { ok: false, message: 'A PIN is not available on this device.' });
    assert.equal(O.lockError({ code: 'BAD_PIN' }), 'Use 4 to 12 digits.');
    assert.equal(O.lockError({ code: 'WRITE_FAILED' }), 'This device did not save it. Try again.');
    await refused(S().lock.set('12'), 'BAD_PIN');
  });

  test('a locked person reaches urgent help and SOBER in one tap, from Content only', async () => {
    await Actions.onboard({ region: 'intl' });
    await S().lock.set('2468');
    S().lock.lockNow();
    const L = O.lockLabels(false, C());
    assert.equal(L.urgent.href, '#/sos/urgent', 'one link, no PIN');
    assert.equal(L.urgent.label, 'Urgent help');
    const profile = S().view.get('profile', 'me') || {};
    assert.deepEqual(profile, {}, 'nothing of the person is readable while locked');
    const m = SOS.urgentList(profile.region, C());
    assert.equal(m.sections[0].id, 'in');
    assert.ok(m.sections[0].items.filter((i) => i.tel).length >= 5, 'the numbers are there without the PIN');
    assert.equal(SOS.soberSteps(C()).length, 5, 'SOBER from content alone');
    assert.match(ONB_SRC, /testid: 'lock-sober'/);
    assert.match(ONB_SRC, /dataset: tid\('lock-urgent'\)/);
    const D = O.lockLabels(true, C());
    assert.deepEqual([D.title, D.urgent.label], [C().discreetName, 'Help']);
    assert.equal(O.discreetFrom('1', false), true);
    assert.equal(O.discreetFrom(null, false), false);
  });

  test('forgot PIN erases this device, then a backup restores', async () => {
    await someData();
    const backup = await S().exportJson();
    await S().lock.set('2468');
    S().lock.lockNow();
    assert.equal(await O.forgetPin(S()), true);
    assert.deepEqual(S().status().hasLock, false);
    assert.equal(list('logs').length, 0);
    await Actions.importBackup(backup);
    assert.ok(list('logs').length > 0, 'the backup brings the notes back');
    assert.equal(S().status().hasLock, false, 'an import never installs a PIN');
  });

  test('RC7: a Safety Net whose number Actions would refuse keeps the name, and the person is told', async () => {
    for (const [phone, kept] of [['+91 98765 43210', true], ['(022) 2345-6789', true], ['call me at 5', false], ['1'.repeat(25), false]]) {
      const p = O.buildPatch({ contact: { name: 'Ravi', phone } }, C());
      assert.equal(p.contact.name, 'Ravi', phone);
      assert.equal(p.phoneDropped, !kept, phone);
      assert.equal(p.contact.phone === phone, kept, phone);
      const accepted = await Actions.contacts.add({ name: 'Ravi', role: 'safetyNet', phone }).then(() => true, () => false);
      assert.equal(accepted, kept, 'the same rule as Actions: ' + phone);
    }
    await S().resetAll();
    const r = await O.finishOnboarding(Actions, { contact: { name: 'Ravi', phone: 'call me at 5' } }, C());
    assert.deepEqual(r.errors, []);
    assert.deepEqual(list('contacts').map((x) => [x.name, x.phone || '']), [['Ravi', '']]);
    assert.match(ONB_SRC, /phoneDropped\) toast\(/, 'the finish says the number was not saved');
  });

  test('lock and onboarding make no network call and never keep the PIN', () => {
    assert.doesNotMatch(ONB_SRC, /https?:\/\//);
    assert.doesNotMatch(ONB_SRC, /\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|innerHTML|console\./);
    assert.deepEqual(ONB_SRC.match(/localStorage\.\w+\([^)]*\)/g),
      ['localStorage.getItem(DISCREET_KEY)', "localStorage.setItem(DISCREET_KEY, '1')", 'localStorage.removeItem(DISCREET_KEY)'],
      'the device holds only the discreet flag, through a guard (RS12)');
    assert.doesNotMatch(ONB_SRC, /(settings|patch|commit|answers)\.?[^\n]*\bpin\b(?!\s*=\s*h\()/i, 'the PIN never goes into rows or answers');
    assert.match(ONB_SRC, /pin\.value = '';/, 'the field is cleared at once');
    assert.ok(O.COPY.early.length <= 80, 'the early-access notice is short');
    assert.equal(O.COPY.clinicalReview, true);
    assert.doesNotMatch(ONB_SRC, /\baddicts?\b/i);
  });
});

// ── FIX-SAFETY-AS (2026-11-07, rulings 10:45): the safety-copy findings RS2 to RS9 and the two copy rulings ──
describe('safety fixes (FIX-SAFETY-AS)', () => {
  const H = require(src('ui-sos.js'));
  before(async () => { if (typeof S().load === 'function') await S().load(); });
  beforeEach(async () => { await S().resetAll(); });

  test('RS2: typed text with common crisis phrases goes to the numbers, any apostrophe', () => {
    const yes = [
      "I don't want to live anymore", 'I don’t want to live', 'i dont want to live', 'I do not want to be here',
      'dont want to be here anymore', 'I don’t want to be alive', "I don't want to wake up", 'I dont wanna live',
      "I can't go on", 'I can’t go on like this', 'i cant go on', 'I cannot go on', 'I want to end it', 'I want to end it all',
      'thinking of ending my life', 'ending it', 'I will take my own life', 'taking my life', 'I wanna die', 'kms',
      'I have nothing to live for', 'there is no reason to live', 'no point living', 'I want to hurt myself', 'I cut myself',
      'I might hang myself', 'overdose on purpose', 'I want to die', 'thinking about suicide', 'better off dead', 'I might kill myself',
    ];
    for (const t of yes) assert.equal(H.isCrisisText(t, null), true, t);
    const no = [
      '', 'tired and bored', 'I am angry at work', 'I want to live well', 'I want to be here for my kids', 'a long weekend',
      'I can go on a walk', 'I cut down on tea', 'I hurt my knee', 'killing time', 'I spend it on food', 'lonely tonight',
    ];
    for (const t of no) assert.equal(H.isCrisisText(t, null), false, t);
    assert.equal(H.isCrisisText("I can't go on", { crisisKeywords: () => [] }), true, 'never fewer than this list');
    assert.equal(H.CRISIS.clinicalReview, true, 'the list is marked for clinical review');
  });

  test('RS3: the withdrawal label names the substances and the doctor', () => {
    assert.equal(H.COPY.withdrawal, 'Heavy daily drinking or sedatives: stop with a doctor.');
    const d = sosDom();
    const labels = d.UI.sosUrgentView({}, {}).querySelectorAll('summary').map((s) => s.textContent.trim());
    assert.ok(labels.includes(H.COPY.withdrawal), labels.join(' | '));
  });

  test('RS4: only "Log it and go on" writes the slip; "Just reading" goes on and logs nothing', async () => {
    assert.equal(H.slipLogs('log', false), true);
    assert.equal(H.slipLogs('read', false), false);
    assert.equal(H.slipLogs('log', true), false, 'a preview writes nothing');
    const d = sosDom();
    let root = d.open(['sos', 'slip']);
    d.tap(root, 'Just reading');
    await d.settle();
    assert.ok(d.byId(root, 'sos-slip-safe'), 'the flow goes on');
    assert.equal(list('events').length, 0, 'nothing is written');
    root = d.open(['sos', 'slip']);
    assert.equal(d.byId(root, 'sos-slip-continue').textContent.trim(), 'Log it and go on', 'the button says what it does');
    d.tapId(root, 'sos-slip-continue');
    await d.settle();
    assert.equal(events('SlipLogged').length, 1);
  });

  test('RS5: with opioids ticked the safety card adds the tolerance line', () => {
    const O = require(src('ui-onboarding.js'));
    const w = [...C().resources.withdrawal];
    assert.deepEqual(O.medicalLines({}, C()), [], 'nothing ticked: no card');
    assert.deepEqual(O.medicalLines({ heavyDaily: true }, C()), w);
    assert.deepEqual(O.medicalLines({ sedatives: true }, C()), w);
    assert.equal(O.COPY.opioid, 'After a break, your tolerance drops. Never use alone. In an emergency, call for help.');
    assert.deepEqual(O.medicalLines({ opioids: true }, { resources: { withdrawal: w } }), [...w, O.COPY.opioid], 'the built-in line');
    assert.deepEqual(O.medicalLines({ opioids: true, heavyDaily: true }, { resources: { withdrawal: w, opioidSafety: ['From content.'] } }),
      [...w, 'From content.'], 'Content.resources.opioidSafety wins when it is there');
    assert.ok(!O.medicalLines({ heavyDaily: true }, C()).includes(O.COPY.opioid), 'no opioid line without the tick');
  });

  test('RS6: please verify shows beside each meetings group marked verify', async () => {
    const m = H.meetingsFrom(C());
    assert.ok(m.length > 0 && m.every((g) => g.verify === true), 'every group in content is marked verify');
    assert.deepEqual(H.meetingsFrom({ resources: { in: { groups: [{ name: 'A', verify: true }, { name: 'B' }] } } }).map((g) => g.verify), [true, false]);
    const d = sosDom();
    const root = d.open(['sos', 'slip']);
    d.tapId(root, 'sos-slip-reading');
    d.tapId(root, 'sos-slip-safe');
    d.tap(root, 'Continue');
    await d.settle();
    const shown = root.querySelectorAll('[data-testid="meetings-verify"]');
    assert.equal(shown.length, m.length, 'one note per group');
    assert.ok(shown.every((n) => n.textContent.trim() === H.COPY.verify));
  });

  test('RS7: the feeling flow asks What helped? once at its end; toggles start off and one left off is helpful:false', async () => {
    assert.deepEqual(H.markHelped([{ skillId: 'sober', helpful: true }, { skillId: 'pleasant', helpful: true }], ['pleasant']),
      [{ skillId: 'sober', helpful: false }, { skillId: 'pleasant', helpful: true }]);
    const d = sosDom();
    const root = d.open(['sos', 'feeling']);
    d.tapId(root, 'sos-feeling-' + d.calm());
    for (let k = 0; !root.querySelector('[data-testid="sos-helped"]'); k += 1) {
      assert.ok(k < 30, 'What helped? comes: ' + root.textContent.slice(0, 120));
      root.querySelectorAll('button').find((x) => ['Next', 'Done'].includes(x.textContent.trim())).click();
    }
    const ask = d.byId(root, 'sos-helped');
    assert.equal(ask.querySelector('.sos-title').textContent.trim(), 'What helped?');
    const boxes = ask.querySelectorAll('input');
    assert.ok(boxes.length >= 2 && boxes.every((b) => b.checked === false), 'every toggle starts off');
    const picked = boxes[0].dataset.testid.slice('sos-helped-'.length);
    boxes[0].checked = true;
    d.tap(root, 'Next');
    assert.ok(!root.querySelector('[data-testid="sos-helped"]'), 'asked once');
    d.rate(root, 3);
    await d.settle();
    const used = events('SkillUsed').map((e) => [e.payload.skillId, e.payload.helpful]);
    assert.deepEqual(used.filter(([, ok]) => ok === true).map(([s]) => s), [picked]);
    assert.equal(used.filter(([, ok]) => ok === false).length, boxes.length - 1, 'a toggle left off writes helpful:false');
  });

  test('RS8: the discreet lock screen breathing panel is titled Breathe, and no step names the urge', () => {
    const O = require(src('ui-onboarding.js'));
    assert.equal(O.lockLabels(true, C()).sober.title, 'Breathe');
    assert.equal(O.lockLabels(false, C()).sober.title, null);
    assert.match(readFileSync(src('ui-onboarding.js'), 'utf8'), /UI\.sosSoberView\([^\n]*'Done', L\.sober\.title\)/, 'the lock screen passes it');
    assert.equal(H.FALLBACK.sober[1], 'Observe. Notice what you feel in your body.');
    for (const t of H.FALLBACK.sober) assert.doesNotMatch(t, /\b(urge|crav\w*|use|using|drink\w*)\b/i, t);
    const d = sosDom();
    assert.equal(d.UI.sosSoberView(() => {}, 'Done', 'Breathe').querySelector('.sos-title').textContent.trim(), 'Breathe');
    assert.equal(d.UI.sosSoberView(() => {}, 'Done').querySelector('.sos-title').textContent.trim(), H.COPY.wave.title);
  });

  test('RS9: the slip flow skips a spiral thought that is crisis text or says hopeless', () => {
    // FIX-R8 C-R7-2: the test brings its own line to skip, first, in a copy of Content (the shared catalog may hold
    // none: the trunk's U-31a took it out); the real Content is never changed
    const C9 = Object.assign({}, C(), { catalogs: Object.assign({}, C().catalogs, { spiral: ['I feel hopeless'].concat(C().catalogs.spiral || []) }) });
    assert.ok(C9.catalogs.spiral.some((t) => /hopeless/i.test(t)), 'the catalog has one to skip');
    const pairs = H.spiralPairs(null, null, C9);
    assert.ok(pairs.length > 0);
    assert.ok(pairs.every((p) => !/hopeless/i.test(p.thought)), pairs.map((p) => p.thought).join(' | '));
    assert.equal(pairs[0].reply, H.FALLBACK.spiralReply);
    const own = H.spiralPairs(null, { spiralThoughts: () => ['I want to die', 'I feel hopeless', "I can't go on", 'I blew it'] }, C());
    assert.deepEqual(own.map((p) => p.thought), ['I blew it']);
  });

  test('TALKBACK: the waiting line lets the wave pass and never says decide then', () => {
    assert.ok(H.FALLBACK.talkback.includes('I can wait 15 minutes and let this wave pass.'), H.FALLBACK.talkback.join(' | '));
    assert.ok(H.FALLBACK.talkback.every((t) => !/decide then/i.test(t)));
    assert.equal(H.FALLBACK.clinicalReview, true);
  });

  test('VERIFY: in crisis mode the verify note is one short line', () => {
    assert.equal(H.COPY.crisisVerify, 'Please check these numbers.');
    const note = C().resources.in.verifyNote;
    assert.ok(note && note.length > 40, 'content has a long verify note');
    const d = sosDom();
    const crisis = d.UI.sosUrgentView({}, { crisis: true });
    assert.equal(crisis.querySelectorAll('[data-testid="crisis-verify"]').length, 1, 'one line');
    assert.equal(d.byId(crisis, 'crisis-verify').textContent.trim(), 'Please check these numbers.');
    assert.ok(!crisis.textContent.includes(note), 'the long note is left out of a crisis');
    const urgent = d.UI.sosUrgentView({}, {});
    assert.ok(urgent.textContent.includes(note), 'the urgent page keeps it');
    assert.equal(urgent.querySelectorAll('[data-testid="crisis-verify"]').length, 0);
  });
});

describe('onboarding and SOS fixes (FIX-ONB-EMO)', () => {
  before(async () => { if (typeof S().load === 'function') await S().load(); });
  beforeEach(async () => { await S().resetAll(); });
  const route = (path) => ({ path, parts: path.split('/').filter(Boolean), query: {} });

  test('REDIRECT: a new person on #/ or #/today goes to onboarding once, with replace; never from SOS, the lock or another route', async () => {
    const d = sosDom({ onboarding: true });
    const O = d.UI.onboardingHelpers;
    assert.equal(typeof O.shouldOnboard, 'function', 'the rule is a pure helper');
    for (const p of ['/sos', '/sos/craving', '/sos/urgent', '/lock', '/learn', '/onboarding', '/settings']) assert.equal(O.shouldOnboard(route(p), S()), false, p);
    assert.equal(O.shouldOnboard(route('/'), S()), true);
    assert.equal(O.shouldOnboard(route('/today'), S()), true);
    d.fire('ui:route', route('/sos'));
    d.fire('ui:route', route('/lock'));
    await d.settle();
    assert.deepEqual(d.go, [], 'never from SOS or the lock');
    d.fire('ui:route', route('/today'));
    d.fire('ui:route', route('/'));
    await d.settle();
    assert.deepEqual(d.go, ['#/onboarding'], 'once');
    assert.deepEqual(d.replaced, ['#/onboarding'], 'with replace');
    const seen = sosDom({ onboarding: true });
    seen.onb({});
    seen.fire('ui:route', route('/today'));
    await seen.settle();
    assert.deepEqual(seen.go, [], 'a person who has seen onboarding in this visit is not sent back');
    await Actions.onboard({ name: 'Asha' });
    assert.equal(O.shouldOnboard(route('/today'), S()), false, 'onboarded: never');
    await S().resetAll();
    await S().lock.set('2468');
    S().lock.lockNow();
    assert.equal(O.shouldOnboard(route('/'), S()), false, 'locked: never');
  });
  test('REDIRECT (slow load): ui-core may draw Today before Store.load ends; the rule waits for the load, then asks again on the route the person is on now', async () => {
    const real = S();
    let loaded = false;
    let gate = null;
    let open = null;
    const fresh = () => { loaded = false; gate = null; };
    const slow = Object.assign(Object.create(real), {
      load: () => gate || (gate = new Promise((r) => { open = r; }).then(() => { loaded = true; })), // idempotent, as Store.load is
      view: { get: (s, id) => (loaded ? real.view.get(s, id) : null), list: (s) => (loaded ? real.view.list(s) : []), count: (s) => (loaded ? real.view.count(s) : 0) },
      status: () => real.status(),
    });
    const at = (d, p) => { d.UI.route = () => route(p); };
    // a returning person, drawn on Today before the load ends: never sent to onboarding
    await Actions.onboard({ name: 'Asha' });
    const back = sosDom({ onboarding: true, store: slow });
    at(back, '/today');
    back.fire('ui:route', route('/today'));
    await back.settle();
    assert.deepEqual(back.go, [], 'nothing is decided before the load ends');
    open();
    await back.settle();
    assert.deepEqual(back.go, [], 'a returning person is never sent to onboarding');
    // a new person who taps SOS while the load runs: never pulled out of SOS
    await S().resetAll();
    fresh();
    const sos = sosDom({ onboarding: true, store: slow });
    at(sos, '/today');
    sos.fire('ui:route', route('/today'));
    at(sos, '/sos/craving');
    open();
    await sos.settle();
    assert.deepEqual(sos.go, [], 'moved to SOS meanwhile: stays in SOS');
    // a new person who stays on Today: sent once, with replace, after the load
    fresh();
    const stay = sosDom({ onboarding: true, store: slow });
    at(stay, '/today');
    stay.fire('ui:route', route('/today'));
    stay.fire('ui:route', route('/today'));
    await stay.settle();
    assert.deepEqual(stay.go, [], 'not before the load');
    open();
    await stay.settle();
    assert.deepEqual(stay.replaced, ['#/onboarding'], 'once, with replace, after the load');
    assert.deepEqual(stay.go, ['#/onboarding']);
  });
  test('EMO: sosSession keeps an optional emotion, rated or not; without one the log has none; an unknown one is refused', async () => {
    const id = C().emotions.find((e) => e && e.crisisCheck !== true && e.id !== 'other').id;
    await Actions.sosSession({ kind: 'feeling', emotion: id, tools: [] });
    await Actions.sosSession({ kind: 'feeling', emotion: id, ratingAfter: 3, tools: [] });
    await Actions.sosSession({ kind: 'feeling', tools: [] });
    const logs = list('logs');
    assert.deepEqual(logs.slice(0, 2).map((l) => l.emotion), [id, id], 'unrated and rated keep the feeling');
    assert.ok(logs.slice(0, 2).every((l) => Array.isArray(l.feelings) && l.feelings.includes(id)));
    assert.ok(!logs[2].emotion, 'no emotion given: none kept');
    assert.equal(events('SosCompleted').length, 3);
    await refused(Actions.sosSession({ kind: 'feeling', emotion: 'no-such-feeling', tools: [] }), 'bad-session');
    await Actions.sosSession({ kind: 'feeling', emotion: id, tools: [], drill: true });
    assert.equal(list('logs').length, 3, 'a drill writes no log');
  });
  test('LOCKED: an SOS save refused by a lock is kept in memory and saved once after the next unlock', async () => {
    const d = sosDom();
    await S().lock.set('2468');
    S().lock.lockNow();
    const root = d.open(['sos', 'craving']);
    d.tap(root, 'Skip');
    d.tap(root, 'Check in with the craving');
    d.tapId(root, 'sos-reassess-passed');
    d.tapId(root, 'sos-used-no');
    await d.settle();
    assert.ok(d.byId(root, 'sos-finish'), 'SOS goes on while locked');
    assert.ok(d.toasts.some((t) => t[0] === d.UI.sosHelpers.COPY.lockedKept), 'the person is told it waits for the unlock');
    assert.ok(await S().lock.unlock('2468'));
    await d.settle();
    assert.deepEqual(events('SosCompleted').map((e) => e.payload.outcome), ['passed'], 'saved after the unlock');
    await Actions.settings.patch({ theme: 'dark' });
    await d.settle();
    assert.equal(events('SosCompleted').length, 1, 'never twice');
    assert.equal(list('logs').length, 1);
  });
  test('RC10: one outcome enum, passed, still or used; anything else is refused', async () => {
    for (const outcome of ['passed', 'still']) await Actions.sosSession({ kind: 'craving', tools: [], outcome });
    await Actions.sosSession({ kind: 'craving', tools: [], used: true, outcome: 'used' });
    assert.deepEqual(events('SosCompleted').map((e) => e.payload.outcome), ['passed', 'still', 'used']);
    for (const outcome of ['other', 'unknown', 'relapse', '']) await refused(Actions.sosSession({ kind: 'craving', tools: [], outcome }), 'bad-session');
    const H2 = sosDom().UI.sosHelpers;
    assert.deepEqual([H2.outcomeFrom(6, 2, false), H2.outcomeFrom(6, 7, false), H2.outcomeFrom(6, 2, true)], ['passed', 'still', 'used']);
    assert.equal(events('SosCompleted').length, 3, 'a refused outcome writes nothing');
  });
  test('PIN: PIN fields are one-time-code, numeric, 4 to 12 digits, with the line about setting one first', async () => {
    const O = require(src('ui-onboarding.js'));
    assert.deepEqual(O.PIN_ATTRS, { type: 'password', inputmode: 'numeric', pattern: '[0-9]*', autocomplete: 'one-time-code', minlength: '4', maxlength: '12' });
    assert.equal(O.COPY.pinHelp, 'Set a PIN before you write anything private.');
    assert.equal(typeof O.pinOk, 'function');
    for (const p of ['1234', '123456789012']) assert.equal(O.pinOk(p), true, p);
    for (const p of ['123', '1234567890123', 'abcd', '12 34', '', null]) assert.equal(O.pinOk(p), false, String(p));
    const spy = setSpy(); // FIX-R8 C-R7-1
    const d = sosDom({ onboarding: true, crypto: { subtle: {} }, store: spy.store });
    const root = d.onb({});
    d.tapId(root, 'onb-next');
    for (const id of ['onb-pin', 'onb-pin2']) for (const [k, v] of Object.entries(O.PIN_ATTRS)) assert.equal(d.byId(root, id).attrs[k], v, id + ' ' + k);
    assert.ok(root.textContent.includes(O.COPY.pinHelp), 'the PIN help line shows');
    d.byId(root, 'onb-pin').value = '12ab'; d.byId(root, 'onb-pin2').value = '12ab';
    d.tapId(root, 'onb-pin-set');
    await d.settle();
    assert.equal(S().status().hasLock, false, 'not 4 to 12 digits: refused before the Store');
    assert.deepEqual(spy.calls, [], 'not 4 to 12 digits: refused before the Store');
    assert.ok(root.textContent.includes('Use 4 to 12 digits.'));
    d.byId(root, 'onb-pin').value = '2468'; d.byId(root, 'onb-pin2').value = '2468';
    d.tapId(root, 'onb-pin-set');
    await until(() => !root.textContent.includes(O.COPY.pinSetting), 'the PIN set ends'); // FIX-R8 C-R7-1: a real key on the real Store
    assert.equal(S().status().hasLock, true);
    const lp = d.byId(d.UI.pages.lock({}), 'lock-pin');
    for (const k of ['type', 'inputmode', 'pattern', 'autocomplete']) assert.equal(lp.attrs[k], O.PIN_ATTRS[k], 'lock ' + k);
  });
  test('SAMPLE: step 1 offers Look around with sample data (O6): marked rows, then Today; no sample in the version, no button', async () => {
    const d = sosDom({ onboarding: true });
    await withSample(undefined, async () => {
      assert.equal(d.onb({}).querySelector('[data-testid="onb-sample"]'), null, 'never a dead button');
    });
    const lesson = firstModule().lessons[0].id;
    await withSample({ generate: (now) => ({ stores: { events: [{ id: 'sample-e1', type: 'LessonCompleted', at: now, payload: { lessonId: lesson } }] } }) }, async () => {
      const root = d.onb({});
      assert.ok(root.querySelector('[data-testid="onb-sample"]'), 'the button is on step 1');
      const b = d.byId(root, 'onb-sample');
      assert.equal(b.textContent.trim(), 'Look around with sample data');
      assert.ok(String(b.attrs.class).split(' ').includes('ghost'), 'a ghost button');
      b.click();
      await d.settle();
      assert.ok(list('events').some((e) => e.id === 'sample-e1' && e.sample === true), 'the sample rows are marked');
      assert.ok(S().view.get('meta', 'sample'), 'erasable: the meta sample row');
      assert.deepEqual(d.go, [], 'the safety step comes first (RS13)');
      d.tapId(root, 'onb-safety-ok');
      assert.deepEqual(d.go, ['#/today']);
    });
  });
  test('DRILL: the drill says Nothing goes in your log.', () => {
    const d = sosDom();
    const root = d.open(['sos'], { drill: '1' });
    assert.match(d.byId(root, 'sos-drill-banner').textContent, /Nothing goes in your log\./);
    const W = d.UI.sosHelpers.COPY;
    assert.match(W.drillDone.line, /Nothing goes in your log\./);
    assert.doesNotMatch(W.drillBanner + ' ' + W.drillDone.line, /nothing is saved|nothing was saved/i, 'the drill keeps its own mark, so never nothing is saved');
  });
  test('SLIDER: the motivation slider has no value until moved; untouched, no motivation is saved', async () => {
    const run = async (move) => {
      await S().resetAll();
      const d = sosDom({ onboarding: true });
      const root = d.onb({});
      for (let k = 0; k < 3; k += 1) d.tapId(root, 'onb-next');
      const stage = root.querySelectorAll('input').find((i) => i.attrs.type === 'radio' && i.attrs.name === 'stage');
      stage.checked = true;
      const sl = root.querySelectorAll('input').find((i) => i.attrs.type === 'range');
      assert.equal(sl.dataset.testid, 'onb-score');
      assert.equal(sl.attrs['aria-valuetext'], 'Not set');
      if (move) { sl.value = '8'; for (const fn of sl.on.input) fn({}); }
      d.tapId(root, 'onb-next');
      d.tapId(root, 'onb-safety-ok');
      d.tapId(root, 'onb-next');
      d.tapId(root, 'onb-next');
      d.tapId(root, 'onb-finish');
      await d.settle();
      assert.ok(S().view.get('profile', 'me').stage, 'the stage is saved either way');
      return list('motivation').map((x) => x.score);
    };
    assert.deepEqual(await run(false), [], 'never moved: nothing saved');
    assert.deepEqual(await run(true), [8], 'moved: saved');
  });
  test('FUTURE: a start date after today is refused with FUTURE_DATE and writes nothing; the date input has a max', async () => {
    const today = E().todayStr(new Date());
    const t = new Date(); t.setDate(t.getDate() + 1);
    await refused(Actions.onboard({ startDate: E().todayStr(t) }), 'FUTURE_DATE');
    assert.ok(!S().view.get('profile', 'me'), 'nothing written');
    await Actions.onboard({ startDate: today });
    assert.equal(S().view.get('profile', 'me').startDate, today, 'today is fine');
    const O = require(src('ui-onboarding.js'));
    assert.notEqual(O.buildPatch({ startDate: '2999-01-01' }, C()).profile.startDate, '2999-01-01', 'dropped before the verb');
    assert.equal(O.buildPatch({ startDate: today }, C()).profile.startDate, today);
    const d = sosDom({ onboarding: true });
    const root = d.onb({});
    d.tapId(root, 'onb-next');
    d.tapId(root, 'onb-next');
    const date = root.querySelectorAll('input').find((i) => i.attrs.type === 'date');
    assert.match(String(date.attrs.max), /^\d{4}-\d{2}-\d{2}$/, 'the input has a max');
  });
  test('REACH: the slip flow shows Reach out', async () => {
    await Actions.contacts.add({ name: 'Ravi', role: 'safetyNet', phone: '+91 98765 43210' });
    const d = sosDom();
    const W = d.UI.sosHelpers.COPY;
    const root = d.open(['sos', 'slip']);
    d.tapId(root, 'sos-slip-reading');
    d.tapId(root, 'sos-slip-safe');
    const atPeople = () => root.textContent.includes(W.reach.title) || root.textContent.includes(W.call.title);
    for (let k = 0; k < 4 && !atPeople(); k += 1) d.tap(root, 'Continue');
    assert.ok(root.textContent.includes(W.reach.title), 'Reach out');
    assert.ok(root.textContent.includes(W.reach.line));
    assert.ok(!root.textContent.includes(W.call.title), 'not the craving words');
  });
  test('LEAVE: leaving a craving flow after a tool saves those tools as one still session, after the next screen draws', async () => {
    const H2 = sosDom().UI.sosHelpers;
    assert.equal(typeof H2.leaveSession, 'function');
    const used = [{ skillId: 'ride-wave', helpful: true }];
    assert.equal(H2.leaveSession({ kind: 'craving', tools: [] }), null, 'no tool: nothing');
    assert.equal(H2.leaveSession({ kind: 'craving', tools: used, drill: true }), null, 'a drill: nothing');
    assert.equal(H2.leaveSession({ kind: 'craving', tools: used, finished: true }), null, 'already saved: nothing');
    assert.equal(H2.leaveSession({ kind: 'craving', tools: used }).outcome, 'still');
    const why = H2.TOOLS.find((t) => t.id === 'why').skillId;
    for (const [label, drawn] of [['Urgent help', true], ['Back to SOS', false]]) {
      await S().resetAll();
      const d = sosDom();
      const root = d.open(['sos', 'craving']);
      d.tap(root, 'Skip');
      d.tapId(root, 'sos-tool-why');
      d.tap(root, 'Done');
      d.tap(root, 'It helped');
      root.querySelectorAll('a').find((x) => x.textContent.trim() === label).click();
      assert.equal(events('SosCompleted').length, 0, label + ': nothing before the next screen draws');
      if (drawn) d.fire('ui:rendered', {}); else await new Promise((r) => setTimeout(r, 350));
      await d.settle();
      assert.deepEqual(events('SosCompleted').map((e) => e.payload.outcome), ['still'], label);
      assert.deepEqual(events('SkillUsed').map((e) => [e.payload.skillId, e.payload.helpful]), [[why, true]], label);
    }
    const d = sosDom();
    const root = d.open(['sos', 'craving']);
    root.querySelectorAll('a').find((x) => x.textContent.trim() === 'Back to SOS').click();
    await new Promise((r) => setTimeout(r, 350));
    assert.equal(events('SosCompleted').length, 1, 'no tool used: leaving writes nothing');
  });
  test('USEVERB: recordEvent refuses the types each verb owns, with USE_VERB, and writes nothing', async () => {
    for (const type of ['SosCompleted', 'LogCreated', 'SkillUsed', 'SlipLogged']) await refused(Actions.recordEvent(type, {}), 'USE_VERB');
    await assert.rejects(Actions.recordEvent('SkillUsed', {}), (err) => /\buseSkill\b/.test(err.message), 'EC3: the message names useSkill, the only verb for a skill used with no log');
    assert.equal(events().length, 0, 'nothing written');
    await Actions.recordEvent('MindfulMinute');
    assert.equal(events('MindfulMinute').length, 1, 'other types still work');
  });
  test('CLOCK: the test clock is pinned to a fixed local noon that still ticks', async () => {
    assert.equal(E().todayStr(new Date()), '2026-03-11');
    assert.equal(new Date().getHours(), 12, 'noon: far from midnight');
    const t0 = Date.now();
    await new Promise((r) => setTimeout(r, 5));
    assert.ok(Date.now() > t0, 'time still moves');
    assert.equal(new Date(2026, 0, 2).getDate(), 2, 'a Date with arguments is untouched');
  });
  test('GRAD: recoveryPlan.graduatedAt is set once, with RecoveryPlanConfirmed, and never cleared', async () => {
    const a = await Actions.recoveryPlan.save({ motivation: { items: ['x'] } });
    assert.equal(a.plan.graduatedAt, null, 'not confirmed: not set');
    const b = await Actions.recoveryPlan.save({ motivation: { items: ['y'] } }, { confirm: true });
    assert.deepEqual(b.events.map((e) => e.type), ['RecoveryPlanConfirmed']);
    assert.ok(ISO_RE.test(String(b.plan.graduatedAt)), 'set with the confirm');
    assert.equal(b.plan.graduatedAt, b.events[0].at);
    await tick();
    const c = await Actions.recoveryPlan.save({ motivation: { items: ['z'] } }, { confirm: true });
    const d = await Actions.recoveryPlan.save({}, { confirm: false });
    assert.equal(c.plan.graduatedAt, b.plan.graduatedAt, 'set once');
    assert.equal(d.plan.graduatedAt, b.plan.graduatedAt, 'never cleared');
    assert.equal(S().view.get('recoveryPlan', 'plan').graduatedAt, b.plan.graduatedAt);
    assert.equal(events('RecoveryPlanConfirmed').length, 1);
  });
  test('IMPORT: every import goes through Actions.importBackup; no screen of this lane calls Store.replaceAll', () => {
    for (const f of ['ui-sos.js', 'ui-onboarding.js']) assert.doesNotMatch(readFileSync(src(f), 'utf8'), /replaceAll\s*\(/, f);
    const a = readFileSync(src('actions.js'), 'utf8');
    assert.equal((a.match(/\.replaceAll\s*\(/g) || []).length, 1, 'actions.js calls it once');
    const at = a.indexOf('async function importBackup(');
    const end = a.indexOf('\n  async function ', at + 1);
    assert.ok(at > 0 && a.slice(at, end).includes('S.replaceAll('), 'and only inside importBackup');
  });
  // -- FIX-ONB-EMO tests end --
});

describe('review round 2 fixes (RC14-RC20)', () => {
  before(async () => { if (typeof S().load === 'function') await S().load(); });
  beforeEach(async () => { await S().resetAll(); });

  test('RC14: the craving flow walks by its hooks alone: rate, wave, helped, check in, still, a tool, check in, passed, No', async () => {
    const d = sosDom();
    const root = d.open(['sos', 'craving']);
    const has = (id) => root.querySelector(`[data-testid="${id}"]`);
    const tap = (id) => { const n = has(id); assert.ok(n, `the hook ${id} is on: ${root.textContent.slice(0, 120)}`); n.click(); };
    d.rate(root, 7);
    tap('sos-tool-wave');
    for (let k = 0; !has('sos-step-done'); k += 1) { assert.ok(k < 12, 'SOBER has a last step'); tap('sos-step-next'); }
    tap('sos-step-done');
    tap('sos-helped-yes');
    tap('sos-checkin');
    tap('sos-reassess-still');
    tap('sos-tool-distract');
    tap('sos-step-done');
    tap('sos-helped-no');
    tap('sos-checkin');
    d.rate(root, 3);
    tap('sos-reassess-passed');
    tap('sos-used-no');
    await d.settle();
    assert.ok(has('sos-finish'), 'the flow ends on Finish');
    assert.deepEqual(events('SosCompleted').map((e) => [e.payload.outcome, e.payload.delays, e.payload.ratingBefore, e.payload.ratingAfter]), [['passed', 1, 7, 3]]);
    assert.deepEqual(events('SkillUsed').map((e) => e.payload.helpful), [true, false]);
    for (const tool of ['why', 'call', 'talkback']) {
      const r = d.open(['sos', 'craving']);
      const skip = r.querySelector('[data-testid="sos-rate-skip"]');
      assert.ok(skip, 'the rating is skipped by its hook, and the tools come at once');
      skip.click();
      r.querySelector(`[data-testid="sos-tool-${tool}"]`).click();
      assert.ok(r.querySelector('[data-testid="sos-step-done"]'), `${tool} ends on sos-step-done`);
    }
    for (const id of ['sos-step-next', 'sos-step-done', 'sos-helped-yes', 'sos-helped-no', 'sos-checkin', 'sos-rate-skip']) assert.ok(!id.startsWith('sos-tool-'), 'never under the prefix sosAnyTool matches');
    assert.deepEqual(d.toasts.filter((t) => t[1] === 'warn'), []);
  });
  test('RC15: a tick, tutorial or reveal on a row a sample wrote belongs to the person, and Erase sample keeps it', async () => {
    const feature = Object.keys(C().features)[0];
    await withSample({ generate: (now) => ({ stores: {
      quests: [{ id: 'clear-space', startedAt: now, ticks: {}, completedAt: null }],
      tutorials: [{ id: 'tour', completedAt: null, skipped: false, replays: 0, stepsSeen: 0 }],
      reveals: [{ id: feature, revealedAt: now, seenAt: null, forced: false }],
    } }) }, async () => {
      assert.equal((await Actions.loadSample()).count, 3);
      await Actions.quests.tick('clear-space', 'list');
      await Actions.tutorial.done('tour');
      await Actions.tutorial.replay('tour');
      await Actions.reveal(feature, { seen: true });
      for (const [store, id] of [['quests', 'clear-space'], ['tutorials', 'tour'], ['reveals', feature]]) {
        assert.notEqual(S().view.get(store, id).sample, true, `${store} ${id} is the person's own row now`);
      }
      await Actions.eraseSample();
      assert.ok(S().view.get('quests', 'clear-space') && S().view.get('quests', 'clear-space').ticks.list, 'the tick stays');
      assert.ok(S().view.get('tutorials', 'tour') && S().view.get('tutorials', 'tour').completedAt, 'the tutorial stays done');
      assert.equal(S().view.get('tutorials', 'tour').replays, 1);
      assert.ok(S().view.get('reveals', feature) && S().view.get('reveals', feature).seenAt, 'the reveal stays seen');
      assert.equal(events('TutorialCompleted').length, 1);
      assert.equal(events('FeatureRevealed').length, 1);
    });
  });
  test('RC20: when the device refuses the session, Yes opens the slip flow unlogged, and Log it and go on saves the slip', async () => {
    const d = sosDom();
    const A = Object.assign({}, Actions, { sosSession: async () => { const e = new Error('The device refused the write.'); e.code = 'WRITE_FAILED'; throw e; } });
    const root = d.open(['sos', 'craving'], {}, A);
    d.tapId(root, 'sos-rate-skip');
    d.tapId(root, 'sos-checkin');
    d.tapId(root, 'sos-reassess-passed');
    d.tapId(root, 'sos-used-yes');
    await d.settle();
    assert.deepEqual(d.go, ['#/sos/slip'], 'never ?logged=1 when nothing was logged');
    assert.ok(d.toasts.some((t) => t[1] === 'warn'), 'the person is told it was not saved');
    assert.equal(events('SlipLogged').length, 0);
    const slip = d.open(['sos', 'slip']);
    d.tapId(slip, 'sos-slip-continue');
    await d.settle();
    assert.equal(events('SlipLogged').length, 1, 'Log it and go on saves the slip');
  });
  test('RC16: a session kept for the unlock keeps the day of the tap, though the unlock comes after midnight', async () => {
    const d = sosDom();
    await S().lock.set('2468');
    S().lock.lockNow();
    const day = E().todayStr(new Date());
    const root = d.open(['sos', 'craving']);
    d.tapId(root, 'sos-rate-skip');
    d.tapId(root, 'sos-checkin');
    d.tapId(root, 'sos-reassess-passed');
    d.tapId(root, 'sos-used-yes');
    await d.settle();
    assert.deepEqual(d.go, ['#/sos/slip?kept=1'], 'kept for the unlock: the slip is on its way, not in the log yet (RS21)');
    const slip = d.open(['sos', 'slip']);
    d.tapId(slip, 'sos-slip-continue');
    await d.settle();
    shiftClock(14 * 3600 * 1000);
    try {
      assert.notEqual(E().todayStr(new Date()), day, 'the unlock comes on the next day');
      assert.ok(await S().lock.unlock('2468'));
      await d.settle();
      await d.settle();
      assert.deepEqual(list('logs').map((l) => l.date), [day, day], 'each save keeps the day of the tap');
      assert.deepEqual(events('SlipLogged').map((e) => e.payload.date), [day, day]);
      await refused(Actions.sosSession({ kind: 'craving', date: '2999-01-01' }), 'bad-session');
      await refused(Actions.sosSession({ kind: 'craving', date: 'soon' }), 'bad-session');
    } finally { shiftClock(-14 * 3600 * 1000); }
  });
  test('RC19: recordEvent refuses RecoveryPlanConfirmed, OnboardingCompleted and ModuleCompleted with USE_VERB, and writes nothing', async () => {
    const before = await snapshot();
    await refused(Actions.recordEvent('RecoveryPlanConfirmed', {}), 'USE_VERB');
    await refused(Actions.recordEvent('OnboardingCompleted', {}), 'USE_VERB');
    await refused(Actions.recordEvent('ModuleCompleted', { moduleId: firstModule().id }), 'USE_VERB');
    assert.deepEqual(await snapshot(), before);
    const p = await Actions.recoveryPlan.save({ motivation: { items: ['my kids'] } }, { confirm: true });
    assert.ok(p.plan.confirmedAt && p.plan.graduatedAt, 'the verb writes the plan row with its event');
    assert.equal(events('RecoveryPlanConfirmed').length, 1);
  });
  test('RC17: ArtifactSaved only for build, assess and plan; ExerciseDone for practice, reflect and tool; neither for any other kind', async () => {
    const had = Object.prototype.hasOwnProperty.call(C(), 'exercises');
    const old = C().exercises;
    C().exercises = ['build', 'assess', 'plan', 'practice', 'reflect', 'tool', 'log', null].map((kind) => (kind ? { id: 'ex-' + kind, kind } : { id: 'ex-none' }));
    try {
      for (const x of C().exercises) await Actions.saveResponse(x.id, { a: 1 });
      assert.deepEqual(events('ArtifactSaved').map((e) => e.payload.exerciseId), ['ex-build', 'ex-assess', 'ex-plan']);
      assert.deepEqual(events('ExerciseDone').map((e) => e.payload.exerciseId), ['ex-practice', 'ex-reflect', 'ex-tool']);
      assert.equal(list('responses').length, 8, 'every answer is kept');
    } finally { if (had) C().exercises = old; else delete C().exercises; }
  });
  test('RC18: a sample that cannot be read is refused with no-sample and writes nothing', async () => {
    await someData();
    const before = await snapshot();
    const broken = [
      { generate: () => { throw new Error('broken'); } },
      { generate: () => ({ stores: { logs: [{ type: 'craving', at: '2026-03-11T06:30:00.000Z' }] } }) },
    ];
    for (const sample of broken) await withSample(sample, () => refused(Actions.loadSample(), 'no-sample'));
    assert.deepEqual(await snapshot(), before);
  });
  // -- review round 2 tests end --
});

// ── FIX-R2-SAFETY (2026-11-07, rulings 13:55): review round 2's open safety findings RS10 to RS14 ──
describe('review round 2 safety fixes (FIX-R2-SAFETY)', () => {
  const H = require(src('ui-sos.js'));
  const O = require(src('ui-onboarding.js'));
  before(async () => { if (typeof S().load === 'function') await S().load(); });
  beforeEach(async () => { await S().resetAll(); });

  test('RS10: typed crisis text in its inflected forms goes to the numbers; Next on Something else shows them', () => {
    const yes = [
      'I keep cutting myself', 'thinking about killing myself', 'I want to harm myself', 'I have been self harming', 'I keep wanting to die',
      'thoughts of death', 'killing myself', 'hurting myself', 'harming myself', 'hanging myself', 'self-harming again', 'I self harmed',
      'part of me wants to die', 'I wanted to die', 'thinking about death', 'thinking about dying', 'thoughts about suicide',
      'life is not worth living', "life isn't worth living", 'life isn’t worth living', 'I hope I never wake up',
    ];
    for (const t of yes) assert.equal(H.isCrisisText(t, null), true, t);
    for (const t of ['killing time', 'I hurt my knee', 'I want a life worth living', 'thinking about dinner', 'I woke up late', 'I cut down on tea']) {
      assert.equal(H.isCrisisText(t, null), false, t);
    }
    assert.equal(H.CRISIS.clinicalReview, true, 'the list is marked for clinical review');
    for (const t of ['I keep cutting myself', 'thoughts of death', 'I keep wanting to die']) {
      const d = sosDom();
      const root = d.open(['sos', 'feeling']);
      d.tapId(root, 'sos-feeling-other');
      root.querySelectorAll('input').find((i) => i.attrs.id === 'sos-feel-text').value = t;
      d.tap(root, 'Next');
      assert.ok(root.querySelector('[data-testid="sos-crisis"]'), t + ': the crisis view');
      assert.ok(root.querySelector('[data-testid="urgent-number-1"]'), t + ': the numbers at once');
    }
  });
  test('RS11: Next on the privacy step with a typed PIN sets it, or stays on the step and says why', async () => {
    const spy = setSpy(); // FIX-R8 C-R7-1
    const d = sosDom({ onboarding: true, crypto: { subtle: {} }, store: spy.store });
    const root = d.onb({});
    d.tapId(root, 'onb-next');
    // FIX-R8 C-R7-1: Next waits until the PIN step ends (a real key on the real Store), then the margin it had
    const typed = async (a, b) => { d.byId(root, 'onb-pin').value = a; d.byId(root, 'onb-pin2').value = b; d.tapId(root, 'onb-next'); await until(() => !root.textContent.includes(O.COPY.pinSetting), 'the PIN step ends'); await d.settle(); };
    await typed('2468', '1357');
    assert.ok(root.querySelector('[data-testid="onb-step-2"]'), 'two PINs that differ: still on step 2');
    assert.ok(root.textContent.includes(O.COPY.pinMismatch), 'and it says why');
    assert.equal(S().status().hasLock, false);
    assert.deepEqual(spy.calls, [], 'two PINs that differ: never sent to the Store');
    await typed('12ab', '12ab');
    assert.ok(root.querySelector('[data-testid="onb-step-2"]'), 'not 4 to 12 digits: still on step 2');
    assert.ok(root.textContent.includes(O.COPY.pinDigits));
    assert.equal(S().status().hasLock, false);
    assert.deepEqual(spy.calls, [], 'not 4 to 12 digits: never sent to the Store');
    await typed('2468', '2468');
    assert.equal(S().status().hasLock, true, 'Next set the typed PIN');
    assert.ok(root.querySelector('[data-testid="onb-step-3"]'), 'then went on');
    const again = sosDom({ onboarding: true, crypto: { subtle: {} } });
    const r2 = again.onb({});
    again.tapId(r2, 'onb-next');
    again.tapId(r2, 'onb-next');
    assert.ok(r2.querySelector('[data-testid="onb-step-3"]'), 'empty fields: Next goes on at once');
  });
  test('RS12: discreet chosen in onboarding sets the device flag; the lock screen and its title then read discreet', async () => {
    const walk = async (d) => {
      const root = d.onb({});
      d.tapId(root, 'onb-next');
      root.querySelectorAll('input').find((i) => i.attrs.name === 'discreet').checked = true;
      d.tapId(root, 'onb-next');
      for (let k = 0; !root.querySelector('[data-testid="onb-finish"]'); k += 1) {
        assert.ok(k < 12, 'the last step comes');
        d.tapId(root, root.querySelector('[data-testid="onb-safety-ok"]') ? 'onb-safety-ok' : 'onb-skip');
      }
      d.tapId(root, 'onb-finish');
      await d.settle();
    };
    const flags = new Map();
    const localStorage = { getItem: (k) => (flags.has(k) ? flags.get(k) : null), setItem: (k, v) => { flags.set(k, String(v)); }, removeItem: (k) => { flags.delete(k); } };
    const d = sosDom({ onboarding: true, localStorage });
    await walk(d);
    assert.equal(flags.get('1-addic:discreet'), '1', 'with no UI.applyDiscreet on the tree, the flag is set through the guard');
    const lock = d.UI.pages.lock({});
    const name = String(C().discreetName || 'Notebook');
    assert.equal(lock.querySelector('h1').textContent.trim(), name);
    assert.equal(d.byId(lock, 'lock-urgent').textContent.trim(), 'Help');
    assert.equal(d.byId(lock, 'lock-sober').textContent.trim(), 'Breathe');
    assert.equal(d.doc.title, name, 'the tab title is discreet while locked');
    await S().resetAll();
    const calls = [];
    const d2 = sosDom({ onboarding: true, localStorage: { getItem: () => null, setItem: () => { calls.push('setItem'); }, removeItem: () => {} } });
    d2.UI.applyDiscreet = (on) => { calls.push(on); return true; };
    await walk(d2);
    assert.deepEqual(calls, [true], 'with UI.applyDiscreet (core), it alone sets the flag');
    const plain = sosDom({ onboarding: true, localStorage: { getItem: () => null } });
    plain.UI.pages.lock({});
    assert.equal(plain.doc.title, '', 'not discreet: the title is left to ui-core');
  });
  test('RS13: Look around with sample data shows the safety step, then Today after I understand', async () => {
    const lesson = firstModule().lessons[0].id;
    await withSample({ generate: (now) => ({ stores: { events: [{ id: 'sample-e1', type: 'LessonCompleted', at: now, payload: { lessonId: lesson } }] } }) }, async () => {
      const d = sosDom({ onboarding: true });
      const root = d.onb({});
      d.tapId(root, 'onb-sample');
      await d.settle();
      assert.deepEqual(d.go, [], 'not to Today yet');
      assert.ok(root.querySelector('[data-testid="onb-step-5"]'), 'the safety step: ' + root.textContent.slice(0, 120));
      assert.equal(root.querySelector('[data-testid="onb-skip"]'), null, 'it cannot be skipped');
      const opioids = root.querySelectorAll('input').find((i) => i.attrs.name === 'medical' && i.value === 'heavyDaily');
      opioids.checked = true;
      for (const fn of opioids.on.change || []) fn({});
      assert.equal(d.byId(root, 'onb-medical-card').hidden, false, 'the card shows');
      d.tapId(root, 'onb-safety-ok');
      assert.deepEqual(d.go, ['#/today']);
    });
  });
  test("RS14: outside the drill, Call someone and Remind me why never show sample rows as the person's own", async () => {
    await Actions.saveResponse('quick-reasons', { reasons: ['my kids'] });
    await Actions.contacts.add({ name: 'Ravi', role: 'safetyNet', phone: '+91 98765 43210' });
    const late = '2999-01-01T00:00:00.000Z';
    await withSample({ generate: () => ({ stores: {
      contacts: [{ id: 'sample-c1', name: 'Sample Sam', role: 'safetyNet', phone: '+91 90000 00001', active: true }],
      responses: [{ id: 'sample-r1', exerciseId: 'quick-reasons', payload: { reasons: ['a sample reason'] }, at: late, updatedAt: late, draft: false }],
    } }) }, () => Actions.loadSample());
    assert.ok(list('contacts').some((x) => x.sample === true) && list('responses').some((x) => x.sample === true), 'the sample rows are in');
    assert.deepEqual(H.activeContacts(S().view).map((x) => x.name), ['Ravi']);
    assert.deepEqual(H.reasonsFrom(S().view, null), ['my kids']);
    const eng = { reasonsCard: (v) => ({ quick: [].concat(...v.list('responses').map((r) => (r.payload && r.payload.reasons) || [])) }) };
    assert.deepEqual(H.reasonsFrom(S().view, eng), ['my kids'], 'the engine is handed only the person\'s own rows');
    const d = sosDom();
    const root = d.open(['sos', 'craving']);
    d.tapId(root, 'sos-rate-skip');
    d.tapId(root, 'sos-tool-call');
    const hrefs = root.querySelectorAll('a').map((a) => String(a.attrs.href || ''));
    assert.ok(hrefs.some((x) => x.includes('919876543210')), 'their own person');
    assert.ok(!hrefs.some((x) => x.includes('9000000001')), 'no tel: or sms: link to a sample number');
    assert.doesNotMatch(root.textContent, /Sample Sam/);
    const r2 = d.open(['sos', 'craving']);
    d.tapId(r2, 'sos-rate-skip');
    d.tapId(r2, 'sos-tool-why');
    assert.match(r2.textContent, /my kids/);
    assert.doesNotMatch(r2.textContent, /a sample reason/);
  });
  // -- FIX-R2-SAFETY tests end --
});

// ── FIX-R2-REST (2026-11-07, rulings 13:55): review round 2's RS15 to RS17 and the check's C2 and C3 ──
describe('review round 2 rest (FIX-R2-REST)', () => {
  const O = require(src('ui-onboarding.js'));
  before(async () => { if (typeof S().load === 'function') await S().load(); });
  beforeEach(async () => { await S().resetAll(); });

  test('RS15: while locked, Call someone and Remind me why say they are hidden, not empty; urgent help stays one tap away', async () => {
    await Actions.saveResponse('quick-reasons', { reasons: ['my kids'] });
    await Actions.contacts.add({ name: 'Ravi', role: 'safetyNet', phone: '+91 98765 43210' });
    await S().lock.set('2468');
    S().lock.lockNow();
    const d = sosDom();
    const W = d.UI.sosHelpers.COPY;
    const urgent = (r) => r.querySelectorAll('a').some((a) => a.attrs.href === '#/sos/urgent');
    const root = d.open(['sos', 'craving']);
    d.tapId(root, 'sos-rate-skip');
    d.tapId(root, 'sos-tool-call');
    assert.ok(!root.textContent.includes(W.call.none), 'never No Safety Net yet while the people are only sealed');
    assert.ok(W.call.hidden && root.textContent.includes(W.call.hidden), 'it says they are hidden while locked');
    assert.doesNotMatch(root.textContent, /Ravi/);
    assert.ok(urgent(root), 'urgent help one tap away');
    const r2 = d.open(['sos', 'craving']);
    d.tapId(r2, 'sos-rate-skip');
    d.tapId(r2, 'sos-tool-why');
    assert.ok(!r2.textContent.includes(W.why.empty), 'never Add your reasons later while they are only sealed');
    assert.ok(W.why.hidden && r2.textContent.includes(W.why.hidden), 'it says they are hidden while locked');
    assert.doesNotMatch(r2.textContent, /my kids/);
    assert.ok(urgent(r2));
    assert.ok(await S().lock.unlock('2468'));
    const r3 = d.open(['sos', 'craving']);
    d.tapId(r3, 'sos-rate-skip');
    d.tapId(r3, 'sos-tool-call');
    assert.ok(!r3.textContent.includes(W.call.hidden), 'unlocked: the people show again');
    assert.match(r3.textContent, /Ravi/);
  });
  test('RS16: #/sos/slip?logged=1 says It is in your log. and offers one Go on, never Just reading; nothing is logged twice', async () => {
    const d = sosDom();
    const W = d.UI.sosHelpers.COPY;
    const root = d.open(['sos', 'slip'], { logged: '1' });
    assert.ok(root.textContent.includes('It is in your log.'), 'it says the slip is in the log');
    assert.ok(!root.querySelector('[data-testid="sos-slip-reading"]'), 'no Just reading');
    assert.ok(!root.textContent.includes(W.slipStart.read));
    assert.ok(!root.textContent.includes(W.slipStart.log), 'no Log it and go on');
    const on = root.querySelector('[data-testid="sos-slip-continue"]');
    assert.ok(on, 'one way on');
    assert.equal(on.textContent.trim(), 'Go on');
    d.tapId(root, 'sos-slip-continue');
    await d.settle();
    assert.ok(root.querySelector('[data-testid="sos-slip-safe"]'), 'then the safety step');
    assert.equal(events('SlipLogged').length, 0, 'logged before: nothing written again');
    const plain = d.open(['sos', 'slip']);
    assert.ok(plain.querySelector('[data-testid="sos-slip-reading"]'), 'not logged: both choices stay');
    assert.ok(!plain.textContent.includes('It is in your log.'));
  });
  test('RS17: with a PIN set, the privacy step says so and shows no PIN fields; Next keeps the PIN as it was', async () => {
    await S().lock.set('2468');
    const d = sosDom({ onboarding: true, crypto: { subtle: {} } });
    const root = d.onb({});
    d.tapId(root, 'onb-next');
    assert.ok(root.querySelector('[data-testid="onb-step-2"]'));
    for (const id of ['onb-pin', 'onb-pin2', 'onb-pin-set']) assert.ok(!root.querySelector(`[data-testid="${id}"]`), 'no ' + id);
    assert.ok(root.textContent.includes('A PIN is set. You can change it in Settings.'));
    assert.equal(O.COPY.pinIsSet, 'A PIN is set. You can change it in Settings.');
    d.tapId(root, 'onb-next');
    await d.settle();
    assert.ok(root.querySelector('[data-testid="onb-step-3"]'), 'Next goes on');
    S().lock.lockNow();
    assert.ok(await S().lock.unlock('2468'), 'the PIN is the one set before');
    await S().resetAll();
    const fresh = sosDom({ onboarding: true, crypto: { subtle: {} } });
    const r2 = fresh.onb({});
    fresh.tapId(r2, 'onb-next');
    assert.ok(r2.querySelector('[data-testid="onb-pin"]'), 'no PIN yet: the fields stay');
    assert.ok(!r2.textContent.includes(O.COPY.pinIsSet));
  });
  test('C2: a save kept for the unlock is dropped when the notebook is erased or replaced first, never written into the new one', async () => {
    const cases = [['erase (Forgot PIN)', () => S().resetAll()], ['import', (backup) => Actions.importBackup(backup)]];
    for (const [name, after] of cases) {
      await S().resetAll();
      await Actions.contacts.add({ name: 'Ravi', role: 'safetyNet', phone: '+91 98765 43210' });
      const backup = S().exportJson();
      let refusals = 2; // RS22: an unlocked notebook tries once more at once, so the device refuses twice to keep it
      const A = Object.assign({}, Actions, { sosSession: (p) => {
        if (refusals > 0) { refusals -= 1; const e = new Error('The data locked before this was saved.'); e.code = 'LOCKED'; return Promise.reject(e); }
        return Actions.sosSession(p);
      } });
      const d = sosDom();
      const root = d.open(['sos', 'craving'], null, A);
      d.tap(root, 'Skip');
      d.tap(root, 'Check in with the craving');
      d.tapId(root, 'sos-reassess-passed');
      d.tapId(root, 'sos-used-no');
      await d.settle();
      assert.ok(d.toasts.some((t) => t[0] === d.UI.sosHelpers.COPY.lockedKept), name + ': kept for the unlock');
      assert.equal(events('SosCompleted').length, 0, name + ': not saved yet');
      await after(backup);
      await d.settle();
      assert.equal(events('SosCompleted').length, 0, name + ': the kept save is dropped, never written into the new notebook');
      await Actions.settings.patch({ theme: 'dark' });
      await d.settle();
      assert.equal(events('SosCompleted').length, 0, name + ': and stays dropped');
    }
  });
  test('C3: the slider has a confirm button that keeps the shown value; moving still saves; untouched, nothing', async () => {
    const run = async (how) => {
      await S().resetAll();
      const d = sosDom({ onboarding: true });
      const root = d.onb({});
      for (let k = 0; k < 3; k += 1) d.tapId(root, 'onb-next');
      const stage = root.querySelectorAll('input').find((i) => i.attrs.type === 'radio' && i.attrs.name === 'stage');
      stage.checked = true;
      const sl = root.querySelectorAll('input').find((i) => i.attrs.type === 'range');
      const ok = root.querySelector('[data-testid="onb-score-ok"]');
      assert.ok(ok, 'a confirm button by the slider');
      assert.equal(ok.textContent.trim(), O.COPY.scoreOk);
      if (how === 'confirm') { d.tapId(root, 'onb-score-ok'); assert.ok(root.textContent.includes('5 of 10'), 'the value is shown as chosen'); }
      if (how === 'move') { sl.value = '8'; for (const fn of sl.on.input) fn({}); }
      d.tapId(root, 'onb-next');
      d.tapId(root, 'onb-safety-ok');
      d.tapId(root, 'onb-next');
      d.tapId(root, 'onb-next');
      d.tapId(root, 'onb-finish');
      await d.settle();
      return list('motivation').map((x) => x.score);
    };
    assert.deepEqual(await run('confirm'), [5], 'confirmed at 5: saved with no move away and back');
    assert.deepEqual(await run('move'), [8], 'moved: saved');
    assert.deepEqual(await run('none'), [], 'untouched: nothing saved');
  });
  // -- FIX-R2-REST tests end --
});

// ── FIX-R3 (2026-11-07, rulings 15:46): the safety re-check's new items RS19 to RS23 ──
describe('review round 3 fixes (FIX-R3)', () => {
  const H = require(src('ui-sos.js'));
  const O = require(src('ui-onboarding.js'));
  before(async () => { if (typeof S().load === 'function') await S().load(); });
  beforeEach(async () => { await S().resetAll(); });
  // the feeling flow's Something else, typed and sent with Next
  const typedTo = (t) => {
    const d = sosDom();
    const root = d.open(['sos', 'feeling']);
    d.tapId(root, 'sos-feeling-other');
    root.querySelectorAll('input').find((i) => i.attrs.id === 'sos-feel-text').value = t;
    d.tap(root, 'Next');
    return root;
  };

  const RS19_YES = [
    'I want to be dead', 'I wish to be dead', "I'd rather be dead", 'I’d rather be dead', 'I am ready to be dead', 'I would be better off dead',
    'I wish I could go to sleep and not wake up', 'I want to go to sleep and never wake up', 'my life is no longer worth living',
    'I want it all to end', 'I just want it to end', 'I want to end my life', 'I want to end it all', 'I wish I was never born',
    "I wish I'd never been born", 'I want to disappear forever', 'everyone would be better off without me',
    "they'd be better off without me", 'there is no reason to live',
  ];
  for (const t of RS19_YES) {
    test('RS19: typed "' + t + '" goes to the numbers', () => { assert.equal(H.isCrisisText(t, null), true, t); });
  }
  test('RS19: dead tired, killing time and I hurt my knee stay out; Next on Something else shows the numbers at once', () => {
    for (const t of ['dead tired', 'I am dead tired', 'killing time', 'I hurt my knee']) assert.equal(H.isCrisisText(t, null), false, t);
    for (const t of ['I want to be dead', 'I wish I was never born', 'everyone would be better off without me', 'I want it all to end']) {
      const root = typedTo(t);
      assert.ok(root.querySelector('[data-testid="sos-crisis"]'), t + ': the crisis view');
      assert.ok(root.querySelector('[data-testid="urgent-number-1"]'), t + ': the numbers at once');
    }
    assert.equal(H.CRISIS.clinicalReview, true, 'the list is marked for clinical review');
  });
  test('RS23: typed overdose, overdosed, OD or took too much opens the full urgent view with the overdose card, not the crisis view', () => {
    for (const t of ['overdose', 'I think I overdosed', 'my friend is overdosing', 'I think I OD’d', "he OD'd", 'I might OD', 'I took too much', "I've taken too much"]) {
      assert.equal(H.isOverdoseText(t), true, t);
    }
    for (const t of ['I feel odd', 'oddly calm', 'good', 'I took too long', 'too much work', 'I took a walk', '']) assert.equal(H.isOverdoseText(t), false, t);
    assert.equal(H.OVERDOSE.clinicalReview, true, 'marked for clinical review');
    for (const t of ['I think I overdosed', 'I took too much', 'I might OD', 'I want to overdose on purpose']) {
      const root = typedTo(t);
      assert.ok(root.querySelector('[data-testid="sos-urgent"]'), t + ': the full urgent view');
      assert.ok(!root.querySelector('[data-testid="sos-crisis"]'), t + ': not the crisis view');
      assert.ok(root.querySelector('[data-testid="urgent-number-1"]'), t + ': the numbers at once');
      assert.ok(root.querySelectorAll('summary').some((s) => s.textContent.trim() === H.COPY.overdose), t + ': with the overdose card');
    }
    const crisis = typedTo('I want to be dead');
    assert.ok(crisis.querySelector('[data-testid="sos-crisis"]'), 'crisis words without overdose words: the crisis view, as before');
    assert.ok(!crisis.querySelectorAll('summary').some((s) => s.textContent.trim() === H.COPY.overdose), 'the crisis view says little else');
  });
  test('RS22: a save refused LOCKED because this tab locked and unlocked while it ran is tried once more, at once (the same lock row)', async () => {
    // RS22 after RS26 (the 17:04 ruling): any change of the lock row drops a save, so the retry has one case left: this
    // tab locks and unlocks again (the same PIN) while the save runs, and the store refuses the write that met the lock
    const lockedErr = () => Object.assign(new Error('This tab locked while the save ran.'), { code: 'LOCKED' });
    await S().lock.set('2468');
    const refusing = (k) => {
      const s = { calls: 0 };
      s.A = Object.assign({}, Actions, { sosSession: async (p) => {
        s.calls += 1;
        if (s.calls > k) return Actions.sosSession(p);
        S().lock.lockNow();
        assert.equal(await S().lock.unlock('2468'), true, 'unlocked again, the same PIN');
        throw lockedErr();
      } });
      return s;
    };
    const walk = (d, A, last) => {
      const root = d.open(['sos', 'craving'], null, A);
      for (const id of ['sos-rate-skip', 'sos-checkin', 'sos-reassess-passed', last]) d.tapId(root, id);
      return root;
    };
    const kept = (d) => d.toasts.some((t) => t[0] === d.UI.sosHelpers.COPY.lockedKept);
    // FIX-R8 C-R7-1: each refusal in the stub unlocks with a real key on the real Store; a save ends in a kept or a not saved toast
    const ended = (x) => () => x.toasts.some((t) => t[0] === x.UI.sosHelpers.COPY.lockedKept || t[0] === x.UI.sosHelpers.COPY.notSaved);
    const one = refusing(1);
    const d = sosDom();
    walk(d, one.A, 'sos-used-yes');
    await until(() => d.go.length > 0, 'refused once: tried once more, at once');
    assert.equal(one.calls, 2, 'refused once: tried once more, at once');
    assert.equal(S().status().hasLock, true, 'the lock row the save began with');
    assert.deepEqual(events('SosCompleted').map((e) => e.payload.outcome), ['used'], 'saved now, not at some later notify');
    assert.equal(events('SlipLogged').length, 1, 'the slip is in the log');
    assert.ok(!kept(d), 'never told it waits for an unlock');
    assert.deepEqual(d.go, ['#/sos/slip?logged=1'], 'written: It is in your log. is true');
    await Actions.settings.patch({ theme: 'dark' });
    await d.settle();
    assert.equal(events('SosCompleted').length, 1, 'nothing kept to write twice');
    const two = refusing(2);
    const d2 = sosDom();
    walk(d2, two.A, 'sos-used-no');
    await until(ended(d2), 'one retry, no more');
    assert.equal(two.calls, 2, 'one retry, no more');
    assert.ok(kept(d2), 'the retry refused too: kept for the unlock');
    assert.equal(events('SosCompleted').length, 1);
    await Actions.settings.patch({ theme: 'light' });
    await until(() => events('SosCompleted').length >= 2, 'the kept one is saved once, at the next notify');
    await d2.settle();
    assert.equal(two.calls, 3);
    assert.equal(events('SosCompleted').length, 2, 'the kept one is saved once, at the next notify');
    S().lock.lockNow(); // really locked: the store refuses and this tab reads locked
    const three = refusing(0);
    const d3 = sosDom();
    walk(d3, three.A, 'sos-used-no');
    await until(ended(d3), 'really locked: no retry');
    assert.equal(three.calls, 1, 'really locked: no retry');
    assert.ok(kept(d3), 'kept for the unlock, as before');
    assert.ok(await S().lock.unlock('2468'));
    await until(() => three.calls >= 2, 'saved after the unlock');
    assert.equal(three.calls, 2, 'saved after the unlock');
  });
  test('RS21: a slip save kept for the unlock never reads It is in your log.; it says It goes in your log when you unlock.', async () => {
    const d = sosDom();
    const W = d.UI.sosHelpers.COPY;
    await S().lock.set('2468');
    S().lock.lockNow();
    const root = d.open(['sos', 'craving']);
    for (const id of ['sos-rate-skip', 'sos-checkin', 'sos-reassess-passed', 'sos-used-yes']) d.tapId(root, id);
    await until(() => d.go.length > 0, 'kept for the unlock, not written yet: never ?logged=1'); // FIX-R8 C-R7-1
    assert.deepEqual(d.go, ['#/sos/slip?kept=1'], 'kept for the unlock, not written yet: never ?logged=1');
    assert.equal(H.parseSos({ parts: ['sos', 'slip'], query: { kept: '1' } }).kept, true);
    assert.equal(H.parseSos({ parts: ['sos', 'slip'], query: {} }).kept, false);
    const slip = d.open(['sos', 'slip'], { kept: '1' });
    assert.ok(!slip.textContent.includes('It is in your log.'), 'not in the log yet: it never says so');
    assert.ok(slip.textContent.includes('It goes in your log when you unlock.'));
    assert.equal(W.slipStart.kept.startsWith('It goes in your log when you unlock.'), true);
    assert.ok(!slip.querySelector('[data-testid="sos-slip-reading"]'), 'one way on: the slip is on its way');
    assert.equal(d.byId(slip, 'sos-slip-continue').textContent.trim(), W.slipStart.goOn);
    d.tapId(slip, 'sos-slip-continue');
    await d.settle();
    assert.ok(slip.querySelector('[data-testid="sos-slip-safe"]'), 'then the safety step');
    assert.ok(await S().lock.unlock('2468'));
    await until(() => events('SosCompleted').length > 0, 'saved after the unlock'); // FIX-R8 C-R7-1: sealed with the real key
    await d.settle();
    assert.deepEqual(events('SosCompleted').map((e) => e.payload.outcome), ['used'], 'saved after the unlock');
    assert.equal(events('SlipLogged').length, 1, 'the kept session logs the slip once; Go on wrote nothing more');
    const saved = sosDom();
    const r2 = saved.open(['sos', 'craving']);
    for (const id of ['sos-rate-skip', 'sos-checkin', 'sos-reassess-passed', 'sos-used-yes']) saved.tapId(r2, id);
    await until(() => saved.go.length > 0, 'written at once: It is in your log. is true'); // FIX-R8 C-R7-1
    assert.deepEqual(saved.go, ['#/sos/slip?logged=1'], 'written at once: It is in your log. is true');
  });
  test('RS20: while the PIN is being set, Next and Skip wait and a line says so; no step is skipped unseen', async () => {
    const d = sosDom({ onboarding: true, crypto: { subtle: {} } });
    const root = d.onb({});
    d.tapId(root, 'onb-next');
    d.byId(root, 'onb-pin').value = '2468';
    d.byId(root, 'onb-pin2').value = '2468';
    d.tapId(root, 'onb-next');
    assert.equal(d.byId(root, 'onb-next').disabled, true, 'Next waits while the key is made');
    assert.equal(d.byId(root, 'onb-skip').disabled, true, 'Skip waits too');
    assert.ok(typeof O.COPY.pinSetting === 'string' && root.textContent.includes(O.COPY.pinSetting), 'a short line says the PIN is being set');
    for (let k = 0; k < 3; k += 1) d.tapId(root, 'onb-skip');
    assert.ok(root.querySelector('[data-testid="onb-step-2"]'), 'Skip does nothing meanwhile');
    // FIX-R8 C-R7-1: on the real Store the key takes a real derivation (about a second); until the PIN is set, every
    // look finds step 2, the line that says so, and the buttons waiting
    const waits = (x, r, ids) => () => {
      if (S().status().hasLock === true) return true;
      assert.ok(r.querySelector('[data-testid="onb-step-2"]') && r.textContent.includes(O.COPY.pinSetting), 'until the PIN is set: step 2 and the line that says so');
      for (const id of ids) assert.equal(x.byId(r, id).disabled, true, id + ' waits until the PIN is set');
      return false;
    };
    await until(waits(d, root, ['onb-next', 'onb-skip']), 'the PIN is set');
    assert.equal(S().status().hasLock, true, 'the PIN is set');
    assert.ok(root.querySelector('[data-testid="onb-step-3"]'), 'then step 3 shows: none skipped unseen');
    await S().resetAll();
    const e = sosDom({ onboarding: true, crypto: { subtle: {} } });
    const r2 = e.onb({});
    e.tapId(r2, 'onb-next');
    e.byId(r2, 'onb-pin').value = '1357';
    e.byId(r2, 'onb-pin2').value = '1357';
    e.tapId(r2, 'onb-pin-set');
    assert.equal(e.byId(r2, 'onb-next').disabled, true, 'Set PIN: Next waits too');
    assert.equal(e.byId(r2, 'onb-skip').disabled, true);
    assert.equal(e.byId(r2, 'onb-pin-set').disabled, true, 'and Set PIN runs once');
    e.tapId(r2, 'onb-skip');
    assert.ok(r2.querySelector('[data-testid="onb-step-2"]'));
    await until(waits(e, r2, ['onb-next', 'onb-skip', 'onb-pin-set']), 'the PIN is set'); // FIX-R8 C-R7-1
    assert.equal(S().status().hasLock, true);
    assert.ok(r2.textContent.includes(O.COPY.pinSet), 'it says the PIN is set');
    assert.equal(e.byId(r2, 'onb-next').disabled, false, 'Next is back');
    assert.equal(e.byId(r2, 'onb-skip').disabled, false, 'Skip is back');
    e.tapId(r2, 'onb-next');
    assert.ok(r2.querySelector('[data-testid="onb-step-3"]'), 'Next goes on to step 3');
    await S().resetAll();
    const real = S();
    const failing = Object.create(real);
    failing.lock = Object.assign(Object.create(real.lock), { set: () => Promise.reject(Object.assign(new Error('The device refused the write.'), { code: 'WRITE_FAILED' })) });
    const f = sosDom({ onboarding: true, crypto: { subtle: {} }, store: failing });
    const r3 = f.onb({});
    f.tapId(r3, 'onb-next');
    f.byId(r3, 'onb-pin').value = '2468';
    f.byId(r3, 'onb-pin2').value = '2468';
    f.tapId(r3, 'onb-next');
    await f.settle();
    assert.ok(r3.querySelector('[data-testid="onb-step-2"]'), 'a PIN that could not be set: still on step 2');
    assert.ok(!r3.textContent.includes(O.COPY.pinSetting), 'the waiting line gives way to the reason');
    assert.equal(f.byId(r3, 'onb-next').disabled, false, 'Next and Skip are back');
    assert.equal(f.byId(r3, 'onb-skip').disabled, false);
    assert.equal(f.byId(r3, 'onb-pin-set').disabled, false, 'Set PIN can be tried again');
    assert.equal(real.status().hasLock, false, 'nothing set');
  });
  // -- FIX-R3 tests end --
});

// ── FIX-R4 (2026-11-07, rulings 16:17): the safety re-check's items RS24 to RS28 ──
describe('review round 4 fixes (FIX-R4)', () => {
  const H = require(src('ui-sos.js'));
  before(async () => { if (typeof S().load === 'function') await S().load(); });
  beforeEach(async () => { await S().resetAll(); });
  // the feeling flow's Something else, typed and sent with Next
  const typedTo = (t) => {
    const d = sosDom();
    const root = d.open(['sos', 'feeling']);
    d.tapId(root, 'sos-feeling-other');
    root.querySelectorAll('input').find((i) => i.attrs.id === 'sos-feel-text').value = t;
    d.tap(root, 'Next');
    return root;
  };
  // every node under root, in document order
  const order = (root) => { const out = []; const walk = (n) => { for (const k of n.kids) { out.push(k); walk(k); } }; walk(root); return out; };

  const RS24_YES = [
    "I hope I don't wake up", 'I hope I dont wake up tomorrow', "I wish I didn't wake up", 'I wanna be dead', 'I hope I die',
    "I wish I hadn't been born", 'I wish it would all end', 'everyone would be better off if I was gone',
    'they would be better off if I were dead',
  ];
  for (const t of RS24_YES) {
    test('RS24: typed "' + t + '" goes to the numbers', () => { assert.equal(H.isCrisisText(t, null), true, t); });
  }
  test('RS24: whatever is typed on Something else, the next screen shows the urgent line and its numbers above the steps', () => {
    for (const t of ['I feel strange today', 'my head is loud', 'something I cannot name', '']) {
      const what = JSON.stringify(t);
      const root = typedTo(t);
      assert.ok(!root.querySelector('[data-testid="sos-crisis"]') && !root.querySelector('[data-testid="sos-urgent"]'), what + ': no match, no urgent view');
      const lead = root.querySelector('[data-testid="sos-urgent-lead"]');
      assert.ok(lead, what + ': the urgent line is on the next screen');
      assert.ok(lead.textContent.includes(H.LEAD.line), what + ': its line');
      const nums = lead.querySelectorAll('a').filter((a) => String(a.attrs.href || '').startsWith('tel:'));
      assert.equal(nums.length, 2, what + ': two numbers, each one tap');
      assert.ok(nums.every((a) => /^Call /.test(a.attrs['aria-label'] || '')), what + ': each says whom it calls');
      const title = root.querySelector('.sos-title');
      const all = order(root);
      assert.ok(title && all.indexOf(lead) < all.indexOf(title), what + ': above the steps');
      assert.equal(title.textContent.trim(), H.COPY.wave.title, what + ': the steps follow');
    }
    assert.deepEqual(H.leadList('in', C()).map((i) => i.number), ['112', '14416'], 'India: the emergency number and the first crisis line');
    const intl = H.leadList('intl', C());
    assert.ok(intl.length >= 1 && intl.length <= 2 && intl.every((i) => i.tel), 'elsewhere: one or two lines, each with a number, never none (RS24 remainder)');
    assert.equal(H.LEAD.clinicalReview, true, 'marked for clinical review');
    assert.ok(typedTo('I wanna be dead').querySelector('[data-testid="sos-crisis"]'), 'a match still opens the crisis view at once');
    const d = sosDom();
    const root = d.open(['sos', 'feeling']);
    d.tapId(root, 'sos-feeling-' + d.calm());
    assert.ok(!root.querySelector('[data-testid="sos-urgent-lead"]'), 'a named feeling: the steps as before');
  });
  test('RS25: typed took too many pills, taken too many sleeping pills or used too much opens the full urgent view with the overdose card', () => {
    for (const t of ['I took too many pills', "I've taken too many sleeping pills", 'I used too much', 'she took too many of her tablets', 'I’ve taken too many meds']) {
      assert.equal(H.isOverdoseText(t), true, t);
      const root = typedTo(t);
      assert.ok(root.querySelector('[data-testid="sos-urgent"]'), t + ': the full urgent view');
      assert.ok(!root.querySelector('[data-testid="sos-crisis"]'), t + ': not the crisis view');
      assert.ok(root.querySelector('[data-testid="urgent-number-1"]'), t + ': the numbers at once');
      assert.ok(root.querySelectorAll('summary').some((s) => s.textContent.trim() === H.COPY.overdose), t + ': with the overdose card');
    }
    for (const t of ['I took too many breaks', 'I used to run', 'too many people', 'I took my pills']) assert.equal(H.isOverdoseText(t), false, t);
  });
  test('RS28: typed overdose words open the urgent view with the overdose card open and its first line announced', () => {
    const card = (root) => root.querySelectorAll('details').find((x) => { const s = x.querySelector('summary'); return s && s.textContent.trim() === H.COPY.overdose; });
    for (const t of ['I think I overdosed', 'I took too many pills', 'I want to overdose on purpose']) {
      const root = typedTo(t);
      assert.ok(card(root), t + ': the overdose card');
      assert.equal(card(root).getAttribute('open'), '', t + ': open');
      const line = root.querySelector('.sos-line');
      assert.equal(line.textContent.trim(), H.COPY.urgent.line, t + ': the first line');
      assert.equal(line.getAttribute('aria-live'), 'assertive', t + ': announced at once');
    }
    const plain = sosDom().open(['sos', 'urgent']);
    assert.ok(card(plain) && card(plain).getAttribute('open') === null, 'Urgent help from the hub: the card stays closed');
    assert.equal(plain.querySelector('.sos-line').getAttribute('aria-live'), null, 'and nothing is announced over the page');
  });
  // a craving session tapped through to No: its save comes at the end
  const craving = (d, A) => {
    const root = d.open(['sos', 'craving'], null, A);
    for (const id of ['sos-rate-skip', 'sos-checkin', 'sos-reassess-passed', 'sos-used-no']) d.tapId(root, id);
    return root;
  };
  test('RS26: a save refused LOCKED after its notebook was erased or replaced is dropped, never retried or kept for it', async () => {
    const stale = () => Object.assign(new Error('This changed in another tab, so nothing was saved here.'), { code: 'LOCKED' });
    const told = (d, msg) => d.toasts.some((t) => t[0] === msg);
    // another tab erased the PIN-protected notebook: this tab's store resyncs to no lock row, reads open, and refuses
    await S().lock.set('2468');
    let calls = 0;
    const A = Object.assign({}, Actions, { sosSession: async (p) => { calls += 1; if (calls === 1) { await S().lock.remove('2468'); throw stale(); } return Actions.sosSession(p); } });
    const d = sosDom();
    craving(d, A);
    // FIX-R8 C-R7-1: the stub's remove makes a real key on the real Store; wait for the refusal's end, then the margin it had
    await until(() => told(d, H.COPY.notSaved) || told(d, H.COPY.lockedKept) || calls > 1, 'the refused save ends');
    await d.settle();
    assert.equal(calls, 1, 'the lock row went away: never tried again');
    assert.equal(events('SosCompleted').length, 0, 'nothing written into the erased notebook');
    assert.ok(told(d, H.COPY.notSaved) && !told(d, H.COPY.lockedKept), 'told it was not saved, never that it waits');
    await Actions.settings.patch({ theme: 'dark' });
    await d.settle();
    assert.equal(calls, 1, 'nothing kept to write later');
    // this tab's import (the C2 signal) came while the save was being refused
    await S().resetAll();
    await Actions.contacts.add({ name: 'Ravi', role: 'safetyNet', phone: '+91 98765 43210' });
    const backup = S().exportJson();
    let n2 = 0;
    const B = Object.assign({}, Actions, { sosSession: async (p) => { n2 += 1; if (n2 === 1) { await Actions.importBackup(backup); throw stale(); } return Actions.sosSession(p); } });
    const d2 = sosDom();
    craving(d2, B);
    await d2.settle(); await d2.settle();
    assert.equal(n2, 1, 'replaced in the meantime: never tried again');
    assert.equal(events('SosCompleted').length, 0, 'nothing written into the imported notebook');
    // kept while locked, then the lock row went away (erased in another tab) before the next notify
    await S().resetAll();
    await S().lock.set('2468');
    S().lock.lockNow();
    const d3 = sosDom();
    craving(d3, Actions);
    await d3.settle();
    assert.ok(told(d3, H.COPY.lockedKept), 'kept for the unlock');
    await S().lock.remove('2468');
    await Actions.settings.patch({ theme: 'light' });
    await d3.settle();
    assert.equal(events('SosCompleted').length, 0, 'a kept save never moves into another notebook');
    craving(sosDom(), Actions);
    await d3.settle();
    assert.equal(events('SosCompleted').length, 1, 'a save on the notebook as it is goes in');
  });
  test('RS27: a kept save dropped after the unlock says This was not saved., once; It goes in your log when you unlock. stays', async () => {
    const count = (d, msg) => d.toasts.filter((t) => t[0] === msg).length;
    assert.equal(H.COPY.keptLost, 'This was not saved.');
    assert.ok(H.COPY.slipStart.kept.startsWith('It goes in your log when you unlock.'), 'the RS21 line stays');
    await S().lock.set('2468');
    S().lock.lockNow();
    let refuse = false;
    const A = Object.assign({}, Actions, { sosSession: (p) => (refuse ? Promise.reject(Object.assign(new Error('The device refused the write.'), { code: 'WRITE_FAILED' })) : Actions.sosSession(p)) });
    const d = sosDom();
    craving(d, A);
    await d.settle();
    craving(d, A);
    await d.settle();
    assert.equal(count(d, H.COPY.lockedKept), 2, 'two saves kept for the unlock');
    refuse = true;
    assert.ok(await S().lock.unlock('2468'));
    await d.settle(); await d.settle();
    assert.equal(events('SosCompleted').length, 0, 'the device refused both after the unlock');
    assert.equal(count(d, H.COPY.keptLost), 1, 'one toast says so');
    // a kept save whose notebook went away (RS26) says so too
    await S().resetAll();
    await S().lock.set('2468');
    S().lock.lockNow();
    const d2 = sosDom();
    craving(d2, Actions);
    await d2.settle();
    await S().lock.remove('2468');
    await Actions.settings.patch({ theme: 'dark' });
    await d2.settle();
    assert.equal(events('SosCompleted').length, 0);
    assert.equal(count(d2, H.COPY.keptLost), 1, 'dropped at the notify: told once');
  });
  // -- FIX-R4 tests end --
});

// ── FIX-R5 (2026-11-07, rulings 17:04): the safety re-check's items at 5c2e7a7: RS24's remainder, RS29 to RS32, RS22's test ──
describe('review round 5 fixes (FIX-R5)', () => {
  const H = require(src('ui-sos.js'));
  before(async () => { if (typeof S().load === 'function') await S().load(); });
  beforeEach(async () => { await S().resetAll(); });
  // an SOS page with the profile given (its region is read while unlocked)
  const page = (d, parts, profile) => {
    const root = d.UI.pages.sos({ route: { parts, query: {} }, A: Actions, view: S().view, E: null, profile: profile || {} });
    d.doc.body.replaceChildren(root);
    return root;
  };
  // the feeling flow's Something else, typed and sent with Next
  const typedIn = (d, t, profile) => {
    const root = page(d, ['sos', 'feeling'], profile);
    d.tapId(root, 'sos-feeling-other');
    root.querySelectorAll('input').find((i) => i.attrs.id === 'sos-feel-text').value = t;
    d.tap(root, 'Next');
    return root;
  };
  // the trunk's Content.resources.intl (SCREENS U-31a, 9b319256 content-core.js:443-450) by a stand-in of its shape:
  // the local emergency line has tel, not number
  const TRUNK_INTL = {
    name: 'Elsewhere',
    lines: [
      { name: 'Find a Helpline (directory by country)', url: 'https://findahelpline.com', verify: true },
      { name: 'Befrienders Worldwide (directory)', url: 'https://befrienders.org', verify: true },
      { name: 'Your local emergency number', tel: '112', note: 'Usually 112, 911 or 999', verify: true },
    ],
  };
  const trunkRes = () => Object.assign({}, C().resources, { intl: TRUNK_INTL });
  // fn runs with Content.resources swapped (a page made inside keeps the stand-in); the real Content goes back after
  const withResources = (resources, fn) => {
    const real = globalThis.Content;
    globalThis.Content = Object.assign({}, real, { resources });
    try { return fn(); } finally { globalThis.Content = real; }
  };
  test('RS29: a Content line with tel and no number is one tap: Elsewhere on Urgent help, the lock screen and the crisis view, and the intl lead', () => {
    withResources(trunkRes(), () => {
      const sec = H.urgentList('intl', C()).sections.find((s) => s.id === 'intl');
      assert.ok(sec && sec.items.some((i) => i.name === 'Your local emergency number' && i.number === '112' && i.tel === 'tel:112'), 'the model reads tel');
      const d = sosDom();
      const views = [
        ['Urgent help', page(d, ['sos', 'urgent'], { region: 'intl' })],
        ['the lock screen', d.UI.sosUrgentView({})],
        ['the crisis view', typedIn(sosDom(), 'I wanna be dead', { region: 'intl' })],
      ];
      for (const [what, root] of views) {
        const elsewhere = root.querySelectorAll('section').find((s) => s.attrs['aria-label'] === 'Elsewhere');
        assert.ok(elsewhere, what + ': the Elsewhere section');
        assert.ok(elsewhere.querySelectorAll('a').some((a) => a.attrs.href === 'tel:112'), what + ': its local emergency line is one tap');
      }
      const lead = typedIn(sosDom(), 'I feel strange today', { region: 'intl' }).querySelector('[data-testid="sos-urgent-lead"]');
      const call = lead && lead.querySelectorAll('a').find((a) => a.attrs.href === 'tel:112');
      assert.ok(call && call.textContent.includes('Your local emergency number'), 'the intl lead: the local emergency line, one tap');
    });
  });
  test('RS24 remainder: the lead above the steps always has a number to tap, in every region and whatever Content holds, and All urgent help', () => {
    const tels = (lead) => lead.querySelectorAll('a').filter((a) => String(a.attrs.href || '').startsWith('tel:'));
    // FIX-R8 C-R7-3: Content.resources whose intl lines carry no number (number or tel, RS29), whatever this tree's
    // Content holds: the trunk's has the local emergency line with tel, so the real one is no such case there
    const noNumber = () => {
      const r = C().resources || {};
      const intl = r.intl || {};
      return Object.assign({}, r, { intl: Object.assign({}, intl, { lines: (intl.lines || []).filter((l) => !(l && (l.number || l.tel))) }) });
    };
    const cases = [ // [what, Content.resources (null: the real one), region, the built-in number expected]
      ['India', null, 'in', false],
      ['Somewhere else, the real Content', null, 'intl', false],
      ['Somewhere else, the trunk shape', trunkRes(), 'intl', false],
      ['Somewhere else, no line with a number', noNumber(), 'intl', true],
      ['India, Content.resources empty', {}, 'in', true],
      ['Somewhere else, Content.resources empty', {}, 'intl', true],
    ];
    for (const [what, res, region, builtIn] of cases) {
      const run = () => typedIn(sosDom(), 'I feel strange today', { region }).querySelector('[data-testid="sos-urgent-lead"]');
      const lead = res ? withResources(res, run) : run();
      assert.ok(lead, what + ': the lead');
      const nums = tels(lead);
      assert.ok(nums.length >= 1, what + ': at least one number, one tap');
      assert.ok(nums.every((a) => /^Call /.test(a.attrs['aria-label'] || '')), what + ': each says whom it calls');
      const all = lead.querySelectorAll('a').find((a) => a.textContent.trim() === H.COPY.leadAll);
      assert.ok(all && all.attrs.href === '#/sos/urgent', what + ': All urgent help, one tap');
      if (builtIn) {
        assert.equal(nums[0].attrs.href, 'tel:112', what + ': the built-in emergency number');
        assert.ok(lead.textContent.includes(H.COPY.checkOne), what + ': Please check this number.');
      }
    }
    for (const region of ['in', 'intl']) {
      for (const C2 of [{ resources: {} }, { resources: null }, null]) assert.ok(H.leadList(region, C2).length >= 1, region + ': the model is never empty');
    }
  });
  // every node under root, in document order
  const order = (root) => { const out = []; const walk = (n) => { for (const k of n.kids) { out.push(k); walk(k); } }; walk(root); return out; };
  test('RS30: on Something else, the focused step title is described by the lead line, so the lead is read first', () => {
    const d = sosDom();
    const root = typedIn(d, 'I feel strange today');
    const f = d.doc.activeElement;
    assert.ok(f && String(f.attrs.class || '').split(' ').includes('sos-title'), 'a step title has the focus');
    assert.equal(f.textContent.trim(), H.COPY.wave.title, 'the first SOBER step');
    const all = order(root);
    const desc = String(f.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean)
      .map((id) => { const n = all.find((x) => x.attrs && x.attrs.id === id); return n ? n.textContent : ''; }).join(' ');
    assert.ok(desc.includes(H.LEAD.line), 'its description includes the lead line: ' + JSON.stringify(desc));
    const lead = root.querySelector('[data-testid="sos-urgent-lead"]');
    assert.ok(lead && all.indexOf(lead) < all.indexOf(f), 'the lead keeps its place above the title');
    const plain = sosDom();
    plain.tapId(page(plain, ['sos', 'feeling']), 'sos-feeling-' + plain.calm());
    const g = plain.doc.activeElement;
    assert.ok(!g || g.getAttribute('aria-describedby') === null, 'a named feeling: no lead, nothing added');
  });
  const RS31_YES = [
    'I took too many painkillers', 'I took too many paracetamol', 'I took too many medicines', "I've taken too many medications",
    'he took too many capsules', 'I took a whole bottle of pills', 'she took a whole bottle of tablets', 'I swallowed all my pills',
    'I swallowed all my tablets', 'I took a whole strip of sleeping tablets',
  ];
  for (const t of RS31_YES) {
    test('RS31: typed "' + t + '" opens the full urgent view with the overdose card open', () => {
      assert.equal(H.isOverdoseText(t), true, t);
      const root = typedIn(sosDom(), t);
      assert.ok(root.querySelector('[data-testid="sos-urgent"]') && !root.querySelector('[data-testid="sos-crisis"]'), t + ': the full urgent view');
      assert.ok(root.querySelector('[data-testid="urgent-number-1"]'), t + ': the numbers at once');
      const card = root.querySelectorAll('details').find((x) => { const s = x.querySelector('summary'); return s && s.textContent.trim() === H.COPY.overdose; });
      assert.ok(card && card.getAttribute('open') === '', t + ': the overdose card, open');
    });
  }
  test('RS31: the negatives stay out; too much to drink keeps the numbers above the steps, with no overdose card', () => {
    for (const t of ['I took my medicine', 'too many people', "I've had too much to drink", 'a whole bottle of water', 'I took my pills', 'I swallowed my pride']) {
      assert.equal(H.isOverdoseText(t), false, t);
    }
    const root = typedIn(sosDom(), "I've had too much to drink");
    assert.ok(!root.querySelector('[data-testid="sos-urgent"]') && !root.querySelector('[data-testid="sos-crisis"]'), 'no urgent view');
    assert.ok(root.querySelector('[data-testid="sos-urgent-lead"]'), 'the numbers above the steps');
    assert.ok(!root.querySelectorAll('summary').some((s) => s.textContent.trim() === H.COPY.overdose), 'no overdose card');
    assert.equal(H.OVERDOSE.clinicalReview, true, 'marked for clinical review');
  });
  const RS32_YES = [
    "I hope that I don't wake up", 'I wish it would all just end', 'I wish it would just stop', 'I want it all to stop',
    "I can't do this anymore", 'no one would miss me', "I'd be better off gone", 'I want to sleep forever',
  ];
  for (const t of RS32_YES) {
    test('RS32: typed "' + t + '" opens the crisis view', () => {
      assert.equal(H.isCrisisText(t, null), true, t);
      const root = typedIn(sosDom(), t);
      assert.ok(root.querySelector('[data-testid="sos-crisis"]'), t + ': the crisis view');
      assert.ok(root.querySelector('[data-testid="urgent-number-1"]'), t + ': the numbers at once');
    });
  }
  test('RS32: the crisis list stays marked for clinical review and leaves plain lines to the lead', () => {
    assert.equal(H.CRISIS.clinicalReview, true);
    for (const t of ['I could not sleep', 'I miss my friends', 'I can do this', 'I want to stop drinking']) assert.equal(H.isCrisisText(t, null), false, t);
  });
  // ── FIX-R6 (2026-11-07, rulings 17:22 and 17:57): RS33, Q-BUILTIN, Q-SPIRAL (RS-SAMPLE and RS9T sit with U-09) ──
  describe('review round 6 fixes (FIX-R6)', () => {
    beforeEach(async () => { await S().resetAll(); });
    const NOTE = 'Usually 112, 911 or 999'; // the trunk's note beside its local emergency line (TRUNK_INTL)
    test('RS33: a line shows its note with or without a number: Usually 112, 911 or 999 beside the one-tap 112 on Urgent help, the lock screen, the crisis view and the intl lead', () => {
      withResources(trunkRes(), () => {
        const d = sosDom();
        const views = [
          ['Urgent help', page(d, ['sos', 'urgent'], { region: 'intl' })],
          ['the lock screen', d.UI.sosUrgentView({})],
          ['the crisis view', typedIn(sosDom(), 'I wanna be dead', { region: 'intl' })],
        ];
        for (const [what, root] of views) {
          const elsewhere = root.querySelectorAll('section').find((s) => s.attrs['aria-label'] === 'Elsewhere');
          assert.ok(elsewhere, what + ': the Elsewhere section');
          const note = elsewhere.querySelectorAll('span').find((s) => s.textContent.trim() === NOTE);
          assert.ok(note, what + ': ' + NOTE + ' is shown');
          const call = elsewhere.querySelectorAll('a').find((a) => a.attrs.href === 'tel:112');
          assert.ok(call && note.attrs.id && call.attrs['aria-describedby'] === note.attrs.id, what + ': the one-tap 112 is described by its note');
        }
        const first = C().resources.in.emergency[0];
        assert.ok(first.note && page(sosDom(), ['sos', 'urgent'], { region: 'in' }).textContent.includes(first.note), 'India: a line with a number shows its note too');
        const lead = typedIn(sosDom(), 'I feel strange today', { region: 'intl' }).querySelector('[data-testid="sos-urgent-lead"]');
        const lnote = lead && lead.querySelectorAll('span').find((s) => s.textContent.trim() === NOTE);
        const lcall = lead && lead.querySelectorAll('a').find((a) => a.attrs.href === 'tel:112');
        assert.ok(lnote && lcall && lcall.attrs['aria-describedby'] === lnote.attrs.id, 'the intl lead: the note beside its 112, and the link described by it');
      });
    });
    test('Q-BUILTIN: with no number from Content, Urgent help, the crisis view and the lock screen list show the built-in 112 with Please check this number.', () => {
      const links = { intl: { name: 'Elsewhere', lines: TRUNK_INTL.lines.filter((l) => !l.tel && !l.number) } };
      for (const [what, res] of [['Content.resources empty', {}], ['Content.resources null', null], ['links only, no number', links]]) {
        withResources(res, () => {
          for (const region of ['in', 'intl']) {
            const m = H.urgentList(region, C());
            assert.equal(m.builtIn, true, what + ', ' + region + ': the model says built-in');
            assert.equal(m.sections[0].items[0].number, '112', what + ', ' + region + ': the region list starts with it');
            const views = [
              ['Urgent help', page(sosDom(), ['sos', 'urgent'], { region })],
              ['the crisis view', typedIn(sosDom(), 'I wanna be dead', { region })],
              ['the lock screen', sosDom().UI.sosUrgentView({ profile: { region } })],
            ];
            for (const [where, root] of views) {
              const label = what + ', ' + region + ', ' + where;
              const tels = root.querySelectorAll('a').filter((a) => String(a.attrs.href || '').startsWith('tel:'));
              assert.ok(tels.length >= 1 && tels[0].attrs.href === 'tel:112', label + ': the built-in number, one tap');
              assert.ok(/^Call /.test(tels[0].attrs['aria-label'] || ''), label + ': it says whom it calls');
              assert.ok(root.textContent.includes(H.COPY.checkOne), label + ': Please check this number.');
              assert.ok(!root.textContent.includes(H.COPY.crisisVerify), label + ': said once');
            }
          }
        });
      }
      const real = H.urgentList('in', C());
      assert.equal(real.builtIn, false, 'with numbers from Content, no built-in');
      assert.ok(real.sections.every((s) => s.items.every((i) => !i.builtIn)));
    });
    test('Q-SPIRAL: a crisis or hopeless thought the person answered in their own words keeps its pair; without a reply of theirs it is still skipped', () => {
      const mine = [
        { thought: "I can't do this anymore", reply: 'I can do the next hour.' },
        { thought: 'No one would miss me if I drank', reply: 'My sister would.' },
        { thought: 'I feel hopeless', reply: '' },
        'I want to die',
        { thought: 'I blew it', reply: 'One slip is not the whole road.' },
      ];
      assert.ok(H.isCrisisText(mine[0].thought, null) && H.isCrisisText(mine[1].thought, null), 'both are crisis text');
      assert.deepEqual(H.spiralPairs(spiralView({ pairs: mine }), { spiralThoughts: () => mine }, C()), [ // RS35: their words are in their response
        { thought: "I can't do this anymore", reply: 'I can do the next hour.' },
        { thought: 'No one would miss me if I drank', reply: 'My sister would.' },
        { thought: 'I blew it', reply: 'One slip is not the whole road.' },
      ]);
    });
    // RS35: the trunk's Engine.spiralThoughts (42d2467d engine.js:719-728) by a stand-in of its behaviour: the latest
    // spiral response's thoughts with their replies, a missing reply filled with a stock slipSelfTalk line.
    const trunkSpiral = { spiralThoughts: (view) => {
      const r = view ? view.list('responses').filter((x) => x.exerciseId === 'spiral' && !x.draft).pop() : null;
      const p = (r && r.payload) || {};
      const stock = C().catalogs.slipSelfTalk.map((x) => (typeof x === 'string' ? x : x.text));
      const got = Array.isArray(p.pairs) ? p.pairs.map((x) => (typeof x === 'string' ? { thought: x, reply: '' } : { thought: x.thought, reply: x.reply || '' }))
        : (p.thoughts || []).map((t, i) => ({ thought: t, reply: (p.replies || [])[i] || '' }));
      return got.map((x, i) => ({ thought: x.thought, reply: x.reply || stock[i % stock.length] }));
    } };
    function spiralView(payload, extra) {
      const at = '2026-11-01T10:00:00.000Z';
      const rows = [Object.assign({ id: 'r1', exerciseId: 'spiral', mode: 'full', draft: false, at, payload }, extra)];
      return { list: (s) => (s === 'responses' ? rows.slice() : []), get: () => null, count: (s) => (s === 'responses' ? rows.length : 0) };
    }
    test("RS35: on the trunk engine's shape, a crisis or hopeless thought never gets the stock line the engine fills in; only a reply the person saved keeps its pair", () => {
      const stock = C().catalogs.slipSelfTalk.map((x) => (typeof x === 'string' ? x : x.text));
      const ticked = spiralView({ thoughts: ['I want to die', 'No one would miss me', 'I feel hopeless', 'I blew it'] });
      const filled = trunkSpiral.spiralThoughts(ticked);
      assert.ok(filled.length === 4 && filled.every((x) => stock.includes(x.reply)), 'the stand-in fills every missing reply with a stock line');
      assert.deepEqual(H.spiralPairs(ticked, trunkSpiral, C()), [{ thought: 'I blew it', reply: filled[3].reply }], 'no crisis or hopeless thought is paired with a stock line');
      const answered = spiralView({ pairs: [{ thought: 'I want to die', reply: 'I will call my sister tonight.' }, { thought: 'I feel hopeless', reply: '' },
        { thought: 'No one would miss me', reply: stock[0] }, 'I blew it'] });
      assert.deepEqual(H.spiralPairs(answered, trunkSpiral, C()), [
        { thought: 'I want to die', reply: 'I will call my sister tonight.' },
        { thought: 'I blew it', reply: stock[3 % stock.length] },
      ], 'the reply the person wrote keeps its pair; a stock line they saved is still a stock line');
      const sample = spiralView({ pairs: [{ thought: 'I want to die', reply: 'I will call my sister tonight.' }] }, { sample: true });
      assert.deepEqual(H.spiralPairs(sample, trunkSpiral, C()), [], "a sample row's reply is not the person's own words (O6)");
      assert.deepEqual(H.spiralPairs(null, trunkSpiral, C()).map((p) => p.thought), C().catalogs.spiral.filter((t) => !/hopeless/i.test(t) && !H.isCrisisText(t, null)),
        'with no view (a preview, or locked), the catalog without its crisis and hopeless thoughts');
    });
    test("RS37: the person's edit of a sample contact makes it theirs: unmarked, in SOS's Call someone, kept by eraseSample", async () => {
      // the trunk's sample contacts (42d2467d content-sample.js:146-150) by a stand-in of their shape: invented, no phone number
      const sc = { id: 'smp-con-1', name: 'Asha (sample)', role: 'safetyNet', strategy: null, phone: '', note: 'Sister. Calls back the same day.', active: true, sample: true };
      const other = Object.assign({}, sc, { id: 'smp-con-2', name: 'Vikram (sample)', note: 'Friend from the walking group.' });
      await withSample({ generate: () => ({ stores: { contacts: [sc, other] } }) }, () => Actions.loadSample());
      assert.equal(S().view.get('contacts', sc.id).sample, true, 'loaded, marked');
      await Actions.contacts.update(sc.id, { name: 'Asha', phone: '+91 98765 43210' });
      const row = S().view.get('contacts', sc.id);
      assert.notEqual(row.sample, true, "the edited contact is the person's own");
      assert.deepEqual([row.name, row.phone, row.note, row.role, row.active], ['Asha', '+91 98765 43210', sc.note, 'safetyNet', true], 'the edit over the rest of the row');
      assert.deepEqual(H.activeContacts(S().view).map((c) => c.name), ['Asha'], 'Call someone shows it');
      await Actions.eraseSample();
      assert.deepEqual(S().view.get('contacts', sc.id), row, 'eraseSample keeps it as it was');
      assert.equal(S().view.get('contacts', other.id), null, 'and takes the sample contact nobody edited');
    });
    test("RS36: a sample profile is not the person's onboarding: after the sample on a fresh notebook, #/today still goes to onboarding once; their own onboarding ends it", async () => {
      const route = (path) => ({ path, parts: path.split('/').filter(Boolean), query: {} });
      await withSample(TRUNK_SAMPLE, async () => {
        await Actions.loadSample();
        const me = S().view.get('profile', 'me');
        assert.ok(me && me.sample === true && me.onboardedAt, 'the sample profile carries onboardedAt, as the trunk sample does');
        const d = sosDom({ onboarding: true });
        const O = d.UI.onboardingHelpers;
        assert.equal(O.shouldOnboard(route('/today'), S()), true, 'still a new person on Today');
        assert.equal(O.shouldOnboard(route('/'), S()), true, 'and on #/');
        d.fire('ui:route', route('/today'));
        await d.settle();
        assert.deepEqual(d.go, ['#/onboarding'], 'sent to onboarding, once');
        const v = sosDom({ onboarding: true }); // Look around with sample data, then I understand: Today, not sent back in this visit
        const root = v.onb({});
        v.tapId(root, 'onb-sample');
        await v.settle();
        v.tapId(root, 'onb-safety-ok');
        v.fire('ui:route', route('/today'));
        await v.settle();
        assert.deepEqual(v.go, ['#/today'], 'no loop back to onboarding in this visit');
        await Actions.onboard({ name: 'Asha' });
        assert.equal(O.shouldOnboard(route('/today'), S()), false, 'their own onboarding ends it');
        await Actions.eraseSample();
        assert.equal(O.shouldOnboard(route('/today'), S()), false, 'and it stays ended once the sample is erased');
      });
    });
    // -- FIX-R6 tests end --
  });
  // ── FIX-R7 (2026-11-07, ruling 22:52): RS37R, RS38 (U-09), RS36R (U-10) ──
  describe('review round 7 fixes (FIX-R7)', () => {
    beforeEach(async () => { await S().resetAll(); });
    // the trunk's sample rows (build/offline-v1 content-sample.js:146-172) by stand-ins of their shape
    const ISO = '2026-03-05T20:00:00.000Z';
    const smp = () => ({
      contacts: [{ id: 'smp-con-1', name: 'Asha (sample)', role: 'safetyNet', strategy: null, phone: '', note: 'Sister. Calls back the same day.', active: true, sample: true }],
      plans: [
        { id: 'smp-plan-1', date: daysAgo(-3), start: '19:00', end: '22:00', status: 'planned', sample: true, title: 'Office farewell dinner', kind: 'risky', risky: true,
          battlePlan: { situation: 'Office farewell dinner', plan: 'Order a lime soda first and sit with Vikram.', backups: ['Step outside and call Asha.', 'Leave by ten.'], buddyId: 'smp-con-1', exit: 'Leave after the speeches.' } },
        { id: 'smp-plan-2', date: daysAgo(-1), start: '18:30', end: '19:15', status: 'planned', sample: true, title: 'Evening walk', kind: 'want', risky: false, activity: 'A walk at dawn or dusk', reward: 'A favourite film after.' },
        { id: 'smp-plan-3', date: daysAgo(-2), start: '10:00', end: '11:00', status: 'planned', sample: true, title: 'Support group', kind: 'recovery', risky: false },
      ],
      todos: [{ id: 'smp-todo-1', text: 'Clear the space at home', source: 'lesson', route: '#/learn/m4', due: null, done: false, at: ISO, sample: true }],
      predictions: [{ id: 'smp-pred-1', activity: 'Evening walk', predicted: 30, actual: 70, at: ISO, completedAt: ISO, notes: 'Better than I thought.', sample: true }],
    });
    const loadSmp = () => withSample({ generate: () => ({ stores: smp() }) }, () => Actions.loadSample());
    const row = (s, id) => S().view.get(s, id);
    test("RS37R: the person's change over a sample plan, a debrief or a prediction's result makes the row theirs: unmarked, kept by eraseSample", async () => {
      await loadSmp();
      for (const [s, id] of [['plans', 'smp-plan-1'], ['plans', 'smp-plan-3'], ['predictions', 'smp-pred-1']]) assert.equal(row(s, id).sample, true, id + ': loaded, marked');
      await Actions.plans.update('smp-plan-1', { title: 'Dinner with my team on Friday' });
      await Actions.plans.debrief('smp-plan-3', { usedPlan: true, how: 'I ordered a soda first and left at ten.' });
      await Actions.predictions.complete('smp-pred-1', { actual: 8, notes: 'Calmer than I thought.' });
      const mine = [row('plans', 'smp-plan-1'), row('plans', 'smp-plan-3'), row('predictions', 'smp-pred-1')];
      assert.deepEqual(mine.map((r) => r.sample === true), [false, false, false], "each row is the person's own");
      assert.deepEqual([mine[0].title, mine[1].debrief.how, mine[2].actual, mine[2].notes], ['Dinner with my team on Friday', 'I ordered a soda first and left at ten.', 8, 'Calmer than I thought.']);
      await Actions.eraseSample();
      assert.deepEqual([row('plans', 'smp-plan-1'), row('plans', 'smp-plan-3'), row('predictions', 'smp-pred-1')], mine, 'eraseSample keeps their words as they were');
    });
    test('RS37R: a patch that changes nothing, or only true/false flags, keeps the mark: a ticked to-do, a hidden contact, a plan with the same title and a flag; eraseSample takes them', async () => {
      await loadSmp();
      await Actions.todos.done('smp-todo-1');
      await Actions.contacts.deactivate('smp-con-1');
      await Actions.plans.update('smp-plan-2', { title: 'Evening walk', risky: true });
      const got = [row('todos', 'smp-todo-1'), row('contacts', 'smp-con-1'), row('plans', 'smp-plan-2')];
      assert.deepEqual(got.map((r) => r.sample), [true, true, true], "still the sample's words");
      assert.deepEqual([got[0].done, got[1].active, got[2].risky], [true, false, true], 'the flags are written');
      await Actions.eraseSample();
      assert.deepEqual([row('todos', 'smp-todo-1'), row('contacts', 'smp-con-1'), row('plans', 'smp-plan-2')], [null, null, null], 'eraseSample takes them');
    });
    test('RS38: contacts.update keeps the sample mark for a patch that changes nothing (the same name; Save with no edit) or only a flag (Show again); eraseSample takes the contact', async () => {
      await loadSmp();
      const sc = smp().contacts[0];
      await Actions.contacts.update(sc.id, { name: sc.name });
      assert.equal(row('contacts', sc.id).sample, true, "the same name: still the sample's");
      // the trunk's Save sends the whole form (ui-workbook.js:319, contactPayload :127-133): with no edit, the same values
      await Actions.contacts.update(sc.id, { name: sc.name, role: sc.role, strategy: sc.strategy, phone: sc.phone, note: sc.note });
      assert.equal(row('contacts', sc.id).sample, true, "Save with no edit: still the sample's");
      await Actions.contacts.deactivate(sc.id);
      await Actions.contacts.update(sc.id, { active: true }); // the trunk's showContact (ui-workbook.js:281)
      assert.deepEqual([row('contacts', sc.id).sample, row('contacts', sc.id).active], [true, true], "Show again: shown, still the sample's");
      await Actions.eraseSample();
      assert.equal(row('contacts', sc.id), null, 'eraseSample takes it');
    });
    test("RS36R: SOS reads the stage from the person's own profile only: with the sample profile the feeling flow asks no motivation and writes none; with their own at stage action it asks", async () => {
      await withSample(TRUNK_SAMPLE, () => Actions.loadSample());
      assert.equal(S().view.get('profile', 'me').stage, 'action', 'the sample profile, at stage action, is the one handed to SOS (trunk ui-core.js:590)');
      const toEnd = async (d, root) => { d.tapId(root, 'sos-feeling-' + d.calm()); d.toRating(root); d.rate(root, 3); await d.settle(); return root; };
      const d = sosDom();
      const sampleRoot = await toEnd(d, d.open(['sos', 'feeling']));
      assert.ok(!sampleRoot.querySelector('[data-testid="sos-motivation"]'), "no motivation question from the sample's stage");
      assert.ok(sampleRoot.querySelector('[data-testid="sos-finish"]'), 'the flow ends: Finish');
      assert.equal(list('motivation').length, 0, 'no motivation row written');
      const v = sosDom();
      const ownRoot = await toEnd(v, page(v, ['sos', 'feeling'], { key: 'me', name: 'Asha', stage: 'action' }));
      const ask = ownRoot.querySelector('[data-testid="sos-motivation"]');
      assert.ok(ask, 'their own stage: the motivation question');
      ask.querySelectorAll('button')[6].click();
      await v.settle();
      assert.deepEqual(list('motivation').map((m) => [m.stage, m.score, m.source, m.sample === true]), [['action', 6, 'sos', false]]);
    });
    test("RS36R: SOS reads the region from the person's own profile only, India by default: a sample profile's region orders no list and picks no lead number", () => {
      // a stand-in sample profile away from the default ('intl'): the trunk's sample says 'in', the default, where it would not show
      const d = sosDom();
      const heads = (profile) => d.UI.sosUrgentView({ profile }, {}).querySelectorAll('h2').map((x) => x.textContent.trim());
      const tels = (profile) => typedIn(sosDom(), 'I feel strange today', profile).querySelector('[data-testid="sos-urgent-lead"]')
        .querySelectorAll('a').map((a) => String(a.attrs.href || '')).filter((x) => x.startsWith('tel:'));
      assert.notDeepEqual(heads({ region: 'intl' }), heads({ region: 'in' }), "the person's own region orders the urgent lists");
      assert.notDeepEqual(tels({ region: 'intl' }), tels({ region: 'in' }), 'and picks the lead numbers');
      assert.deepEqual(heads({ region: 'intl', sample: true }), heads({ region: 'in' }), "a sample profile's region is not read: India first, the default");
      assert.deepEqual(tels({ region: 'intl', sample: true }), tels({ region: 'in' }), "nor for the lead's numbers");
      assert.deepEqual(heads({ region: 'intl', sample: true }), heads(undefined), 'the same as no profile');
    });
    // -- FIX-R7 tests end --
  });
  // -- FIX-R5 tests end --
});

// ── V3 (2026-11-08, PLAN-V3.md): V-08a Actions.useSkill; V-SOS10 the SOS rating row at 390 px ──
describe('V3 actions-sos (V-08a, V-SOS10)', () => {
  beforeEach(async () => { await S().resetAll(); });
  // useSkill never throws: the call and its promise are both guarded, so a throw fails the test by name
  async function useSkill(arg) {
    assert.equal(typeof Actions.useSkill, 'function', 'Actions.useSkill is exported');
    let p;
    assert.doesNotThrow(() => { p = Actions.useSkill(arg); }, 'no synchronous throw');
    assert.ok(p && typeof p.then === 'function', 'useSkill returns a promise');
    try { return await p; } catch (e) { return assert.fail(`useSkill threw ${e && e.code}: ${e && e.message}`); }
  }
  const PAYLOAD_KEYS = ['helpful', 'skillId'];

  test('V-08a useSkill writes SkillUsed with the right fields', async () => {
    const r = await useSkill({ skillId: 'ride-wave', helpful: true });
    assert.equal(r.ok, true, `refused: ${r.code} ${r.message}`);
    assert.equal(r.event.type, 'SkillUsed');
    assert.deepEqual(r.event.payload, { skillId: 'ride-wave', helpful: true }, 'exactly skillId and helpful, no logId');
    assert.match(r.event.at, ISO_RE);
    assert.equal(typeof r.event.id, 'string');
    assert.equal(r.event.sample, undefined, "the person's own, unmarked");
    assert.deepEqual(events('SkillUsed').map((e) => [e.id, e.payload]), [[r.event.id, { skillId: 'ride-wave', helpful: true }]], 'one row, the one returned');
    assert.equal(list('logs').length, 0, 'no log row: a skill used in a game or a tool');
    // helpful false; keys beyond the two are not written (the ruling refuses only the four cases below)
    const r2 = await useSkill({ skillId: 'distract', helpful: false, logId: 'not-mine', note: 'x' });
    assert.equal(r2.ok, true);
    assert.deepEqual(Object.keys(r2.event.payload).sort(), PAYLOAD_KEYS);
    assert.deepEqual(r2.event.payload, { skillId: 'distract', helpful: false });
    assert.equal(events('SkillUsed').length, 2, 'every use is its own event: not once-only');
    // credited: the Engine counts it for the skill's mastery
    const m = E().mastery(events());
    assert.equal(m['ride-wave'].uses, 1);
    assert.equal(m.distract.uses, 1);
    // recordEvent still refuses SkillUsed: the verb is the way in (USEVERB)
    await refused(Actions.recordEvent('SkillUsed', { skillId: 'ride-wave', helpful: true }), 'USE_VERB');
    assert.equal(events('SkillUsed').length, 2);
  });

  test('V-08a useSkill XP follows the Engine rule', async () => {
    const xp = C().xp;
    const base = xp.SkillUsed;
    const full = Number(xp.repeatFull);
    const half = Number(xp.repeatHalf);
    assert.ok(base > 0 && full >= 1 && half >= full, 'Content.xp has the SkillUsed rule');
    const now = new Date();
    const got = () => E().xpFromEvents(events(), now).byType.SkillUsed || 0;
    const total = () => E().xpFromEvents(events(), now).total;
    let want = 0;
    let last = total();
    for (let n = 1; n <= half + 1; n += 1) {
      const r = await useSkill({ skillId: n % 2 ? 'ride-wave' : 'distract', helpful: n % 2 === 1 });
      assert.equal(r.ok, true, `use ${n}: ${r.code}`);
      assert.deepEqual(Object.keys(r.event.payload).sort(), PAYLOAD_KEYS, 'Actions writes no XP of its own');
      const step = n <= full ? base : n <= half ? Math.floor(base / 2) : 0;
      want += step;
      assert.equal(got(), want, `use ${n} of the day`);
      assert.ok(total() >= last, 'XP never decreases');
      last = total();
    }
    assert.equal(base, 5, 'the first use of a day is worth 5 (content-core.js xp.SkillUsed)');
    assert.ok(Math.floor(base / 2) < base, 'repeats are diminished');
  });

  test('V-08a useSkill refuses without throwing and writes nothing (unknown skill, bad helpful, locked)', async () => {
    await Actions.onboard({ name: 'Asha', startDate: daysAgo(5) });
    const snap = await snapshot();
    const w = watch();
    const cases = [
      [undefined, 'bad-event'], [null, 'bad-event'], ['ride-wave', 'bad-event'], [['ride-wave', true], 'bad-event'], [7, 'bad-event'],
      [{ helpful: true }, 'bad-skill'], [{ skillId: 'no-such-skill', helpful: true }, 'bad-skill'], [{ skillId: 42, helpful: true }, 'bad-skill'],
      [{ skillId: '', helpful: true }, 'bad-skill'], [{ skillId: 'Ride the wave!', helpful: true }, 'bad-skill'],
      [{ skillId: 'ride-wave' }, 'bad-event'], [{ skillId: 'ride-wave', helpful: 1 }, 'bad-event'],
      [{ skillId: 'ride-wave', helpful: 'yes' }, 'bad-event'], [{ skillId: 'ride-wave', helpful: null }, 'bad-event'],
    ];
    for (const [arg, code] of cases) {
      const r = await useSkill(arg);
      assert.deepEqual([r.ok, r.code], [false, code], JSON.stringify(arg) || String(arg));
      assert.equal(r.event, undefined);
      assert.ok(typeof r.message === 'string' && r.message.length > 0 && r.message.length < 200, 'a short plain message');
    }
    assert.equal(w.count, 0, 'no commit');
    w.off();
    assert.deepEqual(await snapshot(), snap, 'nothing written');
    // no store: the verb's own refusal, still no throw
    const real = globalThis.Store;
    globalThis.Store = undefined;
    try {
      const r = await useSkill({ skillId: 'ride-wave', helpful: true });
      assert.deepEqual([r.ok, r.code], [false, 'no-store']);
    } finally { globalThis.Store = real; }
    // locked: the store's own refusal, passed through
    if (!S().lock || typeof S().lock.set !== 'function') return;
    await S().lock.set('2468', { autoLockMin: 5 });
    S().lock.lockNow();
    try {
      const r = await useSkill({ skillId: 'ride-wave', helpful: true });
      assert.deepEqual([r.ok, r.code], [false, 'LOCKED']);
      assert.doesNotMatch(r.message, /Asha|2468|ride-wave/, 'no person data in the message');
    } finally {
      assert.equal(await S().lock.unlock('2468'), true);
    }
    assert.equal(events('SkillUsed').length, 0, 'nothing written while locked');
    await S().lock.remove('2468');
    assert.equal((await useSkill({ skillId: 'ride-wave', helpful: true })).ok, true, 'unlocked: written');
  });

  test('V-08a useSkill: an uncoded failure inside the commit comes back as {ok: false, code: error} with the generic message, never thrown, nothing written', async () => {
    await Actions.onboard({ name: 'Asha', startDate: daysAgo(5) });
    const snap = await snapshot();
    const w = watch();
    const real = globalThis.Store;
    const uncoded = [
      ['a TypeError', new TypeError('secret detail')],
      ['a DOMException, its code a number', new DOMException('secret detail', 'QuotaExceededError')],
      ['an empty code', Object.assign(new Error('secret detail'), { code: '' })],
      ['not an error at all', null],
    ];
    try {
      for (const [name, err] of uncoded) {
        globalThis.Store = Object.assign(Object.create(real), { commit: () => { throw err; } });
        const r = await useSkill({ skillId: 'ride-wave', helpful: true }); // a throw here fails the test: the verb never throws
        assert.deepEqual([r.ok, r.code, r.message], [false, 'error', 'The skill could not be saved.'], name);
        assert.equal(r.event, undefined, name);
      }
    } finally { globalThis.Store = real; }
    assert.equal(w.count, 0, 'no commit');
    w.off();
    assert.deepEqual(await snapshot(), snap, 'nothing written');
  });

  test("V-08a useSkill with a sample loaded writes one unmarked SkillUsed, the person's own, and changes no sample row", async () => {
    await withSample(TRUNK_SAMPLE, () => Actions.loadSample());
    const sampleRows = async () => Object.fromEntries(Object.entries(await snapshot()).map(([k, rows]) => [k, rows.filter((x) => x && x.sample === true)]));
    const before = await sampleRows();
    assert.ok(before.events.length > 0, 'the sample is loaded');
    const r = await useSkill({ skillId: 'ride-wave', helpful: true });
    assert.equal(r.ok, true, `a loaded sample is not a refusal (R-C-48): ${r.code}`);
    assert.equal(r.event.sample, undefined, 'unmarked');
    assert.deepEqual(events('SkillUsed').map((e) => [e.id, e.sample === true, e.payload]), [[r.event.id, false, { skillId: 'ride-wave', helpful: true }]]);
    assert.deepEqual(await sampleRows(), before, 'no sample row changed');
    assert.equal(E().xpFromEvents(events(), new Date()).byType.SkillUsed, C().xp.SkillUsed, "credited as the person's own");
    await Actions.eraseSample();
    assert.deepEqual(events('SkillUsed').map((e) => e.id), [r.event.id], "eraseSample keeps it: the person's own");
  });

  test('V-SOS10 rating row keeps every value on one line', async () => {
    const px = (s) => { const m = /^(\d+(?:\.\d+)?)px$/.exec(String(s)); return m ? Number(m[1]) : NaN; };
    const values = Array.from({ length: 11 }, (_, n) => String(n));
    const d = sosDom();
    const craving = d.open(['sos', 'craving']); // the craving flow opens on its rating
    const feeling = d.open(['sos', 'feeling']);
    d.tapId(feeling, 'sos-feeling-' + d.calm());
    d.toRating(feeling); // the feeling flow's closing rating
    for (const [name, root] of [['craving', craving], ['feeling', feeling]]) {
      const row = d.byId(root, 'sos-rating');
      assert.equal(row.attrs.class, 'sos-rating', name);
      assert.equal(row.attrs['aria-label'], '0 to 10', `${name}: no copy change`);
      const cols = /^repeat\((\d+), minmax\((\d+)px, 1fr\)\)$/.exec(row.style.gridTemplateColumns);
      assert.ok(cols, `${name}: the grid of columns stays`);
      const btns = row.querySelectorAll('button');
      assert.deepEqual(btns.map((b) => b.dataset.value), values, `${name}: 11 buttons, data-value 0 to 10`);
      assert.deepEqual(btns.map((b) => b.textContent.trim()), values, `${name}: the numbers, nothing else`);
      for (const b of btns) {
        const at = `${name} ${b.dataset.value}`;
        assert.equal(b.style.whiteSpace, 'nowrap', `${at}: never wraps`);
        assert.equal(b.style.fontVariantNumeric, 'tabular-nums', `${at}: even digits`);
        const pl = px(b.style.paddingLeft);
        const pr = px(b.style.paddingRight);
        assert.ok(pl <= 6 && pr <= 6, `${at}: inline padding of 6 px or less (got ${b.style.paddingLeft}, ${b.style.paddingRight})`);
        assert.equal(b.style.minHeight, '56px', `${at}: the tall one-handed target stays`);
        // the narrowest column the grid allows still fits two digits: 1 px border each side, about 0.6 em a digit at 18 px
        assert.ok(Number(cols[2]) - pl - pr - 2 >= 2 * 0.6 * 18, `${at}: "10" fits in a ${cols[2]} px column`);
      }
    }
  });
});
// ── V3 V-41 (R-O-6, R-C-50): Actions.objective.done / swap and Actions.questLine.claim over the real Engine (V-40) ──
describe('V3 actions-sos V-41 (objectives and the quest line)', () => {
  beforeEach(async () => { await S().resetAll(); });
  // Content.objectives and Content.questLine come with content V-42: each test seeds them on the one Content object the
  // Engine and Actions read, and puts back what was there after. Test fixtures only, never shown.
  const OBJECTIVES = ['walk', 'water', 'call', 'breathe', 'note', 'stretch'].map((k) => ({ id: `obj-${k}`, title: `T ${k}`, line: `L ${k}`, doneBy: 'tap', grows: k }));
  const BY_EVENT = ['a', 'b', 'c', 'd'].map((k) => ({ id: `obj-ev-${k}`, title: `T ${k}`, line: `L ${k}`, doneBy: { event: 'LogCreated' }, grows: k }));
  const STEPS = [
    { id: 'qs-log', title: 'T log', line: 'L log', condition: { event: 'LogCreated', count: 1 }, reward: 'insights', opened: 'O log' },
    { id: 'qs-skill', title: 'T skill', line: 'L skill', condition: { event: 'SkillUsed', count: 1 }, reward: 'weeklyReview', opened: 'O skill' },
    { id: 'qs-two', title: 'T two', line: 'L two', condition: { event: 'SkillUsed', count: 2 }, reward: 'motivation', opened: 'O two' },
  ];
  const SEED = { objectives: OBJECTIVES, questLine: STEPS };
  const ownKey = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  async function withV41(seed, fn) {
    const had = ['objectives', 'questLine'].map((k) => [k, ownKey(C(), k), C()[k]]);
    for (const [k] of had) { if (seed[k] === undefined) delete C()[k]; else C()[k] = seed[k]; }
    try { return await fn(); } finally { for (const [k, h, v] of had) { if (h) C()[k] = v; else delete C()[k]; } }
  }
  const t41 = (name, fn, seed = SEED) => test(name, () => withV41(seed, fn));
  // the verbs never throw: the call and its promise are both guarded, so a throw fails the test by name
  async function call(group, verb, arg) {
    assert.equal(typeof (Actions[group] && Actions[group][verb]), 'function', `Actions.${group}.${verb} is exported`);
    let p;
    assert.doesNotThrow(() => { p = Actions[group][verb](arg); }, 'no synchronous throw');
    assert.ok(p && typeof p.then === 'function', 'returns a promise');
    try { return await p; } catch (e) { return assert.fail(`${group}.${verb} threw ${e && e.code}: ${e && e.message}`); }
  }
  const done = (id) => call('objective', 'done', id);
  const swap = (id) => call('objective', 'swap', id);
  const claim = (id) => call('questLine', 'claim', id);
  const nowIso = () => new Date().toISOString();
  const draw = () => E().dailyObjectives(S().view, nowIso());
  const line = () => E().questLine(S().view, nowIso());
  const today = () => E().todayStr(new Date());
  const DAY = 24 * 3600 * 1000;
  function no(r, code, what) {
    assert.deepEqual([r.ok, r.code], [false, code], `${what}: ${r.message}`);
    assert.ok(typeof r.message === 'string' && r.message.length > 0 && r.message.length < 200, 'a short plain message');
    assert.equal(r.event, undefined);
    assert.equal(r.events, undefined);
  }
  async function withEngine(patch, fn) {
    const real = globalThis.Engine;
    globalThis.Engine = Object.assign(Object.create(real), patch);
    try { return await fn(); } finally { globalThis.Engine = real; }
  }
  const FOUR = ['ObjectiveDone', 'ObjectiveSwapped', 'QuestLineStepDone', 'FeatureUnlocked'];
  const four = () => events().filter((e) => FOUR.includes(e.type));

  t41('V-41 objective.done writes ObjectiveDone {id,date} once a day', async () => {
    const d = draw();
    assert.equal(d.items.length, 3, 'three a day (the Engine)');
    const id = d.items[0].id;
    const r = await done(id);
    assert.equal(r.ok, true, `refused: ${r.code} ${r.message}`);
    assert.equal(r.event.type, 'ObjectiveDone');
    assert.deepEqual(r.event.payload, { id, date: today() }, 'exactly id and the local date');
    assert.match(r.event.at, ISO_RE);
    assert.equal(r.event.sample, undefined, "the person's own, unmarked");
    assert.deepEqual(events('ObjectiveDone').map((e) => e.id), [r.event.id], 'one row, the one returned');
    assert.equal(draw().items.find((o) => o.id === id).done, true, 'the Engine reads it as done');
    assert.equal(list('logs').length, 0, 'no other row');
    shiftClock(DAY);
    try {
      const next = draw().items[0].id;
      const r2 = await done(next);
      assert.equal(r2.ok, true, `the next day: ${r2.code}`);
      assert.deepEqual(r2.event.payload, { id: next, date: today() }, 'a new day, a new event');
      assert.notEqual(r2.event.payload.date, r.event.payload.date);
      assert.equal(events('ObjectiveDone').length, 2, 'per objective per day');
    } finally { shiftClock(-DAY); }
  });

  t41('V-41 objective.done twice the same day is ok with no new event', async () => {
    const [a, b] = draw().items.map((o) => o.id);
    assert.equal((await done(a)).ok, true);
    const again = await done(a);
    assert.deepEqual([again.ok, again.event, again.already], [true, null, true], 'a second tap: ok, nothing new');
    assert.equal(events('ObjectiveDone').length, 1);
    // a double tap: two calls at once, one event (the check and the write are in one commit)
    const both = await Promise.all([done(b), done(b)]);
    assert.deepEqual(both.map((r) => r.ok), [true, true]);
    assert.equal(both.filter((r) => r.event).length, 1, 'one of the two wrote');
    assert.equal(events('ObjectiveDone').filter((e) => e.payload.id === b).length, 1);
    assert.equal(events('ObjectiveDone').length, 2);
  });

  test('V-41 objective.done of an objective its own event already did is ok with no new event', () => withV41({ objectives: BY_EVENT, questLine: STEPS }, async () => {
    await Actions.logCraving({ intensity: 3 });
    const items = draw().items;
    assert.ok(items.length === 3 && items.every((o) => o.done), 'the log did all three (the Engine)');
    const r = await done(items[0].id);
    assert.deepEqual([r.ok, r.event, r.already], [true, null, true], 'done by its event: no tap event, no XP twice');
    assert.equal(events('ObjectiveDone').length, 0);
  }));

  t41('V-41 objective.done refuses unknown and not-today ids without throwing and writes nothing', async () => {
    await Actions.onboard({ name: 'Asha', startDate: daysAgo(5) });
    const snap = await snapshot();
    const w = watch();
    for (const id of [undefined, null, 7, '', 'Bad id!', ['obj-walk'], { id: 'obj-walk' }, 'no-such-objective']) no(await done(id), 'bad-objective', JSON.stringify(id) || String(id));
    const shown = draw().items.map((o) => o.id);
    const other = OBJECTIVES.map((o) => o.id).find((x) => !shown.includes(x));
    no(await done(other), 'not-today', 'in the pool, not drawn today');
    assert.equal(w.count, 0, 'no commit');
    w.off();
    await withV41({ questLine: STEPS }, async () => no(await done(shown[0]), 'not-ready', 'no Content.objectives'));
    await withEngine({ dailyObjectives: undefined }, async () => no(await done(shown[0]), 'not-ready', 'no Engine.dailyObjectives'));
    await withEngine({ dailyObjectives: () => { throw new TypeError('boom'); } }, async () => {
      const r = await done(shown[0]);
      no(r, 'error', 'an Engine throw');
      assert.doesNotMatch(r.message, /boom|Asha/, 'the plain message, never the error or person data');
    });
    assert.deepEqual(await snapshot(), snap, 'nothing written');
    assert.equal(four().length, 0);
  });

  // RC2: the same refusals for swap; none of them uses up today's swap
  t41('V-41 objective.swap refuses unknown and not-today ids without throwing and writes nothing', async () => {
    await Actions.onboard({ name: 'Asha', startDate: daysAgo(5) });
    const snap = await snapshot();
    const w = watch();
    for (const id of [undefined, null, 7, '', 'Bad id!', ['obj-walk'], { id: 'obj-walk' }, 'no-such-objective']) no(await swap(id), 'bad-objective', JSON.stringify(id) || String(id));
    const shown = draw().items.map((o) => o.id);
    const other = OBJECTIVES.map((o) => o.id).find((x) => !shown.includes(x));
    no(await swap(other), 'not-today', 'in the pool, not drawn today');
    assert.equal(w.count, 0, 'no commit');
    w.off();
    await withV41({ questLine: STEPS }, async () => no(await swap(shown[0]), 'not-ready', 'no Content.objectives'));
    await withEngine({ dailyObjectives: undefined }, async () => no(await swap(shown[0]), 'not-ready', 'no Engine.dailyObjectives'));
    await withEngine({ dailyObjectives: () => { throw new TypeError('boom'); } }, async () => {
      const r = await swap(shown[0]);
      no(r, 'error', 'an Engine throw');
      assert.doesNotMatch(r.message, /boom|Asha/, 'the plain message, never the error or person data');
    });
    assert.deepEqual(await snapshot(), snap, 'nothing written');
    assert.equal(four().length, 0);
    assert.equal(draw().swapped, false, "today's swap is not used up");
  });

  t41('V-41 objective.swap writes ObjectiveSwapped {from,to,date} once a day and the second is ok:false', async () => {
    const d = draw();
    assert.equal(d.swapped, false);
    const [from, keep] = d.items.map((o) => o.id);
    const to = d.items[0].swapTo;
    assert.ok(typeof to === 'string' && d.items[0].swappable === true, 'the Engine offers a swap');
    const r = await swap(from);
    assert.equal(r.ok, true, `refused: ${r.code} ${r.message}`);
    assert.equal(r.event.type, 'ObjectiveSwapped');
    assert.deepEqual(r.event.payload, { from, to, date: today() }, "to is the Engine's swapTo");
    assert.equal(r.event.sample, undefined);
    const after = draw();
    assert.equal(after.swapped, true);
    assert.deepEqual(after.items.map((o) => o.id), d.items.map((o) => (o.id === from ? to : o.id)), 'to takes the place of from');
    const snap = await snapshot();
    no(await swap(keep), 'swap-used', 'a second swap the same day');
    no(await swap(to), 'swap-used', 'the swapped-in one');
    assert.deepEqual(await snapshot(), snap, 'the refusals wrote nothing');
    assert.equal(events('ObjectiveSwapped').length, 1);
    no(await done(from), 'not-today', 'the swapped-out one is not today\'s now');
    assert.equal((await done(to)).ok, true, 'the swapped-in one can be done');
  });

  t41('V-41 swap never picks a done or shown objective and is deterministic', async () => {
    assert.doesNotMatch(readFileSync(src('actions.js'), 'utf8'), /Math\.random/, 'no randomness in Actions');
    const run = async () => {
      const d = draw();
      const [a, b] = d.items.map((o) => o.id);
      assert.equal((await done(a)).ok, true);
      const snap = await snapshot();
      no(await swap(a), 'bad-objective', 'a done objective stays');
      assert.deepEqual(await snapshot(), snap);
      const r = await swap(b);
      assert.equal(r.ok, true, `refused: ${r.code}`);
      const to = r.event.payload.to;
      assert.ok(!d.items.some((o) => o.id === to), 'never one already shown');
      assert.notEqual(to, a, 'never a done one');
      assert.equal(to, d.items[1].swapTo);
      const after = draw();
      assert.equal(after.items.find((o) => o.id === a).done, true, 'the done one stays done');
      assert.equal(after.items.find((o) => o.id === to).done, false);
      return [d.items.map((o) => o.id), to];
    };
    const first = await run();
    await S().resetAll();
    assert.deepEqual(await run(), first, 'the same day and state: the same draw and the same swap');
    // the Engine's swapTo is trusted and still checked: one already shown, unknown or missing is never written
    await S().resetAll();
    const real = E().dailyObjectives;
    for (const bad of [(d) => d.items[0].id, () => 'no-such-objective', () => null]) {
      const patch = { dailyObjectives: (v, n) => { const d = real(v, n); d.items = d.items.map((o, i) => (i === 1 ? Object.assign({}, o, { swapTo: bad(d) }) : o)); return d; } };
      await withEngine(patch, async () => no(await swap(draw().items[1].id), 'no-swap', 'a bad swapTo'));
    }
    assert.equal(four().length, 0);
    // a pool of three: nothing to swap in
    await S().resetAll();
    await withV41({ objectives: OBJECTIVES.slice(0, 3), questLine: STEPS }, async () => {
      no(await swap(draw().items[0].id), 'no-swap', 'a pool of three');
      assert.equal(four().length, 0);
    });
  });

  t41('V-41 questLine.claim writes QuestLineStepDone and FeatureUnlocked together', async () => {
    no(await claim('qs-log'), 'not-claimable', 'before its condition holds');
    assert.equal(four().length, 0);
    await Actions.logCraving({ intensity: 3 });
    assert.deepEqual([line().current.id, line().current.claimable], ['qs-log', true], 'the Engine says it can be claimed');
    const r = await claim('qs-log');
    assert.equal(r.ok, true, `refused: ${r.code} ${r.message}`);
    assert.deepEqual(r.events.map((e) => [e.type, e.payload]), [['QuestLineStepDone', { id: 'qs-log' }], ['FeatureUnlocked', { feature: 'insights', by: 'questline' }]]);
    assert.equal(r.events[0].at, r.events[1].at, 'one commit');
    assert.equal(r.feature, 'insights');
    assert.deepEqual(four().map((e) => e.id), r.events.map((e) => e.id), 'the two rows, the ones returned');
    assert.ok(r.events.every((e) => e.sample === undefined), "the person's own");
    assert.ok(E().unlocked(S().view).has('insights'), 'the Engine opens the reward');
    assert.equal(line().current.id, 'qs-skill', 'the next step is current');
    // a double tap: two claims at once, one pair of events
    await Actions.useSkill({ skillId: 'ride-wave', helpful: true });
    const both = await Promise.all([claim('qs-skill'), claim('qs-skill')]);
    assert.deepEqual(both.map((x) => x.ok), [true, true]);
    assert.deepEqual(both.map((x) => x.events.length).sort(), [0, 2]);
    assert.equal(events('QuestLineStepDone').filter((e) => e.payload.id === 'qs-skill').length, 1);
    assert.equal(events('FeatureUnlocked').filter((e) => e.payload.feature === 'weeklyReview').length, 1);
  });

  // RC1: two steps may share one reward (the Engine checks only that step ids are unique): the second claim writes its
  // QuestLineStepDone alone (FeatureUnlocked is once-only by feature) and still names the feature
  t41('V-41 claim of a step whose reward is already open writes QuestLineStepDone only and returns feature', async () => {
    await Actions.logCraving({ intensity: 3 });
    const first = await claim('qs-log');
    assert.deepEqual(first.events.map((e) => e.type), ['QuestLineStepDone', 'FeatureUnlocked'], 'the first claim opens insights');
    await Actions.logCraving({ intensity: 2 });
    assert.deepEqual([line().current.id, line().current.claimable], ['qs-log-again', true], 'the twin step is current and ready');
    const open = [...E().unlocked(S().view)].sort();
    assert.ok(open.includes('insights'));
    const r = await claim('qs-log-again');
    assert.equal(r.ok, true, `refused: ${r.code} ${r.message}`);
    assert.deepEqual(r.events.map((e) => [e.type, e.payload]), [['QuestLineStepDone', { id: 'qs-log-again' }]], 'one event: the reward is open already');
    assert.equal(r.feature, 'insights', 'the result still names the feature');
    assert.equal(events('FeatureUnlocked').filter((e) => e.payload.feature === 'insights').length, 1, 'one FeatureUnlocked for the feature');
    assert.deepEqual([...E().unlocked(S().view)].sort(), open, 'Engine.unlocked unchanged');
    assert.deepEqual(four().map((e) => e.id).sort(), [...first.events, ...r.events].map((e) => e.id).sort(), 'the three rows, the ones returned');
  }, { objectives: OBJECTIVES, questLine: [STEPS[0], Object.assign({}, STEPS[0], { id: 'qs-log-again', title: 'T again', line: 'L again', opened: 'O again' })] });

  t41('V-41 claim of a done step is ok with no new event; of a locked step ok:false', async () => {
    await Actions.logCraving({ intensity: 3 });
    assert.equal((await claim('qs-log')).ok, true);
    const snap = await snapshot();
    const again = await claim('qs-log');
    assert.deepEqual([again.ok, again.events], [true, []], 'a done step: ok, nothing new');
    no(await claim('qs-two'), 'not-claimable', 'a locked step');
    await Actions.useSkill({ skillId: 'ride-wave', helpful: true });
    await Actions.useSkill({ skillId: 'distract', helpful: false });
    const two = line().steps.find((s) => s.id === 'qs-two');
    assert.deepEqual([two.state, two.met], ['locked', true], 'met, still locked behind qs-skill');
    const snap2 = await snapshot();
    no(await claim('qs-two'), 'not-claimable', 'a met but locked step');
    assert.deepEqual(await snapshot(), snap2, 'the refusal wrote nothing');
    assert.equal(events('QuestLineStepDone').length, 1);
    assert.deepEqual(snap.events.filter((e) => FOUR.includes(e.type)), four(), 'only the first claim');
  });

  t41('V-41 claim without Engine.questLine or Content.questLine is not-ready and writes nothing', async () => {
    await Actions.logCraving({ intensity: 3 });
    const snap = await snapshot();
    await withV41({ objectives: OBJECTIVES }, async () => no(await claim('qs-log'), 'not-ready', 'no Content.questLine'));
    await withEngine({ questLine: undefined }, async () => no(await claim('qs-log'), 'not-ready', 'no Engine.questLine'));
    for (const id of [undefined, null, 3, '', 'Bad step!', 'no-such-step']) no(await claim(id), 'bad-step', JSON.stringify(id) || String(id));
    await withEngine({ questLine: () => { throw new TypeError('boom'); } }, async () => no(await claim('qs-log'), 'error', 'an Engine throw'));
    assert.deepEqual(await snapshot(), snap, 'nothing written');
    assert.equal(four().length, 0);
  });

  t41('V-41 claim refuses a protected or unknown reward', async () => {
    await Actions.logCraving({ intensity: 3 });
    const snap = await snapshot();
    const refuse = (reward, what) => withV41({ objectives: OBJECTIVES, questLine: [Object.assign({}, STEPS[0], { reward })] }, async () => {
      assert.equal(line().current.claimable, true, 'the step itself is ready');
      no(await claim('qs-log'), 'bad-reward', `${String(reward)}: ${what}`);
    });
    // sos, help, settings, export, data: never a reward; glossary is on the learn tab, talkBack and feelingTools on the
    // SOS tab, training on the Settings tab; today is always on
    const REWARDS = ['sos', 'urgent', 'help', 'lessons', 'settings', 'export', 'data', 'glossary', 'talkBack', 'feelingTools', 'training', 'today', 'no-such-feature', 42, undefined];
    for (const reward of REWARDS) await refuse(reward, 'with the Engine');
    // RS1: each protection alone. help and quicklog as if they were features on the Today tab (fixtures, put back after):
    // help is refused by NEVER_REWARD only, quicklog by Content.reveal.always only, the tab ones by the tab rule only,
    // and a plain feature the Engine protects by the Engine's isProtectedFeature only
    const feats = C().features;
    const seeded = ['help', 'quicklog'].filter((k) => !ownKey(feats, k));
    assert.deepEqual(seeded, ['help', 'quicklog'], 'neither is a feature in Content');
    for (const k of seeded) feats[k] = { name: `F ${k}`, gist: `G ${k}`, tab: 'today' };
    try {
      await withEngine({ isProtectedFeature: undefined }, async () => {
        for (const reward of REWARDS) await refuse(reward, 'without the Engine check');
        await refuse('quicklog', 'always on, so never a reward');
      });
      await withEngine({ isProtectedFeature: (f) => f === 'insights' }, () => refuse('insights', 'the Engine protects it'));
    } finally { for (const k of seeded) delete feats[k]; }
    assert.deepEqual(await snapshot(), snap, 'nothing written');
    assert.equal(four().length, 0);
    assert.equal((await claim('qs-log')).ok, true, 'a plain reward: claimed');
  });

  t41("V-41 with a sample loaded the events are the person's own and sample rows never count", async () => {
    const d0 = draw();
    const [x, y] = d0.items.map((o) => o.id);
    const smp = (id, type, payload) => ({ id, type, at: nowIso(), payload, sample: true });
    const SAMPLE = { name: 'Sample', generate: (now) => {
      const g = TRUNK_SAMPLE.generate(now);
      g.stores.events.push(smp('smp-od', 'ObjectiveDone', { id: x, date: today() }), smp('smp-os', 'ObjectiveSwapped', { from: y, to: d0.items[1].swapTo, date: today() }),
        smp('smp-lc', 'LogCreated', { logId: 'smp-log-1', type: 'craving' }), smp('smp-qs', 'QuestLineStepDone', { id: 'qs-log' }),
        smp('smp-fu', 'FeatureUnlocked', { feature: 'insights', by: 'questline' }));
      return g;
    } };
    await withSample(SAMPLE, () => Actions.loadSample());
    const sampleRows = async () => Object.fromEntries(Object.entries(await snapshot()).map(([k, rows]) => [k, rows.filter((r) => r && r.sample === true)]));
    const before = await sampleRows();
    assert.equal(before.events.filter((e) => FOUR.includes(e.type)).length, 4, 'the sample is loaded');
    const d = draw();
    assert.deepEqual([d.swapped, d.items.find((o) => o.id === x).done], [false, false], 'sample rows never count');
    no(await claim('qs-log'), 'not-claimable', "a sample log does not meet the step and a sample claim is not the person's");
    const r = await done(x);
    assert.equal(r.ok, true, `a loaded sample is not a refusal (R-C-48): ${r.code}`);
    assert.equal(r.event.sample, undefined, 'unmarked');
    const s = await swap(y);
    assert.equal(s.ok, true, `the sample swap is not the person's: ${s.code}`);
    await Actions.logCraving({ intensity: 3 });
    const c = await claim('qs-log');
    assert.equal(c.ok, true, `refused: ${c.code}`);
    assert.deepEqual(c.events.map((e) => [e.type, e.sample === true]), [['QuestLineStepDone', false], ['FeatureUnlocked', false]], "the person's own pair, the sample's skipped");
    assert.deepEqual(await sampleRows(), before, 'no sample row changed');
    const mine = four().filter((e) => e.sample !== true).map((e) => e.id);
    assert.equal(mine.length, 4);
    await Actions.eraseSample();
    assert.deepEqual(four().map((e) => e.id).sort(), mine.sort(), "eraseSample keeps the person's own and takes the sample's");
  });

  // RC3: a backup carries the four events, and the Engine reads the same from them after an import
  t41('V-41 export reset import keeps the four events and what the Engine reads from them', async () => {
    await Actions.logCraving({ intensity: 3 });
    const [a, b] = draw().items.map((o) => o.id);
    assert.equal((await done(a)).ok, true);
    assert.equal((await swap(b)).ok, true);
    assert.equal((await claim('qs-log')).ok, true);
    const reads = () => ({ objectives: draw(), steps: line().steps.map((s) => [s.id, s.state]), claimed: line().done, unlocked: [...E().unlocked(S().view)].sort() });
    const before = { snap: await snapshot(), reads: reads() };
    assert.deepEqual([...new Set(four().map((e) => e.type))].sort(), [...FOUR].sort(), 'the four types are in the notebook');
    assert.ok(before.reads.objectives.swapped && before.reads.objectives.items.some((o) => o.done) && before.reads.unlocked.includes('insights'));
    const exported = JSON.parse(JSON.stringify(await S().exportJson()));
    await Actions.eraseAll();
    assert.equal(four().length, 0, 'erased');
    assert.ok(!E().unlocked(S().view).has('insights'), 'the reward is not open in an empty notebook');
    const r = await Actions.importBackup(exported);
    assert.equal(r.imported, true);
    assert.deepEqual(await snapshot(), before.snap, 'the same rows, the four events among them');
    assert.deepEqual(reads(), before.reads, 'the same draw, swap and done flags, claimed steps and open features');
  });

  t41('V-41 recordEvent refuses the four types with USE_VERB', async () => {
    const snap = await snapshot();
    const id = draw().items[0].id;
    const cases = [['ObjectiveDone', { id, date: today() }], ['ObjectiveSwapped', { from: id, to: 'obj-walk', date: today() }],
      ['QuestLineStepDone', { id: 'qs-log' }], ['FeatureUnlocked', { feature: 'insights', by: 'questline' }]];
    for (const [type, payload] of cases) await refused(Actions.recordEvent(type, payload), 'USE_VERB');
    assert.deepEqual(await snapshot(), snap, 'nothing written');
  });

  t41('V-41 nothing is removed or lowered', async () => {
    const view = () => S().view;
    const measure = async () => ({ snap: await snapshot(), growth: E().growth(view(), nowIso()), unlocked: [...E().unlocked(view())],
      claimed: line().done, xp: E().xpFromEvents(events(), new Date()).total, doneToday: draw().items.filter((o) => o.done).map((o) => o.id) });
    let prev = await measure();
    // RC4: a slip (the day before and today) after an objective and a claim restarts only the opt-in run
    const slipOn = (date) => async () => { const r = await Actions.logSlip({ date }); assert.ok(r && r.log, `the slip of ${date} is saved`); };
    const steps = [
      () => Actions.logCraving({ intensity: 4 }), () => done(draw().items[0].id), () => done(draw().items[0].id),
      () => swap(draw().items[1].id), () => swap(draw().items[2].id), () => claim('qs-two'), () => claim('qs-log'), () => claim('qs-log'),
      slipOn(daysAgo(1)), slipOn(today()),
      () => Actions.useSkill({ skillId: 'ride-wave', helpful: true }), () => claim('qs-skill'), slipOn(today()), () => done('no-such-objective'),
    ];
    for (const [i, step] of steps.entries()) {
      await step();
      const now = await measure();
      for (const [name, rows] of Object.entries(prev.snap)) {
        const kp = STORES()[name] || 'id';
        for (const row of rows) assert.ok(now.snap[name].some((r) => r[kp] === row[kp]), `step ${i}: ${name} ${row[kp]} is kept`);
      }
      for (const e of prev.snap.events) assert.deepEqual(now.snap.events.find((r) => r.id === e.id), e, `step ${i}: event ${e.type} unchanged`);
      assert.ok(now.growth >= prev.growth, `step ${i}: growth never decreases`);
      assert.ok(prev.unlocked.every((f) => now.unlocked.includes(f)), `step ${i}: nothing is locked again`);
      assert.ok(now.claimed >= prev.claimed, `step ${i}: claimed steps stay claimed`);
      assert.ok(prev.doneToday.every((id) => now.doneToday.includes(id)), `step ${i}: today's done objectives stay done`);
      assert.ok(now.xp >= prev.xp, `step ${i}: XP never decreases`);
      prev = now;
    }
    assert.ok(prev.growth >= 1 && prev.claimed === 2, 'the run did grow and claim');
    // no refusal blocks SOS: it still saves after every refusal above
    const sos = await Actions.sosSession({ kind: 'craving', ratingBefore: 7, ratingAfter: 3, tools: [{ skillId: 'ride-wave', helpful: true }] });
    assert.ok(sos, 'SOS saves');
    assert.equal(events('SosCompleted').length, 1);
  });

  t41('V-41 locked store refuses without throwing', async () => {
    await Actions.onboard({ name: 'Asha', startDate: daysAgo(5) });
    await Actions.logCraving({ intensity: 3 });
    const [a, b] = draw().items.map((o) => o.id);
    const snap = await snapshot();
    const real = globalThis.Store;
    globalThis.Store = undefined;
    try {
      for (const r of [await done(a), await swap(b), await claim('qs-log')]) no(r, 'no-store', 'no store');
    } finally { globalThis.Store = real; }
    assert.ok(S().lock && typeof S().lock.set === 'function', 'the Store has a lock (no early return)');
    await S().lock.set('2468', { autoLockMin: 5 });
    S().lock.lockNow();
    try {
      for (const r of [await done(a), await swap(b), await claim('qs-log')]) {
        no(r, 'LOCKED', 'locked');
        assert.doesNotMatch(r.message, /Asha|2468|obj-|qs-/, 'no person data in the message');
      }
    } finally {
      assert.equal(await S().lock.unlock('2468'), true);
    }
    assert.deepEqual((await snapshot()).events, snap.events, 'nothing written while locked');
    await S().lock.remove('2468');
    assert.equal((await done(a)).ok, true, 'unlocked: written');
  });
});
// ── V-25 (V3-25): unlock gives a sign of life. The Store's unlock waits on the test, so the line can be read while the key is made ──
describe('V3 actions-sos V-25 (unlock gives a sign of life)', () => {
  const O = require(src('ui-onboarding.js'));
  before(async () => { if (typeof S().load === 'function') await S().load(); });
  beforeEach(async () => { await S().resetAll(); });
  const unlockGate = () => {
    const real = S();
    const g = { calls: 0, release: null, fail: null };
    g.store = Object.create(real);
    g.store.lock = Object.assign(Object.create(real.lock), { unlock: () => { g.calls += 1; return new Promise((res, rej) => { g.release = res; g.fail = rej; }); } });
    return g;
  };
  const lockForm = (g) => {
    const d = sosDom({ onboarding: true, store: g.store });
    const page = d.UI.pages.lock({});
    const form = page.querySelector('form');
    const msg = page.querySelectorAll('p').find((p) => p.attrs.id === 'lock-msg');
    return { d, page, form, msg, pin: d.byId(page, 'lock-pin'), btn: d.byId(page, 'lock-unlock'), line: d.byId(page, 'lock-opening') };
  };
  const submit = (f) => f.form.on.submit[0]({ preventDefault() {} });
  const said = (n) => n.textContent.trim();
  const controls = (f) => [f.pin.disabled, f.btn.disabled];

  test('V-25: while the PIN is checked the lock form says Opening your notebook in a polite status line, the controls disabled; a right PIN empties it and goes to Today', async () => {
    assert.equal(O.COPY.opening, 'Opening your notebook');
    const g = unlockGate();
    const f = lockForm(g);
    assert.equal(f.line.tag, 'p');
    assert.deepEqual([f.line.attrs.id, f.line.attrs.role, f.line.attrs['aria-live']], ['lock-opening', 'status', 'polite'], 'a polite status line');
    assert.ok(!f.line.hidden, 'in the page from the start, so a screen reader hears the words when they come');
    assert.equal(f.form.querySelector('[data-testid="lock-opening"]'), f.line, 'in the lock form');
    assert.equal(said(f.line), '', 'empty before a try');
    assert.match(readFileSync(src('styles.css'), 'utf8'), /#lock-opening:empty \{ position: absolute; \}/, 'empty, it takes no room and no gap');
    f.pin.value = '2468';
    const done = submit(f);
    assert.equal(said(f.line), O.COPY.opening, 'shown at once, before the key is made');
    assert.deepEqual(controls(f), [true, true], 'the controls stay disabled meanwhile');
    assert.equal(g.calls, 1);
    await tick();
    assert.equal(said(f.line), O.COPY.opening, 'still shown while the key is made');
    g.release(true);
    await done;
    assert.equal(said(f.line), '', 'cleared on success');
    assert.deepEqual(f.d.replaced, ['#/today'], 'on to Today');
    assert.equal(f.msg.hidden, true, 'no message');
    assert.deepEqual(controls(f), [false, false], 'the controls come back');
  });

  test('V-25: a wrong PIN: the line stays through the pause, is empty after, the message shows, the controls come back and the focus is on the PIN', async () => {
    const g = unlockGate();
    const f = lockForm(g);
    f.pin.value = '1111';
    const done = submit(f);
    assert.equal(said(f.line), O.COPY.opening);
    g.release(false);
    await tick();
    assert.equal(said(f.line), O.COPY.opening, 'through the pause after a wrong PIN');
    assert.deepEqual(controls(f), [true, true], 'still disabled through the pause');
    await done;
    assert.equal(said(f.line), '', 'cleared on a wrong PIN');
    assert.equal(said(f.msg), O.COPY.wrong, 'the wrong-PIN message');
    assert.equal(f.msg.hidden, false);
    assert.deepEqual(f.d.go, [], 'still locked: no way on');
    assert.deepEqual(controls(f), [false, false], 'the controls come back');
    assert.equal(f.d.doc.activeElement, f.pin, 'the focus is on the PIN');
  });

  test('V-25: an unlock that throws (a PIN is not available here): the line is empty after, the message says so, the controls come back', async () => {
    const g = unlockGate();
    const f = lockForm(g);
    f.pin.value = '2468';
    const done = submit(f);
    assert.equal(said(f.line), O.COPY.opening);
    const err = Object.assign(new Error('x'), { code: 'NO_CRYPTO' });
    g.fail(err);
    await done;
    assert.equal(said(f.line), '', 'cleared on a thrown unlock');
    assert.equal(said(f.msg), O.lockError(err));
    assert.equal(f.msg.hidden, false);
    assert.deepEqual(f.d.go, [], 'still locked: no way on');
    assert.deepEqual(controls(f), [false, false], 'the controls come back');
  });

  test('V-25: an empty PIN makes no line and no try; a second submit while the key is made neither clears the line nor tries again', async () => {
    const g = unlockGate();
    const f = lockForm(g);
    f.pin.value = '';
    await submit(f);
    assert.equal(said(f.line), '', 'nothing tried, nothing said');
    assert.equal(g.calls, 0, 'nothing tried');
    assert.deepEqual(controls(f), [false, false], 'nothing disabled');
    f.pin.value = '2468';
    const done = submit(f);
    await submit(f); // the first submit emptied the field; Enter again
    assert.equal(said(f.line), O.COPY.opening, 'a second submit leaves the line');
    assert.equal(g.calls, 1, 'one try');
    assert.deepEqual(controls(f), [true, true], 'still disabled');
    g.release(true);
    await done;
    assert.equal(said(f.line), '');
  });

  test('V-25: while the PIN is checked, urgent help and the SOBER practice stay open: both outside the form, neither disabled', async () => {
    const g = unlockGate();
    const f = lockForm(g);
    f.pin.value = '2468';
    const done = submit(f);
    const urgent = f.d.byId(f.page, 'lock-urgent');
    const sober = f.d.byId(f.page, 'lock-sober');
    assert.equal(said(f.line), O.COPY.opening);
    assert.equal(f.form.querySelector('[data-testid="lock-urgent"]'), null, 'urgent help is outside the lock form');
    assert.equal(f.form.querySelector('[data-testid="lock-sober"]'), null, 'so is the SOBER practice');
    assert.deepEqual([!!urgent.disabled, !!sober.disabled], [false, false], 'neither waits for the PIN');
    assert.ok(urgent.attrs.href, 'urgent help is a link, live');
    const heads = f.page.querySelectorAll('h1').length;
    sober.click();
    assert.equal(f.page.querySelectorAll('h1').length, heads + 1, 'the SOBER practice opens while the key is made');
    g.release(true);
    await done;
    assert.deepEqual(f.d.replaced, [], 'EC1: the practice stays open, the key ready or not');
  });

  // ES1, EC1: the real router. ui-core.js (boot, render, go, schedule) and the real lock page in a context of their own, over a stand-in DOM. The Store's unlock
  // waits on the test and, as store.js does, notifies before it answers. Only the page bodies and the SOBER view are stand-ins.
  const routerDom = () => {
    const ids = {};
    class T { constructor(t) { this.data = String(t); this.parentNode = null; } get nodeType() { return 3; } get textContent() { return this.data; } }
    class E {
      constructor(tag) {
        this.tagName = String(tag).toUpperCase(); this.attrs = {}; this.kids = []; this.dataset = {}; this.parentNode = null; this.style = { setProperty() {} };
        this.hidden = false; this.own = ''; this.on = {}; this.value = ''; this.disabled = false;
        const cls = new Set();
        this.classList = { toggle: (c, f) => { if (f === undefined ? !cls.has(c) : f) cls.add(c); else cls.delete(c); }, contains: (c) => cls.has(c), add: (c) => cls.add(c), remove: (c) => cls.delete(c) };
      }
      get nodeType() { return 1; }
      setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'hidden') this.hidden = true; if (k === 'id') this.id = String(v); }
      getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null; }
      removeAttribute(k) { delete this.attrs[k]; }
      appendChild(c) { c.parentNode = this; this.kids.push(c); return c; }
      removeChild(c) { this.kids = this.kids.filter((x) => x !== c); return c; }
      insertBefore(c) { c.parentNode = this; this.kids.unshift(c); return c; }
      replaceChildren(...cs) { this.kids = []; this.own = ''; for (const c of cs) this.appendChild(typeof c === 'string' ? new T(c) : c); }
      get children() { return this.kids.filter((k) => k.nodeType === 1); }
      get firstChild() { return this.kids[0] || null; }
      get textContent() { return [this.own].concat(this.kids.map((k) => k.textContent)).join(' '); }
      set textContent(v) { this.own = String(v); this.kids = []; }
      addEventListener(t, f) { (this.on[t] = this.on[t] || []).push(f); }
      removeEventListener() {}
      querySelectorAll() { return []; }
      querySelector() { return null; }
      focus() { doc.activeElement = this; }
      contains(x) { for (let n = x; n; n = n.parentNode) if (n === this) return true; return false; }
      matches() { return false; }
      all() { return [this].concat(...this.children.map((k) => k.all())); }
    }
    const doc = { title: '', activeElement: null, documentElement: new E('html'), body: new E('body'), createElement: (t) => new E(t), createElementNS: (n, t) => new E(t),
      createTextNode: (t) => new T(t), getElementById: (id) => ids[id] || null, dispatchEvent: () => true, contains: () => true, addEventListener() {} };
    for (const [id, tag] of [['main', 'main'], ['sos-btn', 'a'], ['nav', 'nav'], ['saved-label', 'span'], ['app-name', 'span'], ['coach', 'div'], ['toasts', 'div'], ['dialog', 'dialog'], ['settings-btn', 'a'], ['theme-btn', 'button'], ['print-root', 'div']]) {
      const e = new E(tag); e.id = id; ids[id] = e;
    }
    return doc;
  };
  const settle = () => new Promise((r) => setTimeout(r, 60)); // past ui-core's 16 ms frame (Node has no requestAnimationFrame)
  const routerApp = async () => {
    const vm = require('node:vm');
    const doc = routerDom();
    const on = {};
    const location = { hash: '#/lock' };
    const replaced = [];
    const history = { state: null, replaceState(s, t, url) { location.hash = url; replaced.push(url); } };
    const subs = new Set();
    const store = {
      locked: true, release: null, view: { get: () => null, list: () => [], count: () => 0 },
      status: () => ({ persistence: 'indexeddb', lastSavedAt: null, hasLock: true, locked: store.locked }),
      load: async () => {}, subscribe: (f) => { subs.add(f); return () => subs.delete(f); },
      lock: { onLock: () => () => {}, hold() {}, touch() {},
        unlock: () => new Promise((res) => { store.release = (ok) => { if (ok) { store.locked = false; for (const f of subs) f({ label: 'unlock' }); } res(ok); }; }) },
    };
    const ctx = vm.createContext({ document: doc, window: { addEventListener: (t, f) => { (on[t] = on[t] || []).push(f); } }, location, history, Store: store, Content: C(),
      localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, navigator: {}, Date, console, setTimeout, clearTimeout, setInterval, clearInterval, URLSearchParams, CustomEvent, Event });
    vm.runInContext(readFileSync(src('ui-core.js'), 'utf8'), ctx, { filename: 'ui-core.js' });
    const UI = vm.runInContext('UI', ctx);
    const body = (text) => () => { const p = doc.createElement('div'); p.textContent = text; return p; };
    UI.pages.sos = body('URGENT NUMBERS');
    UI.pages.today = body('TODAY');
    const a = { doc, store, location, replaced, UI, done: null, soberDone: null };
    UI.sosSoberView = (onDone) => { a.soberDone = onDone; return body('SOBER PRACTICE')(); };
    vm.runInContext(readFileSync(src('ui-onboarding.js'), 'utf8'), ctx, { filename: 'ui-onboarding.js' });
    await UI.boot();
    await settle();
    const main = () => doc.getElementById('main');
    a.text = () => main().textContent;
    a.hook = (id) => main().all().find((e) => e.dataset && e.dataset.testid === id);
    a.submit = (pin) => {
      a.hook('lock-pin').value = pin;
      a.done = main().all().find((e) => e.tagName === 'FORM').on.submit[0]({ preventDefault() {} });
      assert.ok(store.release, 'the key is being made');
    };
    a.tap = async (href) => { location.hash = href; for (const f of on.hashchange) f(); await settle(); };
    // ESR1: a link followed as a browser does: one to the hash already in the address fires no hashchange (a.tap fires it always).
    a.follow = async (href) => { const moved = location.hash !== href; location.hash = href; if (moved) for (const f of on.hashchange) f(); await settle(); };
    a.keyReady = async (ok) => { store.release(ok); await a.done; await settle(); };
    return a;
  };

  test('ES1: a right PIN goes on to Today only from the lock page: urgent help or the SOS page opened while the key is made stays, its history entry too (the real router)', async () => {
    for (const href of ['#/sos/urgent', '#/sos']) {
      const a = await routerApp();
      a.submit('2468');
      await a.tap(href);
      assert.match(a.text(), /URGENT NUMBERS/, `${href} is open`);
      await a.keyReady(true);
      assert.equal(a.location.hash, href, `${href}: still there`);
      assert.match(a.text(), /URGENT NUMBERS/, `${href}: the numbers stay`);
      assert.doesNotMatch(a.text(), /TODAY/, `${href}: Today is not drawn over them`);
      assert.deepEqual(a.replaced, [], `${href}: the history entry stays`);
    }
    const stay = await routerApp();
    stay.submit('2468');
    await stay.keyReady(true);
    assert.equal(stay.location.hash, '#/today', 'nothing else tapped: on to Today');
    assert.match(stay.text(), /TODAY/);
  });

  test('ES1: a wrong PIN while urgent help is open does not pull the focus out of it (the real router)', async () => {
    const a = await routerApp();
    const pin = a.hook('lock-pin');
    a.submit('1111');
    await a.tap('#/sos/urgent');
    const before = a.doc.activeElement;
    await a.keyReady(false);
    assert.equal(a.location.hash, '#/sos/urgent', 'still there');
    assert.notEqual(a.doc.activeElement, pin, 'the focus is not pulled back to the lock form');
    assert.equal(a.doc.activeElement, before, 'it stays where it was');
  });

  test('EC1: the SOBER practice opened while the key is made stays open when the key is ready, and its Done goes on to Today (the real router)', async () => {
    const a = await routerApp();
    a.submit('2468');
    a.hook('lock-sober').on.click[0]({});
    await settle();
    await a.keyReady(true);
    assert.equal(a.store.locked, false, 'the notebook is open');
    assert.match(a.text(), /SOBER PRACTICE/, 'the practice stays');
    assert.doesNotMatch(a.text(), /TODAY/, 'Today is not drawn over it');
    assert.notEqual(a.location.hash, '#/today', 'the route has not moved on');
    a.soberDone();
    await settle();
    assert.equal(a.location.hash, '#/today', 'Done goes on to Today, the notebook being open');
    assert.match(a.text(), /TODAY/);
    assert.doesNotMatch(a.text(), /SOBER PRACTICE/);
  });

  test('EC1: the SOBER practice closed while the key is still made: back on the lock route, the form goes on, and the key then goes on to Today (the real router)', async () => {
    const a = await routerApp();
    a.submit('2468');
    a.hook('lock-sober').on.click[0]({});
    a.soberDone();
    assert.equal(a.location.hash, '#/lock', 'still locked: back on the lock route');
    assert.ok(a.hook('lock-pin'), 'the same lock form, not drawn again');
    assert.doesNotMatch(a.text(), /SOBER PRACTICE/);
    await a.keyReady(true);
    assert.equal(a.location.hash, '#/today', 'nothing open: on to Today');
    assert.match(a.text(), /TODAY/);
  });

  test('EC1: a wrong PIN with the SOBER practice open: the practice stays, the message shows, the focus is not pulled out of it; Done goes back to the lock route (the real router)', async () => {
    const a = await routerApp();
    const pin = a.hook('lock-pin');
    a.hook('lock-sober').on.click[0]({});
    a.submit('1111');
    await a.keyReady(false);
    assert.match(a.text(), /SOBER PRACTICE/, 'the practice stays');
    assert.ok(a.text().includes(require(src('ui-onboarding.js')).COPY.wrong), 'the wrong-PIN message shows');
    assert.notEqual(a.doc.activeElement, pin, 'the focus is not pulled to the PIN');
    a.soberDone();
    await settle();
    assert.equal(a.location.hash, '#/lock', 'still locked: the lock route');
    assert.ok(a.hook('lock-pin'), 'the lock form');
    assert.equal(a.store.locked, true);
  });

  test('ESR1: the header SOS button opens the SOS page from the practice on the lock page (the real router)', async () => {
    const a = await routerApp();
    const sosBtn = a.doc.getElementById('sos-btn');
    const href = /id="sos-btn"[^>]*href="([^"]+)"/.exec(readFileSync(src('shell.html'), 'utf8'))[1]; // the real button's link
    a.hook('lock-sober').on.click[0]({});
    await settle();
    assert.match(a.text(), /SOBER PRACTICE/, 'the practice is open');
    assert.equal(sosBtn.hidden, false, 'the SOS button is on screen');
    const during = a.location.hash;
    await a.follow(href);
    assert.equal(a.location.hash, href, 'the route is the button\'s');
    assert.match(a.text(), /URGENT NUMBERS/, 'the tap opens the SOS page');
    assert.doesNotMatch(a.text(), /SOBER PRACTICE/, 'the practice gives way to it');
    assert.equal(a.hook('lock-page'), undefined, 'the lock page is gone');
    assert.equal(sosBtn.hidden, true, 'the SOS page shows no SOS button');
    assert.equal(during, '#/sos/craving', 'while the practice was open: a reload lands in the same flow');
  });

  test('ESR2: Done back on the lock page shows the SOS button again (the real router)', async () => {
    const a = await routerApp();
    const sosBtn = a.doc.getElementById('sos-btn');
    const root = a.doc.documentElement;
    const form = a.hook('lock-pin');
    a.hook('lock-sober').on.click[0]({});
    await settle();
    a.submit('2468');
    await a.keyReady(true);
    assert.match(a.text(), /SOBER PRACTICE/, 'the practice stays');
    assert.deepEqual([sosBtn.hidden, root.getAttribute('data-route')], [true, 'sos'], 'the key arrived: ui-core paints the chrome as SOS');
    a.store.locked = true; // the idle lock, or another tab: the route is an SOS route, so ui-core draws nothing
    a.submit('2468'); // a PIN being checked must go on through Done
    a.soberDone();
    await settle();
    assert.equal(a.location.hash, '#/lock', 'back on the lock route');
    assert.deepEqual([sosBtn.hidden, root.getAttribute('data-route')], [false, 'lock'], 'the lock page has its SOS button, and the chrome says lock');
    assert.equal(a.hook('lock-pin'), form, 'the same form: the page is not drawn again');
    await a.keyReady(true);
    assert.equal(a.location.hash, '#/today', 'the PIN being checked went on, then on to Today');
    assert.match(a.text(), /TODAY/);
  });
});
// ── V-18 (V3-18): RC23 (a plan's status over a sample plan), RC22 (the kept date on the feeling flow and the leave path), R8-RC1 (the retry at once) ──
describe('V3 actions-sos V-18 (RC22, RC23, R8-RC1)', () => {
  before(async () => { if (typeof S().load === 'function') await S().load(); });
  beforeEach(async () => { await S().resetAll(); });
  const BP = { situation: 'Office farewell dinner', plan: 'Order a lime soda first.', backups: ['Step outside and call Asha.'], exit: 'Leave after the speeches.' };
  const smpPlans = () => ({ plans: [
    { id: 'smp-plan-1', date: daysAgo(-3), start: '19:00', end: '22:00', status: 'planned', sample: true, title: 'Office farewell dinner', kind: 'risky', risky: true, battlePlan: BP },
    { id: 'smp-plan-2', date: daysAgo(-1), start: '18:30', end: '19:15', status: 'planned', sample: true, title: 'Evening walk', kind: 'want', risky: false },
  ] });
  const loadPlans = () => withSample({ generate: () => ({ stores: smpPlans() }) }, () => Actions.loadSample());
  const plan = (id) => S().view.get('plans', id);
  const battle = () => events('BattlePlanCreated').filter((e) => e.sample !== true);

  test('RC23: a status change over a sample plan keeps the mark and writes no BattlePlanCreated; eraseSample takes the row', async () => {
    await loadPlans();
    for (const status of ['done', 'skipped', 'planned']) {
      for (const id of ['smp-plan-1', 'smp-plan-2']) {
        await Actions.plans.update(id, { status });
        assert.deepEqual([plan(id).status, plan(id).sample], [status, true], `${id} ${status}: written, still the sample's`);
      }
    }
    assert.deepEqual(battle(), [], "no BattlePlanCreated for a row that is not the person's");
    await Actions.plans.update('smp-plan-1', { status: 'done', risky: false });
    assert.deepEqual([plan('smp-plan-1').risky, plan('smp-plan-1').sample], [false, true], 'a status and a flag: still the sample');
    assert.deepEqual(battle(), []);
    await Actions.eraseSample();
    assert.deepEqual([plan('smp-plan-1'), plan('smp-plan-2')], [null, null], 'eraseSample takes them');
    assert.deepEqual(battle(), []);
  });

  test("RC23: the person's words over a sample battle plan make it theirs and write BattlePlanCreated once; a status change after adds no second; eraseSample keeps it", async () => {
    await loadPlans();
    await Actions.plans.update('smp-plan-1', { status: 'done', title: 'My farewell dinner' });
    assert.equal(plan('smp-plan-1').sample, undefined, "a status with the person's words: theirs");
    assert.deepEqual([plan('smp-plan-1').title, plan('smp-plan-1').status], ['My farewell dinner', 'done']);
    assert.deepEqual(battle().map((e) => e.payload.planId), ['smp-plan-1'], "the event for the person's row");
    await Actions.plans.update('smp-plan-1', { status: 'planned' });
    assert.equal(battle().length, 1, 'once');
    await Actions.eraseSample();
    assert.equal(plan('smp-plan-1').title, 'My farewell dinner', 'eraseSample keeps their row');
    assert.equal(battle().length, 1, 'and its event');
  });

  test("RC23: the person's own plan keeps its one BattlePlanCreated across a status change; a battle plan added over their own plan writes it", async () => {
    const made = await Actions.plans.add({ date: daysAgo(-2), start: '19:00', end: '21:00', title: 'Dinner', kind: 'risky', battlePlan: BP });
    assert.equal(battle().length, 1);
    await Actions.plans.update(made.plan.id, { status: 'done' });
    assert.equal(plan(made.plan.id).status, 'done');
    assert.equal(battle().length, 1, 'a status change adds no second');
    const walk = await Actions.plans.add({ date: daysAgo(-2), start: '07:00', end: '08:00', title: 'Walk', kind: 'want' });
    await Actions.plans.update(walk.plan.id, { battlePlan: BP });
    assert.deepEqual(battle().map((e) => e.payload.planId).sort(), [made.plan.id, walk.plan.id].sort(), "a battle plan added over the person's own row writes it");
  });

  test('RC23: an unknown status over a sample plan is refused and writes nothing', async () => {
    await loadPlans();
    const before = await snapshot();
    await refused(Actions.plans.update('smp-plan-1', { status: 'lost' }), 'bad-plan');
    assert.deepEqual(await snapshot(), before, 'nothing written');
    assert.equal(plan('smp-plan-1').sample, true);
  });

  test('RC22: a session kept for the unlock keeps the day of the tap on the feeling flow and the leave path, though the unlock comes after midnight', async () => {
    const paths = [
      ['the feeling flow', (d) => {
        const root = d.open(['sos', 'feeling']);
        d.tapId(root, 'sos-feeling-' + d.calm());
        d.toRating(root);
        return () => d.rate(root, 3);
      }],
      ['the leave path', (d) => {
        const root = d.open(['sos', 'craving']);
        d.tap(root, 'Skip');
        d.tapId(root, 'sos-tool-why');
        d.tap(root, 'Done');
        d.tap(root, 'It helped');
        return () => { root.querySelectorAll('a').find((x) => x.textContent.trim() === 'Back to SOS').click(); d.fire('ui:rendered', {}); };
      }],
    ];
    for (const [name, walk] of paths) {
      await S().resetAll();
      await S().lock.set('2468');
      const d = sosDom();
      const last = walk(d);
      const day = E().todayStr(new Date());
      S().lock.lockNow(); // the lock comes as the session ends: the save is kept for the unlock
      last();
      await until(() => d.toasts.some((t) => t[0] === d.UI.sosHelpers.COPY.lockedKept), name + ': kept for the unlock');
      shiftClock(14 * 3600 * 1000);
      try {
        assert.notEqual(E().todayStr(new Date()), day, name + ': the unlock comes on the next day');
        assert.equal(await S().lock.unlock('2468'), true);
        await until(() => list('logs').length >= 1, name + ': saved at the unlock');
        await d.settle();
        assert.deepEqual(list('logs').map((l) => l.date), [day], name + ': the day of the tap');
        assert.equal(events('SosCompleted').length, 1, name + ': saved once');
      } finally { shiftClock(-14 * 3600 * 1000); }
    }
  });

  test('R8-RC1: a save refused LOCKED by a lock and unlock in this tab is tried once more at once: one settle after the refusal it has run', async () => {
    await S().lock.set('2468');
    const s = { calls: 0, refused: 0 };
    const A = Object.assign({}, Actions, { sosSession: async (p) => {
      s.calls += 1;
      if (s.calls > 1) return Actions.sosSession(p);
      S().lock.lockNow();
      assert.equal(await S().lock.unlock('2468'), true, 'unlocked again, the same PIN');
      s.refused += 1;
      throw Object.assign(new Error('This tab locked while the save ran.'), { code: 'LOCKED' });
    } });
    const d = sosDom();
    const root = d.open(['sos', 'craving'], null, A);
    for (const id of ['sos-rate-skip', 'sos-checkin', 'sos-reassess-passed', 'sos-used-yes']) d.tapId(root, id);
    await until(() => s.refused === 1, 'the stub refused once');
    await d.settle();
    assert.equal(s.calls, 2, 'at once: tried once more within a settle of the refusal');
    await until(() => d.go.length > 0, 'and the save ends');
    assert.deepEqual(events('SosCompleted').map((e) => e.payload.outcome), ['used'], 'saved now, once');
  });
});

// ── V-17b (V3-17): SOS marks its waiting saves with Store.status().lockId. A save kept before a lock is dropped when the lock row changed (another tab erased and set a new PIN) ──
describe('V3 actions-sos V-17b (waiting saves marked with lockId)', () => {
  const H = require(src('ui-sos.js'));
  const A1 = 'a1a1a1a1';
  const B2 = 'b2b2b2b2';
  const NONE = { lockId: '', hasLock: false };
  const lockedErr = () => Object.assign(new Error('The notebook is locked.'), { code: 'LOCKED' });
  before(async () => { if (typeof S().load === 'function') await S().load(); });
  beforeEach(async () => { await S().resetAll(); });

  // A stub store for what SOS's waiting saves read: the status (its lock row's mark is the test's to change) and the
  // notify an unlock sends; the rest goes to the real Store. A write lands in s.written, and while the status reads
  // locked it is refused with LOCKED. s.during, once: the status changes while the save runs, and the write is refused.
  function lockStub(start) {
    const s = { st: Object.assign({ hasLock: true, locked: true, lockId: A1 }, start), subs: new Set(), calls: 0, written: [], during: null };
    s.store = Object.assign(Object.create(S()), {
      status: () => Object.assign({}, s.st),
      subscribe(fn) { s.subs.add(fn); return () => s.subs.delete(fn); },
    });
    s.notify = (label) => { for (const fn of s.subs) fn({ label }); };
    s.A = Object.assign({}, Actions, { sosSession: async (p) => {
      s.calls += 1;
      if (s.during) { const change = s.during; s.during = null; change(); throw lockedErr(); }
      if (s.st.locked) throw lockedErr();
      s.written.push(p);
      return { ok: true };
    } });
    return s;
  }
  // a craving session tapped through to No: its save comes at the end
  const craving = (d, A) => {
    const root = d.open(['sos', 'craving'], null, A);
    for (const id of ['sos-rate-skip', 'sos-checkin', 'sos-reassess-passed', 'sos-used-no']) d.tapId(root, id);
    return root;
  };
  const count = (d, msg) => d.toasts.filter((t) => t[0] === msg).length;
  const kept = async (s) => {
    const d = sosDom({ store: s.store });
    craving(d, s.A);
    await until(() => count(d, H.COPY.lockedKept) === 1, 'kept for the unlock');
    return d;
  };
  const unlockNow = (s) => { s.st.locked = false; s.notify('unlock'); };

  for (const [name, change] of [['replaced (another tab erased and set a new PIN)', { lockId: B2 }], ['removed (another tab erased)', NONE]]) {
    test(`V-17b: a save kept for the unlock is dropped when its lock row was ${name}: never written, told once`, async () => {
      const s = lockStub();
      const d = await kept(s);
      assert.equal(s.calls, 1, 'refused once while locked');
      Object.assign(s.st, change);
      unlockNow(s);
      await until(() => count(d, H.COPY.keptLost) === 1, 'told it was not saved');
      await d.settle();
      assert.deepEqual(s.written, [], 'never written into the new notebook');
      assert.equal(s.calls, 1, 'never tried again');
      s.notify();
      await d.settle();
      assert.equal(s.calls, 1, 'nothing kept to write later');
      assert.equal(count(d, H.COPY.keptLost), 1, 'told once');
      craving(d, s.A);
      await until(() => s.written.length === 1, 'a save on the notebook as it is goes in');
      assert.equal(count(d, H.COPY.lockedKept), 1, 'and waits for nothing');
    });
  }

  test('V-17b: the lockId the same across the lock and the unlock: the kept save is written, once; nothing says it was lost', async () => {
    const s = lockStub();
    const d = await kept(s);
    unlockNow(s);
    await until(() => s.written.length === 1, 'written after the unlock');
    await d.settle();
    s.notify();
    await d.settle();
    assert.equal(s.written.length, 1, 'once');
    assert.equal(count(d, H.COPY.keptLost), 0, 'never told it was lost');
  });

  test('V-17b: each kept save carries the lockId of its own time: kept before the change it is dropped, kept after it is written; one toast', async () => {
    const s = lockStub();
    const tagged = (tag) => Object.assign({}, s.A, { sosSession: (p) => s.A.sosSession(Object.assign({ tag }, p)) });
    const d = sosDom({ store: s.store });
    craving(d, tagged('before'));
    await until(() => count(d, H.COPY.lockedKept) === 1, 'the first kept');
    s.st.lockId = B2;
    craving(d, tagged('after'));
    await until(() => count(d, H.COPY.lockedKept) === 2, 'the second kept');
    unlockNow(s);
    await until(() => count(d, H.COPY.keptLost) === 1, 'told it was not saved');
    await d.settle();
    assert.deepEqual(s.written.map((p) => p.tag), ['after'], 'only the save made in this notebook');
    assert.equal(s.calls, 3, 'two refusals and one write: the first was never tried again');
    assert.equal(count(d, H.COPY.keptLost), 1, 'one toast');
  });

  for (const [name, locked, start, change] of [
    ['replaced', false, {}, { lockId: B2 }],
    ['replaced', true, {}, { lockId: B2 }],
    ['removed', false, {}, NONE],
    ['removed', true, {}, NONE],
    ['created', false, NONE, { lockId: A1, hasLock: true }],
  ]) {
    test(`V-17b: a lock row ${name} while the save runs, the notebook reading ${locked ? 'locked' : 'open'}: dropped, never retried or kept, told not saved`, async () => {
      const s = lockStub(Object.assign({ locked }, start));
      s.during = () => { Object.assign(s.st, change); };
      const d = sosDom({ store: s.store });
      craving(d, s.A);
      await until(() => count(d, H.COPY.notSaved) === 1 || count(d, H.COPY.lockedKept) === 1 || s.calls > 1, 'the refused save ends');
      await d.settle();
      assert.equal(s.calls, 1, 'never retried');
      assert.equal(count(d, H.COPY.lockedKept), 0, 'never told it waits');
      assert.equal(count(d, H.COPY.notSaved), 1, 'told it was not saved');
      unlockNow(s);
      await d.settle();
      s.notify();
      await d.settle();
      assert.deepEqual(s.written, [], 'nothing written');
      assert.equal(s.calls, 1, 'nothing kept to write later');
    });
  }

  test('V-17b: a store with no lockId, or one that is not a string, keeps the rule it had: written after the unlock, dropped when hasLock changed', async () => {
    for (const [name, first, then] of [['absent', undefined, undefined], ['a number', 7, 8]]) {
      const s = lockStub({ lockId: first });
      if (first === undefined) delete s.st.lockId;
      const d = await kept(s);
      if (then !== undefined) s.st.lockId = then;
      unlockNow(s);
      await until(() => s.written.length === 1, `${name}: written after the unlock`);
      await d.settle();
      assert.equal(count(d, H.COPY.keptLost), 0, `${name}: never told it was lost`);
    }
    const s = lockStub();
    delete s.st.lockId;
    const d = await kept(s);
    s.st.hasLock = false;
    unlockNow(s);
    await until(() => count(d, H.COPY.keptLost) === 1, 'the lock row went away: told');
    await d.settle();
    assert.deepEqual(s.written, [], 'hasLock still drops it');
  });

  test('V-17b: on the real Store a PIN set over the old one while the save runs changes lockId: dropped, never retried', async () => {
    await S().lock.set('2468');
    const first = S().status().lockId;
    assert.match(first, /^[0-9a-f]{8}$/, 'the real Store marks its lock row');
    let calls = 0;
    const A = Object.assign({}, Actions, { sosSession: async (p) => {
      calls += 1;
      if (calls > 1) return Actions.sosSession(p);
      await S().lock.set('1357');
      throw lockedErr();
    } });
    const d = sosDom();
    craving(d, A);
    await until(() => count(d, H.COPY.notSaved) === 1 || count(d, H.COPY.lockedKept) === 1 || calls > 1, 'the refused save ends');
    await d.settle();
    assert.notEqual(S().status().lockId, first, 'a new row, a new mark');
    assert.equal(S().status().hasLock, true, 'hasLock alone could not tell');
    assert.equal(calls, 1, 'never retried');
    assert.equal(events('SosCompleted').length, 0, 'nothing written');
    assert.equal(count(d, H.COPY.notSaved), 1, 'told it was not saved');
  });

  // ES3T: two real Stores over one fake IndexedDB, as two tabs are. Another tab's import with a PIN set seals the lock row's check again (core's FIX-IMPORT-MARK), so the mark a kept save carries moves.
  describe('V-17b on two real stores (ES3T)', () => {
    const STORE_PATH = require.resolve('../src/store.js');
    const freshStore = () => { delete require.cache[STORE_PATH]; return require(STORE_PATH); };
    const hadIDB = 'indexedDB' in globalThis;
    const savedIDB = globalThis.indexedDB;
    const savedStore = require.cache[STORE_PATH];
    after(() => { // the rest of the file keeps its own Store and no IndexedDB
      if (savedStore) require.cache[STORE_PATH] = savedStore; else delete require.cache[STORE_PATH];
      if (hadIDB) globalThis.indexedDB = savedIDB; else delete globalThis.indexedDB;
    });
    function fakeIndexedDB() {
      const dbs = new Map();
      const cp = (v) => JSON.parse(JSON.stringify(v));
      function makeDb(rec) {
        return {
          objectStoreNames: { contains: (n) => rec.stores.has(n) },
          createObjectStore(n, o) { rec.stores.set(n, { keyPath: o.keyPath, rows: new Map() }); },
          close() {},
          transaction(names) {
            for (const n of names) if (!rec.stores.has(n)) throw new Error('NotFoundError');
            const t = { error: null, aborted: false, abort() { t.aborted = true; } };
            const ops = [];
            const request = (fn) => { const r = {}; ops.push(() => { r.result = fn(); if (r.onsuccess) r.onsuccess(); }); return r; };
            t.objectStore = (n) => {
              const st = rec.stores.get(n);
              return {
                getAll: () => request(() => Array.from(st.rows.values()).map(cp)),
                get: (id) => request(() => (st.rows.has(id) ? cp(st.rows.get(id)) : undefined)),
                put: (row) => request(() => { st.rows.set(row[st.keyPath], cp(row)); }),
                delete: (id) => request(() => { st.rows.delete(id); }),
                clear: () => request(() => { st.rows.clear(); }),
              };
            };
            setTimeout(() => {
              for (const op of ops) { if (t.aborted) break; op(); }
              if (t.aborted) { if (t.onabort) t.onabort(); return; }
              if (t.oncomplete) t.oncomplete();
            }, 0);
            return t;
          },
        };
      }
      return {
        open(name, version) {
          const r = {};
          setTimeout(() => {
            let rec = dbs.get(name);
            if (!rec) { rec = { version: 0, stores: new Map() }; dbs.set(name, rec); }
            r.result = makeDb(rec);
            if (rec.version < version) { rec.version = version; if (r.onupgradeneeded) r.onupgradeneeded(); }
            if (r.onsuccess) r.onsuccess();
          }, 0);
          return r;
        },
        deleteDatabase(name) {
          const r = {};
          setTimeout(() => { dbs.delete(name); if (r.onsuccess) r.onsuccess(); }, 0);
          return r;
        },
      };
    }
    const twoTabs = async () => {
      globalThis.indexedDB = fakeIndexedDB();
      const T1 = freshStore(); await T1.load(); await T1.lock.set('2468', { autoLockMin: 'never' });
      const T2 = freshStore(); await T2.load(); assert.equal(await T2.lock.unlock('2468'), true);
      return { T1, T2 };
    };
    const actionsOn = (T1) => {
      const written = [];
      const A = Object.assign({}, Actions, { sosSession: async (p) => {
        await T1.commit('tab save', (draft) => { draft.put('events', { id: 'tab-' + written.length, type: 'SosCompleted', at: '2026-03-11T12:00:00.000Z', payload: {} }); });
        written.push(p);
        return { ok: true };
      } });
      return { A, written };
    };
    const keep = async (T1, A) => {
      T1.lock.lockNow();
      assert.equal(T1.status().locked, true);
      const d = sosDom({ store: T1 });
      craving(d, A);
      await until(() => count(d, H.COPY.lockedKept) === 1, 'kept for the unlock');
      return d;
    };

    test('V-17b: a kept save is dropped, and told once, when another tab imports a backup with the PIN kept (two real stores)', async () => {
      const { T1, T2 } = await twoTabs();
      const { A, written } = actionsOn(T1);
      const d = await keep(T1, A);
      const first = T1.status().lockId;
      await T2.replaceAll({ app: '1-addic', stores: {} });
      assert.notEqual(T2.status().lockId, first, 'the import seals the lock row again: the mark moves');
      assert.equal(T2.status().hasLock, true, 'the PIN is kept');
      assert.equal(await T1.lock.unlock('2468'), true, 'the same PIN opens the imported notebook');
      assert.notEqual(T1.status().lockId, first, 'this tab read the new mark when it resynced');
      await until(() => written.length > 0 || count(d, H.COPY.keptLost) > 0, 'the kept save is decided');
      await d.settle();
      assert.deepEqual(written, [], 'C2: a kept save is never written into a notebook another tab imported');
      assert.equal(T1.view.list('events').length, 0, 'nothing in the imported notebook');
      assert.equal(count(d, H.COPY.keptLost), 1, 'told once that it was not saved');
    });

    test('V-17b: a kept save is written once after the unlock when no other tab changed the notebook (two real stores)', async () => {
      const { T1 } = await twoTabs();
      const { A, written } = actionsOn(T1);
      const d = await keep(T1, A);
      const first = T1.status().lockId;
      assert.equal(await T1.lock.unlock('2468'), true);
      await until(() => written.length > 0 || count(d, H.COPY.keptLost) > 0, 'the kept save is decided');
      await d.settle();
      assert.equal(T1.status().lockId, first, 'a lock and an unlock leave the mark where it was');
      assert.equal(written.length, 1, 'written once');
      assert.equal(T1.view.list('events').length, 1, 'one row in the notebook');
      assert.equal(count(d, H.COPY.keptLost), 0, 'nothing says it was lost');
    });
  });
});
// -- V3 actions-sos tests end --
