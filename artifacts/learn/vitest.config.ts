import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    name: "@workspace/learn",
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    globals: false,
    setupFiles: ["./src/test-setup.ts"],
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@workspace/api-client-react": path.resolve(
        __dirname,
        "../../lib/api-client-react/src",
      ),
      "@workspace/clerk-config": path.resolve(
        __dirname,
        "../../lib/clerk-config/src",
      ),
    },
  },
});
