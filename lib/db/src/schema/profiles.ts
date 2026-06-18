import {
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod/v4";

export const learningProfilesTable = pgTable("learning_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  displayName: text("display_name"),
  totalXp: integer("total_xp").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  completedCourses: integer("completed_courses").notNull().default(0),
  quizFrequencyPreference: text("quiz_frequency_preference")
    .notNull()
    .default("adaptive"),
  learningPacePreference: text("learning_pace_preference")
    .notNull()
    .default("adaptive"),
  preferredCourseType: text("preferred_course_type")
    .notNull()
    .default("adaptive"),
  preferredDifficulty: text("preferred_difficulty")
    .notNull()
    .default("adaptive"),
  showExplanationsAfterCorrect: integer("show_explanations_after_correct")
    .notNull()
    .default(1),
  enableHints: integer("enable_hints").notNull().default(1),
  examReadinessScore: integer("exam_readiness_score"),
  masteryLevel: text("mastery_level"),
  readinessConfidence: real("readiness_confidence"),
  learnerModelNotes: text("learner_model_notes"),
  examDate: timestamp("exam_date"),
  dailyStudyMinutes: integer("daily_study_minutes").notNull().default(30),
  preferredLanguage: text("preferred_language").notNull().default("en"),
  agentMode: text("agent_mode").notNull().default("socratic"),
  strictSourceMode: integer("strict_source_mode").notNull().default(1),
  socraticMode: integer("socratic_mode").notNull().default(1),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLearningProfileSchema = createInsertSchema(
  learningProfilesTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLearningProfile = z.infer<typeof insertLearningProfileSchema>;
export type LearningProfile = typeof learningProfilesTable.$inferSelect;
