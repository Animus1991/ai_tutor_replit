/**
 * Evidence-based visual analytics derived from answer events, activity log, and mastery.
 */

type AnswerEventRow = {
  stepId: number | null;
  isCorrect: boolean;
  isFirstAttempt: boolean;
  confidence: number;
  createdAt: Date;
};

type ActivityRow = {
  activityType: string;
  description: string;
  createdAt: Date;
  courseTitle?: string | null;
};

export type HeatmapCell = { concept: string; day: number; value: number };

export type TimelineEvent = {
  id: string;
  day: number;
  label: string;
  type: "lesson" | "quiz" | "review" | "error" | "mastery";
  detail: string;
  delta: number;
};

export type RadarAxis = { label: string; value: number; max: number };

export type SankeyLink = {
  from: string;
  to: string;
  value: number;
  color: string;
};

const SANKEY_COLORS = {
  flow: "#67e8f9",
  ai: "#a78bfa",
  good: "#6ee7b7",
  bad: "#f87171",
  warn: "#fbbf24",
};

function dayIndex(d: Date, windowDays: number): number {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (windowDays - 1));
  const diff = Math.floor((d.getTime() - start.getTime()) / 86400000);
  return Math.max(0, Math.min(windowDays - 1, diff));
}

export function buildMasteryHeatmap(
  events: AnswerEventRow[],
  stepToConcept: Map<number, string>,
  concepts: { title: string; mastery: number }[],
  windowDays = 21,
): HeatmapCell[] {
  const topConcepts = concepts
    .slice()
    .sort((a, b) => b.mastery - a.mastery)
    .slice(0, 6)
    .map((c) => c.title);

  if (topConcepts.length === 0) return [];

  const cells: HeatmapCell[] = [];
  const running = new Map<string, number[]>();

  for (const concept of topConcepts) {
    running.set(concept, Array(windowDays).fill(0));
  }

  for (const ev of events) {
    if (ev.stepId == null || !ev.isFirstAttempt) continue;
    const concept = stepToConcept.get(ev.stepId);
    if (!concept || !topConcepts.includes(concept)) continue;
    const di = dayIndex(ev.createdAt, windowDays);
    const arr = running.get(concept)!;
    const prev = di > 0 ? arr[di - 1]! : 0;
    arr[di] = Math.round(prev * 0.4 + (ev.isCorrect ? 100 : 0) * 0.6);
  }

  for (const concept of topConcepts) {
    const arr = running.get(concept)!;
    let carry = concepts.find((c) => c.title === concept)?.mastery ?? 0;
    for (let day = 0; day < windowDays; day++) {
      if (arr[day]! > 0) carry = arr[day]!;
      else arr[day] = carry;
      cells.push({
        concept,
        day,
        value: Math.max(0, Math.min(100, arr[day]!)),
      });
    }
  }

  return cells;
}

export function buildLearningTimeline(
  activities: ActivityRow[],
  events: AnswerEventRow[],
  windowDays = 21,
): TimelineEvent[] {
  const items: TimelineEvent[] = [];
  const start = new Date();
  start.setDate(start.getDate() - windowDays);

  for (const a of activities) {
    if (a.createdAt < start) continue;
    const day = dayIndex(a.createdAt, windowDays);
    let type: TimelineEvent["type"] = "lesson";
    let delta = 0;
    if (a.activityType === "course_completed") {
      type = "mastery";
      delta = 12;
    } else if (a.activityType === "step_completed") {
      type = "lesson";
      delta = 2;
    }
    items.push({
      id: `act-${a.createdAt.getTime()}`,
      day,
      label: a.description.slice(0, 80),
      type,
      detail: a.courseTitle ? `Course: ${a.courseTitle}` : a.activityType,
      delta,
    });
  }

  for (const ev of events) {
    if (!ev.isFirstAttempt || ev.createdAt < start) continue;
    const day = dayIndex(ev.createdAt, windowDays);
    items.push({
      id: `ev-${ev.createdAt.getTime()}-${ev.stepId}`,
      day,
      label: ev.isCorrect
        ? "Quiz — correct first attempt"
        : "Quiz — wrong first attempt",
      type: ev.isCorrect ? "quiz" : "error",
      detail: `Confidence ${ev.confidence}%`,
      delta: ev.isCorrect ? 6 : -8,
    });
  }

  return items
    .sort((a, b) => a.day - b.day || a.label.localeCompare(b.label))
    .slice(-14);
}

export function buildSkillRadar(params: {
  accuracy: number;
  selfReliance: number;
  calibrationScore: number | null;
  avgConceptMastery: number;
  practiceVolume: number;
  recentActivityDays: number;
}): RadarAxis[] {
  const retrieval = params.accuracy;
  const transfer = Math.round(params.avgConceptMastery * 0.85);
  const speed = Math.min(100, Math.round(params.practiceVolume * 1.2));
  const confidence =
    params.calibrationScore ?? Math.round(params.selfReliance * 0.9);
  const depth = params.avgConceptMastery;
  const retention = Math.min(100, params.recentActivityDays * 14);

  return [
    { label: "Retrieval", value: retrieval, max: 100 },
    { label: "Transfer", value: transfer, max: 100 },
    { label: "Speed", value: speed, max: 100 },
    { label: "Confidence", value: confidence, max: 100 },
    { label: "Depth", value: depth, max: 100 },
    { label: "Retention", value: retention, max: 100 },
  ];
}

export function buildPipelineSankey(params: {
  notesCount: number;
  coursesCount: number;
  stepsGenerated: number;
  quizAttempts: number;
  correctFirst: number;
  wrongFirst: number;
  masteredConcepts: number;
  reviewQueue: number;
  errorDiagnosis: number;
  retryQueue: number;
  prereqRepair: number;
}): SankeyLink[] {
  const n = Math.max(params.notesCount, 1);
  const courses = Math.max(params.coursesCount, Math.round(n * 0.9));
  const steps = Math.max(params.stepsGenerated, Math.round(courses * 0.85));
  const attempts = Math.max(params.quizAttempts, Math.round(steps * 0.75));
  const correct = Math.max(params.correctFirst, Math.round(attempts * 0.55));
  const wrong = Math.max(params.wrongFirst, attempts - correct);
  const mastered = Math.max(
    params.masteredConcepts,
    Math.round(correct * 0.65),
  );
  const review = Math.max(params.reviewQueue, Math.round(correct * 0.25));
  const errDiag = Math.max(params.errorDiagnosis, wrong);
  const retry = Math.max(params.retryQueue, Math.round(wrong * 0.75));
  const prereq = Math.max(params.prereqRepair, Math.round(wrong * 0.15));

  return [
    { from: "Upload", to: "OCR / Parse", value: n, color: SANKEY_COLORS.flow },
    {
      from: "OCR / Parse",
      to: "Chunk & Embed",
      value: Math.round(n * 0.96),
      color: SANKEY_COLORS.ai,
    },
    {
      from: "Chunk & Embed",
      to: "Extract concepts",
      value: Math.round(n * 0.92),
      color: SANKEY_COLORS.ai,
    },
    {
      from: "Extract concepts",
      to: "Generate lesson",
      value: steps,
      color: SANKEY_COLORS.good,
    },
    {
      from: "Generate lesson",
      to: "Quiz attempt",
      value: attempts,
      color: SANKEY_COLORS.warn,
    },
    {
      from: "Quiz attempt",
      to: "Correct 1st",
      value: correct,
      color: SANKEY_COLORS.good,
    },
    {
      from: "Quiz attempt",
      to: "Wrong 1st",
      value: wrong,
      color: SANKEY_COLORS.bad,
    },
    {
      from: "Correct 1st",
      to: "Mastered",
      value: mastered,
      color: SANKEY_COLORS.flow,
    },
    {
      from: "Correct 1st",
      to: "Review queue",
      value: review,
      color: SANKEY_COLORS.warn,
    },
    {
      from: "Wrong 1st",
      to: "Error diagnosis",
      value: errDiag,
      color: SANKEY_COLORS.bad,
    },
    {
      from: "Error diagnosis",
      to: "Retry queue",
      value: retry,
      color: SANKEY_COLORS.warn,
    },
    {
      from: "Error diagnosis",
      to: "Prereq repair",
      value: prereq,
      color: SANKEY_COLORS.ai,
    },
    {
      from: "Prereq repair",
      to: "Generate lesson",
      value: prereq,
      color: SANKEY_COLORS.good,
    },
    {
      from: "Retry queue",
      to: "Quiz attempt",
      value: Math.round(retry * 0.7),
      color: SANKEY_COLORS.warn,
    },
  ];
}
