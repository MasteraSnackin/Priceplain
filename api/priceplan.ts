import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";
import type { ClaudeRefinement, PricingAnalysis, PricingInputs } from "../src/types";
import {
  ApiError,
  createRequestId,
  errorResult,
  methodNotAllowed,
  type ErrorHandlerResult,
} from "./errors.js";

interface PriceplanPayload {
  inputs?: PricingInputs;
  analysis?: PricingAnalysis;
}

type HandlerResult =
  | {
      status: number;
      body: {
        ok: true;
        refinement: ClaudeRefinement;
      };
    }
  | ErrorHandlerResult;

const defaultModel = "claude-sonnet-4-6";

const refinementSchema = z.object({
  executiveSummary: z.string(),
  pricingRationale: z.array(z.string()).min(1),
  solvimonImplementation: z.array(z.string()).min(1),
  codeplainPlan: z.array(z.string()).min(1),
  suggestedChanges: z.array(z.string()).min(1),
  risks: z.array(z.string()).min(1),
});

function buildPrompt(inputs: PricingInputs, analysis: PricingAnalysis): string {
  const compactPayload = {
    product: {
      appName: inputs.appName,
      productSummary: inputs.productSummary,
      targetCustomer: inputs.targetCustomer,
      valueMetric: inputs.valueMetric,
      stage: inputs.stage,
      billingMotion: inputs.billingMotion,
    },
    assumptions: {
      currency: inputs.currency,
      activeCustomers: inputs.activeCustomers,
      fixedMonthlyCost: inputs.fixedMonthlyCost,
      grossMarginTarget: inputs.grossMarginTarget,
      paidConversion: inputs.paidConversion,
      monthlyGrowth: inputs.monthlyGrowth,
      monthlyChurn: inputs.monthlyChurn,
      costDrivers: inputs.costDrivers,
    },
    generatedModel: {
      pricingModel: analysis.pricingModel,
      loadedCostPerCustomer: analysis.loadedCostPerCustomer,
      variableCostPerCustomer: analysis.variableCostPerCustomer,
      recommendedOverageRate: analysis.recommendedOverageRate,
      tiers: analysis.tiers.map((tier) => ({
        name: tier.name,
        monthlyPrice: tier.monthlyPrice,
        includedUnits: tier.includedUnits,
        overageRate: tier.overageRate,
        grossMargin: tier.grossMargin,
      })),
      meteringEvents: analysis.meteringEvents.map((event) => event.name),
      auditSignals: analysis.auditSignals,
      billingSummary: analysis.billingSummary,
    },
  };

  return `You are a pricing strategist for AI-native SaaS products and a hackathon judge focused on Solvimon and Codeplain.

Review this generated pricing model for a vibe-coded AI app.

Return concise structured output.

Be direct. Do not invent external integrations. Do not mention BGA, Sui, Vercel, FLock, or Bilt.me. Keep the answer focused on Solvimon and Codeplain.

Input:
${JSON.stringify(compactPayload, null, 2)}`;
}

function normaliseRefinement(
  value: z.infer<typeof refinementSchema>,
  model: string,
): ClaudeRefinement {
  return {
    model,
    executiveSummary: value.executiveSummary,
    pricingRationale: value.pricingRationale,
    solvimonImplementation: value.solvimonImplementation,
    codeplainPlan: value.codeplainPlan,
    suggestedChanges: value.suggestedChanges,
    risks: value.risks,
  };
}

function validatePayload(payload: PriceplanPayload): asserts payload is Required<PriceplanPayload> {
  if (!payload || typeof payload !== "object") {
    throw new ApiError("VALIDATION_ERROR", "Missing request payload.", 400);
  }

  if (!payload.inputs || !payload.analysis) {
    throw new ApiError("VALIDATION_ERROR", "Request must include inputs and analysis.", 400, {
      required: ["inputs", "analysis"],
    });
  }
}

export async function handlePriceplan(
  payload: PriceplanPayload,
  requestId = createRequestId(),
): Promise<HandlerResult> {
  try {
    validatePayload(payload);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return errorResult(
        new ApiError(
          "CONFIGURATION_ERROR",
          "ANTHROPIC_API_KEY is not configured.",
          400,
          {},
          "anthropic",
        ),
        requestId,
      );
    }

    const model = process.env.ANTHROPIC_MODEL || defaultModel;
    const result = await generateObject({
      model: anthropic(model),
      schema: refinementSchema,
      system:
        "You produce practical pricing and monetisation reviews for AI app founders. Keep output concise and directly useful.",
      prompt: buildPrompt(payload.inputs, payload.analysis),
    });

    return {
      status: 200,
      body: {
        ok: true,
        refinement: normaliseRefinement(result.object, model),
      },
    };
  } catch (error) {
    return errorResult(error, requestId, {
      code: "PROVIDER_ERROR",
      message: "Claude refinement failed. Check server logs and provider configuration.",
      status: 502,
      provider: "anthropic",
    });
  }
}

async function readBody(req: any): Promise<PriceplanPayload> {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body);

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

export default async function handler(req: any, res: any) {
  const requestId = createRequestId();

  if (req.method !== "POST") {
    const result = methodNotAllowed(requestId);
    res.status(result.status).json(result.body);
    return;
  }

  const result = await readBody(req)
    .then((payload) => handlePriceplan(payload, requestId))
    .catch((error) =>
      errorResult(error, requestId, {
        code: "INVALID_JSON",
        message: "Request body must be valid JSON.",
        status: 400,
      }),
    );
  res.status(result.status).json(result.body);
}
