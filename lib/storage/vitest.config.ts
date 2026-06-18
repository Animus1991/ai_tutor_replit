import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@workspace/storage",
    environment: "node",
    include: ["src/**/*.test.ts"],
    globals: false,
  },
});
