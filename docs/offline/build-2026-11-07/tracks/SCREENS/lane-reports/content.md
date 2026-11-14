## content (SCREENS, 1-addic offline build): the slice report

State: READY (2026-11-14 12:13 IST, tip 8b61575; continued from cef8746c, V-10b and C1-381 built). Before: READY (2026-11-09 19:06 IST, tip c3349d1; continued from 6f2bd610, FIX-MARKERS built). Before: READY-SLICE (2026-11-09 14:42 IST, tip 96dd899; continued from 22db886d, V-23 built). Before: READY (2026-11-08 09:00 IST, tip eb38166; continued from 87582bd4, V-42 built). Before: READY at 4ae98eb (05:07, continued from 3bd5bf5d, V-10r built). Earlier: READY. Branch build/content, base 1ef2482e, tip 680f850. Date 2026-11-07 16:27 IST (earlier slice run 16:13: READY-SLICE at 065699b).
Commits 2026-11-09 14:42: 96dd899 content V-23: close the v1 LOWs C2, C3, C4 (one comment, one assert, the 'guide' id note).
Commits: 0bbb7e2 feat(content, U-31a): content-core safety asks and the additions line; 065699b feat(content, U-31a): M0-M3 exercises, the checkpoint and content.test.mjs.

2026-11-09 19:06 run (continued from 6f2bd610): FIX-MARKERS (tier 2), tip c3349d1, built.
Commits 6f2bd610..HEAD: c3349d1 fix(offline content): FIX-MARKERS mark the four safety blocks for clinical review (R-H-53).
Commits 2026-11-07: 7d90a41 U-31b; 14e464d U-29; b096545 U-30; a8640fe U-32; 680f850 U-33.

### Turn caps
One builder (batch U-31a): steps_used 26, returned a note. capHits 0.
2026-11-07 16:27 (continued from 065699b): batch U-31b+U-29 steps_used 29, tip 14e464d; batch U-30+U-32+U-33 steps_used 47, tip 680f850. capHits 0.
2026-11-08 05:07: batch V-10r steps_used 13, tip 4ae98eb. capHits 0. (V-10 at 5bdf5ab was built by the earlier paused run.)
2026-11-08 09:00: V-42 built (15600a9, eb38166); no builder step count was given to this report; capHits 0.
2026-11-09 14:42: V-23 (tier 2) built, tip 96dd899; no builder step count recorded; capHits 0.
2026-11-09 19:06: FIX-MARKERS built, batch steps_used 20, tip c3349d1. capHits 0.
2026-11-14 12:13: batch V-10b+C1-381 steps_used 11, tip 8b61575. capHits 0.

### Units
- U-31a (tier 1), 0bbb7e2 and 065699b, built. For a person: every Try it in Learn M0-M3 opens a real exercise (#/exercise/<id>?mode=tutorial&from=<lesson>): quick-reasons, signs-check, risk-factors (behind the sensitive skip card), help-request, motivation, balance, four-lenses, each with a cast example, hints and a "built" line. program-questions is reachable from the Workbook or a tool. Checkpoints m0-m3 ask their own two questions. The SOS Reasons Card fills from quick-reasons, balance and four-lenses. Closes: exercises as an array (ruled a), spiral pairs in catalogs.spiralPairs (ruled b), Content.copy.early left out (ruled b). R-C-13 (1)-(3) and R-C-18 done.
- Held or blocked: none. Still to build: none.
2026-11-07 16:27 run (continued from 065699b), tiers: U-31b 2, U-29 2, U-30 2, U-32 2, U-33 2.
- U-31b, 7d90a41: the remaining 27 exercises (3.8) plus checkpoint questions m4-m10. Every Try it in Learn now opens a real exercise; clinicalReview on anger, warning-sign and slip exercises. Engine field ids pinned in content.test.mjs.
- U-29, 14e464d: content-lessons-b.js, M4-M6 (6 lessons each), milestones self-expert and strategist.
- U-30, b096545 (regex tests fixed in a8640fe): content-lessons-c.js, M7 (6), M8 (6), M9 (5), M10 (4); milestones navigator, builder, guide; clinicalReview on every M9/M10 lesson; #/sos/urgent and #/sos/slip linked; M10 l4 opens #/workbook/plan.
- U-32, a8640fe: Content.practices (8: breathe ladder 5-30 no pacing cue, body-scan about 610 s, sober 5 steps, urge-surf, shower, eating, walking, beat), Content.games (12 sort, 3 red flags, 6 big-game scenes, 4 refusal x 3), Content.comebacks (3). R-C-9 review of ui-sos.js and ui-onboarding.js copy is in the hand-off notes.
- U-33, 680f850: Content.sample.generate(nowIso), seeded, every row sample:true, ids smp-; 14 cravings, 28 check-ins, 5 responses, 4 contacts (3 safetyNet, no numbers), 3 plans. Passes validateBackup and Actions.loadSample, so a person can load and erase sample data.
- Questions closed: M10 milestone id is the base rank 'guide' (C4).
2026-11-08 05:07 run (continued from 3bd5bf5d), tiers: V-10 1, V-10r 1. Commits 3bd5bf5d..HEAD: 4ae98eb content(V-10r): the status route flip to '#/status'; 5bdf5ab content(V-10): the status feature, its JIT tutorial and its help entry.
- V-10, 5bdf5ab: for a person, a Status page entry (features.status in content-core.js, reveal.m1 = ['status'] so the New dot shows), a short tour 'status' (status-scene, status-change, status-watch) and the help entry 'What is the status page?'. Words original, grade 6-8, promise no outcome; nothing goes down.
- V-10r, 4ae98eb: features.status.route and the help route now '#/status' (engine V-40c, 94c51632, adds the route; routeOfFeature reads only '#/' routes). Closes: route question (R-H-43).
- Held: none. Carried: m1.unlocks (content-lessons-a.js:58) stays []; no product effect, ui-learn unlocksOf merges reveal.
2026-11-08 09:00 run (continued from 87582bd4), tier: V-42 1. Commits 87582bd4..HEAD: eb38166 content V-42: the run words fit what today-track V-43 draws; 15600a9 content V-42: the quest-line "Your way", the daily objectives and the run, in words (R-O-6).
- V-42, 15600a9 and eb38166, built (content-quests.js, new). For a person: on Today they see "Your way", ten small steps in order, each opening one part of the app early; a few small things for today from a pool of 20 (8 done by doing them in the app, 12 by a tap), each growing one Harbor element; the run line "Days shown up: Now n, Best n, In all n", "Kept", "You came back." The first-run tour gains three optional steps after nav-today; Help gains three answers. Finishing m1 now lists the status page as unlocked (closes the earlier LOW C1). Nothing open today becomes locked. Original words, no outcome promise, no missed or in-a-row wording.
- Questions closed: V-Q10 (the unlock set) by R-S-20, ruled R-H-44. Held: none.
- 2026-11-09 V-23 (tier 2), 96dd899: closes v1 C2 (content-sample.js header now accurate: only 3 plans are dated after nowIso), C3 (sample test erases through the real Actions.eraseSample on the trunk, asserts erased.erased === count, meta 'sample' null, no rows left), C4 (comment at rank 'guide', content-core.js:133, M10 Graduate). Nothing changes for a person using the file; comments and one test only. No test name added, renamed or deleted. Closed: v1 C2, C3, C4. Held: none. V-10b waits for the owner's I6 answer (not started).
2026-11-09 19:06 run (continued from 6f2bd610), tier: FIX-MARKERS 2.
- FIX-MARKERS, c3349d1: the four safety blocks P-28, P-29, P-30, P-32 (content-core.js:431, 454, 464, 471) gain a trailing line comment marking them for clinical review. Nothing changes for a person using the file; Content is deep-equal to 6f2bd610; four lines gain a comment only. New test 'content FIX-MARKERS: the four safety blocks are marked and keep their shape' (content.test.mjs, 41 tests) finds the lines by their start and fails on the base at P-28. Markers are comments, not data flags, because a flag would change shapes ui-sos.js and ui-onboarding.js read. Questions closed: R-H-53. V-10b may change words if it keeps the comments. Held: none.
2026-11-14 12:13 run (continued from cef8746c), tiers: V-10b 1, C1-381 2. Commits cef8746c..HEAD: 8b61575 content C1-381; 58c4740 content V-10b.
- V-10b, 58c4740: I6 default under R-O-11 (brief said leave unbuilt; the build chat overrode it). Nothing changes for a person using the file: no number changed, no verify flag cleared. content-core.js:429 heading edited; FIX-MARKERS lines (431, 454, 464, 471) did not move. New test "content V-10b: every crisis number keeps its please-verify flag (the I6 default)" pins verify:true on all India and intl entries and opioidSafety plus the eleven number/alt/tel strings. Closes: open question 9 (default taken).
- C1-381, 8b61575: deleted the redundant aggregate assert in "content: all rows sample:true"; the per-store assert stays, so coverage is the same. Closes the V-23 check C1 LOW (question 8). Held: none.

### Contract changes
- Content.exercises (array, content-exercises.js, const C_ex). Ids: quick-reasons, signs-check, risk-factors (sensitive, no score), help-request, program-questions, motivation (artifact motivation, repeat), balance (pull, drawbacks, miss, benefits), four-lenses (problem, worries, why, different, believe), checkpoint ({id, title, book, kind:'reflect', modules:{m0..m3: 2 x {q, options:[{t, ok, why}]}}}). Consumers: ui-exercise.js exerciseFor, ui-learn.js checkpointQuestions, Actions.saveResponse, Engine reasonsCardSections, workbook-settings, the browser flow "lesson to artifact shown in SOS".
- Content.catalogs.spiral: "I'm hopeless." removed (7 left). Consumer: actions-sos.
- Content.catalogs.spiralPairs (new): 7 {thought, reply}, no crisis word. Consumer: actions-sos.
- Content.resources.opioidSafety (new): object {text, verify:true, clinicalReview:true}, not the contract's string[]. Consumer: actions-sos reads .text.
- Content.resources.intl.lines local-emergency item: tel '112' added.
- Content.catalogs.distortions labelling example changed (R-C-18).
- 2026-11-07 16:27: new Content.lessons m4-m10 (const C_b, C_c), Content.practices (map), Content.games, Content.comebacks, Content.sample {name, generate(nowIso)->{stores}}; checkpoint.modules m4..m10. No events or routes added.
- No events, routes, UI.pages entries or data-tour targets added. The additions line sits at the end of content-core.js.
2026-11-08: features.status.route is '#/status' (was '/status' in the contract); help entry route '#/status'. New features.status, JIT tutorial 'status', reveal.m1. No events.
2026-11-08 09:00 (V-42): new Content.questLine (10 ids ql-*), Content.objectives (20, ob-*), Content.runWords {header,current,best,total,kept,keptLine,cameBack,cameBackLine,graceLine}; Content.xp.ObjectiveDone 3, QuestLineStepDone 10; features questLine, objectives, run (tab today, '#/today') in reveal.always; JIT tutorials questLine, objectives, run (targets questline-card, objectives-card, run-line); tour target status-open; m1.unlocks ['status']. Deviation: no features for tools, games, Explorer, Harbor scenes or themes (R-H-44). Consumers: engine V-40, actions-sos V-41, today-track V-43, ui-status, game-tutorials V-44, tests-docs V-45. Shared: offline/build.mjs parts line 'content-quests.js' (line 22). No events or routes.
2026-11-09 19:06 (FIX-MARKERS): no contract change; no shape, event or route; four comments only.
2026-11-14: none. No shape, event or route. Contract line refs content-core.js:421-432 are stale; the resources block is at :429-475.

### Gates
VERIFIED 2026-11-07 (tips 065699b, 680f850): build and validate GREEN, test GREEN 10/10 then 31/31, guards RED only on baselined tour-target names; logs in _logs/gates/content/ (detail in content-report-annex.md).
VERIFIED 2026-11-08 (tips 4ae98eb, eb38166): build GREEN; test RED 30/3 then GREEN 40/0; validate RED 2 then GREEN; guards RED only on tour-target names that lift on merge; territory own plus one build.mjs parts line. Logs in _logs/gates/content/ (detail in content-report-annex.md).
VERIFIED 2026-11-09 19:06 (check run, tip c3349d1), logs in _logs/gates/content/:
- build GREEN, 1211702 B: build-20261109-191002.log
- test GREEN 41/0 (content.test.mjs): test-20261109-191004.log
- validate GREEN: validate-20261109-191021.log
- guards GREEN 5/0: guards-20261109-191021.log
ASSUMED: builder logs build-20261109-190823, test-190827, validate-190829, guards-190829. Not run: browser gate (no DOM change), full Node suite.
(Older gate detail moved to content-report-annex.md.)
VERIFIED 2026-11-14 (check run, tip 8b61575), logs in _logs/gates/content/: build GREEN 1213283 B build-20261114-121612.log; test GREEN 42/0 test-20261114-121614.log; validate GREEN validate-20261114-121614.log; guards GREEN 5/0 guards-20261114-121614.log. Territory cef8746c..HEAD: 2 files, 2 own, 0 shared, 0 errors, 0 warnings.
ASSUMED: builder logs build-20261114-121459, test-20261114-121459, validate-20261114-121501, guards-20261114-121501; npm test 764 is arithmetic (763 + 1), not a run. Not run: browser gate (no DOM change), full Node suite. offline/1-addic.html is modified by the build gate, uncommitted.

### Review gates
None.
2026-11-08: not a flagged lane, no reviewers run.
2026-11-08 09:00: not flagged, no reviewers run.
2026-11-09: not flagged, no reviewers run.
2026-11-09: no review findings (not flagged).
2026-11-09 19:06: not flagged, no review findings.
2026-11-14 12:13: not flagged, no reviewers run.
2026-11-14: no review findings (not flagged).

### Check
Verdict PASS at 065699b, 680f850, 4ae98eb, eb38166 (findings moved to content-report-annex.md; all kept there).
2026-11-09 14:42 run: PASS at 96dd899 (commits after 22db886d; one commit). Territory: 3 files, 3 own, 0 shared, 0 errors, 0 warnings.
- C1 LOW, V-23: content.test.mjs:381 repeats :380 (sampleRows is Object.values(st).flat(), so :380 always throws first). No fix SHA. Finder re-check: not run, open (note only).
2026-11-09 19:06 run: PASS at c3349d1 (commits after 6f2bd610; one commit).
- C1 LOW, FIX-MARKERS: commit trailers are 'Co-Authored-By: Claude Opus 5.5' only; PLAN.md:110 names Fable 5.1 and a Claude-Session line (the builder followed the session attribution instruction). merge_lane.py checks trailers on the merge message only. No fix SHA. Finder re-check: not run, open (note only). Earlier LOW C1 at content.test.mjs:381 stays.
2026-11-14 12:13 run: PASS at 8b61575 (commits after cef8746c; two commits). No findings. Both commits carry both trailers. Not checked: the accuracy of the India numbers (owner input I6), units merged before cef8746c.

### Review
Not a flagged lane: no reviewers run (also 2026-11-07 16:27).
2026-11-08 09:00: no review findings (not flagged).

### Safety and content marks
- 2026-11-07 16:27: clinicalReview: true on every M9/M10 lesson (content-lessons-c.js) and on the anger, warning-sign and slip exercises. SOS links #/sos/urgent and #/sos/slip in M9/M10. Sample contacts carry no phone numbers. Wording original, person-first.
- clinicalReview: true: content-core.js Content.resources.opioidSafety.
- verify: true: content-core.js Content.resources.opioidSafety; Content.resources.intl.lines[2] (tel 112). The clinical reviewer checks the opioid line; the owner confirms 112.
2026-11-08: V-10 copy is original, promises no outcome, no SOS gating; no new clinicalReview or verify marks.
2026-11-08 09:00: V-42 copy original, grade 6-8 by reading, no outcome promise, no substance or sober-day words, no SOS gating (SosCompleted never counts); no clinicalReview or verify marks added.
2026-11-09: V-23 touches comments and a test only; no copy, clinicalReview or verify marks changed. V-10b still waits for the owner.
2026-11-09 19:06: FIX-MARKERS adds comment markers on P-28, P-29, P-30, P-32 (content-core.js:431, 454, 464, 471): the four safety blocks that had none are now marked for the clinical reviewer. No word, number, url or verify flag changed. V-10b is to keep these comments.
2026-11-14: V-10b keeps every crisis number verify:true (I6 default, none confirmed), opioidSafety verify and clinicalReview kept; no copy changed. Changing any number later needs the owner and an update to the test literal.

### Requests for other lanes
- TO ENGINE (CORE), tests/engine-data.test.mjs: the two tests at :243 and :266 assumed Content.exercises absent; update them.
- TO learn owner, tests/learn.test.mjs:265: expects quick-reasons "Not available yet"; update.
- TO actions-sos: read Content.resources.opioidSafety.text; use catalogs.spiralPairs.
- Engine keys to keep: quick-reasons reasons/quick, balance drawbacks/benefits, four-lenses different; never make balance one matrix2x2 field.
- 2026-11-07 16:27 TO actions-sos: actions.test.mjs:304 expects loadSample to refuse 'no-sample'; Content.sample now exists, update. TO learn owner: learn.test.mjs:424 and :539 assume m7 / stops[4] not loaded; update. HUB: baseline the 3 new names. Not edited from this lane.
- Contracts/content.md: update opioidSafety shape.
2026-11-08: none. Merge after engine V-40c (94c51632) so '#/status' and the status-change/status-watch targets exist.
2026-11-08 09:00 TO engine (CORE): update engine-questline.test.mjs:461 to run its first assertion inside withContent (FIX-RS27). Targets objectives-card, questline-card, run-line are drawn by today-track on trunk (ui-today.js:567,580,598). Keep cameBackLine 'You came back.' and run words short labels.
2026-11-09: none.
2026-11-09 19:06 TO HUB: CLINICAL-REVIEW-PACK.md goes stale once c3349d1 merges: NO MARKER tags at lines 275, 292, 297, 311; note at 273; count at 327 (38 markers becomes 42, content-core.js 1 becomes 5, 29 marked passages becomes 33); line 328 sentence about four kept without a marker goes. Line citations still hold (no line moved).
2026-11-14: none.

### Docs owed
See C:/Users/ruchi/1-addic-wt/_logs/reports/content-report-annex.md (2026-11-09: none new).

### Open questions
1. opioidSafety shape: default object {text, verify, clinicalReview}.
2. risk-factors hidden by default: default only sensitive: true; the Workbook decides visibility.
3. Neighbour test failures: default content stays as contracted; owners update tests; HUB baselines the three names.

4. 2026-11-07 16:27: clinical reviewer to confirm all clinicalReview passages (M9/M10, anger/warning/slip exercises, opioidSafety) and the sample profile; default shipped as written.
5. 2026-11-08: add status to m1.unlocks? Default no (reveal covers it).
(5 closed 09:00: m1.unlocks now ['status'].)
6. 2026-11-08 09:00: tools, games and scenes as quest rewards? Default no (R-S-20, R-H-44).
7. engine-questline.test.mjs:461: default engine lane updates it.
8. 2026-11-09: drop or fold content.test.mjs:381? Default leave (LOW). 9. V-10b waits for the owner's I6 answer; default nothing cleared.
10. 2026-11-09 19:06: trailer form on c3349d1 (Opus 5.5, no Claude-Session); default leave, amend only if the program wants it. V-10b: keep the four marker comments.
11. 2026-11-14: V-10b built as the I6 default, numbers unconfirmed; default kept until the owner confirms (then update the test literal). Questions 8 and 9 closed.

### For the HUB at the merge
No shared files touched; no package.json or package-lock.json changes; no conflicts expected; no territory warnings. offline/1-addic.html was regenerated by the build gate and left uncommitted: do not merge it from this lane. Baseline the three neighbour test names until owners fix them. Browser tests to run in the quiet window: the flow "lesson to artifact shown in SOS" and the learn gallery test.

2026-11-07 16:27: merge tip 680f850; offline/1-addic.html stays uncommitted. Baseline the three new failing names (C1). Browser tests in the quiet window: Learn M0 to M10 and sample load/erase.
2026-11-08: merge tip 4ae98eb only after engine 94c51632; on the branch alone test/validate/guards are RED by name (see Gates), green on the merged tree. 1-addic.html stays uncommitted.
2026-11-08 09:00: merge tip eb38166 after today-track V-43 and engine V-40 are on trunk; the three tour-target guard names are RED on the branch alone and lift on merge. Expect one engine test red until FIX-RS27 (C1). build.mjs: one parts line; 1-addic.html stays uncommitted.
2026-11-09: merge tip 96dd899; 3 own files, no shared; offline/1-addic.html stays uncommitted. V-10b not started.
2026-11-09 19:06: merge tip c3349d1; 2 own files, no shared; 1-addic.html is modified in the worktree by the gate build, do not merge it; restore before reuse. No browser test needed. Update CLINICAL-REVIEW-PACK.md after the merge (see Requests).
2026-11-14: merge tip 8b61575 (58c4740, 8b61575); no shared files; offline/1-addic.html stays uncommitted. Expected npm test 764.

