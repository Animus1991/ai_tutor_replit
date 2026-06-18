export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface StreamOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

function shouldMock(): boolean {
  return (
    process.env.AI_MOCK_RESPONSES === "true" ||
    process.env.AI_MOCK_RESPONSES === "1" ||
    !process.env.AI_INTEGRATIONS_OPENAI_API_KEY ||
    /REPLACE_ME/i.test(process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? "")
  );
}

async function getOpenAI() {
  const mod = await import("@workspace/integrations-openai-ai-server");
  return mod.openai;
}

function lastUserMessage(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m?.role === "user") return m.content;
  }
  return "";
}

function buildMockReply(messages: ChatMessage[]): string {
  const question = lastUserMessage(messages).trim();
  const truncated =
    question.length > 120 ? `${question.slice(0, 120)}...` : question;
  return [
    "**[Mock AI response — set `AI_MOCK_RESPONSES=false` and provide a real `AI_INTEGRATIONS_OPENAI_API_KEY` to get live answers.]**",
    "",
    `You asked: "${truncated || "(empty prompt)"}"`,
    "",
    "Here is a placeholder explanation while real AI is disabled:",
    "",
    "1. The local dev stack is fully wired up (database, retrieval, SSE streaming, agent modes, FSRS scheduler).",
    "2. Once a real OpenAI key is provided, this exact endpoint will stream tokens from `gpt-5.4` (or your configured model).",
    "3. All grounding, source retrieval (pgvector), and agent prompt logic still runs — only the final LLM call is mocked.",
    "",
    "Try uploading a note and asking a question about it to see the retrieval pipeline working end-to-end.",
  ].join("\n");
}

async function* mockStream(text: string): AsyncGenerator<string, void, void> {
  const words = text.split(/(\s+)/);
  for (const word of words) {
    if (!word) continue;
    yield word;
    await new Promise((resolve) => setTimeout(resolve, 15));
  }
}

/**
 * Stream an AI response token-by-token.
 *
 * Uses OpenAI Chat Completions when configured. Falls back to a deterministic
 * mock when `AI_MOCK_RESPONSES=true` or no real API key is set — this lets
 * the entire app boot, test, and demonstrate without external dependencies.
 *
 * When migrating to the newer Responses API (`openai.responses.stream`) only
 * this function needs to change — all routes call into it.
 */
export async function* streamChat(
  messages: ChatMessage[],
  options: StreamOptions = {},
): AsyncGenerator<string, void, void> {
  if (shouldMock()) {
    yield* mockStream(buildMockReply(messages));
    return;
  }

  const openai = await getOpenAI();
  const stream = await openai.chat.completions.create({
    model: options.model ?? "gpt-5.4",
    max_completion_tokens: options.maxTokens ?? 2048,
    temperature: options.temperature ?? 0.7,
    messages,
    stream: true,
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) yield text;
  }
}

/**
 * Non-streaming variant for one-shot completions (e.g. course generation).
 */
export async function complete(
  messages: ChatMessage[],
  options: StreamOptions = {},
): Promise<string> {
  if (shouldMock()) {
    return buildMockReply(messages);
  }

  const openai = await getOpenAI();
  const response = await openai.chat.completions.create({
    model: options.model ?? "gpt-5.4",
    max_completion_tokens: options.maxTokens ?? 4096,
    temperature: options.temperature ?? 0.7,
    messages,
  });
  return response.choices[0]?.message?.content ?? "";
}

/** Exposed for unit tests and diagnostic endpoints. */
export const __testing = { shouldMock, buildMockReply, lastUserMessage };
