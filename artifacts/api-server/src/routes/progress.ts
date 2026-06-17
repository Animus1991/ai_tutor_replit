import { Router } from "express";
import { db } from "@workspace/db";
import { courseProgressTable, activityLogTable, learningProfilesTable, coursesTable, lessonStepsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "./auth";

const router = Router();

router.get("/courses/:courseId/progress", requireAuth, async (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params["courseId"] as string);
    let [progress] = await db
      .select()
      .from(courseProgressTable)
      .where(and(eq(courseProgressTable.courseId, courseId), eq(courseProgressTable.userId, req.userId!)));

    if (!progress) {
      [progress] = await db
        .insert(courseProgressTable)
        .values({ userId: req.userId!, courseId, startedAt: new Date() })
        .returning();
    }

    const steps = await db.select().from(lessonStepsTable).where(eq(lessonStepsTable.courseId, courseId));
    const totalSteps = steps.length;
    const completedIds = (progress.completedStepIds as number[]) || [];
    const percentComplete = totalSteps > 0 ? Math.round((completedIds.length / totalSteps) * 100) : 0;

    res.json({
      courseId: progress.courseId,
      currentStepPosition: progress.currentStepPosition,
      completedStepIds: completedIds,
      totalXp: progress.totalXp,
      correctAnswers: progress.correctAnswers,
      incorrectAnswers: progress.incorrectAnswers,
      hintsUsed: progress.hintsUsed,
      startedAt: progress.startedAt,
      completedAt: progress.completedAt,
      percentComplete,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get progress");
    res.status(500).json({ error: "Failed to get progress" });
  }
});

router.post("/courses/:courseId/progress", requireAuth, async (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params["courseId"] as string);
    const { stepId, action, answer } = req.body as Record<string, string>;

    let [progress] = await db
      .select()
      .from(courseProgressTable)
      .where(and(eq(courseProgressTable.courseId, courseId), eq(courseProgressTable.userId, req.userId!)));

    if (!progress) {
      [progress] = await db
        .insert(courseProgressTable)
        .values({ userId: req.userId!, courseId, startedAt: new Date() })
        .returning();
    }

    const [step] = stepId
      ? await db.select().from(lessonStepsTable).where(eq(lessonStepsTable.id, Number(stepId)))
      : [];
    const completedIds = (progress.completedStepIds as number[]) || [];

    let correct: boolean | null = null;
    let explanation: string | null = null;
    let xpEarned = 0;
    let adaptationNote: string | null = null;

    if (action === "submit_answer" && step?.questionData) {
      const qd = step.questionData as Record<string, unknown>;
      const correctAnswer = String(qd.correctAnswer || "").toLowerCase().trim();
      const userAnswer = String(answer || "").toLowerCase().trim();
      correct = userAnswer === correctAnswer || userAnswer.includes(correctAnswer) || correctAnswer.includes(userAnswer);
      explanation = String(qd.explanation || "");
      xpEarned = correct ? (step.xpReward || 10) : 0;

      await db.update(courseProgressTable).set({
        correctAnswers: progress.correctAnswers + (correct ? 1 : 0),
        incorrectAnswers: progress.incorrectAnswers + (correct ? 0 : 1),
        totalXp: progress.totalXp + xpEarned,
      }).where(eq(courseProgressTable.id, progress.id));

      if (!correct && (progress.incorrectAnswers + 1) % 3 === 0) {
        adaptationNote = "Your AI tutor noticed you might benefit from reviewing this topic. Try the explain feature for a deeper explanation.";
      }
    } else if (action === "use_hint") {
      await db.update(courseProgressTable).set({ hintsUsed: progress.hintsUsed + 1 }).where(eq(courseProgressTable.id, progress.id));
    } else if (action === "advance" || action === "complete") {
      if (stepId && !completedIds.includes(Number(stepId))) {
        completedIds.push(Number(stepId));
        xpEarned = step?.xpReward || 10;

        await db.update(courseProgressTable).set({
          completedStepIds: completedIds,
          currentStepPosition: (step?.position || progress.currentStepPosition) + 1,
          totalXp: progress.totalXp + xpEarned,
        }).where(eq(courseProgressTable.id, progress.id));

        await db.insert(activityLogTable).values({
          userId: req.userId!,
          activityType: "step_completed",
          description: `Completed a lesson step`,
          xpEarned,
          courseId,
        }).catch(() => {});
      }
    }

    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId));
    const allSteps = await db.select().from(lessonStepsTable).where(eq(lessonStepsTable.courseId, courseId));
    const [freshProgress] = await db.select().from(courseProgressTable).where(eq(courseProgressTable.id, progress.id));
    const updatedCompleted = (freshProgress?.completedStepIds as number[]) || [];
    const percentComplete = allSteps.length > 0 ? Math.round((updatedCompleted.length / allSteps.length) * 100) : 0;

    if (percentComplete === 100 && !freshProgress?.completedAt) {
      await db.update(courseProgressTable).set({ completedAt: new Date() }).where(eq(courseProgressTable.id, progress.id));
      await db.update(learningProfilesTable).set({ completedCourses: 1, lastActiveAt: new Date() }).where(eq(learningProfilesTable.userId, req.userId!)).catch(() => {});
      await db.insert(activityLogTable).values({
        userId: req.userId!,
        activityType: "course_completed",
        description: `Completed course: ${course?.title || "Unknown"}`,
        xpEarned: 100,
        courseId,
        courseTitle: course?.title || null,
      }).catch(() => {});
    }

    res.json({
      correct,
      explanation,
      xpEarned,
      adaptationNote,
      progress: {
        courseId,
        currentStepPosition: freshProgress?.currentStepPosition ?? progress.currentStepPosition,
        completedStepIds: updatedCompleted,
        totalXp: freshProgress?.totalXp ?? progress.totalXp,
        correctAnswers: freshProgress?.correctAnswers ?? progress.correctAnswers,
        incorrectAnswers: freshProgress?.incorrectAnswers ?? progress.incorrectAnswers,
        hintsUsed: freshProgress?.hintsUsed ?? progress.hintsUsed,
        startedAt: freshProgress?.startedAt,
        completedAt: freshProgress?.completedAt,
        percentComplete,
      }
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update progress");
    res.status(500).json({ error: "Failed to update progress" });
  }
});

export default router;
