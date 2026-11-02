import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  INSERTION_CHALLENGES,
  PATHFINDING_GRID,
  SEARCH_CHALLENGES,
  SORTING_CHALLENGES,
} from "../../src/utils/algorithms";
import { bitValues, CHALLENGES_PER_LEVEL } from "../../src/utils/binary";
import { DIVIDEND_CHALLENGES_PER_LEVEL } from "../../src/utils/dividend";
import { MODULO_CHALLENGES_PER_LEVEL } from "../../src/utils/modulo";
import { NETWORK_ROUNDS } from "../../src/utils/networking";

const progressKey = "mata-hub:completed-games";

// Only read persisted progress: all game state changes happen through real controls.
async function completedGames(page: Page): Promise<string[]> {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) || "[]"),
    progressKey,
  );
}

function metric(scope: Locator, label: string): Locator {
  return scope
    .getByText(label, { exact: true })
    .locator("..")
    .locator("strong");
}

async function openGame(
  page: Page,
  slug: string,
  label: string,
  heading: string,
) {
  await page.goto(`/games/${slug}`);
  const game = page.getByRole("region", { name: label, exact: true });
  await expect(
    game.getByRole("heading", { level: 1, name: heading, exact: true }),
  ).toBeVisible();
  await expect(game.getByRole("status")).toBeVisible();
  expect(await completedGames(page)).toEqual([]);
  return game;
}

async function expectPersistedCompletion(page: Page, id: string) {
  await expect.poll(() => completedGames(page)).toEqual([id]);
  await page.reload();
  await expect.poll(() => completedGames(page)).toEqual([id]);
}

test.describe("ready game gameplay", () => {
  test.setTimeout(90_000);

  test("Bubble Sort rejects an incorrect adjacent decision and advances after a correct one", async ({
    page,
  }) => {
    const game = await openGame(
      page,
      "bubble-sort",
      "Bubble sort game",
      "Bubble Sort Lab",
    );
    const tiles = game.locator('[aria-label^="Position "]');
    const values = (
      await tiles.evaluateAll((elements) =>
        elements.map((element) => element.getAttribute("aria-label")),
      )
    ).map((label) => Number(label!.match(/value (\d+)/)![1]));
    expect(values).toHaveLength(10);
    const swap = values[0] > values[1];
    const correct = game.getByRole("button", {
      name: swap ? "Swap" : "No swap",
      exact: true,
    });
    const incorrect = game.getByRole("button", {
      name: swap ? "No swap" : "Swap",
      exact: true,
    });

    await incorrect.click();
    await expect(game.getByRole("status")).toHaveText(
      swap
        ? `${values[0]} is larger than ${values[1]}, so this pair must be swapped.`
        : `${values[0]} is already less than ${values[1]}, so leave this pair in place.`,
    );
    await expect(metric(game, "Steps")).toHaveText("0");
    await correct.click();
    await expect(metric(game, "Steps")).toHaveText("1");
    // The 280ms advancement must finish before the next comparison is playable.
    await expect(
      game.getByText("positions 2 and 3", { exact: true }),
    ).toBeVisible();
    await expect(correct).toBeEnabled();
    const expectedPair = swap ? [values[1], values[0]] : values.slice(0, 2);
    await expect(tiles.nth(0)).toHaveAttribute(
      "aria-label",
      `Position 1, value ${expectedPair[0]}`,
    );
    await expect(tiles.nth(1)).toHaveAttribute(
      "aria-label",
      `Position 2, value ${expectedPair[1]}`,
    );
    expect(await completedGames(page)).toEqual([]);
  });

  test("Binary Builder completes eight live targets, unlocks level two, and persists completion", async ({
    page,
  }) => {
    const game = await openGame(
      page,
      "binary-builder",
      "Binary builder game",
      "Binary Builder",
    );
    const columns = game
      .locator('[aria-label="Binary place values"]')
      .getByRole("button");
    const console = game.getByRole("complementary", {
      name: "Binary game score",
    });
    await expect(columns).toHaveCount(8);

    // Even zero is a valid random target; toggle the unit bit to guarantee a wrong answer.
    const initialTarget = Number(
      await game.locator("#binary-target").innerText(),
    );
    if (initialTarget === 0) await columns.nth(7).click();
    await game.getByRole("button", { name: "Check", exact: true }).click();
    await expect(game.getByRole("status")).toContainText("Not quite.");
    await expect(metric(console, "Score")).toHaveText("0");
    if (initialTarget === 0) await columns.nth(7).click();

    for (let challenge = 0; challenge < CHALLENGES_PER_LEVEL; challenge += 1) {
      const target = Number(await game.locator("#binary-target").innerText());
      expect(target).toBeGreaterThanOrEqual(0);
      expect(target).toBeLessThanOrEqual(63);
      const binary = target.toString(2).padStart(8, "0");
      for (const [index, value] of bitValues.entries()) {
        await expect(columns.nth(index)).toHaveAttribute(
          "aria-pressed",
          "false",
        );
        if ((target & value) !== 0) await columns.nth(index).click();
        await expect(columns.nth(index)).toHaveAttribute(
          "aria-pressed",
          binary[index] === "1" ? "true" : "false",
        );
      }
      await expect(metric(game, "Your binary")).toHaveText(binary);
      await expect(metric(game, "Current total")).toHaveText(String(target));
      await game.getByRole("button", { name: "Check", exact: true }).click();
      await expect(metric(console, "Score")).toHaveText(
        String((challenge + 1) * 10),
      );
      await expect(metric(console, "Lines left")).toHaveText(
        String(
          challenge === CHALLENGES_PER_LEVEL - 1
            ? CHALLENGES_PER_LEVEL
            : CHALLENGES_PER_LEVEL - challenge - 1,
        ),
      );
      if (challenge < CHALLENGES_PER_LEVEL - 1) {
        await expect(game.getByRole("status")).toHaveText(
          "Correct. A new target is ready.",
        );
        expect(await completedGames(page)).toEqual([]);
      }
    }
    await expect(game.getByRole("status")).toHaveText(
      "Level 1 complete. Level 2 unlocks larger targets.",
    );
    await expect(metric(console, "Level")).toHaveText("2");
    await expect(metric(game, "Current total")).toHaveText("0");
    await expectPersistedCompletion(page, "binary");
  });

  test("Selection Sort rejects a nonminimum then completes the deterministic list", async ({
    page,
  }) => {
    const game = await openGame(
      page,
      "selection-sort",
      "Selection sort game",
      "Selection Sort Showdown",
    );
    const numbers = [...SORTING_CHALLENGES[0]];
    await game
      .getByRole("button", { name: `${numbers[0]} unsorted`, exact: true })
      .click();
    await expect(game.getByRole("status")).toHaveText(
      `${numbers[0]} is not the smallest value in the unsorted section.`,
    );
    await expect(metric(game, "Sorted values")).toHaveText("0");

    for (let boundary = 0; boundary < numbers.length - 1; boundary += 1) {
      const minimum = Math.min(...numbers.slice(boundary));
      const index = numbers.indexOf(minimum, boundary);
      await game
        .getByRole("button", { name: `${minimum} unsorted`, exact: true })
        .click();
      [numbers[boundary], numbers[index]] = [numbers[index], numbers[boundary]];
      await expect(
        game.getByRole("button", { name: `${minimum} sorted`, exact: true }),
      ).toBeVisible();
      if (boundary < numbers.length - 2) {
        await expect(game.getByRole("status")).toHaveText(
          `${minimum} moved into the sorted section. Select the next smallest value.`,
        );
      }
    }
    await expect(game.getByRole("status")).toHaveText(
      "Sorted. Selection sort repeatedly selected the smallest unsorted value.",
    );
    await expect(metric(game, "Sorted values")).toHaveText(
      String(numbers.length),
    );
    await expect(metric(game, "Unsorted values")).toHaveText("0");
    await expect(game.getByRole("button", { name: /^\d+ sorted$/ })).toHaveText(
      numbers.map((value) => `${value}sorted`),
    );
    await expectPersistedCompletion(page, "selection");
  });

  test("Insertion Sort rejects a wrong slot and inserts every card into a sorted hand", async ({
    page,
  }) => {
    const game = await openGame(
      page,
      "insertion-sort",
      "Insertion sort game",
      "Insertion Sort Cards",
    );
    const source = INSERTION_CHALLENGES[0];
    const sorted = [source[0]];
    await game
      .getByRole("button", { name: "Insert slot 2", exact: true })
      .click();
    await expect(game.getByRole("status")).toHaveText(
      `${source[1]} does not belong in that position. Compare it with the sorted hand.`,
    );
    await expect(metric(game, "Cards inserted")).toHaveText("1");

    for (const value of source.slice(1)) {
      await expect(metric(game, "Current card")).toHaveText(String(value));
      const firstLarger = sorted.findIndex((item) => item > value);
      const slot = firstLarger === -1 ? sorted.length : firstLarger;
      await game
        .getByRole("button", { name: `Insert slot ${slot + 1}`, exact: true })
        .click();
      sorted.splice(slot, 0, value);
      await expect(metric(game, "Cards inserted")).toHaveText(
        String(sorted.length),
      );
      await expect(metric(game, "Cards left")).toHaveText(
        String(source.length - sorted.length),
      );
      if (sorted.length < source.length) {
        await expect(game.getByRole("status")).toHaveText(
          `${value} inserted correctly. Move to the next card.`,
        );
      }
    }
    await expect(game.getByRole("status")).toHaveText(
      "Sorted. Insertion sort built the final order one card at a time.",
    );
    await expect(metric(game, "Current card")).toHaveText("Done");
    const hand = game
      .getByText("Sorted hand", { exact: true })
      .locator("..")
      .locator("div")
      .last();
    // The visible final cards must match the independently maintained sorted order.
    const cards = game
      .getByText("Sorted hand", { exact: true })
      .locator("..")
      .locator(":scope > div")
      .last()
      .locator(":scope > div");
    await expect(hand).toBeVisible();
    await expect(cards).toHaveText(sorted.map(String));
    await expectPersistedCompletion(page, "insertion");
  });

  test("Search Sprint completes linear and binary searches with method-specific feedback", async ({
    page,
  }) => {
    const game = await openGame(
      page,
      "search-sprint",
      "Search sprint game",
      "Search Sprint",
    );
    const { list, target } = SEARCH_CHALLENGES[0];
    const position = (index: number) =>
      game.getByRole("button", {
        name: new RegExp(`^Position ${index + 1}, value ${list[index]}(?:,|$)`),
      });
    await position(1).click();
    await expect(game.getByRole("status")).toHaveText(
      "Linear search checks from left to right. The next index is 1.",
    );
    await expect(metric(game, "Checks")).toHaveText("0");
    const targetIndex = list.indexOf(target);
    for (let index = 0; index <= targetIndex; index += 1) {
      await position(index).click();
      await expect(metric(game, "Checks")).toHaveText(String(index + 1));
      if (index < targetIndex)
        await expect(game.getByRole("status")).toHaveText(
          `${list[index]} is not the target. Linear search moves one position right.`,
        );
    }
    await expect(game.getByRole("status")).toHaveText(
      `Found ${target} at position ${targetIndex + 1} in ${targetIndex + 1} checks.`,
    );
    await expect.poll(() => completedGames(page)).toEqual(["search"]);

    await game
      .getByRole("button", { name: "Binary Search", exact: true })
      .click();
    await expect(
      game.getByRole("button", { name: "Binary Search", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(metric(game, "Checks")).toHaveText("0");
    await position(0).click();
    await expect(game.getByRole("status")).toHaveText(
      "Binary search checks the middle of the current range. The next index is 4.",
    );
    let low = 0;
    let high = list.length - 1;
    let checks = 0;
    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      await position(middle).click();
      checks += 1;
      await expect(metric(game, "Checks")).toHaveText(String(checks));
      if (list[middle] === target) break;
      if (list[middle] < target) {
        low = middle + 1;
        await expect(game.getByRole("status")).toHaveText(
          `${list[middle]} is too low, so binary search discards the left half.`,
        );
      } else {
        high = middle - 1;
        await expect(game.getByRole("status")).toHaveText(
          `${list[middle]} is too high, so binary search discards the right half.`,
        );
      }
      await expect(metric(game, "Active range")).toHaveText(
        `${low + 1}-${high + 1}`,
      );
    }
    await expect(game.getByRole("status")).toHaveText(
      `Found ${target} at position ${targetIndex + 1} in ${checks} checks.`,
    );
    expect(checks).toBeLessThan(targetIndex + 1);
    await expectPersistedCompletion(page, "search");
  });

  test("Pathfinding Grid enforces BFS queue order and reaches the goal", async ({
    page,
  }) => {
    const game = await openGame(
      page,
      "pathfinding-grid",
      "Pathfinding grid game",
      "Pathfinding Grid",
    );
    const { columns, rows, walls, start, goal } = PATHFINDING_GRID;
    await expect(game.getByRole("button", { name: /^Wall,/ })).toHaveCount(
      walls.size,
    );
    for (const wall of walls)
      await expect(
        game.getByRole("button", {
          name: `Wall, cell ${wall + 1}`,
          exact: true,
        }),
      ).toBeDisabled();
    await game.getByRole("button", { name: /^Goal cell/ }).click();
    await expect(game.getByRole("status")).toHaveText(
      "Breadth-first search uses a queue. Expand cell 1 next.",
    );
    await expect(metric(game, "Visited")).toHaveText("0");

    const queue = [start];
    const discovered = new Set([start]);
    let visited = 0;
    while (queue.length) {
      const cell = queue.shift()!;
      const button = game.getByRole("button", { name: /next to expand$/ });
      await expect(button).toHaveAttribute("aria-current", "step");
      await expect(button).toHaveText(
        cell === start ? "S" : cell === goal ? "G" : String(cell + 1),
      );
      await button.click();
      visited += 1;
      await expect(metric(game, "Visited")).toHaveText(String(visited));
      if (cell === goal) break;
      const row = Math.floor(cell / columns);
      const column = cell % columns;
      const neighbours = [
        row > 0 ? cell - columns : -1,
        column < columns - 1 ? cell + 1 : -1,
        row < rows - 1 ? cell + columns : -1,
        column > 0 ? cell - 1 : -1,
      ];
      for (const neighbour of neighbours) {
        if (
          neighbour >= 0 &&
          !walls.has(neighbour) &&
          !discovered.has(neighbour)
        ) {
          queue.push(neighbour);
          discovered.add(neighbour);
        }
      }
      await expect(metric(game, "Queue")).toHaveText(
        queue.map((item) => item + 1).join(", "),
      );
      await expect(game.getByRole("status")).toHaveText(
        `Cell ${cell + 1} expanded. Add valid neighbours to the back of the queue.`,
      );
    }
    await expect(game.getByRole("status")).toHaveText(
      "Goal reached. BFS found the target by expanding cells in queue order.",
    );
    await expect(metric(game, "Queue")).toHaveText("empty");
    await expect(
      game.getByRole("button", { name: /next to expand$/ }),
    ).toHaveCount(0);
    await expectPersistedCompletion(page, "pathfinding");
  });

  test("Modulo Mastery validates live remainders and advances through a level on its timer", async ({
    page,
  }) => {
    const game = await openGame(
      page,
      "modulo-mastery",
      "Modulo mastery game",
      "Modulo Mastery",
    );
    const console = game.getByRole("complementary", {
      name: "Modulo game score",
    });
    const check = game.getByRole("button", { name: "Check", exact: true });
    await check.click();
    await expect(game.getByRole("status")).toHaveText(
      "Select a possible remainder first.",
    );

    for (
      let challenge = 0;
      challenge < MODULO_CHALLENGES_PER_LEVEL;
      challenge += 1
    ) {
      const expression = await game.locator("#modulo-expression").innerText();
      const match = expression.match(/^(\d+) mod (\d+)$/)!;
      expect(match).not.toBeNull();
      const dividend = Number(match[1]);
      const divisor = Number(match[2]);
      const remainder = dividend % divisor;
      if (challenge === 0) {
        await game
          .getByRole("button", {
            name: String((remainder + 1) % divisor),
            exact: true,
          })
          .click();
        await check.click();
        await expect(game.getByRole("status")).toHaveText(
          `${dividend} = ${Math.floor(dividend / divisor)} x ${divisor} + ${remainder}, so the remainder is ${remainder}.`,
        );
        await expect(metric(console, "Score")).toHaveText("0");
      }
      const answer = game.getByRole("button", {
        name: String(remainder),
        exact: true,
      });
      await answer.click();
      await expect(answer).toHaveAttribute("aria-pressed", "true");
      await check.click();
      await expect(metric(console, "Score")).toHaveText(
        String((challenge + 1) * 10),
      );
      // Wait for the real 520ms timer via observable progression, not a fixed sleep.
      await expect(metric(console, "Challenges left")).toHaveText(
        String(
          challenge === MODULO_CHALLENGES_PER_LEVEL - 1
            ? MODULO_CHALLENGES_PER_LEVEL
            : MODULO_CHALLENGES_PER_LEVEL - challenge - 1,
        ),
      );
      await expect(metric(game, "Selected remainder")).toHaveText("-");
      if (challenge < MODULO_CHALLENGES_PER_LEVEL - 1)
        expect(await completedGames(page)).toEqual([]);
    }
    await expect(metric(console, "Level")).toHaveText("2");
    await expect(game.getByRole("status")).toHaveText(
      "Level 1 complete. Level 2 uses wider modulo challenges.",
    );
    await expectPersistedCompletion(page, "modulo");
  });

  test("Dividend Builder validates live division facts and completes a level on its timer", async ({
    page,
  }) => {
    const game = await openGame(
      page,
      "dividend-builder",
      "Dividend builder game",
      "Dividend Builder",
    );
    const console = game.getByRole("complementary", {
      name: "Dividend game score",
    });
    const check = game.getByRole("button", { name: "Check", exact: true });
    await check.click();
    await expect(game.getByRole("status")).toHaveText(
      "Select the missing dividend first.",
    );

    for (
      let challenge = 0;
      challenge < DIVIDEND_CHALLENGES_PER_LEVEL;
      challenge += 1
    ) {
      const expression = await game.locator("#dividend-expression").innerText();
      const match = expression.match(/^\? = (\d+) x (\d+) \+ (\d+)$/)!;
      expect(match).not.toBeNull();
      const divisor = Number(match[1]);
      const quotient = Number(match[2]);
      const remainder = Number(match[3]);
      const dividend = divisor * quotient + remainder;
      if (challenge === 0) {
        const options = game.getByRole("button", { name: /^\d+$/ });
        const wrong = options
          .filter({ hasText: new RegExp(`^(?!${dividend}$)\\d+$`) })
          .first();
        await wrong.click();
        await check.click();
        await expect(game.getByRole("status")).toHaveText(
          `Use divisor x quotient + remainder: ${divisor} x ${quotient} + ${remainder} = ${dividend}.`,
        );
        await expect(metric(console, "Score")).toHaveText("0");
      }
      const answer = game.getByRole("button", {
        name: String(dividend),
        exact: true,
      });
      await answer.click();
      await expect(answer).toHaveAttribute("aria-pressed", "true");
      await check.click();
      await expect(metric(console, "Score")).toHaveText(
        String((challenge + 1) * 10),
      );
      await expect(metric(console, "Challenges left")).toHaveText(
        String(
          challenge === DIVIDEND_CHALLENGES_PER_LEVEL - 1
            ? DIVIDEND_CHALLENGES_PER_LEVEL
            : DIVIDEND_CHALLENGES_PER_LEVEL - challenge - 1,
        ),
      );
      await expect(metric(game, "Selected dividend")).toHaveText("-");
      if (challenge < DIVIDEND_CHALLENGES_PER_LEVEL - 1)
        expect(await completedGames(page)).toEqual([]);
    }
    await expect(metric(console, "Level")).toHaveText("2");
    await expect(game.getByRole("status")).toHaveText(
      "Level 1 complete. Level 2 uses larger division facts.",
    );
    await expectPersistedCompletion(page, "dividend");
  });

  test("Packet Routing Race delivers every packet across three automatically advancing stages", async ({
    page,
  }) => {
    const game = await openGame(
      page,
      "packet-routing-race",
      "Packet routing race game",
      "Packet Routing Race",
    );
    const console = game.getByRole("complementary", { name: "Packet console" });
    // Known clear routes from NETWORK_ROUNDS; no helper or game state is mocked.
    const routes = [
      ["R1", "R3", "Server"],
      ["R3", "R5", "Server"],
      ["R2", "R5", "R8", "Server"],
    ];
    await game.getByRole("button", { name: "Server", exact: true }).click();
    await expect(game.getByRole("status")).toHaveText(
      "Those devices are not directly connected. Pick a linked next hop.",
    );
    await expect(metric(console, "Delivered")).toHaveText("0/3");

    for (const [stageIndex, round] of NETWORK_ROUNDS.entries()) {
      await expect(metric(console, "Stage")).toHaveText(
        `${stageIndex + 1}/${NETWORK_ROUNDS.length}`,
      );
      await expect(game.getByText(round.name, { exact: true })).toBeVisible();
      await expect(metric(console, "Delivered")).toHaveText(
        `0/${round.packets.length}`,
      );
      await expect(metric(console, "Dropped")).toHaveText("0");
      if (stageIndex === 1) {
        await game.getByRole("button", { name: "R1", exact: true }).click();
        await game.getByRole("button", { name: "R4", exact: true }).click();
        await expect(game.getByRole("status")).toHaveText(
          "That link is broken. Choose a different route.",
        );
        await expect(metric(console, "Latency")).toHaveText(
          `1/${round.latencyBudget}`,
        );
        await game.getByRole("button", { name: "Reset", exact: true }).click();
      }
      const delivered = new Set<number>();
      for (const [packetIndex, sequence] of round.packets.entries()) {
        await expect(metric(console, "Packet")).toHaveText(
          `${packetIndex + 1}/${round.packets.length}`,
        );
        await expect(metric(console, "Sequence")).toHaveText(String(sequence));
        await expect(metric(console, "Latency")).toHaveText(
          `0/${round.latencyBudget}`,
        );
        for (const [hopIndex, hop] of routes[stageIndex].entries()) {
          await game.getByRole("button", { name: hop, exact: true }).click();
          if (hop !== "Server")
            await expect(metric(console, "Latency")).toHaveText(
              `${hopIndex + 1}/${round.latencyBudget}`,
            );
        }
        delivered.add(sequence);
        let reassembled = 0;
        while (delivered.has(reassembled + 1)) reassembled += 1;
        await expect(metric(console, "Delivered")).toHaveText(
          `${delivered.size}/${round.packets.length}`,
        );
        await expect(metric(console, "Reassembled")).toHaveText(
          `${reassembled}/${round.packets.length}`,
        );
        if (packetIndex < round.packets.length - 1) {
          await expect(game.getByRole("status")).toHaveText(
            `Packet ${sequence} delivered. Reassembled in order: ${reassembled}. Route packet ${round.packets[packetIndex + 1]} next.`,
          );
        }
      }
      await expect(metric(console, "Packet")).toHaveText("done");
      await expect(metric(console, "Latency")).toHaveText(
        `${routes[stageIndex].length}/${round.latencyBudget}`,
      );
      if (stageIndex < NETWORK_ROUNDS.length - 1) {
        await expect(game.getByRole("status")).toHaveText(
          `Stage ${stageIndex + 1} complete. Moving to stage ${stageIndex + 2}.`,
        );
        expect(await completedGames(page)).toEqual([]);
        // Do not press Next Stage: this proves the real 1500ms auto-advance works.
        await expect(metric(console, "Stage")).toHaveText(
          `${stageIndex + 2}/${NETWORK_ROUNDS.length}`,
        );
      }
    }
    await expect(game.getByRole("status")).toHaveText(
      "All stages complete. The server reassembled 5 packets in order.",
    );
    await expect(metric(console, "Reassembled")).toHaveText("5/5");
    await expect(metric(console, "Sequence")).toHaveText("complete");
    await expect(metric(console, "Dropped")).toHaveText("0");
    await expectPersistedCompletion(page, "packet-routing");
  });
});
