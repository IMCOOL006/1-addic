# ADR 0019: The safety floor stays open without a valid licence

- **Decision:** D19 (PLAN §15) · **Status:** Accepted (default) · **Date:** 16 October 2026

## Decision

When the licence cannot be verified, has lapsed, or the device was removed from a plan, **urgent help, SOS, the person's own artifacts and logs, export and delete keep working**. Only new lesson content and sync pause.

## Consequences

- House rule 2 ("SOS is never gated") holds under the paid model; the licence check, root detection and invite gating must never block the floor.
- Step 5.4 tests the offline, lapsed and removed-device cases end to end.
