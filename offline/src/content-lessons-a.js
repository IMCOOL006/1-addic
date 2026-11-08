/* 1-addic · CONTENT · lessons for modules M0–M3 (Start Here, Understand, Brain, Find Your Why).
   Original wording throughout. `refs` cite docs/evidence-references.md ids. `book` is metadata. */
const C_a = (typeof Content !== 'undefined') ? Content : require('./content-core.js');
C_a.modules = C_a.modules || [];

C_a.modules.push(
{ id: 'm0', step: null, name: 'Start Here', harbor: 'The harbor gate', book: 'Intro',
  blurb: 'What this is, how it thinks, and a safe practice run of SOS before you ever need it.',
  unlocks: [], lessons: [
  { id: 'm0-l1', title: 'What this is, and what it is not', minutes: 3,
    moment: { cast: 'meera', text: 'It is 9:40 pm. The flat is quiet, the dishes are done, and Meera has just opened this app for the first time, mostly to have something in her hands that is not a glass.' },
    cards: [
      { title: 'A skills coach, in your pocket', text: 'This app teaches the skills that help people stay away from alcohol and drugs, and then helps you use them in the moments that matter. The skills come from three well-studied approaches: cognitive behavioural therapy, motivational interviewing and mindfulness.' },
      { title: 'Not treatment, not a diagnosis', text: 'It will never tell you what you "are". It does not replace a doctor, a counsellor, a group or medication. If you drink heavily every day, or take sedatives or opioids every day, talk to a doctor before stopping: sudden withdrawal can be dangerous.' },
      { title: 'Built around the hard moment', text: 'The most important button is SOS. Craving, hard feeling, slip or emergency: one tap, works offline, no reading required. Everything else exists to make that button more useful to you over time.' },
      { title: 'Your words, reflected back', text: 'The strongest content here is what you write: your reasons, your people, your answers to your own thoughts. The app saves them and hands them back exactly when you need them.' },
    ],
    checks: [ { q: 'What happens when you tap SOS?', options: [
      { t: 'It shows a lesson about cravings', ok: false, why: 'Never inside SOS. SOS is tools only: ride the wave, remind me why, call someone, distract me, talk back.' },
      { t: 'It walks you through the next fifteen minutes with your own tools', ok: true, why: 'Yes. A craving usually peaks and fades in about fifteen minutes. SOS helps you get to the other side.' },
      { t: 'It contacts someone for you', ok: false, why: 'Nothing leaves your device unless you tap a call or text button yourself.' } ] } ],
    tryIt: { route: '#/sos?drill=1', label: 'Run the SOS practice drill (1 minute, sample data)' },
    wrap: { built: 'You know what the app is for, and you have seen SOS once in calm weather.', lives: 'SOS is the round button on every screen.', action: 'Add one Safety Net so "Call someone" has someone to call.', todo: 'Add one Safety Net in Workbook → My People' },
    refs: ['R32', 'R28'] },
  { id: 'm0-l2', title: 'Two brains, one harbor', minutes: 4,
    moment: { cast: 'raj', text: 'Raj does not think he has a problem. He also notices that by 7 pm every evening his hands know exactly where the packet is before his mind has decided anything.' },
    cards: [
      { title: 'The addicted brain', text: 'Part of you learned, over many repeats, that the substance fixes things fast. That part is quick, automatic and persuasive. It does not argue; it produces thoughts that already sound like decisions: "just one", "nobody has to know".' },
      { title: 'The rational brain', text: 'Another part of you weighs things up and chooses. It is slower, and it gets stronger every time you use it, the way a muscle does. Every skill in this app is a way of giving that part a turn to speak.' },
      { title: 'Cravings are weather', text: 'In this app your progress is drawn as a small harbor. Cravings are weather: they arrive, they pass. Skills are anchors. SOS is safe harbor. Nothing in the harbor ever decays or is taken away; it only gains light.' },
      { title: 'Your companion', text: 'The voice that guides you here is your rational brain, given a name. It never scolds. You can rename it in Settings, or switch the whole game layer off with Calm mode. Everything still works.' },
    ],
    checks: [ { q: '"Just one won\'t hurt." Which brain is talking?', options: [
      { t: 'The rational brain, weighing the evidence', ok: false, why: 'Weighing the evidence sounds like "last time I had one, what happened?" This is a ready-made permission.' },
      { t: 'The addicted brain, handing you a permission slip', ok: true, why: 'Yes. Red-flag thoughts arrive fully formed and sound reasonable. Noticing that is the first skill.' } ] } ],
    tryIt: { exercise: 'quick-reasons' },
    wrap: { built: 'Three quick reasons. They are the first thing SOS shows you.', lives: 'Workbook → My Why → Reasons Card.', action: 'Give your companion a name in Settings, or leave it as it is.', todo: null },
    refs: ['R7', 'R12'] },
  { id: 'm0-l3', title: 'How to use the journey', minutes: 3,
    moment: { cast: 'farhan', text: 'Farhan has been off the pills for seven months. He skipped to the last lesson first, then came back here, which is allowed.' },
    cards: [
      { title: 'Eleven stops', text: 'The journey has eleven stops: three to understand what happened, seven steps of skills, and a final stop where you build your own plan. Each lesson takes three to six minutes and ends with a real exercise, done with examples beside you.' },
      { title: 'Recommended, not locked', text: 'The order is recommended because each step uses the one before. Nothing is locked, and you can revisit Step 1 (your reasons) whenever motivation dips. SOS and the crisis numbers never depend on anything.' },
      { title: 'Practice before moving on', text: 'A stop is only really finished when you have used its skill a few times in real life. The roadmap shows both: lessons done, and skills practised.' },
      { title: 'A slip is data', text: 'If you use, nothing is wiped. Total days, points, badges and skills all stay. The app helps you stop the slip there, and learn from it. Honesty about a slip earns more here than pretending.' },
      { title: 'Your data stays here', text: 'Everything lives in this browser on this device. Nothing is uploaded. That means backups are your job: Settings → Your data → Export, once a week.' },
    ],
    checks: [ { q: 'You have had a hard week and missed your learning target. What does the roadmap do?', options: [
      { t: 'Shows the week in red and marks you overdue', ok: false, why: 'Never. Missed weeks do not turn red. The roadmap says "welcome back" and offers to re-plan.' },
      { t: 'Moves forward with you from where you are', ok: true, why: 'Yes. Pick up where you left off, or re-plan from this week. The pace is yours.' } ] } ],
    tryIt: { route: '#/learn/plan', label: 'Set your pace on the roadmap' },
    wrap: { built: 'A pace that fits your week.', lives: 'Learn → Roadmap → Plan view.', action: 'Go to Stop 1, Understand Addiction, when you are ready. Or straight to Step 1 if you want your reasons first.', todo: null },
    refs: ['R9', 'R32'] },
] },

{ id: 'm1', step: null, name: 'Understand Addiction', harbor: 'The Weather Station, ground floor', book: 1,
  blurb: 'How use becomes a need, the signs, why it happened to you, and how to ask for help.',
  unlocks: ['status'], lessons: [
  { id: 'm1-l1', title: 'How a habit becomes a need', minutes: 4,
    moment: { cast: 'dev', text: 'Second year, exam week. A friend handed Dev one pill and said it would keep him sharp till morning. It did. Two years later he could not open a textbook without one.' },
    cards: [
      { title: 'Three reasons people start', text: 'Because it feels good. Because it takes something bad away: pain, worry, sadness. Or because it seems to help with something: studying, working late, being social. All three are ordinary human reasons.' },
      { title: 'It reliably delivered', text: 'At first the substance did what you expected, every time. That reliability is what trains the brain. A thing that works fast and always gets wired in deeper than anything slow and uncertain.' },
      { title: 'Tolerance and withdrawal', text: 'Then two things shift. You need more for the same effect (tolerance). And you feel bad when it wears off (withdrawal). Somewhere in there the reason changes from "to feel good" to "to feel normal".' },
      { title: 'When it overrides what you value', text: 'Addiction is when the need to use starts to win against things you care about more, and the use continues even though it is costing you. Wanting to be someone who can "take it or leave it" is normal. For most people here, leaving it entirely is the lower-risk path, at least for now.' },
    ],
    checks: [ { q: 'What marks the move from use to problem use?', options: [
      { t: 'Needing more, and feeling bad when it wears off', ok: true, why: 'Yes: tolerance and withdrawal. They are the body\'s way of saying the pattern has set in.' },
      { t: 'Using in the morning', ok: false, why: 'Timing varies a lot. The reliable markers are tolerance and withdrawal, and use that continues despite harm.' } ] } ],
    tryIt: null,
    wrap: { built: 'A clear picture of how the pattern formed. Not a verdict; a map.', lives: 'Nothing to save yet. The next lesson has the checklist.', action: 'Notice one moment today when you want to change how you feel. Just notice.', todo: null },
    refs: ['R28'] },
  { id: 'm1-l2', title: 'The signs', minutes: 4,
    moment: { cast: 'raj', text: 'Raj\'s sister sent him a list of "signs of addiction". He deleted it. Then he found himself reading it again at 2 am, ticking things in his head.' },
    cards: [
      { title: 'Five groups of signs', text: 'Tolerance (more for the same effect). Withdrawal (rough without it). Craving (hard to think about anything else). Control (breaking your own limits, failing to cut down). Consequences (work, money, relationships, health, the law), and using anyway.' },
      { title: 'Not a diagnosis', text: 'Ticking items on a list is information, not a label. Anything beyond tolerance and withdrawal usually means the substance is causing problems. Whether that is "addiction" is a question for a professional, if you want it answered.' },
      { title: 'What the list is for here', text: 'Your own ticks become some of your strongest reasons. The app can show them back to you when a craving says "it wasn\'t that bad".' },
    ],
    checks: [ { q: 'You ticked four items. What does the app conclude?', options: [
      { t: 'That you have an addiction', ok: false, why: 'It never concludes that. Only a professional can. The list is for your own understanding.' },
      { t: 'Nothing; it saves your answers for you to use later', ok: true, why: 'Right. Your ticks are yours. They can feed your Reasons Card if you choose.' } ] } ],
    tryIt: { exercise: 'signs-check' },
    wrap: { built: 'Your own signs, saved privately.', lives: 'Workbook → Know Myself → Signs.', action: 'If you ticked overdose, blackouts or heavy daily use, read Lesson 4 of this stop today.', todo: null },
    refs: ['R28'] },
  { id: 'm1-l3', title: 'Why me?', minutes: 4, sensitive: true,
    moment: { cast: 'kavita', text: 'Kavita\'s father drank. She swore she never would. For thirty years she didn\'t. Then her husband died, and the bottle her brother left behind after the funeral did not get thrown away.' },
    cards: [
      { title: 'Half of it is inherited', text: 'Genes account for roughly half of a person\'s vulnerability. That is not destiny; it is a loaded dice. Plenty of people with the genes never develop a problem, and some with none do.' },
      { title: 'Environment flips the switch', text: 'What tends to activate the risk: a chaotic or violent home, a parent or role model who used, friends who used in the teenage years, depression or anxiety, trauma, and starting young.' },
      { title: 'Not your fault. Your move.', text: 'Nobody chooses to become addicted. Understanding your risk is not about blame; it tells you which situations and feelings need the most care from here on. This list is private and hidden by default.' },
    ],
    checks: [ { q: 'You tick several risk factors. What does that mean?', options: [
      { t: 'You were more vulnerable than most, which helps explain how this happened', ok: true, why: 'Yes. More factors, more vulnerability. It explains; it does not excuse or condemn.' },
      { t: 'You cannot recover', ok: false, why: 'No. Risk factors shaped how you got here. They do not decide where you go.' } ] } ],
    tryIt: { exercise: 'risk-factors' },
    wrap: { built: 'A private understanding of why. Hidden behind a tap in the Workbook.', lives: 'Workbook → Know Myself → Risk factors (hidden).', action: 'If anything in that list stirred something painful, that is a good thing to tell a counsellor.', todo: null },
    refs: ['R28', 'R23'] },
  { id: 'm1-l4', title: 'Asking for help', minutes: 4,
    moment: { cast: 'dev', text: 'Dev stood outside the college counsellor\'s door for ten minutes rehearsing. In the end he said one sentence: "This is really hard to say, and I need help with pills." She said: "Thank you for telling me. Sit down."' },
    cards: [
      { title: 'Three parts of a help request', text: 'One: say that it is hard to say. That invites kindness. Two: state the concern briefly and directly; details can come when asked. Three: make a direct request: a referral, an appointment, confidentiality.' },
      { title: 'Confidentiality', text: 'Doctors and counsellors do not share what you tell them about substance use without your permission. The exceptions are a risk of serious harm to you or someone else, and abuse. Ask them to confirm it; they will.' },
      { title: 'Choosing a programme', text: 'If you look at treatment, ask: Is it evidence-based? Which therapies? Medication where it helps? What comes after? Three months or longer is common. The Resources screen has the full list of questions.' },
    ],
    checks: [ { q: 'The counsellor asks for details you are not ready to give. What now?', options: [
      { t: 'You have to tell everything or it will not work', ok: false, why: 'You set the pace. Brief and direct is enough to start; the rest can come when asked and when ready.' },
      { t: 'Say what you can, and make your request anyway', ok: true, why: 'Yes. The request is the point: "I need a referral", "I need this to stay between us".' } ] } ],
    tryIt: { exercise: 'help-request' },
    wrap: { built: 'A help request in your own words, ready to say or send.', lives: 'Workbook → My People → Scripts.', action: 'Decide who hears it first, and when.', todo: 'Say or send my help request' },
    refs: ['R28'] },
] },

{ id: 'm2', step: null, name: 'Your Brain Can Heal', harbor: 'The Lighthouse, ground floor', book: 2,
  blurb: 'What substances do to the brain, why that undermines choice, and how it heals. Short cards, quick checks.',
  unlocks: ['workbook', 'roadmapPlan', 'glossary'], lessons: [
  { id: 'm2-l1', title: 'The flood', minutes: 3,
    moment: { cast: 'dev', text: 'The first pill felt like the lights coming on. Dev remembers that feeling exactly. He does not remember the last fifty pills feeling like anything at all.' },
    cards: [
      { title: 'Dopamine', text: 'Food, music, a hug, a win: natural rewards release a brain messenger called dopamine, and the brain says "do that again". Alcohol and drugs release several times more than any natural reward, or stop it being cleared away. The brain says "do that again" very loudly.' },
      { title: 'Then the flat', text: 'With repeated floods the system turns itself down. The substance does less (tolerance), and so does everything else: food, friends, music. That flatness is a big part of why early recovery can feel joyless. It lifts, but not overnight.' },
      { title: 'Chasing the first time', text: 'Because the system is turned down, the first high can never be repeated. The chase is built into the chemistry; it is not a character flaw.' },
    ],
    checks: [
      { q: 'Why does ordinary life feel flat in early recovery?', options: [
        { t: 'Because life without the substance is boring', ok: false, why: 'It feels that way because the reward system was turned down by the floods. It recovers with time and with real activities.' },
        { t: 'Because the brain turned its reward system down after repeated floods', ok: true, why: 'Yes. The flatness is chemistry healing, not a verdict on your life.' } ] },
      { q: 'Can the first high be repeated?', options: [
        { t: 'Yes, with enough of it', ok: false, why: 'More only deepens the turn-down. The chase cannot be won.' },
        { t: 'No, the system that produced it has been turned down', ok: true, why: 'Right. Knowing this takes some of the power out of the memory.' } ] } ],
    tryIt: null,
    wrap: { built: 'A reason for the flatness that is not about you.', lives: 'Glossary: dopamine.', action: 'Do one ordinary pleasant thing today on purpose, even if it feels like 3 out of 10.', todo: null },
    refs: ['R28', 'R24'] },
  { id: 'm2-l2', title: 'Learned cues', minutes: 3,
    moment: { cast: 'meera', text: 'Meera does not even like the sound of the 9 pm news. But when the theme plays, her mouth waters. For two years, that tune meant the first glass.' },
    cards: [
      { title: 'Pavlov\'s bell, your version', text: 'A dog that hears a bell before every meal starts drooling at the bell. People, places, things, times and feelings that came before using become bells. The brain anticipates, and anticipation is felt as craving.' },
      { title: 'Cues are automatic', text: 'A cue can fire from a glimpse, a smell or a song, before you have thought anything. That is why willpower alone is unfair: it is asked to show up after the craving has already started.' },
      { title: 'You cannot erase the memory, you can learn a new response', text: 'Cue memories fade slowly; they do not delete. What changes fast is what you do next. Every time a cue fires and you respond differently, the link weakens a little and the new response strengthens.' },
    ],
    checks: [ { q: 'A craving hits the moment you walk into a particular shop. What is happening?', options: [
      { t: 'You are weak', ok: false, why: 'A conditioned cue fired. It is a reflex, like drooling at a bell, and it says nothing about your strength.' },
      { t: 'A learned cue is firing; the question is what you do next', ok: true, why: 'Yes. Leave, breathe, call: each is a new response that teaches the brain something.' } ] } ],
    tryIt: null,
    wrap: { built: 'A new way to read a sudden craving: cue, not character.', lives: 'Stop 3 (Self-Expert) turns this into your Trigger Profile.', action: 'Name one cue of yours out loud today.', todo: null },
    refs: ['R1'] },
  { id: 'm2-l3', title: 'Brakes and go mode', minutes: 3,
    moment: { cast: 'farhan', text: 'Farhan describes it like this: the accelerator worked fine. The brakes were gone. He knew exactly what would happen and his foot stayed down.' },
    cards: [
      { title: 'The brakes', text: 'The front of the brain plans, weighs and stops. Heavy use wears it down, so the stop signal gets weaker exactly when the go signal gets louder. Recovery is largely the brakes coming back online.' },
      { title: 'Stress', text: 'The stress system changes too. Stress feels bigger and lasts longer, and the brain has learned one fast fix for it. That is why stress sits near the top of most people\'s trigger lists.' },
      { title: 'Be smart, not strong', text: 'If the brakes are still healing, do not test them on a steep hill. Avoiding triggers is not weakness; it is good engineering. Later stops are full of ways to do that.' },
    ],
    checks: [ { q: '"If I were strong enough I could keep alcohol in the house." Which is the smarter reading?', options: [
      { t: 'Strength is the point; keep it and resist', ok: false, why: 'That tests healing brakes on a steep hill, every day. Be smart, not strong.' },
      { t: 'Remove it; the brakes are still healing and the cue would fire daily', ok: true, why: 'Yes. Make the easy choice the default and save the brakes for the moments you cannot avoid.' } ] } ],
    tryIt: null,
    wrap: { built: 'A rule you can use today: be smart, not strong.', lives: 'Step 2 has the Clear the Space quest.', action: 'Pick one thing in your surroundings that makes using easier, and plan to remove it.', todo: null },
    refs: ['R28', 'R21'] },
  { id: 'm2-l4', title: 'Treatment, medicines and healing', minutes: 4, clinicalReview: true,
    moment: { cast: 'farhan', text: 'Farhan\'s doctor put him on buprenorphine for the first year. His cousin called it "swapping one drug for another". His doctor called it the thing most likely to keep him alive. Farhan is here, so.' },
    cards: [
      { title: 'Three approaches', text: 'Cognitive behavioural therapy: understand the chain and learn new responses; the best-studied therapy for addiction. Motivational interviewing: resolve mixed feelings, in your own words. Mindfulness-based relapse prevention: be present and let discomfort pass without acting on it. This app teaches all three.' },
      { title: 'Medicines', text: 'Some medicines reduce craving, some block the high, some replace the drug safely. For opioids, medication is often the difference between relapse and recovery. They work alongside these skills, not instead of them. Always a conversation with a prescriber; this app only lists what exists.' },
      { title: 'Stopping safely', text: 'Stopping heavy daily drinking, or daily sleeping pills or benzodiazepines, suddenly can cause seizures. If that is you, see a doctor about a safe way down. Shaking, confusion, hallucinations or a fit after stopping are emergencies.' },
      { title: 'The brain heals', text: 'Imaging studies show reward-system function partly recovering after a year or so without the substance. Thinking gets clearer, impulses easier to resist, ordinary pleasures slowly return. The longer you stay off, the better the odds.' },
    ],
    checks: [
      { q: 'Medication for addiction is…', options: [
        { t: 'Cheating, or swapping one drug for another', ok: false, why: 'It is treatment. For opioids especially, it saves lives. Skills and medication work together.' },
        { t: 'A medical treatment that can work alongside these skills', ok: true, why: 'Yes. Talk to a prescriber about what fits you.' } ] },
      { q: 'You drink heavily every day and want to stop tomorrow. First step?', options: [
        { t: 'Just stop; willpower', ok: false, why: 'Sudden withdrawal from heavy daily drinking can be dangerous. See a doctor first about a safe way down.' },
        { t: 'Talk to a doctor about stopping safely', ok: true, why: 'Yes. A hospital detox unit or a doctor can make the first week safe.' } ] } ],
    tryIt: null,
    wrap: { built: 'You know what treatment is, what medicines do, and when stopping needs a doctor.', lives: 'Resources → Treatment and medicines.', action: 'If daily heavy use is you, book the doctor before anything else in this app.', todo: null },
    refs: ['R24', 'R23', 'R28'] },
] },

{ id: 'm3', step: 1, name: 'Find Your Why', harbor: 'The Compass Rose', book: 3,
  blurb: 'Where you are with change, both sides of the decision, and your reasons in your own words. Come back here whenever motivation dips.',
  unlocks: ['motivation', 'balance', 'weeklyReview'], lessons: [
  { id: 'm3-l1', title: 'Motivation moves', minutes: 4,
    moment: { cast: 'raj', text: 'Monday Raj was done with it, for good. Wednesday he could not remember why that had seemed so urgent. Friday his sister cried on the phone and it was Monday again.' },
    cards: [
      { title: 'It swings. That is normal.', text: 'Motivation to change anything rises and falls, day to day and hour to hour. The point is not to feel motivated all the time. It is to know where you are, and to have a way of moving one step up when you need to.' },
      { title: 'Five stages', text: 'Not looking to change. Thinking about it. Getting ready. Doing it. Keeping it going (six months or more). People move back and forth between them, at their own pace.' },
      { title: 'A slip does not send you back to the start', text: 'A slip caught early can keep you in "doing it". Where you are is decided by what you do next, not by one evening.' },
    ],
    checks: [ { q: 'You rate your motivation 4 out of 10 today. What does the app do with that?', options: [
      { t: 'Warns you that you are failing', ok: false, why: 'Never. A 4 is information. The app asks what would make it a 5.' },
      { t: 'Saves it, and asks what would move it up one point', ok: true, why: 'Yes. The "+1" question is the engine of this whole step.' } ] } ],
    tryIt: { exercise: 'motivation' },
    wrap: { built: 'Your first motivation reading. It becomes a line on a chart over time.', lives: 'Workbook → My Why → Motivation Meter.', action: 'Notice what moves the number during the week.', todo: null },
    refs: ['R9', 'R8'] },
  { id: 'm3-l2', title: 'Mixed feelings are normal', minutes: 3,
    moment: { cast: 'raj', text: '"It relaxes me. It is the only hour of the day that is mine." Raj is not wrong about that. He is also not telling the whole story, and part of him knows it.' },
    cards: [
      { title: 'It did something for you', text: 'Nobody keeps doing something that gives them nothing. Relief, fun, confidence, sleep, a way to be in a room: those memories are real, and the addicted brain uses them. Pretending they are not there makes them stronger.' },
      { title: 'Short-term, long-term', text: 'The immediate effect is often the exact opposite of the delayed one. It relaxes you now, and leaves you more anxious tomorrow. It lifts the mood now, and flattens the week. Thinking the delayed part through, before deciding, is what the rational brain does.' },
      { title: 'Two sides can both be true', text: 'You can want to stop and want to use in the same minute. Holding both honestly is not weakness; it is the starting line of real change.' },
    ],
    checks: [ { q: '"If I admit it helps me relax, I\'ll never quit." Is that right?', options: [
      { t: 'Yes, so deny the benefits', ok: false, why: 'Denied benefits do not disappear; they go underground and come back as cravings. Name them, then weigh them.' },
      { t: 'No; naming the benefit lets you weigh it honestly against its cost', ok: true, why: 'Yes. The next lesson puts all four sides on one page.' } ] } ],
    tryIt: null,
    wrap: { built: 'Permission to have mixed feelings, and a reason to write both sides down.', lives: 'The next lesson is where you write them.', action: 'Finish this sentence privately: "What it does for me is…"', todo: null },
    refs: ['R8'] },
  { id: 'm3-l3', title: 'Both sides of both choices', minutes: 5,
    moment: { cast: 'meera', text: 'Meera drew four boxes on the back of an envelope. The "what I\'ll miss" box took longest to fill, and she was surprised by how much lighter she felt once it was full.' },
    cards: [
      { title: 'Four boxes', text: 'The good things about continuing. The bad things about continuing. The good things about stopping. The things you will miss if you stop. Four honest lists, at least a few items each.' },
      { title: 'Why all four', text: 'Most people have only ever written two: why they should stop, and why they fail. The other two are where the addicted brain hides. Writing them down takes away its secret weapons.' },
      { title: 'Two boxes become your card', text: 'The drawbacks of continuing and the benefits of stopping become your Reasons Card: the first thing SOS shows, and something you can keep on your lock screen.' },
    ],
    checks: [ { q: 'Which two boxes make the Reasons Card?', options: [
      { t: 'What I\'ll miss, and the good things about continuing', ok: false, why: 'Those two are for understanding your pull. The card is built from the other two.' },
      { t: 'The drawbacks of continuing, and the benefits of stopping', ok: true, why: 'Yes. Your reasons, in your words, ready for the hard moment.' } ] } ],
    tryIt: { exercise: 'balance' },
    wrap: { built: 'Your Decisional Balance, and a fuller Reasons Card.', lives: 'Workbook → My Why → Decisional Balance and Reasons Card.', action: 'Read your Reasons Card once tonight before bed.', todo: null },
    refs: ['R8'] },
  { id: 'm3-l4', title: 'Four lenses', minutes: 5,
    moment: { cast: 'kavita', text: 'When the counsellor asked Kavita what she was worried would happen if nothing changed, she said "nothing" and then talked for eleven minutes.' },
    cards: [
      { title: 'Is it a problem?', text: 'What has it actually cost you, and what has it stopped you doing? Specific is better than general: not "my health", but "the mornings I could not drive the children".' },
      { title: 'What worries you?', text: 'If nothing changes, what happens in a year? In five? Say it plainly. Worry you have named is worry you can act on.' },
      { title: 'Why change, and how will life be different?', text: 'The reasons that are yours, not anyone else\'s. Then the picture: an ordinary Tuesday, a year from now, if this works.' },
      { title: 'Why do you believe you can?', text: 'Every hard thing you have done before counts. Believing you can succeed is one of the best predictors that you will.' },
    ],
    checks: [ { q: 'After writing through the four lenses, your motivation rating went up by one. The lesson says…', options: [
      { t: 'It should have gone up more', ok: false, why: 'Any rise is real progress. No change is fine too, if you were honest. The question is always "+1?"' },
      { t: 'Good. Keep asking what would move it one more', ok: true, why: 'Yes. Motivation is something you do, not something you wait for.' } ] } ],
    tryIt: { exercise: 'four-lenses' },
    wrap: { built: 'Your "my life will be different because…" line, added to your Reasons Card.', lives: 'Workbook → My Why.', action: 'Tell one person one reason.', todo: null },
    refs: ['R8', 'R11'] },
  { id: 'm3-l5', title: 'The +1 question', minutes: 3,
    moment: { cast: 'farhan', text: 'Seven months in, Farhan rates himself a steady 8. Then he asks what would make it a 9 and realises he has not been to a meeting in three weeks.' },
    cards: [
      { title: 'One point at a time', text: '"What would it take to move my motivation up one point?" Not to 10. Just one. The answer is usually small and specific: a conversation, a meeting, a cleared cupboard, a reason reread.' },
      { title: 'Motivation is a practice', text: 'You will come back to this step: after a slip, in a low week, in a boring one. The Motivation Meter keeps the history, so you can see what helped before.' },
      { title: 'Believing you can', text: 'Every skill you use, every log you save, is evidence. The app tracks it so the evidence is there on the days you cannot feel it.' },
    ],
    checks: [ { q: 'Motivation is 6. What is the best next question?', options: [
      { t: 'Why am I not at 10?', ok: false, why: 'That question produces shame, not movement.' },
      { t: 'What would make it a 7?', ok: true, why: 'Yes. Small, specific, doable today.' } ] } ],
    tryIt: { exercise: 'motivation' },
    wrap: { built: 'Step 1 complete. Your Compass Rose has a heading.', lives: 'Workbook → My Why. Revisit any time from Today.', action: 'Do the "+1" thing you just wrote down.', todo: 'My +1: do the thing I wrote in the Motivation Meter' },
    refs: ['R11', 'R10'] },
] }
);

if (typeof module !== 'undefined' && module.exports) module.exports = C_a;
