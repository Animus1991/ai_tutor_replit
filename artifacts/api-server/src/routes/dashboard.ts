import { db } from "@workspace/db";
import {
  activityLogTable,
  answerEventsTable,
  conceptEdgesTable,
  conceptsTable,
  courseProgressTable,
  coursesTable,
  learningProfilesTable,
  lessonStepConceptsTable,
  lessonStepsTable,
  masteryRecordsTable,
  mistakesTable,
  notesTable,
} from "@workspace/db";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { Router } from "express";
import {
  buildLearningTimeline,
  buildMasteryHeatmap,
  buildPipelineSankey,
  buildSkillRadar,
} from "../lib/visualAnalytics";
import { type AuthRequest, requireAuth } from "./auth";
import { getOrCreateProfile } from "./profile";

const router = Router();

router.get("/dashboard", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const profile = await getOrCreateProfile(userId);

    const notes = await db
      .select()
      .from(notesTable)
      .where(eq(notesTable.userId, userId));
    const courses = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.userId, userId));

    const allProgress = await db
      .select()
      .from(courseProgressTable)
      .where(eq(courseProgressTable.userId, userId));

    const completedCourses = allProgress.filter(
      (p) => p.completedAt !== null,
    ).length;
    const inProgressCourses = allProgress.filter(
      (p) => !p.completedAt && p.currentStepPosition > 0,
    ).length;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyActivity = await db
      .select()
      .from(activityLogTable)
      .where(
        and(
          eq(activityLogTable.userId, userId),
          gte(activityLogTable.createdAt, oneWeekAgo),
        ),
      );
    const weeklyXp = weeklyActivity.reduce(
      (sum, a) => sum + (a.xpEarned || 0),
      0,
    );

    const totalQuestions =
      profile.completedCourses > 0
        ? allProgress.reduce(
            (sum, p) => sum + p.correctAnswers + p.incorrectAnswers,
            0,
          )
        : 0;
    const totalCorrect = allProgress.reduce(
      (sum, p) => sum + p.correctAnswers,
      0,
    );
    const averageScore =
      totalQuestions > 0
        ? Math.round((totalCorrect / totalQuestions) * 100)
        : 0;

    const recentCourses = courses
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
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

router.get(
  "/dashboard/activity",
  requireAuth,
  async (req: AuthRequest, res) => {
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
  },
);

router.get(
  "/dashboard/learner-model",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const profile = await getOrCreateProfile(userId);

      const allProgress = await db
        .select()
        .from(courseProgressTable)
        .where(eq(courseProgressTable.userId, userId));

      const totalCorrect = allProgress.reduce(
        (sum, p) => sum + p.correctAnswers,
        0,
      );
      const totalIncorrect = allProgress.reduce(
        (sum, p) => sum + p.incorrectAnswers,
        0,
      );
      const totalHints = allProgress.reduce((sum, p) => sum + p.hintsUsed, 0);
      const answered = totalCorrect + totalIncorrect;
      const dataPointsCollected = answered + totalHints;

      // ─── Concept-level mastery rollup ───────────────────────────────────────
      // Per-concept Beta-binomial mastery, gated by evidence (min(1, firstAttempts/5)),
      // rolled up into a readiness score weighted by concept importance. This turns
      // "you scored 70%" into "you've mastered X but not Y".
      const userCourses = await db
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.userId, userId));
      const courseTitleById = new Map(
        userCourses.map((c) => [c.id, c.title] as const),
      );
      const notes = await db
        .select()
        .from(notesTable)
        .where(eq(notesTable.userId, userId));

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const masteryRows = await db
        .select({
          conceptId: masteryRecordsTable.conceptId,
          courseId: masteryRecordsTable.courseId,
          mastery: masteryRecordsTable.mastery,
          confidence: masteryRecordsTable.confidence,
          firstAttempts: masteryRecordsTable.firstAttempts,
          title: conceptsTable.title,
          importance: conceptsTable.importance,
        })
        .from(masteryRecordsTable)
        .innerJoin(
          conceptsTable,
          eq(masteryRecordsTable.conceptId, conceptsTable.id),
        )
        .where(eq(masteryRecordsTable.userId, userId));

      const bandOf = (m: number) =>
        m >= 0.8
          ? "strong"
          : m >= 0.6
            ? "proficient"
            : m >= 0.4
              ? "developing"
              : "weak";

      const conceptMastery = masteryRows
        .map((r) => ({
          conceptId: r.conceptId,
          title: r.title,
          courseId: r.courseId,
          courseTitle: courseTitleById.get(r.courseId) ?? null,
          mastery: Math.round((r.mastery ?? 0) * 100),
          confidence: Math.round((r.confidence ?? 0) * 100),
          importance: r.importance ?? 1,
          attempts: r.firstAttempts ?? 0,
          band: bandOf(r.mastery ?? 0),
        }))
        .sort((a, b) => a.mastery - b.mastery);

      const rollup = (rows: typeof masteryRows): number | null => {
        let num = 0;
        let den = 0;
        for (const r of rows) {
          const gate = Math.min(1, (r.firstAttempts ?? 0) / 5);
          const wgt = (r.importance ?? 1) * gate;
          num += wgt * (r.mastery ?? 0);
          den += wgt;
        }
        return den > 0 ? Math.round((100 * num) / den) : null;
      };

      // Gate the aggregate readiness on DISTINCT graded first attempts — not the sum of
      // per-concept counters, which would multiply-count a question tagged to several
      // concepts. The partial unique index guarantees at most one first-attempt row per
      // (user, step), so this count is exactly the number of unique questions answered
      // first-time.
      const [firstAttemptAgg] = await db
        .select({ cnt: sql<number>`count(*)::int` })
        .from(answerEventsTable)
        .where(
          and(
            eq(answerEventsTable.userId, userId),
            eq(answerEventsTable.isFirstAttempt, true),
          ),
        );
      const totalFirstAttempts = Number(firstAttemptAgg?.cnt ?? 0);
      const conceptReadiness =
        totalFirstAttempts >= 5 ? rollup(masteryRows) : null;

      const byCourse = new Map<number, typeof masteryRows>();
      for (const r of masteryRows) {
        const arr = byCourse.get(r.courseId) ?? [];
        arr.push(r);
        byCourse.set(r.courseId, arr);
      }
      const readinessByCourse = [...byCourse.entries()]
        .map(([cid, rows]) => ({
          courseId: cid,
          courseTitle: courseTitleById.get(cid) ?? null,
          readiness: rollup(rows),
          conceptCount: rows.length,
        }))
        .filter((c) => c.readiness !== null);

      // Attach step-completion % per course for analytics UI.
      const progressByCourseId = new Map(
        allProgress.map((p) => [p.courseId, p] as const),
      );
      const courseIds = userCourses.map((c) => c.id);
      const stepCountRows =
        courseIds.length > 0
          ? await db
              .select({
                courseId: lessonStepsTable.courseId,
                total: sql<number>`count(*)::int`,
              })
              .from(lessonStepsTable)
              .where(inArray(lessonStepsTable.courseId, courseIds))
              .groupBy(lessonStepsTable.courseId)
          : [];
      const stepCountByCourse = new Map(
        stepCountRows.map((r) => [r.courseId, r.total] as const),
      );

      const readinessByCourseEnriched = userCourses.map((course) => {
        const entry = readinessByCourse.find((r) => r.courseId === course.id);
        const prog = progressByCourseId.get(course.id);
        const totalSteps = stepCountByCourse.get(course.id) ?? 0;
        const completed =
          (prog?.completedStepIds as number[] | undefined)?.length ?? 0;
        const percentComplete =
          totalSteps > 0 ? Math.round((completed / totalSteps) * 100) : 0;
        return {
          courseId: course.id,
          courseTitle: course.title,
          readiness: entry?.readiness ?? null,
          conceptCount: entry?.conceptCount ?? 0,
          percentComplete,
        };
      });

      // ─── Misconceptions & error patterns (from real mistake / answer data) ───
      const events = await db
        .select()
        .from(answerEventsTable)
        .where(eq(answerEventsTable.userId, userId));

      const openMistakes = await db
        .select({
          id: mistakesTable.id,
          courseId: mistakesTable.courseId,
          stepId: mistakesTable.stepId,
          conceptId: mistakesTable.conceptId,
          createdAt: mistakesTable.createdAt,
          stepTitle: lessonStepsTable.title,
          stepType: lessonStepsTable.stepType,
          questionData: lessonStepsTable.questionData,
          conceptTitle: conceptsTable.title,
          courseTitle: coursesTable.title,
        })
        .from(mistakesTable)
        .innerJoin(
          lessonStepsTable,
          eq(mistakesTable.stepId, lessonStepsTable.id),
        )
        .innerJoin(coursesTable, eq(mistakesTable.courseId, coursesTable.id))
        .leftJoin(conceptsTable, eq(mistakesTable.conceptId, conceptsTable.id))
        .where(
          and(
            eq(mistakesTable.userId, userId),
            eq(mistakesTable.status, "open"),
          ),
        )
        .orderBy(mistakesTable.createdAt);

      type MisconceptionOut = {
        id: string;
        concept: string;
        description: string;
        frequency: number;
        corrected: boolean;
        suggestedFix: string;
        detectedAt: string;
        courseTitle?: string | null;
      };

      const misconceptionGroups = new Map<
        string,
        MisconceptionOut & { count: number }
      >();
      for (const row of openMistakes) {
        const concept = row.conceptTitle ?? row.stepTitle ?? "Unknown concept";
        const key = `${row.courseId}:${concept}`;
        const qd = row.questionData as Record<string, unknown> | null;
        const explanation = qd?.explanation ? String(qd.explanation) : null;
        const existing = misconceptionGroups.get(key);
        if (existing) {
          existing.frequency += 1;
          existing.count += 1;
        } else {
          misconceptionGroups.set(key, {
            id: `mis-${row.id}`,
            concept,
            description:
              explanation ??
              `Repeated errors on "${row.stepTitle ?? row.stepType}" in ${row.courseTitle ?? "course"}`,
            frequency: 1,
            count: 1,
            corrected: false,
            suggestedFix: `Retry related exercises and review the explanation for "${concept}"`,
            detectedAt: row.createdAt.toISOString(),
            courseTitle: row.courseTitle,
          });
        }
      }

      // Overconfident wrong first attempts → calibration-linked misconceptions
      const overconfidentWrong = events.filter(
        (e) => e.isFirstAttempt && !e.isCorrect && e.confidence >= 80,
      );
      if (overconfidentWrong.length > 0) {
        const stepIds = [
          ...new Set(
            overconfidentWrong
              .map((e) => e.stepId)
              .filter((id): id is number => id != null),
          ),
        ];
        const stepConceptRows =
          stepIds.length > 0
            ? await db
                .select({
                  stepId: lessonStepConceptsTable.stepId,
                  title: conceptsTable.title,
                })
                .from(lessonStepConceptsTable)
                .innerJoin(
                  conceptsTable,
                  eq(lessonStepConceptsTable.conceptId, conceptsTable.id),
                )
                .where(inArray(lessonStepConceptsTable.stepId, stepIds))
            : [];
        const conceptByStep = new Map(
          stepConceptRows.map((r) => [r.stepId, r.title] as const),
        );

        for (const ev of overconfidentWrong) {
          if (ev.stepId == null) continue;
          const concept = conceptByStep.get(ev.stepId) ?? "General knowledge";
          const key = `overconf:${concept}`;
          const existing = misconceptionGroups.get(key);
          if (existing) {
            existing.frequency += 1;
          } else {
            misconceptionGroups.set(key, {
              id: `oc-${ev.id}`,
              concept,
              description: `High confidence (${ev.confidence}%) but incorrect — likely a hidden gap`,
              frequency: 1,
              count: 1,
              corrected: false,
              suggestedFix: "Slow down and verify assumptions before answering",
              detectedAt: ev.createdAt.toISOString(),
            });
          }
        }
      }

      const misconceptions = [...misconceptionGroups.values()]
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10);

      type ErrorPatternOut = {
        type: string;
        frequency: number;
        concepts: string[];
        suggestedRemedy: string;
        category: string;
      };

      const errorPatterns: ErrorPatternOut[] = [];
      if (openMistakes.length > 0) {
        const byType = new Map<string, number>();
        for (const m of openMistakes) {
          byType.set(m.stepType, (byType.get(m.stepType) ?? 0) + 1);
        }
        for (const [stepType, freq] of byType) {
          const category =
            stepType === "code_exercise"
              ? "procedural"
              : stepType === "question"
                ? "conceptual"
                : "general";
          errorPatterns.push({
            type: `Errors in ${stepType.replace(/_/g, " ")} steps`,
            frequency: freq,
            concepts: [
              ...new Set(
                openMistakes
                  .filter((m) => m.stepType === stepType)
                  .map((m) => m.conceptTitle ?? m.stepTitle ?? "unknown")
                  .filter(Boolean) as string[],
              ),
            ].slice(0, 5),
            suggestedRemedy:
              stepType === "code_exercise"
                ? "Use step-by-step worked examples and run tests after each change"
                : "Review explanations and practice active recall without hints",
            category,
          });
        }
      }
      if (overconfidentWrong.length >= 2) {
        errorPatterns.push({
          type: "Overconfident incorrect answers",
          frequency: overconfidentWrong.length,
          concepts: [...misconceptionGroups.values()]
            .filter((m) => m.id.startsWith("oc-"))
            .map((m) => m.concept)
            .slice(0, 5),
          suggestedRemedy:
            "Rate confidence honestly and review topics where you felt certain but missed",
          category: "calibration",
        });
      }

      // Prerequisite repair: a weak concept whose prerequisite is also weak should be
      // fixed at the prerequisite first.
      const masteryByConcept = new Map(
        masteryRows.map((r) => [r.conceptId, r] as const),
      );
      const edges = await db
        .select({
          pre: conceptEdgesTable.prerequisiteConceptId,
          dep: conceptEdgesTable.dependentConceptId,
        })
        .from(conceptEdgesTable)
        .innerJoin(
          conceptsTable,
          eq(conceptEdgesTable.prerequisiteConceptId, conceptsTable.id),
        )
        .where(eq(conceptsTable.userId, userId));
      const prerequisiteRepairs: { concept: string; prerequisite: string }[] =
        [];
      for (const e of edges) {
        const dep = masteryByConcept.get(e.dep);
        const pre = masteryByConcept.get(e.pre);
        if (
          dep &&
          pre &&
          (dep.mastery ?? 0) < 0.6 &&
          (pre.mastery ?? 0) < 0.7
        ) {
          prerequisiteRepairs.push({
            concept: dep.title,
            prerequisite: pre.title,
          });
        }
      }

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
        masteryLevel =
          accuracy >= 0.8
            ? "strong"
            : accuracy >= 0.6
              ? "proficient"
              : "developing";

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

        if (accuracy >= 0.8)
          strengths.push(
            "Strong command of the material — high answer accuracy",
          );
        else if (accuracy >= 0.6)
          strengths.push("Solid grasp of the core concepts");
        if (selfReliance >= 0.8)
          strengths.push("Solves problems independently — an exam-ready habit");

        if (accuracy < 0.6)
          focusAreas.push(
            "Reinforce core concepts — accuracy is below exam-safe level",
          );
        if (hintRate > 0.4)
          focusAreas.push("Practice without hints to mirror exam conditions");
        if (examReadiness < 70)
          focusAreas.push("Keep practicing to push readiness past 70%");

        if (strengths.length === 0)
          strengths.push("Building momentum — keep going");
        if (focusAreas.length === 0)
          focusAreas.push(
            "Stretch yourself with harder material to deepen mastery",
          );

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
        strengths.push(
          "Your readiness profile builds as you answer graded questions",
        );
        focusAreas.push(
          "Complete a few graded questions to unlock your exam-readiness score",
        );
      }

      // ─── Confidence calibration ─────────────────────────────────────────────
      // How well the learner's self-rated confidence matches their real accuracy.
      // Computed from the honest per-answer event log, independent of the readiness gate.
      const MIN_CALIBRATION = 5;

      let calibration: {
        score: number;
        direction: string;
        avgConfidence: number;
        sampleSize: number;
      } | null = null;

      if (events.length >= MIN_CALIBRATION) {
        const n = events.length;
        const avgConfidence =
          events.reduce((s, e) => s + e.confidence, 0) / n / 100;
        const calibAccuracy =
          events.reduce((s, e) => s + (e.isCorrect ? 1 : 0), 0) / n;
        const gap = avgConfidence - calibAccuracy; // >0 overconfident, <0 underconfident
        const score = Math.round((1 - Math.min(1, Math.abs(gap))) * 100);
        const direction =
          gap > 0.1
            ? "overconfident"
            : gap < -0.1
              ? "underconfident"
              : "calibrated";
        calibration = {
          score,
          direction,
          avgConfidence: Math.round(avgConfidence * 100),
          sampleSize: n,
        };

        if (answered >= MIN_GRADED) {
          if (direction === "overconfident") {
            focusAreas.push(
              "Slow down on questions you feel sure about — that's where overconfidence hides mistakes",
            );
          } else if (direction === "underconfident") {
            strengths.push(
              "You underrate yourself — you often get right what you doubt",
            );
          } else {
            strengths.push(
              "Well-calibrated confidence — you reliably know what you know",
            );
          }
        }
      }

      // Prefer the concept-level rollup for the headline readiness once enough
      // first-attempt evidence exists; otherwise keep the aggregate estimate above.
      if (conceptReadiness !== null) {
        examReadiness = conceptReadiness;
        masteryLevel =
          conceptReadiness >= 80
            ? "strong"
            : conceptReadiness >= 60
              ? "proficient"
              : "developing";
        confidence = Math.max(
          confidence,
          Math.min(0.95, 0.4 + totalFirstAttempts * 0.03),
        );
        await db
          .update(learningProfilesTable)
          .set({
            examReadinessScore: examReadiness,
            masteryLevel,
            readinessConfidence: confidence,
            updatedAt: new Date(),
          })
          .where(eq(learningProfilesTable.userId, userId))
          .catch(() => {});
      }

      for (const rep of prerequisiteRepairs.slice(0, 2)) {
        focusAreas.unshift(
          `Repair the prerequisite "${rep.prerequisite}" before tackling "${rep.concept}"`,
        );
      }
      for (const wc of conceptMastery
        .filter((c) => c.band === "weak")
        .slice(0, 3)) {
        focusAreas.push(`Strengthen "${wc.title}" — mastery ${wc.mastery}%`);
      }
      for (const sc of conceptMastery
        .filter((c) => c.band === "strong")
        .slice(0, 2)) {
        strengths.push(`Solid on "${sc.title}" — mastery ${sc.mastery}%`);
      }

      const nextInsightAt = Math.max(0, MIN_GRADED - answered);

      // ─── Visual analytics (heatmap, timeline, radar, sankey) ───────────────
      const activities = await db
        .select()
        .from(activityLogTable)
        .where(eq(activityLogTable.userId, userId))
        .orderBy(activityLogTable.createdAt);

      const stepConceptRows =
        events.length > 0
          ? await db
              .select({
                stepId: lessonStepConceptsTable.stepId,
                title: conceptsTable.title,
              })
              .from(lessonStepConceptsTable)
              .innerJoin(
                conceptsTable,
                eq(lessonStepConceptsTable.conceptId, conceptsTable.id),
              )
              .where(
                inArray(lessonStepConceptsTable.stepId, [
                  ...new Set(
                    events
                      .map((e) => e.stepId)
                      .filter((id): id is number => id != null),
                  ),
                ]),
              )
          : [];
      const stepToConcept = new Map(
        stepConceptRows.map((r) => [r.stepId, r.title] as const),
      );

      const notesCount = notes.length;
      const stepsGenerated = stepCountRows.reduce((s, r) => s + r.total, 0);
      const firstAttempts = events.filter((e) => e.isFirstAttempt);
      const correctFirst = firstAttempts.filter((e) => e.isCorrect).length;
      const wrongFirst = firstAttempts.filter((e) => !e.isCorrect).length;
      const masteredConcepts = conceptMastery.filter(
        (c) => c.band === "strong",
      ).length;
      const reviewQueue = conceptMastery.filter(
        (c) => c.band === "proficient",
      ).length;
      const errorDiagnosis = openMistakes.length + wrongFirst;
      const retryQueue = openMistakes.length;

      const avgConceptMastery =
        conceptMastery.length > 0
          ? Math.round(
              conceptMastery.reduce((s, c) => s + c.mastery, 0) /
                conceptMastery.length,
            )
          : accuracyPct;

      const recentDays = new Set(
        activities
          .filter((a) => a.createdAt >= oneWeekAgo)
          .map((a) => a.createdAt.toISOString().slice(0, 10)),
      ).size;

      const visualAnalytics = {
        masteryHeatmap: buildMasteryHeatmap(
          events,
          stepToConcept,
          conceptMastery.map((c) => ({ title: c.title, mastery: c.mastery })),
        ),
        learningTimeline: buildLearningTimeline(activities, events),
        skillRadar: buildSkillRadar({
          accuracy: accuracyPct,
          selfReliance: selfReliancePct,
          calibrationScore: calibration?.score ?? null,
          avgConceptMastery,
          practiceVolume: Math.min(100, Math.round((answered / 30) * 100)),
          recentActivityDays: recentDays,
        }),
        pipelineFlow: buildPipelineSankey({
          notesCount,
          coursesCount: userCourses.length,
          stepsGenerated,
          quizAttempts: firstAttempts.length,
          correctFirst,
          wrongFirst,
          masteredConcepts,
          reviewQueue,
          errorDiagnosis,
          retryQueue,
          prereqRepair: prerequisiteRepairs.length,
        }),
        hasRealData: dataPointsCollected >= 5,
      };

      res.json({
        examReadiness,
        masteryLevel,
        confidence,
        calibration,
        accuracy: accuracyPct,
        selfReliance: selfReliancePct,
        signals,
        strengths: [...new Set(strengths)],
        focusAreas: [...new Set(focusAreas)],
        conceptMastery,
        readinessByCourse: readinessByCourseEnriched,
        prerequisiteRepairs,
        misconceptions,
        errorPatterns,
        dataPointsCollected,
        nextInsightAt,
        visualAnalytics,
      });
    } catch (err) {
      req.log.error({ err }, "Failed to get learner model");
      res.status(500).json({ error: "Failed to get learner model" });
    }
  },
);

export default router;
