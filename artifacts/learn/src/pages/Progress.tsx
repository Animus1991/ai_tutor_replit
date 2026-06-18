import {
  PriorityTasksCard,
  buildPriorityTasksFromQueue,
} from "@/components/dashboard/PriorityTasksCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ActivityFeed,
  type ActivityItem,
  type ActivityType,
} from "@/components/visuals/ActivityFeed";
import { ReadinessRing } from "@/components/visuals/ReadinessRing";
import { SignalBars } from "@/components/visuals/SignalBars";
import { t } from "@/lib/i18n";
import { Link } from "@/lib/wouter-compat";
import {
  useGetDashboard,
  useGetLearnerModel,
  useGetRecentActivity,
  useGetTasks,
  useListCourses,
} from "@workspace/api-client-react";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Eye,
  FileText,
  Flame,
  Layout,
  Play,
  Target,
  Zap,
} from "lucide-react";

const ACTIVITY_TYPE_MAP: Record<string, ActivityType> = {
  lesson_complete: "lesson_complete",
  lesson_completed: "lesson_complete",
  quiz_passed: "quiz_passed",
  quiz_correct: "quiz_passed",
  quiz_failed: "quiz_failed",
  quiz_incorrect: "quiz_failed",
  review_done: "review_done",
  review_completed: "review_done",
  streak: "streak",
  mastery_up: "mastery_up",
  mistake_fixed: "mistake_fixed",
  xp_earned: "xp_earned",
};

function relativeTime(iso: string): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "";
  const diffSec = Math.round((Date.now() - ts) / 1000);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

const MASTERY_META: Record<string, { label: string; cls: string }> = {
  strong: {
    label: "Strong mastery",
    cls: "border-green-500/30 text-green-400",
  },
  proficient: {
    label: "Proficient",
    cls: "border-amber-500/30 text-amber-400",
  },
  developing: { label: "Developing", cls: "border-sky-500/30 text-sky-400" },
};

const BAND_META: Record<string, { label: string; cls: string; bar: string }> = {
  strong: { label: "Strong", cls: "text-green-400", bar: "bg-green-500" },
  proficient: {
    label: "Proficient",
    cls: "text-amber-400",
    bar: "bg-amber-500",
  },
  developing: { label: "Developing", cls: "text-sky-400", bar: "bg-sky-500" },
  weak: { label: "Weak", cls: "text-red-400", bar: "bg-red-500" },
};

export default function ProgressPage() {
  const { data: dash, isLoading: dashLoading } = useGetDashboard();
  const { data: activity } = useGetRecentActivity();
  const { data: model } = useGetLearnerModel();
  const { data: tasksData } = useGetTasks();
  const { data: coursesData } = useListCourses();

  const d = dash as
    | {
        totalNotes?: number;
        totalCourses?: number;
        totalXp?: number;
        currentStreak?: number;
        averageScore?: number;
      }
    | undefined;
  const m = model as
    | {
        examReadiness?: number | null;
        masteryLevel?: string | null;
        confidence?: number;
        accuracy?: number;
        selfReliance?: number;
        calibration?: { score: number; direction: string } | null;
        conceptMastery?: Array<{
          title: string;
          mastery: number;
          band: string;
          courseTitle?: string | null;
        }>;
        focusAreas?: string[];
        prerequisiteRepairs?: Array<{ concept: string; prerequisite: string }>;
        signals?: Array<{ label: string; score: number; detail: string }>;
      }
    | undefined;

  const readiness = m?.examReadiness ?? 0;
  const mMeta =
    MASTERY_META[m?.masteryLevel ?? "developing"] ?? MASTERY_META.developing;

  const taskQueue = tasksData as
    | {
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
      }
    | undefined;

  const { priority: priorityTasks, fix: fixTasks } = taskQueue
    ? buildPriorityTasksFromQueue(taskQueue)
    : { priority: [], fix: [] };

  const activeCourses =
    (
      coursesData as
        | Array<{
            id: number;
            title: string;
            status: string;
            totalSteps: number;
            estimatedMinutes: number;
          }>
        | undefined
    )
      ?.filter((c) => c.status === "ready")
      .slice(0, 4) ?? [];

  const showAntiPassive =
    (m?.signals?.find((s) => s.label.toLowerCase().includes("hint"))?.score ??
      100) < 50;

  if (dashLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("dash.welcome.morning")}</h1>
          <p className="mt-1 text-muted-foreground">{t("progress.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/workspace">
              <Layout className="mr-2 h-4 w-4" />
              {t("nav.workspace")}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/tasks">
              <Play className="mr-2 h-4 w-4" />
              Start Session
            </Link>
          </Button>
        </div>
      </div>

      {showAntiPassive && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
          <Eye className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-400">
              {t("dash.antiPassive.title")}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("dash.antiPassive.body")}
            </p>
            <Link
              href="/tasks"
              className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {t("dash.antiPassive.cta")} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center gap-8 p-6 sm:flex-row">
              <ReadinessRing
                value={readiness}
                size={150}
                strokeWidth={11}
                label="Exam Readiness"
                showBand={false}
              />
              <div className="flex-1 space-y-3">
                <Badge variant="outline" className={mMeta.cls}>
                  {mMeta.label}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Behaviour-derived exam readiness — never from self-reported
                  confidence alone.
                </p>
                {m?.calibration && (
                  <p className="text-xs text-muted-foreground">
                    Calibration: {m.calibration.direction} (
                    {m.calibration.score}/100)
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Link href="/tasks">
                    <Button size="sm" variant="outline">
                      Today's Tasks
                    </Button>
                  </Link>
                  <Link href="/library">
                    <Button size="sm" variant="outline">
                      Library
                    </Button>
                  </Link>
                  <Link href="/analytics">
                    <Button size="sm" variant="outline">
                      {t("nav.analytics")}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {m?.signals && m.signals.length > 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h2 className="mb-4 flex items-center gap-2 font-semibold">
                  <Target className="h-5 w-5 text-primary" />{" "}
                  {t("dash.readiness.title")}
                </h2>
                <SignalBars
                  signals={m.signals.map((s) => ({
                    label: s.label,
                    value: s.score,
                    color:
                      s.score >= 70
                        ? "#34d399"
                        : s.score >= 40
                          ? "#fbbf24"
                          : "#fb7185",
                    detail: s.detail,
                  }))}
                />
              </CardContent>
            </Card>
          ) : null}

          <PriorityTasksCard tasks={priorityTasks} fixTasks={fixTasks} />

          {activeCourses.length > 0 && (
            <Card className="bg-card border-border">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-semibold">
                    <BookOpen className="h-5 w-5 text-primary" /> Active Courses
                  </h2>
                  <Link
                    href="/library"
                    className="text-sm text-primary hover:underline"
                  >
                    Library
                  </Link>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {activeCourses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="rounded-xl border border-border p-4 transition-colors hover:border-primary/30"
                    >
                      <p className="line-clamp-2 font-medium">{course.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {course.totalSteps} steps · {course.estimatedMinutes}m
                      </p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {m?.conceptMastery && m.conceptMastery.length > 0 && (
            <Card className="bg-card border-border">
              <CardContent className="space-y-3 p-6">
                <h2 className="flex items-center gap-2 font-semibold">
                  <Brain className="h-5 w-5 text-primary" /> Concept Mastery
                </h2>
                {[...m.conceptMastery]
                  .sort((a, b) => a.mastery - b.mastery)
                  .slice(0, 8)
                  .map((c) => {
                    const band = BAND_META[c.band] ?? BAND_META.weak;
                    return (
                      <div key={c.title + c.mastery}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="truncate">{c.title}</span>
                          <span className={band.cls}>{c.mastery}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                          <div
                            className={`h-full ${band.bar}`}
                            style={{ width: `${c.mastery}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-3">
          {[
            { icon: FileText, label: "Notes", value: d?.totalNotes ?? 0 },
            { icon: BookOpen, label: "Courses", value: d?.totalCourses ?? 0 },
            { icon: Zap, label: "XP", value: d?.totalXp ?? 0 },
            {
              icon: Flame,
              label: "Streak",
              value: `${d?.currentStreak ?? 0}d`,
            },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label} className="bg-card border-border">
              <CardContent className="p-4">
                <Icon className="mb-2 h-4 w-4 text-primary" />
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {(m?.prerequisiteRepairs?.length ?? 0) > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="space-y-2 p-5">
            <h3 className="font-medium text-amber-400">Prerequisite Repair</h3>
            {m?.prerequisiteRepairs?.map((r, i) => (
              <p key={i} className="text-sm text-muted-foreground">
                Strengthen <strong>{r.prerequisite}</strong> before tackling{" "}
                <strong>{r.concept}</strong>
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      {(() => {
        const items =
          (activity as
            | Array<{
                id: number;
                activityType: string;
                description: string;
                xpEarned: number;
                createdAt: string;
              }>
            | undefined) ?? [];
        if (items.length === 0) return null;
        return (
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <h2 className="mb-3 flex items-center gap-2 font-semibold">
                <Zap className="h-5 w-5 text-primary" />{" "}
                {t("dash.activity.title")}
              </h2>
              <ActivityFeed
                items={items.slice(0, 8).map<ActivityItem>((item) => ({
                  id: item.id,
                  type: ACTIVITY_TYPE_MAP[item.activityType] ?? "xp_earned",
                  description: item.description,
                  xp: item.xpEarned,
                  timestamp: relativeTime(item.createdAt),
                }))}
                maxItems={8}
              />
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}
