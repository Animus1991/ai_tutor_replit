/**
 * InteractiveSimulator — presets, challenge mode, formula overlay (Sprint 2).
 */

import { useTranslation } from "@/lib/i18n";
import {
  SANDBOX_CHALLENGE_TARGET_P,
  SANDBOX_CHALLENGE_TOLERANCE,
  SANDBOX_PRESETS,
} from "@/lib/i18n-sprint2";
import { cn } from "@/lib/utils";
import { WS_GRAPH, WS_SURPLUS } from "@/lib/workspaceTokens";
import { motion } from "framer-motion";
import { ArrowRight, SlidersHorizontal, Target, Zap } from "lucide-react";
import { useMemo, useState } from "react";

export function InteractiveSimulator() {
  const { t } = useTranslation();
  const [demandShift, setDemandShift] = useState(0);
  const [supplyShift, setSupplyShift] = useState(0);

  const w = 360;
  const h = 280;
  const pad = 40;
  const gw = w - 2 * pad;
  const gh = h - 2 * pad;

  const eqP = (100 + demandShift - supplyShift) / 2;
  const eqQ = eqP + supplyShift;

  const challengeMet =
    Math.abs(eqP - SANDBOX_CHALLENGE_TARGET_P) <= SANDBOX_CHALLENGE_TOLERANCE;

  const scaleX = gw / 140;
  const scaleY = gh / 140;
  const toX = (q: number) => pad + q * scaleX;
  const toY = (p: number) => h - pad - p * scaleY;

  const dQ0 = 100 + demandShift;
  const dP0 = 100 + demandShift;
  const sP_Q0 = -supplyShift;
  const sP1 = Math.max(0, sP_Q0);
  const sQ1 = sP1 + supplyShift;
  const sP2 = 140;
  const sQ2 = sP2 + supplyShift;

  const applyPreset = (demand: number, supply: number) => {
    setDemandShift(demand);
    setSupplyShift(supply);
  };

  const presetButtons = useMemo(
    () =>
      SANDBOX_PRESETS.map((p) => ({
        ...p,
        label: t(`workspace.sandbox.preset.${p.id}`),
      })),
    [t],
  );

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-[#5a5280] bg-white/[0.03] px-4 py-2.5">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="h-4 w-4" />{" "}
          {t("workspace.sandbox.title")}
        </span>
        <span className="rounded border border-synapse-accent-teal/35 bg-synapse-accent-teal/15 px-2.5 py-1 text-xs text-synapse-accent-teal">
          {t("workspace.sandbox.mode")}
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center overflow-y-auto p-4">
        <div className="mb-3 w-full max-w-sm">
          <p className="mb-1.5 text-xs font-medium text-[#b8b3d4]">
            {t("workspace.sandbox.presets")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {presetButtons.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.demand, p.supply)}
                className="rounded-full border border-[#5a5280] bg-white/[0.04] px-2.5 py-1 text-xs text-foreground/90 hover:border-synapse-brand-500/40"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <svg width={w} height={h} className="mb-3 block overflow-visible">
          <line
            x1={pad}
            y1={pad - 10}
            x2={pad}
            y2={h - pad}
            stroke={WS_GRAPH.edgeDefault}
            strokeWidth={2}
          />
          <line
            x1={pad}
            y1={h - pad}
            x2={w - pad + 10}
            y2={h - pad}
            stroke={WS_GRAPH.edgeDefault}
            strokeWidth={2}
          />
          <text
            x={pad - 15}
            y={pad}
            fill={WS_GRAPH.axisLabel}
            fontSize={11}
            fontWeight="bold"
          >
            {t("workspace.sandbox.price")}
          </text>
          <text
            x={w - pad}
            y={h - pad + 15}
            fill={WS_GRAPH.axisLabel}
            fontSize={11}
            fontWeight="bold"
          >
            {t("workspace.sandbox.quantity")}
          </text>

          <motion.polygon
            points={`${toX(0)},${toY(dQ0)} ${toX(eqQ)},${toY(eqP)} ${toX(0)},${toY(eqP)}`}
            fill={WS_SURPLUS.consumer}
            opacity={0.15}
            animate={{
              points: `${toX(0)},${toY(dQ0)} ${toX(eqQ)},${toY(eqP)} ${toX(0)},${toY(eqP)}`,
            }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          />
          <motion.polygon
            points={`${toX(0)},${toY(eqP)} ${toX(eqQ)},${toY(eqP)} ${toX(0)},${toY(Math.max(0, sP_Q0))}`}
            fill={WS_SURPLUS.producer}
            opacity={0.15}
            animate={{
              points: `${toX(0)},${toY(eqP)} ${toX(eqQ)},${toY(eqP)} ${toX(0)},${toY(Math.max(0, sP_Q0))}`,
            }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          />
          <motion.line
            x1={toX(0)}
            y1={toY(dQ0)}
            x2={toX(dP0)}
            y2={toY(0)}
            stroke={WS_SURPLUS.consumer}
            strokeWidth={3}
            strokeLinecap="round"
            animate={{ x1: toX(0), y1: toY(dQ0), x2: toX(dP0), y2: toY(0) }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          />
          <text
            x={toX(dP0) - 10}
            y={toY(0) - 10}
            fill={WS_SURPLUS.consumer}
            fontSize={12}
            fontWeight="bold"
          >
            D
          </text>
          <motion.line
            x1={toX(sQ1)}
            y1={toY(sP1)}
            x2={toX(sQ2)}
            y2={toY(sP2)}
            stroke={WS_SURPLUS.producer}
            strokeWidth={3}
            strokeLinecap="round"
            animate={{ x1: toX(sQ1), y1: toY(sP1), x2: toX(sQ2), y2: toY(sP2) }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          />
          <text
            x={toX(sQ2) - 10}
            y={toY(sP2) + 15}
            fill={WS_SURPLUS.producer}
            fontSize={12}
            fontWeight="bold"
          >
            S
          </text>
          <line
            x1={pad}
            y1={toY(eqP)}
            x2={toX(eqQ)}
            y2={toY(eqP)}
            stroke={WS_SURPLUS.equilibrium}
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.5}
          />
          <line
            x1={toX(eqQ)}
            y1={h - pad}
            x2={toX(eqQ)}
            y2={toY(eqP)}
            stroke={WS_SURPLUS.equilibrium}
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.5}
          />
          <circle
            cx={toX(eqQ)}
            cy={toY(eqP)}
            r={6}
            fill={WS_SURPLUS.equilibrium}
          />
        </svg>

        <div className="mb-4 flex gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-synapse-accent-emerald">
            <span className="h-3.5 w-3.5 rounded-sm border border-synapse-accent-emerald bg-synapse-accent-emerald/25" />
            {t("workspace.sandbox.consumerSurplus")}
          </span>
          <span className="flex items-center gap-1.5 text-synapse-brand-300">
            <span className="h-3.5 w-3.5 rounded-sm border border-synapse-brand-400 bg-synapse-brand-500/25" />
            {t("workspace.sandbox.producerSurplus")}
          </span>
        </div>

        <div className="mb-3 w-full max-w-sm rounded-xl border border-[#5a5280] bg-background/50 p-3">
          <p className="mb-1 text-[11px] font-semibold text-synapse-brand-300">
            {t("workspace.sandbox.formula.title")}
          </p>
          <p className="font-mono text-sm text-[#ddd9ee]">
            {t("workspace.sandbox.formula.p")}
          </p>
          <p className="font-mono text-sm text-[#ddd9ee]">
            {t("workspace.sandbox.formula.q")}
          </p>
        </div>

        <div className="w-full max-w-sm space-y-4 rounded-xl border border-[#5a5280] bg-background/60 p-4">
          <div>
            <div className="mb-2 flex justify-between">
              <label className="text-xs font-semibold text-synapse-accent-emerald">
                {t("workspace.sandbox.demandShock")}
              </label>
              <span className="font-mono text-xs text-[#b8b3d4]">
                {demandShift > 0 ? "+" : ""}
                {demandShift}
              </span>
            </div>
            <input
              type="range"
              min={-40}
              max={40}
              value={demandShift}
              onChange={(e) => setDemandShift(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: "#34d399" }}
            />
          </div>
          <div>
            <div className="mb-2 flex justify-between">
              <label className="text-xs font-semibold text-synapse-brand-300">
                {t("workspace.sandbox.supplyShock")}
              </label>
              <span className="font-mono text-xs text-[#b8b3d4]">
                {supplyShift > 0 ? "+" : ""}
                {supplyShift}
              </span>
            </div>
            <input
              type="range"
              min={-40}
              max={40}
              value={supplyShift}
              onChange={(e) => setSupplyShift(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: "#818cf8" }}
            />
          </div>
          <div className="flex items-center justify-between border-t border-[#5a5280] pt-3 font-mono text-sm">
            <span>
              P* = <strong>{eqP.toFixed(1)}</strong>
            </span>
            <ArrowRight className="h-4 w-4 text-[#b8b3d4]" />
            <span>
              Q* = <strong>{eqQ.toFixed(1)}</strong>
            </span>
          </div>
        </div>

        <div
          className={cn(
            "mt-4 w-full max-w-sm rounded-lg border p-3.5 text-sm",
            challengeMet
              ? "border-synapse-accent-emerald/40 bg-synapse-accent-emerald/10 text-synapse-accent-emerald"
              : "border-synapse-accent-amber/35 bg-synapse-accent-amber/8 text-[#ddd9ee]",
          )}
        >
          <div className="mb-1 flex items-center gap-2 font-semibold">
            <Target className="h-4 w-4" />
            {t("workspace.sandbox.challenge.title")}
          </div>
          {challengeMet ? (
            <p>
              {t("workspace.sandbox.challenge.success", { p: eqP.toFixed(1) })}
            </p>
          ) : (
            <>
              <p>
                {t("workspace.sandbox.challenge.prompt", {
                  target: SANDBOX_CHALLENGE_TARGET_P,
                  tol: SANDBOX_CHALLENGE_TOLERANCE,
                })}
              </p>
              <p className="mt-1 text-xs text-[#b8b3d4]">
                {t("workspace.sandbox.challenge.hint")}
              </p>
            </>
          )}
        </div>

        <div className="mt-4 flex w-full max-w-sm items-start gap-2 rounded-lg border border-synapse-brand-500/30 bg-synapse-brand-500/12 p-3.5 text-sm text-synapse-brand-200">
          <Zap className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{t("workspace.sandbox.insight")}</p>
        </div>
      </div>
    </div>
  );
}
