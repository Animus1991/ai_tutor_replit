/**
 * Unified tabbed hub for 12 advanced visual learning tools — ported from Option B.
 */

import {
  ColorCodingSystem,
  ConceptTreemap,
  FeynmanCheck,
  KnowledgeFlowSankey,
  LearningTimeline,
  MasteryHeatmap,
  MasteryWaterfall,
  SkillRadar,
  StudyTimer,
} from "@/components/visuals/AdvancedEducationalVisuals";
import { LeitnerSystem } from "@/components/workspace/LeitnerSystem";
import { SideBySideCompare } from "@/components/workspace/SideBySideCompare";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Link } from "@/lib/wouter-compat";
import type { VisualAnalytics } from "@workspace/api-client-react";
import { useState } from "react";

type ToolTab =
  | "leitner"
  | "heatmap"
  | "sankey"
  | "timeline"
  | "colorcode"
  | "treemap"
  | "compare"
  | "waterfall"
  | "radar"
  | "feynman"
  | "errorlog"
  | "pomodoro";

const TOOL_TAB_DEFS: {
  id: ToolTab;
  labelKey: string;
  descKey: string;
  icon: string;
}[] = [
  {
    id: "leitner",
    labelKey: "visual.tools.leitner.label",
    descKey: "visual.tools.leitner.desc",
    icon: "📦",
  },
  {
    id: "heatmap",
    labelKey: "visual.tools.heatmap.label",
    descKey: "visual.tools.heatmap.desc",
    icon: "🟩",
  },
  {
    id: "sankey",
    labelKey: "visual.tools.sankey.label",
    descKey: "visual.tools.sankey.desc",
    icon: "🔀",
  },
  {
    id: "timeline",
    labelKey: "visual.tools.timeline.label",
    descKey: "visual.tools.timeline.desc",
    icon: "📅",
  },
  {
    id: "colorcode",
    labelKey: "visual.tools.colorcode.label",
    descKey: "visual.tools.colorcode.desc",
    icon: "🎨",
  },
  {
    id: "treemap",
    labelKey: "visual.tools.treemap.label",
    descKey: "visual.tools.treemap.desc",
    icon: "🗺️",
  },
  {
    id: "compare",
    labelKey: "visual.tools.compare.label",
    descKey: "visual.tools.compare.desc",
    icon: "⚖️",
  },
  {
    id: "waterfall",
    labelKey: "visual.tools.waterfall.label",
    descKey: "visual.tools.waterfall.desc",
    icon: "📊",
  },
  {
    id: "radar",
    labelKey: "visual.tools.radar.label",
    descKey: "visual.tools.radar.desc",
    icon: "🕸️",
  },
  {
    id: "feynman",
    labelKey: "visual.tools.feynman.label",
    descKey: "visual.tools.feynman.desc",
    icon: "💬",
  },
  {
    id: "errorlog",
    labelKey: "visual.tools.errorlog.label",
    descKey: "visual.tools.errorlog.desc",
    icon: "📕",
  },
  {
    id: "pomodoro",
    labelKey: "visual.tools.pomodoro.label",
    descKey: "visual.tools.pomodoro.desc",
    icon: "⏱️",
  },
];

export function AdvancedVisualTools({
  visualAnalytics,
}: {
  visualAnalytics?: VisualAnalytics;
}) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ToolTab>("leitner");
  const isDemo = !visualAnalytics?.hasRealData;

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-synapse-brand-300/70">
          {t("visual.tools.eyebrow")}
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">
          {t("visual.tools.title")}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-synapse-text-secondary">
          {t("visual.tools.subtitle")}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TOOL_TAB_DEFS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "group min-w-[11rem] shrink-0 rounded-2xl border px-3 py-2.5 text-left transition-all",
              activeTab === tab.id
                ? "border-synapse-brand-500/35 bg-synapse-brand-500/10 shadow-sm"
                : "border-synapse-border-subtle bg-synapse-surface-card hover:bg-synapse-surface-hover",
            )}
          >
            <div className="flex items-center gap-2">
              <span>{tab.icon}</span>
              <span className="text-sm font-semibold">{t(tab.labelKey)}</span>
            </div>
            <div className="mt-0.5 text-[10px] leading-4 text-synapse-text-muted">
              {t(tab.descKey)}
            </div>
          </button>
        ))}
      </div>

      <div
        key={activeTab}
        className="motion-safe:animate-in fade-in duration-300"
      >
        {activeTab === "leitner" && <LeitnerSystem />}
        {activeTab === "heatmap" && (
          <MasteryHeatmap
            cells={visualAnalytics?.masteryHeatmap}
            isDemo={isDemo}
          />
        )}
        {activeTab === "sankey" && (
          <KnowledgeFlowSankey
            links={visualAnalytics?.pipelineFlow}
            isDemo={isDemo}
          />
        )}
        {activeTab === "timeline" && (
          <LearningTimeline
            events={visualAnalytics?.learningTimeline}
            isDemo={isDemo}
          />
        )}
        {activeTab === "colorcode" && <ColorCodingSystem />}
        {activeTab === "treemap" && <ConceptTreemap />}
        {activeTab === "compare" && <SideBySideCompare />}
        {activeTab === "waterfall" && <MasteryWaterfall />}
        {activeTab === "radar" && (
          <SkillRadar axes={visualAnalytics?.skillRadar} isDemo={isDemo} />
        )}
        {activeTab === "feynman" && <FeynmanCheck />}
        {activeTab === "errorlog" && (
          <div className="rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-6 text-center">
            <p className="text-sm text-synapse-text-secondary">
              {t("visual.tools.errorlog.body")}
            </p>
            <Link
              href="/errors"
              className="mt-4 inline-flex rounded-xl bg-synapse-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-synapse-brand-600"
            >
              {t("visual.tools.errorlog.cta")}
            </Link>
          </div>
        )}
        {activeTab === "pomodoro" && <StudyTimer />}
      </div>
    </section>
  );
}
