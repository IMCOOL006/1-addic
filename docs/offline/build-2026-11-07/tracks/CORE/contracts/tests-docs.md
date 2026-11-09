# Contract - lane tests-docs - what it exposes and relies on (base 655516dc)

## Exposes (all new; consumers: the HUB's gates, the build chat, owners)
- npm scripts: `test:browser` = `node offline/tests/helpers/run-browser.mjs`; `screens` = `node offline/tests/screens.mjs`; `check` = `npm run build && npm test && npm run test:browser && python offline/docs/build_guide.py`. Consumer: gates.py browser gate, HUB.
- Dependency: `devDependencies.playwright` exact version (no caret), `package-lock.json`. Consumer: none yet.
- `run-browser.mjs [--grep P]`: sets ADDIC_BROWSER=1, runs `node --test --test-reporter=spec offline/tests/browser.test.mjs [--test-name-pattern P]`, exit code forwarded. Summary line from node (`ℹ tests N`).
- `helpers/launch.mjs`: `launch() -> {browser} | {reason}`; `newPage(browser, {offline=true}) -> {page, context, problems:{console[], pageerror[], requests[]}}`; `assertClean(problems)` throws on any item. Consumer: browser.test.mjs, screens.mjs.
- `helpers/hooks.mjs`: `HOOKS` selector table; `routeRegistered(page, seg)`; `skipReason(page, {route, hooks[]}) -> string|false`.
- Test names (stable; they are failure identities): see brief U-34 item 5 (18 names).
- Skip reasons (stable strings): "ADDIC_BROWSER not set", "offline/1-addic.html not built", "no Chrome or Chromium found", "route #/<seg> not registered", "hook <selector> absent".
- screens: `offline/docs/images/<slug>-desktop.png|-phone.png`, 300 DPI pHYs; final line `screens: N written, M skipped`. Consumer: the guide (U-36b).
- Docs: `offline/README.md`; `README.md`/`CLAUDE.md` `## Offline edition`; `docs/decisions/0022-offline-edition.md`; `offline/docs/1-addic-Guide.md` and `.docx` built by `python offline/docs/build_guide.py` (exit 0 = docs gate).

## Relies on (none exists at the base: offline/ holds only content-core.js and content-lessons-a.js)
From core U-01: `offline/build.mjs` writing `offline/1-addic.html` (O1), CSP meta, `package.json` with scripts.build and scripts.test (waits for core).
From core U-03 (BUILD-PLAN 3.2/3.5 text, assumed): global `UI` with `UI.pages[firstSegment]`, `UI.route()`, `UI.go(route)`; hash routes of 3.5 (`#/today #/learn #/workbook #/track #/actions #/sos #/sos/craving #/sos/feeling #/sos/slip?preview=1 #/sos/urgent #/sos?drill=1 #/settings #/settings/help #/settings/privacy #/settings/data #/onboarding #/lock`); SOS button `[data-tour="sos-button"]`; tabs `[data-tour="nav-today|nav-learn|nav-workbook|nav-track|nav-actions"]`; an always-visible saved label (assumed `[data-saved]`, text "Saved on this device" / "Not saved"; confirm); `html[data-theme="dark"]` (assumed) for dark; toast and sheet roles (`role="dialog"` for sheets, `role="status"` for toast).
From actions-sos (U-10/U-11, waits): onboarding steps with visible buttons named by text (Next, Skip, Skip all; assumed), lock screen with PIN input (`input[type=password]` or inputmode numeric) and an urgent-help control, craving flow buttons (rating, "Ride the wave", delay loop "wait", outcomes "Did you use?" yes/no), drill banner.
From today-track (U-16): quick log (+) and check-in (evening). From workbook-settings (U-19): Settings tabs (privacy PIN set, data export/import/erase, help replay tour, look theme). From learn (U-13): lesson player. From game-tutorials (U-27): tour overlay (assumed `[data-tour-overlay]` or role=dialog with a Next/Skip). From content (U-33): "Load sample data" button in Settings, data.
Export/import in tests via the data tab download (`page.waitForEvent('download')`) and file chooser.
Assumptions to confirm from tracks/*/contracts/*.md at build time; any difference goes in hooks.mjs only.

## Additions from tests-docs U-34 (310780d on build/tests-docs), written in by the CORE chat 2026-11-07 09:48 IST (nothing removed)

- Every selector the browser suite drives lives in offline/tests/helpers/hooks.mjs; a lane that lands with other hooks makes its flows SKIP 'hook X absent' (never fail): fix the selectors in hooks.mjs only, after reading the skip reasons on the merged tree.
- 19 stable test names (the 19th: 'discreet lock screen shows Notebook and Help'). Skip reasons: 'ADDIC_BROWSER not set' (run bare: all 19 skip, exit 0, Playwright never imported), 'no Chrome or Chromium found', 'global <Name> absent', 'playwright not installed (npm install)', 'route <r> not registered', 'hook X absent'. ADDIC_HTML=<path> points the browser gate at a scratch build.
- Globals are read through page.evaluate on a string expression (the CSP forbids eval in the page; `const UI`/`Store` are not window properties). Non-file requests are aborted and recorded (Chrome 157 intercepts file://).
- Hooks accepted both ways: #lock-pin (ui-core's lock fallback) and [data-testid=lock-pin] (actions-sos); learn's fld-* hooks use data-test (learn.md).
- Assumed hooks for SCREENS (until their contracts say otherwise): Requests to the SCREENS owners (today-track, workbook-settings, game-tutorials): please put these hooks in your contracts, or tell tests-docs your names. Evening check-in: [data-testid=checkin-evening] and [data-testid=checkin-save]. Settings data tab: [data-testid=settings-export], [data-testid=settings-erase] and [data-testid=settings-import]; an export with a PIN set asks for it in dialog#dialog input[type=password]. Tour: UI.tour.start('tour'), with buttons in #coach named Next/Done and Skip. Settings Help: a button whose name contains 'tour'.

## V3 (2026-11-08 02:52 IST)
Adds: hooks.mjs entries (names and attributes in briefs/tests-docs/V-03.md and V-01t.md); reachReassess(page) in flows.mjs (internal); test names "status opens from Today in one tap", "status shows the change after a quick log", "status: a slip lowers no light", "status under reduced motion has no moving class", "boots to the first render within the budget"; offline/tests/contrast.test.mjs (Node, one name per pair per theme); screens SHOTS slug status. Consumers: gates.py browser and docs gates, the HUB, the guide.
Relies on, at BASE: ui-sos.js data-testid sos-helped-yes :675, sos-checkin :700, sos-reassess-passed :709, sos-reassess-still :710; ui-track.js:452 data-tour quicklog-button (#/track only); ui-actions.js:378 actions-open-<id>, :389 actions-to-planner; ui-settings.js R-S-6 hooks (data-test); ui-guidance.js coach-*, jit-*, tip-* (data-test); ui-core.js:775 .lock-said class.
Waits for today-track V-01b: #/status (UI.pages.status), data-test status-*, today-status, today-harbor-go, data-tour status-open/status-scene/status-change/status-watch, ui-harbor data-place and hb-grew (PLAN-V3.md section 3; R-H-39 attribute data-test). Waits for core V-26a (per-part sizes) for the boot note only.

## 2026-11-08 04:15 IST · R-S-23: today-track V-01b's hooks, for V-01t (after V-01b merges)

- data-test (live on build/today-track at da9bb6b, not on the trunk yet): status-change, status-change-item[data-kind], status-strip, status-strip-day[data-date][data-active], status-watch, status-watch-item[data-sign] (with data-own on the person's own plan), today-status, today-harbor-go, track-radar (#/track/radar), track-radar-link (Track home, once the radar is revealed). data-tour: status-change, status-watch, status-open.
- V-01t adds them to hooks.mjs with file:line once the board shows V-01b merged; V-03 (running from c1058ab) does not, because the trunk has no such elements yet.
- V-01t's 'a slip lowers no light': the O6 sample has no SkillUsed events, so the test logs one before comparing data-level across a slip. Source: tracks/SCREENS/contracts/today-track-v3.md, 'V-01b as built'.

## 2026-11-08 07:10 IST · V-45's input: today-track V-43's hooks as built (R-S-26; READY c7145c9)

- All data-test (source: tracks/SCREENS/contracts/today-track-v3-annex.md, 'V-43 as built'). Today: objectives-card, objective[data-id][data-done], objective-done, objective-swap, run-line, run-current, run-best, run-total, run-kept, run-back, questline-card, questline-step[data-state][data-id], questline-claim. Your Harbor: status-growth, status-growth-item[data-kind], status-growth-layer, status-way. data-tour: objectives-card, questline-card, run-line.
- growthItems' grows is the Content.objectives element (R-C-65); the kind is grows.grows.


## V-26a's output for V-26b (2026-11-09 15:06 IST; core 561cab2)

- 2026-11-09 17:32 IST, the whole-lane review: V-26b does not read these lines and no code does at the tip (lane-reports/tests-docs.md:44); they are output for people.

- 2026-11-09 17:32 IST, the whole-lane review: V-26b does not read these lines and no code does at the tip (lane-reports/tests-docs.md:44); they are output for people.

- The format is in contracts/core.md (last section). Each part: `part <name> <bytes> B (<x.x> kB)` (regex `^part (\S+) (\d+) B \((\d+\.\d) kB\)$`); 29 parts, then shell.html, then styles.css (31 lines at 561cab2); the total line `built offline/1-addic.html <N> B (<x.x> kB), <P> parts, skipped (absent): ...` unchanged.
