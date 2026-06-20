import { demoPresets } from "../src/demoData";
import {
  analysePricing,
  buildBillingImplementationExport,
  buildSensitivityScenarios,
  buildSolvimonImportPreview,
} from "../src/pricingEngine";
import { assessSovereignty } from "../src/sovereignReview";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

for (const preset of demoPresets) {
  const analysis = analysePricing(preset.inputs);
  const billingExport = buildBillingImplementationExport(preset.inputs, analysis);
  const solvimonPreview = buildSolvimonImportPreview(preset.inputs, billingExport);
  const sensitivity = buildSensitivityScenarios(preset.inputs);
  const review = assessSovereignty(preset.inputs, analysis);
  const month12 = analysis.simulation[analysis.simulation.length - 1];
  const costShock = sensitivity.find((scenario) => scenario.id === "model-cost-shock");

  assert(analysis.tiers.length >= 4, `${preset.id}: expected at least four tiers`);
  assert(
    analysis.tiers.filter((tier) => tier.monthlyPrice > 0).every((tier) => tier.overageRate > 0),
    `${preset.id}: paid tiers should have overage rates`,
  );
  assert(Number.isFinite(analysis.loadedCostPerCustomer), `${preset.id}: loaded cost is finite`);
  assert(Number.isFinite(month12.revenue), `${preset.id}: month 12 revenue is finite`);
  assert(
    billingExport.schemaVersion === "priceplain.billing.v1",
    `${preset.id}: billing export schema mismatch`,
  );
  assert(
    billingExport.primaryMeter.endsWith(".completed"),
    `${preset.id}: primary meter should be a completed event`,
  );
  assert(
    billingExport.invoiceLineItems.some((item) => item.code.endsWith("_base_subscription")),
    `${preset.id}: missing base subscription line item`,
  );
  assert(
    billingExport.invoiceLineItems.some((item) => item.code.endsWith("_usage_overage")),
    `${preset.id}: missing usage overage line item`,
  );
  assert(
    solvimonPreview.schema_version === "priceplain.solvimon_preview.v1",
    `${preset.id}: Solvimon preview schema mismatch`,
  );
  assert(solvimonPreview.meters.length > 0, `${preset.id}: Solvimon preview should include meters`);
  assert(
    solvimonPreview.plans.length === analysis.tiers.length,
    `${preset.id}: Solvimon preview should include one plan per tier`,
  );
  assert(
    solvimonPreview.invoice_items.some((item) => item.code.endsWith("_usage_overage")),
    `${preset.id}: Solvimon preview should include usage overage invoice items`,
  );
  assert(sensitivity.length === 4, `${preset.id}: expected four sensitivity scenarios`);
  assert(Boolean(costShock), `${preset.id}: missing model cost shock scenario`);
  assert(
    costShock && costShock.month12Cogs > month12.cogs,
    `${preset.id}: model cost shock should increase month 12 COGS`,
  );
  assert(review.signals.length >= 5, `${preset.id}: sovereign review should include signals`);
}

console.log(`Domain checks passed for ${demoPresets.length} presets`);
