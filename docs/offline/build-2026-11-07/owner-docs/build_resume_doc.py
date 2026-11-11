#!/usr/bin/env python3
"""build_resume_doc.py - the owner's resume document (R-O-9 of 2026-11-08, R-O-10 of 2026-11-11), rendered from the
live state.

    python docs/offline/build-2026-11-07/owner-docs/build_resume_doc.py [--no-docx] [--out <dir>]

The document serves a park at any time: the day closed (R-O-10) or the weekly usage limit near 98% (R-O-9). Part A is
the owner's: the steps to resume, the prompt to paste, the items only the owner can answer. Part B is the hand-over:
where the build stopped, what remains, how the start works, how the program runs, the decisions in force.

What it reads, live, at render time (nothing is cached; every read that fails prints its reason in the document
instead of stopping the render):
  - the clock: the machine's local time (IST on the owner's machine; the zone is checked and named);
  - git in the main folder: the trunk tip, the branch name, origin's tip as last fetched (no fetch is run: no
    network), the tags `offline-v*` with their commits, dates and subjects, each lane branch's tip (for every lane the
    status files name), the count of uncommitted files, and whether offline/1-addic.html is the file at the latest tag;
  - the status files coordination/status-HUB.md, status-CORE.md, status-SCREENS.md: their STATE, LANE, BASE,
    MERGING, MERGE-QUEUE, SLOTS-ALLOWED, OWNER, RULING, UPDATED lines and the `MERGED:` lines (each line cut to about
    300 characters in the tables);
  - the first three lines of coordination/SPRINT-BOARD.md (STATE, NEEDS YOU, NEXT: the HUB's lines for the owner);
  - every `## R-O-<n> · <stamp> · <words>` heading of coordination/outbox-OWNER.md, quoted whole (the owner's
    decisions), and the next free R-O number;
  - the last "Resume here" heading and the last "Owner's window hand-over" heading of tracks/HUB/RUN-RECORD.md;
  - the launcher's status: `python <docs>/tools/fresh_chat_launcher.py --status` (it works when the loop is stopped
    too); the loop word, the paused tracks, the time of the last check and the last LOOP line of its log are read
    from that text; and whether the launcher's state folder still holds a loop.pid or a loop.stop file (the
    leftover pid file fault, FIX-LOOP-PID).
By hand, at each park: the PARK notes below (the reason, the timeline, the chats still listed, the memory note and
the leftover watch loops of this park); the NAMED, TOOLING and RULINGS lists when the work or the rulings change; and the template's section 3
(the owner's open items) when the items change. The fixed text is the two templates at the end of this file
(Markdown with ${PLACEHOLDERS}).

What it writes: <out>/1-addic-Resume-Prompt.md (default <out> = this folder, owner-docs/), <out>/1-addic-Resume-
Prompt.txt (the owner's-window prompt alone, as plain text, for the one-line way to resume), then <out>/1-addic-
Resume-Prompt.docx through the word-doc-generator skill's gen_docx.py, found at run time under
~/.claude*/skills/word-doc-generator/ (or the GEN_DOCX environment variable); if it is not found, the command to run
is printed and the exit code is 3. Standard library only; no network. Re-runnable: at a park the owner's window runs
the one command above, then commits the four files by path with tools/hub_commit.py and pushes.

A guard: the owner's-window prompt must hold no kickoff line of a track (the launcher counts a chat whose transcript
head holds one as that track's chat and then starts no fresh chat for the track). A prompt that holds one is not
written: exit code 4.

Exit codes: 0 every file written; 3 the .md and .txt written but no .docx (gen_docx.py missing or failed); 2 bad
arguments or the output folder not writable; 4 the guard above.
"""
from __future__ import annotations

import argparse
import datetime
import os
import re
import string
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent            # <docs>/owner-docs
DOCS = HERE.parent                                 # docs/offline/build-2026-11-07
ROOT = HERE.parents[3]                             # C:\Users\ruchi\1-addic (the main folder; trunk build/offline-v1)
CO = DOCS / "coordination"
TOOLS = DOCS / "tools"
LAUNCHER = TOOLS / "fresh_chat_launcher.py"
RUN_RECORD = DOCS / "tracks" / "HUB" / "RUN-RECORD.md"
BOARD = CO / "SPRINT-BOARD.md"
APP_FILE = "offline/1-addic.html"
MD_NAME = "1-addic-Resume-Prompt.md"
TXT_NAME = "1-addic-Resume-Prompt.txt"
DOCX_NAME = "1-addic-Resume-Prompt.docx"
NEXT_TAG = "offline-v3.3"
CELL = 300                                          # characters per table cell

# The launcher's own words, mirrored from tools/fresh_chat_launcher.py (STOPPING, TERMINAL, the build tracks' stop word,
# KICKOFF). They decide what the launcher does with a status word; the document's "what the launcher does" table and
# the prompt guard use them. If the launcher's constants change, change these.
L_STOPPING = re.compile(r"\b(RESTART|HANDOVER|HAND-OVER)\b", re.I)
L_TERMINAL = re.compile(r"^(COMPLETE|COMPLETED|CLOSED|PAUSED|STOPPED|STOP|END|WAITING-OWNER|DONE)\b", re.I)
L_BUILD_STOP = ("READY",)
L_KICKOFF = re.compile(r"You are the (HUB|CORE|SCREENS) chat")

# This park, by hand (edit at each park; everything else is read live). "day" is checked against the HUB's status file.
PARK = {
    "day": "2026-11-11",
    "date_long": "11 November 2026",
    "short": "the day closed, the owner's R-O-10",
    "next_window": "1-addic owner 12 Nov",
    "reason": ("the owner closed the day. R-O-10, 21:00 IST: \"We are going to resume work tomorrow, prepare complete "
               "handover details. Then give me a resume prompt and steps in a word doc.\""),
    "timeline": [
        ("21:00", "The owner's line arrives in the owner's window."),
        ("21:07", "Filed as R-O-10 in coordination/outbox-OWNER.md (commits d74d521 and 084924c), pushed."),
        ("21:09", "The launcher loop is stopped on the owner's word (`--stop`, pid 39876, 21:09:45). No fresh chat can "
                  "start overnight."),
        ("21:15", "The HUB chat (HUB 04:36, session d608716f) parks at a clean point: STATE PARKED on status-HUB.md, its "
                  "Resume here in tracks/HUB/RUN-RECORD.md, the board, R-H-57; commit fbc6d7d, pushed. No run was live "
                  "and no merge was open, so nothing was paused or aborted."),
        ("21:30 on", "The owner's window checks the launcher's rules against tomorrow's start (a read-only simulation of "
                     "its decision for each track)."),
        ("21:59", "A leftover `loop.pid` file (it held 39876, the stopped loop's number) is found in the launcher's state "
                  "folder and removed. Left in place it could have blocked tomorrow's `--start` (section 6.5)."),
        ("22:10 on", "The owner's window writes its hand-over under the HUB's Resume here, renders this document, pushes "
                     "everything and sends the Word file."),
        ("22:17", "The parked HUB chat's process ends, an hour after its last step. `claude agents` no longer lists "
                  "it."),
        ("22:55", "The owner's window finds why a chat that only waits can still read live to the launcher: every "
                  "open chat's transcript file is renewed about once an hour (section 6.2)."),
        ("23:03", "36 leftover watch loops of three ended chats of this program are found still running (section "
                  "4.7). The owner's window asks to end them at 23:10; its permission mode declines, so they are left "
                  "as found."),
    ],
    # (the chat's name, the session, how `claude agents` lists it, what it is and what it needs)
    "chats": [
        ("HUB 04:36", "d608716f", "ended, no longer listed",
         "The parked HUB chat. It marked its work done at 21:17 and its process ended at 22:17. A fresh HUB chat "
         "replaces it at the start."),
        ("CORE 21:42", "8b2ee4e2", "background, idle",
         "The last CORE chat. Its last step was on 9 November at 21:47, and its track is paused in the launcher. It "
         "still has a process, so it reads live for half of every hour (section 6.2). It needs nothing."),
        ("1-Addic (hub) Fable Max builder 2", "afc0ccd2", "interactive",
         "The owner's window of 7 to 11 November. It wrote this document. The launcher's roles file lists it as a HUB "
         "chat, so typing in it holds back a fresh HUB (section 6.3). While it stays open it also reads live for half "
         "of every hour (section 6.2). You can close it once you have this document."),
        ("1-Addic Fable max planner", "e4492b2a", "interactive, idle",
         "The planner's window. Not a build chat; the launcher does not count it."),
        ("HUB 12:09, CORE 11:10, SCREENS 11:07", "2b59e0da, 80a57fa8, c26b6cc6", "background, idle",
         "Chats of 8 November that still have a process. They do nothing, but the launcher reads each as live for "
         "half of every hour (section 6.2). The HUB may end them with `claude stop <id>`: R-O-7 allows it for a dead "
         "chat of this program, and the call is the HUB's."),
        ("Older rows named HUB, CORE or SCREENS", "42 rows", "no status",
         "Finished chats of earlier days with no process. They need nothing."),
        ("The pharma program's chats", "other folders", "not ours",
         "Never touched by this program, nor its launcher (kriya-hub)."),
    ],
    "memory": ("On 11 November the memory rows of coordination/lane-widening.md read 5.0 to 6.7 GB free for most of the "
               "day, with dips to 3.3 to 3.9 GB (under the 4.0 GB floor) at 08:20 to 08:31, 18:27 and 19:28 to 19:38 "
               "while nothing of this build ran. The other programs on the machine are the main brake."),
    # The leftover watch loops of this park (section 4.7). Empty strings and an empty list when none was found.
    "loops_short": ("36 small watch loops of ended chats of this build still run on the computer. They are harmless "
                    "and spend no usage, but they hold about 0.3 GB of memory. Section 4.7 has three ways to clear "
                    "them. Nothing at the start depends on it."),
    "loops_note": ("At 23:03 on the park night 36 such loops of three ended chats of this program were still running, "
                   "with about 0.3 GB of memory between them. The owner's window asked to end them at 23:10 and its "
                   "permission mode declined, so they still run."),
    # (how many, the script, the chat it belonged to, running since)
    "loops": [
        ("33", "`watch.sh`", "HUB 04:36 (d608716f)",
         "11 November: one was started about every 30 minutes, from 04:39 to 20:50"),
        ("1", "`watch.sh`", "HUB 18:52 (42f60331)", "7 November 19:00"),
        ("2", "`board_watch.sh` and `board_watch2.sh`", "CORE 01:56 (6c9dfc8f)", "8 November 02:00 and 02:20"),
    ],
    # one PowerShell line that ends exactly these loops and nothing else
    "loops_command": ("Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'bash.exe' -and $_.CommandLine "
                      "-match 'jobs.(d608716f|6c9dfc8f|42f60331).tmp.(watch|board_watch|board_watch2)[.]sh' } | "
                      "ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"),
    "loops_others": ("Two other programs on this machine have loops of the same kind: the event-offline program 14 "
                     "and the pharma program 1. They are not this program's to touch."),
    # for the prompt, step 2: rows of `claude agents` that look like today's and are not
    "listed_note": ("Four idle rows of earlier days still have a process and are not today's: HUB 12:09 (2b59e0da), "
                    "CORE 11:10 (80a57fa8) and SCREENS 11:07 (c26b6cc6) of 8 November, and CORE 21:42 (8b2ee4e2) of "
                    "9 November. Read `startedAt`, not the name alone."),
}

# What does not come from a file: the HUB's rulings still in force (coordination/outbox-HUB.md has each one whole).
RULINGS = [
    ("R-H-51", "ES1. In discreet mode the line 'If you are in danger, call your local emergency number' no longer shows "
               "while the app loads: it appeared under the 'Notebook' title for up to 4 seconds and gave the app away. "
               "The SOS button and every help page are unchanged. The owner may say 'reverse ES1'."),
    ("R-H-53 and R-H-55", "After a tag only fixes by name are built. Each fix lane is cut from the trunk tip at its "
                          "start. One run starts per 7.0 GB memory row across both tracks; under 4.0 GB free the newest "
                          "run pauses first. The flagged lanes core and actions-sos need two reviewers."),
    ("R-H-56", "Both build tracks are paused in the launcher since 9 November 21:44 IST, because a waiting chat was "
               "relaunched about every hour for nothing to do. The HUB lifts a pause (`--resume-track <TRACK>`) at an "
               "owner line that asks for work: I6, the walk's findings or 'continue v3.3'."),
    ("R-H-57", "The park of 11 November 21:15 IST on R-O-10: nothing live, nothing aborted, the tag offline-v3.2 stands; "
               "the HUB's Resume here says how the HUB starts again."),
]

# The tooling units still open, by hand (none of them changes the app). (name, where, what it is)
TOOLING = [
    ("FIX-LANEJS-TIP", "the HUB's lane workflow",
     "The run's tip is taken from the journal's last fix commit, and the reviewer schema loses `tip`."),
    ("FIX-LOOP-PID", "the launcher",
     "The loop leaves its `loop.pid` file behind when it stops, and the launcher takes any process with that number "
     "for its loop. The fix: the loop removes the file when it stops, and the check confirms the process is the "
     "launcher's own loop. Until then: the check by hand of section 6.5."),
    ("STILL_MIN", "the launcher",
     "A chat that waits with nothing to do is relaunched after 30 silent minutes, which spends weekly usage (R-H-56, "
     "option b). Until it is built, a build track that only waits stays paused in the launcher. The mirror of it: "
     "an idle chat that still has a process reads live for 30 minutes after each hourly renewal of its transcript "
     "file, and holds back a fresh chat of its track for that time (section 6.2)."),
    ("The leftover watch loops", "every chat that watches",
     "A watch script started under the Monitor tool keeps running after its watch and its chat have ended (section "
     "4.7). Proposed to the HUB: the script ends by itself after a set time, and a chat stops its old watch before "
     "it starts a new one."),
]

# What each tag's gates said, by hand (the HUB's hand-off notes in tracks/HUB/RUN-RECORD.md are the source).
TAG_FACTS = {
    "offline-v3.2": "frozen at aac18546; the full gates GREEN by every name: build 1213207 B; Node 763/763 in 16 files; "
                    "validate; guards 5/5; browser 32/32; docs",
}

# The work named toward the next tag (R-H-55 of 9 Nov and the HUB's Resume here of 11 Nov), in plain words.
# (name, lane, track, the key a `MERGED:` line of status-HUB.md would carry, what it is)
NAMED = [
    ("FIX-STALE-SAVE-SAY", "core", "CORE, flagged", r"FIX-STALE-SAVE-SAY",
     "With a PIN set and the app open in two tabs: after one tab imports data, a save in the other tab is refused, and "
     "the lock screen replaces the page before the refusal can be read. The entry is gone and nothing says so. The fix: "
     "say it (R-C-86, RS1)."),
    ("FIX-SOS-FOCUS", "core", "CORE, flagged", r"FIX-SOS-FOCUS",
     "Back then Forward between the SOS craving page and its from-the-lock-screen variant redraws the page without "
     "moving the keyboard focus, so a keyboard user can land on the page body (R-C-88)."),
    ("The C1 Back path", "actions-sos", "CORE, flagged", r"C1[- ]BACK|FIX-C1",
     "A rare path leaves two '?from=lock' entries side by side in the browser history, so one Back press does nothing. "
     "The SOS button itself is unaffected (R-C-88, C1)."),
    ("V-10b", "content", "SCREENS", r"(?<![\w-])V-10b(?![\w])",
     "The India crisis numbers in the app's content. It waits for the owner's input I6 (which numbers are confirmed); "
     "until then every number says \"please verify\"."),
    ("The owner's walk findings", "by the file's lane", "routed by the owner's window", r"(?!x)x",
     "Whatever the owner's walk of the tagged file finds. Each finding goes by outbox to the lane that owns the file, "
     "with a default, and becomes a named fix."),
]
TAIL = [
    ("FREEZE", "no new unit starts after the last named fix is READY; fixes by name only"),
    ("Full gates", "the HUB runs every gate on the integration worktree at the trunk tip (the quiet window): "
                   "python docs/offline/build-2026-11-07/tools/gates.py --wt C:/Users/ruchi/1-addic-wt/_int --lane hub "
                   "--full build test validate guards browser docs"),
    ("Reds by name", "every FAIL line is read by name against coordination/baselines.md; a red is fixed by its lane "
                     "(by territory), then the gate runs again"),
    ("Tag " + NEXT_TAG, "git tag -a " + NEXT_TAG + " on the trunk in the main folder, then git push origin " + NEXT_TAG
                        + "; the hand-off note in tracks/HUB/RUN-RECORD.md"),
]


# ------------------------------------------------------------------------------------------------------ helpers --
def run(cmd, timeout=120, cwd=None):
    """Run a command without a shell; return (ok, text)."""
    try:
        p = subprocess.run([str(c) for c in cmd], cwd=str(cwd or ROOT), capture_output=True, text=True,
                           encoding="utf-8", errors="replace", timeout=timeout)
        out = (p.stdout or "").strip()
        if p.returncode != 0:
            out = (out + "\n" + (p.stderr or "").strip()).strip()
        return p.returncode == 0, out
    except Exception as e:  # a missing program, a timeout: the document says so
        return False, "%s: %s" % (e.__class__.__name__, e)


def git(*args):
    ok, out = run(["git"] + list(args))
    return out if ok else "unavailable (%s)" % out.replace("\n", " ")[:160]


def cut(s, n=CELL):
    s = (s or "").replace("\r", " ").replace("\n", " ").strip()
    return s if len(s) <= n else s[: n - 3].rstrip() + "..."


def cell(s, n=CELL):
    """A table cell: one line, no pipe, cut."""
    return cut(s, n).replace("|", "/") or "-"


def now_local():
    now = datetime.datetime.now().astimezone()
    off = now.utcoffset() or datetime.timedelta(0)
    if off == datetime.timedelta(hours=5, minutes=30):
        zone = "IST"
    else:
        total = int(off.total_seconds())
        sign = "+" if total >= 0 else "-"
        total = abs(total)
        zone = "UTC%s%02d:%02d (the machine's zone; not IST)" % (sign, total // 3600, (total % 3600) // 60)
    return now, zone


# ------------------------------------------------------------------------------------------------- the reads --
LINE_RE = re.compile(r"^(STATE|BASE-READY|BASE|MERGING|MERGE-QUEUE|SLOTS-ALLOWED|OWNER|RULING|UPDATED|TRACKS-ALLOWED):\s*(.*)$")
LANE_RE = re.compile(r"^LANE:\s+(\S+)\s+(\S+)(?:\s+([0-9a-fA-F]{7,40}|\d+))?\s*(?:#\s*(.*))?$")
WAITING = ("READY", "READY-SLICE")
IN_FLIGHT = ("BUILDING", "CHECKING", "REVIEWING", "PAUSED", "RED", "SCOUTED", "STOPPED")


def read_status(track):
    path = CO / ("status-%s.md" % track)
    info = {"track": track, "ok": False, "error": "", "lines": {}, "lanes": [], "merged": 0, "merged_lines": []}
    try:
        text = path.read_text(encoding="utf-8-sig")
    except Exception as e:
        info["error"] = "%s could not be read: %s" % (path.name, e)
        return info
    for raw in text.splitlines():
        line = raw.rstrip()
        if line.startswith("MERGED:"):
            info["merged"] += 1
            info["merged_lines"].append(line)
            continue
        m = LANE_RE.match(line)
        if m:
            info["lanes"].append({"lane": m.group(1), "state": m.group(2), "tip": m.group(3) or "",
                                  "note": (m.group(4) or "").strip()})
            continue
        m = LINE_RE.match(line)
        if m and m.group(1) not in info["lines"]:       # the header's first line of each kind
            info["lines"][m.group(1)] = m.group(2).strip()
    info["ok"] = True
    return info


def state_word(info):
    return (info["lines"].get("STATE", "").split("#")[0].split() or ["-"])[0]


def read_owner_outbox():
    path = CO / "outbox-OWNER.md"
    heads, nums, err = [], [], ""
    try:
        for line in path.read_text(encoding="utf-8-sig").splitlines():
            m = re.match(r"^## (R-O-(\d+)\b.*)$", line.rstrip())
            if m:
                heads.append(m.group(1).strip())
                nums.append(int(m.group(2)))
    except Exception as e:
        err = "outbox-OWNER.md could not be read: %s" % e
    nxt = (max(nums) + 1) if nums else 1
    return heads, "R-O-%d" % nxt, err


def last_heading(prefix, missing):
    """The last heading of tracks/HUB/RUN-RECORD.md that starts with `prefix`."""
    try:
        heads = [l.rstrip() for l in RUN_RECORD.read_text(encoding="utf-8-sig").splitlines() if l.startswith(prefix)]
        return heads[-1] if heads else missing
    except Exception as e:
        return "tracks/HUB/RUN-RECORD.md could not be read: %s" % e


def read_board():
    """The board's first three lines: STATE, NEEDS YOU, NEXT (the HUB's lines for the owner)."""
    out = {"STATE": "", "NEEDS YOU": "", "NEXT": ""}
    try:
        for line in BOARD.read_text(encoding="utf-8-sig").splitlines()[:12]:
            for k in out:
                if not out[k] and line.startswith(k):
                    out[k] = line[len(k):].lstrip(" :").strip()
    except Exception as e:
        out["error"] = "coordination/SPRINT-BOARD.md could not be read: %s" % e
    return out


def launcher_status():
    """(ok, the first 14 lines for the document, the whole text for the parse)."""
    if not LAUNCHER.is_file():
        msg = "the launcher script is missing: %s" % LAUNCHER
        return False, msg, msg
    ok, out = run([sys.executable, LAUNCHER, "--status"], timeout=180)
    lines = out.splitlines()[:14]
    if not ok:
        lines = ["the launcher's --status failed (exit not 0); its output:"] + lines
    return ok, ("\n".join(lines) if lines else "(the launcher printed nothing)"), out


def read_tags():
    """[(tag, commit, date, subject)] in creation order; ([], reason) when git fails."""
    fmt = "%(refname:short)|%(objectname:short=8)|%(*objectname:short=8)|%(creatordate:format:%Y-%m-%d %H:%M)|%(subject)"
    ok, out = run(["git", "for-each-ref", "refs/tags/offline-v*", "--sort=creatordate", "--format=" + fmt])
    if not ok:
        return [], "git for-each-ref failed: " + out.replace("\n", " ")[:160]
    rows = []
    for line in out.splitlines():
        p = line.split("|", 4)
        if len(p) == 5:
            rows.append((p[0], p[2] or p[1], p[3], re.sub(r"^%s:\s*" % re.escape(p[0]), "", p[4]).strip()))
    return rows, ""


OWN_FILES = ("owner-docs/build_resume_doc.py", "owner-docs/" + MD_NAME, "owner-docs/" + TXT_NAME, "owner-docs/" + DOCX_NAME)


def uncommitted():
    """`git status --short` in the main folder, without this document's own four files (the render rewrites them)."""
    ok, out = run(["git", "status", "--short"])
    if not ok:
        return -1, [], [], "git status failed: " + out.replace("\n", " ")[:160]
    files = [l for l in out.splitlines() if l.strip() and not any(l.rstrip().endswith(o) for o in OWN_FILES)]
    program = [l for l in files if "docs/offline/build-2026-11-07/" in l]
    return len(files), program, files, ""


def app_file_line(latest_tag):
    """Is offline/1-addic.html in the main folder the file at the latest tag?"""
    p = ROOT / APP_FILE
    if not p.is_file():
        return "`%s` is not in the main folder (build it with `npm run build`)" % APP_FILE
    size = p.stat().st_size
    if not latest_tag:
        return "`%s` (%d bytes); no tag to compare it with" % (APP_FILE, size)
    tracked, _ = run(["git", "ls-files", "--error-unmatch", APP_FILE])
    if not tracked:
        return ("`%s` in the main folder (%d bytes) is not tracked by git, so it cannot be compared with the tag `%s`; "
                "build it fresh with `npm run build`" % (APP_FILE, size, latest_tag))
    same_tag, _ = run(["git", "diff", "--quiet", latest_tag, "HEAD", "--", APP_FILE])
    clean, _ = run(["git", "diff", "--quiet", "HEAD", "--", APP_FILE])
    if same_tag and clean:
        return "`%s` in the main folder (%d bytes) is the file at the tag `%s`: no commit since the tag changed it" % (APP_FILE, size, latest_tag)
    return ("`%s` in the main folder (%d bytes) differs from the file at the tag `%s`; take the tagged one with "
            "`git show %s:%s > 1-addic-%s.html`" % (APP_FILE, size, latest_tag, latest_tag, APP_FILE, latest_tag.replace("offline-", "")))


# ------------------------------------------------------------------------------------------------ the render --
def lane_rows(info, tips, origin_tips):
    rows = []
    for ln in info["lanes"]:
        lane = ln["lane"]
        tip = tips.get(lane, "-")
        pushed = "yes" if (tip != "-" and tip == origin_tips.get(lane)) else ("no" if origin_tips.get(lane) else "?")
        st = ln["state"] + ((" " + ln["tip"]) if ln["tip"] else "")
        rows.append("| %s | %s | %s | %s | %s |" % (lane, cell(st, 40), cell(tip, 12), pushed, cell(ln["note"])))
    if not rows:
        rows.append("| (no LANE line) | - | - | - | %s |" % cell(info["error"] or "the file has no LANE lines"))
    return "\n".join(rows)


def header_rows(info, keys):
    rows = []
    for k in keys:
        v = info["lines"].get(k)
        if v is not None:
            rows.append("| %s | %s |" % (k, cell(v)))
    if not rows:
        rows.append("| (none) | %s |" % cell(info["error"] or "no header line found"))
    return "\n".join(rows)


def in_flight(hub, core, screens):
    items = []
    merging = hub["lines"].get("MERGING", "")
    if merging and not merging.lower().startswith("none"):
        items.append("- A merge in flight (MERGING on status-HUB.md): %s" % cut(merging, 400))
    else:
        items.append("- No merge in flight (MERGING: %s)." % (cut(merging, 80) or "line missing"))
    for info in (core, screens):
        for ln in info["lanes"]:
            if ln["state"] in IN_FLIGHT:
                items.append("- %s lane `%s` %s %s: %s" % (info["track"], ln["lane"], ln["state"], ln["tip"], cut(ln["note"], 400)))
    for info in (core, screens):
        for ln in info["lanes"]:
            if ln["state"] in WAITING:
                items.append("- %s lane `%s` %s %s waits for the HUB's merge: %s" % (info["track"], ln["lane"], ln["state"], ln["tip"], cut(ln["note"], 300)))
    if len(items) == 1:
        items.append("- No lane line says BUILDING, CHECKING, REVIEWING, PAUSED, RED, READY or READY-SLICE: nothing was running.")
    return "\n".join(items)


MERGED_RE = re.compile(r"^MERGED:\s+(\S+)\s+(?:READY-SLICE|READY)\s+[0-9a-fA-F]{7,40}\s+(.*)$")


def merged_units(hub):
    """(lane, the units named) per MERGED: line: the text between the tip and the ' -> ' arrow names what was merged;
    what follows the arrow (the trunk tip, the gates, notes such as RED-BACK) may name other units and is not read."""
    out = []
    for line in hub["merged_lines"]:
        m = MERGED_RE.match(line)
        if not m:
            continue
        seg = m.group(2).split(" -> ", 1)[0]
        out.append((m.group(1), seg))
    return out


def ro_block(heads, err):
    if err:
        return "- " + err
    if not heads:
        return "- (no R-O heading found in outbox-OWNER.md)"
    return "\n".join("%d. %s" % (i + 1, h) for i, h in enumerate(heads))


# ------------------------------------------------------------------------------------------------ the launcher --
def launcher_home():
    """The launcher's state folder, as its own home() names it (never created here)."""
    base = os.environ.get("ADDIC_HUB_HOME") or os.path.join(os.environ.get("LOCALAPPDATA", os.path.expanduser("~")), "1-addic-hub")
    return Path(base) / "launcher"


def launcher_facts(text, now):
    """The loop word, the paused tracks, the global pause, the weekly-limit line, the last check and its age, the last
    LOOP line of the log, and a note on the leftover pid file (FIX-LOOP-PID)."""
    first = (text.splitlines() or [""])[0]
    if "loop NOT RUNNING" in first:
        loop = "stopped"
    elif "loop running" in first:
        loop = "RUNNING"
    else:
        loop = "unknown"
    m = re.search(r"^paused tracks:\s*(.*)$", text, re.M)
    paused = None if not m else [t.strip() for t in m.group(1).split(",") if t.strip() and t.strip() != "none"]
    lim = re.search(r"^WEEKLY LIMIT:.*$", text, re.M)
    loops = re.findall(r"^\s*(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d \| LOOP .*)$", text, re.M)
    last_check, age = "", None
    m = re.search(r"^last check:\s*(\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d)?)", text, re.M)
    if m:
        last_check = m.group(1)
        try:
            age = int((now.replace(tzinfo=None) - datetime.datetime.fromisoformat(last_check)).total_seconds() // 60)
        except ValueError:
            age = None
    folder = launcher_home()
    pid_text, has_pid, has_stop = "", False, False
    try:
        has_pid = (folder / "loop.pid").is_file()
        has_stop = (folder / "loop.stop").is_file()
        if has_pid:
            pid_text = (folder / "loop.pid").read_text(encoding="utf-8", errors="replace").strip()[:12]
    except Exception:
        pass
    if loop == "stopped" and not has_pid:
        note = "The loop is stopped and no `loop.pid` file is left behind (checked at render time)."
    elif loop == "stopped":
        note = ("WARNING: the loop is stopped but a `loop.pid` file is still in the launcher's state folder (it holds "
                "%s). Delete it before the start (section 6.5)." % (pid_text or "no number"))
    elif loop == "RUNNING" and age is not None and age > 6:
        note = ("WARNING: the launcher says the loop runs (its `loop.pid` holds %s), but its last check is %d minutes "
                "old. Most likely the file is a leftover and another program now holds the number (section 6.5)."
                % (pid_text or "a number", age))
    elif loop == "RUNNING":
        note = "WARNING: the loop was running at render time. A proper park stops it first (`--stop`)."
    else:
        note = "The loop word could not be read from the launcher's first line."
    if has_stop:
        note += (" WARNING: a `loop.stop` file is left in the state folder; delete it too, or the next loop exits at "
                 "its first pass.")
    return {"loop": loop, "paused": paused, "global": "PAUSED since" in first, "limit": lim.group(0) if lim else "",
            "last_loop": loops[-1] if loops else "", "last_check": last_check, "age": age, "pid_note": note,
            "pid_ok": loop == "stopped" and not has_pid and not has_stop}


def launcher_rule(track, word, gate_ok=True):
    """What the launcher does for a track with no live chat, from its status word (a mirror of the launcher's decide())."""
    w = (word or "").upper()
    if track != "HUB":
        if not gate_ok:
            return "held", "status-HUB.md has no BASE-READY line or does not name the track on TRACKS-ALLOWED"
        if w in L_BUILD_STOP:
            return "stop", "READY is a build track's stop word"
    if L_STOPPING.match(w):
        return "launch", "HAND-OVER written"
    if L_TERMINAL.match(w):
        return "stop", "the word is a stop word"
    return "launch", "NO CHAT live for %s" % track


def expect_rows(infos, facts, gate):
    """The table of what the start does per track, and the phrases the prompt uses for the build tracks' rows."""
    rows, phrases, hub_reason = [], [], "NO CHAT live for HUB"
    paused = facts["paused"]
    for info in infos:
        track, word = info["track"], state_word(info)
        kind, why = launcher_rule(track, word, gate.get(track, True))
        is_paused = (track in paused) if paused is not None else None
        p_word = "?" if is_paused is None else ("yes" if is_paused else "no")
        if track == "HUB":
            hub_reason = why if kind == "launch" else ""
            if kind == "launch" and not is_paused:
                at, wake = ("A fresh HUB chat starts at the first check that finds no chat of the HUB track reading "
                            "live (`%s`). If five minutes pass without it, the owner's window forces the start "
                            "(section 6.4)." % why,
                            "Nothing more than `--start`, then `--launch-missing`.")
            elif kind == "launch":
                at, wake = "Held: the HUB track is paused in the launcher.", "`--resume-track HUB`, then `--launch-missing`."
            else:
                at, wake = ("Nothing starts: `%s` is a stop word for the launcher." % word,
                            "The forced launch of section 6.4.")
        elif kind == "stop":
            at = ("Held: the track is paused." if is_paused else "Nothing starts.") + " And `%s` is a stop word." % word
            wake = ("`--resume-track %s` alone is not enough. The HUB changes the STATE line of status-%s.md when "
                    "there is work for the track, or the chat is started by hand (section 9)." % (track, track))
            phrases.append('a %s row that ends "-> nothing to do"' % track)
        elif kind == "held":
            at, wake = "Held by the gate: %s." % why, "The HUB's lines on status-HUB.md."
            phrases.append('a %s row that ends "-> HELD: ..."' % track)
        elif is_paused:
            at = "Held: the track is paused in the launcher."
            wake = ("`--resume-track %s`: the HUB runs it at an owner line that asks for work. A fresh %s chat starts "
                    "at the first check that finds no %s chat reading live (`%s`, section 6.6)."
                    % (track, track, track, why))
            phrases.append('a %s row that ends "; the track is paused (--resume-track %s lifts it) -> HELD: ..."' % (track, track))
        else:
            at, wake = "A fresh %s chat starts at the first check (`%s`)." % (track, why), "Nothing more."
            phrases.append('a row "launched %s <today>T<hh:mm> ..."' % track)
        rows.append("| %s | `%s` | %s | %s | %s |" % (track, word, p_word, at, wake))
    return "\n".join(rows), " and ".join(phrases) or "no build track row", hub_reason


OPEN_NOTE = re.compile(r"\b(open|not merged|not built|remaining|remains|deferred|pending|waits|named for|left for|later)\b", re.I)


def merged_hit(rx, seg):
    """True when the MERGED: segment names the unit as merged. A clause that names it as still open does not
    count, for example 'RS1 LOW open by name FIX-...'. A clause runs from the last ';' or '(' before the name
    to the next ';' or ')' after it."""
    for m in rx.finditer(seg):
        before = re.split(r"[;(]", seg[:m.start()])[-1]
        after = re.split(r"[;)]", seg[m.end():])[0]
        if not OPEN_NOTE.search(before + " " + after) and not after.strip().lower().startswith("named"):
            return True
    return False


def named_rows(hub):
    """The named work toward the next tag: Done when a MERGED: line of the unit's lane names it as merged."""
    units = merged_units(hub)
    rows, pending = [], []
    for name, lane, track, key, what in NAMED:
        rx = re.compile(key, re.I)
        done = any(l == lane and merged_hit(rx, seg) for l, seg in units)
        if not done:
            pending.append(name)
        rows.append("| %s | %s | %s | %s | %s |" % (name, lane, track, "Done" if done else "Pending", cell(what, 480)))
    return "\n".join(rows), pending


def simple_rows(items, n=520):
    return "\n".join("| " + " | ".join(cell(x, n) for x in row) + " |" for row in items)


# ---------------------------------------------------------------------------------------------- the document --
LAUNCHER_CMD = "python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py"


def render(now, zone):
    """(the document as Markdown, the owner's-window prompt alone, what could not be read, the warnings, the guard's
    findings on the prompt, the placeholders left in the document)."""
    stamp = now.strftime("%Y-%m-%d %H:%M") + " " + zone
    hub, core, screens = read_status("HUB"), read_status("CORE"), read_status("SCREENS")
    trunk_tip = git("rev-parse", "--short=8", "HEAD")
    trunk_log = git("log", "--oneline", "-1")
    branch = git("rev-parse", "--abbrev-ref", "HEAD")
    origin_tip = git("rev-parse", "--short=8", "origin/build/offline-v1")
    tags, tag_err = read_tags()
    tags_inline = ", ".join(t[0] for t in tags) if tags else ("none (%s)" % tag_err if tag_err else "none")
    latest = tags[-1] if tags else ("", "", "", "")
    lanes = []
    for info in (core, screens):
        for ln in info["lanes"]:
            if ln["lane"] not in lanes:
                lanes.append(ln["lane"])
    tips = {l: git("rev-parse", "--short", "build/" + l) for l in lanes}
    origin_tips = {}
    for l in lanes:
        ok, out = run(["git", "rev-parse", "--short", "origin/build/" + l])
        origin_tips[l] = out.strip() if ok else ""
    n_unc, program_unc, unc_files, unc_err = uncommitted()
    heads, next_ro, ro_err = read_owner_outbox()
    launcher_ok, launcher_text, launcher_all = launcher_status()
    facts = launcher_facts(launcher_all, now)
    board = read_board()
    named_table, pending = named_rows(hub)
    allowed = hub["lines"].get("TRACKS-ALLOWED", "").split("#")[0].split()
    gate = {t: ("BASE-READY" in hub["lines"] and t in allowed) for t in ("CORE", "SCREENS")}
    expect_table, build_expect, hub_reason = expect_rows((hub, core, screens), facts, gate)
    paused = facts["paused"]
    paused_inline = "could not be read" if paused is None else (", ".join(paused) or "none")
    warnings = []

    # the working tree
    shown = [l.strip() for l in unc_files]
    settings_only = shown and all(s.endswith(".claude/settings.json") for s in shown)
    if n_unc < 0:
        unc_line, unc_expect = unc_err, "no line that names a program file"
    elif n_unc == 0:
        unc_line = "nothing (this document's own four files are not counted)"
        unc_expect = "no line at all"
    else:
        unc_line = "%d file(s), this document's own four files not counted: %s" % (
            n_unc, "; ".join("`%s`" % cut(s, 90) for s in shown[:8]) + (" ..." if len(shown) > 8 else ""))
        if settings_only:
            unc_line += " (the owner's own file; the program never edits or commits it)"
            unc_expect = 'only the line " M .claude/settings.json": the owner\'s own file, which you leave alone'
        else:
            unc_expect = "these lines and no other: " + "; ".join('"%s"' % cut(s, 90) for s in shown[:8])
    if program_unc:
        warnings.append("%d program file(s) under docs/offline/build-2026-11-07/ are uncommitted: %s." % (
            len(program_unc), "; ".join(cut(p.strip(), 90) for p in program_unc[:6])))
    pushed_line = ("yes, origin/build/offline-v1 is at the same tip (as last fetched)" if origin_tip == trunk_tip
                   else "NOT as last fetched: origin/build/offline-v1 is at %s (run git fetch origin, then compare)" % origin_tip)
    if origin_tip != trunk_tip:
        warnings.append("The trunk tip %s is not origin's tip %s: push before the park is closed." % (trunk_tip, origin_tip))

    # the park notes against the live state
    hub_updated = hub["lines"].get("UPDATED", "")[:16]
    if hub_updated[:10] != PARK["day"]:
        warnings.append("The PARK notes in build_resume_doc.py are of %s but status-HUB.md was updated %s: edit the "
                        "PARK notes for this park." % (PARK["day"], hub_updated or "(no UPDATED line)"))
    if not facts["pid_ok"]:
        warnings.append(facts["pid_note"])
    if facts["global"]:
        warnings.append("The launcher's global pause is on (`--resume` lifts it).")

    # the build tracks: what wakes them
    build = []
    for info in (core, screens):
        t, w = info["track"], state_word(info)
        kind, _why = launcher_rule(t, w, gate.get(t, True))
        build.append((t, w, kind, bool(paused and t in paused)))
    paused_build = [b[0] for b in build if b[3]]
    if paused_build:
        wake = ("%s paused in the launcher under R-H-56 until an owner line asks for work: 'continue v3.3', the walk's "
                "findings, or I6. File the line and tell the HUB; the HUB lifts the pause. If no launcher HUB is live, or "
                "the pause is still on ten minutes after your message, run `%s --resume-track <TRACK>` yourself under "
                "R-O-7 and tell the HUB." % (" and ".join(paused_build) + (" are" if len(paused_build) > 1 else " is"),
                                            LAUNCHER_CMD))
        see_row = ('| Until you ask for work | No chat named "CORE hh:mm" or "SCREENS hh:mm" | The build tracks are '
                   'paused, so nothing spends usage while there is nothing to build. `continue v3.3` wakes them. |')
    else:
        wake = ("No build track is paused in the launcher: a track with work starts at the loop's next check. An owner "
                "line that asks for work ('continue v3.3', the walk's findings, I6) is filed and passed to the HUB.")
        see_row = ('| After about five minutes | Chats named "CORE hh:mm" and "SCREENS hh:mm", when there is work | '
                   'The build chats. They build; the HUB merges. |')
    wake_list = []
    for t, w, kind, is_p in build:
        if kind == "launch":
            wake_list.append("- **%s** (`%s`): a fresh %s chat starts at the loop's first check that finds no %s "
                             "chat reading live." % (t, w, t, t))
        elif kind == "stop":
            wake += (" One catch: the status word of %s is %s, which the launcher reads as a stop word. %s nothing "
                     "starts for it until the HUB changes that STATE line, or the owner starts the chat by hand with "
                     "the prompt of section 9 of the Word document. That start is the owner's: never print that "
                     "section in this chat." % (t, w, ("After `--resume-track %s`" % t) if is_p else "So"))
            wake_list.append("- **%s** (`%s`): nothing starts, because the word is a stop word for the launcher. The "
                             "HUB changes the STATE line of `status-%s.md` when there is work for the track, or the "
                             "chat is started by hand (section 9)." % (t, w, t))
        else:
            wake_list.append("- **%s** (`%s`): held by the gate on status-HUB.md (BASE-READY, TRACKS-ALLOWED)." % (t, w))

    def lanes_inline(info):
        return "; ".join(("%s %s %s" % (ln["lane"], ln["state"], ln["tip"])).strip() for ln in info["lanes"]) or "(no LANE line)"

    def lane_names(info):
        return ", ".join(ln["lane"] for ln in info["lanes"]) or "(no LANE line)"

    def heading(prefix, missing):
        return cut(last_heading(prefix, missing).lstrip("# "), 400)

    if tags:
        tag_rows = "\n".join("| `%s` | %s | %s | %s |" % (t, c, d, cell(s, 220)) for t, c, d, s in tags)
    else:
        tag_rows = "| (none) | - | - | %s |" % cell(tag_err or "no tag named offline-v* was found")
    age = facts["age"]
    last_check = "not found in the launcher's status"
    if facts["last_check"]:
        last_check = facts["last_check"] + ("" if age is None else " (%d minutes before this render)" % age)
    limit_line = "- " + (("A weekly-limit hold is on: `%s`" % facts["limit"].replace("`", "'")) if facts["limit"]
                         else "No weekly-limit hold is on.")
    app_line = app_file_line(latest[0])
    n_loops = sum(int(row[0]) for row in (PARK.get("loops") or []) if str(row[0]).isdigit())
    loops_prompt = ("No leftover watch loop was found at the park." if not n_loops else
                    "%d leftover watch loops of ended chats of this program were still running at the park, and the "
                    "owner's window was not allowed to end them. The owner's window hand-over in the run record has "
                    "the count, the filter and the one command. End them only on the owner's line 'end the leftover "
                    "watch loops', with that one command, then count again. Never end a loop of another program."
                    % n_loops)
    fields = {
        "STAMP": stamp,
        "DATE_LONG": now.strftime("%d %B %Y").lstrip("0"),
        "TIME": now.strftime("%H:%M") + " " + zone,
        "PARK_DATE_LONG": PARK["date_long"],
        "PARK_SHORT": PARK["short"],
        "PARK_REASON": PARK["reason"],
        "PARK_TIMELINE": simple_rows(PARK["timeline"]),
        "PARK_CHATS": simple_rows(PARK["chats"]),
        "PARK_MEMORY": PARK["memory"],
        "PARK_LOOPS_SHORT": PARK.get("loops_short") or "Nothing: no leftover watch loop was found at this park.",
        "PARK_LOOPS_NOTE": PARK.get("loops_note") or "None was found at this park.",
        "PARK_LOOPS": simple_rows(PARK.get("loops") or [("0", "-", "-", "-")]),
        "PARK_LOOPS_COMMAND": PARK.get("loops_command") or "(no loop to end)",
        "PARK_LOOPS_OTHERS": PARK.get("loops_others") or "",
        "PARK_LOOPS_PROMPT": loops_prompt,
        "PARK_LISTED_NOTE": PARK.get("listed_note") or "",
        "NEXT_WINDOW": PARK["next_window"],
        "HEAD_STATUS": ("the launcher loop is stopped and nothing runs" if facts["loop"] == "stopped"
                        else "WARNING, the launcher loop was not stopped at render time"),
        "TRUNK_TIP": trunk_tip,
        "TRUNK_LOG": cut(trunk_log, 200).replace("`", "'"),
        "BRANCH": branch,
        "PUSHED_LINE": pushed_line,
        "TAGS_INLINE": tags_inline,
        "TAG_ROWS": tag_rows,
        "LATEST_TAG": latest[0] or "(no tag)",
        "LATEST_TAG_COMMIT": latest[1] or "-",
        "LATEST_TAG_DATE": latest[2] or "-",
        "TAG_FACT": TAG_FACTS.get(latest[0], "the HUB's hand-off note in tracks/HUB/RUN-RECORD.md has its gates"),
        "NEXT_TAG": NEXT_TAG,
        "MERGED_COUNT": str(hub["merged"]),
        "HUB_STATE_WORD": state_word(hub),
        "CORE_STATE_WORD": state_word(core),
        "SCREENS_STATE_WORD": state_word(screens),
        "HUB_UPDATED": hub_updated or "(no UPDATED line)",
        "HUB_HEADER": header_rows(hub, ("STATE", "BASE-READY", "BASE", "TRACKS-ALLOWED", "MERGING", "MERGE-QUEUE",
                                        "SLOTS-ALLOWED", "OWNER", "RULING", "UPDATED")),
        "CORE_HEADER": header_rows(core, ("STATE", "UPDATED")),
        "SCREENS_HEADER": header_rows(screens, ("STATE", "UPDATED")),
        "CORE_LANES": lane_rows(core, tips, origin_tips),
        "SCREENS_LANES": lane_rows(screens, tips, origin_tips),
        "CORE_LANE_NAMES": lane_names(core),
        "SCREENS_LANE_NAMES": lane_names(screens),
        "CORE_LANES_INLINE": cut(lanes_inline(core), 600),
        "SCREENS_LANES_INLINE": cut(lanes_inline(screens), 600),
        "LAUNCHER": launcher_text,
        "LAUNCHER_WORD": "read at render time" if launcher_ok else "could not be read; its error is printed below",
        "LAUNCHER_HOME": str(launcher_home()),
        "LOOP_WORD": facts["loop"],
        "PAUSED_INLINE": paused_inline,
        "LAST_CHECK": last_check,
        "LAST_LOOP": ("`%s`" % cut(facts["last_loop"], 300).replace("`", "'")) if facts["last_loop"] else "(no LOOP line in the log tail)",
        "LIMIT_LINE": limit_line,
        "PID_NOTE": facts["pid_note"],
        "UNCOMMITTED": unc_line,
        "UNC_EXPECT": unc_expect,
        "APP_LINE": app_line,
        "APP_SHORT": app_line,
        "IN_FLIGHT": in_flight(hub, core, screens),
        "RESUME_HEAD": heading("## Resume here", "(no 'Resume here' heading found)"),
        "HANDOVER_HEAD": heading("## Owner's window hand-over", "(none yet: the owner's window writes it at the park)"),
        "BOARD_STATE": cut(board["STATE"], 900) or "(line not found)",
        "BOARD_NEEDS": cut(board["NEEDS YOU"], 1600) or "(line not found)",
        "BOARD_NEXT": cut(board["NEXT"], 900) or "(line not found)",
        "NAMED_TABLE": named_table,
        "NAMED_INLINE": ", ".join((p[0].lower() + p[1:]) if p.startswith("The ") else p for p in pending) if pending else "nothing: every named unit is merged; FREEZE, the full gates and the tag follow",
        "TOOLING_TABLE": simple_rows(TOOLING),
        "TAIL_TABLE": simple_rows(TAIL),
        "RULINGS": simple_rows(RULINGS, 700),
        "EXPECT_TABLE": expect_table,
        "BUILD_EXPECT": build_expect,
        "HUB_REASON": hub_reason or "(the HUB's status word is a stop word: see step 4)",
        "WAKE_NOTE": wake,
        "WAKE_LIST": "\n".join(wake_list),
        "SEE_BUILD_ROW": see_row,
        "RO_BLOCK": ro_block(heads, ro_err),
        "RO_COUNT": str(len(heads)),
        "NEXT_RO": next_ro,
        "LAST_RO": cut(heads[-1], 260) if heads else "(none found)",
        "MD_NAME": MD_NAME,
        "TXT_NAME": TXT_NAME,
        "DOCX_NAME": DOCX_NAME,
    }
    unread = [info["error"] for info in (hub, core, screens) if not info["ok"]]
    for err in (ro_err, tag_err, unc_err, board.get("error", "")):
        if err:
            unread.append(err)
    if not launcher_ok:
        unread.append("the launcher's --status")
    if trunk_tip.startswith("unavailable"):
        unread.append("git in the main folder")
    note = ("Everything in this document was read from the live files and git at render time, except the park notes of "
            "section 4, the rulings of section 8 and the items of section 3, which are written by hand."
            if not unread else "Could not be read at render time (check by hand): " + "; ".join(unread) + ".")
    if warnings:
        note += "\n\n> [!WARNING]\n> **Check before the start.** " + " ".join(warnings)
    fields["UNREAD"] = note

    # the prompt first, guarded; then the document around it
    prompt = string.Template(PROMPT_TEMPLATE).safe_substitute(fields).strip() + "\n"
    bad = []
    if L_KICKOFF.search(prompt):
        bad.append("it holds a kickoff line of a track")
    if any(l.startswith("```") for l in prompt.splitlines()):
        bad.append("a line starts with three backticks (it would close the document's box)")
    if re.search(r"\$\{[A-Z_0-9]+\}", prompt):
        bad.append("a placeholder is left in it")
    fields["PROMPT"] = prompt.rstrip("\n")
    text = string.Template(TEMPLATE).safe_substitute(fields)
    left = sorted(set(re.findall(r"\$\{[A-Z_0-9]+\}", text)))
    return text, prompt, unread, warnings, bad, left


# ----------------------------------------------------------------------------------------------- the .docx --
def find_gen_docx():
    env = os.environ.get("GEN_DOCX")
    if env and Path(env).is_file():
        return Path(env)
    home = Path.home()
    cands = [home / d / "skills" / "word-doc-generator" / "gen_docx.py" for d in (".claude-pro", ".claude", ".claude-max")]
    try:
        cands += sorted(home.glob(".claude*/skills/word-doc-generator/gen_docx.py"))
    except Exception:
        pass
    for c in cands:
        if c.is_file():
            return c
    return None


def build_docx(md_path, docx_path):
    gen = find_gen_docx()
    if gen is None:
        print("gen_docx.py not found under %s/.claude*/skills/word-doc-generator/ (or GEN_DOCX). Build the .docx by hand:" % Path.home())
        print('  python "<skill-dir>/gen_docx.py" "%s" "%s"' % (md_path, docx_path))
        return False
    ok, out = run([sys.executable, gen, md_path, docx_path], timeout=300, cwd=HERE)
    if ok and docx_path.is_file():
        print("docx: %s (%d bytes) via %s" % (docx_path, docx_path.stat().st_size, gen))
        return True
    print("gen_docx.py failed (%s). The command to run by hand:" % cut(out, 300).encode("ascii", "replace").decode())
    print('  python "%s" "%s" "%s"' % (gen, md_path, docx_path))
    return False


# ---------------------------------------------------------------------------------------------------- main --
def _ascii(s):
    return str(s).encode("ascii", "replace").decode()


def main(argv=None):
    ap = argparse.ArgumentParser(description="render the owner's resume document (the steps, the prompt to paste, "
                                             "the hand-over) from the live state (R-O-9, R-O-10)")
    ap.add_argument("--no-docx", action="store_true", help="render the .md and the .txt only")
    ap.add_argument("--out", metavar="DIR", default=str(HERE), help="output folder (default: owner-docs/)")
    a = ap.parse_args(argv)
    out_dir = Path(a.out).resolve()
    try:
        out_dir.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        print("cannot create %s: %s" % (out_dir, e))
        return 2
    now, zone = now_local()
    text, prompt, unread, warnings, bad, left = render(now, zone)
    if bad:
        print("NOT WRITTEN: the prompt failed its guard: " + _ascii("; ".join(bad)))
        return 4
    md_path, txt_path = out_dir / MD_NAME, out_dir / TXT_NAME
    try:
        md_path.write_text(text, encoding="utf-8", newline="\n")
        txt_path.write_text(prompt, encoding="utf-8", newline="\n")
    except Exception as e:
        print("cannot write to %s: %s" % (out_dir, e))
        return 2
    words = len(text.split())
    print("md: %s (%d bytes, about %d words, about %d pages)"
          % (md_path, md_path.stat().st_size, words, max(1, round(words / 420.0))))
    print("txt: %s (%d bytes, %d words): the prompt alone, the same text as the box of section 2"
          % (txt_path, txt_path.stat().st_size, len(prompt.split())))
    for w in warnings:
        print("WARNING: " + _ascii(w))
    if left:
        print("placeholders left in the document: " + ", ".join(left))
    if unread:
        print("not read at render time: " + _ascii("; ".join(unread)))
    if a.no_docx:
        return 0
    return 0 if build_docx(md_path, out_dir / DOCX_NAME) else 3


# ------------------------------------------------------------------------------------------ the prompt --
PROMPT_TEMPLATE = r"""You are the owner's window of the 1-addic offline build program (the build of 7 November 2026). The owner parked the program on ${PARK_DATE_LONG} (${PARK_SHORT}) and resumes it now, in this window. This prompt is the owner's word to start the launcher. You are in C:\Users\ruchi\1-addic (the main folder; the trunk build/offline-v1 is checked out here; the lanes live in worktrees under C:\Users\ruchi\1-addic-wt\<lane>). Below, <docs> stands for docs/offline/build-2026-11-07. Time stamps come from `date`, never estimated.

The state at the park, as rendered ${STAMP}: the latest tag is ${LATEST_TAG} at ${LATEST_TAG_COMMIT} (${LATEST_TAG_DATE}; ${TAG_FACT}). The trunk tip was ${TRUNK_TIP}; the commits that carry the resume document follow it, so expect one or two newer "docs(HUB, ...)" commits on top of it. ${MERGED_COUNT} lane merges are on the trunk. The launcher loop is ${LOOP_WORD}; the tracks paused in the launcher: ${PAUSED_INLINE}. The status words: HUB ${HUB_STATE_WORD}, CORE ${CORE_STATE_WORD}, SCREENS ${SCREENS_STATE_WORD}. The owner's last line on file is ${LAST_RO}; the next free number is ${NEXT_RO}.

1. The order, and one standing rule. Do steps 2 and 3 before you read any program file. The launcher reads the first 300 KB of every chat's transcript in this folder. It counts a chat as a track's own chat when that text shows the opening sentence of the track's kickoff prompt: the words 'You are the', then a track's name in capitals, then the word 'chat'. A chat counted that way holds back the fresh chat of that track. So, for the whole life of this chat, never print any of these six files whole, nor any line of them that holds that sentence: <docs>/KICKOFF-PROMPTS.md, <docs>/owner-docs/${MD_NAME}, <docs>/owner-docs/build_resume_doc.py, <docs>/tools/fresh_chat_launcher.py, <docs>/tools/hook_context_restart.py, docs/offline/START-OR-RESUME.md. Search them with grep for the exact lines you need. Never write that sentence yourself. Keep the capital words HUB, CORE and SCREENS out of this chat's name. Never add this chat to <docs>/tools/token_roles.json: the launcher counts every chat listed there as its track's chat.

2. Verify the parked state. Change nothing in this step. Run each as its own command:
- `date`
- `git status --short` (expected: ${UNC_EXPECT})
- `git fetch origin`, then `git rev-parse --short=8 HEAD` and `git rev-parse --short=8 origin/build/offline-v1` (one revision per call; the two must be equal)
- `git tag -l "offline-v*"` (expected: ${TAGS_INLINE})
- `python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --status` (expected: the first line ends "loop NOT RUNNING (...)"; the second line reads "paused tracks: ${PAUSED_INLINE}"; the track rows are those of the last check before the park, not of now)
- `claude agents --json` (read only the rows of this folder: is a chat named "HUB hh:mm" of today already live? Is your own row's name free of the three capital words? ${PARK_LISTED_NOTE})
Never start a second loop, and never double a live launcher HUB. One known fault (FIX-LOOP-PID): the loop leaves its pid file behind when it stops, and the launcher takes any process with that number for its loop. The sign: the first line says "loop running (pid N)" while "last check" is more than five minutes old. Check it in PowerShell: `Get-CimInstance Win32_Process -Filter "ProcessId=N" | Select-Object Name,CommandLine`. If nothing is printed, or the command line does not name fresh_chat_launcher.py, the file is a leftover: delete ${LAUNCHER_HOME}\loop.pid (and loop.stop in the same folder, if it is there), tell the owner, then go on.

3. Start the launcher. This prompt is the owner's word for it (R-O-3 and R-O-7 stand).
- `python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --start` (expected: "loop started: pid N (alive: True)"; the answer "the loop already runs (pid N)" when step 2 showed no loop is the leftover pid file of step 2)
- about a minute later: `python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --launch-missing`. One exception: if step 2 showed a line "WEEKLY LIMIT: no launch for any track until <stamp>", do not run it yet, because it lifts that hold. Tell the owner the stamp and wait for the word that the limit has reset.
- then `--status` again. Expected: "loop running (pid N)"; a "last check" of this minute; a row "launched HUB <today>T<hh:mm> <id> (HUB <hh:mm>) because ${HUB_REASON} (...)"; and ${BUILD_EXPECT}. A HUB row "live 1 ... -> nothing to do" in its place is the case of step 4.
The fresh HUB chat runs on claude-fable-5-1 and starts from the HUB's own Resume here. It takes the HUB's work: the merges, the rulings, the gates, the tag. While a launcher HUB is live you do none of that work. When it is listed, send it one message: the owner's window hand-over that follows its Resume here in <docs>/tracks/HUB/RUN-RECORD.md is for it too (the hourly renewal, the idle chats that still have a process, the leftover watch loops, the watch rule).

4. If no fresh HUB chat is listed within five minutes, read the HUB row of `--status` and act on what it says.
- "free memory X GB, under 4.0": the memory hold. The loop tries again every two minutes. Tell the owner; close nothing yourself.
- a line "WEEKLY LIMIT: no launch for any track until <stamp>": tell the owner the stamp. Run `--launch-missing` (it lifts the hold) only when the owner says the limit has reset.
- a line "FAILED <when> HUB: ...": report it to the owner in its own words.
- "live 1" or more with "-> nothing to do", and no chat named "HUB hh:mm" of today: the launcher takes an open chat for the HUB: this one if a kickoff sentence was printed in it, a chat the roles file lists (the owner's window of 7 to 11 November, afc0ccd2), or an old "HUB hh:mm" chat that still has a process. An open chat that only waits still reads live for 30 minutes after each hourly renewal of its transcript file. Then force the launch, and only while no launcher HUB is live. In <docs>/coordination/status-HUB.md replace the first line that starts with STATE: by `STATE: RESTART   # <stamp from date> IST: the owner's window: the parked HUB's Resume here of ${HUB_UPDATED} IST stands; a fresh HUB is wanted`, and the first line that starts with UPDATED: by `UPDATED: <YYYY-MM-DD HH:MM> IST` (now, from `date`). Commit that one file by path (step 10) and push. The loop starts the HUB at its next check "because HAND-OVER written".

5. Then read, in this order, cutting long lines with `cut -c1-700`:
- the first three lines of <docs>/coordination/SPRINT-BOARD.md (STATE, NEEDS YOU, NEXT)
- the STATE, BASE, MERGING, MERGE-QUEUE, OWNER and UPDATED lines of <docs>/coordination/status-HUB.md (grep them; do not print the file)
- <docs>/tracks/HUB/RUN-RECORD.md from its last "## Resume here" heading to the end: the HUB's Resume here, then the owner's window hand-over of the park day
- every "## R-O-" heading of <docs>/coordination/outbox-OWNER.md, and its last entry whole
- the last two entries of <docs>/coordination/outbox-HUB.md
- the STATE and LANE lines of <docs>/coordination/status-CORE.md and <docs>/coordination/status-SCREENS.md
- <docs>/PLAN.md sections 4 (memory) and 8 (the merge), only when you need them.

6. Your first report to the owner, under one page: the time; the state against the paragraph above, with every difference named; what the launcher did; the board's NEEDS YOU items, one line each. Then ask for the weekly reading of /usage and its reset time: only the owner can read it.

7. Filing the owner's words. Every line of the owner that decides or asks for something is filed first: a new entry at the end of <docs>/coordination/outbox-OWNER.md, with the heading `## R-O-<n> · <YYYY-MM-DD HH:MM of the owner's message> · "<the owner's words, verbatim>"` and one paragraph: the words in full, when it was filed, what changes, who acts. The next number is ${NEXT_RO}. Copy the form of the last entry. Commit by path, push, then tell the live launcher HUB with SendMessage to its "HUB hh:mm" name. A chat's question for the owner goes to the owner in the chat's own words, with its default.

8. Waking the build tracks. ${WAKE_NOTE} After a pause is lifted, the fresh chat starts at the first check that finds no chat of the track reading live. An idle chat of the track that still has a process reads live for 30 minutes after each hourly renewal of its transcript file, so that check can be most of an hour away unless the HUB first ends those chats (`claude stop <id>`, R-O-7; the HUB's call). The work named toward ${NEXT_TAG}: ${NAMED_INLINE}.

9. Reports. Every 30 minutes, and at once at a merge, a tag, a red by name or a question for the owner (R-O-3). A report says: the time, the trunk tip, what merged, what runs, the reds by name, the questions with their defaults, and what is needed from the owner. Between reports stay quiet: use a small polling script under the Monitor tool that wakes you on a change, not a loop of steps. Give the script its own end (it exits by itself after about 35 minutes; start the next one after each report) and stop the old watch before you start a new one, because a watch script keeps running after its watch and its chat have ended.

10. The remit. You are the owner's interactive window: you file the owner's words in outbox-OWNER.md with the stamp, relay status, route the owner's walk findings to lanes by outbox, send builds with SendUserFile, and keep the owner's part moving. You merge only if no launcher HUB is live (check ListAgents or `claude agents --json` for a live "HUB hh:mm" first; one HUB at a time), using <docs>/PLAN.md section 8 and merge_lane.py (prepare, conflicts, guards, commit, finish; "merge(offline): <lane> READY|READY-SLICE <tip7>"). You never edit .claude/settings.json, never build a unit, never touch main, origin/main, the claude/* branches, docs/PLAN.md, docs/BUILD-GUIDE.md, docs/decisions/0001 to 0021, docs/book/, docs/program/, scripts/, data/, the pharma program or its launcher (kriya-hub). Commit only by path: `python docs/offline/build-2026-11-07/tools/hub_commit.py --track HUB --session <this chat's session link or id> -m "docs(HUB, <date>): ..." <paths>`. The tool stages only the named paths and writes the two trailers itself. Push build/offline-v1, lane branches and tags only. Never `git add -A`; never force-push, rebase, stash or check out over uncommitted work. The launcher's lines (--start, --stop, --restart, --resume, --launch-missing, --pause-track, --resume-track) and `claude stop <id>` of a dead chat of this program are allowed under R-O-7. When the owner asks for the build, send offline/1-addic.html with SendUserFile: ${APP_SHORT}.

11. Memory (<docs>/PLAN.md section 4). The machine is shared. Under 4.0 GB free nothing new starts and the newest run pauses at its next commit; a new run needs a memory row of 7.0 GB. `python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --mem` prints the reading and writes nothing. When memory holds the build, tell the owner; close nothing yourself. ${PARK_LOOPS_PROMPT}

12. The product house rules bind everything: SOS is never gated; nothing derived decreases; no streak resets, no shame line; no random rewards; no points for claimed sober days; nothing leaves the device; original words only, never the source book's text; crisis copy is marked for clinical review. Secrets and .env files are never committed.

13. Parking. When the owner says "park" or "day closed", or reads 98% weekly usage, do these nine steps in order (section 10 of the Word document has them in full): file the line; stop the loop (`--stop`), confirm "loop NOT RUNNING" and delete a leftover loop.pid; message the live chats to park; wait for their PARKED lines; append your hand-over to <docs>/tracks/HUB/RUN-RECORD.md under a heading that starts "## Owner's window hand-over" (never "## Resume here"); edit the PARK notes near the top of <docs>/owner-docs/build_resume_doc.py (print only that block, never the file whole) and run the generator; commit the four owner-docs files by path and push; send ${DOCX_NAME} with SendUserFile; confirm the final state.

14. Context. Over 250,000 tokens, write your hand-over under an "## Owner's window hand-over" heading in the HUB's run record, commit and push. At 300,000, tell the owner to open a fresh window with this same prompt, and stop. You write STATE: RESTART on status-HUB.md only as the forced launch of step 4, never while a launcher HUB is live.
"""


# ---------------------------------------------------------------------------------------- the template --
TEMPLATE = r"""---
title: 1-addic · Resume Prompt and Steps
subtitle: How to start the offline build again after a park, with the complete hand-over
accent: hub
cover: true
toc: true
confidential: false
auto_glossary: false
Prepared by: Claude, the owner's window of the build program (rendered by owner-docs/build_resume_doc.py)
Date: ${DATE_LONG}, ${TIME}
Edition: Park of ${PARK_DATE_LONG}; latest tag ${LATEST_TAG}; trunk build/offline-v1 at ${TRUNK_TIP}
Status: Rendered from the live state at ${STAMP}; ${HEAD_STATUS}
---

> [!SUMMARY]
> **What this is.** The one document the owner needs to start the 1-addic offline build again after a park. Part A is yours: six steps, the prompt to paste, and the seven things only you can answer. Part B is the complete hand-over: where the build stopped, what remains toward `${NEXT_TAG}`, how the start works, how the program runs and the decisions in force.
> **Where we are.** The app stands at the tag `${LATEST_TAG}` (${LATEST_TAG_DATE}) with every gate green. The program was parked on ${PARK_DATE_LONG}: ${PARK_SHORT}. The launcher loop is ${LOOP_WORD}, so nothing runs and nothing spends usage until you start it.

${UNREAD}

# Part A · Resume

## 1 Steps to resume

1. **Open Claude Code** in the folder `C:\Users\ruchi\1-addic`.
2. **Start a new chat** and name it `${NEXT_WINDOW}`: type `/rename ${NEXT_WINDOW}`, or rename it in the app's session list. Use a new chat, not last night's window. Keep the capital words HUB, CORE and SCREENS out of the name, or the launcher takes the chat for one of its own.
3. **Paste the prompt** of section 2 into it. Or send the one line below this list: it makes the chat read the same prompt from a file.
4. **Wait five to ten minutes.** The chat checks the parked state and starts the launcher. The launcher starts a fresh chat named "HUB hh:mm". If it has not done so within five minutes, the chat forces that start by itself (section 6.4). Then the chat gives you a short first report.
5. **Send your lines.** The chat files each one and passes it on. `continue v3.3` wakes the build. Section 3 lists what else helps.
6. **To stop for the day,** say `park`. The chat stops the launcher, parks the chats and sends you this document again, refreshed.

The one line for step 3:

```
Read docs/offline/build-2026-11-07/owner-docs/${TXT_NAME} and follow it. It is my resume prompt for the 1-addic offline build.
```

**What you will see.**

| When | What you see | What it means |
|---|---|---|
| In the first minute | The chat runs `date`, `git status`, the launcher's `--status` and `claude agents` | It checks that the park is intact before it changes anything. |
| After about two minutes | "loop started: pid N (alive: True)" | The launcher runs again. It checks every two minutes. |
| After five to ten minutes | A chat named "HUB hh:mm" in the session list | The fresh HUB chat. It merges, rules and tags. You do not need to type in it. |
| Then | The first report: the state, what the launcher did, what is needed from you | The chat also asks for your `/usage` reading. |
${SEE_BUILD_ROW}
| Every 30 minutes | A short report | It also comes at once at a merge, a tag, a red by name or a question for you. |

**If something looks wrong.**

| What you see | What to do |
|---|---|
| The chat says free memory is under 4.0 GB | Nothing, or close other programs. The launcher tries again every two minutes by itself. |
| The chat reports a line "WEEKLY LIMIT" | The weekly usage limit holds every start until the time it names. When `/usage` shows the limit has reset, say `the limit has reset`. |
| No chat named "HUB hh:mm" after ten minutes | Say `force the HUB launch`. Section 6.4 explains it. |
| "loop running" or "the loop already runs", yet nothing happens | Say `check the stale loop.pid`. Section 6.5 explains it. |
| You typed in last night's window by mistake | Leave it alone for 30 minutes. Or paste the prompt of section 2 there: that window then forces the HUB launch. |
| A question you cannot answer | Say `use the default`. Every question comes with one. |
| A report names a red | Nothing, unless the report asks you. A red is a failed check, and its lane fixes it by name. |

**One thing left running.** ${PARK_LOOPS_SHORT}

<!-- pagebreak -->

## 2 The prompt to paste

Paste everything inside the box into the new chat, as its first message. The same text is in the file `docs/offline/build-2026-11-07/owner-docs/${TXT_NAME}`.

```
${PROMPT}
```

<!-- pagebreak -->

## 3 What is needed from you

Nothing here blocks the start. Each item has a fallback, so the build never waits on a guess.

| # | The item | What to send | If you send nothing |
|---|---|---|---|
| 1 | The walk of `${LATEST_TAG}` | Use the app file on your phone and on your computer. Send what you find in one message. `send me the app file` makes the chat send it. | The fixes already named are built. The walk's findings wait for a later tag. |
| 2 | I6: the India crisis numbers | The numbers you have confirmed, each with its source and the date you checked it. | Every number keeps the words "please verify", and the unit V-10b waits. |
| 3 | The word to build | `continue v3.3` | The build tracks stay paused. Nothing spends usage. |
| 4 | The usage reading | The weekly percentage from `/usage` and its reset time, when the chat asks. Say `park` at 98%. | The chat cannot see the limit, so a chat can stop mid-step when the limit is reached. |
| 5 | ES1 | Only if you want it back: `reverse ES1`. In discreet mode the line 'If you are in danger, call your local emergency number' no longer shows while the app loads. It stood under the 'Notebook' title for up to 4 seconds and gave the app away. | The change stays (R-H-51). |
| 6 | V-Q8: the clinical reader | Who reads `CLINICAL-REVIEW-PACK.md`, and by when. | No safety copy changes. Crisis copy stays marked for clinical review. |
| 7 | O-Q1, for the online app only | Is SOS open before sign-up? | The default stands: yes. Nothing changes in the offline edition. |

> [!NOTE]
> **The board's own line for you, read live** (`coordination/SPRINT-BOARD.md`, NEEDS YOU): ${BOARD_NEEDS}

<!-- pagebreak -->

# Part B · The hand-over

## 4 Where we stopped

**Why it is parked:** ${PARK_REASON}

| Time (IST), ${PARK_DATE_LONG} | What happened |
|---|---|
${PARK_TIMELINE}

**The state, read live.** Rendered **${STAMP}**. The trunk is `${BRANCH}` at `${TRUNK_TIP}` (`${TRUNK_LOG}`). Pushed: ${PUSHED_LINE}. Lane merges recorded on status-HUB.md: ${MERGED_COUNT}. Uncommitted: ${UNCOMMITTED}. The app file: ${APP_LINE}.

**The tags.**

| Tag | Commit | Tagged | What it is |
|---|---|---|---|
${TAG_ROWS}

The gates at `${LATEST_TAG}`: ${TAG_FACT}.

**The last hand-over headings** in `tracks/HUB/RUN-RECORD.md`. A fresh HUB chat starts from the last "Resume here" heading and reads to the end of the file, so the owner's window hand-over below it is read too.

- The HUB's: ${RESUME_HEAD}
- The owner's window's: ${HANDOVER_HEAD}

**The board, read live** (`coordination/SPRINT-BOARD.md`).

- STATE: ${BOARD_STATE}
- NEXT: ${BOARD_NEXT}

### 4.1 The HUB (status-HUB.md)

| Line | Value (cut to about 300 characters) |
|---|---|
${HUB_HEADER}

### 4.2 CORE (status-CORE.md)

| Line | Value |
|---|---|
${CORE_HEADER}

Lanes of CORE. The tip is `git rev-parse --short build/<lane>`; "pushed" compares it with origin as last fetched.

| Lane | Lane line says | Branch tip | Pushed | Note on the lane line |
|---|---|---|---|---|
${CORE_LANES}

### 4.3 SCREENS (status-SCREENS.md)

| Line | Value |
|---|---|
${SCREENS_HEADER}

Lanes of SCREENS:

| Lane | Lane line says | Branch tip | Pushed | Note on the lane line |
|---|---|---|---|---|
${SCREENS_LANES}

### 4.4 The launcher

The launcher's own status (`python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --status`, first 14 lines, ${LAUNCHER_WORD}). The track rows are those of its last check, not of now.

```
${LAUNCHER}
```

Read from it at render time:

- The loop: ${LOOP_WORD}. ${PID_NOTE}
- Tracks paused in the launcher: ${PAUSED_INLINE}.
- The last check: ${LAST_CHECK}.
- The last loop line of its log: ${LAST_LOOP}
${LIMIT_LINE}

### 4.5 What was in flight

${IN_FLIGHT}

### 4.6 The chats after the park

The chats of this folder on the park night, with how `claude agents` lists each. None of them needs anything at the start. A chat that still has a process reads live to the launcher for half of every hour (section 6.2).

| Chat | Session | Listed as | What it is |
|---|---|---|---|
${PARK_CHATS}

**Memory on the park day.** ${PARK_MEMORY}

### 4.7 Leftover watch loops

A chat watches the status files with a small script that looks at them once a minute. When the watch ends, or its chat ends, the script's process keeps running. ${PARK_LOOPS_NOTE}

| Loops | Script | The chat it belonged to | Running since |
|---|---|---|---|
${PARK_LOOPS}

The loops only read files. They change nothing and spend no usage, and nothing depends on them. They do hold memory, on a machine where a new run waits for a reading of 7.0 GB. Three ways to deal with them, whichever you prefer:

1. **Leave them.** Nothing breaks.
2. **Ask the chat.** Say `end the leftover watch loops` in the new owner's window, and approve the request if the app asks you.
3. **Do it yourself.** Paste this one line into a PowerShell window. It ends these loops and nothing else:

```
${PARK_LOOPS_COMMAND}
```

A restart of the computer clears them too. It also ends every open chat of every program, so do not restart for this alone.

${PARK_LOOPS_OTHERS}

<!-- pagebreak -->

## 5 What remains (toward ${NEXT_TAG})

The app is whole at `${LATEST_TAG}`. What follows is small: fixes by name, then the same closing steps as every tag. **Done** means a `MERGED:` line of status-HUB.md names the unit on its lane. **Pending** means it is not merged yet.

| The unit | Lane | Track | Status | What it is |
|---|---|---|---|---|
${NAMED_TABLE}

**Pending at render time:** ${NAMED_INLINE}.

**The closing steps**, once the named fixes are merged (the HUB's work):

| Step | What happens |
|---|---|
${TAIL_TABLE}

**Tooling still open.** None of these changes the app, and none is needed for the tag.

| The unit | Where | What it is |
|---|---|---|
${TOOLING_TABLE}

<!-- pagebreak -->

## 6 How the start works

The launcher decides by rule, from each track's status word and from the chats it counts as live. This section says what it does at the start, and what can go wrong.

### 6.1 What the launcher does at the start

| Track | Status word | Paused in the launcher | At the start | What wakes it |
|---|---|---|---|---|
${EXPECT_TABLE}

### 6.2 The rules behind it

- **A fresh chat for a track** starts when no chat of the track is live and the track's last step is at least 30 minutes old. `--launch-missing` drops the 30 minutes for one check.
- **A chat is live** when `claude agents` lists it, its process exists and its transcript was written in the last 30 minutes.
- **An open chat that only waits still reads live for half of every hour.** Its transcript file is renewed about once an hour with no step added, and the launcher counts the 30 minutes after that as live. Section 4.6 names the chats this applies to.
- **A status word that hands over** (RESTART, HANDOVER, HAND-OVER) starts a fresh chat "because HAND-OVER written", unless a newer chat of the track started after the UPDATED line.
- **A stop word** starts nothing: COMPLETE, COMPLETED, CLOSED, PAUSED, STOPPED, STOP, END, WAITING-OWNER, DONE, and READY for a build track.
- **Any other word** (PARKED, WATCHING, WAITING) starts a fresh chat "because NO CHAT live".
- **A build track** also needs the `BASE-READY` line and its name on the `TRACKS-ALLOWED` line of status-HUB.md.
- **Nothing starts** while a track is paused in the launcher, while free memory is under 4.0 GB, or while a weekly-limit hold is on.
- **The models:** the HUB runs on `claude-fable-5-1` (effort high), CORE and SCREENS on `claude-opus-5-5`.
- **The loop** checks every two minutes. `--status` prints the rows of its last check.

### 6.3 Three ways the owner's window is taken for a track's chat

Each one makes the launcher count a live chat of that track. It then starts no fresh one.

**First: the transcript shows a kickoff sentence.** The launcher reads the first 300 KB of every chat's transcript. If that text holds the opening sentence of a track's kickoff prompt, the chat counts as that track's chat. Six files hold such sentences, so the owner's window never prints them whole:

| File | Why it holds one |
|---|---|
| `docs/offline/build-2026-11-07/KICKOFF-PROMPTS.md` | The kickoff prompts themselves. |
| `docs/offline/build-2026-11-07/owner-docs/${MD_NAME}` | Section 9 of this document, as Markdown. |
| `docs/offline/build-2026-11-07/owner-docs/build_resume_doc.py` | The generator of this document. |
| `docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py` | The launcher builds the prompts. |
| `docs/offline/build-2026-11-07/tools/hook_context_restart.py` | The restart hook names them. |
| `docs/offline/START-OR-RESUME.md` | The older start guide. |

**Second: the roles file lists the chat.** `tools/token_roles.json` maps the first eight characters of a session id to a track. Only the launcher writes it, one line per chat it starts, or a person by hand. The owner's window of 7 to 11 November (session afc0ccd2) is listed there as a HUB chat, which is why the start uses a new chat. A new owner's window is not listed, and it must never be added.

**Third: the chat's name holds a track's name.** A session name with the capital word HUB, CORE or SCREENS counts for that track. A name such as `${NEXT_WINDOW}` is safe.

### 6.4 The forced launch

If the launcher counts an open chat as a live HUB, no fresh HUB starts. This is likely at a start, because an open chat of the HUB track reads live for half of every hour (section 6.2). The owner's window then forces the launch, and only while no launcher HUB is live:

1. On `coordination/status-HUB.md` it replaces the STATE line with `STATE: RESTART` and a note, and the UPDATED line with the time now.
2. It commits that one file by path and pushes.
3. At its next check the loop starts a fresh HUB "because HAND-OVER written". The fresh HUB reads its Resume here and writes its own STATE line.

The prompt tells the chat to do this by itself when five minutes pass with no fresh HUB. You can also say `force the HUB launch`.

### 6.5 The leftover loop.pid file

This fault was found at the park of 11 November 2026. It is not fixed in the launcher yet: the unit FIX-LOOP-PID of section 5.

The launcher keeps the number of its loop's process in a file, `loop.pid`, in the folder `${LAUNCHER_HOME}`. `--stop` ends the loop but leaves the file. Later, Windows can give the same number to another program. The launcher then believes its loop still runs.

| The launcher says | What is really happening |
|---|---|
| `--status`: "loop running (pid N)", with a "last check" more than five minutes old | No loop runs. Nothing is checked and nothing starts. |
| `--start`: "the loop already runs (pid N)" | Nothing was started. |
| `--stop`: it waits 130 seconds, then "loop N did not stop in time" | It leaves a second file, `loop.stop`. The next real loop would exit at its first pass. |
| `--restart` | It fails for the same reason. |

**The check**, in PowerShell, with the number the launcher printed:

```
Get-CimInstance Win32_Process -Filter "ProcessId=N" | Select-Object Name,CommandLine
```

If nothing is printed, or the command line does not name `fresh_chat_launcher.py`, the file is a leftover. **The fix:** delete `loop.pid` (and `loop.stop`, if it is there) in that folder, then run `--start`. You only say `check the stale loop.pid`.

At render time: ${PID_NOTE}

### 6.6 CORE and SCREENS after the pause is lifted

Both build tracks were paused in the launcher on 9 November (R-H-56), because a chat that only waits was relaunched about every hour and spent usage for nothing. The HUB lifts a pause with `--resume-track <TRACK>` when an owner line asks for work. What happens next depends on the track's status word:

${WAKE_LIST}

One thing can delay a fresh chat: idle chats of the track that still have a process (section 4.6). Each reads live for half of every hour, so the first check that finds none of them live can be most of an hour away. The HUB can shorten the wait by ending those chats first (`claude stop <id>`, R-O-7).

### 6.7 The memory hold

The machine is shared with other programs. Under 4.0 GB free the launcher starts nothing and says so in the track's row: "free memory X GB, under 4.0". It tries again every two minutes, so nothing has to be done. `--mem` prints the reading and writes nothing. Section 4.6 has the readings of the park day, and section 4.7 names leftover loops that hold a little of it.

<!-- pagebreak -->

## 7 How the program runs

The build runs as three Claude Code chats started by the launcher: the HUB, which merges and tags, and CORE and SCREENS, which build. The owner's window is the fourth chat: it files your words, relays status and keeps your part moving.

**Branches and folders.**

| Thing | Where | What it is |
|---|---|---|
| The trunk | `build/offline-v1`, checked out in `C:\Users\ruchi\1-addic` | The one branch the HUB merges into and pushes. Nobody else moves it. The owner's window commits program documents on it by path. |
| Lane branches | `build/<lane>`, one per lane | ${CORE_LANE_NAMES} (CORE); ${SCREENS_LANE_NAMES} (SCREENS). Cut from the BASE line of status-HUB.md, never from main. |
| Lane worktrees | `C:\Users\ruchi\1-addic-wt\<lane>` | Where a lane's branch is checked out and built. Only that lane's chat edits it. |
| `_int` | `C:\Users\ruchi\1-addic-wt\_int` | The integration worktree. The HUB merges a lane here, runs the gates on the merged tree, then fast-forwards the trunk. Detached at the trunk tip between merges. |
| `_base` | `C:\Users\ruchi\1-addic-wt\_base` | Read-only, at BASE-READY 655516dc. |
| `_logs` | `C:\Users\ruchi\1-addic-wt\_logs` | Gate logs (`gates\<lane>\`), merge logs (`merges\`), reports. Every verdict cites a log path. |
| `_locks` | `C:\Users\ruchi\1-addic-wt\_locks` | `1-addic.lock`: the test, browser and docs gates take it in arrival order, so two suites never run at once. |
| Program files | `docs/offline/build-2026-11-07/` | PLAN.md, PLAN-V3.md, KICKOFF-PROMPTS.md, `coordination/` (status files, outboxes, the board, baselines), `tracks/<TRACK>/RUN-RECORD.md`, `tools/`, `owner-docs/` (this document). |

**The launcher** (`python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py ...`): a loop that checks every two minutes and starts a fresh chat when a track needs one. It starts the HUB on `claude-fable-5-1` (effort high) and CORE and SCREENS on `claude-opus-5-5`, each with its kickoff block from `KICKOFF-PROMPTS.md` plus a resume line. It relaunches a chat whose status file says `STATE: RESTART` (a chat hands over at 300k context) or that has no live session for 30 minutes, unless the track's status word is a stop word or the track is paused (section 6.2). It never launches under 4.0 GB free. Its state and log live in `%LOCALAPPDATA%\1-addic-hub\launcher\`. Commands:

| Command | What it does |
|---|---|
| `--start` | Starts the loop (detached; after a machine restart run this first). |
| `--launch-missing` | One check with the 30-minute rule off: every track without a live chat is launched now. Run it after `--start`. |
| `--status` | The loop, the pause, the last check, the chats per track. |
| `--stop` | Ends the loop. The launched chats live on. The first step of parking. |
| `--pause-track CORE` / `--resume-track CORE` | One track's pause and resume (also SCREENS, HUB). |
| `--pause "<reason>"` / `--resume` | The global pause. |
| `--restart` | `--stop`, then `--start`. |
| `--mem` | Prints the free-memory reading and writes nothing. |

**The memory rule** (PLAN.md section 4): the machine is shared. Under 4.0 GB free, the newest run pauses at its next commit (a tier 2 run first when one runs); a new run needs a row of 7.0 GB free; at 4.0 GB or more, paused work resumes, tier 1 first. The loop writes a memory row every ten minutes to `coordination/lane-widening.md`. The pharma program's chats are the main brake: when they run, this build waits. Nothing is lost by a pause: every branch is pushed.

**The merge recipe** (PLAN.md section 8; the HUB alone, one lane at a time, always the tip the status file names, from the main folder):

```
python docs/offline/build-2026-11-07/tracks/HUB/workflows/merge_lane.py prepare <lane> <tip> <base>
python docs/offline/build-2026-11-07/tracks/HUB/workflows/merge_lane.py conflicts <lane>        (only if prepare lists any)
python docs/offline/build-2026-11-07/tracks/HUB/workflows/merge_lane.py guards <lane> <base>
python docs/offline/build-2026-11-07/tracks/HUB/workflows/merge_lane.py commit <lane> <msgfile>
python docs/offline/build-2026-11-07/tracks/HUB/workflows/merge_lane.py finish <lane> <tip7> --hub --push
```

The message file's subject is `merge(offline): <lane> READY <tip7>` or `merge(offline): <lane> READY-SLICE <tip7>`, with the two trailers. A red by name: `abort <lane>`, the evidence to the lane, round 1 of 2. After a merge: the BASE line, a `MERGED:` line, a "from the HUB" note on the lane's status file, the run record, the board, commit, push.

**The gates** (`python docs/offline/build-2026-11-07/tools/gates.py --wt <worktree> --lane <lane> [--full] build test validate guards browser docs`): one `GATE <name> GREEN|RED|SKIP|VOID` line per gate and `FAIL <name>` lines; judged by failure name against `coordination/baselines.md`, never by count or exit code. A lane is green when every test it adds passes and nothing green on the base is red on the branch. The browser gate is the heavy one; the full suite runs once, in the quiet window, by the HUB.

**The commit discipline:** `python docs/offline/build-2026-11-07/tools/hub_commit.py --track HUB --session <session link> -m "docs(HUB, <date>): ..." <paths>` from the main folder. It stages and commits only the paths named and adds the two trailers (`Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` and `Claude-Session: <link>`). Never `git add -A`; never force-push, rebase, stash or check out over uncommitted work; only the HUB (or the owner's window when no launcher HUB is live) pushes, and only `build/offline-v1`, the lane branches and the tags.

<!-- pagebreak -->

## 8 The decisions in force

**The owner's words** (every R-O heading of `coordination/outbox-OWNER.md`, quoted whole; ${RO_COUNT} so far; the next number is ${NEXT_RO}):

${RO_BLOCK}

**The HUB's rulings still in force** (`coordination/outbox-HUB.md` has each one whole):

| Ruling | What it says |
|---|---|
${RULINGS}

**The V3 defaults** (PLAN-V3.md sections 5 and 7; the owner's R-O-7 took V-Q1 to V-Q13 at their defaults):

- The V3 line is tagged `offline-v3.x` (V-Q1). The tags so far: ${TAGS_INLINE}. The next is `${NEXT_TAG}`.
- The status layer is a page, "Your Harbor", at `#/status`, reached in one tap from Today (V-Q2, V-Q3, V-Q6).
- The 14-day strip shows dated dots without a count (V-Q4); "what just changed" is since the page was last drawn this session (V-Q5).
- The India crisis numbers: none cleared yet; every number keeps "please verify" (V-Q7). The clinical review pack is produced; no copy changes before the reviewer's answers (V-Q8).
- The run: one grace day a week keeps the run and shows as "kept" (V-Q9). A day shown up is any day with a log, a lesson, a practice, an objective or an SOS drill; never a claimed sober day (V-Q12). It shows in Today's header and in Your Harbor's "Where you stand"; never a push, a countdown or a shame line (V-Q13).
- Three daily objectives a day: two drawn by date and state, one the person may swap once a day; done by a tap or by the matching event (V-Q11).
- The quest-line opens features earlier than the modules would; nothing open in v1.1 locks; tools, mini-games and the Explorer are never a reward; never SOS, help, lessons, Settings, export or the person's data (V-Q10 as read by R-H-44; the owner may still say "V-Q10: lock <names> until earned").

**The product house rules** (bind every lane; never cut): SOS is never gated. Nothing derived ever decreases. No streak resets, no shame line. No random rewards. No points for claimed sober days. Nothing leaves the device (no network call, no tracker, no remote font). Original words only, never the source book's text. Every screen that is not finished shows an honest state, never a dead button.

<!-- pagebreak -->

## 9 Starting a build chat by hand

Use this only when the launcher cannot start a build chat, or when a build track has work while its status word is a stop word (section 6.6). The start is yours: open a new chat in `C:\Users\ruchi\1-addic` on the model `claude-opus-5-5`, name it `CORE <HH:MM>` or `SCREENS <HH:MM>` with the time now, and paste the prompt as its first message. Each prompt sends the chat to its full kickoff block in `KICKOFF-PROMPTS.md`, so the wording the launcher uses reaches it whole.

> [!WARNING]
> **Never paste these two prompts into the owner's window, and never ask it to print them.** Each opens with a kickoff sentence on purpose, so that the launcher counts the new chat for its track. In the owner's window the same sentence would make the launcher take that window for a build chat.

**CORE** (lanes ${CORE_LANE_NAMES}):

```
ultracode. You are the CORE chat of the 1-addic offline edition build of 7 November 2026 (`docs/offline/build-2026-11-07/PLAN.md`), started by hand by the owner because the launcher could not start you. Your full kickoff is the fenced block under "# Prompt 1 · CORE" in docs/offline/build-2026-11-07/KICKOFF-PROMPTS.md: read it first and follow it as if the launcher had given it to you (it names your lanes, the rules, the records and the V3 units). Then resume: read your status file coordination/status-CORE.md and tracks/CORE/RUN-RECORD.md, then continue from the last finished step; a workflow run your run record names as running is alive only if its session is still listed by `claude agents`: if that session is gone, the run died with it, so relaunch that lane with done and priorNote from its branch's last commit and its progress notes, never wait for it. The program was parked on ${PARK_DATE_LONG} (${PARK_SHORT}) and is resuming now; the HUB merges, you build. Memory (PLAN.md section 4): never start a run under 4.0 GB free; a new run needs a row of 7.0 GB; under 4.0 GB the newest run pauses at its next commit. Rewrite your status file at every step: STATE with a note, one LANE line per lane with its state and tip (NEW, SCOUTED, BUILDING, CHECKING, REVIEWING, READY-SLICE <tip>, READY <tip>, RED <round>, MERGED, PAUSED <tip>), UPDATED from `date`. Over 250,000 tokens plan the hand-over; at 300,000, at the next safe point, write the run record and STATE: RESTART, then stop. Your lanes at parking: ${CORE_LANES_INLINE}.
```

**SCREENS** (lanes ${SCREENS_LANE_NAMES}):

```
ultracode. You are the SCREENS chat of the 1-addic offline edition build of 7 November 2026 (`docs/offline/build-2026-11-07/PLAN.md`), started by hand by the owner because the launcher could not start you. Your full kickoff is the fenced block under "# Prompt 2 · SCREENS" in docs/offline/build-2026-11-07/KICKOFF-PROMPTS.md: read it first and follow it as if the launcher had given it to you (it names your lanes, the rules, the records and the V3 units). Then resume: read your status file coordination/status-SCREENS.md and tracks/SCREENS/RUN-RECORD.md, then continue from the last finished step; a workflow run your run record names as running is alive only if its session is still listed by `claude agents`: if that session is gone, the run died with it, so relaunch that lane with done and priorNote from its branch's last commit and its progress notes, never wait for it. The program was parked on ${PARK_DATE_LONG} (${PARK_SHORT}) and is resuming now; the HUB merges, you build. Memory (PLAN.md section 4): never start a run under 4.0 GB free; a new run needs a row of 7.0 GB; under 4.0 GB the newest run pauses at its next commit. Rewrite your status file at every step: STATE with a note, one LANE line per lane with its state and tip (NEW, SCOUTED, BUILDING, CHECKING, REVIEWING, READY-SLICE <tip>, READY <tip>, RED <round>, MERGED, PAUSED <tip>), UPDATED from `date`. Over 250,000 tokens plan the hand-over; at 300,000, at the next safe point, write the run record and STATE: RESTART, then stop. Your lanes at parking: ${SCREENS_LANES_INLINE}.
```

From a terminal the same start is `claude --bg --name "CORE <HH:MM>" --model claude-opus-5-5 "<the prompt>"`.

## 10 Parking again

What the owner's window does when you say `park` or `day closed`, or when you read 98% weekly usage (R-O-9 and R-O-10). In this order:

1. File the owner's line in `coordination/outbox-OWNER.md`, commit by path, push.
2. Stop the launcher first, so no fresh chat starts: `python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --stop`. Confirm that `--status` says "loop NOT RUNNING". Delete `loop.pid` if it is left behind (section 6.5).
3. Message each live chat (`claude agents --json` lists them) to park: finish or pause its runs at the next clean point, write its Resume here in its run record and the PARKED line on its status file, commit by path and push its branch. A merge in progress finishes if its gates are already green; otherwise it is aborted before guards.
4. Wait for the PARKED lines on the status files. A track that is paused and has no live chat keeps its line.
5. Append the owner's window hand-over to `tracks/HUB/RUN-RECORD.md`, after the HUB's Resume here, under a heading that starts "## Owner's window hand-over". Never head it "## Resume here": a fresh HUB starts from the last heading of that name.
6. Edit the PARK notes near the top of `owner-docs/build_resume_doc.py` (the day, the reason, the timeline, the chats, the memory note, the leftover watch loops of section 4.7). Then run the generator: `python docs/offline/build-2026-11-07/owner-docs/build_resume_doc.py`.
7. Commit the four files by path with `tools/hub_commit.py`: `build_resume_doc.py`, `${MD_NAME}`, `${TXT_NAME}` and `${DOCX_NAME}`. Then `git push origin build/offline-v1`.
8. Send `${DOCX_NAME}` to the owner with SendUserFile.
9. Confirm: `git status --short` shows no program file; origin is at the trunk tip; `git tag -l "offline-v*"` lists the tags; `--status` says "loop NOT RUNNING"; no `loop.pid` is left.

> [!NEXT]
> **To resume:** open Claude Code in `C:\Users\ruchi\1-addic`, start a new chat named `${NEXT_WINDOW}`, paste the prompt of section 2 and let the chat start the launcher. Then send `continue v3.3`, your walk's findings or I6 when you are ready. Everything the program needs is in the pushed branches and in this document.
"""

if __name__ == "__main__":
    sys.exit(main())
