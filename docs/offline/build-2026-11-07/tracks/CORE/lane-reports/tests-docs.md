## tests-docs (CORE, 1-addic offline build): the slice report

State: READY (continued run 2026-11-08 04:07 IST from c1058ab: V-03 and V-06 built, check PASS at 2a515e5, no findings; V-01t not built). Branch build/tests-docs, tip 2a515e5 (earlier tips c1058ab, 476f404, d91164d; base f69bc68a). Worktree C:/Users/ruchi/1-addic-wt/tests-docs.
Earlier run: READY-SLICE, tip 310780d, 2026-11-07 09:30 IST.
Commits f69bc68a..2a515e5 (2026-11-08 04:07 run):
- 2a515e5 docs(offline): V-06 the docs true again
- 64e1f2c test(offline): V-03 the hooks round, test side
Commits f69bc68a..c1058ab (2026-11-08):
- c1058ab docs(offline): V-07 the guide's Parts 3 and 4
Earlier in this range (f69bc68a..476f404):
- 476f404 test(offline): C3 follow-up, Privacy before Your data
- 3013337 test(offline): C4 screens skips the seed by name, never throws
- bd54407 test(offline): C3 one Settings slug for the Privacy tab
- 95df36b docs(offline): C2 the README says what the built file does
- 02372c6 docs(offline): C1 npm run screens is built, not planned
- dfc2703 docs(offline): U-35 the guide's screenshots, 74 images
- 2f6ab78 test(offline): U-35 screens.mjs and npm run screens
Commits (22c39654..HEAD, earlier):
- d91164d docs(tests-docs, U-37 fix C1): the README says only what the built file does today
- b2694db docs(tests-docs, U-36a): a reproducible .docx, so the docs gate leaves the tree clean
- 8c86935 docs(tests-docs, U-36a): the guide skeleton and its .docx pipeline
- 0019a3d docs(tests-docs, U-37): docs true: offline/README.md, Offline edition sections, ADR 0022, npm run check
- 17140c7 test(tests-docs, U-34 C2): the nothing-decreases check ends in a named Skip without Engine.gameState
- 5008797 test(tests-docs, U-34 C1): a missing sos-urgent hook fails once UI.pages.sos is built
- 310780d test(tests-docs, U-34): browser harness: the 3.13 flows by name, offline at 390 px

### Turn caps
- Run 2026-11-08 04:07: builder batch [V-03, V-06] steps_used 36, returned a note (first V-03 builder died 03:58 before any commit; its uncommitted hooks.mjs edit was kept and verified); capHits 0.
- Run 2026-11-08: U-35 builder (wf_3e4ac20d-750, CORE 10) returned a note, stopped before check for memory; check fixer done (C1-C4); capHits 0.
- Run 09:53: builder batch [U-37, U-36a] steps_used 36, returned a note; capHits 0. Check fix C1: done.
- Builder batch [U-34]: steps_used 31, returned a note. capHits 0.

### Units
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

### Gates (earlier runs 2026-11-07): see C:/Users/ruchi/1-addic-wt/_logs/reports/tests-docs-report-annex.md

### Gates, run 2026-11-08 02:46 IST (logs under C:/Users/ruchi/1-addic-wt/_logs/gates/tests-docs/)
VERIFIED at the check (dfc2703): build-20261108-024838.log GREEN 1113578 B; test-20261108-024845.log GREEN 5/5; validate-20261108-024850.log GREEN; guards-20261108-024850.log GREEN 5/5; browser-20261108-024851.log GREEN 16/0/3 (skips: SOS drill creates no log, SOS craving flow, quick log and evening check-in); docs-20261108-025055.log GREEN.
VERIFIED at the final check (476f404): build-20261108-031446.log, test-20261108-031457.log GREEN 6/6, validate-20261108-031504.log, guards-20261108-031505.log GREEN 5/5.
ASSUMED (fixer's runs, not re-run by the checker): browser-20261108-030752.log, screens-20261108-030433.log.
Territory: f69bc68a..HEAD 78 own files, 1 shared (package.json scripts.screens only), 0 nobody's, 0 errors.

### Gates, run 2026-11-08 03:26 IST (logs under C:/Users/ruchi/1-addic-wt/_logs/gates/tests-docs/)
VERIFIED at c1058ab (check): build-20261108-034314.log GREEN; test-20261108-034318.log GREEN 6/6 (lane harness only); validate-20261108-034325.log GREEN; guards-20261108-034326.log GREEN 5/5; browser-20261108-034327.log GREEN 16/0/3 (skips: SOS drill creates no log, SOS craving flow, quick log and evening check-in; same as base, no new failure); docs-20261108-034621.log GREEN, 0 images missing, tree clean. Builder runs: build-20261108-033942.log, docs-20261108-033952.log.
ASSUMED: Node 536/536 (npm test on worktree, builder's note; not re-run by the checker).
Territory: f69bc68a..HEAD 82 files, 81 own, 1 shared (package.json scripts and devDependencies keys), 0 nobody's, 0 errors, 0 warnings. The V-07 commit touches only the guide .md, .docx and build_guide.py.

### Gates, run 2026-11-08 04:07 IST (logs under C:/Users/ruchi/1-addic-wt/_logs/gates/tests-docs/)
VERIFIED at 2a515e5: build-20261108-044758.log GREEN 1113578 B; test-20261108-044804.log GREEN 6/6 (lane's 1 file); validate-20261108-044812.log GREEN; guards-20261108-044813.log GREEN 5/5; browser-20261108-044814.log GREEN 21 pass, 0 fail, 0 skip; docs-20261108-045202.log GREEN, 0 images missing, tree clean.
ASSUMED: the 536 checks in 13 files cited by the docs come from test-20261108-015008.log (not re-run).
Territory: f69bc68a..HEAD 85 files, 84 own, 1 shared (package.json scripts and devDependencies), 0 nobody's, 0 errors, 0 warnings. Commits after c1058ab touch 8 own files; README.md and CLAUDE.md only append at the end of '## Offline edition'. Both commits carry the trailers.

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

### Check, run 2026-11-08 02:46 IST
Verdict FIX at dfc2703, then PASS at 476f404; all four FIXED, finder's re-check FIXED, no new findings. Not checked: npm run screens re-run by the checker; U-34, U-36a, FIX-TOURMARK code (merged before base).
- C1 (MEDIUM, U-35/U-37), fix 02372c6, FIXED: docs said screens planned.
- C2 (MEDIUM, U-37), fix 95df36b, FIXED: stale 'planned' marks in READMEs.
- C3 (LOW, U-35), fix bd54407 and 476f404, FIXED: duplicate settings shots.
- C4 (LOW, U-35), fix 3013337, FIXED: seed threw instead of skipping by name.
No review lenses (not flagged).

### Check, run 2026-11-08 03:26 IST
Verdict PASS at c1058ab. No findings, so no fix SHA and no re-check. V-07 done-when met: STRICT_IMAGES True, 0 images missing, no U-36b marker or 'Planned' left, 14 lessons each with numbered steps and an image with alt text, about 50 UI names match offline/src. Not checked: each PNG by eye; the Node count re-run; reading grade by tool; U-34 to U-35 and FIX-TOURMARK not re-judged.

### Check, run 2026-11-08 04:07 IST
Verdict PASS at 2a515e5. Findings: none, so no fix SHA and no re-check. V-03 (64e1f2c) and V-06 (2a515e5) meet acceptance. Not checked: units up to c1058ab not judged again; offline/releases/1-addic-v1.1.html absent from this worktree (exists on trunk; size not compared with 1113578 B); the hooks verifier reports 2 expected items (log-checkin-evening built as 'log-checkin-'+k at ui-track.js:570; early-notice-ok pairs with early-notice-dismiss at ui-onboarding.js:297); the other ~80 hook lines not checked by hand. Evidence: C:/Users/ruchi/1-addic-wt/_logs/reports/tests-docs-report.md earlier sections.

### Review
Not a flagged lane: no reviewers run.

### Safety and content marks
- Run 2026-11-08 04:07: no content written; no clinicalReview or verify marks added. V-03 tests keep SOS ungated (sos-urgent) and the no-network rule.
- Run 09:53: clinicalReview: true on the guide's 'What it is not' warning (offline/docs/1-addic-Guide.md). verify: none added. The README says every number is unverified until the owner checks it.
No content written. clinicalReview: true passages: none. verify: true resources: none.

### Requests for other lanes
- Run 2026-11-08 04:07: V-03 hooks all found (sos-reassess-passed, sos-reassess-still, quicklog-button); no request outstanding. V-01t needs the #/status data-test hooks after today-track V-01b.
- Run 2026-11-08 03:26: V-03 needs sos-reassess-passed, sos-reassess-still (ui-sos.js) and data-tour=quicklog-button (ui-track.js); if absent, the owning lane adds them (tests-docs never edits those files).
- Run 2026-11-08: none new. Where brief and code differ the README follows the code (export asks for the PIN but the file is not locked; list named 'Elsewhere').
- HUB (run 09:53): add the index row for 0022 in docs/decisions/README.md (not this lane's file).
- SCREENS lanes (today-track, workbook-settings, game-tutorials, learn): publish contracts with the hooks below, or tell tests-docs the real ones. Assumed: today-track data-testid checkin-evening and checkin-save; workbook-settings settings-export, settings-erase, settings-import, export PIN prompt `dialog#dialog input[type=password]`, confirm `dialog#dialog button.danger|.primary`; game-tutorials `UI.tour.start('tour')`, `#coach` buttons Next/Done/Finish/Got it and Skip, a Settings Help button whose name contains "tour"; learn: an exercise in Content.exercises with artifact 'reasons', route `#/exercise/<id>?mode=tutorial&from=<lessonId>`. Absent hooks skip as "hook X absent", so read the skip reasons after every merge.
- Core / actions-sos: keep sos-urgent, sos-*, lock-*, onb-* and data-tour nav-* names as contracted.

### Docs owed
- Run 2026-11-08 04:07: V-03 and V-06 docs done (Part 4 19 of 19, counts, README). Still owed: V-01t 'Your Harbor' lesson; docs/decisions/README.md 0022 row (V-29); the guide numbers if the merged trunk changes the counts.
- Earlier docs-owed lines: see C:/Users/ruchi/1-addic-wt/_logs/reports/tests-docs-report-annex.md

### Open questions
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
