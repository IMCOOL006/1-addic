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

## V-42 (tier 1, R-O-6; batch 2, right after V-10; ahead of V-23 and V-10b). Added 03:11 IST
Goal: the words and data of the quest-line "Your way", the daily objectives and the run, in a new file offline/src/content-quests.js (content's).
Today at f69bc68a: no Content.questLine, objectives or run words. Content.xp is content-core.js:113-122 (numbers by event type; settings keys mindfulDailyCap, repeatFull, repeatHalf, onceOnly), read only by engine.js xpBase (:182) and xpFromEvents (:195). build.mjs parts list is lines 14-42; content files at 16-22, engine.js at 23.
Build:
1. build.mjs (CORE file, append point): one line `'content-quests.js',` after `'content-sample.js',` (before `'engine.js',`); the one allowed parts line, nothing else there.
2. content-quests.js, header comment like content-practices.js:1-12; first line `const C_q = (typeof Content !== 'undefined') ? Content : require('./content-core.js');` then plain assignment `C_q.questLine = [...]; C_q.objectives = [...]; C_q.runWords = {...};`, `Object.assign(C_q.features, {...})`, `Object.assign(C_q.xp, {ObjectiveDone: 3, QuestLineStepDone: 10})`, `C_q.tutorials.push(...)`, `C_q.help.push(...)`. Export as content-practices.js does. XP small and fixed, never for a sober day; engine/chat numbers win if set.
3. Content.questLine: 10 steps in order, each `{id, title, line, condition:{event, count, within?}, reward, opened}`. Events must be real (actions.js:141 EVENT_TYPES). Spine, for example: LogCreated x1; SosCompleted x1 (the drill); LessonCompleted x1 (M0); CheckinCompleted x3; SkillUsed x3; ContactReached x1; BattlePlanCreated x1; MindfulMinute x5; WeeklyReviewCompleted x1; ExplorerCompleted x1. `within` only 'day' or 'week'. One distinct reward each, from the unlockable set: tools and mini-games (trial, should-i-go, problem-solver, distortion-sort, spot-red-flag, big-game, refusal, rewrite: ui-tools.js:65-76), game-surface extras, Harbor scenes and themes, the Explorer. Never sos, urgent, help, learn, lessons, settings, export or the person's data.
4. Content.objectives: about 20, `{id, title, line, doneBy:{event}|'tap', grows}`; grows from: lantern, tree, boat, bench, flag, gull, garden, bell. About 8 by event (LogCreated, CheckinCompleted, SkillUsed, LessonCompleted, ActivityDone, MindfulMinute, ExerciseDone, ContactReached), about 12 by 'tap' (a glass of water, a short walk, a message to someone, tidy one corner, one slow breath). None names a substance, a craving or sober days.
5. Content.runWords = {header:'Days shown up', current, best, total, kept:'Kept', keptLine, cameBack:'You came back.', cameBackLine, graceLine}: warm, short. Never "streak", "lost", "broken", "reset", "failed", a countdown or hours-left line. Nothing counts sober days.
6. Content.features entries (`{name, gist, tab, route?}`, content-core.js:153) for the unlockables missing: the 8 tool and game ids, `explorer`, new Harbor ids (e.g. sceneDusk, sceneRain, themeSage, themeSand), and `questLine`, `objectives`, `run` (tab 'today'). At the base none of the tools or games is in Content.features or reveal (ui-tools.js alone lists them), so Engine.unlocked would hide them: default list the tools in reveal.m5 and the games in reveal.m6 so the quest-line only opens them early; confirm content.test.mjs:234 (every module.unlocks id is a feature id) stays green; ask the chat if the owner wants them locked until rewarded.
7. JIT tutorials (V-10's shape) for questLine, objectives, run; targets questline-card, objectives-card, run-line (data-tour, built by today-track V-43); three help entries `{q, a, route}` with routes that exist ('#/today', '#/status').
8. validateContent (engine.js:1439; route and "addict" noun rules walk all of Content) stays []. The new checks of questLine and objectives (ids, order, reward exists and unprotected, event real) are engine V-40's to write; content.test.mjs carries the same checks locally.
Acceptance (PLAN-V3 s7): 8-12 steps; about 20 objectives; run words; xp rows; tutorials and help; validateContent green; content.test.mjs checks shapes and the protected set.
Tests (content.test.mjs): "content: quest-line shape and order"; "content: quest-line rewards are unlockable, never protected"; "content: objectives pool shape" (18-24, unique ids, doneBy tap or real event, grows in list); "content: run words and xp rows" (positive integers; no /streak|lost|broken|reset|fail|sober day/i; no angle brackets); "content: new tutorials and help exist".
Rules that bite: nothing decreases; no random reward; no points for claimed sober days; no shame line; SOS, help, lessons, Settings, export, the person's data never a reward; original words, grade 6-8, no outcome promise; no clinicalReview needed.
Depends: V-10 first (same file). Waits for V-40 (reads these shapes), today-track V-43 (targets and routes; unmatched targets are skipped). V-40 tests, V-41, V-43, V-44 wait for this. Open: V-Q10 default above; V-Q9, V-Q11 to V-Q13 apply at 04:00.
