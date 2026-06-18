import { publishableKeyFromHost } from "@clerk/shared/keys";

const PLACEHOLDER_PATTERN =
  /REPLACE_ME|\.\.\.|^pk_test_\.\.\.$|^sk_test_\.\.\.$/;

export function isLocalDevHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".local")
  );
}

export function isPlaceholderKey(envKey: string | undefined): boolean {
  if (!envKey?.trim()) return true;
  return PLACEHOLDER_PATTERN.test(envKey);
}

/**
 * Dev-mode auth bypass detector.
 *
 * Returns true when the app should skip Clerk and use a mock user.
 * Triggered when:
 *   - DEV_AUTH_BYPASS env var is set to "true" or "1", OR
 *   - We are on a local dev host (localhost/127.0.0.1/.local) AND
 *     the Clerk publishable key is missing or still a placeholder.
 *
 * Production deployments always have valid keys, so this returns false there.
 */
export function shouldBypassClerk(
  hostname: string,
  envKey: string | undefined,
  bypassFlag?: string | undefined,
): boolean {
  if (bypassFlag === "true" || bypassFlag === "1") return true;
  return isLocalDevHost(hostname) && isPlaceholderKey(envKey);
}

/**
 * Stable mock user used when Clerk bypass is active. The userId is
 * consistent across requests so that notes, courses, progress, etc. stay
 * associated with the same dev account.
 */
export const DEV_USER = {
  id: "dev-user-local",
  email: "dev@localhost",
  firstName: "Dev",
  lastName: "User",
} as const;

export function resolveClerkPublishableKey(
  hostname: string,
  envKey: string | undefined,
): string {
  if (!envKey?.trim()) {
    throw new Error(
      "Missing Clerk publishable key. Set CLERK_PUBLISHABLE_KEY (API) or VITE_CLERK_PUBLISHABLE_KEY (frontend) in .env — see .env.example. Or set DEV_AUTH_BYPASS=true for local development without Clerk.",
    );
  }

  if (PLACEHOLDER_PATTERN.test(envKey)) {
    throw new Error(
      "Clerk publishable key is still a placeholder. Paste real keys from https://dashboard.clerk.com into .env and artifacts/learn/.env. Or set DEV_AUTH_BYPASS=true to skip Clerk for local development.",
    );
  }

  if (isLocalDevHost(hostname)) {
    return envKey.trim();
  }

  return publishableKeyFromHost(hostname, envKey);
}

export function resolveClerkSecretKey(envKey: string | undefined): string {
  if (!envKey?.trim()) {
    throw new Error(
      "Missing CLERK_SECRET_KEY in .env — see .env.example. Or set DEV_AUTH_BYPASS=true for local development.",
    );
  }

  if (PLACEHOLDER_PATTERN.test(envKey)) {
    throw new Error(
      "CLERK_SECRET_KEY is still a placeholder. Paste real keys from https://dashboard.clerk.com into .env. Or set DEV_AUTH_BYPASS=true.",
    );
  }

  return envKey.trim();
}

export function resolveClerkProxyUrl(
  hostname: string,
  proxyUrl: string | undefined,
): string | undefined {
  if (!proxyUrl?.trim() || isLocalDevHost(hostname)) {
    return undefined;
  }

  return proxyUrl.trim();
}
