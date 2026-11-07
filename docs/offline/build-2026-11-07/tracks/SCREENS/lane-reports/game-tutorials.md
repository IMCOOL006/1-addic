## game-tutorials (SCREENS, 1-addic offline build): the slice report

State: READY-SLICE (2026-11-07 17:42 IST). Branch build/game-tutorials, worktree C:/Users/ruchi/1-addic-wt/game-tutorials. Base 9f3026c6. Tip 5af6665.
Commits (9f3026c6..HEAD): 5af6665 feat(offline, U-27): guidance engine (ui-guidance.js). It holds the engine, its Node test file and the styles.css section; the tip is clean.

### Turn caps
- Builder batch [U-27]: steps_used 11, returned a note (done: U-27, 5af6665). capHits 0. The earlier run wf_8e6d4a60-85a was stopped at 17:34 with the work uncommitted; the relaunch finished and committed it.

### Units
- U-27 Guidance engine (slice), 5af6665. For a person using the file: a first-run tour after onboarding walks the nav and SOS (Next/Skip, "Step i of n"; Escape, Skip or a tap elsewhere ends it as skipped). A missing target shows as a centred card. The popover has its own SOS link; a route to SOS, lock or onboarding closes it and marks nothing. Screens with a revealed feature and an undone tutorial get a "Show me / Later" bar (Later asks again at most once a day, memory only). Today (embedded by today-track) gets the tip card, the Explorer ring (12 first steps), "More tools unlock as you learn" and "New" dots. Settings "Replay the tour" works. ?tour=1 and ?tutorial=<id> start a tutorial on arrival.
  Closes: ExplorerCompleted is written once through Actions.recordEvent (R-C-21); Training drills are code constants in ui-guidance.js (Content.tutorials kind 'training' with a route merges in if added); the onboarding signal is profile.onboardedAt (or onboarded: true) or an OnboardingCompleted event.
- Held or blocked: none.
- Still to build on this lane: U-26 (offline/src/ui-game.js: GameUI.model/xpBar/skillMastery/badgeShelf/rankCard/regionLight/celebrate/panel, data-tour game-panel; read engine.js gameState first, cites have moved) and U-28 (offline/src/ui-tools.js: UI.pages.tools and UI.pages.games dispatching on ctx.route.parts[1]; Distortion Sort and Spot the Red Flag from Content.catalogs; Content.games screens are honest stubs until content U-32 merges; #/tools/trial?drill=1 and #/games/refusal?drill=1 must render).

### Contract changes
- GuidanceUI (offline/src/ui-guidance.js): coach(id, opts) -> Promise<'done'|'skipped'|'aborted'> (workbook-settings); replayTour() (workbook-settings); isOpen() (none yet); maybeTour(ctx) (none yet, self-hooked); featureOfRoute(path) (none yet); training() -> [{id,name,route,kind}] (workbook-settings); tipCard(ctx), explorerRing(ctx), moreTools(ctx), dot(featureId, ctx) (today-track). Test extras: shouldTour, jitFor, lockedFeatures, routeOfFeature, pathOf, afterRender, checkExplorer, TRAINING, _reset (none).
- UI.tour = {start(id), replay()} attached at load when absent (tests-docs browser suite "tour complete"/"tour skip"). ui-core.js not edited.
- Events: none new. Self-hooked on document 'ui:rendered' and window 'hashchange'. Writes only via Actions: tutorial.done, tutorial.replay, reveal, markTipShown, recordEvent('ExplorerCompleted').
- Content keys read: Content.features[id].route (optional, wins over FEATURE_ROUTES); Content.tutorials kind 'training' with route (optional). No new UI.pages entries in this slice.
- Routes started: #/practice/sober?drill=1, #/track?tutorial=quicklog, #/actions/battle?new=1&drill=1, #/tools/trial?drill=1, #/games/refusal?drill=1, #/sos?drill=1, #/today?tour=1, and <feature route>?tutorial=<id>. The tools and games drills depend on U-28.
- data-tour added: tips-card, explorer-ring, more-tools (consumer: today-track).
- data-test hooks for hooks.mjs (tests-docs): coach-overlay, coach-pop, coach-next, coach-skip, jit-bar, jit-show, jit-later, tip-card, tip-got-it, explorer-ring, explorer-hide, more-tools, show-now (data-feature), new-dot (data-feature). Classes .coach-overlay, .coach-next, .coach-skip.

### Gates
VERIFIED (check, tip 5af6665):
- GATE build GREEN (1 pass): C:\Users\ruchi\1-addic-wt\_logs\gates\game-tutorials\build-20261107-174842.log
- GATE test GREEN (14 pass, 0 fail): C:\Users\ruchi\1-addic-wt\_logs\gates\game-tutorials\test-20261107-174845.log
- GATE validate GREEN: C:\Users\ruchi\1-addic-wt\_logs\gates\game-tutorials\validate-20261107-174847.log
- GATE guards RED (4 pass, 10 fail): C:\Users\ruchi\1-addic-wt\_logs\gates\game-tutorials\guards-20261107-174848.log. All failures are tour-target names of screens not in this tree: planner-day, planner-gaps, planner-add, bp-new, bp-form, review-start (actions, baselined) and workbook-groups, workbook-card, plan-sections, plan-print (workbook-settings U-20/21, merged at be0f806d, which is not an ancestor of this tip; lifted on trunk). No new failure by name; none is this lane's.
- Territory: check_territory.py game-tutorials 9f3026c6..HEAD: 3 files changed (ui-guidance.js and game-tutorials.test.mjs are the lane's own; styles.css at its append point, lines 506-544, no token redefined). 0 unowned, 0 errors, 0 warnings.
ASSUMED (not run):
- Browser gate: never run; the lane added no browser tests and the suite needs hooks from tests-docs. The tap-through to SOS and the 44 px sizes were checked only against CSS and the Node stand-in DOM. Contrast of .coach-sos and .gt-dot not measured.

### Review gates
None.

### Check
PASS at 5af6665. No findings, so no fix SHA and nothing to re-check. U-26 and U-28 not judged (batch 2).

### Review
Not a flagged lane: no reviewers run.

### Safety and content marks
No passage marked clinicalReview: true and no resource marked verify: true in this slice (no crisis or substance text, no numbers or links). Safety behaviour to confirm: SOS is never gated; the coach layer (z 50) sits under the SOS button (z 60), is hidden on SOS and lock, and a route toward SOS marks nothing.

### Requests for other lanes
- tests-docs: add the data-test hooks above to offline/tests/helpers/hooks.mjs, then browser tests (tour complete, tour skip, JIT, tip card).
- today-track: embed GuidanceUI.tipCard, explorerRing, moreTools and dot(featureId) with data-tour tips-card, explorer-ring, more-tools.
- workbook-settings: Help uses GuidanceUI.replayTour() and training().
- content: optional Content.features[id].route and Content.tutorials kind 'training' routes; games content (U-32).

### Docs owed
- Guide (tests-docs): one line each on the tour, "Show me / Later", Training and "More tools".
- offline/README.md: a line that the first-run tour and tutorials can be replayed from Settings, Help.
- CLAUDE.md: none.

### Open questions
- Feature to route map: Content.features has no route; FEATURE_ROUTES in ui-guidance.js is used (Content wins when added).
- Quick-log training is the coach-marked walk over the real form (saves nothing), not a separate drill route.

### For the HUB at the merge
- Shared: offline/src/styles.css only, a new section at the end (506-544) between the game-tutorials banners. Expect an append conflict with other lanes' end sections; keep both. package.json and package-lock.json: unchanged.
- offline/1-addic.html is build output, left uncommitted; never commit it.
- Territory warnings: none. Guards RED on 10 names should clear for the workbook-settings four once merged with be0f806d; actions' six stay baselined until it merges.
- Browser tests for the quiet window: none from this lane yet; once tests-docs adds them, run with --grep "tour".
- Confirm ui-guidance.js is in build.mjs's parts list in the right order.
