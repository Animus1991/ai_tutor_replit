import { describe, expect, it } from "vitest";
import {
  DEV_USER,
  isLocalDevHost,
  isPlaceholderKey,
  resolveClerkProxyUrl,
  resolveClerkPublishableKey,
  resolveClerkSecretKey,
  shouldBypassClerk,
} from "./index";

describe("isLocalDevHost", () => {
  it("matches localhost variants", () => {
    expect(isLocalDevHost("localhost")).toBe(true);
    expect(isLocalDevHost("127.0.0.1")).toBe(true);
    expect(isLocalDevHost("foo.local")).toBe(true);
  });

  it("rejects production hostnames", () => {
    expect(isLocalDevHost("app.example.com")).toBe(false);
    expect(isLocalDevHost("clerk.acme.io")).toBe(false);
  });
});

describe("isPlaceholderKey", () => {
  it("detects empty and undefined", () => {
    expect(isPlaceholderKey(undefined)).toBe(true);
    expect(isPlaceholderKey("")).toBe(true);
    expect(isPlaceholderKey("   ")).toBe(true);
  });

  it("detects common placeholder shapes", () => {
    expect(isPlaceholderKey("pk_test_REPLACE_ME")).toBe(true);
    expect(isPlaceholderKey("sk_test_REPLACE_ME")).toBe(true);
    expect(isPlaceholderKey("pk_test_...")).toBe(true);
    expect(isPlaceholderKey("paste_from_clerk_dashboard")).toBe(false);
  });

  it("accepts realistic keys", () => {
    expect(isPlaceholderKey("pk_test_aGFwcHkuZ2VrLmRldiQ")).toBe(false);
  });
});

describe("shouldBypassClerk", () => {
  it("respects explicit DEV_AUTH_BYPASS flag", () => {
    expect(shouldBypassClerk("acme.com", "pk_live_real_key", "true")).toBe(
      true,
    );
    expect(shouldBypassClerk("acme.com", "pk_live_real_key", "1")).toBe(true);
  });

  it("bypasses on localhost when key is placeholder", () => {
    expect(shouldBypassClerk("localhost", "pk_test_REPLACE_ME")).toBe(true);
    expect(shouldBypassClerk("localhost", undefined)).toBe(true);
  });

  it("does not bypass on production hosts even without key", () => {
    expect(shouldBypassClerk("acme.com", undefined)).toBe(false);
    expect(shouldBypassClerk("acme.com", "pk_test_REPLACE_ME")).toBe(false);
  });

  it("does not bypass on localhost with real key", () => {
    expect(shouldBypassClerk("localhost", "pk_test_aGFwcHkuZ2VrLmRldiQ")).toBe(
      false,
    );
  });
});

describe("resolveClerkPublishableKey", () => {
  it("throws on missing key", () => {
    expect(() => resolveClerkPublishableKey("acme.com", undefined)).toThrow(
      /Missing Clerk/,
    );
  });

  it("throws on placeholder", () => {
    expect(() =>
      resolveClerkPublishableKey("acme.com", "pk_test_REPLACE_ME"),
    ).toThrow(/placeholder/);
  });

  it("returns trimmed key for local dev", () => {
    expect(
      resolveClerkPublishableKey("localhost", " pk_test_aGFwcHkuZ2VrLmRldiQ "),
    ).toBe("pk_test_aGFwcHkuZ2VrLmRldiQ");
  });
});

describe("resolveClerkSecretKey", () => {
  it("rejects placeholder", () => {
    expect(() => resolveClerkSecretKey("sk_test_REPLACE_ME")).toThrow(
      /placeholder/,
    );
  });

  it("accepts real key", () => {
    expect(resolveClerkSecretKey("sk_test_aGFwcHkuZ2VrLmRldiQ")).toBe(
      "sk_test_aGFwcHkuZ2VrLmRldiQ",
    );
  });
});

describe("resolveClerkProxyUrl", () => {
  it("returns undefined for localhost", () => {
    expect(resolveClerkProxyUrl("localhost", "https://acme.com/clerk")).toBe(
      undefined,
    );
  });

  it("returns undefined when proxy url is empty", () => {
    expect(resolveClerkProxyUrl("acme.com", undefined)).toBe(undefined);
    expect(resolveClerkProxyUrl("acme.com", "")).toBe(undefined);
  });

  it("returns trimmed proxy url for production", () => {
    expect(resolveClerkProxyUrl("acme.com", "  https://acme.com/clerk  ")).toBe(
      "https://acme.com/clerk",
    );
  });
});

describe("DEV_USER", () => {
  it("has stable identifier", () => {
    expect(DEV_USER.id).toBe("dev-user-local");
    expect(DEV_USER.email).toContain("@");
  });
});
