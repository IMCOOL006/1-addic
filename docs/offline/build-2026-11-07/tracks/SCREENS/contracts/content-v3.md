# Contract: lane content, V3
Hook attribute: `data-test` for every new SCREENS hook (PLAN-V3 section 3; ui-today.js, ui-track.js, ui-game.js, ui-guidance.js use it); `data-tour` for tour targets. helpers/hooks.mjs tid() builds [data-testid] for the CORE lanes' hooks only. tests-docs (V-03, V-01t) writes the status hooks as [data-test=...]. This lane adds no DOM hook.

## Content keys this lane adds (V-10; consumers read by key)
- `Content.features.status = { name, gist, tab:'today', route:'/status' }`. Shape of features: content-core.js:153 at f69bc68a; optional `route` read by ui-guidance.js:69-80. Consumers: game-tutorials V-28 (GuidanceUI.dot "New", tour step), today-track (name/gist if wanted).
- `Content.reveal.m1 = ['status']` (reveal at content-core.js:178; read by Engine.revealed engine.js:589 and newDots engine.js:603). Fallback `reveal.always` if m1 is not usable. `Engine.isRevealed(view,'status')` is true after module m1.
- Tutorial `{ id:'status', kind:'jit', feature:'status', steps:[{target,text}] }`, targets `status-scene`, `status-change`, `status-watch` (data-tour values, PLAN-V3 section 3, built by today-track on #/status). Consumers: game-tutorials (ui-guidance.js reads Content.tutorials), tests-docs.
- Help entry `{ q, a, route:'#/status' }` in Content.help. Consumer: Settings help list (workbook-settings, reads Content.help unchanged).

## At the base / waiting
Exist at f69bc68a: the features, reveal, tutorials and help shapes (content-core.js:153, 178, 227, 280). Waiting for today-track (V-01a/V-01b): the route #/status and the data-tour targets; until then the tutorial targets are unmatched, which Guidance skips as for any feature without its screen.

## V-10b, V-23
V-10b: no new key. `Content.resources.in` entries (content-core.js:421-432) lose `verify` only per the owner's I6 answer; shape unchanged; consumers ui-sos.js and ui-core.js read only. V-23: no public change (a comment, a test assert).
