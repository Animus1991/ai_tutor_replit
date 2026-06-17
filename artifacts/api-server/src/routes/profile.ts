import { Router } from "express";
import { db } from "@workspace/db";
import { learningProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "./auth";

const router = Router();

async function getOrCreateProfile(userId: string) {
  let [profile] = await db
    .select()
    .from(learningProfilesTable)
    .where(eq(learningProfilesTable.userId, userId));
  if (!profile) {
    [profile] = await db
      .insert(learningProfilesTable)
      .values({ userId, lastActiveAt: new Date() })
      .returning();
  }
  return profile;
}

router.get("/profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const profile = await getOrCreateProfile(req.userId!);
    res.json({
      userId: profile.userId,
      displayName: profile.displayName,
      totalXp: profile.totalXp,
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      completedCourses: profile.completedCourses,
      quizFrequencyPreference: profile.quizFrequencyPreference,
      learningPacePreference: profile.learningPacePreference,
      preferredCourseType: profile.preferredCourseType,
      preferredDifficulty: profile.preferredDifficulty,
      showExplanationsAfterCorrect: profile.showExplanationsAfterCorrect === 1,
      enableHints: profile.enableHints === 1,
      examReadinessScore: profile.examReadinessScore,
      masteryLevel: profile.masteryLevel,
      readinessConfidence: profile.readinessConfidence,
      learnerModelNotes: profile.learnerModelNotes,
      lastActiveAt: profile.lastActiveAt,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get profile");
    res.status(500).json({ error: "Failed to get profile" });
  }
});

router.patch("/profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const {
      displayName, quizFrequencyPreference, learningPacePreference,
      preferredCourseType, preferredDifficulty, showExplanationsAfterCorrect, enableHints
    } = req.body;

    await getOrCreateProfile(req.userId!);

    const updates: Record<string, unknown> = { updatedAt: new Date(), lastActiveAt: new Date() };
    if (displayName !== undefined) updates.displayName = displayName;
    if (quizFrequencyPreference !== undefined) updates.quizFrequencyPreference = quizFrequencyPreference;
    if (learningPacePreference !== undefined) updates.learningPacePreference = learningPacePreference;
    if (preferredCourseType !== undefined) updates.preferredCourseType = preferredCourseType;
    if (preferredDifficulty !== undefined) updates.preferredDifficulty = preferredDifficulty;
    if (showExplanationsAfterCorrect !== undefined) updates.showExplanationsAfterCorrect = showExplanationsAfterCorrect ? 1 : 0;
    if (enableHints !== undefined) updates.enableHints = enableHints ? 1 : 0;

    const [profile] = await db
      .update(learningProfilesTable)
      .set(updates)
      .where(eq(learningProfilesTable.userId, req.userId!))
      .returning();

    res.json({
      userId: profile.userId,
      displayName: profile.displayName,
      totalXp: profile.totalXp,
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      completedCourses: profile.completedCourses,
      quizFrequencyPreference: profile.quizFrequencyPreference,
      learningPacePreference: profile.learningPacePreference,
      preferredCourseType: profile.preferredCourseType,
      preferredDifficulty: profile.preferredDifficulty,
      showExplanationsAfterCorrect: profile.showExplanationsAfterCorrect === 1,
      enableHints: profile.enableHints === 1,
      examReadinessScore: profile.examReadinessScore,
      masteryLevel: profile.masteryLevel,
      readinessConfidence: profile.readinessConfidence,
      learnerModelNotes: profile.learnerModelNotes,
      lastActiveAt: profile.lastActiveAt,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update profile");
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export { getOrCreateProfile };
export default router;
