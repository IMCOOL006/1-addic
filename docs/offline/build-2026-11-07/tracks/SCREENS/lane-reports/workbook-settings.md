## workbook-settings (SCREENS, 1-addic offline build): the slice report

State: READY-SLICE. Branch build/workbook-settings. Base 1ef2482e. Tip cc1f1ea. Run 2026-11-07 16:15 IST.
Commits:
- 83aa85b feat U-19 Settings page, seven tabs
- e0af4fd test U-19 helpers, tab renders, memory round trips
- cc1f1ea fix U-19 data actions also carry the base browser hooks

### Turn caps
Builder (U-19): steps_used 36, returned a note. capHits 0.

### Units
- U-19 Settings (83aa85b, e0af4fd, cc1f1ea). #/settings and #/settings/<tab> (privacy, look, rhythm, names, help, about, data; unknown goes to privacy). A person can: set, change, remove a PIN and the auto-lock (PIN asked first); toggle discreet mode; choose theme, text size, calm, high contrast, reduce motion, counters, current run; set check-in times, review day, pace; edit names; replay tour/drills (feature-detected, honest line if absent); read How do I; see About, credits, evidence; save and restore a backup (PIN asked for export; confirm on import; first three errors shown); print logs; load/erase sample (feature-detected, disabled with a plain line); erase everything (ERASE_PARTIAL text). Closes the chat's 16:15 questions: eraseSample/tutorial hooks feature-detected, auto-lock asks PIN, imports via Actions.importBackup, ERASE_PARTIAL said plainly, PIN help line, PIN field attributes.
- Held/blocked: none.
- To build: U-20a (ui-workbook.js: UI.pages.workbook, #/workbook/reasons, ?big=1, #/workbook/network; read engine.js:684-698 and actions.js:509-540), U-20b (artifact browser, ARTIFACTS/GROUPS, data-tour workbook-groups and workbook-card), U-21 (ui-plan.js: PlanUI.view/merge/SECTIONS, data-tour plan-sections and plan-print; Engine.prefillRecoveryPlan engine.js:831, Actions.recoveryPlan.save ~actions.js:870).

### Contract changes
- UI.pages.settings in ui-settings.js. Consumers: ui-core router, today (link), onboarding (PIN link).
- SettingsUI global: page, doExport, doImport, doErase, doLoadSample, doEraseSample, printLogs; pure on module.exports: TABS, TEXT, ABOUT, ERASE_PARTIAL_TEXT, normalTab, pinOk, pinError, backupName, logRows, errorText, importErrorText, importedText. Consumer: tests.
- Routes: #/settings, #/settings/privacy|look|rhythm|names|help|about|data.
- data-test hooks: settings-page, settings-tab-<tab>, settings-message, store-status, set-pin, pin-current, pin-input, pin-input2, pin-save, remove-pin, lock-now, auto-lock, no-crypto, discreet-toggle, theme-system|light|dark, text-size-normal|large|larger, calm-toggle, contrast-toggle, motion-toggle, counters-toggle, run-toggle, checkin-morning, checkin-evening-time, review-day, pace, custom-per-week, rhythm-save, name-input, companion-input, term-select, names-save, tour-replay, tour-later, drills-later, tips-toggle, show-all-toggle, early-notice, early-notice-ok, version, last-backup, export-btn, import-file, erase-all, print-logs, backup-reminder, sample-card, sample-loaded, load-sample, erase-sample, erase-sample-note. Also data-testid settings-export, settings-import, settings-erase (the names helpers/hooks.mjs uses). Consumer: tests-docs browser suite.
- html[data-contrast="high"] set by Settings; consumer none yet (core should apply on every render).
- Events, content keys, data-tour targets: none.

### Gates
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

### Review
Not a flagged lane: no reviewers run.

### Safety and content marks
- clinicalReview: true: offline/src/ui-settings.js ABOUT (line 58): the "in danger, open SOS and tap Urgent help" line and the not-medical-advice line. The reviewer checks the wording and that it points to SOS and Urgent help.
- verify: true: none (no numbers; Urgent help is a link to #/sos/urgent).

### Requests for other lanes
- offline/src/ui-core.js (core): apply settings.highContrast (html[data-contrast]) on every render, beside textSize and reducedMotion at lines 645-646.
- Actions.eraseSample (actions-sos) and Content.sample (content U-33): needed to enable the sample controls.
- GuidanceUI.coach and GuidanceUI.training (guidance): the tour and drills buttons appear when these exist.
- offline/tests/helpers/hooks.mjs (tests-docs): contract names use data-test; BASE hooks use data-testid; both are on the controls.

### Docs owed
- Guide (tests-docs): a Settings chapter covering the seven tabs.
- offline/README.md: lines on backup (save and bring back), PIN (optional, forgot-PIN means erase then restore), and erase everything.
- CLAUDE.md: none.

### Open questions
1. Erase success: brief says #/onboarding; built stays on #/settings/data with Start again and the import control.
2. Hook attribute: contract data-test, BASE hooks data-testid; both set.
3. High contrast not applied by core on every render; asked of core.

### For the HUB at the merge
- Shared file: offline/src/styles.css, one section appended at the end (lines 382-422), no token redefined. Expect an append-point conflict if other lanes also append there.
- package.json and package-lock.json: unchanged. ui-settings.js was already in build.mjs parts (line 33); build.mjs untouched.
- Territory warnings: none.
- Quiet-window browser tests: "PIN set lock unlock export" and "export erase import restores everything", plus the dark flow.
