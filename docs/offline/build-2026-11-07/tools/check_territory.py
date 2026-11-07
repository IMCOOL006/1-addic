"""1-addic offline build (7 November 2026): check that a lane changed only files of its own territory. Read-only.

  python check_territory.py <lane> <base>..<tip> [--wt <path>] [--map <territory.json>]
  python check_territory.py engine 1acf406..build/engine --wt C:/Users/ruchi/1-addic-wt/_int
  python check_territory.py --self-test

Reads coordination/territory.json (next to this folder; --map overrides) and runs `git diff --name-only --no-renames`
in the worktree (default: the main folder, env ADDIC_ROOT or C:/Users/ruchi/1-addic). <base>..<tip> is read as
<base>...<tip> (the diff from their merge base), so a base newer than the lane's cut point never counts the trunk's
own changes; a rename counts as a delete plus an add. Every changed path is
  OK       the lane's own file (lanes.<lane>.files) or glob (lanes.<lane>.globs);
  SHARED   an append point (shared.<path>) the lane may touch under its rule; the rule is printed;
  ERROR    another lane's file, a shared file that is not append-only for this lane, or a protected path;
  WARNING  nobody's file: the lane report must explain it.
Exit code: 0 no ERROR (warnings allowed), 1 at least one ERROR, 2 bad arguments (or git failed).
The last stdout line is one JSON object: {lane, range, files, ok, shared, errors, warnings}.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
MAP = HERE.parent / "coordination" / "territory.json"
ROOT = Path(os.environ.get("ADDIC_ROOT", r"C:\Users\ruchi\1-addic"))
LANE_RE = re.compile(r"^[a-z][a-z0-9-]+$")


def glob_re(pattern):
    """A path glob: ** crosses folders, * and ? stay inside one folder; a trailing / is a folder prefix."""
    if pattern.endswith("/"):
        return re.compile(re.escape(pattern) + ".*$")
    out, i = [], 0
    while i < len(pattern):
        c = pattern[i]
        if pattern.startswith("**/", i):
            out.append("(?:.*/)?")
            i += 3
        elif pattern.startswith("**", i):
            out.append(".*")
            i += 2
        elif c == "*":
            out.append("[^/]*")
            i += 1
        elif c == "?":
            out.append("[^/]")
            i += 1
        else:
            out.append(re.escape(c))
            i += 1
    return re.compile("^" + "".join(out) + "$")


def matches(pattern, path):
    return bool(glob_re(pattern).match(path))


def load_map(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def owns(spec, path):
    return path in spec.get("files", []) or any(matches(g, path) for g in spec.get("globs", []))


def classify(tmap, lane, path):
    """(kind, why) with kind OK | SHARED | ERROR | WARNING."""
    p = path.replace("\\", "/")
    for pat in tmap.get("protected", []):
        if matches(pat, p):
            return "ERROR", f"protected ({pat}): no lane touches it"
    sh = tmap.get("shared", {}).get(p)
    if sh:
        owner = sh.get("owner")
        co = sh.get("coOwners", [])
        if lane == owner and not co:
            return "OK", f"{owner}'s file (append point for the others)"
        if lane == owner or lane in co:
            return "SHARED", sh.get("rule", "")
        if sh.get("appendOnly"):
            return "SHARED", sh.get("rule", "")
        return "ERROR", f"{owner}'s file, not an append point for {lane}: {sh.get('rule', '')}"
    lanes = tmap["lanes"]
    if owns(lanes[lane], p):
        return "OK", "own file"
    for other, spec in lanes.items():
        if other != lane and owns(spec, p):
            return "ERROR", f"lane {other}'s file (chat {spec.get('chat', '?')})"
    return "WARNING", "nobody's file: explain it in the lane report"


def changed_files(wt, rng):
    if "..." in rng:
        a, b = rng.split("...", 1)
    else:
        a, b = rng.split("..", 1)
    p = subprocess.run(["git", "-C", str(wt), "diff", "--name-only", "--no-renames", f"{a}...{b}"], capture_output=True)
    if p.returncode != 0:
        return None, p.stderr.decode("utf-8", "replace").strip()[:300]
    return [x for x in p.stdout.decode("utf-8", "replace").splitlines() if x.strip()], None


def run(lane, rng, wt, map_path):
    try:
        tmap = load_map(map_path)
    except (OSError, ValueError) as e:
        print(f"cannot read the territory map {map_path}: {e}")
        return 2, None
    if lane not in tmap.get("lanes", {}):
        print(f"lane {lane} is not in {map_path} (lanes: {', '.join(sorted(tmap.get('lanes', {})))})")
        return 2, None
    files, err = changed_files(wt, rng)
    if files is None:
        print(f"git diff failed in {wt}: {err}")
        return 2, None
    res = {"lane": lane, "range": rng, "wt": str(wt), "files": len(files), "ok": [], "shared": [], "errors": [], "warnings": []}
    for f in files:
        kind, why = classify(tmap, lane, f)
        key = {"OK": "ok", "SHARED": "shared", "ERROR": "errors", "WARNING": "warnings"}[kind]
        res[key].append(f if kind == "OK" else {"path": f, "why": why})
    print(f"{lane} {rng}: {len(files)} files changed · {len(res['ok'])} own · {len(res['shared'])} shared (append points) · "
          f"{len(res['warnings'])} nobody's · {len(res['errors'])} errors")
    for e in res["errors"]:
        print(f"ERROR   {e['path']}  ({e['why']})")
    for s in res["shared"]:
        print(f"SHARED  {s['path']}  rule: {s['why']}")
    for w in res["warnings"]:
        print(f"WARNING {w['path']}  ({w['why']})")
    return (1 if res["errors"] else 0), res


def main(argv):
    if argv[:1] == ["--self-test"]:
        return self_test()
    wt, map_path, pos, i = ROOT, MAP, [], 0
    while i < len(argv):
        a = argv[i]
        if a in ("--wt", "--map") and i + 1 < len(argv):
            if a == "--wt":
                wt = Path(argv[i + 1])
            else:
                map_path = Path(argv[i + 1])
            i += 2
        elif a.startswith("--wt="):
            wt = Path(a[5:])
            i += 1
        elif a.startswith("--map="):
            map_path = Path(a[6:])
            i += 1
        elif a.startswith("-"):
            print(__doc__)
            return 2
        else:
            pos.append(a)
            i += 1
    if len(pos) != 2 or not LANE_RE.match(pos[0]) or ".." not in pos[1]:
        print(__doc__)
        return 2
    code, res = run(pos[0], pos[1], wt, map_path)
    print(json.dumps(res if res else {"lane": pos[0], "range": pos[1], "error": "bad arguments or git failed"}, ensure_ascii=True))
    return code


# ---------------------------------------------------------------------------------------------------- self-test
def rmtree(path):
    """shutil.rmtree that also removes git's read-only object files on Windows."""
    def onexc(func, p, _exc):
        try:
            os.chmod(p, 0o700)
            func(p)
        except OSError:
            pass
    shutil.rmtree(path, onexc=onexc)


def self_test():
    tmp = Path(tempfile.mkdtemp(prefix="ct-selftest-", dir=tempfile.gettempdir()))
    results = []

    def git(*a):
        p = subprocess.run(["git", "-C", str(tmp)] + list(a), capture_output=True, text=True)
        if p.returncode != 0:
            raise RuntimeError(f"git {' '.join(a)}: {p.stderr}")
        return p.stdout.strip()

    def write(rel, text):
        f = tmp / rel
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(text, encoding="utf-8", newline="\n")

    def case(name, ok, detail=""):
        results.append(ok)
        print(f"{'PASS' if ok else 'FAIL'}  {name}" + (f"  ({detail})" if detail and not ok else ""))

    def call(lane, rng):
        p = subprocess.run([sys.executable, str(Path(__file__).resolve()), lane, rng, "--wt", str(tmp)], capture_output=True, text=True)
        last = p.stdout.strip().splitlines()[-1] if p.stdout.strip() else "{}"
        try:
            return p.returncode, json.loads(last), p.stdout
        except ValueError:
            return p.returncode, {}, p.stdout

    try:
        subprocess.run(["git", "init", "-q", "-b", "build/offline-v1", str(tmp)], check=True)
        for k, v in (("user.name", "selftest"), ("user.email", "selftest@example.invalid"), ("core.autocrlf", "false"),
                     ("commit.gpgsign", "false")):
            git("config", k, v)
        write("offline/src/styles.css", "/* -- core -- */\n")
        write("offline/src/ui-core.js", "// core\n")
        write("README.md", "# x\n")
        git("add", "-A")
        git("commit", "-q", "-m", "base")
        base = git("rev-parse", "HEAD")
        git("switch", "-q", "-c", "build/engine")
        write("offline/src/engine.js", "// engine\n")
        write("offline/tests/engine-dates.test.mjs", "// t\n")
        git("add", "-A")
        git("commit", "-q", "-m", "engine own files")
        clean_tip = git("rev-parse", "HEAD")
        write("offline/src/styles.css", "/* -- core -- */\n/* -- engine -- */\n")
        write("offline/src/ui-core.js", "// core, edited by engine\n")
        write("docs/PLAN.md", "x\n")
        write("tools/notes.txt", "x\n")
        write("package.json", "{}\n")
        git("add", "-A")
        git("commit", "-q", "-m", "engine strays")
        dirty_tip = git("rev-parse", "HEAD")
        git("switch", "-q", "build/offline-v1")
        write("offline/src/ui-core.js", "// core moved on\n")
        git("add", "-A")
        git("commit", "-q", "-m", "trunk moves")
        newer_base = git("rev-parse", "HEAD")

        rc, res, so = call("engine", f"{base}..{clean_tip}")
        case("own file + own glob -> exit 0, 2 OK", rc == 0 and len(res.get("ok", [])) == 2 and not res.get("errors"), so)
        rc, res, so = call("engine", f"{base}..{dirty_tip}")
        errs = {e["path"] for e in res.get("errors", [])}
        shared = {s["path"] for s in res.get("shared", [])}
        warns = {w["path"] for w in res.get("warnings", [])}
        case("another lane's file -> ERROR", "offline/src/ui-core.js" in errs, so)
        case("protected path -> ERROR", "docs/PLAN.md" in errs, so)
        case("package.json by a third lane -> ERROR", "package.json" in errs, so)
        case("styles.css -> SHARED with its rule", "offline/src/styles.css" in shared and "rule:" in so, so)
        case("nobody's file -> WARNING", warns == {"tools/notes.txt"}, so)
        case("any ERROR -> exit 1", rc == 1, f"rc={rc}")
        rc, res, so = call("engine", f"{newer_base}..{clean_tip}")
        case("base newer than the cut -> the trunk's own change is not counted (exit 0)", rc == 0 and not res.get("errors"), so)
        rc, res, so = call("tests-docs", f"{base}..{dirty_tip}")
        case("package.json by tests-docs -> SHARED", "package.json" in {s["path"] for s in res.get("shared", [])}, so)
        rc, res, so = call("core", f"{base}..{dirty_tip}")
        case("styles.css by its owner core -> OK", "offline/src/styles.css" in res.get("ok", []), so)
        rc, res, so = call("nosuchlane", f"{base}..{clean_tip}")
        case("unknown lane -> exit 2", rc == 2, f"rc={rc}")
        rc, res, so = call("engine", "not-a-range")
        case("bad range -> exit 2", rc == 2, f"rc={rc}")
        case("glob * stays in one folder", not matches("offline/tests/engine-*.test.mjs", "offline/tests/engine-x/y.test.mjs")
             and matches("offline/tests/helpers/**", "offline/tests/helpers/a/b.mjs"))
    except Exception as e:  # noqa: BLE001
        case("self-test setup", False, repr(e))
    finally:
        rmtree(tmp)
    ok = all(results) and bool(results)
    print(f"check_territory self-test: {'PASS' if ok else 'FAIL'} ({sum(results)}/{len(results)})")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
