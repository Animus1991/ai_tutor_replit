import { Link } from "wouter";
import { useGetDashboard, useGetRecentActivity, useGetLearningStyleInsights } from "@workspace/api-client-react";
import { BookOpen, Brain, FileText, Flame, Plus, Star, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color || "bg-primary/10"}`}>
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
  const { data: styleInsights } = useGetLearningStyleInsights();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-white/5 rounded w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white/5 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const stats = dashboard as {
    totalNotes?: number; totalCourses?: number; completedCourses?: number;
    inProgressCourses?: number; totalXp?: number; currentStreak?: number;
    weeklyXp?: number; averageScore?: number; recentCourses?: Array<{
      id: number; title: string; status: string; difficulty: string; courseType: string; totalSteps: number;
    }>; aiStyleLabel?: string;
  } | undefined;

  const recentActivity = activity as Array<{
    id: number; activityType: string; description: string; xpEarned: number; createdAt: string;
  }> | undefined;

  const insights = styleInsights as {
    inferredStyle?: string; confidence?: number; strengths?: string[]; recommendations?: string[];
    dataPointsCollected?: number; nextInsightAt?: number;
  } | undefined;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your learning overview</p>
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Zap} label="Total XP" value={(stats?.totalXp ?? 0).toLocaleString()} sub="lifetime earned" />
        <StatCard icon={Flame} label="Day Streak" value={stats?.currentStreak ?? 0} sub={`${stats?.weeklyXp ?? 0} XP this week`} color="bg-orange-500" />
        <StatCard icon={BookOpen} label="Courses" value={stats?.completedCourses ?? 0} sub={`${stats?.inProgressCourses ?? 0} in progress`} color="bg-cyan-500/80" />
        <StatCard icon={Star} label="Avg Score" value={`${stats?.averageScore ?? 0}%`} sub="quiz accuracy" color="bg-violet-500/80" />
      </div>

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
          <h2 className="text-xl font-semibold">Learning Style</h2>
          <Card className="bg-card border-border">
            <CardContent className="p-5 space-y-4">
              {insights?.inferredStyle ? (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Inferred Style</p>
                    <p className="font-semibold text-foreground capitalize">{insights.inferredStyle.replace(/-/g, " ")}</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Confidence</span>
                      <span>{Math.round((insights.confidence ?? 0) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.round((insights.confidence ?? 0) * 100)}%` }}
                      />
                    </div>
                  </div>
                  {insights.strengths && insights.strengths.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Strengths</p>
                      {insights.strengths.slice(0, 2).map((s, i) => (
                        <p key={i} className="text-sm text-foreground flex items-start gap-1.5 mb-1">
                          <span className="text-primary mt-0.5">›</span> {s}
                        </p>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <Brain className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Complete {insights?.nextInsightAt ?? 5} more lessons to unlock your learning style insights.
                  </p>
                </div>
              )}
              <Link href="/profile" className="text-xs text-primary hover:underline block">
                View full insights →
              </Link>
            </CardContent>
          </Card>

          {recentActivity && recentActivity.length > 0 && (
            <>
              <h2 className="text-xl font-semibold pt-2">Recent Activity</h2>
              <div className="space-y-2">
                {recentActivity.slice(0, 5).map((item) => (
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
