# ADR 0002: Original content built on the evidence-based techniques

- **Decision:** D2 (PLAN §15) · **Status:** Accepted · **Date:** 16 October 2026

## Context

The source workbook is copyrighted. The options were a private companion, original content, or a licence from the publisher.

## Decision

Fresh lessons and exercises built on the techniques nobody owns (CBT relapse prevention, motivational interviewing, mindfulness-based relapse prevention, behavioural activation), with original characters and stories, citing the research. Chapter references are kept as metadata only.

## Consequences

- The book's text never enters the project; the app's name never uses the book's title (ADR 0013).
- Every lesson cites at least one reference from `docs/evidence-references.md` (PLAN §5.12), validated in CI.
- Writing effort is real, and the clinical advisor reviews the content before any public release (ADR 0016).
