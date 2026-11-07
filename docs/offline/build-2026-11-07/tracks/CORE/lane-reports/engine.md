## engine (CORE, 1-addic offline build): the lane report

State: READY. Branch build/engine, worktree C:/Users/ruchi/1-addic-wt/engine. Base f69bc68a (CONTINUED from 660233f; this run built V-40c, 2026-11-08 04:38 IST). Tip 4330d9f. Before: READY 660233f (V-40b, 04:02), READY-SLICE 03840ef (V-40, 03:24). Earlier: base 655516dc, tip 84075b6, READY, 2026-11-07 22:08 IST.
Commits f69bc68a..HEAD, 2026-11-08:
- 4330d9f feat(engine, V-40c): two known routes, #/status and #/track/radar (R-S-24, R-C-57, R-H-43)
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
- 2026-11-08 04:38 run: builder [V-40c]: steps_used 12, note yes. capHits 0.

### Units
- U-05, U-06, U-07, U-08, FIX-RS4, FIX-RS9E (tier 1, built 2026-11-07: 04fc0c1, 6cb722e, f269942, 227a07a, 57153d3, 84075b6; R-sample/R-outcome b14c9a0): full text, what changed for a person and questions closed, in engine-report-annex.md.
- V-40 (tier 1, built, 6723893; check fix 03840ef; 2026-11-08; offline/src/engine.js block before "/* views", offline/tests/engine-questline.test.mjs). For a person: nothing on a screen yet. The engine now works out the quest line (steps unlock features), what is unlocked, three daily objectives with one swap, growth (days shown up; XP ObjectiveDone 5, QuestLineStepDone 20) and a run of days shown up with one grace day per Monday-week. A logged slip never counts as a day shown up. Details: engine__units.md.
  Questions closed: V-Q9 (one grace day per Monday-week, kept), V-Q11 (three a day, one swap), V-Q12 (shown-up set). Builder choices: shownUpDays extra export; growth(view, now?); swapped true after any ObjectiveSwapped that day; progress.have capped at need; ObjectiveDone counts on its date even if not in the day's draw.
  C1 fix 03840ef: slip rows (type slip, or LogCreated with payload.type slip) never add a day; logsOf unchanged. Red and green: engine__C1.redgreen.log. Gates 121/121.
- V-40b (tier 1, built, 660233f; 2026-11-08; offline/src/engine.js, offline/tests/engine-questline.test.mjs). For a person: nothing on a screen yet. The engine can now list each unit that growth counts (date, objective id, what it grows), oldest first, so the Today screen can show the units behind the growth number. growth and the list share one day walk, so they always agree in length. Closed: V-40b as briefed (R-S-22, R-C-51). Details: engine__units.md.
- V-40c (tier 1, built, 4330d9f; 2026-11-08; offline/src/engine.js ROUTE_PATHS ~:1385, offline/tests/engine-data.test.mjs). For a person: nothing on a screen yet; Help and Features can now point to the Status page and the Radar track without the content check rejecting them. Routes match the exact path before "?": #/status/nope, #/statusx, #/track/radarx, #/track/radar/2 stay unknown. Red before (3 tests fail, engine__V-40c.red.log), green after. Closed: V-40c as briefed (R-S-24, R-C-57, R-H-43). Content V-10r (SCREENS) may flip features.status.route and the help entry to #/status after the merge.
- Held or blocked: none.
- Still to build on this lane (tier 2, not in this run): V-19 (spiralThoughts own flag), V-30 (tutorialDone export); read briefs/engine.md "## V3" once CORE names the batch.

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
- 2026-11-08 V-40c: no new function; knownRoute and validateContent accept #/status and #/track/radar (3.5 route list; contracts/engine.md:104).

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
VERIFIED (2026-11-08 04:38 run, check at 4330d9f):
- build GREEN pass=1, 1129728 B. log C:/Users/ruchi/1-addic-wt/_logs/gates/engine/build-20261108-044820.log
- test GREEN, 127 pass, 0 fail, 6 files. log C:/Users/ruchi/1-addic-wt/_logs/gates/engine/test-20261108-044823.log
- validate GREEN C:/Users/ruchi/1-addic-wt/_logs/gates/engine/validate-20261108-045208.log; guards GREEN, 5 pass C:/Users/ruchi/1-addic-wt/_logs/gates/engine/guards-20261108-045210.log
ASSUMED (2026-11-08 04:38): browser gate not run (route table only); mutation proof not run.
ASSUMED (2026-11-08 04:02): browser gate not run (engine-only unit); mutation proof of the new tests not run (read-only checker; judged by reading).
ASSUMED (2026-11-08): browser gate not run (no browser tests); growth monotone under backup import with past dates not tested.
Earlier runs' gates: see engine-report-annex.md (logs in C:/Users/ruchi/1-addic-wt/_logs/gates/engine/).
Territory (2026-11-08): engine f69bc68a..HEAD: 2 files, both own (engine.js, engine-questline.test.mjs); 0 shared, 0 nobody's, 0 errors, 0 warnings; both commits carry both trailers. Earlier: 22:08 6 files own; 16:36 5 own; 14:34 5 own; all 0 shared, 0 errors.
Territory (2026-11-08 04:02): engine f69bc68a..HEAD: 2 files, both own (engine.js, engine-questline.test.mjs); 0 shared, 0 nobody's, 0 errors, 0 warnings; 660233f carries both trailers.
Territory (2026-11-08 04:38): engine f69bc68a..HEAD: 3 files, all own (engine.js, engine-data.test.mjs, engine-questline.test.mjs); 0 shared, 0 nobody's, 0 errors, 0 warnings; the V-40c commit carries both trailers; only uncommitted file is the gates' rebuild offline/1-addic.html.

### Review gates
None. Not a flagged lane (reviewGates empty).

2026-11-08 03:24 IST: Verdict FIX at 6723893, fixed at 03840ef (judged commits after f69bc68a). V-40 present, meets brief items 1-4 and 6-11. U-05 to U-08, FIX-RS4, FIX-RS9E counted present only through the test gate.
- C1 MEDIUM (V-40, engine.js:1583 shownUpOver): a slip log row counted as a day shown up, against contract :84 and R-C-50. Fix 03840ef. Finder's re-check: FIXED (engine.js:1580-1588). Evidence: _logs/reports/engine/scratch/slipprobe.log. No new findings.
2026-11-08 04:02 IST: Verdict PASS at 660233f (judged commits after 03840ef). V-40b present, meets acceptance (growthItems engine.js:1704-1715, exported :1801, shares growthWalk :1687; tests engine-questline.test.mjs:369-454). V-40 still present; growthOver now calls growthWalk with the same count. No findings (none open, none fixed). Not checked: browser gate; mutation proof; the open CORE slip question (a policy call); earlier units.
2026-11-08 04:38 IST: Verdict PASS at 4330d9f (judged commits after 660233f). V-40c present (ROUTE_PATHS engine.js:1385; neighbours rejected; validateContent accepts routed help, feature, tip). No findings (none open, none fixed). Not checked: browser gate; U-05 to V-40b not re-judged; UI/copy/SOS rules (diff adds two route strings and tests).
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
- 2026-11-08 V-40c: content V-10r (SCREENS) may route features.status and help to #/status once merged.

### Docs owed
- Full list (07:29 to 22:08 runs) in C:/Users/ruchi/1-addic-wt/_logs/reports/engine-report-annex.md.
- 2026-11-08 (V-40, V-40b, V-40c): owed lines (contracts/engine.md, BUILD-PLAN 3.4 events, V-43 growthItems, V-45 docs, slip question) are in engine-report-annex.md. V-40c owes none: contracts/engine.md:104 already names both routes.

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
- 2026-11-08 04:38 V-40c: engine.js and engine-data.test.mjs only; no shared file; no conflicts expected. Do not commit the rebuilt offline/1-addic.html. Tests on this lane: 127. Merge V-40c before content V-10r routes to #/status. Evidence: engine__units.md, engine__V-40c.red.log, engine__V-40c.green.log.
