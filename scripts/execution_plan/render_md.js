'use strict';
// Renders the lightweight Markdown in content.md into docx-js elements via the Builder.
// Supported: # ## ### headings · "> " brief directly after a heading · paragraphs · "- " bullets
// (indent 2 spaces for a sub-level) · "1. " numbered lists · "- [ ] " checkboxes · pipe tables with
// optional "@widths 2,1,1", "@size 18" and "@caption ..." lines before them · "::: kind [Lead text:] ... :::" callouts
// (inshort, safety, decision, tip, moment; an optional lead replaces the default bold opener) · "**Label**" alone on a line · "~ small note" ·
// "```text" prompt boxes · "@directive" lines handled by the generated-section hooks.

function smartQuotes(s) {
  return s
    .replace(/(^|[\s(\[{—-])"/g, '$1“')
    .replace(/"/g, '”')
    .replace(/(^|[\s(\[{])'/g, '$1‘')
    .replace(/'/g, '’');
}

function parseCell(raw) {
  const parts = raw.split('<br>').map((p) => p.trim()).filter((p, i, a) => p.length || a.length === 1);
  if (parts.length && parts.every((p) => p.startsWith('• '))) return { list: parts.map((p) => p.slice(2)) };
  if (parts.length > 1 && parts.slice(1).every((p) => p.startsWith('• '))) return { before: parts[0], list: parts.slice(1).map((p) => p.slice(2)) };
  return parts.length === 1 ? parts[0] : parts;
}

function splitRow(line) {
  // split on | not inside backticks
  const cells = [];
  let cur = '';
  let inCode = false;
  for (const ch of line) {
    if (ch === '`') inCode = !inCode;
    if (ch === '|' && !inCode) { cells.push(cur); cur = ''; } else cur += ch;
  }
  cells.push(cur);
  return cells.slice(1, -1).map((c) => c.trim());
}

function render(md, b, hooks) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  let i = 0;
  let lastHeading = 0; // level of the heading just emitted (for briefs)
  let pendingWidths = null;
  let pendingCaption = null;
  let pendingSize = null;
  const q = (s) => smartQuotes(s);

  const flushPara = (buf) => { if (buf.length) b.p(q(buf.join(' '))); };

  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = l.match(/^(#{1,3}) (.*)$/))) {
      const level = m[1].length;
      const text = q(m[2].trim());
      if (level === 1) b.h1(text); else if (level === 2) b.h2(text); else b.h3(text);
      lastHeading = level; i++; continue;
    }
    if (l.startsWith('> ')) {
      const buf = [l.slice(2)];
      i++;
      while (i < lines.length && lines[i].startsWith('> ')) { buf.push(lines[i].slice(2)); i++; }
      const text = q(buf.join(' ').replace(/^In short:\s*/i, ''));
      if (lastHeading === 3) b.brief3(text); else b.brief(text);
      lastHeading = 0; continue;
    }
    lastHeading = 0;
    if ((m = l.match(/^@widths (.*)$/))) { pendingWidths = m[1].split(',').map((x) => parseFloat(x.trim())); i++; continue; }
    if ((m = l.match(/^@caption (.*)$/))) { pendingCaption = q(m[1].trim()); i++; continue; }
    if ((m = l.match(/^@size (\d+)$/))) { pendingSize = parseInt(m[1], 10); i++; continue; }
    if ((m = l.match(/^@(\w+)(?:\s+(.*))?$/))) {
      const fn = hooks[m[1]];
      if (!fn) throw new Error(`Unknown directive @${m[1]} at line ${i + 1}`);
      fn(b, m[2]); i++; continue;
    }
    if ((m = l.match(/^::: (\w+)(?:\s+(.*?))?\s*$/))) {
      const kind = m[1];
      const lead = m[2] ? q(m[2].trim()) + ' ' : undefined;
      const paras = [];
      let buf = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ':::') {
        if (!lines[i].trim()) { if (buf.length) { paras.push(buf.join(' ')); buf = []; } }
        else buf.push(lines[i].trim());
        i++;
      }
      if (buf.length) paras.push(buf.join(' '));
      i++;
      b.callout(kind, paras.map(q), lead ? { lead } : {});
      continue;
    }
    if (l.startsWith('```')) {
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) { buf.push(lines[i]); i++; }
      i++;
      b.promptBox(buf.join('\n'));
      continue;
    }
    if (l.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) { rows.push(lines[i]); i++; }
      const header = splitRow(rows[0]);
      const body = rows.slice(2).map(splitRow);
      const widths = pendingWidths || header.map(() => 1);
      const cols = header.map((h, k) => ({ header: q(h), w: widths[k] || 1 }));
      b.table({ columns: cols, rows: body.map((r) => r.map((c) => { const v = parseCell(c); if (typeof v === 'string') return q(v); if (Array.isArray(v)) return v.map(q); return { before: v.before && q(v.before), list: v.list.map(q) }; })), caption: pendingCaption, size: pendingSize || undefined });
      pendingWidths = null; pendingCaption = null; pendingSize = null;
      continue;
    }
    if ((m = l.match(/^\*\*(.+)\*\*$/))) { b.label(q(m[1])); i++; continue; }
    if (l.startsWith('~ ')) { b.note(q(l.slice(2))); i++; continue; }
    if (/^- \[ \] /.test(l)) {
      const items = [];
      while (i < lines.length && /^- \[ \] /.test(lines[i])) { items.push(q(lines[i].slice(6))); i++; }
      b.checks(items); continue;
    }
    if (/^(\s*)- /.test(l)) {
      const items = [];
      while (i < lines.length && /^(\s*)- /.test(lines[i])) {
        const mm = lines[i].match(/^(\s*)- (.*)$/);
        items.push({ level: mm[1].length >= 2 ? 1 : 0, text: q(mm[2]) });
        i++;
      }
      b.bullets(items); continue;
    }
    if (/^\d+\. /.test(l)) {
      // A numbered list; indented "- " lines inside it are sub-bullets and do not restart the numbering.
      const instance = b.numberedStart();
      while (i < lines.length && (/^\d+\. /.test(lines[i]) || /^\s{2,}- /.test(lines[i]))) {
        if (/^\d+\. /.test(lines[i])) b.numberedItem(instance, q(lines[i].replace(/^\d+\. /, '')));
        else b.bullets([{ level: 1, text: q(lines[i].replace(/^\s+- /, '')) }]);
        i++;
      }
      continue;
    }
    // paragraph: join following plain lines
    const buf = [l.trim()];
    i++;
    while (i < lines.length && lines[i].trim() && !/^(#{1,3} |> |@|::: |```|\||\*\*.+\*\*$|~ |\s*- |\d+\. )/.test(lines[i])) { buf.push(lines[i].trim()); i++; }
    flushPara(buf);
  }
}

module.exports = { render, smartQuotes };
