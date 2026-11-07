TRACK: CORE
STATE: NEW   # not started; the launcher starts this chat once status-HUB.md carries BASE-READY and TRACKS-ALLOWED names CORE
LANE: core NEW   # tier 1, flagged (encryption, the person's data); slice U-01; files offline/build.mjs, src/shell.html, src/styles.css, src/ui-core.js, src/store.js, src/boot.js, tests/store.test.mjs, package.json (initial)
LANE: engine NEW   # tier 1; slice U-05; files offline/src/engine.js, tests/logic.test.mjs, tests/engine-*.test.mjs
LANE: actions-sos NEW   # tier 1, flagged (safety copy); slice U-09; files offline/src/actions.js, src/ui-sos.js, src/ui-onboarding.js, tests/actions.test.mjs
LANE: learn NEW   # tier 1; slice U-12; files offline/src/ui-exercise.js, src/ui-learn.js
LANE: tests-docs NEW   # tier 1 harness and docs, tier 2 screenshots and Part 3; slice U-34 (needs U-01 merged); files offline/tests/browser.test.mjs, tests/screens.mjs, tests/helpers/*, offline/docs/*, offline/README.md, README.md and CLAUDE.md (append), docs/decisions/0022-*.md, package.json scripts and devDependencies, package-lock.json
SLOTS-ASKED: 0
UPDATED: 2026-11-07 06:50 IST

# 2026-11-07 06:50 · written by the HUB at S-00

- This file is the CORE chat's; the HUB wrote only this header. The chat rewrites the header at every step (TRACK, STATE, the LANE lines, SLOTS-ASKED, UPDATED from `date`) and appends dated sections for what the next chat must know.
- Lane order for slots: core, engine, actions-sos first; learn when a slot frees; tests-docs when the board shows core's U-01 merged.
