# 1-addic · Offline edition · Build program plan (7 November 2026)

> **V3 (2026-11-08 02:30 IST):** offline-v1.0 (45473b2) and offline-v1.1 (f69bc68) are tagged; every lane of this plan is merged. The next edition is planned in `PLAN-V3.md` (units, lanes, the status layer's contract, hours, decisions) from `V3-IMPROVEMENTS.md`; sections 4 to 8 of this file still bind.

**Written by:** the HUB chat (session `26196777`), 06:25–07:00 IST, from `docs/offline/BUILD-PLAN.md` (the specification: architecture, data model, contracts, exercise and route tables, the proposed cut). This file holds the program's arithmetic, lanes, tracks, hours, rules and decisions. The spec stays where it is; every brief cites it by section.

**The goal in one line.** One self-contained HTML file, `offline/1-addic.html`, assembled by `node offline/build.mjs` from `offline/src/*`, running the recovery-skills app completely offline from `file://` on any phone or computer, with Node and browser tests and a guide (`offline/docs/1-addic-Guide.md` → `.docx` with screenshots). Tag `offline-v1.0` at today's green; the lanes continue toward `offline-v1.1` under the same gates.

---

## 1. The shape

| Piece | Here |
|---|---|
| Repository | `C:\Users\ruchi\1-addic` (one repo, no database, no Docker). The main folder has the **trunk `build/offline-v1`** checked out; the chats commit program files there under `docs/offline/build-2026-11-07/` (`<docs>`). |
| Trunk | `build/offline-v1`, cut from `offline-plan` at `1acf406` (main + the plan + the settings fix + `content-core.js` + `content-lessons-a.js`). Pushed to origin by the HUB. `main` is never touched. |
| Lanes | branch `build/<lane>`, worktree `C:\Users\ruchi\1-addic-wt\<lane>` (`<wt>`), cut from the `BASE:` line of `status-HUB.md` with `tracks/HUB/workflows/cut_lane.py`. |
| Base worktree | `<wt>\_base` at the BASE-READY tip, read-only. Integration worktree `<wt>\_int` (detached between merges). Logs `<wt>\_logs\`, locks `<wt>\_locks\`. |
| HUB | this chat (Fable 5.1): plans, tooling, base, slots, merges, gates on the merged tree, trunk pushes, board, quiet window, tag, hand-off. Never builds a unit, never edits a lane branch. |
| Build chats | **CORE** and **SCREENS** (Opus 5.5, `claude --model claude-opus-5-5 --name <TRACK>`, prompt from `KICKOFF-PROMPTS.md`, first word `ultracode`). Each owns five lanes; scouts, builds, checks and reviews them as workflows with sub-agents; says READY per lane on its status file; never merges or pushes. |
| Sub-agents | `.claude/agents/`: `scout` (sonnet, low, 60), `lane-builder` (opus, high, 80), `lane-builder-flagged` (opus, xhigh, 80: lanes `core` and `actions-sos`), `lane-checker` (opus, medium, 80, read-only), `lane-reviewer` (opus, max, 80, read-only). |
| Launcher | `<docs>/tools/fresh_chat_launcher.py --loop`, the owner's plain background process; state `%LOCALAPPDATA%\1-addic-hub\launcher\`. Starts CORE and SCREENS once `status-HUB.md` carries `BASE-READY:` and `TRACKS-ALLOWED:` names them; restarts any chat that hands over. |

---

## 2. The lanes and units

Hours are the spec's estimates (a lane moves about one estimated hour per clock hour). ★ = the slice (the first batch, one unit). Tier 1 = the chain that makes the file usable end to end; tier 2 = depth. Files per lane: `coordination/territory.json`; units in detail: BUILD-PLAN.md section 5.

### Track CORE

| Lane | Tier | Flagged | Units in build order (hours) | Hours | Starts |
|---|---|---|---|---|---|
| `core` | 1 | yes (encryption, the person's data) | ★ U-01 build pipeline and shell (1.5) · U-03 UI core and router (2.5) · U-02 tokens and components (2) · U-04 Store with encryption and lock (3) | 9 | first slot |
| `engine` | 1 | no | ★ U-05 time, ids, game derivations (3) · U-06 roadmap, reveal, Explorer, tips, quests, artifacts, plan prefill (2.5) · U-07 insights, radar, planner, review, SOS sequence, crisis keywords (2.5) · U-08 export/import/validate, ics, validateContent, npm test wiring (1.5) | 9.5 | first slots |
| `actions-sos` | 1 | yes (safety copy) | ★ U-09 Actions (3) · U-10 SOS screens (4.5) · U-11 lock screen and onboarding (2.5) | 10 | first slots (on the Store contract until `core` U-04 merges) |
| `learn` | 1 | no | ★ U-12 exercise engine (3.5) · U-13 lesson player and checkpoint (2.5) · U-14 roadmap and glossary (2.5) | 8.5 | when a slot frees (on the UI contract until `core` U-03 merges) |
| `tests-docs` | 1 / 2 | no | ★ U-34 browser harness (3) · U-37 docs true (1) · U-36a guide skeleton and pipeline (1.5) · U-35 screenshots (1.5, tier 2) · U-36b guide Part 3 (2.5, tier 2) | 9.5 | when `core` U-01 is merged |

### Track SCREENS

| Lane | Tier | Flagged | Units in build order (hours) | Hours | Starts |
|---|---|---|---|---|---|
| `content` | 1 / 2 | no | ★ U-31a exercises M0–M3 need (1) · U-31b remaining exercises (2) · U-29 lessons M4–M6 (2.5) · U-30 lessons M7–M10 (2.5; section 2 rule 4 with extra care) · U-32 practices and games (2) · U-33 sample data (1.5) | 11.5 | first SCREENS slot (no code dependency) |
| `today-track` | 1 / 2 | no | ★ U-15 Today (3) · U-16 Track (2.5) · U-17 Insights (2, tier 2) · U-18 Harbor scene (2, tier 2) | 9.5 | on the contracts; real code when `core`, `engine` merge |
| `workbook-settings` | 1 / 2 | no | ★ U-19 Settings (3) · U-20a Reasons Card and Support Network (1.5) · U-20b Workbook browser and artifacts (2.5, tier 2) · U-21 My Recovery Plan (2, tier 2) | 9 | on the contracts |
| `actions` | 2 | no | ★ U-22 planner (3) · U-23 Battle Plans, ics, debrief (2) · U-24 Weekly Review with forecast check (2.5) · U-25 quests, rewards, Prediction Lab, to-dos, practices player (3) | 10.5 | only when no tier 1 lane waits for a slot |
| `game-tutorials` | 2 | no | ★ U-27 guidance engine (3) · U-26 game surfaces (2) · U-28 tools and mini-games (4) | 9 | only when no tier 1 lane waits for a slot |

**Totals:** ≈ 96 estimated hours; tier 1 ≈ 54; tier 2 ≈ 42. Ten lanes → two build chats.

**The chain (tier 1 order):** U-01 → U-03 → U-05 → U-09 → U-04 → U-12 → U-10 → U-15 → U-16 → U-19 → U-20a → U-11 → U-13 → U-14 → U-31a → U-34 → U-37 → U-36a. A tag that holds the whole chain is a file a person can open, set up, use in a craving, log in, learn M0–M3 in, back up and read about.

**Dependencies.** Every UI lane builds on the contracts of BUILD-PLAN.md 3.2 and switches to the real `ui-core.js`, `store.js`, `engine.js`, `actions.js` when the board shows `core` and `engine` merged. `content` and `learn` depend only on 3.6–3.8. `tests-docs` U-34 needs U-01 merged; U-35 and U-36b need the screens, so they run last. A shape another lane needs goes to its owner by outbox the moment it is known.

---

## 3. The arithmetic and the day

T = **06:25 IST** (the HUB's first step). Six clock hours → **12:25**.

| When | What |
|---|---|
| 06:25–07:40 | S-00 tooling (copied from the method's programs, adapted), S-01 trunk and base. **BASE-READY ≈ 07:40.** |
| 07:40–08:25 | Scouts: one per lane, all at once, in each chat's first hour. Slots asked. |
| 08:25 → | Lanes start, tier 1 first: `core`, `engine`, `actions-sos` (CORE); `content` (SCREENS, when its chat runs). |
| ≈ 09:55 | First slices READY-SLICE; the HUB merges each the moment it appears (30–60 min each). |
| **10:55 FREEZE** | Nothing new for the tag after it except what is READY or READY-SLICE on a status file by then, and fixes by name. The tag's list goes on the board. |
| 10:55–11:40 QUIET | `QUIET: running` on the board; the full suites on the merged trunk (build, every Node test, validate, guards, the browser smoke if the harness exists), detached through the lock; every failure classified by name against the base; fixes by territory, one line each, merged. No lane runs anything heavy. |
| **11:55 TAG** | `offline-v1.0`, annotated, on the trunk, pushed. When the hours are fixed, a red is named rather than no tag. |
| 12:10 | Hand-off note; `STATE: HANDOVER`; every lane branch pushed as a backup; the launcher paused. |
| 12:25 | Day ends. Lanes continue on their branches toward `offline-v1.1` under the same gates; the owner's findings from the walk go to them. |

**Capacity.** Slots × the hours between the lanes' start (08:25) and the freeze (10:55) = slots × 2.5 estimated hours, plus the slices' overhead. With three slots that is about 7.5 estimated hours of units. **What `offline-v1.0` can honestly hold:** U-01 (build pipeline, shell, the CSP head), U-03 (UI core and router), U-05 (engine: ids, dates, the game derivations with their tests), and U-09 (Actions in Node memory mode) if the third slot holds; the harness U-34 only if U-01 merges by about 09:30. **What moves to `offline-v1.1`:** everything else, by name on the board at the freeze: the Store (U-04), the SOS screens (U-10), onboarding and the lock screen (U-11), the exercise engine and lessons (U-12 to U-14), Today and Track (U-15, U-16), Settings and the Workbook (U-19 to U-21), the content (U-29 to U-33), the guide and the screenshots (U-35 to U-37), every tier 2 unit. The owner is promised the arithmetic, not the wish.

---

## 4. Slots and memory

- Slots come from measured free memory: `max(0, floor((free − 4.0 GB floor − 1.5 GB per build chat still to start) / 0.7 GB))`, from the lowest of the last three samples in `coordination/lane-widening.md` (the launcher's loop samples every ten minutes; the HUB samples by hand until it runs). Under 4.0 GB free the newest lane pauses at its next commit. The machine is shared with the pharma program (about 14–19 GB in use) until its tag about 15:30.
- `SLOTS-ALLOWED:` and one `SLOTS: <lane> slot=<n> granted <time>` line per granted lane live on `status-HUB.md`. A slot before a lane; tier 1 before tier 2 always; a tier 2 unit starts only when no tier 1 lane waits for a slot.
- `TRACKS-ALLOWED:` on `status-HUB.md` tells the launcher which build chats may run: CORE at BASE-READY; SCREENS when the sample leaves room for a second chat and at least one more lane (about 6.5 GB free with CORE's lanes granted).

---

## 5. Gates, by name

The scripts: `<docs>/tools/gates.py --wt <worktree> --lane <lane> [--files a,b] [--full] build test validate browser guards docs` (one `GATE <name> <GREEN|RED|SKIP|VOID> ...` line per gate, `FAIL <name>` lines, the last line JSON; it takes the repository lock `<wt>\_locks\1-addic.lock` in arrival order for the suites); `<docs>/tools/check_territory.py <lane> <base>..<tip> --wt <worktree>`. Logs on disk under `<wt>\_logs\gates\<lane>\`, cited by path.

| Gate | What | Judged by |
|---|---|---|
| build | `node offline/build.mjs` | exit 0, the file exists, the CSP meta present, size printed |
| test | `node --test` on the lane's test files (`--full`: every `offline/tests/*.test.mjs`, HUB only, quiet window) | failure names against `baselines.md` (empty on the base) |
| validate | `Engine.validateContent()` over every content file | zero errors by name |
| browser | `npm run test:browser` scoped to the lane's tests; the full suite once, in the quiet window, by the HUB | failure names |
| guards | CSP present; `https?://` only in `Content.resources`/`references`; no `innerHTML =` with data; theme parity; every `[data-tour]` target exists | zero findings by name |
| docs | `python offline/docs/build_guide.py` | exit 0, every referenced image exists |

**Baseline:** the base has no code beyond the two content files; every gate on the base is SKIP by name; the baseline of failures is empty (`coordination/baselines.md`). A lane is green when every test it adds passes and nothing green on the base is red on the branch, judged by name, never by count or exit code.

---

## 6. The rules that bind every chat

1. Nobody but the HUB moves or pushes the trunk; a build chat merges nothing into it.
2. A slot before a lane. A lane is cut from `BASE` on `status-HUB.md`, never from `offline-plan`, `main` or another lane; a lane that needs unmerged work builds on the contract and switches to the real code when the board shows the merge.
3. Tier 1 before tier 2, always; a tier 2 unit starts only when no tier 1 lane waits for a slot.
4. Territory: a lane touches only its own files (`coordination/territory.json`); shared files are append-only under the banner `// -- <lane> --` (or `/* -- <lane> -- */` in CSS) at the listed append points (BUILD-PLAN.md section 9: `build.mjs` parts list, `styles.css` end sections, `content-core.js` after `/* -- additions -- */`, `package.json` keys by owner, `README.md` and `CLAUDE.md` sections `## Offline edition`); a file that is not yours is changed by asking its owner through your outbox.
5. No new failure by name. Two reviewers on every flagged lane before its merge. Reports under 20 KB, evidence by path. Honest reports: green only when the exit code or the failure names were read; "fixed" only with a SHA; say what you verified and what you assumed.
6. Commits at least every 45 minutes, the unit in the message; the message from a file, ending with the session's trailers (`Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`, `Claude-Session: <the chat's session link>`); by explicit path, never `git add -A`; hub files committed as you go with `python <docs>/tools/hub_commit.py` (it commits only the paths named); pushed only by the HUB.
7. Never force-push, rebase a pushed branch, stash, or check out over uncommitted work; never delete a branch or a worktree before the remote shows its tip; never touch what the GOAL protects: `main`, `origin/main`, the `claude/*` branches, `docs/PLAN.md`, `docs/BUILD-GUIDE.md`, `docs/decisions/0001`–`0021`, `docs/book/`, `docs/program/`, `scripts/`, `data/`, `.claude/settings.json`, the pharma program and its launcher (`%LOCALAPPDATA%\kriya-hub\`).
8. Time stamps from `date` or the commit time, never estimated.
9. No secret in a repository, a prompt or a chat. Never a network call or a tracker in the app. Never a word of the source book's text (ADR 0002).
10. The owner's word is needed for: starting or installing the launcher or any persistence (the `!` lines go to the owner); any settings file; anything outside the program's own branches; a deletion the rules do not already allow. Pushing `build/offline-v1`, the lane branches and the tag needs no word (the GOAL says so); `main` is never pushed.
11. Questions to the owner: a default plus a line on the board; batched, each with the time its default applies. A ruling is recorded in `outbox-OWNER.md` with its stamp and the owner's words before anyone acts on it.
12. The product rules of BUILD-PLAN.md section 2 (the house rules of `docs/BUILD-GUIDE.md`; original content only; tone; content safety and restraint; verify flags; nothing ever decreases) bind every lane. A builder who is unsure writes the shorter version.

---

## 7. How a lane is built, in short

Scouts first (one per lane, all at once, the chat's first hour): brief under 15 KB, contract, a note per unit; `SLOTS-ASKED:`. A granted lane: `python <docs>/tracks/HUB/workflows/cut_lane.py <lane> <BASE sha>`, then the lane workflow `Workflow({scriptPath: 'C:/Users/ruchi/1-addic/docs/offline/build-2026-11-07/tracks/HUB/workflows/lane.js', args: {...the lane's object from lane_args.json, base, slot, session, now, sliceRun: true}})`. The slice rule: the first batch is one unit; when it is committed and green on the branch the chat writes `LANE: <lane> READY-SLICE <tip>`; the HUB merges it like a lane; the lane continues (no rebase). A finished lane: `LANE: <lane> READY <tip>`, the report under 20 KB in `tracks/<CHAT>/lane-reports/<lane>.md`. A red from the HUB is fixed on the branch within the hour it is read, before any new unit; two rounds at most, then the lane leaves the tag (the chain's lanes are fixed, because the chain needs them). A question is a default plus an outbox line, never a wait. The hand-off note (`done / in flight / next / files touched / the one thing to know / evidence / questions`) is a builder's only output and the next builder's only input.

Workflow facts: the script lives under the repo folder with LF endings and no clock, filesystem or random call (`args.now` is the stamp); a workflow agent cannot wait more than about ten minutes in a lock queue; results stay under a few KB; never message a running workflow's agent by id (put rules in the args, or stop and relaunch with `done`); `resumeFromRunId` works in the same session only.

---

## 8. How the HUB merges

One lane at a time, READY-SLICE and READY alike, always the tip the status file names: `python <docs>/tracks/HUB/workflows/merge_lane.py prepare <lane> <tip> <base>` (territory check; `int/<lane>-<tip7>` from the trunk tip in `<wt>\_int`; `git merge --no-ff --no-commit build/<lane>`), `conflicts` (append conflicts keep both regions when every incoming region carries the lane's banner; `package.json` merged by key owner; anything else back to the lane), `guards` (territory, build, the lane's tests, validate, guards on the merged tree, judged by name), `commit` (message file with the trailers), `finish --hub --push` (the trunk fast-forwarded in the main folder, docs-only trunk commits folded in first, the trunk and the lane branch pushed). `BASE:` updated, a `MERGED:` line, a "from the HUB" note on the lane's status file, the next queued lane. Never hand over with a gate running: a fresh HUB restarts it first.

---

## 9. Decisions (defaults apply unless the owner answers before the lanes start, 08:25)

| # | Question | Default | Applies |
|---|---|---|---|
| O1 | File and app name | `1-addic.html`, title "1-addic"; discreet title "Notebook" | `core` U-01 |
| O2 | PIN by default? | Offered in onboarding and recommended, not forced | `actions-sos` U-11 |
| O3 | Region files | India (`in`) with every number "please verify", plus an international directory | `actions-sos` U-10 |
| O4 | Voice | Device `speechSynthesis` with on-screen text always; no recorded audio | U-25, U-10 |
| O5 | Gujarati | Not in this tag; `locale: 'en'` on the profile and every content item | — |
| O6 | Sample data | "Load sample data" on the welcome screen and in Settings → Your data, marked, erasable | U-33, U-19 |
| O7 | Tier 2 screens in the tag | Honest states: working, stub (one real action) or locked (one line naming what it will be); never a dead button | every UI lane |
| O8 | The `.docx` guide in the tag | Yes if U-36a merges; Part 3 comes with `offline-v1.1` | `tests-docs` |
| O9 | Pushing | `build/offline-v1`, the lane branches and the tag go to origin; `main` never | HUB |
| Q10 | May the HUB run Workflow itself? | No: the ultracode opt-in is the owner's own line; the HUB merges by script, uses plain sub-agents for its tooling, proves the lane dry run with the local simulator `wf_sim.mjs`; the build chats run the real workflow | HUB |
| Q11 | When does SCREENS start? | When the memory sample leaves room for a second chat and one more lane after CORE's grants (`TRACKS-ALLOWED:`) | HUB |
| Q12 | Model of a fresh HUB | `claude-fable-5-1 --effort high`; build chats `claude-opus-5-5` | launcher |
| Q13 | May the 4 GB floor drop for Node-only lanes? | No; the floor stands; fewer slots instead | HUB |

Reply to copy back: `O1-O9 default, Q10-Q13 default` (or e.g. `O3: international only`).

---

## 10. The files that coordinate (one writer per file; everyone reads them all)

`<docs>/PLAN.md` (this) · `KICKOFF-PROMPTS.md` (Prompt 0 HUB, 1 CORE, 2 SCREENS) · `coordination/status-HUB.md`, `status-CORE.md`, `status-SCREENS.md` · `outbox-HUB.md`, `outbox-CORE.md`, `outbox-SCREENS.md`, `outbox-OWNER.md` (messages `R-H-n`, `R-C-n`, `R-S-n`, `R-O-n`) · `SPRINT-BOARD.md` (generated by `tools/board.py` from the status files and `board-notes.md`; nobody edits it by hand) · `baselines.md`, `territory.json`, `overlap-register.md`, `lane-widening.md` · `tracks/<TRACK>/RUN-RECORD.md` ("Resume here" last), `briefs/`, `contracts/`, `lane-reports/`, `workflows/` · `tools/` (launcher, context meter, hook, board, gates, territory check, hub commit, `token_roles.json`). Every file written under `<docs>` is committed as it goes with `tools/hub_commit.py` (`docs(<TRACK>, 2026-11-07): ...`), pushed only by the HUB.
