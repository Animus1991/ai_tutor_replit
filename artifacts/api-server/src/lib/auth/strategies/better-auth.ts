import { db } from "@workspace/db";
import {
  authAccountTable,
  authSessionTable,
  authUserTable,
  authVerificationTable,
} from "@workspace/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { Express, NextFunction, Response } from "express";
import type { AuthRequest, AuthStrategy } from "../types";

/**
 * Better Auth strategy.
 *
 * Self-hosted authentication using:
 *   - Drizzle adapter on the project's Postgres (auth_user/session/etc)
 *   - Cookie sessions (httpOnly, secure in production)
 *   - Email/password by default, with optional social providers
 *
 * Mounts all client routes under /api/auth/* (signIn, signUp, signOut,
 * forgotPassword, etc). The frontend `betterAuthClient` calls those.
 */

function buildAuth() {
  const secret =
    process.env.BETTER_AUTH_SECRET ??
    process.env.SESSION_SECRET ??
    "dev-secret-change-me-in-production";

  const baseURL =
    process.env.BETTER_AUTH_URL ??
    process.env.PUBLIC_URL ??
    "http://localhost:8080";

  const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return betterAuth({
    secret,
    baseURL,
    basePath: "/api/auth",
    trustedOrigins: trustedOrigins.length
      ? trustedOrigins
      : ["http://localhost:20579", "http://localhost:8080"],
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: authUserTable,
        session: authSessionTable,
        account: authAccountTable,
        verification: authVerificationTable,
      },
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      minPasswordLength: 8,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24, // refresh once per day
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
      },
    },
    advanced: {
      cookiePrefix: "ai-tutor",
      useSecureCookies: process.env.NODE_ENV === "production",
    },
  });
}

let authInstance: ReturnType<typeof buildAuth> | null = null;

function getAuth() {
  if (!authInstance) {
    authInstance = buildAuth();
  }
  return authInstance;
}

export const betterAuthStrategy: AuthStrategy = {
  kind: "better-auth",

  install(_app: Express): void {
    // Eagerly build to surface config errors at startup, not first request.
    getAuth();
  },

  mountRoutes(app: Express, basePath: string): void {
    const auth = getAuth();
    // Better Auth exposes a single fetch-style handler — adapt to Express.
    // Express 5 / path-to-regexp v8 requires a named wildcard: /api/auth/*splat
    app.all(`${basePath}/*splat`, async (req, res) => {
      const url = new URL(req.originalUrl, `http://${req.headers.host}`);
      const headers = new Headers();
      for (const [k, v] of Object.entries(req.headers)) {
        if (Array.isArray(v)) headers.set(k, v.join(","));
        else if (typeof v === "string") headers.set(k, v);
      }
      const body =
        req.method === "GET" || req.method === "HEAD"
          ? undefined
          : JSON.stringify(req.body ?? {});
      const fetchReq = new Request(url.toString(), {
        method: req.method,
        headers,
        body,
      });
      const response = await auth.handler(fetchReq);
      res.status(response.status);
      response.headers.forEach((value, key) => res.setHeader(key, value));
      const text = await response.text();
      res.send(text);
    });
  },

  async requireAuth(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const auth = getAuth();
      const headers = new Headers();
      for (const [k, v] of Object.entries(req.headers)) {
        if (Array.isArray(v)) headers.set(k, v.join(","));
        else if (typeof v === "string") headers.set(k, v);
      }
      const session = await auth.api.getSession({ headers });
      if (!session?.user?.id) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      req.userId = session.user.id;
      req.authProvider = "better-auth";
      next();
    } catch (err) {
      res.status(401).json({ error: "Unauthorized", details: String(err) });
    }
  },
};
