/**
 * ConceptGraph
 *
 * Read-only SVG concept map. Each node carries a `mastery` % which colors the
 * border and partial-ring fill. Hover/select highlights related edges and shows
 * a glass-strong detail card with prerequisites.
 *
 * For an editable / draggable / zoomable version see
 * `components/workspace/DraggableConceptMap.tsx`.
 */

import { motion } from "framer-motion";
import { useState } from "react";

export interface ConceptGraphNode {
  id: string;
  label: string;
  mastery: number;
  type: "concept" | "formula" | "definition" | "theory" | "example";
  x: number;
  y: number;
}

export interface ConceptGraphEdge {
  from: string;
  to: string;
  relation: "prerequisite" | "related" | "contrasts" | "example-of";
}

interface ConceptGraphProps {
  nodes: ConceptGraphNode[];
  edges: ConceptGraphEdge[];
  width?: number;
  height?: number;
}

const TYPE_ICONS: Record<ConceptGraphNode["type"], string> = {
  concept: "💡",
  formula: "📐",
  definition: "📖",
  theory: "🧠",
  example: "📌",
};

function masteryColor(m: number): string {
  if (m >= 80) return "#34d399"; // emerald
  if (m >= 60) return "#fbbf24"; // amber
  if (m >= 40) return "#38bdf8"; // sky
  if (m > 0) return "#fb7185"; // rose
  return "#4d4870"; // muted
}

export function ConceptGraph({
  nodes,
  edges,
  width = 700,
  height = 400,
}: ConceptGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const nodeMap: Record<string, ConceptGraphNode> = Object.fromEntries(
    nodes.map((n) => [n.id, n]),
  );

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-border bg-card"
      style={{ maxWidth: width }}
    >
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="block">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#4d4870" />
          </marker>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => {
          const from = nodeMap[edge.from];
          const to = nodeMap[edge.to];
          if (!from || !to) return null;

          const isHighlighted =
            hoveredNode === edge.from || hoveredNode === edge.to;
          const dashArray =
            edge.relation === "contrasts"
              ? "6,4"
              : edge.relation === "related"
                ? "3,3"
                : "none";

          return (
            <motion.line
              key={`${edge.from}-${edge.to}-${i}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isHighlighted ? "#818cf8" : "#2a2252"}
              strokeWidth={isHighlighted ? 2 : 1}
              strokeDasharray={dashArray}
              markerEnd="url(#arrowhead)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const isHovered = hoveredNode === node.id;
          const isSelected = selectedNode === node.id;
          const color = masteryColor(node.mastery);
          const r = isHovered || isSelected ? 32 : 26;
          const ring = 2 * Math.PI * r;

          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.08, type: "spring" }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => setSelectedNode(isSelected ? null : node.id)}
              className="cursor-pointer"
            >
              {(isHovered || isSelected) && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r + 6}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  opacity={0.3}
                  filter="url(#glow)"
                />
              )}

              <circle
                cx={node.x}
                cy={node.y}
                r={r}
                fill="#1a1333"
                stroke={color}
                strokeWidth={2.5}
              />

              <circle
                cx={node.x}
                cy={node.y}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={2.5}
                strokeDasharray={`${(node.mastery / 100) * ring} ${ring}`}
                transform={`rotate(-90 ${node.x} ${node.y})`}
                opacity={0.5}
              />

              <text
                x={node.x}
                y={node.y - 3}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={14}
              >
                {TYPE_ICONS[node.type] ?? "💡"}
              </text>

              <text
                x={node.x}
                y={node.y + 14}
                textAnchor="middle"
                fontSize={8}
                fill={color}
                fontWeight="bold"
              >
                {node.mastery}%
              </text>

              <text
                x={node.x}
                y={node.y + r + 16}
                textAnchor="middle"
                fontSize={10}
                fill={isHovered || isSelected ? "#f1f0f7" : "#a8a3c4"}
                fontWeight={isHovered ? "600" : "400"}
              >
                {node.label.length > 18
                  ? `${node.label.slice(0, 16)}…`
                  : node.label}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 border-t border-border py-3">
        {[
          { color: "#34d399", label: "Strong ≥80%" },
          { color: "#fbbf24", label: "Proficient ≥60%" },
          { color: "#38bdf8", label: "Developing ≥40%" },
          { color: "#fb7185", label: "Weak <40%" },
        ].map((b) => (
          <span
            key={b.label}
            className="flex items-center gap-1.5 text-[9px] text-muted-foreground"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: b.color }}
            />
            {b.label}
          </span>
        ))}
      </div>

      {/* Selected node detail */}
      {selectedNode && nodeMap[selectedNode] && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="synapse-glass-strong absolute bottom-12 left-4 right-4 rounded-xl p-3 text-xs"
        >
          <div className="mb-1 flex items-center gap-2">
            <span>{TYPE_ICONS[nodeMap[selectedNode].type]}</span>
            <span className="font-semibold">{nodeMap[selectedNode].label}</span>
            <span
              className="ml-auto font-bold"
              style={{ color: masteryColor(nodeMap[selectedNode].mastery) }}
            >
              {nodeMap[selectedNode].mastery}%
            </span>
          </div>
          <div className="text-muted-foreground">
            Prerequisites:{" "}
            {edges
              .filter(
                (e) => e.to === selectedNode && e.relation === "prerequisite",
              )
              .map((e) => nodeMap[e.from]?.label)
              .filter(Boolean)
              .join(", ") || "None"}
          </div>
        </motion.div>
      )}
    </div>
  );
}
