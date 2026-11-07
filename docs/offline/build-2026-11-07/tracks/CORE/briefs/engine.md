# Brief: lane engine (CORE chat), V3 (R-O-6), base f69bc68a; v1 base 655516dc

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


# V3 (2026-11-08 03:11 IST): R-O-6, PLAN-V3.md section 7
Base f69bc68a (worktree fast-forwarded 03:10). Units in order: V-40 (tier 1, the slice, 3 h), then V-19 (0.5 h) and V-30 (0.2 h) as one tier 2 batch. Files: `offline/src/engine.js` (new block before `makeView` at :1479; export list :1495-1505), new `offline/tests/engine-questline.test.mjs`, `logic.test.mjs` for V-19/V-30. Per-unit notes: briefs/engine/V-40.md, V-19.md, V-30.md. No go-aheads: builds on the section 7 contract with an inline fixture; content V-42 and actions-sos V-41 build against `contracts/engine.md` "V3 R-O-6".

## V-40 Quest-line, objectives, growth, run (slice)
Today at BASE: none of the five names exists. Reusable: `normEvents(view|events)` :159 (skips `sample:true`, sorts, dedupes ids), `pl(e)` :175, `rowsOf/rowOf` :344-351 (skip sample), `dateStr/addDays/daysBetween/weekStart(ds,1)` :71-106, `revealed(view)` :589, `xpBase` :186, `makeView` :1482. Read `C.questLine`, `C.objectives` lazily at call time (`arr(C.x)`), never cached at load, so a test can set them; both absent gives `{steps:[],current:null}`, `new Set(revealed)`, `{date,items:[],growth:0}`; never throw.
Build (one block "quest-line, objectives, run (R-O-6)"):
1. `isProtectedFeature(id)`: true for `C.reveal.always`, `help lessons learn settings export data backup sos urgent`, and any `C.features[id].tab` in `sos|settings|learn`.
2. `met(cond, events)`: count events of `cond.event` whose payload matches the optional `cond.where` (shallow equal); with `within:'day'|'week'` the best bucket (local day, or `weekStart(day,1)` week) must reach `cond.count`; else total. Returns `{have, need, met}`.
3. `questLine(view, now)`: steps in `C.questLine` order; claimed = a non-sample `QuestLineStepDone{id}`; `doneAt` = its `at`. State: claimed `done`; the first unclaimed `current`; later `locked`. Each step gets `met`, `progress:{have,need}`, `claimable` (current and met). `current` = that step object or null; also `done`, `total`. A met locked step stays locked (order is fixed).
4. `unlocked(view)`: `new Set(revealed(view))` plus rewards of claimed steps plus `FeatureUnlocked{feature}` events; skip protected ids and non-strings. Always a superset of revealed.
5. Days shown up `shownUpDays(view)`: sorted unique local dates (<= today, from `now`) of non-sample events `LogCreated CheckinCompleted LessonCompleted SkillUsed ExerciseDone ArtifactSaved MindfulMinute ActivityDone BattlePlanCreated BattlePlanDebriefed WeeklyReviewCompleted SosCompleted ObjectiveDone`, `TutorialCompleted` with `payload.id==='drill'` (the SOS drill: actions.js:403-407 writes only that), plus non-sample non-drill `logs` rows. Never `SlipLogged`, `MilestoneSeen`, profile start date or counters (no claimed sober day). `ObjectiveDone` day = `payload.date` if valid else its `at`.
6. `run(view, now)` -> `{current, best, total, kept, cameBack, lastDay, holding}`. total = count of days. Walk days ascending: gap 1 continues; one missed day whose Monday-week has no kept day yet is bridged (added to `kept`, run continues, the kept day adds nothing to `current`); any other gap ends the run (best = max) and starts a new one. Tail: lastDay today or yesterday keeps `current`; one missed day with grace left holds the run open (`holding`: that date, not yet in `kept`, so `kept` never shrinks); else `current` 0 (a quiet restart, no shame). `best` = max over runs incl. current. `cameBack` true only when lastDay is today, `current` is 1 and an earlier day exists. Week start Monday (`weekStart` default; the settings value is not read).
7. `dailyObjectives(view, now)` -> `{date, items, growth, swapped}`. Pool = valid `C.objectives` rows. State key for date d: `daysBefore|claimedBefore` (shown-up days < d, `QuestLineStepDone` dated < d), so it never changes inside the day. Order the pool by `fnv1a32(d+'|'+key+'|'+o.id)`, ties by id (FNV-1a: `h=2166136261; h^=c; h=Math.imul(h,16777619)>>>0`); items = first 3 (two drawn, the third is the swappable slot; this equals "two drawn, one swappable"). Swap: an `ObjectiveSwapped{from,to,date}` on d replaces `from` by `to` once; each undone item gets `swappable` (no swap yet today) and `swapTo` = `ordered[3]` (the deterministic replacement). `done` = `ObjectiveDone{id,date:d}` or, for `doneBy:{event}`, a non-sample event of that type on d (and `doneBy.where`). Items are `{...objective, done, swappable, swapTo}`.
8. `growth(view)`: count of distinct dates with an objective done: `ObjectiveDone` dates union redrawn past days where an event-done objective matched (use the same draw, swaps included). Union only grows; never decreases while the content is unchanged.
9. XP: `ONCE_FIELD.QuestLineStepDone='id'` (:181); a branch `ObjectiveDone` once per `id|date` (beside :227); rows come only from `Content.xp`.
10. `validateContent` additions (inside the try at :1443, format "questLine step <id>: <problem>"): skipped when the key is absent. questLine: array of 8 to 12; ids unique strings; title/line/opened non-empty; `condition.event` in the known-event list (the 24 of actions.js:141 plus `ObjectiveDone QuestLineStepDone FeatureUnlocked ObjectiveSwapped`); `count` an integer >= 1; `within` day|week; `reward` exists in `C.features` and is not protected. objectives: array >= 6; unique ids; `doneBy` 'tap' or `{event}` known (not ObjectiveDone); `grows` non-empty.
11. Export: `questLine unlocked dailyObjectives growth run isProtectedFeature`.
Acceptance (spec): pure and tested per rule; a break never lowers best or total; a grace day keeps; growth never decreases; unlocked is a superset of revealed; same date and state give the same objectives; validateContent catches a planted bad reward.
Tests `engine-questline.test.mjs` (TZ Asia/Kolkata first; `createRequire`; fixture of 9 steps and 8 objectives set on the required Content object inside `withContent(fn)` with try/finally restore; features added likewise): a break never lowers best or total; the grace day keeps (and a second miss in that week breaks); growth never decreases after a missed day; unlocked is a superset of revealed; the same date and state give the same objectives; a different date or state may differ; a swap replaces once and is honoured; a claimed step's reward is in unlocked and an unclaimed met step's is not; a protected reward is ignored and named by validateContent; sample rows count for nothing (run, growth, claim); a SlipLogged or MilestoneSeen day is not a day shown up; cameBack on the first day back only; absent content returns empty shapes; XP rows honoured once; no `Math.random` in the block.
Rules that bite: no random reward (hash only); nothing derived decreases; no points for claimed sober days; sample rows count for nothing; SOS, help, lessons, Settings, export, data never in a reward; no shame wording in any string.
Gates: `python C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tools/gates.py --wt C:/Users/ruchi/1-addic-wt/engine --lane engine build test validate guards`; territory check as v1 with `f69bc68a..HEAD`. Validate stays green on the base content (keys absent).

## V-19 FIX-SPIRAL-OWN (tier 2)
Today: `spiralThoughts` engine.js:719-729 fills an empty reply from `catalogs.slipSelfTalk` and returns `{thought, reply}`. Build: add `own: boolean` (true only when the person's trimmed reply is non-empty before the fill); thought and reply unchanged. Tests in `logic.test.mjs`, one per branch: person's reply (pairs), plain string thought, `replies[]` fallback, empty filled from stock (own false), no catalogs (reply '', own false). After merge tell actions-sos by outbox; ui-sos.js spiralPairs is unchanged.

## V-30 Export tutorialDone (tier 2)
Today: `tutorialDone(view, tid, allowSkipped)` :611 is internal; ui-guidance.js:130-132 calls `E.tutorialDone` behind a typeof guard and finds none. Build: add it to the export list :1495. Test: it agrees with the Explorer `tour` (allowSkipped false) and `drill` (true) items for a row, an event, a skipped event, and nothing.

## Open questions, default taken (V-Q9 to V-Q13; outbox-OWNER.md has no answer at 03:11)
V-Q9 one grace day per Monday-week, shown as "kept". V-Q10 (content) never a protected feature. V-Q11 three a day, two drawn plus a third the person may swap once; done by tap or matching event. V-Q12 the day set in item 5. V-Q13 display is today-track's. Own calls: `where` (shallow payload match) is the optional condition filter (content V-42 should use it, e.g. `{event:'TutorialCompleted', where:{id:'drill'}}`); `current` is the step object; a lone event-done objective earns no XP.

## Safety and content rules (V3)
No random rewards, no countdown, no shame or "lost" wording, no points for claimed sober days (the O6 counters stay apart), nothing derived decreases, sample rows count for nothing, SOS, help, lessons, Settings, export and the person's data are never gated or a reward; original words, grade 6 to 8; no network.

## v1 units U-05 to U-08 (built, merged)
Verbatim in briefs/engine/v1-annex.md (units, tests, open questions). Do not re-read unless a v1 rule is in doubt.

## Decisions that bite
O1 file offline/1-addic.html, title "1-addic", discreet "Notebook". O2 PIN never forced. O3 India numbers verify: true. O4 speechSynthesis only. O5 locale en, no Gujarati. O6 sample data marked (meta row sample), erasable. O7 no dead buttons. O8 guide is tests-docs.

## Gates and baselines
`python C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tools/gates.py --wt C:/Users/ruchi/1-addic-wt/engine --lane engine build test validate guards` (browser, docs do not apply). Baselines (coordination/baselines.md): at the base validate and test are SKIP (no engine.js), content loads as 4 modules, 16 lessons, 37 skills; after U-08 validate must be GREEN, errors=0. Territory: `python C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tools/check_territory.py engine 655516dc..HEAD --wt C:/Users/ruchi/1-addic-wt/engine`. Node 22.

## Go-aheads
None. Requests (a package.json test script, a content error) go in for_the_chat.

## Safety and content rules touching this lane
SOS is never gated or interrupted by a tip. No streak resets, random rewards or points for claimed sober days; XP, mastery, badges, region light and total days come from the append-only events, and a slip restarts only the opt-in current run. No network, no trackers; contacts never leave the device except in a user-triggered export. Engine strings are gentle, person-first, grade 6-8, never "addict" as a noun, with no substance how-to, sensations or doses; crisis detection errs toward true and the UI shows the urgent numbers (verify: true).
