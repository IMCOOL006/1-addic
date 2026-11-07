## tests-docs (CORE, 1-addic offline build): the slice report

State: READY (continued run 2026-11-07 09:53 IST: U-34, U-37, U-36a built; U-35, U-36b are tier 2, not in this run). Branch build/tests-docs, base 22c39654, tip d91164d. Worktree C:/Users/ruchi/1-addic-wt/tests-docs.
Earlier run: READY-SLICE, tip 310780d, 2026-11-07 09:30 IST.
Commits (22c39654..HEAD):
- d91164d docs(tests-docs, U-37 fix C1): the README says only what the built file does today
- b2694db docs(tests-docs, U-36a): a reproducible .docx, so the docs gate leaves the tree clean
- 8c86935 docs(tests-docs, U-36a): the guide skeleton and its .docx pipeline
- 0019a3d docs(tests-docs, U-37): docs true: offline/README.md, Offline edition sections, ADR 0022, npm run check
- 17140c7 test(tests-docs, U-34 C2): the nothing-decreases check ends in a named Skip without Engine.gameState
- 5008797 test(tests-docs, U-34 C1): a missing sos-urgent hook fails once UI.pages.sos is built
- 310780d test(tests-docs, U-34): browser harness: the 3.13 flows by name, offline at 390 px

### Turn caps
- Run 09:53: builder batch [U-37, U-36a] steps_used 36, returned a note; capHits 0. Check fix C1: done.
- Builder batch [U-34]: steps_used 31, returned a note. capHits 0.

### Units
Run 2026-11-07 09:53 IST:
- U-37 (tier 1), 0019a3d, fix d91164d. A person can read offline/README.md to build the file, copy it to a phone, open it, read the three saved labels, understand the PIN, privacy and unverified numbers; README.md and CLAUDE.md gain a "## Offline edition" section at the end; ADR docs/decisions/0022-offline-edition.md; npm run check = build, test, test:browser, docs. After check C1 the README states only what the built file does today; export, import, PIN, Settings, discreet switch are marked planned. scripts.screens waits for U-35. Closes: Q4 (check = build, test, test:browser, docs).
- U-36a (tier 1), 8c86935, b2694db. offline/docs/1-addic-Guide.md skeleton (Parts 1, 2, 4; Part 3 has 14 lesson headings marked for U-36b), build_guide.py (STRICT_IMAGES False, names a missing dependency, reproducible .docx), 1-addic-Guide.docx committed (47 KB). Docs gate leaves the tree clean.
- Also this run: U-34 follow-ups C1 5008797, C2 17140c7 (see Check).
- Held or blocked: none. Still to build: U-35 (after SCREENS tier-1 merge), U-36b (after U-35).
Earlier run:
- U-34 (tier 1), 310780d, built. For a developer: `npm run test:browser` (optionally `-- --grep <pattern>`) opens the built offline/1-addic.html from file:// in Chrome (installed channel first, bundled Chromium second), offline before first load, 390x844 mobile with touch, reduced motion, a fresh profile per test. Any console error, page error or request other than file:, data:, blob:, about:blank fails the test. Nothing changes in the app. 19 tests: 5 pass, 14 skip by named reason (Store, UI.tour, route #/workbook absent from the lane tree). Against core 98f872d, "SOS reachable and not gated..." and "discreet lock screen..." pass; the PIN flow passed set, lock, reload, wrong PIN, unlock (log C:\Users\ruchi\1-addic-wt\_logs\gates\tests-docs\browser-20261107-094330.log).
  Closes: Q1 (npm install allowed; playwright 1.65.0 exact), Q2 (no browser: skip, exit 0), Q3 (core, actions-sos, learn contracts read; SCREENS contracts absent, hooks assumed).
- Held or blocked: none.
- Still to build: U-37 (offline/README.md, ADR 0022, README and CLAUDE.md "Offline edition" sections, scripts.check); U-36a (offline/docs/build_guide.py, guide skeleton, STRICT_IMAGES False); U-35 (tier 2, after SCREENS tier-1 merge: fix ASSUMED hooks, write offline/tests/screens.mjs); U-36b (tier 2, after U-35: Part 3 counts, STRICT_IMAGES True).

### Contract changes
- Run 09:53: package.json scripts.check added (after test:browser; JSON-parsed). scripts.screens not yet (U-35). build_guide.py: GEN_DOCX=<path> overrides gen_docx.py; keep make_reproducible(). No routes, content keys or hooks added.
- npm script `test:browser` = `node offline/tests/helpers/run-browser.mjs` (sets ADDIC_BROWSER=1; --grep to --test-name-pattern; --headed to ADDIC_HEADED=1). Consumer: HUB gates.py browser gate.
- devDependencies playwright 1.65.0 exact, plus package-lock.json. Consumer: HUB.
- helpers/launch.mjs: BUILT, BUILT_URL, PHONE, builtExists(), isAllowedUrl(url), launch({headless}) -> {browser, channel, version} | {reason}, newPage(browser, {offline, viewport, mobile, colorScheme, reducedMotion, clock, print}) -> {page, context, problems}, openApp(page, hash), ready(page), assertClean(problems). Env ADDIC_HTML retargets the build. Consumer: U-35 screens.mjs.
- helpers/hooks.mjs: HOOKS (the one selector table), REASON, routeRegistered(page, seg), missingGlobal(page, names), present(page, sel, ms), skipReason(page, {routes, globals, hooks}). Consumer: U-35.
- helpers/flows.mjs: Skip, TEST_PIN, go, routeKey, waitRoute, need, visible, click, advanceUntil, setRating, count, events, exportStores, derived, waitFor, cravingSession, onboarding, fillVisible, unlockWith. Consumer: U-35.
- helpers/harness.test.mjs: 5 node tests run by the test gate.
- Test names: the brief's 18 plus "discreet lock screen shows Notebook and Help" (CORE chat request). Skip reasons: "ADDIC_BROWSER not set", "offline/1-addic.html not built", "no Chrome or Chromium found", "playwright not installed (npm install)", "route #/<seg> not registered", "hook <selector> absent", "global <Name> absent".
- No content keys, routes, UI.pages entries or data-tour targets added.

### Gates
VERIFIED (logs under C:\Users\ruchi\1-addic-wt\_logs\gates\tests-docs\):
- build GREEN (240874 B): build-20261107-094818.log
- test GREEN 5/5: test-20261107-094820.log
- guards RED, 4 pass 15 fail: guards-20261107-094826.log. All 15 are tour-target names already in baselines.md (quicklog-button/intensity/save, planner-day/gaps/add, bp-new/form, workbook-groups/card, insights-triggers/heatmap, review-start, plan-sections, plan-print); no new failure.
- browser GREEN on Chrome 157, 19 tests, 5 pass, 0 fail, 14 skip: browser-20261107-094826.log
- Territory: 8 files, 7 own, 1 shared (package.json), 0 nobody's, 0 errors, 0 warnings.
ASSUMED / SKIP:
- validate SKIP (engine.js has no validateContent yet, U-08): validate-20261107-094825.log
- docs SKIP (build_guide.py absent, U-36a): docs-20261107-094941.log
- Store, lock, SOS, onboarding, tour and data flows not run against a tree with store.js and the screen lanes; they skip by name.

### Gates, run 2026-11-07 09:53 IST (logs under C:/Users/ruchi/1-addic-wt/_logs/gates/tests-docs/)
VERIFIED:
- build GREEN 240874 B: build-20261107-101008.log
- test GREEN 5/5: test-20261107-101009.log
- guards RED 4 pass 15 fail, all 15 baselined tour-target names: guards-20261107-101014.log
- browser GREEN 5 pass 0 fail 14 skip (reasons named): browser-20261107-101014.log
- docs GREEN exit 0, 0 images missing, tree clean after rebuild: docs-20261107-101146.log
After the C1 fix: build-20261107-101718.log, test-20261107-101720.log, validate-20261107-101726.log.
ASSUMED / SKIP: validate SKIP (no validateContent, U-08): validate-20261107-101013.log. Docs gate only run on this machine (gen_docx.py local).
Territory: tests-docs 22c39654..HEAD: 15 files, 14 own, 1 shared (package.json scripts key), 0 nobody's, 0 errors, 0 warnings. README.md, CLAUDE.md changed only by the appended section.

### Review gates
None.

### Check
Verdict PASS at 310780d (evidence C:/Users/ruchi/1-addic-wt/_logs/reports/tests-docs/tests-docs__check.md). Findings, both LOW, no fix SHA yet, not re-checked:
- C1: browser.test.mjs:68-72 via flows.mjs:28-31. Once actions-sos is merged, a missing [data-tour="sos-urgent"] must fail "SOS reachable and not gated..." instead of Skip.
- C2: flows.mjs:73-81, browser.test.mjs:196. "Nothing decreases after a slip" silently drops when Engine.gameState is absent; it should end in a named Skip or fail.
Both are folded into the next tests-docs batch (U-35).

### Check, run 2026-11-07 09:53 IST
Verdict FIX at b2694db, then C1 FIXED at d91164d. Earlier C1, C2 (U-34) judged correct.
- C1 (MEDIUM, U-37), fix d91164d, finder's re-check FIXED, no new findings: offline/README.md:62 and :45 stated data-layer claims (storage, PIN, export, import, Settings) as true today. Evidence: browser-20261107-101014.log.
Not checked: C1/C2 fail paths of U-34 (no ui-sos.js, store.js here); docs gate on a cloud host; guide screen names (U-36b).

### Review
Not a flagged lane: no reviewers run.

### Safety and content marks
- Run 09:53: clinicalReview: true on the guide's 'What it is not' warning (offline/docs/1-addic-Guide.md). verify: none added. The README says every number is unverified until the owner checks it.
No content written. clinicalReview: true passages: none. verify: true resources: none.

### Requests for other lanes
- HUB (run 09:53): add the index row for 0022 in docs/decisions/README.md (not this lane's file).
- SCREENS lanes (today-track, workbook-settings, game-tutorials, learn): publish contracts with the hooks below, or tell tests-docs the real ones. Assumed: today-track data-testid checkin-evening and checkin-save; workbook-settings settings-export, settings-erase, settings-import, export PIN prompt `dialog#dialog input[type=password]`, confirm `dialog#dialog button.danger|.primary`; game-tutorials `UI.tour.start('tour')`, `#coach` buttons Next/Done/Finish/Got it and Skip, a Settings Help button whose name contains "tour"; learn: an exercise in Content.exercises with artifact 'reasons', route `#/exercise/<id>?mode=tutorial&from=<lessonId>`. Absent hooks skip as "hook X absent", so read the skip reasons after every merge.
- Core / actions-sos: keep sos-urgent, sos-*, lock-*, onb-* and data-tour nav-* names as contracted.

### Docs owed
- Run 09:53: when store.js and Settings merge, take the 'planned' marks off offline/README.md and README.md; when the SOS screen with the international list merges, rewrite the urgent-help paragraph; U-36b should do the same today/planned pass on the guide. docs/decisions/README.md needs an index row for 0022.
- offline/README.md: how to run npm run test:browser, --grep, --headed, ADDIC_HTML, the skip reasons, the Chrome requirement (U-37).
- README.md and CLAUDE.md "## Offline edition": build, test, test:browser, check commands (U-37).
- docs/decisions/0022-offline-edition.md (U-37).
- Guide Part 3: Node and browser counts (U-36b).
- CLAUDE.md line: browsers are not downloaded (PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1); the machine's Chrome is used.

### Open questions
- Run 09:53: (d) the .docx is committed and reproducible (default kept); (e) scripts.check uses `python` (default kept); (f) guide docx date fixed at 2026-11-07 (default kept); (g) scripts.screens waits for U-35.
- (a) The 19th test name is an addition to the stable list. Default: kept.
- (b) "export erase import" compares every store except meta. Default: kept.
- (c) Craving and drill tests install Playwright's clock and fast-forward 16 minutes only when the sos-timer shows. Default: kept.

### For the HUB at the merge
- Shared file: package.json, only scripts["test:browser"] (after scripts.test) and devDependencies.playwright "1.65.0" added by JSON-parse edit; core's keys unchanged except a trailing comma on the scripts.test line. package-lock.json adds playwright and playwright-core 1.65.0. Expect a package.json/lock conflict if another lane adds dependencies; re-run npm install to regenerate the lock.
- Territory warnings: none.
- Browser tests to run in the quiet window: `npm run test:browser` after the build on the merged tree; read every SKIP reason and expect the 14 skips to shrink as store.js and the screens land.
- Run 09:53: shared files: README.md and CLAUDE.md append '## Offline edition' at the end; package.json scripts.check. The docs gate needs python-docx and gen_docx.py (local); in the cloud it exits 1 naming the missing piece. 1-addic-Guide.docx is regenerated byte-identically.
