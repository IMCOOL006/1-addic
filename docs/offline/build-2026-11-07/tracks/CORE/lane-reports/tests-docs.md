## tests-docs (CORE, 1-addic offline build): the slice report

State: READY at tip 0ce14e5 (continued run 2026-11-09 19:59 IST from 82c5eddf: FIX-TD-V32 built, check PASS, 2 LOW findings open by design). Earlier: READY at tip dbc81e64 (continued run 2026-11-09 15:36 IST from 95aac382: V-22a, V-26b, V-27, V-29 built, check FIX then both findings FIXED; open: the red name "contrast: .coach-sos (dark)" must be baselined or fixed before merge). Earlier: READY at tip 949f0f7 (continued run 2026-11-08 09:19 IST from 3fbd08f6: V-45 built, check PASS, one LOW finding C1 open by design). Earlier: READY at d964202 (06:06 run, V-01t). Branch build/tests-docs; earlier tips 2729d44, 2a515e5, c1058ab; base 30cb12ff. Worktree C:/Users/ruchi/1-addic-wt/tests-docs.
Earlier run: READY-SLICE, tip 310780d, 2026-11-07 09:30 IST.
Commits 82c5eddf..0ce14e5 (2026-11-09 19:59 run):
- 0ce14e5 docs(offline): FIX-TD-V32 T4 retake the sos-craving screenshots (V-SOS10)
- 08bb30c test(offline): FIX-TD-V32 T5 the hook lock-opening, read in the SOBER flow (V-25)
- f2c95b5 test(offline): FIX-TD-V32 T3 the lock page SOBER practice (ES1, EC1, ESR1)
- 7827464 test(offline): FIX-TD-V32 T2 a lesson and a checkpoint say +10 XP once (V-20)
- 25b1747 test(offline): FIX-TD-V32 T1 a discreet start paints no emergency line (V-ES1)
Commits 95aac382..dbc81e6 (2026-11-09 run):
- dbc81e6 docs(offline): C1 V-27 the counts say 1 fail, not 1 todo
- 8e768f4 test(offline): C2 V-26b the boot budget is max of 3 runs x 2, 1428 ms
- 21c3258 test(offline): C1 V-27 the .coach-sos dark contrast is a real named red
- b1cecf2 docs(offline): V-26b, V-27 the true counts in CLAUDE.md, the READMEs and the guide
- 23cbc96 test(offline): V-27 contrast check of the styles.css colour pairs in both themes
- b3f2b46 test(offline): V-26b boots to the first render within the budget
- 20d7896 docs(offline): V-29 the ADR 0022 row in docs/decisions/README.md
- 0a0c263 test(offline): V-22a C-TM-1 markOnboarded's two writes run in order, awaited, in one try
Commits 2026-11-08 and older: see the annex. Older commits (to 2a515e5, c1058ab and before): see the annex.
- 310780d test(tests-docs, U-34): browser harness: the 3.13 flows by name, offline at 390 px

### Turn caps
- Run 2026-11-09 19:59: builder [FIX-TD-V32] steps_used 19, returned a note (25b1747, 7827464, f2c95b5, 08bb30c, 0ce14e5); capHits 0.
- Run 2026-11-09 15:36: builder batch [V-22a, V-26b, V-27, V-29] steps_used 14, returned a note (0a0c263, 20d7896, b3f2b46, 23cbc96, b1cecf2); check fixer done (C1, C2: 21c3258, 8e768f4, dbc81e6); capHits 0.
- Run 2026-11-08 09:19: builder [V-45] steps_used 58, returned a note (263f752, 936c5ea, 949f0f7); capHits 0.
- Run 2026-11-08 06:06: builder [V-01t] steps_used 40, returned a note (c84c63a, e63c102, 2729d44); check fixer done (C1-C4); capHits 0.
- Run 2026-11-08 04:07: builder batch [V-03, V-06] steps_used 36, returned a note (first V-03 builder died 03:58 before any commit; its uncommitted hooks.mjs edit was kept and verified); capHits 0.
- Run 2026-11-08: U-35 builder (wf_3e4ac20d-750, CORE 10) returned a note, stopped before check for memory; check fixer done (C1-C4); capHits 0.
- Run 09:53: builder batch [U-37, U-36a] steps_used 36, returned a note; capHits 0. Check fix C1: done.
- Builder batch [U-34]: steps_used 31, returned a note. capHits 0.

### Units
Run 2026-11-09 19:59 IST (continued from 82c5eddf; FIX-TD-V32, tier 1):
- T1 25b1747: flow 'discreet start shows no emergency line while the app loads'; the discreet flag is written by an init script (a write from the old page once sampled 'block'). RED on a copy without the html[data-discreet] .boot-line rule (browser-20261109-200451.log, actual ['block']).
- T2 7827464: 'finishing a lesson and a checkpoint says +10 XP once'.
- T3 f2c95b5: 'lock page SOBER practice stays open, SOS still works, Done comes back'.
- T5 08bb30c: hook lockOpening, read empty before and after a try in the T3 flow. Closes the lock-opening hook owed.
- T4 0ce14e5: sos-craving phone PNG retaken (a person sees 10 on one line at 390 px); desktop PNG 2 bytes; guide rebuilt, 0 images missing. Nothing under offline/src touched.
- Counts: browser 32 pass, 0 fail, 0 skip in one run; count lines and README flow names still say 29 (FIX-COUNTS-4's).
Run 2026-11-09 15:36 IST (continued from 95aac382; all tier 2):
- V-22a, 0a0c263. A test proves markOnboarded's two writes run in order, awaited, in one try; no test name changed. Closes C-TM-1.
- V-26b, b3f2b46, 8e768f4. A named browser flow, 'boots to the first render within the budget', prints boot ms and asserts under 1428 ms (max of 3 local runs 714, 559, 611, times 2). Does not depend on core V-26a.
- V-27, 23cbc96, 21c3258, b1cecf2, dbc81e6. New offline/tests/contrast.test.mjs: 45 tests check the styles.css colour pairs in both themes and fail on a changed token. One is a real, deliberate named red: 'contrast: .coach-sos (dark)', 2.73:1 against 4.5:1 (styles.css:568, owner game-tutorials). Per brief open question 3 it is not skipped. A red pair is never fixed here.
- V-29, 20d7896. docs/decisions/README.md gains the ADR 0022 row (ADR is Accepted). Closes the docs owed since 06:06.
- Counts (b1cecf2, dbc81e6): npm test 723 checks in 16 files, 722 pass, 1 fail (arithmetic from the last full run); browser 29 of 29, 0 skip. CLAUDE.md, README.md, offline/README.md, guide (Tested line, Part 4, Colours row) and the .docx follow.
- Next: lock-opening hook (ui-onboarding.js lockPage, p#lock-opening) once actions-sos 638c94a is on the trunk. When game-tutorials fixes styles.css:568, run gates.py --files offline/tests/contrast.test.mjs test (expect 45/0), set counts to 723 of 723 in CLAUDE.md:43, README.md:22, offline/README.md:85 and the guide, rebuild the .docx.
Run 2026-11-08 09:19 IST (continued from 3fbd08f6):
- V-45 (tier 1), 263f752, 936c5ea, 949f0f7. The browser suite gains three R-O-6 flows by name (two skip until V-41 and V-42 merge: 'an objective done grows the harbor' skips on "global Actions.objective.done absent"; 'a quest-line step unlocks a feature' on "global Actions.questLine.claim absent"), 17 V-43 hooks, newPage clock {time}. screens.mjs takes 4 new slugs (today-objectives, today-run, today-way, status-way) with ADDIC_SHOTS, 8 PNGs (from a scratch build with V-41 b735852 and V-42 eb38166, since the trunk alone does not draw those cards). Guide Lesson 16 and Part 4 row ('Your day' pending), docx rebuilt. Counts true with no red named: npm test 616 pass, 0 fail; browser 28 flows, 26 pass, 0 fail, 2 skip. Closes: HUB docs-true fix (FIX-EMBED no longer named), R-O-6. Held: none.
- Next: after V-41 and V-42 merge run gates.py browser --grep 'an objective done grows the harbor|a quest-line step unlocks a feature' (expect 2 pass, 0 skip), then set counts 28/28/0 in CLAUDE.md, README.md, offline/README.md and guide Part 4; re-shoot only if words changed (ADDIC_SHOTS=today-objectives,today-run,today-way,status-way npm run screens).
Runs 2026-11-08 06:06 and 04:07 (V-01t, V-03, V-06): see the annex.
Runs 03:26 and earlier (V-07, U-35, U-37, U-36a): see the annex.
Earlier runs (2026-11-07, U-34, U-37, U-36a): see C:/Users/ruchi/1-addic-wt/_logs/reports/tests-docs-report-annex.md

### Contract changes
- Older contract lines (2026-11-08 and before, helpers, npm scripts): see the annex.
- Run 2026-11-09 19:59: hook lockOpening in hooks.mjs; three new browser flow names (names are failure identities); browser suite 32 flows (expect 32/0/0). No routes. Consumer: HUB gates.
- Run 2026-11-09: new offline/tests/contrast.test.mjs (45 names, "contrast: <pair> (<theme>)"; names are failure identities); browser flow "boots to the first render within the budget" (BOOT_BUDGET_MS 1428); browser suite 29 flows (expect 29/0/0). Consumer: HUB gates. No routes or hooks.
- Test names: the brief's 18 plus "discreet lock screen shows Notebook and Help" (CORE chat request). Skip reasons: "ADDIC_BROWSER not set", "offline/1-addic.html not built", "no Chrome or Chromium found", "playwright not installed (npm install)", "route #/<seg> not registered", "hook <selector> absent", "global <Name> absent".
- No content keys, routes, UI.pages entries or data-tour targets added.

### Gates, run 2026-11-09 15:36 IST (logs under C:/Users/ruchi/1-addic-wt/_logs/gates/tests-docs/)
Run 2026-11-09 19:59 IST. VERIFIED at 0ce14e5 (logs under the same folder): build-20261109-201211.log GREEN 1212699 B; test-20261109-201211.log GREEN 6 pass, 1 file; validate-20261109-201212.log GREEN; guards-20261109-201212.log GREEN; browser-20261109-201212.log GREEN 32/0/0; docs-20261109-201338.log GREEN 0 images missing. Builder's: build-20261109-200842.log, test-20261109-200843.log, validate-20261109-200846.log, guards-20261109-200846.log, browser-20261109-200847.log, docs-20261109-201020.log. ASSUMED: full npm test (16 files) not run. Territory: territory-td32-20261109-201130.log, 5 files, 5 own, 0 shared, 0 nobody's, 0 errors. Commits carry 'Co-Authored-By: Claude Opus 5.5' (see C2).
Run 2026-11-09 15:36 IST:
VERIFIED at dbc81e6: build-20261109-155701.log GREEN; validate-20261109-155739.log GREEN; guards-20261109-155739.log GREEN 5/5; browser-20261109-155751.log GREEN (boot flow only). test-20261109-155701.log RED on exactly one name, 'contrast: .coach-sos (dark)'. At the check tip b1cecf2: build-20261109-154550.log, test-20261109-154836.log (full, 722 pass, 1 todo then), validate-20261109-154555.log, guards-20261109-154555.log, browser-20261109-154555.log 29/0/0, docs-20261109-154729.log GREEN.
ASSUMED: the full browser suite at this code is the fixer's browser-20261109-155352.log (29/29, boot 104 ms); docs-20261109-155507.log (fixer's; the 723/722/1 total is arithmetic, full suite not re-run); contrast alone test-20261109-155650.log RED 44 pass, 1 fail.
Territory: check_territory 95aac382..HEAD 8 files, 6 own, 0 shared, 2 nobody's (docs/decisions/README.md, offline/tests/contrast.test.mjs; both named by the brief), 0 errors. All commits carry both trailers; CLAUDE.md and README.md changed only inside '## Offline edition'.

Older gate blocks (2026-11-08 09:19, 06:06 and before): see the annex.

### Review gates
None.

### Check, run 2026-11-09 19:59 IST (FIX-TD-V32)
Verdict PASS at 0ce14e5 (judged 82c5eddf..0ce14e5 only). T1 to T5 present and green.
- C1 (LOW, FIX-TD-V32 T3), fix: none (by design), finder's re-check: not applicable. browser.test.mjs:753 and the PIN step: a missing urgent-help control skips by F.need instead of failing as at :81-83.
- C2 (LOW, FIX-TD-V32, all five commits), fix: none, finder's re-check: not applicable. Trailer is Opus 5.5, not the Fable 5.1 line lane.js names; the session id is right; merge_lane.py does not block on it.
Not checked: T1 mutation not re-run (builder's log read); T1 not stress-tested (1 green full run, 4 of 4 builder runs); full npm test; earlier prose.

### Check, run 2026-11-09 15:36 IST (V-22a, V-26b, V-27, V-29)
Verdict FIX at b1cecf2, then both FIXED at dbc81e6; the finder's re-check saw only C1 and C2 (the whole list), no new findings.
- C1 (HIGH, V-27), fix 21c3258 (counts dbc81e6), finder's re-check FIXED: the .coach-sos (dark) red was marked todo through KNOWN_RED, against brief open question 3; removed, now a real named red (RED pass=44 fail=1).
- C2 (LOW, V-26b), fix 8e768f4, finder's re-check FIXED: boot budget was 1500 'rounded up'; now 1428.
Not checked: earlier units' acceptance (present below the base); grade level read, not measured; screenshots not re-taken; '.gm-badge.earned .gm-badge-mark' (light, builder reports 1.94:1) is outside V-27's pair list and unmeasured; delivery of the .coach-sos request to game-tutorials unconfirmed.

### Check, run 2026-11-08 09:19 IST (V-45)
Verdict PASS at 949f0f7 (judged 3fbd08f6..949f0f7 only). V-45 meets PLAN-V3 section 7 row V-45 and contract 07:10.
- C1 (LOW, V-45), fix: none (by design), finder's re-check: not applicable. Guide Lesson 16 and its pictures describe Done, Claim and Your way, which the file at this tip does not draw until V-41 and V-42 merge; Part 4 says so. HUB: keep Lesson 16 out of any tag cut before those merge.
Not checked: the two skipped flows on a merged tree (only the builder's scratch log); the 8 PNGs image by image; earlier units; full npm test re-run.

Older checks (2026-11-08 and before): see the annex.

### Review
Not a flagged lane: no reviewers run.

### Safety and content marks
- Run 2026-11-09 19:59: no content written; no clinicalReview or verify marks; no network call. T3 keeps SOS ungated on the lock page; T1 guards the discreet start.
- Run 2026-11-09: no content written; no clinicalReview or verify marks; no network call. The contrast test keeps a red visible, never hidden.
- Run 2026-11-08 09:19: Lesson 16 is original, person-first copy; no clinicalReview or verify marks added; no network call; the flows never stub the app.
- Run 2026-11-08 06:06: Guide Lesson 15 is original, person-first copy; place names match the source (content-core.js:57-60). No clinicalReview or verify marks added; no network call, no innerHTML.
- Run 2026-11-08 04:07: no content written; no clinicalReview or verify marks added. V-03 tests keep SOS ungated (sos-urgent) and the no-network rule.
- Run 09:53: clinicalReview: true on the guide's 'What it is not' warning (offline/docs/1-addic-Guide.md). verify: none added. The README says every number is unverified until the owner checks it.
No content written. clinicalReview: true passages: none. verify: true resources: none.

### Requests for other lanes
- Run 2026-11-09 19:59: none new. actions-sos lock-opening hook now used (T5).
- Run 2026-11-09: game-tutorials (token owner, SCREENS): offline/src/styles.css:568, .coach-sos sets color hsl(0 0% 100%) on hsl(var(--danger)), 2.73:1 dark against 4.5:1; fix it or CORE/HUB baselines the name. Also unmeasured: .gm-badge.earned .gm-badge-mark (light, 1.94:1 reported). actions-sos: once 638c94a is on the trunk the lock-opening hook is added here.
- Run 2026-11-08 09:19: actions-sos V-41 (Actions.objective.done, Actions.questLine.claim) and content V-42 must merge for the two skipped flows to run; V-43 hooks used as contracted.
- Run 2026-11-08 06:06: none new; #/status hooks were found. today-track: FIX-EMBED red in its npm test (not ours).
- Older requests: see the annex.
- Core / actions-sos: keep sos-urgent, sos-*, lock-*, onb-* and data-tour nav-* names as contracted.

### Docs owed
- Run 2026-11-09 19:59: counts to 32 browser flows (not 29) in CLAUDE.md, READMEs, guide: FIX-COUNTS-4's. The .docx was rebuilt for T4.
- Run 2026-11-09: V-29 row and true counts done. Still owed: counts to 723 of 723 and the .docx after the .coach-sos fix.
- Older docs-owed lines: see C:/Users/ruchi/1-addic-wt/_logs/reports/tests-docs-report-annex.md

### Open questions
- Run 2026-11-09 19:59: none new; T1 uses an init script (default kept). C1 and C2 left open by design.
- Run 2026-11-09: brief Q3 kept (a red contrast pair is named, not skipped, goes to the token owner). The builder chose todo; the check overruled it (C1). Open for CORE/HUB: baseline "contrast: .coach-sos (dark)" in coordination/baselines.md or land the styles.css:568 fix before merge.
- Run 2026-11-08 09:19: none new. Default kept: counts are the last full runs' (616 checks; browser 26 pass, 2 skip by name).
- Run 2026-11-08 06:06: none new. Brief Q1 kept: counts are the last green full run's (582 in 15 files, browser 25/0/0).
- Run 2026-11-08 04:07: none new. Default kept: README names offline/releases/1-addic-v1.1.html although it lands with the merge.
- Run 2026-11-08 03:26: none new; Q1 closed (see Units).
- Run 2026-11-08: (g) closed: scripts.screens built. (h) the duplicate Settings slug was dropped, 72 images. Defaults kept.
- Run 09:53: (d) the .docx is committed and reproducible (default kept); (e) scripts.check uses `python` (default kept); (f) guide docx date fixed at 2026-11-07 (default kept); (g) scripts.screens waits for U-35.
- (a) The 19th test name is an addition to the stable list. Default: kept.
- (b) "export erase import" compares every store except meta. Default: kept.
- (c) Craving and drill tests install Playwright's clock and fast-forward 16 minutes only when the sos-timer shows. Default: kept.

### For the HUB at the merge
- Run 2026-11-09 19:59: no shared file changes; browser expect 32/0/0; lane test gate covers 1 file only. 2 PNGs and the guide .docx changed.
- Run 2026-11-09: no shared file changes. npm test is RED on one name until baselined or fixed: "contrast: .coach-sos (dark)" (expect 723 checks, 722 pass, 1 fail). The lane gate runs only harness.test.mjs, so its GREEN does not cover it. Browser expect 29/0/0. Territory: 2 nobody-file warnings, both named by the brief.
- Shared file: package.json, only scripts["test:browser"] (after scripts.test) and devDependencies.playwright "1.65.0" added by JSON-parse edit; core's keys unchanged except a trailing comma on the scripts.test line. package-lock.json adds playwright and playwright-core 1.65.0. Expect a package.json/lock conflict if another lane adds dependencies; re-run npm install to regenerate the lock.
- Territory warnings: none.
- Browser tests to run in the quiet window: `npm run test:browser` after the build on the merged tree; read every SKIP reason and expect the 14 skips to shrink as store.js and the screens land.
- Run 09:53: shared files: README.md and CLAUDE.md append '## Offline edition' at the end; package.json scripts.check. The docs gate needs python-docx and gen_docx.py (local); in the cloud it exits 1 naming the missing piece. 1-addic-Guide.docx is regenerated byte-identically.
- Run 2026-11-08: shared file package.json gains only scripts.screens. 72 PNGs (about 1.3 MB) under offline/docs/images. Run `npm run screens` after the merge only if the images need regenerating; U-36b follows.
- Run 2026-11-08 03:26: no shared file changes since the last run. The guide .docx is regenerated byte-identically by the docs gate. Run `npm run screens` before V-01t so the status images exist.
- Run 2026-11-08 04:07: no new shared file changes beyond two appended lines each in README.md and CLAUDE.md '## Offline edition'. Expect browser 21/0/0 on the merged tree; offline/releases/1-addic-v1.1.html must exist for the README to be true. Run `npm run screens` before V-01t.
- Run 2026-11-08 06:06: no shared file changes (README.md and CLAUDE.md '## Offline edition' lines only). Expect browser 25/0/0 and npm test 582 checks in 15 files (today-track FIX-EMBED red is its lane's). Run `npm run screens` if status images need regenerating.
- Run 2026-11-08 09:19: no shared file changes (README.md and CLAUDE.md '## Offline edition' count lines only). Expect browser 28/0/0 on a tree with V-41 and V-42; 26/0/2 without. Keep Lesson 16 out of a tag cut until they merge.

## CORE's note at the tip (2026-11-09 20:19 IST)

The tip is 1686bb8, one commit after the checker's 0ce14e5: C1 fixed (a missing urgent-help control or PIN field fails the lock-page flow instead of skipping it). That flow re-run on a fresh build: 1 pass, 0 skip. The full suite was last run at 0ce14e5 (32/0/0).
