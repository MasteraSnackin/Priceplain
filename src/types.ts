export type Currency = "GBP" | "USD" | "EUR";

export type BillingMotion = "Self-serve" | "Sales-assisted" | "Enterprise";

export type ProductStage = "Prototype" | "Beta" | "Launched" | "Scaling";

export interface CostDriver {
  id: string;
  label: string;
  unitLabel: string;
  costPerUnit: number;
  unitsPerCustomerMonth: number;
  metered: boolean;
}

export interface PricingInputs {
  appName: string;
  productSummary: string;
  targetCustomer: string;
  valueMetric: string;
  currency: Currency;
  stage: ProductStage;
  billingMotion: BillingMotion;
  monthlyValueUnitsPerCustomer: number;
  activeCustomers: number;
  fixedMonthlyCost: number;
  grossMarginTarget: number;
  paidConversion: number;
  monthlyGrowth: number;
  monthlyChurn: number;
  costDrivers: CostDriver[];
}

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  includedUnits: number;
  overageRate: number;
  monthlyCogs: number;
  grossMargin: number;
  seatPolicy: string;
  features: string[];
  badge?: string;
}

export interface MeteringEvent {
  name: string;
  trigger: string;
  properties: string[];
  billingUse: string;
}

export interface SimulationMonth {
  month: number;
  totalCustomers: number;
  paidCustomers: number;
  revenue: number;
  cogs: number;
  grossMargin: number;
  netContribution: number;
  breakEven: boolean;
}

export interface AuditSignal {
  label: string;
  status: "Good" | "Watch" | "Risk";
  detail: string;
}

export interface PricingPageCopy {
  headline: string;
  subheading: string;
  faq: string[];
}

export interface BillingTierRule {
  tierId: string;
  name: string;
  billingMode: "free_cap" | "subscription_plus_usage";
  baseMonthlyPrice: number;
  includedUnits: number;
  overageRate: number;
  seatPolicy: string;
}

export interface BillingLineItem {
  code: string;
  description: string;
  quantityMetric: string;
  unitPrice: number;
  tierIds: string[];
}

export interface BillingImplementationExport {
  schemaVersion: string;
  currency: Currency;
  valueMetric: string;
  pricingModel: string;
  primaryMeter: string;
  tierRules: BillingTierRule[];
  invoiceLineItems: BillingLineItem[];
  meteringEvents: MeteringEvent[];
  creditPolicy: string[];
  implementationNotes: string[];
}

export interface SensitivityScenario {
  id: string;
  label: string;
  assumptionChange: string;
  month12Revenue: number;
  revenueDelta: number;
  month12Cogs: number;
  grossMargin: number;
  grossMarginDelta: number;
  auditScore: number;
  breakEvenMonth: number | null;
}

export interface PricingAnalysis {
  variableCostPerCustomer: number;
  loadedCostPerCustomer: number;
  marginalCostPerValueUnit: number;
  recommendedOverageRate: number;
  pricingModel: string;
  tiers: PricingTier[];
  meteringEvents: MeteringEvent[];
  simulation: SimulationMonth[];
  auditScore: number;
  auditSignals: AuditSignal[];
  pricingPage: PricingPageCopy;
  billingSummary: string[];
}

export interface ClaudeRefinement {
  model: string;
  executiveSummary: string;
  pricingRationale: string[];
  solvimonImplementation: string[];
  codeplainPlan: string[];
  suggestedChanges: string[];
  risks: string[];
}

export interface SovereignSignal {
  label: string;
  score: number;
  status: "Ready" | "Needs control" | "High risk";
  detail: string;
}

export interface SovereignReview {
  overallScore: number;
  verdict: string;
  signals: SovereignSignal[];
  procurementQuestions: string[];
  governanceActions: string[];
  flockPath: string[];
  institutionFit: string[];
}

export interface FlockSovereignRefinement {
  model: string;
  executiveSummary: string;
  governanceFindings: string[];
  sovereigntyRecommendations: string[];
  procurementQuestions: string[];
  adoptionRisks: string[];
}

export interface ProviderConfigurationStatus {
  configured: boolean;
  model: string;
}

export interface ProviderStatus {
  anthropic: ProviderConfigurationStatus;
  flock: ProviderConfigurationStatus;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  requestId: string;
  provider?: string;
  details?: Record<string, unknown>;
}
