/* 1-addic · CONTENT · the sample profile (O6; BUILD-PLAN 3.4; unit U-33).
   Content.sample.generate(nowIso) -> {stores:{name: rows}}: four weeks of an invented person's notebook, relative to
   nowIso, for "Load sample data". Actions.loadSample checks it with backupErrors, puts every row and adds the meta row
   {key:'sample', loadedAt}. Rules: every row and every event has sample: true (the Engine skips them, so sample data
   never awards or lowers anything); ids start with smp-; the same nowIso gives the same rows (a seeded generator,
   never Math.random); the contacts are invented and carry no phone numbers; nothing is dated after nowIso. */
const C_sm = (typeof Content !== 'undefined') ? Content : require('./content-core.js');

C_sm.sample = (function () {
  const DAYS = 28;
  const pad = (n) => String(n).padStart(2, '0');
  const dateOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  /* mulberry32: a small seeded generator, so the sample is the same every time for the same nowIso. */
  function seeded(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const TRIGGERS = ['Stress', 'Boredom', 'After work or college', 'Late at night', 'Loneliness', 'Friends I used with'];
  const EMOTIONS = ['anxious', 'bored', 'lonely', 'sad', 'angry'];
  const CRAVING_SKILLS = ['sober', 'ride-wave', 'distract', 'call', 'talk-back', 'delay'];
  const FEELING_SKILLS = ['breathe', 'self-kindness', 'beat', 'reach-out'];
  const ACTIVITIES = [
    { kind: 'exercise', name: 'Evening walk', minutes: 30 },
    { kind: 'mindfulness', name: 'Body scan', minutes: 10 },
    { kind: 'pleasant', name: 'Cooked dinner with music on', minutes: 45 },
    { kind: 'meeting', name: 'Support group', minutes: 60 },
    { kind: 'pleasant', name: 'Video call with my sister', minutes: 30 },
  ];

  function generate(nowIso) {
    const now = new Date(nowIso);
    if (isNaN(now.getTime())) throw new TypeError('sample: nowIso is not a date');
    const rnd = seeded(20261107);
    const pick = (list) => list[Math.floor(rnd() * list.length)];
    const between = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
    const counter = {};
    const id = (kind) => { counter[kind] = (counter[kind] || 0) + 1; return `smp-${kind}-${counter[kind]}`; };
    /* A moment `back` days before today at hour:minute, local time; never later than now. */
    const moment = (back, hour, minute) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - back, hour, minute || 0, 0, 0);
      return d.getTime() > now.getTime() ? new Date(now.getTime() - 60000) : d;
    };
    const stamp = (d) => ({ at: d.toISOString(), date: dateOf(d), hour: d.getHours() });

    const events = [];
    const event = (type, d, payload) => {
      events.push({ id: id('ev'), type, at: d.toISOString(), payload: Object.assign({}, payload), sample: true });
    };
    const logs = [];
    const log = (type, d, extra) => {
      const row = Object.assign({ id: id('log'), type }, stamp(d),
        { triggerIds: [], feelings: [], skills: [] }, extra, { drill: false, sample: true });
      logs.push(row);
      return row;
    };

    const start = moment(DAYS, 9, 0);
    const startDate = dateOf(start);
    const profile = {
      key: 'me', name: 'Sample', companion: 'Kite', substances: ['Alcohol'], term: 'sober', startDate, notSure: false,
      stage: 'action', region: 'in', checkin: { morning: '08:30', evening: '21:30' }, reviewDay: 0, pace: 'steady',
      customPerWeek: null, roadmapStart: startDate, onboardedAt: start.toISOString(),
      medical: { heavyDaily: false, sedatives: false, opioids: false }, locale: 'en', sample: true,
    };
    event('OnboardingCompleted', start, {});

    /* Cravings: 14 over four weeks, mostly in the evening, a little lower on average as the weeks go by. */
    const cravingDays = [27, 26, 24, 22, 21, 19, 17, 15, 13, 11, 9, 6, 4, 2];
    cravingDays.forEach((back, i) => {
      const d = moment(back, between(18, 22), between(0, 59));
      const intensity = Math.max(2, Math.min(9, 8 - Math.floor(i / 3) + between(-1, 1)));
      const skills = [{ skillId: pick(CRAVING_SKILLS), helpful: rnd() > 0.25 }];
      const row = log('craving', d, { intensity, emotion: pick(EMOTIONS), triggerIds: [pick(TRIGGERS), pick(TRIGGERS)].filter((t, j, a) => a.indexOf(t) === j), skills, used: false, notes: '' });
      event('LogCreated', d, { logId: row.id, type: 'craving' });
      for (const s of skills) event('SkillUsed', d, { skillId: s.skillId, helpful: s.helpful, logId: row.id });
    });

    /* Feelings: 8. */
    [25, 20, 18, 14, 10, 7, 5, 1].forEach((back) => {
      const d = moment(back, between(12, 20), between(0, 59));
      const skills = [{ skillId: pick(FEELING_SKILLS), helpful: rnd() > 0.3 }];
      const row = log('feeling', d, { intensity: between(3, 7), emotion: pick(EMOTIONS), skills, notes: '' });
      event('LogCreated', d, { logId: row.id, type: 'feeling' });
      for (const s of skills) event('SkillUsed', d, { skillId: s.skillId, helpful: s.helpful, logId: row.id });
    });

    /* Activities: 12, and the evening check-in counts the pleasant ones of that day. */
    const pleasantOn = {};
    [27, 25, 23, 20, 18, 16, 13, 11, 8, 6, 3, 1].forEach((back, i) => {
      const a = ACTIVITIES[i % ACTIVITIES.length];
      const d = moment(back, between(16, 19), between(0, 59));
      const row = log('activity', d, { activity: { kind: a.kind, minutes: a.minutes, name: a.name, enjoyment: between(5, 9) } });
      if (a.kind === 'pleasant' || a.kind === 'exercise') pleasantOn[back] = (pleasantOn[back] || 0) + 1;
      event('LogCreated', d, { logId: row.id, type: 'activity' });
      event('ActivityDone', d, { kind: a.kind, minutes: a.minutes, logId: row.id });
    });

    /* Check-ins: one each evening for the four weeks before today (28). */
    for (let back = DAYS; back >= 1; back -= 1) {
      const d = moment(back, 21, between(20, 50));
      const week = Math.floor((DAYS - back) / 7);
      const checkin = {
        kind: 'evening', mood: Math.min(9, between(3, 6) + week), anxiety: Math.max(1, between(4, 7) - week),
        peakCraving: Math.max(0, between(4, 8) - week), pleasantCount: pleasantOn[back] || 0, used: false,
        sleep: between(5, 8), meeting: back % 7 === 3, intention: 'One thing at a time.',
      };
      const row = log('checkin', d, { checkin });
      event('CheckinCompleted', d, { logId: row.id, kind: 'evening' });
    }

    /* Lessons of M0-M3, done in the first two weeks. */
    const lessons = [];
    for (const m of (C_sm.modules || []).filter((x) => ['m0', 'm1', 'm2', 'm3'].includes(x.id))) {
      for (const l of m.lessons || []) lessons.push(l.id);
    }
    lessons.forEach((lessonId, i) => event('LessonCompleted', moment(DAYS - 1 - Math.floor(i / 2), 20, 5 + (i % 2) * 20), { lessonId }));

    /* Responses: reasons, motivation, triggers, red flags and distractions. */
    const responses = [];
    const respond = (exerciseId, back, payload, type) => {
      const d = moment(back, 20, 40);
      const row = { id: id('resp'), exerciseId, schemaVersion: 1, payload, at: d.toISOString(), mode: 'workbook', draft: false, sample: true };
      responses.push(row);
      event(type || 'ArtifactSaved', d, { exerciseId, responseId: row.id });
    };
    respond('quick-reasons', 27, { reasons: 'Mornings with a clear head', quick: ['Being there for my daughter', 'Sleeping through the night', 'Saving for a trip with my sister'] });
    respond('motivation', 26, { stage: 'action', score: 6, plusOne: 'A friend to walk with in the evenings.' });
    respond('triggers', 12, { internal: ['Stress', 'Boredom', 'Loneliness'], people: ['Friends I used with'], places: [], situations: ['After work or college', 'Late at night'], things: [], frequent: ['Stress', 'Late at night'], anger: [] });
    respond('red-flags', 10, { flags: ['Just one.', 'I deserve it after all this.', 'Nobody has to know.'], loudest: 'I deserve it after all this.', when: 'At the end of a long week, when the house is quiet.' });
    respond('distractions', 9, { distractions: ['Walk fast for ten minutes', 'Call someone, about anything'], own: ['Water the plants on the balcony'] }, 'ExerciseDone');

    const motivation = [
      { id: id('mot'), at: moment(26, 20, 45).toISOString(), stage: 'action', score: 6, plusOne: 'A friend to walk with in the evenings.', source: 'exercise', sample: true },
      { id: id('mot'), at: moment(12, 20, 45).toISOString(), stage: 'action', score: 7, plusOne: 'Seeing my sister more often.', source: 'checkin', sample: true },
    ];

    /* Contacts: invented, with no phone numbers. */
    const contacts = [
      { id: id('con'), name: 'Asha (sample)', role: 'safetyNet', strategy: null, phone: '', note: 'Sister. Calls back the same day.', active: true, sample: true },
      { id: id('con'), name: 'Vikram (sample)', role: 'safetyNet', strategy: null, phone: '', note: 'Friend from the walking group.', active: true, sample: true },
      { id: id('con'), name: 'Group leader (sample)', role: 'safetyNet', strategy: null, phone: '', note: 'Thursday support group.', active: true, sample: true },
      { id: id('con'), name: 'Old drinking friend (sample)', role: 'risky', strategy: 'limit', phone: '', note: 'Meet only for lunch.', active: true, sample: true },
    ];

    /* Plans: three, the first a Battle Plan for a risky evening, all on or after today. */
    const plan = (ahead, start, end, extra) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + ahead);
      return Object.assign({ id: id('plan'), date: dateOf(d), start, end, status: 'planned', sample: true }, extra);
    };
    const plans = [
      plan(3, '19:00', '22:00', { title: 'Office farewell dinner', kind: 'risky', risky: true,
        battlePlan: { situation: 'Office farewell dinner', plan: 'Order a lime soda first and sit with Vikram.', backups: ['Step outside and call Asha.', 'Leave by ten.'], buddyId: contacts[1].id, exit: 'Leave after the speeches.' } }),
      plan(1, '18:30', '19:15', { title: 'Evening walk', kind: 'want', risky: false, activity: 'A walk at dawn or dusk', reward: 'A favourite film after.' }),
      plan(2, '10:00', '11:00', { title: 'Support group', kind: 'recovery', risky: false }),
    ];
    event('BattlePlanCreated', moment(1, 20, 0), { planId: plans[0].id });

    const todos = [
      { id: id('todo'), text: 'Clear the space at home', source: 'lesson', route: '#/learn/m4', due: null, done: false, at: moment(5, 20, 0).toISOString(), sample: true },
      { id: id('todo'), text: 'Plan tomorrow in the planner', source: 'lesson', due: null, done: true, at: moment(8, 20, 0).toISOString(), sample: true },
    ];
    const predictions = [
      { id: id('pred'), activity: 'Evening walk', predicted: 30, actual: 70, at: moment(6, 17, 0).toISOString(), completedAt: moment(6, 19, 0).toISOString(), notes: 'Better than I thought.', sample: true },
    ];

    events.sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
    return { stores: { profile: [profile], events, logs, responses, contacts, plans, todos, motivation, predictions } };
  }

  return { name: 'Sample', generate };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = C_sm;
