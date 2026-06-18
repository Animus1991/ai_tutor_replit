import { DEV_USER } from "@workspace/clerk-config";
import type { Express, NextFunction, Response } from "express";
import type { AuthRequest, AuthStrategy } from "../types";

/**
 * Dev-only strategy: pretends every request is signed in as DEV_USER.
 *
 * Activated when DEV_AUTH_BYPASS=true (or AUTH_PROVIDER=bypass), which is
 * the default in the bundled .env so the project boots without any third
 * party. Logs a single warning at startup so it's obvious.
 */
export const bypassStrategy: AuthStrategy = {
  kind: "bypass",

  install(_app: Express): void {
    // No middleware required — requireAuth fills userId directly.
  },

  requireAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
    req.userId = DEV_USER.id;
    req.authProvider = "bypass";
    next();
  },
};
