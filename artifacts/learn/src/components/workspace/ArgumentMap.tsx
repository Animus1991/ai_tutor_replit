/**
 * ArgumentMap — debate tree with i18n (Sprint 2).
 */

import { useTranslation } from "@/lib/i18n";
import { getDebateTree } from "@/lib/i18n-sprint2";
import { motion } from "framer-motion";
import { GitCommit } from "lucide-react";
import { useMemo } from "react";

export type ArgNodeType = "claim" | "premise" | "support" | "refutation";

export interface ArgNode {
  id: string;
  type: ArgNodeType;
  text: string;
  x: number;
  y: number;
  expanded?: boolean;
  children?: ArgNode[];
}

const NODE_COLORS: Record<
  ArgNodeType,
  { bg: string; border: string; text: string }
> = {
  claim: { bg: "#1e1b4b", border: "#818cf8", text: "#e0e7ff" },
  premise: { bg: "#162032", border: "#67e8f9", text: "#cffafe" },
  support: { bg: "#064e3b", border: "#34d399", text: "#d1fae5" },
  refutation: { bg: "#4c1d2e", border: "#fb7185", text: "#ffe4e6" },
};

interface ArgumentMapProps {
  tree?: ArgNode;
}

export function ArgumentMap({ tree: treeProp }: ArgumentMapProps) {
  const { t, language } = useTranslation();
  const tree = useMemo(
    () => treeProp ?? getDebateTree(t),
    [treeProp, t, language],
  );

  const typeLabel = (type: ArgNodeType) => t(`workspace.debate.type.${type}`);

  const renderEdges = (node: ArgNode): React.ReactNode => {
    if (!node.children || !node.expanded) return null;
    return node.children.map((child) => (
      <g key={`edge-${node.id}-${child.id}`}>
        <motion.line
          x1={node.x}
          y1={node.y + 40}
          x2={child.x}
          y2={child.y - 40}
          stroke={
            child.type === "refutation"
              ? "#fb7185"
              : child.type === "support"
                ? "#34d399"
                : "#6b6494"
          }
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={child.type === "refutation" ? "4 4" : "none"}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
        {renderEdges(child)}
      </g>
    ));
  };

  const renderNodes = (node: ArgNode): React.ReactNode => {
    const colorStyle = NODE_COLORS[node.type];
    return (
      <div key={`wrap-${node.id}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute flex items-center justify-center rounded-xl border-2 p-3 text-center text-xs font-medium shadow-lg"
          style={{
            width: 150,
            height: 84,
            left: node.x - 75,
            top: node.y - 42,
            backgroundColor: colorStyle.bg,
            borderColor: colorStyle.border,
            color: colorStyle.text,
          }}
        >
          {node.text}
          <div
            className="absolute -top-2 rounded-full border bg-background px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
            style={{ borderColor: colorStyle.border, color: colorStyle.border }}
          >
            {typeLabel(node.type)}
          </div>
        </motion.div>
        {node.children && node.expanded && node.children.map(renderNodes)}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#5a5280] bg-card">
      <div className="flex shrink-0 items-center justify-between border-b border-[#5a5280] bg-white/[0.03] px-4 py-2.5">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <GitCommit className="h-4 w-4" /> {t("workspace.debate.title")}
        </span>
      </div>
      <div className="relative flex-1 cursor-grab overflow-auto bg-[#0a0714] active:cursor-grabbing">
        <div className="relative h-[600px] w-[800px]">
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            {renderEdges(tree)}
          </svg>
          {renderNodes(tree)}
        </div>
      </div>
    </div>
  );
}
