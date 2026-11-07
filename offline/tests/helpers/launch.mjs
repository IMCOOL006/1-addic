// 1-addic · tests/helpers/launch.mjs · starts the browser and opens the built file offline at phone size (lane tests-docs).
// launch() -> {browser} | {reason}; newPage(browser, opts) -> {page, context, problems}; assertClean(problems) throws.
// Shared by browser.test.mjs and screens.mjs. Playwright is imported lazily, so a bare `node --test` never needs it.
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { REASON } from './hooks.mjs';

// ADDIC_HTML points the suite at another built file (the harness's own test uses it to prove the "not built" skip).
export const BUILT = process.env.ADDIC_HTML || fileURLToPath(new URL('../../1-addic.html', import.meta.url));
export const BUILT_URL = pathToFileURL(BUILT).href;
export const PHONE = { width: 390, height: 844 };
export const builtExists = () => existsSync(BUILT);

// Only the file itself and in-page data may load; anything else is a network request and fails the test.
export function isAllowedUrl(url) {
  return /^(file:|data:|blob:|about:blank)/i.test(String(url));
}

export async function launch({ headless = true } = {}) {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    return { reason: REASON.playwright };
  }
  // The installed Chrome first (the owner's machine), then Playwright's bundled Chromium (the cloud).
  for (const opts of [{ channel: 'chrome', headless }, { headless }]) {
    try {
      const browser = await chromium.launch(opts);
      return { browser, channel: opts.channel || 'chromium', version: browser.version() };
    } catch {
      // try the next one
    }
  }
  return { reason: REASON.browser };
}

// A fresh context (empty storage) per call. Offline is set before the first load: file:// still opens.
export async function newPage(browser, opts = {}) {
  const {
    offline = true, viewport = PHONE, mobile = true, colorScheme = 'light', reducedMotion = 'reduce',
    clock = false, print = true, scale = 2,
  } = opts;
  const context = await browser.newContext({
    viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: scale, serviceWorkers: 'block',
    colorScheme, reducedMotion, acceptDownloads: true, locale: 'en-IN',
  });
  const problems = { console: [], pageerror: [], requests: [] };
  await context.route('**/*', (route) => (isAllowedUrl(route.request().url()) ? route.continue() : route.abort()));
  if (offline) await context.setOffline(true);
  const page = await context.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.console.push(m.text()); });
  page.on('pageerror', (e) => problems.pageerror.push(String(e && e.message ? e.message : e)));
  page.on('request', (r) => { if (!isAllowedUrl(r.url())) problems.requests.push(r.url()); });
  if (print) {
    // window.print() would open a dialog; count the calls instead (the print view is checked by media emulation).
    await page.addInitScript(() => { window.__printed = 0; window.print = () => { window.__printed += 1; }; });
  }
  if (clock) await page.clock.install();
  return { page, context, problems };
}

// Opens the built file at a hash and waits until ui-core has rendered and the saved label has left 'Loading'.
export async function openApp(page, hash = '#/today') {
  await page.goto(BUILT_URL + hash);
  await ready(page);
}

export async function ready(page, timeout = 20000) {
  await page.waitForFunction(() => {
    const label = document.getElementById('saved-label');
    return typeof UI !== 'undefined' && document.documentElement.hasAttribute('data-route') &&
      !!label && label.textContent.trim() !== '' && label.textContent.trim() !== 'Loading';
  }, null, { timeout });
}

export function assertClean(problems) {
  const lines = [
    ...problems.console.map((x) => 'console error: ' + x),
    ...problems.pageerror.map((x) => 'page error: ' + x),
    ...problems.requests.map((x) => 'network request: ' + x),
  ];
  if (lines.length) {
    const err = new Error('the page was not clean:\n  ' + lines.join('\n  '));
    err.code = 'NOT_CLEAN';
    throw err;
  }
}
