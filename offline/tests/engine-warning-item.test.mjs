process.env.TZ = 'Asia/Kolkata';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

/* FIX-RS9E (R-S-9): ui-exercise.js saves warning-signs.top as [{ item, plan }]; the prefill and the radar read it. */
const require = createRequire(import.meta.url);
const E = require('../src/engine.js');
const C = require('../src/content-core.js');

const at = (d, t = '10:00') => `${d}T${t}:00+05:30`;
const TODAY = '2026-11-07';
const NOW = at(TODAY, '12:00');
const day = (k) => E.addDays(TODAY, k);
let n = 0;
const nid = (p) => `${p}${String(++n).padStart(5, '0')}`;
const resp = (exerciseId, payload) => ({ id: nid('r'), exerciseId, schemaVersion: 1, payload, at: NOW, mode: 'workbook', draft: false });
const checkin = (d, c) => ({ id: nid('l'), type: 'checkin', at: at(d, '21:00'), triggerIds: [], feelings: [], skills: [], drill: false, checkin: Object.assign({ kind: 'evening' }, c) });
const label = (id) => C.catalogs.warningSigns.find((s) => s.id === id).label;

/* The shape the Workbook saves: signs ticked, then the top three with a plan each (a fourth is never read). */
const saved = () => resp('warning-signs', {
  signs: ['poor-sleep', 'few-fun', 'isolating', 'lying'],
  top: [
    { item: 'poor-sleep', plan: 'Bed by 11' },
    { item: 'few-fun', plan: 'Plan a film with my sister' },
    { item: 'isolating', plan: 'Call Asha' },
    { item: 'lying', plan: 'Not read' },
  ],
});

test('prefill: the person\'s top 3 saved as { item, plan } reach the Recovery Plan warnings', () => {
  const p = E.prefillRecoveryPlan(E.makeView({ responses: [saved()] }), NOW);
  assert.deepEqual(p.warnings.items, [
    `${label('poor-sleep')}: Bed by 11`,
    `${label('few-fun')}: Plan a film with my sister`,
    `${label('isolating')}: Call Asha`,
  ]);
  assert.equal(p.warnings.confirmed, false);
});

test('prefill: an item with no plan shows the label alone; the older { id } shape still reads', () => {
  const noPlan = resp('warning-signs', { top: [{ item: 'lying', plan: '' }] });
  assert.deepEqual(E.prefillRecoveryPlan(E.makeView({ responses: [noPlan] }), NOW).warnings.items, [label('lying')]);
  const old = resp('warning-signs', { top: [{ id: 'poor-sleep', plan: 'Bed by 11' }] });
  assert.deepEqual(E.prefillRecoveryPlan(E.makeView({ responses: [old] }), NOW).warnings.items, [`${label('poor-sleep')}: Bed by 11`]);
});

test('radar: the person\'s own plans saved as { item, plan } win over the general suggestion', () => {
  const logs = [5, 4, 8, 5, 3].map((h, i) => checkin(day(-i), { sleep: h, pleasantCount: 0 })).concat([0, 0].map((c, i) => checkin(day(-5 - i), { pleasantCount: c })));
  const out = E.warningSigns(E.makeView({ logs, responses: [saved()] }), NOW);
  const sleep = out.find((s) => s.signId === 'poorSleep');
  const few = out.find((s) => s.signId === 'fewPleasant');
  assert.ok(sleep && few, 'both signs fire on these logs');
  assert.equal(sleep.own, true);
  assert.equal(sleep.plan, 'Bed by 11');
  assert.equal(few.own, true);
  assert.equal(few.plan, 'Plan a film with my sister');
});
