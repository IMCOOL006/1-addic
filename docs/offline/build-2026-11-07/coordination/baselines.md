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

- guards: guard: tour-target quicklog-button (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
- guards: guard: tour-target quicklog-intensity (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
- guards: guard: tour-target quicklog-save (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
- guards: guard: tour-target planner-day (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
- guards: guard: tour-target planner-gaps (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
- guards: guard: tour-target planner-add (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
- guards: guard: tour-target bp-new (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
- guards: guard: tour-target bp-form (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
- guards: guard: tour-target workbook-groups (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
- guards: guard: tour-target workbook-card (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
- guards: guard: tour-target insights-triggers (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
- guards: guard: tour-target insights-heatmap (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
- guards: guard: tour-target review-start (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
- guards: guard: tour-target plan-sections (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
- guards: guard: tour-target plan-print (seen 2026-11-07 07:39, C:\Users\ruchi\1-addic-wt\_logs\gates\core\guards-20261107-073928.log)
