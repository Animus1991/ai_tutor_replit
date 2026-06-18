import { isPlaceholderKey } from "@workspace/clerk-config";
/**
 * Auth provider selector + unified middleware export.
 *
 * Selection rules (first match wins):
 *   1. AUTH_PROVIDER env var set explicitly to clerk|better-auth|bypass
 *   2. DEV_AUTH_BYPASS=true  → bypass
 *   3. BETTER_AUTH_SECRET set → better-auth
 *   4. CLERK_SECRET_KEY set (and not placeholder) → clerk
 *   5. Fallback → bypass with loud warning
 *
 * The selected strategy is created once at module load. Everything else in
 * the app imports `requireAuth` / `getAuthProvider` from here and never
 * touches Clerk or Better Auth directly.
 */
import type { Express } from "express";
import { logger } from "../logger";
import { betterAuthStrategy } from "./strategies/better-auth";
import { bypassStrategy } from "./strategies/bypass";
import { clerkStrategy } from "./strategies/clerk";
import type { AuthProviderKind, AuthStrategy } from "./types";

function selectStrategy(): AuthStrategy {
  const explicit = process.env.AUTH_PROVIDER?.toLowerCase() as
    | AuthProviderKind
    | undefined;

  if (explicit === "clerk") return clerkStrategy;
  if (explicit === "better-auth") return betterAuthStrategy;
  if (explicit === "bypass") return bypassStrategy;

  if (
    process.env.DEV_AUTH_BYPASS === "true" ||
    process.env.DEV_AUTH_BYPASS === "1"
  ) {
    return bypassStrategy;
  }

  if (process.env.BETTER_AUTH_SECRET?.trim()) {
    return betterAuthStrategy;
  }

  if (!isPlaceholderKey(process.env.CLERK_SECRET_KEY)) {
    return clerkStrategy;
  }

  logger.warn(
    "No auth provider configured — falling back to bypass mode. Set AUTH_PROVIDER, BETTER_AUTH_SECRET, or CLERK_SECRET_KEY to choose one.",
  );
  return bypassStrategy;
}

const activeStrategy = selectStrategy();

logger.info(
  { authProvider: activeStrategy.kind },
  `Auth strategy: ${activeStrategy.kind}`,
);

export function getAuthProvider(): AuthProviderKind {
  return activeStrategy.kind;
}

export function installAuth(app: Express): void {
  activeStrategy.install(app);
  activeStrategy.mountRoutes?.(app, "/api/auth");
}

export const requireAuth = activeStrategy.requireAuth.bind(activeStrategy);

export type { AuthRequest } from "./types";
