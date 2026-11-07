# Contract: lane actions (what it exposes and relies on), BASE 1ef2482e

## Exposes
- Routes (hash): `#/actions` (hub), `#/actions/planner?date=YYYY-MM-DD`, `#/actions/battle` (list), `#/actions/battle?new=1` (form), `#/actions/battle?plan=<planId>` (attach/edit), `#/actions/review`, `#/actions/quests`, `#/actions/predictions`, `#/actions/todos`, `#/practice/<id>` with id in breathe, body-scan, sober, urge-surf, shower, eating, walking. Registered as `UI.pages.actions` and `UI.pages.practice`. Consumers: today-track (links), game-tutorials (drills, coach marks), content (lesson tryIt routes), tests-docs (browser flows).
- Data-tour targets (exact): planner-day, planner-gaps, planner-add, bp-new, bp-form, review-start. Consumer: game-tutorials' tours, guards gate.
- DOM hooks the browser suite may use (to be added to hooks.mjs by tests-docs on request): data-testid values `planner-add-btn`, `planner-block`, `bp-save`, `bp-ics`, `bp-debrief-yes`, `bp-debrief-no`, `review-next`, `review-save`, `practice-start`, `practice-pause`, `practice-finish`, `todo-add`. (Proposed names; the builder confirms them in its report.)
- Pure helpers exported for Node tests under a module.exports guard: from ui-actions.js `planRowsForDate(view,date)`, `battlePlanIcsItem(plan)`, `reviewIcsItem(profile, now)`; from ui-practices.js `practiceScript(Content,id)` -> {id,title,minutes,steps[]}|null. No events or content keys are added.
- Events written (existing types only): via A.plans.* (BattlePlanCreated, BattlePlanDebriefed), A.weeklyReview (WeeklyReviewCompleted{weekStart}), A.recordEvent('ExerciseDone',{exerciseId,kind:'practice',helpful,minutes,reflection?}), A.recordEvent('MindfulMinute',{minutes}).
- Response written: exerciseId 'weekly-review' payload {weekStart, highlights, focusSkill, wantTos[], motivation}. Consumer: engine radar/insights (read only), today-track (reviewDue tip).

## Relies on, present at BASE (path:line at 1ef2482e)
- Actions (offline/src/actions.js): plans.add/update/remove/debrief (~552-615; error code bad-plan), weeklyReview :631, todos.add/done/remove (~640-690), predictions.add/complete (code bad-prediction), quests.tick (code bad-quest), motivation.add (bad-motivation), recordEvent :252. Return shapes: plans -> {plan, events}; weeklyReview -> {response, events}; todos.add/done -> the row; predictions -> the row; quests.tick -> the row; remove -> {removed:id}.
- Engine (offline/src/engine.js): gaps :1043, riskyHours :1056, suggestions :1078, forecastCheck :1098, weekSummary :1118, quests :660, ics :1339, todayStr/addDays/weekStart (3.2), crisisKeywords (3.2, if present).
- UI core (offline/src/ui-core.js): pages registry :794, ctx :554, form :391, sheet :169, confirm, chips :250, card :442, empty :475, download :892, speak :855, stopSpeaking, toast.
- Content (content-core.js): quests :207, stages :28, skills :66, xp :113. Reads view rows plans, todos, predictions, quests, contacts, responses, motivation.

## Waits for another lane
- `Content.practices` (content U-32, content-practices.js): NOT at BASE; Content has no `practices` key, only the feature entry `features.practices` (content-core.js:170) and reveal m7 (:186). Shape the player expects (either): array `[{id, title, minutes, steps:[string]}]` or object `{ [id]: {title, minutes, steps|lines|script:[string]} }`; for breathe also optional `ladder:[5,10,15,20,30]` (minutes). sober needs `steps` of five lines (Stop, Observe, Breathe, Expand, Respond), the same key ui-sos.js reads. Practice ids as in 3.5. Items carry `clinicalReview: true` where they touch body or crisis. Consumer: this lane and ui-sos.js.
- `Content.exercises` ids breathing, body-scan, everyday-mindful, sober-practice (content U-31b): optional; without them the reflection lives in the ExerciseDone payload.
- ui-sos.js (actions-sos U-10): not merged; no dependency (this lane reads the script itself).
- hooks.mjs entries: tests-docs, by outbox.
