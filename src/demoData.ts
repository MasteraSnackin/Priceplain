import type { PricingInputs } from "./types";

export const demoInputs: PricingInputs = {
  appName: "Briefly",
  productSummary:
    "AI meeting notes for remote product teams. It transcribes calls, extracts decisions, and drafts follow-up tasks.",
  targetCustomer: "Remote product teams",
  valueMetric: "processed meeting",
  currency: "GBP",
  stage: "Beta",
  billingMotion: "Self-serve",
  monthlyValueUnitsPerCustomer: 40,
  activeCustomers: 500,
  fixedMonthlyCost: 1200,
  grossMarginTarget: 75,
  paidConversion: 8,
  monthlyGrowth: 12,
  monthlyChurn: 4,
  costDrivers: [
    {
      id: "llm",
      label: "LLM transcription and summary",
      unitLabel: "meeting",
      costPerUnit: 0.18,
      unitsPerCustomerMonth: 40,
      metered: true,
    },
    {
      id: "storage",
      label: "Transcript storage",
      unitLabel: "GB",
      costPerUnit: 0.04,
      unitsPerCustomerMonth: 2,
      metered: true,
    },
    {
      id: "api",
      label: "Calendar and task API calls",
      unitLabel: "100 calls",
      costPerUnit: 0.03,
      unitsPerCustomerMonth: 8,
      metered: false,
    },
  ],
};

export const blankInputs: PricingInputs = {
  ...demoInputs,
  appName: "My AI App",
  productSummary: "",
  targetCustomer: "Early adopters",
  valueMetric: "AI action",
  monthlyValueUnitsPerCustomer: 100,
  activeCustomers: 250,
  fixedMonthlyCost: 800,
  paidConversion: 6,
  costDrivers: [
    {
      id: "llm",
      label: "LLM calls",
      unitLabel: "AI action",
      costPerUnit: 0.08,
      unitsPerCustomerMonth: 100,
      metered: true,
    },
    {
      id: "storage",
      label: "Storage",
      unitLabel: "GB",
      costPerUnit: 0.05,
      unitsPerCustomerMonth: 1,
      metered: false,
    },
  ],
};

export const codingAssistantInputs: PricingInputs = {
  appName: "PatchPilot",
  productSummary:
    "AI coding assistant for small engineering teams. It reviews pull requests, writes patches, and explains risky code changes.",
  targetCustomer: "Indie software teams",
  valueMetric: "code review",
  currency: "GBP",
  stage: "Beta",
  billingMotion: "Self-serve",
  monthlyValueUnitsPerCustomer: 120,
  activeCustomers: 350,
  fixedMonthlyCost: 1800,
  grossMarginTarget: 78,
  paidConversion: 7,
  monthlyGrowth: 14,
  monthlyChurn: 5,
  costDrivers: [
    {
      id: "reasoning",
      label: "Reasoning model review",
      unitLabel: "code review",
      costPerUnit: 0.11,
      unitsPerCustomerMonth: 120,
      metered: true,
    },
    {
      id: "embedding",
      label: "Repository embeddings",
      unitLabel: "1k files",
      costPerUnit: 0.22,
      unitsPerCustomerMonth: 5,
      metered: true,
    },
    {
      id: "sandbox",
      label: "Patch sandbox runs",
      unitLabel: "run",
      costPerUnit: 0.04,
      unitsPerCustomerMonth: 80,
      metered: true,
    },
  ],
};

export const mediaStudioInputs: PricingInputs = {
  appName: "FrameForge",
  productSummary:
    "AI image and short-video workspace for marketing teams. It generates product shots, ad variants, and campaign clips.",
  targetCustomer: "Growth marketing teams",
  valueMetric: "rendered asset",
  currency: "GBP",
  stage: "Launched",
  billingMotion: "Sales-assisted",
  monthlyValueUnitsPerCustomer: 85,
  activeCustomers: 220,
  fixedMonthlyCost: 2600,
  grossMarginTarget: 72,
  paidConversion: 12,
  monthlyGrowth: 10,
  monthlyChurn: 3,
  costDrivers: [
    {
      id: "image",
      label: "Image generation",
      unitLabel: "image",
      costPerUnit: 0.07,
      unitsPerCustomerMonth: 70,
      metered: true,
    },
    {
      id: "video",
      label: "Video generation",
      unitLabel: "clip",
      costPerUnit: 0.42,
      unitsPerCustomerMonth: 15,
      metered: true,
    },
    {
      id: "storage",
      label: "Asset storage and CDN",
      unitLabel: "GB",
      costPerUnit: 0.08,
      unitsPerCustomerMonth: 12,
      metered: false,
    },
  ],
};

export const supportAgentInputs: PricingInputs = {
  appName: "QueueKind",
  productSummary:
    "AI support agent for regulated SaaS companies. It drafts replies, escalates sensitive cases, and audits customer interactions.",
  targetCustomer: "Regulated SaaS support teams",
  valueMetric: "resolved ticket",
  currency: "GBP",
  stage: "Scaling",
  billingMotion: "Enterprise",
  monthlyValueUnitsPerCustomer: 600,
  activeCustomers: 90,
  fixedMonthlyCost: 5200,
  grossMarginTarget: 70,
  paidConversion: 25,
  monthlyGrowth: 8,
  monthlyChurn: 2,
  costDrivers: [
    {
      id: "agent",
      label: "Agent conversation turns",
      unitLabel: "ticket",
      costPerUnit: 0.09,
      unitsPerCustomerMonth: 600,
      metered: true,
    },
    {
      id: "retrieval",
      label: "Knowledge retrieval",
      unitLabel: "100 searches",
      costPerUnit: 0.06,
      unitsPerCustomerMonth: 45,
      metered: true,
    },
    {
      id: "audit",
      label: "Compliance audit trace",
      unitLabel: "ticket",
      costPerUnit: 0.03,
      unitsPerCustomerMonth: 600,
      metered: true,
    },
  ],
};

export const demoPresets = [
  {
    id: "briefly",
    label: "Briefly meeting notes",
    inputs: demoInputs,
  },
  {
    id: "patchpilot",
    label: "PatchPilot coding",
    inputs: codingAssistantInputs,
  },
  {
    id: "frameforge",
    label: "FrameForge media",
    inputs: mediaStudioInputs,
  },
  {
    id: "queuekind",
    label: "QueueKind support",
    inputs: supportAgentInputs,
  },
];
