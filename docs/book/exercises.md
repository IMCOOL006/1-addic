# Exercise Inventory

Every exercise and worksheet in the book, mapped to the app. Use this as the build checklist for the content and the exercise engine. Details for each exercise are in the chapter notes (`NN-*.md`).

**Kinds:** `assess` = one-time self-assessment (re-takeable) · `build` = builds a personal artifact (profile, list, card) · `log` = repeating tracker entry · `plan` = forward-looking plan or task · `practice` = guided skill practice (often audio) · `reflect` = free-text reflection · `tool` = in-the-moment coping tool.

**Field types** (the exercise engine has to support all of these): `check` (multi-select; `check★` adds a second "frequent" mark), `single`, `slider` (0–10 or 0–100%), `text`, `list[n]`, `matrix2x2`, `pair` (thought → consequence), `rows` (table log), `hourgrid` (hourly schedule), `plan+backups`, `template` (fill-in sentence), `bodymap`, `timer`, `audio`, `date`.

| ID | Exercise | Ch | Kind | Repeat? | Field types | App feature (see PLAN.md) |
|---|---|---|---|---|---|---|
| 1.1 | Addiction Signs & Symptoms | 1 | assess | re-takeable | check (grouped) | Learn → Understand; results feed Reasons |
| 1.2 | Personal Risk Factors | 1 | assess | once | check | Learn → Understand (private, content note) |
| 1.x | Finding the Words (3-part help request) | 1 | tool | yes | template | Reach-out script builder |
| 1.y | Questions to ask a treatment program | 1 | tool | — | check + text | Resources → Choosing a program |
| 3.1 | Stage of Change + Motivation rating | 3 | assess | **time series** | single + slider + text("+1?") | Motivation Meter |
| 3.2 | Resolving Ambivalence (decisional balance) | 3 | build | revisit | matrix2x2 (list[4] per cell) | Workbook → Decisional Balance → **Reasons Card** |
| 3.3 | Motivation for Change (4 lenses) | 3 | reflect | revisit | text×7 + slider | Workbook → My Why; feeds Reasons Card |
| 4.1 | Paraphernalia | 4 | plan | once+ | check + text + helper | Actions → "Clear the Space" quest |
| 4.2 | Select & Commit to Exercise | 4 | plan | yes | list[5] + date + number | Actions → Exercise plan |
| 4.3 | Exercise Log | 4 | log | weekly | rows(day, type/min, reward) + Y/N | Tracker → Exercise |
| 4.4 | Safety Nets vs. Risky Relationships | 4 | build | update | list[6]×2 + strategy | Workbook → Support Network map |
| 4.5 | Practice Assertive Communication | 4 | build | yes | template ("I feel… when… I need…") | Workbook → Scripts; role-play |
| 4.6 | Qualities of Safety Nets | 4 | build | once | check + text | Support Network rubric |
| 4.7 | Ways to Expand Your Network | 4 | plan | yes | list×3 | Actions → "Build Your Crew" quest |
| 4.x | Seemingly-irrelevant-decision checklist | 4 | tool | yes | check + text(exit plan) | Tool: "Should I go?" |
| 4.y | Refusal skills | 4 | tool | yes | script | Tool + role-play |
| 5.1 | Identifying Triggers (internal/external) | 5 | build | update | check★ (grouped) + text | Workbook → **Trigger Profile** |
| 5.2 | Red Flag Thoughts | 5 | build | update | check + text | Workbook → **Red Flag library** |
| 5.2b | Six Mistakes in Thinking | 5 | build | yes | pair×6 | Learn mini-game "Distortion Sort" + Workbook thoughts |
| 5.2c | Spiraling Lapse thoughts | 5 | build | update | check + text | Lapse Recovery flow |
| 5.3 | How Do You Experience Cravings? | 5 | build | update | bodymap + check×2 | Workbook → Craving Signature |
| 5.4 | Craving Self-Monitoring Form | 5 | log | **daily** | rows(time+situation, thoughts, feelings, 0–10) | Tracker → **Craving log** (core) |
| 6.1 | Thought Challenging Worksheet (3 T's) | 6 | tool | yes | text×6 | Tool: "Put It On Trial" → Comebacks deck |
| 6.2 | Challenging Your Red Flag Thoughts | 6 | tool | yes | text×5 | Same flow, launched from a saved thought |
| 6.3 | Thought Challenging Form (daily) | 6 | log | daily | rows(trigger, red flag, trial Qs, alt) | Optional step in craving log |
| 6.3b | My distraction list | 6 | build | update | list | SOS → Distraction deck |
| 6.4 | Daily Schedule | 6 | plan | daily | hourgrid + risky flag | Actions → Day Planner |
| 6.5 | Urge Planner | 6 | plan | weekly | plan+backups ×3 | Actions → **Battle Plans** |
| 6.r | Cognitive vs. behavioral reflection | 6 | reflect | periodic | text | Toolkit insights |
| 7.1 | Observe Your Body (body scan) | 7 | practice | yes | audio + text | Practice → Body scan |
| 7.2 | Mindful shower / eating / walking | 7 | practice | yes | audio + text×3 | Actions → Everyday Mindfulness quests |
| 7.3 | Breathing with Awareness | 7 | practice | yes | audio + timer (5→30 min) | Practice → Breath |
| 7.4 | SOBER Breathing (4 contexts) | 7 | practice/tool | yes | audio + text×4 + rating | SOS → SOBER; practice quest |
| 8.0 | Things I used to enjoy | 8 | build | once | list | Activity library seed |
| 8.1 | Activity Tracking (hourly + daily totals) | 8 | log | daily ≥1 wk | hourgrid(activity, 0–10) + slider×2 + Y/N | Tracker → Day Log + evening check-in |
| 8.2 | Should Dos vs. Want Tos | 8 | build | update | list[10]×2 | Workbook → Balance |
| 8.3 | Pleasant Activities menu | 8 | build | update | check (≈60) + list[6] | Workbook → Activity library |
| 8.4 | Activity Scheduling | 8 | plan | yes | list[10] + date | Actions → planner |
| 8.4b | Obstacles → Problem Solving | 8 | tool | yes | list + rows(pros/cons) + pick 2 | Tool: Problem Solver |
| 8.5/8.6 | Pleasure Predicting | 8 | log | yes | slider% before/after + text | Actions → "Prediction vs. Reality" experiment |
| 8.7 | Reward Yourself for Follow-Through | 8 | plan | weekly | template ×3 | Actions → Rewards |
| 9.1 | Mood & Craving Log | 9 | log | daily, weeks | rows(date, situation, thought, 0–10, 0–10) | Tracker → Emotion log (depressed) |
| 9.2 | Anxiety & Craving Log | 9 | log | daily, weeks | same | Tracker → Emotion log (anxious) |
| 9.3 | Challenging Your Negative Thoughts | 9 | tool | yes | text×6 + distortion pick | "Put It On Trial" (mood mode) |
| 9.3b | When I am angry (signature) | 9 | build | update | bodymap + text×2 | Workbook → Anger Signature |
| 9.4 | Anger Triggers (5 categories) | 9 | build | update | text×5 | Trigger Profile (anger tag) |
| 9.5 | Changing Angry Behavior | 9 | reflect | yes | text×4 | Tool: "Replay & Rewrite" |
| 9.6 | Revisit Your Motivation | 9 | assess | time series | slider + "+1?" | Motivation Meter |
| 10.1 | My Warning Signs of Relapse (book: 11.1) | 10 | build | update | check + top-3 × plan | Workbook → **Warning Sign Radar** |
| 10.2 | Slip review ("learn from the situation") | 10 | reflect | per slip | text×7 + support actions | SOS → "I slipped" → Lapse Recovery |
| 10.3 | Personalized Relapse Prevention Plan | 10 | build | living doc | check (≈35 skills) + list per category | Workbook → **My Recovery Plan** (auto-prefilled) |
| 10.w | Weekly look-ahead (first 6+ months) | 10 | plan | weekly | → 6.5 | Weekly Review ritual |

## Logs that should be one data model

Ex 5.4, 6.3, 8.1 (end-of-day part), 9.1 and 9.2 all record *a moment or a day*: situation or trigger, thought, feeling(s), intensity, craving, and whether you used. Build **one flexible `LogEntry`** with typed optional sections instead of five forms. Ex 4.3 (exercise), 7.x (practice minutes) and meetings are simpler `ActivityLog` entries.

## Artifacts the user builds (shown in the Workbook tab)

Reasons Card (3.2/3.3) · Motivation history (3.1/9.6) · Trigger Profile (5.1/9.4) · Red Flag library + Comebacks (5.2/6.x) · Thought journal with distortion tags (5.2b/9.3) · Craving & Anger Signatures (5.3/9.3b) · Support Network (4.4/4.6) · Scripts (4.5/1.x) · Activity library + Balance (8.0/8.2/8.3) · Distraction deck (6.3b) · Warning Sign Radar (10.1) · **My Recovery Plan** (10.3).
