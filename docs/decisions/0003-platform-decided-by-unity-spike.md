# ADR 0003: Platform decided by the Unity feasibility spike, pass marks doubled

- **Decision:** D3 (PLAN §15) · **Status:** Accepted; the result is recorded at Step 0.6 · **Date:** 16 October 2026

## Context

The owner prefers Unity if it can deliver. The plan's default was a PWA with React and TypeScript, then Capacitor. A one-week spike (Step 0.6) measures a throwaway Unity app against a performance budget (PLAN §10.8). The owner has Unity 6.6 installed and plans to use the Unity 7 alpha so that the official Unity MCP server can be used with Claude Code.

## Decision

- Run the spike. **Unity if it passes** (the owner's preference). **The web stack if it does not.** **The hybrid** (Unity shell with a WebView for text-heavy screens) only if it fails on text input or accessibility alone. The harbor gets built either way.
- **The numeric pass marks are doubled** from the §10.8 targets, per the owner's answer: cold start to a usable SOS screen ≤ 4.0 s on a mid-range Android and ≤ 3.0 s on a recent iPhone; download ≤ 120 MB; installed ≤ 240 MB; memory on Today ≤ 500 MB; battery ≤ 4% per 30 minutes idle. The yes/no checks are unchanged: screen readers read every SOS and onboarding control, text input with dictation works, zero network calls at startup, and Claude Code completes a build-test-change loop through MCP on the owner's computer.
- The original numbers remain the **targets** that Step 4.4 optimises toward and enforces in CI.
- **Unity versions:** the Unity 7 alpha may be used to exercise the official MCP workflow, but size and start-up are also measured on a shippable Unity 6 release, because alpha builds are not what would ship and can measure differently. The production version is fixed at Step 0.7 (the newest release the official MCP supports that is stable enough to ship).
- **If the spike fails**, `docs/unity-spike.md` ends with a report naming each failed check, by how much, and what would have to change, so the information is kept for later.

## Consequences

- With doubled marks, a Unity app may take up to 4 seconds to reach SOS from a cold start. That is a real cost in the craving moment; the mitigations are a native home-screen widget and shortcut (outside the engine) showing the crisis number and the Reasons Card, and Step 4.4 optimisation toward the 2-second target.
- If Unity wins, Step 0.7 rewrites the build guide for Unity, building and device testing move to the owner's computer, and testers use TestFlight and Play internal testing.
- The measured numbers are reported whatever the outcome.

## Addendum, 16 October 2026 (owner inputs I3 and C2)

- Unity and an Android phone are available; the iPhone version is deferred until needed. The spike and the Early Access build measure **Android only**; the iPhone pass marks apply when that version is built. No Mac, Apple account or TestFlight is needed now.
- C2 confirms the doubled pass marks "for now": the owner will test on a real device and then decide.
- The Early Access build (`docs/program/EARLY-ACCESS-AND-PROGRAM.md`) is built so that it doubles as the spike: if it passes, it is the foundation; if it fails, the measurements and the failure report are kept and the content moves to the web stack.
