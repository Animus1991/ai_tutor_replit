/**
 * Extra UI-only learning preferences that live in localStorage.
 *
 * These complement the backend `profile` (which already stores examDate,
 * dailyStudyMinutes, agentMode, strictSourceMode, …). Anything that the
 * backend schema does not yet expose lives here so the user can still
 * configure it without a migration.
 *
 * The shape mirrors the Option A reference's "Learning Preferences" panel.
 */

export type TeachingStyle = "socratic" | "direct" | "mixed";
export type ExplanationDepth =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";
export type FeedbackTone = "gentle" | "balanced" | "strict";
export type QuestionFreq = "minimal" | "moderate" | "frequent";
export type ExampleDensity = "fewer" | "moderate" | "many";
export type DiagramFreq = "minimal" | "moderate" | "rich";
export type Pace = "slow" | "moderate" | "fast";
export type Challenge = "low" | "balanced" | "high";
export type LessonLength = "short" | "medium" | "long";
export type SourceMode = "strict" | "enriched" | "notes_only";
export type ThemeMode = "dark" | "light" | "system";

export interface ExtraPreferences {
  teachingStyle: TeachingStyle;
  explanationDepth: ExplanationDepth;
  feedbackTone: FeedbackTone;
  theoryPracticeBalance: number; // 0..100 (0 = pure theory, 100 = pure practice)
  questionFrequency: QuestionFreq;
  exampleDensity: ExampleDensity;
  diagramFrequency: DiagramFreq;
  pace: Pace;
  challenge: Challenge;
  lessonLength: LessonLength;
  masteryThreshold: number; // 0..100
  sourceMode: SourceMode;
  theme: ThemeMode;
}

export const DEFAULT_EXTRA_PREFS: ExtraPreferences = {
  teachingStyle: "mixed",
  explanationDepth: "intermediate",
  feedbackTone: "balanced",
  theoryPracticeBalance: 50,
  questionFrequency: "moderate",
  exampleDensity: "moderate",
  diagramFrequency: "moderate",
  pace: "moderate",
  challenge: "balanced",
  lessonLength: "medium",
  masteryThreshold: 80,
  sourceMode: "enriched",
  theme: "dark",
};

const STORAGE_KEY = "synapse.prefs.v1";

export function loadExtraPrefs(): ExtraPreferences {
  if (typeof window === "undefined") return DEFAULT_EXTRA_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_EXTRA_PREFS;
    return { ...DEFAULT_EXTRA_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_EXTRA_PREFS;
  }
}

export function saveExtraPrefs(prefs: ExtraPreferences) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore quota errors — preferences are non-critical
  }
}
