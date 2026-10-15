'use strict';
// Plain-English notes for each build step in docs/BUILD-GUIDE.md, keyed by step id.
// brief: one sentence under the step heading.
// after: "What you'll have after this step", restated from the prompt (nothing added).
// done:  used only when the guide has no "Done when" for the step; derived from the prompt.
// The build fails if a step in the guide has no entry here, so this file can't silently go stale.

module.exports = {
  '0.1': {
    brief: 'Turn your answers to the 18 decisions into short written records that every later step follows.',
    after: 'A `docs/decisions/` folder with one short decision record (ADR) per decision, and a plan whose decisions section shows every decision as settled. No app code yet.',
  },
  '0.2': {
    brief: 'Create the empty, installable web app with the agreed tools, so there is something real to build on.',
    after: 'An empty but installable web app at the repo root with the agreed stack and the folder layout from the plan, a set of npm scripts (dev, build, preview, lint, typecheck, test, e2e, validate:content and check), one smoke unit test, one smoke end-to-end test, and a `CLAUDE.md` that lists the commands.',
  },
  '0.3': {
    brief: 'Make every push test itself automatically, and get a link to try the app on your phone.',
    after: 'A GitHub Actions workflow that runs every check on each push and pull request, a deploy workflow that publishes a preview of `main`, a "How to try the app" section in README.md, and exact instructions for anything you must click in GitHub settings.',
  },
  '0.4': {
    brief: 'Set up the folder and rules that hold every lesson, exercise, tutorial, resource and piece of app text as checked data.',
    after: 'Zod schemas for every content type, a `validate:content` command that fails with clear messages, one sample file of each type, and `docs/COVERAGE.md` listing every book exercise with implemented / tutorial / tested columns, all unchecked.',
  },
  '0.5': {
    brief: 'Build the look and feel, plus the navigation skeleton, so every screen has a place to live.',
    after: 'Colour tokens for light and dark themes, a type scale, spacing, radii and accessible base components; the bottom navigation with five tabs and a floating SOS button on every screen; empty routed screens with friendly empty states; and `docs/design/wireframes.md` with sketches of Today, SOS and a lesson.',
  },
  '1.1': {
    brief: 'Lay the private, encrypted foundation that every later feature stores its data in.',
    after: 'A Dexie database with typed repositories for the first six entities, schema migrations, encryption at rest keyed from the app-lock PIN, an app-lock screen (set PIN, unlock, auto-lock timeout, "forgot PIN" wipes data with a clear warning), an append-only domain event log with a helper to record events, a request for persistent storage, and unit tests for the encryption round-trip, the migrations and the event log.',
  },
  '1.2': {
    brief: 'Build the short, skippable welcome flow that sets the app\'s tone and makes SOS useful on day one.',
    after: 'Onboarding steps 1 to 7 from the plan (welcome, privacy promise and PIN, your focus, stage of change and motivation, medical safety check with the withdrawal caution card, three quick reasons and one optional Safety Net, region, check-in times, weekly review day and learning pace). Every step is skippable except the safety notice. Answers are saved to Profile with events recorded, all copy lives in `content/copy`, and there are end-to-end tests for a full run and a skip-everything run.',
  },
  '1.3': {
    brief: 'Put crisis help and trustworthy resources one tap away, driven by per-region content you can verify.',
    after: 'An urgent-help screen reachable from SOS and Settings in one tap, a Resources screen, both driven by `content/resources/<region>.yaml` for the regions in the D10 decision record, with every phone number and link marked "needs verification" in the data and listed in `docs/resources-to-verify.md` for you to check. Numbers show as selectable text with call and copy buttons.',
  },
  '1.4': {
    brief: 'Give SOS its two most personal ingredients: the user\'s own reasons and the people they can call.',
    after: 'A quick Reasons Card seeded from onboarding (edit, reorder, add "my life will be different because…") with a big readable view for SOS, and a basic Support Network where contacts are added by typing a name and number with a role (Safety Net, sponsor, therapist). Events are recorded and there are unit and end-to-end tests.',
    done: [
      'The Reasons Card shows the reasons picked in onboarding, and you can edit, reorder and add "my life will be different because…".',
      'The Reasons Card has a big, readable view meant for SOS.',
      'You can add a contact by typing a name and number, and give it the role Safety Net, sponsor or therapist.',
      'Events are recorded, and unit and end-to-end tests pass.',
    ],
  },
  '1.5': {
    brief: 'Build the craving flow exactly as the plan\'s diagram shows; this is the feature the whole app exists for.',
    after: 'The full "I\'m craving" flow: optional 0–10 rating, 15-minute wave timer, the five tools (Ride the wave with a guided SOBER script read by device text-to-speech, Remind me why, Call someone, Distract me with a starter deck, and Talk back as a placeholder until Phase 3), "guide me", the "somewhere risky? leaving is a valid move" prompt, re-rate at timer end, the "delay another 15 minutes" loop, "what helped?", and "did you use?" with a kind placeholder for Lapse Recovery plus urgent-help access. The session saves itself as a craving log entry and records skill-use events. Fully offline, one-handed, two lines of text at most per screen, dark at night.',
  },
  '1.6': {
    brief: 'Make logging a craving or feeling take under 20 seconds, and add the evening check-in.',
    after: 'The unified quick-log (+ button) with Craving and Feeling entries, the evening check-in (mood, optional anxiety, peak craving, pleasant activities count, used today, sleep quality, meeting or therapy), voice input where the browser supports it, and a simple Timeline in Track. Unit and end-to-end tests.',
    done: [
      'A craving can be logged with time (automatic), situation, thought, feelings chips, 0–10 intensity, what I did, helped 1–5 and used Y/N.',
      'A feeling can be logged with emotion, 0–10 intensity, situation, thought and same-day craving.',
      'The evening check-in records mood, optional anxiety, peak craving, pleasant activities count, used today, sleep quality and meeting or therapy.',
      'A quick log takes under 20 seconds, voice input works where the browser supports it, and the Timeline in Track shows entries.',
      'Unit and end-to-end tests pass.',
    ],
  },
  '1.7': {
    brief: 'Build the first version of the home screen, with counters that never reset and no streaks.',
    after: 'A Today screen with a greeting, the morning or evening check-in card depending on the time, a Reasons Card peek, a "Start Here" lesson placeholder, opt-in counters (total sober days that never reset, urges surfed), Momentum ("practiced on X of the last 14 days"), and a Settings toggle for showing counters. No streaks.',
    done: [
      'Today shows a greeting and the right check-in card for the time of day.',
      'Today shows the Reasons Card peek and a "Start Here" lesson placeholder.',
      'Counters are opt-in via a Settings toggle, total sober days never reset, and Momentum shows "practiced on X of the last 14 days".',
      'There are no streaks anywhere, and tests pass.',
    ],
  },
  '1.8': {
    brief: 'Teach the app\'s layout in two minutes and let people rehearse SOS safely before they need it.',
    after: 'A minimal guidance engine and two tutorials driven by `content/tutorials`: the first-run tour with accessible spotlight coach marks over the five tabs and the SOS button, and the SOS practice drill, a one-minute calm run through the craving flow with sample content that is saved as practice and never as a real log. Progress is stored, both can be replayed from Settings → Help & tutorials, and nothing is ever shown during a live SOS session.',
    done: [
      'The first-run tour spotlights the five tabs and the SOS button, moves focus to each step, is announced by screen readers, and can be skipped at any time.',
      'The SOS practice drill runs through the craving flow with sample content and creates no real log entry.',
      'TutorialProgress is stored, and both tutorials can be replayed from Settings → Help & tutorials.',
      'The guidance engine shows nothing during a live SOS session.',
      'End-to-end tests cover complete, skip, replay, and "the drill creates no real LogEntry".',
    ],
  },
  '1.9': {
    brief: 'Give people full control of their data: take it out, bring it back, or delete it all.',
    after: 'Settings → Your data with export (decrypted JSON after PIN confirmation), import and restore from that file, delete everything with a two-step confirmation inside the app, and a monthly backup reminder on Today, proven by a round-trip test.',
    done: [
      'Export produces decrypted JSON after the PIN is confirmed.',
      'Import restores from that file, and delete everything needs a two-step confirmation inside the app.',
      'A monthly backup reminder appears on Today.',
      'The round-trip test passes: export → delete → import gives identical data.',
    ],
  },
  '1.10': {
    brief: 'Polish and check the minimum viable app before you live with it for a week.',
    after: 'An accessibility audit (axe plus a manual keyboard pass) with fixes, SOS confirmed interactive in under one second from a cold offline start, a check on a narrow phone viewport, a review of every screen against the safety and privacy house rules, `docs/dogfooding.md` with a 7-day checklist for daily use, and a summary of anything that could not be fixed.',
    done: [
      'The accessibility audit (axe and a manual keyboard pass) has been run and the issues fixed.',
      'SOS opens interactive in under 1 second from a cold, offline start.',
      'The app has been tested on a narrow phone viewport.',
      'Every screen has been reviewed against the safety and privacy house rules.',
      '`docs/dogfooding.md` exists with a 7-day checklist, and anything unfixed is summarised.',
    ],
  },
  '2.1': {
    brief: 'Build the engine that turns any exercise file into a working screen, in tutorial mode or workbook mode.',
    after: 'One React component per field type (check, check★, single, slider, text, list, matrix2x2, pair, rows, hourgrid, plan+backups, template, bodymap, timer, audio, date, contactPicker), a runner that renders any exercise from `content/exercises` in tutorial mode or workbook mode, saved responses with a schema version, history and "finish later", a dev-only gallery that shows every field type, unit tests per field type and an end-to-end test for one full exercise.',
    done: [
      'Every field type listed in the prompt renders as its own component, and the dev-only gallery shows them all.',
      'The runner renders an exercise from content in tutorial mode (examples, hints, "you built X" ending) and in compact workbook mode.',
      'Responses are saved with schemaVersion, keep history, and support "finish later".',
      'Unit tests exist per field type and an end-to-end test covers one full exercise.',
    ],
  },
  '2.2': {
    brief: 'Build the five-part lesson player that every module will use.',
    after: 'A lesson player with a story moment, 2–5 swipeable concept cards, 1–3 checks with explanations and no fail state, "Try it" (which runs the linked exercise in tutorial mode) and a wrap screen (what you built, where it lives, one suggested action that becomes a to-do). It records LessonCompleted and is shown with one sample lesson.',
    done: [
      'A lesson plays through story moment, concept cards, checks, "Try it" and wrap.',
      'Checks explain every answer and have no fail state.',
      '"Try it" runs the linked exercise in tutorial mode, and the wrap\'s suggested action becomes a to-do.',
      'LessonCompleted is recorded, and the end-to-end test passes on the sample lesson.',
    ],
  },
  '2.3': {
    brief: 'Grow the guidance engine into the full self-teaching system: tutorials, drills, tips, checklist, help and progressive reveal.',
    after: 'Just-in-time tutorials (3–5 interactive steps that end by doing the thing once, with a "Show me / Later" choice), a Training drills section, contextual tips (at most one a day, rule-based, switchable off, never in SOS), the Explorer checklist on Today with a progress ring, Help & tutorials (replay, searchable "How do I…?" with "Show me" buttons), and progressive feature reveal with "New" dots, the reveal table from the plan and a "Show all features now" setting. Rules live in content, not code.',
    done: [
      'A feature\'s first visit offers a 3–5 step tutorial with "Show me / Later" that ends by doing the thing once.',
      'Tips appear at most once a day, never in SOS, and can be switched off.',
      'The Explorer checklist shows on Today with a progress ring, and Help & tutorials offers replay and a searchable "How do I…?" list with "Show me" buttons.',
      'Features reveal progressively with "New" dots, and "Show all features now" reveals everything.',
      'Rules live in content; unit tests cover the rules and end-to-end tests cover the checklist and the reveal.',
    ],
  },
  '2.4': {
    brief: 'Build the map and calendar that show the whole learning journey, with no guilt and no red labels.',
    after: 'The Learn tab\'s home: Map view (11 modules as a path, each stop with lessons, skills and what it unlocks), Plan view (a calendar of weekly targets based on the pace from onboarding), the three tracks (Learn, Practice via skill uses, Use via features revealed), the "this week\'s focus" card on Today, checkpoint reflections at module end saved for the Recovery Plan, a stage-based starting path, pace changes, and the guilt-free "welcome back, pick up where you left off?" re-plan. Stored as RoadmapPlan.',
    done: [
      'Map view shows the 11 modules as a path, each with lessons, skills and what it unlocks.',
      'Plan view shows weekly targets based on the onboarding pace, and the pace can be changed.',
      'The three tracks, the "this week\'s focus" card on Today, checkpoint reflections and the stage-based starting path all work.',
      'After a gap the app offers "welcome back, pick up where you left off?" with a re-plan, and nothing is ever marked overdue or red.',
      'RoadmapPlan is stored and tests pass.',
    ],
  },
  '2.5': {
    brief: 'Set the app\'s voice, create its original characters, and write the first three modules.',
    after: '`docs/content-style.md` (tone guide, person-first language, reading level US grade 6–8, words to avoid), 4–6 original composite characters in `content/cast/`, and modules M0 (Start Here), M1 (Understand Addiction, with Ex 1.1 and 1.2 adapted in our own words, the help-request script and the program checklist) and M2 (Your Brain Can Heal, quizzes only). All text is original, medical content stays educational and says "talk to a doctor", safety-sensitive passages carry `clinicalReview: true`, content validates, one lesson has an end-to-end test, and COVERAGE.md is ticked.',
    done: [
      '`docs/content-style.md` and 4–6 original characters in `content/cast/` exist (none of them the book\'s characters).',
      'Modules M0, M1 and M2 are written in original words, with Ex 1.1 and 1.2 adapted, the help-request script and the program checklist.',
      'Medical content is educational and says "talk to a doctor", and safety-sensitive passages are flagged `clinicalReview: true`.',
      'Content validates, one lesson has an end-to-end test, and COVERAGE.md is ticked.',
    ],
  },
  '2.6': {
    brief: 'Write the motivation module and build the tools that turn it into a living Reasons Card.',
    after: 'Module M3 plus its artifacts: the Motivation Meter (stage and 0–10 as a time series, "+1 point" note, history chart), Decisional Balance (2×2 matrix with suggestion chips), the four-lenses reflection (Ex 3.3), and the full Reasons Card generated from them with an image export for a lock-screen wallpaper. Each has its tutorial and help entry, and COVERAGE.md is ticked.',
    done: [
      'Module M3 is written and plays in the lesson player.',
      'The Motivation Meter stores stage and 0–10 ratings as a time series with "+1 point" notes and a history chart.',
      'Decisional Balance works as a 2×2 matrix with suggestion chips, and the four-lenses reflection (Ex 3.3) is built.',
      'The full Reasons Card is generated from them and can be exported as a lock-screen image.',
      'Each artifact has a tutorial and help entry, and COVERAGE.md is ticked.',
    ],
  },
  '2.7': {
    brief: 'Write the "set yourself up" module and build its setup quests, support network and scripts.',
    after: 'Module M4 plus the Clear the Space quest (Ex 4.1, with safe-disposal notes), the "Should I go?" decision helper and The Big Game interactive story (original character), an exercise plan and log with self-chosen rewards (Ex 4.2–4.3), the full Support Network (Safety Nets vs. risky people with avoid, limit or set-limits, and a qualities rubric; Ex 4.4, 4.6), the Scripts builder ("I feel… when… I need…", refusals; Ex 4.5), and the Build Your Crew quest (Ex 4.7, meetings info). Tutorials and help entries included, COVERAGE.md ticked.',
    done: [
      'Module M4 is written, and the Clear the Space quest includes safe-disposal notes.',
      'The "Should I go?" helper and The Big Game story (with an original character) work.',
      'The exercise plan and log with self-chosen rewards, the full Support Network with the qualities rubric, the Scripts builder and the Build Your Crew quest are built.',
      'Each feature has a tutorial and help entry, and COVERAGE.md is ticked.',
    ],
  },
  '2.8': {
    brief: 'Write the self-expert module and build the profiles that make every later log and tool personal.',
    after: 'Module M5 plus the Trigger Profile (internal and external, ✓ and ★, feeding log chips; Ex 5.1), the Red Flag library (Ex 5.2), the Distortion Sort mini-game and the thought journal with distortion tags (Ex 5.2b), the spiral thoughts list (Ex 5.2c), the Craving Signature with a tappable body map (Ex 5.3), and a craving quick-log upgraded to use them (Ex 5.4). Tutorials and help entries included, COVERAGE.md ticked.',
    done: [
      'Module M5 is written and the Trigger Profile (✓ experienced, ★ frequent) feeds the quick-log chips.',
      'The Red Flag library, Distortion Sort, the thought journal with distortion tags and the spiral thoughts list are built.',
      'The Craving Signature has a tappable body map.',
      'The craving quick-log uses the new profiles, each feature has a tutorial and help entry, and COVERAGE.md is ticked.',
    ],
  },
  '2.9': {
    brief: 'Give every personal artifact one home where it can be viewed, edited, practised and exported.',
    after: 'A Workbook tab with a grouped artifact browser (My Why, Know Myself, My People, My Joys, and a My Recovery Plan placeholder). Every artifact has view, edit, version history, "practice with this", and export as an image or PDF where it makes sense, with an extra lock for sensitive artifacts, plus a tutorial and help entry.',
    done: [
      'The Workbook tab groups artifacts under My Why, Know Myself, My People, My Joys and a My Recovery Plan placeholder.',
      'Every artifact supports view, edit, version history, "practice with this" and export where it makes sense.',
      'Sensitive artifacts can be hidden behind an extra lock.',
      'The tab has its tutorial and help entry.',
    ],
  },
  '2.10': {
    brief: 'Show people patterns in their own data, and make XP and skill levels visible, all computed from the event log.',
    after: 'An on-device insights engine (craving trend, top triggers, time-of-day heat map, skill helpfulness ranking) with gentle wording and small-sample caveats, and the game engine core: XP and skill mastery derived from the event log (the plan\'s XP table, levels at 1, 3, 7, 15 and 30 uses, diminishing returns on repeated identical logs), shown on Today and a simple progress page. Tests prove that recomputing from events gives the same result and that a slip never removes anything.',
    done: [
      'Insights show craving trend, top triggers, a time-of-day heat map and a skill helpfulness ranking, with gentle wording and small-sample caveats.',
      'XP and skill mastery are derived from the event log using the plan\'s table, with levels at 1, 3, 7, 15 and 30 uses and diminishing returns on repeated identical logs.',
      'XP and mastery show on Today and on a simple progress page.',
      'Tests prove recomputing from events gives the same result, and that a slip never removes anything.',
    ],
  },
  '3.1': {
    brief: 'Build the day and week planner that spots empty, risky time before it arrives.',
    after: 'A Planner with day and week views, typed blocks (should, want, recovery, risky), gap detection for unstructured time, suggestions to place want-tos at the user\'s risky times (from insights), to-dos generated by exercises, plus a tutorial, help entry and tests.',
    done: [
      'Day and week views show blocks typed should, want, recovery or risky.',
      'Unstructured time is flagged, and want-tos are suggested at the user\'s risky times from insights.',
      'To-dos generated by exercises appear in the Planner.',
      'The Planner has a tutorial and help entry, and tests pass.',
    ],
  },
  '3.2': {
    brief: 'Turn high-risk situations into plans with backups, reminders and a debrief that rewards planning, not outcomes.',
    after: 'Battle Plans (Ex 6.5) attached to risky blocks or events (situation, plan, two backups, a buddy from Safety Nets, exit plan), an in-app reminder beforehand, .ics calendar export, a debrief afterwards ("did you use your plan?") that earns XP whatever the outcome, the Battle Plan Training drill, a tutorial and help entry, and COVERAGE.md ticked.',
    done: [
      'A Battle Plan can be attached to a risky block or event with situation, plan, two backups, a buddy from Safety Nets and an exit plan.',
      'An in-app reminder fires beforehand and the plan can be exported to the phone calendar as .ics.',
      'The debrief asks "did you use your plan?" and earns XP whatever the outcome.',
      'The Battle Plan Training drill, tutorial and help entry exist, and COVERAGE.md is ticked.',
    ],
  },
  '3.3': {
    brief: 'Write the "outsmart the addicted brain" module and wire its tools into SOS.',
    after: 'Module M6 plus Put It On Trial (the three T\'s courtroom flow, superficial truths, "is it worth it?"; Ex 6.1–6.3) saving Comeback cards, the personal distraction deck (Ex 6.3b), both wired into SOS "Talk back" and "Distract me", the trial and SOS Training drills, tutorials and help entries, and COVERAGE.md ticked.',
    done: [
      'Module M6 is written.',
      'Put It On Trial runs the three T\'s flow with superficial truths and "is it worth it?", and saves Comeback cards.',
      'The personal distraction deck exists, and SOS "Talk back" and "Distract me" use the user\'s own Comebacks and deck.',
      'The trial and SOS Training drills, tutorials and help entries exist, and COVERAGE.md is ticked.',
    ],
  },
  '3.4': {
    brief: 'Write the mindfulness module with original guided scripts that play offline.',
    after: 'Module M7 plus original guided scripts (body scan, breathing with awareness on a 5 → 30 minute ladder that does not pace the breath, mindful shower, eating and walking, urge surfing, and SOBER), an offline audio player using device text-to-speech with on-screen text, pause and replay, the SOBER Training quest (imagined → stress → emotion → craving) and Everyday Mindfulness quests, mindful-minutes tracking, tutorials and help entries, and COVERAGE.md ticked.',
    done: [
      'Module M7 is written and every guided script is original.',
      'The audio player works offline with device text-to-speech, on-screen text, pause and replay, and the breathing ladder does not pace the breath.',
      'The SOBER Training quest (four stages) and Everyday Mindfulness quests work, and mindful minutes are tracked.',
      'Tutorials and help entries exist, and COVERAGE.md is ticked.',
    ],
  },
  '3.5': {
    brief: 'Write the "rediscover joy" module and build the pleasant-activity tools that point people back to real life.',
    after: 'Module M8 plus the Activity Library (an original starter list in categories; should/want; "could this trigger me?" flag), the Should/Want balance meter, activity scheduling into the Planner, the obstacles problem-solver (Ex 8.4b), Prediction Lab (predicted vs. actual enjoyment chart; Ex 8.5/8.6), the 7-Day Activity Experiment (hourly tracking; Ex 8.1), self-chosen rewards for follow-through (Ex 8.7), tutorials and help entries, and COVERAGE.md ticked.',
    done: [
      'Module M8 is written, and the Activity Library has an original starter list in categories with should/want and a "could this trigger me?" flag.',
      'The Should/Want balance meter works and activities can be scheduled into the Planner.',
      'The obstacles problem-solver, Prediction Lab chart and the 7-Day Activity Experiment work.',
      'Self-chosen rewards for follow-through exist, tutorials and help entries are in place, and COVERAGE.md is ticked.',
    ],
  },
  '3.6': {
    brief: 'Write the hard-feelings module, complete the "I\'m feeling…" SOS branch, and add crisis routing.',
    after: 'Module M9 plus emotion logs with mood and anxiety vs. craving insights (Ex 9.1–9.2), Put It On Trial in "negative thought" mode (Ex 9.3), the Anger Signature and anger triggers (Ex 9.3b–9.4), Rewrite the Scene (Ex 9.5), and the full "I\'m feeling…" SOS branch (give it a beat for anger, SOBER and reassurance for sadness and anxiety, motivation re-rate). Crisis routing opens urgent help immediately when thoughts of death or suicide, or extreme hopelessness, are selected, and the gentle "persistent low mood → see a professional" nudge is in place. Tutorials and help entries included, COVERAGE.md ticked.',
    done: [
      'Module M9 is written, and emotion logs show mood and anxiety vs. craving insights.',
      'Put It On Trial has a "negative thought" mode, and the Anger Signature, anger triggers and Rewrite the Scene are built.',
      'The "I\'m feeling…" SOS branch offers give it a beat for anger, SOBER and reassurance for sadness and anxiety, and a motivation re-rate.',
      'Selecting thoughts of death or suicide, or extreme hopelessness, opens urgent help immediately.',
      'The gentle "see a professional" nudge exists, tutorials and help entries are in place, and COVERAGE.md is ticked.',
    ],
  },
  '3.7': {
    brief: 'Build the no-shame flow for the moment after a slip, with safety first and nothing ever taken away.',
    after: 'The complete "I slipped" flow: compassion first, a safety check (overdose risk after a break, don\'t use alone, naloxone, withdrawal cautions, urgent help), stop the spiral using the user\'s own spiral thoughts and rebuttals, one-tap reach-out, and the Slip Review within 24 hours (Ex 10.2) with a motivation revisit and "step up support" actions. Total sober days, XP, badges and mastery never decrease and the current run restarts quietly. All copy is marked `clinicalReview: true`, an end-to-end test exists, and COVERAGE.md is ticked.',
    done: [
      'The flow opens with compassion and a safety check that covers overdose risk after a break, not using alone, naloxone, withdrawal cautions and urgent help.',
      'The user\'s own spiral thoughts appear next to rebuttals, and one tap reaches a Safety Net, sponsor or counsellor.',
      'The Slip Review within 24 hours includes a motivation revisit and "step up support" actions.',
      'Total sober days, XP, badges and mastery never decrease; the current run restarts quietly.',
      'All copy is marked `clinicalReview: true`, the end-to-end test passes, and COVERAGE.md is ticked.',
    ],
  },
  '3.8': {
    brief: 'Write the capstone module and build the Warning Sign Radar, My Recovery Plan and the full Weekly Review.',
    after: 'Module M10 plus the Warning Signs checklist with top-3 plans (Ex 10.1), the Warning Sign Radar detectors from the plan showing the user\'s own plan, My Recovery Plan pre-filled from real data with edit and confirm per section (Ex 10.3), graduation, PDF export, pinned in SOS, a monthly "still true?" review, the full Weekly Review flow, and Maintenance mode at 6 months. Tutorials and help entries included, COVERAGE.md ticked.',
    done: [
      'Module M10 is written, and the Warning Signs checklist stores the top 3 signs with a plan for each.',
      'The Warning Sign Radar detectors run on the user\'s data and show the user\'s own plan when a sign trips.',
      'My Recovery Plan is pre-filled from real data, confirmed section by section, celebrated at graduation, exported as PDF and pinned in SOS, with a monthly "still true?" review.',
      'The full Weekly Review flow and Maintenance mode at 6 months work.',
      'Tutorials and help entries exist, and COVERAGE.md is ticked.',
    ],
  },
  '3.9': {
    brief: 'Check the whole book against the app and close or consciously defer every gap.',
    after: 'An updated `docs/COVERAGE.md` where every exercise is confirmed implemented, tutored and tested, or has a recorded reason for being deferred; small gaps fixed; bigger ones listed as follow-up steps; and a short report.',
    done: [
      'Every exercise in `docs/book/exercises.md` has been compared with COVERAGE.md and the app.',
      'Each exercise is implemented, has its tutorial and is tested, or has a written reason for deferral.',
      'Small gaps are fixed and bigger ones are listed as follow-up steps.',
      'The updated COVERAGE.md and a short report are pushed.',
    ],
  },
  '4.1': {
    brief: 'Build the Brain Map, ranks and badges, with tests proving nothing can be lost or randomised.',
    after: 'The Brain Map (six regions from the plan that light up from skill mastery, in a warm, organic style where nothing ever decays), ranks from Explorer to Guide, the badges from the plan (deterministic, not farmable), sober-day milestone celebrations with no XP, cosmetic unlocks earned by practice, roadmap milestones linked to the map, and tests proving nothing can be lost or randomised.',
    done: [
      'The six Brain Map regions light up from skill mastery, in a warm organic style, and nothing ever decays.',
      'Ranks run from Explorer to Guide, and the badges from the plan are deterministic and not farmable.',
      'Sober-day milestones are celebrated without XP, and cosmetic unlocks come only from practice.',
      'Roadmap milestones are linked to the map, and tests prove nothing can be lost or randomised.',
    ],
  },
  '4.2': {
    brief: 'Pull every quest and mini-game into one consistent quest log, and add the last two games.',
    after: 'A consistent quest log in Actions with progress, rewards and replays for every quest and mini-game from the plan, plus the Refusal Rehearsal dialogue game (scripted scenes with feedback against the refusal checklist) and the Spot the Red Flag quiz, each with tutorials and help entries.',
    done: [
      'Every quest and mini-game from the plan appears in one quest log in Actions with progress, rewards and replays.',
      'The Refusal Rehearsal dialogue game gives feedback against the refusal checklist.',
      'The Spot the Red Flag quiz works.',
      'Tutorials and help entries exist for the new games.',
    ],
  },
  '4.3': {
    brief: 'Add the switch that turns the game off, then audit the whole app against the guardrails.',
    after: 'Calm mode (all game visuals off, every function kept, tutorials shown plainly), fixes for any violation of the plan\'s do/don\'t table or the safety house rules, and `docs/guardrail-review.md` listing each rule and how the app meets it.',
    done: [
      'Calm mode turns off all game visuals while keeping every function, and tutorials show plainly in it.',
      'The whole app has been reviewed against the do/don\'t table and the safety house rules, and any violation fixed.',
      '`docs/guardrail-review.md` lists each rule and how the app meets it.',
    ],
  },
  '5.1': {
    brief: 'Wrap the web app so it can become a real iOS and Android app, with local steps written for a non-expert.',
    after: 'Capacitor projects for iOS and Android around the existing web app, the web build still working, and `docs/native-setup.md` with the exact local steps to build and run the app on your own phone.',
    done: [
      'Capacitor is set up for iOS and Android around the existing web app.',
      'The web build still works.',
      '`docs/native-setup.md` gives exact local steps for someone who may not know Xcode or Android Studio.',
    ],
  },
  '5.2': {
    brief: 'Use the phone\'s own features for reminders, unlocking and key storage, and finish discreet mode.',
    after: 'Native local notifications on the native builds (discreet text, quiet hours, daily cap, anchored to the user\'s risky times), biometric unlock, the encryption key moved to the iOS Keychain or Android Keystore, discreet mode\'s neutral icon and name, and notes on anything you must test on a real device.',
    done: [
      'Native builds use local notifications with discreet text, quiet hours, a daily cap and anchoring to the user\'s risky times.',
      'Biometric unlock works and the encryption key lives in the iOS Keychain or Android Keystore.',
      'Discreet mode has a neutral icon and name.',
      'Anything that must be tested on a real device is documented.',
    ],
  },
  '5.3': {
    brief: 'Add the fastest route to SOS, swap in recorded audio if you have it, and run the final audits.',
    after: 'An SOS home-screen shortcut (and a widget if practical), recorded audio in place of text-to-speech if you provided files in `content/audio`, a full accessibility and performance audit on the native builds, fixes for what could be fixed, and a report on the rest.',
    done: [
      'An SOS home-screen shortcut exists, plus a widget if it was practical.',
      'Recorded audio replaces text-to-speech wherever files were provided in `content/audio`.',
      'A full accessibility and performance audit has been run on the native builds, with fixes applied and the rest reported.',
    ],
  },
  '6.1': {
    brief: 'Gather everything a clinician must check into one packet, with a cover note you can send.',
    after: '`docs/review/clinical-review-packet.md` with every piece of content marked `clinicalReview: true` plus all crisis, lapse, withdrawal, overdose and medication text, grouped by screen with space for the reviewer\'s comments, and a short cover note for a licensed addiction professional.',
    done: [
      'The packet contains every `clinicalReview: true` passage and all crisis, lapse, withdrawal, overdose and medication text.',
      'Content is grouped by screen with space for the reviewer\'s comments.',
      'A short cover note explains what the app is and what the reviewer should check.',
    ],
  },
  '6.2': {
    brief: 'Prepare an ethical, paid usability study with people in recovery.',
    after: '`docs/review/usability-study.md` with goals, a consent form, a recruiting note, six short tasks (including SOS and the tutorial), questions about tone and the game layer, and a simple results template, written to be ethical: paid, consented, no pressure to share use history.',
    done: [
      'The study kit has goals, a consent form, a recruiting note, six short tasks including SOS and the tutorial, tone and game-layer questions, and a results template.',
      'The design is ethical: paid, consented, and no pressure to share use history.',
    ],
  },
  '6.3': {
    brief: 'Draft the privacy policy and store listing in plain language, ready for legal review.',
    after: '`docs/review/privacy-policy.md` (plain language, matching exactly what the app does: local-only data, no tracking) and `docs/review/store-listing.md` (name, short and long description, keywords, screenshot list, age rating notes), both marked "draft, needs legal review".',
    done: [
      'The privacy policy is in plain language and matches exactly what the app does.',
      'The store listing has a name, short and long descriptions, keywords, a screenshot list and age rating notes.',
      'Both documents are marked "draft, needs legal review".',
    ],
  },
  '6.4': {
    brief: 'Think through the optional AI rehearsal partner on paper before deciding whether to build it.',
    after: '`docs/ai-coach-proposal.md`: a proposal, not a build, for the opt-in AI rehearsal partner covering backend proxy design, prompts, crisis routing, data minimisation, an eval set of scenarios (including crisis and manipulation attempts) and costs.',
    done: [
      'The proposal covers backend proxy design, prompts, crisis routing, data minimisation, an eval set (including crisis and manipulation attempts) and costs.',
      'Nothing has been built yet; the proposal is a document for you to decide on.',
    ],
  },
};
