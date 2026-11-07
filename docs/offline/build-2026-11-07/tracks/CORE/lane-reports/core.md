## core (CORE, 1-addic offline build): the slice report

State: READY (2026-11-07 17:16 IST, continued from b4ccce4; tip 8e80951; check PASS at b4ccce4; review RC1, RC2, RC3, RS19 all FIXED and re-checked; open 0; guards RED on the 15 baselined tour-targets only). Earlier: STOPPED (16:41 IST, tip b4ccce4, review not run); READY (14:11 IST, tip 957f333). Earlier states in the annex. Branch build/core, worktree C:/Users/ruchi/1-addic-wt/core. Base 655516dc. All units built: U-01, U-03, U-02, U-04, FIX-C4-C5, FIX-SAFETY, FIX-RULINGS, FIX-R2, FIX-V11 (tier 1). Dates 2026-11-07 07:26 to 17:16 IST.
Commits (655516dc..HEAD, tip 8e80951, newest first):
- 8e80951 RC2: test, high contrast follows a store change and boot paths
- 58f309a RS19: high contrast stays on while the settings row is sealed
- 15f99c6 RC3: a custom field's focus node is named by its label
- 9b03126 RC1: a control a custom field returns keeps its tab stop
- b4ccce4 FIX-V11 RS18-V11: the PIN-where line is read out with the first
- 36c08fd FIX-V11 RC12-V11: custom field focus target marked, falls back to node
- 16df9e7 FIX-V11 R-S-6: high contrast applied on every render
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
- 2026-11-07 17:16 IST (continued from b4ccce4): no builders (builders []; capHits 0); two reviewers plus one fix round (RC1, RC3, RS19, RC2) and the re-checks.
- Older runs (16:41, 14:11, 11:58, 10:41, 07:40, 07:26 IST): capHits 0; lines in the annex.


### Units
- 2026-11-07 17:16 IST: no unit built this run; FIX-V11 (R-S-6 16df9e7, RC12-V11 36c08fd, RS18-V11 b4ccce4) was judged. Review fixes: RC1 9b03126 (a select, input or button a custom field returns keeps its natural tab stop after a failed Save); RC3 15f99c6 (the field label names the focused node, aria-labelledby, role group when bare); RS19 58f309a (high contrast no longer drops on the lock page or SOS while locked); RC2 8e80951 (test: high contrast follows store change and boot paths, 4 mutants red). Questions closed: RC12 marks the focused control; locked look stays as the session left it. Detail: _logs/reports/core/core__units.md:582, core__units-V11.md:57.
- 2026-11-07 16:41 IST run (from 957f333; built this run: FIX-V11, 16df9e7 R-S-6, 36c08fd RC12-V11, b4ccce4 RS18-V11). Held: none. Person-visible: high contrast stays on from the first screen after reload (not on the lock screen); a required custom field left empty takes focus on its first usable control, read as invalid with its error line; the no-crypto lock page reads both lines together. No words changed. Closed: R-S-6, RC12 and RS18 follow-ups. Detail: _logs/reports/core/core__units.md line 527 on.
- 2026-11-07 14:11 IST run (continued from bda0f0f; built this run: none; FIX-R2 fixes below). Held: none.
  Fixes: RC10 3caf5bb (test only; mutants of store.js failed); RC11 034a180 (test only; 4 mutants failed); RC12 468a93c; RS18 957f333.
  For a person: a required custom field that fails is marked invalid and its first control gets the focus. Without crypto.subtle the lock page adds the line 'Open this file in the browser where you set your PIN.' (p#lock-where, read by screen readers with the PIN field). Leaving SOS keeps the idle timer honest (locks at 60 s from the last touch).
  Questions closed: RC10, RC11, RC12, RS18.
- 2026-11-07 11:58 IST run (continued from cdfc0e9; built this run: none; review fixes below). Held: none.
  Fixes: C1 6afc262; RS9 d6035ff; RS12 8a7bf5a; RS14 93d738d; RS13 3d6ee8b; RC12 770c86c; RC11 ffff640; RC10+RS10 cce8ae6; RC13 ef55fe2; RC14 fa399a6; RC15 bf38f72; RC17 aac2772; RC18 0fc477b; RC16 bda0f0f (test only).
  For a person: the tour never covers SOS. A lock page that fails still takes the PIN. Discreet mode says Help ... (rest: core-report-annex.md)
  Questions closed: Q1 (SOS vs wake lock) by Store.lock.hold; the reviewers' takeIn epoch question.
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

### Contract changes
- 2026-11-07 16:41 IST: html[data-contrast=high] set by chrome() every render; UI.form custom field marks focus target (aria-invalid, error id in aria-describedby, node fallback tabindex=-1); lock page div.lock-said[role=alert] holds #lock-msg and #lock-where (#lock-msg no longer role=alert). No Store API change.
- U-01 build and shell contracts (build.mjs output and exit codes, parts list, head/CSP, DOM hooks A, data-tour targets, boot.js, tokens, package.json): unchanged, full text in core-report-annex.md.
- No events, content keys, routes or UI.pages entries added yet.

- 2026-11-07 10:41 IST run: contract E additions (the HUB's file, not yet recorded): Store.status() has a sixth field unreadable (count of rows that w ... (full text: core-report-annex.md, Moved 16:41)
- 2026-11-07 (U-03/U-02): UI object per contracts B/C/D and G classes now exist; UI.sheet/UI.confirm onClose reasons include 'dismissed' and 'locked'. Store must expose status().locked, lock.onLock/touch/unlock, subscribe, load (U-04, contract E). styles.css replaced by U-02 tokens.

### Gates
VERIFIED (2026-11-07 14:11 IST, check, tip cdfc0e9 verdict PASS, no commits judged): no findings, territory no ... (rest: core-report-annex.md)
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
(text: core-report-annex.md)

### Safety and content marks
- 2026-11-07 16:41 IST: no new copy, no network, no event-log change, SOS not gated; none new clinicalReview.
- 2026-11-07 14:11 IST: RS18 adds one non-clinical line on the lock page when crypto.subtle is missing; it does not name erase and is not marked clinicalReview. Forgot-PIN erase line unchanged.
Slice: none. 2026-11-07 10:41 IST: URGENT.builtIn 112 in ui-core.js carries verify: true, inside the clinicalReview block, used only when the urgent list is empty or unreadable. Start-failure strings in boot.js have no clinicalReview mark (check C1). Forgotten-PIN line is the ruling's wording. h() drops string on* and javascript: attributes. SOS is never gated and never interrupted by auto-lock.

- 2026-11-07 11:58 IST: start-failure crisis lines now carry clinicalReview (6afc262); they still need the clinical review. SOS: whole coach layer hidden; the hold keeps the timer from locking SOS; discreet mode says Help everywhere.
### Requests for other lanes
- 2026-11-07 16:41 IST: workbook-settings may drop its data-contrast stop-gap in ui-settings.js; tests-docs: hooks looking for #lock-msg[role=alert] look at its parent .lock-said.
- 2026-11-07 14:11 IST: none new.
None recorded in the notes' for_the_chat beyond: the HUB baselines the 15 tour-target names as expected RED until the screens land (HUB owns baselines.md).

- 2026-11-07 11:58 IST: actions-sos: do not call Store.lock.touch() as a keep-alive on SOS; ui-core holds via Store.lock.hold(on). Redraw private rows on the lock notification.

### Docs owed
See C:/Users/ruchi/1-addic-wt/_logs/reports/core-report-annex.md (Docs owed).

### Open questions
Earlier questions and defaults: core-report-annex.md. New ones: see Review 17:16 IST.

### For the HUB at the merge
- 2026-11-07 16:41 IST: tip b4ccce4 replaces 957f333 (3 commits; ui-core.js, styles.css one rule, store.test.mjs +4, rebuilt html 208924 B). 3 of 15 tour-target REDs (quicklog-*) lift once the trunk's 3f3001e is merged; rest baselined.
- 2026-11-07 14:11 IST: tip 957f333 replaces bda0f0f; offline/1-addic.html rebuilt and committed; add p#lock-where and #lock-pin aria-describedby 'lock-msg lock-where' to the hooks if the browser suite needs them. RC10-RC12 and RS18 closed; RS11 still not built.
- 2026-11-07 11:46 IST: lane state RED only because the whole-lane review returned nothing; nothing new to merge since cdfc0e9. Rerun the reviewers before treating the lane as READY.
- Shared files: package.json (new file; core owns all keys but scripts and devDependencies); offline/build.mjs parts list at lines 14-42 (core's own append point, pre-filled with all 27 parts).
- package-lock.json: no change.
- Conflicts to expect: none known; other lanes add files to the parts list only if not already listed.
- Territory warnings: none.
- 2026-11-07: styles.css must keep the theme-parity guard green; ui-core.js expects U-04 Store shapes (locked from status() before first render).
- Guards: write the 15 tour-target names into baselines as expected RED.
- Browser tests for the quiet window: none exist yet; open offline/1-addic.html in a headless browser and confirm no console error.
- 2026-11-07 10:41 IST: record the contract E additions above (unreadable, frozen rows, key order, ERASE_PARTI ... (rest: core-report-annex.md)

- 2026-11-07 11:58 IST: tip bda0f0f replaces cdfc0e9. Record Store.lock.hold(on), NO_CRYPTO and the autoLockMin rule (1, 5, 15, never; else 5) in contracts/core.md. offline/1-addic.html rebuilt (205925 B). Guards RED = the 15 baselined names only. Resolve RS11 and the 3 PARTLY items first if the HUB wants READY.

### Check (2026-11-07 14:11 IST)
Verdict PASS at cdfc0e9 (judged only commits after bda0f0f by the check; none to judge); findings none; openCheck 0. Territory: core's files only.

### Review (2026-11-07 14:11 IST)
Contracts and safety judged 655516dc...HEAD; fix round FIX-R2 to 957f333; re-checked by the finders. openReview 0.
- RC10 MEDIUM U-04 3caf5bb: FIXED (test only; re-check FIXED). RC11 MEDIUM U-04 034a180: FIXED (re-check FIXED). RC12 LOW U-03 468a93c: FIXED (re-check FIXED). RS18 LOW U-04 957f333: FIXED (re-check FIXED, no new findings).
- New from the RC re-check, not fixed, no fix owed unless the lane agrees: LOW U-03 ui-core.js:359 (a custom f ... (rest: core-report-annex.md)
Evidence: C:/Users/ruchi/1-addic-wt/_logs/reports/core/core__units.md.

### Gates (2026-11-07 16:41 IST)
VERIFIED: build GREEN 208924 B (_logs/gates/core/build-20261107-170636.log); test GREEN 84/0/0 (test-20261107- ... (rest: core-report-annex.md)

### Check (2026-11-07 16:41 IST)
PASS at b4ccce4; findings none; open 0. FIX-V11 meets rulings (contracts/core.md 112-113, R-C-23). Review: not run (reviewers []), open 0.

### Gates (2026-11-07 17:16 IST)
VERIFIED at 8e80951 by the re-checker: build GREEN (_logs/gates/core/build-20261107-180846.log); test GREEN 87/87 (test-20261107-180848.log); validate SKIP, engine.js absent (validate-20261107-181706.log); guards RED by the same 15 tour-target names, none new (guards-20261107-181706.log). ASSUMED: no browser suite run; no real-browser check of textContent spacing (Q-m).

### Check (2026-11-07 17:16 IST)
PASS at b4ccce4 (judged only commits after b4ccce4: none); findings none. Territory: core's files only (ui-core.js, store.test.mjs, 1-addic.html rebuilt); no shared file touched.

### Review (2026-11-07 17:16 IST)
Contracts and safety judged 957f333...HEAD; one fix round; re-checked by the finders. openReview 0.
- RC1 MEDIUM RC12-V11 36c08fd: fix 9b03126, FIXED. RC3 LOW RC12-V11: fix 15f99c6, FIXED. RC2 LOW R-S-6 16df9e7: fix 8e80951 (test only), FIXED. RS19 LOW R-S-6: fix 58f309a, FIXED, no new findings.
- New from the RC re-check, not fixed: N1 LOW ui-core.js:377 (role=group replaces an implicit role such as list or table); N2 LOW :373-378 (a contenteditable node loses its tab stop and gets role group). Q-a: a bare native control returned as the node has no accessible name from the label.
- Open questions from the reviewers: chips follow the aria-invalid rule (Q-chips); firstFocusable ignores class-hidden or closed-details controls (Q-n); text size and motion dropped on locked renders (Q-k); RS18 second line missing on the real NO_CRYPTO lock page in ui-onboarding.js:144 (Q-l, actions-sos lane); Q-m above. Defaults: no change.
- Contract: custom-field focus rules (RC1, RC3) and the locked-chrome rule (data attributes left as the session left them while locked or loading) to be recorded in contracts/core.md. Requests: actions-sos align the NO_CRYPTO line (Q-l). Docs owed: none new. For the HUB at the merge: tip 8e80951 replaces b4ccce4; offline/1-addic.html rebuilt; guards RED = the 15 baselined names only; no test should expect data-contrast removed on a locked render.
