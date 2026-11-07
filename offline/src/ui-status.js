/* 1-addic · ui-status.js · "Your Harbor", the status page at #/status (PLAN-V3.md section 3, V-01a; lane today-track).
   The Harbor scene full width with tappable places, where the person stands (rank, XP, badges, total days) and one
   next small step. It only reads: Engine.gameState and the Explorer, quest and roadmap readers. Nothing here writes
   to the Store or the Engine, nothing shown ever decreases, and the opt-in current run never appears. A slip changes
   no level. Calm mode: no scene, XP or badges; the places as a plain list. Discreet mode: no scene, no days.
   The chrome's SOS button stays; the page adds its own SOS link. Text goes in as text, never as HTML.
   V-01b: what just changed since the last draw this session (memory only), a 14-day strip of dated dots (no count),
   and what to watch from Engine.warningSigns (also drawn at #/track/radar by ui-track.js). */
const StatusUI = (() => {
  const MAX = 5;
  const PLACES = ['lighthouse', 'cove', 'garden', 'pier', 'compass', 'weather'];
  const TEXT = {
    title: 'Your Harbor',
    lead: 'Each place grows brighter as you use its skills. Tap a place to see its skills.',
    places: 'The places',
    place: (name, n) => `${name}, level ${n} of ${MAX}`,
    level: (n) => `Level ${n} of ${MAX}`,
    times: (k) => (k === 1 ? 'used 1 time' : `used ${k} times`),
    more: (k, n) => (k === 1 ? `1 more use to reach level ${n}` : `${k} more uses to reach level ${n}`),
    top: 'top level',
    skill: (s, nextPart) => `${s.name}, level ${s.level}, ${TEXT.times(s.uses)}; ${nextPart}`,
    noSkills: 'No skills listed for this place yet.',
    stand: 'Where you stand',
    standCalm: 'Each place above shows its level.',
    badges: (e, t) => `${e} of ${t} badges`,
    days: (n) => `Days in all: ${n}`,
    next: 'Next small step',
    nextNone: 'Nothing left on the list.',
    lesson: (t) => `Lesson: ${t}`,
    focus: (n) => `Keep going with ${n}`,
    back: 'Back to Today',
    sos: 'SOS',
    sosAria: 'SOS: help right now',
    help: 'Help',
    unavailable: 'Not available right now.',
    close: 'Close',
    rise: {
      region: (name, n) => `${name} grew to level ${n}.`,
      xp: (n) => `Your XP rose to ${n}.`,
      badge: (n) => `You have ${n} badges now.`,
      rank: (name) => `New rank: ${name}.`,
      explorer: (n) => `${n} first steps tried.`,
      quest: (n) => `${n} quest steps done.`,
      day: (n) => `Days in all: ${n}.`,
    },
    changeTitle: 'What just changed',
    first: 'Here is where you stand.',
    none: 'Nothing new since you last looked.',
    stripTitle: 'Your last 14 days',
    stripLead: 'A filled dot marks a day you did something for your recovery.',
    stripList: 'The last 14 days, oldest first',
    stripDay: (label, active) => `${label}: ${active ? 'active' : 'no entry'}`,
    watchTitle: 'What to watch',
    watchLead: 'A few patterns in your own logs that may be worth a look. Each one comes with a plan.',
    watchNone: 'Nothing to watch right now.',
    plan: (p) => `Your plan: ${p}`,
  };
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  /* The last draw, in memory for this session only (like GameUI's seen): never stored. `base` is the model the
     person last looked at before this visit; a redraw while the page is still on screen (a Store change re-renders
     the route before the old node is swapped out) keeps this visit's base, so a change shown is not wiped. */
  const memo = { base: null, last: null, root: null, first: false };
  /* Explorer item -> where to try it (BUILD-PLAN 3.5 routes); an item not listed goes to Today. */
  const EXPLORER_HREF = {
    tour: '#/today?tour=1', drill: '#/sos?drill=1', reasons: '#/workbook/reasons', safetyNet: '#/workbook/network',
    log: '#/track/log/craving', checkin: '#/today', lesson: '#/learn', workbook: '#/workbook', plan: '#/actions/planner',
    breathe: '#/practice/breathe', wantTo: '#/actions/planner', pace: '#/learn/plan',
  };

  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  const arr = (x) => (Array.isArray(x) ? x : []);
  const str = (x) => (typeof x === 'string' ? x : '');
  const num = (x) => { const n = Number(x); return isFinite(n) && n > 0 ? n : 0; };
  const own = (o, k) => isObj(o) && Object.prototype.hasOwnProperty.call(o, k);
  const safe = (fn, dflt) => { try { const v = fn(); return v === undefined ? dflt : v; } catch (e) { return dflt; } };
  const ns = (name) => {
    try {
      if (name === 'Content') return typeof Content !== 'undefined' ? Content : null;
      if (name === 'Engine') return typeof Engine !== 'undefined' ? Engine : null;
      if (name === 'UI') return typeof UI !== 'undefined' ? UI : null;
      if (name === 'HarborUI') return typeof HarborUI !== 'undefined' ? HarborUI : null;
      if (name === 'GameUI') return typeof GameUI !== 'undefined' ? GameUI : null;
    } catch (e) { /* a namespace that throws counts as absent */ }
    return null;
  };
  const content = () => ns('Content') || {};
  const lvl = (v) => Math.max(0, Math.min(MAX, Math.floor(num(v))));

  /* ── pure ──────────────────────────────────────────────────────────────────────────────── */

  /* The skills as GameUI.model draws them; without GameUI the same figures from Content and gs.mastery. */
  function skillsOf(gs) {
    const G = ns('GameUI');
    if (G && typeof G.model === 'function') {
      const m = safe(() => G.model(gs), null);
      if (m && Array.isArray(m.skills)) return { skills: m.skills, gm: m };
    }
    const C = content();
    const th = arr(C.masteryThresholds);
    const ms = isObj(gs && gs.mastery) ? gs.mastery : {};
    const skills = arr(C.skills).filter((s) => s && typeof s.id === 'string').map((s) => {
      const m = own(ms, s.id) ? ms[s.id] : null;
      const uses = num(m && m.uses);
      const nx = th.find((t) => t > uses);
      return { id: s.id, name: str(s.name) || s.id, region: str(s.region), uses, level: lvl(m && m.level), max: MAX, next: nx === undefined ? null : nx };
    });
    return { skills, gm: null };
  }

  /* The next small step: the first untried Explorer item, else the next lesson, else the module in focus,
     else the first open step of a quest; null when nothing is left. */
  function nextStep(extra) {
    const x = isObj(extra) ? extra : {};
    const C = content();
    if (x.explorerDone !== true) {
      const it = arr(x.explorer).find((i) => i && typeof i.id === 'string' && i.done !== true);
      if (it) return { kind: 'explorer', id: it.id, label: str(it.label) || it.id, href: own(EXPLORER_HREF, it.id) ? EXPLORER_HREF[it.id] : '#/today' };
    }
    const l = x.nextLesson;
    if (isObj(l) && typeof l.id === 'string' && l.id) return { kind: 'lesson', id: l.id, label: TEXT.lesson(str(l.title) || l.id), href: '#/lesson/' + l.id };
    const f = x.focus;
    if (isObj(f) && typeof f.moduleId === 'string' && f.moduleId && num(f.lessonsLeft) > 0) {
      const mod = arr(C.modules).find((m) => m && m.id === f.moduleId);
      return { kind: 'focus', id: f.moduleId, label: TEXT.focus(str(mod && (mod.title || mod.name)) || f.moduleId), href: '#/learn/' + f.moduleId };
    }
    const qs = isObj(x.quests) ? x.quests : {};
    const order = arr(C.quests).map((q) => q && q.id).filter((id) => own(qs, id));
    for (const id of Object.keys(qs)) if (!order.includes(id)) order.push(id);
    for (const id of order) {
      const q = qs[id];
      if (!isObj(q) || q.complete === true) continue;
      const step = arr(q.steps).find((s) => s && s.done !== true);
      if (step) return { kind: 'quest', id, label: str(step.label) || id, href: '#/actions/quests' };
    }
    return null;
  }

  /* model(gameState, extra) -> what the page draws. Plain objects in, plain object out; it only reads.
     There is no current-run field: the page shows only what never falls. */
  function model(gs, extra) {
    const g = isObj(gs) ? gs : {};
    const x = isObj(extra) ? extra : {};
    const C = content();
    const { skills, gm } = skillsOf(g);
    const rg = isObj(g.regions) ? g.regions : {};
    const ids = Object.keys(isObj(C.regions) ? C.regions : {});
    const regions = (ids.length ? ids : PLACES).map((id) => {
      const r = isObj(C.regions) && isObj(C.regions[id]) ? C.regions[id] : {};
      const mine = skills.filter((s) => s.region === id).map((s) => ({ id: s.id, name: s.name, level: lvl(s.level), uses: num(s.uses), next: s.next == null ? null : s.next }));
      return { id, name: str(r.name) || id, title: str(r.title), level: lvl(rg[id]), max: MAX, uses: mine.reduce((t, s) => t + s.uses, 0), skills: mine };
    });
    const xp = { total: num(g.xp && g.xp.total), today: num(g.xp && g.xp.today) };
    const ranks = arr(C.ranks);
    const rid = isObj(g.rank) && typeof g.rank.id === 'string' ? g.rank.id : '';
    const rk = rid ? (ranks.find((r) => r && r.id === rid) || g.rank) : null;
    const earned = new Set(arr(g.badges).filter((b) => b && typeof b.id === 'string').map((b) => b.id));
    const badgeTotal = gm ? gm.badges.length : arr(C.badges).length;
    const ct = isObj(g.counters) ? g.counters : {};
    const ex = arr(x.explorer).filter((i) => i && i.done === true).length;
    const qd = Object.keys(isObj(x.quests) ? x.quests : {}).reduce((t, k) => t + num(x.quests[k] && x.quests[k].done), 0);
    return {
      regions,
      xp,
      rank: rk ? { id: rid, name: str(rk.name) || rid } : null,
      badges: { earned: gm ? gm.earnedCount : earned.size, total: badgeTotal },
      // a person who set no start date has no day count to show (tracking false), so no 'Days in all: 0'
      days: { show: x.counters !== false && x.discreet !== true && ct.tracking !== false, total: num(ct.total) },
      next: nextStep(x),
      ticks: { explorer: ex, quests: qd },
    };
  }

  /* diff(before, after) -> the rises between two models, and only the rises. Equal or lower: nothing. */
  function diff(before, after) {
    const items = [];
    if (!isObj(before) || !isObj(after)) return { items };
    const R = TEXT.rise;
    const was = new Map(arr(before.regions).map((r) => [r && r.id, r]));
    for (const r of arr(after.regions)) {
      const b = was.get(r && r.id);
      const from = lvl(b && b.level); const to = lvl(r && r.level);
      if (b && to > from) items.push({ kind: 'region', id: r.id, text: R.region(str(r.name) || r.id, to), from, to });
    }
    const n = (o, a, k) => num(o && o[a] && o[a][k]);
    const up = (kind, id, from, to, text) => { if (to > from) items.push({ kind, id, text, from, to }); };
    up('xp', 'xp', n(before, 'xp', 'total'), n(after, 'xp', 'total'), R.xp(n(after, 'xp', 'total')));
    up('badge', 'badges', n(before, 'badges', 'earned'), n(after, 'badges', 'earned'), R.badge(n(after, 'badges', 'earned')));
    const ranks = arr(content().ranks).map((r) => r && r.id);
    const rb = isObj(before.rank) ? before.rank.id : null;
    const ra = isObj(after.rank) ? after.rank.id : null;
    if (ra && ra !== rb && ranks.indexOf(ra) > ranks.indexOf(rb)) items.push({ kind: 'rank', id: ra, text: R.rank(str(after.rank.name) || ra), from: rb, to: ra });
    up('explorer', 'explorer', n(before, 'ticks', 'explorer'), n(after, 'ticks', 'explorer'), R.explorer(n(after, 'ticks', 'explorer')));
    up('quest', 'quests', n(before, 'ticks', 'quests'), n(after, 'ticks', 'quests'), R.quest(n(after, 'ticks', 'quests')));
    if (after.days && after.days.show === true && before.days && before.days.show === true) {
      up('day', 'days', n(before, 'days', 'total'), n(after, 'days', 'total'), R.day(n(after, 'days', 'total')));
    }
    return { items };
  }

  /* The lines of a place's sheet: its title word, its level, then each skill with its level, uses and next count. */
  function placeLines(region) {
    const r = isObj(region) ? region : {};
    const lines = [];
    if (str(r.title)) lines.push(r.title);
    lines.push(TEXT.level(lvl(r.level)));
    const sk = arr(r.skills);
    if (!sk.length) lines.push(TEXT.noSkills);
    for (const s of sk) lines.push(TEXT.skill(s, s.next == null ? TEXT.top : TEXT.more(Math.max(1, s.next - s.uses), Math.min(MAX, lvl(s.level) + 1))));
    return lines;
  }

  /* strip(dates, now) -> the 14 local days ending today, oldest first: {date, active, label}. A history, no count. */
  function strip(dates, now) {
    const on = new Set(arr(dates).filter((d) => typeof d === 'string'));
    const t = now instanceof Date ? now : new Date(now);
    const base = isFinite(t.getTime()) ? t : new Date(0);
    const pad = (n) => String(n).padStart(2, '0');
    const out = [];
    for (let k = 13; k >= 0; k--) {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() - k, 12);
      const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      out.push({ date, active: on.has(date), label: `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}` });
    }
    return out;
  }

  /* ── the page ──────────────────────────────────────────────────────────────────────────── */

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
  const rootAttr = (k) => safe(() => document.documentElement.getAttribute(k), null);
  function modesOf(c) {
    const s = isObj(c.settings) ? c.settings : {};
    const discreet = s.discreet === true || rootAttr('data-discreet') !== null;
    const counters = !discreet && s.counters !== false && rootAttr('data-counters') !== 'off';
    return { discreet, counters, calm: c.calm === true || s.calm === true };
  }
  function extraOf(c, gs, mode) {
    const E = c.E;
    const call = (name, ...a) => (E && typeof E[name] === 'function' ? safe(() => E[name](...a), null) : null);
    const rm = call('roadmap', c.profile, new Set(arr(gs.modulesDone)), c.now, new Set(arr(gs.lessonsDone)));
    return {
      explorer: arr(call('explorer', c.view)), explorerDone: call('explorerDone', c.view) === true, quests: call('quests', c.view) || {},
      nextLesson: call('nextLesson', c.view), focus: rm && isObj(rm.focus) ? rm.focus : null,
      counters: mode.counters, discreet: mode.discreet, calm: mode.calm, now: c.now,
    };
  }

  function openPlace(region, fallback) {
    const U = ns('UI');
    const lines = placeLines(region);
    const headN = str(region.title) ? 2 : 1;
    const body = h('div', { class: 'stack st-sheet' },
      lines.slice(0, headN).map((t, i) => h('p', { class: i === headN - 1 ? 'muted' : 'st-sheet-title', text: t })),
      h('ul', { class: 'st-skills' }, lines.slice(headN).map((t) => h('li', { class: 'st-skill', text: t }))));
    const res = U && typeof U.sheet === 'function' ? safe(() => U.sheet(region.name, body), null) : null;
    if (res && res.el) return;
    if (fallback) { // no dialog to open: the same lines open in place, so the button is never dead
      if (fallback.hidden) { fallback.textContent = ''; fallback.appendChild(body); fallback.hidden = false; fallback.removeAttribute('hidden'); } else { fallback.hidden = true; fallback.setAttribute('hidden', ''); }
    }
  }

  /* Every node under n (the real DOM and the tests' fake one both have children). */
  function walk(n, fn) {
    if (!n) return;
    fn(n);
    for (const k of Array.from(n.children || [])) walk(k, fn);
  }
  /* The rises since the last draw; the first draw says where the person stands. Calm shows no XP, badge or rank. */
  function changeCard(d, calm) {
    const items = d ? d.items.filter((i) => !(calm && (i.kind === 'xp' || i.kind === 'badge' || i.kind === 'rank'))) : [];
    return h('section', { class: 'card stack st-change', 'data-test': 'status-change', 'data-tour': 'status-change', 'aria-label': TEXT.changeTitle },
      h('h2', { class: 'card-title', text: TEXT.changeTitle }),
      !d ? h('p', { class: 'muted', text: TEXT.first })
        : items.length ? h('ul', { class: 'st-change-list' }, items.map((i) => h('li', { 'data-test': 'status-change-item', 'data-kind': i.kind, text: i.text })))
          : h('p', { class: 'muted', text: TEXT.none }));
  }
  function stripCard(gs, now) {
    const days = strip(isObj(gs.momentum) ? gs.momentum.dates : [], now);
    return h('section', { class: 'card stack st-strip-card', 'data-test': 'status-strip', 'aria-label': TEXT.stripTitle },
      h('h2', { class: 'card-title', text: TEXT.stripTitle }),
      h('p', { class: 'muted', text: TEXT.stripLead }),
      h('ol', { class: 'st-strip', 'aria-label': TEXT.stripList }, days.map((d) => h('li', {
        class: d.active ? 'st-day st-on' : 'st-day', 'data-test': 'status-strip-day', 'data-date': d.date, 'data-active': d.active ? 'true' : 'false' },
      h('span', { class: 'st-dot', 'aria-hidden': 'true' }), h('span', { class: 'sr-only', text: TEXT.stripDay(d.label, d.active) })))));
  }
  /* What to watch: the Engine's warning signs, each with its plan (the person's own plan already wins there).
     Gentle: no score, no red. Also drawn by ui-track.js at #/track/radar. */
  function watchCard(ctxIn) {
    const x = ctxIn || {};
    const E = x.E !== undefined ? x.E : ns('Engine');
    const signs = E && typeof E.warningSigns === 'function' ? arr(safe(() => E.warningSigns(x.view, x.now || new Date()), [])) : [];
    const list = signs.filter((s) => isObj(s) && typeof s.signId === 'string');
    return h('section', { class: 'card stack st-watch', 'data-test': 'status-watch', 'data-tour': 'status-watch', 'aria-label': TEXT.watchTitle },
      h('h2', { class: 'card-title', text: TEXT.watchTitle }),
      list.length ? [h('p', { class: 'muted', text: TEXT.watchLead }),
        h('ul', { class: 'st-watch-list' }, list.map((s) => h('li', { class: 'st-sign', 'data-test': 'status-watch-item', 'data-sign': s.signId, 'data-own': s.own === true ? 'true' : 'false' },
          h('p', { class: 'st-sign-label', text: str(s.label) || s.signId }),
          str(s.evidence) ? h('p', { class: 'muted', text: s.evidence }) : null,
          str(s.plan) ? h('p', { class: 'st-plan', text: TEXT.plan(s.plan) }) : null)))]
        : h('p', { class: 'muted', text: TEXT.watchNone }));
  }

  function page(ctxIn) {
    const x = ctxIn || {};
    const c = {
      view: x.view || { get: () => null, list: () => [], count: () => 0 }, E: x.E !== undefined ? x.E : ns('Engine'),
      profile: isObj(x.profile) ? x.profile : {}, settings: isObj(x.settings) ? x.settings : {}, now: x.now || new Date(),
      calm: !!x.calm, route: x.route || { path: '/status', parts: ['status'], query: {} },
    };
    const mode = modesOf(c);
    const gs = c.E && typeof c.E.gameState === 'function' ? safe(() => c.E.gameState(c.view, c.now), null) : null;
    const m = gs ? safe(() => model(gs, extraOf(c, gs, mode)), null) : null;
    const nav = h('div', { class: 'row st-nav' },
      h('a', { href: '#/today', class: 'btn', 'data-test': 'status-back', text: TEXT.back }),
      h('a', { href: '#/sos', class: 'btn', 'data-test': 'status-sos', text: mode.discreet ? TEXT.help : TEXT.sos, 'aria-label': mode.discreet ? TEXT.help : TEXT.sosAria }));
    const head = h('header', { class: 'stack st-head' }, h('h1', { text: TEXT.title }), nav);
    if (!m) return h('section', { class: 'page stack st-page', 'data-test': 'status-page' }, head, h('p', { class: 'muted', text: TEXT.unavailable }));
    // memory only: no Store write, no event
    const sameVisit = !!(memo.root && memo.root.isConnected === true);
    if (!sameVisit) { memo.first = memo.last === null; memo.base = memo.last || m; }
    const total = diff(memo.base, m);
    const changed = memo.first && !total.items.length ? null : total; // null: the first look, "Here is where you stand."
    const fresh = memo.last ? diff(memo.last, m) : { items: [] }; // new since the previous draw: only these pulse
    memo.last = m;

    const byId = new Map(m.regions.map((r) => [r.id, r]));
    const Hb = ns('HarborUI');
    const sc = !mode.calm && !mode.discreet && Hb && typeof Hb.scene === 'function' ? safe(() => Hb.scene(Object.assign({}, c, { calm: mode.calm })), null) : null;
    const scene = sc ? h('div', { class: 'st-scene', 'data-test': 'status-scene', 'data-tour': 'status-scene',
      onClick: (e) => {
        const t = e && e.target && typeof e.target.closest === 'function' ? e.target.closest('[data-place]') : null;
        const r = t ? byId.get(t.getAttribute('data-place')) : null;
        if (r) openPlace(r, null);
      } }, sc) : null;
    // the place that grew pulses once; none when still (reduced motion, data-motion=reduce, an SOS route): the words carry it
    const grew = new Set(fresh.items.filter((i) => i.kind === 'region').map((i) => i.id));
    if (sc && grew.size && !(typeof Hb.still === 'function' && safe(() => Hb.still(c), true) !== false)) {
      walk(sc, (n) => {
        const id = n && typeof n.getAttribute === 'function' ? n.getAttribute('data-place') : null;
        if (id && grew.has(id)) n.setAttribute('class', `${n.getAttribute('class') || ''} hb-grew`.trim());
      });
    }
    const places = h('ul', { class: 'st-places', 'aria-label': TEXT.places }, m.regions.map((r) => {
      const more = h('div', { class: 'st-more', hidden: true });
      const btn = h('button', { type: 'button', class: 'btn st-place', 'data-test': 'status-place', 'data-region': r.id, 'data-level': String(r.level),
        text: TEXT.place(r.name, r.level), onClick: () => openPlace(r, more) });
      return h('li', null, btn, more);
    }));

    const G = ns('GameUI');
    const gm = G && typeof G.model === 'function' ? safe(() => G.model(gs), null) : null;
    const gctx = gm ? { model: gm, view: c.view, E: c.E, now: c.now } : null;
    const stand = h('section', { class: 'card stack st-stand', 'data-test': 'status-stand', 'aria-label': TEXT.stand },
      h('h2', { class: 'card-title', text: TEXT.stand }),
      !mode.calm && gctx && typeof G.rankCard === 'function' ? safe(() => G.rankCard(gctx), null) : null,
      !mode.calm && gctx && typeof G.xpBar === 'function' ? safe(() => G.xpBar(gctx), null) : null,
      !mode.calm ? h('p', { class: 'st-badges', text: TEXT.badges(m.badges.earned, m.badges.total) }) : null,
      m.days.show ? h('p', { class: 'st-days', 'data-test': 'status-days', text: TEXT.days(m.days.total) }) : null,
      mode.calm && !m.days.show ? h('p', { class: 'muted', text: TEXT.standCalm }) : null);
    const next = h('section', { class: 'card stack st-next', 'data-test': 'status-next', 'aria-label': TEXT.next },
      h('h2', { class: 'card-title', text: TEXT.next }),
      m.next ? h('a', { href: m.next.href, class: 'btn primary', 'data-test': 'status-next-go', 'data-kind': m.next.kind, text: m.next.label })
        : h('p', { class: 'muted', text: TEXT.nextNone }));

    const root = h('section', { class: 'page stack st-page', 'data-test': 'status-page' },
      head, changeCard(changed, mode.calm), scene, h('p', { class: 'muted', text: TEXT.lead }), places, stand, next,
      stripCard(gs, c.now), watchCard(c));
    memo.root = root;
    return root;
  }

  const PURE = ['TEXT', 'model', 'diff', 'nextStep', 'placeLines', 'strip'];
  return {
    TEXT, model, diff, nextStep, placeLines, strip, page, watchCard, PURE, EXPLORER_HREF,
    _reset() { memo.base = null; memo.last = null; memo.root = null; memo.first = false; }, // tests only: forget the last draw
  };
})();

// The page registers from this file (ui-core.js's pageKey accepts any key in UI.pages); ui-core.js is not changed.
if (typeof UI !== 'undefined' && UI && UI.pages) UI.pages.status = (ctx) => StatusUI.page(ctx);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
  for (const k of StatusUI.PURE) module.exports[k] = StatusUI[k];
}
