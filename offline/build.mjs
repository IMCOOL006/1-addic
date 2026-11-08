// 1-addic offline build (Node 22): inlines the parts of offline/src into one file,
// offline/1-addic.html, under a Content-Security-Policy that forbids every network request.
// Run: node offline/build.mjs (or npm run build). BUILD-PLAN 3.1.
//
// Shared append point: the parts list below. A lane whose file is not listed adds ONE line
// between the two banner lines, in the order of BUILD-PLAN 3.1 (boot.js stays last).
// Nothing else in this file is shared.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const PARTS = [
// -- parts --
  'content-core.js',
  'content-lessons-a.js',
  'content-lessons-b.js',
  'content-lessons-c.js',
  'content-exercises.js',
  'content-practices.js',
  'content-sample.js',
  'content-quests.js',
  'engine.js',
  'store.js',
  'actions.js',
  'ui-core.js',
  'ui-today.js',
  'ui-sos.js',
  'ui-learn.js',
  'ui-exercise.js',
  'ui-workbook.js',
  'ui-track.js',
  'ui-actions.js',
  'ui-settings.js',
  'ui-game.js',
  'ui-tools.js',
  'ui-onboarding.js',
  'ui-harbor.js',
  'ui-status.js',
  'ui-plan.js',
  'ui-practices.js',
  'ui-guidance.js',
  'boot.js',
// -- end parts --
];

// The policy of BUILD-PLAN 3.1, exactly: nothing is fetched, posted or loaded from outside the file.
const CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; " +
  "img-src data: blob:; media-src data: blob:; font-src data:; connect-src 'none'; " +
  "form-action 'none'; base-uri 'none'";

// Runs before first paint so the page never flashes the wrong theme. A stored 'light' or 'dark'
// wins; anything else (none, 'system', storage blocked) follows the device setting.
// The discreet flag '1-addic:discreet' is read here too (RS7): '1' sets html[data-discreet] and the tab title
// 'Notebook' (O1) before first paint; styles.css keeps the name and the SOS button discreet until ui-core paints them.
const THEME_SCRIPT = "(function(){var t=null;try{t=localStorage.getItem('1-addic:theme');}catch(e){}" +
  "if(t!=='light'&&t!=='dark'){var d=false;try{d=!!(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);}catch(e){}" +
  "t=d?'dark':'light';}document.documentElement.setAttribute('data-theme',t);" +
  "var q=null;try{q=localStorage.getItem('1-addic:discreet');}catch(e){}" +
  "if(q==='1'){document.documentElement.setAttribute('data-discreet','');document.title='Notebook';}})();";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, 'src');
const OUT = path.join(HERE, '1-addic.html');
const OUT_NAME = 'offline/1-addic.html';

function fail(msg) {
  process.stderr.write('build failed: ' + msg + '\n');
  process.exit(1);
}

function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8').replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  } catch (err) {
    return fail('cannot read ' + path.relative(HERE, file).replace(/\\/g, '/') + ' (' + err.code + ')');
  }
}

// A part sits inside <script>...</script>. "</script" would end the element early and "<!--"
// can switch the HTML parser into an escaped state, so both are rewritten into forms that mean
// the same inside JS strings, templates, regexes and comments.
function escapeScript(code) {
  return code.replace(/<\/(script)/gi, '<\\/$1').replace(/<!--/g, '\\x3C!--');
}

function checkParses(code, name) {
  try {
    new vm.Script(code, { filename: name });
  } catch (err) {
    fail(name + ' does not parse: ' + err.message);
  }
}

function build() {
  const seen = new Set();
  for (const name of PARTS) {
    if (seen.has(name)) fail('the parts list names ' + name + ' twice');
    seen.add(name);
  }
  if (PARTS[PARTS.length - 1] !== 'boot.js') fail('boot.js must be the last part');

  const css = readText(path.join(SRC, 'styles.css'));
  if (/<\/style/i.test(css)) fail('styles.css contains "</style"');
  const shell = readText(path.join(SRC, 'shell.html'));

  const scripts = [];
  const skipped = [];
  for (const name of PARTS) {
    const file = path.join(SRC, name);
    if (!fs.existsSync(file)) { skipped.push(name); continue; }
    const code = readText(file);
    checkParses(code, name);
    const safe = escapeScript(code);
    checkParses(safe, name + ' (escaped)');
    scripts.push('<script data-part="' + name + '">\n' + safe.replace(/\n*$/, '\n') + '</script>');
  }

  const listed = new Set(PARTS);
  const unlisted = fs.readdirSync(SRC).filter((f) => f.endsWith('.js') && !listed.has(f)).sort();

  const html = [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    '<meta http-equiv="Content-Security-Policy" content="' + CSP + '">',
    '<meta name="referrer" content="no-referrer">',
    '<meta name="color-scheme" content="light dark">',
    '<title>1-addic</title>',
    '<script>' + THEME_SCRIPT + '</script>',
    '<style>\n' + css.replace(/\n*$/, '\n') + '</style>',
    '</head>',
    '<body>',
    shell.replace(/\n*$/, ''),
    ...scripts,
    '</body>',
    '</html>',
    '',
  ].join('\n');

  try {
    fs.writeFileSync(OUT, html, 'utf8');
  } catch (err) {
    fail('cannot write ' + OUT_NAME + ' (' + err.code + ')');
  }
  const bytes = Buffer.byteLength(html, 'utf8');
  console.log('built ' + OUT_NAME + ' ' + bytes + ' B (' + (bytes / 1024).toFixed(1) + ' kB), ' +
    scripts.length + ' parts, skipped (absent): ' + (skipped.length ? skipped.join(', ') : 'none'));
  if (unlisted.length) console.log('not in the parts list (not built): ' + unlisted.join(', '));
}

build();
