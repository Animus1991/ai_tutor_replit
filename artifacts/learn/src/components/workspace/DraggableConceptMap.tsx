/**
 * DraggableConceptMap
 *
 * Editable concept graph with drag, zoom (wheel), pan, selection, and per-node
 * notes. Use this in the workspace where the learner can rearrange the map
 * themselves; for a read-only display see `components/visuals/ConceptGraph`.
 *
 * Adapted from the Option A reference.
 */

import { useTranslation } from "@/lib/i18n";
import {
  CONCEPT_LESSON_STEP,
  EXAM_PATH_EDGES,
  EXAM_PATH_NODE_IDS,
} from "@/lib/i18n-sprint1";
import { cn } from "@/lib/utils";
import { WS_GRAPH, WS_MASTERY, masteryColor } from "@/lib/workspaceTokens";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type MasteryFilter = "all" | "needsWork" | "weak";

export type DragNodeType = "concept" | "formula" | "definition" | "theory";
export type DragEdgeRelation = "prerequisite" | "related" | "contrasts";

export interface DragNode {
  id: string;
  label: string;
  mastery: number;
  type: DragNodeType;
  x: number;
  y: number;
  note?: string;
  pinned?: boolean;
}

export interface DragEdge {
  from: string;
  to: string;
  relation: DragEdgeRelation;
}

interface Props {
  initialNodes: DragNode[];
  initialEdges: DragEdge[];
  onNodeUpdate?: (nodes: DragNode[]) => void;
  onGoToLesson?: (step: number) => void;
}

const MASTERY_COLOR = masteryColor;

const TYPE_EMOJI: Record<DragNodeType, string> = {
  concept: "💡",
  formula: "📐",
  definition: "📖",
  theory: "🧠",
};

export function DraggableConceptMap({
  initialNodes,
  initialEdges,
  onNodeUpdate,
  onGoToLesson,
}: Props) {
  const { t } = useTranslation();
  const [nodes, setNodes] = useState<DragNode[]>(initialNodes);
  const [edges] = useState<DragEdge[]>(initialEdges);
  const [selected, setSelected] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [masteryFilter, setMasteryFilter] = useState<MasteryFilter>("all");
  const [showExamPath, setShowExamPath] = useState(false);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const dragging = useRef<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    try {
      const focusId = sessionStorage.getItem("synapse.concept.focus");
      if (focusId && nodes.some((n) => n.id === focusId)) {
        setSelected(focusId);
        sessionStorage.removeItem("synapse.concept.focus");
      }
    } catch {
      /* ignore */
    }
  }, [nodes]);

  const nodeMap: Record<string, DragNode> = Object.fromEntries(
    nodes.map((n) => [n.id, n]),
  );

  const toSvg = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return { x: clientX, y: clientY };
      const rect = svg.getBoundingClientRect();
      return {
        x: (clientX - rect.left - pan.x) / zoom,
        y: (clientY - rect.top - pan.y) / zoom,
      };
    },
    [zoom, pan],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, nodeId: string) => {
      e.stopPropagation();
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      dragging.current = nodeId;
      const pt = toSvg(e.clientX, e.clientY);
      const node = nodeMap[nodeId];
      if (node) {
        dragOffset.current = { x: pt.x - node.x, y: pt.y - node.y };
      }
      setSelected(nodeId);
    },
    [toSvg, nodeMap],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (dragging.current) {
        const pt = toSvg(e.clientX, e.clientY);
        setNodes((prev) =>
          prev.map((n) =>
            n.id === dragging.current
              ? {
                  ...n,
                  x: pt.x - dragOffset.current.x,
                  y: pt.y - dragOffset.current.y,
                }
              : n,
          ),
        );
      } else if (isPanning.current) {
        setPan({
          x: panStart.current.px + (e.clientX - panStart.current.x),
          y: panStart.current.py + (e.clientY - panStart.current.y),
        });
      }
    },
    [toSvg],
  );

  const handlePointerUp = useCallback(() => {
    if (dragging.current) {
      dragging.current = null;
      onNodeUpdate?.(nodes);
    }
    isPanning.current = false;
  }, [nodes, onNodeUpdate]);

  const handleBgPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (dragging.current) return;
      isPanning.current = true;
      panStart.current = {
        x: e.clientX,
        y: e.clientY,
        px: pan.x,
        py: pan.y,
      };
      setSelected(null);
      setEditingNote(null);
    },
    [pan],
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.3, Math.min(2.5, prev - e.deltaY * 0.001)));
  }, []);

  const startNote = (id: string) => {
    setEditingNote(id);
    setNoteText(nodeMap[id]?.note ?? "");
  };

  const saveNote = () => {
    if (!editingNote) return;
    setNodes((prev) =>
      prev.map((n) => (n.id === editingNote ? { ...n, note: noteText } : n)),
    );
    setEditingNote(null);
  };

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  const selectedNode = selected ? nodeMap[selected] : null;

  const matchesFilter = useCallback(
    (m: number) => {
      if (masteryFilter === "all") return true;
      if (masteryFilter === "weak") return m < 40;
      return m < 60;
    },
    [masteryFilter],
  );

  const examPathEdgeSet = useMemo(() => {
    const set = new Set<string>();
    if (!showExamPath) return set;
    for (const [from, to] of EXAM_PATH_EDGES) {
      set.add(`${from}-${to}`);
    }
    return set;
  }, [showExamPath]);

  const examPathNodeSet = useMemo(() => {
    if (!showExamPath) return new Set<string>();
    return new Set(EXAM_PATH_NODE_IDS);
  }, [showExamPath]);

  const filterButtons: { id: MasteryFilter; labelKey: string }[] = [
    { id: "all", labelKey: "workspace.map.filter.all" },
    { id: "needsWork", labelKey: "workspace.map.filter.needsWork" },
    { id: "weak", labelKey: "workspace.map.filter.weak" },
  ];

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex shrink-0 flex-col gap-2 border-b border-border bg-white/[0.03] px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              🗺 {t("workspace.map.title")}
            </span>
            <span className="hidden text-xs text-[#b8b3d4] sm:inline">
              {t("workspace.map.hint")}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
              className="flex h-7 w-7 items-center justify-center rounded bg-white/8 text-sm text-foreground hover:bg-white/12"
            >
              +
            </button>
            <span className="w-12 text-center text-xs text-[#b8b3d4]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.max(0.3, z - 0.2))}
              className="flex h-7 w-7 items-center justify-center rounded bg-white/8 text-sm text-foreground hover:bg-white/12"
            >
              −
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="ml-1 rounded bg-white/8 px-2.5 py-1 text-xs text-[#b8b3d4] hover:text-foreground"
            >
              {t("workspace.map.reset")}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filterButtons.map((fb) => (
            <button
              key={fb.id}
              type="button"
              onClick={() => setMasteryFilter(fb.id)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                masteryFilter === fb.id
                  ? "bg-synapse-brand-600/30 text-synapse-brand-200"
                  : "bg-white/[0.05] text-[#b8b3d4] hover:text-foreground",
              )}
            >
              {t(fb.labelKey)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowExamPath((v) => !v)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
              showExamPath
                ? "bg-synapse-accent-amber/25 text-synapse-accent-amber"
                : "bg-white/[0.05] text-[#b8b3d4] hover:text-foreground",
            )}
          >
            {showExamPath
              ? t("workspace.map.pathClear")
              : t("workspace.map.pathToExam")}
          </button>
        </div>
      </div>

      <div
        className="flex-1 cursor-grab overflow-hidden active:cursor-grabbing"
        onWheel={handleWheel}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          onPointerDown={handleBgPointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="block select-none"
        >
          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
            <defs>
              <marker
                id="dm-arrow"
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill={WS_GRAPH.edgeDefault}
                />
              </marker>
            </defs>

            {edges.map((edge, i) => {
              const from = nodeMap[edge.from];
              const to = nodeMap[edge.to];
              if (!from || !to) return null;
              const edgeKey = `${edge.from}-${edge.to}`;
              const onExamPath = examPathEdgeSet.has(edgeKey);
              const lit =
                selected === edge.from || selected === edge.to || onExamPath;
              const dimmed =
                !matchesFilter(from.mastery) && !matchesFilter(to.mastery);
              const dash =
                edge.relation === "contrasts"
                  ? "8,4"
                  : edge.relation === "related"
                    ? "4,4"
                    : "none";
              return (
                <line
                  key={i}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={
                    onExamPath
                      ? "#fcd34d"
                      : lit
                        ? WS_GRAPH.edgeLit
                        : WS_GRAPH.edgeDefault
                  }
                  strokeWidth={onExamPath ? 3.5 : lit ? 2.5 : 1.5}
                  strokeDasharray={dash}
                  opacity={dimmed ? 0.15 : 1}
                  markerEnd="url(#dm-arrow)"
                />
              );
            })}

            {nodes.map((node) => {
              const color = MASTERY_COLOR(node.mastery);
              const isSel = selected === node.id;
              const dimmed = !matchesFilter(node.mastery);
              const onExamPath = examPathNodeSet.has(node.id);
              const r = 30;
              return (
                <g
                  key={node.id}
                  onPointerDown={(e) => handlePointerDown(e, node.id)}
                  className="cursor-move"
                  opacity={dimmed ? 0.2 : 1}
                >
                  {onExamPath && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r + 12}
                      fill="none"
                      stroke="#fcd34d"
                      strokeWidth={2}
                      opacity={0.5}
                      strokeDasharray="4,3"
                    />
                  )}
                  {isSel && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r + 8}
                      fill="none"
                      stroke={color}
                      strokeWidth={2}
                      opacity={0.35}
                    />
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r}
                    fill={WS_GRAPH.nodeFill}
                    stroke={color}
                    strokeWidth={isSel ? 3 : 2}
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={3}
                    opacity={0.4}
                    strokeDasharray={`${(node.mastery / 100) * 2 * Math.PI * r} ${2 * Math.PI * r}`}
                    transform={`rotate(-90 ${node.x} ${node.y})`}
                  />
                  <text
                    x={node.x}
                    y={node.y - 4}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={16}
                  >
                    {TYPE_EMOJI[node.type]}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 15}
                    textAnchor="middle"
                    fontSize={9}
                    fill={color}
                    fontWeight="700"
                  >
                    {node.mastery}%
                  </text>
                  <text
                    x={node.x}
                    y={node.y + r + 14}
                    textAnchor="middle"
                    fontSize={11}
                    fill={
                      isSel ? WS_GRAPH.labelSelected : WS_GRAPH.labelDefault
                    }
                    fontWeight={isSel ? "600" : "400"}
                  >
                    {node.label.length > 16
                      ? `${node.label.slice(0, 14)}…`
                      : node.label}
                  </text>
                  {node.note && (
                    <circle
                      cx={node.x + r - 4}
                      cy={node.y - r + 4}
                      r={5}
                      fill="#fbbf24"
                    />
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {selectedNode && !editingNote && (
        <div className="synapse-glass-strong absolute bottom-8 left-0 right-0 border-t border-border p-3">
          <div className="flex items-center gap-3">
            <span className="text-lg">{TYPE_EMOJI[selectedNode.type]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{selectedNode.label}</p>
              <p className="text-xs text-[#b8b3d4]">
                {t("workspace.map.mastery")} {selectedNode.mastery}% ·{" "}
                {edges.filter((e) => e.to === selectedNode.id).length}{" "}
                {t("workspace.map.prerequisites")}
              </p>
            </div>
            <button
              onClick={() => startNote(selectedNode.id)}
              className="rounded-lg border border-synapse-brand-500/40 bg-synapse-brand-600/25 px-3 py-2 text-xs font-medium text-synapse-brand-200 hover:bg-synapse-brand-600/35"
            >
              {selectedNode.note
                ? t("workspace.map.editNote")
                : t("workspace.map.addNote")}
            </button>
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
          {selectedNode.note && (
            <p className="mt-2 rounded-lg bg-white/[0.04] p-2 text-xs text-foreground/80">
              {selectedNode.note}
            </p>
          )}
          <div className="mt-2 rounded-lg border border-[#5a5280]/60 bg-white/[0.03] p-2">
            <p className="mb-1 text-[11px] font-semibold text-synapse-brand-300">
              {t("workspace.map.recap.title")}
            </p>
            <p className="text-xs leading-relaxed text-[#ddd9ee]">
              {t(`workspace.concept.recap.${selectedNode.id}`)}
            </p>
            {onGoToLesson &&
              CONCEPT_LESSON_STEP[selectedNode.id] !== undefined && (
                <button
                  type="button"
                  onClick={() =>
                    onGoToLesson(CONCEPT_LESSON_STEP[selectedNode.id]!)
                  }
                  className="mt-2 text-xs font-medium text-synapse-brand-300 hover:text-synapse-brand-200"
                >
                  {t("workspace.map.goToLesson")} →
                </button>
              )}
          </div>
        </div>
      )}

      {editingNote && (
        <div className="synapse-glass-strong absolute bottom-8 left-0 right-0 border-t border-border p-3">
          <p className="mb-2 text-sm font-semibold">
            {t("workspace.map.noteFor", {
              label: nodeMap[editingNote]?.label ?? "",
            })}
          </p>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={t("workspace.map.notePlaceholder")}
            className="w-full resize-none rounded-lg border border-border bg-background/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-synapse-brand-500/50 focus:outline-none"
            rows={2}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => setEditingNote(null)}
              className="px-3 py-1.5 text-sm text-[#b8b3d4] hover:text-foreground"
            >
              {t("cancel")}
            </button>
            <button
              onClick={saveNote}
              className="rounded-lg bg-synapse-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-synapse-brand-500"
            >
              {t("save")}
            </button>
          </div>
        </div>
      )}

      <div className="flex shrink-0 items-center justify-center gap-3 border-t border-border bg-white/[0.03] py-2.5">
        {[
          { c: WS_MASTERY.strong, l: t("workspace.map.legend.strong") },
          { c: WS_MASTERY.proficient, l: t("workspace.map.legend.proficient") },
          { c: WS_MASTERY.developing, l: t("workspace.map.legend.developing") },
          { c: WS_MASTERY.weak, l: t("workspace.map.legend.weak") },
        ].map((b) => (
          <span
            key={b.l}
            className="flex items-center gap-1.5 text-[11px] text-[#b8b3d4]"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: b.c }}
            />
            {b.l}
          </span>
        ))}
        <span className="ml-2 text-[11px] text-[#b8b3d4]">
          {t("workspace.map.legend.prerequisite")}
        </span>
        <span className="text-[11px] text-[#b8b3d4]">
          {t("workspace.map.legend.related")}
        </span>
      </div>
    </div>
  );
}
