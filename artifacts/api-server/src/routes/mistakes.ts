import { db } from "@workspace/db";
import {
  answerEventsTable,
  conceptsTable,
  coursesTable,
  lessonStepsTable,
  mistakesTable,
} from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import { Router } from "express";
import { type AuthRequest, requireAuth } from "./auth";

const router = Router();

router.get("/mistakes/notebook", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const rows = await db
      .select({
        id: mistakesTable.id,
        courseId: mistakesTable.courseId,
        stepId: mistakesTable.stepId,
        conceptId: mistakesTable.conceptId,
        status: mistakesTable.status,
        createdAt: mistakesTable.createdAt,
        resolvedAt: mistakesTable.resolvedAt,
        stepTitle: lessonStepsTable.title,
        stepType: lessonStepsTable.stepType,
        questionData: lessonStepsTable.questionData,
        courseTitle: coursesTable.title,
        conceptTitle: conceptsTable.title,
      })
      .from(mistakesTable)
      .innerJoin(
        lessonStepsTable,
        eq(mistakesTable.stepId, lessonStepsTable.id),
      )
      .innerJoin(coursesTable, eq(mistakesTable.courseId, coursesTable.id))
      .leftJoin(conceptsTable, eq(mistakesTable.conceptId, conceptsTable.id))
      .where(eq(mistakesTable.userId, userId))
      .orderBy(desc(mistakesTable.createdAt))
      .limit(100);

    const enriched = await Promise.all(
      rows.map(async (row) => {
        const [event] =
          row.status === "open"
            ? []
            : await db
                .select({
                  confidence: answerEventsTable.confidence,
                  isCorrect: answerEventsTable.isCorrect,
                })
                .from(answerEventsTable)
                .where(
                  and(
                    eq(answerEventsTable.userId, userId),
                    eq(answerEventsTable.stepId, row.stepId),
                  ),
                )
                .orderBy(desc(answerEventsTable.createdAt))
                .limit(1);

        const qd = row.questionData as Record<string, unknown> | null;
        return {
          id: row.id,
          courseId: row.courseId,
          stepId: row.stepId,
          conceptId: row.conceptId,
          status: row.status,
          createdAt: row.createdAt,
          resolvedAt: row.resolvedAt,
          stepTitle: row.stepTitle,
          stepType: row.stepType,
          courseTitle: row.courseTitle,
          conceptTitle: row.conceptTitle,
          question: qd?.question ? String(qd.question) : null,
          explanation: qd?.explanation ? String(qd.explanation) : null,
          lastConfidence: event?.confidence ?? null,
        };
      }),
    );

    res.json({
      open: enriched.filter((m) => m.status === "open"),
      resolved: enriched.filter((m) => m.status === "resolved"),
      total: enriched.length,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to load error notebook");
    res.status(500).json({ error: "Failed to load error notebook" });
  }
});

export default router;
