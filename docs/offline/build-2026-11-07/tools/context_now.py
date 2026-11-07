"""context_now.py - the current context of every main chat of the 1-addic offline build, read from the transcripts
(one cheap step, no edits).

  python docs/offline/build-2026-11-07/tools/context_now.py [--hours N] [--all]

The context rule (START-OR-RESUME.md section 2): a main chat whose context passes 300,000 tokens finishes its step,
writes its run record and status, and restarts with the resume line. A chat cannot see its own context size, so this
prints it: for every main-chat transcript under ~/.claude-pro/projects/C--Users-ruchi-1-addic (or
~/.claude/projects/C--Users-ruchi-1-addic when the first does not exist) active in the last N hours (default 24;
never the sub-agents', which live in subfolders), the last request's usage - input + cache read + cache write, which
is what the next step re-sends - with the chat's name from tools/token_roles.json (a chat not listed there is named by
its kickoff line, `You are the <TRACK> chat`, when its transcript's head has one), largest first, marked RESTART over
300,000 and "soon" over 250,000. Only the tail (and, for an unlisted chat, the head) of each file is read.
"""
import argparse
import datetime
import io
import json
import os
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
_PRO = Path(os.path.expanduser("~/.claude-pro/projects/C--Users-ruchi-1-addic"))
_STD = Path(os.path.expanduser("~/.claude/projects/C--Users-ruchi-1-addic"))
ROOT = _PRO if _PRO.is_dir() or not _STD.is_dir() else _STD
LIMIT, SOON = 300_000, 250_000
TAIL_BYTES = 512 * 1024
HEAD_BYTES = 300 * 1024
KICKOFF = re.compile(r"You are the (HUB|CORE|SCREENS) chat")
IST = datetime.timezone(datetime.timedelta(hours=5, minutes=30))


def roles():
    try:
        r = json.load(io.open(HERE / "token_roles.json", encoding="utf-8"))
        return r if isinstance(r, dict) else {}
    except Exception:
        return {}


def last_usage(path):
    """(context tokens, timestamp, model) of the last request in the file's tail, or None."""
    size = path.stat().st_size
    with io.open(path, "rb") as fh:
        fh.seek(max(0, size - TAIL_BYTES))
        chunk = fh.read().decode("utf-8", errors="replace")
    for ln in reversed(chunk.splitlines()):
        if '"usage"' not in ln:
            continue
        try:
            e = json.loads(ln)
        except Exception:
            continue
        m = e.get("message") or {}
        u = m.get("usage")
        if e.get("type") != "assistant" or not u:
            continue
        ctx = (u.get("input_tokens") or 0) + (u.get("cache_read_input_tokens") or 0) + (u.get("cache_creation_input_tokens") or 0)
        return ctx, e.get("timestamp") or "", m.get("model") or ""
    return None


def head_track(path):
    """The track named by the kickoff line in the transcript's head, or None."""
    try:
        with io.open(path, "rb") as fh:
            m = KICKOFF.search(fh.read(HEAD_BYTES).decode("utf-8", errors="replace"))
        return m.group(1) if m else None
    except Exception:
        return None


def main():
    ap = argparse.ArgumentParser(description="the current context of every main chat")
    ap.add_argument("--hours", type=float, default=24, help="chats active in the last N hours (default 24)")
    ap.add_argument("--all", action="store_true", help="every chat, however old")
    a = ap.parse_args()
    try:
        if sys.stdout:
            sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
    except Exception:
        pass
    now = datetime.datetime.now(datetime.timezone.utc).timestamp()
    rl = roles()
    rows = []
    for p in ROOT.glob("*.jsonl"):
        mtime = p.stat().st_mtime
        if not a.all and (now - mtime) / 3600 > a.hours:
            continue
        r = last_usage(p)
        if not r:
            continue
        ctx, ts, model = r
        info = rl.get(p.stem[:8])
        if not isinstance(info, dict):
            info = {}
        role, label = info.get("role"), info.get("label")
        if not role:
            t = head_track(p)
            role, label = (t, "not in token_roles.json yet (kickoff line: %s)" % t) if t else ("?", "not in token_roles.json yet")
        rows.append((ctx, p.stem[:8], role, label or "", ts, model, mtime))
    if not rows:
        print("no main chat active in the last %g hours (%s)" % (a.hours, ROOT))
        return 0
    rows.sort(key=lambda r: -r[0])
    newest = max(rows, key=lambda r: r[6])[1]
    print("| Chat | Context now | Last step (IST) | Model | Rule |")
    print("|---|---|---|---|---|")
    for ctx, sid, role, label, ts, model, mtime in rows:
        try:
            when = datetime.datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone(IST).strftime("%d %b %H:%M")
        except Exception:
            when = ts[:16]
        flag = "RESTART (over 300k)" if ctx >= LIMIT else ("soon (over 250k)" if ctx >= SOON else "ok")
        me = "; this chat, probably" if sid == newest else ""
        print("| %s: %s (%s) | %s | %s | %s | %s%s |" % (role, label, sid, "{:,}".format(ctx), when, model.replace("claude-", ""), flag, me))
    print("")
    print("The context rule (START-OR-RESUME.md section 2): a main chat over 300,000 finishes its step, writes its run record and status, and restarts with the resume line.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
