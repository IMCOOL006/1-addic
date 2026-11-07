#!/usr/bin/env python3
"""Quality checks for docs/1-addic-execution-plan.docx.

  python3 scripts/check_execution_plan_doc.py [docs/1-addic-execution-plan.docx] [--pdf file.pdf] [--briefs-only]

With --briefs-only (for the decisions document) only the briefs and the contents field are checked.

Checks that every Heading 1 and Heading 2 is followed directly by an "In short:" box, that every
Heading 3 is followed by an italic one-sentence brief, that every ```text prompt in
docs/BUILD-GUIDE.md appears word for word in a "Copy this prompt" box, that every step title from
the guide is a heading, and (with --pdf) reports the page count. Exit code 1 on any failure.
"""
import re
import subprocess
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
ROOT = Path(__file__).resolve().parent.parent


def para_text(p):
    return ''.join(t.text or '' for t in p.iter(f'{W}t')) + ''.join('\t' for _ in p.iter(f'{W}tab'))


def para_style(p):
    ps = p.find(f'{W}pPr/{W}pStyle')
    return ps.get(f'{W}val') if ps is not None else ''


def table_paras(tbl):
    return [p for p in tbl.iter(f'{W}p')]


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    docx_path = Path(args[0]) if args else ROOT / 'docs' / '1-addic-execution-plan.docx'
    pdf_path = Path(sys.argv[sys.argv.index('--pdf') + 1]) if '--pdf' in sys.argv else None
    with zipfile.ZipFile(docx_path) as z:
        xml = z.read('word/document.xml')
    body = ET.fromstring(xml).find(f'{W}body')
    elems = list(body)
    failures = []

    # 1. Briefs under headings.
    h12 = h3 = 0
    for i, el in enumerate(elems):
        if el.tag != f'{W}p':
            continue
        st = para_style(el)
        nxt = elems[i + 1] if i + 1 < len(elems) else None
        if st in ('Heading1', 'Heading2'):
            h12 += 1
            ok = nxt is not None and nxt.tag == f'{W}tbl' and table_paras(nxt) and ''.join(t.text or '' for t in table_paras(nxt)[0].iter(f'{W}t')).startswith('In short:')
            if not ok:
                failures.append(f'No "In short" brief under {st}: {para_text(el)!r}')
        elif st == 'Heading3':
            h3 += 1
            ok = nxt is not None and nxt.tag == f'{W}p' and para_style(nxt) == 'Brief3' and para_text(nxt).strip()
            if not ok:
                failures.append(f'No italic brief under Heading3: {para_text(el)!r}')
    print(f'Headings checked: {h12} H1/H2 with "In short" boxes, {h3} H3 with italic briefs.')

    briefs_only = '--briefs-only' in sys.argv

    # 2. Prompts word for word.
    guide = (ROOT / 'docs' / 'BUILD-GUIDE.md').read_text(encoding='utf-8').replace('\r\n', '\n')
    prompts = re.findall(r'^```text\n(.*?)\n```', guide, flags=re.S | re.M)
    boxes = []
    for el in elems:
        if el.tag != f'{W}tbl':
            continue
        paras = table_paras(el)
        if paras and para_text(paras[0]) == 'Copy this prompt':
            boxes.append('\n'.join(para_text(p) for p in paras[1:]))
    if briefs_only:
        # Every prompt box in the document must still match a prompt in the guide word for word.
        altered = [b for b in boxes if b not in prompts]
        for b in altered:
            failures.append('Prompt box does not match the guide: ' + b.splitlines()[0][:70] + '…')
        print(f'Prompts: {len(boxes)} boxes in the document, all matching the guide: {not altered}.')
    else:
        missing = [p for p in prompts if p not in boxes]
        for p in missing:
            failures.append('Prompt missing or altered: ' + p.splitlines()[0][:70] + '…')
        print(f'Prompts: {len(prompts)} in BUILD-GUIDE.md, {len(boxes)} boxes in the document, {len(prompts) - len(missing)} matched word for word.')

        # 3. Every step title is a heading.
        steps = re.findall(r'^### (Step [\d.]+(?: \([^)]*\))?: .*)$', guide, flags=re.M)
        headings = [para_text(el).strip() for el in elems if el.tag == f'{W}p' and para_style(el).startswith('Heading')]
        for s in steps:
            if s not in headings:
                failures.append(f'Step heading missing: {s!r}')
        print(f'Steps: {len(steps)} in the guide, {sum(1 for s in steps if s in headings)} found as headings.')

    # 4. TOC field present.
    has_toc = b'TOC \\o' in xml and b'fldCharType="begin"' in xml
    print('Table of contents field:', 'present' if has_toc else 'MISSING')
    if not has_toc:
        failures.append('No TOC field')

    if pdf_path:
        out = subprocess.run(['pdfinfo', str(pdf_path)], capture_output=True, text=True).stdout
        m = re.search(r'Pages:\s+(\d+)', out)
        print('PDF pages:', m.group(1) if m else '?')

    if failures:
        print('\nFAILURES:')
        for f in failures:
            print(' -', f)
        sys.exit(1)
    print('All checks passed.')


if __name__ == '__main__':
    main()
