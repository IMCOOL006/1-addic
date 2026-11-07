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
    const missing = XD.open('quick-reasons', { from: 'm0-l2' }, { view: null });
    assert.match(missing.textContent, /Not available yet/);
    assert.equal(missing.all((n) => n.tagName === 'a')[0].getAttribute('href'), '#/lesson/m0-l2', 'never a dead end');
  } finally { delete globalThis.document; }
});
