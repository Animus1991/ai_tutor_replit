import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { t } from "@/lib/i18n";
import { Link } from "@/lib/wouter-compat";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetTaskCountQueryKey,
  getGetTasksQueryKey,
  useGetStudyPlan,
  useGetTasks,
  useSubmitConceptReview,
} from "@workspace/api-client-react";
import {
  AlertCircle,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

const RATINGS = [
  {
    id: "again" as const,
    label: "Again",
    desc: "Forgot it",
    cls: "border-red-500/40 hover:bg-red-500/10 text-red-400",
  },
  {
    id: "hard" as const,
    label: "Hard",
    desc: "Struggled",
    cls: "border-amber-500/40 hover:bg-amber-500/10 text-amber-400",
  },
  {
    id: "good" as const,
    label: "Good",
    desc: "Recalled",
    cls: "border-sky-500/40 hover:bg-sky-500/10 text-sky-400",
  },
  {
    id: "easy" as const,
    label: "Easy",
    desc: "Effortless",
    cls: "border-green-500/40 hover:bg-green-500/10 text-green-400",
  },
];

function formatDue(dueAt: string) {
  const diff = new Date(dueAt).getTime() - Date.now();
  const days = Math.abs(Math.floor(diff / 86_400_000));
  if (diff < 0) return days === 0 ? "overdue today" : `${days}d overdue`;
  return days === 0 ? "due today" : `due in ${days}d`;
}

export default function TasksPage() {
  const { data, isLoading } = useGetTasks();
  const { data: planData } = useGetStudyPlan();
  const submitReview = useSubmitConceptReview();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeConcept, setActiveConcept] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState<number | null>(null);

  const queue = data as
    | {
        overdueCount: number;
        reviews: Array<{
          conceptId: number;
          courseId: number;
          conceptTitle: string;
          conceptDescription?: string | null;
          courseTitle?: string | null;
          dueAt: string;
          mastery?: number | null;
          retrievability: number;
        }>;
        mistakes: Array<{
          id: number;
          courseId: number;
          stepId: number;
          stepTitle?: string | null;
          courseTitle?: string | null;
          conceptTitle?: string | null;
          createdAt: string;
        }>;
      }
    | undefined;

  async function handleReview(
    conceptId: number,
    rating: "again" | "hard" | "good" | "easy",
  ) {
    setSubmitting(conceptId);
    try {
      await submitReview.mutateAsync({ conceptId, data: { rating } });
      await queryClient.invalidateQueries({ queryKey: getGetTasksQueryKey() });
      await queryClient.invalidateQueries({
        queryKey: getGetTaskCountQueryKey(),
      });
      setActiveConcept(null);
      setRevealed((prev) => {
        const n = new Set(prev);
        n.delete(conceptId);
        return n;
      });
      toast({
        title: "Review saved",
        description: `Next review scheduled (${rating}).`,
      });
    } catch {
      toast({ title: "Review failed", variant: "destructive" });
    } finally {
      setSubmitting(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-white/5 rounded animate-pulse" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const reviews = queue?.reviews ?? [];
  const mistakes = queue?.mistakes ?? [];
  const total = queue?.overdueCount ?? 0;

  const plan = planData as
    | {
        summary?: string;
        cramMode?: boolean;
        daysUntilExam?: number | null;
        blocks?: Array<{
          type: string;
          title: string;
          minutes: number;
          href?: string | null;
        }>;
        totalMinutes?: number;
      }
    | undefined;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            {t("tasks.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("tasks.subtitle")}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {total > 0 && <Badge variant="secondary">{total} due</Badge>}
          <Link href="/exam">
            <Button size="sm" variant="outline">
              <GraduationCap className="h-4 w-4 mr-1" />
              {t("tasks.examMode")}
            </Button>
          </Link>
          <Link href="/errors">
            <Button size="sm" variant="outline">
              <AlertCircle className="h-4 w-4 mr-1" />
              {t("tasks.errorNotebook")}
            </Button>
          </Link>
        </div>
      </div>

      {plan?.blocks && plan.blocks.length > 0 && (
        <Card
          className={`border-border ${plan.cramMode ? "bg-amber-500/5 border-amber-500/20" : "bg-card"}`}
        >
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">{t("tasks.studyPlan")}</h2>
              {plan.cramMode && (
                <Badge variant="destructive" className="text-xs">
                  Cram mode
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{plan.summary}</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {plan.blocks.map((b, i) => (
                <Link key={i} href={b.href || "/library"}>
                  <div className="p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
                    <p className="text-sm font-medium">{b.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.minutes} min
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {total === 0 ? (
        <Card className="border-dashed border-border bg-transparent">
          <CardContent className="p-16 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500/40 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold mb-3">All caught up!</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              No reviews or mistakes are due right now. Complete more quiz steps
              to build your review queue.
            </p>
            <Link href="/courses">
              <Button>Continue Learning</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {reviews.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Concept Reviews ({reviews.length})
              </h2>
              <div className="grid gap-4">
                {reviews.map((r) => {
                  const isActive = activeConcept === r.conceptId;
                  const isRevealed = revealed.has(r.conceptId);
                  return (
                    <Card key={r.conceptId} className="bg-card border-border">
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {r.courseTitle}
                            </p>
                            <h3 className="font-semibold text-lg">
                              {r.conceptTitle}
                            </h3>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDue(r.dueAt)}
                              </span>
                              {r.mastery != null && (
                                <span>Mastery {r.mastery}%</span>
                              )}
                              <span>Recall ~{r.retrievability}%</span>
                            </div>
                          </div>
                          {!isActive && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setActiveConcept(r.conceptId);
                                setRevealed(new Set());
                              }}
                            >
                              Review
                            </Button>
                          )}
                        </div>

                        {isActive && (
                          <div className="space-y-4 pt-2 border-t border-border">
                            {!isRevealed ? (
                              <>
                                <p className="text-sm text-muted-foreground">
                                  Active recall: try to explain this concept
                                  from memory before revealing.
                                </p>
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    setRevealed((p) =>
                                      new Set(p).add(r.conceptId),
                                    )
                                  }
                                >
                                  Reveal concept
                                </Button>
                              </>
                            ) : (
                              <>
                                {r.conceptDescription && (
                                  <p className="text-sm bg-white/5 rounded-lg p-4">
                                    {r.conceptDescription}
                                  </p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                  How well did you recall it?
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {RATINGS.map((rating) => (
                                    <button
                                      key={rating.id}
                                      disabled={submitting === r.conceptId}
                                      onClick={() =>
                                        handleReview(r.conceptId, rating.id)
                                      }
                                      className={`rounded-lg border p-3 text-left transition-colors ${rating.cls}`}
                                    >
                                      <p className="font-medium text-sm">
                                        {rating.label}
                                      </p>
                                      <p className="text-xs opacity-70">
                                        {rating.desc}
                                      </p>
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {mistakes.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-amber-400" />
                Retry Mistakes ({mistakes.length})
              </h2>
              <div className="grid gap-3">
                {mistakes.map((m) => (
                  <Card key={m.id} className="bg-card border-amber-500/20">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          {m.courseTitle}
                        </p>
                        <p className="font-medium truncate">
                          {m.stepTitle || "Quiz question"}
                        </p>
                        {m.conceptTitle && (
                          <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {m.conceptTitle}
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/courses/${m.courseId}/play?step=${m.stepId}`}
                      >
                        <Button size="sm" variant="outline">
                          Retry
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
