# 1-addic

Goal: turn an addiction-recovery skills workbook (a book) into a private, phone-first recovery app.
The stack is proposed in `docs/PLAN.md` but not yet approved. Once it's set up, update this file with the build, test and run commands.

## Where this runs

This repo is mostly worked on in **Claude Code on the web** (cloud sessions at claude.ai/code).
In the cloud:

- Each session starts from a fresh clone on a Linux VM. Anything that isn't committed and pushed is lost when the session ends.
- `.claude/hooks/session-start.sh` installs dependencies when a session starts. It detects `package.json` and `requirements.txt` / `pyproject.toml`. Add new stacks there; don't rely on manual installs.
- Secrets go in the claude.ai environment's environment variables. Never commit them, and never commit `.env` files.
- Work on a branch and push it. Open the PR from the claude.ai UI ("Create PR"), because `gh pr` is blocked by the cloud proxy. Don't push straight to `main`.
- Keep scripts POSIX/bash with LF line endings (enforced by `.gitattributes`). The repo is also edited on Windows.

## Conventions

- Put source workbooks (`.xlsx` etc.) in `data/`. Large or private workbooks should not be committed. Describe their structure in `docs/` instead.
- Keep commits small and descriptive.

## Project docs

- `docs/PLAN.md` is the product and execution plan. It's a draft under review: don't start building until the owner approves it, and record settled decisions as ADRs in `docs/decisions/`.
- `docs/BUILD-GUIDE.md` is the step-by-step build guide, with a ready-to-paste prompt and a done-when checklist for every step. Its "house rules" apply to all build work.
- `docs/book/` holds paraphrased reference notes on the source workbook (one file per chapter, plus `exercises.md` and `glossary.md`). Read these instead of re-reading the epub.
- The source book is copyrighted. Never commit the epub, extracted text, or verbatim passages. If you need to re-extract it, put the epub in `data/` (git-ignored) and run `python3 -I scripts/epub_to_text.py data/<book>.epub <scratch-dir>`.
