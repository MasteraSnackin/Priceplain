import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { handlePriceplan } from "./api/priceplan";
import { handleProviderStatus } from "./api/provider-status";
import { handleSovereignReview } from "./api/sovereign-review";
import { ApiError, createRequestId, errorResult, methodNotAllowed } from "./api/errors";

type LocalHandler = (payload: any, requestId?: string) => Promise<{
  status: number;
  body: unknown;
}>;

function apiMiddleware(handler: LocalHandler) {
  return async (req: any, res: any) => {
    const requestId = createRequestId();

    if (req.method !== "POST") {
      const result = methodNotAllowed(requestId);
      res.statusCode = result.status;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(result.body));
      return;
    }

    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on("end", async () => {
      try {
        const payload = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
        const result = await handler(payload, requestId);
        res.statusCode = result.status;
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify(result.body));
      } catch (error) {
        const result = errorResult(
          error instanceof SyntaxError
            ? new ApiError("INVALID_JSON", "Request body must be valid JSON.", 400)
            : error,
          requestId,
        );
        res.statusCode = result.status;
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify(result.body));
      }
    });
  };
}

function statusMiddleware() {
  return (req: any, res: any) => {
    const requestId = createRequestId();

    if (req.method !== "GET") {
      const result = methodNotAllowed(requestId, ["GET"]);
      res.statusCode = result.status;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(result.body));
      return;
    }

    const result = handleProviderStatus(requestId);
    res.statusCode = result.status;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(result.body));
  };
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: "priceplain-local-api",
      configureServer(server) {
        server.middlewares.use("/api/priceplan", apiMiddleware(handlePriceplan));
        server.middlewares.use("/api/provider-status", statusMiddleware());
        server.middlewares.use("/api/sovereign-review", apiMiddleware(handleSovereignReview));
      },
    },
  ],
});
