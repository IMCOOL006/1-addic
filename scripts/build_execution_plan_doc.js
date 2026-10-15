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
*/
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync, spawnSync } = require('child_process');

const { Builder, styles, numbering, C, PAGE, TEXT_W, FONT, TINY, docx } = require('./execution_plan/lib');
const { Document, Packer, Paragraph, TextRun, Header, Footer, PageNumber, AlignmentType, BorderStyle, Tab, InternalHyperlink, Table, TableRow, TableCell, WidthType, ShadingType, TableLayoutType } = docx;
const { loadSources } = require('./execution_plan/sources');
const { render, smartQuotes } = require('./execution_plan/render_md');
const gen = require('./execution_plan/generated');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const outArg = args.includes('--out') ? args[args.indexOf('--out') + 1] : 'docs/1-addic-execution-plan.docx';
const OUT = path.resolve(ROOT, outArg);
const NO_PDF = args.includes('--no-pdf');
const WORK_BASE = args.includes('--work') ? path.resolve(args[args.indexOf('--work') + 1]) : os.tmpdir();
const TITLE = '1-addic Execution Plan';
const SUBTITLE = 'From workbook to app: the complete plan, feature guide and step-by-step build book';
const DATE = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

function coverPage() {
  const rule = (before) => new Paragraph({ spacing: { before, after: 0 }, border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: C.teal, space: 1 } }, children: [] });
  const box = new Table({
    width: { size: TEXT_W, type: WidthType.DXA }, columnWidths: [TEXT_W], layout: TableLayoutType.FIXED,
    borders: { top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' } },
    rows: [new TableRow({ children: [new TableCell({
      width: { size: TEXT_W, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: C.tealLight, color: 'auto' },
      margins: { top: 200, bottom: 200, left: 260, right: 260 },
      borders: { top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, left: { style: BorderStyle.SINGLE, size: 28, color: C.teal } },
      children: [
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: 'What this document is', bold: true, color: C.tealDark })] }),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun(smartQuotes('A single, readable book for everyone helping to build 1-addic: the idea, the features, the game design, the safety and privacy rules, the technology in plain words, and the full build plan with a ready-to-paste prompt for every step.'))] }),
        new Paragraph({ spacing: { after: 0 }, children: [new TextRun(smartQuotes('Written for the app owner, designers, a clinical reviewer and testers. No programming knowledge needed.'))] }),
      ] })] })],
  });
  return [
    new Paragraph({ spacing: { before: 2600, after: 240, line: 240 }, children: [new TextRun({ text: 'PROJECT 1-ADDIC', bold: true, color: C.grey, size: 20, characterSpacing: 40 })] }),
    new Paragraph({ style: 'Title', spacing: { before: 0, after: 120, line: 240 }, children: [new TextRun('Execution Plan')] }),
    new Paragraph({ style: 'CoverSub', children: [new TextRun(smartQuotes(SUBTITLE))] }),
    rule(200),
    new Paragraph({ spacing: { before: 400, after: 0 }, children: [] }),
    box,
    new Paragraph({ spacing: { before: 3200, after: 60 }, children: [new TextRun({ text: smartQuotes('Built from docs/PLAN.md (draft v0.2) and docs/BUILD-GUIDE.md in the IMCOOL006/1-addic repository.'), size: TINY, color: C.grey })] }),
    new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: smartQuotes('The plan is a draft for review. Open decisions are marked "Proposed: decide in Part 10".'), size: TINY, color: C.grey })] }),
    new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: `Generated ${DATE}. Rebuild with: node scripts/build_execution_plan_doc.js`, size: TINY, color: C.grey })] }),
  ];
}

function contentsPages(toc, pageMap) {
  const paras = [new Paragraph({ style: 'ContentsTitle', children: [new TextRun('Contents')] })];
  toc.forEach((e, idx) => {
    const page = pageMap && pageMap[idx] ? String(pageMap[idx]) : '';
    paras.push(new Paragraph({
      style: e.level === 1 ? 'TOC1' : 'TOC2',
      keepLines: true,
      children: [
        new InternalHyperlink({ anchor: e.anchor, children: [new TextRun({ text: e.text })] }),
        new TextRun({ children: [new Tab(), page] }),
      ],
    }));
  });
  return paras;
}

async function buildDocx(pageMap) {
  const sources = loadSources(ROOT);
  const b = new Builder();
  const md = fs.readFileSync(path.join(__dirname, 'execution_plan', 'content.md'), 'utf8');
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
  render(md, b, hooks);

  const header = new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.tealMid, space: 4 } }, spacing: { after: 0 }, children: [new TextRun({ text: TITLE, size: TINY, color: C.grey })] })] });
  const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [new TextRun({ children: ['Page ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES], size: TINY, color: C.grey })] })] });
  const empty = () => new Paragraph({ children: [] });

  const doc = new Document({
    creator: '1-addic project', title: TITLE, description: SUBTITLE,
    features: { updateFields: true },
    styles, numbering,
    sections: [{
      properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: { top: PAGE.top, bottom: PAGE.bottom, left: PAGE.left, right: PAGE.right, header: 600, footer: 560 } }, titlePage: true },
      headers: { default: header, first: new Header({ children: [empty()] }) },
      footers: { default: footer, first: new Footer({ children: [empty()] }) },
      children: [...coverPage(), ...contentsPages(b.toc, pageMap), ...b.children],
    }],
  });
  const buf = await Packer.toBuffer(doc);
  return { buffer: await wrapTocInField(buf), toc: b.toc, stats: { headings: b.toc.length, steps: sources.guide.phases.reduce((a, p) => a + p.steps.length, 0), prompts: sources.allPrompts.length } };
}

// Post-processing: turn the contents paragraphs into a real Word TOC field (so "Update field" regenerates
// them), fix paragraph-border order, and give bookmarks unique ids.
async function wrapTocInField(buffer) {
  const JSZip = require(require.resolve('jszip', { paths: [path.dirname(require.resolve('docx'))] }));
  const zip = await JSZip.loadAsync(buffer);
  let xml = await zip.file('word/document.xml').async('string');
  const paras = [...xml.matchAll(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g)].filter((m) => /<w:pStyle w:val="TOC[12]"\/>/.test(m[0]));
  if (paras.length) {
    const first = paras[0];
    const last = paras[paras.length - 1];
    const begin = '<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> TOC \\o "1-2" \\h \\z \\u </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r>';
    const end = '<w:r><w:fldChar w:fldCharType="end"/></w:r>';
    const lastNew = last[0].replace(/<\/w:p>$/, end + '</w:p>');
    const firstNew = first[0].replace(/<\/w:pPr>/, '</w:pPr>' + begin);
    // Replace last first (it sits after first in the string), then first.
    xml = xml.slice(0, last.index) + lastNew + xml.slice(last.index + last[0].length);
    xml = xml.slice(0, first.index) + (first === last ? firstNew.replace(/<\/w:p>$/, end + '</w:p>') : firstNew) + xml.slice(first.index + first[0].length);
  }
  // docx-js writes paragraph borders in the order given; Word's schema wants top, left, bottom, right, between, bar.
  const order = ['w:top', 'w:left', 'w:bottom', 'w:right', 'w:between', 'w:bar'];
  xml = xml.replace(/<w:pBdr>([\s\S]*?)<\/w:pBdr>/g, (m, inner) => {
    const parts = inner.match(/<w:[a-z]+\b[^>]*\/>/g) || [];
    parts.sort((a, b) => order.indexOf(a.match(/<(w:[a-z]+)/)[1]) - order.indexOf(b.match(/<(w:[a-z]+)/)[1]));
    return '<w:pBdr>' + parts.join('') + '</w:pBdr>';
  });
  // docx-js gives every bookmark the same numeric id; number them so Word's hyperlinks resolve.
  let n = 0;
  xml = xml.replace(/<w:bookmarkStart ([^>]*?)w:id="\d+"/g, (m, pre) => `<w:bookmarkStart ${pre}w:id="${++n}"`);
  let k = 0;
  xml = xml.replace(/<w:bookmarkEnd w:id="\d+"/g, () => `<w:bookmarkEnd w:id="${++k}"`);
  zip.file('word/document.xml', xml);
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

function have(cmd) { return spawnSync('which', [cmd]).status === 0; }

function pdfPages(docxPath, workDir) {
  const profile = path.join(workDir, 'lo_profile');
  fs.mkdirSync(profile, { recursive: true });
  const env = { ...process.env, SAL_USE_VCLPLUGIN: 'svp' };
  const skillHelper = findSofficeHelper();
  if (skillHelper) execFileSync('python3', [skillHelper, '--headless', '--convert-to', 'pdf', '--outdir', workDir, docxPath], { stdio: 'ignore' });
  else execFileSync('soffice', [`-env:UserInstallation=file://${profile}`, '--headless', '--convert-to', 'pdf', '--outdir', workDir, docxPath], { env, stdio: 'ignore' });
  const pdf = path.join(workDir, path.basename(docxPath).replace(/\.docx$/, '.pdf'));
  const text = execFileSync('pdftotext', ['-layout', pdf, '-'], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
  return { pdf, pages: text.split('\f') };
}

function findSofficeHelper() {
  // The docx skill ships a helper that works around sandboxed sockets; use it when present.
  const base = path.join(os.homedir(), '.claude', 'skills', 'synced');
  try {
    for (const d of fs.readdirSync(base)) {
      const p = path.join(base, d, 'docx', 'scripts', 'office', 'soffice.py');
      if (fs.existsSync(p)) return p;
    }
  } catch (e) { /* no skills dir */ }
  return null;
}

const norm = (s) => s.replace(/\s+/g, ' ').trim();

function locateHeadings(toc, pages) {
  // Returns an array of 1-based page numbers, one per TOC entry.
  const result = [];
  // Body starts where the first entry appears as a standalone line (not inside the contents list).
  const firstText = toc[0].text;
  let bodyStart = pages.findIndex((p) => p.split('\n').some((l) => l.trim() === firstText));
  if (bodyStart < 0) bodyStart = 0;
  let cursor = bodyStart;
  for (const e of toc) {
    const target = norm(e.text);
    let found = -1;
    for (let p = cursor; p < pages.length; p++) {
      const lines = pages[p].split('\n').map((l) => l.trim());
      if (lines.includes(e.text) || norm(pages[p]).includes(target)) { found = p; break; }
    }
    if (found < 0) found = cursor;
    result.push(found + 1);
    cursor = found;
  }
  return result;
}

(async () => {
  fs.mkdirSync(WORK_BASE, { recursive: true });
  const work = fs.mkdtempSync(path.join(WORK_BASE, 'exec-plan-'));
  let { buffer, toc, stats } = await buildDocx(null);
  let pageCount = null;
  if (!NO_PDF && have('pdftotext') && (have('soffice') || findSofficeHelper())) {
    const pass1 = path.join(work, 'pass1.docx');
    fs.writeFileSync(pass1, buffer);
    try {
      const { pages, pdf } = pdfPages(pass1, work);
      const map = locateHeadings(toc, pages);
      ({ buffer } = await buildDocx(map));
      pageCount = pages.filter((p) => p.trim().length || true).length - 1; // pdftotext ends with a form feed
      fs.copyFileSync(pdf, path.join(work, 'pass1.pdf'));
      console.log(`Contents page numbers filled from a ${pageCount}-page PDF render.`);
    } catch (e) {
      console.warn('PDF pass skipped:', e.message);
    }
  } else {
    console.log('PDF tools not found: contents page numbers left for Word to fill (right-click the contents → Update Field).');
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, buffer);
  console.log(`Wrote ${path.relative(ROOT, OUT)} (${(buffer.length / 1024).toFixed(0)} KB): ${stats.headings} contents entries, ${stats.steps} build steps, ${stats.prompts} prompts from BUILD-GUIDE.md.`);
  console.log(`Work dir: ${work}`);
})().catch((e) => { console.error(e); process.exit(1); });
