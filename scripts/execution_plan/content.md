# How to use this document

> In short: This document turns the product plan and the build guide into one readable book. Read the parts that matter to your role, then use Part 7 to build the app one step at a time.

1-addic is an app that teaches the skills from an addiction-recovery workbook and then helps people use those skills in the moments that matter. This document is the complete execution plan for building it. It is written for people who are not professional developers, and it explains every technical word the first time it appears. All of those words are collected again in Appendix A.

**Who should read what**

@widths 1.2,2.2,2.2
| If you are… | Start with | Then |
|---|---|---|
| The app owner | Part 1 (the idea), Part 10 (the decisions you need to make) | Part 7 (the build plan, step by step) and Part 8 (timing) |
| A designer | Part 2 (how the app works), Part 3 (feature guide), Part 4 (game design) | Part 5 (tone and safety rules) |
| A clinical reviewer | Part 3.2 (SOS), Part 5 (keeping people safe) | Part 10, decisions D7, D8, D9 and D16 |
| A tester | Part 7 ("Done when" lists), Appendix D (definition of done) | Part 3 ("A moment in the app" scenarios to try) |

**How the document is organised**

- Parts 1 to 6 explain the app: the idea, the features, the game, safety, and the technology in plain words.
- Part 7 is the build book. Every one of the 44 build steps has a brief, a description of what you will have afterwards, the full prompt to paste into Claude Code, and a "Done when" checklist.
- Parts 8 to 10 help you manage the project: timeline, risks and decisions.
- The appendices are for looking things up: glossary, the exercise map, reusable prompts, the definition of done, and the key numbers from the book.

**The conventions used**

Every Part and every section opens with a shaded "In short" box, so you can skim the boxes and still get the story. Four kinds of box appear:

::: tip
Boxes like this hold a practical tip or a side note.
:::

::: safety
Boxes like this flag something that could harm a person if it is done wrong. Please read them.
:::

::: decision
Boxes like this mark a decision that is still open. The plan always shows a recommended default, labelled "Proposed: decide in Part 10". Part 10 has the full table of decisions with space to write your answer.
:::

- "☐" checkboxes are for you to tick off, on paper or in Word.
- "Copy this prompt" boxes hold text to paste into Claude Code exactly as written. Never change a prompt's words; the words are what make the steps repeatable.
- "Ex 5.4" means exercise 5.4 in the source book (chapter 5, exercise 4). Appendix B maps every exercise to the app feature that covers it.
- Where the plan says "user", this document says "the person using the app" or simply "you". The app's own voice uses person-first language, for example "person in recovery", and never "addict".

**Where this comes from**

The source files live in the project's repository (a repository, or "repo", is the shared folder on GitHub where the project's files and their history are kept):

- `docs/PLAN.md` is the product plan, draft v0.2. It is the source of truth for features, design, game, safety, privacy, technology, roadmap and decisions.
- `docs/BUILD-GUIDE.md` holds the 44 build steps, each with its prompt and checklist, plus the house rules, reusable prompts and the definition of done.
- `docs/book/` holds paraphrased notes on the source book, including an inventory of its exercises and a glossary.
- `CLAUDE.md` holds the repository's working rules.

This document was generated from those files by a script (`scripts/build_execution_plan_doc.js`). If the plan or the guide changes, run the script again and the document updates itself, including every prompt.

::: tip
The source book is *The Addiction Recovery Skills Workbook* by Suzette Glasner-Edwards (New Harbinger). It is copyrighted. This document and the app never quote it. Everything here is written in our own words, based on the project's paraphrased notes. See Part 5.3 for the content rules.
:::

# Part 1: The big picture

> In short: 1-addic is a private, phone-first app that teaches recovery skills from a workbook and then helps people use them in hard moments. This part explains the idea, who it is for, what makes it different, and the principles behind every design choice.

## 1.1 The idea

> In short: The app turns a recovery workbook into four connected layers (Learn, Workbook, Track and Actions) plus an always-available SOS button, with a gentle game layer on top and a tutorial system that teaches the app itself.

The plan sums the product up in one sentence: *a pocket recovery coach that teaches the skills from the workbook and then helps you use them in the moments that matter, in your own words.*

It is a **phone-first, private, offline-capable** app. Phone-first means it is designed for a phone screen and one-handed use before anything else. Private means the person's data stays on their own device, with no account and no server. Offline-capable means the important parts work with no internet connection, for example on a train or in a basement.

The workbook becomes four connected layers:

1. **Learn.** A guided Journey of 11 short modules (Start Here, Understand, Brain, the seven Steps, Plan). Every lesson ends with the book's real exercise in "tutorial mode", with examples and hints.
2. **Workbook.** The living personal artifacts those exercises produce: a Reasons Card, a Trigger Profile, Red Flags and Comebacks, a Support Network, an Activity Library, Warning Signs, and finally My Recovery Plan. An artifact is simply something the person builds in the app and keeps using.
3. **Track and Actions.** Daily and weekly practice: quick craving and mood logs, morning and evening check-ins, a day planner, Battle Plans for high-risk situations, pleasant activities with self-chosen rewards, and a weekly review.
4. **SOS**, always one tap away. It walks the person through a craving of about 15 minutes, or a hard emotion, or a slip, using *their own* reasons, people and skills. It works offline, with no login.

On top sits a **gentle game layer called "Two Brains"**. It rewards practice and honesty, never claims of staying sober. It has no streak resets, no random rewards and no leaderboards, and it can be switched off.

Finally, the app **teaches itself** the way good games do: a short first-run tour, a safe SOS practice drill, just-in-time tutorials as each feature appears, and an Explorer checklist. A personal **Learning Roadmap** shows the whole journey: where you are, what is next, how long it takes, and what each step unlocks.

**The plan's key recommendations**

@widths 0.3,2.2,2.5
| # | Recommendation | Why |
|---|---|---|
| 1 | Build SOS first, before lessons | The craving moment is where the app earns its place. It needs to work from day 1. |
| 2 | One schema-driven exercise engine; content as data | About 50 exercises reduce to about 15 field types. One engine keeps the scope sane and makes the content editable. (A schema is a written description of the shape of some data.) |
| 3 | One unified log model | Five of the book's logs are the same shape. One quick-log flow beats five forms. |
| 4 | Gamify practice, not sobriety. Never wipe progress after a slip. | The book's "spiraling lapse" is exactly what streak resets trigger. |
| 5 | Local-first and private by default. No account needed. | The data is highly sensitive. The threat model includes people at home. |
| 6 | PWA (React + TypeScript) first; a Capacitor native wrapper later | One codebase. Easy to build and test in Claude Code cloud sessions. App stores later. (A PWA is a website you can install on your phone like an app. React and TypeScript are the tools used to build it; Capacitor wraps a web app so it can go into the app stores.) |
| 7 | Write original content based on the evidence-based techniques; reference the book's chapters | The book is copyrighted. Original content lets you ship. |
| 8 | Clinical review and safety flows before any public release | Withdrawal, overdose and suicide risk are real. |

## 1.2 Who it helps

> In short: Three illustrative people in recovery, plus the therapist or sponsor who supports them, stand in for the app's users throughout this document. Their needs define what "working" means.

The plan describes the people the app is for with personas. A persona is a short, made-up but realistic portrait of a typical user. These three appear in the "A moment in the app" examples in Part 3.

@widths 1.3,2,2
| Persona | Situation | What they need most |
|---|---|---|
| **Sam**, 2 weeks alcohol-free, Action stage | Evenings alone are the danger zone. Craving 6–8 out of 10 most nights. | SOS, an evening plan, Safety Nets one tap away, a reason to keep logging |
| **Jordan**, daily cannabis for 8 years, Contemplation stage | Not sure they want to quit. Defensive about lectures. | A non-judgmental motivation module, no pressure, privacy |
| **Alex**, 7 months off opioids, Maintenance stage, attends NA | Things are stable; complacency is the risk. | Warning-sign radar, light-touch weekly check-ins, overdose-risk awareness if a slip happens |
| *(secondary)* A therapist or sponsor | Sees the person weekly | A clean export of logs and the plan to discuss in session |

"Action", "Contemplation" and "Maintenance" are stages of change, a model from the book that describes how ready someone is to change (see Part 1.5 and the glossary).

**Goals**

- **G1 Teach.** Cover every concept and exercise in the book in bite-size sessions of 3 to 6 minutes.
- **G2 Personalise.** Every exercise produces a reusable personal artifact. Nothing is "done once and forgotten".
- **G3 Help in the moment.** Craving and emotion help within 2 taps, offline.
- **G4 Build the habit.** Daily check-ins and a weekly review ritual. The book asks for weekly look-aheads for at least the first 6 months.
- **G5 Self-knowledge.** Show people patterns from their own data: triggers, times, what helps.
- **G6 Safe and private.** Crisis-ready, medically careful, discreet.

**What the app is not (in version 1)**

It makes no diagnosis or treatment claims. It does not replace therapy or groups. There is no public community feed or social network. Behavioural addictions such as gambling are out of scope, because the book does not cover them. Moderation and harm-reduction *goals* are out, because the book is abstinence-based, although safety information is still included for everyone. There is no clinician dashboard and there are no user accounts.

**What "working" looks like**

Measured on the device, or only with the person's opt-in:

- People complete SOS sessions and report that the urge passed.
- Skills get rated as helpful, and each person's go-to list emerges by week 4 to 6.
- The weekly review is completed in at least 3 of 4 weeks during the first 2 months.
- The person finishes the Journey and has a My Recovery Plan they actually open.
- People in recovery say it feels respectful, useful and safe.

## 1.3 What makes it different

> In short: Most of the app's value comes from a few deliberate choices: help first, your own words reflected back, no shame after a slip, privacy by default, and a game that points outward to real life.

The plan lists the ideas that go beyond the original "learning plus workbook plus tracker" vision. The most important ones:

- **SOS as the centre of gravity.** A 15-minute "delay the decision" loop built from the person's own content.
- **A weekly review ritual.** The book's strongest maintenance habit, turned into a 5-minute flow.
- **One quick-log with voice input.** Logging is a by-product of using SOS, not a chore.
- **Your words, reflected back.** Reasons, Comebacks and Safety Nets resurface exactly when they are needed.
- **Battle Plans on real calendar events**, with a debrief afterwards. Planning beats willpower.
- **A Warning Sign Radar** that notices the book's relapse warning signs in the person's own data and shows *their* plan for each.
- **A no-shame Lapse Recovery flow** that keeps all progress, adds safety information, and ends in a Slip Review.
- **Experiments, not chores:** the 7-Day Activity Experiment, the Prediction Lab and SOBER Training.
- **Discreet mode, an app lock, and a choice of words** (sober, clean, substance-free or in recovery).
- **Counters for money and time reclaimed**, if the person wants them.
- **Calm mode** for people who do not want the game.
- **A therapist or sponsor export** as a PDF, because the book is designed to be used alongside therapy.
- **An original story cast** and an interactive "seemingly irrelevant decisions" story.
- **Safety additions beyond the book:** withdrawal cautions, overdose-after-abstinence information, and crisis routing.
- **An app that teaches itself**, and **a personal Learning Roadmap** with a chosen pace and guilt-free re-planning.
- **Later:** an optional AI rehearsal partner for refusals and hard conversations.

## 1.4 Design principles

> In short: Ten principles guide every screen. When a design question comes up, these settle it.

1. **Help in the hard moment first.** SOS is at most 2 taps from anywhere, offline, without login, and readable when your hands are shaking: big targets, few words, voice input.
2. **Learn it, try it, use it.** Every concept becomes a tool you use in real life.
3. **Your words, reflected back.** The app's most powerful content is what the person wrote: their reasons, their comebacks, their people, surfaced at the right moment.
4. **Practice over perfection.** Reward effort, honesty and skill use, not outcomes the person cannot fully control.
5. **A slip is data, not a verdict.** Never shame. Never wipe progress. Always offer a way back.
6. **Be smart, not strong.** The app never dares the person to face triggers or "test" willpower.
7. **Respectful, adult, accurate.** Educate accurately, empower, never preach or condescend, be relatable. Use person-first language.
8. **Private by default, discreet by design.**
9. **Small steps.** One thing per screen. Sessions of 2 to 5 minutes. Low mental load.
10. **Point outward.** The game should push people toward real-life rewards (pleasant activities, people, meetings, exercise), not more screen time. In the book's evidence, a wide range of enjoyable activities was the strongest predictor of staying sober.

## 1.5 The book behind it

> In short: The app is built on a recovery workbook that combines three therapy approaches and walks the reader through seven steps. The app uses its ideas, in our own words, and never its text.

The source is *The Addiction Recovery Skills Workbook* (Suzette Glasner-Edwards, PhD; New Harbinger). It is a self-help book for adults with alcohol or drug addiction who are open to an abstinence-based recovery. It is designed to be used alone, alongside therapy, or alongside 12-step and other mutual-help groups, and it says plainly that it is not a substitute for professional treatment. The app takes the same position.

**Three approaches, one toolkit**

- **Motivational interviewing (MI).** A way of helping people resolve mixed feelings and commit to change, without pushing. The book says to come back to this material whenever motivation dips.
- **Cognitive behavioural therapy (CBT), also called relapse prevention.** The idea that addictive behaviour is learned and tied to people, places, things and emotions, so you can learn your triggers and practise new responses.
- **Mindfulness-based relapse prevention (MBRP).** Staying present using the breath, and accepting discomfort such as cravings and emotions without acting on it or judging yourself.

**Seven steps**

@widths 0.9,1.6,2.8
| Chapter | Step | What it covers |
|---|---|---|
| Ch 1–2 | Part 1: understanding | How use becomes addiction; addiction as a brain disease; how treatment and medication help the brain heal |
| Ch 3 | Step 1: Motivation | Stages of change, ambivalence, decisional balance, motivation in your own words |
| Ch 4 | Step 2: Set yourself up to succeed | Clear out paraphernalia, seemingly irrelevant decisions, exercise, Safety Nets, assertive communication, refusing offers, groups |
| Ch 5 | Step 3: Become a self-expert | Triggers, red flag thoughts, six thinking traps, the spiraling lapse, cravings, self-monitoring |
| Ch 6 | Step 4: Respond to distortions | Put thoughts on trial, superficial truths, surf the urge, distract, delay, keep a schedule, plan for high-risk situations |
| Ch 7 | Step 5: Become mindful | Body scan, everyday mindfulness, breathing, SOBER, acceptance and self-compassion |
| Ch 8 | Step 6: Rediscover rewards | Track your days, balance should-dos and want-tos, pleasant activities, pleasure predicting, rewards |
| Ch 9 | Step 7: Conquer challenging emotions | Mood and anxiety logs, challenging negative thoughts, anger ("give it a beat"), quick coping |
| Ch 10 | Your personalised plan | Weekly look-ahead, warning signs, stopping a slip, the relapse prevention plan |

**Ideas from the book that shape the app**

- **Two brains.** The *addicted brain* is the impulsive, conditioned part that tempts you and justifies using. The *rational brain* weighs pros and cons and gets stronger with practice. This is the app's story and its game theme (Part 4).
- **Urges are normal.** They can last well into recovery and are not a sign of failure. They get rarer and weaker over time, and skills make them manageable.
- **A slip is not a relapse.** The first use after a period of abstinence is a lapse. What you tell yourself about it decides whether it becomes a relapse. The app never resets progress because of a slip.
- **No one-size-fits-all.** Try every skill in order, then judge which ones help *you*. The result is your own set of go-to skills, which becomes My Recovery Plan.
- **Do the steps in order, but revisit motivation any time.** The Learning Roadmap recommends an order without locking anything.
- **Four principles from the book's foreword** that the plan adopts as design rules: educate with accurate information, empower people to act, be respectful rather than preachy, and make it relatable and realistic.

# Part 2: How the app works

> In short: Five tabs, one floating SOS button, and a flow that turns every lesson into a personal tool. This part shows the layers, the screens, and how learning turns into daily use.

## 2.1 The four layers plus SOS

> In short: The original vision of "learning, workbook, tracker and actions" maps onto four app layers. SOS and the Today screen are added on top, and a tutorial system plus a Learning Roadmap hold it all together.

@widths 1.4,1.4,2.4
| The original vision | App layer | What it is |
|---|---|---|
| "Learning + workbook tutorial" | **Learn** tab (the Journey) | Lessons, then the exercise in tutorial mode with examples, hints and explanations |
| "Dedicated workbook" | **Workbook** tab | All personal artifacts: browse, edit, see history, re-do, export |
| "Task tracker and actions" | **Track** tab + **Actions** tab | Logs, check-ins and insights · planner, Battle Plans, quests, pleasant activities, rewards, weekly review |
| *(suggested addition)* | **SOS** button (on every screen) + **Today** (home) | In-the-moment help · today's plan and the next best step |
| "In-app tutorial" and "roadmap for learning" | **Guided tutorial system** + **Learning Roadmap** (the home of the Learn tab) | The app teaches itself step by step · a personal map and timeline of the whole journey |

**Same component, two modes.** Each exercise is built once and used in two ways. In *tutorial mode*, inside a lesson, it adds worked examples, an explanation for each field, and a "you built X" ending. In *workbook mode*, for later edits and daily use, it is fast and compact. This is what keeps about 50 exercises affordable to build.

## 2.2 Screens and navigation

> In short: A bottom bar with five tabs (Today, Learn, Workbook, Track, Actions), a floating SOS button everywhere, and a Settings area. The figure below redraws the plan's wireframe of Today and SOS.

The bottom navigation has five tabs: **Today · Learn · Workbook · Track · Actions**. A floating **SOS** button sits on every screen. In the native phase (Part 7, Phase 5) SOS also becomes a home-screen shortcut and widget.

@widths 1,4
| Area | Screens |
|---|---|
| **Today** | Morning or evening check-in card · today's plan with risky blocks highlighted and their Battle Plans · "Want-to of the day" · continue learning · active quests · Reasons Card peek · counters (opt-in) |
| **Learn** | My Learning Roadmap (Map view and Plan view, "this week's focus") → module page (lessons, progress) → lesson player (cards → check → try it → wrap) · glossary |
| **Workbook** | *My Why:* Reasons Card, Decisional Balance, Motivation history · *Know Myself:* Trigger Profile, Red Flags and Comebacks, Thought Journal, Craving and Anger Signatures, Warning Signs · *My People:* Support Network, Scripts · *My Joys:* Activity Library, Should/Want balance, Distraction deck · **My Recovery Plan** |
| **Track** | Quick-log (+): Craving · Feeling · Check-in · Exercise · Mindfulness · Meeting · Slip · Timeline · Insights · Counters |
| **Actions** | Planner (day and week) · Battle Plans · Quests · Pleasant-activity queue and Rewards · Weekly Review · To-dos generated by exercises |
| **SOS** | I'm craving · I'm feeling… · I slipped · I need urgent help |
| **Settings** | App lock · Discreet mode · Terminology · Notifications · Export, import and delete · Accessibility · Calm mode (game off) · Resources · Help & tutorials (replay any tutorial, "How do I…?", tips on or off, "show all features now") |

A wireframe is a rough sketch of a screen that shows what goes where, without colours or final wording. The plan's sketch of the two most important screens looks like this:

@wireframe

The Today screen shows the plan for the evening with a risky block, the Battle Plan attached to it, the next lesson and an active quest. The SOS screen opens with a calm line, a strength rating, the 15-minute wave timer, five tools, and urgent help. Nothing on SOS is longer than two lines.

## 2.3 How learning flows into daily use

> In short: A lesson teaches a concept, the person tries the real exercise, the exercise produces a personal artifact, the artifact gets used in Track, Actions and SOS, that use creates data, the data becomes insights, and the insights feed My Recovery Plan.

@widths 1.1,3.9
| Stage | What happens |
|---|---|
| 1. Learn | A short lesson explains one concept, for example "your triggers". |
| 2. Try it | The person does the book's real exercise in tutorial mode, with examples and hints. |
| 3. Artifact | The exercise produces a Workbook artifact, for example a Trigger Profile. |
| 4. Use it | The artifact shows up where it helps: as chips in the craving log, in Battle Plans, in SOS. |
| 5. Your data | Using it creates logs, plans and helpfulness ratings. |
| 6. Insights | The app shows patterns: top triggers, risky times, which skills help. |
| 7. My Recovery Plan | Insights and artifacts pre-fill the plan, which points back to step 4: using the skills. |

Features appear gradually as the Journey reaches them, each with its own short tutorial, so nobody faces everything on day one. SOS, crisis help, quick-log and check-ins are there from the start. Part 3.11 explains the tutorial system and Part 3.12 the Roadmap.

# Part 3: Feature guide

> In short: One section per feature, from onboarding to the Learning Roadmap. Each one says what the feature does, why it helps (with the link to the book), shows a short moment in the app with one of the personas, and lists the book exercises it covers.

## 3.1 Onboarding

> In short: A welcome flow of at most three minutes that explains what the app is and is not, sets up privacy, learns the person's focus and stage, checks for medical risk, and makes SOS useful from the first day. Every step can be skipped except the safety notice.

**What it does**

1. **Welcome.** What this is (a skills coach based on CBT, motivational interviewing and mindfulness) and what it is not (not treatment, not a diagnosis). Crisis information is always available.
2. **Privacy promise.** Data stays on this device. Set an app lock (recommended). Optionally turn on discreet mode, which gives the app a neutral name, icon and notification text.
3. **Your focus.** The substance or substances, the person's preferred word (sober, clean, substance-free or in recovery), an optional start date, or "I'm not sure yet", which starts the contemplation path.
4. **Where you are.** Stage of change plus a 0–10 motivation slider (Ex 3.1). This sets the app's tone and recommended path.
5. **Medical safety check** (not a diagnosis). "Do you drink heavily every day, or use benzodiazepines or opioids?" If yes, a card explains that stopping suddenly can be dangerous and says to talk to a doctor about safe withdrawal, with a link to resources.
6. **Make SOS useful on day 1.** Pick 3 quick reasons (editable chips drawn from the book's examples), add one Safety Net contact (optional), and choose a region for crisis lines.
7. **Rhythm.** Check-in times, the weekly review day, and a learning pace (gentle, steady or focused) that sets up the Learning Roadmap.
8. **First-run tour and SOS practice drill**, about 2 minutes, skippable and replayable. Then the person lands on Today with "Start Here" as the first suggested lesson.

::: safety
Alcohol and benzodiazepine withdrawal can be life-threatening, and opioid use carries overdose risk. The safety check is the only onboarding step that cannot be skipped. Its wording is reviewed by a clinician before any public release (Part 5.1).
:::

**Why it helps**

The book opens by saying who it can help, that it is not a replacement for treatment, and that your stage of change should shape what you do first. Onboarding mirrors that: it sets expectations honestly, respects where the person is, and seeds the Reasons Card so that SOS has something personal to show on the very first night.

::: moment
Jordan is not sure they want to quit, and they hate being lectured. The welcome screen says the app is a skills coach, not treatment, and that it will not diagnose anything. Jordan sets a PIN, picks cannabis, chooses "in recovery" as their word, and taps "I'm not sure yet". They say they are in the Contemplation stage and rate their motivation 5 out of 10. The safety check does not apply to them. They pick three reasons from the chips, skip the Safety Net for now, choose their region, and pick the gentle pace. The tour starts; they skip it. Today opens with "Start Here".
:::

**Book exercises covered**

Ex 3.1 (stage of change and motivation rating) and the seed of Ex 3.2 (three quick reasons). The withdrawal caution comes from the book's safety guidance in chapters 1 and 2.

## 3.2 SOS: craving, feeling, slip, urgent help

> In short: SOS is the most important feature. It is one tap away on every screen, works offline with no login, and walks the person through a craving, a hard feeling or a slip using their own reasons, people and skills. Urgent help sits at the top at all times.

**What it does**

SOS has four entry points: **I'm craving**, **I'm feeling…**, **I slipped**, and **I need urgent help**. The design rules are strict: it works offline, nothing to read is longer than two lines, it can be used with one hand, it is dark by default at night, and it never shows a lesson, a tip or an upsell. The following four sections take the entry points in turn.

**Why it helps**

The book's advice for the craving moment is to surf the urge, distract yourself, delay the decision by 15 to 20 minutes, breathe with SOBER, look at your reasons, and call a Safety Net. SOS puts all of that behind one button, using what the person already wrote in the Workbook. Logging happens as a by-product: the SOS session becomes a craving log entry (Ex 5.4), so the person never has to fill in a form afterwards.

### I'm craving

> The craving flow starts a 15-minute wave timer and offers five tools, then asks what helped and whether the person used.

The flow follows the plan's diagram exactly:

1. **Optional 0–10 rating.** The 15-minute wave timer starts.
2. **Pick a tool, or "guide me".**
   - **Ride the wave:** SOBER or urge-surfing audio. SOBER is a short breathing practice (Stop, Observe, Breathe, Expand awareness, Respond mindfully).
   - **Remind me why:** the person's Reasons Card.
   - **Call someone:** Safety Nets with call and text buttons, and a meeting finder.
   - **Distract me:** the person's distraction deck.
   - **Talk back:** their Comebacks, plus a quick "three T's" thought trial.
3. **Timer ends: re-rate.** Still strong? Delay another 15 minutes and pick again. Passed? Say what helped, which saves a craving log automatically.
4. **"Did you use?"** No: the wave is surfed and the skill used earns XP. Yes: the Lapse Recovery flow opens (see "I slipped").

"Guide me" runs a default sequence: SOBER for 2 minutes, then the Reasons Card, then one distraction, then a re-rate. Over time the order is personalised by what the person rated as helpful. A context prompt asks "Are you somewhere risky right now? Leaving is a valid move."

::: moment
It is 7:40 pm and Sam is alone in the flat. The craving is a 7. Sam taps SOS and "I'm craving", slides to 7, and the wave timer starts. "Remind me why" shows the three reasons Sam wrote in week one, in big text. Then "Call someone" shows Mia at the top of the Safety Nets, and Sam sends a text. When the timer ends the craving is a 3. Sam taps "what helped": Reasons Card and texting Mia. The session saves itself as a craving log. No form, no lesson, no badge screen, just "wave surfed".
:::

**Book exercises covered:** Ex 5.4 (craving log), 6.3 and 6.3b (thought challenge, distraction list), 7.4 (SOBER), 3.2 (Reasons Card), 4.4 (Safety Nets), and the book's surf, distract and delay skills from chapter 6.

### I'm feeling…

> The feelings branch routes anger to "give it a beat" and sadness or anxiety to SOBER, reassurance and reaching out, and always ends with an emotion log.

The person picks an emotion: angry, sad or down, anxious, lonely, bored, ashamed, or other.

- **Anger → Give it a beat.** A count-to-10 timer, a "step away" prompt, breathing, self-talk cards, and a ready-made assertive line such as "I'm upset; I need time to gather my thoughts."
- **Sad or anxious.** SOBER, reassuring phrases, acceptance phrases, a quick pleasant activity, and "call someone".
- **Always:** an optional motivation re-rate and an emotion log entry (Ex 9.1 or 9.2).

::: safety
If the person selects thoughts of death or suicide in the mood content, or gives an extreme hopelessness rating, the app opens the urgent-help screen immediately (Part 5.1).
:::

::: moment
Alex has just had an argument with their brother and feels the old heat rising. They open SOS and tap "I'm feeling… angry". The screen says to give it a beat and starts the count to ten. A card suggests stepping away. Another offers the line "I'm upset and I need time to gather my thoughts", which Alex sends as a text instead of calling back. The app logs the emotion and asks, gently, whether Alex wants to re-rate their motivation. They do: still a 9.
:::

**Book exercises covered:** Ex 9.1 and 9.2 (mood and anxiety logs), 9.6 (revisit motivation), and the chapter 9 "give it a beat" and quick-coping tools.

### I slipped

> The Lapse Recovery flow leads with compassion and safety, shows the person's own spiral thoughts next to rebuttals, offers one-tap reach-out, and follows up within a day with a Slip Review. Nothing is ever taken away.

1. **Compassion first.** "A slip isn't a relapse. You opened this. That's your rational brain."
2. **Safety check.** Are you safe right now? If the substance is opioids or another depressant after a break, lower tolerance means higher overdose risk: don't use alone, naloxone information, the emergency number. Alcohol and benzodiazepine withdrawal cautions show where relevant.
3. **Stop the spiral.** The person's own spiral thoughts (Ex 5.2c) appear next to rebuttals such as "I can stop now. This doesn't erase my progress."
4. **Reach out.** One tap to a Safety Net, sponsor or counsellor.
5. **Within 24 hours:** the Slip Review (Ex 10.2), a motivation revisit (Ex 3.2 and 3.3), and "step up support" actions that feed back into My Recovery Plan.

Counters: total sober days and all XP, badges and skill levels stay exactly as they were. The "current run" restarts quietly, and it is only shown if the person opted in.

::: safety
The moment after a slip is the highest-risk moment for someone who used opioids, because tolerance drops during abstinence. The plan goes beyond the abstinence-only book here on purpose, because this is life-safety information. All of this copy is flagged for clinical review.
:::

::: moment
Seven months in, Alex slips. They open "I slipped". The first screen does not scold; it says opening the app was the rational brain at work. The next screen asks whether they are safe right now and, because Alex's substance is opioids, explains that their tolerance is lower now and shows naloxone information and the emergency number. Then Alex sees their own spiral thought from the workbook, "once an addict, always an addict", beside a rebuttal they wrote months ago. One tap calls their NA sponsor. The next morning the app offers the Slip Review. Alex's total sober days, badges and skill levels are untouched.
:::

**Book exercises covered:** Ex 5.2c (spiral thoughts), 10.2 (Slip Review), 3.2 and 3.3 (motivation revisit), and the chapter 10 "three steps after a slip".

### I need urgent help

> The crisis screen shows region-aware crisis lines, the emergency number, poison control, overdose steps and an international directory, and it is always one tap from SOS.

It is shown at the top of SOS at all times and is also opened automatically by crisis signals (Part 5.1). Phone numbers show as selectable text with call and copy buttons. The numbers live in a per-region content file so they can be updated without changing code, and every number is marked "needs verification" until the owner has checked it (Step 1.3).

::: moment
Alex is at a friend's place when someone else in the room stops responding. Alex taps SOS and the "Need urgent help?" line at the top. The screen shows the emergency number with a call button, the overdose steps including naloxone, and poison control. No rating, no timer, no tutorial.
:::

**Book exercises covered:** none directly. The screen draws on the book's resources section and adds crisis, overdose and withdrawal information that the plan treats as essential.

## 3.3 Learning journey and the module table

> In short: Eleven modules and about 55 to 60 lessons of 3 to 6 minutes each, following the book's order, with every lesson ending in the real exercise. The order is recommended, never forced, and SOS is never locked.

**What it does**

The Journey has about 55 to 60 lessons in 11 modules. The suggested pace is about one module a week, which matches the book's advice to practise before moving on. The modules, their book chapters and what they unlock:

@widths 0.5,1.5,0.5,2.2,1.9
| # | Module (app name) | Book | Lessons (draft) | Exercises in tutorial mode → what they unlock |
|---|---|---|---|---|
| M0 | **Start Here** | Intro | What this app is · Two brains · How to use the Journey | SOS tour, Reasons Card quick-start |
| M1 | **Understand Addiction** | Ch 1 | How use becomes addiction · Signs and symptoms · "Why me?" risk factors · Asking for help | Ex 1.1, 1.2, help-request script, program checklist |
| M2 | **Your Brain Can Heal** | Ch 2 | The dopamine flood · Learned cues · Addicted vs. rational brain · Treatment and medications · The brain heals | Quizzes only → Brain Map intro |
| M3 | **Step 1: Find Your Why** | Ch 3 | Stages of change · Ambivalence is normal · Decisional balance · Four lenses · "+1 point" | Ex 3.1, 3.2, 3.3 → Reasons Card, Motivation Meter |
| M4 | **Step 2: Set Yourself Up** | Ch 4 | Clear the space · Seemingly irrelevant decisions (interactive story) · Move your body · Safety Nets · Saying it assertively and saying no · Grow your network and groups | Ex 4.1–4.7 → Support Network, Scripts, Exercise plan, quests |
| M5 | **Step 3: Become a Self-Expert** | Ch 5 | The chain · Your triggers · Red flag thoughts · Six thinking traps (Distortion Sort) · The spiraling lapse · Your craving signature and self-monitoring | Ex 5.1–5.4 → Trigger Profile, Red Flags, Craving Signature, craving log |
| M6 | **Step 4: Outsmart the Addicted Brain** | Ch 6 | Put it on trial · Superficial truths · Thinking vs. doing · Surf, distract, delay · Plan your day · Battle Plans | Ex 6.1–6.5 → Comebacks, Distraction deck, Planner, Battle Plans |
| M7 | **Step 5: Be Present** | Ch 7 | What mindfulness is · Autopilot · Body scan · Everyday mindfulness · Breathing · SOBER · Acceptance and self-compassion | Ex 7.1–7.4 → audio practices, SOBER in SOS |
| M8 | **Step 6: Rediscover Joy** | Ch 8 | Rewards and recovery · Track your days · Should dos and want tos · Pleasant (not risky) activities · Obstacles · Pleasure predicting · Reward follow-through | Ex 8.1–8.7 → Activity Library, Balance, experiments, Rewards |
| M9 | **Step 7: Handle Hard Feelings** | Ch 9 | Mood and recovery · Mood and anxiety logs · Challenging negative thoughts · Anger: give it a beat · Quick coping and revisiting motivation | Ex 9.1–9.6 → emotion logs, Anger Signature, "I'm feeling…" SOS |
| M10 | **Your Recovery Plan** | Ch 10 | Weekly look-ahead · Warning signs · Stopping a slip · Build my plan (graduation) | Ex 10.1–10.3 → Warning Sign Radar, My Recovery Plan, Weekly Review |

**Order and unlocking.** The Learning Roadmap shows the recommended order and pace, but it does not hard-lock content. SOS and crisis tools are never gated. Lessons unlock *personalisation*, not *access*. Motivation (M3) can be revisited at any time, as the book recommends. People in the Contemplation stage get a path that brings M3 forward and softens the tone.

**Why it helps**

The book says to do its seven steps in order, to practise each exercise again and again, and to return to the motivation chapter whenever needed. The Journey keeps that structure while turning each chapter into short sessions that fit a phone and a tired evening.

::: moment
It is week three. Sam's Roadmap says this week's focus is Step 3, Become a Self-Expert. Sam opens the lesson on triggers, swipes through four short cards, answers two check questions (every answer gets an explanation, there is no fail state), and then does the real trigger exercise with the app's examples beside each field. The wrap screen says what Sam built, that it now lives in Workbook → Know Myself, and suggests one action: log the next craving using the new trigger chips.
:::

**Book exercises covered:** all of them, module by module, as the table shows. Appendix B has the full exercise-by-exercise map.

## 3.4 Lesson format

> In short: Every lesson has the same five parts: a story moment, a few concept cards, a quick check with no fail state, the exercise in tutorial mode, and a wrap that says what you built and suggests one action.

**What it does**

1. **Moment.** A 30-second story beat with an original character from the app's own cast.
2. **Concept cards.** Two to five swipeable cards in plain language, each with an illustration.
3. **Check.** One to three quick questions. No fail state; every answer gets an explanation.
4. **Try it.** The exercise in tutorial mode, with worked examples and a hint for each field. "Finish later" is allowed.
5. **Wrap.** What you built, where it lives, and one suggested action, which becomes a to-do in Actions.

**Why it helps**

The book teaches with short case stories, plain explanations and an exercise to do straight away. The lesson format keeps that rhythm and adds what a book cannot: the exercise is interactive, the answers are kept, and the suggested action turns learning into doing.

::: moment
Jordan opens the M3 lesson "Ambivalence is normal". The story moment follows one of the app's original characters wavering about a quit date. Three cards explain that mixed feelings are expected at every stage. The check asks one question; Jordan picks the "wrong" answer and gets a kind explanation instead of a red cross. "Try it" opens the decisional balance exercise (Ex 3.2) in tutorial mode, with example chips in each of the four boxes. Jordan fills two boxes and taps "finish later". The wrap says the Decisional Balance now lives in Workbook → My Why and suggests finishing the other two boxes tomorrow, which appears as a to-do.
:::

**Book exercises covered:** every exercise, because each lesson's "Try it" is the exercise for that chapter.

## 3.5 Workbook artifacts

> In short: The Workbook tab holds everything the person has built: their reasons, triggers, red flags and comebacks, people, scripts, activities, warning signs and, finally, My Recovery Plan. Every artifact can be viewed, edited, practised with, and exported, and every save keeps a history.

**What it does**

@widths 1.6,1.4,2
| Artifact | Built by | Reused in |
|---|---|---|
| **Reasons Card** (drawbacks of using, benefits of quitting, "my life will be different because…") | Ex 3.2, 3.3 (seeded in onboarding) | SOS first screen, lock-screen wallpaper export, lapse flow, weekly review |
| Decisional Balance (2×2) | Ex 3.2 | Motivation revisits |
| Motivation history (0–10 over time and "+1" notes) | Ex 3.1, 3.3, 9.6 | Insights, weekly review |
| **Trigger Profile** (internal and external; ✓ experienced, ★ frequent; craving and anger tags) | Ex 5.1, 9.4 | Log chips, Battle Plans, insights, activity risk-check |
| **Red Flags and Comebacks** | Ex 5.2 → 6.1 and 6.2 | SOS "Talk back", the Courtroom |
| Thought Journal (tagged by thinking trap) | Ex 5.2b, 9.3 | "Put It On Trial", insights |
| Spiral thoughts | Ex 5.2c | Lapse Recovery |
| Craving and Anger Signatures (body map, feelings, thoughts) | Ex 5.3, 9.3b | Log pre-fill, SOBER "Observe" step |
| **Support Network** (Safety Nets, risky people and their strategy, sponsor, therapist) | Ex 4.4, 4.6 | SOS "Call someone", Battle Plans, Recovery Plan |
| Scripts ("I feel… when… I need…", refusals, help requests) | Ex 4.5, refusal skills, Ch 1 | Role-play, before hard conversations |
| **Activity Library** (should or want, "risky for me" flag) | Ex 8.0, 8.2, 8.3 | Planner, "Want-to of the day", gap filling |
| Distraction deck | Ex 6.3b | SOS "Distract me" |
| **Warning Signs** (top 3 with plans) | Ex 10.1 | Warning Sign Radar |
| **My Recovery Plan** | Ex 10.3 (auto-pre-filled) | SOS, export, monthly review |

Every artifact supports view, edit, version history (each save is a snapshot), "practice with this", and export or print. Sensitive ones, such as the risk factors from Ex 1.2, can be hidden behind an extra lock. The tab groups them as My Why, Know Myself, My People, My Joys, and My Recovery Plan.

**Why it helps**

The book's exercises are meant to be revisited, not done once. In a paper workbook, the answers stay on the page. Here they become living tools that reappear exactly where they are needed, in the person's own words, which is design principle 3.

::: moment
Alex opens Workbook → Know Myself → Trigger Profile. "Waking up" has been coming up a lot lately, so Alex marks it with a star for "frequent". The version history shows the profile Alex built in month one beside today's. From the same screen, "practice with this" offers the Battle Plan drill using that trigger.
:::

**Book exercises covered:** Ex 3.1, 3.2, 3.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.2b, 5.2c, 5.3, 6.1, 6.2, 6.3b, 8.0, 8.2, 8.3, 9.3, 9.3b, 9.4, 9.6, 10.1 and 10.3.

## 3.6 Track and insights

> In short: One quick-log for cravings, feelings and check-ins, designed to take under 20 seconds, plus gentle insights computed on the phone and counters that never reset.

**What it does**

All logs use one data model with typed sections, so there is one "+" button instead of five forms:

- **Craving** (Ex 5.4, optional 6.3): time (automatic) · situation and trigger chips · thought (text and red-flag chips) · feelings chips · intensity 0–10 · what I did (skill chips) · helped? (1–5) · used? (Y/N) · optional "Put it on trial".
- **Feeling** (Ex 9.1 and 9.2): emotion · intensity 0–10 · situation · thought · same-day craving 0–10.
- **Morning check-in** (1 minute): a glance at today's plan · risky blocks → Battle Plan · one want-to · an intention.
- **Evening check-in** (1 to 2 minutes; Ex 8.1 daily totals and chapter 10 warning-sign inputs): mood 0–10 · anxiety 0–10 (optional) · peak craving 0–10 · pleasant activities (auto-counted, editable) · used today? · sleep quality · meeting or therapy attended?
- **Activity logs:** exercise (Ex 4.3), mindfulness minutes, meetings, pleasant activity done.
- **The 7-Day Activity Experiment** (Ex 8.1, hourly tracking): a time-boxed quest, not a forever chore.
- **Voice input** on every text field where the phone supports it.

**Insights** are computed on the device and written as gentle observations with small-sample caveats: craving intensity over time; top triggers; a time-of-day and day-of-week heat map that feeds "risky times" suggestions; mood against pleasant-activity count against craving (the book's core claim from chapter 8, shown on the person's own data); a skill helpfulness ranking that feeds the Recovery Plan; pleasure predicted against actual; and motivation history.

**Counters** never reset: total sober days · urges surfed · plans followed · pleasant activities done · mindful minutes · and, optionally, money and time reclaimed.

**Why it helps**

Chapter 5 of the book asks for daily, real-time self-monitoring of triggers, thoughts, feelings and craving strength, and says patterns appear over time. Chapter 8 asks for a week of hourly tracking to see how activities and mood connect. The quick-log makes the daily part fast enough to actually happen, and insights do the pattern-finding the book asks the reader to do by hand.

::: moment
Sam logs a craving in the car park in about fifteen seconds: time is automatic, "after work" and "alone" are chips from Sam's Trigger Profile, the thought "just one" is a red-flag chip, intensity 6, what I did: "called Mia", helped: 4. After Sam's eighth log, Insights appears on Today with a note: "Most of your cravings so far have been between 7 and 9 pm. This is from a small number of logs, so treat it as a hint." The Planner starts suggesting want-tos for that window.
:::

**Book exercises covered:** Ex 5.4, 6.3, 8.1, 9.1 and 9.2 (one log model), Ex 4.3 (exercise log), the chapter 7 practice minutes, and the motivation history from Ex 3.1 and 9.6.

## 3.7 Actions: planner, Battle Plans, weekly review, quests, rewards

> In short: The Actions tab is where plans turn into real days: a planner that spots empty risky time, Battle Plans for high-risk events, a five-minute weekly review, quests built from the book's exercises, pleasant activities with self-chosen rewards, and to-dos that lessons generate.

**What it does**

- **Planner** (Ex 6.4): day and week views. Blocks are typed *should*, *want*, *recovery* (meeting, therapy, exercise) or *risky*. Gap detection flags unstructured time, which chapter 10 lists as a warning sign, and suggests want-tos at the person's risky times.
- **Battle Plans** (Ex 6.5): attached to risky blocks or events, with situation · plan · backup 1 · backup 2 · buddy · exit plan. A reminder fires beforehand. A debrief follows: "Did you use your plan? How did it go?" Plans can be exported to the phone calendar as a .ics file (a standard calendar-event file that any phone calendar can import).
- **Weekly Review** (chapter 10, strongly suggested for the first 6 months; about 5 minutes): last week's highlights → motivation re-rate and "+1" → upcoming high-risk situations become Battle Plans → schedule 3 want-tos with rewards (Ex 8.7) → exercise target (Ex 4.2) → pick a focus skill.
- **Quests** (one-off and short series, from the exercises): Clear the Space · Build Your Crew · Try an Exercise · 7-Day Activity Experiment · SOBER Training (4 stages) · Everyday Mindfulness (3) · Prediction Lab (5) · Script Rehearsal.
- **Pleasant activities and rewards:** library → risk check ("Could this trigger me?") → schedule → do → a self-chosen real-world reward (Ex 4.3, 8.7).
- **To-dos** generated by exercises, for example "Delete dealer numbers" or "Text Mia about coffee".

**Why it helps**

Chapter 6 says to keep a schedule so that high-risk times are visible in advance, and to have a plan plus backups for situations that cannot be avoided. Chapter 10 asks for a weekly look-ahead for at least the first six months. Chapter 8 says to schedule pleasant activities, put them in the riskiest hours, and reward follow-through. Actions is all of that as one habit.

::: moment
On Sunday evening Sam does the Weekly Review. The highlights show four cravings surfed and three want-tos done. Motivation re-rates as a 7, up from 6, and Sam writes a "+1" note. The next step asks about high-risk situations this week: a work dinner on Thursday. Sam turns it into a Battle Plan: drive there so leaving is easy, order first, backup 1: sparkling water with lime, backup 2: step outside and text Mia, exit plan: leave after the main course. The plan goes to Sam's calendar as a .ics file, a reminder is set for Thursday afternoon, and on Friday morning the app asks how it went.
:::

**Book exercises covered:** Ex 6.4 (daily schedule), 6.5 (Urge Planner), 10.w (weekly look-ahead), 8.4 (activity scheduling), 8.7 (rewards), 4.2 (exercise commitment), 4.1 (paraphernalia quest), 4.7 (expand your network), 7.2 (everyday mindfulness), 7.4 (SOBER practice), 8.1 (activity experiment), 8.5 and 8.6 (pleasure predicting), and 4.5 (script rehearsal).

## 3.8 My Recovery Plan

> In short: The capstone of the Journey: a living relapse-prevention plan that the app pre-fills from the person's real data, which they edit and confirm, celebrate at graduation, export for a therapist or sponsor, and review monthly. It is pinned in SOS.

**What it does**

- **Auto-pre-filled from real data:** skills ranked by helpfulness and use, Safety Nets, top triggers, warning signs and their plans, the Reasons Card, standard Battle Plans, and mood and anger tools. The person edits and confirms each section, following the structure of Ex 10.3.
- **Graduation** at the end of M10: a celebration plus a printable or PDF plan to share with a therapist or sponsor.
- **Pinned in SOS.** A monthly "still true?" review. After 6 months, the app suggests **Maintenance mode**: a lighter Today screen, a weekly cadence, and the Warning Sign Radar staying on.

**Why it helps**

Chapter 10 asks the reader to look back over every skill in the book, tick the ones that actually helped, and write their own go-to list of skills, people and plans. Because the app has recorded which skills the person used and rated, it can draft that list honestly instead of from memory.

::: moment
Alex finishes M10. The plan opens already filled in: SOBER and "call someone" at the top of the skills list because Alex rated them highest, their sponsor and two Safety Nets, "waking up" and "boredom" as top triggers, three warning signs with the plans Alex wrote, and the Reasons Card. Alex edits one section, confirms the rest, and exports a PDF to bring to the next meeting with their sponsor. Because Alex is past six months, the app suggests Maintenance mode. The plan now sits at the top of SOS.
:::

**Book exercises covered:** Ex 10.3 (the personalised relapse prevention plan), 10.1 (warning signs), and 10.w (weekly look-ahead).

## 3.9 Resources

> In short: Crisis lines, how to find treatment, educational medication information, mutual-help groups and meeting finders, therapist finders and mindfulness audio, all kept in a content file so links can be updated without code and shown by region.

**What it does**

Resources includes crisis lines; finding treatment, with the book's "questions to ask a treatment program" checklist; medications (educational, dated, and linked to authoritative sources); mutual-help groups such as AA, NA and SMART Recovery, and meeting finders; therapist finders; and mindfulness audio. It is region-aware.

**Why it helps**

The book ends with a resources section and, in chapter 1, a checklist of questions to ask a treatment programme. Keeping this in a content file, rather than in code, means a volunteer can update a phone number without touching the app.

::: moment
Jordan is curious about groups but does not want anything religious. In Resources they find SMART Recovery described as a CBT-based alternative, and a meeting finder for their region. They also read the "questions to ask a treatment program" checklist and save it, in case they ever decide to call one.
:::

**Book exercises covered:** Ex 1.y (questions to ask a treatment program) and the medication information from chapter 2, plus the book's resources section.

## 3.10 Settings and privacy controls

> In short: Everything that keeps the app private and the person in control: app lock, discreet mode, their choice of words, notification limits, export, import and delete, accessibility options, Calm mode, and Help & tutorials.

**What it does**

App lock (PIN first, biometric in the native phase) · discreet mode · terminology · notifications with quiet hours and a daily cap · export (full JSON and PDF; JSON is a plain text format that other programs can read) · import · delete everything · a backup reminder · accessibility (text size, a dyslexia-friendly font, reduced motion, high contrast) · Calm mode (game layer off) · Help & tutorials.

**Why it helps**

The book's own case stories include someone hiding use from family. The plan's threat model names the people at home, a lost or shared phone, notification previews, cloud backups, and any future feature that sends text off the device. Settings is where the person decides how discreet and how playful their app is.

::: moment
Sam shares a flat. In Settings, Sam turns on discreet mode so notifications just say "Time for your check-in", sets the app lock to auto-lock after a minute, and sets quiet hours overnight. When the monthly backup reminder appears on Today, Sam exports a JSON file to private storage, after confirming the PIN. The "delete everything" option is there too, behind a two-step confirmation.
:::

**Book exercises covered:** none directly. The therapist and sponsor PDF export reflects the book's advice to use it alongside therapy.

## 3.11 The in-app tutorial system

> In short: The app teaches itself gradually, by doing: a two-minute tour, an SOS fire drill, just-in-time tutorials the first time a feature appears, practice drills, one small tip a day, and an Explorer checklist. Nothing is ever shown during a real SOS session.

**What it does**

The principles: just in time (teach a feature when it first becomes useful); learn by doing (every tutorial step is a real tap on the real screen); short (one sentence per step, three to five steps, under 60 seconds); skippable and replayable (from Help & tutorials); never in a real crisis; and guided by the Rational Brain companion, or shown plainly in Calm mode.

@widths 1.3,2.2,1.5
| Part | What it is | When it appears |
|---|---|---|
| 1. First-run tour (~2 min) | Spotlights on the five tabs and the SOS button. Ends at the SOS drill. | Right after onboarding. Skippable. |
| 2. SOS practice drill | A calm, one-minute run through the craving flow with sample content, like a fire drill. Saved as practice, never as a real log. | End of the first-run tour, then offered again once a week for the first month and after building new SOS content |
| 3. Just-in-time tutorials | A 3–5 step walkthrough the first time each feature appears, ending by doing the thing once. | First visit to a feature, or when a lesson unlocks it. "Show me / Later" every time. |
| 4. Practice drills ("Training") | Short practice versions of key skills with sample data: SOBER, quick-log, Battle Plan, Put It On Trial, refusal. | Offered at the end of the lesson that teaches the skill. Always under Help & tutorials → Training. |
| 5. Contextual tips ("Did you know?") | One small tip based on what the person actually does. | At most one a day, never during SOS, switchable off. |
| 6. Explorer checklist | A "Get to know your app" list of about 12 first actions with a progress ring. Finishing it earns the Explorer rank. | On Today until finished or dismissed, then under Help & tutorials |

**Progressive feature reveal.** New features appear as the Journey reaches them, each with a small "New" dot and its tutorial. SOS, crisis help, quick-log and check-ins are there from day 1. Nothing is truly locked: "Show all features now" in Settings reveals everything at once (Proposed: decide in Part 10, D17).

@widths 1,4
| When | What appears (with its tutorial) |
|---|---|
| Day 1 | Today, SOS (with the drill), quick-log, evening check-in, Reasons Card (quick), Learn: Start Here |
| After M0–M2 | Workbook tab, Learning Roadmap Plan view, glossary |
| After M3 | Motivation Meter, Decisional Balance, full Reasons Card, lite Weekly Review |
| After M4 | Support Network, Scripts, quests, exercise plan |
| After M5 | Trigger Profile chips in logs, Red Flags, Insights (once there are 7 or more logs) |
| After M6 | Planner, Battle Plans, Comebacks in SOS "Talk back", Training drills |
| After M7 | Audio practices, SOBER Training quest |
| After M8 | Activity Library, Rewards, Prediction Lab |
| After M9 | Personalised "I'm feeling…" tools, emotion insights |
| After M10 | Recovery Plan, Warning Sign Radar, full Weekly Review, Maintenance mode later |

**Help & tutorials** (in Settings and behind the "?" on every screen) offers: replay any tutorial, a searchable "How do I…?" list where each answer is a few lines plus a "Show me" button, the Training drills, tips on or off, and the glossary.

**Why it helps**

Someone in early recovery has less attention to spare, and the app has many features. Showing them all on day one would overwhelm anyone. Teaching by doing, at the moment a feature becomes useful, is how good games and productivity apps avoid that, and the plan makes it a rule that every feature ships with its own tutorial.

::: moment
After finishing M6, Sam opens the Planner for the first time. A three-step walkthrough appears: "This is tonight. Tap the empty block after dinner." Sam taps it. "Mark it risky." Done. "Now attach a Battle Plan." The tutorial ends with Sam having actually planned the evening. The next day, after Sam logs a craving with a red-flag thought, a single tip appears: "You can talk back to that thought. Try Put It On Trial." That is the only tip Sam sees that day.
:::

**Book exercises covered:** none directly. The drills rehearse the chapter 5, 6 and 7 skills with sample data so the first real use is not the first time.

## 3.12 The Learning Roadmap

> In short: The home screen of the Learn tab answers four questions at a glance: Where am I? What's next? How long will this take? What do I get at each step? It has a map view and a calendar view, a chosen pace, and no guilt when weeks are missed.

**What it does**

- **Map view:** the 11 modules as a path with milestones. Each stop shows its lessons (done and to do), the skills it teaches, and what it unlocks. Finished stops light up the matching region of the progress map (Part 4).
- **Plan view:** the same journey as a calendar. Each week shows a target module, its practice goals (for example "Try SOBER 3 times this week"), and the next milestone date.
- **Three tracks on one roadmap:** Learn (modules and lessons), Practice (skill mastery levels; a module is truly done when its key skill has been *used* a few times), and Use (the app features introduced so far and the Explorer checklist).
- **Personalised from onboarding:** a pace of Gentle (one module every 2 weeks), Steady (one a week, the recommended default) or Focused (two a week), changeable any time; a starting path that follows the stage of change; and a weekly focus card shown on Today and in the Weekly Review.
- **Checkpoints and milestones:** a one-minute checkpoint reflection at the end of each module ("What helped most? What will you keep doing?") whose answers feed My Recovery Plan; milestones named Self-Expert (after M5), Strategist (M6) and Graduation (M10); then Maintenance mode at 6 months.
- **No guilt.** Missed weeks never turn red or show "overdue". The roadmap simply moves forward: "Welcome back. Pick up where you left off?" with an option to re-plan. After graduation, an optional review mode offers a monthly refresher on one module's key skill.

**Why it helps**

The book says to practise each skill before moving on and to work the steps in order while keeping the door to the motivation chapter open. The Roadmap turns that into a visible path with a realistic pace, and the Practice track makes sure "done" means used, not just read.

::: moment
Jordan chose the gentle pace and the Contemplation path, so their map shows Start Here, then Understand Addiction, then Find Your Why, with the softer wording. Each stop shows what it unlocks; the Reasons Card is the first prize. Jordan then misses two weeks. When they come back, nothing is red. The map says "Welcome back. Pick up where you left off?" and offers to re-plan the weeks ahead. Jordan taps yes and the Plan view shifts forward.
:::

**Book exercises covered:** none directly. The Roadmap implements the book's guidance on order, pace and practice.

# Part 4: Game design

> In short: A gentle game layer called "Two Brains" rewards practice, honesty, planning and reflection, never claims of sobriety. It has guardrails against the loops that could harm this audience, it points toward real-life rewards, and it can be switched off.

## 4.1 Goals and guardrails

> In short: The book itself argues for rewarding follow-through, but people in recovery are vulnerable to compulsive loops and to shame. So the game rewards only behaviour the person controls, keeps all progress forever, and bans randomness, leaderboards and dares.

**Why have a game at all?** The book says to reward yourself for following through, and its evidence says that having many alternative rewards predicts staying sober. Self-Determination Theory (a well-studied theory of motivation) adds that motivation lasts when people feel autonomy, competence and relatedness. The game exists to make practice feel rewarding and to keep the person pointed at real life.

@widths 1,1
| Do | Don't |
|---|---|
| Reward **practice, honesty, planning, reflection** | Give points for *claiming* sober days. That incentivises misreporting and punishes honesty. |
| **Cumulative** progress that never disappears | Streaks that reset to zero on a slip, or "you'll lose your streak!" nudges |
| **Mastery**: skills level up with use, as the book says to practise repeatedly | **Random or variable rewards**: loot boxes, spins, mystery chests. These are gambling-like and carry cross-addiction risk. |
| Meaning and narrative (the Two Brains story) | Leaderboards or social comparison of sobriety |
| Point to **real-world rewards the person chooses** | Engagement or time-in-app goals, infinite feeds |
| Celebrate milestones with words, not loot | Challenges involving exposure to triggers ("can you resist…?") |
| An adult, calm aesthetic, and **Calm mode** to turn it all off | A childish tone, guilt-trip mascots |

::: safety
Contingency management, a treatment that rewards abstinence, works because abstinence is *verified*, for example with tests. An app cannot verify it. So XP attaches only to behaviours the person controls and can report without any incentive to lie. Sober-day milestones get celebrations, never points.
:::

## 4.2 The Two Brains theme, the Brain Map and the Harbor

> In short: The person trains their Rational Brain, a companion they can name, against the Addicted Brain, a voice that speaks their own red-flag thoughts. Progress shows on a map with six regions that light up as skills level up: a stylised brain in the plan's original theme, or a small harbor in the variant added from a concept note the owner found. Proposed: decide in Part 10 (D6).

The plan compared three themes. A fourth was added in October 2026 from a one-page concept the owner found; the review is in `docs/design/game-concept-review.md`.

@widths 1,1.8,1.3,1.3
| Option | Concept | Pros | Cons |
|---|---|---|---|
| **A. Two Brains** (recommended) | Train your Rational Brain (a companion you can name) against the Addicted Brain (an antagonist that literally speaks your own red-flag thoughts in the Courtroom and the Distortion Sort). Meta-progress is a stylised Brain Map. | Native to the book. Reinforces the science. Adult. Turns "noticing thoughts" into a game. | Brain imagery can feel clinical, so it needs warm illustration. Must avoid implying medical healing claims. |
| B. The Road | The book's brakes and "go mode" metaphor as a road trip. Skills are car upgrades; high-risk situations are tricky intersections. | An intuitive "journey" framing | Driving can be a trigger or trauma topic. A weaker link to the content. |
| C. Garden | A garden that grows with practice and never dies. A slip is a passing storm. | Very gentle and calming | Generic, with a weaker link to the book's ideas |
| **D. The Harbor** (world only, with A's mechanics underneath) | A small harbor seen from above instead of a brain map. The six skill regions become places on the shore. Cravings are weather that passes, skills are anchors, SOS is safe harbor, and a slip is a rough passage that leaves the harbor untouched. | Calm, adult and non-clinical, with no healing claim. Fits the book's wave image and the plan's Compass, Radar, "Build Your Crew" quest and SOS. A candidate for a discreet app name. | Must never start neglected or decay. No storm visuals during SOS. Water or sailing can be a hard topic for some people; test it. Needs illustration, like A. |

The recommendation is now **A's structure in D's world, with C's gentleness**: keep the companion, the Courtroom and the Distortion Sort, and draw progress as a harbor that only ever gains light and life. The Brain Map stays the fallback if the harbor tests badly with people in recovery.

**The six regions, as a brain map and as a harbor**

@widths 1.2,1.3,2,0.6
| Region | Harbor place | Skills that grow it | Book |
|---|---|---|---|
| **Command Center** (frontal lobe) | The Lighthouse: its beam cuts through fog and sweeps ahead | Put It On Trial, spotting distortions, Battle Plans, scheduling | Ch 5, 6 |
| **Calm Core** (stress system) | The Cove: still water inside the breakwater | SOBER, breathing, body scan, acceptance, give it a beat | Ch 7, 9 |
| **Joy Circuit** (reward system) | The Garden on the hill: grows only from real-world activity | Pleasant activities, exercise, pleasure predicting, rewards | Ch 4, 8 |
| **Connection Hub** | The Pier: a lantern for each person in the crew | Safety Nets, assertive scripts, refusals, meetings | Ch 4 |
| **Compass** (motivation) | The Compass Rose: the reasons are the heading | Reasons Card, motivation check-ins, "+1" | Ch 3 |
| **Radar** (self-awareness) | The Weather Station: logbook and forecast; the Warning Sign Radar is its radar | Trigger logging, craving and mood logs, warning signs | Ch 5, 9, 10 |

**How the Harbor maps onto the rest of the app**

Nothing mechanical changes; only the picture and the words do. The concept's own language turns out to match the book and the plan almost line for line:

@widths 1.4,2.1,1.5
| In the app | In the Harbor | Book link |
|---|---|---|
| Skill mastery levels 1 to 5 | Anchors that hold better with use | Ch 10 go-to skills |
| A craving or a hard feeling | Weather: a squall that rises, peaks and passes in about 15 minutes | Ch 6, surf the urge |
| SOS | Safe harbor (SOS is the maritime distress call); the wave timer stays as designed | Plan, SOS |
| Red-flag thoughts and thinking traps | Fog, which the lighthouse beam cuts through (Put It On Trial) | Ch 5, 6 |
| A high-risk situation and its Battle Plan | Forecast rough weather and the storm plan: plan, two backups, crew, exit | Ch 6, Ch 10 |
| The Weekly Review | Reading the week's forecast | Ch 10 weekly look-ahead |
| The quick-log and Timeline | Logbook entries (the ship's log is where the word "log" comes from) | Ch 5 self-monitoring |
| A slip | A rough passage; the harbor is untouched and the Slip Review is the honest logbook entry afterwards | Part 4.6 |
| Sober-day milestones | Harbor lights come on; celebration only, no XP | Part 4.4 |
| The companion | The harbor keeper, named by the person, speaking the rational brain's lines; the addicted brain is the voice in the fog, still part of you, never a monster | Ch 2 |
| "Be smart, not strong" | "Don't sail into a storm to test the boat" | Ch 4 |

::: safety
The Harbor is adopted only under four conditions. Nothing ever starts damaged, decays or is taken away. No storm visuals or weather drama inside a live SOS session or the crisis screen. Weather is never a dare. And reactions are tested with people in recovery in the usability study, including anyone for whom water or sailing is a hard topic.
:::

::: tip
The same concept note proposed building the app in Unity, a game engine. That part is not adopted: a Unity app cannot meet the one-second SOS budget, has weak accessibility, cannot be built or tested in cloud sessions, and ships analytics by default. The harbor visuals are a stylised map with six regions, which the chosen web stack handles well (Part 6.1).
:::

::: decision
D6, game theme and intensity. Options: Two Brains, Road, Garden, or the Harbor world with Two Brains mechanics; on by default or opt-in. Recommended default: Two Brains mechanics in the Harbor world, gentle visuals, on by default, with Calm mode available and the Brain Map as the fallback. Proposed: decide in Part 10.
:::

## 4.3 The loops

> In short: Four loops at four cadences: a 15-minute moment, a twice-daily rhythm, a weekly ritual, and the multi-week Journey. Each has a clear payoff that reflects the person's own words back to them.

@widths 0.8,0.8,2.4,1.6
| Loop | Cadence | Flow | Payoff |
|---|---|---|---|
| **Moment** | ~15 min | Craving or feeling → SOS tool → re-rate → "what helped?" | "Wave surfed", XP to that skill, the Rational Brain reflects the person's own words back |
| **Daily** | 2× per day | Morning check-in → plan, risky blocks, one want-to → do a lesson *or* a practice → evening check-in | Daily wins summary, Momentum ring |
| **Weekly** | 1× per week | Weekly Review → Battle Plans for the week → want-tos with rewards → recap | Weekly recap card, Battle Plan debriefs |
| **Journey** | Weeks | Modules → artifacts → progress-map regions → Recovery Plan graduation → Maintenance | Chapter completions, graduation |

## 4.4 XP, skill mastery, momentum and ranks

> In short: XP (experience points) come only from actions the person controls, with diminishing returns to stop grinding. Skills level up with use. Momentum replaces streaks. Ranks follow the book's language. Sober-day milestones are celebrated without points.

**XP table** (illustrative values, to be tuned; repeated identical logs earn less each time)

@widths 3,1
| Action | XP |
|---|---|
| Log a craving or feeling | 5 |
| Morning or evening check-in | 5 |
| Use and rate a skill | 5 |
| Finish an SOS session (any outcome) | 15 |
| Complete a lesson | 10 |
| Build or update an artifact | 20 |
| Make a Battle Plan / debrief it | 10 / 15 |
| Do a pleasant activity / exercise session | 10 |
| Mindfulness | 1 per minute (cap 20 per day) |
| Weekly Review | 25 |
| **Slip Review** (honesty and learning) | 25 |
| Finish a feature tutorial or Training drill (first time only) | 5 |
| Finish the Explorer checklist / a roadmap checkpoint | 25 / 10 |

- **Skill mastery.** About 30 skills from the chapter 10 checklist. Levels 1 to 5 at 1, 3, 7, 15 and 30 uses. Mastered and helpful skills flow into the Recovery Plan.
- **Momentum instead of streaks.** "Practiced on X of the last 14 days." A rolling window that never drops to zero because of one bad day.
- **Ranks** tied to the book's language: Explorer → Self-Expert → Strategist → Mindful Navigator → Builder → Guide, roughly aligned with the modules.
- **Sober-day milestones** (1, 3, 7, 14, 30, 60, 90, 180, 365): celebration messages, no XP. The total count never resets. The current run is shown only if the person opts in.
- **Cosmetic unlocks** (themes, companion looks) are earned deterministically from practice milestones. Nothing random, nothing purchasable.

## 4.5 Quests, mini-games and badges

> In short: Every quest and mini-game comes straight from a book exercise or skill. Victory always means "you practised", never "you resisted a dare". Badges are deterministic and most are earned by doing, one by honesty.

@widths 1.2,0.8,0.7,2.6
| Name | Type | Book | Mechanic |
|---|---|---|---|
| Clear the Space | Setup quest | Ex 4.1 | Checklist of things to remove → "Be Smart, Not Strong" badge |
| Build Your Crew | Quest line | Ex 4.4, 4.6, 4.7 | Add Safety Nets, reach out twice, try a meeting |
| The Big Game | Interactive story | Ch 4 (seemingly irrelevant decisions) | A branching story with an original character. Each "harmless" choice shows the chain toward relapse. Replayable. |
| Distortion Sort | Mini-game | Ex 5.2b | Swipe thoughts into the six thinking traps, with explanations. Then write your own. |
| Spot the Red Flag | Quiz | Ex 5.2 | Find the relapse-justifying lines in a dialogue |
| **Put It On Trial** | Courtroom tool | Ex 6.1–6.3, 9.3 | Prosecution (the evidence for) vs. defence (the facts) → verdict → closing statement saved as a Comeback card |
| Ride the Wave | Calm timer | Ch 6 | A 15-minute wave animation. No score, ever. |
| **Battle Plans** ("bosses") | Planning | Ex 6.5 | A high-risk event is the boss. Plan plus two backups. Victory means you planned and debriefed, not a judgment on the outcome. |
| SOBER Training | Practice quest | Ex 7.4 | Four stages: imagined → stress → emotion → real craving |
| Everyday Mindfulness | Practice quest | Ex 7.2 | Shower · fruit · walk |
| 7-Day Activity Experiment | Tracking quest | Ex 8.1 | Hourly logs for 7 days → insight reveal |
| Prediction Lab | Experiments | Ex 8.5/8.6 | Five predicted-vs-actual experiments → "Mood Lies" badge |
| Refusal Rehearsal | Dialogue game | Ch 4 | Choose-your-response scenes with feedback based on the book's refusal checklist |
| Rewrite the Scene | Reflection | Ex 9.5 | Replay an anger moment and script better responses |
| Explorer checklist | Onboarding quest | (Part 3.11) | About 12 first actions with a progress ring → Explorer rank |
| Training drills | Practice | Ch 5–7 | SOS, SOBER, quick-log, Battle Plan, trial and refusal drills with sample data |

**Badge examples:** *Be Smart, Not Strong* (cleared the space) · *First Wave* and *Wave Rider ×10 / ×50* (urges surfed) · *Self-Expert* (Trigger Profile and Red Flags built) · *Objection!* (10 trials) · *Safety Net Weaver* (3 Safety Nets) · *Said It* (an assertive script used in real life) · *Mood Lies* (actual enjoyment higher than predicted) · *Calm Core* (SOBER in all 4 contexts) · *Planner* (4 weekly reviews) · *Comeback* (completed a Slip Review; framed as courage, shown once and not farmable) · *Graduate* (Recovery Plan built).

## 4.6 How slips are handled

> In short: Nothing is taken away. The companion says "This is data. Let's learn from it." The Slip Review earns XP because honesty is a skill, the Brain Map does not "un-heal" and the Harbor never decays, total sober days are kept, and the current run restarts quietly.

This is the single most important rule of the game design, because the book's "spiraling lapse", reading one slip as total failure, is exactly what a streak reset would trigger. In the app a slip changes nothing that was earned. The person is met with compassion and safety information (Part 3.2), offered a way back, and rewarded for the honest work of the Slip Review. The game state is computed from an event log (Part 6.2), so "nothing is lost" is not a promise but a property of how the data is stored.

# Part 5: Keeping people safe

> In short: The app is a self-help skills app, not a medical device. It is crisis-ready, medically careful, private by design, and written in original words. A clinician reviews every sensitive screen before any public release.

## 5.1 Safety and clinical review

> In short: Crisis help is always one tap away and opens automatically on crisis signals. Withdrawal and overdose information is built in. Medication content stays educational. A licensed addiction professional reviews all sensitive copy, and people in recovery test the tone.

@widths 1.2,3.8
| Area | What the plan says |
|---|---|
| **Positioning** | A self-help skills app, not a medical device. No diagnosis (the book's symptom checklist explicitly is not one). A visible "not a substitute for treatment" note. |
| **Crisis** | "Need urgent help" is always in SOS. The crisis screen also opens when the person selects thoughts of death or suicide in mood content, gives extreme hopelessness ratings, or, optionally, when an on-device keyword check on free text fires (imperfect, but privacy-preserving). It shows region crisis lines (for example 988 in the US), the emergency number, and an international directory. |
| **Withdrawal** | Alcohol and benzodiazepine withdrawal can be life-threatening. Covered in onboarding, M2 and Resources, with "talk to a doctor" before stopping heavy daily use. |
| **Overdose after abstinence** | Tolerance drops, so this is the highest-risk moment for people who used opioids. Covered in the lapse flow and Resources: don't use alone, naloxone, call emergency services. This goes beyond the abstinence-only book, but it is life-safety. |
| **Medications** | Educational, dated and sourced. Always "talk to your prescriber". |
| **Co-occurring conditions** | If mood logs show persistent low mood for more than a month into sobriety (the book's rule of thumb), a gentle, dismissible nudge suggests seeing a professional. |
| **Sensitive content** | Risk-factor items such as abuse and trauma get a content note and can be skipped or hidden. |
| **Age** | 18+ (Proposed: decide in Part 10, D9). Minors need a different design and legal basis. |
| **Clinical advisor** | A licensed addiction professional reviews all lessons, crisis and lapse copy, and medical-safety screens before any public release. |
| **User research** | Paid, consented usability sessions with people in recovery, focused on tone, the SOS flow and reactions to the game. |
| **Ethical engagement** | No dark patterns (design tricks that manipulate people). A notification cap. Easy pause. No ads. No selling data. |
| **Regulatory** (to confirm with counsel) | US: FDA general-wellness positioning; the FTC Health Breach Notification Rule; state consumer-health-privacy laws. EU and UK: GDPR special-category data. HIPAA and 42 CFR Part 2 only matter if partnering with covered entities or treatment programmes. |

::: safety
Three risks are real and are named in the plan as high severity: withdrawal, overdose and suicide. The build guide tags every passage that touches them with a `clinicalReview: true` flag, and Step 6.1 collects all of them into one packet for the clinical reviewer. Nothing goes public before that review (decision D16 names the reviewer).
:::

## 5.2 Privacy and security

> In short: Everything lives on the phone, encrypted with a key derived from the app-lock PIN. No account, no server, no trackers, no ads. Contacts are never uploaded. The person can export, import or delete everything at any time.

- **Local-first.** All data lives on the device in IndexedDB (the browser's built-in database). No account. No server is needed for core features.
- **Encryption at rest.** The database payload is encrypted with a key derived from the app-lock PIN, using WebCrypto AES-GCM with a strong key-derivation function. (WebCrypto is the browser's built-in encryption toolkit; AES-GCM is a standard, well-tested encryption method; a key-derivation function turns a short PIN into a strong key.) In the native phase, the key moves to the iOS Keychain or Android Keystore, the phone's secure storage.
- **App lock:** PIN first, then biometric (fingerprint or face) in the native phase. Auto-lock timeout.
- **Discreet mode:** a neutral app name and icon (native phase), neutral notification text ("Time for your check-in"), no lock-screen previews.
- **The threat model** (the list of what we protect against): someone at home looking at the phone; a lost or shared device; notification previews; cloud backups; a future AI feature sending text off the device.
- **No third-party trackers, ads or analytics kits.** Any future metrics are opt-in, aggregate and anonymous.
- **Contacts** are only what the person types in. They are never uploaded. Calls and texts happen through the phone's own dialler and messaging.
- **Control:** full export as JSON and a human-readable PDF; import and restore; one-tap delete-all; periodic "back up your data" reminders, because browsers can evict storage, especially on iOS.
- **Later sync** (optional): end-to-end encrypted, so the server could not read it.

## 5.3 Content and copyright rules

> In short: The book is copyrighted, so the app's content is written fresh, based on the evidence-based techniques that nobody owns, with original characters and chapter references in the metadata. Proposed: decide in Part 10 (D1, D2).

::: safety
This is not legal advice. The plan says to consult an intellectual-property lawyer before any public release.
:::

@widths 1.1,2.2,0.9,0.8
| Option | What it means | Pros | Cons |
|---|---|---|---|
| 1. Private companion | For personal use only. The app references the book's chapters; the owner keeps their own copy. | Fastest, most faithful | Cannot be distributed or published. Verbatim text still stays out of the repository. |
| **2. Original content** (recommended) | Fresh lessons and exercises built on the evidence-based techniques (CBT relapse prevention, MI and stages of change, mindfulness-based relapse prevention, behavioural activation), which no one owns. Cite research. Attribute named techniques, for example SOBER. Original characters and stories. Optional "see chapter 5" references. | Shippable. Ours to evolve. | Writing effort. Needs clinical review. |
| 3. License from the publisher | Contact New Harbinger permissions to use the text and exercises, possibly as an "official companion". | Faithful, brandable | Cost, time, uncertainty |

The recommendation is to write Option 2 content from the start, so nothing needs rewriting if the app goes public, and to keep the book references in content metadata. The app must not use the book's title or trademarks as its name.

**Content pipeline:** the paraphrased book notes (structure) → lesson outlines → drafted lessons in the content folder (Markdown plus YAML, two plain-text formats for writing and for structured data) → a plain-language check (target reading level US grade 6 to 8) → clinical review → user testing → publish.

**Tone guide:** respectful, curious, hopeful, adult-to-adult. Person-first language ("person in recovery", never "addict" in the app's voice). Avoid "clean" and "dirty" except where the person chose "clean" as their own word. Never moralise. Capture the book's best ideas in spirit (urges are normal, a slip is a learning opportunity, be smart not strong) in our own words.

**Original cast:** 4 to 6 composite characters across substances, ages and backgrounds. Their stories thread through the modules and provide the tutorial-mode examples.

**Audio:** original guided scripts (body scan, breathing, SOBER, urge surfing, mindful walking). Version 1 uses the phone's text-to-speech; recorded voice comes later. All offline.

# Part 6: Technology made simple

> In short: A web app that installs like a phone app, built with widely used tools, keeping all data on the device. Later it is wrapped for the app stores. This part explains the choices in plain words, the architecture, what data is stored, and how quality is checked.

## 6.1 The tech choices in plain words

> In short: Build a PWA with React and TypeScript first, because one codebase runs everywhere and can be built and tested inside Claude Code cloud sessions. Wrap it with Capacitor in Phase 5 for the app stores. Proposed: decide in Part 10 (D3).

@widths 1.3,1.9,1.8
| Option | Pros | Cons |
|---|---|---|
| **PWA: React + TypeScript + Vite** (recommended, Phases 0–4) | One codebase. Runs on any phone or desktop. Instant preview and automated browser testing in cloud sessions. Offline via a service worker. Installable. | Weaker notifications and background work (see 6.3). No widgets. iOS can evict storage. |
| **+ Capacitor wrapper** (Phase 5) | The same code ships to the App Store and Play Store. Native notifications, biometrics, secure storage, shortcuts and widgets via plugins. | Native build tools (Xcode for iOS) are needed outside the cloud container. |
| React Native / Expo | A more native feel | Harder to build and test in a cloud container (no simulators). Two UI styles if a web version is also wanted. |
| Flutter | Polished UI | A new language (Dart). The same simulator problem. |

**The tools, each in one line**

- **PWA (progressive web app):** a website you can install on your phone like an app, which can work offline.
- **React:** a widely used library for building screens out of reusable pieces.
- **TypeScript:** JavaScript with types, which catches many mistakes before the app runs.
- **Vite:** the tool that builds and previews the app quickly.
- **vite-plugin-pwa (Workbox):** adds the offline and "install me" behaviour.
- **React Router:** moves between screens.
- **Tailwind CSS** with accessible headless components (Radix-style): styling, and building blocks like dialogs and sliders that work with screen readers.
- **Dexie:** a friendly layer over IndexedDB, the browser's built-in database, with live queries that update the screen when data changes.
- **Zod:** checks that every piece of content and data has the expected shape.
- **Zustand:** a small store for screen state.
- **Recharts** (or visx): the insight charts.
- **Framer Motion:** animation, respecting "reduce motion" settings.
- **Web Speech API:** the browser's own text-to-speech and voice input, where available.
- **A print stylesheet** or a PDF library for exports.
- **Capacitor:** wraps the web app so it can be published in the app stores and use native phone features.

**Quality tools:** Vitest and Testing Library (unit tests, which check small pieces of code), Playwright (end-to-end tests, which drive the real app in a browser), axe-core (automated accessibility checks), ESLint and Prettier (code style), GitHub Actions (continuous integration, or CI: runs all checks automatically on every push), and npm (installs the packages; already handled by the session-start hook).

::: tip
A concept note the owner found proposed Unity, a game engine, for this app. It was reviewed (`docs/design/game-concept-review.md`) and not adopted: Unity apps start too slowly for the one-second SOS budget, have weak accessibility, cannot be built or tested in cloud sessions, and ship analytics by default. Its SQLite-with-SQLCipher idea is already covered by the encrypted on-device database.
:::

::: decision
D3, platform. Options: PWA then Capacitor · React Native · Flutter. Recommended default: PWA (React + TypeScript) then Capacitor in Phase 5. Proposed: decide in Part 10.
:::

## 6.2 The architecture

> In short: Screens on top, six engines in the middle, an encrypted database and an event log underneath, and a content folder that feeds the engines. The game's state is derived from the event log, so nothing can ever be lost.

@widths 1.4,3.6
| Layer | What is in it |
|---|---|
| **Screens** (the UI layer, built with React) | Today · Learn · Workbook · Track · Actions · SOS |
| ↓ | Screens ask the engines to do the work |
| **Engines** (the app's brains) | Exercise engine (turns a schema into a form) · Game engine (turns events into XP, badges and quests) · Insights engine · Plan generator and warning-sign rules · Reminder scheduler · Guidance engine (tours, tutorials, tips, roadmap) |
| ↓ | Engines read and write the data layer |
| **Data layer** (on the phone) | Dexie / IndexedDB, encrypted · Domain event log |
| **Content folder** (`content/`) | Lessons, exercises, tutorials, resources, copy and cast, validated at build time. It feeds the Exercise engine, the Learn screens and the Guidance engine. |

- **Guidance engine.** Decides which tour, tutorial, tip or roadmap nudge to show, from rules over the event log, such as "first visit to Planner", "M6 finished", or "3 craving logs with a red-flag thought and no trial yet". It enforces the tutorial limits: never during SOS, at most one tip a day, everything skippable and replayable. Tutorials are content, not code: a small file per tutorial lists the steps, each with a target element, one line of copy and the action that completes it.
- **Event-sourced game state.** Domain events (LessonCompleted, LogCreated, SkillUsed, PlanDebriefed, SlipReviewed and so on) are appended to a log. XP, badges, quests and mastery are *derived* from it. Rebalancing the XP table later just recomputes. Nothing is ever lost. It is also easy to test.
- **Warning-sign rules.** Detectors built from Ex 10.1, for example: no meeting logged in 14 days for someone who usually goes weekly · fewer than 2 pleasant activities in 7 days · poor sleep on 3 of the last 5 check-ins · no Safety Net contact in 14 days · large unplanned gaps on weekends · rising negative-emotion intensity. Each detector maps to the person's own plan for that sign.

## 6.3 What data the app stores

> In short: A small set of entities, all on the device: the profile, exercise responses, triggers, thoughts, contacts, activities, log entries, plan items, skill uses, warning signs, counters, the event log, tutorial progress, the roadmap plan and feature reveals. Content is data too, checked automatically.

**The core entities, in plain words**

@widths 1.2,3.8
| Entity | What it holds |
|---|---|
| Profile | Substances, chosen terminology, goal, optional start date, stage of change, region, settings |
| ExerciseResponse | Which exercise, which version of its schema, the answers, and when (append-only, so history is kept) |
| Trigger | Label, kind (internal, people, places, situations, things), frequent ★, tags (craving, anger) |
| Thought | Text, type (red flag, distortion, spiral, negative), thinking-trap type, linked triggers, comebacks |
| Contact | Name, role (Safety Net, risky, sponsor, therapist), strategy for risky people (avoid, limit, set limits), optional phone |
| Activity | Name, category, kind (should, want, recovery), "risky for me", cost, social or solo |
| LogEntry | Type (craving, feeling, check-in, activity, slip), time, intensity, emotion, triggers, thought, feelings, skills used and whether they helped, used?, notes |
| PlanItem | Start, end, activity, kind, risky, the Battle Plan (plan, backups, buddy, exit), reward, status, debrief |
| SkillUse | Which skill, in what context (SOS, log, practice), helpful 1–5, when |
| WarningSign | Which sign, whether it is in the top 3, the plan |
| Counter | Total sober days, current run start, slips |
| DomainEvent | Type, time, payload: the source of truth for the game |
| TutorialProgress | Which tutorial, steps seen, completed, skipped, replays (also covers drills and the Explorer checklist) |
| RoadmapPlan | Pace, start date, module order, weekly targets, checkpoint answers |
| FeatureReveal | Which feature, when revealed, tutorial seen, the "show all features" override |

**Content as data.** All lessons, exercises, resources and app text live in the content folder as Markdown plus YAML files. They are validated by Zod in CI, so a broken exercise cannot ship. The exercise engine renders these field types: check, check★, single, slider, text, list, 2×2 matrix, pair, rows, hour grid, plan with backups, template, body map, timer, audio and date. Responses store the exercise id and schema version, and migrations upgrade old responses when a schema changes.

**Notifications.** A PWA cannot reliably schedule local notifications, and web push needs a server. The plan's recommended option for Phases 1 to 4 is in-app prompts shown on open, plus .ics calendar export for Battle Plans and the Weekly Review so the phone's calendar does the reminding, then native local notifications in Phase 5. The alternative, a tiny push relay server, adds a server, a privacy surface and cost. Whatever the channel: discreet text, quiet hours, a daily cap, and reminders anchored to the person's own risky times (Proposed: decide in Part 10, D5).

## 6.4 Testing and quality

> In short: Every push runs type checks, code-style checks, unit tests, end-to-end tests and content validation. SOS has its own offline test and a one-second performance budget. Every feature ships with its tutorial, and accessibility is checked by machine and by hand.

- Typecheck, lint, unit tests for the engines, rules, XP derivation and insights maths.
- **Content validation in CI:** every lesson and exercise parses; every book reference and artifact exists; every module covers its rows in the exercise inventory.
- **End-to-end tests** (Playwright): onboarding · first-run tour (complete, skip, replay) · the SOS craving flow offline · the SOS drill creates no real log · the lapse flow · export and delete · a full lesson → artifact → SOS reuse · a roadmap pace change and the "welcome back" re-plan.
- **Definition of done for every feature:** it ships with its just-in-time tutorial, a "How do I…?" help entry, and a tutorial end-to-end test.
- **Accessibility:** WCAG 2.2 AA target (the web accessibility standard); axe in CI; manual screen-reader passes on SOS.
- **Performance budget:** SOS interactive in under 1 second from a cold start, offline.

**Repository layout**

@widths 1.2,3.8
| Folder | What lives there |
|---|---|
| `/` | `package.json` at the root (the session-start hook expects it) |
| `src/app/` | The shell, routing and providers |
| `src/features/` | sos, learn, workbook, track, actions, game, settings |
| `src/engine/` | The exercise engine (field components and schema runtime) |
| `src/domain/` | Models, services, insights, rules, the XP table |
| `src/data/` | The Dexie database, repositories, encryption, migrations |
| `src/ui/` | The design system |
| `content/` | lessons, exercises, tutorials, resources, copy, cast |
| `e2e/` | Playwright tests |
| `docs/` | PLAN.md, BUILD-GUIDE.md, book notes, design, decisions (ADRs) |
| `scripts/` | Content tools and build scripts such as this document's generator |

Each settled decision is recorded as an ADR (architecture decision record, a short note saying what was decided and why) in `docs/decisions/`. `CLAUDE.md` is updated with the build, test and run commands when the app is scaffolded. Work goes in small pull requests per feature, opened from the claude.ai interface.

## 6.5 The optional AI coach (later)

> In short: An opt-in AI rehearsal partner is a possible Phase 6 feature. It never sits in the SOS critical path, it strips names and contacts, crisis handling runs first, and it is only proposed on paper in Step 6.4. Proposed: decide in Part 10 (D11).

@widths 1.2,2.4,1.4
| Feature | What it does | Guardrail |
|---|---|---|
| Rehearsal partner | Role-plays a friend offering a drink, or a partner in a hard conversation. Gives feedback against the book's refusal and assertiveness checklists. | Scenario-bounded. The person can stop at any time. |
| Socratic trial helper | Asks the three-T's questions and helps the person find evidence. Never tells them what to think. Ends with a Comeback card in their words. | No advice beyond the skill. |
| Reflection | Summarises the week's logs in the person's words for the Weekly Review. | Only the data the person selects. |

The plan's rules: never in the SOS critical path (SOS stays offline and deterministic); opt-in per feature with a plain-language notice of exactly what text leaves the device, with names and contacts stripped; app-side crisis detection runs first; no medical advice; a small backend holds the API key (never in the app) and streams responses; no prompts logged on the server; and an evaluation set of scenarios, including crisis and manipulation attempts, built before launch. The plan names Claude Opus 5.5 as the default model and says to ask about zero-data-retention eligibility.

# Part 7: The build plan, step by step

> In short: Forty-four small build steps in seven phases, each with a ready-to-paste prompt for Claude Code and a "Done when" checklist. Follow them in order; each one builds on the last. The prompts in this part are copied word for word from the build guide.

The build guide turns the plan into small steps. Each step has a goal, a prompt you paste into a new Claude Code session, and a "done when" checklist. One step usually means one session and one pull request (a pull request, or PR, is a proposed set of changes that you review and then merge into the main version of the project).

::: tip
Before you start: the plan is still a draft. Settle the decisions in Part 10 first (that is Step 0.1). Until then, the steps assume the recommended defaults.
:::

## 7.1 How to run a step in Claude Code

> In short: Open a new cloud session on the repository, paste the step's prompt, let Claude work, try the result, create and merge the pull request, and move on. If something breaks, use the "Fix it" prompt from Appendix C first.

@howto

A few words explained: a *session* is one conversation with Claude Code in which it reads the repository, makes changes, runs the tests and pushes a branch. A *branch* is a separate line of work that does not touch the main version until you merge it. The *preview link* (from Step 0.3 onward) is a web address where the latest main version of the app runs, so you can open it on your phone.

## 7.2 The house rules

> In short: Eight rules that every prompt points to. They are what keep the app safe, private, tested, teachable and accessible, no matter which step you are on.

Every prompt in the guide says "Follow the house rules in docs/BUILD-GUIDE.md." These are those rules, word for word, each followed by a plain-English gloss.

@houserules

@steps

# Part 8: Timeline and milestones

> In short: Roughly 17 to 24 weeks of building for one developer working with Claude Code, in seven phases, with something usable at the end of every phase. The weeks below are computed from the plan's per-phase estimates; they are not dates or promises.

## 8.1 Phase timeline in weeks

> In short: The plan gives each phase a rough estimate. Adding them up, in order, gives a shortest and longest path. Phase 4 can overlap Phase 3, and clinical review should start earlier than Phase 6 for the most sensitive content.

@widths 1.6,1,1.2,1.2
| Phase | Plan's estimate | Cumulative weeks, shortest path | Cumulative weeks, longest path |
|---|---|---|---|
| 0. Decide and scaffold | ~1 week | week 1 | week 1 |
| 1. Safety core MVP | ~2–3 weeks | weeks 2–3 | weeks 2–4 |
| 2. Learn and Workbook | ~4–6 weeks | weeks 4–7 | weeks 5–10 |
| 3. Actions and full coverage | ~4–6 weeks | weeks 8–11 | weeks 11–16 |
| 4. Full game layer | ~3–4 weeks, can overlap Phase 3 | weeks 12–14 | weeks 17–20 |
| 5. Native and polish | ~3–4 weeks | weeks 15–17 | weeks 21–24 |
| 6. Validate and launch | ongoing | from week 18 | from week 25 |

~ The plan sizes the work for one developer plus Claude Code and gives no calendar dates. The cumulative columns simply add the plan's smallest and largest estimates in order. If Phase 4 overlaps Phase 3, the longest path shortens by up to four weeks.

::: tip
Decision D16 says to identify the clinical advisor before Phase 6, "ideally early, for M1/M2 and the lapse flow". In practice that means finding the reviewer during Phase 1 or 2, not at the end.
:::

## 8.2 Milestones and what you could show

> In short: Every phase ends with something you can put in front of people. The most important milestone is the first one that matters to a person in recovery: a working SOS in airplane mode, at the end of Phase 1.

@widths 1.3,1.6,2.1
| Milestone | When | What you could show people |
|---|---|---|
| **Preview link live** | End of Phase 0 | The empty app on a phone with the five tabs and the SOS button; automated checks running on every change. |
| **SOS works offline** | End of Phase 1 | A full SOS craving session in airplane mode, onboarding with the safety check, urgent help, quick logs and Today. You have used it daily for 7 days. Show a clinician the safety flows. |
| **MVP cut line** | Phase 1 plus M3, M5, Battle Plans and Lapse Recovery | The smallest app the plan calls useful: SOS, motivation, self-expert profiles, Battle Plans and no-shame slip handling (see Part 8.3). |
| **Lessons M0–M5 and the Roadmap** | End of Phase 2 | The exercise engine, the lesson player, six modules with tutorial-mode exercises, the Roadmap, the Workbook tab, first insights and XP. Ask designers and testers for tone feedback. |
| **The whole book covered** | End of Phase 3 | Every exercise implemented or consciously deferred: planner, Battle Plans, audio practices, hard-feelings tools, Lapse Recovery, the Warning Sign Radar and My Recovery Plan with PDF export. Run the usability study tasks. |
| **Game layer complete** | End of Phase 4 | The progress map (Brain Map or Harbor), quests, badges and Calm mode, plus the written guardrail review. |
| **Store-ready builds** | End of Phase 5 | iOS and Android builds on a real phone with native notifications and biometric lock. |
| **Sign-offs** | Phase 6 | The clinical review packet, usability results, and the privacy policy and store listing drafts, ready for the clinical advisor and counsel. |

## 8.3 The MVP cut line

> In short: If time is short, build Phases 0 and 1, plus modules M3 and M5 from Phase 2, plus Battle Plans and Lapse Recovery from Phase 3. That is the plan's smallest useful app.

MVP stands for minimum viable product: the smallest version that is genuinely useful. The plan's cut line keeps the safety core (SOS, urgent help, quick logs, Today, the tour and drill, private storage and export), adds the two modules that produce the most personal content (Find Your Why and Become a Self-Expert), and adds the two Phase 3 pieces that matter most in hard moments (Battle Plans and the no-shame slip flow). Everything else can follow.

# Part 9: Risks, and how we handle them

> In short: The plan names nine risks. The four high-severity ones are copyright, user harm, privacy exposure and scope explosion, and each has a specific mitigation that is already built into the steps.

## 9.1 The risk table

> In short: Each risk below is paired with the part of the plan that handles it, so a risk review is really a check that those parts were built as written.

@widths 1.5,0.7,2.8
| Risk | Severity | How the plan handles it |
|---|---|---|
| Copyright or licensing problems | High | Original content (Option 2 in Part 5.3), no verbatim text, review by counsel. |
| User harm (withdrawal, overdose, suicide) | High | Crisis flows, medical-safety copy, clinical review, no diagnosis (Part 5.1). |
| Privacy exposure (family, partner, lost phone) | High | Local-first storage, encryption, app lock, discreet mode (Part 5.2). |
| Scope explosion (about 50 exercises) | High | One schema-driven engine, one log model, phased content, a strict MVP. |
| Gamification backfires (shame, compulsion) | Medium | The guardrails in Part 4.1, Calm mode, user testing focused on reactions. |
| Engagement drop-off | Medium | Value in SOS from day 1, two-minute check-ins, the weekly ritual, artifacts that reflect the person. |
| PWA limits (notifications, iOS storage eviction) | Medium | .ics reminders, a request for persistent storage, export reminders, Capacitor in Phase 5. |
| Self-report inaccuracy | Low–Medium | Reward honesty, never abstinence claims. |
| AI coach risks (later) | Medium | Opt-in, off the critical path, an evaluation set, crisis routing (Part 6.5). |

::: tip
Two of these risks have a person attached: copyright needs an intellectual-property lawyer, and user harm needs a licensed addiction professional. Neither is named yet. Finding them early is the cheapest risk reduction in the whole plan.
:::

# Part 10: Decisions to make

> In short: Eighteen decisions, each with a recommended default. "Accept the default" is a valid answer. Write your answer in the last column, then run Step 0.1 to turn the answers into decision records.

## 10.1 How to decide

> In short: Read each row, pick an option or accept the default, and write it down. Three decisions (D10, D13 and D16) have no default and need your answer.

The plan asks you to read the big picture first, then answer the decisions, then challenge the gamification and safety sections hardest, and finally check the scope against the roadmap. When you have your answers, paste them into the Step 0.1 prompt in Part 7.3, writing "default" wherever you accept the recommendation. Claude Code will create one short decision record per answer and update the plan to match.

::: decision
Three decisions are yours alone and have no recommended default: D10 (which region and language first; this drives the crisis lines and resources), D13 (the app's name, which must not use the book's title), and D16 (who the clinical advisor is). The others can be accepted as proposed.
:::

## 10.2 The decision table

> In short: D1 to D18 from the plan, with their options and recommended defaults, and an empty column for your decision.

@widths 0.35,0.9,1.55,1.55,0.9
| # | Decision | Options | Recommended default | My decision |
|---|---|---|---|---|
| D1 | Audience | Personal use only · public release | Design for public (original content) while dogfooding personally |  |
| D2 | Content approach | Private companion · original content · license | Original content plus book chapter references |  |
| D3 | Platform | PWA → Capacitor · React Native · Flutter | PWA (React + TypeScript) → Capacitor in Phase 5 |  |
| D4 | Accounts and sync | None · optional end-to-end encrypted sync later · accounts from the start | None in v1; optional end-to-end encrypted sync later |  |
| D5 | Reminders before native | In-app + .ics · a tiny push relay | In-app + .ics |  |
| D6 | Game theme and intensity | Two Brains · Road · Garden · Harbor world with Two Brains mechanics; on by default or opt-in | Two Brains mechanics in the Harbor world (Part 4.2), gentle visuals; on by default, Calm mode available; Brain Map as the fallback |  |
| D7 | Goal framing | Abstinence (the book) · also allow "cut down" | Abstinence-focused, with a contemplation path; safety information for everyone |  |
| D8 | Substance scope | Alcohol and drugs (the book) · plus nicotine · plus behavioural | Alcohol and drugs; nicotine optional; behavioural addictions out |  |
| D9 | Age | 18+ · 13+ | 18+ |  |
| D10 | Region and language | Which country first? English only? | *Owner to answer* (drives crisis lines and resources) |  |
| D11 | AI coach | No · later opt-in · core feature | Later, opt-in (Phase 6) |  |
| D12 | Sharing with therapist or sponsor | PDF export · live share | PDF export in v1 |  |
| D13 | Name and branding | Working title "1-addic" | *Owner to pick*; must not use the book's title; consider a discreet name |  |
| D14 | Terminology default | sober · clean · substance-free · user choice | User choice in onboarding |  |
| D15 | Business model (if public) | Free · one-time purchase · donation · subscription | Free, no ads, no data sales; revisit later |  |
| D16 | Clinical advisor | Who reviews content and safety copy? | *Owner to identify* before Phase 6, ideally early, for M1, M2 and the lapse flow |  |
| D17 | Feature reveal | Progressive (as the Journey reaches it) · everything visible from day 1 | Progressive, with a "Show all features now" setting; SOS, crisis help, quick-log and check-ins always visible |  |
| D18 | Default learning pace | Gentle · Steady · Focused | Steady (one module a week), chosen in onboarding and changeable any time |  |

# Appendix A: Glossary

> In short: Every technical, project and recovery term used in this document, in one place. Technical and project words first, then the recovery and book words.

## A.1 App, project and technology words

> In short: The words that come from building software, explained for people who do not build software.

@size 18
@widths 1.3,3.7
| Term | Meaning |
|---|---|
| ADR (architecture decision record) | A short note that records one decision: the context, what was decided, and the consequences. Kept in `docs/decisions/`. |
| AES-GCM | A standard, well-tested method of encrypting data. Used here for the database on the phone. |
| API key | A secret password a program uses to talk to an online service. For the optional AI coach it lives on a small server, never in the app. |
| App lock | A PIN (later a fingerprint or face) that must be entered to open the app. |
| Artifact | Something the person builds in the app and keeps using, such as the Reasons Card or the Trigger Profile. |
| axe-core / axe | A tool that automatically checks screens for accessibility problems. |
| Branch | A separate line of work in the repository that does not touch the main version until it is merged. |
| Capacitor | A tool that wraps a web app so it can be published in the Apple and Google app stores and use phone features such as notifications. |
| CI (continuous integration) | Running all the checks automatically on every change. Here: GitHub Actions. |
| Claude Code | The AI coding tool that carries out each build step from a pasted prompt, in a cloud session on the repository. |
| Cloud session | One conversation with Claude Code that runs on a fresh copy of the repository on a cloud computer. Anything not pushed is lost when it ends. |
| Coach marks / spotlight | Small highlighted hints laid over the real screen to point at a button during a tour. |
| Content as data | Keeping lessons, exercises and app text in plain files rather than in code, so they can be edited and checked separately. |
| Dark pattern | A design trick that manipulates people, for example guilt-trip messages or hard-to-find cancel buttons. Banned here. |
| Dexie | A friendly layer over IndexedDB with "live queries" that update the screen when data changes. |
| Dogfooding | Using your own product daily to find problems before others do. |
| Domain event / event log | A record that something happened ("lesson completed", "skill used"), appended to a list that is never edited. The game's XP and badges are computed from this list. |
| e2e (end-to-end) test | An automated test that drives the real app in a browser the way a person would. Here: Playwright. |
| Encryption at rest | Scrambling stored data so it cannot be read without the key. |
| ESLint / Prettier | Tools that check and tidy code style. |
| FDA general wellness | A US regulatory position for apps that support general wellbeing rather than treat disease. To be confirmed with counsel. |
| FTC Health Breach Notification Rule | A US rule about telling people when health data is exposed. To be confirmed with counsel. |
| Framer Motion | A library for animation that can respect the phone's "reduce motion" setting. |
| GDPR | The EU and UK data-protection law. Health data is a "special category" with extra rules. |
| Harbor (theme option D) | A proposed world for the game layer: a small harbor whose six places light up as skills level up. Reviewed in `docs/design/game-concept-review.md`. See Part 4.2. |
| GitHub / GitHub Actions / GitHub Pages | The service that hosts the repository; its automation for running checks; its free static website hosting, a candidate for the preview link. |
| HIPAA / 42 CFR Part 2 | US health-privacy laws that apply to healthcare providers and treatment programmes. Relevant only if the app partners with them. |
| .ics | A standard calendar-event file that any phone calendar can import. Used for Battle Plan and Weekly Review reminders. |
| IndexedDB | The database built into every modern browser. The app's data lives here, encrypted. |
| iOS Keychain / Android Keystore | The phone's secure storage for secrets such as encryption keys. |
| JSON | A plain text format for data that other programs can read. The app's full export uses it. |
| KDF (key-derivation function) | A method that turns a short PIN into a strong encryption key. |
| Lint / typecheck | Automated checks of code style and of types, which catch many mistakes before the app runs. |
| Markdown / YAML | Two plain-text formats: Markdown for written content, YAML for structured settings and data. |
| Migration | Code that upgrades stored data when its shape changes, so old entries keep working. |
| MVP (minimum viable product) | The smallest version of the app that is genuinely useful. |
| npm | The tool that installs the packages the app depends on. |
| Persona | A short, made-up but realistic portrait of a typical user, used to test design decisions. |
| Playwright | The tool used for end-to-end tests. Chromium, the browser it drives, is preinstalled in cloud sessions. |
| Progress map | The picture of practice in the game layer: the Brain Map (Theme A) or the Harbor (Theme D). Six regions that light up as skills level up and never decay. |
| Pull request (PR) | A proposed set of changes that you review and then merge into the main version. |
| PWA (progressive web app) | A website you can install on your phone like an app. It can work offline. |
| Radix-style primitives | Accessible building blocks for dialogs, sliders and menus that work with keyboards and screen readers. |
| React / React Router | A widely used library for building screens from reusable pieces, and its companion for moving between screens. |
| Recharts / visx | Libraries for drawing the insight charts. |
| Repository (repo) | The shared folder on GitHub where the project's files and their history are kept: `IMCOOL006/1-addic`. |
| Safe areas | The parts of a phone screen not covered by the notch or the home bar. The SOS button must respect them. |
| Schema | A written description of the shape of some data: which fields exist and what they may contain. |
| Service worker | A small background script that lets a web app work offline. |
| Smoke test | A very small test that proves the basics still work. |
| Tailwind CSS | A styling toolkit. |
| Text-to-speech (TTS) | The phone reading text aloud. Version 1 uses it for the guided audio practices. |
| Threat model | The list of who and what you protect against. |
| TypeScript | JavaScript with types, which catches many mistakes before the app runs. |
| Unit test | An automated test of one small piece of code. Here: Vitest and Testing Library. |
| Viewport | The visible area of a screen. "Narrow viewport" means a small phone. |
| Vite / vite-plugin-pwa / Workbox | The tool that builds and previews the app, and the add-on that makes it installable and offline-capable. |
| WCAG 2.2 AA | The web accessibility standard and the level the app targets. |
| Web Speech API | The browser's own text-to-speech and voice input. |
| WebCrypto | The browser's built-in encryption toolkit. |
| Wireframe | A rough sketch of a screen that shows what goes where, without colours or final wording. |
| Xcode / Android Studio | The programs needed on your own computer to build the iOS and Android versions. |
| XP | Experience points, the game's measure of practice. |
| Zero-data-retention (ZDR) | An arrangement where an AI provider keeps none of the text sent to it. The plan says to ask about it for the optional AI coach. |
| Zod | A tool that checks that every piece of content and data has the expected shape. |
| Zustand | A small store for screen state. |

## A.2 Recovery and book words

> In short: The ideas from the source book that the app is built on, paraphrased in our own words.

@size 18
@widths 1.3,3.7
| Term | Meaning |
|---|---|
| 12-step and mutual-help groups | AA, NA, Marijuana Anonymous, Dual Recovery Anonymous (12-step), and SMART Recovery (CBT-based, non-spiritual). Social support is the active ingredient. |
| 988 | The US crisis line. The app shows the right line for the person's region. |
| Abstinence-based | Aiming to stop completely rather than cut down. The book's approach. |
| Acceptance | Letting discomfort be there without letting it dictate what you do. The opposite of the addicted brain's "get rid of it". |
| Addicted brain | The impulsive, conditioned part of you that tempts you and justifies using. The source of red flag thoughts. |
| Ambivalence | Mixed feelings about changing. Normal at every stage. |
| Battle Plan (the book's Urge Planner) | A plan plus two backups for an upcoming high-risk situation. |
| Behavioural activation | Scheduling pleasant activities to lift mood and replace using. |
| Be Smart, Not Strong | Avoid triggers instead of testing your willpower. |
| CBT (cognitive behavioural therapy) / relapse prevention | A therapy based on the idea that addictive behaviour is learned and tied to cues, so you can learn your triggers and practise new responses. |
| Conditioned cue | People, places, things and emotions linked to use that come to trigger cravings automatically. |
| Contingency management | A treatment that rewards verified abstinence. The app cannot verify, so it never gives points for sober days. |
| Craving signature | Where and how *you* feel cravings: body, emotions, thoughts. |
| Decisional balance | The 2×2 of benefits and drawbacks of quitting versus continuing. |
| Delay / distract | Shift attention early and postpone the decision 15 to 20 minutes. Repeat if needed. |
| Dopamine | The brain's natural pleasure messenger. Drugs flood it, then deplete it. |
| Give it a beat | Pause before reacting in anger: self-talk, an assertive line, leave, breathe, count to ten. |
| "I feel… when…, and I need…" | The assertive request formula. |
| Lapse / slip | The first use after a period of abstinence. Not yet a relapse. |
| Maintenance | Six or more months of consistent change. The app suggests Maintenance mode at that point. |
| MBRP (mindfulness-based relapse prevention) | Staying present using the breath, and accepting cravings and emotions without acting on them or judging yourself. |
| MI (motivational interviewing) | A way of helping people resolve mixed feelings and commit to change, without pushing. |
| Momentum | The app's replacement for streaks: "practiced on X of the last 14 days". It never drops to zero because of one bad day. |
| Naloxone | A medication that can reverse an opioid overdose. The lapse flow and Resources explain it. |
| Person-first language | Saying "person in recovery" rather than "addict". The app's voice always does this. |
| Pleasant activity | Anything you rate 6 or higher out of 10 for enjoyment. Aim for at least one a day. |
| Pleasure predicting | Predict enjoyment (0 to 100%), do it anyway, rate the actual enjoyment, compare. |
| "+1 point" question | "What would it take to move my motivation up one point?" |
| Rational brain | The part of you that weighs pros and cons and chooses. Practice makes it stronger. |
| Red flag thought | A thought that gives you "permission" to use, such as "just one". |
| Relapse | A slip that continues into days or weeks of use. |
| Risky relationship | Someone who uses around you or is a source of conflict. The strategies: avoid, limit contact, or set limits. |
| Safety Net | A person who supports your recovery and will not jeopardise it. |
| Seemingly irrelevant decision (SID) | A small choice that does not look like it is about using but moves you toward relapse. |
| Self-Determination Theory | A theory of motivation: it lasts when people feel autonomy, competence and relatedness. |
| Should dos / want tos | Responsibilities versus things you do for fun. Balance them. |
| Six thinking traps (mistakes in thinking) | Black-or-white thinking; discounting the positive; jumping to conclusions; taking feelings too seriously; self-blame; labelling yourself. |
| SOBER | A short breathing practice: Stop, Observe, Breathe, Expand awareness, Respond mindfully. Takes 1 to 5 minutes. |
| Spiraling lapse | Reading a slip as total failure, or as totally out of your control, which turns it into a relapse. |
| Stages of change | Precontemplation → contemplation → preparation → action → maintenance. You can move back and forth. |
| Superficial truth | A short-term benefit that is real ("it does relax me") but leaves out what happens next. |
| Surf the urge | A craving rises, peaks and falls like a wave, averaging about 15 minutes. Ride it out. |
| Three T's | Triggering situation → (red flag) Thoughts → Thoughts on Trial: examine the evidence, then write a response. |
| Tolerance | Needing more for the same effect. After a break, tolerance drops, which raises overdose risk. |
| Trigger | Anything that starts the chain toward using. Internal (emotions, states) or external (people, places, situations, things). |
| Trigger → Thought → Craving → Use | The chain that CBT teaches you to notice and break. |
| Warning signs of relapse | Shifts in mindset, behaviour or emotion days or weeks before a relapse. |
| Withdrawal | Unpleasant physical and emotional effects as a substance leaves your body. Alcohol and benzodiazepine withdrawal can be dangerous. |

# Appendix B: Book exercise → app feature map

> In short: Every exercise and worksheet in the book, with the app feature that covers it, condensed from the project's exercise inventory. Phase 3 is not done until every row is implemented or consciously deferred.

Kinds: *assess* = a one-time self-assessment that can be retaken · *build* = builds a personal artifact · *log* = a repeating tracker entry · *plan* = a forward-looking plan or task · *practice* = a guided skill practice, often audio · *reflect* = a free-text reflection · *tool* = an in-the-moment coping tool. Exercise ids with letters (5.2b, 8.4b) are unnumbered exercises in the book; "x", "y" and "w" mark tools and routines the book describes without numbering.

@exercises

# Appendix C: Reusable prompts

> In short: Six prompts from the build guide for situations that come up in every phase: fixing something, picking up where you left off, writing lesson content, reviewing safety, running a code review, and changing the plan. Plus the prompt the plan suggests for a review chat.

@reusable

### Review the plan

> The plan itself suggests this prompt for a review conversation before building starts.

```text
Review `docs/PLAN.md` for this addiction-recovery app. Stress-test the product concept, the gamification ethics, the safety design and the phasing. For each decision in §15, give a recommendation with reasoning. List what's missing, what's over-scoped, and what you'd cut from the MVP.
```

# Appendix D: Definition-of-done checklist

> In short: The eight checks that every build step must pass before it counts as done, copied from the build guide. Testers can use this list directly.

@dod

# Appendix E: Key numbers from the book

> In short: The numbers the app reuses, as listed in the plan and the book notes. They set timers, scales and thresholds throughout the app.

@widths 1.6,1.2,2.2
| Number | Value | Where the app uses it |
|---|---|---|
| Length of a craving | about 15 minutes | The SOS wave timer |
| Delay the decision | 15–20 minutes, repeatable | The "delay another 15 minutes" loop |
| Motivation scale | 0–10 | Onboarding, Motivation Meter, weekly review, after a slip |
| Craving scale | 0–10 | Quick-log, SOS rating and re-rate |
| Pleasure scale | 0–10; pleasant means 6 or more | Evening check-in, Activity Library, 7-Day Activity Experiment |
| Pleasure prediction | 0–100% | Prediction Lab |
| Maintenance | 6 months | Maintenance mode suggestion |
| Weekly look-ahead | at least the first 6 months | Weekly Review |
| Persistent low mood | more than 1 month sober | The gentle "see a professional" nudge |
| Exercise target | 150 minutes a week plus strength training twice a week | Exercise plan and log |
| Breath practice | 5 → 30 minutes | The breathing ladder (not paced) |
| SOBER | 1–5 minutes | SOS "Ride the wave", SOBER Training |
| Pleasant activities | aim for 1 per day | Want-to of the day, planner suggestions |
| Social pressure | causes about 1 in 3 slips | Refusal Rehearsal, Scripts |
| Negative emotions from conflict | linked to more than half of relapses | The "I'm feeling…" branch, emotion logs |
| Skill mastery levels (app) | levels 1–5 at 1, 3, 7, 15 and 30 uses | Skill mastery, progress map |
| Sober-day milestones (app) | 1, 3, 7, 14, 30, 60, 90, 180, 365 days | Celebrations, never points |
| Momentum window (app) | the last 14 days | Today's Momentum ring |
| SOS performance budget (app) | interactive in under 1 second, offline | Step 1.10 hardening |
