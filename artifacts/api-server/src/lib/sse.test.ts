import type { Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { SSEStream } from "./sse";

function mockResponse() {
  const writes: string[] = [];
  const headers: Record<string, string> = {};
  const res = {
    setHeader: vi.fn((k: string, v: string) => {
      headers[k] = v;
    }),
    flushHeaders: vi.fn(),
    write: vi.fn((data: string) => {
      writes.push(data);
      return true;
    }),
    end: vi.fn(),
  } as unknown as Response;
  return { res, writes, headers };
}

describe("SSEStream", () => {
  it("sets streaming headers on construction", () => {
    const { res, headers } = mockResponse();
    new SSEStream(res);
    expect(headers["Content-Type"]).toBe("text/event-stream");
    expect(headers["Cache-Control"]).toContain("no-cache");
    expect(headers.Connection).toBe("keep-alive");
    expect(headers["X-Accel-Buffering"]).toBe("no");
  });

  it("formats chunk events as JSON in SSE frames", () => {
    const { res, writes } = mockResponse();
    const sse = new SSEStream(res);
    sse.chunk("hello");
    expect(writes).toContain(`data: {"type":"chunk","content":"hello"}\n\n`);
  });

  it("emits done event on close", () => {
    const { res, writes } = mockResponse();
    const sse = new SSEStream(res);
    sse.close();
    expect(writes.some((w) => w.includes(`"type":"done"`))).toBe(true);
  });

  it("emits error frame and ends stream", () => {
    const { res, writes } = mockResponse();
    const sse = new SSEStream(res);
    sse.error("boom");
    expect(writes.some((w) => w.includes(`"type":"error"`))).toBe(true);
    expect((res.end as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1);
  });

  it("is idempotent once closed", () => {
    const { res, writes } = mockResponse();
    const sse = new SSEStream(res);
    sse.close();
    const writesBefore = writes.length;
    sse.chunk("ignored");
    sse.close();
    expect(writes.length).toBe(writesBefore);
  });

  it("legacy helpers produce wouter/replit-compatible frames", () => {
    const { res, writes } = mockResponse();
    const sse = new SSEStream(res);
    sse.legacyChunk("hi");
    sse.legacyDone();
    expect(writes[0]).toBe(`data: {"content":"hi"}\n\n`);
    expect(writes[1]).toBe(`data: {"done":true}\n\n`);
  });
});
