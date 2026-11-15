## core (CORE, 1-addic offline build): the lane report

State: READY (2026-11-15 09:20 IST, continued from 63eb8257; tip 5f32f03; check PASS at 8f0cdaa; review 2 reviewers, 6 findings: RC1, RC2, RC3, RS1, RS2, RS3 all FIXED on re-check; open 0 findings, owner questions only; build, test 809/0/0, validate, guards, browser 32/0/0 GREEN at the tip). Earlier: RED (2026-11-15 07:14, tip 339ea20); READY (2026-11-14 14:43 IST, tip 11f2f70); RED (2026-11-14 12:07, tip 79c969a); RED (2026-11-09 18:47, tip 4381f1d); READY (2026-11-09 14:49, tip 561cab2); READY (2026-11-08 07:12, tip fbc663d); READY (2026-11-07 17:16, tip 8e80951). Earlier states in the annex. Branch build/core, worktree C:/Users/ruchi/1-addic-wt/core. Base 63eb8257. All units built: U-01, U-03, U-02, U-04, FIX-C4-C5, FIX-SAFETY, FIX-RULINGS, FIX-R2, FIX-V11, V-11, V-46, V-16, V-17a, V-26a, FIX-IMPORT-MARK, FIX-STALE-SAVE-SAY, FIX-SOS-FOCUS, FIX-BULK-REFUSAL-SAY, FIX-TAKEIN-SAY, FIX-STALE-SAVE-KEEP. Dates 2026-11-07 07:26 to 2026-11-15 IST.
Commits 63eb8257..HEAD (2026-11-15 09:20 IST, tip 5f32f03):
- 5f32f03 fix(core): RS3: a write a page makes as it is drawn keeps the kept line
- 339ea20 fix(core): RS1: a later save that goes through clears the kept line
- f000c8c test(core): RC2: the bulk notice's stale flag, at ui-core and end to end
- 2af44ef fix(core): RS2: a printout never carries the kept line
- 634dbfb fix(core): RC1: the kept line hides when the lock page opens its SOBER practice in place
- 8f0cdaa fix(core): FIX-STALE-SAVE-KEEP: a kept line says a refused save after the toast leaves, never in SOS
- 3760bcd fix(core): FIX-TAKEIN-SAY: an automatic write's refusal is not said as the person's lost change
- 3a1dbd8 fix(core): FIX-BULK-REFUSAL-SAY: a commit refused inside Store.bulk() keeps the stale flag on the one bulk notice
Commits c57fdaeb..11f2f70 (2026-11-14): 11f2f70, 79c969a, 9cbbc85, 324194c, 79df6bf (full list: annex).
Commits 0dd50197..HEAD (2026-11-09 18:47 IST, tip 4381f1d):
- 4381f1d test(store): FIX-IMPORT-MARK RC2 export then import under a PIN is proven row for row
- ae41654 fix(store): FIX-IMPORT-MARK RC1 a locked tab hears no onLock when its unlock resyncs
- 12322d3 fix(store): FIX-IMPORT-MARK an import with a PIN set moves Store.status().lockId (ES3)
Earlier lists (60dffe33 and before): core-report-annex.md (Moved 2026-11-09 18:47).

### Turn caps
- 2026-11-15 07:14 IST (continued from 63eb8257): one builder, FIX-BULK-REFUSAL-SAY, FIX-TAKEIN-SAY, FIX-STALE-SAVE-KEEP (session 1b24d2dd, 22:43 to 23:40 IST), capHits 0; one check (PASS); two reviewers (contracts, safety); review-fix builders (RC1, RS2; then RC2, RS1, RC3), capHits 0; two re-checks.
- 2026-11-15 09:20 IST (same run, review round 2): review-fix builder for RS3 (5f32f03), capHits 0; both re-checks ran on 5f32f03 (wf_5b0dfd67-b3c, resumed 09:13 after a memory pause).
- 2026-11-14 12:07 IST (continued from c57fdaeb): one builder, FIX-STALE-SAVE-SAY and FIX-SOS-FOCUS, 37 steps, capHits 0; one review-fix builder (RC1, RS3, RC2, RS1); two reviewers (contracts, safety) and re-checks.
- 2026-11-09 14:49 IST (continued from 60dffe33): one builder, V-17a and V-26a, 37 steps, capHits 0; no reviewers.
- 2026-11-09 18:47 IST (continued from 0dd50197): one builder, FIX-IMPORT-MARK, 49 steps, capHits 0; one review-fix builder (RC1, RC2); two reviewers (contracts, safety) and re-checks. Earlier runs: annex.

### Units
- 2026-11-15 07:14 IST: FIX-BULK-REFUSAL-SAY (tier 1) 3a1dbd8. For a person: nothing visible today (Store.bulk() has no caller); a later bulk-wrapped save refused after another tab removed the PIN or erased the notebook now gives the one stale toast and the kept line, not silence. store.js: state.dirtyStale (:28), notify() holds the flag (:425), bulk()'s flush sends { label: 'bulk', stale: true } (:497-502). Red first, 6 of 6 mutants (core__FIX-BULK-REFUSAL-SAY-red.log, -mut.log). RC2 added tests (d) at f000c8c. Closed: none. Open: ui-settings.js:569 says 'locked' after a refused sample load (SCREENS; default no change).
- 2026-11-15 07:14 IST: FIX-TAKEIN-SAY (tier 1) 3760bcd. For a person: if another tab changes the PIN in the instant of this tab's unlock or PIN set, the tab no longer says "your last change was not saved" for the automatic take-in of an old fallback snapshot; with a lock stored it goes to the lock page with no toast, else it stays open; the next unlock takes the snapshot in. store.js write(w, auto) (:393), resync(!auto) (:398), takeIn passes true (:738). Differs from the brief: f.stale still set on the automatic error (unobservable, mutant M4 survived; check C1). Logs core__FIX-TAKEIN-SAY-red.log, -mut.log, -mut2.log. OWNER QUESTION: say nothing (default built) or a true line such as 'Your notebook changed in another tab.'; default consequence: a correct PIN entered in the race lands back on the lock page silently.
- 2026-11-15 07:14 IST: FIX-STALE-SAVE-KEEP (tier 1) 8f0cdaa, review fixes 634dbfb (RC1), 2af44ef (RS2), 339ea20 (RS1). For a person: a refused save leaves a plain line under the top bar with the toast's words ('This notebook changed in another tab, so your last change was not saved.'); lock stored: stays on the lock page until unlock; none: stays until another page or a later save that goes through. Never in SOS (hidden on every SOS route, also the lock page's in-place SOBER practice), never in print, forgotten on reload. shell.html :14 #kept; ui-core.js STALE_SAID, sayStale, clearKept, keptOutOfSos (:191, MutationObserver on #main), heard() (:945); styles.css core section :752-764. Red first, 9 of 9 mutants (core__FIX-STALE-SAVE-KEEP-mut.log); screen-reader probe in Chrome 157, 10 of 10 (core__stale-sr.log); named LOWs, no change: SR1 #main has no accessible name, SR2 nested live regions. OWNER QUESTIONS (defaults built): words shared with the toast; until unlock or another page, no dismiss; the lock page's own box is actions-sos's file (no ask sent).
- 2026-11-15 09:20 IST: FIX-STALE-SAVE-KEEP review fix RS3 5f32f03 (ui-core.js, tests). For a person: a page that writes as it draws (Today's tip) no longer wipes the kept line; heard() clears it on a flagless notice only after the person acted since it was said (acts > keptAt: pointerdown, keydown, input, click, document capture listeners in boot, :179-189). Red first (core__v34c-RS3-red.log), mutants (core__v34c-RS3-mut.log). The RS3 end-to-end test must stay last in store.test.mjs (loads all content-*.js).
- Counts: store.test.mjs 132 -> 152 (npm test 809 at the tip) (14 in the batch, 6 in the fix round); npm test 801 on the merged tree after the batch, fix-round total unverified; browser 32 unchanged; tests-docs owns the counts.
- 2026-11-14 (earlier run): FIX-STALE-SAVE-SAY 79df6bf, 9cbbc85, 79c969a, 11f2f70 (a refused save is said in one warn toast), FIX-SOS-FOCUS 324194c (same-path render keeps focus in #main); full text: annex.
- 2026-11-09 18:47 IST: FIX-IMPORT-MARK (tier 1) 12322d3, ae41654 (RC1), 4381f1d (RC2): an import with a PIN set seals the lock row check again, so lockId changes; closes ES3 store half. Full text: core-report-annex.md.
- Earlier units (V-16, V-17a, V-26a, V-46, V-11, FIX-V11 and review fixes): annex (Moved 2026-11-09 18:47).
- Units U-01, U-03, U-02, U-04, FIX-SAFETY, FIX-RULINGS (2026-11-07): full text in core-report-annex.md (Moved 2026-11-15). None held.

- 2026-11-08 V-11 (tier 1), e79e1b0. For a person: from the first byte of 1-addic.html, before any script runs, the page shows the emergency line, a one-tap tel:112 link and "Please verify these numbers."; the first render replaces it, a start failure shows boot.js's block instead. Red first: core__V-11-red.log, mutant core__V-11-mut.log. Questions closed: wording (CORE 11 ruling). Evidence: core__units.md:640.

### Contract changes
- 2026-11-15 09:20 IST: RC3 text now in contracts/core.md:160; the kept line's lifetime (RS3 rule above) goes in its last section for the HUB (builder's CONTRACT note, core__progress.md). Re-check C3 LOW: contract :159 says the line shows again on Done in the lock case; the code only hides it (it stays in the DOM state); HUB to align the words.
- 2026-11-15 07:14 IST: (1) CONTRACT CHANGE, RC3, for contracts/core.md:152: inside Store.bulk() a no-lock refusal's flag rides on the one { label: 'bulk', stale: true } notice sent at the flush, not { label: 'unlock' }; stale is absent elsewhere. write(w, auto): an automatic write (takeIn, after unlock or lock.set) refuses with resync(!auto), so onLock { reason: 'auto', stale: true } is only for a person's own write; the LOCKED error always carries stale. The HUB writes the text. (2) CONTRACT CHANGE: shell ids (section A) gain #kept (plain p, hidden, outside #main, ui-core its only consumer). No route, event, content key or UI.pages entry added.
- 2026-11-14 (earlier): onLock stale field (contracts/core.md :58), same-path focus (:6): annex.
- 2026-11-09 18:47: lockId also changes on an import with a PIN set: the lock row stays; PIN, salt and key do not change; its check is sealed again with a fresh IV (store.js:559-565, one write, state.lock set after it). Update contracts/core.md lines 53, 60, 125, 140, 148 (ES3: add the V-17b test). resync() fires onLock only for a tab that was open before it took the stored row.
- 2026-11-09: Store.status() gains lockId (string, shape above); build stdout gains `part` lines (regex ^part (\S+) (\d+) B \((\d+\.\d) kB\)$). V-16: custom-field node keeps own role/tabindex. No route or event change.
- U-01 build and shell contracts (build.mjs output and exit codes, parts list, head/CSP, DOM hooks A, data-tour targets, boot.js, tokens, package.json): unchanged, full text in core-report-annex.md.
- No events, content keys, routes or UI.pages entries added yet.

VERIFIED (2026-11-15 09:20 IST, review fix RS3, tip 5f32f03, builder's gates; the scribe re-ran none, so ASSUMED): build GREEN 1220739 B (_logs/gates/core/build-20261115-085011.log); test GREEN (test-20261115-085019.log, 085537.log: 809/0/0); validate (validate-20261115-085517.log); guards (guards-20261115-085519.log); browser 32/0/0 (browser-20261115-085941.log).
VERIFIED (2026-11-15 07:14 IST, check, tip 8f0cdaa): build GREEN 1218625 B (_logs/gates/core/build-20261115-000551.log); test GREEN 146/146 (test-20261115-000558.log); validate GREEN (validate-20261115-001131.log); guards GREEN 5/5 (guards-20261115-001133.log). ASSUMED (builder's, tip 339ea20, no gate re-run by this scribe): build 1220067 B, test 152/152, validate, guards GREEN (build-20261115-040348.log, test-20261115-040359.log, validate-20261115-041010.log, guards-20261115-041012.log; set *-20261115-0403* to -0411*); builder browser 32/32 (browser-20261114-233615.log). Territory: core 63eb8257..8f0cdaa 5 files (shell.html, store.js, styles.css, ui-core.js, store.test.mjs), 5 own, 0 shared, 0 errors; styles.css new section /* -- core -- */ :752-764, no token redefined.
VERIFIED 2026-11-14 gates (tips 324194c, 11f2f70): annex.

VERIFIED (2026-11-09 18:47 IST, check, tip 12322d3): build, test 106/106, validate, guards 5/5 GREEN; logs and ASSUMED list: core-report-annex.md.

Older gates, checks, reviews: annex.


### Check
2026-11-15 07:14 IST: PASS at 8f0cdaa (judged commits after 63eb8257). C1 LOW FIX-TAKEIN-SAY (f.stale still set on the automatic error; unobservable, M4 survived; no fix). C2 LOW all three commits (trailer model name differs from the asked one; history already mixes; no fix). C3 LOW FIX-STALE-SAVE-KEEP (#kept not yet in contracts section A; the HUB adds). Open 0. Not checked: browser gate (HUB, merged tree), whole-tree count, the screen-reader probe log itself.
2026-11-14 (12:07 and 14:43): PASS at 324194c, no findings; 11f2f70 judged by the reviewers: annex.
2026-11-09 18:47 IST: PASS at 12322d3, C1 LOW (trailer wording, no fix). Rest: core-report-annex.md.


### Review
2026-11-15 07:14 IST: contracts and safety reviewers judged 63eb8257...HEAD; fix round 634dbfb, 2af44ef, f000c8c, 339ea20; both re-checked on 339ea20.
- RC1 MEDIUM FIX-STALE-SAVE-KEEP (kept line shown over the lock page's in-place SOBER practice): fix 634dbfb (core-only keptOutOfSos, not the suggested outbox ask); re-check FIXED.
- RC2 LOW FIX-BULK-REFUSAL-SAY (no end-to-end test for the bulk notice): fix f000c8c (tests only); re-check FIXED.
- RC3 LOW FIX-BULK-REFUSAL-SAY, FIX-TAKEIN-SAY (contract :152 wrong on label and stale): no code, CONTRACT CHANGE above; re-check PARTLY (the words hold; the HUB has not written them).
- RS1 LOW FIX-STALE-SAVE-KEEP (a later save that goes through left the line): fix 339ea20; re-check PARTLY (no-lock half FIXED; the lock case is an OWNER QUESTION, default the line stays until unlock).
- RS2 LOW FIX-STALE-SAVE-KEEP (printed page carried the line): fix 2af44ef; re-check FIXED.
- New QUESTION (re-check, no severity, traced not run): ui-core.js:947 with ui-today.js:468-475: PIN set, another tab erases the notebook, a Today save is refused; the RS1 fix may clear the line one frame later when Today redraws. Fix SHA none. Open 2 (RS1 lock case, RC3 text). The re-check of the fix round awaits the HUB's 7.0 GB row (4.39 GB at 07:23). Questions left with the HUB: one hush window in bulk(); browser Print; probe tap on lock-sober; lock page above the fold at 390x844.
2026-11-15 09:20 IST, round 2 (both re-checked 5f32f03): RS3 LOW FIX-STALE-SAVE-KEEP (a render-time write cleared the line; two probes) fix 5f32f03, re-check FIXED. RC1, RC2, RC3, RS1, RS2 re-check FIXED (RS1 lock case remains an owner question). New LOWs, no fix: (a) RS3 test mutates the shared Content object, order-dependent (store.test.mjs:3768); (b) contract :159 vs code on 'shows again on Done'; (c) FIX-TAKEIN-SAY's case for writes a page makes as drawn: store.js:478 commit() writes without auto, so a PIN-changed race on Today/guidance can still say the stale line (traced, not run). Open findings 0.
2026-11-14: earlier review blocks (RC1-R2 and the 12:07 findings): annex.

2026-11-09 18:47 IST: RC1 LOW, RC2 LOW, RS2 LOW FIXED (ae41654, 4381f1d); RC3 LOW and RS1 LOW NOT-FIXED then (RS1 closed 2026-11-14 for the open tab). Full text: core-report-annex.md.


### Safety and content marks
- 2026-11-15 07:14: no new words (STALE_SAID is the old toast text), set with textContent; no innerHTML, network or PIN/key movement; SOS never gated, #kept hidden on every SOS route, a refusal inside SOS raises nothing; the line is hidden in print. Rule to keep: the refusal path in write() stays microtask-only.
- 2026-11-14 safety lines: annex.
- 2026-11-09 18:47: no new copy, network or innerHTML; no PIN or key leaves the store; SOS not gated, an open SOS tab is not pulled out when it locks. New: an open tab locks after another tab imports; an SOS save there is dropped with the existing notSaved line.
- 2026-11-09: no new copy; no innerHTML, URL or network added; lockId is not derived from the PIN; SOS not gated.
Slice: none. 2026-11-07 10:41 IST: URGENT.builtIn 112 in ui-core.js carries verify: true, inside the clinicalReview block, used only when the urgent list is empty or unreadable. Start-failure strings in boot.js have no clinicalReview mark (check C1). Forgotten-PIN line is the ruling's wording. h() drops string on* and javascript: attributes. SOS is never gated and never interrupted by auto-lock.

### Requests for other lanes
- 2026-11-15 07:14: SCREENS: ui-settings.js:569 and :130 read 'locked' for a stale refusal (default no change). actions-sos: none sent (the lock page's own box is ui-onboarding.js; RC1 was fixed inside core).
- 2026-11-14 requests: annex.
- 2026-11-09: actions-sos V-17b: after core merges, read Store.status().lockId at queue time in ui-sos.js, with a feature check for a store lacking it.
None recorded in the notes' for_the_chat beyond: the HUB baselines the 15 tour-target names as expected RED until the screens land (HUB owns baselines.md).

### Docs owed
2026-11-15 09:20: contracts/core.md last section (kept line lifetime), :159 words, tests-docs count 809.
2026-11-15 07:14: contracts/core.md :152 (RC3 text), section A (#kept); tests-docs: counts (store.test.mjs 152); the guide may mention the kept line. Earlier: contracts/core.md :6 and :58 (2026-11-14); 2026-11-09 lines below.
Also owed 2026-11-14: contracts/core.md :58 (onLock stale field) and :6 (same-path focus). Also owed 2026-11-09 18:47: contracts/core.md lines 53, 60, 125, 140, 148; contracts/actions-sos.md:240.
See C:/Users/ruchi/1-addic-wt/_logs/reports/core-report-annex.md. 2026-11-08 V-46: none.

### Open questions
- 2026-11-15 07:14: for the owner: FIX-TAKEIN-SAY silent default vs a true line; RS1 lock case; the three FIX-STALE-SAVE-KEEP defaults. For the HUB: RC3 text; the 2026-11-14 questions (EC4, isConnected, focus in SOS, screen reader on go('#/lock')); proof-log name case (accept).
- 2026-11-14 open questions: annex.
- 2026-11-09 18:47: RC3 and RS1 open (above); default: the HUB writes the contract text, RS1 left for a later fix round. Open-tab refusal after an import: kept.
- 2026-11-09: none new; the autoLockMin change keeping lockId is by construction, no test names it.

### For the HUB at the merge
- 2026-11-15 09:20: READY core 5f32f03 replaces 339ea20 (8 commits since 63eb8257; shell.html, store.js, styles.css, ui-core.js, store.test.mjs; do not commit the gates rebuild of offline/1-addic.html). Write the RS3 lifetime text into contracts/core.md; ask the owner the open questions.
- 2026-11-15 07:14: RED core 339ea20 replaces 11f2f70 (7 commits since 63eb8257; shell.html, store.js, styles.css, ui-core.js, store.test.mjs; do not commit the gates rebuild of offline/1-addic.html). Record RC3 and #kept in contracts/core.md; ask the owner the two questions above; the fix-round re-check waits for the 7.0 GB memory row. The 2026-11-14 lines: annex.
- 2026-11-09 18:47: tip 4381f1d replaces 561cab2 (3 commits; store.js and store.test.mjs only; do not commit the gates rebuild of offline/1-addic.html). Record the lockId change in contracts/core.md. Lane RED for RC3 (contract text, yours) and RS1 (not built): rerun the fixer for RS1 or accept it.
- 2026-11-09: tip 561cab2 replaces fbc663d (3 commits: store.js, ui-core.js, build.mjs, store.test.mjs; html rebuilt 1206950 B, do not commit the gates' rebuild). Record lockId and the part lines in contracts/core.md. Run the whole-lane review.
Older "For the HUB" lines (2026-11-07 to 2026-11-08): core-report-annex.md (Moved 2026-11-14).

Gates, checks, reviews of 2026-11-08 (04:55 and 07:12 IST): core-report-annex.md (Moved 2026-11-09).
Earlier 2026-11-07 gates, checks and reviews (11:58 to 17:16 IST): C:/Users/ruchi/1-addic-wt/_logs/reports/core-report-annex.md
