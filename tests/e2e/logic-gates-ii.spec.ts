import { expect, test } from "@playwright/test";
import { games } from "../../src/data/games";

const key = "mata-hub:completed-games";
const answers = [
  "AND",
  "OR",
  "NOT",
  "XOR",
  "NAND",
  "NOR",
  "XNOR",
  1,
  0,
  0,
] as const;

test("Logic Gates II has its own playable URL with real gate imagery", async ({
  page,
}) => {
  await page.goto("/games/logic-gates-ii");
  await expect(
    page.getByRole("heading", { name: "Logic Gates II", exact: true }),
  ).toBeVisible();
  const game = page.getByRole("region", {
    name: "Logic gates II game",
    exact: true,
  });
  await expect(game.getByRole("img").first()).toBeVisible();
  await expect(
    game.getByRole("button", { name: "XOR", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Logic Gates II", exact: true }),
  ).toBeVisible();
});

test("II permits retries and advances only after a correct checked answer", async ({
  page,
}) => {
  await page.goto("/games/logic-gates-ii");
  const game = page.getByRole("region", {
    name: "Logic gates II game",
    exact: true,
  });
  await game.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(game.getByRole("status")).toContainText(
    "Choose an answer first.",
  );
  await game.getByRole("button", { name: "OR", exact: true }).click();
  await game.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(game.getByRole("status")).toContainText("Not quite.");
  await expect(
    game.getByRole("button", { name: "Next challenge", exact: true }),
  ).toBeDisabled();
  await game.getByRole("button", { name: "AND", exact: true }).click();
  await game
    .getByRole("button", { name: "Check answer", exact: true })
    .click({ clickCount: 2 });
  await expect(
    game.getByText("Challenge 1 / 10", { exact: true }),
  ).toBeVisible();
  await expect(
    game.getByRole("button", { name: "Check answer", exact: true }),
  ).toBeDisabled();
  await game
    .getByRole("button", { name: "Next challenge", exact: true })
    .click();
  await expect(
    game.getByText("Challenge 2 / 10", { exact: true }),
  ).toBeVisible();
  expect(await page.evaluate((k) => localStorage.getItem(k), key)).toBeNull();
});

for (const blockedWrites of [false, true]) {
  test(`all seven gates and mixed circuits complete with ${blockedWrites ? "blocked" : "working"} storage`, async ({
    page,
    isMobile,
  }) => {
    if (isMobile) await page.setViewportSize({ width: 320, height: 800 });
    await page.addInitScript(
      ({ k, blocked }) => {
        if (localStorage.getItem(k) === null)
          localStorage.setItem(k, JSON.stringify(["logic"]));
        if (blocked)
          Storage.prototype.setItem = () => {
            throw new DOMException("Storage full", "QuotaExceededError");
          };
      },
      { k: key, blocked: blockedWrites },
    );
    await page.goto("/games/logic-gates-ii");
    const game = page.getByRole("region", {
      name: "Logic gates II game",
      exact: true,
    });
    for (const [index, answer] of answers.entries()) {
      await expect(game.getByRole("img").first()).toBeVisible();
      await game
        .getByRole("button", {
          name: typeof answer === "string" ? answer : `Output ${answer}`,
          exact: true,
        })
        .click();
      await game
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      const buttons = game.getByRole("button");
      for (const button of await buttons.all()) {
        if (!(await button.isVisible())) continue;
        const bounds = await button.boundingBox();
        expect(bounds).not.toBeNull();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(
          isMobile ? 320 : 1440,
        );
      }
      if (index < answers.length - 1) {
        expect(
          await page.evaluate(
            (k) => JSON.parse(localStorage.getItem(k) || "[]"),
            key,
          ),
        ).toEqual(["logic"]);
        await game
          .getByRole("button", { name: "Next challenge", exact: true })
          .click();
      }
    }
    await expect(game.getByRole("status")).toContainText(
      "All 10 challenges complete.",
    );
    await expect(game.getByRole("status")).not.toContainText(/saved/i);
    const stored = await page.evaluate(
      (k) => JSON.parse(localStorage.getItem(k) || "[]"),
      key,
    );
    expect(stored).toEqual(blockedWrites ? ["logic"] : ["logic", "logic-ii"]);
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
    const total = games.filter((item) => item.status === "Ready").length;
    await expect(page.getByText(`2/${total} completed`)).toBeVisible();
    if (!blockedWrites) {
      await page.reload();
      await expect(page.getByText(`2/${total} completed`)).toBeVisible();
    }
  });
}

test("II symbol guide and choices work with the keyboard at 320px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/games/logic-gates-ii");
  const game = page.getByRole("region", {
    name: "Logic gates II game",
    exact: true,
  });
  const answer = game.getByRole("button", { name: "AND", exact: true });
  await answer.focus();
  await answer.press("Space");
  await expect(answer).toHaveAttribute("aria-pressed", "true");
  await game
    .getByRole("button", { name: "Check answer", exact: true })
    .press("Enter");
  await game
    .getByRole("button", { name: "Next challenge", exact: true })
    .press("Enter");
  await expect(
    game.getByRole("heading", { name: "Name this gate", exact: true }),
  ).toBeFocused();
  await game.getByText("Gate symbol guide", { exact: true }).press("Enter");
  await expect(
    game.getByRole("img", { name: "XNOR gate symbol", exact: true }),
  ).toBeVisible();
  await game.locator(".glossary-panel summary").press("Enter");
  await expect(game.locator(".glossary-panel dl")).toBeVisible();
});
