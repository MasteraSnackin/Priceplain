# Researcher Report

## Research Question

Does Priceplain have an evidence-backed sponsor story for the current MVP, and what is the smallest next experiment before submission?

## Sources Checked

Checked on 20 June 2026.

- Solvimon home: https://www.solvimon.com/
- Solvimon for AI: https://www.solvimon.com/forai
- Solvimon usage metering: https://www.solvimon.com/usage-metering
- Codeplain: https://www.codeplain.ai/
- FLock introduction: https://docs.flock.io/
- FLock API Platform: https://docs.flock.io/flock-products/api-platform
- FLock API Endpoint: https://docs.flock.io/flock-products/api-platform/api-endpoint
- Vercel AI SDK structured data docs: https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data
- Anthropic Claude models overview: https://platform.claude.com/docs/en/about-claude/models/overview

## Findings

- Fact: Solvimon publicly positions around metering, billing, quote-to-cash, payments, revenue operations, usage-based pricing, hybrid pricing, credits, seats and enterprise contracts. Priceplain's pricing tiers, overages, metering events, invoice assumptions and revenue simulation match this sponsor story.
- Fact: Solvimon specifically describes AI-scale billing with credits, usage, seats and enterprise contracts in one system. Priceplain should keep the Solvimon pitch focused on "pricing before billing implementation" rather than claiming a direct Solvimon integration.
- Fact: Codeplain describes spec-driven code generation from plain-language specifications and shows `.plain` examples. Priceplain has `.plain` files for product scope, pricing behaviour and acceptance tests, which supports the Codeplain narrative.
- Unknown: the exact hackathon-required Codeplain config format was not found in the public Codeplain page checked. The repository should not invent a config file without sponsor or platform confirmation.
- Fact: FLock documents decentralised AI, community stewardship, privacy/data-sovereignty positioning, an API Platform, and an OpenAI-compatible endpoint at `https://api.flock.io/v1`. Priceplain's `/api/sovereign-review` route and governance review are directionally aligned.
- Inference: FLock is a credible secondary track only if pitched as sovereign governance review and optional FLock-compatible inference. It is weaker than the Solvimon and Codeplain fit because the product is fundamentally a pricing tool, not a public-sector AI system.
- Fact: FLock's API docs use the `x-litellm-api-key` header and list `qwen3-30b-a3b-instruct-2507` in the example request. The current implementation uses both.
- Fact: Anthropic's current model overview lists `claude-sonnet-4-6` as a current Claude API ID. The repository's default Claude model is current as of this check.
- Fact: The current Vercel AI SDK structured-data documentation highlights schema-constrained object output. The installed dependency still builds successfully with `generateObject`, but this should be rechecked before a longer-lived production version.

## Options

- Option A: Keep the product focused on Solvimon and Codeplain, with FLock and Vercel as secondary evidence.
  - Trade-off: strongest pitch coherence, least implementation risk, but fewer bounty claims.
- Option B: Add a deeper FLock workflow such as saved audit records, model-routing policy, or public-sector procurement mode.
  - Trade-off: improves FLock fit, but risks diluting the Solvimon business story before judging.
- Option C: Add real Solvimon or Codeplain CLI/platform integration during the hackathon.
  - Trade-off: strongest sponsor proof if credentials/docs are available, but high risk without mentor confirmation.

## Recommendation

Choose Option A for the current submission. Present Priceplain as:

- Primary: Solvimon business-potential product for AI app pricing, metering and monetisation design.
- Primary: Codeplain/spec-driven build with `.plain` product specs and acceptance tests.
- Secondary: Vercel-ready AI app with server-side Claude refinement.
- Secondary: FLock-aligned sovereign AI governance review using optional OpenAI-compatible FLock inference.

Do not claim Sui, Bilt or BGA coverage in the final pitch.

## Unknowns

- Exact Codeplain config requirements for this hackathon submission.
- Whether judges expect actual Codeplain-generated commits or only `.plain` files and configs.
- Whether FLock judging requires a live API call or accepts a deterministic governance workflow plus optional provider path.
- Whether a Vercel deployment URL will be available before final submission.
- Whether live Claude and FLock credentials will be available for a success-path demo.

## Next Experiment

Ask a Codeplain mentor or sponsor for the required config/submission format, then add only the confirmed files. If provider keys are available, run one live Claude refinement and one live FLock refinement before the final demo; otherwise keep the deterministic fallback as the shown path.
