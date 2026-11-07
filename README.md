# 1-addic

Workbook to app: a recovery-skills app based on an addiction recovery workbook.

- **Start here** (where things stand, setup on your own computer, next steps): [`docs/START-HERE.md`](docs/START-HERE.md)
- Plan (draft, under review): [`docs/PLAN.md`](docs/PLAN.md)
- Step-by-step build guide with prompts: [`docs/BUILD-GUIDE.md`](docs/BUILD-GUIDE.md)
- Source-book reference notes: [`docs/book/`](docs/book/README.md)

This project is developed with [Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web).
See `CLAUDE.md` for how cloud sessions are configured. Dependencies are installed automatically by `.claude/hooks/session-start.sh`.

## Offline edition

`offline/1-addic.html` is the whole app in one file: it opens from `file://` on a phone or a computer, works with no network, and is built to keep every record in that browser on that device (the data layer that saves them is planned). How to build it, put it on a phone, back it up and read the saved label: [`offline/README.md`](offline/README.md). The decision is [ADR 0022](docs/decisions/0022-offline-edition.md).

- `npm run build` builds the file from `offline/src/`.
- `npm test` runs the Node tests; `npm run test:browser` runs the browser flows (Chrome or Chromium, offline, 390 px).
- `npm run check` runs build, tests, the browser flows and the guide (`python offline/docs/build_guide.py`).
- The guide: `offline/docs/1-addic-Guide.md`, built to `offline/docs/1-addic-Guide.docx`.
