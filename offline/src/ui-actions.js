/* 1-addic · ui-actions.js · the Actions tab (BUILD-PLAN 3.5 #/actions, 3.9 planner; section 5 U-22..U-25; lane actions).
   U-22: the day planner at #/actions/planner?date=YYYY-MM-DD. Blocks save through Actions (A.plans.*); the open stretches
   of 2 h or more come from Engine.gaps; risky blocks carry a flag and their Battle Plan (or a link to make one). A block
   is never overdue: a past block that was not marked just reads "Not marked yet", in the same calm colours as any other.
   U-23: Battle Plans at #/actions/battle (list, ?new=1 form, ?plan=<id> attach/edit): each exports a .ics through
   Engine.ics and UI.download (a file on the device, no network; the buddy is left out of it), and once the block has
   ended asks "Did the plan show up?" (A.plans.debrief, warm either way, no score).
   U-24: the Weekly Review at #/actions/review: a start screen, then five screens with Back/Next (the last seven days
   from Engine.weekSummary, the forecast check from Engine.forecastCheck, a motivation re-rate, the week ahead, want-tos
   and a focus skill). Answers stay in memory (this session only, never stored) until Save writes them through Actions
   (A.weeklyReview once; WeeklyReviewCompleted once per week). A weekly reminder .ics at 18:00 on profile.reviewDay.
   The other Actions screens (quests, Prediction Lab, to-dos) are honest stubs until their
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
    // U-23 Battle Plans
    bpTitle: 'Battle Plans',
    bpIntro: 'A Battle Plan is made ahead, for a time that could be hard. When that time comes, the plan is already there.',
    bpNew: 'New Battle Plan',
    bpBack: 'Back to Battle Plans',
    bpUpcoming: 'Coming up',
    bpPast: 'Looking back',
    bpNone: 'No Battle Plans yet. Think of a time this week that could be hard, and make one.',
    bpNoUpcoming: 'Nothing coming up right now.',
    bpFormNew: 'New Battle Plan',
    bpFormEdit: 'Battle Plan for this block',
    bpFTitle: 'What is the time or place?',
    bpFSituation: 'What makes it risky? (optional)',
    bpFPlan: 'What I will do',
    bpFBackups: 'Backups, if the first idea does not work (one per line, up to 10)',
    bpFBuddy: 'Someone I can reach (optional)',
    bpFNoBuddy: 'No one this time',
    bpFExit: 'How I will leave if I need to (optional)',
    bpNeedPlan: 'Write what you will do. One line is enough.',
    bpSave: 'Save the plan',
    bpSaved: 'Plan saved.',
    bpMissing: 'That block is not here any more. You can make a new Battle Plan instead.',
    bpIcs: 'Add to calendar',
    bpIcsDone: 'Calendar file saved to this device.',
    bpIcsNo: 'This browser could not save the file.',
    bpDefaultTitle: 'Risky time',
    bpSituation: (t) => `Risky because: ${t}`,
    bpPlan: (t) => `I will: ${t}`,
    bpBackups: (t) => `Backups: ${t}`,
    bpBuddy: (t) => `Someone to reach: ${t}`,
    bpExit: (t) => `My way out: ${t}`,
    bpAsk: 'Did the plan show up when it counted?',
    bpHow: 'How did it go? (optional)',
    bpYes: 'Yes, it did',
    bpNo: 'Not this time',
    bpThanksYes: 'Good to know. The plan did its job.',
    bpThanksNo: 'Thank you for looking back. It helps the next plan.',
    bpDebriefed: (used) => (used ? 'You looked back: the plan showed up.' : 'You looked back: the plan did not show up this time.'),
    bpLater: 'When this time has passed, you can look back on how it went.',
    bpEdit: 'Change',
    bpInPlanner: 'See the day',
    // U-24 Weekly Review
    rvTitle: 'Weekly Review',
    rvIntro: 'Five short screens: look back at the last seven days, then plan the next ones. Nothing here is scored.',
    rvStart: 'Start the review',
    rvResume: 'Carry on where you left off',
    rvSaved: 'This week\'s review is saved.',
    rvAgain: 'Go through it again',
    rvIcs: 'Add a weekly reminder',
    rvIcsHint: (day) => `A calendar file that repeats every ${day} at 6 pm. You can change the day in Settings.`,
    rvIcsTitle: 'Weekly review',
    rvStep: (n) => `${n} of 5`,
    rv1: 'The last seven days',
    rvQuiet: 'A quiet week in the log. That is fine; the review still works.',
    rvNote: 'Anything else that went well? (optional)',
    rv2: 'The forecast check',
    rv2Intro: 'You planned for some times to be hard. Here is what the log shows. Just notice what happened.',
    rvNoForecast: 'No risky times were planned and nothing was logged. The next screens can help you plan ahead.',
    rvPlanned: (t, s, e) => `Planned: ${t}, ${s} to ${e}`,
    rvLogged: (type, time, n) => `Logged: a ${type} at ${time}${n == null ? '' : `, ${n}/10`}`,
    rvForecastNote: 'What do you notice? (optional)',
    rv3: 'Where you are now',
    rv3Intro: 'There is no right number. It is a check-in with yourself.',
    rvStage: 'Which fits best right now?',
    rvChoose: 'Choose one',
    rvScore: 'How ready do you feel to keep going, from 0 to 10?',
    rvNotNow: 'Skip for now',
    rvPlusOne: 'What would move it up by one? (optional)',
    rvNeedStage: 'Choose the stage that fits best, or skip the number.',
    rv4: 'The week ahead',
    rv4Intro: 'Any time this week that could be hard? A Battle Plan made now is there when you need it.',
    rvNoRisky: 'No risky times in the Planner for the next seven days.',
    rvBpReady: 'Battle Plan ready',
    rvUpcomingNote: 'Anything coming up that could be hard? (optional)',
    rvMakeBp: 'Make a Battle Plan',
    rv5: 'Want-tos and a focus',
    rv5Intro: 'Up to three things you want to do this week, each with a small reward after.',
    rvWant: (n) => `Want-to ${n}`,
    rvWantWhat: 'What',
    rvWantDay: 'Day',
    rvWantTime: 'Time',
    rvWantReward: 'Reward (optional)',
    rvFocus: 'A skill to practise this week (optional)',
    rvNoFocus: 'None for now',
    rvBack: 'Back',
    rvNext: 'Next',
    rvSave: 'Save the review',
    rvDone: 'Review saved.',
  };
  const KINDS = ['should', 'want', 'recovery', 'risky'];
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
  const HUB = [
    { id: 'planner', title: 'Planner', gist: 'Plan the day and see the open stretches.', href: '#/actions/planner', ready: true },
    { id: 'battle', title: 'Battle Plans', gist: 'A plan for a risky time, made ahead.', href: '#/actions/battle', ready: true },
    { id: 'review', title: 'Weekly Review', gist: 'Five short screens to look back and plan ahead.', href: '#/actions/review', ready: true },
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

  /* ── pure data: Battle Plans (U-23) ────────────────────────────────────────────────────── */
  /* A block whose time has passed (its day is before today, or today and its end has come). Its status does not matter. */
  function planEnded(p, now) {
    if (!isObj(p) || !DATE_RE.test(String(p.date || ''))) return false;
    const today = localDate(now instanceof Date ? now : new Date());
    return p.date < today || (p.date === today && TIME_RE.test(String(p.end || '')) && p.end <= nowHHMM(now));
  }
  /* The blocks that carry a Battle Plan: upcoming ones soonest first, past ones latest first (sample rows marked, O6). */
  function battleLists(view, now) {
    const rows = list(view, 'plans').filter((p) => battleOf(p))
      .map((p) => Object.assign({}, p, { battlePlan: battleOf(p), sample: p.sample === true }));
    const key = (p) => `${p.date || ''} ${p.start || ''} ${p.end || ''} ${p.id || ''}`;
    return {
      upcoming: rows.filter((p) => !planEnded(p, now)).sort((a, b) => key(a).localeCompare(key(b))),
      past: rows.filter((p) => planEnded(p, now)).sort((a, b) => key(b).localeCompare(key(a))),
    };
  }
  const backupList = (b) => arr(b).map(str).filter(Boolean);
  /* The calendar note: the plan in the person's words. The buddy is left out on purpose (contacts never leave the device). */
  function battleNotes(bp) {
    const b = isObj(bp) ? bp : {};
    return [str(b.situation) ? TEXT.bpSituation(str(b.situation)) : null, str(b.plan) ? TEXT.bpPlan(str(b.plan)) : null,
      backupList(b.backups).length ? TEXT.bpBackups(backupList(b.backups).join('; ')) : null, str(b.exit) ? TEXT.bpExit(str(b.exit)) : null]
      .filter(Boolean).join('\n');
  }
  /* One Engine.ics item for a block with a Battle Plan (contract: battlePlanIcsItem(plan)), or null. */
  function battlePlanIcsItem(plan) {
    if (!isObj(plan) || !DATE_RE.test(String(plan.date || ''))) return null;
    return { id: 'battle-plan-' + String(plan.id || plan.date), date: plan.date, start: plan.start || null, end: plan.end || null,
      title: str(plan.title) || TEXT.bpDefaultTitle, notes: battleNotes(plan.battlePlan) };
  }
  /* {filename, text} of the .ics for one plan (Engine U-08 writes it), or null when the Engine or the date is missing. */
  function battleIcsFile(E, plan, now) {
    const eng = E === undefined ? ns('Engine') : E;
    const item = battlePlanIcsItem(plan);
    if (!item || !eng || typeof eng.ics !== 'function') return null;
    const text = safe(() => eng.ics([item], { now: now instanceof Date ? now : new Date() }), '');
    return text ? { filename: `1-addic-battle-plan-${item.date}.ics`, text } : null;
  }
  /* The form's values -> the plan fields and the Battle Plan, for Actions.plans.add (new) or .update (attach/edit). */
  function battleFromValues(v, attach) {
    const o = isObj(v) ? v : {};
    const backups = String(o.backups == null ? '' : o.backups).split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    const battlePlan = { situation: str(o.situation), plan: str(o.plan), backups, buddyId: str(o.buddyId) || null, exit: str(o.exit) };
    const item = { date: str(o.date), start: str(o.start), end: str(o.end), title: str(o.title) || TEXT.bpDefaultTitle, risky: true, battlePlan };
    if (!attach) item.kind = 'risky';
    return item;
  }
  /* Save a Battle Plan through Actions: {ok:true, plan} or {ok:false, code, message} (nothing written on a refusal). */
  async function saveBattle(A, values, id) {
    const item = battleFromValues(values, !!id);
    if (!item.battlePlan.plan) return { ok: false, code: 'bad-plan', message: TEXT.bpNeedPlan };
    try {
      if (!A || !A.plans) throw Object.assign(new Error(TEXT.error), { code: 'no-actions' });
      const r = id ? await A.plans.update(id, item) : await A.plans.add(item);
      return { ok: true, plan: r && r.plan ? r.plan : null };
    } catch (err) {
      const code = err && err.code ? String(err.code) : 'error';
      return { ok: false, code, message: code === 'bad-plan' && err.message ? String(err.message) : TEXT.error };
    }
  }
  /* The debrief through Actions (BattlePlanDebriefed once per plan; the same small credit whatever the answer). */
  async function debriefPlan(A, id, usedPlan, how) {
    const d = { usedPlan: usedPlan === true };
    if (str(how)) d.how = str(how);
    return A.plans.debrief(id, d);
  }
  /* The help line on the Battle Plans screen after a save or debrief with crisis words (session memory, never stored). */
  const BP_HELP = { on: false };
  const contactsOf = (view) => list(view, 'contacts').filter((c) => c.active !== false && str(c.name));

  /* ── DOM: Battle Plans (U-23) ──────────────────────────────────────────────────────────── */
  function battlePage(ctx) {
    const E = E_(ctx);
    const A = A_(ctx);
    const now = ctx && ctx.now instanceof Date ? ctx.now : new Date();
    const today = localDate(now);
    const q = ctx && ctx.route && isObj(ctx.route.query) ? ctx.route.query : {};
    const view = () => (ctx && ctx.view) || null;
    const root = h('div', { class: 'page stack act-page act-battle', 'data-test': 'battle' });
    const planId = str(q.plan);
    const target = planId ? list(view(), 'plans').find((p) => p.id === planId) || null : null;
    const state = { mode: q.new || planId ? 'form' : 'list', form: null };
    const toastMsg = (msg, tone) => { const U = ns('UI'); if (U && typeof U.toast === 'function') safe(() => U.toast(msg, tone), null); };
    const focusOn = (sel) => { const f = safe(() => root.querySelector(sel), null); if (f && typeof f.focus === 'function') safe(() => f.focus(), null); };
    if (state.mode === 'form') {
      const bp = target && isObj(target.battlePlan) ? target.battlePlan : {};
      const qd = DATE_RE.test(str(q.date)) && shiftDate(q.date, 0) === q.date ? q.date : today;
      state.form = target
        ? { date: target.date, start: target.start, end: target.end, title: str(target.title), situation: str(bp.situation), plan: str(bp.plan),
          backups: backupList(bp.backups).join('\n'), buddyId: str(bp.buddyId), exit: str(bp.exit), message: '' }
        : { date: qd, start: '', end: '', title: '', situation: '', plan: '', backups: '', buddyId: '', exit: '', message: '' };
    }
    const toList = () => {
      state.mode = 'list'; state.form = null; paint();
      const U = ns('UI');
      if (U && typeof U.go === 'function') safe(() => U.go('#/actions/battle'), null);
    };

    const paint = () => {
      clear(root);
      root.appendChild(h('div', { class: 'row act-head' }, state.mode === 'form'
        ? link('#/actions/battle', TEXT.bpBack, 'btn ghost', 'bp-back') : link('#/actions', TEXT.backHub, 'btn ghost', 'actions-back')));
      root.appendChild(h('h1', { class: 'page-title', text: TEXT.bpTitle }));
      if (state.mode === 'form') {
        if (planId && !target) {
          root.appendChild(h('p', { 'data-test': 'bp-missing', text: TEXT.bpMissing }));
          root.appendChild(h('div', { class: 'row' }, link('#/actions/battle?new=1', TEXT.bpNew, 'btn primary', 'bp-new-instead')));
          return;
        }
        root.appendChild(formEl(state.form));
        return;
      }
      root.appendChild(h('p', { class: 'muted', text: TEXT.bpIntro }));
      root.appendChild(h('div', { class: 'row' }, link('#/actions/battle?new=1', TEXT.bpNew, 'btn primary', 'bp-new', { 'data-tour': 'bp-new' })));
      const { upcoming, past } = battleLists(view(), now);
      const all = upcoming.concat(past);
      if (BP_HELP.on || all.some((p) => crisisIn(E, p.title, p.battlePlan.situation, p.battlePlan.plan, p.battlePlan.exit, ...backupList(p.battlePlan.backups),
        isObj(p.debrief) ? p.debrief.how : ''))) {
        root.appendChild(h('p', { class: 'tip act-help', 'data-test': 'bp-help' }, TEXT.help + ' ', link('#/sos/urgent', TEXT.helpGo, 'btn', 'bp-help-go')));
      }
      if (!all.length) { root.appendChild(h('p', { class: 'muted', 'data-test': 'bp-none', text: TEXT.bpNone })); return; }
      root.appendChild(h('section', { class: 'card act-bp-list', 'data-test': 'bp-upcoming', 'aria-labelledby': 'act-bp-up-h' },
        h('h2', { class: 'card-title', id: 'act-bp-up-h', text: TEXT.bpUpcoming }),
        upcoming.length ? h('ul', { class: 'act-blocks' }, upcoming.map(cardEl)) : h('p', { class: 'muted', text: TEXT.bpNoUpcoming })));
      if (past.length) {
        root.appendChild(h('section', { class: 'card act-bp-list', 'data-test': 'bp-past', 'aria-labelledby': 'act-bp-past-h' },
          h('h2', { class: 'card-title', id: 'act-bp-past-h', text: TEXT.bpPast }), h('ul', { class: 'act-blocks' }, past.map(cardEl))));
      }
    };

    function cardEl(p) {
      const bp = p.battlePlan;
      const title = str(p.title) || TEXT.bpDefaultTitle;
      const buddy = bp.buddyId ? list(view(), 'contacts').find((c) => c.id === bp.buddyId && str(c.name)) || null : null;
      const howId = fid('how');
      const how = h('textarea', { id: howId, name: 'how', maxlength: '1000', rows: '2', 'data-test': 'bp-how' });
      const answer = async (used) => {
        try {
          await debriefPlan(A, p.id, used, how.value);
          if (crisisIn(E, how.value)) BP_HELP.on = true;
          toastMsg(used ? TEXT.bpThanksYes : TEXT.bpThanksNo, 'ok');
        } catch (e) { if (typeof console !== 'undefined') console.warn('[actions] debrief failed', e && e.code); toastMsg(TEXT.error, 'warn'); }
        paint();
      };
      const ics = () => {
        const f = battleIcsFile(E, p, now);
        const U = ns('UI');
        const ok = !!f && !!U && typeof U.download === 'function' && safe(() => U.download(f.filename, f.text, 'text/calendar'), false) !== false;
        toastMsg(ok ? TEXT.bpIcsDone : TEXT.bpIcsNo, ok ? 'ok' : 'warn');
      };
      let back;
      if (isObj(p.debrief)) {
        back = h('div', { class: 'act-debrief', 'data-test': 'bp-debriefed' }, h('p', { text: TEXT.bpDebriefed(p.debrief.usedPlan === true) }),
          str(p.debrief.how) ? h('p', { class: 'muted', text: str(p.debrief.how) }) : null);
      } else if (planEnded(p, now)) {
        back = h('div', { class: 'act-debrief', role: 'group', 'aria-labelledby': howId + '-q', 'data-test': 'bp-debrief' },
          h('p', { class: 'act-bp-title', id: howId + '-q', text: TEXT.bpAsk }),
          h('div', { class: 'field' }, h('label', { class: 'field-label', for: howId, text: TEXT.bpHow }), how),
          h('div', { class: 'row' },
            button(TEXT.bpYes, () => answer(true), 'btn', 'bp-debrief-yes', { 'data-testid': 'bp-debrief-yes' }),
            button(TEXT.bpNo, () => answer(false), 'btn', 'bp-debrief-no', { 'data-testid': 'bp-debrief-no' })));
      } else {
        back = h('p', { class: 'muted', text: TEXT.bpLater });
      }
      return h('li', { class: 'act-block act-risky act-bp-card', 'data-test': 'bp-card', 'data-id': p.id },
        h('div', { class: 'row act-block-head' },
          h('span', { class: 'act-when', text: `${dayLabel(p.date)} · ${timeLabel(p.start)} to ${timeLabel(p.end)}` }),
          p.sample ? h('span', { class: 'badge act-sample', text: TEXT.sample }) : null),
        h('h3', { class: 'act-title', text: title }),
        str(bp.situation) ? h('p', { text: TEXT.bpSituation(str(bp.situation)) }) : null,
        str(bp.plan) ? h('p', { text: TEXT.bpPlan(str(bp.plan)) }) : null,
        backupList(bp.backups).length ? h('p', { text: TEXT.bpBackups(backupList(bp.backups).join('; ')) }) : null,
        buddy ? h('p', { text: TEXT.bpBuddy(str(buddy.name)) }) : null,
        str(bp.exit) ? h('p', { text: TEXT.bpExit(str(bp.exit)) }) : null,
        h('div', { class: 'row act-tools' },
          button(TEXT.bpIcs, ics, 'btn', 'bp-ics', { 'data-testid': 'bp-ics', 'aria-label': `${TEXT.bpIcs}: ${title}` }),
          link('#/actions/battle?plan=' + encodeURIComponent(p.id), TEXT.bpEdit, 'btn ghost', 'bp-edit', { 'aria-label': `${TEXT.bpEdit}: ${title}` }),
          link('#/actions/planner?date=' + p.date, TEXT.bpInPlanner, 'btn ghost', 'bp-planner')),
        back);
    }

    function formEl(f) {
      const ids = {};
      for (const k of ['title', 'situation', 'plan', 'backups', 'buddyId', 'exit', 'date', 'start', 'end', 'err']) ids[k] = fid('bp-' + k);
      const area = (k, max) => h('textarea', { id: ids[k], name: k, maxlength: String(max), rows: '3', 'data-test': 'bp-f-' + k, value: f[k] || '' });
      const people = contactsOf(view());
      const inp = {
        title: h('input', { id: ids.title, name: 'title', type: 'text', maxlength: '120', autocomplete: 'off', 'data-test': 'bp-f-title', value: f.title }),
        situation: area('situation', 1000),
        plan: area('plan', 1000),
        backups: area('backups', 3100),
        buddyId: people.length ? h('select', { id: ids.buddyId, name: 'buddyId', 'data-test': 'bp-f-buddy', value: f.buddyId || '' },
          h('option', { value: '', text: TEXT.bpFNoBuddy }), people.map((c) => h('option', { value: c.id, text: str(c.name) }))) : null,
        exit: area('exit', 1000),
        date: h('input', { id: ids.date, name: 'date', type: 'date', required: true, 'data-test': 'bp-f-date', value: f.date }),
        start: h('input', { id: ids.start, name: 'start', type: 'time', required: true, 'data-test': 'bp-f-start', value: f.start }),
        end: h('input', { id: ids.end, name: 'end', type: 'time', required: true, 'data-test': 'bp-f-end', value: f.end }),
      };
      inp.plan.setAttribute('required', '');
      const field = (k, label) => (inp[k] ? h('div', { class: 'field' }, h('label', { class: 'field-label', for: ids[k], text: label }), inp[k]) : null);
      const err = h('p', { id: ids.err, class: 'field-error act-form-error', role: 'alert', tabindex: '-1', 'data-test': 'bp-f-error', text: f.message || '' });
      if (!f.message) { err.hidden = true; err.setAttribute('hidden', ''); }
      const read = () => ({ title: inp.title.value, situation: inp.situation.value, plan: inp.plan.value, backups: inp.backups.value,
        buddyId: inp.buddyId ? inp.buddyId.value : '', exit: inp.exit.value, date: inp.date.value, start: inp.start.value, end: inp.end.value });
      const helpNow = f.help || crisisIn(E, f.title, f.situation, f.plan, f.backups, f.exit);
      return h('form', { class: 'card form stack act-form', 'data-tour': 'bp-form', 'data-test': 'bp-form', novalidate: true, 'aria-labelledby': 'act-bp-form-h',
        onSubmit: async (ev) => {
          if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
          const values = read();
          const crisis = crisisIn(E, values.title, values.situation, values.plan, values.backups, values.exit);
          const r = await saveBattle(A, values, target ? target.id : null);
          if (!r.ok) { state.form = Object.assign({}, f, values, { message: r.message, help: crisis }); paint(); focusOn('.act-form-error'); return; }
          if (crisis) BP_HELP.on = true;
          toastMsg(TEXT.bpSaved, 'ok');
          toList();
        } },
      h('h2', { class: 'card-title', id: 'act-bp-form-h', text: target ? TEXT.bpFormEdit : TEXT.bpFormNew }),
      field('title', TEXT.bpFTitle),
      h('div', { class: 'row act-times' }, field('date', TEXT.fDate), field('start', TEXT.fStart), field('end', TEXT.fEnd)),
      field('situation', TEXT.bpFSituation),
      field('plan', TEXT.bpFPlan),
      field('backups', TEXT.bpFBackups),
      field('buddyId', TEXT.bpFBuddy),
      field('exit', TEXT.bpFExit),
      err,
      helpNow ? h('p', { class: 'tip act-help', 'data-test': 'bp-help' }, TEXT.help + ' ', link('#/sos/urgent', TEXT.helpGo, 'btn', 'bp-help-go')) : null,
      h('div', { class: 'row form-actions' },
        h('button', { type: 'submit', class: 'btn primary', 'data-test': 'bp-save', 'data-testid': 'bp-save', text: TEXT.bpSave }),
        link('#/actions/battle', TEXT.cancel, 'btn ghost', 'bp-cancel')));
    }

    paint();
    return root;
  }

  /* ── pure data: the Weekly Review (U-24) ───────────────────────────────────────────────── */
  const BYDAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  const dow = (ds) => { const [y, m, d] = String(ds).split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); };
  /* The review's week: weekStart is this week's Monday (the key A.weeklyReview saves under, one per week); the look
     back covers the last seven days, ending today (from..to), whatever the review day is. */
  function reviewWeek(now) {
    const today = localDate(now instanceof Date ? now : new Date());
    return { today, weekStart: shiftDate(today, -((dow(today) + 6) % 7)), from: shiftDate(today, -6), to: today };
  }
  /* The next date (today counts) that falls on reviewDay (0 = Sunday ... 6 = Saturday; anything else is Sunday). */
  function nextReviewDate(reviewDay, today) {
    const day = Number.isInteger(reviewDay) && reviewDay >= 0 && reviewDay <= 6 ? reviewDay : 0;
    return shiftDate(today, (day - dow(today) + 7) % 7);
  }
  /* The weekly reminder for Engine.ics (contract: reviewIcsItem(profile, now)): 18:00 to 18:15 on the review day, weekly. */
  function reviewIcsItem(profile, now) {
    const p = isObj(profile) ? profile : {};
    const day = Number.isInteger(p.reviewDay) && p.reviewDay >= 0 && p.reviewDay <= 6 ? p.reviewDay : 0;
    return { id: 'weekly-review', date: nextReviewDate(day, localDate(now instanceof Date ? now : new Date())), start: '18:00', end: '18:15',
      title: TEXT.rvIcsTitle, rrule: `FREQ=WEEKLY;BYDAY=${BYDAY[day]}` };
  }
  /* The latest saved review for a week (a 'weekly-review' response), or null. */
  function reviewSaved(view, weekStart) {
    return list(view, 'responses').filter((r) => r.exerciseId === 'weekly-review' && isObj(r.payload) && r.payload.weekStart === weekStart)
      .sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')))[0] || null;
  }
  /* The forecast check as rows to show: each day with something planned or logged; Engine's line where it has one. */
  function forecastRows(E, view, from) {
    const eng = E === undefined ? ns('Engine') : E;
    if (!eng || typeof eng.forecastCheck !== 'function') return [];
    return safe(() => arr(eng.forecastCheck(view, from)), []).filter((d) => isObj(d) && (arr(d.planned).length || arr(d.logged).length))
      .map((d) => ({ date: d.date, line: typeof d.line === 'string' && d.line ? d.line : null,
        rows: arr(d.planned).map((p) => TEXT.rvPlanned(str(p.title) || TEXT.bpDefaultTitle, timeLabel(p.start), timeLabel(p.end)))
          .concat(arr(d.logged).map((l) => TEXT.rvLogged(l.type === 'feeling' ? 'feeling' : 'craving', str(l.time) || '?', Number.isInteger(l.intensity) ? l.intensity : null))) }));
  }
  /* A want-to row -> a plan item (kind want, an hour long, ending by 23:59). */
  function wantToItem(w) {
    const o = isObj(w) ? w : {};
    const start = TIME_RE.test(str(o.start)) ? str(o.start) : '18:00';
    const m = Math.min(Number(start.slice(0, 2)) * 60 + Number(start.slice(3)) + 60, 23 * 60 + 59);
    return { date: str(o.date), start, end: `${pad(Math.floor(m / 60))}:${pad(m % 60)}`, title: str(o.title), kind: 'want', risky: false, reward: str(o.reward) || null };
  }
  const scoreOf = (d) => (d && d.score !== '' && d.score != null && Number.isInteger(Number(d.score)) ? Number(d.score) : null);
  /* The response payload (contract: {weekStart, highlights, focusSkill, wantTos[], motivation}, plus the two notes). */
  function reviewPayload(d, weekStart) {
    const o = isObj(d) ? d : {};
    const score = scoreOf(o);
    return {
      weekStart,
      highlights: { lines: arr(o.lines).filter((x) => typeof x === 'string'), note: str(o.note) },
      forecastNote: str(o.forecastNote),
      upcomingNote: str(o.upcomingNote),
      focusSkill: str(o.focusSkill) || null,
      wantTos: arr(o.wants).filter((w) => isObj(w) && str(w.title)).map((w) => Object.assign(wantToItem(w), { planId: w.planId || null })),
      motivation: score === null ? null : { stage: str(o.stage), score, plusOne: str(o.plusOne) },
    };
  }
  /* Save: the want-tos (A.plans.add), the re-rate (A.motivation.add), then A.weeklyReview once. A retry after a refusal
     never adds a want-to or a re-rate twice (the draft remembers what was written). {ok:true} or {ok:false, message}. */
  async function saveReview(A, d, weekStart) {
    const no = (message) => ({ ok: false, message });
    if (!A || !A.plans || typeof A.weeklyReview !== 'function') return no(TEXT.error);
    const score = scoreOf(d);
    if (score !== null && !str(d.stage)) return no(TEXT.rvNeedStage);
    try {
      for (const w of arr(d.wants)) {
        if (!isObj(w) || !str(w.title) || w.planId) continue;
        const r = await A.plans.add(wantToItem(w));
        w.planId = r && r.plan && r.plan.id ? r.plan.id : 'saved';
      }
      if (score !== null && !d.motSaved && A.motivation) {
        const m = { stage: str(d.stage), score, source: 'weekly-review' };
        if (str(d.plusOne)) m.plusOne = str(d.plusOne);
        await A.motivation.add(m);
        d.motSaved = true;
      }
      const r = await A.weeklyReview(reviewPayload(d, weekStart));
      return { ok: true, response: r && r.response ? r.response : null };
    } catch (err) {
      return no(err && /^bad-/.test(String(err.code || '')) && err.message ? String(err.message) : TEXT.error);
    }
  }
  /* The review's answers in memory, by week (this session only, never stored): leaving for a Battle Plan and coming
     back resumes the same screen. HELP_WEEKS keeps the help line on after a save with crisis words. */
  const DRAFTS = new Map();
  const HELP_WEEKS = new Set();
  const forgetReviews = () => { DRAFTS.clear(); HELP_WEEKS.clear(); };

  /* ── DOM: the Weekly Review (U-24) ─────────────────────────────────────────────────────── */
  function reviewPage(ctx) {
    const E = E_(ctx);
    const A = A_(ctx);
    const C = ns('Content');
    const now = ctx && ctx.now instanceof Date ? ctx.now : new Date();
    const wk = reviewWeek(now);
    const ws = wk.weekStart;
    const profile = ctx && isObj(ctx.profile) ? ctx.profile : {};
    const view = () => (ctx && ctx.view) || null;
    const root = h('div', { class: 'page stack act-page act-review', 'data-test': 'review' });
    const stages = arr(C && C.stages).filter((s) => isObj(s) && s.id);
    const skills = arr(C && C.skills).filter((s) => isObj(s) && s.id);
    const toastMsg = (msg, tone) => { const U = ns('UI'); if (U && typeof U.toast === 'function') safe(() => U.toast(msg, tone), null); };
    const focusOn = (sel) => { const f = safe(() => root.querySelector(sel), null); if (f && typeof f.focus === 'function') safe(() => f.focus(), null); };
    const newDraft = () => {
      const latest = list(view(), 'motivation').slice().sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')))[0];
      const sum = E && typeof E.weekSummary === 'function' ? safe(() => E.weekSummary(view(), wk.from), null) : null;
      const stage = [str(latest && latest.stage), str(profile.stage)].find((s) => s && stages.some((x) => x.id === s)) || '';
      return { step: 1, lines: sum ? arr(sum.highlights).filter((x) => typeof x === 'string') : [], note: '', forecastNote: '', stage, score: '', plusOne: '',
        upcomingNote: '', wants: [1, 2, 3].map((i) => ({ title: '', date: shiftDate(wk.today, i), start: '18:00', reward: '', planId: null })),
        focusSkill: '', message: '', help: false, motSaved: false };
    };
    const draft = () => DRAFTS.get(ws) || null;
    let collect = () => {};
    const texts = (d) => [d.note, d.forecastNote, d.plusOne, d.upcomingNote].concat(arr(d.wants).map((w) => `${w.title} ${w.reward}`));
    const go = (step) => {
      const d = draft();
      collect();
      if (crisisIn(E, ...texts(d))) d.help = true;
      d.step = step; d.message = '';
      paint();
      focusOn('.act-review h2');
    };
    const helpLine = () => h('p', { class: 'tip act-help', 'data-test': 'review-help' }, TEXT.help + ' ', link('#/sos/urgent', TEXT.helpGo, 'btn', 'review-help-go'));
    const area = (key, label, max, d) => {
      const id = fid('rv-' + key);
      const el = h('textarea', { id, name: key, maxlength: String(max), rows: '3', 'data-test': 'review-f-' + key, value: d[key] || '' });
      return { el, node: h('div', { class: 'field' }, h('label', { class: 'field-label', for: id, text: label }), el) };
    };
    const select = (key, label, options, value) => {
      const id = fid('rv-' + key);
      const el = h('select', { id, name: key, 'data-test': 'review-f-' + key, value: value == null ? '' : String(value) }, options.map((o) => h('option', { value: o.value, text: o.label })));
      return { el, node: h('div', { class: 'field' }, h('label', { class: 'field-label', for: id, text: label }), el) };
    };

    function startScreen() {
      const saved = reviewSaved(view(), ws);
      const d = draft();
      const out = [h('p', { class: 'muted', text: TEXT.rvIntro })];
      if (saved) {
        const dayName = DAYS[Number.isInteger(profile.reviewDay) && profile.reviewDay >= 0 && profile.reviewDay <= 6 ? profile.reviewDay : 0];
        out.push(h('section', { class: 'card act-review-saved', 'data-test': 'review-saved' },
          h('p', { class: 'act-bp-title', text: TEXT.rvSaved }),
          h('p', { class: 'muted', text: TEXT.rvIcsHint(dayName) }),
          h('div', { class: 'row' }, button(TEXT.rvIcs, reminder, 'btn', 'review-ics', { 'data-testid': 'review-ics' }))));
        if (HELP_WEEKS.has(ws)) out.push(helpLine());
      }
      out.push(h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn primary', 'data-tour': 'review-start', 'data-test': 'review-start',
        text: d && d.step > 0 ? TEXT.rvResume : saved ? TEXT.rvAgain : TEXT.rvStart,
        onClick: () => { if (!draft()) DRAFTS.set(ws, newDraft()); const x = draft(); x.step = x.step > 0 ? x.step : 1; paint(); focusOn('.act-review h2'); } })));
      return out;
    }
    function reminder() {
      const U = ns('UI');
      const text = E && typeof E.ics === 'function' ? safe(() => E.ics([reviewIcsItem(profile, now)], { now }), '') : '';
      const ok = !!text && !!U && typeof U.download === 'function' && safe(() => U.download('1-addic-weekly-review.ics', text, 'text/calendar'), false) !== false;
      toastMsg(ok ? TEXT.bpIcsDone : TEXT.bpIcsNo, ok ? 'ok' : 'warn');
    }

    function screen1(d) {
      const n = area('note', TEXT.rvNote, 500, d);
      collect = () => { d.note = n.el.value; };
      return [h('h2', { class: 'card-title', text: TEXT.rv1 }),
        d.lines.length ? h('ul', { class: 'act-review-lines', 'data-test': 'review-highlights' }, d.lines.map((l) => h('li', { text: l })))
          : h('p', { class: 'muted', 'data-test': 'review-quiet', text: TEXT.rvQuiet }),
        n.node];
    }
    function screen2(d) {
      const rows = forecastRows(E, view(), wk.from);
      const n = area('forecastNote', TEXT.rvForecastNote, 1000, d);
      collect = () => { d.forecastNote = n.el.value; };
      return [h('h2', { class: 'card-title', text: TEXT.rv2 }), h('p', { class: 'muted', text: TEXT.rv2Intro }),
        rows.length ? h('ul', { class: 'act-review-lines', 'data-test': 'review-forecast' }, rows.map((r) => h('li', { 'data-test': 'review-forecast-day' },
          h('p', { class: 'act-when', text: dayLabel(r.date) }),
          r.line ? h('p', { 'data-test': 'review-forecast-line', text: r.line }) : r.rows.map((t) => h('p', { text: t })))))
          : h('p', { class: 'muted', 'data-test': 'review-forecast-none', text: TEXT.rvNoForecast }),
        n.node];
    }
    function screen3(d) {
      const st = select('stage', TEXT.rvStage, [{ value: '', label: TEXT.rvChoose }].concat(stages.map((s) => ({ value: s.id, label: str(s.name) || s.id }))), d.stage);
      const sc = select('score', TEXT.rvScore, [{ value: '', label: TEXT.rvNotNow }].concat(Array.from({ length: 11 }, (_, i) => ({ value: String(i), label: String(i) }))), d.score);
      const id = fid('rv-plusOne');
      const plus = h('input', { id, name: 'plusOne', type: 'text', maxlength: '500', autocomplete: 'off', 'data-test': 'review-f-plusOne', value: d.plusOne || '' });
      collect = () => { d.stage = st.el.value; d.score = sc.el.value; d.plusOne = plus.value; };
      return [h('h2', { class: 'card-title', text: TEXT.rv3 }), h('p', { class: 'muted', text: TEXT.rv3Intro }), st.node, sc.node,
        h('div', { class: 'field' }, h('label', { class: 'field-label', for: id, text: TEXT.rvPlusOne }), plus)];
    }
    function screen4(d) {
      const ahead = [];
      for (let i = 0; i < 7; i++) for (const p of planRowsForDate(view(), shiftDate(wk.today, i))) if (p.risky && !pastUnmarked(p, now)) ahead.push(p);
      const n = area('upcomingNote', TEXT.rvUpcomingNote, 1000, d);
      collect = () => { d.upcomingNote = n.el.value; };
      const keep = () => collect(); // a link away keeps the answers (memory) so the review resumes here
      return [h('h2', { class: 'card-title', text: TEXT.rv4 }), h('p', { class: 'muted', text: TEXT.rv4Intro }),
        ahead.length ? h('ul', { class: 'act-review-lines', 'data-test': 'review-ahead' }, ahead.map((p) => h('li', { class: 'row' },
          h('span', { class: 'act-gap-text', text: `${dayLabel(p.date)}, ${timeLabel(p.start)}: ${str(p.title) || TEXT.bpDefaultTitle}` }),
          p.battlePlan ? h('span', { class: 'badge', text: TEXT.rvBpReady })
            : link('#/actions/battle?plan=' + encodeURIComponent(p.id), TEXT.battleAdd, 'btn ghost', 'review-bp-add', { onClick: keep }))))
          : h('p', { class: 'muted', text: TEXT.rvNoRisky }),
        n.node,
        h('div', { class: 'row' }, link('#/actions/battle?new=1', TEXT.rvMakeBp, 'btn', 'review-bp-new', { onClick: keep }))];
    }
    function screen5(d) {
      const rows = d.wants.map((w, i) => {
        const ids = { title: fid('rv-w-title'), date: fid('rv-w-date'), start: fid('rv-w-start'), reward: fid('rv-w-reward') };
        const inp = {
          title: h('input', { id: ids.title, type: 'text', maxlength: '120', autocomplete: 'off', 'data-test': 'review-want-title', value: w.title, disabled: !!w.planId }),
          date: h('input', { id: ids.date, type: 'date', 'data-test': 'review-want-date', value: w.date, disabled: !!w.planId }),
          start: h('input', { id: ids.start, type: 'time', 'data-test': 'review-want-start', value: w.start, disabled: !!w.planId }),
          reward: h('input', { id: ids.reward, type: 'text', maxlength: '200', autocomplete: 'off', 'data-test': 'review-want-reward', value: w.reward, disabled: !!w.planId }),
        };
        const f = (k, label) => h('div', { class: 'field' }, h('label', { class: 'field-label', for: ids[k], text: label }), inp[k]);
        return { inp, node: h('fieldset', { class: 'act-want', 'data-test': 'review-want' }, h('legend', { text: TEXT.rvWant(i + 1) }),
          f('title', TEXT.rvWantWhat), h('div', { class: 'row act-times' }, f('date', TEXT.rvWantDay), f('start', TEXT.rvWantTime)), f('reward', TEXT.rvWantReward)) };
      });
      const fs = select('focusSkill', TEXT.rvFocus, [{ value: '', label: TEXT.rvNoFocus }].concat(skills.map((s) => ({ value: s.id, label: str(s.name) || s.id }))), d.focusSkill);
      collect = () => {
        rows.forEach((r, i) => { const w = d.wants[i]; if (w.planId) return; w.title = r.inp.title.value; w.date = r.inp.date.value; w.start = r.inp.start.value; w.reward = r.inp.reward.value; });
        d.focusSkill = fs.el.value;
      };
      return [h('h2', { class: 'card-title', text: TEXT.rv5 }), h('p', { class: 'muted', text: TEXT.rv5Intro }), rows.map((r) => r.node), fs.node];
    }
    const SCREENS = [null, screen1, screen2, screen3, screen4, screen5];

    async function save() {
      const d = draft();
      collect();
      if (crisisIn(E, ...texts(d))) d.help = true;
      const r = await saveReview(A, d, ws);
      if (!r.ok) { d.message = r.message; paint(); focusOn('.act-form-error'); return; }
      if (d.help) HELP_WEEKS.add(ws);
      DRAFTS.delete(ws);
      toastMsg(TEXT.rvDone, 'ok');
      paint();
      focusOn('[data-tour="review-start"]');
    }

    const paint = () => {
      clear(root);
      collect = () => {};
      root.appendChild(h('div', { class: 'row act-head' }, link('#/actions', TEXT.backHub, 'btn ghost', 'actions-back')));
      root.appendChild(h('h1', { class: 'page-title', text: TEXT.rvTitle }));
      const d = draft();
      if (!d || !(d.step >= 1 && d.step <= 5)) { for (const n of startScreen()) root.appendChild(n); return; }
      const body = SCREENS[d.step](d);
      const err = h('p', { class: 'field-error act-form-error', role: 'alert', tabindex: '-1', 'data-test': 'review-error', text: d.message || '' });
      if (!d.message) { err.hidden = true; err.setAttribute('hidden', ''); }
      root.appendChild(h('section', { class: 'card stack act-review-step', 'data-test': 'review-step', 'data-step': String(d.step), 'aria-label': TEXT.rvStep(d.step) },
        h('p', { class: 'act-date', text: TEXT.rvStep(d.step) }), body, err, d.help ? helpLine() : null,
        h('div', { class: 'row form-actions' },
          button(TEXT.rvBack, () => go(d.step - 1), 'btn ghost', 'review-back'),
          d.step < 5 ? button(TEXT.rvNext, () => go(d.step + 1), 'btn primary', 'review-next', { 'data-testid': 'review-next' })
            : button(TEXT.rvSave, save, 'btn primary', 'review-save', { 'data-testid': 'review-save' }))));
    };

    paint();
    return root;
  }

  /* ── page ──────────────────────────────────────────────────────────────────────────────── */
  function page(ctx) {
    const parts = ctx && ctx.route && Array.isArray(ctx.route.parts) ? ctx.route.parts : [];
    const sub = parts[1] || '';
    if (!sub) return hubPage(ctx);
    if (sub === 'planner') return plannerPage(ctx);
    if (sub === 'battle') return battlePage(ctx);
    if (sub === 'review') return reviewPage(ctx);
    return stubPage(sub);
  }

  const PURE = ['planRowsForDate', 'gapRows', 'ideaRows', 'pastUnmarked', 'planFromValues', 'saveBlock', 'plannerDate', 'localDate', 'shiftDate', 'dayLabel', 'timeLabel',
    'planEnded', 'battleLists', 'battleNotes', 'battlePlanIcsItem', 'battleIcsFile', 'battleFromValues', 'saveBattle', 'debriefPlan',
    'reviewWeek', 'nextReviewDate', 'reviewIcsItem', 'reviewSaved', 'forecastRows', 'wantToItem', 'reviewPayload', 'saveReview'];
  return { page, TEXT, PURE, forgetReviews, planRowsForDate, gapRows, ideaRows, pastUnmarked, planFromValues, saveBlock, plannerDate, localDate, shiftDate, dayLabel, timeLabel,
    planEnded, battleLists, battleNotes, battlePlanIcsItem, battleIcsFile, battleFromValues, saveBattle, debriefPlan,
    reviewWeek, nextReviewDate, reviewIcsItem, reviewSaved, forecastRows, wantToItem, reviewPayload, saveReview };
})();

// The page registers from this file (contracts/core.md: UI.pages[firstSegment]); ui-core.js is not changed.
if (typeof UI !== 'undefined' && UI && UI.pages) UI.pages.actions = (ctx) => ActionsUI.page(ctx);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
  for (const k of ActionsUI.PURE) module.exports[k] = ActionsUI[k];
}
