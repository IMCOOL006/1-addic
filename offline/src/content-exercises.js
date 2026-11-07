/* 1-addic · CONTENT · exercises (BUILD-PLAN 3.8). An array of {id, title, book, kind, artifact?, repeat?, skill?,
   sensitive?, fields, tutorial:{example:{cast, values}, hints, built}, events}; field types are the 19 of
   ExerciseUI.FIELD_TYPES. Original wording throughout; `book` is metadata. U-31a: modules M0-M3 and the checkpoint.
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

if (typeof module !== 'undefined' && module.exports) module.exports = C_ex;
