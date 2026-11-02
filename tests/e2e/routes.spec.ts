import { expect, test } from "@playwright/test";

test("Binary Builder has its own directly loadable game URL", async ({
  page,
}) => {
  await page.goto("/games/binary-builder");
  await expect(
    page.getByRole("heading", { level: 1, name: "Binary Builder" }),
  ).toBeVisible();
  await expect(page).toHaveTitle("Binary Builder | Mr. Mata Learning Hub");
  await page.reload();
  await expect(
    page.getByRole("heading", { level: 1, name: "Binary Builder" }),
  ).toBeVisible();
});
