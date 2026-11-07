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
    const svgEl = s('svg', { viewBox: '0 0 360 200', class: 'hb-scene ' + (still(c) ? 'hb-still' : 'hb-moving'), role: 'img', 'aria-label': ariaLabel(L),
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
        s('path', { class: L.compass ? 'hb-rose hb-on' : 'hb-rose', d: 'M322 162 L326 172 L336 176 L326 180 L322 190 L318 180 L308 176 L318 172 Z' })));
    const wrap = document.createElement('div');
    wrap.setAttribute('class', 'hb-wrap');
    wrap.appendChild(svgEl);
    const cap = document.createElement('p');
    cap.setAttribute('class', 'muted hb-caption');
    cap.textContent = TEXT.caption;
    wrap.appendChild(cap);
    return wrap;
  }

  const PURE = ['TEXT', 'PLACES', 'lightLevels', 'lightOpacity', 'ariaLabel', 'hidden', 'still'];
  return { TEXT, PLACES, lightLevels, lightOpacity, ariaLabel, hidden, still, scene, PURE };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
  for (const k of HarborUI.PURE) module.exports[k] = HarborUI[k];
}
