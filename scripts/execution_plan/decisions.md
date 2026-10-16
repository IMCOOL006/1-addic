# How to use this document

> In short: This is the list of everything the project needs from you, written as questions. Each one explains why it matters, shows the options, and gives a recommendation. Where "accept the recommendation" is a good answer, say so and move on.

::: tip Status:
Answered by the owner on 16 October 2026. The answers are recorded in docs/decisions/ (records 0001 to 0019) and in PLAN.md §15, and the plan was updated to match. One question is still open: D13, the app's name (a shortlist is in record 0013). This document stays as the record of the questions, the options and the recommendations as they stood.
:::

The execution plan is ready, but it cannot start without your answers. Some are decisions only the owner can make (which platform, what the app is called, how it earns money). Some are inputs only you can provide (a clinical reviewer, a Mac, verified crisis numbers). This document collects all of them in one place.

**How to answer**

- Under every question there is a "My answer" block. Tick a box, or write your answer in Word, on paper, or in a reply to me.
- "Accept the recommendation" is always a valid answer. The recommendations follow the plan's defaults and the reasoning in the execution plan.
- Three questions have no recommendation because only you can answer them: D10 (which country first), D13 (the app's name) and D16 (who reviews the clinical content).
- Part 4 is a one-page answer sheet. If you fill in nothing else, fill in that.
- When you are done, the appendix shows how to turn the answers into decision records with one prompt (Step 0.1 of the build plan).

**What is needed first**

- Before any building: Part 1 (the 19 decisions) and the name (D13).
- During the first weeks: a computer for the Unity spike (I3), the clinical reviewer (D16) and the verified crisis numbers (I6).
- Later, when the phase arrives: store accounts, pricing details, audio voices, testers.

::: tip
Numbers in this document that come from outside the plan (store fees, device needs) are labelled as such. The plan's own estimates are not commitments.
:::

# Part 1: The nineteen decisions in the plan

> In short: These are decisions D1 to D19 from the plan, one per section, phrased as questions. Each has options, a recommended default, what it affects and when it is needed. Answering them is Step 0.1 of the build plan.

## D1. Is the app for you alone, or for other people too?

> In short: This decides how carefully the content, safety and legal work must be done, and it affects three other decisions. The plan recommends designing for the public from day one while you use it yourself first.

**The question.** Do you want 1-addic only for your own recovery, or do you want other people to be able to install it from the app stores?

@widths 1.1,1.7,1.6,1.6
| Option | What it means | Upside | Downside |
|---|---|---|---|
| Personal use only | You build it for yourself. Nobody else installs it. | Fastest. No clinical, legal or store work. | Cannot be shared or sold. The paid plan (D15) makes no sense. |
| Public release | Other people install it from the stores. | The app can help others and support the paid plan. | Needs original content, a clinical review, a legal review, store accounts and support. |

::: decision Recommended:
Design for the public while using it yourself first. Writing original content from day one costs nothing extra and keeps every door open. The reviews only happen before a public release.
:::

- **Affects:** D2 (content), D15 (business model), D19 (safety floor), Phase 6.
- **Needed by:** Step 0.1.

@answer

## D2. Fresh content, or the book's text?

> In short: The source workbook is copyrighted. The app's lessons must either be written fresh from the evidence-based techniques, used privately with chapter references, or licensed from the publisher.

**The question.** Should the lessons and exercises be written in our own words, based on the techniques nobody owns (CBT relapse prevention, motivational interviewing, mindfulness-based relapse prevention, behavioural activation)?

@widths 1.1,1.7,1.6,1.6
| Option | What it means | Upside | Downside |
|---|---|---|---|
| Private companion | The app references the book's chapters; you keep your own copy. The book's text still never goes into the project. | Fastest, most faithful. | Cannot be distributed. |
| Original content | Fresh lessons and exercises built on the techniques, with original characters and stories, citing the research. Chapter references kept as metadata. | Shippable. Ours to evolve. Matches the evidence screen. | Writing effort. Needs clinical review. |
| License from the publisher | Ask New Harbinger for permission to use the text and exercises. | Faithful, brandable. | Cost, time, uncertainty. |

::: decision Recommended:
Original content with chapter references in the metadata. Never use the book's title as the app's name.
:::

- **Affects:** every lesson from Step 2.5 on; the evidence screen; the name (D13).
- **Needed by:** Step 0.1.

@answer

## D3. Unity or the web stack? Let the spike decide

> In short: You would like Unity if it can deliver. The plan now settles this with a one-week measured spike rather than an argument. What I need from you is agreement on that method and on the pass marks, and a computer to run it on.

**The question.** Do you agree to let Step 0.6 decide, using the pass marks below, and will you have a computer with Unity 6 installed (and a Mac for the iPhone build) to run it on?

@widths 1.1,1.7,1.6,1.6
| Option | What it means | Upside | Downside |
|---|---|---|---|
| PWA with React and TypeScript, then Capacitor (the plan's default) | A web app that installs like an app, wrapped for the stores later. | Small and fast to start. Built and tested in cloud sessions with a preview link. Accessibility comes from the platform. | A living harbor needs skilled web animation work. Weaker reminders until the native phase. |
| Unity 2D native app (your preference) | A game-engine app built for both stores from one project. | The richest living scene. Official Unity MCP lets Claude Code work inside the Editor. Native features from day one. | Bigger app, slower cold start, hand-built accessibility, text input through plugins. Building and testing on your own computer, not in the cloud. |
| Unity with a WebView for text-heavy screens | Unity for the harbor and SOS, web pages inside it for lessons and logs. | Keeps forms, dictation and accessibility easy. | Two codebases, WebView quirks, still a Unity-sized app. |
| React Native or Flutter | Other cross-platform tools. | A more native feel than a web app. | No advantage over the first two for this app; harder to test in the cloud. |

**The pass marks the spike must meet** (from the plan's performance budget; change any number you disagree with):

@widths 1.6,1.9,1.5
| Check | Pass mark | Your number, if different |
|---|---|---|
| Cold start to a usable SOS screen, offline | Unity: ≤ 2.0 s on a mid-range Android, ≤ 1.5 s on a recent iPhone (web: ≤ 1 s) |  |
| Download size | ≤ 60 MB per store |  |
| Installed size | ≤ 120 MB |  |
| Memory on Today | ≤ 250 MB |  |
| Battery, 30 minutes idle on Today | ≤ 2% |  |
| Screen readers | VoiceOver and TalkBack read every SOS and onboarding control; font scaling honoured |  |
| Text input | Keyboard, autocorrect and dictation work in a long text field |  |
| Startup network calls | Zero |  |
| Workflow | Claude Code completes a build, test and change loop through Unity MCP on your computer |  |

::: decision Recommended:
Run the spike. Unity if it passes (your preference). The web stack if it does not. The hybrid only if it fails on text input or accessibility alone. Either way the harbor gets built.
:::

- **Affects:** every build step after 0.5; where you work (cloud or your computer); the timeline.
- **Needed by:** the method at Step 0.1; the result at Step 0.6, at the end of Phase 0.

@answer

## D4. Devices and sync: three devices, no account?

> In short: You asked for an app that opens only on a registered device and syncs to up to two more devices on the same plan. This confirms the honest version of that design: device-bound keys in the phone's secure hardware, no email or password, end-to-end encrypted sync for three devices.

**The question.** Is this the plan you want: three devices in total (your phone plus two more), no account profile, licensing from the native phase (Phase 5), and the sync service in Phase 6?

@widths 1.1,1.7,1.6,1.6
| Option | What it means | Upside | Downside |
|---|---|---|---|
| No sync (the plan's old default) | Each phone is on its own. Backup by export. | Simplest. No server at all. | A new phone means restoring from a file. |
| A plan with device-bound keys and sync for up to three devices (your direction) | A purchase registers the device; up to three devices share one plan and sync encrypted data. | What you asked for. The server cannot read anything. No email or password. | A small server to run; a pairing flow to build; licensing only on the native builds. |
| Accounts with email and password from the start | A traditional sign-in. | Familiar. | More support work and a bigger privacy surface, and not needed for three devices. |

Two small follow-up questions:

- When someone gets a new phone, they remove the old one in Settings → Your devices and plan, or remove a lost phone the same way. Is that acceptable?
- A removed device keeps its local data and the safety floor (D19). Is that acceptable?

::: decision Recommended:
Your direction as specified. Confirm the count of three devices.
:::

- **Affects:** Steps 5.4 and 6.5; the privacy section; the licence server.
- **Needed by:** Step 0.1 to record; built in Phases 5 and 6.

@answer

## D5. Reminders before the native phase

> In short: A web app cannot schedule reminders reliably on its own. Until the native phase, reminders arrive as in-app prompts plus calendar files. If Unity wins D3, this question disappears, because the app is native from the start.

**The question.** Until native notifications exist, are in-app prompts plus calendar export (.ics files the phone's calendar reminds you about) enough?

@widths 1.1,1.7,1.6,1.6
| Option | What it means | Upside | Downside |
|---|---|---|---|
| In-app prompts plus .ics calendar export | Reminders show when the app opens; Battle Plans and the Weekly Review go into the phone's calendar. | No server. No privacy surface. | Less immediate than a push notification. |
| A tiny push relay server | A server stores reminder times and sends pushes. | Real notifications earlier. | A server to run, a privacy surface, cost. |

::: decision Recommended:
In-app prompts plus .ics export. Moot if Unity is chosen.
:::

- **Needed by:** Step 0.1; matters only for the web path in Phases 1 to 4.

@answer

## D6. The game's world: the Harbor?

> In short: The game layer needs a world. The Harbor, from the concept you found, is now the recommended world, with the Two Brains mechanics underneath and the Brain Map as a fallback.

**The question.** Should the progress map be a small harbor whose places light up with practice, and should the game layer be on by default with Calm mode available to switch it off?

@widths 1.1,1.7,1.6,1.6
| Option | What it means | Upside | Downside |
|---|---|---|---|
| Two Brains with the Brain Map | Train your Rational Brain; progress shows on a stylised brain. | Native to the book's science. | Brain imagery can feel clinical. |
| The Road | Skills as car upgrades, risky situations as intersections. | Intuitive journey. | Driving can be a trigger or trauma topic. |
| The Garden | A garden that grows and never dies. | Very gentle. | Generic; weak link to the book. |
| The Harbor world with Two Brains mechanics | Lighthouse, Cove, Garden, Pier, Compass Rose and Weather Station; cravings as passing weather; skills as anchors; SOS as safe harbor. | Calm, adult, non-clinical. Fits SOS, the wave timer and the plan's Compass and Radar. | Must never start neglected or decay; no storms during SOS; test with people in recovery. |

And: on by default, or opt-in?

::: decision Recommended:
The Harbor world with Two Brains mechanics, on by default, with Calm mode one tap away. Brain Map as the fallback if the harbor tests badly.
:::

- **Affects:** Step 0.5 (style guide), Step 4.1 (the map), Step 4.4 (the living scene), companion copy.
- **Needed by:** Step 0.1.

@answer

## D7. Abstinence only, or also "cut down" goals?

> In short: The source book is abstinence-based, and so is its evidence. Allowing "cut down" goals would change the lessons, the counters and the safety messages, and would need a different review.

**The question.** Should the app stay abstinence-focused, with a gentle path for people who are not sure yet, and safety information for everyone?

@widths 1.1,1.7,1.6,1.6
| Option | What it means | Upside | Downside |
|---|---|---|---|
| Abstinence-focused with a contemplation path | The goal is to stop; people who are unsure get the motivation module first and a softer tone. | Matches the book and its evidence. Clear counters. | Not for people whose goal is moderation. |
| Also allow "cut down" goals | A second goal type with its own counters and messages. | Reaches more people. | Different evidence base; more content; more clinical review. |

::: decision Recommended:
Abstinence-focused, with the contemplation path. Safety information (withdrawal, overdose, crisis) for everyone regardless.
:::

- **Needed by:** Step 0.1; shapes onboarding (Step 1.2) and all content.

@answer

## D8. Which substances?

> In short: The book covers alcohol and drugs. Nicotine could be added; behavioural addictions such as gambling are outside the book and would need different content.

**The question.** Alcohol and drugs only, or also nicotine, or also behavioural addictions?

@widths 1.1,1.7,1.6,1.6
| Option | What it means | Upside | Downside |
|---|---|---|---|
| Alcohol and drugs | The book's scope. | Everything in the plan applies. | Excludes some people. |
| Plus nicotine | Smoking and vaping as a substance option. | Many people in recovery also smoke. | Some content needs adjusting (withdrawal, triggers). |
| Plus behavioural addictions | Gambling, gaming and similar. | Wider reach. | Outside the book; different triggers and safety content; more review. |

::: decision Recommended:
Alcohol and drugs. Nicotine as an optional extra later. Behavioural addictions out.
:::

- **Needed by:** Step 0.1; affects onboarding and content.

@answer

## D9. Adults only?

> In short: Minors need a different design, different consent and a different legal basis. The plan recommends 18 and over.

**The question.** Is the app for adults (18+) only?

@widths 1.1,1.7,1.6,1.6
| Option | What it means | Upside | Downside |
|---|---|---|---|
| 18+ | Adults only, stated in onboarding and the store rating. | Simpler legally; matches the book. | Excludes teenagers. |
| 13+ | Teenagers allowed. | Wider reach. | Parental consent, different content and safety design, stricter store rules and laws. |

::: decision Recommended:
18+.
:::

- **Needed by:** Step 0.1; affects onboarding, the privacy policy and the store listing.

@answer

## D10. Which country and language first?

> In short: Only you can answer this. It decides which crisis lines, emergency numbers and resources the app shows first, and which store listing comes first.

**The question.** Which country should the app support first, and is English the only language for now?

- The crisis lines, emergency and poison-control numbers, meeting finders and treatment finders are per-region content files. One region is built first (Step 1.3); more can be added later without code.
- You will be asked to personally verify every number for that region (I6).
- Other languages mean translating all content and the audio scripts; that is a later phase.

::: decision Recommended:
Your own country and English first. Add regions as content files when there is someone to verify them.
:::

- **Needed by:** Step 0.1 (it drives Step 1.3).

@answer

## D11. An AI coach?

> In short: An optional AI rehearsal partner is possible later. It never sits in the SOS path and it is only proposed on paper first. The plan recommends deciding after reading that proposal.

**The question.** No AI coach, a later opt-in feature, or a core feature from the start?

@widths 1.1,1.7,1.6,1.6
| Option | What it means | Upside | Downside |
|---|---|---|---|
| No | The app stays fully offline and deterministic. | Simplest; strongest privacy story. | No rehearsal partner. |
| Later, opt-in | Step 6.4 writes a proposal first (design, prompts, crisis routing, costs). Build only if you approve it. | Keeps the option without committing. | None now. |
| Core feature | AI in the main flows from the start. | Novel. | Text leaves the device; a server; ongoing cost; a harder clinical and privacy review. |

::: decision Recommended:
Later, opt-in. Read the Step 6.4 proposal before deciding to build.
:::

- **Needed by:** Phase 6; record the direction at Step 0.1.

@answer

## D12. Sharing with a therapist or sponsor

> In short: The book is designed to be used alongside therapy. A PDF export is enough for version 1; live sharing would need a server and consent flows.

**The question.** PDF export of the plan and logs, or live sharing with a therapist?

@widths 1.1,1.7,1.6,1.6
| Option | What it means | Upside | Downside |
|---|---|---|---|
| PDF export | The person exports a readable PDF and shares it themselves. | No server; the person controls it. | Not live. |
| Live share | A therapist sees the data through a server. | Convenient for clinicians. | Server, consent flows, a clinician dashboard, legal exposure. |

::: decision Recommended:
PDF export in version 1.
:::

- **Needed by:** Phase 3 (Step 3.8); record at Step 0.1.

@answer

## D13. What is the app called?

> In short: Only you can answer this. The name must not use the book's title, and it should be discreet, because it appears on the home screen, in notifications and on store receipts. "Harbor" is a candidate if a trademark and store-name check passes.

**The question.** What name do you want on the app, and may I run a trademark and store-name check on it?

@widths 1.1,1.7,1.6,1.6
| Option | What it means | Upside | Downside |
|---|---|---|---|
| Keep "1-addic" | The working title becomes the product name. | Nothing to decide. | Not discreet: "addic" reveals the purpose to anyone who sees the phone or a receipt. |
| "Harbor" or a harbor-themed name | Matches the game world. | Discreet, calm, meaningful. | A common word: trademark and store-name conflicts are likely; check first. |
| Another discreet, neutral name | Your own idea. | Fully yours. | Needs the same checks. |

::: decision Recommended:
A discreet, neutral name chosen before Step 0.5 (the design system needs it), after a trademark search and a store-name check. Keep "1-addic" as the project's folder name only.
:::

- **Needed by:** Step 0.1; the design system (Step 0.5) and the store listing use it.

@answer

## D14. Sober, clean, substance-free, or the person's choice?

> In short: People in recovery use different words for themselves. The plan lets each person choose in onboarding; the app's own voice always uses person-first language.

**The question.** Should the person choose their word in onboarding?

@widths 1.1,1.7,1.6,1.6
| Option | What it means | Upside | Downside |
|---|---|---|---|
| A fixed default ("sober", "clean" or "substance-free") | Everyone sees the same word. | Simpler copy. | Some people dislike the word they get. |
| The person's choice in onboarding | The app uses the word the person picks everywhere. | Respectful; matches the book's tone guidance. | Slightly more copy work. |

::: decision Recommended:
The person's choice in onboarding.
:::

- **Needed by:** Step 0.1; used from Step 1.2.

@answer

## D15. One-time fee or subscription, and is crisis help free?

> In short: You want a paid app. The plan recommends a one-time purchase that includes sync for three devices, a subscription only if ongoing costs require it, and, as my recommendation, a free safety core so crisis help is never behind a paywall.

**The question.** How should the app earn money, and what should be free?

@widths 1.1,1.7,1.6,1.6
| Option | What it means | Upside | Downside |
|---|---|---|---|
| One-time purchase including 3-device sync | Buy once in the store; sync included because the data is tiny. | Simple, fair, no lapse problem, no "cancel" dark patterns. | Does not fund ongoing work by itself. |
| Subscription | A monthly or yearly fee. | Funds clinical updates, resource checks and support. | A lapse must never lock out safety tools (D19); store subscription rules; cancellation law. |
| One-time purchase plus an optional sync subscription | Pay once for the app; pay yearly only for sync. | Matches cost to the one ongoing service. | Two things to explain. |
| Free | The plan's old default. | Widest reach. | Does not match your direction. |

**Sub-question, my recommendation:** should the safety core (urgent help, SOS, the quick log and the person's own data) be free for everyone, with the full app paid? It costs nothing extra, it is the ethical position for a recovery app, and it doubles as the free trial. The store's own trial mechanics apply only to subscriptions.

::: decision Recommended:
A one-time purchase that includes 3-device sync. The safety core free for everyone. A subscription only if ongoing costs require it, always with the D19 safety floor and easy cancellation. No ads, no data sales.
:::

- **Also needed later (I11):** the price, the currency and the refund stance.
- **Needed by:** record at Step 0.1; built at Step 5.4.

@answer

## D16. Who reviews the clinical content?

> In short: Only you can answer this. A licensed addiction professional must review the lessons, the crisis and lapse copy, the medical-safety screens and the evidence list before any public release, and ideally early, for the first modules and the lapse flow.

**The question.** Who is the clinical advisor, or how will you find one, and by when?

@widths 1.3,1.9,1.4,1.4
| Option | What it means | Upside | Downside |
|---|---|---|---|
| Someone you know | A counsellor, psychologist or addiction doctor in your network. | Fast, trusted. | May lack time; keep the scope written. |
| A paid consultant | An addiction psychologist or counsellor paid by the hour. | Clear scope and accountability. | Cost. |
| A clinic or university contact | A treatment centre or research group. | Credibility; possible usability-study help. | Slower to arrange. |
| A telehealth clinician | A licensed clinician found through a platform. | Available quickly. | Check licensing and addiction expertise. |

::: decision Recommended:
Find them during Phase 1 or 2, pay them, and agree a written scope: modules M1 and M2, the lapse flow, crisis copy, medication text and the evidence list, with a sign-off before release (Step 6.1 prepares the packet).
:::

- **Needed by:** a name or a plan by the end of Phase 1.

@answer

## D17. Reveal features gradually?

> In short: The app has many features. Revealing them as the Journey reaches them, each with its tutorial, avoids overwhelming people. A setting shows everything at once for those who prefer that.

**The question.** Progressive reveal with a "Show all features now" setting, or everything visible from day one?

@widths 1.1,1.7,1.6,1.6
| Option | What it means | Upside | Downside |
|---|---|---|---|
| Progressive | Features appear with a "New" dot and a short tutorial as lessons unlock them. SOS, crisis help, logs and check-ins are always there. | Low mental load in early recovery. | Some people want to see everything. |
| Everything visible | All tabs and tools from day one. | Nothing hidden. | Overwhelming for many. |

::: decision Recommended:
Progressive, with the "Show all features now" setting.
:::

- **Needed by:** Step 0.1; built at Step 2.3.

@answer

## D18. The default learning pace

> In short: The Learning Roadmap plans one module per period. Steady (one a week) matches the book's "practise before moving on". People change it any time.

**The question.** Gentle (one module every two weeks), Steady (one a week) or Focused (two a week) as the default?

::: decision Recommended:
Steady, chosen in onboarding and changeable any time.
:::

- **Needed by:** Step 0.1; used at Steps 1.2 and 2.4.

@answer

## D19. What stays available without a valid licence?

> In short: With a paid, device-bound app there will be moments with no valid licence: offline, a lapsed subscription, a removed device. The plan's house rule is that SOS is never gated. This confirms the safety floor.

**The question.** When the licence cannot be verified, or has lapsed, or the device was removed, what still works?

@widths 1.1,1.7,1.6,1.6
| Option | What it means | Upside | Downside |
|---|---|---|---|
| Everything locks | The app will not open without a valid licence. | Maximum enforcement. | Breaks the house rule; a person in crisis could be locked out of their own reasons and crisis numbers. Reputational and ethical risk. |
| The safety floor stays open | Urgent help, SOS, the person's own artifacts and logs, export and delete always work. Only new lesson content and sync pause. | Nobody is ever locked out of help or their own data. | Slightly weaker enforcement. |

::: decision Recommended:
The safety floor stays open forever.
:::

- **Needed by:** record at Step 0.1; built at Step 5.4.

@answer

# Part 2: Things only you can provide

> In short: These are not decisions but inputs: your time, money, equipment, accounts, people and preferences. Each one says what it is for and when it is needed.

## I1. How much time can you give each week?

> In short: The plan assumes one developer with Claude Code, and the developer's main job is running steps, trying builds, reviewing content and using the app. Your available hours set the pace.

**The question.** Roughly how many hours a week can you spend on the project during Phases 0 to 2?

- The heaviest asks are: the Unity spike week (Step 0.6), the 7-day dogfooding after Phase 1, verifying crisis numbers, reviewing lesson content, and trying each step on your phone.
- At about 5 hours a week, steps queue up and phases stretch. At about 10, the plan's estimates hold.

::: decision Recommended:
Plan for 8 to 10 hours a week during Phases 0 and 1, when your judgement is needed most.
:::

@answer

## I2. What is the budget?

> In short: Most of the plan costs time, not money. The unavoidable costs are the store accounts; the optional ones are devices, clinical hours, illustration, a small server and legal advice.

**The question.** What is your spending cap, and which of the optional items do you want to pay for?

@widths 1.6,1.6,1.8
| Item | Cost | When |
|---|---|---|
| Apple Developer Program | US$99 a year (Apple's published price) | Phase 5, or the Unity spike if you want an iPhone build |
| Google Play Console | US$25 one-time (Google's published price) | Phase 5 |
| Test phones | Free if you already own a mid-range Android and a recent iPhone; otherwise used devices | Step 0.6 and Phase 5 |
| Licence and sync server | A small monthly hosting fee once built | Steps 5.4 and 6.5 |
| Clinical review | Paid hours; set a cap | Phase 2 (early review) and Phase 6 (full review) |
| Illustration | An illustrator for the harbor and the cast, or generated art reviewed by a designer | Steps 0.5 and 4.1 |
| Usability study | Payments to participants in recovery | Phase 6 |
| Legal | A trademark search and an IP and privacy consult | Phase 0 (name) and Phase 6 |
| Unity AI subscription | Only if the official Unity MCP still requires it; check Unity's current terms | Step 0.6, if Unity |

::: decision Recommended:
Budget the two store accounts now, a clinical-review cap for Phase 2, and decide on illustration at Step 0.5. Everything else can wait for its phase.
:::

@answer

## I3. A computer and phones for the spike and for native builds

> In short: iPhone builds need a Mac with Xcode. The Unity spike needs a computer with Unity 6. Testing needs a mid-range Android and a recent iPhone.

**The question.** Do you have, or can you borrow, a Mac, a mid-range Android phone (about three years old) and a recent iPhone?

- Android builds can be made on Windows or Mac; iPhone builds need a Mac.
- The spike's pass marks are measured on real phones, not simulators.

::: decision Recommended:
A Mac if possible (it covers everything). Borrowed phones are fine.
:::

- **Needed by:** Step 0.6; Phase 5.

@answer

## I4. Accounts to open

> In short: Some accounts take days to approve, so they are best opened before the phase that needs them.

**The question.** Will you open these accounts when their phase arrives, and may I remind you?

@widths 1.4,2.6,1
| Account | What it is for | Needed by |
|---|---|---|
| GitHub (you have it) | The project's files. | Now |
| Unity ID, and Unity AI if required | Installing Unity 6 and the official MCP server. | Step 0.6, if Unity |
| Apple Developer Program | iPhone test builds and the App Store. Approval can take days. | Phase 5 (earlier for an iPhone spike build) |
| Google Play Console | Android test builds and the Play Store. | Phase 5 |
| Claude Code on your computer | Running the Unity spike and native steps locally with your existing Claude subscription. | Step 0.6, if Unity |

@answer

## I5. Legal advice

> In short: Two moments need a lawyer: a short trademark and copyright check before the name is chosen, and a privacy and store-terms review before public release.

**The question.** Do you have a lawyer, and when do you want the two consults?

@widths 1.1,1.7,1.6,1.6
| Option | What it means | Upside | Downside |
|---|---|---|---|
| A short consult now, full review before release | Trademark and IP check in Phase 0; privacy policy and store terms in Phase 6. | Catches a bad name early. | Cost now. |
| Everything before release | One review in Phase 6. | Cheaper now. | A name change late is painful. |
| None | Personal use only. | No cost. | Only valid if D1 is personal use. |

::: decision Recommended:
A short consult before naming, a full review before release.
:::

@answer

## I6. Verify the crisis numbers yourself

> In short: Step 1.3 produces a list of every crisis line, emergency number and resource for your region, each marked "needs verification". Someone must call or check every one. That is you, or the clinical advisor.

**The question.** Will you personally verify the numbers for your region by the end of Phase 1, or delegate it to the clinical advisor?

::: safety
A wrong crisis number in a recovery app is the worst kind of bug. Nothing is released with an unverified number.
:::

::: decision Recommended:
You verify them, with the clinical advisor double-checking the overdose and withdrawal guidance.
:::

@answer

## I7. The look you want

> In short: The design system and the harbor scene need a direction before Step 0.5: the mood, colours, examples you like, and whether to hire an illustrator.

**The question.** Can you send three to five examples of apps or illustrations you like, a few mood words, colour preferences, your dark-mode preference, and your choice of illustrator or generated art?

- The plan asks for calm, adult, warm and non-clinical, with nothing childish.
- One consistent illustration style matters more than any single picture.

::: decision Recommended:
Send examples, then decide illustrator versus generated art at Step 0.5 when you see the first screens.
:::

@answer

## I8. Words and voice

> In short: The companion speaks the app's voice. Its default name, the words you want avoided, and the tone you like are needed before the first lessons are written.

**The question.** What should the companion be called by default (people can rename it), which words or phrases must never appear, and which tone do you want: calm coach, friendly peer, or quiet guide?

::: decision Recommended:
A short, warm default name tied to the harbor (for example the keeper's name), a list of words to avoid, and the "calm coach" tone that the plan's tone guide describes.
:::

- **Needed by:** Step 2.5.

@answer

## I9. Seven days of daily use

> In short: Phase 1 ends only when you have used the app every day for a week and written down what you noticed. Nobody else can do this part.

**The question.** When Phase 1 ends, will you use the app daily for seven days and fill in the dogfooding checklist?

::: decision Recommended:
Yes, and schedule the week before Phase 1 ends so it does not slip.
:::

@answer

## I10. Testers and reviewers

> In short: Designers and friends can test early; people in recovery must be tested with care, paid, and with consent, in Phase 6.

**The question.** Who can test early builds, and who will help recruit people in recovery for the paid usability study?

::: decision Recommended:
Two or three early testers from Phase 2, and the clinical advisor's help to recruit for the Phase 6 study.
:::

@answer

## I11. Pricing details

> In short: Once D15 is settled, the store needs numbers: the price, the currency, and your stance on refunds and trials.

**The question.** What price and currency, and what refund and trial approach?

::: decision Recommended:
Decide at Step 5.4 after seeing the finished app; a single modest one-time price with the free safety core as the trial.
:::

@answer

## I12. Audio voices

> In short: Version 1 uses the phone's text-to-speech for the guided practices. Recorded voice can replace it later, if someone records it.

**The question.** Later, who records the audio: you, a voice actor, or a volunteer? Or stay with text-to-speech?

::: decision Recommended:
Text-to-speech until Phase 5, then decide after hearing it on a phone.
:::

@answer

## I13. One book or several?

> In short: The execution plan has grown to about 100 pages. It can stay one book or be split for different readers.

**The question.** Keep one document, or split it into the plan, the build book and the appendices?

::: decision Recommended:
Keep one document until Phase 1; split it if testers or the clinical reviewer ask for a lighter version.
:::

@answer

# Part 3: Confirming the October additions

> In short: Four things were added to the plan at your request this month. These questions confirm the details that only you can settle.

## C1. The Harbor's four conditions

> In short: The Harbor is adopted only under four conditions that protect people from shame and from drama in a crisis.

**The question.** Do you accept these conditions?

- Nothing ever starts damaged, decays or is taken away. The harbor only gains.
- No storm visuals or weather drama inside a live SOS session or the crisis screen.
- Weather is never a dare. No "can you weather this?" challenges.
- Reactions are tested with people in recovery, including anyone for whom water or sailing is a hard topic.

::: decision Recommended:
Accept all four.
:::

@answer

## C2. The spike's pass marks

> In short: The numbers in D3 are proposals. If you want the app smaller, faster or lighter than that, say so before the spike runs.

**The question.** Any change to the pass marks in D3?

::: decision Recommended:
Keep them, and treat any one failure as a real failure rather than rounding up.
:::

@answer

## C3. Three devices and the new-phone flow

> In short: The device limit and the way people move to a new phone are small details with large support consequences.

**The question.** Three devices per plan, removal of a lost or old device in Settings, and a removed device keeping its local data: confirmed?

::: decision Recommended:
Confirmed as described.
:::

@answer

## C4. Where "Why this works" appears

> In short: The evidence screen lives in Settings, with a small link on Today and in every lesson wrap. It never appears inside SOS.

**The question.** Is that placement right, or do you want the link somewhere else as well?

::: decision Recommended:
As planned. Never inside SOS or the crisis screen.
:::

@answer

## C5. The forecast check

> In short: One genuinely new idea came out of the Harbor review: comparing the week's forecast rough weather with what the logbook actually recorded. It rewards reflection, not outcomes, and uses data the app already has.

**The question.** Yes, no, or decide later?

::: decision Recommended:
Decide later, before Phase 3, when the planner and the logs exist.
:::

@answer

# Part 4: Your answer sheet

> In short: Every question on one sheet. Fill in the last column and you are done.

@size 17
@widths 0.45,2.2,1.9,0.9,1.3
| ID | Question | Recommended | Needed by | My answer |
|---|---|---|---|---|
| D1 | For you alone, or public? | Design for public, dogfood first | Step 0.1 |  |
| D2 | Fresh content or the book's text? | Original content with chapter references | Step 0.1 |  |
| D3 | Unity or web? | Let the Step 0.6 spike decide; Unity if it passes | Step 0.1 / 0.6 |  |
| D4 | Devices and sync? | Device-bound keys, three devices, no profile | Step 0.1 |  |
| D5 | Reminders before native? | In-app plus .ics (moot if Unity) | Step 0.1 |  |
| D6 | The game's world? | Harbor with Two Brains mechanics, on by default | Step 0.1 |  |
| D7 | Abstinence or also cut down? | Abstinence, with a contemplation path | Step 0.1 |  |
| D8 | Which substances? | Alcohol and drugs; nicotine optional later | Step 0.1 |  |
| D9 | Adults only? | 18+ | Step 0.1 |  |
| D10 | Country and language first? | Your own country, English | Step 0.1 |  |
| D11 | AI coach? | Later, opt-in, after the proposal | Phase 6 |  |
| D12 | Sharing with a therapist? | PDF export | Phase 3 |  |
| D13 | The app's name? | A discreet name after a trademark check | Step 0.1 |  |
| D14 | Sober, clean, or choice? | The person's choice | Step 0.1 |  |
| D15 | One-time or subscription; free safety core? | One-time incl. sync; safety core free | Step 0.1 / 5.4 |  |
| D16 | Clinical advisor? | Find and pay one in Phase 1–2 | End of Phase 1 |  |
| D17 | Progressive reveal? | Yes, with "Show all features now" | Step 0.1 |  |
| D18 | Default pace? | Steady | Step 0.1 |  |
| D19 | Without a licence? | The safety floor stays open | Step 0.1 / 5.4 |  |
| I1 | Hours per week? | 8–10 in Phases 0–1 | Now |  |
| I2 | Budget cap and optional items? | Store accounts now; clinical cap for Phase 2 | Now |  |
| I3 | Mac and test phones? | A Mac; borrowed phones are fine | Step 0.6 |  |
| I4 | Accounts? | Open each before its phase | Per phase |  |
| I5 | Legal advice? | Short consult now, full review before release | Phase 0 / 6 |  |
| I6 | Verify crisis numbers? | You, with the advisor's check | End of Phase 1 |  |
| I7 | The look? | Send examples; decide illustrator at Step 0.5 | Step 0.5 |  |
| I8 | Companion name, words, tone? | Warm harbor name; calm coach | Step 2.5 |  |
| I9 | Seven days of daily use? | Yes, scheduled | End of Phase 1 |  |
| I10 | Testers and recruiting? | 2–3 early testers; advisor helps recruit | Phase 2 / 6 |  |
| I11 | Price, currency, refunds? | Decide at Step 5.4 | Step 5.4 |  |
| I12 | Audio voices? | Text-to-speech until Phase 5 | Phase 5 |  |
| I13 | One document or several? | One until Phase 1 | Now |  |
| C1 | Harbor conditions? | Accept all four | Step 0.1 |  |
| C2 | Spike pass marks? | Keep them | Step 0.6 |  |
| C3 | Three devices, new-phone flow? | Confirmed | Step 0.1 |  |
| C4 | Where "Why this works" appears? | As planned, never in SOS | Step 2.11 |  |
| C5 | The forecast check? | Decide before Phase 3 | Phase 3 |  |

# Appendix: How to send your answers

> In short: The decisions (D1 to D19) go into the Step 0.1 prompt below, in a new Claude Code session. The inputs and confirmations can simply be a reply to me, or a short note saved in the project.

1. Open Claude Code on the web and start a new session on the repository.
2. Paste the prompt below, filling in each decision. Write "default" wherever you accept the recommendation.
3. Send the inputs (I1 to I13) and the confirmations (C1 to C5) as a message, or ask me to save them as `docs/decisions/owner-inputs.md`.
4. Claude Code creates one decision record per answer and updates the plan to match. Building starts at Step 0.2.

@step01
