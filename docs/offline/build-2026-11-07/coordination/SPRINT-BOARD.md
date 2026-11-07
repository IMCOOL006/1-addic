STATE: TAGGED offline-v1.0 at 45473b2 (11:40 IST); BUILDING toward offline-v1.1 (11:51). Eight merges are in the tag: the build pipeline and shell, UI core, router and components, the engine's logic, the Actions layer, the exercise engine, lesson player, roadmap and glossary, the browser harness, the docs and the guide skeleton with its .docx; every gate green by name on the tagged tree. The encrypted Store (core U-04), SOS screens, lock screen and onboarding (actions-sos U-10, U-11) are finishing their check and review rounds on their branches now and are merged by the HUB the moment their READY lines appear.
NEEDS YOU: (0) open offline/1-addic.html from the trunk (or `git checkout offline-v1.0 -- offline/1-addic.html`) on your phone and computer and write what you find in one message; it goes to the lanes by territory. (1) The launcher is paused since 11:44 (day closed): the two rounds in flight still finish and are merged, but when the CORE chat hands over (it is near its context limit) no fresh CORE starts, so engine U-06..U-08 and the SCREENS track wait for `python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --resume` from you; default if you say nothing: the trunk waits with the two merges in. (2) The decision defaults are in force since 08:25 (PLAN.md section 9); a one-line answer such as `O3: international only` still changes the units not yet built. (3) Memory: each running lane takes about 3 GB; anything you free is one more lane. (4) Keep the machine awake while a round runs.
NEXT: the HUB (session 4) merges core READY (U-04 plus the review fixes F1, F2, RC1-RC9, RS1-RS8) and then actions-sos READY (U-10, U-11 plus RS2-RS9, RC10) as the first two merges of offline-v1.1, each with its gates on the merged tree, trunk pushed; then engine U-06..U-08 and the SCREENS track when the launcher runs again and memory allows.

# 1-addic offline edition · the board

Rewritten by the HUB with `tools/board.py` from the status files and `coordination/board-notes.md`, at every event and at least every two hours; nobody edits this file by hand. The first three lines are for the owner (the state, NEEDS YOU, NEXT); the rest is the record. STATE words on the chats' status files: NEW, BUILDING, READY, RESTART, HANDOVER, PAUSED; the HUB adds BASE-READY, INTEGRATING, QUIET.

Rewritten 2026-11-07 12:26 IST by `board.py`.

## The HUB

- STATE: BUILDING — 2026-11-07 11:51 IST: HUB session 4 (ed0e0a4b, started by the launcher 11:44 on the HANDOVER line) continues the loop toward offline-v1.1: offline-v1.0 stands at 45473b2; CORE 06ee0d0d's two live…
- BASE: f9de7023 (the trunk after the learn READY merge, 2026-11-07 10:50; the tag offline-v1.0 is cut from the trunk at the end of the quiet window; new lanes cut from here; the base worktree C:\Users\ruchi\1-addic-wt\_base stays at BASE-READY 655516dc, read-only)
- BASE-READY: 2026-11-07 07:15 655516dc
- TRACKS-ALLOWED: CORE   # the launcher is paused since 11:44 (day closed): the owner's --resume brings a fresh CORE when 06ee0d0d hands over; SCREENS is added when the memory rule allows (4.0 + 1.5 + 3.0 x (live lanes + 1) GB free: 11.5 GB with one lane live, 8.5 with none)
- QUIET: done 10:57 (green by name); TAG offline-v1.0 at 45473b2 pushed 11:40
- HOURS: T=06:25 IST | BASE-READY 07:15 | scouts 07:15-08:15 | lanes from about 08:00 tier 1 first | first slices about 09:45 | FREEZE 10:55 | QUIET 10:55-11:40 | TAG offline-v1.0 11:55 | hand-off 12:10 | HANDOVER by 12:25
- UPDATED: 2026-11-07 12:26 IST

## Chats

| Chat | Session | State | Context | Last step |
|---|---|---|---|---|
| HUB | ed0e0a4b (launcher-started 2026-11-07 11:44) | BUILDING — 2026-11-07 11:51 IST: HUB session 4 (ed0e0a4b, started by the launcher 11:44 on the HANDOVER line) continues the loop… | 131k | 2026-11-07 12:26 IST |
| CORE | 06ee0d0d (launcher-started 2026-11-07 10:29) | BUILDING — 2026-11-07 11:41 IST: CORE 06ee0d0d at about 252k context: the hand-over is written (RUN-RECORD 'Resume here'). Its two… | 284k | 2026-11-07 11:59 IST |
| SCREENS |  | NEW — not started; the launcher starts this chat once status-HUB.md carries BASE-READY and TRACKS-ALLOWED names SCREENS (when… |  | 2026-11-07 06:50 IST |

## Lanes (10)

| Lane | Chat | Tier | Flagged | Slot | State | Note |
|---|---|---|---|---|---|---|
| `core` | CORE | 1 | yes | slot 1 | REVIEWING | GRANTED 2026-11-07 07:15 (tier 1, flagged; cut from BASE 655516dc once its scout has written the brief); every open finding built to cdfc0e9; check PASS at… |
| `engine` | CORE | 1 |  | slot ? | PAUSED | GRANTED slot=2 PAUSED since 2026-11-07 10:42 (6cb722e committed…; slice U-05 04fc0c1 MERGED; C1 3ed6e1d; U-06 6cb722e (10:45, unchecked); the HUB's 10:42… |
| `actions-sos` | CORE | 1 | yes | slot 3 | REVIEWING | GRANTED again 2026-11-07 08:56 (free memory 7.4 GB at 08:55 with core alone running; resume U-10 then U-11 from the branch tip; tier 1, flagged; pauses again… |
| `learn` | CORE | 1 |  | slot 4 | READY | GRANTED 2026-11-07 09:50 (the 09:49 row shows 7.4 GB free with three runs live; start the slice U-12 now in the worktree cut 07:21 at 655516dc, on the real… |
| `tests-docs` | CORE | 1 |  | slot 5 | MERGED | GRANTED 2026-11-07 09:30 (the 09:29 row shows 9.2 GB free with core and actions-sos live: start U-34 now in the worktree cut 09:21 from 22c39654; tier 1; U-37… |
| `today-track` | SCREENS | 1 |  | - | NEW | tier 1 (U-15, U-16) then tier 2; slice U-15; files offline/src/ui-today.js, src/ui-track.js, src/ui-harbor.js |
| `workbook-settings` | SCREENS | 1 |  | - | NEW | tier 1 (U-19, U-20a) then tier 2; slice U-19; files offline/src/ui-settings.js, src/ui-workbook.js, src/ui-plan.js |
| `actions` | SCREENS | 2 |  | - | NEW | tier 2; slice U-22; files offline/src/ui-actions.js, src/ui-practices.js; starts only when no tier 1 lane waits for a slot |
| `game-tutorials` | SCREENS | 2 |  | - | NEW | tier 2; slice U-27; files offline/src/ui-game.js, src/ui-guidance.js, src/ui-tools.js; starts only when no tier 1 lane waits for a slot |
| `content` | SCREENS | 1 |  | - | NEW | tier 1 (U-31a) then tier 2; slice U-31a; files offline/src/content-lessons-b.js, content-lessons-c.js, content-exercises.js, content-practices.js… |

Slots allowed: 2 running lanes from 11:51 (core and actions-sos finishing their check and review rounds); engine paused; nothing new starts until a row shows 7.0 GB free AND a CORE chat is live to launch it (the launcher is paused); under 4.0 GB free the newest lane pauses at its next commit. Granted: 5 lanes (`core` slot 1, `engine` slot ?, `actions-sos` slot 3, `learn` slot 4, `tests-docs` slot 5).

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

- Memory is shared with the pharma program: rows 9.7 GB (07:25, nothing running), 3.4 (07:36, two builders), 5.8-6.3 (07:46-08:06, one builder), 9.3 (08:17, nothing), 5.9-6.1 (08:27-08:37, two builders), 2.4 (08:48, two builders and a checker). A running lane costs 2 to 3 GB measured. Rule applied twice (07:38 engine, 08:50 actions-sos): under 4 GB the newest lane pauses at its next commit.
- The planner chat (session e4492b2a) is at 630k context: not a track of this program; closing it frees memory for a lane.
- lane.js (HUB tooling): the reviewers' findings over 2,000 characters were cut to ids and the fix rounds never saw them (R-C-12); worked around by laneNote today; fixed in the tooling for offline-v1.1.
- Safety copy for clinical review (CORE R-C-9): the SOS fallback lines, the crisis copy, the onboarding safety and lock texts in ui-sos.js and ui-onboarding.js are built as placeholders; the content lane (SCREENS, not started today) writes the reviewed versions in offline-v1.1. Please read them on your walk.
- Decisions: no answer by 08:25, so the defaults of PLAN.md section 9 are in force (outbox-OWNER.md R-O-1). A later one-line answer still counts for the units not yet built.

## Machine

- Free memory 5.8 GB of 31.8 GB at 2026-11-07 12:25 IST; claude 25, node 52 processes; 2 slots by the rule (lane-widening.md).
- The launcher loop: running (pid 14024); its last launch: HUB ed0e0a4b at 2026-11-07 11:44.

## Files of the build

- Spec: docs/offline/BUILD-PLAN.md · Plan: docs/offline/build-2026-11-07/PLAN.md · Prompts: KICKOFF-PROMPTS.md · Status: coordination/status-HUB.md, status-CORE.md, status-SCREENS.md · Decisions: PLAN.md section 9, outbox-OWNER.md · Tools and the owner's lines: tools/README.md · Trunk: build/offline-v1 (origin) · Worktrees: C:\Users\ruchi\1-addic-wt\
