import { Router } from "express";
import { db } from "@workspace/db";
import {
  notesTable, coursesTable, courseProgressTable,
  activityLogTable, learningProfilesTable, answerEventsTable
} from "@workspace/db";
import { eq, and, gte, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "./auth";
import { getOrCreateProfile } from "./profile";

const router = Router();

router.get("/dashboard", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const profile = await getOrCreateProfile(userId);

    const notes = await db.select().from(notesTable).where(eq(notesTable.userId, userId));
    const courses = await db.select().from(coursesTable).where(eq(coursesTable.userId, userId));

    const allProgress = await db
      .select()
      .from(courseProgressTable)
      .where(eq(courseProgressTable.userId, userId));

    const completedCourses = allProgress.filter(p => p.completedAt !== null).length;
    const inProgressCourses = allProgress.filter(p => !p.completedAt && p.currentStepPosition > 0).length;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyActivity = await db
      .select()
      .from(activityLogTable)
      .where(and(
        eq(activityLogTable.userId, userId),
        gte(activityLogTable.createdAt, oneWeekAgo)
      ));
    const weeklyXp = weeklyActivity.reduce((sum, a) => sum + (a.xpEarned || 0), 0);

    const totalQuestions = profile.completedCourses > 0 
      ? allProgress.reduce((sum, p) => sum + p.correctAnswers + p.incorrectAnswers, 0) : 0;
    const totalCorrect = allProgress.reduce((sum, p) => sum + p.correctAnswers, 0);
    const averageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    const recentCourses = courses
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);

    res.json({
      totalNotes: notes.length,
      totalCourses: courses.length,
      completedCourses,
      inProgressCourses,
      totalXp: profile.totalXp,
      currentStreak: profile.currentStreak,
      weeklyXp,
      averageScore,
      recentCourses,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard");
    res.status(500).json({ error: "Failed to get dashboard" });
  }
});

router.get("/dashboard/activity", requireAuth, async (req: AuthRequest, res) => {
  try {
    const activities = await db
      .select()
      .from(activityLogTable)
      .where(eq(activityLogTable.userId, req.userId!))
      .orderBy(activityLogTable.createdAt)
      .limit(20);
    res.json(activities.reverse());
  } catch (err) {
    req.log.error({ err }, "Failed to get activity");
    res.status(500).json({ error: "Failed to get activity" });
  }
});

router.get("/dashboard/learner-model", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const profile = await getOrCreateProfile(userId);

    const allProgress = await db
      .select()
      .from(courseProgressTable)
      .where(eq(courseProgressTable.userId, userId));

    const totalCorrect = allProgress.reduce((sum, p) => sum + p.correctAnswers, 0);
    const totalIncorrect = allProgress.reduce((sum, p) => sum + p.incorrectAnswers, 0);
    const totalHints = allProgress.reduce((sum, p) => sum + p.hintsUsed, 0);
    const answered = totalCorrect + totalIncorrect;
    const dataPointsCollected = answered + totalHints;

    const MIN_GRADED = 5;
    const strengths: string[] = [];
    const focusAreas: string[] = [];
    const signals: { label: string; score: number; detail: string }[] = [];

    let examReadiness: number | null = null;
    let masteryLevel: string | null = null;
    let confidence = profile.readinessConfidence ?? 0;
    let accuracyPct = 0;
    let selfReliancePct = 0;

    if (answered >= MIN_GRADED) {
      const accuracy = totalCorrect / answered;
      const hintRate = totalHints / answered;
      const selfReliance = Math.max(0, 1 - hintRate);
      accuracyPct = Math.round(accuracy * 100);
      selfReliancePct = Math.round(selfReliance * 100);

      // Exam readiness = mostly mastery, partly the ability to perform unaided (no hints in an exam)
      examReadiness = Math.round(100 * (0.7 * accuracy + 0.3 * selfReliance));
      confidence = Math.min(0.95, 0.4 + answered * 0.03);
      masteryLevel = accuracy >= 0.8 ? "strong" : accuracy >= 0.6 ? "proficient" : "developing";

      signals.push({
        label: "Concept mastery",
        score: accuracyPct,
        detail: `${totalCorrect}/${answered} questions answered correctly`,
      });
      signals.push({
        label: "Exam self-reliance",
        score: selfReliancePct,
        detail:
          hintRate > 0.4
            ? "You lean on hints often — the exam has none"
            : hintRate > 0.2
              ? "Moderate hint use — keep weaning off"
              : "You solve most questions unaided",
      });
      signals.push({
        label: "Practice volume",
        score: Math.min(100, Math.round((answered / 30) * 100)),
        detail: `${answered} graded questions answered · ${totalHints} hints used`,
      });

      if (accuracy >= 0.8) strengths.push("Strong command of the material — high answer accuracy");
      else if (accuracy >= 0.6) strengths.push("Solid grasp of the core concepts");
      if (selfReliance >= 0.8) strengths.push("Solves problems independently — an exam-ready habit");

      if (accuracy < 0.6) focusAreas.push("Reinforce core concepts — accuracy is below exam-safe level");
      if (hintRate > 0.4) focusAreas.push("Practice without hints to mirror exam conditions");
      if (examReadiness < 70) focusAreas.push("Keep practicing to push readiness past 70%");

      if (strengths.length === 0) strengths.push("Building momentum — keep going");
      if (focusAreas.length === 0) focusAreas.push("Stretch yourself with harder material to deepen mastery");

      const modelNotes =
        masteryLevel === "strong"
          ? "Tracking well — sharpen weak spots and simulate exam conditions."
          : masteryLevel === "proficient"
            ? "Solid foundation — targeted practice on weak areas will lift readiness."
            : "Early stage — focus on understanding core concepts before speed.";

      await db
        .update(learningProfilesTable)
        .set({
          examReadinessScore: examReadiness,
          masteryLevel,
          readinessConfidence: confidence,
          learnerModelNotes: modelNotes,
          updatedAt: new Date(),
        })
        .where(eq(learningProfilesTable.userId, userId))
        .catch(() => {});
    } else {
      strengths.push("Your readiness profile builds as you answer graded questions");
      focusAreas.push("Complete a few graded questions to unlock your exam-readiness score");
    }

    // ─── Confidence calibration ─────────────────────────────────────────────
    // How well the learner's self-rated confidence matches their real accuracy.
    // Computed from the honest per-answer event log, independent of the readiness gate.
    const MIN_CALIBRATION = 5;
    const events = await db
      .select()
      .from(answerEventsTable)
      .where(eq(answerEventsTable.userId, userId));

    let calibration:
      | { score: number; direction: string; avgConfidence: number; sampleSize: number }
      | null = null;

    if (events.length >= MIN_CALIBRATION) {
      const n = events.length;
      const avgConfidence = events.reduce((s, e) => s + e.confidence, 0) / n / 100;
      const calibAccuracy = events.reduce((s, e) => s + (e.isCorrect ? 1 : 0), 0) / n;
      const gap = avgConfidence - calibAccuracy; // >0 overconfident, <0 underconfident
      const score = Math.round((1 - Math.min(1, Math.abs(gap))) * 100);
      const direction = gap > 0.1 ? "overconfident" : gap < -0.1 ? "underconfident" : "calibrated";
      calibration = { score, direction, avgConfidence: Math.round(avgConfidence * 100), sampleSize: n };

      if (answered >= MIN_GRADED) {
        if (direction === "overconfident") {
          focusAreas.push("Slow down on questions you feel sure about — that's where overconfidence hides mistakes");
        } else if (direction === "underconfident") {
          strengths.push("You underrate yourself — you often get right what you doubt");
        } else {
          strengths.push("Well-calibrated confidence — you reliably know what you know");
        }
      }
    }

    const nextInsightAt = Math.max(0, MIN_GRADED - answered);

    res.json({
      examReadiness,
      masteryLevel,
      confidence,
      calibration,
      accuracy: accuracyPct,
      selfReliance: selfReliancePct,
      signals,
      strengths,
      focusAreas,
      dataPointsCollected,
      nextInsightAt,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get learner model");
    res.status(500).json({ error: "Failed to get learner model" });
  }
});

export default router;
