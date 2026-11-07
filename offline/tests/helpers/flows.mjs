// 1-addic · tests/helpers/flows.mjs · the drivers the 3.13 flows share (lane tests-docs).
// A flow that meets a missing hook mid-way throws Skip(reason); browser.test.mjs reports it as SKIP by name.
// Tests use a throwaway PIN and their own sample rows only; nothing here prints a PIN or a person's text.
import { HOOKS, REASON, present } from './hooks.mjs';
import { ready } from './launch.mjs';

export class Skip extends Error {}

export const TEST_PIN = '4826'; // throwaway, used only inside a fresh browser context

// Navigate by hash and wait for ui-core's next render of that route.
export async function go(page, hash) {
  await page.evaluate((h) => new Promise((resolve) => {
    const done = () => { document.removeEventListener('ui:rendered', done); resolve(); };
    document.addEventListener('ui:rendered', done);
    setTimeout(done, 5000);
    if (location.hash === h) UI.render('route'); else location.hash = h;
  }), hash);
  await page.waitForTimeout(50);
}

export const routeKey = (page) => page.evaluate(() => document.documentElement.getAttribute('data-route'));

export async function waitRoute(page, key, timeout = 8000) {
  await page.waitForFunction((k) => document.documentElement.getAttribute('data-route') === k, key, { timeout });
}

// Fails the flow by Skip when sel never appears; returns the locator otherwise.
export async function need(page, sel, ms = 2500) {
  if (!(await present(page, sel, ms))) throw new Skip(REASON.hook(sel));
  return page.locator(sel).first();
}

export async function visible(page, sel) {
  return page.locator(sel).first().isVisible().catch(() => false);
}

export async function click(page, sel) {
  const loc = await need(page, sel);
  await loc.scrollIntoViewIfNeeded().catch(() => {});
  await loc.click();
  await page.waitForTimeout(100);
}

// Until sel is visible: press the page's own Next / Continue / Start, at most tries times; Skip if it never shows.
export async function advanceUntil(page, sel, tries = 4) {
  for (let i = 0; i <= tries; i += 1) {
    if (await visible(page, sel)) return page.locator(sel).first();
    if (i === tries) break;
    const next = page.locator('main#main').getByRole('button', { name: /^(next|continue|start|go on)\b/i }).first();
    if (await next.isVisible().catch(() => false)) await next.click();
    await page.waitForTimeout(300);
  }
  throw new Skip(REASON.hook(sel));
}

// A 0-10 rating: a range or number input is filled; a group of buttons gets the one whose text is the value.
export async function setRating(page, sel, value) {
  const loc = await need(page, sel);
  const tag = await loc.evaluate((el) => el.tagName.toLowerCase());
  if (tag === 'input') { await loc.fill(String(value)); await loc.dispatchEvent('change'); return; }
  const inner = loc.locator('input[type=range], input[type=number]').first();
  if (await inner.count()) { await inner.fill(String(value)); await inner.dispatchEvent('change'); return; }
  const btn = loc.getByRole('button', { name: new RegExp('^' + value + '$') }).first();
  if (await btn.count()) { await btn.click(); return; }
  const radio = loc.getByRole('radio', { name: new RegExp('^' + value + '$') }).first();
  if (await radio.count()) { await radio.click(); return; }
  throw new Skip(REASON.hook(sel + ' value ' + value));
}

/* ── Store reads (inside the page; rows never leave the test process's memory) ── */

export const count = (page, store) => page.evaluate((s) => Store.view.count(s), store);

export const events = (page, type) =>
  page.evaluate((t) => Store.view.list('events').filter((e) => e.type === t).length, type);

export async function exportStores(page) {
  return page.evaluate(async () => (await Promise.resolve(Store.exportJson())).stores);
}

// Everything derived that must never go down (BUILD-PLAN 2: nothing ever decreases).
export async function derived(page) {
  return page.evaluate(() => {
    if (typeof Engine === 'undefined' || typeof Engine.gameState !== 'function') return null;
    const g = Engine.gameState(Store.view, new Date());
    const xp = g.xp && typeof g.xp === 'object' ? (g.xp.total ?? g.xp.xp ?? 0) : Number(g.xp) || 0;
    return { xp, total: g.counters ? g.counters.total : 0, badges: Array.isArray(g.badges) ? g.badges.length : 0 };
  });
}

export async function waitFor(page, fn, arg, timeout = 8000) {
  await page.waitForFunction(fn, arg, { timeout });
}

/* ── SOS craving (actions-sos U-10: rating, tool, re-rate, delay loop, did you use) ── */

// One craving session from #/sos/craving (or the drill's own hub). used: false = the wave passed, true = used.
export async function cravingSession(page, { used, loop = true, start = '#/sos/craving' } = {}) {
  if (start) await go(page, start);
  await need(page, HOOKS.sosCraving);
  if (await present(page, HOOKS.sosRating, 800)) await setRating(page, HOOKS.sosRating, 7);
  await useTool(page, 'wave');
  if (loop) {
    // The delay loop: still strong -> back to the tools for another 15 minutes.
    await (await advanceUntil(page, HOOKS.sosStill)).click();
    await advanceUntil(page, HOOKS.sosAnyTool);
    await useTool(page, 'distract');
  }
  if (await present(page, HOOKS.sosRating, 500) && (await visible(page, HOOKS.sosRating))) await setRating(page, HOOKS.sosRating, 3);
  if (!used) {
    await (await advanceUntil(page, HOOKS.sosPassed)).click();
    if (await present(page, HOOKS.sosUsedNo, 1200)) await (await advanceUntil(page, HOOKS.sosUsedNo)).click();
  } else {
    await (await advanceUntil(page, HOOKS.sosUsedYes)).click();
  }
  if (await present(page, HOOKS.sosFinish, 1500)) await (await advanceUntil(page, HOOKS.sosFinish)).click();
  await page.waitForTimeout(300);
}

async function useTool(page, name) {
  const sel = (await present(page, HOOKS.sosTool(name), 1500)) ? HOOKS.sosTool(name) : HOOKS.sosAnyTool;
  await (await advanceUntil(page, sel)).click();
  await page.waitForTimeout(150);
  // A tool may start the 15-minute wave timer: jump the page's clock past it.
  if (await visible(page, HOOKS.sosTimer)) {
    await page.clock.fastForward('16:00').catch(() => {});
    await page.waitForTimeout(150);
  }
}

/* ── Onboarding (actions-sos U-11: eight steps, Skip on each but the safety notice) ── */

export async function onboarding(page, { mode }) {
  await go(page, '#/onboarding');
  await need(page, HOOKS.onbStep, 4000);
  for (let i = 0; i < 24; i += 1) {
    if ((await routeKey(page)) !== 'onboarding') return i;
    if (!(await visible(page, HOOKS.sosBtn))) throw new Error('the SOS button is not visible during onboarding (step ' + (i + 1) + ')');
    if (await visible(page, HOOKS.onbSafetyOk)) { await click(page, HOOKS.onbSafetyOk); continue; }
    if (mode === 'skip' && (await visible(page, HOOKS.onbSkip))) { await click(page, HOOKS.onbSkip); continue; }
    if (await visible(page, HOOKS.onbFinish)) { await click(page, HOOKS.onbFinish); continue; }
    if (mode === 'full') await fillVisible(page);
    if (await visible(page, HOOKS.onbNext)) { await click(page, HOOKS.onbNext); continue; }
    if (await visible(page, HOOKS.onbSkip)) { await click(page, HOOKS.onbSkip); continue; }
    throw new Skip(REASON.hook(`${HOOKS.onbNext} or ${HOOKS.onbSkip} on step ${i + 1}`));
  }
  throw new Error('onboarding did not finish within 24 steps');
}

// Fills every visible empty text field of #main with sample words (sample data only).
export async function fillVisible(page, text = 'Sample entry for the test') {
  const fields = page.locator('main#main input[type=text]:visible, main#main textarea:visible');
  const n = await fields.count();
  for (let i = 0; i < n; i += 1) {
    const f = fields.nth(i);
    if (!(await f.inputValue().catch(() => 'x'))) await f.fill(text).catch(() => {});
  }
}

/* ── Lock (store.js U-04 + the lock page) ── */

export async function unlockWith(page, pin) {
  const input = await need(page, HOOKS.lockPin, 4000);
  await input.fill(pin);
  if (await present(page, HOOKS.lockUnlock, 200)) await page.locator(HOOKS.lockUnlock).first().click();
  else await input.press('Enter');
}

export { ready };
