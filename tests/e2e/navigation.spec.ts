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
    "combat-lab",
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

test("replays a seeded combat simulation in the Combat Forge", async ({ page }) => {
  await page.goto("/combat-lab");
  await expect(page.getByRole("heading", { name: "The Combat Forge" })).toBeVisible();
  await expect(page.getByText("battle:encounter.bamboo-pass:moonfall-phase-3")).toBeVisible();
  const firstLog = await page.getByRole("list", { name: "Battle event log" }).textContent();

  await page.getByLabel("Battle seed").fill("browser-replay-seed");
  await page.getByRole("button", { name: "Run seeded battle" }).click();
  await expect(page.getByText("battle:encounter.bamboo-pass:browser-replay-seed")).toBeVisible();
  const seededLog = await page.getByRole("list", { name: "Battle event log" }).textContent();
  expect(seededLog).not.toBe(firstLog);

  await page.getByRole("button", { name: "Run seeded battle" }).click();
  await expect(page.getByRole("list", { name: "Battle event log" })).toHaveText(seededLog ?? "");
});

test("controls and completes the Phase 4 battle presentation", async ({ page }) => {
  await page.goto("/battle");
  await expect(page.getByRole("heading", { name: "Bamboo Pass" })).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Animated four versus four battlefield" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.getByText("Battle paused")).toBeVisible();
  await expect(page.getByRole("button", { name: "Normal battle speed" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: "2× battle speed" }).click();
  await expect(page.getByRole("button", { name: "2× battle speed" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: "Skip" }).click();
  await expect(page.getByRole("status", { name: "Battle result" })).toBeVisible();
  await expect(page.getByText("Encounter resolved")).toBeVisible();

  await page.getByRole("button", { name: "Replay battle" }).click();
  await expect(page.getByRole("button", { name: "Skip" })).toBeVisible();
});

test("honors reduced-motion battle playback", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/battle");
  await expect(page.getByText("Reduced motion")).toBeVisible();
  await expect(page.getByRole("status", { name: "Battle result" })).toBeVisible({
    timeout: 15_000,
  });
});
