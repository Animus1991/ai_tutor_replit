/**
 * ConfidenceSelector
 *
 * Three-step calibrated confidence picker used inside quizzes / lessons.
 * Capturing the learner's confidence *before* revealing the answer is the
 * foundation of confidence-calibration analytics (see Profile/Analytics).
 *
 * Adapted from the Option A reference into the Synapse design system.
 */

import { cn } from "@/lib/utils";

interface ConfidenceSelectorProps {
  value: number | null;
  onChange: (v: number) => void;
  required?: boolean;
  /** Optional override label. */
  label?: string;
  className?: string;
}

interface ConfidenceLevel {
  value: number;
  label: string;
  emoji: string;
  cls: string;
}

const LEVELS: ConfidenceLevel[] = [
  {
    value: 25,
    label: "Just guessing",
    emoji: "🤷",
    cls: "border-synapse-accent-rose/50 bg-synapse-accent-rose/10 text-synapse-accent-rose",
  },
  {
    value: 60,
    label: "Fairly sure",
    emoji: "🤔",
    cls: "border-synapse-accent-amber/50 bg-synapse-accent-amber/10 text-synapse-accent-amber",
  },
  {
    value: 90,
    label: "Certain",
    emoji: "😎",
    cls: "border-synapse-accent-emerald/50 bg-synapse-accent-emerald/10 text-synapse-accent-emerald",
  },
];

export function ConfidenceSelector({
  value,
  onChange,
  required,
  label,
  className,
}: ConfidenceSelectorProps) {
  return (
    <div className={cn("w-full", className)}>
      <p className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
        {label ?? "How confident are you?"}
        {required && value === null && (
          <span className="text-[9px] text-synapse-accent-rose">
            *required before submitting
          </span>
        )}
      </p>
      <div className="flex gap-2">
        {LEVELS.map((l) => (
          <button
            key={l.value}
            type="button"
            onClick={() => onChange(l.value)}
            className={cn(
              "flex-1 rounded-xl border px-2 py-2.5 text-center text-xs font-medium transition-all",
              value === l.value
                ? l.cls
                : "border-border text-muted-foreground hover:border-synapse-brand-500/40",
            )}
          >
            <span className="mb-0.5 block text-lg">{l.emoji}</span>
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
