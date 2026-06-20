import type { ProviderStatus } from "../src/types";
import { createRequestId, errorResult, methodNotAllowed, type ErrorHandlerResult } from "./errors";

type ProviderStatusResult =
  | {
      status: number;
      body: {
        ok: true;
        requestId: string;
        providers: ProviderStatus;
      };
    }
  | ErrorHandlerResult;

const defaultAnthropicModel = "claude-sonnet-4-6";
const defaultFlockModel = "qwen3-30b-a3b-instruct-2507";

export function handleProviderStatus(requestId = createRequestId()): ProviderStatusResult {
  return {
    status: 200,
    body: {
      ok: true,
      requestId,
      providers: {
        anthropic: {
          configured: Boolean(process.env.ANTHROPIC_API_KEY),
          model: process.env.ANTHROPIC_MODEL || defaultAnthropicModel,
        },
        flock: {
          configured: Boolean(process.env.FLOCK_API_KEY),
          model: process.env.FLOCK_MODEL || defaultFlockModel,
        },
      },
    },
  };
}

export default function handler(req: any, res: any) {
  const requestId = createRequestId();

  if (req.method !== "GET") {
    const result = methodNotAllowed(requestId, ["GET"]);
    res.status(result.status).json(result.body);
    return;
  }

  try {
    const result = handleProviderStatus(requestId);
    res.status(result.status).json(result.body);
  } catch (error) {
    const result = errorResult(error, requestId);
    res.status(result.status).json(result.body);
  }
}
