import type {
  AuditSignal,
  BillingImplementationExport,
  CostDriver,
  Currency,
  MeteringEvent,
  PricingAnalysis,
  PricingInputs,
  PricingTier,
  SensitivityScenario,
  SimulationMonth,
  SolvimonImportPreview,
} from "./types";

const nicePrices = [
  5, 9, 12, 15, 19, 24, 29, 39, 49, 59, 79, 99, 129, 149, 199, 249, 299, 399,
  499, 749, 999, 1499, 1999, 2999,
];

export function formatCurrency(value: number, currency: Currency): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: value < 10 ? 2 : 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatCompactCurrency(value: number, currency: Currency): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number.isFinite(value) ? value : 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

function niceMonthlyPrice(raw: number): number {
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  const match = nicePrices.find((price) => price >= raw);
  if (match) return match;
  return Math.ceil(raw / 500) * 500 - 1;
}

function niceRate(raw: number): number {
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  if (raw < 0.05) return Number((Math.ceil(raw * 1000) / 1000).toFixed(3));
  if (raw < 1) return Number((Math.ceil(raw * 100) / 100).toFixed(2));
  return Number((Math.ceil(raw * 10) / 10).toFixed(1));
}

function pluralise(label: string): string {
  const clean = label.trim();
  if (!clean) return "units";
  if (clean.endsWith("s")) return clean;
  return `${clean}s`;
}

function driverCost(driver: CostDriver): number {
  return (
    Math.max(0, driver.costPerUnit) *
    Math.max(0, driver.unitsPerCustomerMonth)
  );
}

function tierMargin(price: number, cogs: number): number {
  if (price <= 0) return -100;
  return ((price - cogs) / price) * 100;
}

function buildTier(
  id: string,
  name: string,
  description: string,
  monthlyPrice: number,
  includedUnits: number,
  overageRate: number,
  marginalCostPerValueUnit: number,
  fixedCostShare: number,
  seatPolicy: string,
  features: string[],
  badge?: string,
): PricingTier {
  const monthlyCogs = includedUnits * marginalCostPerValueUnit + fixedCostShare;
  return {
    id,
    name,
    description,
    monthlyPrice,
    includedUnits,
    overageRate,
    monthlyCogs,
    grossMargin: tierMargin(monthlyPrice, monthlyCogs),
    seatPolicy,
    features,
    badge,
  };
}

function buildMeteringEvents(inputs: PricingInputs): MeteringEvent[] {
  const metric = inputs.valueMetric.trim().toLowerCase() || "ai action";
  const baseProperties = ["customer_id", "workspace_id", "occurred_at"];

  const driverEvents = inputs.costDrivers
    .filter((driver) => driver.metered)
    .slice(0, 4)
    .map((driver) => ({
      name: `${driver.id}.consumed`,
      trigger: `${driver.label} is used`,
      properties: [...baseProperties, "quantity", "unit_cost", "model_or_vendor"],
      billingUse: `Attribute cost to ${driver.unitLabel} usage.`,
    }));

  return [
    {
      name: `${metric.replace(/\s+/g, "_")}.completed`,
      trigger: `A billable ${metric} completes successfully`,
      properties: [...baseProperties, "quantity", "tier_id", "source"],
      billingUse: "Primary usage meter for included allowances and overages.",
    },
    {
      name: "credits.debited",
      trigger: "A customer consumes prepaid or bundled credits",
      properties: [...baseProperties, "credits", "balance_after", "reason"],
      billingUse: "Supports prepaid credit pools and free-tier controls.",
    },
    ...driverEvents,
    {
      name: "invoice.line_item.created",
      trigger: "Billing period closes",
      properties: ["customer_id", "plan_id", "included_units", "overage_units"],
      billingUse: "Turns usage into visible invoice lines.",
    },
  ];
}

function buildAuditSignals(
  inputs: PricingInputs,
  tiers: PricingTier[],
  variableCostPerCustomer: number,
  loadedCostPerCustomer: number,
): AuditSignal[] {
  const starter = tiers.find((tier) => tier.id === "starter");
  const free = tiers.find((tier) => tier.id === "free");
  const meteredDrivers = inputs.costDrivers.filter((driver) => driver.metered);
  const target = inputs.grossMarginTarget;
  const freeCost = free?.monthlyCogs ?? 0;

  return [
    {
      label: "Gross margin",
      status:
        starter && starter.grossMargin >= target
          ? "Good"
          : starter && starter.grossMargin >= target - 10
            ? "Watch"
            : "Risk",
      detail:
        starter && starter.grossMargin >= target
          ? `Starter tier clears the ${target}% target.`
          : `Starter tier is below the ${target}% target; raise price, lower included usage, or move heavy actions to overage.`,
    },
    {
      label: "Free-tier exposure",
      status: freeCost < loadedCostPerCustomer * 0.25 ? "Good" : freeCost < 5 ? "Watch" : "Risk",
      detail:
        freeCost < loadedCostPerCustomer * 0.25
          ? "Free usage is capped tightly enough for a launch test."
          : "Free users can create meaningful COGS; add verification, credits, or lower hard caps.",
    },
    {
      label: "Metering clarity",
      status:
        meteredDrivers.length >= Math.min(2, inputs.costDrivers.length)
          ? "Good"
          : meteredDrivers.length > 0
            ? "Watch"
            : "Risk",
      detail:
        meteredDrivers.length > 0
          ? `${meteredDrivers.length} cost driver${meteredDrivers.length === 1 ? "" : "s"} mapped to billable events.`
          : "No cost drivers are marked as metered; billing will be hard to explain.",
    },
    {
      label: "Pricing model fit",
      status: variableCostPerCustomer > 3 || inputs.billingMotion !== "Self-serve" ? "Good" : "Watch",
      detail:
        variableCostPerCustomer > 3
          ? "Usage-based pricing is justified because each customer creates visible variable cost."
          : "Variable cost is modest; keep a simple seat-plus-usage model to avoid confusing buyers.",
    },
  ];
}

function auditScore(signals: AuditSignal[]): number {
  const penalty = signals.reduce((total, signal) => {
    if (signal.status === "Risk") return total + 24;
    if (signal.status === "Watch") return total + 10;
    return total;
  }, 0);
  return clamp(100 - penalty, 0, 100);
}

function simulationDistribution(motion: PricingInputs["billingMotion"]): [number, number, number] {
  if (motion === "Enterprise") return [0.25, 0.4, 0.35];
  if (motion === "Sales-assisted") return [0.45, 0.38, 0.17];
  return [0.68, 0.25, 0.07];
}

function buildSimulation(
  inputs: PricingInputs,
  tiers: PricingTier[],
  marginalCostPerValueUnit: number,
  freeUnits: number,
): SimulationMonth[] {
  const paidTiers = tiers.filter((tier) => tier.monthlyPrice > 0);
  const [starterMix, growthMix, scaleMix] = simulationDistribution(inputs.billingMotion);
  const mix = [starterMix, growthMix, scaleMix];
  const weightedPrice = paidTiers.reduce(
    (sum, tier, index) => sum + tier.monthlyPrice * (mix[index] ?? 0),
    0,
  );
  const weightedCogs = paidTiers.reduce(
    (sum, tier, index) => sum + tier.monthlyCogs * (mix[index] ?? 0),
    0,
  );

  const months: SimulationMonth[] = [];
  let totalCustomers = Math.max(1, inputs.activeCustomers);
  const conversion = clamp(inputs.paidConversion / 100, 0, 0.95);
  const growth = clamp(inputs.monthlyGrowth / 100, -0.5, 2);
  const churn = clamp(inputs.monthlyChurn / 100, 0, 0.95);
  const freeCustomerCost = freeUnits * marginalCostPerValueUnit;

  for (let month = 1; month <= 12; month += 1) {
    const paidCustomers = Math.round(totalCustomers * conversion);
    const freeCustomers = Math.max(0, Math.round(totalCustomers) - paidCustomers);
    const revenue = paidCustomers * weightedPrice;
    const cogs =
      paidCustomers * weightedCogs +
      freeCustomers * freeCustomerCost +
      Math.max(0, inputs.fixedMonthlyCost);
    const netContribution = revenue - cogs;

    months.push({
      month,
      totalCustomers: Math.round(totalCustomers),
      paidCustomers,
      revenue,
      cogs,
      grossMargin: revenue > 0 ? (netContribution / revenue) * 100 : -100,
      netContribution,
      breakEven: netContribution >= 0,
    });

    totalCustomers = Math.max(1, totalCustomers * (1 + growth - churn));
  }

  return months;
}

function month12(analysis: PricingAnalysis): SimulationMonth {
  return analysis.simulation[analysis.simulation.length - 1];
}

function firstBreakEvenMonth(analysis: PricingAnalysis): number | null {
  return analysis.simulation.find((month) => month.breakEven)?.month ?? null;
}

function scaleCostDrivers(inputs: PricingInputs, multiplier: number): PricingInputs {
  return {
    ...inputs,
    costDrivers: inputs.costDrivers.map((driver) => ({
      ...driver,
      costPerUnit: Number((driver.costPerUnit * multiplier).toFixed(4)),
    })),
  };
}

function scaleUsage(inputs: PricingInputs, multiplier: number): PricingInputs {
  return {
    ...inputs,
    monthlyValueUnitsPerCustomer: Math.round(inputs.monthlyValueUnitsPerCustomer * multiplier),
    costDrivers: inputs.costDrivers.map((driver) => ({
      ...driver,
      unitsPerCustomerMonth: Math.round(driver.unitsPerCustomerMonth * multiplier),
    })),
  };
}

function buildSensitivityScenario(
  id: string,
  label: string,
  assumptionChange: string,
  base: PricingAnalysis,
  nextInputs: PricingInputs,
): SensitivityScenario {
  const next = analysePricing(nextInputs);
  const baseMonth = month12(base);
  const nextMonth = month12(next);

  return {
    id,
    label,
    assumptionChange,
    month12Revenue: nextMonth.revenue,
    revenueDelta: nextMonth.revenue - baseMonth.revenue,
    month12Cogs: nextMonth.cogs,
    grossMargin: nextMonth.grossMargin,
    grossMarginDelta: nextMonth.grossMargin - baseMonth.grossMargin,
    auditScore: next.auditScore,
    breakEvenMonth: firstBreakEvenMonth(next),
  };
}

export function buildSensitivityScenarios(inputs: PricingInputs): SensitivityScenario[] {
  const base = analysePricing(inputs);

  return [
    buildSensitivityScenario(
      "model-cost-shock",
      "Model cost shock",
      "All cost-driver unit prices increase by 100%.",
      base,
      scaleCostDrivers(inputs, 2),
    ),
    buildSensitivityScenario(
      "usage-spike",
      "Usage spike",
      "Value units and driver usage increase by 50%.",
      base,
      scaleUsage(inputs, 1.5),
    ),
    buildSensitivityScenario(
      "conversion-drop",
      "Conversion drop",
      "Paid conversion falls by 30%.",
      base,
      {
        ...inputs,
        paidConversion: Number((inputs.paidConversion * 0.7).toFixed(1)),
      },
    ),
    buildSensitivityScenario(
      "churn-rise",
      "Churn rise",
      "Monthly churn increases by 50%.",
      base,
      {
        ...inputs,
        monthlyChurn: Number((inputs.monthlyChurn * 1.5).toFixed(1)),
      },
    ),
  ];
}

export function buildBillingImplementationExport(
  inputs: PricingInputs,
  analysis: PricingAnalysis,
): BillingImplementationExport {
  const safeMetric = inputs.valueMetric.trim() || "AI action";
  const primaryMeter = `${safeMetric.toLowerCase().replace(/\s+/g, "_")}.completed`;
  const paidTierIds = analysis.tiers
    .filter((tier) => tier.monthlyPrice > 0)
    .map((tier) => tier.id);

  return {
    schemaVersion: "priceplain.billing.v1",
    currency: inputs.currency,
    valueMetric: safeMetric,
    pricingModel: analysis.pricingModel,
    primaryMeter,
    tierRules: analysis.tiers.map((tier) => ({
      tierId: tier.id,
      name: tier.name,
      billingMode: tier.monthlyPrice > 0 ? "subscription_plus_usage" : "free_cap",
      baseMonthlyPrice: tier.monthlyPrice,
      includedUnits: tier.includedUnits,
      overageRate: tier.overageRate,
      seatPolicy: tier.seatPolicy,
    })),
    invoiceLineItems: [
      ...analysis.tiers
        .filter((tier) => tier.monthlyPrice > 0)
        .map((tier) => ({
          code: `${tier.id}_base_subscription`,
          description: `${tier.name} recurring base subscription.`,
          quantityMetric: "billing_period",
          unitPrice: tier.monthlyPrice,
          tierIds: [tier.id],
        })),
      {
        code: "included_usage_allowance",
        description: `Included ${safeMetric} allowance shown separately for transparency.`,
        quantityMetric: safeMetric,
        unitPrice: 0,
        tierIds: analysis.tiers.map((tier) => tier.id),
      },
      ...analysis.tiers
        .filter((tier) => tier.monthlyPrice > 0)
        .map((tier) => ({
          code: `${tier.id}_usage_overage`,
          description: `Extra ${safeMetric} usage above the ${tier.name} allowance.`,
          quantityMetric: safeMetric,
          unitPrice: tier.overageRate,
          tierIds: [tier.id],
        })),
      {
        code: "credit_debit",
        description: "Prepaid, free-tier or bundled credits consumed before invoice close.",
        quantityMetric: "credit",
        unitPrice: 0,
        tierIds: analysis.tiers.map((tier) => tier.id),
      },
    ],
    meteringEvents: analysis.meteringEvents,
    creditPolicy: [
      "Free tier has a hard usage cap and no overage billing.",
      "Paid tiers debit included usage before applying overage charges.",
      "Credits should record opening balance, debit reason and balance after each event.",
      "Overages should be visible before invoice finalisation.",
    ],
    implementationNotes: [
      `Emit ${primaryMeter} only after customer-visible value is delivered.`,
      "Keep raw provider-cost events separate from customer-facing billable usage.",
      "Use invoice line items for base subscription, included allowance, overage usage and credits.",
      "Keep pricing-plan changes versioned so historical invoices can be explained.",
    ],
  };
}

export function buildSolvimonImportPreview(
  inputs: PricingInputs,
  billingExport: BillingImplementationExport,
): SolvimonImportPreview {
  return {
    schema_version: "priceplain.solvimon_preview.v1",
    source_schema: billingExport.schemaVersion,
    generated_by: "priceplain",
    product: {
      name: inputs.appName || "Untitled AI app",
      currency: billingExport.currency,
      value_metric: billingExport.valueMetric,
      pricing_model: billingExport.pricingModel,
    },
    meters: billingExport.meteringEvents.map((event) => ({
      code: event.name,
      event_name: event.name,
      billing_use: event.billingUse,
      aggregation: event.name === billingExport.primaryMeter ? "sum_quantity" : "event_count",
      properties: event.properties,
    })),
    plans: billingExport.tierRules.map((tier) => ({
      plan_id: tier.tierId,
      name: tier.name,
      billing_mode: tier.billingMode,
      base_monthly_price: tier.baseMonthlyPrice,
      included_units: tier.includedUnits,
      overage_rate: tier.overageRate,
      seat_policy: tier.seatPolicy,
    })),
    invoice_items: billingExport.invoiceLineItems.map((item) => ({
      code: item.code,
      description: item.description,
      quantity_metric: item.quantityMetric,
      unit_price: item.unitPrice,
      tier_ids: item.tierIds,
    })),
    credit_policies: billingExport.creditPolicy,
    implementation_notes: billingExport.implementationNotes,
  };
}

export function analysePricing(inputs: PricingInputs): PricingAnalysis {
  const activeCustomers = Math.max(1, inputs.activeCustomers);
  const valueUnits = Math.max(1, inputs.monthlyValueUnitsPerCustomer);
  const variableCostPerCustomer = inputs.costDrivers.reduce(
    (total, driver) => total + driverCost(driver),
    0,
  );
  const fixedCostShare = Math.max(0, inputs.fixedMonthlyCost) / activeCustomers;
  const loadedCostPerCustomer = variableCostPerCustomer + fixedCostShare;
  const targetMargin = clamp(inputs.grossMarginTarget / 100, 0.15, 0.9);
  const basePaidPrice = loadedCostPerCustomer / Math.max(0.1, 1 - targetMargin);
  const marginalCostPerValueUnit =
    variableCostPerCustomer > 0 ? variableCostPerCustomer / valueUnits : 0.01;
  const recommendedOverageRate = niceRate(
    marginalCostPerValueUnit / Math.max(0.08, 1 - Math.min(0.88, targetMargin + 0.08)),
  );

  const freeUnits = Math.max(3, Math.round(valueUnits * 0.15));
  const starterUnits = Math.max(freeUnits + 1, Math.round(valueUnits));
  const growthUnits = Math.max(starterUnits + 1, Math.round(valueUnits * 3));
  const scaleUnits = Math.max(growthUnits + 1, Math.round(valueUnits * 8));

  const starterPrice = niceMonthlyPrice(Math.max(9, basePaidPrice * 1.2));
  const growthPrice = niceMonthlyPrice(Math.max(starterPrice * 2.3, basePaidPrice * 3.1));
  const scalePrice = niceMonthlyPrice(Math.max(growthPrice * 2.4, basePaidPrice * 7.2));

  const unitLabel = pluralise(inputs.valueMetric);
  const tiers = [
    buildTier(
      "free",
      "Free",
      "A controlled trial for low-cost discovery.",
      0,
      freeUnits,
      0,
      marginalCostPerValueUnit,
      0,
      "1 workspace",
      [
        `${freeUnits} ${unitLabel} included`,
        "Hard cap, no overage",
        "Community support",
      ],
    ),
    buildTier(
      "starter",
      "Starter",
      "For individuals and small teams reaching regular usage.",
      starterPrice,
      starterUnits,
      recommendedOverageRate,
      marginalCostPerValueUnit,
      fixedCostShare,
      "Up to 3 seats",
      [
        `${starterUnits} ${unitLabel} included`,
        `${formatCurrency(recommendedOverageRate, inputs.currency)} per extra ${inputs.valueMetric}`,
        "Basic usage alerts",
      ],
      "Launch pick",
    ),
    buildTier(
      "growth",
      "Growth",
      "For teams with predictable recurring usage.",
      growthPrice,
      growthUnits,
      niceRate(recommendedOverageRate * 0.82),
      marginalCostPerValueUnit,
      fixedCostShare,
      "Up to 15 seats",
      [
        `${growthUnits} ${unitLabel} included`,
        "Usage alerts and pooled credits",
        "Priority support",
      ],
      "Best margin",
    ),
    buildTier(
      "scale",
      "Scale",
      "For businesses that need committed volume and billing control.",
      scalePrice,
      scaleUnits,
      niceRate(recommendedOverageRate * 0.68),
      marginalCostPerValueUnit,
      fixedCostShare,
      "Unlimited seats",
      [
        `${scaleUnits} ${unitLabel} included`,
        "Annual commit option",
        "Invoice-ready usage exports",
      ],
    ),
  ];

  const meteringEvents = buildMeteringEvents(inputs);
  const auditSignals = buildAuditSignals(
    inputs,
    tiers,
    variableCostPerCustomer,
    loadedCostPerCustomer,
  );
  const simulation = buildSimulation(inputs, tiers, marginalCostPerValueUnit, freeUnits);
  const pricingModel =
    variableCostPerCustomer > 3 || inputs.billingMotion !== "Self-serve"
      ? "Hybrid: base subscription plus usage overages"
      : "Simple subscription with usage guardrails";

  return {
    variableCostPerCustomer,
    loadedCostPerCustomer,
    marginalCostPerValueUnit,
    recommendedOverageRate,
    pricingModel,
    tiers,
    meteringEvents,
    simulation,
    auditScore: auditScore(auditSignals),
    auditSignals,
    pricingPage: {
      headline: `${inputs.appName || "Your app"} pricing that scales with ${pluralise(inputs.valueMetric)}`,
      subheading: `Start with a controlled free tier, then move serious ${inputs.targetCustomer.toLowerCase()} into paid plans tied to real usage costs.`,
      faq: [
        `What counts as a ${inputs.valueMetric}? A successful customer-visible unit of value, not every internal API call.`,
        "What happens after included usage? Paid tiers move to transparent overage pricing instead of silent throttling.",
        "Why not unlimited AI usage? The model protects margin by linking price to variable compute and storage cost.",
      ],
    },
    billingSummary: [
      `${pricingModel}.`,
      `Primary meter: ${inputs.valueMetric}.completed.`,
      `Recommended overage: ${formatCurrency(recommendedOverageRate, inputs.currency)} per extra ${inputs.valueMetric}.`,
      `Loaded cost per active customer: ${formatCurrency(loadedCostPerCustomer, inputs.currency)} per month.`,
      "Invoice lines should separate base subscription, included usage, overage usage, and prepaid credits.",
    ],
  };
}
