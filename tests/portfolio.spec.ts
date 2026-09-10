import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { PNG } from "pngjs";

test("resume content, navigation, skill filters, and professional links", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("./");
  await expect(page).toHaveTitle("Aditya Jamwal | Software Engineer");
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page
      .locator("body")
      .evaluate((element) => getComputedStyle(element).fontFamily),
  ).toContain("Google Sans");
  expect(
    await page.evaluate(() => document.fonts.check('16px "Google Sans"')),
  ).toBe(true);
  await expect(page.locator(".brand-mark")).toHaveCount(2);
  for (const logo of await page.locator(".brand-mark").all()) {
    await expect
      .poll(() =>
        logo.evaluate((image) => (image as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
  }
  await expect(page.locator(".job")).toHaveCount(3);
  const cisco = page.locator(".job").filter({
    has: page.getByRole("heading", {
      name: "Cisco Software Engineer",
      exact: true,
    }),
  });
  await expect(cisco).toHaveCount(1);
  await expect(cisco.locator("li")).toHaveCount(6);
  await expect(cisco).toContainText("FEB – JUN 2024 · AUG 2024 – JAN 2026");
  await expect(cisco).toContainText("37%");
  await expect(cisco).toContainText("25% less time");
  await expect(
    page.getByRole("heading", {
      name: "Cisco Software Engineer Intern",
      exact: true,
    }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Explore my journey" }).click();
  await expect(page).toHaveURL(/#experience$/);
  await expect(
    page.getByRole("heading", {
      name: "Microsoft Software Engineer",
      exact: true,
    }),
  ).toBeInViewport();
  await page.getByRole("button", { name: "02 Cloud & platforms" }).click();
  await expect(page.locator(".skill-panel")).toContainText("Azure");
  await page.getByRole("button", { name: "03 AI & development" }).click();
  await expect(page.locator(".skill-panel")).toContainText("Agentic AI");
  await expect(
    page.getByRole("link", { name: "LinkedIn", exact: true }),
  ).toHaveAttribute("href", "https://www.linkedin.com/in/adityajamwal02/");
  await expect(
    page.getByRole("link", { name: "GitHub", exact: true }),
  ).toHaveAttribute("href", "https://github.com/adityajamwal02");
  await expect(
    page.getByRole("link", { name: "aditya.vicky01@gmail.com", exact: true }),
  ).toHaveAttribute("href", "mailto:aditya.vicky01@gmail.com");
  const brokenAnchors = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) =>
      links
        .map((link) => link.getAttribute("href")!)
        .filter((href) => !document.querySelector(href)),
    );
  expect(brokenAnchors).toEqual([]);
  expect(errors).toEqual([]);
});

test("Topmate mentorship links and mobile navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Mentorship", exact: true })
    .click();
  await expect(page).toHaveURL(/#mentorship$/);
  await expect(page.locator("#mentorship-title")).toBeInViewport();
  await page.locator(".mentor-portrait").scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator(".mentor-portrait")
        .evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  await expect(
    page.getByRole("button", { name: "Open menu", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Book 1:1 mentorship", exact: true }),
  ).toHaveAttribute("href", "https://topmate.io/adityajamwal/1828897");
  const destinations = await page
    .locator(".mentorship-service")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(destinations).toEqual([
    "https://topmate.io/adityajamwal/1828897",
    "https://topmate.io/adityajamwal/1552849",
    "https://topmate.io/adityajamwal/1552120",
    "https://topmate.io/adityajamwal/1553022",
  ]);
  await expect(
    page.getByRole("link", { name: "Send a priority DM" }),
  ).toHaveAttribute("href", "https://topmate.io/adityajamwal/1551326/pay");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("#mentorship")).toBeHidden();
});

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 1920, height: 1080 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 375, height: 667 },
  { width: 320, height: 740 },
]) {
  test(`responsive layout and nonblank canvas at ${viewport.width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto("./");
    await expect(page.locator(".scene-ready canvas")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
    const dimensions = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      viewport: innerWidth,
    }));
    expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport);
    const screenshot = await page.locator("canvas").screenshot();
    const pixels = PNG.sync.read(screenshot);
    let bright = 0;
    for (let pixel = 0; pixel < pixels.data.length; pixel += 4) {
      if (pixels.data[pixel + 1] > 70 && pixels.data[pixel + 3] > 0) bright++;
    }
    expect(bright / (pixels.width * pixels.height)).toBeGreaterThan(0.01);
    const portrait = page.locator("#mentorship img");
    await portrait.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        portrait.evaluate((image) => (image as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: testInfo.outputPath(`portfolio-${viewport.width}.png`),
      fullPage: true,
    });
    const overlap = await page.evaluate(() => {
      const content = document
        .querySelector(".hero-actions")!
        .getBoundingClientRect();
      const controls = document
        .querySelector(".scene-controls")!
        .getBoundingClientRect();
      return (
        content.left < controls.right &&
        content.right > controls.left &&
        content.top < controls.bottom &&
        content.bottom > controls.top
      );
    });
    expect(overlap).toBe(false);
  });
}

test("scene selection, reduced motion, rotation, reset, and animation", async ({
  page,
}) => {
  await page.goto("./");
  const canvas = page.locator("canvas");
  await expect(
    page.getByRole("button", { name: "Play animation" }),
  ).toBeVisible();
  const initial = await canvas.screenshot();
  await page.getByRole("button", { name: "Assemble layers" }).click();
  expect((await canvas.screenshot()).equals(initial)).toBe(false);
  await page.getByRole("button", { name: "Explode layers" }).click();
  await page.getByRole("button", { name: "Rotate right", exact: true }).click();
  expect((await canvas.screenshot()).equals(initial)).toBe(false);
  await page.getByRole("button", { name: "Intelligence", exact: true }).click();
  await expect(page.locator(".scene-caption")).toContainText(
    "APPLIED INTELLIGENCE",
  );
  await page.getByRole("button", { name: "Reset view" }).click();
  await expect(
    page.getByRole("button", { name: "Cloud", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const paused = await canvas.screenshot();
  expect((await canvas.screenshot()).equals(paused)).toBe(true);
  await page.getByRole("button", { name: "Play animation" }).click();
  await expect(
    page.getByRole("button", { name: "Pause animation" }),
  ).toBeVisible();
  const moving = await canvas.screenshot();
  await expect
    .poll(async () => (await canvas.screenshot()).equals(moving))
    .toBe(false);
  await page.getByRole("button", { name: "Pause animation" }).click();
});

test("sculpture cursor interaction and ambient motion honor pause", async ({
  page,
}) => {
  const pixelDifference = (before: Buffer, after: Buffer) => {
    const first = PNG.sync.read(before);
    const second = PNG.sync.read(after);
    expect([first.width, first.height]).toEqual([second.width, second.height]);
    let difference = 0;
    for (let index = 0; index < first.data.length; index++)
      difference += Math.abs(first.data[index] - second.data[index]);
    return difference / first.data.length;
  };
  await page.goto("./");
  const canvas = page.locator("canvas");
  await expect(
    page.getByRole("button", { name: "Play animation" }),
  ).toBeVisible();
  const still = await canvas.screenshot();
  await page.mouse.move(1200, 260);
  expect(pixelDifference(still, await canvas.screenshot())).toBeLessThan(1);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(
    page.getByRole("button", { name: "Pause animation" }),
  ).toBeVisible();
  await expect(page.locator(".hero")).toHaveAttribute("data-motion", "running");
  expect(
    await page
      .locator(".hero")
      .evaluate(
        (element) => getComputedStyle(element, "::before").animationPlayState,
      ),
  ).toBe("running");
  await page.mouse.move(200, 600);
  const moving = await canvas.screenshot();
  await page.mouse.move(1200, 220);
  await expect
    .poll(async () => (await canvas.screenshot()).equals(moving))
    .toBe(false);
  await page.getByRole("button", { name: "Pause animation" }).click();
  expect(
    await page
      .locator(".hero")
      .evaluate(
        (element) => getComputedStyle(element, "::before").animationPlayState,
      ),
  ).toBe("paused");
  await page.mouse.move(1200, 260);
  const frozen = await canvas.screenshot();
  await page.mouse.move(100, 400);
  expect(pixelDifference(frozen, await canvas.screenshot())).toBeLessThan(1);
});

test("mobile menu, keyboard navigation, and accessible controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(
    page.getByRole("button", { name: "Close menu" }),
  ).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Contact" })
    .click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.getByRole("navigation")).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "Let’s build something that matters." }),
  ).toBeInViewport();
});

test("email copy and resume print action", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./");
  await page.getByRole("button", { name: "Copy email", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Email copied" }),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "aditya.vicky01@gmail.com",
  );
  await page.evaluate(() => {
    window.print = () => {
      document.body.dataset.printRequested = "true";
    };
  });
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await expect(page.locator("body")).toHaveAttribute(
    "data-print-requested",
    "true",
  );
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".systems-scene")).toBeHidden();
  await expect(page.locator(".job").first()).toBeVisible();
  await expect(page.locator(".print-skills")).toContainText("Agentic AI");
  await expect(page.locator(".print-skills")).toContainText("C++");
});

test("WebGL failure leaves content and discipline selection available", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      if (type.startsWith("webgl")) return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto("./");
  await expect(page.locator(".scene-fallback")).toBeVisible();
  await expect(page.locator(".job")).toHaveCount(3);
  await page.getByRole("button", { name: "Systems", exact: true }).click();
  await expect(page.locator(".scene-caption")).toContainText(
    "DISTRIBUTED SYSTEMS",
  );
});

test("dynamic island tracks sections and exposes quick actions", async ({
  page,
}) => {
  await page.goto("./");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Expertise" })
    .click();
  await expect(
    page.getByRole("navigation").getByRole("link", { name: "Expertise" }),
  ).toHaveAttribute("aria-current", "location");
  expect(
    await page
      .locator(".dynamic-island")
      .evaluate((element) =>
        Number(
          (element as HTMLElement).style.getPropertyValue("--reading-progress"),
        ),
      ),
  ).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(
    page.getByRole("button", { name: "Print resume" }),
  ).toBeVisible();
  await expect(
    page.locator(".island-actions").getByRole("link", { name: "GitHub" }),
  ).toHaveAttribute("href", "https://github.com/adityajamwal02");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  expect(
    await page
      .locator("html")
      .evaluate((element) => getComputedStyle(element).scrollBehavior),
  ).toBe("smooth");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page
      .locator("html")
      .evaluate((element) => getComputedStyle(element).scrollBehavior),
  ).toBe("auto");
});

test("desktop and mobile WCAG accessibility checks", async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("./");
    await expect(page.locator(".scene-ready")).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      results.violations.map(({ id, nodes }) => ({
        id,
        nodes: nodes.map(({ target, failureSummary }) => ({
          target,
          failureSummary,
        })),
      })),
    ).toEqual([]);
  }
});

test("short-screen menus stay reachable without overlapping shortcuts", async ({
  page,
}) => {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 667, height: 375 },
    { width: 844, height: 390 },
    { width: 1024, height: 768 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("./");
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    const header = await page.locator(".dynamic-island").boundingBox();
    expect(header!.y + header!.height).toBeLessThanOrEqual(viewport.height);
    const overlap = await page.evaluate(() => {
      const navigation = document
        .querySelector(".navigation")!
        .getBoundingClientRect();
      const shortcuts = document
        .querySelector(".island-actions")!
        .getBoundingClientRect();
      const identity = document
        .querySelector(".island-identity")!
        .getBoundingClientRect();
      return (
        navigation.bottom > identity.top && navigation.top < shortcuts.bottom
      );
    });
    expect(overlap).toBe(false);
    await page
      .getByRole("button", { name: "Print resume", exact: true })
      .scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("button", { name: "Print resume", exact: true }),
    ).toBeInViewport();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "Open menu", exact: true }),
    ).toBeFocused();
  }
});

test("cross-browser navigation, assets, and expanded-menu accessibility", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`);
  });
  page.on("requestfailed", (request) =>
    errors.push(`${request.failure()?.errorText} ${request.url()}`),
  );
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    const response = await page.goto("./");
    expect([200, 304]).toContain(response?.status());
    await page.evaluate(() => document.fonts.ready);
    for (const id of [
      "experience",
      "work",
      "expertise",
      "mentorship",
      "contact",
    ]) {
      const navigation = page.getByRole("navigation", {
        name: "Main navigation",
      });
      if (!(await navigation.isVisible()))
        await page
          .getByRole("button", { name: "Open menu", exact: true })
          .click();
      await navigation.locator(`a[href="#${id}"]`).click();
      await expect(page.locator(`#${id} h2`)).toBeInViewport();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.locator(".mentor-portrait").scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page
          .locator(".mentor-portrait")
          .evaluate((image) => (image as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
    await page.getByRole("button", { name: "03 AI & development" }).click();
    await expect(page.locator(".skill-panel")).toContainText("Agentic AI");
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      results.violations.map((violation) => ({
        id: violation.id,
        targets: violation.nodes.map((node) => node.target),
      })),
    ).toEqual([]);
    await page.keyboard.press("Escape");
    await page
      .getByRole("link", { name: "Back to top", exact: true })
      .first()
      .click();
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  }
  expect(errors).toEqual([]);
});

test("clipboard denial keeps email contact usable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new DOMException("Denied", "NotAllowedError");
        },
      },
    });
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Copy email", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Clipboard unavailable");
  await expect(page.locator(".email-link")).toHaveAttribute(
    "href",
    "mailto:aditya.vicky01@gmail.com",
  );
});

test("failed 3D download leaves resume and mentorship available", async ({
  page,
}) => {
  await page.route(/createSculptureScene.*\.js/, (route) => route.abort());
  await page.goto("./");
  await expect(page.locator(".scene-fallback")).toBeVisible();
  await expect(page.locator(".job")).toHaveCount(3);
  await page.getByRole("link", { name: "Explore my journey" }).click();
  await expect(page.locator("#experience-title")).toBeInViewport();
  await expect(
    page.getByRole("link", { name: "Book 1:1 mentorship", exact: true }),
  ).toHaveAttribute("href", "https://topmate.io/adityajamwal/1828897");
});
