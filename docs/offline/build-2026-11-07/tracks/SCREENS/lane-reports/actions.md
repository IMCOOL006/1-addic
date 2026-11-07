## actions (SCREENS, 1-addic offline build): the slice report

State: READY-SLICE. Branch build/actions. Base 9f3026c6. Tip 710502f. Date 2026-11-07 17:42 IST (facts). Worktree C:/Users/ruchi/1-addic-wt/actions.
Commits (9f3026c6..HEAD):
- 84b92be feat(actions, U-22): the day planner at #/actions/planner
- 3de2d32 test(actions, U-22): planner Node tests in actions-ui.test.mjs
- b909a75 fix(actions, U-22, C1): the planner help line survives the Store re-render
- 710502f fix(actions, U-22, C2): the contract's data-testid hooks on the planner

### Turn caps
No builder entries were recorded in the facts (builders: []); no builder is recorded as returning without a note. capHits: 0.

### Units
- U-22 Planner (tier 2): DONE. SHAs 84b92be, 3de2d32, fixes b909a75, 710502f. For a person: the Actions hub at #/actions (Planner card opens the planner; the other six cards say "This part is being built"). Sub-routes /battle, /review, /quests, /predictions, /todos show an honest stub with "Back to Actions" and "Open the Planner". The planner at #/actions/planner?date=YYYY-MM-DD (default today; a bad date falls back to today) has Previous day / Today / Next day and an inline "Add a block" form (title, kind, day, start, end, activity, risky, reward). Saves go through Actions.plans.add/update; a refused plan shows Actions' own message and keeps the input. Each block shows time, kind, Risky time and Sample badges, Done / Skipped / Change, Edit, Remove (inline two-step). Risky blocks show their Battle Plan or "Add a Battle Plan". A past unmarked block reads "Not marked yet. How did it go?" with no overdue wording or red. "Open time" lists gaps with "Add here"; "Ideas for open time" lists up to 3 suggestions with "Plan this". Crisis words in a saved block keep a calm "Get help now" line to #/sos/urgent, also after the Store re-render (C1).
  Closes: brief OQ4 (a Battle Plan always needs date/start/end) stands for U-23.
- Held or blocked: none.
- Still to build on this lane: U-23 (Battle Plans; replaces stubPage('battle') at #/actions/battle?plan=<id>; tours bp-new, bp-form), U-24 (Weekly Review; tour review-start), U-25 (quests, to-dos, practices).

### Contract changes
- UI.pages.actions (registered from ui-actions.js). Routes #/actions, #/actions/planner?date=. Consumers: today-track (links), game-tutorials (planner tour), tests-docs (browser planner flow).
- data-tour: planner-day, planner-gaps, planner-add. Consumer: game-tutorials.
- Pure exports (module.exports guard): planRowsForDate(view,date), gapRows(E,view,date), ideaRows(E,view,date), pastUnmarked(plan,now), planFromValues(values), saveBlock(A,values,id?) -> {ok,plan}|{ok:false,code,message}, plannerDate(route,now), localDate, shiftDate, dayLabel, timeLabel. Consumer: none yet (Node tests only). battlePlanIcsItem and reviewIcsItem are U-23/U-24.
- Hooks: data-testid="planner-add-btn" and "planner-block" (the contract's names), beside data-test. All others are data-test only: planner, planner-form, planner-f-title/kind/date/start/end/activity/risky/reward/error, planner-save, planner-cancel, planner-day, planner-risky, planner-bp, planner-bp-add, planner-bp-edit, planner-unmarked, planner-done, planner-skip, planner-status, planner-undo, planner-edit, planner-remove, planner-remove-yes, planner-remove-no, planner-gaps, planner-gap, planner-gap-add, planner-ideas, planner-idea, planner-idea-add, planner-date, planner-prev, planner-today, planner-next, planner-help, planner-help-go, actions-hub, actions-hub-<id>, actions-open-planner, actions-stub, actions-back, actions-to-planner. Consumer: tests-docs (hooks.mjs).
- No events, content keys or stores added. Events only via Actions.plans.

### Gates
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

### Review
Not a flagged lane: no reviewers run.

### Safety and content marks
No clinicalReview: true passages and no verify: true resources. The planner has no substance-use or crisis copy; the help line only links to #/sos/urgent and shows no numbers. Nothing for the clinical reviewer or owner to check from this slice. Crisis-word detection uses Engine.crisisKeywords.

### Requests for other lanes
- offline/tests/helpers/hooks.mjs (owner: tests-docs): add tid("planner-add-btn"), tid("planner-block"), and [data-test="..."] selectors for the other planner hooks above, or ask this lane to add data-testid to them.
- baselines.md (HUB): lift planner-day, planner-gaps, planner-add.
- today-track / game-tutorials: links to #/actions/battle and #/actions/quests land on stubs until U-23/U-25.

### Docs owed
- Guide (tests-docs/docs owner): "Actions > Planner: add blocks, mark them done or skipped, risky blocks get a Battle Plan."
- offline/README.md: Actions has a planner at #/actions/planner; other Actions parts show "being built" until U-23 to U-25.
- CLAUDE.md: none.

### Open questions
1. Add-a-block as an inline form, not a UI.form sheet (SOS stays visible, testable). Default: inline.
2. Planner not gated by the progressive reveal (features 'planner', m6); a deep link opens it. Default: not gated.
3. Remove confirm is inline two-step, not UI.confirm. Default: inline.
4. Done/skipped can be set back to planned via "Change"; no event. Default: allowed.

### For the HUB at the merge
- Shared files: offline/src/styles.css, section /* -- actions -- */ lines 505-529 closed by /* -- end actions -- */, no token redefined. build.mjs untouched (already lists ui-actions.js and ui-practices.js).
- package.json and package-lock.json: no changes.
- Conflicts to expect: styles.css at the append point only; the lane predates be0f806 (workbook-settings), so rebuild and re-run guards after the merge.
- Territory warnings: none.
- Restore offline/1-addic.html in the worktree if shown modified.
- Browser tests in the quiet window: the planner flow (add, done/skipped, remove, risky block with Battle Plan link, open time "Add here", date navigation) once tests-docs adds the hooks; this lane has no browser tests yet.
