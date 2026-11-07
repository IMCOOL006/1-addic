'use strict';
// Document builders for the 1-addic execution plan.
// Thin helpers over docx-js (https://docx.js.org) so the content files read like prose.

const docx = require('docx');
const {
  Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, AlignmentType,
  HeadingLevel, BorderStyle, PageBreak, Tab, Bookmark, InternalHyperlink, LevelFormat,
  TableLayoutType, VerticalAlign, TabStopType, LeaderType,
} = docx;

// ---- Design tokens -------------------------------------------------------
const C = {
  teal: '0F6E6E', tealDark: '0B4F4F', tealLight: 'E6F3F2', tealMid: 'CFE6E4',
  text: '1F1F1F', grey: '595959', greyLight: 'F2F3F4', greyBorder: 'BFC5C5',
  red: 'B5473F', redLight: 'FBEAE8', amber: 'C98A12', amberLight: 'FFF3D6',
  promptBg: 'F4F6F7', promptBorder: 'C9D3D3', zebra: 'F4F9F9', white: 'FFFFFF',
  codeBg: 'EEF1F1',
};
const PAGE = { width: 11906, height: 16838, top: 1250, bottom: 1150, left: 1250, right: 1250 };
const TEXT_W = PAGE.width - PAGE.left - PAGE.right; // 9306 DXA (~16.4 cm)
const FONT = 'Calibri';
const MONO = 'Consolas';
const SYMBOL = 'Segoe UI Symbol';
const BODY = 22; // 11 pt in half-points
const SMALL = 19; // 9.5 pt
const TINY = 18; // 9 pt

// ---- Inline markup: **bold**, *italic*, `code` ----------------------------
function runs(text, base = {}) {
  if (Array.isArray(text)) return text; // already runs
  const out = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(new TextRun({ ...base, text: text.slice(last, m.index) }));
    const tok = m[0];
    if (tok.startsWith('**')) out.push(new TextRun({ ...base, text: tok.slice(2, -2), bold: true }));
    else if (tok.startsWith('`')) out.push(new TextRun({ ...base, text: tok.slice(1, -1), font: MONO, size: (base.size || BODY) - 2, shading: { type: ShadingType.CLEAR, fill: C.codeBg, color: 'auto' } }));
    else out.push(new TextRun({ ...base, text: tok.slice(1, -1), italics: true }));
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(new TextRun({ ...base, text: text.slice(last) }));
  return out;
}

const noBorder = { style: BorderStyle.NONE, size: 0, color: C.white };
const NO_BORDERS = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder };
function line(color, size = 4) { return { style: BorderStyle.SINGLE, size, color }; }

function cellPara(text, opts = {}) {
  return new Paragraph({
    style: opts.style || 'CellText',
    keepNext: opts.keepNext,
    alignment: opts.align,
    children: runs(text, { size: opts.size || SMALL, bold: opts.bold, color: opts.color, italics: opts.italics }),
  });
}

// ---- Builder ---------------------------------------------------------------
class Builder {
  constructor() {
    this.children = [];
    this.toc = [];
    this.bookmarkN = 0;
    this.numInstance = 0;
    this.figureN = 0;
    this.tableN = 0;
  }

  add(el) { this.children.push(el); return el; }

  // Headings. H1 and H2 go into the table of contents and get bookmarks.
  heading(level, text) {
    const id = `_Toc${++this.bookmarkN}`;
    if (level <= 2) this.toc.push({ level, text, anchor: id });
    const hl = level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3;
    const extra = level === 1 ? { border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.teal, space: 6 } } } : {};
    return this.add(new Paragraph({ heading: hl, keepNext: true, keepLines: true, ...extra, children: [new Bookmark({ id, children: [new TextRun(text)] })] }));
  }
  h1(text) { return this.heading(1, text); }
  h2(text) { return this.heading(2, text); }
  h3(text) { return this.heading(3, text); }

  // One-sentence italic brief under a Heading 3.
  brief3(text) { return this.add(new Paragraph({ style: 'Brief3', keepNext: true, children: runs(text, { italics: true, color: C.grey }) })); }

  // Shaded "In short:" box under every Heading 1 and 2.
  brief(text) { return this.callout('inshort', text); }

  p(text, opts = {}) {
    return this.add(new Paragraph({ style: opts.style, keepNext: opts.keepNext, alignment: opts.align, spacing: opts.spacing, children: runs(text, opts.run || {}) }));
  }
  label(text) { return this.add(new Paragraph({ style: 'Label', keepNext: true, children: runs(text) })); }
  note(text) { return this.add(new Paragraph({ style: 'Note', children: runs(text, { size: TINY, color: C.grey, italics: true }) })); }
  caption(text) { return this.add(new Paragraph({ style: 'Caption', children: runs(text, { size: TINY, color: C.grey, italics: true }) })); }

  bullets(items, opts = {}) {
    items.forEach((it, i) => {
      const level = (typeof it === 'object' && it.level) || 0;
      const text = typeof it === 'object' ? it.text : it;
      this.add(new Paragraph({ numbering: { reference: 'bullets', level }, keepNext: opts.keepNext || (opts.keepTogether && i < items.length - 1), children: runs(text) }));
    });
  }
  numbered(items, opts = {}) {
    const instance = this.numberedStart();
    items.forEach((it, i) => this.numberedItem(instance, typeof it === 'object' ? it.text : it, opts.keepTogether && i < items.length - 1));
  }
  numberedStart() { return ++this.numInstance; }
  numberedItem(instance, text, keepNext) {
    return this.add(new Paragraph({ numbering: { reference: 'numbers', level: 0, instance }, keepNext, children: runs(text) }));
  }
  checks(items) {
    items.forEach((text) => this.add(new Paragraph({ style: 'Checkbox', children: [new TextRun({ text: '☐', font: SYMBOL }), new TextRun({ children: [new Tab()] }), ...runs(text)] })));
  }
  pageBreak() { return this.add(new Paragraph({ children: [new PageBreak()] })); }
  spacer(after = 120) { return this.add(new Paragraph({ spacing: { before: 0, after }, children: [] })); }

  // Callout box: kind = inshort | safety | decision | tip | moment
  callout(kind, body, opts = {}) {
    const spec = {
      inshort: { lead: 'In short: ', fill: C.tealLight, bar: C.teal },
      safety: { lead: 'Safety note: ', fill: C.redLight, bar: C.red },
      decision: { lead: 'Decision needed: ', fill: C.amberLight, bar: C.amber },
      tip: { lead: 'Tip: ', fill: C.greyLight, bar: '8A9095' },
      moment: { lead: 'A moment in the app: ', fill: C.greyLight, bar: '8A9095' },
    }[kind];
    const paras = Array.isArray(body) ? body : [body];
    const children = paras.map((t, i) => new Paragraph({
      style: 'CalloutText',
      keepNext: opts.keepNext || i < paras.length - 1,
      keepLines: true,
      children: [...(i === 0 ? [new TextRun({ text: opts.lead || spec.lead, bold: true, color: kind === 'safety' ? C.red : kind === 'decision' ? '8A5A00' : C.tealDark })] : []), ...runs(t)],
    }));
    const cell = new TableCell({
      width: { size: TEXT_W, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: spec.fill, color: 'auto' },
      borders: { top: noBorder, bottom: noBorder, right: noBorder, left: { style: BorderStyle.SINGLE, size: 28, color: spec.bar } },
      margins: { top: 90, bottom: 90, left: 160, right: 160 },
      children,
    });
    const tbl = new Table({
      width: { size: TEXT_W, type: WidthType.DXA }, columnWidths: [TEXT_W], layout: TableLayoutType.FIXED, borders: NO_BORDERS,
      rows: [new TableRow({ cantSplit: true, children: [cell] })],
    });
    this.add(tbl);
    this.spacer(opts.after === undefined ? 100 : opts.after);
    return tbl;
  }

  // Monospace prompt box labelled "Copy this prompt". Lines are kept exactly.
  promptBox(text, opts = {}) {
    const lines = text.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n');
    const children = [
      new Paragraph({ style: 'PromptLabel', keepNext: true, children: [new TextRun({ text: opts.label || 'Copy this prompt', bold: true, color: C.teal, size: TINY })] }),
      ...lines.map((l, i) => new Paragraph({ style: 'Prompt', keepNext: i < Math.min(3, lines.length - 1), keepLines: true, children: [new TextRun({ text: l, font: MONO, size: SMALL })] })),
    ];
    const cell = new TableCell({
      width: { size: TEXT_W, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: C.promptBg, color: 'auto' },
      borders: { top: line(C.promptBorder), bottom: line(C.promptBorder), left: line(C.promptBorder), right: line(C.promptBorder) },
      margins: { top: 80, bottom: 100, left: 140, right: 120 },
      children,
    });
    const tbl = new Table({
      width: { size: TEXT_W, type: WidthType.DXA }, columnWidths: [TEXT_W], layout: TableLayoutType.FIXED, borders: NO_BORDERS,
      // The row may split across pages (long prompts), so a prompt always starts on the same page as its step.
      rows: [new TableRow({ cantSplit: !!opts.cantSplit, children: [cell] })],
    });
    this.add(tbl);
    this.spacer(120);
    return tbl;
  }

  // Data table. columns: [{ header, w }] where w are relative weights. rows: arrays of cell values.
  // A cell value is a string (inline markup), an array of strings (paragraphs), or { list: [...] }.
  table(spec) {
    const { columns, rows, size = SMALL, zebra = true, caption } = spec;
    const total = columns.reduce((a, c) => a + c.w, 0);
    const widths = columns.map((c) => Math.round((c.w / total) * TEXT_W));
    widths[widths.length - 1] += TEXT_W - widths.reduce((a, b) => a + b, 0);
    const mkCell = (value, i, isHeader, fill) => {
      let paras;
      const base = { size, bold: isHeader, color: isHeader ? C.white : undefined };
      if (value && typeof value === 'object' && !Array.isArray(value) && value.list) {
        paras = value.list.map((t) => new Paragraph({ style: 'CellText', numbering: { reference: 'cellbullets', level: 0 }, children: runs(t, base) }));
        if (value.before) paras.unshift(new Paragraph({ style: 'CellText', children: runs(value.before, base) }));
      } else {
        const vals = Array.isArray(value) ? value : [value == null ? '' : String(value)];
        paras = vals.map((t) => new Paragraph({ style: 'CellText', alignment: columns[i].align, children: runs(t, base) }));
      }
      return new TableCell({
        width: { size: widths[i], type: WidthType.DXA },
        shading: fill ? { type: ShadingType.CLEAR, fill, color: 'auto' } : undefined,
        verticalAlign: VerticalAlign.TOP,
        margins: { top: 50, bottom: 50, left: 90, right: 90 },
        children: paras,
      });
    };
    const header = new TableRow({ tableHeader: true, cantSplit: true, children: columns.map((c, i) => mkCell(c.header, i, true, C.teal)) });
    const body = rows.map((r, ri) => new TableRow({ cantSplit: true, children: r.map((v, i) => mkCell(v, i, false, zebra && ri % 2 === 1 ? C.zebra : undefined)) }));
    const tbl = new Table({
      width: { size: TEXT_W, type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED,
      borders: { top: line(C.greyBorder, 6), bottom: line(C.greyBorder, 6), left: noBorder, right: noBorder, insideHorizontal: line('DADFDF', 4), insideVertical: noBorder },
      rows: [header, ...body],
    });
    if (caption) this.add(new Paragraph({ style: 'Caption', keepNext: true, children: runs(`Table ${++this.tableN}. ${caption}`, { size: TINY, color: C.grey, italics: true }) }));
    this.add(tbl);
    this.spacer(140);
    return tbl;
  }

  // Two side-by-side "phone screens" drawn with paragraphs (used for the wireframe figure).
  phoneFigure(screens, captionText) {
    const gap = 400;
    const w = Math.floor((TEXT_W - gap) / 2);
    const widths = [w, gap, TEXT_W - w - gap];
    const screenCell = (s, i) => {
      const kids = [];
      kids.push(new Paragraph({ style: 'CellText', alignment: AlignmentType.CENTER, shading: { type: ShadingType.CLEAR, fill: C.teal, color: 'auto' }, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: s.title, bold: true, color: C.white, size: SMALL })] }));
      for (const item of s.items) {
        if (item.button) {
          kids.push(new Paragraph({ style: 'CellText', alignment: item.align === 'right' ? AlignmentType.CENTER : AlignmentType.LEFT, spacing: { before: item.sos ? 160 : 40, after: 40 }, indent: item.align === 'right' ? { left: 3100, right: 60 } : { left: 60, right: 60 }, border: { top: line(C.teal, 6), bottom: line(C.teal, 6), left: line(C.teal, 6), right: line(C.teal, 6) }, shading: { type: ShadingType.CLEAR, fill: item.sos ? C.teal : C.tealLight, color: 'auto' }, children: [new TextRun({ text: item.button, size: SMALL, bold: true, color: item.sos ? C.white : C.tealDark })] }));
        } else {
          kids.push(new Paragraph({ style: 'CellText', spacing: { before: 20, after: 20 }, indent: { left: item.indent ? 300 : 60 }, children: runs(item.text, { size: SMALL, color: item.muted ? C.grey : undefined }) }));
        }
      }
      return new TableCell({ width: { size: widths[i], type: WidthType.DXA }, borders: { top: line(C.greyBorder, 8), bottom: line(C.greyBorder, 8), left: line(C.greyBorder, 8), right: line(C.greyBorder, 8) }, margins: { top: 80, bottom: 120, left: 100, right: 100 }, children: kids });
    };
    const spacerCell = new TableCell({ width: { size: gap, type: WidthType.DXA }, borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [new Paragraph('')] });
    const tbl = new Table({
      width: { size: TEXT_W, type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED, borders: NO_BORDERS,
      rows: [new TableRow({ cantSplit: true, children: [screenCell(screens[0], 0), spacerCell, screenCell(screens[1], 2)] })],
    });
    this.add(tbl);
    this.caption(`Figure ${++this.figureN}. ${captionText}`);
    return tbl;
  }
}

// ---- Styles and numbering shared by the document ---------------------------
function tocTab() { return [{ type: TabStopType.RIGHT, position: TEXT_W, leader: LeaderType.DOT }]; }

const styles = {
  default: { document: { run: { font: FONT, size: BODY, color: C.text }, paragraph: { spacing: { after: 100, line: 264 } } } },
  paragraphStyles: [
    { id: 'Title', name: 'Title', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 76, bold: true, color: C.teal }, paragraph: { spacing: { before: 0, after: 160 } } },
    { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 40, bold: true, color: C.teal }, paragraph: { spacing: { before: 0, after: 240, line: 240 }, keepNext: true, keepLines: true, pageBreakBefore: true, outlineLevel: 0 } },
    { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 30, bold: true, color: C.teal }, paragraph: { spacing: { before: 320, after: 110, line: 240 }, keepNext: true, keepLines: true, outlineLevel: 1 } },
    { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 25, bold: true, color: C.tealDark }, paragraph: { spacing: { before: 280, after: 60, line: 240 }, keepNext: true, keepLines: true, outlineLevel: 2 } },
    { id: 'ContentsTitle', name: 'Contents Title', basedOn: 'Normal', next: 'Normal', run: { font: FONT, size: 40, bold: true, color: C.teal }, paragraph: { spacing: { before: 0, after: 240 }, pageBreakBefore: true } },
    { id: 'TOC1', name: 'toc 1', basedOn: 'Normal', next: 'Normal', run: { font: FONT, size: BODY, bold: true, color: C.tealDark }, paragraph: { spacing: { before: 140, after: 30, line: 240 }, tabStops: tocTab() } },
    { id: 'TOC2', name: 'toc 2', basedOn: 'Normal', next: 'Normal', run: { font: FONT, size: 20 }, paragraph: { indent: { left: 400 }, spacing: { before: 0, after: 20, line: 240 }, tabStops: tocTab() } },
    { id: 'Brief3', name: 'Brief 3', basedOn: 'Normal', next: 'Normal', run: { italics: true, color: C.grey }, paragraph: { spacing: { after: 100 }, keepNext: true } },
    { id: 'Label', name: 'Label', basedOn: 'Normal', next: 'Normal', run: { bold: true, color: C.tealDark, size: BODY }, paragraph: { spacing: { before: 140, after: 40 }, keepNext: true } },
    { id: 'Note', name: 'Note', basedOn: 'Normal', next: 'Normal', run: { size: TINY, italics: true, color: C.grey }, paragraph: { spacing: { after: 100 } } },
    { id: 'Caption', name: 'Caption', basedOn: 'Normal', next: 'Normal', run: { size: TINY, italics: true, color: C.grey }, paragraph: { spacing: { before: 60, after: 160 } } },
    { id: 'CellText', name: 'Cell Text', basedOn: 'Normal', next: 'Normal', run: { size: SMALL }, paragraph: { spacing: { before: 0, after: 30, line: 240 } } },
    { id: 'CalloutText', name: 'Callout Text', basedOn: 'Normal', next: 'Normal', run: { size: 21 }, paragraph: { spacing: { before: 0, after: 60, line: 264 } } },
    { id: 'Prompt', name: 'Prompt', basedOn: 'Normal', next: 'Normal', run: { font: MONO, size: SMALL }, paragraph: { spacing: { before: 0, after: 0, line: 240 } } },
    { id: 'PromptLabel', name: 'Prompt Label', basedOn: 'Normal', next: 'Normal', run: { bold: true, color: C.teal, size: TINY }, paragraph: { spacing: { before: 0, after: 80 }, keepNext: true } },
    { id: 'Checkbox', name: 'Checkbox', basedOn: 'Normal', next: 'Normal', run: { size: BODY }, paragraph: { indent: { left: 440, hanging: 440 }, tabStops: [{ type: TabStopType.LEFT, position: 440 }], spacing: { after: 40, line: 264 } } },
    { id: 'CoverSub', name: 'Cover Subtitle', basedOn: 'Normal', next: 'Normal', run: { size: 32, color: C.tealDark }, paragraph: { spacing: { after: 120 } } },
    { id: 'CoverMeta', name: 'Cover Meta', basedOn: 'Normal', next: 'Normal', run: { size: BODY, color: C.grey }, paragraph: { spacing: { after: 60 } } },
  ],
};

const numbering = {
  config: [
    { reference: 'bullets', levels: [
      { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 280 } }, run: { color: C.teal } } },
      { level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1000, hanging: 280 } }, run: { color: C.teal } } },
    ] },
    { reference: 'cellbullets', levels: [
      { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 220, hanging: 200 } }, run: { color: C.teal } } },
    ] },
    { reference: 'numbers', levels: [
      { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 360 } } } },
    ] },
  ],
};

module.exports = { Builder, runs, styles, numbering, C, PAGE, TEXT_W, FONT, MONO, SYMBOL, BODY, SMALL, TINY, docx };
