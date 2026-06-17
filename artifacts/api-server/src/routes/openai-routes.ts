import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "./auth";

const router = Router();

router.get("/openai/conversations", requireAuth, async (req: AuthRequest, res) => {
  try {
    const all = await db.select().from(conversations).orderBy(conversations.createdAt);
    res.json(all.reverse());
  } catch (err) {
    req.log.error({ err }, "Failed to list conversations");
    res.status(500).json({ error: "Failed to list conversations" });
  }
});

router.post("/openai/conversations", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, courseId, stepId } = req.body as Record<string, string>;
    const fullTitle = courseId ? `Tutor Chat — Course #${courseId}${stepId ? ` Step ${stepId}` : ""}` : (title || "AI Tutor Chat");
    const [convo] = await db.insert(conversations).values({ title: fullTitle }).returning();
    res.status(201).json(convo);
  } catch (err) {
    req.log.error({ err }, "Failed to create conversation");
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

router.get("/openai/conversations/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const [convo] = await db.select().from(conversations).where(eq(conversations.id, id));
    if (!convo) { res.status(404).json({ error: "Conversation not found" }); return; }
    const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
    res.json({ ...convo, messages: msgs });
  } catch (err) {
    req.log.error({ err }, "Failed to get conversation");
    res.status(500).json({ error: "Failed to get conversation" });
  }
});

router.delete("/openai/conversations/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const [deleted] = await db.delete(conversations).where(eq(conversations.id, id)).returning();
    if (!deleted) { res.status(404).json({ error: "Conversation not found" }); return; }
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete conversation");
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

router.get("/openai/conversations/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
    res.json(msgs);
  } catch (err) {
    req.log.error({ err }, "Failed to list messages");
    res.status(500).json({ error: "Failed to list messages" });
  }
});

router.post("/openai/conversations/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params["id"] as string);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const { content } = req.body as Record<string, string>;
    if (!content) { res.write(`data: ${JSON.stringify({ error: "content is required" })}\n\n`); res.end(); return; }

    const [convo] = await db.select().from(conversations).where(eq(conversations.id, id));
    if (!convo) { res.write(`data: ${JSON.stringify({ error: "Conversation not found" })}\n\n`); res.end(); return; }

    const history = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);

    await db.insert(messages).values({ conversationId: id, role: "user", content });

    const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
      {
        role: "system",
        content: "You are LearnAI, an expert AI tutor. You help students understand complex topics through clear explanations, Socratic questioning, and encouragement. You apply principles from cognitive psychology, spaced repetition, and active recall. Be concise, warm, and educational. Adapt your explanations to the student's level. Use markdown formatting for clarity."
      },
      ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content }
    ];

    let fullResponse = "";
    const stream = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 2048,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    await db.insert(messages).values({ conversationId: id, role: "assistant", content: fullResponse });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "AI message failed");
    res.write(`data: ${JSON.stringify({ error: "AI response failed" })}\n\n`);
    res.end();
  }
});

router.post("/openai/generate-image", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { prompt, size } = req.body as Record<string, string>;
    if (!prompt) { res.status(400).json({ error: "prompt is required" }); return; }
    const { generateImageBuffer } = await import("@workspace/integrations-openai-ai-server/image");
    const validSizes = ["1024x1024", "512x512", "256x256"] as const;
    const safeSize: typeof validSizes[number] = validSizes.includes(size as typeof validSizes[number]) ? size as typeof validSizes[number] : "1024x1024";
    const buffer = await generateImageBuffer(prompt, safeSize);
    res.json({ b64_json: buffer.toString("base64") });
  } catch (err) {
    req.log.error({ err }, "Image generation failed");
    res.status(500).json({ error: "Image generation failed" });
  }
});

export default router;
