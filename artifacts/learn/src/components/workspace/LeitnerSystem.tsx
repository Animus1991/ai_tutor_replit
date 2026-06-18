/**
 * LeitnerSystem — spaced repetition with due counts & session stats (Sprint 2).
 */

import { useTranslation } from "@/lib/i18n";
import {
  getLeitnerBoxLabels,
  getLeitnerCards,
  isBoxDue,
} from "@/lib/i18n-sprint2";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Layers, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export interface LeitnerCard {
  id: number;
  front: string;
  back: string;
  box: number;
}

const BOX_COLORS = ["#fb7185", "#fbbf24", "#67e8f9", "#818cf8", "#34d399"];

interface LeitnerSystemProps {
  cards?: LeitnerCard[];
  onUpdate?: (cards: LeitnerCard[]) => void;
}

export function LeitnerSystem({
  cards: initialCards,
  onUpdate,
}: LeitnerSystemProps) {
  const { t, language } = useTranslation();
  const defaultCards = useMemo(() => getLeitnerCards(t), [t, language]);
  const boxLabels = useMemo(() => getLeitnerBoxLabels(t), [t, language]);

  const [cards, setCards] = useState<LeitnerCard[]>(
    initialCards ?? defaultCards,
  );
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);

  useEffect(() => {
    setCards(initialCards ?? defaultCards);
  }, [initialCards, defaultCards]);

  const activeCard = cards[activeCardIndex];
  const sessionTotal = sessionCorrect + sessionWrong;
  const sessionPct =
    sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;

  const dueTotal = cards.filter((c) => isBoxDue(c.box)).length;

  const handleAnswer = (correct: boolean) => {
    if (correct) setSessionCorrect((n) => n + 1);
    else setSessionWrong((n) => n + 1);

    const updated = cards.map((c, i) =>
      i === activeCardIndex
        ? { ...c, box: correct ? Math.min(5, c.box + 1) : 1 }
        : c,
    );
    setCards(updated);
    onUpdate?.(updated);
    setFlipped(false);
    setActiveCardIndex((prev) => (prev + 1) % cards.length);
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#5a5280] bg-card p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-synapse-brand-400" />
          <span className="text-sm font-semibold">
            {t("workspace.leitner.title")}
          </span>
        </div>
        <span className="rounded-full bg-synapse-accent-rose/15 px-2.5 py-0.5 text-xs font-medium text-synapse-accent-rose">
          {dueTotal} {t("workspace.leitner.due")}
        </span>
      </div>

      <div className="mb-2 flex gap-2">
        {BOX_COLORS.map((color, idx) => {
          const boxId = idx + 1;
          const count = cards.filter((c) => c.box === boxId).length;
          const due = isBoxDue(boxId) && count > 0;
          return (
            <div
              key={boxId}
              className="relative flex flex-1 flex-col items-center justify-center rounded-lg border py-3 transition-all"
              style={{
                borderColor: color,
                backgroundColor: `${color}1a`,
                opacity: count > 0 ? 1 : 0.35,
              }}
            >
              {due && (
                <span
                  className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-synapse-accent-rose px-1 text-[9px] font-bold text-white"
                  title={t("workspace.leitner.due")}
                >
                  {count}
                </span>
              )}
              <span className="text-lg font-bold" style={{ color }}>
                {count}
              </span>
              <span
                className="mt-1 text-center text-[10px] font-medium uppercase"
                style={{ color }}
              >
                {t("workspace.leitner.box", { n: boxId })}
                <br />
                {boxLabels[idx]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mb-4 rounded-lg border border-[#5a5280]/60 bg-white/[0.03] px-3 py-2 text-xs text-[#b8b3d4]">
        <span className="font-semibold text-foreground/90">
          {t("workspace.leitner.session")}:{" "}
        </span>
        {sessionTotal === 0 ? (
          "—"
        ) : (
          <>
            {t("workspace.leitner.sessionStats", {
              correct: sessionCorrect,
              wrong: sessionWrong,
            })}
            {" · "}
            {t("workspace.leitner.sessionAccuracy", { pct: sessionPct })}
          </>
        )}
      </div>

      <div className="perspective-1000 relative flex flex-1 items-center justify-center min-h-[200px]">
        <AnimatePresence mode="wait">
          {activeCard && (
            <motion.div
              key={`${activeCard.id}-${flipped ? "back" : "front"}`}
              initial={{ rotateX: flipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: flipped ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setFlipped(!flipped)}
              className="absolute inset-x-4 mx-auto flex max-w-sm cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-synapse-brand-500/35 bg-background p-6 shadow-2xl"
            >
              <span className="absolute left-4 top-4 text-xs font-bold uppercase tracking-wider text-synapse-brand-300">
                {flipped
                  ? t("workspace.leitner.answer")
                  : t("workspace.leitner.question")}{" "}
                ({t("workspace.leitner.box", { n: activeCard.box })})
              </span>
              <p className="text-center text-lg font-semibold leading-relaxed text-foreground">
                {flipped ? activeCard.back : activeCard.front}
              </p>
              {!flipped && (
                <span className="absolute bottom-4 animate-pulse text-xs text-[#b8b3d4]">
                  {t("workspace.leitner.tapFlip")}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mx-auto mt-4 flex w-full max-w-sm gap-4">
        <button
          disabled={!flipped}
          onClick={(e) => {
            e.stopPropagation();
            handleAnswer(false);
          }}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all",
            "bg-synapse-accent-rose/10 text-synapse-accent-rose hover:bg-synapse-accent-rose/20 disabled:opacity-30",
          )}
        >
          <X className="h-4 w-4" /> {t("workspace.leitner.forgot")}
        </button>
        <button
          disabled={!flipped}
          onClick={(e) => {
            e.stopPropagation();
            handleAnswer(true);
          }}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all",
            "bg-synapse-accent-emerald/10 text-synapse-accent-emerald hover:bg-synapse-accent-emerald/20 disabled:opacity-30",
          )}
        >
          <Check className="h-4 w-4" />{" "}
          {t("workspace.leitner.remembered", {
            n: activeCard && activeCard.box < 5 ? activeCard.box + 1 : 5,
          })}
        </button>
      </div>
    </div>
  );
}
