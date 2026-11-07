# ADR 0010: Region and language — India (Gujarat) first; English, then friendly Gujarati

- **Decision:** D10 (PLAN §15) · **Status:** Accepted · **Date:** 16 October 2026

## Context

The region drives crisis lines, resources, the store listing, pricing and the cultural setting of the content. The owner is in Gujarat, India.

## Decision

- **First region:** India, with Gujarat as the first-served state. English is the default language. **Gujarati** is added before the friends release, written as **friendly, everyday Gujarati the way locals speak, not formal or literary Gujarati**. More languages when needed.

## Consequences

- **Resources (Step 1.3):** a `content/resources/in.yaml` with candidates to verify, such as the 112 emergency number, the Tele-MANAS mental-health helpline, the Kiran helpline, and Gujarat's government and NGO de-addiction ("Nasha Mukti") centres. Every number is marked "needs verification" until the owner checks it.
- **Content:** the original cast is rooted in Gujarat and India. Content is aware of Gujarat's alcohol prohibition, where drinking is illegal and stigma is high, and of family-centred living, which makes the "someone at home" threat model even more important. The app never judges or moralises.
- **Localisation:** every piece of UI copy and content carries a locale from Step 0.4; Gujarati script rendering (font, line breaking) and the availability of Gujarati text-to-speech on each platform are checked; where the phone has no Gujarati voice, the practices show their text on screen and recorded voice is considered later. New Step 2.12 does this work.
- **Market:** India is overwhelmingly Android, so the Android pass marks in ADR 0003 matter most; pricing in INR.
- **Law:** India's Digital Personal Data Protection Act 2023 and its rules go on the counsel checklist (PLAN §8); the usability study recruits Gujarati speakers; the clinical advisor should be India-licensed.

## Addendum, 16 October 2026 (owner input I6)

The owner will verify the crisis numbers "before release". The planner reads this as before the public release at the latest, and will verify them before the friends build as well unless the owner says otherwise.
