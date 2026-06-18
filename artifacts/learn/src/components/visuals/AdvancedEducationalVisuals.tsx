/**
 * Advanced analytics visuals ported from Option A.
 * Used by the Analytics page and Pipeline tab.
 */

import {
  RUBRIC_CONCEPT_LINKS,
  RUBRIC_GAP_KEYS,
  RUBRIC_LABEL_KEYS,
  type RubricDimension,
  computeRubric,
  weakestDimensions,
} from "@/lib/feynmanRubric";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function MasteryWaterfall() {
  const steps = [
    { label: "Prior Knowledge", val: 20, isTotal: true },
    { label: "Lesson Video", val: 15, isTotal: false },
    { label: "First Quiz", val: -10, isTotal: false },
    { label: "Error Repair", val: 25, isTotal: false },
    { label: "Spaced Review", val: 10, isTotal: false },
    { label: "Current Mastery", val: 60, isTotal: true },
  ];

  let runningTotal = 0;
  const bars = steps.map((s) => {
    const start = s.isTotal ? 0 : runningTotal;
    const end = s.isTotal ? s.val : runningTotal + s.val;
    runningTotal = end;
    return { ...s, start, end };
  });

  const maxVal = 100;

  return (
    <div className="rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-5">
      <h3 className="mb-4 text-sm font-semibold">
        Mastery Waterfall (Concept: Elasticity)
      </h3>
      <div className="flex h-48 items-end gap-2 pt-6">
        {bars.map((b, i) => {
          const height = (Math.abs(b.end - b.start) / maxVal) * 100;
          const bottom = (Math.min(b.start, b.end) / maxVal) * 100;
          const color = b.isTotal
            ? "#818cf8"
            : b.val > 0
              ? "#34d399"
              : "#fb7185";

          return (
            <div
              key={b.label}
              className="group relative flex flex-1 flex-col items-center"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="relative w-full rounded-sm opacity-90 transition-opacity group-hover:opacity-100"
                style={{
                  height: `${height}%`,
                  marginBottom: `${bottom}%`,
                  backgroundColor: color,
                }}
              >
                <span
                  className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold"
                  style={{ color }}
                >
                  {b.val > 0 && !b.isTotal ? "+" : ""}
                  {b.val}%
                </span>
              </motion.div>
              <div className="absolute -bottom-8 w-16 text-center">
                <span className="block text-[9px] leading-tight text-synapse-text-muted">
                  {b.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-12 rounded-lg bg-synapse-surface-primary/50 p-3 text-xs text-synapse-text-tertiary">
        <span className="font-medium text-synapse-accent-rose">Insights:</span>{" "}
        The First Quiz dropped active mastery, but Error Repair corrected the
        misconception — net gain of 15%.
      </div>
    </div>
  );
}

export type SankeyLink = {
  from: string;
  to: string;
  value: number;
  color: string;
};

const DEFAULT_SANKEY_LINKS: SankeyLink[] = [
  { from: "Upload", to: "OCR / Parse", value: 100, color: "#67e8f9" },
  { from: "OCR / Parse", to: "Chunk & Embed", value: 96, color: "#a78bfa" },
  {
    from: "Chunk & Embed",
    to: "Extract concepts",
    value: 92,
    color: "#a78bfa",
  },
  {
    from: "Extract concepts",
    to: "Generate lesson",
    value: 88,
    color: "#6ee7b7",
  },
  { from: "Generate lesson", to: "Quiz attempt", value: 80, color: "#fbbf24" },
  { from: "Quiz attempt", to: "Correct 1st", value: 52, color: "#6ee7b7" },
  { from: "Quiz attempt", to: "Wrong 1st", value: 28, color: "#f87171" },
  { from: "Correct 1st", to: "Mastered", value: 38, color: "#67e8f9" },
  { from: "Correct 1st", to: "Review queue", value: 14, color: "#fbbf24" },
  { from: "Wrong 1st", to: "Error diagnosis", value: 28, color: "#f87171" },
  { from: "Error diagnosis", to: "Retry queue", value: 22, color: "#fbbf24" },
  { from: "Error diagnosis", to: "Prereq repair", value: 6, color: "#a78bfa" },
  { from: "Prereq repair", to: "Generate lesson", value: 6, color: "#6ee7b7" },
  { from: "Retry queue", to: "Quiz attempt", value: 18, color: "#fbbf24" },
];

export function KnowledgeFlowSankey({
  links = DEFAULT_SANKEY_LINKS,
  isDemo,
}: {
  links?: SankeyLink[];
  isDemo?: boolean;
}) {
  const { t } = useTranslation();
  const nodeNames = [...new Set(links.flatMap((l) => [l.from, l.to]))];
  const order = [
    "Upload",
    "OCR / Parse",
    "Chunk & Embed",
    "Extract concepts",
    "Generate lesson",
    "Quiz attempt",
    "Correct 1st",
    "Wrong 1st",
    "Mastered",
    "Review queue",
    "Error diagnosis",
    "Retry queue",
    "Prereq repair",
  ];
  const colMap: Record<string, number> = {};
  order.forEach((name, i) => {
    colMap[name] = i;
  });
  const maxCol = order.length - 1;
  const ySlots: Record<string, number> = {
    Upload: 50,
    "OCR / Parse": 50,
    "Chunk & Embed": 50,
    "Extract concepts": 50,
    "Generate lesson": 42,
    "Quiz attempt": 42,
    "Correct 1st": 28,
    "Wrong 1st": 65,
    Mastered: 20,
    "Review queue": 42,
    "Error diagnosis": 65,
    "Retry queue": 52,
    "Prereq repair": 78,
  };

  return (
    <div className="rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-5">
      <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
        {t("visual.sankey.title")}
        {isDemo && (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-normal text-synapse-text-muted">
            {t("visual.demoBadge")}
          </span>
        )}
      </h3>
      <p className="mb-4 text-xs text-synapse-text-muted">
        {t("visual.sankey.subtitle")}
      </p>
      <div className="overflow-x-auto rounded-xl border border-synapse-border-subtle bg-synapse-surface-primary/30 p-3">
        <svg viewBox="0 0 1000 240" className="h-[280px] w-full min-w-[700px]">
          {links.map((link) => {
            const x1 = ((colMap[link.from] ?? 0) / maxCol) * 920 + 40;
            const x2 = ((colMap[link.to] ?? 0) / maxCol) * 920 + 40;
            const y1 = ((ySlots[link.from] ?? 50) / 100) * 220;
            const y2 = ((ySlots[link.to] ?? 50) / 100) * 220;
            const thickness = Math.max(2.5, link.value / 12);
            return (
              <path
                key={`${link.from}-${link.to}`}
                d={`M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`}
                fill="none"
                stroke={link.color}
                strokeWidth={thickness}
                strokeOpacity={0.45}
                strokeLinecap="round"
              />
            );
          })}
          {nodeNames.map((name) => {
            const cx = ((colMap[name] ?? 0) / maxCol) * 920 + 40;
            const cy = ((ySlots[name] ?? 50) / 100) * 220;
            const col =
              name.includes("Wrong") || name.includes("Error")
                ? "#f87171"
                : name.includes("Mastered")
                  ? "#6ee7b7"
                  : name.includes("Retry") || name.includes("Review")
                    ? "#fbbf24"
                    : "#67e8f9";
            return (
              <g key={name}>
                <circle cx={cx} cy={cy} r="16" fill={col} opacity={0.18} />
                <circle cx={cx} cy={cy} r="8" fill={col} opacity={0.85} />
                <text
                  x={cx}
                  y={cy + 28}
                  textAnchor="middle"
                  className="fill-synapse-text-secondary text-[9px] font-medium"
                >
                  {name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export function ConceptTreemap() {
  const blocks = [
    { label: "Supply & Demand", mastery: 92, x: 0, y: 0, w: 60, h: 60 },
    { label: "Consumer Theory", mastery: 78, x: 60, y: 0, w: 40, h: 40 },
    { label: "Elasticity", mastery: 45, x: 60, y: 40, w: 40, h: 20 },
    { label: "Market Structures", mastery: 45, x: 0, y: 60, w: 50, h: 40 },
    { label: "Welfare Econ", mastery: 20, x: 50, y: 60, w: 50, h: 20 },
    { label: "Game Theory", mastery: 0, x: 50, y: 80, w: 50, h: 20 },
  ];

  const getColor = (m: number) =>
    m >= 80 ? "#059669" : m >= 60 ? "#d97706" : m >= 40 ? "#0284c7" : "#be123c";

  return (
    <div className="rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-5">
      <h3 className="mb-4 text-sm font-semibold">
        Exam Importance vs Mastery (Treemap)
      </h3>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-synapse-border-subtle">
        {blocks.map((b, i) => (
          <motion.div
            key={b.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="absolute flex flex-col justify-between overflow-hidden border border-synapse-surface-card p-2 transition-opacity hover:opacity-80"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.w}%`,
              height: `${b.h}%`,
              backgroundColor: getColor(b.mastery),
            }}
          >
            <span className="text-[10px] font-bold leading-tight text-white shadow-sm">
              {b.label}
            </span>
            <span className="self-end text-xs font-black text-white/50">
              {b.mastery}%
            </span>
          </motion.div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-synapse-text-muted">
        Size = importance for exam. Color = current mastery level.
      </p>
    </div>
  );
}

export function MasteryHeatmap({
  cells,
  isDemo,
}: {
  cells?: Array<{ concept: string; day: number; value: number }>;
  isDemo?: boolean;
}) {
  const { t } = useTranslation();
  const fallbackConcepts = [
    "Supply & Demand",
    "Elasticity",
    "Market Structures",
    "Game Theory",
  ];
  const fallbackMatrix = [
    [20, 30, 45, 60, 75, 70, 85, 90, 92, 95],
    [0, 0, 10, 20, 15, 30, 40, 35, 45, 45],
    [0, 0, 0, 0, 20, 40, 50, 45, 55, 65],
    [0, 0, 0, 0, 0, 0, 0, 0, 10, 20],
  ];

  const concepts =
    cells && cells.length > 0
      ? [...new Set(cells.map((c) => c.concept))]
      : fallbackConcepts;
  const days =
    cells && cells.length > 0 ? Math.max(...cells.map((c) => c.day)) + 1 : 10;

  const getColor = (m: number) => {
    if (m === 0) return "bg-synapse-surface-hover";
    if (m < 40) return "bg-rose-500/80";
    if (m < 60) return "bg-sky-500/80";
    if (m < 80) return "bg-amber-500/80";
    return "bg-emerald-500/80";
  };

  const bandColor = (v: number) =>
    v >= 80 ? "#6ee7b7" : v >= 60 ? "#67e8f9" : v >= 40 ? "#fbbf24" : "#f87171";

  return (
    <div className="overflow-x-auto rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-5">
      <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
        {t("visual.heatmap.title")}
        {isDemo && (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-normal text-synapse-text-muted">
            {t("visual.demoBadge")}
          </span>
        )}
      </h3>
      <div className="min-w-[500px]">
        <div className="mb-2 flex">
          <div className="w-32" />
          {Array.from({ length: days }, (_, i) => (
            <div
              key={i}
              className="flex-1 text-center text-[9px] text-synapse-text-muted"
            >
              {cells ? i : `Day ${i + 1}`}
            </div>
          ))}
        </div>
        {concepts.map((concept, i) => (
          <div key={concept} className="mb-1 flex items-center gap-2">
            <div className="w-32 truncate pr-2 text-right text-xs text-synapse-text-secondary">
              {concept}
            </div>
            {Array.from({ length: days }, (_, j) => {
              const val = cells
                ? (cells.find((c) => c.concept === concept && c.day === j)
                    ?.value ?? 0)
                : (fallbackMatrix[i]?.[j] ?? 0);
              return (
                <motion.div
                  key={j}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: (i * days + j) * 0.015 }}
                  className={cn(
                    "group relative aspect-square flex-1 rounded-[4px]",
                    cells ? "" : getColor(val),
                  )}
                  style={
                    cells
                      ? {
                          backgroundColor: bandColor(val),
                          opacity: 0.3 + (val / 100) * 0.7,
                        }
                      : undefined
                  }
                  title={`${val}% mastery`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LearningTimeline({
  events: apiEvents,
  isDemo,
}: {
  events?: Array<{
    id: string;
    day: number;
    label: string;
    type: "lesson" | "quiz" | "review" | "error" | "mastery";
    detail: string;
    delta: number;
  }>;
  isDemo?: boolean;
}) {
  const fallbackEvents = [
    {
      id: "1",
      time: "10:00 AM",
      title: "Completed Lesson: Monopoly",
      color: "text-synapse-brand-400",
      border: "border-synapse-brand-500",
    },
    {
      id: "2",
      time: "10:25 AM",
      title: "Failed Quiz: Deadweight Loss",
      desc: "Identified misconception regarding ATC vs MC",
      color: "text-synapse-accent-rose",
      border: "border-synapse-accent-rose",
    },
    {
      id: "3",
      time: "10:30 AM",
      title: "Prerequisite Repair",
      desc: "AI guided through MC intersection graph",
      color: "text-synapse-accent-amber",
      border: "border-synapse-accent-amber",
    },
    {
      id: "4",
      time: "10:45 AM",
      title: "Passed Review Quiz",
      desc: "Deadweight loss mastery increased to 60%",
      color: "text-synapse-accent-emerald",
      border: "border-synapse-accent-emerald",
    },
  ];

  const typeStyle: Record<string, { color: string; border: string }> = {
    lesson: {
      color: "text-synapse-brand-400",
      border: "border-synapse-brand-500",
    },
    quiz: { color: "text-violet-400", border: "border-violet-500/50" },
    review: {
      color: "text-synapse-accent-emerald",
      border: "border-synapse-accent-emerald",
    },
    error: {
      color: "text-synapse-accent-rose",
      border: "border-synapse-accent-rose",
    },
    mastery: {
      color: "text-synapse-accent-amber",
      border: "border-synapse-accent-amber",
    },
  };

  if (apiEvents && apiEvents.length > 0) {
    return (
      <div className="rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          Learning Timeline
          {isDemo && (
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-normal text-synapse-text-muted">
              demo preview
            </span>
          )}
        </h3>
        <div className="relative ml-3 space-y-4 border-l-2 border-synapse-surface-hover py-2">
          {apiEvents.map((event) => {
            const style = typeStyle[event.type] ?? typeStyle.lesson!;
            return (
              <div key={event.id} className="relative pl-6">
                <div
                  className={cn(
                    "absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 bg-synapse-surface-card",
                    style.border,
                  )}
                />
                <p className="text-[10px] text-synapse-text-muted">
                  Day {event.day}
                </p>
                <p className={cn("text-sm font-semibold", style.color)}>
                  {event.label}
                </p>
                <p className="mt-1 text-xs text-synapse-text-secondary">
                  {event.detail}
                </p>
                {event.delta !== 0 && (
                  <span
                    className={cn(
                      "text-xs font-bold",
                      event.delta > 0 ? "text-emerald-400" : "text-rose-400",
                    )}
                  >
                    {event.delta > 0 ? "+" : ""}
                    {event.delta}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-5">
      <h3 className="mb-4 text-sm font-semibold">Learning Timeline</h3>
      <div className="relative ml-3 space-y-6 border-l-2 border-synapse-surface-hover py-2">
        {fallbackEvents.map((e, i) => (
          <motion.div
            key={e.title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="relative pl-6"
          >
            <div
              className={cn(
                "absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 bg-synapse-surface-card",
                e.border,
              )}
            />
            <p className="mb-0.5 text-[10px] text-synapse-text-muted">
              {e.time}
            </p>
            <p className={cn("text-sm font-semibold", e.color)}>{e.title}</p>
            {"desc" in e && e.desc && (
              <p className="mt-1 text-xs text-synapse-text-secondary">
                {e.desc}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function ColorCodingSystem() {
  const colors = [
    {
      name: "Emerald",
      hex: "#34d399",
      usage: "Mastery ≥80%, correct answers, safe to transfer",
      sci: "Positive reinforcement; indicates psychological safety.",
    },
    {
      name: "Amber",
      hex: "#fbbf24",
      usage: "Mastery 60–79%, minor misconceptions, warnings",
      sci: "Prompts caution without triggering failure anxiety.",
    },
    {
      name: "Sky",
      hex: "#38bdf8",
      usage: "Mastery 40–59%, neutral information, premises",
      sci: "Low cognitive load, neutral analytical reading.",
    },
    {
      name: "Rose",
      hex: "#fb7185",
      usage: "Mastery <40%, core errors, refutations",
      sci: "Demands immediate attention; used sparingly.",
    },
    {
      name: "Indigo",
      hex: "#818cf8",
      usage: "Primary brand, AI actions, aggregate values",
      sci: "Denotes systemic authority and AI orchestration.",
    },
  ];

  return (
    <div className="rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-5">
      <h3 className="mb-4 text-sm font-semibold">
        Emphatic Color System & Cognitive Rationale
      </h3>
      <div className="space-y-3">
        {colors.map((c) => (
          <div
            key={c.name}
            className="flex gap-4 rounded-xl border border-synapse-border-subtle bg-synapse-surface-primary/50 p-3"
          >
            <div
              className="h-12 w-12 shrink-0 rounded-lg"
              style={{ backgroundColor: c.hex }}
            />
            <div>
              <p className="text-sm font-bold" style={{ color: c.hex }}>
                {c.name}{" "}
                <span className="ml-2 font-mono text-[10px] font-normal text-synapse-text-muted">
                  {c.hex}
                </span>
              </p>
              <p className="mt-1 text-xs text-foreground">
                <span className="text-synapse-text-muted">Usage:</span>{" "}
                {c.usage}
              </p>
              <p className="mt-0.5 text-xs text-synapse-text-secondary">
                <span className="text-synapse-text-muted">Science:</span>{" "}
                {c.sci}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Multi-axis learner profile — accepts API radar axes or uses defaults. */
export function SkillRadar({
  axes: apiAxes,
  isDemo,
}: {
  axes?: Array<{ label: string; value: number; max?: number }>;
  isDemo?: boolean;
}) {
  const axes = apiAxes ?? [
    { label: "Retrieval", value: 72 },
    { label: "Transfer", value: 48 },
    { label: "Speed", value: 55 },
    { label: "Confidence", value: 64 },
    { label: "Depth", value: 78 },
    { label: "Retention", value: 60 },
  ];
  const cx = 200;
  const cy = 200;
  const maxR = 160;
  const n = axes.length;
  const points = axes.map((axis, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (axis.value / 100) * maxR;
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      lx: cx + Math.cos(angle) * (maxR + 24),
      ly: cy + Math.sin(angle) * (maxR + 24),
      label: axis.label,
      value: axis.value,
    };
  });
  const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        Skill Radar — Multi-Axis Profile
        {isDemo && (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-normal text-synapse-text-muted">
            demo preview
          </span>
        )}
      </h3>
      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="flex items-center justify-center rounded-xl border border-synapse-border-subtle bg-synapse-surface-primary/30 p-4">
          <svg viewBox="0 0 400 400" className="h-[280px] w-[280px]">
            {[0.25, 0.5, 0.75, 1].map((ring) => (
              <polygon
                key={ring}
                points={Array.from({ length: n }, (_, i) => {
                  const a = (Math.PI * 2 * i) / n - Math.PI / 2;
                  return `${cx + Math.cos(a) * maxR * ring},${cy + Math.sin(a) * maxR * ring}`;
                }).join(" ")}
                className="fill-none stroke-synapse-border-subtle"
                strokeWidth="1"
              />
            ))}
            {points.map((_, i) => (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={cx + Math.cos((Math.PI * 2 * i) / n - Math.PI / 2) * maxR}
                y2={cy + Math.sin((Math.PI * 2 * i) / n - Math.PI / 2) * maxR}
                className="stroke-synapse-border-subtle"
                strokeWidth="1"
              />
            ))}
            <polygon
              points={polygon}
              className="fill-synapse-brand-500/15 stroke-synapse-brand-400"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {points.map((p) => (
              <g key={p.label}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  className="fill-synapse-brand-400"
                />
                <text
                  x={p.lx}
                  y={p.ly + 4}
                  textAnchor="middle"
                  className="fill-synapse-text-secondary text-[11px] font-medium"
                >
                  {p.label}
                </text>
                <text
                  x={p.lx}
                  y={p.ly + 18}
                  textAnchor="middle"
                  className="fill-synapse-brand-300 text-[10px]"
                >
                  {p.value}%
                </text>
              </g>
            ))}
          </svg>
        </div>
        <div className="space-y-3">
          {axes.map((axis) => (
            <div
              key={axis.label}
              className="rounded-xl border border-synapse-border-subtle bg-synapse-surface-primary/50 p-3"
            >
              <div className="flex items-center justify-between text-sm">
                <span>{axis.label}</span>
                <span className="text-synapse-brand-300">{axis.value}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-synapse-surface-hover">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-synapse-brand-400 to-synapse-accent-emerald"
                  style={{ width: `${axis.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Feynman technique check — OpenAI-backed with heuristic fallback offline. */
export function FeynmanCheck({
  concept,
  showRubric = false,
  onFocusConcept,
}: {
  concept?: string;
  showRubric?: boolean;
  onFocusConcept?: (conceptId: string) => void;
}) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiFeedback, setApiFeedback] = useState<{
    score: number;
    issues: string[];
    isDemo?: boolean;
  } | null>(null);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const rubric = useMemo(() => {
    if (wordCount < 8) return null;
    const scores = computeRubric(text, wordCount);
    return { scores, weak: weakestDimensions(scores) };
  }, [text, wordCount]);

  const heuristicFeedback = useMemo(() => {
    if (wordCount < 10) return null;
    const issues: string[] = [];
    if (!text.toLowerCase().includes("because"))
      issues.push(
        "Missing causal explanation — add a 'because' or 'this happens when'.",
      );
    if (!text.toLowerCase().includes("example"))
      issues.push(
        "No concrete example — try adding 'for example' or 'such as'.",
      );
    if (text.length > 400 && wordCount > 60)
      issues.push(
        "Getting long — can you compress the core idea into fewer words?",
      );
    if (wordCount < 20)
      issues.push(
        "Very brief — try expanding the mechanism, not just the label.",
      );
    return {
      score: Math.max(
        20,
        Math.min(95, 40 + wordCount * 1.2 - issues.length * 12),
      ),
      issues:
        issues.length > 0
          ? issues
          : [
              "Good structure — now test whether you can still recall this tomorrow.",
            ],
      isDemo: true,
    };
  }, [text, wordCount]);

  useEffect(() => {
    if (wordCount < 25) {
      setApiFeedback(null);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { postFeynmanCheck } = await import("@/lib/feynmanApi");
        const result = await postFeynmanCheck({ explanation: text, concept });
        setApiFeedback(result);
      } catch {
        setApiFeedback(null);
      } finally {
        setLoading(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [text, wordCount, concept]);

  const feedback = apiFeedback ?? heuristicFeedback;

  const outlineItems = [1, 2, 3, 4] as const;
  const rubricDims: RubricDimension[] = [
    "accuracy",
    "completeness",
    "simplicity",
    "structure",
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card">
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="mb-1 text-sm font-semibold">
          {t("visual.feynman.title")}
        </h3>
        <p className="mb-3 text-xs text-synapse-text-muted">
          {t("visual.feynman.placeholder")}
        </p>
        <div className="grid gap-3 xl:grid-cols-[1fr_0.85fr]">
          <div className="space-y-3">
            {showRubric && (
              <div className="rounded-xl border border-synapse-border-subtle bg-synapse-surface-primary/40 p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-synapse-text-muted">
                  {t("workspace.feynman.outline.title")}
                </p>
                <ul className="space-y-1 text-[11px] text-synapse-text-secondary">
                  {outlineItems.map((n) => (
                    <li key={n}>• {t(`workspace.feynman.outline.${n}`)}</li>
                  ))}
                </ul>
              </div>
            )}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={7}
              placeholder={t("visual.feynman.placeholder")}
              className="w-full rounded-xl border border-synapse-border-subtle bg-synapse-surface-primary p-3 text-sm leading-6 text-foreground outline-none placeholder:text-synapse-text-muted focus:border-synapse-brand-500/40"
            />
            <div className="flex items-center justify-between text-xs text-synapse-text-muted">
              <span>{wordCount} words</span>
              <span className="flex items-center gap-2">
                {loading && <span>{t("visual.feynman.analyzing")}</span>}
                {feedback && (
                  <span className="font-semibold text-synapse-brand-300">
                    {t("visual.feynman.score")}: {Math.round(feedback.score)}%
                    {feedback.isDemo && !apiFeedback ? " (offline)" : ""}
                  </span>
                )}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            {showRubric && rubric && (
              <div className="rounded-xl border border-synapse-border-subtle bg-synapse-surface-primary/40 p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-synapse-text-muted">
                  {t("workspace.feynman.rubric.title")}
                </p>
                <div className="space-y-2">
                  {rubricDims.map((dim) => (
                    <div key={dim}>
                      <div className="mb-0.5 flex justify-between text-[10px]">
                        <span>{t(RUBRIC_LABEL_KEYS[dim])}</span>
                        <span className="font-mono text-synapse-brand-300">
                          {rubric.scores[dim]}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-synapse-brand-500 transition-all"
                          style={{ width: `${rubric.scores[dim]}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showRubric && rubric && rubric.weak.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-synapse-text-muted">
                  {t("workspace.feynman.gaps.title")}
                </p>
                {rubric.weak.map((dim) => (
                  <div
                    key={dim}
                    className="rounded-lg border border-synapse-border-subtle bg-synapse-surface-primary/50 p-2.5 text-[11px] leading-5 text-synapse-text-secondary"
                  >
                    <p>{t(RUBRIC_GAP_KEYS[dim])}</p>
                    {onFocusConcept && (
                      <button
                        type="button"
                        onClick={() =>
                          onFocusConcept(RUBRIC_CONCEPT_LINKS[dim])
                        }
                        className="mt-1 text-[10px] font-medium text-synapse-brand-300 hover:underline"
                      >
                        {t("workspace.feynman.gap.mapLink")}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="text-[10px] uppercase tracking-widest text-synapse-text-muted">
              Feedback
            </div>
            {feedback ? (
              feedback.issues.map((issue) => (
                <div
                  key={issue}
                  className="rounded-xl border border-synapse-border-subtle bg-synapse-surface-primary/50 p-2.5 text-sm leading-6 text-synapse-text-secondary"
                >
                  {issue}
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-synapse-border-subtle bg-synapse-surface-primary/50 p-3 text-sm text-synapse-text-muted">
                Start writing to receive feedback...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Pomodoro study timer — ported from Option B VisualTools. */
export function StudyTimer() {
  const [mode, setMode] = useState<"focus" | "break" | "deep">("focus");
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const durations = { focus: 25 * 60, break: 5 * 60, deep: 50 * 60 };
  const target = durations[mode];
  const remaining = Math.max(0, target - seconds);
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = (seconds / target) * 100;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const reset = useCallback(() => {
    setRunning(false);
    setSeconds(0);
  }, []);

  return (
    <div className="rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-5">
      <h3 className="mb-2 text-sm font-semibold">Study Timer — Pomodoro</h3>
      <p className="mb-4 text-xs text-synapse-text-muted">
        Choose a session length and track focused study time. Breaks manage
        cognitive load.
      </p>
      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <div className="flex flex-col items-center rounded-2xl border border-synapse-border-subtle bg-synapse-surface-primary/30 p-6">
          <div className="relative h-40 w-40">
            <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
              <circle
                cx="90"
                cy="90"
                r="76"
                className="fill-none stroke-synapse-surface-hover"
                strokeWidth="10"
              />
              <circle
                cx="90"
                cy="90"
                r="76"
                className="fill-none stroke-synapse-brand-400"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 76}
                strokeDashoffset={2 * Math.PI * 76 * (1 - progress / 100)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-semibold tabular-nums">
                {String(minutes).padStart(2, "0")}:
                {String(secs).padStart(2, "0")}
              </div>
              <div className="mt-1 text-xs uppercase tracking-widest text-synapse-text-muted">
                {mode}
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setRunning(!running)}
              className={cn(
                "rounded-xl px-5 py-2.5 text-sm font-semibold transition",
                running
                  ? "bg-synapse-accent-rose/20 text-synapse-accent-rose hover:bg-synapse-accent-rose/30"
                  : "bg-synapse-accent-emerald/20 text-synapse-accent-emerald hover:bg-synapse-accent-emerald/30",
              )}
            >
              {running ? "Pause" : "Start"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-xl bg-synapse-surface-hover px-4 py-2.5 text-sm text-synapse-text-secondary hover:bg-synapse-surface-hover/80"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {(
            [
              ["focus", "25 min", "One lesson, two recall checks, one recap."],
              ["break", "5 min", "Rest. Let consolidation happen."],
              [
                "deep",
                "50 min",
                "Full concept map, examples, practice, mini-test.",
              ],
            ] as const
          ).map(([m, dur, desc]) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                reset();
              }}
              className={cn(
                "w-full rounded-xl border p-4 text-left transition-all",
                mode === m
                  ? "border-synapse-brand-500/35 bg-synapse-brand-500/10"
                  : "border-synapse-border-subtle bg-synapse-surface-primary/50 hover:bg-synapse-surface-hover",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold capitalize">{m}</span>
                <span className="text-xs text-synapse-text-muted">{dur}</span>
              </div>
              <p className="mt-1 text-sm leading-6 text-synapse-text-secondary">
                {desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
