import type {
  FlockSovereignRefinement,
  PricingAnalysis,
  PricingInputs,
  SovereignReview,
} from "../src/types";
import {
  ApiError,
  createRequestId,
  errorResult,
  isAbortError,
  methodNotAllowed,
  providerTimeoutError,
  timeoutSignal,
  type ErrorHandlerResult,
} from "./errors.js";

interface SovereignPayload {
  inputs?: PricingInputs;
  analysis?: PricingAnalysis;
  review?: SovereignReview;
}

type HandlerResult =
  | {
      status: number;
      body: {
        ok: true;
        refinement: FlockSovereignRefinement;
      };
    }
  | ErrorHandlerResult;

interface FlockChatResponse {
  model?: string;
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const defaultFlockModel = "qwen3-30b-a3b-instruct-2507";
const flockTimeoutMs = 25_000;

function validatePayload(payload: SovereignPayload): asserts payload is Required<SovereignPayload> {
  if (!payload || typeof payload !== "object") {
    throw new ApiError("VALIDATION_ERROR", "Missing request payload.", 400);
  }

  if (!payload.inputs || !payload.analysis || !payload.review) {
    throw new ApiError("VALIDATION_ERROR", "Request must include inputs, analysis and review.", 400, {
      required: ["inputs", "analysis", "review"],
    });
  }
}

function buildPrompt(inputs: PricingInputs, analysis: PricingAnalysis, review: SovereignReview) {
  const compactPayload = {
    product: {
      appName: inputs.appName,
      productSummary: inputs.productSummary,
      targetCustomer: inputs.targetCustomer,
      valueMetric: inputs.valueMetric,
      stage: inputs.stage,
      billingMotion: inputs.billingMotion,
    },
    pricing: {
      pricingModel: analysis.pricingModel,
      loadedCostPerCustomer: analysis.loadedCostPerCustomer,
      variableCostPerCustomer: analysis.variableCostPerCustomer,
      meteringEvents: analysis.meteringEvents.map((event) => event.name),
      auditScore: analysis.auditScore,
    },
    baselineSovereignReview: review,
  };

  return `You are reviewing an AI-native application for the FLock Sovereign AI Challenge.

Focus on UK sovereign AI: data ownership, auditability, model/provider dependence, institutional procurement, transparency, security, and privacy-preserving or decentralised inference.

Return only valid JSON in this shape:
{
  "executiveSummary": "one direct paragraph",
  "governanceFindings": ["3 to 5 bullets"],
  "sovereigntyRecommendations": ["3 to 5 bullets"],
  "procurementQuestions": ["3 to 5 bullets"],
  "adoptionRisks": ["2 to 4 bullets"]
}

Do not discuss trading, Sui, Bilt, or broad sponsor strategy. Make the output useful to a public-sector or regulated buyer.

Input:
${JSON.stringify(compactPayload, null, 2)}`;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return JSON.parse(trimmed);
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new ApiError(
      "PROVIDER_RESPONSE_ERROR",
      "FLock returned a response without JSON content.",
      502,
      {},
      "flock",
    );
  }
  return JSON.parse(match[0]);
}

function stringArray(value: unknown, fallback: string): string[] {
  if (!Array.isArray(value)) return [fallback];
  const cleaned = value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );
  return cleaned.length > 0 ? cleaned : [fallback];
}

function normaliseRefinement(value: unknown, model: string): FlockSovereignRefinement {
  if (!value || typeof value !== "object") {
    throw new ApiError(
      "PROVIDER_RESPONSE_ERROR",
      "FLock response JSON was not an object.",
      502,
      {},
      "flock",
    );
  }

  const record = value as Record<string, unknown>;

  return {
    model,
    executiveSummary:
      typeof record.executiveSummary === "string"
        ? record.executiveSummary
        : "FLock returned a sovereign AI review, but the summary field was missing.",
    governanceFindings: stringArray(
      record.governanceFindings,
      "Document data residency, retention and auditability before institutional deployment.",
    ),
    sovereigntyRecommendations: stringArray(
      record.sovereigntyRecommendations,
      "Route sensitive review flows through privacy-preserving or decentralised inference.",
    ),
    procurementQuestions: stringArray(
      record.procurementQuestions,
      "Ask who owns prompts, logs, model outputs and evaluation data.",
    ),
    adoptionRisks: stringArray(
      record.adoptionRisks,
      "Institutional buyers may reject the app without stronger governance evidence.",
    ),
  };
}

export async function handleSovereignReview(
  payload: SovereignPayload,
  requestId = createRequestId(),
): Promise<HandlerResult> {
  try {
    validatePayload(payload);

    const apiKey = process.env.FLOCK_API_KEY;
    if (!apiKey) {
      return errorResult(
        new ApiError(
          "CONFIGURATION_ERROR",
          "FLOCK_API_KEY is not configured.",
          400,
          {},
          "flock",
        ),
        requestId,
      );
    }

    const model = process.env.FLOCK_MODEL || defaultFlockModel;
    const response = await fetch("https://api.flock.io/v1/chat/completions", {
      method: "POST",
      signal: timeoutSignal(flockTimeoutMs),
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-litellm-api-key": apiKey,
      },
      body: JSON.stringify({
        model,
        stream: false,
        temperature: 0.2,
        max_tokens: 1100,
        messages: [
          {
            role: "system",
            content:
              "You are a concise sovereign AI governance reviewer. Return JSON only.",
          },
          {
            role: "user",
            content: buildPrompt(payload.inputs, payload.analysis, payload.review),
          },
        ],
      }),
    });

    const raw = await response.text();
    if (!response.ok) {
      return errorResult(
        new ApiError(
          "PROVIDER_ERROR",
          "FLock API request failed.",
          response.status >= 500 ? 502 : 400,
          { upstreamStatus: response.status },
          "flock",
        ),
        requestId,
      );
    }

    const data = JSON.parse(raw) as FlockChatResponse;
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new ApiError(
        "PROVIDER_RESPONSE_ERROR",
        "FLock returned no message content.",
        502,
        {},
        "flock",
      );
    }

    return {
      status: 200,
      body: {
        ok: true,
        refinement: normaliseRefinement(extractJson(content), data.model || model),
      },
    };
  } catch (error) {
    if (isAbortError(error)) {
      return errorResult(providerTimeoutError("FLock", flockTimeoutMs), requestId);
    }

    return errorResult(error, requestId, {
      code: "PROVIDER_ERROR",
      message: "FLock review failed. Check server logs and provider configuration.",
      status: 502,
      provider: "flock",
    });
  }
}

async function readBody(req: any): Promise<SovereignPayload> {
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
    .then((payload) => handleSovereignReview(payload, requestId))
    .catch((error) =>
      errorResult(error, requestId, {
        code: "INVALID_JSON",
        message: "Request body must be valid JSON.",
        status: 400,
      }),
    );
  res.status(result.status).json(result.body);
}
