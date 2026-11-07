// Lane actions' Node tests (node:test, no dependencies). U-22: the day planner in offline/src/ui-actions.js
// (BUILD-PLAN 3.9 Planner; tracks/SCREENS/contracts/actions.md). The pure functions run directly; the page renders on a
// tiny stand-in DOM and the test walks the node tree it returns (as today-track.test.mjs does), saving through the real
// Actions over the real Store in Node memory mode.
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
const E = require(src('engine.js'));
globalThis.Engine = E;
globalThis.Store = require(src('store.js'));
const Actions = require(src('actions.js'));
const Store = globalThis.Store;
const P = require(src('ui-actions.js'));
const AU = vm.runInThisContext(`(function () {
${readFileSync(src('ui-actions.js'), 'utf8')}
return ActionsUI;
})()`, { filename: src('ui-actions.js') });

const at = (y, mo, d, hr = 9, mi = 0) => new Date(y, mo - 1, d, hr, mi);
const NOW = at(2026, 11, 7, 9);
const TODAY = '2026-11-07';

function fakeDom() {
  class Node {
    constructor(tag) { this.tagName = tag; this.nodeType = tag === '#text' ? 3 : 1; this.children = []; this.attrs = {}; this.on = {}; this.style = {}; this.hidden = false; this._text = ''; this.parentNode = null; }
    appendChild(c) { this.children.push(c); c.parentNode = this; return c; }
    setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'hidden') this.hidden = true; }
    removeAttribute(k) { delete this.attrs[k]; if (k === 'hidden') this.hidden = false; }
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null; }
    addEventListener(t, fn) { (this.on[t] = this.on[t] || []).push(fn); }
    fire(t) { const e = { type: t, preventDefault() {}, key: '' }; return Promise.all((this.on[t] || []).map((fn) => fn(e))); }
    set textContent(v) { this.children = []; this._text = String(v); }
    get textContent() { return this._text + this.children.map((c) => c.textContent).join(' '); }
    all(pred, out = []) { for (const c of this.children) { if (pred(c)) out.push(c); c.all(pred, out); } return out; }
  }
  return { createElement: (t) => new Node(t), createTextNode: (s) => { const n = new Node('#text'); n._text = String(s); return n; } };
}
const byTest = (root, v) => root.all((n) => n.getAttribute && n.getAttribute('data-test') === v);
const one = (root, v) => { const x = byTest(root, v); assert.ok(x.length >= 1, 'no ' + v); return x[0]; };
const tours = (root) => root.all((n) => n.getAttribute && n.getAttribute('data-tour') !== null).map((n) => n.getAttribute('data-tour'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (fn, n = 200) => { for (let i = 0; i < n && !fn(); i++) await sleep(2); return fn(); };
async function freshStore() { if (typeof Store.load === 'function') await Store.load(); await Store.resetAll(); }
const R = (path, query) => ({ path, parts: path.split('/').filter(Boolean), query: query || {} });
const ctxFor = (view, route, extra) => Object.assign({ view, E, A: Actions, profile: {}, settings: {}, now: NOW, calm: false, features: new Set(), route }, extra || {});
const withDom = async (fn) => { globalThis.document = fakeDom(); try { return await fn(); } finally { delete globalThis.document; } };
const NO_OVERDUE = /\b(overdue|late|missed|failed|behind)\b/i;

let seq = 0;
const plan = (o) => Object.assign({ id: 'p' + (++seq), date: TODAY, start: '09:00', end: '10:00', title: 'Block', kind: 'should', risky: false, status: 'planned' }, o);

test('planner: rows of one day, by start, risky from the flag or the kind, sample marked', () => {
  const view = E.makeView({ plans: [
    plan({ id: 'b', start: '19:00', end: '21:00', title: 'Evening', kind: 'risky', risky: false, battlePlan: { situation: '', plan: '' } }),
    plan({ id: 'a', start: '07:00', end: '08:00', title: 'Walk', kind: 'want' }),
    plan({ id: 'c', start: '12:00', end: '13:00', title: 'Lunch', risky: true, sample: true }),
    plan({ id: 'x', date: '2026-11-06', title: 'Yesterday' }),
  ] });
  const rows = P.planRowsForDate(view, TODAY);
  assert.deepEqual(rows.map((r) => r.id), ['a', 'c', 'b']);
  assert.equal(rows[2].risky, true, 'kind risky is risky');
  assert.equal(rows[2].battlePlan, null, 'an empty Battle Plan counts as none');
  assert.equal(rows[1].risky, true);
  assert.equal(rows[1].sample, true);
  assert.deepEqual(P.planRowsForDate(view, 'not-a-date'), []);
  assert.deepEqual(P.planRowsForDate(null, TODAY), []);
});

test('planner: date from the route, else today; day labels and times', () => {
  assert.equal(P.plannerDate(R('/actions/planner', { date: '2026-11-10' }), NOW), '2026-11-10');
  assert.equal(P.plannerDate(R('/actions/planner', { date: '2026-02-30' }), NOW), TODAY, 'an impossible date falls back to today');
  assert.equal(P.plannerDate(R('/actions/planner'), NOW), TODAY);
  assert.equal(P.shiftDate('2026-11-30', 1), '2026-12-01');
  assert.equal(P.shiftDate('2026-03-01', -1), '2026-02-28');
  assert.equal(P.dayLabel(TODAY), 'Saturday, 7 Nov 2026');
  assert.equal(P.timeLabel('19:40'), '7:40 pm');
  assert.equal(P.timeLabel('00:05'), '12:05 am');
});

test('planner: a past unmarked block is "not marked", never overdue, and nothing turns red', async () => {
  const past = plan({ id: 'old', date: '2026-11-07', start: '06:00', end: '08:00', title: 'Morning walk' });
  const earlier = plan({ id: 'old2', date: '2026-11-07', start: '07:00', end: '08:30', title: 'Yesterday-ish', status: 'planned' });
  assert.equal(P.pastUnmarked(past, NOW), true);
  assert.equal(P.pastUnmarked(plan({ date: '2026-11-01' }), NOW), true);
  assert.equal(P.pastUnmarked(plan({ date: '2026-11-01', status: 'done' }), NOW), false);
  assert.equal(P.pastUnmarked(plan({ start: '10:00', end: '11:00' }), NOW), false, 'later today is not past');
  await withDom(async () => {
    const view = E.makeView({ plans: [past, earlier] });
    const root = AU.page(ctxFor(view, R('/actions/planner', { date: TODAY })));
    assert.equal(byTest(root, 'planner-unmarked').length, 2);
    assert.doesNotMatch(root.textContent, NO_OVERDUE);
    assert.equal(root.all((n) => /danger|red|overdue|late/.test(n.getAttribute && (n.getAttribute('class') || ''))).length, 0, 'no warning class on a past block');
    // one tap marks it, as done or skipped
    assert.equal(typeof one(root, 'planner-done').on.click[0], 'function');
    assert.equal(typeof one(root, 'planner-skip').on.click[0], 'function');
  });
  for (const k of Object.keys(AU.TEXT)) {
    const v = AU.TEXT[k];
    const s = typeof v === 'function' ? v('a', 'b', 'c') : typeof v === 'string' ? v : JSON.stringify(v);
    assert.doesNotMatch(s, NO_OVERDUE, 'TEXT.' + k);
    assert.doesNotMatch(s, /\b(streak|points|addicts?)\b/i, 'TEXT.' + k);
  }
});

test('planner: gap rows equal Engine.gaps, each with "Add here" prefilling start and end', async () => {
  const view = E.makeView({ plans: [plan({ start: '09:00', end: '12:00' }), plan({ start: '13:00', end: '14:00' }), plan({ start: '10:00', end: '22:00', status: 'skipped' })] });
  const want = E.gaps(view, TODAY);
  assert.deepEqual(P.gapRows(E, view, TODAY), want);
  assert.ok(want.length >= 1);
  await withDom(async () => {
    const root = AU.page(ctxFor(view, R('/actions/planner', { date: TODAY })));
    const rows = byTest(root, 'planner-gap');
    assert.equal(rows.length, want.length);
    rows.forEach((r, i) => assert.match(r.textContent, new RegExp(P.timeLabel(want[i].start).replace(/ /g, '\\s'))));
    await byTest(root, 'planner-gap-add')[want.length - 1].fire('click');
    assert.equal(one(root, 'planner-f-start').value, want[want.length - 1].start);
    assert.equal(one(root, 'planner-f-end').value, want[want.length - 1].end);
    assert.equal(one(root, 'planner-f-date').value, TODAY);
  });
  assert.deepEqual(P.gapRows(null, view, TODAY), [], 'no Engine: no gaps, no crash');
});

test('planner: the baselined tour targets are on the screen', async () => {
  await withDom(async () => {
    const root = AU.page(ctxFor(E.makeView({}), R('/actions/planner')));
    for (const t of ['planner-day', 'planner-gaps', 'planner-add']) assert.ok(tours(root).includes(t), t);
    assert.equal(one(root, 'planner-date').textContent, 'Saturday, 7 Nov 2026');
    assert.equal(one(root, 'planner-prev').getAttribute('href'), '#/actions/planner?date=2026-11-06');
    assert.equal(one(root, 'planner-next').getAttribute('href'), '#/actions/planner?date=2026-11-08');
  });
});

test('planner: a block added through the form saves through Actions and shows in the day', async () => {
  await freshStore();
  await withDom(async () => {
    const root = AU.page(ctxFor(Store.view, R('/actions/planner', { date: TODAY })));
    await one(root, 'planner-add-btn').fire('click');
    one(root, 'planner-f-title').value = 'Cook dinner with music';
    one(root, 'planner-f-kind').value = 'want';
    one(root, 'planner-f-start').value = '18:00';
    one(root, 'planner-f-end').value = '19:30';
    one(root, 'planner-f-reward').value = 'A favourite show';
    await one(root, 'planner-form').fire('submit');
    await until(() => Store.view.list('plans').length === 1);
    const rows = Store.view.list('plans');
    assert.equal(rows.length, 1);
    assert.equal(rows[0].title, 'Cook dinner with music');
    assert.equal(rows[0].kind, 'want');
    assert.equal(rows[0].date, TODAY);
    assert.equal(rows[0].reward, 'A favourite show');
    assert.equal(rows[0].activity, null);
    assert.equal(rows[0].risky, false);
    assert.equal(byTest(root, 'planner-form').length, 0, 'the form closes');
    const blocks = byTest(root, 'planner-block');
    assert.equal(blocks.length, 1);
    assert.match(blocks[0].textContent, /Cook dinner with music/);
    // mark it done, then change it back: the status is saved through Actions
    await one(root, 'planner-done').fire('click');
    await until(() => Store.view.list('plans')[0].status === 'done');
    assert.equal(Store.view.list('plans')[0].status, 'done');
    assert.equal(one(root, 'planner-status').textContent, 'Done');
    await one(root, 'planner-undo').fire('click');
    await until(() => Store.view.list('plans')[0].status === 'planned');
    // edit keeps the id
    await one(root, 'planner-edit').fire('click');
    assert.equal(one(root, 'planner-f-title').value, 'Cook dinner with music');
    one(root, 'planner-f-end').value = '20:00';
    await one(root, 'planner-form').fire('submit');
    await until(() => Store.view.list('plans')[0].end === '20:00');
    assert.equal(Store.view.list('plans').length, 1);
    assert.equal(Store.view.list('plans')[0].end, '20:00');
    // remove asks first; "Keep it" keeps it
    await one(root, 'planner-remove').fire('click');
    await one(root, 'planner-remove-no').fire('click');
    assert.equal(Store.view.list('plans').length, 1);
    await one(root, 'planner-remove').fire('click');
    await one(root, 'planner-remove-yes').fire('click');
    await until(() => Store.view.list('plans').length === 0);
    assert.equal(Store.view.list('plans').length, 0);
  });
});

test('planner: an end at or before the start is refused with the message, and the input is kept', async () => {
  await freshStore();
  await withDom(async () => {
    const root = AU.page(ctxFor(Store.view, R('/actions/planner', { date: TODAY })));
    await one(root, 'planner-add-btn').fire('click');
    one(root, 'planner-f-title').value = 'Evening walk';
    one(root, 'planner-f-start').value = '19:00';
    one(root, 'planner-f-end').value = '18:00';
    await one(root, 'planner-form').fire('submit');
    await until(() => byTest(root, 'planner-f-error').some((e) => !e.hidden));
    const err = one(root, 'planner-f-error');
    assert.equal(err.hidden, false);
    assert.match(err.textContent, /end time must be after the start time/i);
    assert.equal(one(root, 'planner-f-title').value, 'Evening walk', 'the input is kept');
    assert.equal(one(root, 'planner-f-end').value, '18:00');
    assert.equal(Store.view.list('plans').length, 0, 'nothing written');
    const same = await P.saveBlock(Actions, { title: 'x', date: TODAY, start: '10:00', end: '10:00' });
    assert.deepEqual([same.ok, same.code], [false, 'bad-plan']);
    const noTitle = await P.saveBlock(Actions, { title: '  ', date: TODAY, start: '10:00', end: '11:00' });
    assert.equal(noTitle.ok, false);
    assert.match(noTitle.message, /title/);
    assert.equal((await P.saveBlock(null, { title: 'x' })).ok, false, 'no Actions: refused, no crash');
  });
});

test('planner: a risky block is flagged with its Battle Plan, or a link to make one', async () => {
  await freshStore();
  const bare = (await Actions.plans.add({ date: TODAY, start: '20:00', end: '22:00', title: 'Friday night', kind: 'risky' })).plan;
  const withPlan = (await Actions.plans.add({ date: TODAY, start: '17:00', end: '18:30', title: 'After work', kind: 'should', risky: true,
    battlePlan: { situation: 'Tired and alone after work', plan: 'Call my sister, then walk home the long way', backups: ['Make tea'] } })).plan;
  assert.equal(bare.risky, true, 'kind risky defaults the flag on');
  await withDom(async () => {
    const root = AU.page(ctxFor(Store.view, R('/actions/planner', { date: TODAY })));
    assert.equal(byTest(root, 'planner-risky').length, 2);
    const add = one(root, 'planner-bp-add');
    assert.equal(add.getAttribute('href'), '#/actions/battle?plan=' + encodeURIComponent(bare.id));
    const bp = one(root, 'planner-bp');
    assert.match(bp.textContent, /Tired and alone after work/);
    assert.match(bp.textContent, /Call my sister/);
    assert.equal(one(root, 'planner-bp-edit').getAttribute('href'), '#/actions/battle?plan=' + encodeURIComponent(withPlan.id));
    // the form turns "risky" on when the kind is risky
    await one(root, 'planner-add-btn').fire('click');
    const kind = one(root, 'planner-f-kind');
    assert.equal(one(root, 'planner-f-risky').checked, false);
    kind.value = 'risky';
    await kind.fire('change');
    assert.equal(one(root, 'planner-f-risky').checked, true);
  });
});

test('planner: ideas come from Engine.suggestions and prefill a want-to', async () => {
  const fakeE = Object.assign({}, E, { suggestions: () => [{ hour: 18, activity: 'Play guitar' }, { hour: 30, activity: 'bad' }] });
  await withDom(async () => {
    const root = AU.page(ctxFor(E.makeView({}), R('/actions/planner', { date: TODAY }), { E: fakeE }));
    assert.equal(byTest(root, 'planner-idea').length, 1);
    await one(root, 'planner-idea-add').fire('click');
    assert.equal(one(root, 'planner-f-title').value, 'Play guitar');
    assert.equal(one(root, 'planner-f-kind').value, 'want');
    assert.equal(one(root, 'planner-f-start').value, '18:00');
    assert.equal(one(root, 'planner-f-end').value, '19:00');
  });
});

test('actions: the hub and the screens still being built are honest (no dead button)', async () => {
  await withDom(async () => {
    const hub = AU.page(ctxFor(E.makeView({}), R('/actions')));
    assert.equal(one(hub, 'actions-open-planner').getAttribute('href'), '#/actions/planner');
    for (const sub of ['battle', 'review', 'quests', 'predictions', 'todos', 'elsewhere']) {
      const root = AU.page(ctxFor(E.makeView({}), R('/actions/' + sub)));
      assert.equal(root.getAttribute('data-test'), 'actions-stub', sub);
      assert.match(root.textContent, /being built/);
      assert.equal(one(root, 'actions-back').getAttribute('href'), '#/actions');
    }
    for (const root of [hub, AU.page(ctxFor(E.makeView({ plans: [plan({ kind: 'risky' })] }), R('/actions/planner')))]) {
      for (const b of root.all((n) => n.tagName === 'button' && n.getAttribute('type') === 'button')) assert.ok((b.on.click || []).length, 'button ' + b.getAttribute('data-test'));
      for (const a of root.all((n) => n.tagName === 'a')) assert.match(a.getAttribute('href') || '', /^#\//);
    }
  });
});

test('actions: ui-actions.js inserts text as text, makes no network call and exports pure names only', () => {
  const code = readFileSync(src('ui-actions.js'), 'utf8');
  assert.doesNotMatch(code, /\.innerHTML\s*=|outerHTML\s*=|insertAdjacentHTML|document\.write/);
  assert.doesNotMatch(code, /\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|https?:\/\//);
  assert.doesNotMatch(code, /localStorage|sessionStorage|indexedDB|Math\.random/);
  assert.doesNotMatch(code, /globalThis\.(Content|Engine|Store|Actions|UI)\b/);
  assert.match(code, /UI\.pages\.actions = /);
  assert.equal(P.page, undefined);
  for (const k of ['planRowsForDate', 'gapRows', 'pastUnmarked', 'saveBlock', 'planFromValues']) assert.equal(typeof P[k], 'function', k);
  const css = readFileSync(src('styles.css'), 'utf8');
  const s = css.indexOf('/* -- actions -- */'); const e = css.indexOf('/* -- end actions -- */');
  assert.ok(s > 0 && e > s, 'the actions section is closed');
  assert.doesNotMatch(css.slice(s, e), /^\s*--[a-z-]+\s*:/m, 'no token redefined');
});
