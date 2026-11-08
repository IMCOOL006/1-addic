/* 1-addic · ui-today.js · the Today screen (BUILD-PLAN 3.5 #/today, section 5 U-15; lane today-track).
   A stack of calm cards. Each card is a pure xxxData(...) plus a small DOM function. Nothing on this
   screen decreases, nothing is a dead button (O7), SOS is one tap away and never gated. Words are
   original, person-first, grade 6-8. Content, Engine, Store are read through typeof guards (they are
   not globalThis properties in the built page); ctx.E and ctx.A come first. */
const TodayUI = (() => {
  /* ── words ─────────────────────────────────────────────────────────────────────────────── */
  const TEXT = {
    title: 'Today',
    logCraving: 'Log a craving',
    sos: 'SOS', help: 'Help',
    statusChip: 'Your harbor', harborGo: 'Your harbor: see where you stand',
    companion: (n) => `${n} is here with you today.`,
    checkinTitle: (k) => (k === 'morning' ? 'Morning check-in' : 'Evening check-in'),
    checkinBody: (k) => (k === 'morning'
      ? 'Two minutes: how you feel and one thing you want from today.'
      : 'Two minutes: how today went, and what helped.'),
    checkinGo: 'Start check-in',
    planTitle: "Today's plan",
    planEmpty: 'Nothing planned for today yet.',
    planEmptyLocked: 'The Planner opens up as you learn. For now, today is open.',
    planGo: 'Plan today',
    learnMore: 'Keep learning',
    risky: 'Risky time',
    done: 'Done',
    battleSummary: 'Your Battle Plan',
    battleSituation: 'The situation',
    battlePlan: 'Your plan',
    battleBackups: 'Backups',
    battleOpen: 'Open Battle Plans',
    battleMake: 'Make a Battle Plan for this',
    battleLocked: 'Battle Plans open up as you learn.',
    wantTitle: 'Something you want to do',
    wantIdea: (hour, act) => `An idea for about ${String(hour).padStart(2, '0')}:00: ${act}.`,
    wantGo: 'Open the Planner',
    learnTitle: 'Continue learning',
    learnBody: 'Pick up where you left off.',
    learnGo: 'Go to Learn',
    questsTitle: 'Your quests',
    questSteps: (d, t) => `${d} of ${t} steps`,
    questsGo: 'Open quests',
    reasonsTitle: 'From your Reasons Card',
    reasonsEmpty: 'Your Reasons Card holds why this matters to you. Add a reason when you feel ready.',
    reasonsGo: 'Open your Reasons Card',
    reasonsAdd: 'Add a reason',
    countersTitle: 'Your days',
    total: (t) => `${t} in total`,
    current: 'current run',
    next: (n) => `Next milestone: ${n} days.`,
    momentumTitle: 'Momentum',
    momentum: (d, of) => `You did something for your recovery on ${d} of the last ${of} days.`,
    explorerTitle: 'Explorer',
    explorer: (d, t) => `${d} of ${t} first steps tried.`,
    explorerNext: (l) => `Next idea: ${l}.`,
    tipTitle: 'A tip for today',
    tipGo: 'Show me',
    notNow: 'Not now',
    backupTitle: 'Back up your notebook',
    backupBody: 'Your notes live only on this device. A backup file keeps a copy safe if the phone is lost or reset.',
    backupGo: 'Make a backup',
    milestoneTitle: (n) => `${n} days`,
    milestoneBody: 'You reached a milestone. Take a moment to notice what you did to get here.',
    thanks: 'Thanks',
    maintenance: 'Maintenance mode: a lighter Today, with the basics close at hand.',
    sample: 'Sample',
    harbor: 'Your Harbor',
    error: 'That did not save. Please try again.',
    objectivesTitle: "Today's objectives",
    objectiveDone: 'Done', objectiveDoneAria: (t) => `Mark done: ${t}`, objectiveIsDone: 'Done',
    objectiveSwap: 'Swap', objectiveSwapAria: (t) => `Swap for another one: ${t}`,
    growing: (n) => (n === 1 ? '1 thing growing in your harbor.' : `${n} things growing in your harbor.`),
    growingNone: 'The first one grows when you do one.',
    run: { header: 'Days shown up', neutral: 'Days active', current: 'Now', best: 'Best', total: 'In all',
      keptLine: 'Kept. One quiet day a week still counts.', cameBackLine: 'You came back.' },
    wayTitle: 'Your way',
    unlocks: (name) => `Unlocks: ${name}`,
    progress: (have, need) => `Progress: ${have} of ${need}`,
    claim: 'Claim', claimAria: (t) => `Claim: ${t}`,
    wayDone: 'Every step is done.',
  };

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
      if (name === 'LearnUI') return typeof LearnUI !== 'undefined' ? LearnUI : null;
      if (name === 'HarborUI') return typeof HarborUI !== 'undefined' ? HarborUI : null;
      if (name === 'GuidanceUI') return typeof GuidanceUI !== 'undefined' ? GuidanceUI : null;
      if (name === 'GameUI') return typeof GameUI !== 'undefined' ? GameUI : null;
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
  /* The device-local calendar date 'YYYY-MM-DD' ('' when x is not a date). */
  function localDate(x) {
    if (typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x)) return x;
    const d = toDate(x);
    return d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : '';
  }
  const dayNumber = (ds) => { const d = toDate(ds); return d ? Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000) : 0; };
  const list = (view, store) => safe(() => arr(view.list(store)).filter(isObj), []);
  const get = (view, store, key) => safe(() => view.get(store, key), null);
  const E_ = (ctx) => (ctx && ctx.E !== undefined ? ctx.E : ns('Engine'));

  /* h: text through textContent only; on* keys become listeners; null/false attributes are skipped. */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    const a = attrs || {};
    if (a.text != null) el.textContent = String(a.text);
    for (const k of Object.keys(a)) {
      const v = a[k];
      if (k === 'text' || v == null || v === false) continue;
      if (/^on[A-Z]/.test(k) && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'class') el.setAttribute('class', arr(v).length ? arr(v).filter(Boolean).join(' ') : String(v));
      else el.setAttribute(k, v === true ? '' : String(v));
    }
    for (const c of kids.flat(3)) {
      if (c == null || c === false || c === true) continue;
      el.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
    }
    return el;
  }
  const link = (href, text, cls, test) => h('a', { href, class: cls || 'btn', text, 'data-test': test });
  const cardEl = (test, title, ...body) => h('section', { class: 'card stack td-card', 'data-test': test, 'aria-label': title },
    h('h2', { class: 'card-title', text: title }), ...body);
  const hide = (el) => { if (el) { el.hidden = true; el.setAttribute('hidden', ''); } };
  function meterEl(value, max) {
    const U = ns('UI');
    if (U && typeof U.meter === 'function') return U.meter(value, max);
    return h('div', { class: 'meter', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(max), 'aria-valuenow': String(value) });
  }
  function ringEl(pct, label) {
    const U = ns('UI');
    if (U && typeof U.ring === 'function') return U.ring(pct, label);
    return h('div', { class: 'ring', role: 'img', 'aria-label': `${label}: ${Math.round(pct)}%` });
  }
  function featuresOf(ctx) {
    if (ctx && ctx.features && typeof ctx.features.has === 'function') return ctx.features;
    const E = E_(ctx);
    return safe(() => E.revealed(ctx.view), null) || new Set(safe(() => ns('Content').reveal.always, []));
  }
  function discreetOf(ctx) {
    if (ctx && ctx.settings && ctx.settings.discreet === true) return true;
    return safe(() => document.documentElement.getAttribute('data-discreet') !== null, false) === true;
  }

  /* ── pure data ─────────────────────────────────────────────────────────────────────────── */
  function greetingFor(now, profile, E) {
    const name = str(profile && profile.name);
    const eng = E === undefined ? ns('Engine') : E;
    const g = eng && typeof eng.greeting === 'function' ? safe(() => eng.greeting(now, name), '') : '';
    if (g) return g;
    const d = toDate(now); const hr = d ? d.getHours() : 12;
    const base = hr >= 5 && hr < 12 ? 'Good morning' : hr >= 12 && hr < 17 ? 'Good afternoon' : hr >= 17 ? 'Good evening' : 'Hello';
    return name ? `${base}, ${name}.` : `${base}.`;
  }

  /* Today's check-ins done, by kind (the person's own rows; drills and sample rows do not count). */
  function checkinsDone(view, now) {
    const today = localDate(now);
    const done = new Set();
    for (const l of list(view, 'logs')) {
      if (l.type !== 'checkin' || l.drill === true || l.sample === true) continue;
      const d = /^\d{4}-\d{2}-\d{2}$/.test(String(l.date || '')) ? l.date : localDate(l.at);
      const k = isObj(l.checkin) ? l.checkin.kind : null;
      if (d === today && (k === 'morning' || k === 'evening')) done.add(k);
    }
    return done;
  }
  /* Minutes after midnight for 'HH:MM', else null. */
  const minutesOf = (t) => {
    const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(str(t));
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  };
  /* The two switch points in minutes: [morning until, evening from]. With both profile.checkin times
     set: morning until the midpoint of the two, evening from two hours before the evening time. Without
     them (or when they make no sense): morning before 12:00, evening from 17:00. */
  function checkinWindows(profile) {
    const c = isObj(profile) && isObj(profile.checkin) ? profile.checkin : {};
    const mo = minutesOf(c.morning); const evn = minutesOf(c.evening);
    if (mo === null || evn === null || evn <= mo) return [12 * 60, 17 * 60];
    const until = Math.floor((mo + evn) / 2);
    return [until, Math.max(until, evn - 120)];
  }
  /* Morning before the first switch point, evening from the second, between them whichever of
     today's two is not done. */
  function checkinKind(view, now, profile) {
    const d = toDate(now); if (!d) return null;
    const mins = d.getHours() * 60 + d.getMinutes();
    const [until, from] = checkinWindows(profile);
    const done = checkinsDone(view, d);
    if (mins < until) return done.has('morning') ? null : 'morning';
    if (mins >= from) return done.has('evening') ? null : 'evening';
    if (!done.has('morning')) return 'morning';
    if (!done.has('evening')) return 'evening';
    return null;
  }

  /* Today's plan rows, by start time, each with risky and its Battle Plan (or null). */
  function planToday(view, now) {
    const today = localDate(now);
    return list(view, 'plans')
      .filter((p) => p.date === today && p.status !== 'skipped')
      .map((p) => {
        const bp = isObj(p.battlePlan) && (str(p.battlePlan.situation) || str(p.battlePlan.plan)) ? p.battlePlan : null;
        return Object.assign({}, p, { risky: p.risky === true || p.kind === 'risky', battlePlan: bp });
      })
      .sort((a, b) => String(a.start || '99:99').localeCompare(String(b.start || '99:99')) || String(a.title || '').localeCompare(String(b.title || '')));
  }

  /* One want-to: a planned 'want' for today, else the first suggestion, else null. */
  function wantToday(view, now, E) {
    const p = planToday(view, now).find((x) => x.kind === 'want');
    if (p) return { kind: 'planned', title: str(p.title) || str(p.activity), start: p.start || '', sample: p.sample === true };
    const eng = E === undefined ? ns('Engine') : E;
    const s = eng && typeof eng.suggestions === 'function' ? safe(() => arr(eng.suggestions(view, localDate(now))), []) : [];
    if (s.length && str(s[0].activity)) return { kind: 'idea', title: str(s[0].activity), hour: s[0].hour };
    return null;
  }

  /* Started and not complete, at most two: [{id, name, done, total}]. */
  function activeQuests(view, E) {
    const eng = E === undefined ? ns('Engine') : E;
    const q = eng && typeof eng.quests === 'function' ? safe(() => eng.quests(view), {}) : {};
    const rows = list(view, 'quests').filter((r) => r.sample !== true);
    const C = ns('Content') || {};
    return arr(C.quests).map((c) => {
      const s = isObj(q) && isObj(q[c.id]) ? q[c.id] : null;
      const row = rows.find((r) => r.id === c.id);
      if (!s || s.complete) return null;
      if (!(row && row.startedAt) && !(s.done > 0)) return null;
      return { id: c.id, name: c.name, done: s.done, total: s.total };
    }).filter(Boolean).slice(0, 2);
  }

  /* One reason, rotating by day; null when the card is empty. */
  function reasonOfDay(view, now, E) {
    const eng = E === undefined ? ns('Engine') : E;
    const rs = eng && typeof eng.reasonsCard === 'function' ? safe(() => arr(eng.reasonsCard(view)).filter((s) => str(s)), []) : [];
    return rs.length ? { text: rs[dayNumber(localDate(now)) % rs.length], count: rs.length } : null;
  }

  /* Opt-in counters: null unless settings.counters is true, a start date is set, and discreet is off. */
  function countersData(counters, settings, discreet) {
    const s = settings || {};
    if (s.counters !== true || discreet === true || !isObj(counters) || !counters.tracking) return null;
    return {
      total: Math.max(0, Number(counters.total) || 0),
      current: s.showCurrentRun === true ? Math.max(0, Number(counters.current) || 0) : null,
      next: Number.isInteger(counters.nextMilestone) ? counters.nextMilestone : null,
    };
  }

  /* A backup is due when there is something to lose, the last backup is missing or 14+ days old,
     and the reminder was not set aside in the last 14 days. */
  function backupDue(view, settings, now) {
    const s = settings || {};
    const t = toDate(now); if (!t) return false;
    const ms = 14 * 86400000;
    const own = (store) => list(view, store).filter((r) => r.sample !== true && r.drill !== true).length;
    if (own('logs') + own('responses') < 1) return false;
    const last = toDate(s.lastBackupAt);
    if (last && t.getTime() - last.getTime() < ms) return false;
    const dis = toDate(s.backupReminderDismissedAt);
    if (dis && t.getTime() - dis.getTime() < ms) return false;
    return true;
  }

  /* The milestone to mark: the highest reached and not yet seen (so a long run shows one card, not
     eight); null when counters are off or nothing new. */
  function milestoneDue(counters, settings) {
    const s = settings || {};
    if (s.counters !== true || !isObj(counters) || !counters.tracking) return null;
    const seen = new Set(arr(s.milestonesSeen));
    const fresh = arr(counters.reached).filter((n) => Number.isInteger(n) && n > 0 && !seen.has(n));
    return fresh.length ? Math.max(...fresh) : null;
  }

  /* Which cards show, in order. Maintenance keeps the basics; Calm hides rings and the Harbor. */
  function cardsFor(o) {
    const base = ['checkin', 'plan', 'reasons', 'tip', 'backup'];
    if (o.maintenance) return base;
    const all = ['milestone', 'checkin', 'plan', 'want', 'learn', 'quests', 'reasons', 'counters', 'momentum', 'game', 'explorer', 'tip', 'more', 'backup', 'harbor'];
    return all.filter((k) => !(o.calm && (k === 'momentum' || k === 'game' || k === 'explorer' || k === 'harbor')) && !(o.discreet && (k === 'harbor' || k === 'counters' || k === 'game')));
  }

  /* V-43: the objectives and quest-line cards go right after the check-in (cardsFor itself is unchanged). Maintenance
     keeps the objectives only; discreet hides the quest-line, whose reward names are not neutral. */
  function withObjectives(keys, o) {
    const x = o || {};
    const add = x.maintenance || x.discreet ? ['objectives'] : ['objectives', 'questline'];
    const k = arr(keys).filter((key) => !add.includes(key));
    const i = k.indexOf('checkin');
    k.splice(i < 0 ? 0 : i + 1, 0, ...add);
    return k;
  }
  /* The run line from Engine.run: null with no day shown up yet. Content.runWords wins key by key, TEXT fills the gaps.
     Never a countdown: 'kept' on a grace day (holding), 'you came back' after a break; best and total come as given. */
  function runLine(r, words, discreet) {
    if (!isObj(r) || !(Number(r.total) > 0)) return null;
    const given = isObj(words) ? Object.fromEntries(Object.entries(words).filter(([, v]) => str(v))) : {};
    const w = Object.assign({}, TEXT.run, given);
    const n = (v) => Math.max(0, Math.floor(Number(v) || 0));
    return {
      header: discreet ? TEXT.run.neutral : w.header, current: n(r.current), best: n(r.best), total: n(r.total),
      labels: { current: w.current, best: w.best, total: w.total },
      kept: r.holding ? w.keptLine : null, back: r.cameBack === true ? w.cameBackLine : null,
    };
  }

  /* ── cards (DOM) ───────────────────────────────────────────────────────────────────────── */
  const sampleTag = (row) => (row && row.sample === true ? h('span', { class: 'td-tag td-sample', text: TEXT.sample }) : null);
  const run = (fn) => Promise.resolve().then(fn);
  function errLine(el) { return (e) => { if (el) el.textContent = (e && e.message) || TEXT.error; }; }

  /* game-tutorials' pieces (contracts/game-tutorials.md): each behind typeof, each given the page's ctx as received,
     each in safe() so a throw there never breaks Today. Absent, Today renders exactly as without them. */
  const embedFn = (name, fn) => { const M = ns(name); return M && typeof M[fn] === 'function' ? M : null; };
  const ctxOf = (c) => (c && c.ctxIn) || c;
  function newDot(c, featureId) {
    const G = embedFn('GuidanceUI', 'dot');
    return G ? safe(() => G.dot(featureId, ctxOf(c)), null) : null;
  }
  function gameCard(c) {
    const G = embedFn('GameUI', 'panel');
    return G ? safe(() => G.panel(ctxOf(c)), null) : null;
  }
  function moreCard(c) {
    const G = embedFn('GuidanceUI', 'moreTools');
    return G ? safe(() => G.moreTools(ctxOf(c)), null) : null;
  }

  function checkinCard(c) {
    const kind = checkinKind(c.view, c.now, c.profile);
    if (!kind) return null;
    return cardEl('today-checkin', TEXT.checkinTitle(kind), h('p', { text: TEXT.checkinBody(kind) }),
      h('div', { class: 'row' }, link('#/track/log/checkin?kind=' + kind, TEXT.checkinGo, 'btn primary', 'today-checkin-go')));
  }

  function planCard(c, features) {
    const rows = planToday(c.view, c.now);
    const planner = features.has('planner');
    const battle = features.has('battlePlans');
    if (!rows.length) {
      return cardEl('today-plan', TEXT.planTitle, h('p', { class: 'muted', text: planner ? TEXT.planEmpty : TEXT.planEmptyLocked }),
        h('div', { class: 'row' }, planner ? link('#/actions/planner', TEXT.planGo) : link('#/learn', TEXT.learnMore), planner ? newDot(c, 'planner') : null));
    }
    const items = rows.map((p) => {
      const time = p.start ? (p.end ? `${p.start}–${p.end}` : p.start) : '';
      const head = h('div', { class: 'row td-plan-head' },
        time ? h('span', { class: 'td-time', text: time }) : null,
        h('span', { class: 'td-plan-title', text: str(p.title) || str(p.activity) || TEXT.planTitle }),
        p.risky ? h('span', { class: 'td-tag td-risky', text: TEXT.risky }) : null,
        p.status === 'done' ? h('span', { class: 'td-tag', text: TEXT.done }) : null, sampleTag(p));
      let detail = null;
      if (p.risky && p.battlePlan) {
        const bp = p.battlePlan;
        detail = h('details', { class: 'td-battle', 'data-test': 'today-battle' }, h('summary', { text: TEXT.battleSummary }),
          str(bp.situation) ? h('p', {}, h('strong', { text: TEXT.battleSituation + ': ' }), str(bp.situation)) : null,
          str(bp.plan) ? h('p', {}, h('strong', { text: TEXT.battlePlan + ': ' }), str(bp.plan)) : null,
          arr(bp.backups).filter((b) => str(b)).length ? h('p', {}, h('strong', { text: TEXT.battleBackups + ': ' }), arr(bp.backups).filter((b) => str(b)).join('; ')) : null,
          battle ? link('#/actions/battle', TEXT.battleOpen, 'btn ghost') : null);
      } else if (p.risky) {
        detail = battle ? link('#/actions/battle', TEXT.battleMake, 'btn ghost') : h('p', { class: 'muted', text: TEXT.battleLocked });
      }
      return h('li', { class: ['stack', 'td-plan-item', p.risky ? 'td-is-risky' : ''] }, head, detail);
    });
    return cardEl('today-plan', TEXT.planTitle, h('ul', { class: 'stack td-plan' }, items),
      planner ? h('div', { class: 'row' }, link('#/actions/planner', TEXT.planGo, 'btn ghost'), newDot(c, 'planner')) : null);
  }

  function wantCard(c, features) {
    const w = wantToday(c.view, c.now, E_(c));
    if (!w) return null;
    const text = w.kind === 'planned' ? (w.start ? `${w.start} · ${w.title}` : w.title) : TEXT.wantIdea(w.hour, w.title);
    return cardEl('today-want', TEXT.wantTitle, h('p', {}, text, ' ', w.sample ? sampleTag({ sample: true }) : null),
      features.has('planner') ? h('div', { class: 'row' }, link('#/actions/planner', TEXT.wantGo, 'btn ghost')) : null);
  }

  function learnCard(c) {
    const L = ns('LearnUI');
    if (L && typeof L.focusCard === 'function') {
      const n = safe(() => L.focusCard(c), null);
      if (n) return n;
    }
    return cardEl('today-learn', TEXT.learnTitle, h('p', { text: TEXT.learnBody }),
      h('div', { class: 'row' }, link('#/learn', TEXT.learnGo, 'btn primary')));
  }

  function questsCard(c) {
    const qs = activeQuests(c.view, E_(c));
    if (!qs.length) return null;
    return cardEl('today-quests', TEXT.questsTitle,
      h('ul', { class: 'stack td-quests' }, qs.map((q) => h('li', { class: 'stack' },
        h('span', { text: q.name }), meterEl(q.done, q.total), h('span', { class: 'muted', text: TEXT.questSteps(q.done, q.total) })))),
      h('div', { class: 'row' }, link('#/actions/quests', TEXT.questsGo, 'btn ghost'), newDot(c, 'quests')));
  }

  function reasonsCard(c) {
    const r = reasonOfDay(c.view, c.now, E_(c));
    if (!r) {
      return cardEl('today-reasons', TEXT.reasonsTitle, h('p', { class: 'muted', text: TEXT.reasonsEmpty }),
        h('div', { class: 'row' }, link('#/workbook/reasons', TEXT.reasonsAdd, 'btn ghost')));
    }
    return cardEl('today-reasons', TEXT.reasonsTitle, h('blockquote', { class: 'td-reason', text: r.text }),
      h('div', { class: 'row' }, link('#/workbook/reasons', TEXT.reasonsGo, 'btn ghost')));
  }

  function countersCard(c, gs) {
    const d = countersData(gs && gs.counters, c.settings, discreetOf(c));
    if (!d) return null;
    const days = (c.term && c.term.days) || 'days';
    const tiles = [h('div', { class: 'tile' }, h('span', { class: 'tile-value', text: String(d.total) }), h('span', { class: 'tile-label', text: TEXT.total(days) }))];
    if (d.current !== null) tiles.push(h('div', { class: 'tile' }, h('span', { class: 'tile-value', text: String(d.current) }), h('span', { class: 'tile-label', text: TEXT.current })));
    return cardEl('today-counters', TEXT.countersTitle, h('div', { class: 'grid td-tiles' }, tiles),
      d.next ? h('p', { class: 'muted', text: TEXT.next(d.next) }) : null);
  }

  function momentumCard(c, gs) {
    const m = gs && gs.momentum;
    if (!m || !(m.of > 0)) return null;
    return cardEl('today-momentum', TEXT.momentumTitle,
      h('div', { class: 'row' }, ringEl(100 * m.days / m.of, TEXT.momentumTitle), h('p', { text: TEXT.momentum(m.days, m.of) })));
  }

  /* With GuidanceUI.explorerRing present its ring takes this slot; its null (finished or hidden) shows nothing. */
  function explorerCard(c) {
    const G = embedFn('GuidanceUI', 'explorerRing');
    if (G) {
      const n = safe(() => G.explorerRing(ctxOf(c)), null);
      return n ? h('section', { class: 'card td-explorer', 'aria-label': TEXT.explorerTitle }, n) : null;
    }
    const E = E_(c);
    if (!E || typeof E.explorer !== 'function') return null;
    if (safe(() => E.explorerDone(c.view), false) === true) return null;
    const items = safe(() => arr(E.explorer(c.view)), []);
    if (!items.length) return null;
    const done = items.filter((x) => x.done).length;
    if (done === items.length) return null;
    const nextOne = items.find((x) => !x.done);
    return cardEl('today-explorer', TEXT.explorerTitle,
      h('div', { class: 'row' }, ringEl(100 * done / items.length, TEXT.explorerTitle),
        h('div', { class: 'stack' }, h('p', { text: TEXT.explorer(done, items.length) }), nextOne ? h('p', { class: 'muted', text: TEXT.explorerNext(nextOne.label) }) : null)));
  }

  /* The tip of the day: picked by the engine, marked once (A.markTipShown) and kept on screen for the
     rest of the day even though the engine then picks nothing. Never on an SOS route. */
  const tipState = { day: '', tip: null, marked: '', dismissed: '' };
  function tipCard(c) {
    const route = c.route && c.route.path ? '#' + c.route.path : '#/today';
    if (route.startsWith('#/sos') || (c.settings && c.settings.tips === false)) return null;
    const today = localDate(c.now);
    if (tipState.dismissed === today) return null;
    const E = E_(c);
    let tip = E && typeof E.pickTip === 'function' ? safe(() => E.pickTip(c.view, c.now, { route: '#/today' }), null) : null;
    if (tip && str(tip.text)) { tipState.day = today; tipState.tip = tip; } else tip = tipState.day === today ? tipState.tip : null;
    if (!tip || !str(tip.text)) return null;
    const markKey = today + ' ' + tip.id;
    if (tipState.marked !== markKey && c.A && typeof c.A.markTipShown === 'function') {
      tipState.marked = markKey;
      run(() => c.A.markTipShown(tip.id)).catch(() => {});
    }
    const goes = typeof tip.route === 'string' && tip.route.startsWith('#/') && !tip.route.startsWith('#/sos');
    const el = cardEl('today-tip', TEXT.tipTitle, h('p', { text: tip.text }));
    el.appendChild(h('div', { class: 'row' }, goes ? link(tip.route, TEXT.tipGo, 'btn ghost', 'today-tip-go') : null,
      h('button', { type: 'button', class: 'btn ghost', text: TEXT.notNow, 'data-test': 'today-tip-dismiss', onClick: () => { tipState.dismissed = today; hide(el); } })));
    return el;
  }

  function backupCard(c) {
    if (!backupDue(c.view, c.settings, c.now)) return null;
    const msg = h('p', { class: 'muted', 'aria-live': 'polite' });
    const el = cardEl('today-backup', TEXT.backupTitle, h('p', { text: TEXT.backupBody }));
    el.appendChild(h('div', { class: 'row' }, link('#/settings/data', TEXT.backupGo, 'btn primary'),
      h('button', { type: 'button', class: 'btn ghost', text: TEXT.notNow, 'data-test': 'today-backup-dismiss',
        onClick: () => run(() => c.A.settings.patch({ backupReminderDismissedAt: new Date(c.now).toISOString() })).then(() => hide(el), errLine(msg)) })));
    el.appendChild(msg);
    return el;
  }

  function milestoneCard(c, gs) {
    const counters = gs && gs.counters;
    const n = milestoneDue(counters, c.settings);
    if (n === null || discreetOf(c)) return null;
    const msg = h('p', { class: 'muted', 'aria-live': 'polite' });
    const upTo = arr(counters.reached).filter((m) => Number.isInteger(m) && m > 0 && m <= n);
    const el = cardEl('today-milestone', TEXT.milestoneTitle(n), h('p', { text: TEXT.milestoneBody }));
    el.appendChild(h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn primary', text: TEXT.thanks, 'data-test': 'today-milestone-thanks',
      onClick: () => run(() => c.A.recordEvent('MilestoneSeen', { milestone: n }))
        .then(() => c.A.settings.patch({ milestonesSeen: upTo }))
        .then(() => hide(el), errLine(msg)) })));
    el.appendChild(msg);
    return el;
  }

  function harborCard(c) {
    const Hb = ns('HarborUI');
    if (Hb && typeof Hb.scene === 'function') {
      const n = safe(() => Hb.scene(c), null);
      // the whole scene is one link to the status page (V-01b); the svg keeps its own description
      return n ? h('section', { class: 'card td-harbor', 'data-test': 'today-harbor', 'aria-label': TEXT.harbor },
        h('a', { href: '#/status', class: 'td-harbor-go', 'data-test': 'today-harbor-go', 'aria-label': TEXT.harborGo }, n)) : null;
    }
    const U = ns('UI');
    if (!U || typeof U.svg !== 'function') return null;
    const s = U.svg;
    const art = s('svg', { viewBox: '0 0 120 60', width: '120', height: '60', 'aria-hidden': 'true', focusable: 'false', class: 'td-lantern' },
      s('path', { class: 'td-sea', d: 'M0 46 Q15 42 30 46 T60 46 T90 46 T120 46 V60 H0 Z' }),
      s('rect', { class: 'td-post', x: '57', y: '24', width: '6', height: '22', rx: '1' }),
      s('rect', { class: 'td-lamp', x: '53', y: '12', width: '14', height: '12', rx: '2' }),
      s('circle', { class: 'td-glow', cx: '60', cy: '18', r: '4' }));
    return h('section', { class: 'card td-harbor', 'data-test': 'today-harbor', 'aria-hidden': 'true' }, art);
  }

  /* ── V-43: today's objectives, the run line, the quest-line step ─────────────────────────────── */
  /* An Actions verb, or null when absent (then its button is not drawn: O7). */
  const verb = (A, group, fn) => (A && isObj(A[group]) && typeof A[group][fn] === 'function' ? (...a) => A[group][fn](...a) : null);
  const statusLine = () => h('p', { class: 'muted td-msg', role: 'status', 'aria-live': 'polite' });
  /* A refusal shows its message and nothing throws; an ok result re-renders through Store.subscribe (ui-core). */
  function act(msg, fn, onOk) {
    return run(fn).then((res) => {
      if (res && res.ok === false) { msg.textContent = str(res.message) || TEXT.error; return; }
      msg.textContent = '';
      if (onOk) safe(() => onOk(res), null);
    }, (e) => { msg.textContent = (e && e.message) || TEXT.error; });
  }
  const featureName = (id) => {
    const C = ns('Content');
    const f = C && isObj(C.features) && str(id) ? C.features[id] : null;
    return isObj(f) ? str(f.name) : '';
  };
  function objectivesCard(c) {
    const E = c.E;
    const r = E && typeof E.dailyObjectives === 'function' ? safe(() => E.dailyObjectives(c.view, c.now), null) : null;
    const items = isObj(r) ? arr(r.items).filter((o) => isObj(o) && str(o.id)) : [];
    if (!items.length) return null;
    const done = verb(c.A, 'objective', 'done');
    const swap = r.swapped !== true ? verb(c.A, 'objective', 'swap') : null;
    const msg = statusLine();
    const rows = items.map((o) => {
      const title = str(o.title) || o.id;
      const isDone = o.done === true;
      return h('li', { class: 'stack td-objective', 'data-test': 'objective', 'data-id': o.id, 'data-done': isDone ? 'true' : 'false' },
        h('p', { class: 'td-objective-title', text: title }),
        str(o.line) ? h('p', { class: 'muted', text: str(o.line) }) : null,
        h('div', { class: 'row' },
          isDone ? h('span', { class: 'td-tag', text: TEXT.objectiveIsDone }) : null,
          !isDone && done ? h('button', { type: 'button', class: 'btn primary', 'data-test': 'objective-done', 'aria-label': TEXT.objectiveDoneAria(title),
            text: TEXT.objectiveDone, onClick: () => act(msg, () => done(o.id)) }) : null,
          !isDone && swap && o.swappable === true && str(o.swapTo) ? h('button', { type: 'button', class: 'btn ghost', 'data-test': 'objective-swap',
            'aria-label': TEXT.objectiveSwapAria(title), text: TEXT.objectiveSwap, onClick: () => act(msg, () => swap(o.id)) }) : null));
    });
    const n = Math.max(0, Math.floor(Number(r.growth) || 0));
    return h('section', { class: 'card stack td-card td-objectives', 'data-test': 'objectives-card', 'data-tour': 'objectives-card', 'aria-label': TEXT.objectivesTitle },
      h('h2', { class: 'card-title', text: TEXT.objectivesTitle }),
      h('ul', { class: 'td-objective-list' }, rows),
      h('p', { class: 'muted td-growing', text: n > 0 ? TEXT.growing(n) : TEXT.growingNone }), msg);
  }
  /* Under the quick row: days shown up, now · best · in all (Engine.run). Not the opt-in sober-day counters. */
  function runLineEl(c, discreet) {
    const E = c.E;
    const r = E && typeof E.run === 'function' ? safe(() => E.run(c.view, c.now), null) : null;
    const C = ns('Content');
    const d = runLine(r, C && C.runWords, discreet);
    if (!d) return null;
    const part = (k, test) => h('span', { class: 'td-run-part', 'data-test': test }, `${d.labels[k]} `, h('strong', { text: String(d[k]) }));
    return h('div', { class: 'stack td-run', 'data-test': 'run-line', 'data-tour': 'run-line' },
      h('p', { class: 'td-run-nums' }, h('span', { class: 'td-run-head', text: `${d.header}: ` }),
        part('current', 'run-current'), ' · ', part('best', 'run-best'), ' · ', part('total', 'run-total')),
      d.kept ? h('p', { class: 'muted', 'data-test': 'run-kept', text: d.kept }) : null,
      d.back ? h('p', { class: 'td-run-back', 'data-test': 'run-back', text: d.back }) : null);
  }
  /* On a claim the reward sheet is game-tutorials' (V-44), behind typeof; without it the unlock shows on the next Today. */
  function rewardSheet(c, res) {
    const evs = arr(res && res.events).concat(res && isObj(res.event) ? [res.event] : []);
    const ev = evs.find((e) => isObj(e) && e.type === 'FeatureUnlocked');
    const feature = ev && isObj(ev.payload) ? str(ev.payload.feature) : '';
    const G = embedFn('GuidanceUI', 'rewardSheet');
    if (feature && G) safe(() => G.rewardSheet(feature, ctxOf(c)), null);
  }
  function questlineCard(c) {
    const E = c.E;
    const ql = E && typeof E.questLine === 'function' ? safe(() => E.questLine(c.view, c.now), null) : null;
    if (!isObj(ql) || !(Number(ql.total) > 0)) return null;
    const card = (...body) => h('section', { class: 'card stack td-card td-questline', 'data-test': 'questline-card', 'data-tour': 'questline-card', 'aria-label': TEXT.wayTitle },
      h('h2', { class: 'card-title', text: TEXT.wayTitle }), ...body);
    const s = isObj(ql.current) ? ql.current : null;
    if (!s) return Number(ql.done) >= Number(ql.total) ? card(h('p', { class: 'muted', text: TEXT.wayDone })) : null;
    const title = str(s.title) || str(s.id);
    const name = featureName(s.reward);
    const p = isObj(s.progress) ? s.progress : null;
    const need = p ? Math.max(0, Math.floor(Number(p.need) || 0)) : 0;
    const have = p ? Math.min(need, Math.max(0, Math.floor(Number(p.have) || 0))) : 0;
    const claim = s.claimable === true ? verb(c.A, 'questLine', 'claim') : null;
    const msg = statusLine();
    return card(
      h('div', { class: 'stack', 'data-test': 'questline-step', 'data-state': 'current', 'data-id': str(s.id) },
        h('p', { class: 'td-step-title', text: title }),
        str(s.line) ? h('p', { text: str(s.line) }) : null,
        name ? h('p', { class: 'muted', text: TEXT.unlocks(name) }) : null,
        str(s.opened) ? h('p', { class: 'muted', text: str(s.opened) }) : null,
        need > 0 ? h('p', { class: 'muted', text: TEXT.progress(have, need) }) : null),
      claim ? h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn primary', 'data-test': 'questline-claim', 'aria-label': TEXT.claimAria(title),
        text: TEXT.claim, onClick: () => act(msg, () => claim(s.id), (res) => rewardSheet(c, res)) })) : null,
      msg);
  }

  /* The way in to Your Harbor (#/status), beside Log a craving and SOS; the same word in Calm and discreet mode.
     The "New" dot only once Content.features.status exists (content V-10; the dot itself is GuidanceUI's). */
  function statusChip(c) {
    const C = ns('Content'); const G = ns('GuidanceUI');
    const dot = C && isObj(C.features) && C.features.status && G && typeof G.dot === 'function' ? safe(() => G.dot('status', c.ctxIn || c), null) : null;
    return h('a', { href: '#/status', class: 'btn td-status', 'data-test': 'today-status', 'data-tour': 'status-open', text: TEXT.statusChip }, dot);
  }

  /* ── the page ──────────────────────────────────────────────────────────────────────────── */
  function page(ctxIn) {
    const x = ctxIn || {};
    const c = {
      view: x.view || { get: () => null, list: () => [], count: () => 0 },
      E: E_(x), A: x.A || ns('Actions'), profile: isObj(x.profile) ? x.profile : {}, settings: isObj(x.settings) ? x.settings : {},
      term: x.term, now: x.now || new Date(), features: x.features, calm: !!x.calm, route: x.route || { path: '/today', parts: ['today'], query: {} },
    };
    Object.defineProperty(c, 'ctxIn', { value: x }); // the page's ctx as received, for game-tutorials' pieces
    const features = featuresOf(c);
    const discreet = discreetOf(c);
    const maintenance = c.settings.maintenance === true;
    const gs = c.E && typeof c.E.gameState === 'function' ? safe(() => c.E.gameState(c.view, c.now), null) : null;
    const companion = str(c.profile.companion);
    const head = h('header', { class: 'stack td-head' },
      h('h1', { text: greetingFor(c.now, c.profile, c.E) }),
      companion ? h('p', { class: 'muted', text: TEXT.companion(companion) }) : null,
      maintenance ? h('p', { class: 'muted', 'data-test': 'today-maintenance', text: TEXT.maintenance }) : null,
      h('div', { class: 'row td-quick' },
        link('#/track/log/craving', TEXT.logCraving, 'btn primary', 'today-log-craving'),
        link('#/sos', discreet ? TEXT.help : TEXT.sos, 'btn', 'today-sos'),
        statusChip(c)),
      maintenance ? null : safe(() => runLineEl(c, discreet), null));
    const make = {
      milestone: () => milestoneCard(c, gs), checkin: () => checkinCard(c), plan: () => planCard(c, features),
      want: () => wantCard(c, features), learn: () => learnCard(c), quests: () => questsCard(c), reasons: () => reasonsCard(c),
      counters: () => countersCard(c, gs), momentum: () => momentumCard(c, gs), game: () => gameCard(c), explorer: () => explorerCard(c),
      tip: () => tipCard(c), more: () => moreCard(c), backup: () => backupCard(c), harbor: () => harborCard(c),
      objectives: () => objectivesCard(c), questline: () => questlineCard(c),
    };
    const cards = withObjectives(cardsFor({ maintenance, calm: c.calm, discreet }), { maintenance, discreet }).map((k) => safe(make[k], null));
    return h('section', { class: 'page stack td-page', 'data-test': 'today-page' }, head, cards);
  }

  const PURE = ['TEXT', 'localDate', 'greetingFor', 'checkinsDone', 'checkinKind', 'checkinWindows', 'planToday', 'wantToday', 'activeQuests',
    'reasonOfDay', 'countersData', 'backupDue', 'milestoneDue', 'cardsFor', 'withObjectives', 'runLine'];
  return {
    TEXT, localDate, greetingFor, checkinsDone, checkinKind, checkinWindows, planToday, wantToday, activeQuests, reasonOfDay, countersData,
    backupDue, milestoneDue, cardsFor, withObjectives, runLine, page, PURE,
    _resetTip() { tipState.day = ''; tipState.tip = null; tipState.marked = ''; tipState.dismissed = ''; },
  };
})();

// The page registers from this file (contracts/core.md: UI.pages[firstSegment]); ui-core.js is not changed.
if (typeof UI !== 'undefined' && UI && UI.pages) UI.pages.today = (ctx) => TodayUI.page(ctx);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
  for (const k of TodayUI.PURE) module.exports[k] = TodayUI[k];
}
