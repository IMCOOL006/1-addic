# Brief: lane core (CORE chat), 2026-11-07, base 655516dc

Order U-01 -> U-03 -> U-02 -> U-04; batches [[U-01],[U-03,U-02],[U-04]]. U-01 is the SLICE (merged first; opens the chain U-01 -> U-03 -> U-05 -> U-09 -> U-04). Flagged: two reviewers at the end (contracts and tests; safety copy, privacy and the person's data). Contract: tracks/CORE/contracts/core.md (DOM ids, UI.*, Store.*, routes, data-tour). Other lanes build on it today.

## 1. What the lane is for
Make the one-file app exist: the build that inlines parts into offline/1-addic.html under a CSP head, the shell markup, the look, the UI core with hash router, and the encrypted store. Every UI lane of both chats switches to the real ui-core.js and store.js when this merges, so U-03's and U-04's public shapes ARE the contract (BUILD-PLAN 3.1, 3.2 UI part, 3.3, 3.5, 3.12). Starts at hour 0; depends on nothing.

## 2. Files
Base holds only offline/src/content-core.js and content-lessons-a.js (both end with a `module.exports` guard). Content.discreetName = 'Notebook' (content-core.js:12). Tutorial targets already named (content-core.js:229-264): nav-today, nav-learn, nav-workbook, nav-track, nav-actions, sos-button (you must emit these); the rest (quicklog-*, planner-*, bp-*, workbook-*, insights-*, review-start, plan-*) belong to screen lanes.
- Owned, all new: offline/build.mjs, offline/src/shell.html, styles.css, ui-core.js, store.js, boot.js, offline/tests/store.test.mjs, package.json (all keys except `scripts` and `devDependencies`, which tests-docs owns; U-01 writes scripts.build and scripts.test with tests-docs' go-ahead, given by the CORE chat). Also allowed: offline/1-addic.html (built output; the HUB's guards step rebuilds it).
- Shared at append points: none for you; others append to build.mjs's parts list and to styles.css end sections.
- Do not touch: engine.js, actions.js, ui-sos.js, ui-onboarding.js (lock screen UI is actions-sos'), other ui-*.js, content-*.js, tests/browser.test.mjs, tests/helpers/*, package-lock.json, docs/offline/, scripts/, docs/PLAN.md, docs/BUILD-GUIDE.md.
- Neighbours: tests-docs (U-34 needs U-01 merged; relies on the DOM ids), actions-sos (Store contract until U-04), learn and SCREENS (UI contract until U-03).

## 3. Units (v1, built and merged)
The v1 unit sections (U-01, U-03, U-02, U-04) are in tracks/CORE/briefs/core/v1-annex.md. V3 units: the V3 section below.

## 4. Decisions that bite
O1 file offline/1-addic.html, title "1-addic", discreet "Notebook". O2 PIN offered, never forced. O3 not yours (leave Content.resources verify flags). O4 speak() uses speechSynthesis only. O5 locale 'en'; no Gujarati. O6, O8 not yours. O7 an unregistered page shows an honest "coming soon" line, never a dead button.

## 5. Open questions (default taken)
1. lane_args.json says batches [[U-01],[U-03,U-04,U-02]]; the CORE chat's word is [[U-01],[U-03,U-02],[U-04]]. Default: the chat's word.
2. DOM ids and shapes beyond 3.2 are fixed in the contract; change them only by outbox.
3. package.json test script: default a portable node one-liner over offline/tests/*.test.mjs minus browser.test.mjs.
4. Parts list pre-names: default every name in territory.json.
5. PLAN.md section 2 orders the lane U-01, U-03, U-02, U-04 too; no conflict.

## 6. Gates and baselines
python C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tools/gates.py --wt C:/Users/ruchi/1-addic-wt/core --lane core build test validate guards (browser or docs where they exist). Baseline (coordination/baselines.md) is empty: green means every test you add passes; validate SKIPs until engine.js exists. Territory: python .../tools/check_territory.py core 655516dc..HEAD --wt C:/Users/ruchi/1-addic-wt/core.
Guards that bite: CSP meta in the built file; no `innerHTML =` with a non-literal; light/dark variable parity; every tutorial target present as a literal data-tour="name" (or 'data-tour': 'name') in shell.html or ui-*.js. Building names like 'nav-' + tab will NOT match: spell out all five.
Go-aheads: none needed.

## 7. Safety and content rules
SOS works offline, is never gated by the lock or interrupted by a tip or tutorial, and its button is one tap from every screen except inside SOS; urgent help (#/sos/urgent) is reachable from the lock screen without the PIN. No network, no trackers, no external URLs; contacts never leave the device. Nothing decreases, no streak resets (discreet mode hides counters). Accessibility: keyboard, labels, visible focus, reduced motion, contrast, 44 px targets. Original text only, person-first, grade 6-8; any crisis string is clinicalReview and shows the numbers first and says little else; unsure, write the shorter version.


## V3 (2026-11-08 02:52 IST, PLAN-V3.md)
Base f69bc68a (build/core fast-forwarded; refuse if not a fast-forward, ask the HUB). Done = U-01, U-03, U-02, U-04 and fix rounds. Flagged: both reviewers on the final READY (contracts and tests; safety copy, privacy and the person's data). Order and batches: [[V-11 SLICE],[V-16, V-17a, V-26a]]. Tier 2 starts only when no tier 1 lane waits for a slot. SLICE: READY-SLICE <tip> on status-CORE.md when V-11 is committed and green by name; the HUB merges; then go on. Hook attribute (R-H-39): status-layer hooks are data-test; ui-sos.js keeps data-testid; read the attribute each file uses. Per-unit notes: briefs/core/<unit>.md.

### V-11 (SLICE, tier 1, 0.5 h, V3-11) static safety line before boot
- Today: offline/src/shell.html:22 `<main id="main" tabindex="-1"></main>` is empty until UI.boot renders (ui-core.js:844 main.replaceChildren(node), inside render at :817). boot.js:28 COPY.none holds the failure words (COPY.clinicalReview true, boot.js:27); numbers() boot.js:10-17 reads Content.resources.in; the built-in number is 112 (content-core.js:421, verify: true).
- Build: inside <main> a static `<p class="boot-line">` with the words "If you are in danger, call your local emergency number." (the tail of boot.js COPY.none) and a link `<a class="sos-target" href="tel:112">112</a>`; an HTML comment: clinicalReview, keep in step with boot.js COPY. styles.css (core's own file) a rule beside .boot-failure (styles.css:227), same tokens, light and dark parity. No script needed. The first render replaces main's children (ui-core.js:844): do not touch render. A start failure: showFailure (boot.js:33-58) replaces main as before. build.mjs inlines shell.html unchanged (:103, :128): no edit, CSP unchanged (no inline handler).
- Accept: built file has the line inside <main> before the first <script data-part; after UI.boot it is gone.
- Tests (store.test.mjs): "shell: safety line static inside main before boot" (src/shell.html, and 1-addic.html if built: between <main and </main>, before the first script, has 112 and the words); "shell: safety line gone after boot" (bootPending harness, store.test.mjs:696-717). Browser no-JS check is tests-docs'.
- Rules: SOS never gated; clinicalReview-marked; no network; nothing decreases; original words, no new number.
- Gates: gates.py --wt C:/Users/ruchi/1-addic-wt/core --lane core build test validate guards (rebuild 1-addic.html; browser where it exists).

### V-16 (tier 2, 1 h, V3-16) LOWs N1, N2, Q-a (contracts/core.md:117-119)
- Today: ui-core.js:370-380 writes role=group on any node without a role and tabindex -1; firstFocusable ui-core.js:397-410 skips a contenteditable.
- Build: N1 role=group only on a plain DIV or SPAN without role. N2 a contenteditable ("" or "true") counts as own control: no tabindex -1, no role=group, firstFocusable returns it. Q-a a native control returned as the field's node (INPUT, SELECT, TEXTAREA, BUTTON, A href) gets aria-labelledby id+'-label' when it has no aria-label/labelledby.
- Tests (store.test.mjs): "field N1: ul keeps implicit role", "field N2: contenteditable keeps tab stop", "field Q-a: bare control is named".

### V-17a (tier 2, 0.5 h, V3-17) Store.status().lockId
- Today: status() store.js:509-514 (persistence, lastSavedAt, hasLock, locked, autoLockMin, unreadable); internal lockId(L) store.js:121 = salt|check, used for equality (:210, :268, :734).
- Build: add `lockId` to status(): '' with no lock, else a short non-reversible digest (FNV-1a hex, sync) of lockId(state.lock); never from the PIN; no salt or sealed check leaves the store. Changes on lock create, remove, replace, including erase then new PIN (new random salt, store.js:667). Other keys unchanged. Consumer: actions-sos V-17b (contracts/actions-sos.md:130).
- Test: "status: lockId changes after erase and new PIN" (same PIN twice, ids differ; two reads equal; id holds neither PIN nor salt).

### V-26a (tier 2, 0.3 h, V3-26) per-part sizes
- Today: build.mjs:141-149 prints the total and part count only; parts list (build.mjs:14-42) unchanged.
- Build: record each part's byte length in the loop (:100-109); print one line per part, shell and css, then the total (unchanged figure). No other change. Accept: `npm run build` lists every built part.

### Reviewer notes
Contracts and tests: lockId shape; the field tests; the shell tests by name. Safety and data: the V-11 words match boot.js, number is the built-in 112 with verify untouched, nothing private in the static line; lockId leaks no salt, check or PIN.

### Open questions (default taken)
1. V-11 wording: the note's sentence without "The app did not start." (the app may be fine), plus the 112 link.
2. lockId: digest of salt|check, '' with no lock.
3. No-JS browser check: tests-docs' choice, not asked.
