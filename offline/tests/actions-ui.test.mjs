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
    assert.equal(one(hub, 'actions-open-battle').getAttribute('href'), '#/actions/battle');
    assert.equal(one(hub, 'actions-open-review').getAttribute('href'), '#/actions/review');
    for (const sub of ['quests', 'predictions', 'todos']) {
      assert.equal(AU.page(ctxFor(E.makeView({}), R('/actions/' + sub))).getAttribute('data-test'), sub, sub + ' is built (U-25)');
    }
    for (const sub of ['elsewhere']) {
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

test('planner: crisis words in a saved block keep the help line on screen, across the Store re-render', async () => {
  await freshStore();
  const DAY = '2026-11-20'; const FROM = '2026-11-21'; const TO = '2026-11-22';
  await withDom(async () => {
    const root = AU.page(ctxFor(Store.view, R('/actions/planner', { date: DAY })));
    assert.equal(byTest(root, 'planner-help').length, 0, 'no help line before');
    await one(root, 'planner-add-btn').fire('click');
    one(root, 'planner-f-title').value = "I can't go on";
    one(root, 'planner-f-start').value = '20:00';
    one(root, 'planner-f-end').value = '21:00';
    await one(root, 'planner-form').fire('submit');
    await until(() => Store.view.list('plans').length === 1);
    assert.equal(one(root, 'planner-help-go').getAttribute('href'), '#/sos/urgent');
    // ui-core re-renders from the Store one frame later: a new page, and the line is still there
    const again = AU.page(ctxFor(Store.view, R('/actions/planner', { date: DAY })));
    assert.equal(byTest(again, 'planner-help').length, 1, 'the line survives the re-render');
    assert.equal(one(again, 'planner-help-go').getAttribute('href'), '#/sos/urgent');
    // a block saved for another day: the line stays on the day it was saved from, and shows on its own day
    const from = AU.page(ctxFor(Store.view, R('/actions/planner', { date: FROM })));
    await one(from, 'planner-add-btn').fire('click');
    one(from, 'planner-f-title').value = 'Evening';
    one(from, 'planner-f-date').value = TO;
    one(from, 'planner-f-start').value = '19:00';
    one(from, 'planner-f-end').value = '20:00';
    one(from, 'planner-f-activity').value = "I can't go on";
    await one(from, 'planner-form').fire('submit');
    await until(() => Store.view.list('plans').length === 2);
    assert.equal(byTest(AU.page(ctxFor(Store.view, R('/actions/planner', { date: FROM }))), 'planner-help').length, 1);
    assert.equal(byTest(AU.page(ctxFor(Store.view, R('/actions/planner', { date: TO }))), 'planner-help').length, 1);
    // a block already in the Store (as after a reload) shows it too; a calm day does not
    await Actions.plans.add({ date: '2026-11-24', start: '09:00', end: '10:00', title: 'Morning', kind: 'should', reward: "I can't go on" });
    assert.equal(byTest(AU.page(ctxFor(Store.view, R('/actions/planner', { date: '2026-11-24' }))), 'planner-help').length, 1);
    assert.equal(byTest(AU.page(ctxFor(Store.view, R('/actions/planner', { date: '2026-11-23' }))), 'planner-help').length, 0);
  });
});

test('planner: the contract\'s data-testid hooks sit beside data-test (planner-add-btn, planner-block)', async () => {
  await freshStore();
  await Actions.plans.add({ date: TODAY, start: '11:00', end: '12:00', title: 'Tidy the desk', kind: 'should' });
  await withDom(async () => {
    const root = AU.page(ctxFor(Store.view, R('/actions/planner', { date: TODAY })));
    const tid = (v) => root.all((n) => n.getAttribute && n.getAttribute('data-testid') === v);
    assert.equal(tid('planner-add-btn').length, 1);
    assert.equal(tid('planner-add-btn')[0].getAttribute('data-test'), 'planner-add-btn');
    assert.equal(tid('planner-block').length, 1);
    assert.equal(tid('planner-block')[0].getAttribute('data-test'), 'planner-block');
  });
});

// ── U-23 Battle Plans ──────────────────────────────────────────────────────────────────────
const evs = (type) => Store.view.list('events').filter((e) => e.type === type);
const bpFill = (root, o) => { for (const k of Object.keys(o)) one(root, 'bp-f-' + k).value = o[k]; };

test('battle: a plan exports a valid .ics through Engine.ics (one VEVENT on its date, CRLF lines, no buddy)', () => {
  const p = plan({ id: 'bp1', date: '2026-11-10', start: '19:00', end: '21:00', title: 'Work party', kind: 'risky', risky: true,
    battlePlan: { situation: 'Old crew, open bar, a long evening with nothing else planned for after it ends', plan: 'Hold a soda; leave by nine',
      backups: ['Text my sister', 'Step outside'], buddyId: 'c1', exit: 'A taxi at nine' } });
  const item = P.battlePlanIcsItem(p);
  assert.deepEqual(Object.keys(item).sort(), ['date', 'end', 'id', 'notes', 'start', 'title']);
  assert.equal(item.date, '2026-11-10');
  assert.doesNotMatch(item.notes, /Someone to reach|c1/, 'the buddy stays on the device');
  const f = P.battleIcsFile(E, p, NOW);
  assert.equal(f.filename, '1-addic-battle-plan-2026-11-10.ics');
  assert.ok(f.text.startsWith('BEGIN:VCALENDAR\r\n'));
  assert.match(f.text, /END:VCALENDAR\r\n$/);
  assert.equal((f.text.match(/BEGIN:VEVENT/g) || []).length, 1);
  assert.match(f.text, /\r\nDTSTART:20261110T190000\r\n/);
  assert.match(f.text, /\r\nDTEND:20261110T210000\r\n/);
  assert.match(f.text, /\r\nSUMMARY:Work party\r\n/);
  assert.doesNotMatch(f.text.replace(/\r\n/g, ''), /[\r\n]/, 'every line ends in CRLF');
  assert.equal(P.battlePlanIcsItem({ date: 'soon' }), null);
  assert.equal(P.battleIcsFile(null, p, NOW), null);
});

test('battle: the list carries bp-new; the form carries bp-form and saves a risky block with one BattlePlanCreated', async () => {
  await freshStore();
  await withDom(async () => {
    const empty = AU.page(ctxFor(Store.view, R('/actions/battle')));
    assert.ok(tours(empty).includes('bp-new'));
    assert.equal(one(empty, 'bp-new').getAttribute('href'), '#/actions/battle?new=1');
    one(empty, 'bp-none');
    const root = AU.page(ctxFor(Store.view, R('/actions/battle', { new: '1' })));
    assert.equal(one(root, 'bp-form').getAttribute('data-tour'), 'bp-form');
    assert.equal(one(root, 'bp-f-date').value, TODAY, 'the day defaults to today');
    bpFill(root, { title: 'Work party', date: '2026-11-10', start: '19:00', end: '21:00', plan: 'Hold a soda; leave by nine', backups: 'Text my sister\n\n Step outside ' });
    await one(root, 'bp-form').fire('submit');
    await until(() => Store.view.list('plans').length === 1);
    const [p] = Store.view.list('plans');
    assert.equal(p.kind, 'risky');
    assert.equal(p.risky, true);
    assert.equal(p.title, 'Work party');
    assert.deepEqual(p.battlePlan.backups, ['Text my sister', 'Step outside']);
    assert.equal(p.battlePlan.buddyId, null);
    assert.equal(evs('BattlePlanCreated').length, 1);
    assert.equal(byTest(root, 'bp-card').length, 1, 'the list shows the new plan');
    assert.equal(byTest(root, 'bp-form').length, 0, 'the form is closed');
  });
});

test('battle: an empty plan or an end before the start is refused with a message, and the input is kept', async () => {
  await freshStore();
  await withDom(async () => {
    const root = AU.page(ctxFor(Store.view, R('/actions/battle', { new: '1' })));
    bpFill(root, { title: 'Late shift', start: '22:00', end: '21:00' });
    await one(root, 'bp-form').fire('submit');
    assert.match(one(root, 'bp-f-error').textContent, /what you will do/i);
    assert.equal(one(root, 'bp-f-title').value, 'Late shift');
    one(root, 'bp-f-plan').value = 'Go straight home';
    await one(root, 'bp-form').fire('submit');
    assert.match(one(root, 'bp-f-error').textContent, /end time must be after/i);
    assert.equal(one(root, 'bp-f-plan').value, 'Go straight home');
    assert.equal(Store.view.list('plans').length, 0);
    assert.equal(evs('BattlePlanCreated').length, 0);
  });
});

test('battle: ?plan=<id> attaches a Battle Plan to an existing block (no second block); a gone block is said plainly', async () => {
  await freshStore();
  const { plan: b } = await Actions.plans.add({ date: TODAY, start: '18:00', end: '20:00', title: 'Evening alone', kind: 'should' });
  await withDom(async () => {
    const root = AU.page(ctxFor(Store.view, R('/actions/battle', { plan: b.id })));
    assert.equal(one(root, 'bp-f-title').value, 'Evening alone');
    assert.equal(one(root, 'bp-f-start').value, '18:00');
    one(root, 'bp-f-plan').value = 'Cook, then call a friend';
    await one(root, 'bp-form').fire('submit');
    await until(() => !!Store.view.list('plans')[0].battlePlan);
    const rows = Store.view.list('plans');
    assert.equal(rows.length, 1);
    assert.equal(rows[0].risky, true);
    assert.equal(rows[0].kind, 'should', 'the kind of an existing block is kept');
    assert.equal(rows[0].battlePlan.plan, 'Cook, then call a friend');
    assert.equal(evs('BattlePlanCreated').length, 1);
    const gone = AU.page(ctxFor(Store.view, R('/actions/battle', { plan: 'nope' })));
    one(gone, 'bp-missing');
    assert.equal(one(gone, 'bp-new-instead').getAttribute('href'), '#/actions/battle?new=1');
  });
});

test('battle: the debrief, yes and no, each append one BattlePlanDebriefed; a second debrief adds none; no score', async () => {
  await freshStore();
  const mk = (date, title) => Actions.plans.add({ date, start: '19:00', end: '21:00', title, kind: 'risky', battlePlan: { plan: 'Walk it off' } });
  const a = (await mk('2026-11-06', 'Friday evening')).plan;
  const b = (await mk('2026-11-05', 'Thursday evening')).plan;
  await mk('2026-11-09', 'Monday evening');
  await withDom(async () => {
    const root = AU.page(ctxFor(Store.view, R('/actions/battle')));
    assert.equal(byTest(root, 'bp-card').length, 3);
    assert.equal(byTest(root, 'bp-debrief').length, 2, 'only ended blocks ask');
    assert.match(one(root, 'bp-upcoming').textContent, /When this time has passed/);
    assert.equal(one(root, 'bp-debrief-yes').getAttribute('data-testid'), 'bp-debrief-yes');
    one(root, 'bp-how').value = 'Called my brother';
    await one(root, 'bp-debrief-yes').fire('click');
    assert.equal(evs('BattlePlanDebriefed').length, 1);
    assert.equal(Store.view.get('plans', a.id).debrief.usedPlan, true);
    assert.equal(Store.view.get('plans', a.id).debrief.how, 'Called my brother');
    assert.equal(byTest(root, 'bp-debrief').length, 1);
    await one(root, 'bp-debrief-no').fire('click');
    assert.equal(evs('BattlePlanDebriefed').length, 2);
    assert.equal(Store.view.get('plans', b.id).debrief.usedPlan, false);
    await P.debriefPlan(Actions, a.id, false, 'again');
    assert.equal(evs('BattlePlanDebriefed').length, 2, 'once per plan');
    const after = AU.page(ctxFor(Store.view, R('/actions/battle')));
    assert.equal(byTest(after, 'bp-debriefed').length, 2);
    assert.doesNotMatch(after.textContent, /\b(score|points|streak|failed|missed|overdue)\b/i);
  });
});

test('battle: "Add to calendar" hands the .ics to UI.download as text/calendar; crisis words show the urgent-help line', async () => {
  await freshStore();
  await Actions.plans.add({ date: '2026-11-12', start: '20:00', end: '22:00', title: 'Payday', kind: 'risky', battlePlan: { plan: "I can't go on like this" } });
  const calls = [];
  globalThis.UI = { download: (...a) => { calls.push(a); return true; }, toast() {} };
  try {
    await withDom(async () => {
      const root = AU.page(ctxFor(Store.view, R('/actions/battle')));
      await one(root, 'bp-ics').fire('click');
      assert.equal(calls.length, 1);
      assert.equal(calls[0][0], '1-addic-battle-plan-2026-11-12.ics');
      assert.ok(calls[0][1].startsWith('BEGIN:VCALENDAR\r\n'));
      assert.equal(calls[0][2], 'text/calendar');
      assert.equal(one(root, 'bp-help-go').getAttribute('href'), '#/sos/urgent');
      for (const b of root.all((n) => n.tagName === 'button' && n.getAttribute('type') === 'button')) assert.ok((b.on.click || []).length, 'button ' + b.getAttribute('data-test'));
      for (const x of root.all((n) => n.tagName === 'a')) assert.match(x.getAttribute('href') || '', /^#\//);
    });
  } finally { delete globalThis.UI; }
});

// ── U-24 Weekly Review ─────────────────────────────────────────────────────────────────────
const reviews = () => Store.view.list('responses').filter((r) => r.exerciseId === 'weekly-review');
const step = (root) => Number(one(root, 'review-step').getAttribute('data-step'));
const NO_SCORE = /\b(score|points|streak|failed|missed|overdue|late|behind|graded?)\b/i;

test('review: the week, the next review day and the weekly reminder .ics at 18:00 on profile.reviewDay', () => {
  assert.deepEqual(P.reviewWeek(NOW), { today: TODAY, weekStart: '2026-11-02', from: '2026-11-01', to: TODAY });
  assert.equal(P.nextReviewDate(0, TODAY), '2026-11-08');
  assert.equal(P.nextReviewDate(6, TODAY), TODAY, 'today counts');
  assert.equal(P.nextReviewDate(9, TODAY), '2026-11-08', 'an unknown day is Sunday');
  const item = P.reviewIcsItem({ reviewDay: 3 }, NOW);
  assert.deepEqual(item, { id: 'weekly-review', date: '2026-11-11', start: '18:00', end: '18:15', title: 'Weekly review', rrule: 'FREQ=WEEKLY;BYDAY=WE' });
  assert.equal(P.reviewIcsItem({}, NOW).date, '2026-11-08');
  const text = E.ics([item], { now: NOW });
  assert.match(text, /\r\nDTSTART:20261111T180000\r\nDTEND:20261111T181500\r\nRRULE:FREQ=WEEKLY;BYDAY=WE\r\n/);
  assert.deepEqual(P.wantToItem({ title: 'Swim', date: '2026-11-08', start: '23:30' }), { date: '2026-11-08', start: '23:30', end: '23:59', title: 'Swim', kind: 'want', risky: false, reward: null });
});

test('review: a synthetic week renders the highlights and the forecast check line from Engine', async () => {
  AU.forgetReviews();
  const view = E.makeView({
    plans: [plan({ id: 'r1', date: '2026-11-04', start: '19:00', end: '21:00', title: 'Payday evening', kind: 'risky', risky: true, battlePlan: { plan: 'Go to the gym' } }),
      plan({ id: 'r2', date: '2026-11-09', start: '20:00', end: '22:00', title: 'Old friends visit', kind: 'risky', risky: true })],
    logs: [{ id: 'l1', type: 'craving', at: at(2026, 11, 4, 19, 40).toISOString(), intensity: 6 }, { id: 'l2', type: 'feeling', at: at(2026, 11, 5, 9).toISOString(), intensity: 3 }],
  });
  const fc = E.forecastCheck(view, '2026-11-01').find((d) => d.date === '2026-11-04');
  assert.ok(fc && fc.line, 'Engine has a line for the planned day');
  await withDom(async () => {
    const root = AU.page(ctxFor(view, R('/actions/review')));
    assert.ok(tours(root).includes('review-start'));
    assert.match(root.textContent, /Nothing here is scored/);
    await one(root, 'review-start').fire('click');
    assert.equal(step(root), 1);
    for (const l of E.weekSummary(view, '2026-11-01').highlights) assert.ok(root.textContent.includes(l), l);
    await one(root, 'review-next').fire('click');
    assert.equal(step(root), 2);
    assert.equal(one(root, 'review-forecast-line').textContent, fc.line);
    assert.match(one(root, 'review-forecast').textContent, /Logged: a feeling at/, 'a day without a line shows plain rows');
    for (let s = 2; s < 5; s++) { assert.doesNotMatch(root.textContent, NO_SCORE, 'screen ' + s); await one(root, 'review-next').fire('click'); }
    assert.equal(step(root), 5);
    assert.doesNotMatch(root.textContent, NO_SCORE, 'screen 5');
    await one(root, 'review-back').fire('click');
    assert.equal(step(root), 4);
    assert.match(one(root, 'review-ahead').textContent, /Old friends visit/);
    assert.equal(one(root, 'review-bp-add').getAttribute('href'), '#/actions/battle?plan=r2');
    assert.equal(one(root, 'review-bp-new').getAttribute('href'), '#/actions/battle?new=1');
    // leaving for a Battle Plan and coming back resumes the same screen (memory only)
    const back = AU.page(ctxFor(view, R('/actions/review')));
    assert.equal(step(back), 4);
  });
  AU.forgetReviews();
});

test('review: Save writes one response, one WeeklyReviewCompleted, the want-tos and the re-rate; a second save adds no second event', async () => {
  AU.forgetReviews();
  await freshStore();
  await withDom(async () => {
    const root = AU.page(ctxFor(Store.view, R('/actions/review'), { profile: { reviewDay: 0 } }));
    await one(root, 'review-start').fire('click');
    one(root, 'review-f-note').value = 'Cooked twice';
    await one(root, 'review-next').fire('click');
    await one(root, 'review-next').fire('click');
    one(root, 'review-f-score').value = '7';
    await one(root, 'review-next').fire('click');
    await one(root, 'review-next').fire('click');
    byTest(root, 'review-want-title')[0].value = 'Swim';
    byTest(root, 'review-want-reward')[0].value = 'A long shower';
    one(root, 'review-f-focusSkill').value = 'trial';
    await one(root, 'review-save').fire('click');
    assert.match(one(root, 'review-error').textContent, /Choose the stage/, 'a number without a stage is asked about');
    assert.equal(reviews().length, 0);
    await one(root, 'review-back').fire('click');
    await one(root, 'review-back').fire('click');
    one(root, 'review-f-stage').value = 'action';
    await one(root, 'review-next').fire('click');
    await one(root, 'review-next').fire('click');
    assert.equal(byTest(root, 'review-want-title')[0].value, 'Swim', 'answers stay in memory between screens');
    await one(root, 'review-save').fire('click');
    await until(() => reviews().length === 1);
    assert.equal(reviews().length, 1);
    const p = reviews()[0].payload;
    assert.equal(p.weekStart, '2026-11-02');
    assert.equal(p.focusSkill, 'trial');
    assert.equal(p.highlights.note, 'Cooked twice');
    assert.deepEqual(p.motivation, { stage: 'action', score: 7, plusOne: '' });
    assert.equal(p.wantTos.length, 1);
    assert.equal(p.wantTos[0].title, 'Swim');
    assert.equal(evs('WeeklyReviewCompleted').length, 1);
    const plans = Store.view.list('plans');
    assert.equal(plans.length, 1);
    assert.deepEqual([plans[0].kind, plans[0].date, plans[0].start, plans[0].end, plans[0].reward], ['want', '2026-11-08', '18:00', '19:00', 'A long shower']);
    assert.equal(Store.view.list('motivation').length, 1);
    one(root, 'review-saved');
    assert.equal(one(root, 'review-start').getAttribute('data-tour'), 'review-start');
    // again, the same week: a second response, still one event, no second want-to or re-rate
    await one(root, 'review-start').fire('click');
    for (let s = 1; s < 5; s++) await one(root, 'review-next').fire('click');
    await one(root, 'review-save').fire('click');
    await until(() => reviews().length === 2);
    assert.equal(evs('WeeklyReviewCompleted').length, 1, 'once per week');
    assert.equal(Store.view.list('plans').length, 1);
    assert.equal(Store.view.list('motivation').length, 1);
  });
  AU.forgetReviews();
});

test('review: the reminder goes to UI.download as text/calendar; crisis words show the urgent-help line; no dead button', async () => {
  AU.forgetReviews();
  await freshStore();
  await Actions.weeklyReview({ weekStart: '2026-11-02', highlights: {} });
  const calls = [];
  globalThis.UI = { download: (...a) => { calls.push(a); return true; }, toast() {} };
  try {
    await withDom(async () => {
      const root = AU.page(ctxFor(Store.view, R('/actions/review'), { profile: { reviewDay: 6 } }));
      assert.match(one(root, 'review-saved').textContent, /every Saturday at 6 pm/);
      await one(root, 'review-ics').fire('click');
      assert.equal(calls.length, 1);
      assert.equal(calls[0][0], '1-addic-weekly-review.ics');
      assert.match(calls[0][1], /RRULE:FREQ=WEEKLY;BYDAY=SA\r\n/);
      assert.equal(calls[0][2], 'text/calendar');
      await one(root, 'review-start').fire('click');
      one(root, 'review-f-note').value = "I can't go on";
      await one(root, 'review-next').fire('click');
      assert.equal(one(root, 'review-help-go').getAttribute('href'), '#/sos/urgent');
      for (const b of root.all((n) => n.tagName === 'button' && n.getAttribute('type') === 'button')) assert.ok((b.on.click || []).length, 'button ' + b.getAttribute('data-test'));
      for (const x of root.all((n) => n.tagName === 'a')) assert.match(x.getAttribute('href') || '', /^#\//);
    });
  } finally { delete globalThis.UI; AU.forgetReviews(); }
});

// ── U-25: quests, Prediction Lab, to-dos and the practices player ─────────────────────────────────────────────
const PR = vm.runInThisContext(`(function () {
${readFileSync(src('ui-practices.js'), 'utf8')}
return PracticesUI;
})()`, { filename: src('ui-practices.js') });
// A stand-in of exactly the content lane's shape (content-practices.js at be0f806d), not its words.
const STANDIN = {
  breathe: { id: 'breathe', title: 'Breathe test', minutes: 5, ladder: [5, 10, 15, 20, 25, 30], intro: 'Intro line.',
    script: [{ t: 'Line one.', secs: 10 }, { t: 'Line two.', secs: 20 }, { t: 'Line three.', secs: 30 }], close: 'Close line.' },
  sober: { id: 'sober', title: 'Sober test', minutes: 2, steps: ['S.', 'O.', 'B.', 'E.', 'R.'], intro: 'Five steps.',
    script: [{ t: 'S.', secs: 10 }, { t: 'O.', secs: 25 }, { t: 'B.', secs: 30 }, { t: 'E.', secs: 25 }, { t: 'R.', secs: 15 }], close: 'Done.' },
  walking: { id: 'walking', title: 'Walk test', minutes: 5, intro: 'Walk.', script: [{ t: 'Step.', secs: 30 }], close: 'End.' },
};
const withPractices = async (p, fn) => {
  const had = Object.prototype.hasOwnProperty.call(globalThis.Content, 'practices');
  const old = globalThis.Content.practices;
  if (p === undefined) delete globalThis.Content.practices; else globalThis.Content.practices = p;
  try { return await fn(); } finally { if (had) globalThis.Content.practices = old; else delete globalThis.Content.practices; PR.forgetSessions(); }
};
const eventsOf = (type) => Store.view.list('events').filter((e) => e.type === type);
const noDeadButtons = (root) => {
  for (const b of root.all((n) => n.tagName === 'button' && n.getAttribute('type') === 'button')) assert.ok((b.on.click || []).length, 'button ' + b.getAttribute('data-test'));
  for (const x of root.all((n) => n.tagName === 'a')) assert.match(x.getAttribute('href') || '', /^#\//);
};

test('practices: the script from the real shape, an array shape, or null; list order; minutes credited', () => {
  const C = { practices: STANDIN };
  const s = PR.practiceScript(C, 'breathe');
  assert.deepEqual(s.steps, ['Line one.', 'Line two.', 'Line three.']);
  assert.deepEqual(s.secs, [10, 20, 30]);
  assert.equal(s.minutes, 5);
  assert.deepEqual(s.ladder, [5, 10, 15, 20, 25, 30]);
  assert.equal(s.intro, 'Intro line.');
  assert.equal(s.close, 'Close line.');
  assert.equal(PR.practiceScript(C, 'sober').steps.length, 5);
  assert.equal(PR.practiceScript({ practices: [{ id: 'x', title: 'X', minutes: 3, steps: ['a', 'b'] }] }, 'x').steps.length, 2);
  assert.equal(PR.practiceScript(C, 'body-scan'), null);
  assert.equal(PR.practiceScript({}, 'breathe'), null);
  assert.equal(PR.practiceScript(null, 'breathe'), null);
  assert.equal(PR.practiceScript({ practices: { breathe: { id: 'breathe', script: [] } } }, 'breathe'), null);
  assert.deepEqual(PR.practiceList(C).map((r) => r.id), ['breathe', 'sober', 'walking']);
  assert.equal(PR.minutesCredit(59999), 0);
  assert.equal(PR.minutesCredit(180000), 3);
  assert.equal(PR.minutesCredit(10 ** 9), 600);
});

test('practices: the events of a finish; ExerciseDone always, MindfulMinute only for a whole minute; no SkillUsed', () => {
  const a = PR.practiceEvents('breathe', { elapsedMs: 185000, helpful: '7', reflection: '  calmer  ' });
  assert.deepEqual(a, [['ExerciseDone', { exerciseId: 'breathing', practiceId: 'breathe', kind: 'practice', minutes: 3, helpful: 7, reflection: 'calmer' }], ['MindfulMinute', { minutes: 3 }]]);
  const b = PR.practiceEvents('walking', { elapsedMs: 20000, helpful: '11' });
  assert.deepEqual(b, [['ExerciseDone', { exerciseId: 'walking', practiceId: 'walking', kind: 'practice', minutes: 0 }]]);
  assert.ok(!a.concat(b).some(([t]) => t === 'SkillUsed'));
});

test('practices: no script is an honest stub with a real way back (O7)', async () => {
  await withPractices(undefined, () => withDom(async () => {
    const root = PR.page(ctxFor(Store.view, R('/practice/breathe')));
    assert.ok(byTest(root, 'practice-stub').length || root.getAttribute('data-test') === 'practice-stub');
    assert.match(root.textContent, /being written/);
    assert.equal(byTest(root, 'practice-start').length, 0);
    assert.equal(one(root, 'practice-back').getAttribute('href'), '#/practice');
    noDeadButtons(root);
    const list = PR.page(ctxFor(Store.view, R('/practice')));
    assert.match(list.textContent, /being written/);
    noDeadButtons(list);
  }));
});

test('practices: start, read aloud (no voice says so), pause, finish, reflect; ExerciseDone and MindfulMinute appended', async () => {
  await freshStore();
  let t = 1000000;
  const spoken = [];
  let voice = true;
  globalThis.UI = { speak: (x) => { spoken.push(x); return voice; }, stopSpeaking() { spoken.push('#stop'); }, toast() {} };
  try {
    await withPractices(STANDIN, () => withDom(async () => {
      const ctx = ctxFor(Store.view, R('/practice/breathe'), { nowMs: () => t });
      const root = PR.page(ctx);
      assert.equal(one(root, 'practice-length').value, '5');
      await one(root, 'practice-voice').fire('click');
      assert.deepEqual(spoken, ['Intro line.']);
      await one(root, 'practice-start').fire('click');
      assert.equal(one(root, 'practice-line').textContent.trim(), 'Line one.');
      assert.equal(spoken[spoken.length - 1], 'Line one.');
      assert.match(one(root, 'practice-timer').textContent, /5:00 left/);
      await one(root, 'practice-next').fire('click');
      assert.equal(one(root, 'practice-line').textContent.trim(), 'Line two.');
      t += 120000;
      await one(root, 'practice-pause').fire('click');
      assert.equal(spoken[spoken.length - 1], '#stop');
      assert.match(one(root, 'practice-timer').textContent, /Paused/);
      t += 600000; // paused time is not practice time
      assert.match(one(root, 'practice-timer').textContent, /3:00 left/);
      voice = false;
      await one(root, 'practice-pause').fire('click'); // resume
      assert.match(one(root, 'practice-novoice').textContent, /No voice on this device/);
      assert.equal(one(root, 'practice-line').textContent.trim(), 'Line two.', 'the script stays on screen');
      t += 65000;
      await one(root, 'practice-stop').fire('click');
      one(root, 'practice-reflection').value = 'Felt steadier';
      one(root, 'practice-helpful').value = '8';
      await one(root, 'practice-finish').fire('click');
      await until(() => eventsOf('MindfulMinute').length === 1);
      const done = eventsOf('ExerciseDone');
      assert.equal(done.length, 1);
      assert.deepEqual(done[0].payload, { exerciseId: 'breathing', practiceId: 'breathe', kind: 'practice', minutes: 3, helpful: 8, reflection: 'Felt steadier' });
      assert.deepEqual(eventsOf('MindfulMinute')[0].payload, { minutes: 3 });
      assert.equal(eventsOf('SkillUsed').length, 0);
      assert.match(one(root, 'practice-done').textContent, /3 minutes/);
      assert.equal(byTest(root, 'practice-help').length, 0);
      noDeadButtons(root);
      // ui-core builds a new page after the Store changes: the saved screen survives it
      const again = PR.page(ctx);
      assert.equal(byTest(again, 'practice-done').length, 1);
    }));
  } finally { delete globalThis.UI; }
});

test('practices: a short practice writes ExerciseDone only; crisis words show the urgent-help line; sober links to SOS', async () => {
  await freshStore();
  let t = 0;
  try {
    globalThis.UI = { speak: () => false, stopSpeaking() {}, toast() {} };
    await withPractices(STANDIN, () => withDom(async () => {
      const root = PR.page(ctxFor(Store.view, R('/practice/sober'), { nowMs: () => t }));
      assert.equal(one(root, 'practice-sos-go').getAttribute('href'), '#/sos');
      await one(root, 'practice-start').fire('click');
      t += 30000;
      await one(root, 'practice-stop').fire('click');
      one(root, 'practice-reflection').value = 'I want to end my life';
      await one(root, 'practice-finish').fire('click');
      await until(() => eventsOf('ExerciseDone').length === 1);
      assert.equal(eventsOf('MindfulMinute').length, 0);
      assert.equal(eventsOf('ExerciseDone')[0].payload.minutes, 0);
      assert.equal(one(root, 'practice-help-go').getAttribute('href'), '#/sos/urgent');
      assert.match(one(root, 'practice-done').textContent, /under a minute/);
    }));
  } finally { delete globalThis.UI; }
});

test('quests: cards from Engine.quests; manual tick only where a step does not tick itself; a tick is idempotent; badge on completion', async () => {
  await freshStore();
  await withDom(async () => {
    const root = AU.page(ctxFor(Store.view, R('/actions/quests')));
    const crew = byTest(root, 'quest').find((n) => n.getAttribute('data-quest') === 'crew');
    assert.equal(crew.all((n) => n.getAttribute && n.getAttribute('data-test') === 'quest-tick').length, 0, 'crew ticks itself');
    const clear = byTest(root, 'quest').find((n) => n.getAttribute('data-quest') === 'clear-space');
    assert.equal(clear.all((n) => n.getAttribute && n.getAttribute('data-test') === 'quest-tick').length, 3);
    noDeadButtons(root);
  });
  const r1 = await AU.tickQuest(Actions, 'clear-space', 'list');
  const r2 = await AU.tickQuest(Actions, 'clear-space', 'list');
  assert.ok(r1.ok && r2.ok);
  assert.equal(r1.row.ticks.list, r2.row.ticks.list, 'the second tick changes nothing');
  assert.equal(Store.view.list('quests').length, 1);
  const bad = await AU.tickQuest(Actions, 'clear-space', 'nope');
  assert.equal(bad.ok, false);
  assert.equal(bad.code, 'bad-quest');
  await AU.tickQuest(Actions, 'clear-space', 'helper');
  await AU.tickQuest(Actions, 'clear-space', 'done');
  const cards = AU.questCards(E, globalThis.Content, Store.view);
  const c = cards.find((x) => x.id === 'clear-space');
  assert.equal(c.complete, true);
  assert.equal(c.done, 3);
  assert.equal(c.badge, 'Be Smart, Not Strong');
  assert.equal(cards.find((x) => x.id === 'crew').badge, '');
  await withDom(async () => {
    const root = AU.page(ctxFor(Store.view, R('/actions/quests')));
    assert.match(one(root, 'quest-badge').textContent, /Be Smart, Not Strong/);
    assert.doesNotMatch(root.textContent, /\b(lost|lose|expired|random|points)\b/i);
  });
});

test('predictions: add, complete in words; a result outside 0-10 is refused with the message kept', async () => {
  await freshStore();
  const bad0 = await AU.savePrediction(Actions, { activity: '', predicted: '3' });
  assert.equal(bad0.ok, false);
  assert.equal(bad0.code, 'bad-prediction');
  await withDom(async () => {
    const root = AU.page(ctxFor(Store.view, R('/actions/predictions')));
    one(root, 'prediction-activity').value = 'Swim at the pool';
    one(root, 'prediction-predicted').value = '3';
    await one(root, 'prediction-form').fire('submit');
    await until(() => Store.view.list('predictions').length === 1);
    noDeadButtons(root);
  });
  const id = Store.view.list('predictions')[0].id;
  const out = await AU.completePrediction(Actions, id, 11);
  assert.equal(out.ok, false);
  assert.equal(out.code, 'bad-prediction');
  assert.equal((await AU.completePrediction(Actions, id, '')).ok, false);
  assert.equal(Store.view.list('predictions')[0].actual, null);
  await withDom(async () => {
    const root = AU.page(ctxFor(Store.view, R('/actions/predictions')));
    await one(root, 'prediction-ask').fire('click');
    one(root, 'prediction-actual').value = '6';
    await one(root, 'prediction-complete').fire('click');
    await until(() => Store.view.list('predictions')[0].actual === 6);
  });
  const rows = AU.predictionRows(Store.view);
  assert.equal(rows.open.length, 0);
  assert.equal(rows.done[0].words, 'You expected 3; it was 6. It went better than you guessed.');
  assert.match(AU.predictionWords(5, 2), /less than you hoped/);
});

test('to-dos: add with a past due date, no overdue words; done; remove asks first; Go link for a route', async () => {
  await freshStore();
  await Actions.todos.add({ text: 'Call the clinic', due: '2026-11-01', route: '#/workbook' });
  await withDom(async () => {
    const root = AU.page(ctxFor(Store.view, R('/actions/todos')));
    assert.match(one(root, 'todo-due-label').textContent, /For Sunday, 1 Nov 2026/);
    assert.doesNotMatch(root.textContent, NO_OVERDUE);
    assert.equal(one(root, 'todo-go').getAttribute('href'), '#/workbook');
    one(root, 'todo-text').value = 'Buy fruit';
    await one(root, 'todo-form').fire('submit');
    await until(() => Store.view.list('todos').length === 2);
    assert.equal(one(root, 'todo-add').getAttribute('data-testid'), 'todo-add');
    noDeadButtons(root);
  });
  const bad = await AU.saveTodo(Actions, { text: '  ' });
  assert.equal(bad.ok, false);
  const rows = AU.todoRows(Store.view);
  assert.deepEqual(rows.open.map((t) => t.text), ['Call the clinic', 'Buy fruit']);
  await withDom(async () => {
    const root = AU.page(ctxFor(Store.view, R('/actions/todos')));
    await byTest(root, 'todo-done-btn')[0].fire('click');
    await until(() => Store.view.list('todos').some((t) => t.done));
    await byTest(root, 'todo-remove')[0].fire('click');
    assert.equal(Store.view.list('todos').length, 2, 'remove asks first');
    await one(root, 'todo-remove-yes').fire('click');
    await until(() => Store.view.list('todos').length === 1);
    assert.doesNotMatch(root.textContent, NO_OVERDUE);
  });
});

test('actions hub: every card opens a working screen', async () => {
  await withDom(async () => {
    const root = AU.page(ctxFor(Store.view, R('/actions')));
    const hrefs = root.all((n) => n.tagName === 'a').map((n) => n.getAttribute('href'));
    for (const x of ['#/actions/quests', '#/actions/predictions', '#/actions/todos', '#/practice']) assert.ok(hrefs.includes(x), x);
    assert.equal(byTest(root, 'actions-hub-quests')[0].all((n) => n.getAttribute && n.getAttribute('class') === 'act-soon').length, 0);
  });
});

test('the event log never shrinks: a to-do remove, a Battle Plan attach and edit, and a planner remove keep every event; XP is never lower', async () => {
  await freshStore();
  const snap = () => ({ ids: Store.view.list('events').map((e) => e.id), xp: E.gameState(Store.view, NOW).xp.total });
  const kept = (before, step) => {
    const now = snap();
    const have = new Set(now.ids);
    for (const id of before.ids) assert.ok(have.has(id), `${step}: event ${id} is still in the log`);
    assert.ok(now.ids.length >= before.ids.length, `${step}: the log is not shorter`);
    assert.ok(now.xp >= before.xp, `${step}: XP ${now.xp} is not lower than ${before.xp}`);
    return now;
  };
  const { plan: past } = await Actions.plans.add({ date: '2026-11-06', start: '19:00', end: '21:00', title: 'Friday evening', kind: 'risky', battlePlan: { plan: 'Walk it off' } });
  await P.debriefPlan(Actions, past.id, true, 'It held');
  const { plan: b } = await Actions.plans.add({ date: TODAY, start: '18:00', end: '20:00', title: 'Evening alone', kind: 'should' });
  await Actions.todos.add({ text: 'Call the clinic' });
  let s = snap();
  assert.ok(s.ids.length >= 2, 'the log starts with the plan events');
  assert.ok(s.xp > 0, 'the start carries XP');
  await withDom(async () => {
    const todos = AU.page(ctxFor(Store.view, R('/actions/todos')));
    await one(todos, 'todo-remove').fire('click');
    await one(todos, 'todo-remove-yes').fire('click');
    await until(() => Store.view.list('todos').length === 0);
    assert.equal(Store.view.list('todos').length, 0);
    s = kept(s, 'to-do remove');

    const attach = AU.page(ctxFor(Store.view, R('/actions/battle', { plan: b.id })));
    one(attach, 'bp-f-plan').value = 'Cook, then call a friend';
    await one(attach, 'bp-form').fire('submit');
    await until(() => !!Store.view.get('plans', b.id).battlePlan);
    assert.equal(evs('BattlePlanCreated').length, 2);
    s = kept(s, 'Battle Plan attach');

    const edit = AU.page(ctxFor(Store.view, R('/actions/battle', { plan: b.id })));
    one(edit, 'bp-f-plan').value = 'Cook, then call my brother';
    await one(edit, 'bp-form').fire('submit');
    await until(() => Store.view.get('plans', b.id).battlePlan.plan === 'Cook, then call my brother');
    assert.equal(evs('BattlePlanCreated').length, 2, 'an edit adds no second BattlePlanCreated');
    s = kept(s, 'Battle Plan edit');

    const day = AU.page(ctxFor(Store.view, R('/actions/planner', { date: '2026-11-06' })));
    await one(day, 'planner-remove').fire('click');
    await one(day, 'planner-remove-yes').fire('click');
    await until(() => !Store.view.get('plans', past.id));
    assert.equal(Store.view.get('plans', past.id), null);
    s = kept(s, 'planner remove of a debriefed Battle Plan');
    assert.equal(evs('BattlePlanCreated').filter((e) => e.payload.planId === past.id).length, 1, 'its BattlePlanCreated stays');
    assert.equal(evs('BattlePlanDebriefed').filter((e) => e.payload.planId === past.id).length, 1, 'its debrief stays');

    const today = AU.page(ctxFor(Store.view, R('/actions/planner', { date: TODAY })));
    await one(today, 'planner-remove').fire('click');
    await one(today, 'planner-remove-yes').fire('click');
    await until(() => Store.view.list('plans').length === 0);
    assert.equal(Store.view.list('plans').length, 0);
    kept(s, 'planner remove');
  });
});
