## game-tutorials (SCREENS, 1-addic offline build): the slice report

State: READY-SLICE (2026-11-08 06:12 IST, tip 241e9bb; V-08b built, check PASS). Earlier: READY (2026-11-07 22:27 IST, tip bd2e085; FIX-TOUR built, browser GREEN). Earlier: READY (22:16 IST). Branch build/game-tutorials, worktree C:/Users/ruchi/1-addic-wt/game-tutorials. Base 9f3026c6. Tip bd2e085 (earlier 1ea2ebf; earlier: READY-SLICE at 5af6665, 17:42 IST).
Commits (9f3026c6..HEAD): 241e9bb feat(offline, game-tutorials): V-08b credit a used skill through Actions.useSkill (continued from 30cb12ff; 30cb12ff..HEAD is this one commit); bd2e085 fix(U-27, FIX-TOUR): coach popover keeps clear of the SOS button; b677dbd fix(U-27, FIX-TOUR): UI.tour.start and replay return nothing; 1ea2ebf fix(U-28, C1): contract hooks game-card and trial-closing; d4c49d1 test(U-28): tools routes, sort scoring, one Comeback, drills save nothing, stubs; 8dccbfb feat(U-28): tools and mini-games (ui-tools.js); 0f611e5 feat(U-26): game surfaces (ui-game.js); 5af6665 feat(U-27): guidance engine (ui-guidance.js).

### Turn caps
- Builder batch [U-27]: steps_used 11, returned a note (done: U-27, 5af6665). capHits 0. The earlier run wf_8e6d4a60-85a was stopped at 17:34 with the work uncommitted; the relaunch finished and committed it.
- 2026-11-07 22:16 run: no builder batch in this run (U-26 and U-28 were built by run wf_697f8fff-2d2, which the chat stopped after the U-28 commit under the memory pause rule, before the hand-off; no step count recorded). capHits 0.
- 2026-11-08 run (continued from 30cb12ff): builder batch [V-08b]: steps_used 13, returned a note (done: V-08b, 241e9bb). capHits 0. Lane paused on memory (2.74 GB at the browser run, under the 4.0 GB floor); V-28, V-44 and V-21 not started.

### Units
- U-27 Guidance engine (slice), 5af6665. For a person using the file: a first-run tour after onboarding walks the nav and SOS (Next/Skip, "Step i of n"; Escape, Skip or a tap elsewhere ends it as skipped). A missing target shows as a centred card. The popover has its own SOS link; a route to SOS, lock or onboarding closes it and marks nothing. Screens with a revealed feature and an undone tutorial get a "Show me / Later" bar (Later asks again at most once a day, memory only). Today (embedded by today-track) gets the tip card, the Explorer ring (12 first steps), "More tools unlock as you learn" and "New" dots. Settings "Replay the tour" works. ?tour=1 and ?tutorial=<id> start a tutorial on arrival.
  Closes: ExplorerCompleted is written once through Actions.recordEvent (R-C-21); Training drills are code constants in ui-guidance.js (Content.tutorials kind 'training' with a route merges in if added); the onboarding signal is profile.onboardedAt (or onboarded: true) or an OnboardingCompleted event.
- Held or blocked: none.
- Still to build on this lane: U-26 (offline/src/ui-game.js: GameUI.model/xpBar/skillMastery/badgeShelf/rankCard/regionLight/celebrate/panel, data-tour game-panel; read engine.js gameState first, cites have moved) and U-28 (offline/src/ui-tools.js: UI.pages.tools and UI.pages.games dispatching on ctx.route.parts[1]; Distortion Sort and Spot the Red Flag from Content.catalogs; Content.games screens are honest stubs until content U-32 merges; #/tools/trial?drill=1 and #/games/refusal?drill=1 must render).
- 2026-11-07 22:16 run (U-26 0f611e5; U-28 8dccbfb, d4c49d1, fix 1ea2ebf). Held or blocked: none.
  U-26 Game surfaces, 0f611e5. For a person using the file: a Game panel (XP bar, skill mastery, badge shelf, rank card, region lights 0..5) reads only Engine.gameState. Momentum and current counters are not shown (they can fall). No streak, no random reward. Calm mode shows nothing. The 240 ms celebration is skipped in Calm mode, under reduced motion and on SOS.
  U-28 Tools and games, 8dccbfb, d4c49d1, 1ea2ebf. #/tools and #/games list every 3.5 route. Distortion Sort and Spot the Red Flag play from the catalogs (or Content.games). Put it on trial is a five-step courtroom saving one saveResponse('trial'); its closing statement is the Comeback SOS reads. Should I go, Problem Solver (exercise obstacles), Rewrite, Big Game and Refusal are guided steps or honest stubs with a way back until content (be0f806d) is in the build. ?drill=1 saves nothing. A finished game offers "That helped / Done for now": one SkillUsed event. Detail: game-tutorials__units.md.
  Closes: Content.games shape differences taken from the real content (sort, flag, bigGame.scenes, refusal[{scene,responses}]); finding C1 (hooks game-card, trial-closing) by 1ea2ebf.
- 2026-11-07 22:27 run (FIX-TOUR, U-27: b677dbd, bd2e085). Held or blocked: none. Browser gate was RED by name (tour complete, tour skip); two causes. (1) UI.tour.start/replay returned coach()'s Promise; now return undefined (b677dbd); GuidanceUI.coach and replayTour still return their Promise. (2) On bottom-nav steps the popover sat just above the nav and the SOS button (z 60) covered its Next button ("#sos-btn intercepts pointer events"). In bd2e085 place() reads #sos-btn's box and lifts an above-target popover over it, or narrows or flips a below-target one. For a person using the file: the tour's Next and Skip can always be tapped; SOS stays on top and reachable. Closes: browser RED on tour complete and tour skip. A coach-layout change must keep the popover clear of #sos-btn.
- 2026-11-08 run (V-08b, tier 1, 241e9bb). Held or blocked: none built-held; V-28, V-44 (tier 1) and V-21 (tier 2) not yet built (memory pause), to be built next in that order.
  V-08b Credit a used skill. For a person using the file: "That helped" or "Done for now" at the end of a game or guided tool credits the skill once through Actions.useSkill, so XP and mastery count it (once actions-sos V-08a, b7b4db9, is merged; before that no button is drawn, as in v1, O7). A refusal or a throw shows the same calm "Noted. Thank you." line, no error word; a double tap sends once; a drill records nothing. recordEvent('SkillUsed') is gone from ui-tools.js. Closes: brief Q1 (refusal shows the neutral line, no credit claim); supersedes the 22:16 note that SkillUsed went through recordEvent. Detail: game-tutorials__units.md.

### Contract changes
- GuidanceUI (offline/src/ui-guidance.js): coach(id, opts) -> Promise<'done'|'skipped'|'aborted'> (workbook-settings); replayTour() (workbook-settings); isOpen() (none yet); maybeTour(ctx) (none yet, self-hooked); featureOfRoute(path) (none yet); training() -> [{id,name,route,kind}] (workbook-settings); tipCard(ctx), explorerRing(ctx), moreTools(ctx), dot(featureId, ctx) (today-track). Test extras: shouldTour, jitFor, lockedFeatures, routeOfFeature, pathOf, afterRender, checkExplorer, TRAINING, _reset (none).
- UI.tour = {start(id), replay()} attached at load when absent (tests-docs browser suite "tour complete"/"tour skip"). ui-core.js not edited.
- Events: none new. Self-hooked on document 'ui:rendered' and window 'hashchange'. Writes only via Actions: tutorial.done, tutorial.replay, reveal, markTipShown, recordEvent('ExplorerCompleted').
- Content keys read: Content.features[id].route (optional, wins over FEATURE_ROUTES); Content.tutorials kind 'training' with route (optional). No new UI.pages entries in this slice.
- Routes started: #/practice/sober?drill=1, #/track?tutorial=quicklog, #/actions/battle?new=1&drill=1, #/tools/trial?drill=1, #/games/refusal?drill=1, #/sos?drill=1, #/today?tour=1, and <feature route>?tutorial=<id>. The tools and games drills depend on U-28.
- data-tour added: tips-card, explorer-ring, more-tools (consumer: today-track).
- data-test hooks for hooks.mjs (tests-docs): coach-overlay, coach-pop, coach-next, coach-skip, jit-bar, jit-show, jit-later, tip-card, tip-got-it, explorer-ring, explorer-hide, more-tools, show-now (data-feature), new-dot (data-feature). Classes .coach-overlay, .coach-next, .coach-skip.
- 2026-11-07 22:16: GameUI (ui-game.js): model, xpBar, skillMastery, badgeShelf, rankCard, regionLight(ctx,id) 0..5, regionLights, celebrate, panel (consumers: today-track, learn, workbook-settings); data-tour game-panel. ToolsUI {toolsPage, gamesPage, TOOLS, GAMES, TEXT, exercise, available, sortItems, checkSort, sortSummary, flagModel, scoreFlags, bigGameModel, bigGameNext, refusalModel, refusalFeedback, stepsFor, missing, payloadOf, startValues, optionsOf}; UI.pages.tools and UI.pages.games. The trial payload adds keys for and verdict. Events: only SkillUsed via Actions.recordEvent. Hooks for hooks.mjs: see game-tutorials__units.md (tools-page, games-page, game-card, trial-closing, tl-*, sort-*, flag-*, bg-*, drill-banner and more).
- 2026-11-07 22:27: UI.tour = {start, replay} now return undefined (was a Promise). No other change; place() keeps the popover clear of #sos-btn.
- 2026-11-08: no names added or changed. ToolsUI now consumes Actions.useSkill({skillId, helpful}) -> {ok, event} (actions-sos V-08a, R-C-47/48) behind typeof check; the Events line above is superseded: no SkillUsed via recordEvent. Hooks unchanged.

### Gates
VERIFIED (check, tip 5af6665):
- GATE build GREEN (1 pass): C:\Users\ruchi\1-addic-wt\_logs\gates\game-tutorials\build-20261107-174842.log
- GATE test GREEN (14 pass, 0 fail): C:\Users\ruchi\1-addic-wt\_logs\gates\game-tutorials\test-20261107-174845.log
- GATE validate GREEN: C:\Users\ruchi\1-addic-wt\_logs\gates\game-tutorials\validate-20261107-174847.log
- GATE guards RED (4 pass, 10 fail): C:\Users\ruchi\1-addic-wt\_logs\gates\game-tutorials\guards-20261107-174848.log. All failures are tour-target names of screens not in this tree: planner-day, planner-gaps, planner-add, bp-new, bp-form, review-start (actions, baselined) and workbook-groups, workbook-card, plan-sections, plan-print (workbook-settings U-20/21, merged at be0f806d, which is not an ancestor of this tip; lifted on trunk). No new failure by name; none is this lane's.
- Territory: check_territory.py game-tutorials 9f3026c6..HEAD: 3 files changed (ui-guidance.js and game-tutorials.test.mjs are the lane's own; styles.css at its append point, lines 506-544, no token redefined). 0 unowned, 0 errors, 0 warnings.
ASSUMED (not run):
- Browser gate: never run; the lane added no browser tests and the suite needs hooks from tests-docs. The tap-through to SOS and the 44 px sizes were checked only against CSS and the Node stand-in DOM. Contrast of .coach-sos and .gt-dot not measured.
2026-11-07 22:16 run, VERIFIED (check, tip 1ea2ebf):
- GATE build GREEN (699863 B): C:/Users/ruchi/1-addic-wt/_logs/gates/game-tutorials/build-20261107-221637.log
- GATE test GREEN (25 pass, 0 fail): C:/Users/ruchi/1-addic-wt/_logs/gates/game-tutorials/test-20261107-221638.log
- GATE validate GREEN: C:/Users/ruchi/1-addic-wt/_logs/gates/game-tutorials/validate-20261107-221639.log
- GATE guards RED (4 pass, 10 fail): C:/Users/ruchi/1-addic-wt/_logs/gates/game-tutorials/guards-20261107-221639.log. The same 10 tour-target names as at 5af6665; their lanes merged after cut 9f3026c6; lifted on the trunk. None is this lane's.
- Territory: 5 files, 4 own (ui-game.js, ui-guidance.js, ui-tools.js, game-tutorials.test.mjs), 1 shared (styles.css, appended inside the game-tutorials banners, no token redefined); 0 errors, 0 warnings.
ASSUMED (not run): browser gate (no browser tests; hooks not yet in hooks.mjs; focus, 44 px, contrast and the 240 ms animation checked only against CSS and the Node stand-in DOM). Trial, Should I go, Problem Solver, Rewrite, Big Game and Refusal not run on merged content (absent from this cut; stand-ins match be0f806d).
2026-11-07 22:27 run, VERIFIED (check, tip bd2e085):
- GATE build GREEN (701296 B): C:/Users/ruchi/1-addic-wt/_logs/gates/game-tutorials/build-20261107-223108.log
- GATE test GREEN (27 pass, 0 fail): C:/Users/ruchi/1-addic-wt/_logs/gates/game-tutorials/test-20261107-223108.log
- GATE validate GREEN: C:/Users/ruchi/1-addic-wt/_logs/gates/game-tutorials/validate-20261107-223109.log
- GATE guards RED (4 pass, 10 fail): C:/Users/ruchi/1-addic-wt/_logs/gates/game-tutorials/guards-20261107-223109.log. Same 10 tour-target names; lanes merged after cut 9f3026c6. None is this lane's.
- GATE browser GREEN (pass 12, fail 0, skip 7): C:/Users/ruchi/1-addic-wt/_logs/gates/game-tutorials/browser-20261107-223109.log. tour complete, tour skip, tour replay pass. Skips allowed: #/onboarding, #/sos, #/workbook routes, quicklog-button hook.
- Territory: 5 files, 4 own, 1 shared (styles.css); 0 errors, 0 warnings. Commits since 1ea2ebf touch only ui-guidance.js and game-tutorials.test.mjs.
ASSUMED (not run): place() narrow and flip branches in a real browser at other viewport sizes (only 390 px ran).
2026-11-08 run, VERIFIED (check, tip 241e9bb):
- GATE build GREEN (1161090 B): C:/Users/ruchi/1-addic-wt/_logs/gates/game-tutorials/build-20261108-064709.log
- GATE test GREEN (32 pass, 0 fail): C:/Users/ruchi/1-addic-wt/_logs/gates/game-tutorials/test-20261108-064719.log
- GATE validate GREEN: C:/Users/ruchi/1-addic-wt/_logs/gates/game-tutorials/validate-20261108-064757.log
- GATE guards GREEN (5 pass, 0 fail): C:/Users/ruchi/1-addic-wt/_logs/gates/game-tutorials/guards-20261108-064759.log
- Territory: 30cb12ff..HEAD 2 files, both own (ui-tools.js, game-tutorials.test.mjs); 0 shared, 0 errors, 0 warnings.
ASSUMED (not run): browser gate not re-run by the check; builder reported GREEN 21/0/0 at C:/Users/ruchi/1-addic-wt/_logs/gates/game-tutorials/browser-20261108-063334.log. Real Actions.useSkill not run against ui-tools.js in a merged tree (base lacks V-08a; signature read on build/offline-v1 actions.js:272-291).

### Review gates
None.
2026-11-07 22:16: not a flagged lane: no reviewers run; no review findings.
2026-11-08: not a flagged lane: no reviewers run.
2026-11-08: not a flagged lane: no reviewers run.

### Check
PASS at 5af6665. No findings, so no fix SHA and nothing to re-check. U-26 and U-28 not judged (batch 2).
2026-11-07 22:16: PASS at 1ea2ebf over commits after 5af6665 (U-26, U-28). Finding C1 (MEDIUM, U-28, missing hooks game-card and trial-closing): fix 1ea2ebf; the finder's re-check: closed (ui-tools.js:303 and :211, two tests). No open findings. Notes: _logs/reports/game-tutorials/game-tutorials__check.md.
2026-11-07 22:27: PASS at bd2e085 over commits after 1ea2ebf (FIX-TOUR). Finding C1 (LOW, FIX-TOUR, ui-guidance.js:329-334): no Node case for a high target whose below-popover meets #sos-btn (narrow or flip branch); the new test puts all targets at top 736 and covers only the above-target branch. No fix SHA; the finder's re-check: open (LOW, accepted). Not checked: earlier code to 1ea2ebf; other viewports.
2026-11-08: PASS at 241e9bb over commits after 30cb12ff (V-08b). No findings, so no fix SHA and nothing to re-check; open 0. Earlier open LOW C1 (FIX-TOUR) unchanged. Not checked: browser re-run, merged-tree run with V-08a, U-27/U-26/U-28/FIX-TOUR (ancestors of base).

### Review
Not a flagged lane: no reviewers run.

### Safety and content marks
No passage marked clinicalReview: true and no resource marked verify: true in this slice (no crisis or substance text, no numbers or links). Safety behaviour to confirm: SOS is never gated; the coach layer (z 50) sits under the SOS button (z 60), is hidden on SOS and lock, and a route toward SOS marks nothing.
2026-11-07 22:16: none added by U-26 or U-28. The Big Game and Refusal scenes carry clinicalReview: true in the content lane. The game panel has no streak, no loss framing, no random reward; Calm mode hides it; SOS is never gated and the celebration is skipped on SOS. Drills save nothing.
2026-11-07 22:27: none new. Safety: SOS z-order unchanged (60 over coach 50); the popover now never covers SOS.
2026-11-08: none new. A refused or failed skill credit shows a neutral line (no error, no red); drills credit nothing; SOS untouched.

### Requests for other lanes
- tests-docs: add the data-test hooks above to offline/tests/helpers/hooks.mjs, then browser tests (tour complete, tour skip, JIT, tip card).
- today-track: embed GuidanceUI.tipCard, explorerRing, moreTools and dot(featureId) with data-tour tips-card, explorer-ring, more-tools.
- workbook-settings: Help uses GuidanceUI.replayTour() and training().
- content: optional Content.features[id].route and Content.tutorials kind 'training' routes; games content (U-32).
- 2026-11-07 22:16: tests-docs: add the U-26/U-28 hooks (game-card, trial-closing, tools-page, games-page, drill-banner, tl-*) and browser tests. today-track: embed GameUI.panel / regionLights. learn and actions: link to #/tools and #/games. content: Content.games and exercises trial, should-i-go, obstacles, rewrite-scene must be in the same build (be0f806d).
- 2026-11-07 22:27: none for the other lanes. tests-docs: the "tour complete"/"tour skip" browser tests now pass at bd2e085.
- 2026-11-08: actions-sos: V-08a (Actions.useSkill, b7b4db9) must merge before V-08b shows any helped button; game skill ids are all in Content.skills. today-track V-01b and content V-10 are go-aheads for V-28.

### Docs owed
- Guide (tests-docs): one line each on the tour, "Show me / Later", Training and "More tools".
- offline/README.md: a line that the first-run tour and tutorials can be replayed from Settings, Help.
- CLAUDE.md: none.
- 2026-11-07 22:16: Guide pages for Tools, Games and the Game panel (tests-docs). README: a line on the tools and mini-games.
- 2026-11-07 22:27: none new.
- 2026-11-08: none new.

### Open questions
- Feature to route map: Content.features has no route; FEATURE_ROUTES in ui-guidance.js is used (Content wins when added).
- Quick-log training is the coach-marked walk over the real form (saves nothing), not a separate drill route.
- 2026-11-07 22:16: (1) A finished game asks "That helped / Done for now" before SkillUsed (default: ask; nothing recorded if neither tapped). (2) Game-to-skill map spot-trap / talk-back / then-what / refuse (default as built). (3) Momentum left out of the game panel (default).
- 2026-11-08: brief Q1 closed (neutral line). Open: none. Default for V-28 and later: wait for memory above 4.0 GB, today-track V-01b and content V-10 in the worktree.

### For the HUB at the merge
- Shared: offline/src/styles.css only, a new section at the end (506-544) between the game-tutorials banners. Expect an append conflict with other lanes' end sections; keep both. package.json and package-lock.json: unchanged.
- offline/1-addic.html is build output, left uncommitted; never commit it.
- Territory warnings: none. Guards RED on 10 names should clear for the workbook-settings four once merged with be0f806d; actions' six stay baselined until it merges.
- Browser tests for the quiet window: none from this lane yet; once tests-docs adds them, run with --grep "tour".
- Confirm ui-guidance.js is in build.mjs's parts list in the right order.
- 2026-11-07 22:16: styles.css gains lines inside the same game-tutorials banners; keep both sides at append conflicts. build.mjs already lists ui-game.js:34, ui-tools.js:35, ui-guidance.js:40. Guards RED on the 10 names clears once actions and workbook-settings are merged. After the merge re-run tools and games against be0f806d content. Commit trailers carry Claude-Session d6887185 (SCREENS before the 22:04 relaunch): not a finding. offline/1-addic.html stays uncommitted.
- 2026-11-07 22:27: FIX-TOUR touches only ui-guidance.js and the Node test; the browser quiet window can run --grep "tour" and expect GREEN. offline/1-addic.html stays uncommitted. Open LOW C1 is optional.
- 2026-11-08: V-08b touches no shared file. Merge after actions-sos V-08a (else no helped button, harmless). V-28, V-44, V-21 remain; the lane is PAUSED on memory, not stopped.