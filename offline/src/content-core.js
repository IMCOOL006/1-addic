/* ════════════════════════════════════════════════════════════════════════════════════════════
   1-addic · offline edition · CONTENT (core)
   Catalogs, skills, game tables, features, tutorials, tips, help, references, resources, cast,
   glossary. Every word here is original. The source workbook's chapters appear only as metadata
   (`book: 5`), never as text. Later files (content-lessons-*.js, content-exercises.js,
   content-practices.js) add to this object.
   ════════════════════════════════════════════════════════════════════════════════════════════ */
const Content = {
  version: '1.0.0',
  build: '2026-11-07',
  appName: '1-addic',
  discreetName: 'Notebook',
  schemaVersion: 1,

  terms: [
    { id: 'sober', word: 'sober', days: 'sober days', adjective: 'sober' },
    { id: 'clean', word: 'clean', days: 'clean days', adjective: 'clean' },
    { id: 'free', word: 'substance-free', days: 'substance-free days', adjective: 'substance-free' },
    { id: 'recovery', word: 'in recovery', days: 'days in recovery', adjective: 'in recovery' },
  ],

  substances: [
    'Alcohol', 'Cannabis (ganja, charas, bhang)', 'Opioids (heroin, brown sugar, pain pills)',
    'Sleeping pills or benzodiazepines', 'Stimulants (meth, cocaine, "study pills")',
    'Cough syrup or codeine', 'Inhalants (glue, whitener, petrol)', 'Something else',
  ],

  stages: [
    { id: 'precontemplation', name: 'Not looking to change', gist: 'Other people are worried; you are not sure there is a problem.' },
    { id: 'contemplation', name: 'Thinking about it', gist: 'Part of you wants to change and part of you does not. Both are allowed here.' },
    { id: 'preparation', name: 'Getting ready', gist: 'You have decided, and you are planning how.' },
    { id: 'action', name: 'Doing it', gist: 'You have stopped, or are stopping, and you are working on it day by day.' },
    { id: 'maintenance', name: 'Keeping it going', gist: 'Six months or more of change. The work now is staying awake to risk.' },
  ],

  emotions: [
    { id: 'angry', name: 'Angry', tools: 'anger' },
    { id: 'sad', name: 'Sad or low', tools: 'low' },
    { id: 'anxious', name: 'Anxious or stressed', tools: 'low' },
    { id: 'lonely', name: 'Lonely', tools: 'low' },
    { id: 'bored', name: 'Bored or restless', tools: 'low' },
    { id: 'ashamed', name: 'Guilty or ashamed', tools: 'low' },
    { id: 'hopeless', name: 'Hopeless', tools: 'low', crisisCheck: true },
    { id: 'other', name: 'Something else', tools: 'low' },
  ],

  paces: [
    { id: 'gentle', name: 'Gentle', perWeek: 0.5, gist: 'One step every two weeks.' },
    { id: 'steady', name: 'Steady', perWeek: 1, gist: 'One step a week. The usual choice.' },
    { id: 'focused', name: 'Focused', perWeek: 2, gist: 'Two steps a week.' },
    { id: 'custom', name: 'Custom', perWeek: null, gist: 'You choose how many steps a week.' },
    { id: 'free', name: 'Free', perWeek: 0, gist: 'No weekly targets and no dates. Just the order and your progress.' },
  ],

  /* ── The harbor: six places, one per skill region (ADR 0006) ─────────────────────────────── */
  regions: {
    lighthouse: { name: 'The Lighthouse', title: 'Thinking clearly', blurb: 'Its beam cuts through fog. Grows when you put thoughts on trial, spot thinking traps and plan ahead.' },
    cove: { name: 'The Cove', title: 'Calm', blurb: 'Still water inside the breakwater. Grows with breathing, body scans, riding waves and giving anger a beat.' },
    garden: { name: 'The Garden', title: 'Joy', blurb: 'On the hill above the harbor. Grows only from real-world activity: things you enjoy, exercise, rewards you chose.' },
    pier: { name: 'The Pier', title: 'People', blurb: 'A lantern for every person in your crew. Grows when you reach out, speak up and show up.' },
    compass: { name: 'The Compass Rose', title: 'Motivation', blurb: 'Your reasons are the heading. Grows every time you check your motivation and remind yourself why.' },
    weather: { name: 'The Weather Station', title: 'Self-awareness', blurb: 'The logbook and the forecast. Grows with every honest log, check-in and warning sign noticed.' },
  },

  /* ── Skills (about 30), each in one region. `kind` feeds My Recovery Plan's sections. ───── */
  skills: [
    // Lighthouse: thinking clearly
    { id: 'trial', name: 'Put it on trial', region: 'lighthouse', kind: 'situation', book: 6 },
    { id: 'spot-trap', name: 'Spot a thinking trap', region: 'lighthouse', kind: 'situation', book: 5 },
    { id: 'talk-back', name: 'Talk back to a red-flag thought', region: 'lighthouse', kind: 'situation', book: 6 },
    { id: 'then-what', name: '"And then what?" (the whole story)', region: 'lighthouse', kind: 'situation', book: 6 },
    { id: 'distract', name: 'Distract early', region: 'lighthouse', kind: 'situation', book: 6 },
    { id: 'delay', name: 'Delay the decision 15 minutes', region: 'lighthouse', kind: 'situation', book: 6 },
    { id: 'leave', name: 'Leave the situation', region: 'lighthouse', kind: 'situation', book: 6 },
    { id: 'battle-plan', name: 'Make a Battle Plan', region: 'lighthouse', kind: 'wellness', book: 6 },
    { id: 'schedule', name: 'Plan the day', region: 'lighthouse', kind: 'wellness', book: 6 },
    { id: 'should-i-go', name: 'Check a small decision', region: 'lighthouse', kind: 'wellness', book: 4 },
    { id: 'problem-solve', name: 'Solve an obstacle', region: 'lighthouse', kind: 'wellness', book: 8 },
    // Cove: calm
    { id: 'sober', name: 'SOBER breathing', region: 'cove', kind: 'situation', book: 7 },
    { id: 'ride-wave', name: 'Ride the wave', region: 'cove', kind: 'situation', book: 6 },
    { id: 'breathe', name: 'Breathing with awareness', region: 'cove', kind: 'wellness', book: 7 },
    { id: 'body-scan', name: 'Body scan', region: 'cove', kind: 'wellness', book: 7 },
    { id: 'everyday-mindful', name: 'Everyday mindfulness', region: 'cove', kind: 'wellness', book: 7 },
    { id: 'accept', name: 'Mindful acceptance', region: 'cove', kind: 'mood', book: 7 },
    { id: 'beat', name: 'Give it a beat', region: 'cove', kind: 'mood', book: 9 },
    { id: 'self-kindness', name: 'Self-kindness', region: 'cove', kind: 'mood', book: 7 },
    // Garden: joy
    { id: 'pleasant', name: 'Do something you enjoy', region: 'garden', kind: 'wellness', book: 8 },
    { id: 'exercise', name: 'Move your body', region: 'garden', kind: 'wellness', book: 4 },
    { id: 'predict', name: 'Test a pleasure prediction', region: 'garden', kind: 'wellness', book: 8 },
    { id: 'reward', name: 'Reward follow-through', region: 'garden', kind: 'wellness', book: 8 },
    // Pier: people
    { id: 'call', name: 'Call or text a Safety Net', region: 'pier', kind: 'situation', book: 4 },
    { id: 'assert', name: 'Say it assertively', region: 'pier', kind: 'wellness', book: 4 },
    { id: 'refuse', name: 'Say no to an offer', region: 'pier', kind: 'situation', book: 4 },
    { id: 'reach-out', name: 'Reach out and grow your crew', region: 'pier', kind: 'wellness', book: 4 },
    { id: 'meeting', name: 'Go to a meeting or group', region: 'pier', kind: 'wellness', book: 4 },
    // Compass: motivation
    { id: 'reasons', name: 'Remind me why', region: 'compass', kind: 'motivation', book: 3 },
    { id: 'motivation-check', name: 'Check my motivation', region: 'compass', kind: 'motivation', book: 3 },
    { id: 'balance', name: 'Weigh both sides', region: 'compass', kind: 'motivation', book: 3 },
    // Weather Station: self-awareness
    { id: 'log-craving', name: 'Log a craving', region: 'weather', kind: 'situation', book: 5 },
    { id: 'log-feeling', name: 'Log a feeling', region: 'weather', kind: 'mood', book: 9 },
    { id: 'checkin', name: 'Daily check-in', region: 'weather', kind: 'wellness', book: 8 },
    { id: 'notice-trigger', name: 'Notice a trigger', region: 'weather', kind: 'situation', book: 5 },
    { id: 'warning-check', name: 'Check my warning signs', region: 'weather', kind: 'wellness', book: 10 },
    { id: 'slip-review', name: 'Learn from a slip', region: 'weather', kind: 'situation', book: 10 },
  ],

  /* ── XP (PLAN §6.4). Practice and honesty only; never claimed sober days. ────────────────── */
  xp: {
    LogCreated: 5, CheckinCompleted: 5, SkillUsed: 5, SosCompleted: 15, LessonCompleted: 10,
    ArtifactSaved: 20, BattlePlanCreated: 10, BattlePlanDebriefed: 15, ActivityDone: 10, ExerciseDone: 10,
    MindfulMinute: 1, WeeklyReviewCompleted: 25, SlipReviewed: 25, TutorialCompleted: 5,
    ExplorerCompleted: 25, CheckpointCompleted: 10,
    mindfulDailyCap: 20,
    /* identical logs on the same day: full XP for the first 3, half for 4-6, none after */
    repeatFull: 3, repeatHalf: 6,
    /* once-only events are deduplicated by their payload id */
    onceOnly: ['TutorialCompleted', 'ExplorerCompleted', 'CheckpointCompleted', 'LessonCompleted'],
  },
  masteryThresholds: [1, 3, 7, 15, 30],
  milestones: [1, 3, 7, 14, 30, 60, 90, 180, 365],

  ranks: [
    { id: 'explorer', name: 'Explorer', gist: 'You know your way around the app.', when: 'explorer' },
    { id: 'self-expert', name: 'Self-Expert', gist: 'You know your triggers, thoughts and cravings.', when: 'm5' },
    { id: 'strategist', name: 'Strategist', gist: 'You outsmart the addicted brain with plans and trials.', when: 'm6' },
    { id: 'navigator', name: 'Mindful Navigator', gist: 'You can stay present through a wave.', when: 'm7' },
    { id: 'builder', name: 'Builder', gist: 'You are building a life with joy and steadier moods.', when: 'm9' },
    { id: 'guide', name: 'Guide', gist: 'You have a plan you trust and you know how to use it.', when: 'm10' },
  ],

  badges: [
    { id: 'smart-not-strong', name: 'Be Smart, Not Strong', gist: 'You cleared the space.' },
    { id: 'first-wave', name: 'First Wave', gist: 'Your first urge surfed with SOS.' },
    { id: 'wave-rider-10', name: 'Wave Rider ×10', gist: 'Ten urges surfed.' },
    { id: 'wave-rider-50', name: 'Wave Rider ×50', gist: 'Fifty urges surfed.' },
    { id: 'self-expert', name: 'Self-Expert', gist: 'Trigger Profile and Red Flags built.' },
    { id: 'objection', name: 'Objection!', gist: 'Ten thoughts put on trial.' },
    { id: 'net-weaver', name: 'Safety Net Weaver', gist: 'Three Safety Nets in your crew.' },
    { id: 'said-it', name: 'Said It', gist: 'An assertive script used in real life.' },
    { id: 'mood-lies', name: 'Mood Lies', gist: 'An activity you enjoyed more than you predicted.' },
    { id: 'calm-core', name: 'Calm Core', gist: 'SOBER practised in all four situations.' },
    { id: 'planner', name: 'Planner', gist: 'Four Weekly Reviews done.' },
    { id: 'comeback', name: 'Comeback', gist: 'You looked a slip in the eye and learned from it. That takes courage.' },
    { id: 'graduate', name: 'Graduate', gist: 'My Recovery Plan built.' },
  ],

  /* ── Features and the progressive reveal (PLAN §5.10, ADR 0017) ─────────────────────────── */
  features: {
    workbook: { name: 'Workbook', gist: 'Your reasons, triggers, people and plans, all in one place.', tab: 'workbook' },
    roadmapPlan: { name: 'Roadmap plan view', gist: 'Your learning journey as a calendar.', tab: 'learn' },
    glossary: { name: 'Glossary', gist: 'Every term in plain words.', tab: 'learn' },
    motivation: { name: 'Motivation Meter', gist: 'Your motivation over time, with the "+1" question.', tab: 'workbook' },
    balance: { name: 'Decisional Balance', gist: 'Both sides of the decision, written down.', tab: 'workbook' },
    weeklyReview: { name: 'Weekly Review', gist: 'Five minutes to look back and plan the week ahead.', tab: 'actions' },
    network: { name: 'Support Network', gist: 'Safety Nets, risky people and your strategy for each.', tab: 'workbook' },
    scripts: { name: 'Scripts', gist: 'Words ready for hard conversations and offers.', tab: 'workbook' },
    quests: { name: 'Quests', gist: 'Short series of real-life actions.', tab: 'actions' },
    triggers: { name: 'Trigger Profile', gist: 'Your triggers, used as chips in every log.', tab: 'workbook' },
    redFlags: { name: 'Red Flags & Comebacks', gist: 'The addicted brain\'s lines, and your answers.', tab: 'workbook' },
    insights: { name: 'Insights', gist: 'Patterns from your own logs.', tab: 'track' },
    planner: { name: 'Planner', gist: 'Plan the day and see the risky gaps.', tab: 'actions' },
    battlePlans: { name: 'Battle Plans', gist: 'A plan and two backups for every high-risk situation.', tab: 'actions' },
    talkBack: { name: 'Talk back (in SOS)', gist: 'Your Comebacks, right when the thought shows up.', tab: 'sos' },
    training: { name: 'Training drills', gist: 'Practice runs with sample data.', tab: 'settings' },
    practices: { name: 'Guided practices', gist: 'Body scan, breathing, SOBER and more, read aloud.', tab: 'actions' },
    activities: { name: 'Activity Library', gist: 'Things you enjoy, with a risk check.', tab: 'workbook' },
    rewards: { name: 'Rewards', gist: 'Real-world rewards you chose, for following through.', tab: 'actions' },
    predictions: { name: 'Prediction Lab', gist: 'Predicted versus actual enjoyment.', tab: 'actions' },
    feelingTools: { name: 'Personal "I\'m feeling…" tools', gist: 'Your own anger and mood tools in SOS.', tab: 'sos' },
    recoveryPlan: { name: 'My Recovery Plan', gist: 'Your go-to skills, people and plans.', tab: 'workbook' },
    radar: { name: 'Warning Sign Radar', gist: 'Your top warning signs, watched from your own data.', tab: 'track' },
  },
  /* which module reveals which features; day-one features are always on */
  reveal: {
    always: ['sos', 'urgent', 'quicklog', 'checkin', 'reasons', 'learn', 'today'],
    m2: ['workbook', 'roadmapPlan', 'glossary'],
    m3: ['motivation', 'balance', 'weeklyReview'],
    m4: ['network', 'scripts', 'quests'],
    m5: ['triggers', 'redFlags', 'insights'],
    m6: ['planner', 'battlePlans', 'talkBack', 'training'],
    m7: ['practices'],
    m8: ['activities', 'rewards', 'predictions'],
    m9: ['feelingTools'],
    m10: ['recoveryPlan', 'radar'],
  },

  explorer: [
    { id: 'tour', label: 'Take the tour' },
    { id: 'drill', label: 'Do the SOS practice drill' },
    { id: 'reasons', label: 'Build your Reasons Card' },
    { id: 'safetyNet', label: 'Add a Safety Net' },
    { id: 'log', label: 'Log a craving or a feeling' },
    { id: 'checkin', label: 'Do an evening check-in' },
    { id: 'lesson', label: 'Finish your first lesson' },
    { id: 'workbook', label: 'Open your Workbook' },
    { id: 'plan', label: 'Plan tonight\'s free time' },
    { id: 'breathe', label: 'Try one breathing practice' },
    { id: 'wantTo', label: 'Schedule one want-to' },
    { id: 'pace', label: 'Set your Learning Roadmap pace' },
  ],

  quests: [
    { id: 'clear-space', name: 'Clear the Space', gist: 'Remove what pulls at you: the substance, the "stuff", the numbers.', book: 4, badge: 'smart-not-strong', steps: [
      { id: 'list', label: 'List what has to go (exercise 4.1)' }, { id: 'helper', label: 'Decide who helps you, or that you will do it alone' }, { id: 'done', label: 'Tick every item as it goes' } ] },
    { id: 'crew', name: 'Build Your Crew', gist: 'Three Safety Nets, two reach-outs, one meeting.', book: 4, steps: [
      { id: 'nets', label: 'Add three Safety Nets' }, { id: 'reach1', label: 'Reach out to someone (first time)' }, { id: 'reach2', label: 'Reach out again' }, { id: 'meeting', label: 'Try one meeting or group' } ] },
    { id: 'exercise', name: 'Try an Exercise', gist: 'Pick something you might enjoy, try it twice, reward yourself.', book: 4, steps: [
      { id: 'plan', label: 'Choose an activity and a day (exercise 4.2)' }, { id: 'do1', label: 'Do it once' }, { id: 'do2', label: 'Do it again' }, { id: 'reward', label: 'Give yourself the reward' } ] },
    { id: 'seven-days', name: '7-Day Activity Experiment', gist: 'Seven evening check-ins. Then look at what your days and your mood had to do with each other.', book: 8, steps: [
      { id: 'c1', label: 'Check-in 1' }, { id: 'c2', label: 'Check-in 2' }, { id: 'c3', label: 'Check-in 3' }, { id: 'c4', label: 'Check-in 4' }, { id: 'c5', label: 'Check-in 5' }, { id: 'c6', label: 'Check-in 6' }, { id: 'c7', label: 'Check-in 7' } ] },
    { id: 'sober-training', name: 'SOBER Training', gist: 'Four stages: an imagined situation, a stressful moment, a hard feeling, a real craving.', book: 7, badge: 'calm-core', steps: [
      { id: 'imagined', label: 'SOBER in an imagined situation' }, { id: 'stress', label: 'SOBER when stressed' }, { id: 'emotion', label: 'SOBER during a hard feeling' }, { id: 'craving', label: 'SOBER during a real craving' } ] },
    { id: 'everyday', name: 'Everyday Mindfulness', gist: 'A shower, a piece of fruit, a walk: three ordinary things, done awake.', book: 7, steps: [
      { id: 'shower', label: 'Mindful shower' }, { id: 'eating', label: 'Mindful eating' }, { id: 'walking', label: 'Mindful walk' } ] },
    { id: 'prediction-lab', name: 'Prediction Lab', gist: 'Five experiments: predict how much you will enjoy something, do it, compare.', book: 8, badge: 'mood-lies', steps: [
      { id: 'p1', label: 'Experiment 1' }, { id: 'p2', label: 'Experiment 2' }, { id: 'p3', label: 'Experiment 3' }, { id: 'p4', label: 'Experiment 4' }, { id: 'p5', label: 'Experiment 5' } ] },
    { id: 'scripts', name: 'Script Rehearsal', gist: 'Write one assertive script and rehearse saying no.', book: 4, steps: [
      { id: 'write', label: 'Write one script (exercise 4.5)' }, { id: 'rehearse', label: 'Finish one Refusal Rehearsal scene' } ] },
  ],

  /* ── Tutorials: content, not code (PLAN §5.10). target = [data-tour=…] on the live screen. ── */
  tutorials: [
    { id: 'tour', name: 'First-run tour', kind: 'tour', steps: [
      { target: 'nav-today', text: 'This is Today: your plan for the day, your check-in, and the next best step.' },
      { target: 'nav-learn', text: 'Learn is the journey: eleven short stops, each with a lesson and a real exercise.' },
      { target: 'nav-workbook', text: 'Workbook keeps what you build: your reasons, triggers, people and plans.' },
      { target: 'nav-track', text: 'Track is the logbook: cravings, feelings, check-ins, and the patterns in them.' },
      { target: 'nav-actions', text: 'Actions is the week: the planner, Battle Plans, quests and the Weekly Review.' },
      { target: 'sos-button', text: 'SOS is always here. Craving, hard feeling, slip or emergency: one tap, works offline.' },
    ] },
    { id: 'drill', name: 'SOS practice drill', kind: 'drill', steps: [] },
    { id: 'quicklog', name: 'Quick log', kind: 'jit', feature: 'quicklog', steps: [
      { target: 'quicklog-button', text: 'The plus button logs a craving or a feeling in under twenty seconds.' },
      { target: 'quicklog-intensity', text: 'Rate it, tap the chips that fit, and save. Nothing has to be perfect.' },
      { target: 'quicklog-save', text: 'Saving is the skill. Every honest log makes the Weather Station more useful.' },
    ] },
    { id: 'planner', name: 'Planner', kind: 'jit', feature: 'planner', steps: [
      { target: 'planner-day', text: 'Each block is a should, a want, a recovery activity, or risky.' },
      { target: 'planner-gaps', text: 'Empty evenings are where cravings like to live. The planner shows the gaps.' },
      { target: 'planner-add', text: 'Add tonight\'s free time now, and give it a want-to.' },
    ] },
    { id: 'battlePlans', name: 'Battle Plans', kind: 'jit', feature: 'battlePlans', steps: [
      { target: 'bp-new', text: 'A Battle Plan is for a high-risk situation you can see coming.' },
      { target: 'bp-form', text: 'One plan, two backups, a buddy and an exit. Winning means you planned and debriefed.' },
    ] },
    { id: 'workbook', name: 'Workbook', kind: 'jit', feature: 'workbook', steps: [
      { target: 'workbook-groups', text: 'Four groups: My Why, Know Myself, My People, My Joys. Plus My Recovery Plan at the end.' },
      { target: 'workbook-card', text: 'Tap any card to view, edit, see its history, or practise with it.' },
    ] },
    { id: 'insights', name: 'Insights', kind: 'jit', feature: 'insights', steps: [
      { target: 'insights-triggers', text: 'Your top triggers, from your own logs. Small numbers come with a caveat.' },
      { target: 'insights-heatmap', text: 'When cravings happen. These hours become the planner\'s suggestions.' },
    ] },
    { id: 'weeklyReview', name: 'Weekly Review', kind: 'jit', feature: 'weeklyReview', steps: [
      { target: 'review-start', text: 'Five minutes, once a week: look back, check the forecast, plan the risky moments ahead.' },
    ] },
    { id: 'recoveryPlan', name: 'My Recovery Plan', kind: 'jit', feature: 'recoveryPlan', steps: [
      { target: 'plan-sections', text: 'Pre-filled from what actually helped you. Edit and confirm each section.' },
      { target: 'plan-print', text: 'Print it, or save it as a PDF for your therapist or sponsor.' },
    ] },
  ],

  tips: [
    { id: 'talk-back', text: 'You can talk back to a red-flag thought. Try Put It On Trial.', route: '#/tools/trial', when: 'redFlagLogNoTrial' },
    { id: 'evening-plan', text: 'Evenings alone show up in your logs. Try planning tonight\'s free time.', route: '#/actions/planner', when: 'eveningCravings' },
    { id: 'reasons', text: 'Your Reasons Card is the first thing SOS shows. Give it a minute today.', route: '#/workbook/reasons', when: 'thinReasons' },
    { id: 'safety-net', text: 'A Safety Net is one tap away in SOS. Add a second person so there is always someone.', route: '#/workbook/network', when: 'oneSafetyNet' },
    { id: 'breathe', text: 'Two minutes of breathing with awareness counts as practice. Try it before bed.', route: '#/practice/breathe', when: 'noPractice' },
    { id: 'backup', text: 'Your data lives only in this browser. Export a backup from Settings → Your data.', route: '#/settings/data', when: 'noBackup' },
    { id: 'momentum', text: 'Momentum counts days you practised in the last 14. One small thing today keeps it moving.', route: '#/track', when: 'lowMomentum' },
    { id: 'want-to', text: 'One pleasant activity a day is the goal. Schedule a want-to for your riskiest hour.', route: '#/actions/planner', when: 'noWantTo' },
    { id: 'review', text: 'The Weekly Review takes five minutes and is the strongest habit in the book this is based on.', route: '#/actions/review', when: 'reviewDue' },
  ],

  help: [
    { q: 'How do I get help in a craving right now?', a: 'Tap SOS, then "I\'m craving". Rate it if you want, start the 15-minute wave, and pick a tool. Guide me runs the tools for you.', route: '#/sos' },
    { q: 'How do I find emergency and crisis numbers?', a: 'SOS → "I need urgent help". The numbers also sit on the lock screen, so they never need your PIN.', route: '#/sos/urgent' },
    { q: 'How do I log a craving or a feeling?', a: 'Tap the plus button on Track or Today. Pick Craving or Feeling, rate it, tap the chips, save.', route: '#/track' },
    { q: 'How do I do the evening check-in?', a: 'On Today after 5 pm the check-in card appears. Mood, peak craving, pleasant activities, sleep, and whether you used today.', route: '#/today' },
    { q: 'How do I build my Reasons Card?', a: 'Workbook → My Why → Reasons Card. Or do Step 1 in Learn, which builds it through the Decisional Balance.', route: '#/workbook/reasons' },
    { q: 'How do I add a Safety Net?', a: 'Workbook → My People → Support Network → Add person. Give them the role Safety Net and a number.', route: '#/workbook/network' },
    { q: 'How do I plan for a risky situation?', a: 'Actions → Battle Plans → New. Write the situation, your plan, two backups, a buddy and an exit.', route: '#/actions/battle' },
    { q: 'How do I put a thought on trial?', a: 'Actions → Tools → Put It On Trial, or from a logged red-flag thought. The closing statement is saved as a Comeback.', route: '#/tools/trial' },
    { q: 'How do I do the Weekly Review?', a: 'Actions → Weekly Review. Five short screens: last week, the forecast check, motivation, the week ahead, want-tos.', route: '#/actions/review' },
    { q: 'How do I back up my data?', a: 'Settings → Your data → Export backup. A .json file downloads. Keep it somewhere safe. Import it on any device.', route: '#/settings/data' },
    { q: 'How do I use this on my phone?', a: 'Copy 1-addic.html to the phone and open it in Chrome. Export a backup here and import it there; the phone keeps its own data.', route: '#/settings/data' },
    { q: 'How do I set or remove the PIN?', a: 'Settings → Privacy → App lock. With a PIN, your data is encrypted in the browser. Forgetting it means starting over from a backup.', route: '#/settings/privacy' },
    { q: 'How do I turn the harbor and points off?', a: 'Settings → Look → Calm mode. Everything keeps working; the game layer disappears.', route: '#/settings/look' },
    { q: 'How do I see what the techniques are based on?', a: 'Settings → About & evidence lists every technique with its sources, and every lesson wrap has a "Why this works" link.', route: '#/settings/about' },
    { q: 'How do I replay the tour or a tutorial?', a: 'Settings → Help & tutorials. Every tutorial and training drill can be replayed any time.', route: '#/settings/help' },
    { q: 'How do I share my plan with a therapist or sponsor?', a: 'Workbook → My Recovery Plan → Print / PDF. Or Settings → Your data → Print logs.', route: '#/workbook/plan' },
  ],

  /* ── Catalogs used by exercises, logs and SOS ────────────────────────────────────────────── */
  catalogs: {
    triggers: {
      internal: ['Feeling low', 'Loneliness', 'Happiness or celebration', 'Excitement', 'Stress', 'Irritability', 'Feeling overwhelmed', 'Jealousy', 'Anxiety', 'Boredom', 'Anger', 'Rejection', 'Frustration', 'Guilt or shame', 'Needing energy', 'Withdrawal feelings', 'Tiredness', 'Physical pain'],
      people: ['Friends I used with', 'Partner or spouse', 'Family', 'Coworkers or boss', 'A dealer or supplier', 'Old friends who still use'],
      places: ['Bars, clubs or "permit rooms"', 'A friend\'s house', 'Concerts or garba nights', 'Work or college', 'A particular street or corner', 'My own room at night', 'The car or scooter', 'Weddings and functions'],
      situations: ['Parties or meeting new people', 'Festivals and holidays', 'Home alone', 'Eating out', 'Before or during a date', 'Waking up', 'After work or college', 'Payday', 'After a fight', 'Late at night', 'Travelling for work'],
      things: ['Hidden stashes', 'Glasses, bottles or pipes', 'Rolling papers or foil', 'Pill strips', 'Money in hand', 'Phone numbers of people who supply', 'Certain songs or films'],
    },
    redFlags: [
      'I have to, there is no other way.', 'Nobody has to know.', 'It doesn\'t matter if I do.', 'I can control it this time.', 'Just one.',
      'Bad day. Might as well.', 'I deserve it after all this.', 'It\'s a special occasion. I\'ll start again tomorrow.',
      'Everyone else is doing it.', 'I\'ll never manage anyway.', 'This is the last time.', 'I\'ve been good all week.',
    ],
    spiral: [
      'One slip means I\'m a total failure.', 'I\'ve blown it, so I might as well keep going.', 'I\'m hopeless.', 'Once addicted, always addicted.',
      'I\'ll never get back to where I was.', 'Today is ruined anyway; I might as well go all out.', 'I have no willpower.', 'This proves I can\'t do it.',
    ],
    distortions: [
      { id: 'black-white', name: 'Black-or-white thinking', gist: 'All good or all bad, "always" or "never", nothing in between.', example: '"I messed up one thing at work, so the whole day is ruined."', leadsTo: '"Might as well drink."', reply: 'Not everything. One mistake, in one hour, that everyone makes. Drinking would make it the only mistake that matters.' },
      { id: 'discount', name: 'Discounting the positive', gist: 'Good things do not count; only the bad gets through the filter.', example: '"She only said well done because she felt sorry for me."', leadsTo: '"I\'m pathetic. Nothing to lose."', reply: 'A kind word is a kind word. One doubt does not erase what I did well, and I have a lot to lose.' },
      { id: 'conclusions', name: 'Jumping to conclusions', gist: 'Mind reading (I know what they think of me) or fortune telling (I know how this ends).', example: '"He didn\'t reply. He thinks I\'m a waste of time."', leadsTo: '"Why bother staying clean for people like that."', reply: 'I don\'t know why he didn\'t reply. Phones die, people get busy. I can ask instead of guessing.' },
      { id: 'feelings-facts', name: 'Feelings as facts', gist: 'If I feel it, it must be true.', example: '"I feel hopeless, so my situation is hopeless."', leadsTo: '"Using is the only thing that stops the pain."', reply: 'Feelings are weather. They are real, and they pass. Hopeless is how I feel at 11 pm; it is not a forecast.' },
      { id: 'self-blame', name: 'Self-blame', gist: 'Everything that goes wrong is my fault, including the addiction itself.', example: '"It\'s all my fault. I ruined everything."', leadsTo: '"I\'ve wrecked my life, so nothing matters now."', reply: 'Nobody chooses to become addicted. I am responsible for what I do next, and what I\'m doing next is this.' },
      { id: 'labeling', name: 'Labelling', gist: 'A feeling or a mistake becomes who I am.', example: '"I slipped, so I\'m a hopeless addict."', leadsTo: '"No point staying clean."', reply: 'I am a person with an illness, learning new responses. A slip is a thing that happened, not a name.' },
    ],
    cravingBody: ['Tight chest', 'Churning stomach', 'Clenched jaw', 'Tense neck or shoulders', 'Racing heart', 'Sweaty palms', 'Restless legs', 'Dry mouth', 'A taste or smell of it', 'Shaky hands', 'Headache'],
    cravingEmotions: ['Anxious', 'Excited', 'Anticipating', 'Restless', 'Irritable', 'Empty', 'The same feeling as when I used'],
    cravingThoughts: ['I need it.', 'I have to have it.', 'I\'ll go mad if I don\'t.', 'I can\'t handle this without it.', 'I can\'t get it out of my head.', 'Just this once.'],
    warningSigns: [
      { id: 'therapy-less', label: 'Cutting back on therapy or counselling' }, { id: 'secret-use', label: 'Working out how to use without anyone knowing' },
      { id: 'fantasy', label: 'Daydreaming about using and skipping the consequences' }, { id: 'groups-less', label: 'Going to fewer meetings or groups' },
      { id: 'isolating', label: 'Pulling away from people' }, { id: 'risky-places', label: 'Putting myself in risky situations' },
      { id: 'silent-doubts', label: 'Not talking about my doubts or mixed feelings' }, { id: 'other-substance', label: 'Starting to use something other than my main substance' },
      { id: 'intense-emotions', label: 'Strong low mood, anxiety, anger or irritability' }, { id: 'dont-fit', label: 'Feeling I don\'t fit in with others in recovery' },
      { id: 'blaming', label: 'Blaming other people for my problems' }, { id: 'few-fun', label: 'Very few enjoyable things in my week' },
      { id: 'poor-sleep', label: 'Poor or too little sleep' }, { id: 'neglect', label: 'Letting bills, chores, work or family slide' },
      { id: 'silent-unhappy', label: 'Not talking about being unhappy' }, { id: 'hopeless-rebuild', label: 'Feeling hopeless about rebuilding my life' },
      { id: 'keeping-stuff', label: 'Keeping alcohol, drugs or "stuff" at home' }, { id: 'keeping-numbers', label: 'Keeping the numbers of people who supply or use' },
      { id: 'lying', label: 'Lying' }, { id: 'rejecting-help', label: 'Turning down help' },
      { id: 'unstructured', label: 'Boredom and long stretches of empty time' }, { id: 'using-people', label: 'Spending time with people who use' },
      { id: 'defensive', label: 'Getting defensive when someone shows concern' },
    ],
    warningPlans: ['Tell my therapist or counsellor', 'Go to more meetings this week', 'Call my sponsor or a Safety Net today', 'Redo the motivation exercises', 'Put the thought on trial', 'Plan three want-tos for this week', 'Start or step up exercise', 'See a doctor about mood or anxiety', 'Clear the space again'],
    activities: [
      { cat: 'Outdoors', items: ['A walk at dawn or dusk', 'Cycling', 'A garden or terrace', 'The riverfront, lake or beach', 'A park bench with chai', 'Feeding birds or animals'] },
      { cat: 'Body', items: ['Exercise or gym', 'Yoga or stretching', 'Cricket, football or badminton', 'Swimming', 'Dancing', 'A long bath or shower'] },
      { cat: 'Making', items: ['Cooking or baking', 'Drawing or painting', 'Writing or journaling', 'Music: playing or singing', 'Photography', 'Fixing or building something', 'Rangoli, mehndi or craft'] },
      { cat: 'People', items: ['Calling someone', 'Coffee or chai with a friend', 'A family meal', 'Visiting someone', 'A video call', 'Volunteering', 'A class or workshop'] },
      { cat: 'Quiet', items: ['Reading', 'A film or series', 'Meditating or breathing', 'Prayer or temple, mosque, church or gurdwara', 'Puzzles or games', 'Organising photos', 'A nap in the afternoon'] },
      { cat: 'Out and about', items: ['Eating out', 'A market or mall', 'Cinema', 'A museum or exhibition', 'A day trip', 'A haircut or a massage', 'Bowling or a games arcade'] },
    ],
    distractions: ['Picture a big red STOP sign and hold it', 'Leave the room, the house, the situation', 'Walk fast for ten minutes', 'Call someone, about anything', 'Write for fifteen minutes', 'Cold water on your face and wrists', 'Go to a meeting or open a meeting online', 'Picture a quiet, safe place in detail', 'Clean one shelf or one drawer', 'Cook something simple', 'Play a game that needs both hands', 'Pray or chant'],
    reassuring: ['I can get through this.', 'I can handle this.', 'I can cope with whatever comes.', 'One day, one moment at a time.', 'I don\'t have to act on this feeling right now.', 'I have been here before and it passed.'],
    acceptance: ['This is how it is right now.', 'I don\'t like it, and I can tolerate it.', 'I won\'t judge this feeling. Maybe I can learn from it.', 'Accepting it is not the same as giving up.', 'Once I see things clearly, I can find the energy to change them.'],
    angerSelfTalk: ['I can keep my cool.', 'Staying in control is up to me.', 'I can get through this in a way I\'ll feel good about later.', 'I can only control my own behaviour.', 'Angry is allowed. Hurting someone, or myself, is not what I want.'],
    assertiveLine: 'I\'m upset, and I need some time to gather my thoughts.',
    slipSelfTalk: ['This is behind me as long as I don\'t repeat it.', 'A slip is a learning opportunity, not a verdict.', 'I\'ll feel bad for a while. That passes. I\'ll feel good about myself again once I\'m back on track.', 'How I respond now matters more than what just happened.'],
    safetyNetQualities: ['Not using', 'A good listener', 'Knows about addiction, or is willing to learn', 'Respectful', 'Non-judgmental', 'Trustworthy', 'Kind', 'Patient', 'Makes time for me', 'Reliable', 'Genuine', 'Protective of my recovery'],
    refusal: ['A clear "No, thank you", with eye contact', 'Ask for something else ("Do you have nimbu pani?")', 'Suggest a different activity', 'Change the subject', 'Ask them to stop offering ("I\'ve stopped. Please don\'t offer.")', 'Say to yourself why your recovery matters', 'Leave if the offers continue'],
    sid: ['Notice: this small choice matters', 'List every option, including the boring ones', 'Weigh the risk and the benefit of each', 'Pick the most protective one', 'If you still choose the risky one, decide your exit plan and who you will call'],
    programQuestions: ['Is the treatment evidence-based?', 'Which therapies do you use? (Look for CBT, motivational interviewing, incentives.)', 'Do you prescribe medication where it helps?', 'What other services are there: psychiatric care, medical detox, family support, help with work?', 'What happens after the programme ends?', 'Is there drug or alcohol testing, and what happens after a positive result?', 'How long does it run? (Three months or more is common.)', 'Is a 12-step or other mutual-help group part of it?'],
    medications: [
      { name: 'Naltrexone', usedFor: 'Alcohol, opioids', how: 'Blocks the pleasant effects and reduces cravings.' },
      { name: 'Acamprosate', usedFor: 'Alcohol', how: 'Reduces cravings.' },
      { name: 'Disulfiram', usedFor: 'Alcohol', how: 'Causes an unpleasant reaction if you drink.' },
      { name: 'Methadone', usedFor: 'Opioids', how: 'Replaces the opioid to stop withdrawal and cravings.' },
      { name: 'Buprenorphine', usedFor: 'Opioids', how: 'Reduces cravings and blocks the high.' },
    ],
    symptoms: [
      { group: 'Tolerance', items: ['I need more to get the same effect', 'The same amount does less than it used to'] },
      { group: 'Withdrawal', items: ['I feel physically or emotionally rough without it', 'I have used something to ease coming down'] },
      { group: 'Craving', items: ['I think about it a lot', 'It is hard to get it out of my head until I act'] },
      { group: 'Control', items: ['I broke my own limits', 'I tried to cut down or stop and could not', 'I used more, or for longer, than I planned', 'I used when upset or angry', 'I have had blackouts', 'I have overdosed or used something unknown', 'I get anxious about running out'] },
      { group: 'Consequences', items: ['Legal trouble, or taking money that was not mine', 'Mistakes at work or college', 'Hurt relationships', 'Let down chores, money, caregiving or work', 'Lost interest in hobbies or people', 'Kept using despite problems it caused', 'Looked after myself less', 'It caused or worsened a health or mood problem'] },
    ],
    riskFactors: ['A family member with addiction', 'Depression, anxiety, PTSD or another mental health condition', 'Parents or role models who used heavily', 'Role models who broke the law regularly', 'Teenage friends who used', 'Trouble at school', 'Trouble fitting in or making friends', 'Chaos or conflict at home', 'Physical or sexual abuse', 'Started as a child or young teen', 'Smoked or injected drugs', 'Trauma before heavy use began'],
    depressionSymptoms: ['Sadness most of the day', 'Nothing feels enjoyable', 'Crying spells', 'Low energy', 'Restlessness', 'Sleeping too little or too much', 'Appetite changes', 'Poor concentration', 'Small decisions feel impossible', 'Feeling worthless', 'Feeling hopeless', 'Thoughts of death or suicide'],
    checkinIntentions: ['Stay close to my people today', 'One pleasant thing, on purpose', 'Notice the first red flag, not the fifth', 'Call before I decide', 'Be smart, not strong'],
  },

  /* ── Evidence (docs/evidence-references.md). Claims are stated no more strongly than the source. */
  references: [
    { id: 'R1', claim: 'Triggers, high-risk situations, small "irrelevant" decisions, urge surfing and the idea that a slip need not become a relapse come from relapse prevention, the CBT approach developed by Alan Marlatt and colleagues.', cite: 'Marlatt GA, Gordon JR (eds). Relapse Prevention: Maintenance Strategies in the Treatment of Addictive Behaviors. Guilford Press; 1985.', type: 'Foundational book', usedBy: ['m4', 'm5', 'm6', 'sos'] },
    { id: 'R2', claim: 'The updated relapse prevention model, including coping skills and self-efficacy in high-risk situations.', cite: 'Marlatt GA, Donovan DM (eds). Relapse Prevention. 2nd ed. Guilford Press; 2005.', type: 'Book', usedBy: ['m5', 'm6', 'm10'] },
    { id: 'R3', claim: 'Relapse is a process with warning signs, not a single event, and planning for high-risk situations lowers the risk.', cite: 'Witkiewitz K, Marlatt GA. Relapse prevention for alcohol and drug problems: That was Zen, this is Tao. American Psychologist. 2004;59(4):224–235.', doi: '10.1037/0003-066X.59.4.224', type: 'Review', usedBy: ['m10', 'radar', 'battlePlans'] },
    { id: 'R4', claim: 'How you interpret a slip ("I\'ve blown it") shapes whether it turns into a relapse: the abstinence violation effect, which this app calls the spiral.', cite: 'Curry S, Marlatt GA, Gordon JR. Abstinence violation effect: Validation of an attributional construct with smoking cessation. Journal of Consulting and Clinical Psychology. 1987;55(2):145–149.', doi: '10.1037/0022-006X.55.2.145', type: 'Study', usedBy: ['m5', 'slip'] },
    { id: 'R5', claim: 'Across 53 randomized trials, CBT produced a small but reliable reduction in alcohol and drug use, strongest for cannabis.', cite: 'Magill M, Ray LA. Cognitive-behavioral treatment with adult alcohol and illicit drug users: A meta-analysis of randomized controlled trials. Journal of Studies on Alcohol and Drugs. 2009;70(4):516–527.', doi: '10.15288/jsad.2009.70.516', type: 'Meta-analysis', usedBy: ['m5', 'm6'] },
    { id: 'R6', claim: 'A 2019 analysis of 30 randomized trials confirmed CBT\'s benefit over minimal treatment; against other active therapies the differences were small or not significant.', cite: 'Magill M, Ray L, Kiluk B, et al. A meta-analysis of cognitive-behavioral therapy for alcohol or other drug use disorders: Treatment efficacy by contrast condition. Journal of Consulting and Clinical Psychology. 2019;87(12):1093–1105.', doi: '10.1037/ccp0000447', type: 'Meta-analysis', usedBy: ['m5', 'm6'] },
    { id: 'R7', claim: 'Putting thoughts on trial and spotting thinking traps are cognitive therapy techniques adapted for addiction.', cite: 'Beck AT, Wright FD, Newman CF, Liese BS. Cognitive Therapy of Substance Abuse. Guilford Press; 1993.', type: 'Book', usedBy: ['m5', 'm6', 'm9'] },
    { id: 'R8', claim: 'Mixed feelings about change are normal, and motivation grows when people voice their own reasons rather than being told.', cite: 'Miller WR, Rollnick S. Motivational Interviewing: Helping People Change. 3rd ed. Guilford Press; 2013.', type: 'Book', usedBy: ['onboarding', 'm3'] },
    { id: 'R9', claim: 'People move through stages of change (precontemplation, contemplation, preparation, action, maintenance) and can move back and forth.', cite: 'Prochaska JO, DiClemente CC. Stages and processes of self-change of smoking: Toward an integrative model of change. Journal of Consulting and Clinical Psychology. 1983;51(3):390–395.', doi: '10.1037/0022-006X.51.3.390', type: 'Study and theory', usedBy: ['onboarding', 'm3', 'roadmap'] },
    { id: 'R10', claim: 'Motivational interviewing reduces substance use more than no treatment; whether it beats other treatments is unclear.', cite: 'Smedslund G, Berg RC, Hammerstrøm KT, et al. Motivational interviewing for substance abuse. Cochrane Database of Systematic Reviews. 2011;(5):CD008063; updated 2023 (CD008063.pub3).', doi: '10.1002/14651858.CD008063.pub2', type: 'Cochrane review', usedBy: ['m3'] },
    { id: 'R11', claim: 'Believing you can succeed (self-efficacy) predicts behaviour change.', cite: 'Bandura A. Self-efficacy: Toward a unifying theory of behavioral change. Psychological Review. 1977;84(2):191–215.', doi: '10.1037/0033-295X.84.2.191', type: 'Theory', usedBy: ['m3', 'mastery'] },
    { id: 'R12', claim: 'SOBER breathing, riding an urge with the breath, and accepting discomfort without acting on it come from mindfulness-based relapse prevention (MBRP).', cite: 'Bowen S, Chawla N, Marlatt GA. Mindfulness-Based Relapse Prevention for Addictive Behaviors: A Clinician\'s Guide. Guilford Press; 2011 (2nd ed. with Grow J; 2021).', type: 'Treatment manual', usedBy: ['m7', 'sos'] },
    { id: 'R13', claim: 'In a randomized trial of 286 people, MBRP led to fewer drug-use days and less heavy drinking at 12 months than usual aftercare.', cite: 'Bowen S, Witkiewitz K, Clifasefi SL, et al. Relative efficacy of mindfulness-based relapse prevention, standard relapse prevention, and treatment as usual for substance use disorders: A randomized clinical trial. JAMA Psychiatry. 2014;71(5):547–556.', doi: '10.1001/jamapsychiatry.2013.4546', type: 'Randomized trial', usedBy: ['m7', 'sos'] },
    { id: 'R14', claim: 'Mindfulness means paying attention on purpose, in the present moment, without judgment.', cite: 'Kabat-Zinn J. Full Catastrophe Living. Delacorte; 1990 (revised ed. Bantam; 2013).', type: 'Book', usedBy: ['m7'] },
    { id: 'R15', claim: 'Scheduling activities (behavioural activation) on its own worked as well as full cognitive therapy for depression.', cite: 'Jacobson NS, Dobson KS, Truax PA, et al. A component analysis of cognitive-behavioral treatment for depression. Journal of Consulting and Clinical Psychology. 1996;64(2):295–304.', doi: '10.1037/0022-006X.64.2.295', type: 'Randomized trial', usedBy: ['m8', 'm9'] },
    { id: 'R16', claim: 'A brief behavioural activation treatment improved depression in people in drug treatment (a small randomized pilot of 44 people).', cite: 'Daughters SB, Braun AR, Sargeant MN, et al. Effectiveness of a brief behavioral treatment for inner-city illicit drug users with elevated depressive symptoms: The Life Enhancement Treatment for Substance Use (LETS Act!). Journal of Clinical Psychiatry. 2008;69(1):122–129.', type: 'Pilot randomized trial', usedBy: ['m8', 'm9'] },
    { id: 'R17', claim: 'The source workbook cites this study for its finding that involvement in a wide range of enjoyable, drug-free activities predicted staying sober, whichever treatment people had.', cite: 'Farabee D, Rawson R, McCann M. Adoption of drug avoidance activities among patients in contingency management and cognitive-behavioral treatments. Journal of Substance Abuse Treatment. 2002;23(4):343–350.', type: 'Study', usedBy: ['m8', 'activities', 'game'] },
    { id: 'R18', claim: 'Rebuilding a rewarding life (work, family, friends, leisure) reduced drinking: the community reinforcement approach.', cite: 'Hunt GM, Azrin NH. A community-reinforcement approach to alcoholism. Behaviour Research and Therapy. 1973;11(1):91–104.', doi: '10.1016/0005-7967(73)90072-7', type: 'Study', usedBy: ['m4', 'm8'] },
    { id: 'R19', claim: 'Rewarding verified abstinence (contingency management) helps people stop using. This app rewards practice instead, because it cannot verify abstinence.', cite: 'Higgins ST, Delaney DD, Budney AJ, et al. A behavioral approach to achieving initial cocaine abstinence. American Journal of Psychiatry. 1991;148(9):1218–1224.', doi: '10.1176/ajp.148.9.1218', type: 'Study', usedBy: ['game'] },
    { id: 'R20', claim: 'Across 47 comparisons, contingency management had a moderate effect on abstinence, larger for opioids and cocaine.', cite: 'Prendergast M, Podus D, Finney J, Greenwell L, Roll J. Contingency management for treatment of substance use disorders: A meta-analysis. Addiction. 2006;101(11):1546–1560.', doi: '10.1111/j.1360-0443.2006.01581.x', type: 'Meta-analysis', usedBy: ['game'] },
    { id: 'R21', claim: 'The Matrix Model (the source of "be smart, not strong") combines CBT, motivational and family elements; in a large trial, people attended more sessions and had longer abstinence during treatment than with usual care.', cite: 'Rawson RA, Marinelli-Casey P, Anglin MD, et al. A multi-site comparison of psychosocial approaches for the treatment of methamphetamine dependence. Addiction. 2004;99(6):708–717.', doi: '10.1111/j.1360-0443.2004.00707.x', type: 'Randomized trial', usedBy: ['m4'] },
    { id: 'R22', claim: 'A 2020 Cochrane review (27 studies, 10,565 people) found that AA and 12-step facilitation increase abstinence at least as much as other treatments, at lower cost.', cite: 'Kelly JF, Humphreys K, Ferri M. Alcoholics Anonymous and other 12-step programs for alcohol use disorder. Cochrane Database of Systematic Reviews. 2020;3:CD012880.', doi: '10.1002/14651858.CD012880.pub2', type: 'Cochrane review', usedBy: ['m4', 'resources'] },
    { id: 'R23', claim: 'Relapse rates in addiction (40–60%) are similar to those in other chronic illnesses; a lapse means the plan needs adjusting, not that treatment failed.', cite: 'McLellan AT, Lewis DC, O\'Brien CP, Kleber HD. Drug dependence, a chronic medical illness: Implications for treatment, insurance, and outcomes evaluation. JAMA. 2000;284(13):1689–1695.', doi: '10.1001/jama.284.13.1689', type: 'Review', usedBy: ['m2', 'm5', 'slip'] },
    { id: 'R24', claim: 'In a small imaging study, dopamine function partly recovered after 12 to 17 months of abstinence: the brain heals.', cite: 'Volkow ND, Chang L, Wang GJ, et al. Loss of dopamine transporters in methamphetamine abusers recovers with protracted abstinence. Journal of Neuroscience. 2001;21(23):9414–9418.', doi: '10.1523/JNEUROSCI.21-23-09414.2001', type: 'Imaging study (5 people)', usedBy: ['m2'] },
    { id: 'R25', claim: 'Across 22 randomized trials, exercise raised abstinence rates and eased withdrawal, anxiety and depression.', cite: 'Wang D, Wang Y, Wang Y, Li R, Zhou C. Impact of physical exercise on substance use disorders: A meta-analysis. PLoS ONE. 2014;9(10):e110728.', doi: '10.1371/journal.pone.0110728', type: 'Meta-analysis', usedBy: ['m4'] },
    { id: 'R26', claim: 'An exercise programme during residential treatment was studied for its effect on depression and anxiety in people recovering from methamphetamine use.', cite: 'Rawson RA, Chudzynski J, Gonzales R, et al. The impact of exercise on depression and anxiety symptoms among abstinent methamphetamine-dependent individuals in a residential treatment setting. Journal of Substance Abuse Treatment. 2015;57:36–40.', doi: '10.1016/j.jsat.2015.04.007', type: 'Trial', usedBy: ['m4'] },
    { id: 'R27', claim: '150 minutes of moderate activity a week plus strength training twice a week.', cite: 'U.S. Department of Health and Human Services. Physical Activity Guidelines for Americans. 2nd ed. 2018.', url: 'https://health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines', type: 'Guideline', usedBy: ['m4'] },
    { id: 'R28', claim: 'Addiction is a treatable condition; medication plus behavioural therapy works best for many people; returning to use does not mean treatment failed.', cite: 'National Institute on Drug Abuse. Principles of Drug Addiction Treatment: A Research-Based Guide. 3rd ed. 2018; and Drugs, Brains, and Behavior: The Science of Addiction.', url: 'https://nida.nih.gov', type: 'Guideline', usedBy: ['m1', 'm2', 'resources'] },
    { id: 'R29', claim: 'Motivation lasts when people feel autonomy, competence and relatedness (self-determination theory), which the game design is built on.', cite: 'Deci EL, Ryan RM. The "what" and "why" of goal pursuits: Human needs and the self-determination of behavior. Psychological Inquiry. 2000;11(4):227–268.', doi: '10.1207/S15327965PLI1104_01', type: 'Theory', usedBy: ['game'] },
    { id: 'R30', claim: 'Gamification can help health behaviours, but the evidence is modest and mixed, so the game stays gentle and can be switched off.', cite: 'Johnson D, Deterding S, Kuhn KA, Staneva A, Stoyanov S, Hides L. Gamification for health and wellbeing: A systematic review of the literature. Internet Interventions. 2016;6:89–106.', doi: '10.1016/j.invent.2016.10.002', type: 'Systematic review', usedBy: ['game'] },
    { id: 'R31', claim: 'Mental health conditions are common alongside addiction, which is why persistent low mood gets a gentle nudge toward professional help.', cite: 'Regier DA, Farmer ME, Rae DS, et al. Comorbidity of mental disorders with alcohol and other drug abuse: Results from the Epidemiologic Catchment Area (ECA) Study. JAMA. 1990;264(19):2511–2518.', doi: '10.1001/jama.1990.03450190043026', type: 'Epidemiological study', usedBy: ['m9'] },
    { id: 'R32', claim: 'The seven-step structure follows this workbook, which combines CBT, mindfulness and motivational interviewing. Its text is not used.', cite: 'Glasner-Edwards S. The Addiction Recovery Skills Workbook: Changing Addictive Behaviors Using CBT, Mindfulness, and Motivational Interviewing Techniques. New Harbinger; 2015. ISBN 978-1-62625-278-3.', type: 'Source workbook', usedBy: ['everything'] },
  ],

  /* ── Resources. Every number and link is a candidate to VERIFY (ADR 0010, owner input I6). ── */
  resources: {
    in: {
      name: 'India', verifyNote: 'These numbers were collected from public sources in October 2026 and have not yet been verified by the owner. Check each one before you rely on it.',
      emergency: [
        { name: 'Emergency (police, ambulance, fire)', number: '112', note: 'National emergency number', verify: true },
        { name: 'Ambulance', number: '108', note: 'In many states, including Gujarat', verify: true },
      ],
      crisis: [
        { name: 'Tele-MANAS (mental health helpline, 24×7)', number: '14416', alt: '1800-891-4416', note: 'Government of India; many languages including Gujarati', verify: true },
        { name: 'KIRAN mental health helpline (24×7)', number: '1800-599-0019', note: 'Ministry of Social Justice', verify: true },
        { name: 'Nasha Mukti national drug de-addiction helpline', number: '14446', note: 'Toll-free; information on de-addiction centres', verify: true },
        { name: 'Vandrevala Foundation (24×7)', number: '1860-2662-345', alt: '+91 9999 666 555', note: 'Free counselling, also on WhatsApp', verify: true },
        { name: 'Poison information (AIIMS National Poisons Information Centre)', number: '1800-116-117', alt: '011-2658-9391', note: '24×7', verify: true },
      ],
      groups: [
        { name: 'Alcoholics Anonymous India', url: 'https://aagsoindia.org', note: 'Meeting finder, including Gujarat', verify: true },
        { name: 'Narcotics Anonymous India', url: 'https://www.naindia.in', note: 'Meetings and online meetings', verify: true },
        { name: 'SMART Recovery (online meetings)', url: 'https://smartrecovery.org', note: 'CBT-based, non-spiritual', verify: true },
      ],
      treatment: [
        { name: 'Government de-addiction centres (IRCAs), Ministry of Social Justice', url: 'https://nmba.dosje.gov.in', note: 'Directory of funded centres by state', verify: true },
        { name: 'Hospital for Mental Health, Ahmedabad', note: 'Government hospital with a de-addiction unit', verify: true },
        { name: 'District hospitals and civil hospitals', note: 'Ask for the psychiatry or de-addiction OPD', verify: true },
      ],
      context: 'Gujarat has alcohol prohibition, so drinking is illegal there and people often hide it. That is one more reason this app keeps everything on your device. The helplines are confidential. If you are worried about the law, say so to a counsellor; they have heard it before.',
    },
    intl: {
      name: 'Elsewhere',
      lines: [
        { name: 'Find a Helpline (directory by country)', url: 'https://findahelpline.com', verify: true },
        { name: 'Befrienders Worldwide (directory)', url: 'https://befrienders.org', verify: true },
        { name: 'Your local emergency number', note: 'Usually 112, 911 or 999', verify: true },
      ],
    },
    overdose: [
      'Call the emergency number first. Say "overdose", the substance if you know it, and the address.',
      'If the person is not breathing or is unresponsive, follow the operator\'s instructions. If you have naloxone and opioids are involved, use it.',
      'Lay an unconscious person on their side so they do not choke.',
      'Stay with them. Do not let them "sleep it off" alone.',
      'After a break from opioids, tolerance drops. The same old amount can kill. Never use alone, and never use an unknown source.',
    ],
    withdrawal: [
      'Stopping heavy daily drinking suddenly can cause seizures or delirium. Stopping sleeping pills or benzodiazepines suddenly can too.',
      'If you drink heavily every day, or take sedatives every day, talk to a doctor about stopping safely. Many hospitals have a detox unit.',
      'Shaking, sweating, confusion, hallucinations or a seizure after stopping are emergencies: call the emergency number.',
    ],
  },

  /* ── The cast: original composite characters rooted in Gujarat (ADR 0002, 0010) ─────────── */
  cast: {
    meera: { name: 'Meera', age: 34, city: 'Ahmedabad', substance: 'alcohol', stage: 'action', pronoun: 'she', bio: 'Runs the office of a school. Her husband works night shifts; the empty flat after nine was where the bottle lived. Three weeks in.' },
    raj: { name: 'Raj', age: 27, city: 'Surat', substance: 'cannabis', stage: 'contemplation', pronoun: 'he', bio: 'Supervises a floor in a diamond-polishing unit. Has smoked every evening since college and is not sure it is a problem. His sister thinks it is.' },
    farhan: { name: 'Farhan', age: 41, city: 'Vadodara', substance: 'opioid pain pills', stage: 'maintenance', pronoun: 'he', bio: 'Hurt his back on a construction site and the pills outlasted the pain. Seven months off, goes to NA, worries about getting complacent.' },
    kavita: { name: 'Kavita', age: 52, city: 'Rajkot', substance: 'alcohol', stage: 'action', pronoun: 'she', bio: 'Runs a tiffin service from her kitchen. Started drinking after her husband died; anger and grief arrive together. Six weeks in.' },
    dev: { name: 'Dev', age: 23, city: 'Gandhinagar', substance: 'stimulant "study pills"', stage: 'action', pronoun: 'he', bio: 'Borrowed a pill for exams in second year and kept going. Two months off, back at college, scared of the next exam season.' },
  },

  glossary: [
    { term: 'Addicted brain', def: 'The fast, conditioned part of you that wants the substance and finds reasons for it. It speaks in red-flag thoughts.' },
    { term: 'Rational brain', def: 'The part of you that weighs things up and chooses. Practice makes it stronger. In this app it is your companion.' },
    { term: 'Trigger', def: 'Anything that starts the chain toward using: a feeling inside you, or a person, place, situation or thing around you.' },
    { term: 'The chain', def: 'Trigger → thought → craving → use. Noticing any link gives you a place to step out.' },
    { term: 'Red-flag thought', def: 'A thought that gives you permission to use. "Just one." "Nobody has to know."' },
    { term: 'Thinking trap', def: 'One of six common distortions that produce bad feelings, which then produce red-flag thoughts.' },
    { term: 'Craving', def: 'A strong wish to use, felt in the body, in emotions and in thoughts. Most pass in about fifteen minutes.' },
    { term: 'Ride the wave', def: 'Let a craving rise, peak and fall without acting on it. Also called urge surfing.' },
    { term: 'SOBER', def: 'Stop · Observe · Breathe · Expand · Respond. A one-to-five-minute way to step out of autopilot.' },
    { term: 'Slip', def: 'A first use after a period without. Not yet a relapse. What you tell yourself next decides what it becomes.' },
    { term: 'Relapse', def: 'A slip that keeps going for days or weeks.' },
    { term: 'The spiral', def: 'Reading a slip as total failure, or as proof you cannot do it, which turns a slip into a relapse.' },
    { term: 'Safety Net', def: 'A person who supports your recovery and will not put it at risk.' },
    { term: 'Risky relationship', def: 'Someone who uses around you, or who brings the conflict and feelings that lead to urges.' },
    { term: 'Be smart, not strong', def: 'Avoid triggers instead of testing your willpower against them.' },
    { term: 'Small decision', def: 'A choice that does not look like it is about using but moves you toward it. The book this is based on calls them seemingly irrelevant decisions.' },
    { term: 'Battle Plan', def: 'A plan and two backups for a high-risk situation you can see coming.' },
    { term: 'Decisional Balance', def: 'Both sides of both choices: the good and the bad of continuing, and of stopping.' },
    { term: 'Reasons Card', def: 'The drawbacks of continuing and the benefits of stopping, in your own words. The first thing SOS shows.' },
    { term: 'Stage of change', def: 'Where you are with changing: not looking to, thinking about it, getting ready, doing it, keeping it going.' },
    { term: 'Momentum', def: 'The number of days in the last fourteen on which you practised something. It never drops to zero because of one day.' },
    { term: 'Mastery', def: 'A skill levels up with use: 1, 3, 7, 15 and 30 uses.' },
    { term: 'Calm mode', def: 'The game layer switched off: no harbor, no points. Everything else keeps working.' },
    { term: 'Pleasant activity', def: 'Anything you would rate six or more out of ten for enjoyment. One a day is the goal.' },
    { term: 'Should-dos and want-tos', def: 'Responsibilities, and the things you do because you enjoy them. Balance is the aim.' },
    { term: 'Pleasure prediction', def: 'Guess how much you will enjoy something, do it anyway, rate it afterwards, compare.' },
    { term: 'Behavioural activation', def: 'Scheduling enjoyable and meaningful activities to lift mood and leave less room for using.' },
    { term: 'Give it a beat', def: 'A pause before acting on anger: breathe, count, step away, say "I need a minute".' },
    { term: 'Warning sign', def: 'A shift in mood, thinking or behaviour that shows up days or weeks before a relapse.' },
    { term: 'Weekly Review', def: 'Five minutes a week to look back, check the forecast, and plan for the risky moments ahead.' },
    { term: 'Forecast check', def: 'In the Weekly Review: the rough weather you planned for, next to what your logbook recorded. Reflection, never a score.' },
    { term: 'Mindfulness', def: 'Paying attention on purpose, in the present moment, without judging what you find.' },
    { term: 'Acceptance', def: 'Letting a feeling be there without letting it decide what you do.' },
    { term: 'Tolerance', def: 'Needing more for the same effect.' },
    { term: 'Withdrawal', def: 'The rough physical and emotional effects as a substance leaves the body. For alcohol and sedatives it can be dangerous: see a doctor.' },
    { term: 'Dopamine', def: 'A brain messenger involved in wanting and reward. Substances flood it, then deplete it, which is why ordinary pleasures go flat for a while.' },
    { term: 'Conditioned cue', def: 'A person, place, thing or feeling that the brain has linked to using, so that it now triggers a craving on its own.' },
    { term: 'Self-efficacy', def: 'Believing you can do it. It predicts success, and it grows with every skill you use.' },
    { term: 'Companion', def: 'The voice of your rational brain in this app. You can rename it in Settings.' },
  ],
};

if (typeof module !== 'undefined' && module.exports) module.exports = Content;
