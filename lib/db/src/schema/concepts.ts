import {
  index,
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod/v4";
import { coursesTable, lessonStepsTable } from "./courses";

// A discrete, gradeable unit of knowledge extracted from a course's source material.
// Mastery is tracked per-concept (not per-course) so readiness reflects exactly which
// ideas the learner has and hasn't internalised.
export const conceptsTable = pgTable(
  "concepts",
  {
    id: serial("id").primaryKey(),
    courseId: integer("course_id")
      .notNull()
      .references(() => coursesTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    importance: real("importance").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    courseIdx: index("concepts_course_idx").on(t.courseId),
    userIdx: index("concepts_user_idx").on(t.userId),
  }),
);

// Directed prerequisite edges between concepts (prerequisite -> dependent).
// Drives prerequisite-repair: if a dependent is weak and its prerequisite is also
// weak, the prerequisite is queued first.
export const conceptEdgesTable = pgTable(
  "concept_edges",
  {
    id: serial("id").primaryKey(),
    courseId: integer("course_id")
      .notNull()
      .references(() => coursesTable.id, { onDelete: "cascade" }),
    prerequisiteConceptId: integer("prerequisite_concept_id")
      .notNull()
      .references(() => conceptsTable.id, { onDelete: "cascade" }),
    dependentConceptId: integer("dependent_concept_id")
      .notNull()
      .references(() => conceptsTable.id, { onDelete: "cascade" }),
    strength: real("strength").notNull().default(1),
  },
  (t) => ({
    uniq: uniqueIndex("concept_edges_uniq").on(
      t.prerequisiteConceptId,
      t.dependentConceptId,
    ),
    courseIdx: index("concept_edges_course_idx").on(t.courseId),
  }),
);

// Maps a gradeable lesson step (a question) to the concept(s) it assesses, with a
// weight so a question spanning multiple concepts splits its evidence.
export const lessonStepConceptsTable = pgTable(
  "lesson_step_concepts",
  {
    id: serial("id").primaryKey(),
    stepId: integer("step_id")
      .notNull()
      .references(() => lessonStepsTable.id, { onDelete: "cascade" }),
    conceptId: integer("concept_id")
      .notNull()
      .references(() => conceptsTable.id, { onDelete: "cascade" }),
    weight: real("weight").notNull().default(1),
  },
  (t) => ({
    uniq: uniqueIndex("lesson_step_concepts_uniq").on(t.stepId, t.conceptId),
    conceptIdx: index("lesson_step_concepts_concept_idx").on(t.conceptId),
  }),
);

export const insertConceptSchema = createInsertSchema(conceptsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertConcept = z.infer<typeof insertConceptSchema>;
export type Concept = typeof conceptsTable.$inferSelect;

export const insertConceptEdgeSchema = createInsertSchema(
  conceptEdgesTable,
).omit({ id: true });
export type InsertConceptEdge = z.infer<typeof insertConceptEdgeSchema>;
export type ConceptEdge = typeof conceptEdgesTable.$inferSelect;

export const insertLessonStepConceptSchema = createInsertSchema(
  lessonStepConceptsTable,
).omit({ id: true });
export type InsertLessonStepConcept = z.infer<
  typeof insertLessonStepConceptSchema
>;
export type LessonStepConcept = typeof lessonStepConceptsTable.$inferSelect;
