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

- `docs/START-HERE.md` explains where the project stands, how to continue on the owner's own computer (where the session-start hook doesn't run), and the next steps with their prompts.
- `docs/PLAN.md` is the product and execution plan. It's a draft under review: don't start building until the owner approves it, and record settled decisions as ADRs in `docs/decisions/`.
- `docs/BUILD-GUIDE.md` is the step-by-step build guide, with a ready-to-paste prompt and a done-when checklist for every step. Its "house rules" apply to all build work.
- `docs/book/` holds paraphrased reference notes on the source workbook (one file per chapter, plus `exercises.md` and `glossary.md`). Read these instead of re-reading the epub.
- The source book is copyrighted. Never commit the epub, extracted text, or verbatim passages. If you need to re-extract it, put the epub in `data/` (git-ignored) and run `python3 -I scripts/epub_to_text.py data/<book>.epub <scratch-dir>`.
- `docs/1-addic-execution-plan.docx` is the readable execution plan for the owner, designers, clinical reviewer and testers. Don't edit it by hand: it is generated from `scripts/execution_plan/content.md`, `docs/BUILD-GUIDE.md` and `docs/book/exercises.md` by `node scripts/build_execution_plan_doc.js`, and checked by `python3 scripts/check_execution_plan_doc.py`. Rebuild it after changing the plan or the guide.
- `docs/1-addic-decisions-needed.docx` is the owner's questionnaire: every decision and input the project needs, with options and recommendations. Generated from `scripts/execution_plan/decisions.md` by `node scripts/build_decisions_doc.js`; check with `python3 scripts/check_execution_plan_doc.py docs/1-addic-decisions-needed.docx --briefs-only`.
- `docs/program/` holds the Early Access plan and the proposed build program (`EARLY-ACCESS-AND-PROGRAM.md`, rendered to `docs/1-addic-early-access-and-program.docx` by `node scripts/build_doc.js`). Owner inputs are in `docs/decisions/owner-inputs.md`. The program's files (protocol, status, outboxes, agents, gates) are created only after the owner approves the proposal.

## Offline edition

The single-file edition (ADR 0022) lives in `offline/`. Node 22; the only dependency is the pinned `playwright` devDependency for the browser suite.

- Build: `npm run build` (`node offline/build.mjs`) writes `offline/1-addic.html` under a CSP with `connect-src 'none'`.
- Test: `npm test` (every `offline/tests/*.test.mjs` except `browser.test.mjs`); `npm run test:browser [-- --grep <name>]` (Playwright over Chrome, fallback bundled Chromium; offline, 390 px; fails on any console error or non-file request; skips by name when the browser, the file, a route or a hook is missing).
- Screenshots: `npm run screens` (`node offline/tests/screens.mjs`) writes `offline/docs/images/<slug>-phone.png` (390x844) and `<slug>-desktop.png` (1280x800) at 300 DPI from the built file, seeded through Settings > Your data > Load sample data; skips by name when the file, the browser, a route or a hook is missing. Guide: `python offline/docs/build_guide.py` builds `offline/docs/1-addic-Guide.docx` (needs python-docx and the word-doc-generator skill's `gen_docx.py`).
- All gates: `npm run check` (build, test, test:browser, guide). Validate and guards run in the build program's `gates.py`.
- Layout: `offline/src/` parts (inlined in the order of `build.mjs`'s parts list), `offline/tests/` (Node tests, `browser.test.mjs`, `helpers/`), `offline/docs/` (the guide), `offline/README.md` (for the person using it).
- Rules: no network call, tracker or remote font ever; data stays on the device; SOS is never gated; original words only (never the source book's text); every DOM hook the browser suite drives is in `offline/tests/helpers/hooks.mjs`. During a build program each lane edits only its own files and the shared append points.
- Tests as of 2026-11-09 (V-27 and its fix round C1, on the tests-docs lane): `npm test` 723 checks in 16 files, 722 pass, 1 fail (`contrast: .coach-sos (dark)`, a real red owed by game-tutorials); `npm run test:browser` 29 flows, 29 pass, 0 skip in one full run (the names are in `offline/README.md`, For developers). Test names are failure identities: keep them.
- Release copy: `offline/releases/1-addic-v1.1.html` is the file at tag `offline-v1.1` (f69bc68a, 1113578 bytes), kept for analysis (R-O-5). Never edit it; build fresh with `npm run build`.
