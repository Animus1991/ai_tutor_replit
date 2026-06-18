import type { Express, NextFunction, Request, Response } from "express";

/**
 * Generic auth strategy interface.
 *
 * Three concrete implementations exist:
 *  - clerk         → @clerk/express middleware + getAuth
 *  - better-auth   → custom Drizzle-backed sessions
 *  - bypass        → mock dev user (DEV_AUTH_BYPASS=true)
 *
 * `selectAuthStrategy()` picks one at app startup based on env vars.
 * All route handlers depend only on `AuthStrategy.requireAuth`, so the
 * underlying provider is fully swappable without touching business logic.
 */
export type AuthProviderKind = "clerk" | "better-auth" | "bypass";

export interface AuthRequest extends Request {
  userId?: string;
  authProvider?: AuthProviderKind;
}

export interface AuthStrategy {
  kind: AuthProviderKind;

  /** Install any global Express middleware (e.g. Clerk's session decoder). */
  install(app: Express): void;

  /** Express middleware that 401s if no signed-in user; otherwise sets req.userId. */
  requireAuth(req: AuthRequest, res: Response, next: NextFunction): void;

  /** Optionally mount provider-specific routes (e.g. Better Auth's /api/auth/*). */
  mountRoutes?(app: Express, basePath: string): void;
}
