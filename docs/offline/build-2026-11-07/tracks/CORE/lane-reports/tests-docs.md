## tests-docs (CORE, 1-addic offline build): the slice report

State: READY at tip d964202 (continued run 2026-11-08 06:06 IST from 30cb12ff: V-01t built, check FIX then all four findings FIXED, tip PASS). Branch build/tests-docs; earlier tips 2729d44, 2a515e5, c1058ab; base 30cb12ff. Worktree C:/Users/ruchi/1-addic-wt/tests-docs.
Earlier run: READY-SLICE, tip 310780d, 2026-11-07 09:30 IST.
Commits f69bc68a..2a515e5 (2026-11-08 04:07 run):
- 2a515e5 docs(offline): V-06 the docs true again
- 64e1f2c test(offline): V-03 the hooks round, test side
Commits 30cb12ff..d964202 (2026-11-08 06:06 run):
- d964202 docs(offline, V-01t C2): the browser counts are the last green full run's
- 879248c test(offline, V-01t C4): reduced-motion test first proves the scene is drawn still
- f90972c test(offline, V-01t C3): slip test first proves a place has light
- c0ecdbe test(offline, V-01t C1): PIN flow waits for the wrong-PIN line, not 800 ms
- 2729d44 docs(offline, V-01t): Guide lesson Your Harbor and the counts on the trunk (R-C-60)
- e63c102 test(offline, V-01t): screens.mjs takes Your Harbor (#/status)
- c84c63a test(offline, V-01t): the status layer's four browser tests and its hooks
Older commits (to 2a515e5, c1058ab and before): see the annex.
- 310780d test(tests-docs, U-34): browser harness: the 3.13 flows by name, offline at 390 px

### Turn caps
- Run 2026-11-08 06:06: builder [V-01t] steps_used 40, returned a note (c84c63a, e63c102, 2729d44); check fixer done (C1-C4); capHits 0.
- Run 2026-11-08 04:07: builder batch [V-03, V-06] steps_used 36, returned a note (first V-03 builder died 03:58 before any commit; its uncommitted hooks.mjs edit was kept and verified); capHits 0.
- Run 2026-11-08: U-35 builder (wf_3e4ac20d-750, CORE 10) returned a note, stopped before check for memory; check fixer done (C1-C4); capHits 0.
- Run 09:53: builder batch [U-37, U-36a] steps_used 36, returned a note; capHits 0. Check fix C1: done.
- Builder batch [U-34]: steps_used 31, returned a note. capHits 0.

### Units
Run 2026-11-08 06:06 IST (continued from 30cb12ff):
- V-01t (tier 1), c84c63a, e63c102, 2729d44; fixes c0ecdbe, f90972c, 879248c, d964202. A person can open Your Harbor (#/status) and the suite proves four things by name: status shows the harbor and its changes, a slip lowers no light, reduced motion shows a still scene with no moving class, and the status page works. screens.mjs takes status (phone and desktop). Guide gains Lesson 15, Your Harbor (.md and .docx); counts updated on the trunk (R-C-60): npm test 582 checks in 15 files (581 pass; today-track FIX-EMBED red is another lane's), browser 25 flows, 25 pass, 0 skip. Closes: R-C-60 recount, R-S-23 hooks. Held: none.
- Lesson: the status page keeps its last draw in memory, so a test wanting status-change-item opens #/status once, logs, then opens it again. The slip test takes SkillUsed from a helped SOS craving session (ride-wave).
- Next: V-45 (R-O-6, not built this run by the build chat's order), V-22a, V-26b, V-27, V-29 (tier 2).
Run 2026-11-08 04:07 IST:
- V-03 (tier 1), 64e1f2c. A developer's browser suite now drives the real screens by hook: hooks.mjs drops the ASSUMED entries and gives every hook its file:line (re-verify: python -I _logs/reports/tests-docs/tests-docs__verify_hooks.py <wt>). In SOS, "Did you use?" comes only after "It passed"; the re-rating comes only from sos-checkin after each tool's steps and sos-helped-yes; flows.mjs useTool and reachReassess drive this. Quick log starts on #/track; the evening check-in must record kind=evening. Two flows added: 'Settings PIN set and remove', 'planner add and save'. Browser suite 21 tests, 21 pass, 0 skip: the three skips (SOS drill creates no log, SOS craving flow, quick log and evening check-in) now pass by name. Closes: the hook assumptions (SOS reassess, quicklog).
- V-06 (tier 1), 2a515e5. offline/README.md no longer calls merged things planned; it names the commands, test names, counts (536 checks in 13 files, browser 21/21/0) and offline/releases/1-addic-v1.1.html (true after the merge, absent from this base). README.md and CLAUDE.md gain two lines each at the end of '## Offline edition'. Guide 'Tested' line and Part 4 table follow the counts; docs gate green. Held: none.
- Next: V-01t (after today-track V-01b), V-22a, V-26b, V-27, V-29 (briefs in tracks/CORE/briefs/tests-docs).
Run 2026-11-08 03:26 IST:
- V-07 (tier 1), c1058ab. A person can read Part 3 of the guide (.md and .docx) as 14 numbered how-tos against the real screens, each with a phone screenshot and alt text (sample data, onboarding, SOS craving, slip, quick log and check-in, Learn, Workbook, Track and Insights, Planner and Battle Plans, Weekly Review, My Recovery Plan, backup/erase/restore, phone, PIN/Lock/Discreet); Part 4 has troubleshooting, quirks (backup file is not PIN-locked) and the check table. STRICT_IMAGES is now True: a missing image fails the docs gate. Code won over the brief: per-step Skip (not Skip all); Settings is the sliders button; 'Save a backup file' / 'Bring back a backup'. Closes: Q1 (counts: browser 19/16/3 from browser-20261108-030752.log; Node 536/536 from npm test on the worktree). Held: none.
- U-36b is replaced by V-07 (done). Next: V-03 (3 hooks, then Part 4 to 19 of 19, two Pending rows to Pass), V-06, V-01t (after today-track V-01b).
Run 2026-11-08 02:46 IST:
- U-35 (tier 2), 2f6ab78 and dfc2703, fixes 02372c6, 95df36b, bd54407, 476f404, 3013337. A person can run `npm run screens` (node offline/tests/screens.mjs): it opens the built file offline at phone 390x844 and desktop 1280x800, 300 DPI, loads sample data, and writes 72 PNGs to offline/docs/images (37 slugs, minus the dropped duplicate Settings shot; 74 first built). Shots skip by name when a route or hook is missing. Output is byte-reproducible (fixed clock). launch.mjs gains a scale option. README, README.md and CLAUDE.md now describe built features as built (data layer, PIN, export and import, Settings, Load sample data, discreet switch, onboarding, SOS screen, Elsewhere list). Closes: scripts.screens (g).
- U-36b (tier 2) not built; next: write the 14 lessons in 1-addic-Guide.md against the 72 images (Privacy tab is settings-privacy-*.png), flip STRICT_IMAGES True, drop 'its lessons are planned' from offline/README.md.
- Held: none.
Run 2026-11-07 09:53 IST:
- U-37 (tier 1), 0019a3d, fix d91164d. A person can read offline/README.md to build the file, copy it to a phone, open it, read the three saved labels, understand the PIN, privacy and unverified numbers; README.md and CLAUDE.md gain a "## Offline edition" section at the end; ADR docs/decisions/0022-offline-edition.md; npm run check = build, test, test:browser, docs. After check C1 the README states only what the built file does today; export, import, PIN, Settings, discreet switch are marked planned. scripts.screens waits for U-35. Closes: Q4 (check = build, test, test:browser, docs).
- U-36a (tier 1), 8c86935, b2694db. offline/docs/1-addic-Guide.md skeleton (Parts 1, 2, 4; Part 3 has 14 lesson headings marked for U-36b), build_guide.py (STRICT_IMAGES False, names a missing dependency, reproducible .docx), 1-addic-Guide.docx committed (47 KB). Docs gate leaves the tree clean.
- Also this run: U-34 follow-ups C1 5008797, C2 17140c7 (see Check).
- Held or blocked: none. Still to build: U-35 (after SCREENS tier-1 merge), U-36b (after U-35).
Earlier runs (2026-11-07, U-34, U-37, U-36a): see C:/Users/ruchi/1-addic-wt/_logs/reports/tests-docs-report-annex.md

### Contract changes
- Run 2026-11-08 06:06: new #/status hooks block in hooks.mjs (file:line from ui-status.js, ui-harbor.js), HOOKS.pinError (form.ws-pin-form p.field-error[role=alert]), PIN_MS = 20000 in browser.test.mjs; screens slug status. Browser suite 25 flows (consumer: HUB browser gate, expect 25/0/0). Rule: after a wrong PIN, wait for the error line, never a fixed time.
- Run 2026-11-08 04:07: none public. hooks.mjs entries now carry file:line; flows.mjs useTool and reachReassess added; browser suite 21 flows (consumer: HUB browser gate, expect 21/0/0).
- Run 2026-11-08 03:26: none public. build_guide.py STRICT_IMAGES = True (consumer: gates.py docs gate; later guide units must cite images npm run screens has written).
- Run 2026-11-08: package.json scripts.screens = node offline/tests/screens.mjs (consumer: HUB). launch.mjs newPage gains a scale option. 72 images in offline/docs/images (consumer U-36b). Order matters in SHOTS: settings-privacy before settings-data. No routes, hooks or content keys added.
- Run 09:53: package.json scripts.check added (after test:browser; JSON-parsed). scripts.screens not yet (U-35). build_guide.py: GEN_DOCX=<path> overrides gen_docx.py; keep make_reproducible(). No routes, content keys or hooks added.
- npm script `test:browser` = `node offline/tests/helpers/run-browser.mjs` (sets ADDIC_BROWSER=1; --grep to --test-name-pattern; --headed to ADDIC_HEADED=1). Consumer: HUB gates.py browser gate.
- devDependencies playwright 1.65.0 exact, plus package-lock.json. Consumer: HUB.
- helpers/launch.mjs: BUILT, BUILT_URL, PHONE, builtExists(), isAllowedUrl(url), launch({headless}) -> {browser, channel, version} | {reason}, newPage(browser, {offline, viewport, mobile, colorScheme, reducedMotion, clock, print}) -> {page, context, problems}, openApp(page, hash), ready(page), assertClean(problems). Env ADDIC_HTML retargets the build. Consumer: U-35 screens.mjs.
- helpers/hooks.mjs: HOOKS (the one selector table), REASON, routeRegistered(page, seg), missingGlobal(page, names), present(page, sel, ms), skipReason(page, {routes, globals, hooks}). Consumer: U-35.
- helpers/flows.mjs: Skip, TEST_PIN, go, routeKey, waitRoute, need, visible, click, advanceUntil, setRating, count, events, exportStores, derived, waitFor, cravingSession, onboarding, fillVisible, unlockWith. Consumer: U-35.
- helpers/harness.test.mjs: 5 node tests run by the test gate.
- Test names: the brief's 18 plus "discreet lock screen shows Notebook and Help" (CORE chat request). Skip reasons: "ADDIC_BROWSER not set", "offline/1-addic.html not built", "no Chrome or Chromium found", "playwright not installed (npm install)", "route #/<seg> not registered", "hook <selector> absent", "global <Name> absent".
- No content keys, routes, UI.pages entries or data-tour targets added.

### Gates, run 2026-11-08 06:06 IST (logs under C:/Users/ruchi/1-addic-wt/_logs/gates/tests-docs/)
VERIFIED at d964202 (re-check): build-20261108-082544.log GREEN; test-20261108-082550.log GREEN 6/0/0; validate-20261108-082608.log GREEN; guards-20261108-082611.log GREEN 5/0; browser-20261108-082651.log GREEN 25/0/0 in 433 s. At the first check (2729d44): browser-20261108-072113.log RED 24/1 (PIN flow), later fixed; docs-20261108-072709.log GREEN.
ASSUMED: docs-20261108-081753.log (fixer's run, not re-run at d964202); npm test 582/581 from tests-docs__npmtest.out (not re-run). Fixer: browser-20261108-075925.log 25/0/0.
Territory: check_territory 30cb12ff..d964202 lists 14 files, all own, 0 shared, 0 nobody's, 0 errors. Only lines inside '## Offline edition' of README.md and CLAUDE.md changed.
Older gate blocks (02:46, 03:26): see the annex.
### Gates (earlier runs 2026-11-07): see C:/Users/ruchi/1-addic-wt/_logs/reports/tests-docs-report-annex.md

### Gates, run 2026-11-08 04:07 IST (logs under C:/Users/ruchi/1-addic-wt/_logs/gates/tests-docs/)
VERIFIED at 2a515e5: build-20261108-044758.log GREEN 1113578 B; test-20261108-044804.log GREEN 6/6 (lane's 1 file); validate-20261108-044812.log GREEN; guards-20261108-044813.log GREEN 5/5; browser-20261108-044814.log GREEN 21 pass, 0 fail, 0 skip; docs-20261108-045202.log GREEN, 0 images missing, tree clean.
ASSUMED: the 536 checks in 13 files cited by the docs come from test-20261108-015008.log (not re-run).
Territory: f69bc68a..HEAD 85 files, 84 own, 1 shared (package.json scripts and devDependencies), 0 nobody's, 0 errors, 0 warnings. Commits after c1058ab touch 8 own files; README.md and CLAUDE.md only append at the end of '## Offline edition'. Both commits carry the trailers.

### Review gates
None.

### Check, run 2026-11-08 06:06 IST (V-01t)
Verdict FIX at 2729d44, then PASS at d964202; all four FIXED, finder's re-check FIXED, no new findings. Evidence tests-docs__check.md.
- C1 (HIGH, V-01t), fix c0ecdbe, FIXED: 'Settings PIN set and remove' timed out (wrong PIN takes PBKDF2 310000 plus 250 ms, sheet ignores taps while busy); now waits for HOOKS.pinError, 20 s per wait.
- C2 (MEDIUM, V-01t), fix d964202, FIXED: docs said 25/25 while the gate showed 24/1; docs now state the last green full run.
- C3 (LOW, V-01t), fix f90972c, FIXED: slip test asserts a place has data-level > 0 first.
- C4 (LOW, V-01t), fix 879248c, FIXED: reduced-motion test asserts scene drawn with one .hb-still.
Not checked: .docx and PNG contents; docs gate at d964202 (relied on fixer's log); docx text equals md byte for byte; V-45. Watch: PIN flow took 17.6 s; full browser run keeps growing (433-495 s).
Older checks (to 2026-11-08 04:07 for the Check block of 310780d..03:26): see the annex.

### Check, run 2026-11-08 04:07 IST
Verdict PASS at 2a515e5. Findings: none, so no fix SHA and no re-check. V-03 (64e1f2c) and V-06 (2a515e5) meet acceptance. Not checked: units up to c1058ab not judged again; offline/releases/1-addic-v1.1.html absent from this worktree (exists on trunk; size not compared with 1113578 B); the hooks verifier reports 2 expected items (log-checkin-evening built as 'log-checkin-'+k at ui-track.js:570; early-notice-ok pairs with early-notice-dismiss at ui-onboarding.js:297); the other ~80 hook lines not checked by hand. Evidence: C:/Users/ruchi/1-addic-wt/_logs/reports/tests-docs-report.md earlier sections.

### Review
Not a flagged lane: no reviewers run.

### Safety and content marks
- Run 2026-11-08 06:06: Guide Lesson 15 is original, person-first copy; place names match the source (content-core.js:57-60). No clinicalReview or verify marks added; no network call, no innerHTML.
- Run 2026-11-08 04:07: no content written; no clinicalReview or verify marks added. V-03 tests keep SOS ungated (sos-urgent) and the no-network rule.
- Run 09:53: clinicalReview: true on the guide's 'What it is not' warning (offline/docs/1-addic-Guide.md). verify: none added. The README says every number is unverified until the owner checks it.
No content written. clinicalReview: true passages: none. verify: true resources: none.

### Requests for other lanes
- Run 2026-11-08 06:06: none new; #/status hooks were found. today-track: FIX-EMBED red in its npm test (not ours).
- Run 2026-11-08 04:07: V-03 hooks all found (sos-reassess-passed, sos-reassess-still, quicklog-button); no request outstanding. V-01t needs the #/status data-test hooks after today-track V-01b.
- Run 2026-11-08 03:26: V-03 needs sos-reassess-passed, sos-reassess-still (ui-sos.js) and data-tour=quicklog-button (ui-track.js); if absent, the owning lane adds them (tests-docs never edits those files).
- Run 2026-11-08: none new. Where brief and code differ the README follows the code (export asks for the PIN but the file is not locked; list named 'Elsewhere').
- HUB (run 09:53): add the index row for 0022 in docs/decisions/README.md (not this lane's file).
- SCREENS lanes (today-track, workbook-settings, game-tutorials, learn): publish contracts with the hooks below, or tell tests-docs the real ones. Assumed: today-track data-testid checkin-evening and checkin-save; workbook-settings settings-export, settings-erase, settings-import, export PIN prompt `dialog#dialog input[type=password]`, confirm `dialog#dialog button.danger|.primary`; game-tutorials `UI.tour.start('tour')`, `#coach` buttons Next/Done/Finish/Got it and Skip, a Settings Help button whose name contains "tour"; learn: an exercise in Content.exercises with artifact 'reasons', route `#/exercise/<id>?mode=tutorial&from=<lessonId>`. Absent hooks skip as "hook X absent", so read the skip reasons after every merge.
- Core / actions-sos: keep sos-urgent, sos-*, lock-*, onb-* and data-tour nav-* names as contracted.

### Docs owed
- Run 2026-11-08 06:06: V-01t Lesson 15 and counts done. Still owed: docs/decisions/README.md 0022 row (V-29); counts if the merged trunk changes them.
- Run 2026-11-08 04:07: V-03 and V-06 docs done (Part 4 19 of 19, counts, README). Still owed: V-01t 'Your Harbor' lesson; docs/decisions/README.md 0022 row (V-29); the guide numbers if the merged trunk changes the counts.
- Earlier docs-owed lines: see C:/Users/ruchi/1-addic-wt/_logs/reports/tests-docs-report-annex.md

### Open questions
- Run 2026-11-08 06:06: none new. Brief Q1 kept: counts are the last green full run's (582 in 15 files, browser 25/0/0).
- Run 2026-11-08 04:07: none new. Default kept: README names offline/releases/1-addic-v1.1.html although it lands with the merge.
- Run 2026-11-08 03:26: none new; Q1 closed (see Units).
- Run 2026-11-08: (g) closed: scripts.screens built. (h) the duplicate Settings slug was dropped, 72 images. Defaults kept.
- Run 09:53: (d) the .docx is committed and reproducible (default kept); (e) scripts.check uses `python` (default kept); (f) guide docx date fixed at 2026-11-07 (default kept); (g) scripts.screens waits for U-35.
- (a) The 19th test name is an addition to the stable list. Default: kept.
- (b) "export erase import" compares every store except meta. Default: kept.
- (c) Craving and drill tests install Playwright's clock and fast-forward 16 minutes only when the sos-timer shows. Default: kept.

### For the HUB at the merge
- Shared file: package.json, only scripts["test:browser"] (after scripts.test) and devDependencies.playwright "1.65.0" added by JSON-parse edit; core's keys unchanged except a trailing comma on the scripts.test line. package-lock.json adds playwright and playwright-core 1.65.0. Expect a package.json/lock conflict if another lane adds dependencies; re-run npm install to regenerate the lock.
- Territory warnings: none.
- Browser tests to run in the quiet window: `npm run test:browser` after the build on the merged tree; read every SKIP reason and expect the 14 skips to shrink as store.js and the screens land.
- Run 09:53: shared files: README.md and CLAUDE.md append '## Offline edition' at the end; package.json scripts.check. The docs gate needs python-docx and gen_docx.py (local); in the cloud it exits 1 naming the missing piece. 1-addic-Guide.docx is regenerated byte-identically.
- Run 2026-11-08: shared file package.json gains only scripts.screens. 72 PNGs (about 1.3 MB) under offline/docs/images. Run `npm run screens` after the merge only if the images need regenerating; U-36b follows.
- Run 2026-11-08 03:26: no shared file changes since the last run. The guide .docx is regenerated byte-identically by the docs gate. Run `npm run screens` before V-01t so the status images exist.
- Run 2026-11-08 04:07: no new shared file changes beyond two appended lines each in README.md and CLAUDE.md '## Offline edition'. Expect browser 21/0/0 on the merged tree; offline/releases/1-addic-v1.1.html must exist for the README to be true. Run `npm run screens` before V-01t.
- Run 2026-11-08 06:06: no shared file changes (README.md and CLAUDE.md '## Offline edition' lines only). Expect browser 25/0/0 and npm test 582 checks in 15 files (today-track FIX-EMBED red is its lane's). Run `npm run screens` if status images need regenerating.
