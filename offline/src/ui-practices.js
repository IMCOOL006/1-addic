/* 1-addic · ui-practices.js · the guided practices player (BUILD-PLAN 3.5 #/practice/<id>; section 5 U-25; lane actions).
   #/practice lists the practices; #/practice/<id> plays one: the intro, then the script one line at a time (always on
   screen; "Read aloud" only through UI.speak, the device's own speech, O4), pause and resume, a countdown timer from the
   practice's minutes (breathe offers its ladder, 5 to 30 minutes; no pacing animation), then an optional reflection
   and "Did it help?" (0-10). Finish writes, through Actions, ExerciseDone {exerciseId, practiceId, kind:'practice',
   minutes, helpful?, reflection?} and, when at least one whole minute was practised, MindfulMinute {minutes}. No
   SkillUsed, no score, no streak. The scripts are the content lane's (Content.practices, a map by id of
   {id, title, minutes, intro, script:[{t, secs}], close}); when they are absent the player says so and offers the way
   back (O7). Nothing here covers or delays SOS: there is no sheet or overlay, and pause or the timer block nothing.
   Content and UI are read through typeof guards (they are not globalThis properties in the built page). */
const PracticesUI = (() => {
  const TEXT = {
    listTitle: 'Practices',
    listIntro: 'Short guided practices. Pick one and go at your own pace.',
    minutes: (n) => (n === 1 ? 'About 1 minute' : `About ${n} minutes`),
    open: 'Start',
    writing: 'This practice is being written. It comes in a later update.',
    noneYet: 'The practices are being written. They come in a later update.',
    backList: 'All practices',
    backHub: 'Back to Actions',
    begin: 'Begin',
    length: 'How long',
    lengthOpt: (n) => `${n} minutes`,
    readAloud: 'Read aloud',
    stopReading: 'Stop reading',
    noVoice: 'No voice on this device; read it on screen.',
    pause: 'Pause',
    resume: 'Resume',
    prevLine: 'Back a line',
    nextLine: 'Next line',
    stop: 'Finish',
    left: (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} left`,
    paused: 'Paused',
    line: (i, n) => `Line ${i} of ${n}`,
    timeUp: 'Time is up. Well done for staying with it.',
    reflectTitle: 'How was that?',
    reflectLabel: 'Anything you noticed (optional)',
    helpfulLabel: 'Did it help? 0 is not at all, 10 is a lot (optional)',
    helpfulSkip: 'Rather not say',
    save: 'Save and finish',
    doneTitle: 'Practice saved',
    doneMins: (n) => (n === 1 ? 'You practised for 1 minute.' : `You practised for ${n} minutes.`),
    doneShort: 'That was under a minute. Short practice is still practice.',
    again: 'Do it again',
    error: 'That did not save. Please try again.',
    help: 'If things feel heavy right now, help is one tap away.',
    helpGo: 'Get help now',
    soberSos: 'In a hard moment right now? SOS has this too, one tap away.',
    soberSosGo: 'Open SOS',
  };
  /* The practice the Engine's explorer list knows by its exercise id (engine.js explorer check 'breathe'). */
  const EXERCISE_ID = { breathe: 'breathing' };
  const ORDER = ['breathe', 'body-scan', 'sober', 'urge-surf', 'shower', 'eating', 'walking', 'beat'];

  const arr = (x) => (Array.isArray(x) ? x : []);
  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  const str = (v) => (typeof v === 'string' ? v.trim() : '');
  const safe = (fn, dflt) => { try { const v = fn(); return v === undefined ? dflt : v; } catch (e) { return dflt; } };
  const ns = (name) => {
    try {
      if (name === 'Content') return typeof Content !== 'undefined' ? Content : null;
      if (name === 'Engine') return typeof Engine !== 'undefined' ? Engine : null;
      if (name === 'Actions') return typeof Actions !== 'undefined' ? Actions : null;
      if (name === 'UI') return typeof UI !== 'undefined' ? UI : null;
    } catch (e) { /* absent */ }
    return null;
  };
  const posInt = (n, max) => (Number.isInteger(n) && n >= 1 && n <= max ? n : 0);

  /* ── pure data ─────────────────────────────────────────────────────────────────────────── */
  /* The practices map, from an object keyed by id or an array of {id,...}; null when there is none. */
  function practicesOf(C) {
    const p = C && (isObj(C) || typeof C === 'function') ? safe(() => C.practices, null) : null;
    if (Array.isArray(p)) { const o = {}; for (const x of p) if (isObj(x) && str(x.id)) o[str(x.id)] = x; return Object.keys(o).length ? o : null; }
    return isObj(p) && Object.keys(p).length ? p : null;
  }
  const lineText = (x) => (typeof x === 'string' ? x.trim() : isObj(x) ? str(x.t) || str(x.text) : '');
  /* One practice as the player reads it: {id, title, minutes, intro, close, steps:[string], secs:[number], ladder}, or
     null when there is no script for the id. Lines come from script ({t, secs}), else steps, else lines. */
  function practiceScript(C, id) {
    const all = practicesOf(C);
    const key = str(id);
    if (!all || !key || !Object.prototype.hasOwnProperty.call(all, key) || !isObj(all[key])) return null;
    const p = all[key];
    const src = arr(p.script).length ? p.script : arr(p.steps).length ? p.steps : arr(p.lines);
    const rows = src.map((x) => ({ t: lineText(x), secs: isObj(x) && Number.isFinite(x.secs) && x.secs > 0 ? Math.round(x.secs) : 0 })).filter((r) => r.t);
    if (!rows.length) return null;
    const minutes = posInt(p.minutes, 600) || Math.max(1, Math.round(rows.reduce((s, r) => s + (r.secs || 20), 0) / 60));
    const ladder = arr(p.ladder).filter((n) => posInt(n, 600)).sort((a, b) => a - b);
    return { id: key, title: str(p.title) || key, minutes, intro: str(p.intro), close: str(p.close),
      steps: rows.map((r) => r.t), secs: rows.map((r) => r.secs || 20), ladder };
  }
  /* The list page's rows: every practice that has a script, in the usual order. */
  function practiceList(C) {
    const all = practicesOf(C);
    if (!all) return [];
    const ids = Object.keys(all).sort((a, b) => (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99));
    return ids.map((id) => practiceScript(C, id)).filter(Boolean).map((s) => ({ id: s.id, title: s.title, minutes: s.minutes }));
  }
  /* Whole minutes actually practised (0 under a minute; at most 600). */
  const minutesCredit = (ms) => (Number.isFinite(ms) && ms > 0 ? Math.min(600, Math.floor(ms / 60000)) : 0);
  /* The events a finished practice writes: [type, payload] pairs. helpful is 0-10 or left out; reflection <= 1000. */
  function practiceEvents(id, o) {
    const d = o || {};
    const minutes = minutesCredit(d.elapsedMs);
    const done = { exerciseId: EXERCISE_ID[id] || id, practiceId: id, kind: 'practice', minutes };
    const hv = d.helpful === '' || d.helpful == null ? NaN : Number(d.helpful);
    if (Number.isInteger(hv) && hv >= 0 && hv <= 10) done.helpful = hv;
    const r = str(d.reflection).slice(0, 1000);
    if (r) done.reflection = r;
    const out = [['ExerciseDone', done]];
    if (minutes >= 1) out.push(['MindfulMinute', { minutes }]);
    return out;
  }
  /* Writes them through Actions.recordEvent: {ok, minutes} or {ok:false, message}. */
  async function finishPractice(A, id, o) {
    const evs = practiceEvents(id, o);
    try {
      if (!A || typeof A.recordEvent !== 'function') throw new Error('no actions');
      for (const [type, pl] of evs) await A.recordEvent(type, pl);
      return { ok: true, minutes: evs[0][1].minutes };
    } catch (e) {
      return { ok: false, message: TEXT.error };
    }
  }
  const crisisIn = (E, text) => !!E && typeof E.crisisKeywords === 'function' && safe(() => arr(E.crisisKeywords(String(text || ''))).length > 0, false);

  /* ── DOM ───────────────────────────────────────────────────────────────────────────────── */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    const a = attrs || {};
    if (a.text != null) el.textContent = String(a.text);
    for (const k of Object.keys(a)) {
      const v = a[k];
      if (k === 'text' || k === 'value' || k === 'checked' || v == null || v === false) continue;
      if (/^on[A-Z]/.test(k) && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (/^on/i.test(k)) continue;
      else el.setAttribute(k, v === true ? '' : String(v));
    }
    for (const c of kids.flat(3)) {
      if (c == null || c === false || c === true) continue;
      el.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
    }
    if (a.value != null) el.value = String(a.value);
    return el;
  }
  const link = (href, text, cls, test, extra) => h('a', Object.assign({ href, class: cls || 'btn', text, 'data-test': test }, extra || {}));
  const button = (text, onClick, cls, test, extra) => h('button', Object.assign({ type: 'button', class: cls || 'btn', text, 'data-test': test, onClick }, extra || {}));
  const clear = (el) => { el.textContent = ''; };
  let uid = 0;
  const fid = (n) => 'prc-' + n + '-' + (++uid);

  function listPage() {
    const rows = practiceList(ns('Content'));
    return h('div', { class: 'page stack act-page prc-page', 'data-test': 'practice-list' },
      h('h1', { class: 'page-title', text: TEXT.listTitle }),
      h('p', { class: 'muted', text: rows.length ? TEXT.listIntro : TEXT.noneYet }),
      rows.length ? h('ul', { class: 'prc-list' }, rows.map((r) => h('li', { class: 'card prc-item', 'data-test': 'practice-item' },
        h('h2', { class: 'card-title', text: r.title }), h('p', { class: 'muted', text: TEXT.minutes(r.minutes) }),
        h('div', { class: 'row' }, link('#/practice/' + encodeURIComponent(r.id), TEXT.open, 'btn primary', 'practice-open', { 'aria-label': `${TEXT.open}: ${r.title}` }))))) : null,
      h('div', { class: 'row' }, link('#/actions', TEXT.backHub, 'btn ghost', 'actions-back')));
  }
  function stubPage(id) {
    return h('div', { class: 'page stack act-page prc-page', 'data-test': 'practice-stub' },
      h('h1', { class: 'page-title', text: TEXT.listTitle }),
      h('p', { text: TEXT.writing }),
      id === 'sober' ? soberSos() : null,
      h('div', { class: 'row' }, link('#/practice', TEXT.backList, 'btn', 'practice-back'), link('#/actions', TEXT.backHub, 'btn ghost', 'actions-back')));
  }
  const soberSos = () => h('p', { class: 'tip prc-sos', 'data-test': 'practice-sos' }, TEXT.soberSos + ' ', link('#/sos', TEXT.soberSosGo, 'btn', 'practice-sos-go'));

  /* Sessions live out here (this page load only, never stored): ui-core builds a new page when the Store changes, and
     a practice keeps its place, its timer and its saved screen across that. */
  const SESSIONS = new Map();
  let live = null; // {root, paint}: the page on screen, which the one-second tick repaints
  let ticker = null;
  const fresh = (s) => ({ phase: 'intro', idx: 0, running: false, acc: 0, since: 0, lineAt: 0, chosen: s.minutes, voice: false, noVoice: false,
    helpful: '', reflection: '', message: '', help: false, timeUp: false, saved: null });

  function playerPage(ctx, s) {
    const U = ns('UI');
    const E = ctx && ctx.E !== undefined ? ctx.E : ns('Engine');
    const A = ctx && ctx.A !== undefined ? ctx.A : ns('Actions');
    const nowMs = () => (ctx && typeof ctx.nowMs === 'function' ? ctx.nowMs() : Date.now());
    if (!SESSIONS.has(s.id)) SESSIONS.set(s.id, fresh(s));
    const st = SESSIONS.get(s.id);
    const root = h('div', { class: 'page stack act-page prc-page', 'data-test': 'practice', 'data-practice': s.id });
    const elapsed = () => st.acc + (st.running ? Math.max(0, nowMs() - st.since) : 0);
    const say = (text) => {
      if (!st.voice) return;
      const ok = !!(U && typeof U.speak === 'function' && safe(() => U.speak(text), false));
      if (!ok) { st.voice = false; st.noVoice = true; }
    };
    const hush = () => { if (U && typeof U.stopSpeaking === 'function') safe(() => U.stopSpeaking(), null); };
    const pause = () => { if (st.running) { st.acc = elapsed(); st.running = false; } hush(); };
    const resume = () => { if (!st.running) { st.since = nowMs(); st.running = true; } say(s.steps[st.idx]); };
    const toReflect = (up) => { pause(); st.phase = 'reflect'; st.timeUp = !!up; if (up) say(s.close); };
    const goLine = (i) => { st.idx = Math.max(0, Math.min(s.steps.length - 1, i)); st.lineAt = elapsed(); say(s.steps[st.idx]); };
    const focusOn = (sel) => { const f = safe(() => root.querySelector(sel), null); if (f && typeof f.focus === 'function') safe(() => f.focus(), null); };

    /* one tick: move the line on after its pause, end at the time chosen; stops when the page has gone */
    const tick = () => {
      if (st.phase !== 'run' || !st.running) return;
      const t = elapsed();
      if (t >= st.chosen * 60000) { toReflect(true); stopTicker(); paintKeep(); return; }
      if (st.idx < s.steps.length - 1 && t - st.lineAt >= s.secs[st.idx] * 1000) { goLine(st.idx + 1); paintKeep(); return; }
      if (refs.timer) refs.timer.textContent = timerText(); // only the time changes: focus stays where it is
    };
    /* repaint and put the focus back on the control that had it */
    const paintKeep = () => {
      const a = safe(() => document.activeElement, null);
      const t = a && typeof a.getAttribute === 'function' ? a.getAttribute('data-test') : null;
      paint();
      if (t) focusOn(`[data-test="${t}"]`);
    };
    const refs = { timer: null };
    const timerText = () => {
      const left = Math.max(0, Math.ceil((st.chosen * 60000 - elapsed()) / 1000));
      return st.running ? TEXT.left(left) : `${TEXT.paused} · ${TEXT.left(left)}`;
    };
    const startTicker = () => {
      if (ticker || typeof setInterval !== 'function') return;
      ticker = setInterval(() => {
        if (!live || live.root.isConnected === false) { for (const x of SESSIONS.values()) if (x.running) { x.acc += Math.max(0, Date.now() - x.since); x.running = false; } hush(); clearInterval(ticker); ticker = null; return; }
        live.tick();
      }, 1000);
      safe(() => ticker.unref && ticker.unref(), null);
    };
    const stopTicker = () => { if (ticker) { clearInterval(ticker); ticker = null; } };

    const voiceRow = () => h('div', { class: 'row prc-voice' },
      st.voice ? button(TEXT.stopReading, () => { st.voice = false; hush(); paint(); focusOn('[data-test="practice-voice"]'); }, 'btn ghost', 'practice-voice', { 'aria-pressed': 'true' })
        : button(TEXT.readAloud, () => { st.voice = true; st.noVoice = false; say(st.phase === 'run' ? s.steps[st.idx] : s.intro || s.title); paint(); focusOn('[data-test="practice-voice"]'); }, 'btn ghost', 'practice-voice', { 'aria-pressed': 'false' }),
      st.noVoice ? h('p', { class: 'muted prc-novoice', role: 'status', 'data-test': 'practice-novoice', text: TEXT.noVoice }) : null);

    function intro() {
      const lenId = fid('len');
      const out = [h('p', { text: s.intro }), voiceRow()];
      if (s.ladder.length) {
        const sel = h('select', { id: lenId, 'data-test': 'practice-length', value: String(st.chosen) },
          s.ladder.map((n) => h('option', { value: String(n), text: TEXT.lengthOpt(n) })));
        sel.addEventListener('change', () => { const n = Number(sel.value); if (posInt(n, 600)) st.chosen = n; });
        out.push(h('div', { class: 'field' }, h('label', { class: 'field-label', for: lenId, text: TEXT.length }), sel));
      } else out.push(h('p', { class: 'muted', text: TEXT.minutes(s.minutes) }));
      out.push(h('div', { class: 'row' }, button(TEXT.begin, () => {
        st.phase = 'run'; st.idx = 0; st.acc = 0; st.lineAt = 0; st.running = true; st.since = nowMs(); say(s.steps[0]); startTicker(); paint(); focusOn('[data-test="practice-pause"]');
      }, 'btn primary', 'practice-start', { 'data-testid': 'practice-start' })));
      return out;
    }
    function run() {
      refs.timer = h('p', { class: 'prc-timer', role: 'timer', 'aria-live': 'off', 'data-test': 'practice-timer', text: timerText() });
      return [
        refs.timer,
        h('p', { class: 'muted prc-count', text: TEXT.line(st.idx + 1, s.steps.length) }),
        h('p', { class: 'prc-line', 'aria-live': 'polite', 'data-test': 'practice-line', text: s.steps[st.idx] }),
        h('div', { class: 'row prc-lines' },
          button(TEXT.prevLine, () => { goLine(st.idx - 1); paint(); }, 'btn ghost', 'practice-prev', { disabled: st.idx === 0 }),
          button(TEXT.nextLine, () => { goLine(st.idx + 1); paint(); }, 'btn ghost', 'practice-next', { disabled: st.idx >= s.steps.length - 1 })),
        voiceRow(),
        h('div', { class: 'row form-actions' },
          st.running ? button(TEXT.pause, () => { pause(); paint(); focusOn('[data-test="practice-pause"]'); }, 'btn', 'practice-pause', { 'data-testid': 'practice-pause', 'aria-pressed': 'false' })
            : button(TEXT.resume, () => { resume(); startTicker(); paint(); focusOn('[data-test="practice-pause"]'); }, 'btn', 'practice-pause', { 'data-testid': 'practice-pause', 'aria-pressed': 'true' }),
          button(TEXT.stop, () => { toReflect(false); stopTicker(); paint(); focusOn('.prc-reflect textarea'); }, 'btn primary', 'practice-stop')),
      ];
    }
    function reflect() {
      const ids = { r: fid('r'), hp: fid('hp'), err: fid('err') };
      const ta = h('textarea', { id: ids.r, maxlength: '1000', rows: '3', 'data-test': 'practice-reflection', value: st.reflection });
      const sel = h('select', { id: ids.hp, 'data-test': 'practice-helpful', value: st.helpful },
        h('option', { value: '', text: TEXT.helpfulSkip }), Array.from({ length: 11 }, (_, i) => h('option', { value: String(i), text: String(i) })));
      ta.addEventListener('input', () => { st.reflection = ta.value; });
      sel.addEventListener('change', () => { st.helpful = sel.value; });
      const err = h('p', { id: ids.err, class: 'field-error act-form-error', role: 'alert', tabindex: '-1', 'data-test': 'practice-error', text: st.message || '' });
      if (!st.message) { err.hidden = true; err.setAttribute('hidden', ''); }
      const save = async () => {
        st.reflection = ta.value; st.helpful = sel.value;
        const r = await finishPractice(A, s.id, { elapsedMs: st.acc, helpful: st.helpful, reflection: st.reflection });
        if (!r.ok) { st.message = r.message; paint(); focusOn('.act-form-error'); return; }
        st.help = crisisIn(E, st.reflection);
        st.message = ''; st.saved = r.minutes; st.phase = 'done';
        paint(); focusOn('.prc-done h2');
      };
      return [
        st.timeUp ? h('p', { class: 'tip', role: 'status', text: TEXT.timeUp }) : null,
        st.timeUp && s.close ? h('p', { text: s.close }) : null,
        h('section', { class: 'card stack prc-reflect', 'aria-labelledby': ids.r + '-h' },
          h('h2', { class: 'card-title', id: ids.r + '-h', text: TEXT.reflectTitle }),
          h('div', { class: 'field' }, h('label', { class: 'field-label', for: ids.r, text: TEXT.reflectLabel }), ta),
          h('div', { class: 'field' }, h('label', { class: 'field-label', for: ids.hp, text: TEXT.helpfulLabel }), sel),
          err,
          h('div', { class: 'row form-actions' }, button(TEXT.save, save, 'btn primary', 'practice-finish', { 'data-testid': 'practice-finish' }))),
      ];
    }
    function done() {
      return [h('section', { class: 'card stack prc-done', 'data-test': 'practice-done', role: 'status' },
        h('h2', { class: 'card-title', tabindex: '-1', text: TEXT.doneTitle }),
        h('p', { text: st.saved >= 1 ? TEXT.doneMins(st.saved) : TEXT.doneShort }),
        st.help ? h('p', { class: 'tip act-help', 'data-test': 'practice-help' }, TEXT.help + ' ', link('#/sos/urgent', TEXT.helpGo, 'btn', 'practice-help-go')) : null,
        h('div', { class: 'row' }, button(TEXT.again, () => { SESSIONS.set(s.id, fresh(s)); Object.assign(st, fresh(s)); paint(); focusOn('[data-test="practice-start"]'); }, 'btn', 'practice-again'),
          link('#/practice', TEXT.backList, 'btn ghost', 'practice-back')))];
    }

    function paint() {
      clear(root);
      refs.timer = null;
      root.appendChild(h('div', { class: 'row act-head' }, link('#/practice', TEXT.backList, 'btn ghost', 'practice-back')));
      root.appendChild(h('h1', { class: 'page-title', text: s.title }));
      if (s.id === 'sober') root.appendChild(soberSos());
      const body = st.phase === 'run' ? run() : st.phase === 'reflect' ? reflect() : st.phase === 'done' ? done() : intro();
      for (const n of body) if (n) root.appendChild(n);
    }
    live = { root, tick };
    if (st.phase === 'run' && st.running) startTicker();
    paint();
    return root;
  }

  function page(ctx) {
    const parts = ctx && ctx.route && Array.isArray(ctx.route.parts) ? ctx.route.parts : [];
    const id = safe(() => decodeURIComponent(parts[1] || ''), '');
    if (!id) return listPage(ctx);
    const s = practiceScript(ns('Content'), id);
    return s ? playerPage(ctx, s) : stubPage(id);
  }
  /* For tests: forget every session and stop the tick. */
  const forgetSessions = () => { SESSIONS.clear(); live = null; if (ticker) { clearInterval(ticker); ticker = null; } };

  const PURE = ['practicesOf', 'practiceScript', 'practiceList', 'minutesCredit', 'practiceEvents', 'finishPractice'];
  return { page, TEXT, PURE, forgetSessions, practicesOf, practiceScript, practiceList, minutesCredit, practiceEvents, finishPractice };
})();

// The page registers from this file (contracts/core.md: UI.pages[firstSegment]); ui-core.js is not changed.
if (typeof UI !== 'undefined' && UI && UI.pages) UI.pages.practice = (ctx) => PracticesUI.page(ctx);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
  for (const k of PracticesUI.PURE) module.exports[k] = PracticesUI[k];
}
