# Clinical review pack · 1-addic offline edition v3.1 (903016cc) · written 2026-11-09 (refreshed from the v1.1 pack of 2026-11-08)

1-addic is a private, offline, phone-first notebook of recovery skills. Every word is the app's own (original); it is not treatment or a diagnosis, and SOS is never behind a PIN.
For each item below please answer: KEEP / CHANGE TO "..." / DROP. Also tell us any warning that is missing, and confirm or correct the India crisis numbers (P-28).
Sources are file:line in offline/src/ (the line where the block starts). Code syntax is stripped; lines shown are the words a person reads. [note] says where the person sees it.
Wording is shown as it is now; nothing has been changed. Send all answers to the owner in one message, quoting the P-numbers.
P-numbers of the v1.1 pack are kept where the passage still exists; a passage whose words changed is marked CHANGED since v1.1 with the old words in one line; new passages are P-33 onward.
(The lines were read from the integration tree at 903016cc, tag offline-v3.1, 2026-11-09.)

## 1. ui-sos.js (the SOS screens)

### P-01 · ui-sos.js:17 · COPY, craving screens
[note] Title and line on each SOS step during a craving.
```
SOS: You opened this. That is a strong move.
How strong is it? Tap 0 to 10, or skip. Your 15-minute timer is running.
Pick a tool: Somewhere risky? Leaving is a valid move.
Remind me why: (empty) Add your reasons in the Workbook later. (locked) Your reasons are hidden while the notebook is locked.
Call someone: Pick someone safe. A short call is enough. / No Safety Net yet. You can add one later. / Your people are hidden while the notebook is locked. / (drill) In a real craving, your people show here.
How strong is it now? Tap 0 to 10, then choose.
Did you use? Either answer is OK here.
Wave surfed. You rode it out. That skill grows each time.
Drill done. Nothing goes in your log. Now you know the way.
Give it a beat: Step away if you can. Count to ten with me.
You stayed with it. That takes skill. It gets easier.
```

### P-02 · ui-sos.js:43 · COPY, slip screens
[note] The "I slipped" path: first screen, safety question, reach out, next day.
```
A slip is not a failure. Everything you earned stays. You opened this, and that counts.
  buttons: Log it and go on / Just reading / Go on
  after logging: It is in your log. Everything you earned stays.
  while locked: It goes in your log when you unlock. Everything you earned stays.
Are you safe right now? If not, get help now.
Reach out: One call or text. You do not have to explain it all.
Within a day: Look back at what happened, kindly. It helps next time.
You took the next step. Come back here any time.
```

### P-03 · ui-sos.js:48 · COPY, urgent and crisis titles
[note] The Urgent help view, and the crisis view (opened by crisis words or the hopeless chip).
```
Urgent help: If you or someone else is in danger, call now.
Please call now. You do not have to carry this alone.
If someone may have overdosed   (title of the overdose card, see P-30)
please verify / Please check these numbers. / Please check this number.   (beside numbers flagged unverified)
```

### P-04 · ui-sos.js:53 · COPY.withdrawal
[note] One-line withdrawal warning in SOS.
```
Heavy daily drinking or sedatives: stop with a doctor.
```

### P-05 · ui-sos.js:67 · FALLBACK (used only if the content file is missing)
[note] Stand-in SOBER steps, talk-back lines and spiral reply.
```
Stop. Pause where you are.
Observe. Notice what you feel in your body.
Breathe. Slow breath in. Slower breath out.
Expand. Notice the whole room around you.
Respond. Choose your next move on purpose.
---
This is a craving. It rises, peaks and passes.
Wanting it is not the same as needing it.
I can wait 15 minutes and let this wave pass.
---
I can stop now. This does not erase my progress.
```

### P-06 · ui-sos.js:86 · CRISIS (typed-text phrases on SOS)
[note] If someone types any of these on "Something else", the numbers come first, above the steps. A false alarm is allowed, a miss is not. Inflections and a missing apostrophe also match.
```
suicide (any form); kill myself / kill me / kms; self-harm; hurt / harm / cut / hang myself;
overdose on purpose; want / going / ready to die; wanna die; wish I was dead; better off dead;
wish I could die; feel like dying; thoughts of death / dying / suicide; not worth living; never wake up;
do not / don't want to live / be here / be alive / wake up; can't go on; end it / end it all / end things / end my life;
take my own life; nothing to live for; no reason / no point to live / going on;
want / wish / rather / ready to be dead; wish it / this / everything would end / be over;
never been born; disappear forever; better off without me; wanna be dead;
hope / wish I don't / won't wake up; hope I die; wish I hadn't / wasn't been born;
better off if I'm gone / dead / not here; wish it would all just stop; can't do this any more;
no one / nobody would miss me; better off gone; want to sleep forever
```

### P-07 · ui-sos.js:115 · OVERDOSE (typed-text phrases)
[note] Typed words that open the full urgent view with the overdose card.
```
overdose; OD (as a word only); took / taken too much; took too many (up to 3 words) pills / tablets / meds /
painkillers / paracetamol / medicine / medication / capsules; used too much;
a whole bottle / packet / pack / strip / box of (pills etc.); swallowed all my / the (pills etc.)
```

### P-08 · ui-sos.js:128 · LEAD
[note] A line above the steps on the Something-else screen, with the built-in emergency number and two numbers one tap away.
```
If you are not safe, call now.
```

## 2. boot.js and shell.html

### P-09 · boot.js:26 · COPY (the shell's safety line)  ·  CHANGED since v1.1 (when it shows)
[note] The words in boot.js are unchanged. CHANGED since v1.1: it said the lines show "if the app fails to start". Since V-11 a safety line shows on every start outside discreet mode (the shell line, P-33, with a fixed 112 link) until the first render replaces it; boot.js still carries the failed-start lines, with the saved emergency and crisis numbers.
Since fix ES1 (bf9b83c) the line is not shown while the app loads in discreet mode, so a discreet screen stays discreet. The owner may reverse ES1; the reviewer's view is welcome.
```
(numbers not readable) The app did not start. If you are in danger, call your local emergency number.
(numbers readable)     The app did not start. For urgent help, call:
Please verify these numbers.
```
The clinician's two open points (core brief): (1) "these numbers" is plural but sits beside one number (112); (2) the sentence before the number: is "If you are in danger, call your local emergency number." the right sentence to come before a fixed 112?

## 3. ui-core.js, ui-exercise.js, ui-settings.js, ui-onboarding.js

### P-10 · ui-core.js:34 · URGENT
[note] Shown if the SOS page is missing or fails, so urgent help never depends on one file.
```
Urgent help: If you or someone else is in danger, call now.
Built-in number: Emergency 112 (flagged verify)
India numbers: please verify. Elsewhere: your local emergency number (usually 112, 911 or 999).
```

### P-11 · ui-exercise.js:53 · URGENT_LINE
[note] Shown under a typed answer in any exercise when the engine list (P-15) finds crisis words. It never blocks saving.
```
If you might be in danger, urgent help is one tap away.   [link: Urgent help -> SOS urgent view]
```

### P-12 · ui-settings.js:58 · ABOUT (Settings)  ·  CHANGED since v1.1
```
This app has not been clinically tested and it is not medical advice. It does not replace a doctor, counsellor or support group.
If you are in danger or might hurt yourself, open SOS and tap Urgent help.
It works offline. Nothing leaves this device unless you save a backup file yourself.
Every screen is in the app now, and where content is still coming, the screen says so. Your notes stay on this device.
CHANGED since v1.1: "This is an early-access version. Some screens are still being built and say so. Your notes stay on this device while it grows."
```

### P-13 · ui-onboarding.js:16 · COPY, first-run safety step
[note] First-run steps. The safety step cannot be skipped (button "I understand").
```
Welcome: A private skills coach for recovery. It is not treatment or a diagnosis.
Your notebook stays here: Nothing leaves this device. A PIN is recommended, never required.
A quick safety check: Not a diagnosis. Tick any that fit you.
  ticks: I drink heavily every day / I take sleeping pills or benzodiazepines every day / I use opioids
  any tick shows the withdrawal lines (P-32); "opioids" also shows the opioid line (P-31).
  Built-in fallback if P-31 is missing: After a break, your tolerance drops. Never use alone. In an emergency, call for help.
Early access: this is a test version. Export a backup now and then.
```

### P-14 · ui-onboarding.js:18 · COPY, lock texts
[note] Lock screen (its help line), forgot-PIN and erase prompts.
```
Locked: Enter your PIN. Help works without it.
That PIN did not match.
Forgot your PIN? Without the PIN, the only way in is to erase this notebook on this device, then restore a backup if you have one.
Erase everything on this device? Your notes here will be gone. A backup file can bring them back.   [button: Erase]
```
## 4. engine.js

### P-15 · engine.js:1176 · CRISIS_PATTERNS (exported as Engine.CRISIS)
[note] The keyword list that decides whether P-11 shows. Inflections and a missing apostrophe match; a false alarm is allowed.
```
suicide (any form); kill myself / kill me / kms; self-harm (any form);
hurt / harm / cut / hang / injure myself; overdose on purpose;
want / going / ready / wish to die; wanna die; wish I was dead; better off dead; better off without me;
do not / don't / never want to live / be here / be alive / wake up / exist; can't go on;
end it all / end things / end my life / end everything; take my own life; nothing to live for;
no reason / no point to live / go on; not worth living; never wake up;
think / thought of or about death / dying / suicide / killing myself / ending it / ending my life
```
The words shown on a match are P-11.
## 5. Lessons (content-lessons-a/b/c.js; the whole lesson is marked)

### P-16 · content-lessons-a.js:160 · m2-l4 Treatment, medicines and healing
```
Medicines: Some medicines reduce craving, some block the high, some replace the drug safely. For opioids, medication is often the difference between relapse and recovery. They work alongside these skills, not instead of them. Always a conversation with a prescriber; this app only lists what exists.
Stopping safely: Stopping heavy daily drinking, or daily sleeping pills or benzodiazepines, suddenly can cause seizures. If that is you, see a doctor about a safe way down. Shaking, confusion, hallucinations or a fit after stopping are emergencies.
Quiz "You drink heavily every day and want to stop tomorrow. First step?" Wrong: Just stop; willpower (Sudden withdrawal from heavy daily drinking can be dangerous. See a doctor first about a safe way down.) Right: Talk to a doctor about stopping safely.
Wrap: If daily heavy use is you, book the doctor before anything else in this app.
```

### P-17 · content-lessons-b.js:155 · m5-l5 The spiral
```
A slip is not a fall: A slip is one use. What happens next depends a lot on the thoughts that follow. "I've blown it, so I might as well keep going" can turn one slip into many.
Nothing is lost: In this app a slip wipes nothing. Total days, skills and everything you built stay. If you are ever unsafe, Urgent help in SOS is one tap away.   [link: Urgent help]
```

### P-18 · content-lessons-c.js:178 · m9-l1 Mood and recovery
```
Early low mood: Feeling low in the first weeks is common and often lifts with time. Logging your feelings helps you see if it is changing.
When to get help: If low mood or worry lasts for weeks, talk to a doctor or counsellor. Help for mood and help for addiction work well together.
If you are not safe: If you have thoughts of harming yourself, get help now.   [link: Urgent help]
Quiz "Your low mood has lasted most days for a month." Right: Talk to a doctor or counsellor about it. Wrong: Keep it to yourself and wait (You do not have to carry it alone. A doctor can help.)
```

### P-19 · content-lessons-c.js:192-231 · m9-l2 The same traps, m9-l3 Anger: give it a beat, m9-l4 Rewrite the scene, m9-l5 Quick coping, then your why
[note] No explicit crisis line in these four. Relevant lines:
```
Feelings are not facts: A strong feeling can make a thought seem true. Feeling like a failure does not make you one.
Anger costs: Losing your temper can hurt people you care about and make it harder to get what you need. Angry moments are also a common lead-in to using.
Give it a beat: When you notice the signs, pause before you speak or act. Step away, breathe, or count.
Calm the body first: In a hard moment, start with something quick: SOBER, a short walk, cold water on your face, or a call to someone in your crew.   [link: feeling tools in SOS]
```

### P-20 · content-lessons-c.js:249-288 · m10-l1 One step ahead, m10-l2 Your warning signs, m10-l4 Build my plan
[note] No explicit crisis line in these three. Relevant lines:
```
A slip is a process: Going back to using usually builds up over days or weeks. Stress grows, good habits slip, and old thoughts return. That means there is time to notice and act.
Nothing you built is lost: Everything you have learned stays with you. If things get harder, you go back to the skills that worked.
Signs are personal: Common signs include poor sleep, skipping support, pulling away from people, fewer enjoyable things, and old thoughts like "just one". Yours may be different.
A gentle radar: The Warning Sign Radar watches your own logs for some of these signs and reminds you of your plan. It never judges you.
```

### P-21 · content-lessons-c.js:275 · m10-l3 Stopping a slip
```
A slip is not the end: A slip does not undo what you have learned or built. It is a sign the plan needs a change.
Stop and reach out: Stop as soon as you can, and tell someone in your crew. Then look at what led up to it.   [link: Open slip help]
If you are not safe: If you feel unwell or unsafe, get help now.   [link: Urgent help]
```

## 6. content-exercises.js (marked exercises)

### P-22 · content-exercises.js:739 · anger-signature "When I get angry"
```
Where do you feel anger in your body? / What do you notice first? / What do you tend to do when you are angry? / What usually sets it off?
Hint: The first sign is your cue to give it a beat.
Saved: Your anger signature is saved. Anger is allowed; this helps you choose what comes next.
```

### P-23 · content-exercises.js:757 · rewrite-scene "Replay and rewrite"
```
What happened, in a few lines? / What did you do? / What would you like to do next time?
Hint: Keep it doable. One small change is enough.
Saved: Saved. Rehearsing a better ending makes it easier to find next time.
```

### P-24 · content-exercises.js:777 · warning-signs "My warning signs"
```
Which of these could be early warning signs for you? / Pick your top three and write a plan for each
Hints: Think back: what changed in the weeks before a past slip? / A plan is one action you can take the same day.
Saved: Your warning signs are saved. The Radar watches for them in your own logs.
```

### P-25 · content-exercises.js:798 · slip-review "Learn from a slip" (sensitive)
[note] Shows a skip note first: "This one asks about things that can be hard to look at. Take it at your own pace, or skip it for now and come back any time." (ui-exercise.js)
```
Where were you, and who was there? / What came first: a thought, a feeling or a trigger? / What will you do differently next time? / Support you will ask for
Hints: One thing you can change is enough. / If you feel unsafe, use SOS, Urgent help.
Saved: Saved. Every day you built still counts.
```
## 7. content-practices.js (five marked practices)

### P-26 · content-practices.js:181 · bigGame "Arjun's Saturday"
[note] A six-scene story about an original character who stopped drinking; choices end in a safe evening or a slip. Lines to review:
```
If he picks up the drink: The story ends here for today. A slip is a lesson for the plan, not the end. Arjun can stop, reach out and look at what led here.
Waiting at the counter is the riskiest spot in the room.
Leaving the moment and calling someone breaks the chain, even late.
Leaving early is a valid move. He kept his evening safe.
```
(The full six scenes are at lines 181-215.)

### P-27 · content-practices.js:219-237 · refusal scenes rf1 to rf4 (each marked)
```
rf1 wedding glass. Best: "No, thank you. I'll toast with this juice."  Weak: "Maybe later."
rf2 old crowd calls. Best: "I've stopped, so I won't come if people are using. Want to get tea tomorrow?"  Weak: "Yes, but I won't use."
rf3 coworker offers a pill before a deadline ("It helps you focus. Everyone takes them."). Best: "No, I don't take those."  Weak: "Not right now, thanks."
rf4 neighbour offers a smoke. Best: "I've quit. Please don't offer any more. I'm happy to chat, though."  Weak: Take it so they do not feel bad (Your recovery matters more than a moment of awkwardness.)
```

## 8. content-core.js and shell.html (crisis numbers and safety lines)

Note on markers: since FIX-MARKERS (content cd17758, merged into the trunk 3a0b2100 on 2026-11-09 19:16 IST) P-28, P-29, P-30 and P-32 carry a clinicalReview marker in content-core.js too; none of their words, numbers or links changed. Every item in this pack now has a marker in the source.

### P-28 · content-core.js:430-452 · crisis numbers (every entry has verify: true)
Note shown with the India list: "These numbers were collected from public sources in October 2026 and have not yet been verified by the owner. Check each one before you rely on it."

| Region | Service | Number (alt) | Hours / note | Verify |
|---|---|---|---|---|
| India | Emergency (police, ambulance, fire) | 112 | National emergency number | yes |
| India | Ambulance | 108 | In many states, including Gujarat | yes |
| India | Tele-MANAS (mental health helpline) | 14416 (1800-891-4416) | 24x7; Government of India; many languages incl. Gujarati | yes |
| India | KIRAN mental health helpline | 1800-599-0019 | 24x7; Ministry of Social Justice | yes |
| India | Nasha Mukti national drug de-addiction helpline | 14446 | Toll-free; information on de-addiction centres | yes |
| India | Vandrevala Foundation | 1860-2662-345 (+91 9999 666 555) | 24x7; free counselling, also on WhatsApp | yes |
| India | Poison information (AIIMS National Poisons Information Centre) | 1800-116-117 (011-2658-9391) | 24x7 | yes |
| Elsewhere | Your local emergency number | 112 | Usually 112, 911 or 999 | yes |
| Elsewhere | Find a Helpline (findahelpline.com); Befrienders Worldwide (befrienders.org) | web directories | none | yes |

Also verify-flagged but not crisis numbers: AA India (aagsoindia.org), NA India (naindia.in), SMART Recovery (smartrecovery.org), government de-addiction centres directory (nmba.dosje.gov.in), Hospital for Mental Health Ahmedabad, district and civil hospitals.

### P-29 · content-core.js:454 · India context note
```
Gujarat has alcohol prohibition, so drinking is illegal there and people often hide it. That is one more reason this app keeps everything on your device. The helplines are confidential. If you are worried about the law, say so to a counsellor; they have heard it before.
```

### P-30 · content-core.js:464 · overdose card (shown in SOS Urgent help)
```
Call the emergency number first. Say "overdose", the substance if you know it, and the address.
If the person is not breathing or is unresponsive, follow the operator's instructions. If you have naloxone and opioids are involved, use it.
Lay an unconscious person on their side so they do not choke.
Stay with them. Do not let them "sleep it off" alone.
After a break from opioids, tolerance drops. The same old amount can kill. Never use alone, and never use an unknown source.
```

### P-31 · content-core.js:533 · opioidSafety (verify and clinicalReview)
```
After a break, your body loses tolerance, so an old amount can be deadly. Never use alone. If someone will not wake up or is breathing slowly, call 112 at once.
```

### P-32 · content-core.js:471 · withdrawal lines (onboarding safety step and SOS)
```
Stopping heavy daily drinking suddenly can cause seizures or delirium. Stopping sleeping pills or benzodiazepines suddenly can too.
If you drink heavily every day, or take sedatives every day, talk to a doctor about stopping safely. Many hospitals have a detox unit.
Shaking, sweating, confusion, hallucinations or a seizure after stopping are emergencies: call the emergency number.
```
Glossary "Withdrawal": The rough physical and emotional effects as a substance leaves the body. For alcohol and sedatives it can be dangerous: see a doctor.

### P-33 · shell.html:23 · the shell's first line (NEW since v1.1)
[note] Shown in the page before any script runs, on every start outside discreet mode (V-11), until the first render replaces it. Its words are the tail of the boot.js line (P-09) plus a fixed link to 112 (the built-in number, flagged verify). See P-09 for the ES1 note and the two open points.
```
If you are in danger, call your local emergency number.   [link: 112]
Please verify these numbers.
```

## Summary
Marked in the source at 903016cc: 38 clinicalReview markers in offline/src/*.js (ui-sos.js 7, boot.js 1, ui-core.js 1, ui-exercise.js 1, ui-settings.js 1, ui-onboarding.js 3, engine.js 2, content-lessons-a/b/c.js 12, content-exercises.js 4, content-practices.js 5, content-core.js 1; a few sit in code comments beside a block or line) plus 1 in shell.html. They are grouped into 29 marked passages: P-01 to P-27, P-31 and P-33. Four more (P-28, P-29, P-30, P-32) are kept from v1.1 with no marker, so 33 numbered items in all.
Against the v1.1 pack: 26 unchanged (P-01 to P-08, P-10, P-11, P-13 to P-27, P-31); 2 CHANGED (P-09: when it shows; P-12: the early-access line); 1 new (P-33, shell.html); 4 that had no marker at the tag (P-28, P-29, P-30, P-32; marked since 3a0b2100, words unchanged). No passage quotes a book.

Questions for the reviewer:
1. Are the India numbers in P-28 right, current and free as shown (Tele-MANAS 14416, KIRAN 1800-599-0019, Nasha Mukti 14446, Vandrevala, the AIIMS poison line, 112 and 108)? Which should be removed or added?
2. Is the overdose and opioid wording right (P-30, P-31, the P-13 fallback, P-32): call first, naloxone only if available, side position, tolerance warning, "never use alone", and the advice to stop with a doctor?
3. Does any passage over-promise (for example "Everything you earned stays", "It gets easier", "Most cravings pass") or under-warn (for example the crisis phrase lists P-06 and P-15, or the lessons with no crisis line, P-19 and P-20)? What warning is missing?
4. The start-up safety line (P-09, P-33): is it right to show it on every start, with one number beside "these numbers", and should it stay hidden in discreet mode (ES1) or show there too?
