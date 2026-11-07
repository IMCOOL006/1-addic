/* 1-addic · CONTENT · guided practices and games data (BUILD-PLAN 3.8; unit U-32).
   Original wording throughout (docs/book/ notes gave the ideas, never the words). The scripts are read aloud by the
   device's own speech (O4), so every line is a plain, short sentence. No pacing counts in the breathing practice:
   people breathe the way they breathe. `secs` is the pause after a line, before the next one is read.
   Shapes (pinned by the SCREENS chat, 16:27):
   Content.practices = map by id {breathe, 'body-scan', sober, 'urge-surf', shower, eating, walking, beat}, each
     {id, title, minutes, intro, script:[{t, secs?}], close}; sober also has steps: 5 plain strings (ui-sos.js reads
     them); breathe has ladder [5,10,15,20,25,30] (minutes).
   Content.games = {sort, flag, bigGame, refusal}; Content.comebacks = 3 strings. */
const C_pr = (typeof Content !== 'undefined') ? Content : require('./content-core.js');

C_pr.practices = {
  breathe: { id: 'breathe', title: 'Breathing with awareness', minutes: 5, ladder: [5, 10, 15, 20, 25, 30],
    intro: 'Sit somewhere you can be still for a few minutes. You do not need to breathe in any special way. Just notice.',
    script: [
      { t: 'Settle into your seat.', secs: 10 },
      { t: 'Feel where your body touches the chair and the floor.', secs: 20 },
      { t: 'Now bring your attention to your breath.', secs: 15 },
      { t: 'Notice the air as it comes in.', secs: 20 },
      { t: 'Notice your chest or your belly as it moves.', secs: 25 },
      { t: 'Notice the air as it goes out.', secs: 25 },
      { t: 'You do not need to change anything. Just watch.', secs: 40 },
      { t: 'If your mind wanders, that is fine.', secs: 10 },
      { t: 'Notice where it went, and come back to the breath.', secs: 40 },
      { t: 'Each time you come back, that is the practice.', secs: 45 },
      { t: 'Stay with the breath for a little longer.', secs: 50 },
    ],
    close: 'When you are ready, open your eyes and look around the room. You can come back to your breath at any time.' },

  'body-scan': { id: 'body-scan', title: 'Body scan', minutes: 10,
    intro: 'Sit or lie down somewhere quiet. You will move your attention slowly through your body. There is nothing to fix. If anything feels like too much, open your eyes and stop.',
    script: [
      { t: 'Let your eyes close, or rest them on one spot.', secs: 15 },
      { t: 'Notice your breath for a moment, just as it is.', secs: 40 },
      { t: 'Feel where your body is held up: the chair, the bed or the floor.', secs: 30 },
      { t: 'Bring your attention to your feet.', secs: 10 },
      { t: 'Notice your toes, the soles of your feet, your heels.', secs: 30 },
      { t: 'Are they warm or cool? Tight or loose? Just notice.', secs: 30 },
      { t: 'Move your attention up to your ankles and lower legs.', secs: 30 },
      { t: 'Now your knees, and the backs of your knees.', secs: 25 },
      { t: 'Now your thighs. Notice their weight.', secs: 30 },
      { t: 'Bring your attention to your hips and the base of your back.', secs: 30 },
      { t: 'If your mind has wandered, that is fine. Come back to where you were.', secs: 15 },
      { t: 'Now your belly. Notice it move as you breathe.', secs: 35 },
      { t: 'Now your chest.', secs: 30 },
      { t: 'Move to your back, from the bottom to the top.', secs: 35 },
      { t: 'Notice your shoulders. If they are tight, just notice that.', secs: 35 },
      { t: 'Move down your arms, to your elbows, your wrists and your hands.', secs: 35 },
      { t: 'Notice your fingers, one by one.', secs: 25 },
      { t: 'Now your neck and throat.', secs: 25 },
      { t: 'Now your jaw, your mouth and your cheeks.', secs: 30 },
      { t: 'Your eyes, your forehead, and the top of your head.', secs: 30 },
      { t: 'Now notice your whole body at once, from head to feet.', secs: 45 },
    ],
    close: 'Slowly move your fingers and toes. Open your eyes when you are ready. Whatever you noticed was fine.' },

  sober: { id: 'sober', title: 'SOBER breathing', minutes: 2,
    steps: [
      'Stop. Pause where you are.',
      'Observe. Notice what is going on in your body and mind.',
      'Breathe. Bring your attention to your breath.',
      'Expand. Take in your whole body and the space around you.',
      'Respond. Choose your next step with care.',
    ],
    intro: 'Five short steps. You can do this anywhere, in about two minutes.',
    script: [
      { t: 'Stop. Pause where you are.', secs: 10 },
      { t: 'Observe. Notice what is going on in your body and mind.', secs: 25 },
      { t: 'Breathe. Bring your attention to your breath.', secs: 30 },
      { t: 'Expand. Take in your whole body and the space around you.', secs: 25 },
      { t: 'Respond. Choose your next step with care.', secs: 15 },
    ],
    close: 'You stopped and chose. That is the skill.' },

  'urge-surf': { id: 'urge-surf', title: 'Urge surfing', minutes: 10,
    intro: 'A craving is like a wave. It rises, peaks and falls. You can watch it without acting on it.',
    script: [
      { t: 'Sit down, if you can.', secs: 10 },
      { t: 'Notice the craving. Where do you feel it in your body?', secs: 30 },
      { t: 'Give it a number from 0 to 10, in your head.', secs: 15 },
      { t: 'Now bring your attention to your breath. Let it be your surfboard.', secs: 30 },
      { t: 'Notice the craving again. Is it bigger, smaller, or the same?', secs: 40 },
      { t: 'You do not have to do anything about it. Just watch.', secs: 60 },
      { t: 'If thoughts come, let them pass like clouds.', secs: 60 },
      { t: 'Check in with the craving again. Notice how it has changed.', secs: 60 },
      { t: 'Stay with your breath while the wave moves.', secs: 90 },
      { t: 'Give the craving a number again.', secs: 20 },
    ],
    close: 'Most waves pass within half an hour. Each one you ride makes the next easier.' },

  shower: { id: 'shower', title: 'Mindful shower', minutes: 5,
    intro: 'Next time you shower, use it as a short practice. Go slowly and notice.',
    script: [
      { t: 'Notice the sound of the water.', secs: 20 },
      { t: 'Feel the temperature on your skin.', secs: 25 },
      { t: 'Notice the smell of the soap.', secs: 25 },
      { t: 'Feel your hands as they wash each part of you.', secs: 40 },
      { t: 'If your mind runs ahead to your day, gently come back to the water.', secs: 40 },
    ],
    close: 'Notice how you feel as you step out. Write down one thing you noticed.' },

  eating: { id: 'eating', title: 'Mindful eating', minutes: 5,
    intro: 'Choose a small snack or the first few bites of a meal. Eat it more slowly than usual.',
    script: [
      { t: 'Look at the food. Notice its colours and shape.', secs: 20 },
      { t: 'Notice the smell.', secs: 15 },
      { t: 'Take one small bite. Do not chew yet.', secs: 15 },
      { t: 'Now chew slowly. Notice the taste and how it changes.', secs: 40 },
      { t: 'Notice the moment you swallow.', secs: 15 },
      { t: 'Take another bite, just as slowly.', secs: 60 },
    ],
    close: 'Notice how it felt to eat this way. Write down one thing you noticed.' },

  walking: { id: 'walking', title: 'Mindful walking', minutes: 5,
    intro: 'Walk somewhere safe, at an easy pace. Keep your eyes open and stay aware of where you are.',
    script: [
      { t: 'Feel your feet as they touch the ground.', secs: 30 },
      { t: 'Notice your legs as they move.', secs: 30 },
      { t: 'Notice the air on your face and hands.', secs: 30 },
      { t: 'Listen. What can you hear, near and far?', secs: 40 },
      { t: 'Look around. Notice one thing you have not seen before.', secs: 40 },
      { t: 'If your mind wanders, come back to your feet.', secs: 40 },
    ],
    close: 'Notice how you feel after the walk. Write down one thing you noticed.' },

  beat: { id: 'beat', title: 'Give it a beat', minutes: 2,
    intro: 'For when anger rises. A short pause gives you time to choose what you say and do.',
    script: [
      { t: 'Notice the signs: a hot face, a tight jaw, tight hands.', secs: 10 },
      { t: 'Step away if you can. It is fine to say, I need a minute.', secs: 15 },
      { t: 'Bring your attention to your breath.', secs: 20 },
      { t: 'Count slowly to ten in your head.', secs: 15 },
      { t: 'Ask yourself: what do I need right now?', secs: 20 },
      { t: 'Choose one thing to say or do that you will not regret.', secs: 20 },
    ],
    close: 'You gave it a beat. That pause is a real skill.' },
};

C_pr.games = {
  /* Distortion Sort: each thought goes in one of the six trap bins (Content.catalogs.distortions ids). */
  sort: [
    { id: 'st1', thought: 'I missed one meeting, so the whole week is a failure.', trap: 'black-white' },
    { id: 'st2', thought: 'If I am not perfect at this, I have failed completely.', trap: 'black-white' },
    { id: 'st3', thought: 'My boss only praised my work because she had to.', trap: 'discount' },
    { id: 'st4', thought: 'Two good weeks do not count. Anyone could do that.', trap: 'discount' },
    { id: 'st5', thought: 'They stopped talking when I came in. They must be talking about me.', trap: 'conclusions' },
    { id: 'st6', thought: 'The party will be awful, so I may as well not try.', trap: 'conclusions' },
    { id: 'st7', thought: 'I feel useless today, so I must be useless.', trap: 'feelings-facts' },
    { id: 'st8', thought: 'I feel so nervous that something bad is sure to happen.', trap: 'feelings-facts' },
    { id: 'st9', thought: 'My brother is upset, and it is all my fault.', trap: 'self-blame' },
    { id: 'st10', thought: 'The family dinner went badly because of me.', trap: 'self-blame' },
    { id: 'st11', thought: 'I forgot her birthday. I am a terrible person.', trap: 'labeling' },
    { id: 'st12', thought: 'I slipped once, so I am a lost cause.', trap: 'labeling' },
  ],

  /* Spot the Red Flag: a short chat; the three red-flag thoughts are at the indexes in redFlags. */
  flag: {
    title: 'Friday after work',
    lines: [
      { who: 'Sunil', t: 'Long week. I finished the report at last.' },
      { who: 'Sunil', t: 'I have been good all week. I deserve something.' },
      { who: 'Friend', t: 'Want to come for food tonight?' },
      { who: 'Sunil', t: 'Maybe. The old place is on the way.' },
      { who: 'Sunil', t: 'Nobody would know if I stopped there first.' },
      { who: 'Friend', t: 'We could try the new place near the bus stand.' },
      { who: 'Sunil', t: 'Just one would not matter.' },
      { who: 'Sunil', t: 'Actually, the new place sounds good. See you at eight.' },
    ],
    redFlags: [1, 4, 6],
    why: [
      '"I deserve something" can turn a good week into a reason to use.',
      '"Nobody would know" hides the choice from the people who help you.',
      '"Just one" is one of the most common lead-ins to a slip.',
    ],
  },

  /* The Big Game: one evening, six scenes, with an original character. A choice with to: null ends the story. */
  bigGame: {
    title: 'Arjun\'s Saturday',
    character: { name: 'Arjun', bio: 'Arjun is 30 and works in a phone repair shop. He stopped drinking two months ago.' },
    clinicalReview: true,
    start: 'bg1',
    scenes: [
      { id: 'bg1', text: 'It is Saturday afternoon. Arjun has the evening free. An old friend messages: a few people are meeting at the usual bar later.',
        choices: [
          { t: 'Reply that he will come along', to: 'bg2', note: 'A small yes. It puts Arjun in a strong-cue place.' },
          { t: 'Suggest meeting for dinner instead', to: 'bg3', note: 'He keeps the friend and changes the place.' },
        ] },
      { id: 'bg2', text: 'On his way, Arjun walks past the bar. He could go in now, or wait outside for his friend.',
        choices: [
          { t: 'Go in and wait at the counter', to: 'bg4', note: 'Waiting at the counter is the riskiest spot in the room.' },
          { t: 'Wait outside and message his friend', to: 'bg5', note: 'A pause outside keeps his options open.' },
        ] },
      { id: 'bg3', text: 'His friend agrees to dinner. At the restaurant, someone at the table orders drinks for everyone.',
        choices: [
          { t: 'Say, "Not for me. A lime soda, please."', to: 'bg6', note: 'A clear, short no. Most people move on fast.' },
          { t: 'Say nothing and hope it goes away', to: 'bg4', note: 'Staying quiet often means a drink lands in front of you.' },
        ] },
      { id: 'bg4', text: 'A drink is in front of Arjun. He feels the pull and thinks, "Just one."',
        choices: [
          { t: 'Push it away and step outside to call his brother', to: 'bg6', note: 'Leaving the moment and calling someone breaks the chain, even late.' },
          { t: 'Pick it up', to: null, note: 'The story ends here for today. A slip is a lesson for the plan, not the end. Arjun can stop, reach out and look at what led here.' },
        ] },
      { id: 'bg5', text: 'Outside, Arjun messages his friend: "Can we go somewhere else?" His friend says the group is staying.',
        choices: [
          { t: 'Go home and plan something for tomorrow', to: null, note: 'A safe evening. Arjun spotted the risk early and chose.' },
          { t: 'Go in for ten minutes to say hello', to: 'bg4', note: 'Short visits to risky places often last longer than planned.' },
        ] },
      { id: 'bg6', text: 'Arjun is outside, or at the table with his soda. The craving is still there, but smaller.',
        choices: [
          { t: 'Use SOBER breathing and stay a while', to: null, note: 'He rode the wave and stayed with his friend. A good evening.' },
          { t: 'Head home early and call it a win', to: null, note: 'Leaving early is a valid move. He kept his evening safe.' },
        ] },
    ],
  },

  /* Refusal practice: four scenes, three responses each, rated best | ok | weak with a reason. */
  refusal: [
    { id: 'rf1', clinicalReview: true, scene: 'At a cousin\'s wedding, an uncle holds out a glass and says, "Come on, just one for the couple."',
      responses: [
        { t: '"No, thank you. I\'ll toast with this juice."', rating: 'best', why: 'Clear and friendly, with something else in your hand.' },
        { t: '"Maybe later."', rating: 'weak', why: '"Later" invites him to ask again.' },
        { t: '"I\'m not drinking tonight."', rating: 'ok', why: 'Clear, but "tonight" can sound like next time is fine.' },
      ] },
    { id: 'rf2', clinicalReview: true, scene: 'A friend from the old crowd calls: "We\'re all at my place. Come over, it\'ll be like old times."',
      responses: [
        { t: '"I can\'t tonight."', rating: 'ok', why: 'It works for now, but does not stop the next call.' },
        { t: '"I\'ve stopped, so I won\'t come if people are using. Want to get tea tomorrow?"', rating: 'best', why: 'Honest, sets a limit, and offers a safe plan instead.' },
        { t: '"Yes, but I won\'t use."', rating: 'weak', why: 'Going into the old setting is a strong cue, however good the plan.' },
      ] },
    { id: 'rf3', clinicalReview: true, scene: 'A coworker offers you a pill before a big deadline: "It helps you focus. Everyone takes them."',
      responses: [
        { t: '"No, I don\'t take those."', rating: 'best', why: 'Short and firm. You do not owe a longer reason.' },
        { t: '"Not right now, thanks."', rating: 'weak', why: '"Not right now" leaves the door open.' },
        { t: '"No thanks. I\'ll take a short walk instead."', rating: 'ok', why: 'A good plan, but it may need a firmer no if they ask again.' },
      ] },
    { id: 'rf4', clinicalReview: true, scene: 'Your neighbour keeps offering to share a smoke every evening on the stairs.',
      responses: [
        { t: 'Make an excuse and go inside', rating: 'ok', why: 'It works today, but the offer will come again tomorrow.' },
        { t: '"I\'ve quit. Please don\'t offer any more. I\'m happy to chat, though."', rating: 'best', why: 'Asks them to stop and keeps the friendship.' },
        { t: 'Take it so they do not feel bad', rating: 'weak', why: 'Your recovery matters more than a moment of awkwardness.' },
      ] },
  ],
};

/* Three default comebacks for Talk back in SOS, until the person writes their own. */
C_pr.comebacks = [
  'This is a craving. It will rise, peak and pass.',
  'Wanting it is not the same as needing it.',
  'I can wait fifteen minutes and see how I feel then.',
];

if (typeof module !== 'undefined' && module.exports) module.exports = C_pr;
