'use strict';
// Shared document assembly for the generated Word documents: cover, contents field,
// two-pass page numbers (via a LibreOffice render when available) and the XML post-processing.

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync, spawnSync } = require('child_process');

const { Builder, styles, numbering, C, PAGE, TINY, docx } = require('./lib');
const { Document, Packer, Paragraph, TextRun, Header, Footer, PageNumber, AlignmentType, BorderStyle, Tab, InternalHyperlink } = docx;
const { render } = require('./render_md');

function contentsPages(toc, pageMap) {
  const paras = [new Paragraph({ style: 'ContentsTitle', children: [new TextRun('Contents')] })];
  toc.forEach((e, idx) => {
    const page = pageMap && pageMap[idx] ? String(pageMap[idx]) : '';
    paras.push(new Paragraph({
      style: e.level === 1 ? 'TOC1' : 'TOC2',
      keepLines: true,
      children: [new InternalHyperlink({ anchor: e.anchor, children: [new TextRun({ text: e.text })] }), new TextRun({ children: [new Tab(), page] })],
    }));
  });
  return paras;
}

async function assemble(opts, pageMap) {
  const b = new Builder();
  const md = fs.readFileSync(opts.contentPath, 'utf8');
  render(md, b, opts.hooks || {});
  const header = new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.tealMid, space: 4 } }, spacing: { after: 0 }, children: [new TextRun({ text: opts.title, size: TINY, color: C.grey })] })] });
  const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [new TextRun({ children: ['Page ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES], size: TINY, color: C.grey })] })] });
  const empty = () => new Paragraph({ children: [] });
  const doc = new Document({
    creator: '1-addic project', title: opts.title, description: opts.subtitle,
    features: { updateFields: true },
    styles, numbering,
    sections: [{
      properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: { top: PAGE.top, bottom: PAGE.bottom, left: PAGE.left, right: PAGE.right, header: 600, footer: 560 } }, titlePage: true },
      headers: { default: header, first: new Header({ children: [empty()] }) },
      footers: { default: footer, first: new Footer({ children: [empty()] }) },
      children: [...opts.cover(), ...contentsPages(b.toc, pageMap), ...b.children],
    }],
  });
  const buf = await Packer.toBuffer(doc);
  return { buffer: await postProcess(buf), toc: b.toc };
}

// Turn the contents paragraphs into a real Word TOC field (so "Update field" regenerates them),
// fix paragraph-border order, and give bookmarks unique ids.
async function postProcess(buffer) {
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
    xml = xml.slice(0, last.index) + lastNew + xml.slice(last.index + last[0].length);
    xml = xml.slice(0, first.index) + (first === last ? firstNew.replace(/<\/w:p>$/, end + '</w:p>') : firstNew) + xml.slice(first.index + first[0].length);
  }
  const order = ['w:top', 'w:left', 'w:bottom', 'w:right', 'w:between', 'w:bar'];
  xml = xml.replace(/<w:pBdr>([\s\S]*?)<\/w:pBdr>/g, (m, inner) => {
    const parts = inner.match(/<w:[a-z]+\b[^>]*\/>/g) || [];
    parts.sort((a, c) => order.indexOf(a.match(/<(w:[a-z]+)/)[1]) - order.indexOf(c.match(/<(w:[a-z]+)/)[1]));
    return '<w:pBdr>' + parts.join('') + '</w:pBdr>';
  });
  let n = 0;
  xml = xml.replace(/<w:bookmarkStart ([^>]*?)w:id="\d+"/g, (m, pre) => `<w:bookmarkStart ${pre}w:id="${++n}"`);
  let k = 0;
  xml = xml.replace(/<w:bookmarkEnd w:id="\d+"/g, () => `<w:bookmarkEnd w:id="${++k}"`);
  zip.file('word/document.xml', xml);
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

function have(cmd) { return spawnSync('which', [cmd]).status === 0; }

function findSofficeHelper() {
  const base = path.join(os.homedir(), '.claude', 'skills', 'synced');
  try {
    for (const d of fs.readdirSync(base)) {
      const p = path.join(base, d, 'docx', 'scripts', 'office', 'soffice.py');
      if (fs.existsSync(p)) return p;
    }
  } catch (e) { /* no skills dir */ }
  return null;
}

function pdfPages(docxPath, workDir) {
  const profile = path.join(workDir, 'lo_profile');
  fs.mkdirSync(profile, { recursive: true });
  const helper = findSofficeHelper();
  if (helper) execFileSync('python3', [helper, '--headless', '--convert-to', 'pdf', '--outdir', workDir, docxPath], { stdio: 'ignore' });
  else execFileSync('soffice', [`-env:UserInstallation=file://${profile}`, '--headless', '--convert-to', 'pdf', '--outdir', workDir, docxPath], { env: { ...process.env, SAL_USE_VCLPLUGIN: 'svp' }, stdio: 'ignore' });
  const pdf = path.join(workDir, path.basename(docxPath).replace(/\.docx$/, '.pdf'));
  const text = execFileSync('pdftotext', ['-layout', pdf, '-'], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
  return { pdf, pages: text.split('\f') };
}

const norm = (s) => s.replace(/\s+/g, ' ').trim();

function locateHeadings(toc, pages) {
  const result = [];
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

// Build, fill the contents page numbers from a PDF render when possible, and write the file.
async function buildAndWrite(opts) {
  const workBase = opts.workBase || os.tmpdir();
  fs.mkdirSync(workBase, { recursive: true });
  const work = fs.mkdtempSync(path.join(workBase, 'docbuild-'));
  let { buffer, toc } = await assemble(opts, null);
  let pageCount = null;
  if (!opts.noPdf && have('pdftotext') && (have('soffice') || findSofficeHelper())) {
    const pass1 = path.join(work, 'pass1.docx');
    fs.writeFileSync(pass1, buffer);
    try {
      const { pages } = pdfPages(pass1, work);
      const map = locateHeadings(toc, pages);
      ({ buffer } = await assemble(opts, map));
      pageCount = pages.length - 1;
      console.log(`Contents page numbers filled from a ${pageCount}-page PDF render.`);
    } catch (e) {
      console.warn('PDF pass skipped:', e.message);
    }
  } else {
    console.log('PDF tools not found: contents page numbers left for Word to fill (right-click the contents → Update Field).');
  }
  fs.mkdirSync(path.dirname(opts.out), { recursive: true });
  fs.writeFileSync(opts.out, buffer);
  return { toc, pageCount, size: buffer.length, work };
}

function parseArgs(argv, defaults) {
  const args = argv.slice(2);
  const get = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined);
  return { out: get('--out') || defaults.out, noPdf: args.includes('--no-pdf'), workBase: get('--work') };
}

module.exports = { buildAndWrite, parseArgs, assemble };
