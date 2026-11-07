## engine (CORE, 1-addic offline build): the slice report

State: READY-SLICE. Branch build/engine, worktree C:/Users/ruchi/1-addic-wt/engine. Base 655516dc. Tip 04fc0c1. Run time 2026-11-07 07:29 IST.
Commits (655516dc..HEAD):
- 04fc0c1 feat(engine, U-05): ids, dates, profile and the 3.7 game derivations

### Turn caps
- Builder batch [U-05]: steps_used 17, returned a note (yes). capHits 0.

### Units
- U-05 (tier 1, built, 04fc0c1; files offline/src/engine.js, offline/tests/logic.test.mjs). For a person: nothing on a screen yet. The engine now computes from the append-only events the XP, skill mastery, six Harbor region lights, 14-day momentum, rank, 13 badges, lessons and modules done, and opt-in day counters (total, current run, milestones), which Today, the Harbor and Insights will show.
  Questions closed:
  - counters.total (CORE 07:29 a): total = completed local dates from startDate to yesterday, minus each date with a slip logged (local date of its at) on or before that date. A slip with no at counts as logged today. A banked day stays counted, so total never falls. current is the only number a slip restarts. reached = milestones <= total plus every MilestoneSeen. Tests check that today and backdated slips lower nothing, and that total is monotone over 34 days.
  - SkillUsed.helpful (CORE c): one encoding, boolean, written by Actions. The reader tolerates 0/1 and a 2-5 scale ((v-1)/4); other values are ignored for helpfulAvg.
  - View shape: Store.view {get,list,count}; pure helpers take plain arrays and also accept a view.
- Held or blocked: none.
- Still to build on this lane: U-06 (roadmap, reveal, explorer, tips, quests, artifacts, prefill; explorerDone(view) feeding rank's explorer path with no shape change; tests offline/tests/engine-roadmap.test.mjs), U-07 (insights, warningSigns, gaps, riskyHours, suggestions, forecastCheck, weekSummary, guideSequence, crisisKeywords; BUILD-PLAN 3.9; tests engine-insights.test.mjs), U-08 (exportBackup, validateBackup, migrateBackup, ics, AppError, validateContent; tests engine-data.test.mjs; validate gate must go GREEN errors=0; skip the tryIt-exercise check while Content.exercises is absent).

### Contract changes
All on `Engine` (browser global; require('offline/src/engine.js') under Node). No events, content keys, routes, UI.pages entries or data-tour targets added.
- ids/dates: id(), todayStr(now), dateStr(x), addDays(ds,n), daysBetween(a,b) (b minus a), weekStart(ds, weekStartsOn=1), fmtDate, fmtTime ("7:40 pm"), fmtDateTime ("7 Nov 2026, 7:40 pm"), hourOf(iso), isNight(now) (20:00 to 05:59). Consumers: all lanes.
- profile: term(profile) -> {word, days, adjective}; greeting(now, name); companionName(profile) (trimmed, max 40, default "Companion"). Consumers: today-track, actions-sos.
- game: xpFromEvents(events, now) -> {total, today, byType}; mastery(events); regionLevels(mastery); momentum(events, now) -> {days, of:14, dates[]}; rank(events, view) -> Content.ranks row | null; badges(view, now) -> [{id, earnedAt}]; modulesDone(events), lessonsDone(events) (Sets); counters(profile, slips, now) -> {tracking, total, current, nextMilestone, reached[]}; gameState(view, now). Consumers: today-track (counters, momentum), game-tutorials (U-26), actions-sos (U-09, SOS "what helped" from mastery).
- views: makeView({store:[rows]}) -> {get, list, count}; STORES. Exported early.

### Gates
VERIFIED (check run at 04fc0c1):
- test GREEN, 33 passed, 0 failed. GATE log C:/Users/ruchi/1-addic-wt/_logs/gates/engine/test-20261107-073550.log (builder run: test-20261107-073354.log)
- guards GREEN, 2 passed, 3 skipped (csp: no build; theme parity: no styles.css; tutorial targets: no ui-*.js or shell.html). log C:/Users/ruchi/1-addic-wt/_logs/gates/engine/guards-20261107-073553.log
- build SKIP: offline/build.mjs absent (core's file; baseline SKIP). log .../build-20261107-073550.log
- validate SKIP: no validateContent until U-08. log .../validate-20261107-073553.log
ASSUMED: browser and docs gates do not apply to this lane (not run).
Territory: check_territory.py engine 655516dc..HEAD: 2 files, 2 own, 0 shared, 0 nobody's, 0 errors, no warnings.

### Review gates
None.

### Check
Verdict PASS at 04fc0c1.
- C1 LOW (engine.js:248-255 helpfulValue): on a 1-5 scale, 1 is caught by the 0/1 branch and reads as fully helpful, while 2 reads 0.25, so the reading is not monotone. Document that 1 means true, or change the scale handling. No fix SHA; not re-checked.
- C2 LOW (engine.js:390-393 net-weaver): BUILD-PLAN 3.7 line 185 says 3 active safetyNet contacts; the lane counts them active or not so a badge never disappears (test logic.test.mjs:294). Default is documented. No fix SHA; not re-checked.
Not checked: U-06 to U-08; browser and docs gates.

### Review
Not a flagged lane: no reviewers run.

### Safety and content marks
No passages marked clinicalReview: true and no resources marked verify: true. Engine strings are greetings and the default companion name only; no crisis copy.

### Requests for other lanes
None from this slice's notes.

### Docs owed
- tracks/CORE/contracts/engine.md (the lane cannot write there): Day counters: total counts COMPLETED local dates only (startDate to yesterday; today counts when it ends), and a counted date stays counted. A date is left out only when a slip with that date was logged (its at) on or before that date; a slip logged later for an earlier date never removes a banked day. So total never falls. current (opt-in) is the only number a slip restarts. Reached milestones come from total and every MilestoneSeen and never un-reach; MilestoneSeen marks the celebration once. No XP for days.
- SkillUsed{skillId, helpful: boolean, logId?}: Actions writes true or false; the engine tolerates 0/1 and 1-5 on read.
- validateContent (U-08) skips the tryIt-exercise check while Content.exercises is absent and runs it once it exists.
- xpFromEvents(...).byType lists only XP-bearing types; every events parameter also accepts a view.
- offline/README.md, the guide, CLAUDE.md lines: none owed from this slice.

### Open questions
1. rank "explorer": built from ExplorerCompleted only; the all-12-items path waits for U-06's explorerDone(view).
2. net-weaver counts safetyNet contacts active or not; earnedAt = third net's at (or createdAt), null if no time.
3. Events without a parseable at or type are ignored; duplicate ids count once.
4. ExerciseDone earns 10 XP each time, no daily limit; lesson/tutorial/checkpoint events without an id count once under an empty key.
5. counters.tracking = a startDate is set; the settings opt-in is read by the UI.
6. Under Node, engine.js loads content-core.js then the other content-*.js in offline/src, sorted.
Also: helpful read as in C1.

### For the HUB at the merge
- Shared files touched: none. package.json and package-lock.json: unchanged.
- Conflicts to expect: none; only offline/src/engine.js and offline/tests/logic.test.mjs.
- Territory warnings: none.
- Browser tests for the quiet window: none from this lane.
- Evidence: C:/Users/ruchi/1-addic-wt/_logs/reports/engine/engine__units.md and engine__progress.md.
