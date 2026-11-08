/* 1-addic · CONTENT · the quest-line "Your way", the daily objectives and the run (PLAN-V3 section 7; R-O-6; unit V-42).
   Original wording throughout. Plain assignments onto Content, read at call time by the Engine (questLine, unlocked,
   dailyObjectives, growth, run) and drawn by today-track on Today.
   Shapes (contracts/content-v3.md, V-42; R-C-50):
   Content.questLine = 10 steps in order, each {id, title, line, condition: {event, count, within?: 'day'|'week',
     where?: {key: value}}, reward, opened}. A condition never counts a real SOS session, a slip, a milestone or a
     sober day: no SosCompleted, SlipLogged, MilestoneSeen, and no LogCreated, SkillUsed or ContactReached (an SOS
     session writes those too). The SOS drill counts only as TutorialCompleted {id: 'drill'}.
     Each reward is a distinct feature a module already reveals (Content.reveal m2 to m10), never protected: the
     quest-line only opens it early. Nothing open on day one is a reward (R-S-20), so no tool or game is one.
   Content.objectives = a pool of 20, each {id, title, line, doneBy: {event} | 'tap', grows}.
   Content.runWords = {header, current, best, total, kept, keptLine, cameBack, cameBackLine, graceLine}.
   The xp rows ObjectiveDone and QuestLineStepDone are small and fixed; a number already set wins. */
const C_q = (typeof Content !== 'undefined') ? Content : require('./content-core.js');

C_q.questLine = [
  { id: 'ql-drill', title: 'Try the SOS drill', line: 'Walk through SOS once as practice. Nothing goes in your log.',
    condition: { event: 'TutorialCompleted', count: 1, where: { id: 'drill' } }, reward: 'network',
    opened: 'Support Network is open in Workbook: a place for the people you would call.' },
  { id: 'ql-lesson', title: 'Finish one lesson', line: 'Any lesson in Learn. Most take about five minutes.',
    condition: { event: 'LessonCompleted', count: 1 }, reward: 'workbook',
    opened: 'Workbook is open: what you build in lessons is kept there.' },
  { id: 'ql-checkins', title: 'Check in three evenings', line: 'Three evening check-ins, on any days you like.',
    condition: { event: 'CheckinCompleted', count: 3 }, reward: 'insights',
    opened: 'Insights is open in Track: patterns from your own check-ins.' },
  { id: 'ql-build', title: 'Save one thing you built', line: 'Finish one exercise that builds something, like your Reasons Card.',
    condition: { event: 'ArtifactSaved', count: 1 }, reward: 'motivation',
    opened: 'The Motivation Meter is open in Workbook: your motivation over time.' },
  { id: 'ql-practice', title: 'Do five short practices', line: 'Five guided practices of a minute or more, at your own pace.',
    condition: { event: 'MindfulMinute', count: 5 }, reward: 'practices',
    opened: 'Guided practices are open in Actions, all in one list.' },
  { id: 'ql-enjoy', title: 'Do one thing you enjoy', line: 'Log one activity you did for the fun of it.',
    condition: { event: 'ActivityDone', count: 1 }, reward: 'activities',
    opened: 'The Activity Library is open in Workbook: ideas for things to enjoy.' },
  { id: 'ql-week', title: 'Five check-ins in one week', line: 'Five evening check-ins between a Monday and a Sunday.',
    condition: { event: 'CheckinCompleted', count: 5, within: 'week' }, reward: 'weeklyReview',
    opened: 'The Weekly Review is open in Actions: five minutes to look back and plan.' },
  { id: 'ql-review', title: 'Do one Weekly Review', line: 'Look back at your week and choose one thing for the next.',
    condition: { event: 'WeeklyReviewCompleted', count: 1 }, reward: 'planner',
    opened: 'The Planner is open in Actions: plan a day and see its quiet gaps.' },
  { id: 'ql-enjoy3', title: 'Three things you enjoy', line: 'Log three activities you did for the fun of it.',
    condition: { event: 'ActivityDone', count: 3 }, reward: 'predictions',
    opened: 'The Prediction Lab is open in Actions: guess how much you will enjoy something, then compare.' },
  { id: 'ql-ten', title: 'Ten check-ins', line: 'Ten evening check-ins in all. Gaps between them are fine.',
    condition: { event: 'CheckinCompleted', count: 10 }, reward: 'radar',
    opened: 'The Warning Sign Radar is open in Track: signs to watch, from your own check-ins.' },
];

C_q.objectives = [
  { id: 'ob-checkin', title: 'Do your check-in', line: 'A minute to note how today went.', doneBy: { event: 'CheckinCompleted' }, grows: 'lantern' },
  { id: 'ob-lesson', title: 'Read one lesson', line: 'Any lesson in Learn.', doneBy: { event: 'LessonCompleted' }, grows: 'bell' },
  { id: 'ob-exercise', title: 'Try one exercise', line: 'A short practice or reflection from a lesson.', doneBy: { event: 'ExerciseDone' }, grows: 'tree' },
  { id: 'ob-skill', title: 'Try one skill', line: 'Pick any tool and give it a go.', doneBy: { event: 'SkillUsed' }, grows: 'boat' },
  { id: 'ob-activity', title: 'Do something you enjoy', line: 'Log one thing you did for the fun of it.', doneBy: { event: 'ActivityDone' }, grows: 'garden' },
  { id: 'ob-practice', title: 'One guided practice', line: 'A minute or more, at your own pace.', doneBy: { event: 'MindfulMinute' }, grows: 'gull' },
  { id: 'ob-build', title: 'Add to your Workbook', line: 'Save one thing you built in an exercise.', doneBy: { event: 'ArtifactSaved' }, grows: 'flag' },
  { id: 'ob-reach', title: 'Reach out to someone', line: 'A call or a text to someone in your network.', doneBy: { event: 'ContactReached' }, grows: 'bench' },
  { id: 'ob-water', title: 'Drink a glass of water', line: 'Small and simple. Tap when it is done.', doneBy: 'tap', grows: 'garden' },
  { id: 'ob-walk', title: 'Take a short walk', line: 'Ten minutes outside, or around the room.', doneBy: 'tap', grows: 'tree' },
  { id: 'ob-message', title: 'Send a kind message', line: 'A few words to someone you like.', doneBy: 'tap', grows: 'gull' },
  { id: 'ob-tidy', title: 'Tidy one corner', line: 'One shelf, one desk or one drawer.', doneBy: 'tap', grows: 'bench' },
  { id: 'ob-breath', title: 'Take one slow breath', line: 'In, and out, a little slower than usual.', doneBy: 'tap', grows: 'lantern' },
  { id: 'ob-air', title: 'Get some fresh air', line: 'Open a window or step outside for a minute.', doneBy: 'tap', grows: 'flag' },
  { id: 'ob-meal', title: 'Eat a proper meal', line: 'Sit down for it if you can.', doneBy: 'tap', grows: 'garden' },
  { id: 'ob-stretch', title: 'Stretch for a minute', line: 'Neck, shoulders, back. Go gently.', doneBy: 'tap', grows: 'tree' },
  { id: 'ob-glad', title: 'Note one good thing', line: 'Something from today you are glad of, however small.', doneBy: 'tap', grows: 'lantern' },
  { id: 'ob-song', title: 'Play a song you like', line: 'Listen to the whole thing.', doneBy: 'tap', grows: 'bell' },
  { id: 'ob-thanks', title: 'Thank someone', line: 'In person, by phone or by text.', doneBy: 'tap', grows: 'boat' },
  { id: 'ob-bedtime', title: 'Pick a bedtime', line: 'Choose a time to go to bed tonight.', doneBy: 'tap', grows: 'flag' },
];

C_q.runWords = {
  header: 'Days shown up',
  current: 'Days in a row',
  best: 'Your longest run',
  total: 'All days shown up',
  kept: 'Kept',
  keptLine: 'One missed day a week is kept for you, so your run carries on.',
  cameBack: 'You came back.',
  cameBackLine: 'Coming back is a skill too. Today counts.',
  graceLine: 'Yesterday is held for you. Any small step today keeps your run going.',
};

/* small and fixed; never for a claimed sober day. A number already set (engine or chat) wins. */
for (const [k, n] of Object.entries({ ObjectiveDone: 3, QuestLineStepDone: 10 })) {
  if (!Object.prototype.hasOwnProperty.call(C_q.xp, k)) C_q.xp[k] = n;
}

/* on from day one: protected, so never a reward. */
Object.assign(C_q.features, {
  questLine: { name: 'Your way', gist: 'Ten small steps in order. Each one opens a part of the app early.', tab: 'today', route: '#/today' },
  objectives: { name: 'Small things for today', gist: 'A few easy acts for the day. Each one done grows your Harbor.', tab: 'today', route: '#/today' },
  run: { name: 'Days shown up', gist: 'The days you did something for yourself. One missed day a week is kept.', tab: 'today', route: '#/today' },
});
for (const id of ['questLine', 'objectives', 'run']) {
  if (!C_q.reveal.always.includes(id)) C_q.reveal.always.push(id);
}

C_q.tutorials.push(
  { id: 'questLine', name: 'Your way', kind: 'jit', feature: 'questLine', steps: [
    { target: 'questline-card', text: 'This is Your way: one small step at a time. Each step done opens a part of the app early. It is optional.' },
  ] },
  { id: 'objectives', name: 'Small things for today', kind: 'jit', feature: 'objectives', steps: [
    { target: 'objectives-card', text: 'Here are a few small things for today. Do any of them, or none. Each one done grows your Harbor.' },
  ] },
  { id: 'run', name: 'Days shown up', kind: 'jit', feature: 'run', steps: [
    { target: 'run-line', text: 'This counts the days you did something for yourself. One missed day a week is kept for you.' },
  ] },
);

C_q.help.push(
  { q: 'What is Your way?', a: 'A path of ten small steps on Today. Do them in order. Each step done opens a part of the app a little early. You can skip it.', route: '#/today' },
  { q: 'What are the small things for today?', a: 'A few easy acts on Today. Some are done when you do them in the app; others you tap when they are done. Each one grows your Harbor.', route: '#/today' },
  { q: 'What does "Days shown up" count?', a: 'Each day you did something for yourself: a check-in, a lesson, a skill or a small thing. One missed day a week is kept for you.', route: '#/today' },
);

if (typeof module !== 'undefined' && module.exports) module.exports = C_q;
