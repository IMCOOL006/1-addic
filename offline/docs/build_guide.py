"""Build 1-addic-Guide.docx from 1-addic-Guide.md (the docs gate: exit 0 is green).

    python offline/docs/build_guide.py

Adapted from Event Money's build_guide.py, with the file names changed:

1. Renders the Markdown with the word-doc-generator skill (gen_docx.py, python-docx).
2. Restarts numbered steps at every Heading 1 / Heading 2, so each lesson counts from 1.
3. Turns a stand-alone page-break paragraph in front of a heading into "page break before" on that
   heading, so a nearly full page cannot push the break onto a page of its own.
4. Gives tables whose last column is "Status" a narrow status column and a wide description column.

Images: every ![caption](path) must exist. STRICT_IMAGES is True (V-07): a missing image fails the build
(False was the skeleton mode of U-36a, where a missing image was only a warning).
Libraries: python-docx and gen_docx.py. A missing one exits non-zero naming it; nothing is installed.
GEN_DOCX=<path> overrides where gen_docx.py is looked for.
Open the result in Word and press F9 (or right-click the contents -> Update Field) to refresh the contents.
"""
import os
import re
import subprocess
import sys
import tempfile
import zipfile
from datetime import datetime

STRICT_IMAGES = True

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "1-addic-Guide.md")
OUT = os.path.join(HERE, "1-addic-Guide.docx")
GEN = os.environ.get("GEN_DOCX") or os.path.join(
    os.path.expanduser("~"), ".claude-pro", "skills", "word-doc-generator", "gen_docx.py")

try:
    from docx import Document
    from docx.oxml.ns import qn
    from docx.shared import Inches
    from docx.text.paragraph import Paragraph
except ImportError:
    sys.exit("build_guide: python-docx is not installed (pip install python-docx); nothing was built")

IMAGE = re.compile(r"!\[[^\]]*\]\(([^)\s]+)\)")
# Markers for the builders (<!-- U-36b -->, <!-- clinicalReview: true -->) stay in the Markdown, out of the .docx.
COMMENT = re.compile(r"^[ \t]*<!--(?!\s*pagebreak\s*-->).*?-->[ \t]*\n?", re.M | re.S)


def check_images(text):
    missing = [p for p in IMAGE.findall(text) if not os.path.exists(os.path.join(HERE, p))]
    for p in missing:
        print(("ERROR" if STRICT_IMAGES else "warning") + ": image not found: " + p)
    return missing


def restart_numbering_per_section(doc):
    try:
        numbering = doc.part.numbering_part.element
        style = doc.styles["List Number"].element
        base_num_id = style.pPr.numPr.numId.val
    except (KeyError, AttributeError, NotImplementedError):
        return 0
    abstract_id = next(n for n in numbering.findall(qn("w:num")) if n.numId == base_num_id).abstractNumId.val

    current, lists = None, 0
    for p in doc.paragraphs:
        name = p.style.name if p.style is not None else ""
        if name in ("Heading 1", "Heading 2"):
            current = None  # the next numbered step starts a fresh list
            continue
        if name != "List Number":
            continue
        if current is None:
            num = numbering.add_num(abstract_id)
            num.add_lvlOverride(ilvl=0).add_startOverride(1)
            current, lists = num.numId, lists + 1
        num_pr = p._p.get_or_add_pPr().get_or_add_numPr()
        num_pr.get_or_add_ilvl().val = 0
        num_pr.get_or_add_numId().val = current
    return lists


def page_breaks_onto_headings(doc):
    moved = 0
    for p in list(doc.paragraphs):
        breaks = p._p.findall(".//" + qn("w:br"))
        if not breaks or p.text.strip() or any(b.get(qn("w:type")) != "page" for b in breaks):
            continue
        nxt = p._p.getnext()
        if nxt is None or nxt.tag != qn("w:p"):
            continue
        heading = Paragraph(nxt, p._parent)
        if heading.style is None or not heading.style.name.startswith("Heading"):
            continue
        heading.paragraph_format.page_break_before = True
        p._p.getparent().remove(p._p)
        moved += 1
    return moved


def size_status_tables(doc):
    widths = [Inches(1.75), Inches(4.0), Inches(0.85)]
    sized = 0
    for t in doc.tables:
        header = [c.text.strip() for c in t.rows[0].cells]
        if len(header) != 3 or header[-1] != "Status":
            continue
        t.autofit = False
        for col, w in zip(t.columns, widths):
            col.width = w
        for row in t.rows:
            for cell, w in zip(row.cells, widths):
                cell.width = w
        sized += 1
    return sized


def make_reproducible(path):
    """Fixed dates in the .docx and its zip entries, so a rebuild of an unchanged guide is byte-identical
    (the docs gate rebuilds it; a committed .docx then stays clean)."""
    with zipfile.ZipFile(path) as z:
        items = [(i.filename, z.read(i.filename)) for i in z.infolist()]
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in items:
            info = zipfile.ZipInfo(name, date_time=(2026, 11, 7, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            z.writestr(info, data)


def main():
    if not os.path.exists(SRC):
        sys.exit("build_guide: the guide source is missing: " + SRC)
    if not os.path.exists(GEN):
        sys.exit("build_guide: gen_docx.py (the word-doc-generator skill) not found at " + GEN
                 + "; set GEN_DOCX=<path>; nothing was built")
    with open(SRC, encoding="utf-8") as f:
        text = f.read()
    missing = check_images(text)
    if missing and STRICT_IMAGES:
        sys.exit("build_guide: %d image(s) missing; nothing was built" % len(missing))
    fd, tmp = tempfile.mkstemp(suffix=".md", prefix=".render-", dir=HERE)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as f:
            f.write(COMMENT.sub("", text))
        subprocess.run([sys.executable, GEN, tmp, OUT], check=True, cwd=HERE)
    finally:
        os.remove(tmp)
    doc = Document(OUT)
    n = restart_numbering_per_section(doc)
    b = page_breaks_onto_headings(doc)
    s = size_status_tables(doc)
    stamp = datetime(2026, 11, 7)
    doc.core_properties.created = stamp
    doc.core_properties.modified = stamp
    doc.core_properties.last_printed = stamp
    doc.save(OUT)
    make_reproducible(OUT)
    print("numbering restarted in %d sections; %d page breaks moved onto headings; %d status tables sized; "
          "%d image(s) missing%s -> %s" % (n, b, s, len(missing), " (skeleton mode)" if missing else "", OUT))
    return 0


if __name__ == "__main__":
    sys.exit(main())
