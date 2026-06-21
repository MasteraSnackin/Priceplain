# Priceplain Judge One-Pager

## One-Line Summary

Priceplain is the planning layer before AI founders implement usage-based billing.

## Problem

AI apps are easy to build with modern agents, but pricing them is still difficult. Founders often guess a pricing table before they know their value metric, usage costs, free-tier exposure, overage policy or gross-margin risk. For AI-native apps, that can turn a good demo into a bad business.

## Solution

Priceplain lets a founder describe an AI app, enter rough usage and growth assumptions, and generate:

- Free, Starter, Growth and Scale pricing tiers;
- usage limits and overage rules;
- metering events for billing and analytics;
- invoice-line assumptions, credits and implementation notes;
- a twelve-month revenue and COGS simulation;
- sensitivity checks for cost, usage, conversion and churn risk;
- a Solvimon-ready JSON handoff.

## Target Customer

The first customer is an indie or early-stage AI SaaS founder building on tools such as Vercel, Stripe, Solvimon or model APIs. They are close to launch, have rough usage costs, but do not yet know how to charge or meter the product.

## Why Someone Wants It

Wrong AI pricing is expensive. If a founder launches with generous unlimited usage, high model costs can quietly erase margin. Priceplain helps them test the pricing model before they wire billing, publish a pricing page or pitch investors.

## How It Makes Money

Initial revenue path:

- free pricing audit to attract founders;
- paid saved workspaces and export reports;
- paid pricing benchmark templates for common AI app categories;
- implementation handoff support for Solvimon or other billing platforms;
- team plans for product, finance and engineering collaboration.

## Why It Is Different

Priceplain is not a billing system and not a generic AI prompt. It connects value metrics, usage costs, tiers, overages, revenue simulation, margin risk and billing objects in one workflow. The useful output is not just “suggested prices”; it is a pricing-to-billing plan a founder can inspect, defend and hand to implementation.

## Sponsor Fit

Solvimon:

- usage-based and hybrid pricing;
- value metrics, meter events and invoice lines;
- credits, overages and billing handoff objects;
- optional checkout guide for creating a test Solvimon checkout page.

Codeplain:

- `.plain` specs for product behaviour, pricing rules and acceptance tests;
- specification-driven project structure;
- judge-readable behaviour and test intent.

Vercel:

- deployed web app;
- server-side API routes for Claude refinement and provider readiness.

FLock:

- optional Sovereign AI Review for governance, auditability, data ownership and institutional procurement questions.

## Demo Path

1. Open `https://priceplain.vercel.app`.
2. Turn on Demo mode.
3. Show Pricing: cost assumptions, tiers, audit score and loaded cost.
4. Show Solvimon Handoff: value metric, meter events, invoice items and JSON export.
5. Show Revenue Simulation: month-12 revenue, COGS, margin and sensitivity checks.
6. Show Startup Case: customer, problem, wedge and revenue path.
7. Show Submission Pack: track coverage, demo script and report export.

## What Is Built

- Working React/Vite application.
- Deterministic pricing engine.
- Solvimon-shaped handoff generation.
- Revenue simulation and sensitivity modelling.
- Optional Claude refinement with server-side key handling.
- Optional FLock-aligned sovereign review.
- `.plain` specs and acceptance tests.
- README, pitch pack, slide deck, video script and submission documents.

## What Is Not Built Yet

- Production payment collection.
- Full live Solvimon API integration.
- Customer accounts and saved team workspaces.
- Market-validated pricing benchmarks.

## Next Steps

- Create a live Solvimon checkout adapter from the exported handoff JSON.
- Run interviews with AI founders who recently launched pricing pages.
- Add saved workspaces, collaboration and pricing-decision history.
- Add benchmark presets for common AI app categories.
- Turn the Submission Pack into a shareable investor/customer report.
