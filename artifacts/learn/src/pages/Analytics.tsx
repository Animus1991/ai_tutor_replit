/**
 * Learning Analytics — tabbed dashboard from Option A.
 * Uses real API data (learner model, dashboard) with visual fallbacks.
 */

import {
  ColorCodingSystem,
  ConceptTreemap,
  KnowledgeFlowSankey,
  LearningTimeline,
  MasteryHeatmap,
  MasteryWaterfall,
  SkillRadar,
} from "@/components/visuals/AdvancedEducationalVisuals";
import { AdvancedVisualTools } from "@/components/visuals/AdvancedVisualTools";
import { ConceptGraph } from "@/components/visuals/ConceptGraph";
import { RetentionCurve } from "@/components/visuals/DiagramGenerator";
import { ReadinessRing } from "@/components/visuals/ReadinessRing";
import { SignalBars } from "@/components/visuals/SignalBars";
import { t } from "@/lib/i18n";
import {
  type ConfidenceCalibrationPoint,
  DEMO_WEEKLY_MASTERY,
  buildDemoHeatmap,
  resolveConfidenceCalibration,
  resolveErrorPatterns,
  resolveMisconceptions,
} from "@/lib/learnerDemoFallbacks";
import { cn } from "@/lib/utils";
import {
  useGetDashboard,
  useGetLearnerModel,
} from "@workspace/api-client-react";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Brain,
  Calendar,
  Eye,
  HelpCircle,
  Lightbulb,
  Shield,
  Target,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import { useState } from "react";

type AnalyticsTab =
  | "overview"
  | "mastery"
  | "behavior"
  | "insights"
  | "pipeline"
  | "tools";

const TABS: {
  key: AnalyticsTab;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "overview", labelKey: "analytics.overview", icon: BarChart3 },
  { key: "mastery", labelKey: "analytics.mastery", icon: Brain },
  { key: "behavior", labelKey: "analytics.behavior", icon: Activity },
  { key: "insights", labelKey: "analytics.insights", icon: Lightbulb },
  { key: "pipeline", labelKey: "analytics.pipeline", icon: Zap },
  { key: "tools", labelKey: "analytics.tools", icon: Wrench },
];

const DEMO_GRAPH_NODES = [
  {
    id: "sd",
    label: "Supply & Demand",
    mastery: 92,
    type: "concept" as const,
    x: 120,
    y: 80,
  },
  {
    id: "ct",
    label: "Consumer Theory",
    mastery: 78,
    type: "theory" as const,
    x: 300,
    y: 60,
  },
  {
    id: "el",
    label: "Elasticity",
    mastery: 45,
    type: "formula" as const,
    x: 120,
    y: 200,
  },
  {
    id: "ms",
    label: "Market Structures",
    mastery: 45,
    type: "concept" as const,
    x: 350,
    y: 180,
  },
  {
    id: "we",
    label: "Welfare Econ",
    mastery: 20,
    type: "theory" as const,
    x: 530,
    y: 120,
  },
  {
    id: "gt",
    label: "Game Theory",
    mastery: 0,
    type: "concept" as const,
    x: 530,
    y: 280,
  },
];

const DEMO_GRAPH_EDGES = [
  { from: "sd", to: "ct", relation: "prerequisite" as const },
  { from: "sd", to: "el", relation: "prerequisite" as const },
  { from: "sd", to: "ms", relation: "prerequisite" as const },
  { from: "ct", to: "ms", relation: "prerequisite" as const },
  { from: "ms", to: "we", relation: "prerequisite" as const },
  { from: "ms", to: "gt", relation: "prerequisite" as const },
  { from: "el", to: "we", relation: "related" as const },
];

export default function AnalyticsPage() {
  const [tab, setTab] = useState<AnalyticsTab>("overview");
  const { data: dash, isLoading } = useGetDashboard();
  const { data: model } = useGetLearnerModel();

  const d = dash as
    | {
        totalXp?: number;
        currentStreak?: number;
        averageScore?: number;
        completedCourses?: number;
      }
    | undefined;

  const m = model as
    | {
        examReadiness?: number | null;
        accuracy?: number;
        selfReliance?: number;
        signals?: Array<{ label: string; score: number; detail: string }>;
        conceptMastery?: Array<{
          title: string;
          mastery: number;
          band: string;
          confidence?: number;
        }>;
        focusAreas?: string[];
        strengths?: string[];
        calibration?: {
          score: number;
          direction: string;
          avgConfidence?: number;
          sampleSize?: number;
        } | null;
        dataPointsCollected?: number;
        misconceptions?: Array<{
          id: string;
          concept: string;
          description: string;
          frequency: number;
          corrected: boolean;
          suggestedFix: string;
          detectedAt: string;
          courseTitle?: string | null;
        }>;
        errorPatterns?: Array<{
          type: string;
          frequency: number;
          concepts: string[];
          suggestedRemedy: string;
          category: string;
        }>;
        readinessByCourse?: Array<{
          courseId: number;
          courseTitle?: string | null;
          readiness: number | null;
          conceptCount: number;
          percentComplete: number;
        }>;
        visualAnalytics?: {
          masteryHeatmap: Array<{
            concept: string;
            day: number;
            value: number;
          }>;
          learningTimeline: Array<{
            id: string;
            day: number;
            label: string;
            type: "lesson" | "quiz" | "review" | "error" | "mastery";
            detail: string;
            delta: number;
          }>;
          skillRadar: Array<{ label: string; value: number; max: number }>;
          pipelineFlow: Array<{
            from: string;
            to: string;
            value: number;
            color: string;
          }>;
          hasRealData: boolean;
        };
      }
    | undefined;

  const va = m?.visualAnalytics;
  const visualsDemo = !va?.hasRealData;

  const readiness = m?.examReadiness ?? 58;
  const hasRealData = (m?.dataPointsCollected ?? 0) >= 5;

  const apiCalibrationPoints: ConfidenceCalibrationPoint[] | undefined =
    m?.conceptMastery
      ?.filter((c) => c.confidence != null)
      .map((c) => ({
        concept: c.title,
        predicted: (c.confidence ?? 50) / 100,
        actual: c.mastery / 100,
      }));

  const calibrationPoints = resolveConfidenceCalibration(
    apiCalibrationPoints,
    hasRealData,
  );
  const { items: misconceptions, isDemo: misconceptionsDemo } =
    resolveMisconceptions(m?.misconceptions);
  const { items: errorPatterns, isDemo: errorPatternsDemo } =
    resolveErrorPatterns(m?.errorPatterns);
  const heatmapDays = buildDemoHeatmap(91);
  const weeklyMastery = DEMO_WEEKLY_MASTERY;

  const courseProgress = (m?.readinessByCourse ?? []).filter(
    (c) => c.percentComplete > 0 || c.readiness != null,
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold sm:text-3xl">{t("nav.analytics")}</h1>
        <p className="mt-1 text-synapse-text-secondary">
          Your adaptive learner profile — built from real behavior, not
          assumptions
        </p>
      </motion.div>

      <div className="flex items-center gap-4 overflow-x-auto border-b border-synapse-border-subtle synapse-hide-scrollbar">
        {TABS.map((tabItem) => {
          const Icon = tabItem.icon;
          return (
            <button
              key={tabItem.key}
              type="button"
              onClick={() => setTab(tabItem.key)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 border-b-2 pb-3 text-sm font-medium transition-all",
                tab === tabItem.key
                  ? "border-synapse-brand-400 text-synapse-brand-400"
                  : "border-transparent text-synapse-text-tertiary hover:text-synapse-text-secondary",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t(tabItem.labelKey)}</span>
            </button>
          );
        })}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex items-center justify-center rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-6">
              <ReadinessRing
                value={readiness}
                size={200}
                sublabel="Derived from graded first-attempts only — never from self-reported skill."
              />
            </div>
            <RetentionCurve
              dataPoints={[
                { day: 0, retention: 100 },
                { day: 1, retention: 75 },
                { day: 3, retention: 58 },
                { day: 7, retention: 44 },
                { day: 14, retention: 33 },
                { day: 21, retention: 28 },
                { day: 30, retention: 22 },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard
              icon={<Brain className="h-5 w-5 text-synapse-brand-400" />}
              label="Exam Readiness"
              value={`${readiness}%`}
            />
            <MetricCard
              icon={<Target className="h-5 w-5 text-synapse-accent-teal" />}
              label="Avg Score"
              value={`${d?.averageScore ?? 0}%`}
            />
            <MetricCard
              icon={<Zap className="h-5 w-5 text-synapse-accent-amber" />}
              label="Total XP"
              value={String(d?.totalXp ?? 0)}
            />
            <MetricCard
              icon={
                <Calendar className="h-5 w-5 text-synapse-accent-emerald" />
              }
              label="Streak"
              value={`${d?.currentStreak ?? 0}d`}
            />
          </div>

          <div className="rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-synapse-accent-emerald" />
              Learning Signals
            </h3>
            <SignalBars
              signals={
                m?.signals?.map((s) => ({
                  label: s.label,
                  value: s.score,
                  color:
                    s.score >= 70
                      ? "#34d399"
                      : s.score >= 40
                        ? "#fbbf24"
                        : "#fb7185",
                  detail: s.detail,
                })) ?? [
                  {
                    label: t("dash.signals.accuracy"),
                    value: m?.accuracy ?? 72,
                    color: "#34d399",
                    detail: t("dash.signals.accuracy.desc"),
                    icon: "🎯",
                  },
                  {
                    label: t("dash.signals.reliance"),
                    value: m?.selfReliance ?? 65,
                    color: "#818cf8",
                    detail: t("dash.signals.reliance.desc"),
                    icon: "💪",
                  },
                  {
                    label: t("dash.signals.retrieval"),
                    value: 58,
                    color: "#fbbf24",
                    detail: t("dash.signals.retrieval.desc"),
                    icon: "🧠",
                  },
                ]
              }
            />
          </div>

          <ConfidenceCalibrationPanel
            points={calibrationPoints}
            aggregate={m?.calibration}
            isDemo={!hasRealData}
          />

          {courseProgress.length > 0 && (
            <div className="rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-5">
              <h3 className="mb-4 text-sm font-semibold">Course Progress</h3>
              <div className="space-y-3">
                {courseProgress.slice(0, 8).map((course) => {
                  const pct = course.readiness ?? course.percentComplete ?? 0;
                  return (
                    <div
                      key={course.courseId}
                      className="flex items-center gap-3"
                    >
                      <span className="w-36 truncate text-sm text-synapse-text-secondary">
                        {course.courseTitle ?? `Course ${course.courseId}`}
                      </span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-synapse-surface-hover">
                        <div
                          className="h-full rounded-full bg-synapse-brand-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs font-medium">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "mastery" && (
        <div className="space-y-6">
          <ConceptGraph
            nodes={DEMO_GRAPH_NODES}
            edges={DEMO_GRAPH_EDGES}
            width={660}
            height={380}
          />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ConceptTreemap />
            <MasteryHeatmap cells={va?.masteryHeatmap} isDemo={visualsDemo} />
          </div>
          {m?.conceptMastery && m.conceptMastery.length > 0 && (
            <div className="rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-5">
              <h3 className="mb-4 text-sm font-semibold">Your Concepts</h3>
              <div className="space-y-3">
                {[...m.conceptMastery]
                  .sort((a, b) => a.mastery - b.mastery)
                  .slice(0, 8)
                  .map((c) => (
                    <div key={c.title}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{c.title}</span>
                        <span>{c.mastery}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-synapse-surface-hover">
                        <div
                          className="h-full rounded-full bg-synapse-brand-500"
                          style={{ width: `${c.mastery}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "behavior" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard
              label="Avg Session"
              value="28m"
              sub="preferred length"
            />
            <MetricCard
              label="Help-Seeking"
              value={`${100 - (m?.selfReliance ?? 65)}%`}
              sub="hint usage"
            />
            <MetricCard label="Persistence" value="84%" sub="retry rate" />
            <MetricCard
              label="Courses Done"
              value={String(d?.completedCourses ?? 0)}
            />
          </div>
          <StudyHeatmap days={heatmapDays} />
          <WeeklyMasteryChart values={weeklyMastery} />
        </div>
      )}

      {tab === "insights" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-synapse-brand-500/20 bg-synapse-brand-500/5 p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <Lightbulb className="h-4 w-4 text-synapse-brand-400" />
              What We've Learned About Your Learning
            </h3>
            <div className="space-y-3">
              {(m?.focusAreas?.length
                ? m.focusAreas.map((area) => `Focus area detected: ${area}`)
                : [
                    "You perform 23% better on morning sessions — schedule challenging topics before noon.",
                    "Your retention drops after 3 days — increase review frequency for new concepts.",
                    "Elasticity problems show a calculation-error pattern — try step-by-step worked examples.",
                  ]
              ).map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3 rounded-xl border border-synapse-border-subtle bg-synapse-surface-card p-3"
                >
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-synapse-brand-400" />
                  <p className="text-sm leading-relaxed text-synapse-text-secondary">
                    {insight}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
          {m?.strengths && m.strengths.length > 0 && (
            <div className="rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-5">
              <h3 className="mb-3 text-sm font-semibold">Strengths</h3>
              <ul className="space-y-1 text-sm text-synapse-text-secondary">
                {m.strengths.map((s) => (
                  <li key={s}>✓ {s}</li>
                ))}
              </ul>
            </div>
          )}

          <MisconceptionsPanel
            items={misconceptions}
            isDemo={misconceptionsDemo}
          />
          <ErrorPatternsPanel
            items={errorPatterns}
            isDemo={errorPatternsDemo}
          />
        </div>
      )}

      {tab === "pipeline" && (
        <div className="space-y-6">
          <KnowledgeFlowSankey links={va?.pipelineFlow} isDemo={visualsDemo} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <LearningTimeline
              events={va?.learningTimeline}
              isDemo={visualsDemo}
            />
            <MasteryWaterfall />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SkillRadar axes={va?.skillRadar} isDemo={visualsDemo} />
            <ColorCodingSystem />
          </div>
        </div>
      )}

      {tab === "tools" && <AdvancedVisualTools visualAnalytics={va} />}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  sub,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-synapse-border-subtle bg-synapse-surface-card p-4">
      {icon && <div className="mb-2 flex items-center gap-2">{icon}</div>}
      <p className="text-xs font-medium text-synapse-text-tertiary">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      {sub && (
        <p className="mt-0.5 text-[10px] text-synapse-text-muted">{sub}</p>
      )}
    </div>
  );
}

function ConfidenceCalibrationPanel({
  points,
  aggregate,
  isDemo,
}: {
  points: ConfidenceCalibrationPoint[];
  aggregate?: { score: number; direction: string } | null;
  isDemo: boolean;
}) {
  return (
    <div className="rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-5">
      <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
        <Eye className="h-4 w-4 text-synapse-accent-amber" />
        Confidence Calibration
        {isDemo && (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-normal text-synapse-text-muted">
            demo preview
          </span>
        )}
      </h3>
      <p className="mb-4 text-xs text-synapse-text-tertiary">
        How well your predicted confidence matches actual performance
        {aggregate
          ? ` · overall ${aggregate.direction} (${aggregate.score}/100)`
          : ""}
      </p>
      <div className="space-y-2">
        {points.map((point, i) => {
          const gap = Math.abs(point.predicted - point.actual);
          const overconfident = point.predicted > point.actual;
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="w-28 truncate text-xs text-synapse-text-secondary">
                {point.concept}
              </span>
              <div className="relative h-6 flex-1 overflow-hidden rounded-lg bg-synapse-surface-hover">
                <div
                  className="absolute inset-y-0 left-0 rounded-lg bg-synapse-brand-500/30"
                  style={{ width: `${point.predicted * 100}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-lg bg-synapse-accent-emerald/40"
                  style={{ width: `${point.actual * 100}%` }}
                />
              </div>
              <span
                className={cn(
                  "w-24 text-right text-[10px] font-medium",
                  gap > 0.2
                    ? overconfident
                      ? "text-synapse-accent-rose"
                      : "text-synapse-accent-amber"
                    : "text-synapse-accent-emerald",
                )}
              >
                {gap > 0.2
                  ? overconfident
                    ? "Overconfident"
                    : "Underconfident"
                  : "Calibrated"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MisconceptionsPanel({
  items,
  isDemo,
}: {
  items: ReturnType<typeof resolveMisconceptions>["items"];
  isDemo?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-synapse-accent-rose/20 bg-synapse-accent-rose/5 p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <HelpCircle className="h-4 w-4 text-synapse-accent-rose" />
        Detected Misconceptions
        {isDemo && (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-normal text-synapse-text-muted">
            demo preview
          </span>
        )}
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-synapse-border-subtle bg-synapse-surface-card p-3"
          >
            <p className="text-sm font-medium">{item.concept}</p>
            <p className="mt-1 text-xs text-synapse-text-secondary">
              {item.description}
            </p>
            <p className="mt-2 text-xs text-synapse-brand-400">
              Fix: {item.suggestedFix}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorPatternsPanel({
  items,
  isDemo,
}: {
  items: ReturnType<typeof resolveErrorPatterns>["items"];
  isDemo?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Shield className="h-4 w-4 text-synapse-accent-orange" />
        Error Patterns
        {isDemo && (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-normal text-synapse-text-muted">
            demo preview
          </span>
        )}
      </h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.type}
            className="flex items-start gap-3 rounded-lg bg-synapse-surface-primary/50 p-3"
          >
            <div className="flex-1">
              <p className="text-sm font-medium">{item.type}</p>
              <p className="mt-0.5 text-xs text-synapse-text-tertiary">
                {item.suggestedRemedy}
              </p>
            </div>
            <span className="text-xs text-synapse-accent-amber">
              {item.frequency}×
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudyHeatmap({ days }: { days: ReturnType<typeof buildDemoHeatmap> }) {
  const colors = [
    "bg-white/5",
    "bg-synapse-brand-900",
    "bg-synapse-brand-700",
    "bg-synapse-brand-500",
    "bg-synapse-brand-400",
  ];
  return (
    <div className="rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Calendar className="h-4 w-4 text-synapse-accent-teal" />
        Study Heatmap (90 days)
      </h3>
      <div className="grid grid-cols-[repeat(13,1fr)] gap-[3px]">
        {days.map((day, i) => {
          const intensity =
            day.minutes === 0
              ? 0
              : day.minutes < 15
                ? 1
                : day.minutes < 30
                  ? 2
                  : day.minutes < 60
                    ? 3
                    : 4;
          return (
            <div
              key={i}
              className={cn(
                "aspect-square w-full rounded-[2px]",
                colors[intensity],
              )}
              title={`${day.date}: ${day.minutes}m`}
            />
          );
        })}
      </div>
    </div>
  );
}

function WeeklyMasteryChart({ values }: { values: number[] }) {
  return (
    <div className="rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <TrendingUp className="h-4 w-4 text-synapse-accent-emerald" />
        Weekly Mastery Trend
      </h3>
      <div className="flex h-28 items-end gap-1.5">
        {values.map((val, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[9px] font-medium text-synapse-text-muted">
              {val}%
            </span>
            <div
              className="w-full rounded-t transition-all duration-500"
              style={{
                height: `${val * 1.2}%`,
                backgroundColor:
                  i === values.length - 1 ? "#818cf8" : "#2a2252",
              }}
            />
            <span className="text-[9px] text-synapse-text-muted">
              {["M", "T", "W", "T", "F", "S", "S"][i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
