import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation, useSearch } from "@/lib/wouter-compat";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListCoursesQueryKey,
  useCreateCourse,
  useGenerateCourseSteps,
  useListNotes,
} from "@workspace/api-client-react";
import { ArrowLeft, Brain, Code2, Layers, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const COURSE_TYPES = [
  {
    id: "theoretical",
    label: "Theoretical",
    icon: Brain,
    desc: "Concepts, explanations, and knowledge checks",
  },
  {
    id: "practical",
    label: "Practical",
    icon: Code2,
    desc: "Code exercises and hands-on tasks",
  },
  {
    id: "mixed",
    label: "Mixed",
    icon: Layers,
    desc: "Best of both — theory plus practice",
  },
];

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const QUIZ_FREQ = [
  { id: "low", label: "Light", desc: "2 quizzes" },
  { id: "medium", label: "Balanced", desc: "4 quizzes" },
  { id: "high", label: "Intensive", desc: "6+ quizzes" },
];

export default function CreateCoursePage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const preselectedNoteId = params.get("noteId");

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notes } = useListNotes();
  const createCourse = useCreateCourse();
  const _generateSteps = useGenerateCourseSteps();

  const allNotes = notes as
    | Array<{ id: number; title: string; subject?: string; wordCount: number }>
    | undefined;

  const [selectedNoteId, setSelectedNoteId] = useState(preselectedNoteId || "");
  const [courseType, setCourseType] = useState("theoretical");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [quizFrequency, setQuizFrequency] = useState("medium");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (preselectedNoteId) setSelectedNoteId(preselectedNoteId);
  }, [preselectedNoteId]);

  async function handleCreate() {
    if (!selectedNoteId) {
      toast({ title: "Please select a note", variant: "destructive" });
      return;
    }
    setIsCreating(true);
    setProgress(0);
    setGenerationStatus("Creating your course...");

    try {
      const course = await createCourse.mutateAsync({
        data: {
          noteId: Number(selectedNoteId),
          courseType,
          difficulty,
          quizFrequency,
          additionalInstructions: additionalInstructions.trim() || undefined,
        } as never,
      });

      const c = course as { id: number };
      setGenerationStatus(
        "AI is preparing your lesson — this takes about 15 seconds...",
      );

      const response = await fetch(`/api/courses/${c.id}/generate-steps`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let stepsAdded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split("\n").filter((l) => l.startsWith("data:"));
        for (const line of lines) {
          try {
            const event = JSON.parse(line.slice(5));
            if (event.status === "step_added") {
              stepsAdded++;
              setProgress(Math.min(95, stepsAdded * 8));
              setGenerationStatus(`Building lesson step ${stepsAdded}...`);
            }
            if (event.status === "complete") {
              setProgress(100);
              setGenerationStatus(
                `Your lesson is ready — ${event.totalSteps} steps!`,
              );
              await queryClient.invalidateQueries({
                queryKey: getListCoursesQueryKey(),
              });
              setTimeout(() => setLocation(`/courses/${c.id}`), 1000);
            }
            if (event.error) throw new Error(event.error);
          } catch {
            /* skip malformed events */
          }
        }
      }
    } catch (err) {
      toast({
        title: "Failed to create course",
        description: String(err),
        variant: "destructive",
      });
      setIsCreating(false);
      setGenerationStatus(null);
    }
  }

  if (isCreating) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center space-y-6">
        <div className="h-20 w-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Generating Your Lesson</h2>
          <p className="text-muted-foreground">{generationStatus}</p>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Your AI tutor is studying your notes and crafting a personalized
          lesson...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/courses">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Course</h1>
          <p className="text-muted-foreground text-sm">
            Configure your AI-generated lesson
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Select Notes</Label>
        {!allNotes?.length ? (
          <Card className="border-dashed border-border bg-transparent">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-3">
                No notes uploaded yet.
              </p>
              <Button variant="outline" asChild>
                <Link href="/notes">Upload Notes First</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {allNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => setSelectedNoteId(String(note.id))}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedNoteId === String(note.id)
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{note.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {note.wordCount.toLocaleString()} words
                      {note.subject ? ` · ${note.subject}` : ""}
                    </p>
                  </div>
                  {selectedNoteId === String(note.id) && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-[10px] text-primary-foreground font-bold">
                        ✓
                      </span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label>Lesson Format</Label>
        <div className="grid grid-cols-3 gap-3">
          {COURSE_TYPES.map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              onClick={() => setCourseType(id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                courseType === id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-white/20"
              }`}
            >
              <Icon
                className={`h-5 w-5 mb-2 ${courseType === id ? "text-primary" : "text-muted-foreground"}`}
              />
              <p className="font-medium text-sm text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Difficulty Level</Label>
          <div className="space-y-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`w-full py-2.5 px-4 rounded-lg border text-sm font-medium capitalize text-left transition-all ${
                  difficulty === d
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-white/20 hover:text-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Quiz Frequency</Label>
          <div className="space-y-2">
            {QUIZ_FREQ.map(({ id, label, desc }) => (
              <button
                key={id}
                onClick={() => setQuizFrequency(id)}
                className={`w-full py-2.5 px-4 rounded-lg border text-sm text-left transition-all ${
                  quizFrequency === id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-white/20"
                }`}
              >
                <span
                  className={`font-medium ${quizFrequency === id ? "text-primary" : "text-foreground"}`}
                >
                  {label}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({desc})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          Additional Instructions{" "}
          <span className="text-muted-foreground text-xs">(optional)</span>
        </Label>
        <Textarea
          placeholder="e.g. Focus more on practical examples, use Python code snippets, assume I already know basic calculus..."
          value={additionalInstructions}
          onChange={(e) => setAdditionalInstructions(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>

      <Button
        size="lg"
        className="w-full"
        onClick={handleCreate}
        disabled={!selectedNoteId || isCreating}
      >
        <Sparkles className="h-5 w-5 mr-2" />
        Generate Interactive Lesson
      </Button>
    </div>
  );
}
