import type { Response } from "express";
import { describe, expect, it, vi } from "vitest";
import type { AuthRequest } from "../types";
import { bypassStrategy } from "./bypass";

function fakeReqRes() {
  const req = {} as AuthRequest;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
  return { req, res };
}

describe("bypassStrategy", () => {
  it("declares the bypass kind", () => {
    expect(bypassStrategy.kind).toBe("bypass");
  });

  it("sets userId to dev mock without calling next() multiple times", () => {
    const { req, res } = fakeReqRes();
    const next = vi.fn();
    bypassStrategy.requireAuth(req, res, next);
    expect(req.userId).toBe("dev-user-local");
    expect(req.authProvider).toBe("bypass");
    expect(next).toHaveBeenCalledTimes(1);
    expect((res.status as ReturnType<typeof vi.fn>).mock.calls.length).toBe(0);
  });
});
