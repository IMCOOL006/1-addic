/* 1-addic · ui-status.js · "Your Harbor", the status page at #/status (PLAN-V3.md section 3, V-01a; lane today-track).
   The Harbor scene full width with tappable places, where the person stands (rank, XP, badges, total days) and one
   next small step. It only reads: Engine.gameState and the Explorer, quest and roadmap readers. Nothing here writes
   to the Store or the Engine, nothing shown ever decreases, and the opt-in current run never appears. A slip changes
   no level. Calm mode: no scene, XP or badges; the places as a plain list. Discreet mode: no scene, no days.
   The chrome's SOS button stays; the page adds its own SOS link. Text goes in as text, never as HTML. */
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
  };
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

    const byId = new Map(m.regions.map((r) => [r.id, r]));
    const Hb = ns('HarborUI');
    const sc = !mode.calm && !mode.discreet && Hb && typeof Hb.scene === 'function' ? safe(() => Hb.scene(Object.assign({}, c, { calm: mode.calm })), null) : null;
    const scene = sc ? h('div', { class: 'st-scene', 'data-test': 'status-scene', 'data-tour': 'status-scene',
      onClick: (e) => {
        const t = e && e.target && typeof e.target.closest === 'function' ? e.target.closest('[data-place]') : null;
        const r = t ? byId.get(t.getAttribute('data-place')) : null;
        if (r) openPlace(r, null);
      } }, sc) : null;
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

    return h('section', { class: 'page stack st-page', 'data-test': 'status-page' },
      head, scene, h('p', { class: 'muted', text: TEXT.lead }), places, stand, next);
  }

  const PURE = ['TEXT', 'model', 'diff', 'nextStep', 'placeLines'];
  return { TEXT, model, diff, nextStep, placeLines, page, PURE, EXPLORER_HREF };
})();

// The page registers from this file (ui-core.js's pageKey accepts any key in UI.pages); ui-core.js is not changed.
if (typeof UI !== 'undefined' && UI && UI.pages) UI.pages.status = (ctx) => StatusUI.page(ctx);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
  for (const k of StatusUI.PURE) module.exports[k] = StatusUI[k];
}
