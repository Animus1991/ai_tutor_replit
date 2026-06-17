import { Router } from "express";
import { db } from "@workspace/db";
import { notesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "./auth";

const router = Router();

router.get("/notes", requireAuth, async (req: AuthRequest, res) => {
  try {
    const notes = await db
      .select()
      .from(notesTable)
      .where(eq(notesTable.userId, req.userId!))
      .orderBy(notesTable.createdAt);
    res.json(notes.reverse());
  } catch (err) {
    req.log.error({ err }, "Failed to list notes");
    res.status(500).json({ error: "Failed to list notes" });
  }
});

router.post("/notes", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, content, subject } = req.body as Record<string, string>;
    if (!title || !content) {
      res.status(400).json({ error: "title and content are required" });
      return;
    }
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const [note] = await db
      .insert(notesTable)
      .values({ userId: req.userId!, title, content, subject: subject || null, wordCount })
      .returning();
    res.status(201).json(note);
  } catch (err) {
    req.log.error({ err }, "Failed to create note");
    res.status(500).json({ error: "Failed to create note" });
  }
});

router.get("/notes/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const [note] = await db
      .select()
      .from(notesTable)
      .where(and(eq(notesTable.id, id), eq(notesTable.userId, req.userId!)));
    if (!note) { res.status(404).json({ error: "Note not found" }); return; }
    res.json(note);
  } catch (err) {
    req.log.error({ err }, "Failed to get note");
    res.status(500).json({ error: "Failed to get note" });
  }
});

router.delete("/notes/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const [deleted] = await db
      .delete(notesTable)
      .where(and(eq(notesTable.id, id), eq(notesTable.userId, req.userId!)))
      .returning();
    if (!deleted) { res.status(404).json({ error: "Note not found" }); return; }
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete note");
    res.status(500).json({ error: "Failed to delete note" });
  }
});

export default router;
