# Contract: lane game-tutorials (BASE 1ef2482e). Status: NEW means waits for this lane.

## Exposed (all NEW; consumers named)
GuidanceUI (ui-guidance.js, U-27)
- `coach(tutorialId, opts?) -> Promise<'done'|'skipped'|'aborted'>`: overlay; consumer workbook-settings (replay), internal.
- `maybeTour(ctx) -> void`: called after render; starts `tour` per rules. Consumer: none (self-hooked on hashchange).
- `featureOfRoute(path) -> featureId|null` (pure).
- `training() -> [{id, name, route, kind}]` (SOBER, quicklog, battle, trial, refusal, SOS drill, tour, JITs). Consumer: workbook-settings.
- `tipCard(ctx) -> Node|null`; `explorerRing(ctx) -> Node|null`; `moreTools(ctx) -> Node|null`; `dot(featureId) -> Node|null`. Consumer: today-track.
- data-tour names added: `tips-card`, `explorer-ring`, `more-tools`.
GameUI (ui-game.js, U-26): `model(gameState)`, `xpBar(ctx)`, `skillMastery(ctx)`, `badgeShelf(ctx)`, `rankCard(ctx)`, `regionLight(ctx, regionId) -> 0..5`, `celebrate(kind, text)`, `panel(ctx) -> Node|null`. Consumers: today-track (panel, regionLight in ui-harbor). data-tour `game-panel`.
ToolsUI (ui-tools.js, U-28): registers `UI.pages.tools` and `UI.pages.games`; routes of 3.5 (`#/tools/trial?mode=redflag|mood&thought=&drill=1`, `should-i-go`, `problem-solver`, `#/games/big-game|distortion-sort|spot-red-flag|refusal|rewrite`). Consumers: learn (tryIt routes), actions (tools list), SOS (Comeback reads responses of `trial`), workbook-settings (Training).
DOM hooks for tests-docs (to add to hooks.mjs by outbox): `[data-tour]` names above, `.coach-overlay`, `.coach-next`, `.coach-skip`, `[data-test=tip-got-it]`, `[data-test=show-now]`, `[data-test=game-card]`, `[data-test=trial-closing]`.
Events written only through Actions: TutorialCompleted, FeatureRevealed, ExerciseDone, ArtifactSaved. This lane defines no new event.

## Relied on, at BASE (1ef2482e)
- Engine (engine.js:1495-1499): gameState 474, xpFromEvents 197, mastery 255, regionLevels 275, momentum 288, rank 329, badges 379, revealed 589, isRevealed 601, newDots 603, explorer 616, explorerDone 638, quests 660, pickTip 811 (view, now, {route}) -> tip|null.
- Actions: tutorial.done 736, tutorial.replay 752, reveal 761, markTipShown 772, saveResponse 465. None for ExplorerCompleted (request to actions-sos).
- UI (ui-core.js:984-986): h, svg, icon, toast, sheet, confirm, form, card, tile, chips, ring, meter, empty, go, route, render, pages, ctx, speak, stopSpeaking.
- Content keys present: tutorials (tour, drill, quicklog, planner, battlePlans, workbook, insights, weeklyReview, recoveryPlan; `{id,name,kind:'tour'|'drill'|'jit',feature?,steps:[{target,text}]}`), tips `{id,text,route,when}`, explorer `{id,label}`, reveal `{always:[], m2..m10:[featureId]}`, features `{name,gist,tab}`, regions (6), skills, ranks, badges, xp, masteryThresholds, milestones, catalogs.distortions/redFlags/spiral/refusal(strings), cast.

## Waits for another lane
Content.games (content lane, U-32): 
- `trial: {charge: [text], prompts: {for, against, verdict, closing}}` plus red-flag examples from catalogs.redFlags.
- `bigGame: {character:{name,bio}, start:'n1', nodes:{id:{text, choices:[{t, to, note}], end?:true, wrap?}}}`.
- `refusal: {scenes:[{id, setup, offer, options:[{t, fit:index into catalogs.refusal, feedback}]}]}`.
- `rewrite: {steps:[{prompt, hint}]}`; `shouldIGo: {questions:[{q, risk:0..2}], advice:{low,mid,high}}`; `problemSolver: {steps:[{prompt, hint}]}`; `distortionSort: {items:[{text, answer: distortion id}]}` (optional; else built from catalogs.distortions[].example); `spotRedFlag: {items:[{text, flag:true|false}]}` (optional; else built from catalogs.redFlags).
- Exercises `trial`, `should-i-go`, `rewrite-scene` (content-exercises.js).
- Optional Content.tutorials entries of kind 'training'.
Absent keys give an honest stub, so nothing here blocks a merge.
Tutorial targets carried by other lanes: see the brief; none are added by this lane to Content.tutorials.
