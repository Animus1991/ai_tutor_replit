/**
 * Sprint 1 lesson pane extras — retrieval practice, source citations, Socratic chips.
 */

import { useTranslation } from "@/lib/i18n";
import { RETRIEVAL_ANSWERS } from "@/lib/i18n-sprint1";
import { cn } from "@/lib/utils";
import { BookOpen, Check, X } from "lucide-react";
import { useState } from "react";

export function SourceCitation() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 rounded-md border border-[#5a5280] bg-synapse-brand-500/10 px-2 py-0.5 text-xs font-medium text-synapse-brand-200 hover:border-synapse-brand-500/40"
      >
        <BookOpen className="h-3 w-3" />
        {t("workspace.citation.trigger")}
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label={t("close")}
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-full left-0 z-50 mb-2 w-72 rounded-xl border border-[#5a5280] bg-card p-3 shadow-xl">
            <p className="mb-1 text-xs font-semibold text-synapse-brand-300">
              {t("workspace.citation.title")}
            </p>
            <p className="text-xs leading-relaxed text-[#ddd9ee]">
              {t("workspace.citation.excerpt")}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

const SOCRATIC_KEYS = [
  { key: "workspace.socratic.why", promptKey: "workspace.socratic.why" },
  {
    key: "workspace.socratic.example",
    promptKey: "workspace.socratic.example",
  },
  {
    key: "workspace.socratic.compare",
    promptKey: "workspace.socratic.compare",
  },
] as const;

export function SocraticChips({ onAsk }: { onAsk: (prompt: string) => void }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-[#b8b3d4]">
        {t("workspace.socratic.label")}
      </p>
      <div className="flex flex-wrap gap-2">
        {SOCRATIC_KEYS.map(({ key, promptKey }) => (
          <button
            key={key}
            type="button"
            onClick={() => onAsk(t(promptKey))}
            className="rounded-full border border-[#5a5280] bg-white/[0.04] px-3 py-1 text-xs text-foreground/90 hover:border-synapse-brand-500/40 hover:bg-synapse-brand-600/15"
          >
            {t(key)}
          </button>
        ))}
      </div>
    </div>
  );
}

interface InlineRetrievalProps {
  step: number;
  passed: boolean;
  onPass: () => void;
}

export function InlineRetrieval({
  step,
  passed,
  onPass,
}: InlineRetrievalProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  if (step > 4 || passed) return null;

  const correct = RETRIEVAL_ANSWERS[step] ?? 0;

  const handleSelect = (idx: number) => {
    setSelected(idx);
    if (idx === correct) {
      setFeedback("correct");
      onPass();
    } else {
      setFeedback("wrong");
    }
  };

  return (
    <div className="rounded-xl border border-synapse-brand-500/30 bg-synapse-brand-500/8 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-synapse-brand-200">
          🧠 {t("workspace.retrieval.title")}
        </p>
        {!passed && (
          <span className="text-[11px] text-[#b8b3d4]">
            {t("workspace.retrieval.required")}
          </span>
        )}
      </div>
      <p className="mb-2 text-sm text-foreground/90">
        {t(`workspace.retrieval.${step}.question`)}
      </p>
      <div className="space-y-1.5">
        {[0, 1, 2, 3].map((i) => (
          <button
            key={i}
            type="button"
            disabled={passed}
            onClick={() => handleSelect(i)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all",
              selected === i && feedback === "correct" && i === correct
                ? "border-synapse-accent-emerald/50 bg-synapse-accent-emerald/15"
                : selected === i && feedback === "wrong"
                  ? "border-synapse-accent-rose/50 bg-synapse-accent-rose/10"
                  : "border-[#5a5280] hover:border-synapse-brand-500/35",
            )}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#5a5280] text-[11px]">
              {String.fromCharCode(65 + i)}
            </span>
            {t(`workspace.retrieval.${step}.opt.${i}`)}
            {selected === i && feedback === "correct" && i === correct && (
              <Check className="ml-auto h-4 w-4 text-synapse-accent-emerald" />
            )}
            {selected === i && feedback === "wrong" && (
              <X className="ml-auto h-4 w-4 text-synapse-accent-rose" />
            )}
          </button>
        ))}
      </div>
      {feedback === "correct" && (
        <p className="mt-2 text-xs text-synapse-accent-emerald">
          {t("workspace.retrieval.correct")}
        </p>
      )}
      {feedback === "wrong" && (
        <p className="mt-2 text-xs text-synapse-accent-rose">
          {t("workspace.retrieval.wrong")}{" "}
          <button
            type="button"
            className="underline hover:text-foreground"
            onClick={() => {
              setSelected(null);
              setFeedback(null);
            }}
          >
            {t("workspace.retrieval.tryAgain")}
          </button>
        </p>
      )}
    </div>
  );
}

/** Footer block shared by lesson steps */
export function LessonStepFooter({
  step,
  retrievalPassed,
  onRetrievalPass,
  onOpenAgent,
}: {
  step: number;
  retrievalPassed: boolean;
  onRetrievalPass: () => void;
  onOpenAgent: (prompt?: string) => void;
}) {
  return (
    <div className="mt-4 space-y-3 border-t border-[#5a5280]/50 pt-4">
      {step <= 4 && (
        <InlineRetrieval
          step={step}
          passed={retrievalPassed}
          onPass={onRetrievalPass}
        />
      )}
      <SocraticChips onAsk={(p) => onOpenAgent(p)} />
    </div>
  );
}
