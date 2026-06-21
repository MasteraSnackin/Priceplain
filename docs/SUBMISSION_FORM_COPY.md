# Priceplain Submission Form Copy

Use this document to paste into the hackathon submission form.

## Project Name

Priceplain

## Project Description

Priceplain is an AI pricing copilot for founders building AI apps. It turns rough product ideas, usage costs and growth assumptions into pricing tiers, metering events, revenue simulation, governance checks and a Solvimon-ready billing handoff.

## What Is Your Idea?

Vibe coding makes it easy to ship an AI app quickly, but founders still have to answer hard business questions before launch: what should we charge, what should we meter, and can the margin survive real usage?

Priceplain solves that planning step. A founder enters their app idea, customer, value metric, usage costs, fixed costs, conversion, growth and churn. The app generates pricing tiers, usage limits, overage rules, metering events, invoice-line assumptions, sensitivity checks and an exportable billing handoff.

The wedge is the moment before billing implementation. Priceplain helps AI builders avoid guessed unlimited plans and move from product idea to monetisable pricing logic.

## Selected Challenges And Tracks

Primary:

- Solvimon: Most Likely to Be a Successful Business.
- Codeplain: Best project built with Codeplain/spec-driven development.

Secondary:

- Vercel: deployed app with server-side AI/provider routes.
- FLock: optional Sovereign AI Review for governance, auditability and institutional-readiness framing.

Not submitted as primary tracks:

- Sui: Priceplain is not an on-chain Sui application.
- Bilt: Priceplain is not a mobile app built on bilt.me.
- BGA: Priceplain is not a trading, portfolio or market-strategy tool.

## Challenge Explanation

Priceplain incorporates the Solvimon challenge by focusing on commercial potential and pricing-to-billing readiness. The product addresses a clear founder problem: AI apps have variable costs, but many builders launch before understanding pricing, metering or margin risk. Priceplain creates usage-based and hybrid pricing assumptions, value metrics, meter events, invoice line items, credit policies, overages and a Solvimon-ready JSON handoff.

It incorporates the Codeplain challenge through spec-driven development. The repository includes `.plain` files for the product MVP, pricing-engine rules and acceptance tests. These specs describe the expected product behaviour, sponsor-fit requirements and demo acceptance criteria.

It also uses Vercel for the deployed app and server-side API routes. Claude refinement is available when an Anthropic key is configured, and provider status is checked without exposing secrets. The FLock-aligned Sovereign AI Review shows how pricing and AI-provider decisions could be reviewed for governance, auditability, lock-in and institutional procurement risk.

## Submission Details

Priceplain is a working web app for AI founders who need a first pricing model before implementing billing. The demo includes:

- founder intake for product, customer, value metric, usage costs, fixed costs, conversion, growth and churn;
- pricing generation for Free, Starter, Growth and Scale tiers;
- usage limits, overage rules, gross-margin checks and audit scoring;
- Solvimon Handoff with value metric, meter events, plans, invoice items, credit policies, implementation notes and exportable JSON;
- twelve-month revenue, COGS, paid-customer and gross-margin simulation;
- sensitivity tests for model-cost shock, usage spikes, conversion drops and churn rises;
- Startup Case showing target customer, problem, wedge, revenue path and differentiation;
- Submission Pack with judge summary, track coverage, demo script and report export;
- `.plain` product specs and acceptance tests for Codeplain review.

The process was to start from the business problem, then build a deterministic pricing engine, then add Solvimon-shaped handoff objects, then add judge-focused screens and supporting submission material. The project is deliberately honest about scope: it is a Solvimon-ready planning and handoff MVP, not a full production billing integration.

Key achievements:

- working deployed MVP;
- generated pricing tied to unit economics rather than arbitrary tiers;
- Solvimon-style metering and billing handoff;
- Codeplain-style `.plain` specs;
- presentation deck, video script and one-page judge summary;
- submission-safe documentation with clear guardrails.

## Link To Code

https://github.com/MasteraSnackin/Priceplain

## Live Demo Link

https://priceplain.vercel.app

## Link To Presentation

Use one of these:

- Local deck in repo: `docs/Priceplain_Canva_Deck.pptx`
- GitHub path: `https://github.com/MasteraSnackin/Priceplain/blob/master/docs/Priceplain_Canva_Deck.pptx`
- Canva link: add after uploading the deck to Canva.

## Link To Demo Video

Add the final video URL after recording/uploading.

Suggested script source: `docs/VIDEO_SCRIPT.md`

## Relevant Files And Documents

- `README.md` - project overview, setup, demo paths and screenshots.
- `docs/JUDGE_ONE_PAGER.md` - one-page judge summary.
- `docs/SUBMISSION_FORM_COPY.md` - copy-ready submission answers.
- `docs/RELEVANT_FILES_INDEX.md` - index of files to upload or reference.
- `docs/Priceplain_Canva_Deck.pptx` - Canva-importable judge deck.
- `docs/PITCH.md` - pitch pack, judge Q&A and demo flow.
- `docs/VIDEO_SCRIPT.md` - 3-minute Popcorn.co script.
- `docs/SOLVIMON_CHECKOUT_GUIDE.md` - optional Solvimon checkout path.
- `plain/product-mvp.plain` - product specification.
- `plain/pricing-engine.plain` - pricing-engine rules.
- `plain/acceptance-tests.plain` - acceptance scenarios.

## Short Pitch

Priceplain helps AI founders answer four questions before launch: what should I charge, what should I meter, can this make money, and how do I hand it off to billing?

## Overclaiming Guardrails

- Do not claim Priceplain is a full production Solvimon integration.
- Do not claim live payments are processed by Priceplain.
- Do not claim OpenAI uses or validated Priceplain.
- Do not claim the pricing model is market-validated yet.
- Say “Solvimon-ready handoff” unless a tested Solvimon checkout link is available.
