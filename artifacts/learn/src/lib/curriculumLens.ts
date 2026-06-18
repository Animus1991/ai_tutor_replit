/**
 * Theory / Practice curriculum previews — i18n-driven lens switcher.
 */

import type { Locale } from "@/lib/i18n";
import { t as translate } from "@/lib/i18n";

export type CurriculumLens = "theory" | "practice";

export interface CurriculumPreview {
  headline: string;
  subheadline: string;
  audience: string;
  promise: string;
  heroSteps: { title: string; body: string }[];
  lessonFormat: string[];
  sampleTopic: string;
}

export function getCurriculumPreview(lens: CurriculumLens): CurriculumPreview {
  const p = `lens.${lens}`;
  return {
    headline: translate(`${p}.headline`),
    subheadline: translate(`${p}.subheadline`),
    audience: translate(`${p}.audience`),
    promise: translate(`${p}.promise`),
    heroSteps: [1, 2, 3, 4].map((n) => ({
      title: translate(`${p}.step${n}.title`),
      body: translate(`${p}.step${n}.body`),
    })),
    lessonFormat: translate(`${p}.lessonFormat`).split("|"),
    sampleTopic: translate(`${p}.sampleTopic`),
  };
}

/** @deprecated use getCurriculumPreview — kept for static imports */
export const CURRICULUM_BY_LENS: Record<CurriculumLens, CurriculumPreview> = {
  theory: getCurriculumPreview("theory"),
  practice: getCurriculumPreview("practice"),
};

export function resolveCurriculumLens(
  lens: CurriculumLens,
  _locale?: Locale,
): CurriculumPreview {
  return getCurriculumPreview(lens);
}
