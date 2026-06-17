import { Link } from "wouter";
import { useGetDashboard, useGetRecentActivity, useGetLearnerModel } from "@workspace/api-client-react";
import { BookOpen, Brain, FileText, Flame, Plus, Star, Target, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function barColor(v: number) {
  return v >= 70 ? "bg-green-500" : v >= 40 ? "bg-amber-500" : "bg-red-500";
}

const MASTERY_META: Record<string, { label: string; cls: string }> = {
  strong: { label: "Strong mastery", cls: "border-green-500/30 text-green-400" },
  proficient: { label: "Proficient", cls: "border-amber-500/30 text-amber-400" },
  developing: { label: "Developing", cls: "border-sky-500/30 text-sky-400" },
};

const CAL_META: Record<string, { label: string; cls: string }> = {
  overconfident: { label: "Overconfident", cls: "text-amber-400" },
  underconfident: { label: "Underconfident", cls: "text-sky-400" },
  calibrated: { label: "Well-calibrated", cls: "text-green-400" },
};

const BAND_META: Record<string, { label: string; cls: string; bar: string }> = {
  strong: { label: "Strong", cls: "text-green-400", bar: "bg-green-500" },
  proficient: { label: "Proficient", cls: "text-amber-400", bar: "bg-amber-500" },
  developing: { label: "Developing", cls: "text-sky-400", bar: "bg-sky-500" },
  weak: { label: "Weak", cls: "text-red-400", bar: "bg-red-500" },
};

function ReadinessRing({ value }: { value: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const stroke = value >= 70 ? "#22c55e" : value >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="9" className="stroke-white/10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          stroke={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">% ready</span>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${color || "bg-primary/10"}`}>
            <Icon className={`h-5 w-5 ${color ? "text-white" : "text-primary"}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: dashboard, isLoading } = useGetDashboard();
  const { data: activity } = useGetRecentActivity();
  const { data: learnerModel } = useGetLearnerModel();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-white/5 rounded w-48" />
        <div className="h-44 bg-white/5 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const stats = dashboard as {
    totalNotes?: number; totalCourses?: number; completedCourses?: number;
    inProgressCourses?: number; totalXp?: number; currentStreak?: number;
    weeklyXp?: number; averageScore?: number; recentCourses?: Array<{
      id: number; title: string; status: string; difficulty: string; courseType: string; totalSteps: number;
    }>;
  } | undefined;

  const recentActivity = activity as Array<{
    id: number; activityType: string; description: string; xpEarned: number; createdAt: string;
  }> | undefined;

  const model = learnerModel as {
    examReadiness?: number | null; masteryLevel?: string | null; confidence?: number;
    accuracy?: number; selfReliance?: number;
    calibration?: { score: number; direction: string; avgConfidence: number; sampleSize: number } | null;
    signals?: Array<{ label: string; score: number; detail: string }>;
    strengths?: string[]; focusAreas?: string[];
    conceptMastery?: Array<{ conceptId: number; title: string; courseId: number; courseTitle?: string | null; mastery: number; confidence: number; importance: number; attempts: number; band: string }>;
    readinessByCourse?: Array<{ courseId: number; courseTitle?: string | null; readiness: number | null; conceptCount: number }>;
    prerequisiteRepairs?: Array<{ concept: string; prerequisite: string }>;
    dataPointsCollected?: number; nextInsightAt?: number;
  } | undefined;

  const mMeta = MASTERY_META[model?.masteryLevel ?? "developing"] ?? MASTERY_META.developing;
  const hasModel = model?.examReadiness != null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">How exam-ready you are, at a glance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/notes">
              <FileText className="h-4 w-4 mr-2" />
              Upload Notes
            </Link>
          </Button>
          <Button asChild>
            <Link href="/courses/new">
              <Plus className="h-4 w-4 mr-2" />
              New Course
            </Link>
          </Button>
        </div>
      </div>

      {/* Exam Readiness hero */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          {hasModel ? (
            <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
              <div className="flex items-center gap-5 lg:w-1/2">
                <ReadinessRing value={model!.examReadiness!} />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Exam Readiness</p>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={mMeta.cls}>{mMeta.label}</Badge>
                    <span className="text-xs text-muted-foreground">{Math.round((model!.confidence ?? 0) * 100)}% confidence</span>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Built from your real performance — accuracy, hint reliance and practice volume.
                  </p>
                  {model!.calibration && (
                    <p className="text-xs mt-2">
                      <span className="text-muted-foreground">Confidence calibration: </span>
                      <span className={CAL_META[model!.calibration.direction]?.cls ?? "text-muted-foreground"}>
                        {CAL_META[model!.calibration.direction]?.label ?? model!.calibration.direction} · {model!.calibration.score}/100
                      </span>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-3 lg:border-l lg:border-border lg:pl-6">
                {model!.signals?.map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm text-foreground">{s.label}</span>
                      <span className="text-xs text-muted-foreground">{s.score}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColor(s.score)}`} style={{ width: `${s.score}%` }} />
                    </div>
                  </div>
                ))}
                <Link href="/profile" className="text-xs text-primary hover:underline inline-block pt-1">
                  View full breakdown →
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Your Exam Readiness score is warming up</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Answer {model?.nextInsightAt ?? 5} more graded questions and we'll score how exam-ready you are — from real performance, not a personality quiz.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Star} label="Avg Score" value={`${stats?.averageScore ?? 0}%`} sub="quiz accuracy" color="bg-violet-500/80" />
        <StatCard icon={BookOpen} label="Courses" value={stats?.completedCourses ?? 0} sub={`${stats?.inProgressCourses ?? 0} in progress`} color="bg-cyan-500/80" />
        <StatCard icon={Flame} label="Day Streak" value={stats?.currentStreak ?? 0} sub={`${stats?.weeklyXp ?? 0} XP this week`} color="bg-orange-500" />
        <StatCard icon={Zap} label="Total XP" value={(stats?.totalXp ?? 0).toLocaleString()} sub="lifetime earned" />
      </div>

      {/* Concept Mastery */}
      {model?.conceptMastery && model.conceptMastery.length > 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" /> Concept Mastery
              </h2>
              <Link href="/profile" className="text-sm text-primary hover:underline">All concepts →</Link>
            </div>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
              {model.conceptMastery.slice(0, 6).map((c) => {
                const meta = BAND_META[c.band] ?? BAND_META.developing;
                return (
                  <div key={c.conceptId}>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm text-foreground truncate pr-2">{c.title}</span>
                      <span className={`text-xs shrink-0 ${meta.cls}`}>{c.mastery}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${c.mastery}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {model.readinessByCourse && model.readinessByCourse.length > 0 && (
              <div className="mt-5 pt-4 border-t border-border flex flex-wrap gap-2">
                {model.readinessByCourse.map((c) => (
                  <Badge key={c.courseId} variant="outline" className="text-xs text-muted-foreground">
                    {c.courseTitle ?? "Course"}: {c.readiness}% ready
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Courses</h2>
            <Link href="/courses" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          {!stats?.recentCourses?.length ? (
            <Card className="bg-card border-border border-dashed">
              <CardContent className="p-12 text-center">
                <Brain className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No courses yet. Upload some notes to get started.</p>
                <Button asChild>
                  <Link href="/notes">
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Notes
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {stats.recentCourses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <Card className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{course.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={course.status === "ready" ? "default" : course.status === "generating" ? "secondary" : "destructive"} className="text-xs">
                            {course.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground capitalize">{course.difficulty}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground capitalize">{course.courseType}</span>
                          {course.totalSteps > 0 && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">{course.totalSteps} steps</span>
                            </>
                          )}
                        </div>
                      </div>
                      <BookOpen className="h-5 w-5 text-muted-foreground shrink-0 ml-4" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.slice(0, 6).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{item.description}</p>
                  </div>
                  {item.xpEarned > 0 && (
                    <span className="text-xs font-medium text-primary shrink-0">+{item.xpEarned} XP</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border border-dashed">
              <CardContent className="p-8 text-center">
                <Zap className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
