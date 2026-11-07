// 1-addic · tests/helpers/harness.test.mjs · the browser harness's own checks, no browser needed (lane tests-docs).
// The test gate runs this file (territory tests glob offline/tests/helpers/**); npm test does not (top level only).
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { isAllowedUrl } from './launch.mjs';
import { REASON, HOOKS } from './hooks.mjs';
import { testArgs, SUITE } from './run-browser.mjs';

test('harness: only file, data and blob URLs are allowed', () => {
  for (const u of ['file:///C:/x/1-addic.html', 'data:image/png;base64,AA', 'blob:null/1', 'about:blank']) assert.ok(isAllowedUrl(u), u);
  for (const u of ['https://example.test/', 'http://localhost/', 'ws://x', '//cdn.test/a.js', 'chrome-extension://x']) assert.ok(!isAllowedUrl(u), u);
});

test('harness: --grep maps to --test-name-pattern and the suite is last', () => {
  assert.deepEqual(testArgs([]), ['--test', '--test-reporter=spec', SUITE]);
  assert.deepEqual(testArgs(['--grep', 'SOS']), ['--test', '--test-reporter=spec', '--test-name-pattern', 'SOS', SUITE]);
  assert.deepEqual(testArgs(['--grep=tour', '--headed']), ['--test', '--test-reporter=spec', '--test-name-pattern', 'tour', SUITE]);
});

test('harness: skip reasons are the stable strings', () => {
  assert.equal(REASON.env, 'ADDIC_BROWSER not set');
  assert.equal(REASON.built, 'offline/1-addic.html not built');
  assert.equal(REASON.browser, 'no Chrome or Chromium found');
  assert.equal(REASON.route('sos'), 'route #/sos not registered');
  assert.equal(REASON.hook(HOOKS.sosBtn), 'hook #sos-btn absent');
  assert.equal(REASON.global('UI.tour'), 'global UI.tour absent');
});

function runSuite(env) {
  const clean = { ...process.env };
  delete clean.ADDIC_BROWSER; delete clean.ADDIC_HTML; delete clean.NODE_TEST_CONTEXT;
  const r = spawnSync(process.execPath, ['--test', '--test-reporter=tap', SUITE], { env: { ...clean, ...env }, encoding: 'utf8', timeout: 60000 });
  return { status: r.status, out: (r.stdout || '') + (r.stderr || '') };
}

test('harness: the suite run bare skips every test by name and passes', () => {
  const { status, out } = runSuite({});
  assert.equal(status, 0, out);
  const tests = Number((out.match(/^# tests (\d+)/m) || [])[1]);
  const skipped = Number((out.match(/^# skipped (\d+)/m) || [])[1]);
  assert.ok(tests >= 18, 'at least the 18 named flows: ' + tests);
  assert.equal(skipped, tests, 'all skipped');
  assert.match(out, /# SKIP ADDIC_BROWSER not set/);
});

test('harness: a missing built file skips every test with its reason', () => {
  const missing = fileURLToPath(new URL('./no-such-build.html', import.meta.url));
  const { status, out } = runSuite({ ADDIC_BROWSER: '1', ADDIC_HTML: missing });
  assert.equal(status, 0, out);
  assert.match(out, /# SKIP offline\/1-addic\.html not built/);
  assert.doesNotMatch(out, /^not ok/m);
});
