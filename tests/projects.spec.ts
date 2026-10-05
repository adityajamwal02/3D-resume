import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { PNG } from "pngjs";

function borderPixelDifference(before: Buffer, after: Buffer) {
  const first = PNG.sync.read(before);
  const second = PNG.sync.read(after);
  expect([first.width, first.height]).toEqual([second.width, second.height]);
  let difference = 0;
  let samples = 0;
  for (let y = 0; y < first.height; y++) {
    for (let x = 0; x < first.width; x++) {
      if (x >= 10 && x < first.width - 10 && y >= 10 && y < first.height - 10)
        continue;
      const offset = (y * first.width + x) * 4;
      for (let channel = 0; channel < 3; channel++) {
        difference += Math.abs(
          first.data[offset + channel] - second.data[offset + channel],
        );
        samples++;
      }
    }
  }
  return difference / samples;
}

for (const theme of ["light", "dark"] as const) {
  test(`project glow matches the ${theme} palette without changing card layout or accessibility`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ colorScheme: theme });
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 1100 });
      await page.goto("./#work");
      await page.evaluate(() => document.fonts.ready);
      const projects = page.locator("#work article.project");
      await expect(projects).toHaveCount(2);
      await expect(page.locator(".border-glow-card")).toHaveCount(2);
      await expect(
        projects.nth(0).getByRole("heading", { name: /HashImagin/ }),
      ).toBeVisible();
      await expect(
        projects.nth(1).getByRole("heading", { name: /Multi-Agentic System/ }),
      ).toBeVisible();
      for (const project of await projects.all()) {
        await project.scrollIntoViewIfNeeded();
        await expect(project.locator(".edge-light")).toHaveAttribute(
          "aria-hidden",
          "true",
        );
        await expect(project.locator(".edge-light")).toHaveCSS(
          "pointer-events",
          "none",
        );
        await expect(project.locator(".edge-light")).toHaveCSS(
          "opacity",
          "0.65",
        );
        await expect(project.locator(".edge-light")).toHaveCSS(
          "mask-image",
          "none",
        );
        await expect(project.locator(".border-glow-inner")).toHaveCSS(
          "overflow",
          "hidden",
        );
        expect(
          await project.evaluate((element) =>
            getComputedStyle(element).getPropertyValue("--glow-primary").trim(),
          ),
        ).toBe(theme === "dark" ? "#36d9b6" : "#087b68");
        const bounds = await project.boundingBox();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
        expect(
          await project
            .locator(".project-content")
            .evaluate((element) => element.scrollWidth <= element.clientWidth),
        ).toBe(true);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const results = await new AxeBuilder({ page })
        .include("#work")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
      await projects.first().screenshot({
        path: testInfo.outputPath(`project-glow-${theme}-${width}.png`),
      });
    }
  });

  test(`project glow follows the pointer and visibly lights the border in ${theme} mode`, async ({
    page,
  }) => {
    await page.emulateMedia({
      colorScheme: theme,
      reducedMotion: "no-preference",
    });
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto("./#work");
    for (const project of await page.locator(".border-glow-card").all()) {
      await project.scrollIntoViewIfNeeded();
      await project.hover();
      const edge = project.locator(".edge-light");
      const proximity = () =>
        project.evaluate((element) =>
          Number(
            getComputedStyle(element).getPropertyValue("--edge-proximity"),
          ),
        );
      await expect.poll(proximity).toBeLessThan(5);
      const center = await project.screenshot();
      const bounds = (await project.boundingBox())!;
      await page.mouse.move(
        bounds.x + bounds.width - 2,
        bounds.y + bounds.height / 2,
      );
      await expect.poll(proximity).toBeGreaterThan(95);
      await expect
        .poll(() =>
          edge.evaluate((element) => Number(getComputedStyle(element).opacity)),
        )
        .toBeGreaterThan(0.9);
      expect(
        await project.evaluate((element) =>
          Number.parseFloat(element.style.getPropertyValue("--cursor-angle")),
        ),
      ).toBeCloseTo(90, 0);
      const lit = await project.screenshot();
      expect(borderPixelDifference(center, lit)).toBeGreaterThan(0.5);
      await page.mouse.move(0, 0);
      await expect(edge).toHaveCSS("opacity", "0");
      await expect.poll(proximity).toBe(0);
    }
  });
}

test("project glow follows live theme changes and stops tracking for reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({
    colorScheme: "dark",
    reducedMotion: "no-preference",
  });
  await page.goto("./#work");
  const project = page.locator(".border-glow-card").first();
  await project.scrollIntoViewIfNeeded();
  await project.hover({ position: { x: 2, y: 100 } });
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  expect(
    await project.evaluate((element) =>
      getComputedStyle(element).getPropertyValue("--glow-rgb").trim(),
    ),
  ).toBe("8 123 104");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await project.hover({ position: { x: 2, y: 100 } });
  const style = await project.getAttribute("style");
  await project.hover({ position: { x: 100, y: 200 } });
  expect(await project.getAttribute("style")).toBe(style);
  await expect(project.locator(".edge-light")).toHaveCSS("mask-image", "none");
  await expect(project.locator(".edge-light")).toHaveCSS("opacity", "0.65");
});

test("project glow preserves keyboard links and removes decoration from print", async ({
  page,
  context,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await context.route("https://github.com/adityajamwal02", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>GitHub profile destination</title>",
    }),
  );
  await page.goto("./#work");
  await page.mouse.move(0, 0);
  const projects = page.locator(".border-glow-card");
  const github = projects.first().getByRole("link", { name: "GitHub profile" });
  await github.focus();
  await expect(projects.first().locator(".edge-light")).toHaveCSS(
    "opacity",
    "1",
  );
  await expect(projects.first().locator(".edge-light")).toHaveCSS(
    "mask-image",
    "none",
  );
  const [popup] = await Promise.all([
    page.waitForEvent("popup"),
    page.keyboard.press("Enter"),
  ]);
  await expect(popup).toHaveURL("https://github.com/adityajamwal02");
  await popup.close();
  const collaboration = projects
    .nth(1)
    .getByRole("link", { name: "Explore collaborations" });
  await collaboration.focus();
  await expect(projects.nth(1).locator(".edge-light")).toHaveCSS(
    "opacity",
    "1",
  );
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#content$/);
  await expect(page.locator("#creator-title")).toBeInViewport();
  await page.emulateMedia({ media: "print" });
  for (const project of await projects.all()) {
    await expect(project).toBeVisible();
    await expect(project.locator(".edge-light")).toBeHidden();
  }
});

test("touch project cards use a static glow without intercepting gestures", async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  try {
    await page.goto(process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4173");
    const project = page.locator(".border-glow-card").first();
    await project.scrollIntoViewIfNeeded();
    await expect(project.locator(".edge-light")).toHaveCSS("opacity", "0.65");
    await project.dispatchEvent("pointermove", {
      pointerType: "touch",
      clientX: 10,
      clientY: 100,
    });
    expect(await project.getAttribute("style")).toBeNull();
    await project.dispatchEvent("pointercancel", { pointerType: "touch" });
    await expect(project.locator(".edge-light")).toHaveCSS(
      "pointer-events",
      "none",
    );
    await expect(
      project.getByRole("link", { name: "GitHub profile" }),
    ).toHaveAttribute("href", "https://github.com/adityajamwal02");
  } finally {
    await context.close();
  }
});
