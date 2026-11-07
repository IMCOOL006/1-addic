TRACK: HUB
STATE: RESTART   # 2026-11-07 07:15 IST: BASE-READY reached by the first HUB session (26196777), which hands over at once because its context passed the 250k mark during S-00; the fresh HUB starts from KICKOFF-PROMPTS.md Prompt 0 plus the resume line and runs the loop (slots, merges, the board, the freeze, the quiet window, the tag, the hand-off)
BASE-READY: 2026-11-07 07:15 655516dc
BASE: 655516dc (the trunk build/offline-v1 at BASE-READY: offline-plan's 1acf406 plus the two S-00 commits; base worktree C:\Users\ruchi\1-addic-wt\_base, read-only; integration worktree C:\Users\ruchi\1-addic-wt\_int, detached between merges)
SLOTS-ALLOWED: 4 (the lowest of the last three samples, 8.7 GB: (8.7 - 4.0 floor - 1.5 for the CORE chat) / 0.7 = 4; re-sampled every ten minutes in lane-widening.md; under 4.0 GB free the newest lane pauses at its next commit)
TRACKS-ALLOWED: CORE   # SCREENS is added when the lowest of the last three samples is at least 4.0 + 1.5 + 0.7 x (granted lanes + 1) GB, that is 8.3 GB with three lanes cut, 9.0 GB with four
SLOTS: core slot=1 granted 2026-11-07 07:15 (tier 1, flagged; cut from BASE 655516dc once its scout has written the brief)
SLOTS: engine slot=2 granted 2026-11-07 07:15 (tier 1; depends only on the content files and the contracts)
SLOTS: actions-sos slot=3 granted 2026-11-07 07:15 (tier 1, flagged; on the Store contract until core's U-04 merges)
SLOTS: learn slot=4 granted 2026-11-07 07:15 (tier 1; cut after the three above; on the UI contract until core's U-03 merges)
QUIET: no
HOURS: T=06:25 IST | BASE-READY 07:15 | scouts 07:15-08:15 | lanes from about 08:00 tier 1 first | first slices about 09:45 | FREEZE 10:55 | QUIET 10:55-11:40 | TAG offline-v1.0 11:55 | hand-off 12:10 | HANDOVER by 12:25
UPDATED: 2026-11-07 07:15 IST

# 2026-11-07 07:15 · BASE-READY, and the first HUB's hand-over (session 26196777, interactive window, 06:25-07:15)

**Done.** S-00: PLAN.md, KICKOFF-PROMPTS.md (Prompt 0 HUB, 1 CORE, 2 SCREENS), the five agent types in .claude/agents/, the coordination files, tracks/*/RUN-RECORD.md, and the tooling (tracks/HUB/workflows/lane.js + lane_args.json + cut_lane.py + wf_sim.mjs + merge_lane.py; tools/gates.py, check_territory.py, hub_commit.py, fresh_chat_launcher.py, context_now.py, hook_context_restart.py, board.py, token_roles.json, README.md; coordination/territory.json). Every self-test green at 07:09: wf_sim dry run reaches Check with no agent launched; gates 18/18; merge_lane 26/26; check_territory 13/13; launcher 49/49 and `--once --dry-run` decides per track; hook 22/22; board --check parses 3 chats and 10 lanes. S-01: trunk pushed to origin (06:51, again at 07:15); `_base` and `_int` worktrees at 655516dc; this header.

**For the fresh HUB, the facts not to rediscover.**
- Merge commits: `merge_lane.py commit` requires the subject to start with `merge(offline): ` and the two trailers. `prepare` cuts `int/<lane>-<tip7>` from the CURRENT trunk tip (docs commits included) and requires `<base>` to be an ancestor of the trunk; `finish --hub --push` folds docs-only trunk commits into the int branch first, then fast-forwards the main folder and pushes trunk and lane branch. The guards step rebuilds `offline/1-addic.html` and stages it into the merge.
- Territory: `package.json` is an ERROR for every lane but core and tests-docs; engine's U-08 (`npm test` wiring in `scripts`) needs a go-ahead from tests-docs by outbox (CORE's own two lanes: the CORE chat arranges it). `offline/tests/guards.mjs` belongs to nobody (a WARNING the lane report explains; tests-docs is the natural owner). `docs/offline/` is protected (the HUB's).
- Guards: the tutorial `data-tour` target check goes RED by name as soon as a `ui-*.js` exists while the screens that carry the targets are not built; baseline those names in baselines.md as "expected until the screens land" rather than sending them back.
- The launcher's parser: `BASE-READY:` must start with its time (done); `TRACKS-ALLOWED:` counts only uppercase track names outside parentheses and `#` comments; Prompt 0 has no `ultracode` on purpose (decision Q10: the HUB runs no Workflow itself) and the launcher recognises a block by `You are the <TRACK> chat`.
- The owner's pending actions at 07:15: add the two settings rows (tools/README.md) to .claude/settings.json; start the launcher with `python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --start` (its state folder %LOCALAPPDATA%\1-addic-hub\launcher\ exists from the dry runs). Until it runs, no chat starts by itself: the owner may open the chats by hand (CORE: `claude --model claude-opus-5-5 --name CORE` in C:\Users\ruchi\1-addic with Prompt 1; the HUB: `claude --model claude-fable-5-1 --effort high --name HUB` with Prompt 0 plus the resume line).
- The planner chat (session e4492b2a, the owner's interactive window) was at 522k context at 07:00: not this program's track; the owner may want to close it.
- Decisions O1–O9 and Q10–Q13 take their defaults at 08:25 unless outbox-OWNER.md carries an answer.
- Nothing of the HUB's runs detached. No merge in flight. MERGE-QUEUE empty.
