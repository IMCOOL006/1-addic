// 1-addic · tests/helpers/run-browser.mjs · `npm run test:browser [-- --grep P]` (lane tests-docs).
// Sets ADDIC_BROWSER=1 and runs node's own test runner (spec reporter) over browser.test.mjs; --grep P becomes
// --test-name-pattern P. The exit code is forwarded; the summary line (`ℹ tests N`) is node's.
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const SUITE = fileURLToPath(new URL('../browser.test.mjs', import.meta.url));

export function testArgs(argv) {
  const out = ['--test', '--test-reporter=spec'];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--grep' && i + 1 < argv.length) { out.push('--test-name-pattern', argv[i + 1]); i += 1; }
    else if (a.startsWith('--grep=')) out.push('--test-name-pattern', a.slice('--grep='.length));
    else if (a !== '--headed') out.push(a); // --headed is passed by env (ADDIC_HEADED) below
  }
  out.push(SUITE);
  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const argv = process.argv.slice(2);
  const env = { ...process.env, ADDIC_BROWSER: '1' };
  if (argv.includes('--headed')) env.ADDIC_HEADED = '1';
  const r = spawnSync(process.execPath, testArgs(argv), { stdio: 'inherit', env });
  process.exit(r.status === null ? 1 : r.status);
}
