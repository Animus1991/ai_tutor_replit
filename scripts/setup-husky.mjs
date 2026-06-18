import { spawnSync } from "node:child_process";
/**
 * Idempotent husky setup.
 *
 * Runs automatically after every `pnpm install` (via the root `prepare`
 * lifecycle script). Skips silently if:
 *   - Not inside a git repository (CI checkouts without .git, fresh templates)
 *   - husky binary not installed yet (first-time install will retry on next run)
 *   - CI environment (CI=true) — most CI providers don't need git hooks
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

if (process.env.CI === "true" || process.env.CI === "1") {
  process.exit(0);
}

if (!existsSync(path.join(repoRoot, ".git"))) {
  process.exit(0);
}

const huskyBin = path.join(repoRoot, "node_modules", ".bin", "husky");
if (!existsSync(huskyBin) && !existsSync(`${huskyBin}.cmd`)) {
  process.exit(0);
}

const result = spawnSync("husky", [], {
  cwd: repoRoot,
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 0);
