/**
 * AnnotationOverlay
 *
 * Source viewer with click-to-annotate (highlight / comment / pin), semantic tags,
 * and a collapsible sidebar of annotations.
 */

import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Highlighter,
  MessageSquare,
  Pin,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

type AnnotationType = "highlight" | "comment" | "pin";
export type AnnotationTag = "definition" | "example" | "exam" | "confusion";

interface Annotation {
  id: string;
  type: AnnotationType;
  tag: AnnotationTag;
  y: number;
  text: string;
  color: string;
  lineStart: number;
  lineEnd: number;
}

const COLORS = ["#818cf8", "#fbbf24", "#34d399", "#fb7185", "#22d3ee"];

const TAG_KEYS: { id: AnnotationTag; key: string; emoji: string }[] = [
  { id: "definition", key: "workspace.source.tag.definition", emoji: "📖" },
  { id: "example", key: "workspace.source.tag.example", emoji: "💡" },
  { id: "exam", key: "workspace.source.tag.exam", emoji: "🎯" },
  { id: "confusion", key: "workspace.source.tag.confusion", emoji: "❓" },
];

const DEFAULT_SOURCE = `Chapter 4: Market Structures

4.1 Perfect Competition

A perfectly competitive market is characterised by many buyers and sellers, a homogeneous product, free entry and exit, and perfect information. Each firm is a price taker — it cannot influence the market price.

In the short run, a firm maximises profit where MC = MR = P. If P > ATC the firm earns economic profit. If ATC > P > AVC the firm operates at a loss but continues production. If P < AVC the firm shuts down.

4.2 Monopoly

A monopolist is the sole seller in a market with high barriers to entry. Unlike a competitive firm, the monopolist faces the entire market demand curve and must lower price to sell more units.

The monopolist maximises profit where MR = MC, but sets price from the demand curve above MR. This creates deadweight loss — the monopolist produces less and charges more than a competitive market would.

4.3 Oligopoly

An oligopoly consists of a few large firms whose decisions are interdependent. The key models are:

• Cournot (quantity competition): firms simultaneously choose output levels.
• Bertrand (price competition): firms simultaneously choose prices.
• Stackelberg (sequential quantity): one firm moves first as a leader.

The Bertrand Paradox states that with just two firms selling identical products and competing on price, the equilibrium price equals marginal cost — the same as perfect competition.

4.4 Monopolistic Competition

Many firms sell differentiated products. Each firm has some market power but faces competition from close substitutes. In the long run, economic profits are driven to zero by entry.

Key distinction: product differentiation gives each firm a downward-sloping demand curve, unlike in perfect competition.`;

interface AnnotationOverlayProps {
  text?: string;
  title?: string;
  onAskAgent?: (text: string) => void;
  initialAnnotations?: Annotation[];
}

export function AnnotationOverlay({
  text = DEFAULT_SOURCE,
  title,
  onAskAgent,
  initialAnnotations,
}: AnnotationOverlayProps) {
  const { t } = useTranslation();
  const displayTitle = title ?? t("workspace.source.title");

  const [annotations, setAnnotations] = useState<Annotation[]>(
    initialAnnotations ?? [
      {
        id: "a1",
        type: "highlight",
        tag: "definition",
        y: 108,
        text: "",
        color: "#818cf8",
        lineStart: 3,
        lineEnd: 4,
      },
      {
        id: "a2",
        type: "comment",
        tag: "confusion",
        y: 220,
        text: "Why does this create deadweight loss exactly?",
        color: "#fbbf24",
        lineStart: 10,
        lineEnd: 10,
      },
      {
        id: "a3",
        type: "pin",
        tag: "exam",
        y: 360,
        text: "Key for exam — know all three models",
        color: "#fb7185",
        lineStart: 17,
        lineEnd: 20,
      },
    ],
  );
  const [tool, setTool] = useState<AnnotationType>("highlight");
  const [activeTag, setActiveTag] = useState<AnnotationTag>("definition");
  const [tagFilter, setTagFilter] = useState<AnnotationTag | "all">("all");
  const [activeColor, setActiveColor] = useState(COLORS[0]!);
  const [newComment, setNewComment] = useState("");
  const [addingAt, setAddingAt] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const lines = text.split("\n");

  const addAnnotation = useCallback(
    (lineIdx: number) => {
      if (tool === "comment") {
        setAddingAt(lineIdx);
        return;
      }
      const ann: Annotation = {
        id: `ann-${Date.now()}`,
        type: tool,
        tag: activeTag,
        y: lineIdx * 22 + 20,
        text: "",
        color: activeColor,
        lineStart: lineIdx,
        lineEnd: lineIdx,
      };
      setAnnotations((prev) => [...prev, ann]);
    },
    [tool, activeTag, activeColor],
  );

  const confirmComment = () => {
    if (addingAt === null || !newComment.trim()) return;
    const ann: Annotation = {
      id: `ann-${Date.now()}`,
      type: "comment",
      tag: activeTag,
      y: addingAt * 22 + 20,
      text: newComment.trim(),
      color: activeColor,
      lineStart: addingAt,
      lineEnd: addingAt,
    };
    setAnnotations((prev) => [...prev, ann]);
    setNewComment("");
    setAddingAt(null);
  };

  const removeAnnotation = (id: string) =>
    setAnnotations((prev) => prev.filter((a) => a.id !== id));

  const highlightedLines = new Set<number>();
  annotations
    .filter((a) => a.type === "highlight")
    .forEach((a) => {
      for (let i = a.lineStart; i <= a.lineEnd; i++) highlightedLines.add(i);
    });

  const filteredAnnotations = annotations.filter(
    (a) => tagFilter === "all" || a.tag === tagFilter,
  );

  const tagLabel = (tag: AnnotationTag) =>
    `${TAG_KEYS.find((tk) => tk.id === tag)?.emoji} ${t(TAG_KEYS.find((tk) => tk.id === tag)?.key)}`;

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#5a5280] bg-card">
      <div className="flex shrink-0 flex-col gap-2 border-b border-[#5a5280] bg-white/[0.03] px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-foreground">
            📄 {displayTitle}
          </span>
          <div className="flex items-center gap-1">
            {(
              [
                {
                  t: "highlight" as const,
                  Icon: Highlighter,
                  labelKey: "workspace.source.tool.highlight",
                },
                {
                  t: "comment" as const,
                  Icon: MessageSquare,
                  labelKey: "workspace.source.tool.comment",
                },
                {
                  t: "pin" as const,
                  Icon: Pin,
                  labelKey: "workspace.source.tool.pin",
                },
              ] as const
            ).map((b) => (
              <button
                key={b.t}
                onClick={() => setTool(b.t)}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all",
                  tool === b.t
                    ? "border border-synapse-brand-500/40 bg-synapse-brand-600/25 text-synapse-brand-200"
                    : "text-[#b8b3d4] hover:text-foreground",
                )}
              >
                <b.Icon className="h-3.5 w-3.5" />
                {t(b.labelKey)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-[#b8b3d4]">
            {t("workspace.source.tag.label")}:
          </span>
          {TAG_KEYS.map((tk) => (
            <button
              key={tk.id}
              type="button"
              onClick={() => setActiveTag(tk.id)}
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors",
                activeTag === tk.id
                  ? "bg-synapse-brand-600/30 text-synapse-brand-200"
                  : "bg-white/[0.05] text-[#b8b3d4] hover:text-foreground",
              )}
            >
              {tk.emoji} {t(tk.key)}
            </button>
          ))}
          <div className="ml-auto flex gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setActiveColor(c)}
                aria-label={`Color ${c}`}
                className={cn(
                  "h-4 w-4 rounded-full border-2 transition-all",
                  activeColor === c
                    ? "scale-125 border-white"
                    : "border-transparent opacity-70",
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          ref={contentRef}
          className="relative flex-1 overflow-y-auto p-4 font-mono text-sm leading-[22px] text-[#ddd9ee]"
        >
          {lines.map((line, i) => {
            const isHighlighted = highlightedLines.has(i);
            const isEmpty = line.trim() === "";
            const isHeading =
              line.startsWith("Chapter") || /^\d+\.\d+/.test(line);
            return (
              <div
                key={i}
                onClick={() => addAnnotation(i)}
                className={cn(
                  "cursor-pointer rounded px-2 transition-colors hover:bg-white/[0.05]",
                  isHighlighted &&
                    "border-l-2 border-synapse-brand-500 bg-synapse-brand-500/12",
                  isHeading && "mt-2 text-base font-bold text-foreground",
                  isEmpty && "h-3",
                )}
              >
                {line || "\u00A0"}
              </div>
            );
          })}
        </div>

        <div
          className={cn(
            "overflow-y-auto border-l border-[#5a5280] bg-white/[0.02] transition-all",
            expanded ? "w-72" : "w-8",
          )}
        >
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-center p-2 text-[#b8b3d4] hover:text-foreground"
            aria-label={expanded ? "Collapse panel" : "Expand panel"}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 rotate-90" />
            ) : (
              <ChevronUp className="h-4 w-4 rotate-90" />
            )}
          </button>
          {expanded && (
            <div className="space-y-2 px-2 pb-2">
              <div className="flex flex-wrap gap-1 px-1">
                <button
                  type="button"
                  onClick={() => setTagFilter("all")}
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px]",
                    tagFilter === "all"
                      ? "bg-synapse-brand-600/30 text-synapse-brand-200"
                      : "text-[#b8b3d4]",
                  )}
                >
                  {t("workspace.source.filter.all")}
                </button>
                {TAG_KEYS.map((tk) => (
                  <button
                    key={tk.id}
                    type="button"
                    onClick={() => setTagFilter(tk.id)}
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px]",
                      tagFilter === tk.id
                        ? "bg-synapse-brand-600/30 text-synapse-brand-200"
                        : "text-[#b8b3d4]",
                    )}
                  >
                    {tk.emoji}
                  </button>
                ))}
              </div>
              <p className="px-1 text-xs font-medium text-[#b8b3d4]">
                {t("workspace.source.count", {
                  count: filteredAnnotations.length,
                })}
              </p>
              <AnimatePresence>
                {filteredAnnotations.map((ann) => (
                  <motion.div
                    key={ann.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="rounded-lg border p-2 text-xs"
                    style={{
                      borderColor: `${ann.color}50`,
                      backgroundColor: `${ann.color}10`,
                    }}
                  >
                    <div className="mb-1 flex items-center justify-between gap-1">
                      <span
                        className="font-medium"
                        style={{ color: ann.color }}
                      >
                        {ann.type === "highlight"
                          ? "🖍"
                          : ann.type === "comment"
                            ? "💬"
                            : "📌"}{" "}
                        {tagLabel(ann.tag)}
                      </span>
                      <button
                        onClick={() => removeAnnotation(ann.id)}
                        className="text-[#b8b3d4] hover:text-synapse-accent-rose"
                        aria-label="Delete annotation"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-[#b8b3d4]">
                      {t("workspace.source.line", { n: ann.lineStart + 1 })}
                    </p>
                    {ann.text && (
                      <p className="mt-1 text-[#ddd9ee]">{ann.text}</p>
                    )}
                    {onAskAgent && (
                      <button
                        onClick={() =>
                          onAskAgent(
                            ann.text ||
                              lines
                                .slice(ann.lineStart, ann.lineEnd + 1)
                                .join(" "),
                          )
                        }
                        className="mt-1.5 flex items-center gap-1 text-synapse-brand-300 hover:text-synapse-brand-200"
                      >
                        <Sparkles className="h-3.5 w-3.5" />{" "}
                        {t("workspace.source.askAgent")}
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {addingAt !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="synapse-glass-strong absolute bottom-0 left-0 right-0 border-t border-[#5a5280] p-3"
          >
            <p className="mb-2 text-sm font-semibold">
              💬 {t("workspace.source.addComment", { n: addingAt + 1 })}
            </p>
            <div className="flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t("workspace.source.commentPlaceholder")}
                onKeyDown={(e) => e.key === "Enter" && confirmComment()}
                className="flex-1 rounded-lg border border-[#5a5280] bg-background/80 px-3 py-2 text-sm text-foreground placeholder:text-[#b8b3d4] focus:border-synapse-brand-500/50 focus:outline-none"
              />
              <button
                onClick={confirmComment}
                className="rounded-lg bg-synapse-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-synapse-brand-500"
              >
                {t("workspace.source.add")}
              </button>
              <button
                onClick={() => setAddingAt(null)}
                className="rounded-lg px-3 py-2 text-sm text-[#b8b3d4] hover:text-foreground"
                aria-label={t("cancel")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
