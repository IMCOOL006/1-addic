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

## 3. Units

### U-01 Build pipeline and shell (SLICE, 1.5 h)
Today: no build.mjs, no package.json at the base.
Build:
- offline/build.mjs (Node 22). A `// -- parts --` line, one entry per line, `// -- end parts --`. List EVERY part of 3.1 in 3.1 order: content-core, content-lessons-a, content-lessons-b, content-lessons-c, content-exercises, content-practices, content-sample, engine, store, actions, ui-core, then every ui-*.js of 3.1 and of the SCREENS lanes in territory.json (ui-today, ui-sos, ui-learn, ui-exercise, ui-workbook, ui-track, ui-actions, ui-settings, ui-game, ui-tools, ui-onboarding, ui-harbor, ui-plan, ui-practices, ui-guidance), then boot. An absent file is skipped and the output names it: `skipped (absent): a.js, b.js`. Nothing else in build.mjs is shared.
- Output offline/1-addic.html: `<!doctype html><html lang="en">`; head: meta charset, viewport, the CSP meta EXACTLY as BUILD-PLAN 3.1 (default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; media-src data: blob:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'), color-scheme meta, `<title>1-addic</title>` (O1), a pre-paint theme script (reads localStorage '1-addic:theme' in try/catch, sets data-theme on html, falls back to prefers-color-scheme), `<style>` = styles.css (U-01 ships a minimal valid one; U-02 replaces it). Body = shell.html, then one classic `<script>` per part in order (never type=module; escape a literal `</script` in a part as `<\/script`). Check each part parses (`new vm.Script`); exit non-zero on a read or syntax error. Print: `built offline/1-addic.html <bytes> B (<kB> kB), N parts, skipped (absent): ...`.
- shell.html: markup of contract section A (ids and data-tour spelled out literally). boot.js: calls UI.boot() on DOMContentLoaded; if UI is undefined write a visible one-line message into #main.
- package.json: name "1-addic", private true, engines node ">=22", NO "type":"module", scripts.build "node offline/build.mjs", scripts.test running every offline/tests/*.test.mjs except browser.test.mjs (portable; no shell globs; prove with `npm test`).
Acceptance: `node offline/build.mjs` writes offline/1-addic.html (title 1-addic) that opens with no console error and reports its size. Gate: CSP meta present; `size=<B>` printed.
Tests: none of its own; feeds browser tests "zero console errors", "zero network requests".

### U-03 UI core and router (2.5 h)
Today: nothing. Build ui-core.js per 3.2 UI block exactly, a classic script with a Node-safe guard (DOM use only inside functions).
- h, svg, icon, toast (into #toasts), sheet (on dialog#dialog, showModal, Esc closes, focus returns), confirm, form (all field types of 3.2), card, tile, chips, ring, meter, empty. Text is ALWAYS inserted as text; no innerHTML with data (guard).
- Router: UI.route() parses `#/a/b?x=1` to {path, parts, query}; UI.go sets location.hash; hashchange re-renders so Back works; unknown first segment renders Today; UI.pages[parts[0]] = (ctx) => Node (or Promise<Node>), looked up at render time. An unregistered known page shows UI.empty "coming soon" (O7), never a dead button. Register a Today placeholder only if UI.pages.today is absent at boot: "Today is coming together..." with links to #/learn and #/sos.
- Nav: five tabs with data-tour nav-today, nav-learn, nav-workbook, nav-track, nav-actions (literal strings so the guard regex finds them); aria-current on the active one; SOS button #sos-btn data-tour="sos-button", hidden inside #/sos*, "Help" in discreet mode. Bottom nav on phone, left nav on desktop (CSS).
- Saved label #saved-label from Store.status(): "Saved on this device · <time>", "Saved (fallback)", "Not saved - export before closing"; "Loading" before Store.load; re-renders on Store.subscribe. Discreet: document.title and #app-name become Content.discreetName; counters hidden.
- Theme: applyTheme('light'|'dark'|'system') sets html[data-theme] and stores '1-addic:theme'; night(): Engine.isNight(now) if Engine exists else hour >= 20 or < 6; SOS routes use dark at night unless theme forced light; SOS routes show no tips, tours or dots.
- speak(text): window.speechSynthesis only (O4), feature-detected, returns false if absent; stopSpeaking(). Never fetches audio.
- ctx(): {view, E, A, profile, settings, term, now, features, calm, route}; safe defaults when Store/Engine/Actions are absent (never crash in Node or before merge).
- printDoc, download (Blob URL, revoked), boot() (await Store.load() if present; applyTheme; mount; render; pointer/key events call Store.lock.touch()).
- Lock: if Store.status().locked, route to #/lock (page owned by actions-sos U-11); until that page registers, show a minimal PIN form calling Store.lock.unlock plus "Urgent help" (#/sos/urgent) and "Ride the wave" (#/sos/craving) links that work without the PIN. SOS routes are never gated.
Acceptance: the five tabs navigate by hash and the browser back button works.
Tests: UI.route parse may be a describe block in store.test.mjs only if cheap; otherwise none. Feeds browser: tour complete/skip/replay, SOS button hidden in SOS, 390 px viewport.
Rules: SOS never gated or interrupted; keyboard, labels, visible focus, 44 px targets, reduced motion.

### U-02 Design tokens and components (2 h)
Build styles.css per 3.12: `:root` (light) and `[data-theme="dark"]` (and the same dark set inside `@media (prefers-color-scheme: dark){:root:not([data-theme="light"])}`), identical --variable sets (the guard compares them). HSL triplets: deep teal primary, sand background, terracotta accent, lantern gold; dark = lantern-lit night; red token only for stuck or dangerous. System fonts. Components: topbar, nav (bottom under 720 px, left from 900 px), floating SOS button (56 px), card, tile, chips, ring, meter, empty, form fields, sheet/dialog, toast, coach-mark layer (#coach: overlay, spotlight ring, popover), lesson card, SOS layout (big targets), harbor placeholder, print stylesheet (hides nav, SOS, toasts). 44 px minimum targets, :focus-visible ring, prefers-reduced-motion kills animation, no horizontal scroll at 390 px (min-width:0, wrapping; hiding overflow is not the fix). Calm mode (`body.calm`) hides `.xp,.badge,.harbor`. End with `/* -- end core -- */` and a note that other lanes append `/* -- <lane> -- */` sections after it.
Acceptance: parity guard passes; 390 px layout has no horizontal scroll (scrollWidth <= innerWidth). Tests: guards; feeds browser "dark theme", "390 px viewport". AA contrast in both themes.

### U-04 Store with encryption and lock (3 h, FLAGGED, alone in its batch)
Build store.js per 3.3 and the 3.2 Store block; `const Store = ...` with a Node guard. IndexedDB `1-addic` v1 with ALL Store.STORES created in one upgrade; on failure the localStorage snapshot `1-addic:snapshot`; else memory. In Node (indexedDB undefined) memory mode; crypto via globalThis.crypto. API: load, view{get,list,count}, commit(label, draft) (one transaction; a throw rolls the working set back and rejects; one notification), subscribe, bulk, status, exportJson, replaceAll, resetAll, lock{set,unlock,verify,remove,lockNow,touch,onLock}. navigator.storage.persist() requested on the first write inside try. Crypto: PBKDF2-HMAC-SHA256 310000 iterations, 16-byte salt, AES-GCM-256, 12-byte random iv per row, row = {<keyPath>, enc:{iv,ct}} (base64); meta store plain with the `lock` row {key:'lock', salt, iterations, check, autoLockMin, setAt}; key and plaintext working set in memory only; lockNow drops both. The PIN is never stored or logged. No plaintext of an encrypted row reaches IndexedDB or the snapshot (the snapshot is encrypted when a key is set). A wrong PIN returns false and changes nothing; in the browser add a small delay per failed attempt (250 ms times attempts, cap 2 s). Auto-lock 1/5/15/never, default 5. exportJson returns decrypted rows {app:'1-addic', schemaVersion:1, exportedAt, stores}; the caller (settings) asks for the PIN via Store.lock.verify first. A PIN is offered, never forced (O2): Store works with no lock. While locked, reads are empty and commit rejects with code 'LOCKED'.
Acceptance: data survives a reload in Chrome and is unreadable in DevTools (rows show only iv and ct) when a PIN is set.
Tests (offline/tests/store.test.mjs, node:test, loads ../src/store.js by path, memory mode): round-trip commit/get/list/count; rollback on a throw; notified once per commit and once per bulk; crypto round-trip (set PIN, lockNow, list empty, unlock restores); wrong PIN refused for unlock, verify and remove; labels per mode ('memory', and 'indexeddb' / 'localstorage' with fake indexedDB and localStorage defined INSIDE the test file); snapshot adoption; exportJson shape, replaceAll, resetAll; encrypted rows contain no plaintext marker. Stand-ins stay in this file, never in offline/tests/helpers/. Feeds browser: PIN set/lock/unlock/export; export, erase, import.
Rules: the person's data; nothing leaves the device (no fetch); copy says plainly that a forgotten PIN means erase and restore from a backup.

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
