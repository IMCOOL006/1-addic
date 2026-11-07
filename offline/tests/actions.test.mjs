// Lane actions-sos's Node tests (node:test, no dependencies). U-09: the Actions verbs of BUILD-PLAN 3.2 in Node memory
// mode. The real offline/src/store.js and engine.js are loaded by path when they exist (the merged trunk); while one is
// absent, the stand-in at the bottom of this file takes its place: the Store of contract E (tracks/CORE/contracts/core.md)
// in memory, and only the Engine names U-09 calls, with the shapes of tracks/CORE/contracts/engine.md.
import { describe, test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readdirSync } from 'node:fs';
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
      [() => Actions.loadSample(), 'no-sample'],
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
    C().sample = { generate: (now) => ({ stores: { logs: [{ id: 'sample-1', type: 'craving', at: now, date: E().todayStr(now), hour: 9,
      intensity: 4, triggerIds: [], feelings: [], skills: [], drill: false }] } }) };
    try {
      const r = await Actions.loadSample();
      assert.equal(r.count, 1);
      assert.ok(S().view.get('meta', 'sample').loadedAt >= at.slice(0, 10));
      assert.equal(list('logs').length, 1);
      await Actions.eraseAll();
      assert.equal(S().view.get('meta', 'sample'), null);
      assert.equal(list('logs').length, 0);
    } finally { delete C().sample; }
  });
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
      async set(p) { pin = String(p); },
      async unlock(p) { if (pin !== null && String(p) === pin) { locked = false; return true; } return false; },
      async verify(p) { return pin !== null && String(p) === pin; },
      async remove(p) { if (pin !== null && String(p) === pin) { pin = null; locked = false; return true; } return false; },
      lockNow() { if (pin !== null) { locked = true; for (const fn of lockSubs) fn(); } },
      touch() {},
      onLock(fn) { lockSubs.add(fn); return () => lockSubs.delete(fn); },
    },
  };
}
