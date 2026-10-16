#!/usr/bin/env node
'use strict';
/*
  Generic document builder: turns one lightweight-Markdown file (with a front-matter block) into a
  Word document in the house style, with a cover, a contents page and two-pass page numbers.

  Front matter (between the opening "---" lines):
    title:      document title (required)
    subtitle:   one sentence under the title
    kicker:     small caps line above the title (default: PROJECT 1-ADDIC)
    box_title:  heading of the shaded box on the cover
    box:        box text; separate paragraphs with " || "
    note:       small grey line at the foot of the cover
    header:     text for the page header (default: "1-addic: <title>")

  Usage:  node scripts/build_doc.js --content docs/program/EARLY-ACCESS-AND-PROGRAM.md \
            --out docs/1-addic-early-access-and-program.docx [--no-pdf] [--work <tmp dir>]
  Check:  python3 scripts/check_execution_plan_doc.py <out.docx> --briefs-only
*/
const fs = require('fs');
const path = require('path');
const { C, TEXT_W, TINY, docx } = require('./execution_plan/lib');
const { Paragraph, TextRun, BorderStyle, Table, TableRow, TableCell, WidthType, ShadingType, TableLayoutType } = docx;
const { smartQuotes } = require('./execution_plan/render_md');
const { buildAndWrite, parseArgs } = require('./execution_plan/docbuild');

const ROOT = path.resolve(__dirname, '..');
const argv = process.argv.slice(2);
const get = (flag) => (argv.includes(flag) ? argv[argv.indexOf(flag) + 1] : undefined);
const contentArg = get('--content');
if (!contentArg) {
  console.error('Usage: node scripts/build_doc.js --content <file.md> [--out <file.docx>] [--no-pdf] [--work <dir>]');
  process.exit(2);
}
const contentPath = path.resolve(ROOT, contentArg);
const defaultOut = path.join('docs', path.basename(contentArg).replace(/\.md$/i, '').toLowerCase() + '.docx');
const args = parseArgs(process.argv, { out: defaultOut });

function frontMatter(md) {
  const m = md.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n/);
  const fm = {};
  if (m) {
    for (const line of m[1].split('\n')) {
      const k = line.match(/^([a-z_]+):\s*(.*)$/);
      if (k) fm[k[1]] = k[2].trim();
    }
  }
  if (!fm.title) throw new Error(`${contentArg}: front matter needs a "title:" line`);
  return fm;
}

const fm = frontMatter(fs.readFileSync(contentPath, 'utf8'));
const TITLE = fm.header || `1-addic: ${fm.title}`;
const DATE = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
function coverBox(title, lines) {
  return new Table({
    width: { size: TEXT_W, type: WidthType.DXA }, columnWidths: [TEXT_W], layout: TableLayoutType.FIXED,
    borders: { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none },
    rows: [new TableRow({ children: [new TableCell({
      width: { size: TEXT_W, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: C.tealLight, color: 'auto' },
      margins: { top: 200, bottom: 200, left: 260, right: 260 },
      borders: { top: none, bottom: none, right: none, left: { style: BorderStyle.SINGLE, size: 28, color: C.teal } },
      children: [
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: title, bold: true, color: C.tealDark })] }),
        ...lines.map((t, i) => new Paragraph({ spacing: { after: i === lines.length - 1 ? 0 : 80 }, children: [new TextRun(smartQuotes(t))] })),
      ] })] })],
  });
}

function cover() {
  const rule = (before) => new Paragraph({ spacing: { before, after: 0 }, border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: C.teal, space: 1 } }, children: [] });
  const boxLines = (fm.box || '').split('||').map((s) => s.trim()).filter(Boolean);
  const out = [
    new Paragraph({ spacing: { before: 2600, after: 240, line: 240 }, children: [new TextRun({ text: fm.kicker || 'PROJECT 1-ADDIC', bold: true, color: C.grey, size: 20, characterSpacing: 40 })] }),
    new Paragraph({ style: 'Title', spacing: { before: 0, after: 120, line: 240, lineRule: 'auto' }, children: [new TextRun(smartQuotes(fm.title))] }),
  ];
  if (fm.subtitle) out.push(new Paragraph({ style: 'CoverSub', spacing: { after: 120, line: 240, lineRule: 'auto' }, children: [new TextRun(smartQuotes(fm.subtitle))] }));
  out.push(rule(200), new Paragraph({ spacing: { before: 400, after: 0 }, children: [] }));
  if (boxLines.length) out.push(coverBox(fm.box_title || 'About this document', boxLines));
  out.push(new Paragraph({ spacing: { before: 3200, after: 60 }, children: [new TextRun({ text: smartQuotes(fm.note || `Companion to the 1-addic Execution Plan (docs/1-addic-execution-plan.docx).`), size: TINY, color: C.grey })] }));
  out.push(new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: `Generated ${DATE}. Rebuild with: node scripts/build_doc.js --content ${path.relative(ROOT, contentPath)}`, size: TINY, color: C.grey })] }));
  return out;
}

(async () => {
  const hooks = { pagebreak: (bb) => bb.pageBreak() };
  const out = path.resolve(ROOT, args.out);
  const r = await buildAndWrite({ title: TITLE, subtitle: fm.subtitle || '', cover, contentPath, hooks, out, noPdf: args.noPdf, workBase: args.workBase });
  console.log(`Wrote ${path.relative(ROOT, out)} (${(r.size / 1024).toFixed(0)} KB): ${r.toc.length} contents entries${r.pageCount ? `, ${r.pageCount} pages` : ''}.`);
  console.log(`Work dir: ${r.work}`);
})().catch((e) => { console.error(e); process.exit(1); });
