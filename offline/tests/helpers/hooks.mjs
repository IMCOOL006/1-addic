// 1-addic · tests/helpers/hooks.mjs · the one place that names the DOM hooks the browser suite drives (lane tests-docs).
// Sources: tracks/CORE/contracts/core.md (ids, data-tour, a.sheet-sos, data-route), actions-sos.md (data-testid of
// SOS, lock and onboarding), learn.md (data-tour and data-test of lessons). Hooks marked ASSUMED have no contract yet
// (SCREENS lanes: today-track, workbook-settings, game-tutorials); when their contracts land, change them here only.

const tid = (id) => `[data-testid="${id}"]`;
const tour = (id) => `[data-tour="${id}"]`;

export const HOOKS = {
  // core.md A (shell.html, ui-core.js)
  app: '#app',
  main: 'main#main',
  appName: '#app-name',
  savedLabel: '#saved-label',
  themeBtn: '#theme-btn',
  settingsBtn: '#settings-btn',
  sosBtn: '#sos-btn',
  nav: 'nav#nav',
  tab: (name) => `#nav ${tour('nav-' + name)}`,
  dialog: 'dialog#dialog',
  sheetSos: 'a.sheet-sos',
  coach: '#coach',
  coachOverlay: '.coach-overlay',
  printRoot: '#print-root',
  // actions-sos.md (ui-sos.js, ui-onboarding.js); the lock fallback of ui-core uses #lock-pin
  sosHub: tid('sos-hub'),
  sosCraving: tid('sos-craving'),
  sosCravingBtn: tour('sos-craving'),
  sosUrgentBtn: tour('sos-urgent'),
  sosDrillBanner: tid('sos-drill-banner'),
  sosRating: tid('sos-rating'),
  sosTimer: tid('sos-timer'),
  sosTool: (t) => tid('sos-tool-' + t),
  sosAnyTool: '[data-testid^="sos-tool-"]',
  sosStill: tid('sos-reassess-still'),
  sosPassed: tid('sos-reassess-passed'),
  sosUsedYes: tid('sos-used-yes'),
  sosUsedNo: tid('sos-used-no'),
  sosFinish: tid('sos-finish'),
  telLink: 'main#main a[href^="tel:"]',
  lockPin: `${tid('lock-pin')}, #lock-pin`,
  lockUnlock: tid('lock-unlock'),
  lockUrgent: tid('lock-urgent'),
  onbStep: '[data-testid^="onb-step-"]',
  onbNext: tid('onb-next'),
  onbSkip: tid('onb-skip'),
  onbSafetyOk: tid('onb-safety-ok'),
  onbFinish: tid('onb-finish'),
  // learn.md
  exerciseSave: tour('exercise-save'),
  exerciseField: '[data-test^="fld-"] input:not([type=hidden]), [data-test^="fld-"] textarea, main#main textarea',
  // core.md D (emitted by screen lanes)
  quicklogButton: tour('quicklog-button'),
  quicklogIntensity: tour('quicklog-intensity'),
  quicklogSave: tour('quicklog-save'),
  planPrint: tour('plan-print'),
  // ASSUMED (no contract yet): today-track's evening check-in, workbook-settings' data tab, game-tutorials' replay
  checkinEvening: tid('checkin-evening'),
  checkinSave: tid('checkin-save'),
  settingsExport: tid('settings-export'),
  settingsErase: tid('settings-erase'),
  settingsImport: tid('settings-import'),
  pinPrompt: 'dialog#dialog input[type=password]',
  dialogConfirm: 'dialog#dialog button.danger, dialog#dialog button.primary',
};

// Stable skip reasons (the contract's strings; the chat reads them by name).
export const REASON = {
  env: 'ADDIC_BROWSER not set',
  built: 'offline/1-addic.html not built',
  browser: 'no Chrome or Chromium found',
  playwright: 'playwright not installed (npm install)',
  route: (seg) => `route #/${seg} not registered`,
  hook: (sel) => `hook ${sel} absent`,
  global: (name) => `global ${name} absent`,
};

// True when UI.pages[seg] is registered by some lane (ui-core's own fallbacks do not count).
export async function routeRegistered(page, seg) {
  return page.evaluate((s) => typeof UI !== 'undefined' && !!UI.pages && typeof UI.pages[s] === 'function', seg);
}

// The first missing dotted global of names (e.g. 'Store', 'UI.tour', 'Content.exercises'), or null.
export async function missingGlobal(page, names) {
  // A string expression (evaluated by the driver, outside the page's CSP; never eval inside the page): the classic
  // scripts' `const UI`, `const Store` are global lexical bindings, not window properties.
  for (const n of names) {
    if (!/^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$/.test(n)) throw new Error('bad global name ' + n);
    const ok = await page.evaluate(`(() => { try { return ${n} != null; } catch (e) { return false; } })()`);
    if (!ok) return n;
  }
  return null;
}

// Whether a selector is attached within ms.
export async function present(page, sel, ms = 1500) {
  try {
    await page.locator(sel).first().waitFor({ state: 'attached', timeout: ms });
    return true;
  } catch {
    return false;
  }
}

// A reason string when the flow's needs are missing, or false. Order: globals, routes, hooks (on the current page).
export async function skipReason(page, { routes = [], globals = [], hooks = [] } = {}) {
  const g = globals.length ? await missingGlobal(page, globals) : null;
  if (g) return REASON.global(g);
  for (const seg of routes) if (!(await routeRegistered(page, seg))) return REASON.route(seg);
  for (const sel of hooks) if (!(await present(page, sel))) return REASON.hook(sel);
  return false;
}
