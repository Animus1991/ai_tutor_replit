import type {
  DragEdge,
  DragNode,
} from "@/components/workspace/DraggableConceptMap";
import type { useTranslation } from "@/lib/i18n";

type TFn = ReturnType<typeof useTranslation>["t"];

const CONCEPT_LAYOUT = [
  {
    id: "sd",
    key: "workspace.concept.sd",
    mastery: 92,
    type: "concept" as const,
    x: 140,
    y: 80,
  },
  {
    id: "ct",
    key: "workspace.concept.ct",
    mastery: 78,
    type: "theory" as const,
    x: 360,
    y: 60,
  },
  {
    id: "el",
    key: "workspace.concept.el",
    mastery: 45,
    type: "formula" as const,
    x: 140,
    y: 240,
  },
  {
    id: "ms",
    key: "workspace.concept.ms",
    mastery: 45,
    type: "concept" as const,
    x: 380,
    y: 210,
  },
  {
    id: "we",
    key: "workspace.concept.we",
    mastery: 20,
    type: "theory" as const,
    x: 560,
    y: 130,
  },
  {
    id: "gt",
    key: "workspace.concept.gt",
    mastery: 0,
    type: "concept" as const,
    x: 560,
    y: 300,
  },
];

export function getConceptNodes(t: TFn): DragNode[] {
  return CONCEPT_LAYOUT.map((n) => ({
    id: n.id,
    label: t(n.key),
    mastery: n.mastery,
    type: n.type,
    x: n.x,
    y: n.y,
  }));
}

export const CONCEPT_EDGES: DragEdge[] = [
  { from: "sd", to: "ct", relation: "prerequisite" },
  { from: "sd", to: "el", relation: "prerequisite" },
  { from: "sd", to: "ms", relation: "prerequisite" },
  { from: "ct", to: "ms", relation: "prerequisite" },
  { from: "ms", to: "we", relation: "prerequisite" },
  { from: "ms", to: "gt", relation: "prerequisite" },
  { from: "el", to: "we", relation: "related" },
];
