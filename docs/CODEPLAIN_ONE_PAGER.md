# Priceplain + Codeplain One-Pager

## Why Codeplain Was Right For Priceplain

Priceplain is a pricing product, so the hard part is not only the interface. The hard part is agreeing what the product should do: what inputs matter, how pricing should be calculated, what counts as a good Solvimon handoff, and how judges can verify that the behaviour is real.

Codeplain was useful because it pushed the project into **spec-driven development** instead of loose prompting. Rather than only asking an AI agent to "build a pricing app", the project behaviour was captured in `.plain` files that describe the user, the core workflow, pricing-engine rules and acceptance tests.

That matters for this hackathon because the challenge is about building with AI without losing clarity. The `.plain` files became the contract between product idea, implementation and demo.

## How Codeplain Was Used

Priceplain uses Codeplain through three main specification files:

| File | How It Was Used |
| --- | --- |
| `plain/product-mvp.plain` | Defines the product goal, target user, sponsor focus, core flow, non-goals and success criteria. |
| `plain/pricing-engine.plain` | Defines the pricing inputs, calculation rules, outputs, Solvimon import preview, provider-status behaviour and AI refinement scope. |
| `plain/acceptance-tests.plain` | Defines judge-readable scenarios for pricing generation, preset switching, Solvimon handoff, demo mode, simulation, provider errors, FLock review, export and browser routes. |

The specs shaped the actual product:

- the app asks for the same founder inputs defined in the product spec;
- pricing tiers follow the cost and margin rules defined in the pricing-engine spec;
- the Solvimon Handoff tab reflects the meters, plans, invoice items and JSON export described in the specs;
- Demo mode matches the judge route described in the acceptance tests;
- provider-key handling follows the missing-key and configured-key scenarios;
- the Submission Pack mirrors the required final export artefact.

## Practical Example

The pricing-engine spec says the system should calculate loaded cost, create Free, Starter, Growth and Scale tiers, add usage caps, set overage policy, run sensitivity scenarios and produce a Solvimon import preview.

The implemented app does exactly that:

1. The founder enters product and cost assumptions.
2. Priceplain calculates unit economics and gross-margin risk.
3. It generates tiers and overage rules.
4. It proposes billing events.
5. It creates Solvimon-shaped meters, plans, invoice items and credit policies.
6. It exports the handoff as JSON and Markdown.

That is the Codeplain value: the product can be judged against a plain-language specification, not only against a live demo.

## Why This Is Better Than Normal Vibe Coding

Without Codeplain-style specs, the project could easily drift into a generic AI pricing chatbot. The `.plain` files kept the MVP focused:

- primary tracks stayed Solvimon and Codeplain;
- Sui, Bilt and BGA were explicitly marked out of scope;
- the Solvimon handoff stayed concrete instead of becoming vague business advice;
- acceptance tests forced the demo to prove pricing, metering, simulation and export behaviour;
- missing API keys were treated as expected states, not demo failures.

This made the project more reliable, more explainable and easier for judges to inspect.

## Codeplain Judging Fit

| Codeplain Judging Area | Priceplain Evidence |
| --- | --- |
| Quality of spec-driven setup | Three `.plain` files define product scope, pricing logic and acceptance scenarios. |
| Presentation | The README, pitch deck, Submission Pack and one-page docs all point back to the specs. |
| Innovation and creativity | The specs connect AI-app unit economics with Solvimon billing objects, not just a generic pricing prompt. |
| Charm | The product has a clear, founder-friendly story: stop guessing pricing before launch. |

## Copy-Ready Judge Line

I used Codeplain by making the project spec-driven from the start. The `.plain` files define the product MVP, pricing-engine rules and acceptance tests, and the implemented app follows those specs: founder inputs, tier generation, Solvimon handoff, revenue simulation, provider handling, demo mode and export all map back to the plain-language contract. Codeplain made the AI build more disciplined because the project had a readable source of truth instead of relying only on prompts and screenshots.

## Files To Inspect

- `plain/product-mvp.plain`
- `plain/pricing-engine.plain`
- `plain/acceptance-tests.plain`
