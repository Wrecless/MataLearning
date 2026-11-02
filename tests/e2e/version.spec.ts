import { expect, test } from "@playwright/test";

for (const path of ["/", "/games/binary-builder"]) {
  test(`website version is visible at ${path}`, async ({ page }) => {
    await page.goto(path);
    const version = page.getByText("V0.12", { exact: true });
    await expect(version).toBeVisible();
    await expect(version).toHaveAttribute(
      "aria-label",
      "Website version 0.12.0",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}
