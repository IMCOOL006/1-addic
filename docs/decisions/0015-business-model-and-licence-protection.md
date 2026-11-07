# ADR 0015: Business model — one-time purchase, free safety core, and licence protection

- **Decision:** D15 (PLAN §15) · **Status:** Accepted · **Date:** 16 October 2026

## Context

The owner wants a paid app and asked that nobody be able to crack or bypass the licence.

## Decision

- A **one-time purchase that includes 3-device sync**. The **safety core (urgent help, SOS, the quick log and the person's own data) is free for everyone**, which also serves as the trial. A subscription only if ongoing costs require it, and then with the safety floor (ADR 0019) and easy cancellation. No ads, no data sales. Purchase is invite-only (ADR 0004).
- **Licence protection**, as strong as an offline app allows: store receipts verified server-side against Apple and Google; licence tokens signed by the server with the public key pinned in the app; device-bound keys in the Secure Enclave or Android Keystore with App Attest or Play Integrity at purchase and renewal; periodic re-validation and revocation; invite codes single-use and hashed; builds hardened (IL2CPP or R8, obfuscation); rooted or jailbroken devices treated as a risk signal, never as a block on the safety floor.

## Consequences

- Honest limit: no app that works offline can be made impossible to crack. The aim is to make cracking harder than paying, to detect it, and to keep what a cracked copy gains small, which the free safety core already does. Monitoring and response are part of Step 5.4.
- Price, currency (INR first, ADR 0010) and refund stance are decided at Step 5.4.
