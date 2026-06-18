import { describe, expect, it } from "vitest";
import { applyReviewRating, computeInitialSchedule } from "./fsrs";

describe("FSRS scheduling", () => {
  it("computeInitialSchedule schedules sooner after incorrect first attempt", () => {
    const correct = computeInitialSchedule(true);
    const incorrect = computeInitialSchedule(false);
    expect(incorrect.stabilityDays).toBeLessThan(correct.stabilityDays);
  });

  it("applyReviewRating extends interval on good rating", () => {
    const base = {
      stabilityDays: 2,
      difficulty: 5,
      reviewCount: 3,
      lapseCount: 0,
    };
    const result = applyReviewRating("good", base);
    expect(result.stabilityDays).toBeGreaterThan(base.stabilityDays);
    expect(result.reviewCount).toBe(base.reviewCount + 1);
  });

  it("applyReviewRating shrinks interval on again", () => {
    const base = {
      stabilityDays: 2,
      difficulty: 5,
      reviewCount: 3,
      lapseCount: 0,
    };
    const result = applyReviewRating("again", base);
    expect(result.stabilityDays).toBeLessThan(base.stabilityDays);
    expect(result.lapseCount).toBe(base.lapseCount + 1);
  });

  it("applyReviewRating extends more on easy than good", () => {
    const base = {
      stabilityDays: 2,
      difficulty: 5,
      reviewCount: 3,
      lapseCount: 0,
    };
    const good = applyReviewRating("good", base);
    const easy = applyReviewRating("easy", base);
    expect(easy.stabilityDays).toBeGreaterThan(good.stabilityDays);
  });
});
