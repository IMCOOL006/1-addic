## core (CORE, 1-addic offline build): the lane report

State: READY (2026-11-15 13:22 IST, continued from c4d609d9; tip d11f252; check PASS at d55a102, 1 LOW (C1); review 2 reviewers, 4 LOW findings: RC1, RC2 FIXED, RS2 FIXED, RS1 WONTFIX-ACCEPTED on re-check; open 0; build, store.test 159/0/0 (builder's full Node 813/813 at d55a102), validate, guards GREEN; the full Node suite at d11f252 and the browser are still owed). Earlier: READY (2026-11-15 10:19 IST, continued from 803c96c5; tip cbae1bb; check PASS, 0 findings; test 154/0/0, full 809). Earlier: READY (2026-11-15 09:20 IST, continued from 63eb8257; tip 5f32f03; check PASS at 8f0cdaa; review 2 reviewers, 6 findings: RC1, RC2, RC3, RS1, RS2, RS3 all FIXED on re-check; open 0 findings, owner questions only; build, test 809/0/0, validate, guards, browser 32/0/0 GREEN at the tip). Earlier: RED (2026-11-15 07:14, tip 339ea20); READY (2026-11-14 14:43 IST, tip 11f2f70); RED (2026-11-14 12:07, tip 79c969a); RED (2026-11-09 18:47, tip 4381f1d); READY (2026-11-09 14:49, tip 561cab2); READY (2026-11-08 07:12, tip fbc663d); READY (2026-11-07 17:16, tip 8e80951). Earlier states in the annex. Branch build/core, worktree C:/Users/ruchi/1-addic-wt/core. Base c4d609d9. All units built: U-01, U-03, U-02, U-04, FIX-C4-C5, FIX-SAFETY, FIX-RULINGS, FIX-R2, FIX-V11, V-11, V-46, V-16, V-17a, V-26a, FIX-IMPORT-MARK, FIX-STALE-SAVE-SAY, FIX-SOS-FOCUS, FIX-BULK-REFUSAL-SAY, FIX-TAKEIN-SAY, FIX-STALE-SAVE-KEEP, FIX-RS3-TEST-ALONE, FIX-REMOVE-STALE-ROWS. Dates 2026-11-07 07:26 to 2026-11-15 IST.
Gates after the report was written (2026-11-15 16:04 IST, read by CORE 13:03 from gates-summary.log): the full Node suite at d11f252 GREEN 814/0/0 in 16 files (test-20261115-153953.log, test-20261115-155148.log); browser 5/0/0 by name at d55a102, the same app source (browser-20261115-140728.log); the full 33 flows left to the HUB's merged-tree gates.
Commits c4d609d9..HEAD (2026-11-15 13:22 IST, tip d11f252):
- d11f252 test(core): FIX-REMOVE-STALE-ROWS RC2: the import test carries the brief's exact name
- c463efe test(core): RC1: removing the PIN keeps and counts another tab's unread row
- d55a102 test(core): lock.set() keeps and counts another tab's unread row
- 88aa02d fix(core): an import keeps the unread rows as stored
- 1a33ea5 fix(core): lock.set() seals the stored rows, not memory
- 1c4d3f4 fix(core): lock.remove() rewrites from the stored rows
Earlier: cbae1bb (FIX-RS3-TEST-ALONE, 803c96c5..cbae1bb).
- cbae1bb test(offline core): FIX-RS3-TEST-ALONE: the RS3 end-to-end test polls with a deadline and restores what it loaded
Earlier commit lists (63eb8257..5f32f03 and before): core-report-annex.md (Moved 2026-11-15 10:19).

### Turn caps
- 2026-11-15 10:19 IST (continued from 803c96c5): builders for FIX-RS3-TEST-ALONE: the first committed cbae1bb and ran every gate but returned no note (probably the 80-turn cap, capHits 1); the second (6 steps) checked the commit and logs and rebuilt nothing; one check (PASS); no reviewers.
- 2026-11-15 13:22 IST (continued from c4d609d9): one builder, FIX-REMOVE-STALE-ROWS (48 steps; 1c4d3f4, 1a33ea5, 88aa02d, d55a102), capHits 0; one check (PASS); two reviewers (contracts, safety); one review-fix builder (RC1 c463efe, RC2 d11f252), stopped at the memory floor (3.86 GB at 15:30) with two batch-end gates owed; two re-checks. Earlier runs: annex.

### Units
- 2026-11-15 13:22 IST: FIX-REMOVE-STALE-ROWS (tier 1) 1c4d3f4, 1a33ea5, 88aa02d, d55a102; review fixes c463efe (RC1), d11f252 (RC2); store.js, store.test.mjs only. For a person: with 1-addic open in two tabs, changing or removing the PIN, or importing a backup, no longer drops an entry (an unread row) another tab saved earlier; they come from the stored rows, not this tab's memory; status().unreadable counts them. No new words. store.js: replaceAll reads storage (:571), lock.set uses state.key and sets rows/unread only if the epoch is unchanged (:697-717), remove() decodes the rows from storage (:809-813). Differs from the brief: lock.set() is also the PIN change, so decode(readAll(), null) would strand rows under the old key; it takes state.key (mutant M3 red). Gap kept by design (WANT 4): a plain row another tab saves between the read and the write is still lost (no row version); named in code comments, no retry. Red first on c4d609d (3 red, guard green), mutants 6 of 6 (core__FIX-REMOVE-STALE-ROWS-red.log, -mut.log, -mut2.log, -green.log). Tests 4 new, then RC1 +1: store.test 154 -> 159; Node 809 -> 814 expected. Questions closed: none; the brief's FIX-DRAWN-WRITE-SAY follows in a later run.
- 2026-11-15 10:19 IST: FIX-RS3-TEST-ALONE (tier 1) cbae1bb, offline/tests/store.test.mjs only. For a person: nothing changes in the file (test only). The RS3 end-to-end test and the stale-save loop poll with a deadline (until()) instead of fixed waits, closing the load-sensitive red the HUB saw once (test-20261115-093302.log); the RS3 test's finally restores Content, require.cache and the Engine, Actions and UI globals, so it no longer has to run last. Two 50 ms waits and the 40 ms wait at :1865 stay on purpose (each guards a negative check; commented). Note: until() waits one 10 ms timer before its first check; checking at once turns the stale-save loop red. Test names kept (148 test() calls before and after). Red on 339ea20's ui-core, green 5 of 5 alone (core__rs3-alone-red.log, -green-1..5.log). Closes N2 of R-C-103 and the load red. The 09:20 line 'must stay last' no longer holds.
- Counts: store.test.mjs 132 -> 152 (npm test 809 at the tip) (14 in the batch, 6 in the fix round); npm test 801 on the merged tree after the batch, fix-round total unverified; browser 32 unchanged; tests-docs owns the counts.
- 2026-11-14 (earlier run): FIX-STALE-SAVE-SAY 79df6bf, 9cbbc85, 79c969a, 11f2f70 (a refused save is said in one warn toast), FIX-SOS-FOCUS 324194c (same-path render keeps focus in #main); full text: annex.
- 2026-11-09 18:47 IST: FIX-IMPORT-MARK (tier 1) 12322d3, ae41654 (RC1), 4381f1d (RC2): an import with a PIN set seals the lock row check again, so lockId changes; closes ES3 store half. Full text: core-report-annex.md.
- Earlier units (V-16, V-17a, V-26a, V-46, V-11, FIX-V11 and review fixes): annex (Moved 2026-11-09 18:47).
- Units U-01, U-03, U-02, U-04, FIX-SAFETY, FIX-RULINGS (2026-11-07): full text in core-report-annex.md (Moved 2026-11-15). None held.

- 2026-11-08 V-11 (tier 1), e79e1b0. For a person: from the first byte of 1-addic.html, before any script runs, the page shows the emergency line, a one-tap tel:112 link and "Please verify these numbers."; the first render replaces it, a start failure shows boot.js's block instead. Red first: core__V-11-red.log, mutant core__V-11-mut.log. Questions closed: wording (CORE 11 ruling). Evidence: core__units.md:640.

### Contract changes
- 2026-11-15 13:22 IST: no route, event, shell id or content key change. Behaviour for contracts/core.md: lock.set, lock.remove and replaceAll's unread rows come from the stored rows read just before the write; status().unreadable after them also counts another tab's unread rows; the gap (a plain row saved between read and write) is accepted. Review question: a contracts section for this is the HUB's to write.
- 2026-11-15 09:20 IST: RC3 text now in contracts/core.md:160; the kept line's lifetime (RS3 rule above) goes in its last section for the HUB (builder's CONTRACT note, core__progress.md). Re-check C3 LOW: contract :159 says the line shows again on Done in the lock case; the code only hides it (it stays in the DOM state); HUB to align the words.
- 2026-11-15 07:14 IST: (1) CONTRACT CHANGE, RC3, for contracts/core.md:152: inside Store.bulk() a no-lock refusal's flag rides on the one { label: 'bulk', stale: true } notice sent at the flush, not { label: 'unlock' }; stale is absent elsewhere. write(w, auto): an automatic write (takeIn, after unlock or lock.set) refuses with resync(!auto), so onLock { reason: 'auto', stale: true } is only for a person's own write; the LOCKED error always carries stale. The HUB writes the text. (2) CONTRACT CHANGE: shell ids (section A) gain #kept (plain p, hidden, outside #main, ui-core its only consumer). No route, event, content key or UI.pages entry added.
- 2026-11-14 (earlier): onLock stale field (contracts/core.md :58), same-path focus (:6): annex.
- 2026-11-09 18:47: lockId also changes on an import with a PIN set: the lock row stays; PIN, salt and key do not change; its check is sealed again with a fresh IV (store.js:559-565, one write, state.lock set after it). Update contracts/core.md lines 53, 60, 125, 140, 148 (ES3: add the V-17b test). resync() fires onLock only for a tab that was open before it took the stored row.
- 2026-11-09: Store.status() gains lockId (string, shape above); build stdout gains `part` lines (regex ^part (\S+) (\d+) B \((\d+\.\d) kB\)$). V-16: custom-field node keeps own role/tabindex. No route or event change.
- U-01 build and shell contracts (build.mjs output and exit codes, parts list, head/CSP, DOM hooks A, data-tour targets, boot.js, tokens, package.json): unchanged, full text in core-report-annex.md.
- No events, content keys, routes or UI.pages entries added yet.

VERIFIED (2026-11-15 09:20 IST, review fix RS3, tip 5f32f03, builder's gates; the scribe re-ran none, so ASSUMED): build GREEN 1220739 B (_logs/gates/core/build-20261115-085011.log); test GREEN (test-20261115-085019.log, 085537.log: 809/0/0); validate (validate-20261115-085517.log); guards (guards-20261115-085519.log); browser 32/0/0 (browser-20261115-085941.log).
VERIFIED (2026-11-15 13:22 IST, check, tip d55a102; the scribe re-ran none): build GREEN 1221933 B (_logs/gates/core/build-20261115-141014.log); store.test GREEN 158/158 (test-20261115-141018.log); validate GREEN (validate-20261115-141426.log); guards GREEN 5/5 (guards-20261115-141428.log). At d11f252 (review fix, builder): build GREEN, store.test 159/159, validate, guards 5/5 GREEN; ASSUMED: builder's full Node 813/813 at d55a102 (test-20261115-140126.log) and browser lock/PIN flows GREEN (browser-20261115-140728.log). OWED: full Node (814 expected, first try test-20261115-150720.log cut at the floor) and browser. Territory: core c4d609d9..HEAD 2 files, offline/src/store.js and offline/tests/store.test.mjs, 2 own, 0 shared, 0 errors; no logs or html committed.
Older VERIFIED lines (09:20, 07:14): core-report-annex.md.
VERIFIED 2026-11-14 gates (tips 324194c, 11f2f70): annex.

VERIFIED (2026-11-09 18:47 IST, check, tip 12322d3): build, test 106/106, validate, guards 5/5 GREEN; logs and ASSUMED list: core-report-annex.md.

Older gates, checks, reviews: annex.


### Check
2026-11-15 13:22 IST: PASS at d55a102 (judged commits after c4d609d9). FIX-REMOVE-STALE-ROWS WANT 1-5 present, 4 named tests pass, mutants 6 of 6. C1 LOW (trailer names Claude Opus 5.5, the session's attribution, not the model the task named; no fix, fix SHA none; no re-check owed). Open 0. Not checked: browser gate, full Node suite (813 rests on the builder), earlier units (merged before the base).
2026-11-15 10:19 IST: PASS at cbae1bb (judged commits after 803c96c5); 0 findings, 0 review findings (no reviewers). Territory: 1 file, offline/tests/store.test.mjs (core's own); 0 shared, 0 unowned, no logs/html committed. Gates VERIFIED by the check: build GREEN 1220739 B (gates/core/build-20261115-105641.log), test GREEN 154/0/0 store.test.mjs (test-20261115-105646.log), validate GREEN (validate-20261115-110207.log), guards GREEN 5/0/0 (guards-20261115-110208.log). ASSUMED from the builder: full suite 809/0/0 (gates/core/test-20261115-104217.log), red proof and 5 greens (reports/core/core__rs3-alone-*.log), browser not run. Trailer C2-style note: Co-Authored-By model name is the harness's. Review findings: none.
2026-11-15 07:14 IST: PASS at 8f0cdaa (judged commits after 63eb8257). C1 LOW FIX-TAKEIN-SAY (f.stale still set on the automatic error; unobservable, M4 survived; no fix). C2 LOW all three commits (trailer model name differs from the asked one; history already mixes; no fix). C3 LOW FIX-STALE-SAVE-KEEP (#kept not yet in contracts section A; the HUB adds). Open 0. Not checked: browser gate (HUB, merged tree), whole-tree count, the screen-reader probe log itself.
2026-11-14 (12:07 and 14:43): PASS at 324194c, no findings; 11f2f70 judged by the reviewers: annex.
2026-11-09 18:47 IST: PASS at 12322d3, C1 LOW (trailer wording, no fix). Rest: core-report-annex.md.


### Review
2026-11-15 13:22 IST: contracts and safety reviewers judged c4d609d9...HEAD; fix round c463efe, d11f252; both re-checked on d11f252. Older review blocks: annex.
- RC1 LOW FIX-REMOVE-STALE-ROWS (no test for remove()'s unread rows): fix c463efe (test only); re-check FIXED.
- RC2 LOW FIX-REMOVE-STALE-ROWS (test name apostrophe differed from the brief): fix d11f252; re-check FIXED.
- RS1 LOW FIX-REMOVE-STALE-ROWS (a plain row another tab saves in the read-to-write gap is lost): fix SHA none, WONTFIX-ACCEPTED (brief WANT 4 default); re-check WONTFIX-ACCEPTED; a later unit, named by the build chat; reviewer's sketch in core__units.md.
- RS2 LOW FIX-REMOVE-STALE-ROWS (guide lines :436, :445 now overstate the loss): lane part done (Docs owed); re-check FIXED.
- New findings 0; open 0. Reviewers' questions for the HUB: the gap also runs the other way (resetAll in another tab, no PIN); new reads reject with the raw backend error, not a coded failure; replaceAll reads before sealAll (:571 vs :572); no screen reads status().unreadable.
2026-11-14: earlier review blocks (RC1-R2 and the 12:07 findings): annex.

2026-11-09 18:47 IST: RC1 LOW, RC2 LOW, RS2 LOW FIXED (ae41654, 4381f1d); RC3 LOW and RS1 LOW NOT-FIXED then (RS1 closed 2026-11-14 for the open tab). Full text: core-report-annex.md.


### Safety and content marks
- 2026-11-15 13:22: no new words, network, innerHTML or PIN/key movement; SOS untouched. Rule: lock.set keeps the old key only until its own write; Lock now during a PIN change clears state.key (reviewer's question, default as built).
Older 07:14 line: annex.
- 2026-11-15 10:19: test only; no source, copy, network, innerHTML or PIN/key change; SOS untouched.
- 2026-11-14 safety lines: annex.
- 2026-11-09 18:47: no new copy, network or innerHTML; no PIN or key leaves the store; SOS not gated, an open SOS tab is not pulled out when it locks. New: an open tab locks after another tab imports; an SOS save there is dropped with the existing notSaved line.
- 2026-11-09: no new copy; no innerHTML, URL or network added; lockId is not derived from the PIN; SOS not gated.
Slice: none. 2026-11-07 10:41 IST: URGENT.builtIn 112 in ui-core.js carries verify: true, inside the clinicalReview block, used only when the urgent list is empty or unreadable. Start-failure strings in boot.js have no clinicalReview mark (check C1). Forgotten-PIN line is the ruling's wording. h() drops string on* and javascript: attributes. SOS is never gated and never interrupted by auto-lock.

### Requests for other lanes
- 2026-11-15 07:14: SCREENS: ui-settings.js:569 and :130 read 'locked' for a stale refusal (default no change). actions-sos: none sent (the lock page's own box is ui-onboarding.js; RC1 was fixed inside core).
- 2026-11-15 13:22: tests-docs: guide lines 436 and 445 (known problem, two tabs) say entries saved after the first tab opened can be lost on removing the PIN and call it the only data-loss case; now only a row saved in the instant between read and write can be, also on set, change, auto-lock change. Counts store.test 154 -> 159, npm test 809 -> 814 expected.
- 2026-11-15 10:19: none.
- 2026-11-14 requests: annex.
- 2026-11-09: actions-sos V-17b: after core merges, read Store.status().lockId at queue time in ui-sos.js, with a feature check for a store lacking it.
None recorded in the notes' for_the_chat beyond: the HUB baselines the 15 tour-target names as expected RED until the screens land (HUB owns baselines.md).

### Docs owed
2026-11-15 10:19: none new (test only).
2026-11-15 13:22: tests-docs outbox at READY: the guide words above; contracts/core.md section for the stored-rows rule.
2026-11-15 09:20: contracts/core.md last section (kept line lifetime), :159 words, tests-docs count 809.
Earlier docs owed (2026-11-15 07:14 and before): core-report-annex.md (Moved 2026-11-15 10:19).

### Open questions
- 2026-11-15 13:22: for the HUB: name the unit for RS1's gap (SPRINT-BOARD) and decide whether a screen should say status().unreadable; FIX-DRAWN-WRITE-SAY next. Default: gap accepted.
- 2026-11-15 07:14: for the owner: FIX-TAKEIN-SAY silent default vs a true line; RS1 lock case; the three FIX-STALE-SAVE-KEEP defaults. For the HUB: RC3 text; the 2026-11-14 questions (EC4, isConnected, focus in SOS, screen reader on go('#/lock')); proof-log name case (accept).
- 2026-11-15 10:19: none new.
- 2026-11-14 open questions: annex.
- 2026-11-09 18:47: RC3 and RS1 open (above); default: the HUB writes the contract text, RS1 left for a later fix round. Open-tab refusal after an import: kept.
- 2026-11-09: none new; the autoLockMin change keeping lockId is by construction, no test names it.

### For the HUB at the merge
- 2026-11-15 13:22: READY core d11f252 replaces cbae1bb/c4d609d9 (6 commits; offline/src/store.js, offline/tests/store.test.mjs; do not commit the gates rebuild of offline/1-addic.html). Two gates owed on the HUB's memory line (4.0 GB twice a minute apart): full Node (814 expected), browser (33, or --grep 'PIN|lock screen|lock page' under 7.0 GB). Write the contracts text and send tests-docs the counts and guide words.
- 2026-11-15 10:19: READY core cbae1bb replaces 5f32f03/803c96c5 (1 commit since 803c96c5; offline/tests/store.test.mjs only; do not commit the gates rebuild of offline/1-addic.html). tests-docs: store.test.mjs count unchanged at 154 per the check; npm test 809.
- 2026-11-15 09:20: READY core 5f32f03 replaces 339ea20 (8 commits since 63eb8257; shell.html, store.js, styles.css, ui-core.js, store.test.mjs; do not commit the gates rebuild of offline/1-addic.html). Write the RS3 lifetime text into contracts/core.md; ask the owner the open questions.
- 2026-11-15 07:14: RED core 339ea20 replaces 11f2f70 (7 commits since 63eb8257; shell.html, store.js, styles.css, ui-core.js, store.test.mjs; do not commit the gates rebuild of offline/1-addic.html). Record RC3 and #kept in contracts/core.md; ask the owner the two questions above; the fix-round re-check waits for the 7.0 GB memory row. The 2026-11-14 lines: annex.
- 2026-11-09 18:47: tip 4381f1d replaces 561cab2 (3 commits; store.js and store.test.mjs only; do not commit the gates rebuild of offline/1-addic.html). Record the lockId change in contracts/core.md. Lane RED for RC3 (contract text, yours) and RS1 (not built): rerun the fixer for RS1 or accept it.
- 2026-11-09: tip 561cab2 replaces fbc663d (3 commits: store.js, ui-core.js, build.mjs, store.test.mjs; html rebuilt 1206950 B, do not commit the gates' rebuild). Record lockId and the part lines in contracts/core.md. Run the whole-lane review.
Older "For the HUB" lines (2026-11-07 to 2026-11-08): core-report-annex.md (Moved 2026-11-14).

Gates, checks, reviews of 2026-11-08 (04:55 and 07:12 IST): core-report-annex.md (Moved 2026-11-09).
Earlier 2026-11-07 gates, checks and reviews (11:58 to 17:16 IST): C:/Users/ruchi/1-addic-wt/_logs/reports/core-report-annex.md
