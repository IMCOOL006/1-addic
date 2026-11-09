/* 1-addic · ui-learn.js · the lesson player, the checkpoint, the roadmap and the glossary
   (BUILD-PLAN 3.6, 3.7; lane learn, units U-13 and U-14).
   Contract: docs/offline/build-2026-11-07/tracks/CORE/contracts/learn.md ("LearnUI").
   The logic (lesson steps, check results, module progress, the week plan, the welcome-back rule, the glossary filter,
   the focus data, the map data) is pure and loads in Node through the module.exports guard at the end; DOM code runs
   only inside functions called from a page. Content, Engine, Store, Actions and UI are read only when they are defined
   (typeof X !== 'undefined'), never through globalThis. This file writes only through Actions (completeLesson,
   checkpoint, todos.add, onboard); it writes no events itself, no storage and makes no network request. It writes no
   lesson text: lessons come from Content.modules. Checks have no fail state, and the plan has no state for a week that
   has gone by unfinished other than "Still open". Text is always inserted as text. */
const LearnUI = (function () {
  'use strict';

  // The eleven stops in their suggested order. Names stand in for modules that are not in this version yet.
  const STOPS = [
    ['m0', 'Start Here'], ['m1', 'Understand Addiction'], ['m2', 'Your Brain Can Heal'], ['m3', 'Find Your Why'],
    ['m4', 'Set Yourself Up'], ['m5', 'Become a Self-Expert'], ['m6', 'Outsmart the Addicted Brain'], ['m7', 'Be Present'],
    ['m8', 'Rediscover Joy'], ['m9', 'Handle Hard Feelings'], ['m10', 'Your Recovery Plan'],
  ].map(([id, name]) => ({ id, name }));
  const PACE_DEFAULTS = { gentle: 0.5, steady: 1, focused: 2, free: 0 };
  const WELCOME_GAP_DAYS = 14;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const TEXT = {
    map: 'Map', plan: 'Plan', glossary: 'Glossary', subnav: 'Learn',
    mapTitle: 'Your journey',
    mapIntro: 'Eleven stops. Start anywhere: the order is a suggestion, and nothing is locked.',
    stopList: 'The eleven stops',
    here: 'You are here', coming: 'Coming in a future update.', complete: 'Done',
    lessons: (d, t) => `${d} of ${t} lessons done`,
    skills: (n, t) => `Skills practised: ${n} of ${t}`,
    opens: (list) => `Opens: ${list}`,
    stepLabel: (n) => `Step ${n}`,
    planTitle: 'Your plan',
    planIntro: 'A plan to come back to, not a test. Weeks move with you.',
    freeIntro: 'Free pace: no dates and no weekly targets. Here is the suggested order.',
    weekOf: (d) => `Week of ${d}`, weeksOf: (a, b) => `${a} to ${b}`,
    state: { done: 'Done', current: 'This week', open: 'Still open', upcoming: 'Coming up' },
    paceTitle: 'Pace', paceSave: 'Save pace', paceSaved: 'Pace saved.',
    customLabel: 'Stops a week (for Custom)',
    customHint: 'From 0.5 to 7. For example, 1 means one stop a week.',
    setupFirst: 'Your pace can be saved once setup is done.', setupLink: 'Go to setup',
    welcomeTitle: 'Welcome back',
    welcomeText: 'It has been a while, and that is fine. Pick up where you left off, or start the plan again from this week.',
    replan: 'Re-plan from this week', replanned: 'Your plan now starts this week.', pickUp: 'Pick up where you left off',
    glossaryTitle: 'Glossary', search: 'Search the glossary',
    count: (n) => (n === 1 ? '1 term' : `${n} terms`), noMatch: 'No term matches that search.',
    focusTitle: 'This week\'s focus',
    focusLeft: (n, m) => `${n} ${n === 1 ? 'lesson' : 'lessons'} to go${m ? `, about ${m} minutes` : ''}.`,
    focusGo: 'Continue learning', focusMap: 'See the roadmap',
    focusAllDone: 'You have done every stop in this version. New stops arrive with updates.',
    practise: (name) => `Practise this week: ${name}`,
    stepOf: (i, n) => `Step ${i} of ${n}`, progress: 'Lesson progress',
    next: 'Next', back: 'Back', listen: 'Listen', listenTo: (t) => `Listen: ${t}`,
    noVoice: 'Read-aloud is not available on this device.',
    moment: 'A moment', check: 'Quick check',
    pick: 'Pick the one that fits best. Any choice is fine, and each one shows why.',
    helpfulYes: 'That is the helpful reading.', helpfulIs: (t) => `The helpful reading: ${t}`,
    tryIt: 'Try it', tryExercise: 'Open the exercise', tryOpen: (t) => `Open: ${t}`, trySkip: 'Skip for now',
    skipNote: 'This one can be hard to look at. You can skip it and come back any time.',
    wrap: 'Wrap up', built: 'What you built', lives: 'Where it lives', action: 'One small step',
    addTodo: 'Add to my to-dos', todoAdded: 'Added to your to-dos.',
    why: 'Why this works', noRefs: 'The sources for this lesson are not in this version yet.',
    needsNet: '(needs internet)', doi: (d) => `DOI ${d}`, openSource: 'Open the source',
    finish: 'Finish lesson', finished: 'Lesson done.', xp: ' +10 XP',
    already: 'You have done this lesson. You can go through it again any time.',
    toCheckpoint: 'Go to the checkpoint', nextLesson: 'Next lesson', backToStop: 'Back to the stop',
    lastNote: 'Next comes a short checkpoint for this stop.',
    lessonList: 'Lessons', minutes: (m) => `${m} min`, doneMark: 'Done',
    checkpoint: 'Checkpoint', checkpointAgain: 'Checkpoint done. Open it again',
    cpTitle: (n) => `Checkpoint: ${n}`,
    cpIntro: 'Two quick questions to look back on this stop. There is no pass mark.',
    cpNone: 'There are no questions for this stop yet. You can still finish the checkpoint.',
    cpFinish: 'Finish checkpoint', cpDone: 'Checkpoint saved.',
    cantSave: 'Saving is not available in this version yet.',
    missingTitle: 'Not available yet',
    missingLesson: 'This lesson is not in this version yet.',
    comingStop: 'This stop is coming in a future update. Every stop that is here can be started any time.',
    toMap: 'Back to the map',
  };

  /* ── small helpers ─────────────────────────────────────────────────────────────────────────── */
  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  const arr = (x) => (Array.isArray(x) ? x : []);
  const str = (v) => (typeof v === 'string' ? v.trim() : (typeof v === 'number' && Number.isFinite(v) ? String(v) : ''));
  const ns = (name) => {
    try {
      if (name === 'Content') return typeof Content !== 'undefined' ? Content : null;
      if (name === 'Engine') return typeof Engine !== 'undefined' ? Engine : null;
      if (name === 'Actions') return typeof Actions !== 'undefined' ? Actions : null;
      if (name === 'Store') return typeof Store !== 'undefined' ? Store : null;
      if (name === 'UI') return typeof UI !== 'undefined' ? UI : null;
    } catch (e) { /* a namespace that throws counts as absent */ }
    return null;
  };
  const contentOf = (c) => (c && typeof c === 'object' ? c : (ns('Content') || {}));
  const engineOf = (e) => (e === undefined ? ns('Engine') : e);
  const pl = (e) => (e && isObj(e.payload) ? e.payload : {});
  function eventsOf(src) {
    if (Array.isArray(src)) return src;
    if (src && typeof src.list === 'function') { try { return arr(src.list('events')); } catch (e) { return []; } }
    return [];
  }
  function profileOf(view) {
    if (view && typeof view.get === 'function') { try { return view.get('profile', 'me') || {}; } catch (e) { return {}; } }
    return {};
  }
  const pad = (n) => String(n).padStart(2, '0');
  const localDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
  function parseDate(s) {
    const m = DATE_RE.exec(typeof s === 'string' ? s : '');
    if (!m) return null;
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return localDate(d) === s ? d : null;
  }
  const dayOf = (now) => {
    const d = now instanceof Date ? now : new Date(now == null ? Date.now() : now);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const daysBetween = (a, b) => Math.round((dayOf(b) - dayOf(a)) / 864e5);
  const fmtDay = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  const enc = (s) => encodeURIComponent(String(s));

  /* ── content lookups ───────────────────────────────────────────────────────────────────────── */
  const modulesOf = (C) => arr(contentOf(C).modules).filter((m) => isObj(m) && typeof m.id === 'string' && m.id);
  const moduleById = (id, C) => modulesOf(C).find((m) => m.id === id) || null;
  function findLesson(id, C) {
    for (const m of modulesOf(C)) {
      const ls = arr(m.lessons);
      const i = ls.findIndex((l) => l && l.id === id);
      if (i >= 0) return { lesson: ls[i], module: m, index: i, last: i === ls.length - 1, next: ls[i + 1] || null };
    }
    return null;
  }
  function exerciseById(id, C) {
    const ex = contentOf(C).exercises;
    if (Array.isArray(ex)) return ex.find((x) => x && x.id === id) || null;
    if (isObj(ex) && Object.prototype.hasOwnProperty.call(ex, id)) return ex[id];
    return null;
  }
  function stopIds(C) {
    const ids = STOPS.map((s) => s.id);
    for (const m of modulesOf(C)) if (!ids.includes(m.id)) ids.push(m.id);
    return ids;
  }
  function skillsFor(module, C) {
    const all = arr(contentOf(C).skills).filter((s) => s && typeof s.id === 'string');
    if (Array.isArray(module && module.skills)) return module.skills.map((id) => all.find((s) => s.id === id)).filter(Boolean);
    if (typeof (module && module.book) !== 'number') return [];
    return all.filter((s) => s.book === module.book);
  }
  function unlocksOf(module, C) {
    const c = contentOf(C);
    const ids = [...arr(module && module.unlocks), ...arr(isObj(c.reveal) ? c.reveal[module.id] : null)];
    const feats = isObj(c.features) ? c.features : {};
    const out = [];
    for (const id of ids) {
      const name = isObj(feats[id]) ? str(feats[id].name) : '';
      if (name && !out.includes(name)) out.push(name);
    }
    return out;
  }

  /* ── progress from the event log (nothing here ever goes down: events are append-only) ─────── */
  function lessonsDone(events, engine) {
    const E = engineOf(engine);
    if (E && typeof E.lessonsDone === 'function') {
      try { const s = E.lessonsDone(events); if (s instanceof Set) return s; } catch (e) { /* use the local reader */ }
    }
    const out = new Set();
    for (const e of eventsOf(events)) {
      const id = e && e.type === 'LessonCompleted' ? pl(e).lessonId : null;
      if (typeof id === 'string' && id) out.add(id);
    }
    return out;
  }
  const hasEvent = (events, type, key, val) => eventsOf(events).some((e) => e && e.type === type && pl(e)[key] === val);
  function modulesDone(events, C, engine) {
    const E = engineOf(engine);
    if (E && typeof E.modulesDone === 'function') {
      try { const s = E.modulesDone(events); if (s instanceof Set) return s; } catch (e) { /* use the local reader */ }
    }
    const lessons = lessonsDone(events, null);
    const out = new Set();
    for (const m of modulesOf(C)) {
      const ls = arr(m.lessons);
      if (ls.length && ls.every((l) => l && lessons.has(l.id))) out.add(m.id);
    }
    for (const e of eventsOf(events)) {
      const id = e && e.type === 'ModuleCompleted' ? pl(e).moduleId : null;
      if (typeof id === 'string' && id) out.add(id);
    }
    return out;
  }
  function moduleProgress(module, events, engine) {
    const ls = arr(module && module.lessons).filter((l) => l && l.id);
    const done = lessonsDone(events, engine);
    const n = ls.filter((l) => done.has(l.id)).length;
    const id = module && module.id;
    return {
      done: n, total: ls.length,
      complete: (ls.length > 0 && n === ls.length) || hasEvent(events, 'ModuleCompleted', 'moduleId', id),
      checkpointDone: hasEvent(events, 'CheckpointCompleted', 'moduleId', id),
    };
  }
  function skillUses(events) {
    const out = {};
    for (const e of eventsOf(events)) {
      const id = e && e.type === 'SkillUsed' ? pl(e).skillId : null;
      if (typeof id === 'string' && id) out[id] = (out[id] || 0) + 1;
    }
    return out;
  }

  /* ── the lesson player's logic ─────────────────────────────────────────────────────────────── */
  function tryItOf(lesson) {
    const t = lesson && lesson.tryIt;
    const lid = lesson && lesson.id;
    if (isObj(t) && typeof t.exercise === 'string' && t.exercise) {
      return { kind: 'exercise', exercise: t.exercise, href: `#/exercise/${enc(t.exercise)}?mode=tutorial&from=${enc(lid)}` };
    }
    if (isObj(t) && typeof t.route === 'string' && /^#\//.test(t.route)) return { kind: 'route', href: t.route, label: str(t.label) || TEXT.tryIt };
    return { kind: 'none' };
  }
  function lessonSteps(lesson) {
    const L = isObj(lesson) ? lesson : {};
    const out = [];
    if (isObj(L.moment) && str(L.moment.text)) out.push({ kind: 'moment', i: 0 });
    arr(L.cards).forEach((c, i) => { if (c) out.push({ kind: 'card', i }); });
    arr(L.checks).forEach((c, i) => { if (c) out.push({ kind: 'check', i }); });
    if (tryItOf(L).kind !== 'none') out.push({ kind: 'tryit', i: 0 });
    out.push({ kind: 'wrap', i: 0 });
    return out;
  }
  // Any choice is fine: it returns that option's explanation and whether it is the helpful reading. No score, no fail.
  function checkResult(check, optionIndex) {
    const opts = arr(check && check.options);
    const o = Number.isInteger(optionIndex) ? opts[optionIndex] : null;
    return { why: o ? str(o.why) : '', ok: !!(o && o.ok), helpful: opts.findIndex((x) => x && x.ok) };
  }
  const validQuestion = (q) => isObj(q) && !!str(q.q) && arr(q.options).length >= 2;
  // Two questions: the 'checkpoint' exercise's own for this module when Content.exercises has them, else the
  // module's first two checks.
  function checkpointQuestions(module, C) {
    const ex = exerciseById('checkpoint', C);
    const mine = ex && isObj(ex.modules) && Array.isArray(ex.modules[module && module.id]) ? ex.modules[module.id].filter(validQuestion) : [];
    if (mine.length) return mine.slice(0, 2);
    const out = [];
    for (const l of arr(module && module.lessons)) for (const c of arr(l && l.checks)) if (validQuestion(c) && out.length < 2) out.push(c);
    return out;
  }
  const checkpointAnswers = (questions, picks) => arr(questions).map((q, i) => ({
    q: str(q && q.q), optionIndex: Number.isInteger(arr(picks)[i]) ? picks[i] : null,
  }));

  /* ── the roadmap's logic ───────────────────────────────────────────────────────────────────── */
  function paceOf(profile, C) {
    const p = isObj(profile) ? profile : {};
    const id = typeof p.pace === 'string' && p.pace ? p.pace : 'steady';
    const row = arr(contentOf(C).paces).find((x) => x && x.id === id) || null;
    if (id === 'custom') {
      const n = Number(p.customPerWeek);
      return { id, perWeek: Number.isFinite(n) && n > 0 ? Math.min(7, n) : 1 };
    }
    let per = row && typeof row.perWeek === 'number' ? row.perWeek : PACE_DEFAULTS[id];
    if (!(typeof per === 'number' && per >= 0)) return { id: 'steady', perWeek: 1 };
    return { id, perWeek: per };
  }
  // The week plan. A slot that has gone by without its stops done is 'open' ("Still open"); there is no other state
  // for it. Done comes from the event log, so a done stop stays done.
  function planWeeks(profile, modulesDoneSet, now, content) {
    const C = contentOf(content);
    const done = modulesDoneSet instanceof Set ? modulesDoneSet : new Set(arr(modulesDoneSet));
    const order = stopIds(C);
    const pace = paceOf(profile, C);
    const next = order.find((id) => !done.has(id)) || null;
    if (pace.perWeek === 0) return { free: true, pace: pace.id, order, weeks: [], current: null, next };
    const today = dayOf(now);
    const start = parseDate(isObj(profile) ? profile.roadmapStart : null) || today;
    const per = pace.perWeek >= 1 ? Math.max(1, Math.round(pace.perWeek)) : 1;
    const span = pace.perWeek >= 1 ? 1 : Math.max(1, Math.round(1 / pace.perWeek));
    const weeks = [];
    let current = null;
    for (let k = 0, n = 0; k < order.length; k += per, n += 1) {
      const s = addDays(start, n * span * 7);
      const e = addDays(start, (n + 1) * span * 7 - 1);
      const moduleIds = order.slice(k, k + per);
      const inside = today >= s && today <= e;
      if (inside) current = n;
      const state = moduleIds.every((id) => done.has(id)) ? 'done' : inside ? 'current' : today < s ? 'upcoming' : 'open';
      weeks.push({ n: n + 1, start: localDate(s), end: localDate(e), span, moduleIds, state });
    }
    return { free: false, pace: pace.id, order, weeks, current, next };
  }
  // Engine.roadmap when it exists (its dates and order), with the states always computed here.
  function planFor(profile, done, now, C, engine) {
    const E = engineOf(engine);
    const local = planWeeks(profile, done, now, C);
    if (local.free || !E || typeof E.roadmap !== 'function') return local;
    try {
      const r = E.roadmap(profile, done, now);
      const rows = r && Array.isArray(r.weeks) ? r.weeks.filter((w) => w && parseDate(w.start) && Array.isArray(w.moduleIds)) : [];
      if (!rows.length) return local;
      const today = dayOf(now);
      let current = null;
      const weeks = rows.map((w, n) => {
        const s = parseDate(w.start);
        const e = addDays(s, 6);
        const inside = today >= s && today <= e;
        if (inside) current = n;
        const state = w.moduleIds.every((id) => done.has(id)) ? 'done' : inside ? 'current' : today < s ? 'upcoming' : 'open';
        return { n: n + 1, start: w.start, end: localDate(e), span: 1, moduleIds: w.moduleIds.slice(), state };
      });
      return Object.assign({}, local, { weeks, current });
    } catch (e) { return local; }
  }
  // "Welcome back" when the last finished lesson is more than 14 days old and the plan was not restarted since.
  function needsWelcomeBack(profile, events, now) {
    if (paceOf(profile).perWeek === 0) return false;
    let last = null;
    for (const e of eventsOf(events)) {
      if (!e || e.type !== 'LessonCompleted') continue;
      const t = Date.parse(e.at);
      if (Number.isFinite(t) && (last === null || t > last)) last = t;
    }
    if (last === null) return false;
    const today = dayOf(now);
    if (daysBetween(new Date(last), today) <= WELCOME_GAP_DAYS) return false;
    const rs = parseDate(isObj(profile) ? profile.roadmapStart : null);
    return !(rs && daysBetween(rs, today) <= WELCOME_GAP_DAYS);
  }
  function glossaryFilter(list, q) {
    const k = str(q).toLowerCase();
    const rows = arr(list).filter((r) => r && str(r.term));
    const hit = k ? rows.filter((r) => r.term.toLowerCase().includes(k) || str(r.def).toLowerCase().includes(k)) : rows.slice();
    return hit.sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }));
  }
  // The weekly focus: the first stop of this week's slot with lessons to go, else the first loaded stop with lessons to go.
  function focusData(view, now, content, engine) {
    const C = contentOf(content);
    const events = eventsOf(view);
    const lDone = lessonsDone(events, engine);
    const plan = planFor(profileOf(view), modulesDone(events, C, engine), now, C, engine);
    const loaded = modulesOf(C);
    const left = (m) => arr(m.lessons).filter((l) => l && l.id && !lDone.has(l.id));
    const slot = !plan.free && plan.current !== null ? plan.weeks[plan.current].moduleIds : [];
    const m = slot.map((id) => loaded.find((x) => x.id === id)).find((x) => x && left(x).length) ||
      loaded.find((x) => left(x).length) || null;
    if (!m) return null;
    const ls = left(m);
    const skill = skillsFor(m, C)[0];
    return {
      moduleId: m.id, name: str(m.name), lessonsLeft: ls.length,
      minutes: ls.reduce((a, l) => a + (Number(l.minutes) > 0 ? Number(l.minutes) : 0), 0),
      practiceGoal: str(m.practiceGoal) || (skill ? str(skill.name) : '') || null,
      nextLessonId: ls[0].id,
    };
  }
  function mapData(view, now, content, engine) {
    const C = contentOf(content);
    const events = eventsOf(view);
    const focus = focusData(view, now, C, engine);
    const uses = skillUses(events);
    return stopIds(C).map((id, n) => {
      const m = moduleById(id, C);
      const base = STOPS.find((s) => s.id === id);
      if (!m) {
        return { id, n, name: base ? base.name : id, harbor: '', step: null, loaded: false, done: 0, total: 0,
          complete: false, checkpointDone: false, skills: [], unlocks: [], current: false };
      }
      const p = moduleProgress(m, events, engine);
      return Object.assign({ id, n, name: str(m.name) || (base ? base.name : id), harbor: str(m.harbor),
        step: typeof m.step === 'number' ? m.step : null, loaded: true }, p, {
        skills: skillsFor(m, C).map((s) => ({ id: s.id, name: str(s.name), uses: uses[s.id] || 0 })),
        unlocks: unlocksOf(m, C), current: !!focus && focus.moduleId === id,
      });
    });
  }

  /* ── DOM helpers (only called from pages) ──────────────────────────────────────────────────── */
  function h(tag, attrs, ...children) {
    const U = ns('UI');
    if (U && typeof U.h === 'function') return U.h(tag, attrs, ...children);
    const el = document.createElement(tag);
    for (const k of Object.keys(attrs || {})) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.setAttribute('class', Array.isArray(v) ? v.filter(Boolean).join(' ') : String(v));
      else if (k === 'text') el.textContent = String(v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (/^on[A-Z]/.test(k) && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'value' || k === 'checked') el[k] = v;
      else if (k !== 'html' && k !== 'innerHTML') el.setAttribute(k, v === true ? '' : String(v));
    }
    const add = (c) => { if (c == null || c === false || c === true) return; if (Array.isArray(c)) c.forEach(add); else el.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c))); };
    children.forEach(add);
    return el;
  }
  const SVG_NS = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs, ...children) {
    const U = ns('UI');
    if (U && typeof U.svg === 'function') return U.svg(tag, attrs, ...children);
    if (typeof document === 'undefined' || typeof document.createElementNS !== 'function') return null;
    const el = document.createElementNS(SVG_NS, tag);
    for (const k of Object.keys(attrs || {})) if (attrs[k] != null) el.setAttribute(k, String(attrs[k]));
    children.forEach((c) => { if (c) el.appendChild(c); });
    return el;
  }
  const btn = (text, onClick, extra) => h('button', Object.assign({ type: 'button', class: 'btn', text, onClick }, extra || {}));
  const toast = (msg, tone) => { const U = ns('UI'); if (U && typeof U.toast === 'function') U.toast(msg, tone); };
  const go = (r, replace) => {
    const U = ns('UI');
    if (U && typeof U.go === 'function') U.go(r, replace ? { replace: true } : undefined);
    else if (typeof location !== 'undefined') location.hash = r;
  };
  const setPressed = (b, on) => { b.setAttribute('aria-pressed', on ? 'true' : 'false'); if (b.classList) b.classList.toggle('on', !!on); };
  function ctxOf(ctxIn) {
    const c = ctxIn || {};
    const S = ns('Store');
    const view = c.view || (S && S.view) || null;
    return {
      view, A: c.A || ns('Actions'), E: c.E !== undefined ? c.E : ns('Engine'), C: ns('Content') || {},
      profile: isObj(c.profile) && Object.keys(c.profile).length ? c.profile : profileOf(view),
      calm: !!c.calm, now: c.now || new Date(), route: c.route || { parts: [], query: {} },
    };
  }
  function listenBtn(label, text) {
    const U = ns('UI');
    if (!U || typeof U.speak !== 'function' || !str(text)) return null;
    return btn(TEXT.listen, () => { if (U.speak(text) === false) toast(TEXT.noVoice, 'info'); },
      { class: 'btn ghost ln-listen', 'aria-label': TEXT.listenTo(label), 'data-test': 'lesson-listen' });
  }
  function subNav(active) {
    const link = (key, href, label) => h('a', { href, class: active === key ? 'chip on' : 'chip', text: label,
      'data-tour': 'learn-' + key, 'aria-current': active === key ? 'page' : null });
    return h('nav', { class: 'row ln-subnav', 'aria-label': TEXT.subnav },
      link('map', '#/learn', TEXT.map), link('plan', '#/learn/plan', TEXT.plan), link('glossary', '#/learn/glossary', TEXT.glossary));
  }
  function missingPage(text, back, backLabel) {
    return h('section', { class: 'page stack ln-missing' }, h('h1', { text: TEXT.missingTitle }), h('p', { text }),
      h('a', { class: 'btn', href: back, text: backLabel || TEXT.toMap }));
  }
  // A question with options. Every choice shows its explanation; the helpful reading is named softly. Never red.
  function choices(check, hook, onPick) {
    const why = h('p', { class: 'ln-why', 'aria-live': 'polite', 'data-test': hook.why });
    const soft = h('p', { class: 'muted ln-helpful' });
    const opts = arr(check && check.options);
    const buttons = [];
    opts.forEach((o, i) => {
      const b = btn(str(o && o.t), () => {
        buttons.forEach((x, j) => setPressed(x, j === i));
        const r = checkResult(check, i);
        why.textContent = r.why;
        soft.textContent = r.ok ? TEXT.helpfulYes : (r.helpful >= 0 ? TEXT.helpfulIs(str(opts[r.helpful].t)) : '');
        if (onPick) onPick(i);
      }, { class: 'btn ln-opt', 'aria-pressed': 'false', 'data-test': hook.opt(i) });
      buttons.push(b);
    });
    return h('div', { class: 'stack ln-choices', role: 'group', 'aria-label': str(check && check.q) },
      h('p', { class: 'ln-q', text: str(check && check.q) }), h('div', { class: 'stack' }, buttons), why, soft);
  }

  /* ── #/lesson/<id> : the lesson player ─────────────────────────────────────────────────────── */
  function lessonPage(ctxIn) {
    const c = ctxOf(ctxIn);
    const id = c.route.parts[1];
    const found = findLesson(id, c.C);
    if (!found) return missingPage(TEXT.missingLesson, '#/learn');
    const { lesson, module } = found;
    const steps = lessonSteps(lesson);
    let i = parseInt(c.route.query && c.route.query.step, 10);
    if (!(i >= 0 && i < steps.length)) i = 0;
    const step = steps[i];
    const done = lessonsDone(eventsOf(c.view), c.E).has(lesson.id);
    const goStep = (k) => go(`#/lesson/${enc(lesson.id)}?step=${k}`, true);
    const msg = h('p', { class: 'ln-msg', role: 'status' });

    let body;
    if (step.kind === 'moment') {
      const cast = isObj(c.C.cast) ? c.C.cast[lesson.moment.cast] : null;
      body = [h('h2', { text: TEXT.moment }), cast && str(cast.name) ? h('p', { class: 'muted', text: str(cast.name) }) : null,
        h('p', { text: str(lesson.moment.text) }), listenBtn(TEXT.moment, str(lesson.moment.text))];
    } else if (step.kind === 'card') {
      const card = lesson.cards[step.i] || {};
      const link = isObj(card.link) && typeof card.link.route === 'string' && /^#\//.test(card.link.route)
        ? h('a', { class: 'btn', href: card.link.route, text: str(card.link.label) || TEXT.next }) : null;
      body = [h('h2', { text: str(card.title) }), h('p', { text: str(card.text) }), link,
        listenBtn(str(card.title), [str(card.title), str(card.text)].filter(Boolean).join('. '))];
    } else if (step.kind === 'check') {
      body = [h('h2', { text: TEXT.check }), h('p', { class: 'muted', text: TEXT.pick }),
        choices(lesson.checks[step.i], { why: 'check-why', opt: (k) => 'check-opt-' + k })];
    } else if (step.kind === 'tryit') {
      const t = tryItOf(lesson);
      const ex = t.kind === 'exercise' ? exerciseById(t.exercise, c.C) : null;
      const label = t.kind === 'route' ? t.label : (ex && str(ex.title) ? TEXT.tryOpen(str(ex.title)) : TEXT.tryExercise);
      body = [h('h2', { text: TEXT.tryIt }), lesson.sensitive ? h('p', { text: TEXT.skipNote }) : null,
        h('a', { class: 'btn primary', href: t.href, text: label, 'data-test': 'lesson-tryit' }),
        lesson.sensitive ? btn(TEXT.trySkip, () => goStep(i + 1), { class: 'btn ghost', 'data-test': 'lesson-skip' }) : null];
    } else {
      body = wrapStep(c, found, done, msg);
    }

    const pct = Math.round(((i + 1) / steps.length) * 100);
    const nav = h('div', { class: 'row ln-nav' },
      i > 0 ? btn(TEXT.back, () => goStep(i - 1), { class: 'btn ghost', 'data-test': 'lesson-back' }) : null,
      step.kind !== 'wrap' ? btn(TEXT.next, () => goStep(i + 1), { class: 'btn primary', 'data-tour': 'lesson-next', 'data-test': 'lesson-next' }) : null);
    return h('section', { class: 'page stack ln-lesson', 'data-test': 'lesson-page' },
      h('p', { class: 'muted' }, h('a', { href: '#/learn/' + enc(module.id), text: str(module.name) || module.id })),
      h('h1', { text: str(lesson.title) }),
      h('p', { class: 'muted', text: TEXT.stepOf(i + 1, steps.length) }),
      h('div', { class: 'meter ln-meter', role: 'progressbar', 'aria-label': TEXT.progress, 'aria-valuemin': '1',
        'aria-valuemax': String(steps.length), 'aria-valuenow': String(i + 1) }, h('span', { style: { width: pct + '%' } })),
      h('div', { class: 'card stack ln-step', 'data-test': 'lesson-step', 'data-step': step.kind }, body),
      msg, nav);
  }

  function wrapStep(c, found, done, msg) {
    const { lesson, module } = found;
    const w = isObj(lesson.wrap) ? lesson.wrap : {};
    const pair = (dt, dd) => (str(dd) ? [h('dt', { text: dt }), h('dd', { text: str(dd) })] : null);
    const todo = str(w.todo);
    const todoBtn = todo ? btn(TEXT.addTodo, async () => {
      const A = c.A;
      if (!A || !A.todos || typeof A.todos.add !== 'function') { msg.textContent = TEXT.cantSave; return; }
      todoBtn.disabled = true;
      try {
        await A.todos.add({ text: todo, source: 'lesson:' + lesson.id });
        todoBtn.textContent = TEXT.todoAdded;
        toast(TEXT.todoAdded, 'ok');
      } catch (e) { todoBtn.disabled = false; msg.textContent = (e && e.message) || TEXT.cantSave; }
    }, { class: 'btn', 'data-test': 'lesson-todo' }) : null;
    const dest = found.last ? `#/learn/${enc(module.id)}?checkpoint=1` : found.next ? `#/lesson/${enc(found.next.id)}` : `#/learn/${enc(module.id)}`;
    const finishLabel = done ? (found.last ? TEXT.toCheckpoint : TEXT.nextLesson) : TEXT.finish;
    const finish = btn(finishLabel, async () => {
      if (!done) {
        const A = c.A;
        if (!A || typeof A.completeLesson !== 'function') { msg.textContent = TEXT.cantSave; return; }
        finish.disabled = true;
        try {
          await A.completeLesson(lesson.id);
          toast(c.calm ? TEXT.finished : TEXT.finished + TEXT.xp, 'ok');
        } catch (e) { finish.disabled = false; msg.textContent = (e && e.message) || TEXT.cantSave; return; }
      }
      go(dest);
    }, { class: 'btn primary', 'data-test': 'lesson-finish' });
    const whyBtn = btn(TEXT.why, () => whySheet(c, lesson, whyBtn), { class: 'btn ghost', 'data-test': 'lesson-why' });
    return [
      h('div', { class: 'stack', 'data-tour': 'lesson-wrap' }, h('h2', { text: TEXT.wrap }),
        h('dl', { class: 'ln-wrap' }, pair(TEXT.built, w.built), pair(TEXT.lives, w.lives), pair(TEXT.action, w.action))),
      todoBtn,
      whyBtn,
      done ? h('p', { class: 'muted', text: TEXT.already }) : null,
      found.last ? h('p', { text: TEXT.lastNote }) : null,
      finish,
      h('a', { href: '#/learn/' + enc(module.id), text: TEXT.backToStop, 'data-test': 'lesson-to-stop' }),
    ];
  }

  // "Why this works": the lesson's evidence cards from Content.references, in a sheet; without UI.sheet they show once
  // in the page straight after the button, so the button never does nothing.
  function whySheet(c, lesson, anchor) {
    const refs = arr(lesson.refs).map((id) => arr(c.C.references).find((r) => r && r.id === id)).filter(Boolean);
    const body = h('div', { class: 'stack ln-refs', 'data-test': 'lesson-refs' }, refs.length ? h('ul', { class: 'stack' }, refs.map((r) => h('li', { class: 'card stack' },
      h('p', { text: str(r.claim) }),
      h('p', { class: 'muted', text: str(r.cite) }),
      str(r.doi) ? h('p', { class: 'muted', text: `${TEXT.doi(str(r.doi))} ${TEXT.needsNet}` }) : null,
      typeof r.url === 'string' && /^https:\/\//.test(r.url)
        ? h('a', { href: r.url, rel: 'noopener noreferrer', target: '_blank', text: `${TEXT.openSource} ${TEXT.needsNet}` }) : null))) : h('p', { text: TEXT.noRefs }));
    const U = ns('UI');
    if (U && typeof U.sheet === 'function') { U.sheet(TEXT.why, body); return body; }
    const parent = anchor && anchor.parentNode;
    if (!parent) return body;
    const after = anchor.nextSibling;
    if (after && after.getAttribute && after.getAttribute('data-test') === 'lesson-refs') return after;
    parent.insertBefore(body, after);
    return body;
  }

  /* ── #/learn/<moduleId> and the checkpoint ─────────────────────────────────────────────────── */
  function modulePage(c, moduleId) {
    const m = moduleById(moduleId, c.C);
    if (!m) {
      const known = STOPS.some((s) => s.id === moduleId);
      return missingPage(known ? TEXT.comingStop : TEXT.missingLesson, '#/learn');
    }
    if (c.route.query && c.route.query.checkpoint === '1') return checkpointPage(c, m);
    const events = eventsOf(c.view);
    const done = lessonsDone(events, c.E);
    const p = moduleProgress(m, events, c.E);
    return h('section', { class: 'page stack ln-module', 'data-test': 'module-page' }, subNav('map'),
      h('h1', { text: str(m.name) || m.id }),
      str(m.harbor) ? h('p', { class: 'muted', text: str(m.harbor) }) : null,
      str(m.blurb) ? h('p', { text: str(m.blurb) }) : null,
      h('p', { text: TEXT.lessons(p.done, p.total) }),
      h('h2', { text: TEXT.lessonList }),
      h('ol', { class: 'stack ln-lessons' }, arr(m.lessons).filter((l) => l && l.id).map((l) => h('li', { class: 'row' },
        h('a', { href: '#/lesson/' + enc(l.id), class: 'btn ghost', 'data-test': 'module-lesson-' + l.id }, str(l.title) || l.id),
        Number(l.minutes) > 0 ? h('span', { class: 'muted', text: TEXT.minutes(Number(l.minutes)) }) : null,
        done.has(l.id) ? h('span', { class: 'chip on', text: TEXT.doneMark }) : null))),
      h('a', { class: 'btn', href: `#/learn/${enc(m.id)}?checkpoint=1`, 'data-test': 'module-checkpoint',
        text: p.checkpointDone ? TEXT.checkpointAgain : TEXT.checkpoint }),
      h('a', { href: '#/learn', text: TEXT.toMap }));
  }

  function checkpointPage(c, m) {
    const qs = checkpointQuestions(m, c.C);
    const picks = [];
    const msg = h('p', { class: 'ln-msg', role: 'status' });
    const finish = btn(TEXT.cpFinish, async () => {
      const A = c.A;
      if (!A || typeof A.checkpoint !== 'function') { msg.textContent = TEXT.cantSave; return; }
      finish.disabled = true;
      // CheckpointCompleted earns once per module: read the log before this finish writes to it.
      const firstTime = !hasEvent(c.view, 'CheckpointCompleted', 'moduleId', m.id);
      try {
        await A.checkpoint(m.id, checkpointAnswers(qs, picks));
        toast(c.calm || !firstTime ? TEXT.cpDone : TEXT.cpDone + TEXT.xp, 'ok');
        go('#/learn/' + enc(m.id));
      } catch (e) { finish.disabled = false; msg.textContent = (e && e.message) || TEXT.cantSave; }
    }, { class: 'btn primary', 'data-test': 'checkpoint-finish' });
    return h('section', { class: 'page stack ln-checkpoint', 'data-test': 'checkpoint-page' },
      h('h1', { text: TEXT.cpTitle(str(m.name) || m.id) }),
      h('p', { text: qs.length ? TEXT.cpIntro : TEXT.cpNone }),
      qs.map((q, qi) => h('div', { class: 'card stack', 'data-test': 'checkpoint-q-' + (qi + 1) },
        choices(q, { why: 'cp-why-' + (qi + 1), opt: (k) => `cp-opt-${qi + 1}-${k}` }, (k) => { picks[qi] = k; }))),
      msg, finish, h('a', { href: '#/learn/' + enc(m.id), text: TEXT.backToStop }));
  }

  /* ── #/learn : the map ─────────────────────────────────────────────────────────────────────── */
  function harborPath(stops) {
    const pts = stops.map((s, i) => [160 + Math.round(95 * Math.sin(i * 0.9)), 28 + i * 44]);
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
    const root = svg('svg', { viewBox: `0 0 320 ${pts.length * 44 + 12}`, class: 'ln-harbor', 'aria-hidden': 'true', focusable: 'false', role: 'presentation' });
    if (!root) return null;
    root.appendChild(svg('path', { d, fill: 'none', stroke: 'currentColor', 'stroke-width': 3, 'stroke-dasharray': '6 6', opacity: 0.4 }));
    stops.forEach((s, i) => {
      const [x, y] = pts[i];
      root.appendChild(svg('circle', { cx: x, cy: y, r: s.current ? 15 : 12, class: 'ln-node' + (s.complete ? ' done' : '') + (s.current ? ' current' : '') + (s.loaded ? '' : ' coming'),
        fill: s.complete ? 'currentColor' : 'none', stroke: 'currentColor', 'stroke-width': s.current ? 5 : 2, 'stroke-dasharray': s.loaded ? null : '3 3' }));
    });
    return root;
  }
  function mapPage(c) {
    const stops = mapData(c.view, c.now, c.C, c.E);
    const item = (s) => h('li', { class: 'card stack ln-stop' + (s.current ? ' current' : '') + (s.complete ? ' done' : '') + (s.loaded ? '' : ' coming'),
      'data-test': 'stop-' + s.id, 'aria-current': s.current ? 'step' : null },
      h('h2', {}, s.loaded ? h('a', { href: '#/learn/' + enc(s.id), text: s.name }) : s.name),
      s.step ? h('p', { class: 'muted', text: TEXT.stepLabel(s.step) }) : null,
      s.harbor ? h('p', { class: 'muted', text: s.harbor }) : null,
      s.current ? h('p', { class: 'chip on', text: TEXT.here, 'data-test': 'map-current' }) : null,
      s.loaded ? h('p', { text: TEXT.lessons(s.done, s.total) + (s.complete ? ` · ${TEXT.complete}` : '') }) : h('p', { class: 'muted', text: TEXT.coming }),
      s.skills.length ? h('p', { text: TEXT.skills(s.skills.filter((k) => k.uses > 0).length, s.skills.length) }) : null,
      s.skills.length ? h('ul', { class: 'row ln-skills' }, s.skills.map((k) => h('li', { class: k.uses > 0 ? 'chip on' : 'chip', text: k.uses > 0 ? `${k.name} (${k.uses})` : k.name }))) : null,
      s.unlocks.length ? h('p', { class: 'muted', text: TEXT.opens(s.unlocks.join(', ')) }) : null);
    return h('section', { class: 'page stack ln-map', 'data-test': 'learn-map' }, subNav('map'),
      h('h1', { text: TEXT.mapTitle }), h('p', { text: TEXT.mapIntro }),
      harborPath(stops),
      h('ol', { class: 'stack ln-stops', 'aria-label': TEXT.stopList }, stops.map(item)));
  }

  /* ── #/learn/plan : weeks by pace ──────────────────────────────────────────────────────────── */
  function planPage(c) {
    const events = eventsOf(c.view);
    const done = modulesDone(events, c.C, c.E);
    const plan = planFor(c.profile, done, c.now, c.C, c.E);
    const msg = h('p', { class: 'ln-msg', role: 'status' });
    const nameOf = (id) => { const m = moduleById(id, c.C); const s = STOPS.find((x) => x.id === id); return (m && str(m.name)) || (s ? s.name : id); };
    const stopLink = (id) => (moduleById(id, c.C) ? h('a', { href: '#/learn/' + enc(id), text: nameOf(id) }) : h('span', { text: `${nameOf(id)} (${TEXT.coming.replace(/\.$/, '').toLowerCase()})` }));
    async function save(patch, okText) {
      const A = c.A;
      if (!A || typeof A.onboard !== 'function') { msg.textContent = TEXT.cantSave; return false; }
      if (!c.profile.onboardedAt) { msg.textContent = TEXT.setupFirst; return false; }
      try { await A.onboard(patch); toast(okText, 'ok'); return true; } catch (e) { msg.textContent = (e && e.message) || TEXT.cantSave; return false; }
    }
    const focus = focusData(c.view, c.now, c.C, c.E);
    const welcome = needsWelcomeBack(c.profile, events, c.now) ? h('div', { class: 'card stack ln-welcome', role: 'region', 'aria-label': TEXT.welcomeTitle, 'data-test': 'welcome-back' },
      h('h2', { text: TEXT.welcomeTitle }), h('p', { text: TEXT.welcomeText }),
      h('div', { class: 'row' },
        btn(TEXT.replan, () => save({ roadmapStart: localDate(dayOf(c.now)) }, TEXT.replanned), { class: 'btn primary', 'data-test': 'welcome-replan' }),
        h('a', { class: 'btn', href: focus ? '#/lesson/' + enc(focus.nextLessonId) : '#/learn', text: TEXT.pickUp }))) : null;

    const paces = arr(c.C.paces).filter((p) => p && p.id);
    const cur = paceOf(c.profile, c.C).id;
    let picked = cur;
    const custom = h('input', { type: 'number', id: 'ln-custom', min: '0.5', max: '7', step: '0.5', inputmode: 'decimal',
      value: String(Number(c.profile.customPerWeek) > 0 ? c.profile.customPerWeek : 1), 'data-test': 'plan-custom', 'aria-describedby': 'ln-custom-hint' });
    const paceForm = h('fieldset', { class: 'card stack ln-pace' }, h('legend', { text: TEXT.paceTitle }),
      paces.map((p) => h('label', { class: 'row' },
        h('input', { type: 'radio', name: 'ln-pace', value: p.id, checked: p.id === cur, 'data-test': 'plan-pace-' + p.id, onChange: () => { picked = p.id; } }),
        h('span', { text: str(p.name) }), str(p.gist) ? h('span', { class: 'muted', text: str(p.gist) }) : null)),
      h('label', { for: 'ln-custom', text: TEXT.customLabel }), custom,
      h('p', { class: 'muted', id: 'ln-custom-hint', text: TEXT.customHint }),
      btn(TEXT.paceSave, () => {
        const patch = { pace: picked };
        if (picked === 'custom') {
          const n = Number(custom.value);
          patch.customPerWeek = Number.isFinite(n) && n > 0 ? Math.min(7, Math.max(0.5, n)) : 1;
        }
        return save(patch, TEXT.paceSaved);
      }, { class: 'btn primary', 'data-test': 'plan-save' }),
      c.profile.onboardedAt ? null : h('a', { href: '#/onboarding', text: TEXT.setupLink }));

    const body = plan.free
      ? [h('p', { text: TEXT.freeIntro }), h('ol', { class: 'stack ln-order' }, plan.order.map((id) => h('li', { class: 'row' }, stopLink(id),
        done.has(id) ? h('span', { class: 'chip on', text: TEXT.state.done }) : null)))]
      : [h('p', { text: TEXT.planIntro }), h('ol', { class: 'stack ln-weeks' }, plan.weeks.map((w) => {
        const s = parseDate(w.start); const e = parseDate(w.end);
        return h('li', { class: 'card stack ln-week ' + w.state, 'data-test': 'plan-week-' + w.n, 'data-state': w.state, 'aria-current': w.state === 'current' ? 'date' : null },
          h('h3', { text: w.span > 1 ? TEXT.weeksOf(fmtDay(s), fmtDay(e)) : TEXT.weekOf(fmtDay(s)) }),
          h('p', {}, w.moduleIds.map((id, k) => [k ? ', ' : '', stopLink(id)])),
          h('p', { class: w.state === 'done' || w.state === 'current' ? 'chip on' : 'chip', text: TEXT.state[w.state] }));
      }))];
    return h('section', { class: 'page stack ln-plan', 'data-test': 'learn-plan' }, subNav('plan'),
      h('h1', { text: TEXT.planTitle }), welcome, body, paceForm, msg);
  }

  /* ── #/learn/glossary ──────────────────────────────────────────────────────────────────────── */
  function glossaryPage(c) {
    const list = arr(c.C.glossary);
    const dl = h('dl', { class: 'stack ln-glossary' });
    const count = h('p', { class: 'muted', 'aria-live': 'polite', 'data-test': 'glossary-count' });
    const paint = (q) => {
      const rows = glossaryFilter(list, q);
      dl.textContent = '';
      for (const r of rows) { dl.appendChild(h('dt', { text: str(r.term) })); dl.appendChild(h('dd', { text: str(r.def) })); }
      count.textContent = rows.length ? TEXT.count(rows.length) : TEXT.noMatch;
    };
    const input = h('input', { type: 'search', id: 'ln-glossary-q', autocomplete: 'off', 'data-test': 'glossary-search',
      onInput: (e) => paint(e && e.target ? e.target.value : input.value) });
    paint('');
    return h('section', { class: 'page stack ln-glossary-page', 'data-test': 'learn-glossary' }, subNav('glossary'),
      h('h1', { text: TEXT.glossaryTitle }), h('label', { for: 'ln-glossary-q', text: TEXT.search }), input, count, dl);
  }

  /* ── the weekly focus card (Today embeds it: LearnUI.focusCard(ctx)) ───────────────────────── */
  function focusCard(ctxIn) {
    const c = ctxOf(ctxIn);
    const d = focusData(c.view, c.now, c.C, c.E);
    if (!d) {
      return h('section', { class: 'card stack ln-focus', 'data-test': 'focus-card', 'aria-label': TEXT.focusTitle },
        h('h2', { text: TEXT.focusTitle }), h('p', { text: TEXT.focusAllDone }), h('a', { href: '#/learn', text: TEXT.focusMap }));
    }
    return h('section', { class: 'card stack ln-focus', 'data-test': 'focus-card', 'aria-label': TEXT.focusTitle },
      h('h2', { text: TEXT.focusTitle }), h('p', { class: 'ln-focus-name', text: d.name }),
      h('p', { text: TEXT.focusLeft(d.lessonsLeft, d.minutes) }),
      d.practiceGoal ? h('p', { class: 'muted', text: TEXT.practise(d.practiceGoal) }) : null,
      h('div', { class: 'row' }, h('a', { class: 'btn primary', href: '#/lesson/' + enc(d.nextLessonId), text: TEXT.focusGo, 'data-test': 'focus-go' }),
        h('a', { class: 'btn ghost', href: '#/learn', text: TEXT.focusMap })));
  }

  function learnPage(ctxIn) {
    const c = ctxOf(ctxIn);
    const seg = c.route.parts[1];
    if (!seg) return mapPage(c);
    if (seg === 'plan') return planPage(c);
    if (seg === 'glossary') return glossaryPage(c);
    return modulePage(c, seg);
  }

  // The pure names: module.exports carries these only; the DOM functions stay on the global LearnUI.
  const PURE = ['STOPS', 'TEXT', 'lessonSteps', 'checkResult', 'tryItOf', 'checkpointQuestions', 'checkpointAnswers',
    'lessonsDone', 'modulesDone', 'moduleProgress', 'paceOf', 'planWeeks', 'planFor', 'needsWelcomeBack', 'glossaryFilter',
    'focusData', 'mapData', 'findLesson', 'localDate'];

  return {
    STOPS, TEXT, lessonSteps, checkResult, tryItOf, checkpointQuestions, checkpointAnswers,
    lessonsDone, modulesDone, moduleProgress, paceOf, planWeeks, planFor, needsWelcomeBack, glossaryFilter,
    focusData, mapData, findLesson, localDate,
    lessonPage, learnPage, focusCard, PURE,
  };
})();

// Pages register from this file (contracts/core.md: UI.pages[firstSegment]); nothing in ui-core.js or shell.html changes.
if (typeof UI !== 'undefined' && UI && UI.pages) {
  UI.pages.learn = (ctx) => LearnUI.learnPage(ctx);
  UI.pages.lesson = (ctx) => LearnUI.lessonPage(ctx);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
  for (const k of LearnUI.PURE) module.exports[k] = LearnUI[k];
}
