/* 1-addic · ui-exercise.js · the exercise engine (BUILD-PLAN 3.8; lane learn, unit U-12).
   Contract: docs/offline/build-2026-11-07/tracks/CORE/contracts/learn.md ("ExerciseUI").
   One renderer per field type of 3.8, tutorial and workbook modes, examples and hints, "Finish later" drafts,
   and the #/dev/fields gallery. The field logic (default values, the payload round trip, validation, draft resume,
   options) is pure and loads in Node through the module.exports guard at the end; DOM code runs only inside
   functions called from a page. Content, Engine, Store, Actions and UI are read only when they are defined
   (typeof X !== 'undefined'), never through globalThis. Responses are written only by Actions.saveResponse
   (append-only); this file writes no events, no storage and makes no network request. Text is always text. */
const ExerciseUI = (function () {
  'use strict';

  const FIELD_TYPES = ['check', 'check2', 'single', 'slider', 'text', 'textarea', 'list', 'matrix2x2', 'pair', 'rows',
    'template', 'bodymap', 'date', 'number', 'yesno', 'percent', 'contactPicker', 'rating', 'topN'];
  const CELLS = ['q1', 'q2', 'q3', 'q4'];
  // Body map regions (front figure). The SVG is decoration; every region is also a real button.
  const REGIONS = [
    { id: 'head', label: 'Head', shapes: [['circle', { cx: 60, cy: 22, r: 16 }]] },
    { id: 'throat', label: 'Throat', shapes: [['rect', { x: 53, y: 38, width: 14, height: 11 }]] },
    { id: 'shoulders', label: 'Shoulders', shapes: [['rect', { x: 28, y: 49, width: 64, height: 12, rx: 6 }]] },
    { id: 'chest', label: 'Chest', shapes: [['rect', { x: 36, y: 61, width: 48, height: 31 }]] },
    { id: 'stomach', label: 'Stomach', shapes: [['rect', { x: 38, y: 92, width: 44, height: 34 }]] },
    { id: 'arms', label: 'Arms', shapes: [['rect', { x: 15, y: 56, width: 13, height: 70, rx: 6 }], ['rect', { x: 92, y: 56, width: 13, height: 70, rx: 6 }]] },
    { id: 'hands', label: 'Hands', shapes: [['circle', { cx: 21, cy: 134, r: 8 }], ['circle', { cx: 99, cy: 134, r: 8 }]] },
    { id: 'legs', label: 'Legs', shapes: [['rect', { x: 40, y: 126, width: 18, height: 88, rx: 6 }], ['rect', { x: 62, y: 126, width: 18, height: 88, rx: 6 }]] },
    { id: 'feet', label: 'Feet', shapes: [['ellipse', { cx: 48, cy: 222, rx: 11, ry: 6 }], ['ellipse', { cx: 72, cy: 222, rx: 11, ry: 6 }]] },
    { id: 'back', label: 'Back', shapes: [] },
  ];
  const TEXT = {
    required: 'Please answer this one, or tap Finish later to come back to it.',
    range: (min, max) => `Please use a number from ${min} to ${max}.`,
    date: 'Please pick a date.',
    number: 'Please check this number.',
    summary: 'A few answers are still needed. They are marked below.',
    save: 'Save', later: 'Finish later', fresh: 'Start fresh',
    draftNote: (d) => `Draft from ${d}. You can carry on where you left off.`,
    saved: 'Saved.', savedLater: 'Saved for later.',
    cantSave: 'Saving is not available in this version yet.',
    skipTitle: 'You can skip this',
    skipText: 'This one asks about things that can be hard to look at. Take it at your own pace, or skip it for now and come back any time.',
    goOn: 'Continue', skip: 'Skip for now',
    missingTitle: 'Not available yet',
    missingText: 'This exercise is not in this version of the app yet.',
    back: 'Go back',
    example: (name) => `How ${name} filled it in`,
    exampleNote: 'An example only. Your answers can look different.',
    history: 'Earlier entries',
    noContacts: 'No one is saved yet. You can add people to your Workbook first, then pick them here.',
    add: 'Add', remove: 'Remove', none: 'No one picked',
    yes: 'Yes', no: 'No',
    topNEmpty: 'Tick some items above first; then pick from them here.',
  };
  // Shown only when Engine.crisisKeywords finds crisis words in a typed answer. It never blocks saving.
  const URGENT_LINE = { clinicalReview: true, text: 'If you might be in danger, urgent help is one tap away.', link: 'Urgent help', route: '#/sos/urgent' };

  /* ── small helpers (pure) ─────────────────────────────────────────────────────────────────── */
  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const str = (v) => (typeof v === 'string' ? v.trim() : (typeof v === 'number' && Number.isFinite(v) ? String(v) : ''));
  const toNum = (v) => {
    if (v === null || v === undefined || v === '' || typeof v === 'boolean') return null;
    const n = typeof v === 'number' ? v : Number(String(v).trim());
    return Number.isFinite(n) ? n : null;
  };
  const uniq = (arr) => { const seen = new Set(); return arr.filter((x) => (seen.has(x) ? false : (seen.add(x), true))); };
  const strList = (v, max) => {
    const out = uniq((Array.isArray(v) ? v : []).map(str).filter(Boolean));
    return max > 0 ? out.slice(0, max) : out;
  };
  const freeList = (v, max) => { // a person's own list: repeats are allowed, blanks are dropped
    const out = (Array.isArray(v) ? v : []).map(str).filter(Boolean);
    return max > 0 ? out.slice(0, max) : out;
  };
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const triggerId = (group, label) => `${group}:${slug(label)}`;
  const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
  const validDate = (s) => {
    const m = DATE_RE.exec(s);
    if (!m) return false;
    const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
  };
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
  const blanksOf = (field) => (Array.isArray(field.parts) ? field.parts : [])
    .filter((p) => isObj(p) && typeof p.blank === 'string' && p.blank).map((p) => p.blank);
  const columnsOf = (field) => (Array.isArray(field.columns) ? field.columns : [])
    .filter((c) => isObj(c) && typeof c.id === 'string' && c.id);
  const regionsOf = (field) => (Array.isArray(field.options) && field.options.length ? field.options.map(optionOf) : REGIONS);
  const sliderMin = (f) => (toNum(f.min) !== null ? toNum(f.min) : 0);
  const sliderMax = (f) => (toNum(f.max) !== null ? toNum(f.max) : 10);
  const topNMax = (f) => (toNum(f.max) > 0 ? Math.floor(toNum(f.max)) : 3);
  const sourceOf = (spec, field) => {
    const fields = (spec && spec.fields) || [];
    if (field.source) return fields.find((f) => f.id === field.source) || null;
    const at = fields.indexOf(field);
    for (let i = (at < 0 ? fields.length : at) - 1; i >= 0; i--) if (fields[i].type === 'check' || fields[i].type === 'check2') return fields[i];
    return null;
  };
  const checkedIds = (field, value) => (field.type === 'check2'
    ? Object.keys(isObj(value) ? value : {}).filter((k) => value[k] && (value[k].done || value[k].often))
    : (Array.isArray(value) ? value : []));

  /* ── default value, normalising, the payload round trip ───────────────────────────────────── */
  function defaultValue(field) {
    const f = field || {};
    switch (f.type) {
      case 'check': case 'list': case 'pair': case 'rows': case 'bodymap': case 'topN': return [];
      case 'check2': return {};
      case 'slider': {
        const d = toNum(f.default);
        return d !== null ? Math.min(sliderMax(f), Math.max(sliderMin(f), d)) : sliderMin(f);
      }
      case 'text': case 'textarea': case 'date': return '';
      case 'matrix2x2': return { q1: [], q2: [], q3: [], q4: [] };
      case 'template': { const o = {}; for (const b of blanksOf(f)) o[b] = ''; return o; }
      case 'single': case 'number': case 'yesno': case 'percent': case 'contactPicker': case 'rating': return null;
      default: return null;
    }
  }

  // One field's value in its payload shape (contracts/learn.md). `siblings` are the already normalised values of the
  // other fields (topN reads its source field from them).
  function normalise(field, v, spec, siblings) {
    const f = field || {};
    const max = toNum(f.max) > 0 ? Math.floor(toNum(f.max)) : 0;
    switch (f.type) {
      case 'check': return strList(v, 0);
      case 'check2': {
        const out = {};
        if (isObj(v)) {
          for (const k of Object.keys(v)) {
            const m = v[k];
            if (!k || !isObj(m)) continue;
            const often = !!m.often; const done = !!m.done || often; // frequent implies it has happened
            if (done) out[k] = { done, often };
          }
        }
        return out;
      }
      case 'single': return str(v) || null;
      case 'slider': {
        const n = toNum(v);
        return n === null ? defaultValue(f) : Math.min(sliderMax(f), Math.max(sliderMin(f), n));
      }
      case 'text': case 'textarea': return str(v);
      case 'list': return freeList(v, max);
      case 'matrix2x2': {
        const src = isObj(v) ? v : {};
        const out = {};
        for (const q of CELLS) out[q] = freeList(src[q], max);
        return out;
      }
      case 'pair': {
        const out = (Array.isArray(v) ? v : []).filter(isObj).map((p) => ({ left: str(p.left), right: str(p.right) }))
          .filter((p) => p.left || p.right);
        return max ? out.slice(0, max) : out;
      }
      case 'rows': {
        const cols = columnsOf(f);
        const out = (Array.isArray(v) ? v : []).filter(isObj).map((r) => {
          const row = {};
          for (const c of cols) row[c.id] = c.type === 'number' ? toNum(r[c.id]) : str(r[c.id]);
          return row;
        }).filter((r) => cols.some((c) => r[c.id] !== null && r[c.id] !== ''));
        return max ? out.slice(0, max) : out;
      }
      case 'template': {
        const src = isObj(v) ? v : {};
        const out = {};
        for (const b of blanksOf(f)) out[b] = str(src[b]);
        return out;
      }
      case 'bodymap': {
        const ids = new Set(regionsOf(f).map((r) => r.id));
        return strList(v, 0).filter((id) => ids.has(id));
      }
      case 'date': { const s = str(v); return validDate(s) ? s : ''; }
      case 'number': return toNum(v);
      case 'yesno': return v === true || v === 'yes' || v === 'true' ? true : (v === false || v === 'no' || v === 'false' ? false : null);
      case 'percent': { const n = toNum(v); return n === null ? null : Math.min(100, Math.max(0, Math.round(n))); }
      case 'contactPicker': return str(v) || null;
      case 'rating': { const n = toNum(v); return n === null || n < 1 || n > 5 ? null : Math.round(n); }
      case 'topN': {
        const src = sourceOf(spec, f);
        const allowed = new Set(src ? checkedIds(src, siblings ? siblings[src.id] : undefined) : []);
        const seen = new Set();
        const out = [];
        for (const p of Array.isArray(v) ? v : []) {
          const item = isObj(p) ? str(p.item) : str(p);
          if (!item || seen.has(item) || !allowed.has(item)) continue;
          seen.add(item);
          out.push({ item, plan: isObj(p) ? str(p.plan) : '' });
        }
        return out.slice(0, topNMax(f));
      }
      default: return v === undefined ? null : v;
    }
  }

  function normaliseAll(spec, values) {
    const src = isObj(values) ? values : {};
    const fields = (spec && Array.isArray(spec.fields)) ? spec.fields : [];
    const out = {};
    for (const f of fields) if (f.type !== 'topN') out[f.id] = own(src, f.id) ? normalise(f, src[f.id], spec, out) : defaultValue(f);
    for (const f of fields) if (f.type === 'topN') out[f.id] = own(src, f.id) ? normalise(f, src[f.id], spec, out) : defaultValue(f);
    return out;
  }
  // values (the form's state) -> the stored payload, keyed by field id.
  const toPayload = (spec, values) => normaliseAll(spec, values);
  // A stored payload -> form values: the exact inverse (missing fields take their default value).
  const fromPayload = (spec, payload) => normaliseAll(spec, payload);

  function isEmpty(field, v) {
    switch (field.type) {
      case 'check': case 'list': case 'pair': case 'rows': case 'bodymap': case 'topN': return !Array.isArray(v) || v.length === 0;
      case 'check2': return !isObj(v) || Object.keys(v).length === 0;
      case 'matrix2x2': return !isObj(v) || CELLS.every((q) => !(v[q] || []).length);
      case 'template': return blanksOf(field).some((b) => !(v && v[b]));
      case 'text': case 'textarea': case 'date': return !v;
      case 'slider': return v === null || v === undefined;
      default: return v === null || v === undefined || v === '';
    }
  }

  // Required fields (no `optional: true`) block a final save; a draft is never validated.
  function validate(spec, values, opts) {
    if (opts && opts.draft) return { ok: true, errors: {} };
    const errors = {};
    const raw = isObj(values) ? values : {};
    const v = normaliseAll(spec, raw);
    for (const f of (spec && spec.fields) || []) {
      const val = v[f.id];
      if (f.type === 'number' && val !== null) {
        const min = toNum(f.min); const max = toNum(f.max);
        if ((min !== null && val < min) || (max !== null && val > max)) { errors[f.id] = min !== null && max !== null ? TEXT.range(min, max) : TEXT.number; continue; }
      }
      if (f.type === 'date' && str(raw[f.id]) && !val) { errors[f.id] = TEXT.date; continue; }
      if (!f.optional && isEmpty(f, val)) errors[f.id] = TEXT.required;
    }
    return { ok: Object.keys(errors).length === 0, errors };
  }

  /* ── options ──────────────────────────────────────────────────────────────────────────────── */
  function optionOf(o) {
    if (isObj(o)) {
      const id = str(o.id != null ? o.id : (o.value != null ? o.value : (o.label || o.name || o.t)));
      const label = str(o.label != null ? o.label : (o.name != null ? o.name : (o.t != null ? o.t : id)));
      const out = { id, label: label || id };
      if (o.group) out.group = String(o.group);
      return out;
    }
    const s = str(o);
    return { id: s, label: s };
  }
  function pathIn(root, path) {
    let cur = root;
    for (const k of String(path).split('.')) {
      if (!k || cur === null || typeof cur !== 'object' || !own(cur, k)) return undefined;
      cur = cur[k];
    }
    return cur;
  }
  // [{id, label, group?}] for a field: its own options, a path into Content ('catalogs.x'), the trigger catalog
  // flattened ('triggers'), or the person's contacts filtered by role ('contacts').
  function optionsFor(field, view, content) {
    const f = field || {};
    const C = content || ns('Content') || {};
    if (f.type === 'bodymap') return regionsOf(f).map((r) => ({ id: r.id, label: r.label }));
    if (Array.isArray(f.options)) return f.options.map(optionOf).filter((o) => o.id);
    if (f.from === 'triggers' || f.from === 'catalogs.triggers') {
      const groups = pathIn(C, 'catalogs.triggers');
      const out = [];
      if (isObj(groups)) {
        for (const g of Object.keys(groups)) {
          for (const item of Array.isArray(groups[g]) ? groups[g] : []) {
            const o = optionOf(item);
            if (!o.id) continue;
            out.push({ id: isObj(item) && item.id ? o.id : triggerId(g, o.label), label: o.label, group: g });
          }
        }
      }
      return out;
    }
    if (f.from === 'contacts') {
      const rows = view && typeof view.list === 'function' ? (view.list('contacts') || []) : [];
      const roles = f.role ? [].concat(f.role) : null;
      return rows.filter((c) => isObj(c) && c.id && c.active !== false && (!roles || roles.includes(c.role)))
        .map((c) => ({ id: String(c.id), label: str(c.name) || 'Unnamed' }));
    }
    if (typeof f.from === 'string' && f.from) {
      const list = pathIn(C, f.from);
      if (Array.isArray(list)) return list.map(optionOf).filter((o) => o.id);
      if (isObj(list)) return Object.keys(list).map((k) => optionOf(isObj(list[k]) ? Object.assign({ id: k }, list[k]) : { id: k, label: list[k] }));
    }
    return [];
  }

  /* ── responses: resume, history, start values ─────────────────────────────────────────────── */
  const rowsFor = (responses, exerciseId) => (Array.isArray(responses) ? responses : [])
    .map((r, i) => ({ r, i })).filter((x) => isObj(x.r) && x.r.exerciseId === exerciseId)
    .sort((a, b) => (String(a.r.at) < String(b.r.at) ? -1 : String(a.r.at) > String(b.r.at) ? 1 : a.i - b.i))
    .map((x) => x.r);
  // {draft, final}: the newest final (non-draft) response, and the newest draft only when it is newer than that final.
  function resume(responses, exerciseId) {
    const rows = rowsFor(responses, exerciseId);
    let final = null; let draft = null; let finalAt = -1; let draftAt = -1;
    rows.forEach((r, i) => { if (r.draft) { draft = r; draftAt = i; } else { final = r; finalAt = i; } });
    return { draft: draft && draftAt > finalAt ? draft : null, final };
  }
  const history = (responses, exerciseId) => rowsFor(responses, exerciseId).filter((r) => !r.draft).reverse();

  // What a form opens with. Tutorial and repeat exercises start empty; workbook mode prefills the last final
  // response; a newer draft wins in either mode. `base` is what "Start fresh" goes back to.
  function startState(spec, responses, mode) {
    const id = spec && spec.id;
    const { draft, final } = resume(responses, id);
    const prefill = mode === 'workbook' && !spec.repeat && final;
    const base = prefill ? fromPayload(spec, final.payload) : fromPayload(spec, {});
    return {
      values: draft ? fromPayload(spec, draft.payload) : base,
      base,
      draftAt: draft ? draft.at : null,
      history: mode === 'workbook' && spec.repeat ? history(responses, id) : [],
    };
  }

  function exerciseFor(id, content) {
    if (id === SAMPLE_SPEC.id) return SAMPLE_SPEC;
    const C = content || ns('Content');
    const ex = C && C.exercises;
    if (Array.isArray(ex)) return ex.find((x) => isObj(x) && x.id === id) || null;
    if (isObj(ex) && own(ex, id) && isObj(ex[id])) return Object.assign({ id }, ex[id]);
    return null;
  }

  // A short plain-text reading of one answer (the tutorial example and the history list use it).
  function summarize(field, value, view, content, spec, values) {
    const label = (id) => {
      const src = field.type === 'topN' ? sourceOf(spec, field) : field;
      const o = src ? optionsFor(src, view, content).find((x) => x.id === id) : null;
      return o ? o.label : String(id);
    };
    const v = normalise(field, value, spec, values || {});
    switch (field.type) {
      case 'check': case 'bodymap': return v.map(label).join(', ');
      case 'check2': return Object.keys(v).map((k) => label(k) + (v[k].often ? ' (often)' : '')).join(', ');
      case 'single': case 'contactPicker': return v ? label(v) : '';
      case 'list': return v.join('; ');
      case 'matrix2x2': return CELLS.map((q, i) => `${cellLabel(field, i)}: ${v[q].join(', ') || '-'}`).join(' · ');
      case 'pair': return v.map((p) => `${p.left} → ${p.right}`).join('; ');
      case 'rows': return v.map((r) => columnsOf(field).map((c) => (r[c.id] === null ? '' : String(r[c.id]))).filter(Boolean).join(', ')).join('; ');
      case 'template': return (field.parts || []).map((p) => (isObj(p) ? (v[p.blank] || '___') : String(p))).join('');
      case 'yesno': return v === null ? '' : (v ? TEXT.yes : TEXT.no);
      case 'percent': return v === null ? '' : v + '%';
      case 'rating': return v === null ? '' : `${v} of 5`;
      case 'topN': return v.map((p) => label(p.item) + (p.plan ? `: ${p.plan}` : '')).join('; ');
      default: return v === null || v === undefined ? '' : String(v);
    }
  }
  const cellLabel = (field, i) => {
    const c = Array.isArray(field.cells) ? field.cells[i] : null;
    return (isObj(c) ? str(c.label) : str(c)) || (Array.isArray(field.labels) && str(field.labels[i])) || `Box ${i + 1}`;
  };
  const cellSuggestions = (field, i) => {
    const c = Array.isArray(field.cells) ? field.cells[i] : null;
    return isObj(c) && Array.isArray(c.suggestions) ? c.suggestions.map(str).filter(Boolean) : [];
  };

  // True when any typed answer (text, textarea) holds crisis words, per Engine.crisisKeywords. Never blocks saving.
  function crisisCheck(spec, values, engine) {
    const E = engine || ns('Engine');
    if (!E || typeof E.crisisKeywords !== 'function') return false;
    for (const f of (spec && spec.fields) || []) {
      if (f.type !== 'text' && f.type !== 'textarea') continue;
      const t = values ? values[f.id] : '';
      try { if (typeof t === 'string' && t && E.crisisKeywords(t) === true) return true; } catch (e) { /* ignore */ }
    }
    return false;
  }

  /* ── the sample spec: one field of every type (the #/dev/fields gallery; no Content.exercises needed) ── */
  const SAMPLE_CONTACTS = [
    { id: 'sample-asha', name: 'Asha (sample)', role: 'safetyNet', active: true },
    { id: 'sample-nikhil', name: 'Nikhil (sample)', role: 'safetyNet', active: true },
    { id: 'sample-old-crowd', name: 'The old crowd (sample)', role: 'risky', active: true },
  ];
  const SAMPLE_SPEC = {
    id: 'dev-fields', title: 'Field gallery', book: { chapter: 0, exercise: 'dev' }, kind: 'practice', sample: true,
    fields: [
      { id: 'pick-triggers', type: 'check', label: 'Which of these can set off a craving for you?', from: 'triggers', allowCustom: true },
      { id: 'signs', type: 'check2', label: 'Which of these have happened, and which happen often?', options: [
        { id: 'more', label: 'Using more than I planned' }, { id: 'cut-down', label: 'Trying to cut down and finding it hard' },
        { id: 'time', label: 'Losing hours to it' }, { id: 'missed', label: 'Missing work, study or family things' }] },
      { id: 'stage', type: 'single', label: 'Where are you right now?', options: [
        { id: 'thinking', label: 'Thinking about it' }, { id: 'ready', label: 'Getting ready' },
        { id: 'changing', label: 'Making changes' }, { id: 'keeping', label: 'Keeping it going' }] },
      { id: 'ready', type: 'slider', label: 'How ready do you feel to make a change?', min: 0, max: 10, labels: ['Not at all', 'Completely'] },
      { id: 'one-word', type: 'text', label: 'One word for how today feels', optional: true },
      { id: 'different', type: 'textarea', label: 'What would be different if things changed?' },
      { id: 'reasons', type: 'list', label: 'Up to three reasons that matter to you', max: 3 },
      { id: 'weigh', type: 'matrix2x2', label: 'Weigh it up', cells: [
        { label: 'Good things about using', suggestions: ['It helps me relax'] },
        { label: 'Not-so-good things about using', suggestions: ['Money', 'Sleep'] },
        { label: 'Good things about changing', suggestions: ['More energy'] },
        { label: 'Hard things about changing', suggestions: ['Evenings feel empty'] }] },
      { id: 'thought-reply', type: 'pair', label: 'A thought, and your answer to it', prompts: { left: 'The thought', right: 'My answer' }, max: 5 },
      { id: 'moments', type: 'rows', label: 'Plan a few moments this week', max: 5, columns: [
        { id: 'when', label: 'When' }, { id: 'what', label: 'What I will do' }, { id: 'minutes', label: 'Minutes', type: 'number' }] },
      { id: 'promise', type: 'template', label: 'Finish the sentence', parts: [
        'When I feel ', { blank: 'feeling', label: 'a feeling' }, ', I will ', { blank: 'action', label: 'something you will do' }, '.'] },
      { id: 'body', type: 'bodymap', label: 'Where do you notice a craving in your body?' },
      { id: 'start', type: 'date', label: 'Pick a start date' },
      { id: 'water', type: 'number', label: 'Glasses of water today', min: 0, max: 30, optional: true },
      { id: 'told', type: 'yesno', label: 'Have you told anyone about this plan?', optional: true },
      { id: 'sure', type: 'percent', label: 'How sure are you, from 0 to 100?' },
      { id: 'person', type: 'contactPicker', label: 'Who could you call?', from: 'contacts', role: 'safetyNet' },
      { id: 'helpful', type: 'rating', label: 'How helpful was this?' },
      { id: 'top', type: 'topN', label: 'Pick your top two and plan for each', source: 'pick-triggers', max: 2 },
    ],
    tutorial: {
      example: { cast: 'meera', values: {
        'pick-triggers': ['internal:stress', 'internal:loneliness', 'Long evenings alone'],
        signs: { more: { done: true, often: true }, time: { done: true, often: false } },
        stage: 'changing', ready: 7, 'one-word': 'Tired', different: 'Mornings would feel clear, and my son would not have to wonder.',
        reasons: ['My son', 'My health', 'Sleep'],
        weigh: { q1: ['It helps me relax'], q2: ['Money', 'Sleep'], q3: ['More energy'], q4: ['Evenings feel empty'] },
        'thought-reply': [{ left: 'Just one.', right: 'One has never stayed one.' }],
        moments: [{ when: 'Tuesday 8 pm', what: 'Walk to the temple and back', minutes: 30 }],
        promise: { feeling: 'lonely', action: 'call my sister' }, body: ['chest', 'hands'], start: '2026-11-09',
        water: 6, told: true, sure: 70, person: 'sample-asha', helpful: 4,
        top: [{ item: 'internal:stress', plan: 'Ten minutes on the balcony first' }, { item: 'internal:loneliness', plan: 'Call my sister' }],
      } },
      hints: {
        'pick-triggers': 'Tick as many as fit. You can add your own.',
        different: 'A sentence or two is plenty.',
        top: 'Only the items you ticked in the first question show here.',
      },
      built: 'You tried every kind of field.',
    },
    events: ['ExerciseDone'],
  };

  /* ── DOM (runs only when called from a page) ──────────────────────────────────────────────── */
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
  let seq = 0;
  const uid = (p) => `lx-${p}-${++seq}`;
  const btn = (text, onClick, extra) => h('button', Object.assign({ type: 'button', class: 'btn', text, onClick }, extra || {}));
  const toast = (msg, tone) => { const U = ns('UI'); if (U && typeof U.toast === 'function') U.toast(msg, tone); };
  const go = (r) => { const U = ns('UI'); if (U && typeof U.go === 'function') U.go(r); else if (typeof location !== 'undefined') location.hash = r; };
  const fmtDate = (at) => {
    const E = ns('Engine');
    if (E && typeof E.fmtDate === 'function') { try { const s = E.fmtDate(at); if (s) return s; } catch (e) { /* fall through */ } }
    const d = new Date(at);
    return Number.isNaN(d.getTime()) ? String(at) : d.toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // An editable list of strings (list, matrix cells). onChange(newArray).
  function listEditor(items, onChange, o) {
    const box = h('div', { class: 'stack lx-list' });
    let arr = items.slice();
    const paint = () => {
      box.textContent = '';
      arr.forEach((t, i) => {
        const inp = h('input', { type: 'text', value: t, 'aria-label': `${o.label}, item ${i + 1}`, autocomplete: 'off' });
        inp.addEventListener('input', () => { arr[i] = inp.value; onChange(arr.slice()); });
        box.appendChild(h('div', { class: 'row' }, inp, btn(TEXT.remove, () => { arr.splice(i, 1); onChange(arr.slice()); paint(); }, { 'aria-label': `${TEXT.remove} item ${i + 1}` })));
      });
      if (!o.max || arr.length < o.max) {
        const inp = h('input', { type: 'text', 'aria-label': `${o.label}, new item`, autocomplete: 'off' });
        const addIt = () => { const t = inp.value.trim(); if (!t) return; arr.push(t); onChange(arr.slice()); paint(); const n = box.querySelector('input:last-of-type'); if (n) n.focus(); };
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addIt(); } });
        box.appendChild(h('div', { class: 'row' }, inp, btn(TEXT.add, addIt)));
      }
    };
    paint();
    box.set = (v) => { arr = v.slice(); paint(); };
    return box;
  }
  function toggle(label, on, onClick, extra) {
    const b = h('button', Object.assign({ type: 'button', class: 'chip', 'aria-pressed': on ? 'true' : 'false', text: label }, extra || {}));
    b.addEventListener('click', () => { onClick(); });
    return b;
  }
  const setPressed = (b, on) => { b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.classList.toggle('on', !!on); };

  // Each renderer: (field, c) -> Node, where c = {id, get(), set(v), options(), labelId, describedBy, refresh hooks}.
  const RENDER = {
    check(f, c) {
      const opts = c.options();
      const fs = h('fieldset', { class: 'choices', 'aria-describedby': c.describedBy }, h('legend', { class: 'field-label', text: f.label }));
      const groups = uniq(opts.map((o) => o.group || ''));
      const boxes = [];
      for (const g of groups) {
        if (g) fs.appendChild(h('p', { class: 'muted lx-group', text: g.charAt(0).toUpperCase() + g.slice(1) }));
        for (const o of opts.filter((x) => (x.group || '') === g)) {
          const bid = uid('opt');
          const b = h('input', { type: 'checkbox', id: bid, value: o.id, checked: c.get().includes(o.id) });
          b.addEventListener('change', () => { const cur = c.get().filter((x) => x !== o.id); c.set(b.checked ? cur.concat(o.id) : cur); });
          boxes.push(b);
          fs.appendChild(h('div', { class: 'choice' }, b, h('label', { for: bid, text: o.label })));
        }
      }
      if (f.allowCustom) {
        const known = new Set(opts.map((o) => o.id));
        const custom = listEditor(c.get().filter((x) => !known.has(x)), (arr) => {
          c.set(c.get().filter((x) => known.has(x)).concat(arr));
        }, { label: 'Your own' });
        fs.appendChild(h('p', { class: 'muted', text: 'Your own:' }));
        fs.appendChild(custom);
      }
      return fs;
    },
    check2(f, c) {
      const fs = h('fieldset', { class: 'choices', 'aria-describedby': c.describedBy }, h('legend', { class: 'field-label', text: f.label }),
        h('p', { class: 'muted', text: '✓ means it has happened. ★ means it happens often.' }));
      for (const o of c.options()) {
        const cur = () => c.get()[o.id] || { done: false, often: false };
        const write = (m) => { const v = Object.assign({}, c.get()); if (m.done || m.often) v[o.id] = m; else delete v[o.id]; c.set(v); paint(); };
        const done = toggle('✓', cur().done, () => { const m = cur(); write({ done: !m.done, often: m.done ? false : m.often }); }, { 'aria-label': `${o.label}: has happened` });
        const often = toggle('★', cur().often, () => { const m = cur(); write({ done: m.often ? m.done : true, often: !m.often }); }, { 'aria-label': `${o.label}: happens often` });
        const paint = () => { setPressed(done, cur().done); setPressed(often, cur().often); };
        paint();
        fs.appendChild(h('div', { class: 'row lx-check2' }, h('span', { text: o.label }), done, often));
      }
      return fs;
    },
    single(f, c) { return radios(f, c, c.options(), c.get(), (v) => c.set(v)); },
    yesno(f, c) {
      const cur = c.get();
      return radios(f, c, [{ id: 'yes', label: TEXT.yes }, { id: 'no', label: TEXT.no }], cur === null ? null : (cur ? 'yes' : 'no'), (v) => c.set(v === 'yes'));
    },
    rating(f, c) {
      const cur = c.get();
      return radios(f, c, [1, 2, 3, 4, 5].map((n) => ({ id: String(n), label: String(n), aria: `${n} of 5` })), cur === null ? null : String(cur), (v) => c.set(Number(v)), true);
    },
    slider(f, c) {
      const min = sliderMin(f); const max = sliderMax(f);
      const input = h('input', { type: 'range', id: c.id, min, max, step: f.step || 1, value: c.get(), 'aria-describedby': c.describedBy });
      const out = h('output', { class: 'slider-value', for: c.id, text: String(c.get()) });
      input.addEventListener('input', () => { out.textContent = input.value; c.set(Number(input.value)); });
      const ends = Array.isArray(f.labels) && f.labels.length
        ? h('div', { class: 'slider-ends', 'aria-hidden': 'true' }, h('span', { text: f.labels[0] }), h('span', { text: f.labels[f.labels.length - 1] })) : null;
      return h('div', {}, h('div', { class: 'row slider-head' }, h('label', { class: 'field-label', for: c.id, text: f.label }), out), input, ends);
    },
    text(f, c) { return inputField(f, c, 'text'); },
    textarea(f, c) {
      const input = h('textarea', { id: c.id, rows: f.rows || 4, 'aria-describedby': c.describedBy, value: c.get() });
      input.addEventListener('input', () => c.set(input.value, true));
      return h('div', {}, h('label', { class: 'field-label', for: c.id, text: f.label }), input);
    },
    date(f, c) { return inputField(f, c, 'date'); },
    number(f, c) { return inputField(f, c, 'number'); },
    percent(f, c) {
      const el = inputField(f, c, 'number', { min: 0, max: 100 });
      el.appendChild(h('span', { class: 'muted', 'aria-hidden': 'true', text: ' %' }));
      return el;
    },
    list(f, c) {
      return h('div', { role: 'group', 'aria-labelledby': c.labelId, 'aria-describedby': c.describedBy },
        h('p', { class: 'field-label', id: c.labelId, text: f.label }),
        f.max ? h('p', { class: 'muted', text: `Up to ${f.max}.` }) : null,
        listEditor(c.get(), (arr) => c.set(arr), { label: f.label, max: toNum(f.max) || 0 }));
    },
    matrix2x2(f, c) {
      const grid = h('div', { class: 'lx-matrix', style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' } });
      CELLS.forEach((q, i) => {
        const name = cellLabel(f, i);
        const cellId = uid('cell');
        const editor = listEditor(c.get()[q] || [], (arr) => { const v = Object.assign({}, c.get()); v[q] = arr; c.set(v); }, { label: name, max: toNum(f.max) || 0 });
        const sugg = cellSuggestions(f, i);
        const chipsEl = sugg.length ? h('div', { class: 'chips', role: 'group', 'aria-label': `Ideas for ${name}` },
          sugg.map((s) => h('button', { type: 'button', class: 'chip', text: '+ ' + s, onClick: () => {
            const v = Object.assign({}, c.get()); v[q] = (v[q] || []).concat(s); c.set(v); editor.set(v[q]);
          } }))) : null;
        grid.appendChild(h('div', { class: 'card lx-cell', role: 'group', 'aria-labelledby': cellId }, h('p', { class: 'field-label', id: cellId, text: name }), chipsEl, editor));
      });
      return h('div', { role: 'group', 'aria-labelledby': c.labelId, 'aria-describedby': c.describedBy }, h('p', { class: 'field-label', id: c.labelId, text: f.label }), grid);
    },
    pair(f, c) {
      const p = isObj(f.prompts) ? f.prompts : {};
      const cols = [{ id: 'left', label: str(p.left) || 'This' }, { id: 'right', label: str(p.right) || 'That' }];
      return rowEditor(f, c, cols);
    },
    rows(f, c) { return rowEditor(f, c, columnsOf(f).map((col) => ({ id: col.id, label: str(col.label) || col.id, type: col.type }))); },
    template(f, c) {
      const line = h('p', { class: 'lx-template' });
      for (const part of Array.isArray(f.parts) ? f.parts : []) {
        if (isObj(part) && part.blank) {
          const inp = h('input', { type: 'text', value: c.get()[part.blank] || '', 'aria-label': str(part.label) || part.blank, placeholder: str(part.label), autocomplete: 'off', style: { width: '12em', maxWidth: '100%' } });
          inp.addEventListener('input', () => { const v = Object.assign({}, c.get()); v[part.blank] = inp.value; c.set(v); });
          line.appendChild(inp);
        } else line.appendChild(document.createTextNode(String(part)));
      }
      return h('div', { role: 'group', 'aria-labelledby': c.labelId, 'aria-describedby': c.describedBy }, h('p', { class: 'field-label', id: c.labelId, text: f.label }), line);
    },
    bodymap(f, c) {
      const regions = regionsOf(f);
      const U = ns('UI');
      const shapes = {};
      let fig = null;
      if (U && typeof U.svg === 'function') {
        fig = U.svg('svg', { viewBox: '0 0 120 232', width: 120, height: 232, 'aria-hidden': 'true', focusable: 'false', class: 'lx-body' });
        for (const r of REGIONS) {
          if (!regions.some((x) => x.id === r.id)) continue;
          const g = U.svg('g', { 'data-region': r.id });
          for (const [tag, at] of r.shapes) g.appendChild(U.svg(tag, Object.assign({ stroke: 'currentColor', 'stroke-width': 1.5 }, at)));
          g.addEventListener('click', () => flip(r.id));
          g.style.cursor = 'pointer';
          shapes[r.id] = g;
          fig.appendChild(g);
        }
      }
      const buttons = {};
      const paint = () => {
        const cur = c.get();
        for (const r of regions) {
          const on = cur.includes(r.id);
          if (buttons[r.id]) setPressed(buttons[r.id], on);
          if (shapes[r.id]) shapes[r.id].style.fill = on ? 'hsl(var(--primary))' : 'hsl(var(--surface))';
        }
      };
      const flip = (id) => { const cur = c.get(); c.set(cur.includes(id) ? cur.filter((x) => x !== id) : cur.concat(id)); paint(); };
      const list = h('div', { class: 'chips', role: 'group', 'aria-labelledby': c.labelId },
        regions.map((r) => (buttons[r.id] = toggle(r.label, false, () => flip(r.id)))));
      paint();
      return h('div', { 'aria-describedby': c.describedBy }, h('p', { class: 'field-label', id: c.labelId, text: f.label }),
        h('div', { class: 'row lx-bodymap', style: { alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' } }, fig, list));
    },
    contactPicker(f, c) {
      const opts = c.options();
      if (!opts.length) return h('div', {}, h('p', { class: 'field-label', id: c.labelId, text: f.label }), h('p', { class: 'muted', text: TEXT.noContacts }));
      const sel = h('select', { id: c.id, 'aria-describedby': c.describedBy },
        h('option', { value: '', text: TEXT.none }), opts.map((o) => h('option', { value: o.id, text: o.label })));
      sel.value = c.get() || '';
      sel.addEventListener('change', () => c.set(sel.value || null));
      return h('div', {}, h('label', { class: 'field-label', for: c.id, text: f.label }), sel);
    },
    topN(f, c) {
      const box = h('div', { role: 'group', 'aria-labelledby': c.labelId, 'aria-describedby': c.describedBy });
      const n = topNMax(f);
      const paint = () => {
        box.textContent = '';
        box.appendChild(h('p', { class: 'field-label', id: c.labelId, text: f.label }));
        const src = sourceOf(c.spec, f);
        const picked = src ? checkedIds(src, c.values()[src.id]) : [];
        const labels = new Map((src ? optionsFor(src, c.view, c.content) : []).map((o) => [o.id, o.label]));
        if (!picked.length) { box.appendChild(h('p', { class: 'muted', text: TEXT.topNEmpty })); return; }
        const cur = c.get().filter((p) => picked.includes(p.item));
        box.appendChild(h('p', { class: 'muted', text: `Pick up to ${n}. ${cur.length} picked.` }));
        for (const id of picked) {
          const at = cur.findIndex((p) => p.item === id);
          const bid = uid('top');
          const cb = h('input', { type: 'checkbox', id: bid, checked: at >= 0, disabled: at < 0 && cur.length >= n });
          cb.addEventListener('change', () => {
            const now = c.get().filter((p) => picked.includes(p.item));
            c.set(cb.checked ? now.concat({ item: id, plan: '' }).slice(0, n) : now.filter((p) => p.item !== id));
            paint();
            const again = Array.from(box.querySelectorAll('input[data-item]')).find((x) => x.getAttribute('data-item') === id);
            if (again) again.focus();
          });
          cb.setAttribute('data-item', id);
          const row = h('div', { class: 'stack lx-topn' }, h('div', { class: 'choice' }, cb, h('label', { for: bid, text: labels.get(id) || id })));
          if (at >= 0) {
            const plan = h('input', { type: 'text', value: cur[at].plan, 'aria-label': `My plan for ${labels.get(id) || id}`, placeholder: 'My plan', autocomplete: 'off' });
            plan.addEventListener('input', () => c.set(c.get().map((p) => (p.item === id ? { item: id, plan: plan.value } : p))));
            row.appendChild(plan);
          }
          box.appendChild(row);
        }
      };
      paint();
      c.onSibling(paint);
      return box;
    },
  };
  function radios(f, c, opts, cur, onPick, inline) {
    const name = uid('radio');
    const fs = h('fieldset', { class: inline ? 'choices row' : 'choices', 'aria-describedby': c.describedBy }, h('legend', { class: 'field-label', text: f.label }));
    for (const o of opts) {
      const bid = uid('opt');
      const r = h('input', { type: 'radio', id: bid, name, value: o.id, checked: cur === o.id });
      r.addEventListener('change', () => { if (r.checked) onPick(o.id); });
      fs.appendChild(h('div', { class: 'choice' }, r, h('label', { for: bid, text: o.label, 'aria-label': o.aria || null })));
    }
    return fs;
  }
  function inputField(f, c, type, extra) {
    const v = c.get();
    const input = h('input', Object.assign({ type, id: c.id, 'aria-describedby': c.describedBy, autocomplete: 'off', value: v === null || v === undefined ? '' : String(v),
      min: f.min, max: f.max, inputmode: type === 'number' ? 'decimal' : null }, extra || {}));
    input.addEventListener('input', () => c.set(type === 'number' ? (input.value === '' ? null : input.value) : input.value, type === 'text'));
    return h('div', {}, h('label', { class: 'field-label', for: c.id, text: f.label }), input);
  }
  function rowEditor(f, c, cols) {
    const box = h('div', { role: 'group', 'aria-labelledby': c.labelId, 'aria-describedby': c.describedBy });
    const max = toNum(f.max) || 0;
    const blank = () => { const r = {}; cols.forEach((col) => { r[col.id] = col.type === 'number' ? null : ''; }); return r; };
    let rows = c.get().map((r) => Object.assign({}, r));
    if (!rows.length) rows = [blank()];
    const paint = () => {
      box.textContent = '';
      box.appendChild(h('p', { class: 'field-label', id: c.labelId, text: f.label }));
      rows.forEach((r, i) => {
        const fs = h('fieldset', { class: 'card stack lx-row' }, h('legend', { class: 'sr-only', text: `${f.label}, row ${i + 1}` }));
        for (const col of cols) {
          const iid = uid('cell');
          const inp = h('input', { type: col.type === 'number' ? 'number' : 'text', id: iid, autocomplete: 'off', value: r[col.id] === null || r[col.id] === undefined ? '' : String(r[col.id]) });
          inp.addEventListener('input', () => { r[col.id] = col.type === 'number' ? (inp.value === '' ? null : inp.value) : inp.value; c.set(rows.map((x) => Object.assign({}, x))); });
          fs.appendChild(h('div', {}, h('label', { for: iid, text: col.label }), inp));
        }
        fs.appendChild(btn(TEXT.remove, () => { rows.splice(i, 1); if (!rows.length) rows.push(blank()); c.set(rows.map((x) => Object.assign({}, x))); paint(); }, { 'aria-label': `${TEXT.remove} row ${i + 1}` }));
        box.appendChild(fs);
      });
      if (!max || rows.length < max) box.appendChild(btn(`${TEXT.add} a row`, () => { rows.push(blank()); paint(); }));
    };
    paint();
    return box;
  }

  // The form. opts: {mode, values, base, draftAt, history, onSave(payload, {draft}) -> Promise|void, view, content, gallery}.
  function render(spec, opts) {
    const o = opts || {};
    const mode = o.mode === 'tutorial' ? 'tutorial' : 'workbook';
    const C = o.content || ns('Content');
    const view = o.view || null;
    let values = Object.assign({}, o.values || fromPayload(spec, {}));
    const hints = (spec.tutorial && isObj(spec.tutorial.hints)) ? spec.tutorial.hints : {};
    const listeners = [];
    const errEls = {};
    const firstFocus = {};
    const urgent = h('p', { class: 'tip lx-urgent', 'aria-live': 'polite', hidden: true },
      URGENT_LINE.text + ' ', h('a', { class: 'btn', href: URGENT_LINE.route, text: URGENT_LINE.link }));
    const checkCrisis = () => { urgent.hidden = !crisisCheck(spec, values); };
    const form = h('form', { class: 'form stack lx-form', novalidate: true, 'aria-label': spec.title || 'Exercise' });
    form.appendChild(urgent);
    if (o.draftAt) {
      form.appendChild(h('div', { class: 'card row', 'data-test': 'exercise-draft-note' },
        h('p', { text: TEXT.draftNote(fmtDate(o.draftAt)) }),
        btn(TEXT.fresh, () => { if (typeof o.onFresh === 'function') o.onFresh(); }, { 'data-test': 'exercise-fresh' })));
    }
    for (const f of spec.fields || []) {
      if (!FIELD_TYPES.includes(f.type)) continue;
      const id = uid('fld');
      const hintText = str(f.hint) || str(hints[f.id]);
      const hintId = hintText ? id + '-hint' : null;
      const errId = id + '-err';
      const c = {
        id, labelId: id + '-label', describedBy: [hintId, errId].filter(Boolean).join(' '), spec, view, content: C,
        get: () => values[f.id],
        set: (v, typed) => {
          values[f.id] = v;
          if (errEls[f.id]) { errEls[f.id].hidden = true; }
          if (typed || f.type === 'textarea') checkCrisis();
          listeners.forEach((l) => { if (l.from !== f.id) l.fn(); });
        },
        values: () => values,
        options: () => optionsFor(f, view, C),
        onSibling: (fn) => listeners.push({ from: f.id, fn }),
      };
      const body = RENDER[f.type](f, c);
      const err = h('p', { id: errId, class: 'field-error', hidden: true });
      errEls[f.id] = err;
      firstFocus[f.id] = () => { const t = wrap.querySelector('input, select, textarea, button'); if (t) t.focus(); };
      let hintEl = null;
      if (hintText && mode === 'tutorial') hintEl = h('p', { id: hintId, class: 'field-hint', text: hintText });
      else if (hintText) {
        const p = h('p', { id: hintId, class: 'field-hint', text: hintText, hidden: true });
        const q = h('button', { type: 'button', class: 'icon-btn lx-hint-btn', 'aria-expanded': 'false', 'aria-controls': hintId, 'aria-label': `Hint for: ${f.label}`, text: '?', style: { minWidth: '44px', minHeight: '44px' } });
        q.addEventListener('click', () => { p.hidden = !p.hidden; q.setAttribute('aria-expanded', p.hidden ? 'false' : 'true'); });
        hintEl = h('div', { class: 'row' }, q, p);
      }
      const wrap = h('div', { class: ['field', 'field-' + f.type, 'lx-field'], 'data-test': 'fld-' + f.id, 'data-type': f.type },
        body, hintEl, f.optional ? h('p', { class: 'muted', text: 'Optional' }) : null, err);
      form.appendChild(o.gallery ? h('section', { class: 'card', 'data-test': 'fld-type-' + f.type }, h('p', { class: 'muted', text: f.type }), wrap) : wrap);
    }
    const summary = h('p', { class: 'field-error', role: 'alert', hidden: true });
    const saveBtn = h('button', { type: 'submit', class: 'btn primary', 'data-tour': 'exercise-save', text: TEXT.save });
    const laterBtn = btn(TEXT.later, () => submit(true), { 'data-tour': 'exercise-later' });
    let busy = false;
    const submit = (draft) => {
      if (busy) return;
      const res = validate(spec, values, { draft });
      for (const k of Object.keys(errEls)) { errEls[k].hidden = !res.errors[k]; errEls[k].textContent = res.errors[k] || ''; }
      if (!res.ok) {
        summary.hidden = false; summary.textContent = TEXT.summary;
        const first = (spec.fields || []).find((f) => res.errors[f.id]);
        if (first && firstFocus[first.id]) firstFocus[first.id]();
        return;
      }
      summary.hidden = true;
      if (typeof o.onSave !== 'function') return;
      busy = true;
      Promise.resolve().then(() => o.onSave(toPayload(spec, values), { draft })).finally(() => { busy = false; });
    };
    form.addEventListener('submit', (e) => { e.preventDefault(); submit(false); });
    form.appendChild(summary);
    form.appendChild(h('div', { class: 'form-actions row' }, saveBtn, laterBtn));
    checkCrisis();
    form.values = () => toPayload(spec, values);
    return form;
  }

  function exampleCard(spec, view, C) {
    const ex = spec.tutorial && spec.tutorial.example;
    if (!ex || !isObj(ex.values)) return null;
    const cast = C && C.cast && ex.cast ? C.cast[ex.cast] : null;
    const name = (cast && cast.name) || 'Someone';
    const vals = fromPayload(spec, ex.values);
    const dl = h('dl', { class: 'lx-example' });
    for (const f of spec.fields || []) {
      const s = summarize(f, vals[f.id], view, C, spec, vals);
      if (!s) continue;
      dl.appendChild(h('dt', { text: f.label }));
      dl.appendChild(h('dd', { text: s }));
    }
    return h('details', { class: 'card' }, h('summary', { text: TEXT.example(name) }), h('p', { class: 'muted', text: TEXT.exampleNote }), dl);
  }

  function historyCard(spec, rows, view, C) {
    if (!rows.length) return null;
    return h('section', { class: 'card' }, h('h2', { class: 'card-title', text: TEXT.history }),
      h('ul', {}, rows.slice(0, 10).map((r) => {
        const vals = fromPayload(spec, r.payload);
        const first = (spec.fields || []).map((f) => summarize(f, vals[f.id], view, C, spec, vals)).find(Boolean) || '';
        return h('li', { text: `${fmtDate(r.at)}${first ? ': ' + first.slice(0, 80) : ''}` });
      })));
  }

  const safeId = (s) => (typeof s === 'string' && /^[a-z0-9][a-z0-9-]{0,63}$/i.test(s) ? s : null);
  const backFor = (from) => (safeId(from) ? '#/lesson/' + from : '#/workbook');

  function missing(from) {
    return h('section', { class: 'page stack lx-missing' }, h('h1', { text: TEXT.missingTitle }), h('p', { text: TEXT.missingText }),
      h('a', { class: 'btn', href: backFor(from), text: TEXT.back }));
  }

  // The page for #/exercise/<id>?mode=tutorial|workbook&from=<lessonId>.
  function open(exerciseId, o, ctxIn) {
    const opts = o || {};
    const C = ns('Content');
    const view = (ctxIn && ctxIn.view) || (ns('Store') && ns('Store').view) || null;
    const spec = exerciseId === SAMPLE_SPEC.id ? null : exerciseFor(exerciseId, C);
    if (!spec || !Array.isArray(spec.fields)) return missing(opts.from);
    const from = safeId(opts.from);
    const mode = opts.mode === 'tutorial' || opts.mode === 'workbook' ? opts.mode : (from ? 'tutorial' : 'workbook');
    const page = h('section', { class: 'page stack lx-exercise', 'data-exercise': spec.id });
    const responses = () => (view && typeof view.list === 'function' ? (view.list('responses') || []) : []);
    const paint = (fresh) => {
      page.textContent = '';
      page.appendChild(h('h1', { text: spec.title || 'Exercise' }));
      const st = startState(spec, responses(), mode);
      if (mode === 'tutorial') { const ex = exampleCard(spec, view, C); if (ex) page.appendChild(ex); }
      page.appendChild(render(spec, {
        mode, view, content: C,
        values: fresh ? st.base : st.values, draftAt: fresh ? null : st.draftAt,
        onFresh: () => paint(true),
        onSave: (payload, so) => {
          const A = ns('Actions');
          if (!A || typeof A.saveResponse !== 'function') { toast(TEXT.cantSave, 'warn'); return null; }
          return Promise.resolve(A.saveResponse(spec.id, payload, { mode, draft: !!so.draft })).then(() => {
            const built = !so.draft && mode === 'tutorial' && spec.tutorial && str(spec.tutorial.built);
            toast(built || (so.draft ? TEXT.savedLater : TEXT.saved), 'ok');
            go(backFor(from));
          }).catch((e) => toast((e && e.message) || 'That did not save. Please try again.', 'warn'));
        },
      }));
      const hist = historyCard(spec, st.history, view, C);
      if (hist) page.appendChild(hist);
    };
    if (spec.sensitive) {
      page.appendChild(h('h1', { text: spec.title || 'Exercise' }));
      page.appendChild(h('div', { class: 'card stack' }, h('h2', { class: 'card-title', text: TEXT.skipTitle }), h('p', { text: TEXT.skipText }),
        h('div', { class: 'row' }, btn(TEXT.goOn, () => paint(false), { class: 'btn primary' }), h('a', { class: 'btn', href: backFor(from), text: TEXT.skip }))));
    } else paint(false);
    return page;
  }

  // #/dev/fields: the gallery. Saves and drafts stay in this page's memory only; nothing reaches the person's data.
  const galleryRows = [];
  function gallery(ctxIn) {
    const q = (ctxIn && ctxIn.route && ctxIn.route.query) || {};
    const mode = q.mode === 'tutorial' ? 'tutorial' : 'workbook';
    const real = (ctxIn && ctxIn.view) || null;
    const view = { list: (s) => {
      const rows = real && typeof real.list === 'function' ? (real.list(s) || []) : [];
      return s === 'contacts' && !rows.length ? SAMPLE_CONTACTS : rows;
    } };
    const C = ns('Content');
    const page = h('section', { class: 'page stack lx-gallery' });
    const out = h('pre', { class: 'card lx-payload', 'data-test': 'payload', style: { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }, text: '' });
    const paint = (fresh, last) => {
      page.textContent = '';
      page.appendChild(h('h1', { text: 'Field gallery' }));
      page.appendChild(h('p', { class: 'muted', text: `Every field type, ${FIELD_TYPES.length} in all. A test page: what you save here stays on this screen and is not added to your data.` }));
      page.appendChild(h('div', { class: 'row' },
        h('a', { class: mode === 'workbook' ? 'btn primary' : 'btn', href: '#/dev/fields?mode=workbook', 'aria-current': mode === 'workbook' ? 'page' : null, text: 'Workbook mode' }),
        h('a', { class: mode === 'tutorial' ? 'btn primary' : 'btn', href: '#/dev/fields?mode=tutorial', 'aria-current': mode === 'tutorial' ? 'page' : null, text: 'Tutorial mode' })));
      const st = startState(SAMPLE_SPEC, galleryRows, mode);
      if (mode === 'tutorial') { const ex = exampleCard(SAMPLE_SPEC, view, C); if (ex) page.appendChild(ex); }
      page.appendChild(render(SAMPLE_SPEC, {
        mode, view, content: C, gallery: true,
        values: fresh ? st.base : st.values, draftAt: fresh ? null : st.draftAt,
        onFresh: () => paint(true, out.textContent),
        onSave: (payload, so) => {
          galleryRows.push({ id: 'g' + (galleryRows.length + 1), exerciseId: SAMPLE_SPEC.id, schemaVersion: 1, payload, at: new Date().toISOString(), mode, draft: !!so.draft });
          paint(false, JSON.stringify({ draft: !!so.draft, payload }, null, 2));
          toast(so.draft ? TEXT.savedLater : TEXT.saved, 'ok');
        },
      }));
      out.textContent = last || '';
      page.appendChild(h('h2', { text: 'Last saved payload' }));
      page.appendChild(out);
      const hist = historyCard(SAMPLE_SPEC, history(galleryRows, SAMPLE_SPEC.id), view, C);
      if (hist) page.appendChild(hist);
    };
    paint(false, '');
    return page;
  }

  function devPage(ctxIn) {
    const parts = (ctxIn && ctxIn.route && ctxIn.route.parts) || [];
    if (parts[1] === 'fields') return gallery(ctxIn);
    return h('section', { class: 'page stack' }, h('h1', { text: TEXT.missingTitle }), h('p', { text: 'There is no such test page.' }),
      h('a', { class: 'btn', href: '#/dev/fields', text: 'Open the field gallery' }));
  }

  function exercisePage(ctxIn) {
    const r = (ctxIn && ctxIn.route) || { parts: [], query: {} };
    return open(r.parts[1], { mode: r.query && r.query.mode, from: r.query && r.query.from }, ctxIn);
  }

  return {
    FIELD_TYPES, SAMPLE_SPEC, SAMPLE_CONTACTS, REGIONS, URGENT_LINE, TEXT,
    defaultValue, normalise, toPayload, fromPayload, validate, isEmpty, optionsFor, triggerId,
    resume, history, startState, exerciseFor, summarize, crisisCheck,
    render, open, gallery, devPage, exercisePage,
  };
})();

// Pages register from this file (contracts/core.md: UI.pages[firstSegment]); nothing in ui-core.js or shell.html changes.
if (typeof UI !== 'undefined' && UI && UI.pages) {
  UI.pages.exercise = (ctx) => ExerciseUI.exercisePage(ctx);
  UI.pages.dev = (ctx) => ExerciseUI.devPage(ctx);
}

if (typeof module !== 'undefined' && module.exports) module.exports = ExerciseUI;
