## workbook-settings (SCREENS, 1-addic offline build): the slice report

State: READY (run 5, 2026-11-09 15:01 IST, V-22b built, check PASS, tip 419718c, base cbe76a57, diffFrom 4f66761). Before: READY-SLICE (run 4, 2026-11-09 14:55 IST, V-24 built, check PASS, tip 4f66761, base cbe76a57; V-22b not built, next batch). Before: READY (run 3, 2026-11-07 17:58 IST, FIX-SAMPLE built, check PASS). Branch build/workbook-settings. Base 1ef2482e. Tip 0e76065 (was 9cbf630 after run 2, cc1f1ea, READY-SLICE, run 2026-11-07 16:15 IST). Run 2 (continued from cc1f1ea) 2026-11-07 16:31 IST.
Commits:
- 83aa85b feat U-19 Settings page, seven tabs
- e0af4fd test U-19 helpers, tab renders, memory round trips
- cc1f1ea fix U-19 data actions also carry the base browser hooks
Run 2 (2026-11-07 16:31 IST), after cc1f1ea:
- 1097dad fix U-19 C3 high contrast on every screen from the saved setting
- a0ac47b test U-19 C4 fresh-context guard says it only loads
- 0b060a6 feat U-20a Reasons Card, big view, Support Network
- 6ebb964 test U-20a wrap, contacts, card, image export, contact round trip
- bfa0e93 feat U-20b workbook browser and every artifact page
- 9d96690 feat U-21 My Recovery Plan
- 5e80f01 fix U-21 C5 erase/import drop an unsaved plan draft
- 9cbf630 test U-20b C6 practise link checked both ways
Run 5 (2026-11-09 15:01 IST), after 4f66761 (tip 419718c):
- 419718c test(settings, V-22b) the sample card test asserts the eraseSample round trip (C1b)
Run 4 (2026-11-09 14:55 IST), after cbe76a57 (tip 4f66761):
- 4f66761 fix(settings, V-24) the early-access sentence says what is true now
Run 3 (2026-11-07 17:58 IST), after 9cbf630:
- 03c3631 fix FIX-SAMPLE Load sample data only on a notebook without an own profile
- 0e76065 test FIX-SAMPLE own profile, no profile and sample profile, by name

### Turn caps
Run 5 (2026-11-09 15:01 IST): builder V-22b steps_used 8. capHits 0.
Builder (U-19): steps_used 36, returned a note. capHits 0.
Run 2 (2026-11-07): builder U-20a steps_used 33; builder U-20b+U-21 steps_used 44; check-fix builder (C5, C6) returned a note. capHits 0.
Run 3 (2026-11-07 17:58 IST): builder FIX-SAMPLE steps_used 14. capHits 0.
Run 4 (2026-11-09 14:55 IST): builder V-24 steps_used 8. capHits 0.

### Units
Run 5 (2026-11-09 15:01 IST):
- V-22b (419718c, tier 2, test only). Nothing changes for a person using the file. The sample card test (workbook-settings.test.mjs:274-294) keeps its name and runs the real Content.sample and Actions with no if: asserts both exist, Load enabled, Erase disabled with "No sample data is loaded." before a load, a sample log and an own log exist, then erase leaves own rows. Questions closed: C1 (the round trip can now fail). Held: none. Spec was the chat's note (v1 brief has no V-22b).
- U-19 Settings (83aa85b, e0af4fd, cc1f1ea). #/settings and #/settings/<tab> (privacy, look, rhythm, names, help, about, data; unknown goes to privacy). A person can: set, change, remove a PIN and the ... (full text: workbook-settings-report-annex.md)
- Held/blocked: none.
Run 4 (2026-11-09 14:55 IST):
- V-24 (4f66761, tier 2). ABOUT.early (ui-settings.js:65) now reads: "Every screen is in the app now, and where content is still coming, the screen says so. Your notes stay on this device." A person no longer reads that screens are unfinished. True at the tip: every known route has a page, all six Actions hub cards are ready, all 19 workbook exercises are in Content.exercises. The 'Early access' card title and ui-onboarding COPY.early left as they are. Built file: new words 1 hit, old 0.
- V-22b (C1b, workbook-settings.test.mjs:278-294): not built this run; next batch, a fresh builder: assert Content.sample.generate and Actions.eraseSample exist and run the round trip without the if; keep the test name. Held units: none (V-22b waits for its batch). Questions closed: C1 treated closed on e8da3fbd (R-S-18) per lane note; V-22b hardens it.
Run 2 (2026-11-07 16:31 IST):
- U-20a Reasons Card and Support Network (0b060a6, 6ebb964). #/workbook/reasons, ?big=1, #/workbook/network. A person sees the four-list card (via Engine.reasonsCardSections, so it matches what SOS reads), an honest empty state, a big view with Back to SOS and Call someone (no tips or tours), a 1080x1920 image download, contacts grouped by role, hide instead of delete, tel: links only, and a "Stays on this device" line. Contact reached goes through Actions.
- U-20b Workbook browser (bfa0e93). All 18 artifacts in four groups; risks only behind "Show sensitive items"; latest answer as text, history newest first; Edit only when the exercise is known; print; "I said it" records ScriptUsed. At BASE Content.exercises is absent, so non-own artifacts show an honest "Coming in a later version" stub with no Edit; they become Edit buttons when content U-31b lands.
- U-21 My Recovery Plan (9d96690). #/workbook/plan: prefilled, add, edit, reorder, remove, confirm per section, save (confirmedAt, RecoveryPlanConfirmed once), Refresh only adds, print lists only, "Still true?" after 30 days.
- Questions closed: O7 honest stubs and empty state; code over brief on reasonsCardSections and ExerciseUI.exerciseFor/summarize.
Held units run 2: none.
Run 3 (2026-11-07 17:58 IST):
- FIX-SAMPLE (03c3631, 0e76065; HUB R-H-28, R-S-9, CORE R-C-28). Settings > Your data > Sample data: when the notebook holds an own profile (row 'me', not sample: true), Load sample data is disabled and a line says why ("Sample data is for a fresh notebook. This one already holds your own profile, so the sample is not loaded. Your entries stay as they are."), tied by aria-describedby. A tap on a stale page is checked again and nothing is loaded. No profile or the sample's own profile: as before. Closes R-H-28 for Settings (stop-gap kept as a second check after actions-sos RS-SAMPLE merges; default keep). Held units run 3: none.
- To build (earlier run): U-20a (ui-workbook.js: UI.pages.workbook, #/workbook/reasons, ?big=1, #/workbook/network; read engine.js:684-698 and actions.js:509-540), U-20b (artifact browser, ARTIFACTS/GROUPS, data-tour workbook-groups and workbook-card), U-21 (ui-plan.js: PlanUI.view/merge/SECTIONS, data-tour plan-sections and plan-print; Engine.prefillRecoveryPlan engine.js:831, Actions.recoveryPlan.save ~actions.js:870).

### Contract changes
Run 5: none.
- (run 4) none; ABOUT.early text changed only.
- (run 3) SettingsUI.hasOwnProfile(view) (pure, exported); SettingsUI.TEXT.sampleOwnProfile; doLoadSample returns false (refused) or true. New hook data-test="load-sample-note" (only with an own profile); tests-docs to add to helpers/hooks.mjs.
- (run 2) UI.pages.workbook (#/workbook/reasons, reasons?big=1, network, plan, browser); WorkbookUI (ARTIFACTS, GROUPS, reasonsSections, exerciseKnown); PlanUI (view, merge, SECTIONS, reset); data-tour workbook-groups, workbook-card, plan-sections, plan-print. html[data-contrast] now applied by the lane (1097dad).
- UI.pages.settings in ui-settings.js. Consumers: ui-core router, today (link), onboarding (PIN link).
- SettingsUI global: page, doExport, doImport, doErase, doLoadSample, doEraseSample, printLogs; pure on module.exports: TABS, TEXT, ABOUT, ERASE_PARTIAL_TEXT, normalTab, pinOk, pinError, backupName, logRows, errorText, importErrorText, importedText. Consumer: tests.
- Routes: #/settings, #/settings/privacy|look|rhythm|names|help|about|data.
- data-test hooks: settings-page, settings-tab-<tab>, settings-message, store-status, set-pin, pin-current, pin-input, pin-input2, pin-save, remove-pi ... (full list: workbook-settings-report-annex.md)
- html[data-contrast="high"] set by Settings; consumer none yet (core should apply on every render).
- Events, content keys, data-tour targets: none.

### Gates
Run 5 (2026-11-09 15:01 IST), VERIFIED by the check: build GREEN 1205504 B (build-20261109-150402.log), test 25/25 (test-20261109-150403.log), validate GREEN (validate-20261109-150407.log), guards 5/5 (guards-20261109-150407.log), all under C:/Users/ruchi/1-addic-wt/_logs/gates/workbook-settings/. Mutations of eraseSample and Content.sample each fail the test. ASSUMED: browser gate not run (test only). Territory: cbe76a57..HEAD 2 files, both own, 0 shared, 0 warnings. Side effect: tracked offline/1-addic.html modified by the build gate; never commit it.
Run 4 (2026-11-09 14:55 IST), VERIFIED by the check at 4f66761, logs in C:/Users/ruchi/1-addic-wt/_logs/gates/workbook-settings/:
- build GREEN 1205504B: build-20261109-145810.log
- test GREEN 25/0 (lane file): test-20261109-145811.log
- validate GREEN: validate-20261109-145826.log
- guards GREEN 5/0: guards-20261109-145826.log
ASSUMED: builder build-20261109-145653, test-20261109-145656, validate-20261109-145701, guards-20261109-145702. Browser NOT RUN (no flow reads the words).
Territory run 4, cbe76a57..HEAD: 1 file, 1 own (ui-settings.js), 0 shared, 0 errors, 0 warnings; trailers present.

Run 3 (2026-11-07 17:58 IST), VERIFIED by the check at 0e76065, logs in C:/Users/ruchi/1-addic-wt/_logs/gates/workbook-settings/:
- build GREEN: build-20261107-180752.log
- test GREEN 25/0 (FIX-SAMPLE tests ok 9-12): test-20261107-180754.log
- validate GREEN: validate-20261107-180807.log
- guards RED 11 failures, all other lanes' tour targets (bp-*, insights-*, review-start baselined; quicklog-*, planner-* lifted on trunk but absent from this older branch); the diff touches no data-tour: guards-20261107-180808.log
ASSUMED (builder, not run by the check): browser GREEN 10 pass / 9 skip: browser-20261107-180341.log; builder build-20261107-180319, test-20261107-180323, validate-20261107-180339, guards-20261107-180340.
Territory run 3, 1ef2482e..HEAD: 5 files, 4 own, 1 shared (styles.css, append point, earlier run), 0 nobody's, 0 errors, 0 warnings. Continuation commits touch only ui-settings.js and workbook-settings.test.mjs.

Run 2 (2026-11-07 16:31 IST), VERIFIED by the check at 9d96690, and at 9cbf630 by the re-check; logs in C:/Users/ruchi/1-addic-wt/_logs/gates/workbook-settings/:
- build GREEN 559958B: build-20261107-170726.log; 9cbf630: build-20261107-172657.log
- test GREEN 20/0: test-20261107-170729.log; 9cbf630 21 passed: test-20261107-172659.log
- validate GREEN: validate-20261107-170902.log; 9cbf630: validate-20261107-172713.log
- guards RED pass 4 fail 11, all baselined, none this lane's (planner-*, bp-*, review-start still baselined; quicklog-*, insights-* lifted by today-track merge 9f3026c6, absent from this older base): guards-20261107-170903.log; 9cbf630: guards-20261107-172714.log. This lane's workbook-groups, workbook-card, plan-sections, plan-print now pass; the HUB can lift them.
ASSUMED (not run by the check): browser-20261107-170132.log, browser-20261107-172225.log; builders' build-20261107-164020, test-20261107-164023, validate-20261107-164035, guards-20261107-164035.
Territory run 2, 1ef2482e..HEAD: 5 files, 4 own (ui-plan.js, ui-settings.js, ui-workbook.js, tests/workbook-settings.test.mjs), 1 shared at append point (styles.css, no token redefined), 0 errors.

Earlier run:
VERIFIED (check run, tip cc1f1ea):
- build GREEN size 495935B: C:\Users\ruchi\1-addic-wt\_logs\gates\workbook-settings\build-20261107-162757.log
- test GREEN pass 10 fail 0: ...\test-20261107-162758.log
- validate GREEN: ...\validate-20261107-162759.log
- guards RED pass 4 fail 15: ...\guards-20261107-162759.log. All 15 are tour targets baselined in coordination/baselines.md lines 26-40 (quicklog-button, quicklog-intensity, quicklog-save, planner-day, planner-gaps, planner-add, bp-new, bp-form, workbook-groups, workbook-card, insights-triggers, insights-heatmap, review-start, plan-sections, plan-print); no new name.
- Territory 1ef2482e..HEAD: 3 files, 2 own, 1 shared (styles.css, appended section), 0 nobody's, 0 errors, 0 warnings.
ASSUMED (builders' report, not re-run by the check):
- browser pass 9, skip 10, fail 0: ...\browser-20261107-162626.log; PIN/export/erase/import/dark flows passing: ...\browser-20261107-162555.log.
- Builders' own build/test/validate/guards logs: ...\build-20261107-162625.log, test-20261107-162625.log, validate-20261107-162626.log, guards-20261107-162626.log.

### Review gates
None.

### Check
Verdict PASS at cc1f1ea. Findings (all LOW, no fix commits, none re-checked):
- C1 workbook-settings.test.mjs:284-294: the eraseSample round trip runs only when Content.sample.generate and Actions.eraseSample exist; re-check after actions-sos and content U-33 merge.
- C2 ui-settings.js:534,613: brief says erase goes to #/onboarding; built stays on #/settings/data with a Start again link (a recorded change).
- C3 ui-settings.js:158-164,625: highContrast applied only while Settings renders; ui-core.js:645-646 does not apply it. After a reload it stays off until Settings opens.
- C4 test:133-136: comment says the file "renders" but the test only loads it and checks normalTab; correct the comment or add a render.
Not checked: browser gate by the check; real-browser rendering (44 px, focus, contrast); reading level only by reading.

Run 2 (2026-11-07 16:31 IST): verdict FIX at 9d96690, clean at 9cbf630. Not checked: browser gate; real-browser rendering and reading level; full Node suite; Edit round trip against real Content.exercises (content U-31b unmerged).
- C3 FIXED 1097dad (test 11 passes). C4 FIXED a0ac47b. C1 stays OPEN by name (needs actions-sos eraseSample and content U-33).
- C5 MEDIUM U-21 ui-plan.js:107,118-122,241 / ui-settings.js:521-539: unsaved plan draft survived Erase everything and Import. Fix 5e80f01 (plan resets on Store labels resetAll/replaceAll). Re-check: FIXED.
- C6 LOW U-20b test:594-595: practise-link check ran only if (pr), could not fail. Fix 9cbf630. Re-check: FIXED.
- New findings: none blocking.
Run 3 (2026-11-07 17:58 IST): verdict PASS at 0e76065 over 9cbf630...HEAD; FIX-SAMPLE present and meets R-H-28. Findings: none new; C1 stays OPEN by name (Actions.eraseSample and Content.sample not in this tree; tests use stand-ins). Not checked: browser gate (hook load-sample-note not yet in hooks.mjs); real Actions.loadSample round trip; U-19..U-21 before 9cbf630 not re-judged. Notes: C:/Users/ruchi/1-addic-wt/_logs/reports/workbook-settings/workbook-settings__check.md. The build gate left offline/1-addic.html modified in the worktree (uncommitted; builder restored it).

Run 4 (2026-11-09 14:55 IST): verdict PASS at 4f66761 over cbe76a57..HEAD. Findings: none new (id/severity/fix/re-check: none). V-24 meets its note; earlier units present by search, not re-reviewed. C1 round trip still behind an if at test:286, V-22b covers it. Not checked: browser gate, full Node suite, Guide.md:431/:439 (tests-docs), clinical wording (no crisis content). Side effect: build gate left offline/1-addic.html modified, uncommitted; run git checkout -- offline/1-addic.html before V-22b.

Run 5 (2026-11-09 15:01 IST): verdict PASS at 419718c over 4f66761..HEAD. Earlier units not re-judged. Finding C1 (check id, LOW, V-22b leftover): comment at test:296-297 says "This tree has no Content.sample", which line 278 contradicts; fix SHA none; finder's re-check: open. Not checked: browser gate; product rules on source (nothing changed).

### Review
Run 5: none (not flagged).
Not a flagged lane: no reviewers run.
Run 3: no review findings (not flagged).
Run 4: none (not flagged).

### Safety and content marks
Run 5: none (test only; no words, no network, SOS untouched).
- (run 3) FIX-SAMPLE: no crisis or medical line, no numbers; clinicalReview and verify none. Sample never overwrites an own profile.
- (run 2) Reasons big view is ungated and calm; no new numbers or clinical claims; risks behind Show sensitive items; tel: links only.
- (run 4) V-24: two short original sentences, no number, no crisis or medical content; no promise of outcomes.
- clinicalReview: true: offline/src/ui-settings.js ABOUT (line 58): the "in danger, open SOS and tap Urgent help" line and the not-medical-advice line. The reviewer checks the wording and that it points to SOS and Urgent help.
- verify: true: none (no numbers; Urgent help is a link to #/sos/urgent).

### Requests for other lanes
- (run 5) tests-docs: fix the comment above withSampleStandIns (test:296-297). P.TEXT.eraseSampleLater and the !canErase branch in ui-settings.js are reachable only if Actions.eraseSample is missing; another test pins that wording; removing it needs its own unit.
- (run 4) tests-docs: offline/docs/1-addic-Guide.md:431 ('not built yet in this version') and :439 ('Some screens are not finished') now sit beside the new sentence; update if wanted. Default: left as is.
- (run 3) tests-docs: add data-test="load-sample-note" to helpers/hooks.mjs. HUB/CORE: R-H-28 Settings stop-gap at 0e76065; keep as second check after actions-sos RS-SAMPLE.
- (run 2) content U-31b: Content.exercises, then re-run node --test offline/tests/workbook-settings.test.mjs. HUB: lift baselines workbook-groups, workbook-card, plan-sections, plan-print. The core request for high contrast is moot: 1097dad applies it in-lane.
- offline/src/ui-core.js (core): apply settings.highContrast (html[data-contrast]) on every render, beside textSize and reducedMotion at lines 645-646.
- Actions.eraseSample (actions-sos) and Content.sample (content U-33): needed to enable the sample controls.
- GuidanceUI.coach and GuidanceUI.training (guidance): the tour and drills buttons appear when these exist.
- offline/tests/helpers/hooks.mjs (tests-docs): contract names use data-test; BASE hooks use data-testid; both are on the controls.

### Docs owed
- (run 5) none.
- Older docs owed (runs 1 to 4): see C:/Users/ruchi/1-addic-wt/_logs/reports/workbook-settings-report-annex.md

### Open questions
8. (run 5) Remove the dead eraseSampleLater branch? Default: left, own unit later.
7. (run 4) Guide lines 431/439 contradict the new sentence; default: left, tests-docs file.
6. (run 3) Keep the Settings own-profile guard after RS-SAMPLE merges? Default: keep. C1 open by name.
4. (run 2) Brief says Engine does not export reasonsCardSections; it does (engine.js:1500); code used.
5. (run 2) Stubs until Content.exercises exists; default: honest stub.
1. Erase success: brief says #/onboarding; built stays on #/settings/data with Start again and the import control.
2. Hook attribute: contract data-test, BASE hooks data-testid; both set.
3. High contrast not applied by core on every render; asked of core.

### For the HUB at the merge
- (run 5) Merge 419718c over cbe76a57 (V-24 already merged as 2cf7c40e): V-22b adds only the test file, no shared file. Never commit offline/1-addic.html.
- (run 4) Merge 4f66761 over cbe76a57: one file (ui-settings.js), no shared file. Never commit offline/1-addic.html (the gate leaves it modified).
- (run 3) Merge 0e76065 over be0f806d: two files (ui-settings.js, workbook-settings.test.mjs), no shared file. Never commit offline/1-addic.html.
- (run 2) styles.css lane section now lines 382-470; ui-plan.js already in build.mjs parts (line 38); never commit offline/1-addic.html. This lane's four tour names pass guards.
- Shared file: offline/src/styles.css, one section appended at the end (lines 382-422), no token redefined. Expect an append-point conflict if other lanes also append there.
- package.json and package-lock.json: unchanged. ui-settings.js was already in build.mjs parts (line 33); build.mjs untouched.
- Territory warnings: none.
- Quiet-window browser tests: "PIN set lock unlock export" and "export erase import restores everything", plus the dark flow.
