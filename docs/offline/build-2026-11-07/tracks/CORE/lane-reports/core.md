## core (CORE, 1-addic offline build): the slice report

State: RED (2026-11-14 12:07 IST, continued from c57fdaeb; tip 79c969a; check PASS at 324194c; review 2 reviewers, 5 findings, RC1 PARTLY, RC2, RS1, RS3 fixed, RS2 accepted, 1 new LOW; open 2; build, test, validate, guards 5/5, browser 32/32 GREEN). Earlier: RED (2026-11-09 18:47 IST, tip 4381f1d); READY (2026-11-09 14:49, tip 561cab2); READY (2026-11-08 07:12, tip fbc663d); READY (2026-11-07 17:16, tip 8e80951). Earlier states in the annex. Branch build/core, worktree C:/Users/ruchi/1-addic-wt/core. Base c57fdaeb. All units built: U-01, U-03, U-02, U-04, FIX-C4-C5, FIX-SAFETY, FIX-RULINGS, FIX-R2, FIX-V11, V-11, V-46, V-16, V-17a, V-26a, FIX-IMPORT-MARK, FIX-STALE-SAVE-SAY, FIX-SOS-FOCUS. Dates 2026-11-07 07:26 to 2026-11-14 IST.
Commits c57fdaeb..HEAD (2026-11-14 12:07 IST, tip 79c969a):
- 79c969a fix(core): RC2, RS1 (FIX-STALE-SAVE-SAY): a save refused after the PIN was removed or the notebook erased in another tab is said too
- 9cbbc85 fix(core): RC1, RS3: one refused save gives one toast
- 324194c FIX-SOS-FOCUS: a same-path route render keeps keyboard focus inside the page
- 79df6bf FIX-STALE-SAVE-SAY: a save refused by another tab's change is said in a toast that outlives the lock page
Commits 60dffe33..HEAD (2026-11-09 14:49 IST, tip 561cab2):
- 561cab2 V-26a: build.mjs prints the size of every part and the total
- 4aa3ca9 V-17a: Store.status().lockId, an opaque mark of the lock row
- bfe84d6 V-16: a custom field's node keeps its own role and tab stop, and a bare control is named
Commits 0dd50197..HEAD (2026-11-09 18:47 IST, tip 4381f1d):
- 4381f1d test(store): FIX-IMPORT-MARK RC2 export then import under a PIN is proven row for row
- ae41654 fix(store): FIX-IMPORT-MARK RC1 a locked tab hears no onLock when its unlock resyncs
- 12322d3 fix(store): FIX-IMPORT-MARK an import with a PIN set moves Store.status().lockId (ES3)
Earlier lists (60dffe33 and before): core-report-annex.md (Moved 2026-11-09 18:47).

### Turn caps
- 2026-11-14 12:07 IST (continued from c57fdaeb): one builder, FIX-STALE-SAVE-SAY and FIX-SOS-FOCUS, 37 steps, capHits 0; one review-fix builder (RC1, RS3, RC2, RS1); two reviewers (contracts, safety) and re-checks.
- 2026-11-09 14:49 IST (continued from 60dffe33): one builder, V-17a and V-26a, 37 steps, capHits 0; no reviewers.
- 2026-11-09 18:47 IST (continued from 0dd50197): one builder, FIX-IMPORT-MARK, 49 steps, capHits 0; one review-fix builder (RC1, RC2); two reviewers (contracts, safety) and re-checks. Earlier runs: annex.


### Units
- 2026-11-14 12:07 IST: FIX-STALE-SAVE-SAY (tier 1) 79df6bf, review fixes 9cbbc85 (RC1, RS3), 79c969a (RC2, RS1). For a person: with a PIN set and two tabs open, a save refused because the other tab changed the notebook now says 'This notebook changed in another tab, so your last change was not saved.' in a warn toast that outlives the move to the lock page (onLock hears { reason: 'auto', stale: true } only then; timer and lockNow events unchanged). One refused save gives one toast: ui-core hushes further warn toasts until the next turn (setTimeout 0); ok, info and SOS toasts unaffected. If the PIN was removed or the notebook erased in another tab, the same line shows via the store notice { label: 'unlock', stale: true }. The refusal's LOCKED error carries stale: true. Red first 3 of 6 (core__FIX-STALE-SAVE-SAY-red.log), 8 of 8 mutants (-mut.log), consumers 353/353 (core__v33-consumers.log). Held: none. Closed: RC1, RC2, RS1, RS3; RS2 accepted.
- 2026-11-14 12:07 IST: FIX-SOS-FOCUS (tier 1) 324194c. For a person: when a page redraws on the same path and removes the node holding keyboard focus (for example SOS), focus goes to the page (#main) with no scroll, not to the top of the document; a path change still scrolls as before. Red first on Chrome 157 at 390 px (core__sos-focus.red.log, focus fell to body 3 of 3), core__FIX-SOS-FOCUS-red.log, -mut.log. Held: none.
- 2026-11-09 14:49 IST: V-16 bfe84d6 (earlier run, judged now), V-17a 4aa3ca9, V-26a 561cab2 (tier 2). For a person: nothing visible changes. V-16: a custom field's node keeps its own role and tab stop; a bare control is named. V-17a: Store.status().lockId is a string: '' with no lock (also in memory mode), else 8 lower-case hex (FNV-1a of the lock row's salt and sealed check, lockMark, store.js:520); changes when the lock row is created, removed or replaced (same PIN after erase, PIN set over old); not on lock, unlock or reload; readable while locked; never from the PIN; salt and check never leave the store. V-26a: build prints one line per part in parts-list order, then shell.html, styles.css: `part <name> <bytes> B (<x.x> kB)`, then the total line unchanged; absent part no line. Red first and mutants: core__V-17a-red.log, core__V-26a-mut.log. Held: none. Closed: V-17b can read lockId at queue time.
- 2026-11-09 18:47 IST: FIX-IMPORT-MARK (tier 1), 12322d3, review fixes ae41654 (RC1) and 4381f1d (RC2). For a person: an import with a PIN set keeps the same PIN, but the lock row's check is sealed again (fresh IV, same salt and key), so Store.status().lockId changes and every other tab's mark no longer matches. A locked tab takes the new mark at its next unlock try. An open tab's next save is refused as stale, then that tab locks and resyncs (new for an import). A kept SOS save in another tab is then dropped, closing ES3 on the store side. RC1: a locked tab that resyncs during unlock no longer redraws the lock page, so the wrong-PIN line survives. RC2: new tests prove export then import under a PIN row for row on all three backends. replaceAll reads state.key into a local before its first wait. Red first 7 of 7 (core__FIX-IMPORT-MARK-red.log), 13 of 13 mutants (core__FIX-IMPORT-MARK-mut.log), consumers 247/247 (core__FIX-IMPORT-MARK-consumers.log), core__FIX-RC1-red.log, core__FIX-RC1-mut.log, core__FIX-RC2-mut.log. Held: none. Closed: ES3 store half; RC1, RC2, RS2.
- Earlier units (V-16, V-17a, V-26a, V-46, V-11, FIX-V11 and review fixes): annex (Moved 2026-11-09 18:47).
- U-01 Build pipeline and shell. SHA 8bf7b5c (build.mjs, shell.html, styles.css, boot.js, package.json, offline/1-addic.html).
  For a person: open offline/1-addic.html (one file, works from disk, no network). It shows the top bar (name  ... (rest: core-report-annex.md)
  Questions closed: brief Q3 (test script is a portable node one-liner), Q4 (parts list holds every name in territory.json).
- U-03 UI core and hash router. SHAs 2bcc049, ce258e0 (+ fixes 182659e, 4a43190). offline/src/ui-core.js (UI object, hash router, lock gate, SOS never gated, coming-soon pages, discreet mode, local-voice speak, sheet/confirm), tests in offline/tests/store.test.mjs.
  For a person: tabs now navigate with the back button; when the app is locked every page except SOS goes to the lock screen and an open sheet closes; a replaced sheet no longer gets the older sheet's close; unbuilt pages show a coming-soon page.
- U-02 Design tokens and components. SHA c52d0eb (styles.css). Light, dark and dark-media token sets match (--radius, --space-1..6 added), 44 px targets, focus-visible, reduced motion, calm, counters-off, print, SOS z-index 60 above #coach 50, contract G classes, `/* -- end core -- */` last.
  Questions closed: Store-triggered re-renders skip SOS and lock routes (U-04's Store must report locked: true before first render).
- Held or blocked: none (FIX-RULINGS was recorded as held when the loop ended, but is built in full at cdfc0e9).
  Order as run: U-01, U-03+U-02, U-04, FIX-C4-C5, review fixes, FIX-SAFETY, FIX-RULINGS.
- 2026-11-07 (earlier runs) U-04 The store, encrypted with a PIN when one is set. SHA 06cdf34 (store.js, store ... (rest: core-report-annex.md)
- 2026-11-07 10:41 IST run, FIX-SAFETY (tier 1). SHAs 37e0f14 (RS5), 5dcb83c (RS6), 02e2ac7 (RS7), 2d84168 (RS8), 7df959f (a), f36d66c (b), 93871c2 (c), f33ca6e (d), b3cde8e (e). Each red first, offline/1-addic.html rebuilt.
  For a person: Erase everything in a fallback session also deletes the database 1-addic (ERASE_PARTIAL if tha ... (rest: core-report-annex.md)
  Questions closed: review questions a-e; RS5-RS8.
- 2026-11-07 10:41 IST run, FIX-RULINGS (tier 1). SHAs d16be2c (Q3), 698b81b (Q4, RC9), 56d46d0 (RC5), 32061e2 (RC6), cdfc0e9 (RC7).
  For a person: a row that will not decrypt is kept exactly as stored and survives a PIN change, remove and replace; only Erase everything removes it. Lists and exports come out in key order. RC5-RC7 are tests only, no behaviour change.
  Questions closed: 10:45 rulings Q3, Q4.

- 2026-11-08 V-11 (tier 1), e79e1b0. For a person: from the first byte of 1-addic.html, before any script runs, the page shows the emergency line, a one-tap tel:112 link and "Please verify these numbers."; the first render replaces it, a start failure shows boot.js's block instead. Red first: core__V-11-red.log, mutant core__V-11-mut.log. Questions closed: wording (CORE 11 ruling). Evidence: core__units.md:640.

### Contract changes
- Older contract, safety, request and open-question lines of 2026-11-07 and 2026-11-08: core-report-annex.md (Moved 2026-11-14).
- 2026-11-14: Lock.onLock event gains optional stale: true ({ reason: 'auto', stale: true }, only for an open tab whose save was refused by another tab's change while a lock is stored; contracts/core.md:58; deepStrictEqual tests pin every other event); store notice { label: 'unlock', stale: true } when no lock is stored any more; the LOCKED error of a stale refusal carries stale: true (store.js:396-398). UI: a same-path render that removes the focused node focuses #main with preventScroll (contracts/core.md:6). Both lines are the HUB's to write.
- 2026-11-09 18:47: lockId also changes on an import with a PIN set: the lock row stays; PIN, salt and key do not change; its check is sealed again with a fresh IV (store.js:559-565, one write, state.lock set after it). Update contracts/core.md lines 53, 60, 125, 140, 148 (ES3: add the V-17b test). resync() fires onLock only for a tab that was open before it took the stored row.
- 2026-11-09: Store.status() gains lockId (string, shape above); build stdout gains `part` lines (regex ^part (\S+) (\d+) B \((\d+\.\d) kB\)$). V-16: custom-field node keeps own role/tabindex. No route or event change.
- U-01 build and shell contracts (build.mjs output and exit codes, parts list, head/CSP, DOM hooks A, data-tour targets, boot.js, tokens, package.json): unchanged, full text in core-report-annex.md.
- No events, content keys, routes or UI.pages entries added yet.


VERIFIED (2026-11-14 12:07 IST, check, tip 324194c): build GREEN 1214356 B (_logs/gates/core/build-20261114-122650.log); test GREEN 120/120 (test-20261114-122654.log); validate GREEN (validate-20261114-123059.log); guards GREEN 5/5 (guards-20261114-123100.log). ASSUMED: builder browser GREEN 32/32 (browser-20261114-121944.log), builder gates build-20261114-121715.log, test-20261114-121716.log, validate-20261114-121837.log, guards-20261114-121837.log; review-fix gates from build-20261114-133616.log (tip 79c969a, build 1215822 B). Territory: core c57fdaeb..HEAD, 3 own files (store.js, ui-core.js, store.test.mjs), 0 shared, 0 errors.

VERIFIED (2026-11-09 18:47 IST, check, tip 12322d3): build GREEN 1212155 B (_logs/gates/core/build-20261109-190018.log); test GREEN 106/106, store.test.mjs only (test-20261109-190020.log); validate GREEN (validate-20261109-190104.log); guards GREEN 5/5 (guards-20261109-190105.log). ASSUMED: review-fix builder gates build-20261109-193337.log, test-20261109-193337.log, validate-20261109-193419.log, guards-20261109-193419.log; 12322d3 builder gates build-20261109-185656.log, test-20261109-185658.log, validate-20261109-185743.log, guards-20261109-185743.log. Browser gate not run (no browser tests owned; no flow exercises an import with a PIN). Territory: core 0dd50197..HEAD, 2 own files (store.js, store.test.mjs), 0 shared, 0 errors.

Older gates, checks, reviews: annex.


### Check
2026-11-14 12:07 IST: PASS at 324194c (judged commits after c57fdaeb), no findings. Not checked: browser re-run (lane adds no browser tests); consumer suites (builder 353/353); red-first and mutation logs read by test, not repeated; two-tab case in a real browser; the PIN-removed case (later fixed, RS1 at 79c969a). Contract lines :6 and :58 are the HUB's.
2026-11-09 18:47 IST: PASS at 12322d3 (judged commits after 0dd50197). C1 LOW, FIX-IMPORT-MARK, commit trailer says Claude Opus 5.5, not the PLAN.md:110 line; Claude-Session correct. Fix SHA: none (history not rewritten). Re-check: not run. Not checked: browser; actions.test.mjs and workbook-settings.test.mjs only by the builder's run (247/247); the kept-SOS-save drop confirmed by reading, not a test (V-17b); contract lines 53, 60, 125, 140, 148 still old. Earlier checks: annex.

### Review
2026-11-14 12:07 IST: contracts and safety reviewers judged c57fdaeb...HEAD. RC1 MEDIUM FIX-STALE-SAVE-SAY (two warn toasts when a page also toasts its own refusal; ui-core.js:1042, ui-exercise.js:891, ui-settings.js:169): fixed 9cbbc85, re-check PARTLY (the end-to-end test is missing). RC2 LOW (removed PIN or erase: no onLock, no toast): fixed 79c969a, FIXED. RS1 LOW (same case, entry lost silently): fixed 79c969a, FIXED. RS3 LOW (same two toasts as RC1): fixed 9cbbc85, FIXED. RS2 LOW (stale toast gone after 4.5 s): no change, WONTFIX-ACCEPTED, reason core__units-v33-fix.md:24-26. New LOW (re-check): core__RC1-mut.log, core__RC2-mut.log, core__RC1-full.log, core__RC2-full.log, cited in core__units-v33-fix.md:9, :20 and core__progress.md:108-109, do not exist on disk. Open 2 (RC1 test, the missing proof logs). Questions (HUB): takeIn (store.js:727) STALE says 'not saved' for an automatic write; EC4 an auto-lock minutes change in another tab says the same line; isConnected clause untested; first-render focus on the boot-line link; focus after same-path renders in SOS flows; a screen reader may cut off the alert when go('#/lock') moves focus; resync(stale) shadows stale() at store.js:739.

2026-11-09 18:47 IST: contracts and safety reviewers judged 0dd50197..HEAD. RC1 LOW FIX-IMPORT-MARK (store.js:747, lock page loses the wrong-PIN line after a resync): fixed ae41654, re-check FIXED. RC2 LOW (store.test.mjs:2233-2257, import under a PIN proved for two rows only): fixed 4381f1d, re-check FIXED. RC3 LOW (contracts/core.md:53,60,125,140,148, actions-sos.md:240, ui-sos.js:469-471 say an import leaves lockId unchanged): fix none, the fixer got the findings cut off; re-check NOT-FIXED; the HUB writes the contract text at the merge. RS1 LOW (open tab's save refused after another tab's import; the lock page replaces the page before the refusal shows, so the entry is lost silently; ui-core.js:1034, store.js:394-396): fix none, never seen by the fixer; re-check NOT-FIXED; suggested: say it on the lock page. RS2 LOW (same defect as RC1): fixed ae41654, re-check FIXED. No new findings. Open 2 (RC3, RS1).
Review questions (HUB): is V-17b on the board; is the open tab's refusal and lock wanted; does ES3 stay open until V-17b; is a browser flow for import with a PIN wanted; ui-settings.js:130 reads 'locked' for a stale refusal (workbook-settings).

### Safety and content marks
- 2026-11-14: one new line, the stale toast 'This notebook changed in another tab, so your last change was not saved.', not clinicalReview; no network, innerHTML or PIN/key movement; SOS not gated, no stale toast in SOS, a kept SOS save in a stale tab is dropped as before.
- 2026-11-09 18:47: no new copy, network or innerHTML; no PIN or key leaves the store; SOS not gated, an open SOS tab is not pulled out when it locks. New: an open tab locks after another tab imports; an SOS save there is dropped with the existing notSaved line.
- 2026-11-09: no new copy; no innerHTML, URL or network added; lockId is not derived from the PIN; SOS not gated.
Slice: none. 2026-11-07 10:41 IST: URGENT.builtIn 112 in ui-core.js carries verify: true, inside the clinicalReview block, used only when the urgent list is empty or unreadable. Start-failure strings in boot.js have no clinicalReview mark (check C1). Forgotten-PIN line is the ruling's wording. h() drops string on* and javascript: attributes. SOS is never gated and never interrupted by auto-lock.

### Requests for other lanes
- 2026-11-14: none needed: a page's own catch toast for a refused save is hushed for one turn. HUB: ui-settings.js:130 still reads 'locked' for a stale refusal.
- 2026-11-09 18:47: actions-sos V-17b: add the named test in actions.test.mjs (a kept SOS save is dropped when another tab imports with a PIN set) and correct the comments at ui-sos.js:469-471 and :484. workbook-settings: ui-settings.js:130 reads "locked" for a stale refusal.
- 2026-11-09: actions-sos V-17b: after core merges, read Store.status().lockId at queue time in ui-sos.js, with a feature check for a store lacking it.
None recorded in the notes' for_the_chat beyond: the HUB baselines the 15 tour-target names as expected RED until the screens land (HUB owns baselines.md).


### Docs owed
Also owed 2026-11-14: contracts/core.md :58 (onLock stale field) and :6 (same-path focus). Also owed 2026-11-09 18:47: contracts/core.md lines 53, 60, 125, 140, 148; contracts/actions-sos.md:240.
See C:/Users/ruchi/1-addic-wt/_logs/reports/core-report-annex.md. 2026-11-08 V-46: none.

### Open questions
- 2026-11-14: RS2 accepted by default (the toast leaves after 4.5 s; a lasting line on the lock page is a later unit if the HUB wants it, screens run at 390x844). Open: the RC1 end-to-end test and the missing proof logs. Default: the HUB accepts or reruns the fixer.
- 2026-11-09 18:47: RC3 and RS1 open (above); default: the HUB writes the contract text, RS1 left for a later fix round. Open-tab refusal after an import: kept.
- 2026-11-09: none new; the autoLockMin change keeping lockId is by construction, no test names it.

### For the HUB at the merge
- 2026-11-14: tip 79c969a replaces 4381f1d (4 commits; store.js, ui-core.js, store.test.mjs only; do not commit the gates rebuild of offline/1-addic.html). Record the two contract lines. Lane RED for the open re-check items; RS1 of 2026-11-09 is closed for the open-tab case, RC3's contract text is still the HUB's.
- 2026-11-09 18:47: tip 4381f1d replaces 561cab2 (3 commits; store.js and store.test.mjs only; do not commit the gates rebuild of offline/1-addic.html). Record the lockId change in contracts/core.md. Lane RED for RC3 (contract text, yours) and RS1 (not built): rerun the fixer for RS1 or accept it.
- 2026-11-09: tip 561cab2 replaces fbc663d (3 commits: store.js, ui-core.js, build.mjs, store.test.mjs; html rebuilt 1206950 B, do not commit the gates' rebuild). Record lockId and the part lines in contracts/core.md. Run the whole-lane review.
Older "For the HUB" lines (2026-11-07 to 2026-11-08): core-report-annex.md (Moved 2026-11-14).

Gates, checks, reviews of 2026-11-08 (04:55 and 07:12 IST): core-report-annex.md (Moved 2026-11-09).
Earlier 2026-11-07 gates, checks and reviews (11:58 to 17:16 IST): C:/Users/ruchi/1-addic-wt/_logs/reports/core-report-annex.md
