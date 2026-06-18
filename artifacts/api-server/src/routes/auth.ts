/**
 * Backwards-compatible re-exports.
 *
 * All routes used to import `requireAuth` from "./auth". The implementation
 * has moved to `lib/auth/index.ts` (provider-agnostic). Keep this file as a
 * thin shim so existing imports continue to work without churn.
 */
export { requireAuth } from "../lib/auth";
export type { AuthRequest } from "../lib/auth";
