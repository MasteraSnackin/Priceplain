# Error Handling Skill Set

## Purpose

Use this skill to design, implement or audit resilient error handling in applications, APIs and async workflows.

## When To Use

- Adding error handling to a new feature.
- Improving API responses and client-side error states.
- Debugging production failures.
- Introducing retries, timeouts, fallbacks or circuit breakers.
- Making errors more useful for users and developers.

## Core Principles

- Validate early and fail clearly.
- Preserve context: code, status, provider, request id and useful metadata.
- Handle errors at the level that can recover from them.
- Avoid swallowing errors.
- Avoid duplicate logging at every layer.
- Separate user-facing messages from developer diagnostics.
- Treat expected failures differently from unexpected bugs.
- Keep secrets and sensitive payloads out of logs.

## Error Categories

### Expected and Recoverable

- Invalid user input.
- Missing resources.
- Permission failures.
- Network timeouts.
- Rate limits.
- External provider outages.

Use typed errors or Result types. Return helpful messages and recovery actions.

### Unexpected or Programming Errors

- Null dereferences.
- Broken invariants.
- Invalid internal state.
- Exhausted memory.
- Misconfigured environment.

Log with context, fail safely, and avoid pretending the operation succeeded.

## API Error Contract

Prefer a consistent JSON shape:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request is missing a required field.",
    "details": {
      "field": "email"
    },
    "requestId": "req_123"
  }
}
```

Rules:

- `code` is stable and machine-readable.
- `message` is safe for users.
- `details` is optional and never leaks secrets.
- `requestId` links client errors to logs.

## TypeScript Pattern

```ts
type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status = 500,
    public details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

class ValidationError extends AppError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}
```

## Async and Provider Calls

For external services:

- Set explicit timeouts.
- Retry only idempotent or safe operations.
- Use exponential backoff with jitter.
- Stop retrying on validation, auth or quota errors.
- Add fallbacks where the product can degrade gracefully.
- Surface provider status in the UI when useful.

## UI Error States

Every async UI workflow should have:

- Loading state.
- Empty state.
- Recoverable error state.
- Success confirmation.
- Disabled or guarded duplicate submission.

User-facing copy should say what happened and what to do next.

## Reliability Patterns

### Retry

Use for transient network or provider failures. Avoid retry storms.

### Circuit Breaker

Use when a provider is repeatedly failing. Temporarily stop calls and return fallback behaviour.

### Graceful Degradation

Keep the core workflow usable without optional providers.

### Error Aggregation

Use when validating multiple fields so the user can fix all issues at once.

## Audit Checklist

- Are errors typed or categorised?
- Are API responses consistent?
- Are secrets excluded from logs and messages?
- Are retry rules explicit?
- Is there a user-visible fallback?
- Are error states tested?
- Does observability include request ids and provider names?

## Output Format

When asked to audit or implement error handling, report:

```markdown
## Error Handling Summary
- Scope:
- Main failure modes:
- Current gaps:
- Fixes made or recommended:
- Verification:
- Residual risks:
```
