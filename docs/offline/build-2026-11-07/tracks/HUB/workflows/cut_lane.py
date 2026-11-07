"""1-addic offline edition build (7 November 2026): cut ONE lane worktree from the trunk base (adapted from the Kriya
pharma program's pharma_cut.py).

Usage:  python cut_lane.py <lane> <base sha>
  e.g.  python cut_lane.py engine 1acf406

What it does (the build chat runs it once per lane, BEFORE the lane workflow; the workflow cannot read the disk and its
first builder stops if the worktree is missing):
  - from the repository C:/Users/ruchi/1-addic: `git worktree add -b build/<lane> C:/Users/ruchi/1-addic-wt/<lane> <base>`;
  - refuses if the worktree path exists or the branch build/<lane> exists (never reuses, never deletes);
  - if package-lock.json exists at the base: `npm ci --prefer-offline --no-audit --no-fund` in the worktree; else nothing
    to install (no database, no .env, no Docker in this program);
  - log under C:/Users/ruchi/1-addic-wt/_logs/cut/<lane>.log; prints the new tip and the worktree path.
Never touches the trunk checkout's files, the base worktree (1-addic-wt/_base) or another lane. Never pushes.
Exit codes: 0 the worktree is cut and ready; 1 refused, nothing created (usage, a bad lane id or base, the path or the
branch exists, the base is not a commit); 2 a command failed after the cut began (the log says which; the worktree may
exist half-ready and is never deleted by this script: look, then remove it by hand or finish the install there).
"""
import re
import subprocess
import sys
from pathlib import Path

REPO = Path(r"C:\Users\ruchi\1-addic")
WT = Path(r"C:\Users\ruchi\1-addic-wt")
LANE_RE = r"[a-z][a-z0-9-]+"


class Refused(Exception):
    """Nothing was created: exit 1."""


class Failed(Exception):
    """A command failed after the cut began: exit 2."""


def _shell(cmd):
    # npm is npm.cmd on Windows: it needs the shell there (pharma_cut.py did the same for pnpm).
    return sys.platform == "win32" and cmd[0] == "npm"


def run(cmd, cwd, log):
    log.write(f"\n$ {' '.join(cmd)}  (in {cwd})\n")
    log.flush()
    p = subprocess.run(cmd, cwd=str(cwd), stdout=log, stderr=subprocess.STDOUT, shell=_shell(cmd))
    if p.returncode != 0:
        raise Failed(f"FAILED ({p.returncode}): {' '.join(cmd)}; see {log.name}")


def capture(cmd, cwd):
    p = subprocess.run(cmd, cwd=str(cwd), capture_output=True, text=True, shell=_shell(cmd))
    return p.returncode, (p.stdout or "").strip(), (p.stderr or "").strip()


def cut(lane, base):
    if not re.fullmatch(LANE_RE, lane):
        raise Refused(f"lane must look like engine or actions-sos (^[a-z][a-z0-9-]+$), got {lane!r}")
    if not re.fullmatch(r"[0-9a-f]{7,40}", base):
        raise Refused(f"base must be a commit sha (7 to 40 hex chars: the BASE line of status-HUB.md), got {base!r}")
    wt = WT / lane
    branch = f"build/{lane}"
    if not (REPO / ".git").exists():
        raise Refused(f"{REPO} is not a git checkout: the cut runs from the repository")
    if wt.exists():
        raise Refused(f"{lane}: {wt} exists; refused (never reused, never deleted by this script)")
    rc, out, _ = capture(["git", "rev-parse", "--verify", "--quiet", f"refs/heads/{branch}"], REPO)
    if rc == 0 and out:
        raise Refused(f"{lane}: the branch {branch} exists at {out[:12]}; refused")
    # No ^{commit} here: under a shell on Windows cmd.exe eats the caret (pharma_cut.py's lesson).
    rc, out, err = capture(["git", "rev-parse", "--verify", "--quiet", base], REPO)
    rc2, kind, err2 = capture(["git", "cat-file", "-t", base], REPO)
    if rc != 0 or rc2 != 0 or kind != "commit" or not out:
        raise Refused(f"{lane}: the base {base} is not a commit in {REPO} ({err or err2 or kind or out or 'unknown'})")
    base_full = out
    logs = WT / "_logs" / "cut"
    logs.mkdir(parents=True, exist_ok=True)
    log_path = logs / f"{lane}.log"
    with open(log_path, "w", encoding="utf-8", newline="\n") as log:
        log.write(f"cut_lane {lane} base {base_full} -> {wt} on {branch}\n")
        run(["git", "worktree", "add", "-q", "-b", branch, str(wt), base_full], REPO, log)
        if (wt / "package-lock.json").exists():
            run(["npm", "ci", "--prefer-offline", "--no-audit", "--no-fund"], wt, log)
            installed = "npm ci done"
        else:
            installed = "no package-lock.json at the base: nothing to install"
        log.write(f"\n{installed}\n")
    rc, tip, err = capture(["git", "rev-parse", "--short", "HEAD"], wt)
    if rc != 0:
        raise Failed(f"{lane}: cannot read the tip of {wt}: {err}")
    print(f"{lane}: {wt} on {branch} at {tip} (base {base_full[:12]}; {installed}) - ready; log {log_path}")
    return tip


def main(argv):
    if len(argv) != 2:
        print(__doc__, file=sys.stderr)
        return 1
    try:
        cut(argv[0], argv[1])
    except Refused as e:
        print(f"REFUSED {e}", file=sys.stderr)
        return 1
    except Failed as e:
        print(f"FAILED {e}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
