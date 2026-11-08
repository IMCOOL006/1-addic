## content (SCREENS, 1-addic offline build): the slice report

State: READY (2026-11-08 05:07 IST, tip 4ae98eb; continued from 3bd5bf5d, V-10r built). Earlier: READY. Branch build/content, base 1ef2482e, tip 680f850. Date 2026-11-07 16:27 IST (earlier slice run 16:13: READY-SLICE at 065699b).
Commits: 0bbb7e2 feat(content, U-31a): content-core safety asks and the additions line; 065699b feat(content, U-31a): M0-M3 exercises, the checkpoint and content.test.mjs.
Commits 2026-11-07 16:27: 7d90a41 U-31b exercises M4-M10 and checkpoints; 14e464d U-29 lessons M4-M6; b096545 U-30 lessons M7-M10; a8640fe U-32 practices, games, comebacks (also repairs 9 regex tests in U-30); 680f850 U-33 sample profile.

### Turn caps
One builder (batch U-31a): steps_used 26, returned a note. capHits 0.
2026-11-07 16:27 (continued from 065699b): batch U-31b+U-29 steps_used 29, tip 14e464d; batch U-30+U-32+U-33 steps_used 47, tip 680f850. capHits 0.
2026-11-08 05:07: batch V-10r steps_used 13, tip 4ae98eb. capHits 0. (V-10 at 5bdf5ab was built by the earlier paused run.)

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

### Gates
VERIFIED (check run, tip 065699b):
- GATE build GREEN: C:\Users\ruchi\1-addic-wt\_logs\gates\content\build-20261107-162140.log
- GATE test GREEN 10/10 (content.test.mjs): ...\test-20261107-162141.log
- GATE validate GREEN: ...\validate-20261107-162142.log
- GATE guards RED, only the 15 "guard: tour-target" names (quicklog-button through plan-print), all in coordination/baselines.md, so no new failure: ...\guards-20261107-162143.log
- Territory: 3 files changed, 3 own, 0 shared, 0 nobody's, 0 errors, 0 warnings.
VERIFIED 2026-11-07 16:27 (check run, tip 680f850), logs in C:/Users/ruchi/1-addic-wt/_logs/gates/content/:
- build GREEN: build-20261107-165642.log
- test GREEN 31/31: test-20261107-165645.log
- validate GREEN: validate-20261107-165651.log
- guards RED 4 pass / 15 fail, all baselined tour-target names: guards-20261107-165653.log
- Territory 1ef2482e..HEAD: 7 files, 7 own, 0 shared, 0 nobody's, 0 errors, no warnings; trailers on all new commits.
ASSUMED: builder logs build-20261107-165030, test-165034, validate-165037, guards-165038 (same folder) and ../reports/content/content__node-suite-1650.log (6 fail by name). Not run: browser gate; reading level judged by reading.
ASSUMED (earlier run): the builder's own earlier gate logs (build-20261107-161923, test-161924, validate-161925, guards-161925, same folder). Not run: browser gate (no browser tests added) and the full npm test across neighbour files.
VERIFIED 2026-11-08 (check run, tip 4ae98eb), logs in C:/Users/ruchi/1-addic-wt/_logs/gates/content/:
- build GREEN: build-20261108-052946.log
- test RED 30/3: test-20261108-052950.log (three names, all from missing '#/status' in the 3bd5bf5d engine route table; HUB ruling 04:41; not this lane)
- validate RED 2: validate-20261108-052954.log (features.status.route, help[13].route, same cause)
- guards RED 4/2: guards-20261108-052956.log (tour-target status-change, status-watch; lift on merge, trunk ui-status.js:288,:310)
- Territory 3bd5bf5d..HEAD: 2 own, 0 shared, 0 errors; trailers present.
- Merged scratch tree (94c51632 plus the two files): 60/60, validateContent 0 errors: C:/Users/ruchi/1-addic-wt/_logs/reports/content/content__v10r_scratch.log
ASSUMED: builder logs build-20261108-051239, test-051256, validate-051400, guards-051402; browser-20261108-051742.log GREEN 16/0/3 (not re-run by check).

### Review gates
None.
2026-11-08: not a flagged lane, no reviewers run.

### Check
Verdict PASS at 065699b.
- C1 MEDIUM: three neighbour tests assumed Content.exercises absent and now fail by name (engine-data.test.mjs:243 and :266; learn.test.mjs:265). No fix SHA; owners update, HUB baselines until then. Open.
- C2 LOW: opioidSafety built as an object, not string[] (content-core.js:519-523). Allowed; actions-sos told to read .text; contract file still to update. Open.

2026-11-07 16:27 run: PASS at 680f850 (commits after 065699b).
- C1 MEDIUM, U-30/U-33 (other lanes' tests): actions.test.mjs:304 'validation failures write nothing' (expects no-sample), learn.test.mjs:424 'map progress from events', :539 'M0 plays end to end' fail now content exists; not in baselines.md. No fix SHA (owners update). Finder re-check: not run, open.
- C2 LOW, U-33: content-sample.js:6 header says nothing dated after nowIso but plans are 1-3 days ahead. No fix SHA. Open.
- C3 LOW, U-33: content.test.mjs sample test's erase assertion is implied by the sample:true loop; Actions.eraseSample absent at base. No fix SHA. Open.
- C4 LOW, U-30: brief says 'M10 Graduate'; milestone is base id 'guide'. Correct as built. Open (note only).
2026-11-08 05:07 run: PASS at 4ae98eb (commits after 3bd5bf5d).
- C1 LOW, V-10: m1 unlocks stays [] (content-lessons-a.js:58); no product effect. No fix SHA. Finder re-check: not run, open.

### Review
Not a flagged lane: no reviewers run (also 2026-11-07 16:27).

### Safety and content marks
- 2026-11-07 16:27: clinicalReview: true on every M9/M10 lesson (content-lessons-c.js) and on the anger, warning-sign and slip exercises. SOS links #/sos/urgent and #/sos/slip in M9/M10. Sample contacts carry no phone numbers. Wording original, person-first.
- clinicalReview: true: content-core.js Content.resources.opioidSafety.
- verify: true: content-core.js Content.resources.opioidSafety; Content.resources.intl.lines[2] (tel 112). The clinical reviewer checks the opioid line; the owner confirms 112.
2026-11-08: V-10 copy is original, promises no outcome, no SOS gating; no new clinicalReview or verify marks.

### Requests for other lanes
- TO ENGINE (CORE), tests/engine-data.test.mjs: the two tests at :243 and :266 assumed Content.exercises absent; update them.
- TO learn owner, tests/learn.test.mjs:265: expects quick-reasons "Not available yet"; update.
- TO actions-sos: read Content.resources.opioidSafety.text; use catalogs.spiralPairs.
- Engine keys to keep: quick-reasons reasons/quick, balance drawbacks/benefits, four-lenses different; never make balance one matrix2x2 field.
- 2026-11-07 16:27 TO actions-sos: actions.test.mjs:304 expects loadSample to refuse 'no-sample'; Content.sample now exists, update. TO learn owner: learn.test.mjs:424 and :539 assume m7 / stops[4] not loaded; update. HUB: baseline the 3 new names. Not edited from this lane.
- Contracts/content.md: update opioidSafety shape.
2026-11-08: none. Merge after engine V-40c (94c51632) so '#/status' and the status-change/status-watch targets exist.

### Docs owed
2026-11-07 16:27: the guide can describe all lessons, practices, games and the sample profile. Earlier: none for this unit; the guide can describe the M0-M3 exercises later.
2026-11-08: the guide can describe the Status page entry and its tour.

### Open questions
1. opioidSafety shape: default object {text, verify, clinicalReview}.
2. risk-factors hidden by default: default only sensitive: true; the Workbook decides visibility.
3. Neighbour test failures: default content stays as contracted; owners update tests; HUB baselines the three names.

4. 2026-11-07 16:27: clinical reviewer to confirm all clinicalReview passages (M9/M10, anger/warning/slip exercises, opioidSafety) and the sample profile; default shipped as written.
5. 2026-11-08: add status to m1.unlocks? Default no (reveal covers it).

### For the HUB at the merge
No shared files touched; no package.json or package-lock.json changes; no conflicts expected; no territory warnings. offline/1-addic.html was regenerated by the build gate and left uncommitted: do not merge it from this lane. Baseline the three neighbour test names until owners fix them. Browser tests to run in the quiet window: the flow "lesson to artifact shown in SOS" and the learn gallery test.

2026-11-07 16:27: merge tip 680f850; offline/1-addic.html stays uncommitted. Baseline the three new failing names (C1). Browser tests in the quiet window: Learn M0 to M10 and sample load/erase.
2026-11-08: merge tip 4ae98eb only after engine 94c51632; on the branch alone test/validate/guards are RED by name (see Gates), green on the merged tree. 1-addic.html stays uncommitted.
