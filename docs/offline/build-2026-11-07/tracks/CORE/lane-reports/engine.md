## engine (CORE, 1-addic offline build): the lane report

State: READY. Branch build/engine, worktree C:/Users/ruchi/1-addic-wt/engine. Base 655516dc. Tip 227a07a. Run time 2026-11-07 14:34 IST. (Earlier: READY-SLICE at 04fc0c1, 2026-11-07 07:29 IST.)
Commits (655516dc..HEAD), 2026-11-07 14:34 IST:
- 227a07a feat(engine, U-08): export, import, migrate, .ics, AppError, validateContent
- f269942 feat(engine, U-07): insights, radar, planner, review, SOS guide sequence, crisis keywords
- b14c9a0 fix(engine, R-sample and R-outcome): CORE rulings of 10:45 built by name
- 6cb722e feat(engine, U-06): roadmap, reveal, Explorer, tips, quests, artifacts, Recovery Plan prefill
- 3ed6e1d fix(engine, U-05 C1): helpful reads true/false and 0/1 only
- 04fc0c1 feat(engine, U-05): ids, dates, profile and the 3.7 game derivations

### Turn caps
- 07:29 run: builder [U-05]: steps_used 17, returned a note (yes). capHits 0.
- 14:34 run: builder [U-07]: steps_used 24, note yes. Builder [U-08]: steps_used 17, note yes. capHits 0. (U-06 was built by the run before, stopped at the HUB's 10:42 pause.)

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
- Held or blocked: none.
- Still to build on this lane: none.

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

### Gates
VERIFIED (check run at 227a07a, 14:34 IST):
- test GREEN, 102 pass, 0 fail across 4 files. log C:\Users\ruchi\1-addic-wt\_logs\gates\engine\test-20261107-151456.log
- validate GREEN, validateContent returns [] on the base (errors=0). log C:\Users\ruchi\1-addic-wt\_logs\gates\engine\validate-20261107-151459.log
- guards GREEN, 2 pass (csp, theme parity, tutorial targets skipped: no build, styles.css or ui-*.js). log C:\Users\ruchi\1-addic-wt\_logs\gates\engine\guards-20261107-151501.log
- build SKIP: offline/build.mjs absent on the branch, as in the baseline. log C:\Users\ruchi\1-addic-wt\_logs\gates\engine\build-20261107-151456.log
- Earlier (04fc0c1): test GREEN 33 (test-20261107-073550.log), guards GREEN (guards-20261107-073553.log), build SKIP, validate SKIP.
ASSUMED: browser and docs gates do not apply to this lane (no browser tests; the brief says so). Not run: npm test through package.json on the branch (none at 655516dc); the builder's proof is engine__npm-test-proof.log.
Territory (14:34 IST): check_territory engine 655516dc..HEAD: 5 files, all the lane's own (engine.js, logic.test.mjs, engine-data, engine-insights, engine-roadmap tests); 0 shared, 0 nobody's, 0 errors, no warnings. No package.json, build.mjs, content or browser-test edits. No logs, node_modules or scratch in the commits after 04fc0c1. All five commits carry both trailers.

### Review gates
None. Not a flagged lane (reviewGates empty).

### Check
2026-11-07 07:29 IST: Verdict PASS at 04fc0c1.
- C1 LOW (U-05, engine.js helpfulValue): 1 on a 1-5 scale read as true while 2 read 0.25. Fix 3ed6e1d (true/false and 0/1 only). Finder's re-check: confirmed at 14:34, test logic.test.mjs:227-232.
- C2 LOW (U-05, net-weaver): counts safetyNet contacts active or not (3.7 line 185 says active). Default documented; no fix; not re-checked.
2026-11-07 14:34 IST: Verdict PASS at 227a07a (judged commits after 04fc0c1).
- U-06 present (6cb722e), R-sample/R-outcome present (b14c9a0), U-07 present (f269942), U-08 present (227a07a), as in Units.
- C3 LOW (U-08, engine.js:1427,1470 WHOLE_QUOTE_RE; base text content-core.js:323): the tone rule says never "addict" as a noun; validateContent skips any string wholly one quotation, so any future quoted line passes the same way. Deliberate builder exemption, asserted at engine-data.test.mjs:256-262. No fix SHA; open, for the content owner to confirm.
- C4 LOW (U-07, contracts/engine.md:26,44; brief engine.md:54): the contract still says crisisKeywords returns boolean and the brief says SOBER always present; code returns string[] and puts 'wave' first. No code fix; CORE to write the contract change above. Evidence: engine.js:1164-1200; engine-insights.test.mjs:264-304.
Not checked: browser gate; npm test through package.json; line-by-line review of U-06 artifact and prefill helpers (spot-checked only); clinical review of CRISIS_PATTERNS (needs the clinical reviewer; compared only with the RS2/RS10 lists, which it covers).

### Review
Not a flagged lane: no reviewers run. Open review findings: 0.

### Safety and content marks
Engine.CRISIS = {clinicalReview: true, patterns[]}: the crisis phrase list needs the clinical reviewer (RS2/RS10). crisisKeywords never gates SOS; SOS stays ungated. No resources marked verify: true. Engine strings are greetings, the default companion name, plain-language import errors, and weekly-summary highlights (no score, no XP, no "overdue"). validateContent enforces the tone rules ("addict" never as a noun in the app's voice).

### Requests for other lanes
- actions-sos: use Engine.guideSequence and Engine.SOS_TOOLS, and crisisKeywords as string[].
- workbook-settings: call validateBackup before migrateBackup; pass meta to exportBackup.
- CORE: write the U-07 and U-08 contract lines above into contracts/engine.md (C4).

### Docs owed
- tracks/CORE/contracts/engine.md (the lane cannot write there): the 07:29 notes (counters.total counts COMPLETED local dates; a banked day stays counted; current is the only number a slip restarts; reached milestones never un-reach; no XP for days; SkillUsed.helpful boolean, reader accepts true/false and 0/1; xpFromEvents.byType lists XP types only; events parameters accept a view) plus the 14:34 Contract changes above.
- validateContent skips the tryIt-exercise check while Content.exercises is absent.
- offline/README.md, the guide, CLAUDE.md lines: none owed.

### Open questions
1. rank "explorer": ExplorerCompleted or the all-12 path via explorerDone(view) (built in U-06).
2. net-weaver counts safetyNet contacts active or not (C2).
3. Events without a parseable at or type are ignored; duplicate ids count once.
4. ExerciseDone earns 10 XP each time, no daily limit.
5. counters.tracking = a startDate is set; the settings opt-in is read by the UI.
6. Under Node, engine.js loads content-core.js then the other content-*.js in offline/src, sorted.
7. Whole-quotation exemption in validateContent (C3): kept; confirm.
8. guideSequence always starts with 'wave' (SOBER runs inside it): default taken.

### For the HUB at the merge
- Shared files touched: none. package.json and package-lock.json: unchanged (branch has none).
- Conflicts to expect: none; only offline/src/engine.js and the tests logic.test.mjs, engine-data, engine-insights, engine-roadmap.
- Territory warnings: none.
- Browser tests for the quiet window: none from this lane.
- After merge run npm test on build/offline-v1 (102 expected).
- Evidence: C:/Users/ruchi/1-addic-wt/_logs/reports/engine/engine__units.md, engine__progress.md, engine__npm-test-proof.log.
