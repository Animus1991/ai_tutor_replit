import { useRoute, Link, useLocation } from "wouter";
import { useGetNote, useDeleteNote, getGetNoteQueryKey, getListNotesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Clock, FileText, Hash, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function NoteDetailPage() {
  const [, params] = useRoute("/notes/:id");
  const id = params?.id ?? "";
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDelete, setShowDelete] = useState(false);

  const { data: note, isLoading } = useGetNote(Number(id), {
    query: { enabled: !!id, queryKey: getGetNoteQueryKey(Number(id)) }
  });

  const deleteNote = useDeleteNote();

  const n = note as {
    id: number; title: string; content: string; subject?: string;
    wordCount: number; createdAt: string;
  } | undefined;

  const readTime = n ? Math.ceil(n.wordCount / 200) : 0;

  async function handleDelete() {
    try {
      await deleteNote.mutateAsync({ id } as never);
      await queryClient.invalidateQueries();
      toast({ title: "Note deleted" });
      setLocation("/notes");
    } catch {
      toast({ title: "Failed to delete note", variant: "destructive" });
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 max-w-4xl">
        <div className="h-8 bg-white/5 rounded w-64" />
        <div className="h-4 bg-white/5 rounded w-40" />
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => <div key={i} className="h-4 bg-white/5 rounded" />)}
        </div>
      </div>
    );
  }

  if (!n) {
    return (
      <div className="text-center py-20">
        <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">Note not found.</p>
        <Button className="mt-4" asChild><Link href="/notes">Back to Notes</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/notes"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{n.title}</h1>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
              {n.subject && <Badge variant="secondary">{n.subject}</Badge>}
              <span className="flex items-center gap-1"><Hash className="h-3.5 w-3.5" />{n.wordCount.toLocaleString()} words</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{readTime} min read</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button asChild>
            <Link href={`/courses/new?noteId=${n.id}`}>
              <BookOpen className="h-4 w-4 mr-2" />
              Generate Lesson
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-6 md:p-8">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">{n.content}</pre>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button size="lg" asChild>
          <Link href={`/courses/new?noteId=${n.id}`}>
            <BookOpen className="h-4 w-4 mr-2" />
            Generate Interactive Lesson
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/notes">Back to Library</Link>
        </Button>
      </div>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Note?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will permanently delete the note and all associated courses.</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
