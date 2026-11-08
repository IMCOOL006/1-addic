/* 1-addic offline: the guidance layer (BUILD-PLAN 3.11, U-27; tracks/SCREENS/contracts/game-tutorials.md).
   Coach marks, the first-run tour, just-in-time tutorials, Training drills, the tip card, the Explorer ring and the
   reveal list ("More tools", "Show now", "New" dots). Everything reads Content, Engine, Store and Actions when they
   exist and writes only through Actions. The overlay lives in #coach (shell.html) and never covers, gates or delays
   SOS: the SOS button sits above it (z-index), the overlay carries its own SOS link, a route to #/sos* closes it at
   once and marks nothing, and Escape or one tap outside the popover closes it. */
const GuidanceUI = (function () {
  'use strict';

  /* Classic-script globals, read when called (another part may load later). */
  function ns(name) {
    switch (name) {
      case 'Content': return typeof Content !== 'undefined' ? Content : null;
      case 'Engine': return typeof Engine !== 'undefined' ? Engine : null;
      case 'Store': return typeof Store !== 'undefined' ? Store : null;
      case 'Actions': return typeof Actions !== 'undefined' ? Actions : null;
      case 'UI': return typeof UI !== 'undefined' ? UI : null;
      default: return null;
    }
  }
  const arr = (x) => (Array.isArray(x) ? x : []);
  const own = (o, k) => !!o && Object.prototype.hasOwnProperty.call(o, k);
  const str = (s) => (typeof s === 'string' ? s : '');
  function safe(fn, dflt) { try { const v = fn(); return v === undefined ? dflt : v; } catch (e) { return dflt; } }
  function run(fn) { try { return Promise.resolve(fn()).catch(() => null); } catch (e) { return Promise.resolve(null); } }
  const content = () => ns('Content') || {};
  const hasDOM = () => typeof document !== 'undefined' && !!document && typeof document.createElement === 'function';
  const isSlug = (s) => typeof s === 'string' && /^[A-Za-z0-9][A-Za-z0-9-]*$/.test(s);

  const TEXT = {
    step: (i, n) => `Step ${i} of ${n}`,
    next: 'Next',
    done: 'Done',
    skip: 'Skip',
    sos: 'SOS', sosLabel: 'SOS: help right now', help: 'Help',
    jit: (name) => `New here? See how ${name} works, in a few taps.`,
    showMe: 'Show me', later: 'Later',
    tipTitle: 'A tip for today', gotIt: 'Got it', tipGo: 'Show me',
    explorer: 'Explorer',
    explorerTitle: 'Explorer: first steps',
    explorerLead: (d, t) => `${d} of ${t} first steps tried. Try them in any order. There is no deadline.`,
    explorerOpen: 'Open the Explorer list',
    explorerHide: 'Hide the Explorer for now',
    tried: 'Tried', notYet: 'Not yet', go: 'Go',
    moreTitle: 'More tools unlock as you learn',
    moreLead: 'Each tool opens when you finish the module it belongs to. You can open any of them now.',
    opensWith: (m) => `Opens with: ${m}`,
    opensAnyTime: 'Opens as you go',
    showNow: 'Show now',
    shown: (n) => `${n} is open now.`,
    newDot: 'New',
    unlocked: (n) => `You unlocked ${n}`, openIt: 'Open it',
  };

  /* ── Routes ─────────────────────────────────────────────────────────────────────────────── */

  /* '#/a/b?x=1', '/a/b' or 'a/b' -> '/a/b' (no query, no trailing slash). */
  function pathOf(r) {
    if (r && typeof r === 'object' && typeof r.path === 'string') return pathOf(r.path);
    let s = String(r == null ? '' : r).trim().replace(/^#/, '');
    const q = s.indexOf('?');
    if (q >= 0) s = s.slice(0, q);
    s = '/' + s.split('/').filter(Boolean).join('/');
    return s;
  }
  const isSosPath = (p) => p === '/sos' || p.startsWith('/sos/');
  const isQuietPath = (p) => isSosPath(p) || p === '/lock' || p.startsWith('/lock/') || p === '/onboarding' || p.startsWith('/onboarding/');
  const isTodayPath = (p) => p === '/' || p === '/today';

  /* Where each feature lives. Content.features carries only the tab, so the screens are named here; an exact entry
     matches that path only, the others match the path and below it. A Content.features[id].route, when the content
     lane adds one, is used too. The longest match wins. */
  const FEATURE_ROUTES = [
    ['quicklog', '/track', true], ['quicklog', '/track/log'],
    ['insights', '/track/insights'], ['radar', '/track/radar'],
    ['workbook', '/workbook', true], ['recoveryPlan', '/workbook/plan'], ['network', '/workbook/network'],
    ['motivation', '/workbook/motivation'], ['balance', '/workbook/balance'], ['scripts', '/workbook/scripts'],
    ['triggers', '/workbook/triggers'], ['redFlags', '/workbook/red-flags'], ['activities', '/workbook/activities'],
    ['reasons', '/workbook/reasons'],
    ['roadmapPlan', '/learn/plan'], ['glossary', '/learn/glossary'], ['learn', '/learn', true],
    ['planner', '/actions/planner'], ['battlePlans', '/actions/battle'], ['weeklyReview', '/actions/review'],
    ['quests', '/actions/quests'], ['rewards', '/actions/rewards'], ['predictions', '/actions/predictions'],
    ['practices', '/practice'], ['training', '/settings/help'],
    ['today', '/today', true], ['today', '/', true], ['sos', '/sos'],
  ];
  function featureRoutes() {
    const out = FEATURE_ROUTES.slice();
    const feats = content().features;
    if (feats && typeof feats === 'object') {
      for (const id of Object.keys(feats)) {
        const r = feats[id] && feats[id].route;
        if (typeof r === 'string' && r) out.push([id, pathOf(r)]);
      }
    }
    return out;
  }
  /* The feature a route belongs to, or null (pure over Content). */
  function featureOfRoute(path) {
    const p = pathOf(path);
    let best = null; let len = -1;
    for (const [id, at, exact] of featureRoutes()) {
      const hit = exact ? p === at : (p === at || p.startsWith(at === '/' ? '/' : at + '/'));
      if (hit && at.length > len) { best = id; len = at.length; }
    }
    return best;
  }
  /* The screen a feature opens on (the first route named for it). */
  function routeOfFeature(id) {
    const feats = content().features;
    const r = feats && feats[id] && feats[id].route;
    if (typeof r === 'string' && r.startsWith('#/')) return r;
    const hit = FEATURE_ROUTES.find((x) => x[0] === id);
    return hit ? '#' + hit[1] : null;
  }

  /* ── Data helpers ───────────────────────────────────────────────────────────────────────── */

  function viewOf(ctx) {
    if (ctx && ctx.view && typeof ctx.view.list === 'function') return ctx.view;
    const S = ns('Store');
    return S && S.view && typeof S.view.list === 'function' ? S.view : null;
  }
  const listOf = (view, store) => (view ? arr(safe(() => view.list(store), [])) : []);
  const rowOf = (view, store, key) => (view && typeof view.get === 'function' ? safe(() => view.get(store, key), null) : null);
  function locked() {
    const S = ns('Store');
    return !!(S && typeof S.status === 'function' && safe(() => S.status().locked, false));
  }
  function tutorials() { return arr(content().tutorials).filter((t) => t && isSlug(t.id)); }
  function tutorialById(id) { return tutorials().find((t) => t.id === id) || null; }
  function tutorialDone(view, id, allowSkipped) {
    const E = ns('Engine');
    if (E && typeof E.tutorialDone === 'function') return safe(() => E.tutorialDone(view, id, allowSkipped), false) === true;
    const row = listOf(view, 'tutorials').find((r) => r && r.id === id);
    return !!(row && row.completedAt && (allowSkipped || row.skipped !== true));
  }
  /* The features open now: ctx.features (UI.ctx, Engine.unlocked from V-46); else Engine.unlocked joined with
     Engine.revealed (a quest-line step opens a feature early, V-44); else Engine.revealed; else reveal.always. Always
     a superset of what the modules revealed: nothing re-locks. */
  function revealedSet(view, ctx) {
    if (ctx && ctx.features instanceof Set) return ctx.features;
    const E = ns('Engine');
    const s = E && typeof E.revealed === 'function' ? safe(() => E.revealed(view), null) : null;
    const u = E && typeof E.unlocked === 'function' ? safe(() => E.unlocked(view), null) : null;
    if (u instanceof Set) { const out = new Set(u); if (s instanceof Set) for (const f of s) out.add(f); return out; }
    return s instanceof Set ? s : new Set(arr((content().reveal || {}).always));
  }
  const hasEvent = (view, type) => listOf(view, 'events').some((e) => e && e.type === type);

  /* ── The first-run tour: when it may start (pure) ───────────────────────────────────────── */

  /* {profile, onboarded?, tourDone, path, locked, busy} -> true when the tour starts now. Onboarding is done when the
     profile has onboardedAt (or onboarded: true) or an OnboardingCompleted event was logged. Never on #/sos*,
     #/lock or #/onboarding, never while locked or while another overlay or sheet is open; only on Today. */
  function shouldTour(s) {
    const o = s || {};
    const p = o.profile || {};
    const onboarded = o.onboarded === true || !!p.onboardedAt || p.onboarded === true;
    if (!onboarded || o.tourDone === true || o.locked === true || o.busy === true) return false;
    const path = pathOf(o.path);
    return !isQuietPath(path) && isTodayPath(path);
  }

  /* ── JIT tutorials: which one to offer on a route (pure) ────────────────────────────────── */

  /* {path, revealed:Set, isDone(id), asked:{id: day}, today} -> tutorial | null */
  function jitFor(s) {
    const o = s || {};
    const path = pathOf(o.path);
    if (isQuietPath(path)) return null;
    const f = featureOfRoute(path);
    if (!f || !(o.revealed instanceof Set) || !o.revealed.has(f)) return null;
    const asked = o.asked || {};
    for (const t of tutorials()) {
      if (t.kind !== 'jit' || t.feature !== f || !arr(t.steps).length) continue;
      if (typeof o.isDone === 'function' && o.isDone(t.id)) continue;
      if (asked[t.id] && asked[t.id] === o.today) continue;
      return t;
    }
    return null;
  }

  /* ── Reveal: the locked features and the module that opens each (pure) ──────────────────── */

  function moduleName(mid) {
    const m = arr(content().modules).find((x) => x && x.id === mid);
    return m && str(m.name) ? m.name : null;
  }
  /* revealed:Set -> [{id, name, gist, module: {id, name}|null}] for every Content.features entry not yet revealed. */
  function lockedFeatures(revealed) {
    const C = content();
    const feats = C.features && typeof C.features === 'object' ? C.features : {};
    const rv = C.reveal && typeof C.reveal === 'object' ? C.reveal : {};
    const opener = {};
    for (const k of Object.keys(rv)) {
      if (k === 'always') continue;
      for (const f of arr(rv[k])) if (!own(opener, f)) opener[f] = k;
    }
    const have = revealed instanceof Set ? revealed : new Set();
    return Object.keys(feats).filter((id) => !have.has(id)).map((id) => {
      const mid = own(opener, id) ? opener[id] : null;
      return { id, name: str(feats[id].name) || id, gist: str(feats[id].gist), module: mid ? { id: mid, name: moduleName(mid) || mid } : null };
    });
  }

  /* ── Training: the drill list Settings renders ──────────────────────────────────────────── */

  /* Practice runs. Each route opens its screen in drill mode (sample content, nothing saved); the SOS drill itself
     is ui-sos.js's. The quick-log run is the coach-marked walk-through over the real form, which saves nothing. */
  const TRAINING = [
    { id: 'train-sober', name: 'SOBER practice run', route: '#/practice/sober?drill=1', kind: 'training' },
    { id: 'train-quicklog', name: 'Quick log walk-through', route: '#/track?tutorial=quicklog', kind: 'training' },
    { id: 'train-battle', name: 'Battle Plan practice run', route: '#/actions/battle?new=1&drill=1', kind: 'training' },
    { id: 'train-trial', name: 'Put a thought on trial (practice)', route: '#/tools/trial?drill=1', kind: 'training' },
    { id: 'train-refusal', name: 'Saying no: practice run', route: '#/games/refusal?drill=1', kind: 'training' },
    { id: 'drill', name: 'SOS practice drill', route: '#/sos?drill=1', kind: 'drill' },
  ];
  function training() {
    const out = TRAINING.map((t) => Object.assign({}, t));
    for (const t of tutorials()) {
      if (t.kind === 'training' && typeof t.route === 'string' && !out.some((x) => x.id === t.id)) out.push({ id: t.id, name: str(t.name) || t.id, route: t.route, kind: 'training' });
    }
    if (tutorialById('tour')) out.push({ id: 'tour', name: 'Replay the tour', route: '#/today?tour=1', kind: 'tour' });
    for (const t of tutorials()) {
      if (t.kind !== 'jit' || !arr(t.steps).length) continue;
      const r = routeOfFeature(t.feature);
      if (r) out.push({ id: t.id, name: 'Show me: ' + (str(t.name) || t.id), route: r + (r.includes('?') ? '&' : '?') + 'tutorial=' + t.id, kind: 'jit' });
    }
    return out;
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
  const detach = (n) => { if (n && n.parentNode && typeof n.parentNode.removeChild === 'function') n.parentNode.removeChild(n); };
  const discreet = () => hasDOM() && !!document.documentElement && typeof document.documentElement.getAttribute === 'function'
    && document.documentElement.getAttribute('data-discreet') !== null;
  const curHash = () => (typeof location !== 'undefined' && location ? String(location.hash || '') : '');
  function goTo(r) {
    const U = ns('UI');
    if (U && typeof U.go === 'function') U.go(r);
    else if (typeof location !== 'undefined' && location) location.hash = r;
  }
  function sosLink(onLeave, cls) {
    const d = discreet();
    return el('a', {
      href: '#/sos', class: cls, text: d ? TEXT.help : TEXT.sos, 'aria-label': d ? TEXT.help : TEXT.sosLabel,
      onClick: (ev) => { if (ev && typeof ev.preventDefault === 'function') ev.preventDefault(); onLeave(); goTo('#/sos'); },
    });
  }
  function dialogOpen() {
    if (!hasDOM() || typeof document.getElementById !== 'function') return false;
    const d = document.getElementById('dialog');
    return !!(d && (d.open === true || (typeof d.hasAttribute === 'function' && d.hasAttribute('open'))));
  }

  /* ── Coach marks ────────────────────────────────────────────────────────────────────────── */

  let active = null; // { id, steps, i, root, ring, pop, live, resolve, off }

  function within(n, box) { for (let x = n; x; x = x.parentNode) if (x === box) return true; return false; }
  function towardSos(n) {
    for (let x = n; x && typeof x.getAttribute === 'function'; x = x.parentNode) {
      const href = x.getAttribute('href');
      if (x.getAttribute('id') === 'sos-btn' || (typeof href === 'string' && href.startsWith('#/sos'))) return true;
    }
    return false;
  }

  function mountPoint() {
    let m = typeof document.getElementById === 'function' ? document.getElementById('coach') : null;
    if (!m) {
      m = el('div', { id: 'coach', class: 'coach' });
      if (document.body) document.body.appendChild(m);
    }
    return m;
  }
  function targetOf(name) {
    if (!isSlug(name) || typeof document.querySelectorAll !== 'function') return null;
    const all = arr(Array.from(safe(() => document.querySelectorAll('[data-tour="' + name + '"]'), []) || []));
    for (const n of all) {
      const r = typeof n.getBoundingClientRect === 'function' ? safe(() => n.getBoundingClientRect(), null) : null;
      if (r && r.width > 0 && r.height > 0) return { node: n, rect: r };
    }
    return null;
  }
  const px = (v) => Math.round(v) + 'px';
  function place() {
    if (!active) return;
    const step = active.steps[active.i];
    const vw = typeof innerWidth === 'number' ? innerWidth : 390;
    const vh = typeof innerHeight === 'number' ? innerHeight : 800;
    let t = targetOf(step.target);
    if (t && typeof t.node.scrollIntoView === 'function' && (t.rect.top < 0 || t.rect.bottom > vh)) {
      safe(() => t.node.scrollIntoView({ block: 'center' }), null);
      t = targetOf(step.target);
    }
    const ring = active.ring; const pop = active.pop;
    pop.style.top = ''; pop.style.bottom = ''; pop.style.left = ''; pop.style.maxWidth = '';
    if (!t) { // a missing target never makes a dead step: the step shows as a centred card
      ring.setAttribute('hidden', '');
      active.overlay.setAttribute('class', 'coach-overlay coach-dim');
      pop.setAttribute('class', 'coach-pop coach-center');
      return;
    }
    const r = t.rect;
    ring.removeAttribute('hidden');
    active.overlay.setAttribute('class', 'coach-overlay');
    pop.setAttribute('class', 'coach-pop');
    ring.style.top = px(r.top - 6); ring.style.left = px(r.left - 6);
    ring.style.width = px(r.width + 12); ring.style.height = px(r.height + 12);
    const w = Math.min(320, vw - 32);
    const left = Math.max(16, Math.min(r.left, vw - w - 16));
    pop.style.left = px(left);
    // The SOS button sits above the coach layer and is never covered, so the popover keeps clear of it:
    // otherwise SOS would sit on the popover's buttons (a bottom-nav step put Next right under it).
    const sos = sosRect();
    const besideSos = !!sos && sos.left < left + w + 8 && sos.right > left - 8;
    if (vh - r.bottom > 200) {
      pop.style.top = px(r.bottom + 14);
      const b = sos ? safe(() => pop.getBoundingClientRect(), null) : null;
      if (sos && b && b.height > 0 && b.left < sos.right + 8 && b.right > sos.left - 8 && b.top < sos.bottom + 8 && b.bottom > sos.top - 8) {
        if (sos.left - 8 - left >= 200) pop.style.maxWidth = px(sos.left - 8 - left);
        else { pop.style.top = ''; pop.style.bottom = px(Math.max(16, vh - r.top + 14, vh - sos.top + 12)); }
      }
    } else {
      let bottom = Math.max(16, vh - r.top + 14);
      if (besideSos) bottom = Math.max(bottom, vh - sos.top + 12);
      pop.style.bottom = px(bottom);
    }
  }
  function sosRect() {
    const n = safe(() => document.getElementById('sos-btn'), null);
    const r = n && typeof n.getBoundingClientRect === 'function' ? safe(() => n.getBoundingClientRect(), null) : null;
    return r && r.width > 0 && r.height > 0 ? r : null;
  }
  function showStep() {
    if (!active) return;
    const n = active.steps.length; const i = active.i;
    const step = active.steps[i];
    active.count.textContent = TEXT.step(i + 1, n);
    active.text.textContent = str(step.text);
    active.next.textContent = i === n - 1 ? TEXT.done : TEXT.next;
    active.live.textContent = TEXT.step(i + 1, n) + '. ' + str(step.text);
    place();
    safe(() => active.next.focus(), null);
  }
  function close(outcome, passThrough) {
    const a = active;
    if (!a) return;
    active = null;
    a.off();
    detach(a.root);
    const m = typeof document.getElementById === 'function' ? document.getElementById('coach') : null;
    if (m && (!m.children || !m.children.length || m.children.length === 0)) m.setAttribute('hidden', '');
    const A = ns('Actions');
    if (outcome === 'done' || outcome === 'skipped') {
      if (A && A.tutorial && typeof A.tutorial.done === 'function') run(() => A.tutorial.done(a.id, outcome === 'skipped' ? { skipped: true } : undefined));
    }
    if (a.back && typeof a.back.focus === 'function' && outcome !== 'aborted' && passThrough !== true && (!document.contains || document.contains(a.back))) safe(() => a.back.focus(), null);
    a.resolve(outcome);
  }

  /* coach(id, {replay}) -> Promise<'done'|'skipped'|'aborted'>. Finish marks the tutorial done, Skip (or Escape, or a
     tap outside the popover) marks it skipped; a route to #/sos*, #/lock or #/onboarding closes it and marks nothing.
     The drill has no steps: it opens the SOS practice drill (ui-sos.js) and resolves 'aborted' here. */
  function coach(tutorialId, opts) {
    const o = opts || {};
    const t = tutorialById(tutorialId);
    if (!t || !hasDOM()) return Promise.resolve('aborted');
    if (t.kind === 'drill') { goTo('#/sos?drill=1'); return Promise.resolve('aborted'); }
    const steps = arr(t.steps).filter((s) => s && str(s.text));
    if (!steps.length || isQuietPath(pathOf(curHash())) || locked()) return Promise.resolve('aborted');
    if (active) close('aborted');
    // a modal sheet would make the overlay inert: it closes first (its own close handler tidies up)
    const dlg = typeof document.getElementById === 'function' ? document.getElementById('dialog') : null;
    if (dialogOpen() && dlg && typeof dlg.close === 'function') safe(() => dlg.close(), null);
    if (o.replay === true) {
      const A = ns('Actions');
      if (A && A.tutorial && typeof A.tutorial.replay === 'function') run(() => A.tutorial.replay(t.id));
    }
    return new Promise((resolve) => {
      const titleId = 'coach-title-' + t.id;
      const count = el('p', { class: 'coach-count muted', id: titleId });
      const text = el('p', { class: 'coach-text' });
      const next = el('button', { type: 'button', class: 'btn primary coach-next', 'data-test': 'coach-next' });
      const skip = el('button', { type: 'button', class: 'btn ghost coach-skip', 'data-test': 'coach-skip', text: TEXT.skip, 'aria-label': TEXT.skip + ': ' + (str(t.name) || t.id) });
      const live = el('div', { class: 'sr-only', 'aria-live': 'polite' });
      const pop = el('div', { class: 'coach-pop', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': titleId, 'data-test': 'coach-pop' },
        el('div', { class: 'coach-head' }, count, sosLink(() => close('aborted'), 'coach-sos')), text,
        el('div', { class: 'coach-actions' }, skip, next));
      const ring = el('div', { class: 'coach-ring', 'aria-hidden': 'true' });
      const overlay = el('div', { class: 'coach-overlay', 'data-test': 'coach-overlay' });
      const root = el('div', { class: 'coach-layer', 'data-tutorial': t.id }, overlay, ring, pop, live);
      const onKey = (ev) => { if (ev && ev.key === 'Escape') { if (typeof ev.preventDefault === 'function') ev.preventDefault(); close('skipped'); } };
      const onRoute = () => { if (isQuietPath(pathOf(curHash())) || locked()) close('aborted'); else place(); };
      const onResize = () => place();
      // The dim layer lets taps through (core's .coach-overlay is made pointer-events: none in this lane's styles), so
      // the page is never gated: a tap anywhere outside the popover closes the tour as skipped and still does what it
      // was meant to do; a tap on the way to SOS closes it and marks nothing.
      const onTap = (ev) => {
        const tg = ev && ev.target;
        if (!active || within(tg, pop)) return;
        close(towardSos(tg) ? 'aborted' : 'skipped', true);
      };
      const off = () => {
        if (typeof document.removeEventListener === 'function') {
          document.removeEventListener('click', onTap, true);
          document.removeEventListener('keydown', onKey);
          document.removeEventListener('ui:rendered', onRoute);
        }
        if (typeof window !== 'undefined' && window && typeof window.removeEventListener === 'function') {
          window.removeEventListener('hashchange', onRoute);
          window.removeEventListener('resize', onResize);
        }
      };
      active = { id: t.id, steps, i: 0, root, ring, pop, overlay, live, count, text, next, resolve, off, back: document.activeElement || null };
      next.addEventListener('click', () => { if (!active) return; if (active.i >= active.steps.length - 1) close('done'); else { active.i += 1; showStep(); } });
      skip.addEventListener('click', () => close('skipped'));
      overlay.addEventListener('click', () => close('skipped'));
      if (typeof document.addEventListener === 'function') {
        document.addEventListener('click', onTap, true);
        document.addEventListener('keydown', onKey);
        document.addEventListener('ui:rendered', onRoute);
      }
      if (typeof window !== 'undefined' && window && typeof window.addEventListener === 'function') {
        window.addEventListener('hashchange', onRoute);
        window.addEventListener('resize', onResize);
      }
      const m = mountPoint();
      m.appendChild(root);
      m.removeAttribute('hidden');
      showStep();
    });
  }
  function replayTour() { return coach('tour', { replay: true }); }
  function isOpen() { return !!active; }

  /* ── The tip card (Today only) ──────────────────────────────────────────────────────────── */

  function tipCard(ctx) {
    const c = ctx || {};
    const path = pathOf(c.route || curHash());
    if (!isTodayPath(path) || !hasDOM()) return null;
    if (c.settings && c.settings.tips === false) return null;
    const E = ns('Engine'); const view = viewOf(c);
    if (!E || typeof E.pickTip !== 'function' || !view) return null;
    const tip = safe(() => E.pickTip(view, c.now || new Date(), { route: '#' + path }), null);
    if (!tip || !str(tip.text) || !str(tip.id)) return null;
    const goes = typeof tip.route === 'string' && tip.route.startsWith('#/') && !tip.route.startsWith('#/sos');
    const card = el('section', { class: 'card tip', 'data-tour': 'tips-card', 'data-test': 'tip-card', 'aria-label': TEXT.tipTitle },
      el('h3', { class: 'card-title', text: TEXT.tipTitle }), el('p', { text: tip.text }));
    const got = el('button', { type: 'button', class: 'btn', 'data-test': 'tip-got-it', text: TEXT.gotIt });
    got.addEventListener('click', () => {
      const A = ns('Actions');
      if (A && typeof A.markTipShown === 'function') run(() => A.markTipShown(tip.id));
      detach(card);
    });
    card.appendChild(el('div', { class: 'row' }, goes ? el('a', { class: 'btn ghost', href: tip.route, text: TEXT.tipGo }) : null, got));
    return card;
  }

  /* ── The Explorer ring ──────────────────────────────────────────────────────────────────── */

  const EXPLORER_ROUTES = {
    tour: '#/today?tour=1', drill: '#/sos?drill=1', reasons: '#/workbook/reasons', safetyNet: '#/workbook/network',
    log: '#/track/log', checkin: '#/today', lesson: '#/learn', workbook: '#/workbook', plan: '#/actions/planner',
    breathe: '#/practice/breathe', wantTo: '#/actions/planner', pace: '#/learn',
  };
  let explorerHidden = false; // this visit only
  function explorerItems(view) {
    const E = ns('Engine');
    return E && typeof E.explorer === 'function' ? arr(safe(() => E.explorer(view), [])) : [];
  }
  function explorerSheet(items) {
    const U = ns('UI');
    const done = items.filter((x) => x.done).length;
    const list = el('ul', { class: 'gt-explorer-list' }, items.map((x) => {
      const r = EXPLORER_ROUTES[x.id];
      return el('li', { class: x.done ? 'gt-done' : null },
        el('span', { class: 'gt-mark', 'aria-hidden': 'true', text: x.done ? '✓' : '○' }),
        el('span', { class: 'gt-label', text: str(x.label) }),
        el('span', { class: 'sr-only', text: x.done ? TEXT.tried : TEXT.notYet }),
        !x.done && r ? el('a', { class: 'btn ghost', href: r, text: TEXT.go, 'aria-label': TEXT.go + ': ' + str(x.label) }) : null);
    }));
    const hide = el('button', { type: 'button', class: 'btn ghost', 'data-test': 'explorer-hide', text: TEXT.explorerHide });
    const body = el('div', { class: 'stack' }, el('p', { text: TEXT.explorerLead(done, items.length) }), list, hide);
    const sh = U && typeof U.sheet === 'function' ? U.sheet(TEXT.explorerTitle, body) : null;
    hide.addEventListener('click', () => { explorerHidden = true; if (sh) sh.close('dismissed'); if (U && typeof U.render === 'function') U.render('store'); });
    return body;
  }
  function explorerRing(ctx) {
    const c = ctx || {};
    if (explorerHidden || c.calm === true || !hasDOM()) return null;
    const E = ns('Engine'); const view = viewOf(c);
    if (!E || !view || typeof E.explorerDone !== 'function' || safe(() => E.explorerDone(view), true) === true) return null;
    const items = explorerItems(view);
    if (!items.length) return null;
    const done = items.filter((x) => x.done).length;
    const U = ns('UI');
    const pct = Math.round(100 * done / items.length);
    const face = U && typeof U.ring === 'function' ? U.ring(pct, TEXT.explorer) : el('span', { class: 'ring-text', text: pct + '%' });
    const b = el('button', { type: 'button', class: 'gt-explorer', 'data-tour': 'explorer-ring', 'data-test': 'explorer-ring', 'aria-label': TEXT.explorerOpen + ': ' + done + ' of ' + items.length },
      face, el('span', { class: 'gt-explorer-text', text: TEXT.explorerLead(done, items.length).split('.')[0] + '.' }));
    b.addEventListener('click', () => explorerSheet(explorerItems(viewOf(c))));
    return b;
  }

  /* ExplorerCompleted, once, on the first full completion (CORE R-C-21). Engine.explorerDone also holds on the twelve
     items alone, so the event log is checked directly. */
  let explorerLogged = false;
  function checkExplorer(view) {
    if (explorerLogged || !view || hasEvent(view, 'ExplorerCompleted')) return false;
    const items = explorerItems(view);
    if (!items.length || !items.every((x) => x.done)) return false;
    const A = ns('Actions');
    if (!A || typeof A.recordEvent !== 'function') return false;
    explorerLogged = true;
    run(() => A.recordEvent('ExplorerCompleted', {}));
    return true;
  }

  /* ── Reveal: "More tools" and the "New" dot ─────────────────────────────────────────────── */

  function moreTools(ctx) {
    const c = ctx || {};
    if (!hasDOM()) return null;
    const view = viewOf(c);
    const items = lockedFeatures(revealedSet(view, c));
    if (!items.length) return null;
    const list = el('ul', { class: 'gt-more-list' }, items.map((f) => {
      const btn = el('button', { type: 'button', class: 'btn', 'data-test': 'show-now', 'data-feature': f.id, text: TEXT.showNow, 'aria-label': TEXT.showNow + ': ' + f.name });
      btn.addEventListener('click', () => {
        const A = ns('Actions'); const U = ns('UI');
        if (!A || typeof A.reveal !== 'function') return;
        btn.setAttribute('disabled', '');
        run(() => A.reveal(f.id, { forced: true })).then((res) => {
          if (res && U && typeof U.toast === 'function') U.toast(TEXT.shown(f.name), 'ok');
          if (!res) btn.removeAttribute('disabled');
        });
      });
      return el('li', { class: 'gt-more-item' },
        el('div', { class: 'stack' }, el('strong', { text: f.name }), f.gist ? el('span', { class: 'muted', text: f.gist }) : null,
          el('span', { class: 'muted', text: f.module ? TEXT.opensWith(f.module.name) : TEXT.opensAnyTime })), btn);
    }));
    return el('details', { class: 'card gt-more', 'data-tour': 'more-tools', 'data-test': 'more-tools' },
      el('summary', { text: TEXT.moreTitle }), el('p', { class: 'muted', text: TEXT.moreLead }), list);
  }
  function dot(featureId, ctx) {
    if (!hasDOM() || typeof featureId !== 'string') return null;
    const E = ns('Engine'); const view = viewOf(ctx);
    if (!E || !view || typeof E.newDots !== 'function') return null;
    const dots = safe(() => E.newDots(view), null);
    if (!(dots instanceof Set) || !dots.has(featureId)) return null;
    return el('span', { class: 'dot gt-dot', 'data-test': 'new-dot', 'data-feature': featureId, text: TEXT.newDot });
  }

  /* ── Unlocks: the reward sheet after a quest-line claim (V-44, R-O-6) ───────────────────── */

  /* SOS, help, lessons, Settings, export and the person's data are never gated, so never a reward (the Engine's rule,
     engine.js isProtectedFeature, kept here too for when the Engine lacks it). */
  const PROTECTED_IDS = new Set(['sos', 'urgent', 'help', 'lessons', 'learn', 'settings', 'export', 'data', 'backup']);
  const PROTECTED_TABS = new Set(['sos', 'settings', 'learn']);
  function isProtected(id) {
    const C = content();
    const f = C.features && own(C.features, id) ? C.features[id] : null;
    if (PROTECTED_IDS.has(id) || arr((C.reveal || {}).always).includes(id) || (f && PROTECTED_TABS.has(f.tab))) return true;
    const E = ns('Engine');
    return !!(E && typeof E.isProtectedFeature === 'function' && safe(() => E.isProtectedFeature(id), false) === true);
  }
  /* The quest-line step's opened line for a reward, else the feature's gist, else ''. */
  function openedLine(id) {
    const C = content();
    const step = arr(C.questLine).find((x) => x && x.reward === id && str(x.opened));
    return step ? step.opened : str(((C.features || {})[id] || {}).gist);
  }
  /* rewardSheet(featureId, ctx) -> the sheet's body node | null. "You unlocked <name>", the opened line, "Open it"
     (one tap to the feature) and "Later" (Escape and the backdrop too). Nothing for a protected or unknown feature,
     on an SOS or quiet route, while locked, while the coach is open, or a second time in a session: the unlock then
     simply shows on Today. No animation of its own (the sheet has none; reduced motion stays still); the sheet
     carries its own SOS link (UI.sheet) and returns focus on close. Text as text. */
  function rewardSheet(featureId, ctx) {
    const U = ns('UI');
    if (!hasDOM() || !U || typeof U.sheet !== 'function' || typeof featureId !== 'string' || !featureId) return null;
    const C = content();
    const feat = C.features && own(C.features, featureId) ? C.features[featureId] : null;
    if (!feat || isProtected(featureId) || memo.rewarded.has(featureId)) return null;
    const c = ctx || {};
    if (isQuietPath(pathOf(curHash())) || (c.route && isQuietPath(pathOf(c.route)))) return null;
    if (locked() || isOpen()) return null;
    memo.rewarded.add(featureId);
    const name = str(feat.name) || featureId;
    const line = openedLine(featureId);
    const r = routeOfFeature(featureId);
    let sh = null;
    const open = r && !isQuietPath(pathOf(r)) ? el('button', { type: 'button', class: 'btn primary', 'data-test': 'reward-open', text: TEXT.openIt,
      'aria-label': TEXT.openIt + ': ' + name, onClick: () => { if (sh) sh.close('open'); goTo(r); } }) : null;
    const later = el('button', { type: 'button', class: 'btn ghost', 'data-test': 'reward-later', text: TEXT.later,
      onClick: () => { if (sh) sh.close('dismissed'); } });
    const body = el('div', { class: 'stack gt-reward', 'data-test': 'reward-sheet', 'data-feature': featureId },
      line ? el('p', { text: line }) : null, el('div', { class: 'row' }, open, later));
    sh = safe(() => U.sheet(TEXT.unlocked(name), body), null);
    return sh ? body : null;
  }

  /* ── After each render: the tour, JIT, seen marks, ?tour= and ?tutorial= ────────────────── */

  const memo = { tourChecked: false, asked: {}, seen: new Set(), query: '', rewarded: new Set() };
  let bar = null;
  const dayOf = (d) => { const x = d instanceof Date ? d : new Date(); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  function clearBar() { detach(bar); bar = null; }
  function jitBar(t, today) {
    const show = el('button', { type: 'button', class: 'btn primary', 'data-test': 'jit-show', text: TEXT.showMe });
    const later = el('button', { type: 'button', class: 'btn ghost', 'data-test': 'jit-later', text: TEXT.later });
    const b = el('div', { class: 'gt-jit', role: 'region', 'aria-label': str(t.name) || t.id, 'data-test': 'jit-bar', 'data-tutorial': t.id },
      el('p', { text: TEXT.jit(str(t.name) || t.id) }), el('div', { class: 'row' }, show, later));
    show.addEventListener('click', () => { memo.asked[t.id] = today; clearBar(); coach(t.id); });
    later.addEventListener('click', () => { memo.asked[t.id] = today; clearBar(); });
    return b;
  }

  /* maybeTour(ctx): starts the first-run tour once per boot when shouldTour holds. */
  function maybeTour(ctx) {
    const c = ctx || {};
    if (memo.tourChecked || active) return false;
    const view = viewOf(c);
    const path = pathOf(c.route || curHash());
    const go = shouldTour({
      profile: c.profile || rowOf(view, 'profile', 'me') || {}, onboarded: hasEvent(view, 'OnboardingCompleted'),
      tourDone: tutorialDone(view, 'tour', true), path, locked: locked(), busy: dialogOpen(),
    });
    if (!go) return false;
    memo.tourChecked = true;
    coach('tour');
    return true;
  }

  function afterRender(ctx) {
    const c = ctx || {};
    const r = c.route && typeof c.route === 'object' ? c.route : null;
    const path = pathOf(r || curHash());
    if (isQuietPath(path)) { clearBar(); if (active) close('aborted'); return; }
    const view = viewOf(c);
    const E = ns('Engine'); const A = ns('Actions');
    // first visit of a newly revealed feature clears its "New" dot
    const f = featureOfRoute(path);
    if (f && E && A && typeof E.newDots === 'function' && typeof A.reveal === 'function' && !memo.seen.has(f)) {
      const dots = safe(() => E.newDots(view), null);
      if (dots instanceof Set && dots.has(f)) { memo.seen.add(f); run(() => A.reveal(f, { seen: true })); }
    }
    checkExplorer(view);
    // ?tour=1 and ?tutorial=<id> (Training, Explorer): once per arrival on that route
    const q = (r && r.query) || {};
    const key = curHash();
    if (key !== memo.query) {
      memo.query = key;
      if (q.tour === '1' && !active) { memo.tourChecked = true; coach('tour', { replay: true }); return; }
      if (isSlug(q.tutorial) && !active) { coach(q.tutorial, { replay: true }); return; }
    }
    if (maybeTour(c) || active) { clearBar(); return; }
    const today = dayOf(c.now);
    const t = jitFor({ path, revealed: revealedSet(view, c), isDone: (id) => tutorialDone(view, id, true), asked: memo.asked, today });
    const main = typeof document.getElementById === 'function' ? document.getElementById('main') : null;
    if (!t || !main) { clearBar(); return; }
    if (bar && bar.getAttribute('data-tutorial') === t.id && bar.parentNode === main) return;
    clearBar();
    bar = jitBar(t, today);
    if (typeof main.prepend === 'function') main.prepend(bar); else main.appendChild(bar);
  }

  function onRendered(ev) {
    const U = ns('UI');
    const d = (ev && ev.detail) || {};
    const ctx = U && typeof U.ctx === 'function' ? safe(() => U.ctx(d.route), null) : null;
    safe(() => afterRender(ctx || { route: d.route }), null);
  }
  function onHash() {
    if (isQuietPath(pathOf(curHash()))) { clearBar(); if (active) close('aborted'); }
  }
  if (hasDOM() && typeof document.addEventListener === 'function' && typeof window !== 'undefined') {
    document.addEventListener('ui:rendered', onRendered);
    if (window && typeof window.addEventListener === 'function') window.addEventListener('hashchange', onHash);
  }

  /* The browser suite drives UI.tour.start(id) (tests/browser.test.mjs "tour complete"/"tour skip"): attached from
     this file at load, never by editing ui-core.js; it is the same coach() with a replay mark. UI.tour.start and
     UI.tour.replay return nothing, so a caller is never kept waiting while the tour runs until it is closed; the end
     is the TutorialCompleted event. GuidanceUI.coach and GuidanceUI.replayTour still return their Promise. */
  const U0 = ns('UI');
  if (U0 && typeof U0 === 'object' && !own(U0, 'tour')) safe(() => { U0.tour = { start: (id) => { coach(id || 'tour', { replay: true }); }, replay: () => { replayTour(); } }; }, null);

  return {
    coach, replayTour, isOpen, maybeTour, featureOfRoute, training, tipCard, explorerRing, moreTools, dot, rewardSheet,
    // pure parts, for the Node tests and for consumers that only need the numbers
    shouldTour, jitFor, lockedFeatures, routeOfFeature, pathOf, afterRender, checkExplorer, TRAINING,
    _reset() { memo.tourChecked = false; memo.asked = {}; memo.seen = new Set(); memo.query = ''; memo.rewarded = new Set(); explorerHidden = false; explorerLogged = false; if (active) close('aborted'); clearBar(); },
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = GuidanceUI;
