/**
 * Demo page content — resolved from i18n at runtime so EN/EL switch works.
 */

import type { useTranslation } from "@/lib/i18n";

export type DemoStepType = "content" | "quiz" | "code";

export interface DemoStep {
  id: number;
  type: DemoStepType;
  title: string;
  content: string;
  options?: string[];
  correctOption?: number;
  solution?: string;
  order: number;
}

type TFn = ReturnType<typeof useTranslation>["t"];

export function getDemoSteps(t: TFn): DemoStep[] {
  return [
    {
      id: 1,
      type: "content",
      title: t("demo.step.1.title"),
      content: t("demo.step.1.content"),
      order: 1,
    },
    {
      id: 2,
      type: "quiz",
      title: t("demo.step.2.title"),
      content: t("demo.step.2.question"),
      options: [0, 1, 2, 3].map((i) => t(`demo.step.2.option.${i}`)),
      correctOption: 2,
      order: 2,
    },
    {
      id: 3,
      type: "content",
      title: t("demo.step.3.title"),
      content: t("demo.step.3.content"),
      order: 3,
    },
    {
      id: 4,
      type: "code",
      title: t("demo.step.4.title"),
      content: t("demo.step.4.content"),
      solution: t("demo.step.4.solution"),
      order: 4,
    },
    {
      id: 5,
      type: "quiz",
      title: t("demo.step.5.title"),
      content: t("demo.step.5.question"),
      options: [0, 1, 2, 3].map((i) => t(`demo.step.5.option.${i}`)),
      correctOption: 2,
      order: 5,
    },
  ];
}

export function getDemoNotes(t: TFn) {
  return [
    {
      id: 1,
      title: t("demo.note.1.title"),
      subject: t("demo.note.1.subject"),
      wordCount: 1240,
      createdAt: t("demo.note.1.createdAt"),
      courses: 2,
    },
    {
      id: 2,
      title: t("demo.note.2.title"),
      subject: t("demo.note.2.subject"),
      wordCount: 890,
      createdAt: t("demo.note.2.createdAt"),
      courses: 1,
    },
    {
      id: 3,
      title: t("demo.note.3.title"),
      subject: t("demo.note.3.subject"),
      wordCount: 620,
      createdAt: t("demo.note.3.createdAt"),
      courses: 0,
    },
    {
      id: 4,
      title: t("demo.note.4.title"),
      subject: t("demo.note.4.subject"),
      wordCount: 1050,
      createdAt: t("demo.note.4.createdAt"),
      courses: 1,
    },
  ];
}

export function getDemoCourses(t: TFn) {
  return [
    {
      id: 1,
      title: t("demo.course.1.title"),
      type: t("demo.course.1.type"),
      difficulty: t("demo.course.1.difficulty"),
      status: "ready",
      steps: 12,
      progress: 75,
    },
    {
      id: 2,
      title: t("demo.course.2.title"),
      type: t("demo.course.2.type"),
      difficulty: t("demo.course.2.difficulty"),
      status: "ready",
      steps: 8,
      progress: 37,
    },
    {
      id: 3,
      title: t("demo.course.3.title"),
      type: t("demo.course.3.type"),
      difficulty: t("demo.course.3.difficulty"),
      status: "ready",
      steps: 15,
      progress: 100,
    },
  ];
}

export function getDemoHintChunks(t: TFn, stepId: number): string[] {
  const key = `demo.hint.${stepId}`;
  const raw = t(key);
  if (raw !== key) return raw.split("||");
  return t("demo.hint.default").split("||");
}

export function getDemoExplainChunks(t: TFn, stepId: number): string[] {
  const key = `demo.explain.${stepId}`;
  const raw = t(key);
  if (raw !== key) return raw.split("||");
  return t("demo.explain.default").split("||");
}

export function getDemoChatChunks(t: TFn, msg: string): string[] {
  const lc = msg.toLowerCase();
  if (lc.includes("loss") || lc.includes("mse")) {
    return t("demo.chat.loss").split("||");
  }
  if (
    lc.includes("gradient") ||
    lc.includes("learning rate") ||
    lc.includes("ρυθμ") ||
    lc.includes("κλίση")
  ) {
    return t("demo.chat.gradient").split("||");
  }
  if (
    lc.includes("supervised") ||
    lc.includes("unsupervised") ||
    lc.includes("επιβλεπόμεν") ||
    lc.includes("μη-επιβλεπόμεν")
  ) {
    return t("demo.chat.supervised").split("||");
  }
  return t("demo.chat.default").split("||");
}
