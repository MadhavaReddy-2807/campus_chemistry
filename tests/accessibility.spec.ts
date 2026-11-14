import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const KEY_PAGES = [
  "/",
  "/login",
  "/signup",
  "/onboarding",
  "/feed",
  "/explore",
  "/meetups",
  "/communities",
  "/valentines",
  "/safety",
  "/settings",
];

test.describe("Automated WCAG 2.2 AA Accessibility Audits", () => {
  for (const pagePath of KEY_PAGES) {
    test(`Route ${pagePath} passes Axe accessibility audit with 0 violations`, async ({ page }) => {
      await page.goto(pagePath, { waitUntil: "domcontentloaded" });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      // Assert zero accessibility violations
      expect(results.violations).toEqual([]);
    });
  }
});
