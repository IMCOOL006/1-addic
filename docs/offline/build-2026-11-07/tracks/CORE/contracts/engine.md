# Contract: lane engine (CORE), what `Engine` exposes (2026-11-07)

Status: all names WAIT for the engine lane's merge (none exist at base 655516dc; offline/src holds only content-core.js and content-lessons-a.js). Slice U-05 lands first. Source of truth: BUILD-PLAN 3.2, 3.7, 3.9, 3.10, 3.11.

Global rules: pure; `now` (ISO string, Date or ms) is a parameter; `view` = Store.view `{get(store,id), list(store), count(store)}`; plain arrays where noted; never throws on empty data; browser global `Engine`, Node `require('offline/src/engine.js')` returns Engine (loads content-core.js and other content-*.js itself when `Content` is undefined). Test helper `Engine.makeView({store:[rows]})`. Consumers: U-09 actions-sos; today-track, workbook-settings, actions, game-tutorials (UI); "none yet" otherwise.

## Event types and payload fields (actions-sos writes; engine reads). Event `{id, type, at(ISO), payload}`
LogCreated{logId,type} · CheckinCompleted{logId,kind} · SkillUsed{skillId, helpful(bool|0/1|1-5), logId?} · SosCompleted{kind, outcome:'passed'|'used'|'other', ratingBefore, ratingAfter} · LessonCompleted{lessonId} · ModuleCompleted{moduleId} · CheckpointCompleted{moduleId} · ArtifactSaved{exerciseId, kind} · ExerciseDone{exerciseId, kind, skill?} · BattlePlanCreated{planId} · BattlePlanDebriefed{planId, usedPlan} · ActivityDone{kind, minutes} · MindfulMinute{minutes?} (each event = 1 minute) · WeeklyReviewCompleted{weekStart} · SlipLogged{date} · SlipReviewed{} · ContactReached{contactId, how} · ScriptUsed{responseId} · TutorialCompleted{id} · ExplorerCompleted{} · FeatureRevealed{featureId} · MilestoneSeen{milestone} · RecoveryPlanConfirmed{} · OnboardingCompleted{}. Zero-XP: SlipLogged, ContactReached, ScriptUsed, FeatureRevealed, MilestoneSeen, ModuleCompleted, RecoveryPlanConfirmed, OnboardingCompleted. A drill writes none of these. Consumer: U-09 (writer), all UI lanes (reader).

## ids and dates (U-05)
`id() -> string` · `todayStr(now) -> 'YYYY-MM-DD'` · `dateStr(d) -> string` · `addDays(dateStr,n) -> string` · `daysBetween(a,b) -> int` (b minus a) · `weekStart(dateStr, weekStartsOn=1) -> string` · `fmtDate(x)`, `fmtTime(x)`, `fmtDateTime(x) -> string` · `hourOf(iso) -> 0..23` · `isNight(now) -> bool`. Consumers: all.

## profile (U-05)
`term(profile) -> {word, days, adjective}` · `greeting(now, name) -> string` · `companionName(profile) -> string`. Consumers: today-track, actions-sos.

## game (U-05)
`xpFromEvents(events, now) -> {total, today, byType:{type:number}}` · `mastery(events) -> {skillId:{uses, level 0-5, helpfulAvg|null, lastAt|null}}` · `regionLevels(mastery) -> {lighthouse,cove,garden,pier,compass,weather: 0-5}` · `momentum(events, now) -> {days, of:14, dates[]}` · `rank(events, view) -> rankObj|null` (a `Content.ranks` row) · `badges(view, now) -> [{id, earnedAt}]` · `modulesDone(events) -> Set<string>` · `lessonsDone(events) -> Set<string>` · `counters(profile, slips, now) -> {tracking, total, current, nextMilestone|null, reached[]}` · `gameState(view, now) -> {xp, mastery, regions, momentum, rank, badges, modulesDone, lessonsDone, counters}`. Numbers come from Content.xp, masteryThresholds, milestones. Consumers: today-track (counters, momentum), game-tutorials (U-26), actions-sos (SOS "what helped").

## roadmap, reveal, explorer, tips, quests (U-06)
`roadmap(profile, modulesDone, now) -> {order[], weeks:[{start, moduleIds[], done}], current, next, focus:{moduleId, lessonsLeft, minutes, practiceGoal}, behindWeeks, free}` · `nextLesson(view) -> lesson|null` · `revealed(view) -> Set<featureId>` · `isRevealed(view, featureId) -> bool` · `newDots(view) -> Set` · `explorer(view) -> [{id,label,done}]` · `explorerDone(view) -> bool` · `pickTip(view, now, ctx?{route}) -> tip|null` · `quests(view) -> {questId:{steps:[{id,label,done}], done, total, complete}}`. Consumers: learn (U-13, U-14), today-track, game-tutorials, actions.

## artifacts and plan (U-06)
`latest(view, exerciseId) -> response|null` · `history(view, exerciseId) -> response[]` (newest first) · `reasonsCard(view) -> {quick[], drawbacks[], benefits[], different[]}` · `comebacks(view) -> [{thought, response, at}]` · `distractionDeck(view) -> string[]` · `spiralThoughts(view) -> string[]` · `triggerChips(view) -> [{id,label,kind,frequent,anger}]` · `prefillRecoveryPlan(view, now) -> {motivation,wellness,situation,people,mood,triggers,warnings,battlePlans,support: {items[], confirmed:false}}`. Consumers: actions-sos (reasons, comebacks, distraction, spiral in SOS flows), workbook-settings, today-track.

## insights, radar, planner, review, sos (U-07)
`insights(view, now) -> {ready, count, cravingTrend[], topTriggers[], heatmap[7][24], moodVsActivities, skillRanking[], predictions, motivationHistory[], caveat}` · `warningSigns(view, now) -> [{signId, label, evidence, plan}]` (signId in noMeeting, fewPleasant, poorSleep, noContact, weekendUnplanned, feelingsRising) · `gaps(planItems, dateStr) -> [{start,end,hours}]` · `riskyHours(heatmap) -> number[]` · `suggestions(view, dateStr) -> [{hour, activity}]` · `forecastCheck(view, weekStart) -> [{date, planned[], logged[]}]` · `weekSummary(view, weekStart) -> object` · `guideSequence(view) -> toolId[]` · `crisisKeywords(text) -> bool`. Consumers: today-track (Insights U-17, radar), actions (planner U-22, review U-24), actions-sos (guideSequence and crisisKeywords in feeling flow; true routes to `#/sos/urgent`).

## data and content (U-08)
`exportBackup(view, meta) -> {app:'1-addic', schemaVersion, exportedAt, stores}` (no lock row) · `validateBackup(obj) -> {ok, errors[]}` · `migrateBackup(obj) -> obj` · `ics(items) -> string` (items `{id,title,date,start,end,notes,rrule?}`) · `validateContent(content?) -> string[]` (called by tools/gates.py as `E.validateContent()` on the module export) · `AppError(message, code)` · `makeView(rows) -> view`. Consumers: actions-sos (importBackup, export), workbook-settings (data tab), actions (.ics), gates validate.

## Not provided
No routes, UI.pages entries, data-tour targets or DOM hooks. Content keys it relies on, all at base: xp, masteryThresholds, milestones, ranks, badges, skills, regions, features, reveal, explorer, quests, tips, terms, paces, modules, references, cast, catalogs, schemaVersion. `Content.exercises` is absent at the base (content lane).

## Fixed by the engine slice (U-05, 04fc0c1), written in by the CORE chat 2026-11-07 07:39 IST

- **Day counters.** `total` counts completed local dates only (startDate up to yesterday; today is counted when it ends), and a counted date stays counted. A date is left out only when a SlipLogged (or a slip log row) with that date was logged (its `at`) on or before that date; a slip logged later for an earlier date never removes a banked day, so `total` never falls. `current` (the opt-in run) is the only number a slip restarts. Reached milestones come from `total` and every MilestoneSeen and never un-reach. No XP for days. `counters()` returns `tracking` = a startDate is set; the UI reads `settings.counters` and `showCurrentRun` to decide what to show.
- **Writers (actions-sos U-09):** `SkillUsed{skillId, helpful: boolean, logId?}` (Actions writes true or false; the engine's reader accepts true/false and 0/1 only); `SlipLogged{date:'YYYY-MM-DD'}` with `at` = the time of logging; slip log rows carry `type:'slip'`, `date` and `at`. Events without a valid `at` or `type` are ignored.
- `xpFromEvents().byType` lists XP-bearing types only (a zero-XP event never changes its shape). Every `events` parameter also accepts a view. `Engine.makeView` and `Engine.STORES` are exported from U-05.
- `validateContent()` (U-08) skips the tryIt-exercise check while `Content.exercises` is absent and runs it as soon as it exists.
- Defaults built: `net-weaver` counts safetyNet contacts ever added, active or not (a badge never disappears); `ExerciseDone` earns 10 every time (3.7 sets no daily cap).

## For U-07, written in by the CORE chat 2026-11-07 09:33 IST: the shapes actions-sos' ui-sos.js reads (built at 1507640)

- Return these exact shapes (ui-sos tolerates the alternatives in contracts/actions-sos.md, but these are the contract): `crisisKeywords(text) -> boolean`; `guideSequence(view) -> ['wave'|'why'|'call'|'distract'|'talkback', ...]` (flat on Engine); `reasonsCard(view) -> string[]`, `distractionDeck(view) -> string[]`, `comebacks(view) -> string[]`, `spiralThoughts(view) -> [{thought, reply}]`. Crisis words are short and marked clinicalReview; an empty or unknown text is false.
