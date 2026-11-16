import { expect, test } from "@playwright/test";

const ALL_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/onboarding",
  "/onboarding/verify",
  "/feed",
  "/create",
  "/explore",
  "/profile",
  "/edit-profile",
  "/discover",
  "/matches",
  "/messages",
  "/messages/10000000-0000-0000-0000-000000000001",
  "/meetups",
  "/meetups/create",
  "/meetups/10000000-0000-0000-0002-000000000001",
  "/communities",
  "/communities/create",
  "/communities/10000000-0000-0000-0003-000000000001",
  "/notifications",
  "/support",
  "/safety",
  "/safety/report",
  "/settings",
  "/settings/account",
  "/settings/privacy",
  "/settings/notifications",
  "/valentines",
  "/admin",
  "/admin/verifications",
];

test.describe("Full Application Route Inventory Verification", () => {
  for (const route of ALL_ROUTES) {
    test(`Route ${route} renders with HTTP 200 and without runtime exceptions`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBe(200);
      await expect(page.locator("body")).toBeVisible();
      expect(consoleErrors).toEqual([]);
    });
  }
});
