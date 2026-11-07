# Review: "The Harbor" game concept, and whether to build in Unity

**Status:** design note, October 2026 (revised after the owner said Unity is wanted if it can deliver). Reviews the one-page concept "Game Design Document: The Harbor" against `docs/PLAN.md`. Nothing here is decided: the theme is decision D6 and the platform is D3 in PLAN §15.

## Verdict in three lines

1. **The metaphor is worth adopting** as the *world* of the game layer, with the Two Brains mechanics kept underneath. It fixes the one weakness the plan noted in the Two Brains theme (brain imagery can feel clinical) and it fits the book and the app unusually well: SOS is literally a maritime distress call, the craving timer is already a wave, and the plan already has a Compass, a Radar and a "Build Your Crew" quest.
2. **Unity is a real option, not a reflex "no".** It gives the richest tooling for a living, animated harbor, and Unity now has an official MCP server so Claude Code can work inside the Editor. The costs are real too: a bigger, slower-starting app, hand-built accessibility, and development on your own computer instead of cloud sessions. The honest way to decide is a **one-week feasibility spike with hard pass marks** (Step 0.6), not an argument. If the spike passes, build in Unity; if not, the web stack remains the fallback.
3. **The concept adds no mechanics**, so every guardrail in PLAN §6.1 stays as it is. The island must never start "neglected" or decay, and storms must never be dramatised during a live SOS.

## What the concept says

- **The Harbor Island** represents the user's mental state; it starts weather-worn and neglected and improves with real-world progress.
- **The Storm** represents triggers, cravings and high-risk situations.
- **The Lighthouse** holds educational modules, worksheets and logs.
- **The Anchors** are long-term coping skills built by completing exercises.
- Stack: Unity 2D (URP), C#, SQLite with SQLCipher, Claude Code with a Unity MCP server, and a three-step implementation blueprint.

It is a concept, not a plan: there is no content model, safety design, privacy threat model, learning design, data model or phasing. All of that stays as in PLAN.md.

## The metaphor: fit against the plan

| Concept element | Fit | Notes |
|---|---|---|
| Harbor as the progress world | Good | A calm, adult, non-clinical place. Makes no medical "healing" claim, which the plan flagged as a risk of brain imagery. |
| Island starts neglected and gets repaired | **No** | A visual that starts as neglect reads as shame, and "repair" implies damage can return. PLAN §6.1 and §6.7: nothing dies or decays, nothing is taken away. Start with a quiet, simple harbor that only ever gains light and life. |
| Storm = cravings and triggers | Good, with limits | Matches the book's own image: an urge rises, peaks and passes like a wave (about 15 minutes). Use weather as gentle *forecast* language in planning. Never show storm drama inside a live SOS session; the calm wave timer stays as designed. Never invite the person to "sail into" a storm (no exposure challenges). |
| Lighthouse = learning | Good, adapted | The plan's Learn tab is already a map (the Learning Roadmap). The lighthouse fits best as the thinking-skills region: its beam cuts through fog, which is exactly what Put It On Trial does with a red-flag thought. |
| Anchors = long-term coping skills | Very good | Maps one to one onto skill mastery (levels 1 to 5 at 1, 3, 7, 15 and 30 uses): an anchor holds better the more it has been used. |
| Real-world progress → in-game rewards | Good only as the plan defines "progress" | Rewards attach to practice, honesty, planning and reflection, never to claimed sober days. Unchanged. |
| SQLite + SQLCipher | Fine | Encrypted local storage is already a requirement; this is one good way to meet it in a native app. |

## Unity: what it would take

The owner's priority is an app that is *super interesting, high quality and visually appealing, while also lightweight*. Unity scores highest on the first three and lowest on the fourth, so the question is whether the costs can be brought inside acceptable limits for a recovery app.

### What Unity brings

- The best tooling for a **living scene**: 2D animation, particles, lighting, shaders, Timeline, tweening, sound. A harbor with changing light, gentle water, lanterns and weather is routine work in Unity and skilled work on the web.
- **One project, both stores**, with native features through Unity packages: local notifications (Mobile Notifications), in-app purchases (Unity IAP), secure key storage and biometrics through plugins, SQLite with SQLCipher.
- **An official Unity MCP server** (open beta, Unity 6 or later, part of the AI Assistant package; the exact setup path has been changing, so check Unity's current docs), plus mature community MCP servers. Claude Code can inspect scenes, create objects, run tests and read the console.
- **Screen readers are supported**: Unity's Accessibility module supports VoiceOver on iOS and TalkBack on Android (iOS 13+, Android 8+), with font-scaling settings, and desktop readers from Unity 6.3.
- **Licensing is affordable**: Unity Personal is free under about $200k revenue or funding in the last 12 months, and the splash screen is optional in Unity 6. The official MCP may need a Unity AI subscription; check.

### What Unity costs, and what to do about each

| Cost | Why it matters here | Mitigation to prove in the spike |
|---|---|---|
| **Cold start.** An engine has to initialise before the first screen. Forum reports range from a couple of seconds to much worse on older phones; there is no authoritative number, so it must be measured. | The plan's budget is SOS interactive in under 1 second from a cold, offline start. The craving moment does not wait. | IL2CPP, engine-code stripping, a tiny first scene, no services at startup. Pass mark: SOS usable in ≤ 2.0 s on a mid-range Android and ≤ 1.5 s on a recent iPhone. Add a native home-screen widget and shortcut (Swift/Kotlin, outside Unity) that show the Reasons Card and the crisis number without launching the engine. |
| **App size.** Empty Unity Android builds are reported at roughly 30–60 MB installed; iOS around 15–30 MB; real apps more. A web app wrapped with Capacitor is roughly 5–15 MB. | Storage and cellular downloads; "lightweight" was an explicit ask. | arm64 only, URP with unused packages removed, texture compression, audio in Addressables loaded on demand. Pass mark: ≤ 60 MB download, ≤ 120 MB installed. |
| **Accessibility is hand-built.** Each screen needs an accessibility hierarchy (nodes, roles, labels, frames) and font scaling wired up. The web gets this from the platform. | House rule 6 and the WCAG 2.2 AA target; people with shaking hands or low vision are exactly the users. | Build the hierarchy as part of every screen's definition of done. Pass mark: VoiceOver and TalkBack read every SOS and onboarding control with role and label; dynamic type honoured. |
| **Text-heavy content.** Most of the app is worksheets, logs and lessons with the phone keyboard, autocorrect and dictation. | Logging must take under 20 seconds; voice input is in the plan. | UI Toolkit text fields plus native keyboard/dictation plugins. Pass mark: a long text field works with keyboard, autocorrect and dictation on both platforms. Fallback: a native WebView for text-heavy screens (hybrid option below). |
| **Battery and memory.** A render loop runs even when nothing moves. | A recovery app sits open on Today. | On-demand rendering and a low target frame rate when static. Pass marks: ≤ 250 MB memory on Today; ≤ 2% battery per 30 minutes idle. |
| **Telemetry.** Unity services (analytics, crash reporting, ads) must be absent, not just off. | Privacy house rule 3: no third-party network calls. | No services packages installed; verify zero startup network calls with a proxy. |
| **Workflow.** No Unity Editor in Claude Code cloud sessions. Builds, device testing and MCP need the Editor on your own computer (a Mac is needed for iOS anyway, as the plan already says for Phase 5). No preview link; no Playwright. | The whole build guide assumes cloud sessions with a preview link and browser tests. | Cloud sessions keep writing C#, content and docs; the owner runs Claude Code locally with the Editor and MCP for building, testing and scene work; GitHub Actions runs Unity Test Framework in batch mode (needs a Unity licence secret). Pass mark: one build-test-change loop completed by Claude Code through MCP on the owner's computer. |
| **Web preview.** Unity WebGL builds are large and slow to load and are not a PWA. | The current plan uses a web preview for testers. | Testers use TestFlight and Play internal testing instead. |

### Three platform options for D3

1. **PWA with React and TypeScript, then Capacitor** (the plan's default). Smallest and fastest to start, easiest to build and test in cloud sessions, accessibility from the platform. The living harbor is possible with Rive or Lottie animations, SVG scenes and, if needed, a WebGL canvas; small runtimes, but a skilled designer-developer loop to reach Unity's level of polish.
2. **Unity 2D (URP) native app** (the owner's preference). Richest scene and game feel; heavier app; hand-built accessibility; desktop workflow. Decided by the spike.
3. **Hybrid: Unity shell with a native WebView for text-heavy screens.** Unity for the harbor, SOS animations and the game; lessons, exercises and logs as web pages inside the app, which keeps forms, text, dictation and accessibility easy. Two codebases and skills, WebView quirks, still a Unity-sized app. Worth it only if the spike fails on text input or accessibility but passes on everything else.

### The spike (Step 0.6)

One week on the owner's computer with Unity 6 installed. Build a throwaway app with a Today screen with a calm animated harbor, an SOS screen with the wave timer, a long text form, encrypted SQLite storage, one local notification, and screen-reader labels. Measure cold start to SOS, download and installed size, memory, battery, VoiceOver and TalkBack, font scaling, text input with dictation, and startup network calls. Compare with the pass marks in PLAN §10.8 and record a go / no-go in the D3 decision record. If Unity wins, Step 0.7 rewrites the build guide's steps for Unity, keeping every goal, order and "done when" and every safety, privacy, tutorial and accessibility rule.

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
6. **"Why this works."** Each technique's real evidence is one tap away (PLAN §5.12), which both reassures and motivates: these are not made-up rituals.
7. **One new idea, not in the plan (optional): the forecast check.** In the Weekly Review, show last week's forecast rough weather beside what the logbook actually recorded, the way the Prediction Lab compares predicted and actual enjoyment. It rewards reflection and self-knowledge, uses data the app already has, and adds no new entity. Worth a decision before Phase 3.

## Decisions

- **D6:** treat the Harbor as the recommended world for the game layer; answer it in Step 0.1.
- **D3:** run the Step 0.6 spike; Unity if it passes, the web stack if it does not. Record the measurements in the decision record either way.
