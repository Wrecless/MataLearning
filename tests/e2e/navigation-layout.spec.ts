import { expect, test } from "@playwright/test";

test("desktop game navigation stays visible while browsing the library", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.getByRole("link", { name: /Browse all \d+ games/ }).click();
  await expect(
    page.getByRole("heading", { name: "Choose a game" }),
  ).toBeVisible();
  await expect
    .poll(
      async () =>
        (await page.getByRole("complementary").boundingBox())?.y ?? -1,
    )
    .toBeGreaterThanOrEqual(10);
  const home = page
    .getByRole("navigation", { name: "Games" })
    .getByRole("link", { name: "Home", exact: true });
  const bounds = await home.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(1000);
});
