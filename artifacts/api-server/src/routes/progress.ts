import { Router } from "express";
import { db } from "@workspace/db";
import { courseProgressTable, activityLogTable, learningProfilesTable, coursesTable, lessonStepsTable, answerEventsTable } from "@workspace/db";
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
    const { stepId, action, answer, confidence } = req.body as {
      stepId?: string | number;
      action?: string;
      answer?: string;
      confidence?: number;
    };

    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId));
    if (!course || course.userId !== req.userId!) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

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
      if (step.courseId !== courseId) {
        res.status(400).json({ error: "Step does not belong to this course" });
        return;
      }

      // Confidence is required to grade — every graded answer must carry an honest
      // self-rating, otherwise the calibration signal would be built on partial data.
      const conf =
        typeof confidence === "number" && Number.isFinite(confidence)
          ? Math.max(0, Math.min(100, Math.round(confidence)))
          : null;
      if (conf === null) {
        res.status(400).json({ error: "confidence (0-100) is required to grade an answer" });
        return;
      }

      const qd = step.questionData as Record<string, unknown>;
      const correctAnswer = String(qd.correctAnswer || "").toLowerCase().trim();
      const userAnswer = String(answer || "").toLowerCase().trim();
      correct = userAnswer === correctAnswer || userAnswer.includes(correctAnswer) || correctAnswer.includes(userAnswer);
      explanation = String(qd.explanation || "");
      xpEarned = correct ? (step.xpReward || 10) : 0;

      // Keep the readiness aggregate and the honest per-answer event in lockstep —
      // an aggregate increment without its matching calibration event would let the
      // learner model lie. Every attempt is recorded (retries are genuine signal,
      // and each wrong retry correctly lowers accuracy).
      const isCorrect = correct;
      const earned = xpEarned;
      await db.transaction(async (tx) => {
        await tx.update(courseProgressTable).set({
          correctAnswers: progress.correctAnswers + (isCorrect ? 1 : 0),
          incorrectAnswers: progress.incorrectAnswers + (isCorrect ? 0 : 1),
          totalXp: progress.totalXp + earned,
        }).where(eq(courseProgressTable.id, progress.id));

        await tx.insert(answerEventsTable).values({
          userId: req.userId!,
          courseId,
          stepId: Number(stepId),
          isCorrect,
          confidence: conf,
        });
      });

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
