# Error Handling Summary

Run date: 20 June 2026

## Scope

- Browser calls to `/api/priceplan` and `/api/sovereign-review`.
- Local Vite API middleware.
- Serverless-style API handlers in `api/priceplan.ts` and `api/sovereign-review.ts`.
- External provider paths for Anthropic Claude and FLock.
- User-visible loading, error and fallback states.

## Main Failure Modes

- Invalid JSON request body.
- Wrong HTTP method.
- Missing required payload fields.
- Missing provider credentials.
- Provider timeout.
- Provider outage or non-2xx response.
- Provider response without expected JSON or message content.
- Browser receives an unreadable API response.
- Clipboard access is unavailable.
- Clipboard write permission is denied.

## Current Gaps

- Claude structured generation is not aborted server-side. Local type inspection did not show a supported `abortSignal` option for the installed `generateObject` declaration, so no undocumented option was added.
- Provider retries are not implemented.
- Circuit-breaker behaviour is not implemented.
- There is no durable server-side log sink or trace store.
- `npm run smoke` covers route-level error envelopes. There is still no unit-level API error test suite.

## Fixes Made

- Added reusable timeout helpers in `api/errors.ts`.
- Added `PROVIDER_TIMEOUT` typed errors for provider timeout handling.
- Added a 25-second server-side timeout to the native FLock `fetch` call.
- Added 30-second browser-side timeouts to the Claude and FLock local API requests.
- Added user-facing timeout messages that preserve deterministic fallback workflows.
- Updated `ARCHITECTURE.md` and `README.md` so timeout status and remaining gaps are accurate.
- Added `npm run smoke` coverage for method, validation and invalid-JSON error envelopes.
- Added a safe clipboard-denied message and full report text fallback in the Submission Pack tab.

## Verification

- `npm run build` passed.
- `npm run smoke` passed against `http://localhost:3001`.
- Fresh local server started on `http://localhost:3002`.
- `curl -I http://localhost:3002` returned HTTP 200.
- `POST /api/priceplan` with `{}` returned `VALIDATION_ERROR` and a request id.
- `POST /api/sovereign-review` with `{}` returned `VALIDATION_ERROR` and a request id.
- `POST /api/priceplan` with placeholder `inputs` and `analysis` returned `CONFIGURATION_ERROR`, provider `anthropic` and a request id.
- `POST /api/sovereign-review` with placeholder `inputs`, `analysis` and `review` returned `CONFIGURATION_ERROR`, provider `flock` and a request id.
- Browser export recheck showed the report textarea present, labelled and populated with pricing, metering, sovereign review and track coverage.

## Residual Risks

- Timeout handling for the live FLock provider path was not forced in a test because no provider credential or controllable slow endpoint was available.
- Live Claude and FLock success paths still require real keys.
- If live provider calls are used during judging, run one credentialed success-path check before the presentation.
