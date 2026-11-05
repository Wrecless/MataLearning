import { expect, test } from "@playwright/test";
import { games } from "../../src/data/games";

const readyGames = games.filter((game) => game.status === "Ready");

test("library filters cannot lose interactions before hydration", async ({
  page,
}) => {
  await page.route(/\/_next\/static\/.*\.js(?:\?.*)?$/, (route) =>
    route.abort(),
  );
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("searchbox", { name: "Find a game" }),
  ).toBeDisabled();
  await expect(page.getByLabel("Topic", { exact: true })).toBeDisabled();
});

test("homepage library links to every playable game", async ({ page }) => {
  await page.goto("/");
  const library = page.getByRole("region", { name: "Game library" });
  await expect(
    library.getByRole("heading", { name: "Choose a game" }),
  ).toBeVisible();
  await expect(library.getByRole("link")).toHaveCount(readyGames.length);
  for (const game of readyGames) {
    await expect(
      library.getByRole("link", { name: `Play ${game.title}`, exact: true }),
    ).toHaveAttribute("href", `/games/${game.slug}`);
  }
});

test("game search ignores case and surrounding whitespace", async ({
  page,
}) => {
  await page.goto("/#game-library");
  const library = page.getByRole("region", { name: "Game library" });
  await library
    .getByRole("searchbox", { name: "Find a game" })
    .fill("  BINARY BUILDER  ");
  await expect(library.getByRole("link")).toHaveCount(1);
  await expect(
    library.getByRole("link", { name: "Play Binary Builder" }),
  ).toBeVisible();
  await library.getByRole("link", { name: "Play Binary Builder" }).click();
  await expect(page).toHaveURL("/games/binary-builder");
  await expect(
    page.getByRole("heading", { name: "Binary Builder", exact: true }),
  ).toBeVisible();
});

test("topic and query combine and an empty search can be cleared", async ({
  page,
}) => {
  await page.goto("/#game-library");
  const library = page.getByRole("region", { name: "Game library" });
  await library.getByLabel("Topic", { exact: true }).selectOption("networking");
  await expect(library.getByRole("link")).toHaveCount(2);
  await expect(
    library.getByRole("link", { name: "Play Packet Routing Race" }),
  ).toBeVisible();
  await expect(
    library.getByRole("link", { name: "Play IPv4 Address Lab" }),
  ).toBeVisible();
  await library.getByRole("searchbox", { name: "Find a game" }).fill("ipv4");
  await expect(library.getByRole("link")).toHaveCount(1);
  await expect(
    library.getByRole("link", { name: "Play IPv4 Address Lab" }),
  ).toBeVisible();
  await library.getByRole("searchbox", { name: "Find a game" }).fill("bubble");
  await expect(library.getByRole("link")).toHaveCount(0);
  await expect(library.getByText("No games match your search.")).toBeVisible();
  await library.getByRole("button", { name: "Clear filters" }).click();
  await expect(library.getByRole("link")).toHaveCount(readyGames.length);
  await expect(
    library.getByRole("searchbox", { name: "Find a game" }),
  ).toHaveValue("");
});

test("library shows browser-saved completion without hiding replay links", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "mata-hub:completed-games",
      JSON.stringify(["binary"]),
    ),
  );
  await page.goto("/#game-library");
  const binary = page
    .getByRole("region", { name: "Game library" })
    .getByRole("link", { name: "Play Binary Builder", exact: true });
  await expect(binary.getByText("Completed", { exact: true })).toBeVisible();
  await expect(binary).toHaveAttribute("href", "/games/binary-builder");
});

test("homepage and library fit a 320px viewport without clipped controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  const heading = page.getByRole("heading", { level: 1 });
  expect(
    await heading.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  for (const name of ["Launch Bubble Sort Lab", "Launch Binary Builder"]) {
    const bounds = await page
      .getByRole("link", { name, exact: true })
      .boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
  }
  const search = page.getByRole("searchbox", { name: "Find a game" });
  await search.focus();
  await expect(search).toBeFocused();
  await search.pressSequentially("truth tables");
  await expect(
    page
      .getByRole("region", { name: "Game library" })
      .getByRole("link", { name: "Play Logic Gates" }),
  ).toBeVisible();
});
