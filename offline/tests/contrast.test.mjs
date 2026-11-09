// 1-addic · tests/contrast.test.mjs · the colour pairs of src/styles.css in both themes (lane tests-docs, V-27, V3-27).
// Pure Node: reads the token blocks and the rules from the stylesheet, so a changed token or rule is what gets measured.
// WCAG 2 contrast: 4.5:1 for text, 3:1 for large text (24 px, or 18.66 px bold) and for a graphic mark. One named test
// per pair per theme; a red names the pair, the ratio, the styles.css line and the owner. This lane never edits
// styles.css: a red goes to the owner by outbox. Test names are failure identities: keep them.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const CSS = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
// Comments are blanked with their length kept, so an index in BLANK is still an index in CSS.
const BLANK = CSS.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
const lineAt = (index) => CSS.slice(0, index).split('\n').length;

const TEXT = 4.5;
const LARGE = 3;

// styles.css is core's; a section appended under /* -- <lane> -- */ is that lane's (territory.json).
const BANNERS = [...CSS.matchAll(/\/\* -- ([a-z][a-z0-9-]*) -- \*\//g)].map((m) => ({ index: m.index, lane: m[1] }));
function ownerAt(index) {
  let owner = 'core';
  for (const b of BANNERS) if (b.index < index) owner = b.lane;
  return owner;
}

function tokensOf(head) {
  const out = new Map();
  const at = BLANK.indexOf(head + ' {');
  if (at < 0) return out;
  const open = at + head.length + 2;
  const body = BLANK.slice(open, BLANK.indexOf('}', open));
  for (const m of body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    out.set(m[1], { value: m[2].trim(), line: lineAt(open + m.index) });
  }
  return out;
}

const THEMES = [
  { name: 'light', tokens: tokensOf(':root') },
  { name: 'dark', tokens: tokensOf('[data-theme="dark"]') },
];
const DARK_MEDIA = tokensOf(':root:not([data-theme="light"])');

const RULES = [];
for (const m of BLANK.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const lead = m[1].length - m[1].trimStart().length;
  RULES.push({ selectors: m[1].split(',').map((s) => s.trim().replace(/\s+/g, ' ')), body: m[2], index: m.index + lead });
}

function declared(rule, prop) {
  for (const d of rule.body.split(';')) {
    const c = d.indexOf(':');
    if (c > 0 && d.slice(0, c).trim() === prop) return d.slice(c + 1).trim();
  }
  return null;
}

const token = (name) => ({ token: name });
const rule = (selector, prop) => ({ selector, prop });

// A source -> { expr, line, owner }: a token's own line, or the line of the first rule with exactly this selector.
function locate(src, tokens) {
  if (src.token) {
    const t = tokens.get(src.token);
    assert.ok(t, `styles.css has no token --${src.token}`);
    return { expr: `hsl(var(--${src.token}))`, line: t.line, owner: 'core' };
  }
  const props = src.prop === 'background' ? ['background', 'background-color'] : [src.prop];
  for (const r of RULES) {
    if (!r.selectors.includes(src.selector)) continue;
    for (const p of props) {
      const expr = declared(r, p);
      if (expr) return { expr, line: lineAt(r.index), owner: ownerAt(r.index) };
    }
  }
  return assert.fail(`styles.css has no rule "${src.selector}" setting ${src.prop}`);
}

function hslOf(triplet, label) {
  const m = /^(-?[\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/.exec(triplet.trim());
  assert.ok(m, `${label} is not an HSL triplet: ${triplet}`);
  return { h: Number(m[1]), s: Number(m[2]) / 100, l: Number(m[3]) / 100 };
}

function colour(expr, tokens) {
  let m = /^hsl\(var\(--([\w-]+)\)(?:\s*\/\s*([\d.]+))?\)$/.exec(expr);
  if (m) {
    const t = tokens.get(m[1]);
    assert.ok(t, `styles.css has no token --${m[1]}`);
    return { ...rgbOf(hslOf(t.value, '--' + m[1])), a: m[2] ? Number(m[2]) : 1 };
  }
  m = /^hsl\(([^/)]+)(?:\/\s*([\d.]+))?\)$/.exec(expr);
  assert.ok(m, `not a colour this check can read: ${expr}`);
  return { ...rgbOf(hslOf(m[1], expr)), a: m[2] ? Number(m[2]) : 1 };
}

function rgbOf({ h, s, l }) {
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return { r: f(0), g: f(8), b: f(4) };
}

const over = (top, under) => ({
  r: top.r * top.a + under.r * (1 - top.a),
  g: top.g * top.a + under.g * (1 - top.a),
  b: top.b * top.a + under.b * (1 - top.a),
  a: 1,
});

function luminance({ r, g, b }) {
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// fg and bg name a token or a rule's declaration; on is the token under a translucent background; min defaults to TEXT.
const both = (selector) => ({ fg: rule(selector, 'color'), bg: rule(selector, 'background') });
const PAIRS = [
  { name: 'body text on the page', fg: token('text'), bg: token('bg') },
  { name: 'body text on a card', fg: token('text'), bg: token('surface') },
  { name: 'body text on the raised surface', fg: token('text'), bg: token('surface-2') },
  { name: 'muted text on the page', fg: rule('.muted', 'color'), bg: token('bg') },
  { name: 'muted text on a card', fg: rule('.muted', 'color'), bg: token('surface') },
  { name: 'muted text on the raised surface', fg: rule('.muted', 'color'), bg: token('surface-2') },
  { name: 'link on the page', fg: rule('a', 'color'), bg: token('bg') },
  { name: 'link on a card', fg: rule('a', 'color'), bg: token('surface') },
  { name: 'ghost button on a card', fg: rule('.btn.ghost', 'color'), bg: token('surface') },
  { name: 'field error on a card', fg: rule('.field-error', 'color'), bg: token('surface') },
  { name: 'risky-time label on a card', fg: rule('.td-risky', 'color'), bg: token('surface') },
  { name: 'SOS target number on a card', fg: rule('.sos-target-number', 'color'), bg: token('surface'), min: LARGE },
  { name: 'badge text', fg: token('text'), bg: rule('.badge', 'background'), on: 'surface' },
  { name: 'tip text', fg: token('text'), bg: rule('.tip', 'background'), on: 'surface' },
  { name: 'primary button', ...both('.btn.primary') },
  { name: 'danger button', ...both('.btn.danger') },
  { name: 'selected chip', ...both('.chip.on') },
  { name: 'floating SOS button', ...both('.sos-btn') },
  { name: 'sheet SOS button', ...both('.sheet-sos') },
  { name: 'toast', ...both('.toast') },
  { name: '.coach-sos', ...both('.coach-sos') },
  { name: '.gt-dot', ...both('.gt-dot') },
];

// A red waiting for its owner's fix: still measured and reported by name as TODO with the ratio, and not counted as a
// pass. Delete the line in the commit that fixes the pair. Not a place to put a pair nobody has been told about.
const KNOWN_RED = {
  '.coach-sos (dark)': 'owed by game-tutorials, styles.css:568: white on --danger; the rule .btn.danger uses --primary-text',
};

for (const pair of PAIRS) {
  for (const theme of THEMES) {
    const name = `${pair.name} (${theme.name})`;
    test(`contrast: ${name}`, { todo: KNOWN_RED[name] || false }, () => {
      const min = pair.min || TEXT;
      const f = locate(pair.fg, theme.tokens);
      const b = locate(pair.bg, theme.tokens);
      let back = colour(b.expr, theme.tokens);
      if (back.a < 1) {
        assert.ok(pair.on, `${b.expr} is translucent and the pair names nothing under it`);
        back = over(back, colour(`hsl(var(--${pair.on}))`, theme.tokens));
      }
      const got = ratio(over(colour(f.expr, theme.tokens), back), back);
      const at = f.line === b.line ? `styles.css:${f.line}` : `styles.css:${f.line} and :${b.line}`;
      const owners = [...new Set([f.owner, b.owner])].join(', ');
      assert.ok(got >= min, `${pair.name} (${theme.name}): ${got.toFixed(2)}:1 is under ${min}:1; ${f.expr} on ${b.expr}; ${at}; owner ${owners}`);
    });
  }
}

// The dark colours are measured once, on [data-theme="dark"]; a phone set to dark with no saved theme gets the media block.
test('contrast: the dark media block has the colours of [data-theme="dark"]', () => {
  const dark = THEMES[1].tokens;
  assert.ok(dark.size > 0 && DARK_MEDIA.size > 0, 'both dark blocks are found');
  for (const [name, t] of dark) assert.equal(DARK_MEDIA.get(name)?.value, t.value, `--${name} differs between the two dark blocks`);
});
