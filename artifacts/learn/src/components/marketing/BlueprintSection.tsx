/**
 * Implementation blueprint — product roadmap adapted from Option B for Synapse.
 */

import { useTranslation } from "@/lib/i18n";
import { motion } from "framer-motion";

const PHASES = [
  {
    phaseKey: "blueprint.phase1.phase",
    titleKey: "blueprint.phase1.title",
    bodyKey: "blueprint.phase1.body",
    outcomeKey: "blueprint.phase1.outcome",
  },
  {
    phaseKey: "blueprint.phase2.phase",
    titleKey: "blueprint.phase2.title",
    bodyKey: "blueprint.phase2.body",
    outcomeKey: "blueprint.phase2.outcome",
  },
  {
    phaseKey: "blueprint.phase3.phase",
    titleKey: "blueprint.phase3.title",
    bodyKey: "blueprint.phase3.body",
    outcomeKey: "blueprint.phase3.outcome",
  },
  {
    phaseKey: "blueprint.phase4.phase",
    titleKey: "blueprint.phase4.title",
    bodyKey: "blueprint.phase4.body",
    outcomeKey: "blueprint.phase4.outcome",
  },
] as const;

const BLOCKS = [
  {
    eyebrowKey: "blueprint.block.pedagogy.eyebrow",
    titleKey: "blueprint.block.pedagogy.title",
    summaryKey: "blueprint.block.pedagogy.summary",
    itemsKey: "blueprint.block.pedagogy.items",
  },
  {
    eyebrowKey: "blueprint.block.product.eyebrow",
    titleKey: "blueprint.block.product.title",
    summaryKey: "blueprint.block.product.summary",
    itemsKey: "blueprint.block.product.items",
  },
  {
    eyebrowKey: "blueprint.block.stack.eyebrow",
    titleKey: "blueprint.block.stack.title",
    summaryKey: "blueprint.block.stack.summary",
    itemsKey: "blueprint.block.stack.items",
  },
  {
    eyebrowKey: "blueprint.block.pipeline.eyebrow",
    titleKey: "blueprint.block.pipeline.title",
    summaryKey: "blueprint.block.pipeline.summary",
    itemsKey: "blueprint.block.pipeline.items",
  },
  {
    eyebrowKey: "blueprint.block.mvp.eyebrow",
    titleKey: "blueprint.block.mvp.title",
    summaryKey: "blueprint.block.mvp.summary",
    itemsKey: "blueprint.block.mvp.items",
  },
  {
    eyebrowKey: "blueprint.block.honesty.eyebrow",
    titleKey: "blueprint.block.honesty.title",
    summaryKey: "blueprint.block.honesty.summary",
    itemsKey: "blueprint.block.honesty.items",
  },
] as const;

function parseItems(raw: string): string[] {
  return raw
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function BlueprintSection() {
  const { t } = useTranslation();

  return (
    <section className="space-y-8">
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-synapse-brand-300/80">
          {t("blueprint.eyebrow")}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("blueprint.title")}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-synapse-text-secondary">
          {t("blueprint.subtitle")}
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        {PHASES.map((phase, i) => (
          <motion.div
            key={phase.phaseKey}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-4"
          >
            <div className="text-xs uppercase tracking-widest text-synapse-brand-300/70">
              {t(phase.phaseKey)}
            </div>
            <div className="mt-2 text-sm font-semibold">
              {t(phase.titleKey)}
            </div>
            <p className="mt-2 text-sm leading-6 text-synapse-text-secondary">
              {t(phase.bodyKey)}
            </p>
            <p className="mt-3 text-xs leading-5 text-synapse-text-muted">
              <span className="font-medium text-synapse-text-tertiary">
                Outcome:
              </span>{" "}
              {t(phase.outcomeKey)}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {BLOCKS.map((block, i) => (
          <motion.div
            key={block.titleKey}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-synapse-border-subtle bg-synapse-surface-card p-5"
          >
            <p className="text-xs uppercase tracking-widest text-synapse-brand-300/70">
              {t(block.eyebrowKey)}
            </p>
            <h3 className="mt-2 text-lg font-semibold">{t(block.titleKey)}</h3>
            <p className="mt-2 text-sm leading-6 text-synapse-text-secondary">
              {t(block.summaryKey)}
            </p>
            <ul className="mt-4 space-y-2">
              {parseItems(t(block.itemsKey)).map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-synapse-border-subtle bg-synapse-surface-primary/40 px-3 py-2 text-sm leading-6 text-synapse-text-secondary"
                >
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
