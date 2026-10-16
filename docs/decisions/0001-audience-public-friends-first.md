# ADR 0001: Audience — design for the public, friends first

- **Decision:** D1 (PLAN §15) · **Status:** Accepted · **Date:** 16 October 2026

## Context

The plan offered "personal use only" or "public release". The owner wants to use the app personally first, then give it to friends, and prepare the public version and everything around it once the core game is complete.

## Decision

Design for the public from day one. Roll out in three stages:

1. **Owner:** daily use from the end of Phase 1 (the 7-day dogfooding).
2. **Friends:** an invite-only build after Phase 2, in English and Gujarati (ADR 0010), distributed through the stores' test channels or the installable web preview, marked "not yet clinically reviewed".
3. **Public:** the public version and its related work (clinical review, legal review, store listings; Phase 6) are prepared once the core game is complete (end of Phase 4), after the native phase.

## Consequences

- Original content from day one (ADR 0002); nothing from the book's text is ever used.
- A new Step 2.12 prepares Gujarati and the friends build; PLAN §12 gets a rollout line and a "Friends release" milestone.
- Friends builds carry a conservative safety copy and a visible "not yet clinically reviewed" notice (ADR 0016).
- Store developer accounts are needed earlier than Phase 5 if friends get native test builds.
