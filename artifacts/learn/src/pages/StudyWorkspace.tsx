/**
 * StudyWorkspace
 *
 * Full-screen split-view study environment combining a lesson stepper (left
 * pane) and a switchable tools panel (right pane): concept map, parametric
 * sandbox, Leitner box, side-by-side compare, debate tree, cognitive reader,
 * formula scratchpad, source viewer. Layout cycles between split / focus-lesson
 * / focus-tool.
 *
 * Adapted from the Option A reference, wired into our TanStack Router shell.
 */

import { LanguageToggle } from "@/components/LanguageToggle";
import {
  FeynmanCheck,
  StudyTimer,
} from "@/components/visuals/AdvancedEducationalVisuals";
import { AnnotationOverlay } from "@/components/workspace/AnnotationOverlay";
import { ArgumentMap } from "@/components/workspace/ArgumentMap";
import { CognitiveReader } from "@/components/workspace/CognitiveReader";
import { DraggableConceptMap } from "@/components/workspace/DraggableConceptMap";
import { FormulaScratchpad } from "@/components/workspace/FormulaScratchpad";
import { InteractiveSimulator } from "@/components/workspace/InteractiveSimulator";
import { LeitnerSystem } from "@/components/workspace/LeitnerSystem";
import {
  LessonStepFooter,
  SocraticChips,
  SourceCitation,
} from "@/components/workspace/LessonPaneExtras";
import { MiniDashboard } from "@/components/workspace/MiniDashboard";
import { SideBySideCompare } from "@/components/workspace/SideBySideCompare";
import { StudyWhiteboard } from "@/components/workspace/StudyWhiteboard";
import { useTranslation } from "@/lib/i18n";
import {
  DASHBOARD_ACTION_TARGETS,
  LESSON_SCRATCHPAD_LINK,
} from "@/lib/i18n-sprint3";
import { cn } from "@/lib/utils";
import { CONCEPT_EDGES, getConceptNodes } from "@/lib/workspaceContent";
import type { WorkspaceTool } from "@/pages/StudyWorkspace.types";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Calculator,
  ChevronRight,
  FileText,
  GitCommit,
  Layers,
  Layout,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  PenSquare,
  SlidersHorizontal,
  Sparkles,
  SplitSquareHorizontal,
  Timer,
  Type,
  X,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

type LayoutMode = "split" | "focus-lesson" | "focus-tool";

const TOOL_DEFS: {
  id: WorkspaceTool;
  Icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
}[] = [
  { id: "concept-map", Icon: MapIcon, labelKey: "workspace.tool.map.short" },
  {
    id: "simulator",
    Icon: SlidersHorizontal,
    labelKey: "workspace.tool.sandbox.short",
  },
  { id: "leitner", Icon: Layers, labelKey: "workspace.tool.leitner.short" },
  {
    id: "compare",
    Icon: SplitSquareHorizontal,
    labelKey: "workspace.tool.compare.short",
  },
  { id: "whiteboard", Icon: PenSquare, labelKey: "workspace.tool.whiteboard" },
  { id: "feynman", Icon: Sparkles, labelKey: "workspace.tool.feynman" },
  { id: "timer", Icon: Timer, labelKey: "workspace.tool.timer" },
  { id: "debate", Icon: GitCommit, labelKey: "workspace.tool.debate.short" },
  { id: "reader", Icon: Type, labelKey: "workspace.tool.reader.short" },
  {
    id: "scratchpad",
    Icon: Calculator,
    labelKey: "workspace.tool.formulas.short",
  },
  {
    id: "annotations",
    Icon: FileText,
    labelKey: "workspace.tool.source.short",
  },
];

const STEP_COUNT = 6;

const READER_SAMPLE_KEY = "workspace.reader.sample";

const STEPS = Array.from({ length: STEP_COUNT }, (_, i) => ({
  titleKey: `workspace.step.${i}.title` as const,
}));

export default function StudyWorkspacePage() {
  const { t, language } = useTranslation();
  const conceptNodes = useMemo(() => getConceptNodes(t), [t, language]);
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState<WorkspaceTool>("concept-map");
  const [layout, setLayout] = useState<LayoutMode>("split");
  const [splitPos, setSplitPos] = useState(50);
  const [lessonCollapsed, setLessonCollapsed] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [retrievalPassed, setRetrievalPassed] = useState<
    Record<number, boolean>
  >({
    5: true,
  });
  const resizing = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResizeStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      resizing.current = true;
      const startX = e.clientX;
      const startSplit = splitPos;

      const onMove = (ev: PointerEvent) => {
        if (!resizing.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const dx = ev.clientX - startX;
        const pct = startSplit + (dx / rect.width) * 100;
        setSplitPos(Math.max(25, Math.min(75, pct)));
      };
      const onUp = () => {
        resizing.current = false;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [splitPos],
  );

  const cycleLayout = () => {
    setLayout((prev) =>
      prev === "split"
        ? "focus-lesson"
        : prev === "focus-lesson"
          ? "focus-tool"
          : "split",
    );
  };

  const leftWidth =
    layout === "focus-lesson" ? 100 : layout === "focus-tool" ? 0 : splitPos;
  const rightWidth = 100 - leftWidth;

  const openAgent = (prompt?: string) => {
    if (prompt) {
      try {
        sessionStorage.setItem("synapse.agent.prefill", prompt);
      } catch {
        /* ignore */
      }
    }
    navigate({ to: "/agent" });
  };
  const closeWorkspace = () => navigate({ to: "/progress" });

  const handleDashboardAction = useCallback(
    (actionId: string) => {
      const target = DASHBOARD_ACTION_TARGETS.find((a) => a.id === actionId);
      if (!target) return;
      setActiveTool(target.tool);
      if (target.step !== undefined) setCurrentStep(target.step);
      if (layout === "focus-lesson") setLayout("split");
    },
    [layout],
  );

  const handleFeynmanConceptFocus = useCallback(
    (conceptId: string) => {
      setActiveTool("concept-map");
      if (layout === "focus-lesson") setLayout("split");
      try {
        sessionStorage.setItem("synapse.concept.focus", conceptId);
      } catch {
        /* ignore */
      }
    },
    [layout],
  );

  return (
    <div className="study-workspace fixed inset-0 z-50 flex flex-col bg-background text-foreground">
      {/* Top bar */}
      <div className="ws-top-bar flex shrink-0 items-center justify-between border-b border-[#5a5280] bg-white/[0.03] px-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={closeWorkspace}
            className="rounded-lg p-1.5 hover:bg-white/[0.06]"
            aria-label={t("workspace.ui.close")}
          >
            <X className="h-4 w-4 text-[#b8b3d4]" />
          </button>
          <div className="flex min-w-0 items-center gap-1.5">
            <BookOpen className="h-4 w-4 shrink-0 text-synapse-brand-400" />
            <span className="truncate text-sm font-semibold">
              {t("workspace.course.title")}
            </span>
            <span className="hidden truncate text-xs text-[#b8b3d4] sm:inline">
              · {t("workspace.course.subject")}
            </span>
          </div>
        </div>
        <div className="ws-tool-rail synapse-hide-scrollbar flex max-w-[70%] shrink items-center justify-end gap-0.5">
          <LanguageToggle />
          {TOOL_DEFS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                setActiveTool(tool.id);
                if (layout === "focus-lesson") setLayout("split");
              }}
              className={cn(
                "ws-tool-btn flex shrink-0 items-center gap-1 rounded-md font-medium transition-all",
                activeTool === tool.id
                  ? "border border-synapse-brand-500/45 bg-synapse-brand-600/25 text-synapse-brand-200"
                  : "text-[#b8b3d4] hover:bg-white/[0.06] hover:text-foreground",
              )}
            >
              <tool.Icon className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">{t(tool.labelKey)}</span>
            </button>
          ))}
          <div className="mx-0.5 h-5 w-px shrink-0 bg-[#5a5280]" />
          <button
            onClick={cycleLayout}
            className="shrink-0 rounded-md p-1.5 text-[#b8b3d4] hover:bg-white/[0.06] hover:text-foreground"
            title={t("workspace.ui.toggleLayout")}
          >
            {layout === "split" ? (
              <Layout className="h-4 w-4" />
            ) : layout === "focus-lesson" ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => openAgent()}
            className="ws-tool-btn flex shrink-0 items-center gap-1 rounded-md border border-[#5a5280] font-medium text-foreground hover:border-synapse-brand-500/40"
          >
            <Sparkles className="h-3.5 w-3.5 text-synapse-brand-400" />
            <span className="hidden sm:inline">{t("workspace.ui.agent")}</span>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 shrink-0 bg-white/[0.04]">
        <div
          className="h-1 bg-synapse-brand-500 transition-all duration-300"
          style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div ref={containerRef} className="relative flex flex-1 overflow-hidden">
        {/* Left pane */}
        <AnimatePresence initial={false}>
          {leftWidth > 0 && (
            <motion.div
              key="left"
              initial={{ width: 0 }}
              animate={{ width: `${leftWidth}%` }}
              exit={{ width: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col overflow-hidden border-r border-border"
            >
              <div className="ws-lesson-nav synapse-hide-scrollbar flex shrink-0 items-center gap-0.5 overflow-x-auto border-b border-border px-2 py-1.5">
                <button
                  onClick={() => setLessonCollapsed(!lessonCollapsed)}
                  className="shrink-0 rounded p-1 text-muted-foreground hover:bg-white/[0.04]"
                  aria-label={
                    lessonCollapsed
                      ? t("workspace.ui.expandSidebar")
                      : t("workspace.ui.collapseSidebar")
                  }
                >
                  {lessonCollapsed ? (
                    <PanelLeftOpen className="h-3.5 w-3.5" />
                  ) : (
                    <PanelLeftClose className="h-3.5 w-3.5" />
                  )}
                </button>
                {STEPS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={cn(
                      "flex shrink-0 items-center gap-1 rounded px-2 py-1 text-[9px] font-medium transition-all",
                      currentStep === i
                        ? "bg-synapse-brand-600/20 text-synapse-brand-300"
                        : i < currentStep
                          ? "text-synapse-accent-emerald"
                          : "text-muted-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full border text-[8px]",
                        currentStep === i
                          ? "border-synapse-brand-400 text-synapse-brand-400"
                          : i < currentStep
                            ? "border-synapse-accent-emerald bg-synapse-accent-emerald/10 text-synapse-accent-emerald"
                            : "border-muted-foreground",
                      )}
                    >
                      {i < currentStep ? "✓" : i + 1}
                    </span>
                    <span className="hidden sm:inline">
                      {(() => {
                        const title = t(s.titleKey);
                        return title.length > 16
                          ? `${title.slice(0, 14)}…`
                          : title;
                      })()}
                    </span>
                  </button>
                ))}
              </div>

              <div className="ws-lesson-pane flex-1 overflow-y-auto">
                <LessonContent
                  step={currentStep}
                  retrievalPassed={!!retrievalPassed[currentStep]}
                  onRetrievalPass={() =>
                    setRetrievalPassed((prev) => ({
                      ...prev,
                      [currentStep]: true,
                    }))
                  }
                  onOpenAgent={openAgent}
                />
              </div>

              <div className="flex shrink-0 items-center justify-between border-t border-border px-4 py-2">
                <button
                  onClick={() =>
                    currentStep > 0 && setCurrentStep(currentStep - 1)
                  }
                  disabled={currentStep === 0}
                  className={cn(
                    "text-xs",
                    currentStep === 0
                      ? "text-muted-foreground"
                      : "text-foreground/80 hover:text-foreground",
                  )}
                >
                  {t("workspace.ui.previous")}
                </button>
                <span className="text-[10px] text-muted-foreground">
                  {currentStep + 1}/{STEPS.length}
                </span>
                <button
                  onClick={() =>
                    currentStep < STEPS.length - 1 &&
                    setCurrentStep(currentStep + 1)
                  }
                  disabled={currentStep < 5 && !retrievalPassed[currentStep]}
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    currentStep < 5 && !retrievalPassed[currentStep]
                      ? "cursor-not-allowed text-[#5a5280]"
                      : "text-synapse-brand-400 hover:text-synapse-brand-300",
                  )}
                >
                  {t("workspace.ui.next")} <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {layout === "split" && (
          <div
            onPointerDown={handleResizeStart}
            className="group z-10 flex w-1.5 shrink-0 cursor-col-resize items-center justify-center bg-border transition-colors hover:bg-synapse-brand-500/50"
          >
            <div className="h-8 w-0.5 rounded-full bg-muted-foreground/30 transition-colors group-hover:bg-synapse-brand-400" />
          </div>
        )}

        {/* Right pane */}
        <AnimatePresence initial={false}>
          {rightWidth > 0 && (
            <motion.div
              key="right"
              initial={{ width: 0 }}
              animate={{ width: `${rightWidth}%` }}
              exit={{ width: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col overflow-hidden"
            >
              {activeTool === "concept-map" && (
                <DraggableConceptMap
                  initialNodes={conceptNodes}
                  initialEdges={CONCEPT_EDGES}
                  onGoToLesson={(step) => setCurrentStep(step)}
                />
              )}
              {activeTool === "simulator" && <InteractiveSimulator />}
              {activeTool === "leitner" && <LeitnerSystem />}
              {activeTool === "compare" && <SideBySideCompare />}
              {activeTool === "debate" && <ArgumentMap />}
              {activeTool === "reader" && (
                <CognitiveReader text={t(READER_SAMPLE_KEY)} />
              )}
              {activeTool === "annotations" && (
                <AnnotationOverlay onAskAgent={openAgent} />
              )}
              {activeTool === "scratchpad" && (
                <FormulaScratchpad
                  lessonStep={currentStep}
                  lessonLink={{
                    formulaId: LESSON_SCRATCHPAD_LINK.formulaId,
                    step: LESSON_SCRATCHPAD_LINK.step,
                    variables: LESSON_SCRATCHPAD_LINK.variables.map((v) => ({
                      ...v,
                    })),
                  }}
                />
              )}
              {activeTool === "whiteboard" && (
                <StudyWhiteboard className="h-full" />
              )}
              {activeTool === "feynman" && (
                <FeynmanCheck
                  concept={t("workspace.course.title")}
                  showRubric
                  onFocusConcept={handleFeynmanConceptFocus}
                />
              )}
              {activeTool === "timer" && <StudyTimer />}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating mini-dashboard */}
        <div className="absolute bottom-4 right-4 z-20">
          <MiniDashboard
            readiness={58}
            streak={12}
            reviewsDue={3}
            weakSpots={[
              {
                concept: t("workspace.mini.weak1"),
                mastery: 45,
                course: t("workspace.course.subject"),
              },
              {
                concept: t("workspace.mini.weak2"),
                mastery: 20,
                course: t("workspace.course.subject"),
              },
              {
                concept: t("workspace.mini.weak3"),
                mastery: 0,
                course: t("workspace.course.subject"),
              },
            ]}
            nextActions={[
              {
                id: "review1",
                label: t("workspace.mini.review1"),
                type: "review",
                minutes: 8,
                xp: 30,
              },
              {
                id: "review2",
                label: t("workspace.mini.review2"),
                type: "practice",
                minutes: 12,
                xp: 35,
              },
              {
                id: "review3",
                label: t("workspace.mini.review3"),
                type: "lesson",
                minutes: 20,
                xp: 50,
              },
            ]}
            conceptsMastered={31}
            totalConcepts={136}
            onRunAction={handleDashboardAction}
          />
        </div>
      </div>
    </div>
  );
}

function LessonContent({
  step,
  retrievalPassed,
  onRetrievalPass,
  onOpenAgent,
}: {
  step: number;
  retrievalPassed: boolean;
  onRetrievalPass: () => void;
  onOpenAgent: (prompt?: string) => void;
}) {
  const { t } = useTranslation();

  switch (step) {
    case 0:
      return (
        <div className="space-y-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-synapse-brand-400">
            {t("workspace.lesson.type.core")}
          </span>
          <h2 className="ws-step-title">{t("workspace.step.0.title")}</h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            {t("workspace.lesson.s0.p1")}{" "}
            <strong className="text-foreground">
              {t("workspace.lesson.s0.question")}
            </strong>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-synapse-brand-500/20 bg-synapse-brand-500/5 p-3">
              <h4 className="mb-1 text-xs font-semibold text-synapse-brand-300">
                {t("workspace.lesson.s0.cournot.title")}
              </h4>
              <ul className="space-y-0.5 text-[11px] text-foreground/80">
                {t("workspace.lesson.s0.cournot.items")
                  .split("|")
                  .map((item) => (
                    <li key={item}>
                      •{" "}
                      <ReactMarkdown
                        components={{ p: "span", strong: "strong" }}
                      >
                        {item}
                      </ReactMarkdown>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="rounded-xl border border-synapse-accent-teal/20 bg-synapse-accent-teal/5 p-3">
              <h4 className="mb-1 text-xs font-semibold text-synapse-accent-teal">
                {t("workspace.lesson.s0.bertrand.title")}
              </h4>
              <ul className="space-y-0.5 text-[11px] text-foreground/80">
                {t("workspace.lesson.s0.bertrand.items")
                  .split("|")
                  .map((item) => (
                    <li key={item}>
                      •{" "}
                      <ReactMarkdown
                        components={{ p: "span", strong: "strong" }}
                      >
                        {item}
                      </ReactMarkdown>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#b8b3d4]">
            <span aria-hidden>📖</span>
            <SourceCitation />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onOpenAgent()}
              className="rounded-lg border border-[#5a5280] px-3 py-1.5 text-xs font-medium text-foreground/90 hover:border-synapse-brand-500/40"
            >
              {t("workspace.lesson.explainDiff")}
            </button>
            <button
              onClick={() => onOpenAgent(t("workspace.lesson.testMe"))}
              className="rounded-lg border border-[#5a5280] px-3 py-1.5 text-xs font-medium text-foreground/90 hover:border-synapse-brand-500/40"
            >
              {t("workspace.lesson.testMe")}
            </button>
          </div>
          <LessonStepFooter
            step={step}
            retrievalPassed={retrievalPassed}
            onRetrievalPass={onRetrievalPass}
            onOpenAgent={onOpenAgent}
          />
        </div>
      );
    case 1:
      return (
        <div className="space-y-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-synapse-brand-400">
            {t("workspace.lesson.type.deep")}
          </span>
          <h2 className="ws-step-title">{t("workspace.step.1.title")}</h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            <ReactMarkdown components={{ p: "span", strong: "strong" }}>
              {t("workspace.lesson.s1.p1")}
            </ReactMarkdown>
          </p>
          <div className="rounded-xl border border-border bg-background/60 p-3 text-center">
            <p className="mb-1 text-[10px] text-muted-foreground">
              {t("workspace.lesson.s1.formulaLabel")}
            </p>
            <p className="ws-formula-display font-mono font-bold text-synapse-brand-300">
              q₁* = (a − c − q₂) / 2b
            </p>
          </div>
          <p className="text-sm text-foreground/80">
            <ReactMarkdown components={{ p: "span", strong: "strong" }}>
              {t("workspace.lesson.s1.scratchpad")}
            </ReactMarkdown>
          </p>
          <LessonStepFooter
            step={step}
            retrievalPassed={retrievalPassed}
            onRetrievalPass={onRetrievalPass}
            onOpenAgent={onOpenAgent}
          />
        </div>
      );
    case 2:
      return (
        <div className="space-y-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-synapse-brand-400">
            {t("workspace.lesson.type.deep")}
          </span>
          <h2 className="ws-step-title">{t("workspace.step.2.title")}</h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            <ReactMarkdown components={{ p: "span", strong: "strong" }}>
              {t("workspace.lesson.s2.p1")}
            </ReactMarkdown>
          </p>
          <div className="rounded-xl border border-synapse-accent-amber/20 bg-synapse-accent-amber/5 p-3">
            <p className="mb-1 text-xs font-semibold text-synapse-accent-amber">
              {t("workspace.lesson.s2.misconception.title")}
            </p>
            <p className="text-[11px] text-foreground/80">
              <ReactMarkdown components={{ p: "span", strong: "strong" }}>
                {t("workspace.lesson.s2.misconception.body")}
              </ReactMarkdown>
            </p>
          </div>
          <LessonStepFooter
            step={step}
            retrievalPassed={retrievalPassed}
            onRetrievalPass={onRetrievalPass}
            onOpenAgent={onOpenAgent}
          />
        </div>
      );
    case 3:
      return (
        <div className="space-y-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-synapse-accent-amber">
            {t("workspace.lesson.type.insight")}
          </span>
          <h2 className="ws-step-title">{t("workspace.step.3.title")}</h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            <ReactMarkdown components={{ p: "span", strong: "strong" }}>
              {t("workspace.lesson.s3.p1")}
            </ReactMarkdown>
          </p>
          <p className="text-sm text-foreground/80">
            <ReactMarkdown components={{ p: "span", strong: "strong" }}>
              {t("workspace.lesson.s3.resolution")}
            </ReactMarkdown>
          </p>
          <LessonStepFooter
            step={step}
            retrievalPassed={retrievalPassed}
            onRetrievalPass={onRetrievalPass}
            onOpenAgent={onOpenAgent}
          />
        </div>
      );
    case 4:
      return (
        <div className="space-y-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-synapse-accent-teal">
            {t("workspace.lesson.type.practice")}
          </span>
          <h2 className="ws-step-title">{t("workspace.step.4.title")}</h2>
          <div className="rounded-xl border border-border bg-background/60 p-3">
            <p className="mb-2 text-xs font-medium">
              {t("workspace.lesson.s4.prompt")}
            </p>
          </div>
          <div className="space-y-2 font-mono text-sm text-foreground/80">
            <p className="font-sans text-[10px] font-semibold text-synapse-brand-300">
              {t("workspace.lesson.s4.step1")}
            </p>
            <p className="rounded-lg bg-background/40 px-3 py-1.5">
              π₁ = (100 − q₁ − q₂)q₁ − 10q₁
            </p>
            <p className="font-sans text-[10px] font-semibold text-synapse-brand-300">
              {t("workspace.lesson.s4.step2")}
            </p>
            <p className="rounded-lg bg-background/40 px-3 py-1.5">
              q₁* = (90 − q₂) / 2
            </p>
            <p className="font-sans text-[10px] font-semibold text-synapse-brand-300">
              {t("workspace.lesson.s4.step3")}
            </p>
            <p className="rounded-lg bg-background/40 px-3 py-1.5">
              q* = 30, Q* = 60, P* = 40
            </p>
            <p className="font-sans text-[10px] font-semibold text-synapse-accent-emerald">
              {t("workspace.lesson.s4.result")}
            </p>
          </div>
          <LessonStepFooter
            step={step}
            retrievalPassed={retrievalPassed}
            onRetrievalPass={onRetrievalPass}
            onOpenAgent={onOpenAgent}
          />
        </div>
      );
    case 5:
      return (
        <div className="space-y-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-synapse-accent-cyan">
            {t("workspace.lesson.type.quiz")}
          </span>
          <h2 className="ws-step-title">{t("workspace.step.5.title")}</h2>
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="mb-3 text-sm">{t("workspace.lesson.s5.question")}</p>
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                className="mb-1.5 flex w-full items-center gap-2 rounded-lg border border-border p-2.5 text-left text-sm transition-all hover:border-synapse-brand-500/30"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-muted-foreground text-[10px]">
                  {String.fromCharCode(65 + i)}
                </span>
                {t(`workspace.lesson.s5.opt.${i}`)}
              </button>
            ))}
          </div>
          <div className="mt-4 border-t border-[#5a5280]/50 pt-4">
            <SocraticChips onAsk={(p) => onOpenAgent(p)} />
          </div>
        </div>
      );
    default:
      return (
        <p className="text-muted-foreground">{t("workspace.ui.selectStep")}</p>
      );
  }
}
