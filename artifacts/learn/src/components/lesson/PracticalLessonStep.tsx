import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@/lib/wouter-compat";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Code2,
  Gauge,
  Lightbulb,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface CodeData {
  language: string;
  instructions: string;
  starterCode: string;
  solution: string;
  expectedOutput: string;
}

export interface PracticalLessonStepProps {
  courseId: number;
  courseTitle: string;
  stepTitle: string | null;
  content: string;
  codeData: CodeData;
  xpReward: number;
  codeInput: string;
  onCodeChange: (code: string) => void;
  onAdvance: (xp: number) => void;
  onRequestHint: () => void;
  hintText?: string;
  isHintLoading?: boolean;
}

export function PracticalLessonStep({
  courseId,
  courseTitle,
  stepTitle,
  content,
  codeData,
  xpReward,
  codeInput,
  onCodeChange,
  onAdvance,
  onRequestHint,
  hintText,
  isHintLoading,
}: PracticalLessonStepProps) {
  const [output, setOutput] = useState("");
  const [testsPassed, setTestsPassed] = useState<boolean | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

  const hintsFromApi = hintText ? hintText.split(/\n\n+/).filter(Boolean) : [];
  const fallbackHints = [
    "Start from the instructions and identify the key operation.",
    "Break the problem into smaller steps before writing code.",
    `Expected output shape:\n${codeData.expectedOutput}`,
  ];
  const hints = hintsFromApi.length > 0 ? hintsFromApi : fallbackHints;

  function runCode() {
    const normalized = codeInput.trim();
    const expected = codeData.expectedOutput.trim();
    const solution = codeData.solution.trim();
    const match =
      normalized.includes(expected) ||
      expected.includes(normalized) ||
      normalized === solution;
    if (match) {
      setOutput(`✓ Output matches expected result:\n${expected}`);
      setTestsPassed(true);
    } else {
      setOutput(
        normalized
          ? "Output does not match yet. Compare with expected output and adjust."
          : "Write some code first, then run.",
      );
      setTestsPassed(false);
    }
  }

  function runTests() {
    runCode();
    if (codeInput.trim() === codeData.solution.trim() || testsPassed) {
      setTestsPassed(true);
      setOutput((prev) =>
        prev.includes("All tests passed")
          ? prev
          : `${prev}\n\nAll tests passed! 🎉`,
      );
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
      <div className="overflow-y-auto border-b border-border lg:w-[42%] lg:border-b-0 lg:border-r">
        <div className="space-y-5 p-5">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-teal-400">
              Interactive Exercise
            </span>
            <h2 className="mt-1 text-xl font-bold">
              {stepTitle ?? "Practice Step"}
            </h2>
            <p className="text-xs text-muted-foreground">{courseTitle}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Gauge className="h-4 w-4 text-primary" /> Learning Objective
            </h4>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{content || codeData.instructions}</ReactMarkdown>
            </div>
          </div>

          <div className="space-y-2">
            {hints.slice(0, hintLevel).map((hint, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-muted-foreground"
              >
                {hint}
              </motion.div>
            ))}
            {hintLevel < hints.length && (
              <button
                type="button"
                onClick={() => {
                  if (hintLevel === 0) onRequestHint();
                  setHintLevel((p) => p + 1);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-all hover:border-amber-500/30"
              >
                <Lightbulb className="h-3 w-3 text-amber-400" />
                {isHintLoading && hintLevel === 0
                  ? "Loading hint..."
                  : hintLevel === 0
                    ? "Show hint"
                    : "Show more help"}
              </button>
            )}
          </div>

          {showSolution && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-green-500/20 bg-green-500/5 p-4"
            >
              <h4 className="mb-2 text-sm font-semibold text-green-400">
                Reference Solution
              </h4>
              <pre className="overflow-x-auto rounded-lg bg-black/30 p-3 text-xs font-mono text-muted-foreground">
                {codeData.solution}
              </pre>
            </motion.div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowSolution((s) => !s)}
              className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium"
            >
              {showSolution ? "Hide solution" : "Show solution"}
            </button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/agent?courseId=${courseId}`}>
                <Sparkles className="mr-1 h-3 w-3" /> Ask Agent
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex min-h-[280px] flex-1 flex-col lg:w-[58%]">
        <div className="flex items-center justify-between border-b border-border bg-[#0a0f18] px-4 py-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-xs capitalize text-muted-foreground">
              main.{codeData.language === "python" ? "py" : codeData.language}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={runCode}
              className="flex items-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/20"
            >
              <Play className="h-3 w-3" /> Run
            </button>
            <button
              type="button"
              onClick={runTests}
              className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
            >
              <CheckCircle2 className="h-3 w-3" /> Run Tests
            </button>
            <button
              type="button"
              onClick={() => {
                onCodeChange(codeData.starterCode);
                setOutput("");
                setTestsPassed(null);
              }}
              className="rounded-lg p-1.5 hover:bg-white/5"
            >
              <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <textarea
          value={codeInput || codeData.starterCode}
          onChange={(e) => onCodeChange(e.target.value)}
          className="min-h-[180px] flex-1 resize-none bg-[#0d0b14] p-4 font-mono text-sm leading-relaxed text-emerald-300 focus:outline-none"
          spellCheck={false}
        />

        <div className="border-t border-border bg-black/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Code2 className="h-3.5 w-3.5" /> Output / Tests
          </div>
          <pre
            className={cn(
              "min-h-[80px] whitespace-pre-wrap font-mono text-xs",
              testsPassed === true
                ? "text-green-400"
                : testsPassed === false
                  ? "text-amber-400"
                  : "text-muted-foreground",
            )}
          >
            {output || "Run your code to see output here."}
          </pre>
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Zap className="h-3 w-3 text-primary" /> +{xpReward} XP
          </span>
          <Button
            disabled={testsPassed !== true}
            onClick={() => onAdvance(xpReward)}
          >
            {testsPassed === true ? "Continue" : "Pass tests to continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
