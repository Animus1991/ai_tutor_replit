import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod/v4";
import { coursesTable } from "./courses";

export const courseProgressTable = pgTable(
  "course_progress",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    courseId: integer("course_id")
      .notNull()
      .references(() => coursesTable.id, { onDelete: "cascade" }),
    currentStepPosition: integer("current_step_position").notNull().default(0),
    completedStepIds: jsonb("completed_step_ids").notNull().default([]),
    totalXp: integer("total_xp").notNull().default(0),
    correctAnswers: integer("correct_answers").notNull().default(0),
    incorrectAnswers: integer("incorrect_answers").notNull().default(0),
    hintsUsed: integer("hints_used").notNull().default(0),
    startedAt: timestamp("started_at").defaultNow(),
    completedAt: timestamp("completed_at"),
  },
  (t) => ({
    userCourseUniq: uniqueIndex("course_progress_user_course_uniq").on(
      t.userId,
      t.courseId,
    ),
  }),
);

export const activityLogTable = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  activityType: text("activity_type").notNull(),
  description: text("description").notNull(),
  xpEarned: integer("xp_earned").notNull().default(0),
  courseId: integer("course_id"),
  courseTitle: text("course_title"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Honest per-answer event log: the foundation of the longitudinal learner model.
// Each graded answer records whether it was correct and how sure the user was (0-100),
// enabling confidence calibration (and, later, latency/retention signals).
export const answerEventsTable = pgTable(
  "answer_events",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    courseId: integer("course_id").notNull(),
    stepId: integer("step_id"),
    isCorrect: boolean("is_correct").notNull(),
    confidence: integer("confidence").notNull(),
    // Durable, DB-enforced marker of the learner's first graded attempt at a step.
    // Mastery is updated only from these; a partial unique index guarantees at most
    // one per (user, step) so concurrent submissions can never double-count.
    isFirstAttempt: boolean("is_first_attempt").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    firstAttemptUniq: uniqueIndex("answer_events_first_attempt_uniq")
      .on(t.userId, t.stepId)
      .where(sql`${t.isFirstAttempt}`),
    userStepIdx: index("answer_events_user_step_idx").on(t.userId, t.stepId),
  }),
);

export const insertCourseProgressSchema = createInsertSchema(
  courseProgressTable,
).omit({ id: true });
export type InsertCourseProgress = z.infer<typeof insertCourseProgressSchema>;
export type CourseProgress = typeof courseProgressTable.$inferSelect;

export const insertActivityLogSchema = createInsertSchema(
  activityLogTable,
).omit({ id: true });
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogTable.$inferSelect;

export const insertAnswerEventSchema = createInsertSchema(
  answerEventsTable,
).omit({ id: true });
export type InsertAnswerEvent = z.infer<typeof insertAnswerEventSchema>;
export type AnswerEvent = typeof answerEventsTable.$inferSelect;
