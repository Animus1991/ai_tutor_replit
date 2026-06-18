import { beforeEach, describe, expect, it } from "vitest";
import { useAgentStore } from "./agentStore";
import { useAppStore } from "./appStore";

beforeEach(() => {
  useAppStore.setState({
    language: "en",
    theme: "dark",
    sidebarCollapsed: false,
  });
  useAgentStore.setState({
    mode: "socratic",
    strictSourceMode: true,
    streamingMessageId: null,
  });
});

describe("useAppStore", () => {
  it("has sensible defaults", () => {
    expect(useAppStore.getState().language).toBe("en");
    expect(useAppStore.getState().theme).toBe("dark");
    expect(useAppStore.getState().sidebarCollapsed).toBe(false);
  });

  it("setLanguage updates language", () => {
    useAppStore.getState().setLanguage("el");
    expect(useAppStore.getState().language).toBe("el");
  });

  it("toggleSidebar flips boolean", () => {
    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarCollapsed).toBe(true);
    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarCollapsed).toBe(false);
  });
});

describe("useAgentStore", () => {
  it("defaults to socratic mode with strict sources", () => {
    expect(useAgentStore.getState().mode).toBe("socratic");
    expect(useAgentStore.getState().strictSourceMode).toBe(true);
  });

  it("setMode swaps agent mode", () => {
    useAgentStore.getState().setMode("explainer");
    expect(useAgentStore.getState().mode).toBe("explainer");
  });

  it("startStreaming/stopStreaming tracks message id", () => {
    useAgentStore.getState().startStreaming("msg-123");
    expect(useAgentStore.getState().streamingMessageId).toBe("msg-123");
    useAgentStore.getState().stopStreaming();
    expect(useAgentStore.getState().streamingMessageId).toBeNull();
  });
});
