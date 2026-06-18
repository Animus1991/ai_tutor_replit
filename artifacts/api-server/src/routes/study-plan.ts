import { db } from "@workspace/db";
import {
  conceptsTable,
  coursesTable,
  masteryRecordsTable,
  mistakesTable,
  reviewSchedulesTable,
} from "@workspace/db";
import { and, eq, lt, lte, sql } from "drizzle-orm";
import { Router } from "express";
import { type AuthRequest, requireAuth } from "./auth";
import { getOrCreateProfile } from "./profile";

const router = Router();

router.get("/study-plan", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const profile = await getOrCreateProfile(userId);
    const now = new Date();
    const dailyMinutes = profile.dailyStudyMinutes ?? 30;

    const daysUntilExam = profile.examDate
      ? Math.max(
          0,
          Math.ceil((profile.examDate.getTime() - now.getTime()) / 86_400_000),
        )
      : null;

    const [reviewCountRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reviewSchedulesTable)
      .where(
        and(
          eq(reviewSchedulesTable.userId, userId),
          lte(reviewSchedulesTable.dueAt, now),
        ),
      );

    const [mistakeCountRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(mistakesTable)
      .where(
        and(eq(mistakesTable.userId, userId), eq(mistakesTable.status, "open")),
      );

    const weakConcepts = await db
      .select({
        conceptId: conceptsTable.id,
        title: conceptsTable.title,
        courseId: conceptsTable.courseId,
        courseTitle: coursesTable.title,
        mastery: masteryRecordsTable.mastery,
        importance: conceptsTable.importance,
      })
      .from(masteryRecordsTable)
      .innerJoin(
        conceptsTable,
        eq(masteryRecordsTable.conceptId, conceptsTable.id),
      )
      .innerJoin(
        coursesTable,
        eq(masteryRecordsTable.courseId, coursesTable.id),
      )
      .where(
        and(
          eq(masteryRecordsTable.userId, userId),
          lt(masteryRecordsTable.mastery, 0.4),
        ),
      )
      .orderBy(masteryRecordsTable.mastery)
      .limit(5);

    const reviewCount = reviewCountRow?.count ?? 0;
    const mistakeCount = mistakeCountRow?.count ?? 0;
    const _weakCount = weakConcepts.length;

    const blocks: Array<{
      type: string;
      title: string;
      minutes: number;
      priority: number;
      href?: string;
    }> = [];

    if (mistakeCount > 0) {
      blocks.push({
        type: "mistakes",
        title: `Retry ${mistakeCount} mistake${mistakeCount > 1 ? "s" : ""}`,
        minutes: Math.min(15, dailyMinutes),
        priority: 1,
        href: "/tasks",
      });
    }
    if (reviewCount > 0) {
      blocks.push({
        type: "review",
        title: `${reviewCount} spaced-repetition review${reviewCount > 1 ? "s" : ""} due`,
        minutes: Math.min(
          20,
          Math.max(
            10,
            dailyMinutes - blocks.reduce((s, b) => s + b.minutes, 0),
          ),
        ),
        priority: 2,
        href: "/tasks",
      });
    }
    for (const wc of weakConcepts.slice(0, 2)) {
      blocks.push({
        type: "weak_concept",
        title: `Strengthen: ${wc.title}`,
        minutes: 15,
        priority: 3,
        href: `/courses/${wc.courseId}`,
      });
    }
    blocks.push({
      type: "lesson",
      title: "Continue your latest course",
      minutes: Math.max(
        10,
        dailyMinutes - blocks.reduce((s, b) => s + b.minutes, 0),
      ),
      priority: 4,
      href: "/library",
    });

    const totalMinutes = blocks.reduce((s, b) => s + b.minutes, 0);
    const cramMode = daysUntilExam != null && daysUntilExam <= 7;

    res.json({
      dailyMinutes,
      daysUntilExam,
      cramMode,
      examDate: profile.examDate,
      blocks: blocks.sort((a, b) => a.priority - b.priority),
      totalMinutes,
      summary: cramMode
        ? `Exam in ${daysUntilExam} day${daysUntilExam === 1 ? "" : "s"} — prioritize reviews and weak concepts.`
        : `Today's plan: ~${totalMinutes} min across ${blocks.length} blocks.`,
      weakConcepts: weakConcepts.map((c) => ({
        conceptId: c.conceptId,
        title: c.title,
        courseId: c.courseId,
        courseTitle: c.courseTitle,
        mastery: Math.round((c.mastery ?? 0) * 100),
        importance: c.importance,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to build study plan");
    res.status(500).json({ error: "Failed to build study plan" });
  }
});

export default router;
