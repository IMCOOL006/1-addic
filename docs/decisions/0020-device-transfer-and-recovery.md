# ADR 0020: Moving to a new phone, losing a phone, and recovering a plan

- **Decision:** C3 follow-up to D4 (ADR 0004) · **Status:** Accepted (owner asked for the optimal solution) · **Date:** 16 October 2026

## Context

A plan is bound to up to three devices by keys that cannot leave the phone (ADR 0004). People change phones, lose them, and sometimes lose every device at once. The owner asked for a way to transfer, possibly through a support ticket, and for the optimal handling of the edge cases.

## Decision

1. **Changing phones, both in hand.** Settings → Your devices and plan → "Move to a new phone": the old phone shows a short code or QR valid for ten minutes; the new phone enters it. The licence server moves the slot (old key revoked, new key registered) in one step, and the old phone hands its encrypted data (and, once sync exists, the sync key) directly to the new one. No support involved.
2. **One phone lost or broken, another still on the plan.** Remove it from "Your devices" on any remaining device. Its licence token is revoked at its next server check; its local data stays encrypted behind the PIN and auto-lock; the safety floor keeps working on it (ADR 0019).
3. **Every device lost.** The **store purchase is the recovery root**: install the app on the new phone and tap "Restore purchase"; the Google Play (or later Apple) account proves ownership of the purchase, the licence server matches the receipt to the plan, offers "This plan has no reachable device; move it here?", revokes the old keys and registers the new one. No account or password of ours is needed.
4. **Data after a total loss.** Without sync, the data is gone unless the person exported a backup; the monthly backup reminder and a one-tap export exist for this reason. With sync (Phase 6), the data is recoverable only with the **recovery code**: a 12-word phrase or printable QR generated at setup, shown once, kept by the person. Without it nobody can decrypt the synced data, including us. The app says this plainly when it offers the code.
5. **Support ticket, narrow.** Only for what the store cannot prove (store account lost, receipt mismatch, invite problems): a simple form with the store order id. Support can move a plan's slots after checking the receipt. Support can never recover data or see any health data. Every support action is written to the plan's log and shown to the person in "Your devices and plan".
6. **Limits against abuse.** At most three device changes per plan in any 30 days (support can lift it). A plan's invite codes do not change on transfer. When the plan is full, the app offers to remove a device before adding one.

## Consequences

- Step 5.4 builds 1, 2, 3 and 6 with the licence; Step 6.5 adds the recovery code and the data hand-over with sync.
- `docs/licence-server.md` documents the transfer flows and the support procedure.
- The recovery code must be designed with care in the usability study: a lost code is permanent data loss.
