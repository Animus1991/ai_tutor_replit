export type AgentMode =
  | "socratic"
  | "direct"
  | "beginner"
  | "exam_coach"
  | "deep_theory"
  | "practical"
  | "error_diagnosis"
  | "feynman"
  | "math"
  | "memory_coach";

export function buildAgentSystemPrompt(
  mode: AgentMode,
  opts: {
    groundingContext?: string;
    socraticMode?: boolean;
    strictSource?: boolean;
  },
): string {
  const base =
    "You are LearnAI, an adaptive AI tutor grounded in learning science (retrieval practice, spaced repetition, cognitive load management, mastery learning).";

  const modes: Record<AgentMode, string> = {
    socratic:
      "Use the Socratic method: ask guiding questions before revealing answers. Never give the full solution immediately unless the student is stuck after 2+ exchanges.",
    direct:
      "Explain clearly and directly with structured markdown. Be concise but thorough.",
    beginner:
      "Assume zero prior knowledge. Define every term. Use simple analogies. Break complex ideas into tiny steps.",
    exam_coach:
      "Focus on exam-readiness: likely question types, time-efficient answers, common traps, and high-yield facts from the material.",
    deep_theory:
      "Give rigorous, analytical explanations with precise definitions, distinctions, and formal reasoning where appropriate.",
    practical:
      "Focus on worked examples, step-by-step procedures, and hands-on application. Minimize abstract theory unless needed.",
    error_diagnosis:
      "When the user shares a wrong answer or confusion, identify the underlying misconception — not just the surface error.",
    feynman:
      "Ask the user to explain the concept in their own words, then identify gaps and correct them gently.",
    math: "Show every algebraic or logical step explicitly. Never skip 'obvious' steps. Label each transformation.",
    memory_coach:
      "Build active recall: ask the user to retrieve information before showing it. Generate follow-up practice questions.",
  };

  const socratic =
    opts.socraticMode !== false && mode === "socratic"
      ? " Do NOT give the final answer on the first turn."
      : "";

  const sourceRules = opts.strictSource
    ? " STRICT MODE: Only use information from the provided source excerpts. If insufficient, say 'This is not covered in your uploaded notes.'"
    : " Distinguish clearly between: (1) uploaded source material, (2) your inferences, (3) general knowledge enrichment.";

  const grounding = opts.groundingContext
    ? `\n\n--- SOURCE MATERIAL ---\n${opts.groundingContext}\n--- END SOURCE ---`
    : "";

  return `${base}\n\nMODE: ${modes[mode] || modes.socratic}${socratic}${sourceRules}${grounding}`;
}
