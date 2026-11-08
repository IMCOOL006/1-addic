/* 1-addic · ui-harbor.js · the Harbor scene (BUILD-PLAN 3.12, section 5 U-18; lane today-track).
   A layered inline SVG: sky, sea, breakwater and the six places of Content.regions (the Lighthouse, the Cove,
   the Garden, the Pier, the Compass Rose, the Weather Station). Each place is lit by its level 0-5 from
   E.gameState(view, now).regions, which comes from the append-only event log, so the light only ever grows:
   a slip lowers nothing. Motion (water drift, beam sweep, lantern flicker) is transform only, in the today-track
   section of styles.css, and stops under prefers-reduced-motion, settings.reducedMotion and on SOS routes.
   Calm mode and discreet mode get no scene (null). Content, Engine and UI are read through typeof guards. */
const HarborUI = (() => {
  const PLACES = ['lighthouse', 'cove', 'garden', 'pier', 'compass', 'weather'];
  const MAX = 5;
  const TEXT = {
    label: 'Your harbor.',
    lit: (parts) => ` Lit: ${parts}.`,
    dark: (parts) => ` Waiting for light: ${parts}.`,
    level: (name, n) => `${name}, level ${n} of ${MAX}`,
    caption: 'Each place grows brighter as you use its skills. The light never goes out.',
    growing: (n) => (n === 1 ? ' 1 thing growing.' : ` ${n} things growing.`),
    names: { lighthouse: 'The Lighthouse', cove: 'The Cove', garden: 'The Garden', pier: 'The Pier', compass: 'The Compass Rose', weather: 'The Weather Station' },
  };

  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  const safe = (fn, dflt) => { try { const v = fn(); return v === undefined ? dflt : v; } catch (e) { return dflt; } };
  const ns = (name) => {
    try {
      if (name === 'Content') return typeof Content !== 'undefined' ? Content : null;
      if (name === 'Engine') return typeof Engine !== 'undefined' ? Engine : null;
      if (name === 'UI') return typeof UI !== 'undefined' ? UI : null;
    } catch (e) { /* a namespace that throws counts as absent */ }
    return null;
  };
  const clampLevel = (v) => { const n = Math.floor(Number(v)); return isFinite(n) ? Math.max(0, Math.min(MAX, n)) : 0; };

  /* ── pure ──────────────────────────────────────────────────────────────────────────────── */
  /* { lighthouse, cove, garden, pier, compass, weather: 0-5 } from the engine's region levels. */
  function lightLevels(view, now, eng) {
    const E = eng === undefined ? ns('Engine') : eng;
    const gs = E && typeof E.gameState === 'function' ? safe(() => E.gameState(view, now || new Date()), null) : null;
    const r = gs && isObj(gs.regions) ? gs.regions : {};
    const out = {};
    for (const id of PLACES) out[id] = clampLevel(r[id]);
    return out;
  }
  /* The glow of a place: 0 when unlit, then strictly rising to 1 at level 5. */
  const lightOpacity = (level) => { const n = clampLevel(level); return n === 0 ? 0 : Math.round((0.2 + 0.16 * n) * 100) / 100; };
  const placeName = (id) => {
    const C = ns('Content');
    const r = C && isObj(C.regions) && isObj(C.regions[id]) ? C.regions[id] : null;
    return r && typeof r.name === 'string' && r.name ? r.name : TEXT.names[id];
  };
  function ariaLabel(levels) {
    const lit = PLACES.filter((id) => levels[id] > 0).map((id) => TEXT.level(placeName(id), levels[id]));
    const dark = PLACES.filter((id) => !(levels[id] > 0)).map(placeName);
    return TEXT.label + (lit.length ? TEXT.lit(lit.join('; ')) : '') + (dark.length ? TEXT.dark(dark.join(', ')) : '');
  }
  /* Calm mode and discreet mode show no scene. */
  function hidden(ctx) {
    const c = ctx || {};
    const s = isObj(c.settings) ? c.settings : {};
    return c.calm === true || s.calm === true || s.discreet === true ||
      safe(() => document.documentElement.getAttribute('data-discreet') !== null, false) === true;
  }
  /* Still (no motion): the person's setting, the system setting, the data-motion flag, or an SOS route. */
  function still(ctx) {
    const c = ctx || {};
    const s = isObj(c.settings) ? c.settings : {};
    const path = String((c.route && c.route.path) || '');
    return s.reducedMotion === true || /^\/?sos(\/|$)/.test(path) ||
      safe(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches === true, false) === true ||
      safe(() => document.documentElement.getAttribute('data-motion') === 'reduce', false) === true;
  }

  /* ── V-43 growth: one element per Engine.growth unit (Today's objectives), never removed ──────────── */
  const GROW_KINDS = ['lantern', 'tree', 'boat', 'bench', 'flag', 'gull', 'garden', 'bell'];
  const GROW_MAX = 60;
  /* A fixed table of 60 spots off the places' tap areas: the sky over the water edge, the sky over the hill, the far
     water and the left shore, taken in turn so the harbor fills evenly. Spot k never moves. */
  const SPOTS = (() => {
    const grid = (xs, ys) => ys.flatMap((y) => xs.map((x) => [x, y]));
    const zones = [
      grid([70, 84, 98, 112, 126, 140, 154, 168, 182], [120, 104, 88]),
      grid([204, 222, 240, 258, 276, 294, 312], [56, 40, 22]),
      grid([186, 204, 222, 240, 258, 276], [186]).concat(grid([14, 26], [116, 96, 76])),
    ];
    const out = [];
    for (let i = 0; out.length < GROW_MAX; i++) for (const z of zones) if (i < z.length && out.length < GROW_MAX) out.push(z[i]);
    return out;
  })();
  /* The kind of unit i: its Engine.growthItems grows (a kind, or the objective that holds one), else the cycle. */
  function kindAt(items, i) {
    const it = Array.isArray(items) ? items[i] : null;
    const g = isObj(it) ? (typeof it.grows === 'string' ? it.grows : isObj(it.grows) ? it.grows.grows : null) : null;
    return GROW_KINDS.includes(g) ? g : GROW_KINDS[i % GROW_KINDS.length];
  }
  /* growthSpots(n, items?) -> [{x, y, kind}], at most 60. growthSpots(n + 1) begins with growthSpots(n). */
  function growthSpots(n, items) {
    const k = Math.max(0, Math.min(GROW_MAX, Math.floor(Number(n) || 0)));
    return SPOTS.slice(0, k).map((p, i) => ({ x: p[0], y: p[1], kind: kindAt(items, i) }));
  }
  const GLYPH = {
    lantern: (s) => [s('rect', { x: '-2', y: '-4', width: '4', height: '6', rx: '1' }), s('circle', { class: 'hb-g-glow', cx: '0', cy: '-1', r: '1.2' })],
    tree: (s) => [s('path', { d: 'M0 -5 L4 2 H-4 Z' }), s('rect', { x: '-0.8', y: '2', width: '1.6', height: '3' })],
    boat: (s) => [s('path', { d: 'M-5 1 H5 L3 4 H-3 Z' }), s('path', { class: 'hb-g-line', d: 'M0 1 V-5 L3 -1 H0' })],
    bench: (s) => [s('rect', { x: '-4', y: '-1', width: '8', height: '1.6' }), s('path', { class: 'hb-g-line', d: 'M-3 0.6 V4 M3 0.6 V4 M-4 -3 H4' })],
    flag: (s) => [s('path', { class: 'hb-g-line', d: 'M-2 5 V-5' }), s('path', { d: 'M-2 -5 L4 -3 L-2 -1 Z' })],
    gull: (s) => [s('path', { class: 'hb-g-line', d: 'M-5 0 Q-2.5 -3 0 0 Q2.5 -3 5 0' })],
    garden: (s) => [s('circle', { cx: '-3', cy: '1', r: '1.5' }), s('circle', { cx: '0', cy: '-1', r: '1.5' }), s('circle', { cx: '3', cy: '1', r: '1.5' })],
    bell: (s) => [s('path', { d: 'M-3 2 Q-3 -4 0 -4 Q3 -4 3 2 Z' }), s('circle', { cx: '0', cy: '3', r: '1' })],
  };
  /* Engine.growth and Engine.growthItems behind typeof (count 0 when absent). */
  function growthOf(c) {
    const E = c.E === undefined ? ns('Engine') : c.E;
    const call = (fn) => (E && typeof E[fn] === 'function' ? safe(() => E[fn](c.view, c.now), null) : null);
    const items = call('growthItems');
    const n = Math.floor(Number(call('growth')) || 0);
    return { count: n > 0 ? n : (Array.isArray(items) ? items.length : 0), items: Array.isArray(items) ? items : [] };
  }
  /* The growth layer: no data-place and no pointer events, so the place taps under it keep working. */
  function growthLayer(s, spots) {
    if (!spots.length) return null;
    return s('g', { class: 'hb-growth', 'data-test': 'status-growth-layer', 'pointer-events': 'none' },
      spots.map((p) => s('g', { class: `hb-g hb-g-${p.kind}`, 'data-kind': p.kind, transform: `translate(${p.x} ${p.y})` }, GLYPH[p.kind](s))));
  }

  /* ── the scene ─────────────────────────────────────────────────────────────────────────── */
  function lights(s, n, spots, cls) {
    return spots.map((p, i) => s('g', { class: i < n ? 'hb-lantern hb-lit' : 'hb-lantern' },
      i < n ? s('circle', { class: 'hb-halo', cx: String(p[0]), cy: String(p[1]), r: '6' }) : null,
      s('circle', { class: cls, cx: String(p[0]), cy: String(p[1]), r: '2.6' })));
  }
  function place(s, id, level, ...art) {
    return s('g', { class: `hb-place hb-${id}`, 'data-place': id, 'data-level': String(level) }, ...art);
  }
  function glow(s, level, attrs) {
    return s('ellipse', Object.assign({ class: 'hb-light', opacity: String(lightOpacity(level)) }, attrs));
  }

  function scene(ctxIn) {
    const c = ctxIn || {};
    if (hidden(c)) return null;
    const U = ns('UI');
    if (!U || typeof U.svg !== 'function' || typeof document === 'undefined') return null;
    const s = U.svg;
    const L = lightLevels(c.view, c.now, c.E === undefined ? undefined : c.E);
    const G = growthOf(c);
    const spots = growthSpots(G.count, G.items);
    const svgEl = s('svg', { viewBox: '0 0 360 200', class: 'hb-scene ' + (still(c) ? 'hb-still' : 'hb-moving'), role: 'img', 'aria-label': ariaLabel(L) + (G.count ? TEXT.growing(G.count) : ''),
      'data-test': 'harbor-scene', focusable: 'false', preserveAspectRatio: 'xMidYMid slice' },
      s('rect', { class: 'hb-sky', x: '0', y: '0', width: '360', height: '200' }),
      place(s, 'garden', L.garden,
        s('path', { class: 'hb-hill', d: 'M196 128 Q260 70 360 82 V140 H196 Z' }),
        glow(s, L.garden, { cx: '284', cy: '104', rx: '58', ry: '20' }),
        lights(s, L.garden, [[236, 116], [256, 104], [276, 98], [298, 96], [320, 98]], 'hb-flower')),
      place(s, 'weather', L.weather,
        s('rect', { class: 'hb-mast', x: '338', y: '56', width: '3', height: '30' }),
        s('path', { class: 'hb-vane', d: 'M330 58 H350 M339.5 50 V58' }),
        glow(s, L.weather, { cx: '340', cy: '56', rx: '14', ry: '12' }),
        s('circle', { class: L.weather ? 'hb-lamp hb-on' : 'hb-lamp', cx: '340', cy: '56', r: '3' })),
      s('rect', { class: 'hb-sea', x: '0', y: '128', width: '360', height: '72' }),
      s('g', { class: 'hb-water' },
        s('path', { class: 'hb-wave', d: 'M-30 146 q15 -5 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0' }),
        s('path', { class: 'hb-wave', d: 'M-30 176 q15 -5 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0' })),
      place(s, 'cove', L.cove,
        s('path', { class: 'hb-stone', d: 'M20 132 Q70 186 168 168 L172 176 Q66 198 10 140 Z' }),
        glow(s, L.cove, { cx: '96', cy: '158', rx: '50', ry: '12' }),
        s('ellipse', { class: 'hb-calm', cx: '96', cy: '158', rx: '40', ry: '7' })),
      place(s, 'lighthouse', L.lighthouse,
        s('g', { class: 'hb-beam-wrap' },
          s('path', { class: 'hb-beam', opacity: String(lightOpacity(L.lighthouse)), d: 'M48 50 L190 30 L190 72 Z' })),
        s('path', { class: 'hb-tower', d: 'M38 132 L42 60 H54 L58 132 Z' }),
        s('rect', { class: 'hb-room', x: '40', y: '44', width: '16', height: '14', rx: '2' }),
        s('path', { class: 'hb-roof', d: 'M38 44 L48 34 L58 44 Z' }),
        glow(s, L.lighthouse, { cx: '48', cy: '51', rx: '14', ry: '12' }),
        s('circle', { class: L.lighthouse ? 'hb-lamp hb-on' : 'hb-lamp', cx: '48', cy: '51', r: '4' })),
      place(s, 'pier', L.pier,
        s('rect', { class: 'hb-deck', x: '176', y: '146', width: '110', height: '5' }),
        [186, 208, 230, 252, 274].map((x) => s('rect', { class: 'hb-post', x: String(x), y: '151', width: '3', height: '20' })),
        glow(s, L.pier, { cx: '230', cy: '138', rx: '56', ry: '12' }),
        lights(s, L.pier, [[187, 138], [209, 138], [231, 138], [253, 138], [275, 138]], 'hb-bulb')),
      place(s, 'compass', L.compass,
        glow(s, L.compass, { cx: '322', cy: '176', rx: '20', ry: '16' }),
        s('path', { class: L.compass ? 'hb-rose hb-on' : 'hb-rose', d: 'M322 162 L326 172 L336 176 L326 180 L322 190 L318 180 L308 176 L318 172 Z' })),
      growthLayer(s, spots));
    const wrap = document.createElement('div');
    wrap.setAttribute('class', 'hb-wrap');
    wrap.appendChild(svgEl);
    const cap = document.createElement('p');
    cap.setAttribute('class', 'muted hb-caption');
    cap.textContent = TEXT.caption;
    wrap.appendChild(cap);
    return wrap;
  }

  const PURE = ['TEXT', 'PLACES', 'lightLevels', 'lightOpacity', 'ariaLabel', 'hidden', 'still', 'GROW_KINDS', 'growthSpots'];
  return { TEXT, PLACES, lightLevels, lightOpacity, ariaLabel, hidden, still, GROW_KINDS, growthSpots, scene, PURE };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
  for (const k of HarborUI.PURE) module.exports[k] = HarborUI[k];
}
