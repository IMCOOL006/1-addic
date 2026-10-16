# ADR 0005: Reminders before the native phase — in-app prompts plus calendar export

- **Decision:** D5 (PLAN §15) · **Status:** Accepted (default) · **Date:** 16 October 2026

## Context

A web app cannot schedule local notifications reliably; web push needs a server.

## Decision

In-app prompts shown on open, plus .ics calendar export for Battle Plans and the Weekly Review, until native notifications exist in Phase 5. No push relay server.

## Consequences

- No server and no privacy surface for reminders in Phases 1 to 4 on the web path.
- If Unity wins the spike (ADR 0003), the app is native from the start and local notifications are available immediately; this decision becomes moot.
