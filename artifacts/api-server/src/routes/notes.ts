import { db } from "@workspace/db";
import { notesTable } from "@workspace/db";
import {
  deleteObject,
  isStorageConfigured,
  uploadObject,
} from "@workspace/storage";
import { and, eq } from "drizzle-orm";
import { Router } from "express";
import { parseUploadedDocument } from "../lib/documentParser";
import { indexNoteChunks } from "../lib/sourceRetrieval";
import { type AuthRequest, requireAuth } from "./auth";

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
      .values({
        userId: req.userId!,
        title,
        content,
        subject: subject || null,
        wordCount,
        sourceType: "text",
      })
      .returning();

    await indexNoteChunks(note?.id, content).catch((err) => {
      req.log.warn({ err, noteId: note?.id }, "Failed to index note chunks");
    });

    res.status(201).json(note);
  } catch (err) {
    req.log.error({ err }, "Failed to create note");
    res.status(500).json({ error: "Failed to create note" });
  }
});

router.post("/notes/upload", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, subject, fileName, mimeType, fileBase64 } =
      req.body as Record<string, string>;
    if (!title || !fileName || !fileBase64) {
      res
        .status(400)
        .json({ error: "title, fileName, and fileBase64 are required" });
      return;
    }

    const buffer = Buffer.from(fileBase64, "base64");
    if (buffer.length === 0) {
      res.status(400).json({ error: "Invalid file data" });
      return;
    }
    if (buffer.length > 15 * 1024 * 1024) {
      res.status(400).json({ error: "File exceeds 15 MB limit" });
      return;
    }

    const parsed = await parseUploadedDocument(
      buffer,
      mimeType || "application/octet-stream",
      fileName,
    );
    if (!parsed.text || parsed.text.length < 10) {
      res.status(400).json({
        error: "Could not extract enough text from the uploaded file",
      });
      return;
    }

    const wordCount = parsed.text.trim().split(/\s+/).filter(Boolean).length;

    let fileUrl: string;
    if (isStorageConfigured()) {
      const uploaded = await uploadObject({
        body: buffer,
        contentType: mimeType || "application/octet-stream",
        prefix: `notes/${req.userId}`,
        filename: fileName,
      });
      fileUrl = uploaded.url;
    } else {
      req.log.warn(
        "Object storage not configured (STORAGE_* env vars). Falling back to data URL — set up MinIO via `docker compose up minio` for production-grade uploads.",
      );
      fileUrl = `data:${mimeType || "application/octet-stream"};base64,${fileBase64}`;
    }

    const [note] = await db
      .insert(notesTable)
      .values({
        userId: req.userId!,
        title,
        content: parsed.text,
        subject: subject || null,
        fileUrl,
        mimeType: mimeType || null,
        sourceType: parsed.sourceType,
        wordCount,
      })
      .returning();

    await indexNoteChunks(note?.id, parsed.text).catch((err) => {
      req.log.warn(
        { err, noteId: note?.id },
        "Failed to index uploaded note chunks",
      );
    });

    res.status(201).json(note);
  } catch (err) {
    req.log.error({ err }, "Failed to upload note");
    const message =
      err instanceof Error ? err.message : "Failed to upload note";
    res.status(500).json({ error: message });
  }
});

router.get("/notes/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number.parseInt(req.params.id as string);
    const [note] = await db
      .select()
      .from(notesTable)
      .where(and(eq(notesTable.id, id), eq(notesTable.userId, req.userId!)));
    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }
    res.json(note);
  } catch (err) {
    req.log.error({ err }, "Failed to get note");
    res.status(500).json({ error: "Failed to get note" });
  }
});

router.delete("/notes/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number.parseInt(req.params.id as string);
    const [deleted] = await db
      .delete(notesTable)
      .where(and(eq(notesTable.id, id), eq(notesTable.userId, req.userId!)))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    if (deleted.fileUrl && isStorageConfigured()) {
      const key = extractStorageKey(deleted.fileUrl);
      if (key) {
        await deleteObject(key).catch((err) => {
          req.log.warn({ err, key }, "Failed to delete file from storage");
        });
      }
    }
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete note");
    res.status(500).json({ error: "Failed to delete note" });
  }
});

function extractStorageKey(url: string): string | null {
  if (url.startsWith("data:")) return null;
  const bucket = process.env.STORAGE_BUCKET;
  if (!bucket) return null;
  const match = url.match(new RegExp(`${bucket}/(.+)$`));
  return match ? (match[1] ?? null) : null;
}

export default router;
