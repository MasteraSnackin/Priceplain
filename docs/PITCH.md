# Priceplain Pitch Pack

Run date: 20 June 2026

## One-line Pitch

Priceplain is the planning layer before founders implement usage-based billing for AI apps.

## 30-second Version

Vibe coding makes it easy to ship an AI app, but not to price it. AI apps have variable costs from models, storage, media, and third-party APIs, so guessed unlimited plans can quietly destroy margin. Priceplain lets a founder describe their app, enter rough usage costs, and generate pricing tiers, metering events, overage rules, revenue sensitivity, and a Solvimon-ready JSON handoff.

## 90-second Version

AI founders can now build products faster than they can understand the economics. That creates a real launch problem: what do we charge, what do we meter, and can the margin survive real usage?

Priceplain solves that planning step. A founder enters their product, customer, value metric, active users, fixed costs, usage costs, conversion, growth, and churn. The app generates Free, Starter, Growth, and Scale tiers tied to real unit economics. It also shows metering events, invoice line items, credit policies, overages, and a twelve-month revenue and COGS simulation.

The Solvimon fit is direct: Priceplain turns pricing strategy into the objects a usage-based billing workflow needs: meters, plans, invoice items, credit policies, and implementation notes. The Codeplain fit is also direct: the project behaviour, rules, and acceptance tests are captured in `.plain` files.

The business wedge is the moment before billing implementation. Founders need confidence before wiring payments or quote-to-cash workflows. Priceplain can become a self-serve pricing toolkit for AI app launches, with higher-value templates and migration support for teams adopting hybrid usage-based billing.

## Demo Flow

1. Start on Pricing with the Briefly preset.
2. Show loaded cost, overage rate, audit score, and month-12 revenue.
3. Point to the workflow strip: describe app, model pricing, meter usage, export handoff.
4. Open Solvimon Handoff and show the Solvimon import preview plus the compact developer object.
5. Copy or download the Solvimon JSON handoff.
6. Open Revenue Simulation and show model-cost shock and usage-spike sensitivity.
7. Open Submission Pack and show preset comparison plus Markdown download.
8. Use Startup Case only if judges ask about commercial potential.
9. Use Sovereign only if judges ask about the FLock secondary track.

## Strongest Solvimon Points

- The product starts from a concrete customer pain: AI app founders do not know how to price variable-cost products.
- It produces usage-based and hybrid pricing assumptions, not just a static pricing table.
- It maps value metrics to billing events.
- It exposes invoice line items, credit policies, free-tier controls, and overages.
- It shows a developer-friendly billing object before the full import JSON.
- It supports the strategic step before quote-to-cash implementation.

## Strongest Codeplain Points

- `.plain` specs exist for product flow, pricing engine behaviour, and acceptance tests.
- The specs describe user outcomes and sponsor-specific judging needs.
- Domain tests verify the behaviours described in the specs.
- The implementation can be changed by editing plain-language pricing rules and acceptance criteria.

## Likely Judge Questions

**Is this a real Solvimon integration?**

No. It is a Solvimon-ready planning and import preview, not a live Solvimon API integration. The MVP focuses on the handoff objects that a billing platform would need.

**Why would founders pay?**

Because wrong AI pricing is expensive. A small monthly fee is easier to justify before a launch, funding round, or billing migration than after unlimited usage has damaged margin.

**What is differentiated?**

It combines AI-app unit economics, pricing tiers, metering events, invoice assumptions, sensitivity modelling, and spec-driven build artefacts in one workflow.

**What is the next production step?**

Add saved workspaces, real billing-provider import adapters, team collaboration, and a lightweight audit trail for pricing decisions.

## Do Not Overclaim

- Do not claim it is a live Solvimon integration.
- Do not claim the pricing is market-validated.
- Do not spend time on Sui, BGA, or Bilt unless asked.
- Do not show live Claude or FLock calls unless real keys are configured and tested.
