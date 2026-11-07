STATE: BUILDING, 07:46 IST. Two slices are merged into the trunk (core U-01: the build pipeline and the shell; engine U-05: ids, dates, the game derivations, 33 tests green); trunk build/offline-v1 at 33d2a04f, pushed. core's second slice (the UI core and router, U-03, and tokens and components, U-02) is building. Free memory is 5.6 GB, under the 4 GB floor: engine is paused after its slice, and actions-sos, learn and tests-docs wait for memory.
NEEDS YOU: (1) decisions O1–O9 and Q10–Q13 (PLAN.md section 9) take their defaults at 08:25 unless you answer in one line, e.g. `O1-O9 default, Q10-Q13 default`; (2) memory is the bottleneck now: each running lane takes about 3 GB, not the 0.7 GB the plan assumed, so only one lane runs at a time while the pharma program holds the machine; anything you can free (the 630k-context planner chat, idle browser tabs, a pharma pause if it has one) is one more lane on this build; (3) keep the machine awake.
NEXT: the HUB merges core's second slice when it is READY-SLICE; the next slot goes to actions-sos (SOS and Actions, tier 1) when memory allows, then engine's next units, tests-docs (the browser harness), learn; FREEZE 10:55, QUIET to 11:40, TAG offline-v1.0 about 11:55.

# 1-addic offline edition · the board

Rewritten by the HUB with `tools/board.py` from the status files and `coordination/board-notes.md`, at every event and at least every two hours; nobody edits this file by hand. The first three lines are for the owner (the state, NEEDS YOU, NEXT); the rest is the record. STATE words on the chats' status files: NEW, BUILDING, READY, RESTART, HANDOVER, PAUSED; the HUB adds BASE-READY, INTEGRATING, QUIET.

Rewritten 2026-11-07 07:46 IST by `board.py`.

## The HUB

- STATE: BUILDING — 2026-11-07 07:46 IST: two slices merged (core U-01, engine U-05), trunk 33d2a04f pushed; queue empty; free memory 5.6 GB at 07:46 (above the 4.0 GB floor): engine stays paused, no new grant; core's…
- BASE: 33d2a04f (the trunk after the engine U-05 merge, 2026-11-07 07:44; new lanes cut from here; lanes already cut stay on their own branches, no rebase; the base worktree C:\Users\ruchi\1-addic-wt\_base stays at BASE-READY 655516dc, read-only)
- BASE-READY: 2026-11-07 07:15 655516dc
- TRACKS-ALLOWED: CORE   # SCREENS is added when the lowest of the last three samples is at least 4.0 + 1.5 + 0.7 x (granted lanes + 1) GB, that is 7.6 GB with two lanes granted, 8.3 GB with three, 9.0 GB with four
- QUIET: no
- HOURS: T=06:25 IST | BASE-READY 07:15 | scouts 07:15-08:15 | lanes from about 08:00 tier 1 first | first slices about 09:45 | FREEZE 10:55 | QUIET 10:55-11:40 | TAG offline-v1.0 11:55 | hand-off 12:10 | HANDOVER by 12:25
- UPDATED: 2026-11-07 07:46 IST

## Chats

| Chat | Session | State | Context | Last step |
|---|---|---|---|---|
| HUB | 874b2463 (launcher-started 2026-11-07 07:15) | BUILDING — 2026-11-07 07:46 IST: two slices merged (core U-01, engine U-05), trunk 33d2a04f pushed; queue empty; free memory 5.6… | 161k | 2026-11-07 07:46 IST |
| CORE | a29cd9a2 (launcher-started 2026-11-07 07:15) | BUILDING — session a29cd9a2; core's second slice [U-03,U-02] running (wf_d2230fda-3a5); engine READY-SLICE and paused (memory… | 225k | 2026-11-07 07:43 IST |
| SCREENS |  | NEW — not started; the launcher starts this chat once status-HUB.md carries BASE-READY and TRACKS-ALLOWED names SCREENS (when… |  | 2026-11-07 06:50 IST |

## Lanes (10)

| Lane | Chat | Tier | Flagged | Slot | State | Note |
|---|---|---|---|---|---|---|
| `core` | CORE | 1 | yes | slot 1 | BUILDING | GRANTED 2026-11-07 07:15 (tier 1, flagged; cut from BASE 655516dc once its scout has written the brief); slice U-01 8bf7b5c MERGED by the HUB 07:42 (merge… |
| `engine` | CORE | 1 |  | slot 2 | READY-SLICE | GRANTED 2026-11-07 07:15; PAUSE AT NEXT COMMIT from 07:38 (free memory 2.4 GB at 07:37, under the 4.0 GB floor; PLAN.md section 4): commit what is done, write… |
| `actions-sos` | CORE | 1 | yes | slot ? | SCOUTED | GRANTED slot=3 HELD 2026-11-07 07:20 (granted 07:15, held while…; brief 11.7 KB; slot 3 HELD by the HUB 07:20; worktree cut 07:21 in error, idle, nothing built… |
| `learn` | CORE | 1 |  | slot ? | SCOUTED | GRANTED slot=4 HELD 2026-11-07 07:20 (granted 07:15, held while…; brief 10.8 KB; slot 4 HELD by the HUB 07:20; worktree cut 07:21 in error, idle (R-C-1); slice… |
| `tests-docs` | CORE | 1 |  | slot ? | SCOUTED | GRANTED slot=5 ASKED 07:42, WAITING for memory (tier 1; U-34 needs…; brief 13.7 KB; core's U-01 is merged (07:42), so tests-docs ASKS ITS SLOT now (one of the… |
| `today-track` | SCREENS | 1 |  | - | NEW | tier 1 (U-15, U-16) then tier 2; slice U-15; files offline/src/ui-today.js, src/ui-track.js, src/ui-harbor.js |
| `workbook-settings` | SCREENS | 1 |  | - | NEW | tier 1 (U-19, U-20a) then tier 2; slice U-19; files offline/src/ui-settings.js, src/ui-workbook.js, src/ui-plan.js |
| `actions` | SCREENS | 2 |  | - | NEW | tier 2; slice U-22; files offline/src/ui-actions.js, src/ui-practices.js; starts only when no tier 1 lane waits for a slot |
| `game-tutorials` | SCREENS | 2 |  | - | NEW | tier 2; slice U-27; files offline/src/ui-game.js, src/ui-guidance.js, src/ui-tools.js; starts only when no tier 1 lane waits for a slot |
| `content` | SCREENS | 1 |  | - | NEW | tier 1 (U-31a) then tier 2; slice U-31a; files offline/src/content-lessons-b.js, content-lessons-c.js, content-exercises.js, content-practices.js… |

Slots allowed: 2 (held at 2; the lowest of the last three rows at 07:38 is 3.4 GB, under the floor, so no grant moves; MEASURED: the two running slices took the free memory from 9.7 GB (07:25, no builder) to 3.4 (07:36, two builders and a checker), about 3 GB per running lane, not the 0.7 GB of the formula; slots 3 and 4 are re-granted only when a row shows at least 4.0 + 3.0 GB per lane to add; under 4.0 GB the newest lane pauses at its next commit). Granted: 5 lanes (`core` slot 1, `engine` slot 2, `actions-sos` slot ?, `learn` slot ?, `tests-docs` slot ?).

## Merges

- 07:41 core READY-SLICE 8bf7b5c (U-01) -> 7eaf7f4, trunk fde4bbbd. build GREEN 103409 B; guards GREEN by name (15 screen tour-target names baselined until the screens land).
- 07:44 engine READY-SLICE 04fc0c1 (U-05) -> 6089dad, trunk 33d2a04f. build GREEN 127289 B; test GREEN (logic.test.mjs); validate SKIP until U-08.
- Queue: empty.

## Blockers and questions

- Memory is shared with the pharma program: rows 9.7 GB (07:25, no builder running), 3.4 (07:36, two builders), 2.4 (07:37), 5.6 (07:46). A running lane costs about 3 GB measured. Rule applied at 07:38: the newest lane (engine) paused at its next commit, which was its slice. Grants resume at about 7 GB free.
- The planner chat (session e4492b2a) is at 630k context: not a track of this program; closing it frees memory for a lane.
- Decisions: none answered yet; defaults apply at 08:25.

## Machine

- Free memory 6.3 GB of 31.8 GB at 2026-11-07 07:46 IST; claude 25, node 46 processes; 3 slots by the rule (lane-widening.md).
- The launcher loop: running (pid 14024); its last launch: CORE a29cd9a2 at 2026-11-07 07:15.

## Files of the build

- Spec: docs/offline/BUILD-PLAN.md · Plan: docs/offline/build-2026-11-07/PLAN.md · Prompts: KICKOFF-PROMPTS.md · Status: coordination/status-HUB.md, status-CORE.md, status-SCREENS.md · Decisions: PLAN.md section 9, outbox-OWNER.md · Tools and the owner's lines: tools/README.md · Trunk: build/offline-v1 (origin) · Worktrees: C:\Users\ruchi\1-addic-wt\
