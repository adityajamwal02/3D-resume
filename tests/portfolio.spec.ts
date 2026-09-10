import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { PNG } from "pngjs";

async function configureContact(page: Page) {
  await page.route("**/contact-config.json", (route) =>
    route.fulfill({
      json: {
        serviceId: "test_service",
        templateId: "test_template",
        publicKey: "test_public_key",
      },
    }),
  );
}

async function fillContact(page: Page) {
  await page.getByLabel("Name", { exact: true }).fill("Test Visitor");
  await page
    .getByLabel("Your email", { exact: true })
    .fill("visitor@example.com");
  await page
    .getByLabel("Message", { exact: true })
    .fill("I would like to discuss a project opportunity.");
  await page.getByRole("checkbox").check();
}

test("portfolio content, navigation, skill filters, and professional links", async ({
  page,
  browserName,
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
  await expect(page.locator(".company-logo")).toHaveCount(3);
  for (const logo of await page.locator(".company-logo").all()) {
    await expect
      .poll(() =>
        logo.evaluate((image) => (image as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
    const bounds = await logo.boundingBox();
    expect(bounds!.height).toBe(32);
    expect(bounds!.width).toBeLessThanOrEqual(56);
  }
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
    page
      .locator(".hero-actions")
      .getByRole("link", { name: "LinkedIn", exact: true }),
  ).toHaveAttribute("href", "https://www.linkedin.com/in/adityajamwal02/");
  await expect(
    page.getByRole("link", { name: "GitHub", exact: true }),
  ).toHaveAttribute("href", "https://github.com/adityajamwal02");
  await expect(page.locator('a[href^="mailto:"], a[download]')).toHaveCount(0);
  await expect(page.getByRole("button", { name: /resume|print/i })).toHaveCount(
    0,
  );
  expect(await page.locator("body").innerHTML()).not.toContain("@gmail.com");
  const brokenAnchors = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) =>
      links
        .map((link) => link.getAttribute("href")!)
        .filter((href) => !document.querySelector(href)),
    );
  expect(brokenAnchors).toEqual([]);
  const restrictedWebGL =
    browserName === "firefox" &&
    errors.some((error) =>
      error.includes(
        "AllowWebgl2:false restricts context creation on this system.",
      ),
    );
  if (restrictedWebGL)
    await expect(page.locator(".scene-fallback")).toBeVisible();
  expect(
    errors.filter(
      (error) =>
        !(
          restrictedWebGL &&
          (error.includes(
            "AllowWebgl2:false restricts context creation on this system.",
          ) ||
            error ===
              "THREE.WebGLRenderer: THREE.WebGLRenderer: Error creating WebGL context.")
        ),
    ),
  ).toEqual([]);
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
    page.getByRole("heading", { name: "Get in touch." }),
  ).toBeInViewport();
});

test("contact form validates details and consent before sending", async ({
  page,
}) => {
  await configureContact(page);
  let requests = 0;
  await page.route("https://api.emailjs.com/**", async (route) => {
    requests++;
    await route.fulfill({ status: 200, body: "OK" });
  });
  await page.goto("./");
  const submit = page.getByRole("button", {
    name: "Send message",
    exact: true,
  });
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByLabel("Name", { exact: true })).toBeFocused();
  await fillContact(page);
  await page.getByLabel("Your email", { exact: true }).fill("invalid-email");
  await submit.click();
  await expect(page.getByLabel("Your email", { exact: true })).toBeFocused();
  await page
    .getByLabel("Your email", { exact: true })
    .fill("visitor@example.com");
  await page.getByRole("checkbox").uncheck();
  await submit.click();
  await expect(page.getByRole("checkbox")).toBeFocused();
  expect(requests).toBe(0);
});

test("contact form submits without exposing the recipient or duplicating requests", async ({
  page,
}) => {
  await configureContact(page);
  let requests = 0;
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("https://api.emailjs.com/**", async (route) => {
    requests++;
    expect(route.request().postDataJSON()).toEqual({
      service_id: "test_service",
      template_id: "test_template",
      user_id: "test_public_key",
      template_params: {
        from_name: "Test Visitor",
        reply_to: "visitor@example.com",
        message: "I would like to discuss a project opportunity.",
      },
    });
    await pending;
    await route.fulfill({ status: 200, body: "OK" });
  });
  await page.goto("./");
  await fillContact(page);
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Sending...", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("form", { name: "Get in touch", exact: true })
    .evaluate((form) => {
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });
  await expect.poll(() => requests).toBe(1);
  release();
  await expect(page.getByRole("status")).toContainText("Message submitted");
  await expect(page.getByLabel("Message", { exact: true })).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "Send message", exact: true }),
  ).toBeDisabled();
  expect(requests).toBe(1);
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
    page
      .locator(".island-shortcuts")
      .getByRole("link", { name: "LinkedIn", exact: true }),
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
      .locator(".island-shortcuts")
      .getByRole("link", { name: "LinkedIn", exact: true })
      .scrollIntoViewIfNeeded();
    await expect(
      page
        .locator(".island-shortcuts")
        .getByRole("link", { name: "LinkedIn", exact: true }),
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

test("contact form retains messages after service or network failures", async ({
  page,
}) => {
  await configureContact(page);
  for (const status of [400, 429, 500, 200, 0]) {
    await page.route("https://api.emailjs.com/**", (route) =>
      status === 0
        ? route.abort()
        : route.fulfill({ status, body: "Not accepted" }),
    );
    await page.goto("./");
    await fillContact(page);
    await page
      .getByRole("button", { name: "Send message", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText(
      "Submission could not be confirmed",
    );
    await expect(page.getByLabel("Message", { exact: true })).toHaveValue(
      "I would like to discuss a project opportunity.",
    );
    await expect(
      page.getByRole("button", { name: "Send message", exact: true }),
    ).toBeEnabled();
    await page.unroute("https://api.emailjs.com/**");
  }
});

test("contact form is accessible and fits desktop and mobile", async ({
  page,
}, testInfo) => {
  await configureContact(page);
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("./");
    await expect(
      page.getByRole("button", { name: "Send message", exact: true }),
    ).toBeEnabled();
    await page.locator("#contact-title").scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("heading", { name: "Get in touch." }),
    ).toBeInViewport();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const results = await new AxeBuilder({ page })
      .include("#contact")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      results.violations.map(({ id, nodes }) => ({
        id,
        targets: nodes.map(({ target }) => target),
      })),
    ).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath(`contact-${width}.png`),
    });
  }
});

test("contact form without configuration stays disabled and offers LinkedIn", async ({
  page,
}) => {
  await page.route("**/contact-config.json", (route) =>
    route.fulfill({ json: {} }),
  );
  await page.goto("./");
  await expect(page.getByRole("status")).toContainText(
    "contact form is currently unavailable",
  );
  await expect(
    page.getByRole("button", { name: "Send message", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("link", { name: "Get in touch on LinkedIn" }),
  ).toHaveAttribute("href", "https://www.linkedin.com/in/adityajamwal02/");
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
