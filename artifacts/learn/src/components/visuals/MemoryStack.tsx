/**
 * MemoryStack
 *
 * Tinder-style flashcard reviewer: tap to flip, swipe-classify as
 * "Still Learning" (left) or "Got It" (right). Lightweight alternative to
 * the full Leitner box system (see LeitnerSystem).
 *
 * Accepts a `cards` prop so it can be wired to real spaced-repetition data;
 * defaults to demo Economics cards for showcase / empty states.
 */

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Layers, RotateCcw, X } from "lucide-react";
import { useState } from "react";

export interface MemoryCard {
  id: string;
  front: string;
  back: string;
  mastery: number;
}

const DEFAULT_CARDS: MemoryCard[] = [
  {
    id: "1",
    front: "What is the Bertrand Paradox?",
    back: "With just two firms competing on price (with identical products), the equilibrium price equals marginal cost.",
    mastery: 30,
  },
  {
    id: "2",
    front: "What is the decision variable in the Cournot model?",
    back: "Quantity (Output level).",
    mastery: 50,
  },
  {
    id: "3",
    front: "Why does Monopoly create deadweight loss?",
    back: "Because the monopolist produces less than the competitive quantity and charges a price above marginal cost.",
    mastery: 10,
  },
];

interface MemoryStackProps {
  cards?: MemoryCard[];
  onClassify?: (card: MemoryCard, remembered: boolean) => void;
}

export function MemoryStack({
  cards: initialCards,
  onClassify,
}: MemoryStackProps) {
  const [cards, setCards] = useState<MemoryCard[]>(
    initialCards ?? DEFAULT_CARDS,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  const activeCard = cards[currentIndex];

  const handleSwipe = (dir: "left" | "right") => {
    setDirection(dir);
    if (activeCard) onClassify?.(activeCard, dir === "right");
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setFlipped(false);
        setDirection(null);
      } else {
        setCards([]);
      }
    }, 300);
  };

  const reset = () => {
    setCards(initialCards ?? DEFAULT_CARDS);
    setCurrentIndex(0);
    setFlipped(false);
    setDirection(null);
  };

  if (cards.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-synapse-accent-emerald/20">
          <Check className="h-8 w-8 text-synapse-accent-emerald" />
        </div>
        <h3 className="mb-2 text-xl font-bold">Stack Completed!</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          You've recycled these concepts. Your mastery scores have been updated.
        </p>
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-xl bg-synapse-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-synapse-brand-500"
        >
          <RotateCcw className="h-4 w-4" /> Restart Stack
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-white/[0.02] px-4 py-2">
        <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Layers className="h-3.5 w-3.5" /> Memory Stack
        </span>
        <span className="text-[10px] text-muted-foreground">
          {currentIndex + 1} / {cards.length} remaining
        </span>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-6">
        <AnimatePresence mode="popLayout">
          {activeCard && (
            <motion.div
              key={activeCard.id}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
                x:
                  direction === "left" ? -300 : direction === "right" ? 300 : 0,
                rotate:
                  direction === "left" ? -15 : direction === "right" ? 15 : 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={() => !direction && setFlipped(!flipped)}
              className="perspective-1000 absolute aspect-[4/3] w-full max-w-sm cursor-pointer"
            >
              <motion.div
                className="preserve-3d relative h-full w-full transition-all duration-500"
                animate={{ rotateY: flipped ? 180 : 0 }}
              >
                {/* Front */}
                <div className="backface-hidden absolute inset-0 flex flex-col rounded-2xl border-2 border-border bg-background p-6 shadow-2xl">
                  <div className="mb-auto flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-synapse-brand-400">
                      Question
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        activeCard.mastery > 50
                          ? "bg-synapse-accent-amber/20 text-synapse-accent-amber"
                          : "bg-synapse-accent-rose/20 text-synapse-accent-rose",
                      )}
                    >
                      {activeCard.mastery}% Mastery
                    </span>
                  </div>
                  <h3 className="text-center text-xl font-bold leading-snug">
                    {activeCard.front}
                  </h3>
                  <div className="mt-auto text-center">
                    <span className="animate-pulse text-[10px] text-muted-foreground">
                      Tap to flip
                    </span>
                  </div>
                </div>

                {/* Back */}
                <div
                  className="backface-hidden absolute inset-0 flex flex-col rounded-2xl border-2 border-synapse-brand-500/50 bg-synapse-brand-900/20 p-6 shadow-2xl"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  <div className="mb-auto flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-synapse-accent-emerald">
                      Answer
                    </span>
                  </div>
                  <p className="text-center text-lg font-medium leading-relaxed text-synapse-brand-100">
                    {activeCard.back}
                  </p>
                  <div className="mt-auto" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex h-24 items-center justify-center border-t border-border bg-white/[0.02] p-4">
        <AnimatePresence>
          {flipped && !direction && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex w-full max-w-sm gap-4"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSwipe("left");
                }}
                className="group flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border-2 border-synapse-accent-rose/30 bg-synapse-accent-rose/10 p-3 text-synapse-accent-rose transition-all hover:bg-synapse-accent-rose/20"
              >
                <X className="h-6 w-6 transition-transform group-hover:scale-110" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Still Learning
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSwipe("right");
                }}
                className="group flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border-2 border-synapse-accent-emerald/30 bg-synapse-accent-emerald/10 p-3 text-synapse-accent-emerald transition-all hover:bg-synapse-accent-emerald/20"
              >
                <Check className="h-6 w-6 transition-transform group-hover:scale-110" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Got It
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {!flipped && !direction && (
          <p className="w-full text-center text-xs text-muted-foreground">
            Think of the answer before flipping.
          </p>
        )}
      </div>
    </div>
  );
}
