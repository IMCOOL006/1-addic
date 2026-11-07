## engine (CORE, 1-addic offline build): the lane report

State: READY. Branch build/engine, worktree C:/Users/ruchi/1-addic-wt/engine. Base f69bc68a (CONTINUED from 03840ef; this run built V-40b, 2026-11-08 04:02 IST). Tip 660233f. Before: READY-SLICE at 03840ef (V-40, 03:24 IST). Earlier: base 655516dc, tip 84075b6, READY, 2026-11-07 22:08 IST.
Commits f69bc68a..HEAD, 2026-11-08:
- 660233f feat(engine, V-40b): Engine.growthItems, the units growth counts (R-S-22, R-C-51)
- 03840ef fix(engine, V-40 C1): a logged slip is never a day shown up
- 6723893 feat(engine, V-40): quest-line, unlocked, daily objectives, growth, run (R-O-6, the slice)
Commits 655516dc..84075b6 (2026-11-07):
- 84075b6 fix(engine, FIX-RS9E): recoveryPlanPrefill and ownWarningPlans read a warning sign as x.item (R-S-9)
- a927cac wip(engine): FIX-RS9E, unfinished (run stopped at the owner's park, 19:10); finished by 84075b6
- 57153d3 test(engine, FIX-RS4): tryIt and knownRoute tests pass with and without Content.exercises
- 227a07a feat(engine, U-08): export, import, migrate, .ics, AppError, validateContent
- f269942 feat(engine, U-07): insights, radar, planner, review, SOS guide sequence, crisis keywords
- b14c9a0 fix(engine, R-sample and R-outcome): CORE rulings of 10:45 built by name
- 6cb722e feat(engine, U-06): roadmap, reveal, Explorer, tips, quests, artifacts, Recovery Plan prefill
- 3ed6e1d fix(engine, U-05 C1): helpful reads true/false and 0/1 only
- 04fc0c1 feat(engine, U-05): ids, dates, profile and the 3.7 game derivations

### Turn caps
- 07:29 run: builder [U-05]: steps_used 17, returned a note (yes). capHits 0.
- 14:34 run: builder [U-07]: steps_used 24, note yes. Builder [U-08]: steps_used 17, note yes. capHits 0. (U-06 was built by the run before, stopped at the HUB's 10:42 pause.)
- 16:36 run: builder [FIX-RS4]: steps_used 13, note yes. capHits 0.
- 22:08 run: builder [FIX-RS9E]: steps_used 9, note yes. capHits 0.
- 2026-11-08 run: builder [V-40]: steps_used 14, note yes; check-fix builder (C1) note yes. capHits 0.
- 2026-11-08 04:02 run: builder [V-40b]: steps_used 11, note yes. capHits 0.

### Units
- U-05 (tier 1, built, 04fc0c1; files offline/src/engine.js, offline/tests/logic.test.mjs). For a person: nothing on a screen yet. The engine now computes from the append-only events the XP, skill mastery, six Harbor region lights, 14-day momentum, rank, 13 badges, lessons and modules done, and opt-in day counters (total, current run, milestones), which Today, the Harbor and Insights will show.
  Questions closed:
  - counters.total (CORE 07:29 a): total = completed local dates from startDate to yesterday, minus each date with a slip logged (local date of its at) on or before that date. A slip with no at counts as logged today. A banked day stays counted, so total never falls. current is the only number a slip restarts. reached = milestones <= total plus every MilestoneSeen. Tests check that today and backdated slips lower nothing, and that total is monotone over 34 days.
  - SkillUsed.helpful (CORE c): one encoding, boolean, written by Actions. C1 fix 3ed6e1d: the reader takes true/false and 0/1 only (test logic.test.mjs:227-232).
  - View shape: Store.view {get,list,count}; pure helpers take plain arrays and also accept a view.
- U-06 (tier 1, built, 6cb722e, 10:45; offline/src/engine.js, offline/tests/engine-roadmap.test.mjs, 27 tests). For a person: nothing on a screen yet. The engine now works out the roadmap (weeks behind never negative, never says "overdue"), the reveal of what is unlocked, Explorer progress (explorerDone feeds the explorer rank), a tip for the moment (none on #/sos), quests, artifacts and the Recovery Plan prefill.
- R-sample / R-outcome (b14c9a0): CORE rulings of 10:45. sample:true rows and events are skipped everywhere, at the three readers normEvents, rowsOf, rowOf; Engine.sosOutcome added. 3 tests.
- U-07 (tier 1, built, f269942; offline/tests/engine-insights.test.mjs, 24 tests). For a person: nothing on a screen yet. The engine now finds when cravings cluster (heatmap), the six warning-sign detectors, gaps, risky hours, suggestions, a 7-day forecast check, a weekly summary (no score, no XP), the SOS tool order, and crisis phrases in what they write.
  Questions closed: crisisKeywords returns the matched phrases (string[]), not a boolean (10:45 ruling); guideSequence always starts with 'wave' because SOBER breathing runs inside the wave tool; 'I killed that workout' does not trigger.
- U-08 (tier 1, built, 227a07a; offline/tests/engine-data.test.mjs). For a person: the backup file export, import checks (plain-language errors), older-backup migration and .ics calendar files are ready to be wired by Settings. validateContent returns [] on the base (validate gate GREEN).
  Questions closed: a string that is wholly one quotation is not the app's voice, so the person's own thought at content-core.js:323 ("I slipped, so I'm a hopeless addict.") passes; a quoted word inside a sentence still fails (see C3). npm test needs no change: build/offline-v1 scripts.test already runs every offline/tests/*.test.mjs; run in this worktree, 102/102 (C:/Users/ruchi/1-addic-wt/_logs/reports/engine/engine__npm-test-proof.log).
- FIX-RS4 (tier 1, built, 57153d3, 16:36; offline/tests/engine-data.test.mjs, 3 lines added, 2 removed). For a person: nothing changes; tests only, no src. R-S-4 closed: the tryIt test deletes exercises from its clone before the 'waits' half; the knownRoute test uses the real id #/exercise/quick-reasons and asserts #/exercise/not-one is unknown only when Content.exercises is present (under Node engine.js loads content-exercises.js into the cached content module, so trunk 9b319256 has it, this branch does not). Against the trunk archive the file runs 15/15 (C:/Users/ruchi/1-addic-wt/_logs/reports/engine/engine__FIX-RS4.trunk.log).
- FIX-RS9E (tier 1, built, a927cac wip + 84075b6 empty closing commit, 22:08; engine.js:844 recoveryPlanPrefill and :983 ownWarningPlans; offline/tests/engine-warning-item.test.mjs, new, 3 tests). For a person: the top 3 warning signs saved from the exercise as { item, plan } now reach the Recovery Plan prefill and the radar, a sign with no plan shows its label alone, the person's own plans win in the radar; the older { id } shape still reads. R-S-9 closed. Red-before: the test fails 3 of 3 against 57153d3's engine.js (C:/Users/ruchi/1-addic-wt/_logs/reports/engine/engine__FIX-RS9E.red.log). The wip carried code and test already correct; 84075b6 records the proof without rewriting the pushed wip.
- V-40 (tier 1, built, 6723893; check fix 03840ef; 2026-11-08; offline/src/engine.js block before "/* views", offline/tests/engine-questline.test.mjs). For a person: nothing on a screen yet. The engine now works out the quest line (steps unlock features), what is unlocked, three daily objectives with one swap, growth (days shown up; XP ObjectiveDone 5, QuestLineStepDone 20) and a run of days shown up with one grace day per Monday-week. A logged slip never counts as a day shown up. Details: engine__units.md.
  Questions closed: V-Q9 (one grace day per Monday-week, kept), V-Q11 (three a day, one swap), V-Q12 (shown-up set). Builder choices: shownUpDays extra export; growth(view, now?); swapped true after any ObjectiveSwapped that day; progress.have capped at need; ObjectiveDone counts on its date even if not in the day's draw.
  C1 fix 03840ef: slip rows (type slip, or LogCreated with payload.type slip) never add a day; logsOf unchanged. Red and green: engine__C1.redgreen.log. Gates 121/121.
- V-40b (tier 1, built, 660233f; 2026-11-08; offline/src/engine.js, offline/tests/engine-questline.test.mjs). For a person: nothing on a screen yet. The engine can now list each unit that growth counts (date, objective id, what it grows), oldest first, so the Today screen can show the units behind the growth number. growth and the list share one day walk, so they always agree in length. Closed: V-40b as briefed (R-S-22, R-C-51). Details: engine__units.md.
- Held or blocked: none.
- Still to build on this lane (tier 2, not in this run): V-19 (spiralThoughts own flag), V-30 (tutorialDone export).

### Contract changes
All on `Engine` (browser global; require('offline/src/engine.js') under Node). No events, content keys, routes, UI.pages entries or data-tour targets added.
- ids/dates: id(), todayStr(now), dateStr(x), addDays(ds,n), daysBetween(a,b) (b minus a), weekStart(ds, weekStartsOn=1), fmtDate, fmtTime ("7:40 pm"), fmtDateTime ("7 Nov 2026, 7:40 pm"), hourOf(iso), isNight(now) (20:00 to 05:59). Consumers: all lanes.
- profile: term(profile) -> {word, days, adjective}; greeting(now, name); companionName(profile) (trimmed, max 40, default "Companion"). Consumers: today-track, actions-sos.
- game: xpFromEvents(events, now) -> {total, today, byType}; mastery(events); regionLevels(mastery); momentum(events, now) -> {days, of:14, dates[]}; rank(events, view) -> Content.ranks row | null; badges(view, now) -> [{id, earnedAt}]; modulesDone(events), lessonsDone(events) (Sets); counters(profile, slips, now) -> {tracking, total, current, nextMilestone, reached[]}; gameState(view, now). Consumers: today-track, game-tutorials (U-26), actions-sos (U-09).
- views: makeView({store:[rows]}) -> {get, list, count}; STORES.
- 14:34 run, for contracts/engine.md (CORE writes it):
  - U-07 (contract :26, :44, :51 change): crisisKeywords(text) -> string[] (matched phrases, lower case, each once, or []; non-strings []). Engine.CRISIS = {clinicalReview: true, patterns[]}. guideSequence(view) -> ['wave', x, y], x,y from why|distract|call|talkback; default ['wave','why','distract']. Engine.SOS_TOOLS frozen [{id, skillId}]. Consumer: actions-sos ui-sos.js (reads both shapes).
  - U-07 shapes: heatmap[weekday 0=Sunday..6][hour] = {count, mean|null}; warningSigns -> [{signId, label, evidence, plan, own}]; moodVsActivities -> {withActivity, withoutActivity, sentences[]}; forecastCheck -> 7 days of {date, planned[], logged[], line|null}; weekSummary -> {weekStart, end, logs, cravingMean, skillsUsed, topSkills, pleasant, plans, sos, highlights[]} or null. New code must read through normEvents/rowsOf/rowOf, never view.list.
  - U-08 (contract :29): exportBackup(view, meta): meta is {exportedAt} or {now} or the moment; exportedAt null when none; rows in view order; meta lock row excluded, sample row kept. validateBackup(obj) -> {ok, errors[]}: plain-language, at most 20, never throws; missing stores allowed, unknown ignored. migrateBackup(obj) -> new object or null for a non-object; fills all 16 stores, drops unknown stores and any meta lock row; does not validate, so call validateBackup first. ics(items, opts?): opts.now sets DTSTAMP (without it, the item's local midnight); CRLF, 75-octet folding, escaping, floating times, RRULE; weeklyRrule. Also AppError, validateContent, knownRoute. Consumers: workbook-settings, actions, actions-sos.
  - Engine.sosOutcome (R-outcome).
- 2026-11-08 V-40 (on Engine; for contracts/engine.md): questLine, unlocked, dailyObjectives, growth(view, now?), run, shownUpDays(view, now?) (extra), isProtectedFeature(x, content?). Events read: ObjectiveDone {id,date}, ObjectiveSwapped {from,to,date}, QuestLineStepDone {id}, FeatureUnlocked {feature,by}. Content read: questLine, objectives, xp.ObjectiveDone, xp.QuestLineStepDone, features[reward]. ONCE_FIELD.QuestLineStepDone=id. validateContent adds questLine (8 to 12 steps, no protected reward) and objectives (6 or more) checks.
- 2026-11-08 V-40b (for contracts/engine.md): Engine.growthItems(view, now?) -> [{date, id, grows}], oldest first, first-by-id per day; grows is the Content.objectives element or null for an ObjectiveDone id Content.objectives lacks (guard for null); [] when the pool is empty. Optional now is a small addition to the contract, same as growth. Length always equals growth. Consumer: SCREENS today-track V-43. Internal: growthWalk(ctx, pool, upTo, ids); change the counting rule only there.

### Gates
VERIFIED (check run at 03840ef, 2026-11-08 03:24 IST run; gates 03:38 to 03:43):
- build GREEN, 1128371 B. log C:\Users\ruchi\1-addic-wt\_logs\gates\engine\build-20261108-033830.log
- test GREEN, 120 pass, 0 fail, 6 files (at 6723893). log C:\Users\ruchi\1-addic-wt\_logs\gates\engine\test-20261108-033836.log
- validate GREEN. log C:\Users\ruchi\1-addic-wt\_logs\gates\engine\validate-20261108-033842.log; guards GREEN, 5 pass. log C:\Users\ruchi\1-addic-wt\_logs\gates\engine\guards-20261108-033843.log
- After fix 03840ef (builder): build-20261108-034439, test-20261108-034443 (121/121), validate-20261108-034630, guards-20261108-034631 in the same folder, all GREEN.
VERIFIED (2026-11-08 04:02 run, check at 660233f; gates 04:13):
- build GREEN pass=1. log C:/Users/ruchi/1-addic-wt/_logs/gates/engine/build-20261108-041338.log
- test GREEN, 125 pass, 0 fail, 6 files. log C:/Users/ruchi/1-addic-wt/_logs/gates/engine/test-20261108-041344.log
- validate GREEN, log same folder validate-20261108-041349.log; guards GREEN, 5 pass, guards-20261108-041350.log
ASSUMED (2026-11-08 04:02): browser gate not run (engine-only unit); mutation proof of the new tests not run (read-only checker; judged by reading).
ASSUMED (2026-11-08): browser gate not run (no browser tests); growth monotone under backup import with past dates not tested.
Earlier runs' gates: see engine-report-annex.md (logs in C:/Users/ruchi/1-addic-wt/_logs/gates/engine/).
Territory (2026-11-08): engine f69bc68a..HEAD: 2 files, both own (engine.js, engine-questline.test.mjs); 0 shared, 0 nobody's, 0 errors, 0 warnings; both commits carry both trailers. Earlier: 22:08 6 files own; 16:36 5 own; 14:34 5 own; all 0 shared, 0 errors.
Territory (2026-11-08 04:02): engine f69bc68a..HEAD: 2 files, both own (engine.js, engine-questline.test.mjs); 0 shared, 0 nobody's, 0 errors, 0 warnings; 660233f carries both trailers.

### Review gates
None. Not a flagged lane (reviewGates empty).

2026-11-08 03:24 IST: Verdict FIX at 6723893, fixed at 03840ef (judged commits after f69bc68a). V-40 present, meets brief items 1-4 and 6-11. U-05 to U-08, FIX-RS4, FIX-RS9E counted present only through the test gate.
- C1 MEDIUM (V-40, engine.js:1583 shownUpOver): a slip log row counted as a day shown up, against contract :84 and R-C-50. Fix 03840ef. Finder's re-check: FIXED (engine.js:1580-1588). Evidence: _logs/reports/engine/scratch/slipprobe.log. No new findings.
2026-11-08 04:02 IST: Verdict PASS at 660233f (judged commits after 03840ef). V-40b present, meets acceptance (growthItems engine.js:1704-1715, exported :1801, shares growthWalk :1687; tests engine-questline.test.mjs:369-454). V-40 still present; growthOver now calls growthWalk with the same count. No findings (none open, none fixed). Not checked: browser gate; mutation proof; the open CORE slip question (a policy call); earlier units.
Not checked (2026-11-08): browser gate; U-05 to U-08, FIX-RS4, FIX-RS9E not re-judged; growth under past-dated backup import.

### Check
2026-11-07 checks (07:29, 14:34, 16:36, 22:08 IST, all PASS; C1 fixed 3ed6e1d; C2, C3 LOW open defaults; C4 LOW CORE to write the U-07 contract): full text in C:/Users/ruchi/1-addic-wt/_logs/reports/engine-report-annex.md.

### Review
Not a flagged lane: no reviewers run. Open review findings: 0.

### Safety and content marks
Engine.CRISIS = {clinicalReview: true, patterns[]}: the crisis phrase list needs the clinical reviewer (RS2/RS10). crisisKeywords never gates SOS; SOS stays ungated. No resources marked verify: true. Engine strings are greetings, the default companion name, plain-language import errors, and weekly-summary highlights (no score, no XP, no "overdue"). validateContent enforces the tone rules ("addict" never as a noun in the app's voice). 2026-11-08 V-40: no person-facing strings, no clinicalReview or verify passages; SOS stays ungated (isProtectedFeature keeps SOS out of any reward).

### Requests for other lanes
- actions-sos: use Engine.guideSequence and Engine.SOS_TOOLS, and crisisKeywords as string[].
- workbook-settings: call validateBackup before migrateBackup; pass meta to exportBackup.
- HUB: FIX-RS9E needs no action beyond the merge (engine.js and one new test only).
- HUB: at the merge lift the two baselined names (engine-data 'validateContent: the tryIt exercise check waits for Content.exercises, then runs' and 'knownRoute: the 3.5 route table, by path').
- CORE: write the U-07 and U-08 contract lines above into contracts/engine.md (C4).
- 2026-11-08 CORE: add the V-40 contract lines above to contracts/engine.md; add the four events to BUILD-PLAN 3.4. Screens lanes: use Engine.run, growth, dailyObjectives; never filter slips yourself.

### Docs owed
- Full list (07:29 to 22:08 runs) in C:/Users/ruchi/1-addic-wt/_logs/reports/engine-report-annex.md.
- 2026-11-08: contracts/engine.md owes V-40: Engine.shownUpDays(view, now?), optional now on growth(view, now?), optional content arg on isProtectedFeature; a slip never counts as a day shown up. BUILD-PLAN 3.4 gets four events (ObjectiveDone, ObjectiveSwapped, QuestLineStepDone, FeatureUnlocked). tests-docs V-45 documents the run and the grace day.
- 2026-11-08 V-40b: SCREENS today-track V-43: use Engine.growthItems(view, now?); guard for grows null. CORE: add the line above to contracts/engine.md; answer the slip question (Open question 10).

### Open questions
1. rank "explorer": ExplorerCompleted or the all-12 path via explorerDone(view) (built in U-06).
2. net-weaver counts safetyNet contacts active or not (C2).
3. Events without a parseable at or type are ignored; duplicate ids count once.
4. ExerciseDone earns 10 XP each time, no daily limit.
5. counters.tracking = a startDate is set; the settings opt-in is read by the UI.
6. Under Node, engine.js loads content-core.js then the other content-*.js in offline/src, sorted.
7. Whole-quotation exemption in validateContent (C3): kept; confirm.
8. guideSequence always starts with 'wave' (SOBER runs inside it): default taken.
9. (V-40) ObjectiveDone counts toward growth on its date even if not in that day's draw; draw state counts each step's first claim; growth(view) with no now counts every logged date; questLine ignores now. Defaults taken.
10. (V-40b, for CORE) A 'slip' LogCreated row satisfies an objective whose doneBy is { event: 'LogCreated' } on a day it is drawn, so a slip log can grow a unit in growth and growthItems, while run() excludes slips. Should objDone skip LogCreated with payload.type 'slip'? Default: left as V-40 built it; if yes, a one-line change in objDone (engine.js).

### For the HUB at the merge
- Shared files touched: none. package.json and package-lock.json: unchanged (branch has none).
- Conflicts to expect: none; only offline/src/engine.js and the tests logic.test.mjs, engine-data, engine-insights, engine-roadmap.
- Territory warnings: none.
- Browser tests for the quiet window: none from this lane.
- FIX-RS4 is test-only: passes on the branch (102) and against trunk 9b319256 content (15/15 in engine-data); lift the two baselined names.
- After merge run npm test on build/offline-v1 (102 expected).
- Evidence: C:/Users/ruchi/1-addic-wt/_logs/reports/engine/engine__units.md, engine__progress.md, engine__npm-test-proof.log.
- 22:08: FIX-RS9E adds engine.js (readers only) and engine-warning-item.test.mjs; still no shared file; no new conflicts expected.
- 2026-11-08 V-40: engine.js and engine-questline.test.mjs only; no shared file; no conflicts expected. Do not commit the rebuilt offline/1-addic.html. Tests on this lane: 121. Evidence: engine__units.md, engine__C1.redgreen.log.
- 2026-11-08 04:02 V-40b: engine.js and engine-questline.test.mjs only; no shared file; no conflicts expected. Do not commit the rebuilt offline/1-addic.html. Tests on this lane: 125. Evidence: engine__units.md.
