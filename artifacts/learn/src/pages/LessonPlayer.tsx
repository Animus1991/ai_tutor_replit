import { PracticalLessonStep } from "@/components/lesson/PracticalLessonStep";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ConfidenceSelector } from "@/components/visuals/ConfidenceSelector";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation, useRoute } from "@/lib/wouter-compat";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetCourseProgressQueryKey,
  getGetCourseQueryKey,
  useCreateOpenaiConversation,
  useGetCourse,
  useGetCourseProgress,
} from "@workspace/api-client-react";
import {
  ArrowLeft,
  Bot,
  ChevronRight,
  Code2,
  Gauge,
  HelpCircle,
  Info,
  Loader2,
  Send,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

interface LessonStep {
  id: number;
  courseId: number;
  position: number;
  stepType: string;
  title: string | null;
  content: string;
  xpReward: number;
  isRequired: number;
  questionData: {
    type: string;
    question: string;
    choices?: string[];
    correctAnswer: string;
    explanation: string;
  } | null;
  codeData: {
    language: string;
    instructions: string;
    starterCode: string;
    solution: string;
    expectedOutput: string;
  } | null;
}

interface Course {
  id: number;
  title: string;
  status: string;
  difficulty: string;
  courseType: string;
  totalSteps: number;
  estimatedMinutes: number;
  steps?: LessonStep[];
}

interface Progress {
  courseId: number;
  currentStepPosition: number;
  completedStepIds: number[];
  totalXp: number;
  correctAnswers: number;
  incorrectAnswers: number;
  hintsUsed: number;
  percentComplete: number;
  completedAt?: string;
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/10 prose-code:text-cyan-300 prose-headings:text-foreground">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

function XpBurst({ xp, onDone }: { xp: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed top-20 right-8 z-50 animate-bounce pointer-events-none">
      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold text-sm flex items-center gap-1.5 shadow-lg">
        <Zap className="h-4 w-4" />+{xp} XP
      </div>
    </div>
  );
}

function StreamingPanel({
  title,
  onClose,
  streamFn,
}: {
  title: string;
  onClose: () => void;
  streamFn: () => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setText("");
    streamFn().then(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      className="border-l border-border bg-card flex flex-col"
      style={{ width: 360 }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">{title}</span>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {loading && !text && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
          </div>
        )}
        <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

function TutorChat({
  courseId,
  stepId,
  onClose,
}: { courseId: number; stepId: number; onClose: () => void }) {
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [convoId, setConvoId] = useState<number | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const createConvo = useCreateOpenaiConversation();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    createConvo
      .mutateAsync({ data: { courseId, stepId: String(stepId) } as never })
      .then((c) => {
        const conv = c as { id: number };
        setConvoId(conv.id);
      });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !convoId || isStreaming) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsStreaming(true);

    let aiText = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch(
        `/api/openai/conversations/${convoId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: userMsg }),
        },
      );
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder
          .decode(value)
          .split("\n")
          .filter((l) => l.startsWith("data:"));
        for (const line of lines) {
          try {
            const event = JSON.parse(line.slice(5));
            if (event.content) {
              aiText += event.content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: aiText,
                };
                return updated;
              });
            }
          } catch {
            /* skip */
          }
        }
      }
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div
      className="border-l border-border bg-[#080d14] flex flex-col"
      style={{ width: 380 }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">AI Tutor Chat</span>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center mt-8">
            Ask your AI tutor anything about this lesson step.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${m.role === "assistant" ? "bg-primary/20" : "bg-white/10"}`}
            >
              {m.role === "assistant" ? (
                <Bot className="h-3.5 w-3.5 text-primary" />
              ) : (
                <span className="text-xs">You</span>
              )}
            </div>
            <div
              className={`rounded-2xl px-3.5 py-2.5 text-sm max-w-[80%] ${m.role === "user" ? "bg-primary/10 text-foreground" : "bg-white/5 text-foreground"}`}
            >
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>
                  {m.content ||
                    (isStreaming && i === messages.length - 1 ? "▋" : "")}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about this topic..."
            rows={2}
            className="resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming || !convoId}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function stepLabel(type: string, title: string | null) {
  if (title) return title;
  const map: Record<string, string> = {
    introduction: "Intro",
    explanation: "Concept",
    example: "Example",
    question: "Check",
    code_exercise: "Practice",
    summary: "Summary",
  };
  return map[type] ?? type.replace(/_/g, " ");
}

function QuestionStep({
  step,
  courseId,
  onAdvance,
}: { step: LessonStep; courseId: number; onAdvance: (xp: number) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    correct: boolean;
    explanation: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const qd = step.questionData!;

  async function handleSubmit() {
    if (!selected || confidence === null || submitted) return;
    setIsSubmitting(true);
    try {
      const r = await fetch(`/api/courses/${courseId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          stepId: step.id,
          action: "submit_answer",
          answer: selected,
          confidence,
        }),
      });
      const data = (await r.json()) as {
        correct: boolean;
        explanation: string;
        xpEarned: number;
      };
      setResult({ correct: data.correct, explanation: data.explanation });
      setSubmitted(true);
      if (data.correct) onAdvance(data.xpEarned);
    } catch {
      toast({ title: "Failed to submit", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          Knowledge Check
        </Badge>
        <span className="text-xs text-muted-foreground capitalize">
          {qd.type.replace("_", " ")}
        </span>
      </div>
      <p className="text-lg font-medium text-foreground">{qd.question}</p>

      {qd.choices ? (
        <div className="space-y-2">
          {qd.choices.map((choice, i) => {
            const letter = ["A", "B", "C", "D"][i] || String(i + 1);
            const isSelected = selected === choice || selected === letter;
            const isCorrect =
              submitted &&
              (choice.toLowerCase().includes(qd.correctAnswer.toLowerCase()) ||
                qd.correctAnswer.toLowerCase().includes(choice.toLowerCase()) ||
                letter === qd.correctAnswer.toUpperCase());
            const isWrong = submitted && isSelected && !isCorrect;
            return (
              <button
                key={i}
                disabled={submitted}
                onClick={() => {
                  if (!submitted) {
                    setSelected(choice);
                    setConfidence(null);
                  }
                }}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                  isCorrect
                    ? "border-green-500 bg-green-500/10 text-green-300"
                    : isWrong
                      ? "border-red-500 bg-red-500/10 text-red-300"
                      : isSelected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-white/[0.02] hover:border-white/20 text-foreground"
                }`}
              >
                <span
                  className={`h-6 w-6 rounded-full border flex items-center justify-center text-xs font-mono shrink-0 ${isSelected || isCorrect ? "border-current" : "border-muted-foreground"}`}
                >
                  {letter}
                </span>
                {choice}
              </button>
            );
          })}
        </div>
      ) : (
        <Textarea
          placeholder="Type your answer..."
          value={selected || ""}
          onChange={(e) => setSelected(e.target.value)}
          disabled={submitted}
          rows={3}
          className="resize-none"
        />
      )}

      {!submitted ? (
        <>
          {selected && (
            <ConfidenceSelector
              value={confidence}
              onChange={setConfidence}
              label="How sure are you?"
            />
          )}
          <Button
            onClick={handleSubmit}
            disabled={!selected || confidence === null || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              "Submit Answer"
            )}
          </Button>
        </>
      ) : (
        <div
          className={`p-4 rounded-xl border ${result?.correct ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}
        >
          <p
            className={`font-semibold text-sm mb-1 ${result?.correct ? "text-green-400" : "text-red-400"}`}
          >
            {result?.correct ? "Correct!" : "Not quite — keep going"}
          </p>
          {result?.explanation && (
            <p className="text-sm text-muted-foreground">
              {result.explanation}
            </p>
          )}
          {confidence !== null && confidence >= 90 && !result?.correct && (
            <p className="text-xs text-amber-400/90 mt-2 flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 shrink-0" />
              You felt certain here — worth a careful review.
            </p>
          )}
          {confidence !== null && confidence <= 25 && result?.correct && (
            <p className="text-xs text-sky-400/90 mt-2 flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 shrink-0" />
              Right despite low confidence — lock it in so it's not luck.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function LessonPlayerPage() {
  const [, params] = useRoute("/courses/:id/play");
  const courseId = Number(params?.id);
  const [, _setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [showTutorChat, setShowTutorChat] = useState(false);
  const [xpBurst, setXpBurst] = useState<number | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [practicalHint, setPracticalHint] = useState("");
  const [practicalHintLoading, setPracticalHintLoading] = useState(false);

  const { data: course, isLoading: courseLoading } = useGetCourse(courseId, {
    query: {
      enabled: !!courseId,
      queryKey: getGetCourseQueryKey(courseId),
      refetchInterval: (query) => {
        const c = query.state.data as Course | undefined;
        return c?.status === "generating" ? 3000 : false;
      },
    },
  });

  const { data: progressData } = useGetCourseProgress(courseId, {
    query: {
      enabled: !!courseId,
      queryKey: getGetCourseProgressQueryKey(courseId),
    },
  });

  const c = course as Course | undefined;
  const progress = progressData as Progress | undefined;
  const steps = c?.steps ?? [];
  const currentStep = steps[currentIndex] as LessonStep | undefined;

  useEffect(() => {
    if (!steps.length) return;
    const stepParam = new URLSearchParams(window.location.search).get("step");
    if (stepParam) {
      const targetId = Number(stepParam);
      const idx = steps.findIndex((s) => s.id === targetId);
      if (idx >= 0) {
        setCurrentIndex(idx);
        return;
      }
    }
    if (progress) {
      const nextIdx = steps.findIndex(
        (s) => !progress.completedStepIds.includes(s.id),
      );
      if (nextIdx >= 0) setCurrentIndex(nextIdx);
      else setCurrentIndex(steps.length - 1);
    }
  }, [
    progress?.completedStepIds.length,
    steps.length,
    steps.map((s) => s.id).join(","),
  ]);

  useEffect(() => {
    setPracticalHint("");
    setCodeInput("");
  }, [currentStep?.id]);

  const handleAdvance = useCallback(
    async (xp = 0) => {
      if (!currentStep) return;
      if (xp > 0) setXpBurst(xp);

      try {
        await fetch(`/api/courses/${courseId}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ stepId: currentStep.id, action: "advance" }),
        });
        await queryClient.invalidateQueries({
          queryKey: getGetCourseProgressQueryKey(courseId),
        });

        if (currentIndex < steps.length - 1) {
          setCurrentIndex((i) => i + 1);
          setShowHint(false);
          setShowExplain(false);
          setCodeInput("");
        }
      } catch {
        toast({ title: "Failed to update progress", variant: "destructive" });
      }
    },
    [currentStep, courseId, currentIndex, steps.length, queryClient, toast],
  );

  async function handleHint() {
    setShowHint(true);
    try {
      await fetch(`/api/courses/${courseId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ stepId: currentStep?.id, action: "use_hint" }),
      });
    } catch {
      /* ignore */
    }
  }

  const _streamHint = useCallback(async () => {
    const response = await fetch(
      `/api/courses/${courseId}/steps/${currentStep?.id}/hint`,
      {
        method: "POST",
        credentials: "include",
      },
    );
    const reader = response.body?.getReader();
    const _decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
    }
  }, [courseId, currentStep?.id]);

  const _streamExplain = useCallback(async () => {
    const response = await fetch(
      `/api/courses/${courseId}/steps/${currentStep?.id}/explain`,
      {
        method: "POST",
        credentials: "include",
      },
    );
    const reader = response.body?.getReader();
    const _decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
    }
  }, [courseId, currentStep?.id]);

  if (courseLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!c) {
    return (
      <div className="h-screen flex items-center justify-center text-center">
        <div>
          <p className="text-muted-foreground mb-4">Course not found.</p>
          <Button asChild>
            <Link href="/courses">Back to Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (c.status === "generating") {
    return (
      <div className="h-screen flex items-center justify-center text-center">
        <div className="space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-xl font-bold">
            Your AI tutor is preparing your lesson...
          </h2>
          <p className="text-muted-foreground text-sm">
            This usually takes 10-20 seconds. Sit tight.
          </p>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (c.status === "error") {
    return (
      <div className="h-screen flex items-center justify-center text-center">
        <div>
          <p className="text-destructive mb-2 font-medium">
            Failed to generate lesson
          </p>
          <p className="text-muted-foreground text-sm mb-4">
            There was an error generating your lesson. Please try again.
          </p>
          <Button variant="outline" asChild>
            <Link href="/courses">Back to Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  const percentComplete = progress?.percentComplete ?? 0;
  const isCompleted = percentComplete === 100;
  const usePracticalLayout =
    (c.courseType === "practical" ||
      currentStep?.stepType === "code_exercise") &&
    currentStep?.codeData != null;

  const fetchPracticalHint = useCallback(async () => {
    if (!currentStep) return;
    setPracticalHintLoading(true);
    setPracticalHint("");
    try {
      const response = await fetch(
        `/api/courses/${courseId}/steps/${currentStep.id}/hint`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder
          .decode(value)
          .split("\n")
          .filter((l) => l.startsWith("data:"));
        for (const line of lines) {
          try {
            const event = JSON.parse(line.slice(5));
            if (event.content) text += event.content;
          } catch {
            /* skip */
          }
        }
      }
      setPracticalHint(text);
    } finally {
      setPracticalHintLoading(false);
    }
  }, [courseId, currentStep]);

  const typeIcon: Record<string, React.ReactNode> = {
    code_exercise: <Code2 className="h-4 w-4" />,
    question: <HelpCircle className="h-4 w-4" />,
    introduction: <Sparkles className="h-4 w-4" />,
    summary: <Zap className="h-4 w-4" />,
  };

  return (
    <div className="h-screen flex flex-col bg-[#080d14] text-foreground dark">
      {xpBurst !== null && (
        <XpBurst xp={xpBurst} onDone={() => setXpBurst(null)} />
      )}

      <header className="h-14 border-b border-border bg-[#0a0f18] flex items-center px-4 gap-4 shrink-0">
        <Link
          href={`/courses/${courseId}`}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {c.title}
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
          <Link href={`/agent?courseId=${courseId}`}>
            <Sparkles className="h-4 w-4 mr-1 text-primary" />
            Agent
          </Link>
        </Button>
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5 text-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-medium">{progress?.totalXp ?? 0} XP</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {currentIndex + 1} / {steps.length}
          </div>
        </div>
        <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </header>

      <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-4 py-2 synapse-hide-scrollbar shrink-0">
        {steps.map((s, i) => {
          const done = progress?.completedStepIds?.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => i <= currentIndex && setCurrentIndex(i)}
              disabled={i > currentIndex}
              className={`flex shrink-0 items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition-all ${
                i === currentIndex
                  ? "bg-primary/20 text-primary"
                  : done
                    ? "text-green-400"
                    : "text-muted-foreground opacity-50"
              }`}
            >
              {stepLabel(s.stepType, s.title ?? null)}
            </button>
          );
        })}
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {usePracticalLayout && currentStep?.codeData && !isCompleted ? (
          <PracticalLessonStep
            courseId={courseId}
            courseTitle={c.title}
            stepTitle={currentStep.title}
            content={currentStep.content}
            codeData={currentStep.codeData}
            xpReward={currentStep.xpReward}
            codeInput={codeInput || currentStep.codeData.starterCode}
            onCodeChange={setCodeInput}
            onAdvance={(xp) => handleAdvance(xp)}
            onRequestHint={fetchPracticalHint}
            hintText={practicalHint}
            isHintLoading={practicalHintLoading}
          />
        ) : (
          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-y-auto p-8 max-w-3xl">
              {isCompleted ? (
                <div className="text-center py-16 space-y-6">
                  <div className="h-20 w-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                    <Zap className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold">Lesson Complete!</h2>
                  <p className="text-muted-foreground">
                    You've completed this lesson. Great work!
                  </p>
                  <div className="flex justify-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {progress?.totalXp ?? 0}
                      </p>
                      <p className="text-xs text-muted-foreground">XP Earned</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">
                        {progress?.correctAnswers ?? 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Correct Answers
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-muted-foreground">
                        {progress?.hintsUsed ?? 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Hints Used
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" asChild>
                      <Link href="/library">Library</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/progress">Back to Progress</Link>
                    </Button>
                  </div>
                </div>
              ) : !currentStep ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No lesson steps yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {currentStep.stepType !== "question" && (
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-primary">
                        {typeIcon[currentStep.stepType] ?? (
                          <Info className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        {currentStep.title && (
                          <h2 className="font-semibold text-xl text-foreground">
                            {currentStep.title}
                          </h2>
                        )}
                        <p className="text-xs text-muted-foreground capitalize">
                          {currentStep.stepType.replace("_", " ")}
                        </p>
                      </div>
                      <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="h-3 w-3 text-primary" />
                        {currentStep.xpReward} XP
                      </div>
                    </div>
                  )}

                  {currentStep.stepType === "question" &&
                  currentStep.questionData ? (
                    <QuestionStep
                      step={currentStep}
                      courseId={courseId}
                      onAdvance={(xp) => {
                        setXpBurst(xp);
                        setTimeout(() => handleAdvance(0), 1500);
                      }}
                    />
                  ) : currentStep.stepType === "code_exercise" &&
                    currentStep.codeData ? (
                    <div className="space-y-4">
                      <div className="prose prose-invert prose-sm max-w-none">
                        <MarkdownContent content={currentStep.content} />
                      </div>
                      <Card className="bg-[#0a0f1a] border-border">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                          <div className="flex items-center gap-2">
                            <Code2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-mono capitalize">
                              {currentStep.codeData.language}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs"
                            onClick={() =>
                              setCodeInput(currentStep.codeData?.starterCode)
                            }
                          >
                            Reset
                          </Button>
                        </div>
                        <Textarea
                          value={codeInput || currentStep.codeData.starterCode}
                          onChange={(e) => setCodeInput(e.target.value)}
                          className="font-mono text-sm bg-transparent border-0 resize-none focus-visible:ring-0 min-h-[200px]"
                          spellCheck={false}
                        />
                      </Card>
                      {currentStep.codeData.expectedOutput && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">
                            Expected Output
                          </p>
                          <pre className="bg-black/30 border border-white/10 rounded-lg p-3 text-xs font-mono text-green-400">
                            {currentStep.codeData.expectedOutput}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <MarkdownContent content={currentStep.content} />
                  )}

                  <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                    {currentIndex > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentIndex((i) => i - 1)}
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                    )}
                    <div className="flex-1" />
                    {currentStep.stepType !== "question" && (
                      <Button
                        onClick={() => handleAdvance(currentStep.xpReward)}
                      >
                        {currentIndex < steps.length - 1 ? (
                          <>
                            <ChevronRight className="h-4 w-4 mr-1" />
                            Continue
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-1" />
                            Complete Lesson
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </main>

            <aside className="shrink-0 flex flex-col">
              <div className="border-l border-border bg-[#0a0f18] flex flex-col gap-1 p-2">
                <button
                  onClick={() => {
                    setShowHint((h) => !h);
                    setShowExplain(false);
                    setShowTutorChat(false);
                    if (!showHint) handleHint();
                  }}
                  className={`p-2.5 rounded-lg transition-colors ${showHint ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                  title="Get a hint"
                >
                  <HelpCircle className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    setShowExplain((e) => !e);
                    setShowHint(false);
                    setShowTutorChat(false);
                  }}
                  className={`p-2.5 rounded-lg transition-colors ${showExplain ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                  title="Explain this"
                >
                  <Sparkles className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    setShowTutorChat((t) => !t);
                    setShowHint(false);
                    setShowExplain(false);
                  }}
                  className={`p-2.5 rounded-lg transition-colors ${showTutorChat ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                  title="Chat with AI Tutor"
                >
                  <Bot className="h-5 w-5" />
                </button>
              </div>

              {showHint && currentStep && (
                <HintPanel
                  key={`hint-${currentStep.id}`}
                  courseId={courseId}
                  stepId={currentStep.id}
                  onClose={() => setShowHint(false)}
                />
              )}
              {showExplain && currentStep && (
                <ExplainPanel
                  key={`explain-${currentStep.id}`}
                  courseId={courseId}
                  stepId={currentStep.id}
                  onClose={() => setShowExplain(false)}
                />
              )}
              {showTutorChat && currentStep && (
                <TutorChat
                  key={`chat-${currentStep.id}`}
                  courseId={courseId}
                  stepId={currentStep.id}
                  onClose={() => setShowTutorChat(false)}
                />
              )}
            </aside>
          </div>
        )}
      </div>

      <div className="h-1 shrink-0 bg-white/5">
        <div
          className="h-full bg-primary transition-all duration-700"
          style={{ width: `${percentComplete}%` }}
        />
      </div>
    </div>
  );
}

function HintPanel({
  courseId,
  stepId,
  onClose,
}: { courseId: number; stepId: number; onClose: () => void }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const response = await fetch(
        `/api/courses/${courseId}/steps/${stepId}/hint`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder
          .decode(value)
          .split("\n")
          .filter((l) => l.startsWith("data:"));
        for (const line of lines) {
          try {
            const event = JSON.parse(line.slice(5));
            if (event.content && active) setText((t) => t + event.content);
          } catch {
            /* skip */
          }
        }
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [courseId, stepId]);

  return (
    <div
      className="border-l border-border bg-card flex flex-col"
      style={{ width: 340 }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Hint</span>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4 flex-1">
        {loading && !text && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking...
          </div>
        )}
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

function ExplainPanel({
  courseId,
  stepId,
  onClose,
}: { courseId: number; stepId: number; onClose: () => void }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const response = await fetch(
        `/api/courses/${courseId}/steps/${stepId}/explain`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder
          .decode(value)
          .split("\n")
          .filter((l) => l.startsWith("data:"));
        for (const line of lines) {
          try {
            const event = JSON.parse(line.slice(5));
            if (event.content && active) setText((t) => t + event.content);
          } catch {
            /* skip */
          }
        }
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [courseId, stepId]);

  return (
    <div
      className="border-l border-border bg-card flex flex-col"
      style={{ width: 360 }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">AI Explanation</span>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        {loading && !text && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating explanation...
          </div>
        )}
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
