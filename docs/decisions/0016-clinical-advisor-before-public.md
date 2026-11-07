# ADR 0016: Clinical advisor — before going public

- **Decision:** D16 (PLAN §15) · **Status:** Accepted · **Date:** 16 October 2026

## Decision

The owner will identify a licensed addiction professional before the public release (Phase 6). The advisor reviews all lessons, the crisis and lapse copy, the medical-safety screens and the evidence list, and signs off before anything goes public.

## Consequences

- The owner's and friends' builds are used **without** a clinical review: they carry a visible "not yet clinically reviewed" notice, safety copy is written conservatively, and every sensitive passage keeps its `clinicalReview: true` flag so Step 6.1 can collect them.
- The plan still recommends a light early look at modules M1 and M2 and the lapse flow if an opportunity arises before Phase 6.
- The advisor should be India-licensed and comfortable reviewing Gujarati copy (ADR 0010).
