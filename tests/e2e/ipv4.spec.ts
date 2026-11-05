import { expect, test, type Locator } from "@playwright/test";
import { games } from "../../src/data/games";

const key = "mata-hub:completed-games";
const answers = [
  "Valid IPv4",
  "Not valid",
  "Not valid",
  "11000000",
  "10101000",
  "00001010",
  "Private",
  "Public",
  "Same network",
  "Different networks",
];
const weights = [128, 64, 32, 16, 8, 4, 2, 1];

async function choose(game: Locator, answer: string) {
  if (/^[01]{8}$/.test(answer)) {
    for (const [i, bit] of [...answer].entries()) {
      if (bit === "1")
        await game
          .getByRole("button", { name: `Bit ${weights[i]}`, exact: true })
          .click();
    }
  } else await game.getByRole("button", { name: answer, exact: true }).click();
}

test("IPv4 has its own URL and appears under Networking", async ({
  page,
  isMobile,
}) => {
  const response = await page.goto("/games/ipv4-address-lab");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: "IPv4 Address Lab", exact: true }),
  ).toBeVisible();
  if (isMobile)
    await page.getByRole("button", { name: "Toggle games menu" }).click();
  const nav = page.getByRole("navigation", { name: "Games" });
  await expect(
    nav.getByRole("link", { name: /IPv4 Address Lab/ }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    nav.getByRole("link", { name: /Packet Routing Race/ }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "IPv4 Address Lab", exact: true }),
  ).toBeVisible();
});

test("IPv4 gives useful empty and wrong feedback without skipping challenges", async ({
  page,
}) => {
  await page.goto("/games/ipv4-address-lab");
  const game = page.getByRole("region", { name: "IPv4 game", exact: true });
  await game.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(
    game.getByRole("status", { name: "Answer feedback", exact: true }),
  ).toContainText("Choose an answer first.");
  await choose(game, "Not valid");
  await game.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(
    game.getByRole("status", { name: "Answer feedback", exact: true }),
  ).toContainText("Not quite.");
  await expect(
    game.getByRole("button", { name: "Next challenge", exact: true }),
  ).toBeDisabled();
  await game.getByRole("button", { name: "Show hint", exact: true }).click();
  await expect(game.locator("#ipv4-hint")).toContainText("255");
  await choose(game, "Valid IPv4");
  await game
    .getByRole("button", { name: "Check answer", exact: true })
    .click({ clickCount: 2 });
  await expect(game.getByText("Solved 1 / 10", { exact: true })).toBeVisible();
  await expect(
    game.getByText("Challenge 1 / 10", { exact: true }),
  ).toBeVisible();
  await game
    .getByRole("button", { name: "Next challenge", exact: true })
    .click();
  await expect(
    game.getByRole("heading", { name: "Check this address", exact: true }),
  ).toBeFocused();
  expect(await page.evaluate((k) => localStorage.getItem(k), key)).toBeNull();
});

for (const blocked of [false, true]) {
  test(`IPv4 completes all ten challenges with ${blocked ? "quota-denied" : "working"} storage`, async ({
    page,
    isMobile,
  }) => {
    if (isMobile) await page.setViewportSize({ width: 320, height: 800 });
    await page.addInitScript(
      ({ k, deny }) => {
        if (localStorage.getItem(k) === null)
          localStorage.setItem(k, '["packet-routing"]');
        if (deny)
          Storage.prototype.setItem = () => {
            throw new DOMException("Storage full", "QuotaExceededError");
          };
      },
      { k: key, deny: blocked },
    );
    await page.goto("/games/ipv4-address-lab");
    const game = page.getByRole("region", { name: "IPv4 game", exact: true });
    for (const [index, answer] of answers.entries()) {
      if (index === 9) {
        await choose(game, "Same network");
        await game
          .getByRole("button", { name: "Check answer", exact: true })
          .click();
        await expect(
          game.getByRole("status", { name: "Answer feedback", exact: true }),
        ).toContainText("Not quite.");
        expect(
          await page.evaluate(
            (k) => JSON.parse(localStorage.getItem(k) || "[]"),
            key,
          ),
        ).toEqual(["packet-routing"]);
      }
      await choose(game, answer);
      await game
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await expect(
        game.getByRole("status", { name: "Answer feedback", exact: true }),
      ).toContainText("Correct.");
      for (const button of await game.getByRole("button").all()) {
        if (!(await button.isVisible())) continue;
        const box = await button.boundingBox();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(
          page.viewportSize()!.width,
        );
        expect(box!.height).toBeGreaterThanOrEqual(44);
      }
      if (index < 9) {
        expect(
          await page.evaluate(
            (k) => JSON.parse(localStorage.getItem(k) || "[]"),
            key,
          ),
        ).toEqual(["packet-routing"]);
        await game
          .getByRole("button", { name: "Next challenge", exact: true })
          .click();
      }
    }
    await expect(
      game.getByRole("status", { name: "Answer feedback", exact: true }),
    ).toContainText("All 10 challenges complete.");
    await expect(
      game.getByRole("status", { name: "Answer feedback", exact: true }),
    ).not.toContainText(/saved/i);
    expect(
      await page.evaluate(
        (k) => JSON.parse(localStorage.getItem(k) || "[]"),
        key,
      ),
    ).toEqual(blocked ? ["packet-routing"] : ["packet-routing", "ipv4"]);
    await game.getByRole("button", { name: "Play again", exact: true }).click();
    await expect(
      game.getByText("Challenge 1 / 10", { exact: true }),
    ).toBeVisible();
    if (isMobile)
      await page.getByRole("button", { name: "Toggle games menu" }).click();
    await page
      .getByRole("navigation", { name: "Games" })
      .getByRole("link", { name: "Home", exact: true })
      .click();
    const total = games.filter((g) => g.status === "Ready").length;
    await expect(
      page.getByText(`2/${total} completed`, { exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByText(`${blocked ? 1 : 2}/${total} completed`, { exact: true }),
    ).toBeVisible();
  });
}

test("IPv4 bit builder and glossary support native keyboard controls at 320px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/games/ipv4-address-lab");
  const game = page.getByRole("region", { name: "IPv4 game", exact: true });
  for (const answer of answers.slice(0, 3)) {
    await choose(game, answer);
    await game
      .getByRole("button", { name: "Check answer", exact: true })
      .click();
    await game
      .getByRole("button", { name: "Next challenge", exact: true })
      .click();
  }
  const first = game.getByRole("button", { name: "Bit 128", exact: true });
  await first.focus();
  await page.keyboard.press("Space");
  await expect(first).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Tab");
  const second = game.getByRole("button", { name: "Bit 64", exact: true });
  await expect(second).toBeFocused();
  await page.keyboard.press("Space");
  await page.keyboard.press("Shift+Tab");
  await expect(first).toBeFocused();
  await game
    .getByRole("button", { name: "Check answer", exact: true })
    .press("Enter");
  await expect(
    game.getByRole("status", { name: "Answer feedback", exact: true }),
  ).toContainText("Correct.");
  await game.locator(".glossary-panel summary").press("Enter");
  await expect(game.locator(".glossary-panel dl")).toBeVisible();
  await game.getByRole("button", { name: "Reset", exact: true }).press("Enter");
  await expect(
    game.getByText("Challenge 1 / 10", { exact: true }),
  ).toBeVisible();
});
