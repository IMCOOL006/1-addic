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

  /* Valid events (a type and a parseable at), sorted by at then id, each id counted once. Rows and events marked
     sample: true are skipped by every derivation (CORE ruling 10:45): sample data never awards or lowers anything. */
  function cmpStr(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
  function normEvents(events) {
    const list = Array.isArray(events) ? events : (events && typeof events.list === 'function') ? arr(events.list('events')) : [];
    const rows = list.filter((e) => e && e.sample !== true && typeof e.type === 'string' && !isNaN(msOf(e.at)));
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
  /* SkillUsed.helpful is written as a boolean (the contract); 0/1 is tolerated. Any other value
     reads as null and is left out of helpfulAvg (CORE check C1). */
  function helpfulValue(v) {
    if (v === true || v === 1) return 1;
    if (v === false || v === 0) return 0;
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
  /* The highest Content.ranks row whose `when` holds, or null. `explorer`: ExplorerCompleted (the
     UI logs it when explorerDone(view) first holds; the 12 items alone are not used here, since a
     removed plan would un-tick one and a rank never falls). `mN`: module mN is done. */
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
    try { return arr(view.list(store)).filter((r) => r && typeof r === 'object' && r.sample !== true); } catch (_) { return []; }
  }
  function rowOf(view, store, key) {
    if (!view || typeof view.get !== 'function') return null;
    try { const r = view.get(store, key) || null; return r && r.sample === true ? null : r; } catch (_) { return null; }
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
  /* SosCompleted.outcome is 'passed'|'still'|'used' (CORE ruling 10:45); anything else reads as 'other'. */
  const SOS_OUTCOMES = new Set(['passed', 'still', 'used']);
  function sosOutcome(e) {
    const o = (e && e.type) ? pl(e).outcome : (e && typeof e === 'object') ? e.outcome : e;
    return SOS_OUTCOMES.has(o) ? o : 'other';
  }
  function badges(view, now) {
    const ev = normEvents(view);
    const ofType = (t, f) => ev.filter((e) => e.type === t && (!f || f(e)));
    const passed = ofType('SosCompleted', (e) => sosOutcome(e) === 'passed');
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

  /* ── shared readers for rows (U-06) ──────────────────────────────────────────────────────── */

  /* Strings from a payload value: a string, a list, or rows carrying text/label/value/name. */
  function textsOf(v, depth = 0) {
    if (v == null || depth > 3) return [];
    if (typeof v === 'string') return v.trim() ? [v.trim()] : [];
    if (Array.isArray(v)) return v.flatMap((x) => textsOf(x, depth + 1));
    if (typeof v === 'object') {
      for (const k of ['text', 'label', 'value', 'name', 'reason', 'item']) if (typeof v[k] === 'string' && v[k].trim()) return [v[k].trim()];
    }
    return [];
  }
  function uniq(list) {
    const seen = new Set();
    return list.filter((s) => { const k = s.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
  }
  /* The texts under the first of `keys` present in a payload (a bare list counts as the value). */
  function pickTexts(payload, keys) {
    if (Array.isArray(payload)) return uniq(textsOf(payload));
    const p = (payload && typeof payload === 'object') ? payload : {};
    return uniq(keys.flatMap((k) => (own(p, k) ? textsOf(p[k]) : [])));
  }
  function allTexts(payload) {
    if (Array.isArray(payload)) return uniq(textsOf(payload));
    const p = (payload && typeof payload === 'object') ? payload : {};
    return uniq(Object.keys(p).flatMap((k) => textsOf(p[k])));
  }
  const strOf = (x) => (typeof x === 'string' ? x.trim() : '');
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const weekday = (ds) => new Date(utcMs(ds)).getUTCDay();
  /* Real logs only (a drill writes none, and any row marked drill is ignored), with date and hour. */
  function logsOf(view) {
    return rowsOf(view, 'logs').filter((l) => !l.drill && typeof l.type === 'string' && !isNaN(msOf(l.at))).map((l) => Object.assign({}, l, {
      date: DATE_RE.test(String(l.date || '')) ? l.date : dateStr(l.at),
      hour: (Number.isInteger(l.hour) && l.hour >= 0 && l.hour <= 23) ? l.hour : hourOf(l.at),
    })).sort(byAt);
  }
  const checkinOf = (l) => ((l.checkin && typeof l.checkin === 'object') ? l.checkin : {});
  const eveningCheckins = (view) => logsOf(view).filter((l) => l.type === 'checkin' && checkinOf(l).kind === 'evening');
  const safetyNets = (view, activeOnly) => rowsOf(view, 'contacts').filter((c) => c.role === 'safetyNet' && (!activeOnly || c.active !== false));
  const doneEvents = (view, type) => normEvents(view).filter((e) => e.type === type);

  /* ── roadmap (BUILD-PLAN 3.2; the UI never says "overdue") ───────────────────────────────── */

  function paceOf(profile) {
    const p = profile || {};
    const paces = arr(C.paces);
    const pace = paces.find((x) => x.id === p.pace) || paces.find((x) => x.id === 'steady') || { id: 'steady', perWeek: 1 };
    let perWeek = pace.perWeek;
    if (perWeek === null || perWeek === undefined) perWeek = Number(p.customPerWeek) > 0 ? Number(p.customPerWeek) : 1;
    return { id: pace.id, perWeek: Number(perWeek) || 0 };
  }
  /* Modules in Content order, `perWeek` per week from the week of roadmapStart. Free pace: the order
     and progress only (no weeks, no dates). behindWeeks counts weeks since the current module's
     planned week, never below 0. `lessonsDone` (optional) narrows focus.lessonsLeft. */
  function roadmap(profile, modulesDoneSet, now, lessonsDoneSet) {
    const p = profile || {};
    const done = new Set(modulesDoneSet ? [...modulesDoneSet] : []);
    const lessons = new Set(lessonsDoneSet ? [...lessonsDoneSet] : []);
    const mods = arr(C.modules);
    const order = mods.map((m) => m.id);
    const pace = paceOf(p);
    const free = pace.perWeek <= 0;
    const todo = order.filter((id) => !done.has(id));
    const current = todo[0] || null;
    const next = todo[1] || null;
    const cur = mods.find((m) => m.id === current);
    const left = cur ? arr(cur.lessons).filter((l) => !lessons.has(l.id)) : [];
    const focus = cur ? { moduleId: cur.id, lessonsLeft: left.length, minutes: left.reduce((s, l) => s + (Number(l.minutes) || 0), 0), practiceGoal: cur.practiceGoal || null }
      : { moduleId: null, lessonsLeft: 0, minutes: 0, practiceGoal: null };
    if (free) return { order, weeks: [], current, next, focus, behindWeeks: 0, free: true };
    const today = todayStr(now);
    const startDay = dateStr(p.roadmapStart || p.onboardedAt || today) || today;
    const anchor = weekStart(startDay);
    const weekOf = (i) => Math.floor(i / pace.perWeek + 1e-9);
    const byWeek = new Map();
    order.forEach((id, i) => {
      const w = weekOf(i);
      if (!byWeek.has(w)) byWeek.set(w, []);
      byWeek.get(w).push(id);
    });
    const weeks = [...byWeek.keys()].sort((a, b) => a - b).map((w) => {
      const ids = byWeek.get(w);
      return { start: addDays(anchor, w * 7), moduleIds: ids, done: ids.every((id) => done.has(id)) };
    });
    const nowWeek = Math.floor(daysBetween(anchor, weekStart(today)) / 7);
    const behindWeeks = current ? Math.max(0, nowWeek - weekOf(order.indexOf(current))) : 0;
    return { order, weeks, current, next, focus, behindWeeks, free: false };
  }
  /* The first lesson, in module and lesson order, without a LessonCompleted; null when all are done. */
  function nextLesson(view) {
    const done = lessonsDone(view);
    for (const m of arr(C.modules)) for (const l of arr(m.lessons)) if (!done.has(l.id)) return l;
    return null;
  }

  /* ── progressive reveal (3.11) ───────────────────────────────────────────────────────────── */

  function revealed(view) {
    const rv = C.reveal || {};
    const out = new Set(arr(rv.always));
    for (const mid of modulesDone(view)) for (const f of arr(rv[mid])) out.add(f);
    for (const r of rowsOf(view, 'reveals')) if (typeof r.id === 'string' && r.id) out.add(r.id);
    const settings = rowOf(view, 'settings', 'app') || {};
    if (settings.showAll === true) {
      for (const f of Object.keys(C.features || {})) out.add(f);
      for (const k of Object.keys(rv)) for (const f of arr(rv[k])) out.add(f);
    }
    return out;
  }
  function isRevealed(view, featureId) { return revealed(view).has(featureId); }
  /* "New" dots: revealed features beyond the day-one set that have no seenAt yet. */
  function newDots(view) {
    const always = new Set(arr((C.reveal || {}).always));
    const seen = new Set(rowsOf(view, 'reveals').filter((r) => r.seenAt).map((r) => r.id));
    return new Set([...revealed(view)].filter((f) => !always.has(f) && !seen.has(f)));
  }

  /* ── Explorer checklist (3.11): the 12 items, each derived from rows and events ──────────── */

  function tutorialDone(view, tid, allowSkipped) {
    const row = rowsOf(view, 'tutorials').find((r) => r.id === tid);
    if (row && row.completedAt && (allowSkipped || row.skipped !== true)) return true;
    return doneEvents(view, 'TutorialCompleted').some((e) => pl(e).id === tid && (allowSkipped || pl(e).skipped !== true));
  }
  function explorer(view) {
    const ev = normEvents(view);
    const logs = logsOf(view);
    const profile = rowOf(view, 'profile', 'me') || {};
    const plans = rowsOf(view, 'plans');
    const checks = {
      tour: () => tutorialDone(view, 'tour', false),
      drill: () => tutorialDone(view, 'drill', true),
      reasons: () => responsesFor(view, 'quick-reasons').length > 0,
      safetyNet: () => safetyNets(view, true).length > 0,
      log: () => logs.some((l) => l.type === 'craving' || l.type === 'feeling') || ev.some((e) => e.type === 'LogCreated' && ['craving', 'feeling'].includes(pl(e).type)),
      checkin: () => logs.some((l) => l.type === 'checkin' && checkinOf(l).kind === 'evening') || ev.some((e) => e.type === 'CheckinCompleted' && pl(e).kind === 'evening'),
      lesson: () => ev.some((e) => e.type === 'LessonCompleted'),
      workbook: () => rowsOf(view, 'reveals').some((r) => r.id === 'workbook' && r.seenAt),
      plan: () => plans.length > 0,
      breathe: () => ev.some((e) => e.type === 'ExerciseDone' && pl(e).exerciseId === 'breathing'),
      wantTo: () => plans.some((x) => x.kind === 'want'),
      pace: () => typeof profile.pace === 'string' && profile.pace !== '',
    };
    return arr(C.explorer).map((it) => ({ id: it.id, label: it.label, done: own(checks, it.id) ? checks[it.id]() === true : false }));
  }
  /* Done once ExplorerCompleted is logged (append-only, so it stays done) or all 12 items hold. */
  function explorerDone(view) {
    if (doneEvents(view, 'ExplorerCompleted').length) return true;
    const items = explorer(view);
    return items.length > 0 && items.every((x) => x.done);
  }

  /* ── quests (Content.quests): ticked steps, plus the steps the data proves ───────────────── */

  function questDerived(view) {
    const nights = new Set(eveningCheckins(view).map((l) => l.date)).size;
    const preds = rowsOf(view, 'predictions').filter((x) => x.completedAt || (x.actual !== null && x.actual !== undefined)).length;
    const reached = doneEvents(view, 'ContactReached').length;
    const meeting = logsOf(view).some((l) => (l.type === 'activity' && l.activity && l.activity.kind === 'meeting') || (l.type === 'checkin' && checkinOf(l).meeting === true));
    const d = {
      'seven-days': {}, 'prediction-lab': {},
      /* nets counts Safety Nets ever added, as net-weaver does, so a step never un-ticks */
      crew: { nets: safetyNets(view, false).length >= 3, reach1: reached >= 1, reach2: reached >= 2, meeting },
    };
    for (let i = 1; i <= 7; i++) d['seven-days']['c' + i] = nights >= i;
    for (let i = 1; i <= 5; i++) d['prediction-lab']['p' + i] = preds >= i;
    return d;
  }
  function quests(view) {
    const derived = questDerived(view);
    const out = {};
    for (const q of arr(C.quests)) {
      const row = rowsOf(view, 'quests').find((r) => r.id === q.id) || {};
      const ticks = (row.ticks && typeof row.ticks === 'object') ? row.ticks : {};
      const dq = derived[q.id] || {};
      const steps = arr(q.steps).map((s) => ({ id: s.id, label: s.label, done: Boolean(ticks[s.id]) || dq[s.id] === true }));
      const done = steps.filter((s) => s.done).length;
      out[q.id] = { steps, done, total: steps.length, complete: Boolean(row.completedAt) || (steps.length > 0 && done === steps.length) };
    }
    return out;
  }

  /* ── artifacts: the latest non-draft response is the artifact ────────────────────────────── */

  function latest(view, exerciseId) {
    const rows = responsesFor(view, exerciseId);
    return rows.length ? rows[rows.length - 1] : null;
  }
  function history(view, exerciseId) { return responsesFor(view, exerciseId).slice().reverse(); }
  const payloadOf = (r) => (r && r.payload && typeof r.payload === 'object') ? r.payload : {};
  /* The Reasons Card in its four lists (3.2): quick reasons, drawbacks of using and benefits of
     changing (balance), and what would be different (four-lenses). */
  function reasonsCardSections(view) {
    const q = latest(view, 'quick-reasons');
    const b = payloadOf(latest(view, 'balance'));
    const f = payloadOf(latest(view, 'four-lenses'));
    let quick = pickTexts(q && q.payload, ['reasons', 'quick', 'items', 'list']);
    if (!quick.length && q) quick = allTexts(q.payload);
    return {
      quick,
      drawbacks: pickTexts(b, ['drawbacks', 'usingCons', 'cons']),
      benefits: pickTexts(b, ['benefits', 'changePros', 'pros']),
      different: pickTexts(f, ['different', 'differences', 'future']),
    };
  }
  /* The contract shape SOS reads (CORE 09:33): every reason as one list, in the 3.2 order. */
  function reasonsCard(view) {
    const s = reasonsCardSections(view);
    return uniq([...s.quick, ...s.drawbacks, ...s.benefits, ...s.different]);
  }
  /* Comebacks from Put It On Trial: the closing statement answers the thought; newest first. */
  function comebackRows(view) {
    return history(view, 'trial').map((r) => {
      const p = payloadOf(r);
      const response = strOf(p.comeback) || strOf(p.closing) || strOf(p.verdict) || strOf(p.response) || strOf(p.reply);
      return { thought: strOf(p.thought), response, at: r.at };
    }).filter((c) => c.response);
  }
  function comebacks(view) { return uniq(comebackRows(view).map((c) => c.response)); }
  /* The person's own distractions, else the catalog's. */
  function distractionDeck(view) {
    const r = latest(view, 'distractions');
    let own = pickTexts(r && r.payload, ['distractions', 'deck', 'picks', 'items', 'own', 'custom']);
    if (!own.length && r) own = allTexts(r.payload);
    return own.length ? own : uniq(textsOf(C.catalogs && C.catalogs.distractions));
  }
  /* The person's spiral thoughts with their replies; a missing reply takes a slip self-talk line. */
  function spiralThoughts(view) {
    const p = payloadOf(latest(view, 'spiral'));
    const replies = textsOf(C.catalogs && C.catalogs.slipSelfTalk);
    let pairs = arr(p.pairs).map((x) => (typeof x === 'string' ? { thought: x.trim(), reply: '' }
      : { thought: strOf(x && x.thought), reply: strOf(x && (x.reply || x.rebuttal || x.answer)) }));
    if (!pairs.length) {
      const own = arr(p.replies);
      pairs = pickTexts(p, ['thoughts', 'items', 'checked', 'picks']).map((t, i) => ({ thought: t, reply: strOf(own[i]) }));
    }
    return pairs.filter((x) => x.thought).map((x, i) => ({ thought: x.thought, reply: x.reply || replies[i % (replies.length || 1)] || '' }));
  }
  /* Trigger chips: the catalog plus the person's own, flagged from the latest `triggers` response
     (experienced = mine, frequent = starred, anger = tagged); frequent first, then mine, then the rest. */
  function triggerChips(view) {
    const cat = (C.catalogs && C.catalogs.triggers) || {};
    const chips = [];
    const byKey = new Map();
    const add = (kind, label) => {
      const l = strOf(label);
      if (!l) return null;
      const key = kind + ':' + slug(l);
      if (!byKey.has(key)) { const c = { id: key, label: l, kind, frequent: false, anger: false, mine: false }; byKey.set(key, c); chips.push(c); }
      return byKey.get(key);
    };
    for (const kind of Object.keys(cat)) for (const l of textsOf(cat[kind])) add(kind, l);
    const p = payloadOf(latest(view, 'triggers'));
    const lists = { frequent: new Set(pickTexts(p, ['frequent', 'starred']).map((s) => s.toLowerCase())), anger: new Set(pickTexts(p, ['anger', 'angerTriggers']).map((s) => s.toLowerCase())) };
    const mark = (c, x) => {
      if (!c) return;
      c.mine = true;
      if ((x && x.frequent === true) || lists.frequent.has(c.label.toLowerCase())) c.frequent = true;
      if ((x && x.anger === true) || lists.anger.has(c.label.toLowerCase())) c.anger = true;
    };
    for (const x of arr(p.items)) if (x && typeof x === 'object') mark(add(strOf(x.kind) || 'custom', x.label || x.text), x);
    for (const kind of Object.keys(cat).concat(['custom'])) for (const x of arr(p[kind])) mark(add(kind, typeof x === 'string' ? x : x && (x.label || x.text)), typeof x === 'object' ? x : null);
    for (const c of chips) if (!c.mine && (c.frequent || c.anger)) c.mine = true;
    const rank = (c) => (c.frequent ? 0 : c.mine ? 1 : 2);
    return chips.map((c, i) => [c, i]).sort((a, b) => (rank(a[0]) - rank(b[0])) || (a[1] - b[1])).map((x) => x[0]);
  }

  /* ── skill ranking (shared by the plan prefill and U-07 insights): mean helpful x ln(uses+1);
     a skill never rated counts as 0.5 (neutral) so a used skill is not dropped for lack of a rating */
  function rankSkills(view) {
    const m = mastery(view);
    return Object.keys(m).map((sid) => {
      const s = arr(C.skills).find((x) => x.id === sid) || {};
      const h = m[sid].helpfulAvg === null ? 0.5 : m[sid].helpfulAvg;
      return { skillId: sid, name: s.name || sid, kind: s.kind || null, region: s.region || null, uses: m[sid].uses, helpfulAvg: m[sid].helpfulAvg,
        score: Math.round(h * Math.log(m[sid].uses + 1) * 1000) / 1000 };
    }).sort((a, b) => (b.score - a.score) || (b.uses - a.uses) || cmpStr(a.skillId, b.skillId));
  }
  /* Trigger ids counted over craving logs, most frequent first (ties by first seen). */
  function triggerCounts(view) {
    const counts = new Map();
    for (const l of logsOf(view)) if (l.type === 'craving') for (const t of arr(l.triggerIds)) if (typeof t === 'string' && t) counts.set(t, (counts.get(t) || 0) + 1);
    return [...counts.entries()].map(([tid, count], i) => ({ id: tid, count, i })).sort((a, b) => (b.count - a.count) || (a.i - b.i)).map(({ id: tid, count }) => ({ id: tid, count }));
  }
  function chipLabel(chips, tid) {
    const c = chips.find((x) => x.id === tid);
    return c ? c.label : String(tid).replace(/^[a-z]+:/, '').replace(/-/g, ' ');
  }

  /* ── tips (3.11): one a day, Today only, never on an SOS route, switchable, none repeated
     within 14 days; the first rule that holds, in content order ──────────────────────────── */

  const TIP_RULES = {
    /* a red-flag craving log in the last 14 days and no trial response since it */
    redFlagLogNoTrial: (x) => {
      const flagged = x.logs.filter((l) => l.type === 'craving' && (l.redFlag || strOf(l.thought)) && l.date >= x.minus(13));
      if (!flagged.length) return false;
      const last = flagged[flagged.length - 1];
      return !responsesFor(x.view, 'trial').some((r) => msOf(r.at) >= msOf(last.at));
    },
    /* 3 or more craving logs from 18:00 in the last 14 days and nothing planned for today */
    eveningCravings: (x) => x.logs.filter((l) => l.type === 'craving' && l.hour >= 18 && l.date >= x.minus(13)).length >= 3
      && !rowsOf(x.view, 'plans').some((p) => p.date === x.today),
    /* fewer than 3 reasons on the Reasons Card */
    thinReasons: (x) => reasonsCard(x.view).length < 3,
    /* exactly one active Safety Net */
    oneSafetyNet: (x) => safetyNets(x.view, true).length === 1,
    /* no practice (ExerciseDone of kind practice, or MindfulMinute) in the last 7 days */
    noPractice: (x) => !x.ev.some((e) => (e.type === 'MindfulMinute' || (e.type === 'ExerciseDone' && pl(e).kind === 'practice')) && dateStr(e.at) >= x.minus(6)),
    /* 10 or more rows worth keeping and no backup in the last 30 days */
    noBackup: (x) => (x.ev.length + x.logs.length) >= 10 && (!x.settings.lastBackupAt || isNaN(msOf(x.settings.lastBackupAt)) || dateStr(x.settings.lastBackupAt) < x.minus(29)),
    /* fewer than 3 days of momentum, for someone who has started (at least one event) */
    lowMomentum: (x) => x.ev.length > 0 && momentum(x.ev, x.now).days < 3,
    /* no want-to planned for today or the next 6 days */
    noWantTo: (x) => !rowsOf(x.view, 'plans').some((p) => p.kind === 'want' && p.date >= x.today && p.date <= addDays(x.today, 6)),
    /* today is the review day and no Weekly Review in the last 6 days */
    reviewDue: (x) => weekday(x.today) === (Number.isInteger(x.profile.reviewDay) ? x.profile.reviewDay : 0)
      && !x.ev.some((e) => e.type === 'WeeklyReviewCompleted' && dateStr(e.at) >= x.minus(6)),
  };
  function pickTip(view, now, ctx) {
    const route = ctx && typeof ctx.route === 'string' ? ctx.route : '';
    if (route.startsWith('#/sos')) return null;
    const settings = rowOf(view, 'settings', 'app') || {};
    const today = todayStr(now);
    if (settings.tips === false || settings.lastTipDay === today) return null;
    const shown = rowsOf(view, 'tips').filter((t) => !isNaN(msOf(t.shownAt)));
    if (shown.some((t) => dateStr(t.shownAt) === today)) return null;
    const recent = new Set(shown.filter((t) => daysBetween(dateStr(t.shownAt), today) < 14).map((t) => t.id));
    const x = { view, now, today, settings, profile: rowOf(view, 'profile', 'me') || {}, ev: normEvents(view), logs: logsOf(view), minus: (k) => addDays(today, -k) };
    for (const tip of arr(C.tips)) {
      if (recent.has(tip.id) || !own(TIP_RULES, tip.when)) continue;
      if (TIP_RULES[tip.when](x) === true) return Object.assign({}, tip);
    }
    return null;
  }

  /* ── My Recovery Plan prefill (3.10): nine sections, each a list of strings, unconfirmed ─── */

  const ROLE_WORD = { safetyNet: 'Safety Net', sponsor: 'sponsor', therapist: 'therapist' };
  function prefillRecoveryPlan(view, now) {
    const sec = (items) => ({ items: uniq(items.filter((s) => typeof s === 'string' && s.trim()).map((s) => s.trim())), confirmed: false });
    const ranked = rankSkills(view).filter((s) => s.score > 0);
    const topKind = (kind, n) => ranked.filter((s) => s.kind === kind).slice(0, n).map((s) => s.name);
    const mot = rowsOf(view, 'motivation').filter((r) => !isNaN(msOf(r.at))).sort(byAt);
    const lastPlus = [...mot].reverse().map((r) => strOf(r.plusOne)).find(Boolean);
    const people = rowsOf(view, 'contacts').filter((c) => c.active !== false && own(ROLE_WORD, c.role) && strOf(c.name))
      .map((c) => `${strOf(c.name)} (${ROLE_WORD[c.role]})`);
    const chips = triggerChips(view);
    const triggers = chips.filter((c) => c.frequent).map((c) => c.label).concat(triggerCounts(view).slice(0, 5).map((t) => chipLabel(chips, t.id)));
    const ws = payloadOf(latest(view, 'warning-signs'));
    const signs = arr(C.catalogs && C.catalogs.warningSigns);
    const warnings = arr(ws.top || ws.picks || ws.topN).slice(0, 3).map((x) => {
      const sid = typeof x === 'string' ? x : x && (x.id || x.sign || x.signId);
      const label = (signs.find((s) => s.id === sid) || {}).label || strOf(x && x.label) || strOf(sid);
      const plan = strOf(x && x.plan);
      return label ? (plan ? `${label}: ${plan}` : label) : '';
    });
    const risky = new Map();
    for (const pi of rowsOf(view, 'plans').filter((p) => p.battlePlan && typeof p.battlePlan === 'object')) {
      const situation = strOf(pi.battlePlan.situation) || strOf(pi.title);
      if (!situation) continue;
      const k = situation.toLowerCase();
      const cur = risky.get(k) || { situation, plan: '', count: 0, date: '' };
      cur.count += 1;
      if (String(pi.date || '') >= cur.date) { cur.date = String(pi.date || ''); cur.plan = strOf(pi.battlePlan.plan) || cur.plan; }
      risky.set(k, cur);
    }
    const battlePlans = [...risky.values()].sort((a, b) => (b.count - a.count) || cmpStr(b.date, a.date)).map((r) => (r.plan ? `${r.situation}: ${r.plan}` : r.situation));
    const support = pickTexts(payloadOf(latest(view, 'slip-review')), ['support']).concat(pickTexts(payloadOf(latest(view, 'expand-network')), ['support']));
    return {
      motivation: sec(reasonsCard(view).concat(lastPlus ? [lastPlus] : [])),
      wellness: sec(topKind('wellness', 6)),
      situation: sec(topKind('situation', 6)),
      people: sec(people),
      mood: sec(topKind('mood', 3)),
      triggers: sec(triggers),
      warnings: sec(warnings),
      battlePlans: sec(battlePlans),
      support: sec(support),
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
    roadmap, nextLesson, revealed, isRevealed, newDots, explorer, explorerDone, pickTip, quests,
    latest, history, reasonsCard, reasonsCardSections, comebacks, comebackRows, distractionDeck, spiralThoughts, triggerChips,
    prefillRecoveryPlan, sosOutcome,
    makeView, STORES,
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Engine;
