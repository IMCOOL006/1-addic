/* ════════════════════════════════════════════════════════════════════════════════════════════
   1-addic · offline edition · ENGINE
   The pure rules engine (BUILD-PLAN 3.2, 3.7, 3.9-3.11). Every function takes data in and returns
   data out. `now` is always a parameter (an ISO string, a Date or ms): no clock inside a rule.
   No DOM, no storage, no network. Nothing derived ever decreases: XP, mastery, badges, total days
   and the Harbor's light come from the append-only event log; a slip restarts only the opt-in
   current run. The only randomness in this file is inside id().
   Classic script: the browser build concatenates it after the content files (Content is a
   shared top-level const); under Node, require('./engine.js') loads the content files itself.
   ════════════════════════════════════════════════════════════════════════════════════════════ */
const Engine = (() => {
  'use strict';

  /* Node only: content-core.js, then every other content-*.js in this folder, sorted. */
  function loadContentNode() {
    if (typeof require !== 'function') return {};
    const fs = require('fs');
    const path = require('path');
    const core = require(path.join(__dirname, 'content-core.js'));
    const extra = fs.readdirSync(__dirname).filter((f) => /^content-.*\.js$/.test(f) && f !== 'content-core.js').sort();
    for (const f of extra) require(path.join(__dirname, f));
    return core;
  }
  const C = (typeof Content !== 'undefined') ? Content : loadContentNode();

  const DAY_MS = 86400000;
  const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const own = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  const arr = (x) => (Array.isArray(x) ? x : []);

  /* ── ids and dates ───────────────────────────────────────────────────────────────────────── */

  let lastT = 0;
  let seq = 0;
  function randomPart(len) {
    const abc = '0123456789abcdefghijklmnopqrstuvwxyz';
    let out = '';
    const g = (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') ? globalThis.crypto : null;
    if (g) {
      const buf = new Uint8Array(len);
      g.getRandomValues(buf);
      for (let i = 0; i < len; i++) out += abc[buf[i] % 36];
    } else {
      for (let i = 0; i < len; i++) out += abc[Math.floor(Math.random() * 36)];
    }
    return out;
  }
  /* Time-sortable (9 base-36 chars of ms, then a 3-char sequence within the ms) plus 6 random chars. */
  function id() {
    let t = Date.now();
    if (t <= lastT) { t = lastT; seq += 1; } else { lastT = t; seq = 0; }
    return t.toString(36).padStart(9, '0') + seq.toString(36).padStart(3, '0') + randomPart(6);
  }

  /* An ISO string, a Date, ms, or a plain 'YYYY-MM-DD' (local midnight) to a Date, or null. */
  function toDate(x) {
    if (x instanceof Date) return isNaN(x.getTime()) ? null : new Date(x.getTime());
    if (typeof x === 'number') return isFinite(x) ? new Date(x) : null;
    if (typeof x === 'string' && x) {
      const m = DATE_RE.exec(x);
      const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(x);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }
  const msOf = (x) => { const d = toDate(x); return d ? d.getTime() : NaN; };

  /* The device-local calendar date of x as 'YYYY-MM-DD' ('' when x is not a date). */
  function dateStr(x) {
    if (typeof x === 'string' && DATE_RE.test(x)) return x;
    const d = toDate(x);
    return d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : '';
  }
  function todayStr(now) { return dateStr(now); }

  /* Calendar arithmetic on 'YYYY-MM-DD' parsed as UTC, so DST never shifts a day. */
  function utcMs(ds) {
    const m = DATE_RE.exec(dateStr(ds));
    return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : NaN;
  }
  function fromUtc(ms) {
    const d = new Date(ms);
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  }
  function addDays(ds, n) {
    const t = utcMs(ds);
    if (isNaN(t)) return '';
    return fromUtc(t + Math.round(Number(n) || 0) * DAY_MS);
  }
  /* b minus a, in calendar days (0 when either is not a date). */
  function daysBetween(a, b) {
    const ta = utcMs(a);
    const tb = utcMs(b);
    if (isNaN(ta) || isNaN(tb)) return 0;
    return Math.round((tb - ta) / DAY_MS);
  }
  /* The first day of the week holding ds; weekStartsOn 1 = Monday (default), 0 = Sunday. */
  function weekStart(ds, weekStartsOn = 1) {
    const t = utcMs(ds);
    if (isNaN(t)) return '';
    const dow = new Date(t).getUTCDay();
    const first = ((Number(weekStartsOn) % 7) + 7) % 7;
    return addDays(fromUtc(t), -((dow - first + 7) % 7));
  }
  /* en-IN style, fixed so every device shows the same: "7 Nov 2026", "7:40 pm". */
  function fmtDate(x) {
    const d = toDate(x);
    return d ? `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : '';
  }
  function fmtTime(x) {
    const d = toDate(x);
    if (!d) return '';
    const h = d.getHours();
    return `${h % 12 || 12}:${pad(d.getMinutes())} ${h < 12 ? 'am' : 'pm'}`;
  }
  function fmtDateTime(x) {
    const d = toDate(x);
    return d ? `${fmtDate(d)}, ${fmtTime(d)}` : '';
  }
  function hourOf(iso) {
    const d = toDate(iso);
    return d ? d.getHours() : 0;
  }
  /* Night is 20:00 to 05:59 local time. */
  function isNight(now) {
    const d = toDate(now);
    if (!d) return false;
    const h = d.getHours();
    return h >= 20 || h < 6;
  }

  /* ── profile ─────────────────────────────────────────────────────────────────────────────── */

  function term(profile) {
    const terms = arr(C.terms);
    const want = profile && profile.term;
    const row = terms.find((t) => t.id === want) || terms[0] || { word: 'sober', days: 'sober days', adjective: 'sober' };
    return { word: row.word, days: row.days, adjective: row.adjective };
  }
  function greeting(now, name) {
    const d = toDate(now);
    const h = d ? d.getHours() : 12;
    const base = (h >= 5 && h < 12) ? 'Good morning' : (h >= 12 && h < 17) ? 'Good afternoon' : (h >= 17) ? 'Good evening' : 'Hello';
    const n = typeof name === 'string' ? name.trim() : '';
    return n ? `${base}, ${n}.` : `${base}.`;
  }
  function companionName(profile) {
    const n = profile && typeof profile.companion === 'string' ? profile.companion.trim() : '';
    return n ? n.slice(0, 40) : 'Companion';
  }

  /* ── events ──────────────────────────────────────────────────────────────────────────────── */

  /* Valid events (a type and a parseable at), sorted by at then id, each id counted once. */
  function cmpStr(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
  function normEvents(events) {
    const list = Array.isArray(events) ? events : (events && typeof events.list === 'function') ? arr(events.list('events')) : [];
    const rows = list.filter((e) => e && typeof e.type === 'string' && !isNaN(msOf(e.at)));
    rows.sort((a, b) => (msOf(a.at) - msOf(b.at)) || cmpStr(String(a.id || ''), String(b.id || ''))
      || cmpStr(a.type, b.type) || cmpStr(JSON.stringify(a.payload || {}), JSON.stringify(b.payload || {})));
    const seen = new Set();
    const out = [];
    for (const e of rows) {
      if (e.id != null && e.id !== '') {
        if (seen.has(e.id)) continue;
        seen.add(e.id);
      }
      out.push(e);
    }
    return out;
  }
  const pl = (e) => (e && e.payload && typeof e.payload === 'object') ? e.payload : {};

  /* ── game: XP (numbers from Content.xp only) ─────────────────────────────────────────────── */

  const XP_SETTINGS = new Set(['mindfulDailyCap', 'repeatFull', 'repeatHalf', 'onceOnly']);
  const DIMINISHING = new Set(['LogCreated', 'CheckinCompleted', 'SkillUsed', 'ActivityDone']);
  const ONCE_FIELD = { LessonCompleted: 'lessonId', TutorialCompleted: 'id', CheckpointCompleted: 'moduleId', ExplorerCompleted: null };
  const ARTIFACT_KINDS = new Set(['build', 'assess', 'plan']);
  const KNOWN_KINDS = new Set(['build', 'assess', 'plan', 'practice', 'reflect', 'tool']);

  /* The XP an event type is worth before any limit; 0 for zero-XP, unknown and settings keys. */
  function xpBase(type) {
    const xp = C.xp || {};
    if (XP_SETTINGS.has(type) || !own(xp, type)) return 0;
    const v = xp[type];
    return (typeof v === 'number' && v > 0) ? v : 0;
  }
  function onceKey(e) {
    const field = own(ONCE_FIELD, e.type) ? ONCE_FIELD[e.type] : 'id';
    return field ? String(pl(e)[field] == null ? '' : pl(e)[field]) : '';
  }
  /* byType lists XP-bearing types only, so a zero-XP event (a slip) never changes the shape. */
  function xpFromEvents(events, now) {
    const xp = C.xp || {};
    const full = Number(xp.repeatFull) || 0;
    const half = Number(xp.repeatHalf) || 0;
    const cap = Number(xp.mindfulDailyCap) || 0;
    const once = new Set(arr(xp.onceOnly));
    const today = todayStr(now);
    const counts = new Map();
    const done = new Set();
    let total = 0;
    let todayXp = 0;
    const byType = {};
    for (const e of normEvents(events)) {
      const base = xpBase(e.type);
      const day = dateStr(e.at);
      let got = 0;
      if (base > 0) {
        if (DIMINISHING.has(e.type)) {
          const k = `${e.type}|${day}`;
          const n = (counts.get(k) || 0) + 1;
          counts.set(k, n);
          got = n <= full ? base : n <= half ? Math.floor(base / 2) : 0;
        } else if (e.type === 'MindfulMinute') {
          const k = `MindfulMinute|${day}`;
          const so = counts.get(k) || 0;
          got = Math.max(0, Math.min(base, cap - so));
          counts.set(k, so + got);
        } else if (once.has(e.type) || own(ONCE_FIELD, e.type)) {
          const k = `${e.type}|${onceKey(e)}`;
          if (!done.has(k)) { done.add(k); got = base; }
        } else if (e.type === 'ArtifactSaved') {
          const p = pl(e);
          const kind = KNOWN_KINDS.has(p.kind) ? p.kind : 'build';
          const k = `ArtifactSaved|${p.exerciseId == null ? '' : p.exerciseId}|${day}`;
          if (ARTIFACT_KINDS.has(kind) && !done.has(k)) { done.add(k); got = base; }
        } else {
          got = base;
        }
      }
      if (base > 0) byType[e.type] = (byType[e.type] || 0) + got;
      total += got;
      if (day === today) todayXp += got;
    }
    return { total, today: todayXp, byType };
  }

  /* ── game: mastery, regions, momentum ────────────────────────────────────────────────────── */

  function levelFor(uses) {
    return arr(C.masteryThresholds).filter((t) => uses >= t).length;
  }
  /* SkillUsed.helpful is written as a boolean (the contract); 0/1 and a 1-5 scale are tolerated. */
  function helpfulValue(v) {
    if (v === true) return 1;
    if (v === false) return 0;
    if (typeof v === 'number' && isFinite(v)) {
      if (v === 0 || v === 1) return v;
      if (v >= 2 && v <= 5) return (v - 1) / 4;
    }
    return null;
  }
  function mastery(events) {
    const out = {};
    const sums = {};
    for (const e of normEvents(events)) {
      if (e.type !== 'SkillUsed') continue;
      const sid = pl(e).skillId;
      if (typeof sid !== 'string' || !sid) continue;
      const m = out[sid] || (out[sid] = { uses: 0, level: 0, helpfulAvg: null, lastAt: null });
      const s = sums[sid] || (sums[sid] = { sum: 0, n: 0 });
      m.uses += 1;
      m.lastAt = e.at;
      const h = helpfulValue(pl(e).helpful);
      if (h !== null) { s.sum += h; s.n += 1; }
    }
    for (const sid of Object.keys(out)) {
      out[sid].level = levelFor(out[sid].uses);
      out[sid].helpfulAvg = sums[sid].n ? Math.round((sums[sid].sum / sums[sid].n) * 1000) / 1000 : null;
    }
    return out;
  }
  function regionLevels(m) {
    const ms = m || {};
    const out = {};
    for (const r of Object.keys(C.regions || {})) out[r] = 0;
    const uses = {};
    for (const s of arr(C.skills)) {
      if (!own(out, s.region)) continue;
      uses[s.region] = (uses[s.region] || 0) + ((ms[s.id] && Number(ms[s.id].uses)) || 0);
    }
    for (const r of Object.keys(out)) out[r] = levelFor(uses[r] || 0);
    return out;
  }
  /* Distinct local dates in the 14 days ending today with any XP-bearing event type. */
  function momentum(events, now) {
    const today = todayStr(now);
    const from = addDays(today, -13);
    const dates = new Set();
    for (const e of normEvents(events)) {
      if (xpBase(e.type) <= 0) continue;
      const d = dateStr(e.at);
      if (d >= from && d <= today) dates.add(d);
    }
    const list = [...dates].sort();
    return { days: list.length, of: 14, dates: list };
  }

  /* ── game: lessons, modules, rank ────────────────────────────────────────────────────────── */

  function lessonsDone(events) {
    const out = new Set();
    for (const e of normEvents(events)) {
      const lid = pl(e).lessonId;
      if (e.type === 'LessonCompleted' && typeof lid === 'string' && lid) out.add(lid);
    }
    return out;
  }
  /* A module is done by a ModuleCompleted event or when every one of its lessons is done. */
  function modulesDone(events) {
    const ev = normEvents(events);
    const lessons = lessonsDone(ev);
    const out = new Set();
    for (const m of arr(C.modules)) {
      const ls = arr(m.lessons);
      if (ls.length && ls.every((l) => lessons.has(l.id))) out.add(m.id);
    }
    for (const e of ev) {
      const mid = pl(e).moduleId;
      if (e.type === 'ModuleCompleted' && typeof mid === 'string' && mid) out.add(mid);
    }
    return out;
  }
  /* The highest Content.ranks row whose `when` holds, or null. `explorer`: ExplorerCompleted.
     U-06 adds the all-12-Explorer-items path through `view`. `mN`: module mN is done. */
  function rank(events, view) {
    const ev = normEvents(events);
    const mods = modulesDone(ev);
    const explorerDone = ev.some((e) => e.type === 'ExplorerCompleted');
    let best = null;
    for (const r of arr(C.ranks)) {
      const ok = r.when === 'explorer' ? explorerDone : (typeof r.when === 'string' && mods.has(r.when));
      if (ok) best = r;
    }
    return best;
  }

  /* ── game: badges (each once; earnedAt = the at of the first row that satisfies it) ──────── */

  const STORES = { profile: 'key', settings: 'key', meta: 'key', events: 'id', logs: 'id', responses: 'id', contacts: 'id', plans: 'id', todos: 'id', motivation: 'id', predictions: 'id', quests: 'id', tutorials: 'id', reveals: 'id', tips: 'id', recoveryPlan: 'key' };
  function rowsOf(view, store) {
    if (!view || typeof view.list !== 'function') return [];
    try { return arr(view.list(store)).filter((r) => r && typeof r === 'object'); } catch (_) { return []; }
  }
  function rowOf(view, store, key) {
    if (!view || typeof view.get !== 'function') return null;
    try { return view.get(store, key) || null; } catch (_) { return null; }
  }
  const byAt = (a, b) => (msOf(a.at) - msOf(b.at)) || cmpStr(String(a.id || ''), String(b.id || ''));
  const nth = (rows, n) => (rows.length >= n ? (rows[n - 1].at || null) : undefined);
  function maxAt(list) {
    let best = null;
    for (const x of list) if (x && (best === null || msOf(x) > msOf(best))) best = x;
    return best;
  }
  /* A quest row is complete by completedAt or when every step of the quest is ticked. */
  function questDoneAt(view, questId) {
    const q = arr(C.quests).find((x) => x.id === questId);
    const row = rowsOf(view, 'quests').find((r) => r.id === questId);
    if (!q || !row) return undefined;
    if (row.completedAt) return row.completedAt;
    const ticks = (row.ticks && typeof row.ticks === 'object') ? row.ticks : {};
    const steps = arr(q.steps);
    if (!steps.length || !steps.every((s) => ticks[s.id])) return undefined;
    return maxAt(steps.map((s) => (typeof ticks[s.id] === 'string' ? ticks[s.id] : null))) || null;
  }
  function responsesFor(view, exerciseId) {
    return rowsOf(view, 'responses').filter((r) => r.exerciseId === exerciseId && !r.draft && !isNaN(msOf(r.at))).sort(byAt);
  }
  function badges(view, now) {
    const ev = normEvents(view);
    const ofType = (t, f) => ev.filter((e) => e.type === t && (!f || f(e)));
    const passed = ofType('SosCompleted', (e) => pl(e).outcome === 'passed');
    const earned = {
      'smart-not-strong': questDoneAt(view, 'clear-space'),
      'first-wave': nth(passed, 1),
      'wave-rider-10': nth(passed, 10),
      'wave-rider-50': nth(passed, 50),
      'self-expert': (() => {
        const t = responsesFor(view, 'triggers');
        const r = responsesFor(view, 'red-flags');
        return (t.length && r.length) ? maxAt([t[0].at, r[0].at]) : undefined;
      })(),
      objection: nth(responsesFor(view, 'trial'), 10),
      /* a net stays counted once added: a deactivated contact was active once (nothing decreases) */
      'net-weaver': (() => {
        const nets = rowsOf(view, 'contacts').filter((c) => c.role === 'safetyNet').sort(byAt);
        return nets.length >= 3 ? (nets[2].at || nets[2].createdAt || null) : undefined;
      })(),
      'said-it': nth(ofType('ScriptUsed'), 1),
      'mood-lies': (() => {
        const hits = rowsOf(view, 'predictions')
          .filter((p) => typeof p.actual === 'number' && typeof p.predicted === 'number' && p.actual > p.predicted)
          .map((p) => p.completedAt || p.at || null);
        return hits.length ? (hits.filter(Boolean).sort((a, b) => msOf(a) - msOf(b))[0] || null) : undefined;
      })(),
      'calm-core': questDoneAt(view, 'sober-training'),
      planner: nth(ofType('WeeklyReviewCompleted'), 4),
      comeback: nth(ofType('SlipReviewed'), 1),
      graduate: nth(ofType('RecoveryPlanConfirmed'), 1),
    };
    const out = [];
    for (const b of arr(C.badges)) {
      if (own(earned, b.id) && earned[b.id] !== undefined) out.push({ id: b.id, earnedAt: earned[b.id] });
    }
    return out;
  }

  /* ── game: day counters ──────────────────────────────────────────────────────────────────────
     `total` counts COMPLETED local dates only, from startDate up to yesterday (today is counted
     when it ends), and a counted date stays counted. A date is left out only when a slip for that
     date was logged (its at) on or before that date, i.e. the slip was known before the day was
     banked; a slip logged later for an earlier date never removes a banked day. So total never
     falls. `current` (the opt-in run) is the only number a slip restarts. `reached` comes from
     total and from every MilestoneSeen, so a milestone never un-reaches. No XP for any of this. */
  function slipOf(item, today) {
    if (!item || typeof item !== 'object') return null;
    let date = '';
    if (item.type === 'SlipLogged') date = dateStr(pl(item).date || item.at);
    else if (item.type === 'slip' || item.type === undefined) date = dateStr(item.date || item.at);
    else return null;
    if (!date) return null;
    const known = item.at && dateStr(item.at) ? dateStr(item.at) : today;
    return { date, known };
  }
  function counters(profile, slips, now) {
    const today = todayStr(now);
    const start = profile && profile.startDate ? dateStr(profile.startDate) : '';
    const milestones = arr(C.milestones).filter((m) => typeof m === 'number').sort((a, b) => a - b);
    const items = Array.isArray(slips) ? slips : [];
    const seen = new Set();
    const slipKnown = new Map();
    for (const it of items) {
      if (it && it.type === 'MilestoneSeen') {
        const m = Number(pl(it).milestone);
        if (isFinite(m) && m > 0) seen.add(m);
        continue;
      }
      const s = slipOf(it, today);
      if (!s) continue;
      const prev = slipKnown.get(s.date);
      if (prev === undefined || s.known < prev) slipKnown.set(s.date, s.known);
    }
    let total = 0;
    let current = 0;
    if (start && today) {
      const span = Math.max(0, daysBetween(start, today));
      let left = 0;
      let lastSlip = '';
      for (const [d, known] of slipKnown) {
        if (d >= start && d < today && known <= d) left += 1;
        if (d >= start && d <= today && d > lastSlip) lastSlip = d;
      }
      total = Math.max(0, span - left);
      const runStart = lastSlip ? addDays(lastSlip, 1) : start;
      current = Math.max(0, daysBetween(runStart, today));
    }
    const reached = [...new Set([...milestones.filter((m) => m <= total), ...seen])].sort((a, b) => a - b);
    const next = start ? milestones.find((m) => m > total) : undefined;
    return { tracking: Boolean(start), total, current, nextMilestone: next === undefined ? null : next, reached };
  }

  /* ── game: everything at once ────────────────────────────────────────────────────────────── */

  function gameState(view, now) {
    const ev = normEvents(view);
    const m = mastery(ev);
    const slipLogs = rowsOf(view, 'logs').filter((l) => l.type === 'slip');
    return {
      xp: xpFromEvents(ev, now),
      mastery: m,
      regions: regionLevels(m),
      momentum: momentum(ev, now),
      rank: rank(ev, view),
      badges: badges(view, now),
      modulesDone: modulesDone(ev),
      lessonsDone: lessonsDone(ev),
      counters: counters(rowOf(view, 'profile', 'me'), ev.concat(slipLogs), now),
    };
  }

  /* ── views ───────────────────────────────────────────────────────────────────────────────── */

  /* A Store.view-shaped object over plain rows: {get(store,id), list(store), count(store)}. */
  function makeView(rows) {
    const data = (rows && typeof rows === 'object') ? rows : {};
    const list = (store) => arr(data[store]).slice();
    return {
      get(store, key) {
        const kp = STORES[store] || 'id';
        return arr(data[store]).find((r) => r && r[kp] === key) || null;
      },
      list,
      count(store) { return arr(data[store]).length; },
    };
  }

  return {
    id, todayStr, dateStr, addDays, daysBetween, weekStart, fmtDate, fmtTime, fmtDateTime, hourOf, isNight,
    term, greeting, companionName,
    xpFromEvents, mastery, regionLevels, momentum, rank, badges, modulesDone, lessonsDone, counters, gameState,
    makeView, STORES,
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Engine;
