import { pgTable, serial, text, integer, real, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conceptsTable } from "./concepts";
import { coursesTable, lessonStepsTable } from "./courses";
import { answerEventsTable } from "./progress";

// Per-concept mastery, modelled as a Beta(alpha, beta) posterior over the learner's
// probability of answering correctly. Updated only from FIRST graded attempts so
// retries (which the lesson player allows) can never inflate mastery.
//   mastery   = alpha / (alpha + beta)              (posterior mean)
//   confidence = min(1, firstAttempts / 5)          (how much evidence backs it)
export const masteryRecordsTable = pgTable("mastery_records", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  courseId: integer("course_id").notNull().references(() => coursesTable.id, { onDelete: "cascade" }),
  conceptId: integer("concept_id").notNull().references(() => conceptsTable.id, { onDelete: "cascade" }),
  alpha: real("alpha").notNull().default(2),
  beta: real("beta").notNull().default(2),
  firstAttempts: integer("first_attempts").notNull().default(0),
  correctEvidence: real("correct_evidence").notNull().default(0),
  incorrectEvidence: real("incorrect_evidence").notNull().default(0),
  mastery: real("mastery").notNull().default(0.5),
  confidence: real("confidence").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  uniq: uniqueIndex("mastery_records_user_concept_uniq").on(t.userId, t.conceptId),
  userIdx: index("mastery_records_user_idx").on(t.userId),
}));

// An open mistake the learner should revisit. Created when a first graded attempt is
// wrong; resolved when the learner later answers a question on the same step/concept
// correctly. Feeds the Tasks "retry your mistakes" queue.
export const mistakesTable = pgTable("mistakes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  courseId: integer("course_id").notNull().references(() => coursesTable.id, { onDelete: "cascade" }),
  stepId: integer("step_id").notNull().references(() => lessonStepsTable.id, { onDelete: "cascade" }),
  answerEventId: integer("answer_event_id").references(() => answerEventsTable.id, { onDelete: "set null" }),
  conceptId: integer("concept_id").references(() => conceptsTable.id, { onDelete: "set null" }),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
}, (t) => ({
  userStatusIdx: index("mistakes_user_status_idx").on(t.userId, t.status),
}));

// FSRS-inspired spaced-repetition state, one row per (user, concept). Scheduling math
// lives in the review API (Phase 2); the table stores the durable memory state.
export const reviewSchedulesTable = pgTable("review_schedules", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  courseId: integer("course_id").notNull().references(() => coursesTable.id, { onDelete: "cascade" }),
  conceptId: integer("concept_id").notNull().references(() => conceptsTable.id, { onDelete: "cascade" }),
  dueAt: timestamp("due_at").notNull().defaultNow(),
  stabilityDays: real("stability_days").notNull().default(1),
  difficulty: real("difficulty").notNull().default(5),
  lastRating: text("last_rating"),
  lastReviewedAt: timestamp("last_reviewed_at"),
  reviewCount: integer("review_count").notNull().default(0),
  lapseCount: integer("lapse_count").notNull().default(0),
  retrievability: real("retrievability").notNull().default(1),
}, (t) => ({
  uniq: uniqueIndex("review_schedules_user_concept_uniq").on(t.userId, t.conceptId),
  dueIdx: index("review_schedules_user_due_idx").on(t.userId, t.dueAt),
}));

export const insertMasteryRecordSchema = createInsertSchema(masteryRecordsTable).omit({ id: true, updatedAt: true });
export type InsertMasteryRecord = z.infer<typeof insertMasteryRecordSchema>;
export type MasteryRecord = typeof masteryRecordsTable.$inferSelect;

export const insertMistakeSchema = createInsertSchema(mistakesTable).omit({ id: true });
export type InsertMistake = z.infer<typeof insertMistakeSchema>;
export type Mistake = typeof mistakesTable.$inferSelect;

export const insertReviewScheduleSchema = createInsertSchema(reviewSchedulesTable).omit({ id: true });
export type InsertReviewSchedule = z.infer<typeof insertReviewScheduleSchema>;
export type ReviewSchedule = typeof reviewSchedulesTable.$inferSelect;
