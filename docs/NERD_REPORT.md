# Nerd Technical Hardening Report

## Scope

This pass reviewed Priceplain for technical correctness, maintainability and retest speed after the Builder changes.

## Findings

- The deterministic pricing and sovereign-review logic is still the technical centre of the product.
- The highest practical risk was verification, not algorithmic complexity: `npm run build` proved TypeScript and bundling, but did not check live route contracts.
- The local API routes are wired through `vite.config.ts`, so a dev-server smoke test is a useful guard for the actual demo path.
- Provider calls should not be part of a default smoke test because they depend on external keys, latency and paid quota.

## Changes Made

- Added `npm run smoke`.
- Added `scripts/smoke.mjs`, a dependency-free live check for:
  - app shell availability,
  - shareable Business and Sovereign URLs,
  - API method rejection,
  - API validation errors,
  - invalid JSON handling,
  - stable request IDs in API errors.
- Updated README verification instructions.
- Added a Codeplain acceptance scenario for the smoke-test contract.

## Verification

Commands to run:

```bash
npm run build
npm run smoke
```

`npm run smoke` expects a running dev server and defaults to `http://localhost:3001`. Use `SMOKE_BASE_URL=http://localhost:<port> npm run smoke` if the server is on another port.

## Residual Risk

- There is still no pure unit-test suite for `analysePricing` or `assessSovereignty`.
- `npm run smoke` covers the live demo contract, but not browser interactions such as tab clicks or reload state.
- Vite preview does not exercise the local API middleware; production API behaviour should be checked separately on Vercel after deployment.
