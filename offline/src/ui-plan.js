/* 1-addic offline edition: My Recovery Plan (lane workbook-settings, U-21; BUILD-PLAN 3.10,
   tracks/SCREENS/contracts/workbook-settings.md). #/workbook/plan (ui-workbook.js calls PlanUI.view).
   The plan is the saved recoveryPlan row's sections, else a first draft from Engine.prefillRecoveryPlan. "Refresh
   from my data" only adds what is missing, never drops a line. Edit, reorder, confirm each section; Save goes through
   Actions.recoveryPlan.save (confirmedAt once, RecoveryPlanConfirmed once, lastReviewAt every save). Print is
   UI.printDoc: lists only, no buttons. Text goes in as text only (UI.h), never as HTML. Nothing here gates SOS. */
const PlanUI = (function () {
  'use strict';

  /* Engine, Store, Actions and UI are classic-script globals, not globalThis properties. */
  const ns = (name) => {
    try {
      if (name === 'Store') return typeof Store !== 'undefined' ? Store : null;
      if (name === 'Engine') return typeof Engine !== 'undefined' ? Engine : null;
      if (name === 'Actions') return typeof Actions !== 'undefined' ? Actions : null;
      if (name === 'UI') return typeof UI !== 'undefined' ? UI : null;
    } catch (e) { /* not loaded */ }
    return null;
  };
  const safe = (fn, fallback) => { try { const v = fn(); return v === undefined ? fallback : v; } catch (e) { return fallback; } };
  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

  const SECTIONS = ['motivation', 'wellness', 'situation', 'people', 'mood', 'triggers', 'warnings', 'battlePlans', 'support'];
  /* Words are original (grade 6-8). `link` is where an empty section is filled. */
  const LABELS = {
    motivation: { title: 'Why I am doing this', hint: 'My reasons, and the next step up I named.', empty: 'Your reasons show here once your Reasons Card has some.', link: '#/workbook/reasons', linkLabel: 'Open my Reasons Card' },
    wellness: { title: 'What keeps me well', hint: 'The everyday skills that help me most.', empty: 'The skills you mark as helpful in your logs show here.', link: '#/track', linkLabel: 'Open my logbook' },
    situation: { title: 'Skills for hard moments', hint: 'What I do when a situation gets risky.', empty: 'The skills you use in hard moments show here once you log them.', link: '#/track', linkLabel: 'Open my logbook' },
    people: { title: 'My people', hint: 'Who I call, and who walks with me.', empty: 'Add the people you could call on a hard day.', link: '#/workbook/network', linkLabel: 'Open my Support Network' },
    mood: { title: 'When my mood dips', hint: 'What helps when I feel low, angry or worried.', empty: 'The skills that help your mood show here once you log them.', link: '#/track', linkLabel: 'Open my logbook' },
    triggers: { title: 'My triggers', hint: 'What sets off cravings for me.', empty: 'Your triggers show here once you name them.', link: '#/workbook/triggers', linkLabel: 'Open my triggers' },
    warnings: { title: 'My warning signs and what I do', hint: 'Early signs that things are slipping, and my plan for each.', empty: 'Your top warning signs show here once you pick them.', link: '#/workbook/warnings', linkLabel: 'Open my warning signs' },
    battlePlans: { title: 'Plans for risky times', hint: 'The situations that come back, and my plan for them.', empty: 'Your plans for risky times show here once you make one.', link: '#/actions/battle?new=1', linkLabel: 'Make a plan for a risky time' },
    support: { title: 'Groups and treatment', hint: 'The groups, care and services that support me.', empty: 'Add the groups or care that help you. You can write them here.', link: '#/workbook/network', linkLabel: 'Open my Support Network' },
  };
  const TEXT = {
    title: 'My Recovery Plan',
    discreetTitle: 'My plan',
    intro: 'Your plan for staying on track, built from your own notebook. Change anything: it is yours.',
    draft: 'This is a first draft from your notebook. Nothing is saved until you press Save.',
    unsaved: 'You have changes that are not saved yet.',
    stillTrue: 'It has been a while since you looked at this plan. Is it still true? Change what has moved on, then save.',
    confirm: 'This is still right for me',
    saved: 'Your plan is saved on this device.',
    confirmed: 'Your plan is saved, and every part is confirmed. You built this.',
    failed: 'That could not be saved on this device. Please try again.',
    refreshed: (n) => (n ? 'Added ' + n + (n === 1 ? ' line' : ' lines') + ' from your notebook. Nothing was removed.' : 'Nothing new to add. Your plan already has everything from your notebook.'),
    nothing: 'Nothing here yet.',
  };
  const DAY = 24 * 60 * 60 * 1000;

  /* ── pure helpers (exported for the tests) ───────────────────────────────────────────────── */
  const clean = (s) => (typeof s === 'string' ? s.replace(/\s+/g, ' ').trim() : '');
  const keyOf = (s) => clean(s).toLowerCase();
  function items(list) {
    const seen = new Set();
    const out = [];
    for (const s of Array.isArray(list) ? list : []) {
      const t = clean(s);
      if (t && !seen.has(t.toLowerCase())) { seen.add(t.toLowerCase()); out.push(t); }
    }
    return out;
  }
  /* Every section present, items trimmed and once each, confirmed a boolean; sections not in SECTIONS are kept. */
  function normalise(sections) {
    const src = isObj(sections) ? sections : {};
    const out = {};
    for (const id of SECTIONS.concat(Object.keys(src).filter((k) => !SECTIONS.includes(k)))) {
      const s = isObj(src[id]) ? src[id] : {};
      out[id] = { items: items(s.items), confirmed: s.confirmed === true };
    }
    return out;
  }
  /* The saved plan plus every prefill line it does not have yet, at the end of its section. Never drops a line;
     a confirmed section stays confirmed. */
  function merge(saved, prefill) {
    const a = normalise(saved);
    const b = normalise(prefill);
    for (const id of Object.keys(b)) {
      if (!own(a, id)) { a[id] = b[id]; continue; }
      const have = new Set(a[id].items.map(keyOf));
      for (const t of b[id].items) if (!have.has(keyOf(t))) { a[id].items.push(t); have.add(keyOf(t)); }
    }
    return a;
  }
  const countItems = (sections) => Object.keys(sections || {}).reduce((n, k) => n + ((sections[k] && sections[k].items) || []).length, 0);
  const allConfirmed = (sections) => SECTIONS.every((id) => !!(sections && sections[id] && sections[id].confirmed === true));
  /* "Still true?" once the last save is more than 30 days old. */
  function stillTrue(lastReviewAt, now) {
    if (!lastReviewAt) return false;
    const t = new Date(lastReviewAt).getTime();
    const n = new Date(now || Date.now()).getTime();
    return !isNaN(t) && !isNaN(n) && n - t > 30 * DAY;
  }
  /* Move item i of a list by d (-1 up, +1 down); a move past either end changes nothing. */
  function move(list, i, d) {
    const out = list.slice();
    const j = i + d;
    if (i < 0 || i >= out.length || j < 0 || j >= out.length) return out;
    const [x] = out.splice(i, 1);
    out.splice(j, 0, x);
    return out;
  }

  /* ── state across re-renders: a plan being edited is kept until it is saved ─────────────── */
  const state = { draft: null, dirty: false };
  const h = (...a) => ns('UI').h(...a);
  const toast = (msg, tone) => { const U = ns('UI'); if (U && typeof U.toast === 'function') safe(() => U.toast(msg, tone), null); };
  const viewOf = (c) => (c && c.view) || safe(() => ns('Store').view, null);
  const dateText = (at) => { const d = new Date(at); return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' }); };
  function savedRow(view) { return view ? safe(() => view.get('recoveryPlan', 'plan'), null) : null; }
  function prefillOf(view, now) {
    const E = ns('Engine');
    return E && typeof E.prefillRecoveryPlan === 'function' && view ? safe(() => E.prefillRecoveryPlan(view, now || new Date()), {}) : {};
  }
  /* The plan to show: the draft being edited, else the saved sections, else the prefill. */
  function source(view, now) {
    if (state.dirty && state.draft) return state.draft;
    const row = savedRow(view);
    return row && isObj(row.sections) ? normalise(row.sections) : normalise(prefillOf(view, now));
  }
  function routeLive(route) {
    const seg = String(route || '').replace(/^#\//, '').split(/[/?]/)[0];
    const U = ns('UI');
    return seg === 'workbook' || !!(U && U.pages && typeof U.pages[seg] === 'function');
  }

  /* The print view: the title, the date and the lists; no buttons, no chrome. */
  function printNode(sections, title, now) {
    const s = normalise(sections);
    return h('article', { class: 'wb-print' },
      h('h1', { text: title || TEXT.title }),
      h('p', { text: 'Printed ' + dateText(now || new Date()) }),
      SECTIONS.map((id) => h('section', null, h('h2', { text: LABELS[id].title }),
        s[id].items.length ? h('ul', null, s[id].items.map((t) => h('li', { text: t }))) : h('p', { text: TEXT.nothing }))));
  }

  async function save(sections) {
    const A = ns('Actions');
    if (!A || !A.recoveryPlan || typeof A.recoveryPlan.save !== 'function') throw new Error('no actions');
    const s = normalise(sections);
    return A.recoveryPlan.save(s, { confirm: allConfirmed(s) });
  }

  function view(ctx) {
    const c = ctx || {};
    const v = viewOf(c);
    const now = c.now || new Date();
    const discreet = !!(c.settings && c.settings.discreet);
    const title = discreet ? TEXT.discreetTitle : TEXT.title;
    const root = h('div', { class: 'wb-page stack', 'data-test': 'plan-page' });
    const edit = () => { if (!state.dirty) { state.draft = source(v, now); state.dirty = true; } return state.draft; };

    function paint() {
      const plan = source(v, now);
      const row = savedRow(v);
      root.textContent = '';
      const status = [];
      if (state.dirty) status.push(h('p', { class: 'muted', 'data-test': 'plan-unsaved', text: TEXT.unsaved }));
      else if (!row || !isObj(row.sections)) status.push(h('p', { class: 'muted', 'data-test': 'plan-draft', text: TEXT.draft }));
      if (row && row.confirmedAt) status.push(h('p', { class: 'muted', text: 'Confirmed on ' + dateText(row.confirmedAt) + '.' }));
      if (row && stillTrue(row.lastReviewAt, now)) status.push(h('p', { class: 'card wb-card', 'data-test': 'plan-still-true', text: TEXT.stillTrue }));
      const nodes = [
        h('a', { class: 'btn ghost wb-back', href: '#/workbook', text: 'All of my workbook' }),
        h('h1', { text: title }),
        h('p', { class: 'muted', text: TEXT.intro }),
        status,
        h('div', { class: 'row wb-actions' },
          h('button', { type: 'button', class: 'btn primary', 'data-test': 'plan-save', text: 'Save', onClick: onSave }),
          h('button', { type: 'button', class: 'btn', 'data-test': 'plan-refresh', text: 'Refresh from my data', onClick: onRefresh }),
          h('button', { type: 'button', class: 'btn ghost', 'data-test': 'plan-print', 'data-tour': 'plan-print', text: 'Print', onClick: onPrint })),
        h('div', { class: 'stack', 'data-tour': 'plan-sections' }, SECTIONS.map((id) => sectionNode(id, plan[id]))),
      ];
      for (const n of nodes.flat()) if (n) root.appendChild(n);
    }

    function sectionNode(id, sec) {
      const L = LABELS[id];
      const list = sec.items;
      const rows = list.map((t, i) => {
        const input = h('input', { type: 'text', class: 'wb-plan-input', value: t, 'aria-label': L.title + ', line ' + (i + 1), 'data-test': 'plan-item-' + id + '-' + i });
        input.value = t;
        input.addEventListener('input', () => { edit()[id].items[i] = String(input.value || ''); });
        const btn = (label, text, fn, test) => h('button', { type: 'button', class: 'btn ghost', 'aria-label': label + ': ' + t, 'data-test': test, text, onClick: fn });
        return h('li', { class: 'wb-plan-item' }, input,
          h('div', { class: 'wb-plan-moves' },
            i > 0 ? btn('Move up', 'Up', () => { const d = edit(); d[id].items = move(d[id].items, i, -1); paint(); }, 'plan-up-' + id + '-' + i) : null,
            i < list.length - 1 ? btn('Move down', 'Down', () => { const d = edit(); d[id].items = move(d[id].items, i, 1); paint(); }, 'plan-down-' + id + '-' + i) : null,
            btn('Remove', 'Remove', () => { const d = edit(); d[id].items = d[id].items.filter((_, k) => k !== i); paint(); }, 'plan-remove-' + id + '-' + i)));
      });
      const add = h('input', { type: 'text', class: 'wb-plan-input', 'aria-label': 'Add a line to ' + L.title, placeholder: 'Add a line', 'data-test': 'plan-add-input-' + id });
      const doAdd = () => {
        const t = clean(add.value);
        if (!t) return;
        const d = edit();
        if (!d[id].items.some((x) => keyOf(x) === keyOf(t))) d[id].items.push(t);
        paint();
      };
      add.addEventListener('keydown', (e) => { if (e && e.key === 'Enter') { if (e.preventDefault) e.preventDefault(); doAdd(); } });
      const box = h('input', { type: 'checkbox', 'data-test': 'plan-confirm-' + id, checked: sec.confirmed });
      box.checked = sec.confirmed;
      box.addEventListener('change', () => { edit()[id].confirmed = !!box.checked; paint(); });
      const fill = !list.length ? [h('p', { class: 'muted', text: L.empty }),
        routeLive(L.link) ? h('a', { class: 'btn ghost', href: L.link, text: L.linkLabel }) : null] : null;
      return h('section', { class: 'card wb-card', 'data-test': 'plan-section-' + id },
        h('h2', { class: 'card-title', text: L.title }),
        h('p', { class: 'muted', text: L.hint }),
        list.length ? h('ol', { class: 'wb-plan-list' }, rows) : fill,
        h('div', { class: 'row wb-plan-add' }, add, h('button', { type: 'button', class: 'btn', 'data-test': 'plan-add-' + id, text: 'Add', onClick: doAdd })),
        h('label', { class: 'wb-plan-confirm' }, box, h('span', { text: TEXT.confirm })));
    }

    async function onSave() {
      const plan = source(v, now);
      try {
        await save(plan);
        state.dirty = false; state.draft = null;
        toast(allConfirmed(plan) ? TEXT.confirmed : TEXT.saved);
      } catch (e) { toast(TEXT.failed, 'warn'); }
      paint();
    }
    function onRefresh() {
      const before = source(v, now);
      const merged = merge(before, prefillOf(v, now));
      const n = countItems(merged) - countItems(normalise(before));
      if (n) { state.draft = merged; state.dirty = true; }
      toast(TEXT.refreshed(n));
      paint();
    }
    function onPrint() {
      const U = ns('UI');
      if (U && typeof U.printDoc === 'function') U.printDoc(printNode(source(v, now), title, now));
    }

    paint();
    return root;
  }

  /* For the tests: forget a draft being edited (a fresh page). */
  const reset = () => { state.draft = null; state.dirty = false; };

  const PURE = ['SECTIONS', 'LABELS', 'TEXT', 'normalise', 'merge', 'allConfirmed', 'stillTrue', 'move', 'countItems'];
  return { SECTIONS, LABELS, TEXT, normalise, merge, allConfirmed, stillTrue, move, countItems, printNode, save, view, reset, PURE };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
  for (const k of PlanUI.PURE) module.exports[k] = PlanUI[k];
}
