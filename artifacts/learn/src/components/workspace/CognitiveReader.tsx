/**
 * CognitiveReader
 *
 * Reading aid with two toggles:
 *  - "Bionic Typography": bolds the first half of each word to anchor saccades.
 *  - "Heatmap": highlights paragraphs with dense / complex structure.
 *
 * Adapted from the Option A reference.
 */

import { cn } from "@/lib/utils";
import { Sparkles, Type } from "lucide-react";
import { useState } from "react";

interface Props {
  text: string;
  /** Words-per-paragraph threshold for marking a paragraph "complex". */
  complexityThreshold?: number;
}

export function CognitiveReader({ text, complexityThreshold = 25 }: Props) {
  const [bionic, setBionic] = useState(false);
  const [highlightComplexity, setHighlightComplexity] = useState(false);

  const renderBionic = (word: string) => {
    if (word.length <= 1)
      return (
        <strong key="b" className="font-bold">
          {word}
        </strong>
      );
    const mid = Math.ceil(word.length / 2);
    return (
      <span>
        <strong className="font-bold">{word.slice(0, mid)}</strong>
        <span className="opacity-80">{word.slice(mid)}</span>
      </span>
    );
  };

  const paragraphs = text.split("\n\n").filter((p) => p.trim());

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-white/[0.02] px-4 py-2">
        <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Type className="h-3.5 w-3.5" /> Cognitive Reader
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBionic(!bionic)}
            className={cn(
              "rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-all",
              bionic
                ? "border-synapse-brand-500/30 bg-synapse-brand-600/20 text-synapse-brand-300"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Bionic Typography
          </button>
          <button
            onClick={() => setHighlightComplexity(!highlightComplexity)}
            className={cn(
              "rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-all",
              highlightComplexity
                ? "border-synapse-accent-amber/30 bg-synapse-accent-amber/20 text-synapse-accent-amber"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Heatmap
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-background/40 p-6">
        <div className="mx-auto max-w-xl space-y-4">
          {paragraphs.map((p, i) => {
            const words = p.split(" ");
            const isComplex = words.length > complexityThreshold;
            return (
              <p
                key={i}
                className={cn(
                  "rounded-lg p-2 text-sm leading-relaxed transition-colors duration-500",
                  highlightComplexity
                    ? isComplex
                      ? "border-l-2 border-synapse-accent-rose bg-synapse-accent-rose/10 text-foreground"
                      : "text-muted-foreground"
                    : "text-foreground/80",
                )}
              >
                {words.map((w, j) => (
                  <span key={j}>
                    {bionic ? renderBionic(w) : w}
                    {j < words.length - 1 ? " " : ""}
                  </span>
                ))}
              </p>
            );
          })}
        </div>
        {highlightComplexity && (
          <div className="mx-auto mt-6 flex max-w-xl items-start gap-2 rounded-lg border border-synapse-accent-rose/20 bg-synapse-accent-rose/5 p-3 text-xs text-synapse-accent-rose">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>
              Highlighted paragraphs contain high structural complexity and
              dense terminology. The AI recommends breaking these down or
              generating a diagram.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
