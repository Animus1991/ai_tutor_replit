import { db } from "@workspace/db";
import {
  conceptsTable,
  coursesTable,
  lessonStepsTable,
  masteryRecordsTable,
  mistakesTable,
  reviewSchedulesTable,
} from "@workspace/db";
import { and, eq, lte, sql } from "drizzle-orm";
import { Router } from "express";
import type { ReviewRating } from "../lib/fsrs";
import { applyExplicitReview } from "../lib/reviewSchedule";
import { type AuthRequest, requireAuth } from "./auth";

const router = Router();
const VALID_RATINGS = new Set<ReviewRating>(["again", "hard", "good", "easy"]);

router.get("/tasks", requireAuth, async (req: AuthRequest, res) => {
  try {
    const now = new Date();
    const userId = req.userId!;

    const dueReviews = await db
      .select({
        conceptId: reviewSchedulesTable.conceptId,
        courseId: reviewSchedulesTable.courseId,
        dueAt: reviewSchedulesTable.dueAt,
        stabilityDays: reviewSchedulesTable.stabilityDays,
        difficulty: reviewSchedulesTable.difficulty,
        reviewCount: reviewSchedulesTable.reviewCount,
        retrievability: reviewSchedulesTable.retrievability,
        conceptTitle: conceptsTable.title,
        conceptDescription: conceptsTable.description,
        courseTitle: coursesTable.title,
        mastery: masteryRecordsTable.mastery,
      })
      .from(reviewSchedulesTable)
      .innerJoin(
        conceptsTable,
        eq(reviewSchedulesTable.conceptId, conceptsTable.id),
      )
      .innerJoin(
        coursesTable,
        eq(reviewSchedulesTable.courseId, coursesTable.id),
      )
      .leftJoin(
        masteryRecordsTable,
        and(
          eq(masteryRecordsTable.userId, userId),
          eq(masteryRecordsTable.conceptId, reviewSchedulesTable.conceptId),
        ),
      )
      .where(
        and(
          eq(reviewSchedulesTable.userId, userId),
          lte(reviewSchedulesTable.dueAt, now),
        ),
      )
      .orderBy(reviewSchedulesTable.dueAt);

    const openMistakes = await db
      .select({
        id: mistakesTable.id,
        courseId: mistakesTable.courseId,
        stepId: mistakesTable.stepId,
        conceptId: mistakesTable.conceptId,
        createdAt: mistakesTable.createdAt,
        stepTitle: lessonStepsTable.title,
        stepType: lessonStepsTable.stepType,
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
      .where(
        and(eq(mistakesTable.userId, userId), eq(mistakesTable.status, "open")),
      )
      .orderBy(mistakesTable.createdAt);

    const overdueCount = dueReviews.length + openMistakes.length;

    res.json({
      overdueCount,
      reviews: dueReviews.map((r) => ({
        conceptId: r.conceptId,
        courseId: r.courseId,
        conceptTitle: r.conceptTitle,
        conceptDescription: r.conceptDescription,
        courseTitle: r.courseTitle,
        dueAt: r.dueAt,
        stabilityDays: r.stabilityDays,
        difficulty: r.difficulty,
        reviewCount: r.reviewCount,
        retrievability: Math.round((r.retrievability ?? 0) * 100),
        mastery: r.mastery != null ? Math.round(r.mastery * 100) : null,
        isOverdue: true,
      })),
      mistakes: openMistakes.map((m) => ({
        id: m.id,
        courseId: m.courseId,
        stepId: m.stepId,
        conceptId: m.conceptId,
        stepTitle: m.stepTitle,
        stepType: m.stepType,
        courseTitle: m.courseTitle,
        conceptTitle: m.conceptTitle,
        createdAt: m.createdAt,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list tasks");
    res.status(500).json({ error: "Failed to list tasks" });
  }
});

router.get("/tasks/count", requireAuth, async (req: AuthRequest, res) => {
  try {
    const now = new Date();
    const userId = req.userId!;

    const [reviewRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reviewSchedulesTable)
      .where(
        and(
          eq(reviewSchedulesTable.userId, userId),
          lte(reviewSchedulesTable.dueAt, now),
        ),
      );

    const [mistakeRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(mistakesTable)
      .where(
        and(eq(mistakesTable.userId, userId), eq(mistakesTable.status, "open")),
      );

    res.json({ count: (reviewRow?.count ?? 0) + (mistakeRow?.count ?? 0) });
  } catch (err) {
    req.log.error({ err }, "Failed to count tasks");
    res.status(500).json({ error: "Failed to count tasks" });
  }
});

router.post(
  "/tasks/:conceptId/review",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const conceptId = Number.parseInt(req.params.conceptId as string);
      const { rating } = req.body as { rating?: string };

      if (!rating || !VALID_RATINGS.has(rating as ReviewRating)) {
        res
          .status(400)
          .json({ error: "rating must be one of: again, hard, good, easy" });
        return;
      }

      const [concept] = await db
        .select()
        .from(conceptsTable)
        .where(
          and(
            eq(conceptsTable.id, conceptId),
            eq(conceptsTable.userId, req.userId!),
          ),
        );
      if (!concept) {
        res.status(404).json({ error: "Concept not found" });
        return;
      }

      const result = await db.transaction(async (tx) => {
        const updated = await applyExplicitReview(
          tx,
          req.userId!,
          conceptId,
          rating as ReviewRating,
        );
        if (!updated) return null;

        const evidenceDelta =
          rating === "easy"
            ? 0.3
            : rating === "good"
              ? 0.15
              : rating === "hard"
                ? 0.05
                : 0;
        if (evidenceDelta > 0) {
          const [mastery] = await tx
            .select()
            .from(masteryRecordsTable)
            .where(
              and(
                eq(masteryRecordsTable.userId, req.userId!),
                eq(masteryRecordsTable.conceptId, conceptId),
              ),
            );
          if (mastery) {
            const alpha = mastery.alpha + evidenceDelta;
            const masteryVal = alpha / (alpha + mastery.beta);
            await tx
              .update(masteryRecordsTable)
              .set({
                alpha,
                mastery: masteryVal,
                updatedAt: new Date(),
              })
              .where(eq(masteryRecordsTable.id, mastery.id));
          }
        }

        return updated;
      });

      if (!result) {
        res
          .status(404)
          .json({ error: "No review schedule found for this concept" });
        return;
      }

      res.json({
        conceptId,
        rating,
        dueAt: result.dueAt,
        stabilityDays: result.stabilityDays,
      });
    } catch (err) {
      req.log.error({ err }, "Failed to submit review");
      res.status(500).json({ error: "Failed to submit review" });
    }
  },
);

export default router;
