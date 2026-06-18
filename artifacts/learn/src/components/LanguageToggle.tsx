/**
 * LanguageToggle
 *
 * Compact EN/EL switcher.
 *  - Writes the choice to `localStorage("synapse.lang")` via the i18n hook.
 *  - When `syncToProfile` is true, also persists `preferredLanguage` to the
 *    backend profile so signed-in users see the same language across devices.
 *
 * Usage:
 *   <LanguageToggle />                          // navbar / landing — local only
 *   <LanguageToggle syncToProfile />            // in-app — also writes to API
 */

import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useUpdateProfile } from "@workspace/api-client-react";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
  syncToProfile?: boolean;
  className?: string;
  /** "compact" = icon + 2-letter code · "full" = English / Ελληνικά labels */
  variant?: "compact" | "full";
}

export function LanguageToggle({
  syncToProfile = false,
  className,
  variant = "compact",
}: LanguageToggleProps) {
  const { language, setLanguage, t } = useTranslation();
  const updateProfile = useUpdateProfile();

  const choose = (next: "en" | "el") => {
    if (next === language) return;
    setLanguage(next);
    if (syncToProfile) {
      // Fire-and-forget; failures are silent (still applied locally).
      updateProfile.mutate({ data: { preferredLanguage: next } as never });
    }
  };

  if (variant === "full") {
    return (
      <div
        role="radiogroup"
        aria-label={t("lang.toggle")}
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-border bg-card p-1",
          className,
        )}
      >
        <button
          role="radio"
          aria-checked={language === "en"}
          onClick={() => choose("en")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-all",
            language === "en"
              ? "bg-synapse-brand-600/20 text-synapse-brand-300"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t("lang.english")}
        </button>
        <button
          role="radio"
          aria-checked={language === "el"}
          onClick={() => choose("el")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-all",
            language === "el"
              ? "bg-synapse-brand-600/20 text-synapse-brand-300"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t("lang.greek")}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label={t("lang.toggle")}
      onClick={() => choose(language === "en" ? "el" : "en")}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-all hover:border-synapse-brand-500/40",
        className,
      )}
    >
      <Globe className="h-3.5 w-3.5 text-synapse-brand-400" />
      {language.toUpperCase()}
    </button>
  );
}
