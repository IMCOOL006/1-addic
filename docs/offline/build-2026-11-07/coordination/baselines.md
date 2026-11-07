# baselines · every check and test red on the base, by name

**Base:** trunk `build/offline-v1`, cut from `offline-plan` at `1acf406` on 2026-11-07 06:33 IST (the BASE-READY tip is on status-HUB.md; the base worktree is `C:\Users\ruchi\1-addic-wt\_base`).

**What the base holds under `offline/`:** `offline/src/content-core.js` and `offline/src/content-lessons-a.js` only. No `offline/build.mjs`, no `package.json`, no tests, no built file.

**Gates on the base (2026-11-07 06:42, run by hand by the HUB):**

| Gate | Result on the base | Named failures |
|---|---|---|
| build | SKIP (no `offline/build.mjs`) | none |
| test | SKIP (no `offline/tests/`) | none |
| validate | SKIP (no `offline/src/engine.js`); the two content files load in Node: `require('./offline/src/content-core.js')` and `require('./offline/src/content-lessons-a.js')` → 4 modules, 16 lessons, 37 skills, 32 references, 9 tutorials, 30 top-level keys | none |
| browser | SKIP (no `package.json`, no harness) | none |
| guards | SKIP (no built file) | none |
| docs | SKIP (no `offline/docs/build_guide.py`) | none |

**The baseline of named failures is empty.** A lane is green when every test it adds passes and nothing that passed on the base fails; judged by failure name, never by count or exit code. A SKIP that becomes a run on a lane is the lane's own gate (a RED there is the lane's, not the base's).

Add a line here only when a check is red on the base itself (`- <gate>: <failure name> (seen <stamp>, <log path>)`).

- guards: tutorial data-tour targets (`FAIL guard: tour-target: <name>`) are expected RED by name until the screens that carry them land; the HUB baselines them here by name when a lane reports them (noted 2026-11-07 07:15, not yet seen).

**Tour-target names expected RED until the screen lanes land (seen on the core U-01 merge, 2026-11-07 07:39; lifted one by one as the screens merge):**

- ~~guards: guard: tour-target quicklog-button (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)~~ LIFTED 2026-11-07 17:01: today-track READY 3f3001e merged (9f3026c6), the target exists
- ~~guards: guard: tour-target quicklog-intensity (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)~~ LIFTED 2026-11-07 17:01: today-track READY 3f3001e merged (9f3026c6), the target exists
- ~~guards: guard: tour-target quicklog-save (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)~~ LIFTED 2026-11-07 17:01: today-track READY 3f3001e merged (9f3026c6), the target exists
- guards: guard: tour-target planner-day (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
- guards: guard: tour-target planner-gaps (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
- guards: guard: tour-target planner-add (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
- guards: guard: tour-target bp-new (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
- guards: guard: tour-target bp-form (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
- guards: guard: tour-target workbook-groups (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
- guards: guard: tour-target workbook-card (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
- ~~guards: guard: tour-target insights-triggers (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)~~ LIFTED 2026-11-07 17:01: today-track READY 3f3001e merged (9f3026c6), the target exists
- ~~guards: guard: tour-target insights-heatmap (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)~~ LIFTED 2026-11-07 17:01: today-track READY 3f3001e merged (9f3026c6), the target exists
- guards: guard: tour-target review-start (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
- guards: guard: tour-target plan-sections (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
- guards: guard: tour-target plan-print (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)

**LIFTED 2026-11-07 16:47: learn READY 4f5832f (cb0b427) and engine READY 57153d3 (3720d119) merged; the full Node suite on the trunk 3720d119 is 250 pass / 0 fail (jobs/4b638c7b/tmp/fulltest-after-fixes.log). The three names below are no longer baselined.** Three test names expected RED on the trunk from the content U-31a merge until CORE's test-only fixes merge (seen 2026-11-07 16:30 on int/content-065699b, full Node suite 247 pass / 3 fail, log C:\Users\ruchi\.claude-pro\jobs\4b638c7b\tmp\fulltest-content.log; each encodes the pre-content assumption "no Content.exercises"; the product behaviour is right: only real exercise ids are known routes, quick-reasons resolves; the fixes are asked in R-S-4 and R-H-21; lifted by name when build/engine and build/learn merge them):**

- test: engine-data.test.mjs 'validateContent: the tryIt exercise check waits for Content.exercises, then runs' (:243 asserts c.exercises === undefined) (seen 2026-11-07 16:30, owner engine)
- test: engine-data.test.mjs 'knownRoute: the 3.5 route table, by path' (:266 asserts '#/exercise/anything' is known) (seen 2026-11-07 16:30, owner engine)
- test: learn.test.mjs 'learn: the gallery renders every field type, saves and resumes a draft (stand-in DOM)' (:265 expects 'Not available yet' for quick-reasons) (seen 2026-11-07 16:30, owner learn)

**Three test names expected RED on the trunk from the content READY 680f850 merge (U-29, U-30, U-33) until CORE's test-only fixes merge (seen 2026-11-07 17:14 on int/content-680f850, full Node suite 294 pass / 3 fail, log C:/Users/ruchi/.claude-pro/jobs/4b638c7b/tmp/fulltest-content2.log; each asserted that a module or the sample was still missing; the product behaviour is right; fixes asked in R-S-9 and R-H-27; lifted by name when build/learn and build/actions-sos merge them):**

- test: learn.test.mjs 'learn: map progress from events' (:424 expects M4 not loaded; U-29 builds M4) (seen 2026-11-07 17:14, owner learn)
- test: learn.test.mjs 'learn: M0 plays end to end and writes LessonCompleted, CheckpointCompleted, ModuleCompleted (stand-in DOM)' (:538-539 expects #/learn/m7 'coming in a future update'; U-30 builds M7) (seen 2026-11-07 17:14, owner learn)
- test: actions.test.mjs 'actions (U-09; store: real, engine: real) > validation failures write nothing' (:304 expects Actions.loadSample to refuse with 'no-sample'; U-33 builds Content.sample) (seen 2026-11-07 17:14, owner actions-sos)
