/**
 * SideBySideCompare — topic picker + bilingual compare tables (Sprint 2).
 */

import { useTranslation } from "@/lib/i18n";
import { getCompareTopics } from "@/lib/i18n-sprint2";
import { cn } from "@/lib/utils";
import { SplitSquareHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

export interface CompareColumn {
  title: string;
  color: string;
  bg: string;
  border: string;
}

export interface CompareRow {
  label: string;
  left: string;
  right: string;
}

export interface CompareTopic {
  title: string;
  left: CompareColumn;
  right: CompareColumn;
  rows: CompareRow[];
}

const TOPIC_IDS = ["cournotBertrand", "anchorFrame"] as const;
type TopicId = (typeof TOPIC_IDS)[number];

interface SideBySideCompareProps {
  comparison?: CompareTopic;
}

export function SideBySideCompare({ comparison }: SideBySideCompareProps) {
  const { t, language } = useTranslation();
  const topics = useMemo(() => getCompareTopics(t), [t, language]);
  const [topicId, setTopicId] = useState<TopicId>("cournotBertrand");

  const active = comparison ?? topics[topicId];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#5a5280] bg-card">
      <div className="flex shrink-0 flex-col gap-2 border-b border-[#5a5280] bg-white/[0.03] px-4 py-3">
        <div className="flex items-center gap-2">
          <SplitSquareHorizontal className="h-4 w-4 text-synapse-brand-400" />
          <span className="text-sm font-semibold">{active.title}</span>
        </div>
        {!comparison && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#b8b3d4]">
              {t("workspace.compare.pickTopic")}:
            </span>
            {TOPIC_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setTopicId(id)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  topicId === id
                    ? "bg-synapse-brand-600/30 text-synapse-brand-200"
                    : "bg-white/[0.05] text-[#b8b3d4] hover:text-foreground",
                )}
              >
                {topics[id].title}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex gap-4">
          <div
            className={cn(
              "flex-1 rounded-xl border p-4",
              active.left.bg,
              active.left.border,
            )}
          >
            <h3
              className="mb-4 text-center text-lg font-bold"
              style={{ color: active.left.color }}
            >
              {active.left.title}
            </h3>
            {active.rows.map((r) => (
              <div key={r.label} className="mb-4 last:mb-0">
                <p className="mb-1 text-xs font-bold uppercase text-[#b8b3d4]">
                  {r.label}
                </p>
                <p className="text-sm leading-relaxed text-[#ddd9ee]">
                  {r.left}
                </p>
              </div>
            ))}
          </div>
          <div
            className={cn(
              "flex-1 rounded-xl border p-4",
              active.right.bg,
              active.right.border,
            )}
          >
            <h3
              className="mb-4 text-center text-lg font-bold"
              style={{ color: active.right.color }}
            >
              {active.right.title}
            </h3>
            {active.rows.map((r) => (
              <div key={r.label} className="mb-4 last:mb-0">
                <p className="mb-1 text-xs font-bold uppercase text-[#b8b3d4]">
                  {r.label}
                </p>
                <p className="text-sm leading-relaxed text-[#ddd9ee]">
                  {r.right}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
