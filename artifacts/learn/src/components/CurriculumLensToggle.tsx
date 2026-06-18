import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { type CurriculumLens, useAppStore } from "@/stores/appStore";

const OPTIONS: { id: CurriculumLens; labelKey: string }[] = [
  { id: "theory", labelKey: "lens.theory" },
  { id: "practice", labelKey: "lens.practice" },
];

export function CurriculumLensToggle({ className }: { className?: string }) {
  const lens = useAppStore((s) => s.curriculumLens);
  const setLens = useAppStore((s) => s.setCurriculumLens);
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-synapse-border-subtle bg-synapse-surface-card p-1",
        className,
      )}
      role="group"
      aria-label={t("lens.label")}
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => setLens(opt.id)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
            lens === opt.id
              ? "bg-synapse-brand-500 text-white shadow-sm"
              : "text-synapse-text-secondary hover:bg-synapse-surface-hover",
          )}
        >
          {t(opt.labelKey)}
        </button>
      ))}
    </div>
  );
}
