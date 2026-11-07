# Contract: lane today-track (scouted at BASE 1ef2482e)

## Exposes (new, in this lane)
| Name | Signature | Where | Consumer |
|---|---|---|---|
| `UI.pages.today` | `(ctx) => Node` route `#/today` (also unknown routes) | ui-today.js | ui-core router |
| `TodayUI` (global const) | `page(ctx)`; pure: `greetingFor`, `checkinKind(view, now, profile) -> 'morning'|'evening'|null`, `planToday(view, now) -> [{...planRow, risky, battlePlan}]`, `backupDue(view, settings, now) -> bool`, `milestoneDue(counters, settings) -> int|null` (exported via module.exports for Node tests) | ui-today.js | none yet |
| `UI.pages.track` | `(ctx) => Node` routes `#/track`, `#/track/log/<craving|feeling|checkin|activity|slip>` (query `kind=morning|evening` for checkin), `#/track/insights` | ui-track.js | ui-core router |
| `TrackUI` | `page(ctx)`; pure: `timeline(view, limit) -> [{date, rows[]}]`, `formToLog(type, values) -> args for Actions`, `insightsView(view, now)` | ui-track.js | none yet |
| `HarborUI.scene(ctx)` | `-> Node|null` (null in Calm/discreet); `lightLevels(view, now) -> {regionId: 0-5}` | ui-harbor.js (U-18) | Today (guarded by typeof); game-tutorials may embed |
No new events, no new Content keys, no new Actions verbs.

## data-tour targets (guards baselines)
`quicklog-button`, `quicklog-intensity`, `quicklog-save` (Track log), `insights-triggers`, `insights-heatmap` (Insights). Consumer: game-tutorials coach marks, the guards gate.

## DOM hooks (data-test; tests-docs asked by outbox to add to helpers/hooks.mjs)
`today-checkin`, `today-plan`, `today-want`, `today-quests`, `today-reasons`, `today-counters`, `today-tip`, `today-backup`, `today-milestone`, `today-harbor`, `track-timeline`, `timeline-row`, `log-<type>`, `log-error`, `insights-card`, `insights-empty`.

## Relies on (exist at 1ef2482e)
- UI (ui-core.js:984-986): h, svg, icon, toast, sheet, confirm, form, card(:445), tile(:450), chips(:250), ring(:457), meter(:468), empty(:475), go, route(:503), render, pages(:44), ctx(:554 -> {view,E,A,profile,settings,term,now,features,calm,route}), night, boot. Placeholder Today: ui-core.js:697.
- Engine (engine.js:1497-1502): term:136, greeting(now,name):142, companionName, counters(profile,slips,now):435, momentum:288, gameState:474 (xp,mastery,regions,momentum,rank,badges,modulesDone,lessonsDone,counters), roadmap:546, nextLesson:581, isRevealed:601, explorer:616, quests:660, reasonsCard:698 (string[]), triggerChips:732, pickTip:811, insights:928, warningSigns:989, riskyHours:1056, suggestions, gaps, todayStr:76, hourOf:122, isNight:127.
- Actions (actions.js:908 export list): logCraving/logFeeling (keys intensity, triggerIds, thought, redFlag, feelings, skills, notes, emotion; :269-290), checkin(kind,data) :313, logActivity :334, logSlip :352, markTipShown(id) :777, recordEvent(type,payload) :252 (MilestoneSeen {milestone:int}), settings.patch (settings keys :165-173, milestonesSeen union :245). All failures throw AppError(message, code) with codes bad-log, bad-checkin, bad-activity, bad-slip, bad-tip, LOCKED.
- LearnUI.focusCard(ctx) -> Node (ui-learn.js:729, data-test focus-card), LearnUI.focusData(view, now).
- Content: tips (content-core.js:268), quests :207, explorer :192, milestones :125, emotions :36, regions :56, skills :66, discreetName :12.
- Rows: 3.4 logs/plans/settings; settings row defaults actions.js:165.

## Waits for another lane
- ui-sos.js `#/sos`, `#/sos/slip?logged=1` (actions-sos U-10, unmerged): link by route only.
- ui-actions.js (`#/actions/planner|quests`), ui-settings.js (`#/settings/data|rhythm`), ui-workbook.js (`#/workbook/reasons`): links to routes that ui-core renders as an honest 'coming soon' until merged.
- content-sample.js (U-33): the sample profile for the "sample profile" render test; until then the test builds a synthetic profile in the test.
- ui-harbor.js U-18 (this lane, later): Today's static placeholder until then.
- tests-docs: browser tests and hooks for the above by outbox.
