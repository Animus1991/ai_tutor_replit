/**
 * Better Auth React client.
 *
 * Connects to /api/auth on the backend (proxied through Vite in dev,
 * same-origin in prod). Only instantiated when AUTH_PROVIDER=better-auth
 * — under Clerk or bypass mode this module is never imported.
 */
import { createAuthClient } from "better-auth/react";

const baseURL =
  import.meta.env.VITE_BETTER_AUTH_URL ??
  (typeof window !== "undefined"
    ? `${window.location.origin}`
    : "http://localhost:8080");

export const betterAuthClient = createAuthClient({
  baseURL,
  basePath: "/api/auth",
});

export const { signIn, signUp, signOut, useSession } = betterAuthClient;
