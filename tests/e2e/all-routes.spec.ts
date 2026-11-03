import { expect, test } from "@playwright/test";
import { games } from "../../src/data/games";

const readyGameCount = games.filter((game) => game.status === "Ready").length;
const seededProgressLabel = `${games.filter((game) => game.status === "Ready" && ["binary", "bubble", "logic"].includes(game.id)).length}/${readyGameCount} completed`;

for (const game of games) {
  test(`${game.title} has a directly loadable, refresh-safe URL`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    const response = await page.goto(`/games/${game.slug}`);
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { level: 1, name: game.title, exact: true }),
    ).toBeVisible();
    await expect(page).toHaveTitle(`${game.title} | Mr. Mata Learning Hub`);
    await page.reload();
    await expect(
      page.getByRole("heading", { level: 1, name: game.title, exact: true }),
    ).toBeVisible();
    if (game.status === "Ready") {
      await expect(page.locator(".glossary-panel")).toBeVisible();
      await page.locator(".glossary-panel summary").click();
      await expect(page.locator(".glossary-panel dl")).toBeVisible();
    } else {
      await expect(
        page.getByText(/Truth tables and circuits are coming soon/),
      ).toBeVisible();
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("real links support navigation, browser history, active state, and mobile menu", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Launch Bubble Sort Lab" }).click();
  await expect(page).toHaveURL("/games/bubble-sort");
  await expect(
    page.getByRole("heading", { name: "Bubble Sort Lab", exact: true }),
  ).toBeVisible();
  if (isMobile)
    await page.getByRole("button", { name: "Toggle games menu" }).click();
  await expect(
    page.getByRole("navigation").getByRole("link", { name: /Bubble Sort Lab/ }),
  ).toHaveAttribute("aria-current", "page");
  await page.getByRole("link", { name: /Search Sprint/ }).click();
  await expect(page).toHaveURL("/games/search-sprint");
  if (isMobile) await expect(page.getByRole("navigation")).toBeHidden();
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Bubble Sort Lab", exact: true }),
  ).toBeVisible();
  await page.goForward();
  await expect(
    page.getByRole("heading", { name: "Search Sprint", exact: true }),
  ).toBeVisible();
});

test("an active category can be collapsed with one click", async ({
  page,
  isMobile,
}) => {
  await page.goto("/games/bubble-sort");
  await expect(
    page.getByRole("heading", { name: "Bubble Sort Lab", exact: true }),
  ).toBeVisible();
  if (isMobile)
    await page.getByRole("button", { name: "Toggle games menu" }).click();
  const category = page.getByRole("button", {
    name: /Algorithms Sorting and searching/,
  });
  await expect(category).toHaveAttribute("aria-expanded", "true");
  await category.click();
  await expect(category).toHaveAttribute("aria-expanded", "false");
});

test("saved progress survives navigation and refresh and ignores unknown IDs", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "mata-hub:completed-games",
      JSON.stringify(["binary", "bubble", "unknown", "logic"]),
    ),
  );
  await page.goto("/");
  await expect(page.getByText(seededProgressLabel)).toBeVisible();
  await page.getByRole("link", { name: "Launch Binary Builder" }).click();
  await expect(
    page.getByRole("heading", { name: "Binary Builder", exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.goto("/");
  await expect(page.getByText(seededProgressLabel)).toBeVisible();
});

test("malformed progress does not break the hub", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("mata-hub:completed-games", "{invalid-json"),
  );
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Launch Binary Builder" }),
  ).toBeVisible();
  await expect(page.getByText(/completed$/)).toHaveCount(0);
});

test("storage-disabled browsers can still open games", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Storage disabled", "SecurityError");
      },
    });
  });
  await page.goto("/games/binary-builder");
  await expect(
    page.getByRole("heading", { name: "Binary Builder", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("unknown game URLs return a useful 404", async ({ page }) => {
  const response = await page.goto("/games/not-a-real-game");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Game not found" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to the hub" }).click();
  await expect(page).toHaveURL("/");
});
