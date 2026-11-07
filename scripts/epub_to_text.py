#!/usr/bin/env python3
"""Extract an EPUB's chapters to plain-text files, in reading (spine) order.

Usage: python3 -I scripts/epub_to_text.py BOOK.epub OUT_DIR

Writes OUT_DIR/NN-<name>.txt per spine item. Keep OUT_DIR outside the repo:
the source book is copyrighted and must not be committed.
"""
import os
import posixpath
import re
import sys
import zipfile
from html.parser import HTMLParser
from xml.etree import ElementTree

BLOCK_TAGS = {"p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "tr", "br",
              "table", "blockquote", "ul", "ol"}


class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.skip_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("style", "script"):
            self.skip_depth += 1
        if tag in BLOCK_TAGS:
            self.parts.append("\n")
        if tag in ("h1", "h2", "h3", "h4"):
            self.parts.append("#" * int(tag[1]) + " ")
        if tag == "li":
            self.parts.append("- ")
        if tag in ("td", "th"):
            self.parts.append(" | ")

    def handle_endtag(self, tag):
        if tag in ("style", "script"):
            self.skip_depth -= 1
        if tag in BLOCK_TAGS:
            self.parts.append("\n")

    def handle_data(self, data):
        if not self.skip_depth:
            self.parts.append(data)

    def text(self):
        text = "".join(self.parts)
        text = re.sub(r"[ \t\xa0]+", " ", text)
        return re.sub(r"\n\s*\n+", "\n\n", text).strip() + "\n"


def spine_paths(book):
    container = ElementTree.fromstring(book.read("META-INF/container.xml"))
    opf_path = container.find(".//{*}rootfile").get("full-path")
    opf = ElementTree.fromstring(book.read(opf_path))
    base = posixpath.dirname(opf_path)
    manifest = {item.get("id"): item.get("href") for item in opf.find("{*}manifest")}
    for itemref in opf.find("{*}spine"):
        href = manifest.get(itemref.get("idref"))
        if href:
            yield posixpath.normpath(posixpath.join(base, href))


def main(epub_path, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    with zipfile.ZipFile(epub_path) as book:
        for index, path in enumerate(spine_paths(book)):
            extractor = TextExtractor()
            extractor.feed(book.read(path).decode("utf-8", errors="replace"))
            name = posixpath.splitext(posixpath.basename(path))[0]
            out_path = os.path.join(out_dir, f"{index:02d}-{name}.txt")
            with open(out_path, "w", encoding="utf-8") as out:
                out.write(extractor.text())
            print(out_path)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
