# Priceplain 3-Minute Video Script

Use this as the Popcorn.co script. Keep the narration calm and direct. Do not claim that OpenAI has validated, requested or used Priceplain.

## Title

Priceplain: AI Pricing Copilot for Vibe-Coded Apps

## Script

| Time | Visual Direction | Voiceover |
| --- | --- | --- |
| 0:00-0:12 | Show the Priceplain homepage, headline and provider-status strip. | “This is Priceplain, an AI pricing copilot for founders building AI apps. The problem is simple: vibe coding makes it easy to build an app quickly, but most founders still do not know what to charge, what to meter, or whether the pricing can survive real usage costs.” |
| 0:12-0:35 | Show Pricing Inputs: app description, target customer, value metric, active customers, margin target and cost drivers. | “A founder enters their app idea, target customer, value metric, rough model and API costs, active customer count, conversion, churn, growth and margin target. Priceplain turns those assumptions into a practical first pricing model instead of a guessed pricing table.” |
| 0:35-0:58 | Show generated tiers, loaded cost, overage rate, audit score and month-12 revenue. | “The app generates Free, Starter, Growth and Scale tiers with usage limits, overage rates, gross-margin checks and a pricing audit score. The key point is that pricing is tied to unit economics. If the model gets more expensive or users consume more than expected, the founder can see the risk before launch.” |
| 0:58-1:18 | Switch to Revenue Simulation and sensitivity checks. | “I also built a twelve-month revenue simulation. It shows revenue, cost of goods sold, margin, paid customer growth and break-even risk. There are stress tests for model-cost shock, usage spikes, conversion drops and churn increases, so the founder can defend the pricing model under pressure.” |
| 1:18-1:48 | Switch to Solvimon Handoff. Show value metric, meters, plans, invoice items, credit policies, JSON export and Solvimon key status. | “The main sponsor track is Solvimon. I used Solvimon by focusing on the step before billing implementation. Priceplain creates a Solvimon-ready handoff with value metrics, metering events, plans, invoice items, credit policies, implementation notes and exportable JSON. It does not claim to be a complete live Solvimon integration yet. It proves the planning and handoff layer that a usage-based billing workflow needs.” |
| 1:48-2:08 | Show GitHub repo and `.plain` files: `product-mvp.plain`, `pricing-engine.plain`, `acceptance-tests.plain`. | “The second primary sponsor track is Codeplain. I used Codeplain’s spec-driven approach by documenting the product behaviour in `.plain` files. The repo includes a product MVP spec, pricing-engine rules and acceptance tests, so the intended behaviour is written down, testable and easy for judges to inspect.” |
| 2:08-2:30 | Show Vercel deployment, Claude refine button and provider status. | “Vercel supports the live deployment. The app is running on Vercel, with server-side API routes for Claude refinement and safe provider-status checks. API keys stay server-side and are never exposed in the browser. Claude and Solvimon readiness are visible in production.” |
| 2:30-2:50 | Show Pricing tab again, then briefly show OpenAI API pricing or a neutral text overlay saying “OpenAI-style planning: usage, credits, tiers, margins.” | “This idea is also useful for OpenAI-style planning right now. Public OpenAI products already involve token-priced APIs, model-specific price points, service tiers, enterprise packaging and credit-based products like Codex. Priceplain helps teams reason through those business-model questions: what should be metered, what should be included, where should credits or limits sit, and what happens to margin as usage scales?” |
| 2:50-3:05 | Show Submission Pack and “Solvimon Judge Lens”. | “The Submission Pack ties the business case together: who wants it, how it makes money, why it is different, and what gets built next. The wedge is the moment before billing implementation, where founders and AI product teams need to understand the economics before they launch.” |
| 3:05-3:15 | Final screen with live demo and GitHub links. | “Priceplain answers four questions: what should I charge, what should I meter, can this make money, and how do I hand it off to billing? Live demo: priceplain.vercel.app. Code: github.com/MasteraSnackin/Priceplain.” |

## Sponsor Usage Summary

- Solvimon: pricing-to-billing handoff, meters, plans, invoice items, credit policies and sandbox readiness.
- Codeplain: `.plain` product specification, pricing rules and acceptance tests.
- Vercel: live deployment and server-side AI/provider-status routes.
- FLock: optional secondary Sovereign AI Review for governance and institutional readiness.

## OpenAI Relevance Guardrail

Say “useful for OpenAI-style planning” or “companies like OpenAI.” Do not say that OpenAI uses Priceplain, asked for Priceplain, or validated the product.

Public context used:

- OpenAI API pricing shows model-specific token pricing, service tiers and enterprise offerings: https://openai.com/api/pricing/
- OpenAI Codex pricing explains credit usage based on models, features and token-based rates: https://developers.openai.com/codex/pricing#how-do-credits-work
