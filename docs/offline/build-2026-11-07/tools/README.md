# tools · the 1-addic offline build (7 November 2026)

Adapted from the Kriya build program's tools. Run from `C:\Users\ruchi\1-addic`. State and log: `%LOCALAPPDATA%\1-addic-hub\` (never Kriya's `kriya-hub`).

- `fresh_chat_launcher.py`: a fresh HUB, CORE or SCREENS chat on HAND-OVER or NO CHAT. CORE and SCREENS wait for `BASE-READY:` and a `TRACKS-ALLOWED:` line naming them on status-HUB.md. Nothing launches under 4.0 GB free. Every 10 minutes the loop appends a memory row to lane-widening.md.
  `python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --once --dry-run` (also `--self-test`, `--mem`, `--launch-missing`, `--pause-track <T>`, `--resume-track <T>`, `--restart`)
- `context_now.py`: every main chat's context, read from its transcript (RESTART over 300k, "soon" over 250k).
  `python docs/offline/build-2026-11-07/tools/context_now.py`
- `hook_context_restart.py`: the PostToolUse and Stop hook. It says "soon" once at 250k and "now" at 300k, and refuses one Stop until `STATE: RESTART` is written. It fails open and never runs for sub-agents.
  `python docs/offline/build-2026-11-07/tools/hook_context_restart.py --self-test` (also `--status`)
- `board.py`: writes coordination/SPRINT-BOARD.md from the status files, lane_args.json, context_now.py, launcher.log, lane-widening.md and board-notes.md.
  `python docs/offline/build-2026-11-07/tools/board.py` (`--check` prints and writes nothing)
- `token_roles.json`: session id (8 characters) to track and label. The launcher adds every chat it starts. Add a window opened by hand here too.

## The owner's lines

```
python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --start
python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --status
python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --pause "<why>"
python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --resume
python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --stop
```

After a machine restart: `--start`, then `--launch-missing`. After the launcher is edited: `--restart`. Nothing starts the loop at logon: there is no scheduled task and no Startup entry.

## The two settings rows (the owner adds them to `.claude/settings.json`)

Inside `"hooks"`, the same row goes once under `"PostToolUse"` and once under `"Stop"`:

```json
"PostToolUse": [{"hooks": [{"type": "command", "command": "python", "args": ["-c", "import os,runpy,sys;p=sys.argv[1];sys.argv=[p]+sys.argv[2:];runpy.run_path(p,run_name=\"__main__\") if os.path.isfile(p) else sys.stderr.write(\"hook bootstrap: WARN missing \"+p+chr(10))", "${CLAUDE_PROJECT_DIR}/docs/offline/build-2026-11-07/tools/hook_context_restart.py"], "timeout": 10, "statusMessage": "1-addic: context rule"}]}],
"Stop": [{"hooks": [{"type": "command", "command": "python", "args": ["-c", "import os,runpy,sys;p=sys.argv[1];sys.argv=[p]+sys.argv[2:];runpy.run_path(p,run_name=\"__main__\") if os.path.isfile(p) else sys.stderr.write(\"hook bootstrap: WARN missing \"+p+chr(10))", "${CLAUDE_PROJECT_DIR}/docs/offline/build-2026-11-07/tools/hook_context_restart.py"], "timeout": 10, "statusMessage": "1-addic: context rule"}]}]
```
