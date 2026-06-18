/**
 * Onboarding wizard — five steps:
 *   1) Welcome
 *   2) Role  (university / highschool / self-learner / tutor / company)
 *   3) Goals (multi-select)
 *   4) Quick Preferences (daily study minutes + optional exam date)
 *   5) Complete
 *
 * Choices are persisted to:
 *  - localStorage (`synapse.onboarding.v1`) for resume + analytics.
 *  - Backend profile (`dailyStudyMinutes`, `examDate`) via the existing
 *    `useUpdateProfile()` mutation. Role / goals are currently local-only
 *    (the backend schema does not yet store them — TODO: extend
 *    `learningProfilesTable`).
 */

import { LanguageToggle } from "@/components/LanguageToggle";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { useUpdateProfile } from "@workspace/api-client-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Sparkles,
  Target,
  Upload,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

const STEPS = ["welcome", "role", "goals", "preferences", "complete"] as const;
type Step = (typeof STEPS)[number];

const ONBOARDING_STORAGE_KEY = "synapse.onboarding.v1";

interface PersistedState {
  role: string | null;
  goals: string[];
  dailyTime: number;
  examDate: string;
}

function loadState(): PersistedState {
  if (typeof window === "undefined") {
    return { role: null, goals: [], dailyTime: 30, examDate: "" };
  }
  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PersistedState;
  } catch {
    // ignore corrupted storage
  }
  return { role: null, goals: [], dailyTime: 30, examDate: "" };
}

function saveState(state: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const updateProfile = useUpdateProfile();

  const [step, setStep] = useState<Step>("welcome");
  const initial = loadState();
  const [role, setRole] = useState<string | null>(initial.role);
  const [goals, setGoals] = useState<string[]>(initial.goals);
  const [dailyTime, setDailyTime] = useState<number>(initial.dailyTime);
  const [examDate, setExamDate] = useState<string>(initial.examDate);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    saveState({ role, goals, dailyTime, examDate });
  }, [role, goals, dailyTime, examDate]);

  const idx = STEPS.indexOf(step);
  const progress = ((idx + 1) / STEPS.length) * 100;

  const goNext = () => {
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]!);
  };
  const goPrev = () => {
    if (idx > 0) setStep(STEPS[idx - 1]!);
  };

  const toggleGoal = (id: string) =>
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );

  const finish = async (uploadFirst: boolean) => {
    setSubmitting(true);
    try {
      await updateProfile.mutateAsync({
        data: {
          dailyStudyMinutes: dailyTime,
          examDate: examDate ? new Date(examDate).toISOString() : null,
        } as never,
      });
    } catch {
      // profile may not exist for very-fresh accounts — silently swallow
      // (local state is still kept; user can retry via Settings).
    } finally {
      setSubmitting(false);
    }
    navigate({ to: uploadFirst ? "/library" : "/progress" });
  };

  const ROLES = [
    {
      id: "university",
      Icon: GraduationCap,
      labelKey: "onboard.role.university",
      descKey: "onboard.role.university.desc",
    },
    {
      id: "highschool",
      Icon: BookOpen,
      labelKey: "onboard.role.highschool",
      descKey: "onboard.role.highschool.desc",
    },
    {
      id: "selflearner",
      Icon: Sparkles,
      labelKey: "onboard.role.selflearner",
      descKey: "onboard.role.selflearner.desc",
    },
    {
      id: "tutor",
      Icon: Users,
      labelKey: "onboard.role.tutor",
      descKey: "onboard.role.tutor.desc",
    },
    {
      id: "company",
      Icon: Building2,
      labelKey: "onboard.role.company",
      descKey: "onboard.role.company.desc",
    },
  ];

  const GOALS = [
    { id: "exam", labelKey: "onboard.goals.exam", icon: "🎯" },
    { id: "understand", labelKey: "onboard.goals.understand", icon: "🧠" },
    { id: "review", labelKey: "onboard.goals.review", icon: "⚡" },
    { id: "practice", labelKey: "onboard.goals.practice", icon: "💪" },
    { id: "organize", labelKey: "onboard.goals.organize", icon: "📚" },
    { id: "explore", labelKey: "onboard.goals.explore", icon: "🔍" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="absolute right-4 top-4 z-10">
        <LanguageToggle />
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/[0.04]">
        <div
          className="h-1 bg-synapse-brand-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {step === "welcome" && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-synapse-brand-500 to-synapse-accent-teal">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold">
                  {t("onboard.welcome.title")}
                </h1>
                <p className="mx-auto max-w-md leading-relaxed text-muted-foreground">
                  {t("onboard.welcome.subtitle")}
                </p>
                <button
                  onClick={goNext}
                  className="synapse-glow-brand inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-synapse-brand-600 to-synapse-brand-500 px-8 py-3 font-medium text-white transition-all hover:from-synapse-brand-500 hover:to-synapse-brand-400"
                >
                  {t("onboard.welcome.cta")} <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {step === "role" && (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold">
                    {t("onboard.role.title")}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("onboard.role.subtitle")}
                  </p>
                </div>
                <div className="space-y-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={cn(
                        "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all",
                        role === r.id
                          ? "border-synapse-brand-500/50 bg-synapse-brand-500/10"
                          : "border-border hover:border-synapse-brand-500/30",
                      )}
                    >
                      <r.Icon
                        className={cn(
                          "h-6 w-6",
                          role === r.id
                            ? "text-synapse-brand-400"
                            : "text-muted-foreground",
                        )}
                      />
                      <div>
                        <p className="text-sm font-medium">{t(r.labelKey)}</p>
                        <p className="text-xs text-muted-foreground">
                          {t(r.descKey)}
                        </p>
                      </div>
                      {role === r.id && (
                        <CheckCircle2 className="ml-auto h-5 w-5 text-synapse-brand-400" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === "goals" && (
              <motion.div
                key="goals"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold">
                    {t("onboard.goals.title")}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("onboard.goals.subtitle")}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => toggleGoal(g.id)}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-all",
                        goals.includes(g.id)
                          ? "border-synapse-brand-500/50 bg-synapse-brand-500/10"
                          : "border-border hover:border-synapse-brand-500/30",
                      )}
                    >
                      <span className="mb-2 block text-xl">{g.icon}</span>
                      <p className="text-sm font-medium">{t(g.labelKey)}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === "preferences" && (
              <motion.div
                key="prefs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold">
                    {t("onboard.prefs.title")}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("onboard.prefs.subtitle")}
                  </p>
                </div>
                <div className="space-y-5">
                  <div className="rounded-xl border border-border p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {t("onboard.prefs.time")}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {[15, 30, 45, 60, 90].map((m) => (
                        <button
                          key={m}
                          onClick={() => setDailyTime(m)}
                          className={cn(
                            "flex-1 rounded-lg py-2 text-xs font-medium transition-all",
                            dailyTime === m
                              ? "border border-synapse-brand-500/30 bg-synapse-brand-600/20 text-synapse-brand-300"
                              : "border border-border text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {m}m
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {t("onboard.prefs.exam")}
                      </span>
                    </div>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="rounded-xl border border-border bg-background/80 px-4 py-2 text-sm text-foreground focus:border-synapse-brand-500/50 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-start gap-2 rounded-xl bg-white/[0.04] p-3 text-xs text-muted-foreground">
                    <Brain className="mt-0.5 h-4 w-4 shrink-0 text-synapse-brand-400" />
                    The adaptive engine will also learn from your behavior —
                    response time, accuracy, confidence, error patterns — to
                    optimize your path automatically.
                  </div>
                </div>
              </motion.div>
            )}

            {step === "complete" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-synapse-brand-500 to-synapse-accent-teal">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold">
                  {t("onboard.complete.title")}
                </h2>
                <p className="mx-auto max-w-md leading-relaxed text-muted-foreground">
                  {t("onboard.complete.subtitle")}
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => finish(true)}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-synapse-brand-600 to-synapse-brand-500 px-8 py-3 font-medium text-white transition-all hover:from-synapse-brand-500 hover:to-synapse-brand-400 disabled:opacity-60"
                  >
                    <Upload className="h-4 w-4" /> {t("onboard.complete.cta")}
                  </button>
                  <button
                    onClick={() => finish(false)}
                    disabled={submitting}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t("onboard.complete.skip")}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <div className="mx-auto flex w-full max-w-lg items-center justify-between p-4">
        {idx > 0 && step !== "complete" ? (
          <button
            onClick={goPrev}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {t("onboard.back")}
          </button>
        ) : (
          <div />
        )}
        {step !== "complete" && step !== "welcome" && (
          <button
            onClick={goNext}
            className="flex items-center gap-2 rounded-xl bg-synapse-brand-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-synapse-brand-500"
          >
            {t("onboard.continue")} <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
