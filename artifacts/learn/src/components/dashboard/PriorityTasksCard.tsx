import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Link } from "@/lib/wouter-compat";
import { motion } from "framer-motion";
import { AlertTriangle, ChevronRight, RotateCcw, Shield } from "lucide-react";

export interface PriorityTaskItem {
  id: string;
  title: string;
  subtitle: string;
  priority: "critical" | "high" | "medium" | "low";
  category: "review" | "fix" | "learn";
  href: string;
  xpReward?: number;
  minutes?: number;
}

interface PriorityTasksCardProps {
  tasks: PriorityTaskItem[];
  fixTasks?: PriorityTaskItem[];
}

const PRIORITY_CLS: Record<PriorityTaskItem["priority"], string> = {
  critical: "bg-red-500/15 text-red-400",
  high: "bg-amber-500/15 text-amber-400",
  medium: "bg-sky-500/15 text-sky-400",
  low: "bg-white/5 text-muted-foreground",
};

export function PriorityTasksCard({
  tasks,
  fixTasks = [],
}: PriorityTasksCardProps) {
  const critical = tasks.filter(
    (t) => t.priority === "critical" || t.priority === "high",
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            {t("dash.priority.title")}
          </h2>
          <Link
            href="/tasks"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            {t("dash.priority.viewAll")} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-2">
          {critical.slice(0, 5).map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.04 }}
            >
              <Link
                href={task.href}
                className="group flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-white/5"
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium group-hover:text-primary transition-colors">
                    {task.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {task.subtitle}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                      PRIORITY_CLS[task.priority],
                    )}
                  >
                    {task.priority}
                  </span>
                  {task.xpReward != null && (
                    <span className="text-xs text-amber-400">
                      +{task.xpReward}
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
          {critical.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t("dash.priority.allCaughtUp")}
            </p>
          )}
        </div>
      </div>

      {fixTasks.length > 0 && (
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Shield className="h-4 w-4 text-orange-400" />
            {t("dash.priority.needsFixing")}
          </h3>
          <div className="space-y-2">
            {fixTasks.slice(0, 3).map((task) => (
              <Link
                key={task.id}
                href={task.href}
                className="flex items-center gap-3 rounded-lg bg-card/50 p-2.5 transition-colors hover:bg-card"
              >
                <RotateCcw className="h-4 w-4 shrink-0 text-orange-400" />
                <span className="flex-1 truncate text-sm">{task.title}</span>
                {task.minutes != null && (
                  <span className="text-xs text-orange-400">
                    {task.minutes}m
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Build priority task list from real /tasks API payload. */
export function buildPriorityTasksFromQueue(queue: {
  reviews: Array<{
    conceptId: number;
    courseId: number;
    conceptTitle: string;
    courseTitle?: string | null;
    dueAt: string;
    retrievability: number;
  }>;
  mistakes: Array<{
    id: number;
    courseId: number;
    stepId: number;
    stepTitle?: string | null;
    courseTitle?: string | null;
    conceptTitle?: string | null;
  }>;
}): { priority: PriorityTaskItem[]; fix: PriorityTaskItem[] } {
  const priority: PriorityTaskItem[] = queue.reviews.map((r) => ({
    id: `review-${r.conceptId}`,
    title: `Review: ${r.conceptTitle}`,
    subtitle: `${r.courseTitle ?? "Course"} · recall ~${Math.round(r.retrievability)}%`,
    priority: r.retrievability < 50 ? "critical" : "high",
    category: "review",
    href: "/tasks",
    xpReward: 30,
    minutes: 8,
  }));

  const fix: PriorityTaskItem[] = queue.mistakes.map((m) => ({
    id: `mistake-${m.id}`,
    title: m.stepTitle || m.conceptTitle || "Retry mistake",
    subtitle: m.courseTitle ?? "Course",
    priority: "high",
    category: "fix",
    href: `/courses/${m.courseId}/play?step=${m.stepId}`,
    xpReward: 35,
    minutes: 12,
  }));

  return { priority, fix };
}
