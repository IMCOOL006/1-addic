// 1-addic · tests/screens.mjs · `npm run screens`: the guide's screenshots, taken from the built file (lane tests-docs, U-35).
// Opens offline/1-addic.html offline (helpers/launch.mjs: the same launch and the same route blocking as the browser
// suite), seeds a fresh profile through Settings > Your data > "Load sample data" (O6), marks the first-run tour
// skipped, and writes offline/docs/images/<slug>-desktop.png (1280x800) and <slug>-phone.png (390x844), each with a
// pHYs chunk at 300 DPI (11811 px/m) added by the small PNG rewrite below. Every image is read back and checked.
// Exits 0 with a named reason when the file or a browser is absent; a shot whose route or hook is missing is skipped
// by name; a console error, page error or non-file request fails the shot by name (exit 1). Sample data only.
import { mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launch, newPage, openApp, builtExists, PHONE } from './helpers/launch.mjs';
import { HOOKS, REASON, routeRegistered, present, missingGlobal } from './helpers/hooks.mjs';
import * as F from './helpers/flows.mjs';

export const OUT = fileURLToPath(new URL('../docs/images/', import.meta.url));
export const PPM = 11811; // 300 DPI in pixels per metre
export const SIZES = {
  desktop: { viewport: { width: 1280, height: 800 }, mobile: false },
  phone: { viewport: PHONE, mobile: true },
};
// A fixed clock (Date only; timers still run), so the sample's dates and the images repeat from run to run.
export const FIXED_NOW = '2026-11-04T09:30:00+05:30';

/* ── the shots: {slug, route, setup, size, profile, hook, own} ──────────────────────────────────────────────────
   route: a hash, or a function of the page returning one (null: the content is absent, the shot skips by name).
   profile: 'sample' (default: the shared seeded context of that size), 'fresh' (a new, empty profile).
   own: true gives the shot its own seeded context (it leaves state behind: a lock, a tour, a running tool).
   hook: a selector that must be present before the picture. setup(page): steps after the route opens. */
const firstModule = (page) => page.evaluate(() => {
  const m = (typeof Content !== 'undefined' && Array.isArray(Content.modules) ? Content.modules : []).find((x) => x && x.id);
  return m ? '#/learn/' + encodeURIComponent(m.id) : null;
});
const firstLesson = (page) => page.evaluate(() => {
  const ms = typeof Content !== 'undefined' && Array.isArray(Content.modules) ? Content.modules : [];
  for (const m of ms) {
    const l = (Array.isArray(m && m.lessons) ? m.lessons : [])[0];
    const id = l && typeof l === 'object' ? l.id : l;
    if (id) return '#/lesson/' + encodeURIComponent(id);
  }
  return null;
});
const firstExercise = (page) => page.evaluate(() => {
  const xs = typeof Content !== 'undefined' && Array.isArray(Content.exercises) ? Content.exercises : [];
  const x = xs.find((e) => e && e.id);
  return x ? '#/exercise/' + encodeURIComponent(x.id) : null;
});

async function needGlobals(page, names) {
  const g = await missingGlobal(page, names);
  if (g) throw new F.Skip(REASON.global(g));
}

async function lockNow(page, { discreet = false } = {}) {
  await needGlobals(page, ['Store.lock']);
  await page.evaluate(async ({ pin, discreet: d }) => {
    if (d) {
      if (typeof Actions !== 'undefined' && Actions.settings && typeof Actions.settings.patch === 'function') await Actions.settings.patch({ discreet: true });
      else await Store.commit('discreet on', (tx) => { tx.put('settings', Object.assign({}, tx.get('settings', 'app') || {}, { key: 'app', discreet: true })); });
    }
    await Store.lock.set(pin, { autoLockMin: 5 });
    Store.lock.lockNow();
  }, { pin: F.TEST_PIN, discreet });
  await F.waitRoute(page, 'lock');
  await page.waitForTimeout(200);
}

async function ownCravings(page, n) {
  await needGlobals(page, ['Actions.logCraving']);
  const base = new Date(FIXED_NOW).getTime();
  for (let i = 0; i < n; i += 1) {
    await page.clock.setFixedTime(new Date(base - (n - i) * 86400000 + (((n - 1 - i) * 5) % 12) * 3600000));
    await page.evaluate((k) => Actions.logCraving({ intensity: 3 + (k % 6), triggerIds: [], feelings: [], skills: [] }), i);
  }
  await page.clock.setFixedTime(new Date(FIXED_NOW));
  await F.go(page, '#/track/insights');
}

async function centre(page, sel) {
  const loc = await F.need(page, sel);
  await loc.evaluate((el) => el.scrollIntoView({ block: 'center' }));
}

export const SHOTS = [
  // getting started
  { slug: 'onboarding', route: '#/onboarding', profile: 'fresh', hook: HOOKS.onbStep },
  { slug: 'tour', route: '#/today?tour=1', own: true, hook: HOOKS.coach },
  { slug: 'lock', route: '#/today', own: true, setup: (page) => lockNow(page) },
  { slug: 'lock-discreet', route: '#/today', own: true, setup: (page) => lockNow(page, { discreet: true }) },
  // Today
  { slug: 'today', route: '#/today' },
  { slug: 'today-harbor', route: '#/today', hook: '[data-test="today-harbor"]', setup: (page) => centre(page, '[data-test="today-harbor"]') },
  // SOS and urgent help
  { slug: 'sos-hub', route: '#/sos', hook: HOOKS.sosHub },
  { slug: 'sos-craving', route: '#/sos/craving', hook: HOOKS.sosCraving },
  { slug: 'sos-craving-tool', route: '#/sos/craving', own: true, hook: HOOKS.sosCraving,
    setup: async (page) => {
      if (await present(page, HOOKS.sosRating, 800)) await F.setRating(page, HOOKS.sosRating, 7);
      await (await F.advanceUntil(page, HOOKS.sosAnyTool)).click();
      await page.waitForTimeout(300);
    } },
  { slug: 'sos-feeling', route: '#/sos/feeling' },
  { slug: 'sos-slip', route: '#/sos/slip' },
  { slug: 'sos-urgent', route: '#/sos/urgent', hook: HOOKS.telLink },
  { slug: 'sos-drill', route: '#/sos?drill=1', hook: HOOKS.sosDrillBanner },
  // quick log and check-in
  { slug: 'quicklog', route: '#/track/log/craving' },
  { slug: 'checkin', route: '#/track/log/checkin?kind=evening' },
  // Learn
  { slug: 'learn', route: '#/learn' },
  { slug: 'learn-roadmap', route: '#/learn/plan' },
  { slug: 'learn-module', route: firstModule },
  { slug: 'lesson', route: firstLesson },
  { slug: 'glossary', route: '#/learn/glossary' },
  { slug: 'exercise', route: firstExercise },
  // Workbook
  { slug: 'workbook', route: '#/workbook' },
  { slug: 'reasons-card', route: '#/workbook/reasons' },
  { slug: 'safety-nets', route: '#/workbook/network' },
  { slug: 'recovery-plan', route: '#/workbook/plan' },
  // Track and Insights
  { slug: 'track', route: '#/track' },
  { slug: 'insights', route: '#/track/insights' },
  // Sample rows never feed Insights (ui-track counts only the person's own logs), so this shot first saves eight
  // craving logs of its own, a day apart at varied hours, through Actions (made-up numbers, no words), then opens it.
  { slug: 'insights-logs', route: '#/track', own: true, setup: (page) => ownCravings(page, 8) },
  // Actions: planner, Battle Plans, Weekly Review, practices, tools
  { slug: 'actions', route: '#/actions' },
  { slug: 'planner', route: '#/actions/planner' },
  { slug: 'battle-plans', route: '#/actions/battle' },
  { slug: 'weekly-review', route: '#/actions/review' },
  { slug: 'practice', route: '#/practice/breathe' },
  { slug: 'tools', route: '#/tools' },
  // Settings (#/settings opens the Privacy tab, so settings-privacy is that picture)
  { slug: 'settings-data', route: '#/settings/data' },
  { slug: 'settings-privacy', route: '#/settings/privacy' },
];

/* ── PNG: chunks, CRC32 and the pHYs rewrite (no dependency) ─────────────────────────────────────────────── */
const SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export function readChunks(png) {
  if (png.length < 8 || !png.subarray(0, 8).equals(SIG)) throw new Error('not a PNG');
  const out = [];
  let o = 8;
  while (o + 12 <= png.length) {
    const len = png.readUInt32BE(o);
    const type = png.toString('latin1', o + 4, o + 8);
    if (o + 12 + len > png.length) throw new Error('truncated chunk ' + type);
    out.push({ type, data: png.subarray(o + 8, o + 8 + len), crc: png.readUInt32BE(o + 8 + len) });
    o += 12 + len;
    if (type === 'IEND') break;
  }
  return out;
}

function chunk(type, data) {
  const t = Buffer.from(type, 'latin1');
  const head = Buffer.alloc(4);
  head.writeUInt32BE(data.length);
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([head, t, data, tail]);
}

// Drops any pHYs and writes one right after IHDR (before IDAT, as the PNG spec asks): ppm x ppm, unit metre.
export function withPhys(png, ppm = PPM) {
  const parts = [SIG];
  for (const c of readChunks(png)) {
    if (c.type === 'pHYs') continue;
    parts.push(chunk(c.type, c.data));
    if (c.type === 'IHDR') {
      const d = Buffer.alloc(9);
      d.writeUInt32BE(ppm, 0);
      d.writeUInt32BE(ppm, 4);
      d[8] = 1;
      parts.push(chunk('pHYs', d));
    }
  }
  return Buffer.concat(parts);
}

export function inspect(png) {
  const cs = readChunks(png);
  for (const c of cs) {
    if (crc32(Buffer.concat([Buffer.from(c.type, 'latin1'), c.data])) !== c.crc) throw new Error('bad CRC in ' + c.type);
  }
  const ih = cs.find((c) => c.type === 'IHDR');
  const ph = cs.find((c) => c.type === 'pHYs');
  if (!ih) throw new Error('no IHDR');
  if (cs[cs.length - 1].type !== 'IEND') throw new Error('no IEND');
  return {
    width: ih.data.readUInt32BE(0), height: ih.data.readUInt32BE(4),
    phys: ph ? { x: ph.data.readUInt32BE(0), y: ph.data.readUInt32BE(4), unit: ph.data[8] } : null,
  };
}

// Reads a written image back: the size of its viewport and 300 DPI, or it throws with the reason.
export function verifyImage(file, viewport) {
  const info = inspect(readFileSync(file));
  if (info.width !== viewport.width || info.height !== viewport.height) {
    throw new Error(`size ${info.width}x${info.height}, expected ${viewport.width}x${viewport.height}`);
  }
  if (!info.phys || info.phys.x !== PPM || info.phys.y !== PPM || info.phys.unit !== 1) {
    throw new Error('pHYs missing or not ' + PPM + ' px/m: ' + JSON.stringify(info.phys));
  }
  return info;
}

/* ── the run ─────────────────────────────────────────────────────────────────────────────────────────── */
const problemCount = (p) => p.console.length + p.pageerror.length + p.requests.length;
const problemLines = (p, from) => [
  ...p.console.map((x) => 'console error: ' + x), ...p.pageerror.map((x) => 'page error: ' + x),
  ...p.requests.map((x) => 'network request: ' + x),
].slice(from);

// Settings > Your data > "Load sample data" on a fresh profile, then the tour marked skipped as the product records it.
// Resolves to a skip reason (string) when the route, the button or the Store is missing, else null.
export async function seed(page) {
  if (!(await routeRegistered(page, 'settings'))) return 'seed: ' + REASON.route('settings');
  const g = await missingGlobal(page, ['Store.view']);
  if (g) return 'seed: ' + REASON.global(g);
  await F.go(page, '#/settings/data');
  const btn = '[data-test="load-sample"]';
  if (!(await present(page, btn, 4000))) return 'seed: ' + REASON.hook(btn);
  await F.click(page, btn);
  await F.waitFor(page, () => typeof Store !== 'undefined' && Store.view.get('meta', 'sample') != null, null, 15000);
  await page.evaluate(async () => {
    if (typeof Actions !== 'undefined' && Actions.tutorial && typeof Actions.tutorial.done === 'function') {
      try { await Actions.tutorial.done('tour', { skipped: true }); } catch (e) { /* the tour may then show on Today */ }
    }
  });
  await F.go(page, '#/today');
  return null;
}

// A page with its profile; s.skip holds the seed's skip reason, and every shot taken on it then skips by that name.
async function session(browser, size, profile) {
  const { viewport, mobile } = SIZES[size];
  const s = await newPage(browser, { viewport, mobile, scale: 1 });
  await s.page.clock.setFixedTime(new Date(FIXED_NOW));
  await openApp(s.page, profile === 'fresh' ? '#/onboarding' : '#/today');
  s.skip = profile !== 'fresh' ? await seed(s.page) : null;
  return s;
}

// One picture: a skip reason (string) or null when the image was written and checked.
async function take(s, shot, size, file) {
  if (s.skip) return s.skip;
  const { page } = s;
  const route = typeof shot.route === 'function' ? await shot.route(page) : shot.route;
  if (!route) return 'content for ' + shot.slug + ' absent';
  const seg = route.replace(/^#\//, '').split(/[/?]/)[0];
  if (!(await routeRegistered(page, seg))) return REASON.route(seg);
  await F.go(page, route);
  if (shot.hook && !(await present(page, shot.hook, 2500))) return REASON.hook(shot.hook);
  await page.evaluate(() => { window.scrollTo(0, 0); if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
  try {
    if (shot.setup) await shot.setup(page);
  } catch (err) {
    if (err instanceof F.Skip) return err.message;
    throw err;
  }
  await page.waitForTimeout(300);
  const png = await page.screenshot({ type: 'png', animations: 'disabled', caret: 'hide' });
  writeFileSync(file, withPhys(png));
  verifyImage(file, SIZES[size].viewport);
  return null;
}

export async function main() {
  if (!builtExists()) { console.log('screens: ' + REASON.built + ' (run npm run build)'); console.log('screens: 0 written, 0 skipped'); return 0; }
  const L = await launch();
  if (L.reason) { console.log('screens: ' + L.reason); console.log('screens: 0 written, 0 skipped'); return 0; }
  console.log(`browser: ${L.channel} ${L.version}`);
  mkdirSync(OUT, { recursive: true });
  const written = [];
  const skipped = [];
  const failed = [];
  try {
    for (const size of Object.keys(SIZES)) {
      let shared = null;
      for (const shot of SHOTS) {
        if (!(shot.size || Object.keys(SIZES)).includes(size)) continue;
        const name = `${shot.slug}-${size}`;
        const file = OUT + name + '.png';
        const own = (shot.profile || 'sample') !== 'sample' || shot.own === true;
        let s = null;
        let from = 0;
        try {
          if (own) s = await session(L.browser, size, shot.profile || 'sample');
          else {
            if (!shared) {
              shared = await session(L.browser, size, 'sample');
              if (problemCount(shared.problems)) failed.push(`seed-${size}: ` + problemLines(shared.problems, 0).join('; '));
            }
            s = shared;
          }
          from = problemCount(s.problems);
          const why = await take(s, shot, size, file);
          const fresh = problemLines(s.problems, from);
          if (fresh.length) { failed.push(`${name}: ` + fresh.join('; ')); console.log(`FAIL ${name}: ${fresh.join('; ')}`); }
          else if (why) { skipped.push(name); console.log(`skip ${name}: ${why}`); }
          else { written.push(file); console.log(`wrote ${name}.png`); }
        } catch (err) {
          const extra = s ? problemLines(s.problems, from) : [];
          failed.push(`${name}: ${err.message.split('\n')[0]}` + (extra.length ? '; ' + extra.join('; ') : ''));
          console.log(`FAIL ${name}: ${err.message.split('\n')[0]}`);
        } finally {
          if (own && s) await s.context.close().catch(() => {});
        }
      }
      if (shared) await shared.context.close().catch(() => {});
    }
  } finally {
    await L.browser.close().catch(() => {});
  }
  const bytes = written.reduce((n, f) => n + statSync(f).size, 0);
  console.log(`images: ${(bytes / 1048576).toFixed(2)} MB in ${OUT}`);
  for (const f of failed) console.log('FAIL ' + f);
  console.log(`screens: ${written.length} written, ${skipped.length} skipped` + (failed.length ? `, ${failed.length} failed` : ''));
  return failed.length ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().then((code) => process.exit(code), (err) => { console.error('screens: ' + (err && err.stack ? err.stack : err)); process.exit(1); });
}
