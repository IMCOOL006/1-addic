## For the owner

STATE: TAGGED offline-v1.0 at 45473b2 (11:40 IST); the lanes continue toward offline-v1.1 (13:48). In the tag: the build pipeline and shell, UI core, router and components, the engine's logic, the Actions layer, the exercise engine, lesson player, roadmap and glossary, the browser harness, the docs and the guide skeleton with its .docx; every gate green by name. On their branches, pushed: the encrypted Store (core, two MEDIUM review findings still open) and the SOS screens, lock screen and onboarding (actions-sos, one HIGH safety finding and seven more open). Both need one more fix run by name before they can be merged; a fresh CORE chat started at 13:43 to run them, core first.
NEEDS YOU: (1) The build is continuing on its own past the planned 12:25 close: the launcher's 'day closed' pause did not hold (a tooling defect, recorded) and it started a fresh CORE chat at 13:43. Default: it continues (the plan says the lanes go on toward offline-v1.1 under the same gates). If you want it stopped now, run `python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --stop` (the loop ends; the chats that are running finish their step and hand over). (2) Open offline/1-addic.html from the trunk on your phone and computer and write what you find in one message. (3) The decision defaults are in force (PLAN.md section 9); a one-line answer such as `O3: international only` still changes the units not yet built. (4) Keep the machine awake while a round runs.
NEXT: the fresh CORE runs core's fix round by name (RC10, RC11, RC12), re-checks and report, READY; the HUB merges it with its gates on the merged tree and pushes the trunk. Then actions-sos (RS10 HIGH, RS11-RS17, RC14) the same way when memory allows a second lane; then engine U-06..U-08 and the SCREENS track.

## The tag's list (FREEZE 10:55, written 10:51)

**In `offline-v1.0`** (merged into the trunk, every gate GREEN by name on the merged tree): U-01 build pipeline, shell and CSP head (core) · U-03 UI core and router, U-02 tokens and components (core) · U-05 engine: ids, dates, profile, game derivations (engine) · U-09 Actions in Node memory mode (actions-sos) · U-34 browser harness, 19 named tests (tests-docs) · U-12 exercise engine (learn) · U-37 docs true: offline/README.md, ADR 0022, README and CLAUDE.md sections (tests-docs) · U-36a guide skeleton and the .docx pipeline (tests-docs). Fixes by name on these units are still taken until the tag.
**Not in the tag, by the rule (READY or READY-SLICE by 10:55 only):** U-13 lesson player and checkpoint, U-14 roadmap and glossary (learn, READY 19f373c by the freeze; merged in the quiet window's first minutes); the encrypted Store U-04 (core: not READY, its two reviewers' HIGH findings RC5-RC9, RS5-RS8 being fixed by name); the SOS screens U-10 and the lock screen and onboarding U-11 (actions-sos: not READY, RS2 HIGH open: the typed-text crisis check misses common phrases; CORE and the HUB both say not to tag U-10 with RS2 open). These three lanes continue on their branches and are the first merges of `offline-v1.1`.
**Named for `offline-v1.1` from the start:** engine U-06 to U-08 (paused for memory), every SCREENS unit (U-15 to U-33, the chat never started: memory), tests-docs tier 2 (U-35 screenshots, U-36b guide Part 3), every tier 2 unit, the clinical-review copy (R-C-9, R-C-13), the lane.js reviewer-findings truncation fix (R-C-12, HUB tooling).
**What the tag is, honestly:** a file that opens offline, builds, passes its Node and guard gates, has the UI shell, router, components, engine logic, Actions layer, exercise engine, browser harness and the guide skeleton. It is not yet a file a person can set up with a PIN, use in a craving or log in: those screens are the first merges after the tag.

## Merges

- 07:41 core READY-SLICE 8bf7b5c (U-01) -> 7eaf7f4, trunk fde4bbbd. build GREEN 103409 B; guards GREEN by name (15 screen tour-target names baselined until the screens land).
- 07:44 engine READY-SLICE 04fc0c1 (U-05) -> 6089dad, trunk 33d2a04f. build GREEN 127289 B; test GREEN (logic.test.mjs); validate SKIP until U-08.
- 08:19 core READY-SLICE 4a43190 (U-03, U-02) -> 063b261, trunk 68371bb5. build GREEN 187464 B; test GREEN (store.test.mjs). The generated 1-addic.html conflicted and was rebuilt from the merged sources.
- 08:48 actions-sos READY-SLICE 1cb96a3 (U-09) -> 7a9547c, trunk 22c39654. build GREEN 240874 B; test GREEN (actions.test.mjs on the real engine).
- 09:55 tests-docs READY-SLICE 310780d (U-34, the browser harness) -> trunk 2da0caa4. build GREEN; test GREEN (harness.test.mjs); 19 named browser tests, 5 pass, the rest SKIP by name until their screens land.
- 10:18 learn READY-SLICE a499dae (U-12, the exercise engine) -> 4618e43c, trunk 4618e43c. build GREEN 298714 B; test GREEN (learn.test.mjs).
- 10:26 tests-docs READY d91164d (U-37 docs true, U-36a the guide skeleton and its .docx) -> f3775f1a, trunk f3775f1a. build GREEN; test GREEN; docs GREEN (the guide .docx builds reproducibly).
- Queue: empty.

## Blockers and questions

- 13:48: the launcher's `--pause "day closed"` (11:44) was lost when the running loop wrote its in-memory state back; the launcher is active and started CORE 036d08b8 at 13:43. Tooling fix for offline-v1.1: the loop re-reads the pause from disk each tick. Both flagged lanes are RED 1 on their own review rounds: core bda0f0f (RC10, RC11 MEDIUM, RC12; tracks/CORE/lane-reports/core.md) and actions-sos fc0d038 (RS10 HIGH, RS11-RS17, RC14; lane-reports/actions-sos.md); the fresh CORE runs their fix rounds, core first.

- Memory is shared with the pharma program: rows 9.7 GB (07:25, nothing running), 3.4 (07:36, two builders), 5.8-6.3 (07:46-08:06, one builder), 9.3 (08:17, nothing), 5.9-6.1 (08:27-08:37, two builders), 2.4 (08:48, two builders and a checker). A running lane costs 2 to 3 GB measured. Rule applied twice (07:38 engine, 08:50 actions-sos): under 4 GB the newest lane pauses at its next commit.
- The planner chat (session e4492b2a) is at 630k context: not a track of this program; closing it frees memory for a lane.
- lane.js (HUB tooling): the reviewers' findings over 2,000 characters were cut to ids and the fix rounds never saw them (R-C-12); worked around by laneNote today; fixed in the tooling for offline-v1.1.
- Safety copy for clinical review (CORE R-C-9): the SOS fallback lines, the crisis copy, the onboarding safety and lock texts in ui-sos.js and ui-onboarding.js are built as placeholders; the content lane (SCREENS, not started today) writes the reviewed versions in offline-v1.1. Please read them on your walk.
- Decisions: no answer by 08:25, so the defaults of PLAN.md section 9 are in force (outbox-OWNER.md R-O-1). A later one-line answer still counts for the units not yet built.

## Files of the build

- Spec: docs/offline/BUILD-PLAN.md · Plan: docs/offline/build-2026-11-07/PLAN.md · Prompts: KICKOFF-PROMPTS.md · Status: coordination/status-HUB.md, status-CORE.md, status-SCREENS.md · Decisions: PLAN.md section 9, outbox-OWNER.md · Tools and the owner's lines: tools/README.md · Trunk: build/offline-v1 (origin) · Worktrees: C:\Users\ruchi\1-addic-wt\
