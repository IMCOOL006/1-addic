## game-tutorials (SCREENS, 1-addic offline build): the slice report

State: READY (2026-11-09 15:16 IST, tip 4df19dc; V-21 built on base ff9fbd99, check PASS). Earlier: READY (2026-11-08 09:38 IST, tip 3aefecb). Earlier: READY-SLICE (06:12 IST, tip 241e9bb); READY (2026-11-07 22:27, tip bd2e085). Branch build/game-tutorials, worktree C:/Users/ruchi/1-addic-wt/game-tutorials. Base 9f3026c6; this run continued from 3fbd08f6.
Commits ff9fbd99..HEAD (2026-11-09): 4df19dc feat(offline): V-21 the coach ends as aborted when the route leaves its screen.
Commits 3fbd08f6..HEAD (2026-11-08): 3aefecb feat(game-tutorials V-44): unlocks and the reward sheet; 7214a52 test(game-tutorials V-28): the status tour step, JIT and New dot.
Commits (9f3026c6..HEAD): 241e9bb feat(offline, game-tutorials): V-08b credit a used skill through Actions.useSkill (continued from 30cb12ff; 30cb12ff..HEAD is this one commit); bd2e085 fix(U-27, FIX-TOUR): coach popover keeps clear of the SOS button; b677dbd fix(U-27, FIX-TOUR): UI.tour.start and replay return nothing; 1ea2ebf fix(U-28, C1): contract hooks game-card and trial-closing; d4c49d1 test(U-28): tools routes, sort scoring, one Comeback, drills save nothing, stubs; 8dccbfb feat(U-28): tools and mini-games (ui-tools.js); 0f611e5 feat(U-26): game surfaces (ui-game.js); 5af6665 feat(U-27): guidance engine (ui-guidance.js).

### Turn caps
- Builder batch [U-27]: steps_used 11, returned a note (done: U-27, 5af6665). capHits 0. The earlier run wf_8e6d4a60-85a was stopped at 17:34 with the work uncommitted; the relaunch finished and committed it.
- 2026-11-07 22:16 run: no builder batch in this run (U-26 and U-28 were built by run wf_697f8fff-2d2, which the chat stopped after the U-28 commit under the memory pause rule, before the hand-off; no step count recorded). capHits 0.
- 2026-11-08 run (continued from 30cb12ff): builder batch [V-08b]: steps_used 13, returned a note (done: V-08b, 241e9bb). capHits 0. Lane paused on memory (2.74 GB at the browser run, under the 4.0 GB floor); V-28, V-44 and V-21 not started.
- 2026-11-08 09:38 IST run (continued from 3fbd08f6): builder [V-28] steps_used 16, done 7214a52; builder [V-44] steps_used 24, done 3aefecb. capHits 0. Both noted PAUSED on memory (2.86 and 3.98 GB after the browser run, under 4.0 GB); V-21 (tier 2) not scheduled.
- 2026-11-09 15:16 IST run (continued from ff9fbd99): builder [V-21] steps_used 13, done 4df19dc. capHits 0. Not paused.

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
- 2026-11-08 09:38 IST run (V-28 7214a52; V-44 3aefecb). Held: none. V-21 (tier 2) not built.
  V-28 Status tour step. For a person using the file: no visible change; the code already mapped #/status to the status feature, its JIT, New dot and afterRender, so the commit adds the four brief tests only (test.mjs:907-997). Closes: code wins over the brief (no source change); never assert the tour step count (V-42 adds status-open, objectives-card, questline-card).
  V-44 Unlocks and reward sheet. For a person using the file: a feature opened early (a quest-line reward) shows its New dot and JIT only once unlocked, and a "You unlocked <name>" sheet offers Open it or Later, once per session. revealedSet now joins Engine.unlocked with Engine.revealed, then revealed, then reveal.always. Closes: the ten V-42 rewards have no Content.features route, so Open it uses routeOfFeature(id) (content route, else the FEATURE_ROUTES table); ui-tools.js and ui-game.js unchanged (no gate, R-H-44). Seven unlock tests added.
- 2026-11-09 run (V-21, tier 2, 4df19dc). Held: none.
  V-21 The coach after a route change. For a person using the file: going to #/track (or any screen the tutorial does not belong on) ends the tour or tutorial as aborted: nothing is marked done, the layer is removed, and the new screen's own "Show me / Later" bar appears on that render. Replay the tour from Settings stays on Settings until the route leaves it. place() unchanged in code; three Node cases assert its style values. Closes: brief Q4 (JIT abort rule); code wins over the brief: staysOn() also keeps a tutorial on the path it opened from (the brief's literal rule would kill the Settings replay and Training's JITs, which open on #/today). Seven tests: the brief's five plus "coach: a tour replayed from Settings stays on that screen until the route leaves it" and "coach: the new route offers its JIT once the tour has aborted". Detail: _logs/reports/game-tutorials/game-tutorials__units.md:154-164.

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
- 2026-11-08 09:38 IST: GuidanceUI.rewardSheet(featureId, ctx) -> sheet body node or null (null for a protected or unknown feature, on #/sos*, #/lock, #/onboarding, while locked, while the coach is open, or a second time in a session; writes nothing). Hooks: reward-sheet, reward-open, reward-later. Title "You unlocked <name>". revealedSet rule per R-H-44. Consumers: today-track V-43, tests-docs V-45.
- 2026-11-09: no names changed. coach() resolves "aborted" on a route leaving its screen (already in the type); no TutorialCompleted write. Public shape unchanged.

### Gates
Earlier runs gates: see C:/Users/ruchi/1-addic-wt/_logs/reports/game-tutorials-report-annex.md (all kept; each GREEN at its tip, logs under C:/Users/ruchi/1-addic-wt/_logs/gates/game-tutorials/).
2026-11-08 09:38 IST. VERIFIED (check, tip 3aefecb): build GREEN 1188362 B (_logs/gates/game-tutorials/build-20261108-105210.log); test GREEN 43/43 (test-20261108-105221.log); validate GREEN (validate-20261108-105227.log); guards GREEN 5/5 (guards-20261108-105228.log). ASSUMED: browser GREEN 25/0/0 from the builders (_logs/gates/game-tutorials/browser-20261108-103946.log; V-28 browser-20261108-095727.log), not re-run by the check; rewardSheet with the real UI.sheet in a browser (focus return, Escape, z-index under SOS, 44 px) not run.
2026-11-09 15:16 IST. VERIFIED (check, tip 4df19dc): build GREEN 1208111 B (_logs/gates/game-tutorials/build-20261109-152226.log); test GREEN 50/50 (test-20261109-152227.log); validate GREEN (validate-20261109-152312.log); guards GREEN 5/5 (guards-20261109-152312.log); browser --grep tour GREEN 3/0/0 (browser-20261109-152312.log). Own mutation check: 13 mutations each turned a new test red. ASSUMED: the full browser suite (not run; tour flows only, as the brief says); the other Node files. Builder logs: build-20261109-151955.log, test-20261109-151956.log, browser-20261109-151956.log.
Territory 2026-11-09: ff9fbd99..HEAD 2 files, 2 own, 0 shared, 0 nobody's, 0 errors, 0 warnings (ui-guidance.js, game-tutorials.test.mjs).

### Review gates
None.
2026-11-09 15:16 IST: not a flagged lane: no reviewers run; no review findings.
2026-11-09 15:16 IST: not a flagged lane: no reviewers run; no review findings.

### Check
(Older check lines 2026-11-07 and 2026-11-08 moved to game-tutorials-report-annex.md.)
PASS at 5af6665. No findings, so no fix SHA and nothing to re-check. U-26 and U-28 not judged (batch 2).
2026-11-08 09:38 IST: PASS at 3aefecb over commits after 3fbd08f6 (V-28, V-44). Finding C1 (LOW, V-44, test.mjs:1126): the brief named the test "unlock: jitFor offers the quest-line JIT only when unlocked"; built as "...offers an early-opened feature only when unlocked". Fix SHA: none; re-check state: open (name difference only, record kept here). Territory: 2 own files, 0 errors. Not checked: browser re-run, V-21, reduced motion (no CSS added). The check left offline/1-addic.html modified; restore before the next commit.
2026-11-09 15:16 IST: PASS at 4df19dc over commits after ff9fbd99 (V-21). Finding C1 (LOW, V-44, test.mjs:1126; carried, test name differs from the brief): fix SHA none; the finder's re-check: open (name only, recorded). No new finding. Not checked: full browser suite, other Node files, earlier units line by line, browser run of the Settings-replay variant.

### Review
Not a flagged lane: no reviewers run.

### Safety and content marks
No passage marked clinicalReview: true and no resource marked verify: true in this slice (no crisis or substance text, no numbers or links). Safety behaviour to confirm: SOS is never gated; the coach layer (z 50) sits under the SOS button (z 60), is hidden on SOS and lock, and a route toward SOS marks nothing.
2026-11-08 09:38 IST: none new. The reward sheet is never shown on SOS, lock or onboarding, nor to a protected feature; it writes nothing; no streak, loss framing or random reward; SOS untouched.
2026-11-09: none new. An aborted coach marks nothing and never covers SOS; no copy changed.

### Requests for other lanes
- tests-docs: add the data-test hooks above to offline/tests/helpers/hooks.mjs, then browser tests (tour complete, tour skip, JIT, tip card).
- today-track: embed GuidanceUI.tipCard, explorerRing, moreTools and dot(featureId) with data-tour tips-card, explorer-ring, more-tools.
- workbook-settings: Help uses GuidanceUI.replayTour() and training().
- content: optional Content.features[id].route and Content.tutorials kind 'training' routes; games content (U-32).
2026-11-08 09:38 IST: today-track V-43 and tests-docs V-45: use GuidanceUI.rewardSheet and the three reward hooks above; V-45 owns the browser flow "a quest-line step unlocks a feature". content: optional route on the ten reward features if the table should change.
2026-11-09: workbook-settings (question, default built: left as is): Replay the tour (ui-settings.js:421) runs on #/settings/help, where Today's targets are missing so steps show as centred cards; going to #/today?tour=1 (as GuidanceUI.training does) would run it on Today. Not this lane's file.

### Docs owed
See C:/Users/ruchi/1-addic-wt/_logs/reports/game-tutorials-report-annex.md (all lines kept there). 2026-11-08 09:38 IST: none new; V-44 reward sheet and unlock rules need one Guide line (tests-docs V-45).
2026-11-09: none new.

### Open questions
- Feature to route map: Content.features has no route; FEATURE_ROUTES in ui-guidance.js is used (Content wins when added).
- Quick-log training is the coach-marked walk over the real form (saves nothing), not a separate drill route.
- 2026-11-09: closed: brief Q4 (JIT abort rule). Open: Settings replay target (above, default left as is); C1 test name (keep).

### For the HUB at the merge
- Shared: offline/src/styles.css only, a new section at the end (506-544) between the game-tutorials banners. Expect an append conflict with other lanes' end sections; keep both. package.json and package-lock.json: unchanged.
- offline/1-addic.html is build output, left uncommitted; never commit it.
- Territory warnings: none. Guards RED on 10 names should clear for the workbook-settings four once merged with be0f806d; actions' six stay baselined until it merges.
- Browser tests for the quiet window: none from this lane yet; once tests-docs adds them, run with --grep "tour".
- Confirm ui-guidance.js is in build.mjs's parts list in the right order.
- 2026-11-08 09:38 IST: V-28 and V-44 touch only ui-guidance.js and game-tutorials.test.mjs; no shared file. Merge after today-track V-01b, content V-10 and V-42 (else rewards are absent, harmless). offline/1-addic.html stays uncommitted. V-21 remains. Lane READY at 3aefecb.
- 2026-11-09 15:16 IST: V-21 touches only ui-guidance.js and game-tutorials.test.mjs; no shared file. Lane READY at 4df19dc; all units built, none held. offline/1-addic.html stays uncommitted.
