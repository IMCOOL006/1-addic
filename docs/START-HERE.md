# Start Here: where 1-addic stands and how to continue on your own computer

This page has everything you need to pick the project up on your own machine: where things stand, what's in the repo, how to set up, what to do next (in order), and the prompts to use.

---

## 1. Where things stand

**The project:** a private, phone-first recovery app that teaches the skills from *The Addiction Recovery Skills Workbook* (CBT, motivational interviewing and mindfulness) and helps people use them in the moments that matter. It follows the plan, the decisions and the documents listed below.

| Item | Status | Where |
|---|---|---|
| Book read and summarized (in our own words) | ✅ Done | `docs/book/` |
| Product and execution plan | ✅ v0.5 | `docs/PLAN.md` |
| Step-by-step build guide with prompts | ✅ 51 steps | `docs/BUILD-GUIDE.md` |
| Execution plan as a Word document | ✅ Done | `docs/1-addic-execution-plan.docx` |
| Decisions D1–D19, plus your inputs I1–I13 and C1–C5 | ✅ Answered 16 October 2026, recorded as ADRs | `docs/decisions/`, `docs/decisions/owner-inputs.md` |
| D13, the app's name | ⬜ Open (shortlist inside) | `docs/decisions/0013-app-name-open.md` |
| Early Access build and build-program proposal | ⏳ **Waiting for your reply** (Part 5) | `docs/1-addic-early-access-and-program.docx` (source: `docs/program/EARLY-ACCESS-AND-PROGRAM.md`) |
| Platform (D3) | ⏳ Decided by the Unity spike, on Android first; the Early Access build doubles as the spike | `docs/decisions/0003-platform-decided-by-unity-spike.md` |
| App code | ⬜ Not started, on purpose. Nothing is built until you reply to the proposal. | — |

Everything above is on `main` in `IMCOOL006/1-addic`. A web version of an earlier draft of the plan (v0.2) is at https://claude.ai/artifact/QULfT2kieastYicQPrcUMY. The repo is the source of truth.

---

## 2. What's in the repo

| Path | What it is |
|---|---|
| `docs/START-HERE.md` | This page |
| `docs/PLAN.md` | The full plan: vision, features, Harbor game design, safety, privacy, tech, roadmap, risks, decisions (§15) |
| `docs/BUILD-GUIDE.md` | The build steps, each with a goal, a ready-to-paste prompt and a "done when" checklist; house rules; reusable prompts |
| `docs/decisions/` | One decision record (ADR) per decision, plus your inputs (`owner-inputs.md`) |
| `docs/program/EARLY-ACCESS-AND-PROGRAM.md` | The two-week Early Access plan and the proposed build program (which chats do what), with a reply to copy in Part 5 |
| `docs/1-addic-execution-plan.docx` | The friendly, complete execution plan |
| `docs/1-addic-decisions-needed.docx` | The decisions questionnaire you answered |
| `docs/1-addic-early-access-and-program.docx` | The Early Access and program proposal as a Word document |
| `docs/design/game-concept-review.md`, `docs/evidence-references.md` | The Harbor concept review and the evidence list behind the "Why this works" screen |
| `docs/book/` | Paraphrased notes on the book: one file per chapter, plus `exercises.md` (every exercise mapped to an app feature) and `glossary.md` |
| `scripts/build_*.js`, `scripts/execution_plan/`, `scripts/check_execution_plan_doc.py` | Generators and checks for the Word documents. Never edit the `.docx` files by hand. |
| `scripts/epub_to_text.py` | Re-extracts the book's text into a folder outside the repo, if you ever need to check a detail |
| `CLAUDE.md` | Rules Claude Code reads automatically in this repo |

---

## 3. Set up your computer

Your answers (I2, I3) put the next months on your **Windows machine with Unity 6.6 and an Android phone**, using free tools. The iPhone version, a Mac and paid accounts wait until they're needed.

### Install once

- **Git for Windows.** It includes Git Bash. Run the repo's scripts there, or in WSL.
- **Claude Code**: the CLI, or Claude Code inside the Claude desktop app. Install instructions are at https://code.claude.com/docs
- **Unity 6.6** (you have it), with **Android Build Support**. Needed for the spike and Early Access (step 0.6 and lane A).
- **Node.js 22 or newer** and **Python 3**. Used by the document generators and checks (and by the web stack, if the spike sends us there).
- Optional:
  - **LibreOffice** and **Poppler** (`pdftotext`), so the document checks can render and count pages.
  - **GitHub CLI** (`gh`), to open pull requests from the terminal.

### Get the code

```bash
git clone https://github.com/IMCOOL006/1-addic.git
cd 1-addic
```

Everything is on `main`.

### Put your copy of the book in `data/` (never committed)

```bash
mkdir data
# copy your .epub into data/  (all *.epub files are git-ignored)
python3 -I scripts/epub_to_text.py data/<book>.epub ../book-text   # only if you need the raw text
```

Keep extracted text **outside** the repo folder. The book is copyrighted. The notes in `docs/book/` are in our own words, and they're what Claude should use.

### Rebuilding the Word documents (only after changing the plan or the guide)

From Git Bash, in the repo folder:

```bash
npm install --no-save docx@9.7.1   # once; this version is needed (newer ones dropped jszip); node_modules/ is git-ignored
node scripts/build_execution_plan_doc.js
python3 scripts/check_execution_plan_doc.py
```

With LibreOffice installed, the build also fills in the contents page numbers. `CLAUDE.md` lists the matching commands for the decisions and program documents.

### Good to know on your own machine

- **No automatic installs.** The session-start hook only runs in cloud sessions. Install dependencies yourself, using the commands in `CLAUDE.md`.
- **Secrets.** If you ever need a key, put it in a local `.env` file. It's git-ignored. Never commit it.
- **Line endings.** `.gitattributes` forces LF, so leave it alone. Run `.sh` scripts in Git Bash or WSL.
- **Pull requests.** Don't push straight to `main`. Work on a branch, push it, and open a pull request on GitHub (or run `gh pr create`).

---

## 4. What to do next, in order

1. **Get the code** (section 3).
2. **Read the Early Access and program proposal:** `docs/1-addic-early-access-and-program.docx`. Part 2 is what you'll be able to test in two weeks. Part 3 is how the chats split the work: a PLAN chat in the cloud, an INT chat on your Windows machine with Unity, and a BUILD chat in the cloud. Part 4 lists eight questions with defaults.
3. **Send your reply** (Part 5) using Prompt A below. Q3 is already done: `subagentPromptCacheTtl` is set in `.claude/settings.json` on `main`.
4. **Let the chats start Early Access.** After your reply, the PLAN chat creates the program files and the unit list and hands lane A to the INT chat on your machine. That includes the Unity spike, which settles D3.
5. **Pick the app's name** (D13) when you're ready. The shortlist is in `docs/decisions/0013-app-name-open.md`. "1-addic" stays the working title until then.
6. **Before the friends build:** verify the crisis numbers (Q7 default). Before going public: clinical advisor, legal and privacy review (D16, I5).

---

## 5. The prompts

Open Claude Code in the repo folder (or a cloud session on the repo) and paste the prompt.

### Prompt A: reply to the program proposal (the PLAN chat)

```text
Read CLAUDE.md, docs/START-HERE.md, docs/PLAN.md, docs/decisions/README.md,
docs/decisions/owner-inputs.md and docs/program/EARLY-ACCESS-AND-PROGRAM.md.
You are the PLAN chat described in Part 3. This is my reply to Part 5:

<paste the reply from Part 5 here, changed where you want>

Carry out the reply exactly as the document describes. Create only what the
reply approves, record any default you applied, and tell me what the INT chat
on my Windows machine should do first, with the exact prompt to give it.
```

### Prompt B: pick up where we left off (any time, any chat)

```text
Read CLAUDE.md, docs/START-HERE.md, docs/PLAN.md, docs/BUILD-GUIDE.md,
docs/decisions/README.md and, if they exist, docs/program/PROTOCOL.md and
my status files in docs/program/status/. Look at the latest commits and
merged pull requests. Tell me where the project stands, what comes next,
and whether anything from the last step is unfinished. Don't change anything
yet.
```

### Prompt C: change the plan

```text
I want to change the plan: <describe the change>. Update docs/PLAN.md (and
docs/BUILD-GUIDE.md if steps are affected), add a decision record in
docs/decisions/, rebuild the Word documents with the generators named in
CLAUDE.md and run their checks, and tell me what the change means for work
already done. Don't write app code. Push a branch for me to review.
```

Every build step has its own prompt in `docs/BUILD-GUIDE.md`.

---

## 6. Ground rules to keep

- **Copyright.** Never commit the epub, extracted text or quotes from the book. App text is always written in our own words.
- **Safety.** SOS works offline and is never gated. Urgent help is always one tap away. The safety floor stays open (ADR 0019). No streak resets, no random rewards, no shame (PLAN §6.1, §8).
- **Privacy.** Data stays on the device unless the person turns on sync. No trackers, ads or analytics.
- **Small steps.** One step or lane per branch and pull request. Tests and checks green before merging.
