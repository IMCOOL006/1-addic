#!/usr/bin/env python3
"""hub_commit.py - commit program files in the shared main folder by explicit path, safely beside other chats.

    python docs/offline/build-2026-11-07/tools/hub_commit.py --track CORE --session <session link or id> \
        -m "docs(CORE, 2026-11-07): the engine brief and contract" <path> [<path> ...]

Why: several chats commit into the same working tree (C:\\Users\\ruchi\\1-addic, trunk build/offline-v1). A plain
`git commit` sweeps in whatever another chat has staged, and `git add -A` sweeps in its half-written files. This
script stages only the paths named and commits only those paths (`git commit -F <msg> -- <paths>`), with the two
trailers the rules require, and retries when another chat holds index.lock. It never pushes, never touches a lane
worktree, never adds a path outside docs/offline/build-2026-11-07/ or .claude/agents/ unless --allow-any is given
(the HUB uses that for the merge commits' companions such as offline/ files; a build chat never needs it).

Exit codes: 0 committed (prints the sha), 1 nothing to commit / refused, 2 bad arguments or git failure.
"""
from __future__ import annotations

import argparse
import os
import subprocess
import sys
import tempfile
import time

ROOT = os.environ.get("ADDIC_ROOT", r"C:\Users\ruchi\1-addic")
ALLOWED = ("docs/offline/build-2026-11-07/", ".claude/agents/")
TRAILER_1 = "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
# By track: the model named on the co-author line when --coauthor is not given. A track not listed here keeps
# TRAILER_1. The HUB's entry goes in at the hand-over to the first HUB on claude-fable-5-2 (the owner's R-O-12,
# 2026-11-14); until then a chat on another model than the line names passes --coauthor "<model name>".
TRACK_COAUTHOR = {}


def git(args, check=True):
    for attempt in range(8):
        p = subprocess.run(["git", "-C", ROOT] + args, capture_output=True, text=True, encoding="utf-8", errors="replace")
        if p.returncode == 0 or "index.lock" not in (p.stderr or ""):
            if check and p.returncode != 0:
                sys.stderr.write(p.stderr)
                raise SystemExit(2)
            return p
        time.sleep(1.5 + attempt)
    sys.stderr.write("hub_commit: index.lock held for too long\n")
    raise SystemExit(2)


def main(argv=None):
    ap = argparse.ArgumentParser(description="commit program files by explicit path")
    ap.add_argument("--track", required=True, help="HUB, CORE or SCREENS (for the message check)")
    ap.add_argument("--session", required=True, help="the chat's session link or id, for the Claude-Session trailer")
    ap.add_argument("-m", "--message", required=True, help="the subject, e.g. 'docs(CORE, 2026-11-07): engine brief'")
    ap.add_argument("--body", default="", help="optional body text")
    ap.add_argument("--allow-any", action="store_true", help="allow paths outside the program folders (HUB only)")
    ap.add_argument("--coauthor", default="", help="the model that writes this commit, e.g. 'Claude Fable 5.2', when the track's line names another")
    ap.add_argument("paths", nargs="+")
    a = ap.parse_args(argv)
    rel = []
    for p in a.paths:
        q = os.path.relpath(os.path.abspath(os.path.join(ROOT, p)) if not os.path.isabs(p) else p, ROOT).replace("\\", "/")
        if q.startswith(".."):
            sys.stderr.write("hub_commit: %s is outside the repository\n" % p)
            return 2
        if not a.allow_any and not any(q == pre.rstrip('/') or q.startswith(pre) for pre in ALLOWED):
            sys.stderr.write("hub_commit: %s is outside the program folders (%s); the HUB may pass --allow-any\n" % (q, ", ".join(ALLOWED)))
            return 2
        rel.append(q)
    git(["add", "--"] + rel)
    st = git(["status", "--porcelain", "--"] + rel).stdout.strip()
    if not st:
        print("hub_commit: nothing to commit for the paths named")
        return 1
    session = a.session.strip()
    if not session.startswith("http"):
        session = "https://claude.ai/code/session_" + session if not session.startswith("session_") else "https://claude.ai/code/" + session
    coauthor = a.coauthor.strip() or TRACK_COAUTHOR.get(a.track.strip().upper(), "")
    if any(ch in coauthor for ch in "<>\r\n"):
        sys.stderr.write("hub_commit: --coauthor takes a model name only, e.g. 'Claude Fable 5.2'\n")
        return 2
    trailer_1 = "Co-Authored-By: %s <noreply@anthropic.com>" % coauthor if coauthor else TRAILER_1
    msg = a.message.strip() + "\n\n" + (a.body.strip() + "\n\n" if a.body.strip() else "") + trailer_1 + "\nClaude-Session: " + session + "\n"
    fd, mp = tempfile.mkstemp(prefix="hubmsg-", suffix=".txt", text=True)
    with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(msg)
    try:
        git(["commit", "-q", "-F", mp, "--"] + rel)
    finally:
        try:
            os.unlink(mp)
        except OSError:
            pass
    sha = git(["rev-parse", "--short=8", "HEAD"]).stdout.strip()
    print("committed %s (%s): %s" % (sha, a.track, a.message.strip()))
    return 0


if __name__ == "__main__":
    sys.exit(main())
