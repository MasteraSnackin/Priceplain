import type { ApiErrorPayload } from "../src/types";

export interface ErrorHandlerResult {
  status: number;
  body: {
    ok: false;
    error: ApiErrorPayload;
  };
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 500,
    public details: Record<string, unknown> = {},
    public provider?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function createRequestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function errorResult(
  error: unknown,
  requestId: string,
  fallback: {
    code: string;
    message: string;
    status: number;
    provider?: string;
  } = {
    code: "INTERNAL_ERROR",
    message: "The request failed unexpectedly.",
    status: 500,
  },
): ErrorHandlerResult {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      body: {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
          requestId,
          provider: error.provider,
          details: Object.keys(error.details).length > 0 ? error.details : undefined,
        },
      },
    };
  }

  return {
    status: fallback.status,
    body: {
      ok: false,
      error: {
        code: fallback.code,
        message: fallback.message,
        requestId,
        provider: fallback.provider,
      },
    },
  };
}

export function methodNotAllowed(requestId: string, allowed = ["POST"]): ErrorHandlerResult {
  return errorResult(
    new ApiError("METHOD_NOT_ALLOWED", "Method not allowed.", 405, { allowed }),
    requestId,
  );
}

export function timeoutSignal(timeoutMs: number): AbortSignal | undefined {
  if (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal) {
    return AbortSignal.timeout(timeoutMs);
  }

  return undefined;
}

export function providerTimeoutError(provider: string, timeoutMs: number): ApiError {
  return new ApiError(
    "PROVIDER_TIMEOUT",
    `${provider} did not respond within ${Math.round(timeoutMs / 1000)} seconds.`,
    504,
    { timeoutMs },
    provider.toLowerCase(),
  );
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
}
