import {
  customType,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod/v4";
import { notesTable } from "./notes";

/**
 * Custom pgvector column type.
 * Stores embeddings as native pgvector (`vector(1536)` for text-embedding-3-small).
 * Falls back to JSONB-like serialization on read/write so the rest of the
 * codebase keeps working with `number[]`.
 */
const vector = (name: string, dimensions: number) =>
  customType<{ data: number[]; driverData: string }>({
    dataType() {
      return `vector(${dimensions})`;
    },
    toDriver(value: number[]): string {
      return `[${value.join(",")}]`;
    },
    fromDriver(value: string): number[] {
      if (typeof value !== "string") return [];
      return value
        .slice(1, -1)
        .split(",")
        .map((s) => Number(s))
        .filter((n) => !Number.isNaN(n));
    },
  })(name);

export const EMBEDDING_DIMENSIONS = 1536;

export const sourceChunksTable = pgTable(
  "source_chunks",
  {
    id: serial("id").primaryKey(),
    noteId: integer("note_id")
      .notNull()
      .references(() => notesTable.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    text: text("text").notNull(),
    embedding: vector("embedding", EMBEDDING_DIMENSIONS),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    noteChunkUniq: uniqueIndex("source_chunks_note_chunk_uniq").on(
      t.noteId,
      t.chunkIndex,
    ),
    noteIdx: index("source_chunks_note_idx").on(t.noteId),
  }),
);

export const insertSourceChunkSchema = createInsertSchema(
  sourceChunksTable,
).omit({ id: true, createdAt: true });
export type InsertSourceChunk = z.infer<typeof insertSourceChunkSchema>;
export type SourceChunk = typeof sourceChunksTable.$inferSelect;
