STATE: BUILDING, 10:20 IST (HUB session 3 running). Six slices are merged into the trunk: the build pipeline and shell (U-01), the engine's ids, dates and game derivations (U-05), the UI core, router, tokens and components (U-03, U-02), the Actions layer (U-09), the browser test harness (U-34) and the exercise engine (U-12); trunk build/offline-v1 at 4618e43c, pushed. Four lanes are running under CORE: core's encrypted Store (U-04, reviewers' fixes), the SOS screens, lock screen and onboarding (U-10, U-11, reviewers), the lesson player and roadmap (U-13, U-14), docs-true and the guide skeleton (U-37, U-36a). engine is paused for memory.
NEEDS YOU: (1) the decision defaults are in force since 08:25 (PLAN.md section 9); a one-line answer such as `O3: international only` still changes the units not yet built; (2) memory is the bottleneck now: each running lane takes about 3 GB, not the 0.7 GB the plan assumed, so only one lane runs at a time while the pharma program holds the machine; anything you can free (the 630k-context planner chat, idle browser tabs, a pharma pause if it has one) is one more lane on this build; (3) keep the machine awake.
NEXT: the HUB merges each READY as it appears (the Store U-04, SOS U-10 and U-11, docs-true and the guide skeleton U-37, U-36a are the candidates); FREEZE 10:55 (the tag's list goes here); QUIET 10:55-11:40 (the full suites on the merged trunk); TAG offline-v1.0 about 11:55; hand-off by 12:25. engine's remaining units, the content, Today, Track, Settings and every tier 2 unit go to offline-v1.1.

# 1-addic offline edition · the board

Rewritten by the HUB with `tools/board.py` from the status files and `coordination/board-notes.md`, at every event and at least every two hours; nobody edits this file by hand. The first three lines are for the owner (the state, NEEDS YOU, NEXT); the rest is the record. STATE words on the chats' status files: NEW, BUILDING, READY, RESTART, HANDOVER, PAUSED; the HUB adds BASE-READY, INTEGRATING, QUIET.

Rewritten 2026-11-07 10:20 IST by `board.py`.

## The HUB

- STATE: BUILDING — 2026-11-07 10:20 IST: six merges done, learn U-12 merged at 10:18; CORE 224074c0 runs core review fixes, actions-sos reviewers, learn (C1, C2, U-13, U-14), tests-docs (U-37 committed 0019a3d, U-36a)…
- BASE: 4618e43c (the trunk after the learn U-12 merge, 2026-11-07 10:18; new lanes cut from here; lanes already cut stay on their own branches, no rebase; the base worktree C:\Users\ruchi\1-addic-wt\_base stays at BASE-READY 655516dc, read-only)
- BASE-READY: 2026-11-07 07:15 655516dc
- TRACKS-ALLOWED: CORE   # SCREENS is added when the lowest of the last three samples is at least 4.0 + 1.5 + 0.7 x (granted lanes + 1) GB, that is 7.6 GB with two lanes granted, 8.3 GB with three, 9.0 GB with four
- QUIET: no
- HOURS: T=06:25 IST | BASE-READY 07:15 | scouts 07:15-08:15 | lanes from about 08:00 tier 1 first | first slices about 09:45 | FREEZE 10:55 | QUIET 10:55-11:40 | TAG offline-v1.0 11:55 | hand-off 12:10 | HANDOVER by 12:25
- UPDATED: 2026-11-07 10:20 IST

## Chats

| Chat | Session | State | Context | Last step |
|---|---|---|---|---|
| HUB | 408a3f20 (launcher-started 2026-11-07 09:58) | BUILDING — 2026-11-07 10:20 IST: six merges done, learn U-12 merged at 10:18; CORE 224074c0 runs core review fixes, actions-sos… | 119k | 2026-11-07 10:20 IST |
| CORE | 224074c0 (launcher-started 2026-11-07 08:58) | BUILDING — 2026-11-07 09:54 IST: four runs live (core review fixes, actions-sos reviewers, learn slice U-12, tests-docs… | 284k | 2026-11-07 10:16 IST |
| SCREENS |  | NEW — not started; the launcher starts this chat once status-HUB.md carries BASE-READY and TRACKS-ALLOWED names SCREENS (when… |  | 2026-11-07 06:50 IST |

## Lanes (10)

| Lane | Chat | Tier | Flagged | Slot | State | Note |
|---|---|---|---|---|---|---|
| `core` | CORE | 1 | yes | slot 1 | REVIEWING | GRANTED 2026-11-07 07:15 (tier 1, flagged; cut from BASE 655516dc once its scout has written the brief); slices 8bf7b5c, 4a43190 MERGED; F1, F2, U-04 06cdf34… |
| `engine` | CORE | 1 |  | slot ? | MERGED | GRANTED slot=2 PAUSED since 07:38 (memory); resumes with…; slice U-05 04fc0c1 merged by the HUB 07:44 (merge 6089dad, trunk 33d2a04f); PAUSED (memory, R-H-5)… |
| `actions-sos` | CORE | 1 | yes | slot 3 | REVIEWING | GRANTED again 2026-11-07 08:56 (free memory 7.4 GB at 08:55 with core alone running; resume U-10 then U-11 from the branch tip; tier 1, flagged; pauses again… |
| `learn` | CORE | 1 |  | slot 4 | READY-SLICE | GRANTED 2026-11-07 09:50 (the 09:49 row shows 7.4 GB free with three runs live; start the slice U-12 now in the worktree cut 07:21 at 655516dc, on the real… |
| `tests-docs` | CORE | 1 |  | slot 5 | BUILDING | GRANTED 2026-11-07 09:30 (the 09:29 row shows 9.2 GB free with core and actions-sos live: start U-34 now in the worktree cut 09:21 from 22c39654; tier 1; U-37… |
| `today-track` | SCREENS | 1 |  | - | NEW | tier 1 (U-15, U-16) then tier 2; slice U-15; files offline/src/ui-today.js, src/ui-track.js, src/ui-harbor.js |
| `workbook-settings` | SCREENS | 1 |  | - | NEW | tier 1 (U-19, U-20a) then tier 2; slice U-19; files offline/src/ui-settings.js, src/ui-workbook.js, src/ui-plan.js |
| `actions` | SCREENS | 2 |  | - | NEW | tier 2; slice U-22; files offline/src/ui-actions.js, src/ui-practices.js; starts only when no tier 1 lane waits for a slot |
| `game-tutorials` | SCREENS | 2 |  | - | NEW | tier 2; slice U-27; files offline/src/ui-game.js, src/ui-guidance.js, src/ui-tools.js; starts only when no tier 1 lane waits for a slot |
| `content` | SCREENS | 1 |  | - | NEW | tier 1 (U-31a) then tier 2; slice U-31a; files offline/src/content-lessons-b.js, content-lessons-c.js, content-exercises.js, content-practices.js… |

Slots allowed: 4 running lanes at a time from 09:50 (core, actions-sos, tests-docs, learn); engine's resume at the first row with at least 7.0 GB free with four running, or when one finishes; measured cost 2 to 3 GB per running lane; under 4.0 GB free the newest lane pauses at its next commit. Granted: 5 lanes (`core` slot 1, `engine` slot ?, `actions-sos` slot 3, `learn` slot 4, `tests-docs` slot 5).

## Merges

- 07:41 core READY-SLICE 8bf7b5c (U-01) -> 7eaf7f4, trunk fde4bbbd. build GREEN 103409 B; guards GREEN by name (15 screen tour-target names baselined until the screens land).
- 07:44 engine READY-SLICE 04fc0c1 (U-05) -> 6089dad, trunk 33d2a04f. build GREEN 127289 B; test GREEN (logic.test.mjs); validate SKIP until U-08.
- 08:19 core READY-SLICE 4a43190 (U-03, U-02) -> 063b261, trunk 68371bb5. build GREEN 187464 B; test GREEN (store.test.mjs). The generated 1-addic.html conflicted and was rebuilt from the merged sources.
- 08:48 actions-sos READY-SLICE 1cb96a3 (U-09) -> 7a9547c, trunk 22c39654. build GREEN 240874 B; test GREEN (actions.test.mjs on the real engine).
- 09:55 tests-docs READY-SLICE 310780d (U-34, the browser harness) -> trunk 2da0caa4. build GREEN; test GREEN (harness.test.mjs); 19 named browser tests, 5 pass, the rest SKIP by name until their screens land.
- 10:18 learn READY-SLICE a499dae (U-12, the exercise engine) -> 4618e43c, trunk 4618e43c. build GREEN 298714 B; test GREEN (learn.test.mjs).
- Queue: empty.

## Blockers and questions

- Memory is shared with the pharma program: rows 9.7 GB (07:25, nothing running), 3.4 (07:36, two builders), 5.8-6.3 (07:46-08:06, one builder), 9.3 (08:17, nothing), 5.9-6.1 (08:27-08:37, two builders), 2.4 (08:48, two builders and a checker). A running lane costs 2 to 3 GB measured. Rule applied twice (07:38 engine, 08:50 actions-sos): under 4 GB the newest lane pauses at its next commit.
- The planner chat (session e4492b2a) is at 630k context: not a track of this program; closing it frees memory for a lane.
- Safety copy for clinical review (CORE R-C-9): the SOS fallback lines, the crisis copy, the onboarding safety and lock texts in ui-sos.js and ui-onboarding.js are built as placeholders; the content lane (SCREENS, not started today) writes the reviewed versions in offline-v1.1. Please read them on your walk.
- Decisions: no answer by 08:25, so the defaults of PLAN.md section 9 are in force (outbox-OWNER.md R-O-1). A later one-line answer still counts for the units not yet built.

## Machine

- Free memory 5.4 GB of 31.8 GB at 2026-11-07 10:10 IST; claude 25, node 55 processes; 1 slots by the rule (lane-widening.md).
- The launcher loop: running (pid 14024); its last launch: HUB 408a3f20 at 2026-11-07 09:58.

## Files of the build

- Spec: docs/offline/BUILD-PLAN.md · Plan: docs/offline/build-2026-11-07/PLAN.md · Prompts: KICKOFF-PROMPTS.md · Status: coordination/status-HUB.md, status-CORE.md, status-SCREENS.md · Decisions: PLAN.md section 9, outbox-OWNER.md · Tools and the owner's lines: tools/README.md · Trunk: build/offline-v1 (origin) · Worktrees: C:\Users\ruchi\1-addic-wt\
