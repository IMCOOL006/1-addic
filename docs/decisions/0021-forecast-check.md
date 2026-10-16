# ADR 0021: The forecast check is adopted

- **Decision:** C5 · **Status:** Accepted · **Date:** 16 October 2026

## Context

The Harbor review proposed one new mechanic: in the Weekly Review, show last week's forecast rough weather (planner blocks marked risky, Battle Plans) beside what the logbook actually recorded (craving and feeling logs by day and time), the way the Prediction Lab compares predicted and actual enjoyment. The owner said yes.

## Decision

Build the forecast check as part of the Weekly Review (Step 3.8), using data the app already has (PlanItem and LogEntry). It is reflection, never a score: the Weekly Review's XP covers it, and nothing rewards "accurate forecasts" or punishes misses. The wording is gentle ("You planned for rough weather on Thursday evening; the log shows a 6 out of 10 at 7:40 pm, and your plan was there").

## Consequences

- PLAN §5.6 lists it; no new entity; no new XP row.
- It respects the game guardrails: no exposure challenges, no dares, no outcome-based points.
