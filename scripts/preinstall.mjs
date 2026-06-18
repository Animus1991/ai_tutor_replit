import fs from "node:fs";

const ua = process.env.npm_config_user_agent ?? "";
if (!ua.includes("pnpm")) {
  console.error("Use pnpm instead");
  process.exit(1);
}

for (const lockFile of ["package-lock.json", "yarn.lock"]) {
  try {
    fs.unlinkSync(lockFile);
  } catch {
    // ignore missing lock files
  }
}
