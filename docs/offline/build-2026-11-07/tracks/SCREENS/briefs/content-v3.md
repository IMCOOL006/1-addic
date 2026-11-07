# Brief: lane content, V3 (SCREENS), units V-10, V-23, V-10b
Base f69bc68a (offline-v1.1). Worktree 1-addic-wt/content is fast-forwarded from 680f850 when the slot is granted.

## Goal
1. V-10 (slice, tier 1): add the status feature, its JIT tutorial and its help entry to content-core.js, so today-track's `#/status` page and game-tutorials' V-28 (tour step, "New" dot) have content to read.
2. V-23 (tier 2): close the v1 LOWs C2, C3, C4 (one comment, one assert, one note).
3. V-10b (tier 1, waits on the owner): clear India `verify: true` flags only for numbers the owner confirms (I6). Default: nothing cleared.

## Files
Owned: offline/src/content-core.js, content-sample.js, offline/tests/content.test.mjs; also content-lessons-a/b/c.js, content-exercises.js, content-practices.js (no V3 edit planned; clinical fixes come by name later).
Do not touch: ui-*.js (today-track owns ui-status.js and ui-today.js; game-tutorials owns ui-guidance.js), engine.js (CORE), actions.js, tests/status.test.mjs, helpers/hooks.mjs, browser.test.mjs.

## Shapes at f69bc68a (content-core.js)
- `features` (line 153): `id: { name, gist, tab }`. ui-guidance.js:69-80 `FEATURE_ROUTES` hard-codes a path per feature (paths without '#', e.g. '/track/insights') and also honours an optional `Content.features[id].route` (longest match wins). So the status entry carries `route: '/status'`, which lets V-28 find the screen without editing ui-guidance.js.
- `reveal` (line 178): `{ always:[...], m2:[...], ... m10:[...] }`. `Engine.revealed(view)` (engine.js:589) = always + keys of finished modules + `reveals` rows (+ all with settings.showAll). `Engine.newDots` (engine.js:603) = revealed minus `always` minus seen; a feature in `always` never gets a "New" dot. There is no `m1` key at the base.
- `tutorials` (line 227): JIT = `{ id, name, kind:'jit', feature:'<featureId>', steps:[{ target:'<data-tour value>', text }] }`. Existing JIT ids equal their feature ids.
- `help` (line 280): `{ q, a, route:'#/...' }` (routes carry '#'); the Harbor entry is at line 293.
- content.test.mjs:234 requires every `module.unlocks` id to be a feature id; `Engine.validateContent` (engine.js:1439; test line 128) must stay `[]`.

## V-10 (SLICE; first, merged first)
Today: no status feature, tutorial or help entry; no reveal.m1.
Build in content-core.js:
1. `features.status = { name:'Your Harbor status', gist:<one plain line: what grew in your Harbor from what you did>, tab:'today', route:'/status' }`.
2. `reveal.m1 = ['status']`. Default for "revealed with the Harbor, never later than m1": the Harbor card is on Today from day one, but a feature in `always` can never show a "New" dot, which V-28 needs. If m1 is not a module id at the base, use `always` instead and tell the chat (the dot is then lost). If m1 has an `unlocks` list, add 'status' to it.
3. Tutorial `{ id:'status', name:'Your Harbor status', kind:'jit', feature:'status', steps:[ {target:'status-scene'}, {target:'status-change'}, {target:'status-watch'} ] }`, each with `text`: one or two short sentences, grade 6-8, original words, no promise of outcomes, no streak or count language. Targets are the data-tour values fixed in PLAN-V3 section 3 (`status-open` is the Today chip, used by V-28's tour step, not here).
4. Help entry `{ q:'What is the status page?', a:<2-3 sentences: shows which places in your Harbor grew from what you did, what to watch, a next step; nothing on it goes down; Calm mode hides the scene>, route:'#/status' }`, near line 293.
Acceptance: feature, tutorial and help entry exist and read as text; validateContent `[]`; original words, grade 6-8, no outcome promise.
Tests (content.test.mjs): "content: status feature, tutorial and help entry exist" (feature has name, gist, tab; revealed through reveal.m1 or always; tutorial kind jit, feature 'status', targets in the fixed set, texts non-empty strings without angle brackets; a help entry with route '#/status'); "content: status words promise no outcome" (no /guarantee|will (be|stay)|streak|lose|lost/i). Feeds browser test "status opens from Today in one tap" indirectly.
Rules: nothing decreases (no "lost", "drops" wording), SOS never gated or interrupted, no clinical copy change; no clinicalReview needed (no substance or crisis content).
Closes: V3-28 (content half). READY-SLICE after commit and green by name.

## V-23 (tier 2; after V-10 merged, only when no tier 1 lane waits for a slot)
- C2a: content-sample.js:6 header says "nothing is dated after nowIso", but plans run 1-3 days ahead. Fix the comment only; do not change data.
- C2b/C3: content.test.mjs sample test: add an explicit assert that every sample row and event carries `sample: true` except the meta row `{key:'sample'}`, so erasing the sample leaves nothing behind. `Actions.eraseSample` is absent at the base; do not call it; if it has merged (git grep), assert through it.
- C4: M10 milestone is the base rank id 'guide' (not "Graduate"); one comment at the milestone in content-core.js; no id change.
Acceptance: one comment, one assert, the 'guide' id note; Node tests green by name. Closes V3-23.

## V-10b (waits for the owner's I6 answer in outbox-OWNER.md; never holds the tag)
Today: content-core.js:421-432, India resources, every entry `verify: true` (112, 108, 14416 / 1800-891-4416, 1800-599-0019, 14446, 1860-2662-345 / +91 9999 666 555, 1800-116-117 / 011-2658-9391; three groups with urls).
Build: remove `verify: true` only on entries the owner names as confirmed (quote the answer in the commit body); the rest keep it and `verifyNote` (line 423) stays unless every entry is cleared. Never add or change a number or url without the owner's word. These are clinicalReview passages: do not edit their wording.
Default taken: no I6 answer, nothing cleared, the unit is not started; report "waiting".
Tests: existing R-C-13 assertions stay; add one asserting every entry not on the confirmed list still has verify: true.

## Decisions that bite
O3 India numbers marked "please verify" plus the international list (keep). O5 no Gujarati, locale 'en'. O7 no dead button: help route '#/status' exists once today-track V-01a merges. O1, O2, O4, O6, O8 do not touch this lane.

## Order, go-aheads
V-10, V-23, V-10b (batches [[V-10],[V-23],[V-10b]]). No go-ahead needed for V-10 (content only; route is on the contract). V-10b needs the owner's I6. Clinical-review fixes: not this run.

## Gates
python C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tools/gates.py --wt C:/Users/ruchi/1-addic-wt/content --lane content build test validate guards ; baselines by name in coordination/baselines.md. Territory: check_territory.py content f69bc68a..HEAD --wt C:/Users/ruchi/1-addic-wt/content.

## Open questions (default taken)
1. Is `m1` a module id? Default: reveal.m1; else always.
2. Does ui-guidance want `route` with '#'? Default: '/status' like FEATURE_ROUTES.
3. No I6 answer: nothing cleared.

## Rules in one paragraph
Original words only, never the book's text; person-first, adult-to-adult, grade 6-8; crisis numbers carry verify: true until the owner confirms; crisis passages carry clinicalReview: true and are not reworded before the reviewer answers; nothing decreases; no network, no tracker; SOS never gated or interrupted; unsure, write the shorter version.
