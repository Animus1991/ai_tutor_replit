/**
 * Study Whiteboard — canvas notes with pen, marker, shapes, ruler, text, undo/redo.
 */

import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Circle,
  Eraser,
  Highlighter,
  Minus,
  Pen,
  Redo2,
  Ruler,
  Save,
  Square,
  Trash2,
  Type,
  Undo2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Tool =
  | "pen"
  | "marker"
  | "highlighter"
  | "eraser"
  | "line"
  | "rect"
  | "ellipse"
  | "arrow"
  | "ruler"
  | "text";

type Point = { x: number; y: number };

type Stroke = {
  tool: Tool;
  color: string;
  width: number;
  points: Point[];
  text?: string;
};

const COLORS = [
  "#f8fafc",
  "#67e8f9",
  "#a78bfa",
  "#6ee7b7",
  "#fbbf24",
  "#f87171",
  "#fb7185",
  "#1e293b",
];

const STORAGE_KEY = "synapse.whiteboard.v1";

function dist(a: Point, b: Point) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function StudyWhiteboard({ className }: { className?: string }) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(COLORS[1]!);
  const [width, setWidth] = useState(3);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [_redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [draft, setDraft] = useState<Stroke | null>(null);
  const [savedMsg, setSavedMsg] = useState(false);
  const drawing = useRef(false);

  const redraw = useCallback((list: Stroke[], current?: Stroke | null) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = Math.max(420, container.clientHeight - 8);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, w, h);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const drawStroke = (s: Stroke) => {
      if (s.points.length === 0) return;
      if (s.tool === "text" && s.text) {
        ctx.fillStyle = s.color;
        ctx.font = `${Math.max(14, s.width * 5)}px system-ui, sans-serif`;
        ctx.fillText(s.text, s.points[0]?.x, s.points[0]?.y);
        return;
      }
      if (s.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else if (s.tool === "highlighter") {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = s.color;
        ctx.globalAlpha = 0.35;
      } else if (s.tool === "marker") {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = s.color;
        ctx.globalAlpha = 0.75;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = s.color;
        ctx.globalAlpha = 1;
      }
      ctx.lineWidth = s.width;

      const p0 = s.points[0]!;
      const p1 = s.points[s.points.length - 1]!;

      if (
        ["line", "ruler", "arrow", "rect", "ellipse"].includes(s.tool) &&
        s.points.length >= 2
      ) {
        ctx.beginPath();
        if (s.tool === "rect") {
          ctx.strokeRect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y);
        } else if (s.tool === "ellipse") {
          const rx = Math.abs(p1.x - p0.x) / 2;
          const ry = Math.abs(p1.y - p0.y) / 2;
          const cx = (p0.x + p1.x) / 2;
          const cy = (p0.y + p1.y) / 2;
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
          if (s.tool === "arrow") {
            const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
            const head = 10 + s.width;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(
              p1.x - head * Math.cos(angle - 0.4),
              p1.y - head * Math.sin(angle - 0.4),
            );
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(
              p1.x - head * Math.cos(angle + 0.4),
              p1.y - head * Math.sin(angle + 0.4),
            );
            ctx.stroke();
          }
          if (s.tool === "ruler") {
            const len = dist(p0, p1);
            ctx.fillStyle = s.color;
            ctx.globalAlpha = 1;
            ctx.font = "11px system-ui";
            ctx.fillText(
              `${Math.round(len)} px`,
              (p0.x + p1.x) / 2 + 6,
              (p0.y + p1.y) / 2 - 6,
            );
          }
        }
      } else {
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        for (let i = 1; i < s.points.length; i++) {
          ctx.lineTo(s.points[i]?.x, s.points[i]?.y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    for (const s of list) drawStroke(s);
    if (current) drawStroke(current);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStrokes(JSON.parse(raw) as Stroke[]);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    redraw(strokes, draft);
  }, [strokes, draft, redraw]);

  useEffect(() => {
    const ro = new ResizeObserver(() => redraw(strokes, draft));
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [strokes, draft, redraw]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const effectiveWidth =
    tool === "marker"
      ? width * 2.5
      : tool === "highlighter"
        ? width * 4
        : tool === "eraser"
          ? width * 3
          : width;

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool === "text") {
      const p = pos(e);
      const text = window.prompt(t("whiteboard.textPrompt"));
      if (text?.trim()) {
        const stroke: Stroke = {
          tool: "text",
          color,
          width,
          points: [p],
          text: text.trim(),
        };
        setStrokes((s) => [...s, stroke]);
        setRedoStack([]);
      }
      return;
    }
    drawing.current = true;
    const p = pos(e);
    setDraft({ tool, color, width: effectiveWidth, points: [p] });
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !draft) return;
    const p = pos(e);
    if (["line", "ruler", "arrow", "rect", "ellipse"].includes(tool)) {
      setDraft({ ...draft, points: [draft.points[0]!, p] });
    } else {
      setDraft({ ...draft, points: [...draft.points, p] });
    }
  };

  const onUp = () => {
    if (!drawing.current || !draft) return;
    drawing.current = false;
    setStrokes((s) => [...s, draft]);
    setDraft(null);
    setRedoStack([]);
  };

  const undo = () => {
    setStrokes((s) => {
      if (s.length === 0) return s;
      const last = s[s.length - 1]!;
      setRedoStack((r) => [...r, last]);
      return s.slice(0, -1);
    });
  };

  const redo = () => {
    setRedoStack((r) => {
      if (r.length === 0) return r;
      const last = r[r.length - 1]!;
      setStrokes((s) => [...s, last]);
      return r.slice(0, -1);
    });
  };

  const clear = () => {
    setStrokes([]);
    setRedoStack([]);
    setDraft(null);
  };

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(strokes));
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    } catch {
      // ignore
    }
  };

  const TOOLS: {
    id: Tool;
    icon: React.ComponentType<{ className?: string }>;
    labelKey: string;
  }[] = [
    { id: "pen", icon: Pen, labelKey: "whiteboard.tool.pen" },
    { id: "marker", icon: Highlighter, labelKey: "whiteboard.tool.marker" },
    {
      id: "highlighter",
      icon: Highlighter,
      labelKey: "whiteboard.tool.highlighter",
    },
    { id: "eraser", icon: Eraser, labelKey: "whiteboard.tool.eraser" },
    { id: "line", icon: Minus, labelKey: "whiteboard.tool.line" },
    { id: "rect", icon: Square, labelKey: "whiteboard.tool.rect" },
    { id: "ellipse", icon: Circle, labelKey: "whiteboard.tool.ellipse" },
    { id: "arrow", icon: ArrowRight, labelKey: "whiteboard.tool.arrow" },
    { id: "ruler", icon: Ruler, labelKey: "whiteboard.tool.ruler" },
    { id: "text", icon: Type, labelKey: "whiteboard.tool.text" },
  ];

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="shrink-0 border-b border-border px-3 py-2">
        <h3 className="text-sm font-semibold">{t("whiteboard.title")}</h3>
        <p className="text-[10px] text-muted-foreground">
          {t("whiteboard.subtitle")}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        {TOOLS.map(({ id, icon: Icon, labelKey }) => (
          <button
            key={id}
            type="button"
            title={t(labelKey)}
            onClick={() => setTool(id)}
            className={cn(
              "flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors",
              tool === id
                ? "bg-synapse-brand-600/20 text-synapse-brand-300"
                : "text-muted-foreground hover:bg-white/[0.04]",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t(labelKey)}</span>
          </button>
        ))}
        <div className="mx-1 h-5 w-px bg-border" />
        <button
          type="button"
          onClick={undo}
          title={t("whiteboard.undo")}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/[0.04]"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={redo}
          title={t("whiteboard.redo")}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/[0.04]"
        >
          <Redo2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={clear}
          title={t("whiteboard.clear")}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/[0.04]"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={save}
          title={t("whiteboard.save")}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/[0.04]"
        >
          <Save className="h-3.5 w-3.5" />
        </button>
        {savedMsg && (
          <span className="text-[10px] text-synapse-accent-emerald">
            {t("whiteboard.saved")}
          </span>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border px-3 py-2 text-[10px]">
        <span className="text-muted-foreground">{t("whiteboard.color")}</span>
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={cn(
              "h-5 w-5 rounded-full border-2",
              color === c ? "border-synapse-brand-400" : "border-transparent",
            )}
            style={{ backgroundColor: c }}
          />
        ))}
        <span className="ml-2 text-muted-foreground">
          {t("whiteboard.strokeWidth")}
        </span>
        <input
          type="range"
          min={1}
          max={12}
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          className="w-24"
        />
      </div>

      <div ref={containerRef} className="relative min-h-0 flex-1 p-2">
        <canvas
          ref={canvasRef}
          className="touch-none rounded-xl border border-border"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
        />
      </div>
    </div>
  );
}
