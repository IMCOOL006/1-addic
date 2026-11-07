STATE: BASE-READY at 07:15 IST (trunk build/offline-v1 at 655516dc, pushed); four slots granted to CORE (core, engine, actions-sos, learn); the first HUB handed over at BASE-READY (its context passed the 250k mark); no chat is running yet.
NEEDS YOU: (1) run `! python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --start` so the launcher starts the CORE chat and the fresh HUB by itself; (2) add the two settings rows from docs/offline/build-2026-11-07/tools/README.md to .claude/settings.json (the context rule hook); (3) decisions O1–O9 and Q10–Q13 (PLAN.md section 9) take their defaults at 08:25 unless you answer in one line, e.g. `O1-O9 default, Q10-Q13 default`.
NEXT: CORE scouts its five lanes (about an hour), cuts core, engine, actions-sos and learn from BASE 655516dc, builds the slices (U-01, U-05, U-09, U-12); the HUB merges each READY-SLICE as it appears (first ones about 09:45); SCREENS starts when memory allows; FREEZE 10:55, QUIET to 11:40, TAG offline-v1.0 about 11:55.

# 1-addic offline edition · the board

Rewritten by the HUB with `tools/board.py` from the status files and `coordination/board-notes.md`, at every event and at least every two hours; nobody edits this file by hand. The first three lines are for the owner (the state, NEEDS YOU, NEXT); the rest is the record. STATE words on the chats' status files: NEW, BUILDING, READY, RESTART, HANDOVER, PAUSED; the HUB adds BASE-READY, INTEGRATING, QUIET.

Rewritten 2026-11-07 07:11 IST by `board.py`.

## The HUB

- STATE: RESTART — 2026-11-07 07:15 IST: BASE-READY reached by the first HUB session (26196777), which hands over at once because its context passed the 250k mark during S-00; the fresh HUB starts from…
- BASE: 655516dc (the trunk build/offline-v1 at BASE-READY: offline-plan's 1acf406 plus the two S-00 commits; base worktree C:\Users\ruchi\1-addic-wt\_base, read-only; integration worktree C:\Users\ruchi\1-addic-wt\_int, detached between merges)
- BASE-READY: 2026-11-07 07:15 655516dc
- TRACKS-ALLOWED: CORE   # SCREENS is added when the lowest of the last three samples is at least 4.0 + 1.5 + 0.7 x (granted lanes + 1) GB, that is 8.3 GB with three lanes cut, 9.0 GB with four
- QUIET: no
- HOURS: T=06:25 IST | BASE-READY 07:15 | scouts 07:15-08:15 | lanes from about 08:00 tier 1 first | first slices about 09:45 | FREEZE 10:55 | QUIET 10:55-11:40 | TAG offline-v1.0 11:55 | hand-off 12:10 | HANDOVER by 12:25
- UPDATED: 2026-11-07 07:15 IST

## Chats

| Chat | Session | State | Context | Last step |
|---|---|---|---|---|
| HUB | 26196777 | RESTART — 2026-11-07 07:15 IST: BASE-READY reached by the first HUB session (26196777), which hands over at once because its… | 255k | 2026-11-07 07:15 IST |
| CORE |  | NEW — not started; the launcher starts this chat once status-HUB.md carries BASE-READY and TRACKS-ALLOWED names CORE |  | 2026-11-07 06:50 IST |
| SCREENS |  | NEW — not started; the launcher starts this chat once status-HUB.md carries BASE-READY and TRACKS-ALLOWED names SCREENS (when… |  | 2026-11-07 06:50 IST |

## Lanes (10)

| Lane | Chat | Tier | Flagged | Slot | State | Note |
|---|---|---|---|---|---|---|
| `core` | CORE | 1 | yes | slot 1 | NEW | GRANTED 2026-11-07 07:15 (tier 1, flagged; cut from BASE 655516dc once its scout has written the brief); tier 1, flagged (encryption, the person's data); slice… |
| `engine` | CORE | 1 |  | slot 2 | NEW | GRANTED 2026-11-07 07:15 (tier 1; depends only on the content files and the contracts); tier 1; slice U-05; files offline/src/engine.js, tests/logic.test.mjs… |
| `actions-sos` | CORE | 1 | yes | slot 3 | NEW | GRANTED 2026-11-07 07:15 (tier 1, flagged; on the Store contract until core's U-04 merges); tier 1, flagged (safety copy); slice U-09; files… |
| `learn` | CORE | 1 |  | slot 4 | NEW | GRANTED 2026-11-07 07:15 (tier 1; cut after the three above; on the UI contract until core's U-03 merges); tier 1; slice U-12; files… |
| `tests-docs` | CORE | 1 |  | - | NEW | tier 1 harness and docs, tier 2 screenshots and Part 3; slice U-34 (needs U-01 merged); files offline/tests/browser.test.mjs, tests/screens.mjs… |
| `today-track` | SCREENS | 1 |  | - | NEW | tier 1 (U-15, U-16) then tier 2; slice U-15; files offline/src/ui-today.js, src/ui-track.js, src/ui-harbor.js |
| `workbook-settings` | SCREENS | 1 |  | - | NEW | tier 1 (U-19, U-20a) then tier 2; slice U-19; files offline/src/ui-settings.js, src/ui-workbook.js, src/ui-plan.js |
| `actions` | SCREENS | 2 |  | - | NEW | tier 2; slice U-22; files offline/src/ui-actions.js, src/ui-practices.js; starts only when no tier 1 lane waits for a slot |
| `game-tutorials` | SCREENS | 2 |  | - | NEW | tier 2; slice U-27; files offline/src/ui-game.js, src/ui-guidance.js, src/ui-tools.js; starts only when no tier 1 lane waits for a slot |
| `content` | SCREENS | 1 |  | - | NEW | tier 1 (U-31a) then tier 2; slice U-31a; files offline/src/content-lessons-b.js, content-lessons-c.js, content-exercises.js, content-practices.js… |

Slots allowed: 4 (the lowest of the last three samples, 8.7 GB: (8.7 - 4.0 floor - 1.5 for the CORE chat) / 0.7 = 4; re-sampled every ten minutes in lane-widening.md; under 4.0 GB free the newest lane pauses at its next commit). Granted: 4 lanes (`core` slot 1, `engine` slot 2, `actions-sos` slot 3, `learn` slot 4).

## Merges

(none yet; the queue is empty)

## Blockers and questions

- Memory is shared with the pharma program: samples 6.0 GB (06:26), 9.9 (06:42), 8.7 (06:52), 11.3 (06:58). Slots from the lowest of the last three. SCREENS waits for about 8.3–9.0 GB free.
- The planner chat (session e4492b2a) is at 522k context: not a track of this program; the owner may close it.

## Machine

- Free memory 5.7 GB of 31.8 GB at 2026-11-07 07:11 IST; claude 21, node 54 processes; 2 slots by the rule; BASE-READY sample (lane-widening.md).
- The launcher loop: not running (`fresh_chat_launcher.py --start`); its last launch: none found.

## Files of the build

- Spec: docs/offline/BUILD-PLAN.md · Plan: docs/offline/build-2026-11-07/PLAN.md · Prompts: KICKOFF-PROMPTS.md · Status: coordination/status-HUB.md, status-CORE.md, status-SCREENS.md · Decisions: PLAN.md section 9, outbox-OWNER.md · Tools and the owner's lines: tools/README.md · Trunk: build/offline-v1 (origin) · Worktrees: C:\Users\ruchi\1-addic-wt\
