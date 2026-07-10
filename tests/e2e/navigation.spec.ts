import { expect, test } from "@playwright/test";

test("navigates the Phase 1 shell", async ({ page }) => {
  await page.goto("/roster");
  await expect(page.getByRole("heading", { name: "Choose your next formation." })).toBeVisible();
  await page.getByRole("link", { name: /Build squad/ }).click();
  await expect(page).toHaveURL(/\/squad$/);
  await expect(page.getByRole("heading", { name: "Build a balanced squad." })).toBeVisible();
  await page.getByRole("link", { name: /Choose mission/ }).click();
  await expect(page).toHaveURL(/\/campaign$/);
});

test("supports direct-link refresh and phone width", async ({ page }, testInfo) => {
  const routes = [
    "roster",
    "squad",
    "campaign",
    "battle",
    "results",
    "upgrades",
    "summon",
    "content-lab",
  ];
  for (const route of routes) {
    await page.goto(`/${route}`);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
      `${route} should not overflow horizontally`,
    ).toBe(true);
  }

  await page.goto("/campaign");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Follow the moonlit trail." })).toBeVisible();
  const viewport = page.viewportSize();
  if (testInfo.project.name.includes("mobile")) {
    expect(viewport?.width).toBeLessThan(620);
    await expect(page.getByRole("navigation", { name: "Primary mobile navigation" })).toBeVisible();
  }
});
