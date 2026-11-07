## actions-sos (CORE, 1-addic offline build): the slice report

State: READY-SLICE. Branch build/actions-sos (worktree C:/Users/ruchi/1-addic-wt/actions-sos). Base 655516dc. Tip 1cb96a3. Run time 2026-11-07 08:26 IST.
Commits (655516dc..HEAD):
- 1cb96a3 feat(actions-sos, U-09): Actions verbs of 3.2 with validation and events

### Turn caps
- Builder for U-09: steps_used 34; returned a note. capHits: 0.

### Units
- U-09 Actions (1cb96a3; offline/src/actions.js, offline/tests/actions.test.mjs). For a person: nothing on screen yet. Screen lanes can now write through Actions: an SOS session saves one log with its skills and outcome; a drill saves only one TutorialCompleted('drill'); a slip is logged without lowering any number or moving startDate; export, erase and import give back the same notebook; every refused call writes nothing; a locked store refuses with LOCKED. Closes brief Q1 (Engine/Store contracts exist) and Q5 (sample absent = 'no-sample').
- Held or blocked: none.
- Still to build: U-10 (offline/src/ui-sos.js: UI.pages.sos, UI.sosHelpers {urgentList, outcomeFrom, isCrisisEmotion}, tests as a new describe in actions.test.mjs; waits for core U-03 in the base; ends a flow with Actions.sosSession and must finish without saving if LOCKED). U-11 (offline/src/ui-onboarding.js: UI.pages.lock via Store.lock.unlock then UI.go('#/today',{replace:true}), urgent help via UI.sosUrgentView; UI.pages.onboarding finishing with Actions.onboard, motivation.add, saveResponse('quick-reasons'), contacts.add).

### Contract changes
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
VERIFIED (check's runs at tip 1cb96a3):
- GREEN test pass=20 fail=0: C:\Users\ruchi\1-addic-wt\_logs\gates\actions-sos\test-20261107-084110.log
- GREEN guards pass=2 skip=3: C:\Users\ruchi\1-addic-wt\_logs\gates\actions-sos\guards-20261107-084112.log
- Scratch (not a gate): same 20 tests 20/20 against trunk's real engine.js; three mutations turn tests red (_logs/reports/actions-sos/checker-real).

ASSUMED / SKIP:
- SKIP build (offline/build.mjs absent on base): _logs\gates\actions-sos\build-20261107-084110.log
- SKIP validate (engine.js absent on base): _logs\gates\actions-sos\validate-20261107-084112.log
- Guard skips: csp, theme parity, tour targets (no build, styles.css, ui-*.js yet).
- Not checked: browser gate; real store.js behaviour (rollback, LOCKED, replaceAll); Engine.validateBackup/migrateBackup (U-08 unmerged); U-10/U-11 product rules.

Territory: "actions-sos 655516dc..HEAD: 2 files changed, 2 own, 0 shared (append points), 0 nobody's, 0 errors"; no warnings.

### Review gates
None.

### Check
Verdict PASS at 1cb96a3.
- C1 LOW U-09 actions.js:892-900: loadSample may overwrite rows the person has (keyed rows profile 'me', settings 'app', plan, or reused ids), and erasing the sample then erases them. Fix SHA: none. Re-check: not run.
- C2 LOW U-09 actions.js:841-845, 868: migrateLocal drops meta 'lock' rows, then Store.replaceAll; if the real store replaces meta wholesale, an import removes the device's PIN. Needs core store U-04 to confirm replaceAll keeps the live lock row, or a test. Fix SHA: none. Re-check: not run.

### Review
Not run on a slice: the two reviewers run once at the lane's end.

### Safety and content marks
clinicalReview: true passages: none (no copy in U-09). verify: true resources: none. actions.js holds no crisis copy, network call, URL, innerHTML or 'addict' (grep). Safety writes proved by 10 mutations (drill guard, slip event, used-means-slip, locale en, backup check and others). The marks arrive with U-10 and U-11.

### Requests for other lanes
- Engine contract (engine lane): SosCompleted outcome should read 'passed'|'still'|'used' (engine.md says 'passed'|'used'|'other'); engine reads only 'passed', so nothing breaks.
- offline/src/store.js (core, U-04): confirm replaceAll keeps the live meta lock row (C2).
- engine U-08: add AppError, validateBackup, migrateBackup; actions.js uses them when present.
- Content lane: Content.exercises absent, so any id-like exerciseId is accepted (ArtifactSaved kind null); Content.sample.generate(now) shape is {stores:{name: rows}} or the map itself, else 'no-sample'.

### Docs owed
None for U-09.

### Open questions
1. Engine U-05 lacks AppError/validateBackup/migrateBackup: default built an in-file AppError and an always-run backup check; migration uses Engine.migrateBackup when present, fills every store, drops any meta 'lock' row.
2. SosCompleted outcome vocabulary 'still' vs engine's 'other': default 'passed'|'still'|'used'.
3. Content.exercises absent: default accept any id-like id.
4. Content.sample shape: default as in Requests; malformed = 'no-sample'.

### For the HUB at the merge
- Shared files touched: none. build.mjs on trunk already lists actions.js, ui-sos.js, ui-onboarding.js.
- package.json / package-lock.json: no changes (none on the base).
- Conflicts to expect: none; two new files only.
- Territory warnings: none.
- Browser tests for the quiet window: none in this slice.
