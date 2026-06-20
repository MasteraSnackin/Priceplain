# Debug Report

Run date: 20 June 2026
Scope: Priceplain build, local server, API fallback paths and main browser surface.

## Root Cause

The deep browser sweep found one reproducible resilience issue in the export workflow: browser clipboard writes can be denied even when the app is otherwise working. The previous handler surfaced the raw browser error text and did not expose the full generated report as a fallback artefact.

The provider and API fallback paths still behaved correctly: validation errors and missing provider credentials returned stable error envelopes with request ids, and deterministic pricing/governance output stayed visible.

## Fix

Added a reusable generated report value, changed clipboard failure copy to a safe user-facing message, routed blocked clipboard attempts to the Export tab, and added a read-only `Generated report text` textarea containing the full report.

## Verification

- Command: `npm run build`
- Result: passed with TypeScript and Vite production build complete.
- Command: `npm run smoke`
- Result: passed against `http://localhost:3001`.
- Browser check: default Priceplain page rendered `Founder Intake`, pricing tiers, `Claude refine`, `Copy report` and `Export`; no horizontal overflow; no captured console errors.
- Browser check: Export tab includes full read-only report text with pricing, metering, sovereign review and track coverage.
- Browser check: Copy report wrote expected report text to the browser clipboard when permission allowed it; raw browser clipboard errors were not visible after the fix.
- Local server: `curl -I http://localhost:3001` returned HTTP 200.
- API validation: `POST /api/priceplan` with `{}` returned `VALIDATION_ERROR` and a request id.
- API validation: `POST /api/sovereign-review` with `{}` returned `VALIDATION_ERROR` and a request id.
- Missing Claude key: `POST /api/priceplan` with placeholder payload returned `CONFIGURATION_ERROR`, provider `anthropic` and a request id.
- Missing FLock key: `POST /api/sovereign-review` with placeholder payload returned `CONFIGURATION_ERROR`, provider `flock` and a request id.

## Residual Risk

- Live Claude and FLock success paths remain unverified without real API keys.
- There is still no dedicated automated unit or browser-interaction suite. `npm run smoke` now covers route availability and API error envelopes.
- The exact Codeplain config format remains unverified.
- Clipboard denial could not be force-replayed after the fix, so the fallback branch is verified by code inspection and visible fallback presence rather than a forced denied-permission browser state.

## Follow-up

- Add focused tests for pricing calculations, sovereign review scoring and tab interactions.
- Run one credentialed Claude and FLock success-path test before using live provider calls in the demo.
- Confirm the official Codeplain config format before final submission.
