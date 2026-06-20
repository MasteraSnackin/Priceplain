const baseUrl = (process.env.SMOKE_BASE_URL || "http://localhost:3001").replace(/\/$/, "");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(path, init = {}) {
  try {
    return await fetch(`${baseUrl}${path}`, init);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`${path} could not be reached at ${baseUrl}. Start npm run dev first. ${detail}`);
  }
}

async function readJson(response, path) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${path} returned non-JSON content: ${text.slice(0, 160)}`);
  }
}

async function expectAppShell(path) {
  const response = await request(path);
  assert(response.ok, `${path} returned HTTP ${response.status}`);
  const text = await response.text();
  assert(text.includes('<div id="root"></div>'), `${path} did not return the Vite app shell`);
}

async function expectApiError(path, init, expectedStatus, expectedCode) {
  const response = await request(path, init);
  const data = await readJson(response, path);
  assert(response.status === expectedStatus, `${path} returned HTTP ${response.status}, expected ${expectedStatus}`);
  assert(data.ok === false, `${path} did not return ok:false`);
  assert(data.error?.code === expectedCode, `${path} returned ${data.error?.code}, expected ${expectedCode}`);
  assert(typeof data.error?.message === "string" && data.error.message.length > 0, `${path} is missing an error message`);
  assert(typeof data.error?.requestId === "string" && data.error.requestId.length > 0, `${path} is missing a request id`);
}

async function expectProviderStatus() {
  const path = "/api/provider-status";
  const response = await request(path, { method: "GET" });
  const data = await readJson(response, path);
  assert(response.ok, `${path} returned HTTP ${response.status}`);
  assert(data.ok === true, `${path} did not return ok:true`);
  assert(typeof data.requestId === "string" && data.requestId.length > 0, `${path} is missing a request id`);
  assert(typeof data.providers?.anthropic?.configured === "boolean", `${path} is missing Anthropic key status`);
  assert(typeof data.providers?.flock?.configured === "boolean", `${path} is missing FLock key status`);
  assert(!("apiKey" in data.providers.anthropic), `${path} exposed an Anthropic key field`);
  assert(!("apiKey" in data.providers.flock), `${path} exposed a FLock key field`);
}

const checks = [
  [
    "home app shell",
    () => expectAppShell("/"),
  ],
  [
    "shareable business tab shell",
    () => expectAppShell("/?tab=business"),
  ],
  [
    "shareable sovereign tab shell",
    () => expectAppShell("/?tab=sovereign"),
  ],
  [
    "priceplan rejects GET",
    () => expectApiError("/api/priceplan", { method: "GET" }, 405, "METHOD_NOT_ALLOWED"),
  ],
  [
    "priceplan validates payload",
    () =>
      expectApiError(
        "/api/priceplan",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{}",
        },
        400,
        "VALIDATION_ERROR",
      ),
  ],
  [
    "provider status returns safe key state",
    () => expectProviderStatus(),
  ],
  [
    "sovereign review rejects GET",
    () => expectApiError("/api/sovereign-review", { method: "GET" }, 405, "METHOD_NOT_ALLOWED"),
  ],
  [
    "sovereign review validates payload",
    () =>
      expectApiError(
        "/api/sovereign-review",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{}",
        },
        400,
        "VALIDATION_ERROR",
      ),
  ],
  [
    "sovereign review rejects invalid JSON",
    () =>
      expectApiError(
        "/api/sovereign-review",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{",
        },
        400,
        "INVALID_JSON",
      ),
  ],
];

for (const [name, check] of checks) {
  await check();
  console.log(`ok - ${name}`);
}

console.log(`Smoke checks passed against ${baseUrl}`);
