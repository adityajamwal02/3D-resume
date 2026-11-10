import { test, expect, type Page, type Route } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const production = "https://adityajamwal02.github.io/3D-resume/";
const badge =
  "https://hits.sh/adityajamwal02.github.io/3D-resume.svg?label=Profile%20views&style=flat-square&color=transparent&labelColor=transparent";
const statistics = "https://hits.sh/adityajamwal02.github.io/3D-resume/";

test.afterEach(async ({ page, context }) => {
  await page.unrouteAll({ behavior: "wait" });
  await context.unrouteAll({ behavior: "wait" });
});

function badgeBody(count = 1234) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="136" height="20"><text x="5" y="14" font-family="Verdana,sans-serif" font-size="11" fill="white">Profile views: ${count}</text></svg>`;
}

async function serveProduction(page: Page, baseURL: string, automated = false) {
  if (new URL(baseURL).href !== production) {
    await page.route(`${production}**`, async (route) => {
      const resource = route.request().url().slice(production.length);
      const response = await page.request.get(new URL(resource, baseURL).href);
      await route.fulfill({ response });
    });
  }
  if (!automated) {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });
  }
}

test("visits count once per page load, never on theme changes or section navigation", async ({
  page,
  context,
  baseURL,
}) => {
  let count = 0;
  const requests: string[] = [];
  await context.route("https://hits.sh/**", async (route) => {
    expect(route.request().url()).toBe(badge);
    expect(route.request().headers().referer).toBeUndefined();
    requests.push(route.request().url());
    await route.fulfill({
      contentType: "image/svg+xml",
      headers: { "cache-control": "no-store" },
      body: badgeBody(++count),
    });
  });
  await serveProduction(page, baseURL!);
  await page.goto(`${production}?private-query=not-sent#experience`);
  const counter = page.locator(".visit-counter");
  await expect(counter).toHaveAttribute("data-counter-state", "ready");
  expect(requests).toHaveLength(1);
  await expect(counter).not.toBeInViewport();
  await expect(counter).toHaveAttribute("href", statistics);
  await expect(counter).toHaveAttribute("rel", "noopener noreferrer");
  await expect(counter).toHaveAccessibleName(
    "Profile views: open total and daily visit statistics on Hits.sh",
  );
  await page.getByRole("button", { name: /Switch to .* mode/ }).click();
  await page.locator("#content").scrollIntoViewIfNeeded();
  await page.locator(".site-footer").scrollIntoViewIfNeeded();
  await expect(counter).toHaveAttribute("data-counter-state", "ready");
  expect(requests).toHaveLength(1);

  await page.reload();
  await expect(counter).toHaveAttribute("data-counter-state", "ready");
  expect(count).toBe(2);
  const secondPage = await context.newPage();
  await serveProduction(secondPage, baseURL!);
  await secondPage.goto(production);
  await expect(secondPage.locator(".visit-counter")).toHaveAttribute(
    "data-counter-state",
    "ready",
  );
  expect(count).toBe(3);
  await secondPage.unrouteAll({ behavior: "wait" });
  await secondPage.close();
});

test("local previews and automated production checks never increment real totals", async ({
  page,
  baseURL,
}) => {
  const requests: string[] = [];
  await page.route("https://hits.sh/**", async (route) => {
    requests.push(route.request().url());
    await route.abort();
  });
  await page.goto("./#contact");
  await expect(page.locator(".visit-counter")).toContainText("Views: preview");
  await serveProduction(page, baseURL!, true);
  await page.goto(production);
  await expect(page.locator(".visit-counter")).toContainText("Views: preview");
  expect(requests).toEqual([]);
});

test("a hidden page waits until visible, then counts only once", async ({
  page,
  baseURL,
}) => {
  let count = 0;
  await serveProduction(page, baseURL!);
  await page.route("https://hits.sh/**", async (route) => {
    count++;
    await route.fulfill({
      contentType: "image/svg+xml",
      body: badgeBody(),
    });
  });
  await page.addInitScript(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
  });
  await page.goto(production);
  const counter = page.locator(".visit-counter");
  await expect(counter).toHaveAttribute("data-counter-state", "waiting");
  expect(count).toBe(0);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(counter).toHaveAttribute("data-counter-state", "ready");
  await page.evaluate(() => {
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(
      new PageTransitionEvent("pageshow", { persisted: true }),
    );
  });
  expect(count).toBe(1);
});

test("the counter waits for page load and reserves space for the result", async ({
  page,
  baseURL,
}) => {
  await serveProduction(page, baseURL!);
  let blocker: Route | undefined;
  let counterRequest: Route | undefined;
  await page.route(production, async (route) => {
    const response = await page.request.get(baseURL!);
    await route.fulfill({
      response,
      body: (await response.text()).replace(
        "</body>",
        '<img src="./visit-load-blocker.svg" alt="" width="1" height="1" style="position:fixed;opacity:0"></body>',
      ),
    });
  });
  await page.route(`${production}visit-load-blocker.svg`, (route) => {
    blocker = route;
  });
  await page.route("https://hits.sh/**", (route) => {
    counterRequest = route;
  });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto(`${production}#contact`, { waitUntil: "domcontentloaded" });
  const counter = page.locator(".visit-counter");
  await expect(counter).toHaveAttribute("data-counter-state", "waiting");
  expect(counterRequest).toBeUndefined();
  await expect.poll(() => Boolean(blocker)).toBe(true);
  await blocker!.fulfill({
    contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
  });
  await page.waitForLoadState("load");
  await expect(counter).toHaveAttribute("data-counter-state", "loading");
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".site-footer").scrollIntoViewIfNeeded();
  const before = await counter.boundingBox();
  await expect.poll(() => Boolean(counterRequest)).toBe(true);
  await counterRequest!.fulfill({
    contentType: "image/svg+xml",
    body: badgeBody(),
  });
  await expect(counter).toHaveAttribute("data-counter-state", "ready");
  expect(await counter.boundingBox()).toEqual(before);
});

for (const failure of ["network", "invalid-image", "timeout"] as const) {
  test(`counter ${failure} shows an honest fallback without retrying or blocking the page`, async ({
    page,
    baseURL,
  }) => {
    const warnings: string[] = [];
    let requests = 0;
    let heldRoute: Route | undefined;
    page.on("console", (message) => {
      if (message.type() === "warning") warnings.push(message.text());
    });
    await serveProduction(page, baseURL!);
    await page.route("https://hits.sh/**", async (route) => {
      requests++;
      if (failure === "timeout") {
        heldRoute = route;
      } else if (failure === "network") {
        await route.abort();
      } else {
        await route.fulfill({
          contentType: "text/plain",
          body: "Invalid image",
        });
      }
    });
    await page.clock.install();
    await page.goto(`${production}#contact`);
    const counter = page.locator(".visit-counter");
    if (failure === "timeout") {
      await expect(counter).toHaveAttribute("data-counter-state", "loading");
      await page.clock.runFor(12_100);
    }
    await expect(counter).toContainText("Views unavailable");
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("no automatic retry");
    await page.clock.runFor(20_000);
    expect(requests).toBe(1);
    await expect(page.locator("#contact")).toBeVisible();
    await expect(counter).toHaveAttribute("href", statistics);
    if (heldRoute) await heldRoute.abort();
  });
}

for (const theme of ["light", "dark"] as const) {
  test(`footer counter fits all screen sizes and stays accessible in ${theme} mode`, async ({
    page,
    baseURL,
  }, testInfo) => {
    await serveProduction(page, baseURL!);
    await page.route("https://hits.sh/**", (route) =>
      route.fulfill({
        contentType: "image/svg+xml",
        body: badgeBody(),
      }),
    );
    await page.emulateMedia({ colorScheme: theme });
    for (const width of [320, 390, 700, 701, 768, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${production}#contact`);
      await page.evaluate(() => document.fonts.ready);
      const footer = page.locator(".site-footer");
      const counter = footer.locator(".visit-counter");
      await expect(counter).toHaveAttribute("data-counter-state", "ready");
      await footer.scrollIntoViewIfNeeded();
      await expect(footer).toContainText(
        `© ${new Date().getFullYear()} Aditya Jamwal`,
      );
      const copyright = await footer.locator(".footer-copyright").boundingBox();
      const footerBounds = await footer.boundingBox();
      expect(copyright).not.toBeNull();
      expect(footerBounds).not.toBeNull();
      expect(
        Math.abs(
          copyright!.x +
            copyright!.width / 2 -
            (footerBounds!.x + footerBounds!.width / 2),
        ),
      ).toBeLessThanOrEqual(1);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const boxes = await footer
        .locator(".wordmark, .footer-back, .footer-copyright, .visit-counter")
        .evaluateAll((elements) =>
          elements.map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              left: rect.left,
              top: rect.top,
              right: rect.right,
              bottom: rect.bottom,
            };
          }),
        );
      for (const [index, box] of boxes.entries()) {
        expect(box.left).toBeGreaterThanOrEqual(0);
        expect(box.right).toBeLessThanOrEqual(width);
        for (const other of boxes.slice(index + 1)) {
          expect(
            box.right <= other.left ||
              other.right <= box.left ||
              box.bottom <= other.top ||
              other.bottom <= box.top,
          ).toBe(true);
        }
      }
      await expect(counter.locator("img")).toHaveCSS(
        "filter",
        theme === "light" ? "brightness(0)" : "brightness(0) invert(1)",
      );
      await counter.focus();
      await expect(counter).toBeFocused();
      await expect(counter).toHaveCSS("outline-style", "solid");
      const accessibility = await new AxeBuilder({ page })
        .include(".site-footer")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(accessibility.violations).toEqual([]);
      await page.locator(".footer-back").focus();
      await footer.screenshot({
        path: testInfo.outputPath(`footer-${theme}-${width}.png`),
      });
    }
    await page.locator(".footer-back").click();
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".site-footer")).toBeHidden();
  });
}
