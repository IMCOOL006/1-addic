# Brief · lane learn (chat CORE) · U-12 (slice), U-13, U-14 · base 655516dc

## What the lane is for
The exercise engine, the lesson player and checkpoint, the roadmap (map, plan) and the glossary. Together they let a person learn M0-M3 and save what they build. Tier 1, not flagged. Pages register from your own files (`UI.pages[...]`); you write no lesson text (content is SCREENS'); you write to the store only through `Actions`.

## Files
- Owned, new: `offline/src/ui-exercise.js`, `offline/src/ui-learn.js`, `offline/tests/learn.test.mjs` (territory.json "learn").
- Shared at append points: `offline/build.mjs` parts list (one line each, 3.1 order, between ui-core and boot; if build.mjs is not on the trunk yet, ask by outbox, do not create it); `offline/src/styles.css`, one section at the end under `/* -- learn -- */` (tokens never redefined; classes prefixed `lx-` and `ln-`; existing token variables only).
- Do not touch: `ui-core.js`, `shell.html`, `store.js`, `engine.js`, `actions.js`, `content-*.js`, other `ui-*.js`, `browser.test.mjs`, docs/offline/. A need there goes in your note's `for_the_chat`. Neighbours: core (ui-core U-03), engine (U-05/06), actions-sos (U-09), content (U-31a exercises), today-track (embeds your `focusCard`), workbook-settings (opens `#/exercise/<id>?mode=workbook`).
- Base: `offline/src` holds only `content-core.js` and `content-lessons-a.js`; no build.mjs, no tests, no package.json. Both ui files are classic scripts; end each with `if (typeof module!=='undefined'&&module.exports) module.exports = {...}` (pure functions only; DOM code runs only when `typeof document!=='undefined'`). Use a tiny local `h()` fallback when `UI` is undefined; switch to `UI.h` when core merges. Text is always inserted as text (no `innerHTML =`).

## Contracts to build on (BUILD-PLAN)
3.2 (UI, Actions, Engine names), 3.4 (`responses`, profile `pace/customPerWeek/roadmapStart`), 3.5 routes, 3.6 lesson/module shape, 3.7 events (`LessonCompleted` 10 XP once, `ModuleCompleted` 0, `CheckpointCompleted` 10 once, `ArtifactSaved`, `ExerciseDone`), 3.8 field types. Shapes you expose: tracks/CORE/contracts/learn.md.

## U-12 (slice) Exercise engine, 3.5 h, `ui-exercise.js`
- Today: nothing. Build `ExerciseUI`: a renderer per 3.8 field type (check, check2, single, slider, text, textarea, list, matrix2x2, pair, rows, template, bodymap, date, number, yesno, percent, contactPicker, rating, topN = 19). Options from `field.options`, or `from:'catalogs.x'` (path into Content, e.g. `catalogs.redFlags`), `'triggers'` (flatten `Content.catalogs.triggers` groups), `'contacts'` (`view.list('contacts')` filtered by role).
- Modes: `tutorial` (example from `exercise.tutorial.example` first, with the cast name; per-field hint under the label; `tutorial.built` on save) and `workbook` (no example, hints behind a "?" toggle, last response prefilled; `repeat` exercises start empty and list history). Route `#/exercise/<id>?mode=&from=<lessonId>`; after save go to `from` (`#/lesson/<id>`) else `#/workbook`.
- Save: `A.saveResponse(id, payload, {mode, draft:false})` (Actions picks ArtifactSaved or ExerciseDone by kind; you write no events). "Finish later" saves `{draft:true}`; reopening resumes the newest draft newer than the newest final, with "Draft from <date>" and a "Start fresh" button. Required fields block a final save with a plain inline message; `optional:true` do not; drafts never validate.
- `#/dev/fields` (`UI.pages.dev`, only `parts[1]==='fields'`): renders `SAMPLE_SPEC` (in file, one field of every type), Save and Finish later, payload printed as JSON text. Works with no `Content.exercises`. Real exercises read from `Content.exercises` (array, lookup by id) when present; unknown id shows "not available yet" with a back link (O7, never a dead button).
- Safety: `sensitive` exercises (`risk-factors`) show "You can skip this" first. For text/textarea call `Engine.crisisKeywords(text)` if Engine exists; when true show the urgent-help line linking `#/sos/urgent` and nothing else; never block saving.
- Accessible: labelled controls, keyboard, visible focus, 44 px targets (bodymap regions are buttons).
- Acceptance: every field type renders in #/dev/fields, saves, and resumes a draft.
- Tests (Node, no DOM): `learn: default value per field type`, `learn: payload round trip per type`, `learn: required vs optional validation`, `learn: draft is not validated`, `learn: resume picks newest draft only if newer than final`, `learn: options from catalogs path and triggers`, `learn: topN limited to checked items`, `learn: SAMPLE_SPEC covers all 19 types`. Feeds browser test "a lesson -> artifact -> shown in SOS".
- Rules: responses are append-only (never edit a row); no new failure by name.

## U-13 Lesson player and checkpoint, 2.5 h, `ui-learn.js` (after go-ahead 1 for the browser flow)
- Today: `Content.modules[].lessons[]` in content-lessons-a.js (M0-M3, 16 lessons; module at :7, `tryIt.route` :22, `tryIt.exercise` :36, `tryIt:null` :70). `tryIt` is `{exercise}`, `{route,label}` or null; `wrap.todo` is string or null.
- Build `#/lesson/<id>`: stepper moment -> cards (one per screen, Next/Back) -> checks -> try it -> wrap. Checks have no fail state: any choice shows that option's `why`, the `ok` option is marked softly as "the helpful reading"; no score, no red, Continue always enabled. Try it: exercise -> `#/exercise/<id>?mode=tutorial&from=<lesson>`; route -> a button with its label; null -> skipped; `sensitive` lessons offer Skip. Wrap: built/lives/action; if `todo`, an optional "Add to my to-dos" (`A.todos.add`); "Why this works" opens a sheet listing `lesson.refs` from `Content.references` (claim, cite, link marked "needs internet"). Finish calls `A.completeLesson(id)` once (skip if already in lessonsDone). The last lesson of a module links to the checkpoint.
- Checkpoint `#/learn/<moduleId>?checkpoint=1`: two questions (exercise `checkpoint` if in `Content.exercises`, else generated from the module's first two checks); no pass mark; `A.checkpoint(moduleId, answers)` once (Actions emits CheckpointCompleted, and ModuleCompleted when all lessons are done). The module page lists lessons with done ticks.
- Read aloud: "Listen" per card via `UI.speak(text)` only (O4).
- Acceptance: M0 plays end to end and writes LessonCompleted, then ModuleCompleted after the last lesson and checkpoint.
- Tests: `learn: lesson step sequence`, `learn: check never fails`, `learn: tryIt kinds`, `learn: checkpoint answers shape`, and a loop over `Content.modules` asserting every lesson yields at least 4 steps. Feeds browser test "learn a module".
- Rules: no streak or points for claimed days; XP text hidden when `ctx.calm`; never inside SOS.

## U-14 Roadmap and glossary, 2.5 h, `ui-learn.js` (after go-ahead 1)
- Today: `Content.paces` (content-core.js:47: gentle 0.5, steady 1, focused 2, custom null, free 0), `Content.modules` (4 at base), `Content.reveal` (:179), `Content.features` (:153), `Content.glossary` (:474, `{term, def}`), `Content.skills` (:66).
- Build `#/learn` map: eleven stops M0-M10 as a harbor path (inline SVG with a text list alternative); each stop shows name, `harbor`, lessons done/total, skills practised, unlocks (`module.unlocks` -> `Content.features` names); the current stop is highlighted; no stop is locked ("start anywhere"); modules not yet loaded show "coming". `#/learn/plan`: weeks by pace via `Engine.roadmap(profile, modulesDone, now)` when present, else local pure `planWeeks`; Custom reads `profile.customPerWeek`; Free shows order only, no dates. A week passed unfinished reads "Still open", never overdue, late, behind or missed, and never red. "Welcome back" sheet when the last LessonCompleted is more than 14 days old: "Re-plan from this week" saves `roadmapStart: today`. Pace picker saves `pace`, `customPerWeek`. `#/learn/glossary`: searchable `<dl>` from `Content.glossary`. `LearnUI.focusCard(ctx)` is the weekly focus card for Today.
- Acceptance: map and plan render from the event log and nothing is ever shown as overdue.
- Tests: `learn: planWeeks steady gentle focused`, `learn: custom pace`, `learn: free has no dates`, `learn: nothing overdue` (scan every string the module can emit for overdue|late|behind|missed), `learn: welcome back after gap`, `learn: map progress from events`, `learn: glossary filter`, `learn: focusData`.
- Rules: nothing decreases (a done lesson stays done); even if `Engine.roadmap` returns `behindWeeks`, show it only as "Pick up where you left off".

## Decisions that bite
O1 title and discreet name: no change here. O2 PIN: n/a. O3 numbers "please verify": only the `#/sos/urgent` link is yours. O4 `UI.speak` only. O5 locale 'en', no Gujarati. O6 lessons and roadmap must work on an empty and a sample profile. O7 no dead button; an unavailable exercise or route is an honest "not available yet" page. O8 n/a.

## Open questions, default taken
1. Verb to save pace and roadmapStart: default `A.onboard(patch)`. 2. Checkpoint content: exercise `checkpoint` if present, else generated. 3. M4-M10 not on the trunk: "coming" nodes, not locked. 4. Evidence card: a sheet of `lesson.refs`, no new route. 5. Engine absent: local pure fallbacks, switch on merge. 6. Plan file docs/offline/build-2026-11-07/PLAN.md has no lane-specific text for learn beyond the lane_args entry.

## Go-aheads
U-12 none. U-13/U-14: actions-sos U-09 merged (A.completeLesson, A.checkpoint, A.saveResponse, A.todos.add, A.onboard) for the browser flow; Node tests use a stub Actions. Switch to real ui-core when core U-03 merges (also gives `data-tour` nav targets).

## Gates and baselines
`python C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tools/gates.py --wt C:/Users/ruchi/1-addic-wt/learn --lane learn build test validate guards` (add browser/docs when the harness exists). Baselines (coordination/baselines.md): empty; green = every test you add passes and nothing passing at base fails (build, test, browser SKIP at base). Territory: `python C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tools/check_territory.py learn 655516dc..HEAD --wt C:/Users/ruchi/1-addic-wt/learn`.

## Rules in one paragraph
SOS is never gated or interrupted by your pages; no tip or tutorial inside SOS routes. No streak resets, random rewards or points for claimed days; nothing decreases; nothing overdue. No network, no trackers; `https?://` only inside Content. Tone person-first, adult-to-adult, grade 6-8, never "addict" as a noun. Substance text brief and clinical; crisis input shows urgent help only; any passage you write about crisis or medical safety carries `clinicalReview: true` (expect none). Original wording only; docs/book notes are ideas. Accessible: keyboard, labels, focus, reduced motion, contrast, 44 px.
