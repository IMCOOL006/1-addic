## actions-sos (CORE, 1-addic offline build): the lane report

State: READY-SLICE at 3e3ffbc (2026-11-08 04:55 IST: continued from f69bc68a; V-08a, V-SOS10 built; check PASS at 3e3ffbc, 2 LOW findings open; browser gate for V-SOS10 not run). Earlier: READY at cd385a5 (2026-11-07 22:53 IST: FIX-R7 built; check PASS at 00a5c08; reviewers judged 655516dc...HEAD; RS37R, RS38, RS36R FIXED, re-check FIXED, 0 findings open). Earlier: RED at 00a5c08 (2026-11-07 22:08 IST: FIX-R6 built; check PASS at 87030e3; safety review of FIX-R6 found RS35 HIGH, RS36 and RS37 MEDIUM, fixed in ed34fc8, 00a5c08, 1f4b61c; re-check: RS35 FIXED, RS36 and RS37 PARTLY, one new LOW; 2 review findings open). Earlier: READY at 1cfc936 (17:10); RED at 5c2e7a7 (16:20); READY at 1131827. Branch build/actions-sos (worktree C:/Users/ruchi/1-addic-wt/actions-sos). Base 655516dc. Tip cd385a57796c582b6123e724bfb897c41666bf32 (00a5c08 before FIX-R7, 87030e3 after FIX-R6, 1cfc936 at 17:10, 5c2e7a7, 1131827, a8dce5a at 14:23; slice READY-SLICE at 1cb96a3, 08:26). Units: U-09, U-10, U-11, FIX-SAFETY-AS, FIX-ONB-EMO, FIX-R2-SAFETY, FIX-R2-REST, FIX-R3, FIX-R4, FIX-R5, FIX-R6, FIX-R7. Held: none.
Commits (655516dc..HEAD, newest first):
- 2026-11-08 run, f69bc68a..HEAD: 3e3ffbc fix(actions-sos V-SOS10): the SOS rating '10' stays on one line at 390 px; b7b4db9 feat(actions-sos V-08a): Actions.useSkill({skillId, helpful}) -> {ok, event}
- cd385a5 fix(FIX-R7 RS36R): SOS reads stage and region from the person's own profile only
- b20cdb3 fix(FIX-R7 RS38): contacts.update keeps the sample mark for a Save with no change or Show again
- 54405c7 fix(FIX-R7 RS37R): the person's change over a sample plan, debrief or prediction result makes the row theirs
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
- 2026-11-08 04:55 run: one builder for V-08a and V-SOS10, steps_used 33, note returned, capHits 0.
- 2026-11-07 22:08 run (FIX-R6 safety re-check): FIX-R6 built by the earlier run wf_45f788de-56d (CORE 60f08c84, 19:07-19:10) and the review fix agent (RS35-RS37, ed34fc8..00a5c08); this run built no new unit; builders none. capHits: 0.
- 2026-11-07 22:53 run (FIX-R7): builders none listed by the harness; the FIX-R7 fix agent (CORE session 93bffdb7, 23:06-23:14) committed 54405c7, b20cdb3, cd385a5. capHits: 0.
- Earlier turn caps (R3 to R5 fixers capHits 0; FIX-R2-REST first builder hit its 80-turn cap, capHits 1; U-09 34 steps): annex.
- 2026-11-07 run (continued from fc0d038): FIX-R2-SAFETY builder steps_used 23; FIX-R2-REST first builder hit its 80-turn cap with no note (all five ids already committed); resume builder steps_used 7, verified and rebuilt nothing. capHits: 1.
- Builder for U-09: steps_used 34; returned a note. capHits: 0.


### Units
- 2026-11-08 V-08a (b7b4db9; actions.js, tests/actions.test.mjs). For a person: nothing on screen yet. Other lanes can log a skill use with Actions.useSkill({skillId, helpful}); it never throws and writes one SkillUsed with exactly those two fields, also while a sample is loaded (the event is the person's own, unmarked, R-C-48). Codes: bad-event, bad-skill, no-store and LOCKED (passed through), error. Extra keys are dropped. 4 named tests pass; 7 of 7 mutations red. Closed: the sample-mode question (no such code).
- 2026-11-08 V-SOS10 (3e3ffbc; ui-sos.js). For a person: on SOS the rating '10' stays on one line at 390 px (inline button style: 4px side padding, nowrap, tabular digits; hooks, grid and 56px target unchanged; no styles.css edit, R-C-48/R-H-41). Node test passes; 6 of 6 mutations red. Not proved in a real browser yet.
- Held or blocked this run: none. Next in batches: V-25 (lock form hook lock-opening, ui-onboarding.js), V-18, V-17b (after core V-17a; reads Store.status().lockId).
- 2026-11-07 17:10 FIX-R5 and 22:08 FIX-R6 unit text: annex (Moved by the 2026-11-08 run).
- 2026-11-07 22:53 FIX-R7 (54405c7, b20cdb3, cd385a5). For a person: rewriting a sample plan, debriefing it, or completing a sample prediction makes it theirs and Erase sample keeps it (RS37R); a Save with no edit, Hide or Show again on a sample contact keeps it the sample's (RS38); with only the sample loaded, SOS asks no 'How is your motivation?' and writes no motivation row, and urgent lists use the person's own region, else India's (RS36R). Ticking a sample to-do keeps it the sample's. Closed: RS37's class beyond contacts, RS36's SOS side. Detail: actions-sos__units.md line 834.
- Earlier units (U-09 slice, FIX-R2-SAFETY, FIX-R2-REST, FIX-R3, FIX-R4, FIX-R5): per-unit text in annex (Earlier units).
- U-09 Actions (1cb96a3; offline/src/actions.js, offline/tests/actions.test.mjs). For a person: nothing on screen yet. Screen lanes can now write through Actions: an SOS session saves one log with its skills and outcome; a drill saves only one TutorialCompleted('drill'); a slip is logged without lowering any number or moving startDate; export, erase and import give back the same notebook; every refused call writes nothing; a locked store refuses with LOCKED. Closes brief Q1 (Engine/Store contracts exist) and Q5 (sample absent = 'no-sample').
- 2026-11-07 run (continued from fc0d038). Built by the earlier run (10:43-12:45): U-10, U-11, FIX-SAFETY-AS, FIX-ONB-EMO and review round 2 RC15-RC20 (check PASS at fca2781).
- Held or blocked: none.
- Still to build: U-10 (offline/src/ui-sos.js: UI.pages.sos, UI.sosHelpers {urgentList, outcomeFrom, isCrisisEmotion}, tests as a new describe in actions.test.mjs; waits for core U-03 in the base; ends a flow with Actions.sosSession and must finish without saving if LOCKED). U-11 (offline/src/ui-onboarding.js: UI.pages.lock via Store.lock.unlock then UI.go('#/today',{replace:true}), urgent help via UI.sosUrgentView; UI.pages.onboarding finishing with Actions.onboard, motivation.add, saveResponse('quick-reasons'), contacts.add).

### Contract changes
2026-11-08: new public Actions.useSkill({skillId, helpful}) -> {ok, event} or {ok:false, code, message}; codes bad-event, bad-skill, no-store, LOCKED, error; event SkillUsed {skillId, helpful}. No new routes, UI.pages or data-tour targets; V-SOS10 is inline style, no CSS. Contract file tracks/CORE/contracts/actions-sos.md :195 and :197 still list sample-mode and .sos-rating .btn (finding C1).
2026-11-07: hook onb-score-ok (C3) is new, not yet in the contract or hooks.mjs; sos-slip-continue (RS16) replaces the two start buttons when logged=1; Store.subscribe payload { label } is relied on (C2). Hooks sos-step-next/-done, sos-helped-yes/-no, sos-rate-skip, sos-checkin are in the contract (RC14). No new routes or events.
Verb signatures and errors (3.2): see actions-sos-report-annex.md (Verbs) and contracts/actions-sos.md.
2026-11-07 22:53: no public change. Inside actions.js sameValue and claimRow(prev, patch, next) (six update verbs call it; any new update verb must); inside ui-sos.js ownProfile(c) (read the profile only through it). Verbs, events, routes, UI.pages, data-tour targets unchanged.
- No content keys, routes, UI.pages or data-tour targets added.

### Gates
2026-11-08 04:55 run: VERIFIED by the builder at 3e3ffbc: build C:/Users/ruchi/1-addic-wt/_logs/gates/actions-sos/build-20261108-052128.log, test -052140.log, validate -052822.log, guards -052824.log; red/green/mut logs _logs/reports/actions-sos/actions-sos__V-08a.*.log and __V-SOS10.*.log. VERIFIED by the check: build GREEN build-20261108-053636.log; test GREEN 174/174 test-20261108-053640.log; validate GREEN validate-20261108-053822.log; guards GREEN 5/5 guards-20261108-053823.log. ASSUMED: browser gate (--grep sos) NOT RUN, free memory 3.8 GB under the 4.0 GB floor; owed before READY. Uncommitted offline/1-addic.html is the build output, not committed.
2026-11-07 17:10 run: the check ran no gate (judged after 5c ... (full text in annex, Moved by the 2026-11-08 run)
2026-11-07 22:08 run: VERIFIED by the fixer at 87030e3: test ... (full text in annex, Moved by the 2026-11-08 run)
2026-11-07 22:53 run: VERIFIED by the fixer at cd385a5: test GREEN 169/169 C:/Users/ruchi/1-addic-wt/_logs/gates/actions-sos/test-20261107-231302.log; guards RED on the same 21 tour-target names as 00a5c08 (guards-20261107-231317.log); red runs actions-sos__RS37R.red.log, RS38.red.log, RS36R.red.log in _logs/reports/actions-sos/; re-check probe logs test-20261107-232340.log, -232818.log. ASSUMED: build SKIP (build-20261107-231302.log) and validate SKIP (validate-20261107-231317.log), no build.mjs or engine.js; browser gate not run.
Gates of the a8dce5a run (VERIFIED test 95/95, guards RED on 21 names) and earlier: see annex (Earlier gates).
Territory 2026-11-07 16:20: 1131827..5c2e7a7 touched only ui-sos.js and tests/actions.test.mjs (own); 0 shared.
Territory 2026-11-07 17:10: 5c2e7a7..1cfc936 touched only ui-sos.js and tests/actions.test.mjs (own); 0 shared.
Territory 2026-11-07 15:46: a8dce5a..1131827 touched only ui-sos.js, ui-onboarding.js, tests/actions.test.mjs (all own); 0 shared.
Territory 2026-11-07 22:53: 00a5c08..cd385a5 touched only actions.js, ui-sos.js, tests/actions.test.mjs (own); 0 shared.

Territory 2026-11-08: f69bc68a..3e3ffbc touched only actions.js, ui-sos.js, tests/actions.test.mjs (own); 0 shared.

### Review gates
None.

### Check (2026-11-08 04:55 run)
Continued from f69bc68a: judged only the commits after it; verdict PASS at 3e3ffbc; territory clean (3 own files, 0 shared); trailers present. Not checked: the browser gate for V-SOS10; U-09 to FIX-R8 (merged in e8da3fb, not in the diff); the V-08b consumer wiring (ui-tools.js:315, game-tutorials).
- C1 LOW V-08a contracts/actions-sos.md:195, :197: V3 02:52 lines disagree with the 03:01 rulings and code (sample-mode listed; no-store and error missing; CSS rule .sos-rating .btn gone). Fix SHA: none yet. Re-check: none (no fix, no review).
- C2 LOW V-08a tests/actions.test.mjs V3 block: the locked half returns early if Store.lock is missing; assert the API exists; no test of the 'error' code. Runs today (store.js:782-783). Fix SHA: none. Re-check: none. Evidence: actions-sos__V-08a.mut.log, test-20261108-053640.log.
openCheck 2.

### Check (2026-11-07 run)
Moved to actions-sos-report-annex.md (Earlier checks and reviews).

### Check (2026-11-07 22:08 run)
Check PASS at 87030e3, no findings, territory empty; openCheck 0.

### Check (2026-11-07 22:53 run)
Continued from 00a5c08: the check judged only commits after 00a5c08; verdict PASS at 00a5c08, no findings, territory empty; openCheck 0.

### Review (2026-11-07 22:53 run, contracts and safety over 655516dc...HEAD; finder re-check at cd385a5; evidence actions-sos__review-safety.md Round 7, actions-sos__fr6recheck3.probe.test.mjs)
Contracts reviewer: no findings.
- RS37R MEDIUM U-09 actions.js plans.update, plans.debrief, predictions.complete, contacts.update: a person's rewrite, debrief or result kept sample: true and Erase sample deleted it. Fix 54405c7 (claimRow). Re-check: FIXED.
- RS38 LOW U-09 actions.js contacts.update: dropped the mark on a no-change Save. Fix b20cdb3. Re-check: FIXED.
- RS36R MEDIUM U-10 ui-sos.js:852, :539, :553: the sample profile's stage and region reached SOS (a motivation row with stage action). Fix cd385a5 (ownProfile). Re-check: FIXED. New findings from the re-check: none. Questions: none.
- Open questions from the fixer: plans.update with status alone drops the mark (default as ruled); '', null and absent are one value; plans.update still writes the person's BattlePlanCreated event.

### Review (2026-11-07 22:08 run): RS35 HIGH, RS37 MEDIUM, RS36 MEDIUM and one LOW; text and re-checks in annex (Moved by the 2026-11-08 run).

### Check (2026-11-07 17:10 run)
Continued from 5c2e7a7: the check judged only commits after 5c2e7a7 (none built by a run); verdict PASS at 5c2e7a7, no findings.

### Review (2026-11-07 17:10 run, round 5)
Moved to actions-sos-report-annex.md (Round 5 review).

### Review (rounds 2 and 3)
Moved to actions-sos-report-annex.md (Earlier review blocks): RS10-RS17, RS19-RS23 all FIXED; their open items became RS24 onward.


### Review (2026-11-08 04:55 run)
None run (reviewGates empty); openReview 0.

### Safety and content marks
2026-11-08: useSkill writes only skillId and helpful and refuses before any write; no crisis copy, phrase, network call, innerHTML or URL added; V-SOS10 uses h() with a style object; clinicalReview: true kept.
2026-11-07 22:53: sample rows the person changes become theirs (RS37R, RS38); SOS never reads the sample profile (RS36R). No copy, phrase, list, network call, innerHTML or URL added; clinicalReview: true kept, clinical review still owed on CRISIS and OVERDOSE.
2026-11-07 17:10: lead always has a number (built-in 112 marked please verify, a copy of core's URGENT.builtIn); CRISIS and OVERDOSE widened again (RS31, RS32), clinicalReview: true kept; clinical review owed on both lists and the spiralPairs side effect. Open: MEDIUM note of the local emergency line not shown. No network call, innerHTML or URL added.
2026-11-07 22:08: sample rows never read as the person's own (RS-SAMPLE, RS35 stock-line check, RS37, RS36); built-in 112 fallback in every urgent list (Q-BUILTIN); notes shown (RS33). No crisis list widened this run; clinicalReview: true kept; clinical review still owed on CRISIS and OVERDOSE. No network call, innerHTML or URL added. Earlier marks: annex.
clinicalReview: true passages: none (no copy in U-09). verify: true resources: none. actions.js holds no crisis copy, network call, URL, innerHTML or 'addict' (grep). Safety writes proved by 10 mutations (drill guard, slip event, used-means-slip, locale en, backup check and others). The marks arrive with U-10 and U-11.

### Requests for other lanes
- (2026-11-08) tests-docs: run the browser gate --grep sos and re-take sos-craving-phone.png (U-35) after the merge. game-tutorials/today: V-08b wires Actions.useSkill at ui-tools.js:315. CORE: fix the contract lines :195 and :197 (C1) or rule they stay. core V-17a before V-17b.
- (2026-11-07 22:53) SCREENS: nothing needed; the Safety Net may still skip sending an unchanged form. Any new update verb on a row that may be sample must call claimRow. Engine/content: sample startDate under O6 remains.
- (2026-11-07 17:10) core: Store.status().lockId (RS26 remainder, offline-v1.1; then markNow() in ui-sos.js adds it with a typeof check); export URGENT.builtIn from ui-core. Content/chat: show the Elsewhere line's note beside the call; open an id for the MEDIUM regression.
- (2026-11-07 22:08) engine: tell a filled spiral reply from the person's own (engine.js:728 fills reply from slipSelfTalk; reply '' plus stockReply, or own: false). SCREENS: Safety Net editor may offer 'Add as my own' for sample rows and should not send an unchanged form (the LOW). Engine/content: the sample profile's startDate becomes profile me in a fresh notebook (day counters). plans.update, plan debrief, predictions complete and todos done still keep the sample mark (only if CORE rules it in). Earlier requests: annex.
- Earlier requests (C2 label, tests-docs hooks, content sample flag, engine and core asks): see annex (Earlier requests).

### Docs owed
2026-11-08: none new; the guide screenshot sos-craving-phone.png is re-taken after the merge.
Docs owed text of 22:53, 22:08, 17:10, 16:20: annex (Moved by the 2026-11-08 run).

### Open questions
2026-11-08 (defaults taken): useSkill never refuses for a sample (R-C-48); extra keys dropped, not refused. Open: C1 and C2 (LOW); browser gate for V-SOS10.
2026-11-07 22:53 (defaults taken): the three under Review 22:53; the 22:08 questions on the engine telling a filled reply, Today card, Safety Net refusal and sample startDate stay open for the chat.
2026-11-07 22:08 (defaults taken): onboarding opens once a visit after the sample; an edited sample contact becomes theirs; a spiral pair needs a non-stock reply the person saved; open: the questions under Review 22:08 and the LOW.
2026-11-07 17:10 (defaults taken): built-in 112 is a copy in ui-sos.js; the full urgent view has no built-in fallback yet (open, for the chat); phrase lists closed; open: the spiralPairs question under round 5.
2026-11-07 16:20 (defaults taken): any typed text on 'Something else' gets the lead; empty field too; a named feeling does not; dropped save shows Not saved, kept loss shows one This was not saved.; open: the four questions under Review round 4.
2026-11-07 15:46 (defaults taken): overdose checked before crisis words; only 'took'/'taken too much' route; non-LOCKED retry failure shows Not saved; no sosSession verb sends Yes to slip as not logged; open: Q1-Q3 above. STALE-LOCKED closed by RS22.
Earlier open questions (2026-11-07 and 15:46 lists): see annex.

### For the HUB at the merge
- 2026-11-08: tip 3e3ffbc; 3 own files changed since f69bc68a, no shared files; build, test 174/174, validate, guards GREEN; browser gate not run; 2 LOW findings open (C1, C2); state READY-SLICE.
- 2026-11-07 22:53: tip cd385a5; 3 own files changed since 00a5c08 (actions.js, ui-sos.js, tests/actions.test.mjs), no shared files; guards RED on the same 21 names; test 169/169; 0 findings open; state READY.
- 2026-11-07 17:10: tip 1cfc936, same 2 own files changed since 5c2e7a7, no shared files; guards RED on the same 21 names; test 156/156; one MEDIUM regression (note not shown) and one LOW unfixed; READY.
- 2026-11-07 22:08: tip 00a5c08; 4 own files changed since 1cfc936 (ui-sos.js, actions.js, ui-onboarding.js, tests/actions.test.mjs), no shared files; guards RED on the same 21 names; test 161/161 at 87030e3; RS36 and RS37 PARTLY fixed and one LOW open (2 findings); state RED. Earlier hub lines: annex.
- 2026-11-07: still no shared files and no package changes; 4 own files; expect guards RED on the 21 tour-target names until the screen lanes and core's shell merge; build and validate SKIP on this branch, run them after the merge; browser cases owed by tests-docs.
- Shared files touched: none. build.mjs on trunk already lists actions.js, ui-sos.js, ui-onboarding.js.
- package.json / package-lock.json: no changes (none on the base).
- Conflicts to expect: none; two new files only.
- Territory warnings: none.
- Browser tests for the quiet window: none in this slice.
