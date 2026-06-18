import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod/v4";
import { notesTable } from "./notes";

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  noteId: integer("note_id")
    .notNull()
    .references(() => notesTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  subject: text("subject"),
  courseType: text("course_type").notNull().default("theoretical"),
  status: text("status").notNull().default("generating"),
  totalSteps: integer("total_steps").notNull().default(0),
  estimatedMinutes: integer("estimated_minutes").notNull().default(15),
  difficulty: text("difficulty").notNull().default("intermediate"),
  quizFrequency: text("quiz_frequency").notNull().default("medium"),
  additionalInstructions: text("additional_instructions"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCourseSchema = createInsertSchema(coursesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof coursesTable.$inferSelect;

export const lessonStepsTable = pgTable("lesson_steps", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id")
    .notNull()
    .references(() => coursesTable.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  stepType: text("step_type").notNull().default("content"),
  title: text("title"),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  questionData: jsonb("question_data"),
  codeData: jsonb("code_data"),
  xpReward: integer("xp_reward").notNull().default(10),
  isRequired: integer("is_required").notNull().default(1),
});

export const insertLessonStepSchema = createInsertSchema(lessonStepsTable).omit(
  { id: true },
);
export type InsertLessonStep = z.infer<typeof insertLessonStepSchema>;
export type LessonStep = typeof lessonStepsTable.$inferSelect;
