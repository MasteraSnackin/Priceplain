# Audit Report

Run date: 20 June 2026
Local URL: `http://localhost:3002`
Build command: `npm run build`
Dedicated smoke command: `npm run smoke`
Browser render command: `npm run test:browser`

## Summary

- Visual Score: 9/10
- Functional Score: 9/10
- Trust Score: 9/10
- Accessibility Score: 9/10
- Demo Readiness Score: 9/10

## What Works

- Production build passes.
- `npm audit --audit-level=moderate` reports no vulnerabilities.
- Local app returns HTTP 200 on `http://localhost:3002`.
- Desktop pricing view renders Founder Intake, pricing tiers, audit signals and action buttons.
- Business, Sovereign, Simulation, Metering and Export tabs render their key content.
- Metering shows the Solvimon import preview above raw event details, with Copy import JSON and Download JSON actions.
- README screenshots are present for Pricing, Metering and Export.
- Mobile viewport at 390px renders all main tabs with no horizontal overflow.
- Claude missing-key path preserves pricing output and shows `CONFIGURATION_ERROR` with a request id.
- FLock missing-key path preserves the deterministic sovereign review and shows `CONFIGURATION_ERROR` with a request id.
- API validation errors return stable `VALIDATION_ERROR` codes and request ids.
- `npm run smoke` checks app shell routes, shareable Business/Sovereign URLs and stable API error envelopes.
- `npm run test:browser` checks rendered judge routes for Metering, Simulation, Export, Business and Sovereign.
- Copy report writes the final report to the browser clipboard when permission allows it.
- Export tab exposes the full report text as a fallback artefact if clipboard access is blocked.
- Browser console showed no captured errors during the audit.
- Static accessibility probe found 29 form controls, 0 unlabelled controls and 0 textless buttons before the latest JSON export buttons were added.

## Critical Issues

None found.

## Secondary Issues

- [P2] Live provider success paths are untested because no real `ANTHROPIC_API_KEY` or `FLOCK_API_KEY` was provided. Impact: the demo fallback is verified, but live Claude/FLock responses still need credentialed verification. Fix: run one provider-backed request for each API before final judging if live AI calls will be shown.
- [P2] Browser tests verify rendered routes but not full click interactions. Impact: tab click, reload and download flows still need manual/browser audit. Fix: extend browser tests for tab state and the export report.
- [P3] Exact Codeplain config format remains unverified. Impact: `.plain` files exist, but final sponsor compliance may require an official config format. Fix: confirm with Codeplain sponsor docs or mentor guidance before submission.

## Missing States

- Loading: present for Claude and FLock provider calls.
- Empty: present through the Blank workflow.
- Error: present for Claude missing key, FLock missing key, validation failures and clipboard permission failure handling.
- Success: present through generated pricing tiers, deterministic sovereign review, simulation, export view and copied-report feedback.

## Recommended Fix Order

1. Verify live Claude and FLock provider success paths with real keys if using them in the demo.
2. Confirm Codeplain config requirements and add the official config if required.
3. Extend the automated browser test suite for tab interactions and export copy.

## Final Verdict

Ready with caveats.

The MVP is ready for a Solvimon and Codeplain-focused hackathon demo. The caveats are external-provider success verification and final Codeplain config confirmation.
