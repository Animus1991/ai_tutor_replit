import { db } from "@workspace/db";
import {
  conversations,
  coursesTable,
  messages,
  notesTable,
} from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { Router } from "express";
import { type AgentMode, buildAgentSystemPrompt } from "../lib/agentModes";
import { type ChatMessage, streamChat } from "../lib/aiStream";
import {
  formatGroundingContext,
  isQueryGrounded,
  retrieveRelevantChunks,
} from "../lib/sourceRetrieval";
import { SSEStream } from "../lib/sse";
import { type AuthRequest, requireAuth } from "./auth";
import { getOrCreateProfile } from "./profile";

const router = Router();

async function getOwnedConversation(id: number, userId: string) {
  const [convo] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
  return convo ?? null;
}

router.get(
  "/openai/conversations",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const all = await db
        .select()
        .from(conversations)
        .where(eq(conversations.userId, req.userId!))
        .orderBy(conversations.createdAt);
      res.json(all.reverse());
    } catch (err) {
      req.log.error({ err }, "Failed to list conversations");
      res.status(500).json({ error: "Failed to list conversations" });
    }
  },
);

router.post(
  "/openai/conversations",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const { title, courseId, stepId } = req.body as Record<
        string,
        string | number
      >;
      const parsedCourseId = courseId != null ? Number(courseId) : null;
      const fullTitle = parsedCourseId
        ? `Tutor Chat — Course #${parsedCourseId}${stepId ? ` Step ${stepId}` : ""}`
        : String(title || "AI Tutor Chat");

      const [convo] = await db
        .insert(conversations)
        .values({
          userId: req.userId!,
          courseId: parsedCourseId,
          title: fullTitle,
        })
        .returning();
      res.status(201).json(convo);
    } catch (err) {
      req.log.error({ err }, "Failed to create conversation");
      res.status(500).json({ error: "Failed to create conversation" });
    }
  },
);

router.get(
  "/openai/conversations/:id",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const id = Number.parseInt(req.params.id as string);
      const convo = await getOwnedConversation(id, req.userId!);
      if (!convo) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }
      const msgs = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, id))
        .orderBy(messages.createdAt);
      res.json({ ...convo, messages: msgs });
    } catch (err) {
      req.log.error({ err }, "Failed to get conversation");
      res.status(500).json({ error: "Failed to get conversation" });
    }
  },
);

router.delete(
  "/openai/conversations/:id",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const id = Number.parseInt(req.params.id as string);
      const [deleted] = await db
        .delete(conversations)
        .where(
          and(eq(conversations.id, id), eq(conversations.userId, req.userId!)),
        )
        .returning();
      if (!deleted) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }
      res.status(204).send();
    } catch (err) {
      req.log.error({ err }, "Failed to delete conversation");
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  },
);

router.get(
  "/openai/conversations/:id/messages",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const id = Number.parseInt(req.params.id as string);
      const convo = await getOwnedConversation(id, req.userId!);
      if (!convo) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }
      const msgs = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, id))
        .orderBy(messages.createdAt);
      res.json(msgs);
    } catch (err) {
      req.log.error({ err }, "Failed to list messages");
      res.status(500).json({ error: "Failed to list messages" });
    }
  },
);

router.post(
  "/openai/conversations/:id/messages",
  requireAuth,
  async (req: AuthRequest, res) => {
    const id = Number.parseInt(req.params.id as string);
    const sse = new SSEStream(res);

    try {
      const { content, mode } = req.body as Record<string, string>;
      if (!content) {
        sse.legacyError("content is required");
        return;
      }

      const convo = await getOwnedConversation(id, req.userId!);
      if (!convo) {
        sse.legacyError("Conversation not found");
        return;
      }

      const profile = await getOrCreateProfile(req.userId!);
      const agentMode = (mode || profile.agentMode || "socratic") as AgentMode;

      const history = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, id))
        .orderBy(messages.createdAt);

      let groundingContext = "";
      let notInNotes = false;
      if (convo.courseId) {
        const [course] = await db
          .select()
          .from(coursesTable)
          .where(
            and(
              eq(coursesTable.id, convo.courseId),
              eq(coursesTable.userId, req.userId!),
            ),
          );
        if (course) {
          const [note] = await db
            .select()
            .from(notesTable)
            .where(eq(notesTable.id, course.noteId));
          if (note) {
            const chunks = await retrieveRelevantChunks(note.id, content, 5);
            if (chunks.length > 0 && isQueryGrounded(chunks)) {
              groundingContext = formatGroundingContext(chunks);
            } else if (chunks.length > 0) {
              notInNotes = true;
            }
          }
        }
      }

      await db
        .insert(messages)
        .values({ conversationId: id, role: "user", content });

      if (notInNotes) {
        const guardReply =
          "I couldn't find enough relevant material in your uploaded notes to answer that confidently. Try rephrasing your question to match topics covered in your study material, or upload additional notes on this subject.";
        await db.insert(messages).values({
          conversationId: id,
          role: "assistant",
          content: guardReply,
        });
        sse.legacyChunk(guardReply);
        sse.legacyDone();
        return;
      }

      const chatMessages: ChatMessage[] = [
        {
          role: "system",
          content: buildAgentSystemPrompt(agentMode, {
            groundingContext: groundingContext || undefined,
            socraticMode: profile.socraticMode === 1,
            strictSource: profile.strictSourceMode === 1,
          }),
        },
        ...history.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user", content },
      ];

      let fullResponse = "";
      for await (const token of streamChat(chatMessages)) {
        fullResponse += token;
        sse.legacyChunk(token);
      }

      await db.insert(messages).values({
        conversationId: id,
        role: "assistant",
        content: fullResponse,
      });

      sse.legacyDone();
    } catch (err) {
      req.log.error({ err }, "AI message failed");
      sse.legacyError("AI response failed");
    }
  },
);

router.post(
  "/openai/feynman-check",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const { explanation, concept } = req.body as {
        explanation?: string;
        concept?: string;
      };
      if (!explanation || explanation.trim().length < 10) {
        res
          .status(400)
          .json({ error: "explanation must be at least 10 characters" });
        return;
      }

      const { complete, __testing } = await import("../lib/aiStream");
      const topic = concept?.trim() || "the concept being studied";

      if (__testing.shouldMock()) {
        const wordCount = explanation
          .trim()
          .split(/\s+/)
          .filter(Boolean).length;
        const issues: string[] = [];
        if (!explanation.toLowerCase().includes("because"))
          issues.push("Add causal reasoning — explain *why*, not just *what*.");
        if (!explanation.toLowerCase().includes("example"))
          issues.push("Include a concrete example to anchor the explanation.");
        if (wordCount < 25)
          issues.push("Expand the mechanism; labels alone are not enough.");
        res.json({
          score: Math.max(
            25,
            Math.min(90, 45 + wordCount - issues.length * 10),
          ),
          issues:
            issues.length > 0
              ? issues
              : ["Solid draft — test recall again tomorrow without notes."],
          isDemo: true,
        });
        return;
      }

      const raw = await complete(
        [
          {
            role: "system",
            content:
              'You evaluate Feynman-style explanations. Return ONLY valid JSON: {"score":0-100,"issues":["..."]}. Score clarity, causal reasoning, examples, and completeness. issues = 1-4 specific gaps. Be concise.',
          },
          {
            role: "user",
            content: `Concept: ${topic}\n\nLearner explanation:\n${explanation.trim()}`,
          },
        ],
        { model: "gpt-5.4", maxTokens: 512, temperature: 0.3 },
      );

      let parsed: { score?: number; issues?: string[] } = {};
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? (JSON.parse(jsonMatch[0]) as typeof parsed) : {};
      } catch {
        parsed = {
          score: 60,
          issues: ["Could not parse AI feedback — try again."],
        };
      }

      res.json({
        score: Math.max(0, Math.min(100, Math.round(parsed.score ?? 60))),
        issues:
          Array.isArray(parsed.issues) && parsed.issues.length > 0
            ? parsed.issues.slice(0, 5).map(String)
            : [
                "Review whether you explained the mechanism, not just the label.",
              ],
        isDemo: false,
      });
    } catch (err) {
      req.log.error({ err }, "Feynman check failed");
      res.status(500).json({ error: "Feynman check failed" });
    }
  },
);

router.post(
  "/openai/generate-image",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const { prompt, size } = req.body as Record<string, string>;
      if (!prompt) {
        res.status(400).json({ error: "prompt is required" });
        return;
      }
      const { generateImageBuffer } = await import(
        "@workspace/integrations-openai-ai-server/image"
      );
      const validSizes = ["1024x1024", "1536x1024", "1024x1536"] as const;
      const safeSize: (typeof validSizes)[number] = validSizes.includes(
        size as (typeof validSizes)[number],
      )
        ? (size as (typeof validSizes)[number])
        : "1024x1024";
      const buffer = await generateImageBuffer(prompt, safeSize);
      res.json({ b64_json: buffer.toString("base64") });
    } catch (err) {
      req.log.error({ err }, "Image generation failed");
      res.status(500).json({ error: "Image generation failed" });
    }
  },
);

export default router;
