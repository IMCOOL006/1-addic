// Lane learn's Node tests (node:test, no dependencies). U-12: the exercise engine's pure field logic in
// offline/src/ui-exercise.js (BUILD-PLAN 3.8, tracks/CORE/contracts/learn.md "ExerciseUI"), plus a smoke run of the
// #/dev/fields gallery on a tiny stand-in DOM (the real screens are proven by tests-docs' browser harness).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const src = (f) => join(SRC, f);

globalThis.Content = require(src('content-core.js'));
for (const f of readdirSync(SRC).filter((n) => /^content-.+\.js$/.test(n) && n !== 'content-core.js').sort()) require(src(f));
const X = require(src('ui-exercise.js'));
// The DOM functions are not exported (C2): load the classic script as the browser does, for the stand-in DOM smoke runs.
const classic = (file, name) => vm.runInThisContext(`(function () {
${readFileSync(src(file), 'utf8')}
return ${name};
})()`, { filename: src(file) });
const XD = classic('ui-exercise.js', 'ExerciseUI');
const S = X.SAMPLE_SPEC;
const field = (type) => S.fields.find((f) => f.type === type);
const ex = S.tutorial.example.values;

test('learn: SAMPLE_SPEC covers all 19 types', () => {
  assert.equal(X.FIELD_TYPES.length, 19);
  assert.deepEqual([...new Set(S.fields.map((f) => f.type))].sort(), [...X.FIELD_TYPES].sort());
  assert.equal(S.fields.length, 19);
  assert.equal(new Set(S.fields.map((f) => f.id)).size, 19, 'field ids are unique');
  for (const f of S.fields) assert.ok(typeof f.label === 'string' && f.label.length > 0, `${f.id} has a label`);
  for (const f of S.fields) assert.ok(Object.prototype.hasOwnProperty.call(ex, f.id), `the tutorial example fills ${f.id}`);
});

test('learn: default value per field type', () => {
  const want = {
    check: [], check2: {}, single: null, slider: 0, text: '', textarea: '', list: [], matrix2x2: { q1: [], q2: [], q3: [], q4: [] },
    pair: [], rows: [], template: { feeling: '', action: '' }, bodymap: [], date: '', number: null, yesno: null, percent: null,
    contactPicker: null, rating: null, topN: [],
  };
  for (const t of X.FIELD_TYPES) assert.deepEqual(X.defaultValue(field(t)), want[t], t);
  assert.equal(X.defaultValue({ type: 'slider', min: 3, max: 9 }), 3);
  assert.equal(X.defaultValue({ type: 'slider', min: 0, max: 10, default: 5 }), 5);
  const a = X.defaultValue(field('check')); a.push('x');
  assert.deepEqual(X.defaultValue(field('check')), [], 'each call returns a fresh value');
  assert.deepEqual(X.fromPayload(S, {}), Object.fromEntries(S.fields.map((f) => [f.id, X.defaultValue(f)])));
});

test('learn: payload round trip per type', () => {
  const p = X.toPayload(S, ex);
  const shape = {
    check: (v) => Array.isArray(v) && v.every((s) => typeof s === 'string'),
    check2: (v) => Object.values(v).every((m) => typeof m.done === 'boolean' && typeof m.often === 'boolean'),
    single: (v) => typeof v === 'string', slider: (v) => typeof v === 'number', text: (v) => typeof v === 'string',
    textarea: (v) => typeof v === 'string', list: (v) => Array.isArray(v),
    matrix2x2: (v) => ['q1', 'q2', 'q3', 'q4'].every((q) => Array.isArray(v[q])) && Object.keys(v).length === 4,
    pair: (v) => v.every((x) => typeof x.left === 'string' && typeof x.right === 'string'),
    rows: (v) => v.every((r) => typeof r === 'object'), template: (v) => typeof v.feeling === 'string' && typeof v.action === 'string',
    bodymap: (v) => Array.isArray(v), date: (v) => /^\d{4}-\d{2}-\d{2}$/.test(v), number: (v) => typeof v === 'number',
    yesno: (v) => typeof v === 'boolean', percent: (v) => typeof v === 'number', contactPicker: (v) => typeof v === 'string',
    rating: (v) => Number.isInteger(v) && v >= 1 && v <= 5, topN: (v) => v.every((x) => typeof x.item === 'string' && typeof x.plan === 'string'),
  };
  for (const f of S.fields) {
    assert.ok(shape[f.type](p[f.id]), `${f.type} payload shape`);
    assert.deepEqual(p[f.id], ex[f.id], `${f.type}: the example is already in payload shape`);
  }
  assert.deepEqual(X.fromPayload(S, p), p, 'fromPayload is the inverse of toPayload');
  assert.deepEqual(X.toPayload(S, X.fromPayload(S, p)), p);
  assert.deepEqual(JSON.parse(JSON.stringify(p)), p, 'the payload survives JSON (the store)');
  // Form state in loose shapes normalises to the payload shape.
  const loose = X.toPayload(S, {
    ready: '12', water: '6', sure: '70.4', helpful: '4', told: 'yes', start: '2026-02-30', reasons: [' a ', '', 'b', 'c', 'd'],
    'thought-reply': [{ left: ' x ', right: '' }, { left: '', right: '' }], moments: [{ when: 'Mon', what: '', minutes: '20' }, { when: '', what: '', minutes: '' }],
    signs: { more: { done: false, often: true }, time: { done: false, often: false } }, body: ['chest', 'wing'], promise: { feeling: ' sad ' },
  });
  assert.equal(loose.ready, 10, 'slider clamps to max');
  assert.equal(loose.water, 6); assert.equal(loose.sure, 70); assert.equal(loose.helpful, 4); assert.equal(loose.told, true);
  assert.equal(loose.start, '', 'an impossible date is dropped');
  assert.deepEqual(loose.reasons, ['a', 'b', 'c'], 'list trims, drops blanks and keeps max');
  assert.deepEqual(loose['thought-reply'], [{ left: 'x', right: '' }]);
  assert.deepEqual(loose.moments, [{ when: 'Mon', what: '', minutes: 20 }]);
  assert.deepEqual(loose.signs, { more: { done: true, often: true } }, 'often implies it has happened; empty marks drop');
  assert.deepEqual(loose.body, ['chest'], 'unknown regions drop');
  assert.deepEqual(loose.promise, { feeling: 'sad', action: '' });
  assert.equal(X.toPayload(S, { helpful: 9 }).helpful, null, 'a rating outside 1-5 is no rating');
});

test('learn: required vs optional validation', () => {
  const empty = X.validate(S, X.fromPayload(S, {}), { draft: false });
  assert.equal(empty.ok, false);
  for (const f of S.fields) {
    if (f.optional || f.type === 'slider') assert.ok(!empty.errors[f.id], `${f.id} does not block`);
    else assert.equal(typeof empty.errors[f.id], 'string', `${f.id} is required`);
  }
  assert.deepEqual(X.validate(S, ex, {}), { ok: true, errors: {} });
  const noOptional = Object.assign({}, ex, { 'one-word': '', water: null, told: null });
  assert.equal(X.validate(S, noOptional).ok, true, 'optional fields may stay empty');
  const out = X.validate(S, Object.assign({}, ex, { water: 99 }));
  assert.match(out.errors.water, /0 to 30/, 'a number out of range is named even when optional');
  assert.equal(X.validate(S, Object.assign({}, ex, { start: 'soon' })).errors.start, X.TEXT.date);
  assert.ok(X.validate(S, Object.assign({}, ex, { promise: { feeling: 'x', action: '' } })).errors.promise, 'every blank of a template');
  for (const msg of Object.values(empty.errors)) assert.doesNotMatch(msg, /wrong|fail|error|must/i, 'plain, gentle words');
});

test('learn: draft is not validated', () => {
  assert.deepEqual(X.validate(S, {}, { draft: true }), { ok: true, errors: {} });
  assert.deepEqual(X.validate(S, { water: 999, start: 'nope' }, { draft: true }), { ok: true, errors: {} });
});

test('learn: resume picks newest draft only if newer than final', () => {
  const row = (id, at, draft, exerciseId = 'x') => ({ id, exerciseId, at, draft, payload: { v: id }, mode: 'workbook' });
  assert.deepEqual(X.resume([], 'x'), { draft: null, final: null });
  const d1 = row('d1', '2026-11-01T10:00:00.000Z', true);
  assert.equal(X.resume([d1], 'x').draft, d1, 'a draft with no final resumes');
  const f1 = row('f1', '2026-11-02T10:00:00.000Z', false);
  assert.deepEqual(X.resume([d1, f1], 'x'), { draft: null, final: f1 }, 'a draft older than the final does not');
  const d2 = row('d2', '2026-11-03T10:00:00.000Z', true);
  const d3 = row('d3', '2026-11-04T10:00:00.000Z', true);
  assert.deepEqual(X.resume([d3, f1, d2, d1], 'x'), { draft: d3, final: f1 }, 'the newest draft, whatever the row order');
  assert.deepEqual(X.resume([d3, row('o', '2026-11-05T00:00:00.000Z', false, 'y')], 'x').draft, d3, 'other exercises do not count');
  const same = '2026-11-06T10:00:00.000Z';
  assert.equal(X.resume([row('a', same, false), row('b', same, true)], 'x').draft.id, 'b', 'a tie goes to the later row');
  // start values: tutorial and repeat start empty, workbook prefills the last final, a newer draft wins.
  const spec = { id: 'x', fields: [{ id: 'v', type: 'text', label: 'V' }] };
  const fin = { id: 'f', exerciseId: 'x', at: '2026-11-02T00:00:00.000Z', draft: false, payload: { v: 'final' } };
  const dr = { id: 'd', exerciseId: 'x', at: '2026-11-03T00:00:00.000Z', draft: true, payload: { v: 'draft' } };
  assert.equal(X.startState(spec, [fin], 'workbook').values.v, 'final');
  assert.equal(X.startState(spec, [fin], 'tutorial').values.v, '');
  assert.equal(X.startState(Object.assign({ repeat: true }, spec), [fin], 'workbook').values.v, '');
  assert.equal(X.startState(Object.assign({ repeat: true }, spec), [fin], 'workbook').history.length, 1, 'repeat lists history');
  const st = X.startState(spec, [fin, dr], 'workbook');
  assert.deepEqual([st.values.v, st.base.v, st.draftAt], ['draft', 'final', dr.at], 'Start fresh goes back to the base');
});

test('learn: options from catalogs path and triggers', () => {
  const C = globalThis.Content;
  const red = X.optionsFor({ type: 'check', from: 'catalogs.redFlags' });
  assert.equal(red.length, C.catalogs.redFlags.length);
  assert.deepEqual(red[0], { id: C.catalogs.redFlags[0], label: C.catalogs.redFlags[0] });
  const dist = X.optionsFor({ type: 'single', from: 'catalogs.distortions' });
  assert.equal(dist[0].id, C.catalogs.distortions[0].id); assert.equal(dist[0].label, C.catalogs.distortions[0].name);
  const trig = X.optionsFor({ type: 'check', from: 'triggers' });
  const total = Object.values(C.catalogs.triggers).reduce((n, g) => n + g.length, 0);
  assert.equal(trig.length, total, 'every trigger group is flattened');
  assert.equal(new Set(trig.map((o) => o.id)).size, total, 'trigger ids are unique');
  assert.ok(trig.find((o) => o.id === 'internal:stress' && o.label === 'Stress' && o.group === 'internal'));
  assert.deepEqual(X.optionsFor({ type: 'check', from: 'catalogs.nothing' }), []);
  assert.deepEqual(X.optionsFor({ type: 'single', options: ['A', { id: 'b', label: 'B' }] }), [{ id: 'A', label: 'A' }, { id: 'b', label: 'B' }]);
  const view = { list: (s) => (s === 'contacts' ? [
    { id: 'c1', name: 'Asha', role: 'safetyNet', active: true }, { id: 'c2', name: 'Old crowd', role: 'risky', active: true },
    { id: 'c3', name: 'Gone', role: 'safetyNet', active: false }] : []) };
  assert.deepEqual(X.optionsFor({ type: 'contactPicker', from: 'contacts', role: 'safetyNet' }, view), [{ id: 'c1', label: 'Asha' }]);
  assert.equal(X.optionsFor({ type: 'contactPicker', from: 'contacts' }, view).length, 2, 'no role: every active contact');
  assert.equal(X.optionsFor(field('bodymap')).length, X.REGIONS.length);
});

test('learn: topN limited to checked items', () => {
  const base = { 'pick-triggers': ['internal:stress', 'internal:boredom'] };
  const p = X.toPayload(S, Object.assign({}, base, { top: [
    { item: 'internal:stress', plan: ' walk ' }, { item: 'places:a-friend-s-house', plan: 'x' }, { item: 'internal:stress', plan: 'dup' },
    { item: 'internal:boredom', plan: '' }] }));
  assert.deepEqual(p.top, [{ item: 'internal:stress', plan: 'walk' }, { item: 'internal:boredom', plan: '' }]);
  const three = X.toPayload(S, { 'pick-triggers': ['a', 'b', 'c'], top: [{ item: 'a' }, { item: 'b' }, { item: 'c' }] });
  assert.equal(three.top.length, 2, 'never more than max');
  assert.deepEqual(X.toPayload(S, { top: [{ item: 'internal:stress' }] }).top, [], 'nothing checked, nothing to pick');
  const spec2 = { id: 'y', fields: [{ id: 's', type: 'check2', options: ['a', 'b'] }, { id: 't', type: 'topN' }] };
  assert.deepEqual(X.toPayload(spec2, { s: { a: { done: true, often: false } }, t: [{ item: 'a' }, { item: 'b' }] }).t, [{ item: 'a', plan: '' }],
    'with no source named, the nearest check above it is the source');
});

test('learn: crisis words show urgent help through Engine only, on typed answers', () => {
  const seen = [];
  const E = { crisisKeywords: (t) => { seen.push(t); return t.includes('danger-word'); } };
  assert.equal(X.crisisCheck(S, Object.assign({}, ex, { different: 'a danger-word here' }), E), true);
  assert.equal(X.crisisCheck(S, ex, E), false);
  assert.ok(seen.every((t) => typeof t === 'string' && t.length > 0));
  assert.equal(X.crisisCheck(S, { different: 'danger-word' }, null), false, 'no Engine: nothing shown, saving never blocked');
  const L = { crisisKeywords: (t) => (t.includes('danger-word') ? ['danger-word'] : []) };
  assert.equal(X.crisisCheck(S, { different: 'a danger-word here' }, L), true, 'a non-empty word list counts as a hit');
  assert.equal(X.crisisCheck(S, { different: 'calm' }, L), false, 'an empty list is no hit');
  assert.equal(X.URGENT_LINE.clinicalReview, true);
  assert.equal(X.URGENT_LINE.route, '#/sos/urgent');
});

test('learn: exercise lookup and summaries', () => {
  const C = { exercises: [{ id: 'quick-reasons', title: 'Q', fields: [] }] };
  assert.equal(X.exerciseFor('quick-reasons', C).title, 'Q');
  assert.equal(X.exerciseFor('nope', C), null);
  assert.equal(X.exerciseFor('quick-reasons', { exercises: { 'quick-reasons': { title: 'M', fields: [] } } }).id, 'quick-reasons');
  assert.equal(X.exerciseFor('quick-reasons', {}), null, 'no Content.exercises yet: not available');
  const vals = X.fromPayload(S, ex);
  const view = { list: (s) => (s === 'contacts' ? X.SAMPLE_CONTACTS : []) };
  for (const f of S.fields) assert.ok(X.summarize(f, vals[f.id], view, null, S, vals).length > 0, `${f.type} summary`);
  assert.equal(X.summarize(field('template'), vals.promise, null, null, S, vals), 'When I feel lonely, I will call my sister.');
  assert.equal(X.summarize(field('check'), vals['pick-triggers'], null, null, S, vals), 'Stress, Loneliness, Long evenings alone');
});

test('learn: ui-exercise.js inserts text as text and makes no network call', () => {
  const code = readFileSync(src('ui-exercise.js'), 'utf8');
  assert.doesNotMatch(code, /\.innerHTML\s*=|outerHTML\s*=|insertAdjacentHTML|document\.write/);
  assert.doesNotMatch(code, /\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|https?:\/\//);
  assert.doesNotMatch(code, /localStorage|sessionStorage|indexedDB/);
  assert.doesNotMatch(code, /globalThis\.(Content|Engine|Store|Actions|UI)\b/);
  assert.doesNotMatch(code, /\baddicts?\b(?!ed|ion)/i, 'person-first words');
});

test('learn: module.exports carries the pure functions only', () => {
  for (const k of ['render', 'open', 'gallery', 'devPage', 'exercisePage']) {
    assert.equal(X[k], undefined, `${k} is not exported`);
    assert.equal(typeof XD[k], 'function', `${k} stays on the global ExerciseUI`);
  }
  for (const k of ['defaultValue', 'toPayload', 'fromPayload', 'validate', 'optionsFor', 'resume', 'crisisCheck']) assert.equal(typeof X[k], 'function', k);
});

/* ── a tiny stand-in DOM: enough for the gallery to render, save and resume a draft ─────────── */
function fakeDom() {
  class Node {
    constructor(tag) { this.tagName = tag; this.nodeType = tag === '#text' ? 3 : 1; this.children = []; this.attrs = {}; this.on = {}; this.style = {}; this.hidden = false; this._text = ''; this.parentNode = null;
      this.classList = { toggle: () => {}, add: () => {}, remove: () => {} }; }
    appendChild(c) { this.children.push(c); c.parentNode = this; return c; }
    insertBefore(c, ref) { const i = ref ? this.children.indexOf(ref) : this.children.length; this.children.splice(i, 0, c); c.parentNode = this; return c; }
    get nextSibling() { const p = this.parentNode; return p ? p.children[p.children.indexOf(this) + 1] || null : null; }
    setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'hidden') this.hidden = true; }
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null; }
    addEventListener(t, fn) { (this.on[t] = this.on[t] || []).push(fn); }
    fire(t) { const e = { type: t, preventDefault() {}, key: '' }; (this.on[t] || []).forEach((fn) => fn(e)); }
    focus() {}
    set textContent(v) { this.children = []; this._text = String(v); }
    get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
    all(pred, out = []) { for (const c of this.children) { if (pred(c)) out.push(c); c.all(pred, out); } return out; }
    querySelector() { return null; }
    querySelectorAll(sel) { return sel === 'input[data-item]' ? this.all((n) => n.tagName === 'input' && n.getAttribute('data-item') !== null) : []; }
  }
  return { createElement: (t) => new Node(t), createTextNode: (s) => { const n = new Node('#text'); n._text = String(s); return n; } };
}

test('learn: the gallery renders every field type, saves and resumes a draft (stand-in DOM)', async () => {
  globalThis.document = fakeDom();
  try {
    const page = XD.gallery({ route: { parts: ['dev', 'fields'], query: {} }, view: null });
    const byTest = (p) => page.all((n) => (n.getAttribute && n.getAttribute('data-test') || '').startsWith(p));
    const types = byTest('fld-type-').map((n) => n.getAttribute('data-test').slice(9));
    assert.deepEqual(types.sort(), [...X.FIELD_TYPES].sort(), 'one section per field type');
    for (const f of S.fields) assert.equal(byTest('fld-' + f.id).filter((n) => n.getAttribute('data-test') === 'fld-' + f.id).length, 1, `hook fld-${f.id}`);
    const tour = (name) => page.all((n) => n.getAttribute && n.getAttribute('data-tour') === name)[0];
    assert.ok(tour('exercise-save') && tour('exercise-later'));
    const form = page.all((n) => n.tagName === 'form')[0];
    form.fire('submit');
    await new Promise((r) => setTimeout(r, 0));
    assert.equal(byTest('payload')[0].textContent, '', 'a final save with empty required fields does not save');
    const alert = form.all((n) => n.getAttribute && n.getAttribute('role') === 'alert')[0];
    assert.equal(alert.hidden, false); assert.equal(alert.textContent, X.TEXT.summary);
    const text = form.all((n) => n.tagName === 'textarea')[0];
    text.value = 'Calmer mornings'; text.fire('input');
    tour('exercise-later').fire('click');
    await new Promise((r) => setTimeout(r, 0));
    const json = JSON.parse(byTest('payload')[0].textContent);
    assert.equal(json.draft, true); assert.equal(json.payload.different, 'Calmer mornings');
    assert.equal(byTest('exercise-draft-note').length, 1, 'the draft resumes with its note');
    assert.equal(byTest('exercise-fresh').length, 1, 'and a Start fresh button');
    const again = XD.gallery({ route: { parts: ['dev', 'fields'], query: { mode: 'tutorial' } }, view: null });
    assert.equal(again.all((n) => n.getAttribute && n.getAttribute('data-test') === 'exercise-draft-note').length, 1, 'reopening resumes the draft');
    assert.ok(again.all((n) => n.tagName === 'details').length >= 1, 'tutorial mode shows the example first');
    const missing = XD.open('not-an-exercise', { from: 'm0-l2' }, { view: null });
    assert.match(missing.textContent, /Not available yet/);
    assert.equal(missing.all((n) => n.tagName === 'a')[0].getAttribute('href'), '#/lesson/m0-l2', 'never a dead end');
  } finally { delete globalThis.document; }
});

/* ── U-13 / U-14: the lesson player, the checkpoint, the roadmap and the glossary (ui-learn.js) ── */
const LX = require(src('ui-learn.js'));
const LD = classic('ui-learn.js', 'LearnUI');
const M = Content.modules;
const lessonsAll = M.flatMap((m) => m.lessons);
const ev = (type, payload, at) => ({ id: `${type}-${JSON.stringify(payload)}-${at}`, type, at, payload });
const viewOf = (events, profile) => ({ list: (s) => (s === 'events' ? events : []), get: (s) => (s === 'profile' ? profile : null) });
const NOW = new Date(2026, 10, 7, 10, 0); // Sat 7 Nov 2026, local time

test('learn: lesson step sequence', () => {
  const l1 = M[0].lessons[0];
  const kinds = LX.lessonSteps(l1).map((s) => s.kind);
  assert.equal(kinds[0], 'moment');
  assert.equal(kinds[kinds.length - 1], 'wrap');
  assert.equal(kinds.filter((k) => k === 'card').length, l1.cards.length);
  assert.equal(kinds.filter((k) => k === 'check').length, l1.checks.length);
  assert.deepEqual(kinds, ['moment', ...l1.cards.map(() => 'card'), ...l1.checks.map(() => 'check'), 'tryit', 'wrap']);
  const noTry = lessonsAll.find((l) => l.tryIt === null);
  assert.ok(noTry && !LX.lessonSteps(noTry).some((s) => s.kind === 'tryit'), 'tryIt null is skipped');
  assert.deepEqual(LX.lessonSteps({}).map((s) => s.kind), ['wrap'], 'an empty lesson still ends with a wrap');
});

test('learn: every lesson yields at least 4 steps', () => {
  assert.ok(lessonsAll.length >= 16);
  for (const l of lessonsAll) assert.ok(LX.lessonSteps(l).length >= 4, l.id);
});

test('learn: check never fails', () => {
  for (const l of lessonsAll) {
    for (const c of l.checks) {
      c.options.forEach((o, i) => {
        const r = LX.checkResult(c, i);
        assert.deepEqual(Object.keys(r).sort(), ['helpful', 'ok', 'why'], 'no score, no fail field');
        assert.ok(r.why.length > 0, `${l.id}: every option explains itself`);
        assert.equal(r.ok, !!o.ok);
        assert.ok(r.helpful >= 0, `${l.id}: a helpful reading exists`);
      });
    }
  }
  assert.deepEqual(LX.checkResult({ options: [] }, 3), { why: '', ok: false, helpful: -1 });
  assert.deepEqual(LX.checkResult(null, null), { why: '', ok: false, helpful: -1 });
});

test('learn: tryIt kinds', () => {
  const byKind = (k) => lessonsAll.find((l) => LX.tryItOf(l).kind === k);
  const ex = byKind('exercise');
  assert.equal(LX.tryItOf(ex).href, `#/exercise/${ex.tryIt.exercise}?mode=tutorial&from=${ex.id}`);
  const ro = byKind('route');
  assert.equal(LX.tryItOf(ro).href, ro.tryIt.route);
  assert.equal(LX.tryItOf(ro).label, ro.tryIt.label);
  assert.equal(LX.tryItOf({ tryIt: null }).kind, 'none');
  assert.equal(LX.tryItOf({ tryIt: { route: 'https://example.org' } }).kind, 'none', 'only in-app routes');
});

test('learn: checkpoint answers shape', () => {
  const qs = LX.checkpointQuestions(M[0], Content);
  assert.equal(qs.length, 2, 'generated from the module\'s first two checks');
  assert.deepEqual(LX.checkpointAnswers(qs, [1]), [{ q: qs[0].q, optionIndex: 1 }, { q: qs[1].q, optionIndex: null }]);
  const own = [{ q: 'Own one?', options: [{ t: 'a', ok: true, why: 'x' }, { t: 'b', ok: false, why: 'y' }] }];
  const C2 = Object.assign({}, Content, { exercises: [{ id: 'checkpoint', modules: { m0: own } }] });
  assert.deepEqual(LX.checkpointQuestions(M[0], C2), own, 'the checkpoint exercise wins when present');
});

test('learn: planWeeks steady gentle focused', () => {
  const done = new Set(['m0']);
  const steady = LX.planWeeks({ pace: 'steady', roadmapStart: '2026-11-02' }, done, NOW, Content);
  assert.equal(steady.free, false);
  assert.equal(steady.weeks.length, 11);
  assert.deepEqual(steady.weeks[0], { n: 1, start: '2026-11-02', end: '2026-11-08', span: 1, moduleIds: ['m0'], state: 'done' });
  assert.equal(steady.weeks[1].start, '2026-11-09');
  assert.equal(steady.weeks[1].state, 'upcoming');
  assert.equal(steady.current, 0);
  assert.equal(steady.next, 'm1');
  const gentle = LX.planWeeks({ pace: 'gentle', roadmapStart: '2026-11-02' }, new Set(), NOW, Content);
  assert.equal(gentle.weeks.length, 11);
  assert.equal(gentle.weeks[1].start, '2026-11-16', 'one stop every two weeks');
  assert.equal(gentle.weeks[0].end, '2026-11-15');
  assert.equal(gentle.weeks[0].state, 'current');
  const focused = LX.planWeeks({ pace: 'focused', roadmapStart: '2026-11-02' }, new Set(), NOW, Content);
  assert.equal(focused.weeks.length, 6);
  assert.deepEqual(focused.weeks[0].moduleIds, ['m0', 'm1']);
  assert.deepEqual(focused.weeks[5].moduleIds, ['m10']);
  const noStart = LX.planWeeks({}, new Set(), NOW, Content);
  assert.equal(noStart.pace, 'steady');
  assert.equal(noStart.weeks[0].start, '2026-11-07', 'no roadmapStart: the plan starts today');
});

test('learn: custom pace', () => {
  const p = LX.planWeeks({ pace: 'custom', customPerWeek: 3, roadmapStart: '2026-11-02' }, new Set(), NOW, Content);
  assert.equal(p.pace, 'custom');
  assert.equal(p.weeks.length, 4);
  assert.deepEqual(p.weeks[0].moduleIds, ['m0', 'm1', 'm2']);
  assert.equal(LX.planWeeks({ pace: 'custom' }, new Set(), NOW, Content).weeks.length, 11, 'no number: one a week');
  assert.equal(LX.planWeeks({ pace: 'custom', customPerWeek: 99 }, new Set(), NOW, Content).weeks.length, 2, 'capped at 7');
});

test('learn: free has no dates', () => {
  const p = LX.planWeeks({ pace: 'free', roadmapStart: '2026-01-01' }, new Set(['m0']), NOW, Content);
  assert.equal(p.free, true);
  assert.deepEqual(p.weeks, []);
  assert.equal(p.order.length, 11);
  assert.equal(p.next, 'm1');
  assert.doesNotMatch(JSON.stringify(p), /\d{4}-\d{2}-\d{2}/, 'no date anywhere');
});

test('learn: nothing overdue', () => {
  const words = /\b(overdue|late|behind|missed)\b/i;
  const states = new Set();
  for (const pace of ['gentle', 'steady', 'focused', 'custom']) {
    const p = LX.planWeeks({ pace, customPerWeek: 2, roadmapStart: '2025-01-06' }, new Set(['m1']), NOW, Content);
    p.weeks.forEach((w) => states.add(w.state));
  }
  assert.deepEqual([...states].sort(), ['done', 'open'], 'a week gone by unfinished is only "open"');
  const strings = [];
  const walk = (v) => {
    if (typeof v === 'string') strings.push(v);
    else if (typeof v === 'function') strings.push(String(v(2, 3)));
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(LX.TEXT);
  for (const s of strings) assert.doesNotMatch(s, words, s);
  assert.equal(LX.TEXT.state.open, 'Still open');
  const code = readFileSync(src('ui-learn.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(code, words, 'no such word in any string the module can emit');
  assert.doesNotMatch(code, /innerHTML\s*=|fetch\(|XMLHttpRequest|localStorage|https?:\/\//);
  assert.doesNotMatch(code, /globalThis\.(Content|Engine|Store|Actions|UI)\b/);
  assert.doesNotMatch(code, /\baddicts?\b(?!ed|ion)/i, 'person-first words');
});

test('learn: welcome back after gap', () => {
  const at = (d) => new Date(2026, 9, d, 12).toISOString(); // October 2026
  const events = [ev('LessonCompleted', { lessonId: 'm0-l1' }, at(1)), ev('LessonCompleted', { lessonId: 'm0-l2' }, at(20))];
  assert.equal(LX.needsWelcomeBack({ pace: 'steady', roadmapStart: '2026-09-01' }, events, NOW), true, '18 days since the last lesson');
  assert.equal(LX.needsWelcomeBack({ pace: 'steady', roadmapStart: '2026-11-07' }, events, NOW), false, 're-planned this week');
  assert.equal(LX.needsWelcomeBack({ pace: 'steady' }, events, new Date(2026, 10, 2)), false, '13 days is not a gap');
  assert.equal(LX.needsWelcomeBack({ pace: 'steady' }, [], NOW), false, 'no lesson yet: nothing to come back to');
  assert.equal(LX.needsWelcomeBack({ pace: 'free' }, events, NOW), false, 'Free has no plan to re-plan');
});

test('learn: map progress from events', () => {
  const t = new Date(2026, 10, 5).toISOString();
  const events = [ev('LessonCompleted', { lessonId: 'm0-l1' }, t), ev('LessonCompleted', { lessonId: 'm0-l2' }, t),
    ev('LessonCompleted', { lessonId: 'm0-l3' }, t), ev('CheckpointCompleted', { moduleId: 'm0' }, t),
    ev('LessonCompleted', { lessonId: 'm1-l1' }, t), ev('SkillUsed', { skillId: Content.skills[0].id, helpful: true }, t)];
  const stops = LX.mapData(viewOf(events, { pace: 'steady', roadmapStart: '2026-11-02' }), NOW, Content, null);
  assert.equal(stops.length, 11);
  assert.deepEqual(stops.map((s) => s.id), ['m0', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10']);
  assert.equal(stops[0].done, M[0].lessons.length);
  assert.equal(stops[0].complete, true);
  assert.equal(stops[0].checkpointDone, true);
  assert.equal(stops[1].done, 1);
  assert.equal(stops[1].complete, false);
  assert.equal(stops.filter((s) => s.current).length, 1, 'one stop is highlighted');
  assert.equal(stops[1].current, true, 'the first stop with lessons to go');
  for (const s of stops) assert.equal(s.loaded, M.some((m) => m.id === s.id), `${s.id} is loaded when Content.modules has it`);
  // A stop without content (a stub without M4, so this holds with or without the full content) shows as coming, never locked.
  const noM4 = LX.mapData(viewOf(events, {}), NOW, Object.assign({}, Content, { modules: M.filter((m) => m.id !== 'm4') }), null);
  assert.equal(noM4[4].loaded, false, 'a stop not in this version is shown as coming');
  assert.equal(noM4[4].name, 'Set Yourself Up');
  assert.ok(stops[2].unlocks.includes('Glossary'), 'unlocks name Content.features');
  const more = LX.mapData(viewOf(events.concat([ev('SlipLogged', { date: '2026-11-06' }, t)]), {}), NOW, Content, null);
  assert.equal(more[0].done, stops[0].done, 'a slip never lowers progress');
  const eng = { lessonsDone: () => new Set(['m2-l1']), modulesDone: () => new Set() };
  assert.equal(LX.mapData(viewOf([], {}), NOW, Content, eng)[2].done, 1, 'Engine.lessonsDone is used when present');
});

test('learn: glossary filter', () => {
  const list = [{ term: 'Trigger', def: 'Something that sets off a craving.' }, { term: 'Craving', def: 'A strong want.' }, { term: '', def: 'x' }];
  assert.deepEqual(LX.glossaryFilter(list, '').map((r) => r.term), ['Craving', 'Trigger'], 'sorted, blanks dropped');
  assert.deepEqual(LX.glossaryFilter(list, 'CRAV').map((r) => r.term), ['Craving', 'Trigger'], 'term or definition, any case');
  assert.deepEqual(LX.glossaryFilter(list, 'strong').map((r) => r.term), ['Craving']);
  assert.deepEqual(LX.glossaryFilter(list, 'zzz'), []);
  assert.ok(LX.glossaryFilter(Content.glossary, '').length === Content.glossary.length);
});

test('learn: focusData', () => {
  const t = new Date(2026, 10, 5).toISOString();
  const d = LX.focusData(viewOf([ev('LessonCompleted', { lessonId: 'm0-l1' }, t)], { pace: 'steady', roadmapStart: '2026-11-02' }), NOW, Content, null);
  assert.equal(d.moduleId, 'm0');
  assert.equal(d.lessonsLeft, M[0].lessons.length - 1);
  assert.equal(d.nextLessonId, 'm0-l2');
  assert.equal(d.minutes, M[0].lessons.slice(1).reduce((a, l) => a + l.minutes, 0));
  assert.ok('practiceGoal' in d);
  const all = lessonsAll.map((l) => ev('LessonCompleted', { lessonId: l.id }, t));
  assert.equal(LX.focusData(viewOf(all, {}), NOW, Content, null), null, 'everything here done: no focus');
  assert.equal(LX.focusData(viewOf([], {}), NOW, Content, null).moduleId, 'm0', 'an empty profile starts at M0');
});

function stubActions(events, profile) {
  const at = () => new Date(2026, 10, 7, 10, events.length).toISOString();
  const add = (type, payload) => events.push(ev(type, payload, at()));
  const has = (type, k, v) => events.some((e) => e.type === type && e.payload[k] === v);
  const modOf = (lid) => M.find((m) => m.lessons.some((l) => l.id === lid));
  const allDone = (m) => m.lessons.every((l) => has('LessonCompleted', 'lessonId', l.id));
  const calls = [];
  return {
    calls,
    async completeLesson(id) {
      calls.push(['completeLesson', id]);
      if (has('LessonCompleted', 'lessonId', id)) return;
      add('LessonCompleted', { lessonId: id });
      const m = modOf(id);
      if (allDone(m) && has('CheckpointCompleted', 'moduleId', m.id) && !has('ModuleCompleted', 'moduleId', m.id)) add('ModuleCompleted', { moduleId: m.id });
    },
    async checkpoint(mid, answers) {
      calls.push(['checkpoint', mid, answers]);
      if (!has('CheckpointCompleted', 'moduleId', mid)) add('CheckpointCompleted', { moduleId: mid });
      if (allDone(M.find((m) => m.id === mid)) && !has('ModuleCompleted', 'moduleId', mid)) add('ModuleCompleted', { moduleId: mid });
    },
    todos: { async add(t) { calls.push(['todos.add', t]); } },
    async onboard(p) { calls.push(['onboard', p]); Object.assign(profile, p); },
  };
}

test('learn: M0 plays end to end and writes LessonCompleted, CheckpointCompleted, ModuleCompleted (stand-in DOM)', async () => {
  globalThis.document = fakeDom();
  const routes = [];
  globalThis.UI = { go: (r) => routes.push(r), toast() {} };
  const tick = () => new Promise((r) => setTimeout(r, 0));
  try {
    const events = [];
    const profile = { pace: 'steady', onboardedAt: '2026-11-01T10:00:00.000Z' };
    const view = viewOf(events, profile);
    const A = stubActions(events, profile);
    const find = (root, attr, val) => root.all((n) => n.getAttribute && n.getAttribute(attr) === val);
    for (const l of M[0].lessons) {
      const steps = LD.lessonSteps(l);
      steps.forEach((s, k) => {
        const page = LD.lessonPage({ route: { parts: ['lesson', l.id], query: { step: String(k) } }, view, A, E: null });
        assert.equal(find(page, 'data-test', 'lesson-step')[0].getAttribute('data-step'), s.kind, `${l.id} step ${k}`);
        assert.doesNotMatch(page.textContent, /\b(wrong|incorrect|failed|overdue)\b/i);
        if (s.kind === 'check') {
          find(page, 'data-test', 'check-opt-0')[0].fire('click');
          assert.equal(find(page, 'data-test', 'check-why')[0].textContent, l.checks[s.i].options[0].why, 'any choice shows its why');
        }
        if (s.kind === 'tryit') assert.ok(find(page, 'data-test', 'lesson-tryit')[0].getAttribute('href').startsWith('#/'));
        if (s.kind !== 'wrap') {
          const next = find(page, 'data-tour', 'lesson-next')[0];
          next.fire('click');
          assert.equal(routes[routes.length - 1], `#/lesson/${l.id}?step=${k + 1}`, 'Next is always enabled');
        }
      });
      const wrap = LD.lessonPage({ route: { parts: ['lesson', l.id], query: { step: String(steps.length - 1) } }, view, A, E: null });
      assert.equal(find(wrap, 'data-tour', 'lesson-wrap').length, 1);
      find(wrap, 'data-test', 'lesson-finish')[0].fire('click');
      await tick();
    }
    assert.equal(routes[routes.length - 1], '#/learn/m0?checkpoint=1', 'the last lesson leads to the checkpoint');
    assert.deepEqual(events.map((e) => e.type), M[0].lessons.map(() => 'LessonCompleted'));
    const again = LD.lessonPage({ route: { parts: ['lesson', 'm0-l1'], query: { step: '99' } }, view, A, E: null });
    assert.equal(find(again, 'data-test', 'lesson-step')[0].getAttribute('data-step'), 'moment', 'a bad step starts at the top');
    const cp = LD.learnPage({ route: { parts: ['learn', 'm0'], query: { checkpoint: '1' } }, view, A, E: null });
    assert.equal(find(cp, 'data-test', 'checkpoint-q-1').length + find(cp, 'data-test', 'checkpoint-q-2').length, 2);
    find(cp, 'data-test', 'cp-opt-1-1')[0].fire('click');
    find(cp, 'data-test', 'checkpoint-finish')[0].fire('click');
    await tick();
    const cpCall = A.calls.find((x) => x[0] === 'checkpoint');
    assert.equal(cpCall[1], 'm0');
    assert.deepEqual(cpCall[2].map((a) => a.optionIndex), [1, null], 'answers [{q, optionIndex}], no pass mark');
    assert.deepEqual(events.map((e) => e.type).slice(-2), ['CheckpointCompleted', 'ModuleCompleted']);
    assert.equal(A.calls.filter((x) => x[0] === 'completeLesson').length, M[0].lessons.length, 'completeLesson once per lesson');
    const replay = LD.lessonPage({ route: { parts: ['lesson', 'm0-l1'], query: { step: String(LD.lessonSteps(M[0].lessons[0]).length - 1) } }, view, A, E: null });
    find(replay, 'data-test', 'lesson-finish')[0].fire('click');
    await tick();
    assert.equal(A.calls.filter((x) => x[0] === 'completeLesson').length, M[0].lessons.length, 'a done lesson is not completed again');
    const mod = LD.learnPage({ route: { parts: ['learn', 'm0'], query: {} }, view, A, E: null });
    assert.equal(find(mod, 'data-test', 'module-checkpoint').length, 1);
    assert.match(mod.textContent, new RegExp(`${M[0].lessons.length} of ${M[0].lessons.length} lessons done`));
    const missing = LD.lessonPage({ route: { parts: ['lesson', 'm9-l9'], query: {} }, view, A, E: null });
    assert.match(missing.textContent, /Not available yet/);
    // A stop without content: a stub Content without m7, so this holds with or without the full content.
    const full = globalThis.Content;
    globalThis.Content = Object.assign({}, full, { modules: M.filter((m) => m.id !== 'm7') });
    try {
      const coming = LD.learnPage({ route: { parts: ['learn', 'm7'], query: {} }, view, A, E: null });
      assert.match(coming.textContent, /coming in a future update/i);
    } finally { globalThis.Content = full; }
  } finally { delete globalThis.document; delete globalThis.UI; }
});

test("learn: the checkpoint toast says +10 XP only the first time a module's checkpoint is finished (V-20 C3)", async () => {
  globalThis.document = fakeDom();
  const toasts = [];
  globalThis.UI = { go() {}, toast: (m) => toasts.push(m) };
  const tick = () => new Promise((r) => setTimeout(r, 0));
  try {
    const events = [];
    const profile = { pace: 'steady', onboardedAt: '2026-11-01T10:00:00.000Z' };
    const view = viewOf(events, profile);
    const A = stubActions(events, profile);
    const finish = async (mid, calm) => {
      const cp = LD.learnPage({ route: { parts: ['learn', mid], query: { checkpoint: '1' } }, view, A, E: null, calm });
      cp.all((n) => n.getAttribute && n.getAttribute('data-test') === 'checkpoint-finish')[0].fire('click');
      await tick();
      return toasts[toasts.length - 1];
    };
    assert.equal(await finish(M[0].id), LX.TEXT.cpDone + LX.TEXT.xp, 'the first finish earns and says so');
    assert.equal(await finish(M[0].id), LX.TEXT.cpDone, 'a second finish of the same checkpoint earns nothing and does not say so');
    assert.equal(events.filter((e) => e.type === 'CheckpointCompleted').length, 1, 'one event for the module');
    assert.equal(await finish(M[1].id), LX.TEXT.cpDone + LX.TEXT.xp, 'each module earns once, on its own first finish');
    assert.equal(await finish(M[2].id, true), LX.TEXT.cpDone, 'calm mode never names XP, first time included');
  } finally { delete globalThis.document; delete globalThis.UI; }
});

test('learn: "Why this works" shows its sources in the page when there is no UI.sheet, once (V-20 C4)', () => {
  globalThis.document = fakeDom();
  const byTest = (root, v) => root.all((n) => n.getAttribute && n.getAttribute('data-test') === v);
  const lesson = M[0].lessons[0];
  const wrapAt = String(LD.lessonSteps(lesson).length - 1);
  const open = () => LD.lessonPage({ route: { parts: ['lesson', lesson.id], query: { step: wrapAt } }, view: viewOf([], {}), A: null, E: null });
  try {
    globalThis.UI = { go() {}, toast() {} };
    const page = open();
    const why = byTest(page, 'lesson-why')[0];
    assert.equal(byTest(page, 'lesson-refs').length, 0, 'nothing shown before the tap');
    why.fire('click');
    assert.equal(byTest(page, 'lesson-refs').length, 1, 'the tap shows the sources in the page');
    assert.equal(why.nextSibling.getAttribute('data-test'), 'lesson-refs', 'straight after the button');
    assert.ok(why.nextSibling.textContent.length > 0, 'the block has words in it');
    why.fire('click');
    assert.equal(byTest(page, 'lesson-refs').length, 1, 'a second tap does not stack a copy');

    const sheets = [];
    globalThis.UI = { go() {}, toast() {}, sheet: (title, body) => sheets.push([title, body]) };
    const withSheet = open();
    byTest(withSheet, 'lesson-why')[0].fire('click');
    assert.equal(sheets.length, 1, 'with UI.sheet the sources open there');
    assert.equal(sheets[0][0], LX.TEXT.why);
    assert.equal(sheets[0][1].getAttribute('data-test'), 'lesson-refs');
    assert.equal(byTest(withSheet, 'lesson-refs').length, 0, 'and not in the page as well');
  } finally { delete globalThis.document; delete globalThis.UI; }
});

test('learn: map, plan, glossary and the focus card render with their hooks (stand-in DOM)', async () => {
  globalThis.document = fakeDom();
  try {
    const t = new Date(2026, 9, 1).toISOString();
    const events = [ev('LessonCompleted', { lessonId: 'm0-l1' }, t)];
    const profile = { pace: 'steady', roadmapStart: '2026-09-07', onboardedAt: t };
    const view = viewOf(events, profile);
    const A = stubActions(events, profile);
    const find = (root, attr, val) => root.all((n) => n.getAttribute && n.getAttribute(attr) === val);
    const words = /\b(overdue|late|behind|missed)\b/i;
    const map = LD.learnPage({ route: { parts: ['learn'], query: {} }, view, A, E: null, now: NOW });
    for (const id of ['m0', 'm4', 'm10']) assert.equal(find(map, 'data-test', 'stop-' + id).length, 1, 'stop-' + id);
    assert.equal(find(map, 'data-test', 'map-current').length, 1);
    for (const k of ['learn-map', 'learn-plan', 'learn-glossary']) assert.equal(find(map, 'data-tour', k).length, 1, k);
    const plan = LD.learnPage({ route: { parts: ['learn', 'plan'], query: {} }, view, A, E: null, now: NOW });
    assert.equal(find(plan, 'data-test', 'plan-week-1').length, 1);
    assert.equal(find(plan, 'data-test', 'plan-week-1')[0].getAttribute('data-state'), 'open');
    assert.match(plan.textContent, /Still open/);
    assert.doesNotMatch(plan.textContent, words);
    assert.equal(find(plan, 'data-test', 'welcome-back').length, 1, 'more than 14 days since the last lesson');
    find(plan, 'data-test', 'welcome-replan')[0].fire('click');
    await new Promise((r) => setTimeout(r, 0));
    assert.deepEqual(A.calls.find((x) => x[0] === 'onboard')[1], { roadmapStart: '2026-11-07' });
    const fresh = LD.learnPage({ route: { parts: ['learn', 'plan'], query: {} }, view, A, E: null, now: NOW });
    assert.equal(find(fresh, 'data-test', 'welcome-back').length, 0, 'gone after re-planning');
    assert.equal(find(fresh, 'data-test', 'plan-week-1')[0].getAttribute('data-state'), 'current');
    const free = LD.learnPage({ route: { parts: ['learn', 'plan'], query: {} }, view: viewOf(events, { pace: 'free' }), A, E: null, now: NOW });
    assert.equal(find(free, 'data-test', 'plan-week-1').length, 0, 'Free shows the order only');
    const gl = LD.learnPage({ route: { parts: ['learn', 'glossary'], query: {} }, view, A, E: null });
    const q = find(gl, 'data-test', 'glossary-search')[0];
    assert.equal(find(gl, 'data-test', 'glossary-count')[0].textContent, `${Content.glossary.length} terms`);
    q.value = 'zzzz-no-term'; q.fire('input');
    assert.equal(find(gl, 'data-test', 'glossary-count')[0].textContent, LD.TEXT.noMatch);
    const card = LD.focusCard({ view, A, E: null, now: NOW });
    assert.equal(card.getAttribute('data-test'), 'focus-card');
    assert.equal(find(card, 'data-test', 'focus-go')[0].getAttribute('href'), '#/lesson/m0-l2');
    const empty = LD.learnPage({ route: { parts: ['learn'], query: {} }, view: viewOf([], {}), A: null, E: null, now: NOW });
    assert.equal(find(empty, 'data-test', 'stop-m0').length, 1, 'works on an empty profile');
  } finally { delete globalThis.document; }
});
