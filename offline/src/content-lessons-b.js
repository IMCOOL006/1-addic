/* 1-addic · CONTENT · lessons for modules M4–M6 (Set Yourself Up, Become a Self-Expert, Outsmart the Addicted Brain).
   Original wording throughout (docs/book/ notes gave the ideas, never the words). `refs` cite Content.references ids.
   `book` is metadata. Shape: BUILD-PLAN 3.6. */
const C_b = (typeof Content !== 'undefined') ? Content : require('./content-core.js');
C_b.modules = C_b.modules || [];

C_b.modules.push(
{ id: 'm4', step: 2, name: 'Set Yourself Up', harbor: 'The Pier', book: 4,
  blurb: 'Make your space, your week and your people work for your recovery. Be smart, not strong.',
  unlocks: ['network', 'scripts', 'quests'], lessons: [
  { id: 'm4-l1', title: 'Clear the space', minutes: 4,
    moment: { cast: 'meera', text: 'Meera has not had a drink in three weeks. There is still a bottle behind the rice tin, and she knows exactly where it is. Some evenings she thinks about it more than she wants to.' },
    cards: [
      { title: 'Smart, not strong', text: 'Willpower runs low at the end of a hard day. Instead of testing yourself, make the easy choice the safe one. That is being smart, not weak.' },
      { title: 'What counts as "stuff"', text: 'Bottles, pills, kit, hidden stashes, the cash set aside, the numbers of people who supply. Each one is a cue that can start a craving.' },
      { title: 'Doing it', text: 'Pick a day and go room by room, including your bag, phone and vehicle. Ask someone who does not use to help if you like. For old medicines, a chemist can tell you how to get rid of them safely.' },
    ],
    checks: [ { q: 'Why remove the bottle instead of keeping it "just to prove I can"?', options: [
      { t: 'Because every look at it is a small fight you do not need', ok: true, why: 'Yes. Fewer cues means fewer cravings, and more energy for everything else.' },
      { t: 'Because you are not strong enough', ok: false, why: 'Strength is not the point. Smart choices protect you on the days strength runs out.' } ] } ],
    tryIt: { exercise: 'clear-space' },
    wrap: { built: 'A plan to clear out what pulls at you.', lives: 'Workbook, and the Clear the Space quest in Actions.', action: 'Pick the day you will clear the space.', todo: 'Clear the space at home' },
    refs: ['R21', 'R1'] },
  { id: 'm4-l2', title: 'Small decisions add up', minutes: 5,
    moment: { cast: 'raj', text: 'Raj did not plan to smoke on Friday. He just took the short cut home, stopped for tea at the old stall, and his friends were there. By then it felt like it had already been decided.' },
    cards: [
      { title: 'Choices that look harmless', text: 'Many slips start with small choices that seem unrelated: a route home, who you sit with, keeping cash on you. Each one moves you a little closer to a risky spot.' },
      { title: 'Catch it early', text: 'The earlier you notice the chain, the easier it is to step off. At the start, it is a five-minute detour. At the end, it is a hard craving in a room full of people using.' },
      { title: 'A quick check', text: 'Ask: does this choice matter? List the options, even the boring ones. Weigh each, and pick the most protective one. If you still go, decide your exit and who you will call.' },
      { title: 'Practise in a story', text: 'The Big Game lets you walk a character through a day of small choices and see where each one leads.', link: { route: '#/games/big-game', label: 'Play The Big Game' } },
    ],
    checks: [ { q: 'Which is a small decision that could matter?', options: [
      { t: 'Walking home past the place where you used to buy', ok: true, why: 'Yes. It looks like just a route, but it puts you near a strong cue.' },
      { t: 'Choosing what to cook for dinner', ok: false, why: 'Most everyday choices are fine. The ones to check bring you closer to using.' } ] } ],
    tryIt: { exercise: 'should-i-go' },
    wrap: { built: 'A way to check a small choice before it carries you along.', lives: 'Tools, Should I go?', action: 'Use Should I go? once this week before a plan you are unsure about.', todo: null },
    refs: ['R1', 'R2'] },
  { id: 'm4-l3', title: 'Move your body', minutes: 4,
    moment: { cast: 'dev', text: 'Dev used pills to push through study nights. Now, at 4 pm, he feels flat and restless. His cousin keeps asking him to play badminton, and he keeps saying maybe.' },
    cards: [
      { title: 'Why it helps', text: 'Regular exercise is linked with less craving, better sleep and better mood. It also fills time that used to belong to using.' },
      { title: 'Start small', text: 'A brisk walk counts. So does dancing in the kitchen. Over time, aim for about two and a half hours of moderate activity a week, built up slowly.' },
      { title: 'Make it likely', text: 'Pick something you might enjoy, set a day and a time, and plan a small reward. Doing it with someone makes it more likely to happen. If you have a health condition, check with a doctor first.' },
    ],
    checks: [ { q: 'What is a good first exercise goal?', options: [
      { t: 'Twenty minutes of something you like, on a set day', ok: true, why: 'Yes. Small and specific is easier to start and keep.' },
      { t: 'Two hours at the gym every day from tomorrow', ok: false, why: 'Big plans often stall. Build up slowly.' } ] } ],
    tryIt: { exercise: 'exercise-plan' },
    wrap: { built: 'A first plan to move your body.', lives: 'Actions, the Try an Exercise quest.', action: 'Do your first session on the day you picked.', todo: 'Try my first exercise session' },
    refs: ['R25', 'R27'] },
  { id: 'm4-l4', title: 'Your crew', minutes: 5,
    moment: { cast: 'farhan', text: 'Farhan\'s phone has two kinds of numbers in it. Some belong to people who ask how he is doing. Some belong to people who used to sell him pills. Seven months in, he is still sorting them.' },
    cards: [
      { title: 'Safety Nets', text: 'A Safety Net is someone who supports your recovery: they do not use around you, they listen, and they are there when it counts. Two or three is a strong start.' },
      { title: 'Risky people', text: 'Some people make using more likely, even if you care about them. You can keep your distance, meet only in safe places, or tell them plainly what you need.' },
      { title: 'Groups count too', text: 'Mutual-help groups such as AA, NA or SMART Recovery give you people who understand. Many find that going regularly helps them stay on track.' },
      { title: 'Keep them close', text: 'Add your Safety Nets in Workbook, My People. Then Call someone in SOS has someone to call.', link: { route: '#/workbook/network', label: 'Open My People' } },
    ],
    checks: [ { q: 'Which person sounds most like a Safety Net?', options: [
      { t: 'A cousin who does not drink and picks up when you call', ok: true, why: 'Yes. Someone sober, reliable and willing to listen.' },
      { t: 'A friend who is fun but always brings a bottle', ok: false, why: 'You can still care about them. They are just not who you lean on in a craving.' } ] } ],
    tryIt: { exercise: 'network-review' },
    wrap: { built: 'A picture of who supports you, and who to keep at a distance.', lives: 'Workbook, Support Network.', action: 'Add at least one Safety Net to My People.', todo: 'Add a Safety Net in My People' },
    refs: ['R22', 'R18'] },
  { id: 'm4-l5', title: 'Say it straight', minutes: 4,
    moment: { cast: 'kavita', text: 'Kavita\'s son brings beer when he visits and leaves the rest in her fridge. She has not said anything. She does not want a fight, so she says nothing and feels worse.' },
    cards: [
      { title: 'Three ways to say it', text: 'Passive means staying quiet and stewing. Aggressive means attacking. Assertive means saying clearly what you feel and need, while respecting the other person.' },
      { title: 'A simple script', text: '"I feel [a feeling] when [what happens]. I need [what you ask for]." It is about you, not about blaming them, so it is easier to hear.' },
      { title: 'Saying it well', text: 'Pick a calm moment. Keep your voice steady and look at them. Short is fine. You do not owe a long reason.' },
    ],
    checks: [ { q: 'Which line is assertive?', options: [
      { t: '"I feel uneasy when there is alcohol at home. I need you to keep it out for now."', ok: true, why: 'Yes. A feeling, a situation and a clear ask, with no attack.' },
      { t: '"You never think about anyone but yourself."', ok: false, why: 'That is an attack. It usually starts an argument, not a change.' },
      { t: 'Saying nothing and hiding the bottles', ok: false, why: 'That is passive. The problem stays, and so does the stress.' } ] } ],
    tryIt: { exercise: 'assertive-script' },
    wrap: { built: 'A script for a conversation that matters.', lives: 'Workbook, Scripts.', action: 'Say your script out loud once before the real talk.', todo: null },
    refs: ['R2', 'R5'] },
  { id: 'm4-l6', title: 'Saying no, and growing your crew', minutes: 5,
    moment: { cast: 'dev', text: 'At a friend\'s birthday, someone offers Dev a pill "to keep the party going". He says no, and they ask again. And again.' },
    cards: [
      { title: 'A clear no', text: 'A short "No, thanks", with eye contact, works better than a long excuse. If they keep offering, ask them to stop, or leave.' },
      { title: 'Have a plan ready', text: 'Ask for something else to drink, suggest a different plan, or change the subject. Remind yourself why your recovery matters to you.' },
      { title: 'Practise first', text: 'Saying no is easier when you have said it before, even in practice.', link: { route: '#/games/refusal', label: 'Practise in Refusal Rehearsal' } },
      { title: 'New people, new places', text: 'Recovery often means spending less time with people who use. Look for new places to meet people: a club, a class, a group, volunteering. Get back in touch with people you lost along the way.' },
    ],
    checks: [ { q: 'Someone offers twice after you say no. What now?', options: [
      { t: 'Ask them to stop offering, and leave if it continues', ok: true, why: 'Yes. You can protect your recovery without a long explanation.' },
      { t: 'Take it so the evening is not awkward', ok: false, why: 'An awkward minute passes. Your recovery is worth more.' } ] } ],
    tryIt: { exercise: 'expand-network' },
    wrap: { built: 'Ready words for saying no, and a plan to grow your crew.', lives: 'Workbook, Scripts and Support Network; Actions, the Build Your Crew quest.', action: 'Take your first small step to meet someone new this week.', todo: 'Take one step to grow my crew' },
    refs: ['R1', 'R22'] },
] },

{ id: 'm5', step: 3, name: 'Become a Self-Expert', harbor: 'The Weather Station', book: 5, milestone: 'self-expert',
  blurb: 'Learn your own patterns: what sets off a craving, the thoughts that push you, and how a craving feels in you.',
  unlocks: ['triggers', 'redFlags', 'insights'], lessons: [
  { id: 'm5-l1', title: 'The chain', minutes: 4,
    moment: { cast: 'raj', text: 'Raj thinks his evening smoke just happens. When he looks closer, there is a pattern: work ends, he is bored, he thinks "I deserve it", and then the craving is loud.' },
    cards: [
      { title: 'Links in a chain', text: 'A slip rarely comes out of nowhere. Usually there is a trigger, then a thought, then a craving, then a choice. Each link is a place to step in.' },
      { title: 'Triggers', text: 'A trigger is anything that sets the chain going: a feeling, a person, a place, a time of day, an object. Some are easy to spot, some are sneaky.' },
      { title: 'Know your own', text: 'Everyone\'s chain is a bit different. The more you know your own, the earlier you can step in. Logging cravings is how you learn it.' },
    ],
    checks: [ { q: 'Where can you step into the chain?', options: [
      { t: 'At any link: the trigger, the thought, the craving or the choice', ok: true, why: 'Yes. Earlier is easier, but every link is a chance.' },
      { t: 'Only before the trigger happens', ok: false, why: 'You cannot avoid every trigger. You can still step in later in the chain.' } ] } ],
    tryIt: { route: '#/track/log/craving', label: 'Log a craving, even a small one' },
    wrap: { built: 'A way to see a craving as a chain you can break.', lives: 'Track, the craving log.', action: 'Log your next craving, however small.', todo: null },
    refs: ['R1', 'R3'] },
  { id: 'm5-l2', title: 'Your triggers', minutes: 5,
    moment: { cast: 'meera', text: 'For Meera, the empty flat after nine is the strongest trigger. But a good day can do it too: a compliment at work, and she wants to celebrate.' },
    cards: [
      { title: 'Inside and outside', text: 'Internal triggers are feelings and states: stress, boredom, loneliness, even happiness. External triggers are people, places, situations and things.' },
      { title: 'The frequent ones', text: 'A few triggers usually do most of the work. Mark the ones that come up most often. They show first when you log a craving.' },
      { title: 'Then plan for them', text: 'Some triggers you can avoid. Others, like stress, you cannot, so you plan a response. Later steps give you the tools.' },
    ],
    checks: [ { q: 'Can a happy feeling be a trigger?', options: [
      { t: 'Yes, celebration and excitement can trigger cravings', ok: true, why: 'Yes. Many people used to celebrate, so good news can set off the chain too.' },
      { t: 'No, only bad feelings are triggers', ok: false, why: 'Any feeling that was linked with using can become a trigger.' } ] } ],
    tryIt: { exercise: 'triggers' },
    wrap: { built: 'Your Trigger Profile.', lives: 'Workbook, Trigger Profile, and as chips in every log.', action: 'Notice one trigger this week as it happens.', todo: null },
    refs: ['R1', 'R2'] },
  { id: 'm5-l3', title: 'Red-flag thoughts', minutes: 4,
    moment: { cast: 'farhan', text: 'Farhan\'s back aches after a long shift. A thought arrives, quiet and reasonable: "It\'s medical, so it doesn\'t count." He recognises it.' },
    cards: [
      { title: 'Thoughts that sound like decisions', text: 'Red-flag thoughts give you permission to use: "just one", "nobody has to know", "I deserve it". They feel true in the moment.' },
      { title: 'Name it', text: 'Calling it a red flag puts a little space between you and the thought. You do not have to argue yet. Just notice: "That is a red flag."' },
      { title: 'Make a list', text: 'Write down your own red-flag thoughts, in your own words. Step 4 shows you how to answer each one.' },
    ],
    checks: [ { q: '"I\'ve been good all week, I\'ve earned it." What is this?', options: [
      { t: 'A red-flag thought giving permission', ok: true, why: 'Yes. It frames using as a reward. Noticing that is the skill.' },
      { t: 'A fair reward for hard work', ok: false, why: 'Rewards are good. This one leads back to using. Pick a different reward.' } ] } ],
    tryIt: { exercise: 'red-flags' },
    wrap: { built: 'Your list of red-flag thoughts.', lives: 'Workbook, Red Flags and Comebacks.', action: 'When a red flag shows up, say "red flag" to yourself.', todo: null },
    refs: ['R7', 'R1'] },
  { id: 'm5-l4', title: 'Six thinking traps', minutes: 6,
    moment: { cast: 'kavita', text: 'One customer complains about a late tiffin. By evening, Kavita has decided the whole business is failing and she is useless at it. Her mood drops, and the old pull comes back.' },
    cards: [
      { title: 'Common traps', text: 'Everyone falls into thinking traps. Six common ones: black-or-white thinking, discounting the good, jumping to conclusions, treating feelings as facts, blaming yourself for everything, and labelling yourself.' },
      { title: 'Why they matter here', text: 'Traps make things look worse than they are. When things look hopeless, using can start to seem like the only relief.' },
      { title: 'Spot and reword', text: 'Name the trap, then say it more fairly: "One order went wrong; forty went right." It does not have to be cheerful, just accurate.' },
      { title: 'Practise sorting', text: 'Distortion Sort gives you thoughts to sort into the six traps.', link: { route: '#/games/distortion-sort', label: 'Play Distortion Sort' } },
    ],
    checks: [
      { q: '"He didn\'t reply. He must be angry with me." Which trap?', options: [
        { t: 'Jumping to conclusions', ok: true, why: 'Yes. It guesses what he thinks without evidence.' },
        { t: 'Discounting the good', ok: false, why: 'That trap ignores good things. This one guesses at someone\'s mind.' } ] },
      { q: 'What is a fairer version of "I always mess things up"?', options: [
        { t: '"I messed this one up. I have done other things well."', ok: true, why: 'Yes. It is accurate, not just positive.' },
        { t: '"I never make mistakes."', ok: false, why: 'That swaps one extreme for another. Aim for accurate.' } ] } ],
    tryIt: { exercise: 'trap-pairs' },
    wrap: { built: 'A few of your own thoughts, each with its trap and a fairer version.', lives: 'Workbook, Thought journal.', action: 'Catch one thinking trap this week and reword it.', todo: null },
    refs: ['R7', 'R5'] },
  { id: 'm5-l5', title: 'The spiral', minutes: 4, clinicalReview: true,
    moment: { cast: 'farhan', text: 'Farhan has wondered what would happen if he slipped. He thinks the worst part would be the voice saying it was all for nothing.' },
    cards: [
      { title: 'A slip is not a fall', text: 'A slip is one use. What happens next depends a lot on the thoughts that follow. "I\'ve blown it, so I might as well keep going" can turn one slip into many.' },
      { title: 'Answer them now', text: 'Write your answers to these thoughts while you are calm. If a slip ever happens, your own words are ready.' },
      { title: 'Nothing is lost', text: 'In this app a slip wipes nothing. Total days, skills and everything you built stay. If you are ever unsafe, Urgent help in SOS is one tap away.', link: { route: '#/sos/urgent', label: 'Urgent help' } },
    ],
    checks: [ { q: 'After a slip, which thought helps most?', options: [
      { t: '"This is one slip. I can stop here and call someone."', ok: true, why: 'Yes. It keeps one slip from becoming more.' },
      { t: '"I\'ve ruined everything, so it doesn\'t matter now."', ok: false, why: 'That is the spiral talking. Everything you built is still there.' } ] } ],
    tryIt: { exercise: 'spiral' },
    wrap: { built: 'Your answers to spiral thoughts, ready if you need them.', lives: 'SOS, I slipped.', action: 'Read your answers once more this week.', todo: null },
    refs: ['R4', 'R23'] },
  { id: 'm5-l6', title: 'Your craving signature, and the logbook', minutes: 5,
    moment: { cast: 'dev', text: 'Dev never thought of cravings as something in his body. Then he noticed: before an exam his legs get restless and his heart speeds up, long before he thinks of pills.' },
    cards: [
      { title: 'How a craving shows up', text: 'Cravings show up in the body, in feelings and in thoughts. Your mix is your craving signature. Knowing it helps you spot a craving early.' },
      { title: 'Cravings pass', text: 'A craving usually rises, peaks and fades, often within about fifteen minutes. Spotting it early gives you time to reach for a tool.' },
      { title: 'The logbook', text: 'A quick log after each craving notes the time, the place, the trigger and how strong it was. After a week or two, your Insights start to show patterns.', link: { route: '#/track/log/craving', label: 'Open the craving log' } },
    ],
    checks: [ { q: 'Why log cravings that you got through?', options: [
      { t: 'They show your patterns, and that you can ride them out', ok: true, why: 'Yes. Every log adds to what you know about yourself.' },
      { t: 'They do not count, so there is no need', ok: false, why: 'Cravings you got through are some of the most useful logs.' } ] } ],
    tryIt: { exercise: 'craving-signature' },
    wrap: { built: 'Your craving signature.', lives: 'Workbook, Craving Signature; Track, Insights.', action: 'Log every craving for one week.', todo: 'Log my cravings for a week' },
    refs: ['R1', 'R12'] },
] },

{ id: 'm6', step: 4, name: 'Outsmart the Addicted Brain', harbor: 'The Lighthouse', book: 6, milestone: 'strategist',
  blurb: 'Answer red-flag thoughts, ride out cravings, and plan your days so the risky hours are covered.',
  unlocks: ['planner', 'battlePlans', 'talkBack'], lessons: [
  { id: 'm6-l1', title: 'Put it on trial', minutes: 6,
    moment: { cast: 'meera', text: 'It is Friday evening. "Just one glass won\'t hurt," says the thought. This time Meera does not argue in her head. She opens the app and writes it down.' },
    cards: [
      { title: 'A thought is not a fact', text: 'A red-flag thought is a claim. Like any claim, you can check the evidence. Putting it on trial means looking at it calmly instead of obeying it.' },
      { title: 'The questions', text: 'What is the evidence for it? What is the evidence against it? Does it fall into a thinking trap? And then what happens next?' },
      { title: 'Your closing statement', text: 'End with a short answer you can remember. That is your Comeback. SOS shows your Comebacks when you tap Talk back.' },
    ],
    checks: [ { q: 'What makes a good comeback?', options: [
      { t: 'Short, true for you, and easy to remember', ok: true, why: 'Yes. In a craving, short words are the ones you can reach.' },
      { t: 'A long argument that covers every point', ok: false, why: 'Long arguments are hard to recall in a hard moment. Keep the short version.' } ] } ],
    tryIt: { exercise: 'trial' },
    wrap: { built: 'Your first Comeback.', lives: 'Workbook, Red Flags and Comebacks; SOS, Talk back.', action: 'Put your loudest red flag on trial this week.', todo: null },
    refs: ['R7', 'R6'] },
  { id: 'm6-l2', title: 'True, but not the whole truth', minutes: 4,
    moment: { cast: 'raj', text: '"Smoking helps me relax after work." Raj has to admit it is partly true. For an hour or so, it does.' },
    cards: [
      { title: 'A grain of truth', text: 'Some red-flag thoughts are partly true, which makes them hard to answer. Using may help you relax, sleep or feel social, for a short while.' },
      { title: 'The rest of the story', text: 'Ask "and then what?" Play the story forward: the next morning, the next week, the next year. The short-term truth leaves out the cost.' },
      { title: 'Another way to the same need', text: 'If a thought points to a real need, like rest or company, look for another way to meet it. That makes the comeback stronger.' },
    ],
    checks: [ { q: '"It helps me sleep." What is a good answer?', options: [
      { t: '"It helps tonight, and I wake up worse. Let me try a different wind-down."', ok: true, why: 'Yes. It admits the grain of truth and tells the rest of the story.' },
      { t: '"That is a lie."', ok: false, why: 'Denying the grain of truth makes the answer easy to dismiss.' } ] } ],
    tryIt: { route: '#/tools/trial?mode=redflag', label: 'Put a half-true thought on trial' },
    wrap: { built: 'A way to answer thoughts that are partly true.', lives: 'Tools, Put it on trial.', action: 'Ask "and then what?" the next time a red flag shows up.', todo: null },
    refs: ['R7', 'R5'] },
  { id: 'm6-l3', title: 'Thinking skills and doing skills', minutes: 4,
    moment: { cast: 'kavita', text: 'Some evenings Kavita can talk herself out of a craving. Other evenings words do not help, and she just has to get up and do something.' },
    cards: [
      { title: 'Two kinds of tools', text: 'Thinking skills change how you see a thought: putting it on trial, spotting a trap. Doing skills change what you do: leaving, calling someone, going for a walk.' },
      { title: 'Both work', text: 'When a craving is mild, a thinking skill may be enough. When it is strong, a doing skill often works faster. Most people use a mix.' },
      { title: 'Know your mix', text: 'Notice which skills have helped you so far. You will use this when you build your plan.' },
    ],
    checks: [ { q: 'A craving is very strong right now. What tends to work fastest?', options: [
      { t: 'A doing skill: leave, call, move', ok: true, why: 'Yes. Action gives the craving time to pass.' },
      { t: 'Arguing with it until you win', ok: false, why: 'A long argument can keep you in the craving. Act first, think later.' } ] } ],
    tryIt: { exercise: 'cog-vs-beh' },
    wrap: { built: 'A note of the skills that work for you.', lives: 'Workbook, and later My Recovery Plan.', action: 'Try one doing skill the next time a craving is strong.', todo: null },
    refs: ['R5', 'R2'] },
  { id: 'm6-l4', title: 'Surf, distract, delay', minutes: 5,
    moment: { cast: 'dev', text: 'It is 11 pm and Dev wants a pill to keep studying. He sets a timer for fifteen minutes and tells himself he will decide after that.' },
    cards: [
      { title: 'Ride the wave', text: 'Picture the craving as a wave. You do not have to fight it or obey it. Breathe, notice it rise and peak, and let it pass.', link: { route: '#/practice/urge-surf', label: 'Try urge surfing' } },
      { title: 'Distract', text: 'Do something that takes your mind and hands: walk fast, call someone, cook, clean a drawer. Have a list ready so you do not have to think.' },
      { title: 'Delay', text: 'Tell yourself you will wait fifteen minutes before deciding anything. By then, the craving has often eased.' },
    ],
    checks: [ { q: 'What does delay mean?', options: [
      { t: 'Wait fifteen minutes before deciding anything', ok: true, why: 'Yes. Time is on your side. Most cravings ease if you wait.' },
      { t: 'Promise yourself you can use later', ok: false, why: 'Delay is not a promise. It is time for the wave to pass.' } ] } ],
    tryIt: { exercise: 'distractions' },
    wrap: { built: 'Your own distraction list.', lives: 'SOS, Distract me.', action: 'Use one of the three next time a craving hits.', todo: null },
    refs: ['R12', 'R1'] },
  { id: 'm6-l5', title: 'Plan the day', minutes: 4,
    moment: { cast: 'meera', text: 'Meera\'s hardest hours are 9 pm to midnight, when her husband is at work. When she leaves them empty, the bottle fills them.' },
    cards: [
      { title: 'Empty time is risky', text: 'Long stretches with nothing planned leave room for cravings. A simple plan for the day covers those gaps.' },
      { title: 'Mark the risky hours', text: 'Look at when cravings usually hit. Put something in those hours: a call, a walk, a class, a meal with someone.' },
      { title: 'Keep it loose', text: 'A plan is a guide, not a test. If the day changes, change the plan. The planner shows the gaps for you.' },
    ],
    checks: [ { q: 'Why plan your evenings?', options: [
      { t: 'Covered time leaves less room for cravings', ok: true, why: 'Yes. A plan fills the risky hours before a craving does.' },
      { t: 'To prove you are busy', ok: false, why: 'Busy is not the goal. Covered risky hours are.' } ] } ],
    tryIt: { route: '#/actions/planner', label: 'Plan tomorrow in the planner' },
    wrap: { built: 'A planned day, with the risky hours covered.', lives: 'Actions, Planner.', action: 'Plan tomorrow evening tonight.', todo: 'Plan tomorrow in the planner' },
    refs: ['R1', 'R21'] },
  { id: 'm6-l6', title: 'Battle Plans', minutes: 5,
    moment: { cast: 'farhan', text: 'Farhan\'s cousin is getting married next month. There will be drinking, and the old crowd from the site will be there. He has four weeks to get ready.' },
    cards: [
      { title: 'Plan in calm weather', text: 'When you can see a risky situation coming, make a plan while you are calm. In the moment, a ready plan is easier than thinking on your feet.' },
      { title: 'A plan and two backups', text: 'Write your main plan, then two backups in case it does not work. For example: stay with my brother; if he leaves, call my sponsor; if that fails, go home by ten.' },
      { title: 'Look back after', text: 'After the event, take a minute to note what happened and what worked. That counts whatever the outcome, and makes the next plan better.' },
    ],
    checks: [ { q: 'Why two backups?', options: [
      { t: 'Plans can fail, and a backup keeps you covered', ok: true, why: 'Yes. If one plan falls through, you already know your next step.' },
      { t: 'In case the first plan was wrong', ok: false, why: 'The first plan can be a good one and still not work out. Backups are just cover.' } ] } ],
    tryIt: { route: '#/actions/battle?new=1', label: 'Make your first Battle Plan' },
    wrap: { built: 'Your first Battle Plan.', lives: 'Actions, Battle Plans.', action: 'Make a Battle Plan for the next risky event on your calendar.', todo: 'Make a Battle Plan' },
    refs: ['R2', 'R3'] },
] }
);

if (typeof module !== 'undefined' && module.exports) module.exports = C_b;
