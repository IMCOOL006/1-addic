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
