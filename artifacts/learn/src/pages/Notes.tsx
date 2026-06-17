import { useState } from "react";
import { Link } from "wouter";
import { useListNotes, useCreateNote, useDeleteNote, getListNotesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, FileText, Plus, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotesPage() {
  const { data: notes, isLoading } = useListNotes();
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showDialog, setShowDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allNotes = notes as Array<{
    id: number; title: string; content: string; subject?: string;
    wordCount: number; createdAt: string;
  }> | undefined;

  async function handleCreate() {
    if (!title.trim() || !content.trim()) {
      toast({ title: "Missing fields", description: "Title and content are required.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await createNote.mutateAsync({ data: { title: title.trim(), content: content.trim(), subject: subject.trim() || undefined } as never });
      await queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
      setShowDialog(false);
      setTitle(""); setContent(""); setSubject("");
      toast({ title: "Note saved", description: "Your notes are ready to generate a course." });
    } catch {
      toast({ title: "Failed to save note", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteNote.mutateAsync({ id: String(id) } as never);
      await queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
      setDeleteId(null);
      toast({ title: "Note deleted" });
    } catch {
      toast({ title: "Failed to delete note", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-muted-foreground mt-1">Your study material library</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Notes
        </Button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : !allNotes?.length ? (
        <Card className="border-dashed border-border bg-transparent">
          <CardContent className="p-20 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold mb-3">No notes yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Paste your lecture notes, study guides, or any text material. The AI will transform them into an interactive lesson.
            </p>
            <Button size="lg" onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Your First Note
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allNotes.map((note) => (
            <Card key={note.id} className="bg-card border-border hover:border-primary/30 transition-colors group relative">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Link href={`/notes/${note.id}`} className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{note.title}</h3>
                  </Link>
                  <button
                    onClick={() => setDeleteId(note.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 rounded shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {note.subject && (
                  <Badge variant="secondary" className="mb-3 text-xs">{note.subject}</Badge>
                )}
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {note.content.slice(0, 150)}...
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{note.wordCount.toLocaleString()} words · {timeAgo(note.createdAt)}</span>
                  <Link href={`/courses/new?noteId=${note.id}`}>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-primary hover:text-primary">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Generate Lesson
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Study Notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input
                  placeholder="e.g. Chapter 5: Neural Networks"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Subject <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  placeholder="e.g. Machine Learning"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Content</Label>
              <Textarea
                placeholder="Paste your lecture notes, study material, or any text here..."
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={12}
                className="resize-none font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">{content.trim().split(/\s+/).filter(Boolean).length} words</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Notes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Note?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This will permanently delete the note and all associated courses. This cannot be undone.</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
