import type { Response } from "express";

/**
 * Server-Sent Events helper.
 *
 * Standardizes streaming protocol across all AI endpoints. Frontend listens
 * on `EventSource` or fetch streaming and parses `data: {...}\n\n` frames.
 *
 * Frame shapes used:
 *   { type: "chunk", content: string }
 *   { type: "done" }
 *   { type: "error", message: string }
 *   { type: "meta", ... }     - arbitrary metadata before/after stream
 */
export class SSEStream {
  private closed = false;

  constructor(private readonly res: Response) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();
  }

  send(payload: Record<string, unknown>): void {
    if (this.closed) return;
    this.res.write(`data: ${JSON.stringify(payload)}\n\n`);
  }

  chunk(content: string): void {
    this.send({ type: "chunk", content });
  }

  meta(data: Record<string, unknown>): void {
    this.send({ type: "meta", ...data });
  }

  error(message: string, details?: unknown): void {
    if (this.closed) return;
    this.send({ type: "error", message, details });
    this.send({ type: "done" });
    this.closed = true;
    this.res.end();
  }

  close(): void {
    if (this.closed) return;
    this.send({ type: "done" });
    this.closed = true;
    this.res.end();
  }

  /** Backwards-compat helper for clients still expecting raw {content,done}. */
  legacyChunk(content: string): void {
    if (this.closed) return;
    this.res.write(`data: ${JSON.stringify({ content })}\n\n`);
  }

  legacyDone(): void {
    if (this.closed) return;
    this.closed = true;
    this.res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    this.res.end();
  }

  legacyError(message: string): void {
    if (this.closed) return;
    this.closed = true;
    this.res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    this.res.end();
  }
}
