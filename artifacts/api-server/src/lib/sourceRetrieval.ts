import { db } from "@workspace/db";
import { sourceChunksTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { chunkText } from "./documentParser";

function aiMocked(): boolean {
  return (
    process.env.AI_MOCK_RESPONSES === "true" ||
    process.env.AI_MOCK_RESPONSES === "1" ||
    !process.env.AI_INTEGRATIONS_OPENAI_API_KEY ||
    /REPLACE_ME/i.test(process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? "")
  );
}

async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  if (aiMocked()) {
    return [];
  }

  const { openai } = await import("@workspace/integrations-openai-ai-server");
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });
  return response.data.map((d) => d.embedding);
}

function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(",")}]`;
}

export async function indexNoteChunks(
  noteId: number,
  content: string,
): Promise<void> {
  const chunks = chunkText(content);
  await db
    .delete(sourceChunksTable)
    .where(eq(sourceChunksTable.noteId, noteId));
  if (chunks.length === 0) return;

  const embeddings = await embedTexts(chunks);
  await db.insert(sourceChunksTable).values(
    chunks.map((text, chunkIndex) => ({
      noteId,
      chunkIndex,
      text,
      embedding: embeddings[chunkIndex] ?? [],
    })),
  );
}

/**
 * Retrieve top-K most relevant chunks using pgvector cosine similarity.
 * Falls back to keyword overlap when no embeddings are stored yet (e.g. dev
 * environment without OpenAI access).
 */
export async function retrieveRelevantChunks(
  noteId: number,
  query: string,
  topK = 5,
): Promise<{ text: string; score: number }[]> {
  const [queryEmbedding] = await embedTexts([query]).catch(() => [
    [] as number[],
  ]);

  if (queryEmbedding && queryEmbedding.length > 0) {
    const vec = toVectorLiteral(queryEmbedding);
    const rows = await db.execute<{ text: string; similarity: number }>(sql`
      SELECT text, 1 - (embedding <=> ${vec}::vector) AS similarity
      FROM source_chunks
      WHERE note_id = ${noteId} AND embedding IS NOT NULL
      ORDER BY embedding <=> ${vec}::vector
      LIMIT ${topK}
    `);
    return rows.rows.map((r) => ({
      text: r.text,
      score: Number(r.similarity),
    }));
  }

  const chunks = await db
    .select()
    .from(sourceChunksTable)
    .where(eq(sourceChunksTable.noteId, noteId));
  if (chunks.length === 0) return [];

  const q = query.toLowerCase();
  const qWords = new Set(q.split(/\s+/).filter((w) => w.length > 3));
  return chunks
    .map((c) => {
      const textLower = c.text.toLowerCase();
      let hits = 0;
      for (const w of qWords) if (textLower.includes(w)) hits++;
      return { text: c.text, score: hits / Math.max(qWords.size, 1) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export function formatGroundingContext(
  chunks: { text: string; score: number }[],
): string {
  if (chunks.length === 0) return "";
  const body = chunks
    .map((c, i) => `[Source ${i + 1}]\n${c.text}`)
    .join("\n\n");
  return `\n\n--- SOURCE MATERIAL (ground answers in these excerpts) ---\n${body}\n--- END SOURCE MATERIAL ---`;
}

export function isQueryGrounded(
  chunks: { score: number }[],
  threshold = 0.15,
): boolean {
  if (chunks.length === 0) return false;
  return chunks[0]?.score >= threshold;
}
