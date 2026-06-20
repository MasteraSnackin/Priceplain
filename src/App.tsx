import {
  BriefcaseBusiness,
  CheckCircle2,
  Calculator,
  Copy,
  Download,
  FileText,
  Gauge,
  LineChart,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TableProperties,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  requestClaudeRefinement,
  requestFlockSovereignRefinement,
  requestProviderStatus,
  type ProviderStatusSuccessResponse,
} from "./aiClient";
import { blankInputs, demoInputs, demoPresets } from "./demoData";
import {
  analysePricing,
  buildBillingImplementationExport,
  buildSensitivityScenarios,
  formatCompactCurrency,
  formatCurrency,
} from "./pricingEngine";
import { assessSovereignty } from "./sovereignReview";
import type {
  BillingImplementationExport,
  BillingMotion,
  ClaudeRefinement,
  CostDriver,
  Currency,
  FlockSovereignRefinement,
  PricingInputs,
  ProductStage,
  SensitivityScenario,
  SovereignReview,
} from "./types";

type Tab = "pricing" | "business" | "sovereign" | "simulation" | "metering" | "export";

const currencies: Currency[] = ["GBP", "USD", "EUR"];
const stages: ProductStage[] = ["Prototype", "Beta", "Launched", "Scaling"];
const motions: BillingMotion[] = ["Self-serve", "Sales-assisted", "Enterprise"];
const tabs: Tab[] = ["pricing", "business", "sovereign", "simulation", "metering", "export"];
const demoTabs: Tab[] = ["pricing", "metering", "simulation", "export"];
const trackCoverage = [
  {
    track: "Solvimon",
    status: "Primary",
    evidence: "Usage-aware pricing, metering events, Solvimon import preview, overages, revenue simulation and business case.",
  },
  {
    track: "Codeplain",
    status: "Primary",
    evidence: ".plain product spec, pricing rules and acceptance tests included in the repo.",
  },
  {
    track: "Vercel",
    status: "Secondary",
    evidence: "Vercel AI SDK structured generation and deployable Vite/API route setup.",
  },
  {
    track: "FLock",
    status: "Secondary",
    evidence: "Sovereign AI Review with governance scoring and optional FLock API refinement.",
  },
];
const demoScript = [
  "Start with the Briefly demo app and show the value metric plus AI cost drivers.",
  "Open Pricing to show generated tiers, overage rules and gross-margin visibility.",
  "Open Metering to show the Solvimon import preview: meters, plans, invoice lines and credit rules.",
  "Open Simulation to show revenue, COGS, paid conversion and break-even trajectory.",
  "Open Business to explain the customer, wedge, revenue path and Solvimon fit.",
  "Open Sovereign to show institutional governance, procurement questions and FLock path.",
  "Download the Markdown report as the final exportable pricing and governance artefact.",
];
const submissionChecklist = [
  "Public GitHub repository contains source, README, .plain specs and environment example.",
  "Production build passes with npm run build.",
  "Claude refinement works when ANTHROPIC_API_KEY is configured.",
  "FLock refinement works when FLOCK_API_KEY is configured.",
  "Provider status check confirms whether live keys are configured before the demo.",
  "Vercel deployment has ANTHROPIC_API_KEY and FLOCK_API_KEY set as server-side env vars.",
  "Exact Codeplain config format is verified with sponsor docs before final submission.",
];

function initialTab(): Tab {
  const tab = new URLSearchParams(window.location.search).get("tab");
  return tabs.includes(tab as Tab) ? (tab as Tab) : "pricing";
}

function tabUrl(tab: Tab): string {
  const url = new URL(window.location.href);

  if (tab === "pricing") {
    url.searchParams.delete("tab");
  } else {
    url.searchParams.set("tab", tab);
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

function numberValue(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatSignedCompactCurrency(value: number, currency: Currency): string {
  const formatted = formatCompactCurrency(Math.abs(value), currency);
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

function formatPointDelta(value: number): string {
  return `${value >= 0 ? "+" : ""}${Math.round(value)} pts`;
}

function breakEvenLabel(month: number | null): string {
  return month ? `M${month}` : "Not yet";
}

function slugifyLabel(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "priceplain"
  );
}

function buildReport(
  inputs: PricingInputs,
  analysis: ReturnType<typeof analysePricing>,
  billingExport: BillingImplementationExport,
  sensitivityScenarios: SensitivityScenario[],
  providerStatus: ProviderStatusSuccessResponse | null,
  refinement: ClaudeRefinement | null,
  sovereignReview: SovereignReview,
  flockRefinement: FlockSovereignRefinement | null,
): string {
  const tierLines = analysis.tiers
    .map(
      (tier) =>
        `- ${tier.name}: ${formatCurrency(tier.monthlyPrice, inputs.currency)}/month, ${tier.includedUnits} included, ${tier.overageRate ? `${formatCurrency(tier.overageRate, inputs.currency)} overage` : "no overage"}`,
    )
    .join("\n");

  const eventLines = analysis.meteringEvents
    .map((event) => `- ${event.name}: ${event.billingUse}`)
    .join("\n");
  const providerLines = providerStatus
    ? `
## Provider status
- Claude: ${providerStatus.providers.anthropic.configured ? "configured" : "missing"} (${providerStatus.providers.anthropic.model})
- FLock: ${providerStatus.providers.flock.configured ? "configured" : "missing"} (${providerStatus.providers.flock.model})
`
    : `
## Provider status
- Claude: unknown until /api/provider-status responds.
- FLock: unknown until /api/provider-status responds.
`;
  const claudeLines = refinement
    ? `
## Claude pricing review
Model: ${refinement.model}

${refinement.executiveSummary}

### Solvimon implementation
${refinement.solvimonImplementation.map((line) => `- ${line}`).join("\n")}

### Codeplain plan
${refinement.codeplainPlan.map((line) => `- ${line}`).join("\n")}
`
    : "";
  const sovereignLines = `
## Sovereign AI review
Verdict: ${sovereignReview.verdict}
Score: ${sovereignReview.overallScore}/100

### Governance actions
${sovereignReview.governanceActions.map((line) => `- ${line}`).join("\n")}

### FLock path
${sovereignReview.flockPath.map((line) => `- ${line}`).join("\n")}
`;
  const flockLines = flockRefinement
    ? `
## FLock sovereign refinement
Model: ${flockRefinement.model}

${flockRefinement.executiveSummary}

### Sovereignty recommendations
${flockRefinement.sovereigntyRecommendations.map((line) => `- ${line}`).join("\n")}
`
    : "";

  return `# ${inputs.appName} pricing plan

${inputs.productSummary}

## Recommended model
${analysis.pricingModel}

Loaded cost per active customer: ${formatCurrency(analysis.loadedCostPerCustomer, inputs.currency)}
Recommended overage: ${formatCurrency(analysis.recommendedOverageRate, inputs.currency)} per ${inputs.valueMetric}
Pricing audit score: ${analysis.auditScore}/100

## Tiers
${tierLines}

## Metering events
${eventLines}

## Billing summary
${analysis.billingSummary.map((line) => `- ${line}`).join("\n")}

${providerLines}

## Solvimon import preview
\`\`\`json
${JSON.stringify(billingExport, null, 2)}
\`\`\`

## Sensitivity checks
${sensitivityScenarios
  .map(
    (scenario) =>
      `- ${scenario.label}: ${scenario.assumptionChange} Month 12 revenue ${formatCompactCurrency(scenario.month12Revenue, inputs.currency)} (${formatSignedCompactCurrency(scenario.revenueDelta, inputs.currency)}), gross margin ${Math.round(scenario.grossMargin)}% (${formatPointDelta(scenario.grossMarginDelta)}), break-even ${breakEvenLabel(scenario.breakEvenMonth)}.`,
  )
  .join("\n")}
${claudeLines}
${sovereignLines}
${flockLines}
## Track coverage
${trackCoverage.map((item) => `- ${item.track} (${item.status}): ${item.evidence}`).join("\n")}

## Demo script
${demoScript.map((item, index) => `${index + 1}. ${item}`).join("\n")}

## Submission checklist
${submissionChecklist.map((item) => `- ${item}`).join("\n")}
`;
}

function App() {
  const [inputs, setInputs] = useState<PricingInputs>(demoInputs);
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [refinement, setRefinement] = useState<ClaudeRefinement | null>(null);
  const [aiError, setAiError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [flockRefinement, setFlockRefinement] = useState<FlockSovereignRefinement | null>(null);
  const [flockError, setFlockError] = useState("");
  const [flockLoading, setFlockLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [providerStatus, setProviderStatus] = useState<ProviderStatusSuccessResponse | null>(null);
  const [providerStatusError, setProviderStatusError] = useState("");
  const analysis = useMemo(() => analysePricing(inputs), [inputs]);
  const sovereignReview = useMemo(() => assessSovereignty(inputs, analysis), [inputs, analysis]);
  const billingExport = useMemo(
    () => buildBillingImplementationExport(inputs, analysis),
    [inputs, analysis],
  );
  const sensitivityScenarios = useMemo(() => buildSensitivityScenarios(inputs), [inputs]);
  const presetComparisons = useMemo(
    () =>
      demoPresets.map((preset) => {
        const presetAnalysis = analysePricing(preset.inputs);
        const presetYearEnd = presetAnalysis.simulation[presetAnalysis.simulation.length - 1];
        const starterTier = presetAnalysis.tiers.find((tier) => tier.id === "starter");

        return {
          id: preset.id,
          label: preset.label,
          loadedCost: presetAnalysis.loadedCostPerCustomer,
          starterPrice: starterTier?.monthlyPrice ?? 0,
          auditScore: presetAnalysis.auditScore,
          month12Revenue: presetYearEnd.revenue,
          grossMargin: presetYearEnd.grossMargin,
          currency: preset.inputs.currency,
        };
      }),
    [],
  );
  const activePresetId = useMemo(
    () => demoPresets.find((preset) => preset.inputs.appName === inputs.appName)?.id ?? "custom",
    [inputs.appName],
  );
  const visibleTabs = demoMode ? demoTabs : tabs;
  const reportText = useMemo(
    () =>
      buildReport(
        inputs,
        analysis,
        billingExport,
        sensitivityScenarios,
        providerStatus,
        refinement,
        sovereignReview,
        flockRefinement,
      ),
    [
      inputs,
      analysis,
      billingExport,
      sensitivityScenarios,
      providerStatus,
      refinement,
      sovereignReview,
      flockRefinement,
    ],
  );

  useEffect(() => {
    const syncTabFromUrl = () => setActiveTab(initialTab());
    window.addEventListener("popstate", syncTabFromUrl);
    return () => window.removeEventListener("popstate", syncTabFromUrl);
  }, []);

  useEffect(() => {
    let cancelled = false;

    requestProviderStatus()
      .then((status) => {
        if (!cancelled) {
          setProviderStatus(status);
          setProviderStatusError("");
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setProviderStatusError(
            error instanceof Error ? error.message : "Provider status check failed.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const changeTab = (tab: Tab) => {
    setActiveTab(tab);
    const nextUrl = tabUrl(tab);
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (nextUrl !== currentUrl) {
      window.history.pushState(null, "", nextUrl);
    }
  };

  const clearAiReviews = () => {
    setRefinement(null);
    setAiError("");
    setFlockRefinement(null);
    setFlockError("");
  };

  const replaceInputs = (nextInputs: PricingInputs) => {
    setInputs(nextInputs);
    clearAiReviews();
  };

  const selectPreset = (presetId: string) => {
    const preset = demoPresets.find((item) => item.id === presetId);
    if (preset) replaceInputs(preset.inputs);
  };

  const updateInput = <K extends keyof PricingInputs>(key: K, value: PricingInputs[K]) => {
    setInputs((current) => ({ ...current, [key]: value }));
    clearAiReviews();
  };

  const updateDriver = <K extends keyof CostDriver>(
    id: string,
    key: K,
    value: CostDriver[K],
  ) => {
    setInputs((current) => ({
      ...current,
      costDrivers: current.costDrivers.map((driver) =>
        driver.id === id ? { ...driver, [key]: value } : driver,
      ),
    }));
    clearAiReviews();
  };

  const addDriver = () => {
    setInputs((current) => ({
      ...current,
      costDrivers: [
        ...current.costDrivers,
        {
          id: globalThis.crypto?.randomUUID?.() ?? `driver-${Date.now()}`,
          label: "New cost driver",
          unitLabel: current.valueMetric || "unit",
          costPerUnit: 0.05,
          unitsPerCustomerMonth: current.monthlyValueUnitsPerCustomer,
          metered: true,
        },
      ],
    }));
    clearAiReviews();
  };

  const copyReport = async () => {
    setCopyError("");

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard access is not available in this browser.");
      }

      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopyError("Clipboard access was blocked. The full report text is available in the Export tab.");
      changeTab("export");
    }
  };

  const downloadMarkdown = () => {
    const blob = new Blob([reportText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${slugifyLabel(inputs.appName)}-pricing-report.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const toggleDemoMode = (enabled: boolean) => {
    setDemoMode(enabled);
    if (enabled && !demoTabs.includes(activeTab)) {
      changeTab("pricing");
    }
  };

  const runClaudeReview = async () => {
    setAiLoading(true);
    setAiError("");
    try {
      const nextRefinement = await requestClaudeRefinement({ inputs, analysis });
      setRefinement(nextRefinement);
      changeTab("pricing");
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Claude refinement failed.");
    } finally {
      setAiLoading(false);
    }
  };

  const runFlockReview = async () => {
    setFlockLoading(true);
    setFlockError("");
    try {
      const nextRefinement = await requestFlockSovereignRefinement({
        inputs,
        analysis,
        review: sovereignReview,
      });
      setFlockRefinement(nextRefinement);
      changeTab("sovereign");
    } catch (error) {
      setFlockError(error instanceof Error ? error.message : "FLock review failed.");
    } finally {
      setFlockLoading(false);
    }
  };

  const yearEnd = analysis.simulation[analysis.simulation.length - 1];
  const maxRevenue = Math.max(...analysis.simulation.map((month) => month.revenue), 1);

  return (
    <main className={demoMode ? "app-shell demo-mode" : "app-shell"}>
      <header className="topbar">
        <div>
          <p className="eyebrow">Encode Vibe Coding Hackathon MVP</p>
          <h1>Priceplain</h1>
        </div>
        <div className="actions">
          <label className="toggle-control">
            <input
              checked={demoMode}
              onChange={(event) => toggleDemoMode(event.target.checked)}
              type="checkbox"
            />
            Demo mode
          </label>
          <select
            aria-label="Demo preset"
            className="preset-select"
            onChange={(event) => selectPreset(event.target.value)}
            value={activePresetId}
          >
            <option value="custom">Custom</option>
            {demoPresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
          <button className="ghost-button" onClick={() => replaceInputs(demoInputs)} type="button">
            <RefreshCw size={16} />
            Demo
          </button>
          <button className="ghost-button" onClick={() => replaceInputs(blankInputs)} type="button">
            <FileText size={16} />
            Blank
          </button>
          <button
            aria-busy={aiLoading}
            className="ghost-button accent"
            disabled={aiLoading}
            onClick={runClaudeReview}
            type="button"
          >
            <Sparkles size={16} />
            {aiLoading ? "Asking Claude" : "Claude refine"}
          </button>
          <button className="ghost-button" onClick={downloadMarkdown} type="button">
            <Download size={16} />
            Download .md
          </button>
          <button className="primary-button" onClick={copyReport} type="button">
            <Copy size={16} />
            {copied ? "Copied" : "Copy report"}
          </button>
        </div>
      </header>

      {copyError && (
        <div className="status-banner error" role="status" aria-live="polite">
          {copyError}
        </div>
      )}

      <div className="provider-status-strip" aria-label="Provider key status">
        {providerStatus ? (
          <>
            <StatusPill
              configured={providerStatus.providers.anthropic.configured}
              label="Claude key"
              model={providerStatus.providers.anthropic.model}
            />
            <StatusPill
              configured={providerStatus.providers.flock.configured}
              label="FLock key"
              model={providerStatus.providers.flock.model}
            />
          </>
        ) : (
          <span className={providerStatusError ? "status-pill missing" : "status-pill"}>
            {providerStatusError || "Checking provider keys"}
          </span>
        )}
      </div>

      <section className="workspace">
        <aside className="input-panel" aria-label="Pricing inputs">
          <div className="panel-heading">
            <Calculator size={18} />
            <h2>Founder Intake</h2>
          </div>

          <div className="field-grid">
            <label>
              App name
              <input
                value={inputs.appName}
                onChange={(event) => updateInput("appName", event.target.value)}
              />
            </label>
            <label>
              Currency
              <select
                value={inputs.currency}
                onChange={(event) => updateInput("currency", event.target.value as Currency)}
              >
                {currencies.map((currency) => (
                  <option key={currency}>{currency}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Product summary
            <textarea
              value={inputs.productSummary}
              onChange={(event) => updateInput("productSummary", event.target.value)}
              rows={4}
            />
          </label>

          <div className="field-grid">
            <label>
              Target customer
              <input
                value={inputs.targetCustomer}
                onChange={(event) => updateInput("targetCustomer", event.target.value)}
              />
            </label>
            <label>
              Value metric
              <input
                value={inputs.valueMetric}
                onChange={(event) => updateInput("valueMetric", event.target.value)}
              />
            </label>
          </div>

          <div className="field-grid">
            <label>
              Stage
              <select
                value={inputs.stage}
                onChange={(event) => updateInput("stage", event.target.value as ProductStage)}
              >
                {stages.map((stage) => (
                  <option key={stage}>{stage}</option>
                ))}
              </select>
            </label>
            <label>
              Motion
              <select
                value={inputs.billingMotion}
                onChange={(event) =>
                  updateInput("billingMotion", event.target.value as BillingMotion)
                }
              >
                {motions.map((motion) => (
                  <option key={motion}>{motion}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="metric-inputs">
            <NumberField
              label="Active customers"
              value={inputs.activeCustomers}
              onChange={(value) => updateInput("activeCustomers", value)}
            />
            <NumberField
              label="Units/customer/month"
              value={inputs.monthlyValueUnitsPerCustomer}
              onChange={(value) => updateInput("monthlyValueUnitsPerCustomer", value)}
            />
            <NumberField
              label="Fixed cost/month"
              value={inputs.fixedMonthlyCost}
              onChange={(value) => updateInput("fixedMonthlyCost", value)}
            />
            <NumberField
              label="Margin target %"
              value={inputs.grossMarginTarget}
              onChange={(value) => updateInput("grossMarginTarget", value)}
            />
            <NumberField
              label="Paid conversion %"
              value={inputs.paidConversion}
              onChange={(value) => updateInput("paidConversion", value)}
            />
            <NumberField
              label="Growth/month %"
              value={inputs.monthlyGrowth}
              onChange={(value) => updateInput("monthlyGrowth", value)}
            />
            <NumberField
              label="Churn/month %"
              value={inputs.monthlyChurn}
              onChange={(value) => updateInput("monthlyChurn", value)}
            />
          </div>

          <div className="cost-section">
            <div className="cost-heading">
              <h3>Cost drivers</h3>
              <button className="mini-button" onClick={addDriver} type="button">
                Add
              </button>
            </div>
            <div className="driver-head" aria-hidden="true">
              <span>Cost</span>
              <span>Unit</span>
              <span>Per unit</span>
              <span>Units/mo</span>
              <span>Meter</span>
            </div>
            {inputs.costDrivers.map((driver) => (
              <div className="driver-row" key={driver.id}>
                <input
                  aria-label="Cost driver"
                  value={driver.label}
                  onChange={(event) => updateDriver(driver.id, "label", event.target.value)}
                />
                <input
                  aria-label="Unit label"
                  value={driver.unitLabel}
                  onChange={(event) => updateDriver(driver.id, "unitLabel", event.target.value)}
                />
                <input
                  aria-label="Cost per unit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={driver.costPerUnit}
                  onChange={(event) =>
                    updateDriver(driver.id, "costPerUnit", numberValue(event.target.value))
                  }
                />
                <input
                  aria-label="Units per customer month"
                  type="number"
                  min="0"
                  step="1"
                  value={driver.unitsPerCustomerMonth}
                  onChange={(event) =>
                    updateDriver(
                      driver.id,
                      "unitsPerCustomerMonth",
                      numberValue(event.target.value),
                    )
                  }
                />
                <label className="check-label">
                  <input
                    checked={driver.metered}
                    onChange={(event) =>
                      updateDriver(driver.id, "metered", event.target.checked)
                    }
                    type="checkbox"
                  />
                  Meter
                </label>
              </div>
            ))}
          </div>
        </aside>

        <section className="output-panel" aria-label="Pricing outputs">
          {demoMode && (
            <section className="demo-mode-strip">
              <div>
                <p className="eyebrow">Judge mode</p>
                <h2>{inputs.appName}</h2>
                <p>
                  Focused route: pricing tiers, Solvimon import preview, revenue sensitivity and
                  Markdown export.
                </p>
              </div>
              <button className="ghost-button" onClick={() => toggleDemoMode(false)} type="button">
                Exit demo mode
              </button>
            </section>
          )}

          <div className="score-strip">
            <MetricCard
              label="Loaded cost"
              value={`${formatCurrency(analysis.loadedCostPerCustomer, inputs.currency)}/customer`}
            />
            <MetricCard
              label="Overage"
              value={`${formatCurrency(analysis.recommendedOverageRate, inputs.currency)}/${inputs.valueMetric}`}
            />
            <MetricCard label="Audit score" value={`${analysis.auditScore}/100`} />
            <MetricCard
              label="Month 12 revenue"
              value={formatCompactCurrency(yearEnd.revenue, inputs.currency)}
            />
          </div>

          <nav className="tabs" aria-label="Output sections">
            {visibleTabs.includes("pricing") && (
              <TabButton
                active={activeTab === "pricing"}
                icon={<TableProperties size={16} />}
                label="Pricing"
                onClick={() => changeTab("pricing")}
              />
            )}
            {visibleTabs.includes("business") && (
              <TabButton
                active={activeTab === "business"}
                icon={<BriefcaseBusiness size={16} />}
                label="Business"
                onClick={() => changeTab("business")}
              />
            )}
            {visibleTabs.includes("sovereign") && (
              <TabButton
                active={activeTab === "sovereign"}
                icon={<ShieldCheck size={16} />}
                label="Sovereign"
                onClick={() => changeTab("sovereign")}
              />
            )}
            {visibleTabs.includes("simulation") && (
              <TabButton
                active={activeTab === "simulation"}
                icon={<LineChart size={16} />}
                label="Simulation"
                onClick={() => changeTab("simulation")}
              />
            )}
            {visibleTabs.includes("metering") && (
              <TabButton
                active={activeTab === "metering"}
                icon={<Gauge size={16} />}
                label="Metering"
                onClick={() => changeTab("metering")}
              />
            )}
            {visibleTabs.includes("export") && (
              <TabButton
                active={activeTab === "export"}
                icon={<FileText size={16} />}
                label="Export"
                onClick={() => changeTab("export")}
              />
            )}
          </nav>

          {activeTab === "pricing" && (
            <div className="section-stack">
              <div className="model-banner">
                <span>Recommended model</span>
                <strong>{analysis.pricingModel}</strong>
              </div>
              <div className="tier-grid">
                {analysis.tiers.map((tier) => (
                  <article className="tier-card" key={tier.id}>
                    <div className="tier-top">
                      <div>
                        <p>{tier.name}</p>
                        <h3>{formatCurrency(tier.monthlyPrice, inputs.currency)}</h3>
                      </div>
                      {tier.badge && <span className="badge">{tier.badge}</span>}
                    </div>
                    <p className="muted">{tier.description}</p>
                    <div className="tier-stat">
                      <span>{tier.includedUnits}</span>
                      <small>{inputs.valueMetric}s included</small>
                    </div>
                    <ul>
                      {tier.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                    <footer>
                      <span>{tier.seatPolicy}</span>
                      <strong>{Math.round(tier.grossMargin)}% margin</strong>
                    </footer>
                  </article>
                ))}
              </div>
              <div className="audit-grid">
                {analysis.auditSignals.map((signal) => (
                  <article className={`audit-signal ${signal.status.toLowerCase()}`} key={signal.label}>
                    <span>{signal.status}</span>
                    <h3>{signal.label}</h3>
                    <p>{signal.detail}</p>
                  </article>
                ))}
              </div>
              {(aiLoading || refinement || aiError) && (
                <section
                  aria-live="polite"
                  className={aiError ? "claude-panel error" : "claude-panel"}
                >
                  <div className="claude-heading">
                    <div>
                      <p className="eyebrow">Claude review</p>
                      <h2>Solvimon + Codeplain refinement</h2>
                    </div>
                    {refinement && <span>{refinement.model}</span>}
                  </div>
                  {aiLoading && (
                    <p className="claude-summary">
                      Claude is reviewing the pricing model, metering assumptions and Codeplain plan.
                    </p>
                  )}
                  {aiError && <p className="claude-error">{aiError}</p>}
                  {refinement && (
                    <>
                      <p className="claude-summary">{refinement.executiveSummary}</p>
                      <div className="claude-grid">
                        <InsightList title="Pricing rationale" items={refinement.pricingRationale} />
                        <InsightList
                          title="Solvimon implementation"
                          items={refinement.solvimonImplementation}
                        />
                        <InsightList title="Codeplain plan" items={refinement.codeplainPlan} />
                        <InsightList title="Suggested changes" items={refinement.suggestedChanges} />
                      </div>
                      <div className="risk-strip">
                        {refinement.risks.map((risk) => (
                          <span key={risk}>{risk}</span>
                        ))}
                      </div>
                    </>
                  )}
                </section>
              )}
            </div>
          )}

          {activeTab === "business" && (
            <div className="section-stack">
              <section className="business-hero">
                <p className="eyebrow">Submission story</p>
                <h2>The planning layer before usage-based billing.</h2>
                <p>
                  Priceplain turns a vibe-coded AI app into pricing tiers, metering assumptions,
                  margin checks and a billing handoff before founders wire payments.
                </p>
              </section>

              <div className="business-grid">
                <article>
                  <span>Customer</span>
                  <h3>Vibe-coded AI app founders</h3>
                  <p>
                    Builders who can ship quickly but lack pricing, usage metering, and quote-to-cash
                    thinking before launch.
                  </p>
                </article>
                <article>
                  <span>Problem</span>
                  <h3>AI products have variable costs</h3>
                  <p>
                    Unlimited plans and guessed tiers can destroy margin once LLM, storage, media, or
                    API usage increases.
                  </p>
                </article>
                <article>
                  <span>Wedge</span>
                  <h3>Pricing before billing</h3>
                  <p>
                    Priceplain sits before implementation and produces the assumptions needed for
                    metering, invoicing, credits, and overages.
                  </p>
                </article>
                <article>
                  <span>Revenue path</span>
                  <h3>Founder pricing toolkit</h3>
                  <p>
                    A self-serve SaaS for pricing simulations, plus higher-value templates for usage
                    billing migrations and AI app launches.
                  </p>
                </article>
              </div>

              <div className="fit-grid">
                <article className="fit-card">
                  <h3>Solvimon fit</h3>
                  <ul>
                    <li>Turns value metrics into explicit billing events.</li>
                    <li>Supports hybrid subscription plus usage-overage pricing.</li>
                    <li>Models credits, free-tier guardrails, invoice lines, and margin risk.</li>
                    <li>Shows a credible path from pricing strategy to quote-to-cash workflows.</li>
                  </ul>
                </article>
                <article className="fit-card">
                  <h3>Codeplain fit</h3>
                  <ul>
                    <li>Product behaviour is captured in `.plain` specification files.</li>
                    <li>Acceptance tests describe pricing generation and Claude refinement paths.</li>
                    <li>Specs are written around user outcomes, not only implementation tasks.</li>
                    <li>The project can be iterated by changing plain-language pricing rules.</li>
                  </ul>
                </article>
              </div>

              <section className="pitch-card">
                <p className="eyebrow">60-second pitch</p>
                <p>
                  Priceplain is the missing planning layer before founders implement usage-based
                  billing. They describe the product, enter rough usage costs, and get pricing tiers,
                  metering events, overage rules, revenue sensitivity and a Solvimon-ready handoff.
                  The product answers the commercial question that vibe-coded AI apps often skip:
                  what should we charge, what should we meter, and can the margins work?
                </p>
              </section>
            </div>
          )}

          {activeTab === "sovereign" && (
            <div className="section-stack">
              <section className="sovereign-hero">
                <div>
                  <p className="eyebrow">FLock Sovereign AI</p>
                  <h2>{sovereignReview.verdict}</h2>
                  <p>
                    A governance review for UK institutions evaluating whether an AI product is
                    commercially transparent, auditable, and suitable for sovereign deployment.
                  </p>
                </div>
                <div className="sovereign-score">
                  <span>{sovereignReview.overallScore}</span>
                  <small>/100</small>
                </div>
              </section>

              <div className="sovereign-actions">
                <button
                  aria-busy={flockLoading}
                  className="ghost-button accent"
                  disabled={flockLoading}
                  onClick={runFlockReview}
                  type="button"
                >
                  <Sparkles size={16} />
                  {flockLoading ? "Asking FLock" : "FLock review"}
                </button>
                <p>
                  Uses a deterministic baseline first. When `FLOCK_API_KEY` is configured, this
                  calls FLock's OpenAI-compatible API for a sovereign AI governance refinement.
                </p>
              </div>

              {(flockLoading || flockError || flockRefinement) && (
                <section
                  aria-live="polite"
                  className={flockError ? "claude-panel error" : "claude-panel"}
                >
                  <div className="claude-heading">
                    <div>
                      <p className="eyebrow">FLock review</p>
                      <h2>{flockError ? "Provider status" : "Sovereign AI refinement"}</h2>
                    </div>
                    {flockRefinement && <span>{flockRefinement.model}</span>}
                  </div>
                  {flockLoading && (
                    <p className="claude-summary">
                      FLock is reviewing the governance, auditability and sovereignty posture.
                    </p>
                  )}
                  {flockError && <p className="claude-error">{flockError}</p>}
                  {flockRefinement && (
                    <>
                      <p className="claude-summary">{flockRefinement.executiveSummary}</p>
                      <div className="claude-grid">
                        <InsightList
                          title="Governance findings"
                          items={flockRefinement.governanceFindings}
                        />
                        <InsightList
                          title="Sovereignty recommendations"
                          items={flockRefinement.sovereigntyRecommendations}
                        />
                        <InsightList
                          title="Procurement questions"
                          items={flockRefinement.procurementQuestions}
                        />
                        <InsightList title="Adoption risks" items={flockRefinement.adoptionRisks} />
                      </div>
                    </>
                  )}
                </section>
              )}

              <div className="sovereign-grid">
                {sovereignReview.signals.map((signal) => (
                  <article className={`sovereign-signal ${signal.status.replace(" ", "-").toLowerCase()}`} key={signal.label}>
                    <span>{signal.status}</span>
                    <h3>{signal.label}</h3>
                    <strong>{signal.score}/100</strong>
                    <p>{signal.detail}</p>
                  </article>
                ))}
              </div>

              <div className="fit-grid">
                <InsightList
                  title="Procurement questions"
                  items={sovereignReview.procurementQuestions}
                />
                <InsightList title="Governance actions" items={sovereignReview.governanceActions} />
              </div>

              <div className="fit-grid">
                <InsightList title="FLock path" items={sovereignReview.flockPath} />
                <InsightList title="Institutional buyers" items={sovereignReview.institutionFit} />
              </div>
            </div>
          )}

          {activeTab === "simulation" && (
            <div className="section-stack">
              <div className="chart-panel">
                {analysis.simulation.map((month) => (
                  <div className="bar-column" key={month.month}>
                    <div className="bar-track">
                      <div
                        className={month.breakEven ? "bar positive" : "bar negative"}
                        style={{ height: `${Math.max(6, (month.revenue / maxRevenue) * 100)}%` }}
                      />
                    </div>
                    <span>M{month.month}</span>
                  </div>
                ))}
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Customers</th>
                      <th>Paid</th>
                      <th>Revenue</th>
                      <th>COGS</th>
                      <th>Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.simulation.map((month) => (
                      <tr key={month.month}>
                        <td>{month.month}</td>
                        <td>{month.totalCustomers}</td>
                        <td>{month.paidCustomers}</td>
                        <td>{formatCompactCurrency(month.revenue, inputs.currency)}</td>
                        <td>{formatCompactCurrency(month.cogs, inputs.currency)}</td>
                        <td>{Math.round(month.grossMargin)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <section className="sensitivity-panel">
                <div>
                  <p className="eyebrow">Sensitivity</p>
                  <h2>What breaks the model?</h2>
                </div>
                <div className="sensitivity-grid">
                  {sensitivityScenarios.map((scenario) => (
                    <article className="sensitivity-card" key={scenario.id}>
                      <h3>{scenario.label}</h3>
                      <p>{scenario.assumptionChange}</p>
                      <div className="sensitivity-stats">
                        <span>
                          Month 12
                          <strong>
                            {formatCompactCurrency(scenario.month12Revenue, inputs.currency)}
                          </strong>
                          <small>
                            {formatSignedCompactCurrency(scenario.revenueDelta, inputs.currency)}
                          </small>
                        </span>
                        <span>
                          Margin
                          <strong>{Math.round(scenario.grossMargin)}%</strong>
                          <small>{formatPointDelta(scenario.grossMarginDelta)}</small>
                        </span>
                        <span>
                          Break-even
                          <strong>{breakEvenLabel(scenario.breakEvenMonth)}</strong>
                          <small>Audit {scenario.auditScore}/100</small>
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === "metering" && (
            <div className="section-stack">
              <div className="billing-summary">
                {analysis.billingSummary.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <div className="event-list">
                {analysis.meteringEvents.map((event) => (
                  <article className="event-card" key={event.name}>
                    <h3>{event.name}</h3>
                    <p>{event.trigger}</p>
                    <small>{event.billingUse}</small>
                    <div className="property-row">
                      {event.properties.map((property) => (
                        <span key={property}>{property}</span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
              <section className="billing-export">
                <div>
                  <p className="eyebrow">Solvimon handoff</p>
                  <h2>Solvimon import preview</h2>
                </div>
                <div className="import-object-grid">
                  <article>
                    <span>Primary meter</span>
                    <strong>{billingExport.primaryMeter}</strong>
                  </article>
                  <article>
                    <span>Plans</span>
                    <strong>{billingExport.tierRules.length}</strong>
                  </article>
                  <article>
                    <span>Invoice lines</span>
                    <strong>{billingExport.invoiceLineItems.length}</strong>
                  </article>
                  <article>
                    <span>Credit rules</span>
                    <strong>{billingExport.creditPolicy.length}</strong>
                  </article>
                </div>
                <div className="billing-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Line item</th>
                        <th>Metric</th>
                        <th>Unit price</th>
                        <th>Tiers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingExport.invoiceLineItems.map((item) => (
                        <tr key={item.code}>
                          <td>{item.code}</td>
                          <td>{item.quantityMetric}</td>
                          <td>{formatCurrency(item.unitPrice, inputs.currency)}</td>
                          <td>{item.tierIds.join(", ")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <pre className="json-block">{JSON.stringify(billingExport, null, 2)}</pre>
              </section>
            </div>
          )}

          {activeTab === "export" && (
            <div className="section-stack">
              <section className="pricing-page-preview">
                <p className="eyebrow">Generated pricing page</p>
                <h2>{analysis.pricingPage.headline}</h2>
                <p>{analysis.pricingPage.subheading}</p>
                <div className="preview-tiers">
                  {analysis.tiers.slice(1).map((tier) => (
                    <article key={tier.id}>
                      <h3>{tier.name}</h3>
                      <strong>{formatCurrency(tier.monthlyPrice, inputs.currency)}</strong>
                      <span>{tier.includedUnits} included</span>
                    </article>
                  ))}
                </div>
              </section>
              <div className="faq-list">
                {analysis.pricingPage.faq.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
              <section className="comparison-panel">
                <div>
                  <p className="eyebrow">Saved scenarios</p>
                  <h2>Preset comparison</h2>
                </div>
                <div className="billing-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Scenario</th>
                        <th>Loaded cost</th>
                        <th>Starter price</th>
                        <th>Month 12</th>
                        <th>Margin</th>
                        <th>Audit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {presetComparisons.map((preset) => (
                        <tr key={preset.id}>
                          <td>{preset.label}</td>
                          <td>{formatCurrency(preset.loadedCost, preset.currency)}</td>
                          <td>{formatCurrency(preset.starterPrice, preset.currency)}</td>
                          <td>{formatCompactCurrency(preset.month12Revenue, preset.currency)}</td>
                          <td>{Math.round(preset.grossMargin)}%</td>
                          <td>{preset.auditScore}/100</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <div className="track-grid">
                {trackCoverage.map((item) => (
                  <article className="track-card" key={item.track}>
                    <span>{item.status}</span>
                    <h3>{item.track}</h3>
                    <p>{item.evidence}</p>
                  </article>
                ))}
              </div>
              <div className="fit-grid">
                <InsightList title="Demo script" items={demoScript} />
                <InsightList title="Submission checklist" items={submissionChecklist} />
              </div>
              <section className="submission-card">
                <div>
                  <p className="eyebrow">MVP status</p>
                  <h2>Built, demoable, and ready for deployment once API keys are configured.</h2>
                  <p>
                    The deterministic pricing and sovereign-review paths work without credentials.
                    Claude and FLock become live provider calls when their server-side keys are set.
                  </p>
                </div>
                <CheckCircle2 size={44} />
              </section>
              <section className="report-card">
                <div>
                  <p className="eyebrow">Export artefact</p>
                  <h2>Report text</h2>
                </div>
                <button className="ghost-button report-download" onClick={downloadMarkdown} type="button">
                  <Download size={16} />
                  Download Markdown
                </button>
                <textarea
                  aria-label="Generated report text"
                  className="report-textarea"
                  readOnly
                  value={reportText}
                />
              </section>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function NumberField({ label, value, onChange }: NumberFieldProps) {
  return (
    <label>
      {label}
      <input
        min="0"
        onChange={(event) => onChange(numberValue(event.target.value))}
        step="1"
        type="number"
        value={value}
      />
    </label>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

interface StatusPillProps {
  configured: boolean;
  label: string;
  model: string;
}

function StatusPill({ configured, label, model }: StatusPillProps) {
  return (
    <span className={configured ? "status-pill ready" : "status-pill missing"}>
      {label}: {configured ? "configured" : "missing"} - {model}
    </span>
  );
}

interface InsightListProps {
  title: string;
  items: string[];
}

function InsightList({ title, items }: InsightListProps) {
  return (
    <article className="insight-list">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

interface TabButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function TabButton({ active, icon, label, onClick }: TabButtonProps) {
  return (
    <button
      aria-pressed={active}
      className={active ? "tab active" : "tab"}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

export default App;
