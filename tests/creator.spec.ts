import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const linkedinURL = "https://www.linkedin.com/in/adityajamwal02/";
const xURL = "https://x.com/AdityaJamwal02";
const brandNames = [
  "CodeRabbit",
  "Cursor",
  "Gamma",
  "magicpin",
  "ProPeers",
  "Nebius",
  "MuscleBlaze",
  "CodeAnt AI",
  "Wispr Flow",
  "Nimbalyst",
  "Replit",
  "AON Meetings",
  "takeUforward",
  "Paytm",
  "Matiks",
];

test("career highlights and selected work reflect the community and collaboration platform", async ({
  page,
}) => {
  await page.goto("./");
  const highlights = page.getByLabel("Career highlights");
  await expect(highlights).toContainText("150M+");
  await expect(highlights).toContainText("85K+");
  await expect(highlights).toContainText("Connections - LinkedIn community");
  await expect(highlights).not.toContainText("Less manual log-analysis effort");
  const work = page.locator("#work");
  await expect(work.locator(".project")).toHaveCount(2);
  await expect(work.getByRole("heading", { name: "HashImagin" })).toBeVisible();
  const platform = work.locator(".project").filter({
    has: page.getByRole("heading", { name: "Multi-Agentic System" }),
  });
  await expect(platform).toContainText("curate brand-deal leads");
  await expect(platform).toContainText("growth and marketing specialists");
  await expect(platform).not.toContainText("CISCO");
  await expect(platform).not.toContainText("80%");
  await expect(work).not.toContainText("Agentic log analyser");
  await platform.getByRole("link", { name: "Explore collaborations" }).click();
  await expect(page).toHaveURL(/#content$/);
  await expect(page.locator("#creator-title")).toBeInViewport();
  await expect(page.locator("#experience")).toContainText(
    "Developed an agentic log analyser",
  );
});

for (const theme of ["light", "dark"] as const) {
  test(`content creation is accessible and responsive in ${theme} mode`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ colorScheme: theme });
    for (const width of [320, 390, 768, 1440, 1920]) {
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
        "community connections on LinkedIn",
      );
      await expect(section.locator(".creator-topics li")).toHaveText([
        "Technology",
        "Artificial intelligence",
      ]);
      await expect(section.locator(".creator-description")).toContainText(
        "engineer's perspective",
      );
      const connect = section.getByRole("link", {
        name: "Connect on LinkedIn",
        exact: true,
      });
      await expect(connect).toHaveAttribute("href", linkedinURL);
      await expect(connect).toHaveAttribute("target", "_blank");
      await expect(connect).toHaveAttribute("rel", "noreferrer");
      await connect.focus();
      await expect(connect).toBeFocused();
      const connectOnX = section.getByRole("link", {
        name: "Connect on X",
        exact: true,
      });
      await expect(connectOnX).toHaveAttribute("href", xURL);
      await expect(connectOnX).toHaveAttribute("target", "_blank");
      await expect(connectOnX).toHaveAttribute("rel", "noreferrer");
      const collaborations = section.locator(".creator-collaborations");
      const brands = collaborations.getByRole("list", {
        name: "Collaborating brands",
      });
      await expect(brands.getByRole("listitem")).toHaveText(brandNames);
      await expect(brands.locator("img")).toHaveCount(15);
      await expect(brands.locator(".brand-name-only")).toHaveCount(0);
      for (const logo of await brands.locator("img").all()) {
        await expect
          .poll(() =>
            logo.evaluate((image) => (image as HTMLImageElement).naturalWidth),
          )
          .toBeGreaterThan(0);
      }
      const geometry = await brands
        .locator(".brand-carousel-item")
        .evaluateAll((items) =>
          items.map((item) => {
            const bounds = item.getBoundingClientRect();
            const frame = item
              .querySelector(".brand-logo-frame")!
              .getBoundingClientRect();
            const image = item.querySelector("img")!;
            const logo = image.getBoundingClientRect();
            const label = item.querySelector(".brand-carousel-name")!;
            const caption = label.getBoundingClientRect();
            const style = getComputedStyle(label);
            const tileStyle = getComputedStyle(item);
            return {
              width: bounds.width,
              height: bounds.height,
              frameWidth: frame.width,
              frameHeight: frame.height,
              imageWidth: logo.width,
              imageHeight: logo.height,
              imageTop: logo.top - bounds.top,
              imageCenter: logo.left + logo.width / 2 - bounds.left,
              captionTop: caption.top - bounds.top,
              captionHeight: caption.height,
              font: style.fontFamily,
              weight: style.fontWeight,
              alignment: style.textAlign,
              color: style.color,
              background: tileStyle.backgroundColor,
              fit: getComputedStyle(image).objectFit,
            };
          }),
        );
      for (const item of geometry) {
        expect([item.width, item.height]).toEqual([176, 108]);
        expect([item.frameWidth, item.frameHeight]).toEqual([128, 48]);
        expect([item.imageWidth, item.imageHeight]).toEqual([120, 40]);
        expect(item.imageCenter).toBe(88);
        expect(item.fit).toBe("contain");
        expect(item.font).toContain("Google Sans");
        expect(item.weight).toBe("700");
        expect(item.alignment).toBe("center");
        expect(item.imageTop).toBe(geometry[0].imageTop);
        expect(item.captionTop).toBe(geometry[0].captionTop);
        expect(item.captionHeight).toBe(18);
        expect(item.background).toBe(
          theme === "dark" ? "rgb(28, 32, 40)" : "rgb(231, 238, 236)",
        );
        expect(item.color).toBe(
          theme === "dark" ? "rgb(240, 242, 246)" : "rgb(28, 43, 48)",
        );
      }
      expect(
        await page.evaluate(() =>
          document.fonts.check('700 12px "Google Sans"'),
        ),
      ).toBe(true);
      const gamma = brands
        .getByRole("listitem")
        .filter({ hasText: /^Gamma$/ })
        .locator("img");
      await expect(gamma).toHaveAttribute("src", /brands\/gamma\.png$/);
      expect(
        await gamma.evaluate((image) => ({
          width: (image as HTMLImageElement).naturalWidth,
          height: (image as HTMLImageElement).naturalHeight,
        })),
      ).toEqual({ width: 148, height: 148 });
      await expect(collaborations.getByRole("button")).toHaveCount(0);
      expect(
        await collaborations
          .locator(".brand-carousel-viewport")
          .evaluate((element) => element.getBoundingClientRect().height),
      ).toBeLessThanOrEqual(132);
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

for (const [label, url] of [
  ["Connect on LinkedIn", linkedinURL],
  ["Connect on X", xURL],
]) {
  test(`creator connection opens ${label} with keyboard activation`, async ({
    page,
    context,
  }) => {
    // Isolate third-party availability while verifying the actual outbound navigation.
    await context.route(url, (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<!doctype html><title>Social destination</title>",
      }),
    );
    await page.goto("./#content");
    const connect = page.locator("#content").getByRole("link", {
      name: label,
      exact: true,
    });
    await connect.focus();
    const [destination] = await Promise.all([
      page.waitForEvent("popup"),
      page.keyboard.press("Enter"),
    ]);
    await expect(destination).toHaveURL(url);
    await expect(destination).toHaveTitle("Social destination");
    await expect(page).toHaveURL(/#content$/);
    await destination.close();
  });
}

test("brand carousel moves, loops seamlessly, and supports pause and keyboard browsing", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("./#content");
  const carousel = page.locator(".creator-collaborations");
  await carousel.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const track = carousel.locator(".brand-carousel-track");
  const transform = () =>
    track.evaluate((element) => getComputedStyle(element).transform);
  const initial = await transform();
  await expect.poll(transform).not.toBe(initial);
  const geometry = await track.evaluate((element) => {
    const groups = Array.from(element.children).map((group) =>
      group.getBoundingClientRect(),
    );
    return {
      track: element.getBoundingClientRect().width,
      first: groups[0].width,
      second: groups[1].width,
      gap: groups[1].left - groups[0].right,
    };
  });
  expect(Math.abs(geometry.first - geometry.second)).toBeLessThan(0.01);
  expect(Math.abs(geometry.track - geometry.first * 2)).toBeLessThan(0.01);
  expect(Math.abs(geometry.gap)).toBeLessThan(0.01);
  const viewport = carousel.locator(".brand-carousel-viewport");
  await viewport.hover();
  await expect
    .poll(() =>
      track.evaluate((element) => getComputedStyle(element).animationPlayState),
    )
    .toBe("paused");
  await page.mouse.move(0, 0);
  await carousel.getByRole("button", { name: "Pause brand carousel" }).click();
  await expect(
    carousel.getByRole("button", { name: "Resume brand carousel" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect.poll(transform).toBe("none");
  await viewport.focus();
  for (const item of await carousel
    .getByRole("list", { name: "Collaborating brands" })
    .getByRole("listitem")
    .all()) {
    await item.scrollIntoViewIfNeeded();
    await expect(item).toBeInViewport();
  }
  await carousel.getByRole("button", { name: "Resume brand carousel" }).click();
  await page.mouse.move(0, 0);
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollLeft))
    .toBe(0);
  await expect.poll(transform).not.toBe("none");
  await viewport.focus();
  await expect.poll(transform).toBe("none");
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);
  await page.keyboard.press("Home");
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollLeft))
    .toBe(0);
  await page.keyboard.press("End");
  await expect
    .poll(() =>
      viewport.evaluate((element) =>
        Math.abs(
          element.scrollLeft - (element.scrollWidth - element.clientWidth),
        ),
      ),
    )
    .toBeLessThanOrEqual(1);
  await page.keyboard.press("ArrowLeft");
  await expect
    .poll(() =>
      viewport.evaluate(
        (element) =>
          element.scrollLeft < element.scrollWidth - element.clientWidth,
      ),
    )
    .toBe(true);
  await carousel.getByRole("button", { name: "Pause brand carousel" }).focus();
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollLeft))
    .toBe(0);
  const results = await new AxeBuilder({ page })
    .include(".creator-collaborations")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("brand carousel honors reduced motion and all brands remain reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("./#content");
  const track = page.locator(".brand-carousel-track");
  await expect
    .poll(() =>
      track.evaluate((element) => getComputedStyle(element).animationName),
    )
    .toBe("none");
  await expect(
    page.getByRole("button", { name: "Pause brand carousel" }),
  ).toHaveCount(0);
  const brands = page
    .getByRole("list", { name: "Collaborating brands" })
    .getByRole("listitem");
  await expect(brands).toHaveCount(15);
  for (const item of await brands.all()) {
    await item.scrollIntoViewIfNeeded();
    await expect(item).toBeInViewport();
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect
    .poll(() =>
      page
        .locator(".brand-carousel-viewport")
        .evaluate((element) => element.scrollLeft),
    )
    .toBe(0);
  await expect(
    page.getByRole("button", { name: "Pause brand carousel" }),
  ).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      track.evaluate((element) => getComputedStyle(element).animationName),
    )
    .toBe("none");
});

test("missing brand logos leave readable brand names and social links", async ({
  page,
}) => {
  const warnings: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning") warnings.push(message.text());
  });
  await page.route("**/brands/*", (route) => route.abort());
  await page.goto("./#content");
  const brands = page.getByRole("list", { name: "Collaborating brands" });
  await expect(brands.locator(".brand-logo-unavailable")).toHaveCount(15);
  await expect(brands.locator("img")).toHaveCount(0);
  for (const name of brandNames) {
    await expect(brands.getByText(name, { exact: true })).toHaveCount(1);
    expect(warnings).toContain(
      `Unable to load the ${name} collaboration logo.`,
    );
  }
  await expect(
    page.locator("#content").getByRole("link", { name: "Connect on X" }),
  ).toHaveAttribute("href", xURL);
});

test("carousel changes theme immediately while keeping pause state and logo alignment", async ({
  page,
}) => {
  await page.emulateMedia({
    colorScheme: "light",
    reducedMotion: "no-preference",
  });
  await page.goto("./#content");
  const carousel = page.locator(".creator-collaborations");
  await carousel.scrollIntoViewIfNeeded();
  await carousel.getByRole("button", { name: "Pause brand carousel" }).click();
  const tile = carousel.locator(".brand-carousel-item").first();
  const name = tile.locator(".brand-carousel-name");
  await expect(tile).toHaveCSS("background-color", "rgb(231, 238, 236)");
  for (const theme of ["dark", "light"] as const) {
    await page.getByRole("button", { name: `Switch to ${theme} mode` }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(tile).toHaveCSS(
      "background-color",
      theme === "dark" ? "rgb(28, 32, 40)" : "rgb(231, 238, 236)",
    );
    await expect(name).toHaveCSS(
      "color",
      theme === "dark" ? "rgb(240, 242, 246)" : "rgb(28, 43, 48)",
    );
    await expect(name).toHaveCSS("font-weight", "700");
    await expect(
      carousel.getByRole("button", { name: "Resume brand carousel" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(carousel.locator(".brand-carousel-track")).toHaveCSS(
      "animation-name",
      "none",
    );
    await page.keyboard.press("Tab");
  }
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(tile).toHaveCSS("background-color", "rgb(231, 238, 236)");
});
