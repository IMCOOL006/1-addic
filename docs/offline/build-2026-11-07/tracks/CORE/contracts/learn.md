# Contract · lane learn (CORE) · base 655516dc

Classic-script globals. "base" = exists at C:/Users/ruchi/1-addic-wt/_base; "waits" = another lane.

## Exposes (all new; consumers named)
**Routes (UI.pages, registered from own files)**
- `UI.pages.learn` (ui-learn.js): `#/learn` map, `#/learn/plan`, `#/learn/glossary`, `#/learn/<moduleId>` (`?checkpoint=1`). Consumers: Learn tab (core), Today (today-track).
- `UI.pages.lesson`: `#/lesson/<lessonId>`. Consumer: Today "continue learning".
- `UI.pages.exercise` (ui-exercise.js): `#/exercise/<id>?mode=tutorial|workbook&from=<lessonId>`. Consumers: lessons (own), workbook-settings U-20b (mode=workbook).
- `UI.pages.dev`: `#/dev/fields` only. Consumer: tests-docs browser.

**ExerciseUI** (ui-exercise.js; pure ones in module.exports)
- `FIELD_TYPES: string[19]`; `SAMPLE_SPEC` (3.8 exercise shape, one field per type).
- `defaultValue(field)`; `toPayload(spec, values) -> object keyed by field id` (check -> string[]; check2 -> {optionId:{done,often}}; single -> string; list -> string[]; matrix2x2 -> {q1..q4:string[]}; pair -> [{left,right}]; rows -> object[]; template -> {blankId:string}; bodymap -> regionId[]; percent, number, slider, rating -> number; yesno -> boolean|null; topN -> [{item,plan}]; contactPicker -> contactId|null; date -> 'YYYY-MM-DD'; text, textarea -> string); `fromPayload(spec, payload)` is the exact inverse.
- `validate(spec, values, {draft}) -> {ok, errors:{fieldId:msg}}`; `optionsFor(field, view)`; `resume(responses, exerciseId) -> {draft, final}` (draft only if newer than the newest non-draft).
- `render(spec, {mode, values, onSave(payload,{draft}), view}) -> Node`, `open(exerciseId, {mode, from}) -> Node` (DOM only).
- Writes: `Actions.saveResponse(exerciseId, payload, {mode, draft})` only; row shape 3.4 `responses`.

**LearnUI** (ui-learn.js)
- `lessonSteps(lesson) -> [{kind:'moment'|'card'|'check'|'tryit'|'wrap', i}]`; `checkResult(check, optionIndex) -> {why, ok}` (never a failure state); `moduleProgress(module, events) -> {done,total,complete,checkpointDone}`; `planWeeks(profile, modulesDoneSet, now) -> {free, weeks:[{start, moduleIds[], state:'done'|'current'|'open'|'upcoming'}], current, next}` (no overdue state exists); `needsWelcomeBack(profile, events, now) -> bool`; `glossaryFilter(list, q)`; `focusData(view, now) -> {moduleId, lessonsLeft, minutes, practiceGoal}|null`; `focusCard(ctx) -> Node` (consumer: today-track U-15, waits for U-14 to merge; Today uses a placeholder card until then).
- Writes: `A.completeLesson(id)`, `A.checkpoint(moduleId, answers)` with `answers:[{q, optionIndex}]`, `A.todos.add({text, source:'lesson:<id>', route?})`, `A.onboard({pace, customPerWeek, roadmapStart})` (default; open question).
- Events caused (emitted by Actions, not by learn): `LessonCompleted{lessonId}`, `CheckpointCompleted{moduleId}`, `ModuleCompleted{moduleId}`, `ArtifactSaved` or `ExerciseDone` `{exerciseId}`.

**Hooks for tests-docs** (`data-tour`): `learn-map`, `learn-plan`, `learn-glossary`, `lesson-next`, `lesson-wrap`, `exercise-save`, `exercise-later`. (`data-test`): `fld-<fieldId>`, `fld-type-<type>` (gallery), `payload` (gallery JSON text), `exercise-draft-note`, `exercise-fresh`, `lesson-step`, `check-opt-<i>`, `check-why`, `lesson-finish`, `plan-week-<n>`, `stop-<moduleId>`, `welcome-back`, `glossary-search`, `focus-card`. Consumer: tests-docs U-34 (none yet).

## Relies on
- At base: `Content.modules` (content-lessons-a.js:7-250), `Content.paces` (content-core.js:47), `Content.references` (:381, `{id, claim, cite, type, usedBy}`), `Content.catalogs` (:300), `Content.reveal` (:179), `Content.features` (:153), `Content.cast` (:466), `Content.glossary` (:474), `Content.skills` (:66), `Content.discreetName` (:12).
- Waits content U-31a: `Content.exercises` (array, 3.8, incl. `checkpoint`); content U-29/U-30: M4-M10.
- Waits core U-03: `UI.h, sheet, toast, go, route, pages, ctx, speak`. Core U-01: build.mjs parts list.
- Waits engine U-05/U-06: `Engine.lessonsDone, modulesDone, roadmap, nextLesson, latest, history, crisisKeywords` (local fallbacks meanwhile).
- Waits actions-sos U-09: `Actions.completeLesson, checkpoint, saveResponse, todos.add, onboard`.
