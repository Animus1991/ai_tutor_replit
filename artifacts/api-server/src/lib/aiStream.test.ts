import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type ChatMessage, __testing, complete, streamChat } from "./aiStream";

const messages: ChatMessage[] = [
  { role: "system", content: "You are a tutor." },
  { role: "user", content: "What is recursion?" },
];

describe("aiStream mock mode", () => {
  let original: string | undefined;

  beforeEach(() => {
    original = process.env.AI_MOCK_RESPONSES;
    process.env.AI_MOCK_RESPONSES = "true";
    process.env.AI_INTEGRATIONS_OPENAI_API_KEY = undefined;
  });

  afterEach(() => {
    if (original === undefined) {
      process.env.AI_MOCK_RESPONSES = undefined;
    } else {
      process.env.AI_MOCK_RESPONSES = original;
    }
  });

  it("shouldMock returns true when flag is set", () => {
    expect(__testing.shouldMock()).toBe(true);
  });

  it("lastUserMessage extracts most recent user content", () => {
    expect(__testing.lastUserMessage(messages)).toBe("What is recursion?");
    expect(__testing.lastUserMessage([])).toBe("");
  });

  it("buildMockReply includes user question and disclaimer", () => {
    const reply = __testing.buildMockReply(messages);
    expect(reply).toContain("Mock AI response");
    expect(reply).toContain("What is recursion?");
  });

  it("streamChat yields words without calling OpenAI", async () => {
    const chunks: string[] = [];
    for await (const token of streamChat(messages)) {
      chunks.push(token);
    }
    const joined = chunks.join("");
    expect(joined).toContain("Mock AI response");
    expect(chunks.length).toBeGreaterThan(5);
  });

  it("complete returns the mock reply in mock mode", async () => {
    const reply = await complete(messages);
    expect(reply).toContain("Mock AI response");
  });
});

describe("aiStream live-mode detection", () => {
  let original: string | undefined;
  let originalKey: string | undefined;

  beforeEach(() => {
    original = process.env.AI_MOCK_RESPONSES;
    originalKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  });

  afterEach(() => {
    if (original === undefined) {
      process.env.AI_MOCK_RESPONSES = undefined;
    } else {
      process.env.AI_MOCK_RESPONSES = original;
    }
    if (originalKey === undefined) {
      process.env.AI_INTEGRATIONS_OPENAI_API_KEY = undefined;
    } else {
      process.env.AI_INTEGRATIONS_OPENAI_API_KEY = originalKey;
    }
  });

  it("mocks when API key is missing", () => {
    process.env.AI_MOCK_RESPONSES = undefined;
    process.env.AI_INTEGRATIONS_OPENAI_API_KEY = undefined;
    expect(__testing.shouldMock()).toBe(true);
  });

  it("mocks when API key is placeholder", () => {
    process.env.AI_MOCK_RESPONSES = undefined;
    process.env.AI_INTEGRATIONS_OPENAI_API_KEY = "sk-REPLACE_ME";
    expect(__testing.shouldMock()).toBe(true);
  });

  it("uses live mode with real key and flag off", () => {
    process.env.AI_MOCK_RESPONSES = "false";
    process.env.AI_INTEGRATIONS_OPENAI_API_KEY = "sk-real-looking-key-xxx";
    expect(__testing.shouldMock()).toBe(false);
  });
});
