/* 1-addic · CONTENT · exercises (BUILD-PLAN 3.8). An array of {id, title, book, kind, artifact?, repeat?, skill?,
   sensitive?, fields, tutorial:{example:{cast, values}, hints, built}, events}; field types are the 19 of
   ExerciseUI.FIELD_TYPES. Original wording throughout; `book` is metadata. U-31a: modules M0-M3 and the checkpoint;
   U-31b (the second block): M4-M10 and their checkpoint questions.
   Payload keys the Engine reads (engine.js reasonsCardSections): quick-reasons reasons/quick, balance
   drawbacks/benefits, four-lenses different. Keep those field ids. */
const C_ex = (typeof Content !== 'undefined') ? Content : require('./content-core.js');

(function () {
  const slugOf = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const cat = (C_ex.catalogs || {});
  // The signs list keeps its wording in one place (catalogs.symptoms); the exercise only gives each item an id.
  const signOptions = (cat.symptoms || []).flatMap((g) => (g.items || []).map((t) => ({ id: slugOf(t), label: t, group: g.group })));
  const sign = (t) => slugOf(t);
  const firstQuestions = (cat.programQuestions || []).slice(0, 3);

  const exercises = [
    /* ── M0 · Start Here ─────────────────────────────────────────────────────────────────────── */
    {
      id: 'quick-reasons', title: 'Three quick reasons', book: { chapter: 3, exercise: 'quick' }, kind: 'build',
      artifact: 'reasons', skill: 'reasons',
      fields: [
        { id: 'reasons', type: 'text', label: 'Your strongest reason to change, in a few words' },
        { id: 'quick', type: 'list', label: 'Any other reasons that matter to you', max: 4, optional: true },
      ],
      tutorial: {
        example: { cast: 'meera', values: {
          reasons: 'Clear mornings at the school office',
          quick: ['My husband trusting me again', 'Sleeping through the night', 'Money for the trip home at Diwali'],
        } },
        hints: {
          reasons: 'Specific beats general. "Clear mornings" works better than "my health".',
          quick: 'Add one at a time. You can change these whenever you like.',
        },
        built: 'Your reasons are saved. SOS can show them to you when a craving comes.',
      },
      events: ['ArtifactSaved'],
    },

    /* ── M1 · Understand Addiction ───────────────────────────────────────────────────────────── */
    {
      id: 'signs-check', title: 'The signs, for you', book: { chapter: 1, exercise: '1.1' }, kind: 'assess',
      fields: [
        { id: 'signs', type: 'check2', label: 'Which of these have happened to you, and which happen often?', options: signOptions },
        { id: 'cost', type: 'textarea', label: 'Pick one you marked. What has it cost you?', optional: true },
      ],
      tutorial: {
        example: { cast: 'raj', values: {
          signs: {
            [sign('I need more to get the same effect')]: { done: true, often: false },
            [sign('I think about it a lot')]: { done: true, often: true },
            [sign('I tried to cut down or stop and could not')]: { done: true, often: false },
            [sign('Lost interest in hobbies or people')]: { done: true, often: false },
          },
          cost: 'I used to play cricket every Sunday. I have not gone since March.',
        } },
        hints: {
          signs: 'Mark what has happened at all. Add the star only if it happens often. This is not a test.',
          cost: 'One real example is enough.',
        },
        built: 'Saved for you. Nobody else sees it, and the app draws no conclusion from it.',
      },
      events: ['ArtifactSaved'],
    },
    {
      id: 'risk-factors', title: 'What made me more vulnerable', book: { chapter: 1, exercise: '1.2' }, kind: 'assess',
      sensitive: true,
      fields: [
        { id: 'factors', type: 'check', label: 'Which of these were part of your life? Tick only what you want to.', from: 'catalogs.riskFactors', optional: true },
        { id: 'care', type: 'textarea', label: 'Which situations or feelings might need extra care because of this?', optional: true },
      ],
      tutorial: {
        example: { cast: 'kavita', values: {
          factors: ['A family member with addiction', 'Depression, anxiety, PTSD or another mental health condition'],
          care: 'Evenings when I miss my husband. Family weddings, where my father always drank.',
        } },
        hints: {
          factors: 'You can skip any item, or the whole page. Ticks explain the past; they do not predict your future.',
          care: 'Think of the moments that may need a plan, not a reason to blame yourself.',
        },
        built: 'Saved privately. You now know which moments deserve extra care.',
      },
      events: ['ArtifactSaved'],
    },
    {
      id: 'help-request', title: 'Ask for help, your way', book: { chapter: 1, exercise: '1.x' }, kind: 'plan',
      fields: [
        { id: 'who', type: 'single', label: 'Who could you ask first?', options: [
          { id: 'doctor', label: 'A doctor' }, { id: 'counsellor', label: 'A counsellor or therapist' },
          { id: 'helpline', label: 'A helpline' }, { id: 'group', label: 'A support group' },
          { id: 'trusted', label: 'Someone I trust' }] },
        { id: 'need', type: 'check', label: 'What do you want to ask for?', allowCustom: true, options: [
          { id: 'referral', label: 'A referral to a programme' }, { id: 'stop-safely', label: 'Advice on stopping safely' },
          { id: 'cravings', label: 'Help with cravings' }, { id: 'medication', label: 'Information about medication' },
          { id: 'private', label: 'For this to stay between us' }, { id: 'listen', label: 'Someone to listen' }] },
        { id: 'script', type: 'template', label: 'Your opening line', parts: [
          'I want to talk about my ', { blank: 'what', label: 'what you want to change' },
          '. What I need from you is ', { blank: 'ask', label: 'your request' }, '.'] },
        { id: 'when', type: 'date', label: 'When will you ask?', optional: true },
      ],
      tutorial: {
        example: { cast: 'farhan', values: {
          who: 'doctor',
          need: ['private', 'A plan for back pain that does not use opioids'],
          script: { what: 'past use of pain pills', ask: 'a plan for my back that does not use opioids' },
          when: '2026-11-12',
        } },
        hints: {
          who: 'Start with the person who feels easiest to talk to.',
          need: 'Tick what fits, or add your own words.',
          script: 'Short and direct is enough. You can say more later, when you are ready.',
        },
        built: 'Your request is ready. Saying it out loud once, to yourself, makes it easier.',
      },
      events: ['ArtifactSaved'],
    },
    {
      id: 'program-questions', title: 'Questions for a programme', book: { chapter: 1, exercise: '1.y' }, kind: 'tool',
      fields: [
        { id: 'place', type: 'text', label: 'Which programme or place are you looking at?', optional: true },
        { id: 'ask', type: 'check', label: 'Which questions will you ask them?', from: 'catalogs.programQuestions', allowCustom: true },
        { id: 'answers', type: 'textarea', label: 'What did they tell you?', optional: true },
      ],
      tutorial: {
        example: { cast: 'meera', values: {
          place: 'An outpatient programme near my office',
          ask: firstQuestions,
          answers: 'Evening groups twice a week, a doctor on site, and family sessions once a month.',
        } },
        hints: {
          ask: 'Pick the ones that matter most to you. Add your own, like cost or timings.',
          answers: 'Write it down after the call, while you still remember.',
        },
        built: 'Your questions are saved. Take them with you, or read them over the phone.',
      },
      events: ['ExerciseDone'],
    },

    /* ── M3 · Find Your Why ──────────────────────────────────────────────────────────────────── */
    {
      id: 'motivation', title: 'Motivation check', book: { chapter: 3, exercise: '3.1' }, kind: 'assess',
      artifact: 'motivation', repeat: true, skill: 'motivation-check',
      fields: [
        { id: 'stage', type: 'single', label: 'Where are you right now?', from: 'stages' },
        { id: 'score', type: 'slider', label: 'How motivated do you feel today?', min: 0, max: 10, labels: ['Not at all', 'Very'] },
        { id: 'plusOne', type: 'text', label: 'What would move it up one point?' },
      ],
      tutorial: {
        example: { cast: 'raj', values: {
          stage: 'contemplation', score: 4,
          plusOne: 'If my sister came with me to talk to someone.',
        } },
        hints: {
          stage: 'There is no wrong answer. People move between these often.',
          score: 'Any number is fine. It is information, not a grade.',
          plusOne: 'Something small and specific you could do this week.',
        },
        built: 'Saved. Your Motivation Meter now has a new point.',
      },
      events: ['ArtifactSaved'],
    },
    {
      id: 'balance', title: 'Both sides of both choices', book: { chapter: 3, exercise: '3.2' }, kind: 'build',
      skill: 'balance',
      fields: [
        { id: 'pull', type: 'list', label: 'The good things about carrying on', max: 6 },
        { id: 'drawbacks', type: 'list', label: 'The drawbacks of carrying on', max: 6 },
        { id: 'miss', type: 'list', label: 'What I will miss if I stop', max: 6 },
        { id: 'benefits', type: 'list', label: 'The benefits of stopping', max: 6 },
      ],
      tutorial: {
        example: { cast: 'meera', values: {
          pull: ['It switches off the quiet flat after nine'],
          drawbacks: ['Headaches at work', 'Hiding bottles from my husband', 'The money'],
          miss: ['Evenings feel long and empty'],
          benefits: ['Clear mornings', 'My husband trusting me again', 'Proper sleep'],
        } },
        hints: {
          pull: 'Be honest here. Naming the pull takes away its surprise.',
          drawbacks: 'Real moments work best: what happened, and when.',
          miss: 'Missing something is normal. You can plan for it later.',
          benefits: 'Picture an ordinary day without it. What is better?',
        },
        built: 'Your drawbacks and benefits now feed your Reasons Card.',
      },
      events: ['ArtifactSaved'],
    },
    {
      id: 'four-lenses', title: 'Four lenses', book: { chapter: 3, exercise: '3.3' }, kind: 'build',
      fields: [
        { id: 'problem', type: 'textarea', label: 'What has it cost you, and what has it stopped you doing?' },
        { id: 'worries', type: 'textarea', label: 'If nothing changes, what worries you?' },
        { id: 'why', type: 'list', label: 'Why do you want to change? Your own reasons.', max: 5 },
        { id: 'different', type: 'textarea', label: 'How would an ordinary day be different a year from now?' },
        { id: 'believe', type: 'textarea', label: 'Why do you believe you can do this?' },
      ],
      tutorial: {
        example: { cast: 'dev', values: {
          problem: 'Two terms of bad sleep, and a friend who stopped trusting me.',
          worries: 'That I will be back on pills by the next exam season.',
          why: ['I want to pass on my own', 'My mother stops worrying'],
          different: 'I study in the library in the morning and sleep at night. Exams are still hard, but they are mine.',
          believe: 'I have already stopped for two months. The first week was the worst, and I got through it.',
        } },
        hints: {
          problem: 'Specific is better than general.',
          worries: 'Say it plainly. A named worry is one you can act on.',
          why: 'Reasons that are yours, not what someone else wants.',
          different: 'Picture one normal day, not a perfect one.',
          believe: 'Any hard thing you have done before counts as evidence.',
        },
        built: 'Done. What would be different now sits on your Reasons Card.',
      },
      events: ['ArtifactSaved'],
    },

    /* ── The checkpoint: two questions per module, read by ui-learn.js checkpointQuestions ─── */
    {
      id: 'checkpoint', title: 'Checkpoint', book: { chapter: 0, exercise: 'checkpoint' }, kind: 'reflect',
      modules: {
        m0: [
          { q: 'A craving shows up while you are in the middle of a lesson. What is the quickest help?', options: [
            { t: 'Finish the lesson first', ok: false, why: 'Lessons can wait. SOS is one tap away on every screen, and nothing ever blocks it.' },
            { t: 'Open SOS', ok: true, why: 'Yes. SOS works offline and is never locked behind a lesson.' }] },
          { q: 'What happens to the light in your harbor after a slip?', options: [
            { t: 'It keeps every bit of light you have earned', ok: true, why: 'Right. Nothing here is taken away. A slip is something to learn from.' },
            { t: 'It goes dark and you start again', ok: false, why: 'No. Light only grows here. Your skills and progress stay.' }] },
        ],
        m1: [
          { q: 'Which of these is a sign of tolerance?', options: [
            { t: 'Needing more to get the same effect', ok: true, why: 'Yes. The body adjusts, so the same amount does less.' },
            { t: 'Feeling bored on a Sunday', ok: false, why: 'Boredom is common and can be a trigger, but it is not tolerance.' }] },
          { q: 'Who can tell you whether what you have is an addiction?', options: [
            { t: 'The app, from your ticks', ok: false, why: 'The app never labels you. Your answers are yours to use.' },
            { t: 'A doctor or counsellor, if you want to ask', ok: true, why: 'Yes. A list helps you see clearly. A professional can assess.' }] },
        ],
        m2: [
          { q: 'Why can a song or a street set off a strong craving?', options: [
            { t: 'The brain linked it with using, so it now works as a cue', ok: true, why: 'Yes. Learned cues fire fast. Without use, the link weakens over time.' },
            { t: 'It means you secretly want to use', ok: false, why: 'A cue is a learned reflex, not a wish. You can notice it and let it pass.' }] },
          { q: 'Can the brain recover after you stop?', options: [
            { t: 'No, the changes are permanent', ok: false, why: 'For most people, many of the changes ease with time. That is why the early months matter.' },
            { t: 'Yes, many changes ease with time', ok: true, why: 'Yes. It takes months, not days, and new habits help it along.' }] },
        ],
        m3: [
          { q: 'Part of you wants to change and part of you does not. What does that mean?', options: [
            { t: 'Mixed feelings are normal, and you can still move forward', ok: true, why: 'Yes. Most people feel both. You do not have to be sure to start.' },
            { t: 'You are not ready, so you should wait', ok: false, why: 'Waiting to feel certain can take a long time. Small steps count now.' }] },
          { q: 'Which reasons tend to hold up best in a hard moment?', options: [
            { t: 'Your own, in your own words', ok: true, why: 'Yes. Specific, personal reasons carry the most weight when a craving comes.' },
            { t: 'The ones other people give you', ok: false, why: 'Other people\'s reasons can help, but your own usually hold up better.' }] },
        ],
      },
    },
  ];

  C_ex.exercises = (Array.isArray(C_ex.exercises) ? C_ex.exercises : []).concat(exercises);
})();

/* ── U-31b · the exercises of M4-M10 (BUILD-PLAN 3.8) and checkpoint questions for m4-m10. ─────────
   Payload keys the Engine reads (engine.js): trial thought/comeback; distractions distractions/own;
   spiral thoughts/replies (by index); triggers <group> label lists plus frequent/anger label lists;
   warning-signs top (topN rows); slip-review and expand-network support; activity-menu activities/wantTos.
   Practice exercises name their script in Content.practices by `practice`. */
(function () {
  const cat = (C_ex.catalogs || {});
  const trig = cat.triggers || {};
  // Every trigger label once, grouped, the label as the id (the Engine matches triggers by label).
  const triggerLabels = Object.keys(trig).flatMap((g) => (trig[g] || []).map((t) => ({ id: t, label: t, group: g })));
  const activityOptions = (cat.activities || []).flatMap((g) => (g.items || []).map((t) => ({ id: t, label: t, group: g.cat })));
  const rate = { id: 'helpful', type: 'rating', label: 'How helpful was it, from 1 to 5?' };

  const more = [
    /* ── M4 · Set Yourself Up ────────────────────────────────────────────────────────────────── */
    {
      id: 'clear-space', title: 'Clear the space', book: { chapter: 4, exercise: '4.1' }, kind: 'plan',
      fields: [
        { id: 'items', type: 'check', label: 'What is still around that pulls at you?', allowCustom: true, options: [
          { id: 'bottles', label: 'Bottles, glasses or cans' }, { id: 'kit', label: 'Papers, pipes, foil or other kit' },
          { id: 'pills', label: 'Pill strips or old prescriptions' }, { id: 'stash', label: 'Hidden stashes' },
          { id: 'numbers', label: 'Numbers of people who supply' }, { id: 'chats', label: 'Chats or apps you used to get it' },
          { id: 'cash', label: 'Cash set aside for it' }] },
        { id: 'how', type: 'textarea', label: 'How will you get rid of each one?' },
        { id: 'helper', type: 'text', label: 'Who could help, or will you do it alone?', optional: true },
        { id: 'when', type: 'date', label: 'When will you do it?', optional: true },
      ],
      tutorial: {
        example: { cast: 'meera', values: {
          items: ['bottles', 'stash'],
          how: 'Pour out the two bottles in the kitchen. Check the cupboard above the fridge and the bag in the wardrobe.',
          helper: 'My sister, on Sunday morning',
        } },
        hints: {
          items: 'Think of every room, your bag, your phone and your vehicle.',
          how: 'Plain steps work best. For old medicines, ask a chemist how to dispose of them safely.',
          helper: 'Someone who does not use is the best helper.',
        },
        built: 'Your clear-out plan is saved. Fewer cues at home means fewer fights with yourself.',
      },
      events: ['ArtifactSaved'],
    },
    {
      id: 'exercise-plan', title: 'Pick a way to move', book: { chapter: 4, exercise: '4.2' }, kind: 'plan', skill: 'exercise',
      fields: [
        { id: 'activities', type: 'list', label: 'Ways of moving you might enjoy', max: 5 },
        { id: 'first', type: 'text', label: 'Which one will you try first?' },
        { id: 'minutes', type: 'number', label: 'How many minutes, the first time?', min: 5, max: 120 },
        { id: 'start', type: 'date', label: 'Which day?', optional: true },
        { id: 'reward', type: 'text', label: 'A small reward for doing it', optional: true },
      ],
      tutorial: {
        example: { cast: 'dev', values: {
          activities: ['Badminton with my cousin', 'A walk round the lake', 'Cycling to college'],
          first: 'A walk round the lake', minutes: 20, reward: 'A new episode of my show',
        } },
        hints: {
          activities: 'Pick what you might like, not what you think you should do.',
          minutes: 'Start small. Ten or twenty minutes counts.',
        },
        built: 'Your plan to move is saved. Moving often lifts mood and eases cravings.',
      },
      events: ['ArtifactSaved'],
    },
    {
      id: 'network-review', title: 'What a Safety Net looks like', book: { chapter: 4, exercise: '4.6' }, kind: 'build',
      fields: [
        { id: 'qualities', type: 'check', label: 'Which qualities matter most to you in a support person?', from: 'catalogs.safetyNetQualities' },
        { id: 'who', type: 'textarea', label: 'Who in your life has several of these?' },
        { id: 'risky', type: 'textarea', label: 'Is anyone risky for your recovery right now? What will you do about it?', optional: true },
      ],
      tutorial: {
        example: { cast: 'farhan', values: {
          qualities: ['Not using', 'A good listener', 'Reliable'],
          who: 'My brother Imran. Bhai from the NA group, who picks up even at night.',
          risky: 'Sunil from the old site still offers pills. I will not meet him alone.',
        } },
        hints: {
          qualities: 'Pick the few that matter most. Nobody has all of them.',
          who: 'Add these people in Workbook, My People, so SOS can call them.',
        },
        built: 'Saved. You know what to look for in the people you lean on.',
      },
      events: ['ArtifactSaved'],
    },
    {
      id: 'assertive-script', title: 'Say it straight', book: { chapter: 4, exercise: '4.5' }, kind: 'build', skill: 'assert',
      fields: [
        { id: 'situation', type: 'text', label: 'The conversation you want to be ready for' },
        { id: 'script', type: 'template', label: 'Your script', parts: [
          'I feel ', { blank: 'feel', label: 'a feeling' }, ' when ', { blank: 'when', label: 'what happens' },
          '. I need ', { blank: 'need', label: 'what you ask for' }, '.'] },
        { id: 'how', type: 'check', label: 'How will you say it?', optional: true, options: [
          { id: 'calm', label: 'In a calm, steady voice' }, { id: 'eyes', label: 'Looking at them' },
          { id: 'short', label: 'Short, without a long explanation' }, { id: 'time', label: 'At a calm time, not mid-argument' }] },
      ],
      tutorial: {
        example: { cast: 'kavita', values: {
          situation: 'My son keeps a bottle in the fridge when he visits',
          script: { feel: 'uneasy', when: 'there is alcohol in my kitchen', need: 'you to keep it out of the house for now' },
          how: ['calm', 'short'],
        } },
        hints: {
          script: 'Talk about what you feel and need, not what they did wrong.',
          how: 'Practise it out loud once before the real conversation.',
        },
        built: 'Your script is saved in Workbook, Scripts. Read it again before the talk.',
      },
      events: ['ArtifactSaved'],
    },
    {
      id: 'expand-network', title: 'Grow your crew', book: { chapter: 4, exercise: '4.7' }, kind: 'plan', skill: 'reach-out',
      fields: [
        { id: 'places', type: 'list', label: 'Places where you could meet people who do not use', max: 3 },
        { id: 'people', type: 'list', label: 'People you could get back in touch with', max: 3, optional: true },
        { id: 'support', type: 'list', label: 'Kinds of support you could ask for', max: 3 },
        { id: 'first', type: 'text', label: 'Your first small step this week' },
      ],
      tutorial: {
        example: { cast: 'dev', values: {
          places: ['The college badminton club', 'An online SMART Recovery meeting'],
          people: ['Ankit, my school friend'],
          support: ['Someone to study with in the evening', 'A text check-in on Fridays'],
          first: 'Message Ankit on Thursday',
        } },
        hints: {
          places: 'Groups, classes, sports, a place of worship, volunteering.',
          first: 'Small enough that you will actually do it.',
        },
        built: 'Your plan is saved. Each new person is a light on the Pier.',
      },
      events: ['ArtifactSaved'],
    },
    {
      id: 'should-i-go', title: 'Should I go?', book: { chapter: 4, exercise: '4.x' }, kind: 'tool', skill: 'should-i-go',
      fields: [
        { id: 'choice', type: 'text', label: 'What are you deciding?' },
        { id: 'steps', type: 'check', label: 'Which steps did you go through?', from: 'catalogs.sid' },
        { id: 'options', type: 'list', label: 'Your options, including the boring ones', max: 5 },
        { id: 'pick', type: 'text', label: 'The most protective option' },
        { id: 'exit', type: 'textarea', label: 'If you still go: your exit plan and who you will call', optional: true },
      ],
      tutorial: {
        example: { cast: 'raj', values: {
          choice: 'Take the short cut home past the tea stall where my old group sits',
          steps: ['Notice: this small choice matters', 'List every option, including the boring ones', 'Pick the most protective one'],
          options: ['The short cut', 'The main road, five minutes longer', 'Call my sister on the way'],
          pick: 'The main road, with my sister on the phone',
        } },
        hints: {
          choice: 'Small choices count: a route, a party, who you sit with.',
          exit: 'Decide the time you leave and who you call, before you go.',
        },
        built: 'Done. Checking small choices early keeps you out of tight spots.',
      },
      events: ['ExerciseDone'],
    },

    /* ── M5 · Become a Self-Expert ───────────────────────────────────────────────────────────── */
    {
      id: 'triggers', title: 'My triggers', book: { chapter: 5, exercise: '5.1' }, kind: 'build', skill: 'notice-trigger',
      fields: [
        { id: 'internal', type: 'check', label: 'Feelings and states', from: 'catalogs.triggers.internal', allowCustom: true },
        { id: 'people', type: 'check', label: 'People', from: 'catalogs.triggers.people', allowCustom: true, optional: true },
        { id: 'places', type: 'check', label: 'Places', from: 'catalogs.triggers.places', allowCustom: true, optional: true },
        { id: 'situations', type: 'check', label: 'Situations and times', from: 'catalogs.triggers.situations', allowCustom: true, optional: true },
        { id: 'things', type: 'check', label: 'Things', from: 'catalogs.triggers.things', allowCustom: true, optional: true },
        { id: 'frequent', type: 'check', label: 'Which ones come up most often?', options: triggerLabels, optional: true },
        { id: 'anger', type: 'check', label: 'Which ones tend to make you angry?', options: triggerLabels, optional: true },
      ],
      tutorial: {
        example: { cast: 'raj', values: {
          internal: ['Boredom', 'Stress'], people: ['Friends I used with'], places: ['My own room at night'],
          situations: ['After work or college', 'Late at night'], frequent: ['Boredom', 'After work or college'],
        } },
        hints: {
          internal: 'Feelings count as triggers too, good ones as well as hard ones.',
          frequent: 'Pick two or three. They show first when you log a craving.',
          anger: 'Optional. Lesson 9 comes back to these.',
        },
        built: 'Your Trigger Profile is saved. Your triggers now show as chips in every log.',
      },
      events: ['ArtifactSaved'],
    },
    {
      id: 'red-flags', title: 'My red-flag thoughts', book: { chapter: 5, exercise: '5.2' }, kind: 'build', skill: 'talk-back',
      fields: [
        { id: 'flags', type: 'check', label: 'Which of these thoughts show up for you?', from: 'catalogs.redFlags', allowCustom: true },
        { id: 'loudest', type: 'text', label: 'Which one is the loudest?' },
        { id: 'when', type: 'textarea', label: 'When does it usually show up?', optional: true },
      ],
      tutorial: {
        example: { cast: 'meera', values: {
          flags: ['Just one.', 'I deserve it after all this.', 'Nobody has to know.'],
          loudest: 'I deserve it after all this.',
          when: 'After a long day at the office, when the flat is empty.',
        } },
        hints: {
          flags: 'Add your own in your own words. They often sound like permission.',
          loudest: 'This is the first one to put on trial in Step 4.',
        },
        built: 'Your red-flag list is saved. Spotting the thought is half the work.',
      },
      events: ['ArtifactSaved'],
    },
    {
      id: 'trap-pairs', title: 'Thought and trap', book: { chapter: 5, exercise: '5.2b' }, kind: 'build', skill: 'spot-trap',
      fields: [
        { id: 'pairs', type: 'rows', label: 'A thought you had, the trap it fits, and a fairer way to say it', max: 6, columns: [
          { id: 'thought', label: 'The thought' }, { id: 'trap', label: 'The thinking trap' }, { id: 'fair', label: 'A fairer version' }] },
      ],
      tutorial: {
        example: { cast: 'kavita', values: {
          pairs: [
            { thought: 'The order went wrong, so I am useless at this', trap: 'Black-or-white thinking', fair: 'One order went wrong. Forty went right this month.' },
            { thought: 'My daughter did not call. She is ashamed of me.', trap: 'Jumping to conclusions', fair: 'She may just be busy. I can call her.' },
          ],
        } },
        hints: { pairs: 'The six traps are in the lesson. A thought can fit more than one.' },
        built: 'Saved. Naming the trap takes some of the power out of the thought.',
      },
      events: ['ArtifactSaved'],
    },
    {
      id: 'spiral', title: 'Stop the spiral', book: { chapter: 5, exercise: '5.2c' }, kind: 'build',
      fields: [
        { id: 'thoughts', type: 'check', label: 'Which thoughts could turn a slip into a spiral for you?', from: 'catalogs.spiral', allowCustom: true },
        { id: 'replies', type: 'list', label: 'Your answer to each one, in the same order', max: 7 },
      ],
      tutorial: {
        example: { cast: 'farhan', values: {
          thoughts: ['I\'ve blown it, so I might as well keep going.', 'This proves I can\'t do it.'],
          replies: ['One slip is one slip. I can stop here and call Bhai.', 'Seven months off says I can. A slip says I need my plan.'],
        } },
        hints: {
          thoughts: 'These thoughts show up after a slip. Writing answers now helps later.',
          replies: 'Write what you would say to a friend in the same place.',
        },
        built: 'Saved. If you ever tap "I slipped" in SOS, your own answers come first.',
      },
      events: ['ArtifactSaved'],
    },
    {
      id: 'craving-signature', title: 'My craving signature', book: { chapter: 5, exercise: '5.3' }, kind: 'build',
      fields: [
        { id: 'where', type: 'bodymap', label: 'Where do you notice a craving in your body?' },
        { id: 'body', type: 'check', label: 'What do you notice there?', from: 'catalogs.cravingBody', allowCustom: true, optional: true },
        { id: 'feelings', type: 'check', label: 'Feelings that come with it', from: 'catalogs.cravingEmotions', allowCustom: true, optional: true },
        { id: 'thoughts', type: 'check', label: 'Thoughts that come with it', from: 'catalogs.cravingThoughts', allowCustom: true, optional: true },
        { id: 'first', type: 'text', label: 'The very first sign, the earliest you notice' },
      ],
      tutorial: {
        example: { cast: 'dev', values: {
          where: ['chest', 'legs'], body: ['Racing heart', 'Restless legs'], feelings: ['Restless', 'Anxious'],
          first: 'I start pacing around my room before an exam',
        } },
        hints: {
          where: 'Tap each place. There is no right answer.',
          first: 'The earlier you spot it, the easier it is to ride it out.',
        },
        built: 'Your craving signature is saved. Notice the first sign, then reach for a tool.',
      },
      events: ['ArtifactSaved'],
    },

    /* ── M6 · Outsmart the Addicted Brain ────────────────────────────────────────────────────── */
    {
      id: 'trial', title: 'Put it on trial', book: { chapter: 6, exercise: '6.1' }, kind: 'tool', skill: 'trial',
      fields: [
        { id: 'mode', type: 'single', label: 'What kind of thought is it?', optional: true, options: [
          { id: 'redflag', label: 'A red-flag thought about using' }, { id: 'mood', label: 'A thought that pulls my mood down' }] },
        { id: 'thought', type: 'text', label: 'The thought, word for word' },
        { id: 'trap', type: 'single', label: 'Does it fall into a thinking trap?', from: 'catalogs.distortions', optional: true },
        { id: 'against', type: 'textarea', label: 'The evidence against it' },
        { id: 'thenWhat', type: 'textarea', label: 'And then what? Play the whole story forward.', optional: true },
        { id: 'comeback', type: 'text', label: 'Your closing statement: what you say back to it' },
      ],
      tutorial: {
        example: { cast: 'meera', values: {
          mode: 'redflag', thought: 'Just one glass won\'t hurt.',
          against: 'Last time one glass turned into the whole bottle and a missed morning at work.',
          thenWhat: 'One glass, then the second, then I wake up tired and ashamed.',
          comeback: 'One is never one for me. I want the clear morning more.',
        } },
        hints: {
          thought: 'Write it exactly as it sounds in your head.',
          against: 'Facts only: what has happened before, not what you hope.',
          comeback: 'Short enough to remember. It goes into your Comebacks.',
        },
        built: 'Your comeback is saved. SOS shows it when you tap Talk back.',
      },
      events: ['ExerciseDone'],
    },
    {
      id: 'cog-vs-beh', title: 'Thinking skills and doing skills', book: { chapter: 6, exercise: '6.r' }, kind: 'reflect',
      fields: [
        { id: 'thinking', type: 'textarea', label: 'Which thinking skills have helped you so far?' },
        { id: 'doing', type: 'textarea', label: 'Which doing skills have helped you so far?' },
        { id: 'lean', type: 'single', label: 'Which do you reach for first?', options: [
          { id: 'thinking', label: 'Thinking skills' }, { id: 'doing', label: 'Doing skills' }, { id: 'both', label: 'A mix of both' }] },
      ],
      tutorial: {
        example: { cast: 'raj', values: {
          thinking: 'Asking "and then what?" when I want to smoke after work.',
          doing: 'Going for a walk with my sister instead of sitting in my room.',
          lean: 'doing',
        } },
        hints: { lean: 'Neither is better. When a craving is strong, doing often works faster.' },
        built: 'Saved. Knowing your go-to skills helps you build your plan later.',
      },
      events: ['ExerciseDone'],
    },
    {
      id: 'distractions', title: 'My distraction list', book: { chapter: 6, exercise: '6.3b' }, kind: 'build', skill: 'distract',
      fields: [
        { id: 'distractions', type: 'check', label: 'Which of these could work for you?', from: 'catalogs.distractions', allowCustom: true },
        { id: 'own', type: 'list', label: 'Your own ideas', max: 6, optional: true },
      ],
      tutorial: {
        example: { cast: 'kavita', values: {
          distractions: ['Walk fast for ten minutes', 'Call someone, about anything', 'Cook something simple'],
          own: ['Water the tulsi and the chillies on the terrace'],
        } },
        hints: { distractions: 'Pick ones you can do at home, at work and at night.' },
        built: 'Your list is saved. SOS deals these out when you tap Distract me.',
      },
      events: ['ArtifactSaved'],
    },

    /* ── M7 · Be Present (each names its script in Content.practices) ────────────────────────── */
    {
      id: 'body-scan', title: 'Body scan', book: { chapter: 7, exercise: '7.1' }, kind: 'practice', skill: 'body-scan', practice: 'body-scan',
      fields: [
        { id: 'noticed', type: 'bodymap', label: 'Where did you notice tension or strong feeling?', optional: true },
        { id: 'note', type: 'textarea', label: 'Anything you noticed?', optional: true },
        rate,
      ],
      tutorial: {
        example: { cast: 'farhan', values: { noticed: ['back', 'shoulders'], note: 'My lower back was tight. It eased a little by the end.', helpful: 4 } },
        hints: { note: 'Noticing is the whole job. There is nothing to fix.' },
        built: 'Practice logged. A light goes on in the Cove.',
      },
      events: ['ExerciseDone'],
    },
    {
      id: 'breathing', title: 'Breathing with awareness', book: { chapter: 7, exercise: '7.3' }, kind: 'practice', skill: 'breathe', practice: 'breathe',
      fields: [
        { id: 'minutes', type: 'number', label: 'How many minutes did you sit?', min: 1, max: 60 },
        { id: 'note', type: 'textarea', label: 'What pulled your attention away?', optional: true },
        rate,
      ],
      tutorial: {
        example: { cast: 'meera', values: { minutes: 5, note: 'Work, mostly. I kept coming back to the breath.', helpful: 3 } },
        hints: {
          minutes: 'Start with five minutes. You can build up to thirty over time.',
          note: 'A wandering mind is normal. Coming back is the practice.',
        },
        built: 'Practice logged. Each time you come back to the breath, the skill grows.',
      },
      events: ['ExerciseDone'],
    },
    {
      id: 'everyday-mindful', title: 'Everyday mindfulness', book: { chapter: 7, exercise: '7.2' }, kind: 'practice', skill: 'everyday-mindful',
      fields: [
        { id: 'which', type: 'single', label: 'What did you do mindfully?', options: [
          { id: 'shower', label: 'A shower' }, { id: 'eating', label: 'Eating something' }, { id: 'walking', label: 'A walk' }] },
        { id: 'noticed', type: 'textarea', label: 'What did you notice that you usually miss?' },
        rate,
      ],
      tutorial: {
        example: { cast: 'kavita', values: { which: 'eating', noticed: 'The smell of the cardamom before the first sip of chai.', helpful: 4 } },
        hints: { noticed: 'Sounds, smells, textures, temperature. Small details count.' },
        built: 'Practice logged. Ordinary moments are good places to practise.',
      },
      events: ['ExerciseDone'],
    },
    {
      id: 'sober-practice', title: 'SOBER practice', book: { chapter: 7, exercise: '7.4' }, kind: 'practice', skill: 'sober', practice: 'sober',
      fields: [
        { id: 'when', type: 'single', label: 'When did you practise?', options: [
          { id: 'imagined', label: 'Calm, picturing a hard moment' }, { id: 'stress', label: 'When stressed' },
          { id: 'feeling', label: 'During a hard feeling' }, { id: 'craving', label: 'During a craving' }] },
        { id: 'noticed', type: 'textarea', label: 'What did you notice?', optional: true },
        rate,
      ],
      tutorial: {
        example: { cast: 'dev', values: { when: 'stress', noticed: 'My jaw was clenched. The craving was still there but smaller.', helpful: 4 } },
        hints: { when: 'Practise when calm first, so it is ready when things are hard.' },
        built: 'Practice logged. SOBER is also one tap away inside SOS.',
      },
      events: ['ExerciseDone'],
    },

    /* ── M8 · Rediscover Joy ─────────────────────────────────────────────────────────────────── */
    {
      id: 'used-to-enjoy', title: 'Things I used to enjoy', book: { chapter: 8, exercise: '8.0' }, kind: 'build',
      fields: [
        { id: 'enjoyed', type: 'list', label: 'Things you enjoyed before using took over', max: 10 },
        { id: 'again', type: 'text', label: 'Which one could you try again soon?', optional: true },
      ],
      tutorial: {
        example: { cast: 'raj', values: { enjoyed: ['Sunday cricket', 'Drawing', 'Cooking with my mother'], again: 'Sunday cricket' } },
        hints: { enjoyed: 'Go back as far as you like, even to childhood.' },
        built: 'Saved. These seed your Activity Library.',
      },
      events: ['ArtifactSaved'],
    },
    {
      id: 'should-want', title: 'Shoulds and want-tos', book: { chapter: 8, exercise: '8.2' }, kind: 'build',
      fields: [
        { id: 'shoulds', type: 'list', label: 'Things you should do in a usual week', max: 10 },
        { id: 'wants', type: 'list', label: 'Things you want to do in a usual week', max: 10 },
      ],
      tutorial: {
        example: { cast: 'meera', values: {
          shoulds: ['Office accounts', 'Groceries', 'Pay the electricity bill'],
          wants: ['Call my friend in Pune', 'Read on the balcony'],
        } },
        hints: { wants: 'If this list is short, that is useful to know. The next lessons help.' },
        built: 'Saved. A week with some want-tos in it is easier to stay sober in.',
      },
      events: ['ArtifactSaved'],
    },
    {
      id: 'activity-menu', title: 'My activity menu', book: { chapter: 8, exercise: '8.3' }, kind: 'build', skill: 'pleasant',
      fields: [
        { id: 'activities', type: 'check', label: 'Which of these would you enjoy?', options: activityOptions, allowCustom: true },
        { id: 'wantTos', type: 'list', label: 'Your own want-tos', max: 6, optional: true },
      ],
      tutorial: {
        example: { cast: 'kavita', values: {
          activities: ['A walk at dawn or dusk', 'Yoga or stretching'],
          wantTos: ['Teach my granddaughter to make thepla'],
        } },
        hints: { activities: 'Pick some that cost little and do not involve using.' },
        built: 'Your activity menu is saved. The planner suggests from it.',
      },
      events: ['ArtifactSaved'],
    },
    {
      id: 'obstacles', title: 'Get past an obstacle', book: { chapter: 8, exercise: '8.4b' }, kind: 'tool', skill: 'problem-solve',
      fields: [
        { id: 'obstacle', type: 'text', label: 'What gets in the way of doing things you enjoy?' },
        { id: 'options', type: 'rows', label: 'Ways around it, with the good and bad of each', max: 5, columns: [
          { id: 'option', label: 'A way around it' }, { id: 'pros', label: 'Good points' }, { id: 'cons', label: 'Drawbacks' }] },
        { id: 'pick', type: 'text', label: 'The one or two you will try' },
      ],
      tutorial: {
        example: { cast: 'dev', values: {
          obstacle: 'I am too tired after classes',
          options: [
            { option: 'Go in the morning instead', pros: 'More energy', cons: 'Early alarm' },
            { option: 'Pick something short', pros: 'Easy to start', cons: 'Less fun' },
          ],
          pick: 'A short badminton game before lunch',
        } },
        hints: { options: 'List every idea first. Judge them after.' },
        built: 'Done. Solving one obstacle makes the next one easier.',
      },
      events: ['ExerciseDone'],
    },
    {
      id: 'rewards', title: 'Rewards for follow-through', book: { chapter: 8, exercise: '8.7' }, kind: 'plan', skill: 'reward',
      fields: [
        { id: 'rewards', type: 'rows', label: 'When I do this, I reward myself with that', max: 3, columns: [
          { id: 'task', label: 'When I do this' }, { id: 'reward', label: 'I reward myself with' }] },
      ],
      tutorial: {
        example: { cast: 'farhan', values: {
          rewards: [{ task: 'Go to three NA meetings this week', reward: 'Biryani with my son on Sunday' }],
        } },
        hints: { rewards: 'Real, small, and nothing that involves using.' },
        built: 'Saved. Rewards make the new habits stick.',
      },
      events: ['ArtifactSaved'],
    },

    /* ── M9 · Handle Hard Feelings ───────────────────────────────────────────────────────────── */
    {
      id: 'anger-signature', title: 'When I get angry', book: { chapter: 9, exercise: '9.3b' }, kind: 'build', clinicalReview: true,
      fields: [
        { id: 'where', type: 'bodymap', label: 'Where do you feel anger in your body?' },
        { id: 'first', type: 'text', label: 'What do you notice first?' },
        { id: 'does', type: 'textarea', label: 'What do you tend to do when you are angry?', optional: true },
        { id: 'angerTriggers', type: 'list', label: 'What usually sets it off?', max: 5, optional: true },
      ],
      tutorial: {
        example: { cast: 'kavita', values: {
          where: ['head', 'hands'], first: 'My face gets hot and I talk faster',
          angerTriggers: ['Late payments from customers', 'Being told what to do'],
        } },
        hints: { first: 'The first sign is your cue to give it a beat.' },
        built: 'Your anger signature is saved. Anger is allowed; this helps you choose what comes next.',
      },
      events: ['ArtifactSaved'],
    },
    {
      id: 'rewrite-scene', title: 'Replay and rewrite', book: { chapter: 9, exercise: '9.5' }, kind: 'reflect', skill: 'beat', clinicalReview: true,
      fields: [
        { id: 'scene', type: 'textarea', label: 'What happened, in a few lines?' },
        { id: 'did', type: 'textarea', label: 'What did you do?' },
        { id: 'rewrite', type: 'textarea', label: 'What would you like to do next time?' },
      ],
      tutorial: {
        example: { cast: 'raj', values: {
          scene: 'My supervisor blamed me for a late order in front of the floor.',
          did: 'I shouted and walked out, then smoked behind the building.',
          rewrite: 'Take a beat, say I will talk after the shift, and walk round the block.',
        } },
        hints: { rewrite: 'Keep it doable. One small change is enough.' },
        built: 'Saved. Rehearsing a better ending makes it easier to find next time.',
      },
      events: ['ExerciseDone'],
    },

    /* ── M10 · Your Recovery Plan ────────────────────────────────────────────────────────────── */
    {
      id: 'warning-signs', title: 'My warning signs', book: { chapter: 10, exercise: '10.1' }, kind: 'build', skill: 'warning-check', clinicalReview: true,
      fields: [
        { id: 'signs', type: 'check', label: 'Which of these could be early warning signs for you?', from: 'catalogs.warningSigns' },
        { id: 'top', type: 'topN', label: 'Pick your top three and write a plan for each', source: 'signs', max: 3 },
      ],
      tutorial: {
        example: { cast: 'farhan', values: {
          signs: ['groups-less', 'isolating', 'poor-sleep'],
          top: [
            { item: 'groups-less', plan: 'Tell my sponsor and go twice that week' },
            { item: 'isolating', plan: 'Call my brother the same day' },
          ],
        } },
        hints: {
          signs: 'Think back: what changed in the weeks before a past slip?',
          top: 'A plan is one action you can take the same day.',
        },
        built: 'Your warning signs are saved. The Radar watches for them in your own logs.',
      },
      events: ['ArtifactSaved'],
    },
    {
      id: 'slip-review', title: 'Learn from a slip', book: { chapter: 10, exercise: '10.2' }, kind: 'reflect', skill: 'slip-review',
      sensitive: true, clinicalReview: true,
      fields: [
        { id: 'situation', type: 'textarea', label: 'Where were you, and who was there?', optional: true },
        { id: 'before', type: 'textarea', label: 'What came first: a thought, a feeling or a trigger?', optional: true },
        { id: 'next', type: 'textarea', label: 'What will you do differently next time?' },
        { id: 'support', type: 'list', label: 'Support you will ask for', max: 4, optional: true },
      ],
      tutorial: {
        example: { cast: 'meera', values: {
          before: 'A hard call with my mother, then the empty flat.',
          next: 'Call my sister before the evening, and keep no bottle at home.',
          support: ['Ask my sister to check in at 9 pm'],
        } },
        hints: {
          next: 'One thing you can change is enough.',
          support: 'If you feel unsafe, use SOS, Urgent help.',
        },
        built: 'Saved. Every day you built still counts.',
      },
      events: ['ExerciseDone'],
    },
  ];

  const list = Array.isArray(C_ex.exercises) ? C_ex.exercises : [];
  const have = new Set(list.map((x) => x && x.id));
  C_ex.exercises = list.concat(more.filter((x) => !have.has(x.id)));

  // Checkpoint questions for m4-m10: two each, one helpful reading, a why on every option.
  const cp = C_ex.exercises.find((x) => x && x.id === 'checkpoint');
  if (cp) Object.assign(cp.modules, {
    m4: [
      { q: 'Why clear alcohol or drugs out of your home?', options: [
        { t: 'Fewer cues means fewer cravings to fight', ok: true, why: 'Yes. Being smart about your space saves willpower for the hard moments.' },
        { t: 'To prove you are strong enough to resist', ok: false, why: 'Testing yourself is a risk you do not need. Smart beats strong.' }] },
      { q: 'A friend keeps offering. What usually works best?', options: [
        { t: 'A clear no, and asking them to stop offering', ok: true, why: 'Yes. Short and calm is enough. You do not owe a long reason.' },
        { t: 'Taking it so they do not feel bad', ok: false, why: 'Your recovery matters more than one awkward moment.' }] },
    ],
    m5: [
      { q: 'What is a red-flag thought?', options: [
        { t: 'A thought that gives you permission to use', ok: true, why: 'Yes. It often sounds reasonable, like "just one" or "I deserve it".' },
        { t: 'Any thought about the past', ok: false, why: 'Memories are not red flags by themselves. Red flags point you toward using.' }] },
      { q: 'Why log cravings?', options: [
        { t: 'To see your own patterns: times, places, feelings', ok: true, why: 'Yes. Patterns tell you where to plan ahead.' },
        { t: 'So the app can judge how you are doing', ok: false, why: 'The app never judges. The log is for you.' }] },
    ],
    m6: [
      { q: 'A craving hits. What does "delay" mean?', options: [
        { t: 'Wait 15 minutes before deciding anything', ok: true, why: 'Yes. Most cravings peak and fade if you give them time.' },
        { t: 'Use later instead of now', ok: false, why: 'Delay is not a promise to use. It gives the craving time to pass.' }] },
      { q: 'What is a Battle Plan for?', options: [
        { t: 'A risky situation you can see coming', ok: true, why: 'Yes. One plan and two backups, made in calm weather.' },
        { t: 'Something you write after a slip', ok: false, why: 'It works best before. After a slip, the slip review helps.' }] },
    ],
    m7: [
      { q: 'Your mind wanders during a breathing practice. What now?', options: [
        { t: 'Notice it and gently come back to the breath', ok: true, why: 'Yes. Coming back is the practice itself.' },
        { t: 'Stop, because you are doing it wrong', ok: false, why: 'Everyone\'s mind wanders. It is not a failure.' }] },
      { q: 'What does acceptance mean here?', options: [
        { t: 'Letting a feeling be there without acting on it', ok: true, why: 'Yes. You can notice a craving and still choose what you do.' },
        { t: 'Giving up and giving in', ok: false, why: 'Acceptance is not giving up. It makes room to choose.' }] },
    ],
    m8: [
      { q: 'Why plan things you enjoy?', options: [
        { t: 'A life with good things in it needs less escape', ok: true, why: 'Yes. Pleasant activity lifts mood and lowers cravings for many people.' },
        { t: 'To earn points', ok: false, why: 'The points are small. The real reward is a better week.' }] },
      { q: 'You predict a walk will be no fun. What can you do?', options: [
        { t: 'Try it and compare the prediction with what happened', ok: true, why: 'Yes. Early in recovery, low mood often predicts too low.' },
        { t: 'Skip it, since you already know', ok: false, why: 'Mood can mislead. A small test gives you real data.' }] },
    ],
    m9: [
      { q: 'Anger shows up. What is a good first step?', options: [
        { t: 'Give it a beat before you act', ok: true, why: 'Yes. A short pause lets you choose what comes next.' },
        { t: 'Push the feeling down', ok: false, why: 'Feelings are allowed. A pause helps you act on them well.' }] },
      { q: 'A low mood says "nothing will get better". What helps?', options: [
        { t: 'Treat it as a thought to put on trial', ok: true, why: 'Yes. Moods produce thoughts that feel like facts. You can check them.' },
        { t: 'Accept it as the truth', ok: false, why: 'A feeling is real, but what it predicts is not always true.' }] },
    ],
    m10: [
      { q: 'What is a warning sign?', options: [
        { t: 'A change that can come weeks before a slip', ok: true, why: 'Yes. Spotting it early gives you time to act.' },
        { t: 'Proof that a slip is coming', ok: false, why: 'A sign is a nudge to act, not a forecast.' }] },
      { q: 'After a slip, what does the app keep?', options: [
        { t: 'Everything: total days, skills, badges and your work', ok: true, why: 'Yes. Nothing you built is taken away.' },
        { t: 'Only what you did since the slip', ok: false, why: 'Nothing is wiped. Total days and everything you built stay.' }] },
    ],
  });
})();

if (typeof module !== 'undefined' && module.exports) module.exports = C_ex;
