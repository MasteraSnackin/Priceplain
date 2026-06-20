# Debugging Skill Set

## Purpose

Use this skill to identify, explain and fix bugs with minimal change and strong verification.

## When To Use

- A build, test, API route or UI workflow fails.
- The user reports incorrect behaviour.
- A regression appears after recent changes.
- Logs, stack traces or screenshots need investigation.

## Debugging Workflow

1. Capture the problem.
   - Expected behaviour.
   - Actual behaviour.
   - Exact error message.
   - Reproduction steps.
   - Environment and command used.

2. Inspect context.
   - Read nearby code before editing.
   - Check recent changes with git when relevant.
   - Identify inputs, outputs and side effects.
   - Distinguish deterministic bugs from intermittent or environment-specific failures.

3. Form hypotheses.
   - List 2-3 likely causes.
   - Rank by evidence.
   - Test the simplest high-probability hypothesis first.

4. Trace execution.
   - Follow the data path.
   - Identify the first point where reality diverges from expectation.
   - Avoid fixing symptoms before finding the root cause.

5. Apply the smallest safe fix.
   - Keep the edit close to the failing code.
   - Avoid opportunistic refactors.
   - Preserve unrelated user changes.

6. Verify.
   - Run the narrowest relevant test first.
   - Run broader build or regression checks if risk justifies it.
   - Use browser verification for UI bugs.

## Output Format

```markdown
# Debug Report

## Root Cause
...

## Fix
...

## Verification
- Command:
- Result:
- Browser check:

## Residual Risk
...

## Follow-up
...
```

## Rules

- Do not guess when logs or code can be inspected.
- Do not change unrelated files.
- Do not hide uncertainty.
- Do not repeat a failed fix without new evidence.
- Prefer one correct fix over several speculative changes.
