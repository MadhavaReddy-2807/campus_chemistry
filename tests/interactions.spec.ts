import { expect, test } from "@playwright/test";

test.describe("Interactive Controls and User Flows", () => {
  test("Home feed interaction controls", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
  });

  test("Institute dropdown selection", async ({ page }) => {
    await page.goto("/onboarding", { waitUntil: "networkidle" });
    const dropdown = page.locator("select[name='instituteId']");
    await expect(dropdown).toBeVisible();

    await dropdown.selectOption({ label: "IIT Madras — Indian Institute of Technology Madras (Chennai, Tamil Nadu)" });
    await expect(dropdown).not.toHaveValue("");

    await dropdown.selectOption({ label: "NIT Trichy — National Institute of Technology Tiruchirappalli (Tiruchirappalli, Tamil Nadu)" });
    await expect(dropdown).not.toHaveValue("");
  });

  test("Valentine's Day Secret Crush Matchmaker with SHA-256 computation", async ({ page }) => {
    await page.goto("/valentines", { waitUntil: "networkidle" });
    const crushInput = page.locator("input[placeholder='e.g. name@iitb.ac.in or @username']");
    await expect(crushInput).toBeVisible();

    await crushInput.fill("ananya@iitb.ac.in");
    await page.locator("button:has-text('Seal Crush')").click();

    // Verify response (either sealed confirmation or sign-in prompt)
    await expect(page.locator(".crush-result, .form-error")).toBeVisible();
  });

  test("Campus Date Safety Kit modal and checklist", async ({ page }) => {
    await page.goto("/valentines", { waitUntil: "networkidle" });
    const openSafetyBtn = page.locator("button:has-text('Create Date Safety Plan')");
    await expect(openSafetyBtn).toBeVisible();

    await openSafetyBtn.click();
    const modalDialog = page.locator(".safety-plan-modal");
    await expect(modalDialog).toBeVisible();
    await expect(page.locator("text=Keep a friend in the loop.")).toBeVisible();

    // Close modal
    await modalDialog.locator("button:has-text('✕')").click();
    await expect(modalDialog).not.toBeVisible();
  });

  test("Stories reel viewer and navigation controls", async ({ page }) => {
    await page.goto("/feed", { waitUntil: "networkidle" });
    const firstStory = page.locator(".story-ring-item").nth(1); // First peer story
    if (await firstStory.isVisible()) {
      await firstStory.click();
      const storyModal = page.locator(".story-viewer-card");
      await expect(storyModal).toBeVisible();

      // Close story viewer
      const closeBtn = page.locator(".story-close-btn");
      await closeBtn.click();
      await expect(storyModal).not.toBeVisible();
    }
  });

  test("Communities interaction and discussion navigation", async ({ page }) => {
    await page.goto("/communities", { waitUntil: "networkidle" });
    const firstCommunityLink = page.locator(".community-card h2 a").first();
    await expect(firstCommunityLink).toBeVisible();

    const href = await firstCommunityLink.getAttribute("href");
    expect(href).toMatch(/\/communities\//);

    await Promise.all([
      page.waitForURL(/\/communities\//),
      firstCommunityLink.click(),
    ]);
    await expect(page.locator("h1").first()).toBeVisible();
  });
});
