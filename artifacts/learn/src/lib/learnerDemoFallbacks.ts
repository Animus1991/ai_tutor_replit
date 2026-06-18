/**
 * Demo / fallback analytics data from Option A.
 * Shown when the learner model has sparse real data (new users, few graded answers).
 */

export interface ConfidenceCalibrationPoint {
  concept: string;
  predicted: number;
  actual: number;
  timestamp?: string;
}

export interface MisconceptionItem {
  id: string;
  concept: string;
  description: string;
  frequency: number;
  corrected: boolean;
  suggestedFix: string;
}

export interface ErrorPatternItem {
  type: string;
  frequency: number;
  concepts: string[];
  suggestedRemedy: string;
  category: string;
}

export interface HeatmapDay {
  date: string;
  minutes: number;
}

export const DEMO_CONFIDENCE_CALIBRATION: ConfidenceCalibrationPoint[] = [
  {
    concept: "Core concepts",
    predicted: 0.9,
    actual: 0.7,
    timestamp: "2026-01-10",
  },
  {
    concept: "Foundations",
    predicted: 0.6,
    actual: 0.8,
    timestamp: "2026-01-12",
  },
  {
    concept: "Applied problems",
    predicted: 0.8,
    actual: 0.85,
    timestamp: "2026-01-11",
  },
  {
    concept: "Multi-step tasks",
    predicted: 0.7,
    actual: 0.4,
    timestamp: "2026-01-09",
  },
  {
    concept: "Review topics",
    predicted: 0.5,
    actual: 0.55,
    timestamp: "2026-01-13",
  },
];

export const DEMO_MISCONCEPTIONS: MisconceptionItem[] = [
  {
    id: "demo-m1",
    concept: "Formula application",
    description:
      "Confusing percentage change with absolute change in multi-step calculations",
    frequency: 3,
    corrected: false,
    suggestedFix: "Practice with explicit step-by-step worked examples",
  },
  {
    id: "demo-m2",
    concept: "Graph interpretation",
    description:
      "Including the wrong region when reading diagrams or labeled areas",
    frequency: 2,
    corrected: false,
    suggestedFix: "Diagram labeling exercises with shaded regions",
  },
];

export const DEMO_ERROR_PATTERNS: ErrorPatternItem[] = [
  {
    type: "Calculation errors in multi-step problems",
    frequency: 8,
    concepts: ["formulas", "problem-solving"],
    suggestedRemedy: "Practice step-by-step worked examples",
    category: "calculation",
  },
  {
    type: "Confusing similar concepts",
    frequency: 5,
    concepts: ["related topics"],
    suggestedRemedy: "Comparison exercises and concept mapping",
    category: "conceptual",
  },
  {
    type: "Skipping intermediate steps",
    frequency: 4,
    concepts: ["derivations", "proofs"],
    suggestedRemedy: 'Use "show hidden steps" mode in lessons',
    category: "procedural",
  },
];

export const DEMO_WEEKLY_MASTERY = [42, 45, 48, 50, 52, 55, 58];

export function buildDemoHeatmap(days = 90): HeatmapDay[] {
  const out: HeatmapDay[] = [];
  const start = new Date();
  start.setDate(start.getDate() - days + 1);
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const mins = Math.random() > 0.35 ? Math.floor(Math.random() * 55 + 5) : 0;
    out.push({ date: d.toISOString().slice(0, 10), minutes: mins });
  }
  return out;
}

/** Merge API calibration aggregate with per-concept demo rows when sparse. */
export function resolveConfidenceCalibration(
  apiPoints: ConfidenceCalibrationPoint[] | undefined,
  hasRealData: boolean,
): ConfidenceCalibrationPoint[] {
  if (apiPoints && apiPoints.length >= 3) return apiPoints;
  if (hasRealData && apiPoints && apiPoints.length > 0) {
    return [
      ...apiPoints,
      ...DEMO_CONFIDENCE_CALIBRATION.slice(0, 3 - apiPoints.length),
    ];
  }
  return DEMO_CONFIDENCE_CALIBRATION;
}

export function resolveMisconceptions(
  items: MisconceptionItem[] | undefined | null,
): { items: MisconceptionItem[]; isDemo: boolean } {
  if (items && items.length > 0) return { items, isDemo: false };
  return { items: DEMO_MISCONCEPTIONS, isDemo: true };
}

export function resolveErrorPatterns(
  items: ErrorPatternItem[] | undefined | null,
): { items: ErrorPatternItem[]; isDemo: boolean } {
  if (items && items.length > 0) return { items, isDemo: false };
  return { items: DEMO_ERROR_PATTERNS, isDemo: true };
}
