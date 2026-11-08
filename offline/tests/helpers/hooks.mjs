// 1-addic · tests/helpers/hooks.mjs · the one place that names the DOM hooks the browser suite drives (lane tests-docs).
// Sources: tracks/CORE/contracts/core.md (ids, data-tour, a.sheet-sos, data-route), actions-sos.md (data-testid of
// SOS, lock and onboarding), learn.md (data-tour and data-test of lessons). The SCREENS hooks are read from their source (V-03; file:line on each
// entry): data-test on the SCREENS files, data-testid on ui-sos.js and ui-onboarding.js. A changed name is fixed here only.

const tid = (id) => `[data-testid="${id}"]`;
const tour = (id) => `[data-tour="${id}"]`;
const dt = (id) => `[data-test="${id}"]`; // the SCREENS files (ui-today, ui-track, ui-settings, ui-actions, ui-guidance, ui-practices)

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
  // ui-sos.js steps between a tool and the re-rating (data-testid; V-03)
  sosHelpedYes: tid('sos-helped-yes'), // ui-sos.js:675
  sosHelpedNo: tid('sos-helped-no'), // ui-sos.js:675
  sosCheckin: tid('sos-checkin'), // ui-sos.js:700 ("Check in with the craving")
  sosGuide: tid('sos-tool-guide'), // ui-sos.js:698 ("Guide me")
  sosStepNext: tid('sos-step-next'), // ui-sos.js:603
  sosStepDone: tid('sos-step-done'), // ui-sos.js:603, :620, :623
  // today-track (ui-track.js, ui-today.js; data-test)
  logKind: (k) => dt('log-kind-' + k), // ui-track.js:542 (#/track/log)
  logSave: dt('log-save'), // ui-track.js:564 (also data-tour quicklog-save)
  todayCheckinGo: dt('today-checkin-go'), // ui-today.js:313 (Today's check-in card)
  checkinEvening: dt('log-checkin-evening'), // ui-track.js:588 ('log-checkin-' + k: the check-in's Morning/Evening switch)
  checkinSave: dt('log-save'), // ui-track.js:564
  // workbook-settings (ui-settings.js; data-test, the data tab also data-testid)
  settingsPage: dt('settings-page'), // ui-settings.js:643
  settingsTab: (tab) => dt('settings-tab-' + tab), // ui-settings.js:647
  settingsMessage: dt('settings-message'), // ui-settings.js:648
  storeStatus: dt('store-status'), // ui-settings.js:311
  setPin: dt('set-pin'), // ui-settings.js:314, :326 (Set a PIN, Change PIN)
  pinInput: dt('pin-input'), // ui-settings.js:263, :284, :295 (pinField, in the sheet)
  pinInput2: dt('pin-input2'), // ui-settings.js:263
  pinCurrent: dt('pin-current'), // ui-settings.js:263
  pinSave: dt('pin-save'), // ui-settings.js:243
  removePin: dt('remove-pin'), // ui-settings.js:327
  pinError: 'form.ws-pin-form p.field-error[role="alert"]', // ui-settings.js:226 (the sheet's "wrong PIN" line; hidden until a check says no)
  lockNow: dt('lock-now'), // ui-settings.js:325
  autoLock: dt('auto-lock'), // ui-settings.js:318
  noCrypto: dt('no-crypto'), // ui-settings.js:315
  discreetToggle: dt('discreet-toggle'), // ui-settings.js:335
  theme: (v) => dt('theme-' + v), // ui-settings.js:343 (system, light, dark); the header toggle is #theme-btn
  textSize: (v) => dt('text-size-' + v), // ui-settings.js:344 (normal, large, larger)
  calmToggle: dt('calm-toggle'), // ui-settings.js:346
  contrastToggle: dt('contrast-toggle'), // ui-settings.js:347
  motionToggle: dt('motion-toggle'), // ui-settings.js:348
  countersToggle: dt('counters-toggle'), // ui-settings.js:350
  runToggle: dt('run-toggle'), // ui-settings.js:351
  tipsToggle: dt('tips-toggle'), // ui-settings.js:436
  showAllToggle: dt('show-all-toggle'), // ui-settings.js:437
  rhythmSave: dt('rhythm-save'), // ui-settings.js:398
  namesSave: dt('names-save'), // ui-settings.js:413
  tourReplay: dt('tour-replay'), // ui-settings.js:421 (Help tab)
  tourLater: dt('tour-later'), // ui-settings.js:422
  drillsLater: dt('drills-later'), // ui-settings.js:427
  earlyNotice: `${dt('early-notice')}, ${tid('early-notice')}`, // ui-settings.js:447 data-test; ui-onboarding.js:295 data-testid
  earlyNoticeOk: `${dt('early-notice-ok')}, ${tid('early-notice-dismiss')}`, // ui-settings.js:449; ui-onboarding.js:297
  version: dt('version'), // ui-settings.js:455
  importFile: dt('import-file'), // ui-settings.js:592 (also data-testid settings-import)
  backupReminder: dt('backup-reminder'), // ui-settings.js:596
  lastBackup: dt('last-backup'), // ui-settings.js:606
  exportBtn: dt('export-btn'), // ui-settings.js:608 (also data-testid settings-export)
  printLogs: dt('print-logs'), // ui-settings.js:614
  sampleCard: dt('sample-card'), // ui-settings.js:615
  sampleLoaded: dt('sample-loaded'), // ui-settings.js:616
  loadSample: dt('load-sample'), // ui-settings.js:619
  eraseSample: dt('erase-sample'), // ui-settings.js:621
  loadSampleNote: dt('load-sample-note'), // ui-settings.js:622
  eraseSampleNote: dt('erase-sample-note'), // ui-settings.js:624
  eraseAll: dt('erase-all'), // ui-settings.js:627 (also data-testid settings-erase)
  settingsExport: tid('settings-export'), // ui-settings.js:608 data-testid
  settingsErase: tid('settings-erase'), // ui-settings.js:627 data-testid
  settingsImport: tid('settings-import'), // ui-settings.js:592 data-testid
  pinPrompt: 'dialog#dialog input[type=password]',
  dialogConfirm: 'dialog#dialog button.danger, dialog#dialog button.primary',
  lockSaid: '.lock-said', // ui-core.js:775 a class on the lock fallback's alert (no hook attribute)
  // actions (ui-actions.js, ui-practices.js; data-test)
  actionsHub: dt('actions-hub'), // ui-actions.js:380
  actionsOpen: (id) => dt('actions-open-' + id), // ui-actions.js:378 (ready hub cards: actions-open-planner)
  actionsBack: dt('actions-back'), // ui-actions.js:389, :410; ui-practices.js:161, :168
  actionsToPlanner: dt('actions-to-planner'), // ui-actions.js:389 (the stub page)
  planner: dt('planner'), // ui-actions.js:400
  plannerPrev: dt('planner-prev'), // ui-actions.js:407
  plannerToday: dt('planner-today'), // ui-actions.js:408 (only on a day other than today)
  plannerNext: dt('planner-next'), // ui-actions.js:409
  plannerDate: dt('planner-date'), // ui-actions.js:412
  plannerAdd: dt('planner-add-btn'), // ui-actions.js:416 (also data-tour planner-add)
  plannerForm: dt('planner-form'), // ui-actions.js:479
  plannerTitle: dt('planner-f-title'), // ui-actions.js:464
  plannerStart: dt('planner-f-start'), // ui-actions.js:467
  plannerEnd: dt('planner-f-end'), // ui-actions.js:468
  plannerError: dt('planner-f-error'), // ui-actions.js:474
  plannerSave: dt('planner-save'), // ui-actions.js:507
  plannerBlock: dt('planner-block'), // ui-actions.js:521
  // game-tutorials (ui-guidance.js; data-test)
  coachNext: dt('coach-next'), // ui-guidance.js:396
  coachSkip: dt('coach-skip'), // ui-guidance.js:397
  coachPop: dt('coach-pop'), // ui-guidance.js:399
  jitBar: dt('jit-bar'), // ui-guidance.js:577
  jitShow: dt('jit-show'), // ui-guidance.js:575
  jitLater: dt('jit-later'), // ui-guidance.js:576
  tipCard: dt('tip-card'), // ui-guidance.js:461 (also data-tour tips-card)
  tipGotIt: dt('tip-got-it'), // ui-guidance.js:463
  explorerRing: dt('explorer-ring'), // ui-guidance.js:513 (also data-tour explorer-ring)
  explorerHide: dt('explorer-hide'), // ui-guidance.js:496
  moreTools: dt('more-tools'), // ui-guidance.js:556
  showNow: dt('show-now'), // ui-guidance.js:542
  newDot: dt('new-dot'), // ui-guidance.js:565
  // status layer (data-test; today-track V-01b, #/status; PLAN-V3.md section 3, R-H-39)
  statusPage: dt('status-page'), // ui-status.js:334, :382
  statusScene: dt('status-scene'), // ui-status.js:346 (also data-tour status-scene; absent in Calm and discreet mode)
  statusPlace: dt('status-place'), // ui-status.js:362 (data-region, data-level)
  statusChange: dt('status-change'), // ui-status.js:288 (also data-tour status-change)
  statusChangeItem: dt('status-change-item'), // ui-status.js:291 (data-kind)
  statusStand: dt('status-stand'), // ui-status.js:370
  statusDays: dt('status-days'), // ui-status.js:375 (only while day counters show)
  statusStrip: dt('status-strip'), // ui-status.js:296
  statusStripDay: dt('status-strip-day'), // ui-status.js:300 (data-date, data-active)
  statusWatch: dt('status-watch'), // ui-status.js:310 (also data-tour status-watch)
  statusWatchItem: dt('status-watch-item'), // ui-status.js:313 (data-sign, data-own)
  statusNext: dt('status-next'), // ui-status.js:377
  statusNextGo: dt('status-next-go'), // ui-status.js:379 (data-kind)
  statusBack: dt('status-back'), // ui-status.js:331
  statusSos: dt('status-sos'), // ui-status.js:332
  todayStatus: dt('today-status'), // ui-today.js:497 (also data-tour status-open)
  todayHarborGo: dt('today-harbor-go'), // ui-today.js:479 (the Harbor scene on Today, one link)
  statusOpen: tour('status-open'), // ui-today.js:497
  trackRadar: dt('track-radar'), // ui-track.js:534 (#/track/radar)
  trackRadarLink: dt('track-radar-link'), // ui-track.js:527 (Track home, once the radar is revealed)
  harborScene: dt('harbor-scene'), // ui-harbor.js:91 (the scene's svg; class hb-still or hb-moving)
  harborStill: '.hb-still', // ui-harbor.js:91 (the scene drawn without motion)
  harborPlace: '[data-place]', // ui-harbor.js:78 (data-level on each place of the scene)
  harborGrew: '.hb-grew', // ui-status.js:357 (the one-off pulse of a place that grew; never when still)
  harborMoving: '.hb-moving', // ui-harbor.js (the drifting water and beam; never when still)
  // R-O-6: the objectives, the run, the quest-line (data-test; today-track V-43 as built, READY c7145c9; R-S-26)
  objectivesCard: dt('objectives-card'), // ui-today.js:567 (also data-tour objectives-card; needs Engine.dailyObjectives items)
  objective: dt('objective'), // ui-today.js:556 (data-id, data-done)
  objectiveDone: dt('objective-done'), // ui-today.js:561 (only with Actions.objective.done, actions-sos V-41)
  objectiveSwap: dt('objective-swap'), // ui-today.js:563 (only with Actions.objective.swap, once a day)
  runLine: dt('run-line'), // ui-today.js:580 (also data-tour run-line; once Engine.run's total is above 0)
  runCurrent: dt('run-current'), // ui-today.js:582, ui-status.js:379 (the number in a strong)
  runBest: dt('run-best'), // ui-today.js:582, ui-status.js:379
  runTotal: dt('run-total'), // ui-today.js:582, ui-status.js:379
  runKept: dt('run-kept'), // ui-today.js:583, ui-status.js:380 (a grace day holding the run)
  runBack: dt('run-back'), // ui-today.js:584, ui-status.js:381 (you came back, after a break)
  questlineCard: dt('questline-card'), // ui-today.js:598 (also data-tour questline-card; needs Content.questLine, content V-42)
  questlineStep: dt('questline-step'), // ui-today.js:610 (data-state current, data-id), ui-status.js:395 (done|current|locked)
  questlineClaim: dt('questline-claim'), // ui-today.js:616 (only when the step is claimable and Actions.questLine.claim exists)
  statusGrowth: dt('status-growth'), // ui-status.js:385
  statusGrowthItem: dt('status-growth-item'), // ui-status.js:388 (data-kind; one per growth unit, never removed)
  statusGrowthLayer: dt('status-growth-layer'), // ui-harbor.js:120 (an svg g in the scene)
  statusWay: dt('status-way'), // ui-status.js:393 (the spine "Your way")
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
