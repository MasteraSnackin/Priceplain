# Solvimon Checkout Page Vibe-Coding Guide

Run date: 20 June 2026

This guide explains how to create a test checkout page that accepts payments using Solvimon. It is an optional next step for the Priceplain demo: the MVP currently creates a Solvimon-ready pricing and billing handoff, not a live Solvimon checkout integration.

## What This Proves

- A Priceplain pricing plan can be turned into a hosted checkout flow.
- Solvimon can create plans, meters and checkout links through its test MCP server.
- The demo can move from pricing strategy to a customer-facing payment page without hand-writing billing API calls.

## Prerequisites

- A Solvimon test sandbox.
- A Solvimon test API key.
- Claude Code or Claude Desktop.
- Solvimon MCP server configured with the test API key.
- A pricing idea, for example `Free`, `Starter`, `Growth` and `Scale`, or a `good / better / best` structure.

Do not commit API keys to this repository, paste them into chat, or put them in browser-visible code.

## Steps

1. Create a Solvimon sandbox:
   [https://test.desk.solvimon.com/sandboxes/create](https://test.desk.solvimon.com/sandboxes/create)

2. Activate the sandbox using the link sent to your email.

3. Create an API key in the sandbox:
   `https://test.desk.solvimon.com/{platform_id}/settings/api-keys`

   Replace `{platform_id}` with the platform id shown in your Solvimon dashboard URL.

4. Install the Solvimon MCP server with the API key.

   Claude Code:

   ```bash
   claude mcp add solvimon-test --transport http https://test.mcp.solvimon.com --header "X-API-KEY:<your-api-key>"
   ```

   Claude Desktop:

   Add the Solvimon MCP entry in Claude Desktop settings using the official MCP instructions:
   [https://docs.solvimon.com/mcp-server/mcp-server](https://docs.solvimon.com/mcp-server/mcp-server)

5. Prompt the agent to create pricing and checkout.

   Example prompt:

   ```text
   Create a good / better / best pricing plan for an AI app. Include a hosted checkout flow using Adyen. Use Solvimon test mode. Create the required meters, pricing plans and checkout links.
   ```

   Priceplain-specific prompt:

   ```text
   Use this Priceplain handoff to create a Solvimon checkout flow:
   - value metric: processed meeting
   - plans: Free, Starter, Growth, Scale
   - paid plan structure: base subscription plus usage overages
   - invoice items: base subscription, included usage, overage usage and credits
   Create a test checkout link for the paid plan that best fits a small team.
   ```

6. Open the checkout pages area:
   `https://test.desk.solvimon.com/{platform_id}/checkout-pages`

7. Use the button in the top-right corner of the Solvimon checkout page to get the customer-facing checkout link.

8. Test checkout with a test card.

   Example test card:

   ```text
   Card number: 4111 1111 1111 1111
   CVC: 737
   Expiry: any valid future expiry
   ```

## Useful MCP Tools

The Solvimon MCP documentation lists tools that are especially relevant for this workflow:

- `get_solvimon_account` checks the API key and available billing entities.
- `create_meter_setup` creates a meter, meter value and meter value calculation.
- `create_hybrid_plan` creates a plan with fixed and usage-based line items.
- `create_checkout_link` generates a hosted checkout URL for an existing pricing plan version.
- `solvimon_api_call` can call Solvimon API paths that are not covered by a dedicated MCP tool.

## Demo Guardrails

- Say “test checkout page”, not “production payments”.
- Say “Solvimon-ready handoff” unless the live checkout has been created and tested.
- Do not claim Priceplain itself stores payment details.
- Do not use real card data.
- Keep the main bounty story focused on business potential: the checkout flow supports the path from pricing plan to monetisation, but Solvimon’s bounty does not require a live Solvimon integration.

## Suggested Judge Line

Priceplain designs the pricing model, Solvimon can turn that model into a checkout page, and the business value is that AI founders can go from rough usage costs to a monetisable plan without guessing.
