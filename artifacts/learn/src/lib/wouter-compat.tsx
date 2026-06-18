import {
  Link as TSRLink,
  useLocation as useTSRLocation,
  useNavigate as useTSRNavigate,
  useParams as useTSRParams,
  useSearch as useTSRSearch,
} from "@tanstack/react-router";
/**
 * Compatibility layer: Wouter-like API on top of TanStack Router.
 *
 * Why this exists:
 *   The codebase was originally written against the `wouter` API.
 *   We migrated the router to `@tanstack/react-router` for type-safe routes,
 *   loaders, search params, and better DX — but rewriting 13 pages at once
 *   is risky. This shim lets every existing page keep working unchanged
 *   while new code can import directly from `@tanstack/react-router`.
 *
 *   Once all pages are migrated to native TanStack patterns this file
 *   can be deleted.
 */
import { type ComponentProps, type ReactNode, forwardRef } from "react";

interface WouterLinkProps extends Omit<ComponentProps<"a">, "href"> {
  href?: string;
  to?: string;
  children?: ReactNode;
  replace?: boolean;
}

/**
 * Wouter-style `<Link href="/path">` rendered via TanStack Router's `<Link>`.
 * Accepts both `href` (wouter) and `to` (TanStack) for forward compatibility.
 */
export const Link = forwardRef<HTMLAnchorElement, WouterLinkProps>(
  function Link({ href, to, replace, children, ...rest }, ref) {
    const target = to ?? href ?? "/";
    return (
      <TSRLink ref={ref} to={target} replace={replace} {...rest}>
        {children}
      </TSRLink>
    );
  },
);

/**
 * Wouter `useLocation()` returns `[path, setLocation]`.
 * We emulate it on top of TanStack's `useLocation` + `useNavigate`.
 */
export function useLocation(): [
  string,
  (path: string, options?: { replace?: boolean }) => void,
] {
  const { pathname } = useTSRLocation();
  const navigate = useTSRNavigate();
  const setLocation = (path: string, options?: { replace?: boolean }) => {
    void navigate({ to: path, replace: options?.replace });
  };
  return [pathname, setLocation];
}

/**
 * Wouter `useRoute(pattern)` returns `[match, params]`.
 * We map it to TanStack's `useParams` and a pathname-based match.
 * The pattern is expected in wouter form: "/notes/:id".
 */
export function useRoute<
  TParams extends Record<string, string> = Record<string, string>,
>(pattern: string): [boolean, TParams | null] {
  const { pathname } = useTSRLocation();
  const params = useTSRParams({ strict: false }) as Record<string, string>;
  const segments = pattern.split("/").filter(Boolean);
  const pathSegments = pathname.split("/").filter(Boolean);

  if (segments.length !== pathSegments.length) return [false, null];

  const collected: Record<string, string> = {};
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    const part = pathSegments[i]!;
    if (seg.startsWith(":")) {
      collected[seg.slice(1)] = part;
    } else if (seg !== part) {
      return [false, null];
    }
  }

  return [true, { ...params, ...collected } as TParams];
}

/**
 * Wouter `useSearch()` returns the raw query string (without leading "?").
 */
export function useSearch(): string {
  const search = useTSRSearch({ strict: false });
  if (!search || Object.keys(search).length === 0) return "";
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(search)) {
    if (v == null) continue;
    params.set(k, String(v));
  }
  return params.toString();
}

/**
 * Wouter-style `<Redirect to="/x" />`.
 */
export function Redirect({
  to,
  replace = true,
}: {
  to: string;
  replace?: boolean;
}): null {
  const navigate = useTSRNavigate();
  if (typeof window !== "undefined") {
    queueMicrotask(() => {
      void navigate({ to, replace });
    });
  }
  return null;
}
