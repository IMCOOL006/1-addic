# ADR 0004: Device-bound plan, three devices, end-to-end sync, and invite-only purchase

- **Decision:** D4 (PLAN §15) · **Status:** Accepted · **Date:** 16 October 2026

## Context

The owner asked for an app that opens only on a registered device, with sync to up to two more devices on the same plan, and added a growth mechanism: a plan can be bought only with an invite from someone already using it, and each new paying plan gets up to five invites, to drive real people and organic growth.

## Decision

- A **plan with device-bound keys and no profile** (no email or password), as designed in PLAN §9.1. **Three devices per plan** (confirmed). End-to-end encrypted **sync** built in Phase 6 (Step 6.5); the licence in Phase 5 (Step 5.4).
- **Invite-only purchase.** A plan can be bought only with a valid invite code. Each new paid plan receives **five single-use invite codes**. The owner's plan seeds the invite tree and can mint more codes.
- **Privacy of invites.** The licence server stores only a hash of each code, whether it has been used, and a per-plan count. It never stores who invited whom, and an inviter never learns whether or by whom a code was used. Nothing links two people's plans.
- A new phone is added by removing an old or lost device in Settings → Your devices and plan. A removed device keeps its local data and the safety floor (ADR 0019).

## Consequences

- The **safety core stays free for everyone without an invite** (ADR 0015), so invite gating never stands between a person and crisis help.
- Apple's App Review needs working demo invite codes to test gated purchases; `docs/licence-server.md` (Step 5.4) includes them.
- Growth is deliberately slow and personal; the risk is accepted (PLAN §13).
- Step 5.4 adds invite codes; PLAN §9.1 documents the design.
