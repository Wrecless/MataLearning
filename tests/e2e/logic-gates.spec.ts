import { expect, test, type Page } from "@playwright/test";

const progressKey = "mata-hub:completed-games";
const gameFor = (page: Page) =>
  page.getByRole("region", { name: "Logic gates game", exact: true });
async function completedGames(page: Page): Promise<string[]> {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) || "[]"),
    progressKey,
  );
}

test("wrong answers can be retried; hints teach and correct checks never auto-advance", async ({
  page,
}) => {
  await page.goto("/games/logic-gates");
  const game = gameFor(page);
  const check = game.getByRole("button", { name: "Check answer", exact: true });
  const next = game.getByRole("button", {
    name: "Next challenge",
    exact: true,
  });
  await check.click();
  await expect(game.getByRole("status")).toContainText(
    "Choose output 0 or 1 first.",
  );
  await expect(next).toBeDisabled();
  await game.getByRole("button", { name: "Output 1", exact: true }).click();
  await check.click();
  await expect(game.getByRole("status")).toContainText("Not quite.");
  await expect(game.getByRole("status")).toContainText(
    "AND outputs 1 only when both inputs are 1.",
  );
  await expect(game.getByText("Solved 0 / 10", { exact: true })).toBeVisible();
  await expect(next).toBeDisabled();
  await game.getByRole("button", { name: "Show hint", exact: true }).click();
  await expect(
    game.getByRole("region", { name: "Hint", exact: true }),
  ).toContainText("AND outputs 1 only when both inputs are 1.");
  const table = game.getByRole("table", { name: "AND truth table" });
  await expect(
    table.getByRole("row", { name: "1 0 0 Given inputs", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await game.getByRole("button", { name: "Output 0", exact: true }).click();
  await check.click();
  await expect(game.getByRole("status")).toContainText("Correct.");
  await expect(game.getByText("Solved 1 / 10", { exact: true })).toBeVisible();
  await expect(check).toBeDisabled();
  await expect(
    game.getByRole("button", { name: "Output 1", exact: true }),
  ).toBeDisabled();
  await next.click({ clickCount: 2 });
  await expect(
    game.getByText("Challenge 2 / 10", { exact: true }),
  ).toBeVisible();
  await expect(next).toBeDisabled();
  await expect(
    game.getByRole("button", { name: "Output 0", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  expect(await completedGames(page)).toEqual([]);
});

test("all ten independent answers complete only on the last check and survive reset and reload", async ({
  page,
}, testInfo) => {
  test.setTimeout(60_000);
  if (testInfo.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 800 });
  // Literal expectations deliberately do not import gate evaluators or answer data.
  const rounds = [
    {
      title: "AND gate",
      answer: 0,
      gate: "AND",
      outputs: [0, 0, 0, 1],
      current: 2,
    },
    {
      title: "OR gate",
      answer: 1,
      gate: "OR",
      outputs: [0, 1, 1, 1],
      current: 1,
    },
    { title: "NOT gate", answer: 1, gate: "NOT", outputs: [1, 0], current: 0 },
    {
      title: "XOR gate",
      answer: 1,
      gate: "XOR",
      outputs: [0, 1, 1, 0],
      current: 2,
    },
    {
      title: "NAND gate",
      answer: 1,
      gate: "NAND",
      outputs: [1, 1, 1, 0],
      current: 1,
    },
    {
      title: "NOR gate",
      answer: 0,
      gate: "NOR",
      outputs: [1, 0, 0, 0],
      current: 2,
    },
    {
      title: "XNOR gate",
      answer: 1,
      gate: "XNOR",
      outputs: [1, 0, 0, 1],
      current: 3,
    },
    {
      title: "XOR with matching inputs",
      answer: 0,
      gate: "XOR",
      outputs: [0, 1, 1, 0],
      current: 3,
    },
    {
      title: "AND then NOT",
      answer: 0,
      steps: ["AND(1, 1) = 1", "NOT(1) = 0"],
    },
    {
      title: "OR then AND",
      answer: 1,
      steps: ["OR(0, 1) = 1", "AND(1, 1) = 1"],
    },
  ];
  await page.goto("/games/logic-gates");
  const game = gameFor(page);
  const check = game.getByRole("button", { name: "Check answer", exact: true });
  const next = game.getByRole("button", {
    name: "Next challenge",
    exact: true,
  });
  for (const [index, round] of rounds.entries()) {
    await expect(
      game.getByRole("heading", { name: round.title, exact: true }),
    ).toBeVisible();
    await expect(
      game.getByText(`Challenge ${index + 1} / 10`, { exact: true }),
    ).toBeVisible();
    expect(await completedGames(page)).toEqual([]);
    if (round.outputs) {
      const table = game.getByRole("table", {
        name: `${round.gate} truth table`,
      });
      const actual = await table
        .locator("tbody tr")
        .evaluateAll((rows) =>
          rows.map((row) =>
            Array.from(row.querySelectorAll("td"), (cell) => cell.textContent),
          ),
        );
      const inputs =
        round.gate === "NOT"
          ? [[0], [1]]
          : [
              [0, 0],
              [0, 1],
              [1, 0],
              [1, 1],
            ];
      expect(actual).toEqual(
        inputs.map((input, row) => [
          ...input.map(String),
          String(round.outputs![row]),
          row === round.current ? "Given inputs" : "",
        ]),
      );
      await expect(table.locator('[aria-current="true"]')).toHaveCount(1);
    } else {
      await expect(
        game
          .getByRole("list", { name: "Circuit evaluation steps" })
          .getByRole("listitem"),
      ).toHaveText(round.steps!);
      await game
        .getByRole("button", { name: "Show hint", exact: true })
        .click();
      await expect(
        game.getByRole("region", { name: "Hint", exact: true }),
      ).toContainText("first result becomes an input");
      // A wrong final-circuit answer must still not persist completion.
      await game
        .getByRole("button", {
          name: `Output ${round.answer === 1 ? 0 : 1}`,
          exact: true,
        })
        .click();
      await check.click();
      await expect(game.getByRole("status")).toContainText("Not quite.");
      expect(await completedGames(page)).toEqual([]);
    }
    const answer = game.getByRole("button", {
      name: `Output ${round.answer}`,
      exact: true,
    });
    await answer.click();
    await expect(answer).toHaveAttribute("aria-pressed", "true");
    await check.click({ clickCount: 2 });
    await expect(
      game.getByText(`Solved ${index + 1} / 10`, { exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    if (index === 9)
      await page.screenshot({
        path: testInfo.outputPath("logic-final-circuit-complete.png"),
        fullPage: true,
      });
    if (index < 9) {
      expect(await completedGames(page)).toEqual([]);
      await expect(
        game.getByText(`Challenge ${index + 1} / 10`, { exact: true }),
      ).toBeVisible();
      await next.click();
    }
  }
  await expect(game.getByRole("status")).toContainText(
    "All 10 challenges complete.",
  );
  await expect.poll(() => completedGames(page)).toEqual(["logic"]);
  await expect(next).toHaveCount(0);
  await game.getByRole("button", { name: "Play again", exact: true }).click();
  await expect(
    game.getByText("Challenge 1 / 10", { exact: true }),
  ).toBeVisible();
  await expect(game.getByText("Solved 0 / 10", { exact: true })).toBeVisible();
  expect(await completedGames(page)).toEqual(["logic"]);
  await game.getByRole("button", { name: "Reset", exact: true }).click();
  expect(await completedGames(page)).toEqual(["logic"]);
  await page.reload();
  await expect(
    game.getByText("Challenge 1 / 10", { exact: true }),
  ).toBeVisible();
  expect(await completedGames(page)).toEqual(["logic"]);
});

test("keyboard controls, glossary, and reset remain usable at 320px without overflow", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/games/logic-gates");
  const game = gameFor(page);
  const zero = game.getByRole("button", { name: "Output 0", exact: true });
  const one = game.getByRole("button", { name: "Output 1", exact: true });
  const check = game.getByRole("button", { name: "Check answer", exact: true });
  await zero.focus();
  await page.keyboard.press("Space");
  await expect(zero).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Tab");
  await expect(one).toBeFocused();
  await page.keyboard.press("Space");
  await expect(one).toHaveAttribute("aria-pressed", "true");
  await expect(zero).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("Tab");
  await expect(check).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(game.getByRole("status")).toContainText("Not quite.");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(zero).toBeFocused();
  await page.keyboard.press("Space");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(game.getByRole("status")).toContainText("Correct.");
  await page.keyboard.press("Tab");
  const next = game.getByRole("button", {
    name: "Next challenge",
    exact: true,
  });
  await expect(next).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    game.getByRole("heading", { name: "OR gate", exact: true }),
  ).toBeFocused();
  await game.getByRole("button", { name: "Show hint", exact: true }).click();
  await game.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(
    game.getByText("Challenge 1 / 10", { exact: true }),
  ).toBeVisible();
  await expect(game.getByText("Solved 0 / 10", { exact: true })).toBeVisible();
  await expect(zero).toHaveAttribute("aria-pressed", "false");
  await expect(
    game.getByRole("button", { name: "Show hint", exact: true }),
  ).toHaveAttribute("aria-expanded", "false");
  expect(await completedGames(page)).toEqual([]);
  const glossary = game.locator("summary");
  await glossary.focus();
  await page.keyboard.press("Enter");
  await expect(
    game.getByText("Circuit / intermediate wire", { exact: true }),
  ).toBeVisible();
  await game.getByRole("button", { name: "Show hint", exact: true }).click();
  const layout = await game.evaluate((element) => ({
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
    controls: Array.from(
      element.querySelectorAll("button, summary"),
      (control) => ({
        width: control.getBoundingClientRect().width,
        height: control.getBoundingClientRect().height,
      }),
    ),
  }));
  expect(layout.width).toBeLessThanOrEqual(layout.viewport);
  for (const control of layout.controls) {
    expect(control.height).toBeGreaterThanOrEqual(44);
    expect(control.width).toBeGreaterThanOrEqual(44);
  }
  expect(errors).toEqual([]);
  await page.screenshot({
    path: testInfo.outputPath("logic-320-hint-glossary.png"),
    fullPage: true,
  });
});

test("Logic Gates presents a playable first challenge", async ({
  page,
}, testInfo) => {
  await page.goto("/games/logic-gates");
  const game = page.getByRole("region", {
    name: "Logic gates game",
    exact: true,
  });
  await expect(
    game.getByRole("heading", { level: 1, name: "Logic Gates", exact: true }),
  ).toBeVisible();
  await expect(
    game.getByText("Challenge 1 / 10", { exact: true }),
  ).toBeVisible();
  await expect(
    game.getByRole("button", { name: "Output 0", exact: true }),
  ).toBeVisible();
  await expect(
    game.getByRole("button", { name: "Check answer", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("logic-first-challenge.png"),
    fullPage: true,
  });
});
