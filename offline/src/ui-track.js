/* 1-addic · ui-track.js · the Track screen (BUILD-PLAN 3.5 #/track, section 5 U-16; lane today-track).
   The quick log (+) for a craving, a feeling, a check-in, an activity or a slip; the timeline, newest first;
   the opt-in counters. Every log saves through its Actions verb (logCraving, logFeeling, checkin, logActivity,
   logSlip); an Actions error is shown in words and the form keeps its values. A slip restarts only the opt-in
   current run and lowers no total. Nothing here decreases, nothing is a dead button (O7), SOS is one tap away.
   Words are original, person-first, grade 6-8. Content, Engine, Store are read through typeof guards. */
const TrackUI = (() => {
  /* ── words ─────────────────────────────────────────────────────────────────────────────── */
  const TEXT = {
    title: 'Track',
    add: '+ Log',
    addLabel: 'Add a log',
    sos: 'SOS', help: 'Help',
    chooseTitle: 'What do you want to log?',
    kinds: {
      craving: { word: 'Craving', title: 'Log a craving', hint: 'An urge, how strong it was and what set it off.' },
      feeling: { word: 'Feeling', title: 'Log a feeling', hint: 'A strong feeling and what was going on.' },
      checkin: { word: 'Check-in', title: 'Check-in', hint: 'A short morning or evening look at your day.' },
      activity: { word: 'Activity', title: 'Log an activity', hint: 'Exercise, a mindful moment, a meeting or something you enjoy.' },
      slip: { word: 'Slip', title: 'Note a slip', hint: 'Write down what happened, so your plan can learn from it.' },
    },
    intensity: 'How strong was it? (0 is none, 10 is the strongest)',
    feelingIntensity: 'How strong was the feeling? (0 to 10)',
    emotion: 'Which feeling was it?',
    triggers: 'What set it off?',
    moreTriggers: 'More triggers',
    thought: 'What went through your mind? (optional)',
    redFlag: 'It was a red-flag thought (a thought that pulls toward using)',
    tried: 'What did you try? (optional)',
    helped: 'What helped? (optional)',
    skillsMore: 'Skills',
    notes: 'Notes (optional)',
    morning: 'Morning', evening: 'Evening',
    checkinKind: 'Which check-in?',
    mood: 'Mood right now (0 is very low, 10 is very good)',
    anxiety: 'Worry or stress (0 is none, 10 is a lot)',
    intention: 'One thing you want from today (optional)',
    peakCraving: 'Strongest craving today (0 to 10)',
    pleasantCount: 'How many good moments today? (optional)',
    used: 'Did you use today?',
    sleep: 'Hours of sleep last night (optional)',
    meeting: 'Did you go to a meeting or group?',
    yes: 'Yes', no: 'No',
    activityKind: 'What kind of activity?',
    activityKinds: { exercise: 'Exercise', mindfulness: 'Mindfulness', meeting: 'A meeting', pleasant: 'Something I enjoy' },
    minutes: 'How many minutes?',
    activityName: 'What was it? (optional)',
    enjoyment: 'How much did you enjoy it? (0 to 10)',
    slipLead: 'A slip can happen. Noting it helps you and your plan learn what to change. Nothing you have built is taken away.',
    slipSteps: 'Steps for after a slip',
    slipDate: 'When was it?',
    slipSubstance: 'What was used (optional)',
    slipSituation: 'What was going on? (optional)',
    slipDone: 'It is in your log.',
    slipDoneBody: 'When you are ready, a few short steps can help you plan what comes next.',
    slipNext: 'Next steps',
    backToTrack: 'Back to Track',
    save: 'Save',
    saving: 'Saving…',
    saved: (w) => `${w} saved.`,
    locked: 'Your notebook is locked. Unlock it to save. What you typed is still here.',
    error: 'That did not save. Please try again.',
    timelineTitle: 'Your log',
    timelineEmpty: 'Nothing logged yet. Your logs show here, newest first.',
    logFirst: 'Log something',
    showMore: 'Show more',
    today: 'Today', yesterday: 'Yesterday',
    sample: 'Sample',
    outOf10: (n) => `${n} out of 10`,
    mins: (n) => `${n} min`,
    moodWord: (n) => `mood ${n} out of 10`,
    slipRow: 'Slip noted',
    checkinRow: (k) => (k === 'evening' ? 'Evening check-in' : 'Morning check-in'),
    countersTitle: 'Your days',
    total: (t) => `${t} in total`,
    current: (n) => `${n} in the current run`,
    insightsSoon: (n) => `Insights appear after seven logs. You have ${n} so far.`,
    insightsGo: 'See your insights',
    insightsTitle: 'Insights',
    insightsMissing: 'Insights cannot be worked out right now. Your logs are saved.',
    insightsLead: (n) => `What your ${n} logs show so far. These are patterns to notice, not rules.`,
    trendTitle: 'Craving strength by week',
    trendNone: 'No cravings logged in the last eight weeks.',
    trendLabel: (parts) => `Average craving strength out of 10, last eight weeks: ${parts}.`,
    trendWeek: (d, m, n) => (m === null ? `week of ${d}: none logged` : `week of ${d}: ${m} from ${n}`),
    trendLegend: 'Each dot is one week. A gap means no cravings were logged that week.',
    triggersTitle: 'What set cravings off most',
    triggersNone: 'No triggers picked in your craving logs yet.',
    triggersLabel: (parts) => `Top triggers by count: ${parts}.`,
    heatTitle: 'When cravings came',
    heatNone: 'No cravings logged yet, so there is no pattern by day and hour.',
    heatLabel: (n, top) => `Cravings by day of the week and hour of the day, ${n} in all.${top ? ' Busiest: ' + top + '.' : ''}`,
    heatLegend: 'Darker squares mean more cravings at that day and hour.',
    heatTable: 'Show as a table',
    heatCols: ['Day', 'Time', 'Cravings', 'Average strength'],
    skillsTitle: 'Skills that helped most',
    skillUses: (n) => `used ${n} ${n === 1 ? 'time' : 'times'}`,
    skillHelped: (p) => `helpful ${p}% of the time`,
    moodTitle: 'Mood and pleasant activities',
    predTitle: 'Your predictions',
    predLine: (p) => `You checked ${p.count} ${p.count === 1 ? 'prediction' : 'predictions'}. On average you expected ${p.predicted} and it turned out ${p.actual}. ${p.better} came out higher than you expected.`,
    motTitle: 'Your motivation over time',
    motLine: (d, s) => `${d}: ${s}`,
    back: 'Back',
  };
  const KINDS = ['craving', 'feeling', 'checkin', 'activity', 'slip'];
  const VERB = { craving: 'logCraving', feeling: 'logFeeling', checkin: 'checkin', activity: 'logActivity', slip: 'logSlip' };
  const INSIGHT_TYPES = ['craving', 'feeling', 'checkin'];
  const PAGE = 30;

  /* ── small helpers ─────────────────────────────────────────────────────────────────────── */
  const arr = (x) => (Array.isArray(x) ? x : []);
  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  const str = (v) => (typeof v === 'string' ? v.trim() : '');
  const pad = (n) => String(n).padStart(2, '0');
  const ns = (name) => {
    try {
      if (name === 'Content') return typeof Content !== 'undefined' ? Content : null;
      if (name === 'Engine') return typeof Engine !== 'undefined' ? Engine : null;
      if (name === 'Actions') return typeof Actions !== 'undefined' ? Actions : null;
      if (name === 'UI') return typeof UI !== 'undefined' ? UI : null;
    } catch (e) { /* a namespace that throws counts as absent */ }
    return null;
  };
  const safe = (fn, dflt) => { try { const v = fn(); return v === undefined ? dflt : v; } catch (e) { return dflt; } };
  const toDate = (x) => {
    if (x instanceof Date) return isNaN(x.getTime()) ? null : x;
    if (typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x)) { const [y, m, d] = x.split('-').map(Number); return new Date(y, m - 1, d); }
    if (typeof x === 'string' || typeof x === 'number') { const d = new Date(x); return isNaN(d.getTime()) ? null : d; }
    return null;
  };
  function localDate(x) {
    if (typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x)) return x;
    const d = toDate(x);
    return d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : '';
  }
  const list = (view, store) => safe(() => arr(view.list(store)).filter(isObj), []);
  const E_ = (ctx) => (ctx && ctx.E !== undefined ? ctx.E : ns('Engine'));
  const discreetOf = (ctx) => (ctx && ctx.settings && ctx.settings.discreet === true) ||
    safe(() => document.documentElement.getAttribute('data-discreet') !== null, false) === true;

  /* h: text through textContent only; on* keys become listeners; null/false attributes are skipped. */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    const a = attrs || {};
    if (a.text != null) el.textContent = String(a.text);
    for (const k of Object.keys(a)) {
      const v = a[k];
      if (k === 'text' || v == null || v === false) continue;
      if (/^on[A-Z]/.test(k) && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else el.setAttribute(k, v === true ? '' : String(v));
    }
    for (const c of kids.flat(3)) {
      if (c == null || c === false || c === true) continue;
      el.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
    }
    return el;
  }
  const link = (href, text, cls, test, extra) => h('a', Object.assign({ href, class: cls || 'btn', text, 'data-test': test }, extra || {}));
  const hide = (el) => { if (el) { el.hidden = true; el.setAttribute('hidden', ''); } };
  const show = (el) => { if (el) { el.hidden = false; el.removeAttribute('hidden'); } };

  /* ── pure data ─────────────────────────────────────────────────────────────────────────── */
  /* The person's logs, newest first, grouped by day: [{date, rows[]}]. Drills never show; at most `limit` rows. */
  function timeline(view, limit) {
    const max = Number.isInteger(limit) && limit > 0 ? limit : PAGE;
    const rows = list(view, 'logs').filter((l) => l.drill !== true && KINDS.includes(l.type))
      .sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')) || String(b.id || '').localeCompare(String(a.id || '')))
      .slice(0, max);
    const out = [];
    for (const r of rows) {
      const d = localDate(r.at) || localDate(r.date) || '';
      const last = out[out.length - 1];
      if (last && last.date === d) last.rows.push(r); else out.push({ date: d, rows: [r] });
    }
    return out;
  }
  const timelineCount = (view) => list(view, 'logs').filter((l) => l.drill !== true && KINDS.includes(l.type)).length;
  const insightCount = (view) => list(view, 'logs').filter((l) => l.drill !== true && l.sample !== true && INSIGHT_TYPES.includes(l.type)).length;

  /* Insights (3.9, U-17): E.insights(view, now) shaped for drawing. Never draws below seven logs (ready false).
     -> { ready, count, engine, caveat, trend[8]:{weekStart,count,mean|null}, triggers[]:{id,label,count}, maxTrigger,
          heatmap[7][24]:{count,mean|null}, maxCell, cravings, hot[]:{day,hour,count,mean}, skills[], sentences[],
          predictions|null, motivation[]:{date,score} } */
  const numOr = (v) => (typeof v === 'number' && isFinite(v) ? v : null);
  function insightsView(view, now, eng) {
    const E = eng === undefined ? ns('Engine') : eng;
    const raw = E && typeof E.insights === 'function' ? safe(() => E.insights(view, now || new Date()), null) : null;
    if (!isObj(raw)) return { ready: false, count: insightCount(view), engine: false };
    const count = Number.isInteger(raw.count) ? raw.count : insightCount(view);
    const trend = arr(raw.cravingTrend).filter(isObj).map((w) => ({ weekStart: String(w.weekStart || ''), count: Number(w.count) || 0, mean: numOr(w.mean) }));
    const triggers = arr(raw.topTriggers).filter((t) => isObj(t) && Number(t.count) > 0).slice(0, 5)
      .map((t) => ({ id: String(t.id), label: String(t.label || t.id), count: Number(t.count) }));
    const heatmap = Array.from({ length: 7 }, (_, d) => Array.from({ length: 24 }, (__, hr) => {
      const cell = safe(() => raw.heatmap[d][hr], null);
      return { count: isObj(cell) ? Number(cell.count) || 0 : 0, mean: isObj(cell) ? numOr(cell.mean) : null };
    }));
    const hot = [];
    for (let d = 0; d < 7; d += 1) for (let hr = 0; hr < 24; hr += 1) if (heatmap[d][hr].count) hot.push(Object.assign({ day: d, hour: hr }, heatmap[d][hr]));
    const mv = isObj(raw.moodVsActivities) ? raw.moodVsActivities : {};
    const pr = isObj(raw.predictions) && Number(raw.predictions.count) > 0 && numOr(raw.predictions.predicted) !== null && numOr(raw.predictions.actual) !== null ? raw.predictions : null;
    return {
      ready: raw.ready === true, count, engine: true,
      caveat: typeof raw.caveat === 'string' && raw.caveat ? raw.caveat : null,
      trend, triggers, maxTrigger: Math.max(1, ...triggers.map((t) => t.count)),
      heatmap, maxCell: Math.max(1, ...hot.map((x) => x.count)), cravings: hot.reduce((a, x) => a + x.count, 0), hot,
      skills: arr(raw.skillRanking).filter((x) => isObj(x) && Number(x.uses) > 0).slice(0, 8)
        .map((x) => ({ id: String(x.skillId || ''), name: String(x.name || x.skillId || ''), uses: Number(x.uses), helpfulAvg: numOr(x.helpfulAvg) })),
      sentences: arr(mv.sentences).filter((x) => typeof x === 'string' && x),
      predictions: pr ? { count: Number(pr.count), predicted: pr.predicted, actual: pr.actual, better: Number(pr.better) || 0 } : null,
      motivation: arr(raw.motivationHistory).filter((x) => isObj(x) && numOr(x.score) !== null).slice(-8).map((x) => ({ date: String(x.date || ''), score: x.score })),
    };
  }

  /* Trigger chips, the frequent ones first (stable), as E.triggerChips returns them. */
  function triggerOptions(view, E) {
    const eng = E === undefined ? ns('Engine') : E;
    const chips = eng && typeof eng.triggerChips === 'function' ? safe(() => arr(eng.triggerChips(view)), []) : [];
    return chips.filter((c) => isObj(c) && str(c.id) && str(c.label)).map((c, i) => [c, i])
      .sort((a, b) => ((a[0].frequent ? 0 : 1) - (b[0].frequent ? 0 : 1)) || (a[1] - b[1])).map((x) => x[0]);
  }
  const skillOptions = () => safe(() => arr(ns('Content').skills).filter((s) => isObj(s) && s.id && s.name).map((s) => ({ id: s.id, label: s.name })), []);
  const emotionOptions = () => safe(() => arr(ns('Content').emotions).filter((s) => isObj(s) && s.id && s.name).map((s) => ({ id: s.id, label: s.name })), []);

  const num = (v) => (v === '' || v == null ? NaN : Number(v));
  const optNum = (v) => (v === '' || v == null ? undefined : Number(v));
  const yesNo = (v) => (v === 'yes' || v === true ? true : v === 'no' || v === false ? false : undefined);
  const put = (o, k, v) => { if (v !== undefined && v !== '' && !(Array.isArray(v) && !v.length)) o[k] = v; return o; };

  /* Form values (strings from the page) -> { verb, args } for Actions. Optional empty values are left out;
     anything else goes to the verb as typed, so Actions is the one judge of what is valid. */
  function formToLog(type, values) {
    const v = isObj(values) ? values : {};
    if (type === 'craving' || type === 'feeling') {
      const e = { intensity: num(v.intensity) };
      put(e, 'triggerIds', arr(v.triggerIds).filter((x) => typeof x === 'string' && x));
      put(e, 'thought', str(v.thought));
      if (v.redFlag === true) e.redFlag = true;
      const helped = new Set(arr(v.helped));
      const ids = [...new Set(arr(v.tried).concat(arr(v.helped)))].filter((x) => typeof x === 'string' && x);
      put(e, 'skills', ids.map((skillId) => ({ skillId, helpful: helped.has(skillId) })));
      put(e, 'notes', str(v.notes));
      if (type === 'feeling' && str(v.emotion)) e.emotion = str(v.emotion);
      return { verb: VERB[type], args: [e] };
    }
    if (type === 'checkin') {
      const kind = v.kind === 'evening' ? 'evening' : 'morning';
      const d = {};
      put(d, 'mood', optNum(v.mood));
      put(d, 'anxiety', optNum(v.anxiety));
      put(d, 'intention', str(v.intention));
      if (kind === 'evening') {
        put(d, 'peakCraving', optNum(v.peakCraving));
        put(d, 'pleasantCount', optNum(v.pleasantCount));
        put(d, 'used', yesNo(v.used));
        put(d, 'sleep', optNum(v.sleep));
        put(d, 'meeting', yesNo(v.meeting));
      }
      return { verb: VERB.checkin, args: [kind, d] };
    }
    if (type === 'activity') {
      const a = { kind: str(v.kind), minutes: num(v.minutes) };
      put(a, 'name', str(v.name));
      put(a, 'enjoyment', optNum(v.enjoyment));
      return { verb: VERB.activity, args: [a] };
    }
    if (type === 'slip') {
      const s = {};
      put(s, 'date', str(v.date));
      put(s, 'substance', str(v.substance));
      put(s, 'situation', str(v.situation));
      put(s, 'notes', str(v.notes));
      return { verb: VERB.slip, args: [s] };
    }
    return null;
  }

  /* Save one log through its Actions verb: { ok: true, log } or { ok: false, code, message }. Never throws. */
  async function save(A, type, values) {
    const call = formToLog(type, values);
    if (!call) return { ok: false, code: 'bad-log', message: TEXT.error };
    const fn = A && A[call.verb];
    if (typeof fn !== 'function') return { ok: false, code: 'no-actions', message: TEXT.error };
    try {
      const r = await fn.apply(A, call.args);
      return { ok: true, log: r && r.log ? r.log : null };
    } catch (e) {
      const code = e && e.code ? e.code : 'error';
      const message = code === 'LOCKED' ? TEXT.locked : (e && typeof e.message === 'string' && e.message) || TEXT.error;
      return { ok: false, code, message };
    }
  }

  /* One timeline row in words (never colour alone): { word, text, time, sample }. */
  function rowText(row, labels) {
    const r = isObj(row) ? row : {};
    const lab = labels instanceof Map ? labels : new Map();
    const d = toDate(r.at);
    const time = d ? `${pad(d.getHours())}:${pad(d.getMinutes())}` : '';
    const sample = r.sample === true;
    const word = (TEXT.kinds[r.type] || { word: r.type }).word;
    const parts = [];
    if (r.type === 'craving' || r.type === 'feeling') {
      if (r.type === 'feeling' && r.emotion) {
        const em = safe(() => arr(ns('Content').emotions).find((x) => x.id === r.emotion), null);
        parts.push(em ? em.name : String(r.emotion));
      }
      if (Number.isInteger(r.intensity)) parts.push(TEXT.outOf10(r.intensity));
      const trig = arr(r.triggerIds).map((t) => lab.get(t) || String(t).replace(/^[a-z-]+:/, '').replace(/-/g, ' ')).filter(Boolean);
      if (trig.length) parts.push(trig.slice(0, 3).join(', '));
    } else if (r.type === 'checkin') {
      const c = isObj(r.checkin) ? r.checkin : {};
      if (Number.isInteger(c.mood)) parts.push(TEXT.moodWord(c.mood));
      if (str(c.intention)) parts.push(str(c.intention));
      return { word: TEXT.checkinRow(c.kind), text: parts.join(' · '), time, sample };
    } else if (r.type === 'activity') {
      const a = isObj(r.activity) ? r.activity : {};
      parts.push(TEXT.activityKinds[a.kind] || str(a.kind));
      if (Number.isInteger(a.minutes)) parts.push(TEXT.mins(a.minutes));
      if (str(a.name)) parts.push(str(a.name));
    } else if (r.type === 'slip') {
      return { word, text: TEXT.slipRow, time, sample };
    }
    return { word, text: parts.join(' · '), time, sample };
  }

  /* The opt-in counters, as Today shows them: null unless switched on, tracking and not discreet. */
  function countersData(counters, settings, discreet) {
    const s = settings || {};
    if (s.counters !== true || discreet === true || !isObj(counters) || !counters.tracking) return null;
    return {
      total: Math.max(0, Number(counters.total) || 0),
      current: s.showCurrentRun === true ? Math.max(0, Number(counters.current) || 0) : null,
    };
  }

  /* The route -> what to draw: { view: 'home'|'choose'|'log'|'insights', type, kind, saved }. */
  function routeOf(route) {
    const r = isObj(route) ? route : {};
    const parts = arr(r.parts); const q = isObj(r.query) ? r.query : {};
    if (parts[1] === 'insights') return { view: 'insights' };
    if (parts[1] === 'log') {
      const type = KINDS.includes(parts[2]) ? parts[2] : null;
      if (!type) return { view: 'choose' };
      return { view: 'log', type, kind: q.kind === 'evening' ? 'evening' : q.kind === 'morning' ? 'morning' : null, saved: q.saved === '1' };
    }
    return { view: 'home' };
  }

  /* ── fields (own small builders, so the page works and tests run without the DOM of ui-core) ── */
  let uid = 0;
  const fid = (n) => `tr-${n}-${++uid}`;
  function field(label, id, control, extra) {
    return h('div', { class: 'field' }, h('label', { class: 'field-label', for: id, text: label }), control, extra || null);
  }
  function slider(name, label, value, isIntensity) {
    const id = fid(name);
    const tour = isIntensity ? { 'data-tour': 'quicklog-intensity' } : {};
    const input = h('input', Object.assign({ type: 'range', id, name, min: '0', max: '10', step: '1', value: String(value), 'data-test': 'log-' + name }, tour));
    input.value = String(value);
    const out = h('output', { class: 'tr-val', for: id, text: String(value) });
    input.addEventListener('input', () => { out.textContent = String(input.value); });
    const el = h('div', { class: 'field' },
      h('div', { class: 'row tr-slider-head' }, h('label', { class: 'field-label', for: id, text: label }), out),
      input, h('div', { class: 'row tr-ends muted', 'aria-hidden': 'true' }, h('span', { text: '0' }), h('span', { text: '10' })));
    return { name, el, get: () => input.value, input };
  }
  function chipGroup(name, label, options, multi, selected, fold) {
    const id = fid(name);
    let value = multi ? arr(selected).slice() : (selected == null ? null : String(selected));
    const buttons = options.map((o) => {
      const b = h('button', { type: 'button', class: 'chip', 'aria-pressed': 'false', 'data-value': o.id, text: o.label });
      b.addEventListener('click', () => {
        if (multi) value = value.includes(o.id) ? value.filter((x) => x !== o.id) : value.concat(o.id);
        else value = value === o.id ? null : o.id;
        paint();
      });
      return { b, id: o.id };
    });
    const paint = () => buttons.forEach((x) => x.b.setAttribute('aria-pressed', (multi ? value.includes(x.id) : value === x.id) ? 'true' : 'false'));
    paint();
    const n = fold && buttons.length > fold.n ? fold.n : buttons.length;
    const group = h('div', { class: 'chips', role: 'group', 'aria-labelledby': id, 'data-test': 'log-' + name }, buttons.slice(0, n).map((x) => x.b));
    const more = n < buttons.length
      ? h('details', { class: 'tr-more' }, h('summary', { text: fold.summary }), h('div', { class: 'chips', role: 'group', 'aria-label': fold.summary }, buttons.slice(n).map((x) => x.b)))
      : null;
    const el = h('div', { class: 'field' }, h('p', { class: 'field-label', id, text: label }), group, more);
    return { name, el, get: () => (multi ? value.slice() : value), buttons: buttons.map((x) => x.b) };
  }
  function textInput(name, label, opts) {
    const o = opts || {};
    const id = fid(name);
    const tag = o.area ? 'textarea' : 'input';
    const input = h(tag, { id, name, type: o.area ? null : (o.type || 'text'), maxlength: o.max ? String(o.max) : null, rows: o.area ? '3' : null,
      min: o.min != null ? String(o.min) : null, 'max': o.maxValue != null ? String(o.maxValue) : null, inputmode: o.type === 'number' ? 'numeric' : null,
      required: o.required === true, autocomplete: 'off', 'data-test': 'log-' + name });
    input.value = o.value != null ? String(o.value) : '';
    return { name, el: field(label, id, input), get: () => input.value, input };
  }
  function checkbox(name, label) {
    const id = fid(name);
    const input = h('input', { type: 'checkbox', id, name, 'data-test': 'log-' + name });
    input.checked = false;
    return { name, el: h('div', { class: 'field' }, h('div', { class: 'choice row' }, input, h('label', { for: id, text: label }))), get: () => input.checked === true, input };
  }
  function fieldsFor(type, ctx, kind) {
    const c = ctx || {};
    const F = [];
    if (type === 'craving' || type === 'feeling') {
      if (type === 'feeling') F.push(chipGroup('emotion', TEXT.emotion, emotionOptions(), false, null));
      F.push(slider('intensity', type === 'feeling' ? TEXT.feelingIntensity : TEXT.intensity, 5, true));
      F.push(chipGroup('triggerIds', TEXT.triggers, triggerOptions(c.view, E_(c)), true, [], { n: 8, summary: TEXT.moreTriggers }));
      F.push(textInput('thought', TEXT.thought, { max: 500 }));
      F.push(checkbox('redFlag', TEXT.redFlag));
      const skills = skillOptions();
      F.push(chipGroup('tried', TEXT.tried, skills, true, [], { n: 6, summary: TEXT.skillsMore }));
      F.push(chipGroup('helped', TEXT.helped, skills, true, [], { n: 6, summary: TEXT.skillsMore }));
      F.push(textInput('notes', TEXT.notes, { area: true, max: 2000 }));
    } else if (type === 'checkin') {
      F.push(slider('mood', TEXT.mood, 5));
      F.push(slider('anxiety', TEXT.anxiety, 5));
      if (kind === 'evening') {
        F.push(slider('peakCraving', TEXT.peakCraving, 0));
        F.push(textInput('pleasantCount', TEXT.pleasantCount, { type: 'number', min: 0, maxValue: 50 }));
        F.push(chipGroup('used', TEXT.used, [{ id: 'no', label: TEXT.no }, { id: 'yes', label: TEXT.yes }], false, null));
        F.push(textInput('sleep', TEXT.sleep, { type: 'number', min: 0, maxValue: 24 }));
        F.push(chipGroup('meeting', TEXT.meeting, [{ id: 'yes', label: TEXT.yes }, { id: 'no', label: TEXT.no }], false, null));
      }
      F.push(textInput('intention', TEXT.intention, { max: 300 }));
    } else if (type === 'activity') {
      F.push(chipGroup('kind', TEXT.activityKind, Object.keys(TEXT.activityKinds).map((id) => ({ id, label: TEXT.activityKinds[id] })), false, null));
      F.push(textInput('minutes', TEXT.minutes, { type: 'number', min: 1, maxValue: 1440, required: true }));
      F.push(textInput('name', TEXT.activityName, { max: 120 }));
      F.push(slider('enjoyment', TEXT.enjoyment, 5));
    } else if (type === 'slip') {
      const today = localDate(c.now || new Date());
      F.push(textInput('date', TEXT.slipDate, { type: 'date', value: today, maxValue: today }));
      F.push(textInput('substance', TEXT.slipSubstance, { max: 120 }));
      F.push(textInput('situation', TEXT.slipSituation, { area: true, max: 1000 }));
      F.push(textInput('notes', TEXT.notes, { area: true, max: 2000 }));
    }
    return F;
  }

  /* ── pages ─────────────────────────────────────────────────────────────────────────────── */
  function header(c, title, back) {
    const discreet = discreetOf(c);
    return h('header', { class: 'stack tr-head' },
      back ? link(back, TEXT.back, 'btn ghost tr-back', 'track-back') : null,
      h('h1', { text: title }),
      h('div', { class: 'row tr-quick' },
        back ? null : link('#/track/log', TEXT.add, 'btn primary big', 'track-add', { 'data-tour': 'quicklog-button', 'aria-label': TEXT.addLabel }),
        link('#/sos', discreet ? TEXT.help : TEXT.sos, 'btn', 'track-sos')));
  }

  function countersCard(c) {
    const E = E_(c);
    const gs = E && typeof E.gameState === 'function' ? safe(() => E.gameState(c.view, c.now), null) : null;
    const d = countersData(gs && gs.counters, c.settings, discreetOf(c));
    if (!d) return null;
    return h('section', { class: 'card stack', 'data-test': 'track-counters', 'aria-label': TEXT.countersTitle },
      h('h2', { class: 'card-title', text: TEXT.countersTitle }),
      h('p', { class: 'tr-big', text: TEXT.total(d.total) }),
      d.current !== null ? h('p', { class: 'muted', text: TEXT.current(d.current) }) : null);
  }

  function insightsLine(c) {
    const iv = insightsView(c.view, c.now, E_(c));
    const n = iv.count;
    if (!(iv.engine ? iv.ready : n >= 7)) return h('p', { class: 'muted', 'data-test': 'insights-empty', text: TEXT.insightsSoon(n) });
    return link('#/track/insights', TEXT.insightsGo, 'btn', 'track-insights-link');
  }

  function dayLabel(date, now) {
    const today = localDate(now);
    const y = toDate(today); if (y) y.setDate(y.getDate() - 1);
    if (date === today) return TEXT.today;
    if (y && date === localDate(y)) return TEXT.yesterday;
    const d = toDate(date);
    return d ? safe(() => d.toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' }), date) : date;
  }

  function timelineCard(c) {
    const E = E_(c);
    const labels = new Map(triggerOptions(c.view, E).map((t) => [t.id, t.label]));
    const box = h('div', { class: 'stack' });
    const total = timelineCount(c.view);
    let limit = PAGE;
    const more = h('button', { type: 'button', class: 'btn ghost', 'data-test': 'timeline-more', text: TEXT.showMore });
    const paint = () => {
      box.textContent = '';
      for (const g of timeline(c.view, limit)) {
        box.appendChild(h('div', { class: 'stack tr-day' },
          h('h3', { class: 'tr-date', text: dayLabel(g.date, c.now) }),
          h('ul', { class: 'tr-rows' }, g.rows.map((r) => {
            const t = rowText(r, labels);
            return h('li', { class: 'row tr-row tr-' + r.type, 'data-test': 'timeline-row', 'data-type': r.type },
              h('span', { class: 'tr-time', text: t.time }),
              h('span', { class: 'tr-word', text: t.word }),
              t.text ? h('span', { class: 'tr-text', text: t.text }) : null,
              t.sample ? h('span', { class: 'tr-tag', text: TEXT.sample }) : null);
          }))));
      }
      if (limit >= total) hide(more); else show(more);
    };
    more.addEventListener('click', () => { limit += PAGE; paint(); });
    const body = total
      ? [box, more]
      : [h('p', { text: TEXT.timelineEmpty }), link('#/track/log', TEXT.logFirst, 'btn', 'timeline-log-first')];
    if (total) paint();
    return h('section', { class: 'card stack', 'data-test': 'track-timeline', 'aria-label': TEXT.timelineTitle },
      h('h2', { class: 'card-title', text: TEXT.timelineTitle }), body);
  }

  function homePage(c) {
    return h('section', { class: 'page stack tr-page', 'data-test': 'track-page' },
      header(c, TEXT.title), countersCard(c), insightsLine(c), timelineCard(c));
  }

  function choosePage(c) {
    return h('section', { class: 'page stack tr-page', 'data-test': 'track-choose' },
      header(c, TEXT.chooseTitle, '#/track'),
      h('ul', { class: 'stack tr-kinds' }, KINDS.map((k) => h('li', null,
        link('#/track/log/' + k, TEXT.kinds[k].title, 'tile tr-kind', 'log-kind-' + k),
        h('p', { class: 'muted', text: TEXT.kinds[k].hint })))));
  }

  function slipDonePage(c) {
    return h('section', { class: 'page stack tr-page', 'data-test': 'slip-done' },
      header(c, TEXT.kinds.slip.title, '#/track'),
      h('section', { class: 'card stack' },
        h('h2', { class: 'card-title', text: TEXT.slipDone }),
        h('p', { text: TEXT.slipDoneBody }),
        h('div', { class: 'row tr-quick' },
          link('#/sos/slip?logged=1', TEXT.slipNext, 'btn primary', 'slip-next'),
          link('#/track', TEXT.backToTrack, 'btn', 'slip-back'))));
  }

  function logPage(c, rt) {
    const type = rt.type;
    const kind = type === 'checkin' ? (rt.kind || (safe(() => new Date(c.now).getHours(), 9) < 15 ? 'morning' : 'evening')) : null;
    if (type === 'slip' && rt.saved) return slipDonePage(c);
    const F = fieldsFor(type, c, kind);
    const err = h('p', { class: 'field-error tr-error', 'aria-live': 'polite', 'data-test': 'log-error' });
    hide(err);
    const btn = h('button', { type: 'submit', class: 'btn primary big', 'data-tour': 'quicklog-save', 'data-test': 'log-save', text: TEXT.save });
    let busy = false;
    const values = () => {
      const out = {};
      for (const f of F) out[f.name] = f.get();
      if (kind) out.kind = kind;
      return out;
    };
    const onSubmit = async (ev) => {
      if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
      if (busy) return;
      busy = true; btn.disabled = true; btn.textContent = TEXT.saving;
      const r = await save(c.A, type, values());
      busy = false; btn.disabled = false; btn.textContent = TEXT.save;
      if (!r.ok) { err.textContent = r.message; show(err); return; }
      err.textContent = ''; hide(err);
      const U = ns('UI');
      const go = typeof c.go === 'function' ? c.go : (U && typeof U.go === 'function' ? U.go : null);
      if (type === 'slip') { if (go) go('#/track/log/slip?saved=1'); return; }
      if (U && typeof U.toast === 'function') safe(() => U.toast(TEXT.saved(TEXT.kinds[type].word), 'ok'), null);
      if (go) go('#/track');
    };
    const switcher = type === 'checkin'
      ? h('div', { class: 'row tr-quick', role: 'group', 'aria-label': TEXT.checkinKind },
        ['morning', 'evening'].map((k) => link('#/track/log/checkin?kind=' + k, TEXT[k], k === kind ? 'btn primary' : 'btn ghost', 'log-checkin-' + k,
          { 'aria-current': k === kind ? 'page' : null })))
      : null;
    const lead = type === 'slip'
      ? [h('p', { 'data-test': 'slip-lead', text: TEXT.slipLead }), link('#/sos/slip?preview=1', TEXT.slipSteps, 'btn ghost', 'slip-steps')]
      : [h('p', { class: 'muted', text: TEXT.kinds[type].hint })];
    const title = type === 'checkin' ? TEXT.checkinRow(kind) : TEXT.kinds[type].title;
    const form = h('form', { class: 'form stack card', novalidate: true, 'aria-label': title, onSubmit }, F.map((f) => f.el), err,
      h('div', { class: 'form-actions row' }, btn));
    return h('section', { class: 'page stack tr-page', 'data-test': 'log-' + type, 'data-kind': kind },
      header(c, title, '#/track'), switcher, lead, form);
  }

  /* ── Insights (U-17): inline SVG through UI.svg, each with role="img" and its numbers in words ─────── */
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const shortDate = (ymd) => { const d = toDate(ymd); return d ? safe(() => d.toLocaleDateString('en', { day: 'numeric', month: 'short' }), ymd) : ymd; };
  const hourText = (hr) => `${pad(hr)}:00`;
  const svgOf = () => { const U = ns('UI'); return U && typeof U.svg === 'function' ? U.svg : null; };

  function insightCard(name, title, iv, body, extra) {
    return h('section', Object.assign({ class: 'card stack tr-insight', 'data-test': 'insights-card', 'data-card': name, 'aria-label': title }, extra || {}),
      h('h2', { class: 'card-title', text: title }), body,
      iv.caveat ? h('p', { class: 'muted tr-caveat', 'data-test': 'insights-caveat', text: iv.caveat }) : null);
  }

  function trendSvg(iv) {
    const s = svgOf();
    const pts = iv.trend.map((w, i) => ({ x: 30 + i * 40, y: w.mean === null ? null : 12 + ((10 - w.mean) / 10) * 100, w }));
    const label = TEXT.trendLabel(iv.trend.map((w) => TEXT.trendWeek(shortDate(w.weekStart), w.mean, w.count)).join('; '));
    if (!s) return h('p', { class: 'muted', text: label });
    let d = '';
    let pen = false;
    for (const p of pts) { if (p.y === null) { pen = false; continue; } d += `${pen ? 'L' : 'M'}${p.x} ${p.y.toFixed(1)} `; pen = true; }
    const grid = [0, 5, 10].map((v) => {
      const y = 12 + ((10 - v) / 10) * 100;
      return [s('line', { class: 'tr-grid', x1: '26', x2: '314', y1: String(y), y2: String(y) }), s('text', { class: 'tr-axis', x: '4', y: String(y + 4) }, String(v))];
    });
    const first = iv.trend[0] ? shortDate(iv.trend[0].weekStart) : '';
    const last = iv.trend.length ? shortDate(iv.trend[iv.trend.length - 1].weekStart) : '';
    return s('svg', { viewBox: '0 0 320 136', class: 'tr-chart', role: 'img', 'aria-label': label, 'data-test': 'insights-trend', focusable: 'false' },
      grid, d ? s('path', { class: 'tr-line', d: d.trim() }) : null,
      pts.filter((p) => p.y !== null).map((p) => s('circle', { class: 'tr-dot', cx: String(p.x), cy: p.y.toFixed(1), r: '4' })),
      s('text', { class: 'tr-axis', x: '30', y: '130' }, first),
      s('text', { class: 'tr-axis', x: '310', y: '130', 'text-anchor': 'end' }, last));
  }

  function barsSvg(iv) {
    const s = svgOf();
    const label = TEXT.triggersLabel(iv.triggers.map((t) => `${t.label} ${t.count}`).join(', '));
    if (!s) return h('ol', { class: 'tr-list' }, iv.triggers.map((t) => h('li', { text: `${t.label}: ${t.count}` })));
    const rowH = 30;
    return s('svg', { viewBox: `0 0 320 ${iv.triggers.length * rowH + 4}`, class: 'tr-chart', role: 'img', 'aria-label': label, 'data-test': 'insights-bars', focusable: 'false' },
      iv.triggers.map((t, i) => {
        const y = i * rowH + 4;
        const w = Math.max(4, Math.round((t.count / iv.maxTrigger) * 150));
        const name = t.label.length > 20 ? t.label.slice(0, 19) + '…' : t.label;
        return [s('text', { class: 'tr-axis', x: '0', y: String(y + 17) }, name),
          s('rect', { class: 'tr-bar', x: '132', y: String(y + 4), width: String(w), height: '18', rx: '3' }),
          s('text', { class: 'tr-axis', x: String(138 + w), y: String(y + 17) }, String(t.count))];
      }));
  }

  function heatSvg(iv) {
    const s = svgOf();
    const top = iv.hot.slice().sort((a, b) => (b.count - a.count) || (a.day - b.day) || (a.hour - b.hour)).slice(0, 3)
      .map((x) => `${DAYS[x.day]} ${hourText(x.hour)} with ${x.count}`).join('; ');
    const label = TEXT.heatLabel(iv.cravings, top);
    if (!s) return h('p', { class: 'muted', text: label });
    const cells = [];
    for (let d = 0; d < 7; d += 1) {
      for (let hr = 0; hr < 24; hr += 1) {
        const n = iv.heatmap[d][hr].count;
        cells.push(s('rect', { class: n ? 'tr-heat tr-heat-on' : 'tr-heat', x: String(32 + hr * 12), y: String(4 + d * 14), width: '11', height: '13', rx: '2',
          'fill-opacity': n ? (0.25 + 0.75 * (n / iv.maxCell)).toFixed(2) : null, 'data-day': String(d), 'data-hour': String(hr) }));
      }
    }
    return s('svg', { viewBox: '0 0 320 118', class: 'tr-chart', role: 'img', 'aria-label': label, 'data-test': 'insights-heat', focusable: 'false' },
      DAYS.map((name, d) => s('text', { class: 'tr-axis', x: '0', y: String(14 + d * 14) }, name)),
      cells,
      [0, 6, 12, 18].map((hr) => s('text', { class: 'tr-axis', x: String(32 + hr * 12), y: '114' }, hourText(hr))));
  }

  function heatTable(iv) {
    return h('details', { class: 'tr-more', 'data-test': 'insights-heat-table' },
      h('summary', { text: TEXT.heatTable }),
      h('table', { class: 'tr-table' },
        h('thead', {}, h('tr', {}, TEXT.heatCols.map((t) => h('th', { scope: 'col', text: t })))),
        h('tbody', {}, iv.hot.map((x) => h('tr', {},
          h('td', { text: DAYS[x.day] }), h('td', { text: hourText(x.hour) }), h('td', { text: String(x.count) }),
          h('td', { text: x.mean === null ? '-' : TEXT.outOf10(x.mean) }))))));
  }

  function insightsCards(iv) {
    const anyTrend = iv.trend.some((w) => w.mean !== null);
    const cards = [
      insightCard('trend', TEXT.trendTitle, iv, anyTrend ? [trendSvg(iv), h('p', { class: 'muted', text: TEXT.trendLegend })] : h('p', { text: TEXT.trendNone })),
      insightCard('triggers', TEXT.triggersTitle, iv, iv.triggers.length ? barsSvg(iv) : h('p', { text: TEXT.triggersNone }), { 'data-tour': 'insights-triggers' }),
      insightCard('heatmap', TEXT.heatTitle, iv, iv.cravings ? [heatSvg(iv), h('p', { class: 'muted', text: TEXT.heatLegend }), heatTable(iv)] : h('p', { text: TEXT.heatNone }), { 'data-tour': 'insights-heatmap' }),
    ];
    if (iv.skills.length) {
      cards.push(insightCard('skills', TEXT.skillsTitle, iv, h('ol', { class: 'tr-list', 'data-test': 'insights-skills' }, iv.skills.map((x) => h('li', {},
        h('span', { class: 'tr-word', text: x.name }), ' ',
        h('span', { class: 'muted', text: TEXT.skillUses(x.uses) + (x.helpfulAvg === null ? '' : ', ' + TEXT.skillHelped(Math.round(x.helpfulAvg * 100))) }))))));
    }
    if (iv.sentences.length) cards.push(insightCard('mood', TEXT.moodTitle, iv, iv.sentences.map((t) => h('p', { text: t }))));
    if (iv.predictions) cards.push(insightCard('predictions', TEXT.predTitle, iv, h('p', { text: TEXT.predLine(iv.predictions) })));
    if (iv.motivation.length) {
      cards.push(insightCard('motivation', TEXT.motTitle, iv, h('ul', { class: 'tr-list' },
        iv.motivation.map((x) => h('li', { text: TEXT.motLine(shortDate(x.date), x.score) })))));
    }
    return cards;
  }

  function insightsPage(c) {
    const iv = insightsView(c.view, c.now, E_(c));
    let body;
    if (!iv.engine && iv.count >= 7) {
      body = [h('section', { class: 'card stack' }, h('p', { 'data-test': 'insights-unavailable', text: TEXT.insightsMissing }),
        link('#/track', TEXT.backToTrack, 'btn', 'insights-back'))];
    } else if (!iv.ready) {
      body = [h('section', { class: 'card stack' }, h('p', { 'data-test': 'insights-empty', text: TEXT.insightsSoon(iv.count) }),
        link('#/track/log', TEXT.logFirst, 'btn primary', 'insights-log'))];
    } else {
      body = [h('p', { class: 'muted', text: TEXT.insightsLead(iv.count) })].concat(insightsCards(iv));
    }
    return h('section', { class: 'page stack tr-page', 'data-test': 'insights-page' },
      header(c, TEXT.insightsTitle, '#/track'), body);
  }

  function page(ctxIn) {
    const x = ctxIn || {};
    const c = {
      view: x.view || { get: () => null, list: () => [], count: () => 0 },
      E: E_(x), A: x.A || ns('Actions'), profile: isObj(x.profile) ? x.profile : {}, settings: isObj(x.settings) ? x.settings : {},
      now: x.now || new Date(), calm: !!x.calm, route: x.route || { path: '/track', parts: ['track'], query: {} }, go: x.go,
    };
    const rt = routeOf(c.route);
    if (rt.view === 'choose') return choosePage(c);
    if (rt.view === 'log') return logPage(c, rt);
    if (rt.view === 'insights') return insightsPage(c);
    return homePage(c);
  }

  const PURE = ['TEXT', 'KINDS', 'localDate', 'timeline', 'timelineCount', 'insightCount', 'insightsView', 'triggerOptions', 'formToLog', 'save',
    'rowText', 'countersData', 'routeOf'];
  return {
    TEXT, KINDS, localDate, timeline, timelineCount, insightCount, insightsView, triggerOptions, formToLog, save, rowText, countersData, routeOf,
    page, PURE,
  };
})();

if (typeof UI !== 'undefined' && UI && UI.pages) UI.pages.track = (ctx) => TrackUI.page(ctx);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
  for (const k of TrackUI.PURE) module.exports[k] = TrackUI[k];
}
