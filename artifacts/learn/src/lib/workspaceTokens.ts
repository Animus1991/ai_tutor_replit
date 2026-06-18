/**
 * Study Workspace — high-contrast palette tuned for dark UI.
 * Colors chosen for ≥4.5:1 contrast against #0f0a1e node fill / #12101f card bg.
 */

export const WS_MASTERY = {
  strong: "#34d399",
  proficient: "#fbbf24",
  developing: "#67e8f9",
  weak: "#fb7185",
  none: "#9d97b8",
} as const;

export function masteryColor(m: number): string {
  if (m >= 80) return WS_MASTERY.strong;
  if (m >= 60) return WS_MASTERY.proficient;
  if (m >= 40) return WS_MASTERY.developing;
  if (m > 0) return WS_MASTERY.weak;
  return WS_MASTERY.none;
}

export const WS_GRAPH = {
  edgeDefault: "#6b6494",
  edgeLit: "#a5b4fc",
  nodeFill: "#12101f",
  labelDefault: "#c8c4dc",
  labelSelected: "#f5f3ff",
  axisLabel: "#9d97b8",
} as const;

export const WS_SURPLUS = {
  consumer: "#34d399",
  producer: "#818cf8",
  equilibrium: "#f5f3ff",
} as const;

export const WS_ACCENT = {
  brand: "#a78bfa",
  brandMuted: "#c4b5fd",
  teal: "#5eead4",
  amber: "#fcd34d",
  emerald: "#6ee7b7",
  cyan: "#67e8f9",
} as const;
