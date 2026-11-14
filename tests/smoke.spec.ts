import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("public and onboarding routes", () => {
  for (const route of ["/", "/login", "/signup", "/onboarding", "/onboarding/verify", "/safety", "/feed", "/explore", "/profile", "/matches", "/notifications", "/meetups", "/meetups/create", "/admin/verifications", "/settings/account", "/settings/notifications", "/valentines"]) {
    test(`${route} renders successfully`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator("body")).toBeVisible();
    });
  }

  test("home is usable on mobile", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chrome", "This assertion targets the mobile composition.");
    await page.goto("/");
    await expect(page.locator(".mobile-nav")).toBeVisible();
    await expect(page.locator(".mobile-nav a[href='/create']")).toBeVisible();
  });

  test("home has no detected axe violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
