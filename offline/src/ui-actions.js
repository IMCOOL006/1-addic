/* 1-addic · ui-actions.js · the Actions tab (BUILD-PLAN 3.5 #/actions, 3.9 planner; section 5 U-22..U-25; lane actions).
   U-22: the day planner at #/actions/planner?date=YYYY-MM-DD. Blocks save through Actions (A.plans.*); the open stretches
   of 2 h or more come from Engine.gaps; risky blocks carry a flag and their Battle Plan (or a link to make one). A block
   is never overdue: a past block that was not marked just reads "Not marked yet", in the same calm colours as any other.
   The other Actions screens (Battle Plans, Weekly Review, quests, Prediction Lab, to-dos) are honest stubs until their
   units land (O7). Words are original, person-first, grade 6-8. Text goes in as text only. Content, Engine, Store are
   read through typeof guards (they are not globalThis properties in the built page); ctx.E and ctx.A come first. */
const ActionsUI = (() => {
  /* ── words ─────────────────────────────────────────────────────────────────────────────── */
  const TEXT = {
    hubTitle: 'Actions',
    hubIntro: 'Plan the week ahead, one block at a time.',
    plannerTitle: 'Planner',
    plannerIntro: 'Give your day a shape. Open evenings are worth a plan.',
    open: 'Open',
    soon: 'This part is being built. It comes in a later update.',
    stubTitle: 'Coming soon',
    backHub: 'Back to Actions',
    toPlanner: 'Open the Planner',
    prev: 'Previous day',
    next: 'Next day',
    today: 'Today',
    dayTitle: 'Your day',
    dayEmpty: 'Nothing planned for this day yet.',
    gapsTitle: 'Open time',
    gapsNone: 'No open stretch of two hours or more. Nice and full.',
    gapLine: (s, e, hrs) => `${s} to ${e} · ${hrs} h open`,
    addHere: 'Add here',
    add: 'Add a block',
    ideasTitle: 'Ideas for open time',
    ideaAdd: 'Plan this',
    formAdd: 'New block',
    formEdit: 'Change this block',
    fTitle: 'What is it?',
    fKind: 'Kind of block',
    fDate: 'Day',
    fStart: 'Starts',
    fEnd: 'Ends',
    fActivity: 'Activity (optional)',
    fRisky: 'This could be a risky time',
    fRiskyHint: 'Risky blocks get a Battle Plan: what you will do if a craving shows up.',
    fReward: 'A small reward after (optional)',
    save: 'Save block',
    cancel: 'Cancel',
    saved: 'Saved.',
    error: 'That did not save. Please try again.',
    kinds: { should: 'Should-do', want: 'Want-to', recovery: 'Recovery', risky: 'Risky time' },
    risky: 'Risky time',
    sample: 'Sample',
    battle: 'Your Battle Plan',
    battleAdd: 'Add a Battle Plan',
    battleEdit: 'Change the Battle Plan',
    reward: (r) => `Reward: ${r}`,
    activity: (a) => `Activity: ${a}`,
    notMarked: 'Not marked yet. How did it go?',
    done: 'Done',
    skipped: 'Skipped',
    markDone: 'Done',
    markSkipped: 'Skipped',
    undo: 'Change',
    edit: 'Edit',
    remove: 'Remove',
    removeAsk: 'Remove this block?',
    removeYes: 'Yes, remove',
    keep: 'Keep it',
    help: 'If things feel heavy right now, help is one tap away.',
    helpGo: 'Get help now',
  };
  const KINDS = ['should', 'want', 'recovery', 'risky'];
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
  const HUB = [
    { id: 'planner', title: 'Planner', gist: 'Plan the day and see the open stretches.', href: '#/actions/planner', ready: true },
    { id: 'battle', title: 'Battle Plans', gist: 'A plan for a risky time, made ahead.' },
    { id: 'review', title: 'Weekly Review', gist: 'Five short screens to look back and plan ahead.' },
    { id: 'quests', title: 'Quests', gist: 'Small steps that add up.' },
    { id: 'predictions', title: 'Prediction Lab', gist: 'Guess how much you will enjoy something, then check.' },
    { id: 'todos', title: 'To-dos', gist: 'A short list of things to do, at your pace.' },
    { id: 'practices', title: 'Practices', gist: 'Guided breathing and mindful minutes.' },
  ];

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
  const list = (view, store) => safe(() => arr(view.list(store)).filter(isObj), []);
  const E_ = (ctx) => (ctx && ctx.E !== undefined ? ctx.E : ns('Engine'));
  const A_ = (ctx) => (ctx && ctx.A !== undefined ? ctx.A : ns('Actions'));
  /* The device-local calendar date 'YYYY-MM-DD' ('' when x is not a date). */
  function localDate(x) {
    if (typeof x === 'string' && DATE_RE.test(x)) return x;
    const d = x instanceof Date ? x : (typeof x === 'string' || typeof x === 'number') ? new Date(x) : null;
    return d && !isNaN(d.getTime()) ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : '';
  }
  function shiftDate(ds, n) {
    if (!DATE_RE.test(String(ds || ''))) return '';
    const [y, m, d] = ds.split('-').map(Number);
    const t = new Date(Date.UTC(y, m - 1, d + n));
    return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
  }
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  /* "Saturday, 7 Nov 2026". */
  function dayLabel(ds) {
    if (!DATE_RE.test(String(ds || ''))) return '';
    const [y, m, d] = ds.split('-').map(Number);
    const t = new Date(Date.UTC(y, m - 1, d));
    return `${DAYS[t.getUTCDay()]}, ${d} ${MONTHS[m - 1]} ${y}`;
  }
  /* 'HH:MM' -> "7:40 pm" (as Engine.fmtTime shows a time). */
  function timeLabel(t) {
    if (!TIME_RE.test(String(t || ''))) return '';
    const [hr, mi] = t.split(':').map(Number);
    return `${hr % 12 || 12}:${pad(mi)} ${hr < 12 ? 'am' : 'pm'}`;
  }
  const nowHHMM = (now) => { const d = now instanceof Date && !isNaN(now.getTime()) ? now : new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };

  /* h: text through textContent only; on* keys become listeners; value and checked are set as properties after the
     children, so a select picks its option; null/false attributes are skipped. */
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
    if (a.checked != null) el.checked = !!a.checked;
    return el;
  }
  const link = (href, text, cls, test, extra) => h('a', Object.assign({ href, class: cls || 'btn', text, 'data-test': test }, extra || {}));
  const button = (text, onClick, cls, test, extra) => h('button', Object.assign({ type: 'button', class: cls || 'btn', text, 'data-test': test, onClick }, extra || {}));
  const clear = (el) => { el.textContent = ''; };
  let uid = 0;
  const fid = (name) => 'act-' + name + '-' + (++uid);

  /* ── pure data ─────────────────────────────────────────────────────────────────────────── */
  /* A Battle Plan that says something, else null. */
  const battleOf = (p) => (isObj(p.battlePlan) && (str(p.battlePlan.situation) || str(p.battlePlan.plan) || str(p.battlePlan.exit)) ? p.battlePlan : null);
  /* The plan items of one day, by start time, each with risky (flag or kind) and its Battle Plan or null. Skipped
     blocks stay in the list (marked); sample rows stay too, carrying sample: true (O6). */
  function planRowsForDate(view, date) {
    const ds = localDate(date);
    if (!ds) return [];
    return list(view, 'plans')
      .filter((p) => p.date === ds)
      .map((p) => Object.assign({}, p, { risky: p.risky === true || p.kind === 'risky', battlePlan: battleOf(p), sample: p.sample === true }))
      .sort((a, b) => String(a.start || '99:99').localeCompare(String(b.start || '99:99')) || String(a.end || '').localeCompare(String(b.end || ''))
        || String(a.title || '').localeCompare(String(b.title || '')) || String(a.id || '').localeCompare(String(b.id || '')));
  }
  /* The open stretches of the day (07:00-23:00, 2 h or more), straight from Engine.gaps. */
  function gapRows(E, view, date) {
    const eng = E === undefined ? ns('Engine') : E;
    if (!eng || typeof eng.gaps !== 'function') return [];
    return safe(() => arr(eng.gaps(view, localDate(date))), []).filter((g) => isObj(g) && TIME_RE.test(String(g.start)) && TIME_RE.test(String(g.end)));
  }
  /* Up to three want-to ideas for open hours (Engine.suggestions; deterministic, never random). */
  function ideaRows(E, view, date) {
    const eng = E === undefined ? ns('Engine') : E;
    if (!eng || typeof eng.suggestions !== 'function') return [];
    return safe(() => arr(eng.suggestions(view, localDate(date))), [])
      .filter((s) => isObj(s) && Number.isInteger(s.hour) && s.hour >= 0 && s.hour < 23 && str(s.activity)).slice(0, 3);
  }
  /* A block whose time has passed and that nobody marked. It is never overdue: the screen asks, calmly, how it went. */
  function pastUnmarked(plan, now) {
    if (!isObj(plan) || (plan.status && plan.status !== 'planned')) return false;
    const today = localDate(now instanceof Date ? now : new Date());
    if (!DATE_RE.test(String(plan.date || ''))) return false;
    if (plan.date < today) return true;
    return plan.date === today && TIME_RE.test(String(plan.end || '')) && plan.end <= nowHHMM(now);
  }
  /* The form's values -> a plan item for Actions.plans.add / update. Empty optional texts become null. */
  function planFromValues(v) {
    const o = isObj(v) ? v : {};
    const kind = KINDS.includes(o.kind) ? o.kind : 'should';
    return {
      date: str(o.date), start: str(o.start), end: str(o.end), title: str(o.title), kind,
      activity: str(o.activity) || null,
      risky: typeof o.risky === 'boolean' ? o.risky : kind === 'risky',
      reward: str(o.reward) || null,
    };
  }
  /* Save a block through Actions: {ok:true, plan} or {ok:false, code, message} (the message is Actions' own, for the
     form; nothing is written when it refuses). */
  async function saveBlock(A, values, id) {
    const item = planFromValues(values);
    try {
      if (!A || !A.plans) throw Object.assign(new Error(TEXT.error), { code: 'no-actions' });
      const r = id ? await A.plans.update(id, item) : await A.plans.add(item);
      return { ok: true, plan: r && r.plan ? r.plan : null };
    } catch (err) {
      const code = err && err.code ? String(err.code) : 'error';
      return { ok: false, code, message: code === 'bad-plan' && err.message ? String(err.message) : TEXT.error };
    }
  }
  /* Crisis words in what the person typed (Engine.crisisKeywords, when present). */
  const crisisIn = (E, ...texts) => {
    const eng = E === undefined ? ns('Engine') : E;
    if (!eng || typeof eng.crisisKeywords !== 'function') return false;
    return texts.some((t) => safe(() => arr(eng.crisisKeywords(String(t || ''))).length > 0, false));
  };
  /* The days whose planner showed the help line after a save, for this session only (memory, never stored). It lives
     out here, not in the page, because ui-core builds a new page when the Store changes one frame after the save. */
  const HELP_DATES = new Set();
  /* The help line shows on a day that has a block with crisis words, or that a crisis save was made from. */
  const helpOn = (E, rows, date) => HELP_DATES.has(date) || arr(rows).some((p) => crisisIn(E, p.title, p.activity, p.reward));
  /* The planner's date from the route (?date=), else today. */
  function plannerDate(route, now) {
    const q = route && isObj(route.query) ? route.query.date : '';
    return DATE_RE.test(String(q || '')) && shiftDate(q, 0) === q ? q : localDate(now instanceof Date ? now : new Date());
  }

  /* ── DOM: the hub and the stubs ────────────────────────────────────────────────────────── */
  function hubPage() {
    const cards = HUB.map((c) => h('section', { class: 'card act-hub-card', 'data-test': 'actions-hub-' + c.id },
      h('h2', { class: 'card-title', text: c.title }),
      h('p', { class: 'muted', text: c.gist }),
      c.ready ? h('div', { class: 'row' }, link(c.href, TEXT.open, 'btn primary', 'actions-open-' + c.id))
        : h('p', { class: 'act-soon', text: TEXT.soon })));
    return h('div', { class: 'page stack act-page', 'data-test': 'actions-hub' },
      h('h1', { class: 'page-title', text: TEXT.hubTitle }), h('p', { class: 'muted', text: TEXT.hubIntro }), cards);
  }
  function stubPage(sub) {
    const c = HUB.find((x) => x.id === sub);
    return h('div', { class: 'page stack act-page', 'data-test': 'actions-stub' },
      h('h1', { class: 'page-title', text: c ? c.title : TEXT.stubTitle }),
      c ? h('p', { class: 'muted', text: c.gist }) : null,
      h('p', { text: TEXT.soon }),
      h('div', { class: 'row' }, link('#/actions', TEXT.backHub, 'btn', 'actions-back'), link('#/actions/planner', TEXT.toPlanner, 'btn ghost', 'actions-to-planner')));
  }

  /* ── DOM: the planner ──────────────────────────────────────────────────────────────────── */
  function plannerPage(ctx) {
    const E = E_(ctx);
    const A = A_(ctx);
    const now = ctx && ctx.now instanceof Date ? ctx.now : new Date();
    const date = plannerDate(ctx && ctx.route, now);
    const today = localDate(now);
    const state = { form: null, asking: null };
    const root = h('div', { class: 'page stack act-page act-planner', 'data-test': 'planner' });
    const view = () => (ctx && ctx.view) || null;

    const paint = () => {
      clear(root);
      const v = view();
      const nav = h('nav', { class: 'row act-daynav', 'aria-label': 'Choose a day' },
        link('#/actions/planner?date=' + shiftDate(date, -1), TEXT.prev, 'btn ghost', 'planner-prev'),
        date !== today ? link('#/actions/planner?date=' + today, TEXT.today, 'btn ghost', 'planner-today') : null,
        link('#/actions/planner?date=' + shiftDate(date, 1), TEXT.next, 'btn ghost', 'planner-next'));
      root.appendChild(h('div', { class: 'row act-head' }, link('#/actions', TEXT.backHub, 'btn ghost', 'actions-back')));
      root.appendChild(h('h1', { class: 'page-title', text: TEXT.plannerTitle }));
      root.appendChild(h('p', { class: 'act-date', 'data-test': 'planner-date', text: dayLabel(date) }));
      root.appendChild(nav);
      root.appendChild(h('p', { class: 'muted', text: TEXT.plannerIntro }));

      const addBtn = h('button', { type: 'button', class: 'btn primary', 'data-tour': 'planner-add', 'data-test': 'planner-add-btn', 'data-testid': 'planner-add-btn', text: TEXT.add,
        'aria-expanded': state.form && !state.form.id ? 'true' : 'false', onClick: () => openForm({ date }) });
      root.appendChild(h('div', { class: 'row' }, addBtn));
      if (state.form) root.appendChild(formEl(state.form));

      const rows = planRowsForDate(v, date);
      root.appendChild(h('section', { class: 'card act-day', 'data-tour': 'planner-day', 'data-test': 'planner-day', 'aria-labelledby': 'act-day-h' },
        h('h2', { class: 'card-title', id: 'act-day-h', text: TEXT.dayTitle }),
        rows.length ? h('ul', { class: 'act-blocks' }, rows.map((p) => blockEl(p))) : h('p', { class: 'muted', text: TEXT.dayEmpty })));

      const gaps = gapRows(E, v, date);
      root.appendChild(h('section', { class: 'card act-gaps', 'data-tour': 'planner-gaps', 'data-test': 'planner-gaps', 'aria-labelledby': 'act-gaps-h' },
        h('h2', { class: 'card-title', id: 'act-gaps-h', text: TEXT.gapsTitle }),
        gaps.length ? h('ul', { class: 'act-gap-list' }, gaps.map((g) => h('li', { class: 'row act-gap', 'data-test': 'planner-gap' },
          h('span', { class: 'act-gap-text', text: TEXT.gapLine(timeLabel(g.start), timeLabel(g.end), g.hours) }),
          button(TEXT.addHere, () => openForm({ date, start: g.start, end: g.end }), 'btn ghost', 'planner-gap-add',
            { 'aria-label': `${TEXT.addHere}: ${timeLabel(g.start)} to ${timeLabel(g.end)}` }))))
          : h('p', { class: 'muted', text: TEXT.gapsNone })));

      const ideas = ideaRows(E, v, date);
      if (ideas.length) {
        root.appendChild(h('section', { class: 'card act-ideas', 'data-test': 'planner-ideas', 'aria-labelledby': 'act-ideas-h' },
          h('h2', { class: 'card-title', id: 'act-ideas-h', text: TEXT.ideasTitle }),
          h('ul', { class: 'act-gap-list' }, ideas.map((s) => {
            const start = `${pad(s.hour)}:00`; const end = `${pad(s.hour + 1)}:00`;
            return h('li', { class: 'row act-gap', 'data-test': 'planner-idea' },
              h('span', { class: 'act-gap-text', text: `${timeLabel(start)} · ${s.activity}` }),
              button(TEXT.ideaAdd, () => openForm({ date, start, end, title: s.activity, kind: 'want', activity: s.activity }), 'btn ghost', 'planner-idea-add',
                { 'aria-label': `${TEXT.ideaAdd}: ${s.activity} at ${timeLabel(start)}` }));
          }))));
      }
      if (helpOn(E, rows, date)) root.appendChild(h('p', { class: 'tip act-help', 'data-test': 'planner-help' }, TEXT.help + ' ', link('#/sos/urgent', TEXT.helpGo, 'btn', 'planner-help-go')));
    };

    const openForm = (pre) => { state.form = Object.assign({ id: null, date, start: '', end: '', title: '', kind: 'should', activity: '', risky: null, reward: '', message: '' }, pre || {}); state.asking = null; paint(); focusFirst(); };
    const focusOn = (sel) => { const f = safe(() => root.querySelector(sel), null); if (f && typeof f.focus === 'function') safe(() => f.focus(), null); };
    const focusFirst = () => focusOn('.act-form input');
    const closeForm = () => { state.form = null; paint(); focusOn('[data-tour="planner-add"]'); };
    const write = async (fn) => {
      try { await fn(); } catch (e) { if (typeof console !== 'undefined') console.warn('[actions] write failed', e && e.code); toastMsg(TEXT.error, 'warn'); }
      paint();
    };
    const toastMsg = (msg, tone) => { const U = ns('UI'); if (U && typeof U.toast === 'function') safe(() => U.toast(msg, tone), null); };

    function formEl(f) {
      const ids = { title: fid('title'), kind: fid('kind'), date: fid('date'), start: fid('start'), end: fid('end'), activity: fid('activity'), risky: fid('risky'), reward: fid('reward'), err: fid('err'), hint: fid('hint') };
      const riskyStart = f.risky === null || f.risky === undefined ? f.kind === 'risky' : !!f.risky;
      const inp = {
        title: h('input', { id: ids.title, name: 'title', type: 'text', maxlength: '120', required: true, autocomplete: 'off', 'data-test': 'planner-f-title', value: f.title }),
        kind: h('select', { id: ids.kind, name: 'kind', 'data-test': 'planner-f-kind', value: f.kind }, KINDS.map((k) => h('option', { value: k, text: TEXT.kinds[k] }))),
        date: h('input', { id: ids.date, name: 'date', type: 'date', required: true, 'data-test': 'planner-f-date', value: f.date }),
        start: h('input', { id: ids.start, name: 'start', type: 'time', required: true, 'data-test': 'planner-f-start', value: f.start }),
        end: h('input', { id: ids.end, name: 'end', type: 'time', required: true, 'data-test': 'planner-f-end', value: f.end }),
        activity: h('input', { id: ids.activity, name: 'activity', type: 'text', maxlength: '120', autocomplete: 'off', 'data-test': 'planner-f-activity', value: f.activity || '' }),
        risky: h('input', { id: ids.risky, name: 'risky', type: 'checkbox', 'aria-describedby': ids.hint, 'data-test': 'planner-f-risky', checked: riskyStart }),
        reward: h('input', { id: ids.reward, name: 'reward', type: 'text', maxlength: '200', autocomplete: 'off', 'data-test': 'planner-f-reward', value: f.reward || '' }),
      };
      inp.kind.addEventListener('change', () => { if (inp.kind.value === 'risky') inp.risky.checked = true; });
      const err = h('p', { id: ids.err, class: 'field-error act-form-error', role: 'alert', tabindex: '-1', 'data-test': 'planner-f-error', text: f.message || '' });
      if (!f.message) { err.hidden = true; err.setAttribute('hidden', ''); }
      const field = (key, label, extra) => h('div', { class: 'field' }, h('label', { class: 'field-label', for: ids[key], text: label }), inp[key], extra || null);
      const read = () => ({ title: inp.title.value, kind: inp.kind.value, date: inp.date.value, start: inp.start.value, end: inp.end.value,
        activity: inp.activity.value, risky: !!inp.risky.checked, reward: inp.reward.value });
      const form = h('form', { class: 'card form stack act-form', 'data-test': 'planner-form', novalidate: true, 'aria-labelledby': 'act-form-h',
        onSubmit: async (ev) => {
          if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
          const values = read();
          const r = await saveBlock(A, values, f.id);
          if (!r.ok) { // keep what was typed; show Actions' own message
            state.form = Object.assign({}, f, values, { message: r.message });
            paint();
            focusOn('.act-form-error');
            return;
          }
          state.form = null;
          toastMsg(TEXT.saved, 'ok');
          if (crisisIn(E, values.title, values.activity, values.reward)) { HELP_DATES.add(date); if (DATE_RE.test(str(values.date))) HELP_DATES.add(str(values.date)); }
          paint();
          focusOn('[data-tour="planner-add"]');
        } },
      h('h2', { class: 'card-title', id: 'act-form-h', text: f.id ? TEXT.formEdit : TEXT.formAdd }),
      field('title', TEXT.fTitle),
      field('kind', TEXT.fKind),
      field('date', TEXT.fDate),
      h('div', { class: 'row act-times' }, field('start', TEXT.fStart), field('end', TEXT.fEnd)),
      field('activity', TEXT.fActivity),
      h('div', { class: 'field' }, h('div', { class: 'choice' }, inp.risky, h('label', { for: ids.risky, text: TEXT.fRisky })),
        h('p', { class: 'field-hint', id: ids.hint, text: TEXT.fRiskyHint })),
      field('reward', TEXT.fReward),
      err,
      h('div', { class: 'row form-actions' },
        h('button', { type: 'submit', class: 'btn primary', 'data-test': 'planner-save', text: TEXT.save }),
        button(TEXT.cancel, closeForm, 'btn ghost', 'planner-cancel')));
      return form;
    }

    function blockEl(p) {
      const status = p.status === 'done' ? 'done' : p.status === 'skipped' ? 'skipped' : 'planned';
      const unmarked = pastUnmarked(p, now);
      const title = str(p.title) || str(p.activity) || TEXT.kinds[p.kind] || '';
      const when = `${timeLabel(p.start)} to ${timeLabel(p.end)}`;
      const bp = p.battlePlan;
      const asking = state.asking === p.id;
      const mark = (s) => write(() => A.plans.update(p.id, { status: s }));
      return h('li', { class: ['act-block', 'act-kind-' + (KINDS.includes(p.kind) ? p.kind : 'should'), p.risky ? 'act-risky' : '', 'act-' + status].filter(Boolean).join(' '),
        'data-test': 'planner-block', 'data-testid': 'planner-block', 'data-id': p.id, 'data-status': status },
      h('div', { class: 'row act-block-head' },
        h('span', { class: 'act-when', text: when }),
        h('span', { class: 'act-kind', text: TEXT.kinds[p.kind] || TEXT.kinds.should }),
        p.risky ? h('span', { class: 'badge act-flag', 'data-test': 'planner-risky', text: TEXT.risky }) : null,
        p.sample ? h('span', { class: 'badge act-sample', text: TEXT.sample }) : null),
      h('p', { class: 'act-title', text: title }),
      str(p.activity) && str(p.activity) !== title ? h('p', { class: 'muted', text: TEXT.activity(str(p.activity)) }) : null,
      str(p.reward) ? h('p', { class: 'muted', text: TEXT.reward(str(p.reward)) }) : null,
      p.risky ? (bp
        ? h('div', { class: 'act-bp', 'data-test': 'planner-bp' },
          h('p', { class: 'act-bp-title', text: TEXT.battle }),
          str(bp.situation) ? h('p', { text: str(bp.situation) }) : null,
          str(bp.plan) ? h('p', { text: str(bp.plan) }) : null,
          link('#/actions/battle?plan=' + encodeURIComponent(p.id), TEXT.battleEdit, 'btn ghost', 'planner-bp-edit'))
        : h('div', { class: 'row act-bp' }, link('#/actions/battle?plan=' + encodeURIComponent(p.id), TEXT.battleAdd, 'btn', 'planner-bp-add'))) : null,
      status === 'planned'
        ? h('div', { class: 'act-mark' },
          unmarked ? h('p', { class: 'act-unmarked', 'data-test': 'planner-unmarked', text: TEXT.notMarked }) : null,
          h('div', { class: 'row' },
            button(TEXT.markDone, () => mark('done'), 'btn', 'planner-done', { 'aria-label': `${TEXT.markDone}: ${title}` }),
            button(TEXT.markSkipped, () => mark('skipped'), 'btn ghost', 'planner-skip', { 'aria-label': `${TEXT.markSkipped}: ${title}` })))
        : h('div', { class: 'row act-mark' },
          h('span', { class: 'act-status', 'data-test': 'planner-status', text: status === 'done' ? TEXT.done : TEXT.skipped }),
          button(TEXT.undo, () => mark('planned'), 'btn ghost', 'planner-undo', { 'aria-label': `${TEXT.undo}: ${title}` })),
      asking
        ? h('div', { class: 'row act-ask', role: 'group', 'aria-label': TEXT.removeAsk },
          h('span', { text: TEXT.removeAsk }),
          button(TEXT.removeYes, () => { state.asking = null; write(() => A.plans.remove(p.id)); }, 'btn danger', 'planner-remove-yes'),
          button(TEXT.keep, () => { state.asking = null; paint(); }, 'btn ghost', 'planner-remove-no'))
        : h('div', { class: 'row act-tools' },
          button(TEXT.edit, () => openForm({ id: p.id, date: p.date, start: p.start, end: p.end, title: str(p.title), kind: KINDS.includes(p.kind) ? p.kind : 'should',
            activity: str(p.activity), risky: p.risky, reward: str(p.reward) }), 'btn ghost', 'planner-edit', { 'aria-label': `${TEXT.edit}: ${title}` }),
          button(TEXT.remove, () => { state.asking = p.id; paint(); }, 'btn ghost', 'planner-remove', { 'aria-label': `${TEXT.remove}: ${title}` })));
    }

    paint();
    return root;
  }

  /* ── page ──────────────────────────────────────────────────────────────────────────────── */
  function page(ctx) {
    const parts = ctx && ctx.route && Array.isArray(ctx.route.parts) ? ctx.route.parts : [];
    const sub = parts[1] || '';
    if (!sub) return hubPage(ctx);
    if (sub === 'planner') return plannerPage(ctx);
    return stubPage(sub);
  }

  const PURE = ['planRowsForDate', 'gapRows', 'ideaRows', 'pastUnmarked', 'planFromValues', 'saveBlock', 'plannerDate', 'localDate', 'shiftDate', 'dayLabel', 'timeLabel'];
  return { page, TEXT, PURE, planRowsForDate, gapRows, ideaRows, pastUnmarked, planFromValues, saveBlock, plannerDate, localDate, shiftDate, dayLabel, timeLabel };
})();

// The page registers from this file (contracts/core.md: UI.pages[firstSegment]); ui-core.js is not changed.
if (typeof UI !== 'undefined' && UI && UI.pages) UI.pages.actions = (ctx) => ActionsUI.page(ctx);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
  for (const k of ActionsUI.PURE) module.exports[k] = ActionsUI[k];
}
