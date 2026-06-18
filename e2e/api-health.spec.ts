import { expect, test } from "@playwright/test";

test.describe("API health", () => {
  test("backend /api/healthz returns 200", async ({ request }) => {
    const response = await request.get("/api/healthz");
    expect(response.status()).toBe(200);
  });
});
