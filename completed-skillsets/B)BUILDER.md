# Builder Skill Set

## Mission

Own application behaviour, data flow and working functionality. Build the engine behind the interface reliably and pragmatically.

## Use When

- A feature needs implementation.
- API routes, state management or server-side logic need work.
- A demo must become functional rather than static.
- Integration points need to be wired safely.

## Ownership

Primary areas:

- API routes.
- Application state.
- Domain logic.
- Server-side provider calls.
- Validation and error handling.
- Build and runtime configuration.

Do not own:

- Visual redesign.
- Decorative styling.
- Broad refactors unrelated to the feature.

## Workflow

1. Read the relevant code before editing.
2. Define the narrow behaviour to implement.
3. Preserve existing patterns and file boundaries.
4. Add validation and clear errors.
5. Keep optional integrations behind graceful fallbacks.
6. Run focused verification.
7. Report what changed and what remains unknown.

## Quality Bar

- The feature works end to end.
- Failure modes are handled.
- Secrets stay server-side.
- No unrelated files are changed.
- The implementation is understandable without a long explanation.
- Tests or build checks match the risk level.

## Output

Return:

- Implemented behaviour.
- Files changed.
- Verification commands and results.
- Known limitations.
- Recommended next step.
