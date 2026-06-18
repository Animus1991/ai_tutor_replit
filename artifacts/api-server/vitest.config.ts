import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@workspace/api-server",
    environment: "node",
    include: ["src/**/*.test.ts"],
    globals: false,
    env: {
      AI_MOCK_RESPONSES: "true",
      DEV_AUTH_BYPASS: "true",
      DATABASE_URL: "postgresql://test:test@localhost:5432/test_unused",
    },
  },
  resolve: {
    alias: {
      "@workspace/db": path.resolve(__dirname, "../../lib/db/src"),
      "@workspace/api-zod": path.resolve(__dirname, "../../lib/api-zod/src"),
      "@workspace/clerk-config": path.resolve(
        __dirname,
        "../../lib/clerk-config/src",
      ),
      "@workspace/storage": path.resolve(__dirname, "../../lib/storage/src"),
    },
  },
});
