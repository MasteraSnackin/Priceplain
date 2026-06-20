# Builder Report

Run date: 20 June 2026
Scope: Priceplain application state, demo navigation and functional verification.

## Implemented Behaviour

The output tabs are now URL-backed:

- Clicking `Startup Case`, `Sovereign`, `Revenue Simulation`, `Solvimon Handoff` or `Submission Pack` updates the browser URL with the matching `?tab=<name>` route.
- Clicking `Pricing` removes the `tab` query parameter.
- Reloading a tab URL restores the matching selected tab.
- Browser back and forward restore the selected tab state through `popstate`.
- Invalid tab queries still fall back to `Pricing`.

This makes the demo sections shareable and recoverable during judging.

The Submission Pack tab now also includes a full read-only report text fallback. If clipboard writing is blocked, the app routes to Submission Pack and shows a safe message instead of a raw browser error.

Follow-up builder improvements added after the first pass:

- Demo mode hides the intake form for a cleaner judge flow.
- Solvimon Handoff shows a preview with `meters`, `plans`, `invoice_items`, `credit_policies`, object counts, compact developer object and JSON handoff.
- The Solvimon JSON handoff can be copied or downloaded.
- Submission Pack includes preset comparison and Markdown download.
- Provider status reports whether Claude and FLock keys are configured without exposing secrets.
- README screenshots and `docs/PITCH.md` were added for judging and GitHub review.
- `npm run test:browser` checks rendered judge routes in headless Chrome.

## Files Changed

- `api/provider-status.ts`
- `src/App.tsx`
- `src/aiClient.ts`
- `src/types.ts`
- `plain/acceptance-tests.plain`
- `README.md`
- `docs/BUILDER_REPORT.md`
- `docs/PITCH.md`
- `docs/assets/`
- `scripts/browser-tests.mjs`
- `scripts/smoke.mjs`
- `src/styles.css`
- `vercel.json`
- `vite.config.ts`

## Verification

- `npm run build` passed.
- `npm run test:domain` passed.
- `npm run test:browser` passed.
- `npm run smoke` passed.
- Browser check on `http://localhost:3002`:
  - Clicking `Startup Case` changed the URL to `/?tab=business` and selected `Startup Case`.
  - Reloading `/?tab=business` kept `Business` selected.
  - Clicking `Sovereign` changed the URL to `/?tab=sovereign` and selected `Sovereign`.
  - Browser back restored `/?tab=business` and selected `Startup Case`.
  - Browser forward restored `/?tab=sovereign` and selected `Sovereign`.
  - `/?tab=unknown` selected `Pricing`.
  - No browser console errors were captured.
- Routed content check:
  - `/?tab=business` renders `Startup Case` and `Solvimon fit`.
  - `/?tab=sovereign` renders `FLock Sovereign AI` and `Commercial transparency`.
  - `/?tab=metering` renders `Solvimon import preview`, `Example billing object`, `Copy import JSON` and `Download JSON`.
  - `/?tab=export` renders full report text with pricing, metering, sovereign review and track coverage.

## Known Limitations

- Invalid tab queries fall back to `Pricing` visually but are not rewritten to `/`.
- `npm run smoke` covers routed app shells and API envelopes.
- `npm run test:browser` covers rendered routes, but there is still no full automated browser-click regression suite.
- Live Claude and FLock success paths still need real API keys for final verification.

## Recommended Next Step

Extend the browser test into full interaction coverage for tab clicks, reload/back/forward state and export download generation.
