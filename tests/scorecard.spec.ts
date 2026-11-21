import { expect, test } from "@playwright/test";

for (const [width, theme] of [
  [320, "dark"],
  [768, "light"],
  [1440, "dark"],
] as const) {
  test(`free scorecard round trip at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: theme });
    await page.goto("./#session-guide");
    await page.getByRole("link", { name: "Try the free scorecard" }).click();
    await expect(page).toHaveURL(/\/dsa-scorecard\.html$/);
    const correctness = page.getByRole("group", { name: "Correctness" });
    await correctness.getByRole("radio", { name: "1", exact: true }).check();
    await correctness
      .getByRole("textbox")
      .fill("Caught the repeated index after a prompt.");
    await page.getByText("See a worked example").click();
    await expect(page.getByText("Correctness: 1/2.")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({ path: testInfo.outputPath("worksheet.png") });
    await page.emulateMedia({ media: "print" });
    await expect(
      correctness
        .getByText("Caught the repeated index after a prompt.", { exact: true })
        .last(),
    ).toBeVisible();
    const pdf = await page.pdf({ format: "A4" });
    expect(pdf.toString("latin1").match(/\/Type\s*\/Page\b/g)).toHaveLength(1);
    await page.emulateMedia({ media: "screen" });
    await page.getByRole("link", { name: "Back to mentorship" }).click();
    await expect(page.locator("#free-scorecard")).toBeInViewport();
  });
}
