import { Router } from "express";
import { db } from "@workspace/db";
import { coursesTable, lessonStepsTable, notesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { requireAuth, type AuthRequest } from "./auth";

const router = Router();

router.get("/courses", requireAuth, async (req: AuthRequest, res) => {
  try {
    const courses = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.userId, req.userId!))
      .orderBy(coursesTable.createdAt);
    res.json(courses.reverse());
  } catch (err) {
    req.log.error({ err }, "Failed to list courses");
    res.status(500).json({ error: "Failed to list courses" });
  }
});

router.post("/courses", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { noteId, title, courseType, difficulty, quizFrequency, additionalInstructions } = req.body as Record<string, string>;
    if (!noteId) { res.status(400).json({ error: "noteId is required" }); return; }

    const [note] = await db
      .select()
      .from(notesTable)
      .where(and(eq(notesTable.id, Number(noteId)), eq(notesTable.userId, req.userId!)));
    if (!note) { res.status(404).json({ error: "Note not found" }); return; }

    const courseTitle = title || `${note.title} — Interactive Lesson`;
    const [course] = await db
      .insert(coursesTable)
      .values({
        userId: req.userId!,
        noteId: Number(noteId),
        title: courseTitle,
        description: `AI-generated interactive lesson from your notes on "${note.title}"`,
        subject: note.subject,
        courseType: courseType || "theoretical",
        status: "generating",
        difficulty: difficulty || "intermediate",
        quizFrequency: quizFrequency || "medium",
        additionalInstructions: additionalInstructions || null,
        totalSteps: 0,
        estimatedMinutes: 15,
      })
      .returning();

    res.status(201).json(course);
  } catch (err) {
    req.log.error({ err }, "Failed to create course");
    res.status(500).json({ error: "Failed to create course" });
  }
});

router.get("/courses/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const [course] = await db
      .select()
      .from(coursesTable)
      .where(and(eq(coursesTable.id, id), eq(coursesTable.userId, req.userId!)));
    if (!course) { res.status(404).json({ error: "Course not found" }); return; }

    const steps = await db
      .select()
      .from(lessonStepsTable)
      .where(eq(lessonStepsTable.courseId, id))
      .orderBy(lessonStepsTable.position);

    res.json({ ...course, steps });
  } catch (err) {
    req.log.error({ err }, "Failed to get course");
    res.status(500).json({ error: "Failed to get course" });
  }
});

router.delete("/courses/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const [deleted] = await db
      .delete(coursesTable)
      .where(and(eq(coursesTable.id, id), eq(coursesTable.userId, req.userId!)))
      .returning();
    if (!deleted) { res.status(404).json({ error: "Course not found" }); return; }
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete course");
    res.status(500).json({ error: "Failed to delete course" });
  }
});

router.post("/courses/:id/generate-steps", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params["id"] as string);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const [course] = await db
      .select()
      .from(coursesTable)
      .where(and(eq(coursesTable.id, id), eq(coursesTable.userId, req.userId!)));
    if (!course) {
      res.write(`data: ${JSON.stringify({ error: "Course not found" })}\n\n`);
      res.end(); return;
    }

    const [note] = await db
      .select()
      .from(notesTable)
      .where(eq(notesTable.id, course.noteId));
    if (!note) {
      res.write(`data: ${JSON.stringify({ error: "Note not found" })}\n\n`);
      res.end(); return;
    }

    res.write(`data: ${JSON.stringify({ status: "generating", message: "AI tutor is preparing your lesson..." })}\n\n`);

    const quizMap: Record<string, number> = { low: 2, medium: 4, high: 6 };
    const quizCount = quizMap[course.quizFrequency] ?? 3;
    const isPractical = course.courseType === "practical";
    const isMixed = course.courseType === "mixed";

    const systemPrompt = `You are an expert educational content designer specializing in adaptive learning systems. You combine principles from cognitive psychology, Montessori education, spaced repetition (Ebbinghaus), active recall, and the Feynman Technique to create highly effective personalized lessons.

Generate a complete, structured interactive lesson from the user's notes. The lesson should:
1. Start with a motivating introduction that sets context and learning objectives
2. Break content into digestible, progressive chunks
3. Embed ${quizCount} questions/quizzes throughout (not just at the end) for active recall — space them evenly
4. ${isPractical || isMixed ? "Include practical code exercises or hands-on tasks" : "Use conceptual questions and scenario-based questions"}
5. End with a comprehensive summary and key takeaways
6. Adapt complexity to ${course.difficulty} level
7. Use the Socratic method: sometimes ask the learner to think before revealing the answer

Return a JSON object with this exact structure:
{
  "title": "Course title",
  "description": "2-sentence description",
  "estimatedMinutes": <number>,
  "steps": [
    {
      "position": 1,
      "stepType": "introduction|content|question|code_exercise|summary|checkpoint",
      "title": "Step title or null",
      "content": "Markdown-formatted content text. Rich, educational, detailed.",
      "xpReward": <10-50>,
      "isRequired": true,
      "questionData": null or {
        "type": "multiple_choice|true_false|open_ended",
        "question": "The question text",
        "choices": ["A", "B", "C", "D"] or null,
        "correctAnswer": "The correct answer or letter",
        "explanation": "Why this is correct, detailed explanation"
      },
      "codeData": null or {
        "language": "python|javascript|sql|etc",
        "instructions": "What the learner should do",
        "starterCode": "# starter code here",
        "solution": "# solution code",
        "expectedOutput": "What running the code should produce"
      }
    }
  ]
}

Make the content RICH, EDUCATIONAL, DETAILED. Use markdown for formatting. The lesson should feel like a real tutoring session with a knowledgeable professor who adapts to the student.
${course.additionalInstructions ? `\n\nAdditional instructions from the learner: ${course.additionalInstructions}` : ""}`;

    const userMessage = `Create an interactive ${course.courseType} lesson from these study notes:\n\nTitle: ${note.title}\n${note.subject ? `Subject: ${note.subject}\n` : ""}\n${note.content}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" },
    });

    const rawContent = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(rawContent) as {
      title?: string;
      description?: string;
      estimatedMinutes?: number;
      steps?: Array<{
        position: number;
        stepType?: string;
        title?: string;
        content?: string;
        questionData?: unknown;
        codeData?: unknown;
        xpReward?: number;
        isRequired?: boolean;
      }>;
    };

    const steps = parsed.steps || [];

    for (const step of steps) {
      await db
        .insert(lessonStepsTable)
        .values({
          courseId: id,
          position: step.position,
          stepType: step.stepType || "content",
          title: step.title || null,
          content: step.content || "",
          questionData: step.questionData || null,
          codeData: step.codeData || null,
          xpReward: step.xpReward || 10,
          isRequired: step.isRequired !== false ? 1 : 0,
        })
        .returning();
      res.write(`data: ${JSON.stringify({ status: "step_added", stepPosition: step.position })}\n\n`);
    }

    await db
      .update(coursesTable)
      .set({
        status: "ready",
        totalSteps: steps.length,
        estimatedMinutes: parsed.estimatedMinutes || 15,
        title: parsed.title || course.title,
        description: parsed.description || course.description,
      })
      .where(eq(coursesTable.id, id));

    res.write(`data: ${JSON.stringify({ status: "complete", totalSteps: steps.length })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Failed to generate course steps");
    try {
      await db.update(coursesTable).set({ status: "error" }).where(eq(coursesTable.id, id));
    } catch (_) { /* ignore */ }
    res.write(`data: ${JSON.stringify({ error: "Generation failed" })}\n\n`);
    res.end();
  }
});

router.post("/courses/:id/regenerate", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const { difficulty, quizFrequency, courseType, additionalInstructions } = req.body as Record<string, string>;

    const [course] = await db
      .select()
      .from(coursesTable)
      .where(and(eq(coursesTable.id, id), eq(coursesTable.userId, req.userId!)));
    if (!course) { res.status(404).json({ error: "Course not found" }); return; }

    await db.delete(lessonStepsTable).where(eq(lessonStepsTable.courseId, id));

    const updates: Record<string, unknown> = { status: "generating", totalSteps: 0 };
    if (difficulty) updates.difficulty = difficulty;
    if (quizFrequency) updates.quizFrequency = quizFrequency;
    if (courseType) updates.courseType = courseType;
    if (additionalInstructions) updates.additionalInstructions = additionalInstructions;

    const [updated] = await db
      .update(coursesTable)
      .set(updates)
      .where(eq(coursesTable.id, id))
      .returning();

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to regenerate course");
    res.status(500).json({ error: "Failed to regenerate course" });
  }
});

router.get("/courses/:courseId/steps", requireAuth, async (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params["courseId"] as string);
    const steps = await db
      .select()
      .from(lessonStepsTable)
      .where(eq(lessonStepsTable.courseId, courseId))
      .orderBy(lessonStepsTable.position);
    res.json(steps);
  } catch (err) {
    req.log.error({ err }, "Failed to list steps");
    res.status(500).json({ error: "Failed to list steps" });
  }
});

router.get("/courses/:courseId/steps/:stepId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const stepId = parseInt(req.params["stepId"] as string);
    const [step] = await db
      .select()
      .from(lessonStepsTable)
      .where(eq(lessonStepsTable.id, stepId));
    if (!step) { res.status(404).json({ error: "Step not found" }); return; }
    res.json(step);
  } catch (err) {
    req.log.error({ err }, "Failed to get step");
    res.status(500).json({ error: "Failed to get step" });
  }
});

router.post("/courses/:courseId/steps/:stepId/hint", requireAuth, async (req: AuthRequest, res) => {
  const stepId = parseInt(req.params["stepId"] as string);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const [step] = await db.select().from(lessonStepsTable).where(eq(lessonStepsTable.id, stepId));
    if (!step) { res.write(`data: ${JSON.stringify({ error: "Step not found" })}\n\n`); res.end(); return; }

    const questionInfo = step.questionData ? `\nQuestion: ${JSON.stringify(step.questionData)}` : "";
    const stream = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 512,
      messages: [
        { role: "system", content: "You are a helpful AI tutor. Give a gentle hint that guides the learner toward the answer without giving it away directly. Keep it concise (2-3 sentences max). Use the Socratic method." },
        { role: "user", content: `Give me a hint for this lesson step:\n${step.content}${questionInfo}` }
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Hint generation failed");
    res.write(`data: ${JSON.stringify({ error: "Failed to generate hint" })}\n\n`);
    res.end();
  }
});

router.post("/courses/:courseId/steps/:stepId/explain", requireAuth, async (req: AuthRequest, res) => {
  const stepId = parseInt(req.params["stepId"] as string);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const [step] = await db.select().from(lessonStepsTable).where(eq(lessonStepsTable.id, stepId));
    if (!step) { res.write(`data: ${JSON.stringify({ error: "Step not found" })}\n\n`); res.end(); return; }

    const stream = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 1024,
      messages: [
        { role: "system", content: "You are an expert AI tutor. Provide a deep, clear, and engaging explanation of the concept. Use analogies, examples, and real-world applications. Be encouraging and thorough." },
        { role: "user", content: `Please explain this concept in more depth:\n\n${step.content}` }
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Explanation generation failed");
    res.write(`data: ${JSON.stringify({ error: "Failed to generate explanation" })}\n\n`);
    res.end();
  }
});

export default router;
