export interface RubricScores {
  accuracy: number;
  completeness: number;
  simplicity: number;
  structure: number;
}

export type RubricDimension = keyof RubricScores;

const KEY_TERMS = [
  "cournot",
  "bertrand",
  "mc",
  "marginal",
  "quantity",
  "price",
  "duopol",
  "nash",
  "best response",
];

export function computeRubric(text: string, wordCount: number): RubricScores {
  const lower = text.toLowerCase();
  const termHits = KEY_TERMS.filter((term) => lower.includes(term)).length;
  const accuracy = Math.min(100, Math.round(35 + termHits * 10));

  const completeness =
    wordCount < 15
      ? 35
      : wordCount < 25
        ? 55
        : wordCount < 40
          ? 72
          : wordCount < 60
            ? 85
            : 92;

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgLen = wordCount / Math.max(sentences.length, 1);
  const simplicity =
    avgLen > 22 ? 48 : avgLen > 16 ? 68 : avgLen > 11 ? 82 : 90;

  let structure = 45;
  if (
    lower.includes("because") ||
    lower.includes("when") ||
    lower.includes("γιατί")
  )
    structure += 18;
  if (
    lower.includes("example") ||
    lower.includes("such as") ||
    lower.includes("παράδειγμα")
  )
    structure += 18;
  if (/\b(first|then|finally|πρώτα|μετά)\b/i.test(text)) structure += 12;

  return {
    accuracy,
    completeness,
    simplicity,
    structure: Math.min(100, structure),
  };
}

export const RUBRIC_CONCEPT_LINKS: Record<RubricDimension, string> = {
  accuracy: "gt",
  completeness: "ms",
  simplicity: "ct",
  structure: "el",
};

export const RUBRIC_GAP_KEYS: Record<RubricDimension, string> = {
  accuracy: "workspace.feynman.gap.accuracy",
  completeness: "workspace.feynman.gap.completeness",
  simplicity: "workspace.feynman.gap.simplicity",
  structure: "workspace.feynman.gap.structure",
};

export const RUBRIC_LABEL_KEYS: Record<RubricDimension, string> = {
  accuracy: "workspace.feynman.rubric.accuracy",
  completeness: "workspace.feynman.rubric.completeness",
  simplicity: "workspace.feynman.rubric.simplicity",
  structure: "workspace.feynman.rubric.structure",
};

export function weakestDimensions(
  scores: RubricScores,
  threshold = 65,
): RubricDimension[] {
  return (Object.keys(scores) as RubricDimension[]).filter(
    (d) => scores[d] < threshold,
  );
}
