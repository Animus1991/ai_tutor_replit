export type ReviewRating = "again" | "hard" | "good" | "easy";

const MIN_STABILITY = 0.1;
const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 10;

export interface ReviewState {
  stabilityDays: number;
  difficulty: number;
  reviewCount: number;
  lapseCount: number;
}

export interface ReviewUpdate extends ReviewState {
  dueAt: Date;
  retrievability: number;
  lastRating: ReviewRating;
}

/** Initial schedule after a graded first attempt on a concept-linked quiz step. */
export function computeInitialSchedule(
  isCorrect: boolean,
): Pick<ReviewUpdate, "stabilityDays" | "difficulty" | "dueAt"> {
  const stabilityDays = isCorrect ? 1 : 0.25;
  const difficulty = isCorrect ? 5 : 6.5;
  const dueAt = new Date(Date.now() + stabilityDays * 86_400_000);
  return { stabilityDays, difficulty, dueAt };
}

/** FSRS-lite interval update after an explicit recall review rating. */
export function applyReviewRating(
  rating: ReviewRating,
  current: ReviewState,
): ReviewUpdate {
  const ratingFactors: Record<
    ReviewRating,
    { stabilityMult: number; diffDelta: number }
  > = {
    again: { stabilityMult: 0.35, diffDelta: 1.0 },
    hard: { stabilityMult: 1.15, diffDelta: 0.4 },
    good: { stabilityMult: 2.4, diffDelta: -0.15 },
    easy: { stabilityMult: 3.8, diffDelta: -0.45 },
  };

  let lapseCount = current.lapseCount;
  let stabilityDays = current.stabilityDays;
  let difficulty = current.difficulty;

  if (rating === "again") {
    lapseCount += 1;
    stabilityDays = Math.max(
      MIN_STABILITY,
      current.stabilityDays * ratingFactors.again.stabilityMult,
    );
    difficulty = Math.min(
      MAX_DIFFICULTY,
      current.difficulty + ratingFactors.again.diffDelta,
    );
  } else {
    const factor = ratingFactors[rating];
    const experienceBoost = 1 + Math.min(current.reviewCount, 10) * 0.05;
    stabilityDays = Math.max(
      MIN_STABILITY,
      current.stabilityDays * factor.stabilityMult * experienceBoost,
    );
    difficulty = Math.max(
      MIN_DIFFICULTY,
      Math.min(MAX_DIFFICULTY, current.difficulty + factor.diffDelta),
    );
  }

  const dueAt = new Date(Date.now() + stabilityDays * 86_400_000);
  const retrievability = Math.exp(-1 / Math.max(stabilityDays, MIN_STABILITY));

  return {
    stabilityDays,
    difficulty,
    lapseCount,
    reviewCount: current.reviewCount + 1,
    dueAt,
    retrievability,
    lastRating: rating,
  };
}
