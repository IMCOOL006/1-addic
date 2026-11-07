# today-track V-43 contract annex (read at 37d1a53c)
Hook attribute: data-test for every hook, data-tour for tour targets. V-01a/V-01b contracts: today-track-v3.md.

## Exposed by this lane
- DOM hooks, Today: objectives-card, objective[data-id][data-done], objective-done, objective-swap, run-line, run-current, run-best, run-total, run-kept, run-back, questline-card, questline-step[data-state], questline-claim. Your Harbor (#/status): status-growth, status-growth-item, status-way, questline-step, run-current, run-best, run-total, run-kept, run-back. Consumer: tests-docs V-45 (hooks.mjs).
- data-tour: questline-card, objectives-card, run-line (Today). Consumers: content V-42 tutorials, game-tutorials V-44 tour.
- HarborUI.growthSpots(n) -> [{x, y, kind}] (pure, in PURE; new); HarborUI.scene draws g.hb-growth. StatusUI.model(gs, extra) takes extra.growth, extra.run, extra.way; StatusUI.diff reports growth, best and total rises only. Consumer: none yet.
- No new routes (#/today, #/status exist), no events, no storage.

## Read, exists at 37d1a53c
HarborUI.scene ui-harbor.js:84; StatusUI.model :122, diff :156, page :237; TodayUI.page ui-today.js:~490, UI.pages.today :530; UI.sheet, UI.svg (ui-core); Engine.gameState; Store.subscribe re-render through ui-core.

## Read, waits
- Engine.dailyObjectives(view, now) -> {date, items: [{id, title, line, doneBy, grows, done, swappable, swapTo}], growth, swapped}; Engine.growth(view) -> number; Engine.run(view, now) -> {current, best, total, kept: [date], holding, cameBack, lastDay}; Engine.questLine(view, now) -> {steps: [{id, title, line, condition, reward, opened, state: done|current|locked, met, progress: {have, need}, claimable, doneAt?}], current: step|null, done, total}; Engine.unlocked(view) -> Set. Waits for CORE engine V-40.
- Actions.objective.done(id), Actions.objective.swap(id) -> {ok, event?}; Actions.questLine.claim(stepId) -> {ok, events?}, the reward is the FeatureUnlocked event's payload.feature; refusal {ok: false, code, message}, never throws. Waits for actions-sos V-41.
- Content.questLine, Content.objectives (grows: lantern, tree, boat, bench, flag, gull, garden, bell), Content.runWords {header, current, best, total, kept, keptLine, cameBack, cameBackLine, graceLine}, Content.features[id] {name, gist, route}. Waits for content V-42.
- GuidanceUI.rewardSheet(featureId, ctx) -> node or null (null on SOS routes or with the coach open). Waits for game-tutorials V-44; called behind typeof.
Until each lands, the screen draws nothing for that part and no dead button; with all absent, Today and Status equal V-01a/b.

- Asked of CORE (R-S-22, engine V-40, additive): Engine.growthItems(view) -> [{date, id, grows}], with length equal to Engine.growth(view), never shrinking. V-43 reads it behind typeof. Until then each element's kind comes from the 8-kind cycle by index (growthSpots).
