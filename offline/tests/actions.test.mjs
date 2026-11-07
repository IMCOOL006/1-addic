// Lane actions-sos's Node tests (node:test, no dependencies). U-09: the Actions verbs of BUILD-PLAN 3.2 in Node memory
// mode. The real offline/src/store.js and engine.js are loaded by path when they exist (the merged trunk); while one is
// absent, the stand-in at the bottom of this file takes its place: the Store of contract E (tracks/CORE/contracts/core.md)
// in memory, and only the Engine names U-09 calls, with the shapes of tracks/CORE/contracts/engine.md.
import { describe, test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
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
// Content.sample may be loaded (content-sample.js, BUILD-PLAN 3.1): a test that sets it, or needs it absent, puts it back after.
async function withSample(sample, fn) {
  const had = Object.prototype.hasOwnProperty.call(C(), 'sample');
  const old = C().sample;
  if (sample === undefined) delete C().sample; else C().sample = sample;
  try { return await fn(); } finally { if (had) C().sample = old; else delete C().sample; }
}
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
      [() => Actions.recordEvent('SkillUsed', { skillId: 'ride-wave', helpful: 3 }), 'bad-event'],
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
      [() => withSample(undefined, () => Actions.loadSample()), 'no-sample'],
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
    assert.deepEqual(s.events.map((e) => [e.type, e.payload.exerciseId, e.payload.responseId]), [['ArtifactSaved', 'quick-reasons', s.response.id]]);
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
  function notify() {
    if (depth) { pending = true; return; }
    for (const fn of subs) fn();
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
      notify();
    },
    async resetAll() { data = empty(); pin = null; locked = false; lastSavedAt = null; notify(); },
    lock: {
      async set(p) { const s = String(p); if (s.length < 4 || s.length > 64) throw Object.assign(new Error('A PIN has 4 to 64 characters.'), { code: 'BAD_PIN' }); pin = s; },
      async unlock(p) { if (pin !== null && String(p) === pin) { locked = false; return true; } return false; },
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
    assert.deepEqual(bare.sections, [], 'no Content: no invented numbers, no throw');
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
    assert.deepEqual(r('sos'), { flow: 'hub', drill: false, preview: false, logged: false });
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
    assert.equal(pairs.length, C().catalogs.spiral.length);
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
function sosDom() {
  const vm = require('node:vm');
  const go = [];
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
    focus() {}
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
  const UI = { h, pages: {}, go: (r) => { go.push(r); }, toast: (m, tone) => { toasts.push([m, tone]); }, speak: () => false, stopSpeaking: () => {} };
  const ctx = vm.createContext({ UI, document: { body, createElement: (t) => new N(t), createTextNode: text }, navigator: {},
    setInterval: () => 0, clearInterval: () => {}, setTimeout, Content: C(), Store: S(), module: { exports: {} } });
  vm.runInContext(readFileSync(src('ui-sos.js'), 'utf8'), ctx, { filename: 'ui-sos.js' });
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
    UI, go, toasts, byId,
    tap: (root, label) => button(root, label).click(),
    tapId: (root, id) => byId(root, id).click(),
    rate: (root, n) => byId(root, 'sos-rating').querySelectorAll('button')[n].click(),
    open(parts, query) {
      const root = UI.pages.sos({ route: { parts, query: query || {} }, A: Actions, view: S().view, E: null,
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
    assert.equal(O.lockError({ code: 'BAD_PIN' }), 'Use 4 to 64 characters.');
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
    assert.doesNotMatch(ONB_SRC, /\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|innerHTML|console\.|localStorage\.setItem/);
    assert.doesNotMatch(ONB_SRC, /(settings|patch|commit|answers)\.?[^\n]*\bpin\b(?!\s*=\s*h\()/i, 'the PIN never goes into rows or answers');
    assert.match(ONB_SRC, /pin\.value = '';/, 'the field is cleared at once');
    assert.ok(O.COPY.early.length <= 80, 'the early-access notice is short');
    assert.equal(O.COPY.clinicalReview, true);
    assert.doesNotMatch(ONB_SRC, /\baddicts?\b/i);
  });
});
