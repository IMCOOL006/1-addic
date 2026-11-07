#!/usr/bin/env python3
"""hook_context_restart.py - PostToolUse and Stop hook of the 1-addic offline build: the 300k rule, told to the chat.

The context rule (START-OR-RESUME.md section 2): a main chat whose context passes 300,000 tokens finishes its step,
writes its run record ("Resume here") and its status file (STATE: RESTART) and stops; a fresh chat continues from
them. A chat cannot see its own context, so this hook reads it from the session's transcript (the last request's
input + cache read + cache write, as tools/context_now.py does) and tells the chat:

  PostToolUse  over 250,000: once, "soon" (finish the step, write the hand-off notes early);
               over 300,000: "now" (at the next safe point write the run record and the status with
               STATE: RESTART, then stop; the launcher starts the fresh chat), repeated every 25 tool calls.
  Stop         over 300,000 and the chat's status file (coordination/status-<TRACK>.md) does not yet say RESTART or
               HANDOVER with an UPDATED time at or after the first "now": the stop is refused ONCE per session with
               the same instruction, so the hand-over is written before the chat idles. A second stop always passes
               (no loop); a stop that a hook already continued (stop_hook_active) passes at once. A chat whose track
               (HUB, CORE or SCREENS, by tools/token_roles.json or its kickoff line) is unknown is told through a
               systemMessage and never blocked: nothing would relaunch it.

Silent otherwise. Never for a sub-agent's transcript (its context is capped by its agent type). FAILS OPEN: every
internal failure exits 0 with nothing printed (on Stop an exit 2 would block). State per session under
%LOCALAPPDATA%\\1-addic-hub\\context\\ (ADDIC_HUB_HOME overrides the base).

The rows for .claude/settings.json (the owner adds them; the bootstrap of the method's existing rows), one under
"PostToolUse" and one under "Stop":
  {"hooks": [{"type": "command", "command": "python", "args": ["-c",
    "import os,runpy,sys;p=sys.argv[1];sys.argv=[p]+sys.argv[2:];runpy.run_path(p,run_name=\\"__main__\\") if os.path.isfile(p) else sys.stderr.write(\\"hook bootstrap: WARN missing \\"+p+chr(10))",
    "${CLAUDE_PROJECT_DIR}/docs/offline/build-2026-11-07/tools/hook_context_restart.py"], "timeout": 10, "statusMessage": "1-addic: context rule"}]}

    python docs/offline/build-2026-11-07/tools/hook_context_restart.py --self-test
    python docs/offline/build-2026-11-07/tools/hook_context_restart.py --status [<session id prefix>]
"""
from __future__ import annotations

import argparse
import datetime
import io
import json
import os
import re
import sys
import tempfile

TOOLS = os.path.dirname(os.path.abspath(__file__))
BP = os.path.dirname(TOOLS)              # docs/offline/build-2026-11-07
LIMIT, SOON = 300_000, 250_000
REPEAT_EVERY = 25            # "now" again after this many tool calls
TAIL_BYTES = 512 * 1024
HEAD_BYTES = 300 * 1024
HEADER_MAX = 300
TRACKS = ("HUB", "CORE", "SCREENS")
STOPPING = re.compile(r"\b(RESTART|HANDOVER|HAND-OVER)\b", re.I)
KICKOFF = re.compile(r"You are the (HUB|CORE|SCREENS) chat")
IST = datetime.timezone(datetime.timedelta(hours=5, minutes=30))

NOW_MSG = ("1-addic context rule: this chat's context is {ctx:,} tokens, over the 300,000 limit (the context rule, "
           "START-OR-RESUME.md section 2). At your next safe point (nothing of yours running, no merge or lane half "
           "done): write your RUN-RECORD.md \"Resume here\" and your status file with STATE: RESTART and UPDATED from "
           "`date`, then stop. The launcher (docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py, every two "
           "minutes) starts your fresh chat from your kickoff prompt and the resume line: do not start one yourself, "
           "and do not take on new work after the hand-over.")
SOON_MSG = ("1-addic context rule: this chat's context is {ctx:,} tokens, over 250,000: plan the hand-over now (finish "
            "the step you are in, write your run record early). At 300,000 you write STATE: RESTART in your status "
            "file and stop; the launcher starts your fresh chat.")


def home():
    base = os.environ.get("ADDIC_HUB_HOME") or os.path.join(os.environ.get("LOCALAPPDATA", os.path.expanduser("~")), "1-addic-hub")
    d = os.path.join(base, "context")
    os.makedirs(d, exist_ok=True)
    return d


def last_usage(path):
    """(context tokens, timestamp) of the last request in the transcript's tail, or None."""
    size = os.path.getsize(path)
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
        return ((u.get("input_tokens") or 0) + (u.get("cache_read_input_tokens") or 0)
                + (u.get("cache_creation_input_tokens") or 0)), e.get("timestamp") or ""
    return None


def track_of(sid, path, bp=BP):
    """The chat's track: tools/token_roles.json by the id's first 8 characters, else the kickoff line."""
    try:
        roles = json.load(io.open(os.path.join(bp, "tools", "token_roles.json"), encoding="utf-8"))
        r = roles.get(sid[:8])
        role = r.get("role") if isinstance(r, dict) else None
        if role in TRACKS:
            return role
    except Exception:
        pass
    try:
        with io.open(path, "rb") as fh:
            m = KICKOFF.search(fh.read(HEAD_BYTES).decode("utf-8", errors="replace"))
        return m.group(1) if m else None
    except Exception:
        return None


def status_header(track, bp=BP):
    """STATE and UPDATED from the status file's header (every line before the first line starting with '# ')."""
    try:
        text = io.open(os.path.join(bp, "coordination", "status-%s.md" % track), encoding="utf-8-sig", errors="replace").read()
    except Exception:
        return {}
    h = {}
    for ln in text.splitlines()[:HEADER_MAX]:
        if ln.startswith("# "):
            break
        k, _, v = ln.partition(":")
        k = k.strip()
        if k in ("STATE", "UPDATED") and k not in h:
            h[k] = v.strip()
    return h


def handed_over(track, since_iso, bp=BP):
    """True when the track's status says RESTART/HANDOVER with an UPDATED time at or after `since_iso` (IST)."""
    h = status_header(track, bp)
    if not STOPPING.search(h.get("STATE", "").split("#")[0]):
        return False
    try:
        upd = datetime.datetime.strptime(h.get("UPDATED", "")[:16], "%Y-%m-%d %H:%M").replace(tzinfo=IST)
        since = datetime.datetime.fromisoformat(since_iso).astimezone(IST) - datetime.timedelta(minutes=5)
        return upd >= since
    except Exception:
        return True


def load_state(sid):
    p = os.path.join(home(), re.sub(r"[^A-Za-z0-9_-]", "", sid)[:64] + ".json")
    try:
        return p, json.load(io.open(p, encoding="utf-8"))
    except Exception:
        return p, {}


def save_state(p, st):
    tmp = p + ".tmp"
    with io.open(tmp, "w", encoding="utf-8") as fh:
        json.dump(st, fh)
    os.replace(tmp, p)


def handle(stdin_text, bp=BP, now=None):
    """-> (stdout text, exit code). Pure apart from the state file under home()."""
    try:
        payload = json.loads(stdin_text) if stdin_text.strip() else {}
    except Exception:
        return "", 0
    if not isinstance(payload, dict):
        return "", 0
    event = payload.get("hook_event_name") or ""
    tp = str(payload.get("transcript_path") or "")
    sid = str(payload.get("session_id") or "")
    if not tp or not sid or not os.path.isfile(tp):
        return "", 0
    if "/subagents/" in "/" + tp.replace("\\", "/") or payload.get("agent_id") or payload.get("agent_type"):
        return "", 0
    u = last_usage(tp)
    if not u:
        return "", 0
    ctx = u[0]
    if ctx < SOON:
        return "", 0
    now = now or datetime.datetime.now(IST).isoformat()
    sp, st = load_state(sid)
    st["last_ctx"] = ctx
    if event == "PostToolUse":
        out = ""
        if ctx >= LIMIT:
            st["calls"] = int(st.get("calls") or 0) + 1
            if not st.get("told_now_at") or st["calls"] >= REPEAT_EVERY:
                st["calls"] = 0
                st["told_now_at"] = st.get("told_now_at") or now
                st["told_now_last"] = now
                out = json.dumps({"hookSpecificOutput": {"hookEventName": "PostToolUse",
                                                         "additionalContext": NOW_MSG.format(ctx=ctx)}})
        elif not st.get("told_soon"):
            st["told_soon"] = True
            out = json.dumps({"hookSpecificOutput": {"hookEventName": "PostToolUse",
                                                     "additionalContext": SOON_MSG.format(ctx=ctx)}})
        save_state(sp, st)
        return out, 0
    if event == "Stop":
        if payload.get("stop_hook_active") or ctx < LIMIT:
            save_state(sp, st)
            return "", 0
        track = st.get("track") or track_of(sid, tp, bp)
        st["track"] = track
        if track in TRACKS and handed_over(track, st.get("told_now_at") or now, bp):
            save_state(sp, st)
            return "", 0
        if int(st.get("blocks") or 0) >= 1:
            save_state(sp, st)
            return "", 0
        st["blocks"] = 1
        st["told_now_at"] = st.get("told_now_at") or now
        save_state(sp, st)
        if track in TRACKS:
            return json.dumps({"decision": "block", "reason": NOW_MSG.format(ctx=ctx)}), 0
        return json.dumps({"systemMessage": NOW_MSG.format(ctx=ctx)}), 0
    save_state(sp, st)
    return "", 0


def status(prefix=""):
    d = home()
    rows = []
    for f in sorted(os.listdir(d)):
        if f.endswith(".json") and f.startswith(prefix):
            try:
                st = json.load(io.open(os.path.join(d, f), encoding="utf-8"))
            except Exception:
                continue
            rows.append("%s | track %s | last context %s | soon told %s | now told %s (last %s) | stop refused %s" % (
                f[:8], st.get("track") or "?", "{:,}".format(st.get("last_ctx") or 0), bool(st.get("told_soon")),
                (st.get("told_now_at") or "-")[:16], (st.get("told_now_last") or "-")[:16], st.get("blocks") or 0))
    print("\n".join(rows) if rows else "no session over 250,000 seen by the hook yet")


def self_test():
    checks = []
    tmp = tempfile.mkdtemp(prefix="addic-ctx-")
    os.environ["ADDIC_HUB_HOME"] = tmp
    bp = os.path.join(tmp, "bp")
    os.makedirs(os.path.join(bp, "coordination"))
    os.makedirs(os.path.join(bp, "tools"))
    io.open(os.path.join(bp, "tools", "token_roles.json"), "w", encoding="utf-8").write(
        json.dumps({"_readme": "x", "abcdef12": {"role": "CORE", "label": "t"}}))
    io.open(os.path.join(bp, "coordination", "status-CORE.md"), "w", encoding="utf-8").write(
        "TRACK: CORE\nSTATE: BUILDING\nLANE: core BUILDING\nUPDATED: 2026-11-07 10:00 IST\n\n# Notes\nSTATE: RESTART\n")

    def transcript(ctx, name="t.jsonl"):
        p = os.path.join(tmp, name)
        with io.open(p, "w", encoding="utf-8") as fh:
            fh.write(json.dumps({"type": "user", "message": {"content": "ultracode. You are the SCREENS chat of the 1-addic offline build"}, "timestamp": "2026-11-07T03:00:00Z"}) + "\n")
            fh.write(json.dumps({"type": "assistant", "message": {"usage": {"input_tokens": 10, "cache_read_input_tokens": ctx - 20, "cache_creation_input_tokens": 10}}, "timestamp": "2026-11-07T03:30:00Z"}) + "\n")
        return p

    def call(event, ctx, sid="abcdef12-0000", extra=None, name="t.jsonl"):
        p = transcript(ctx, name)
        d = {"hook_event_name": event, "session_id": sid, "transcript_path": p}
        d.update(extra or {})
        return handle(json.dumps(d), bp=bp, now="2026-11-07T14:00:00+05:30")

    checks.append(("malformed stdin -> silent exit 0", handle("{not json", bp=bp) == ("", 0)))
    checks.append(("empty stdin -> silent", handle("", bp=bp) == ("", 0)))
    checks.append(("a missing transcript -> silent", handle(json.dumps({"hook_event_name": "Stop", "session_id": "x", "transcript_path": os.path.join(tmp, "none.jsonl")}), bp=bp) == ("", 0)))
    checks.append(("under 250k -> silent", call("PostToolUse", 200_000) == ("", 0)))
    o, c = call("PostToolUse", 260_000)
    checks.append(("over 250k -> one 'soon' additionalContext", c == 0 and "over 250,000" in json.loads(o)["hookSpecificOutput"]["additionalContext"]
                   and json.loads(o)["hookSpecificOutput"]["hookEventName"] == "PostToolUse"))
    checks.append(("'soon' told once only", call("PostToolUse", 270_000) == ("", 0)))
    o, c = call("PostToolUse", 310_000)
    msg = json.loads(o)["hookSpecificOutput"]["additionalContext"] if o else ""
    checks.append(("over 300k -> 'now' with the count, as the 1-addic context rule", c == 0 and "310,000 tokens, over the 300,000 limit" in msg
                   and msg.startswith("1-addic context rule") and "every two minutes" in msg))
    quiet = all(call("PostToolUse", 312_000) == ("", 0) for _ in range(REPEAT_EVERY - 1))
    o, c = call("PostToolUse", 313_000)
    checks.append(("'now' repeats after %d tool calls, silent between" % REPEAT_EVERY, quiet and o != ""))
    checks.append(("a sub-agent transcript -> silent", call("PostToolUse", 400_000, extra={"transcript_path": os.path.join(tmp, "subagents", "agent-1.jsonl")}) == ("", 0)))
    os.makedirs(os.path.join(tmp, "s1", "subagents"), exist_ok=True)
    checks.append(("a sub-agent (agent_id in the payload) -> silent", call("Stop", 400_000, sid="88888888-1", extra={"agent_id": "a1"}) == ("", 0)))
    checks.append(("Stop under 300k -> passes", call("Stop", 280_000, sid="22222222-1") == ("", 0)))
    o, c = call("Stop", 320_000)
    checks.append(("Stop over 300k, no hand-over -> refused once (decision block)", c == 0 and json.loads(o).get("decision") == "block" and "STATE: RESTART" in json.loads(o)["reason"]))
    checks.append(("the second Stop passes (no loop)", call("Stop", 321_000) == ("", 0)))
    checks.append(("stop_hook_active -> passes at once", call("Stop", 330_000, sid="33333333-1", extra={"stop_hook_active": True}) == ("", 0)))
    o, c = call("Stop", 335_000, sid="abcdef12-0009")
    checks.append(("a RESTART only below the header (a dated section) is not a hand-over -> refused once", bool(o) and json.loads(o).get("decision") == "block"))
    io.open(os.path.join(bp, "coordination", "status-CORE.md"), "w", encoding="utf-8").write("TRACK: CORE\nSTATE: RESTART   # hand-over\nUPDATED: 2026-11-07 14:10 IST\n")
    checks.append(("hand-over written after the warning -> Stop passes", call("Stop", 340_000, sid="abcdef12-0001") == ("", 0)))
    io.open(os.path.join(bp, "coordination", "status-CORE.md"), "w", encoding="utf-8").write("TRACK: CORE\nSTATE: RESTART\nUPDATED: 2026-11-06 09:00 IST\n")
    o, c = call("Stop", 340_000, sid="abcdef12-0002")
    checks.append(("a stale RESTART (UPDATED before the warning) -> still refused once", json.loads(o).get("decision") == "block" if o else False))
    io.open(os.path.join(bp, "coordination", "status-CORE.md"), "w", encoding="utf-8").write("TRACK: CORE\nSTATE: BUILDING   # SCREENS RESTART noted\nUPDATED: 2026-11-07 14:10 IST\n")
    o, c = call("Stop", 340_000, sid="abcdef12-0003")
    checks.append(("RESTART only in the STATE's comment is not a hand-over -> refused once", json.loads(o).get("decision") == "block" if o else False))
    o, c = call("Stop", 340_000, sid="66666666-1", name="u.jsonl")
    checks.append(("an id not in token_roles.json with a kickoff line -> its track (SCREENS) -> block",
                   (json.loads(o).get("decision") == "block" if o else False) and track_of("66666666-1", os.path.join(tmp, "u.jsonl"), bp) == "SCREENS"))
    p = os.path.join(tmp, "v.jsonl")
    with io.open(p, "w", encoding="utf-8") as fh:
        fh.write(json.dumps({"type": "user", "message": {"content": "hello"}, "timestamp": "2026-11-07T03:00:00Z"}) + "\n")
        fh.write(json.dumps({"type": "assistant", "message": {"usage": {"input_tokens": 350_000}}, "timestamp": "2026-11-07T03:30:00Z"}) + "\n")
    o, c = handle(json.dumps({"hook_event_name": "Stop", "session_id": "77777777-1", "transcript_path": p}), bp=bp)
    checks.append(("no track at all (the planner) -> systemMessage, never a block", c == 0 and "systemMessage" in json.loads(o) and "decision" not in json.loads(o)))
    checks.append(("state under ADDIC_HUB_HOME (the real one untouched by the test)", home().startswith(tmp) and len(os.listdir(home())) >= 5))
    checks.append(("the settings row in the docstring names this file's path in the repo",
                   "${CLAUDE_PROJECT_DIR}/docs/offline/build-2026-11-07/tools/hook_context_restart.py" in __doc__
                   and os.path.abspath(__file__).replace("\\", "/").endswith("docs/offline/build-2026-11-07/tools/hook_context_restart.py")))
    ok = sum(1 for _, r in checks if r)
    for name, r in checks:
        print("%s %s" % ("ok  " if r else "FAIL", name))
    print("%d/%d checks pass" % (ok, len(checks)))
    return 0 if ok == len(checks) else 1


def main(argv=None):
    ap = argparse.ArgumentParser(prog="hook_context_restart.py", description=__doc__.split("\n")[0])
    ap.add_argument("--self-test", action="store_true")
    ap.add_argument("--status", nargs="?", const="", default=None, metavar="SESSION-PREFIX")
    a = ap.parse_args(argv)
    if a.self_test:
        return self_test()
    if a.status is not None:
        status(a.status)
        return 0
    try:
        text = sys.stdin.buffer.read().decode("utf-8-sig", "replace")
    except Exception:
        text = ""
    try:
        out, code = handle(text)
    except Exception:
        return 0
    if out:
        try:
            sys.stdout.write(out)
            sys.stdout.flush()
        except Exception:
            pass
    return code


if __name__ == "__main__":
    try:
        sys.exit(main())
    except SystemExit:
        raise
    except Exception:
        sys.exit(0)
