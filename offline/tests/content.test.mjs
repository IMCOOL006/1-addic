// Lane content's Node tests (node:test, no dependencies). U-31a: the M0-M3 exercises of BUILD-PLAN 3.8 and the
// checkpoint, the content-core safety asks (R-C-13, R-C-18), and Engine.validateContent over the loaded content.
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
for (const f of ['content-lessons-a.js', 'content-lessons-b.js', 'content-lessons-c.js', 'content-exercises.js']) {
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
