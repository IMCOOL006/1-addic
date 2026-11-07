# today-track V3 contract (status layer "Your Harbor"); BASE f69bc68a

Attribute convention: every new hook is `data-test` (PLAN-V3 section 3), tour targets `data-tour`. tests-docs (V-03, V-01t) maps names in helpers/hooks.mjs. Lines are at f69bc68a.

## New by this lane (wait: merge of V-01a / V-01b)
Route and page (V-01a): `#/status`; `UI.pages.status = (ctx) => StatusUI.page(ctx)` in new `offline/src/ui-status.js`; build.mjs parts line after `ui-harbor.js` (:37). Consumers: tests-docs (V-01t), game-tutorials (V-28), content (V-10).

`StatusUI` (classic-script global; `module.exports` = PURE only):
- `model(gs, extra) -> {regions:[{id,name,title,level,max,uses,skills:[{id,name,level,uses,next}]}], xp:{total,today}, rank:{id,name}|null, badges:{earned,total}, days:{show:boolean,total:number}, next:{kind:'explorer'|'lesson'|'focus'|'quest',id,label,href}|null}`; `extra` = plain `{explorer, explorerDone, quests, nextLesson, focus, counters, discreet, calm, now}`. Pure, deterministic. No current-run field exists.
- `diff(before, after) -> {items:[{kind:'region'|'xp'|'badge'|'rank'|'explorer'|'quest'|'day', id, text, from?, to?}]}`; rises only; equal -> `{items:[]}`. (V-01a)
- `page(ctx) -> Node`; `watchCard(ctx) -> Node` (V-01b; ui-track.js at `#/track/radar` calls it behind a typeof guard); `nextStep(...)`, `TEXT`, `PURE`.
- Session memory only: `lastDrawn` model; no Store/Engine write, no event.

Route at Track (V-01b): `#/track/radar` -> `TrackUI.routeOf` returns `{view:'radar'}`; existing `TrackUI.PURE` names unchanged.

DOM hooks (`data-test`): V-01a `status-page`, `status-scene`, `status-place` (`data-region`, `data-level`; six buttons, also the Calm/discreet list), `status-stand`, `status-days` (only with counters on and discreet off), `status-next`, `status-next-go`, `status-sos`, `status-back`. V-01b `status-change`, `status-change-item` (`data-kind`), `status-strip`, `status-strip-day` (`data-date` YYYY-MM-DD, `data-active` true|false), `status-watch`, `status-watch-item` (`data-sign` = Engine signId), and on Today `today-status` (chip, in the header quick row `td-quick`) and `today-harbor-go`. Existing and unchanged: `today-harbor`, `harbor-scene`, `today-log-craving`, `today-sos`.
`data-tour`: `status-scene`, `status-change`, `status-watch` (page), `status-open` (the Today chip). Tour step wiring and the "New" dot are game-tutorials (V-28); `GuidanceUI.dot('status', ctx)` shows on the chip only when `Content.features.status` exists (content V-10).
Classes: `hb-grew` on a `.hb-place` node (transform scale 300 ms, once; never under `HarborUI.still(ctx)`); `hb-moving`/`hb-still` unchanged.
Words (fixed for tests): h1 "Your Harbor"; first open "Here is where you stand."; none "Nothing new since you last looked."; "Nothing to watch right now."; Today chip text "Your harbor".

Behaviour rules the others rely on: SkillUsed raises its region's level at thresholds `[1,3,7,15,30]`; SlipLogged and slip logs change no level, XP, badge or total days, so a page drawn before and after a slip has equal `data-level`s and an empty diff; Calm: no scene/XP/badges; discreet: no scene/days; reduced motion or `/sos` route: no pulse.

## Relied on (exist at the base)
- `HarborUI.scene(ctx)` ui-harbor.js:84, `hidden` :54, `still` :64, `lightLevels` :33; `data-place` and `data-level` on each `.hb-place` :77-79 (no edit needed); region ids lighthouse, cove, garden, pier, compass, weather (content-core.js:56-62).
- `GameUI.model(gs)` ui-game.js:88, `xpBar(ctx)` :181, `rankCard(ctx)` :232, `ctx.model` accepted (:177); export :330.
- `Engine.gameState` engine.js:474, `mastery` :255, `momentum` :288, `explorer` :616, `explorerDone` :638, `quests` :660, `nextLesson` :581, `roadmap` :546, `warningSigns` :989 (`[{signId,label,evidence,plan,own}]`), `revealed` :585.
- `UI.pages`, `UI.sheet(title, body, opts)` ui-core.js:169, `UI.h`, `UI.svg`, `UI.ctx` :587, `pageKey` :561; `Content.masteryThresholds` content-core.js:124.
- Waiting on others: `Content.features.status` and its tutorial/help (content V-10); tour step and dot wiring (game-tutorials V-28); `helpers/hooks.mjs` entries and browser tests (tests-docs V-03, V-01t, after V-01b merges). None blocks this lane.
