"""fresh_chat_launcher.py - starts a fresh chat itself when a chat of the 1-addic offline build (HUB, CORE, SCREENS)
needs one, so the owner does not have to (adapted on 7 November 2026 from the Kriya build program's launcher; the
mechanisms are the same).

The launcher is a loop (`--loop`, one check every two minutes) that runs as a plain background process of the
owner's logon, started by `--start` (detached, pid in loop.pid). Never a scheduled task: the Task Scheduler kills
everything a task started when the task ends, the launched chats included. Nothing starts it at logon: after a
machine restart the owner runs `--start`, then `--launch-missing`.

Each check:
  1. reads the three status files (coordination/status-<TRACK>.md), the live sessions of this program
     (`claude agents --json`, the entries whose cwd is C:\\Users\\ruchi\\1-addic: the owner's windows and the
     launcher's background sessions), the transcripts' heads and tails (which track a chat is, by tools/
     token_roles.json or the kickoff line `You are the <TRACK> chat`; when it started, its last step, its context);
  2. decides per track:
     HAND-OVER  the STATE word is RESTART or HANDOVER and no chat of the track with at least one step started after
                its UPDATED time -> a fresh chat now;
     NO CHAT    no live session of the track (a closed window, a reboot, a stopped background session), the track
                not at a stop (STATE not COMPLETE, CLOSED, PAUSED, STOPPED or WAITING-OWNER; a build track at READY,
                every lane merged) and no step of the track for 30 minutes -> a fresh chat with the resume line;
     no status file -> nothing (said per track);
     a chat over 300,000 that has not handed over: nothing here (hook_context_restart.py tells it);
     the build tracks (CORE, SCREENS) are gated: launched only once status-HUB.md's header has a `BASE-READY:` line
     (the HUB writes it once and never removes it) AND its `TRACKS-ALLOWED:` line names the track (the HUB adds
     SCREENS when memory allows). The HUB has no gate;
  3. never launches anything while free memory is under 4.0 GB (logged per track that needed a chat);
  4. launches, in C:\\Users\\ruchi\\1-addic, `claude --bg --name "<TRACK> <HH:MM>" --model <model> [extra]
     "<kickoff block>\\n\\n<resume line>"` (HUB: claude-fable-5-1 --effort high; CORE and SCREENS: claude-opus-5-5;
     the block is read from KICKOFF-PROMPTS.md at launch time, so an edit there reaches the next chat), records the
     session in tools/token_roles.json ("(launcher)") and in its state; at most one launch per track per 45 minutes;
  5. a launched chat with no step after 15 minutes is noted (the usage limit, most likely); after 45 minutes it is
     stopped and removed and the launch is tried again; once a fresh chat has stepped, the launcher's own previous
     session of that track is stopped. The owner's interactive windows are never stopped.
  Every 10 minutes the loop appends a memory row to coordination/lane-widening.md:
     | <stamp IST> | <free GB> | <total GB> | <claude procs> | <node procs> | <slots by rule> |
     slots = max(0, floor((free - 4.0) / 0.7)).

  python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --status [--json]   pause, loop, last check, per track
  ... --once [--dry-run]       one check by hand (--dry-run decides and logs, launches and stops nothing)
  ... --pause "<reason>"       no launches until --resume (the HUB at the close; the owner)
  ... --resume
  ... --pause-track CORE | --resume-track CORE     one track's pause (the global pause aside)
  ... --start | --stop         the loop now (--stop ends the loop; launched chats live on)
  ... --restart [--resume]     stop the loop and start it again, so an edited script is loaded; with --resume the
                               global pause is lifted in between
  ... --launch-missing         one check with the 30-minute quiet rule off: every track without a live chat (and not
                               paused, gated or at a stop) is launched now (after a machine restart)
  ... --mem                    sample the memory once and print the lane-widening row (writes nothing)
  ... --test-launch            a cheap haiku background chat through the same path, then removed
  ... --self-test
  ... --coord <dir> --kickoff <file>   other status files / prompts (tests; with ADDIC_HUB_HOME for another state)

State and log: %LOCALAPPDATA%\\1-addic-hub\\launcher\\ (state.json, launcher.log, loop.pid; ADDIC_HUB_HOME overrides
the base). `claude agents` lists the launched chats; `claude attach <id>` opens one in a terminal.
"""
from __future__ import annotations

import argparse
import copy
import ctypes
import datetime
import io
import json
import math
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent          # <docs>/tools
DOCS = HERE.parent                               # docs/offline/build-2026-11-07
REPO = HERE.parents[3]                           # C:\Users\ruchi\1-addic (the chats run here)
sys.path.insert(0, str(HERE))
import context_now as cn  # noqa: E402

CO = DOCS / "coordination"
KICKOFF_FILE = DOCS / "KICKOFF-PROMPTS.md"
ROLES = HERE / "token_roles.json"
MODEL = "claude-opus-5-5"
TRACKS = ("HUB", "CORE", "SCREENS")
BUILD_TRACKS = ("CORE", "SCREENS")
PROGRAM_TAG = "offline-v1"
# Per track: model and extra flags for `claude --bg`; gate (track, the line that must exist, the line that must name
# this track); stop (STATE words that end the track besides TERMINAL: a build chat whose lanes are all merged).
TRACK = {"HUB": {"model": "claude-fable-5-1", "extra": ("--effort", "high"), "gate": None, "stop": ()}}
for _t in BUILD_TRACKS:
    TRACK[_t] = {"model": MODEL, "extra": (), "gate": ("HUB", "BASE-READY", "TRACKS-ALLOWED"), "stop": ("READY",)}
PAUSED_TRACKS_DEFAULT = ()
RESUME = ("resume: read your status file and your RUN-RECORD.md, then continue from the last finished step; a workflow run "
          "your run record names as running is alive only if its session is still listed by claude agents: if that "
          "session is gone, the run died with it, so relaunch that lane with done and priorNote from its branch's last "
          "commit and its progress notes, never wait for it")
STOPPING = re.compile(r"\b(RESTART|HANDOVER|HAND-OVER)\b", re.I)
TERMINAL = re.compile(r"^(COMPLETE|COMPLETED|CLOSED|PAUSED|STOPPED|STOP|END|WAITING-OWNER|DONE)\b", re.I)
TRACK_RE = "HUB|CORE|SCREENS"
KICKOFF = re.compile(r"You are the (%s) chat" % TRACK_RE)
NAME_TRACK = re.compile(r"\b(%s)\b" % TRACK_RE)
HEADER_KEYS = ("STATE", "UPDATED", "BASE-READY", "TRACKS-ALLOWED")
HEADER_MAX = 300           # the header ends at the first line starting with '# '; at most this many lines read
LOOP_SECONDS = 120
RELAUNCH_MIN = 45          # one launch per track per 45 minutes; a stepless launch is retried after this
NO_STEP_NOTE_MIN = 15      # a launched chat without a step after this is noted
QUIET_MIN = 30             # NO CHAT: the track's last step at least this old
HOURS = 72                 # transcripts considered
HEAD_BYTES = 300 * 1024
MIN_FREE_GB = 4.0          # never launch under this
GB_PER_SLOT = 0.7
MEM_EVERY = 600            # the loop's memory sample, seconds
IST = cn.IST


def now_ist():
    return datetime.datetime.now(IST)


def home():
    base = os.environ.get("ADDIC_HUB_HOME") or os.path.join(os.environ.get("LOCALAPPDATA", os.path.expanduser("~")), "1-addic-hub")
    d = Path(base) / "launcher"
    d.mkdir(parents=True, exist_ok=True)
    return d


def log(msg):
    line = "%s | %s" % (now_ist().strftime("%Y-%m-%d %H:%M:%S"), msg)
    try:
        with io.open(home() / "launcher.log", "a", encoding="utf-8") as fh:
            fh.write(line + "\n")
    except Exception:
        pass
    try:
        if sys.stdout:
            print(line)
    except Exception:
        pass


def load_state():
    try:
        return json.load(io.open(home() / "state.json", encoding="utf-8"))
    except Exception:
        return {}


def save_state(st):
    p = home() / "state.json"
    tmp = str(p) + ".tmp"
    with io.open(tmp, "w", encoding="utf-8") as fh:
        json.dump(st, fh, indent=1)
    os.replace(tmp, p)


def claude_exe():
    return shutil.which("claude") or str(Path.home() / ".local" / "bin" / "claude.exe")


def run_claude(args, timeout=120, cwd=None):
    """Runs the claude CLI without a console window; -> (stdout+stderr, code)."""
    flags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
    try:
        r = subprocess.run([claude_exe()] + list(args), cwd=str(cwd or REPO), capture_output=True, timeout=timeout,
                           creationflags=flags, stdin=subprocess.DEVNULL)
        return (r.stdout + r.stderr).decode("utf-8", errors="replace"), r.returncode
    except Exception as e:
        return "launcher: %s" % e.__class__.__name__, 1


def norm_dir(p):
    return str(p or "").replace("/", "\\").rstrip("\\").lower()


def parse_agents(out, repo=None):
    """`claude agents --json` text -> [{sid, kind, status, name, started, pid, cwd}] of THIS program only (cwd is the
    repo, any case, either slash), or None when the text is not the JSON list."""
    try:
        arr = json.loads(out[out.index("["):])
    except Exception:
        return None
    want = norm_dir(repo or REPO)
    rows = []
    for a in arr:
        if not isinstance(a, dict) or norm_dir(a.get("cwd")) != want:
            continue
        rows.append({"sid": str(a.get("sessionId") or ""), "kind": a.get("kind"), "status": a.get("status") or a.get("state"),
                     "name": a.get("name") or "", "started": a.get("startedAt"), "pid": a.get("pid"), "cwd": a.get("cwd")})
    return rows


def live_sessions():
    """The live sessions of this program (the owner's windows and the background sessions), or None on failure."""
    out, code = run_claude(["agents", "--json"], timeout=60)
    return parse_agents(out)


def head_info(path):
    """(track or None, first timestamp) from the head of a transcript."""
    with io.open(path, "rb") as fh:
        chunk = fh.read(HEAD_BYTES).decode("utf-8", errors="replace")
    m = KICKOFF.search(chunk)
    t = re.search(r'"timestamp":"([^"]+)"', chunk)
    return (m.group(1) if m else None), (t.group(1) if t else "")


def when(iso):
    try:
        return datetime.datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone(IST)
    except Exception:
        return None


def header(track, co=None):
    """The status file's header keys (the first of each; the header ends at the first line starting with '# ');
    {} when the file is missing or unreadable."""
    try:
        text = io.open(Path(co or CO) / ("status-%s.md" % track), encoding="utf-8-sig", errors="replace").read()
    except Exception:
        return {}
    h = {}
    for ln in text.splitlines()[:HEADER_MAX]:
        if ln.startswith("# "):
            break
        k, _, v = ln.partition(":")
        k = k.strip()
        if k in HEADER_KEYS and k not in h:
            h[k] = v.strip()
    h["_file"] = True
    return h


def updated_time(h):
    try:
        return datetime.datetime.strptime(h.get("UPDATED", "")[:16], "%Y-%m-%d %H:%M").replace(tzinfo=IST)
    except Exception:
        return None


def state_word(h):
    return (h.get("STATE", "").split("#")[0].strip().split() or [""])[0].upper()


def allowed_tracks(value):
    """The tracks a TRACKS-ALLOWED value names: upper-case track names outside a '# comment' and outside parentheses,
    'CORE, SCREENS   # SCREENS at 13:00' -> {'CORE', 'SCREENS'}; 'CORE (SCREENS when memory allows)' -> {'CORE'};
    '(none until BASE-READY; CORE first, SCREENS when ...)' -> set()."""
    v = (value or "").split("#")[0]
    prev = None
    while prev != v:
        prev, v = v, re.sub(r"\([^()]*\)", " ", v)
    return set(NAME_TRACK.findall(v.split("(")[0]))


def base_ready(value):
    """A BASE-READY line counts once it carries its time ('<time> <sha>'): a placeholder such as '(at S-01)' or '-'
    does not open the gate."""
    return bool(re.match(r"\s*\d", value or ""))


def kickoff_prompt(track, path=None):
    """The track's kickoff prompt: the fenced block under its '# Prompt N · TRACK' heading, plus the resume line."""
    path = path or KICKOFF_FILE
    lines = io.open(path, encoding="utf-8-sig").read().splitlines()
    i = next((i for i, l in enumerate(lines) if re.match(r"# Prompt \d+ .{1,3}%s\b" % track, l)), None)
    if i is None:
        raise ValueError("no '# Prompt <n> · %s' heading in %s" % (track, path))
    j = next((k for k in range(i + 1, len(lines)) if lines[k].startswith("```")), None)
    k = next((k for k in range(j + 1, len(lines)) if lines[k].strip() == "```"), None) if j is not None else None
    if j is None or k is None:
        raise ValueError("no closed ``` block under the %s heading in %s" % (track, path))
    body = "\n".join(lines[j + 1:k]).strip()
    # The block must say whose it is: the fresh chat is told apart by this line in its transcript's head.
    if ("You are the %s chat" % track) not in body:
        raise ValueError("the %s kickoff block does not contain 'You are the %s chat'" % (track, track))
    return body + "\n\n" + RESUME


def scan(roles, heads, hours=HOURS, root=None):
    """Every main-chat transcript of the last `hours`: sid8 -> {track, start, last, ctx, steps}."""
    root = Path(root or cn.ROOT)
    now = time.time()
    found = {}
    for p in root.glob("*.jsonl"):
        try:
            if now - p.stat().st_mtime > hours * 3600:
                continue
            sid = p.stem[:8]
            # A head read before the chat's first message (a window opened and left idle) has no track; read it again
            # until it has one.
            if sid not in heads or heads[sid][0] is None:
                heads[sid] = list(head_info(p))
            r = roles.get(sid)
            track = r.get("role") if isinstance(r, dict) else None
            if track not in TRACKS:
                track = heads[sid][0]
            u = cn.last_usage(p)
            found[sid] = {"track": track, "start": when(heads[sid][1]), "last": when(u[1]) if u else None,
                          "ctx": u[0] if u else 0, "steps": bool(u)}
        except Exception:
            continue
    return found


def track_of_live(a, found):
    sid8 = a["sid"][:8]
    t = (found.get(sid8) or {}).get("track")
    if t in TRACKS:
        return t
    m = NAME_TRACK.search(a.get("name") or "")
    return m.group(1) if m else None


def decide(track, h, found, live, st, now, gates=None):
    """-> (reason or None, note). Pure: no launch, no I/O. `gates` maps a gate track to its status header (read by the
    caller): a build track launches only once status-HUB.md has the BASE-READY line and its TRACKS-ALLOWED line names
    the track."""
    word = state_word(h)
    cfg = TRACK.get(track) or {}
    launches = (st.get("launches") or {}).get(track) or []
    last = launches[-1] if launches else None
    mine = [a for a in live if track_of_live(a, found) == track]
    with_steps = [(s, v) for s, v in found.items() if v["track"] == track and v["steps"] and v["start"]]
    newest = max(with_steps, key=lambda kv: kv[1]["start"]) if with_steps else None
    last_step = max((v["last"] for s, v in found.items() if v["track"] == track and v["last"]), default=None)
    note = "%s: STATE %s, UPDATED %s, live %d, newest %s" % (track, word or "?", h.get("UPDATED", "?")[:16], len(mine),
                                                            "%s %dk" % (newest[0], newest[1]["ctx"] // 1000) if newest else "-")
    if last and last.get("when"):
        age = (now - datetime.datetime.fromisoformat(last["when"])).total_seconds() / 60
        if age < RELAUNCH_MIN:
            return None, note + "; launched %s %.0f min ago, waiting" % ((last.get("sid") or "")[:8], age)
    if not h:
        return None, note + "; no status file (coordination/status-%s.md): nothing" % track
    gate = cfg.get("gate")
    if gate:
        gh = (gates or {}).get(gate[0]) or {}
        if not base_ready(gh.get(gate[1])):
            return None, note + "; waiting for the %s line of status-%s.md (its STATE is %s)" % (
                gate[1], gate[0], state_word(gh) or ("unknown, no file" if not gh else "unknown"))
        if track not in allowed_tracks(gh.get(gate[2], "")):
            return None, note + "; waiting for the %s line of status-%s.md to name %s (it says: %s)" % (
                gate[2], gate[0], track, gh.get(gate[2]) or "no such line")
    if word and word in (cfg.get("stop") or ()):
        return None, note + "; at a stop (%s)" % word
    if STOPPING.match(word):
        ut = updated_time(h)
        fresh = bool(newest and ut and newest[1]["start"] > ut)
        if not fresh:
            return "HAND-OVER written (status %s, %s)" % (h.get("STATE", "").split("#")[0].strip(), h.get("UPDATED", "?")[:16]), note
        return None, note + "; hand-over answered by %s" % newest[0]
    if TERMINAL.match(word):
        return None, note + "; at a stop"
    if not mine:
        quiet = (now - last_step).total_seconds() / 60 if last_step else 10**6
        if quiet >= QUIET_MIN:
            return "NO CHAT live for %s (last step %s)" % (track, last_step.strftime("%d %b %H:%M") if last_step else "none in %dh" % HOURS), note
        return None, note + "; no live session but a step %.0f min ago" % quiet
    return None, note


def roles_add(sid8, track, when_str, path=None):
    path = path or ROLES
    roles = json.load(io.open(path, encoding="utf-8"))
    if sid8 in roles:
        return False
    tag = PROGRAM_TAG
    k = 1 + sum(1 for v in roles.values() if isinstance(v, dict) and v.get("role") == track and (tag + " ") in (v.get("label") or ""))
    roles[sid8] = {"role": track, "label": "%s %s session %d, %s- (launcher)" % (tag, track, k, when_str)}
    body = "{\n" + ",\n".join(" %s: %s" % (json.dumps(kk), json.dumps(vv, ensure_ascii=False)) for kk, vv in roles.items()) + "\n}\n"
    tmp = str(path) + ".tmp"
    with io.open(tmp, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(body)
    os.replace(tmp, path)
    return True


def bg_launch(name, prompt, model=MODEL, extra=()):
    """`claude --bg ...` -> (short id or None, output)."""
    out, code = run_claude(["--bg", "--name", name, "--model", model] + list(extra) + [prompt], timeout=180)
    m = re.search(r"backgrounded\W+([0-9a-f]{8})", out)
    return (m.group(1) if code == 0 and m else None), out


def full_sid(sid8, tries=15):
    for _ in range(tries):
        hit = [a for a in (live_sessions() or []) if a["sid"].startswith(sid8)]
        if hit:
            return hit[0]["sid"]
        time.sleep(2)
    return sid8


def launch(track, prev_sid, reason, st, dry):
    now = now_ist()
    cfg = TRACK[track]
    name = "%s %s" % (track, now.strftime("%H:%M"))
    try:
        prompt = kickoff_prompt(track)
    except Exception as e:
        msg = "%s: %s" % (e.__class__.__name__, str(e)[:200])
        if dry:
            log("DRY RUN %s: would launch '%s' (%s) because %s; BUT the kickoff prompt is not readable: %s" % (
                track, name, " ".join((cfg["model"],) + tuple(cfg["extra"])), reason, msg))
            return None
        log("LAUNCH FAILED %s: no kickoff prompt (%s)" % (track, msg))
        st.setdefault("failures", []).append({"when": now.isoformat(), "track": track, "out": "no kickoff prompt: " + msg})
        return None
    if dry:
        log("DRY RUN %s: would launch '%s' (%d chars of prompt; %s) because %s" % (
            track, name, len(prompt), " ".join((cfg["model"],) + tuple(cfg["extra"])), reason))
        return None
    sid8, out = bg_launch(name, prompt, model=cfg["model"], extra=cfg["extra"])
    if not sid8:
        log("LAUNCH FAILED %s: %s" % (track, " ".join(out.split())[:300]))
        st.setdefault("failures", []).append({"when": now.isoformat(), "track": track, "out": out[:500]})
        return None
    full = full_sid(sid8)
    try:
        roles_add(sid8, track, now.strftime("%d %b %H:%M"))
    except Exception as e:
        log("roles file not updated for %s: %s" % (sid8, e.__class__.__name__))
    st.setdefault("launches", {}).setdefault(track, []).append(
        {"when": now.isoformat(), "sid": full, "name": name, "reason": reason, "prev": prev_sid, "stepped": False})
    log("LAUNCHED %s: %s (%s) because %s" % (track, name, full, reason))
    return full


def care(track, st, found, live, now, dry):
    """The launcher's own sessions of a track: a stepless one is retried after 45 min; the previous one is stopped
    once the fresh one has stepped."""
    launches = (st.get("launches") or {}).get(track) or []
    if not launches:
        return
    last = launches[-1]
    sid8 = (last.get("sid") or "")[:8]
    info = found.get(sid8) or {}
    age = (now - datetime.datetime.fromisoformat(last["when"])).total_seconds() / 60 if last.get("when") else 0
    if info.get("steps") and not last.get("stepped"):
        last["stepped"] = True
        log("%s: the fresh chat %s has stepped (context %dk)" % (track, sid8, info.get("ctx", 0) // 1000))
        prev = (last.get("prev") or "")[:8]
        if prev and prev != sid8:
            prev_live = [a for a in live if a["sid"].startswith(prev) and a.get("kind") == "background"]
            if prev_live and not dry:
                out, code = run_claude(["stop", prev], timeout=60)
                log("%s: stopped the previous launched session %s (exit %s)" % (track, prev, code))
    elif not info.get("steps") and age >= NO_STEP_NOTE_MIN and not last.get("noted"):
        last["noted"] = True
        log("%s: %s has no step after %.0f min (the usage limit, most likely); retried after %d min" % (track, sid8, age, RELAUNCH_MIN))
    if not info.get("steps") and age >= RELAUNCH_MIN and not last.get("removed"):
        last["removed"] = True
        if not dry:
            run_claude(["stop", sid8], timeout=60)
            out, code = run_claude(["rm", sid8], timeout=60)
            log("%s: removed the stepless session %s (exit %s); a new launch may follow" % (track, sid8, code))
        last["when"] = (now - datetime.timedelta(minutes=RELAUNCH_MIN + 1)).isoformat()


def paused_tracks_of(st):
    v = st.get("paused_tracks")
    return set(v) if isinstance(v, list) else set(PAUSED_TRACKS_DEFAULT)


# --- memory ------------------------------------------------------------------------------------------------------

class _MEMSTAT(ctypes.Structure):
    _fields_ = [("dwLength", ctypes.c_ulong), ("dwMemoryLoad", ctypes.c_ulong), ("ullTotalPhys", ctypes.c_ulonglong),
                ("ullAvailPhys", ctypes.c_ulonglong), ("ullTotalPageFile", ctypes.c_ulonglong),
                ("ullAvailPageFile", ctypes.c_ulonglong), ("ullTotalVirtual", ctypes.c_ulonglong),
                ("ullAvailVirtual", ctypes.c_ulonglong), ("ullAvailExtendedVirtual", ctypes.c_ulonglong)]


class _PROCENTRY(ctypes.Structure):
    _fields_ = [("dwSize", ctypes.c_ulong), ("cntUsage", ctypes.c_ulong), ("th32ProcessID", ctypes.c_ulong),
                ("th32DefaultHeapID", ctypes.c_size_t), ("th32ModuleID", ctypes.c_ulong), ("cntThreads", ctypes.c_ulong),
                ("th32ParentProcessID", ctypes.c_ulong), ("pcPriClassBase", ctypes.c_long), ("dwFlags", ctypes.c_ulong),
                ("szExeFile", ctypes.c_wchar * 260)]


def memory_gb():
    """(free GB, total GB) by GlobalMemoryStatusEx (no subprocess); PowerShell's Win32_OperatingSystem as the
    fallback; (None, None) when neither works."""
    try:
        m = _MEMSTAT()
        m.dwLength = ctypes.sizeof(_MEMSTAT)
        if ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(m)):
            return m.ullAvailPhys / 2**30, m.ullTotalPhys / 2**30
    except Exception:
        pass
    try:
        r = subprocess.run(["powershell", "-NoProfile", "-NonInteractive", "-Command",
                            "$o = Get-CimInstance Win32_OperatingSystem; \"$($o.FreePhysicalMemory) $($o.TotalVisibleMemorySize)\""],
                           capture_output=True, timeout=60, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
        free_kb, total_kb = r.stdout.decode("utf-8", "replace").split()[:2]
        return int(free_kb) / 2**20, int(total_kb) / 2**20
    except Exception:
        return None, None


def process_counts(names=("claude.exe", "node.exe")):
    """{name: count} of the running processes by image name (Toolhelp snapshot, no subprocess); '?' on failure."""
    try:
        k = ctypes.windll.kernel32
        k.CreateToolhelp32Snapshot.restype = ctypes.c_void_p
        k.Process32FirstW.argtypes = [ctypes.c_void_p, ctypes.POINTER(_PROCENTRY)]
        k.Process32NextW.argtypes = [ctypes.c_void_p, ctypes.POINTER(_PROCENTRY)]
        k.CloseHandle.argtypes = [ctypes.c_void_p]
        h = k.CreateToolhelp32Snapshot(0x2, 0)            # TH32CS_SNAPPROCESS
        if not h or h == ctypes.c_void_p(-1).value:
            raise OSError("snapshot")
        out = {n: 0 for n in names}
        e = _PROCENTRY()
        e.dwSize = ctypes.sizeof(_PROCENTRY)
        ok = k.Process32FirstW(h, ctypes.byref(e))
        while ok:
            exe = e.szExeFile.lower()
            if exe in out:
                out[exe] += 1
            ok = k.Process32NextW(h, ctypes.byref(e))
        k.CloseHandle(h)
        return out
    except Exception:
        return {n: "?" for n in names}


def slots_by_rule(free):
    return max(0, math.floor((free - MIN_FREE_GB) / GB_PER_SLOT)) if free is not None else "?"


def mem_row(free=None, total=None, procs=None, stamp=None):
    if free is None and total is None:
        free, total = memory_gb()
    procs = procs if procs is not None else process_counts()
    stamp = stamp or now_ist().strftime("%Y-%m-%d %H:%M IST")
    f = lambda x: "%.1f" % x if isinstance(x, (int, float)) else "?"  # noqa: E731
    return "| %s | %s | %s | %s | %s | %s |" % (stamp, f(free), f(total), procs.get("claude.exe", "?"), procs.get("node.exe", "?"),
                                               slots_by_rule(free))


MEM_HEAD = ("# Lane widening: free memory every ten minutes\n\n"
            "Appended by fresh_chat_launcher.py's loop (`--mem` prints one row). Slots by rule = max(0, floor((free - 4.0) / 0.7)); "
            "nothing is launched under 4.0 GB free.\n\n"
            "| Time (IST) | Free GB | Total GB | claude processes | node processes | Slots by rule |\n"
            "|---|---|---|---|---|---|\n")


def append_mem_row(row, co=None):
    p = Path(co or CO) / "lane-widening.md"
    p.parent.mkdir(parents=True, exist_ok=True)
    text = io.open(p, encoding="utf-8").read() if p.exists() else ""
    with io.open(p, "a", encoding="utf-8", newline="\n") as fh:
        if not text.strip():
            fh.write(MEM_HEAD)
        elif not text.endswith("\n"):
            fh.write("\n")
        fh.write(row + "\n")
    return p


# --- one check ---------------------------------------------------------------------------------------------------

def once(dry=False, live=None, found=None, mem=None):
    """One check. `live`, `found` and `mem` (free GB, total GB) may be given (the self-test); else read here."""
    st = load_state()
    now = now_ist()
    st["last_run"] = now.isoformat()
    paused = st.get("paused")
    paused_tracks = paused_tracks_of(st)
    st["paused_tracks"] = sorted(paused_tracks)
    if live is None:
        live = live_sessions()
    if live is None:
        log("claude agents --json failed; nothing launched this check")
        save_state(st)
        return 1
    heads = st.setdefault("heads", {})
    if found is None:
        found = scan(cn.roles(), heads)
    free, total = mem if mem is not None else memory_gb()
    st["last_memory"] = {"free_gb": round(free, 2) if free is not None else None,
                         "total_gb": round(total, 2) if total is not None else None, "when": now.isoformat()}
    # A dry run decides on a copy: care()'s marks (stepped, noted, removed) are not kept.
    work = copy.deepcopy(st) if dry else st
    gates = {g: header(g) for g in sorted({c["gate"][0] for c in TRACK.values() if c.get("gate")})}
    decisions = {}
    for track in TRACKS:
        try:
            care(track, work, found, live, now, dry)
            h = header(track)
            reason, note = decide(track, h, found, live, work, now, gates)
            if reason and track in paused_tracks:
                decisions[track] = {"reason": None, "note": note + "; the track is paused (--resume-track %s lifts it)" % track, "held": reason}
                continue
            if reason and free is not None and free < MIN_FREE_GB:
                decisions[track] = {"reason": None, "note": note + "; free memory %.1f GB, under %.1f" % (free, MIN_FREE_GB), "held": reason}
                log("%s%s needs a fresh chat (%s) but free memory is %.1f GB, under %.1f GB: not launched" % (
                    "DRY RUN " if dry else "", track, reason, free, MIN_FREE_GB))
                continue
            decisions[track] = {"reason": reason, "note": note}
            if dry and not reason:
                log("DRY RUN %s: nothing (%s)" % (track, note))
            if reason and paused:
                log("%s needs a fresh chat (%s) but the launcher is paused: %s" % (track, reason, paused.get("reason", "")))
                continue
            if reason:
                if free is None:
                    log("%s: free memory unreadable; launching anyway" % track)
                mine = [a for a in live if track_of_live(a, found) == track and a.get("kind") == "background"]
                prev = mine[-1]["sid"] if mine else None
                launch(track, prev, reason, work, dry)
        except Exception as e:
            log("%s: launcher error %s: %s" % (track, e.__class__.__name__, str(e)[:200]))
    st["last_decisions"] = decisions
    st["last_dry_run"] = bool(dry)
    st["heads"] = {k: v for k, v in heads.items() if k in found}
    save_state(st)
    return 0


# --- the loop as a plain process ---------------------------------------------------------------------------------

def pid_alive(pid):
    try:
        k = ctypes.windll.kernel32
        h = k.OpenProcess(0x1000, False, int(pid))      # PROCESS_QUERY_LIMITED_INFORMATION
        if not h:
            return False
        code = ctypes.c_ulong()
        ok = k.GetExitCodeProcess(h, ctypes.byref(code))
        k.CloseHandle(h)
        return bool(ok) and code.value == 259          # STILL_ACTIVE
    except Exception:
        return False


def loop_pid():
    try:
        pid = int(io.open(home() / "loop.pid", encoding="utf-8").read().strip())
        return pid if pid_alive(pid) else None
    except Exception:
        return None


def loop():
    other = loop_pid()
    if other and other != os.getpid():
        log("a loop already runs (pid %d); this one exits" % other)
        return 0
    io.open(home() / "loop.pid", "w", encoding="utf-8").write(str(os.getpid()))
    log("LOOP started (pid %d, every %d s; memory row every %d min)" % (os.getpid(), LOOP_SECONDS, MEM_EVERY // 60))
    last_mem = 0.0
    while True:
        try:
            if (home() / "loop.stop").exists():
                (home() / "loop.stop").unlink()
                log("LOOP stopped on request (pid %d); launched chats live on" % os.getpid())
                return 0
            if time.time() - last_mem >= MEM_EVERY:
                last_mem = time.time()
                try:
                    append_mem_row(mem_row())
                except Exception as e:
                    log("memory row not written: %s" % e.__class__.__name__)
            once()
        except Exception as e:
            log("loop error %s: %s" % (e.__class__.__name__, str(e)[:200]))
        time.sleep(LOOP_SECONDS)


def start_detached():
    if loop_pid():
        print("the loop already runs (pid %d)" % loop_pid())
        return 0
    py = Path(sys.executable)
    pyw = py.with_name("pythonw.exe")
    exe = str(pyw if pyw.exists() else py)
    flags = getattr(subprocess, "DETACHED_PROCESS", 0) | getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0) | getattr(subprocess, "CREATE_NO_WINDOW", 0)
    p = subprocess.Popen([exe, str(Path(__file__).resolve()), "--loop"], cwd=str(REPO), creationflags=flags, close_fds=True,
                         stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(10):
        time.sleep(1)
        if loop_pid():
            break
    print("loop started: pid %s (alive: %s)" % (p.pid, bool(loop_pid())))
    return 0 if loop_pid() else 1


def launch_missing():
    """One check with the 30-minute quiet rule off: every track without a live chat (and not paused, gated or at a
    stop) is launched now. The owner's line after a machine restart: the loop alone would wait thirty minutes of
    quiet per track before the NO CHAT rule fires."""
    global QUIET_MIN
    QUIET_MIN = 0
    log("LAUNCH-MISSING: one check with the quiet rule off (the owner's line after a restart)")
    return once()


def restart_loop(resume=False):
    """Stop the running loop (a loop holds the code it started with: an edit of this file reaches it only through a
    restart), lift the global pause if asked, then start the loop again. The old loop must be gone before the pause
    is lifted, else it would launch in its last check."""
    if loop_pid():
        if stop_loop() != 0:
            return 1
    if resume:
        st = load_state()
        st["paused"] = None
        save_state(st)
        log("RESUMED (with --restart)")
    return start_detached()


def stop_loop():
    pid = loop_pid()
    if not pid:
        print("no loop runs")
        return 0
    io.open(home() / "loop.stop", "w", encoding="utf-8").write("stop")
    for _ in range(LOOP_SECONDS + 10):
        time.sleep(1)
        if not loop_pid():
            print("loop %d stopped; launched chats live on" % pid)
            return 0
    print("loop %d did not stop in time" % pid)
    return 1


def test_launch():
    name = "launcher-test %s" % now_ist().strftime("%d %b %H:%M:%S")
    sid8, out = bg_launch(name, "Reply with the single word OK and nothing else.", model="haiku", extra=["--effort", "low"])
    if not sid8:
        print("TEST FAILED: %s" % " ".join(out.split())[:300])
        return 1
    full = full_sid(sid8)
    p = Path(cn.ROOT) / (full + ".jsonl")
    stepped = False
    for _ in range(30):
        time.sleep(3)
        if p.exists() and cn.last_usage(p):
            stepped = True
            break
    listed = any(a["sid"].startswith(sid8) for a in (live_sessions() or []))
    run_claude(["stop", sid8], timeout=60)
    run_claude(["rm", sid8], timeout=60)
    print("test launch %s: listed by claude agents %s; stepped %s; stopped and removed" % (sid8, listed, stepped))
    log("TEST LAUNCH %s: listed %s stepped %s" % (sid8, listed, stepped))
    return 0 if (listed and stepped) else 1


def status(as_json=False):
    st = load_state()
    if as_json:
        print(json.dumps({"paused": st.get("paused"), "paused_tracks": sorted(paused_tracks_of(st)), "loop_pid": loop_pid(),
                          "last_run": st.get("last_run"), "last_dry_run": st.get("last_dry_run"), "memory": st.get("last_memory"),
                          "decisions": st.get("last_decisions"), "launches": st.get("launches"),
                          "failures": (st.get("failures") or [])[-3:]}, indent=1))
        return
    print("launcher: %s; loop %s" % (
        ("PAUSED since %s: %s" % (st["paused"].get("since", "?")[:16], st["paused"].get("reason", "")) if st.get("paused") else "active"),
        ("running (pid %d)" % loop_pid()) if loop_pid() else "NOT RUNNING (python docs/offline/build-2026-11-07/tools/fresh_chat_launcher.py --start)"))
    print("paused tracks: %s" % (", ".join(sorted(paused_tracks_of(st))) or "none"))
    m = st.get("last_memory") or {}
    print("last check: %s%s; free memory then %s GB" % ((st.get("last_run") or "never")[:19], " (a dry run)" if st.get("last_dry_run") else "",
                                                       m.get("free_gb", "?")))
    for track in TRACKS:
        d = (st.get("last_decisions") or {}).get(track) or {}
        what = ("LAUNCH: " + d["reason"]) if d.get("reason") else (("HELD: " + d["held"]) if d.get("held") else "nothing to do")
        print("  %s -> %s" % (d.get("note", track), what))
    for track in TRACKS:
        for L in ((st.get("launches") or {}).get(track) or [])[-3:]:
            print("  launched %s %s %s (%s) because %s%s" % (track, L.get("when", "")[:16], L.get("sid", "")[:8], L.get("name"), L.get("reason"),
                                                             "; stepped" if L.get("stepped") else ("; removed" if L.get("removed") else "; no step yet")))
    for f in (st.get("failures") or [])[-3:]:
        print("  FAILED %s %s: %s" % (f.get("when", "")[:16], f.get("track"), " ".join((f.get("out") or "").split())[:160]))
    tail = []
    try:
        tail = io.open(home() / "launcher.log", encoding="utf-8").read().splitlines()[-8:]
    except Exception:
        pass
    if tail:
        print("log tail:")
        for ln in tail:
            print("  " + ln)


def self_test():
    global QUIET_MIN, CO, KICKOFF_FILE
    checks = []
    tmp = Path(tempfile.mkdtemp(prefix="addic-launcher-"))
    os.environ["ADDIC_HUB_HOME"] = str(tmp)
    co = tmp / "co"
    co.mkdir()
    now = datetime.datetime(2026, 11, 7, 15, 0, tzinfo=IST)

    def st_file(track, state, upd, extra=""):
        io.open(co / ("status-%s.md" % track), "w", encoding="utf-8").write(
            "TRACK: %s\nSTATE: %s\n%sLANE: c-store BUILDING   # x\nSLOTS-ASKED: none\nUPDATED: %s IST\n\n# Notes\n" % (track, state, extra, upd))

    def sess(track, start, last, steps=True, ctx=100_000):
        return {"track": track, "start": start, "last": last, "ctx": ctx, "steps": steps}

    t = lambda h, m: datetime.datetime(2026, 11, 7, h, m, tzinfo=IST)  # noqa: E731
    open_gate = {"HUB": {"STATE": "BASE-READY", "BASE-READY": "2026-11-07 09:00 abc1234", "TRACKS-ALLOWED": "CORE"}}
    both = {"HUB": {"STATE": "INTEGRATING", "BASE-READY": "2026-11-07 09:00 abc1234", "TRACKS-ALLOWED": "CORE, SCREENS   # 13:00"}}
    st_file("CORE", "HANDOVER    # at 301k", "2026-11-07 14:00")
    found = {"aaaaaaaa": sess("CORE", t(10, 0), t(14, 0))}
    live = [{"sid": "aaaaaaaa-1", "kind": "interactive", "status": "idle", "name": "Prompt 1 - CORE"}]
    r, n = decide("CORE", header("CORE", co), found, live, {}, now, open_gate)
    checks.append(("hand-over written, no newer chat -> launch", bool(r) and r.startswith("HAND-OVER")))
    found["bbbbbbbb"] = sess("CORE", t(14, 10), t(14, 30))
    r, n = decide("CORE", header("CORE", co), found, live, {}, now, open_gate)
    checks.append(("a newer chat with a step -> nothing", r is None and "answered by bbbbbbbb" in n))
    found["bbbbbbbb"] = sess("CORE", t(14, 10), None, steps=False)
    r, n = decide("CORE", header("CORE", co), found, live, {}, now, open_gate)
    checks.append(("a newer chat with no step (usage limit) does not answer the hand-over", bool(r)))
    st = {"launches": {"CORE": [{"when": t(14, 40).isoformat(), "sid": "cccccccc-1"}]}}
    r, n = decide("CORE", header("CORE", co), found, live, st, now, open_gate)
    checks.append(("a launch 20 min ago -> wait", r is None and "waiting" in n))
    st = {"launches": {"CORE": [{"when": t(13, 0).isoformat(), "sid": "cccccccc-1"}]}}
    r, n = decide("CORE", header("CORE", co), found, live, st, now, open_gate)
    checks.append(("a launch 2 h ago -> no longer waits", bool(r)))
    st_file("SCREENS", "BUILDING   # lanes running", "2026-11-07 12:00")
    found = {"dddddddd": sess("SCREENS", t(9, 0), t(14, 20))}
    r, n = decide("SCREENS", header("SCREENS", co), found, [], {}, now, both)
    checks.append(("no live chat, quiet 40 min -> launch with the resume line", bool(r) and r.startswith("NO CHAT")))
    found = {"dddddddd": sess("SCREENS", t(9, 0), t(14, 50))}
    r, n = decide("SCREENS", header("SCREENS", co), found, [], {}, now, both)
    checks.append(("no live chat but a step 10 min ago -> wait", r is None))
    found = {"dddddddd": sess("SCREENS", t(9, 0), t(14, 0))}
    live = [{"sid": "eeeeeeee-1", "kind": "interactive", "status": "busy", "name": "SCREENS by hand"}]
    r, n = decide("SCREENS", header("SCREENS", co), found, live, {}, now, both)
    checks.append(("a live window named for the track -> nothing", r is None and "live 1" in n))
    st_file("HUB", "COMPLETE   # tagged", "2026-11-07 12:00")
    r, n = decide("HUB", header("HUB", co), {}, [], {}, now)
    checks.append(("STATE COMPLETE and no chat -> at a stop, nothing", r is None and "at a stop" in n))
    st_file("HUB", "INTEGRATING   # merging", "2026-11-07 12:00")
    r, n = decide("HUB", header("HUB", co), {}, [], {}, now)
    checks.append(("the HUB (no gate), no chat for 72 h -> launch", bool(r) and r.startswith("NO CHAT")))
    r, n = decide("CORE", header("CORE", tmp), {}, [], {}, now, open_gate)
    checks.append(("no status file -> nothing, said so", r is None and "no status file" in n))
    st_file("CORE", "BUILDING   # SCREENS HANDOVER noted; nothing of ours", "2026-11-07 14:00")
    r, n = decide("CORE", header("CORE", co), {"aaaaaaaa": sess("CORE", t(10, 0), t(14, 0))},
                  [{"sid": "aaaaaaaa-1", "kind": "interactive", "status": "busy", "name": "CORE"}], {}, now, open_gate)
    checks.append(("HANDOVER only in the comment of a BUILDING state -> nothing", r is None))
    # The gate: BASE-READY and TRACKS-ALLOWED on status-HUB.md.
    st_file("CORE", "NEW   # opened by the HUB", "2026-11-07 07:00")
    st_file("SCREENS", "NEW   # opened by the HUB", "2026-11-07 07:00")
    r, n = decide("CORE", header("CORE", co), {}, [], {}, now, gates={"HUB": {"STATE": "RESTART"}})
    checks.append(("CORE waits while status-HUB.md has no BASE-READY line (even at the HUB's RESTART)", r is None and "waiting for the BASE-READY line" in n))
    r, n = decide("CORE", header("CORE", co), {}, [], {}, now, gates={"HUB": {"STATE": "BASE-READY", "BASE-READY": "2026-11-07 09:00 abc1234"}})
    checks.append(("CORE waits with BASE-READY but no TRACKS-ALLOWED line", r is None and "TRACKS-ALLOWED line of status-HUB.md to name CORE" in n))
    r, n = decide("CORE", header("CORE", co), {}, [], {}, now, gates=open_gate)
    checks.append(("CORE with no chat launches once BASE-READY and TRACKS-ALLOWED: CORE are there", bool(r) and r.startswith("NO CHAT")))
    r, n = decide("SCREENS", header("SCREENS", co), {}, [], {}, now, gates=open_gate)
    checks.append(("SCREENS waits while TRACKS-ALLOWED names CORE only", r is None and "to name SCREENS" in n))
    r, n = decide("SCREENS", header("SCREENS", co), {}, [], {}, now, gates=both)
    checks.append(("SCREENS launches once TRACKS-ALLOWED names it", bool(r) and r.startswith("NO CHAT")))
    checks.append(("TRACKS-ALLOWED: a track in a '# comment' or in parentheses does not count (the HUB's S-00 line names none)",
                   allowed_tracks("CORE   # SCREENS when memory allows") == {"CORE"}
                   and allowed_tracks("CORE (SCREENS when the sample leaves room)") == {"CORE"}
                   and allowed_tracks("(none until BASE-READY; CORE first, SCREENS when the sample leaves room for a second chat") == set()
                   and allowed_tracks("(none until BASE-READY; CORE first, SCREENS when the sample leaves room)") == set()
                   and allowed_tracks("CORE, SCREENS") == {"CORE", "SCREENS"} and allowed_tracks("core first") == set()))
    r, n = decide("CORE", header("CORE", co), {}, [], {}, now, gates={"HUB": {"BASE-READY": "(written at S-01)", "TRACKS-ALLOWED": "CORE"}})
    checks.append(("a placeholder BASE-READY line without its time does not open the gate", r is None and "waiting for the BASE-READY line" in n))
    r, n = decide("CORE", header("CORE", co), {}, [], {}, now, gates={})
    checks.append(("CORE waits when status-HUB.md is missing or unreadable", r is None and "waiting for the BASE-READY line" in n))
    st_file("CORE", "READY   # every lane merged", "2026-11-07 20:00")
    r, n = decide("CORE", header("CORE", co), {}, [], {}, now, gates=open_gate)
    checks.append(("a build track at READY (all lanes merged) is at a stop", r is None and "at a stop" in n))
    st_file("CORE", "RESTART   # at 301k", "2026-11-07 09:00")
    r, n = decide("CORE", header("CORE", co), {}, [], {}, now, gates=open_gate)
    checks.append(("a build track that handed over is relaunched", bool(r) and r.startswith("HAND-OVER")))
    slots = "".join("SLOTS: lane-%02d slot=%d granted 2026-11-07 09:%02d\n" % (i, i, i) for i in range(40))
    io.open(co / "status-HUB.md", "w", encoding="utf-8").write(
        "TRACK: HUB\nSTATE: BUILDING   # merging\nBASE: abc1234\nBASE-READY: 2026-11-07 09:00 abc1234\n" + slots +
        "TRACKS-ALLOWED: CORE, SCREENS\nUPDATED: 2026-11-07 10:00 IST\n\n# Notes\nTRACKS-ALLOWED: nothing\n")
    hh = header("HUB", co)
    checks.append(("header() reads BASE-READY and TRACKS-ALLOWED past 40 SLOTS lines, and stops at '# '",
                   hh.get("BASE-READY", "").startswith("2026-11-07 09:00") and allowed_tracks(hh.get("TRACKS-ALLOWED")) == {"CORE", "SCREENS"}
                   and hh.get("UPDATED", "").startswith("2026-11-07 10:00")))
    st_file("HUB", "BASE-READY   # S-01 done", "2026-11-07 09:00")
    hubwin = [{"sid": "26196777-1", "kind": "interactive", "status": "busy", "name": "1 Addic - hub - Fable Max builder"}]
    r, n = decide("HUB", header("HUB", co), {}, hubwin, {}, now)
    checks.append(("an unnamed interactive window is not the HUB's chat (roles or the transcript head decide)", bool(r) and r.startswith("NO CHAT")))
    r, n = decide("HUB", header("HUB", co), {"26196777": sess("HUB", t(6, 25), t(14, 50))}, hubwin, {}, now)
    checks.append(("the HUB with its live window (known by token_roles.json) -> nothing", r is None and "live 1" in n))
    checks.append(("HUB launches on Fable at high effort, CORE and SCREENS on Opus behind the gate",
                   TRACK["HUB"]["model"] == "claude-fable-5-1" and TRACK["HUB"]["extra"] == ("--effort", "high") and TRACK["HUB"]["gate"] is None
                   and all(TRACK[tr]["model"] == "claude-opus-5-5" and TRACK[tr]["gate"] == ("HUB", "BASE-READY", "TRACKS-ALLOWED") for tr in BUILD_TRACKS)))
    checks.append(("no track is paused by default", paused_tracks_of({}) == set()))
    checks.append(("the regexes know the three tracks",
                   KICKOFF.search("ultracode. You are the SCREENS chat of the build").group(1) == "SCREENS"
                   and KICKOFF.search("You are the HUB chat").group(1) == "HUB"
                   and NAME_TRACK.search("CORE 09:15").group(1) == "CORE"
                   and not NAME_TRACK.search("1 Addic - hub - Fable Max builder") and not NAME_TRACK.search("PH-A pharma 07 Nov 01:17")))
    agents = json.dumps([
        {"cwd": "C:\\Users\\ruchi\\kriya", "kind": "background", "sessionId": "9f35dce4-x", "name": "HUB G5 22 Oct 14:33", "state": "working"},
        {"cwd": "c:/users/ruchi/1-addic/", "kind": "background", "sessionId": "12345678-x", "name": "CORE 09:15", "status": "busy"},
        {"cwd": "C:\\Users\\ruchi\\1-addic", "kind": "interactive", "sessionId": "26196777-x", "name": "1 Addic - hub", "status": "idle"},
        {"cwd": "C:\\Users\\ruchi\\1-addic-other", "kind": "background", "sessionId": "87654321-x", "name": "SCREENS 09:00"}])
    rows = parse_agents("note\n" + agents, repo="C:\\Users\\ruchi\\1-addic")
    checks.append(("live sessions: only cwd C:\\Users\\ruchi\\1-addic (any case, either slash); Kriya's HUB is not ours",
                   rows is not None and [r_["sid"][:8] for r_ in rows] == ["12345678", "26196777"]))
    checks.append(("live sessions: unreadable output -> None (nothing launched)", parse_agents("error: not logged in") is None))
    kf = tmp / "KICKOFF-PROMPTS.md"
    io.open(kf, "w", encoding="utf-8").write("".join(
        "# Prompt %d · %s\n\ntext\n\n```\nultracode. You are the %s chat of the 1-addic offline build.\n%s\n```\n\n" % (i, tr, tr, "x " * 600)
        for i, tr in enumerate(TRACKS)))
    try:
        ps = {tr: kickoff_prompt(tr, kf) for tr in TRACKS}
        ok = all(p.lower().startswith("ultracode") and p.endswith("\n\n" + RESUME) and ("You are the %s chat" % tr) in p
                 and "```" not in p for tr, p in ps.items())
    except Exception:
        ok = False
    checks.append(("kickoff prompts extract under '# Prompt <n> · <TRACK>' (the block whole, the resume line last)", ok))
    io.open(kf, "w", encoding="utf-8").write("# Prompt 0 · HUB\n\n```\nYou are the HUB chat (no ultracode word).\n```\n\n"
                                             "# Prompt 1 · CORE\n\n```\nultracode. You are the SCREENS chat.\n```\n")
    try:
        ok = kickoff_prompt("HUB", kf).startswith("You are the HUB chat")
    except Exception:
        ok = False
    try:
        kickoff_prompt("CORE", kf)
        ok = False
    except ValueError as e:
        ok = ok and "does not contain 'You are the CORE chat'" in str(e)
    checks.append(("a block without 'ultracode' extracts; a block naming another track is refused", ok))
    if KICKOFF_FILE.exists():
        try:
            ps = {tr: kickoff_prompt(tr) for tr in TRACKS}
            ok = all(p.endswith("\n\n" + RESUME) and ("You are the %s chat" % tr) in p and 300 < len(p) < 30000 for tr, p in ps.items())
            print("info the real KICKOFF-PROMPTS.md: %s" % "; ".join(
                "%s %d chars%s" % (tr, len(p), "" if p.lower().startswith("ultracode") else " (does not start with 'ultracode')")
                for tr, p in ps.items()))
        except Exception as e:
            print("info the real KICKOFF-PROMPTS.md: %s %s" % (e.__class__.__name__, e))
            ok = False
        checks.append(("the real KICKOFF-PROMPTS.md: the three blocks extract, each with its 'You are the <TRACK> chat'", ok))
    else:
        print("info the real KICKOFF-PROMPTS.md is not written yet (this check runs once it exists)")
    rp = tmp / "token_roles.json"
    io.open(rp, "w", encoding="utf-8", newline="\n").write(
        '{\n "_readme": "x",\n "26196777": {"role": "HUB", "label": "offline-v1 HUB (interactive, 07 Nov 06:25)"}\n}\n')
    roles_add("22222222", "CORE", "07 Nov 15:00", rp)
    txt = io.open(rp, encoding="utf-8").read()
    checks.append(("roles file: a new one-line entry, session 1, '(launcher)'",
                   '"22222222": {"role": "CORE", "label": "offline-v1 CORE session 1, 07 Nov 15:00- (launcher)"}' in txt and txt.count("\n") == 5
                   and '"_readme": "x"' in txt))
    checks.append(("roles file: an existing id is left alone", roles_add("22222222", "CORE", "x", rp) is False))
    roles_add("33333333", "HUB", "07 Nov 16:00", rp)
    checks.append(("roles file: a launched HUB after the interactive one is session 2",
                   '"33333333": {"role": "HUB", "label": "offline-v1 HUB session 2, 07 Nov 16:00- (launcher)"}' in io.open(rp, encoding="utf-8").read()))
    st = {"launches": {"CORE": [{"when": t(14, 0).isoformat(), "sid": "ffffffff-1", "prev": None}]}}
    care("CORE", st, {"ffffffff": sess("CORE", t(14, 0), None, steps=False)}, [], now, dry=True)
    L = st["launches"]["CORE"][-1]
    checks.append(("care: a stepless launch after 60 min is marked removed and noted", L.get("removed") and L.get("noted")))
    st = {"launches": {"CORE": [{"when": t(14, 50).isoformat(), "sid": "gggggggg-1", "prev": "hhhhhhhh-1"}]}}
    care("CORE", st, {"gggggggg": sess("CORE", t(14, 50), t(14, 58))}, [], now, dry=True)
    checks.append(("care: a stepped launch is marked stepped", st["launches"]["CORE"][-1].get("stepped") is True))
    keep = QUIET_MIN
    QUIET_MIN = 0
    st_file("SCREENS", "BUILDING   # lanes running", "2026-11-07 09:00")
    r, n = decide("SCREENS", header("SCREENS", co), {"kkkkkkkk": sess("SCREENS", t(9, 0), t(14, 55))}, [], {}, now, gates=both)
    QUIET_MIN = keep
    checks.append(("--launch-missing: with the quiet rule off, a track with no live chat and a step 5 min ago launches", bool(r) and r.startswith("NO CHAT")))
    checks.append(("slots by rule: 6.2 GB -> 3, 4.69 -> 0, 4.71 -> 1, 3.0 -> 0", [slots_by_rule(x) for x in (6.2, 4.69, 4.71, 3.0)] == [3, 0, 1, 0]))
    free, total = memory_gb()
    me = os.path.basename(sys.executable).lower()
    pc = process_counts(("claude.exe", "node.exe", me))
    checks.append(("memory read without a subprocess: 0 < free < total", free is not None and 0 < free < total))
    checks.append(("process counts read without a subprocess (this %s counted)" % me,
                   isinstance(pc.get("claude.exe"), int) and isinstance(pc.get("node.exe"), int) and pc[me] >= 1))
    row = mem_row(6.25, 15.8, {"claude.exe": 9, "node.exe": 14}, stamp="2026-11-07 09:10 IST")
    checks.append(("the memory row's shape", row == "| 2026-11-07 09:10 IST | 6.2 | 15.8 | 9 | 14 | 3 |"))
    append_mem_row(row, co)
    append_mem_row(row, co)
    lw = io.open(co / "lane-widening.md", encoding="utf-8").read()
    checks.append(("lane-widening.md: the header once, then the rows", lw.count("| Time (IST) |") == 1 and lw.count(row) == 2))
    # One whole check, dry, on the temp folder: the HUB live by its window, CORE gated open, SCREENS not yet.
    CO, KICKOFF_FILE, saved = co, kf, (CO, KICKOFF_FILE)
    io.open(co / "status-HUB.md", "w", encoding="utf-8").write(
        "TRACK: HUB\nSTATE: BASE-READY   # S-01 done\nBASE: abc1234\nBASE-READY: 2026-11-07 09:00 abc1234\nTRACKS-ALLOWED: CORE\nUPDATED: 2026-11-07 09:00 IST\n")
    st_file("CORE", "NEW   # opened by the HUB", "2026-11-07 07:00")
    st_file("SCREENS", "NEW   # opened by the HUB", "2026-11-07 07:00")
    found = {"26196777": sess("HUB", now - datetime.timedelta(hours=3), now - datetime.timedelta(minutes=2))}
    once(dry=True, live=hubwin, found=found, mem=(8.0, 16.0))
    d = load_state().get("last_decisions") or {}
    checks.append(("a dry check: HUB nothing, CORE launches (NO CHAT), SCREENS waits for TRACKS-ALLOWED",
                   d.get("HUB", {}).get("reason") is None and (d.get("CORE", {}).get("reason") or "").startswith("NO CHAT")
                   and d.get("SCREENS", {}).get("reason") is None and "to name SCREENS" in d.get("SCREENS", {}).get("note", "")))
    logtxt = io.open(home() / "launcher.log", encoding="utf-8").read()
    checks.append(("the dry check logs 'DRY RUN CORE: would launch' with Opus, and launches nothing",
                   "DRY RUN CORE: would launch 'CORE " in logtxt and "claude-opus-5-5" in logtxt and "LAUNCHED" not in logtxt
                   and not load_state().get("launches")))
    once(dry=True, live=hubwin, found=found, mem=(3.5, 16.0))
    d = load_state().get("last_decisions") or {}
    checks.append(("under 4.0 GB free nothing launches, and it is logged", d.get("CORE", {}).get("reason") is None
                   and (d.get("CORE", {}).get("held") or "").startswith("NO CHAT")
                   and "free memory is 3.5 GB, under 4.0 GB: not launched" in io.open(home() / "launcher.log", encoding="utf-8").read()))
    CO, KICKOFF_FILE = saved
    checks.append(("pid_alive: this process yes, pid 4000000 no", pid_alive(os.getpid()) and not pid_alive(4000000)))
    checks.append(("the state lives under ADDIC_HUB_HOME (the real %LOCALAPPDATA%\\1-addic-hub untouched by the test)",
                   str(home()).startswith(str(tmp))))
    ok = sum(1 for _, r in checks if r)
    for name, r in checks:
        print("%s %s" % ("ok  " if r else "FAIL", name))
    print("%d/%d checks pass" % (ok, len(checks)))
    return 0 if ok == len(checks) else 1


def main(argv=None):
    global CO, KICKOFF_FILE
    ap = argparse.ArgumentParser(prog="fresh_chat_launcher.py", description=__doc__.split("\n")[0])
    ap.add_argument("--once", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--loop", action="store_true")
    ap.add_argument("--start", action="store_true")
    ap.add_argument("--stop", action="store_true")
    ap.add_argument("--status", action="store_true")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--pause", metavar="REASON")
    ap.add_argument("--resume", action="store_true")
    ap.add_argument("--restart", action="store_true", help="stop the loop and start it again (loads an edited script); with --resume lifts the pause in between")
    ap.add_argument("--launch-missing", action="store_true", help="launch every track without a live chat now (the quiet rule off once); after a machine restart")
    ap.add_argument("--pause-track", metavar="TRACK", help="pause one track (no launches for it; the others unaffected)")
    ap.add_argument("--resume-track", metavar="TRACK", help="lift one track's pause")
    ap.add_argument("--mem", action="store_true", help="sample the memory once and print the lane-widening row (writes nothing)")
    ap.add_argument("--test-launch", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    ap.add_argument("--coord", metavar="DIR", help="another coordination folder (status-*.md, lane-widening.md); tests")
    ap.add_argument("--kickoff", metavar="FILE", help="another KICKOFF-PROMPTS.md; tests")
    a = ap.parse_args(argv)
    try:
        if sys.stdout:
            sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
    except Exception:
        pass
    if a.coord:
        CO = Path(a.coord)
    if a.kickoff:
        KICKOFF_FILE = Path(a.kickoff)
    if a.self_test:
        return self_test()
    if a.mem:
        print(mem_row())
        return 0
    if a.loop:
        return loop()
    if a.restart:
        return restart_loop(resume=a.resume)
    if a.launch_missing:
        return launch_missing()
    if a.start:
        return start_detached()
    if a.stop:
        return stop_loop()
    if a.pause_track or a.resume_track:
        st = load_state()
        tracks = paused_tracks_of(st)
        if a.pause_track:
            if a.pause_track.upper() not in TRACKS:
                print("unknown track %s (one of %s)" % (a.pause_track, ", ".join(TRACKS)))
                return 2
            tracks.add(a.pause_track.upper())
            log("PAUSED TRACK %s" % a.pause_track.upper())
        if a.resume_track:
            tracks.discard(a.resume_track.upper())
            log("RESUMED TRACK %s" % a.resume_track.upper())
        st["paused_tracks"] = sorted(tracks)
        save_state(st)
        print("paused tracks: %s" % (", ".join(sorted(tracks)) or "none"))
        return 0
    if a.pause is not None:
        st = load_state()
        st["paused"] = {"since": now_ist().isoformat(), "reason": a.pause}
        save_state(st)
        log("PAUSED: %s" % a.pause)
        return 0
    if a.resume:
        st = load_state()
        st["paused"] = None
        save_state(st)
        log("RESUMED")
        return 0
    if a.test_launch:
        return test_launch()
    if a.status:
        status(a.json)
        return 0
    if a.once or a.dry_run:
        return once(dry=a.dry_run)
    ap.print_help()
    return 0


if __name__ == "__main__":
    sys.exit(main())
