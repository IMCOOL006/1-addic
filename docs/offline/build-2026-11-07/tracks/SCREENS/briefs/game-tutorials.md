# Brief: lane game-tutorials (SCREENS), units U-27, U-26, U-28 (tier 2, offline-v1.1)
Base 1ef2482e (read with `git show 1ef2482e:<path>`). Scouted 2026-11-07 16:07 IST. Contract: tracks/SCREENS/contracts/game-tutorials.md.

## Goal
1. The guidance layer: coach marks, first-run tour, just-in-time tutorials, Training drills, one tip a day, Explorer ring, reveal list with "Show now" and "New" dots. It never covers, gates or delays SOS.
2. The game surfaces: XP, mastery, badges, ranks, region light, celebrations, all rendered from Engine derivations; nothing ever decreases.
3. The tools and mini-games, each playing from Content data or honestly a stub (O7).

## Files
Owned (all new; build.mjs already lists them in its parts list, build.mjs:34-40): `offline/src/ui-game.js` (U-26), `offline/src/ui-guidance.js` (U-27), `offline/src/ui-tools.js` (U-28), `offline/tests/game-tutorials.test.mjs`.
Shared at append points: `offline/src/styles.css`, a new section at the end under `/* -- game-tutorials -- */` (tokens never redefined). `content-core.js` after `/* -- additions -- */` only through the content lane (Questions 2, 3).
Do not touch: ui-core.js, shell.html, engine.js, actions.js, store.js (by outbox request only); ui-sos.js, ui-onboarding.js (actions-sos, not merged: `git show build/actions-sos:<path>`); ui-today/track/harbor (today-track); ui-settings/workbook/plan (workbook-settings); ui-actions/practices (actions); ui-learn/ui-exercise (learn); tests/browser.test.mjs and helpers/hooks.mjs (tests-docs: ask by outbox, list the hooks you need in the lane report).
Style: classic scripts, `const GuidanceUI = (function(){'use strict'; ...})()`, reading Content, Engine, Store, Actions as `typeof X !== 'undefined' ? X : null`; guarded `module.exports` of the pure functions for Node; DOM functions tested with the vm.runInThisContext pattern (learn.test.mjs:1-25 at base). Pages register as `UI.pages.tools` and `UI.pages.games` from ui-tools.js (router already knows both, ui-core.js:16-17). UI helpers (ui-core.js:984-986): `h, svg, icon, toast, sheet, confirm, form, card, tile, chips, ring, meter, empty, go, route, ctx, speak`. `UI.ctx()` gives `{view, E, A, profile, settings, term, now, features, calm, route}`. Calm mode (settings.calm) hides the game layer: ui-game renders nothing then.

## Order
Batch 1 (slice, merged first): U-27. Batch 2: U-26 and U-28 (independent).

## U-27 Guidance engine (3 h), slice. File ui-guidance.js
Today at base: Engine `revealed/isRevealed/newDots` (engine.js:589-607), `tutorialDone` (611), `explorer/explorerDone` (616-643), `pickTip(view, now, {route})` (811; returns null on `#/sos*`, when `settings.tips===false` or one was shown today). Actions `tutorial.done(id,{skipped})` (actions.js:736), `tutorial.replay(id)` (752), `reveal(featureId,{seen,forced})` (761), `markTipShown(id)` (772). Content: tutorials (content-core.js:227: tour, drill, quicklog, planner, battlePlans, workbook, insights, weeklyReview, recoveryPlan), tips (268), explorer (192, 12 items), reveal (179), features (153). Nothing renders them yet; ui-core has no coach-mark hook, so the overlay is yours, mounted on document.body (survives page re-render).
Build (3.11):
- `coach(tutorialId, opts)`: overlay spotlighting `[data-tour=<target>]`, one sentence, Next/Skip, focus moves to the step, an aria-live polite region announces it, Escape skips, 44 px buttons, no animation under reduced motion. A missing target shows the step as a centred card (never a dead step). Finish calls `Actions.tutorial.done(id)`; Skip calls `done(id,{skipped:true})`. `drill` (steps: []) is not coach-marked: it opens `#/sos?drill=1` (ui-sos.js).
- First-run tour: checked after each render, once per boot: onboarding complete (profile onboarded or an OnboardingCompleted event), `tutorialDone(view,'tour',true)` false, route not `#/sos*`, `#/onboarding` or `#/lock`, not locked; then run `tour` on Today. If SOS opens mid-tour the overlay closes and nothing is marked.
- JIT: on a route whose feature (pure `featureOfRoute(path)` over Content.features tabs/routes) is revealed and has an undone tutorial with that `feature`, show a small non-modal "Show me / Later" bar. Later marks nothing; ask again at most once a day (memory only). Never on `#/sos*`.
- Training: `training()` returns the list workbook-settings renders: SOBER (`#/practice/sober?drill=1`), quick log, Battle Plan (`#/actions/battle?new=1&drill=1`), trial (`#/tools/trial?drill=1`), refusal (`#/games/refusal?drill=1`), replay tour, replay each JIT, SOS drill (`#/sos?drill=1`). Drills use sample content and save nothing.
- Tips: `tipCard(ctx)` returns a card or null, Today only: `Engine.pickTip`, "Got it" -> `Actions.markTipShown(id)`, link `tip.route`.
- Explorer: `explorerRing(ctx)` returns a ring (UI.ring) opening the 12-item sheet, or null when `explorerDone` or dismissed.
- Reveal: `moreTools(ctx)` returns the collapsed "More tools unlock as you learn" details: unrevealed features with the module that reveals them (invert Content.reveal) and "Show now" (`Actions.reveal(id,{forced:true})`); `dot(featureId)` returns the "New" dot while `Engine.newDots(view).has(id)`; first visit calls `Actions.reveal(id,{seen:true})`.
Consumers: today-track (tipCard, explorerRing, moreTools, dot), workbook-settings (training, replay, showAll), learn (lesson wraps link to `?drill=1` routes). They call GuidanceUI only when `typeof GuidanceUI !== 'undefined'`.
Acceptance: every tutorial target exists (guards gate) and nothing ever covers, gates or delays SOS.
Tests (Node): `guidance: tour never starts on SOS routes`, `guidance: tour waits for onboarding`, `guidance: missing target falls back to a card`, `guidance: tip null on SOS and when off`, `guidance: moreTools lists only unrevealed with their module`, `guidance: skip marks skipped, finish marks done`, `guidance: every tutorial target is named as data-tour in ui-*.js or shell.html` (regex of gates.py:629). Feeds browser: tour, tips, reveal.
Rules: the overlay is removed on `#/sos*` and always carries its own SOS link (as UI.sheet does, ui-core.js:195-200); tips switchable; original words.

## U-26 Game surfaces (2 h). File ui-game.js
Today: `Engine.gameState(view, now)` (engine.js:474) returns `{xp, mastery, regions, momentum, rank, badges, modulesDone, lessonsDone, counters}`; also `xpFromEvents` (197), `mastery` (255), `regionLevels` (275), `momentum` (288), `rank` (329), `badges` (379). Content: skills (66), regions (56, six), ranks (127), badges (136), xp (113), masteryThresholds [1,3,7,15,30].
Build: pure `GameUI.model(gameState)` plus Nodes `xpBar`, `skillMastery`, `badgeShelf` (earned lit; unearned show how to earn, no countdown), `rankCard`, `regionLight(regionId)` (0-5; ui-harbor draws the scene, you supply numbers), `celebrate(kind, text)` (under 300 ms, none under reduced motion, calm mode or on `#/sos*`), `panel(ctx)` for Track/Today to embed. No new route.
Rules: render from Engine only; never recompute or show a lower number; total days not a streak; no points for claimed sober days; no random rewards; a slip changes nothing here.
Acceptance: renders from Engine derivations and none of them ever decreases.
Tests: `game: xp, mastery, badges never decrease after SlipLogged`, `game: celebrate skipped in calm mode and on SOS`, `game: shelf lists every Content.badges`, `game: regionLight 0..5`. Feeds browser: game-panel.

## U-28 Tools and mini-games (4 h). File ui-tools.js
Today: nothing renders `#/tools/*` or `#/games/*`. Content at base: `catalogs.distortions` (6, `{id,name,gist,example,leadsTo,reply}`), `catalogs.redFlags` (12 strings), `catalogs.spiral` (8), `catalogs.refusal` (7 strings only, content-core.js:358: no scenes), `cast` (5: meera, raj, farhan, kavita, dev). Exercises `trial`, `should-i-go`, `rewrite-scene` come from the content lane (3.8). `Actions.saveResponse(exerciseId, payload, {mode})` (actions.js:465) saves a Comeback through `trial`.
Routes (3.5): `#/tools/trial?mode=redflag|mood&thought=`, `#/tools/should-i-go`, `#/tools/problem-solver`, `#/games/big-game`, `distortion-sort`, `spot-red-flag`, `refusal`, `rewrite`. `UI.pages.tools/games` dispatch on `ctx.route.parts[1]`.
Build: Distortion Sort and Spot the Red Flag are playable at base from catalogs. Trial: courtroom steps (charge, evidence for, evidence against, verdict, closing statement) saved as a Comeback via saveResponse('trial'); `thought` prefills. The Big Game: branching story with an original character, from Content.games.bigGame. Refusal Rehearsal: scenes with feedback against catalogs.refusal. Rewrite the Scene, Should I go?, Problem Solver: guided steps, saved through their exercise ids. When a Content.games key is absent the screen is an honest stub with a way back, never a dead button (O7). XP only through Actions events; a `?drill=1` run saves nothing.
Rules: clinicalReview: true on passages about offers or slips (brief, clinical, no how-to); person-first; SOS stays one tap; keyboard, labels, 44 px; no punishing timers.
Acceptance: each plays from content data or is honestly a stub (O7).
Tests: `tools: every route renders a node or a stub`, `tools: distortion sort scores from catalogs`, `tools: trial saves one Comeback`, `tools: drill saves nothing`, `tools: refusal is a stub without Content.games.refusal`. Feeds browser: trial, games.

## Tutorial targets and the screen that carries each
nav-today, nav-learn, nav-workbook, nav-track, nav-actions, sos-button: exist (shell.html:14-20, ui-core.js:19-26). quicklog-button, quicklog-intensity, quicklog-save, insights-triggers, insights-heatmap: today-track (ui-today, ui-track). planner-day, planner-gaps, planner-add, bp-new, bp-form, review-start: actions (ui-actions). workbook-groups, workbook-card, plan-sections, plan-print: workbook-settings (ui-workbook, ui-plan). These stay RED by name in the guards gate until those lanes merge (baselines.md:24-40), not this lane's failure. Targets this lane adds are written literally as `'data-tour': 'tips-card'`, `explorer-ring`, `more-tools`, `game-panel`.

## Decisions that bite
O1 name/title, discreet "Notebook": use the SOS word helper (ui-core.js:695). O2 PIN offered, never forced: the tour never says otherwise. O3 no phone numbers here. O4 read-aloud via UI.speak only. O5 locale 'en'. O6 drills use sample content, save nothing. O7 stub, never dead. O8 not this lane.

## Open questions (default taken)
1. ExplorerCompleted has no Actions writer at base. Default: derive "done" from Engine, write nothing, file an outbox request to actions-sos for `Actions.explorer.complete()`.
2. Training drills are not in Content.tutorials. Default: Guidance holds them as code constants; ask the content lane to add `{id:'train-sober'...kind:'training', route}` entries later.
3. Content.games does not exist. Default: shapes in the contract; stubs until U-32 matches.
4. Onboarding-complete signal. Default: profile.onboarded true or an OnboardingCompleted event.
5. Who embeds GameUI.panel. Default: today-track; otherwise the lane report says so.

## Gates and baselines
`python C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tools/gates.py --wt C:/Users/ruchi/1-addic-wt/game-tutorials --lane game-tutorials build test validate guards` (browser or docs where they apply). Baselines: coordination/baselines.md (tour-target REDs above). Territory: `check_territory.py game-tutorials 1ef2482e..HEAD --wt ...`.
Go-aheads: none. Node tests stand in for ui-onboarding/ui-sos.

## Safety paragraph
SOS works offline, is never gated, covered or delayed by a tip, tour or tutorial; urgent help stays one tap from SOS. No streak resets, random rewards or points for claimed sober days; nothing decreases. No network, no trackers; data stays on the device. Accessible: keyboard, labels, visible focus, reduced motion, contrast, 44 px. Original words only (docs/book gives ideas, never wording). Person-first, adult-to-adult, grade 6-8. Substance passages brief and clinical, clinicalReview: true; unsure, write the shorter version. Numbers and links carry verify: true.
