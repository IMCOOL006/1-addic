/* 1-addic offline: the game surfaces (BUILD-PLAN 3.11, U-26; tracks/SCREENS/contracts/game-tutorials.md "GameUI").
   XP, mastery per skill, badges, ranks and the light of the six Harbor regions, all drawn from Engine.gameState and
   its derivations. This file never recomputes a number: every figure comes from the append-only event log through
   the Engine, so none of them ever goes down. A slip changes nothing here (only the opt-in current run restarts, and
   that run is not shown here). No run that resets, no random rewards, no points for claimed sober days.
   Calm mode hides the game layer (panel() returns null). celebrate() is short (under 300 ms) and is skipped in Calm
   mode, under reduced motion and on SOS. It never covers the SOS button and never takes focus. */
const GameUI = (function () {
  'use strict';

  /* Classic-script globals, read when called (another part may load later). */
  function ns(name) {
    switch (name) {
      case 'Content': return typeof Content !== 'undefined' ? Content : null;
      case 'Engine': return typeof Engine !== 'undefined' ? Engine : null;
      case 'Store': return typeof Store !== 'undefined' ? Store : null;
      case 'UI': return typeof UI !== 'undefined' ? UI : null;
      default: return null;
    }
  }
  const arr = (x) => (Array.isArray(x) ? x : []);
  const own = (o, k) => !!o && Object.prototype.hasOwnProperty.call(o, k);
  const str = (s) => (typeof s === 'string' ? s : '');
  const num = (n) => (typeof n === 'number' && isFinite(n) && n > 0 ? n : 0);
  function safe(fn, dflt) { try { const v = fn(); return v === undefined ? dflt : v; } catch (e) { return dflt; } }
  const content = () => ns('Content') || {};
  const hasDOM = () => typeof document !== 'undefined' && !!document && typeof document.createElement === 'function';
  const root = () => (hasDOM() && document.documentElement && typeof document.documentElement.getAttribute === 'function' ? document.documentElement : null);
  const discreet = () => { const r = root(); return !!r && r.getAttribute('data-discreet') !== null; };
  const sosWord = () => (discreet() ? 'Help' : 'SOS');
  const curHash = () => (typeof location !== 'undefined' && location ? String(location.hash || '') : '');
  const onSos = () => { const h = curHash(); return h === '#/sos' || h.startsWith('#/sos?') || h.startsWith('#/sos/'); };

  const MAX_LEVEL = () => arr(content().masteryThresholds).length || 5;
  /* XP markers: a fixed ladder of round numbers the XP bar fills toward. Code constants, never random. */
  const XP_MARKS = [50, 100, 250, 500, 1000, 1500, 2500, 4000, 6000, 8000, 10000, 15000, 20000, 30000, 50000];

  /* How each badge is earned, in plain words (original; Content.badges[].gist is shown once it is earned). */
  const HOW = {
    'smart-not-strong': () => 'Finish the "Clear the space" quest.',
    'first-wave': () => 'Get through one urge with ' + sosWord() + '.',
    'wave-rider-10': () => 'Get through ten urges with ' + sosWord() + '.',
    'wave-rider-50': () => 'Get through fifty urges with ' + sosWord() + '.',
    'self-expert': () => 'Build your Trigger Profile and your Red Flags list.',
    objection: () => 'Put ten thoughts on trial.',
    'net-weaver': () => 'Add three Safety Nets to your crew.',
    'said-it': () => 'Use an assertive script in real life.',
    'mood-lies': () => 'Enjoy an activity more than you predicted.',
    'calm-core': () => 'Finish the SOBER training quest.',
    planner: () => 'Do four Weekly Reviews.',
    comeback: () => 'Look back at a slip and learn from it.',
    graduate: () => 'Build My Recovery Plan.',
  };

  const TEXT = {
    panelTitle: 'Your progress',
    xp: 'XP', xpToday: (n) => `+${n} today`, xpNext: (n) => `Next marker at ${n} XP`, xpTop: 'Past every marker. Keep going your way.',
    xpGist: 'XP comes from practice and honest logs. It never goes down.',
    skills: 'Skills', skillsNone: 'Use a skill and it shows up here.', skillsAll: 'All skills',
    level: (l, m) => `Level ${l} of ${m}`, uses: (n) => `${n} ${n === 1 ? 'use' : 'uses'}`,
    nextLevel: (n) => `next level at ${n}`, maxLevel: 'top level',
    regions: 'Harbor lights', regionAria: (name, l, m) => `${name}: light ${l} of ${m}`,
    badges: 'Badges', badgesCount: (e, n) => `Badges: ${e} of ${n}`,
    earned: 'Earned', notYet: 'Not yet', howTo: 'How to earn: ', earnedOn: (d) => `Earned ${d}`,
    rank: 'Rank', rankNone: 'No rank yet', rankFirst: 'Your first rank comes from exploring the app.',
    rankNext: (name, how) => `Next: ${name}. ${how}`, rankTop: 'You hold the top rank.',
    rankHowExplorer: 'Try the first steps in the Explorer list.',
    rankHowModule: (m) => `Finish ${m}.`,
    celebrate: { badge: 'New badge', rank: 'New rank', mastery: 'New skill level', region: 'A light grows brighter', xp: 'Nice work' },
  };

  /* ── the model: a pure reading of Engine.gameState ──────────────────────────────────────── */

  /* Module names as Learn shows them (ui-learn.js STOPS), for modules not in this version's Content yet. */
  const MODULE_NAMES = { m0: 'Start Here', m1: 'Understand Addiction', m2: 'Your Brain Can Heal', m3: 'Find Your Why',
    m4: 'Set Yourself Up', m5: 'Become a Self-Expert', m6: 'Outsmart the Addicted Brain', m7: 'Be Present',
    m8: 'Rediscover Joy', m9: 'Handle Hard Feelings', m10: 'Your Recovery Plan' };
  function moduleName(id) {
    const m = arr(content().modules).find((x) => x && x.id === id);
    const name = (m && (str(m.name) || str(m.title))) || (own(MODULE_NAMES, id) ? MODULE_NAMES[id] : '');
    return name ? 'the module ' + name : 'its module';
  }
  function dateText(at) {
    const s = str(at);
    return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : '';
  }
  /* model(gameState) -> the figures every surface draws. Pure: same state, same model; it only reads. */
  function model(gs) {
    const g = gs && typeof gs === 'object' ? gs : {};
    const C = content();
    const th = arr(C.masteryThresholds);
    const max = MAX_LEVEL();
    const xpTotal = num(g.xp && g.xp.total);
    const next = XP_MARKS.find((m) => m > xpTotal) || null;
    const ms = g.mastery && typeof g.mastery === 'object' ? g.mastery : {};
    const skills = arr(C.skills).filter((s) => s && typeof s.id === 'string').map((s) => {
      const m = own(ms, s.id) ? ms[s.id] : null;
      const uses = num(m && m.uses);
      const level = Math.min(max, num(m && m.level));
      const nx = th.find((t) => t > uses);
      return { id: s.id, name: str(s.name) || s.id, region: str(s.region), uses, level, max, next: nx === undefined ? null : nx };
    });
    const rg = g.regions && typeof g.regions === 'object' ? g.regions : {};
    const regions = Object.keys(C.regions || {}).map((id) => {
      const r = C.regions[id] || {};
      return { id, name: str(r.name) || id, title: str(r.title), level: Math.min(max, num(rg[id])), max };
    });
    const earned = new Map();
    for (const b of arr(g.badges)) if (b && typeof b.id === 'string' && !earned.has(b.id)) earned.set(b.id, b.earnedAt == null ? null : b.earnedAt);
    const badges = arr(C.badges).filter((b) => b && typeof b.id === 'string').map((b) => ({
      id: b.id, name: str(b.name) || b.id, gist: str(b.gist), how: own(HOW, b.id) ? HOW[b.id]() : str(b.gist),
      earned: earned.has(b.id), earnedAt: earned.has(b.id) ? earned.get(b.id) : null,
    }));
    const ranks = arr(C.ranks).filter((r) => r && typeof r.id === 'string');
    const cur = g.rank && typeof g.rank.id === 'string' ? (ranks.find((r) => r.id === g.rank.id) || g.rank) : null;
    const at = cur ? ranks.findIndex((r) => r.id === cur.id) : -1;
    const up = at + 1 < ranks.length ? ranks[at + 1] : null;
    const rank = {
      current: cur ? { id: cur.id, name: str(cur.name) || cur.id, gist: str(cur.gist) } : null,
      next: up ? { id: up.id, name: str(up.name) || up.id, how: up.when === 'explorer' ? TEXT.rankHowExplorer : TEXT.rankHowModule(moduleName(up.when)) } : null,
    };
    const ct = g.counters && typeof g.counters === 'object' ? g.counters : {};
    return {
      xp: { total: xpTotal, today: num(g.xp && g.xp.today), next },
      skills, regions, badges, rank,
      earnedCount: badges.filter((b) => b.earned).length,
      // total days only (it never falls); the opt-in current run is Today's to show, not this layer's
      days: { tracking: ct.tracking === true, total: num(ct.total) },
    };
  }

  /* gameState for a ctx ({view, E, now}) or null, computed once per ctx object. */
  const memo = typeof WeakMap === 'function' ? new WeakMap() : null;
  function stateOf(ctx) {
    const c = ctx && typeof ctx === 'object' ? ctx : {};
    if (memo && memo.has(c)) return memo.get(c);
    const E = (c.E && typeof c.E.gameState === 'function') ? c.E : ns('Engine');
    const S = ns('Store');
    const view = c.view || (S && S.view) || null;
    const gs = E && typeof E.gameState === 'function' && view ? safe(() => E.gameState(view, c.now || new Date()), null) : null;
    const m = gs ? model(gs) : null;
    if (memo) memo.set(c, m);
    return m;
  }

  /* ── DOM helpers (a small h(): text as text, handlers as functions only) ────────────────── */

  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    const a = attrs || {};
    for (const k of Object.keys(a)) {
      const v = a[k];
      if (v == null || v === false) continue;
      if (k === 'text') n.textContent = String(v);
      else if (/^on[A-Z]/.test(k) && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
      else if (/^on/i.test(k)) continue;
      else n.setAttribute(k === 'className' ? 'class' : k, v === true ? '' : String(v));
    }
    for (const c of kids.flat()) {
      if (c == null || c === false || c === true) continue;
      n.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
    }
    return n;
  }
  function bar(value, max, label) {
    const m = max > 0 ? max : 1;
    const v = Math.max(0, Math.min(m, value));
    const fill = el('span', { class: 'gm-bar-fill' });
    fill.style.width = (100 * v / m).toFixed(1) + '%';
    return el('div', { class: 'gm-bar', role: 'progressbar', 'aria-label': label, 'aria-valuemin': '0', 'aria-valuemax': String(m), 'aria-valuenow': String(v) }, fill);
  }
  function pips(level, max) {
    const out = [];
    for (let i = 1; i <= max; i += 1) out.push(el('span', { class: 'gm-pip' + (i <= level ? ' on' : ''), 'aria-hidden': 'true' }));
    return el('span', { class: 'gm-pips', 'aria-hidden': 'true' }, out);
  }
  const mOf = (ctx) => (ctx && ctx.model && typeof ctx.model === 'object' && Array.isArray(ctx.model.badges) ? ctx.model : stateOf(ctx));

  /* ── the surfaces ───────────────────────────────────────────────────────────────────────── */

  function xpBar(ctx) {
    const m = mOf(ctx);
    if (!m || !hasDOM()) return null;
    const x = m.xp;
    return el('div', { class: 'gm-xp', 'data-test': 'game-xp' },
      el('p', { class: 'gm-xp-head' },
        el('strong', { class: 'gm-xp-total', 'data-test': 'xp-total', text: String(x.total) }), ' ' + TEXT.xp,
        x.today > 0 ? el('span', { class: 'gm-xp-today muted', text: ' ' + TEXT.xpToday(x.today) }) : null),
      x.next ? bar(x.total, x.next, TEXT.xpNext(x.next)) : null,
      el('p', { class: 'gm-note muted', text: x.next ? TEXT.xpNext(x.next) + '. ' + TEXT.xpGist : TEXT.xpTop }));
  }

  function skillRow(s) {
    return el('li', { class: 'gm-skill', 'data-test': 'skill-mastery', 'data-skill': s.id, 'data-level': String(s.level) },
      el('span', { class: 'gm-skill-name', text: s.name }),
      pips(s.level, s.max),
      el('span', { class: 'gm-skill-sub muted', text: TEXT.level(s.level, s.max) + ', ' + TEXT.uses(s.uses) + ', ' + (s.next ? TEXT.nextLevel(s.next) : TEXT.maxLevel) }));
  }
  /* The skills in use, highest level first (ties in Content order); the rest wait in "All skills". */
  function skillMastery(ctx, opts) {
    const m = mOf(ctx);
    if (!m || !hasDOM()) return null;
    const o = opts || {};
    const used = m.skills.map((s, i) => [s, i]).filter(([s]) => s.uses > 0)
      .sort((a, b) => (b[0].level - a[0].level) || (b[0].uses - a[0].uses) || (a[1] - b[1])).map(([s]) => s);
    const top = typeof o.top === 'number' ? used.slice(0, o.top) : used;
    const wrap = el('div', { class: 'gm-skills', 'data-test': 'game-skills' }, el('h3', { class: 'gm-h', text: TEXT.skills }));
    if (!used.length) wrap.appendChild(el('p', { class: 'muted', text: TEXT.skillsNone }));
    else wrap.appendChild(el('ul', { class: 'gm-list' }, top.map(skillRow)));
    if (o.all !== false) {
      wrap.appendChild(el('details', { class: 'gm-more' },
        el('summary', { text: TEXT.skillsAll + ' (' + m.skills.length + ')' }),
        el('ul', { class: 'gm-list' }, m.skills.map(skillRow))));
    }
    return wrap;
  }

  /* The shelf: every Content.badges entry; earned ones lit with their date, the others say how to earn them
     (no countdown, no "almost there"). */
  function badgeShelf(ctx) {
    const m = mOf(ctx);
    if (!m || !hasDOM()) return null;
    return el('ul', { class: 'gm-shelf', 'data-test': 'badge-shelf', 'aria-label': TEXT.badgesCount(m.earnedCount, m.badges.length) },
      m.badges.map((b) => el('li', { class: 'gm-badge' + (b.earned ? ' earned' : ''), 'data-test': 'badge', 'data-badge': b.id, 'data-earned': b.earned ? 'true' : 'false' },
        el('span', { class: 'gm-badge-mark', 'aria-hidden': 'true', text: b.earned ? '★' : '☆' }),
        el('span', { class: 'gm-badge-body' },
          el('strong', { class: 'gm-badge-name', text: b.name }),
          el('span', { class: 'sr-only', text: b.earned ? TEXT.earned : TEXT.notYet }),
          el('span', { class: 'gm-badge-sub muted', text: b.earned ? (b.gist + (dateText(b.earnedAt) ? ' ' + TEXT.earnedOn(dateText(b.earnedAt)) + '.' : '')) : TEXT.howTo + b.how })))));
  }

  function rankCard(ctx) {
    const m = mOf(ctx);
    if (!m || !hasDOM()) return null;
    const r = m.rank;
    return el('div', { class: 'gm-rank', 'data-test': 'rank-card', 'data-rank': r.current ? r.current.id : '' },
      el('p', { class: 'gm-rank-label muted', text: TEXT.rank }),
      el('p', { class: 'gm-rank-name', text: r.current ? r.current.name : TEXT.rankNone }),
      r.current && r.current.gist ? el('p', { class: 'gm-note', text: r.current.gist }) : null,
      el('p', { class: 'gm-note muted', text: r.next ? (r.current ? TEXT.rankNext(r.next.name, r.next.how) : TEXT.rankFirst + ' ' + r.next.how) : TEXT.rankTop }));
  }

  /* regionLight(ctx, regionId) -> 0..5: the light of one Harbor region (ui-harbor draws the scene from it). */
  function regionLight(ctx, regionId) {
    const m = mOf(ctx);
    if (!m) return 0;
    const r = m.regions.find((x) => x.id === regionId);
    return r ? Math.max(0, Math.min(5, r.level)) : 0;
  }
  function regionLights(ctx) {
    const m = mOf(ctx);
    if (!m || !hasDOM()) return null;
    return el('div', { class: 'gm-regions-wrap' },
      el('h3', { class: 'gm-h', text: TEXT.regions }),
      el('ul', { class: 'gm-regions', 'data-test': 'region-lights' }, m.regions.map((r) => el('li', {
        class: 'gm-region', 'data-test': 'region-light', 'data-region': r.id, 'data-level': String(r.level),
        role: 'img', 'aria-label': TEXT.regionAria(r.name, r.level, r.max),
      }, el('span', { class: 'gm-region-name', 'aria-hidden': 'true', text: r.name }), pips(r.level, r.max)))));
  }

  /* ── celebrations ───────────────────────────────────────────────────────────────────────── */

  function quiet() {
    if (!hasDOM()) return true;
    if (onSos()) return true;
    const b = document.body;
    if (b && ((b.classList && typeof b.classList.contains === 'function' && b.classList.contains('calm'))
      || (' ' + str(b.getAttribute && b.getAttribute('class')) + ' ').includes(' calm '))) return true;
    const r = root();
    if (r && (r.getAttribute('data-route') === 'sos' || r.getAttribute('data-motion') === 'reduce')) return true;
    if (typeof window !== 'undefined' && window && typeof window.matchMedia === 'function'
      && safe(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, false) === true) return true;
    return false;
  }
  let celebration = null;
  /* celebrate(kind, text) -> true when shown. A short note at the top of the screen, announced politely; the
     entrance animation lasts 240 ms (styles.css), it takes no focus, blocks no tap and sits under the SOS button. */
  function celebrate(kind, text) {
    if (quiet()) return false;
    const k = own(TEXT.celebrate, kind) ? kind : 'xp';
    if (celebration && celebration.parentNode) celebration.parentNode.removeChild(celebration);
    const n = el('div', { class: 'gm-celebrate', role: 'status', 'aria-live': 'polite', 'data-test': 'celebrate', 'data-kind': k },
      el('strong', { text: TEXT.celebrate[k] }), str(text) ? el('span', { text: ' ' + str(text) }) : null);
    document.body.appendChild(n);
    celebration = n;
    const t = setTimeout(() => { if (n.parentNode) n.parentNode.removeChild(n); if (celebration === n) celebration = null; }, 2400);
    if (t && typeof t.unref === 'function') t.unref();
    return true;
  }

  /* What is new since the last panel this session (memory only): the first panel only remembers, later ones
     celebrate a badge or a rank that has just appeared. Nothing is written. */
  const seen = { ready: false, badges: new Set(), rank: '' };
  function noticeNew(m) {
    const fresh = m.badges.filter((b) => b.earned && !seen.badges.has(b.id));
    const rid = m.rank.current ? m.rank.current.id : '';
    const was = seen.ready;
    for (const b of fresh) seen.badges.add(b.id);
    const rankUp = rid && rid !== seen.rank;
    if (rid) seen.rank = rid;
    seen.ready = true;
    if (!was) return null;
    if (fresh.length) return ['badge', fresh[0].name];
    if (rankUp) return ['rank', m.rank.current.name];
    return null;
  }

  /* panel(ctx) -> Node|null: the game layer for Today or Track to embed (behind typeof GameUI !== 'undefined').
     Null in Calm mode, without the Engine, or without a DOM. */
  function panel(ctx) {
    const c = ctx && typeof ctx === 'object' ? ctx : {};
    if (c.calm === true || (c.settings && c.settings.calm === true) || !hasDOM()) return null;
    const m = stateOf(c);
    if (!m) return null;
    const mc = { model: m };
    const node = el('section', { class: 'card gm-panel', 'data-tour': 'game-panel', 'data-test': 'game-panel', 'aria-label': TEXT.panelTitle },
      el('h2', { class: 'card-title', text: TEXT.panelTitle }),
      rankCard(mc),
      xpBar(mc),
      regionLights(mc),
      skillMastery(mc, { top: 3 }),
      el('details', { class: 'gm-more' },
        el('summary', { text: TEXT.badgesCount(m.earnedCount, m.badges.length) }),
        badgeShelf(mc)));
    const news = noticeNew(m);
    if (news) celebrate(news[0], news[1]);
    return node;
  }

  return {
    model, xpBar, skillMastery, badgeShelf, rankCard, regionLight, regionLights, celebrate, panel,
    // for the Node tests
    stateOf, XP_MARKS, HOW,
    _reset() { seen.ready = false; seen.badges = new Set(); seen.rank = ''; if (celebration && celebration.parentNode) celebration.parentNode.removeChild(celebration); celebration = null; },
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = GameUI;
