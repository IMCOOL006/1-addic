## engine (CORE, 1-addic offline build): the lane report

State: READY. Branch build/engine, worktree C:/Users/ruchi/1-addic-wt/engine. Base 3fbd08f6 (CONTINUED from 3fbd08f6; this run built FIX-RS27, 2026-11-08 09:34 IST, check judged only commits after 3fbd08f6). Tip 97ac73a. Before: READY 1d4dfd2 (V-19, V-30, 07:16), READY 4330d9f (V-40c, 04:38), READY 660233f (V-40b, 04:02), READY-SLICE 03840ef (V-40, 03:24). Earlier: base 655516dc, tip 84075b6, READY, 2026-11-07 22:08 IST.
Commits 3fbd08f6..HEAD, 2026-11-08 (09:34 run):
- 97ac73a test(engine, FIX-RS27): XP test reads the real Content.xp rows (R-S-27, R-H-45)
Commits f69bc68a..1d4dfd2, 2026-11-08:
- 1d4dfd2 feat(engine, V-30): export Engine.tutorialDone(view, tid, allowSkipped)
- 64136cd feat(engine, V-19): spiralThoughts pairs carry own (FIX-SPIRAL-OWN, V3-19, ruled 02:24)
- 4330d9f feat(engine, V-40c): two known routes, #/status and #/track/radar (R-S-24, R-C-57, R-H-43)
- 660233f feat(engine, V-40b): Engine.growthItems, the units growth counts (R-S-22, R-C-51)
- 03840ef fix(engine, V-40 C1): a logged slip is never a day shown up
- 6723893 feat(engine, V-40): quest-line, unlocked, daily objectives, growth, run (R-O-6, the slice)
Commits 655516dc..84075b6 (2026-11-07): listed in engine-report-annex.md.

### Turn caps
- 07:29 run: builder [U-05]: steps_used 17, returned a note (yes). capHits 0.
- 14:34 run: builder [U-07]: steps_used 24, note yes. Builder [U-08]: steps_used 17, note yes. capHits 0. (U-06 was built by the run before, stopped at the HUB's 10:42 pause.)
- 16:36 run: builder [FIX-RS4]: steps_used 13, note yes. capHits 0.
- 22:08 run: builder [FIX-RS9E]: steps_used 9, note yes. capHits 0.
- 2026-11-08 run: builder [V-40]: steps_used 14, note yes; check-fix builder (C1) note yes. capHits 0.
- 2026-11-08 04:02 run: builder [V-40b]: steps_used 11, note yes. capHits 0.
- 2026-11-08 04:38 run: builder [V-40c]: steps_used 12, note yes. capHits 0.
- 2026-11-08 07:16 run (builders ran in the 05:08 run, check 07:16): builders [V-19, V-30], steps not recorded here, notes yes; no builder this run. capHits 0.
- 2026-11-08 09:34 run: builder [FIX-RS27]: steps_used 10, note yes. capHits 0.

### Units
- U-05, U-06, U-07, U-08, FIX-RS4, FIX-RS9E (tier 1, built 2026-11-07: 04fc0c1, 6cb722e, f269942, 227a07a, 57153d3, 84075b6; R-sample/R-outcome b14c9a0): full text, what changed for a person and questions closed, in engine-report-annex.md.
- V-40 (tier 1, built, 6723893; check fix 03840ef; 2026-11-08; offline/src/engine.js block before "/* views", offline/tests/engine-questline.test.mjs). For a person: nothing on a screen yet. The engine now works out the quest line (steps unlock features), what is unlocked, three daily objectives with one swap, growth (days shown up; XP ObjectiveDone 5, QuestLineStepDone 20) and a run of days shown up with one grace day per Monday-week. A logged slip never counts as a day shown up. Details: engine__units.md.
  Questions closed: V-Q9 (one grace day per Monday-week, kept), V-Q11 (three a day, one swap), V-Q12 (shown-up set). Builder choices: shownUpDays extra export; growth(view, now?); swapped true after any ObjectiveSwapped that day; progress.have capped at need; ObjectiveDone counts on its date even if not in the day's draw.
  C1 fix 03840ef: slip rows (type slip, or LogCreated with payload.type slip) never add a day; logsOf unchanged. Red and green: engine__C1.redgreen.log. Gates 121/121.
- V-40b (tier 1, built, 660233f; 2026-11-08; offline/src/engine.js, offline/tests/engine-questline.test.mjs). For a person: nothing on a screen yet. The engine can now list each unit that growth counts (date, objective id, what it grows), oldest first, so the Today screen can show the units behind the growth number. growth and the list share one day walk, so they always agree in length. Closed: V-40b as briefed (R-S-22, R-C-51). Details: engine__units.md.
- V-40c (tier 1, built, 4330d9f; 2026-11-08; offline/src/engine.js ROUTE_PATHS ~:1385, offline/tests/engine-data.test.mjs). For a person: nothing on a screen yet; Help and Features can now point to the Status page and the Radar track without the content check rejecting them. Routes match the exact path before "?": #/status/nope, #/statusx, #/track/radarx, #/track/radar/2 stay unknown. Red before (3 tests fail, engine__V-40c.red.log), green after. Closed: V-40c as briefed (R-S-24, R-C-57, R-H-43). Content V-10r (SCREENS) may flip features.status.route and the help entry to #/status after the merge.
- V-19 (tier 2, built, 64136cd; 2026-11-08 05:08 run; offline/src/engine.js:733, logic.test.mjs:498-536, engine-roadmap.test.mjs). For a person: nothing on a screen yet; SOS self-talk pairs can now say whether the reply is the person's own words (own true) or the stock fill (own false). A reply of only spaces counts as not own. Closed: V-19 as briefed (FIX-SPIRAL-OWN, V3-19, ruled 02:24). Two engine-roadmap deepEqual checks gained own: true. Details: engine__units.md.
- V-30 (tier 2, built, 1d4dfd2; offline/src/engine.js:1804, logic.test.mjs:540-563). For a person: nothing on a screen yet; Engine.tutorialDone(view, tid, allowSkipped) is exported so the guidance prompts (ui-guidance.js) can ask whether a tour or drill is done; rule unchanged, agrees with the Explorer tour and drill. Closed: V-30 as briefed.
- FIX-RS27 (tier 1, built, 97ac73a; 2026-11-08 09:34 run; offline/tests/engine-questline.test.mjs:461-462, test-only). For a person: nothing changes; the file is the same. The XP test now expects 3*ObjectiveDone + 2*QuestLineStepDone from the real Content.xp rows, so it holds before and after content V-42 (eb38166) merges. Proof on a scratch copy of HEAD plus V-42's content-quests.js (rs27-scratch, outside the worktree): red before the fix (29 !== 0, 19 pass 1 fail, engine__FIX-RS27.red.log), green after (20/20, engine__FIX-RS27.green.log); npm test 616/616 on this tree (engine__FIX-RS27.npmtest.log). Closed: R-S-27, R-H-45. engine.js not touched.
- Held or blocked: none.
- Still to build on this lane: nothing named; read briefs/engine.md "## V3" if CORE names a further batch.

### Contract changes
All on `Engine` (browser global; require('offline/src/engine.js') under Node). No events, content keys, routes, UI.pages entries or data-tour targets added.
- ids/dates: id(), todayStr(now), dateStr(x), addDays(ds,n), daysBetween(a,b) (b minus a), weekStart(ds, weekStartsOn=1), fmtDate, fmtTime ("7:40 pm"), fmtDateTime ("7 Nov 2026, 7:40 pm"), hourOf(iso), isNight(now) (20:00 to 05:59). Consumers: all lanes.
- profile: term(profile) -> {word, days, adjective}; greeting(now, name); companionName(profile) (trimmed, max 40, default "Companion"). Consumers: today-track, actions-sos.
- game: xpFromEvents(events, now) -> {total, today, byType}; mastery(events); regionLevels(mastery); momentum(events, now) -> {days, of:14, dates[]}; rank(events, view) -> Content.ranks row | null; badges(view, now) -> [{id, earnedAt}]; modulesDone(events), lessonsDone(events) (Sets); counters(profile, slips, now) -> {tracking, total, current, nextMilestone, reached[]}; gameState(view, now). Consumers: today-track, game-tutorials (U-26), actions-sos (U-09).
- views: makeView({store:[rows]}) -> {get, list, count}; STORES.
- 14:34 run (U-07, U-08, sosOutcome) contract lines: engine-report-annex.md "Contract lines moved".
- 2026-11-08 V-40 (on Engine; for contracts/engine.md): questLine, unlocked, dailyObjectives, growth(view, now?), run, shownUpDays(view, now?) (extra), isProtectedFeature(x, content?). Events read: ObjectiveDone {id,date}, ObjectiveSwapped {from,to,date}, QuestLineStepDone {id}, FeatureUnlocked {feature,by}. Content read: questLine, objectives, xp.ObjectiveDone, xp.QuestLineStepDone, features[reward]. ONCE_FIELD.QuestLineStepDone=id. validateContent adds questLine (8 to 12 steps, no protected reward) and objectives (6 or more) checks.
- 2026-11-08 V-40b: Engine.growthItems(view, now?) -> [{date, id, grows}] (grows may be null); full text in engine-report-annex.md.
- 2026-11-08 V-40c: no new function; knownRoute and validateContent accept #/status and #/track/radar (3.5 route list; contracts/engine.md:104).
- 2026-11-08 V-19 (contract :65-67, :87): Engine.spiralThoughts(view) -> [{thought, reply, own}]; own is true only for the person's own non-empty trimmed reply (before stock fill). Consumers must not deepEqual {thought, reply}. ui-sos spiralPairs reads only thought/reply so is unaffected.
- 2026-11-08 V-30: Engine.tutorialDone(view, tid, allowSkipped) exported (rule unchanged, was internal). Consumer ui-guidance.js.
- 2026-11-08 FIX-RS27: no contract change; test-only.

### Gates
Gates of the 03:24 and 04:02 runs and the 2026-11-07 commit list: see engine-report-annex.md.
VERIFIED 04:38 run (127/127, all GREEN at 4330d9f): logs in engine-report-annex.md.
ASSUMED (2026-11-08 04:38): browser gate not run (route table only); mutation proof not run.
ASSUMED (2026-11-08 04:02): browser gate not run (engine-only unit); mutation proof of the new tests not run (read-only checker; judged by reading).
ASSUMED (2026-11-08): browser gate not run (no browser tests); growth monotone under backup import with past dates not tested.
VERIFIED (2026-11-08 07:16 run, check at 1d4dfd2):
- build GREEN pass=1, 1129883 B. log C:/Users/ruchi/1-addic-wt/_logs/gates/engine/build-20261108-072204.log
- test GREEN, 133 pass, 0 fail, 0 skip, 6 files. log C:/Users/ruchi/1-addic-wt/_logs/gates/engine/test-20261108-072214.log
- validate GREEN C:/Users/ruchi/1-addic-wt/_logs/gates/engine/validate-20261108-072852.log; guards GREEN, 5 pass C:/Users/ruchi/1-addic-wt/_logs/gates/engine/guards-20261108-072854.log
- Builder gates 05:22 to 05:28 (133/133): build-20261108-052219, test-20261108-052238, validate-20261108-052830, guards-20261108-052832 (same folder).
ASSUMED (2026-11-08 07:16): browser gate not run (no browser tests); offline/tests/actions.test.mjs not run (read: ui-sos.js:341-355 reads only thought and reply; the test uses stubs).
VERIFIED (2026-11-08 09:34 run, check at 97ac73a):
- build GREEN pass=1, 1184473 B. log C:/Users/ruchi/1-addic-wt/_logs/gates/engine/build-20261108-100304.log
- test GREEN, 133 pass, 0 fail, 0 skip, 6 files. log C:/Users/ruchi/1-addic-wt/_logs/gates/engine/test-20261108-100315.log
- validate GREEN C:/Users/ruchi/1-addic-wt/_logs/gates/engine/validate-20261108-100717.log; guards GREEN, 5 pass C:/Users/ruchi/1-addic-wt/_logs/gates/engine/guards-20261108-100722.log
- Builder gates 09:47 to 09:48: build-20261108-094754, test-20261108-094807, validate-20261108-094814, guards-20261108-094816 (same folder). npm test 616/616.
- Red/green on the merged scratch tree: engine__FIX-RS27.red.log:126, .green.log:125 (read, not re-run by the checker).
ASSUMED (2026-11-08 09:34): browser gate not run (test-only change); the merged scratch run was not re-run by the checker.
Earlier runs' gates: see engine-report-annex.md (logs in C:/Users/ruchi/1-addic-wt/_logs/gates/engine/).
Territory (2026-11-08): engine f69bc68a..HEAD: 2 files, both own (engine.js, engine-questline.test.mjs); 0 shared, 0 nobody's, 0 errors, 0 warnings; both commits carry both trailers. Earlier: 22:08 6 files own; 16:36 5 own; 14:34 5 own; all 0 shared, 0 errors.
Territory (2026-11-08 09:34): engine 3fbd08f6..HEAD: 1 file, own (engine-questline.test.mjs); 0 shared, 0 nobody's, 0 errors, 0 warnings; engine.js not touched; 97ac73a has both trailers. Earlier territory lines: engine-report-annex.md.

### Review gates
None. Not a flagged lane (reviewGates empty).

2026-11-08 03:24 IST: Verdict FIX at 6723893, fixed at 03840ef (judged commits after f69bc68a). V-40 present, meets brief items 1-4 and 6-11. U-05 to U-08, FIX-RS4, FIX-RS9E counted present only through the test gate.
- C1 MEDIUM (V-40, engine.js:1583 shownUpOver): a slip log row counted as a day shown up, against contract :84 and R-C-50. Fix 03840ef. Finder's re-check: FIXED (engine.js:1580-1588). Evidence: _logs/reports/engine/scratch/slipprobe.log. No new findings.
2026-11-08 04:02 IST: Verdict PASS at 660233f (judged commits after 03840ef). V-40b present, meets acceptance (growthItems engine.js:1704-1715, exported :1801, shares growthWalk :1687; tests engine-questline.test.mjs:369-454). V-40 still present; growthOver now calls growthWalk with the same count. No findings (none open, none fixed). Not checked: browser gate; mutation proof; the open CORE slip question (a policy call); earlier units.
2026-11-08 04:38 IST: Verdict PASS at 4330d9f (judged commits after 660233f). V-40c present (ROUTE_PATHS engine.js:1385; neighbours rejected; validateContent accepts routed help, feature, tip). No findings (none open, none fixed). Not checked: browser gate; U-05 to V-40b not re-judged; UI/copy/SOS rules (diff adds two route strings and tests).
2026-11-08 07:16 IST: Verdict PASS at 1d4dfd2 (judged commits after 4330d9f). V-19 present (engine.js:733; one test per branch, logic.test.mjs:498-536). V-30 present (export engine.js:1804; test fails if export missing; consumer ui-guidance.js:132 resolves). No findings (none open, none fixed). Not checked: browser gate; actions.test.mjs not run; earlier units not re-judged.
2026-11-08 09:34 IST: Verdict PASS at 97ac73a (judged commits after 3fbd08f6). FIX-RS27 present and meets its brief (engine-questline.test.mjs:461-462; test name unchanged; test can still fail: red 29 !== 0 on the merged tree, green after). No findings (none open, none fixed). Not checked: browser gate; U-05 to V-30 not re-judged (merged before base); product rules (no product code in the diff); merged scratch run not re-run.
Not checked (2026-11-08): browser gate; U-05 to U-08, FIX-RS4, FIX-RS9E not re-judged; growth under past-dated backup import.

### Check
2026-11-07 checks (07:29, 14:34, 16:36, 22:08 IST, all PASS; C1 fixed 3ed6e1d; C2, C3 LOW open defaults; C4 LOW CORE to write the U-07 contract): full text in C:/Users/ruchi/1-addic-wt/_logs/reports/engine-report-annex.md.

### Review
Not a flagged lane: no reviewers run (also 2026-11-08 09:34). Open review findings: 0; check findings this run: none.

### Safety and content marks
Engine.CRISIS = {clinicalReview: true, patterns[]}: the crisis phrase list needs the clinical reviewer (RS2/RS10). crisisKeywords never gates SOS; SOS stays ungated. No resources marked verify: true. Engine strings are greetings, the default companion name, plain-language import errors, and weekly-summary highlights (no score, no XP, no "overdue"). validateContent enforces the tone rules ("addict" never as a noun in the app's voice). 2026-11-08 V-40: no person-facing strings, no clinicalReview or verify passages; SOS stays ungated (isProtectedFeature keeps SOS out of any reward). 2026-11-08 V-19, V-30: no person-facing strings added; own only labels self-talk replies; SOS stays ungated. 2026-11-08 FIX-RS27: test-only; no strings, no SOS or crisis change.

### Requests for other lanes
- actions-sos: use Engine.guideSequence and Engine.SOS_TOOLS, and crisisKeywords as string[].
- workbook-settings: call validateBackup before migrateBackup; pass meta to exportBackup.
- HUB: FIX-RS9E needs no action beyond the merge (engine.js and one new test only).
- HUB: at the merge lift the two baselined names (engine-data 'validateContent: the tryIt exercise check waits for Content.exercises, then runs' and 'knownRoute: the 3.5 route table, by path').
- 2026-11-08 V-19: actions-sos/SCREENS: do not deepEqual engine spiralThoughts output on {thought, reply}; read own.
- CORE: write the U-07 and U-08 contract lines above into contracts/engine.md (C4).
- 2026-11-08 CORE: add the V-40 contract lines above to contracts/engine.md; add the four events to BUILD-PLAN 3.4. Screens lanes: use Engine.run, growth, dailyObjectives; never filter slips yourself.
- 2026-11-08 V-40c: content V-10r (SCREENS) may route features.status and help to #/status once merged.
- 2026-11-08 FIX-RS27: HUB: V-42 (eb38166) is already merged (trunk ab784c9a); merge 97ac73a so engine-questline stays green on trunk (29 !== 0 otherwise). No lane request else.

### Docs owed
- Earlier owed lists (to 2026-11-08 07:16): see engine-report-annex.md "Docs owed (moved)". FIX-RS27 owes none.

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
11. (V-19) A reply of only spaces counts as none (own false). Default taken. (V-30) ui-guidance.js:592 calls tutorialDone(view,'tour',true), so a skipped tour counts as done for the tour prompt: the guidance's choice, unchanged.
12. (FIX-RS27) none new; the test reads Content.xp whichever rows content carries. Default taken.

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
- 2026-11-08 07:16 V-19, V-30: engine.js, logic.test.mjs, engine-roadmap.test.mjs (own: true in two checks); no shared file; no conflicts expected. Do not commit the rebuilt offline/1-addic.html. Tests on this lane: 133. Evidence: engine__units.md.
- 2026-11-08 09:34 FIX-RS27: offline/tests/engine-questline.test.mjs only; no shared file; no conflicts expected; merge it with or before V-42 on any tree where V-42 is present. npm test 616/616 on this tree. Evidence: engine__units.md, engine__FIX-RS27.{npmtest,red,green}.log.
