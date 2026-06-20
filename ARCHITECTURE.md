# System Architecture: Priceplain

## Overview

Priceplain is a browser-first pricing workspace for founders building AI-native applications. It combines deterministic pricing logic, Solvimon-style billing handoff data, hackathon submission framing, optional Claude refinement, and optional FLock sovereign AI review refinement.

The MVP is intentionally small: a React/Vite front end, shared TypeScript domain types, deterministic client-side analysis, and server-side API routes for provider calls and provider-status checks.

## Key Requirements

- Generate usage-aware pricing tiers from rough founder inputs.
- Show margin, COGS, overage and free-tier risk clearly.
- Explain metering events, invoice-line assumptions and billing implementation rules for a Solvimon-style workflow.
- Stress-test pricing assumptions with simple sensitivity scenarios.
- Compare saved AI-app presets to demonstrate that the model is not hard-coded to one example.
- Keep Codeplain specifications and acceptance tests in the repository.
- Work without external API keys.
- Keep provider secrets server-side when Claude or FLock refinement is enabled.
- Show live provider-key readiness without exposing secrets.
- Present a clear hackathon demo path for judges.

## High-Level Architecture

```mermaid
flowchart LR
  User[Founder or Judge] --> App[React Vite Client]
  App --> Pricing[Pricing Engine]
  Pricing --> Billing[Solvimon Import Preview + Sensitivity]
  App --> Governance[Sovereign Review Engine]
  App --> Plain[.plain Specs]
  App --> StatusRoute[/api/provider-status]
  App --> ClaudeRoute[/api/priceplan]
  App --> FlockRoute[/api/sovereign-review]
  StatusRoute --> Env[Server Env Vars]
  ClaudeRoute --> Anthropic[Anthropic Claude]
  FlockRoute --> FLock[FLock OpenAI-Compatible API]
```

The browser handles the primary experience and deterministic calculations. Server-side API routes are optional enhancement paths for provider-backed reviews. The `.plain` files document the intended product behaviour and acceptance criteria.

## Component Details

### React Client

- Responsibilities: render intake form, demo presets, generated pricing tiers, business case, sovereign review, simulation, sensitivity scenarios, metering events, Solvimon import preview and export view.
- Main technologies: React, TypeScript, Vite, Lucide React.
- Data owned or transformed: `PricingInputs`, UI state, generated report text, provider-loading and provider-error states.
- External dependencies: browser clipboard API, local API routes.
- Failure modes: provider credentials missing, clipboard unavailable, malformed provider response, small-screen layout pressure.

### Pricing Engine

- Responsibilities: calculate cost per active customer, marginal unit cost, recommended tiers, overage rates, metering events, audit signals, revenue simulation, Solvimon import preview and sensitivity scenarios.
- Main technologies: TypeScript functions in `src/pricingEngine.ts`.
- Data owned or transformed: founder inputs into `PricingAnalysis`, `BillingImplementationExport`, `SolvimonImportPreview` and `SensitivityScenario[]`.
- External dependencies: none.
- Failure modes: unrealistic user inputs can produce conservative but imperfect recommendations; no historical market data is used.

### Sovereign Review Engine

- Responsibilities: score commercial transparency, usage auditability, data sovereignty posture, vendor lock-in risk and public-sector suitability.
- Main technologies: TypeScript functions in `src/sovereignReview.ts`.
- Data owned or transformed: `PricingInputs` and `PricingAnalysis` into `SovereignReview`.
- External dependencies: none for deterministic scoring.
- Failure modes: scoring is heuristic and should be treated as a procurement prompt, not a compliance determination.

### Claude Refinement API

- Responsibilities: refine the pricing plan for Solvimon and Codeplain using structured generation.
- Main technologies: Vercel AI SDK, `@ai-sdk/anthropic`, Zod.
- Data owned or transformed: compact pricing payload into `ClaudeRefinement`.
- External dependencies: Anthropic API via server-side `ANTHROPIC_API_KEY`.
- Failure modes: missing key, provider outage, invalid provider response, model-name mismatch.

### Provider Status API

- Responsibilities: report whether Claude and FLock server-side keys are configured and which model names will be used.
- Main technologies: small Vite/Vercel-compatible API handler.
- Data owned or transformed: environment variable presence only. Secret values are never returned.
- External dependencies: none.
- Failure modes: route unavailable or deployment missing the API handler.

### FLock Sovereign Review API

- Responsibilities: refine the sovereign AI governance review with a FLock-compatible inference call.
- Main technologies: `fetch`, JSON parsing, shared API error contract.
- Data owned or transformed: compact product, pricing and governance payload into `FlockSovereignRefinement`.
- External dependencies: FLock API via server-side `FLOCK_API_KEY`.
- Failure modes: missing key, provider outage, non-JSON model output, malformed provider response.

### Codeplain Specs

- Responsibilities: state the intended product flow, pricing rules and acceptance tests in plain language.
- Main technologies: `.plain` files under `plain/`.
- Data owned or transformed: specification text only.
- External dependencies: exact Codeplain config format is still unverified.
- Failure modes: specs can drift from implementation if not updated with behaviour changes.

## Data Flow

1. User edits pricing inputs in the React app.
2. User can switch between four demo presets or edit the assumptions directly.
3. `analysePricing` recalculates tiers, overages, audit signals, metering events and simulation.
4. `buildBillingImplementationExport` creates the internal tier, invoice, credit and metering handoff.
5. `buildSolvimonImportPreview` reshapes that handoff into sponsor-facing `meters`, `plans`, `invoice_items` and `credit_policies`.
6. `buildSensitivityScenarios` recalculates the model under cost, usage, conversion and churn shocks.
7. `assessSovereignty` recalculates governance signals from the current pricing analysis.
8. `/api/provider-status` reports whether live provider keys are configured.
9. User can optionally call `/api/priceplan` for Claude pricing refinement.
10. User can optionally call `/api/sovereign-review` for FLock sovereign AI refinement.
11. Export view assembles pricing, Solvimon import preview, sensitivity checks, governance, preset comparison, track coverage and demo script into a copyable and downloadable Markdown report.

## Data Model

Core domain objects:

- `PricingInputs`: app description, customer, value metric, currency, stage, billing motion, growth assumptions and cost drivers.
- `PricingAnalysis`: generated pricing model, tiers, metering events, simulation, audit score, pricing-page copy and billing summary.
- `BillingImplementationExport`: schema version, tier rules, invoice line-item templates, metering events, credit policy and implementation notes.
- `SolvimonImportPreview`: sponsor-facing JSON preview with `meters`, `plans`, `invoice_items`, `credit_policies` and implementation notes.
- `SensitivityScenario`: assumption change, month-12 revenue/COGS, margin delta, audit score and break-even month.
- `SovereignReview`: governance score, verdict, signals, procurement questions, actions, FLock path and institutional buyer fit.
- `ClaudeRefinement`: executive summary, pricing rationale, Solvimon implementation notes, Codeplain plan, suggested changes and risks.
- `FlockSovereignRefinement`: executive summary, governance findings, recommendations, procurement questions and adoption risks.
- `ProviderStatus`: safe key-configuration status and selected model names for Claude and FLock.
- `ApiErrorPayload`: stable API error code, safe message, request id, optional provider and optional details.

There is no database in the current MVP.

## Infrastructure and Deployment

Local development uses Vite with middleware that mounts the API handlers at:

- `/api/priceplan`
- `/api/provider-status`
- `/api/sovereign-review`

Production deployment target is Vercel:

- Build command: `npm run build`
- Output directory: `dist`
- Required runtime secrets for live provider calls: `ANTHROPIC_API_KEY`, `FLOCK_API_KEY`

No deployed production URL is recorded yet.

## Scalability and Reliability

The deterministic calculations are cheap and run in the browser, so the app is not compute-heavy for normal demo use. Provider-backed calls are optional and isolated behind API routes.

Current reliability controls:

- Deterministic fallback experience when provider keys are absent.
- Stable API error contract with request IDs.
- Provider keys kept server-side.
- Provider status endpoint reports only key presence and model names.
- Explicit UI loading and error states for provider calls.
- Browser-side API request timeouts for Claude and FLock actions.
- Server-side timeout for the native FLock provider request.
- Domain regression checks through `npm run test:domain`.
- Browser-render checks through `npm run test:browser`.
- Live route smoke checks through `npm run smoke`.

Current gaps:

- Claude structured generation is not currently aborted server-side because the installed AI SDK type declarations did not expose a supported abort signal option.
- No provider retries.
- No persistent logging or tracing sink.
- No rate limiting.
- Browser checks render routes, but they do not yet click through every interaction.

## Security and Compliance

Secrets management:

- Provider keys are read from server-side environment variables.
- `.env.example` lists variables without real secrets.

Client/server trust boundary:

- The browser sends pricing assumptions and deterministic analysis to API routes.
- The API routes call external providers and return safe structured output.

Authentication and authorisation:

- Not present in the MVP.
- This is acceptable for a local hackathon demo, but not for a multi-user production product.

Sensitive data handling:

- Users should avoid entering real customer secrets in the demo.
- Provider prompts include commercial assumptions, so production use would need a retention and data-processing policy.

Third-party provider risk:

- Claude and FLock calls are optional.
- The deterministic experience remains usable without provider availability.

Auditability and logging:

- API errors include request IDs.
- There is no durable audit log yet.

## Observability

Current observability is limited to request IDs returned in API error responses and local development logs. There is no production logging backend, metrics dashboard, alerting, or trace correlation beyond the response-level request ID.

## Design Decisions and Trade-offs

- Browser-first deterministic engine: keeps the core demo fast and credential-free, but means recommendations are heuristic rather than data-trained.
- Solvimon import preview instead of direct billing-platform integration: gives judges a concrete billing handoff without requiring sponsor credentials, but it is not a live Solvimon integration.
- Sensitivity scenarios: quickly show business risk, but use deterministic shocks rather than historical cohort data.
- Optional AI refinement: improves sponsor fit without making the demo dependent on external providers.
- No database: reduces setup and deployment risk, but prevents saved workspaces and audit history.
- `.plain` specs in repo: strengthens Codeplain narrative, but exact Codeplain config format remains an explicit unknown.
- Focus on Solvimon and Codeplain: increases pitch coherence, but deliberately leaves Sui, Bilt and BGA out of scope.

## Future Improvements

- Extend browser checks into full interaction tests for tab state, preset switching and export download.
- Add safe retry rules and circuit-breaker behaviour.
- Add server-side Claude abort support if the AI SDK exposes a supported timeout or abort option.
- Add downloadable CSV exports.
- Add saved workspaces with explicit retention controls.
- Add a durable audit log for pricing recommendations and metering changes.
- Verify and add the official Codeplain config format.
- Deploy to Vercel and record the production URL.
