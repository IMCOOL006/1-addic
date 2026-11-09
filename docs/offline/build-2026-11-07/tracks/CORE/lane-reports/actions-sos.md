## actions-sos (CORE, 1-addic offline build): the lane report

State: READY at e646e62 (2026-11-09 19:56 IST: CONTINUED from 82c5eddf; FIX-AS-V32 built by one builder, no cap hit; check PASS at e646e62, 3 LOW (C1 SF1 residual path, C2 trailer, C3 contract line) open; two reviewers over 82c5eddf...e646e62: 0 findings, 2 questions; browser SOS 4, lock 4, PIN 2 green; full test 763/763). Earlier: READY at f5f7b9d (15:46), 638c94a (15:06), b735852, READY-SLICE at 3e3ffbc, READY at cd385a5, RED at 00a5c08; annex. Branch build/actions-sos (worktree C:/Users/ruchi/1-addic-wt/actions-sos). Base 82c5eddf (this run). Tip e646e62. Units: U-09, U-10, U-11, FIX-SAFETY-AS, FIX-ONB-EMO, FIX-R2-SAFETY, FIX-R2-REST, FIX-R3 to FIX-R8, V-08a, V-SOS10, V-41, V-25, V-18, V-17b, FIX-AS-V32. Held: none.
Commits (newest first):
- 2026-11-09 19:56 run, 82c5eddf..HEAD: e646e62 fix FIX-AS-V32 SF1 practice held on a hash no other entry has; 517836f test EF1 router tests see the discreet flag; 8555c7d fix ES2 a retry clears the old PIN message; 30f8aee fix EC3 USE_VERB message names useSkill; 908e498 test ES3T kept save dropped on another tab's import (two real stores)
- 2026-11-09 15:46 run, 95aac382..HEAD: f5f7b9d fix V-17b SOS waiting saves carry the lock row's mark (Store.status().lockId)
Commits (655516dc..HEAD, newest first):

### Turn caps
- 2026-11-09 19:56 run: one builder for FIX-AS-V32, steps_used 56, note returned, capHits 0. All five commits carry Co-Authored-By Opus 5.5 and Claude-Session 987cb3b4 (C2).
- 2026-11-09 15:46 run: one builder for V-17b, steps_used 33, note returned, capHits 0. Trailer names Opus 5.5 (C1).
- 2026-11-09 15:06 run: one builder for V-25 and V-18, steps_used 53, note returned, capHits 0. Both commits carry the Opus 5.5 trailer only (C1).
- 2026-11-08 09:07 run: builders none listed by the harness (V-41 is 6c77d1d; fix agents committed the five test fixes); capHits 0.
- 2026-11-08 04:55 run: one builder for V-08a and V-SOS10, steps_used 33, note returned, capHits 0.
- Earlier turn caps (R3 to R5 fixers capHits 0; FIX-R2-REST first builder hit its 80-turn cap, capHits 1; U-09 34 steps): annex.

### Units
- 2026-11-09 19:56 FIX-AS-V32 (908e498, 30f8aee, 8555c7d, 517836f, e646e62; actions.js, ui-onboarding.js, ui-sos.js, tests/actions.test.mjs). For a person: (ES2) a retry after a wrong PIN takes the old PIN message away while the new try runs, only after the empty-PIN guard; a wrong PIN still pauses. (SF1) finishing the craving flow on the lock page holds the practice on #/sos/craving?from=lock (L.sober.href unchanged), so the first Back works; still locked, urgent help and SOBER need no PIN. (EC3) developer message only, USE_VERB names useSkill. (ES3T, EF1) tests and comments only: a kept save is dropped and told once on another tab's import (two real stores); Done on a discreet lock page keeps its chrome. No public name, event, copy or resource changed. Closed: ES3T, EC3, ES2, EF1, SF1 of the review; each proved red with the change reverted (logs: actions-sos__units.md, FIX-AS-V32 section); SF1 also checked in real Chrome 157 at 390 px.
- 2026-11-09 15:46 V-17b (f5f7b9d; ui-sos.js, tests/actions.test.mjs). For a person: if the PIN changes, is set or is removed in another tab while an SOS save waits, the waiting save is dropped and "This was not saved." shows; nothing is written under a lock it was not queued for. The mark is era:hasLock:lockId, taken when save() begins (stronger than queue time; the code wins over the brief); hasLock stays for a store without lockId. 11 tests, 5 red without the fix; M1-M11 red (M6 first an equivalent mutant, replaced). Closed: RS26 remainder, RS22 (any lock-row change drops the save). Two real tabs not proved here (stub; core store.test.mjs proves the mark). C2: no code, V-08a test checks the error code (actions.test.mjs:3089); early return :3084 dead on the trunk.
- 2026-11-09 V-25 (d9e105a; ui-onboarding.js, tests/actions.test.mjs, styles.css one rule). For a person: after Unlock on the lock screen a quiet line "Opening your notebook" shows under the button while the PIN is checked, and goes on a right PIN, a wrong PIN (after the pause) or an error; a screen reader hears it. PIN field and Unlock stay disabled; urgent help and SOBER stay open. 5 tests; M1-M12 red. Closed: where the line sits (under Unlock, default). The owner times it on a phone (about 1.2 s on the PC).
- 2026-11-09 V-18 (638c94a; actions.js, tests/actions.test.mjs). For a person: marking a sample plan done or skipped keeps it the sample's (Erase sample still takes it) and writes no BattlePlanCreated; writing their own words over a sample plan makes it theirs, one BattlePlanCreated, no second on a later status change. RC22 and R8-RC1 are test-only (RS22 unchanged). 6 tests; M13-M19 red. Closed: RC22, RC23, R8-RC1 rulings built. Detail: actions-sos__units.md lines 980-1016.
- Held or blocked this run: none. Next in batches: V-25 (lock form hook lock-opening, ui-onboarding.js), V-18, V-17b (after core V-17a; reads Store.status().lockId).
- 2026-11-07 17:10 FIX-R5 and 22:08 FIX-R6 unit text: annex (Moved by the 2026-11-08 run).
- Earlier units (U-09 slice, FIX-R2-SAFETY, FIX-R2-REST, FIX-R3, FIX-R4, FIX-R5): per-unit text in annex (Earlier units).
- Held or blocked: none.

2026-11-09 19:56: no public change; the held hash is #/sos/craving?from=lock (parseSos reads only drill, preview, logged, kept; every reader of the hash unchanged). contracts/actions-sos.md:239 still says L.sober.href (C3).
### Contract changes
2026-11-09 15:46: no public change; ui-sos.js reads Store.status().lockId (string check) in its save mark.
2026-11-09: no public verb, event or route change. New COPY.opening, id and hook data-testid lock-opening (p#lock-opening, ui-onboarding.js lockPage; contracts/actions-sos.md:198); internal claimRow and plans.update per :172, :177, :183.
Verb signatures and errors (3.2): see actions-sos-report-annex.md (Verbs) and contracts/actions-sos.md.
- No content keys, routes, UI.pages or data-tour targets added.

2026-11-09 19:56 run: VERIFIED by the check at e646e62 (logs in C:/Users/ruchi/1-addic-wt/_logs/gates/actions-sos/): build GREEN 1213155 B build-20261109-200928.log; test GREEN 226/226 test-20261109-200928.log; validate GREEN validate-20261109-201051.log; guards GREEN 5/5 guards-20261109-201051.log; browser --grep SOS 4 browser-20261109-201251.log; lock 4 browser-20261109-201411.log; PIN 2 browser-20261109-201447.log. VERIFIED by the safety reviewer at e646e62: build-20261109-202209.log; test 226/226 test-20261109-202210.log; test --full GREEN 763/763 in 16 files test-20261109-202608.log (758 at base plus 5 new); validate-20261109-202248.log; guards 5/5 guards-20261109-202248.log; browser SOS 4 browser-20261109-202423.log, lock 4 -202446.log, PIN 2 -202512.log. The RED line browser-20261109-202248.log in gates-summary.log is the reviewer's own command (cmd.exe split SOS|lock|PIN, no test ran). VERIFIED by the builder: build-20261109-200451.log, test-20261109-200453.log, validate-20261109-200527.log. ASSUMED: mutations not re-run by the check; full browser suite not run; no merge preview.
Territory 2026-11-09 19:56: 82c5eddf..HEAD 4 files, all own (actions.js, ui-onboarding.js, ui-sos.js, tests/actions.test.mjs); 0 shared, 0 unowned, 0 errors, 0 warnings; uncommitted offline/1-addic.html is build output.
### Gates
2026-11-09 15:46 run: VERIFIED by the check at f5f7b9d (C:/Users/ruchi/1-addic-wt/_logs/gates/actions-sos/): build GREEN 1209891 B build-20261109-161652.log; test GREEN 213/213 test-20261109-161653.log; validate GREEN validate-20261109-161719.log; guards GREEN 5/5 guards-20261109-161719.log; browser GREEN 28/28 browser-20261109-161824.log. VERIFIED by the builder: build-20261109-161321.log, test-20261109-161321.log, validate-20261109-161354.log, guards-20261109-161355.log, browser-20261109-161355.log; red/green/mutation logs _logs/reports/actions-sos/actions-sos__V-17b.red.log, .green.log, .mut.log. ASSUMED: mutations not re-run; two real tabs; no merge preview.
Territory 2026-11-09 15:46: 95aac382..HEAD 2 files, both own (ui-sos.js, tests/actions.test.mjs); 0 shared, 0 unowned; uncommitted offline/1-addic.html is build output.
Gates of earlier runs (2026-11-08 04:55, 2026-11-07 22:53 and before): annex (Earlier gates, moved 2026-11-09).


### Review gates
None.

### Check (2026-11-09 19:56 run)
Continued from 82c5eddf: judged only commits after it; PASS at e646e62; territory clean. Not checked: full Node suite (--full is the HUB's; reviewer ran 763/763), full browser suite, U-09 to V-17b beyond present and green by name, builders' mutation proofs re-run.
- C1 LOW FIX-AS-V32 SF1 ui-onboarding.js:275: the fixed hash can still sit on two adjacent entries (practice held, reload on it, craving to Finish, practice again), so the first Back can do nothing; rare path. Fix: none. Re-check: none. Evidence actions-sos__checker-sf1-second.log.
- C2 LOW FIX-AS-V32 all five commits: trailer Opus 5.5, task asked Fable 5.1; Claude-Session right. Fix: none (CORE decides). Re-check: none.
- C3 LOW FIX-AS-V32 SF1 contracts/actions-sos.md:239: still says L.sober.href; HUB-owned. Fix: none. Re-check: none.

### Check (2026-11-09 15:46 run)
Continued from 95aac382: judged only commits after it; PASS at f5f7b9d; territory clean. Not checked: two real tabs, mutations re-run, earlier units line by line, clinical wording (no copy added); findings file not written (checker read-only).
- C1 LOW V-17b f5f7b9d trailer: names Opus 5.5, not Fable 5.1 (PLAN.md:110); Claude-Session line correct. Fix: none (session attribution rule; CORE decides). Re-check: none.
- C2 LOW V-08a actions.test.mjs:3084 (carried): early return is dead on the trunk; V-41 locked test covers done, swap, claim; one-line assert if wanted. Fix: none. Re-check: none.


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


### Review (2026-11-08 04:55 run)
None run (reviewGates empty); openReview 0.

### Review (2026-11-09 19:56 run, contracts and safety over 82c5eddf...e646e62)
Contracts reviewer: no findings. Safety reviewer: no findings; the lane adds no word a person reads; the held hash stays an SOS route for every reader; urgent help and SOBER need no PIN; no URL, network API, innerHTML, Math.random or localStorage write added. No fix round, openReview 0.
- Question (contracts): ui-sos.js:505 and :512 with store.js:757: a save kept in a locked tab after another tab's import, before this tab resyncs, takes the old mark and is dropped at the unlock. Default: accepted, as the comment says.
- Question (contracts): ui-core.js:865, raised by SF1: '#/sos/craving' and '#/sos/craving?from=lock' share a path, so Back then Forward between them fires hashchange and redraws. Default: accepted (same as C1).
- Nit (safety): comment at ui-onboarding.js:248 says parseSos ignores the query; it ignores only 'from'. Fix when that line is next touched.

### Review (2026-11-09 15:46 run)
None run (reviewGates empty); openReview 0. CORE's whole-lane review from f69bc68a follows.

2026-11-09 19:56: FIX-AS-V32 adds no copy, resource, event or network call; only the practice hash changes; SOS and SOBER never gated; a wrong PIN still pauses; clinicalReview: true kept.
### Safety and content marks
2026-11-09 15:46: V-17b adds no copy, event or network call; a dropped save only shows the existing toast; SOS never gated.
2026-11-09: V-25 adds one polite line in COPY (clinicalReview: true kept), no network call, innerHTML or URL; SOS and SOBER never gated, urgent help stays enabled while unlocking; V-18 only changes the sample mark and one event, no copy.
clinicalReview: true passages: none (no copy in U-09). verify: true resources: none. actions.js holds no crisis copy, network call, URL, innerHTML or 'addict' (grep). Safety writes proved by 10 mutations (drill guard, slip event, used-means-slip, locale en, backup check and others). The marks arrive with U-10 and U-11.

### Requests for other lanes
- (2026-11-09 19:56) CORE: rule on the trailer (C2). HUB: correct contracts/actions-sos.md:239 (C3).
- (2026-11-09 15:46) CORE: rule on the trailer (C1); whole-lane review. core: store.test.mjs keeps the lockId proof across tabs.
- (2026-11-09) tests-docs: add hook lock-opening (p#lock-opening, data-testid) to helpers/hooks.mjs, filed by outbox; no browser flow reads it yet. CORE: rule on the trailers (C1). core V-17a before V-17b.
- Earlier requests (C2 label, tests-docs hooks, content sample flag, engine and core asks): see annex (Earlier requests).

2026-11-09 19:56: none for FIX-AS-V32; contract line :239 (C3).
### Docs owed
2026-11-09 15:46: none for V-17b.
2026-11-09: none for V-25 or V-18.
2026-11-08 09:07: none new for V-41 (no screen).
2026-11-08: none new; the guide screenshot sos-craving-phone.png is re-taken after the merge.
Docs owed text of 22:53, 22:08, 17:10, 16:20: annex (Moved by the 2026-11-08 run).

2026-11-09 19:56 (defaults taken): hold on the brief's fixed hash; the reviewers' questions accepted. Open: C1, C2, C3 (LOW).
### Open questions
2026-11-09 15:46 (defaults taken): mark taken at save() start, not queue time (code wins). Open: C1, C2 (LOW); C3 carried.
2026-11-09 (defaults taken): the opening line sits under Unlock; line stays in the DOM empty (aria-live, never hidden). Open: C1 (LOW), C3 and C2 carried.
2026-11-08 09:07 (defaults taken): sample is not a refusal; two-tab double write accepted; the review questions above stay open for the chat. Open: C3, C2 (LOW).
2026-11-08 (defaults taken): useSkill never refuses for a sample (R-C-48); extra keys dropped, not refused. Open: C1 and C2 (LOW); browser gate for V-SOS10.
Earlier open questions (2026-11-07 and 15:46 lists): see annex.

### For the HUB at the merge
- 2026-11-09 19:56: tip e646e62; 4 own files changed since 82c5eddf, no shared files; build, test 226/226 (763/763 full), validate, guards 5/5, browser SOS 4, lock 4, PIN 2 GREEN; 0 review findings, 2 questions, 3 LOW check notes; state READY. Contract line :239 to correct.
- 2026-11-09 15:46: tip f5f7b9d; 2 own files changed since 95aac382, no shared files; build, test 213/213, validate, guards 5/5, browser 28/28 GREEN; 0 review findings, 2 LOW check notes; state READY; V-17b needs core V-17a (merged).
- 2026-11-09: tip 638c94a; 4 files changed since 60dffe33 (3 own, styles.css one appended section under the actions-sos banner); build, test 202/202 (662/662 full), validate, guards, browser 28/28 GREEN; 0 review findings, 1 LOW check note (C1); state READY. V-17b waits for core V-17a.
- 2026-11-08 09:07: tip b735852; 2 own files changed since 87582bd4, no shared files; build, test 188/188, validate, guards GREEN at 6c77d1d (later fixes test only); browser gate not run; 0 review findings open, 2 LOW check notes; state READY.
- 2026-11-08: tip 3e3ffbc; 3 own files changed since f69bc68a, no shared files; build, test 174/174, validate, guards GREEN; browser gate not run; 2 LOW findings open (C1, C2); state READY-SLICE.
- Shared files touched: none. build.mjs on trunk already lists actions.js, ui-sos.js, ui-onboarding.js.
- package.json / package-lock.json: no changes (none on the base).
- Conflicts to expect: none; two new files only.
- Territory warnings: none.
- Browser tests for the quiet window: none in this slice.

## CORE's note at the tip (2026-11-09 20:33 IST)

The tip is fb3966b, one comment line after the reviewed e646e62 (the safety reviewer's nit). lane.js's returned `tip` was a reviewer's text; the true tip is from git. Both reviewers: no findings. Their two questions, with the defaults, are on R-C-88.
