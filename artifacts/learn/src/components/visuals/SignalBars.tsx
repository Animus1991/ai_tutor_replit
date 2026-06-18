/**
 * SignalBars
 *
 * Animated horizontal bar chart for "learning signals" (accuracy,
 * self-reliance, retrieval strength, practice volume, etc.).
 *
 * Adapted from the Option A reference.
 */

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface Signal {
  label: string;
  value: number;
  /** Lucide icon or short emoji — keep it small. */
  icon?: React.ReactNode;
  /** Any valid CSS color (named or hex). */
  color: string;
  detail?: string;
}

interface SignalBarsProps {
  signals: Signal[];
  className?: string;
}

export function SignalBars({ signals, className }: SignalBarsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {signals.map((s, i) => {
        const pct = Math.max(0, Math.min(100, s.value));
        return (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                {s.icon && <span aria-hidden>{s.icon}</span>}
                {s.label}
              </span>
              <span className="text-xs font-bold" style={{ color: s.color }}>
                {Math.round(pct)}%
              </span>
            </div>
            <div className="relative h-2.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ backgroundColor: s.color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{
                  duration: 1,
                  delay: 0.2 + i * 0.1,
                  ease: "easeOut",
                }}
              />
              {[25, 50, 75].map((mark) => (
                <div
                  key={mark}
                  className="absolute inset-y-0 bg-background/40"
                  style={{ left: `${mark}%`, width: 1 }}
                />
              ))}
            </div>
            {s.detail && (
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {s.detail}
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
