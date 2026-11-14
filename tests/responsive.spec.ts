import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { name: "Small mobile", width: 320, height: 568 },
  { name: "Standard mobile", width: 375, height: 667 },
  { name: "Modern mobile", width: 390, height: 844 },
  { name: "Large mobile", width: 430, height: 932 },
  { name: "Tablet", width: 768, height: 1024 },
  { name: "Small laptop", width: 1024, height: 768 },
  { name: "Desktop", width: 1280, height: 800 },
  { name: "Large desktop", width: 1440, height: 900 },
  { name: "Wide desktop", width: 1920, height: 1080 },
];

test.describe("Responsive Layout Integrity across 9 Standard Viewports", () => {
  for (const vp of VIEWPORTS) {
    test(`Home layout renders correctly at ${vp.name} (${vp.width}x${vp.height}) with zero horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");

      // Verify no horizontal overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth - window.innerWidth;
      });
      expect(overflow).toBeLessThanOrEqual(1); // Allow 1px sub-pixel rounding tolerance

      if (vp.width <= 767) {
        // Mobile layout expectations
        await expect(page.locator(".mobile-nav")).toBeVisible();
        await expect(page.locator(".sidebar")).not.toBeVisible();
      } else if (vp.width >= 1024) {
        // Desktop layout expectations
        await expect(page.locator(".sidebar")).toBeVisible();
        await expect(page.locator(".mobile-nav")).not.toBeVisible();
      }
    });

    test(`Onboarding layout adapts cleanly at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/onboarding");

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth - window.innerWidth;
      });
      expect(overflow).toBeLessThanOrEqual(1);
    });

    test(`Communities layout adapts cleanly at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/communities");

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth - window.innerWidth;
      });
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
});
