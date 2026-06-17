import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { coursesTable } from "./courses";

export const courseProgressTable = pgTable("course_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  courseId: integer("course_id").notNull().references(() => coursesTable.id, { onDelete: "cascade" }),
  currentStepPosition: integer("current_step_position").notNull().default(0),
  completedStepIds: jsonb("completed_step_ids").notNull().default([]),
  totalXp: integer("total_xp").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  incorrectAnswers: integer("incorrect_answers").notNull().default(0),
  hintsUsed: integer("hints_used").notNull().default(0),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

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

export const insertCourseProgressSchema = createInsertSchema(courseProgressTable).omit({ id: true });
export type InsertCourseProgress = z.infer<typeof insertCourseProgressSchema>;
export type CourseProgress = typeof courseProgressTable.$inferSelect;

export const insertActivityLogSchema = createInsertSchema(activityLogTable).omit({ id: true });
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogTable.$inferSelect;
