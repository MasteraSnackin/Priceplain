import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = mkdtempSync(join(tmpdir(), "priceplain-domain-"));
const tscBin = join(projectRoot, "node_modules", "typescript", "bin", "tsc");

try {
  const compile = spawnSync(
    process.execPath,
    [
      tscBin,
      "--target",
      "ES2022",
      "--module",
      "CommonJS",
      "--moduleResolution",
      "Node",
      "--rootDir",
      ".",
      "--outDir",
      outDir,
      "--skipLibCheck",
      "--strict",
      "--noEmitOnError",
      "true",
      "scripts/domain-tests.ts",
      "src/pricingEngine.ts",
      "src/sovereignReview.ts",
      "src/demoData.ts",
      "src/types.ts",
    ],
    {
      cwd: projectRoot,
      stdio: "inherit",
    },
  );

  if (compile.status !== 0) {
    process.exitCode = compile.status ?? 1;
    process.exit();
  }

  const run = spawnSync(process.execPath, [join(outDir, "scripts", "domain-tests.js")], {
    cwd: projectRoot,
    stdio: "inherit",
  });

  if (run.status !== 0) {
    process.exitCode = run.status ?? 1;
  }
} finally {
  rmSync(outDir, { force: true, recursive: true });
}
