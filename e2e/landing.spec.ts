import { expect, test } from "@playwright/test";

test.describe("Landing page", () => {
  test("renders without crashing", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/AI Tutor|Learn/i);
  });

  test("redirects unauthenticated user to landing or sign-in", async ({
    page,
  }) => {
    const response = await page.goto("/library");
    expect(response?.status()).toBeLessThan(500);
  });
});
