/**
 * CourseDetail — Option A CourseView adapted to real API data.
 * Overview before entering the full-screen lesson player at /courses/:id/play.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ConceptGraph,
  type ConceptGraphEdge,
  type ConceptGraphNode,
} from "@/components/visuals/ConceptGraph";
import { ProgressTimeline } from "@/components/visuals/DiagramGenerator";
import { ReadinessRing } from "@/components/visuals/ReadinessRing";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Link, useRoute } from "@/lib/wouter-compat";
import {
  getGetCourseProgressQueryKey,
  getGetCourseQueryKey,
  getListCourseConceptsQueryKey,
  useGetCourse,
  useGetCourseProgress,
  useListCourseConcepts,
} from "@workspace/api-client-react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  Lock,
  MapPin,
  Network,
  Play,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

type CourseTab = "path" | "map" | "analytics";

const COURSE_PALETTE = ["#818cf8", "#22d3ee", "#2dd4bf", "#fb923c", "#f472b6"];
const SUBJECT_ICONS: Record<string, string> = {
  economics: "📊",
  programming: "🐍",
  philosophy: "🧠",
  mathematics: "📐",
  science: "🔬",
  default: "📚",
};

function courseColor(id: number) {
  return COURSE_PALETTE[id % COURSE_PALETTE.length];
}

function courseIcon(subject?: string | null) {
  if (!subject) return SUBJECT_ICONS.default;
  const key = subject.toLowerCase();
  for (const [k, icon] of Object.entries(SUBJECT_ICONS)) {
    if (key.includes(k)) return icon;
  }
  return SUBJECT_ICONS.default;
}

function stepTypeLabel(type: string) {
  const map: Record<string, string> = {
    introduction: "Introduction",
    explanation: "Core Concept",
    example: "Example",
    question: "Knowledge Check",
    code_exercise: "Practice",
    summary: "Summary",
  };
  return map[type] ?? type.replace(/_/g, " ");
}

export default function CourseDetailPage() {
  const [, params] = useRoute("/courses/:id");
  const courseId = Number(params?.id);
  const [tab, setTab] = useState<CourseTab>("path");

  const { data: course, isLoading } = useGetCourse(courseId, {
    query: { enabled: !!courseId, queryKey: getGetCourseQueryKey(courseId) },
  });
  const { data: progressData } = useGetCourseProgress(courseId, {
    query: {
      enabled: !!courseId,
      queryKey: getGetCourseProgressQueryKey(courseId),
    },
  });
  const { data: conceptsData } = useListCourseConcepts(courseId, {
    query: {
      enabled: !!courseId,
      queryKey: getListCourseConceptsQueryKey(courseId),
    },
  });

  const c = course as
    | {
        id: number;
        title: string;
        description?: string | null;
        status: string;
        difficulty: string;
        courseType: string;
        subject?: string | null;
        totalSteps: number;
        estimatedMinutes: number;
        quizFrequency?: string;
        steps?: Array<{
          id: number;
          position: number;
          stepType: string;
          title: string | null;
          xpReward: number;
        }>;
      }
    | undefined;

  const progress = progressData as
    | {
        completedStepIds?: number[];
        percentComplete?: number;
        totalXp?: number;
      }
    | undefined;

  const concepts =
    (
      conceptsData as
        | {
            concepts?: Array<{
              id: number;
              title: string;
              mastery: number | null;
              band: string | null;
            }>;
            edges?: Array<{
              prerequisiteConceptId: number;
              dependentConceptId: number;
            }>;
          }
        | undefined
    )?.concepts ?? [];

  const edges =
    (
      conceptsData as
        | {
            edges?: Array<{
              prerequisiteConceptId: number;
              dependentConceptId: number;
            }>;
          }
        | undefined
    )?.edges ?? [];

  const graphLayout = useMemo(() => {
    const nodes: ConceptGraphNode[] = concepts.map((concept, i) => {
      const cols = Math.ceil(Math.sqrt(concepts.length || 1));
      const row = Math.floor(i / cols);
      const col = i % cols;
      return {
        id: String(concept.id),
        label: concept.title,
        mastery: concept.mastery ?? 0,
        type: "concept" as const,
        x: 80 + col * 140,
        y: 60 + row * 100,
      };
    });
    const graphEdges: ConceptGraphEdge[] = edges.map((e) => ({
      from: String(e.prerequisiteConceptId),
      to: String(e.dependentConceptId),
      relation: "prerequisite" as const,
    }));
    return { nodes, edges: graphEdges };
  }, [concepts, edges]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!c) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground mb-4">Course not found.</p>
        <Button asChild variant="outline">
          <Link href="/library">Back to Library</Link>
        </Button>
      </div>
    );
  }

  if (c.status === "generating") {
    return (
      <div className="py-20 text-center space-y-4">
        <Sparkles className="mx-auto h-12 w-12 animate-pulse text-primary" />
        <h2 className="text-xl font-bold">Generating your course...</h2>
        <p className="text-sm text-muted-foreground">
          This usually takes 10–30 seconds.
        </p>
        <Button asChild variant="outline">
          <Link href="/library">Back to Library</Link>
        </Button>
      </div>
    );
  }

  const steps = c.steps ?? [];
  const completedIds = new Set(progress?.completedStepIds ?? []);
  const completedCount = completedIds.size;
  const totalSteps = steps.length || c.totalSteps;
  const pct =
    progress?.percentComplete ??
    (totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0);
  const color = courseColor(c.id);
  const icon = courseIcon(c.subject);
  const remainingHours = Math.max(
    0,
    (c.estimatedMinutes / 60) * (1 - pct / 100),
  ).toFixed(1);

  const tabs: { key: CourseTab; label: string; icon: typeof MapPin }[] = [
    { key: "path", label: t("course.tab.path"), icon: MapPin },
    { key: "map", label: t("course.tab.map"), icon: Network },
    { key: "analytics", label: t("course.tab.analytics"), icon: BarChart3 },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link
          href="/library"
          className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("course.backToLibrary")}
        </Link>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            <span className="text-4xl">{icon}</span>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">{c.title}</h1>
              {c.description && (
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                  {c.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {totalSteps} {t("course.lessons")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {c.estimatedMinutes}m {t("course.estimated")}
                </span>
                <Badge variant="outline" className="text-xs capitalize">
                  {c.difficulty}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {c.courseType}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <Button variant="outline" asChild>
              <Link href={`/agent?courseId=${c.id}`}>
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                {t("course.askAgent")}
              </Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-synapse-brand-600 to-synapse-brand-500"
            >
              <Link href={`/courses/${c.id}/play`}>
                <Play className="mr-2 h-4 w-4" />
                {pct > 0 && pct < 100
                  ? t("course.continue")
                  : t("course.start")}
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-border bg-card p-5"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium">{t("course.progress")}</span>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{totalSteps} {t("course.stepsDone")}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-3 rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>
            {pct}% {t("course.complete")}
          </span>
          <span>
            ~{remainingHours}h {t("course.remaining")}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
          <div className="text-center">
            <p className="text-lg font-bold">{concepts.length}</p>
            <p className="text-[10px] text-muted-foreground">
              {t("course.concepts")}
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{progress?.totalXp ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">XP</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold capitalize text-xs">
              {c.quizFrequency ?? "adaptive"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {t("course.quizFreq")}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="flex items-center gap-6 overflow-x-auto border-b border-border synapse-hide-scrollbar">
        {tabs.map((tabItem) => {
          const Icon = tabItem.icon;
          return (
            <button
              key={tabItem.key}
              type="button"
              onClick={() => setTab(tabItem.key)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 border-b-2 pb-3 text-sm font-medium transition-all",
                tab === tabItem.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tabItem.label}</span>
            </button>
          );
        })}
      </div>

      {tab === "path" && (
        <div className="space-y-3">
          {steps.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              {t("course.noSteps")}
            </div>
          ) : (
            steps.map((step, i) => {
              const done = completedIds.has(step.id);
              const locked =
                i > 0 && !completedIds.has(steps[i - 1]?.id ?? -1) && !done;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    "rounded-2xl border bg-card p-4 transition-all",
                    locked ? "opacity-60" : "hover:border-primary/30",
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                      {locked ? (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      ) : done ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      ) : (
                        <Circle className="h-5 w-5" style={{ color }} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {step.title || stepTypeLabel(step.stepType)}
                      </p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {stepTypeLabel(step.stepType)} · +{step.xpReward} XP
                      </p>
                    </div>
                    {!locked && (
                      <Button
                        size="sm"
                        variant={done ? "outline" : "default"}
                        asChild
                      >
                        <Link href={`/courses/${c.id}/play?step=${step.id}`}>
                          {done ? t("course.review") : t("course.start")}
                        </Link>
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {tab === "map" && (
        <div className="space-y-4">
          {graphLayout.nodes.length > 0 ? (
            <ConceptGraph
              nodes={graphLayout.nodes}
              edges={graphLayout.edges}
              width={660}
              height={Math.max(
                280,
                Math.ceil(graphLayout.nodes.length / 4) * 120,
              )}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              {t("course.noConcepts")}
            </div>
          )}
        </div>
      )}

      {tab === "analytics" && (
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex items-center justify-center rounded-2xl border border-border bg-card p-6">
            <ReadinessRing
              value={pct}
              size={160}
              label={t("course.mastery")}
              sublabel={t("course.masteryHint")}
            />
          </div>
          <ProgressTimeline
            milestones={steps.slice(0, 6).map((s, i) => ({
              label: s.title || stepTypeLabel(s.stepType),
              date: `Step ${i + 1}`,
              completed: completedIds.has(s.id),
            }))}
          />
        </div>
      )}
    </div>
  );
}
