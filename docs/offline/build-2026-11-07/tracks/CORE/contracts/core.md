# Contract: lane core (exposed shapes)
Status key: BASE = exists at 655516dc; U-xx = arrives with that unit; WAIT = another lane. Nothing here exists at the base except Content.discreetName (_base/offline/src/content-core.js:12) and the tutorial target names (content-core.js:229-264). Consumers: all UI lanes, tests-docs, actions-sos, engine (isNight).

## A. DOM hooks (U-01 shell.html; U-03 fills). Consumers: tests-docs, game-tutorials, all UI lanes
- `#app` root; `header#topbar` with `#app-name` ("1-addic", or Notebook when discreet), `#saved-label` (aria-live polite), `#theme-btn`, `#settings-btn` (href #/settings).
- `main#main` (tabindex -1; pages mount here; focus moves here on route change).
- `nav#nav` with five anchors `data-tour="nav-today"`, `nav-learn`, `nav-workbook`, `nav-track`, `nav-actions`, each with `data-route`, aria-current="page" on the active one.
- `a#sos-btn[data-tour="sos-button"]` href #/sos (label SOS; Help in discreet; hidden inside #/sos*).
- `dialog#dialog` (UI.sheet, UI.confirm), `#toasts` (aria-live polite), `#coach` (coach-mark layer, empty and hidden; game-tutorials fills it), `#print-root`.
- html/body: `data-theme="light|dark"` on html, `class="calm"` on body in Calm mode, `data-discreet` on html when discreet.

## B. UI (ui-core.js, U-03; BUILD-PLAN 3.2 exactly). Consumers: every ui-*.js
- `UI.h(tag, attrs, ...children)` attrs: class, text, dataset, style{}, on<Event>, aria-*, data-*; text always as text. `UI.svg(tag, attrs, ...children)`, `UI.icon(name, size)`, `UI.toast(msg, tone)` tone 'info'|'ok'|'warn', `UI.sheet(title, body, opts) -> {el, close}`, `UI.confirm({title, message, confirmLabel, danger}) -> Promise<boolean>`.
- `UI.form(spec) -> {el, values(), set(name,val), validate()}`; spec = {fields:[{name, type, label, hint?, options?, min?, max?, labels?, required?, render?}], submitLabel?, onSubmit?}; types text, textarea, number, date, time, select, radio, checkbox, chips, slider, hidden, custom(render).
- `UI.card(title, body, opts)`, `UI.tile(label, value, sub)`, `UI.chips(options, selected, onChange, {multi})`, `UI.ring(pct, label)`, `UI.meter(value, max)`, `UI.empty(text, action)`.
- Routing: `UI.go(route)`, `UI.route() -> {path, parts[], query{}}`, `UI.render()`, `UI.pages[firstSegment] = (ctx) => Node | Promise<Node>`. Looked up at render time, so file order does not matter. Unknown first segment renders Today.
- `UI.ctx() -> {view, E, A, profile, settings, term, now, features, calm, route}` with safe defaults when a namespace is absent.
- `UI.applyTheme(theme)`, `UI.night() -> boolean`, `UI.speak(text) -> boolean` (speechSynthesis only), `UI.stopSpeaking()`, `UI.printDoc(node)`, `UI.download(filename, text, mime)`, `UI.boot()`.
- Events on document: CustomEvent `ui:route` (detail = parsed route) after each render, and `ui:rendered`. Store changes re-render the current page (debounced one frame).
- Page keys other lanes register (first segment of 3.5): today, learn, lesson, workbook, exercise, track, actions, practice, tools, games, sos, settings, onboarding, lock, dev. U-03 registers only a Today placeholder and shows an honest "coming soon" for unregistered pages. Consumers: today-track (today, track), learn (learn, lesson, exercise, dev), workbook-settings (workbook, settings), actions (actions, practice), game-tutorials (games, tools), actions-sos (sos, onboarding, lock).

## C. Routes (BUILD-PLAN 3.5). Owner of the router: ui-core; pages by lane
All hash routes of 3.5. SOS routes use the dark palette 20:00-06:00 unless theme is forced light, show no tips, tours or dots, and hide #sos-btn.

## D. data-tour names emitted by the shell and ui-core
nav-today, nav-learn, nav-workbook, nav-track, nav-actions, sos-button. Emitted by screen lanes (not core): quicklog-button, quicklog-intensity, quicklog-save, planner-day, planner-gaps, planner-add, bp-new, bp-form, workbook-groups, workbook-card, insights-triggers, insights-heatmap, review-start, plan-sections, plan-print. Consumer: game-tutorials, the tour-target guard.

## E. Store (store.js, U-04; 3.2 and 3.3). Consumers: actions-sos (actions.js, WAIT U-09; lock UI), engine views, settings, tests-docs
- `await Store.load()`; `Store.view = {get(store, id), list(store), count(store)}`; `await Store.commit(label, draft => {...})` with draft {get, list, put(store,row), del(store,id)}; `Store.subscribe(fn) -> unsubscribe`; `Store.bulk(fn)` (one notification).
- `Store.status() -> {persistence:'indexeddb'|'localstorage'|'memory', lastSavedAt: ISO|null, hasLock, locked}`; `Store.exportJson() -> {app:'1-addic', schemaVersion:1, exportedAt, stores}`; `Store.replaceAll(obj)`; `Store.resetAll()`.
- `Store.STORES = {profile:'key', settings:'key', meta:'key', events:'id', logs:'id', responses:'id', contacts:'id', plans:'id', todos:'id', motivation:'id', predictions:'id', quests:'id', tutorials:'id', reveals:'id', tips:'id', recoveryPlan:'key'}`.
- `Store.lock.set(pin, {autoLockMin}) -> Promise<void>`; `unlock(pin) -> Promise<boolean>`; `verify(pin) -> Promise<boolean>`; `remove(pin) -> Promise<boolean>`; `lockNow()`; `touch()`; `onLock(fn)` (fires on manual and auto lock so ui-core routes to #/lock).
- While locked, reads are empty and commit rejects with an error whose `code` is 'LOCKED'. Meta lock row is plain: {key:'lock', salt, iterations:310000, check, autoLockMin, setAt}. Node: memory mode, no DOM. Rows of 3.4.

## F. Build (U-01). Consumers: tests-docs, HUB gates, every lane that adds a file
`node offline/build.mjs` writes offline/1-addic.html; prints `built offline/1-addic.html <bytes> B ...` and `skipped (absent): ...`. Parts list between `// -- parts --` and `// -- end parts --`, one name per line. `npm run build`; `npm test` runs every offline/tests/*.test.mjs except browser.test.mjs.

## G. Look (styles.css, U-02; 3.12). Consumers: all UI lanes
Variables (HSL triplets, used as hsl(var(--x))), identical in light and dark: --bg --surface --surface-2 --text --muted --primary --primary-text --accent --gold --danger --border --focus --radius --space-1 to --space-6. Classes: .card .tile .chip(.on) .btn(.primary .ghost .danger) .field .sheet .toast .ring .meter .empty .row .stack .grid .sr-only .calm. Lanes append `/* -- <lane> -- */` after `/* -- end core -- */`; tokens are never redefined.

## Additions from core's second slice (U-03, U-02 at 4a43190), written in by the CORE chat 2026-11-07 08:16 IST (nothing removed)

- **UI:** `UI.go(route, {replace:true})`, `UI.parse(hash)`, `UI.savedText(status, loaded)`, `UI.night(now?)`. `UI.form().validate()` returns a boolean, marks the failing fields and focuses the first one. `UI.sheet(title, body, opts) -> {el, close}` and `UI.confirm(opts) -> Promise<boolean>`; onClose reasons 'replaced', 'dismissed', 'confirmed', 'cancelled', 'locked', 'closed'. `UI.speak()` returns false when the device has no local voice (a network voice would send text off the device): show 'Read-aloud is not available on this device'.
- **Events:** `ui:route` after the first render and each navigation render; `ui:rendered` after every render with detail `{route, page, reason:'route'|'store'}`. Store-triggered re-renders skip the SOS and lock routes and wait while focus is in a field of #main.
- **On <html>:** `data-route=<page key>`, `data-counters="off"` (hides .counter), `data-text-size` ('large'|'larger'), `data-motion="reduce"`. New token `--shadow`. Classes for coach marks (.coach-overlay, .coach-ring, .coach-pop, .coach-actions), lessons, SOS and lock: C:/Users/ruchi/1-addic-wt/_logs/reports/core/core__units.md.
- **Lock (actions-sos):** while `Store.status().locked`, every non-SOS route goes to #/lock, also on `Store.lock.onLock` except inside SOS. The lock page calls `UI.go('#/today', {replace:true})` after a successful unlock. The SOS page subscribes to the Store itself for live data (ui-core never re-renders SOS on a store change). Until `UI.pages.sos` registers (or if it throws or returns a non-Node), ui-core shows the urgent numbers from `Content.resources.in`.
- **Theme (workbook-settings):** call `UI.applyTheme('light'|'dark'|'system')`; the theme of record is localStorage '1-addic:theme' (ui-core does not read settings.theme). ui-core reads settings.discreet, calm, counters, textSize and reducedMotion on each render and store change.
- **Coach marks (game-tutorials):** the SOS button is at z-index 60 above #coach at 50; popovers never cover it. On SOS routes ui-core empties and hides #coach and CSS hides .tip, .dot and coach marks.
- **Coming in core's U-04 run (the chat's ruling 2026-11-07 08:16 IST):** an open sheet closes whenever the route changes, and every sheet's header carries its own SOS link (one tap to SOS from anywhere, even with a modal open).

## Rule added by the CORE chat 2026-11-07 08:46 IST (from actions-sos' check C2 at 1cb96a3)

- `Store.replaceAll(obj)` (import) keeps the live `meta` 'lock' row of this device: an import never removes, replaces or changes the PIN; `Actions.importBackup` already drops any 'lock' row from the backup before calling it. A test in store.test.mjs proves it (import with a lock set: still locked with the same PIN after).

## Additions from core's U-04 run (store.js at build/core 06cdf34, not merged yet), written in by the CORE chat 2026-11-07 09:12 IST (nothing removed)

- **UI (every screen lane):** a new `UI.sheet` onClose reason `'route'`: it fires when the route changes (F1) and when the sheet's own SOS link is tapped (F2); a pending `UI.confirm` then answers false. Every sheet header carries `a.sheet-sos` to #/sos, labelled 'SOS' ('Help' in discreet mode), at least 44 px.
- **Store (contract E; consumers actions-sos, workbook-settings, engine views, tests-docs):** `commit` resolves with the rule's return value; a rule that stages nothing writes nothing and notifies no one; draft rows are copies, view rows are the working set and read-only. Subscribers receive `{label}`; `onLock` listeners receive `{reason:'manual'|'auto'}`; both return an unsubscribe.
- **Error codes:** LOCKED, WRITE_FAILED (the device refused a save: the commit rejects and nothing changes; no silent switch to memory), BAD_PIN (fewer than 4 or more than 64 characters), NO_CRYPTO (no crypto.subtle: the lock UI says a PIN is not available on this device), UNKNOWN_STORE, BAD_ROW (ids are non-empty strings), RESERVED (meta 'lock'), BAD_BACKUP.
- **Lock:** `autoLockMin` takes 1, 5 or 15; 0, null or 'never' mean never; anything else means 5. `lock.set` while unlocked changes the PIN. `unlock`, `verify` and `remove` return false when no lock exists; `verify` never unlocks; `remove` also works while locked. The lock row never appears in `view`, `exportJson` or `replaceAll`; `replaceAll` keeps the current lock and seals the new rows under it. Other meta rows stay plain: no lane puts personal text in meta.
- **Forgot PIN (actions-sos, workbook-settings):** `Store.resetAll()` then an import from a backup, said plainly. An export calls `Store.lock.verify(pin)` first when `status().hasLock`.
- **Fallback snapshot:** when IndexedDB holds rows and a stale localStorage snapshot from a fallback session also exists, the snapshot is left untouched (only an empty IndexedDB adopts it); `resetAll` removes it.
- **Discreet mode while locked (the chat's ruling on check C5, building now in core's run wf_6b7ddbb3-2a7):** the flag of record for the locked chrome is the plain device flag localStorage `'1-addic:discreet'` ('1' on, absent off), like `'1-addic:theme'`. `UI.applyDiscreet(on)` sets or removes it and re-renders the chrome; workbook-settings calls it when the person changes discreet mode (and keeps `settings.discreet` too). An unlocked render syncs the flag from `settings.discreet` when they differ; while locked, the title and #app-name read 'Notebook' and the SOS labels 'Help'. `Store.resetAll` removes the flag.
- **Tests:** store.test.mjs runs about 30 s (PBKDF2 310,000 iterations, about 0.9 s per derivation). A headless browser proof never uses --virtual-time-budget (it fires the IndexedDB open timeout, OPEN_TIMEOUT 10 s, before crypto finishes). The run in Chrome itself (PIN set, lock, unlock, export) is owed by the tests-docs browser suite.
- **Discreet, as built (core 98f872d):** `UI.applyDiscreet(on) -> boolean` sets or removes the flag and repaints the chrome at once (title, #app-name, #sos-btn, a.sheet-sos). settings 'app'.discreet stays the record while unlocked: an unlocked, loaded render keeps the flag equal to it, so the settings page commits settings 'app' {discreet} AND calls UI.applyDiscreet(on). `Store.resetAll` (also the Forgot-PIN path) removes '1-addic:discreet' and leaves '1-addic:theme' (a device choice, not data).
