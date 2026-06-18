/**
 * ActivityFeed
 *
 * Vertical timeline of learning events (lesson completions, quiz pass/fail,
 * mastery jumps, mistake repairs, etc.) with consistent icons + colors.
 *
 * Accepts an `items` prop so it can render real data from `/api/dashboard/recent`;
 * falls back to a small built-in mock when no items are passed (useful for
 * empty states / Storybook).
 */

import { motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  Brain,
  CheckCircle2,
  RotateCcw,
  Star,
  Target,
  Zap,
} from "lucide-react";

export type ActivityType =
  | "lesson_complete"
  | "quiz_passed"
  | "quiz_failed"
  | "review_done"
  | "streak"
  | "mastery_up"
  | "xp_earned"
  | "mistake_fixed";

export interface ActivityItem {
  id: string | number;
  type: ActivityType;
  description: string;
  xp?: number;
  timestamp: string;
}

const TYPE_CONFIG: Record<
  ActivityType,
  {
    Icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
  }
> = {
  lesson_complete: {
    Icon: BookOpen,
    color: "text-synapse-brand-400",
    bg: "bg-synapse-brand-500/10",
  },
  quiz_passed: {
    Icon: CheckCircle2,
    color: "text-synapse-accent-emerald",
    bg: "bg-synapse-accent-emerald/10",
  },
  quiz_failed: {
    Icon: AlertTriangle,
    color: "text-synapse-accent-rose",
    bg: "bg-synapse-accent-rose/10",
  },
  review_done: {
    Icon: RotateCcw,
    color: "text-synapse-accent-amber",
    bg: "bg-synapse-accent-amber/10",
  },
  streak: {
    Icon: Star,
    color: "text-synapse-accent-amber",
    bg: "bg-synapse-accent-amber/10",
  },
  mastery_up: {
    Icon: Brain,
    color: "text-synapse-accent-teal",
    bg: "bg-synapse-accent-teal/10",
  },
  xp_earned: {
    Icon: Zap,
    color: "text-synapse-brand-300",
    bg: "bg-synapse-brand-500/10",
  },
  mistake_fixed: {
    Icon: Target,
    color: "text-synapse-accent-emerald",
    bg: "bg-synapse-accent-emerald/10",
  },
};

const FALLBACK_MOCK: ActivityItem[] = [
  {
    id: "demo-1",
    type: "quiz_passed",
    description: "Scored 4/5 on Elasticity quiz",
    xp: 30,
    timestamp: "10 min ago",
  },
  {
    id: "demo-2",
    type: "lesson_complete",
    description: "Completed Cournot Competition lesson",
    xp: 50,
    timestamp: "25 min ago",
  },
  {
    id: "demo-3",
    type: "review_done",
    description: "Reviewed Supply & Demand flashcards",
    xp: 15,
    timestamp: "1 hour ago",
  },
  {
    id: "demo-4",
    type: "streak",
    description: "12-day study streak! 🔥",
    timestamp: "Today",
  },
];

export function ActivityFeed({
  items,
  maxItems = 6,
}: {
  items?: ActivityItem[];
  maxItems?: number;
}) {
  const source = items?.length ? items : FALLBACK_MOCK;
  return (
    <div className="space-y-1">
      {source.slice(0, maxItems).map((item, i) => {
        const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.xp_earned;
        const { Icon, color, bg } = cfg;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/[0.04]"
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${bg}`}
            >
              <Icon className={`h-3.5 w-3.5 ${color}`} />
            </div>
            <p className="flex-1 truncate text-xs text-foreground">
              {item.description}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              {item.xp !== undefined && item.xp !== 0 && (
                <span className="text-[10px] font-medium text-synapse-accent-amber">
                  +{item.xp}
                </span>
              )}
              <span className="text-[9px] text-muted-foreground">
                {item.timestamp}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
