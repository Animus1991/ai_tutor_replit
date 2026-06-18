import { createRequire } from "node:module";
import os from "node:os";

if (os.platform() !== "win32" || os.arch() !== "x64") {
  process.exit(0);
}

const require = createRequire(import.meta.url);

const checks = [
  "@rollup/rollup-win32-x64-msvc",
  "lightningcss-win32-x64-msvc",
  "@tailwindcss/oxide-win32-x64-msvc",
];

const missing = checks.filter((pkg) => {
  try {
    require.resolve(pkg);
    return false;
  } catch {
    return true;
  }
});

if (missing.length === 0) {
  process.exit(0);
}

console.warn(
  [
    "Missing Windows native packages:",
    missing.join(", "),
    "",
    "Fix: Remove node_modules folders, then run pnpm install again.",
    "Prefer Node.js 24 LTS over Node 25 if issues persist.",
  ].join("\n"),
);
