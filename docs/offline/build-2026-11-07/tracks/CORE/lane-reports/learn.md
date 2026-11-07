## learn (CORE, 1-addic offline build): the slice report

State: READY. Branch build/learn, base 655516dc, tip 4f5832f. Run time 2026-11-07 10:41 IST (continued from a499dae; earlier slice run 09:51 IST was READY-SLICE at a499dae).
Commits (655516dc..HEAD): 4f5832f test(learn, FIX-RS4): open an id outside Content.exercises for the missing-exercise check; 19f373c feat(learn U-13, U-14): lesson player, checkpoint, roadmap and glossary; dc248cb fix(learn C2, U-12): module.exports carries the pure functions only; 9bbccd2 fix(learn C1, U-12): crisis check accepts true or a non-empty word list; a499dae feat(learn U-12): exercise engine and the #/dev/fields gallery.
Builders' record: C:/Users/ruchi/1-addic-wt/_logs/reports/learn/learn__units.md

### Turn caps
- Builder batch [U-12]: steps_used 27, returned a note. capHits: 0.


### Turn caps
- Run 2026-11-07 10:41: no builder batch this run (it built nothing). The earlier run's builder wrote U-13/U-14 in 19f373c; its session died at 10:37 before a hand-off note. capHits: 0.

### Units
- 2026-11-07 10:41 run: U-12 (a499dae, merged 10:18 as 4618e43c) with fixes C1 9bbccd2 and C2 dc248cb; U-13 and U-14 (19f373c, tier 1, built by the earlier run, judged by this run's check). Held: none.
- U-13 (19f373c): #/lesson/<id> steps through moment, cards, checks (no fail state, Next always enabled), try it (exercise, route or none; Skip on sensitive lessons) and wrap (adds to-dos, "Why this works" sheet). Lesson completion is recorded once per lesson. #/learn/<m>?checkpoint=1 has two questions, no pass mark. Listen uses UI.speak only. XP text hidden in calm. Stub-Actions M0 run writes LessonCompleted x3, CheckpointCompleted, ModuleCompleted.
- U-14 (19f373c): #/learn map of 11 stops (inline aria-hidden SVG plus a text list; M4-M10 shown as "coming"; nothing locked). #/learn/plan: paces gentle, steady, focused, custom, free; a passed week reads "Still open"; behindWeeks never shown; welcome back after 14 days. #/learn/glossary is searchable. LearnUI.focusCard present. All 8 named tests present.
- Questions closed: C1 (array accepted), C2 (pure exports only).
- U-12 (a499dae, tier 1): built. A person can open any exercise in tutorial or workbook mode, fill any of the 19 field types, tap Finish later to keep a draft ("Draft from <date>", "Start fresh"), skip a sensitive exercise, and see an urgent-help line (links to #/sos/urgent) that never blocks saving. Unavailable exercises show "Not available yet" with a back link (O7). Saves only through Actions.saveResponse. Closes O7. Tests: 12/12 pass (8 named in the brief plus 4 extra).
- Held or blocked: none.
- (Earlier, now built:) U-13 (offline/src/ui-learn.js: LearnUI.lessonSteps/checkResult/moduleProgress, UI.pages.lesson, UI.pages.learn checkpoint; try-it opens #/exercise/<id>?mode=tutorial&from=<lessonId>, and ExerciseUI returns to #/lesson/<from> after saving). U-14 (planWeeks, needsWelcomeBack, glossaryFilter, focusData, focusCard; #/learn map, plan and glossary pages; test "learn: nothing overdue" scanning every string).
- 2026-11-07 16:36 run: FIX-RS4 (4f5832f, tier 1, test-only): offline/tests/learn.test.mjs:265 now opens 'not-an-exercise' instead of 'quick-reasons', since content U-31a makes quick-reasons a real exercise (R-S-4 (3), granted by R-H-21). No change for a person using the file. 28/28 pass on the branch and against trunk 9b319256 (ok 13). Closes R-S-4 (3). Held: none. U-12, U-13, U-14 unchanged.

### Contract changes
2026-11-07 10:41: ExerciseUI.crisisCheck accepts true or a non-empty word list (C1); module.exports carries ExerciseUI.PURE only (C2). New file offline/src/ui-learn.js: LearnUI (lessonSteps, checkResult, moduleProgress, planWeeks, needsWelcomeBack, glossaryFilter, focusData, focusCard); UI.pages.lesson, UI.pages.learn (map, ?checkpoint=1, /plan, /glossary). Try-it opens #/exercise/<id>?mode=tutorial&from=<lessonId>. Needs Actions.completeLesson, checkpoint, onboard, todos.add; Engine.roadmap optional. Build chat: record in tracks/CORE/contracts/learn.md.
All in offline/src/ui-exercise.js. Consumer: none yet (U-13 will use them), unless noted.
- Global ExerciseUI (module.exports in Node): FIELD_TYPES (19), SAMPLE_SPEC, SAMPLE_CONTACTS, REGIONS (head, throat, shoulders, chest, stomach, arms, hands, legs, feet, back), URGENT_LINE, TEXT.
- Pure: defaultValue(field), normalise(field, v, spec, siblings), toPayload(spec, values), fromPayload(spec, payload) (exact inverse), validate(spec, values, {draft}) -> {ok, errors}, isEmpty(field, v), optionsFor(field, view, content?) -> [{id,label,group?}], triggerId(group,label) (id format "<group>:<slug>"), resume(responses, id) -> {draft, final}, history(responses, id), startState(spec, responses, mode) -> {values, base, draftAt, history}, exerciseFor(id, content?), summarize(field, value, view, content, spec, values), crisisCheck(spec, values, engine?).
- DOM: render(spec, opts), open(id, {mode, from}, ctx), gallery(ctx), devPage(ctx), exercisePage(ctx). Empty values are null and ''. DOM hooks: data-region, data-exercise.
- Routes/UI.pages: UI.pages.exercise (#/exercise/<id>?mode=&from=), UI.pages.dev (#/dev/fields only). No new content keys, no data-tour targets.
- The build chat must record these (extras, null/'' empties, hooks, trigger id format) in tracks/CORE/contracts/learn.md.
2026-11-07 16:36: none (FIX-RS4 is test-only).

### Gates
2026-11-07 10:41 run (diff a499dae..19f373c):
VERIFIED:
- test GREEN 28/28 (all U-12/13/14 named tests plus extras): C:/Users/ruchi/1-addic-wt/_logs/gates/learn/test-20261107-104417.log
- guards RED, no new failure: same 21 tour-target names as at a499dae (15 baselined; 6 nav-*/sos-button fail as the branch has no shell.html/ui-core.js): guards-20261107-104420.log
- Territory: 3 files changed, all own (ui-exercise.js, ui-learn.js, learn.test.mjs); 0 shared, 0 nobody's, 0 errors, 0 warnings; worktree clean. No styles.css section (not on this branch; ln-* classes have no CSS yet).
ASSUMED:
- build SKIP: build-20261107-104417.log; validate SKIP: validate-20261107-104420.log (same folder); csp, theme-parity skipped.
- Integration with real UI.h/sheet/speak/go, Actions, Engine: stubs only; confirm at merge. 44 px targets, focus, contrast of ln-* unchecked. Reading level judged by reading only. Placeholder M4-M10 names checked against BUILD-PLAN.md:181.
Earlier run:
- test GREEN 12/12: C:/Users/ruchi/1-addic-wt/_logs/gates/learn/test-20261107-101125.log
- guards RED on 21 tour-target names, none new: guards-20261107-101148.log (same folder). 15 are in baselines.md (quicklog-*, planner-*, bp-*, workbook-*, insights-*, review-start, plan-*). The other 6 (nav-today, nav-learn, nav-workbook, nav-track, nav-actions, sos-button) fail only because the base has no shell.html or ui-core.js; they exist on trunk (shell.html:14-20, ui-core.js:18-20).
- Real-DOM smoke against trunk files: _logs/reports/learn/learn_smoke/smoke.out (19 sections, draft resumed, final payload, no errors).
- Territory check: 2 files changed, 2 own (offline/src/ui-exercise.js, offline/tests/learn.test.mjs), 0 shared, 0 nobody's, 0 errors, 0 warnings. Trailers present.
ASSUMED:
- build SKIP (no build.mjs on base): build-20261107-101125.log. validate SKIP (no engine.js on base): validate-20261107-101148.log.
- csp and theme-parity guards skipped (no build or styles.css on base).
- Integration with real Actions.saveResponse, Engine.crisisKeywords, UI.go (arrive with actions-sos U-09, engine U-07, core U-03): confirm at merge.
- Browser gate not run. Reading level (grade 6-8) judged by reading only.
2026-11-07 16:36 run (diff 19f373c..4f5832f):
VERIFIED:
- test GREEN 28/28: C:/Users/ruchi/1-addic-wt/_logs/gates/learn/test-20261107-164039.log (builder: test-20261107-163851.log, test-20261107-163955.log); against trunk 9b319256 content 28/28: _logs/reports/learn/learn__FIX-RS4.trunk.log
- guards RED, none new by name: same 21 tour-target names (15 baselined in baselines.md:26-40; 6 nav-*/sos-button carried by trunk ui-core.js:20-26, R-H-21): guards-20261107-164042.log
- Territory 655516dc..HEAD: 3 files, all own; 0 shared, 0 nobody's, 0 errors, 0 warnings. After 19f373c only learn.test.mjs changed.
ASSUMED:
- build SKIP (no build.mjs): build-20261107-164039.log; validate SKIP (no engine.js): validate-20261107-164042.log. Browser gate not run. Full Node suite on merged tree not run.

### Review gates
None.
2026-11-07 16:36: not flagged; no reviewers run; 0 open review findings.

### Check
2026-11-07 10:41 run: verdict PASS at 19f373c. Evidence: C:/Users/ruchi/1-addic-wt/_logs/reports/learn/learn__check.md
- C3 LOW, U-13, fix SHA none (open, optional), re-check n/a: ui-learn.js:610 checkpoint toast shows +10 XP on every finish; should only the first time (as :537 does for lessons).
- C4 LOW, U-13, fix SHA none (open), re-check n/a: ui-learn.js:552,570-571 "Why this works" does nothing without UI.sheet; cannot happen on trunk (ui-core.js:161).
- C5 LOW, U-12/13/14, no fix: commit trailer is Claude-Session 224074c0 not 06ee0d0d (earlier CORE session continuing after hand-over); provenance accurate, Co-Authored-By present.
Not checked: browser gate; real integration (see ASSUMED).

Earlier run (a499dae):
Verdict PASS at a499dae.
- C1 LOW, fix 9bbccd2 (closed) (ui-exercise.js:384): crisis check counts only `=== true`; ui-sos also accepts a non-empty array. Matches engine contract (engine.md:44, boolean). Fix: none; open, optional.
- C2 LOW, fix dc248cb (closed) (ui-exercise.js:957-971): exports the whole ExerciseUI including DOM functions, where the brief says pure only. Harmless. Fix: none; open, optional.
Not checked: browser gate; smoke run read, not re-run (22 px checkboxes sit inside 44 px trunk .choice rows with clickable labels; the hidden urgent link is 0x0).
2026-11-07 16:36 run: verdict PASS at 4f5832f (judged 19f373c..HEAD). Findings: none new. Open from before: C3, C4 (LOW, no fix, unchanged). Not checked: browser gate; U-12/13/14 acceptance not re-judged; no brief section names FIX-RS4, judged against R-S-4 (3) in outbox-SCREENS.md:26.

### Review
2026-11-07 10:41: still not flagged; no reviewers run; 0 open review findings.
Not a flagged lane: no reviewers run.

### Safety and content marks
2026-11-07 10:41: U-13/U-14 add no numbers or links beyond in-app routes; checkpoint has no pass mark or fail state; roadmap never shows behindWeeks. clinicalReview: the lesson/checkpoint/welcome-back wording in ui-learn.js:24-80 and the Skip on sensitive lessons.
- clinicalReview: true: ExerciseUI.URGENT_LINE in offline/src/ui-exercise.js, the one-line urgent-help prompt. The clinical reviewer must check the wording and that it never blocks the save.
- verify: true: none (no numbers or links; the link is in-app #/sos/urgent).
2026-11-07 16:36: none new (test-only).

### Requests for other lanes
- 2026-11-07 10:41: core: UI.h, UI.sheet, UI.speak, UI.go, plus a styles.css section for ln-* classes (44 px, focus). actions-sos: completeLesson, checkpoint, onboard, todos.add. engine: roadmap, lessonsDone, modulesDone.
- tracks/CORE/contracts/learn.md (build chat): record the contract additions above.
- core (ui-core.js, U-03): provide UI.h, UI.svg, UI.toast, UI.go. ExerciseUI uses a local h fallback without UI and drops the bodymap figure (buttons stay).
- actions-sos (U-09): Actions.saveResponse. engine (U-07): Engine.crisisKeywords returning a boolean.
- 2026-11-07 16:36: none new. Engine's two R-S-4 names are engine's to fix.

### Docs owed
- 2026-11-07 10:41: README file list: ui-learn.js; Guide: lessons, checkpoint, plan paces, glossary.
- offline/README.md: add the #/dev/fields gallery and the ExerciseUI file under the file list.
- Guide: exercise screens support 19 field types, drafts and tutorial/workbook modes.
- CLAUDE.md: no lines owed.
- 2026-11-07 16:36: none new.

### Open questions
- 2026-11-07 10:41: C1, C2 closed. C3 (first-time-only XP on checkpoint), C4 (sheet fallback): default left as built.
- C1 (accept array from crisisKeywords?): default built is boolean only.
- C2 (export only pure functions?): default built is the whole object.
- 2026-11-07 16:36: none new; FIX-RS4 closes R-S-4 (3).

### For the HUB at the merge
- 2026-11-07 10:41: tip 19f373c; 3 own files, no shared, no package changes. After merge, confirm real Actions/Engine/UI integration, add ln-* CSS, re-run guards and browser tests.
- Shared files touched: none. No package.json or package-lock.json changes. No conflicts expected (two new files).
- Territory warnings: none.
- Run the lane smoke (_logs/reports/learn/learn_smoke/smoke.cjs, with LX_CHROME set to ms-playwright/chromium-1234) and the browser tests in the quiet window. After the merge, re-run guards: the 21 names should drop to the 15 baselined.
- 2026-11-07 16:36: tip 4f5832f; FIX-RS4 is one test line, no src change, ready to merge. After merge guards should drop to the 15 baselined names.
