import { db } from "@workspace/db";
import {
  coursesTable,
  lessonStepConceptsTable,
  lessonStepsTable,
  masteryRecordsTable,
} from "@workspace/db";
import { and, eq, inArray, isNotNull, lt } from "drizzle-orm";
import { Router } from "express";
import { type AuthRequest, requireAuth } from "./auth";

const router = Router();

router.get("/exam/mock", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const count = Math.min(
      30,
      Math.max(5, Number.parseInt(String(req.query.count ?? "10"), 10) || 10),
    );
    const courseIdParam = req.query.courseId
      ? Number.parseInt(String(req.query.courseId), 10)
      : null;
    const durationMinutes = Math.min(
      120,
      Math.max(
        5,
        Number.parseInt(String(req.query.durationMinutes ?? "25"), 10) || 25,
      ),
    );

    const courseFilter = courseIdParam
      ? and(
          eq(coursesTable.userId, userId),
          eq(coursesTable.status, "ready"),
          eq(coursesTable.id, courseIdParam),
        )
      : and(eq(coursesTable.userId, userId), eq(coursesTable.status, "ready"));

    const userCourses = await db
      .select({ id: coursesTable.id, title: coursesTable.title })
      .from(coursesTable)
      .where(courseFilter);

    if (userCourses.length === 0) {
      res
        .status(404)
        .json({ error: "No ready courses found for exam simulation" });
      return;
    }

    const courseIds = userCourses.map((c) => c.id);

    const weakConcepts = await db
      .select({
        conceptId: masteryRecordsTable.conceptId,
        mastery: masteryRecordsTable.mastery,
      })
      .from(masteryRecordsTable)
      .where(
        and(
          eq(masteryRecordsTable.userId, userId),
          inArray(masteryRecordsTable.courseId, courseIds),
          lt(masteryRecordsTable.mastery, 0.65),
        ),
      )
      .orderBy(masteryRecordsTable.mastery)
      .limit(20);

    const weakConceptIds = weakConcepts.map((c) => c.conceptId);

    let candidateSteps = await db
      .select({
        stepId: lessonStepsTable.id,
        courseId: lessonStepsTable.courseId,
        title: lessonStepsTable.title,
        questionData: lessonStepsTable.questionData,
        courseTitle: coursesTable.title,
      })
      .from(lessonStepsTable)
      .innerJoin(coursesTable, eq(lessonStepsTable.courseId, coursesTable.id))
      .where(
        and(
          inArray(lessonStepsTable.courseId, courseIds),
          isNotNull(lessonStepsTable.questionData),
        ),
      );

    if (weakConceptIds.length > 0) {
      const taggedStepIds = await db
        .select({ stepId: lessonStepConceptsTable.stepId })
        .from(lessonStepConceptsTable)
        .where(inArray(lessonStepConceptsTable.conceptId, weakConceptIds));

      const weakStepIdSet = new Set(taggedStepIds.map((s) => s.stepId));
      const prioritized = candidateSteps.filter((s) =>
        weakStepIdSet.has(s.stepId),
      );
      if (prioritized.length >= count) candidateSteps = prioritized;
    }

    const shuffled = candidateSteps
      .sort(() => Math.random() - 0.5)
      .slice(0, count);

    res.json({
      durationMinutes,
      questionCount: shuffled.length,
      startedAt: new Date().toISOString(),
      questions: shuffled.map((s, i) => {
        const qd = s.questionData as Record<string, unknown>;
        return {
          index: i + 1,
          stepId: s.stepId,
          courseId: s.courseId,
          courseTitle: s.courseTitle,
          title: s.title,
          question: String(qd.question ?? ""),
          type: String(qd.type ?? "open_ended"),
          choices: Array.isArray(qd.choices) ? qd.choices.map(String) : null,
        };
      }),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate exam mock");
    res.status(500).json({ error: "Failed to generate exam mock" });
  }
});

export default router;
