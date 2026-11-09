/* 1-addic · ACTIONS · every write the app makes (BUILD-PLAN 3.2, 3.4, 3.7).
   Each verb checks its arguments first: a failure throws AppError(message, code) and writes nothing. Then it writes
   its rows and appends its DomainEvents {id, type, at, payload} in ONE Store.commit (a throw inside rolls it all
   back) and returns what it wrote. Nothing ever decreases: events are only appended; a slip adds a row and an event
   and lowers nothing (Engine derives the opt-in current run from slip dates); contacts are deactivated, never deleted.
   An SOS drill writes nothing but TutorialCompleted('drill'), once.
   Classic script: Store, Engine and Content are read by name at call time, so file order does not matter and the
   Node tests can set them on globalThis. No network, no DOM. */
const Actions = (() => {
  'use strict';

  /* ── the namespaces, read when a verb runs ───────────────────────────────────────────────── */
  const getStore = () => (typeof Store !== 'undefined' && Store ? Store : null);
  const getEngine = () => (typeof Engine !== 'undefined' && Engine ? Engine : null);
  const getContent = () => (typeof Content !== 'undefined' && Content ? Content : {});

  /* ── errors ──────────────────────────────────────────────────────────────────────────────── */
  class AppError extends Error {
    constructor(message, code) { super(message); this.name = 'AppError'; this.code = code; }
  }
  function appError(code, message) {
    const E = getEngine();
    let err = null;
    if (E && typeof E.AppError === 'function') {
      try { err = new E.AppError(message, code); } catch (e) { err = null; }
    }
    if (!err) err = new AppError(message, code);
    if (err.code !== code) err.code = code;
    return err;
  }
  const fail = (code, message) => { throw appError(code, message); };

  /* ── small checks ────────────────────────────────────────────────────────────────────────── */
  const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
  const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
  const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;
  const own = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);
  const isObj = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);
  const isBool = (x) => typeof x === 'boolean';
  const isInt = (n, lo, hi) => Number.isInteger(n) && n >= lo && n <= hi;
  const isScore = (n) => isInt(n, 0, 10);
  const isText = (s, max) => typeof s === 'string' && s.length <= (max || 2000);
  const isName = (s, max) => typeof s === 'string' && s.trim().length > 0 && s.length <= (max || 200);
  const isId = (s) => typeof s === 'string' && ID_RE.test(s);
  const isTime = (s) => typeof s === 'string' && TIME_RE.test(s);
  const isIso = (s) => typeof s === 'string' && s.length >= 10 && !isNaN(Date.parse(s));
  const absent = (o, k) => !own(o, k) || o[k] === undefined;
  const pad = (n) => String(n).padStart(2, '0');
  function isDate(s) {
    const m = typeof s === 'string' ? DATE_RE.exec(s) : null;
    if (!m) return false;
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return d.getFullYear() === +m[1] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[3];
  }
  function jsonSize(x) {
    try { const s = JSON.stringify(x); return typeof s === 'string' ? s.length : Infinity; } catch (e) { return Infinity; }
  }
  const clone = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
  function onlyKeys(obj, keys, code, what) {
    for (const k of Object.keys(obj)) if (!keys.includes(k)) fail(code, `${what}: unknown field "${k}".`);
  }
  const idsOf = (list) => (Array.isArray(list) && list.length ? list.map((x) => (isObj(x) ? x.id : x)) : null);
  function known(list, id) {
    const ids = idsOf(list);
    return ids ? ids.includes(id) : isId(id);
  }

  /* ── time and ids ────────────────────────────────────────────────────────────────────────── */
  const stamp = () => new Date().toISOString();
  function localDate(at) {
    const E = getEngine();
    if (E && typeof E.todayStr === 'function') {
      const s = E.todayStr(at);
      if (isDate(s)) return s;
    }
    const d = new Date(at);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  function hourOf(at) {
    const E = getEngine();
    if (E && typeof E.hourOf === 'function') {
      const h = E.hourOf(at);
      if (isInt(h, 0, 23)) return h;
    }
    return new Date(at).getHours();
  }
  let seq = 0;
  function newId() {
    const E = getEngine();
    if (E && typeof E.id === 'function') return String(E.id());
    seq += 1;
    let tail = '';
    const c = typeof globalThis !== 'undefined' ? globalThis.crypto : null;
    if (c && typeof c.getRandomValues === 'function') tail = Array.from(c.getRandomValues(new Uint8Array(4)), (b) => b.toString(16).padStart(2, '0')).join('');
    return `${Date.now().toString(36)}-${seq.toString(36)}${tail}`;
  }

  /* ── stores and the one commit ───────────────────────────────────────────────────────────── */
  const STORES_FALLBACK = { profile: 'key', settings: 'key', meta: 'key', events: 'id', logs: 'id', responses: 'id', contacts: 'id', plans: 'id', todos: 'id', motivation: 'id', predictions: 'id', quests: 'id', tutorials: 'id', reveals: 'id', tips: 'id', recoveryPlan: 'key' };
  function storeMap() {
    const S = getStore();
    if (S && isObj(S.STORES)) return S.STORES;
    const E = getEngine();
    if (E && isObj(E.STORES)) return E.STORES;
    return STORES_FALLBACK;
  }
  function store() {
    const S = getStore();
    if (!S || typeof S.commit !== 'function') fail('no-store', 'The notebook is not open yet.');
    return S;
  }
  /* Runs fn(tx) inside one Store.commit. tx.event() appends a DomainEvent; tx.has() looks for one already written. */
  async function write(label, at, fn) {
    const S = store();
    let out;
    await S.commit(label, (draft) => {
      const events = [];
      const tx = {
        at,
        events,
        get: (s, id) => draft.get(s, id) || null,
        list: (s) => draft.list(s) || [],
        put: (s, row) => { draft.put(s, row); return row; },
        del: (s, id) => draft.del(s, id),
        event(type, payload) {
          const e = { id: newId(), type, at, payload: payload || {} };
          draft.put('events', e);
          events.push(e);
          return e;
        },
        has(type, field, value) {
          return tx.list('events').some((e) => e && e.sample !== true && e.type === type && (field == null || (e.payload && e.payload[field] === value))); // sample rows never count (O6)
        },
      };
      out = fn(tx);
    });
    return out;
  }

  /* ── 3.7 event types ─────────────────────────────────────────────────────────────────────── */
  const EVENT_TYPES = ['LogCreated', 'CheckinCompleted', 'SkillUsed', 'SosCompleted', 'LessonCompleted', 'ModuleCompleted',
    'CheckpointCompleted', 'ArtifactSaved', 'ExerciseDone', 'BattlePlanCreated', 'BattlePlanDebriefed', 'ActivityDone',
    'MindfulMinute', 'WeeklyReviewCompleted', 'SlipLogged', 'SlipReviewed', 'ContactReached', 'ScriptUsed',
    'TutorialCompleted', 'ExplorerCompleted', 'FeatureRevealed', 'MilestoneSeen', 'RecoveryPlanConfirmed', 'OnboardingCompleted',
    'ObjectiveDone', 'ObjectiveSwapped', 'QuestLineStepDone', 'FeatureUnlocked']; // V-41 (R-O-6): the last four
  /* once-only events, keyed by this payload field ('' = once ever) */
  const ONCE = { TutorialCompleted: 'id', LessonCompleted: 'lessonId', CheckpointCompleted: 'moduleId', ModuleCompleted: 'moduleId',
    ExplorerCompleted: '', OnboardingCompleted: '', RecoveryPlanConfirmed: '', MilestoneSeen: 'milestone', FeatureRevealed: 'featureId',
    QuestLineStepDone: 'id', FeatureUnlocked: 'feature' };
  /* required payload fields */
  const NEEDS = {
    SkillUsed: { skillId: isId, helpful: isBool }, SlipLogged: { date: isDate }, MilestoneSeen: { milestone: (n) => isInt(n, 1, 100000) },
    TutorialCompleted: { id: isId }, LessonCompleted: { lessonId: isId }, CheckpointCompleted: { moduleId: isId }, ModuleCompleted: { moduleId: isId },
    FeatureRevealed: { featureId: isId }, ContactReached: { contactId: isId }, ScriptUsed: { responseId: isId }, WeeklyReviewCompleted: { weekStart: isDate },
    ObjectiveDone: { id: isId, date: isDate }, ObjectiveSwapped: { from: isId, to: isId, date: isDate }, QuestLineStepDone: { id: isId },
    FeatureUnlocked: { feature: isId },
  };
  function onceDone(tx, type, payload) {
    if (!own(ONCE, type)) return false;
    const f = ONCE[type];
    return f ? tx.has(type, f, payload[f]) : tx.has(type);
  }

  /* ── onboarding and settings (3.4) ───────────────────────────────────────────────────────── */
  const PROFILE_KEYS = ['name', 'companion', 'substances', 'term', 'startDate', 'notSure', 'stage', 'region', 'checkin',
    'reviewDay', 'pace', 'customPerWeek', 'roadmapStart', 'medical'];
  const MEDICAL_KEYS = ['heavyDaily', 'sedatives', 'opioids'];
  const SETTINGS_DEFAULTS = { theme: 'system', calm: false, counters: true, showCurrentRun: false, discreet: false, tips: true,
    showAll: false, textSize: 'normal', reducedMotion: false, highContrast: false, lastTipDay: null, lastBackupAt: null,
    backupReminderDismissedAt: null, milestonesSeen: [], maintenance: false, earlyNoticeSeen: false };
  const isoOrNull = (v) => v === null || isIso(v);
  const SETTING_RULES = {
    theme: (v) => ['light', 'dark', 'system'].includes(v), calm: isBool, counters: isBool, showCurrentRun: isBool,
    discreet: isBool, tips: isBool, showAll: isBool, textSize: (v) => ['normal', 'large', 'larger'].includes(v),
    reducedMotion: isBool, highContrast: isBool, lastTipDay: (v) => v === null || isDate(v), lastBackupAt: isoOrNull,
    backupReminderDismissedAt: isoOrNull, milestonesSeen: (v) => Array.isArray(v) && v.every((n) => isInt(n, 1, 100000)),
    maintenance: isBool, earlyNoticeSeen: isBool,
  };

  function checkProfile(p) {
    if (!isObj(p)) fail('bad-profile', 'Profile details must be an object.');
    onlyKeys(p, PROFILE_KEYS, 'bad-profile', 'Profile');
    const C = getContent();
    const bad = (k) => fail('bad-profile', `Profile: "${k}" is not valid.`);
    const has = (k) => !absent(p, k);
    if (has('name') && !isText(p.name, 80)) bad('name');
    if (has('companion') && !isText(p.companion, 40)) bad('companion');
    if (has('substances') && !(Array.isArray(p.substances) && p.substances.length <= 20 && p.substances.every((s) => isName(s, 120)))) bad('substances');
    if (has('term') && !(typeof p.term === 'string' && known(C.terms, p.term))) bad('term');
    if (has('startDate') && !(p.startDate === null || p.startDate === '' || isDate(p.startDate))) bad('startDate');
    if (has('startDate') && isDate(p.startDate) && p.startDate > localDate(stamp())) fail('FUTURE_DATE', 'A start date cannot be after today.');
    if (has('notSure') && !isBool(p.notSure)) bad('notSure');
    if (has('stage') && !(p.stage === null || (typeof p.stage === 'string' && known(C.stages, p.stage)))) bad('stage');
    if (has('region') && !['in', 'intl'].includes(p.region)) bad('region');
    if (has('checkin')) {
      if (!isObj(p.checkin)) bad('checkin');
      onlyKeys(p.checkin, ['morning', 'evening'], 'bad-profile', 'Check-in times');
      for (const k of ['morning', 'evening']) if (!absent(p.checkin, k) && !(p.checkin[k] === null || p.checkin[k] === '' || isTime(p.checkin[k]))) bad('checkin');
    }
    if (has('reviewDay') && !isInt(p.reviewDay, 0, 6)) bad('reviewDay');
    if (has('pace') && !(typeof p.pace === 'string' && (p.pace === 'custom' || known(C.paces, p.pace)))) bad('pace');
    if (has('customPerWeek') && !(p.customPerWeek === null || (typeof p.customPerWeek === 'number' && p.customPerWeek > 0 && p.customPerWeek <= 7))) bad('customPerWeek');
    if (has('roadmapStart') && !(p.roadmapStart === null || isDate(p.roadmapStart))) bad('roadmapStart');
    if (has('medical')) {
      if (!isObj(p.medical)) bad('medical');
      onlyKeys(p.medical, MEDICAL_KEYS, 'bad-profile', 'Medical safety');
      for (const k of Object.keys(p.medical)) if (!isBool(p.medical[k])) bad('medical');
    }
  }
  function settingsRow(prev) {
    return Object.assign({}, clone(SETTINGS_DEFAULTS), prev || {}, { key: 'app' });
  }

  async function onboard(patch) {
    checkProfile(patch);
    const at = stamp();
    const p = clone(patch);
    return write('onboard', at, (tx) => {
      const prev = ownRow(tx, 'profile', 'me'); // RS-SAMPLE: a sample profile is not the person's: theirs starts fresh, unmarked
      const firstTerm = idsOf(getContent().terms);
      const base = { key: 'me', name: '', companion: '', substances: [], term: firstTerm ? firstTerm[0] : 'sober', startDate: null,
        notSure: false, stage: null, region: 'in', checkin: { morning: null, evening: null }, reviewDay: 0, pace: 'steady',
        customPerWeek: null, roadmapStart: localDate(at), onboardedAt: at, medical: { heavyDaily: false, sedatives: false, opioids: false }, locale: 'en' };
      const profile = Object.assign({}, base, prev || {}, p);
      profile.checkin = Object.assign({}, base.checkin, prev && prev.checkin, p.checkin);
      profile.medical = Object.assign({}, base.medical, prev && prev.medical, p.medical);
      profile.key = 'me';
      profile.locale = 'en';
      profile.onboardedAt = (prev && prev.onboardedAt) || at;
      tx.put('profile', profile);
      const settings = settingsRow(ownRow(tx, 'settings', 'app')); // RS-SAMPLE: nor sample settings
      tx.put('settings', settings);
      if (!tx.has('OnboardingCompleted')) tx.event('OnboardingCompleted', {});
      return { profile, settings, events: tx.events };
    });
  }

  async function patchSettings(patch) {
    if (!isObj(patch)) fail('bad-setting', 'Settings must be an object.');
    for (const k of Object.keys(patch)) {
      if (!own(SETTING_RULES, k)) fail('bad-setting', `Unknown setting "${k}".`);
      if (!SETTING_RULES[k](patch[k])) fail('bad-setting', `Setting "${k}" is not valid.`);
    }
    const at = stamp();
    const p = clone(patch);
    return write('settings', at, (tx) => {
      const prev = settingsRow(ownRow(tx, 'settings', 'app')); // RS-SAMPLE: a change over sample settings starts the person's own row
      const next = Object.assign({}, prev, p, { key: 'app' });
      /* milestones seen are a record: they only grow */
      if (own(p, 'milestonesSeen')) next.milestonesSeen = [...new Set([...(prev.milestonesSeen || []), ...p.milestonesSeen])].sort((a, b) => a - b);
      tx.put('settings', next);
      return next;
    });
  }

  /* ── recordEvent ─────────────────────────────────────────────────────────────────────────── */
  // Each is written by its own verb, with the row or the rule it needs (RC19: a plan confirmed with no plan row, an
  // onboarding with no profile row, a module whose lessons are not all done).
  const VERB_OWNED = ['SosCompleted', 'LogCreated', 'SkillUsed', 'SlipLogged', 'RecoveryPlanConfirmed', 'OnboardingCompleted', 'ModuleCompleted',
    'ObjectiveDone', 'ObjectiveSwapped', 'QuestLineStepDone', 'FeatureUnlocked'];
  async function recordEvent(type, payload) {
    if (VERB_OWNED.includes(type)) fail('USE_VERB', `${type} is written by its own verb (sosSession, logCraving, logFeeling, logSlip, useSkill, recoveryPlan.save, onboard, completeLesson, checkpoint, objective.done, objective.swap or questLine.claim).`);
    if (!EVENT_TYPES.includes(type)) fail('bad-event', `Unknown event type "${type}".`);
    const pl = payload === undefined ? {} : payload;
    if (!isObj(pl) || jsonSize(pl) > 5000) fail('bad-event', 'An event payload must be a small object.');
    const need = NEEDS[type] || {};
    for (const k of Object.keys(need)) if (!need[k](pl[k])) fail('bad-event', `${type}: "${k}" is missing or not valid.`);
    if (type === 'MindfulMinute' && !absent(pl, 'minutes') && !isInt(pl.minutes, 1, 600)) fail('bad-event', 'MindfulMinute: "minutes" is not valid.');
    const at = stamp();
    const p = clone(pl);
    return write(`event ${type}`, at, (tx) => {
      if (!onceDone(tx, type, p)) tx.event(type, p);
      return { events: tx.events };
    });
  }

  /* ── useSkill (V-08a) ────────────────────────────────────────────────────────────────────── */
  // A skill used in a game or a tool, credited with one SkillUsed {skillId, helpful} and no log; XP and mastery are the
  // Engine's. Like V-41's verbs (and unlike the rest) it never throws: a refusal comes back as {ok: false, code, message} and writes
  // nothing. It refuses a non-object, a skillId not an id or not in Content.skills, a non-boolean helpful, and the
  // store's own refusal (no store, locked), passed through. A loaded sample is not a refusal (R-C-48): the event is the
  // person's own, unmarked. The drill records nothing: its caller does not call (ui-tools.js isDrill).
  async function useSkill(v) {
    try {
      if (!isObj(v)) fail('bad-event', 'useSkill takes {skillId, helpful}.');
      if (!isId(v.skillId) || !known(getContent().skills, v.skillId)) fail('bad-skill', 'Unknown skill.');
      if (!isBool(v.helpful)) fail('bad-event', 'A skill\'s "helpful" must be true or false.');
      const p = { skillId: v.skillId, helpful: v.helpful };
      const event = await write('event SkillUsed', stamp(), (tx) => tx.event('SkillUsed', p));
      return { ok: true, event };
    } catch (e) {
      const coded = e && typeof e.code === 'string' && e.code;
      return { ok: false, code: coded ? e.code : 'error', message: coded && typeof e.message === 'string' ? e.message : 'The skill could not be saved.' };
    }
  }

  /* ── logs ────────────────────────────────────────────────────────────────────────────────── */
  function checkSkills(list, code) {
    if (!Array.isArray(list) || list.length > 20) fail(code, 'Skills must be a short list.');
    const C = getContent();
    return list.map((s) => {
      const t = typeof s === 'string' ? { skillId: s, helpful: false } : s;
      if (!isObj(t) || !isId(t.skillId) || !known(C.skills, t.skillId)) fail(code, 'Unknown skill.');
      if (!absent(t, 'helpful') && !isBool(t.helpful)) fail(code, 'A skill\'s "helpful" must be true or false.');
      return { skillId: t.skillId, helpful: t.helpful === true };
    });
  }
  const LOG_KEYS = ['intensity', 'triggerIds', 'thought', 'redFlag', 'feelings', 'skills', 'notes', 'emotion'];
  function checkLog(e) {
    const code = 'bad-log';
    if (!isObj(e)) fail(code, 'A log must be an object.');
    onlyKeys(e, LOG_KEYS, code, 'Log');
    if (!isScore(e.intensity)) fail(code, 'Intensity must be a whole number from 0 to 10.');
    for (const k of ['triggerIds', 'feelings']) {
      if (!absent(e, k) && !(Array.isArray(e[k]) && e[k].length <= 40 && e[k].every((x) => isName(x, 120)))) fail(code, `"${k}" must be a list of short labels.`);
    }
    for (const k of ['thought', 'notes']) if (!absent(e, k) && !isText(e[k], k === 'notes' ? 2000 : 500)) fail(code, `"${k}" is too long.`);
    if (!absent(e, 'redFlag') && !(isBool(e.redFlag) || isText(e.redFlag, 500))) fail(code, '"redFlag" is not valid.');
    if (!absent(e, 'emotion') && !(e.emotion === null || (typeof e.emotion === 'string' && known(getContent().emotions, e.emotion)))) fail(code, 'Unknown emotion.');
    return absent(e, 'skills') ? [] : checkSkills(e.skills, code);
  }
  function logRow(type, at, extra) {
    return Object.assign({ id: newId(), type, at, date: localDate(at), hour: hourOf(at), triggerIds: [], feelings: [], skills: [] }, extra, { drill: false });
  }
  function writeLog(kind, e) {
    const skills = checkLog(e);
    const at = stamp();
    const p = clone(e);
    return write(`log ${kind}`, at, (tx) => {
      const log = tx.put('logs', logRow(kind, at, {
        intensity: p.intensity, emotion: p.emotion || null, triggerIds: p.triggerIds || [], thought: p.thought || '',
        redFlag: absent(p, 'redFlag') ? null : p.redFlag, feelings: p.feelings || [], skills, notes: p.notes || '',
      }));
      tx.event('LogCreated', { logId: log.id, type: kind });
      for (const s of skills) tx.event('SkillUsed', { skillId: s.skillId, helpful: s.helpful, logId: log.id });
      return { log, events: tx.events };
    });
  }
  const logCraving = async (e) => writeLog('craving', e);
  const logFeeling = async (e) => writeLog('feeling', e);

  const CHECKIN_KEYS = ['mood', 'anxiety', 'peakCraving', 'pleasantCount', 'used', 'sleep', 'meeting', 'intention'];
  async function checkin(kind, data) {
    const code = 'bad-checkin';
    if (!['morning', 'evening'].includes(kind)) fail(code, 'A check-in is morning or evening.');
    const d = data === undefined ? {} : data;
    if (!isObj(d)) fail(code, 'A check-in must be an object.');
    onlyKeys(d, CHECKIN_KEYS, code, 'Check-in');
    for (const k of ['mood', 'anxiety', 'peakCraving']) if (!absent(d, k) && d[k] !== null && !isScore(d[k])) fail(code, `"${k}" must be 0 to 10.`);
    if (!absent(d, 'pleasantCount') && !isInt(d.pleasantCount, 0, 50)) fail(code, '"pleasantCount" is not valid.');
    for (const k of ['used', 'meeting']) if (!absent(d, k) && d[k] !== null && !isBool(d[k])) fail(code, `"${k}" must be yes or no.`);
    if (!absent(d, 'sleep') && d.sleep !== null && !(typeof d.sleep === 'number' && d.sleep >= 0 && d.sleep <= 24)) fail(code, '"sleep" is hours from 0 to 24.');
    if (!absent(d, 'intention') && !isText(d.intention, 300)) fail(code, '"intention" is too long.');
    const at = stamp();
    const c = Object.assign({ kind }, clone(d), { kind });
    return write(`checkin ${kind}`, at, (tx) => {
      const log = tx.put('logs', logRow('checkin', at, { checkin: c }));
      tx.event('CheckinCompleted', { logId: log.id, kind });
      return { log, events: tx.events };
    });
  }

  const ACTIVITY_KINDS = ['exercise', 'mindfulness', 'meeting', 'pleasant'];
  async function logActivity(data) {
    const code = 'bad-activity';
    if (!isObj(data)) fail(code, 'An activity must be an object.');
    onlyKeys(data, ['kind', 'minutes', 'name', 'enjoyment'], code, 'Activity');
    if (!ACTIVITY_KINDS.includes(data.kind)) fail(code, 'Unknown kind of activity.');
    if (!isInt(data.minutes, 1, 1440)) fail(code, 'Minutes must be a whole number from 1 to 1440.');
    if (!absent(data, 'name') && !isText(data.name, 120)) fail(code, '"name" is too long.');
    if (!absent(data, 'enjoyment') && data.enjoyment !== null && !isScore(data.enjoyment)) fail(code, '"enjoyment" must be 0 to 10.');
    const at = stamp();
    const a = { kind: data.kind, minutes: data.minutes, name: data.name || '', enjoyment: absent(data, 'enjoyment') ? null : data.enjoyment };
    return write('log activity', at, (tx) => {
      const log = tx.put('logs', logRow('activity', at, { activity: a }));
      tx.event('ActivityDone', { kind: a.kind, minutes: a.minutes, logId: log.id });
      return { log, events: tx.events };
    });
  }

  /* A slip adds one row and one SlipLogged; startDate, counters, XP, mastery and badges are never touched. */
  async function logSlip(data) {
    const code = 'bad-slip';
    const d = data === undefined ? {} : data;
    if (!isObj(d)) fail(code, 'A slip must be an object.');
    onlyKeys(d, ['date', 'substance', 'situation', 'notes'], code, 'Slip');
    const at = stamp();
    const date = absent(d, 'date') ? localDate(at) : d.date;
    if (!isDate(date) || date > localDate(at)) fail(code, 'The date must be today or earlier.');
    if (!absent(d, 'substance') && !isText(d.substance, 120)) fail(code, '"substance" is too long.');
    if (!absent(d, 'situation') && !isText(d.situation, 1000)) fail(code, '"situation" is too long.');
    if (!absent(d, 'notes') && !isText(d.notes, 2000)) fail(code, '"notes" is too long.');
    return write('log slip', at, (tx) => {
      const log = tx.put('logs', logRow('slip', at, { date, used: true, substance: d.substance || '', situation: d.situation || '', notes: d.notes || '' }));
      tx.event('SlipLogged', { date, logId: log.id });
      return { log, events: tx.events };
    });
  }

  /* ── SOS ─────────────────────────────────────────────────────────────────────────────────── */
  const SOS_KEYS = ['kind', 'ratingBefore', 'ratingAfter', 'tools', 'delays', 'used', 'risky', 'outcome', 'drill', 'emotion', 'date'];
  const OUTCOMES = ['passed', 'still', 'used'];
  function checkSession(s) {
    const code = 'bad-session';
    if (!isObj(s)) fail(code, 'An SOS session must be an object.');
    onlyKeys(s, SOS_KEYS, code, 'SOS session');
    if (!['craving', 'feeling', 'slip'].includes(s.kind)) fail(code, 'An SOS session is a craving, a feeling or a slip.');
    for (const k of ['ratingBefore', 'ratingAfter']) if (!absent(s, k) && s[k] !== null && !isScore(s[k])) fail(code, `"${k}" must be 0 to 10.`);
    const tools = absent(s, 'tools') ? [] : checkSkills(s.tools, code);
    if (!absent(s, 'delays') && !isInt(s.delays, 0, 100)) fail(code, '"delays" is not valid.');
    for (const k of ['used', 'risky', 'drill']) if (!absent(s, k) && !isBool(s[k])) fail(code, `"${k}" must be true or false.`);
    if (!absent(s, 'outcome') && !OUTCOMES.includes(s.outcome)) fail(code, 'Unknown outcome.');
    if (!absent(s, 'emotion') && !(s.emotion === null || (typeof s.emotion === 'string' && known(getContent().emotions, s.emotion)))) fail(code, 'Unknown emotion.');
    if (!absent(s, 'date') && !isDate(s.date)) fail(code, 'The date must be today or earlier.'); // RC16
    const used = s.kind === 'slip' || s.used === true;
    if (!absent(s, 'outcome') && (s.outcome === 'used') !== used) fail(code, 'The outcome does not match "used".');
    const before = absent(s, 'ratingBefore') ? null : s.ratingBefore;
    const after = absent(s, 'ratingAfter') ? null : s.ratingAfter;
    let outcome = absent(s, 'outcome') ? null : s.outcome;
    if (!outcome) outcome = used ? 'used' : (before !== null && after !== null && after > 0 && after >= before) ? 'still' : 'passed';
    return { kind: s.kind, ratingBefore: before, ratingAfter: after, tools, delays: absent(s, 'delays') ? 0 : s.delays,
      used, risky: s.risky === true, outcome, drill: s.drill === true, emotion: absent(s, 'emotion') ? null : s.emotion, date: absent(s, 'date') ? null : s.date };
  }
  async function sosSession(s) {
    const v = checkSession(s);
    const at = stamp();
    if (v.date && v.date > localDate(at)) fail('bad-session', 'The date must be today or earlier.'); // RC16: a save kept for the unlock keeps the day of the tap
    if (v.drill) {
      /* a rehearsal: no log, no skill, no XP for the session, no slip; only the drill's tutorial mark, once */
      const S = store();
      const seen = (S.view && typeof S.view.list === 'function' ? S.view.list('events') || [] : [])
        .some((e) => e && e.sample !== true && e.type === 'TutorialCompleted' && e.payload && e.payload.id === 'drill');
      if (seen) return { drill: true, events: [] };
      return write('sos drill', at, (tx) => {
        if (!tx.has('TutorialCompleted', 'id', 'drill')) tx.event('TutorialCompleted', { id: 'drill', skipped: false });
        return { drill: true, events: tx.events };
      });
    }
    return write(`sos ${v.kind}`, at, (tx) => {
      const log = tx.put('logs', logRow(v.kind, at, {
        ...(v.date ? { date: v.date } : {}), // RC16: the day of the tap when the save came later
        intensity: v.ratingBefore, skills: v.tools, used: v.used,
        sos: { ratingBefore: v.ratingBefore, ratingAfter: v.ratingAfter, delays: v.delays, risky: v.risky, outcome: v.outcome },
        ...(v.emotion ? { emotion: v.emotion, feelings: [v.emotion] } : {}), // a feeling session keeps the feeling (09:33 ruling)
      }));
      tx.event('LogCreated', { logId: log.id, type: v.kind });
      for (const t of v.tools) tx.event('SkillUsed', { skillId: t.skillId, helpful: t.helpful, logId: log.id });
      tx.event('SosCompleted', { kind: v.kind, outcome: v.outcome, ratingBefore: v.ratingBefore, ratingAfter: v.ratingAfter, delays: v.delays, logId: log.id });
      if (v.used) tx.event('SlipLogged', { date: log.date, logId: log.id });
      return { log, events: tx.events };
    });
  }

  /* ── learning ────────────────────────────────────────────────────────────────────────────── */
  const modules = () => (Array.isArray(getContent().modules) ? getContent().modules : []);
  const moduleOf = (moduleId) => modules().find((m) => m && m.id === moduleId) || null;
  const moduleOfLesson = (lessonId) => modules().find((m) => m && Array.isArray(m.lessons) && m.lessons.some((l) => l && l.id === lessonId)) || null;
  // `plus`: the lesson this commit completes (a draft need not list the rows it has staged).
  function lessonsAllDone(tx, m, plus) {
    const ls = Array.isArray(m.lessons) ? m.lessons : [];
    return ls.every((l) => l.id === plus || tx.has('LessonCompleted', 'lessonId', l.id));
  }
  async function completeLesson(lessonId) {
    if (!isId(lessonId) || (modules().length && !moduleOfLesson(lessonId))) fail('unknown-lesson', 'Unknown lesson.');
    const at = stamp();
    return write(`lesson ${lessonId}`, at, (tx) => {
      if (!tx.has('LessonCompleted', 'lessonId', lessonId)) {
        tx.event('LessonCompleted', { lessonId });
        const m = moduleOfLesson(lessonId);
        if (m && lessonsAllDone(tx, m, lessonId) && tx.has('CheckpointCompleted', 'moduleId', m.id) && !tx.has('ModuleCompleted', 'moduleId', m.id)) {
          tx.event('ModuleCompleted', { moduleId: m.id });
        }
      }
      return { events: tx.events };
    });
  }
  async function checkpoint(moduleId, answers) {
    const code = 'bad-checkpoint';
    if (!isId(moduleId) || (modules().length && !moduleOf(moduleId))) fail(code, 'Unknown module.');
    if (!Array.isArray(answers) || answers.length > 50 || jsonSize(answers) > 20000) fail(code, 'Answers must be a short list.');
    const at = stamp();
    return write(`checkpoint ${moduleId}`, at, (tx) => {
      if (!tx.has('CheckpointCompleted', 'moduleId', moduleId)) tx.event('CheckpointCompleted', { moduleId });
      const m = moduleOf(moduleId);
      if ((!m || lessonsAllDone(tx, m)) && !tx.has('ModuleCompleted', 'moduleId', moduleId)) tx.event('ModuleCompleted', { moduleId });
      return { events: tx.events };
    });
  }

  /* ── responses (append-only; the latest non-draft is the artifact) ───────────────────────── */
  const DONE_KINDS = ['practice', 'reflect', 'tool'];
  const ARTIFACT_KINDS = ['build', 'assess', 'plan']; // 3.7: ArtifactSaved for these, ExerciseDone for DONE_KINDS, neither for another kind (RC17)
  function exerciseKind(exerciseId) {
    const ex = getContent().exercises;
    if (!ex) return { known: isId(exerciseId), kind: null };
    const row = Array.isArray(ex) ? ex.find((x) => x && x.id === exerciseId) : (isObj(ex) && own(ex, exerciseId) ? ex[exerciseId] : null);
    return row ? { known: true, kind: row.kind || null } : { known: false, kind: null };
  }
  function responseRow(exerciseId, payload, at, mode, draft) {
    return { id: newId(), exerciseId, schemaVersion: Number(getContent().schemaVersion) || 1, payload, at, mode, draft };
  }
  async function saveResponse(exerciseId, payload, opts) {
    const ex = typeof exerciseId === 'string' ? exerciseKind(exerciseId) : { known: false };
    if (!ex.known) fail('unknown-exercise', 'Unknown exercise.');
    if (!(isObj(payload) || Array.isArray(payload)) || jsonSize(payload) > 200000) fail('bad-response', 'An answer must be an object or a list.');
    const o = opts === undefined ? {} : opts;
    if (!isObj(o)) fail('bad-response', 'Options must be an object.');
    onlyKeys(o, ['mode', 'draft'], 'bad-response', 'Options');
    const mode = absent(o, 'mode') ? 'workbook' : o.mode;
    if (!['tutorial', 'workbook'].includes(mode)) fail('bad-response', 'Mode is tutorial or workbook.');
    if (!absent(o, 'draft') && !isBool(o.draft)) fail('bad-response', '"draft" must be true or false.');
    const draft = o.draft === true;
    const at = stamp();
    const p = clone(payload);
    return write(`response ${exerciseId}`, at, (tx) => {
      const response = tx.put('responses', responseRow(exerciseId, p, at, mode, draft));
      if (!draft) {
        const type = DONE_KINDS.includes(ex.kind) ? 'ExerciseDone' : ARTIFACT_KINDS.includes(ex.kind) ? 'ArtifactSaved' : null;
        if (type) tx.event(type, { exerciseId, kind: ex.kind, responseId: response.id });
      }
      return { response, events: tx.events };
    });
  }

  /* ── contacts (stay on the device; deactivated, never deleted) ───────────────────────────── */
  const ROLES = ['safetyNet', 'risky', 'sponsor', 'therapist', 'other'];
  const STRATEGIES = ['avoid', 'limit', 'setLimits'];
  const PHONE_RE = /^[0-9+()\-.\s]{3,24}$/;
  const REACH = ['call', 'text', 'meet', 'other'];
  function checkContact(c, partial) {
    const code = 'bad-contact';
    if (!isObj(c)) fail(code, 'A contact must be an object.');
    onlyKeys(c, partial ? ['name', 'role', 'strategy', 'phone', 'note', 'active'] : ['name', 'role', 'strategy', 'phone', 'note'], code, 'Contact');
    if ((!partial || !absent(c, 'name')) && !isName(c.name, 80)) fail(code, 'A contact needs a name.');
    if (!absent(c, 'role') && !ROLES.includes(c.role)) fail(code, 'Unknown role.');
    if (!absent(c, 'strategy') && c.strategy !== null && !STRATEGIES.includes(c.strategy)) fail(code, 'Unknown strategy.');
    if (!absent(c, 'phone') && c.phone !== '' && !(typeof c.phone === 'string' && PHONE_RE.test(c.phone))) fail(code, 'That phone number does not look right.');
    if (!absent(c, 'note') && !isText(c.note, 300)) fail(code, '"note" is too long.');
    if (!absent(c, 'active') && !isBool(c.active)) fail(code, '"active" must be true or false.');
  }
  function needRow(tx, s, id, code, what) {
    const row = tx.get(s, id);
    if (!row) fail(code, `${what} not found.`);
    return row;
  }
  /* RS37R, RS38 (ruling 2026-11-07 22:52 IST): every update verb goes through claimRow. A patch that changes the value
     of a field that is not a true/false flag makes a sample row the person's (the mark goes, so eraseSample keeps their
     words); a patch that changes nothing, or only flags (a to-do ticked, a contact hidden or shown), keeps it. A null
     patch: the verb always writes the person's words or score (a debrief, a prediction's result). RC23: a plan's status
     is a state, like a flag: a status change keeps the mark. */
  function sameValue(a, b) {
    const blank = (v) => v === undefined || v === null || v === '';
    if (blank(a) || blank(b)) return blank(a) && blank(b);
    if (typeof a !== 'object' || typeof b !== 'object') return a === b;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].every((k) => sameValue(a[k], b[k]));
  }
  function claimRow(prev, patch, next) {
    if (next.sample === true && (patch === null || Object.keys(patch).some((k) => k !== 'status' && !isBool(patch[k]) && !sameValue(patch[k], prev[k])))) delete next.sample;
    return next;
  }
  const contacts = {
    async add(c) {
      checkContact(c, false);
      const at = stamp();
      const p = clone(c);
      return write('contact add', at, (tx) => tx.put('contacts', {
        id: newId(), name: p.name.trim(), role: p.role || 'safetyNet', strategy: p.strategy || null, phone: p.phone || '',
        note: p.note || '', active: true, at,
      }));
    },
    async update(id, patch) {
      if (!isId(id)) fail('bad-contact', 'Contact not found.');
      checkContact(patch, true);
      const p = clone(patch);
      if (typeof p.name === 'string') p.name = p.name.trim();
      return write('contact update', stamp(), (tx) => {
        const prev = needRow(tx, 'contacts', id, 'bad-contact', 'Contact');
        // RS37, RS38: the person's edit makes a sample contact theirs (SOS shows it, eraseSample keeps it); a Save with
        // no change, or Show again (active only), keeps the mark
        return tx.put('contacts', claimRow(prev, p, Object.assign({}, prev, p, { id })));
      });
    },
    async deactivate(id) {
      if (!isId(id)) fail('bad-contact', 'Contact not found.');
      return write('contact deactivate', stamp(), (tx) => {
        const prev = needRow(tx, 'contacts', id, 'bad-contact', 'Contact');
        return tx.put('contacts', claimRow(prev, { active: false }, Object.assign({}, prev, { active: false })));
      });
    },
    async reached(id, how) {
      if (!isId(id)) fail('bad-contact', 'Contact not found.');
      if (!REACH.includes(how)) fail('bad-contact', 'Reached out how: call, text, meet or other.');
      return write('contact reached', stamp(), (tx) => {
        needRow(tx, 'contacts', id, 'bad-contact', 'Contact');
        tx.event('ContactReached', { contactId: id, how });
        return { events: tx.events };
      });
    },
  };

  /* ── plans, weekly review, to-dos ────────────────────────────────────────────────────────── */
  const PLAN_KINDS = ['should', 'want', 'recovery', 'risky'];
  const PLAN_STATUS = ['planned', 'done', 'skipped'];
  function checkBattlePlan(b) {
    const code = 'bad-plan';
    if (!isObj(b)) fail(code, 'A Battle Plan must be an object.');
    onlyKeys(b, ['situation', 'plan', 'backups', 'buddyId', 'exit'], code, 'Battle Plan');
    for (const k of ['situation', 'plan', 'exit']) if (!absent(b, k) && !isText(b[k], 1000)) fail(code, `"${k}" is too long.`);
    if (!absent(b, 'backups') && !(Array.isArray(b.backups) && b.backups.length <= 10 && b.backups.every((x) => isText(x, 300)))) fail(code, '"backups" must be a short list.');
    if (!absent(b, 'buddyId') && b.buddyId !== null && !isId(b.buddyId)) fail(code, '"buddyId" is not valid.');
  }
  function checkPlan(p, partial) {
    const code = 'bad-plan';
    if (!isObj(p)) fail(code, 'A plan item must be an object.');
    onlyKeys(p, ['date', 'start', 'end', 'title', 'kind', 'activity', 'risky', 'battlePlan', 'reward', 'status'], code, 'Plan item');
    const need = (k) => !partial || !absent(p, k);
    if (need('date') && !isDate(p.date)) fail(code, 'A plan item needs a date.');
    if (need('start') && !isTime(p.start)) fail(code, 'A plan item needs a start time.');
    if (need('end') && !isTime(p.end)) fail(code, 'A plan item needs an end time.');
    if (need('title') && !isName(p.title, 120)) fail(code, 'A plan item needs a title.');
    if (!absent(p, 'kind') && !PLAN_KINDS.includes(p.kind)) fail(code, 'Unknown kind of plan item.');
    if (!absent(p, 'activity') && p.activity !== null && !isText(p.activity, 120)) fail(code, '"activity" is too long.');
    if (!absent(p, 'risky') && !isBool(p.risky)) fail(code, '"risky" must be true or false.');
    if (!absent(p, 'battlePlan') && p.battlePlan !== null) checkBattlePlan(p.battlePlan);
    if (!absent(p, 'reward') && p.reward !== null && !isText(p.reward, 200)) fail(code, '"reward" is too long.');
    if (!absent(p, 'status') && !PLAN_STATUS.includes(p.status)) fail(code, 'Unknown status.');
  }
  const endsAfter = (row) => row.end > row.start;
  const plans = {
    async add(item) {
      checkPlan(item, false);
      if (!endsAfter(item)) fail('bad-plan', 'The end time must be after the start time.');
      const at = stamp();
      const p = clone(item);
      return write('plan add', at, (tx) => {
        const kind = p.kind || 'should';
        const plan = tx.put('plans', { id: newId(), date: p.date, start: p.start, end: p.end, title: p.title.trim(), kind,
          activity: p.activity || null, risky: absent(p, 'risky') ? kind === 'risky' : p.risky, battlePlan: p.battlePlan || null,
          reward: p.reward || null, status: p.status || 'planned', at });
        if (plan.battlePlan) tx.event('BattlePlanCreated', { planId: plan.id });
        return { plan, events: tx.events };
      });
    },
    async update(id, patch) {
      if (!isId(id)) fail('bad-plan', 'Plan item not found.');
      checkPlan(patch, true);
      const p = clone(patch);
      return write('plan update', stamp(), (tx) => {
        const prev = needRow(tx, 'plans', id, 'bad-plan', 'Plan item');
        const plan = claimRow(prev, p, Object.assign({}, prev, p, { id }));
        if (!endsAfter(plan)) fail('bad-plan', 'The end time must be after the start time.');
        tx.put('plans', plan);
        if (plan.battlePlan && plan.sample !== true && !tx.has('BattlePlanCreated', 'planId', id)) tx.event('BattlePlanCreated', { planId: id }); // RC23: only for the person's row
        return { plan, events: tx.events };
      });
    },
    async remove(id) {
      if (!isId(id)) fail('bad-plan', 'Plan item not found.');
      return write('plan remove', stamp(), (tx) => {
        needRow(tx, 'plans', id, 'bad-plan', 'Plan item');
        tx.del('plans', id);
        return { removed: id };
      });
    },
    async debrief(id, d) {
      if (!isId(id)) fail('bad-plan', 'Plan item not found.');
      if (!isObj(d)) fail('bad-plan', 'A debrief must be an object.');
      onlyKeys(d, ['usedPlan', 'how'], 'bad-plan', 'Debrief');
      if (!isBool(d.usedPlan)) fail('bad-plan', '"usedPlan" must be true or false.');
      if (!absent(d, 'how') && !isText(d.how, 1000)) fail('bad-plan', '"how" is too long.');
      const at = stamp();
      return write('plan debrief', at, (tx) => {
        const prev = needRow(tx, 'plans', id, 'bad-plan', 'Plan item');
        const plan = claimRow(prev, null, Object.assign({}, prev, { debrief: { usedPlan: d.usedPlan, how: d.how || '', at } }));
        tx.put('plans', plan);
        if (!tx.has('BattlePlanDebriefed', 'planId', id)) tx.event('BattlePlanDebriefed', { planId: id, usedPlan: d.usedPlan });
        return { plan, events: tx.events };
      });
    },
  };
  function mondayOf(dateStr) {
    const E = getEngine();
    if (E && typeof E.weekStart === 'function') {
      const s = E.weekStart(dateStr, 1);
      if (isDate(s)) return s;
    }
    const m = DATE_RE.exec(dateStr);
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  /* The review's answers are kept as a 'weekly-review' response; WeeklyReviewCompleted once per week. */
  async function weeklyReview(data) {
    if (!isObj(data) || jsonSize(data) > 100000) fail('bad-plan', 'A weekly review must be an object.');
    if (!absent(data, 'weekStart') && !isDate(data.weekStart)) fail('bad-plan', '"weekStart" is not a date.');
    const at = stamp();
    const p = clone(data);
    const weekStart = p.weekStart || mondayOf(localDate(at));
    p.weekStart = weekStart;
    return write('weekly review', at, (tx) => {
      const response = tx.put('responses', responseRow('weekly-review', p, at, 'workbook', false));
      if (!tx.has('WeeklyReviewCompleted', 'weekStart', weekStart)) tx.event('WeeklyReviewCompleted', { weekStart });
      return { response, events: tx.events };
    });
  }
  const todos = {
    async add(t) {
      const code = 'bad-plan';
      if (!isObj(t)) fail(code, 'A to-do must be an object.');
      onlyKeys(t, ['text', 'source', 'route', 'due'], code, 'To-do');
      if (!isName(t.text, 300)) fail(code, 'A to-do needs some text.');
      if (!absent(t, 'source') && !isText(t.source, 60)) fail(code, '"source" is too long.');
      if (!absent(t, 'route') && t.route !== null && !(typeof t.route === 'string' && t.route.startsWith('#/') && t.route.length <= 200)) fail(code, '"route" must start with #/.');
      if (!absent(t, 'due') && t.due !== null && !isDate(t.due)) fail(code, '"due" is not a date.');
      const at = stamp();
      return write('todo add', at, (tx) => tx.put('todos', { id: newId(), text: t.text.trim(), source: t.source || 'me', route: t.route || null, due: t.due || null, done: false, at }));
    },
    async done(id) {
      if (!isId(id)) fail('bad-plan', 'To-do not found.');
      const at = stamp();
      return write('todo done', at, (tx) => {
        const row = needRow(tx, 'todos', id, 'bad-plan', 'To-do');
        return tx.put('todos', claimRow(row, { done: true }, Object.assign({}, row, { done: true, doneAt: row.doneAt || at })));
      });
    },
    async remove(id) {
      if (!isId(id)) fail('bad-plan', 'To-do not found.');
      return write('todo remove', stamp(), (tx) => {
        needRow(tx, 'todos', id, 'bad-plan', 'To-do');
        tx.del('todos', id);
        return { removed: id };
      });
    },
  };

  /* ── motivation, predictions, quests ─────────────────────────────────────────────────────── */
  const motivation = {
    async add(m) {
      const code = 'bad-motivation';
      if (!isObj(m)) fail(code, 'A motivation entry must be an object.');
      onlyKeys(m, ['stage', 'score', 'plusOne', 'source'], code, 'Motivation');
      if (typeof m.stage !== 'string' || !known(getContent().stages, m.stage)) fail(code, 'Unknown stage.');
      if (!isScore(m.score)) fail(code, 'The score must be 0 to 10.');
      if (!absent(m, 'plusOne') && !isText(m.plusOne, 500)) fail(code, '"plusOne" is too long.');
      if (!absent(m, 'source') && !isText(m.source, 60)) fail(code, '"source" is too long.');
      const at = stamp();
      return write('motivation', at, (tx) => tx.put('motivation', { id: newId(), at, stage: m.stage, score: m.score, plusOne: m.plusOne || '', source: m.source || 'me' }));
    },
  };
  const predictions = {
    async add(p) {
      const code = 'bad-prediction';
      if (!isObj(p)) fail(code, 'A prediction must be an object.');
      onlyKeys(p, ['activity', 'predicted', 'notes'], code, 'Prediction');
      if (!isName(p.activity, 120)) fail(code, 'A prediction needs an activity.');
      if (!isScore(p.predicted)) fail(code, 'The prediction must be 0 to 10.');
      if (!absent(p, 'notes') && !isText(p.notes, 1000)) fail(code, '"notes" is too long.');
      const at = stamp();
      return write('prediction add', at, (tx) => tx.put('predictions', { id: newId(), activity: p.activity.trim(), predicted: p.predicted, actual: null, at, completedAt: null, notes: p.notes || '' }));
    },
    async complete(id, d) {
      const code = 'bad-prediction';
      if (!isId(id)) fail(code, 'Prediction not found.');
      if (!isObj(d)) fail(code, 'The result must be an object.');
      onlyKeys(d, ['actual', 'notes'], code, 'Prediction result');
      if (!isScore(d.actual)) fail(code, 'The result must be 0 to 10.');
      if (!absent(d, 'notes') && !isText(d.notes, 1000)) fail(code, '"notes" is too long.');
      const at = stamp();
      return write('prediction complete', at, (tx) => {
        const row = needRow(tx, 'predictions', id, code, 'Prediction');
        return tx.put('predictions', claimRow(row, null, Object.assign({}, row, { actual: d.actual, completedAt: row.completedAt || at, notes: absent(d, 'notes') ? row.notes : d.notes })));
      });
    },
  };
  /* RC15: a row a sample load wrote under a Content id (quests, tutorials, reveals) is not the person's: their own act
     starts a fresh, unmarked row in its place, so it is counted and eraseSample never takes it. */
  const ownRow = (tx, name, id) => { const r = tx.get(name, id); return r && r.sample === true ? null : r; };
  const quests = {
    /* a tick is never taken back; completedAt is set once every step is ticked */
    async tick(questId, stepId) {
      const code = 'bad-quest';
      const list = Array.isArray(getContent().quests) ? getContent().quests : [];
      const q = list.find((x) => x && x.id === questId);
      if (!q) fail(code, 'Unknown quest.');
      const steps = Array.isArray(q.steps) ? q.steps.map((x) => x.id) : [];
      if (!steps.includes(stepId)) fail(code, 'Unknown step.');
      const at = stamp();
      return write(`quest ${questId}`, at, (tx) => {
        const row = Object.assign({ id: questId, startedAt: at, ticks: {}, completedAt: null }, ownRow(tx, 'quests', questId) || {});
        row.ticks = Object.assign({}, row.ticks);
        if (!row.ticks[stepId]) row.ticks[stepId] = at;
        if (!row.completedAt && steps.every((sid) => row.ticks[sid])) row.completedAt = at;
        return tx.put('quests', row);
      });
    },
  };

  /* ── tutorials, reveals, tips ────────────────────────────────────────────────────────────── */
  const tutorialKnown = (id) => typeof id === 'string' && known(getContent().tutorials, id);
  const tutorial = {
    async done(id, opts) {
      if (!tutorialKnown(id)) fail('bad-tutorial', 'Unknown tutorial.');
      const o = opts === undefined ? {} : opts;
      if (!isObj(o) || (!absent(o, 'skipped') && !isBool(o.skipped))) fail('bad-tutorial', '"skipped" must be true or false.');
      const skipped = o.skipped === true;
      const at = stamp();
      return write(`tutorial ${id}`, at, (tx) => {
        const prev = ownRow(tx, 'tutorials', id);
        const row = tx.put('tutorials', Object.assign({ id, completedAt: null, skipped, replays: 0, stepsSeen: 0 }, prev || {}, {
          completedAt: (prev && prev.completedAt) || at, skipped: prev && prev.completedAt ? prev.skipped === true && skipped : skipped,
        }));
        if (!tx.has('TutorialCompleted', 'id', id)) tx.event('TutorialCompleted', { id, skipped });
        return { tutorial: row, events: tx.events };
      });
    },
    async replay(id) {
      if (!tutorialKnown(id)) fail('bad-tutorial', 'Unknown tutorial.');
      return write(`tutorial replay ${id}`, stamp(), (tx) => {
        const prev = ownRow(tx, 'tutorials', id);
        const row = Object.assign({ id, completedAt: null, skipped: false, replays: 0, stepsSeen: 0 }, prev || {});
        row.replays = (Number(row.replays) || 0) + 1;
        return tx.put('tutorials', row);
      });
    },
  };

  /* ── daily objectives and the quest line (V-41; R-O-6, PLAN-V3.md section 7, R-C-50) ─────────── */
  // Four events, in `events` (no new row): ObjectiveDone {id, date}, ObjectiveSwapped {from, to, date},
  // QuestLineStepDone {id}, FeatureUnlocked {feature, by: 'questline'}. Like useSkill these verbs never throw: a refusal
  // is {ok: false, code, message} and writes nothing. The Engine decides (today's three, the swap's replacement, the
  // current step and whether it can be claimed), read inside the one commit over the draft, so a double tap writes once.
  // Actions never re-checks a condition, never draws at random and gives no XP (the Engine's, from Content.xp).
  // Sample rows never count and a loaded sample is not a refusal (R-C-48). SOS, help, lessons, Settings, export and the
  // data are never a reward, so no claim can gate them.
  const NEVER_REWARD = ['sos', 'urgent', 'help', 'lessons', 'learn', 'settings', 'export', 'data', 'backup'];
  async function refusing(fallback, fn) {
    try { return await fn(); } catch (e) {
      const coded = e && typeof e.code === 'string' && e.code;
      return { ok: false, code: coded ? e.code : 'error', message: coded && typeof e.message === 'string' ? e.message : fallback };
    }
  }
  const engineView = (tx) => ({ get: tx.get, list: tx.list, count: (s) => tx.list(s).length });
  const contentList = (k) => (Array.isArray(getContent()[k]) ? getContent()[k].filter(isObj) : null);
  const ownEvent = (tx, type, test) => tx.list('events').some((e) => e && e.sample !== true && e.type === type && test(isObj(e.payload) ? e.payload : {}));
  function objectiveFirst(id) {
    const E = getEngine();
    const pool = contentList('objectives');
    if (!E || typeof E.dailyObjectives !== 'function' || !pool) fail('not-ready', 'Daily objectives are not in this version yet.');
    if (!isId(id) || !pool.some((o) => o.id === id)) fail('bad-objective', 'Unknown objective.');
    return pool;
  }
  function todaysDraw(tx) {
    const r = getEngine().dailyObjectives(engineView(tx), tx.at);
    return { date: isDate(r && r.date) ? r.date : localDate(tx.at), items: Array.isArray(r && r.items) ? r.items.filter(isObj) : [], swapped: !!(r && r.swapped) };
  }
  const doneToday = (tx, d, id) => ownEvent(tx, 'ObjectiveDone', (p) => p.id === id && p.date === d.date);
  const objective = {
    /* one ObjectiveDone per objective per day; done already (a tap or its own event) -> ok with no event */
    done(id) {
      return refusing('The objective could not be saved.', async () => {
        objectiveFirst(id);
        return write(`objective done ${id}`, stamp(), (tx) => {
          const d = todaysDraw(tx);
          const item = d.items.find((o) => o.id === id);
          if (!item) fail('not-today', 'That is not one of today\'s objectives.');
          if (item.done === true || doneToday(tx, d, id)) return { ok: true, event: null, already: true };
          return { ok: true, event: tx.event('ObjectiveDone', { id, date: d.date }) };
        });
      });
    },
    /* one swap a day: `to` is the Engine's swapTo for the item */
    swap(id) {
      return refusing('The swap could not be saved.', async () => {
        const pool = objectiveFirst(id);
        return write(`objective swap ${id}`, stamp(), (tx) => {
          const d = todaysDraw(tx);
          if (d.swapped || ownEvent(tx, 'ObjectiveSwapped', (p) => p.date === d.date)) fail('swap-used', 'Today\'s swap is already used.');
          const item = d.items.find((o) => o.id === id);
          if (!item) fail('not-today', 'That is not one of today\'s objectives.');
          if (item.done === true || doneToday(tx, d, id)) fail('bad-objective', 'A done objective stays.');
          const to = item.swapTo;
          if (item.swappable !== true || !isId(to) || !pool.some((o) => o.id === to) || d.items.some((o) => o.id === to) || doneToday(tx, d, to)) {
            fail('no-swap', 'There is no other objective to swap in today.');
          }
          return { ok: true, event: tx.event('ObjectiveSwapped', { from: id, to, date: d.date }) };
        });
      });
    },
  };
  function rewardOk(f) {
    const C = getContent();
    const feats = C.features;
    if (!isId(f) || !isObj(feats) || !own(feats, f) || NEVER_REWARD.includes(f)) return false;
    const always = isObj(C.reveal) && Array.isArray(C.reveal.always) ? C.reveal.always : [];
    if (always.includes(f) || (isObj(feats[f]) && ['sos', 'settings', 'learn'].includes(feats[f].tab))) return false;
    const E = getEngine();
    return !(E && typeof E.isProtectedFeature === 'function' && E.isProtectedFeature(f) !== false);
  }
  const questLine = {
    /* QuestLineStepDone and FeatureUnlocked in one commit, only while the Engine's current step is this one and claimable */
    claim(stepId) {
      return refusing('The step could not be saved.', async () => {
        const E = getEngine();
        const steps = contentList('questLine');
        if (!E || typeof E.questLine !== 'function' || !steps) fail('not-ready', 'The quest line is not in this version yet.');
        const step = isId(stepId) ? steps.find((s) => s.id === stepId) : null;
        if (!step) fail('bad-step', 'Unknown step.');
        const feature = step.reward;
        if (!rewardOk(feature)) fail('bad-reward', 'This step has no reward that can be opened.');
        return write(`quest line ${stepId}`, stamp(), (tx) => {
          if (ownEvent(tx, 'QuestLineStepDone', (p) => p.id === stepId)) return { ok: true, events: [] };
          const q = E.questLine(engineView(tx), tx.at);
          const st = q && Array.isArray(q.steps) ? q.steps.find((s) => isObj(s) && s.id === stepId) : null;
          if (st && st.state === 'done') return { ok: true, events: [] };
          const cur = q && isObj(q.current) ? q.current : null;
          if (!cur || cur.id !== stepId || cur.claimable !== true) fail('not-claimable', 'This step is not ready yet.');
          tx.event('QuestLineStepDone', { id: stepId });
          if (!ownEvent(tx, 'FeatureUnlocked', (p) => p.feature === feature)) tx.event('FeatureUnlocked', { feature, by: 'questline' });
          return { ok: true, events: tx.events.slice(), feature };
        });
      });
    },
  };
  async function reveal(featureId, opts) {
    const feats = getContent().features;
    if (typeof featureId !== 'string' || !(isObj(feats) ? own(feats, featureId) : isId(featureId))) fail('bad-feature', 'Unknown feature.');
    const o = opts === undefined ? {} : opts;
    if (!isObj(o)) fail('bad-feature', 'Options must be an object.');
    onlyKeys(o, ['seen', 'forced'], 'bad-feature', 'Options');
    for (const k of ['seen', 'forced']) if (!absent(o, k) && !isBool(o[k])) fail('bad-feature', `"${k}" must be true or false.`);
    const at = stamp();
    return write(`reveal ${featureId}`, at, (tx) => {
      const row = Object.assign({ id: featureId, revealedAt: at, seenAt: null, forced: o.forced === true }, ownRow(tx, 'reveals', featureId) || {});
      if (o.seen === true && !row.seenAt) row.seenAt = at;
      tx.put('reveals', row);
      if (!tx.has('FeatureRevealed', 'featureId', featureId)) tx.event('FeatureRevealed', { featureId });
      return { reveal: row, events: tx.events };
    });
  }
  async function markTipShown(id) {
    if (typeof id !== 'string' || !known(getContent().tips, id)) fail('bad-tip', 'Unknown tip.');
    const at = stamp();
    return write(`tip ${id}`, at, (tx) => {
      const tip = tx.put('tips', { id, shownAt: at });
      tx.put('settings', Object.assign(settingsRow(ownRow(tx, 'settings', 'app')), { lastTipDay: localDate(at) })); // RS-SAMPLE
      return tip;
    });
  }

  /* ── My Recovery Plan ────────────────────────────────────────────────────────────────────── */
  const recoveryPlan = {
    async save(sections, opts) {
      if (!isObj(sections) || jsonSize(sections) > 200000) fail('bad-plan', 'The plan must be an object of sections.');
      const o = opts === undefined ? {} : opts;
      if (!isObj(o) || (!absent(o, 'confirm') && !isBool(o.confirm))) fail('bad-plan', '"confirm" must be true or false.');
      const at = stamp();
      const s = clone(sections);
      return write('recovery plan', at, (tx) => {
        const prev = tx.get('recoveryPlan', 'plan') || {};
        const plan = tx.put('recoveryPlan', Object.assign({ graduatedAt: null }, prev, {
          key: 'plan', sections: s, confirmedAt: prev.confirmedAt || (o.confirm === true ? at : null), lastReviewAt: at,
          graduatedAt: prev.graduatedAt || (o.confirm === true ? at : null), // set once, with RecoveryPlanConfirmed; never cleared
        }));
        if (o.confirm === true && !tx.has('RecoveryPlanConfirmed')) tx.event('RecoveryPlanConfirmed', {});
        return { plan, events: tx.events };
      });
    },
  };
  async function scriptUsed(responseId) {
    if (!isId(responseId)) fail('bad-script', 'Script not found.');
    return write('script used', stamp(), (tx) => {
      needRow(tx, 'responses', responseId, 'bad-script', 'Script');
      tx.event('ScriptUsed', { responseId });
      return { events: tx.events };
    });
  }

  /* ── data: sample, erase, import ─────────────────────────────────────────────────────────── */
  function backupErrors(obj) {
    const errors = [];
    const map = storeMap();
    const current = Number(getContent().schemaVersion) || 1;
    if (!isObj(obj)) return ['not a backup object'];
    if (obj.app !== '1-addic') errors.push('app is not 1-addic');
    if (!isInt(obj.schemaVersion, 1, 1000)) errors.push('schemaVersion is missing');
    else if (obj.schemaVersion > current) errors.push('made by a newer version of the app');
    if (!isObj(obj.stores)) return errors.concat('stores is missing');
    let total = 0;
    for (const [name, rows] of Object.entries(obj.stores)) {
      if (!own(map, name)) { errors.push(`unknown store ${name}`); continue; }
      if (!Array.isArray(rows)) { errors.push(`${name} is not a list`); continue; }
      const kp = map[name];
      const keys = new Set();
      for (const r of rows) {
        total += 1;
        if (!isObj(r) || typeof r[kp] !== 'string' || !r[kp]) { errors.push(`${name}: a row has no ${kp}`); break; }
        if (keys.has(r[kp])) { errors.push(`${name}: ${r[kp]} appears twice`); break; }
        keys.add(r[kp]);
      }
    }
    if (total > 500000) errors.push('too many rows');
    return errors;
  }
  /* schemaVersion 1 is current; every store is present; a backup never installs a lock */
  function migrateLocal(obj) {
    const out = clone(obj);
    for (const name of Object.keys(storeMap())) if (!Array.isArray(out.stores[name])) out.stores[name] = [];
    out.stores.meta = out.stores.meta.filter((r) => r.key !== 'lock');
    return out;
  }
  function badBackup(errors) {
    const err = appError('bad-backup', 'This file is not a 1-addic backup this app can read.');
    err.errors = errors;
    return err;
  }
  async function importBackup(obj) {
    const E = getEngine();
    let errors;
    try {
      const r = E && typeof E.validateBackup === 'function' ? E.validateBackup(obj) : { ok: true, errors: [] };
      errors = r && r.ok === true ? backupErrors(obj) : (r && Array.isArray(r.errors) && r.errors.length ? r.errors : ['not valid']); // not ok is never ok
    } catch (e) { errors = ['not valid']; }
    if (errors.length) throw badBackup(errors);
    let next;
    try {
      next = migrateLocal(E && typeof E.migrateBackup === 'function' ? E.migrateBackup(clone(obj)) : obj);
    } catch (e) { throw badBackup(['could not be upgraded']); }
    const again = backupErrors(next);
    if (again.length) throw badBackup(again);
    const S = store();
    if (typeof S.replaceAll !== 'function') fail('no-store', 'The notebook is not open yet.');
    await S.replaceAll(next);
    const counts = {};
    for (const [name, rows] of Object.entries(next.stores)) counts[name] = rows.length;
    return { imported: true, counts };
  }
  async function eraseAll() {
    const S = store();
    if (typeof S.resetAll !== 'function') fail('no-store', 'The notebook is not open yet.');
    await S.resetAll();
    return { erased: true };
  }
  /* O6: sample rows come from Content.sample.generate(now) as {stores:{name: rows}} (or the map itself). Sample rows
     never overwrite the person's own rows: of the keyed stores, only profile 'me' and settings 'app' come from a
     sample, and only where the notebook has no own row (none, or one marked sample: true: RS-SAMPLE); meta and
     recoveryPlan rows never do; a row whose id already exists is skipped. Every row written carries `sample: true`, and
     the meta 'sample' row marks the load; eraseSample removes those rows only, eraseAll removes everything. */
  const SAMPLE_KEYED = Object.freeze({ profile: 'me', settings: 'app' });
  async function loadSample() {
    const C = getContent();
    if (!C.sample || typeof C.sample.generate !== 'function') fail('no-sample', 'Sample data is not in this version yet.');
    const at = stamp();
    let data;
    try { data = C.sample.generate(at); } catch (e) { data = null; }
    const stores = isObj(data) && isObj(data.stores) ? data.stores : data;
    const errors = backupErrors({ app: '1-addic', schemaVersion: 1, stores });
    if (errors.length) fail('no-sample', 'The sample data could not be read.');
    const map = storeMap();
    const s = clone(stores);
    return write('load sample', at, (tx) => {
      let count = 0;
      let skipped = 0;
      for (const [name, rows] of Object.entries(s)) {
        const kp = map[name];
        for (const r of rows) {
          const prev = tx.get(name, r[kp]);
          const skip = kp === 'key' ? !(own(SAMPLE_KEYED, name) && SAMPLE_KEYED[name] === r[kp]) || (prev != null && prev.sample !== true) : prev != null;
          if (skip) { skipped += 1; continue; } // RS-SAMPLE: an own row, or a keyed row a sample never writes
          tx.put(name, Object.assign(r, { sample: true }));
          count += 1;
        }
      }
      const meta = tx.put('meta', { key: 'sample', loadedAt: at });
      return { sample: meta, count, skipped };
    });
  }

  /* Removes only the rows a sample load wrote (marked `sample: true`) and the meta 'sample' row; the person's own
     rows stay exactly as they are. */
  async function eraseSample() {
    const map = storeMap();
    return write('erase sample', stamp(), (tx) => {
      let count = 0;
      for (const name of Object.keys(map)) {
        if (name === 'meta') continue; // RS-SAMPLE: the keyed sample rows go too (profile, settings); of meta, the 'sample' row below
        for (const r of tx.list(name) || []) {
          if (r && r.sample === true) { tx.del(name, r[map[name]]); count += 1; }
        }
      }
      if (tx.get('meta', 'sample') != null) tx.del('meta', 'sample');
      return { erased: count };
    });
  }

  return {
    onboard, settings: { patch: patchSettings }, recordEvent, useSkill,
    logCraving, logFeeling, checkin, logActivity, logSlip, sosSession,
    completeLesson, checkpoint, saveResponse,
    contacts, plans, weeklyReview, todos,
    motivation, predictions, quests,
    tutorial, objective, questLine, reveal, markTipShown,
    recoveryPlan, scriptUsed, loadSample, eraseSample, eraseAll, importBackup,
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Actions;
