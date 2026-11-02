import { expect, test } from "@playwright/test";
import { CHALLENGES_PER_LEVEL } from "../../src/utils/binary";

const key = "mata-hub:completed-games";

test("progress follows cross-tab updates and clearing storage", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Launch Binary Builder" }),
  ).toBeVisible();
  const otherTab = await context.newPage();
  await otherTab.goto("/");
  await otherTab.evaluate(
    (storageKey) =>
      localStorage.setItem(storageKey, JSON.stringify(["binary"])),
    key,
  );
  await expect(page.getByText("1/9 completed")).toBeVisible();
  await otherTab.evaluate(() => localStorage.clear());
  await expect(page.getByText("1/9 completed")).toHaveCount(0);
});

test("readable storage with quota-denied writes still tracks completion in memory", async ({
  page,
  isMobile,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript((storageKey) => {
    localStorage.setItem(storageKey, "[]");
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage full", "QuotaExceededError");
    };
  }, key);
  await page.goto("/games/binary-builder");
  await expect(
    page.getByRole("heading", { name: "Binary Builder", exact: true }),
  ).toBeVisible();
  for (let challenge = 0; challenge < CHALLENGES_PER_LEVEL; challenge += 1) {
    await page.getByRole("button", { name: "Hint", exact: true }).click();
    await page.getByRole("button", { name: "Check", exact: true }).click();
  }
  await expect(page.getByRole("status")).toHaveText(
    "Level 1 complete. Level 2 unlocks larger targets.",
  );
  expect(
    await page.evaluate((storageKey) => localStorage.getItem(storageKey), key),
  ).toBe("[]");
  if (isMobile)
    await page.getByRole("button", { name: "Toggle games menu" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Home", exact: true })
    .click();
  await expect(page.getByText("1/9 completed")).toBeVisible();
  expect(errors).toEqual([]);
});
