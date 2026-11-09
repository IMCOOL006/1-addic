// 1-addic · tests/browser.test.mjs · the BUILD-PLAN 3.13 flows in a real browser (lane tests-docs, U-34).
// Run it with `npm run test:browser` (sets ADDIC_BROWSER=1). Each test opens the built offline/1-addic.html from
// file:// in a fresh context, offline, at 390 x 844 (phone), and ends by failing on any console error, page error or
// network request other than file:, data: and blob:. A flow whose route, global or DOM hook is not built yet is
// reported SKIP with the reason by name, so the suite grows green as lanes land. Run bare (`node --test`), every test
// skips with "ADDIC_BROWSER not set" and the browser is never started. Test names are failure identities: keep them.
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HOOKS, REASON, skipReason, routeRegistered, missingGlobal, present } from './helpers/hooks.mjs';
import { BUILT, builtExists, launch, newPage, openApp, ready, assertClean } from './helpers/launch.mjs';
import * as F from './helpers/flows.mjs';

const ON = process.env.ADDIC_BROWSER === '1';
let L = null;
let TOP = false;
if (!ON) TOP = REASON.env;
else if (!builtExists()) TOP = REASON.built;
else {
  L = await launch({ headless: process.env.ADDIC_HEADED !== '1' });
  if (L.reason) TOP = L.reason;
  else process.stdout.write(`browser: ${L.channel} ${L.version}\n`);
}
after(async () => { if (L && L.browser) await L.browser.close(); });

const TABS = ['today', 'learn', 'workbook', 'track', 'actions'];

// One named flow: fresh context, open, probe needs, run, assert clean. spec: {start, routes, globals, hooks,
// page (newPage options), beforeOpen (page => ..., run before the file is opened), onboarded (default true: the first-run
// onboarding is completed through Actions first), tour (true: the flow drives the first-run tour itself, so it is not
// marked done first)}.
function flow(name, spec, body) {
  test(name, { skip: TOP || false, timeout: spec.timeout || 120000 }, async (t) => {
    const s = await newPage(L.browser, spec.page || {});
    try {
      if (spec.beforeOpen) await spec.beforeOpen(s.page);
      await openApp(s.page, '#/today');
      if (spec.onboarded !== false) await markOnboarded(s.page, spec.tour !== true);
      if (spec.start && spec.start !== '#/today') await F.go(s.page, spec.start);
      let why = await skipReason(s.page, spec);
      if (!why) {
        try {
          await body(s, t);
        } catch (err) {
          if (err instanceof F.Skip) why = err.message;
          else throw err;
        }
      }
      if (why) t.skip(why);
      assertClean(s.problems);
    } finally {
      await s.context.close().catch(() => {});
    }
  });
}

// Completes first-run onboarding without the UI when the onboarding page exists (so other flows start on Today), and
// marks the first-run tour skipped the way the product records it (Actions.tutorial.done; the auto tour reads a skipped
// tour as done), so its coach never covers another flow's controls (FIX-TOURMARK); a flow with tour: true keeps it.
async function markOnboarded(page, tourDone) {
  if (!(await routeRegistered(page, 'onboarding'))) return;
  if (await missingGlobal(page, ['Store', 'Actions.onboard'])) return;
  await page.evaluate(async (tour) => {
    try {
      await Actions.onboard({});
      if (tour && Actions.tutorial && typeof Actions.tutorial.done === 'function') await Actions.tutorial.done('tour', { skipped: true });
    } catch (e) { /* the flow then starts wherever the app lands */ }
  }, tourDone === true);
  await F.go(page, '#/today');
}

async function lockSet(page) {
  await page.evaluate((pin) => Store.lock.set(pin, { autoLockMin: 5 }), F.TEST_PIN);
  const st = await page.evaluate(() => Store.status());
  assert.equal(st.hasLock, true, 'a PIN was set');
}

async function urgentOneTap(page, where) {
  if (await present(page, HOOKS.telLink, 2500)) return;
  // [data-tour="sos-urgent"] is contracted (contracts/actions-sos.md): skip only while UI.pages.sos is absent.
  if (!(await present(page, HOOKS.sosUrgentBtn, 2500))) {
    if (!(await routeRegistered(page, 'sos'))) throw new F.Skip(REASON.route('sos'));
    assert.fail(`${HOOKS.sosUrgentBtn} absent on the SOS hub (${where}): urgent help must be one tap from SOS`);
  }
  await F.click(page, HOOKS.sosUrgentBtn);
  assert.ok(await present(page, HOOKS.telLink, 2500), `urgent numbers one tap from SOS (${where})`);
}

const textOf = (page, sel) => page.locator(sel).first().textContent().then((x) => (x || '').trim());

/* ── load, viewport, navigation ── */

flow('loads offline with zero console errors and zero network requests', {}, async ({ page }) => {
  const html = readFileSync(BUILT, 'utf8');
  assert.match(html, /<meta http-equiv="Content-Security-Policy"[^>]*connect-src 'none'/, 'the CSP meta is in the file');
  assert.equal(await page.evaluate(() => navigator.onLine), false, 'the context is offline');
  assert.equal(await page.title(), '1-addic');
  for (const r of [...TABS, 'sos', 'sos/urgent', 'settings', 'settings/help', 'settings/data', 'today']) await F.go(page, '#/' + r);
  await page.waitForTimeout(300);
});

// V-26b: navigation start to the first ui:rendered, on a fresh context (the first open, the slowest). Printed for the log.
// The budget: the highest of three runs on the owner's machine (714, 559, 611 ms on 9 November 2026), times 2.
const BOOT_BUDGET_MS = 1428;
flow('boots to the first render within the budget', {
  onboarded: false,
  beforeOpen: (page) => page.addInitScript(() => {
    document.addEventListener('ui:rendered', () => { if (window.__bootMs === undefined) window.__bootMs = performance.now(); });
  }),
}, async ({ page }) => {
  await page.waitForFunction(() => window.__bootMs !== undefined, null, { timeout: 20000 });
  const ms = Math.round(await page.evaluate(() => window.__bootMs));
  process.stdout.write(`boot ms: ${ms}\n`);
  assert.ok(ms < BOOT_BUDGET_MS, `the first render came ${ms} ms after navigation; the budget is ${BOOT_BUDGET_MS} ms`);
});

flow('phone viewport 390 px has no horizontal scroll', {}, async ({ page }) => {
  for (const r of [...TABS, 'sos', 'settings']) {
    await F.go(page, '#/' + r);
    const m = await page.evaluate(() => ({ w: window.innerWidth, sw: document.documentElement.scrollWidth }));
    assert.equal(m.w, 390, 'viewport width');
    assert.ok(m.sw <= m.w, `#/${r}: page is ${m.sw} px wide at a 390 px viewport`);
  }
  await F.go(page, '#/today');
  const box = await page.locator(HOOKS.sosBtn).boundingBox();
  assert.ok(box && box.width >= 44 && box.height >= 44, 'the SOS button is at least 44 x 44 px');
});

flow('five tabs navigate by hash and back works', {}, async ({ page }) => {
  const order = ['learn', 'workbook', 'track', 'actions', 'today'];
  for (const k of order) {
    await page.locator(HOOKS.tab(k)).click();
    await F.waitRoute(page, k);
    assert.equal(await page.locator(HOOKS.tab(k)).getAttribute('aria-current'), 'page', `tab ${k} is current`);
    assert.match(await page.evaluate(() => location.hash), new RegExp('^#/' + k));
  }
  for (const k of ['actions', 'track', 'workbook', 'learn']) {
    await page.goBack();
    await F.waitRoute(page, k);
  }
});

/* ── onboarding and tours ── */

flow('onboarding full', { routes: ['onboarding'], globals: ['Store', 'Actions'], onboarded: false }, async ({ page }) => {
  await F.onboarding(page, { mode: 'full' });
  await F.waitFor(page, () => Store.view.list('events').some((e) => e.type === 'OnboardingCompleted'));
  assert.notEqual(await F.routeKey(page), 'onboarding');
});

flow('onboarding skip-all', { routes: ['onboarding'], globals: ['Store', 'Actions'], onboarded: false }, async ({ page }) => {
  await F.onboarding(page, { mode: 'skip' });
  assert.notEqual(await F.routeKey(page), 'onboarding');
  assert.equal(await page.evaluate(() => Store.status().hasLock), false, 'a PIN is offered, never forced (O2)');
  assert.ok(await page.locator(HOOKS.sosBtn).isVisible(), 'SOS is there after skipping');
});

async function tourRun(page, buttonName) {
  await page.evaluate(() => UI.tour.start('tour'));
  await F.need(page, HOOKS.coach + ':not([hidden])', 4000);
  for (let i = 0; i < 40; i += 1) {
    if (await page.locator(HOOKS.coach).isHidden()) return;
    const btn = page.locator(HOOKS.coach).getByRole('button', { name: buttonName }).first();
    if (!(await btn.count())) throw new F.Skip(REASON.hook(`${HOOKS.coach} button ${buttonName}`));
    await btn.click();
    await page.waitForTimeout(150);
  }
  throw new Error('the tour did not end within 40 presses');
}

const tourEvent = (page) => page.evaluate(() => Store.view.list('events')
  .filter((e) => e.type === 'TutorialCompleted' && e.payload && e.payload.id === 'tour').map((e) => !!e.payload.skipped));

flow('tour complete', { globals: ['UI.tour', 'Store'], tour: true }, async ({ page }) => {
  await tourRun(page, /^(next|done|finish|got it)\b/i);
  await F.waitFor(page, () => Store.view.list('events').some((e) => e.type === 'TutorialCompleted' && e.payload && e.payload.id === 'tour'));
  assert.deepEqual(await tourEvent(page), [false], 'one TutorialCompleted, not skipped');
});

flow('tour skip', { globals: ['UI.tour', 'Store'], tour: true }, async ({ page }) => {
  await tourRun(page, /^skip\b/i);
  await F.waitFor(page, () => Store.view.list('events').some((e) => e.type === 'TutorialCompleted' && e.payload && e.payload.id === 'tour'));
  assert.deepEqual(await tourEvent(page), [true], 'one TutorialCompleted, skipped');
});

flow('tour replay from Settings Help', { routes: ['settings'], globals: ['UI.tour'], start: '#/settings/help' }, async ({ page }) => {
  await F.click(page, HOOKS.tourReplay); // ui-settings.js:421, data-test tour-replay
  await F.need(page, HOOKS.coach + ':not([hidden])', 4000);
  // SOS is never interrupted: one tap from the running tour, and inside SOS no coach mark shows.
  await page.locator(HOOKS.sosBtn).click();
  await F.waitRoute(page, 'sos');
  assert.ok(await page.locator(HOOKS.coach).isHidden(), '#coach is hidden inside SOS');
  assert.equal(await page.locator(HOOKS.coachOverlay + ':visible').count(), 0, 'no coach overlay inside SOS');
});

/* ── SOS ── */

flow('SOS drill creates no log', { routes: ['sos'], globals: ['Store', 'Actions'], page: { clock: true } }, async ({ page }) => {
  const before = await F.exportStores(page);
  await F.go(page, '#/sos?drill=1');
  await F.need(page, HOOKS.sosDrillBanner);
  if (!(await present(page, HOOKS.sosCraving, 1500))) await F.click(page, HOOKS.sosCravingBtn);
  await F.cravingSession(page, { used: false, loop: false, start: null });
  const afterRows = await F.exportStores(page);
  assert.deepEqual(afterRows.logs, before.logs, 'the drill wrote no log');
  const known = new Set(before.events.map((e) => e.id));
  const added = afterRows.events.filter((e) => !known.has(e.id)).map((e) => e.type);
  assert.ok(added.every((x) => x === 'TutorialCompleted'), 'the drill wrote only TutorialCompleted: ' + added.join(', '));
});

flow('SOS craving flow offline with delay loop and both outcomes', { routes: ['sos'], globals: ['Store', 'Actions'], page: { clock: true } }, async ({ page }) => {
  assert.equal(await page.evaluate(() => navigator.onLine), false, 'offline');
  const logs0 = await F.count(page, 'logs');
  const sos0 = await F.events(page, 'SosCompleted');
  const slip0 = await F.events(page, 'SlipLogged');
  await F.cravingSession(page, { used: false });
  await F.waitFor(page, (n) => Store.view.list('events').filter((e) => e.type === 'SosCompleted').length >= n, sos0 + 1);
  const d1 = await F.derived(page);
  await F.cravingSession(page, { used: true });
  await F.waitFor(page, (n) => Store.view.list('events').filter((e) => e.type === 'SosCompleted').length >= n, sos0 + 2);
  await F.waitFor(page, (n) => Store.view.list('events').filter((e) => e.type === 'SlipLogged').length >= n, slip0 + 1);
  assert.ok((await F.count(page, 'logs')) >= logs0 + 2, 'two sessions logged');
  const d2 = await F.derived(page);
  if (!d1 || !d2) throw new F.Skip(REASON.global('Engine.gameState') + ' (nothing-decreases not checked; both sessions logged)');
  for (const k of Object.keys(d1)) assert.ok(d2[k] >= d1[k], `${k} never decreases after a slip (${d1[k]} -> ${d2[k]})`);
});

flow('SOS reachable and not gated before onboarding or on lock screen', { onboarded: false }, async ({ page }) => {
  const starts = ['#/today'];
  if (await routeRegistered(page, 'onboarding')) starts.push('#/onboarding');
  for (const start of starts) {
    await F.go(page, start);
    assert.ok(await page.locator(HOOKS.sosBtn).isVisible(), `SOS button visible on ${start}`);
    await page.locator(HOOKS.sosBtn).click();
    await F.waitRoute(page, 'sos');
    assert.ok(await page.locator(HOOKS.sosBtn).isHidden(), 'the SOS button hides inside SOS');
    assert.ok(await page.locator(HOOKS.coach).isHidden(), 'no coach mark inside SOS');
    await urgentOneTap(page, 'from ' + start);
  }
  const missing = await missingGlobal(page, ['Store.lock']);
  if (missing) throw new F.Skip(REASON.global(missing) + ' (the before-onboarding half passed)');
  await F.go(page, '#/today');
  await lockSet(page);
  await page.evaluate(() => Store.lock.lockNow());
  await F.waitRoute(page, 'lock');
  assert.ok(await page.locator(HOOKS.sosBtn).isVisible(), 'SOS button visible on the lock screen');
  await page.locator(HOOKS.sosBtn).click();
  await F.waitRoute(page, 'sos');
  await urgentOneTap(page, 'from the lock screen');
});

/* ── Today, Learn ── */

// The quick log is Track's "Add" (data-tour quicklog-button, ui-track.js:455): a kind, then the form. The check-in
// opens from Today's card when it shows at this hour, else from Track's kinds; the switch picks Evening.
flow('quick log and evening check-in', { globals: ['Store', 'Actions'], start: '#/track', hooks: [HOOKS.quicklogButton] }, async ({ page }) => {
  const logs0 = await F.count(page, 'logs');
  await F.click(page, HOOKS.quicklogButton);
  if (await present(page, HOOKS.logKind('craving'), 1500)) await F.click(page, HOOKS.logKind('craving'));
  if (await present(page, HOOKS.quicklogIntensity, 1500)) await F.setRating(page, HOOKS.quicklogIntensity, 6);
  await F.click(page, HOOKS.quicklogSave);
  await F.waitFor(page, (n) => Store.view.count('logs') >= n, logs0 + 1);
  await F.go(page, '#/today');
  if (await present(page, HOOKS.todayCheckinGo, 1500)) await F.click(page, HOOKS.todayCheckinGo);
  else { await F.go(page, '#/track/log'); await F.click(page, HOOKS.logKind('checkin')); }
  await F.click(page, HOOKS.checkinEvening);
  await F.waitFor(page, () => { const f = document.querySelector('[data-test="log-checkin"]'); return !!f && f.dataset.kind === 'evening'; });
  await F.fillVisible(page);
  await F.click(page, HOOKS.checkinSave);
  await F.waitFor(page, () => Store.view.list('events').some((e) => e.type === 'CheckinCompleted' && e.payload && e.payload.kind === 'evening'));
});

/* ── the status layer: Your Harbor (#/status, today-track V-01b; hooks in helpers/hooks.mjs) ── */

// A craving quick log from Track's "Add" (the same steps as the quick log flow above).
async function quickCraving(page) {
  const logs0 = await F.count(page, 'logs');
  await F.click(page, HOOKS.quicklogButton);
  if (await present(page, HOOKS.logKind('craving'), 1500)) await F.click(page, HOOKS.logKind('craving'));
  if (await present(page, HOOKS.quicklogIntensity, 1500)) await F.setRating(page, HOOKS.quicklogIntensity, 6);
  await F.click(page, HOOKS.quicklogSave);
  await F.waitFor(page, (n) => Store.view.count('logs') >= n, logs0 + 1);
}

// [region, level] of each place: the list of places (status-place) or the scene's own places (data-place).
const levelsOf = (page, sel, attr) => page.locator(sel).evaluateAll((els, a) =>
  els.map((e) => [e.getAttribute(a), Number(e.getAttribute('data-level'))]), attr);

async function openStatus(page) {
  await F.go(page, '#/status');
  await F.waitRoute(page, 'status');
  return F.need(page, HOOKS.statusPage);
}

flow('status opens from Today in one tap', { routes: ['status'], hooks: [HOOKS.todayStatus] }, async ({ page }) => {
  await F.click(page, HOOKS.todayStatus);
  await F.waitRoute(page, 'status');
  const root = await F.need(page, HOOKS.statusPage);
  assert.ok(await root.isVisible(), 'Your Harbor shows after one tap on Today');
  assert.ok(await page.locator(HOOKS.sosBtn).isVisible(), 'the SOS button stays on the status page');
  assert.ok(await present(page, HOOKS.statusSos, 1500), 'the status page has its own SOS link');
  assert.equal(await page.locator(HOOKS.statusSos).first().getAttribute('href'), '#/sos', 'its SOS link opens SOS');
});

flow('status shows the change after a quick log', { routes: ['status'], globals: ['Store', 'Actions'], hooks: [HOOKS.todayStatus] }, async ({ page }) => {
  await openStatus(page); // the first look sets the base: "Here is where you stand."
  await F.go(page, '#/track');
  await quickCraving(page);
  await openStatus(page);
  await F.need(page, HOOKS.statusChangeItem, 4000);
  const kinds = await page.locator(HOOKS.statusChangeItem).evaluateAll((els) => els.map((e) => e.getAttribute('data-kind')));
  assert.ok(kinds.length >= 1 && kinds.every(Boolean), 'What just changed lists the change, each with its kind: ' + kinds.join(', '));
});

flow('status: a slip lowers no light', { routes: ['status', 'sos'], globals: ['Store', 'Actions'], page: { clock: true } }, async ({ page }) => {
  // The O6 sample has no SkillUsed: a craving session that helped logs one (the wave tool), so a place has light.
  const used0 = await F.events(page, 'SkillUsed');
  await F.cravingSession(page, { used: false, loop: false });
  await F.waitFor(page, (n) => Store.view.list('events').filter((e) => e.type === 'SkillUsed').length >= n, used0 + 1);
  await openStatus(page);
  await F.need(page, HOOKS.statusPlace);
  const places0 = await levelsOf(page, HOOKS.statusPlace, 'data-region');
  const scene0 = await levelsOf(page, `${HOOKS.statusScene} ${HOOKS.harborPlace}`, 'data-place');
  assert.ok(places0.length > 0, 'the status page lists its places');
  // C3: a place must have light before the slip, or "never lowers" could not fail.
  assert.ok(places0.some(([, lv]) => lv > 0), 'a status-place has light before the slip: ' + JSON.stringify(places0));
  assert.ok(scene0.some(([, lv]) => lv > 0), 'a scene place has light before the slip: ' + JSON.stringify(scene0));
  const slip0 = await F.events(page, 'SlipLogged');
  await F.cravingSession(page, { used: true, loop: false });
  await F.waitFor(page, (n) => Store.view.list('events').filter((e) => e.type === 'SlipLogged').length >= n, slip0 + 1);
  await openStatus(page);
  await F.need(page, HOOKS.statusPlace);
  const places1 = new Map(await levelsOf(page, HOOKS.statusPlace, 'data-region'));
  const scene1 = new Map(await levelsOf(page, `${HOOKS.statusScene} ${HOOKS.harborPlace}`, 'data-place'));
  for (const [id, lv] of places0) assert.ok((places1.get(id) ?? -1) >= lv, `status-place ${id} never lowers after a slip (${lv} -> ${places1.get(id)})`);
  for (const [id, lv] of scene0) assert.ok((scene1.get(id) ?? -1) >= lv, `scene place ${id} never lowers after a slip (${lv} -> ${scene1.get(id)})`);
});

flow('status under reduced motion has no moving class', { routes: ['status'], globals: ['Store', 'Actions'], hooks: [HOOKS.todayStatus], page: { reducedMotion: 'reduce' } }, async ({ page }) => {
  assert.equal(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), true, 'the context asks for reduced motion');
  await openStatus(page);
  await F.go(page, '#/track');
  await quickCraving(page); // a change, so a place could grow
  await openStatus(page);
  await page.waitForTimeout(400);
  // C4: the scene must be drawn, and drawn still, or "no moving class" could pass with no scene at all.
  const scene = `${HOOKS.statusScene} ${HOOKS.harborScene}`;
  assert.ok(await present(page, scene, 4000), 'the status page draws the Harbor scene');
  assert.equal(await page.locator(`${scene}${HOOKS.harborStill}`).count(), 1, 'the scene is drawn still (hb-still) under reduced motion');
  const moving = await page.locator(`${HOOKS.harborGrew}, ${HOOKS.harborMoving}, main#main [class*="pulse"]`).count();
  assert.equal(moving, 0, 'no hb-grew, hb-moving or pulse class under reduced motion');
  const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
  assert.equal(running, 0, 'nothing on the status page animates under reduced motion');
});

flow('lesson to artifact shown in SOS', { routes: ['exercise', 'sos'], globals: ['Store', 'Actions', 'Content.exercises'] }, async ({ page }) => {
  const pick = await page.evaluate(() => {
    const all = Array.isArray(Content.exercises) ? Content.exercises : Object.values(Content.exercises);
    const x = all.find((e) => e && (e.artifact === 'reasons' || /reason/i.test(String(e.id || ''))));
    if (!x) return null;
    const lessons = Array.isArray(Content.lessons) ? Content.lessons : Object.values(Content.lessons || {});
    const from = lessons.find((l) => l && JSON.stringify(l).includes('"' + x.id + '"'));
    return { id: x.id, from: from ? from.id : '' };
  });
  if (!pick) throw new F.Skip('no reasons exercise in Content.exercises');
  const reason = 'Sample reason for the test: mornings with a clear head';
  await F.go(page, `#/exercise/${pick.id}?mode=tutorial${pick.from ? '&from=' + pick.from : ''}`);
  const field = await F.need(page, HOOKS.exerciseField, 4000);
  await field.fill(reason);
  const r0 = await F.count(page, 'responses');
  await F.click(page, HOOKS.exerciseSave);
  await F.waitFor(page, (n) => Store.view.count('responses') >= n, r0 + 1);
  await F.go(page, '#/sos/craving');
  await F.need(page, HOOKS.sosCraving);
  // The craving flow asks how strong it is first (as F.cravingSession does): rate it, then the tools show.
  if (await present(page, HOOKS.sosRating, 800)) await F.setRating(page, HOOKS.sosRating, 7);
  await F.click(page, HOOKS.sosTool('why'));
  await F.waitFor(page, (txt) => document.getElementById('main').textContent.includes(txt), reason, 5000);
});

/* ── R-O-6: the daily objectives, the run, the quest-line (V-45; PLAN-V3.md section 7; hooks: today-track V-43) ── */

// The run line on Today: days shown up now, the best run and the total (Engine.run; never the sober-day counters).
async function runNums(page) {
  await F.go(page, '#/today');
  await F.need(page, HOOKS.runLine, 4000);
  const n = (sel) => page.locator(`${HOOKS.runLine} ${sel} strong`).first().textContent().then((x) => Number(String(x).trim()));
  return { current: await n(HOOKS.runCurrent), best: await n(HOOKS.runBest), total: await n(HOOKS.runTotal) };
}

// The page's own local date (by the page clock), as YYYY-MM-DD.
const pageDay = (page) => page.evaluate(() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
});

// A Monday and the Tuesday after it (session one), then the Sunday of that week (session two): four days missed,
// more than the one grace day a week, so the run breaks.
const RUN_DAYS = { mon: '2026-11-02T10:00:00+05:30', tue: '2026-11-03T10:00:00+05:30', sun: '2026-11-08T10:00:00+05:30' };

// Where a quest-line reward opens when Content.features gives it no route (the routes of the screens it names).
const FEATURE_AT = {
  network: '#/workbook/network', workbook: '#/workbook', insights: '#/track/insights', weeklyReview: '#/actions/review',
  planner: '#/actions/planner', radar: '#/track/radar', practices: '#/practice', predictions: '#/actions/predictions',
};

flow('an objective done grows the harbor', { routes: ['status'], globals: ['Store', 'Actions.objective.done', 'Content.objectives', 'Engine.dailyObjectives'], hooks: [HOOKS.objectiveDone] }, async ({ page }) => {
  await openStatus(page);
  const n0 = await page.locator(HOOKS.statusGrowthItem).count();
  await F.go(page, '#/today');
  // A tap objective first (doneBy 'tap'); any objective with its Done button otherwise.
  const id = await page.evaluate(({ row, done }) => {
    const tap = new Set((Array.isArray(Content.objectives) ? Content.objectives : []).filter((o) => o && o.doneBy === 'tap').map((o) => o.id));
    const open = Array.from(document.querySelectorAll(row)).filter((li) => li.getAttribute('data-done') !== 'true' && li.querySelector(done));
    const pick = open.find((li) => tap.has(li.getAttribute('data-id'))) || open[0];
    return pick ? pick.getAttribute('data-id') : null;
  }, { row: HOOKS.objective, done: HOOKS.objectiveDone });
  if (!id) throw new F.Skip(REASON.hook(HOOKS.objectiveDone));
  const done0 = await F.events(page, 'ObjectiveDone');
  await F.click(page, `${HOOKS.objective}[data-id="${id}"] ${HOOKS.objectiveDone}`);
  await F.waitFor(page, (n) => Store.view.list('events').filter((e) => e.type === 'ObjectiveDone').length >= n, done0 + 1);
  await F.go(page, '#/today');
  assert.equal(await page.locator(`${HOOKS.objective}[data-id="${id}"]`).first().getAttribute('data-done'), 'true', `objective ${id} shows as done on Today`);
  await openStatus(page);
  await F.need(page, HOOKS.statusGrowthItem, 4000);
  const kinds = await page.locator(HOOKS.statusGrowthItem).evaluateAll((els) => els.map((e) => e.getAttribute('data-kind')));
  assert.equal(kinds.length, n0 + 1, `one objective day adds one growth item on #/status (${n0} -> ${kinds.length})`);
  assert.ok(kinds.every(Boolean), 'each growth item names its kind: ' + kinds.join(', '));
});

flow('a break keeps best and total', { routes: ['track'], globals: ['Store', 'Actions', 'Engine.run'], page: { clock: { time: new Date(RUN_DAYS.mon) } } }, async ({ page }) => {
  // Session one: a quick log on the Monday and on the Tuesday (days shown up; never a claimed sober day).
  await F.go(page, '#/track');
  await quickCraving(page);
  await page.clock.setSystemTime(new Date(RUN_DAYS.tue));
  await F.go(page, '#/track');
  await quickCraving(page);
  const one = await runNums(page);
  assert.ok(one.current >= 2 && one.best >= 2 && one.total >= 2, 'two days in a row make a run of two: ' + JSON.stringify(one));
  // Session two, on the Sunday: the page opens again after four missed days.
  await page.clock.setSystemTime(new Date(RUN_DAYS.sun));
  await page.reload();
  await ready(page);
  if ((await pageDay(page)) !== '2026-11-08') await page.clock.setSystemTime(new Date(RUN_DAYS.sun));
  assert.equal(await pageDay(page), '2026-11-08', 'the second session runs on its own date by the page clock');
  const gap = await runNums(page);
  assert.ok(gap.best >= one.best, `the best run never drops after missed days (${one.best} -> ${gap.best})`);
  assert.ok(gap.total >= one.total, `the total never drops after missed days (${one.total} -> ${gap.total})`);
  await F.go(page, '#/track');
  await quickCraving(page);
  const two = await runNums(page);
  assert.ok(two.best >= one.best, `the best run is kept after the break (${one.best} -> ${two.best})`);
  assert.ok(two.total > one.total, `the day back adds to the total (${one.total} -> ${two.total})`);
  assert.equal(two.current, 1, 'a new run starts on the day back');
  assert.ok(await present(page, `${HOOKS.runLine} ${HOOKS.runBack}`, 2000), 'the run line says you came back');
});

flow('a quest-line step unlocks a feature', { routes: ['sos'], globals: ['Store', 'Actions.questLine.claim', 'Content.questLine', 'Engine.questLine', 'Engine.unlocked'], page: { clock: true } }, async ({ page }) => {
  const step = await page.evaluate(() => {
    const s = Engine.questLine(Store.view, new Date()).current;
    return s ? { id: s.id, reward: s.reward, cond: s.condition || {}, had: Engine.unlocked(Store.view).has(s.reward) } : null;
  });
  if (!step) throw new F.Skip('no current quest-line step');
  // V-42's first step is the SOS drill (TutorialCompleted {id: 'drill'}); another first step is driven by no flow yet.
  const isDrill = step.cond.event === 'TutorialCompleted' && step.cond.where && step.cond.where.id === 'drill';
  if (!isDrill) throw new F.Skip(`the first quest-line step ${step.id} is not the SOS drill`);
  assert.equal(step.had, false, `the reward ${step.reward} is not open before its step is claimed`);
  await F.go(page, '#/sos?drill=1');
  await F.need(page, HOOKS.sosDrillBanner);
  if (!(await present(page, HOOKS.sosCraving, 1500))) await F.click(page, HOOKS.sosCravingBtn);
  await F.cravingSession(page, { used: false, loop: false, start: null });
  await F.go(page, '#/today');
  await F.need(page, `${HOOKS.questlineCard} ${HOOKS.questlineStep}[data-id="${step.id}"]`, 4000);
  await F.click(page, `${HOOKS.questlineCard} ${HOOKS.questlineClaim}`);
  await F.waitFor(page, (f) => Store.view.list('events').some((e) => e.type === 'FeatureUnlocked' && e.payload && e.payload.feature === f), step.reward);
  assert.ok(await page.locator(HOOKS.sosBtn).isVisible(), 'the SOS button stays visible after a claim');
  const after = await page.evaluate((s) => ({
    open: Engine.unlocked(Store.view).has(s.reward),
    state: (Engine.questLine(Store.view, new Date()).steps.find((x) => x.id === s.id) || {}).state,
    route: (Content.features && Content.features[s.reward] && Content.features[s.reward].route) || '',
  }), step);
  assert.equal(after.open, true, `Engine.unlocked has ${step.reward} after the claim`);
  assert.equal(after.state, 'done', `step ${step.id} is done after the claim`);
  const route = after.route || FEATURE_AT[step.reward];
  if (!route) throw new F.Skip(`no route known for feature ${step.reward}`);
  const seg = route.replace(/^#\//, '').split(/[/?]/)[0];
  if (!(await routeRegistered(page, seg))) throw new F.Skip(REASON.route(seg));
  await F.go(page, route);
  await F.waitRoute(page, seg);
  assert.equal(await page.locator('main#main [data-test$="-locked"]:visible').count(), 0, `${route} opens, not a locked page`);
  assert.ok(((await page.locator('main#main').textContent()) || '').trim().length > 0, `${route} draws its page`);
});

/* ── Lock, data ── */

flow('PIN set lock unlock export', { globals: ['Store.lock'] }, async ({ page }) => {
  await lockSet(page);
  await page.evaluate(() => Store.lock.lockNow());
  await F.waitRoute(page, 'lock');
  assert.ok(await page.locator(HOOKS.nav).isHidden(), 'the tabs hide while locked');
  await page.reload();
  await ready(page);
  await F.waitRoute(page, 'lock');
  assert.equal(await page.evaluate(() => Store.status().locked), true, 'still locked after a reload');
  await F.unlockWith(page, '0000');
  await page.waitForTimeout(1500);
  assert.equal(await F.routeKey(page), 'lock', 'a wrong PIN does not unlock');
  await F.unlockWith(page, F.TEST_PIN);
  await F.waitRoute(page, 'today', 20000);
  assert.equal(await page.evaluate(() => Store.status().locked), false, 'unlocked');
  if (!(await routeRegistered(page, 'settings'))) throw new F.Skip(REASON.route('settings') + ' (set, lock, reload and unlock passed)');
  await F.go(page, '#/settings/data');
  if (!(await present(page, HOOKS.settingsExport, 2500))) throw new F.Skip(REASON.hook(HOOKS.settingsExport) + ' (set, lock, reload and unlock passed)');
  const download = page.waitForEvent('download', { timeout: 20000 });
  await F.click(page, HOOKS.settingsExport);
  const prompt = await F.need(page, HOOKS.pinPrompt, 4000); // the export asks the PIN first
  await prompt.fill(F.TEST_PIN);
  await F.click(page, HOOKS.dialogConfirm);
  assert.match((await download).suggestedFilename(), /\.json$/);
});

// Settings > Privacy by its own buttons (ui-settings.js:314 set-pin, :327 remove-pin, the sheet's pin-* and pin-save).
// Each PIN check derives a key (PBKDF2, store.js ITERATIONS) and a wrong one then waits (store.js refused), and the sheet
// drops a tap while its check runs (ui-settings.js:230): so the flow waits for the "wrong PIN" line before the right
// PIN, and gives every check PIN_MS on a busy machine (C1: a fixed 800 ms lost the second tap in full runs).
const PIN_MS = 20000;
const pinErrorShown = (sel) => Array.from(document.querySelectorAll(sel)).some((e) => !e.hidden && e.textContent.trim() !== '');
flow('Settings PIN set and remove', { routes: ['settings'], globals: ['Store.lock'], start: '#/settings/privacy' }, async ({ page }) => {
  assert.equal(await page.evaluate(() => Store.status().hasLock), false, 'no PIN at the start');
  await F.click(page, HOOKS.setPin);
  await (await F.need(page, HOOKS.pinInput, 4000)).fill(F.TEST_PIN);
  await (await F.need(page, HOOKS.pinInput2)).fill(F.TEST_PIN);
  await F.click(page, HOOKS.pinSave);
  await F.waitFor(page, () => Store.status().hasLock === true, undefined, PIN_MS);
  assert.equal(await page.evaluate(() => Store.status().locked), false, 'setting a PIN does not lock the open notebook');
  await F.go(page, '#/settings/privacy');
  await F.click(page, HOOKS.removePin);
  const wrong = await F.need(page, HOOKS.pinInput, 4000);
  await wrong.fill('0000');
  await F.click(page, HOOKS.pinSave);
  await F.waitFor(page, pinErrorShown, HOOKS.pinError, PIN_MS);
  assert.equal(await page.evaluate(() => Store.status().hasLock), true, 'a wrong PIN does not remove the lock');
  await (await F.need(page, HOOKS.pinInput)).fill(F.TEST_PIN);
  await F.click(page, HOOKS.pinSave);
  await F.waitFor(page, () => Store.status().hasLock === false, undefined, PIN_MS);
  await F.go(page, '#/settings/privacy');
  await F.need(page, HOOKS.setPin);
});

// Actions > Planner by its own buttons (ui-actions.js:378 actions-open-planner, :416 planner-add-btn, the form, :507 planner-save).
flow('planner add and save', { routes: ['actions'], globals: ['Store', 'Actions'], start: '#/actions' }, async ({ page }) => {
  await F.click(page, HOOKS.actionsOpen('planner'));
  await F.need(page, HOOKS.planner, 4000);
  const blocks0 = await page.locator(HOOKS.plannerBlock).count();
  const plans0 = await F.count(page, 'plans');
  await F.click(page, HOOKS.plannerAdd);
  await (await F.need(page, HOOKS.plannerTitle)).fill('Sample walk for the test');
  await (await F.need(page, HOOKS.plannerStart)).fill('10:00');
  await (await F.need(page, HOOKS.plannerEnd)).fill('10:30');
  await F.click(page, HOOKS.plannerSave);
  await F.waitFor(page, (n) => Store.view.count('plans') >= n, plans0 + 1);
  assert.equal(await F.visible(page, HOOKS.plannerError), false, 'no form error');
  await F.go(page, '#/today');
  await F.go(page, '#/actions/planner');
  await F.need(page, HOOKS.plannerBlock, 4000);
  assert.ok((await page.locator(HOOKS.plannerBlock).count()) >= blocks0 + 1, 'the block shows on the day after leaving and coming back');
});

flow('discreet lock screen shows Notebook and Help', { globals: ['Store.lock', 'UI.applyDiscreet'] }, async ({ page }) => {
  await lockSet(page);
  await page.evaluate(async () => {
    if (typeof Actions !== 'undefined' && Actions.settings && typeof Actions.settings.patch === 'function') await Actions.settings.patch({ discreet: true });
    else await Store.commit('discreet on', (d) => { d.put('settings', Object.assign({}, d.get('settings', 'app') || {}, { key: 'app', discreet: true })); });
    UI.applyDiscreet(true);
    Store.lock.lockNow();
  });
  for (const when of ['locked', 'after a reload']) {
    if (when !== 'locked') { await page.reload(); await ready(page); }
    await F.waitRoute(page, 'lock');
    assert.equal(await textOf(page, HOOKS.appName), 'Notebook', `app name ${when}`);
    assert.equal(await page.title(), 'Notebook', `title ${when}`);
    assert.equal(await textOf(page, HOOKS.sosBtn), 'Help', `SOS label ${when}`);
  }
});

flow('export erase import restores everything', { routes: ['settings'], globals: ['Store', 'Actions'], start: '#/settings/data' }, async ({ page }) => {
  await page.evaluate(async () => {
    if (typeof Actions.loadSample === 'function') { try { await Actions.loadSample(); return; } catch (e) { /* no sample content yet */ } }
    await Actions.logCraving({ intensity: 4, triggerIds: [], feelings: [], skills: [] });
  });
  const before = await F.exportStores(page);
  assert.ok(before.logs.length > 0, 'sample rows exist');
  await F.go(page, '#/settings/data');
  const download = page.waitForEvent('download', { timeout: 20000 });
  await F.click(page, HOOKS.settingsExport);
  const file = await (await download).path();
  await F.click(page, HOOKS.settingsErase);
  await F.click(page, HOOKS.dialogConfirm);
  await F.waitFor(page, () => Store.view.count('logs') === 0 && Store.view.count('events') === 0);
  const imp = await F.need(page, HOOKS.settingsImport);
  if (await imp.evaluate((el) => el.tagName === 'INPUT' && el.type === 'file')) await imp.setInputFiles(file);
  else {
    const chooser = page.waitForEvent('filechooser', { timeout: 10000 });
    await imp.click();
    await (await chooser).setFiles(file);
  }
  if (await present(page, HOOKS.dialogConfirm, 1500)) await F.click(page, HOOKS.dialogConfirm);
  await F.waitFor(page, (n) => Store.view.count('logs') === n, before.logs.length, 15000);
  const afterRows = await F.exportStores(page);
  const byId = (rows) => [...(rows || [])].sort((a, b) => String(a.id ?? a.key).localeCompare(String(b.id ?? b.key)));
  for (const s of Object.keys(before)) if (s !== 'meta') assert.deepEqual(byId(afterRows[s]), byId(before[s]), `store ${s} restored`);
});

/* ── Look, print, saved label ── */

flow('dark theme applies and persists', {}, async ({ page }) => {
  const theme = () => page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  assert.equal(await theme(), 'light', 'a light system starts light');
  const light = await bg();
  await page.locator(HOOKS.themeBtn).click();
  assert.equal(await theme(), 'dark');
  assert.notEqual(await bg(), light, 'the dark palette paints the page');
  await page.reload();
  await ready(page);
  assert.equal(await theme(), 'dark', 'dark persists after a reload');
  await page.locator(HOOKS.themeBtn).click();
  await page.reload();
  await ready(page);
  assert.equal(await theme(), 'light', 'light persists after a reload');
});

flow('print view of the plan', { routes: ['workbook'], start: '#/workbook/plan', hooks: [HOOKS.planPrint] }, async ({ page }) => {
  await F.click(page, HOOKS.planPrint);
  await F.waitFor(page, () => window.__printed > 0 && document.getElementById('print-root').childElementCount > 0);
  await page.emulateMedia({ media: 'print' });
  const shown = await page.evaluate(() => ({
    root: getComputedStyle(document.getElementById('print-root')).display !== 'none',
    app: getComputedStyle(document.getElementById('app')).display === 'none',
  }));
  await page.emulateMedia({ media: 'screen' });
  assert.deepEqual(shown, { root: true, app: true }, 'print shows only the plan');
});

flow('saved label is always shown', {}, async ({ page }) => {
  for (const r of [...TABS, 'sos', 'settings']) {
    await F.go(page, '#/' + r);
    assert.ok(await page.locator(HOOKS.savedLabel).isVisible(), `saved label visible on #/${r}`);
    assert.match(await textOf(page, HOOKS.savedLabel), /^(Saved on this device|Saved \(fallback\)|Not saved)/, `saved label text on #/${r}`);
  }
});

/* ── offline-v3.2 (FIX-TD-V32) ── */

// T1: core's ES1 (styles.css:360) keeps the crisis line of shell.html:26 off the first paint of a discreet start. The probe goes in
// before any page script: it samples the line's display on every DOM change until the line is gone. The flag is read by the
// head's own script (build.mjs THEME_SCRIPT). The control proves the probe samples at all, so the flow cannot pass by never sampling.
const bootProbe = (sel) => {
  const probe = { samples: [], seen: false, gone: false };
  window.__bootLineProbe = probe;
  const obs = new MutationObserver(() => {
    if (probe.gone) return;
    const el = document.querySelector(sel);
    if (el) { probe.seen = true; probe.samples.push(getComputedStyle(el).display); }
    else if (probe.seen) { probe.gone = true; obs.disconnect(); }
  });
  obs.observe(document, { childList: true, subtree: true, attributes: true });
};
// The flag goes in by an init script too, in the new document before the head's script reads it: a write from the old page
// before the reload can lose to the app's own settle (the first load's applyDiscreet) or reach the new document late. Init
// scripts run in the order they were added, so the control's removal runs after the discreet case's write.
async function bootSamples(page, discreet) {
  await page.addInitScript((on) => {
    if (on) localStorage.setItem('1-addic:discreet', '1'); else localStorage.removeItem('1-addic:discreet');
  }, discreet);
  await page.reload();
  await ready(page);
  await F.waitFor(page, () => window.__bootLineProbe && window.__bootLineProbe.gone === true);
  return page.evaluate(() => window.__bootLineProbe.samples);
}
flow('discreet start shows no emergency line while the app loads', {}, async ({ page }) => {
  await page.addInitScript(bootProbe, HOOKS.bootLine);
  const hidden = await bootSamples(page, true);
  assert.ok(hidden.length >= 1, 'discreet: the line was sampled at least once');
  assert.deepEqual([...new Set(hidden)], ['none'], 'discreet: every sample of the line is display none');
  const control = await bootSamples(page, false);
  assert.ok(control.some((d) => d !== 'none'), `control: without the flag the line is painted (samples: ${control.join(',') || 'none'})`);
});

// T2: V-20's toasts (ui-learn.js:543 and :619). The text of the toast shown is what counts. A CheckpointCompleted earns once per
// module (ui-learn.js:615), so the second finish has no XP in its words. Each toast stays 4.5 s (ui-core.js:163): the second finish waits for the
// first to go, so the check of its words cannot read the first one's.
const toastSaid = (page, text) => F.waitFor(page, ({ sel, want }) => Array.from(document.querySelectorAll(sel)).some((el) => el.textContent.trim() === want), { sel: HOOKS.toast, want: text }, 6000);
const toastsNow = (page) => page.evaluate((sel) => Array.from(document.querySelectorAll(sel)).map((el) => el.textContent.trim()), HOOKS.toast);
async function answerCheckpoint(page, moduleId) {
  await F.go(page, `#/learn/${moduleId}?checkpoint=1`);
  await F.need(page, HOOKS.checkpointPage, 4000);
  for (let n = 1; n <= 2; n += 1) {
    if (await present(page, HOOKS.checkpointQ(n), 300)) await F.click(page, HOOKS.checkpointOpt(n, 0));
  }
  await F.click(page, HOOKS.checkpointFinish);
}
flow('finishing a lesson and a checkpoint says +10 XP once', { routes: ['lesson', 'learn'], globals: ['Store', 'Actions.completeLesson', 'Actions.checkpoint', 'Content.modules'] }, async ({ page }) => {
  const first = await page.evaluate(() => {
    const m = Content.modules.find((x) => x && x.id && Array.isArray(x.lessons) && x.lessons.length);
    return m ? { moduleId: m.id, lessonId: m.lessons[0].id } : null;
  });
  if (!first) throw new F.Skip('no module with lessons in Content.modules');
  await F.go(page, `#/lesson/${first.lessonId}`);
  await F.need(page, HOOKS.lessonNext, 4000);
  for (let i = 0; i < 30 && !(await F.visible(page, HOOKS.lessonFinish)); i += 1) await F.click(page, HOOKS.lessonNext);
  await F.click(page, HOOKS.lessonFinish);
  await toastSaid(page, 'Lesson done. +10 XP');

  await answerCheckpoint(page, first.moduleId);
  await toastSaid(page, 'Checkpoint saved. +10 XP');
  await F.need(page, HOOKS.modulePage, 4000); // the page moved on (ui-learn.js:620)
  await F.waitFor(page, (sel) => document.querySelectorAll(sel).length === 0, HOOKS.toast, 8000);

  await answerCheckpoint(page, first.moduleId);
  await toastSaid(page, 'Checkpoint saved.');
  const said = await toastsNow(page);
  assert.ok(!said.some((t) => t.includes('+10 XP')), `a second checkpoint says no XP (shown: ${said.join(' | ')})`);
});

// T3: the SOBER practice opened from the lock page (ui-onboarding.js:270-275, EC1, ESR1). It holds the craving route while it is open
// (matched by path: the route may carry a query), SOS is one tap from it, and Done comes back to the lock page or on to Today.
const onCravingPath = (page) => page.evaluate(() => location.hash.startsWith('#/sos/craving'));
async function toLock(page) {
  await page.evaluate(() => (Store.status().locked ? null : Store.lock.lockNow()));
  await F.go(page, '#/lock');
  await F.waitRoute(page, 'lock');
  await F.need(page, HOOKS.lockPage, 4000);
}
async function openSober(page, where) {
  await toLock(page);
  await F.click(page, HOOKS.lockSober);
  assert.ok(await F.visible(page, HOOKS.sosTitle), `the practice's heading shows (${where})`);
  assert.ok(await page.locator(HOOKS.sosBtn).isVisible(), `the SOS button is visible over the practice (${where})`);
  assert.ok(await onCravingPath(page), `the practice holds the craving route (${where})`);
}
async function tapSoberDone(page) {
  for (let i = 0; i < 20 && !(await F.visible(page, HOOKS.sosStepDone)); i += 1) await F.click(page, HOOKS.sosStepNext);
  await F.click(page, HOOKS.sosStepDone);
}
flow('lock page SOBER practice stays open, SOS still works, Done comes back', { routes: ['sos'], globals: ['Store.lock', 'UI.sosSoberView'], timeout: 180000 }, async ({ page }) => {
  await lockSet(page);

  // SOS from the practice opens at once; the practice gives way.
  await openSober(page, 'first open');
  await page.locator(HOOKS.sosBtn).click();
  await F.waitRoute(page, 'sos', 4000);
  // A failure, never a skip: this flow needs the sos route, so a missing button here is urgent help gone (C1).
  assert.ok(await present(page, HOOKS.sosUrgentBtn, 2500), 'urgent help must be one tap from SOS, opened from the practice on the lock page');
  await page.locator(HOOKS.lockPage).first().waitFor({ state: 'detached', timeout: 4000 });

  // Done comes back to a working lock page.
  await openSober(page, 'done to lock');
  await tapSoberDone(page);
  await F.waitFor(page, () => location.hash === '#/lock');
  assert.ok(await present(page, HOOKS.lockPin, 4000), 'the PIN field is back on the lock page after Done');
  const pin = page.locator(HOOKS.lockPin).first();
  assert.ok((await pin.isVisible()) && (await pin.isEnabled()), 'the PIN field is usable after Done');
  assert.ok(await page.locator(HOOKS.sosBtn).isVisible(), 'the SOS button is visible after Done');
  await F.unlockWith(page, F.TEST_PIN);
  await F.waitRoute(page, 'today', 20000);

  // The right PIN from the form while the practice is open: the practice stays, Done then goes to Today.
  await openSober(page, 'unlock while open');
  const polite = await F.need(page, HOOKS.lockOpening, 2500);
  assert.equal((await polite.textContent()).trim(), '', 'the polite line is empty before a try');
  await F.unlockWith(page, F.TEST_PIN);
  await F.waitFor(page, () => Store.status().locked === false, undefined, 20000);
  await F.waitFor(page, (sel) => document.querySelector(sel).textContent.trim() === '', HOOKS.lockOpening, 4000); // T5: empty again after the try
  assert.ok(await onCravingPath(page), 'the practice keeps the craving route after the right PIN');
  assert.ok(await F.visible(page, HOOKS.sosTitle), 'the practice stays open after the right PIN');
  await tapSoberDone(page);
  await F.waitRoute(page, 'today', 8000);
  assert.equal(await page.evaluate(() => Store.status().locked), false, 'unlocked on Today');
});
