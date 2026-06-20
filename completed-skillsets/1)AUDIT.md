# Audit Skill Set

## Purpose

Use this skill to perform a strict visual, functional and trust audit of an application before demo, deployment or submission.

## When To Use

- Before a hackathon submission.
- Before shipping a UI-heavy feature.
- After a major refactor.
- When the user asks for a quality gate, UX review or readiness check.

## Audit Inputs

Gather:

- Local or deployed URL.
- Build command and test command.
- Target user and primary workflow.
- Claimed tracks, requirements or acceptance criteria.
- Screenshots or browser access, if available.

## Audit Workflow

1. Run or inspect the build.
2. Open the app in a browser where possible.
3. Check the primary user journey from start to finish.
4. Inspect desktop and mobile layouts.
5. Test loading, empty, error and success states.
6. Verify buttons, forms, tabs, links and API calls.
7. Check accessibility basics: labels, contrast, focus, keyboard path and responsive text.
8. Compare the result against the stated goal.
9. Produce a concise report with scores and fixes.

## Scoring

Score each category from 1 to 10:

- Visual quality.
- Functional correctness.
- Trust and resilience.
- Accessibility.
- Demo readiness.

Use 9/10 as the submission threshold. If any score is below 9, list the smallest changes needed to reach 9.

## Report Format

```markdown
# Audit Report

## Summary
- Visual Score:
- Functional Score:
- Trust Score:
- Accessibility Score:
- Demo Readiness Score:

## What Works
- ...

## Critical Issues
- [P0/P1] Issue, location, impact, fix.

## Secondary Issues
- [P2/P3] Issue, location, impact, fix.

## Missing States
- Loading:
- Empty:
- Error:
- Success:

## Recommended Fix Order
1. ...
2. ...
3. ...

## Final Verdict
Ready / Not ready / Ready with caveats.
```

## Self-Correction Loop

If asked to fix issues:

1. Fix only issues that materially affect the target workflow.
2. Avoid unrelated redesigns.
3. Re-run build/tests.
4. Re-check the affected screen.
5. Stop after three failed attempts and report the blocker plainly.

Do not commit, deploy or rewrite broad areas unless the user explicitly asks.

## Quality Bar

- Findings are specific and actionable.
- File paths, UI locations or routes are named.
- Unknowns are stated plainly.
- Recommendations are prioritised by user impact.
- The final verdict is clear.
