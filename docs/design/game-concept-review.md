# Review: "The Harbor" game concept

**Status:** design note, October 2026. Reviews a one-page concept the owner found ("Game Design Document: The Harbor", an AI-assisted gamified recovery app built with Unity and Claude Code) against `docs/PLAN.md`. Nothing here is decided; the theme is decision D6 in PLAN §15 and the platform is D3.

## Verdict in three lines

1. **The metaphor is worth adopting**, as the *world* of the game layer, with the Two Brains mechanics kept underneath. It fixes the one weakness the plan already noted in the Two Brains theme (brain imagery can feel clinical) and it fits the book and the app unusually well: SOS is literally a maritime distress call, the craving timer is already a wave, the plan already has a Compass, a Radar and a "Build Your Crew" quest.
2. **The technology does not fit and should not be adopted.** Unity, C# and a Unity MCP server conflict with decision D3 (PWA with React and TypeScript, then Capacitor) for reasons that matter to this app: cold-start time, accessibility, testability in cloud sessions, app size and privacy defaults.
3. **The concept adds no mechanics**, so every guardrail in PLAN §6.1 stays exactly as it is. The island must never start "neglected" or decay, and storms must never be dramatised during a live SOS.

## What the concept says

- **The Harbor Island** represents the user's mental state; it starts weather-worn and neglected and improves with real-world progress.
- **The Storm** represents triggers, cravings and high-risk situations.
- **The Lighthouse** holds educational modules, worksheets and logs.
- **The Anchors** are long-term coping skills built by completing exercises.
- Stack: Unity 2D (URP), C#, SQLite with SQLCipher, Claude Code with a Unity MCP server. A three-step implementation blueprint (set up Unity, generate ScriptableObjects, bind UI Toolkit forms to SQLite).

It is a concept, not a plan: there is no content model, safety design, privacy threat model, learning design, data model or phasing. All of that stays as in PLAN.md.

## Fit against the plan

| Concept element | Fit | Notes |
|---|---|---|
| Harbor as the progress world | Good | A calm, adult, non-clinical place. Makes no medical "healing" claim, which the plan flagged as a risk of brain imagery. |
| Island starts neglected and gets repaired | **No** | A visual that starts as neglect reads as shame, and "repair" implies damage can return. PLAN §6.1 and §6.7: nothing dies or decays, nothing is taken away. Start with a quiet, simple harbor that only ever gains light and life. |
| Storm = cravings and triggers | Good, with limits | Matches the book's own image: an urge rises, peaks and passes like a wave (about 15 minutes). Use weather as gentle *forecast* language in planning. Never show storm drama inside a live SOS session; the calm wave timer stays as designed. Never invite the person to "sail into" a storm (no exposure challenges). |
| Lighthouse = learning | Good, adapted | The plan's Learn tab is already a map (the Learning Roadmap). The lighthouse fits best as the thinking-skills region: its beam cuts through fog, which is exactly what Put It On Trial does with a red-flag thought. |
| Anchors = long-term coping skills | Very good | Maps one to one onto skill mastery (levels 1 to 5 at 1, 3, 7, 15 and 30 uses): an anchor holds better the more it has been used. |
| Real-world progress → in-game rewards | Good only as the plan defines "progress" | Rewards attach to practice, honesty, planning and reflection, never to claimed sober days. Unchanged. |
| Unity 2D + C# + Unity MCP | **No** | See below. |
| SQLite + SQLCipher | Equivalent already planned | The plan encrypts IndexedDB with a PIN-derived key and moves the key to the Keychain or Keystore in the native phase. |

## Why not the Unity stack

- **The one-second SOS budget.** PLAN §10.6 requires SOS to be interactive in under a second from a cold, offline start. A Unity app cold-starts in several seconds on a phone.
- **Accessibility.** House rule 6 and the WCAG 2.2 AA target need screen-reader labels, dynamic text size, reduced motion and keyboard focus. Unity's UI has weak support for all of these; the web stack gets them from the platform.
- **Building and testing in cloud sessions.** The plan's whole workflow runs in Claude Code cloud sessions with Playwright and a preinstalled Chromium. Unity needs the Unity editor and licences on a desktop, and the Unity MCP server needs a running editor. Every step would move off the cloud.
- **Forms and text.** Most of the app is worksheets, lists, logs and lessons. A game engine makes those harder, not easier.
- **Size and privacy.** A Unity build is tens of megabytes and ships analytics and crash-reporting by default, which would have to be stripped to meet the no-trackers rule.
- **One codebase.** D3's reasoning (web, then the same code in the stores through Capacitor) still holds. The harbor visuals are a stylised map with six regions that light up; that is a few SVG illustrations with motion, well within the web stack and already budgeted in Step 4.1.

## Proposed variant for D6: Two Brains mechanics in the Harbor world

Keep everything the plan already specifies for Theme A (the companion the user names, the Addicted Brain speaking the user's own red-flag lines in the Courtroom and the Distortion Sort, the six skill regions, the event-sourced progression). Replace the *picture* (a stylised brain) with a harbor. Nothing else changes.

| Plan element | In the Harbor | Book link |
|---|---|---|
| Progress map (was: Brain Map) | A small harbor seen from above. Starts quiet and simple. Gains light, moorings and a garden as skills level up. Never decays. | PLAN §6.2, §6.7 |
| Command Center (Put It On Trial, distortions, Battle Plans, scheduling) | **The Lighthouse.** Its beam shows what is really there (the evidence) and sweeps ahead (planning). | Ch 5, 6 |
| Calm Core (SOBER, breathing, body scan, acceptance, give it a beat) | **The Cove**: still water inside the breakwater. | Ch 7, 9 |
| Joy Circuit (pleasant activities, exercise, rewards) | **The Garden on the hill.** It grows only when the person does real things outside the app. | Ch 4, 8; design principle 10 |
| Connection Hub (Safety Nets, scripts, refusals, meetings) | **The Pier.** A lantern for each person in the crew. The plan's "Build Your Crew" quest is already nautical. | Ch 4 |
| Compass (Reasons Card, motivation, "+1") | **The Compass Rose** in the chart room: the reasons are the heading. | Ch 3 |
| Radar (craving and mood logs, triggers, warning signs) | **The Weather Station**: the logbook and the forecast. The plan's Warning Sign Radar is, literally, its radar. | Ch 5, 9, 10 |
| Skill mastery levels 1–5 | **Anchors** that hold better with use. | Ch 10 "go-to skills" |
| A craving or a hard feeling | **Weather**: a squall that rises, peaks and passes in about 15 minutes. | Ch 6 surf the urge |
| SOS | **Safe harbor.** SOS is the maritime distress call; the wave timer stays exactly as designed. | PLAN §5.2 |
| Red-flag thoughts and thinking traps | **Fog.** The lighthouse beam cuts through it (Put It On Trial, the three T's). | Ch 5, 6 |
| High-risk situation and its Battle Plan | **Forecast rough weather** and the **storm plan**: plan, two backups, crew, exit. | Ch 6 Urge Planner, Ch 10 |
| Weekly Review | **Reading the week's forecast.** | Ch 10 weekly look-ahead |
| Quick-log and Timeline | **Logbook entries.** (The word "log" comes from the ship's log.) | Ch 5 self-monitoring |
| A slip | **A rough passage.** The harbor is untouched; the Slip Review is the honest logbook entry afterwards. Total sober days, XP, badges and anchors stay. | PLAN §6.7 |
| "Be smart, not strong" | "Don't sail into a storm to test the boat." | Ch 4 |
| Sober-day milestones | **Harbor lights** come on. Celebration only, no XP. | PLAN §6.4 |
| Companion (Rational Brain) | **The harbor keeper**, named by the user, speaking the rational brain's lines. The addicted brain is "the voice in the fog": still part of you, never a monster. | Ch 2 |
| Calm mode | The map hides; plain lists remain. | PLAN §5.9 |
| Maintenance mode | A lighter "harbor master" view. | PLAN §5.7 |
| Explorer checklist | "Chart the harbor": the first 12 actions. | PLAN §5.10 |

### What this changes in the plan

- PLAN §6.2: a fourth theme option and a "Harbor place" column on the regions table. The recommended default becomes "A's structure in the Harbor world, with C's gentleness".
- PLAN §15 D6: the options and the recommended default.
- BUILD-GUIDE Step 4.1: "progress map (Brain Map or Harbor map, per the game-theme ADR)" instead of "Brain Map". No other step changes; the engines, the XP table, badges, ranks and quests are untouched.
- Companion copy and tutorial lines use harbor language once the ADR is settled (Step 2.5's content style guide should add the vocabulary).

### Conditions

- Nothing ever starts damaged, decays or is taken away. The harbor only gains.
- No storm visuals or weather drama inside a live SOS session or the crisis screen. SOS keeps the calm wave timer and two lines of text.
- Weather is never a dare. No "can you weather this?" challenges; the plan's ban on exposure challenges stands.
- Keep the brain science where it belongs: module M2 still teaches the addicted brain and the rational brain. The harbor is a picture of practice, not a claim about the brain.
- Avoid tavern or bar imagery in the harbor scene (harbour pubs are common and are triggers for some people).
- Give the map a text equivalent and a list view (house rule 6).
- Test reactions with people in recovery in the Phase 6 usability study, including anyone for whom water or sailing is a hard topic. Driving (Theme B) was ruled out for a similar reason.
- If "Harbor" is also considered as the app name (D13 asks for a discreet name), check trademarks and app-store name collisions first; it is a common word.

## Engagement ideas that stay inside the guardrails

These are framings of mechanics the plan already has, not new loops.

1. **A picture that only grows.** The harbor is drawn from the event log, so it can never lose anything. Each new light, mooring or garden bed is tied to a real-world practice.
2. **The weekly forecast ritual.** The Weekly Review reads the week ahead, turns rough weather into storm plans, and the Battle Plan debrief asks "how was the passage?".
3. **Lanterns on the pier.** Reaching out to a Safety Net lights that person's lantern for the day. Opt-in display; it counts only what the person actually did.
4. **The logbook.** Logging a craving or a feeling is the sailor's habit, not a chore; the Timeline is the logbook.
5. **Harbor lights** at sober-day milestones, in words and light, never in points.
6. **One new idea, not in the plan (optional): the forecast check.** In the Weekly Review, show last week's forecast rough weather beside what the logbook actually recorded, the way the Prediction Lab compares predicted and actual enjoyment. It rewards reflection and self-knowledge, uses data the app already has (planner blocks marked risky, craving logs), and adds no new entity. Worth a decision before Phase 3.

## Decision

Treat the Harbor as a candidate for D6 and answer it in Step 0.1. If accepted, record the ADR as "Two Brains mechanics in the Harbor world" and have Step 4.1 build the harbor map.
