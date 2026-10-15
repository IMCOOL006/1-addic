'use strict';
// Sections generated from the source docs rather than written by hand:
// the build steps (Part 7), the house rules, reusable prompts, definition of done, exercise map, wireframe.

const stepNotes = require('./steps');
const { smartQuotes: q } = require('./render_md');

const PHASE_GOALS = {
  // From PLAN.md §12 (goal · exit criteria), in the plan's words.
  '0': { goal: 'Settle the decisions, set up the repo', exit: 'A deployed preview build; CI green; D3 decided with measurements' },
  '1': { goal: 'Useful from day 1', exit: 'E2E offline SOS test passes; the owner dogfoods it for 7 days' },
  '2': { goal: 'The tutorial layer', exit: 'All M0–M5 exercises validated, with tutorial mode for each; every shipped feature has its tutorial and help entry' },
  '3': { goal: 'The tracker and actions layer', exit: 'Every row in docs/book/exercises.md implemented or explicitly deferred' },
  '4': { goal: 'Delight, without harm', exit: 'Game state recomputes deterministically from events; guardrail checklist (§6.1) passes review' },
  '5': { goal: 'Real phone app', exit: 'Store-ready builds; WCAG AA audit fixed; purchases and the device licence verified in the store sandboxes' },
  '6': { goal: 'Safe public release (if D1 = public)', exit: 'Sign-offs from the clinical advisor and counsel' },
};

const PHASE_BRIEFS = {
  '0': 'One to two weeks to answer the open questions, create the empty app, get a preview link and automatic checks working, and run the Unity feasibility spike that settles the platform decision with real measurements. Nothing user-facing yet, but everything after this depends on it.',
  '1': 'Two to three weeks to build the part of the app that earns its place: private storage, onboarding, urgent help, the SOS craving flow, quick logs, a first Today screen, the tour and drill, and data export. At the end you use it yourself for a week.',
  '2': 'Four to six weeks for the learning layer: the exercise engine, the lesson player, the self-teaching guidance engine, the Learning Roadmap, the first six modules (M0 to M5) with their artifacts, the Workbook tab, the first insights and XP, and the About & evidence screen.',
  '3': 'Four to six weeks to finish the book: the Planner, Battle Plans, modules M6 to M10, audio practices, the "I\'m feeling…" branch, Lapse Recovery, the Warning Sign Radar, My Recovery Plan and the Weekly Review, then an audit of every exercise.',
  '4': 'Four to five weeks (which can overlap Phase 3) for the full game layer: the progress map (Brain Map or Harbor), ranks, badges, a quest log with the last mini-games, Calm mode, a written review against the guardrails, and a polish pass that makes the map a living scene and enforces the performance budget.',
  '5': 'Four to five weeks to turn the app into a real phone app with native notifications, biometric lock, secure key storage, an SOS shortcut, recorded audio, final audits, and the paid plan with its device licence and safety floor. Some of this needs a Mac or Android Studio on your own computer.',
  '6': 'Ongoing work before any public release: a clinical review packet, a usability study kit, privacy policy and store listing drafts, the sync service for up to three devices, and, if you want it later, a written proposal for the optional AI coach.',
};

const PHASE_SHOW = {
  '0': 'A preview link that opens the empty app on a phone, with the five tabs and the SOS button in place, plus the Unity spike\'s measurements and a go / no-go on the platform.',
  '1': 'A working SOS session in airplane mode, onboarding, urgent help, quick logs and Today. Good enough to show a clinician the safety flows and to start dogfooding.',
  '2': 'Lessons M0 to M5 with tutorial-mode exercises, the Learning Roadmap, the Workbook tab, first insights and visible XP. Good for a first round of design and tone feedback.',
  '3': 'The whole book covered: planner, Battle Plans, audio practices, hard-feelings tools, Lapse Recovery, the Warning Sign Radar and My Recovery Plan with PDF export. Ready for usability testing with people in recovery.',
  '4': 'The progress map (Brain Map or Harbor), quests, badges and Calm mode, plus the guardrail review document for the clinical reviewer.',
  '5': 'Store-ready iOS and Android builds on a real phone, with native notifications, biometric lock, and purchases and the device licence working in the store sandboxes.',
  '6': 'Review packets and policy drafts for the clinician, testers and counsel, and two phones syncing one plan.',
};

function phaseEstimate(phase) { return phase.estimate ? phase.estimate.replace(/^about /, '~') : 'ongoing'; }

function renderSteps(b, sources) {
  const { guide } = sources;
  for (const phase of guide.phases) {
    const est = phase.estimate ? ` (${phase.estimate})` : '';
    b.h2(`7.${Number(phase.num) + 3} Phase ${phase.num}: ${q(phase.title)}${est}`);
    b.brief(q(PHASE_BRIEFS[phase.num]));
    if (phase.note) b.callout('tip', q(phase.note));
    const g = PHASE_GOALS[phase.num];
    b.table({
      columns: [{ header: 'Phase ' + phase.num + ' at a glance', w: 1.2 }, { header: '', w: 3.8 }],
      zebra: false,
      rows: [
        ['Time estimate', phase.estimate ? q(phase.estimate) : 'Ongoing (no estimate in the plan)'],
        ['Goal', q(g.goal)],
        ['Steps', phase.steps.map((s) => `Step ${s.id}`).join(' · ')],
        ['Exit criteria (from the plan)', q(g.exit)],
        ...(phase.doneWhen ? [['Phase done when (from the guide)', q(phase.doneWhen)]] : []),
        ['What you could show people', q(PHASE_SHOW[phase.num])],
      ],
    });
    for (const step of phase.steps) {
      const notes = stepNotes[step.id];
      if (!notes) throw new Error(`No notes for step ${step.id} in steps.js`);
      const qual = step.qualifier ? ` (${step.qualifier})` : '';
      b.h3(`Step ${step.id}${qual}: ${q(step.title)}`);
      b.brief3(q(notes.brief));
      if (step.goal) b.p(q(`**Goal from the guide:** ${step.goal}`), { keepNext: true });
      b.label('What you’ll have after this step');
      b.p(q(notes.after), { keepNext: true });
      b.promptBox(step.prompt);
      if (step.doneWhen.length) {
        b.label('Done when');
        b.checks(step.doneWhen.map((t) => q(t.charAt(0).toUpperCase() + t.slice(1))));
      } else {
        b.label('Done when (derived from the prompt; the guide gives no separate checklist for this step)');
        b.checks(notes.done.map(q));
      }
      b.checks([q('The definition of done in Appendix D is met.')]);
    }
    if (phase.doneWhen) b.callout('tip', q(`**Phase ${phase.num} done when:** ${phase.doneWhen}`), { lead: 'Phase check: ' });
    if (phase.num === '3') {
      b.callout('decision', q('**The MVP cut line.** If time is short, the plan says the smallest useful app is Phases 0 and 1, plus modules M3 (Find Your Why) and M5 (Become a Self-Expert) from Phase 2, plus Battle Plans (Step 3.2) and Lapse Recovery (Step 3.7) from Phase 3. Everything else can follow later. This is the plan\'s recommendation; confirm it when you make your decisions in Part 10.'), { lead: 'Scope choice: ' });
    }
  }
}

function renderHowTo(b, sources) {
  b.numbered(sources.guide.howToRun.map(q));
  if (sources.guide.howToRunNote) b.callout('tip', q(sources.guide.howToRunNote.replace(/\*"/g, '"').replace(/"\*/g, '"')));
}

function renderHouseRules(b, sources) {
  const glosses = {
    1: 'In plain words: start every session by reading the rules and the relevant plan sections, and write everything in your own words.',
    2: 'In plain words: the crisis tools always work, and the game can never punish anyone.',
    3: 'In plain words: nothing leaves the phone.',
    4: 'In plain words: small changes, always tested. Lint checks code style, typecheck checks the types, e2e tests drive the real app in a browser, and content validation checks every lesson and exercise file.',
    5: 'In plain words: a feature is not finished until the app can teach it.',
    6: 'In plain words: the app must work for people who use a keyboard, a screen reader, larger text or reduced motion.',
    7: 'In plain words: keep the written record honest. An ADR (architecture decision record) is a short note that says what was decided and why.',
    8: 'In plain words: every session ends with a short report.',
  };
  sources.guide.houseRules.forEach((r, idx) => {
    const n = idx + 1;
    b.p(q(`**${n}.** ${r.text}`), { keepNext: true });
    if (r.sub.length) b.bullets(r.sub.map(q));
    if (glosses[n]) b.note(q(glosses[n]));
  });
}

function renderReusable(b, sources) {
  const explain = {
    'Fix it': 'Use this when something is broken. Replace the text in angle brackets with what you saw.',
    'Pick up where we left off': 'Paste this at the start of any session to find out which step comes next.',
    'Write lesson content': 'Use this to write or rewrite the lessons for one module. Replace <Mx> with the module, for example M4.',
    'Safety review': 'Run this after any step that touches SOS, mood, lapse or medical text.',
    'Change the plan': 'Use this when you want to change the plan itself, not the app.',
  };
  for (const r of sources.guide.reusable) {
    const name = r.name.replace(/:$/, '');
    b.h3(name);
    b.brief3(q(explain[name] || 'A reusable prompt from the build guide.'));
    b.promptBox(r.prompt);
  }
  if (sources.guide.codeReviewNote) {
    b.h3('Code review');
    b.brief3('Not a prompt to paste, but a command to type in the session.');
    b.p(q(sources.guide.codeReviewNote.charAt(0).toUpperCase() + sources.guide.codeReviewNote.slice(1)));
  }
}

function renderDod(b, sources) {
  b.checks(sources.guide.definitionOfDone.map(q));
}

function renderExercises(b, sources) {
  b.table({
    columns: [{ header: 'Ex', w: 0.6 }, { header: 'Exercise', w: 2.4 }, { header: 'Ch', w: 0.4 }, { header: 'Kind', w: 0.8 }, { header: 'App feature', w: 3.2 }],
    size: 18,
    rows: sources.exercises.map((e) => [e.id, q(e.exercise), e.ch, e.kind, q(e.feature.replace(/\*\*/g, ''))]),
  });
}

function renderReferences(b, sources) {
  b.table({
    columns: [{ header: 'ID', w: 0.45 }, { header: 'What the app may say', w: 2.3 }, { header: 'Source', w: 2.9 }, { header: 'Type', w: 0.85 }],
    size: 17,
    rows: sources.references.map((r) => [r.id, q(r.claim), q(r.source), q(r.type)]),
  });
}

function renderWireframe(b) {
  b.phoneFigure([
    { title: 'TODAY', items: [
      { text: 'Good evening, Sam' },
      { text: 'Day 15 · 9 urges surfed', muted: true },
      { button: 'Evening check-in  ▶' },
      { text: '**Tonight**' },
      { text: '7:30  Free time  — risky' },
      { text: '└ Battle plan: call Mia, then walk', indent: true },
      { text: '8:00  Want-to: guitar' },
      { text: 'Continue: Step 3 · Lesson 2  ▶' },
      { text: 'Quest: Build Your Crew' },
      { button: 'SOS', sos: true, align: 'right' },
    ] },
    { title: 'SOS', items: [
      { text: 'You opened this. That’s your rational brain at work.' },
      { text: 'How strong?   0 ──●── 10' },
      { text: '15:00  wave timer', muted: true },
      { button: 'Ride the wave' },
      { button: 'Remind me why' },
      { button: 'Call someone' },
      { button: 'Distract me' },
      { button: 'Talk back' },
      { text: 'Need urgent help?  →', muted: true },
    ] },
  ], 'The Today and SOS screens, redrawn from the low-fi wireframe in the plan (PLAN.md §4).');
}

module.exports = { renderSteps, renderHowTo, renderHouseRules, renderReusable, renderDod, renderExercises, renderReferences, renderWireframe };
