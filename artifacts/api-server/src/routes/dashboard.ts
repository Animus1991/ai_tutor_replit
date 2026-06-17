import { Router } from "express";
import { db } from "@workspace/db";
import {
  notesTable, coursesTable, courseProgressTable,
  activityLogTable, learningProfilesTable
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
      aiStyleLabel: profile.aiInferredStyle,
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

router.get("/dashboard/learning-style", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const profile = await getOrCreateProfile(userId);

    const allProgress = await db
      .select()
      .from(courseProgressTable)
      .where(eq(courseProgressTable.userId, userId));

    const dataPointsCollected = allProgress.reduce((sum, p) => sum + p.correctAnswers + p.incorrectAnswers + p.hintsUsed, 0);

    let inferredStyle: string | null = profile.aiInferredStyle;
    let confidence = profile.aiStyleConfidence ?? 0;
    const strengths: string[] = [];
    const recommendations: string[] = [];

    const totalCorrect = allProgress.reduce((sum, p) => sum + p.correctAnswers, 0);
    const totalIncorrect = allProgress.reduce((sum, p) => sum + p.incorrectAnswers, 0);
    const totalHints = allProgress.reduce((sum, p) => sum + p.hintsUsed, 0);

    if (dataPointsCollected >= 5) {
      const accuracy = totalCorrect + totalIncorrect > 0 ? totalCorrect / (totalCorrect + totalIncorrect) : 0;
      const hintRate = totalCorrect + totalIncorrect > 0 ? totalHints / (totalCorrect + totalIncorrect) : 0;

      if (accuracy > 0.8 && hintRate < 0.2) {
        inferredStyle = "analytical-independent";
        confidence = Math.min(0.9, 0.5 + dataPointsCollected * 0.02);
        strengths.push("High accuracy with minimal help needed", "Strong independent problem-solving");
        recommendations.push("Try harder difficulty levels for more challenge", "Advanced courses with complex concepts will suit you well");
      } else if (accuracy < 0.6 && hintRate > 0.4) {
        inferredStyle = "guided-learner";
        confidence = Math.min(0.85, 0.4 + dataPointsCollected * 0.02);
        strengths.push("Effective use of available support", "Persistence through challenges");
        recommendations.push("Increase hint frequency in settings", "Consider slower-paced courses with more repetition");
      } else {
        inferredStyle = "balanced-explorer";
        confidence = Math.min(0.75, 0.3 + dataPointsCollected * 0.02);
        strengths.push("Balanced approach to learning", "Adaptable to different content types");
        recommendations.push("Try the adaptive settings to let the AI fine-tune your experience", "Mix theoretical and practical courses for best results");
      }

      if (strengths.length === 0) {
        strengths.push("Keep learning to unlock your style insights");
        recommendations.push("Complete more lessons to help the AI learn your style");
      }

      await db.update(learningProfilesTable).set({
        aiInferredStyle: inferredStyle,
        aiStyleConfidence: confidence,
        updatedAt: new Date(),
      }).where(eq(learningProfilesTable.userId, userId)).catch(() => {});
    } else {
      strengths.push("Keep learning to unlock your personalized insights");
      recommendations.push("Complete more lessons — your learning style will emerge after a few sessions");
    }

    const nextInsightAt = Math.max(0, 5 - dataPointsCollected);

    res.json({
      inferredStyle,
      confidence,
      strengths,
      recommendations,
      dataPointsCollected,
      nextInsightAt,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get learning style");
    res.status(500).json({ error: "Failed to get learning style" });
  }
});

export default router;
