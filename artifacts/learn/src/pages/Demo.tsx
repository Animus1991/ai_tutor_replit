import { CurriculumLensToggle } from "@/components/CurriculumLensToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { BlueprintSection } from "@/components/marketing/BlueprintSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdvancedVisualTools } from "@/components/visuals/AdvancedVisualTools";
import { VisualLabSection } from "@/components/visuals/VisualLabSection";
import {
  getDemoChatChunks,
  getDemoCourses,
  getDemoExplainChunks,
  getDemoHintChunks,
  getDemoNotes,
  getDemoSteps,
} from "@/lib/demoContent";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Link } from "@/lib/wouter-compat";
import {
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code,
  FileText,
  Flame,
  Layers,
  Lightbulb,
  MessageSquare,
  Play,
  Send,
  Sparkles,
  Star,
  Target,
  Trophy,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

type Tab = "dashboard" | "notes" | "lesson" | "visuals";

function DemoBanner({ onEnterLesson }: { onEnterLesson: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2 text-sm text-primary">
        <Sparkles className="h-4 w-4 shrink-0" />
        <span className="font-medium">{t("demo.banner.mode")}</span>
        <span className="text-slate-400">— {t("demo.banner.subtitle")}</span>
      </div>
      <div className="flex items-center gap-2">
        <LanguageToggle />
        <Button
          size="sm"
          variant="ghost"
          className="text-primary hover:text-primary"
          onClick={onEnterLesson}
        >
          <Play className="h-3.5 w-3.5 mr-1" />
          {t("demo.banner.playLesson")}
        </Button>
        <Button size="sm" asChild>
          <Link href="/sign-up">{t("demo.banner.signUp")}</Link>
        </Button>
      </div>
    </div>
  );
}

function DemoDashboard({ onGoToLesson }: { onGoToLesson: () => void }) {
  const { t } = useTranslation();
  const courses = useMemo(() => getDemoCourses(t), [t]);
  const weekdays = t("demo.dashboard.weekdays").split("|");

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: Zap,
            label: t("demo.stat.xp"),
            value: t("demo.stat.xpValue"),
            color: "text-yellow-400",
          },
          {
            icon: Flame,
            label: t("demo.stat.streak"),
            value: t("demo.stat.streakValue"),
            color: "text-orange-400",
          },
          {
            icon: Target,
            label: t("demo.stat.accuracy"),
            value: t("demo.stat.accuracyValue"),
            color: "text-green-400",
          },
          {
            icon: Trophy,
            label: t("demo.stat.courses"),
            value: t("demo.stat.coursesValue"),
            color: "text-primary",
          },
        ].map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1"
          >
            <Icon className={cn("h-5 w-5", color)} />
            <div className="text-xl font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />{" "}
            {t("demo.dashboard.recentCourses")}
          </h3>
          <div className="space-y-2">
            {courses.map((c) => (
              <button
                key={c.id}
                onClick={c.id === 1 ? onGoToLesson : undefined}
                className="w-full text-left rounded-lg border border-border bg-muted/40 hover:bg-muted/70 transition-colors p-3 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">
                    {c.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 capitalize">
                    {c.type} · {c.difficulty}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs font-semibold text-primary">
                    {c.progress}%
                  </div>
                  <div className="h-1.5 w-16 bg-border rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Exam Readiness */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />{" "}
            {t("demo.dashboard.examReadiness")}
          </h3>
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              <span className="font-semibold text-primary text-sm">
                {t("demo.dashboard.readinessBadge")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("demo.dashboard.readinessBody")}
            </p>
          </div>
          <div className="space-y-2">
            {[
              { label: t("demo.dashboard.quizAccuracy"), value: 78 },
              { label: t("demo.dashboard.selfReliance"), value: 85 },
              { label: t("demo.dashboard.completionRate"), value: 92 },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-3 text-xs">
                <span className="w-40 text-muted-foreground truncate">
                  {label}
                </span>
                <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/70 rounded-full transition-all"
                    style={{ width: `${value}%` }}
                  />
                </div>
                <span className="w-8 text-right font-medium text-foreground">
                  {value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity chart placeholder */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />{" "}
          {t("demo.dashboard.weeklyActivity")}
        </h3>
        <div className="flex items-end gap-2 h-20">
          {[40, 65, 30, 80, 55, 90, 70].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-primary/70 rounded-sm"
                style={{ height: `${h}%` }}
              />
              <span className="text-[10px] text-muted-foreground">
                {weekdays[i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DemoNotes({ onGoToLesson }: { onGoToLesson: () => void }) {
  const { t } = useTranslation();
  const notes = useMemo(() => getDemoNotes(t), [t]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg text-foreground">
          {t("demo.notes.title")}
        </h2>
        <Button
          size="sm"
          variant="outline"
          className="opacity-50 cursor-not-allowed"
          title={t("demo.notes.uploadTitle")}
        >
          {t("demo.notes.upload")}
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {notes.map((n) => (
          <div
            key={n.id}
            className="rounded-xl border border-border bg-card p-5 space-y-3 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-foreground text-sm">
                  {n.title}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {n.subject} · {n.createdAt}
                </div>
              </div>
              <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                {n.wordCount.toLocaleString()} {t("demo.notes.words")}
              </span>
              <span>·</span>
              <span>
                {t("demo.notes.coursesGenerated", { count: n.courses })}
              </span>
            </div>
            <Button
              size="sm"
              variant={n.id === 1 ? "default" : "outline"}
              className="w-full"
              onClick={n.id === 1 ? onGoToLesson : undefined}
            >
              <Play className="h-3.5 w-3.5 mr-1.5" />
              {n.id === 1 ? t("demo.notes.openDemo") : t("demo.notes.generate")}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

type QuizState = "idle" | "correct" | "wrong";
type HintState = { open: boolean; text: string };

function DemoLessonPlayer({ onBack }: { onBack: () => void }) {
  const { t, language } = useTranslation();
  const demoSteps = useMemo(() => getDemoSteps(t), [t, language]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [xpBurst, setXpBurst] = useState<number | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [codeSubmitted, setCodeSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState("");
  const [loadingHint, setLoadingHint] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [explain, setExplain] = useState("");
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const step = demoSteps[currentIndex]!;
  const totalSteps = demoSteps.length;
  const completedSteps = currentIndex;

  useEffect(() => {
    setChatMessages([{ role: "ai", text: t("demo.chat.welcome") }]);
  }, [t, language]);

  useEffect(() => {
    setQuizAnswer(null);
    setQuizState("idle");
    setCodeInput("");
    setCodeSubmitted(false);
    setShowHint(false);
    setHint("");
    setShowExplain(false);
    setExplain("");
  }, [currentIndex, language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  function fireXP(amount: number) {
    setXpBurst(amount);
    setTimeout(() => setXpBurst(null), 1200);
  }

  function handleQuizAnswer(idx: number) {
    if (quizState !== "idle") return;
    setQuizAnswer(idx);
    const s = demoSteps[currentIndex];
    if (!s || s.type !== "quiz") return;
    if (idx === s.correctOption) {
      setQuizState("correct");
      fireXP(20);
    } else {
      setQuizState("wrong");
    }
  }

  function handleAdvance() {
    if (currentIndex < totalSteps - 1) {
      if (step.type === "content") fireXP(10);
      setCurrentIndex((i) => i + 1);
    }
  }

  function handlePrev() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  function canAdvance(): boolean {
    if (step.type === "quiz") return quizState === "correct";
    if (step.type === "code") return codeSubmitted;
    return true;
  }

  async function simulateStream(
    setText: (t: string) => void,
    chunks: string[],
  ) {
    let acc = "";
    for (const chunk of chunks) {
      await new Promise((r) => setTimeout(r, 40));
      acc += chunk;
      setText(acc);
    }
  }

  async function handleHint() {
    if (hint) {
      setShowHint((v) => !v);
      return;
    }
    setShowHint(true);
    setLoadingHint(true);
    const chunks = getDemoHintChunks(t, step.id);
    await simulateStream(setHint, chunks);
    setLoadingHint(false);
  }

  async function handleExplain() {
    if (explain) {
      setShowExplain((v) => !v);
      return;
    }
    setShowExplain(true);
    setLoadingExplain(true);
    const chunks = getDemoExplainChunks(t, step.id);
    await simulateStream(setExplain, chunks);
    setLoadingExplain(false);
  }

  async function handleChatSend() {
    const msg = chatInput.trim();
    if (!msg || loadingChat) return;
    setChatInput("");
    setChatMessages((m) => [...m, { role: "user", text: msg }]);
    setLoadingChat(true);

    const chunks = getDemoChatChunks(t, msg);

    let acc = "";
    setChatMessages((m) => [...m, { role: "ai", text: "" }]);
    for (const chunk of chunks) {
      await new Promise((r) => setTimeout(r, 45));
      acc += chunk;
      setChatMessages((m) => [...m.slice(0, -1), { role: "ai", text: acc }]);
    }
    setLoadingChat(false);
  }

  const isLast = currentIndex === totalSteps - 1;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Progress bar + header */}
      <div className="border-b border-border bg-card px-4 py-3 flex items-center gap-4 shrink-0">
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">
            {t("demo.lesson.courseTitle")}
          </div>
          <div className="text-xs text-muted-foreground">
            {t("demo.lesson.stepOf", {
              current: currentIndex + 1,
              total: totalSteps,
              title: step.title,
            })}
          </div>
        </div>
        {/* XP Burst */}
        <div className="relative">
          {xpBurst && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400 font-bold text-sm animate-bounce pointer-events-none">
              +{xpBurst} XP
            </div>
          )}
          <Badge
            variant="outline"
            className="text-yellow-400 border-yellow-400/40 bg-yellow-400/10"
          >
            <Zap className="h-3 w-3 mr-1" />
            {180 + completedSteps * 20} XP
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className={cn(showHint && "text-yellow-400")}
            onClick={handleHint}
          >
            <Lightbulb className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={cn(showExplain && "text-blue-400")}
            onClick={handleExplain}
          >
            <BookOpen className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={cn(showChat && "text-primary")}
            onClick={() => setShowChat((v) => !v)}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1 px-4 py-2 shrink-0 border-b border-border bg-card/50">
        {demoSteps.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < currentIndex
                ? "bg-primary"
                : i === currentIndex
                  ? "bg-primary/60"
                  : "bg-border",
            )}
          />
        ))}
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Hint panel */}
          {showHint && (
            <div className="mb-4 rounded-lg border border-yellow-400/30 bg-yellow-400/5 p-4 text-sm text-foreground">
              <div className="font-semibold text-yellow-400 mb-2 flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4" /> {t("demo.lesson.hint")}
              </div>
              {loadingHint ? (
                <div className="flex gap-1">
                  <span className="animate-bounce">·</span>
                  <span className="animate-bounce delay-100">·</span>
                  <span className="animate-bounce delay-200">·</span>
                </div>
              ) : (
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{hint}</ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Explain panel */}
          {showExplain && (
            <div className="mb-4 rounded-lg border border-blue-400/30 bg-blue-400/5 p-4 text-sm text-foreground">
              <div className="font-semibold text-blue-400 mb-2 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />{" "}
                {t("demo.lesson.deeperExplanation")}
              </div>
              {loadingExplain ? (
                <div className="flex gap-1">
                  <span className="animate-bounce">·</span>
                  <span className="animate-bounce delay-100">·</span>
                  <span className="animate-bounce delay-200">·</span>
                </div>
              ) : (
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{explain}</ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Step content */}
          <div className="max-w-2xl">
            {step.type === "content" && (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{step.content}</ReactMarkdown>
              </div>
            )}

            {step.type === "quiz" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                  <Target className="h-4 w-4" />{" "}
                  {t("demo.lesson.knowledgeCheck")}
                </div>
                <p className="text-foreground font-medium leading-relaxed">
                  {step.content}
                </p>
                <div className="space-y-2">
                  {step.options?.map((opt, i) => {
                    const isSelected = quizAnswer === i;
                    const isCorrect = i === step.correctOption;
                    let cls =
                      "border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/60";
                    if (quizState !== "idle") {
                      if (isCorrect) cls = "border-green-500 bg-green-500/10";
                      else if (isSelected) cls = "border-red-500 bg-red-500/10";
                      else cls = "border-border bg-muted/20 opacity-50";
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => handleQuizAnswer(i)}
                        className={cn(
                          "w-full text-left rounded-lg border p-3 text-sm transition-colors flex items-center gap-3",
                          cls,
                        )}
                        disabled={quizState !== "idle"}
                      >
                        <span className="h-5 w-5 rounded-full border border-current flex items-center justify-center shrink-0 text-xs font-bold">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {quizState !== "idle" && isCorrect && (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                        {quizState !== "idle" && isSelected && !isCorrect && (
                          <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {quizState === "correct" && (
                  <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-sm text-green-400 font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />{" "}
                    {t("demo.lesson.correct")}
                  </div>
                )}
                {quizState === "wrong" && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400 flex flex-col gap-1">
                    <span className="font-medium flex items-center gap-2">
                      <XCircle className="h-4 w-4" /> {t("demo.lesson.wrong")}
                    </span>
                    <span className="text-xs opacity-80">
                      {t("demo.lesson.wrongHint")}
                    </span>
                    <button
                      onClick={() => {
                        setQuizState("idle");
                        setQuizAnswer(null);
                      }}
                      className="text-xs underline mt-1 text-left hover:text-red-300"
                    >
                      {t("demo.lesson.tryAgain")}
                    </button>
                  </div>
                )}
              </div>
            )}

            {step.type === "code" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                  <Code className="h-4 w-4" /> {t("demo.lesson.codeExercise")}
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{step.content}</ReactMarkdown>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    {t("demo.lesson.writeCode")}
                  </div>
                  <textarea
                    className="w-full h-32 rounded-lg border border-border bg-muted/40 p-3 text-sm font-mono text-foreground resize-none focus:outline-none focus:border-primary/50"
                    placeholder={t("demo.lesson.codePlaceholder")}
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    disabled={codeSubmitted}
                  />
                  {!codeSubmitted ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        setCodeSubmitted(true);
                        fireXP(30);
                      }}
                      disabled={codeInput.trim().length < 10}
                    >
                      <Play className="h-3.5 w-3.5 mr-1.5" />{" "}
                      {t("demo.lesson.runSubmit")}
                    </Button>
                  ) : (
                    <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-sm text-green-400 font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />{" "}
                      {t("demo.lesson.submitted")}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3 mt-8 max-w-2xl">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> {t("demo.lesson.back")}
            </Button>
            <div className="flex-1" />
            {isLast ? (
              <Button
                onClick={onBack}
                className="bg-green-600 hover:bg-green-700"
              >
                <Trophy className="h-4 w-4 mr-1.5" />{" "}
                {t("demo.lesson.complete")}
              </Button>
            ) : (
              <Button onClick={handleAdvance} disabled={!canAdvance()}>
                {t("demo.lesson.next")}{" "}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* AI Tutor Chat sidebar */}
        {showChat && (
          <div className="w-72 border-l border-border flex flex-col bg-card shrink-0">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Brain className="h-4 w-4 text-primary" />{" "}
                {t("demo.lesson.aiTutor")}
              </span>
              <button onClick={() => setShowChat(false)}>
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
              {chatMessages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-lg p-2.5 leading-relaxed",
                    m.role === "ai"
                      ? "bg-muted/60 text-foreground"
                      : "bg-primary/20 text-primary-foreground ml-4",
                  )}
                >
                  <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-0">
                    <ReactMarkdown>{m.text || "…"}</ReactMarkdown>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-border flex gap-2">
              <input
                className="flex-1 bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                placeholder={t("demo.lesson.askPlaceholder")}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleChatSend();
                }}
              />
              <Button
                size="sm"
                onClick={handleChatSend}
                disabled={loadingChat || !chatInput.trim()}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DemoPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("dashboard");

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: t("demo.tab.dashboard"), icon: BarChart3 },
    { id: "notes", label: t("demo.tab.notes"), icon: FileText },
    { id: "lesson", label: t("demo.tab.lesson"), icon: Play },
    { id: "visuals", label: t("demo.tab.visuals"), icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <DemoBanner onEnterLesson={() => setTab("lesson")} />

      {/* Sidebar + main layout */}
      <div className="flex h-[calc(100vh-40px)]">
        {/* Sidebar */}
        <aside className="w-56 border-r border-border bg-card flex-col hidden sm:flex shrink-0">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-xs leading-none">
                LA
              </span>
            </div>
            <span className="font-semibold tracking-tight text-foreground">
              {t("demo.sidebar.brand")}
            </span>
            <Badge
              variant="outline"
              className="text-[10px] ml-auto border-primary/40 text-primary"
            >
              {t("demo.sidebar.demoBadge")}
            </Badge>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  tab === id
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-border">
            <Button className="w-full" size="sm" asChild>
              <Link href="/sign-up">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />{" "}
                {t("demo.sidebar.startFree")}
              </Link>
            </Button>
          </div>
        </aside>

        {/* Mobile tab bar */}
        <div className="fixed bottom-0 left-0 right-0 sm:hidden border-t border-border bg-card flex z-50">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex-1 flex flex-col items-center py-2 text-[10px] gap-0.5 transition-colors",
                tab === id ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-16 sm:pb-0">
          {tab === "dashboard" && (
            <DemoDashboard onGoToLesson={() => setTab("lesson")} />
          )}
          {tab === "notes" && (
            <DemoNotes onGoToLesson={() => setTab("lesson")} />
          )}
          {tab === "lesson" && (
            <DemoLessonPlayer onBack={() => setTab("dashboard")} />
          )}
          {tab === "visuals" && (
            <div className="space-y-8 p-4 sm:p-6">
              <div className="flex justify-center">
                <CurriculumLensToggle />
              </div>
              <VisualLabSection />
              <AdvancedVisualTools />
              <BlueprintSection />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
