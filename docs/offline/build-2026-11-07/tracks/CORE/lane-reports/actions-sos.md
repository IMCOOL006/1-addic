## actions-sos (CORE, 1-addic offline build): the lane report

State: READY at 7d9d557 (2026-11-08 01:28 IST: FIX-R8, test-only, of the lane check's C-R7-1..3; the re-check PASS on a fresh trunk merge preview, full Node suite 536/536, actions.test.mjs 169/169 three times on the real store.js; the round's contracts-and-tests review PASS, one LOW R8-RC1 for offline-v1.1; the contracts re-review round 3 at cd385a5 clean of HIGH and MEDIUM (RC21, RC22 LOW); the safety lens clean at cd385a5 (FIX-R7)). Earlier: FIX at cd385a5 (2026-11-08 00:31: the lane check's merge preview 528/536, 8 of the lane's own tests red); READY at cd385a5 by the safety lens (22:53); RED at 00a5c08 (22:08); READY at 1cfc936 (17:10); RED at 5c2e7a7 (16:20); READY at 1131827. Branch build/actions-sos (worktree C:/Users/ruchi/1-addic-wt/actions-sos). Base 655516dc. Tip 7d9d557d61e5385fd1740365c04bb67c2a663999 (cd385a5 before FIX-R8, 00a5c08 before FIX-R7, 87030e3 after FIX-R6, 1cfc936 at 17:10, 5c2e7a7, 1131827, a8dce5a at 14:23; slice READY-SLICE at 1cb96a3, 08:26). Units: U-09, U-10, U-11, FIX-SAFETY-AS, FIX-ONB-EMO, FIX-R2-SAFETY, FIX-R2-REST, FIX-R3, FIX-R4, FIX-R5, FIX-R6, FIX-R7, FIX-R8. Held: none.
Commits (655516dc..HEAD, newest first):
- 7d9d557 test(FIX-R8 C-R7-1): the lock and PIN tests wait for the real Store's key, by a condition that fails loudly
- 514050d test(FIX-R8 C-R7-3): RS24's no-number case brings Content lines with no number; the real Content keeps its own case
- 8153d16 test(FIX-R8 C-R7-2): RS9 brings its own hopeless line to skip, in a copy of Content
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
- 2026-11-08 runs (CORE 11310a7c): the lane check wf_2b08aee9-a80 (one lane-checker, three skeptics); FIX-R8 wf_9d9b1d01-ce1 (the fixer, lane-builder-flagged at effort max, steps_used 33; the re-checker; the contracts reviewer). capHits: 0.
- 2026-11-07 22:08 run (FIX-R6 safety re-check): FIX-R6 built by the earlier run wf_45f788de-56d (CORE 60f08c84, 19:07-19:10) and the review fix agent (RS35-RS37, ed34fc8..00a5c08); this run built no new unit; builders none. capHits: 0.
- 2026-11-07 22:53 run (FIX-R7): builders none listed by the harness; the FIX-R7 fix agent (CORE session 93bffdb7, 23:06-23:14) committed 54405c7, b20cdb3, cd385a5. capHits: 0.
- Earlier turn caps (R3 to R5 fixers capHits 0; FIX-R2-REST first builder hit its 80-turn cap, capHits 1; U-09 34 steps): annex.
- 2026-11-07 run (continued from fc0d038): FIX-R2-SAFETY builder steps_used 23; FIX-R2-REST first builder hit its 80-turn cap with no note (all five ids already committed); resume builder steps_used 7, verified and rebuilt nothing. capHits: 1.
- Builder for U-09: steps_used 34; returned a note. capHits: 0.

### Units
- 2026-11-08 01:28 IST FIX-R8 (8153d16, 514050d, 7d9d557; test-only: offline/tests/actions.test.mjs +68/-16). For a person: nothing changes (no product file changed). For the trunk: the lane's tests hold on the real store.js and the trunk's content as well as on the worktree's stand-ins. until(cond, msg, 30000) waits for the UI's own outcome after a real PBKDF2 key (about 1.2 s) and fails loudly on its timeout; RS20 checks the held step on every wait; PIN and RS11 count lock.set calls (a refused PIN never reaches the Store); RS9 uses a copy of Content with its own hopeless line; the RS24 no-number case brings Content lines with no number, and a new case covers the real Content's one-tap line. Assert calls 821 to 827, none removed or weakened (the contracts reviewer's count).
- 2026-11-07 22:08 FIX-R6 (42f5a9a, f429ce7, ff38655, 934b85a, 87030e3, ed34fc8, 1f4b61c, 00a5c08). For a person: loading the sample never overwrites their own profile or settings, and erasing the sample takes only sample rows (RS-SAMPLE); every urgent line shows its note, so 'Usually 112, 911 or 999' sits beside the one-tap 112 (RS33); with no number from Content, the urgent, crisis and lock views show built-in 112 (Q-BUILTIN); a spiral thought they answered keeps its pair in the slip flow (Q-SPIRAL); 'I want to die' with only the stock reply no longer shows as their own words (RS35); editing a sample contact makes it theirs: shown in Call someone, kept by Erase sample (RS37); after the sample, #/today still goes to onboarding once (RS36). Closed: the urgent-view fallback question, the spiralPairs question, the RS33 regression.
- 2026-11-07 22:53 FIX-R7 (54405c7, b20cdb3, cd385a5). For a person: rewriting a sample plan, debriefing it, or completing a sample prediction makes it theirs and Erase sample keeps it (RS37R); a Save with no edit, Hide or Show again on a sample contact keeps it the sample's (RS38); with only the sample loaded, SOS asks no 'How is your motivation?' and writes no motivation row, and urgent lists use the person's own region, else India's (RS36R). Ticking a sample to-do keeps it the sample's. Closed: RS37's class beyond contacts, RS36's SOS side. Detail: actions-sos__units.md line 834.
- Earlier units (U-09 slice, FIX-R2-SAFETY, FIX-R2-REST, FIX-R3, FIX-R4, FIX-R5): per-unit text in annex (Earlier units).
- U-09 Actions (1cb96a3; offline/src/actions.js, offline/tests/actions.test.mjs). For a person: nothing on screen yet. Screen lanes can now write through Actions: an SOS session saves one log with its skills and outcome; a drill saves only one TutorialCompleted('drill'); a slip is logged without lowering any number or moving startDate; export, erase and import give back the same notebook; every refused call writes nothing; a locked store refuses with LOCKED. Closes brief Q1 (Engine/Store contracts exist) and Q5 (sample absent = 'no-sample').
- 2026-11-07 run (continued from fc0d038). Built by the earlier run (10:43-12:45): U-10, U-11, FIX-SAFETY-AS, FIX-ONB-EMO and review round 2 RC15-RC20 (check PASS at fca2781).
- Held or blocked: none.
- Still to build: U-10 (offline/src/ui-sos.js: UI.pages.sos, UI.sosHelpers {urgentList, outcomeFrom, isCrisisEmotion}, tests as a new describe in actions.test.mjs; waits for core U-03 in the base; ends a flow with Actions.sosSession and must finish without saving if LOCKED). U-11 (offline/src/ui-onboarding.js: UI.pages.lock via Store.lock.unlock then UI.go('#/today',{replace:true}), urgent help via UI.sosUrgentView; UI.pages.onboarding finishing with Actions.onboard, motivation.add, saveResponse('quick-reasons'), contacts.add).

### Contract changes
2026-11-07: hook onb-score-ok (C3) is new, not yet in the contract or hooks.mjs; sos-slip-continue (RS16) replaces the two start buttons when logged=1; Store.subscribe payload { label } is relied on (C2). Hooks sos-step-next/-done, sos-helped-yes/-no, sos-rate-skip, sos-checkin are in the contract (RC14). No new routes or events.
Verb signatures and errors (3.2): see actions-sos-report-annex.md (Verbs) and contracts/actions-sos.md.
2026-11-07 22:53: no public change. Inside actions.js sameValue and claimRow(prev, patch, next) (six update verbs call it; any new update verb must); inside ui-sos.js ownProfile(c) (read the profile only through it). Verbs, events, routes, UI.pages, data-tour targets unchanged.
- No content keys, routes, UI.pages or data-tour targets added.

### Gates
2026-11-08 01:04 re-check: VERIFIED at 7d9d557: worktree test GREEN 169/169 (C:/Users/ruchi/1-addic-wt/_logs/gates/actions-sos/test-20261108-010436.log); build and validate SKIP (no build.mjs or engine.js at the base); guards RED on the same 21 other-lane tour-target names as guards-20261108-002211.log (guards-20261108-010446.log). The merge preview (trunk build/offline-v1 364b1e2 with the four lane files; the trunk moved to 1c699cb in docs only): node offline/build.mjs exit 0; full Node suite 536/536 (trunk-preview-20261108-010300.log); actions.test.mjs alone 169/169 three times (trunk-preview-20261108-check-r8-actions-run1..3.log); the fixer's own preview the same (trunk-preview-20261108-fixr8-full.log). Before the fix, at cd385a5: 528/536 (trunk-preview-20261108-002223.log). Mutations red: mut-check-r8-{a-skip-lock-set,b-no-builtin,c-no-hopeless}.log, mut-fixr8-*.log (7 of 7), mut-r7-002846-{RS38,RS36R,QBUILTIN,RSSAMPLE}.log. Read by CORE 11310a7c itself: the counts in those preview and test logs, the tip, the trailers, the clean worktree. ASSUMED: the browser gate not run (the HUB's QUIET gates).
2026-11-07 22:53 run: VERIFIED by the fixer at cd385a5: test GREEN 169/169 C:/Users/ruchi/1-addic-wt/_logs/gates/actions-sos/test-20261107-231302.log; guards RED on the same 21 tour-target names as 00a5c08 (guards-20261107-231317.log); red runs actions-sos__RS37R.red.log, RS38.red.log, RS36R.red.log in _logs/reports/actions-sos/; re-check probe logs test-20261107-232340.log, -232818.log. ASSUMED: build SKIP (build-20261107-231302.log) and validate SKIP (validate-20261107-231317.log), no build.mjs or engine.js; browser gate not run.
Gates of the a8dce5a run (VERIFIED test 95/95, guards RED on 21 names) and earlier: see annex (Earlier gates).
Territory 2026-11-08: 655516dc..7d9d557 four own files, 0 shared, 0 errors (check_territory.py); cd385a5..7d9d557 only tests/actions.test.mjs.
Territory 2026-11-07 22:53: 00a5c08..cd385a5 touched only actions.js, ui-sos.js, tests/actions.test.mjs (own); 0 shared.

### Review gates
None.

### Check (2026-11-07 run)
Moved to actions-sos-report-annex.md (Earlier checks and reviews).

### Check (2026-11-08 00:21 run, the lane check of 1cfc936..cd385a5 with the trunk merge preview; wf_2b08aee9-a80)
Verdict FIX at cd385a5: C-R7-1 MEDIUM (PIN, RS11, RS20, RS21, RS22, RS26 waited about 10 ms for the real store's 310000-iteration PBKDF2), C-R7-2 MEDIUM (RS9 needed a 'hopeless' line the trunk catalog dropped in 0bbb7e2), C-R7-3 MEDIUM (the RS24 no-number case met the trunk's intl tel '112'); each confirmed real by a skeptic; none a product defect. Fixed by FIX-R8: C-R7-2 8153d16, C-R7-3 514050d, C-R7-1 7d9d557. Notes: _logs/reports/actions-sos/actions-sos__check-r7.md.

### Check (2026-11-08 01:04 re-check after FIX-R8; wf_9d9b1d01-ce1)
Verdict PASS at 7d9d557: C-R7-1, C-R7-2, C-R7-3 FIXED (evidence under Gates); no new finding; openCheck 0. Notes: _logs/reports/actions-sos/actions-sos__check-r8.md; the fixer's: actions-sos__fix-r8.md.

### Review (2026-11-08 00:02, contracts and tests re-review round 3 over fca2781...cd385a5; wf_66ea28b7-119)
Clean of HIGH and MEDIUM: RC21 LOW (the contract text behind the code; written into contracts/actions-sos.md 00:02), RC22 LOW (a kept session's date untested in the feeling flow and the leave path; offline-v1.1). Q1-Q5 ruled there (RC23 and FIX-USE-SKILL by name, offline-v1.1).

### Review (2026-11-08 01:20, contracts and tests over the round cd385a5..7d9d557)
PASS. R8-RC1 LOW U-10 actions.test.mjs:2317-2318 (also :2330-2331, :2343-2344, :2347-2348): RS22's 'tried once more, at once' is now held by the order of events, not by time (a retry delayed 1.5 s passes RS22; C2 still fails that mutant, so no rule is left without a red test). Ruled LOW, offline-v1.1 by name (FIX-RS22-AT-ONCE: count the refusal, wait for it, then settle and assert calls === 2; probe under _logs/reports/actions-sos/fr8probe/). The safety lens did not run on this round: no product file changed; its verdict at cd385a5 stands.

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

### Review (2026-11-07 17:10 run, round 5)
Moved to actions-sos-report-annex.md (Round 5 review).

### Moved 2026-11-08
Check 17:10, Review 22:08 (RS35-RS37), the 17:10 and 22:08 gates, territory, marks, requests, docs, questions and hub lines: actions-sos-report-annex.md (Moved from the report 2026-11-08 01:28 IST).

### Review (rounds 2 and 3)
Moved to actions-sos-report-annex.md (Earlier review blocks): RS10-RS17, RS19-RS23 all FIXED; their open items became RS24 onward.


### Safety and content marks
2026-11-08: FIX-R8 is test-only: no product file, copy, phrase, URL, network call or innerHTML added; clinicalReview: true kept; clinical review still owed on CRISIS and OVERDOSE.
2026-11-07 22:53: sample rows the person changes become theirs (RS37R, RS38); SOS never reads the sample profile (RS36R). No copy, phrase, list, network call, innerHTML or URL added; clinicalReview: true kept, clinical review still owed on CRISIS and OVERDOSE.
2026-11-07 22:08: sample rows never read as the person's own (RS-SAMPLE, RS35 stock-line check, RS37, RS36); built-in 112 fallback in every urgent list (Q-BUILTIN); notes shown (RS33). No crisis list widened this run; clinicalReview: true kept; clinical review still owed on CRISIS and OVERDOSE. No network call, innerHTML or URL added. Earlier marks: annex.
clinicalReview: true passages: none (no copy in U-09). verify: true resources: none. actions.js holds no crisis copy, network call, URL, innerHTML or 'addict' (grep). Safety writes proved by 10 mutations (drill guard, slip event, used-means-slip, locale en, backup check and others). The marks arrive with U-10 and U-11.

### Requests for other lanes
- (2026-11-08) tests-docs (CORE's hooks round after this merge) and any lane whose Node test meets the real store: wait by condition (until in actions.test.mjs), never by a fixed settle. SCREENS: none.
- (2026-11-07 22:53) SCREENS: nothing needed; the Safety Net may still skip sending an unchanged form. Any new update verb on a row that may be sample must call claimRow. Engine/content: sample startDate under O6 remains.
- (2026-11-07 22:08) engine: tell a filled spiral reply from the person's own (engine.js:728 fills reply from slipSelfTalk; reply '' plus stockReply, or own: false). SCREENS: Safety Net editor may offer 'Add as my own' for sample rows and should not send an unchanged form (the LOW). Engine/content: the sample profile's startDate becomes profile me in a fresh notebook (day counters). plans.update, plan debrief, predictions complete and todos done still keep the sample mark (only if CORE rules it in). Earlier requests: annex.
- Earlier requests (C2 label, tests-docs hooks, content sample flag, engine and core asks): see annex (Earlier requests).

### Docs owed
New 2026-11-08: none.
New 2026-11-07 22:53: none beyond 22:08 (guide: a change to a sample row makes it theirs; a Save with no change does not).
New 2026-11-07 22:08: guide text that sample rows turn into the person's own when edited, and that onboarding opens once after looking around.
See actions-sos-report-annex.md (Docs owed); new 2026-11-07 16:20: guide text for the numbers lead on 'Something else', the overdose card, 'This was not saved.'.

### Open questions
2026-11-08: R8-RC1 (LOW, ruled offline-v1.1). The fixer asked whether the trailer should name the model that ran: no, the program's rules fix the trailer text (Co-Authored-By: Claude Fable 5.1); nothing amended.
2026-11-07 22:53 (defaults taken): the three under Review 22:53; the 22:08 questions on the engine telling a filled reply, Today card, Safety Net refusal and sample startDate stay open for the chat.
2026-11-07 22:08 (defaults taken): onboarding opens once a visit after the sample; an edited sample contact becomes theirs; a spiral pair needs a non-stock reply the person saved; open: the questions under Review 22:08 and the LOW.
Earlier open questions (2026-11-07 and 15:46 lists): see annex.

### For the HUB at the merge
- 2026-11-08 01:28 IST: tip 7d9d557; since cd385a5 only offline/tests/actions.test.mjs changed (4 own files since 655516dc, no shared files, no package changes); the merge preview (trunk + the four files) 536/536, actions.test.mjs 169/169 three times on the real store.js (about 60 s a run); lifts the baselined name 'actions (U-09; store: real, engine: real) > validation failures write nothing' (ok on the preview); carries the RS-SAMPLE tag condition (42f5a9a; 54405c7, b20cdb3, cd385a5); guards in the worktree the same 21 other-lane tour targets; nothing above LOW open; state READY.
- 2026-11-07 22:53: tip cd385a5; 3 own files changed since 00a5c08 (actions.js, ui-sos.js, tests/actions.test.mjs), no shared files; guards RED on the same 21 names; test 169/169; 0 findings open; state READY.
- 2026-11-07: still no shared files and no package changes; 4 own files; expect guards RED on the 21 tour-target names until the screen lanes and core's shell merge; build and validate SKIP on this branch, run them after the merge; browser cases owed by tests-docs.
- Shared files touched: none. build.mjs on trunk already lists actions.js, ui-sos.js, ui-onboarding.js.
- package.json / package-lock.json: no changes (none on the base).
- Conflicts to expect: none; two new files only.
- Territory warnings: none.
- Browser tests for the quiet window: none in this slice.
