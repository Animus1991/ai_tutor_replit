import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@workspace/clerk-config",
    environment: "node",
    include: ["src/**/*.test.ts"],
    globals: false,
  },
});
