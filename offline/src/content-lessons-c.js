/* 1-addic · CONTENT · lessons for modules M7–M10 (Be Present, Rediscover Joy, Handle Hard Feelings, Your Recovery Plan).
   Original wording throughout (docs/book/ notes gave the ideas, never the words). `refs` cite Content.references ids.
   `book` is metadata. Shape: BUILD-PLAN 3.6. M9 and M10 touch feelings, anger, slips and warning signs: every such
   lesson carries clinicalReview: true, and slip or crisis lines stay short and point to #/sos/urgent. */
const C_c = (typeof Content !== 'undefined') ? Content : require('./content-core.js');
C_c.modules = C_c.modules || [];

C_c.modules.push(
{ id: 'm7', step: 5, name: 'Be Present', harbor: 'The Cove', book: 7, milestone: 'navigator',
  blurb: 'Notice what is happening right now, without judging it. Then choose what you do next.',
  unlocks: ['practices', 'training'], lessons: [
  { id: 'm7-l1', title: 'What mindfulness is', minutes: 4,
    moment: { cast: 'kavita', text: 'Kavita has been told to "just relax" more times than she can count. It never works. When her neighbour says mindfulness helped her, Kavita rolls her eyes, then asks what it actually is.' },
    cards: [
      { title: 'Paying attention, on purpose', text: 'Mindfulness means noticing what is happening right now, on purpose, without judging it. Your breath, your body, the sounds around you, your thoughts. You just notice.' },
      { title: 'Not a relaxation trick', text: 'The goal is not to feel calm. Sometimes you will, sometimes you will feel restless or bored. Whatever comes up is fine to notice.' },
      { title: 'Why it helps recovery', text: 'Stress is one of the biggest reasons people return to using. Noticing a craving or a hard feeling early gives you a gap, and in that gap you can choose.' },
    ],
    checks: [ { q: 'Your mind wanders ten times in five minutes. What does that mean?', options: [
      { t: 'You noticed ten times, and each time you came back', ok: true, why: 'Yes. Noticing that your mind wandered is the practice. Every return counts.' },
      { t: 'You are bad at mindfulness', ok: false, why: 'Everyone\'s mind wanders. There is no right or wrong way to do this.' } ] } ],
    tryIt: { route: '#/practice/breathe', label: 'Try five quiet minutes' },
    wrap: { built: 'A first taste of paying attention on purpose.', lives: 'Actions, Practices.', action: 'Sit for five minutes today and just notice your breath.', todo: 'Try five minutes of breathing' },
    refs: ['R14', 'R12'] },
  { id: 'm7-l2', title: 'Autopilot', minutes: 4,
    moment: { cast: 'raj', text: 'Raj cannot remember the drive home from work. He was thinking about a fight with his supervisor the whole way. He only noticed where he was when he was already outside the old tea stall.' },
    cards: [
      { title: 'Doing without noticing', text: 'Most of us brush our teeth, shower and travel on autopilot, with our minds somewhere else. That is normal. The trouble is that using can run on autopilot too.' },
      { title: 'Autopilot and cravings', text: 'A habit can carry you from a trigger to using before you have made a choice. Waking up to the moment lets you see the choice while it is still yours.' },
      { title: 'Practise on small things', text: 'Pick one daily task: a shower, a meal or a short walk. Do it slowly and notice what you see, hear, smell and feel. That is training for the harder moments.' },
    ],
    checks: [ { q: 'Why practise on a shower or a meal?', options: [
      { t: 'Easy moments build the skill for hard ones', ok: true, why: 'Yes. The more you practise when it is calm, the easier it is to notice in a craving.' },
      { t: 'Because showers are a trigger', ok: false, why: 'They usually are not. They are just a simple, daily place to practise.' } ] } ],
    tryIt: { exercise: 'everyday-mindful' },
    wrap: { built: 'One everyday task done with your full attention.', lives: 'Actions, Practices, and your Workbook notes.', action: 'Choose one daily task to do mindfully this week.', todo: 'Do one everyday task mindfully' },
    refs: ['R14', 'R13'] },
  { id: 'm7-l3', title: 'The body scan', minutes: 5,
    moment: { cast: 'farhan', text: 'Farhan\'s back still aches some days. He used to take a pill the moment he felt it. His counsellor suggested he try noticing his body first, slowly, from his feet up.' },
    cards: [
      { title: 'From feet to head', text: 'In a body scan, you move your attention slowly through your body. You notice each part: warm or cool, tight or loose, comfortable or not. You do not need to change anything.' },
      { title: 'About ten minutes', text: 'Sit or lie somewhere quiet. The guided scan reads aloud, part by part, with pauses. If your mind drifts, gently bring it back to the part you were on.' },
      { title: 'Uncomfortable is allowed', text: 'You may notice an ache or a tense spot. Just notice it. If something is too much, open your eyes and stop. You can try again another day.' },
    ],
    checks: [ { q: 'During the scan you notice a tight jaw. What do you do?', options: [
      { t: 'Notice it, then move on to the next part', ok: true, why: 'Yes. The scan is about noticing, not fixing.' },
      { t: 'Stop the scan because you are doing it wrong', ok: false, why: 'Noticing tension is the scan working. There is nothing wrong to fix.' } ] } ],
    tryIt: { exercise: 'body-scan' },
    wrap: { built: 'Your first body scan, and a note of what you noticed.', lives: 'Actions, Practices, Body scan.', action: 'Do the body scan once more this week.', todo: 'Do the body scan' },
    refs: ['R12', 'R14'] },
  { id: 'm7-l4', title: 'Breathing with awareness', minutes: 4,
    moment: { cast: 'dev', text: 'Dev\'s mind races before every test. He used to reach for a pill to feel focused. This time he sits on his bed and just watches his breath for five minutes.' },
    cards: [
      { title: 'Just watch it', text: 'Breathe the way you normally do. Notice the air coming in, your chest or belly rising and falling, the air going out. You do not need to breathe in any special way.' },
      { title: 'Start small, build up', text: 'Begin with five minutes. When that feels easy, try ten, then fifteen. Some people build up to thirty, but five is a real practice.' },
      { title: 'An anchor you carry', text: 'Your breath is always with you. When a craving or a hard feeling hits, it is a place to come back to.' },
    ],
    checks: [ { q: 'How should you breathe during this practice?', options: [
      { t: 'Normally, and just notice it', ok: true, why: 'Yes. The practice is watching your breath, not controlling it.' },
      { t: 'As slowly and deeply as you can', ok: false, why: 'There is no special way to breathe here. Just notice the breath you have.' } ] } ],
    tryIt: { exercise: 'breathing' },
    wrap: { built: 'A breathing practice you can grow from five minutes.', lives: 'Actions, Practices, Breathing.', action: 'Breathe with awareness for five minutes on three days this week.', todo: 'Practise breathing for five minutes' },
    refs: ['R12', 'R13'] },
  { id: 'm7-l5', title: 'SOBER breathing', minutes: 5,
    moment: { cast: 'meera', text: 'It is 9:30 pm and the flat is quiet. Meera feels the pull toward the kitchen. She remembers a short skill she can do in two minutes, right where she is.' },
    cards: [
      { title: 'Five steps, two minutes', text: 'Stop what you are doing. Observe what is happening in your body and mind. Breathe, with your attention on the breath. Expand that attention to your whole body, then Respond with care: choose what helps.' },
      { title: 'A go-to skill', text: 'SOBER works in the moment, anywhere. It is in SOS, so it is always one tap away.', link: { route: '#/sos/craving', label: 'See SOBER in SOS' } },
      { title: 'Practise before you need it', text: 'Try it first when calm, then with an imagined craving, then in a mildly stressful moment. Each round makes it easier to reach for when it counts.' },
    ],
    checks: [ { q: 'What does the R in SOBER mean?', options: [
      { t: 'Respond with care, choosing what helps', ok: true, why: 'Yes. After you stop and notice, you choose your next step instead of reacting.' },
      { t: 'Relax completely', ok: false, why: 'You do not have to feel relaxed. You only need to choose your response.' } ] } ],
    tryIt: { exercise: 'sober-practice' },
    wrap: { built: 'SOBER breathing, practised once.', lives: 'SOS, and Actions, Practices, SOBER.', action: 'Practise SOBER once a day this week, starting when calm.', todo: 'Practise SOBER breathing' },
    refs: ['R12', 'R13'] },
  { id: 'm7-l6', title: 'Acceptance and kindness', minutes: 4,
    moment: { cast: 'kavita', text: 'On her husband\'s birthday, Kavita wakes up heavy with grief. Part of her wants to push the feeling away any way she can. Instead she sits with her tea and lets herself feel sad for a while.' },
    cards: [
      { title: 'Let it be there', text: 'The addicted brain says: get rid of this feeling now. Acceptance says: this is how things are right now, and it will change. A feeling you allow often passes faster than one you fight.' },
      { title: 'Ride the wave', text: 'A craving rises, peaks and falls, like a wave. Urge surfing means watching it rise and fall without acting on it.', link: { route: '#/practice/urge-surf', label: 'Try urge surfing' } },
      { title: 'Be kind to yourself', text: 'Talk to yourself the way you would talk to a friend who is struggling. Kindness is not letting yourself off. It is what helps people keep going.' },
    ],
    checks: [ { q: 'A strong craving arrives. What does acceptance look like?', options: [
      { t: 'Noticing it, letting it rise and fall, without acting on it', ok: true, why: 'Yes. You allow the craving to be there, and you still choose what you do.' },
      { t: 'Giving in, because you accept it', ok: false, why: 'Accepting a feeling is not obeying it. You let it be there and let it pass.' } ] } ],
    tryIt: { route: '#/practice/urge-surf', label: 'Try urge surfing' },
    wrap: { built: 'A way to let a feeling or craving pass without obeying it.', lives: 'Actions, Practices, Urge surfing.', action: 'Next time a craving comes, try riding it for ten minutes.', todo: null },
    refs: ['R12', 'R1', 'R14'] },
] },

{ id: 'm8', step: 6, name: 'Rediscover Joy', harbor: 'The Garden', book: 8,
  blurb: 'Fill your days with things you enjoy that do not pull you back. Joy is part of recovery, not a reward for later.',
  unlocks: ['activities', 'rewards', 'predictions'], lessons: [
  { id: 'm8-l1', title: 'Rewards and recovery', minutes: 4,
    moment: { cast: 'raj', text: 'Raj used to play cricket every Sunday. Over the years, smoking slowly took the place of the game, the friends and the jokes after. Now his Sundays feel empty, and he is not sure what he even likes any more.' },
    cards: [
      { title: 'What got crowded out', text: 'Using takes time, money and energy. Bit by bit, it pushes out the things that used to make life good. Getting those back is a big part of staying well.' },
      { title: 'Flat at first is normal', text: 'In early recovery, many people feel that nothing is fun. The brain is healing, and that takes time. Doing enjoyable things anyway helps the feeling come back.' },
      { title: 'More choices, more strength', text: 'People with many drug-free sources of enjoyment find it easier to stay stopped. Every new one you find is a reason to keep going.' },
    ],
    checks: [ { q: 'Nothing feels fun in your first month. What helps?', options: [
      { t: 'Doing enjoyable things anyway, and giving it time', ok: true, why: 'Yes. Enjoyment often returns slowly, and activity helps it along.' },
      { t: 'Waiting until you feel like it', ok: false, why: 'Feeling like it often comes after doing it, not before.' } ] } ],
    tryIt: { exercise: 'used-to-enjoy' },
    wrap: { built: 'A list of things you used to enjoy.', lives: 'Workbook, Activity Library.', action: 'Pick one thing from your list to try this week.', todo: 'Try one thing I used to enjoy' },
    refs: ['R17', 'R18'] },
  { id: 'm8-l2', title: 'Track your days', minutes: 4,
    moment: { cast: 'meera', text: 'Meera thinks her days are all work and worry. When she logs a week of activities, she sees something new. The evenings she video-called her sister were her best.' },
    cards: [
      { title: 'Look before you change', text: 'For a week, note what you do and how much you enjoyed it. Do not change anything yet. You are just collecting facts about your own days.' },
      { title: 'Patterns appear', text: 'You may find that some activities lift you and others drain you. You may also see which hours feel empty or risky.' },
      { title: 'Small is fine', text: 'A quick log twice a day is enough. Your Insights show the pattern once you have a few days.' },
    ],
    checks: [ { q: 'What is the point of tracking before changing anything?', options: [
      { t: 'To see what actually lifts or drains you', ok: true, why: 'Yes. Your own data shows you where to start.' },
      { t: 'To prove you are doing enough', ok: false, why: 'There is no score here. It is just information for you.' } ] } ],
    tryIt: { route: '#/track/log/activity', label: 'Log an activity' },
    wrap: { built: 'A first activity log.', lives: 'Track, and Insights.', action: 'Log your activities twice a day for a week.', todo: 'Log activities for a week' },
    refs: ['R15', 'R16'] },
  { id: 'm8-l3', title: 'Should-dos and want-tos', minutes: 4,
    moment: { cast: 'kavita', text: 'Kavita\'s days are full of tiffins, bills and family errands. When she tries to list things she wants to do, she gets stuck after one. That is when she notices how much the balance has tipped.' },
    cards: [
      { title: 'Two kinds of task', text: 'Should-dos are things you have to do: work, chores, bills. Want-tos are things you do because you enjoy them. A good week has some of both.' },
      { title: 'Too many shoulds', text: 'A life of only shoulds can feel heavy and unfair. That feeling can turn into "I deserve a drink." Adding want-tos takes away some of that pull.' },
      { title: 'Find the gap', text: 'Make two lists and compare them. If one is much shorter, that is where to add something this week.' },
    ],
    checks: [ { q: 'Your want-to list is much shorter. What does that tell you?', options: [
      { t: 'Where to add something small and enjoyable', ok: true, why: 'Yes. The gap shows you where to start.' },
      { t: 'That you are lazy or selfish for wanting more', ok: false, why: 'Wanting enjoyment is healthy. It is part of staying well.' } ] } ],
    tryIt: { exercise: 'should-want' },
    wrap: { built: 'Your should-dos and want-tos, side by side.', lives: 'Workbook, Should and want.', action: 'Add one want-to to your week.', todo: 'Add one want-to this week' },
    refs: ['R15', 'R18'] },
  { id: 'm8-l4', title: 'Pleasant, not risky', minutes: 4,
    moment: { cast: 'raj', text: 'A friend invites Raj to a concert by a band he only ever saw while high. He would love to go. He also knows the crowd and the music might pull hard.' },
    cards: [
      { title: 'One a day', text: 'Aim for one pleasant activity each day. It can be small: a walk, a song you love, cooking something new. What matters is doing it to enjoy yourself.' },
      { title: 'Ask one question', text: 'Before you pick an activity, ask: could this make me want to use? Some places, people and music are tied to old habits.' },
      { title: 'Make it safer, or pick another', text: 'If it is risky, you can bring a friend who does not use, plan your exit, or choose something else for now. What you enjoy may change, and that is part of finding out.' },
    ],
    checks: [ { q: 'A fun plan has a risk of triggering you. What can you do?', options: [
      { t: 'Bring a support person and plan your exit, or choose another activity', ok: true, why: 'Yes. You can lower the risk or swap it, without giving up on fun.' },
      { t: 'Never do anything fun again', ok: false, why: 'Fun is part of recovery. The aim is to find safe fun.' } ] } ],
    tryIt: { exercise: 'activity-menu' },
    wrap: { built: 'A menu of pleasant activities, each with a risk check.', lives: 'Workbook, Activity Library.', action: 'Plan one pleasant activity for each of the next three days.', todo: 'Plan a pleasant activity' },
    refs: ['R15', 'R17', 'R1'] },
  { id: 'm8-l5', title: 'Obstacles and predictions', minutes: 5,
    moment: { cast: 'dev', text: 'Dev planned to go swimming three times this week. Each time, he told himself it would not be fun and he was too tired. He went once and, to his surprise, enjoyed it more than he expected.' },
    cards: [
      { title: 'Two kinds of obstacle', text: 'Some obstacles are practical: time, money, travel. Others are thoughts: "It won\'t be fun", "I\'m too tired". Both can be worked on.' },
      { title: 'Solve it in three steps', text: 'List every way around the obstacle, even silly ones. Weigh them up and pick the best one or two. Try one, and see what happens.', link: { route: '#/tools/problem-solver', label: 'Open the Problem Solver' } },
      { title: 'Test the prediction', text: 'Before an activity, guess how much you will enjoy it. Afterwards, rate how much you did. Often the real rating is higher than the guess.', link: { route: '#/actions/predictions', label: 'Open the Prediction Lab' } },
    ],
    checks: [ { q: 'You predict a walk will be no fun. What is the experiment?', options: [
      { t: 'Go anyway, then compare how it felt with your guess', ok: true, why: 'Yes. Your own results show whether the prediction was right.' },
      { t: 'Skip it, because your prediction says so', ok: false, why: 'A prediction is a guess, not a fact. Testing it is how you find out.' } ] } ],
    tryIt: { exercise: 'obstacles' },
    wrap: { built: 'A plan around one obstacle, and a prediction to test.', lives: 'Workbook, and Actions, Prediction Lab.', action: 'Make one prediction this week and test it.', todo: 'Test one enjoyment prediction' },
    refs: ['R15', 'R7'] },
  { id: 'm8-l6', title: 'Follow through and reward', minutes: 4,
    moment: { cast: 'farhan', text: 'Farhan promised himself a new pair of walking shoes after a month of evening walks. On day thirty he bought them. He wore them on his walk the next evening.' },
    cards: [
      { title: 'Plan it, then do it', text: 'Choose a pleasant activity, put it on a day, and do it. Planning makes it much more likely to happen.' },
      { title: 'Pick your own reward', text: 'Choose a real reward for following through: a favourite meal, a film, something small you have wanted. You decide what it is and when you have earned it.' },
      { title: 'Rewards for doing', text: 'The app rewards practice, never sober days. Missing a plan does not take anything away. Just plan the next one.' },
    ],
    checks: [ { q: 'You miss a planned activity. What happens?', options: [
      { t: 'Nothing is lost; you plan the next one', ok: true, why: 'Yes. Everything you have built stays. Just pick a new day.' },
      { t: 'You lose your rewards', ok: false, why: 'Nothing is ever taken away here. Missing one plan is just a missed plan.' } ] } ],
    tryIt: { exercise: 'rewards' },
    wrap: { built: 'Three plans, each with a reward you chose.', lives: 'Actions, Rewards, and the Planner.', action: 'Follow through on one plan this week and enjoy your reward.', todo: 'Follow through on a plan and reward myself' },
    refs: ['R19', 'R15'] },
] },

{ id: 'm9', step: 7, name: 'Handle Hard Feelings', harbor: 'The Breakwater', book: 9, milestone: 'builder',
  blurb: 'Sadness, worry and anger are part of life. Learn to handle them without using.',
  unlocks: ['feelingTools'], lessons: [
  { id: 'm9-l1', title: 'Mood and recovery', minutes: 4, clinicalReview: true,
    moment: { cast: 'kavita', text: 'Six weeks without a drink, and Kavita still feels low most mornings. She wonders if this is just how life is now. Her doctor asks her a few questions and listens.' },
    cards: [
      { title: 'Feelings and using are linked', text: 'Many people used to cope with sadness, worry or anger. When you stop, those feelings are still there. Learning to handle them is a big part of staying well.' },
      { title: 'Early low mood', text: 'Feeling low in the first weeks is common and often lifts with time. Logging your feelings helps you see if it is changing.' },
      { title: 'When to get help', text: 'If low mood or worry lasts for weeks, talk to a doctor or counsellor. Help for mood and help for addiction work well together.' },
      { title: 'If you are not safe', text: 'If you have thoughts of harming yourself, get help now.', link: { route: '#/sos/urgent', label: 'Urgent help' } },
    ],
    checks: [ { q: 'Your low mood has lasted most days for a month. What is a good step?', options: [
      { t: 'Talk to a doctor or counsellor about it', ok: true, why: 'Yes. Ongoing low mood is common and treatable, and help works.' },
      { t: 'Keep it to yourself and wait', ok: false, why: 'You do not have to carry it alone. A doctor can help.' } ] } ],
    tryIt: { route: '#/track/log/feeling', label: 'Log how you feel' },
    wrap: { built: 'A first feeling log.', lives: 'Track, and Insights.', action: 'Log your feelings once a day this week.', todo: 'Log feelings daily this week' },
    refs: ['R31', 'R28'] },
  { id: 'm9-l2', title: 'The same traps', minutes: 4, clinicalReview: true,
    moment: { cast: 'dev', text: 'Dev gets one low mark and thinks, "I\'m going to fail everything." By evening he feels hopeless about college. The thought feels like a fact.' },
    cards: [
      { title: 'Traps feed moods too', text: 'The thinking traps from M5 do not only feed cravings. They also feed sadness and worry. "Always", "never" and "everyone thinks" are clues.' },
      { title: 'Put the mood on trial', text: 'Write the thought down. Look for evidence for and against it. Then write a fairer thought.', link: { route: '#/tools/trial?mode=mood', label: 'Put a thought on trial' } },
      { title: 'Feelings are not facts', text: 'A strong feeling can make a thought seem true. Feeling like a failure does not make you one.' },
    ],
    checks: [ { q: '"I got one bad mark, so I\'ll fail everything." Which trap is it?', options: [
      { t: 'Jumping to conclusions', ok: true, why: 'Yes. One mark does not tell you how everything will turn out.' },
      { t: 'It is not a trap; it is just true', ok: false, why: 'One result is not proof about the future. Try putting it on trial.' } ] } ],
    tryIt: { route: '#/tools/trial?mode=mood', label: 'Put a thought on trial' },
    wrap: { built: 'A low-mood thought, put on trial.', lives: 'Tools, Put it on trial.', action: 'Catch one mood thought this week and put it on trial.', todo: null },
    refs: ['R7', 'R5'] },
  { id: 'm9-l3', title: 'Anger: give it a beat', minutes: 5, clinicalReview: true,
    moment: { cast: 'kavita', text: 'A customer complains loudly about a late tiffin. Kavita feels the heat rise in her face. Years ago, that feeling ended the evening with a bottle.' },
    cards: [
      { title: 'Anger costs', text: 'Losing your temper can hurt people you care about and make it harder to get what you need. Angry moments are also a common lead-in to using.' },
      { title: 'Know your signs', text: 'Anger often shows in the body first: a hot face, a tight jaw, clenched hands. Spotting your early signs gives you time to act.' },
      { title: 'Give it a beat', text: 'When you notice the signs, pause before you speak or act. Step away, breathe, or count. The Give it a beat practice in Actions, Practices walks you through it.' },
    ],
    checks: [ { q: 'You feel your face getting hot in an argument. What do you do first?', options: [
      { t: 'Pause and give it a beat before you answer', ok: true, why: 'Yes. A short pause lets you choose your words.' },
      { t: 'Say everything now, before you forget', ok: false, why: 'Words said in the heat of anger are hard to take back. A pause helps.' } ] } ],
    tryIt: { exercise: 'anger-signature' },
    wrap: { built: 'Your anger signature: your triggers and early signs.', lives: 'Workbook, Anger, and SOS feeling tools.', action: 'Next time you notice an early sign, give it a beat.', todo: null },
    refs: ['R12', 'R2'] },
  { id: 'm9-l4', title: 'Rewrite the scene', minutes: 5, clinicalReview: true,
    moment: { cast: 'farhan', text: 'Last week Farhan shouted at his son over a broken phone. He still feels bad about it. He wishes he had handled it differently.' },
    cards: [
      { title: 'Look back, kindly', text: 'Pick a time anger got the better of you. Write what happened, what you did, and how it turned out. Be honest and fair to yourself.' },
      { title: 'Write a new ending', text: 'Now write what you could do next time: where you would pause, what you would say, who you could call. This is practice, not blame.' },
      { title: 'Practise in a game', text: 'The Rewrite game lets you try a new ending on a made-up scene first.', link: { route: '#/games/rewrite', label: 'Play Rewrite the scene' } },
    ],
    checks: [ { q: 'Why rewrite a scene that already happened?', options: [
      { t: 'To plan a better response for next time', ok: true, why: 'Yes. Rehearsing a new ending makes it easier to use for real.' },
      { t: 'To prove you were wrong', ok: false, why: 'This is not about blame. It is about having a plan you like.' } ] } ],
    tryIt: { exercise: 'rewrite-scene' },
    wrap: { built: 'One scene, rewritten with a new ending.', lives: 'Workbook, Anger.', action: 'Read your new ending once before a situation you expect to be tense.', todo: null },
    refs: ['R2', 'R7'] },
  { id: 'm9-l5', title: 'Quick coping, then your why', minutes: 4, clinicalReview: true,
    moment: { cast: 'meera', text: 'A hard call with her mother leaves Meera shaky and tearful. She opens SOS and taps "I\'m feeling". Ten minutes later she reads her Reasons Card.' },
    cards: [
      { title: 'Calm the body first', text: 'In a hard moment, start with something quick: SOBER, a short walk, cold water on your face, or a call to someone in your crew.', link: { route: '#/sos/feeling', label: 'Open feeling tools in SOS' } },
      { title: 'Then come back to why', text: 'When the wave has eased a little, read your reasons for change. They remind you what the hard work is for.' },
      { title: 'Build your own tools', text: 'Over time, keep the tools that helped you most. They show up first in SOS when you need them.' },
    ],
    checks: [ { q: 'What can you do first when a feeling hits hard?', options: [
      { t: 'Use a quick coping skill, then read your reasons', ok: true, why: 'Yes. Settle the body first, then remind yourself why you are doing this.' },
      { t: 'Push the feeling down and ignore it', ok: false, why: 'Pushed-down feelings tend to come back. Quick coping helps them pass.' } ] } ],
    tryIt: { route: '#/workbook/reasons', label: 'Read your Reasons Card' },
    wrap: { built: 'A quick coping plan that ends with your reasons.', lives: 'SOS, feeling tools, and Workbook, Reasons.', action: 'Pick two quick coping skills to try first next time.', todo: null },
    refs: ['R12', 'R8'] },
] },

{ id: 'm10', step: null, name: 'Your Recovery Plan', harbor: 'The Harbor Office', book: 10, milestone: 'guide',
  blurb: 'Put what you have learned into one plan: your warning signs, your skills, your people and what to do after a slip.',
  unlocks: ['recoveryPlan', 'radar'], lessons: [
  { id: 'm10-l1', title: 'One step ahead', minutes: 4, clinicalReview: true,
    moment: { cast: 'farhan', text: 'Two years ago, Farhan went back to using after eight months. Looking back, he can see the signs started weeks before. He stopped calling his brother, skipped meetings and slept badly.' },
    cards: [
      { title: 'A slip is a process', text: 'Going back to using usually builds up over days or weeks. Stress grows, good habits slip, and old thoughts return. That means there is time to notice and act.' },
      { title: 'Check in each week', text: 'A short look back each week helps you spot changes early. Are you sleeping, eating, seeing people, doing things you enjoy?', link: { route: '#/actions/review', label: 'Open the Weekly Review' } },
      { title: 'Nothing you built is lost', text: 'Everything you have learned stays with you. If things get harder, you go back to the skills that worked.' },
    ],
    checks: [ { q: 'Why look for warning signs weeks ahead?', options: [
      { t: 'Because a slip usually builds up over time, so there is time to act', ok: true, why: 'Yes. Spotting the build-up early gives you more choices.' },
      { t: 'Because slips come out of nowhere', ok: false, why: 'They often feel sudden, but looking back, most have early signs.' } ] } ],
    tryIt: { route: '#/actions/review', label: 'Try a Weekly Review' },
    wrap: { built: 'A weekly habit of looking back.', lives: 'Actions, Weekly Review.', action: 'Pick a day for your Weekly Review.', todo: 'Do a Weekly Review' },
    refs: ['R3', 'R2'] },
  { id: 'm10-l2', title: 'Your warning signs', minutes: 5, clinicalReview: true,
    moment: { cast: 'meera', text: 'Meera knows two of her warning signs well. When she skips dinner and stops answering her sister, trouble is close. She writes them down with a plan for each.' },
    cards: [
      { title: 'Signs are personal', text: 'Common signs include poor sleep, skipping support, pulling away from people, fewer enjoyable things, and old thoughts like "just one". Yours may be different.' },
      { title: 'Pick your top three', text: 'Choose the three signs that matter most for you. For each, write one thing you will do when you notice it.' },
      { title: 'A gentle radar', text: 'The Warning Sign Radar watches your own logs for some of these signs and reminds you of your plan. It never judges you.', link: { route: '#/track/insights', label: 'See your Insights' } },
    ],
    checks: [ { q: 'You notice one of your top warning signs. What now?', options: [
      { t: 'Use the plan you wrote for that sign', ok: true, why: 'Yes. A ready plan makes acting easy.' },
      { t: 'Wait to see if it gets worse', ok: false, why: 'Acting early is easier than acting late.' } ] } ],
    tryIt: { exercise: 'warning-signs' },
    wrap: { built: 'Your top three warning signs, each with a plan.', lives: 'Workbook, Warning signs, and the Radar in Track.', action: 'Read your three plans once this week.', todo: null },
    refs: ['R3', 'R1'] },
  { id: 'm10-l3', title: 'Stopping a slip', minutes: 4, clinicalReview: true,
    moment: { cast: 'raj', text: 'After two months off, Raj smoked at a friend\'s wedding. The next morning he thought, "I\'ve blown it." Then he opened the app.' },
    cards: [
      { title: 'A slip is not the end', text: 'A slip does not undo what you have learned or built. It is a sign the plan needs a change.' },
      { title: 'Stop and reach out', text: 'Stop as soon as you can, and tell someone in your crew. Then look at what led up to it.', link: { route: '#/sos/slip', label: 'Open slip help' } },
      { title: 'If you are not safe', text: 'If you feel unwell or unsafe, get help now.', link: { route: '#/sos/urgent', label: 'Urgent help' } },
    ],
    checks: [ { q: 'After a slip, what helps most?', options: [
      { t: 'Stop, reach out, and learn what led to it', ok: true, why: 'Yes. A slip is a lesson for the plan, not a verdict on you.' },
      { t: 'Decide it is all over', ok: false, why: '"I\'ve blown it" is a thinking trap. What you have built is still there.' } ] } ],
    tryIt: { exercise: 'slip-review' },
    wrap: { built: 'A plan for what to do after a slip.', lives: 'SOS, Slip, and your Workbook.', action: 'Write down who you would tell first after a slip.', todo: null },
    refs: ['R4', 'R23'] },
  { id: 'm10-l4', title: 'Build my plan', minutes: 5, clinicalReview: true,
    moment: { cast: 'dev', text: 'Dev\'s next exam season starts in a month. He wants everything that helps in one place. He opens My Recovery Plan and finds most of it already filled in.' },
    cards: [
      { title: 'All in one place', text: 'My Recovery Plan gathers your reasons, triggers, warning signs, go-to skills, people and slip plan. Much of it comes from what you have already done.' },
      { title: 'Check and confirm', text: 'Read each part. Change what does not fit any more, then confirm the plan. You can update it any time.' },
      { title: 'Keep it alive', text: 'Your plan grows as you do. Look at it in your Weekly Review, and after any hard week.' },
    ],
    checks: [ { q: 'When should you update your plan?', options: [
      { t: 'Whenever something changes, and in your Weekly Review', ok: true, why: 'Yes. A plan that keeps up with your life is one you will use.' },
      { t: 'Never; once it is written it is done', ok: false, why: 'Your life changes, so your plan can too.' } ] } ],
    tryIt: { route: '#/workbook/plan', label: 'Open My Recovery Plan' },
    wrap: { built: 'My Recovery Plan, confirmed.', lives: 'Workbook, My Recovery Plan.', action: 'Confirm your plan, and look at it again next week.', todo: 'Confirm My Recovery Plan' },
    refs: ['R2', 'R3', 'R32'] },
] }
);

if (typeof module !== 'undefined' && module.exports) module.exports = C_c;
