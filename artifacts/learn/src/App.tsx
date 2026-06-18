import { authProvider, useClerk, useUser } from "@/lib/auth";
import { ClerkProvider } from "@clerk/react";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import {
  resolveClerkProxyUrl,
  resolveClerkPublishableKey,
} from "@workspace/clerk-config";
import { useEffect, useRef } from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSession as useBetterSession } from "@/lib/betterAuthClient";
import { clerkAppearance } from "@/lib/clerkAppearance";
import { DevAuthProvider } from "@/lib/devAuthProvider";
import { router } from "@/router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

const hostname =
  typeof window !== "undefined" ? window.location.hostname : "localhost";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function RouterWithClerkAuth() {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded) return null;

  return (
    <RouterProvider
      router={router}
      context={{
        queryClient,
        isSignedIn: Boolean(isSignedIn),
      }}
    />
  );
}

function RouterWithBetterAuth() {
  const session = useBetterSession();
  if (session.isPending) return null;

  return (
    <RouterProvider
      router={router}
      context={{
        queryClient,
        isSignedIn: Boolean(session.data?.user),
      }}
    />
  );
}

function RouterAlwaysSignedIn() {
  return (
    <RouterProvider
      router={router}
      context={{ queryClient, isSignedIn: true }}
    />
  );
}

function App() {
  if (authProvider === "bypass") {
    if (typeof window !== "undefined") {
      console.warn(
        "[dev-auth-bypass] Auth is bypassed — using mock dev user. Set VITE_AUTH_PROVIDER to 'clerk' or 'better-auth' (with proper env) for real authentication.",
      );
    }
    return (
      <ErrorBoundary>
        <TooltipProvider>
          <DevAuthProvider>
            <QueryClientProvider client={queryClient}>
              <RouterAlwaysSignedIn />
            </QueryClientProvider>
          </DevAuthProvider>
          <Toaster />
        </TooltipProvider>
      </ErrorBoundary>
    );
  }

  if (authProvider === "better-auth") {
    return (
      <ErrorBoundary>
        <TooltipProvider>
          <QueryClientProvider client={queryClient}>
            <RouterWithBetterAuth />
          </QueryClientProvider>
          <Toaster />
        </TooltipProvider>
      </ErrorBoundary>
    );
  }

  const clerkPubKey = resolveClerkPublishableKey(
    hostname,
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  );
  const clerkProxyUrl = resolveClerkProxyUrl(
    hostname,
    import.meta.env.VITE_CLERK_PROXY_URL,
  );

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <ClerkProvider
          publishableKey={clerkPubKey}
          proxyUrl={clerkProxyUrl}
          appearance={clerkAppearance}
          signInUrl={`${basePath}/sign-in`}
          signUpUrl={`${basePath}/sign-up`}
        >
          <QueryClientProvider client={queryClient}>
            <ClerkQueryClientCacheInvalidator />
            <RouterWithClerkAuth />
          </QueryClientProvider>
        </ClerkProvider>
        <Toaster />
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
