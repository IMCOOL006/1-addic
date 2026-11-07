"""1-addic offline build (7 November 2026): the deterministic git part of ONE lane's merge into the trunk
build/offline-v1 (BUILD-PLAN.md sections 7 and 9). Adapted from the pharma program's merge_lane.py (one repository; no
database, no templates). The HUB and its merge agents call this script instead of improvising git.

Usage:  python merge_lane.py prepare   <lane> <tip> <base>      cut int/<lane>-<tip7> from the CURRENT tip of build/offline-v1
                                                                 (read from the main folder's ref) in the integration
                                                                 worktree, merge build/<lane> --no-ff --no-commit, list
                                                                 the conflicts (JSON on the last line)
        python merge_lane.py conflicts <lane> [--classify-only]  resolve the append points (keep both, ours first, ONLY
                                                                 when every incoming region carries the lane's banner)
                                                                 and package.json (JSON-aware); everything else stays
                                                                 unresolved: state CONFLICT, the HUB decides
        python merge_lane.py guards    <lane> <base>             tools/check_territory.py <lane> <base>..build/<lane> and
                                                                 tools/gates.py build test validate guards in the
                                                                 integration worktree, judged by failure name against
                                                                 coordination/baselines.md; stages the rebuilt
                                                                 offline/1-addic.html into the merge
        python merge_lane.py commit    <lane> <msgfile>          commit the merge with the message file (-F; the subject
                                                                 'merge(offline): ' and the two trailers checked); prints the sha
        python merge_lane.py status    <lane>                    branch, merge in progress, porcelain (read-only)
        python merge_lane.py abort     <lane>                    git merge --abort if a merge is in progress, then
                                                                 git switch --detach build/offline-v1; an int/<lane>-<tip7>
                                                                 branch with no commit of its own is deleted (git branch
                                                                 -d); one with a merge commit stays for inspection
        python merge_lane.py finish    <lane> <tip7> --hub [--push]
                                                                 THE HUB'S STEP (refused without --hub or ADDIC_HUB=1), in
                                                                 the MAIN folder: when the trunk moved since the cut and
                                                                 every file those commits touched is under
                                                                 docs/offline/build-2026-11-07/ or .claude/agents/, first
                                                                 merge the trunk into the int branch (docs only, no gates);
                                                                 any other path: BLOCKED, the HUB looks. Then git merge
                                                                 --ff-only int/<lane>-<tip7> in the main folder, then
                                                                 git -C _int switch --detach build/offline-v1; ONLY with
                                                                 --push: git push origin build/offline-v1 and build/<lane>
        python merge_lane.py --self-test                         a temp repository under %TEMP%: PASS/FAIL per case

  paths  main folder ADDIC_ROOT (default C:/Users/ruchi/1-addic, trunk build/offline-v1 checked out there);
         worktrees ADDIC_WT (default C:/Users/ruchi/1-addic-wt): _int (integration, DETACHED between merges), _base
         (read-only), <lane> (never touched here); logs <ADDIC_WT>/_logs/merges/<lane>-<tip7>.git.log (every git command
         and its output appended); program docs ADDIC_DOCS (default <ADDIC_ROOT>/docs/offline/build-2026-11-07)
  lane   core, engine, actions-sos, learn, tests-docs, today-track, workbook-settings, actions, game-tutorials, content
         (branch build/<lane>)

What it refuses (it stops BEFORE any git command when the arguments are bad, and before any change when the state is):
  - a lane not matching ^[a-z][a-z0-9-]+$, a sha not 7 to 40 hex chars;
  - prepare: the integration worktree missing; an int/ branch checked out there (a merge is still open: BLOCKED); the
    worktree on another branch or dirty, or a merge in progress (BLOCKED); build/<lane> missing or not at <tip>
    (MISMATCH); int/<lane>-<tip7> already existing (BLOCKED); <tip> already reachable from the trunk (NOTHING-TO-MERGE);
    <base> not a commit or not an ancestor of the trunk tip (BLOCKED: the lane was not cut from the trunk's history);
  - conflicts, guards, commit: not on this lane's int/<lane>-<tip7> branch, or untracked files it did not create;
  - guards: unmerged paths left (CONFLICT); commit: unmerged paths left, no merge in progress, a message file without
    the subject or the two trailers;
  - finish: no --hub (and no ADDIC_HUB=1); a merge in progress or a dirty integration worktree; the int branch missing
    or carrying nothing; the main folder not on build/offline-v1; the trunk moved by commits outside the docs paths; the
    main folder holding uncommitted changes to files the merge touches (BLOCKED with the paths).
No destructive git beyond `git merge --abort`, `git switch` and `git branch -d`; never rebase, stash, reset --hard,
checkout -- <file>, branch -D, push --force; never shell=True.
Exit codes: 0 the state the caller wanted (MERGED-CLEAN, CLASSIFIED, RESOLVED, GREEN, COMMITTED, STATUS, ABORTED,
FINISHED), 1 a stop state (BLOCKED, MISMATCH, CONFLICT, RED, NOTHING-TO-MERGE, GIT-FAILED), 2 bad arguments. The last
stdout line is always one JSON object.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(os.environ.get("ADDIC_ROOT", r"C:\Users\ruchi\1-addic"))
WT = Path(os.environ.get("ADDIC_WT", r"C:\Users\ruchi\1-addic-wt"))
DOCS = Path(os.environ.get("ADDIC_DOCS", str(ROOT / "docs" / "offline" / "build-2026-11-07")))
INT = WT / "_int"
BASE_WT = WT / "_base"
LOGS = WT / "_logs" / "merges"
TOOLS = DOCS / "tools"
BASELINES = DOCS / "coordination" / "baselines.md"
TRUNK = "build/offline-v1"
BUILT = "offline/1-addic.html"
DOCS_ONLY = ("docs/offline/build-2026-11-07/", ".claude/agents/")
TRAILERS = ("Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>", "Claude-Session: ")
SUBJECT = "merge(offline): "
LANE_RE = re.compile(r"^[a-z][a-z0-9-]+$")
SHA_RE = re.compile(r"^[0-9a-f]{7,40}$")
GATE_NAMES = ("build", "test", "validate", "browser", "guards", "docs")
# The append points of BUILD-PLAN section 9. This map only says WHICH banner rule applies; keep_both is chosen when
# EVERY incoming region passes it, never because the path is listed (a conflict inside existing lines is never
# concatenated). package.json is not here: keep_both would break JSON (it has its own merge, below).
APPEND = {"offline/src/styles.css": "css", "offline/build.mjs": "parts", "offline/src/content-core.js": "additions",
          "README.md": "md", "CLAUDE.md": "md"}
REGION = re.compile(rb"<<<<<<< [^\r\n]*\r?\n(.*?)=======\r?\n(.*?)>>>>>>> [^\r\n]*\r?\n", re.S)
NO_DIFF3 = ("merge.conflictStyle=merge",)


def out(obj, code):
    sys.stdout.write(json.dumps(obj, ensure_ascii=True) + "\n")
    sys.stdout.flush()
    sys.exit(code)


def stop(state, why, **more):
    d = {"state": state, "why": why}
    d.update(more)
    out(d, 1)


def usage(msg=None):
    if msg:
        sys.stderr.write("merge_lane.py: " + msg + "\n")
    sys.stderr.write(__doc__.split("\n\n")[1] + "\n")
    sys.stdout.write(json.dumps({"state": "BAD-ARGUMENTS", "why": msg or "usage"}) + "\n")
    sys.exit(2)


class Git:
    """Every git command of this run, logged to one file; never shell=True."""

    def __init__(self, wt, log_path):
        self.wt = wt
        self.log_path = log_path
        LOGS.mkdir(parents=True, exist_ok=True)

    def run(self, *args, check=True, cfg=()):
        cmd = ["git", "-C", str(self.wt)] + [x for c in cfg for x in ("-c", c)] + list(args)
        p = subprocess.run(cmd, capture_output=True)
        so = p.stdout.decode("utf-8", "replace")
        se = p.stderr.decode("utf-8", "replace")
        with open(self.log_path, "a", encoding="utf-8", newline="\n") as f:
            f.write(f"\n$ {' '.join(cmd)}   (exit {p.returncode}, {time.strftime('%Y-%m-%d %H:%M:%S')})\n{so}{se}")
        if check and p.returncode != 0:
            stop("GIT-FAILED", f"{' '.join(args[:2])} exited {p.returncode}: {(se or so).strip()[:400]}", log=str(self.log_path))
        return p.returncode, so.strip(), se.strip()

    def text(self, *args):
        return self.run(*args)[1]

    def branch(self):
        return self.text("rev-parse", "--abbrev-ref", "HEAD")

    def porcelain(self):
        return [l for l in self.text("status", "--porcelain", "--untracked-files=all").splitlines() if l.strip()]

    def porcelain_paths(self):
        """{path: XY} from `status --porcelain -z` (both names of a rename)."""
        p = subprocess.run(["git", "-C", str(self.wt), "status", "--porcelain=v1", "-z", "--untracked-files=all"], capture_output=True)
        parts = p.stdout.decode("utf-8", "replace").split("\0")
        res, i = {}, 0
        while i < len(parts):
            e = parts[i]
            i += 1
            if len(e) < 4:
                continue
            xy, path = e[:2], e[3:]
            res[path] = xy
            if xy[0] in "RC" and i < len(parts):
                res[parts[i]] = xy
                i += 1
        return res

    def untracked(self):
        return [l[3:] for l in self.porcelain() if l.startswith("??")]

    def unmerged(self):
        return [l for l in self.text("diff", "--name-only", "--diff-filter=U").splitlines() if l.strip()]

    def merge_in_progress(self):
        rc, _, _ = self.run("rev-parse", "-q", "--verify", "MERGE_HEAD", check=False)
        return rc == 0

    def ref_exists(self, ref):
        rc, _, _ = self.run("rev-parse", "-q", "--verify", ref + "^{commit}", check=False)
        return rc == 0

    def sha(self, ref):
        rc, s, _ = self.run("rev-parse", "--verify", "-q", ref + "^{commit}", check=False)
        return s if rc == 0 else None

    def is_ancestor(self, a, b):
        return self.run("merge-base", "--is-ancestor", a, b, check=False)[0] == 0


def check_args(lane, shas=()):
    if not LANE_RE.match(lane or ""):
        usage(f"lane must match ^[a-z][a-z0-9-]+$, got {lane!r}")
    for s in shas:
        if not SHA_RE.match(s or ""):
            usage(f"a sha must be 7 to 40 hex chars, got {s!r}")


def int_re(lane):
    return re.compile(r"^int/" + re.escape(lane) + r"-[0-9a-f]{7}$")


def int_branch_of(g, lane):
    b = g.branch()
    if not int_re(lane).match(b):
        stop("BLOCKED", f"the integration worktree is on {b}, not on an int/{lane}-<tip7> branch: run prepare first", branch=b)
    return b


def refuse_foreign_untracked(g):
    u = g.untracked()
    if u:
        stop("BLOCKED", "untracked files this script did not create are in the integration worktree; the HUB removes or commits them", untracked=u[:30])


def need_int():
    if not (INT / ".git").exists():
        stop("BLOCKED", f"the integration worktree {INT} is missing (git worktree add --detach {INT} {TRUNK} is the HUB's)")


# ------------------------------------------------------------------------------------------------------ prepare
def cmd_prepare(lane, tip, base):
    check_args(lane, (tip, base))
    need_int()
    tip7 = tip[:7]
    g = Git(INT, LOGS / f"{lane}-{tip7}.git.log")
    r = Git(ROOT, g.log_path)
    g.run("rev-parse", "--git-dir")
    branch = g.branch()
    if branch.startswith("int/"):
        stop("BLOCKED", f"an integration branch {branch} is still checked out (a merge is open: finish or abort it first)", branch=branch)
    if branch != "HEAD":
        stop("BLOCKED", f"the integration worktree is on {branch}; it stays DETACHED between merges (git -C {INT} switch --detach {TRUNK})", branch=branch)
    dirty = g.porcelain()
    if dirty:
        stop("BLOCKED", "the integration worktree is not clean", porcelain=dirty[:30])
    if g.merge_in_progress():
        stop("BLOCKED", "a merge is in progress in the integration worktree: the HUB looks before anything runs here")
    lane_ref = f"build/{lane}"
    lane_sha = g.sha(lane_ref)
    if not lane_sha:
        stop("MISMATCH", f"the branch {lane_ref} does not exist in this repository")
    if not lane_sha.startswith(tip):
        stop("MISMATCH", f"{lane_ref} is at {lane_sha[:12]} but the READY line says {tip}: the chat's status and the branch disagree", branchTip=lane_sha, tip=tip)
    int_branch = f"int/{lane}-{tip7}"
    if g.ref_exists(int_branch):
        stop("BLOCKED", f"the branch {int_branch} already exists (an earlier run of this merge): python merge_lane.py abort {lane} deletes it when it carries no commit (git branch -d); one with a merge commit the HUB inspects and removes itself", intBranch=int_branch)
    trunk_sha = r.sha(f"refs/heads/{TRUNK}")
    if not trunk_sha:
        stop("BLOCKED", f"the main folder {ROOT} has no branch {TRUNK}")
    if g.is_ancestor(lane_sha, trunk_sha):
        stop("NOTHING-TO-MERGE", f"{lane_ref} @ {tip7} is already reachable from {TRUNK} @ {trunk_sha[:7]}", trunk=trunk_sha)
    base_sha = g.sha(base)
    if not base_sha:
        stop("BLOCKED", f"the base {base} is not a commit here")
    if not g.is_ancestor(base_sha, trunk_sha):
        stop("BLOCKED", f"the base {base[:12]} is not an ancestor of {TRUNK} @ {trunk_sha[:12]}: the lane was not cut from the trunk's history", trunk=trunk_sha, base=base_sha)
    # ---- the two commands that change the worktree ----
    g.run("switch", "-c", int_branch, trunk_sha)
    rc, so, se = g.run("merge", "--no-ff", "--no-commit", lane_ref, check=False, cfg=NO_DIFF3)
    conflicts = g.unmerged()
    merge_base = g.text("merge-base", trunk_sha, lane_sha)
    changed = [l for l in g.text("diff", "--name-only", "--no-renames", merge_base, lane_sha).splitlines() if l.strip()]
    tests = [f for f in changed if re.search(r"\.test\.mjs$", f)]
    result = {
        "state": "CONFLICT" if conflicts else ("MERGED-CLEAN" if rc == 0 else "GIT-FAILED"),
        "lane": lane, "intBranch": int_branch, "tip": lane_sha, "trunk": trunk_sha, "base": base_sha, "mergeBase": merge_base,
        "conflicts": conflicts, "filesChanged": changed, "testFiles": tests, "mergeInProgress": g.merge_in_progress(),
        "log": str(g.log_path),
    }
    if rc != 0 and not conflicts:
        result["why"] = (se or so)[:400] + f"; run: python merge_lane.py abort {lane} (it aborts, detaches at {TRUNK} and deletes the empty {int_branch})"
        out(result, 1)
    out(result, 0 if not conflicts else 1)


# ---------------------------------------------------------------------------------------------------- conflicts
def banner_ok(kind, lane, b, m):
    """(ok, why) for one conflict region m of file bytes b under the append rule `kind`."""
    theirs = m.group(2)
    before, after = b[:m.start()], b[m.end():]
    css_b, js_b = f"/* -- {lane} -- */".encode(), f"// -- {lane} --".encode()
    if kind == "css":
        return css_b in theirs, f"no {css_b.decode()} banner"
    if kind == "parts":
        if js_b in theirs or css_b in theirs:
            return True, ""
        lp, le = before.rfind(b"// -- parts --"), before.rfind(b"// -- end parts --")
        return lp >= 0 and lp > le and b"// -- end parts --" in after, f"neither a {js_b.decode()} banner nor between // -- parts -- and // -- end parts --"
    if kind == "additions":
        if b"/* -- additions -- */" not in before:
            return False, "not after the /* -- additions -- */ line"
        return (css_b in theirs or js_b in theirs), f"after the additions line but without a {css_b.decode()} banner"
    if kind == "md":
        if re.search(rb"(?m)^## Offline edition\b", theirs):
            return True, ""
        heads = re.findall(rb"(?m)^## [^\r\n]*", before)
        return bool(heads) and heads[-1].startswith(b"## Offline edition"), "not a ## Offline edition section"
    return False, "no append rule"


def classify(lane, path):
    """(kind, info): append | package | other. append ONLY when every incoming region passes the banner rule."""
    info = {"appendPoint": path in APPEND, "regions": 0, "bannered": 0}
    if path == "package.json":
        return "package", info
    if path not in APPEND:
        info["why"] = "not an append point: the HUB decides"
        return "other", info
    f = INT / path
    if not f.exists():
        info["why"] = "the file is not in the worktree (a delete/modify conflict)"
        return "other", info
    b = f.read_bytes()
    regions = list(REGION.finditer(b))
    info["regions"] = len(regions)
    if not regions:
        info["why"] = "no text conflict region (a delete/modify or binary conflict)"
        return "other", info
    if any(b"<<<<<<<" in r.group(1) + r.group(2) or b"|||||||" in r.group(1) for r in regions):
        info["why"] = "a nested or diff3 marker"
        return "other", info
    whys = []
    for r in regions:
        ok, why = banner_ok(APPEND[path], lane, b, r)
        if ok:
            info["bannered"] += 1
        else:
            whys.append(why)
    if info["bannered"] == len(regions):
        return "append", info
    info["why"] = f"{len(regions) - info['bannered']} of {len(regions)} incoming region(s) fail the append rule ({whys[0]}): a conflict inside existing lines, never concatenated"
    return "other", info


def keep_both(path, expected):
    """Each region becomes ours followed by theirs (bytes; the line endings stay). (ok, why)."""
    f = INT / path
    b = f.read_bytes()
    rs = list(REGION.finditer(b))
    if len(rs) != expected:
        return False, f"{len(rs)} regions, expected {expected}"
    res = REGION.sub(lambda m: m.group(1) + m.group(2), b)
    if re.search(rb"(?m)^(<<<<<<< |=======\r?$|>>>>>>> )", res):
        return False, "a marker left after the resolution"
    f.write_bytes(res)
    return True, ""


MISSING = object()


def merge_value(bv, ov, tv, side, path, decided):
    if ov == tv:
        return ov
    if ov == bv:
        return tv
    if tv == bv:
        return ov
    if isinstance(ov, dict) and isinstance(tv, dict):
        return merge_dict(bv if isinstance(bv, dict) else {}, ov, tv, lambda k: side, path, decided)
    decided.append({"key": ".".join(path), "took": side})
    return ov if side == "ours" else tv


def merge_dict(b, o, t, side_of, path, decided):
    res = {}
    for k in list(o.keys()) + [k for k in t.keys() if k not in o]:
        v = merge_value(b.get(k, MISSING), o.get(k, MISSING), t.get(k, MISSING), side_of(k), path + [k], decided)
        if v is not MISSING:
            res[k] = v
    return res


def merge_package(g, lane):
    """package.json by content: a three-way merge per key; where both sides changed one value, scripts and
    devDependencies come from the tests-docs side, everything else from the other side. (ok, why, decided)."""
    def stage(n):
        rc, so, _ = g.run("show", f":{n}:package.json", check=False)
        if rc != 0:
            return MISSING
        try:
            return json.loads(so)
        except ValueError:
            return None
    b, o, t = stage(1), stage(2), stage(3)
    if o in (MISSING, None) or t in (MISSING, None) or not isinstance(o, dict) or not isinstance(t, dict):
        return False, "one side deleted package.json or holds invalid JSON", []
    b = b if isinstance(b, dict) else {}
    td = "theirs" if lane == "tests-docs" else "ours"
    other = "ours" if td == "theirs" else "theirs"
    decided = []
    merged = merge_dict(b, o, t, lambda k: td if k in ("scripts", "devDependencies") else other, [], decided)
    (INT / "package.json").write_bytes((json.dumps(merged, indent=2, ensure_ascii=False) + "\n").encode("utf-8"))
    return True, "", decided


def cmd_conflicts(lane, classify_only=False):
    check_args(lane)
    need_int()
    g0 = Git(INT, LOGS / f"{lane}-conflicts.git.log")
    b = int_branch_of(g0, lane)
    g = Git(INT, LOGS / f"{lane}-{b.rsplit('-', 1)[-1]}.git.log")  # the same log as prepare's
    refuse_foreign_untracked(g)
    if not g.merge_in_progress():
        stop("BLOCKED", "no merge is in progress on " + b)
    unmerged = g.unmerged()
    cls = {p: classify(lane, p) for p in unmerged}
    plan = {p: k for p, (k, _) in cls.items()}
    details = {p: i for p, (_, i) in cls.items()}
    result = {"state": None, "lane": lane, "intBranch": b, "plan": plan, "details": details, "resolved": [], "unresolved": [], "log": str(g.log_path)}
    if classify_only:
        result["state"] = "CLASSIFIED"
        out(result, 0)
    for p in [p for p, k in plan.items() if k == "append"]:
        ok, why = keep_both(p, details[p]["regions"])
        with open(g.log_path, "a", encoding="utf-8", newline="\n") as f:
            f.write(f"\n# keep_both {p}: {'both kept (ours first), ' + str(details[p]['regions']) + ' region(s)' if ok else 'STOP ' + why}\n")
        if ok:
            g.run("add", "--", p)
            result["resolved"].append({"file": p, "how": "keep_both", "regions": details[p]["regions"]})
        else:
            plan[p] = "other"
            details[p]["why"] = why
    if plan.get("package.json") == "package":
        ok, why, decided = merge_package(g, lane)
        with open(g.log_path, "a", encoding="utf-8", newline="\n") as f:
            f.write(f"\n# package.json merge: {'ok, decided ' + json.dumps(decided) if ok else 'STOP ' + why}\n")
        if ok:
            g.run("add", "--", "package.json")
            result["resolved"].append({"file": "package.json", "how": "json-merge", "decided": decided,
                                       "rule": "scripts and devDependencies from the tests-docs side, the rest from the other side"})
        else:
            plan["package.json"] = "other"
            details["package.json"]["why"] = why
    left = g.unmerged()
    result["unresolved"] = left
    result["state"] = "RESOLVED" if not left else "CONFLICT"
    out(result, 0 if not left else 1)


# ------------------------------------------------------------------------------------------------------- guards
def load_baseline():
    """{(gate or None, name)} from baselines.md list lines `- <gate>: <failure name> (seen <stamp>, <log>)`."""
    if not BASELINES.exists():
        return set(), "missing (empty baseline)"
    entries = set()
    for line in BASELINES.read_text(encoding="utf-8", errors="replace").splitlines():
        s = line.strip()
        m = re.match(r"^[-*]\s+(.*)$", s)
        if m:
            s = m.group(1)
        elif not s.startswith("FAIL "):
            continue
        s = re.sub(r"\s+\(seen [^)]*\)\s*$", "", s.strip()).strip().strip("`").strip()
        if s.startswith("FAIL "):
            s = s[5:].strip()
        gm = re.match(r"^(%s):\s+(.*)$" % "|".join(GATE_NAMES), s)
        entries.add((gm.group(1), gm.group(2).strip().strip("`")) if gm else (None, s))
    return entries, f"{len(entries)} named failure(s)"


def in_baseline(entries, gate, name):
    forms = {name, re.sub(r"^(build|test|validate|browser|guards?|docs):\s*", "", name)}
    for g, n in entries:
        if g in (None, gate) and (n in forms or any(n.startswith(f + ":") for f in forms)):
            return True
    return False


def run_tool(args, log):
    env = dict(os.environ, PYTHONIOENCODING="utf-8", ADDIC_ROOT=str(ROOT), ADDIC_WT=str(WT))
    p = subprocess.run([sys.executable] + [str(a) for a in args], capture_output=True, env=env)
    so = p.stdout.decode("utf-8", "replace")
    se = p.stderr.decode("utf-8", "replace")
    with open(log, "a", encoding="utf-8", newline="\n") as f:
        f.write(f"\n$ python {' '.join(str(a) for a in args)}   (exit {p.returncode}, {time.strftime('%Y-%m-%d %H:%M:%S')})\n{so}{se}")
    js = None
    lines = so.strip().splitlines()
    if lines:
        try:
            js = json.loads(lines[-1])
        except ValueError:
            js = None
    return p.returncode, js, so


def cmd_guards(lane, base):
    check_args(lane, (base,))
    need_int()
    g0 = Git(INT, LOGS / f"{lane}-guards.git.log")
    b = int_branch_of(g0, lane)
    tip7 = b.rsplit("-", 1)[-1]
    g = Git(INT, LOGS / f"{lane}-{tip7}.git.log")
    left = g.unmerged()
    if left:
        stop("CONFLICT", "unmerged paths remain: run conflicts (or the HUB resolves) before the guards", unmerged=left)
    ct, gp = TOOLS / "check_territory.py", TOOLS / "gates.py"
    for t in (ct, gp):
        if not t.exists():
            stop("BLOCKED", f"{t} is missing")
    log = LOGS / f"{lane}-{tip7}.guards.log"
    before = g.porcelain_paths()
    t_rc, t_js, _ = run_tool([ct, lane, f"{base}..build/{lane}", "--wt", INT], log)
    g_rc, g_js, _ = run_tool([gp, "--wt", INT, "--lane", lane, "build", "test", "validate", "guards"], log)
    after = g.porcelain_paths()
    moved = [p for p, xy in after.items() if before.get(p) != xy]
    staged, left_by_gates = [], []
    for p in moved:
        if p == BUILT:
            g.run("add", "--", p)
            staged.append(p)
        else:
            left_by_gates.append(p)
    entries, bl_note = load_baseline()
    reds, baselined = [], []
    terr = {"exit": t_rc}
    if t_js and t_rc in (0, 1):
        terr.update({"errors": t_js.get("errors", []), "warnings": t_js.get("warnings", []), "shared": t_js.get("shared", [])})
        reds += [f"territory: {e['path']} ({e['why']})" for e in t_js.get("errors", [])]
        if t_rc == 1 and not t_js.get("errors"):
            reds.append("territory: check_territory.py exited 1 without naming an error")
    else:
        reds.append(f"territory: check_territory.py could not judge (exit {t_rc}); see {log}")
    gates = {}
    if not g_js or "gates" not in g_js:
        reds.append(f"gates: gates.py gave no verdict (exit {g_rc}); see {log}")
    else:
        for name, r in g_js["gates"].items():
            gates[name] = {"verdict": r.get("verdict"), "detail": r.get("detail"), "log": r.get("log"), "fails": r.get("fails", [])}
            if r.get("verdict") == "VOID":
                reds.append(f"{name}: VOID ({r.get('detail')})")
            elif r.get("verdict") == "RED":
                for f in r.get("fails", []) or [f"{name}: RED without a named failure"]:
                    if in_baseline(entries, name, f):
                        baselined.append(f"{name}: {f}")
                    else:
                        reds.append(f"{name}: {f}")
    for p in left_by_gates:
        reds.append(f"worktree: the gates left {p} changed in the integration worktree")
    out({"state": "GREEN" if not reds else "RED", "lane": lane, "intBranch": b, "reds": reds, "baselined": baselined,
         "baseline": f"{BASELINES} ({bl_note})", "territory": terr, "gates": gates, "gatesVerdict": (g_js or {}).get("verdict"),
         "stagedBuild": staged, "log": str(log), "gitLog": str(g.log_path)}, 0 if not reds else 1)


# ------------------------------------------------------------------------------------------------------- commit
def cmd_commit(lane, msgfile):
    check_args(lane)
    need_int()
    mp = Path(msgfile)
    if not mp.exists():
        usage(f"message file {msgfile} is missing")
    msg = mp.read_text(encoding="utf-8")
    for t in TRAILERS:
        if t not in msg:
            stop("BLOCKED", f"the message file lacks the trailer line starting '{t.strip()}'", msgfile=str(mp))
    if not msg.lstrip().startswith(SUBJECT):
        stop("BLOCKED", f"the message must start with '{SUBJECT}<lane> <kind> <tip7> onto <trunk7>'", msgfile=str(mp))
    g0 = Git(INT, LOGS / f"{lane}-commit.git.log")
    b = int_branch_of(g0, lane)
    g = Git(INT, LOGS / f"{lane}-{b.rsplit('-', 1)[-1]}.git.log")
    refuse_foreign_untracked(g)
    if not g.merge_in_progress():
        stop("BLOCKED", "no merge is in progress on " + b + " (already committed? git log -1)")
    left = g.unmerged()
    if left:
        stop("CONFLICT", "unmerged paths remain", unmerged=left)
    g.run("commit", "-F", str(mp))
    sha = g.sha("HEAD")
    parents = g.text("rev-list", "--parents", "-n", "1", "HEAD").split()
    print(sha)
    out({"state": "COMMITTED", "lane": lane, "intBranch": b, "mergeCommit": sha, "parents": parents[1:], "log": str(g.log_path)}, 0)


# ----------------------------------------------------------------------------------------------- status, abort
def lane_int_branches(g, lane):
    rows = g.text("for-each-ref", "--format=%(refname:short) %(objectname)", "refs/heads/int/").splitlines()
    return [tuple(r.split()) for r in rows if len(r.split()) == 2 and int_re(lane).match(r.split()[0])]


def cmd_status(lane):
    check_args(lane)
    need_int()
    g = Git(INT, LOGS / f"{lane}-status.git.log")
    r = Git(ROOT, g.log_path)
    out({"state": "STATUS", "lane": lane, "branch": g.branch(), "head": g.sha("HEAD"), "mergeInProgress": g.merge_in_progress(),
         "unmerged": g.unmerged(), "porcelain": g.porcelain()[:40], "laneTip": g.sha(f"build/{lane}"), "trunk": r.sha(f"refs/heads/{TRUNK}"),
         "intBranches": [n for n, _ in lane_int_branches(g, lane)], "mainFolderBranch": r.branch()}, 0)


def cmd_abort(lane):
    check_args(lane)
    need_int()
    g = Git(INT, LOGS / f"{lane}-abort.git.log")
    b = g.branch()
    if b.startswith("int/") and not int_re(lane).match(b):
        stop("BLOCKED", f"the integration worktree is on {b}, another lane's merge: abort that lane instead", branch=b)
    aborted = False
    if g.merge_in_progress():
        if not int_re(lane).match(b):
            stop("BLOCKED", f"a merge is in progress on {b}, which is not this lane's integration branch: the HUB looks first", branch=b)
        g.run("merge", "--abort")
        aborted = True
    dirty = g.porcelain()
    if dirty:
        stop("BLOCKED", "the worktree is still dirty after the abort; the HUB looks before switching", porcelain=dirty[:30], branch=g.branch())
    g.run("switch", "--detach", TRUNK)
    deleted, kept = [], []
    for name, _sha in lane_int_branches(g, lane):
        own = g.text("rev-list", "--count", f"{TRUNK}..{name}")
        if own == "0":
            rc, _, _ = g.run("branch", "-d", name, check=False)
            (deleted if rc == 0 else kept).append(name)
        else:
            kept.append(name)
    out({"state": "ABORTED", "lane": lane, "mergeAborted": aborted, "leftForInspection": kept, "deletedEmptyBranches": deleted,
         "branch": g.branch(), "head": g.sha("HEAD"), "log": str(g.log_path)}, 0)


# ------------------------------------------------------------------------------------------------------- finish
def cmd_finish(lane, tip7, push=False, hub=False):
    check_args(lane, (tip7,))
    if not hub:
        stop("BLOCKED", "finish is the HUB's step: it runs only with --hub (or ADDIC_HUB=1); a merge agent never moves the trunk, not even locally")
    need_int()
    int_branch = f"int/{lane}-{tip7[:7]}"
    gi = Git(INT, LOGS / f"{lane}-{tip7[:7]}.git.log")
    gr = Git(ROOT, gi.log_path)
    if gi.merge_in_progress():
        stop("BLOCKED", "a merge is still in progress in the integration worktree: commit or abort it first")
    dirty = gi.porcelain()
    if dirty:
        stop("BLOCKED", "the integration worktree is not clean", porcelain=dirty[:30])
    if not gi.ref_exists(int_branch):
        stop("BLOCKED", f"{int_branch} does not exist")
    b = gi.branch()
    if b not in (int_branch, "HEAD"):
        stop("BLOCKED", f"the integration worktree is on {b}: neither {int_branch} nor detached", branch=b)
    rb = gr.branch()
    if rb != TRUNK:
        stop("BLOCKED", f"the main folder {ROOT} is on {rb}, not {TRUNK}", branch=rb)
    if gr.merge_in_progress():
        stop("BLOCKED", "a merge is in progress in the main folder: the HUB looks first")
    trunk_sha = gr.sha(f"refs/heads/{TRUNK}")
    int_sha = gi.sha(int_branch)
    if gi.text("rev-list", "--count", f"{trunk_sha}..{int_sha}") == "0":
        stop("BLOCKED", f"{int_branch} carries nothing the trunk lacks (not committed, or already finished)", intBranch=int_branch)
    cut = gi.text("merge-base", int_sha, trunk_sha)
    docs_merged, moved_files = None, []
    if cut != trunk_sha:
        moved_files = sorted({l for l in gr.text("log", "--name-only", "--no-renames", "--format=", f"{cut}..{trunk_sha}").splitlines() if l.strip()})
        foreign = [p for p in moved_files if not p.startswith(DOCS_ONLY)]
        if foreign:
            stop("BLOCKED", f"{TRUNK} moved since {int_branch} was cut, by commits touching files outside {' and '.join(DOCS_ONLY)}: the HUB looks (re-prepare, or merge and re-run the gates)",
                 paths=foreign, trunk=trunk_sha, cut=cut)
        if gi.branch() != int_branch:
            gi.run("switch", int_branch)
        rc, so, se = gi.run("merge", "--no-ff", "--no-edit", TRUNK, check=False, cfg=NO_DIFF3)
        if rc != 0:
            left = gi.unmerged()
            if gi.merge_in_progress():
                gi.run("merge", "--abort")
            stop("BLOCKED", f"merging the docs-only trunk commits into {int_branch} failed: the HUB looks", paths=left or moved_files,
                 detail=(se or so)[:400], log=str(gi.log_path))
        docs_merged = {"files": moved_files, "mergeCommit": gi.sha("HEAD")}
        int_sha = gi.sha(int_branch)
    touched = {l for l in gr.text("diff", "--name-only", "--no-renames", trunk_sha, int_sha).splitlines() if l.strip()}
    clash = sorted(p for p in gr.porcelain_paths() if p in touched)
    if clash:
        stop("BLOCKED", f"the main folder has uncommitted changes to files the merge touches: commit or move them, then finish again", paths=clash)
    rc, so, se = gr.run("merge", "--ff-only", int_branch, check=False)
    if rc != 0:
        paths = [l.strip() for l in (se + "\n" + so).splitlines() if l.startswith("\t")]
        if paths:
            stop("BLOCKED", "git refused the fast-forward in the main folder because of local changes", paths=paths, log=str(gi.log_path))
        stop("GIT-FAILED", f"git merge --ff-only {int_branch} exited {rc}: {(se or so)[:400]}", log=str(gi.log_path))
    after = gr.sha("HEAD")
    gi.run("switch", "--detach", TRUNK)
    pushed = None
    if push:
        sys.stdout.write("\n" + "#" * 78 + f"\n#  PUSHING {TRUNK} @ {after[:12]} AND build/{lane} TO origin  (the HUB's --push)\n" + "#" * 78 + "\n")
        sys.stdout.flush()
        pushed = []
        for ref in (TRUNK, f"build/{lane}"):
            prc, pso, pse = gr.run("push", "origin", ref, check=False)
            pushed.append({"ref": ref, "exit": prc, "out": (pso + "\n" + pse).strip()[:600]})
            if prc != 0:
                out({"state": "GIT-FAILED", "why": f"git push origin {ref} exited {prc}", "lane": lane, "trunk": TRUNK, "before": trunk_sha,
                     "after": after, "push": pushed, "log": str(gi.log_path)}, 1)
    out({"state": "FINISHED", "lane": lane, "trunk": TRUNK, "intBranch": int_branch, "before": trunk_sha, "after": after,
         "docsMerged": docs_merged, "integrationWorktree": gi.branch(),
         "pushed": pushed if push else f"NOT pushed (add --push): git -C {ROOT} push origin {TRUNK} && git -C {ROOT} push origin build/{lane}",
         "newBase": after[:8], "log": str(gi.log_path)}, 0)


# ---------------------------------------------------------------------------------------------------- self-test
def rmtree(path):
    def onexc(func, p, _exc):
        try:
            os.chmod(p, 0o700)
            func(p)
        except OSError:
            pass
    shutil.rmtree(path, onexc=onexc)


def self_test():
    tmp = Path(tempfile.mkdtemp(prefix="merge-selftest-", dir=tempfile.gettempdir()))
    root, wt = tmp / "1-addic", tmp / "1-addic-wt"
    docs = Path(__file__).resolve().parents[3]
    env = dict(os.environ, ADDIC_ROOT=str(root), ADDIC_WT=str(wt), ADDIC_DOCS=str(docs), PYTHONIOENCODING="utf-8")
    env.pop("ADDIC_HUB", None)
    results = []

    def git(where, *a):
        p = subprocess.run(["git", "-C", str(where)] + list(a), capture_output=True, text=True)
        if p.returncode != 0:
            raise RuntimeError(f"git -C {where} {' '.join(a)}: {p.stderr.strip()}")
        return p.stdout.strip()

    def write(where, rel, text, append=False):
        f = Path(where) / rel
        f.parent.mkdir(parents=True, exist_ok=True)
        with open(f, "a" if append else "w", encoding="utf-8", newline="\n") as h:
            h.write(text)

    def commit(where, msg):
        git(where, "add", "-A")
        git(where, "commit", "-q", "-m", msg)
        return git(where, "rev-parse", "HEAD")

    def call(*a):
        p = subprocess.run([sys.executable, str(Path(__file__).resolve())] + list(a), capture_output=True, env=env)
        so = p.stdout.decode("utf-8", "replace")
        try:
            js = json.loads(so.strip().splitlines()[-1])
        except (ValueError, IndexError):
            js = {}
        return p.returncode, js, so

    def case(name, ok, detail=""):
        results.append(bool(ok))
        print(f"{'PASS' if ok else 'FAIL'}  {name}" + (f"\n      {str(detail)[-1200:]}" if detail and not ok else ""), flush=True)

    def msgfile(lane, tip7, onto):
        p = tmp / f"msg-{lane}.txt"
        p.write_text(f"{SUBJECT}{lane} slice {tip7} onto {onto[:7]}\n\nSelf-test merge.\n\n{TRAILERS[0]}\n{TRAILERS[1]}https://claude.ai/code/session_selftest\n",
                     encoding="utf-8", newline="\n")
        return str(p)

    def region(b):
        return next(REGION.finditer(b))

    css_plain = b"a\n<<<<<<< HEAD\n/* -- hub -- */\n=======\n.x { color: red; }\n>>>>>>> build/engine\n"
    css_ban = b"a\n<<<<<<< HEAD\n/* -- hub -- */\n=======\n/* -- engine -- */\n>>>>>>> build/engine\n"
    parts = b"// -- parts --\n'a.js',\n<<<<<<< HEAD\n'b.js',\n=======\n'c.js',\n>>>>>>> build/engine\n// -- end parts --\n"
    parts_out = b"// -- parts --\n// -- end parts --\nx();\n<<<<<<< HEAD\ny();\n=======\nz();\n>>>>>>> build/engine\n"
    md_in = b"# R\n\n## Offline edition\n\ntext\n<<<<<<< HEAD\nours\n=======\ntheirs\n>>>>>>> build/engine\n"
    md_out = b"# R\n\n## Setup\n\n<<<<<<< HEAD\nours\n=======\ntheirs\n>>>>>>> build/engine\n"
    add_before = b"<<<<<<< HEAD\nx\n=======\n/* -- engine -- */\n>>>>>>> build/engine\n/* -- additions -- */\n"
    case("append rule: a region without the lane's banner is never concatenated", not banner_ok("css", "engine", css_plain, region(css_plain))[0]
         and banner_ok("css", "engine", css_ban, region(css_ban))[0])
    case("append rule: build.mjs between the parts markers only", banner_ok("parts", "engine", parts, region(parts))[0]
         and not banner_ok("parts", "engine", parts_out, region(parts_out))[0])
    case("append rule: Markdown inside ## Offline edition only; content-core.js only after the additions line",
         banner_ok("md", "engine", md_in, region(md_in))[0] and not banner_ok("md", "engine", md_out, region(md_out))[0]
         and not banner_ok("additions", "engine", add_before, region(add_before))[0])
    bl = tmp / "baselines.md"
    bl.write_text("# baselines\n\n| build | SKIP | none |\n\nAdd a line (`- <gate>: <failure name> (seen <stamp>, <log path>)`).\n"
                  "- guards: guard: theme-parity (seen 2026-11-07 06:42, x.log)\n- test: `store > round-trip` (seen 06:50, y.log)\n", encoding="utf-8")
    global BASELINES
    saved, BASELINES = BASELINES, bl
    entries, _ = load_baseline()
    BASELINES = saved
    case("baseline by name: listed failures match, others do not, the prose and table are ignored",
         in_baseline(entries, "guards", "guard: theme-parity") and in_baseline(entries, "test", "store > round-trip")
         and not in_baseline(entries, "test", "store > wrong pin") and not in_baseline(entries, "build", "guard: theme-parity") and len(entries) == 2, entries)
    try:
        subprocess.run(["git", "init", "-q", "-b", TRUNK, str(root)], check=True)
        for k, v in (("user.name", "selftest"), ("user.email", "selftest@example.invalid"), ("core.autocrlf", "false"), ("commit.gpgsign", "false")):
            git(root, "config", k, v)
        pkg0 = {"name": "1-addic", "private": True, "description": "base", "scripts": {"build": "node offline/build.mjs"}}
        write(root, ".gitattributes", "* text=auto eol=lf\n")
        write(root, "offline/src/styles.css", ":root { --bg: #fff; }\n\n/* -- core -- */\n.core { color: red; }\n")
        write(root, "package.json", json.dumps(pkg0, indent=2) + "\n")
        base = commit(root, "base")
        git(root, "worktree", "add", "-q", "--detach", str(wt / "_base"), base)
        git(root, "worktree", "add", "-q", "--detach", str(wt / "_int"), base)
        git(root, "branch", "build/engine", base)
        git(root, "worktree", "add", "-q", str(wt / "engine"), "build/engine")
        lw = wt / "engine"
        write(lw, "offline/src/styles.css", "\n/* -- engine -- */\n.engine { color: blue; }\n", append=True)
        write(lw, "offline/src/engine.js", "module.exports = {};\n")
        write(lw, "package.json", json.dumps(dict(pkg0, description="lane", scripts={"build": "node offline/build.mjs", "test": "node --test offline/tests/"}), indent=2) + "\n")
        tip = commit(lw, "engine: slice")
        write(root, "offline/src/styles.css", "\n/* -- hub-test -- */\n.hub { color: green; }\n", append=True)
        write(root, "package.json", json.dumps(dict(pkg0, description="trunk", scripts={"build": "node offline/build.mjs", "check": "npm test"}), indent=2) + "\n")
        commit(root, "trunk: a hub-test section after the lane's cut")

        rc, js, so = call("prepare", "engine", "deadbee", base)
        case("prepare with a wrong tip -> MISMATCH (exit 1)", rc == 1 and js.get("state") == "MISMATCH", so)
        rc, js, so = call("prepare", "Engine", tip, base)
        case("a bad lane id -> exit 2 before any git", rc == 2, so)
        rc, js, so = call("prepare", "engine", tip, base)
        case("prepare -> CONFLICT on styles.css and package.json", rc == 1 and js.get("state") == "CONFLICT"
             and set(js.get("conflicts", [])) == {"offline/src/styles.css", "package.json"}, so)
        rc, js, so = call("conflicts", "engine", "--classify-only")
        case("conflicts --classify-only -> styles.css append, package.json package", rc == 0 and js.get("plan") == {"offline/src/styles.css": "append", "package.json": "package"}, so)
        rc, js, so = call("conflicts", "engine")
        css = (wt / "_int" / "offline/src/styles.css").read_text(encoding="utf-8")
        pkg = json.loads((wt / "_int" / "package.json").read_text(encoding="utf-8"))
        case("conflicts -> RESOLVED", rc == 0 and js.get("state") == "RESOLVED" and not js.get("unresolved"), so)
        case("styles.css: both sections kept, ours (hub-test) first, no marker", "<<<<<<<" not in css and css.find("/* -- hub-test -- */") < css.find("/* -- engine -- */")
             and css.find("/* -- hub-test -- */") > 0, css)
        case("package.json: scripts merged per key, the tie (description) from the lane side",
             pkg.get("scripts") == {"build": "node offline/build.mjs", "check": "npm test", "test": "node --test offline/tests/"} and pkg.get("description") == "lane"
             and (wt / "_int" / "package.json").read_bytes().endswith(b"}\n"), json.dumps(pkg))
        rc, js, so = call("guards", "engine", base)
        case("guards -> RED by name: the territory ERROR on package.json (engine is not its owner); no gate VOID",
             rc == 1 and js.get("state") == "RED" and len(js.get("reds", [])) == 1 and js["reds"][0].startswith("territory: package.json")
             and js.get("gatesVerdict") in ("GREEN", "SKIP") and js.get("gates", {}).get("guards", {}).get("verdict") == "GREEN", so)
        bad = tmp / "bad-msg.txt"
        bad.write_text(f"{SUBJECT}engine slice\n\nno trailers\n", encoding="utf-8")
        rc, js, so = call("commit", "engine", str(bad))
        case("commit without the trailers -> BLOCKED", rc == 1 and js.get("state") == "BLOCKED", so)
        write(root, "docs/offline/build-2026-11-07/coordination/board.md", "# board\n")
        commit(root, "docs: board (a docs-only trunk commit after the cut)")
        write(root, "docs/offline/build-2026-11-07/coordination/scratch-notes.md", "uncommitted notes, not touched by the merge\n")
        rc, js, so = call("commit", "engine", msgfile("engine", tip[:7], base))
        case("commit -> COMMITTED, the sha printed", rc == 0 and js.get("state") == "COMMITTED" and js.get("mergeCommit", "x") in so.splitlines()[0], so)
        rc, js, so = call("finish", "engine", tip[:7])
        case("finish without --hub -> BLOCKED", rc == 1 and js.get("state") == "BLOCKED" and "--hub" in js.get("why", ""), so)
        rc, js, so = call("finish", "engine", tip[:7], "--hub")
        head = git(root, "rev-parse", "HEAD")
        case("finish --hub -> FINISHED through the docs-only trunk merge", rc == 0 and js.get("state") == "FINISHED" and js.get("docsMerged")
             and js["docsMerged"]["files"] == ["docs/offline/build-2026-11-07/coordination/board.md"], so)
        case("the main folder fast-forwarded to the int branch; styles, engine.js, board present; the untracked notes kept",
             head == git(root, "rev-parse", f"int/engine-{tip[:7]}") and (root / "offline/src/engine.js").exists()
             and "/* -- engine -- */" in (root / "offline/src/styles.css").read_text(encoding="utf-8")
             and (root / "docs/offline/build-2026-11-07/coordination/board.md").exists()
             and (root / "docs/offline/build-2026-11-07/coordination/scratch-notes.md").exists(), so)
        case("_int detached at the trunk after finish", git(wt / "_int", "rev-parse", "--abbrev-ref", "HEAD") == "HEAD"
             and git(wt / "_int", "rev-parse", "HEAD") == head, so)
        rc, js, so = call("abort", "engine")
        case("abort -> ABORTED, the finished int branch (nothing of its own) deleted with -d", rc == 0 and js.get("state") == "ABORTED"
             and js.get("deletedEmptyBranches") == [f"int/engine-{tip[:7]}"], so)
        rc, js, so = call("prepare", "engine", tip, base)
        case("prepare again -> NOTHING-TO-MERGE", rc == 1 and js.get("state") == "NOTHING-TO-MERGE", so)

        trunk_now = git(root, "rev-parse", "HEAD")
        git(root, "branch", "build/learn", trunk_now)
        git(root, "worktree", "add", "-q", str(wt / "learn"), "build/learn")
        write(wt / "learn", "offline/src/ui-learn.js", "// learn\n")
        ltip = commit(wt / "learn", "learn: slice")
        rc, js, so = call("prepare", "learn", ltip, trunk_now)
        case("second lane: prepare -> MERGED-CLEAN", rc == 0 and js.get("state") == "MERGED-CLEAN", so)
        rc, js, so = call("commit", "learn", msgfile("learn", ltip[:7], trunk_now))
        case("second lane: commit -> COMMITTED", rc == 0 and js.get("state") == "COMMITTED", so)
        write(root, "offline/src/ui-learn.js", "// an uncommitted copy in the main folder\n")
        rc, js, so = call("finish", "learn", ltip[:7], "--hub")
        case("finish with an uncommitted file the merge touches -> BLOCKED with the path", rc == 1 and js.get("state") == "BLOCKED"
             and js.get("paths") == ["offline/src/ui-learn.js"], so)
        (root / "offline/src/ui-learn.js").unlink()
        write(root, "offline/src/ui-core.js", "// core\n")
        commit(root, "trunk: a code commit after the cut")
        rc, js, so = call("finish", "learn", ltip[:7], "--hub")
        case("finish after a non-docs trunk commit -> BLOCKED with the paths", rc == 1 and js.get("state") == "BLOCKED"
             and js.get("paths") == ["offline/src/ui-core.js"], so)
        rc, js, so = call("abort", "learn")
        case("abort -> the int branch with a merge commit kept for inspection, _int detached", rc == 0 and js.get("leftForInspection") == [f"int/learn-{ltip[:7]}"]
             and js.get("branch") == "HEAD", so)
        rc, js, so = call("status", "learn")
        case("status -> STATUS (read-only)", rc == 0 and js.get("state") == "STATUS" and js.get("laneTip") == ltip, so)
    except Exception as e:  # noqa: BLE001
        case("self-test ran", False, repr(e))
    finally:
        try:
            subprocess.run(["git", "-C", str(root), "worktree", "prune"], capture_output=True)
        finally:
            rmtree(tmp)
    ok = bool(results) and all(results)
    print(f"merge_lane self-test: {'PASS' if ok else 'FAIL'} ({sum(results)}/{len(results)})")
    return 0 if ok else 1


def main(argv):
    if argv[:1] == ["--self-test"]:
        sys.exit(self_test())
    if len(argv) < 1 or argv[0] in ("-h", "--help"):
        usage()
    cmd, rest = argv[0], argv[1:]
    flags = [a for a in rest if a.startswith("--")]
    pos = [a for a in rest if not a.startswith("--")]
    known = {"prepare": set(), "conflicts": {"--classify-only"}, "guards": set(), "commit": set(), "status": set(), "abort": set(), "finish": {"--hub", "--push"}}
    if cmd not in known or any(f not in known[cmd] for f in flags):
        usage(f"unknown command or flag: {' '.join(argv)}")
    if cmd == "prepare" and len(pos) == 3:
        cmd_prepare(*pos)
    elif cmd == "conflicts" and len(pos) == 1:
        cmd_conflicts(pos[0], classify_only="--classify-only" in flags)
    elif cmd == "guards" and len(pos) == 2:
        cmd_guards(*pos)
    elif cmd == "commit" and len(pos) == 2:
        cmd_commit(*pos)
    elif cmd == "status" and len(pos) == 1:
        cmd_status(*pos)
    elif cmd == "abort" and len(pos) == 1:
        cmd_abort(*pos)
    elif cmd == "finish" and len(pos) == 2:
        cmd_finish(pos[0], pos[1], push="--push" in flags, hub=("--hub" in flags or os.environ.get("ADDIC_HUB") == "1"))
    else:
        usage(f"wrong argument count: {' '.join(argv)}")


if __name__ == "__main__":
    main(sys.argv[1:])
