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

## V-42 (R-O-6, added 03:11 IST): all new in content-quests.js; none exists at f69bc68a. Consumers: engine V-40, actions-sos V-41, today-track V-43, game-tutorials V-44, tests-docs V-45.
- `Content.questLine: [{id, title, line, condition:{event, count, within?:'day'|'week'}, reward:'<featureId>', opened:'<one line>'}]`, 10 steps in order; reward is in Content.features, distinct, never sos/urgent/help/learn/lessons/settings/export/the person's data.
- `Content.objectives: [{id, title, line, doneBy:{event}|'tap', grows:'lantern'|'tree'|'boat'|'bench'|'flag'|'gull'|'garden'|'bell'}]`, about 20.
- `Content.runWords = {header, current, best, total, kept, keptLine, cameBack, cameBackLine, graceLine}`: strings. PLAN-V3 s7 names no key for the run's words; HUB to record this one.
- `Content.xp.ObjectiveDone`, `Content.xp.QuestLineStepDone`: small positive integers (read by engine.js xpBase :182).
- `Content.features`: new ids trial, should-i-go, problem-solver, distortion-sort, spot-red-flag, big-game, refusal, rewrite, explorer, Harbor scenes and themes, questLine, objectives, run; shape `{name, gist, tab, route?}`.
- JIT tutorials for questLine, objectives, run (targets questline-card, objectives-card, run-line: data-tour, built by today-track V-43) and three Content.help entries.
- Events the conditions use, existing (actions.js:141): LogCreated, SosCompleted, LessonCompleted, CheckinCompleted, SkillUsed, ContactReached, BattlePlanCreated, MindfulMinute, WeeklyReviewCompleted, ExplorerCompleted, ActivityDone, ExerciseDone. Waiting for actions-sos V-41: ObjectiveDone {id, date}, QuestLineStepDone {id}, FeatureUnlocked {feature, by:'questline'}.
- Parts line `'content-quests.js'` after `'content-sample.js'` in build.mjs (core's append point).
