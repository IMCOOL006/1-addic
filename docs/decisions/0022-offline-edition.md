# ADR 0022: Offline single-file edition

- **Decision:** offline edition (BUILD-PLAN O1-O9) · **Status:** Accepted · **Date:** 7 November 2026

## Context

`docs/PLAN.md` chooses between a Unity app and a web PWA for the phone app (D3), decided by a spike that has not run. The owner wants something usable today, on any device, with no network. A single HTML file is the fastest honest path: no store, no install, no server, no account, and it runs in the browser every phone and computer already has. It follows the same product plan, ADRs 0001-0021 and the house rules in `docs/BUILD-GUIDE.md`, so the content, the engine rules and the tests carry over to whichever path D3 picks.

## Decision

Build `offline/1-addic.html`, assembled from `offline/src/*` by `node offline/build.mjs`.

- **One file, no network.** Every script, style and image is inlined. A Content-Security-Policy meta forbids every request (`default-src 'none'`, `connect-src 'none'`); no trackers, analytics or remote fonts. The browser suite fails on any request that is not `file:`, `data:` or `blob:`.
- **Data on the device.** IndexedDB holds the records; when it is blocked the store falls back to localStorage, then to memory. The top bar always says which: "Saved on this device", "Saved (fallback)" or "Not saved — export before closing". A refused save fails loudly and changes nothing. Export and import of a JSON backup are the way to move or restore data.
- **Optional PIN.** A PIN encrypts the records on the device; it is offered, never forced, and a forgotten PIN means erasing and importing a backup. SOS and the urgent-help numbers stay reachable while locked.
- **Original content.** Every word is written for the app; the source book gives ideas, never wording. Crisis passages carry `clinicalReview: true`; numbers and links carry `verify: true`.
- **The rules hold.** SOS works offline and is never gated or interrupted; nothing derived ever decreases; no streak resets, random rewards or points for claimed sober days.

The defaults of BUILD-PLAN section 9 are in force, since no answer came by 08:25 on 7 November 2026 (R-O-1 in the build program's owner outbox); a later answer still counts for units not yet built:

- **O1** File `offline/1-addic.html`, title "1-addic"; the discreet title is "Notebook" (D13 stays open).
- **O2** A PIN is offered in onboarding and recommended, never forced.
- **O3** India numbers, each marked "please verify", plus an international list; the owner verifies before anyone else uses the file.
- **O4** Read-aloud by the device's `speechSynthesis` only, with the text always on screen; no recorded audio.
- **O5** No Gujarati in this tag; `locale: 'en'` on the profile and every content item, so it can be added.
- **O6** A "Load sample data" button on the welcome screen and in Settings → Your data, marked as sample and erasable.
- **O7** A tier-2 screen is honestly working, a stub with one real action, or locked with one line naming what it will be; never a dead button.
- **O8** The `.docx` guide ships in the tag if its skeleton (U-36a) merges; the full tutorial comes with `offline-v1.1`.
- **O9** The build pushes `build/offline-v1`, the lane branches and the tag; `main` is never touched.

## Consequences

- Data lives in one browser on one device. A copy of the file in another folder, another browser or a private window starts empty; the backup is the only copy that survives a lost phone, and the docs say so plainly (`offline/README.md`).
- The urgent-help numbers are unverified until the owner checks them; the app labels them "please verify".
- D3 stays open. Nothing here is a native app; this edition is the reference the native path is tested against.
- Gates: `npm run build`, `npm test`, `npm run test:browser` and `python offline/docs/build_guide.py`, run together by `npm run check`.
