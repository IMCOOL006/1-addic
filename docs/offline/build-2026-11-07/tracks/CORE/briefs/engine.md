# Brief: lane engine (CORE chat), 2026-11-07, base 655516dc

## What the lane is for
The pure rules engine: `Engine`, a classic-script IIFE with a Node `module.exports` guard, plus Node tests. Every function takes data in and returns data out; `now` is always a parameter (no clock inside a rule). No DOM, storage or network. Nothing ever decreases. Slice U-05 is third in the chain (U-01, U-03, U-05, U-09): actions-sos' U-09 builds on its contract. Starts at hour 0, depends on nothing.

## Files
Owned (all new; `offline/tests/` does not exist at the base, create it): `offline/src/engine.js`, `offline/tests/logic.test.mjs`, `offline/tests/engine-*.test.mjs` (suggest engine-roadmap, engine-insights, engine-data).
Do not touch: package.json (core U-01 writes scripts.test; an engine edit is a territory ERROR), build.mjs (core adds the engine.js parts line), any content-*.js (content errors go to for_the_chat), browser tests, docs/offline.
Base content: `offline/src/content-core.js` (`const Content` at :8, `module.exports = Content` at :517) and `content-lessons-a.js` (`const C_a = typeof Content !== 'undefined' ? Content : require('./content-core.js')` at :3, pushes onto `C_a.modules`, export at :252). Base: 4 modules, 16 lessons, 37 skills, 32 references, 9 tutorials, 30 top-level keys. Content.xp :113, ranks :127, badges :136, reveal :179, explorer :192, quests :207, tips :268. There is no `Content.exercises` at the base.

## Engine file shape (decided)
```
const Engine = (() => { 'use strict';
  const C = (typeof Content !== 'undefined') ? Content : loadContentNode();
  /* ... */ return { /* public names */ }; })();
if (typeof module !== 'undefined' && module.exports) module.exports = Engine;
```
`loadContentNode()` (Node only): require `./content-core.js`, then every `content-*.js` in the folder except core, sorted. The browser build concatenates parts with Content first, so `Content` is a shared top-level const. No function throws on empty or missing rows: return empty shapes.

## Decided once: the view shape
Functions that read data take `view`, the Store.view shape `{get(store,id), list(store), count(store)}` (3.2). Pure helpers needing one slice take plain arrays (`events`, `logs`, `planItems`). Rows are the 3.4 shapes. Order from `list()` is never assumed: sort by `at`/`date`, ties by id. Profile and settings: `view.get('profile','me')`, `view.get('settings','app')`, `view.get('recoveryPlan','plan')`. `now` may be an ISO string, Date or ms (`toDate`). Local day = device-local calendar date. Tests set `process.env.TZ='Asia/Kolkata'` first in the file. Tests build views with the exported helper `Engine.makeView({events:[],logs:[],...})` (missing stores give `[]`).

## Units in order. Slice = U-05 (merged first); then U-06, U-07, U-08 as one batch.

### U-05 (tier 1, SLICE) Time, ids, game derivations (3 h)
Today: nothing (new file). Build: 3.2 ids/dates, profile, game rows, and 3.7 in full.
- ids/dates: `id()` (time-sortable plus random; the only place randomness is allowed), `todayStr`, `dateStr`, `addDays`, `daysBetween` (calendar days, DST-safe, UTC parse of YYYY-MM-DD), `weekStart(dateStr, weekStartsOn=1)`, `fmtDate/fmtTime/fmtDateTime` (en-IN, "7:40 pm"), `hourOf(iso)`, `isNight(now)` (20:00 to 05:59).
- profile: `term(profile)` to `{word, days, adjective}` from `Content.terms` (:15) and `profile.term`; `greeting(now, name)`; `companionName(profile)`.
- `xpFromEvents(events, now)` returns `{total, today, byType}` using only `Content.xp`. Rules: diminishing returns on LogCreated, CheckinCompleted, SkillUsed, ActivityDone per type per local day (1-3 full, 4-6 half rounded down, then 0, from `repeatFull`/`repeatHalf`); MindfulMinute capped at `mindfulDailyCap` per day; once-only per `payload` id: LessonCompleted by lessonId, TutorialCompleted by id, CheckpointCompleted by moduleId, ExplorerCompleted once; ArtifactSaved once per exerciseId per local day and only for kind build/assess/plan (payload.kind; unknown counts as build); zero-XP types give 0; unknown types 0; duplicate event ids never count twice.
- `mastery(events)`: SkillUsed per `payload.skillId` to `{uses, level, helpfulAvg, lastAt}`; level 0..5 from `masteryThresholds`. `regionLevels(mastery)`: total uses over the region's skills against the same thresholds, all six regions.
- `momentum(events, now)`: distinct local dates in the last 14 days (today included) with any XP-bearing event. `modulesDone`, `lessonsDone` (Sets). `rank(events, view)`: highest `Content.ranks` whose `when` holds (`explorer`: ExplorerCompleted or all 12 Explorer items; `mN`: every lesson of module N done). `badges(view, now)`: the 3.7 predicates for the 13 `Content.badges`, to `[{id, earnedAt}]`, each once, earnedAt = `at` of the first satisfying row; `comeback` once, not farmable.
- `counters(profile, slips, now)`: `{tracking, total, current, nextMilestone, reached[]}`; total = days from startDate to today minus distinct slip dates (min 0); current = days since last slip or start; `slips` accepts SlipLogged events or slip logs (`payload.date`/`date`/`at`). `reached` = milestones <= total plus every `MilestoneSeen` payload.milestone (a celebrated milestone is never un-reached).
- `gameState(view, now)` returns `{xp, mastery, regions, momentum, rank, badges, modulesDone, lessonsDone, counters}`.
Acceptance (done when): `logic.test.mjs` has a test for every rule, for determinism (shuffled and repeated events give deep-equal state) and for "a slip lowers nothing" (appending SlipLogged leaves xp, mastery, regions, badges, momentum, modulesDone, reached equal or higher), all green.
Tests (node:test): ids sortable and unique; daysBetween across month end and DST; weekStart Mon and Sun; isNight 19:59/20:00/05:59/06:00; term/greeting/companion; xp per event type; diminishing 3/6; once-only; mindful cap; artifact once per day and kinds; mastery thresholds; regionLevels; momentum window; rank per module; each of the 13 badges; counters total/current/milestones; determinism; a slip lowers nothing; gameState shape. Feeds browser tests: Today counters opt-in, Explorer ring, Harbor light.
Bites: no points for claimed sober days (no event type grants XP for days); no random rewards (no Math.random outside `id()`); nothing decreases.

### U-06 (tier 1) Roadmap, reveal, Explorer, tips, quests, artifacts, Recovery Plan prefill (2.5 h)
Build: 3.2 rows roadmap, reveal, explorer, tips, quests, artifacts, plan; rules of 3.10 and 3.11.
- `roadmap(profile, modulesDone, now)` per 3.2 shape: modules in `Content.modules` order, `Content.paces` (:47) by `profile.pace`, `customPerWeek`, anchored at `roadmapStart`; free pace returns `free:true`, empty weeks; `behindWeeks` >= 0 (never negative; the UI never says "overdue"). `nextLesson(view)`: first undone lesson or null.
- `revealed(view)`: `Content.reveal.always` + `reveal[mN]` per done module + `reveals` rows + everything when `settings.showAll`. `isRevealed`; `newDots(view)` = revealed with no `seenAt`.
- `explorer(view)` the 12 items of `Content.explorer` with `done` derived (tour/drill from `tutorials` rows; reasons from a `quick-reasons` response; safetyNet from an active safetyNet contact; log, checkin, lesson from logs/events; workbook from a `reveals` row `workbook` with seenAt; plan, wantTo from `plans`; breathe from ExerciseDone for `breathing`; pace from `profile.pace`). `explorerDone(view)`.
- `pickTip(view, now, ctx?)`: null when `ctx.route` starts with `#/sos`, when `settings.tips===false`, when `settings.lastTipDay` is today, and skips ids shown in the last 14 days (`tips` rows). Rules by `Content.tips[].when`: redFlagLogNoTrial, eveningCravings, thinReasons, oneSafetyNet, noPractice, noBackup, lowMomentum, noWantTo, reviewDue; thresholds in code comments; first match in content order; deterministic.
- `quests(view)` per `Content.quests` (:207): `{questId:{steps:[{id,label,done}], done, total, complete}}`, step done from `quests` row `ticks`, or derived (seven-days from evening check-ins, prediction-lab from completed predictions, crew nets from active safetyNet contacts).
- Artifacts: `latest` (latest non-draft), `history`, `reasonsCard`, `comebacks` (from `trial`), `distractionDeck`, `spiralThoughts`, `triggerChips`. `prefillRecoveryPlan(view, now)`: nine sections `motivation, wellness, situation, people, mood, triggers, warnings, battlePlans, support`, each `{items:[], confirmed:false}`; wellness/situation top 6, mood top 3 by the skill ranking (one shared internal `rankSkills(view)` also used by U-07).
Acceptance: every rule has a Node test, green. Tests (`engine-roadmap.test.mjs` and logic.test.mjs): pace weeks, free, behindWeeks, nextLesson, revealed per module, showAll, newDots, explorer 12 items, tip one per day / 14-day / SOS route / disabled / each rule, quest steps, artifacts, reasonsCard, prefill sections. Feeds browser tests: reveal and Show now, tip once a day none in SOS, Explorer ring.
Bites: tips never on SOS; no "overdue" wording.

### U-07 (tier 1) Insights, radar, planner, review, SOS guide, crisis keywords (2.5 h)
Build: 3.9 plus 3.2 rows insights, radar, planner, review, sos.
- `insights(view, now)` exactly the 3.9 definitions: ready at 7 logs (craving + feeling + checkin); `caveat` under 14; trend weekly mean for 8 weeks; top 5 triggers; 7x24 heatmap of counts with mean intensity; mood vs activities from evening check-ins in plain sentences; skill ranking mean helpful x ln(uses+1) top 8; predictions; motivation history.
- `warningSigns(view, now)`: six detectors with 3.9 thresholds, signIds `noMeeting, fewPleasant, poorSleep, noContact, weekendUnplanned, feelingsRising`; `plan` = the user's own `warning-signs` top-3 plan if the sign is in it, else the general suggestion; gentle wording.
- `gaps(planItems, dateStr)` (07:00-23:00, >= 2 h), `riskyHours(heatmap)`, `suggestions(view, dateStr)`; `forecastCheck(view, weekStart)`, `weekSummary` (no score, no XP, ADR 0021).
- `guideSequence(view)`: default tool order personalised by helpfulAvg, SOBER always present, never empty. `crisisKeywords(text)`: case-insensitive phrase list in code (kill myself, want to die, end it all, suicide, no reason to live, hurt myself, better off dead, self-harm and spellings); non-strings give false; errs toward true.
Acceptance: tests over synthetic logs cover every insight and every rule; crisis keywords route to urgent help (the UI shows the numbers; the engine returns the boolean) and "I killed that workout" does not trigger.
Tests (`engine-insights.test.mjs`): ready at 7; caveat under 14; each insight; six radar detectors (fires and does not); gaps; suggestions; forecastCheck; guideSequence; crisisKeywords.
Bites: evidence strings are person-first, adult-to-adult, never "addict" as a noun, no how-to, no sensations or doses; radar never red.

### U-08 (tier 1) Export/import/migrate/validate, .ics, validateContent, npm test (1.5 h)
- `exportBackup(view, meta)`: `{app:'1-addic', schemaVersion: Content.schemaVersion, exportedAt, stores:{all 16}}`; the `meta` lock row is never exported. `validateBackup(obj)` to `{ok, errors[]}` (app name, schemaVersion number <= current, each store an array, rows carry their keyPath, events have type/at). `migrateBackup(obj)` clones and fills missing stores with []. Bad imports (not an object, wrong app, newer schema, non-array store) return errors, never throw. The sample marker (`meta` row `sample`) survives.
- `ics(items)`: RFC 5545 (CRLF, folding at 75 octets, escaped text, floating local DTSTART, UID from id); Weekly Review uses `RRULE:FREQ=WEEKLY;BYDAY=<reviewDay>`. `AppError(message, code)`.
- `validateContent(content?)` returns `[]` on the base content: every lesson cites >= 1 existing `Content.references` id; every `tryIt.exercise` exists when `Content.exercises` exists (skip while absent, so the base passes); every `tryIt.route` and card link route is in the 3.5 route table (embed it); every skill has an existing region; every `moment.cast` exists; no "addict" as a noun in app voice (word boundary; "1-addic", "addicted brain", "addiction" allowed). Callable exactly as gates.py does (VALIDATE_JS, tools/gates.py:344): `require('offline/src/engine.js')` after loading all content files; the result has `.validateContent()` (or `.Engine.validateContent`), returns an Array, never throws.
- npm test: no package.json edit. Prove `node --test offline/tests/logic.test.mjs offline/tests/engine-*.test.mjs` is green; for_the_chat says core's `scripts.test` must glob `offline/tests/*.test.mjs` except `browser.test.mjs`.
Acceptance: export then import round-trips identically; a bad import is refused; validateContent has zero errors on base content (otherwise list each error in for_the_chat); npm test runs the suite.
Tests (`engine-data.test.mjs`): round trip, each bad import, migrate, lock row excluded, ics format and RRULE, validateContent clean on base, validateContent catches a planted error in a cloned content.

## Decisions that bite
O1 file offline/1-addic.html, title "1-addic", discreet "Notebook". O2 PIN never forced. O3 India numbers verify: true. O4 speechSynthesis only. O5 locale en, no Gujarati. O6 sample data marked (meta row sample), erasable. O7 no dead buttons. O8 guide is tests-docs.

## Open questions with the default taken
1. 3.7 says total falls by slip dates yet nothing decreases: default the literal formula for `total`; `reached` and milestones never un-reach (above).
2. `Content.exercises` absent at the base: tolerate; unknown kind counts as build.
3. SkillUsed `helpful`: accept boolean, 0/1 or 1-5; normalise to 0..1.
4. Event payload field names are fixed in the contract; actions-sos writes exactly those.

## Gates and baselines
`python C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tools/gates.py --wt C:/Users/ruchi/1-addic-wt/engine --lane engine build test validate guards` (browser, docs do not apply). Baselines (coordination/baselines.md): at the base validate and test are SKIP (no engine.js), content loads as 4 modules, 16 lessons, 37 skills; after U-08 validate must be GREEN, errors=0. Territory: `python C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tools/check_territory.py engine 655516dc..HEAD --wt C:/Users/ruchi/1-addic-wt/engine`. Node 22.

## Go-aheads
None. Requests (a package.json test script, a content error) go in for_the_chat.

## Safety and content rules touching this lane
SOS is never gated or interrupted by a tip. No streak resets, random rewards or points for claimed sober days; XP, mastery, badges, region light and total days come from the append-only events, and a slip restarts only the opt-in current run. No network, no trackers; contacts never leave the device except in a user-triggered export. Engine strings are gentle, person-first, grade 6-8, never "addict" as a noun, with no substance how-to, sensations or doses; crisis detection errs toward true and the UI shows the urgent numbers (verify: true).
