import { afterEach, describe, expect, it } from "vitest";
import { isStorageConfigured } from "./index";

describe("isStorageConfigured", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns false when no storage vars set", () => {
    process.env.STORAGE_ENDPOINT = undefined;
    process.env.STORAGE_BUCKET = undefined;
    process.env.STORAGE_ACCESS_KEY = undefined;
    process.env.STORAGE_SECRET_KEY = undefined;
    expect(isStorageConfigured()).toBe(false);
  });

  it("returns false when only some vars set", () => {
    process.env.STORAGE_ENDPOINT = "http://localhost:9000";
    process.env.STORAGE_BUCKET = undefined;
    process.env.STORAGE_ACCESS_KEY = "x";
    process.env.STORAGE_SECRET_KEY = "y";
    expect(isStorageConfigured()).toBe(false);
  });

  it("returns true when all storage vars set", () => {
    process.env.STORAGE_ENDPOINT = "http://localhost:9000";
    process.env.STORAGE_BUCKET = "test-bucket";
    process.env.STORAGE_ACCESS_KEY = "access";
    process.env.STORAGE_SECRET_KEY = "secret";
    expect(isStorageConfigured()).toBe(true);
  });
});
