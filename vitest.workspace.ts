import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "./artifacts/api-server/vitest.config.ts",
  "./artifacts/learn/vitest.config.ts",
  "./lib/clerk-config/vitest.config.ts",
  "./lib/storage/vitest.config.ts",
]);
