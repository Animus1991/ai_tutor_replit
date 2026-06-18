import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  DEFAULT_EXTRA_PREFS,
  type ExtraPreferences,
  loadExtraPrefs,
  saveExtraPrefs,
} from "@/lib/extraPreferences";
import { initLocaleFromProfile, setLocale, t } from "@/lib/i18n";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetProfileQueryKey,
  useGetProfile,
  useUpdateProfile,
} from "@workspace/api-client-react";
import { Settings as SettingsIcon } from "lucide-react";
import { useEffect, useState } from "react";

const AGENT_MODES = [
  "socratic",
  "direct",
  "beginner",
  "exam_coach",
  "deep_theory",
  "practical",
  "error_diagnosis",
  "feynman",
  "math",
  "memory_coach",
] as const;

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: profile, isLoading } = useGetProfile();
  const updateProfile = useUpdateProfile();

  const p = profile as
    | {
        quizFrequencyPreference?: string;
        learningPacePreference?: string;
        preferredCourseType?: string;
        preferredDifficulty?: string;
        showExplanationsAfterCorrect?: boolean;
        enableHints?: boolean;
        examDate?: string | null;
        dailyStudyMinutes?: number;
        preferredLanguage?: string;
        agentMode?: string;
        strictSourceMode?: boolean;
        socraticMode?: boolean;
      }
    | undefined;

  const [quizFreq, setQuizFreq] = useState("adaptive");
  const [pace, setPace] = useState("adaptive");
  const [courseType, setCourseType] = useState("adaptive");
  const [difficulty, setDifficulty] = useState("adaptive");
  const [showExplanations, setShowExplanations] = useState(true);
  const [enableHints, setEnableHints] = useState(true);
  const [examDate, setExamDate] = useState("");
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [language, setLanguage] = useState("en");
  const [agentMode, setAgentMode] = useState("socratic");
  const [strictSource, setStrictSource] = useState(true);
  const [socratic, setSocratic] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Synapse extra (localStorage-only) UI preferences mirroring Option A.
  const [extra, setExtra] = useState<ExtraPreferences>(DEFAULT_EXTRA_PREFS);

  useEffect(() => {
    setExtra(loadExtraPrefs());
  }, []);

  useEffect(() => {
    if (!p) return;
    setQuizFreq(p.quizFrequencyPreference ?? "adaptive");
    setPace(p.learningPacePreference ?? "adaptive");
    setCourseType(p.preferredCourseType ?? "adaptive");
    setDifficulty(p.preferredDifficulty ?? "adaptive");
    setShowExplanations(p.showExplanationsAfterCorrect ?? true);
    setEnableHints(p.enableHints ?? true);
    setExamDate(p.examDate ? p.examDate.slice(0, 10) : "");
    setDailyMinutes(p.dailyStudyMinutes ?? 30);
    setLanguage(p.preferredLanguage ?? "en");
    setAgentMode(p.agentMode ?? "socratic");
    setStrictSource(p.strictSourceMode ?? true);
    setSocratic(p.socraticMode ?? true);
    initLocaleFromProfile(p.preferredLanguage);
  }, [p]);

  function patchExtra<K extends keyof ExtraPreferences>(
    key: K,
    value: ExtraPreferences[K],
  ) {
    setExtra((prev) => {
      const next = { ...prev, [key]: value };
      saveExtraPrefs(next);
      return next;
    });
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      saveExtraPrefs(extra);
      await updateProfile.mutateAsync({
        data: {
          quizFrequencyPreference: quizFreq,
          learningPacePreference: pace,
          preferredCourseType: courseType,
          preferredDifficulty: difficulty,
          showExplanationsAfterCorrect: showExplanations,
          enableHints,
          examDate: examDate ? new Date(examDate).toISOString() : null,
          dailyStudyMinutes: dailyMinutes,
          preferredLanguage: language,
          agentMode,
          strictSourceMode: strictSource,
          socraticMode: socratic,
        } as never,
      });
      setLocale(language as "en" | "el");
      await queryClient.invalidateQueries({
        queryKey: getGetProfileQueryKey(),
      });
      toast({ title: t("settings.save") });
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading)
    return <div className="h-40 bg-white/5 rounded-xl animate-pulse" />;

  const SegmentedRow = <T extends string>({
    label,
    value,
    onChange,
    options,
  }: {
    label: string;
    value: T;
    onChange: (v: T) => void;
    options: { value: T; label: string }[];
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              value === o.value
                ? "border-synapse-brand-500/40 bg-synapse-brand-600/20 text-synapse-brand-200"
                : "border-border text-muted-foreground hover:border-synapse-brand-500/30 hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-8 w-8 text-primary" />
          {t("settings.title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("settings.subtitle")}</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">
            {t("settings.goals.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("settings.examDate")}</Label>
            <Input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("settings.dailyMinutes")}</Label>
            <Input
              type="number"
              min={10}
              max={240}
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">
            {t("settings.teaching.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <SegmentedRow
            label={t("settings.teaching.style")}
            value={extra.teachingStyle}
            onChange={(v) => patchExtra("teachingStyle", v)}
            options={[
              {
                value: "socratic",
                label: t("settings.teaching.style.socratic"),
              },
              { value: "direct", label: t("settings.teaching.style.direct") },
              { value: "mixed", label: t("settings.teaching.style.mixed") },
            ]}
          />
          <SegmentedRow
            label={t("settings.teaching.depth")}
            value={extra.explanationDepth}
            onChange={(v) => patchExtra("explanationDepth", v)}
            options={[
              {
                value: "beginner",
                label: t("settings.teaching.depth.beginner"),
              },
              {
                value: "intermediate",
                label: t("settings.teaching.depth.intermediate"),
              },
              {
                value: "advanced",
                label: t("settings.teaching.depth.advanced"),
              },
              { value: "expert", label: t("settings.teaching.depth.expert") },
            ]}
          />
          <SegmentedRow
            label={t("settings.teaching.feedback")}
            value={extra.feedbackTone}
            onChange={(v) => patchExtra("feedbackTone", v)}
            options={[
              {
                value: "gentle",
                label: t("settings.teaching.feedback.gentle"),
              },
              {
                value: "balanced",
                label: t("settings.teaching.feedback.balanced"),
              },
              {
                value: "strict",
                label: t("settings.teaching.feedback.strict"),
              },
            ]}
          />
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">
            {t("settings.content.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t("settings.content.theory_practice")}</Label>
              <span className="text-xs text-muted-foreground">
                {extra.theoryPracticeBalance}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={extra.theoryPracticeBalance}
              onChange={(e) =>
                patchExtra("theoryPracticeBalance", Number(e.target.value))
              }
              className="w-full accent-synapse-brand-500"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{t("settings.content.theory")}</span>
              <span>{t("settings.content.practice")}</span>
            </div>
          </div>
          <SegmentedRow
            label={t("settings.content.questions")}
            value={extra.questionFrequency}
            onChange={(v) => patchExtra("questionFrequency", v)}
            options={[
              {
                value: "minimal",
                label: t("settings.content.questions.minimal"),
              },
              {
                value: "moderate",
                label: t("settings.content.questions.moderate"),
              },
              {
                value: "frequent",
                label: t("settings.content.questions.frequent"),
              },
            ]}
          />
          <SegmentedRow
            label={t("settings.content.examples")}
            value={extra.exampleDensity}
            onChange={(v) => patchExtra("exampleDensity", v)}
            options={[
              { value: "fewer", label: t("settings.content.examples.fewer") },
              {
                value: "moderate",
                label: t("settings.content.examples.moderate"),
              },
              { value: "many", label: t("settings.content.examples.many") },
            ]}
          />
          <SegmentedRow
            label={t("settings.content.diagrams")}
            value={extra.diagramFrequency}
            onChange={(v) => patchExtra("diagramFrequency", v)}
            options={[
              {
                value: "minimal",
                label: t("settings.content.diagrams.minimal"),
              },
              {
                value: "moderate",
                label: t("settings.content.diagrams.moderate"),
              },
              { value: "rich", label: t("settings.content.diagrams.rich") },
            ]}
          />
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">
            {t("settings.pacing.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <SegmentedRow
            label={t("settings.pacing.pace")}
            value={extra.pace}
            onChange={(v) => patchExtra("pace", v)}
            options={[
              { value: "slow", label: t("settings.pacing.pace.slow") },
              { value: "moderate", label: t("settings.pacing.pace.moderate") },
              { value: "fast", label: t("settings.pacing.pace.fast") },
            ]}
          />
          <SegmentedRow
            label={t("settings.pacing.challenge")}
            value={extra.challenge}
            onChange={(v) => patchExtra("challenge", v)}
            options={[
              { value: "low", label: t("settings.pacing.challenge.low") },
              {
                value: "balanced",
                label: t("settings.pacing.challenge.balanced"),
              },
              { value: "high", label: t("settings.pacing.challenge.high") },
            ]}
          />
          <SegmentedRow
            label={t("settings.pacing.lesson")}
            value={extra.lessonLength}
            onChange={(v) => patchExtra("lessonLength", v)}
            options={[
              { value: "short", label: t("settings.pacing.lesson.short") },
              { value: "medium", label: t("settings.pacing.lesson.medium") },
              { value: "long", label: t("settings.pacing.lesson.long") },
            ]}
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t("settings.pacing.mastery")}</Label>
              <span className="text-xs text-muted-foreground">
                {extra.masteryThreshold}%
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={100}
              step={5}
              value={extra.masteryThreshold}
              onChange={(e) =>
                patchExtra("masteryThreshold", Number(e.target.value))
              }
              className="w-full accent-synapse-brand-500"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">
            {t("settings.source.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <SegmentedRow
            label={t("settings.source.mode")}
            value={extra.sourceMode}
            onChange={(v) => patchExtra("sourceMode", v)}
            options={[
              { value: "strict", label: t("settings.source.mode.strict") },
              { value: "enriched", label: t("settings.source.mode.enriched") },
              {
                value: "notes_only",
                label: t("settings.source.mode.notes_only"),
              },
            ]}
          />
          <div className="flex items-center justify-between">
            <Label>{t("settings.strictSource")}</Label>
            <Switch checked={strictSource} onCheckedChange={setStrictSource} />
          </div>
          <div className="flex items-center justify-between">
            <Label>{t("settings.socratic")}</Label>
            <Switch checked={socratic} onCheckedChange={setSocratic} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">
            Agent &amp; {t("settings.interface.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("settings.interface.language")}</Label>
            <Select
              value={language}
              onValueChange={(v) => {
                setLanguage(v);
                setLocale(v as "en" | "el");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">
                  {t("settings.interface.language.en")}
                </SelectItem>
                <SelectItem value="el">
                  {t("settings.interface.language.el")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("settings.agentMode")}</Label>
            <Select value={agentMode} onValueChange={setAgentMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AGENT_MODES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {t(`agent.modes.${m}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <SegmentedRow
            label={t("settings.interface.theme")}
            value={extra.theme}
            onChange={(v) => patchExtra("theme", v)}
            options={[
              { value: "dark", label: t("settings.interface.theme.dark") },
              { value: "light", label: t("settings.interface.theme.light") },
              { value: "system", label: t("settings.interface.theme.system") },
            ]}
          />
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Adaptive Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              label: "Quiz frequency",
              value: quizFreq,
              set: setQuizFreq,
              options: ["low", "medium", "high", "adaptive"],
            },
            {
              label: "Learning pace",
              value: pace,
              set: setPace,
              options: ["slow", "normal", "fast", "adaptive"],
            },
            {
              label: "Course type",
              value: courseType,
              set: setCourseType,
              options: ["theoretical", "practical", "mixed", "adaptive"],
            },
            {
              label: "Difficulty",
              value: difficulty,
              set: setDifficulty,
              options: ["beginner", "intermediate", "advanced", "adaptive"],
            },
          ].map(({ label, value, set, options }) => (
            <div key={label} className="space-y-1.5">
              <Label>{label}</Label>
              <Select value={value} onValueChange={set}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <Label>Show explanations after correct answers</Label>
            <Switch
              checked={showExplanations}
              onCheckedChange={setShowExplanations}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Enable hints</Label>
            <Switch checked={enableHints} onCheckedChange={setEnableHints} />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full sm:w-auto"
      >
        {isSaving ? t("common.loading") : t("settings.save")}
      </Button>
    </div>
  );
}
