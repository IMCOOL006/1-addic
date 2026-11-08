#!/usr/bin/env python3
"""build_resume_doc.py - the owner's resume-prompt document (R-O-9, 2026-11-08 08:53 IST), rendered from the live state.

    python docs/offline/build-2026-11-07/owner-docs/build_resume_doc.py [--no-docx] [--out <dir>]

What it reads, live, at render time (nothing is cached; every read that fails prints its reason in the document
instead of stopping the render):
  - the clock: the machine's local time (IST on the owner's machine; the zone is checked and named);
  - git in the main folder: the trunk tip (`git rev-parse --short HEAD`, `git log --oneline -1`), the branch name,
    origin's tip as last fetched (no fetch is run: no network), the tags `offline-v*`, each lane branch's tip
    (`git rev-parse --short build/<lane>` for every lane the status files name) and the count of uncommitted files
    (`git status --short`);
  - the status files coordination/status-HUB.md, status-CORE.md, status-SCREENS.md: their STATE, LANE, BASE,
    MERGING, MERGE-QUEUE, SLOTS-ALLOWED, OWNER, RULING, UPDATED lines and the count of `MERGED:` lines (each line cut
    to about 300 characters in the tables);
  - every `## R-O-<n> · <stamp> · <words>` heading of coordination/outbox-OWNER.md, quoted whole (the owner's
    decisions), and the next free R-O number for the HUB prompt;
  - the last "Resume here" heading of tracks/HUB/RUN-RECORD.md;
  - the launcher's status: `python <docs>/tools/fresh_chat_launcher.py --status`, first 12 lines (it works when the
    loop is stopped too).
The fixed text is the template at the end of this file (Markdown with ${PLACEHOLDERS}).

What it writes: <out>/1-addic-Resume-Prompt.md (default <out> = this folder, owner-docs/), then
<out>/1-addic-Resume-Prompt.docx beside it through the word-doc-generator skill's gen_docx.py, found at run time under
~/.claude*/skills/word-doc-generator/ (or the GEN_DOCX environment variable); if it is not found, the command to run
is printed and the exit code is 3. Standard library only; no network. Re-runnable: at the 98% trigger the owner's
window runs the one command above, then commits the three files by path with tools/hub_commit.py and pushes.

Exit codes: 0 both files written; 3 the .md written but no .docx (gen_docx.py missing or failed); 2 bad arguments or
the output folder not writable.
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
MD_NAME = "1-addic-Resume-Prompt.md"
DOCX_NAME = "1-addic-Resume-Prompt.docx"
TAG = "offline-v3.0"
CELL = 300                                          # characters per table cell

# The chain to the tag, in order (PLAN-V3.md section 7 and the HUB's "Next:" / MERGE-QUEUE lines). A unit is DONE when a
# `MERGED:` line of status-HUB.md names it; otherwise its lane's LANE line says where it stands.
CHAIN = [
    ("V-42", "content", "SCREENS",
     "the quest-line's words: content-quests.js with Content.questLine (8 to 12 steps), Content.objectives (a pool of "
     "about 20), the run's words, the Content.xp rows, the JIT tutorials and help entries"),
    ("V-41", "actions-sos", "CORE, flagged",
     "the verbs: Actions.objective.done and swap, Actions.questLine.claim; a refusal returns ok:false and never throws; "
     "sample mode writes nothing of the person's own"),
    ("V-46", "core", "CORE, flagged",
     "the app's chrome builds its feature set from Engine.unlocked, so a reward the quest-line opened shows"),
    ("V-43", "today-track", "SCREENS",
     "Today's objectives card, the run line in the header, the quest-line's current step card; Your Harbor's growth "
     "elements and the spine 'Your way'"),
    ("V-28", "game-tutorials", "SCREENS",
     "the tour step on status-open, the JIT wiring and the 'New' dot for the status feature (unlock surfaces, part 1)"),
    ("V-44", "game-tutorials", "SCREENS",
     "the reward sheet on a claim ('You unlocked ...'); the tools and game surfaces honour Engine.unlocked; the JIT "
     "tutorials and tour steps for the three features (unlock surfaces, part 2)"),
    ("V-45", "tests-docs", "CORE",
     "three browser flows (an objective done grows the harbor; a break keeps best and total; a quest-line step unlocks "
     "a feature), their hooks, the guide lessons for the three, screenshots"),
    ("V-01t", "tests-docs", "CORE",
     "the status layer's browser flows, their hooks, the #/status screenshots and the guide lesson Your Harbor"),
]
TAIL = [
    ("FREEZE", "no new unit starts after the chain's last READY; fixes by name only"),
    ("Full gates", "the HUB runs every gate on the integration worktree at the trunk tip (the quiet window): "
                   "python docs/offline/build-2026-11-07/tools/gates.py --wt C:/Users/ruchi/1-addic-wt/_int --lane hub "
                   "--full build test validate guards browser docs"),
    ("Reds by name", "every FAIL line is read by name against coordination/baselines.md; a red is fixed by its lane "
                     "(by territory), then the gate runs again"),
    ("Tag " + TAG, "git tag -a " + TAG + " on the trunk in the main folder, then git push origin " + TAG),
    ("Release copy", "offline/releases/1-addic-v3.0.html kept as the file at the tag (as 1-addic-v1.1.html is for "
                     "offline-v1.1), committed and pushed; the hand-off note in tracks/HUB/RUN-RECORD.md"),
]
TIER2 = ("core V-16, V-17a, V-26a; actions-sos V-25, V-18, V-17b; learn V-20; content V-23; game-tutorials V-21; "
         "workbook-settings V-24, V-22b; tests-docs V-22a, V-26b, V-27, V-29; the HUB's tooling V-12 to V-15 and the "
         "review pack V-09")


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
LINE_RE = re.compile(r"^(STATE|BASE|MERGING|MERGE-QUEUE|SLOTS-ALLOWED|OWNER|RULING|UPDATED|TRACKS-ALLOWED):\s*(.*)$")
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
    return (info["lines"].get("STATE", "").split() or ["-"])[0]


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


def last_resume_heading():
    try:
        heads = [l.rstrip() for l in RUN_RECORD.read_text(encoding="utf-8-sig").splitlines()
                 if l.startswith("## Resume here")]
        return heads[-1] if heads else "no 'Resume here' heading found in tracks/HUB/RUN-RECORD.md"
    except Exception as e:
        return "tracks/HUB/RUN-RECORD.md could not be read: %s" % e


def launcher_status():
    if not LAUNCHER.is_file():
        return False, "the launcher script is missing: %s" % LAUNCHER
    ok, out = run([sys.executable, LAUNCHER, "--status"], timeout=180)
    lines = out.splitlines()[:12]
    if not ok:
        lines = ["the launcher's --status failed (exit not 0); its output:"] + lines
    return ok, "\n".join(lines) if lines else "(the launcher printed nothing)"


OWN_FILES = ("owner-docs/build_resume_doc.py", "owner-docs/" + MD_NAME, "owner-docs/" + DOCX_NAME)


def uncommitted():
    """`git status --short` in the main folder, without this document's own three files (the render rewrites them)."""
    ok, out = run(["git", "status", "--short"])
    if not ok:
        return -1, [], "git status failed: " + out.replace("\n", " ")[:160]
    files = [l for l in out.splitlines() if l.strip() and not any(l.rstrip().endswith(o) for o in OWN_FILES)]
    program = [l for l in files if "docs/offline/build-2026-11-07/" in l]
    return len(files), program, ""


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


def chain_rows(hub, core, screens, tags):
    merged = merged_units(hub)
    lanes = {ln["lane"]: ln for info in (core, screens) for ln in info["lanes"]}
    rows, left = [], []
    for unit, lane, track, what in CHAIN:
        pat = re.compile(r"(?<![\w-])%s(?![\w])" % re.escape(unit))
        done = any(mlane == lane and pat.search(seg) for mlane, seg in merged)
        ln = lanes.get(lane)
        where = ("%s %s" % (ln["state"], ln["tip"])).strip() if ln else "no LANE line"
        status = "Done" if done else "Left"
        if not done:
            left.append(unit)
        rows.append("| %s | %s (%s) | %s | %s | %s |" % (unit, lane, track, cell(what), cell(where, 60), status))
    tagged = TAG in tags
    hub_word = state_word(hub)
    for i, (step, what) in enumerate(TAIL):
        if step == "Release copy":
            done = (ROOT / "offline" / "releases" / "1-addic-v3.0.html").is_file()
        elif step.startswith("Tag"):
            done = tagged
        elif step == "FREEZE":
            done = tagged or hub_word in ("FREEZE", "QUIET", "INTEGRATING")
        else:
            done = tagged
        rows.append("| %s | the HUB | %s | %s | %s |" % (step, cell(what), "-", "Done" if done else "Left"))
    return "\n".join(rows), left


def ro_block(heads, err):
    if err:
        return "- " + err
    if not heads:
        return "- (no R-O heading found in outbox-OWNER.md)"
    return "\n".join("%d. %s" % (i + 1, h) for i, h in enumerate(heads))


def render(now, zone, out_dir):
    stamp = now.strftime("%Y-%m-%d %H:%M") + " " + zone
    hub, core, screens = read_status("HUB"), read_status("CORE"), read_status("SCREENS")
    trunk_tip = git("rev-parse", "--short", "HEAD")
    trunk_log = git("log", "--oneline", "-1")
    branch = git("rev-parse", "--abbrev-ref", "HEAD")
    origin_tip = git("rev-parse", "--short", "origin/build/offline-v1")
    tags_out = git("tag", "-l", "offline-v*")
    tags = [t for t in tags_out.splitlines() if t.strip()] if not tags_out.startswith("unavailable") else []
    tags_inline = ", ".join(tags) if tags else ("none (%s)" % tags_out if tags_out.startswith("unavailable") else "none")
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
    n_unc, program_unc, unc_err = uncommitted()
    heads, next_ro, ro_err = read_owner_outbox()
    launcher_ok, launcher_text = launcher_status()
    resume_head = last_resume_heading()
    chain_table, left = chain_rows(hub, core, screens, tags)
    pending_inline = " -> ".join(left) if left else "nothing: every unit of the chain is merged; FREEZE, the full gates and the tag follow"
    hub_state = hub["lines"].get("STATE", hub["error"] or "STATE line missing")
    m = re.search(r"Next:\s*(.*)$", hub_state)
    hub_next = cut(m.group(1), 700) if m else "(the STATE line carries no 'Next:' text; the MERGE-QUEUE line below and the BASE line give the order)"
    merged = hub["merged"]
    unc_line = ("%d file(s) uncommitted in the main folder (this document's own three files not counted)" % n_unc) if n_unc >= 0 else unc_err
    if program_unc:
        unc_line += ", of them %d under docs/offline/build-2026-11-07/: %s" % (
            len(program_unc), "; ".join(cut(p, 90) for p in program_unc[:8]) + (" ..." if len(program_unc) > 8 else ""))
    pushed_line = ("yes, origin/build/offline-v1 is at the same tip (as last fetched)" if origin_tip == trunk_tip
                   else "not as last fetched: origin/build/offline-v1 is at %s (run git fetch origin, then compare)" % origin_tip)

    def lanes_inline(info):
        return "; ".join("%s %s %s" % (ln["lane"], ln["state"], ln["tip"]) for ln in info["lanes"]) or "(no LANE line)"

    fields = {
        "STAMP": stamp,
        "DATE_LONG": now.strftime("%-d %B %Y") if os.name != "nt" else now.strftime("%d %B %Y").lstrip("0"),
        "TIME": now.strftime("%H:%M") + " " + zone,
        "TRUNK_TIP": trunk_tip,
        "TRUNK_LOG": cut(trunk_log, 200),
        "BRANCH": branch,
        "PUSHED_LINE": pushed_line,
        "TAGS_INLINE": tags_inline,
        "MERGED_COUNT": str(merged),
        "HUB_STATE_WORD": state_word(hub),
        "CORE_STATE_WORD": state_word(core),
        "SCREENS_STATE_WORD": state_word(screens),
        "HUB_HEADER": header_rows(hub, ("STATE", "BASE", "MERGING", "MERGE-QUEUE", "SLOTS-ALLOWED", "OWNER", "RULING", "UPDATED")),
        "CORE_HEADER": header_rows(core, ("STATE", "UPDATED")),
        "SCREENS_HEADER": header_rows(screens, ("STATE", "UPDATED")),
        "CORE_LANES": lane_rows(core, tips, origin_tips),
        "SCREENS_LANES": lane_rows(screens, tips, origin_tips),
        "LAUNCHER": launcher_text,
        "LAUNCHER_WORD": "read" if launcher_ok else "could not be read (its error is printed below)",
        "UNCOMMITTED": unc_line,
        "IN_FLIGHT": in_flight(hub, core, screens),
        "RESUME_HEAD": cut(resume_head, 400),
        "HUB_NEXT": hub_next,
        "CHAIN_TABLE": chain_table,
        "PENDING_INLINE": pending_inline,
        "TIER2": TIER2,
        "RO_BLOCK": ro_block(heads, ro_err),
        "RO_COUNT": str(len(heads)),
        "NEXT_RO": next_ro,
        "CORE_LANES_INLINE": cut(lanes_inline(core), 600),
        "SCREENS_LANES_INLINE": cut(lanes_inline(screens), 600),
        "OUT_DIR": str(out_dir),
        "MD_NAME": MD_NAME,
        "DOCX_NAME": DOCX_NAME,
    }
    unread = []
    for info in (hub, core, screens):
        if not info["ok"]:
            unread.append(info["error"])
    if ro_err:
        unread.append(ro_err)
    if not launcher_ok:
        unread.append("the launcher's --status")
    if trunk_tip.startswith("unavailable"):
        unread.append("git in the main folder")
    fields["UNREAD"] = ("Everything above was read from the live files and git at render time." if not unread
                        else "Could not be read at render time (check by hand): " + "; ".join(unread) + ".")
    return string.Template(TEMPLATE).safe_substitute(fields), unread


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


def main(argv=None):
    ap = argparse.ArgumentParser(description="render the owner's resume-prompt document from the live state (R-O-9)")
    ap.add_argument("--no-docx", action="store_true", help="render the .md only")
    ap.add_argument("--out", metavar="DIR", default=str(HERE), help="output folder (default: owner-docs/)")
    a = ap.parse_args(argv)
    out_dir = Path(a.out).resolve()
    try:
        out_dir.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        print("cannot create %s: %s" % (out_dir, e))
        return 2
    now, zone = now_local()
    text, unread = render(now, zone, out_dir)
    md_path = out_dir / MD_NAME
    try:
        md_path.write_text(text, encoding="utf-8", newline="\n")
    except Exception as e:
        print("cannot write %s: %s" % (md_path, e))
        return 2
    words = len(text.split())
    print("md: %s (%d bytes, about %d words, about %d pages)" % (md_path, md_path.stat().st_size, words, max(1, round(words / 420.0))))
    if unread:
        print("not read at render time: " + "; ".join(unread).encode("ascii", "replace").decode())
    if a.no_docx:
        return 0
    return 0 if build_docx(md_path, out_dir / DOCX_NAME) else 3


# ----------------------------------------------------------------------------------------------- the template --
TEMPLATE = r"""---
title: 1-addic · Resume Prompt
subtitle: How to resume and complete the offline build (V3, tag offline-v3.0) from where we parked: the state, what remains, the commands, the prompts
accent: hub
cover: true
toc: true
confidential: false
auto_glossary: false
Prepared by: Claude, the owner's window of the build program (rendered by owner-docs/build_resume_doc.py)
Date: ${DATE_LONG}, ${TIME}
Edition: offline-v3.0 in progress; trunk build/offline-v1 at ${TRUNK_TIP}; tags ${TAGS_INLINE}
Status: Rendered from the live state at ${STAMP}; refresh with one command at the 98% trigger
---

> [!SUMMARY]
> **What this is.** The one document the owner needs to resume and finish the 1-addic offline build (V3) after it parked at 98% of the weekly usage limit (the owner's R-O-9). It holds the state at parking, what remains to the tag `offline-v3.0`, the exact commands, and paste-ready prompts. It was rendered from the live files and git at **${STAMP}**. One line of state: trunk `build/offline-v1` at **${TRUNK_TIP}**, tags **${TAGS_INLINE}**, **${MERGED_COUNT} merges** recorded on status-HUB.md, HUB ${HUB_STATE_WORD}, CORE ${CORE_STATE_WORD}, SCREENS ${SCREENS_STATE_WORD}.

## Read this first

This document is for the owner. The build runs as three Claude Code chats (HUB, CORE, SCREENS) started by a small program called the launcher, plus the owner's own window. When the weekly usage limit reads 98%, the program parks: the launcher is stopped, each chat writes where it stopped, everything is pushed. This document is refreshed at that moment, so it says where we stopped. To resume, three steps:

1. Open a Claude Code window in `C:\Users\ruchi\1-addic` (the main folder; it holds the trunk `build/offline-v1`).
2. Paste the whole prompt of section 6 into it. That window becomes the owner's HUB window. It reads the files, checks the parked state, and reports to you.
3. The window starts the launcher. The launcher starts the three chats. The chats resume from their own records. You get a report every 30 minutes, and at once at a merge, a tag, a red by name or a question.

If the launcher cannot start a chat, section 7 has a short prompt for each chat so you can start it by hand. Section 8 is the checklist the window follows when the usage limit nears 98% again.

**Refresh this document:** `python docs/offline/build-2026-11-07/owner-docs/build_resume_doc.py` (in the main folder; it rewrites `${MD_NAME}` and `${DOCX_NAME}` in `owner-docs/` from the live state). Then commit the three files by path with `tools/hub_commit.py` and push (section 8).

${UNREAD}

<!-- pagebreak -->

# 1 Where we stopped

Rendered **${STAMP}**. The trunk is `${BRANCH}` at `${TRUNK_TIP}` (`${TRUNK_LOG}`). Pushed: ${PUSHED_LINE}. Tags: ${TAGS_INLINE}. Merges recorded on status-HUB.md: ${MERGED_COUNT}. Uncommitted: ${UNCOMMITTED}.

The HUB's last hand-over note in `tracks/HUB/RUN-RECORD.md`: *${RESUME_HEAD}*.

## 1.1 The HUB (status-HUB.md)

| Line | Value (cut to about 300 characters) |
|---|---|
${HUB_HEADER}

## 1.2 CORE (status-CORE.md)

| Line | Value |
|---|---|
${CORE_HEADER}

Lanes of CORE (the tip is `git rev-parse --short build/<lane>`; "pushed" compares it with origin as last fetched):

| Lane | Lane line says | Branch tip | Pushed | Note on the lane line |
|---|---|---|---|---|
${CORE_LANES}

## 1.3 SCREENS (status-SCREENS.md)

| Line | Value |
|---|---|
${SCREENS_HEADER}

Lanes of SCREENS:

| Lane | Lane line says | Branch tip | Pushed | Note on the lane line |
|---|---|---|---|---|
${SCREENS_LANES}

## 1.4 The launcher

The launcher's own status (`python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --status`, first 12 lines, ${LAUNCHER_WORD}). At a proper parking the first line says the loop is stopped; a chat listed as live here may have ended with the usage limit.

```
${LAUNCHER}
```

## 1.5 What was in flight

${IN_FLIGHT}

<!-- pagebreak -->

# 2 What remains to the tag offline-v3.0

The chain, in order, from PLAN-V3.md section 7 and the HUB's status file. **Done** means a `MERGED:` line of status-HUB.md names the unit as merged. **Left** means it is not merged yet. The column "The lane's line now" is the lane's own LANE line at render time: it can say MERGED for an earlier unit of that lane while a later unit is still left. Each unit is built by its lane, checked, then merged by the HUB alone, one at a time, with every gate green by name on the merged tree.

| Unit | Lane (track) | What it is | The lane's line now | Status |
|---|---|---|---|---|
${CHAIN_TABLE}

**Pending, in order, at render time:** ${PENDING_INLINE}.

**The HUB's own "Next:" text** (from the STATE line of status-HUB.md): ${HUB_NEXT}

**Tier 2, not needed for the tag** (only when no tier 1 lane waits; the HUB's record of 2026-11-08 09:00 lists them; the status files are the truth at render time): ${TIER2}. What moves to the next tag if the memory rows do not hold, in this order: V-45's screenshots, V-44's tour steps, the tier 2 LOWs not merged by the freeze. Never cut: the house rules, the two reviewers on `actions-sos`, the gates by name.

<!-- pagebreak -->

# 3 How the program runs

**Branches and folders.**

| Thing | Where | What it is |
|---|---|---|
| The trunk | `build/offline-v1`, checked out in `C:\Users\ruchi\1-addic` | The one branch the HUB merges into and pushes. Nobody else moves it. The owner's window commits program documents on it by path. |
| Lane branches | `build/<lane>`, one per lane | core, engine, actions-sos, learn, tests-docs (CORE); content, today-track, workbook-settings, actions, game-tutorials (SCREENS). Cut from the BASE line of status-HUB.md, never from main. |
| Lane worktrees | `C:\Users\ruchi\1-addic-wt\<lane>` | Where a lane's branch is checked out and built. Only that lane's chat edits it. |
| `_int` | `C:\Users\ruchi\1-addic-wt\_int` | The integration worktree. The HUB merges a lane here, runs the gates on the merged tree, then fast-forwards the trunk. Detached at the trunk tip between merges. |
| `_base` | `C:\Users\ruchi\1-addic-wt\_base` | Read-only, at BASE-READY 655516dc. |
| `_logs` | `C:\Users\ruchi\1-addic-wt\_logs` | Gate logs (`gates\<lane>\`), merge logs (`merges\`), reports. Every verdict cites a log path. |
| `_locks` | `C:\Users\ruchi\1-addic-wt\_locks` | `1-addic.lock`: the test, browser and docs gates take it in arrival order, so two suites never run at once. |
| Program files | `docs/offline/build-2026-11-07/` | PLAN.md, PLAN-V3.md, KICKOFF-PROMPTS.md, `coordination/` (status files, outboxes, the board, baselines), `tracks/<TRACK>/RUN-RECORD.md`, `tools/`, `owner-docs/` (this document). |

**The launcher** (`python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py ...`): a loop that checks every two minutes and starts a fresh chat when a track needs one. It starts the HUB on `claude-fable-5-1` (effort high) and CORE and SCREENS on `claude-opus-5-5`, each with its kickoff block from `KICKOFF-PROMPTS.md` plus a resume line. It relaunches a chat whose status file says `STATE: RESTART` (a chat hands over at 300k context) or that has no live session for 30 minutes. It never launches under 4.0 GB free. Its state and log live in `%LOCALAPPDATA%\1-addic-hub\launcher\`. Commands:

| Command | What it does |
|---|---|
| `--start` | Starts the loop (detached; after a machine restart run this first). |
| `--launch-missing` | One check with the 30-minute rule off: every track without a live chat is launched now. Run it after `--start`. |
| `--status` | The loop, the pause, the last check, the chats per track. |
| `--stop` | Ends the loop. The launched chats live on. The first step of parking. |
| `--pause-track CORE` / `--resume-track CORE` | One track's pause and resume (also SCREENS, HUB). |
| `--pause "<reason>"` / `--resume` | The global pause. |

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

# 4 The decisions in force

**The owner's words** (every R-O heading of `coordination/outbox-OWNER.md`, quoted whole; ${RO_COUNT} so far; the next number is ${NEXT_RO}):

${RO_BLOCK}

**The V3 defaults** (PLAN-V3.md sections 5 and 7; the owner's R-O-7 took V-Q1 to V-Q13 at their defaults):

- The tag is `offline-v3.0` (V-Q1).
- The status layer is a page, "Your Harbor", at `#/status`, reached in one tap from Today (V-Q2, V-Q3, V-Q6).
- The 14-day strip shows dated dots without a count (V-Q4); "what just changed" is since the page was last drawn this session (V-Q5).
- The India crisis numbers: none cleared yet; every number keeps "please verify" (V-Q7). The clinical review pack is produced; no copy changes before the reviewer's answers (V-Q8).
- The run: one grace day a week keeps the run and shows as "kept" (V-Q9). A day shown up is any day with a log, a lesson, a practice, an objective or an SOS drill; never a claimed sober day (V-Q12). It shows in Today's header and in Your Harbor's "Where you stand"; never a push, a countdown or a shame line (V-Q13).
- Three daily objectives a day: two drawn by date and state, one the person may swap once a day; done by a tap or by the matching event (V-Q11).
- The quest-line opens features earlier than the modules would; nothing open in v1.1 locks; tools, mini-games and the Explorer are never a reward; never SOS, help, lessons, Settings, export or the person's data (V-Q10 as read by R-H-44; the owner may still say "V-Q10: lock <names> until earned").

**The product house rules** (bind every lane; never cut): SOS is never gated. Nothing derived ever decreases. No streak resets, no shame line. No random rewards. No points for claimed sober days. Nothing leaves the device (no network call, no tracker, no remote font). Original words only, never the source book's text. Every screen that is not finished shows an honest state, never a dead button.

# 5 The owner's open items

1. **The walk of the v1.1 file** on a phone and on a computer; the findings in one message to the owner's window, which routes them by outbox to the lanes.
2. **The India crisis numbers (input I6):** which numbers are confirmed. Until then every number says "please verify".
3. **A clinical reader** for `docs/offline/build-2026-11-07/CLINICAL-REVIEW-PACK.md`: who reads it and when. No safety copy changes before the answers.
4. **O-Q1 (from R-O-8, for the online app only):** is SOS open before sign-up? Default yes. Nothing changes for the offline edition; the record goes to `docs/decisions/owner-inputs.md` and an ADR when the main-line plan resumes.
5. **The usage reading:** only the owner can read `/usage`. Tell the window the reading and its reset time when asked, and the word "park" at 98%.

<!-- pagebreak -->

# 6 Paste-ready prompt for the owner's HUB window

Copy the whole block. Paste it into a fresh Claude Code window opened in `C:\Users\ruchi\1-addic`.

```
You are the owner's HUB window of the 1-addic offline build program (the build of 7 November 2026; edition V3; tag offline-v3.0). The program was parked at ${STAMP} when the owner's weekly usage limit reached 98% (the owner's R-O-9). You resume it from its files. You are in C:\Users\ruchi\1-addic (the main folder; the trunk build/offline-v1 is checked out here; the lanes live in worktrees under C:\Users\ruchi\1-addic-wt\<lane>). Paths below are relative to docs/offline/build-2026-11-07/ (<docs>). Time stamps come from `date`, never estimated. The document you were pasted from (owner-docs/1-addic-Resume-Prompt.md) says the state at parking: trunk ${TRUNK_TIP}, tags ${TAGS_INLINE}, ${MERGED_COUNT} merges, pending ${PENDING_INLINE}; its section 1 has every lane's tip.

1. Read first, in this order, before you write anything: PLAN.md; PLAN-V3.md; coordination/status-HUB.md; tracks/HUB/RUN-RECORD.md from its last "Resume here" heading to the end; coordination/status-CORE.md; coordination/status-SCREENS.md; the four outboxes coordination/outbox-HUB.md, outbox-CORE.md, outbox-SCREENS.md and outbox-OWNER.md (the last three entries of each, every R-O entry of outbox-OWNER.md); coordination/baselines.md.

2. Verify the parked state without redoing anything: `git status --short` (uncommitted program files?); `git fetch origin`, then `git log --oneline -1` against `git rev-parse --short origin/build/offline-v1` (is the trunk pushed?); `git tag -l "offline-v*"`; `git rev-parse --short build/<lane>` for every lane the status files name, against the tips in the document; `claude agents --json` (which chats of this program are live, if any); `python <docs>/tools/fresh_chat_launcher.py --status` (the loop should be stopped). If status-HUB.md's MERGING line names a lane, `python <docs>/tracks/HUB/workflows/merge_lane.py status <lane>`. Do not merge, build, test or launch anything in this step.

3. Your first message to the owner, under a page: (1) the time from `date`; (2) the state as you found it, with every difference from the document named (a tip that moved, an uncommitted file, a chat still live, a tag missing, a merge left open); (3) the pending order to the tag offline-v3.0 from status-HUB.md's MERGE-QUEUE and BASE lines (the document expected: ${PENDING_INLINE}); (4) the launcher's state; (5) one line of what you need from the owner, if anything (usually nothing: R-O-3 and R-O-7 let you start without waiting); (6) ask for the current /usage reading and its reset time, so you can pace the remaining hours.

4. Then start the program without waiting for a word: `python <docs>/tools/fresh_chat_launcher.py --start`, then `python <docs>/tools/fresh_chat_launcher.py --launch-missing`; confirm with `--status` that a HUB, a CORE and a SCREENS chat are listed and step. The launcher starts the HUB on claude-fable-5-1 and CORE and SCREENS on claude-opus-5-5 with the kickoff blocks of KICKOFF-PROMPTS.md and the resume line; it relaunches a chat whose status file says STATE: RESTART; it never launches under 4.0 GB free. A launched chat with no step after 15 minutes is most likely the usage limit: say so. If a chat cannot be started, the owner has a paste-ready prompt for it in section 7 of the document.

5. Report to the owner every 30 minutes, and at once at a merge, a tag, a red by name or a question (R-O-3). Each report: the time, the merges since the last report with their trunk tips, each lane's state, the launcher's state, the last memory row, the next step.

6. Your remit, as the owner's window (RUN-RECORD.md, "Resume here (00:13, owner's window)" and "Owner's window hand-over"): file the owner's words in coordination/outbox-OWNER.md as a heading `## ${NEXT_RO} · <stamp from date> · "<the owner's words>"` with a paragraph on what changed (the next number after that one each time), and tell the HUB chat by message; relay the board's first three lines and the status files to the owner; route the owner's walk findings by outbox to the lane that owns the file, each with a default; send a built file to the owner with SendUserFile when asked (offline/1-addic.html as built by the HUB or a lane; never build a unit yourself); merge only if no launcher HUB is live, and then exactly by the recipe (merge_lane.py prepare, conflicts, guards, commit, finish --hub --push; one lane at a time; never hand over with a gate running); never edit .claude/settings.json; never touch main, origin/main, the claude/* branches, docs/PLAN.md, docs/BUILD-GUIDE.md, docs/decisions/0001 to 0021, docs/book/, docs/program/, scripts/, data/, the pharma program or its launcher; commit only by path with `python <docs>/tools/hub_commit.py --track HUB --session <your session link> -m "docs(HUB, <date>): ..." <paths>` (it adds the trailers Co-Authored-By and Claude-Session; never git add -A; never force-push, rebase, stash or check out over uncommitted work); push build/offline-v1, the lane branches and the tags only, never main.

7. Memory (PLAN.md section 4): under 4.0 GB free the newest run pauses at its next commit (tier 2 first when one runs); a new run needs a row of 7.0 GB; at 4.0 GB or more paused work resumes, tier 1 first; the rows are in coordination/lane-widening.md. What frees memory is outside this build (the pharma program's chats, other windows): tell the owner; do not close them yourself.

8. The parking rule (R-O-9): when the owner says the weekly usage reads 98%, or says "park": (1) `python <docs>/tools/fresh_chat_launcher.py --stop` first; (2) message each live chat to finish or pause its runs at the next clean point, write its Resume here and the PARKED line on its status file, commit by path and push its branch (a merge in progress finishes if its gates are already green, otherwise it is aborted before guards); (3) wait for the PARKED lines; (4) write the final hand-over in tracks/HUB/RUN-RECORD.md; (5) `python <docs>/owner-docs/build_resume_doc.py`; (6) commit the three files by path with hub_commit.py and push; (7) confirm with `git status --short` (no program file left) and `git log origin/build/offline-v1 -1`.

9. Context: over 250,000 tokens write your hand-over in tracks/HUB/RUN-RECORD.md (filed R-O lines, the next number, the state, the open items); at 300,000, at the next safe point, write STATE: RESTART with a note on status-HUB.md only if no launcher HUB is live (the launcher's chats own that line otherwise), tell the owner to open a fresh window with this same prompt, and stop.
```

<!-- pagebreak -->

# 7 Paste-ready prompts for CORE and SCREENS

Use these only if the launcher cannot start a chat (its `--status` shows no live chat of the track after `--launch-missing`, or it reports a failed launch). Start the chat in `C:\Users\ruchi\1-addic` on the model the launcher would use: `claude --model claude-opus-5-5` (or in the background as the launcher does: `claude --bg --name "CORE <HH:MM>" --model claude-opus-5-5 "<the prompt>"`). Each prompt sends the chat to its full kickoff block in `KICKOFF-PROMPTS.md`, so the wording the launcher uses reaches it whole.

**CORE** (lanes core, engine, actions-sos, learn, tests-docs):

```
ultracode. You are the CORE chat of the 1-addic offline edition build of 7 November 2026 (`docs/offline/build-2026-11-07/PLAN.md`), started by hand by the owner because the launcher could not start you. Your full kickoff is the fenced block under "# Prompt 1 · CORE" in docs/offline/build-2026-11-07/KICKOFF-PROMPTS.md: read it first and follow it as if the launcher had given it to you (it names your lanes, the rules, the records and the V3 units). Then resume: read your status file coordination/status-CORE.md and tracks/CORE/RUN-RECORD.md, then continue from the last finished step; a workflow run your run record names as running is alive only if its session is still listed by `claude agents`: if that session is gone, the run died with it, so relaunch that lane with done and priorNote from its branch's last commit and its progress notes, never wait for it. The program was parked at ${STAMP} at 98% of the owner's weekly usage and is resuming now; the HUB merges, you build. Memory (PLAN.md section 4): never start a run under 4.0 GB free; a new run needs a row of 7.0 GB; under 4.0 GB the newest run pauses at its next commit. Rewrite your status file at every step: STATE with a note, one LANE line per lane with its state and tip (NEW, SCOUTED, BUILDING, CHECKING, REVIEWING, READY-SLICE <tip>, READY <tip>, RED <round>, MERGED, PAUSED <tip>), UPDATED from `date`. Over 250,000 tokens plan the hand-over; at 300,000, at the next safe point, write the run record and STATE: RESTART, then stop. Your lanes at parking: ${CORE_LANES_INLINE}.
```

**SCREENS** (lanes content, today-track, workbook-settings, actions, game-tutorials):

```
ultracode. You are the SCREENS chat of the 1-addic offline edition build of 7 November 2026 (`docs/offline/build-2026-11-07/PLAN.md`), started by hand by the owner because the launcher could not start you. Your full kickoff is the fenced block under "# Prompt 2 · SCREENS" in docs/offline/build-2026-11-07/KICKOFF-PROMPTS.md: read it first and follow it as if the launcher had given it to you (it names your lanes, the rules, the records and the V3 units). Then resume: read your status file coordination/status-SCREENS.md and tracks/SCREENS/RUN-RECORD.md, then continue from the last finished step; a workflow run your run record names as running is alive only if its session is still listed by `claude agents`: if that session is gone, the run died with it, so relaunch that lane with done and priorNote from its branch's last commit and its progress notes, never wait for it. The program was parked at ${STAMP} at 98% of the owner's weekly usage and is resuming now; the HUB merges, you build. Memory (PLAN.md section 4): never start a run under 4.0 GB free; a new run needs a row of 7.0 GB; under 4.0 GB the newest run pauses at its next commit. Rewrite your status file at every step: STATE with a note, one LANE line per lane with its state and tip (NEW, SCOUTED, BUILDING, CHECKING, REVIEWING, READY-SLICE <tip>, READY <tip>, RED <round>, MERGED, PAUSED <tip>), UPDATED from `date`. Over 250,000 tokens plan the hand-over; at 300,000, at the next safe point, write the run record and STATE: RESTART, then stop. Your lanes at parking: ${SCREENS_LANES_INLINE}.
```

# 8 The parking checklist

What the owner's window does when the owner says the weekly usage reads 98% (or "park"), from R-O-9. In this order:

1. Stop the launcher first, so no fresh chat is launched into the last 2%: `python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --stop`.
2. Message each live chat (the HUB, CORE, SCREENS; `claude agents --json` lists them) to park: finish or pause its runs at the next clean point, write its Resume here in its run record and the PARKED line on its status file, commit by path and push its branch. A merge in progress finishes if its gates are already green; otherwise it is aborted before guards.
3. Wait for the PARKED lines on `coordination/status-HUB.md`, `status-CORE.md` and `status-SCREENS.md`.
4. Write the final hand-over in `tracks/HUB/RUN-RECORD.md` (the state, the filed R-O lines and the next number, the open items).
5. Re-run this generator: `python docs/offline/build-2026-11-07/owner-docs/build_resume_doc.py`.
6. Commit the three files by path and push: `python docs/offline/build-2026-11-07/tools/hub_commit.py --track HUB --session <session link> -m "docs(HUB, <date>): the resume-prompt document refreshed at parking (R-O-9)" docs/offline/build-2026-11-07/owner-docs/build_resume_doc.py docs/offline/build-2026-11-07/owner-docs/${MD_NAME} docs/offline/build-2026-11-07/owner-docs/${DOCX_NAME}`, then `git push origin build/offline-v1`.
7. Confirm: `git status --short` shows no program file; `git log origin/build/offline-v1 -1` shows the commit; `git tag -l "offline-v*"` lists the tags; every lane branch's tip is on origin.

> [!NEXT]
> **To resume later:** open a Claude Code window in `C:\Users\ruchi\1-addic`, paste section 6, and let the window start the launcher. Everything the program needs is in the pushed branches and this document.
"""

if __name__ == "__main__":
    sys.exit(main())
