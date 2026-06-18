import { DEV_USER } from "@workspace/clerk-config";
/**
 * Lightweight Clerk replacement for local development without Clerk keys.
 *
 * Exposes the small subset of Clerk hooks/components that the app uses,
 * but returns a stable mock user and no-op auth flows. Only loaded when
 * `shouldBypassClerk()` returns true (typically on localhost without keys).
 *
 * Production builds with valid Clerk keys never reach this provider.
 */
import { type ReactNode, createContext, useContext } from "react";

interface DevAuthContextValue {
  isSignedIn: true;
  isLoaded: true;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    imageUrl: string;
    primaryEmailAddress: { emailAddress: string };
  };
  signOut: () => Promise<void>;
}

const mockUser = {
  id: DEV_USER.id,
  firstName: DEV_USER.firstName,
  lastName: DEV_USER.lastName,
  fullName: `${DEV_USER.firstName} ${DEV_USER.lastName}`,
  imageUrl: "",
  primaryEmailAddress: { emailAddress: DEV_USER.email },
};

const DevAuthContext = createContext<DevAuthContextValue>({
  isSignedIn: true,
  isLoaded: true,
  userId: DEV_USER.id,
  user: mockUser,
  signOut: async () => {
    if (typeof window !== "undefined") {
      window.alert("Sign-out is disabled in DEV_AUTH_BYPASS mode.");
    }
  },
});

export function DevAuthProvider({ children }: { children: ReactNode }) {
  return (
    <DevAuthContext.Provider
      value={{
        isSignedIn: true,
        isLoaded: true,
        userId: DEV_USER.id,
        user: mockUser,
        signOut: async () => {
          if (typeof window !== "undefined") {
            window.alert("Sign-out is disabled in DEV_AUTH_BYPASS mode.");
          }
        },
      }}
    >
      {children}
    </DevAuthContext.Provider>
  );
}

export function useDevAuth(): DevAuthContextValue {
  return useContext(DevAuthContext);
}
