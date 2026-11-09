## workbook-settings (SCREENS, 1-addic offline build): the slice report

State: READY (run 7, 2026-11-09 18:56 IST, R-S-32 built, check PASS, tip b76d4f3, base 17d6b503, diffFrom 17d6b503). Before: READY (run 6, 18:21 IST, tip 8e825fc).
Commits:
Run 7 (2026-11-09 18:56 IST), after 17d6b503 (tip b76d4f3):
- b76d4f3 fix(workbook-settings, R-S-32): Settings Help shows one Replay the tour control
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
Run 6 (2026-11-09 18:21 IST), after 903016cc (tip 8e825fc):
- 8e825fc fix(workbook-settings, FIX-WS-LOWS): the shipped promise of a later update is gone; a stale comment made true
- da7e08c fix(workbook-settings, FIX-TOUR-REPLAY): Replay the tour is a link to Today with tour=1
Run 5 (2026-11-09 15:01 IST), after 4f66761 (tip 419718c):
- 419718c test(settings, V-22b) the sample card test asserts the eraseSample round trip (C1b)
Run 4 (2026-11-09 14:55 IST), after cbe76a57 (tip 4f66761):
- 4f66761 fix(settings, V-24) the early-access sentence says what is true now
Run 3 (2026-11-07 17:58 IST), after 9cbf630:
- 03c3631 fix FIX-SAMPLE Load sample data only on a notebook without an own profile
- 0e76065 test FIX-SAMPLE own profile, no profile and sample profile, by name

### Turn caps
Run 7 (2026-11-09 18:56 IST): one builder, R-S-32, steps_used 9. capHits 0.
Run 6 (2026-11-09 18:21 IST): one builder, FIX-TOUR-REPLAY + FIX-WS-LOWS, steps_used 10. capHits 0.
Run 5 (2026-11-09 15:01 IST): builder V-22b steps_used 8. capHits 0.
Builder (U-19): steps_used 36, returned a note. capHits 0.
Run 2 (2026-11-07): builder U-20a steps_used 33; builder U-20b+U-21 steps_used 44; check-fix builder (C5, C6) returned a note. capHits 0.
Run 3 (2026-11-07 17:58 IST): builder FIX-SAMPLE steps_used 14. capHits 0.
Run 4 (2026-11-09 14:55 IST): builder V-24 steps_used 8. capHits 0.

### Units
Run 7 (2026-11-09 18:56 IST):
- R-S-32 (b76d4f3, tier 2). Settings > Help now shows one "Replay the tour" control (the link at ui-settings.js:420); helpTab filters the tour entry (kind tour) out of the training list before the empty check (:422), so a list holding only the tour says "No training drills yet."; the filter on d.route stays; ui-guidance.js unchanged, so Training elsewhere still offers the tour. Test "workbook-settings R-S-32: Settings Help shows one Replay the tour control" failed before the fix (2 controls), passes now. Spec was the chat unit note (brief has no R-S-32; base line was :422 not :421). Held: none. Closes open question 9.
Run 6 (2026-11-09 18:21 IST):
- FIX-TOUR-REPLAY (da7e08c, tier 2). Settings > Help: "Replay the tour" is now a link (ui-settings.js:420, href #/today?tour=1, data-test tour-replay) so the tour opens on Today, not where it was pressed; the G.coach guard and the tour-later else are kept. Test by name; it fails on the old button (expected a, actual button). Tour browser flows green (3).
- FIX-WS-LOWS (8e825fc, tier 2). The eraseSampleLater key and its dead branch are gone (no reader under offline/); eraseLine as specified at ui-settings.js:602; canErase kept on the button; a stale comment corrected; the pure-helpers assert changed, name kept. Nothing visible changes for a person using the file. Closes open question 8.
- Held: none. Spec was the chat unit notes (the v1 brief has neither unit). Line shift: deleting line 50 moved ui-settings.js lines after it up by one.
Run 5 (2026-11-09 15:01 IST):
- V-22b (419718c, tier 2, test only). Nothing changes for a person using the file. The sample card test (workbook-settings.test.mjs:274-294) keeps its name and runs the real Content.sample and Actions with no if: asserts both exist, Load enabled, Erase disabled with "No sample data is loaded." before a load, a sample log and an own log exist, then erase leaves own rows. Questions closed: C1 (the round trip can now fail). Held: none. Spec was the chat's note (v1 brief has no V-22b).
- U-19 Settings (83aa85b, e0af4fd, cc1f1ea). #/settings and #/settings/<tab> (privacy, look, rhythm, names, help, about, data; unknown goes to privacy). A person can: set, change, remove a PIN and the ... (full text: workbook-settings-report-annex.md)
- Held/blocked: none.
Run 4 (2026-11-09 14:55 IST):
- V-24 (4f66761, tier 2). ABOUT.early (ui-settings.js:65) now reads: "Every screen is in the app now, and where content is still coming, the screen says so. Your notes stay on this device." A person no longer reads that screens are unfinished. True at the tip: every known route has a page, all six Actions hub cards are ready, all 19 workbook exercises are in Content.exercises. The 'Early access' card title and ui-onboarding COPY.early left as they are. Built file: new words 1 hit, old 0.
- V-22b (C1b, workbook-settings.test.mjs:278-294): not built this run; next batch, a fresh builder: assert Content.sample.generate and Actions.eraseSample exist and run the round trip without the if; keep the test name. Held units: none (V-22b waits for its batch). Questions closed: C1 treated closed on e8da3fbd (R-S-18) per lane note; V-22b hardens it.
Runs 2 and 3 unit text (U-20a, U-20b, U-21, FIX-SAMPLE): see workbook-settings-report-annex.md

### Contract changes
Run 7: none (helpTab drill list filter only; no key, hook or route changed).
Run 6: P.TEXT.eraseSampleLater removed; tour-replay is an a (href #/today?tour=1), was a button; data-test unchanged. Lines after ui-settings.js:50 are one lower.
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
Run 7 (2026-11-09 18:56 IST), VERIFIED by the check at b76d4f3, logs under C:/Users/ruchi/1-addic-wt/_logs/gates/workbook-settings/: build GREEN 1211537 B (build-20261109-185850.log); test GREEN 27/0/0 lane file (test-20261109-185852.log); validate GREEN (validate-20261109-185856.log); guards GREEN 5/5 (guards-20261109-185856.log); browser GREEN 29/0/0 incl. tour complete, tour skip, tour replay from Settings Help (browser-20261109-185856.log). ASSUMED (builder): build-20261109-185756, test-20261109-185757, validate-20261109-185758, guards-20261109-185758, browser-20261109-185803. Territory 17d6b503..HEAD: 2 files, both own (ui-settings.js, workbook-settings.test.mjs), 0 shared, 0 errors, 0 warnings; trailers present, diff --check clean. Not run: the other 15 Node test files. Side effect: the build gate rewrote tracked offline/1-addic.html (modified, uncommitted); restore with git checkout -- offline/1-addic.html, never commit.
Run 6 (2026-11-09 18:21 IST), VERIFIED by the check at 8e825fc, logs under C:/Users/ruchi/1-addic-wt/_logs/gates/workbook-settings/: build GREEN 1211497 B (build-20261109-182536.log); test GREEN 26/0/0 lane file (test-20261109-182537.log); validate GREEN (validate-20261109-182539.log); guards GREEN 5/5 (guards-20261109-182540.log); browser --grep tour GREEN 3 (browser-20261109-182639.log). ASSUMED (builder): build-20261109-182414, test-20261109-182414, validate-20261109-182416, guards-20261109-182416, browser-20261109-182421. Territory 903016cc..HEAD: 2 files, both own (ui-settings.js, workbook-settings.test.mjs), 0 shared, 0 errors, 0 warnings; trailers present. Not run: full browser and full Node suite. The gate rebuilt offline/1-addic.html (modified, uncommitted).
Older gate blocks (runs 1 to 5): see workbook-settings-report-annex.md

### Review gates
Run 7: none (not flagged).
Run 6: none (not flagged).
None.

### Check
Run 7 (2026-11-09 18:56 IST): verdict PASS at b76d4f3 over 17d6b503..HEAD. Findings: none (id/severity/fix/re-check: none). R-S-32 meets its note; the new test fails on the old line (expected 1, actual 2). Earlier units present by named tests, not re-judged (C1, V-22b, FIX-WS-LOWS mainly on the record). Not checked: other 15 Node files; lane CSS; no copy changed so no copy/crisis review.
Run 6 (2026-11-09 18:21 IST): verdict PASS at 8e825fc over 903016cc..HEAD. Findings: none (id/severity/fix/re-check: none). Mutations fail the new tests (old button, a link that calls coach, restored key). Earlier units confirmed by passing tests, not re-judged. Not checked: full browser and Node suites. For the chat, not findings: the Help tab shows two "Replay the tour" links with one destination (ui-settings.js:420 and training() at ui-guidance.js:223); cites one too high at browser.test.mjs:187, :522, :524 and hooks.mjs:72-118; comment at ui-guidance.js:381 out of date.

Runs 1 to 3 check text (C1 to C6): see workbook-settings-report-annex.md; C1 open by name (V-22b hardens it), C5 and C6 fixed.

### Review
Run 7: none (not flagged).
Run 5: none (not flagged).
Not a flagged lane: no reviewers run.
Run 3: no review findings (not flagged).
Run 4: none (not flagged).

### Safety and content marks
Run 7: none (no words changed; SOS untouched).
Run 6: none (no new words, numbers, network or crisis content; SOS untouched); no clinicalReview or verify added.
Run 5: none (test only; no words, no network, SOS untouched).
- (run 3) FIX-SAMPLE: no crisis or medical line, no numbers; clinicalReview and verify none. Sample never overwrites an own profile.
- (run 2) Reasons big view is ungated and calm; no new numbers or clinical claims; risks behind Show sensitive items; tel: links only.
- (run 4) V-24: two short original sentences, no number, no crisis or medical content; no promise of outcomes.
- clinicalReview: true: offline/src/ui-settings.js ABOUT (line 58): the "in danger, open SOS and tap Urgent help" line and the not-medical-advice line. The reviewer checks the wording and that it points to SOS and Urgent help.
- verify: true: none (no numbers; Urgent help is a link to #/sos/urgent).

### Requests for other lanes
- (run 7) none new. Open from run 6 stays: tests-docs cites one too high; guidance comment at ui-guidance.js:381. The duplicate control is resolved in this lane.
- (run 6) tests-docs: fix the ui-settings.js line cites (browser.test.mjs:187, :522, :524; hooks.mjs:72-118), one too high. guidance (ui-guidance.js): comment at :381 says the tour runs where pressed; it now arrives on Today. HUB/owner: two "Replay the tour" controls show in Help; to drop one, filter kind tour out of the drill list in helpTab (this lane) or stop the push at ui-guidance.js:223. Default: both shown.
- (run 5) tests-docs: fix the comment above withSampleStandIns (test:296-297). P.TEXT.eraseSampleLater and the !canErase branch in ui-settings.js are reachable only if Actions.eraseSample is missing; another test pins that wording; removing it needs its own unit.
- (run 4) tests-docs: offline/docs/1-addic-Guide.md:431 ('not built yet in this version') and :439 ('Some screens are not finished') now sit beside the new sentence; update if wanted. Default: left as is.
- (run 3) tests-docs: add data-test="load-sample-note" to helpers/hooks.mjs. HUB/CORE: R-H-28 Settings stop-gap at 0e76065; keep as second check after actions-sos RS-SAMPLE.
- (run 2) content U-31b: Content.exercises, then re-run node --test offline/tests/workbook-settings.test.mjs. HUB: lift baselines workbook-groups, workbook-card, plan-sections, plan-print. The core request for high contrast is moot: 1097dad applies it in-lane.
- offline/src/ui-core.js (core): apply settings.highContrast (html[data-contrast]) on every render, beside textSize and reducedMotion at lines 645-646.
- Actions.eraseSample (actions-sos) and Content.sample (content U-33): needed to enable the sample controls.
- GuidanceUI.coach and GuidanceUI.training (guidance): the tour and drills buttons appear when these exist.
- offline/tests/helpers/hooks.mjs (tests-docs): contract names use data-test; BASE hooks use data-testid; both are on the controls.

### Docs owed
- (run 7) none.
- (run 6) none.
- (run 5) none.
- Older docs owed (runs 1 to 4): see C:/Users/ruchi/1-addic-wt/_logs/reports/workbook-settings-report-annex.md

### Open questions
9. closed by R-S-32 (run 7): one Replay the tour control in Help.
9. (run 6) Two Replay the tour controls in Help; default: both shown, asked of the HUB.
8 is closed by FIX-WS-LOWS (run 6).
8. (run 5) Remove the dead eraseSampleLater branch? Default: left, own unit later.
7. (run 4) Guide lines 431/439 contradict the new sentence; default: left, tests-docs file.
6. (run 3) Keep the Settings own-profile guard after RS-SAMPLE merges? Default: keep. C1 open by name.
4. (run 2) Brief says Engine does not export reasonsCardSections; it does (engine.js:1500); code used.
5. (run 2) Stubs until Content.exercises exists; default: honest stub.
1. Erase success: brief says #/onboarding; built stays on #/settings/data with Start again and the import control.
2. Hook attribute: contract data-test, BASE hooks data-testid; both set.
3. High contrast not applied by core on every render; asked of core.

### For the HUB at the merge
- (run 7) Merge b76d4f3 over 17d6b503: two files (ui-settings.js, workbook-settings.test.mjs), no shared file. Never commit offline/1-addic.html (the build gate modified it; restore it).
- (run 6) Merge 8e825fc over 903016cc: two files (ui-settings.js, workbook-settings.test.mjs), no shared file. Never commit offline/1-addic.html.
- (run 5) Merge 419718c over cbe76a57 (V-24 already merged as 2cf7c40e): V-22b adds only the test file, no shared file. Never commit offline/1-addic.html.
- (run 4) Merge 4f66761 over cbe76a57: one file (ui-settings.js), no shared file. Never commit offline/1-addic.html (the gate leaves it modified).
- (run 3) Merge 0e76065 over be0f806d: two files (ui-settings.js, workbook-settings.test.mjs), no shared file. Never commit offline/1-addic.html.
- (run 2) styles.css lane section now lines 382-470; ui-plan.js already in build.mjs parts (line 38); never commit offline/1-addic.html. This lane's four tour names pass guards.
- Shared file: offline/src/styles.css, one section appended at the end (lines 382-422), no token redefined. Expect an append-point conflict if other lanes also append there.
- package.json and package-lock.json: unchanged. ui-settings.js was already in build.mjs parts (line 33); build.mjs untouched.
- Territory warnings: none.
- Quiet-window browser tests: "PIN set lock unlock export" and "export erase import restores everything", plus the dark flow.
