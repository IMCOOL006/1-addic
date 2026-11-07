## core (CORE, 1-addic offline build): the slice report

State: READY-SLICE (tip 4a43190). Branch build/core, worktree C:/Users/ruchi/1-addic-wt/core. Base 655516dc. Tip 4a43190 (U-01, U-03, U-02 built; U-04 not yet). Date 2026-11-07 07:26 IST; continued 2026-11-07 07:40 IST.
Commits (655516dc..HEAD):
- 4a43190 C3 (core, U-03): a test proves an open sheet closes when the app locks
- 182659e C2 (core, U-03): a replaced sheet's queued close never reaches the next sheet
- ce258e0 U-03 (core): lock-gate and render tests; sheet closes on lock; urgent note
- c52d0eb U-02 (core): design tokens and components
- 2bcc049 U-03 (core): UI core and hash router
- 8bf7b5c U-01 (core): build pipeline and shell, the slice

### Turn caps
- Builder batch [U-01]: steps_used 17; returned a note (yes). capHits: 0.
- 2026-11-07 07:40 IST: builder batch [U-03, U-02]: steps_used 42; returned a note (yes). capHits: 0.

### Units
- U-01 Build pipeline and shell. SHA 8bf7b5c (build.mjs, shell.html, styles.css, boot.js, package.json, offline/1-addic.html).
  For a person: open offline/1-addic.html (one file, works from disk, no network). It shows the top bar (name "1-addic", saved label "Loading", theme button, settings link), five tabs (Today, Learn, Workbook, Track, Actions) and the floating SOS button. Nothing is behind them yet; the router and pages come with U-03 and the screen lanes. The theme follows the device, or a stored '1-addic:theme', before first paint. Zero console errors in headless Edge.
  Questions closed: brief Q3 (test script is a portable node one-liner), Q4 (parts list holds every name in territory.json).
- U-03 UI core and hash router. SHAs 2bcc049, ce258e0 (+ fixes 182659e, 4a43190). offline/src/ui-core.js (UI object, hash router, lock gate, SOS never gated, coming-soon pages, discreet mode, local-voice speak, sheet/confirm), tests in offline/tests/store.test.mjs.
  For a person: tabs now navigate with the back button; when the app is locked every page except SOS goes to the lock screen and an open sheet closes; a replaced sheet no longer gets the older sheet's close; unbuilt pages show a coming-soon page.
- U-02 Design tokens and components. SHA c52d0eb (styles.css). Light, dark and dark-media token sets match (--radius, --space-1..6 added), 44 px targets, focus-visible, reduced motion, calm, counters-off, print, SOS z-index 60 above #coach 50, contract G classes, `/* -- end core -- */` last.
  Questions closed: Store-triggered re-renders skip SOS and lock routes (U-04's Store must report locked: true before first render).
- Held or blocked: none.
- Still to build on this lane: U-04 (store.test.mjs first, then store.js; contract E, BUILD-PLAN 3.3).
  Order as run: U-01, U-03+U-02, U-04 (U-04 alone in its batch).

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

- 2026-11-07 (U-03/U-02): UI object per contracts B/C/D and G classes now exist; UI.sheet/UI.confirm onClose reasons include 'dismissed' and 'locked'. Store must expose status().locked, lock.onLock/touch/unlock, subscribe, load (U-04, contract E). styles.css replaced by U-02 tokens.

### Gates
VERIFIED (check, tip 8bf7b5c):
- build GREEN size=103409B. Log C:\Users\ruchi\1-addic-wt\_logs\gates\core\build-20261107-073329.log
- test SKIP (no node test files). Log ...\gates\core\test-20261107-073329.log
- validate SKIP (engine.js absent, as on the base). Log ...\gates\core\validate-20261107-073329.log
- guards RED pass=4 fail=15. Every failure is 'guard: tour-target' for: quicklog-button, quicklog-intensity, quicklog-save, planner-day, planner-gaps, planner-add, bp-new, bp-form, workbook-groups, workbook-card, insights-triggers, insights-heatmap, review-start, plan-sections, plan-print. Contract D gives all 15 to screen lanes; baselines.md line 22 expects them RED by name. csp, external-url, innerHTML and theme-parity pass. Log ...\gates\core\guards-20261107-073329.log
- Territory: core 655516dc..HEAD: 6 files, 5 own, 1 shared (package.json, scripts keys with tests-docs' go-ahead), 0 nobody's, 0 errors, no warnings.
ASSUMED (not run by me): headless Edge proof is the builder's (C:/Users/ruchi/1-addic-wt/_logs/reports/core/core__proof-real.err/.dom); no browser tests exist; negative controls (part with `</script`, unparsable part, throwing browser.test.mjs) were read in code (build.mjs:77-110), not re-run; AA contrast of starter tokens not measured.

VERIFIED (check, 2026-11-07, tip 4a43190):
- build GREEN (...\gates\coreuild-20261107-081342.log); test GREEN 18/18 (test-20261107-081343.log); validate SKIP, engine.js absent (validate-20261107-081346.log); guards RED only on the 15 tour-target names, baselined (baselines.md 26-40), counts green (guards-20261107-081346.log). Earlier check at ce258e0: build 163334 B, test 15/15 (build-20261107-075915.log, test-20261107-075917.log, guards-20261107-075920.log).
- Territory 8bf7b5c..HEAD: 4 files, all own, 0 shared, 0 nobody's, 0 errors.
ASSUMED: browser gate not run (none exists); 390 px proof is the builder's at 504 px (core__proof-nav.dom); AA contrast (core__contrast.mjs) and mutation script (core__mutate.sh) not rerun.

### Review gates
None.

### Check
Verdict PASS at 8bf7b5c.
- C1 LOW, U-01, offline/src/boot.js:19: the brief (tracks/CORE/briefs/core.md:22) says to write a one-line message into #main when UI is undefined; the chat's word (briefs/core/U-01.md:3) only says to call UI.boot() when defined, and the builder chose no message. Fix: none yet; either add the message or amend the brief. Re-check: not run.

2026-11-07 check at ce258e0: FIX; after fixes re-check below.
- C2 MEDIUM, U-03, fix 182659e: a replaced sheet's queued close reached the next sheet. Re-check: FIXED (guard at ui-core.js:184).
- C3 LOW, U-03, fix 4a43190: no test for sheet closing on lock. Re-check: FIXED (store.test.mjs:404).
- C4 LOW, U-03, no fix yet: ui-core.js:714 closes a sheet on lock only when route is not SOS, so a private sheet stays open if the route moves to #/sos then locks. Re-check: not run. Default: left as deliberate (SOS never interrupted) pending the chat.

### Review
Not run on a slice: the two reviewers run once at the lane's end.

### Safety and content marks
None. No clinicalReview: true passages and no verify: true resources (the only copy is tab names, "SOS", "Loading" and the start-failure line).

### Requests for other lanes
None recorded in the notes' for_the_chat beyond: the HUB baselines the 15 tour-target names as expected RED until the screens land (HUB owns baselines.md).

### Docs owed
None for U-01, U-03, U-02 (README and guide belong to tests-docs).

### Open questions
1. 15 tour targets RED in guards. Default built: left to the screen lanes; HUB baselines them by name.
2. Should a UI.boot() failure also show the urgent-help numbers (SOS never gated)? Default: no in U-01; U-03 may render #/sos/urgent content on the start-failure path.
4. C4: should a sheet open on SOS close on lock? Default: no.
5. 390 px proof used a 504 px clamp (Edge minimum). Default: accepted until browser tests.
3. C1 (message when UI undefined). Default built: no message (the chat's word).

### For the HUB at the merge
- Shared files: package.json (new file; core owns all keys but scripts and devDependencies); offline/build.mjs parts list at lines 14-42 (core's own append point, pre-filled with all 27 parts).
- package-lock.json: no change.
- Conflicts to expect: none known; other lanes add files to the parts list only if not already listed.
- Territory warnings: none.
- 2026-11-07: styles.css must keep the theme-parity guard green; ui-core.js expects U-04 Store shapes (locked from status() before first render).
- Guards: write the 15 tour-target names into baselines as expected RED.
- Browser tests for the quiet window: none exist yet; open offline/1-addic.html in a headless browser and confirm no console error.
