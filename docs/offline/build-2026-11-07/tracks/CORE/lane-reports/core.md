## core (CORE, 1-addic offline build): the slice report

State: READY (2026-11-07 14:11 IST, continued from bda0f0f; branch tip 957f333; all units built; RC10-RC12 and RS18 FIXED and re-checked; no open review or check item beyond 3 LOW and 2 QUESTIONS from the re-check, see Review 2026-11-07 14:11 IST; RS11 stays deferred; guards RED on the 15 baselined tour-targets). Earlier states in the annex. Branch build/core, worktree C:/Users/ruchi/1-addic-wt/core. Base 655516dc. Tip cdfc0e9: U-01, U-03, U-02, U-04, FIX-C4-C5, FIX-SAFETY, FIX-RULINGS all built. Date 2026-11-07 07:26 IST; continued 07:40; continued 2026-11-07 10:41 IST (from 98f872d).
Commits (655516dc..HEAD, tip 957f333, newest first):
- 957f333 RS18: without crypto the lock page says where the PIN still works
- 468a93c RC12: a required custom field is marked and its first control takes the focus
- 034a180 RC11: test, without crypto.subtle lock.set sets nothing
- 3caf5bb RC10: test, leaving SOS starts the idle timer again from the last touch
- bda0f0f RC16: the wrong-PIN wait is proven by a test
- 0fc477b RC18: a lock during the snapshot take-in leaves nothing in memory
- aac2772 RC17: only a real sealed box counts as sealed
- bf38f72 RC15: a draft lists its rows in key order
- fa399a6 RC14: replaceAll replaces a stale snapshot too
- ef55fe2 RC13: autoLockMin is 5 unless 1, 5, 15 or never
- cce8ae6 RC10, RS10: SOS holds the lock open; leaving SOS checks the idle time first
- ffff640 RC11: without crypto.subtle the lock says so, never a wrong PIN
- 770c86c RC12: a required chips field is marked and focused
- 3d6ee8b RS13: a settings row that will not open keeps discreet mode
- 93d738d RS14: discreet mode says Help on the built-in pages too
- 8a7bf5a RS12: a lock page that fails still opens with the PIN
- d6035ff RS9: on SOS the whole coach layer is hidden
- 6afc262 C1: start-failure lines marked clinicalReview
Then cdfc0e9 and every earlier commit (8bf7b5c to cdfc0e9, with messages: C:/Users/ruchi/1-addic-wt/_logs/reports/core-report-annex.md).

### Turn caps
- 2026-11-07 14:11 IST (continued from bda0f0f): no builders ran this run (builders []; capHits 0). The FIX-R2 fixer committed the four fixes.
- 2026-11-07 11:58 IST (continued from cdfc0e9): no builders ran this run (builders []; capHits 0). The review-fix round (RC10-RC18, RS9-RS14, C1) was built by the fix step; both reviewers ran to the end this time.
- Builder batch [U-01]: steps_used 17; returned a note (yes). capHits: 0.
- 2026-11-07 07:40 IST: builder batch [U-03, U-02]: steps_used 42; returned a note (yes). capHits: 0.
- 2026-11-07 10:41 IST run (continued from 98f872d): earlier runs built U-04 (06cdf34), FIX-C4-C5 and the review fixes. This run: builder [FIX-SAFETY] steps_used 45, note yes; builder [FIX-RULINGS] steps_used 36, note yes; relaunch [FIX-RULINGS] steps_used 5 (nothing redone, only re-ran gates). capHits: 0. Stopped: two builders in a row made no progress (the relaunch found the batch already done).

### Units
- 2026-11-07 14:11 IST run (continued from bda0f0f; built this run: none; FIX-R2 fixes below). Held: none.
  Fixes: RC10 3caf5bb (test only; mutants of store.js failed); RC11 034a180 (test only; 4 mutants failed); RC12 468a93c; RS18 957f333.
  For a person: a required custom field that fails is marked invalid and its first control gets the focus. Without crypto.subtle the lock page adds the line 'Open this file in the browser where you set your PIN.' (p#lock-where, read by screen readers with the PIN field). Leaving SOS keeps the idle timer honest (locks at 60 s from the last touch).
  Questions closed: RC10, RC11, RC12, RS18.
- 2026-11-07 11:58 IST run (continued from cdfc0e9; built this run: none; review fixes below). Held: none.
  Fixes: C1 6afc262; RS9 d6035ff; RS12 8a7bf5a; RS14 93d738d; RS13 3d6ee8b; RC12 770c86c; RC11 ffff640; RC10+RS10 cce8ae6; RC13 ef55fe2; RC14 fa399a6; RC15 bf38f72; RC17 aac2772; RC18 0fc477b; RC16 bda0f0f (test only).
  For a person: the tour never covers SOS. A lock page that fails still takes the PIN. Discreet mode says Help on built-in pages and survives an unreadable settings row. A required feelings/triggers pick is marked and focused. Without crypto.subtle the lock says a PIN is not available here (no wrong-PIN count). While on SOS the timer does not lock the app; leaving SOS after the idle limit shows the lock screen. Auto-lock is 5 min unless 1, 5, 15 or never. An import replaces a stale snapshot. A lock during snapshot take-in leaves no plain rows in memory. Start-failure crisis lines are marked clinicalReview.
  Questions closed: Q1 (SOS vs wake lock) by Store.lock.hold; the reviewers' takeIn epoch question.
- U-01 Build pipeline and shell. SHA 8bf7b5c (build.mjs, shell.html, styles.css, boot.js, package.json, offline/1-addic.html).
  For a person: open offline/1-addic.html (one file, works from disk, no network). It shows the top bar (name "1-addic", saved label "Loading", theme button, settings link), five tabs (Today, Learn, Workbook, Track, Actions) and the floating SOS button. Nothing is behind them yet; the router and pages come with U-03 and the screen lanes. The theme follows the device, or a stored '1-addic:theme', before first paint. Zero console errors in headless Edge.
  Questions closed: brief Q3 (test script is a portable node one-liner), Q4 (parts list holds every name in territory.json).
- U-03 UI core and hash router. SHAs 2bcc049, ce258e0 (+ fixes 182659e, 4a43190). offline/src/ui-core.js (UI object, hash router, lock gate, SOS never gated, coming-soon pages, discreet mode, local-voice speak, sheet/confirm), tests in offline/tests/store.test.mjs.
  For a person: tabs now navigate with the back button; when the app is locked every page except SOS goes to the lock screen and an open sheet closes; a replaced sheet no longer gets the older sheet's close; unbuilt pages show a coming-soon page.
- U-02 Design tokens and components. SHA c52d0eb (styles.css). Light, dark and dark-media token sets match (--radius, --space-1..6 added), 44 px targets, focus-visible, reduced motion, calm, counters-off, print, SOS z-index 60 above #coach 50, contract G classes, `/* -- end core -- */` last.
  Questions closed: Store-triggered re-renders skip SOS and lock routes (U-04's Store must report locked: true before first render).
- Held or blocked: none (FIX-RULINGS was recorded as held when the loop ended, but is built in full at cdfc0e9).
  Order as run: U-01, U-03+U-02, U-04, FIX-C4-C5, review fixes, FIX-SAFETY, FIX-RULINGS.
- 2026-11-07 (earlier runs) U-04 The store, encrypted with a PIN when one is set. SHA 06cdf34 (store.js, store.test.mjs); F1 4112ca4, F2 36a2fbf. Contract E, BUILD-PLAN 3.3. FIX-C4-C5 030f949, 98f872d: replaceAll keeps the lock row across a reload; discreet mode holds on the lock screen. Review fixes e26b958, 0de55c7, 2f7266b, af2e097, f2159e0, 1e9272c, 4a48ead, 3789c81 (RC1-RC4, RC8, RS1-RS4; Q1, Q2 closed).
- 2026-11-07 10:41 IST run, FIX-SAFETY (tier 1). SHAs 37e0f14 (RS5), 5dcb83c (RS6), 02e2ac7 (RS7), 2d84168 (RS8), 7df959f (a), f36d66c (b), 93871c2 (c), f33ca6e (d), b3cde8e (e). Each red first, offline/1-addic.html rebuilt.
  For a person: Erase everything in a fallback session also deletes the database 1-addic (ERASE_PARTIAL if that fails). An SOS page already drawn is not redrawn on load. Discreet mode (title Notebook) holds before the data loads. The built-in urgent page keeps one tel:112 link (verify: true) when the list is empty or unreadable. Nothing waits in the print area while locked. The lock is checked on input, pageshow and visibilitychange (never while hidden). The PIN field asks for a number pad. The lock page says what to do about a forgotten PIN. A string on* attribute or a javascript: href/src is dropped by h().
  Questions closed: review questions a-e; RS5-RS8.
- 2026-11-07 10:41 IST run, FIX-RULINGS (tier 1). SHAs d16be2c (Q3), 698b81b (Q4, RC9), 56d46d0 (RC5), 32061e2 (RC6), cdfc0e9 (RC7).
  For a person: a row that will not decrypt is kept exactly as stored and survives a PIN change, remove and replace; only Erase everything removes it. Lists and exports come out in key order. RC5-RC7 are tests only, no behaviour change.
  Questions closed: 10:45 rulings Q3, Q4.

### Contract changes
- U-01 build and shell contracts (build.mjs output and exit codes, parts list, head/CSP, DOM hooks A, data-tour targets, boot.js, tokens, package.json): unchanged, full text in core-report-annex.md.
- No events, content keys, routes or UI.pages entries added yet.

- 2026-11-07 10:41 IST run: contract E additions (the HUB's file, not yet recorded): Store.status() has a sixth field unreadable (count of rows that would not decrypt, 0 while locked); view.get and view.list return frozen shallow copies (a lane must copy a row before changing it, or use draft.get in commit); view.list and exportJson return rows in key order; resetAll rejects with ERASE_PARTIAL if the IndexedDB delete fails; draft.list order inside commit follows key order (builder default). Any test that deepEquals status() must include unreadable: 0. URGENT.builtIn 112 (verify: true) exists in ui-core.js.
- 2026-11-07 (U-03/U-02): UI object per contracts B/C/D and G classes now exist; UI.sheet/UI.confirm onClose reasons include 'dismissed' and 'locked'. Store must expose status().locked, lock.onLock/touch/unlock, subscribe, load (U-04, contract E). styles.css replaced by U-02 tokens.

### Gates
VERIFIED (2026-11-07 14:11 IST, check, tip cdfc0e9 verdict PASS, no commits judged): no findings, territory none. VERIFIED by the fixer at 957f333: build rebuilt offline/1-addic.html (C:/Users/ruchi/1-addic-wt/_logs/gates/core/build-20261107-145208.log); red runs in C:/Users/ruchi/1-addic-wt/_logs/reports/core/core__<id>-red.log under 'FIX-R2'. ASSUMED: test, validate, guards at 957f333 not re-run by a gate step in this report; browser suite not run.
VERIFIED (check, 2026-11-07 11:58 IST, tip cdfc0e9): PASS; judged only commits after cdfc0e9 (none built this run). Gates as in the check of run wf_bf29c997-958: C:/Users/ruchi/1-addic-wt/_logs/reports/core/core__check.md. Not checked: the browser suite.
VERIFIED by the reviewers at bda0f0f: build GREEN 205925 B (_logs/gates/core/build-20261107-132631.log); test GREEN 77/77 (test-20261107-132634.log, test-20261107-132700.log); validate SKIP, engine.js absent (validate-20261107-133256.log); guards RED pass=4 fail=15, all 15 baselined tour-targets (guards-20261107-133101.log).
ASSUMED: builder gates at bda0f0f (build-20261107-131454.log, test-20261107-131455.log, validate-20261107-131716.log, guards-20261107-131716.log); browser suite not run.
Earlier gates (8bf7b5c to cdfc0e9): see annex.

2026-11-07 10:41 IST check at cdfc0e9: PASS. All units present; FIX-SAFETY (a)-(e), RS5-RS8, Q3, Q4+RC9, RC5-RC7 each meet their ruling.
- C1 (this run) LOW, RS4/Q2 (1e9272c), offline/src/boot.js:34 and :36 (showFailure): crisis copy ('If you are in danger, call your local emergency number', 'For urgent help...') carries no clinicalReview: true, though brief core.md line 68 says any crisis string is clinicalReview. Fix SHA: none. Re-check: not run. Default: left; the CORE chat to rule.
- Check notes: Q1 and (b) may conflict (a wake past the idle limit locks data while the SOS page stays drawn; SOS is not interrupted; core__units.md:360; the CORE chat's call). Builder defaults still to rule: aria-invalid on a required chips group (RC7), over-count by one in takeIn (Q4), draft.list order in commit (RC9).

### Review gates
None (2026-11-07 14:11 IST; reviewRecheck done, openReview 0).
None (the two reviewers judged 655516dc..HEAD; no gate recorded, openReview 0).

### Check
Verdict PASS at 8bf7b5c.
Slice checks C1-C4 and earlier reviews: see annex.

### Review
Slice: not run. 2026-11-07 10:41 IST: two reviewers judged 655516dc..HEAD; no review findings returned (their earlier re-checks died with their session; the earlier fixes RC1-RC4, RC8, RS1-RS8 are built, each with a test). openReview 0.

### Check (2026-11-07 11:58 IST)
Verdict PASS at cdfc0e9; judged commits after cdfc0e9 (none); findings none; openCheck 0. Territory: core's files only (run wf_bf29c997-958's check). Earlier check C1 fixed in 6afc262; re-check: not run.

### Review (2026-11-07 11:58 IST)
RC10-RC18, RS9-RS14 FIXED, RS11 WONTFIX-ACCEPTED (deferred), RC10-RC12 PARTLY (closed 14:11). Full text in core-report-annex.md.

### Safety and content marks
- 2026-11-07 14:11 IST: RS18 adds one non-clinical line on the lock page when crypto.subtle is missing; it does not name erase and is not marked clinicalReview. Forgot-PIN erase line unchanged.
Slice: none. 2026-11-07 10:41 IST: URGENT.builtIn 112 in ui-core.js carries verify: true, inside the clinicalReview block, used only when the urgent list is empty or unreadable. Start-failure strings in boot.js have no clinicalReview mark (check C1). Forgotten-PIN line is the ruling's wording. h() drops string on* and javascript: attributes. SOS is never gated and never interrupted by auto-lock.

- 2026-11-07 11:58 IST: start-failure crisis lines now carry clinicalReview (6afc262); they still need the clinical review. SOS: whole coach layer hidden; the hold keeps the timer from locking SOS; discreet mode says Help everywhere.
### Requests for other lanes
- 2026-11-07 14:11 IST: none new.
None recorded in the notes' for_the_chat beyond: the HUB baselines the 15 tour-target names as expected RED until the screens land (HUB owns baselines.md).

- 2026-11-07 11:58 IST: actions-sos: do not call Store.lock.touch() as a keep-alive on SOS; ui-core holds via Store.lock.hold(on). Redraw private rows on the lock notification.

### Docs owed
Full text in C:/Users/ruchi/1-addic-wt/_logs/reports/core-report-annex.md. Adds 11:58: the guide says a long SOS session ends at the lock screen and that without crypto.subtle a PIN is not available; contract E gets Store.lock.hold(on).

### Open questions
12. (2026-11-07 14:11 IST) Should the control that takes focus in a custom field carry aria-invalid and link its error text (aria-describedby)? Default built: aria-invalid on the custom node only.
13. (2026-11-07 14:11 IST) Should #lock-where be a live region (role=status) so it is heard when Enter is pressed in #lock-pin? Default built: no.
0. (11:46 IST) Rerun the two whole-lane reviews (contracts, safety) with a larger cap before the merge? Default: the HUB merges only after they return; until then the lane is RED, not for a code defect.
1. 15 tour targets RED in guards. Default built: left to the screen lanes; HUB baselines them by name.
2. Should a UI.boot() failure also show the urgent-help numbers (SOS never gated)? Default: no in U-01; U-03 may render #/sos/urgent content on the start-failure path.
4. C4: should a sheet open on SOS close on lock? Default: no.
5. 390 px proof used a 504 px clamp (Edge minimum). Default: accepted until browser tests.
3. C1 (message when UI undefined). Default built: no message (the chat's word).
6. (2026-11-07 10:41) Should a wake past the idle limit lock data while an SOS page stays on screen (Q1 vs (b))? Default: yes, chrome repainted only.
7. aria-invalid on a required chips group (RC7); over-count by one in takeIn (Q4); draft.list order in commit (RC9). Defaults built by the builder.
8. Check C1 (clinicalReview mark on start-failure copy). Default: unmarked.

9. (11:58 IST) RS11 reserved meta gen row: build or accept? Default: not built.
10. (11:58 IST) Confirm that idle past the limit inside SOS asks the PIN on leaving. Default built: yes.
11. (11:58 IST) Which actions-sos routes draw private rows (data stays open on SOS, no outer bound)? Default: none checked.

### For the HUB at the merge
- 2026-11-07 14:11 IST: tip 957f333 replaces bda0f0f; offline/1-addic.html rebuilt and committed; add p#lock-where and #lock-pin aria-describedby 'lock-msg lock-where' to the hooks if the browser suite needs them. RC10-RC12 and RS18 closed; RS11 still not built.
- 2026-11-07 11:46 IST: lane state RED only because the whole-lane review returned nothing; nothing new to merge since cdfc0e9. Rerun the reviewers before treating the lane as READY.
- Shared files: package.json (new file; core owns all keys but scripts and devDependencies); offline/build.mjs parts list at lines 14-42 (core's own append point, pre-filled with all 27 parts).
- package-lock.json: no change.
- Conflicts to expect: none known; other lanes add files to the parts list only if not already listed.
- Territory warnings: none.
- 2026-11-07: styles.css must keep the theme-parity guard green; ui-core.js expects U-04 Store shapes (locked from status() before first render).
- Guards: write the 15 tour-target names into baselines as expected RED.
- Browser tests for the quiet window: none exist yet; open offline/1-addic.html in a headless browser and confirm no console error.
- 2026-11-07 10:41 IST: record the contract E additions above (unreadable, frozen rows, key order, ERASE_PARTIAL) in contracts/core.md. The guards stay RED on exactly the 15 baselined tour-target names. Run gates.py --wt C:/Users/ruchi/1-addic-wt/core --lane core build test validate guards browser after the QUIET window. Consuming lanes copy a view row before changing it. offline/1-addic.html is rebuilt at each unit (on conflict take the rebuilt file). Evidence: C:/Users/ruchi/1-addic-wt/_logs/reports/core/ (core__units.md, core__*-red.log, core__q4-mut.log, core__rc567-mut.log).

- 2026-11-07 11:58 IST: tip bda0f0f replaces cdfc0e9. Record Store.lock.hold(on), NO_CRYPTO and the autoLockMin rule (1, 5, 15, never; else 5) in contracts/core.md. offline/1-addic.html rebuilt (205925 B). Guards RED = the 15 baselined names only. Resolve RS11 and the 3 PARTLY items first if the HUB wants READY.

### Check (2026-11-07 14:11 IST)
Verdict PASS at cdfc0e9 (judged only commits after bda0f0f by the check; none to judge); findings none; openCheck 0. Territory: core's files only.

### Review (2026-11-07 14:11 IST)
Contracts and safety judged 655516dc...HEAD; fix round FIX-R2 to 957f333; re-checked by the finders. openReview 0.
- RC10 MEDIUM U-04 3caf5bb: FIXED (test only; re-check FIXED). RC11 MEDIUM U-04 034a180: FIXED (re-check FIXED). RC12 LOW U-03 468a93c: FIXED (re-check FIXED). RS18 LOW U-04 957f333: FIXED (re-check FIXED, no new findings).
- New from the RC re-check, not fixed, no fix owed unless the lane agrees: LOW U-03 ui-core.js:359 (a custom field whose node only takes focus as a whole gets no focus; regression of RC12); LOW U-03 ui-core.js:373, :406 (tests do not cover firstFocusable's hidden/disabled skip); LOW U-04 ui-core.js:732 (no test reads aria-describedby 'lock-msg lock-where'). Two QUESTIONS: see open questions 12 and 13.
Evidence: C:/Users/ruchi/1-addic-wt/_logs/reports/core/core__units.md.
