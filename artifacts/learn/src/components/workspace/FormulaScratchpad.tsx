/**
 * FormulaScratchpad
 *
 * Side panel for substituting variables into preset formulas and seeing the
 * step-by-step computation. Great companion to numerical exercises in the
 * Study Workspace.
 */

import { useEffect, useMemo, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { Check, Copy, Link2, Plus, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";

import { useTranslation } from "@/lib/i18n";

interface Variable {
  symbol: string;

  value: string;

  unit: string;
}

interface SavedFormula {
  id: string;

  nameKey: string;

  formula: string;

  variables: Variable[];
}

const PRESET_FORMULAS: SavedFormula[] = [
  {
    id: "f1",

    nameKey: "workspace.scratchpad.form.f1",

    formula: "Eₚ = (%ΔQᵈ) / (%ΔP)",

    variables: [
      { symbol: "%ΔQᵈ", value: "", unit: "%" },

      { symbol: "%ΔP", value: "", unit: "%" },
    ],
  },

  {
    id: "f2",

    nameKey: "workspace.scratchpad.form.f2",

    formula: "q₁* = (a − c − q₂) / 2b",

    variables: [
      { symbol: "a", value: "100", unit: "$/u" },

      { symbol: "c", value: "10", unit: "$/u" },

      { symbol: "q₂", value: "30", unit: "u" },

      { symbol: "b", value: "1", unit: "" },
    ],
  },

  {
    id: "f3",

    nameKey: "workspace.scratchpad.form.f3",

    formula: "CS = ½ × (Pmax − P*) × Q*",

    variables: [
      { symbol: "Pmax", value: "", unit: "$" },

      { symbol: "P*", value: "", unit: "$" },

      { symbol: "Q*", value: "", unit: "u" },
    ],
  },

  {
    id: "f4",

    nameKey: "workspace.scratchpad.form.f4",

    formula: "π = TR − TC = P×Q − TC(Q)",

    variables: [
      { symbol: "P", value: "", unit: "$" },

      { symbol: "Q", value: "", unit: "u" },

      { symbol: "TC", value: "", unit: "$" },
    ],
  },
];

export interface LessonScratchpadLink {
  formulaId: string;

  step: number;

  variables: Variable[];
}

interface FormulaScratchpadProps {
  lessonStep?: number;

  lessonLink?: LessonScratchpadLink;
}

export function FormulaScratchpad({
  lessonStep = 0,

  lessonLink,
}: FormulaScratchpadProps) {
  const { t } = useTranslation();

  const [formulas, setFormulas] = useState<SavedFormula[]>(PRESET_FORMULAS);

  const [active, setActive] = useState<string>("f2");

  const [vars, setVars] = useState<Variable[]>(PRESET_FORMULAS[1]?.variables);

  const [steps, setSteps] = useState<string[]>([]);

  const [copied, setCopied] = useState(false);

  const [linkedFromLesson, setLinkedFromLesson] = useState(false);

  const activeFormula = formulas.find((f) => f.id === active);

  const showLessonBanner = useMemo(() => {
    if (!lessonLink) return false;

    return lessonStep === lessonLink.step || lessonStep === 1;
  }, [lessonLink, lessonStep]);

  const selectFormula = (id: string, overrideVars?: Variable[]) => {
    const f = formulas.find((x) => x.id === id);

    if (f) {
      setActive(id);

      setVars(overrideVars ? [...overrideVars] : [...f.variables]);

      setSteps([]);

      setLinkedFromLesson(Boolean(overrideVars));
    }
  };

  const loadFromLesson = () => {
    if (!lessonLink) return;

    selectFormula(lessonLink.formulaId, lessonLink.variables);
  };

  useEffect(() => {
    if (showLessonBanner && lessonLink && lessonStep === lessonLink.step) {
      loadFromLesson();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps -- auto-load once per step entry
  }, [lessonStep, lessonLink?.step]);

  const updateVar = (idx: number, value: string) => {
    setVars((prev) => prev.map((v, i) => (i === idx ? { ...v, value } : v)));
  };

  const compute = () => {
    if (!activeFormula) return;

    const filled = vars.filter((v) => v.value !== "");

    if (filled.length < vars.length) {
      setSteps([t("workspace.scratchpad.err.fill")]);

      return;
    }

    if (active === "f2") {
      const a = Number.parseFloat(vars[0]?.value);

      const c = Number.parseFloat(vars[1]?.value);

      const q2 = Number.parseFloat(vars[2]?.value);

      const b = Number.parseFloat(vars[3]?.value);

      if ([a, c, q2, b].some((n) => Number.isNaN(n))) {
        setSteps([t("workspace.scratchpad.err.invalid")]);

        return;
      }

      const num = a - c - q2;

      const denom = 2 * b;

      const result = num / denom;

      setSteps([
        `Step 1: Substitute values into ${activeFormula.formula}`,

        `Step 2: q₁* = (${a} − ${c} − ${q2}) / (2 × ${b})`,

        `Step 3: q₁* = ${num} / ${denom}`,

        `Step 4: q₁* = ${result.toFixed(2)} units`,

        `✓ The optimal quantity for Firm 1 is ${result.toFixed(2)} units.`,
      ]);
    } else if (active === "f1") {
      const dq = Number.parseFloat(vars[0]?.value);

      const dp = Number.parseFloat(vars[1]?.value);

      if ([dq, dp].some((n) => Number.isNaN(n)) || dp === 0) {
        setSteps([t("workspace.scratchpad.err.invalid")]);

        return;
      }

      const e = dq / dp;

      const abs = Math.abs(e);

      const desc =
        abs > 1 ? "elastic" : abs === 1 ? "unit elastic" : "inelastic";

      setSteps([
        `Step 1: Eₚ = ${dq}% / ${dp}%`,

        `Step 2: Eₚ = ${e.toFixed(2)}`,

        `Step 3: |Eₚ| = ${abs.toFixed(2)} → demand is ${desc}`,

        `✓ Price elasticity is ${e.toFixed(2)} (${desc}).`,
      ]);
    } else {
      setSteps([
        `Substituting values into ${activeFormula.formula}…`,

        "✓ Computation complete (full solver coming soon).",
      ]);
    }
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(steps.join("\n"));

      setCopied(true);

      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const addCustom = () => {
    const id = `f-${Date.now()}`;

    const f: SavedFormula = {
      id,

      nameKey: "workspace.scratchpad.form.custom",

      formula: "y = mx + b",

      variables: [
        { symbol: "m", value: "", unit: "" },

        { symbol: "x", value: "", unit: "" },

        { symbol: "b", value: "", unit: "" },
      ],
    };

    setFormulas((prev) => [...prev, f]);

    selectFormula(id);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-white/[0.02] px-3 py-1.5">
        <span className="text-xs font-semibold text-foreground">
          📐 {t("workspace.scratchpad.title")}
        </span>
        <button
          onClick={addCustom}
          className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[10px] text-muted-foreground hover:bg-white/10 hover:text-foreground"
        >
          <Plus className="h-3 w-3" /> {t("workspace.scratchpad.addCustom")}
        </button>
      </div>

      {showLessonBanner && lessonLink && (
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-synapse-brand-500/20 bg-synapse-brand-500/10 px-3 py-1.5">
          <p className="flex items-center gap-1.5 text-[10px] text-synapse-brand-200">
            <Link2 className="h-3 w-3 shrink-0" />
            {linkedFromLesson
              ? t("workspace.scratchpad.lessonLink").replace(
                  "{{step}}",

                  String(lessonLink.step + 1),
                )
              : t("workspace.scratchpad.loadLesson")}
          </p>
          {!linkedFromLesson && (
            <button
              type="button"
              onClick={loadFromLesson}
              className="shrink-0 rounded-md bg-synapse-brand-600/30 px-2 py-0.5 text-[10px] font-medium text-synapse-brand-200 hover:bg-synapse-brand-600/45"
            >
              {t("workspace.scratchpad.loadLesson")}
            </button>
          )}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="w-36 shrink-0 overflow-y-auto border-r border-border py-1.5">
          {formulas.map((f) => (
            <button
              key={f.id}
              onClick={() => selectFormula(f.id)}
              className={cn(
                "w-full px-2.5 py-1.5 text-left text-[11px] transition-all",

                active === f.id
                  ? "border-l-2 border-synapse-brand-500 bg-synapse-brand-600/15 text-synapse-brand-300"
                  : "text-muted-foreground hover:bg-white/[0.04]",
              )}
            >
              {t(f.nameKey)}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-3">
          {activeFormula && (
            <>
              <div className="text-center">
                <p className="mb-1 text-[10px] text-muted-foreground">
                  {t(activeFormula.nameKey)}
                </p>
                <div className="inline-block rounded-xl bg-background/60 px-4 py-2 font-mono text-2xl font-bold text-synapse-brand-300">
                  {activeFormula.formula}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] font-medium text-muted-foreground">
                  {t("workspace.scratchpad.variables")}
                </p>
                {vars.map((v, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-10 shrink-0 text-right font-mono text-xs font-bold text-synapse-brand-400">
                      {v.symbol}
                    </span>
                    <span className="text-xs text-muted-foreground">=</span>
                    <input
                      type="text"
                      value={v.value}
                      onChange={(e) => updateVar(i, e.target.value)}
                      placeholder="value"
                      className="flex-1 rounded-lg border border-border bg-background/80 px-2 py-1 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-synapse-brand-500/50 focus:outline-none"
                    />
                    {v.unit && (
                      <span className="w-7 text-[9px] text-muted-foreground">
                        {v.unit}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={compute}
                  className="flex-1 rounded-xl bg-synapse-brand-600 py-2 text-xs font-semibold text-white transition-all hover:bg-synapse-brand-500"
                >
                  {t("workspace.scratchpad.compute")}
                </button>
                <button
                  onClick={() => {
                    setVars(
                      activeFormula.variables.map((v) => ({ ...v, value: "" })),
                    );

                    setSteps([]);

                    setLinkedFromLesson(false);
                  }}
                  className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>

              <AnimatePresence>
                {steps.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1.5 rounded-xl border border-border bg-background/60 p-3"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {t("workspace.scratchpad.solution")}
                      </span>
                      <button
                        onClick={copyResult}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3 w-3 text-synapse-accent-emerald" />{" "}
                            {t("workspace.scratchpad.copied")}
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />{" "}
                            {t("workspace.scratchpad.copy")}
                          </>
                        )}
                      </button>
                    </div>
                    {steps.map((s, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.12 }}
                        className={cn(
                          "font-mono text-xs",

                          s.startsWith("✓")
                            ? "font-semibold text-synapse-accent-emerald"
                            : s.startsWith("⚠")
                              ? "text-synapse-accent-amber"
                              : "text-foreground/80",
                        )}
                      >
                        {s}
                      </motion.p>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
