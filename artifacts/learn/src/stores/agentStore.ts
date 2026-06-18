import { create } from "zustand";

export type AgentMode =
  | "socratic"
  | "explainer"
  | "examiner"
  | "coach"
  | "summarizer"
  | "debugger"
  | "code-reviewer"
  | "translator"
  | "researcher"
  | "interviewer";

interface AgentState {
  mode: AgentMode;
  strictSourceMode: boolean;
  streamingMessageId: string | null;
  setMode: (mode: AgentMode) => void;
  setStrictSourceMode: (strict: boolean) => void;
  startStreaming: (id: string) => void;
  stopStreaming: () => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  mode: "socratic",
  strictSourceMode: true,
  streamingMessageId: null,
  setMode: (mode) => set({ mode }),
  setStrictSourceMode: (strict) => set({ strictSourceMode: strict }),
  startStreaming: (id) => set({ streamingMessageId: id }),
  stopStreaming: () => set({ streamingMessageId: null }),
}));
