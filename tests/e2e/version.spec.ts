import { expect, test } from "@playwright/test";
import packageInfo from "../../package.json" with { type: "json" };

const packageVersion = packageInfo.version;

for (const path of ["/", "/games/binary-builder"]) {
  test(`website version is visible at ${path}`, async ({ page }) => {
    await page.goto(path);
    const version = page.getByText(`V${packageVersion.replace(/\.0$/, "")}`, {
      exact: true,
    });
    await expect(version).toBeVisible();
    await expect(version).toHaveAttribute(
      "aria-label",
      `Website version ${packageVersion}`,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}
