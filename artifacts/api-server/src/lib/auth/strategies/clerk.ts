import { clerkMiddleware, getAuth } from "@clerk/express";
import { resolveClerkPublishableKey } from "@workspace/clerk-config";
import type { Express, NextFunction, Response } from "express";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "../../../middlewares/clerkProxyMiddleware";
import type { AuthRequest, AuthStrategy } from "../types";

/**
 * Clerk auth strategy.
 *
 * Adds:
 *   - CLERK_PROXY_PATH middleware (for Replit-style proxied deployments)
 *   - global clerkMiddleware that decodes the session cookie
 *
 * `requireAuth` reads the decoded auth and 401s if no userId is present.
 */
export const clerkStrategy: AuthStrategy = {
  kind: "clerk",

  install(app: Express): void {
    app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());
    app.use(
      clerkMiddleware((req) => ({
        publishableKey: resolveClerkPublishableKey(
          getClerkProxyHost(req) ?? req.hostname ?? "localhost",
          process.env.CLERK_PUBLISHABLE_KEY,
        ),
      })),
    );
  },

  requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    req.userId = userId;
    req.authProvider = "clerk";
    next();
  },
};
