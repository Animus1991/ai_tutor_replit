import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Top-level React error boundary.
 *
 * Catches render-time exceptions anywhere below it and shows a recoverable
 * fallback UI instead of a blank screen. Production: logs to console
 * (replace with Sentry/PostHog when integrated). Dev: shows stack trace.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback(error, this.reset);
    }

    const isDev = import.meta.env.DEV;

    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 text-foreground dark">
        <div className="max-w-2xl w-full rounded-2xl border border-destructive/40 bg-destructive/5 p-8 shadow-xl">
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">
            The app hit an unrecoverable error. Try reloading the page.
          </p>
          {isDev ? (
            <pre className="text-xs bg-black/40 border border-border rounded-md p-4 overflow-auto max-h-80 whitespace-pre-wrap">
              <strong className="text-destructive">
                {error.name}: {error.message}
              </strong>
              {error.stack ? `\n\n${error.stack}` : null}
            </pre>
          ) : null}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={this.reset}
              className="rounded-lg border border-border px-4 py-2 font-medium hover:bg-white/5 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }
}
