import { useState } from "react";
import { useGetProfile, useUpdateProfile, useGetLearnerModel, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Brain, Flame, Star, Target, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

function barColor(v: number) {
  return v >= 70 ? "bg-green-500" : v >= 40 ? "bg-amber-500" : "bg-red-500";
}

const MASTERY_META: Record<string, { label: string; cls: string }> = {
  strong: { label: "Strong mastery", cls: "border-green-500/30 text-green-400" },
  proficient: { label: "Proficient", cls: "border-amber-500/30 text-amber-400" },
  developing: { label: "Developing", cls: "border-sky-500/30 text-sky-400" },
};

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: profile, isLoading } = useGetProfile();
  const { data: model } = useGetLearnerModel();
  const updateProfile = useUpdateProfile();

  const p = profile as {
    totalXp?: number; currentStreak?: number; longestStreak?: number; completedCourses?: number;
    quizFrequencyPreference?: string; learningPacePreference?: string; preferredCourseType?: string;
    preferredDifficulty?: string; showExplanationsAfterCorrect?: boolean; enableHints?: boolean;
  } | undefined;

  const m = model as {
    examReadiness?: number | null; masteryLevel?: string | null; confidence?: number;
    accuracy?: number; selfReliance?: number;
    signals?: Array<{ label: string; score: number; detail: string }>;
    strengths?: string[]; focusAreas?: string[];
    dataPointsCollected?: number; nextInsightAt?: number;
  } | undefined;

  const mMeta = MASTERY_META[m?.masteryLevel ?? "developing"] ?? MASTERY_META.developing;

  const [quizFreq, setQuizFreq] = useState(p?.quizFrequencyPreference || "adaptive");
  const [pace, setPace] = useState(p?.learningPacePreference || "adaptive");
  const [courseType, setCourseType] = useState(p?.preferredCourseType || "adaptive");
  const [difficulty, setDifficulty] = useState(p?.preferredDifficulty || "adaptive");
  const [showExplanations, setShowExplanations] = useState(p?.showExplanationsAfterCorrect ?? true);
  const [enableHints, setEnableHints] = useState(p?.enableHints ?? true);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await updateProfile.mutateAsync({
        data: {
          quizFrequencyPreference: quizFreq,
          learningPacePreference: pace,
          preferredCourseType: courseType,
          preferredDifficulty: difficulty,
          showExplanationsAfterCorrect: showExplanations,
          enableHints,
        } as never,
      });
      await queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
      toast({ title: "Preferences saved" });
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 max-w-3xl">
        <div className="h-8 bg-white/5 rounded w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}
        </div>
        <div className="h-64 bg-white/5 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Learning Profile</h1>
        <p className="text-muted-foreground mt-1">Your mastery, exam readiness, and adaptive preferences</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Zap, label: "Total XP", value: (p?.totalXp ?? 0).toLocaleString(), color: "bg-primary/10 text-primary" },
          { icon: Flame, label: "Day Streak", value: p?.currentStreak ?? 0, color: "bg-orange-500/10 text-orange-400" },
          { icon: Star, label: "Best Streak", value: p?.longestStreak ?? 0, color: "bg-yellow-500/10 text-yellow-400" },
          { icon: Brain, label: "Completed", value: p?.completedCourses ?? 0, color: "bg-cyan-500/10 text-cyan-400" },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${color.split(" ")[0]}`}>
                <Icon className={`h-5 w-5 ${color.split(" ")[1]}`} />
              </div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Mastery & Exam Readiness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {m?.examReadiness != null ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-4xl font-bold text-foreground">{m.examReadiness}%</p>
                  <p className="text-sm text-muted-foreground">exam readiness · {m.dataPointsCollected} data points</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={mMeta.cls}>{mMeta.label}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">{Math.round((m.confidence ?? 0) * 100)}% confidence</p>
                </div>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor(m.examReadiness)}`}
                  style={{ width: `${m.examReadiness}%` }}
                />
              </div>

              {m.signals && m.signals.length > 0 && (
                <div className="space-y-3 pt-1">
                  {m.signals.map((s, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm text-foreground">{s.label}</span>
                        <span className="text-xs text-muted-foreground">{s.score}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${barColor(s.score)}`} style={{ width: `${s.score}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{s.detail}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 pt-3 border-t border-border">
                {m.strengths && m.strengths.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-foreground">Strengths</p>
                    {m.strengths.map((s, i) => (
                      <p key={i} className="text-sm text-muted-foreground flex items-start gap-1.5 mb-1.5">
                        <span className="text-green-400 mt-0.5">›</span> {s}
                      </p>
                    ))}
                  </div>
                )}
                {m.focusAreas && m.focusAreas.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-foreground">Focus before the exam</p>
                    {m.focusAreas.map((r, i) => (
                      <p key={i} className="text-sm text-muted-foreground flex items-start gap-1.5 mb-1.5">
                        <span className="text-amber-400 mt-0.5">›</span> {r}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                Answer {m?.nextInsightAt ?? 5} more graded questions to unlock your exam-readiness score.
              </p>
              <p className="text-xs text-muted-foreground mt-1">Built from real performance — accuracy, hint reliance and practice volume. Not a personality quiz about how you learn.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle>Adaptive Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Quiz Frequency</Label>
              <Select value={quizFreq} onValueChange={setQuizFreq}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adaptive">Let AI decide</SelectItem>
                  <SelectItem value="low">Light (fewer quizzes)</SelectItem>
                  <SelectItem value="medium">Balanced</SelectItem>
                  <SelectItem value="high">Intensive (more quizzes)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Learning Pace</Label>
              <Select value={pace} onValueChange={setPace}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adaptive">Let AI decide</SelectItem>
                  <SelectItem value="relaxed">Relaxed (more detail)</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="fast">Fast (concise steps)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Preferred Course Type</Label>
              <Select value={courseType} onValueChange={setCourseType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adaptive">Let AI decide</SelectItem>
                  <SelectItem value="theoretical">Theoretical</SelectItem>
                  <SelectItem value="practical">Practical</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Default Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adaptive">Let AI decide</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <Label>Show explanations after correct answers</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Reinforces understanding even when you get it right</p>
              </div>
              <Switch checked={showExplanations} onCheckedChange={setShowExplanations} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable hints</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Get gentle nudges when you're stuck</p>
              </div>
              <Switch checked={enableHints} onCheckedChange={setEnableHints} />
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
