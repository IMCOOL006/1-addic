# Start Here: picking up 1-addic on your own computer

This page has everything you need to continue on your own machine: where things stand, how to set up, what to do next (in order), and the prompts to use.

---

## 1. Where things stand

**The project:** a private, phone-first recovery app that teaches the skills from *The Addiction Recovery Skills Workbook* (CBT, motivational interviewing and mindfulness) and helps people use them in the moments that matter.

| Item | Status |
|---|---|
| Book read and summarized (paraphrased notes) | ✅ Done: `docs/book/` |
| Product and execution plan | ✅ Draft v0.2: `docs/PLAN.md` (includes the in-app tutorial and Learning Roadmap) |
| Step-by-step build guide with prompts | ✅ Done: `docs/BUILD-GUIDE.md` (44 steps) |
| Plan review (you + a Fable chat) | ⬜ Next |
| Word document of the full execution plan | ⬜ Next (Prompt B below) |
| Decisions D1–D18 answered | ⬜ Then build step 0.1 |
| App code | ⬜ Not started, on purpose. Building starts after the plan is approved. |

All of this is on GitHub in `IMCOOL006/1-addic`, branch `claude/happy-volta-jh3n71`.

A web version of the plan is published at https://claude.ai/artifact/QULfT2kieastYicQPrcUMY. It's private: use its Share menu if someone else needs to see it. The repo copy (`docs/PLAN.md`) is the source of truth.

---

## 2. What's in the repo

| Path | What it is |
|---|---|
| `docs/START-HERE.md` | This page |
| `docs/PLAN.md` | The full plan: vision, features, game design, safety, privacy, tech, roadmap, risks, decisions (§15) |
| `docs/BUILD-GUIDE.md` | 44 build steps, each with a goal, a ready-to-paste prompt and a "done when" checklist; house rules; reusable prompts |
| `docs/book/` | Paraphrased notes on the book: one file per chapter, plus `exercises.md` (every exercise mapped to an app feature) and `glossary.md` |
| `scripts/epub_to_text.py` | Re-extracts the book's text into a folder outside the repo, if you ever need to check a detail |
| `CLAUDE.md` | Rules Claude Code reads automatically in this repo |
| `.claude/hooks/session-start.sh` | Installs dependencies in *cloud* sessions only (it does nothing on your computer) |

---

## 3. Set up your computer

### Install these once

- **Git**. On Windows, Git for Windows (it includes Git Bash).
- **Node.js LTS** (version 22 or newer). It's needed from build step 0.2.
- **Python 3**. Used for the book-extraction script and for generating the Word document.
- **Claude Code**: the CLI, or Claude Code inside the Claude desktop app. Install instructions are at https://code.claude.com/docs
- Optional:
  - **LibreOffice**, so Claude can render the Word document to check its layout.
  - **GitHub CLI** (`gh`), to open pull requests from the terminal.
  - **VS Code**.

### Get the code

The docs are on the branch `claude/happy-volta-jh3n71`. Pick one option:

**Option A (recommended): merge first.** On GitHub, open a pull request from `claude/happy-volta-jh3n71` into `main` and merge it. Then:

```bash
git clone https://github.com/IMCOOL006/1-addic.git
cd 1-addic
```

**Option B: use the branch directly.**

```bash
git clone https://github.com/IMCOOL006/1-addic.git
cd 1-addic
git switch claude/happy-volta-jh3n71
```

### Put your copy of the book in `data/` (never committed)

```bash
mkdir data
# copy your .epub into data/  (all *.epub files are git-ignored)
python3 -I scripts/epub_to_text.py data/<book>.epub ../book-text   # only if you need the raw text; on Windows use: python
```

Keep extracted text **outside** the repo folder. The book is copyrighted. The notes in `docs/book/` are written in our own words, and that's what Claude should use.

### Good to know on your own machine

- **Dependencies.** The session-start hook only runs in cloud sessions. After pulling changes, run `npm install` yourself (from build step 0.2 on).
- **Browser for tests.** Run `npx playwright install chromium` once, after step 0.2.
- **Secrets.** If you ever need an API key, put it in a local `.env` file. It's git-ignored. Never commit it.
- **Windows.** Line endings are forced to LF by `.gitattributes`, so leave that alone. Run `.sh` scripts in Git Bash or WSL.
- **Pull requests.** Don't push straight to `main`. Make a branch per build step, push it, and open a PR on GitHub (or run `gh pr create`).

---

## 4. What to do next, in order

1. **Get the code** (section 3).
2. **Review the plan with Fable** using Prompt A. Read its feedback. To change the plan, use the "Change the plan" prompt in `docs/BUILD-GUIDE.md`, Appendix A.
3. **Make the Word document** with Prompt B. This gives you the friendly, complete execution plan to read, print or share.
4. **Answer decisions D1–D18** (PLAN §15, also Part 10 of the Word doc). Then run build **step 0.1** from `docs/BUILD-GUIDE.md` to record them.
5. **Start building** at step 0.2 and follow the guide step by step. One step is one branch and one pull request.
6. **Find a clinical advisor early** (decision D16). They should review the safety, crisis and lapse wording before anyone else uses the app.

---

## 5. The prompts

Open Claude Code in the repo folder, choose the model (Fable for A and B, at max effort), and paste the prompt.

### Prompt A: review the plan (Fable)

```text
Review docs/PLAN.md for this addiction-recovery app (also skim docs/BUILD-GUIDE.md and docs/book/exercises.md). Stress-test the product concept, the in-app tutorial and Learning Roadmap, the gamification ethics, the safety design and the phasing. For each decision in §15, give a recommendation with reasoning. List what's missing, what's over-scoped, and what you'd cut from the MVP. Don't edit any files yet. Give me a prioritized list of suggested changes.
```

### Prompt B: make the Word document (Fable, max effort)

```text
Create the complete execution plan for my app as a polished Word document (.docx). Work on your own from start to finish. Only stop to ask me something if you're truly blocked.

## Source material (read all of it before writing)
This repo (IMCOOL006/1-addic) is open in your working folder. If docs/PLAN.md or docs/BUILD-GUIDE.md is missing, run:
git fetch origin claude/happy-volta-jh3n71 && git checkout origin/claude/happy-volta-jh3n71 -- docs CLAUDE.md README.md
- docs/PLAN.md: the product plan. It's the source of truth for features, design, game, safety, privacy, tech, roadmap and decisions.
- docs/BUILD-GUIDE.md: 44 build steps, each with a ready-to-paste prompt and a "done when" checklist, plus house rules, reusable prompts and a definition of done.
- docs/START-HERE.md: the setup and next steps for working on my own computer.
- docs/book/README.md, exercises.md, glossary.md, plus chapter notes as needed: paraphrased notes on the source book.
- CLAUDE.md: repo rules.
The original book is copyrighted. Don't look for it, and never quote it.

## Audience
Me, the app owner (not a professional developer), and people helping me: designers, a clinician reviewer, testers. A smart 14-year-old should be able to follow it.

## Writing style
- Friendly, warm, encouraging, plain English. Short sentences. Talk to the reader as "you".
- Explain every technical term the first time it appears, in one simple line (for example: "PWA: a website you can install on your phone like an app"), and collect them all in a glossary.
- Respectful language about addiction: person-first ("person in recovery"), no shame, no moralizing.
- Stay accurate. Don't invent features, numbers, dates or promises that aren't in the docs. Where the plan has an open decision, show the recommended default and label it "Proposed: decide in Part 10".

## A brief under every heading (required)
- Directly under every Heading 1 and Heading 2, add a brief: a lightly shaded callout box that starts with a bold "In short:" and gives 1–3 sentences on what the section covers and why it matters.
- Under every Heading 3, add a one-sentence brief in italics.

## Structure (adapt the order if it reads better, but cover everything)
- Cover page · How to use this document · Contents (a real Word table of contents built from the heading styles)
- Part 1: The big picture. The idea, who it helps (personas), what makes it different, design principles, the book behind it (three approaches, seven steps).
- Part 2: How the app works. The four layers plus SOS, screens and navigation (recreate the Today and SOS wireframe as a simple figure or table), and how learning flows into daily use.
- Part 3: Feature guide. One section per feature:
  - Onboarding
  - SOS: craving, feeling, slip, urgent help
  - Learning journey and the module table
  - Lesson format
  - Workbook artifacts
  - Track and insights
  - Actions: planner, Battle Plans, weekly review, quests, rewards
  - My Recovery Plan
  - Resources
  - Settings and privacy controls
  - The in-app tutorial system
  - The Learning Roadmap

  For each one, give: the brief, what it does, why it helps (with the book link), a short "A moment in the app" example featuring one of the personas, and which book exercises it covers.
- Part 4: Game design. Goals, the do/don't table, the Two Brains theme and Brain Map, the loops, the XP table, skill mastery, quests and badges, and how slips are handled.
- Part 5: Keeping people safe. Safety and clinical review, privacy and security, content and copyright rules.
- Part 6: Technology made simple. The tech choices in plain words, the architecture as a simple box diagram or table, what data the app stores, testing and quality.
- Part 7: The build plan, step by step.
  - First, how to set up on your own computer (from START-HERE.md), how to run a step (both on your own computer and in Claude Code on the web), and the house rules.
  - Then every phase, and every step in BUILD-GUIDE.md. For each step give:
    - the step title and its brief,
    - "What you'll have after this step",
    - the FULL prompt copied word for word,
    - "Done when" as checkboxes.
  - Add a summary for each phase, with its time estimate and exit criteria, and include the MVP cut line.
- Part 8: Timeline and milestones. A phase timeline table in weeks, the milestones, and what you could show people at each one.
- Part 9: Risks, and how we handle them.
- Part 10: Decisions to make. A table of D1–D18 with the options, the recommended default, and an empty "My decision" column to write in.
- Appendices:
  - A: Glossary
  - B: Book exercise → app feature map (condensed from exercises.md)
  - C: Reusable prompts
  - D: Definition-of-done checklist
  - E: Key numbers from the book

## Formatting
- Use real Word styles (Title, Heading 1–3, Normal, list styles) so the table of contents and the navigation pane work. Start each Part on a new page.
- Calm, readable design: one accent color (deep teal), an 11 pt body font (Aptos or Calibri), generous spacing, a header with the document title, and page numbers in the footer. Use A4 page size.
- Tables: shaded header row that repeats on every page, rows that never split across pages, columns sized to fit the page width.
- Prompts: put each one in a shaded box with a monospace font (Consolas, about 9.5 pt) and the label "Copy this prompt". Keep its line breaks. Never change a prompt's words.
- Callout boxes: "In short" briefs (light teal), "Safety note" (soft red), "Decision needed" (soft amber), "Tip" (soft grey).
- Use ☐ checkboxes for "Done when" and for the definition of done.

## How to work
1. Read all the source docs, then post a short outline in chat (parts, headings, rough page counts). Don't wait for my approval. Keep going.
2. Build the document with your docx skill if you have it. Otherwise use python-docx (pip install python-docx). Generate it from a script so it can be rebuilt later, save the script as scripts/build_execution_plan_doc.py, and commit it.
3. Check quality before you finish:
   - If LibreOffice is installed, convert the document to PDF and render a few pages as images: the cover, the contents, a feature page, a build step with its prompt, and the decisions table. Look at them and fix overflowing tables, bad page breaks, headings stranded at the bottom of a page, mixed styles, and missing briefs. If LibreOffice isn't installed, say so and list what I should check by eye in Word.
   - Check with a script that every Heading 1 and Heading 2 has a brief.
   - Check with a script that every prompt in BUILD-GUIDE.md appears word for word.
   - Make sure the table of contents field is there, and tell me if I need to right-click it and choose "Update field" in Word.
4. Save the document as docs/1-addic-execution-plan.docx. Commit it and the script on a new branch called docs/execution-plan-word, push the branch, and tell me where the file is.
5. Finish with a summary: page count, what's in each part, any assumptions you made, and anything in the source docs that looked inconsistent.

Aim for thorough but readable, roughly 50–80 pages. The prompts take up a lot of space.
```

### Prompt C: pick up where we left off (any time)

```text
Read CLAUDE.md, docs/START-HERE.md, docs/PLAN.md, docs/BUILD-GUIDE.md and docs/COVERAGE.md (if it exists). Look at the latest commits and merged pull requests and tell me where the project stands, which build step comes next, and whether anything from the previous step is unfinished. Don't change anything yet.
```

Every build step has its own prompt in `docs/BUILD-GUIDE.md`, starting with step 0.1 (record your decisions).

---

## 6. Ground rules to keep

- **Copyright.** Never commit the epub, extracted text or quotes from the book. App text is always written in our own words.
- **Safety.** SOS works offline and is never gated. Urgent help is always one tap away. No streak resets, no random rewards, no shame (PLAN §6.1, §8).
- **Privacy.** Data stays on the device. No trackers, ads or analytics.
- **Small steps.** One build step per branch and pull request, with tests green before you merge.
