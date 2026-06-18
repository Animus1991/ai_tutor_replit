const CHUNK_WORDS = 400;
const CHUNK_OVERLAP = 50;

export function chunkText(text: string): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const chunks: string[] = [];
  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + CHUNK_WORDS, words.length);
    chunks.push(words.slice(start, end).join(" "));
    if (end >= words.length) break;
    start = Math.max(0, end - CHUNK_OVERLAP);
  }
  return chunks;
}

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default as (
    buf: Buffer,
  ) => Promise<{ text: string }>;
  const result = await pdfParse(buffer);
  return result.text.trim();
}

export async function extractImageText(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const { openai } = await import("@workspace/integrations-openai-ai-server");
  const b64 = buffer.toString("base64");
  const response = await openai.chat.completions.create({
    model: "gpt-5.4",
    max_completion_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract ALL readable text from this study material image. Preserve structure (headings, lists, equations). Return only the extracted text, no commentary.",
          },
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${b64}` },
          },
        ],
      },
    ],
  });
  return (response.choices[0]?.message?.content ?? "").trim();
}

export async function parseUploadedDocument(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<{ text: string; sourceType: "pdf" | "image" | "text" }> {
  const lower = fileName.toLowerCase();
  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) {
    return { text: await extractPdfText(buffer), sourceType: "pdf" };
  }
  if (mimeType.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(lower)) {
    return {
      text: await extractImageText(buffer, mimeType),
      sourceType: "image",
    };
  }
  if (
    mimeType.startsWith("text/") ||
    lower.endsWith(".txt") ||
    lower.endsWith(".md")
  ) {
    return { text: buffer.toString("utf-8").trim(), sourceType: "text" };
  }
  throw new Error(`Unsupported file type: ${mimeType || fileName}`);
}
