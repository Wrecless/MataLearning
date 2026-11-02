import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test("homepage hydrates without errors when reduced motion is requested", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Welcome to Mr. Mata Learning Hub" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Launch Binary Builder" }).focus();
  await expect(
    page.getByRole("link", { name: "Launch Binary Builder" }),
  ).toBeFocused();
  // Allow hydration and the demo's first scheduled animation tick to surface errors.
  await page.waitForTimeout(1200);
  expect(errors).toEqual([]);
});
