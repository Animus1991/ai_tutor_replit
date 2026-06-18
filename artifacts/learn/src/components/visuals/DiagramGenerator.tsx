/**
 * Educational diagram components ported from Option A.
 * Used in Analytics, lessons, and workspace tools.
 */

import { motion } from "framer-motion";

export function SupplyDemandDiagram({
  priceFloor,
  priceCeiling,
}: {
  priceFloor?: number;
  priceCeiling?: number;
}) {
  const w = 320;
  const h = 240;
  const pad = 40;
  const gw = w - 2 * pad;
  const gh = h - 2 * pad;
  const eqX = pad + gw * 0.5;
  const eqY = pad + gh * 0.45;

  return (
    <div className="rounded-xl border border-synapse-border-subtle bg-synapse-surface-card p-4">
      <p className="mb-2 text-xs font-semibold text-synapse-text-secondary">
        Supply & Demand
      </p>
      <svg width={w} height={h} className="mx-auto block">
        <line
          x1={pad}
          y1={pad}
          x2={pad}
          y2={h - pad}
          stroke="#4d4870"
          strokeWidth={1.5}
        />
        <line
          x1={pad}
          y1={h - pad}
          x2={w - pad}
          y2={h - pad}
          stroke="#4d4870"
          strokeWidth={1.5}
        />
        <motion.line
          x1={pad + 10}
          y1={pad + 10}
          x2={w - pad - 10}
          y2={h - pad - 10}
          stroke="#818cf8"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.line
          x1={pad + 10}
          y1={h - pad - 10}
          x2={w - pad - 10}
          y2={pad + 10}
          stroke="#2dd4bf"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
        <motion.circle
          cx={eqX}
          cy={eqY}
          r={5}
          fill="#fbbf24"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
        />
        {priceCeiling != null && (
          <line
            x1={pad}
            y1={pad + gh * (1 - priceCeiling / 100)}
            x2={w - pad}
            y2={pad + gh * (1 - priceCeiling / 100)}
            stroke="#fb7185"
            strokeWidth={1.5}
            strokeDasharray="6,3"
          />
        )}
        {priceFloor != null && (
          <line
            x1={pad}
            y1={pad + gh * (1 - priceFloor / 100)}
            x2={w - pad}
            y2={pad + gh * (1 - priceFloor / 100)}
            stroke="#fb923c"
            strokeWidth={1.5}
            strokeDasharray="6,3"
          />
        )}
      </svg>
    </div>
  );
}

export function RetentionCurve({
  dataPoints,
}: {
  dataPoints: { day: number; retention: number }[];
}) {
  const w = 300;
  const h = 160;
  const pad = 30;
  const gw = w - 2 * pad;
  const gh = h - 2 * pad;
  const maxDay = Math.max(...dataPoints.map((d) => d.day), 30);

  const points = dataPoints.map((d) => ({
    x: pad + (d.day / maxDay) * gw,
    y: pad + gh - (d.retention / 100) * gh,
  }));
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");

  return (
    <div className="rounded-xl border border-synapse-border-subtle bg-synapse-surface-card p-4">
      <p className="mb-2 text-xs font-semibold text-synapse-text-secondary">
        Forgetting Curve
      </p>
      <svg width={w} height={h} className="mx-auto block">
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line
              x1={pad}
              y1={pad + gh - (v / 100) * gh}
              x2={w - pad}
              y2={pad + gh - (v / 100) * gh}
              stroke="#1e1740"
              strokeWidth={1}
            />
            <text
              x={pad - 5}
              y={pad + gh - (v / 100) * gh + 3}
              textAnchor="end"
              fill="#4d4870"
              fontSize={8}
            >
              {v}%
            </text>
          </g>
        ))}
        <motion.path
          d={pathD}
          fill="none"
          stroke="#818cf8"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5 }}
        />
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            fill="#818cf8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          />
        ))}
      </svg>
      <p className="mt-1 text-center text-[9px] text-synapse-text-muted">
        Spaced reviews reset the curve. Without review, retention decays
        exponentially.
      </p>
    </div>
  );
}

interface FormulaSymbol {
  symbol: string;
  meaning: string;
  unit?: string;
}

export function FormulaExplorer({
  formula,
  name,
  symbols,
}: {
  formula: string;
  name: string;
  symbols: FormulaSymbol[];
}) {
  return (
    <div className="rounded-xl border border-synapse-border-subtle bg-synapse-surface-card p-4">
      <p className="mb-3 text-xs font-semibold text-synapse-text-secondary">
        Formula Explorer
      </p>
      <div className="mb-4 text-center">
        <p className="mb-1 text-xs text-synapse-text-muted">{name}</p>
        <div className="inline-block rounded-lg bg-synapse-surface-primary/60 px-4 py-3 font-mono text-2xl font-bold text-synapse-brand-300">
          {formula}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {symbols.map((s) => (
          <div
            key={s.symbol}
            className="flex items-start gap-2 rounded-lg bg-synapse-surface-hover/50 p-2"
          >
            <span className="w-8 shrink-0 font-mono text-sm font-bold text-synapse-brand-400">
              {s.symbol}
            </span>
            <div>
              <p className="text-xs text-synapse-text-secondary">{s.meaning}</p>
              {s.unit && (
                <p className="text-[9px] text-synapse-text-muted">
                  Unit: {s.unit}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressTimeline({
  milestones,
  title,
}: {
  milestones: Array<{
    label: string;
    completed: boolean;
    date?: string;
    xp?: number;
  }>;
  title?: string;
}) {
  return (
    <div className="rounded-xl border border-synapse-border-subtle bg-synapse-surface-card p-4">
      {title && (
        <p className="mb-3 text-xs font-semibold text-synapse-text-secondary">
          {title}
        </p>
      )}
      <div className="space-y-0">
        {milestones.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-start gap-3"
          >
            <div className="flex flex-col items-center">
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                  m.completed
                    ? "border-synapse-accent-emerald bg-synapse-accent-emerald/20"
                    : "border-synapse-text-muted bg-synapse-surface-hover"
                }`}
              >
                {m.completed && (
                  <div className="h-1.5 w-1.5 rounded-full bg-synapse-accent-emerald" />
                )}
              </div>
              {i < milestones.length - 1 && (
                <div
                  className={`h-8 w-0.5 ${
                    m.completed
                      ? "bg-synapse-accent-emerald/30"
                      : "bg-synapse-border-subtle"
                  }`}
                />
              )}
            </div>
            <div className="pb-6">
              <p
                className={`text-xs font-medium ${
                  m.completed ? "text-foreground" : "text-synapse-text-tertiary"
                }`}
              >
                {m.label}
              </p>
              {m.date && (
                <p className="mt-0.5 text-[9px] text-synapse-text-muted">
                  {m.date}
                </p>
              )}
              {m.xp != null && m.completed && (
                <p className="mt-0.5 text-[9px] text-synapse-accent-amber">
                  +{m.xp} XP
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
