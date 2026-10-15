#!/usr/bin/env node
'use strict';
/*
  Builds docs/1-addic-execution-plan.docx from:
    - scripts/execution_plan/content.md   (the prose, in lightweight Markdown)
    - docs/BUILD-GUIDE.md                  (every build step and prompt, parsed verbatim)
    - docs/book/exercises.md               (the exercise → feature map)
    - docs/evidence-references.md          (the evidence list for Appendix F)
    - scripts/execution_plan/steps.js      (plain-English notes per build step)

  Usage:  node scripts/build_execution_plan_doc.js [--out docs/1-addic-execution-plan.docx] [--no-pdf] [--work <tmp dir>]

  Needs the `docx` npm package (preinstalled in Claude Code cloud sessions; otherwise `npm i -g docx`).
  If LibreOffice (soffice) and pdftotext are available, the script renders a PDF once to fill in the
  page numbers of the table of contents, then rebuilds. Word can always refresh the contents field.
  The companion script build_decisions_doc.js builds the owner's decisions document the same way.
*/
const path = require('path');
const { C, TEXT_W, TINY, docx } = require('./execution_plan/lib');
const { Paragraph, TextRun, BorderStyle, Table, TableRow, TableCell, WidthType, ShadingType, TableLayoutType } = docx;
const { loadSources } = require('./execution_plan/sources');
const { smartQuotes } = require('./execution_plan/render_md');
const { buildAndWrite, parseArgs } = require('./execution_plan/docbuild');
const gen = require('./execution_plan/generated');

const ROOT = path.resolve(__dirname, '..');
const args = parseArgs(process.argv, { out: 'docs/1-addic-execution-plan.docx' });
const TITLE = '1-addic Execution Plan';
const SUBTITLE = 'From workbook to app: the complete plan, feature guide and step-by-step build book';
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
  return [
    new Paragraph({ spacing: { before: 2600, after: 240, line: 240 }, children: [new TextRun({ text: 'PROJECT 1-ADDIC', bold: true, color: C.grey, size: 20, characterSpacing: 40 })] }),
    new Paragraph({ style: 'Title', spacing: { before: 0, after: 120, line: 240 }, children: [new TextRun('Execution Plan')] }),
    new Paragraph({ style: 'CoverSub', children: [new TextRun(smartQuotes(SUBTITLE))] }),
    rule(200),
    new Paragraph({ spacing: { before: 400, after: 0 }, children: [] }),
    coverBox('What this document is', [
      'A single, readable book for everyone helping to build 1-addic: the idea, the features, the game design, the safety and privacy rules, the technology in plain words, and the full build plan with a ready-to-paste prompt for every step.',
      'Written for the app owner, designers, a clinical reviewer and testers. No programming knowledge needed.',
    ]),
    new Paragraph({ spacing: { before: 3200, after: 60 }, children: [new TextRun({ text: smartQuotes('Built from docs/PLAN.md (draft v0.4) and docs/BUILD-GUIDE.md in the IMCOOL006/1-addic repository.'), size: TINY, color: C.grey })] }),
    new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: smartQuotes('The plan is a draft for review. Open decisions are marked "Proposed: decide in Part 10".'), size: TINY, color: C.grey })] }),
    new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: `Generated ${DATE}. Rebuild with: node scripts/build_execution_plan_doc.js`, size: TINY, color: C.grey })] }),
  ];
}

(async () => {
  const sources = loadSources(ROOT);
  const hooks = {
    steps: (bb) => gen.renderSteps(bb, sources),
    howto: (bb) => gen.renderHowTo(bb, sources),
    houserules: (bb) => gen.renderHouseRules(bb, sources),
    reusable: (bb) => gen.renderReusable(bb, sources),
    dod: (bb) => gen.renderDod(bb, sources),
    exercises: (bb) => gen.renderExercises(bb, sources),
    references: (bb) => gen.renderReferences(bb, sources),
    wireframe: (bb) => gen.renderWireframe(bb),
    pagebreak: (bb) => bb.pageBreak(),
  };
  const out = path.resolve(ROOT, args.out);
  const r = await buildAndWrite({ title: TITLE, subtitle: SUBTITLE, cover, contentPath: path.join(__dirname, 'execution_plan', 'content.md'), hooks, out, noPdf: args.noPdf, workBase: args.workBase });
  const steps = sources.guide.phases.reduce((a, p) => a + p.steps.length, 0);
  console.log(`Wrote ${path.relative(ROOT, out)} (${(r.size / 1024).toFixed(0)} KB): ${r.toc.length} contents entries, ${steps} build steps, ${sources.allPrompts.length} prompts from BUILD-GUIDE.md.`);
  console.log(`Work dir: ${r.work}`);
})().catch((e) => { console.error(e); process.exit(1); });
