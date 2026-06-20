import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const baseUrl = process.env.BROWSER_BASE_URL || "http://localhost:3001";
const chromeCandidates = [
  process.env.CHROME_BIN,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "google-chrome",
  "chromium",
  "chromium-browser",
].filter(Boolean);

const chrome = chromeCandidates.find((candidate) =>
  candidate.includes("/") ? existsSync(candidate) : true,
);

if (!chrome) {
  throw new Error("No Chrome or Chromium binary found. Set CHROME_BIN to run browser tests.");
}

const checks = [
  {
    name: "home",
    path: "/",
    contains: [
      "Priceplain",
      "Demo preset",
      "Copy report",
      "Briefly",
      "Pricing to billing workflow",
      "Design the model before wiring billing",
    ],
  },
  {
    name: "metering",
    path: "/?tab=metering",
    contains: [
      "Solvimon Handoff",
      "Solvimon import preview",
      "Example billing object",
      "Copy import JSON",
      "Download JSON",
      "priceplain.solvimon_preview.v1",
    ],
  },
  {
    name: "simulation",
    path: "/?tab=simulation",
    contains: ["What breaks the model?", "Model cost shock", "Usage spike"],
  },
  {
    name: "export",
    path: "/?tab=export",
    contains: ["Submission Pack", "Preset comparison", "Download Markdown", "Report text"],
  },
  {
    name: "business",
    path: "/?tab=business",
    contains: [
      "Startup Case",
      "The planning layer before usage-based billing.",
      "Founder pricing decisions happen before billing infrastructure.",
      "Priceplain is the missing planning layer",
    ],
  },
  {
    name: "sovereign",
    path: "/?tab=sovereign",
    contains: ["FLock Sovereign AI", "Procurement questions", "Institutional buyers"],
  },
];

function render(path) {
  const url = new URL(path, baseUrl).toString();
  const result = spawnSync(
    chrome,
    [
      "--headless",
      "--disable-gpu",
      "--no-first-run",
      "--disable-extensions",
      "--dump-dom",
      url,
    ],
    {
      encoding: "utf8",
      timeout: 20_000,
    },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Chrome failed for ${url}: ${result.stderr || result.stdout}`);
  }

  return result.stdout;
}

for (const check of checks) {
  const html = render(check.path);
  const missing = check.contains.filter((text) => !html.includes(text));

  if (missing.length > 0) {
    throw new Error(`${check.name} route missing expected text: ${missing.join(", ")}`);
  }
}

console.log(`Browser render checks passed for ${checks.length} routes at ${baseUrl}.`);
