STATE: TAGGED offline-v1.0 at 45473b2 (11:40 IST); the lanes continue toward offline-v1.1 (13:48). In the tag: the build pipeline and shell, UI core, router and components, the engine's logic, the Actions layer, the exercise engine, lesson player, roadmap and glossary, the browser harness, the docs and the guide skeleton with its .docx; every gate green by name. On their branches, pushed: the encrypted Store (core, two MEDIUM review findings still open) and the SOS screens, lock screen and onboarding (actions-sos, one HIGH safety finding and seven more open). Both need one more fix run by name before they can be merged; a fresh CORE chat started at 13:43 to run them, core first.
NEEDS YOU: (1) The build is continuing on its own past the planned 12:25 close: the launcher's 'day closed' pause did not hold (a tooling defect, recorded) and it started a fresh CORE chat at 13:43. Default: it continues (the plan says the lanes go on toward offline-v1.1 under the same gates). If you want it stopped now, run `python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --stop` (the loop ends; the chats that are running finish their step and hand over). (2) Open offline/1-addic.html from the trunk on your phone and computer and write what you find in one message. (3) The decision defaults are in force (PLAN.md section 9); a one-line answer such as `O3: international only` still changes the units not yet built. (4) Keep the machine awake while a round runs.
NEXT: the fresh CORE runs core's fix round by name (RC10, RC11, RC12), re-checks and report, READY; the HUB merges it with its gates on the merged tree and pushes the trunk. Then actions-sos (RS10 HIGH, RS11-RS17, RC14) the same way when memory allows a second lane; then engine U-06..U-08 and the SCREENS track.

# 1-addic offline edition · the board

Rewritten by the HUB with `tools/board.py` from the status files and `coordination/board-notes.md`, at every event and at least every two hours; nobody edits this file by hand. The first three lines are for the owner (the state, NEEDS YOU, NEXT); the rest is the record. STATE words on the chats' status files: NEW, BUILDING, READY, RESTART, HANDOVER, PAUSED; the HUB adds BASE-READY, INTEGRATING, QUIET.

Rewritten 2026-11-07 14:33 IST by `board.py`.

## The HUB

- STATE: BUILDING — 2026-11-07 13:48 IST: CORE 06ee0d0d handed over at 13:41 (305k, all runs returned) and the launcher started CORE 036d08b8 at 13:43: the launcher is ACTIVE (its 11:44 'day closed' pause did not hold…
- BASE: f9de7023 (the trunk after the learn READY merge, 2026-11-07 10:50; the tag offline-v1.0 is cut from the trunk at the end of the quiet window; new lanes cut from here; the base worktree C:\Users\ruchi\1-addic-wt\_base stays at BASE-READY 655516dc, read-only)
- BASE-READY: 2026-11-07 07:15 655516dc
- TRACKS-ALLOWED: CORE   # the launcher is active (its 11:44 pause did not hold); SCREENS is added when the memory rule allows (4.0 + 1.5 + 3.0 x (live lanes + 1) GB free: 11.5 GB with one lane live, 8.5 with none)
- QUIET: done 10:57 (green by name); TAG offline-v1.0 at 45473b2 pushed 11:40
- HOURS: T=06:25 IST | BASE-READY 07:15 | scouts 07:15-08:15 | lanes from about 08:00 tier 1 first | first slices about 09:45 | FREEZE 10:55 | QUIET 10:55-11:40 | TAG offline-v1.0 11:55 | hand-off 12:10 | HANDOVER by 12:25
- UPDATED: 2026-11-07 14:32 IST

## Chats

| Chat | Session | State | Context | Last step |
|---|---|---|---|---|
| HUB | ed0e0a4b (launcher-started 2026-11-07 11:44) | BUILDING — 2026-11-07 13:48 IST: CORE 06ee0d0d handed over at 13:41 (305k, all runs returned) and the launcher started CORE… | 194k | 2026-11-07 14:32 IST |
| CORE | 036d08b8 (launcher-started 2026-11-07 13:43) | BUILDING — 2026-11-07 14:25 IST: two runs live: core wf_019fc9eb-a81 (slot 1, 14:11) and actions-sos wf_b38141d2-651 (slot 3… | 212k | 2026-11-07 14:25 IST |
| SCREENS |  | NEW — not started; the launcher starts this chat once status-HUB.md carries BASE-READY and TRACKS-ALLOWED names SCREENS (when… |  | 2026-11-07 06:50 IST |

## Lanes (10)

| Lane | Chat | Tier | Flagged | Slot | State | Note |
|---|---|---|---|---|---|---|
| `core` | CORE | 1 | yes | slot 1 | REVIEWING | GRANTED 2026-11-07 14:08 (the 14:07 row shows 9.6 GB free, nothing of ours running): start the fix run by name now from bda0f0f (RC10, RC11, RC12 and the… |
| `engine` | CORE | 1 |  | slot 2 | PAUSED | GRANTED again 2026-11-07 14:32 (the 14:31 row shows 9.3 GB free with two runs live): resume from 6cb722e with done [U-05, U-06], diffFrom 04fc0c1, batches… |
| `actions-sos` | CORE | 1 | yes | slot 3 | BUILDING | GRANTED again 2026-11-07 14:20 (the 14:19 row shows 10.3 GB free with core's run live): start the fix run by name now from fc0d038 (FIX-R2-SAFETY: RS10 HIGH… |
| `learn` | CORE | 1 |  | slot 4 | MERGED | GRANTED 2026-11-07 09:50 (the 09:49 row shows 7.4 GB free with three runs live; start the slice U-12 now in the worktree cut 07:21 at 655516dc, on the real… |
| `tests-docs` | CORE | 1 |  | slot 5 | MERGED | GRANTED 2026-11-07 09:30 (the 09:29 row shows 9.2 GB free with core and actions-sos live: start U-34 now in the worktree cut 09:21 from 22c39654; tier 1; U-37… |
| `today-track` | SCREENS | 1 |  | - | NEW | tier 1 (U-15, U-16) then tier 2; slice U-15; files offline/src/ui-today.js, src/ui-track.js, src/ui-harbor.js |
| `workbook-settings` | SCREENS | 1 |  | - | NEW | tier 1 (U-19, U-20a) then tier 2; slice U-19; files offline/src/ui-settings.js, src/ui-workbook.js, src/ui-plan.js |
| `actions` | SCREENS | 2 |  | - | NEW | tier 2; slice U-22; files offline/src/ui-actions.js, src/ui-practices.js; starts only when no tier 1 lane waits for a slot |
| `game-tutorials` | SCREENS | 2 |  | - | NEW | tier 2; slice U-27; files offline/src/ui-game.js, src/ui-guidance.js, src/ui-tools.js; starts only when no tier 1 lane waits for a slot |
| `content` | SCREENS | 1 |  | - | NEW | tier 1 (U-31a) then tier 2; slice U-31a; files offline/src/content-lessons-b.js, content-lessons-c.js, content-exercises.js, content-practices.js… |

Slots allowed: 3 running lanes from 14:32 (core's and actions-sos's fix runs live; engine granted on the 14:31 row, 9.3 GB free with two running); no fourth lane today without a fresh row at 7.0 GB with three running (SCREENS needs its own chat: TRACKS-ALLOWED); under 4.0 GB the newest lane (engine) pauses at its next commit. Granted: 5 lanes (`core` slot 1, `engine` slot 2, `actions-sos` slot 3, `learn` slot 4, `tests-docs` slot 5).

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

## Machine

- Free memory 9.3 GB of 31.8 GB at 2026-11-07 14:31 IST; claude 25, node 53 processes; 7 slots by the rule (lane-widening.md).
- The launcher loop: running (pid 14024); its last launch: CORE 036d08b8 at 2026-11-07 13:43.

## Files of the build

- Spec: docs/offline/BUILD-PLAN.md · Plan: docs/offline/build-2026-11-07/PLAN.md · Prompts: KICKOFF-PROMPTS.md · Status: coordination/status-HUB.md, status-CORE.md, status-SCREENS.md · Decisions: PLAN.md section 9, outbox-OWNER.md · Tools and the owner's lines: tools/README.md · Trunk: build/offline-v1 (origin) · Worktrees: C:\Users\ruchi\1-addic-wt\
