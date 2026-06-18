import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["artifacts/**/src/**/*.{ts,tsx}", "lib/**/src/**/*.{ts,tsx}"],
      exclude: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/dist/**",
        "**/node_modules/**",
      ],
    },
  },
});
