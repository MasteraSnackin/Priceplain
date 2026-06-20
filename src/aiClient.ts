import type {
  ApiErrorPayload,
  ClaudeRefinement,
  FlockSovereignRefinement,
  PricingAnalysis,
  PricingInputs,
  ProviderStatus,
  SovereignReview,
} from "./types";

export interface ClaudeRequestPayload {
  inputs: PricingInputs;
  analysis: PricingAnalysis;
}

export interface ClaudeSuccessResponse {
  ok: true;
  refinement: ClaudeRefinement;
}

export interface ClaudeErrorResponse {
  ok: false;
  error: ApiErrorPayload | string;
}

export type ClaudeResponse = ClaudeSuccessResponse | ClaudeErrorResponse;

export interface SovereignRequestPayload {
  inputs: PricingInputs;
  analysis: PricingAnalysis;
  review: SovereignReview;
}

export interface FlockSuccessResponse {
  ok: true;
  refinement: FlockSovereignRefinement;
}

export interface FlockErrorResponse {
  ok: false;
  error: ApiErrorPayload | string;
}

export type FlockResponse = FlockSuccessResponse | FlockErrorResponse;

export interface ProviderStatusSuccessResponse {
  ok: true;
  requestId: string;
  providers: ProviderStatus;
}

export interface ProviderStatusErrorResponse {
  ok: false;
  error: ApiErrorPayload | string;
}

export type ProviderStatusResponse = ProviderStatusSuccessResponse | ProviderStatusErrorResponse;

const localApiTimeoutMs = 30_000;

function timeoutSignal(timeoutMs: number): AbortSignal | undefined {
  if (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal) {
    return AbortSignal.timeout(timeoutMs);
  }

  return undefined;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
}

function apiErrorMessage(
  error: ApiErrorPayload | string,
  fallback: string,
): string {
  if (typeof error === "string") return error || fallback;

  const provider = error.provider ? ` Provider: ${error.provider}.` : "";
  return `${error.message} Code: ${error.code}. Request: ${error.requestId}.${provider}`;
}

export async function requestClaudeRefinement(
  payload: ClaudeRequestPayload,
): Promise<ClaudeRefinement> {
  let response: Response;

  try {
    response = await fetch("/api/priceplan", {
      method: "POST",
      signal: timeoutSignal(localApiTimeoutMs),
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw new Error("Claude request timed out after 30 seconds. The deterministic pricing model is still available.");
    }

    throw error;
  }

  const data = (await response.json().catch(() => ({
    ok: false,
    error: {
      code: "UNREADABLE_RESPONSE",
      message: "Claude returned an unreadable response.",
      requestId: "unknown",
      provider: "anthropic",
    },
  }))) as ClaudeResponse;

  if (!response.ok || !data.ok) {
    throw new Error(data.ok ? "Claude request failed." : apiErrorMessage(data.error, "Claude request failed."));
  }

  return data.refinement;
}

export async function requestFlockSovereignRefinement(
  payload: SovereignRequestPayload,
): Promise<FlockSovereignRefinement> {
  let response: Response;

  try {
    response = await fetch("/api/sovereign-review", {
      method: "POST",
      signal: timeoutSignal(localApiTimeoutMs),
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw new Error("FLock request timed out after 30 seconds. The deterministic sovereign review is still available.");
    }

    throw error;
  }

  const data = (await response.json().catch(() => ({
    ok: false,
    error: {
      code: "UNREADABLE_RESPONSE",
      message: "FLock returned an unreadable response.",
      requestId: "unknown",
      provider: "flock",
    },
  }))) as FlockResponse;

  if (!response.ok || !data.ok) {
    throw new Error(data.ok ? "FLock request failed." : apiErrorMessage(data.error, "FLock request failed."));
  }

  return data.refinement;
}

export async function requestProviderStatus(): Promise<ProviderStatusSuccessResponse> {
  let response: Response;

  try {
    response = await fetch("/api/provider-status", {
      method: "GET",
      signal: timeoutSignal(5_000),
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw new Error("Provider status check timed out after 5 seconds.");
    }

    throw error;
  }

  const data = (await response.json().catch(() => ({
    ok: false,
    error: {
      code: "UNREADABLE_RESPONSE",
      message: "Provider status returned an unreadable response.",
      requestId: "unknown",
    },
  }))) as ProviderStatusResponse;

  if (!response.ok || !data.ok) {
    throw new Error(data.ok ? "Provider status check failed." : apiErrorMessage(data.error, "Provider status check failed."));
  }

  return data;
}
