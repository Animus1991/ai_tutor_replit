/**
 * Unified auth hooks for the frontend.
 *
 * Three providers supported, picked at module-load time:
 *   - "clerk"        → Clerk hooks (default when keys are real)
 *   - "better-auth"  → custom self-hosted (VITE_AUTH_PROVIDER=better-auth)
 *   - "bypass"       → mock dev user (VITE_DEV_AUTH_BYPASS=true)
 *
 * Every component imports `useUser`, `useAuth`, `useClerk` from this file
 * and never touches a specific provider's package. Switching providers in
 * production is a one-line env change with no code changes anywhere else.
 */
import {
  useAuth as useClerkAuth,
  useClerk as useClerkClerk,
  useUser as useClerkUser,
} from "@clerk/react";
import { shouldBypassClerk } from "@workspace/clerk-config";
import {
  signOut as betterSignOut,
  useSession as useBetterSession,
} from "./betterAuthClient";
import { useDevAuth } from "./devAuthProvider";

export type AuthProviderKind = "clerk" | "better-auth" | "bypass";

const hostname =
  typeof window !== "undefined" ? window.location.hostname : "localhost";

function detectProvider(): AuthProviderKind {
  const explicit = import.meta.env.VITE_AUTH_PROVIDER?.toLowerCase() as
    | AuthProviderKind
    | undefined;
  if (
    explicit === "clerk" ||
    explicit === "better-auth" ||
    explicit === "bypass"
  ) {
    return explicit;
  }
  if (
    shouldBypassClerk(
      hostname,
      import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
      import.meta.env.VITE_DEV_AUTH_BYPASS,
    )
  ) {
    return "bypass";
  }
  return "clerk";
}

export const authProvider: AuthProviderKind = detectProvider();
export const isBypassMode = authProvider === "bypass";
export const isClerkMode = authProvider === "clerk";
export const isBetterAuthMode = authProvider === "better-auth";

type UseUserReturn = ReturnType<typeof useClerkUser>;
type UseClerkReturn = ReturnType<typeof useClerkClerk>;
type UseAuthReturn = ReturnType<typeof useClerkAuth>;

interface BetterUserShape {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  imageUrl: string;
  primaryEmailAddress: { emailAddress: string };
}

function adaptBetterUser(
  session: ReturnType<typeof useBetterSession>,
): BetterUserShape | null {
  const u = session.data?.user;
  if (!u) return null;
  const [first, ...rest] = (u.name ?? "").split(" ");
  const last = rest.join(" ") || "";
  return {
    id: u.id,
    firstName: first ?? "",
    lastName: last,
    fullName: u.name ?? u.email,
    imageUrl: u.image ?? "",
    primaryEmailAddress: { emailAddress: u.email },
  };
}

export function useUser(): UseUserReturn {
  if (authProvider === "bypass") {
    const dev = useDevAuth();
    return {
      isLoaded: dev.isLoaded,
      isSignedIn: dev.isSignedIn,
      user: dev.user,
    } as unknown as UseUserReturn;
  }
  if (authProvider === "better-auth") {
    const session = useBetterSession();
    return {
      isLoaded: !session.isPending,
      isSignedIn: Boolean(session.data?.user),
      user: adaptBetterUser(session),
    } as unknown as UseUserReturn;
  }
  return useClerkUser();
}

export function useClerk(): UseClerkReturn {
  if (authProvider === "bypass") {
    const dev = useDevAuth();
    return {
      signOut: dev.signOut,
      user: dev.user,
      session: null,
      loaded: dev.isLoaded,
      addListener: () => () => {},
      openSignIn: () => {},
      openSignUp: () => {},
      openUserProfile: () => {},
      redirectToSignIn: () => Promise.resolve(),
      redirectToSignUp: () => Promise.resolve(),
    } as unknown as UseClerkReturn;
  }
  if (authProvider === "better-auth") {
    return {
      signOut: async () => {
        await betterSignOut();
        if (typeof window !== "undefined") window.location.href = "/sign-in";
      },
      user: null,
      session: null,
      loaded: true,
      addListener: () => () => {},
      openSignIn: () => {
        if (typeof window !== "undefined") window.location.href = "/sign-in";
      },
      openSignUp: () => {
        if (typeof window !== "undefined") window.location.href = "/sign-up";
      },
      openUserProfile: () => {},
      redirectToSignIn: async () => {
        if (typeof window !== "undefined") window.location.href = "/sign-in";
      },
      redirectToSignUp: async () => {
        if (typeof window !== "undefined") window.location.href = "/sign-up";
      },
    } as unknown as UseClerkReturn;
  }
  return useClerkClerk();
}

export function useAuth(): UseAuthReturn {
  if (authProvider === "bypass") {
    const dev = useDevAuth();
    return {
      isLoaded: dev.isLoaded,
      isSignedIn: dev.isSignedIn,
      userId: dev.userId,
      sessionId: "dev-session-local",
      orgId: null,
      orgRole: null,
      orgSlug: null,
      actor: null,
      getToken: async () => "dev-mock-token",
      signOut: dev.signOut,
    } as unknown as UseAuthReturn;
  }
  if (authProvider === "better-auth") {
    const session = useBetterSession();
    return {
      isLoaded: !session.isPending,
      isSignedIn: Boolean(session.data?.user),
      userId: session.data?.user?.id ?? null,
      sessionId: session.data?.session?.id ?? null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      actor: null,
      getToken: async () => session.data?.session?.token ?? null,
      signOut: async () => {
        await betterSignOut();
      },
    } as unknown as UseAuthReturn;
  }
  return useClerkAuth();
}
