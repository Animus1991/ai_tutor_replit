/**
 * MiniDashboard
 *
 * Floating, collapsible mini status panel shown inside the Study Workspace.
 */

import { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import {
  AlertTriangle,
  BookOpen,
  Brain,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  RotateCcw,
  Target,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { useTranslation } from "@/lib/i18n";

export interface WeakSpot {
  concept: string;

  mastery: number;

  course: string;
}

export interface NextAction {
  id: string;

  label: string;

  type: "review" | "practice" | "lesson" | string;

  minutes: number;

  xp: number;
}

interface MiniDashboardProps {
  readiness: number;

  streak: number;

  reviewsDue: number;

  weakSpots: WeakSpot[];

  nextActions: NextAction[];

  conceptsMastered: number;

  totalConcepts: number;

  onRunAction?: (actionId: string) => void;

  className?: string;
}

function bandKey(v: number) {
  if (v >= 80) return "workspace.mini.band.strong";

  if (v >= 60) return "workspace.mini.band.proficient";

  if (v >= 40) return "workspace.mini.band.developing";

  return "workspace.mini.band.weak";
}

function bandColor(v: number) {
  if (v >= 80) return "#34d399";

  if (v >= 60) return "#fbbf24";

  if (v >= 40) return "#38bdf8";

  return "#fb7185";
}

export function MiniDashboard({
  readiness,

  streak,

  reviewsDue,

  weakSpots,

  nextActions,

  conceptsMastered,

  totalConcepts,

  onRunAction,

  className,
}: MiniDashboardProps) {
  const { t } = useTranslation();

  const [collapsed, setCollapsed] = useState(false);

  const [activeTab, setActiveTab] = useState<"overview" | "weak" | "next">(
    "overview",
  );

  const [showReadinessDetail, setShowReadinessDetail] = useState(false);

  const bKey = bandKey(readiness);

  const bColor = bandColor(readiness);

  const size = 58;

  const sw = 5;

  const r = (size - sw) / 2;

  const c = 2 * Math.PI * r;

  const offset = c - (readiness / 100) * c;

  return (
    <motion.div
      layout
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-xl",

        className,
      )}
      style={{ width: collapsed ? 48 : 260 }}
    >
      <div
        className={cn(
          "flex cursor-pointer items-center gap-2 border-b border-border bg-white/[0.02] px-2.5 py-1.5",

          collapsed && "justify-center",
        )}
        onClick={() => setCollapsed(!collapsed)}
      >
        {!collapsed && (
          <span className="flex-1 text-[10px] font-semibold text-foreground">
            📊 {t("workspace.mini.title")}
          </span>
        )}
        {collapsed ? (
          <ChevronUp className="h-3 w-3 rotate-90 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3 w-3 rotate-90 text-muted-foreground" />
        )}
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex border-b border-border">
              {(["overview", "weak", "next"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 py-1 text-[9px] font-medium transition-all",

                    activeTab === tab
                      ? "border-b border-synapse-brand-400 text-synapse-brand-300"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab === "overview"
                    ? t("workspace.mini.tab.status")
                    : tab === "weak"
                      ? t("workspace.mini.tab.weak")
                      : t("workspace.mini.tab.next")}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="space-y-2.5 p-2.5">
                <div className="flex items-center gap-2.5">
                  <svg
                    width={size}
                    height={size}
                    className="-rotate-90 shrink-0"
                  >
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={r}
                      fill="none"
                      stroke="#1e1740"
                      strokeWidth={sw}
                    />
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={r}
                      fill="none"
                      stroke={bColor}
                      strokeWidth={sw}
                      strokeDasharray={c}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold">{t(bKey)}</p>
                    <p className="text-[9px] text-muted-foreground">
                      {t("workspace.mini.readiness").replace(
                        "{{pct}}",

                        String(readiness),
                      )}
                    </p>
                    <p className="mt-0.5 text-[9px] text-muted-foreground">
                      {t("workspace.mini.concepts")

                        .replace("{{mastered}}", String(conceptsMastered))

                        .replace("{{total}}", String(totalConcepts))}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();

                        setShowReadinessDetail((v) => !v);
                      }}
                      className="mt-1 flex items-center gap-0.5 text-[9px] text-synapse-brand-300 hover:underline"
                    >
                      <HelpCircle className="h-2.5 w-2.5" />
                      {t("workspace.mini.readinessExplain").replace(
                        "{{pct}}",

                        String(readiness),
                      )}
                    </button>
                  </div>
                </div>

                {showReadinessDetail && (
                  <p className="rounded-lg bg-background/60 p-2 text-[9px] leading-relaxed text-muted-foreground">
                    {t("workspace.mini.readinessBody")}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-1">
                  <StatPill
                    icon={<Zap className="h-3 w-3 text-synapse-accent-amber" />}
                    label={t("workspace.mini.streak")}
                    value={`${streak}d`}
                  />
                  <StatPill
                    icon={
                      <RotateCcw className="h-3 w-3 text-synapse-accent-teal" />
                    }
                    label={t("workspace.mini.due")}
                    value={`${reviewsDue}`}
                  />
                  <StatPill
                    icon={<Brain className="h-3 w-3 text-synapse-brand-400" />}
                    label={t("workspace.mini.weakLabel")}
                    value={`${weakSpots.length}`}
                  />
                </div>
              </div>
            )}

            {activeTab === "weak" && (
              <div className="max-h-44 space-y-1 overflow-y-auto p-2.5">
                {weakSpots.length === 0 ? (
                  <p className="py-3 text-center text-[10px] text-muted-foreground">
                    {t("workspace.mini.noWeak")}
                  </p>
                ) : (
                  weakSpots.map((w, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 shrink-0 text-synapse-accent-rose" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px] font-medium">
                          {w.concept}
                        </p>
                        <p className="text-[8px] text-muted-foreground">
                          {w.course}
                        </p>
                      </div>
                      <div className="w-11">
                        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-1 rounded-full bg-synapse-accent-rose"
                            style={{ width: `${Math.max(w.mastery, 4)}%` }}
                          />
                        </div>
                        <p className="mt-0.5 text-right text-[8px] text-muted-foreground">
                          {w.mastery}%
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "next" && (
              <div className="max-h-44 space-y-1 overflow-y-auto p-2.5">
                {nextActions.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => onRunAction?.(a.id)}
                    className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left transition-colors hover:bg-white/[0.04]"
                  >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/[0.06]">
                      {a.type === "review" ? (
                        <RotateCcw className="h-3 w-3 text-synapse-accent-amber" />
                      ) : a.type === "practice" ? (
                        <Target className="h-3 w-3 text-synapse-accent-teal" />
                      ) : (
                        <BookOpen className="h-3 w-3 text-synapse-brand-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-medium">
                        {a.label}
                      </p>
                      <p className="text-[8px] text-muted-foreground">
                        {a.minutes}m · +{a.xp} XP
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md bg-synapse-brand-600/25 px-1.5 py-0.5 text-[8px] font-medium text-synapse-brand-200">
                      {t("workspace.mini.run")}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatPill({
  icon,

  label,

  value,
}: {
  icon: React.ReactNode;

  label: string;

  value: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-background/60 py-1">
      {icon}
      <span className="mt-0.5 text-[10px] font-bold">{value}</span>
      <span className="text-[7px] text-muted-foreground">{label}</span>
    </div>
  );
}
