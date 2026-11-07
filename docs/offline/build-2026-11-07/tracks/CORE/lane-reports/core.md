## core (CORE, 1-addic offline build): the slice report

State: STOPPED (tip cdfc0e9; stop reason: two builders in a row made no progress, but FIX-RULINGS was in fact built in full, so the lane is complete and ready for the HUB). Earlier state READY-SLICE (tip 4a43190). Branch build/core, worktree C:/Users/ruchi/1-addic-wt/core. Base 655516dc. Tip cdfc0e9: U-01, U-03, U-02, U-04, FIX-C4-C5, FIX-SAFETY, FIX-RULINGS all built. Date 2026-11-07 07:26 IST; continued 07:40; continued 2026-11-07 10:41 IST (from 98f872d).
Commits (655516dc..HEAD, tip cdfc0e9, newest first):
- cdfc0e9 RC7: UI.form validate, values, set and confirm's answers, tested
- 32061e2 RC6: the SOS night theme, tested
- 56d46d0 RC5: each tab's aria-current and the focus on #main, tested
- 698b81b Q4, RC9: a row that will not open is kept as stored; rows in key order
- d16be2c Q3: view.get and view.list return frozen rows
- b3cde8e FIX-SAFETY (e): h() never sets code as an attribute
- f33ca6e FIX-SAFETY (d): the lock page says what to do about a forgotten PIN
- 93871c2 FIX-SAFETY (c): the PIN field asks for a number pad
- f36d66c FIX-SAFETY (b): the lock is checked when the page wakes
- 7df959f FIX-SAFETY (a): nothing waits in #print-root while locked
- 2d84168 RS8: the built-in urgent page keeps one number to tap
- 02e2ac7 RS7: discreet mode holds before the Store has loaded
- 5dcb83c RS6: boot never draws again an SOS page already drawn
- 37e0f14 RS5: resetAll in a fallback session also deletes the IndexedDB database
- 3789c81 RC8: test proves a non-function listener is never kept
- 4a48ead RC8: the refusal branches of the store, tested
- 1e9272c RS4 (ruling Q2): a start failure still shows urgent help
- f2159e0 RC4: no auto-lock fires inside SOS
- af2e097 RC3: status() gives the auto-lock minutes in force
- 2f7266b RS1: no plain copy of the rows stays beside a PIN
- 0de55c7 RC2, RS3: a second tab never writes past a lock it has not seen
- e26b958 RC1, RS2: a lock while a new PIN is derived erases nothing
- 98f872d FIX-C4-C5 C5: discreet mode holds on the lock screen
- 030f949 FIX-C4-C5 C4: replaceAll keeps the lock row across a reload, proven
- 06cdf34 U-04: the store, encrypted with a PIN when one is set
- 36a2fbf F2: every sheet header carries its own SOS link
- 4112ca4 F1: a route change closes an open sheet
Earlier (slice):
- 4a43190 C3 (core, U-03): a test proves an open sheet closes when the app locks
- 182659e C2 (core, U-03): a replaced sheet's queued close never reaches the next sheet
- ce258e0 U-03 (core): lock-gate and render tests; sheet closes on lock; urgent note
- c52d0eb U-02 (core): design tokens and components
- 2bcc049 U-03 (core): UI core and hash router
- 8bf7b5c U-01 (core): build pipeline and shell, the slice

### Turn caps
- Builder batch [U-01]: steps_used 17; returned a note (yes). capHits: 0.
- 2026-11-07 07:40 IST: builder batch [U-03, U-02]: steps_used 42; returned a note (yes). capHits: 0.
- 2026-11-07 10:41 IST run (continued from 98f872d): earlier runs built U-04 (06cdf34), FIX-C4-C5 and the review fixes. This run: builder [FIX-SAFETY] steps_used 45, note yes; builder [FIX-RULINGS] steps_used 36, note yes; relaunch [FIX-RULINGS] steps_used 5 (nothing redone, only re-ran gates). capHits: 0. Stopped: two builders in a row made no progress (the relaunch found the batch already done).

### Units
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
- `node offline/build.mjs` / `npm run build`: writes offline/1-addic.html; prints `built offline/1-addic.html <bytes> B (<kB> kB), N parts, skipped (absent): ...`, and a `not in the parts list (not built)` line for unlisted .js files. Exit 1 on unreadable file, part that does not parse, duplicate entry, boot.js not last, or `</style` in styles.css. Consumers: HUB gates, tests-docs, every lane adding a file.
- Parts list (build.mjs lines 14-42, between `// -- parts --` and `// -- end parts --`): all 27 parts of 3.1 and territory.json, boot last. Consumers: every lane that adds a file.
- Head: CSP of 3.1 word for word, `referrer no-referrer` (added), color-scheme, title, pre-paint theme script. Parts are classic `<script data-part>`; `</script` becomes `<\/script`, `<!--` becomes `\x3C!--`.
- DOM hooks (contract A) in shell.html: #app, header#topbar, #app-name, #saved-label, #theme-btn, #settings-btn (#/settings), a#sos-btn (#/sos), nav#nav with five data-route anchors, main#main, dialog#dialog, #toasts, #coach, #print-root. Consumers: tests-docs, game-tutorials, all UI lanes.
- data-tour targets: sos-button, nav-today, nav-learn, nav-workbook, nav-track, nav-actions. Consumer: game-tutorials.
- boot.js: calls UI.boot() on DOMContentLoaded only when UI is defined; if it throws, #main shows "The app could not start. Please reload the page." (role alert) and rethrows. No-op in Node. Consumer: none yet (needs U-03).
- styles.css starter colour tokens (--bg --surface --surface-2 --text --muted --primary --primary-text --accent --gold --danger --border --focus). U-02 replaces it. Consumers: all UI lanes.
- package.json: name 1-addic, version 0.1.0, private, engines node >=22, no "type"; scripts.build, scripts.test (runs node --test on offline/tests/*.test.mjs except browser.test.mjs; exits 0 with "no tests in offline/tests" when none). Consumers: tests-docs, HUB.
- No events, content keys, routes or UI.pages entries added yet.

- 2026-11-07 10:41 IST run: contract E additions (the HUB's file, not yet recorded): Store.status() has a sixth field unreadable (count of rows that would not decrypt, 0 while locked); view.get and view.list return frozen shallow copies (a lane must copy a row before changing it, or use draft.get in commit); view.list and exportJson return rows in key order; resetAll rejects with ERASE_PARTIAL if the IndexedDB delete fails; draft.list order inside commit follows key order (builder default). Any test that deepEquals status() must include unreadable: 0. URGENT.builtIn 112 (verify: true) exists in ui-core.js.
- 2026-11-07 (U-03/U-02): UI object per contracts B/C/D and G classes now exist; UI.sheet/UI.confirm onClose reasons include 'dismissed' and 'locked'. Store must expose status().locked, lock.onLock/touch/unlock, subscribe, load (U-04, contract E). styles.css replaced by U-02 tokens.

### Gates
VERIFIED (check, tip 8bf7b5c):
- build GREEN size=103409B. Log C:\Users\ruchi\1-addic-wt\_logs\gates\core\build-20261107-073329.log
- test SKIP (no node test files). Log ...\gates\core\test-20261107-073329.log
- validate SKIP (engine.js absent, as on the base). Log ...\gates\core\validate-20261107-073329.log
- guards RED pass=4 fail=15. Every failure is 'guard: tour-target' for: quicklog-button, quicklog-intensity, quicklog-save, planner-day, planner-gaps, planner-add, bp-new, bp-form, workbook-groups, workbook-card, insights-triggers, insights-heatmap, review-start, plan-sections, plan-print. Contract D gives all 15 to screen lanes; baselines.md line 22 expects them RED by name. csp, external-url, innerHTML and theme-parity pass. Log ...\gates\core\guards-20261107-073329.log
- Territory: core 655516dc..HEAD: 6 files, 5 own, 1 shared (package.json, scripts keys with tests-docs' go-ahead), 0 nobody's, 0 errors, no warnings.
ASSUMED (not run by me): headless Edge proof is the builder's (C:/Users/ruchi/1-addic-wt/_logs/reports/core/core__proof-real.err/.dom); no browser tests exist; negative controls (part with `</script`, unparsable part, throwing browser.test.mjs) were read in code (build.mjs:77-110), not re-run; AA contrast of starter tokens not measured.

VERIFIED (check 2026-11-07 10:41 IST, tip cdfc0e9; judged commits after 98f872d):
- build GREEN pass=1, size 202428 B. Log C:\Users\ruchi\1-addic-wt\_logs\gates\core\build-20261107-114612.log
- test GREEN 62/62, 0 fail. Log C:\Users\ruchi\1-addic-wt\_logs\gates\core\test-20261107-114615.log
- validate SKIP (engine.js absent on this lane, as at every core tip). Log C:\Users\ruchi\1-addic-wt\_logs\gates\core\validate-20261107-114750.log
- guards RED 4 pass, 15 fail; every failure is a baselined tour-target name (baselines.md line 22), no new one. Log C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-114750.log
- Territory core 655516dc..HEAD: 9 files, 8 own, 1 shared (package.json, unchanged after 98f872d), 0 nobody's, 0 errors, 0 warnings. Worktree clean.
ASSUMED: browser gate not run (core has no browser tests; RS7 slow-load, SOS-during-load and Back cases belong to tests-docs, contracts/core.md:101). Builders' red proofs (core__*-red.log) and mutant runs (core__q4-mut.log 10/10, core__rc567-mut.log 16/16) read by summary line, not re-run; the builders' batch ran inside QUIET so no browser suite.

VERIFIED (check, 2026-11-07, tip 4a43190):
- build GREEN (...\gates\coreuild-20261107-081342.log); test GREEN 18/18 (test-20261107-081343.log); validate SKIP, engine.js absent (validate-20261107-081346.log); guards RED only on the 15 tour-target names, baselined (baselines.md 26-40), counts green (guards-20261107-081346.log). Earlier check at ce258e0: build 163334 B, test 15/15 (build-20261107-075915.log, test-20261107-075917.log, guards-20261107-075920.log).
- Territory 8bf7b5c..HEAD: 4 files, all own, 0 shared, 0 nobody's, 0 errors.
ASSUMED: browser gate not run (none exists); 390 px proof is the builder's at 504 px (core__proof-nav.dom); AA contrast (core__contrast.mjs) and mutation script (core__mutate.sh) not rerun.

2026-11-07 10:41 IST check at cdfc0e9: PASS. All units present; FIX-SAFETY (a)-(e), RS5-RS8, Q3, Q4+RC9, RC5-RC7 each meet their ruling.
- C1 (this run) LOW, RS4/Q2 (1e9272c), offline/src/boot.js:34 and :36 (showFailure): crisis copy ('If you are in danger, call your local emergency number', 'For urgent help...') carries no clinicalReview: true, though brief core.md line 68 says any crisis string is clinicalReview. Fix SHA: none. Re-check: not run. Default: left; the CORE chat to rule.
- Check notes: Q1 and (b) may conflict (a wake past the idle limit locks data while the SOS page stays drawn; SOS is not interrupted; core__units.md:360; the CORE chat's call). Builder defaults still to rule: aria-invalid on a required chips group (RC7), over-count by one in takeIn (Q4), draft.list order in commit (RC9).

### Review gates
None (the two reviewers judged 655516dc..HEAD; no gate recorded, openReview 0).

### Check
Verdict PASS at 8bf7b5c.
- C1 LOW, U-01, offline/src/boot.js:19: the brief (tracks/CORE/briefs/core.md:22) says to write a one-line message into #main when UI is undefined; the chat's word (briefs/core/U-01.md:3) only says to call UI.boot() when defined, and the builder chose no message. Fix: none yet; either add the message or amend the brief. Re-check: not run.

2026-11-07 check at ce258e0: FIX; after fixes re-check below.
- C2 MEDIUM, U-03, fix 182659e: a replaced sheet's queued close reached the next sheet. Re-check: FIXED (guard at ui-core.js:184).
- C3 LOW, U-03, fix 4a43190: no test for sheet closing on lock. Re-check: FIXED (store.test.mjs:404).
- C4 LOW, U-03, no fix yet: ui-core.js:714 closes a sheet on lock only when route is not SOS, so a private sheet stays open if the route moves to #/sos then locks. Re-check: not run. Default: left as deliberate (SOS never interrupted) pending the chat.

### Review
Slice: not run. 2026-11-07 10:41 IST: two reviewers judged 655516dc..HEAD; no review findings returned (their earlier re-checks died with their session; the earlier fixes RC1-RC4, RC8, RS1-RS8 are built, each with a test). openReview 0.

### Safety and content marks
Slice: none. 2026-11-07 10:41 IST: URGENT.builtIn 112 in ui-core.js carries verify: true, inside the clinicalReview block, used only when the urgent list is empty or unreadable. Start-failure strings in boot.js have no clinicalReview mark (check C1). Forgotten-PIN line is the ruling's wording. h() drops string on* and javascript: attributes. SOS is never gated and never interrupted by auto-lock.

### Requests for other lanes
None recorded in the notes' for_the_chat beyond: the HUB baselines the 15 tour-target names as expected RED until the screens land (HUB owns baselines.md).

### Docs owed
None for U-01, U-03, U-02 (README and guide belong to tests-docs). 2026-11-07 10:41 IST: guide/README owe the forgotten-PIN line, discreet title Notebook, Erase everything also removing the database, and an unreadable-row note (tests-docs).

### Open questions
1. 15 tour targets RED in guards. Default built: left to the screen lanes; HUB baselines them by name.
2. Should a UI.boot() failure also show the urgent-help numbers (SOS never gated)? Default: no in U-01; U-03 may render #/sos/urgent content on the start-failure path.
4. C4: should a sheet open on SOS close on lock? Default: no.
5. 390 px proof used a 504 px clamp (Edge minimum). Default: accepted until browser tests.
3. C1 (message when UI undefined). Default built: no message (the chat's word).
6. (2026-11-07 10:41) Should a wake past the idle limit lock data while an SOS page stays on screen (Q1 vs (b))? Default: yes, chrome repainted only.
7. aria-invalid on a required chips group (RC7); over-count by one in takeIn (Q4); draft.list order in commit (RC9). Defaults built by the builder.
8. Check C1 (clinicalReview mark on start-failure copy). Default: unmarked.

### For the HUB at the merge
- Shared files: package.json (new file; core owns all keys but scripts and devDependencies); offline/build.mjs parts list at lines 14-42 (core's own append point, pre-filled with all 27 parts).
- package-lock.json: no change.
- Conflicts to expect: none known; other lanes add files to the parts list only if not already listed.
- Territory warnings: none.
- 2026-11-07: styles.css must keep the theme-parity guard green; ui-core.js expects U-04 Store shapes (locked from status() before first render).
- Guards: write the 15 tour-target names into baselines as expected RED.
- Browser tests for the quiet window: none exist yet; open offline/1-addic.html in a headless browser and confirm no console error.
- 2026-11-07 10:41 IST: record the contract E additions above (unreadable, frozen rows, key order, ERASE_PARTIAL) in contracts/core.md. The guards stay RED on exactly the 15 baselined tour-target names. Run gates.py --wt C:/Users/ruchi/1-addic-wt/core --lane core build test validate guards browser after the QUIET window. Consuming lanes copy a view row before changing it. offline/1-addic.html is rebuilt at each unit (on conflict take the rebuilt file). Evidence: C:/Users/ruchi/1-addic-wt/_logs/reports/core/ (core__units.md, core__*-red.log, core__q4-mut.log, core__rc567-mut.log).
