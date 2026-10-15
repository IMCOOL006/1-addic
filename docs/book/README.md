# Book Reference Notes

Paraphrased study notes on **_The Addiction Recovery Skills Workbook_** (Suzette Glasner-Edwards, PhD; New Harbinger), the source material for this app. **Read these instead of the epub.** They capture every concept, case story, exercise (with its fields) and an app mapping, so later sessions don't need to reload the book.

## ⚠️ Copyright

The book is copyrighted. **Don't commit the epub, its extracted text, or verbatim passages to this repo.** These notes are summaries and structural descriptions in our own words, with short quoted phrases and slogans only where needed. The app's user-facing copy has to be **written fresh** (see `../PLAN.md` → Content & licensing). Character stories in the app should be original composites, not the book's characters.

If you need to re-extract the book (for example, to check a detail), put the epub in `data/` (git-ignored) and run:

```bash
python3 -I scripts/epub_to_text.py data/<book>.epub "$SCRATCH/book-text"
```

Write the output to a scratch directory, never inside the repo.

## Index

| File | Covers |
|---|---|
| [00-front-matter.md](00-front-matter.md) | Book overview, structure, the three approaches, addicted vs. rational brain, how to use it |
| [01-how-addiction-happens.md](01-how-addiction-happens.md) | Ch 1: diagnosis signs, risk factors, getting professional help (Ex 1.1–1.2) |
| [02-brain-disease.md](02-brain-disease.md) | Ch 2: dopamine, conditioning, how treatment works, medications table |
| [03-step1-motivation.md](03-step1-motivation.md) | Ch 3 / Step 1: stages of change, ambivalence, decisional balance (Ex 3.1–3.3) |
| [04-step2-set-up-to-succeed.md](04-step2-set-up-to-succeed.md) | Ch 4 / Step 2: paraphernalia, SIDs, exercise, Safety Nets, assertiveness, refusal, groups (Ex 4.1–4.7) |
| [05-step3-self-expert.md](05-step3-self-expert.md) | Ch 5 / Step 3: triggers, red flags, six thinking mistakes, spiraling lapse, cravings, self-monitoring (Ex 5.1–5.4) |
| [06-step4-respond-to-distortions.md](06-step4-respond-to-distortions.md) | Ch 6 / Step 4: three T's, superficial truths, urge surfing, distract, delay, schedule, Urge Planner (Ex 6.1–6.5) |
| [07-step5-mindfulness.md](07-step5-mindfulness.md) | Ch 7 / Step 5: mindfulness, body scan, daily practices, breathing, SOBER, acceptance (Ex 7.1–7.4) |
| [08-step6-rediscover-rewards.md](08-step6-rediscover-rewards.md) | Ch 8 / Step 6: behavioral activation, activity tracking, pleasant activities, pleasure predicting (Ex 8.1–8.7) |
| [09-step7-challenging-emotions.md](09-step7-challenging-emotions.md) | Ch 9 / Step 7: mood and anxiety logs, challenging negative thoughts, anger (Ex 9.1–9.5) |
| [10-personalized-recovery-plan.md](10-personalized-recovery-plan.md) | Ch 10: warning signs, stopping a slip, the relapse prevention plan; Resources; foreword principles |
| [exercises.md](exercises.md) | **Inventory of every exercise**: kind, field types, app feature |
| [glossary.md](glossary.md) | Concept glossary for copy and tooltips |

## Facts at a glance

- **Scope:** alcohol and drug addiction, abstinence-based. Gambling and other behavioral addictions are out of scope.
- **Structure:** Part 1 (Ch 1–2, understanding) → Part 2: seven Steps (Ch 3–9) → Ch 10 (plan).
- **About 50 exercises and worksheets** (numbered and unnumbered). See `exercises.md`.
- **Numbers the app will reuse:** craving ≈ **15 min** average; delay **15–20 min**; motivation **0–10**; craving **0–10**; pleasure **0–10** (pleasant = **≥6**); pleasure prediction **0–100%**; maintenance = **6 months**; weekly look-ahead for the **first 6 months**; depression symptoms persisting **>1 month** sober → see a professional; exercise **150 min/week** + strength **2×/week**; breath practice **5 → 30 min**; SOBER **1–5 min**.
- **The publisher offers downloadable forms** at newharbinger.com/32783 (Ex 5.4, 6.3, 8.1, 9.1, 9.2).
