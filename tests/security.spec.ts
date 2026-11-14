import { expect, test } from "@playwright/test";

test.describe("Security, Access Control and Data Privacy Boundaries", () => {
  test("Export endpoint /account/export rejects unauthenticated requests with HTTP 401", async ({ request }) => {
    const response = await request.get("/account/export");
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toMatch(/Authentication required/i);
  });

  test("Admin dashboard /admin denies access without moderator credentials", async ({ page }) => {
    await page.goto("/admin");
    // Verify moderator boundary message is shown and no moderation data is leaked
    await expect(page.locator("text=Moderator sign-in required")).toBeVisible();
    await expect(page.locator("a:has-text('Sign in')")).toBeVisible();
    await expect(page.locator("text=Safety Reports Awaiting Action")).not.toBeVisible();
  });

  test("Admin verifications queue /admin/verifications denies access without moderator credentials", async ({ page }) => {
    await page.goto("/admin/verifications");
    await expect(page.locator("text=Moderator sign-in required")).toBeVisible();
    await expect(page.locator("a:has-text('Sign in')")).toBeVisible();
  });

  test("Private profile route /profile requires sign in", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.locator("text=Sign in to view profiles")).toBeVisible();
  });

  test("Private messages route /messages/[id] requires sign in", async ({ page }) => {
    await page.goto("/messages/10000000-0000-0000-0000-000000000001");
    await expect(page.locator("text=Sign in to view this conversation")).toBeVisible();
  });

  test("Private privacy settings /settings/privacy requires sign in", async ({ page }) => {
    await page.goto("/settings/privacy");
    await expect(page.locator("text=Sign in to manage privacy")).toBeVisible();
  });

  test("Private account controls /settings/account requires sign in", async ({ page }) => {
    await page.goto("/settings/account");
    await expect(page.locator("text=Sign in to manage your account")).toBeVisible();
  });
});
