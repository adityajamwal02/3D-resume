import { test, expect } from "@playwright/test";

test("logo-free navigation evenly spaces all six sections across responsive views", async ({
  page,
}) => {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 667, height: 375 },
    { width: 768, height: 1024 },
    { width: 900, height: 768 },
    { width: 901, height: 768 },
    { width: 1024, height: 768 },
    { width: 1440, height: 1000 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("./#content");
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveTitle("Aritte Jamwal Website");
    const header = page.locator(".dynamic-island");
    await expect(header.locator("img, .wordmark, .island-divider")).toHaveCount(
      0,
    );
    await expect(page.locator(".site-footer .brand-mark")).toHaveCount(1);
    await expect(
      header.getByRole("button", { name: /Switch to (light|dark) mode/ }),
    ).toBeVisible();
    const navigation = header.getByRole("navigation", {
      name: "Main navigation",
    });
    if (viewport.width <= 900) {
      await expect(navigation).toBeHidden();
      await header
        .getByRole("button", { name: "Open menu", exact: true })
        .click();
    }
    const links = navigation.getByRole("link");
    await expect(links).toHaveText([
      "Experience",
      "Work",
      "Expertise",
      "Mentorship",
      "Content",
      "Contact",
    ]);
    const bounds = await links.evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          overflow: element.scrollWidth > element.clientWidth,
        };
      }),
    );
    for (const item of bounds) {
      expect(item.left).toBeGreaterThanOrEqual(0);
      expect(item.right).toBeLessThanOrEqual(viewport.width);
      expect(Math.abs(item.width - bounds[0].width)).toBeLessThan(1);
      expect(item.overflow).toBe(false);
    }
    for (let index = 1; index < bounds.length; index++) {
      if (viewport.width > 900) {
        expect(Math.abs(bounds[index].top - bounds[0].top)).toBeLessThan(1);
        expect(
          Math.abs(bounds[index].left - bounds[index - 1].right - 6),
        ).toBeLessThan(1);
      } else {
        expect(bounds[index].top).toBeGreaterThanOrEqual(
          bounds[index - 1].bottom,
        );
      }
    }
    const headerBounds = (await header.boundingBox())!;
    expect(headerBounds.y + headerBounds.height).toBeLessThanOrEqual(
      viewport.height,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (viewport.width <= 900) {
      await page.keyboard.press("Escape");
      await expect(
        header.getByRole("button", { name: "Open menu", exact: true }),
      ).toBeFocused();
    }
  }
});

test("requested tab title survives navigation, theme changes, and reload", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("./#content");
  await expect(page).toHaveTitle("Aritte Jamwal Website");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Work", exact: true })
    .click();
  await expect(page.locator("#work-title")).toBeInViewport();
  await page.reload();
  await expect(page).toHaveTitle("Aritte Jamwal Website");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "AdityaJamwal.",
  );
});
