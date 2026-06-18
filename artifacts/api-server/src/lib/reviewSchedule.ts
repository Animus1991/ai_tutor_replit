import type { db } from "@workspace/db";
import { reviewSchedulesTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import {
  type ReviewRating,
  applyReviewRating,
  computeInitialSchedule,
} from "./fsrs";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function upsertReviewScheduleFromQuiz(
  tx: Tx,
  userId: string,
  courseId: number,
  conceptId: number,
  isCorrect: boolean,
): Promise<void> {
  const [existing] = await tx
    .select()
    .from(reviewSchedulesTable)
    .where(
      and(
        eq(reviewSchedulesTable.userId, userId),
        eq(reviewSchedulesTable.conceptId, conceptId),
      ),
    );

  const implicitRating: ReviewRating = isCorrect ? "good" : "again";

  if (!existing) {
    const initial = computeInitialSchedule(isCorrect);
    await tx.insert(reviewSchedulesTable).values({
      userId,
      courseId,
      conceptId,
      dueAt: initial.dueAt,
      stabilityDays: initial.stabilityDays,
      difficulty: initial.difficulty,
      lastRating: implicitRating,
      lastReviewedAt: new Date(),
      reviewCount: 1,
      lapseCount: isCorrect ? 0 : 1,
      retrievability: isCorrect ? 0.9 : 0.5,
    });
    return;
  }

  const updated = applyReviewRating(implicitRating, {
    stabilityDays: existing.stabilityDays,
    difficulty: existing.difficulty,
    reviewCount: existing.reviewCount,
    lapseCount: existing.lapseCount,
  });

  await tx
    .update(reviewSchedulesTable)
    .set({
      dueAt: updated.dueAt,
      stabilityDays: updated.stabilityDays,
      difficulty: updated.difficulty,
      lastRating: updated.lastRating,
      lastReviewedAt: new Date(),
      reviewCount: updated.reviewCount,
      lapseCount: updated.lapseCount,
      retrievability: updated.retrievability,
    })
    .where(eq(reviewSchedulesTable.id, existing.id));
}

export async function applyExplicitReview(
  tx: Tx,
  userId: string,
  conceptId: number,
  rating: ReviewRating,
): Promise<{ dueAt: Date; stabilityDays: number } | null> {
  const [existing] = await tx
    .select()
    .from(reviewSchedulesTable)
    .where(
      and(
        eq(reviewSchedulesTable.userId, userId),
        eq(reviewSchedulesTable.conceptId, conceptId),
      ),
    );

  if (!existing) return null;

  const updated = applyReviewRating(rating, {
    stabilityDays: existing.stabilityDays,
    difficulty: existing.difficulty,
    reviewCount: existing.reviewCount,
    lapseCount: existing.lapseCount,
  });

  await tx
    .update(reviewSchedulesTable)
    .set({
      dueAt: updated.dueAt,
      stabilityDays: updated.stabilityDays,
      difficulty: updated.difficulty,
      lastRating: updated.lastRating,
      lastReviewedAt: new Date(),
      reviewCount: updated.reviewCount,
      lapseCount: updated.lapseCount,
      retrievability: updated.retrievability,
    })
    .where(eq(reviewSchedulesTable.id, existing.id));

  return { dueAt: updated.dueAt, stabilityDays: updated.stabilityDays };
}
