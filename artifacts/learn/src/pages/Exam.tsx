import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { t } from "@/lib/i18n";
import { Link } from "@/lib/wouter-compat";
import {
  getGetExamMockQueryKey,
  useGetExamMock,
} from "@workspace/api-client-react";
import { Clock, GraduationCap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function ExamPage() {
  const [count, setCount] = useState(10);
  const [duration, setDuration] = useState(25);
  const [started, setStarted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const { data, refetch, isFetching } = useGetExamMock(
    { count, durationMinutes: duration },
    {
      query: {
        enabled: false,
        queryKey: getGetExamMockQueryKey({ count, durationMinutes: duration }),
      },
    },
  );

  const exam = data as
    | {
        durationMinutes: number;
        questionCount: number;
        questions: Array<{
          index: number;
          stepId: number;
          courseId: number;
          courseTitle?: string | null;
          question: string;
          type: string;
          choices?: string[] | null;
        }>;
      }
    | undefined;

  const tick = useCallback(() => {
    setSecondsLeft((s) => {
      if (s <= 1) return 0;
      return s - 1;
    });
  }, []);

  useEffect(() => {
    if (!started || secondsLeft <= 0) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [started, secondsLeft, tick]);

  async function startExam() {
    await refetch();
    setStarted(true);
    setSecondsLeft(duration * 60);
    setCurrentIdx(0);
    setAnswers({});
  }

  const q = exam?.questions[currentIdx];
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          {t("tasks.examMode")}
        </h1>
        <p className="text-muted-foreground mt-1">
          Timed simulation prioritising your weakest concepts.
        </p>
      </div>

      {!started ? (
        <Card className="bg-card border-border">
          <CardContent className="p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm">Questions</label>
                <Select
                  value={String(count)}
                  onValueChange={(v) => setCount(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 15, 20].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm">Duration (minutes)</label>
                <Select
                  value={String(duration)}
                  onValueChange={(v) => setDuration(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 25, 50].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} min
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={startExam}
              disabled={isFetching}
              className="w-full"
            >
              Start Exam Simulation
            </Button>
          </CardContent>
        </Card>
      ) : exam && q ? (
        <>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {mins}:{secs.toString().padStart(2, "0")}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Question {currentIdx + 1} / {exam.questions.length}
            </span>
          </div>
          <Card className="bg-card border-border">
            <CardContent className="p-6 space-y-4">
              <p className="text-xs text-muted-foreground">{q.courseTitle}</p>
              <p className="text-lg font-medium">{q.question}</p>
              {q.choices ? (
                <div className="space-y-2">
                  {q.choices.map((c) => (
                    <button
                      key={c}
                      onClick={() => setAnswers({ ...answers, [q.stepId]: c })}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${answers[q.stepId] === c ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  className="w-full min-h-[100px] rounded-lg border border-border bg-input p-3 text-sm"
                  value={answers[q.stepId] ?? ""}
                  onChange={(e) =>
                    setAnswers({ ...answers, [q.stepId]: e.target.value })
                  }
                  placeholder="Your answer..."
                />
              )}
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button
              variant="outline"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => i - 1)}
            >
              Previous
            </Button>
            {currentIdx < exam.questions.length - 1 ? (
              <Button onClick={() => setCurrentIdx((i) => i + 1)}>Next</Button>
            ) : (
              <Link href={`/courses/${q.courseId}/play?step=${q.stepId}`}>
                <Button>Grade in Lesson Player</Button>
              </Link>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
