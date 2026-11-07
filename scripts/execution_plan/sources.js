'use strict';
// Parsers for the source docs. Prompts are taken verbatim from docs/BUILD-GUIDE.md so the
// Word document can never drift from the guide.

const fs = require('fs');
const path = require('path');

function readDoc(root, rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n'); }

// ---- BUILD-GUIDE.md ----------------------------------------------------------
function parseBuildGuide(md) {
  const lines = md.split('\n');
  const guide = { phases: [], reusable: [], definitionOfDone: [], howToRun: [], houseRules: [] };
  let phase = null;
  let step = null;
  let section = 'top';
  let i = 0;

  const readFence = () => { // called when lines[i] is ```text; returns the block body
    const buf = [];
    i++;
    while (i < lines.length && !lines[i].startsWith('```')) { buf.push(lines[i]); i++; }
    i++; // closing fence
    return buf.join('\n');
  };

  while (i < lines.length) {
    const l = lines[i];
    let m;
    if ((m = l.match(/^## (.*)$/))) {
      const title = m[1].trim();
      if (/^Phase \d/.test(title)) {
        const pm = title.match(/^Phase (\d+): (.*?)(?: \((.*)\))?$/);
        phase = { num: pm[1], title: pm[2].trim(), estimate: pm[3] || '', steps: [], note: '', doneWhen: '' };
        guide.phases.push(phase);
        step = null; section = 'phase';
      } else if (/^Appendix A/.test(title)) { section = 'reusable'; step = null; }
      else if (/^Appendix B/.test(title)) { section = 'dod'; step = null; }
      else if (/^How to run a step/.test(title)) { section = 'howto'; }
      else if (/^Rules for every step/.test(title)) { section = 'rules'; }
      else section = 'other';
      i++; continue;
    }
    if ((m = l.match(/^### Step ([\d.]+)(?: \(([^)]*)\))?: (.*)$/))) {
      step = { id: m[1], qualifier: m[2] || '', title: m[3].trim(), goal: '', prompt: '', doneWhen: [] };
      phase.steps.push(step);
      i++; continue;
    }
    if (l.startsWith('```text')) {
      const body = readFence();
      if (section === 'reusable') {
        // The name is on the nearest preceding "**Name**" line.
        let j = i - 1; let name = '';
        while (j >= 0) { const nm = lines[j].match(/^\*\*(.+?)\*\*(.*)$/); if (nm) { name = nm[1]; break; } j--; }
        guide.reusable.push({ name, prompt: body });
      } else if (step) step.prompt = body;
      continue;
    }
    if (section === 'phase' && phase && !step && l.startsWith('> ')) { phase.note += (phase.note ? ' ' : '') + l.slice(2).trim(); i++; continue; }
    if ((m = l.match(/^\*\*Goal:\*\* (.*)$/)) && step) { step.goal = m[1].trim(); i++; continue; }
    if ((m = l.match(/^\*\*Done when:\*\*\s*(.*)$/)) && step) {
      if (m[1].trim()) step.doneWhen.push(m[1].trim());
      i++;
      while (i < lines.length && lines[i].startsWith('- ')) { step.doneWhen.push(lines[i].slice(2).trim()); i++; }
      continue;
    }
    if ((m = l.match(/^\*\*Phase (\d+) done when:\*\*\s*(.*)$/)) && phase) { phase.doneWhen = m[2].trim(); i++; continue; }
    if (section === 'howto' && /^\d+\. /.test(l)) { guide.howToRun.push(l.replace(/^\d+\. /, '').trim()); i++; continue; }
    if (section === 'howto' && l.startsWith('One step usually')) { guide.howToRunNote = l.trim(); i++; continue; }
    if (section === 'rules') {
      if ((m = l.match(/^(\d+)\. (.*)$/))) { guide.houseRules.push({ text: m[2].trim(), sub: [] }); i++; continue; }
      if ((m = l.match(/^   - (.*)$/)) && guide.houseRules.length) { guide.houseRules[guide.houseRules.length - 1].sub.push(m[1].trim()); i++; continue; }
    }
    if (section === 'dod' && (m = l.match(/^- \[ \] (.*)$/))) { guide.definitionOfDone.push(m[1].trim()); i++; continue; }
    if (section === 'reusable' && (m = l.match(/^\*\*Code review:\*\* (.*)$/))) { guide.codeReviewNote = m[1].trim(); i++; continue; }
    i++;
  }
  return guide;
}

// ---- exercises.md ----------------------------------------------------------
function parseExercises(md) {
  const rows = [];
  for (const l of md.split('\n')) {
    if (!l.startsWith('| ')) continue;
    const cells = l.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 7 || cells[0] === 'ID' || /^-+$/.test(cells[0])) continue;
    rows.push({ id: cells[0], exercise: cells[1], ch: cells[2], kind: cells[3], repeat: cells[4], fields: cells[5], feature: cells[6] });
  }
  return rows;
}

// ---- evidence-references.md ---------------------------------------------------
function parseReferences(md) {
  const rows = [];
  for (const l of md.split('\n')) {
    if (!l.startsWith('| R')) continue;
    const cells = l.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 5) continue;
    rows.push({ id: cells[0], claim: cells[1], source: cells[2], type: cells[3], usedBy: cells[4] });
  }
  return rows;
}

function loadSources(root) {
  const guideMd = readDoc(root, 'docs/BUILD-GUIDE.md');
  const guide = parseBuildGuide(guideMd);
  const exercises = parseExercises(readDoc(root, 'docs/book/exercises.md'));
  const references = parseReferences(readDoc(root, 'docs/evidence-references.md'));
  const allPrompts = [...guideMd.matchAll(/^```text\n([\s\S]*?)\n```/gm)].map((m) => m[1]);
  return { guide, exercises, references, allPrompts };
}

module.exports = { loadSources, parseBuildGuide, parseExercises, parseReferences };
