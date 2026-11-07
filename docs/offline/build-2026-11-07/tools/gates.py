#!/usr/bin/env python3
"""1-addic offline build (7 November 2026): run the gates of BUILD-PLAN.md section 7 in one worktree and READ each verdict.

  python gates.py --wt <path> --lane <lane> [--files a,b] [--full] [--grep PATTERN] [--timeout SEC]
                  [--lock-wait SEC] [--no-lock] [--territory PATH] <gate>...
  python gates.py --wt C:/Users/ruchi/1-addic-wt/_int --lane engine build test validate guards
  python gates.py --self-test

gates (run in the order given):
  build     node offline/build.mjs; GREEN when it exits 0 and (re)writes offline/1-addic.html holding
            http-equiv="Content-Security-Policy"; the size is printed
  test      node --test --test-reporter=tap <files>: the lane's test files of coordination/territory.json that exist
            (*.test.mjs only, browser.test.mjs never), --full every offline/tests/*.test.mjs but browser.test.mjs,
            --files a,b exactly those; failing tests (`not ok`, or the spec reporter's marker) print as FAIL <name>
  validate  node -e: require offline/src/content-core.js, every other content-*.js and engine.js, print
            Engine.validateContent()'s errors as FAIL validate: <error>; SKIP while engine.js (or validateContent) is absent
  browser   npm run test:browser [-- --grep PATTERN] when package.json has that script (the heavy gate)
  guards    node offline/tests/guards.mjs when it exists, else the built-in check: CSP meta in the built file;
            http(s) URLs only in content files and content-core.js's resources/references blocks (the w3.org
            namespace URIs excepted); innerHTML assigned only plain string literals; the light :root and the dark
            theme blocks of styles.css define the same --variables; every tutorial target of the content files
            exists as data-tour="<name>" (or data-tour: '<name>') in offline/src/ui-*.js or shell.html.
            Prints FAIL guard: <check> <subject>: <detail>
  docs      python offline/docs/build_guide.py
A missing prerequisite is SKIP with the reason named (the base has no app code yet: every gate there is SKIP).

Verdict precedence per gate (from gate_run.py): could not launch or timed out -> VOID; exit != 0 or a named failure ->
RED; no summary line (test, browser, validate) or zero tests ran -> VOID; otherwise GREEN.
The lock: test, browser and docs run under <root>/_locks/1-addic.lock, taken in arrival order: each waiter writes a
ticket <root>/_locks/1-addic.queue/<time_ns>-<pid>; the lowest live ticket proceeds and writes 1-addic.lock (pid, lane,
gate); tickets of dead pids (or of a pid reused since) are ignored; after --lock-wait seconds (default 540) the gate is
VOID "lock timeout"; the ticket is always removed. <root> is env ADDIC_WT or C:/Users/ruchi/1-addic-wt.
Logs: <root>/_logs/gates/<lane>/<gate>-<YYYYmmdd-HHMMSS>.log, and gates-summary.log next to them.
Output: one line per gate `GATE <name> <GREEN|RED|SKIP|VOID> pass=<n> fail=<n> skip=<n> <detail> log=<path>`, the
FAIL lines, and a last line of JSON {"gates": {name: {verdict, counts, log, fails, detail}}, "verdict"}.
Exit 0 when no gate is RED or VOID, 1 when one is RED (and none VOID), 2 when one is VOID (or bad arguments).
Never shell=True.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
TERRITORY = HERE.parent / "coordination" / "territory.json"
GATES = ("build", "test", "validate", "browser", "guards", "docs")
LOCKED = {"test", "browser", "docs"}
GREEN, RED, SKIP, VOID = "GREEN", "RED", "SKIP", "VOID"
CSP_RE = re.compile(r"""http-equiv\s*=\s*["']Content-Security-Policy["']""", re.I)
ANSI_RE = re.compile(r"\x1b\[[0-9;?]*[A-Za-z]")
URL_RE = re.compile(r"https?://[^\s'\"`)<>]+", re.I)
URL_EXEMPT = re.compile(r"^https?://www\.w3\.org/(2000/svg|1999/xlink|1999/xhtml|XML/1998/namespace|2000/xmlns/?)", re.I)
LANE_RE = re.compile(r"^[a-z0-9_][a-z0-9_-]*$")


def root_dir():
    return Path(os.environ.get("ADDIC_WT", r"C:\Users\ruchi\1-addic-wt"))


# ------------------------------------------------------------------------------------------------------- lock
def pid_alive(pid, since_ns):
    """True when pid runs and was started before its ticket (a reused pid is not the waiter)."""
    if pid == os.getpid():
        return True
    if os.name != "nt":
        try:
            os.kill(pid, 0)
        except ProcessLookupError:
            return False
        except PermissionError:
            return True
        return True
    import ctypes
    from ctypes import wintypes
    k32 = ctypes.WinDLL("kernel32", use_last_error=True)
    k32.OpenProcess.restype = wintypes.HANDLE
    h = k32.OpenProcess(0x1000, False, pid)  # PROCESS_QUERY_LIMITED_INFORMATION
    if not h:
        return ctypes.get_last_error() == 5  # access denied: it exists
    try:
        code = wintypes.DWORD()
        if k32.GetExitCodeProcess(h, ctypes.byref(code)) and code.value != 259:  # STILL_ACTIVE
            return False
        c, e, kk, u = (wintypes.FILETIME() for _ in range(4))
        if k32.GetProcessTimes(h, ctypes.byref(c), ctypes.byref(e), ctypes.byref(kk), ctypes.byref(u)):
            created_ns = (((c.dwHighDateTime << 32) | c.dwLowDateTime) - 116444736000000000) * 100
            if created_ns > since_ns + 2_000_000_000:
                return False
        return True
    finally:
        k32.CloseHandle(h)


class Lock:
    TICKET = re.compile(r"^(\d{20})-(\d+)$")

    def __init__(self, root, wait):
        self.dir = root / "_locks"
        self.queue = self.dir / "1-addic.queue"
        self.holder = self.dir / "1-addic.lock"
        self.wait = wait
        self.ticket = None

    def acquire(self, label):
        self.queue.mkdir(parents=True, exist_ok=True)
        self.ticket = self.queue / f"{time.time_ns():020d}-{os.getpid()}"
        self.ticket.write_text(label + "\n", encoding="utf-8")
        deadline = time.monotonic() + self.wait
        told = False
        while True:
            live = []
            for t in sorted(self.queue.iterdir(), key=lambda x: x.name):
                m = self.TICKET.match(t.name)
                if not m:
                    continue
                if t == self.ticket or pid_alive(int(m.group(2)), int(m.group(1))):
                    live.append(t)
                else:
                    try:
                        t.unlink()
                    except OSError:
                        pass
            if live and live[0] == self.ticket:
                self.holder.write_text(f"{os.getpid()} {label} {time.strftime('%Y-%m-%d %H:%M:%S')}\n", encoding="utf-8")
                return True
            if time.monotonic() >= deadline:
                self.release()
                return False
            if not told:
                ahead = live[: live.index(self.ticket)] if self.ticket in live else live
                print(f"[lock] waiting for {self.holder} ({len(ahead)} ahead: {', '.join(a.name for a in ahead[:3])})", flush=True)
                told = True
            time.sleep(0.5)

    def release(self):
        try:
            if self.holder.exists() and self.holder.read_text(encoding="utf-8").split(" ", 1)[0] == str(os.getpid()):
                self.holder.unlink()
        except OSError:
            pass
        if self.ticket:
            try:
                self.ticket.unlink()
            except OSError:
                pass
            self.ticket = None


# ------------------------------------------------------------------------------------------------- processes
def kill_tree(p):
    if os.name == "nt":
        subprocess.run(["taskkill", "/T", "/F", "/PID", str(p.pid)], capture_output=True)
    else:
        p.kill()


def run_cmd(cmd, cwd, log, timeout):
    """(rc, text, why_void). rc None = could not launch or timed out."""
    env = dict(os.environ, NO_COLOR="1", FORCE_COLOR="0", PYTHONIOENCODING="utf-8")
    start = time.strftime("%Y-%m-%d %H:%M:%S")
    with open(log, "a", encoding="utf-8", newline="\n") as f:
        f.write(f"$ {' '.join(cmd)}\n  cwd {cwd}  start {start}  timeout {timeout}s\n\n")
    try:
        p = subprocess.Popen(cmd, cwd=str(cwd), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env=env)
    except OSError as e:
        with open(log, "a", encoding="utf-8", newline="\n") as f:
            f.write(f"COULD NOT LAUNCH: {e}\n")
        return None, "", f"could not launch: {e}"
    try:
        raw, _ = p.communicate(timeout=timeout)
        why = None
    except subprocess.TimeoutExpired:
        kill_tree(p)
        raw, _ = p.communicate()
        why = f"timeout after {timeout}s"
    text = ANSI_RE.sub("", (raw or b"").decode("utf-8", "replace")).replace("\r\n", "\n")
    with open(log, "a", encoding="utf-8", newline="\n") as f:
        f.write(text + ("\n" if text and not text.endswith("\n") else "") + f"\nEXIT {p.returncode}" + (f" ({why})" if why else "") + "\n")
    return (None if why else p.returncode), text, why


# ------------------------------------------------------------------------------------------- result parsing
def tap_unescape(s):
    return s.replace("\\#", "#").replace("\\\\", "\\").strip()


def parse_results(text):
    """(fails, counts, has_summary) from node --test TAP, the node spec reporter, or Playwright's list reporter."""
    fails, spec_fails, stack, counts, summary = [], [], [], {}, False
    for line in text.splitlines():
        m = re.match(r"^(\s*)# Subtest: (.*)$", line)
        if m:
            ind = len(m.group(1))
            while stack and stack[-1][0] >= ind:
                stack.pop()
            stack.append((ind, tap_unescape(m.group(2))))
            continue
        m = re.match(r"^(\s*)(not ok|ok) \d+(?: - (.*?))?(?:\s+#\s*(SKIP|TODO)\b.*)?$", line, re.I)
        if m:
            ind = len(m.group(1))
            name = tap_unescape(m.group(3) or "")
            parents = [n for i, n in stack if i < ind]
            while stack and stack[-1][0] >= ind:
                stack.pop()
            if m.group(2).lower() == "not ok" and (m.group(4) or "").upper() != "TODO":
                fails.append(" > ".join(parents + [name]))
            continue
        m = re.match(r"^# (tests|pass|fail|cancelled|skipped|todo) (\d+)\s*$", line)
        if m:
            counts[m.group(1)] = int(m.group(2))
            summary = True
            continue
        m = re.match(r"^\u2139 (tests|pass|fail|cancelled|skipped|todo) (\d+)\s*$", line)  # spec reporter
        if m:
            counts[m.group(1)] = int(m.group(2))
            summary = True
            continue
        m = re.match(r"^\s*[\u2716\u2718]\s+(?:\d+\s+)?(.*?)(?:\s+\([\d.]+\s*m?s\))?\s*$", line)
        if m and m.group(1) and not m.group(1).lower().startswith("failing tests"):
            spec_fails.append(m.group(1).strip())
            continue
        m = re.match(r"^\s+(\d+) (passed|failed|skipped|flaky)\b", line)  # Playwright summary
        if m:
            key = {"passed": "pass", "failed": "fail", "skipped": "skipped", "flaky": "pass"}[m.group(2)]
            counts[key] = counts.get(key, 0) + int(m.group(1))
            counts["tests"] = counts.get("tests", 0) + int(m.group(1))
            summary = True
    names = fails or spec_fails
    uniq = []
    for n in names:
        if n not in uniq:
            uniq.append(n)
    leaves = [n for n in uniq if not any(o != n and o.startswith(n + " > ") for o in uniq)]
    c = {"pass": counts.get("pass", 0), "fail": counts.get("fail", 0) + counts.get("cancelled", 0),
         "skip": counts.get("skipped", 0) + counts.get("todo", 0), "tests": counts.get("tests")}
    return leaves, c, summary


# ------------------------------------------------------------------------------------------------- the gates
class Ctx:
    def __init__(self, wt, lane, args, root):
        self.wt, self.lane, self.args, self.root = wt, lane, args, root
        self.logdir = root / "_logs" / "gates" / lane
        self.logdir.mkdir(parents=True, exist_ok=True)

    def log_path(self, gate):
        p = self.logdir / f"{gate}-{time.strftime('%Y%m%d-%H%M%S')}.log"
        if p.exists():
            p = self.logdir / f"{gate}-{time.strftime('%Y%m%d-%H%M%S')}-{os.getpid()}.log"
        return p


def result(verdict, detail="", fails=(), counts=None):
    c = {"pass": 0, "fail": 0, "skip": 0}
    if counts:
        c.update({k: v for k, v in counts.items() if k in c and v is not None})
    return {"verdict": verdict, "detail": detail, "fails": list(fails), "counts": c}


def judge(rc, why_void, fails, counts, summary, gate, need_summary=True):
    if rc is None:
        return result(VOID, why_void, fails, counts)
    if rc != 0 or fails:
        if not fails:
            fails = [f"{gate}: exit {rc} (no failure named; see the log)"]
        return result(RED, f"exit {rc}", fails, counts)
    if need_summary and not summary:
        return result(VOID, "no summary line: the run may have died", fails, counts)
    if need_summary and counts.get("tests") == 0:
        return result(VOID, "zero tests ran", fails, counts)
    return result(GREEN, f"exit {rc}", fails, counts)


def gate_build(ctx, log):
    if not (ctx.wt / "offline" / "build.mjs").exists():
        return result(SKIP, "offline/build.mjs absent")
    node = shutil.which("node")
    if not node:
        return result(VOID, "node is not on PATH")
    out = ctx.wt / "offline" / "1-addic.html"
    t0 = time.time()
    rc, text, why = run_cmd([node, "offline/build.mjs"], ctx.wt, log, ctx.args.timeout)
    if rc is None:
        return result(VOID, why)
    fails = []
    size = out.stat().st_size if out.exists() else None
    if rc != 0:
        fails.append(f"build: exit {rc}")
    elif not out.exists():
        fails.append("build: offline/1-addic.html was not written")
    elif out.stat().st_mtime < t0 - 2:
        fails.append("build: offline/1-addic.html was not rewritten by this build")
    elif not CSP_RE.search(out.read_text(encoding="utf-8", errors="replace")):
        fails.append('build: no http-equiv="Content-Security-Policy" meta in offline/1-addic.html')
    detail = f"size={size}B" if size is not None else "no output file"
    return result(RED if fails else GREEN, detail, fails, {"pass": 0 if fails else 1, "fail": 1 if fails else 0})


def lane_test_files(ctx):
    sys.path.insert(0, str(HERE))
    from check_territory import matches  # noqa: E402  (the same glob rules as the territory check)
    tests_dir = ctx.wt / "offline" / "tests"
    every = sorted(p.relative_to(ctx.wt).as_posix() for p in tests_dir.rglob("*") if p.is_file()) if tests_dir.exists() else []
    if ctx.args.files:
        return [f.strip().replace("\\", "/") for f in ctx.args.files.split(",") if f.strip()], "--files"
    if ctx.args.full:
        return [f for f in every if re.match(r"^offline/tests/[^/]+\.test\.mjs$", f) and not f.endswith("/browser.test.mjs")], "--full"
    try:
        tmap = json.loads(Path(ctx.args.territory).read_text(encoding="utf-8"))
    except (OSError, ValueError) as e:
        return [], f"territory map unreadable ({e})"
    spec = tmap.get("lanes", {}).get(ctx.lane)
    if not spec:
        return [], f"lane {ctx.lane} is not in the territory map"
    pats = spec.get("tests", [])
    picked = [f for f in every if any(matches(p, f) for p in pats)]
    return [f for f in picked if f.endswith(".test.mjs") and not f.endswith("/browser.test.mjs")], f"lane {ctx.lane}'s tests"


def gate_test(ctx, log):
    files, why = lane_test_files(ctx)
    files_present = [f for f in files if (ctx.wt / f).exists()]
    missing = [f for f in files if f not in files_present]
    if ctx.args.files and missing:
        return result(VOID, f"--files names missing files: {', '.join(missing)}")
    if not files_present:
        return result(SKIP, f"no node test files ({why})")
    node = shutil.which("node")
    if not node:
        return result(VOID, "node is not on PATH")
    rc, text, why_void = ctx.locked("test", lambda: run_cmd([node, "--test", "--test-reporter=tap"] + files_present, ctx.wt, log, ctx.args.timeout))
    fails, counts, summary = parse_results(text)
    r = judge(rc, why_void, fails, counts, summary, "test")
    r["detail"] = f"{len(files_present)} file(s); " + r["detail"]
    return r


VALIDATE_JS = r"""
const fs = require('fs'), path = require('path');
const src = path.resolve('offline/src');
let bad = false;
const one = (s) => String(s).replace(/\s+/g, ' ').trim();
const load = (f) => { try { return require(path.join(src, f)); } catch (e) { console.log('FAIL validate: load ' + f + ': ' + one((e && e.message) || e).slice(0, 300)); bad = true; return undefined; } };
load('content-core.js');
for (const f of fs.readdirSync(src).filter((f) => /^content-.*\.js$/.test(f) && f !== 'content-core.js').sort()) load(f);
const m = load('engine.js');
if (bad) { console.log('VALIDATE errors=load'); process.exit(1); }
const has = (o) => o && typeof o.validateContent === 'function';
const E = has(m) ? m : (m && has(m.Engine)) ? m.Engine : has(globalThis.Engine) ? globalThis.Engine : null;
if (!E) { console.log('VALIDATE skip=no-validateContent'); process.exit(0); }
let r;
try { r = E.validateContent(); } catch (e) { console.log('FAIL validate: validateContent threw: ' + one((e && e.message) || e).slice(0, 300)); console.log('VALIDATE errors=throw'); process.exit(1); }
const errs = Array.isArray(r) ? r : (r && Array.isArray(r.errors)) ? r.errors : [];
for (const e of errs) console.log('FAIL validate: ' + one(typeof e === 'string' ? e : JSON.stringify(e)));
console.log('VALIDATE errors=' + errs.length);
process.exit(errs.length ? 1 : 0);
"""


def gate_validate(ctx, log):
    src = ctx.wt / "offline" / "src"
    if not (src / "engine.js").exists():
        return result(SKIP, "offline/src/engine.js absent")
    if not (src / "content-core.js").exists():
        return result(SKIP, "offline/src/content-core.js absent")
    node = shutil.which("node")
    if not node:
        return result(VOID, "node is not on PATH")
    rc, text, why = run_cmd([node, "-e", VALIDATE_JS], ctx.wt, log, ctx.args.timeout)
    if rc is None:
        return result(VOID, why)
    if "VALIDATE skip=no-validateContent" in text:
        return result(SKIP, "engine.js has no validateContent yet (U-08)")
    fails = [l[len("FAIL "):].strip() for l in text.splitlines() if l.startswith("FAIL validate: ")]
    summary = bool(re.search(r"^VALIDATE errors=", text, re.M))
    r = judge(rc, why, fails, {"fail": len(fails)}, summary, "validate", need_summary=False)
    if r["verdict"] == GREEN and not summary:
        r = result(VOID, "no VALIDATE summary line: the run may have died")
    if r["verdict"] == GREEN:
        r["counts"]["pass"] = 1
    return r


def gate_browser(ctx, log):
    pkg = ctx.wt / "package.json"
    try:
        scripts = json.loads(pkg.read_text(encoding="utf-8")).get("scripts", {}) if pkg.exists() else {}
    except ValueError:
        return result(RED, "package.json is not valid JSON", ["browser: package.json is not valid JSON"])
    if "test:browser" not in scripts:
        return result(SKIP, "package.json has no test:browser script" if pkg.exists() else "package.json absent")
    npm = shutil.which("npm")
    if not npm:
        return result(VOID, "npm is not on PATH")
    cmd = [npm, "run", "test:browser"] + (["--", "--grep", ctx.args.grep] if ctx.args.grep else [])
    rc, text, why = ctx.locked("browser", lambda: run_cmd(cmd, ctx.wt, log, ctx.args.timeout))
    fails, counts, summary = parse_results(text)
    return judge(rc, why, fails, counts, summary, "browser")


def gate_docs(ctx, log):
    if not (ctx.wt / "offline" / "docs" / "build_guide.py").exists():
        return result(SKIP, "offline/docs/build_guide.py absent")
    rc, text, why = ctx.locked("docs", lambda: run_cmd([sys.executable, "offline/docs/build_guide.py"], ctx.wt, log, ctx.args.timeout))
    r = judge(rc, why, [], {}, True, "docs", need_summary=False)
    if r["verdict"] == RED:
        r["fails"] = [f"docs: exit {rc}"]
    return r


# ----------------------------------------------------------------------------------------- the built-in guards
def literal_end(s, i):
    """End index after a JS string literal starting at s[i] (a quote), or -1; a template with ${ is not plain."""
    q = s[i]
    j = i + 1
    while j < len(s):
        c = s[j]
        if c == "\\":
            j += 2
            continue
        if q == "`" and c == "$" and s.startswith("${", j):
            return -1
        if c == q:
            return j + 1
        if c == "\n" and q != "`":
            return -1
        j += 1
    return -1


def balanced_end(s, i):
    """Index after the bracket closing s[i] ([ { or (), skipping strings and comments; -1 when unbalanced."""
    pairs = {"[": "]", "{": "}", "(": ")"}
    depth, j = [], i
    while j < len(s):
        c = s[j]
        if c in "'\"`":
            e = literal_end(s, j)
            if e < 0 and c == "`":  # a template with ${: skip to the closing backtick crudely
                e = s.find("`", j + 1) + 1 or len(s)
            j = e if e > 0 else j + 1
            continue
        if s.startswith("//", j):
            j = s.find("\n", j) if s.find("\n", j) >= 0 else len(s)
            continue
        if s.startswith("/*", j):
            k = s.find("*/", j + 2)
            j = k + 2 if k >= 0 else len(s)
            continue
        if c in pairs:
            depth.append(pairs[c])
        elif depth and c == depth[-1]:
            depth.pop()
            if not depth:
                return j + 1
        j += 1
    return -1


def key_spans(text, keys):
    """[(start, end)] of the values of `key: [...]`/`key: {...}` and `.key.push(...)` for the keys given."""
    spans = []
    for m in re.finditer(r"\b(%s)\s*[:=]\s*([\[{])|\.(%s)\.push\s*(\()" % ("|".join(keys), "|".join(keys)), text):
        start = m.start(2) if m.group(2) else m.start(4)
        end = balanced_end(text, start)
        if end > 0:
            spans.append((start, end))
    return spans


def line_of(text, pos):
    return text.count("\n", 0, pos) + 1


def css_rules(css):
    """[(selector, body, at_rules)] of a stylesheet, comments removed; nested @-blocks are walked."""
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    out = []

    def walk(s, at):
        i, n = 0, len(s)
        while i < n:
            ob = s.find("{", i)
            if ob < 0:
                return
            prelude = s[i:ob].strip()
            prelude = prelude[prelude.rfind(";") + 1:].strip() if prelude.startswith("@") and ";" in prelude else prelude
            depth, j = 1, ob + 1
            while j < n and depth:
                depth += {"{": 1, "}": -1}.get(s[j], 0)
                j += 1
            body = s[ob + 1:j - 1]
            if prelude.startswith("@"):
                walk(body, at + [prelude])
            else:
                out.append((prelude, body, at))
            i = j
    walk(css, [])
    return out


def theme_parity(css):
    """(light_vars, dark_vars) or None when the stylesheet has no light :root or no dark block."""
    light, dark, has_light, has_dark = set(), set(), False, False
    light_sel = {":root", "html", ':root[data-theme="light"]', "[data-theme=\"light\"]", ":root:not([data-theme=\"dark\"])",
                 ":root[data-theme='light']", "[data-theme='light']"}
    for sel, body, at in css_rules(css):
        names = set(re.findall(r"(?:^|[;{\s])(--[A-Za-z0-9_-]+)\s*:", body))
        items = [x.strip() for x in sel.split(",")]
        in_dark_media = any("prefers-color-scheme" in a and "dark" in a for a in at)
        if any("dark" in x for x in items) or (in_dark_media and any(x.startswith((":root", "html", "[data-theme")) for x in items)):
            dark |= names
            has_dark = True
        elif not at and any(x in light_sel for x in items):
            light |= names
            has_light = True
    if not (has_light and has_dark):
        return None
    return light, dark


def builtin_guards(ctx, log):
    wt = ctx.wt
    src = wt / "offline" / "src"
    if not src.exists():
        return result(SKIP, "offline/src absent")
    files = sorted(p for p in src.rglob("*") if p.is_file() and p.suffix in (".js", ".mjs", ".html", ".css"))
    content = [p for p in files if re.match(r"^content-.*\.js$", p.name)]
    code = [p for p in files if p not in content]
    if not code and not (wt / "offline" / "build.mjs").exists():
        return result(SKIP, "no app code yet (offline/src holds content files only)")
    rel = lambda p: p.relative_to(wt).as_posix()  # noqa: E731
    read = lambda p: p.read_text(encoding="utf-8", errors="replace")  # noqa: E731
    fails, notes, passed, skipped = [], [], 0, 0
    lines = []

    def finding(name, detail):
        fails.append(name)
        lines.append(f"FAIL {name}: {detail}")

    # 1 CSP in the built file
    built = wt / "offline" / "1-addic.html"
    if built.exists():
        if CSP_RE.search(read(built)):
            passed += 1
        else:
            finding("guard: csp", 'offline/1-addic.html has no http-equiv="Content-Security-Policy" meta')
    elif (wt / "offline" / "build.mjs").exists():
        finding("guard: csp", "offline/1-addic.html absent: run the build gate first")
    else:
        skipped += 1
        notes.append("csp skipped (no build)")
    # 2 external URLs
    url_bad = 0
    scan = code + content + ([wt / "offline" / "build.mjs"] if (wt / "offline" / "build.mjs").exists() else [])
    for p in scan:
        if p in content and p.name != "content-core.js":
            continue
        t = read(p)
        allowed = key_spans(t, ["resources", "references"]) if p.name == "content-core.js" else []
        hits = [(line_of(t, m.start()), m.group(0)) for m in URL_RE.finditer(t)
                if not URL_EXEMPT.match(m.group(0)) and not any(a <= m.start() < b for a, b in allowed)]
        if hits:
            url_bad += 1
            finding(f"guard: external-url {rel(p)}", "; ".join(f"line {n}: {u}" for n, u in hits[:5]) + (" ..." if len(hits) > 5 else ""))
    passed += 0 if url_bad else 1
    # 3 innerHTML with data
    ih_bad = 0
    for p in [x for x in files if x.suffix in (".js", ".mjs", ".html")]:
        t = read(p)
        hits = []
        for m in re.finditer(r"\binnerHTML\s*\+?=(?!=)", t):
            j = m.end()
            while j < len(t) and t[j] in " \t\r\n":
                j += 1
            ok = False
            if j < len(t) and t[j] in "'\"`":
                e = literal_end(t, j)
                if e > 0:
                    k = e
                    while k < len(t) and t[k] in " \t":
                        k += 1
                    ok = k >= len(t) or t[k] in ";\n\r})," or t.startswith("//", k)
            if not ok:
                hits.append(line_of(t, m.start()))
        if hits:
            ih_bad += 1
            finding(f"guard: innerHTML {rel(p)}", "innerHTML assigned something other than a plain string literal at line(s) " + ", ".join(map(str, hits[:10])))
    passed += 0 if ih_bad else 1
    # 4 theme parity
    css = src / "styles.css"
    par = theme_parity(read(css)) if css.exists() else None
    if par is None:
        skipped += 1
        notes.append("theme parity skipped (" + ("no styles.css" if not css.exists() else "no light :root and dark block pair") + ")")
    else:
        light, dark = par
        if light == dark:
            passed += 1
        else:
            d = []
            if light - dark:
                d.append("only in light: " + " ".join(sorted(light - dark)))
            if dark - light:
                d.append("only in dark: " + " ".join(sorted(dark - light)))
            finding("guard: theme-parity", "; ".join(d))
    # 5 tutorial targets
    targets = {}
    for p in content:
        t = read(p)
        for a, b in key_spans(t, ["tutorials"]):
            for m in re.finditer(r"""\btarget\s*:\s*(['"])([^'"]+)\1""", t[a:b]):
                targets.setdefault(m.group(2), rel(p))
    ui = [p for p in files if re.match(r"^ui-.*\.js$", p.name) or p.name == "shell.html"]
    if not targets:
        skipped += 1
        notes.append("tutorial targets skipped (none named)")
    elif not ui:
        skipped += 1
        notes.append(f"tutorial targets skipped ({len(targets)} named, no ui-*.js or shell.html yet)")
    else:
        hay = "\n".join(read(p) for p in ui)
        missing = [n for n in targets if not re.search(r"""data-tour['"]?\s*[:=]\s*['"]%s['"]""" % re.escape(n), hay)]
        for n in missing:
            finding(f"guard: tour-target {n}", f"named in {targets[n]} tutorials; no data-tour=\"{n}\" in offline/src/ui-*.js or shell.html")
        passed += 0 if missing else 1
    with open(log, "a", encoding="utf-8", newline="\n") as f:
        f.write("built-in guards (offline/tests/guards.mjs absent)\n" + "\n".join(lines + notes) + "\n")
    r = result(RED if fails else GREEN, "built-in; " + ("; ".join(notes) if notes else "all checks ran"), fails,
               {"pass": passed, "fail": len(fails), "skip": skipped})
    r["lines"] = lines
    return r


def gate_guards(ctx, log):
    gm = ctx.wt / "offline" / "tests" / "guards.mjs"
    if not gm.exists():
        return builtin_guards(ctx, log)
    node = shutil.which("node")
    if not node:
        return result(VOID, "node is not on PATH")
    rc, text, why = run_cmd([node, "offline/tests/guards.mjs"], ctx.wt, log, ctx.args.timeout)
    fails = [l[len("FAIL "):].strip() for l in text.splitlines() if l.startswith("FAIL ")]
    r = judge(rc, why, fails, {"fail": len(fails)}, True, "guards", need_summary=False)
    r["detail"] = "offline/tests/guards.mjs; " + r["detail"]
    return r


RUNNERS = {"build": gate_build, "test": gate_test, "validate": gate_validate, "browser": gate_browser, "guards": gate_guards, "docs": gate_docs}


# ---------------------------------------------------------------------------------------------------- main
def run_gates(wt, lane, gates, args, root):
    ctx = Ctx(wt, lane, args, root)
    lock = Lock(root, args.lock_wait)

    def locked(gate, fn):
        if args.no_lock:
            return fn()
        if not lock.acquire(f"{lane} {gate} {wt}"):
            return None, "", f"lock timeout after {args.lock_wait}s ({lock.holder})"
        try:
            return fn()
        finally:
            lock.release()
    ctx.locked = locked
    summary_log = ctx.logdir / "gates-summary.log"
    report = {}
    for g in gates:
        log = ctx.log_path(g)
        with open(summary_log, "a", encoding="utf-8", newline="\n") as f:
            f.write(f"=== start {g} {time.strftime('%Y-%m-%d %H:%M:%S')} wt={wt}\n")
        try:
            r = RUNNERS[g](ctx, log)
        except Exception as e:  # noqa: BLE001  a crash of this script is not a verdict
            r = result(VOID, f"gates.py crashed in {g}: {e!r}")
        if not log.exists():
            log.write_text(f"{g}: {r['verdict']} {r['detail']}\n", encoding="utf-8", newline="\n")
        with open(log, "a", encoding="utf-8", newline="\n") as f:
            f.write(f"\nVERDICT {r['verdict']} {r['detail']}\n" + "".join(f"FAIL {x}\n" for x in r["fails"]))
        c = r["counts"]
        line = f"GATE {g} {r['verdict']} pass={c['pass']} fail={c['fail']} skip={c['skip']} {r['detail']} log={log}"
        print(line, flush=True)
        for x in r.pop("lines", None) or [f"FAIL {x}" for x in r["fails"]]:
            print(x, flush=True)
        with open(summary_log, "a", encoding="utf-8", newline="\n") as f:
            f.write(line + "\n")
        r["log"] = str(log)
        report[g] = r
    verdicts = [r["verdict"] for r in report.values()]
    overall = VOID if VOID in verdicts else RED if RED in verdicts else SKIP if verdicts and all(v == SKIP for v in verdicts) else GREEN
    with open(summary_log, "a", encoding="utf-8", newline="\n") as f:
        f.write(f"=== done {overall} {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
    print(json.dumps({"lane": lane, "wt": str(wt), "gates": report, "verdict": overall}, ensure_ascii=True), flush=True)
    return {VOID: 2, RED: 1}.get(overall, 0)


def parser():
    ap = argparse.ArgumentParser(prog="gates.py", description="Run the 1-addic gates and read their verdicts.")
    ap.add_argument("--wt", help="the worktree to run in")
    ap.add_argument("--lane", help="lane id (log folder; the default test files)")
    ap.add_argument("--files", help="test files, comma-separated (the test gate)")
    ap.add_argument("--full", action="store_true", help="every offline/tests/*.test.mjs but browser.test.mjs")
    ap.add_argument("--grep", help="passed to the browser gate as -- --grep PATTERN")
    ap.add_argument("--timeout", type=float, default=900, help="seconds per gate (default 900)")
    ap.add_argument("--lock-wait", type=float, default=540, dest="lock_wait", help="seconds to wait for the lock (default 540)")
    ap.add_argument("--no-lock", action="store_true", dest="no_lock")
    ap.add_argument("--territory", default=str(TERRITORY))
    ap.add_argument("--self-test", action="store_true", dest="self_test")
    ap.add_argument("gates", nargs="*")
    return ap


def main(argv):
    for s in (sys.stdout, sys.stderr):
        try:
            s.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):
            pass
    args = parser().parse_args(argv)
    if args.self_test:
        return self_test()
    bad = [g for g in args.gates if g not in GATES]
    if not args.wt or not args.lane or not args.gates or bad or not LANE_RE.match(args.lane):
        sys.stderr.write("gates.py: need --wt, --lane (^[a-z0-9_][a-z0-9_-]*$) and gates from " + " ".join(GATES)
                         + (f"; unknown: {' '.join(bad)}" if bad else "") + "\n")
        return 2
    wt = Path(args.wt)
    if not wt.is_dir():
        sys.stderr.write(f"gates.py: the worktree {wt} does not exist\n")
        return 2
    return run_gates(wt.resolve(), args.lane, args.gates, args, root_dir())


# ------------------------------------------------------------------------------------------------ self-test
def rmtree(path):
    def onexc(func, p, _exc):
        try:
            os.chmod(p, 0o700)
            func(p)
        except OSError:
            pass
    shutil.rmtree(path, onexc=onexc)


def self_test():
    tmp = Path(tempfile.mkdtemp(prefix="gates-selftest-", dir=tempfile.gettempdir()))
    wt, root = tmp / "wt", tmp / "root"
    results = []

    def write(rel_path, text):
        f = wt / rel_path
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(text, encoding="utf-8", newline="\n")

    def case(name, ok, detail=""):
        results.append(bool(ok))
        print(f"{'PASS' if ok else 'FAIL'}  {name}" + (f"\n      {detail[-1500:]}" if detail and not ok else ""), flush=True)

    def call(*a):
        env = dict(os.environ, ADDIC_WT=str(root), PYTHONIOENCODING="utf-8")
        p = subprocess.run([sys.executable, str(Path(__file__).resolve()), "--wt", str(wt)] + list(a), capture_output=True, env=env)
        so = p.stdout.decode("utf-8", "replace")
        try:
            js = json.loads(so.strip().splitlines()[-1])
        except (ValueError, IndexError):
            js = {}
        return p.returncode, js, so

    sleeper = None
    try:
        write("offline/build.mjs", "import fs from 'node:fs';\n"
              "const html = '<!doctype html><meta http-equiv=\"Content-Security-Policy\" content=\"default-src \\'none\\'\"><p>ok</p>';\n"
              "fs.writeFileSync('offline/1-addic.html', html);\nconsole.log('wrote offline/1-addic.html ' + html.length + ' bytes');\n")
        write("offline/tests/pass.test.mjs", "import test from 'node:test';\ntest('selftest passing case', () => {});\n")
        write("offline/tests/fail.test.mjs", "import test from 'node:test';\ntest('selftest failing case', () => { throw new Error('boom'); });\n")
        write("offline/tests/browser.test.mjs", "throw new Error('the browser suite must never run in the test gate');\n")
        write("offline/src/styles.css", ":root { --bg: #fff; --fg: #111; --gap: 8px; }\n"
              "[data-theme=\"dark\"] { --bg: #000; --gap: 8px; }\n/* -- core -- */\n.x { color: var(--fg); }\n")
        write("offline/src/ui-x.js", "// see https://example.org/docs for nothing\n"
              "const NS = 'http://www.w3.org/2000/svg';\n"
              "function paint(el, x) { el.innerHTML = x; el.innerHTML = ''; el.innerHTML = '<b>fixed</b>'; }\n"
              "const nav = '<nav data-tour=\"nav-x\"></nav>';\n")
        write("offline/src/content-core.js", "const Content = {\n  tutorials: [ { id: 't', steps: [ { target: 'nav-x' }, { target: 'nav-missing' } ] } ],\n"
              "  resources: { in: { links: [ { url: 'https://allowed.example.org' } ] } },\n};\n"
              "if (typeof module !== 'undefined') module.exports = Content;\n")

        rc, js, so = call("--lane", "selftest", "--full", "build", "test", "validate", "browser", "guards", "docs")
        g = js.get("gates", {})
        b, t, gu = g.get("build", {}), g.get("test", {}), g.get("guards", {})
        case("build -> GREEN with the size printed", b.get("verdict") == GREEN and "size=" in b.get("detail", ""), so)
        case("test -> RED", t.get("verdict") == RED, so)
        case("test -> the failing name printed as FAIL selftest failing case", "FAIL selftest failing case" in so
             and t.get("fails") == ["selftest failing case"], so)
        case("test -> counts pass=1 fail=1, browser.test.mjs not run", t.get("counts", {}).get("pass") == 1
             and t.get("counts", {}).get("fail") == 1 and "2 file(s)" in t.get("detail", ""), so)
        names = gu.get("fails", [])
        case("guards -> RED", gu.get("verdict") == RED, so)
        case("guards -> theme-parity finding names --fg", "guard: theme-parity" in names and "only in light: --fg" in so, so)
        case("guards -> innerHTML finding (the variable only, line 3)", "guard: innerHTML offline/src/ui-x.js" in names and "line(s) 3" in so
             and sum(1 for l in so.splitlines() if l.startswith("FAIL guard: innerHTML")) == 1, so)
        case("guards -> external URL in ui-x.js; w3 namespace and resources exempt",
             "guard: external-url offline/src/ui-x.js" in names and "w3.org" not in so and "allowed.example" not in so
             and not any("content-core" in n for n in names), so)
        case("guards -> tour target nav-missing, not nav-x", "guard: tour-target nav-missing" in names
             and "guard: tour-target nav-x" not in names, so)
        case("validate/browser/docs -> SKIP with the reason named", g.get("validate", {}).get("verdict") == SKIP
             and "engine.js absent" in so and g.get("browser", {}).get("verdict") == SKIP and g.get("docs", {}).get("verdict") == SKIP, so)
        case("RED and no VOID -> exit 1, JSON verdict RED", rc == 1 and js.get("verdict") == RED, f"rc={rc}")
        logs_ok = all(Path(r.get("log", "")).is_file() for r in g.values()) and (root / "_logs" / "gates" / "selftest" / "gates-summary.log").is_file()
        case("a log per gate under <root>/_logs/gates/<lane>/ and the summary log", logs_ok, so)
        q = root / "_locks" / "1-addic.queue"
        case("the lock released (no ticket, no holder left)", q.is_dir() and not any(q.iterdir()) and not (root / "_locks" / "1-addic.lock").exists(), so)

        write("offline/src/engine.js", "module.exports = { validateContent() { return ['selftest content error']; } };\n")
        rc, js, so = call("--lane", "selftest", "validate")
        case("validate -> RED with FAIL validate: selftest content error", rc == 1 and "FAIL validate: selftest content error" in so, so)

        stale = q / f"{time.time_ns() - 10**9:020d}-{999991}"
        stale.write_text("dead\n", encoding="utf-8")
        rc, js, so = call("--lane", "selftest", "--files", "offline/tests/pass.test.mjs", "test")
        case("a stale ticket of a dead pid is ignored -> GREEN", rc == 0 and js.get("verdict") == GREEN and not stale.exists(), so)

        sleeper = subprocess.Popen([sys.executable, "-c", "import time; time.sleep(60)"])
        time.sleep(0.3)
        live = q / f"{time.time_ns():020d}-{sleeper.pid}"
        live.write_text("live\n", encoding="utf-8")
        t0 = time.monotonic()
        rc, js, so = call("--lane", "selftest", "--files", "offline/tests/pass.test.mjs", "--lock-wait", "2", "test")
        case("a live earlier ticket -> VOID lock timeout, exit 2", rc == 2 and "lock timeout" in so and time.monotonic() - t0 < 30, so)
        live.unlink()
        rc, js, so = call("--lane", "selftest", "--no-lock", "--files", "offline/tests/pass.test.mjs", "test")
        case("--no-lock -> GREEN", rc == 0, so)

        empty = tmp / "base"
        (empty / "offline" / "src").mkdir(parents=True)
        (empty / "offline" / "src" / "content-core.js").write_text("module.exports = {};\n", encoding="utf-8")
        env = dict(os.environ, ADDIC_WT=str(root), PYTHONIOENCODING="utf-8")
        p = subprocess.run([sys.executable, str(Path(__file__).resolve()), "--wt", str(empty), "--lane", "_base",
                            "build", "test", "validate", "browser", "guards", "docs"], capture_output=True, env=env)
        so = p.stdout.decode("utf-8", "replace")
        js = json.loads(so.strip().splitlines()[-1])
        case("a base with content files only -> every gate SKIP, exit 0", p.returncode == 0 and js.get("verdict") == SKIP
             and all(r["verdict"] == SKIP for r in js["gates"].values()), so)
    except Exception as e:  # noqa: BLE001
        case("self-test ran", False, repr(e))
    finally:
        if sleeper:
            sleeper.kill()
            sleeper.wait()
        rmtree(tmp)
    ok = bool(results) and all(results)
    print(f"gates self-test: {'PASS' if ok else 'FAIL'} ({sum(results)}/{len(results)})")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
