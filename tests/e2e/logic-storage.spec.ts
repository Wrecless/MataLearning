import { expect, test } from "@playwright/test";
import { games } from "../../src/data/games";

const gameCount = games.filter((game) => game.status === "Ready").length;

test("Logic Gates does not claim saving when storage rejects writes", async ({
  page,
  isMobile,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage full", "QuotaExceededError");
    };
  });
  await page.goto("/games/logic-gates");
  const game = page.getByRole("region", {
    name: "Logic gates game",
    exact: true,
  });
  await expect(
    game.getByRole("heading", { name: "Logic Gates", exact: true }),
  ).toBeVisible();
  const answers = [0, 1, 1, 1, 1, 0, 1, 0, 0, 1] as const;
  for (const [index, answer] of answers.entries()) {
    await game
      .getByRole("button", { name: `Output ${answer}`, exact: true })
      .click();
    await game
      .getByRole("button", { name: "Check answer", exact: true })
      .click();
    if (index < answers.length - 1)
      await game
        .getByRole("button", { name: "Next challenge", exact: true })
        .click();
  }
  await expect(game.getByRole("status")).toContainText(
    "All 10 challenges complete.",
  );
  await expect(game.getByRole("status")).not.toContainText(/saved/i);
  expect(
    await page.evaluate(() => localStorage.getItem("mata-hub:completed-games")),
  ).toBeNull();
  if (isMobile)
    await page.getByRole("button", { name: "Toggle games menu" }).click();
  await page
    .getByRole("navigation", { name: "Games" })
    .getByRole("link", { name: "Home", exact: true })
    .click();
  await expect(page.getByText(`1/${gameCount} completed`)).toBeVisible();
});
