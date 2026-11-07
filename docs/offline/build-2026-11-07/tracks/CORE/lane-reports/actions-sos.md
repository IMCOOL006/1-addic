## actions-sos (CORE, 1-addic offline build): the lane report

State: READY at 1cfc936 (2026-11-07 17:10 IST: run built nothing; check PASS at 5c2e7a7; round 5 RS24, RS29-RS32, RS22T all FIXED by the finder re-check; one new MEDIUM regression and one LOW noted, see Review round 5). Earlier: RED at 5c2e7a7 (16:20); READY at 1131827. Branch build/actions-sos (worktree C:/Users/ruchi/1-addic-wt/actions-sos). Base 655516dc. Tip 1cfc936 (1cfc93611abe123c94ff7bda851f99fd8fe6896f; continued from 5c2e7a7; before that 1131827; before that a8dce5a; updated 2026-11-07 15:46 IST; a8dce5a5c4c1aa87d1dbf55d072b742e75bef393 was the tip at 14:23; the earlier slice state was READY-SLICE at 1cb96a3, 08:26 IST). Units: U-09, U-10, U-11, FIX-SAFETY-AS, FIX-ONB-EMO, FIX-R2-SAFETY, FIX-R2-REST. Held: none.
Commits (655516dc..HEAD, newest first):
- 1cfc936 test(FIX-R5 RS22T): RS22's test names and drives its one case left
- 5585c65 fix(FIX-R5 RS32): the eight phrases that reached only the lead open the crisis view
- 0a7fe20 fix(FIX-R5 RS31): painkillers, paracetamol, medicines, capsules, a whole bottle of pills open the overdose card
- 46083fe fix(FIX-R5 RS30): the focused step title is described by the lead line
- 7c21ffd fix(FIX-R5 RS24): the lead always has a number to tap, in every region
- 27b4f3b fix(FIX-R5 RS29): a line with tel and no number is one tap in every list
- 5c2e7a7 fix(FIX-R4 RS27): a kept save dropped after the unlock says This was not saved.
- bd75f79 fix(FIX-R4 RS26): a save whose notebook was erased or replaced is dropped, never retried or kept
- d81a461 fix(FIX-R4 RS28): typed overdose words open the overdose card and announce the first line
- fd40b5d fix(FIX-R4 RS25): typed took too many pills or used too much opens urgent help with the overdose card
- c7abff1 fix(FIX-R4 RS24): whatever is typed on Something else, the numbers sit above the steps
- 1131827 fix(FIX-R3 RS20): while the PIN is being set, Next and Skip wait and say so
- 5e820b7 fix(FIX-R3 RS21): a slip kept for the unlock says It goes in your log when you unlock.
- e2e1017 fix(FIX-R3 RS22): a save refused LOCKED on an open notebook is tried once more, at once
- d2be169 fix(FIX-R3 RS23): typed overdose words open the full urgent view with the overdose card
- 1a9c1ec fix(FIX-R3 RS19): typed death wishes and better off without me go to the numbers
- a8dce5a fix(FIX-R2-REST C3): motivation slider gets a confirm button that keeps the shown value
- a060d95 fix(FIX-R2-REST C2): a save kept for the unlock is dropped when the notebook is erased or replaced
- 1068c5f fix(FIX-R2-REST RS17): with a PIN set, the privacy step says so, no PIN fields
- b7fd04f fix(FIX-R2-REST RS16): #/sos/slip?logged=1 says It is in your log. and offers one Go on
- d9ecf0c fix(FIX-R2-REST RS15): while locked, Call someone and Remind me why say hidden, not empty
- 1f06923 fix(FIX-R2-SAFETY RS14): SOS never shows sample contacts or reasons as the person's own
- 1f1ab9f fix(FIX-R2-SAFETY RS13): sample data path shows the safety step before Today
- b841098 fix(FIX-R2-SAFETY RS12): lock screen and its title follow the discreet flag
- b50e28d fix(FIX-R2-SAFETY RS11): Next on the privacy step sets a typed PIN, or stays and says why
- c7c1c92 fix(FIX-R2-SAFETY RS10): typed crisis text in inflected forms goes to the numbers
- Earlier run (to fc0d038): fc0d038, 5c1ce64, 7950da5, e003beb, be5e632, 14531c0, c270a01 (RC14-RC20); fca2781 back to cf9bc2b (FIX-ONB-EMO, FIX-SAFETY-AS); full list: git -C C:/Users/ruchi/1-addic-wt/actions-sos log --oneline 655516dc..HEAD
- First slice commit:
- 1cb96a3 feat(actions-sos, U-09): Actions verbs of 3.2 with validation and events

### Turn caps
- 2026-11-07 17:10 run (continued from 5c2e7a7): no builder; the FIX-R5 fixer (RS24, RS29-RS32, RS22T, six commits 27b4f3b..1cfc936) ran in the review fix round. capHits: 0.
- 2026-11-07 16:20 run (continued from 1131827): no builder; the FIX-R4 fixer (RS24-RS28, five commits) ran in the review fix round, not tied to a cap. capHits: 0.
- 2026-11-07 15:46 run (continued from a8dce5a): this run built nothing in the lane; the FIX-R3 builder (RS19-RS23, five commits 1a9c1ec..1131827) ran in the review fix round. capHits: 0.
- 2026-11-07 run (continued from fc0d038): FIX-R2-SAFETY builder steps_used 23; FIX-R2-REST first builder hit its 80-turn cap with no note (all five ids already committed); resume builder steps_used 7, verified and rebuilt nothing. capHits: 1.
- Builder for U-09: steps_used 34; returned a note. capHits: 0.

### Units
- 2026-11-07 17:10 FIX-R5 (27b4f3b, 7c21ffd, 46083fe, 0a7fe20, 5585c65, 1cfc936; review fix round, this run built nothing else). For a person: the line Content gives as tel with no number (the trunk's local emergency number) is one tap in Urgent help, the crisis view, the lock screen's list and the lead (RS29); the lead 'If you are not safe, call now.' always has at least one number in every region, a built-in Emergency 112 marked 'Please check this number.' when Content gives none (RS24); a screen reader hears the lead first (RS30); painkillers, paracetamol, medicines, capsules, 'a whole bottle of pills', 'swallowed all my pills' open the overdose card (RS31); eight more phrases ('I hope that I don't wake up', 'I wish it would all just end', 'no one would miss me', 'I want to sleep forever' and others) open the crisis view (RS32); RS22's retry test drives its one real case (RS22T). Closed: RS24 empty-lead gap, Elsewhere one-tap, phrase lists (closed by the 17:04 ruling). Gap left: RS26 lock-identity remainder, ruled for offline-v1.1.
- 2026-11-07 16:20 FIX-R4 (c7abff1, fd40b5d, d81a461, bd75f79, 5c2e7a7; built in the review fix round, this run built nothing else). For a person: on 'Something else', any Next that matches no phrase (empty too) shows 'If you are not safe, call now.' and two one-tap numbers above the steps; a named feeling does not (RS24); 'took too many pills/tablets/meds', 'used too much' open the full urgent view with the overdose card (RS25); typed overdose words open that card and the first line is announced (RS28); a save from a notebook erased or replaced in another tab is dropped with 'Not saved on this device.', never retried or kept (RS26); a kept save lost after the unlock shows one 'This was not saved.' (RS27). Builder choices: the store subscription starts at the first save; a save's mark = C2 signals seen plus Store.status().hasLock. Gap left: another tab erases and sets a new PIN, a STALE write reads locked with hasLock unchanged and is kept; request to core below. Closes RS24-RS28.
- U-09 Actions (1cb96a3; offline/src/actions.js, offline/tests/actions.test.mjs). For a person: nothing on screen yet. Screen lanes can now write through Actions: an SOS session saves one log with its skills and outcome; a drill saves only one TutorialCompleted('drill'); a slip is logged without lowering any number or moving startDate; export, erase and import give back the same notebook; every refused call writes nothing; a locked store refuses with LOCKED. Closes brief Q1 (Engine/Store contracts exist) and Q5 (sample absent = 'no-sample').
- 2026-11-07 run (continued from fc0d038). Built by the earlier run (10:43-12:45): U-10, U-11, FIX-SAFETY-AS, FIX-ONB-EMO and review round 2 RC15-RC20 (check PASS at fca2781).
- FIX-R2-SAFETY (c7c1c92, b50e28d, b841098, 1f1ab9f, 1f06923). For a person: typed 'killing myself', 'self harming', 'cutting myself' and similar now open the numbers, not breathing (RS10); on onboarding step 2, Next with a typed PIN sets it or stays and says why (RS11); in discreet mode the lock screen and tab title are neutral (RS12); 'Look around with sample data' shows the safety step, which cannot be skipped, then Today (RS13); SOS never offers sample contacts or reasons, no tel: or sms: to a sample number (RS14). Closes RS10-RS14.
- FIX-R2-REST (d9ecf0c, b7fd04f, 1068c5f, a060d95, a8dce5a). For a person: while locked, Call someone and Remind me why say the people and reasons are hidden, not missing (RS15); after Yes to 'Did you use?', the slip page says 'It is in your log.' with one Go on, nothing logged twice (RS16); with a PIN already set, step 2 says so and shows no PIN fields (RS17); a save kept for the unlock is dropped when the notebook is erased or imported (C2); the motivation slider has a confirm button (onb-score-ok), moving it still saves, untouched saves nothing (C3). Closes RS15-RS17, C2, C3.
- 2026-11-07 15:46 FIX-R3 (1a9c1ec, d2be169, e2e1017, 5e820b7, 1131827). For a person: typed 'I want to be dead', 'not wake up', 'no longer worth living', 'want it all to end', 'better off without me' open the numbers (RS19); 'overdose', 'OD', 'took too much' open the full urgent view with the overdose card, checked before crisis words (RS23); a save refused LOCKED on an open notebook is retried at once (RS22); a slip kept for the unlock says 'It goes in your log when you unlock.' (route #/sos/slip?kept=1, parseSos returns {flow, drill, preview, logged, kept}) (RS21); while the PIN is set, Next and Skip wait and 'Setting your PIN. One moment.' shows (RS20). Closes RS19-RS23 and the STALE-LOCKED question (retry once). Older tests changed with RS21/RS22 (C2 stand-in refuses twice; RC16 expects kept=1; routes test). Builder choices: overdose before crisis; only 'took'/'taken too much'; a non-LOCKED retry failure shows Not saved and is not kept; no sosSession verb sends Yes to #/sos/slip as not logged.
- Held or blocked: none.
- Still to build: U-10 (offline/src/ui-sos.js: UI.pages.sos, UI.sosHelpers {urgentList, outcomeFrom, isCrisisEmotion}, tests as a new describe in actions.test.mjs; waits for core U-03 in the base; ends a flow with Actions.sosSession and must finish without saving if LOCKED). U-11 (offline/src/ui-onboarding.js: UI.pages.lock via Store.lock.unlock then UI.go('#/today',{replace:true}), urgent help via UI.sosUrgentView; UI.pages.onboarding finishing with Actions.onboard, motivation.add, saveResponse('quick-reasons'), contacts.add).

### Contract changes
2026-11-07: hook onb-score-ok (C3) is new, not yet in the contract or hooks.mjs; sos-slip-continue (RS16) replaces the two start buttons when logged=1; Store.subscribe payload { label } is relied on (C2). Hooks sos-step-next/-done, sos-helped-yes/-no, sos-rate-skip, sos-checkin are in the contract (RC14). No new routes or events.
Verb signatures and errors (3.2): see actions-sos-report-annex.md (Verbs) and contracts/actions-sos.md.
- No content keys, routes, UI.pages or data-tour targets added.

### Gates
2026-11-07 17:10 run: the check ran no gate (judged after 5c2e7a7: PASS). VERIFIED by the fixer at 1cfc936: test GREEN 156/156 C:/Users/ruchi/1-addic-wt/_logs/gates/actions-sos/test-20261107-173231.log (re-check probe test-20261107-174638.log, GREEN 156/156); guards RED on the same 21 tour-target names as 5c2e7a7 (guards-20261107-173630.log, -175003.log vs -163955.log). ASSUMED: build SKIP (build-20261107-173231.log, no build.mjs), validate SKIP (validate-20261107-173630.log, no engine.js); browser gate not run. Red and green logs per id: _logs/reports/actions-sos/actions-sos__RS24.red.log (FIX-R5 section) and the per-id files.
2026-11-07 16:20 run: the check ran after 1131827 and judged nothing new (PASS carried). VERIFIED by the reviewer at 5c2e7a7: test GREEN 133/133 C:/Users/ruchi/1-addic-wt/_logs/gates/actions-sos/test-20261107-165035.log; guards RED on the same 21 tour-target names as 1131827 (guards-20261107-165059.log, -163955, -160205 identical; 15 baselined baselines.md:26-40, 6 nav-*/sos-button = HUB R-C-19). ASSUMED: build and validate SKIP, browser gate not run. Per-id logs: _logs/reports/actions-sos/actions-sos__RS24..RS28.red.log/.green.log; probe 0 MISS on 19 phrases actions-sos__fr4probe.log.
2026-11-07 15:46 run: the check ran no gate (it judged after a8dce5a: PASS). ASSUMED from the builder at 1131827: test GREEN 119/119 C:/Users/ruchi/1-addic-wt/_logs/gates/actions-sos/test-20261107-160159.log; guards RED on the same 21 tour-target names as a8dce5a C:/Users/ruchi/1-addic-wt/_logs/gates/actions-sos/guards-20261107-160205.log; build SKIP build-20261107-160159.log; validate SKIP validate-20261107-160205.log. Reviewer probe at 1131827: test GREEN 119/119 test-20261107-160634.log. Red and green logs per id: C:/Users/ruchi/1-addic-wt/_logs/reports/actions-sos/actions-sos__RS19..RS23.red.log/.green.log. Browser gate not run.
Gates of the a8dce5a run (VERIFIED test 95/95, guards RED on 21 names) and earlier: see annex (Earlier gates).
Territory 2026-11-07 16:20: 1131827..5c2e7a7 touched only ui-sos.js and tests/actions.test.mjs (own); 0 shared.
Territory 2026-11-07 17:10: 5c2e7a7..1cfc936 touched only ui-sos.js and tests/actions.test.mjs (own); 0 shared.
Territory 2026-11-07 15:46: a8dce5a..1131827 touched only ui-sos.js, ui-onboarding.js, tests/actions.test.mjs (all own); 0 shared.

### Review gates
None.

### Check (2026-11-07 run)
Moved to actions-sos-report-annex.md (Earlier checks and reviews).

### Check (2026-11-07 17:10 run)
Continued from 5c2e7a7: the check judged only commits after 5c2e7a7 (none built by a run); verdict PASS at 5c2e7a7, no findings.

### Review (2026-11-07 17:10 run, round 5; contracts and safety over 655516dc...HEAD, finder re-check at 1cfc936)
Contracts reviewer: no findings. Safety reviewer round 5 (evidence actions-sos__review-safety.md, Round 5):
- RS24 HIGH U-10 fix 7c21ffd: FIXED. RS29 MEDIUM U-10 fix 27b4f3b: FIXED. RS30 LOW U-10 fix 46083fe: FIXED. RS31 LOW U-10 fix 0a7fe20: FIXED. RS32 LOW U-10 fix 5585c65: FIXED. RS22T LOW U-10 fix 1cfc936: FIXED.
- New from the re-check, no fix yet: MEDIUM U-10 (regression of RS29, 27b4f3b) ui-sos.js:538-542 (urgentView draws a note only in the branch with no tel) and :515-523 (leadView draws name, number, verify only): on Something else the 'Your local emergency number' line is one tap but its note 'Usually 112, 911 or 999...' is not shown. LOW, offline-v1.1 under the 17:04 ruling: OVERDOSE misses 'I took 20 pills', 'I took all my pills', 'I took the whole bottle'; does not hold READY.
- Questions: the full urgent view (#/sos/urgent, UI.sosUrgentView) still shows no number when Content.resources is empty; should urgentList fall back to BUILT_IN or core export URGENT.builtIn (for the chat); clinical: RS32's wider CRISIS list also feeds spiralPairs, so the person's own spiral thoughts like "I can't do this anymore" drop out of the slip flow's spiral step (3 thoughts give 1 pair, were 3).

### Review (rounds 2 and 3)
Moved to actions-sos-report-annex.md (Earlier review blocks): RS10-RS17, RS19-RS23 all FIXED; their open items became RS24 onward.


### Safety and content marks
2026-11-07 17:10: lead always has a number (built-in 112 marked please verify, a copy of core's URGENT.builtIn); CRISIS and OVERDOSE widened again (RS31, RS32), clinicalReview: true kept; clinical review owed on both lists and the spiralPairs side effect. Open: MEDIUM note of the local emergency line not shown. No network call, innerHTML or URL added.
2026-11-07 16:20: RS24 lead (LEAD, clinicalReview: true, numbers marked please verify) above the steps on every unmatched 'Something else' text; OVERDOSE widened (RS25), clinicalReview: true kept; clinical review owed on both lists, on false positives, and on 'This was not saved.'. Open: MEDIUM Elsewhere region has no one-tap number, LOW lead not announced. No network call, innerHTML or URL added.
2026-11-07 15:46: CRISIS.patterns widened again (RS19), OVERDOSE now clinicalReview: true with 3 patterns (RS23); clinical review owed on both and on false positives; N1 and N2 are open safety gaps (HIGH, MEDIUM) and block a clean READY in the reviewers' view; the chat decides.
2026-11-07: CRISIS.patterns widened (RS10), clinicalReview: true kept; clinical review owed on the patterns and on idiom false positives ('this is killing me') the ruling allows; only 'overdose on purpose' matches the overdose case. The safety step cannot be skipped on any path (RS13). Sample rows never show as the person's own in SOS (RS14). Urgent help stays one tap away while locked (RS15). No network call, innerHTML or URL added.
clinicalReview: true passages: none (no copy in U-09). verify: true resources: none. actions.js holds no crisis copy, network call, URL, innerHTML or 'addict' (grep). Safety writes proved by 10 mutations (drill guard, slip event, used-means-slip, locale en, backup check and others). The marks arrive with U-10 and U-11.

### Requests for other lanes
- (2026-11-07 17:10) core: Store.status().lockId (RS26 remainder, offline-v1.1; then markNow() in ui-sos.js adds it with a typeof check); export URGENT.builtIn from ui-core. Content/chat: show the Elsewhere line's note beside the call; open an id for the MEDIUM regression.
- (2026-11-07 16:20) core: a public lock-row identity (RS26 gap, in for_the_chat). Engine: whether Engine.crisisKeywords takes the RS24 phrases and the RS25 medicine words. content/core: the Elsewhere emergency line as tel: in urgentItem (new MEDIUM). For the chat: open ids for the two new findings.
- (2026-11-07 15:46) core: Q1 (RS22) needs a signal that a store was replaced (label on notify or a generation id) so a stale retry does not write into a new notebook. Open an id for N1 and N2 in the CORE chat. guards RED: 15 of 21 baselined (baselines.md:26-40), 6 (nav-*, sos-button) are core's, HUB R-C-19.
- Earlier requests (C2 label, tests-docs hooks, content sample flag, engine and core asks): see annex (Earlier requests).

### Docs owed
New 2026-11-07 17:10: guide text that the lead always shows a number, and 'Please check this number.'.
See actions-sos-report-annex.md (Docs owed); new 2026-11-07 16:20: guide text for the numbers lead on 'Something else', the overdose card, 'This was not saved.'.

### Open questions
2026-11-07 17:10 (defaults taken): built-in 112 is a copy in ui-sos.js; the full urgent view has no built-in fallback yet (open, for the chat); phrase lists closed; open: the spiralPairs question under round 5.
2026-11-07 16:20 (defaults taken): any typed text on 'Something else' gets the lead; empty field too; a named feeling does not; dropped save shows Not saved, kept loss shows one This was not saved.; open: the four questions under Review round 4.
2026-11-07 15:46 (defaults taken): overdose checked before crisis words; only 'took'/'taken too much' route; non-LOCKED retry failure shows Not saved; no sosSession verb sends Yes to slip as not logged; open: Q1-Q3 above. STALE-LOCKED closed by RS22.
Earlier open questions (2026-11-07 and 15:46 lists): see annex.

### For the HUB at the merge
- 2026-11-07 17:10: tip 1cfc936, same 2 own files changed since 5c2e7a7, no shared files; guards RED on the same 21 names; test 156/156; one MEDIUM regression (note not shown) and one LOW unfixed; READY.
- 2026-11-07 16:20: tip 5c2e7a7, same 2 own files changed since 1131827, no shared files; guards RED on the same 21 names; test 133/133; 2 new findings (MEDIUM, LOW) unfixed.
- 2026-11-07 15:46: tip 1131827, same 3 own files changed, no shared files; guards RED on the same 21 names; N1/N2 unfixed.
- 2026-11-07: still no shared files and no package changes; 4 own files; expect guards RED on the 21 tour-target names until the screen lanes and core's shell merge; build and validate SKIP on this branch, run them after the merge; browser cases owed by tests-docs.
- Shared files touched: none. build.mjs on trunk already lists actions.js, ui-sos.js, ui-onboarding.js.
- package.json / package-lock.json: no changes (none on the base).
- Conflicts to expect: none; two new files only.
- Territory warnings: none.
- Browser tests for the quiet window: none in this slice.
