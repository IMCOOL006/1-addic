# Contract · lane content (SCREENS) · base 1ef2482e

Classic-script globals; `Content` is one object, later files add keys. base = exists at 1ef2482e; new = this lane adds; waits = another lane.

## Content keys
- `Content.modules` (base, content-lessons-a.js:6; m0-m3). New: m4-m6 (content-lessons-b.js, U-29), m7-m10 (content-lessons-c.js, U-30). Lesson shape 3.6 with `clinicalReview?`, `sensitive?`. Consumers: ui-learn.js, today-track, tests-docs.
- `Content.exercises` (new, U-31a/b): array of `{id,title,book,kind,artifact?,repeat?,skill?,fields,tutorial:{example:{cast,values},hints,built},events}`; field types per ExerciseUI.FIELD_TYPES. `checkpoint` is `{id:'checkpoint', modules:{<moduleId>:[{q,options:[{t,ok,why}]} x2]}}`. Consumers: ui-exercise.js exerciseFor (:338), ui-learn.js checkpointQuestions (:246), workbook-settings (U-20b), game-tutorials.
- `Content.practices` (new, U-32): map `{breathe,'body-scan',sober,'urge-surf',shower,eating,walking,beat}` of `{id,title,minutes,intro,steps|script:[{t,secs?}],close}`; breathe adds `ladder:[5,10,15,20,25,30]`; `practices.sober.steps` has 5 lines (replaces ui-sos.js FALLBACK.sober). Consumers: actions (ui-practices.js), actions-sos.
- `Content.games` (new, U-32): `{sort:[12 {id,thought,trap}], flag:{lines,redFlags:[3]}, bigGame:{scenes:[6 {id,text,choices:[{t,to,note}]}]}, refusal:[4 {id,scene,responses:[3 {t,rating,why}]}]}`. Consumer: game-tutorials (ui-game.js, ui-tools.js).
- `Content.comebacks` (new, U-32): 3 lines. Consumer: actions-sos FALLBACK.talkback.
- `Content.catalogs.spiralPairs` (built U-31a, 065699b): `[{thought, reply}]` x7, no crisis words; `catalogs.spiral` no longer holds "I'm hopeless.". Consumer: actions-sos.
- `Content.resources.opioidSafety` (built U-31a, 065699b; changed 2026-11-07 16:25 IST): an object `{text, verify: true, clinicalReview: true}` (not string[]), so the flags ride on it; read `.text`. Consumer: actions-sos (ui-sos.js). `Content.resources.intl` local-emergency line gains `tel:'112'`, verify:true.
- `Content.copy.early` (new, U-31a): onboarding early-access line. Consumer: actions-sos ui-onboarding.js.
- `Content.sample` (new, U-33): `{name:'Sample', generate(nowIso) -> {stores:{profile,settings,events,logs,responses,contacts,plans,todos,motivation,predictions,quests,...}}}`; rows per 3.4, all `sample:true`, ids `smp-...`, deterministic. Consumers: Actions.loadSample (actions.js:881), workbook-settings (Settings data tab load/erase sample).
- `/* -- additions -- */` marker at the end of content-core.js (new, U-31a): other lanes append after it.

## Relies on (base)
`Content.references` core:381 (R1-R32), `Content.cast` :466, `Content.catalogs` :300, `Content.features` :153, `Content.ranks` :130, `Engine.validateContent(content) -> string[]` engine.js:1439, `Engine.knownRoute(route, content)` engine.js:1477, `Actions.loadSample/eraseSample` actions.js:881/913. Waits: nothing; the Engine U-08 merge only for the gate (Node check meanwhile).

## Events, routes, DOM hooks
None added. Routes in lessons must be in the 3.5 table. No hooks (no UI in this lane).
