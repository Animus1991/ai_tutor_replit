import { Loader2 } from "lucide-react";
import { type ComponentType, Suspense, lazy } from "react";

function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

/** Lazy-load a page component with a shared Suspense fallback. */
export function lazyPage(factory: () => Promise<{ default: ComponentType }>) {
  const Lazy = lazy(factory);
  return function LazyPage() {
    return (
      <Suspense fallback={<PageLoader />}>
        <Lazy />
      </Suspense>
    );
  };
}

export { PageLoader };
