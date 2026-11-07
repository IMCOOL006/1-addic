## learn (CORE, 1-addic offline build): the slice report

State: READY-SLICE. Branch build/learn, base 655516dc, tip a499dae. Run time 2026-11-07 09:51 IST.
Commits (655516dc..HEAD): a499dae feat(learn U-12): exercise engine and the #/dev/fields gallery.
Builders' record: C:/Users/ruchi/1-addic-wt/_logs/reports/learn/learn__units.md

### Turn caps
- Builder batch [U-12]: steps_used 27, returned a note. capHits: 0.

### Units
- U-12 (a499dae, tier 1): built. A person can open any exercise in tutorial or workbook mode, fill any of the 19 field types, tap Finish later to keep a draft ("Draft from <date>", "Start fresh"), skip a sensitive exercise, and see an urgent-help line (links to #/sos/urgent) that never blocks saving. Unavailable exercises show "Not available yet" with a back link (O7). Saves only through Actions.saveResponse. Closes O7. Tests: 12/12 pass (8 named in the brief plus 4 extra).
- Held or blocked: none.
- Still to build: U-13 (offline/src/ui-learn.js: LearnUI.lessonSteps/checkResult/moduleProgress, UI.pages.lesson, UI.pages.learn checkpoint; try-it opens #/exercise/<id>?mode=tutorial&from=<lessonId>, and ExerciseUI returns to #/lesson/<from> after saving). U-14 (planWeeks, needsWelcomeBack, glossaryFilter, focusData, focusCard; #/learn map, plan and glossary pages; test "learn: nothing overdue" scanning every string).

### Contract changes
All in offline/src/ui-exercise.js. Consumer: none yet (U-13 will use them), unless noted.
- Global ExerciseUI (module.exports in Node): FIELD_TYPES (19), SAMPLE_SPEC, SAMPLE_CONTACTS, REGIONS (head, throat, shoulders, chest, stomach, arms, hands, legs, feet, back), URGENT_LINE, TEXT.
- Pure: defaultValue(field), normalise(field, v, spec, siblings), toPayload(spec, values), fromPayload(spec, payload) (exact inverse), validate(spec, values, {draft}) -> {ok, errors}, isEmpty(field, v), optionsFor(field, view, content?) -> [{id,label,group?}], triggerId(group,label) (id format "<group>:<slug>"), resume(responses, id) -> {draft, final}, history(responses, id), startState(spec, responses, mode) -> {values, base, draftAt, history}, exerciseFor(id, content?), summarize(field, value, view, content, spec, values), crisisCheck(spec, values, engine?).
- DOM: render(spec, opts), open(id, {mode, from}, ctx), gallery(ctx), devPage(ctx), exercisePage(ctx). Empty values are null and ''. DOM hooks: data-region, data-exercise.
- Routes/UI.pages: UI.pages.exercise (#/exercise/<id>?mode=&from=), UI.pages.dev (#/dev/fields only). No new content keys, no data-tour targets.
- The build chat must record these (extras, null/'' empties, hooks, trigger id format) in tracks/CORE/contracts/learn.md.

### Gates
VERIFIED:
- test GREEN 12/12: C:/Users/ruchi/1-addic-wt/_logs/gates/learn/test-20261107-101125.log
- guards RED on 21 tour-target names, none new: guards-20261107-101148.log (same folder). 15 are in baselines.md (quicklog-*, planner-*, bp-*, workbook-*, insights-*, review-start, plan-*). The other 6 (nav-today, nav-learn, nav-workbook, nav-track, nav-actions, sos-button) fail only because the base has no shell.html or ui-core.js; they exist on trunk (shell.html:14-20, ui-core.js:18-20).
- Real-DOM smoke against trunk files: _logs/reports/learn/learn_smoke/smoke.out (19 sections, draft resumed, final payload, no errors).
- Territory check: 2 files changed, 2 own (offline/src/ui-exercise.js, offline/tests/learn.test.mjs), 0 shared, 0 nobody's, 0 errors, 0 warnings. Trailers present.
ASSUMED:
- build SKIP (no build.mjs on base): build-20261107-101125.log. validate SKIP (no engine.js on base): validate-20261107-101148.log.
- csp and theme-parity guards skipped (no build or styles.css on base).
- Integration with real Actions.saveResponse, Engine.crisisKeywords, UI.go (arrive with actions-sos U-09, engine U-07, core U-03): confirm at merge.
- Browser gate not run. Reading level (grade 6-8) judged by reading only.

### Review gates
None.

### Check
Verdict PASS at a499dae.
- C1 LOW (ui-exercise.js:384): crisis check counts only `=== true`; ui-sos also accepts a non-empty array. Matches engine contract (engine.md:44, boolean). Fix: none; open, optional.
- C2 LOW (ui-exercise.js:957-971): exports the whole ExerciseUI including DOM functions, where the brief says pure only. Harmless. Fix: none; open, optional.
Not checked: browser gate; smoke run read, not re-run (22 px checkboxes sit inside 44 px trunk .choice rows with clickable labels; the hidden urgent link is 0x0).

### Review
Not a flagged lane: no reviewers run.

### Safety and content marks
- clinicalReview: true: ExerciseUI.URGENT_LINE in offline/src/ui-exercise.js, the one-line urgent-help prompt. The clinical reviewer must check the wording and that it never blocks the save.
- verify: true: none (no numbers or links; the link is in-app #/sos/urgent).

### Requests for other lanes
- tracks/CORE/contracts/learn.md (build chat): record the contract additions above.
- core (ui-core.js, U-03): provide UI.h, UI.svg, UI.toast, UI.go. ExerciseUI uses a local h fallback without UI and drops the bodymap figure (buttons stay).
- actions-sos (U-09): Actions.saveResponse. engine (U-07): Engine.crisisKeywords returning a boolean.

### Docs owed
- offline/README.md: add the #/dev/fields gallery and the ExerciseUI file under the file list.
- Guide: exercise screens support 19 field types, drafts and tutorial/workbook modes.
- CLAUDE.md: no lines owed.

### Open questions
- C1 (accept array from crisisKeywords?): default built is boolean only.
- C2 (export only pure functions?): default built is the whole object.

### For the HUB at the merge
- Shared files touched: none. No package.json or package-lock.json changes. No conflicts expected (two new files).
- Territory warnings: none.
- Run the lane smoke (_logs/reports/learn/learn_smoke/smoke.cjs, with LX_CHROME set to ms-playwright/chromium-1234) and the browser tests in the quiet window. After the merge, re-run guards: the 21 names should drop to the 15 baselined.
