// Lane content's Node tests (node:test, no dependencies). U-31a: the M0-M3 exercises of BUILD-PLAN 3.8 and the
// checkpoint, the content-core safety asks (R-C-13, R-C-18), and Engine.validateContent over the loaded content.
// U-31b: the M4-M10 exercises and checkpoints. U-29: lessons M4-M6. U-30: lessons M7-M10. U-32: practices, games, comebacks. U-33: the sample profile.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const src = (f) => join(SRC, f);

globalThis.Content = require(src('content-core.js'));
for (const f of ['content-lessons-a.js', 'content-lessons-b.js', 'content-lessons-c.js', 'content-exercises.js', 'content-practices.js', 'content-sample.js']) {
  if (existsSync(src(f))) require(src(f));
}
const C = globalThis.Content;
const E = require(src('engine.js'));
let X = null;
try { X = require(src('ui-exercise.js')); } catch (e) { X = null; }

// The 19 field types of ExerciseUI.FIELD_TYPES (ui-exercise.js), copied for when the module cannot load in Node.
const FIELD_TYPES_COPY = ['check', 'check2', 'single', 'slider', 'text', 'textarea', 'list', 'matrix2x2', 'pair', 'rows',
  'template', 'bodymap', 'date', 'number', 'yesno', 'percent', 'contactPicker', 'rating', 'topN'];
const FIELD_TYPES = X && Array.isArray(X.FIELD_TYPES) ? X.FIELD_TYPES : FIELD_TYPES_COPY;
const KINDS = ['assess', 'build', 'plan', 'practice', 'reflect', 'tool', 'log'];
const DONE_KINDS = ['practice', 'reflect', 'tool'];
const M0_M3_IDS = ['quick-reasons', 'signs-check', 'risk-factors', 'help-request', 'program-questions', 'motivation',
  'balance', 'four-lenses', 'checkpoint'];

const exercises = () => (Array.isArray(C.exercises) ? C.exercises : []);
const byId = (id) => exercises().find((x) => x && x.id === id) || null;
const lessonsOf = (ids) => C.modules.filter((m) => ids.includes(m.id)).flatMap((m) => m.lessons || []);
const isObj = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);
const strings = (v, out = []) => {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (isObj(v)) Object.values(v).forEach((x) => strings(x, out));
  return out;
};

test('content: Content.exercises is an array of unique ids holding every M0-M3 exercise', () => {
  assert.ok(Array.isArray(C.exercises), 'Content.exercises is an array');
  const ids = exercises().map((x) => x.id);
  assert.equal(new Set(ids).size, ids.length, 'ids are unique');
  for (const id of M0_M3_IDS) assert.ok(byId(id), `${id} is in Content.exercises`);
});

test('content: every tryIt exercise of m0-m3 resolves', () => {
  const tried = lessonsOf(['m0', 'm1', 'm2', 'm3']).filter((l) => l.tryIt && l.tryIt.exercise).map((l) => [l.id, l.tryIt.exercise]);
  assert.ok(tried.length >= 7);
  for (const [lesson, id] of tried) assert.ok(byId(id), `${lesson}: tryIt.exercise ${id} resolves`);
  if (X && typeof X.exerciseFor === 'function') for (const [, id] of tried) assert.ok(X.exerciseFor(id, C), `${id} through ExerciseUI.exerciseFor`);
});

test('content: exercise shape (3.8) and field types in ExerciseUI.FIELD_TYPES', () => {
  for (const ex of exercises().filter((x) => x.id !== 'checkpoint')) {
    const at = `exercise ${ex.id}`;
    assert.ok(typeof ex.title === 'string' && ex.title, `${at}: title`);
    assert.ok(isObj(ex.book) && 'chapter' in ex.book && 'exercise' in ex.book, `${at}: book {chapter, exercise}`);
    assert.ok(KINDS.includes(ex.kind), `${at}: kind ${ex.kind}`);
    assert.ok(Array.isArray(ex.fields) && ex.fields.length, `${at}: fields`);
    const fids = ex.fields.map((f) => f.id);
    assert.equal(new Set(fids).size, fids.length, `${at}: field ids unique`);
    for (const f of ex.fields) {
      assert.ok(typeof f.id === 'string' && f.id && typeof f.label === 'string' && f.label, `${at}: field id and label`);
      assert.ok(FIELD_TYPES.includes(f.type), `${at}.${f.id}: type ${f.type} is one of the 19`);
      if (['check', 'check2', 'single'].includes(f.type)) {
        const n = X ? X.optionsFor(f, null, C).length : (Array.isArray(f.options) ? f.options.length : 1);
        assert.ok(n >= 2, `${at}.${f.id}: has options (${n})`);
      }
      if (f.type === 'template') assert.ok(f.parts.some((p) => isObj(p) && p.blank), `${at}.${f.id}: a blank`);
    }
    const t = ex.tutorial;
    assert.ok(isObj(t) && isObj(t.example) && C.cast[t.example.cast], `${at}: tutorial example by a cast member`);
    assert.ok(isObj(t.example.values) && Object.keys(t.example.values).every((k) => fids.includes(k)), `${at}: example values name fields`);
    assert.ok(isObj(t.hints) && Object.keys(t.hints).every((k) => fids.includes(k)), `${at}: hints name fields`);
    assert.ok(typeof t.built === 'string' && t.built, `${at}: built`);
    assert.deepEqual(ex.events, [DONE_KINDS.includes(ex.kind) ? 'ExerciseDone' : 'ArtifactSaved'], `${at}: events by 3.7`);
    if (X) {
      const vals = X.fromPayload(ex, t.example.values);
      assert.deepEqual(X.validate(ex, vals).errors, {}, `${at}: the example fills every required field`);
    }
  }
});

test('content: the example values survive the payload round trip', { skip: !X && 'ui-exercise.js does not load in Node' }, () => {
  for (const ex of exercises().filter((x) => x.id !== 'checkpoint')) {
    const vals = X.fromPayload(ex, ex.tutorial.example.values);
    for (const f of ex.fields) {
      if (!(f.id in ex.tutorial.example.values)) continue;
      assert.equal(X.isEmpty(f, vals[f.id]), false, `${ex.id}.${f.id}: example value is kept`);
    }
  }
});

test('content: the Reasons Card reads the field ids the Engine expects', () => {
  const ids = (id) => byId(id).fields.map((f) => f.id);
  assert.ok(ids('quick-reasons').includes('reasons'));
  assert.ok(ids('balance').includes('drawbacks') && ids('balance').includes('benefits'));
  assert.ok(ids('four-lenses').includes('different'));
  assert.equal(byId('motivation').artifact, 'motivation');
  assert.deepEqual(ids('motivation'), ['stage', 'score', 'plusOne']);
});

test('content: risk-factors is sensitive, with no score and no risk verdict', () => {
  const ex = byId('risk-factors');
  assert.equal(ex.sensitive, true);
  assert.ok(!ex.fields.some((f) => ['slider', 'number', 'percent', 'rating'].includes(f.type)), 'no score field');
  assert.ok(!strings(ex).some((s) => /you are at risk|high risk|your score/i.test(s)), 'no risk verdict');
});

test('content: checkpoint has two questions for each of m0-m3, every option with a why and one helpful', () => {
  const cp = byId('checkpoint');
  for (const m of ['m0', 'm1', 'm2', 'm3']) {
    const qs = cp.modules[m];
    assert.equal(qs.length, 2, `${m}: two questions`);
    for (const q of qs) {
      assert.ok(typeof q.q === 'string' && q.q && q.options.length >= 2, `${m}: question and options`);
      assert.ok(q.options.every((o) => o.t && o.why && typeof o.ok === 'boolean'), `${m}: {t, ok, why}`);
      assert.equal(q.options.filter((o) => o.ok).length, 1, `${m}: one helpful reading`);
    }
  }
});

test('content: Engine.validateContent returns zero errors', () => {
  assert.deepEqual(E.validateContent(C), []);
});

test('content: no addict noun in any exercise string', () => {
  const bad = strings(C.exercises).filter((s) => /\baddicts?\b/i.test(s) && !/^\s*"[^"]*"\s*$/.test(s));
  assert.deepEqual(bad, []);
});

test('content: R-C-13 safety asks and R-C-18', () => {
  const local = C.resources.intl.lines.find((l) => /local emergency/i.test(l.name));
  assert.equal(local.tel, '112');
  assert.equal(local.verify, true);
  const o = C.resources.opioidSafety;
  assert.ok(o && typeof o.text === 'string' && o.text.length < 220, 'one short line');
  assert.equal(o.verify, true);
  assert.equal(o.clinicalReview, true);
  assert.ok(!C.catalogs.spiral.includes('I\'m hopeless.'), 'the crisis thought left the spiral list');
  const pairs = C.catalogs.spiralPairs;
  assert.ok(Array.isArray(pairs) && pairs.length >= 5);
  for (const p of pairs) {
    assert.ok(p.thought && p.reply, 'thought and reply');
    assert.deepEqual(E.crisisKeywords(p.thought + ' ' + p.reply), [], `no crisis word: ${p.thought}`);
    assert.ok(!/hopeless/i.test(p.thought + p.reply));
  }
  const labeling = C.catalogs.distortions.find((d) => d.id === 'labeling');
  assert.ok(!/\baddicts?\b/i.test(labeling.example), 'the labelling example has no noun');
});

// U-31b: the rest of the 3.8 list, the m4-m10 checkpoint questions and the payload keys the Engine reads.
const ALL_IDS = M0_M3_IDS.concat(['clear-space', 'exercise-plan', 'network-review', 'assertive-script', 'expand-network',
  'should-i-go', 'triggers', 'red-flags', 'trap-pairs', 'spiral', 'craving-signature', 'trial', 'cog-vs-beh', 'distractions',
  'body-scan', 'breathing', 'everyday-mindful', 'sober-practice', 'used-to-enjoy', 'should-want', 'activity-menu', 'obstacles',
  'rewards', 'anger-signature', 'rewrite-scene', 'warning-signs', 'slip-review']);
const PRACTICE_IDS = ['breathe', 'body-scan', 'sober', 'urge-surf', 'shower', 'eating', 'walking', 'beat'];

test('content: every exercise of the 3.8 list is in Content.exercises', () => {
  for (const id of ALL_IDS) assert.ok(byId(id), `${id} is in Content.exercises`);
});

test('content: every exercise id used by a lesson resolves', () => {
  const tried = C.modules.flatMap((m) => m.lessons || []).filter((l) => l.tryIt && l.tryIt.exercise);
  for (const l of tried) assert.ok(byId(l.tryIt.exercise), `${l.id}: tryIt.exercise ${l.tryIt.exercise} resolves`);
  const routed = strings(C.modules).filter((s) => s.startsWith('#/exercise/')).map((s) => s.split('?')[0].slice(11));
  for (const id of routed) assert.ok(byId(id), `route #/exercise/${id} resolves`);
});

test('content: example answers pick real options unless the field takes custom ones', () => {
  for (const ex of exercises().filter((x) => x.id !== 'checkpoint')) {
    for (const f of ex.fields) {
      if (!['check', 'single'].includes(f.type) || f.allowCustom || !(f.id in ex.tutorial.example.values)) continue;
      const ids = new Set((X ? X.optionsFor(f, null, C) : (f.options || [])).map((o) => o.id));
      if (!ids.size) continue;
      for (const v of [].concat(ex.tutorial.example.values[f.id])) assert.ok(ids.has(v), `${ex.id}.${f.id}: ${v} is an option`);
    }
  }
});

test('content: checkpoint has two questions for each of m4-m10, every option with a why and one helpful', () => {
  const cp = byId('checkpoint');
  for (const m of ['m4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10']) {
    const qs = cp.modules[m];
    assert.equal(qs.length, 2, `${m}: two questions`);
    for (const q of qs) {
      assert.ok(q.q && q.options.length >= 2 && q.options.every((o) => o.t && o.why && typeof o.ok === 'boolean'), `${m}: {q, options:[{t, ok, why}]}`);
      assert.equal(q.options.filter((o) => o.ok).length, 1, `${m}: one helpful reading`);
    }
  }
});

test('content: the practice exercises name a Content.practices id and end with a helpful rating', () => {
  for (const id of ['body-scan', 'breathing', 'everyday-mindful', 'sober-practice']) {
    const ex = byId(id);
    assert.equal(ex.kind, 'practice', `${id}: kind practice`);
    assert.ok(ex.fields.some((f) => f.id === 'helpful' && f.type === 'rating'), `${id}: helpful rating`);
    if (ex.practice) assert.ok(PRACTICE_IDS.includes(ex.practice), `${id}: practice ${ex.practice}`);
  }
  const which = byId('everyday-mindful').fields.find((f) => f.id === 'which').options.map((o) => o.id);
  assert.deepEqual(which, ['shower', 'eating', 'walking']);
});

test('content: the field ids the Engine reads from M4-M10 responses', () => {
  const ids = (id) => byId(id).fields.map((f) => f.id);
  assert.ok(ids('trial').includes('thought') && ids('trial').includes('comeback'), 'trial thought/comeback');
  assert.ok(ids('distractions').includes('distractions'), 'distractions');
  assert.ok(ids('spiral').includes('thoughts') && ids('spiral').includes('replies'), 'spiral thoughts/replies');
  for (const g of Object.keys(C.catalogs.triggers)) assert.ok(ids('triggers').includes(g), `triggers.${g}`);
  assert.ok(ids('triggers').includes('frequent') && ids('triggers').includes('anger'), 'triggers frequent/anger');
  const top = byId('warning-signs').fields.find((f) => f.id === 'top');
  assert.equal(top.type, 'topN');
  assert.equal(top.source, 'signs');
  assert.ok(ids('slip-review').includes('support') && ids('expand-network').includes('support'), 'support');
  assert.ok(ids('activity-menu').includes('wantTos'), 'activity-menu wantTos');
});

test('content: slip, anger and warning-sign exercises carry clinicalReview; slip-review is sensitive', () => {
  for (const id of ['anger-signature', 'rewrite-scene', 'warning-signs', 'slip-review']) assert.equal(byId(id).clinicalReview, true, id);
  assert.equal(byId('slip-review').sensitive, true);
  assert.ok(!strings(exercises()).some((s) => /\breset/i.test(s)), 'no reset wording');
});

// U-29: lessons M4-M6 in the 3.6 shape.
const LESSON_COUNTS = { m4: 6, m5: 6, m6: 6, m7: 6, m8: 6, m9: 5, m10: 4 };
const sentences = (s) => String(s).split(/(?<=[.!?])\s+(?=[A-Z"“(])/).filter((x) => x.trim()).length;

test('content: lessons shape (3.6) for m4-m10', () => {
  const features = new Set(Object.keys(C.features));
  const ranks = new Set(C.ranks.map((r) => r.id));
  for (const [mid, n] of Object.entries(LESSON_COUNTS)) {
    const m = C.modules.find((x) => x.id === mid);
    assert.ok(m, `${mid} exists`);
    assert.ok(m.name && m.harbor && m.blurb && m.book != null && 'step' in m, `${mid}: module fields`);
    assert.ok(Array.isArray(m.unlocks) && m.unlocks.every((f) => features.has(f)), `${mid}: unlocks are feature ids`);
    if (m.milestone) assert.ok(ranks.has(m.milestone), `${mid}: milestone ${m.milestone} is a rank`);
    assert.equal(m.lessons.length, n, `${mid}: ${n} lessons`);
    m.lessons.forEach((l, i) => {
      const at = `lesson ${l.id}`;
      assert.equal(l.id, `${mid}-l${i + 1}`, `${at}: id in order`);
      assert.ok(l.title && l.minutes > 0, `${at}: title and minutes`);
      assert.ok(C.cast[l.moment.cast] && l.moment.text, `${at}: moment by a cast member`);
      const ms = sentences(l.moment.text);
      assert.ok(ms >= 2 && ms <= 4, `${at}: moment has 2-4 sentences (${ms})`);
      assert.ok(l.cards.length >= 3 && l.cards.length <= 4, `${at}: 3-4 cards`);
      for (const c of l.cards) {
        const cs = sentences(c.text);
        assert.ok(c.title && cs >= 1 && cs <= 4, `${at}: card "${c.title}" has 1-4 sentences (${cs})`);
        if (c.link) assert.ok(c.link.route && c.link.label, `${at}: card link {route, label}`);
      }
      assert.ok(l.checks.length >= 1 && l.checks.length <= 2, `${at}: 1-2 checks`);
      for (const q of l.checks) {
        assert.ok(q.q && q.options.length >= 2 && q.options.every((o) => o.t && o.why && typeof o.ok === 'boolean'), `${at}: check options {t, ok, why}`);
        assert.ok(q.options.some((o) => o.ok), `${at}: a helpful reading`);
      }
      assert.ok(l.tryIt && (l.tryIt.exercise || (l.tryIt.route && l.tryIt.label)), `${at}: tryIt`);
      assert.ok(l.wrap && l.wrap.built && l.wrap.lives && l.wrap.action && 'todo' in l.wrap, `${at}: wrap`);
      assert.ok(Array.isArray(l.refs) && l.refs.length >= 1, `${at}: at least one ref`);
    });
  }
});

test('content: refs resolve for every lesson', () => {
  const refs = new Set(C.references.map((r) => r.id));
  for (const l of C.modules.flatMap((m) => m.lessons)) for (const r of l.refs) assert.ok(refs.has(r), `${l.id}: ${r}`);
});

test('content: routes known in every lesson string', () => {
  for (const s of strings(C.modules).filter((x) => x.startsWith('#/'))) assert.ok(E.knownRoute(s, C), `route ${s}`);
});

test('content: the spiral lesson carries clinicalReview and points to urgent help', () => {
  const l = C.modules.find((m) => m.id === 'm5').lessons.find((x) => x.id === 'm5-l5');
  assert.equal(l.clinicalReview, true);
  assert.ok(strings(l).includes('#/sos/urgent'));
  assert.ok(!strings(C.modules).some((s) => /\breset/i.test(s)), 'no reset wording');
});

// U-30: lessons M7-M10. U-32: practices, games, comebacks. U-33: the sample profile. Rule 4: M9-M10 touch feelings, anger, slips and warning signs.
test('content: M9-M10 lessons carry clinicalReview', () => {
  for (const l of lessonsOf(['m9', 'm10'])) assert.equal(l.clinicalReview, true, l.id);
  const all = strings(lessonsOf(['m9', 'm10']));
  assert.ok(all.includes('#/sos/urgent'), 'urgent help is linked');
  assert.ok(all.includes('#/sos/slip') && all.includes('#/workbook/plan'), 'slip help and the plan are linked');
  assert.ok(!all.some((s) => /\breset|start (over|again) from (zero|day one)|\bdose\b/i.test(s)), 'no reset or dose wording');
});

test('content: 39 lessons in m4-m10 and the M7, M9, M10 milestones', () => {
  assert.equal(lessonsOf(['m4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10']).length, 39);
  const ms = Object.fromEntries(C.modules.map((m) => [m.id, m.milestone]));
  assert.deepEqual([ms.m7, ms.m9, ms.m10], ['navigator', 'builder', 'guide']);
});

// U-32: guided practices and games data (shapes pinned by the SCREENS chat, 16:27).
const ROUTE_PRACTICES = ['breathe', 'body-scan', 'sober', 'urge-surf', 'shower', 'eating', 'walking'];
const totalSecs = (p) => p.script.reduce((n, x) => n + (x.secs || 0), 0);

test('content: practice ids match route ids', () => {
  assert.deepEqual(Object.keys(C.practices).sort(), PRACTICE_IDS.slice().sort());
  for (const [k, p] of Object.entries(C.practices)) {
    assert.equal(p.id, k, `${k}: id is its key`);
    assert.ok(p.title && p.minutes > 0 && p.intro && p.close, `${k}: title, minutes, intro, close`);
    assert.ok(Array.isArray(p.script) && p.script.length && p.script.every((x) => typeof x.t === 'string' && x.t && (x.secs == null || x.secs > 0)), `${k}: script [{t, secs?}]`);
  }
  for (const id of ROUTE_PRACTICES) assert.ok(E.knownRoute(`#/practice/${id}`, C), `#/practice/${id}`);
  for (const ex of exercises().filter((x) => x.practice)) assert.ok(C.practices[ex.practice], `${ex.id}: ${ex.practice}`);
});

test('content: sober steps, the breathing ladder with no pacing, a ten-minute body scan', () => {
  const st = C.practices.sober.steps;
  assert.equal(st.length, 5);
  assert.ok(st.every((x) => typeof x === 'string' && x.length <= 70), 'five short plain strings');
  assert.deepEqual(st.map((x) => x[0]).join(''), 'SOBER');
  assert.deepEqual(C.practices.breathe.ladder, [5, 10, 15, 20, 25, 30]);
  assert.ok(!strings(C.practices.breathe).some((s) => /\b(in for|out for|hold|count of|seconds?)\b|slow(er)? breath/i.test(s)), 'no pacing cue');
  const bs = totalSecs(C.practices['body-scan']);
  assert.ok(C.practices['body-scan'].minutes === 10 && bs >= 480 && bs <= 720, `body scan about 10 min (${bs} s)`);
});

test('content: games counts 12/3/6/4x3', () => {
  const g = C.games;
  const traps = new Set(C.catalogs.distortions.map((d) => d.id));
  assert.equal(g.sort.length, 12);
  assert.ok(g.sort.every((x) => x.id && x.thought && traps.has(x.trap)), 'sort: {id, thought, trap} with a catalog trap');
  assert.equal(new Set(g.sort.map((x) => x.id)).size, 12, 'sort ids unique');
  assert.equal(g.flag.redFlags.length, 3);
  assert.ok(g.flag.redFlags.every((i) => Number.isInteger(i) && g.flag.lines[i]), 'red flags index lines');
  assert.equal(g.bigGame.scenes.length, 6);
  const scenes = new Set(g.bigGame.scenes.map((s) => s.id));
  for (const s of g.bigGame.scenes) {
    assert.ok(s.text && s.choices.length >= 2, `${s.id}: text and choices`);
    for (const c of s.choices) assert.ok(c.t && c.note && (c.to === null || scenes.has(c.to)), `${s.id}: choice {t, to, note}`);
  }
  assert.ok(!Object.keys(C.cast).includes(g.bigGame.character.name.toLowerCase()), 'an original character');
  assert.equal(g.refusal.length, 4);
  for (const r of g.refusal) {
    assert.ok(r.id && r.scene && r.responses.length === 3, `${r.id}: scene and 3 responses`);
    assert.deepEqual(r.responses.map((x) => x.rating).sort(), ['best', 'ok', 'weak'], `${r.id}: one best, one ok, one weak`);
    assert.ok(r.responses.every((x) => x.t && x.why), `${r.id}: {t, rating, why}`);
  }
  assert.equal(C.comebacks.length, 3);
  assert.ok(C.comebacks.every((x) => typeof x === 'string' && x), 'comebacks are strings');
});

test('content: practices and games keep the restraint rules', () => {
  const all = strings([C.practices, C.games, C.comebacks]);
  assert.ok(!all.some((s) => /\baddicts?\b/i.test(s) && !/^\s*"[^"]*"\s*$/.test(s)), 'no addict noun');
  assert.ok(!all.some((s) => /\b(reset|streak|points?|dose|mg)\b|hopeless|suicid/i.test(s)), 'no reset, streak, points, dose or crisis words');
  assert.deepEqual(E.validateContent(C), []);
});

// U-33: the sample profile (O6). Every row and event sample: true, ids smp-, deterministic, nothing after now.
const NOW = '2026-11-07T10:57:00.000Z';
const sampleRows = (st) => Object.values(st).flat();

test('content: sample passes backup validation', () => {
  const out = C.sample.generate(NOW);
  assert.equal(C.sample.name, 'Sample');
  assert.ok(isObj(out) && isObj(out.stores), '{stores}');
  const v = E.validateBackup({ app: '1-addic', schemaVersion: 1, stores: out.stores });
  assert.ok(v.ok, (v.errors || []).join('; '));
  for (const [name, rows] of Object.entries(out.stores)) {
    const kp = E.STORES[name];
    assert.ok(kp, `known store ${name}`);
    assert.ok(Array.isArray(rows), `${name} is a list`);
    const keys = rows.map((r) => r[kp]);
    assert.ok(keys.every((k) => typeof k === 'string' && k), `${name}: every row has ${kp}`);
    assert.equal(new Set(keys).size, keys.length, `${name}: keys unique`);
  }
  assert.ok(!('meta' in out.stores) && !('settings' in out.stores), 'no meta or settings rows: Actions adds the sample meta row');
});

test('content: all rows sample:true', () => {
  const st = C.sample.generate(NOW).stores;
  assert.ok(sampleRows(st).every((r) => r.sample === true), 'every row and event is marked');
  for (const [name, rows] of Object.entries(st)) if (name !== 'profile') assert.ok(rows.every((r) => /^smp-/.test(r.id)), `${name}: ids smp-`);
  assert.equal(st.profile[0].name, 'Sample');
  assert.ok(st.contacts.every((c) => !/\d/.test(c.phone || '') && /sample/i.test(c.name)), 'invented contacts, no numbers');
  assert.equal(st.contacts.filter((c) => c.role === 'safetyNet').length, 3);
  const logs = (type) => st.logs.filter((l) => l.type === type);
  assert.ok(logs('craving').length >= 12 && logs('craving').length <= 16, 'cravings 12-16');
  assert.equal(logs('checkin').length, 28);
  assert.ok(logs('feeling').length && logs('activity').length, 'feelings and activities');
  assert.equal(st.plans.length, 3);
  assert.ok(st.responses.length >= 4 && st.responses.length <= 6, 'responses 4-6');
  for (const id of ['quick-reasons', 'triggers', 'red-flags']) assert.ok(st.responses.some((r) => r.exerciseId === id && byId(id)), id);
  const now = Date.parse(NOW);
  assert.ok([...st.logs, ...st.events, ...st.responses].every((r) => Date.parse(r.at) <= now), 'nothing after now');
  const logIds = new Set(st.logs.map((l) => l.id));
  assert.ok(st.events.filter((e) => e.payload.logId).every((e) => logIds.has(e.payload.logId)), 'events point at sample logs');
  assert.ok(logs('craving').every((l) => st.events.some((e) => e.type === 'LogCreated' && e.payload.logId === l.id)), 'a LogCreated per craving');
});

test('content: sample is deterministic', () => {
  assert.deepEqual(C.sample.generate(NOW), C.sample.generate(NOW));
  assert.notDeepEqual(C.sample.generate(NOW).stores.logs[0].at, C.sample.generate('2026-12-01T10:00:00.000Z').stores.logs[0].at);
  assert.throws(() => C.sample.generate('not a date'));
  assert.ok(!/Math\.random/.test(String(C.sample.generate)), 'no Math.random');
});

test('content: the sample loads through Actions.loadSample, shows as sample and erases completely', async () => {
  const data = {};
  const keyOf = (s) => E.STORES[s] || 'id';
  const draft = {
    get: (s, k) => (data[s] || []).find((r) => r[keyOf(s)] === k) || null,
    list: (s) => (data[s] || []).slice(),
    put: (s, row) => { data[s] = (data[s] || []).filter((r) => r[keyOf(s)] !== row[keyOf(s)]).concat(row); },
    del: (s, k) => { data[s] = (data[s] || []).filter((r) => r[keyOf(s)] !== k); },
  };
  const before = globalThis.Store;
  globalThis.Store = { commit: async (label, fn) => fn(draft) };
  globalThis.Engine = globalThis.Engine || E;
  try {
    const A = require(src('actions.js'));
    const out = await A.loadSample();
    assert.ok(out.count > 50, `rows put (${out.count})`);
    assert.equal(draft.get('meta', 'sample').key, 'sample', 'the meta row marks the sample');
    assert.equal(draft.get('profile', 'me').name, 'Sample');
    for (const [s, rows] of Object.entries(data)) {
      if (s === 'meta') continue;
      assert.ok(rows.every((r) => r.sample === true), `${s}: every loaded row is sample`);
    }
    // Erase the sample: drop every sample row and the meta row; nothing of it is left.
    for (const s of Object.keys(data)) data[s] = data[s].filter((r) => r.sample !== true && !(s === 'meta' && r.key === 'sample'));
    assert.equal(Object.values(data).flat().length, 0, 'nothing left after erasing the sample');
  } finally {
    globalThis.Store = before;
  }
});

// V-10: the status feature (#/status, PLAN-V3 section 3), its JIT tutorial and its help entry.
const STATUS_TARGETS = ['status-scene', 'status-change', 'status-watch'];
const STATUS_Q = 'What is the status page?';
const statusWords = () => {
  const f = C.features.status || {};
  const t = C.tutorials.find((x) => x.id === 'status') || { steps: [] };
  const help = C.help.filter((x) => x.q === STATUS_Q);
  return [f.name, f.gist, t.name].concat(t.steps.map((s) => s.text), help.flatMap((x) => [x.q, x.a]));
};

test('content: status feature, tutorial and help entry exist', () => {
  const f = C.features.status;
  assert.ok(isObj(f), 'features.status');
  for (const k of ['name', 'gist', 'tab']) assert.ok(typeof f[k] === 'string' && f[k].trim(), `status.${k}`);
  assert.equal(f.tab, 'today');
  // '/status' (featureOfRoute strips '#') until the Engine's route table holds '#/status'; then '#/status', which routeOfFeature also reads.
  assert.ok(['/status', '#/status'].includes(f.route), 'feature route');
  const rv = C.reveal || {};
  assert.ok((rv.m1 || []).includes('status') || (rv.always || []).includes('status'), 'revealed through reveal.m1 or always');
  if ((rv.m1 || []).includes('status')) assert.ok(C.modules.some((m) => m.id === 'm1'), 'm1 is a module id');
  const t = C.tutorials.find((x) => x.id === 'status');
  assert.ok(t, 'tutorial status');
  assert.equal(t.kind, 'jit');
  assert.equal(t.feature, 'status');
  assert.ok(typeof t.name === 'string' && t.name.trim(), 'tutorial name');
  assert.deepEqual(t.steps.map((s) => s.target), STATUS_TARGETS, 'targets in the fixed set, in order');
  for (const s of t.steps) assert.ok(typeof s.text === 'string' && s.text.trim() && !/[<>]/.test(s.text), `${s.target}: plain text`);
  const help = C.help.filter((x) => x.q === STATUS_Q);
  assert.equal(help.length, 1, 'one help entry for the status page');
  // '#/status' once the Engine's route table holds it (validateContent must stay []); until then '#/today', where the Harbor opens.
  assert.ok(['#/status', '#/today'].includes(help[0].route), 'help route');
  assert.ok(E.knownRoute(help[0].route, C), 'help route is in the route table');
  for (const k of ['q', 'a']) assert.ok(typeof help[0][k] === 'string' && help[0][k].trim() && !/[<>]/.test(help[0][k]), `help.${k}`);
  assert.deepEqual(E.validateContent(C), []);
});

test('content: status words promise no outcome', () => {
  const words = statusWords();
  assert.ok(words.length >= 7 && words.every((s) => typeof s === 'string' && s.trim()), 'every status string present');
  for (const s of words) {
    assert.ok(!/guarantee|will (be|stay)|streak|lose|lost/i.test(s), `no outcome promise or streak wording: ${s}`);
    assert.ok(!/\b(drops?|down|addicts?)\b/i.test(s), `no loss wording, person-first: ${s}`);
  }
});
