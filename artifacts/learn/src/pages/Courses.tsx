import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "@/lib/wouter-compat";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListCoursesQueryKey,
  useDeleteCourse,
  useListCourses,
} from "@workspace/api-client-react";
import { BookOpen, Clock, Plus, Trash2, Zap } from "lucide-react";
import { useState } from "react";

function difficultyColor(d: string) {
  if (d === "beginner") return "text-green-400";
  if (d === "advanced") return "text-red-400";
  return "text-yellow-400";
}

function statusVariant(
  s: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (s === "ready") return "default";
  if (s === "generating") return "secondary";
  if (s === "error") return "destructive";
  return "outline";
}

export default function CoursesPage({
  embedded = false,
}: { embedded?: boolean }) {
  const { data: courses, isLoading } = useListCourses();
  const deleteCourse = useDeleteCourse();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");

  const allCourses = courses as
    | Array<{
        id: number;
        title: string;
        description: string;
        status: string;
        difficulty: string;
        courseType: string;
        totalSteps: number;
        estimatedMinutes: number;
        quizFrequency: string;
        createdAt: string;
      }>
    | undefined;

  const filtered = allCourses?.filter((c) => {
    if (filter === "all") return true;
    if (filter === "ready") return c.status === "ready";
    if (filter === "generating") return c.status === "generating";
    if (filter === "theoretical") return c.courseType === "theoretical";
    if (filter === "practical") return c.courseType === "practical";
    return true;
  });

  async function handleDelete(id: number) {
    try {
      await deleteCourse.mutateAsync({ id: String(id) } as never);
      await queryClient.invalidateQueries({
        queryKey: getListCoursesQueryKey(),
      });
      setDeleteId(null);
      toast({ title: "Course deleted" });
    } catch {
      toast({ title: "Failed to delete course", variant: "destructive" });
    }
  }

  return (
    <div className={embedded ? "space-y-6" : "space-y-8"}>
      {!embedded ? (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Courses</h1>
            <p className="text-muted-foreground mt-1">
              Your AI-generated interactive lessons
            </p>
          </div>
          <Button asChild>
            <Link href="/courses/new">
              <Plus className="h-4 w-4 mr-2" />
              New Course
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/courses/new">
              <Plus className="h-4 w-4 mr-2" />
              New Course
            </Link>
          </Button>
        </div>
      )}

      {!isLoading && allCourses && allCourses.length > 0 && (
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="generating">Generating</SelectItem>
              <SelectItem value="theoretical">Theoretical</SelectItem>
              <SelectItem value="practical">Practical</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {filtered?.length} course{filtered?.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-52 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !allCourses?.length ? (
        <Card className="border-dashed border-border bg-transparent">
          <CardContent className="p-20 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold mb-3">No courses yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first AI-generated lesson from your uploaded notes.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" asChild>
                <Link href="/notes">Upload Notes First</Link>
              </Button>
              <Button asChild>
                <Link href="/courses/new">Create Course</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered?.map((course) => (
            <Card
              key={course.id}
              className="bg-card border-border hover:border-primary/30 transition-colors group relative"
            >
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-start gap-2 mb-2">
                  <Link
                    href={`/courses/${course.id}`}
                    className="flex-1 min-w-0"
                  >
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {course.title}
                    </h3>
                  </Link>
                  <button
                    onClick={() => setDeleteId(course.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 rounded shrink-0 mt-0.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {course.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {course.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5 mb-4">
                  <Badge
                    variant={statusVariant(course.status)}
                    className="text-xs capitalize"
                  >
                    {course.status === "generating" && (
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
                    )}
                    {course.status}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs capitalize ${difficultyColor(course.difficulty)}`}
                  >
                    {course.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {course.courseType}
                  </Badge>
                </div>

                <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {course.estimatedMinutes}min
                  </span>
                  {course.totalSteps > 0 && (
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {course.totalSteps} steps
                    </span>
                  )}
                  <Link
                    href={`/courses/${course.id}/play`}
                    className="text-primary hover:underline font-medium"
                  >
                    {course.status === "ready" ? "Start →" : "View →"}
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Course?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete the course and all lesson progress.
            This cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
