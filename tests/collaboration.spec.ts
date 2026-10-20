import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const titles = [
  "Sponsored post",
  "Custom carousel",
  "Two-post campaign",
  "On-camera walkthrough",
];
const labels = [
  "IMAGE OR VIDEO",
  "VISUAL STORYTELLING",
  "CONNECTED CONTENT",
  "FACE-TO-CAMERA VIDEO",
];
const linkedinURL = "https://www.linkedin.com/in/adityajamwal02/";

for (const theme of ["light", "dark"] as const) {
  test(`collaboration formats have no pricing and stay accessible in ${theme} mode`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ colorScheme: theme });
    for (const width of [320, 390, 768, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("./#content");
      await page.evaluate(() => document.fonts.ready);
      const formats = page.getByRole("region", {
        name: "Your story. The right format.",
      });
      await formats.scrollIntoViewIfNeeded();
      await expect(formats.locator(".collaboration-format")).toHaveCount(4);
      await expect(formats.getByRole("heading", { level: 4 })).toHaveText(
        titles,
      );
      await expect(
        formats.locator(".collaboration-format-topline > span:first-child"),
      ).toHaveText(labels);
      await expect(formats).toContainText("two sponsored LinkedIn posts");
      await expect(formats).toContainText("personalized technical walkthrough");
      await expect(formats).toContainText("brand-supplied or custom assets");
      await expect(formats).not.toContainText(
        /[$₹€£]|\b(?:price|pricing|399|799|999|book now|weekly|polling)\b/i,
      );
      await expect(formats.locator("form,input,iframe,button")).toHaveCount(0);
      expect(
        await formats.evaluate((element) =>
          element.previousElementSibling?.classList.contains(
            "creator-collaborations",
          ),
        ),
      ).toBe(true);
      const cards = await formats
        .locator(".collaboration-format")
        .evaluateAll((elements) =>
          elements.map((element) => {
            const bounds = element.getBoundingClientRect();
            const heading = element.querySelector("h4")!;
            return {
              x: bounds.x,
              right: bounds.right,
              top: bounds.top,
              bottom: bounds.bottom,
              font: getComputedStyle(heading).fontFamily,
              overflows: element.scrollWidth > element.clientWidth,
            };
          }),
        );
      for (const card of cards) {
        expect(card.x).toBeGreaterThanOrEqual(0);
        expect(card.right).toBeLessThanOrEqual(width);
        expect(card.overflows).toBe(false);
        expect(card.font).toContain("Google Sans");
      }
      if (width <= 700) {
        expect(cards[1].top).toBeGreaterThanOrEqual(cards[0].bottom);
      } else {
        expect(cards[1].top).toBe(cards[0].top);
        expect(cards[1].x).toBeGreaterThanOrEqual(cards[0].right);
        expect(cards[2].top).toBeGreaterThanOrEqual(cards[0].bottom);
      }
      const discuss = formats.getByRole("link", {
        name: "Discuss a collaboration",
      });
      await expect(discuss).toHaveAttribute("href", linkedinURL);
      await expect(discuss).toHaveAttribute("target", "_blank");
      await expect(discuss).toHaveAttribute("rel", "noreferrer");
      await discuss.focus();
      await expect(discuss).toBeFocused();
      const accessibility = await new AxeBuilder({ page })
        .include(".collaboration-formats")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(accessibility.violations).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await formats.screenshot({
        path: testInfo.outputPath(`collaboration-${theme}-${width}.png`),
      });
    }
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".collaboration-formats")).toBeHidden();
  });
}

test("collaboration inquiry opens only the professional profile and sends no form data", async ({
  page,
  context,
}) => {
  const profileRequests: { method: string; body: string | null }[] = [];
  await context.route(linkedinURL, async (route) => {
    profileRequests.push({
      method: route.request().method(),
      body: route.request().postData(),
    });
    await route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>LinkedIn inquiry</title>",
    });
  });
  await page.goto("./#content");
  expect(profileRequests).toEqual([]);
  await page.getByRole("link", { name: "Discuss a collaboration" }).focus();
  const [popup] = await Promise.all([
    page.waitForEvent("popup"),
    page.keyboard.press("Enter"),
  ]);
  await expect(popup).toHaveURL(linkedinURL);
  await expect(popup).toHaveTitle("LinkedIn inquiry");
  expect(await popup.evaluate(() => window.opener === null)).toBe(true);
  expect(profileRequests).toEqual([{ method: "GET", body: null }]);
  await expect(page).toHaveURL(/#content$/);
  await popup.close();
});
