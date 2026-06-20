# Improvement Report

Run date: 20 June 2026

## Scope

Implemented the highest-value improvements that do not depend on unconfirmed sponsor configuration:

- Solvimon import preview.
- Additional AI app demo presets.
- Pricing sensitivity checks.
- Demo mode for judge presentation.
- Provider-key status checks.
- Markdown report download.
- Solvimon JSON copy/download.
- Saved preset comparison.
- README screenshots and pitch pack.
- Focused deterministic domain tests.
- Browser-render route checks.

## Changes Made

- Added four demo presets:
  - Briefly meeting notes.
  - PatchPilot coding assistant.
  - FrameForge media generation.
  - QueueKind support automation.
- Added `BillingImplementationExport` domain output with:
  - schema version,
  - tier rules,
  - invoice line-item templates,
  - metering events,
  - credit policy,
  - implementation notes.
- Added `SolvimonImportPreview` output with:
  - `meters`,
  - `plans`,
  - `invoice_items`,
  - `credit_policies`,
  - copy/download JSON actions.
- Added pricing sensitivity scenarios:
  - model-cost shock,
  - usage spike,
  - conversion drop,
  - churn rise.
- Added demo mode to hide the intake panel and focus the live presentation on Pricing, Metering, Simulation and Export.
- Added `/api/provider-status` to report whether Claude and FLock keys are configured without exposing secrets or calling providers.
- Added a one-click Markdown report download.
- Added a dedicated pitch pack in `docs/PITCH.md`.
- Added README screenshots under `docs/assets/`.
- Added saved preset comparison for loaded cost, starter price, month-12 revenue, margin and audit score.
- Added `npm run test:browser` for headless Chrome render checks across the key demo routes.
- Added `vercel.json` with the Vite build command and `dist` output directory.
- Added `npm run test:domain`, which compiles deterministic modules to a temporary directory and checks all presets.
- Updated README, architecture docs and `.plain` acceptance criteria.

## Why These Changes Matter

- Solvimon: the app now produces a concrete handoff from pricing strategy to billing implementation assumptions.
- Codeplain: the new behaviours are documented in `.plain` specs and backed by acceptance criteria.
- Demo quality: judges can switch between AI product categories instead of seeing one hard-coded example.
- Business potential: sensitivity checks show whether the model survives realistic cost and growth shocks.
- Operational clarity: key status makes it clear when live Claude or FLock calls can run.

## Verification

Commands to run:

```bash
npm run build
npm run test:domain
npm run test:browser
npm run smoke
npm audit --audit-level=moderate
```

## Remaining Limits

- The Solvimon import preview is a Priceplain handoff format, not a live Solvimon integration.
- Exact Codeplain config requirements are still unconfirmed.
- Live Claude and FLock success paths still require real provider keys.
- Browser checks currently verify rendered routes, not every click interaction.
