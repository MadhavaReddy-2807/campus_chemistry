import { expect, test } from "@playwright/test";

test.describe("Persistent Application Shell Navigation & Layout Continuity", () => {
  test("Desktop navigation sequence preserves sidebar and avoids full-page reloads", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile-chrome", "Desktop viewport target.");

    await page.goto("/", { waitUntil: "networkidle" });

    // 1. Initial shell attachment on Home
    const sidebar = page.locator("aside.sidebar");
    await expect(sidebar).toBeVisible();

    // Mark window to detect hard reloads
    await page.evaluate(() => {
      // @ts-expect-error test flag
      window.__persistent_shell_mounted__ = 999;
    });

    const checkNoReload = async () => {
      const persisted = await page.evaluate(() => {
        // @ts-expect-error test flag
        return window.__persistent_shell_mounted__;
      });
      expect(persisted).toBe(999);
    };

    // 2. Navigate: Home -> Explore
    await page.locator("aside.sidebar a[href='/explore']").click();
    await expect(page).toHaveURL(/\/explore/);
    await expect(sidebar).toBeVisible();
    await checkNoReload();

    // 3. Navigate: Explore -> Profile
    await page.locator("aside.sidebar a[href='/profile']").click();
    await expect(page).toHaveURL(/\/profile/);
    await expect(sidebar).toBeVisible();
    await checkNoReload();

    // 4. Navigate: Profile -> Home
    await page.locator("aside.sidebar a.nav-item[href='/']").click();
    await expect(page).toHaveURL(/^https?:\/\/[^/]+\/?$/);
    await expect(sidebar).toBeVisible();
    await checkNoReload();

    // 5. Navigate: Home -> Messages
    await page.locator("aside.sidebar a[href='/messages']").click();
    await expect(page).toHaveURL(/\/messages/);
    await expect(sidebar).toBeVisible();
    await checkNoReload();

    // 6. Navigate: Messages -> Notifications
    await page.locator("aside.sidebar a[href='/notifications']").click();
    await expect(page).toHaveURL(/\/notifications/);
    await expect(sidebar).toBeVisible();
    await checkNoReload();

    // 7. Navigate: Notifications -> Events (/meetups)
    await page.locator("aside.sidebar a[href='/meetups']").click();
    await expect(page).toHaveURL(/\/meetups/);
    await expect(sidebar).toBeVisible();
    await checkNoReload();

    // 8. Navigate: Events -> Communities
    await page.locator("aside.sidebar a[href='/communities']").click();
    await expect(page).toHaveURL(/\/communities/);
    await expect(sidebar).toBeVisible();
    await checkNoReload();

    // 9. Navigate: Communities -> Settings
    await page.locator("aside.sidebar a[href='/settings']").click();
    await expect(page).toHaveURL(/\/settings/);
    await expect(sidebar).toBeVisible();
    await checkNoReload();

    // 10. Return to Home
    await page.locator("aside.sidebar a.nav-item[href='/']").click();
    await expect(page).toHaveURL(/^https?:\/\/[^/]+\/?$/);
    await expect(sidebar).toBeVisible();
    await checkNoReload();
  });

  test("Mobile navigation sequence preserves bottom navigation bar and avoids full-page reloads", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chrome", "Target mobile viewport project.");

    await page.goto("/", { waitUntil: "networkidle" });
    const mobileNav = page.locator("nav.mobile-nav");
    await expect(mobileNav).toBeVisible();

    await page.evaluate(() => {
      // @ts-expect-error test flag
      window.__mobile_shell_mounted__ = 888;
    });

    const checkNoReload = async () => {
      const persisted = await page.evaluate(() => {
        // @ts-expect-error test flag
        return window.__mobile_shell_mounted__;
      });
      expect(persisted).toBe(888);
    };

    // Mobile nav sequence: Home -> Explore -> Messages -> Profile -> Home
    await page.locator("nav.mobile-nav a[href='/explore']").click();
    await expect(page).toHaveURL(/\/explore/);
    await expect(mobileNav).toBeVisible();
    await checkNoReload();

    await page.locator("nav.mobile-nav a[href='/messages']").click();
    await expect(page).toHaveURL(/\/messages/);
    await expect(mobileNav).toBeVisible();
    await checkNoReload();

    await page.locator("nav.mobile-nav a[href='/profile']").click();
    await expect(page).toHaveURL(/\/profile/);
    await expect(mobileNav).toBeVisible();
    await checkNoReload();

    await page.locator("nav.mobile-nav a[href='/']").click();
    await expect(page).toHaveURL(/^https?:\/\/[^/]+\/?$/);
    await expect(mobileNav).toBeVisible();
    await checkNoReload();
  });
});
