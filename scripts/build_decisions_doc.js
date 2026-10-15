#!/usr/bin/env node
'use strict';
/*
  Builds docs/1-addic-decisions-needed.docx: every decision and input the project needs from the
  owner, phrased as questions with options, a recommendation and a place to answer.

    - scripts/execution_plan/decisions.md   (the questions, in lightweight Markdown)
    - docs/BUILD-GUIDE.md                    (the Step 0.1 prompt, copied verbatim into the appendix)

  Usage:  node scripts/build_decisions_doc.js [--out docs/1-addic-decisions-needed.docx] [--no-pdf] [--work <tmp dir>]
  Check:  python3 scripts/check_execution_plan_doc.py docs/1-addic-decisions-needed.docx --briefs-only
*/
const path = require('path');
const { C, TEXT_W, TINY, docx } = require('./execution_plan/lib');
const { Paragraph, TextRun, BorderStyle, Table, TableRow, TableCell, WidthType, ShadingType, TableLayoutType } = docx;
const { loadSources } = require('./execution_plan/sources');
const { smartQuotes } = require('./execution_plan/render_md');
const { buildAndWrite, parseArgs } = require('./execution_plan/docbuild');

const ROOT = path.resolve(__dirname, '..');
const args = parseArgs(process.argv, { out: 'docs/1-addic-decisions-needed.docx' });
const TITLE = '1-addic: What I need from you';
const SUBTITLE = 'The decisions and inputs the project needs from its owner, with options and recommendations';
const DATE = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
function coverBox(title, lines) {
  return new Table({
    width: { size: TEXT_W, type: WidthType.DXA }, columnWidths: [TEXT_W], layout: TableLayoutType.FIXED,
    borders: { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none },
    rows: [new TableRow({ children: [new TableCell({
      width: { size: TEXT_W, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: C.amberLight, color: 'auto' },
      margins: { top: 200, bottom: 200, left: 260, right: 260 },
      borders: { top: none, bottom: none, right: none, left: { style: BorderStyle.SINGLE, size: 28, color: C.amber } },
      children: [
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: title, bold: true, color: '8A5A00' })] }),
        ...lines.map((t, i) => new Paragraph({ spacing: { after: i === lines.length - 1 ? 0 : 80 }, children: [new TextRun(smartQuotes(t))] })),
      ] })] })],
  });
}

function cover() {
  const rule = (before) => new Paragraph({ spacing: { before, after: 0 }, border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: C.teal, space: 1 } }, children: [] });
  return [
    new Paragraph({ spacing: { before: 2600, after: 240, line: 240 }, children: [new TextRun({ text: 'PROJECT 1-ADDIC', bold: true, color: C.grey, size: 20, characterSpacing: 40 })] }),
    new Paragraph({ style: 'Title', spacing: { before: 0, after: 120, line: 240 }, children: [new TextRun('What I need from you')] }),
    new Paragraph({ style: 'CoverSub', children: [new TextRun(smartQuotes(SUBTITLE))] }),
    rule(200),
    new Paragraph({ spacing: { before: 400, after: 0 }, children: [] }),
    coverBox('How to use this', [
      'Thirty-seven questions: the nineteen decisions in the plan, thirteen inputs only you can provide, and five confirmations of what was added this month. Each has a short brief, the options, a recommendation and a place for your answer.',
      '"Accept the recommendation" is always a valid answer. Part 4 is a one-page answer sheet if you want to go fast.',
    ]),
    new Paragraph({ spacing: { before: 3200, after: 60 }, children: [new TextRun({ text: smartQuotes('Companion to the 1-addic Execution Plan (docs/1-addic-execution-plan.docx). Decisions follow PLAN.md §15, draft v0.4.'), size: TINY, color: C.grey })] }),
    new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: `Generated ${DATE}. Rebuild with: node scripts/build_decisions_doc.js`, size: TINY, color: C.grey })] }),
  ];
}

(async () => {
  const sources = loadSources(ROOT);
  const step01 = sources.guide.phases[0].steps.find((s) => s.id === '0.1');
  const hooks = {
    answer: (bb) => {
      bb.label('My answer');
      bb.checks(['Accept the recommendation.', 'Something else (write it here): ________________________________________']);
      bb.note('Notes: ______________________________________________________________________________');
    },
    step01: (bb) => {
      bb.p(smartQuotes('The Step 0.1 prompt, copied word for word from the build guide:'), { keepNext: true });
      bb.promptBox(step01.prompt);
    },
    pagebreak: (bb) => bb.pageBreak(),
  };
  const out = path.resolve(ROOT, args.out);
  const r = await buildAndWrite({ title: TITLE, subtitle: SUBTITLE, cover, contentPath: path.join(__dirname, 'execution_plan', 'decisions.md'), hooks, out, noPdf: args.noPdf, workBase: args.workBase });
  console.log(`Wrote ${path.relative(ROOT, out)} (${(r.size / 1024).toFixed(0)} KB): ${r.toc.length} contents entries.`);
  console.log(`Work dir: ${r.work}`);
})().catch((e) => { console.error(e); process.exit(1); });
