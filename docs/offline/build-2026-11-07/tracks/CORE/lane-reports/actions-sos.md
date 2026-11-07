## actions-sos (CORE, 1-addic offline build): the lane report

State: RED at 00a5c08 (2026-11-07 22:08 IST: FIX-R6 built; check PASS at 87030e3; safety review of FIX-R6 found RS35 HIGH, RS36 and RS37 MEDIUM, fixed in ed34fc8, 00a5c08, 1f4b61c; re-check: RS35 FIXED, RS36 and RS37 PARTLY, one new LOW; 2 review findings open). Earlier: READY at 1cfc936 (17:10); RED at 5c2e7a7 (16:20); READY at 1131827. Branch build/actions-sos (worktree C:/Users/ruchi/1-addic-wt/actions-sos). Base 655516dc. Tip 00a5c080862a7c7be17927f0876ed5f5158f108f (87030e3 after FIX-R6, 1cfc936 at 17:10, 5c2e7a7, 1131827, a8dce5a at 14:23; slice READY-SLICE at 1cb96a3, 08:26). Units: U-09, U-10, U-11, FIX-SAFETY-AS, FIX-ONB-EMO, FIX-R2-SAFETY, FIX-R2-REST, FIX-R3, FIX-R4, FIX-R5, FIX-R6. Held: none.
Commits (655516dc..HEAD, newest first):
- 00a5c08 fix(FIX-R6 RS36): a sample profile is not the person's onboarding; #/today still goes to onboarding once
- 1f4b61c fix(FIX-R6 RS37): the person's edit of a sample contact makes it theirs
- ed34fc8 fix(FIX-R6 RS35): a crisis or hopeless spiral thought keeps its pair only with a reply the person saved, never a stock line
- 87030e3 test(FIX-R6 RS9T): the no-sample refusal reads a stub Content
- 934b85a fix(FIX-R6 Q-SPIRAL): a crisis or hopeless spiral thought the person answered keeps its pair
- ff38655 fix(FIX-R6 Q-BUILTIN): with no number from Content, urgent, crisis and lock views show built-in 112
- f429ce7 fix(FIX-R6 RS33): every urgent line shows its note
- 42f5a9a fix(FIX-R6 RS-SAMPLE): loadSample never writes over an own profile or settings; eraseSample takes only sample rows
- 1cfc936 back to 1cb96a3: earlier commits (FIX-R2 to FIX-R5, U-09 slice) in actions-sos-report-annex.md (Earlier commits); full list: git -C C:/Users/ruchi/1-addic-wt/actions-sos log --oneline 655516dc..HEAD
Commits (655516dc..HEAD, newest first):
- Earlier run (to fc0d038): fc0d038, 5c1ce64, 7950da5, e003beb, be5e632, 14531c0, c270a01 (RC14-RC20); fca2781 back to cf9bc2b (FIX-ONB-EMO, FIX-SAFETY-AS); full list: git -C C:/Users/ruchi/1-addic-wt/actions-sos log --oneline 655516dc..HEAD
- First slice commit:
- 1cb96a3 feat(actions-sos, U-09): Actions verbs of 3.2 with validation and events

### Turn caps
- 2026-11-07 22:08 run (FIX-R6 safety re-check): FIX-R6 built by the earlier run wf_45f788de-56d (CORE 60f08c84, 19:07-19:10) and the review fix agent (RS35-RS37, ed34fc8..00a5c08); this run built no new unit; builders none. capHits: 0.
- Earlier turn caps (R3 to R5 fixers capHits 0; FIX-R2-REST first builder hit its 80-turn cap, capHits 1; U-09 34 steps): annex.
- 2026-11-07 run (continued from fc0d038): FIX-R2-SAFETY builder steps_used 23; FIX-R2-REST first builder hit its 80-turn cap with no note (all five ids already committed); resume builder steps_used 7, verified and rebuilt nothing. capHits: 1.
- Builder for U-09: steps_used 34; returned a note. capHits: 0.

### Units
- 2026-11-07 17:10 FIX-R5 (27b4f3b, 7c21ffd, 46083fe, 0a7fe20, 5585c65, 1cfc936; review fix round, this run built nothing else). For a person: the line Content gives as tel with no number (the trunk's local emergency number) is one tap in Urgent help, the crisis view, the lock screen's list and the lead (RS29); the lead 'If you are not safe, call now.' always has at least one number in every region, a built-in Emergency 112 marked 'Please check this number.' when Content gives none (RS24); a screen reader hears the lead first (RS30); painkillers, paracetamol, medicines, capsules, 'a whole bottle of pills', 'swallowed all my pills' open the overdose card (RS31); eight more phrases ('I hope that I don't wake up', 'I wish it would all just end', 'no one would miss me', 'I want to sleep forever' and others) open the crisis view (RS32); RS22's retry test drives its one real case (RS22T). Closed: RS24 empty-lead gap, Elsewhere one-tap, phrase lists (closed by the 17:04 ruling). Gap left: RS26 lock-identity remainder, ruled for offline-v1.1.
- 2026-11-07 22:08 FIX-R6 (42f5a9a, f429ce7, ff38655, 934b85a, 87030e3, ed34fc8, 1f4b61c, 00a5c08). For a person: loading the sample never overwrites their own profile or settings, and erasing the sample takes only sample rows (RS-SAMPLE); every urgent line shows its note, so 'Usually 112, 911 or 999' sits beside the one-tap 112 (RS33); with no number from Content, the urgent, crisis and lock views show built-in 112 (Q-BUILTIN); a spiral thought they answered keeps its pair in the slip flow (Q-SPIRAL); 'I want to die' with only the stock reply no longer shows as their own words (RS35); editing a sample contact makes it theirs: shown in Call someone, kept by Erase sample (RS37); after the sample, #/today still goes to onboarding once (RS36). Closed: the urgent-view fallback question, the spiralPairs question, the RS33 regression.
- Earlier units (U-09 slice, FIX-R2-SAFETY, FIX-R2-REST, FIX-R3, FIX-R4, FIX-R5): per-unit text in annex (Earlier units).
- U-09 Actions (1cb96a3; offline/src/actions.js, offline/tests/actions.test.mjs). For a person: nothing on screen yet. Screen lanes can now write through Actions: an SOS session saves one log with its skills and outcome; a drill saves only one TutorialCompleted('drill'); a slip is logged without lowering any number or moving startDate; export, erase and import give back the same notebook; every refused call writes nothing; a locked store refuses with LOCKED. Closes brief Q1 (Engine/Store contracts exist) and Q5 (sample absent = 'no-sample').
- 2026-11-07 run (continued from fc0d038). Built by the earlier run (10:43-12:45): U-10, U-11, FIX-SAFETY-AS, FIX-ONB-EMO and review round 2 RC15-RC20 (check PASS at fca2781).
- Held or blocked: none.
- Still to build: U-10 (offline/src/ui-sos.js: UI.pages.sos, UI.sosHelpers {urgentList, outcomeFrom, isCrisisEmotion}, tests as a new describe in actions.test.mjs; waits for core U-03 in the base; ends a flow with Actions.sosSession and must finish without saving if LOCKED). U-11 (offline/src/ui-onboarding.js: UI.pages.lock via Store.lock.unlock then UI.go('#/today',{replace:true}), urgent help via UI.sosUrgentView; UI.pages.onboarding finishing with Actions.onboard, motivation.add, saveResponse('quick-reasons'), contacts.add).

### Contract changes
2026-11-07: hook onb-score-ok (C3) is new, not yet in the contract or hooks.mjs; sos-slip-continue (RS16) replaces the two start buttons when logged=1; Store.subscribe payload { label } is relied on (C2). Hooks sos-step-next/-done, sos-helped-yes/-no, sos-rate-skip, sos-checkin are in the contract (RC14). No new routes or events.
Verb signatures and errors (3.2): see actions-sos-report-annex.md (Verbs) and contracts/actions-sos.md.
- No content keys, routes, UI.pages or data-tour targets added.

### Gates
2026-11-07 17:10 run: the check ran no gate (judged after 5c2e7a7: PASS). VERIFIED by the fixer at 1cfc936: test GREEN 156/156 C:/Users/ruchi/1-addic-wt/_logs/gates/actions-sos/test-20261107-173231.log (re-check probe test-20261107-174638.log, GREEN 156/156); guards RED on the same 21 tour-target names as 5c2e7a7 (guards-20261107-173630.log, -175003.log vs -163955.log). ASSUMED: build SKIP (build-20261107-173231.log, no build.mjs), validate SKIP (validate-20261107-173630.log, no engine.js); browser gate not run. Red and green logs per id: _logs/reports/actions-sos/actions-sos__RS24.red.log (FIX-R5 section) and the per-id files.
2026-11-07 22:08 run: VERIFIED by the fixer at 87030e3: test GREEN 161/161 C:/Users/ruchi/1-addic-wt/_logs/gates/actions-sos/test-20261107-185750.log; guards: same 21 tour-target names, no new name. VERIFIED by the re-checker at 00a5c08: probes in C:/Users/ruchi/1-addic-wt/_logs/gates/actions-sos/test-20261107-224319.log (S2/S3 only 'I blew it', D1b true, D2 rows unmarked; the 'not ok' at lines 121-146 is the probe's own cancel); red runs test-20261107-221320.log, -221937.log. ASSUMED: build and validate SKIP in the worktree (no build.mjs or engine.js), browser gate not run. Earlier gates: annex.
Gates of the a8dce5a run (VERIFIED test 95/95, guards RED on 21 names) and earlier: see annex (Earlier gates).
Territory 2026-11-07 16:20: 1131827..5c2e7a7 touched only ui-sos.js and tests/actions.test.mjs (own); 0 shared.
Territory 2026-11-07 17:10: 5c2e7a7..1cfc936 touched only ui-sos.js and tests/actions.test.mjs (own); 0 shared.
Territory 2026-11-07 15:46: a8dce5a..1131827 touched only ui-sos.js, ui-onboarding.js, tests/actions.test.mjs (all own); 0 shared.

### Review gates
None.

### Check (2026-11-07 run)
Moved to actions-sos-report-annex.md (Earlier checks and reviews).

### Check (2026-11-07 22:08 run)
Check PASS at 87030e3, no findings, territory empty; openCheck 0.

### Review (2026-11-07 22:08 run, safety lens over FIX-R6; finder re-check at 00a5c08; evidence actions-sos__fr6recheck.probe.test.mjs, actions-sos__fr6recheck2.probe.test.mjs, logs test-20261107-221320.log, -221937.log, -224319.log)
- RS35 HIGH U-10 (regression of Q-SPIRAL 934b85a) ui-sos.js:329-335: 'I want to die' with the stock reply showed as the person's own in the slip flow. Fix ed34fc8 (a reply counts only if it is a string of their latest spiral response and not a stock line). Re-check: FIXED.
- RS37 MEDIUM U-09 (RS-SAMPLE class) actions.js:531-537: an edited sample contact stayed sample and vanished from Call someone. Fix 1f4b61c (contacts.update drops sample). Re-check: PARTLY; contact scenario fixed; plans.update, plan debrief, predictions complete and todos done still keep the mark.
- RS36 MEDIUM U-11 with U-09, U-10 (regression of RS-SAMPLE 42f5a9a) ui-onboarding.js:182-189: after loadSample the sample profile's onboardedAt ended onboarding. Fix 00a5c08 (a profile with sample: true does not count). Re-check: PARTLY; D1b true on the real content-sample.js, but the sample startDate still becomes profile me (day counters).
- New LOW U-09 (from fix 1f4b61c; departs from the 22:25 ruling 'drop the mark when the patch changes a field') actions.js:536-538: contacts.update drops sample even on a patch that changes nothing, so Save on an unedited 'Asha (sample)' makes it the person's. No fix yet.
- Questions (defaults taken: RS36 onboarding once a visit; RS37 an edit makes it theirs): can the engine tell a filled reply from the person's own; Today 'Set up your own notebook' card instead; Safety Net refuses sample edits; sample startDate under O6.

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
2026-11-07 22:08: sample rows never read as the person's own (RS-SAMPLE, RS35 stock-line check, RS37, RS36); built-in 112 fallback in every urgent list (Q-BUILTIN); notes shown (RS33). No crisis list widened this run; clinicalReview: true kept; clinical review still owed on CRISIS and OVERDOSE. No network call, innerHTML or URL added. Earlier marks: annex.
clinicalReview: true passages: none (no copy in U-09). verify: true resources: none. actions.js holds no crisis copy, network call, URL, innerHTML or 'addict' (grep). Safety writes proved by 10 mutations (drill guard, slip event, used-means-slip, locale en, backup check and others). The marks arrive with U-10 and U-11.

### Requests for other lanes
- (2026-11-07 17:10) core: Store.status().lockId (RS26 remainder, offline-v1.1; then markNow() in ui-sos.js adds it with a typeof check); export URGENT.builtIn from ui-core. Content/chat: show the Elsewhere line's note beside the call; open an id for the MEDIUM regression.
- (2026-11-07 22:08) engine: tell a filled spiral reply from the person's own (engine.js:728 fills reply from slipSelfTalk; reply '' plus stockReply, or own: false). SCREENS: Safety Net editor may offer 'Add as my own' for sample rows and should not send an unchanged form (the LOW). Engine/content: the sample profile's startDate becomes profile me in a fresh notebook (day counters). plans.update, plan debrief, predictions complete and todos done still keep the sample mark (only if CORE rules it in). Earlier requests: annex.
- Earlier requests (C2 label, tests-docs hooks, content sample flag, engine and core asks): see annex (Earlier requests).

### Docs owed
New 2026-11-07 22:08: guide text that sample rows turn into the person's own when edited, and that onboarding opens once after looking around.
New 2026-11-07 17:10: guide text that the lead always shows a number, and 'Please check this number.'.
See actions-sos-report-annex.md (Docs owed); new 2026-11-07 16:20: guide text for the numbers lead on 'Something else', the overdose card, 'This was not saved.'.

### Open questions
2026-11-07 22:08 (defaults taken): onboarding opens once a visit after the sample; an edited sample contact becomes theirs; a spiral pair needs a non-stock reply the person saved; open: the questions under Review 22:08 and the LOW.
2026-11-07 17:10 (defaults taken): built-in 112 is a copy in ui-sos.js; the full urgent view has no built-in fallback yet (open, for the chat); phrase lists closed; open: the spiralPairs question under round 5.
2026-11-07 16:20 (defaults taken): any typed text on 'Something else' gets the lead; empty field too; a named feeling does not; dropped save shows Not saved, kept loss shows one This was not saved.; open: the four questions under Review round 4.
2026-11-07 15:46 (defaults taken): overdose checked before crisis words; only 'took'/'taken too much' route; non-LOCKED retry failure shows Not saved; no sosSession verb sends Yes to slip as not logged; open: Q1-Q3 above. STALE-LOCKED closed by RS22.
Earlier open questions (2026-11-07 and 15:46 lists): see annex.

### For the HUB at the merge
- 2026-11-07 17:10: tip 1cfc936, same 2 own files changed since 5c2e7a7, no shared files; guards RED on the same 21 names; test 156/156; one MEDIUM regression (note not shown) and one LOW unfixed; READY.
- 2026-11-07 22:08: tip 00a5c08; 4 own files changed since 1cfc936 (ui-sos.js, actions.js, ui-onboarding.js, tests/actions.test.mjs), no shared files; guards RED on the same 21 names; test 161/161 at 87030e3; RS36 and RS37 PARTLY fixed and one LOW open (2 findings); state RED. Earlier hub lines: annex.
- 2026-11-07: still no shared files and no package changes; 4 own files; expect guards RED on the 21 tour-target names until the screen lanes and core's shell merge; build and validate SKIP on this branch, run them after the merge; browser cases owed by tests-docs.
- Shared files touched: none. build.mjs on trunk already lists actions.js, ui-sos.js, ui-onboarding.js.
- package.json / package-lock.json: no changes (none on the base).
- Conflicts to expect: none; two new files only.
- Territory warnings: none.
- Browser tests for the quiet window: none in this slice.
