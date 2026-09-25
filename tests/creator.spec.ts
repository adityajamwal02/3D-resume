import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const linkedinURL = "https://www.linkedin.com/in/adityajamwal02/";

for (const theme of ["light", "dark"] as const) {
  test(`content creation is accessible and responsive in ${theme} mode`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ colorScheme: theme });
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("./#content");
      await page.evaluate(() => document.fonts.ready);
      const section = page.locator("#content");
      await section.scrollIntoViewIfNeeded();
      await expect(section).toHaveAttribute("aria-labelledby", "creator-title");
      expect(
        await section.evaluate((element) => ({
          before: element.previousElementSibling?.id,
          after: element.nextElementSibling?.id,
        })),
      ).toEqual({ before: "mentorship", after: "contact" });
      await expect(section.locator(".creator-followers strong")).toHaveText(
        "85,000+",
      );
      await expect(section.locator(".creator-followers")).toContainText(
        "followers on LinkedIn",
      );
      await expect(section.locator(".creator-topics li")).toHaveText([
        "Technology",
        "Artificial intelligence",
        "Tech marketing",
      ]);
      await expect(section.locator(".creator-description")).toContainText(
        "engineer's perspective",
      );
      const connect = section.getByRole("link", {
        name: "Connect with me",
        exact: true,
      });
      await expect(connect).toHaveAttribute("href", linkedinURL);
      await expect(connect).toHaveAttribute("target", "_blank");
      await expect(connect).toHaveAttribute("rel", "noreferrer");
      await connect.focus();
      await expect(connect).toBeFocused();
      const collaborations = section.locator(".creator-collaborations");
      await expect(collaborations).toContainText(
        "Selected brand collaborations will be featured here soon.",
      );
      await expect(collaborations.locator("img, button, a")).toHaveCount(0);
      await expect(section.locator("iframe")).toHaveCount(0);
      for (const selector of [
        ".creator-copy",
        ".creator-community",
        ".creator-collaborations",
      ]) {
        const bounds = await section.locator(selector).boundingBox();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      }
      const copy = await section.locator(".creator-copy").boundingBox();
      const community = await section
        .locator(".creator-community")
        .boundingBox();
      if (width <= 900) {
        expect(copy!.y + copy!.height).toBeLessThanOrEqual(community!.y);
      } else {
        expect(copy!.x + copy!.width).toBeLessThanOrEqual(community!.x);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const results = await new AxeBuilder({ page })
        .include("#content")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
      await section.screenshot({
        path: testInfo.outputPath(`creator-${theme}-${width}.png`),
      });
    }
    await page.emulateMedia({ media: "print" });
    await expect(page.locator("#content")).toBeHidden();
    await expect(page.locator("#experience")).toBeVisible();
  });
}

test("content navigation tracks the section across the compact-menu boundary", async ({
  page,
}) => {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 844, height: 390 },
    { width: 900, height: 768 },
    { width: 901, height: 768 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("./");
    const navigation = page.getByRole("navigation", {
      name: "Main navigation",
    });
    if (viewport.width <= 900) {
      await expect(navigation).toBeHidden();
      await page
        .getByRole("button", { name: "Open menu", exact: true })
        .click();
    }
    await expect(navigation.getByRole("link")).toHaveCount(6);
    const content = navigation.getByRole("link", {
      name: "Content",
      exact: true,
    });
    await content.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#content$/);
    await expect(page.locator("#creator-title")).toBeInViewport();
    await expect(
      page.locator('.navigation a[href="#content"]'),
    ).toHaveAttribute("aria-current", "location");
    if (viewport.width <= 900) {
      await expect(navigation).toBeHidden();
      await expect(page.locator(".island-context")).toHaveText("Content");
    }
    const header = await page.locator(".dynamic-island").boundingBox();
    expect(header!.x).toBeGreaterThanOrEqual(0);
    expect(header!.x + header!.width).toBeLessThanOrEqual(viewport.width);
    expect(
      await page
        .locator(".dynamic-island")
        .evaluate((element) =>
          Number(
            (element as HTMLElement).style.getPropertyValue(
              "--reading-progress",
            ),
          ),
        ),
    ).toBeGreaterThan(0);
  }
});

test("creator connection opens the LinkedIn destination with keyboard activation", async ({
  page,
  context,
}) => {
  // Isolate third-party availability while verifying the actual outbound navigation.
  await context.route(linkedinURL, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>LinkedIn destination</title>",
    }),
  );
  await page.goto("./#content");
  const connect = page.locator("#content").getByRole("link", {
    name: "Connect with me",
    exact: true,
  });
  await connect.focus();
  const [destination] = await Promise.all([
    page.waitForEvent("popup"),
    page.keyboard.press("Enter"),
  ]);
  await expect(destination).toHaveURL(linkedinURL);
  await expect(destination).toHaveTitle("LinkedIn destination");
  await expect(page).toHaveURL(/#content$/);
  await destination.close();
});
