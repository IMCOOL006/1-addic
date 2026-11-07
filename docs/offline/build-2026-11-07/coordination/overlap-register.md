# overlap-register · the shared files, their owners and their append points

A lane touches only its own files (`territory.json`). The files below are shared by design: another lane appends under its own banner at the listed point and never edits above it; anything else goes to the owner by outbox. The merge script resolves an append conflict by keeping both regions only when every incoming region carries the lane's banner.

| File | Owner | Append point for others | Banner |
|---|---|---|---|
| `offline/build.mjs` | `core` (U-01) | one line per new source file between `// -- parts --` and `// -- end parts --`, in the order of BUILD-PLAN.md 3.1 (content files, engine, store, actions, ui-core, ui-*.js, boot) | the parts list itself |
| `offline/src/styles.css` | `core` (U-02) | a new section at the end under `/* -- <lane> -- */`; tokens are never redefined | `/* -- <lane> -- */` |
| `offline/src/shell.html` | `core` | by outbox only; pages mount into `#main`; the SOS button and the nav carry `data-tour` | — |
| `offline/src/ui-core.js` | `core` (U-03) | by outbox only; pages register through `UI.pages[firstSegment] = (ctx) => Node` from their own files | — |
| `offline/src/content-core.js` | `content` (U-31a adds `/* -- additions -- */` at the end, before the module.exports guard) | append-only after that line; other lanes ask by outbox | `// -- <lane> --` |
| `offline/src/engine.js`, `store.js`, `actions.js` | `engine`, `core`, `actions-sos` | by outbox; a UI lane that needs a new rule writes the pure function in its own `ui-*.js` for the day and files a request | — |
| root `package.json` | `core` creates it (U-01) and owns every key but two; `tests-docs` owns `scripts` and `devDependencies` (U-34, U-37) | the merge script merges by key owner; both commit it by path | — |
| `package-lock.json` | `tests-docs` | — | — |
| `README.md`, `CLAUDE.md` | `tests-docs` (U-37) | append-only sections `## Offline edition` | the section heading |
| `docs/offline/build-2026-11-07/*` | the HUB and the chats (one writer per file) | — | — |

Cross-lane shapes (the contracts every lane builds on before the code merges): BUILD-PLAN.md 3.2 (Engine, Store, Actions, UI core), 3.4 (rows), 3.5 (routes), 3.6 (lessons), 3.7 (events and XP), 3.8 (exercises), 3.9–3.11 (rules). A change to a shape goes to its owner by outbox and into `tracks/<CHAT>/contracts/<lane>.md`.

Protected (never touched by any lane): `main`, `origin/main`, `claude/*`, `docs/PLAN.md`, `docs/BUILD-GUIDE.md`, `docs/decisions/0001`–`0021`, `docs/book/`, `docs/program/`, `scripts/`, `data/`, `.claude/settings.json`, the pharma program and its launcher.
