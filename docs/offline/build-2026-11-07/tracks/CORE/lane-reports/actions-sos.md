## actions-sos (CORE, 1-addic offline build): the lane report

State: READY. Branch build/actions-sos (worktree C:/Users/ruchi/1-addic-wt/actions-sos). Base 655516dc. Tip a8dce5a5c4c1aa87d1dbf55d072b742e75bef393 (updated 2026-11-07 14:23 IST; the earlier slice state was READY-SLICE at 1cb96a3, 08:26 IST). Units: U-09, U-10, U-11, FIX-SAFETY-AS, FIX-ONB-EMO, FIX-R2-SAFETY, FIX-R2-REST. Held: none.
Commits (655516dc..HEAD, newest first):
- a8dce5a fix(FIX-R2-REST C3): motivation slider gets a confirm button that keeps the shown value
- a060d95 fix(FIX-R2-REST C2): a save kept for the unlock is dropped when the notebook is erased or replaced
- 1068c5f fix(FIX-R2-REST RS17): with a PIN set, the privacy step says so, no PIN fields
- b7fd04f fix(FIX-R2-REST RS16): #/sos/slip?logged=1 says It is in your log. and offers one Go on
- d9ecf0c fix(FIX-R2-REST RS15): while locked, Call someone and Remind me why say hidden, not empty
- 1f06923 fix(FIX-R2-SAFETY RS14): SOS never shows sample contacts or reasons as the person's own
- 1f1ab9f fix(FIX-R2-SAFETY RS13): sample data path shows the safety step before Today
- b841098 fix(FIX-R2-SAFETY RS12): lock screen and its title follow the discreet flag
- b50e28d fix(FIX-R2-SAFETY RS11): Next on the privacy step sets a typed PIN, or stays and says why
- c7c1c92 fix(FIX-R2-SAFETY RS10): typed crisis text in inflected forms goes to the numbers
- Earlier run (to fc0d038): fc0d038, 5c1ce64, 7950da5, e003beb, be5e632, 14531c0, c270a01 (RC14-RC20); fca2781 back to cf9bc2b (FIX-ONB-EMO, FIX-SAFETY-AS); full list: git -C C:/Users/ruchi/1-addic-wt/actions-sos log --oneline 655516dc..HEAD
- First slice commit:
- 1cb96a3 feat(actions-sos, U-09): Actions verbs of 3.2 with validation and events

### Turn caps
- 2026-11-07 run (continued from fc0d038): FIX-R2-SAFETY builder steps_used 23; FIX-R2-REST first builder hit its 80-turn cap with no note (all five ids already committed); resume builder steps_used 7, verified and rebuilt nothing. capHits: 1.
- Builder for U-09: steps_used 34; returned a note. capHits: 0.

### Units
- U-09 Actions (1cb96a3; offline/src/actions.js, offline/tests/actions.test.mjs). For a person: nothing on screen yet. Screen lanes can now write through Actions: an SOS session saves one log with its skills and outcome; a drill saves only one TutorialCompleted('drill'); a slip is logged without lowering any number or moving startDate; export, erase and import give back the same notebook; every refused call writes nothing; a locked store refuses with LOCKED. Closes brief Q1 (Engine/Store contracts exist) and Q5 (sample absent = 'no-sample').
- 2026-11-07 run (continued from fc0d038). Built by the earlier run (10:43-12:45): U-10, U-11, FIX-SAFETY-AS, FIX-ONB-EMO and review round 2 RC15-RC20 (check PASS at fca2781).
- FIX-R2-SAFETY (c7c1c92, b50e28d, b841098, 1f1ab9f, 1f06923). For a person: typed 'killing myself', 'self harming', 'cutting myself' and similar now open the numbers, not breathing (RS10); on onboarding step 2, Next with a typed PIN sets it or stays and says why (RS11); in discreet mode the lock screen and tab title are neutral (RS12); 'Look around with sample data' shows the safety step, which cannot be skipped, then Today (RS13); SOS never offers sample contacts or reasons, no tel: or sms: to a sample number (RS14). Closes RS10-RS14.
- FIX-R2-REST (d9ecf0c, b7fd04f, 1068c5f, a060d95, a8dce5a). For a person: while locked, Call someone and Remind me why say the people and reasons are hidden, not missing (RS15); after Yes to 'Did you use?', the slip page says 'It is in your log.' with one Go on, nothing logged twice (RS16); with a PIN already set, step 2 says so and shows no PIN fields (RS17); a save kept for the unlock is dropped when the notebook is erased or imported (C2); the motivation slider has a confirm button (onb-score-ok), moving it still saves, untouched saves nothing (C3). Closes RS15-RS17, C2, C3.
- Held or blocked: none.
- Still to build: U-10 (offline/src/ui-sos.js: UI.pages.sos, UI.sosHelpers {urgentList, outcomeFrom, isCrisisEmotion}, tests as a new describe in actions.test.mjs; waits for core U-03 in the base; ends a flow with Actions.sosSession and must finish without saving if LOCKED). U-11 (offline/src/ui-onboarding.js: UI.pages.lock via Store.lock.unlock then UI.go('#/today',{replace:true}), urgent help via UI.sosUrgentView; UI.pages.onboarding finishing with Actions.onboard, motivation.add, saveResponse('quick-reasons'), contacts.add).

### Contract changes
2026-11-07: hook onb-score-ok (C3) is new, not yet in the contract or hooks.mjs; sos-slip-continue (RS16) replaces the two start buttons when logged=1; Store.subscribe payload { label } is relied on (C2). Hooks sos-step-next/-done, sos-helped-yes/-no, sos-rate-skip, sos-checkin are in the contract (RC14). No new routes or events.
All verbs async; failure is AppError(message, code), nothing written. Consumer in brackets.
- onboard(patch) -> {profile, settings, events}; 3.4 profile keys only ('bad-profile'); locale 'en' always; region 'in'|'intl'; OnboardingCompleted once [ui-onboarding U-11].
- settings.patch(patch) -> settings row ('bad-setting'); milestonesSeen only grows [workbook-settings].
- recordEvent(type, payload) -> {events}; the 24 types of 3.7 ('bad-event'); once-only types deduplicated [game-tutorials, learn].
- logCraving(e), logFeeling(e) -> {log, events} ('bad-log'); checkin(kind, data) -> {log, events} ('bad-checkin'); logActivity(data) -> {log, events} ('bad-activity') [none yet].
- logSlip({date?, substance?, situation?, notes?}) -> {log, events}; SlipLogged{date, logId} ('bad-slip') [none yet].
- sosSession(s) -> {log, events}; drill -> {drill:true, events}. Events: LogCreated, SkillUsed per tool, SosCompleted{kind, outcome, ratingBefore, ratingAfter, delays, logId}, SlipLogged when used. Outcome 'passed'|'still'|'used' ('bad-session') [ui-sos U-10].
- completeLesson(id) ('unknown-lesson'); checkpoint(moduleId, answers) ('bad-checkpoint'); ModuleCompleted once [learn].
- saveResponse(exerciseId, payload, {mode, draft}) -> {response, events} ('unknown-exercise','bad-response') [exercise lanes; U-11].
- contacts.add/update/deactivate/reached ('bad-contact'); plans.add/update/remove/debrief; weeklyReview(data); todos.add/done/remove ('bad-plan'); motivation.add ('bad-motivation'); predictions.add/complete ('bad-prediction'); quests.tick ('bad-quest') [none yet, except contacts.add and motivation.add by U-11].
- tutorial.done(id,{skipped}) ('bad-tutorial'); tutorial.replay(id); reveal(featureId,{seen?,forced?}) ('bad-feature'); markTipShown(id) ('bad-tip') [game-tutorials].
- recoveryPlan.save(sections,{confirm}) ('bad-plan'); scriptUsed(responseId) ('bad-script') [none yet].
- loadSample() ('no-sample' while Content.sample absent); eraseAll(); importBackup(obj) ('bad-backup' with .errors) [workbook-settings].
- Other errors: LOCKED passes through; 'no-store' when Store is absent.
- No content keys, routes, UI.pages or data-tour targets added.

### Gates
2026-11-07 run, VERIFIED at a8dce5a (check):
- GREEN test pass=95 fail=0: C:\Users\ruchi\1-addic-wt\_logs\gates\actions-sos\test-20261107-151840.log
- RED guards, 21 FAIL lines, all 'guard: tour-target <name>' (nav-*, sos-button, quicklog-*, planner-*, bp-*, workbook-*, insights-*, review-start, plan-*); baselined RED until screen lanes land; same names as at fc0d038 and 1f06923, no new failure: C:\Users\ruchi\1-addic-wt\_logs\gates\actions-sos\guards-20261107-151852.log
- Each of RS10-RS17, C2, C3 has a red log (fail 1) and a green log in C:\Users\ruchi\1-addic-wt\_logs\reports\actions-sos\ (actions-sos__<id>.red.log, .green.log).
ASSUMED / SKIP: build SKIP (build.mjs absent) build-20261107-151840.log; validate SKIP (engine.js absent) validate-20261107-151852.log; CSP and theme-parity guards skipped. Browser gate not run (cases for RS12, RS15, RS16, RS17, C3 belong to tests-docs).
Earlier gates (slice run):
VERIFIED (check's runs at tip 1cb96a3):
- GREEN test pass=20 fail=0: C:\Users\ruchi\1-addic-wt\_logs\gates\actions-sos\test-20261107-084110.log
- GREEN guards pass=2 skip=3: C:\Users\ruchi\1-addic-wt\_logs\gates\actions-sos\guards-20261107-084112.log
- Scratch (not a gate): same 20 tests 20/20 against trunk's real engine.js; three mutations turn tests red (_logs/reports/actions-sos/checker-real).

ASSUMED / SKIP:
- SKIP build (offline/build.mjs absent on base): _logs\gates\actions-sos\build-20261107-084110.log
- SKIP validate (engine.js absent on base): _logs\gates\actions-sos\validate-20261107-084112.log
- Guard skips: csp, theme parity, tour targets (no build, styles.css, ui-*.js yet).
- Not checked: browser gate; real store.js behaviour (rollback, LOCKED, replaceAll); Engine.validateBackup/migrateBackup (U-08 unmerged); U-10/U-11 product rules.

Territory 2026-11-07: actions-sos 655516dc..HEAD: 4 files changed, all the lane's own (actions.js, ui-onboarding.js, ui-sos.js, tests/actions.test.mjs); 0 shared, 0 nobody's, 0 errors, 0 warnings. Since fc0d038 only ui-sos.js, ui-onboarding.js, actions.test.mjs changed. All 10 new commits carry both trailers. No innerHTML, no http(s) URL.
Earlier territory: "actions-sos 655516dc..HEAD: 2 files changed, 2 own, 0 shared (append points), 0 nobody's, 0 errors"; no warnings.

### Review gates
None.

### Check
Verdict PASS at 1cb96a3.
- C1 LOW U-09 actions.js:892-900: loadSample may overwrite rows the person has (keyed rows profile 'me', settings 'app', plan, or reused ids), and erasing the sample then erases them. Fix SHA: none. Re-check: not run.
- C2 LOW U-09 actions.js:841-845, 868: migrateLocal drops meta 'lock' rows, then Store.replaceAll; if the real store replaces meta wholesale, an import removes the device's PIN. Needs core store U-04 to confirm replaceAll keeps the live lock row, or a test. Fix SHA: none. Re-check: not run.

### Check (2026-11-07 run)
Verdict PASS at a8dce5a (judged commits after fc0d038). FIX-R2-SAFETY and FIX-R2-REST present and meet the rulings; no new findings. Earlier units not re-judged. C2 fixed a060d95, C3 fixed a8dce5a (C1 LOW: no fix). Not checked: browser gate, build, validate.

### Review
Slice run: not run. 2026-11-07 run: lenses contracts and safety judged 655516dc...HEAD. Contracts reviewer: no findings. Safety reviewer round 2 (found at fc0d038; finder re-check at a8dce5a):
- RS10 HIGH U-10 fix c7c1c92: FIXED. RS11 MEDIUM U-11 b50e28d: FIXED. RS12 MEDIUM U-11 b841098: FIXED. RS13 MEDIUM U-11 1f1ab9f: FIXED. RS14 MEDIUM U-10 1f06923: FIXED.
- RS15 LOW U-10 d9ecf0c: FIXED. RS16 LOW U-10 b7fd04f: FIXED. RS17 LOW U-11 1068c5f: FIXED.
- New from the re-check, no fix yet: RS10-NEARBY HIGH U-10 (a remaining gap, not a regression): 'I want to be dead', 'I wish I could not wake up', 'better off without me', 'disappear forever' are not matched by CRISIS.patterns (ui-sos.js:85-95). Next: add them to the RS10 test list (actions.test.mjs about 1881), see it fail, then add patterns, keep clinicalReview true. Needs the chat to open an id.
- New LOW U-11 (regression of RS11 b50e28d): while the PIN derives, tapping Skip lets the pending Next skip step 3 (ui-onboarding.js:428-436). No fix yet.
- New LOW U-10 (RS16 line on the RC20 path): a save kept for the unlock goes to ?logged=1 and the page says 'It is in your log.' before it is saved (ui-sos.js:617-622). No fix yet.
The review fix round changed nothing: every handed finding was already fixed this run.

### Safety and content marks
2026-11-07: CRISIS.patterns widened (RS10), clinicalReview: true kept; clinical review owed on the patterns and on idiom false positives ('this is killing me') the ruling allows; only 'overdose on purpose' matches the overdose case. The safety step cannot be skipped on any path (RS13). Sample rows never show as the person's own in SOS (RS14). Urgent help stays one tap away while locked (RS15). No network call, innerHTML or URL added.
clinicalReview: true passages: none (no copy in U-09). verify: true resources: none. actions.js holds no crisis copy, network call, URL, innerHTML or 'addict' (grep). Safety writes proved by 10 mutations (drill guard, slip event, used-means-slip, locale en, backup check and others). The marks arrive with U-10 and U-11.

### Requests for other lanes
- (2026-11-07) core: C2 relies on Store.subscribe passing { label } ('resetAll' for Forgot PIN and Erase, 'replaceAll' for import; store.js 418-420, 550, 584); core.md promises only Store.subscribe(fn). Keep the label or tell this lane. RS12: core's chrome() could write '1-addic:discreet' itself (the lane uses UI.applyDiscreet when present, else a guarded flag write).
- tests-docs: browser cases for RS12, RS15, RS16, RS17, C3; add hook onb-score-ok to the contract and tests/helpers/hooks.mjs.
- content: a sample flag on Content.sample rows (RS14 skips sample === true).
- Engine contract (engine lane): SosCompleted outcome should read 'passed'|'still'|'used' (engine.md says 'passed'|'used'|'other'); engine reads only 'passed', so nothing breaks.
- offline/src/store.js (core, U-04): confirm replaceAll keeps the live meta lock row (C2).
- engine U-08: add AppError, validateBackup, migrateBackup; actions.js uses them when present.
- Content lane: Content.exercises absent, so any id-like exerciseId is accepted (ArtifactSaved kind null); Content.sample.generate(now) shape is {stores:{name: rows}} or the map itself, else 'no-sample'.

### Docs owed
None for U-09. 2026-11-07: guide text for the sample-data path (safety step first), the hidden-while-locked lines, 'It is in your log.', the motivation confirm button; contract entry for onb-score-ok.

### Open questions
2026-11-07 (defaults taken): RS13 the sample path does not save the safety ticks; RS10 idiom false positives allowed; RS16 second sentence on the logged line kept; STALE-LOCKED (another tab changed the lock; session kept on an unlocked phone until next notify): default keep, proposal retry once now; RS15 no Unlock link; overdose words ('overdose', 'OD', 'took too much') for clinical review; guards RED on 21 tour-targets, 6 of them (nav-*, sos-button) not baselined by name for this base, HUB to confirm.
1. Engine U-05 lacks AppError/validateBackup/migrateBackup: default built an in-file AppError and an always-run backup check; migration uses Engine.migrateBackup when present, fills every store, drops any meta 'lock' row.
2. SosCompleted outcome vocabulary 'still' vs engine's 'other': default 'passed'|'still'|'used'.
3. Content.exercises absent: default accept any id-like id.
4. Content.sample shape: default as in Requests; malformed = 'no-sample'.

### For the HUB at the merge
- 2026-11-07: still no shared files and no package changes; 4 own files; expect guards RED on the 21 tour-target names until the screen lanes and core's shell merge; build and validate SKIP on this branch, run them after the merge; browser cases owed by tests-docs.
- Shared files touched: none. build.mjs on trunk already lists actions.js, ui-sos.js, ui-onboarding.js.
- package.json / package-lock.json: no changes (none on the base).
- Conflicts to expect: none; two new files only.
- Territory warnings: none.
- Browser tests for the quiet window: none in this slice.
