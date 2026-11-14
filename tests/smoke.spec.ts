import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("public and onboarding routes", () => {
  for (const route of [
    "/",
    "/login",
    "/signup",
    "/onboarding",
    "/onboarding/verify",
    "/safety",
    "/feed",
    "/explore",
    "/profile",
    "/matches",
    "/notifications",
    "/meetups",
    "/meetups/create",
    "/communities",
    "/communities/create",
    "/admin",
    "/admin/verifications",
    "/settings/account",
    "/settings/notifications",
    "/valentines",
  ]) {
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

  test("onboarding displays official 54-institute directory", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.locator("text=Indian Institute of Technology Bombay")).toBeVisible();
    await expect(page.locator("text=National Institute of Technology Tiruchirappalli")).toBeVisible();
  });

  test("communities directory renders club cards and discussions", async ({ page }) => {
    await page.goto("/communities");
    await expect(page.locator("text=IIT/NIT Hackers & Builders")).toBeVisible();
    await expect(page.locator("text=Indie Acoustic & Jamming Room")).toBeVisible();
  });

  test("valentines page renders secret crush matchmaking tool", async ({ page }) => {
    await page.goto("/valentines");
    await expect(page.locator("text=Secret Crush Matchmaker")).toBeVisible();
    await expect(page.locator("text=Campus Date Safety Kit")).toBeVisible();
  });

  test("home has no detected axe violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
