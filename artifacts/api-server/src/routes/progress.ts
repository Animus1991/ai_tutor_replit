import { db } from "@workspace/db";
import {
  activityLogTable,
  answerEventsTable,
  courseProgressTable,
  coursesTable,
  learningProfilesTable,
  lessonStepConceptsTable,
  lessonStepsTable,
  masteryRecordsTable,
  mistakesTable,
} from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import { Router } from "express";
import { upsertReviewScheduleFromQuiz } from "../lib/reviewSchedule";
import { type AuthRequest, requireAuth } from "./auth";

const router = Router();

router.get(
  "/courses/:courseId/progress",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const courseId = Number.parseInt(req.params.courseId as string);
      let [progress] = await db
        .select()
        .from(courseProgressTable)
        .where(
          and(
            eq(courseProgressTable.courseId, courseId),
            eq(courseProgressTable.userId, req.userId!),
          ),
        );

      if (!progress) {
        [progress] = await db
          .insert(courseProgressTable)
          .values({ userId: req.userId!, courseId, startedAt: new Date() })
          .returning();
      }

      const steps = await db
        .select()
        .from(lessonStepsTable)
        .where(eq(lessonStepsTable.courseId, courseId));
      const totalSteps = steps.length;
      const completedIds = (progress.completedStepIds as number[]) || [];
      const percentComplete =
        totalSteps > 0
          ? Math.round((completedIds.length / totalSteps) * 100)
          : 0;

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
  },
);

router.post(
  "/courses/:courseId/progress",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const courseId = Number.parseInt(req.params.courseId as string);
      const { stepId, action, answer, confidence } = req.body as {
        stepId?: string | number;
        action?: string;
        answer?: string;
        confidence?: number;
      };

      const [course] = await db
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.id, courseId));
      if (!course || course.userId !== req.userId!) {
        res.status(404).json({ error: "Course not found" });
        return;
      }

      let [progress] = await db
        .select()
        .from(courseProgressTable)
        .where(
          and(
            eq(courseProgressTable.courseId, courseId),
            eq(courseProgressTable.userId, req.userId!),
          ),
        );

      if (!progress) {
        [progress] = await db
          .insert(courseProgressTable)
          .values({ userId: req.userId!, courseId, startedAt: new Date() })
          .returning();
      }

      const [step] = stepId
        ? await db
            .select()
            .from(lessonStepsTable)
            .where(eq(lessonStepsTable.id, Number(stepId)))
        : [];
      const completedIds = (progress.completedStepIds as number[]) || [];

      let correct: boolean | null = null;
      let explanation: string | null = null;
      let xpEarned = 0;
      let adaptationNote: string | null = null;

      if (action === "submit_answer" && step?.questionData) {
        if (step.courseId !== courseId) {
          res
            .status(400)
            .json({ error: "Step does not belong to this course" });
          return;
        }

        // Confidence is required to grade — every graded answer must carry an honest
        // self-rating, otherwise the calibration signal would be built on partial data.
        const conf =
          typeof confidence === "number" && Number.isFinite(confidence)
            ? Math.max(0, Math.min(100, Math.round(confidence)))
            : null;
        if (conf === null) {
          res.status(400).json({
            error: "confidence (0-100) is required to grade an answer",
          });
          return;
        }

        const qd = step.questionData as Record<string, unknown>;
        const correctAnswer = String(qd.correctAnswer || "")
          .toLowerCase()
          .trim();
        const userAnswer = String(answer || "")
          .toLowerCase()
          .trim();
        correct =
          userAnswer === correctAnswer ||
          userAnswer.includes(correctAnswer) ||
          correctAnswer.includes(userAnswer);
        explanation = String(qd.explanation || "");
        xpEarned = correct ? step.xpReward || 10 : 0;

        // Keep the readiness aggregate and the honest per-answer event in lockstep —
        // an aggregate increment without its matching calibration event would let the
        // learner model lie. Every attempt is recorded (retries are genuine signal,
        // and each wrong retry correctly lowers accuracy).
        const isCorrect = correct;
        const earned = xpEarned;

        // Difficulty weight scales how much each first attempt moves mastery:
        // harder material is stronger evidence of (in)competence.
        const diffWeightMap: Record<string, number> = {
          beginner: 0.8,
          easy: 0.8,
          intermediate: 1.0,
          medium: 1.0,
          advanced: 1.2,
          hard: 1.2,
          expert: 1.2,
        };
        const diffWeight =
          diffWeightMap[(course.difficulty || "intermediate").toLowerCase()] ??
          1.0;

        await db.transaction(async (tx) => {
          // Serialize concurrent submissions for this (user, course) on the progress
          // row, so first-attempt detection and the accuracy aggregate can't race.
          await tx
            .select({ id: courseProgressTable.id })
            .from(courseProgressTable)
            .where(eq(courseProgressTable.id, progress.id))
            .for("update");

          // Atomic counter increments — never write back stale in-memory values, or
          // concurrent submissions could clobber each other's accuracy aggregate.
          await tx
            .update(courseProgressTable)
            .set({
              correctAnswers: sql`${courseProgressTable.correctAnswers} + ${isCorrect ? 1 : 0}`,
              incorrectAnswers: sql`${courseProgressTable.incorrectAnswers} + ${isCorrect ? 0 : 1}`,
              totalXp: sql`${courseProgressTable.totalXp} + ${earned}`,
            })
            .where(eq(courseProgressTable.id, progress.id));

          // First attempt per (user, step)? Determined BEFORE inserting this event so
          // mastery counts FIRST attempts only — retries (which the lesson player
          // allows) can never inflate it, while answer_events still records every
          // attempt for honest accuracy. The is_first_attempt column carries a partial
          // unique index on (user, step) as a durable DB-level backstop.
          const priorEvents = await tx
            .select({ id: answerEventsTable.id })
            .from(answerEventsTable)
            .where(
              and(
                eq(answerEventsTable.userId, req.userId!),
                eq(answerEventsTable.stepId, Number(stepId)),
              ),
            );
          const isFirstAttempt = priorEvents.length === 0;

          const [event] = await tx
            .insert(answerEventsTable)
            .values({
              userId: req.userId!,
              courseId,
              stepId: Number(stepId),
              isCorrect,
              confidence: conf,
              isFirstAttempt,
            })
            .returning();

          const stepConcepts = await tx
            .select({
              conceptId: lessonStepConceptsTable.conceptId,
              weight: lessonStepConceptsTable.weight,
            })
            .from(lessonStepConceptsTable)
            .where(eq(lessonStepConceptsTable.stepId, Number(stepId)));

          if (isFirstAttempt && stepConcepts.length > 0) {
            // Beta-binomial evidence accumulation per concept. Evidence for a step is
            // split across the concepts it assesses so a multi-concept question is not
            // double-counted.
            const numConcepts = stepConcepts.length;
            for (const sc of stepConcepts) {
              const w = (diffWeight * (sc.weight ?? 1)) / numConcepts;
              const correctEv = isCorrect ? w : 0;
              const incorrectEv = isCorrect ? 0 : w;

              const [existing] = await tx
                .select()
                .from(masteryRecordsTable)
                .where(
                  and(
                    eq(masteryRecordsTable.userId, req.userId!),
                    eq(masteryRecordsTable.conceptId, sc.conceptId),
                  ),
                );

              const alpha = (existing?.alpha ?? 2) + correctEv;
              const beta = (existing?.beta ?? 2) + incorrectEv;
              const firstAttempts = (existing?.firstAttempts ?? 0) + 1;
              const mastery = alpha / (alpha + beta);
              const masteryConfidence = Math.min(1, firstAttempts / 5);
              const correctEvidence =
                (existing?.correctEvidence ?? 0) + correctEv;
              const incorrectEvidence =
                (existing?.incorrectEvidence ?? 0) + incorrectEv;

              if (existing) {
                await tx
                  .update(masteryRecordsTable)
                  .set({
                    alpha,
                    beta,
                    firstAttempts,
                    correctEvidence,
                    incorrectEvidence,
                    mastery,
                    confidence: masteryConfidence,
                    updatedAt: new Date(),
                  })
                  .where(eq(masteryRecordsTable.id, existing.id));
              } else {
                await tx.insert(masteryRecordsTable).values({
                  userId: req.userId!,
                  courseId,
                  conceptId: sc.conceptId,
                  alpha,
                  beta,
                  firstAttempts,
                  correctEvidence,
                  incorrectEvidence,
                  mastery,
                  confidence: masteryConfidence,
                });
              }

              await upsertReviewScheduleFromQuiz(
                tx,
                req.userId!,
                courseId,
                sc.conceptId,
                isCorrect,
              );
            }
          }

          // Mistakes feed the "retry your mistakes" queue: open one on a wrong first
          // attempt, and resolve any open ones on the step when later answered correctly.
          if (isCorrect) {
            await tx
              .update(mistakesTable)
              .set({ status: "resolved", resolvedAt: new Date() })
              .where(
                and(
                  eq(mistakesTable.userId, req.userId!),
                  eq(mistakesTable.stepId, Number(stepId)),
                  eq(mistakesTable.status, "open"),
                ),
              );
          } else if (isFirstAttempt) {
            await tx.insert(mistakesTable).values({
              userId: req.userId!,
              courseId,
              stepId: Number(stepId),
              answerEventId: event?.id ?? null,
              conceptId: stepConcepts[0]?.conceptId ?? null,
              status: "open",
            });
          }
        });

        if (!correct && (progress.incorrectAnswers + 1) % 3 === 0) {
          adaptationNote =
            "Your AI tutor noticed you might benefit from reviewing this topic. Try the explain feature for a deeper explanation.";
        }
      } else if (action === "use_hint") {
        await db
          .update(courseProgressTable)
          .set({ hintsUsed: progress.hintsUsed + 1 })
          .where(eq(courseProgressTable.id, progress.id));
      } else if (action === "advance" || action === "complete") {
        if (stepId && !completedIds.includes(Number(stepId))) {
          completedIds.push(Number(stepId));
          xpEarned = step?.xpReward || 10;

          await db
            .update(courseProgressTable)
            .set({
              completedStepIds: completedIds,
              currentStepPosition:
                (step?.position || progress.currentStepPosition) + 1,
              totalXp: progress.totalXp + xpEarned,
            })
            .where(eq(courseProgressTable.id, progress.id));

          await db
            .insert(activityLogTable)
            .values({
              userId: req.userId!,
              activityType: "step_completed",
              description: "Completed a lesson step",
              xpEarned,
              courseId,
            })
            .catch(() => {});
        }
      }

      const allSteps = await db
        .select()
        .from(lessonStepsTable)
        .where(eq(lessonStepsTable.courseId, courseId));
      const [freshProgress] = await db
        .select()
        .from(courseProgressTable)
        .where(eq(courseProgressTable.id, progress.id));
      const updatedCompleted =
        (freshProgress?.completedStepIds as number[]) || [];
      const percentComplete =
        allSteps.length > 0
          ? Math.round((updatedCompleted.length / allSteps.length) * 100)
          : 0;

      if (percentComplete === 100 && !freshProgress?.completedAt) {
        await db
          .update(courseProgressTable)
          .set({ completedAt: new Date() })
          .where(eq(courseProgressTable.id, progress.id));
        await db
          .update(learningProfilesTable)
          .set({ completedCourses: 1, lastActiveAt: new Date() })
          .where(eq(learningProfilesTable.userId, req.userId!))
          .catch(() => {});
        await db
          .insert(activityLogTable)
          .values({
            userId: req.userId!,
            activityType: "course_completed",
            description: `Completed course: ${course?.title || "Unknown"}`,
            xpEarned: 100,
            courseId,
            courseTitle: course?.title || null,
          })
          .catch(() => {});
      }

      res.json({
        correct,
        explanation,
        xpEarned,
        adaptationNote,
        progress: {
          courseId,
          currentStepPosition:
            freshProgress?.currentStepPosition ?? progress.currentStepPosition,
          completedStepIds: updatedCompleted,
          totalXp: freshProgress?.totalXp ?? progress.totalXp,
          correctAnswers:
            freshProgress?.correctAnswers ?? progress.correctAnswers,
          incorrectAnswers:
            freshProgress?.incorrectAnswers ?? progress.incorrectAnswers,
          hintsUsed: freshProgress?.hintsUsed ?? progress.hintsUsed,
          startedAt: freshProgress?.startedAt,
          completedAt: freshProgress?.completedAt,
          percentComplete,
        },
      });
    } catch (err) {
      req.log.error({ err }, "Failed to update progress");
      res.status(500).json({ error: "Failed to update progress" });
    }
  },
);

export default router;
