"""board.py: the generator of the HUB's board, coordination/SPRINT-BOARD.md, for the 1-addic offline build of
7 November 2026 (adapted from the Kriya pharma program's board generator).

Reads, all read-only, and tolerates every one of them missing (an empty table or a line saying so):
  coordination/status-HUB.md          STATE, BASE, BASE-READY, SLOTS-ALLOWED, TRACKS-ALLOWED, SLOTS, MERGING,
                                      MERGE-QUEUE, MERGED, QUIET, HOURS, UPDATED
  coordination/status-CORE.md, status-SCREENS.md   STATE, LANE lines, SLOTS-ASKED, UPDATED
  tracks/HUB/workflows/lane_args.json the lanes: lanes.<lane>.{chat, tier, flagged}; when it is missing or unreadable,
                                      the lanes come from the chats' LANE lines (tier and flagged read from the note)
  tools/context_now.py                the chats' context (run as a subprocess)
  %LOCALAPPDATA%/1-addic-hub/launcher/launcher.log and loop.pid   the last LAUNCHED line per track; the loop alive
  coordination/lane-widening.md       the last memory sample
  coordination/board-notes.md         the hand-written sections, spliced verbatim: `## For the owner` (its first
                                      three lines are the board's first three lines: the state in one line,
                                      NEEDS YOU, NEXT), `## Merges`, `## Blockers and questions`, `## Files of the build`

The HUB edits board-notes.md between runs and runs this script; nobody edits SPRINT-BOARD.md by hand.

Shapes read:
  A status file's header = every line before the first line starting with `# ` (blank lines inside the header are
  allowed). Files are read as UTF-8 (a BOM is dropped; a stray ANSI byte becomes U+FFFD instead of a crash).
  LANE: <lane> [<words>] <STATE> [<tip>] [<round>] # <note>    or    LANE: <lane> <STATE> (<note>)
    The lane name may be backticked. The state word is the first state word outside parentheses; the words before
    the state join the note. The tip is taken only when it is the token right after the state word; a round (a digit
    token right after the state or the tip) shows as `RED 2` on a RED lane. The LAST LANE line per lane in the header
    wins (a line appended under the old one counts as the newer).
  SLOTS: <lane> slot=<n> granted <time> [note]   one per granted lane on status-HUB.md (the last per lane wins).
  MERGED lines on status-HUB.md, anywhere in the file:
    MERGED: <lane> <READY|READY-SLICE> <tip> -> <commit> [<time or note>]
    MERGED <lane> <kind> <tip7> -> <branch> @ <commit8> (...)           a merge script's statusLine
    MERGED: <lane> <kind> <tip> -> <branch>@<commit>
  A kind containing SLICE (any case) is a slice merge: it does NOT change the lane's state (the lane continues on its
  branch); it adds `slice <tip7> -> <commit7>` to the Note and a Merges bullet. Any other kind (READY, final) or the
  chat's own LANE state MERGED shows the lane MERGED. The same merge recorded twice counts once.
  MERGING: <text>   a merge in flight (its first token the lane); MERGE-QUEUE: <text>   the lanes waiting; both shown
  at the top of the Merges section. `none`, `-` or a value in parentheses means nothing.

python board.py [--out <path>] [--stamp "<text>"] [--check]
                [--coord <dir>] [--args <lane_args.json>] [--context-now <context_now.py>]
  --check prints the parsed HUB lines, chat rows and lane rows and writes nothing.
  --coord / --args / --context-now point the script at other files (tests); by default they resolve from this
  file's place in the program folder (docs/offline/build-2026-11-07/).
"""
from __future__ import annotations

import argparse
import ctypes
import datetime as dt
import json
import os
import re
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent            # <docs>/tools
PROGRAM = HERE.parent                             # docs/offline/build-2026-11-07
COORD = PROGRAM / "coordination"
ARGS_JSON = PROGRAM / "tracks" / "HUB" / "workflows" / "lane_args.json"
CONTEXT_NOW = HERE / "context_now.py"
LAUNCHER_HOME = Path(os.environ.get("ADDIC_HUB_HOME") or Path(os.environ.get("LOCALAPPDATA", str(Path.home()))) / "1-addic-hub") / "launcher"
HUB = "HUB"
CHATS = ["CORE", "SCREENS"]
IST = dt.timezone(dt.timedelta(hours=5, minutes=30))
STATES = {"NEW", "SCOUTED", "BUILDING", "CHECKING", "REVIEWING", "READY", "READY-SLICE",
          "RED", "MERGED", "BLOCKED", "PAUSED"}
HEX = re.compile(r"^[0-9a-f]{7,40}$")
MERGED_RE = re.compile(
    r"^MERGED:?\s+(\S+)\s+(\S+)\s+([0-9a-f]{7,40})\s*->\s*(\S+)(?:\s*@\s*([0-9a-f]{7,40}))?\s*(.*)")
SLOTS_RE = re.compile(r"^SLOTS:\s+`?([^\s`]+)`?\s+slot=(\S+)\s+granted\s+(.*)")
HUB_KEYS = ("BASE", "BASE-READY", "SLOTS-ALLOWED", "TRACKS-ALLOWED", "QUIET", "HOURS", "UPDATED")
NOTE_MAX = 160
TITLE = "# 1-addic offline edition · the board"
INTRO = ("Rewritten by the HUB with `tools/board.py` from the status files and `coordination/board-notes.md`, at every "
         "event and at least every two hours; nobody edits this file by hand. The first three lines are for the owner "
         "(the state, NEEDS YOU, NEXT); the rest is the record. STATE words on the chats' status files: NEW, BUILDING, "
         "READY, RESTART, HANDOVER, PAUSED; the HUB adds BASE-READY, INTEGRATING, QUIET.")


# ---------------------------------------------------------------- reading
def read_text(path: Path) -> str | None:
    """UTF-8 with a BOM dropped; a byte outside UTF-8 becomes U+FFFD rather than a crash; None when missing."""
    try:
        return path.read_text(encoding="utf-8-sig", errors="replace") if path.is_file() else None
    except OSError:
        return None


def header(text: str) -> list[str]:
    """The header lines: every non-blank line before the first line starting with `# `."""
    out = []
    for line in text.lstrip("\ufeff").splitlines():
        if line.startswith("# "):
            break
        if line.strip():
            out.append(line.rstrip())
    return out


def split_field(line: str) -> tuple[str, str]:
    """'STATE: BUILDING   # comment' -> ('BUILDING', 'comment')."""
    word, _, comment = line.split(":", 1)[1].strip().partition("#")
    return word.strip(), comment.strip()


def cut(text: str, n: int = NOTE_MAX) -> str:
    """Cut at a word boundary, no dangling separators."""
    text = text.strip()
    if len(text) <= n:
        return text.rstrip(";, ")
    head = text[:n]
    if " " in head[n // 2:]:
        head = head[:head.rfind(" ")]
    return head.rstrip(";,:- ") + "…"


def is_slice(kind: str) -> bool:
    """READY-SLICE, slice, Slice-2: a slice merge; READY, final, lane: not."""
    return "SLICE" in (kind or "").upper()


def is_nothing(value: str) -> bool:
    v = (value or "").split("#")[0].strip()
    return not v or v.startswith("(") or v.strip("`").lower() in ("none", "-", "no", "nothing", "none yet", "n/a")


def parse_hub(text: str) -> dict:
    hub = {"state": "", "note": "", "slots": {}, "merged": [], "merging": [], "queue": ""}
    hub.update({k: "" for k in HUB_KEYS})
    for line in header(text):
        key = line.split(":", 1)[0].strip()
        if key == "STATE" and not hub["state"]:
            hub["state"], hub["note"] = split_field(line)
        elif key in HUB_KEYS and ":" in line and not hub[key]:
            hub[key] = line.split(":", 1)[1].strip()
        elif key == "SLOTS":
            m = SLOTS_RE.match(line)
            if m:
                hub["slots"][m.group(1)] = {"slot": m.group(2), "time": m.group(3).strip()}
            elif not is_nothing(line.split(":", 1)[1]):
                lane = line.split(":", 1)[1].split()[0].strip("`")
                hub["slots"][lane] = {"slot": "?", "time": cut(line.split(":", 1)[1].strip()[len(lane):].strip(), 60)}
        elif key == "MERGING" and not is_nothing(line.split(":", 1)[1]):
            value = line.split(":", 1)[1].strip()
            hub["merging"].append({"lane": value.split()[0].strip("`"), "text": value})
        elif key == "MERGE-QUEUE" and not is_nothing(line.split(":", 1)[1]):
            hub["queue"] = line.split(":", 1)[1].strip()
    for raw in text.splitlines():  # MERGED lines may sit anywhere the HUB puts them (a bullet too)
        m = MERGED_RE.match(raw.strip().lstrip("-* ").strip())
        if not m:
            continue
        lane, kind, tip, target, commit, rest = m.groups()
        lane = lane.strip("`")
        target = target.strip("`,;")
        if commit:
            branch = target
        elif "@" in target and HEX.match(target.rsplit("@", 1)[1]):
            branch, commit = target.rsplit("@", 1)
        elif HEX.match(target):
            branch, commit = "", target
        else:
            branch, commit = target, ""
        if any(x["lane"] == lane and x["tip"][:7] == tip[:7] and x["commit"][:7] == commit[:7] for x in hub["merged"]):
            continue  # the same merge recorded twice (the header line and a dated section): one record
        hub["merged"].append({"lane": lane, "kind": kind.strip("`"), "tip": tip, "branch": branch,
                              "commit": commit, "rest": (rest or "").strip(), "slice": is_slice(kind)})
    return hub


def _strip_parens(text: str) -> str:
    text = text.strip()
    if text.startswith("(") and text.endswith(")"):
        text = text[1:-1].strip()
    return text


def parse_lane_line(line: str) -> tuple[str, str, str, str] | None:
    """'LANE: <lane> [<words>] <STATE> [<tip>] [<round>] # <note>' or '... <STATE> (<note>)'
    -> (lane, state, tip, note); state '' if no state word is found."""
    toks = line.split()
    if len(toks) < 2:
        return None
    lane = toks[1].strip("`*:")
    found, fallback, depth = None, None, 0
    for i in range(2, len(toks)):
        tok = toks[i]
        if tok.startswith("#"):
            break
        word = tok.strip("()[],;:#.`*")
        if word in STATES:
            opens = tok[:len(tok) - len(tok.lstrip("([`*"))].count("(")
            if depth + opens <= 0:
                found = i
                break
            if fallback is None:
                fallback = i
        depth += tok.count("(") - tok.count(")")
    i = found if found is not None else fallback
    if i is None:
        pre, _, note = " ".join(toks[2:]).partition("#")
        return lane, "", "", cut("; ".join(p for p in (_strip_parens(pre), _strip_parens(note)) if p))
    state = toks[i].strip("()[],;:#.`*")
    before = _strip_parens(" ".join(toks[2:i]))
    after = toks[i + 1:]
    tip, rnd = "", ""
    j = 0
    if j < len(after) and HEX.match(after[j].strip("[]`,")) and not after[j].startswith("#"):
        tip = after[j].strip("[]`,")
        j += 1
    if j < len(after) and after[j].strip("[],").isdigit():
        rnd = after[j].strip("[],")
        j += 1
    pre, _, note = " ".join(after[j:]).partition("#")
    pre, note = _strip_parens(pre), _strip_parens(note)
    parts = [p for p in (before, pre, note) if p]
    if state == "RED" and rnd:
        state = f"RED {rnd}"
    return lane, state, tip, "; ".join(parts)


def parse_chat(text: str) -> dict:
    chat = {"state": "", "note": "", "asked": "", "updated": "", "lanes": {}}
    for line in header(text):
        if line.startswith("STATE:") and not chat["state"]:
            chat["state"], chat["note"] = split_field(line)
        elif line.startswith("SLOTS-ASKED:"):
            chat["asked"] = line.split(":", 1)[1].strip()
        elif line.startswith("UPDATED:") and not chat["updated"]:
            chat["updated"] = line.split(":", 1)[1].strip()
        elif line.startswith("LANE:"):
            parsed = parse_lane_line(line)
            if parsed:  # the last LANE line per lane wins (an appended line is the newer)
                chat["lanes"][parsed[0]] = {"state": parsed[1], "tip": parsed[2], "note": parsed[3]}
    return chat


def launcher() -> tuple[dict, str, str]:
    """({track: (session8, 'YYYY-MM-DD HH:MM')} from the last LAUNCHED line per track, the last launch, the loop)."""
    loop = "the launcher loop: not running (`fresh_chat_launcher.py --start`)"
    try:
        pid = int((read_text(LAUNCHER_HOME / "loop.pid") or "").strip())
        k = ctypes.windll.kernel32
        h = k.OpenProcess(0x1000, False, pid)
        code = ctypes.c_ulong()
        alive = bool(h) and bool(k.GetExitCodeProcess(h, ctypes.byref(code))) and code.value == 259
        if h:
            k.CloseHandle(h)
        if alive:
            loop = f"the launcher loop: running (pid {pid})"
    except Exception:
        pass
    text = read_text(LAUNCHER_HOME / "launcher.log")
    if text is None:
        return {}, "launcher.log not found", loop
    out, last = {}, ""
    pat = re.compile(r"^(\d{4}-\d\d-\d\d \d\d:\d\d):\d\d \| LAUNCHED (HUB|CORE|SCREENS): (.+?) \(([0-9a-f]{8})[0-9a-f-]*\) because")
    for line in text.splitlines():
        m = pat.match(line)
        if m:
            out[m.group(2)] = (m.group(4), m.group(1))
            last = f"{m.group(2)} {m.group(4)} at {m.group(1)}"
    return out, last, loop


def parse_context(cell: str) -> int:
    """'138,991' -> 138991; '139k' -> 139000; '1.2M' -> 1200000; anything else -> 0."""
    m = re.match(r"^\s*([\d.,]+)\s*([kKmM]?)\s*$", cell)
    if not m:
        return 0
    try:
        n = float(m.group(1).replace(",", ""))
    except ValueError:
        return 0
    return round(n * {"k": 1_000, "m": 1_000_000}.get(m.group(2).lower(), 1))


def context_rows() -> tuple[dict, str]:
    """{track: [(when, context, last step, session8), ...]} from context_now.py's table, every row."""
    if not CONTEXT_NOW.is_file():
        return {}, f"{CONTEXT_NOW} not found"
    try:
        p = subprocess.run([sys.executable, str(CONTEXT_NOW)], capture_output=True, text=True,
                           encoding="utf-8", errors="replace", timeout=180,
                           creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
    except (OSError, subprocess.SubprocessError) as e:
        return {}, f"context_now.py failed: {e}"
    if p.returncode:
        return {}, f"context_now.py exit {p.returncode}: {p.stderr.strip()[:160]}"
    rows: dict[str, list] = {}
    for line in p.stdout.splitlines():
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) < 3:
            continue
        m = re.match(r"([A-Z][A-Z\-]*):.*\(([0-9a-f]{8})\)\s*$", cells[0])
        if not m:
            continue
        try:
            when = dt.datetime.strptime(cells[2], "%d %b %H:%M")
        except ValueError:
            when = dt.datetime.min
        rows.setdefault(m.group(1), []).append((when, parse_context(cells[1]), cells[2], m.group(2)))
    return rows, ""


def pick_context(rows: list, session8: str | None) -> tuple | None:
    """The row of the launcher's session if it is there, else the latest Last step (then the highest context)."""
    if not rows:
        return None
    if session8:
        mine = [r for r in rows if r[3] == session8]
        if mine:
            rows = mine
    return max(rows, key=lambda r: (r[0], r[1]))


def memory_line() -> str:
    """The last row of lane-widening.md: | stamp | free | total | claude | node | slots | [note] |."""
    text = read_text(COORD / "lane-widening.md") or ""
    rows = [l for l in text.splitlines() if l.startswith("|") and not re.match(r"^\|\s*-", l)]
    if len(rows) < 2:
        return "Free memory: no sample in lane-widening.md."
    c = [x.strip() for x in rows[-1].strip().strip("|").split("|")]
    c += [""] * (7 - len(c))
    procs = f"; claude {c[3]}, node {c[4]} processes" if c[3] or c[4] else ""
    slots = f"; {c[5]} slots by the rule" if c[5] else ""
    note = f"; {c[6]}" if c[6] else ""
    return f"Free memory {c[1]} GB of {c[2]} GB at {c[0]}{procs}{slots}{note} (lane-widening.md)."


def notes() -> dict:
    out, cur = {}, None
    for line in (read_text(COORD / "board-notes.md") or "").splitlines():
        if line.startswith("## "):
            cur = line[3:].strip()
            out[cur] = []
        elif cur is not None:
            out[cur].append(line)
    return {k: "\n".join(v).strip() for k, v in out.items()}


# ---------------------------------------------------------------- deriving
def esc(s: str) -> str:
    """A table cell: `|` escaped outside backticks only; no newlines."""
    parts = str(s).replace("\n", " ").split("`")
    return "`".join(p if i % 2 else p.replace("|", "\\|") for i, p in enumerate(parts))


def table(head: list[str], rows: list[list[str]]) -> str:
    lines = ["| " + " | ".join(head) + " |", "|" + "---|" * len(head)]
    lines += ["| " + " | ".join(esc(c) for c in r) + " |" for r in rows]
    return "\n".join(lines)


def chat_rows(hub: dict, chats: dict, launch: dict, ctx: dict, missing: list) -> list[list[str]]:
    rows = []
    for track, st in [(HUB, {"state": hub["state"], "note": hub["note"], "updated": hub["UPDATED"]})] + [(c, chats[c]) for c in CHATS]:
        sid = launch.get(track)
        c = pick_context(ctx.get(track, []), sid[0] if sid else None)
        session = f"{sid[0]} (launcher-started {sid[1]})" if sid else (c[3] if c else "")
        if f"status-{track}.md" in missing:
            state = "(no status file)"
        else:
            state = st["state"] + (f" — {cut(st['note'], 120)}" if st["note"] else "")
        context = f"{round(c[1] / 1000)}k" + ("" if not sid or c[3] == sid[0] else f" ({c[3]})") if c else ""
        rows.append([track, session, state, context, st["updated"]])
    return rows


def tier_text(value) -> str:
    v = str(value).strip()
    return "1→2" if re.sub(r"\s+", " ", v).lower() in ("1, then 2", "1 then 2") else v


def tier_from_note(note: str) -> str:
    """'tier 1 (U-31a) then tier 2' -> '1→2'; 'tier 1, flagged' -> '1'; 'tier 2; ... no tier 1 lane waits' -> '2';
    '' when the note names no tier."""
    first = re.search(r"\btier\s+(\d)", note or "", re.I)
    if not first:
        return ""
    then = re.search(r"\bthen\s+tier\s+(\d)", note or "", re.I)
    return f"{first.group(1)}→{then.group(1)}" if then and then.group(1) != first.group(1) else first.group(1)


def flag_text(value) -> str:
    if value is True:
        return "yes"
    if isinstance(value, str) and value.strip() and value.strip().lower() not in ("no", "false", "0"):
        return value.strip()
    return ""


def kind_text(kind: str) -> str:
    """READY-SLICE / slice -> 'slice'; READY / final / MERGED -> 'final'; anything else as written."""
    if is_slice(kind):
        return "slice"
    return "final" if kind.upper() in ("READY", "FINAL", "MERGED", "LANE") else kind


def merge_text(m: dict) -> str:
    where = f" -> {m['commit'][:7]}" if m["commit"] else ""
    where += f" ({m['branch']})" if m["branch"] and m["commit"] else (f" -> {m['branch']}" if m["branch"] else "")
    return f"{kind_text(m['kind'])} {m['tip'][:7]}{where}"


def granted_text(hub: dict) -> str:
    slots = hub["slots"]
    if not slots:
        return "Granted: none yet."
    return f"Granted: {len(slots)} lanes ({', '.join(f'`{k}` slot {v['slot']}' for k, v in slots.items())})."


def lane_order(chats: dict, lanes_json: dict) -> list[tuple[str, str]]:
    """[(lane, chat)]: lane_args.json's order first, then every lane a chat's status file names that it lacks."""
    out, seen = [], set()
    for lane, info in lanes_json.items():
        if isinstance(info, dict):
            out.append((lane, str(info.get("chat") or "")))
            seen.add(lane)
    for c in CHATS:
        for lane in chats[c]["lanes"]:
            if lane not in seen:
                out.append((lane, c))
                seen.add(lane)
    return out


def lane_rows(hub: dict, chats: dict, lanes_json: dict) -> tuple[list[list[str]], list[str]]:
    merged: dict[str, list] = {}
    for m in hub["merged"]:
        merged.setdefault(m["lane"], []).append(m)
    rows, unparsed = [], []
    for lane, chat in lane_order(chats, lanes_json):
        info = lanes_json.get(lane) if isinstance(lanes_json.get(lane), dict) else {}
        chat_lane = chats.get(chat, {}).get("lanes", {}).get(lane)
        if chat_lane is None:  # the args file names another chat, or none: find the lane where it is written
            chat_lane = next((chats[c]["lanes"][lane] for c in CHATS if lane in chats[c]["lanes"]), None)
            chat = chat or next((c for c in CHATS if lane in chats[c]["lanes"]), "")
        if chat_lane is None or not chat_lane["state"]:
            unparsed.append(lane)
        chat_note = (chat_lane or {}).get("note", "")
        tier = tier_text(info["tier"]) if "tier" in info else tier_from_note(chat_note)
        flagged = flag_text(info.get("flagged")) if "flagged" in info else ("yes" if re.search(r"\bflagged\b", chat_note, re.I) else "")
        granted = hub["slots"].get(lane)
        slot = f"slot {granted['slot']}" if granted else "-"
        state = (chat_lane or {}).get("state") or "NEW"
        chat_tip = (chat_lane or {}).get("tip", "")
        merges = merged.get(lane, [])
        final = [m for m in merges if not m["slice"]]
        note_parts = []
        if granted:
            note_parts.append(f"GRANTED {granted['time']}".strip())
        if final or (merges and state == "MERGED"):
            state = "MERGED"
            note_parts.append(merge_text((final or merges)[-1]))
        else:
            note_parts += [merge_text(m) for m in merges]  # slice merges: the lane continues on its branch
            note_parts += ["merging now" for m in hub["merging"] if m["lane"] == lane]
            note_parts.append(chat_note)
            if chat_tip:
                note_parts.append(f"tip {chat_tip[:8]}")
        rows.append([f"`{lane}`", chat, tier, flagged, slot, state, cut("; ".join(p for p in note_parts if p))])
    return rows, unparsed


def build(stamp: str) -> tuple[str, dict]:
    missing = []

    def status_text(track):
        t = read_text(COORD / f"status-{track}.md")
        if t is None:
            missing.append(f"status-{track}.md")
        return t or ""

    hub = parse_hub(status_text(HUB))
    chats = {c: parse_chat(status_text(c)) for c in CHATS}
    lanes_json, args_note = {}, ""
    raw = read_text(ARGS_JSON)
    if raw is None:
        args_note = f"{ARGS_JSON.name} not found: the lanes are listed from the status files"
    else:
        try:
            lanes_json = json.loads(raw).get("lanes") or {}
            if not isinstance(lanes_json, dict):
                raise ValueError("lanes is not an object")
        except Exception as e:
            lanes_json, args_note = {}, f"{ARGS_JSON.name} unreadable ({e.__class__.__name__}): the lanes are listed from the status files"
    launch, last_launch, loop = launcher()
    ctx, ctx_err = context_rows()
    nb = notes()
    if not (COORD / "board-notes.md").is_file():
        missing.append("board-notes.md")
    crows = chat_rows(hub, chats, launch, ctx, missing)
    lrows, unparsed = lane_rows(hub, chats, lanes_json)
    owner = [l for l in nb.get("For the owner", "").splitlines() if l.strip()]
    if len(owner) < 3:
        owner += [f"STATE: HUB {hub['state'] or '?'}" + (f" — {cut(hub['note'], 140)}" if hub["note"] else ""),
                  "NEEDS YOU: (board-notes.md has no `## For the owner` lines yet)", "NEXT: -"][len(owner):]
    first3, rest = owner[:3], "\n".join(owner[3:]).strip()
    merges = nb.get("Merges", "")
    top = [f"- merging now: {m['text']}" for m in hub["merging"]]
    if hub["queue"]:
        top.append(f"- the merge queue: {hub['queue']}")
    if top:
        merges = "\n".join(top) + "\n\n" + merges
    if hub["merged"]:
        merges += "\n\n" + "\n".join(f"- `{m['lane']}` {merge_text(m)} {cut(m['rest'], 120)}".rstrip() for m in hub["merged"])
    chats_block = table(["Chat", "Session", "State", "Context", "Last step"], crows)
    if ctx_err:
        chats_block += f"\n\nContext column blank: {ctx_err}."
    lanes_block = table(["Lane", "Chat", "Tier", "Flagged", "Slot", "State", "Note"], lrows)
    if args_note:
        lanes_block += f"\n\n{args_note}."
    if unparsed:
        lanes_block += ("\n\nWarning: no LANE state read for " + ", ".join(f"`{l}`" for l in unparsed)
                        + " (shown NEW; the chat's status file has no `LANE: <lane> <STATE>` line in its header).")
    hub_lines = [f"- {k}: {hub[k] or '-'}" for k in ("BASE", "BASE-READY", "TRACKS-ALLOWED", "QUIET", "HOURS", "UPDATED")]
    parts = first3 + ["", TITLE, "", INTRO, "", f"Rewritten {stamp} by `board.py`.", ""]
    if rest:
        parts += ["## For the owner (more)", "", rest, ""]
    parts += [
        "## The HUB", "", f"- STATE: {hub['state'] or '-'}" + (f" — {cut(hub['note'], 200)}" if hub["note"] else "")] + hub_lines + [
        "",
        "## Chats", "", chats_block, "",
        f"## Lanes ({len(lrows)})", "", lanes_block, "",
        f"Slots allowed: {hub['SLOTS-ALLOWED'] or '-'}. {granted_text(hub)}", "",
        "## Merges", "", merges.strip() or "(none yet)", "",
        "## Blockers and questions", "", nb.get("Blockers and questions", "") or "(none)", "",
        "## Machine", "", f"- {memory_line()}", f"- {loop[0].upper() + loop[1:]}; its last launch: {last_launch or 'none found'}.", "",
        "## Files of the build", "", nb.get("Files of the build", ""), "",
    ]
    if missing:
        parts += [f"Not found when this board was written: {', '.join(missing)}.", ""]
    text = "\n".join(parts)
    return text, {"chat_rows": crows, "lane_rows": lrows, "unparsed": unparsed, "ctx_err": ctx_err, "hub": hub,
                  "merged": hub["merged"], "merging": hub["merging"], "missing": missing, "args_note": args_note,
                  "first3": first3, "loop": loop, "last_launch": last_launch}


def main() -> None:
    global COORD, ARGS_JSON, CONTEXT_NOW
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # a cp1252 console must not kill --check
    ap = argparse.ArgumentParser(description="Write the 1-addic offline board from the status files and board-notes.md.")
    ap.add_argument("--out", default=None, help="default: <coord>/SPRINT-BOARD.md")
    ap.add_argument("--stamp", default=dt.datetime.now(IST).strftime("%Y-%m-%d %H:%M IST"))
    ap.add_argument("--check", action="store_true", help="print the parsed rows; write nothing")
    ap.add_argument("--coord", default=str(COORD), help="the coordination folder (status-*.md, board-notes.md, lane-widening.md)")
    ap.add_argument("--args", default=str(ARGS_JSON), help="lane_args.json")
    ap.add_argument("--context-now", default=str(CONTEXT_NOW), help="context_now.py")
    a = ap.parse_args()
    COORD, ARGS_JSON, CONTEXT_NOW = Path(a.coord), Path(a.args), Path(a.context_now)
    out = a.out or str(COORD / "SPRINT-BOARD.md")
    text, info = build(a.stamp)
    if a.check:
        hub = info["hub"]
        print(f"board.py --check: coord {COORD}; args {ARGS_JSON}\n")
        print("first three lines:\n  " + "\n  ".join(info["first3"]) + "\n")
        print(f"HUB: STATE {hub['state'] or '-'}; BASE {hub['BASE'] or '-'}; BASE-READY {hub['BASE-READY'] or '-'}; "
              f"TRACKS-ALLOWED {hub['TRACKS-ALLOWED'] or '-'}; SLOTS-ALLOWED {hub['SLOTS-ALLOWED'] or '-'}; "
              f"slots {len(hub['slots'])}; QUIET {hub['QUIET'] or '-'}; HOURS {cut(hub['HOURS'] or '-', 60)}\n")
        print(table(["Chat", "Session", "State", "Context", "Last step"],
                    [[r[0], r[1][:8], r[2].split(" — ")[0], r[3], r[4]] for r in info["chat_rows"]]))
        print()
        print(table(["Lane", "Chat", "Tier", "Flagged", "Slot", "State", "Note"],
                    [[r[0], r[1], r[2], r[3], r[4], r[5], r[6][:60]] for r in info["lane_rows"]]))
        print(f"\n{memory_line()}\n{info['loop']}; last launch: {info['last_launch'] or 'none found'}")
        print(f"\n{len(info['chat_rows'])} chat rows, {len(info['lane_rows'])} lane rows; "
              f"MERGED lines: {len(info['merged'])} ({sum(1 for m in info['merged'] if m['slice'])} slice); "
              f"MERGING now: {', '.join(m['lane'] for m in info['merging']) or 'none'}; "
              f"lanes without a LANE state: {', '.join(info['unparsed']) or 'none'}"
              + (f"; {info['args_note']}" if info["args_note"] else "")
              + (f"; missing: {', '.join(info['missing'])}" if info["missing"] else "")
              + (f"; {info['ctx_err']}" if info["ctx_err"] else ""))
        return
    Path(out).write_text(text, encoding="utf-8", newline="\n")
    print(f"board.py: wrote {out} ({len(info['lane_rows'])} lanes, {len(info['chat_rows'])} chats)")


if __name__ == "__main__":
    main()
