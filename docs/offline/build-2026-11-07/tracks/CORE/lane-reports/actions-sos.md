## actions-sos (CORE, 1-addic offline build): the lane report

State: READY at f5f7b9d (2026-11-09 15:46 IST: continued from 95aac382; V-17b built by one builder, no cap hit; check PASS at f5f7b9d, 2 LOW (C1 trailer, C2 carried) open; no review run, openReview 0; browser 28/28 green). Earlier: READY at 638c94a (15:06), b735852 (2026-11-08 09:07), READY-SLICE at 3e3ffbc, READY at cd385a5, RED at 00a5c08; annex (Earlier states). Branch build/actions-sos (worktree C:/Users/ruchi/1-addic-wt/actions-sos). Base 95aac382 (this run; 60dffe33, 87582bd4, 655516dc earlier). Tip f5f7b9d. Units: U-09, U-10, U-11, FIX-SAFETY-AS, FIX-ONB-EMO, FIX-R2-SAFETY, FIX-R2-REST, FIX-R3 to FIX-R8, V-08a, V-SOS10, V-41, V-25, V-18, V-17b. Held: none.
Commits (newest first):
- 2026-11-09 15:46 run, 95aac382..HEAD: f5f7b9d fix V-17b SOS waiting saves carry the lock row's mark (Store.status().lockId)
- 2026-11-09 15:06 run, 60dffe33..HEAD: 638c94a fix V-18 RC23, RC22, R8-RC1; d9e105a feat V-25 unlock gives a sign of life
- 2026-11-08 09:07 run, 87582bd4..HEAD: b735852 test RS1 (claim refuses a protected reward, each protection alone); fb5015b test RC4 (slip among the steps); 94c4e5f test RC3 (export, reset, import keeps the four events); e4025f8 test RC2 (swap refusals); 7d8a261 test RC1 (reward already open); 6c77d1d feat V-41 Actions.objective.done and swap, Actions.questLine.claim (R-O-6, R-C-50)
- 2026-11-08 run, f69bc68a..HEAD: 3e3ffbc fix(actions-sos V-SOS10): the SOS rating '10' stays on one line at 390 px; b7b4db9 feat(actions-sos V-08a): Actions.useSkill({skillId, helpful}) -> {ok, event}
Commits (655516dc..HEAD, newest first):

### Turn caps
- 2026-11-09 15:46 run: one builder for V-17b, steps_used 33, note returned, capHits 0. Trailer names Opus 5.5 (C1).
- 2026-11-09 15:06 run: one builder for V-25 and V-18, steps_used 53, note returned, capHits 0. Both commits carry the Opus 5.5 trailer only (C1).
- 2026-11-08 09:07 run: builders none listed by the harness (V-41 is 6c77d1d; fix agents committed the five test fixes); capHits 0.
- 2026-11-08 04:55 run: one builder for V-08a and V-SOS10, steps_used 33, note returned, capHits 0.
- Earlier turn caps (R3 to R5 fixers capHits 0; FIX-R2-REST first builder hit its 80-turn cap, capHits 1; U-09 34 steps): annex.

### Units
- 2026-11-09 15:46 V-17b (f5f7b9d; ui-sos.js, tests/actions.test.mjs). For a person: if the PIN changes, is set or is removed in another tab while an SOS save waits, the waiting save is dropped and "This was not saved." shows; nothing is written under a lock it was not queued for. The mark is era:hasLock:lockId, taken when save() begins (stronger than queue time; the code wins over the brief); hasLock stays for a store without lockId. 11 tests, 5 red without the fix; M1-M11 red (M6 first an equivalent mutant, replaced). Closed: RS26 remainder, RS22 (any lock-row change drops the save). Two real tabs not proved here (stub; core store.test.mjs proves the mark). C2: no code, V-08a test checks the error code (actions.test.mjs:3089); early return :3084 dead on the trunk.
- 2026-11-09 V-25 (d9e105a; ui-onboarding.js, tests/actions.test.mjs, styles.css one rule). For a person: after Unlock on the lock screen a quiet line "Opening your notebook" shows under the button while the PIN is checked, and goes on a right PIN, a wrong PIN (after the pause) or an error; a screen reader hears it. PIN field and Unlock stay disabled; urgent help and SOBER stay open. 5 tests; M1-M12 red. Closed: where the line sits (under Unlock, default). The owner times it on a phone (about 1.2 s on the PC).
- 2026-11-09 V-18 (638c94a; actions.js, tests/actions.test.mjs). For a person: marking a sample plan done or skipped keeps it the sample's (Erase sample still takes it) and writes no BattlePlanCreated; writing their own words over a sample plan makes it theirs, one BattlePlanCreated, no second on a later status change. RC22 and R8-RC1 are test-only (RS22 unchanged). 6 tests; M13-M19 red. Closed: RC22, RC23, R8-RC1 rulings built. Detail: actions-sos__units.md lines 980-1016.
- 2026-11-08 09:07 V-41 (6c77d1d; actions.js, tests/actions.test.mjs; fixes 7d8a261, e4025f8, 94c4e5f, fb5015b, b735852, test only). For a person: nothing on screen yet. Today can call Actions.objective.done(id) and swap(id) (once a day) and Actions.questLine.claim(step): done writes ObjectiveDone, swap ObjectiveSwapped, claim QuestLineStepDone plus one FeatureUnlocked for the reward (never SOS, help, lessons, Settings, export or data; refusals not-claimable, bad-reward, swap-used, not-today). Nothing is removed or lowered and a slip leaves claimed steps. A loaded sample is not a refusal; the own events are written. 14 V-41 tests plus 5 fix tests; M1-M10 red by name. Closed: sample-mode (R-H-41, R-C-48); Engine V-40 shapes used, no stub.
- 2026-11-08 V-08a (b7b4db9; actions.js, tests/actions.test.mjs). For a person: nothing on screen yet. Other lanes can log a skill use with Actions.useSkill({skillId, helpful}); it never throws and writes one SkillUsed with exactly those two fields, also while a sample is loaded (the event is the person's own, unmarked, R-C-48). Codes: bad-event, bad-skill, no-store and LOCKED (passed through), error. Extra keys are dropped. 4 named tests pass; 7 of 7 mutations red. Closed: the sample-mode question (no such code).
- 2026-11-08 V-SOS10 (3e3ffbc; ui-sos.js). For a person: on SOS the rating '10' stays on one line at 390 px (inline button style: 4px side padding, nowrap, tabular digits; hooks, grid and 56px target unchanged; no styles.css edit, R-C-48/R-H-41). Node test passes; 6 of 6 mutations red. Not proved in a real browser yet.
- Held or blocked this run: none. Next in batches: V-25 (lock form hook lock-opening, ui-onboarding.js), V-18, V-17b (after core V-17a; reads Store.status().lockId).
- 2026-11-07 17:10 FIX-R5 and 22:08 FIX-R6 unit text: annex (Moved by the 2026-11-08 run).
- Earlier units (U-09 slice, FIX-R2-SAFETY, FIX-R2-REST, FIX-R3, FIX-R4, FIX-R5): per-unit text in annex (Earlier units).
- Held or blocked: none.

### Contract changes
2026-11-09 15:46: no public change; ui-sos.js reads Store.status().lockId (string check) in its save mark.
2026-11-09: no public verb, event or route change. New COPY.opening, id and hook data-testid lock-opening (p#lock-opening, ui-onboarding.js lockPage; contracts/actions-sos.md:198); internal claimRow and plans.update per :172, :177, :183.
2026-11-08 09:07: new Actions.objective.done({id}), objective.swap({id}), Actions.questLine.claim({step}) -> {ok, event, feature?} or {ok:false, code, message}; events ObjectiveDone, ObjectiveSwapped, QuestLineStepDone, FeatureUnlocked (own, unmarked) in EVENT_TYPES; codes bad-objective, not-today, swap-used, not-ready, not-claimable, bad-reward, LOCKED, error. Contract file still says locked and lacks the additive feature field (C3).
2026-11-08: new public Actions.useSkill({skillId, helpful}) -> {ok, event} or {ok:false, code, message}; codes bad-event, bad-skill, no-store, LOCKED, error; event SkillUsed {skillId, helpful}. No new routes, UI.pages or data-tour targets; V-SOS10 is inline style, no CSS. Contract file tracks/CORE/contracts/actions-sos.md :195 and :197 still list sample-mode and .sos-rating .btn (finding C1).
2026-11-07: hook onb-score-ok (C3) is new, not yet in the contract or hooks.mjs; sos-slip-continue (RS16) replaces the two start buttons when logged=1; Store.subscribe payload { label } is relied on (C2). Hooks sos-step-next/-done, sos-helped-yes/-no, sos-rate-skip, sos-checkin are in the contract (RC14). No new routes or events.
Verb signatures and errors (3.2): see actions-sos-report-annex.md (Verbs) and contracts/actions-sos.md.
- No content keys, routes, UI.pages or data-tour targets added.

### Gates
2026-11-09 15:46 run: VERIFIED by the check at f5f7b9d (C:/Users/ruchi/1-addic-wt/_logs/gates/actions-sos/): build GREEN 1209891 B build-20261109-161652.log; test GREEN 213/213 test-20261109-161653.log; validate GREEN validate-20261109-161719.log; guards GREEN 5/5 guards-20261109-161719.log; browser GREEN 28/28 browser-20261109-161824.log. VERIFIED by the builder: build-20261109-161321.log, test-20261109-161321.log, validate-20261109-161354.log, guards-20261109-161355.log, browser-20261109-161355.log; red/green/mutation logs _logs/reports/actions-sos/actions-sos__V-17b.red.log, .green.log, .mut.log. ASSUMED: mutations not re-run; two real tabs; no merge preview.
Territory 2026-11-09 15:46: 95aac382..HEAD 2 files, both own (ui-sos.js, tests/actions.test.mjs); 0 shared, 0 unowned; uncommitted offline/1-addic.html is build output.
Gates of earlier runs (2026-11-08 04:55, 2026-11-07 22:53 and before): annex (Earlier gates, moved 2026-11-09).
2026-11-09 15:06 run: VERIFIED by the check at 638c94a (logs in C:/Users/ruchi/1-addic-wt/_logs/gates/actions-sos/): build GREEN 1206087 B build-20261109-152023.log; test GREEN 202/202 test-20261109-152023.log; test --full GREEN 662/662 in 15 files test-20261109-152422.log; validate GREEN validate-20261109-152052.log; guards GREEN 5/5 guards-20261109-152053.log; browser GREEN 28/28 browser-20261109-152147.log. VERIFIED by the builder: build-20261109-151641.log, test-20261109-151643.log, validate-20261109-151719.log, guards-20261109-151720.log, browser-20261109-151731.log; mutation log _logs/reports/actions-sos/actions-sos__V-25-V-18.mut.log (19 red). ASSUMED: mutations not re-run by the check; unlock time on a phone; no merge preview.
Territory 2026-11-09: 60dffe33..HEAD touched 4 files: actions.js, ui-onboarding.js, tests/actions.test.mjs (own), styles.css (shared, one new section at the end under /* -- actions-sos -- */, no token redefined); 0 unowned; the uncommitted offline/1-addic.html is build output.


### Review gates
None.

### Check (2026-11-09 15:46 run)
Continued from 95aac382: judged only commits after it; PASS at f5f7b9d; territory clean. Not checked: two real tabs, mutations re-run, earlier units line by line, clinical wording (no copy added); findings file not written (checker read-only).
- C1 LOW V-17b f5f7b9d trailer: names Opus 5.5, not Fable 5.1 (PLAN.md:110); Claude-Session line correct. Fix: none (session attribution rule; CORE decides). Re-check: none.
- C2 LOW V-08a actions.test.mjs:3084 (carried): early return is dead on the trunk; V-41 locked test covers done, swap, claim; one-line assert if wanted. Fix: none. Re-check: none.

### Check (2026-11-09 15:06 run)
Continued from 60dffe33: judged only commits after it; PASS at 638c94a; territory clean. Not checked: mutations re-run, phone timing, merge preview, units before base line by line; findings file not written (checker read-only), findings here.
- C1 LOW V-25, V-18 commit trailers d9e105a, 638c94a: only the Opus 5.5 line, not the program's Fable 5.1 and Claude-Session lines (PLAN.md rule 6). Fix: none (builder followed this session's attribution rule; CORE decides, nothing amended). Re-check: none.

### Check (2026-11-08 09:07 run)
Continued from 87582bd4: judged only commits after it; PASS at 6c77d1d; territory clean (2 own files); trailers present. Not checked: browser gate; units before base; content V-42 real rewards (tests seed fixtures).
- C3 LOW V-41 contracts/actions-sos.md R-O-6 claim line: record not-claimable and the feature field. HUB-owned. Fix: none. Re-check: none.
- C2 LOW V-08a tests/actions.test.mjs:3084 (carried): assert the lock API, test the error code. Fix: none (the V-41 locked test does it). Re-check: none.

### Earlier checks (2026-11-08 04:55, 2026-11-07 and 22:08 runs): annex (Earlier checks, moved 2026-11-09).
### Check (2026-11-07 22:53 run)

### Review (2026-11-07 22:53 run, contracts and safety over 655516dc...HEAD; finder re-check at cd385a5; evidence actions-sos__review-safety.md Round 7, actions-sos__fr6recheck3.probe.test.mjs)
Contracts reviewer: no findings.
- RS37R MEDIUM U-09 actions.js plans.update, plans.debrief, predictions.complete, contacts.update: a person's rewrite, debrief or result kept sample: true and Erase sample deleted it. Fix 54405c7 (claimRow). Re-check: FIXED.
- RS38 LOW U-09 actions.js contacts.update: dropped the mark on a no-change Save. Fix b20cdb3. Re-check: FIXED.
- RS36R MEDIUM U-10 ui-sos.js:852, :539, :553: the sample profile's stage and region reached SOS (a motivation row with stage action). Fix cd385a5 (ownProfile). Re-check: FIXED. New findings from the re-check: none. Questions: none.
- Open questions from the fixer: plans.update with status alone drops the mark (default as ruled); '', null and absent are one value; plans.update still writes the person's BattlePlanCreated event.

### Review (2026-11-07 22:08 run): RS35 HIGH, RS37 MEDIUM, RS36 MEDIUM and one LOW; text and re-checks in annex (Moved by the 2026-11-08 run).

### Review (2026-11-07 17:10 run, round 5)
Moved to actions-sos-report-annex.md (Round 5 review).

### Review (rounds 2 and 3)
Moved to actions-sos-report-annex.md (Earlier review blocks): RS10-RS17, RS19-RS23 all FIXED; their open items became RS24 onward.

### Review (2026-11-08 09:07 run, contracts and safety over 87582bd4...HEAD; finder re-check at b735852)
- RC1 MEDIUM V-41 actions.js:918: the once-per-feature guard in claim was unproved. Fix 7d8a261. Re-check FIXED.
- RC2 LOW V-41 objective.swap: refusal codes unasserted. Fix e4025f8. FIXED.
- RC3 LOW V-41 tests: no export/erase/import round trip of the four events. Fix 94c4e5f. FIXED.
- RC4 LOW V-41: slip rule unproved. Fix fb5015b. FIXED.
- RS1 LOW V-41 test:3381: reward test did not isolate each protection. Fix b735852. FIXED. No new findings.
- Questions (defaults taken, for the chat): two tabs may write twice, Engine counts once; swap codes no-swap/not-today vs R-C-50 bad-objective; swapTo may be already done; rewardOk lets network, recoveryPlan, tools and status pass (content V-42 or validateContent); a claimed step whose reward left Content answers bad-reward; Today shows refusal messages verbatim (plainer words?); no lane refuses a sober-day event as a quest condition.

### Review (2026-11-08 04:55 run)
None run (reviewGates empty); openReview 0.

### Review (2026-11-09 15:46 run)
None run (reviewGates empty); openReview 0. CORE's whole-lane review from f69bc68a follows.

### Review (2026-11-09 15:06 run)
None run (reviewGates empty, skipReview until V-17b); openReview 0.

### Safety and content marks
2026-11-09 15:46: V-17b adds no copy, event or network call; a dropped save only shows the existing toast; SOS never gated.
2026-11-09: V-25 adds one polite line in COPY (clinicalReview: true kept), no network call, innerHTML or URL; SOS and SOBER never gated, urgent help stays enabled while unlocking; V-18 only changes the sample mark and one event, no copy.
2026-11-08 09:07: claim never opens SOS, help, lessons, Settings, export or data (proved per protection, RS1); a slip removes nothing (RC4); no copy, phrase, network call, innerHTML or URL added; refusal messages plain; clinicalReview: true kept.
2026-11-08: useSkill writes only skillId and helpful and refuses before any write; no crisis copy, phrase, network call, innerHTML or URL added; V-SOS10 uses h() with a style object; clinicalReview: true kept.
clinicalReview: true passages: none (no copy in U-09). verify: true resources: none. actions.js holds no crisis copy, network call, URL, innerHTML or 'addict' (grep). Safety writes proved by 10 mutations (drill guard, slip event, used-means-slip, locale en, backup check and others). The marks arrive with U-10 and U-11.

### Requests for other lanes
- (2026-11-09 15:46) CORE: rule on the trailer (C1); whole-lane review. core: store.test.mjs keeps the lockId proof across tabs.
- (2026-11-09) tests-docs: add hook lock-opening (p#lock-opening, data-testid) to helpers/hooks.mjs, filed by outbox; no browser flow reads it yet. CORE: rule on the trailers (C1). core V-17a before V-17b.
- (2026-11-08 09:07) HUB: fix the contract claim line (C3). today-track: call objective.done/swap and questLine.claim, show refusals. content V-42: rewards must pass rewardOk, no tools or status. engine: validateContent should refuse a sober-day event as a condition.
- (2026-11-08) tests-docs: run the browser gate --grep sos and re-take sos-craving-phone.png (U-35) after the merge. game-tutorials/today: V-08b wires Actions.useSkill at ui-tools.js:315. CORE: fix the contract lines :195 and :197 (C1) or rule they stay. core V-17a before V-17b.
- (2026-11-07 22:53) SCREENS: nothing needed; the Safety Net may still skip sending an unchanged form. Any new update verb on a row that may be sample must call claimRow. Engine/content: sample startDate under O6 remains.
- Earlier requests (C2 label, tests-docs hooks, content sample flag, engine and core asks): see annex (Earlier requests).

### Docs owed
2026-11-09 15:46: none for V-17b.
2026-11-09: none for V-25 or V-18.
2026-11-08 09:07: none new for V-41 (no screen).
2026-11-08: none new; the guide screenshot sos-craving-phone.png is re-taken after the merge.
Docs owed text of 22:53, 22:08, 17:10, 16:20: annex (Moved by the 2026-11-08 run).

### Open questions
2026-11-09 15:46 (defaults taken): mark taken at save() start, not queue time (code wins). Open: C1, C2 (LOW); C3 carried.
2026-11-09 (defaults taken): the opening line sits under Unlock; line stays in the DOM empty (aria-live, never hidden). Open: C1 (LOW), C3 and C2 carried.
2026-11-08 09:07 (defaults taken): sample is not a refusal; two-tab double write accepted; the review questions above stay open for the chat. Open: C3, C2 (LOW).
2026-11-08 (defaults taken): useSkill never refuses for a sample (R-C-48); extra keys dropped, not refused. Open: C1 and C2 (LOW); browser gate for V-SOS10.
Earlier open questions (2026-11-07 and 15:46 lists): see annex.

### For the HUB at the merge
- 2026-11-09 15:46: tip f5f7b9d; 2 own files changed since 95aac382, no shared files; build, test 213/213, validate, guards 5/5, browser 28/28 GREEN; 0 review findings, 2 LOW check notes; state READY; V-17b needs core V-17a (merged).
- 2026-11-09: tip 638c94a; 4 files changed since 60dffe33 (3 own, styles.css one appended section under the actions-sos banner); build, test 202/202 (662/662 full), validate, guards, browser 28/28 GREEN; 0 review findings, 1 LOW check note (C1); state READY. V-17b waits for core V-17a.
- 2026-11-08 09:07: tip b735852; 2 own files changed since 87582bd4, no shared files; build, test 188/188, validate, guards GREEN at 6c77d1d (later fixes test only); browser gate not run; 0 review findings open, 2 LOW check notes; state READY.
- 2026-11-08: tip 3e3ffbc; 3 own files changed since f69bc68a, no shared files; build, test 174/174, validate, guards GREEN; browser gate not run; 2 LOW findings open (C1, C2); state READY-SLICE.
- Shared files touched: none. build.mjs on trunk already lists actions.js, ui-sos.js, ui-onboarding.js.
- package.json / package-lock.json: no changes (none on the base).
- Conflicts to expect: none; two new files only.
- Territory warnings: none.
- Browser tests for the quiet window: none in this slice.

### Whole-lane review (2026-11-09 18:07 IST)

Two rounds, both lenses clean at a397a8d. Round 1 (wf_4d2ab8ba-606): ES1 f6ece46, EC1 2898cd8, EC2 5fd0904 FIXED; ES3 4376554 comment only, accepted. Round 2 (wf_6da935fd-7ff): F1 31e6631, F2 7bbecf0, F3 a397a8d FIXED. LOWs for offline-v3.2: EC3, ES2, EF1, SF1, FIX-IMPORT-MARK. Results: C:/Users/ruchi/1-addic-wt/_logs/reports/actions-sos/end-review/.
