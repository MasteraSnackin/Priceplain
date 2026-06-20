import type { PricingAnalysis, PricingInputs, SovereignReview, SovereignSignal } from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

function textIncludes(text: string, words: string[]): boolean {
  const lower = text.toLowerCase();
  return words.some((word) => lower.includes(word));
}

function signal(
  label: string,
  score: number,
  readyDetail: string,
  controlDetail: string,
  riskDetail: string,
): SovereignSignal {
  const clamped = clamp(Math.round(score), 0, 100);
  return {
    label,
    score: clamped,
    status: clamped >= 75 ? "Ready" : clamped >= 50 ? "Needs control" : "High risk",
    detail: clamped >= 75 ? readyDetail : clamped >= 50 ? controlDetail : riskDetail,
  };
}

export function assessSovereignty(
  inputs: PricingInputs,
  analysis: PricingAnalysis,
): SovereignReview {
  const context = `${inputs.productSummary} ${inputs.targetCustomer} ${inputs.valueMetric}`;
  const publicSector = textIncludes(context, [
    "public",
    "government",
    "council",
    "nhs",
    "health",
    "citizen",
    "school",
    "university",
    "institution",
  ]);
  const regulated = textIncludes(context, [
    "finance",
    "legal",
    "health",
    "insurance",
    "compliance",
    "procurement",
    "audit",
  ]);
  const heavyAiCost = analysis.variableCostPerCustomer >= 5;
  const meteredCoverage =
    inputs.costDrivers.filter((driver) => driver.metered).length /
    Math.max(1, inputs.costDrivers.length);
  const auditPenalty = analysis.auditSignals.filter((item) => item.status === "Risk").length * 12;

  const signals = [
    signal(
      "Commercial transparency",
      analysis.auditScore - auditPenalty,
      "Pricing, overages and billing assumptions are visible enough for institutional review.",
      "Pricing is usable, but the buyer would need stronger written rationale and sensitivity analysis.",
      "Pricing risk is too opaque for a regulated buyer without more evidence.",
    ),
    signal(
      "Usage auditability",
      meteredCoverage * 100,
      "Core cost drivers are mapped to metering events.",
      "Some cost drivers are metered, but procurement would ask for fuller event coverage.",
      "The system does not yet expose enough events for audit or dispute handling.",
    ),
    signal(
      "Data sovereignty posture",
      publicSector || regulated ? 58 : 72,
      "The product can be positioned for lower-risk commercial users with clear data boundaries.",
      "Institutional use would require a named model-hosting, data-residency and retention policy.",
      "The app needs a stronger data ownership and model-inference story before sovereign deployment.",
    ),
    signal(
      "Vendor lock-in risk",
      heavyAiCost ? 52 : 68,
      "Usage costs are modest enough to switch providers or negotiate model routes.",
      "The buyer should require model portability, exportable logs and fallback inference paths.",
      "The economics appear heavily dependent on a single inference supply chain.",
    ),
    signal(
      "Public-sector suitability",
      publicSector ? 62 : 48,
      "The use case has a plausible institutional buyer if governance controls are added.",
      "The app needs accessibility, procurement, DPIA and accountability evidence before rollout.",
      "The current story is founder-first and needs reframing for UK public-sector adoption.",
    ),
  ];

  const overallScore = Math.round(
    signals.reduce((total, item) => total + item.score, 0) / signals.length,
  );

  return {
    overallScore,
    verdict:
      overallScore >= 75
        ? "Sovereign-ready with procurement evidence."
        : overallScore >= 55
          ? "Promising, but needs governance controls before institutional use."
          : "Not yet suitable for sovereign or regulated deployment.",
    signals,
    procurementQuestions: [
      "Where are prompts, customer data and generated recommendations processed and stored?",
      "Can the buyer export usage logs, pricing assumptions and model outputs for audit?",
      "Which cost drivers are billable events, and how can invoice lines be disputed?",
      "What fallback model or provider is available if the primary inference route changes?",
      "Who owns fine-tuned behaviour, evaluation data and commercial decision history?",
    ],
    governanceActions: [
      "Add a data-retention policy for prompts, cost inputs and generated pricing plans.",
      "Keep immutable audit logs for pricing recommendations and metering-event changes.",
      "Separate commercially sensitive customer data from model prompts where possible.",
      "Document human approval for pricing changes before they reach customers or invoices.",
    ],
    flockPath: [
      "Use FLock-compatible inference for the sovereign review workflow when institutional data cannot leave controlled infrastructure.",
      "Route model evaluation through a decentralised or privacy-preserving provider policy instead of a single closed vendor path.",
      "Log model, prompt version, timestamp and governance output for institutional accountability.",
    ],
    institutionFit: [
      "Local councils comparing AI service vendors on price transparency.",
      "Universities procuring AI tools while protecting research or student data.",
      "NHS-adjacent suppliers evaluating usage-based AI costs before procurement.",
      "Regulated startups needing evidence that commercial AI decisions are auditable.",
    ],
  };
}
