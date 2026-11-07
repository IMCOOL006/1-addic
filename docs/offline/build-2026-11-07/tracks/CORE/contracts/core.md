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
