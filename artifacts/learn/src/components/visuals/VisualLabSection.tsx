/**
 * Visual learning lab — 6 diagram modes from Option B VisualLabSection.
 */

import { ConceptGraph } from "@/components/visuals/ConceptGraph";
import { RetentionCurve } from "@/components/visuals/DiagramGenerator";
import { ReadinessRing } from "@/components/visuals/ReadinessRing";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

type VisualMode =
  | "source"
  | "concept"
  | "mastery"
  | "retention"
  | "exam"
  | "formula";

const VISUAL_MODE_DEFS: {
  id: VisualMode;
  titleKey: string;
  subtitleKey: string;
  hintKey: string;
}[] = [
  {
    id: "source",
    titleKey: "visualLab.mode.source.title",
    subtitleKey: "visualLab.mode.source.subtitle",
    hintKey: "visualLab.mode.source.hint",
  },
  {
    id: "concept",
    titleKey: "visualLab.mode.concept.title",
    subtitleKey: "visualLab.mode.concept.subtitle",
    hintKey: "visualLab.mode.concept.hint",
  },
  {
    id: "mastery",
    titleKey: "visualLab.mode.mastery.title",
    subtitleKey: "visualLab.mode.mastery.subtitle",
    hintKey: "visualLab.mode.mastery.hint",
  },
  {
    id: "retention",
    titleKey: "visualLab.mode.retention.title",
    subtitleKey: "visualLab.mode.retention.subtitle",
    hintKey: "visualLab.mode.retention.hint",
  },
  {
    id: "exam",
    titleKey: "visualLab.mode.exam.title",
    subtitleKey: "visualLab.mode.exam.subtitle",
    hintKey: "visualLab.mode.exam.hint",
  },
  {
    id: "formula",
    titleKey: "visualLab.mode.formula.title",
    subtitleKey: "visualLab.mode.formula.subtitle",
    hintKey: "visualLab.mode.formula.hint",
  },
];

const SOURCE_STEP_KEYS = [
  {
    title: "visualLab.source.upload.title",
    body: "visualLab.source.upload.body",
  },
  { title: "visualLab.source.ocr.title", body: "visualLab.source.ocr.body" },
  {
    title: "visualLab.source.chunk.title",
    body: "visualLab.source.chunk.body",
  },
  {
    title: "visualLab.source.graph.title",
    body: "visualLab.source.graph.body",
  },
  {
    title: "visualLab.source.tutor.title",
    body: "visualLab.source.tutor.body",
  },
] as const;

const EXAM_NODE_KEYS = [
  { x: 100, title: "visualLab.exam.now.label", sub: "visualLab.exam.now.sub" },
  { x: 230, title: "visualLab.exam.2d.label", sub: "visualLab.exam.2d.sub" },
  { x: 380, title: "visualLab.exam.5d.label", sub: "visualLab.exam.5d.sub" },
  { x: 540, title: "visualLab.exam.8d.label", sub: "visualLab.exam.8d.sub" },
  {
    x: 670,
    title: "visualLab.exam.final.label",
    sub: "visualLab.exam.final.sub",
  },
] as const;

const SOURCE_TILE_KEYS = [
  {
    id: "slides",
    symbol: "SL",
    label: "visualLab.tile.slides.label",
    visual: "visualLab.tile.slides.visual",
  },
  {
    id: "textbook",
    symbol: "TX",
    label: "visualLab.tile.textbook.label",
    visual: "visualLab.tile.textbook.visual",
  },
  {
    id: "problemset",
    symbol: "PS",
    label: "visualLab.tile.problemset.label",
    visual: "visualLab.tile.problemset.visual",
  },
  {
    id: "codelab",
    symbol: "CD",
    label: "visualLab.tile.codelab.label",
    visual: "visualLab.tile.codelab.visual",
  },
] as const;

const FORMULA_SYMBOL_KEYS = [
  { symbol: "α", meaning: "visualLab.formula.symbol.alpha" },
  { symbol: "β", meaning: "visualLab.formula.symbol.beta" },
  { symbol: "first attempts", meaning: "visualLab.formula.symbol.attempts" },
  { symbol: "gate", meaning: "visualLab.formula.symbol.gate" },
] as const;

const DEMO_GRAPH_LAYOUT = [
  {
    id: "ref",
    key: "visualLab.graph.ref",
    mastery: 85,
    type: "concept" as const,
    x: 120,
    y: 90,
  },
  {
    id: "loss",
    key: "visualLab.graph.loss",
    mastery: 62,
    type: "theory" as const,
    x: 320,
    y: 70,
  },
  {
    id: "anchor",
    key: "visualLab.graph.anchor",
    mastery: 74,
    type: "concept" as const,
    x: 200,
    y: 200,
  },
  {
    id: "frame",
    key: "visualLab.graph.frame",
    mastery: 48,
    type: "concept" as const,
    x: 420,
    y: 180,
  },
  {
    id: "choice",
    key: "visualLab.graph.choice",
    mastery: 56,
    type: "theory" as const,
    x: 520,
    y: 280,
  },
];

const DEMO_GRAPH_EDGES = [
  { from: "ref", to: "loss", relation: "prerequisite" as const },
  { from: "ref", to: "frame", relation: "prerequisite" as const },
  { from: "anchor", to: "frame", relation: "related" as const },
  { from: "frame", to: "choice", relation: "prerequisite" as const },
  { from: "loss", to: "choice", relation: "related" as const },
];

function SourceFlowDiagram({ t }: { t: (k: string) => string }) {
  const coords = [78, 226, 372, 522, 622];
  const ys = [88, 88, 88, 88, 198];

  return (
    <svg viewBox="0 0 760 300" className="h-[260px] w-full">
      <defs>
        <linearGradient id="flowGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      {SOURCE_STEP_KEYS.map((step, index) => {
        const x = coords[index];
        const y = ys[index];
        const title = t(step.title);
        const body = t(step.body);
        return (
          <g key={step.title}>
            <rect
              x={x}
              y={y}
              width="110"
              height="76"
              rx="18"
              className="fill-synapse-surface-hover stroke-synapse-border-subtle"
              strokeWidth="1.2"
            />
            <text
              x={x + 55}
              y={y + 28}
              textAnchor="middle"
              className="fill-foreground text-[13px] font-semibold"
            >
              {title}
            </text>
            <text
              x={x + 55}
              y={y + 49}
              textAnchor="middle"
              className="fill-[#b8b3d4] text-[11px]"
            >
              {body}
            </text>
            {index < 4 ? (
              <line
                x1={x + 110}
                y1={y + 38}
                x2={x + 140}
                y2={y + 38}
                stroke="url(#flowGlow)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            ) : null}
          </g>
        );
      })}
      <path
        d="M 562 126 C 602 142, 610 160, 622 198"
        className="fill-none stroke-[url(#flowGlow)]"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExamPathDiagram({ t }: { t: (k: string) => string }) {
  return (
    <div className="space-y-4">
      <svg viewBox="0 0 760 200" className="h-[180px] w-full">
        <line
          x1="70"
          y1="110"
          x2="690"
          y2="110"
          className="stroke-[#6b6494]"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {EXAM_NODE_KEYS.map(({ x, title, sub }) => (
          <g key={title}>
            <circle
              cx={x}
              cy="110"
              r="18"
              className="fill-synapse-brand-500/25 stroke-synapse-brand-400"
              strokeWidth="2"
            />
            <circle cx={x} cy="110" r="6" className="fill-synapse-brand-300" />
            <text
              x={x}
              y="70"
              textAnchor="middle"
              className="fill-foreground text-[13px] font-semibold"
            >
              {t(title)}
            </text>
            <text
              x={x}
              y="150"
              textAnchor="middle"
              className="fill-[#b8b3d4] text-[11px]"
            >
              {t(sub)}
            </text>
          </g>
        ))}
      </svg>
      <div className="grid grid-cols-2 gap-3 text-sm text-[#ddd9ee]">
        <div className="rounded-xl border border-[#5a5280] bg-synapse-surface-primary/50 p-3">
          {t("visualLab.exam.focus1")}
        </div>
        <div className="rounded-xl border border-[#5a5280] bg-synapse-surface-primary/50 p-3">
          {t("visualLab.exam.focus2")}
        </div>
      </div>
    </div>
  );
}

function FormulaExplorerDiagram({ t }: { t: (k: string) => string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-[#5a5280] bg-synapse-surface-primary/30 p-4">
        <div className="text-xs uppercase tracking-widest text-[#b8b3d4]">
          {t("visualLab.formula.exampleLabel")}
        </div>
        <div className="mt-4 rounded-2xl border border-[#5a5280] bg-synapse-surface-card p-4 text-center text-2xl font-semibold text-foreground">
          mastery = α / (α + β)
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          {FORMULA_SYMBOL_KEYS.map(({ symbol, meaning }) => (
            <div
              key={symbol}
              className="rounded-xl border border-[#5a5280] bg-synapse-surface-card p-3"
            >
              <div className="font-semibold text-synapse-brand-300">
                {symbol}
              </div>
              <div className="mt-1 text-[#ddd9ee]">{t(meaning)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-[#5a5280] bg-synapse-surface-primary/30 p-4 text-sm leading-6 text-[#ddd9ee]">
        <div className="text-xs uppercase tracking-widest text-[#b8b3d4]">
          {t("visualLab.formula.hiddenSteps")}
        </div>
        <p className="mt-3">{t("visualLab.formula.hiddenP1")}</p>
        <p className="mt-3">{t("visualLab.formula.hiddenP2")}</p>
      </div>
    </div>
  );
}

export function VisualLabSection() {
  const { t, language } = useTranslation();
  const [visualMode, setVisualMode] = useState<VisualMode>("concept");
  const active = VISUAL_MODE_DEFS.find((m) => m.id === visualMode);

  const demoGraphNodes = useMemo(
    () =>
      DEMO_GRAPH_LAYOUT.map((n) => ({
        id: n.id,
        label: t(n.key),
        mastery: n.mastery,
        type: n.type,
        x: n.x,
        y: n.y,
      })),
    [t, language],
  );

  return (
    <section className="space-y-4 rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-synapse-brand-300/90">
          {t("visualLab.eyebrow")}
        </p>
        <h2 className="mt-1 text-xl font-semibold">{t("visualLab.title")}</h2>
        <p className="mt-2 max-w-2xl text-sm text-[#ddd9ee]">
          {t("visualLab.subtitle")}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {VISUAL_MODE_DEFS.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setVisualMode(mode.id)}
            className={cn(
              "min-w-[10rem] shrink-0 rounded-xl border px-3 py-2.5 text-left transition-colors",
              visualMode === mode.id
                ? "border-synapse-brand-500/45 bg-synapse-brand-500/15"
                : "border-[#5a5280] bg-synapse-surface-primary/50 hover:bg-synapse-surface-hover",
            )}
          >
            <div className="text-sm font-semibold">{t(mode.titleKey)}</div>
            <div className="mt-0.5 text-[11px] text-[#b8b3d4]">
              {t(mode.subtitleKey)}
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-xl border border-[#5a5280] bg-synapse-surface-primary/30 p-4">
          <div className="mb-3">
            <div className="text-xs uppercase tracking-widest text-[#b8b3d4]">
              {t("visualLab.currentMode")}
            </div>
            <div className="text-lg font-semibold">
              {active ? t(active.titleKey) : ""}
            </div>
            <p className="mt-1 text-sm text-[#ddd9ee]">
              {active ? t(active.hintKey) : ""}
            </p>
          </div>
          <div className="rounded-xl border border-[#5a5280] bg-synapse-surface-card p-3">
            {visualMode === "source" && <SourceFlowDiagram t={t} />}
            {visualMode === "concept" && (
              <ConceptGraph
                nodes={demoGraphNodes}
                edges={DEMO_GRAPH_EDGES}
                width={640}
                height={320}
              />
            )}
            {visualMode === "mastery" && (
              <div className="flex justify-center py-4">
                <ReadinessRing
                  value={68}
                  label={t("visualLab.mastery.label")}
                  size={140}
                />
              </div>
            )}
            {visualMode === "retention" && (
              <RetentionCurve
                dataPoints={[
                  { day: 0, retention: 100 },
                  { day: 1, retention: 58 },
                  { day: 3, retention: 42 },
                  { day: 7, retention: 35 },
                  { day: 14, retention: 28 },
                  { day: 21, retention: 72 },
                  { day: 30, retention: 85 },
                ]}
              />
            )}
            {visualMode === "exam" && <ExamPathDiagram t={t} />}
            {visualMode === "formula" && <FormulaExplorerDiagram t={t} />}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#5a5280] bg-synapse-surface-primary/30 p-4 text-sm leading-6 text-[#ddd9ee]">
            <div className="text-xs uppercase tracking-widest text-[#b8b3d4]">
              {t("visualLab.principles.title")}
            </div>
            <ul className="mt-3 list-inside list-disc space-y-2">
              {t("visualLab.principles.items")
                .split("|")
                .map((item) => (
                  <li key={item}>{item}</li>
                ))}
            </ul>
          </div>
          <div className="rounded-xl border border-[#5a5280] bg-synapse-surface-primary/30 p-4">
            <div className="text-xs uppercase tracking-widest text-[#b8b3d4]">
              {t("visualLab.mapping.title")}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {SOURCE_TILE_KEYS.map((tile) => (
                <div
                  key={tile.id}
                  className="rounded-xl border border-[#5a5280] bg-synapse-surface-card p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">
                      {t(tile.label)}
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#5a5280] text-[10px] font-bold text-synapse-brand-300">
                      {tile.symbol}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#b8b3d4]">
                    {t(tile.visual)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
