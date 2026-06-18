import { describe, expect, it } from "vitest";
import { authProvider, isBypassMode } from "./auth";

describe("authProvider selection (test env)", () => {
  it("falls back to a deterministic value", () => {
    expect(["clerk", "better-auth", "bypass"]).toContain(authProvider);
  });

  it("exports a boolean isBypassMode flag", () => {
    expect(typeof isBypassMode).toBe("boolean");
  });
});
