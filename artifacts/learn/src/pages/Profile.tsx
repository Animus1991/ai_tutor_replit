import { useState } from "react";
import { useGetProfile, useUpdateProfile, useGetLearningStyleInsights, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Brain, Flame, Star, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: profile, isLoading } = useGetProfile();
  const { data: insights } = useGetLearningStyleInsights();
  const updateProfile = useUpdateProfile();

  const p = profile as {
    totalXp?: number; currentStreak?: number; longestStreak?: number; completedCourses?: number;
    quizFrequencyPreference?: string; learningPacePreference?: string; preferredCourseType?: string;
    preferredDifficulty?: string; showExplanationsAfterCorrect?: boolean; enableHints?: boolean;
    aiInferredStyle?: string; aiStyleConfidence?: number;
  } | undefined;

  const ins = insights as {
    inferredStyle?: string; confidence?: number; strengths?: string[]; recommendations?: string[];
    dataPointsCollected?: number; nextInsightAt?: number;
  } | undefined;

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
        <p className="text-muted-foreground mt-1">Your stats, learning style, and adaptive preferences</p>
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
            <Brain className="h-5 w-5 text-primary" />
            AI-Inferred Learning Style
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ins?.inferredStyle ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold capitalize text-lg">{ins.inferredStyle.replace(/-/g, " ")}</p>
                  <p className="text-sm text-muted-foreground">{ins.dataPointsCollected} data points collected</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{Math.round((ins.confidence ?? 0) * 100)}%</p>
                  <p className="text-xs text-muted-foreground">confidence</p>
                </div>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.round((ins.confidence ?? 0) * 100)}%` }}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                {ins.strengths && ins.strengths.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-foreground">Strengths</p>
                    {ins.strengths.map((s, i) => (
                      <p key={i} className="text-sm text-muted-foreground flex items-start gap-1.5 mb-1.5">
                        <span className="text-green-400 mt-0.5">›</span> {s}
                      </p>
                    ))}
                  </div>
                )}
                {ins.recommendations && ins.recommendations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-foreground">Recommendations</p>
                    {ins.recommendations.map((r, i) => (
                      <p key={i} className="text-sm text-muted-foreground flex items-start gap-1.5 mb-1.5">
                        <span className="text-primary mt-0.5">›</span> {r}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                Complete {ins?.nextInsightAt ?? 5} more lessons to unlock your personalized learning style insights.
              </p>
              <p className="text-xs text-muted-foreground mt-1">The AI studies your quiz accuracy, hint usage, and engagement patterns.</p>
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
