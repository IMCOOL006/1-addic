## actions (SCREENS, 1-addic offline build): the slice report

State: READY. Branch build/actions. Base 9f3026c6. Tip 0977edd (was READY-SLICE at 710502f, 17:42 IST). Run 2026-11-07 18:32 IST (facts); continued from 710502f; U-22 to U-25 all built. Worktree C:/Users/ruchi/1-addic-wt/actions.
Commits (9f3026c6..HEAD), 2026-11-07 18:32 run adds:
- 0977edd test(actions, U-25 / U-23, C1): the event log never shrinks across removes and plan re-writes
- 9ee68cf test(actions, U-25): practices, quests, predictions and to-dos Node tests
- 7641b1b feat(actions, U-25): quests, Prediction Lab and to-dos at #/actions/*
- 40e3418 feat(actions, U-25): the practices player at #/practice/<id> in ui-practices.js
- 0894beb test(actions, U-24): Weekly Review Node tests in actions-ui.test.mjs
- bd8be70 feat(actions, U-24): the Weekly Review at #/actions/review with the forecast check
- 25308cc test(actions, U-23): Battle Plans Node tests in actions-ui.test.mjs
- 42ce8aa feat(actions, U-23): Battle Plans at #/actions/battle with .ics and debrief
Earlier run:
- 84b92be feat(actions, U-22): the day planner at #/actions/planner
- 3de2d32 test(actions, U-22): planner Node tests in actions-ui.test.mjs
- b909a75 fix(actions, U-22, C1): the planner help line survives the Store re-render
- 710502f fix(actions, U-22, C2): the contract's data-testid hooks on the planner

### Turn caps
No builder entries were recorded in the facts (builders: []); no builder is recorded as returning without a note. capHits: 0.
2026-11-07 18:32 run: builders [], capHits 0. U-23 to U-25 were built by run wf_6effec68-3fd, which the chat stopped after the U-25 commit under the memory pause rule; no cap hit.

### Units
- U-22 Planner (tier 2): DONE. SHAs 84b92be, 3de2d32, fixes b909a75, 710502f. For a person: the Actions hub at #/actions (Planner card opens the planner; the other six cards say "This part is being built"). Sub-routes /battle, /review, /quests, /predictions, /todos show an honest stub with "Back to Actions" and "Open the Planner". The planner at #/actions/planner?date=YYYY-MM-DD (default today; a bad date falls back to today) has Previous day / Today / Next day and an inline "Add a block" form (title, kind, day, start, end, activity, risky, reward). Saves go through Actions.plans.add/update; a refused plan shows Actions' own message and keeps the input. Each block shows time, kind, Risky time and Sample badges, Done / Skipped / Change, Edit, Remove (inline two-step). Risky blocks show their Battle Plan or "Add a Battle Plan". A past unmarked block reads "Not marked yet. How did it go?" with no overdue wording or red. "Open time" lists gaps with "Add here"; "Ideas for open time" lists up to 3 suggestions with "Plan this". Crisis words in a saved block keep a calm "Get help now" line to #/sos/urgent, also after the Store re-render (C1).
  Closes: brief OQ4 (a Battle Plan always needs date/start/end) stands for U-23.
- Held or blocked: none.
- 2026-11-07 18:32 run, U-23 Battle Plans (tier 2): DONE. SHAs 42ce8aa, 25308cc. #/actions/battle lists plans (Coming up, Looking back); ?new=1 form (tour bp-form), ?plan=<id> edit, ?date= prefill. "Add to calendar" writes a .ics on the device via Engine.ics and UI.download; the buddy is never in the file. After the block ends: "Did the plan show up when it counted?" -> A.plans.debrief (BattlePlanDebriefed once per plan), warm reply, no score. Crisis words show the urgent-help line. Closes Q4 (date/start/end always needed).
- 2026-11-07 18:32 run, U-24 Weekly Review (tier 2): DONE. SHAs bd8be70, 0894beb. #/actions/review: start screen (tour review-start) and five screens (last seven days, forecast check from Engine, re-rate, week ahead, want-tos and focus skill); drafts kept in memory; Save writes want-tos, re-rate and one WeeklyReviewCompleted per Monday week; a retry never doubles. Weekly reminder .ics 18:00-18:15 on profile.reviewDay, FREQ=WEEKLY;BYDAY. Closes Q3.
- 2026-11-07 18:32 run, U-25 Quests, Prediction Lab, to-dos, practices (tier 2): DONE. SHAs 40e3418, 7641b1b, 9ee68cf; check fix 0977edd. The hub has no "being built" card left. #/actions/quests (badges, no points, no timers), /predictions (guess vs actual in words), /todos (no overdue wording; remove asks first). #/practice and #/practice/<id>: intro, read aloud, timer, line-by-line script, pause, reflection, "Did it help?"; Save writes ExerciseDone and MindfulMinute (whole minutes >= 1). No script: honest "being written" stub (O7). sober links to #/sos. Closes: Content.practices shape; no SkillUsed from practices.
- Held or blocked (18:32 run): none. Nothing still to build on this lane.

### Contract changes
2026-11-07 18:32 additions: routes #/actions/battle (?new=1, ?plan=, ?date=), /review, /quests, /predictions, /todos; #/practice and #/practice/<id> (UI.pages.practice; global PracticesUI). Tours bp-new, bp-form, review-start. Pure exports: battlePlanIcsItem, reviewIcsItem, saveBattle, debriefPlan, saveReview, questCards, tickQuest, savePrediction, completePrediction, saveTodo; ui-practices: practiceScript, practiceList, minutesCredit, finishPractice. Events, existing types only: BattlePlanCreated/Debriefed, WeeklyReviewCompleted (payload plus highlights {lines, note}, forecastNote, upcomingNote), ExerciseDone {exerciseId ('breathing' for breathe), practiceId, kind:'practice', minutes}, MindfulMinute {minutes>=1}. ctx.nowMs optional. Full hook lists: C:/Users/ruchi/1-addic-wt/_logs/reports/actions/actions__units.md.
- UI.pages.actions (registered from ui-actions.js). Routes #/actions, #/actions/planner?date=. Consumers: today-track (links), game-tutorials (planner tour), tests-docs (browser planner flow).
- data-tour: planner-day, planner-gaps, planner-add. Consumer: game-tutorials.
- Pure exports (module.exports guard): planRowsForDate(view,date), gapRows(E,view,date), ideaRows(E,view,date), pastUnmarked(plan,now), planFromValues(values), saveBlock(A,values,id?) -> {ok,plan}|{ok:false,code,message}, plannerDate(route,now), localDate, shiftDate, dayLabel, timeLabel. Consumer: none yet (Node tests only). battlePlanIcsItem and reviewIcsItem are U-23/U-24.
- Hooks: data-testid="planner-add-btn" and "planner-block" (the contract's names), beside data-test. All others are data-test only: planner, planner-form, planner-f-title/kind/date/start/end/activity/risky/reward/error, planner-save, planner-cancel, planner-day, planner-risky, planner-bp, planner-bp-add, planner-bp-edit, planner-unmarked, planner-done, planner-skip, planner-status, planner-undo, planner-edit, planner-remove, planner-remove-yes, planner-remove-no, planner-gaps, planner-gap, planner-gap-add, planner-ideas, planner-idea, planner-idea-add, planner-date, planner-prev, planner-today, planner-next, planner-help, planner-help-go, actions-hub, actions-hub-<id>, actions-open-planner, actions-stub, actions-back, actions-to-planner. Consumer: tests-docs (hooks.mjs).
- No events, content keys or stores added. Events only via Actions.plans.

### Gates
2026-11-07 18:32 run (tip 0977edd; check at 9ee68cf):
- VERIFIED build GREEN (716337 B): C:\Users\ruchi\1-addic-wt\_logs\gates\actions\build-20261107-183334.log; test GREEN 32/32: test-20261107-183336.log; validate GREEN: validate-20261107-183338.log; guards RED, no new failure: guards-20261107-183339.log. Fix round 0977edd: build-20261107-183928.log, test-20261107-183930.log (33/33), validate-20261107-183934.log GREEN, guards-20261107-183935.log RED only on workbook-groups, workbook-card, plan-sections, plan-print (other lanes' files; lifted on trunk at be0f806d, baselines.md:34,35,39,40; clear on merge). bp-new, bp-form, review-start now pass and can be lifted (baselines.md:32,33,38).
- ASSUMED / not checked: validate and guards not re-run at 0977edd by the checker (the fix touches one Node test; the fixer's logs above). Browser gate not run (no hooks added, no browser tests). Focus, 44 px targets and speech not seen in a browser. Reading level by reading. Real Content.practices scripts not exercised (content-practices.js absent here; test stand-in used). U-22 not re-judged.
- Territory: 9f3026c6..HEAD 4 files, 3 own (ui-actions.js, ui-practices.js, actions-ui.test.mjs), 1 shared (styles.css inside /* -- actions -- */), 0 nobody's, 0 errors, no warnings; all 7 new commits carry both trailers.

Earlier (710502f):
VERIFIED (final run, 710502f):
- GATE build GREEN: C:\Users\ruchi\1-addic-wt\_logs\gates\actions\build-20261107-175436.log
- GATE test GREEN, 13 passing: C:\Users\ruchi\1-addic-wt\_logs\gates\actions\test-20261107-175440.log
- GATE validate GREEN: C:\Users\ruchi\1-addic-wt\_logs\gates\actions\validate-20261107-175443.log
- GATE guards RED on 7 names: C:\Users\ruchi\1-addic-wt\_logs\gates\actions\guards-20261107-175444.log. bp-new, bp-form, review-start are open baselines (baselines.md:32,33,38; U-23/U-24). workbook-groups, workbook-card, plan-sections, plan-print are struck in baselines.md since be0f806, which is not an ancestor of base 9f3026c6, so they are missing only because the lane predates that merge; they should clear on merge. Re-run guards after the merge. planner-day, planner-gaps, planner-add now pass (baselines.md:29-31 can be lifted).
- Territory: 2 own files (offline/src/ui-actions.js, offline/tests/actions-ui.test.mjs) and 1 shared append point (offline/src/styles.css), no errors, no warnings.

ASSUMED / not checked:
- Browser gate not run (not asked; no browser tests added in this slice).
- C1 was found by reading ui-core.js schedule()/render(), not in a browser.
- Reading level (grade 6-8) judged by reading, not measured.
- U-23, U-24, U-25 not judged.

### Review gates
None.

### Check
Verdict: first FIX at 3de2d32; re-check PASS at 710502f.
- C1 MEDIUM (ui-actions.js:346): the help line was lost on the Store re-render. Fixed b909a75 (helpOn derives it from saved blocks plus a memory-only HELP_DATES set). Re-check: FIXED.
- C2 LOW: the contract's data-testid hooks were missing. Fixed 710502f. Re-check: FIXED.
- C3 LOW: trailers of 84b92be and 3de2d32 carry Claude-Session 6721d28e, not d6887185. Not fixed: that is the session that really ran, and a fix needs a history rewrite, which the lane rules forbid. Re-check: WONTFIX-ACCEPTED.
- Note: the re-check's build gate rebuilt offline/1-addic.html, so the worktree shows it modified. It is build output, not a lane change; restore it before merging.

### Check, 2026-11-07 18:32 run
Verdict: FIX at 9ee68cf; re-check after 0977edd: all fixed. U-23, U-24, U-25 present as built.
- C1 MEDIUM (U-25 / U-23; actions-ui.test.mjs; code at ui-actions.js A.todos.remove): no test showed the event log never shrinks across removes and plan re-writes. Fixed 0977edd (one new test, no screen code: to-do remove, plan attach and edit via ?plan=<id>, two planner removes; every earlier event id remains, log not shorter, XP not lower). Re-check: FIXED. No new findings.

### Review
2026-11-07 18:32 run: none (not a flagged lane).
Not a flagged lane: no reviewers run.

### Safety and content marks
2026-11-07 18:32: still no clinicalReview or verify marks. Help lines in U-23 to U-25 only link to #/sos/urgent; the sober practice links to #/sos; the Battle Plan .ics never carries the buddy; contacts stay on the device. Practice scripts are the content lane's.
No clinicalReview: true passages and no verify: true resources. The planner has no substance-use or crisis copy; the help line only links to #/sos/urgent and shows no numbers. Nothing for the clinical reviewer or owner to check from this slice. Crisis-word detection uses Engine.crisisKeywords.

### Requests for other lanes
2026-11-07 18:32: tests-docs: hooks.mjs entries for bp-*, review-*, quest, prediction, todo and practice hooks (testids bp-save, bp-ics, bp-debrief-yes/no, review-next, review-save, todo-add, practice-start, practice-finish). HUB: lift bp-new, bp-form, review-start in baselines.md. content: Content.practices scripts (player tested with a stand-in). today-track / game-tutorials: links to #/actions/battle and /quests now reach real screens.
- offline/tests/helpers/hooks.mjs (owner: tests-docs): add tid("planner-add-btn"), tid("planner-block"), and [data-test="..."] selectors for the other planner hooks above, or ask this lane to add data-testid to them.
- baselines.md (HUB): lift planner-day, planner-gaps, planner-add.
- today-track / game-tutorials: links to #/actions/battle and #/actions/quests land on stubs until U-23/U-25.

### Docs owed
2026-11-07 18:32: guide lines for Battle Plans and the calendar file, Weekly Review and its reminder, quests, Prediction Lab, to-dos, practices player; README: Actions is complete.
- Guide (tests-docs/docs owner): "Actions > Planner: add blocks, mark them done or skipped, risky blocks get a Battle Plan."
- offline/README.md: Actions has a planner at #/actions/planner; other Actions parts show "being built" until U-23 to U-25.
- CLAUDE.md: none.

### Open questions
2026-11-07 18:32 (defaults taken): 5. Review saves weekStart = this Monday, looks back 7 days ending today. 6. Reminder rrule FREQ=WEEKLY;BYDAY=<reviewDay>. 7. Battle Plan .ics never carries the buddy. 8. Finishing a practice does not tick a quest. 9. A to-do's due date is not editable (no todos.update). 10. Run-phase Finish is practice-stop; practice-finish is on Save and finish. 11. Screen state that must survive a Store write is memory only (module scope).
1. Add-a-block as an inline form, not a UI.form sheet (SOS stays visible, testable). Default: inline.
2. Planner not gated by the progressive reveal (features 'planner', m6); a deep link opens it. Default: not gated.
3. Remove confirm is inline two-step, not UI.confirm. Default: inline.
4. Done/skipped can be set back to planned via "Change"; no event. Default: allowed.

### For the HUB at the merge
2026-11-07 18:32: tip 0977edd. styles.css actions section now ends near line 550, still closed by /* -- end actions -- */. ui-practices.js now has content (build.mjs already lists it). Still cut at 9f3026c6: rebuild and re-run guards after the merge; the 4 workbook/plan tour names clear. Restore offline/1-addic.html if shown modified. Browser flows for the quiet window: battle plan create and debrief, review, practice timer.
- Shared files: offline/src/styles.css, section /* -- actions -- */ lines 505-529 closed by /* -- end actions -- */, no token redefined. build.mjs untouched (already lists ui-actions.js and ui-practices.js).
- package.json and package-lock.json: no changes.
- Conflicts to expect: styles.css at the append point only; the lane predates be0f806 (workbook-settings), so rebuild and re-run guards after the merge.
- Territory warnings: none.
- Restore offline/1-addic.html in the worktree if shown modified.
- Browser tests in the quiet window: the planner flow (add, done/skipped, remove, risky block with Battle Plan link, open time "Add here", date navigation) once tests-docs adds the hooks; this lane has no browser tests yet.
