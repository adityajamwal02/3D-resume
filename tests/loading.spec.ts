import { test, expect, type Page } from "@playwright/test";
import linkedin from "../src/data/linkedin.json" with { type: "json" };

function observeScene(page: Page, browserName: string) {
  let restrictedWebGL = false;
  page.on("console", (message) => {
    if (
      message
        .text()
        .includes(
          "AllowWebgl2:false restricts context creation on this system.",
        )
    ) {
      restrictedWebGL = true;
    }
  });
  return async () => {
    const scene = page.locator(".systems-scene");
    await expect(scene).not.toHaveAttribute("data-scene-state", "deferred", {
      timeout: 20_000,
    });
    if (browserName === "firefox" && restrictedWebGL) {
      await expect(scene).toHaveAttribute("data-scene-state", "unavailable");
      await expect(scene.locator(".scene-fallback")).toBeVisible();
    } else {
      await expect(scene).toHaveAttribute("data-scene-state", "ready");
      await expect(scene.locator("canvas")).toBeVisible();
    }
  };
}

test("fresh home defers brand images; scrolling loads Wispr Flow exactly once in the accessible list", async ({
  page,
  browserName,
}) => {
  const ready = observeScene(page, browserName);
  const brands: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/brands/")) brands.push(request.url());
  });
  await page.goto("./");
  await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  await ready();
  await expect(page.locator(".creator-collaborations")).toHaveAttribute(
    "data-active",
    "false",
  );
  expect(brands).toEqual([]);
  const scene = (await page.locator("canvas").count())
    ? await page.locator("canvas").elementHandle()
    : null;
  await page.locator(".creator-collaborations").scrollIntoViewIfNeeded();
  await expect(page.locator(".creator-collaborations")).toHaveAttribute(
    "data-active",
    "true",
  );
  const list = page.getByRole("list", { name: "Collaborating brands" });
  await expect(list.locator("img")).toHaveCount(17);
  const wispr = list.getByRole("listitem").filter({ hasText: /^Wispr Flow$/ });
  await expect(wispr).toHaveCount(1);
  const logo = wispr.locator("img");
  await expect(logo).toHaveAttribute("src", /brands\/wispr-flow\.svg$/);
  await expect
    .poll(() =>
      logo.evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  expect(brands.filter((url) => url.endsWith("/wispr-flow.svg"))).toHaveLength(
    1,
  );
  await expect(logo).toHaveCSS("width", "120px");
  await expect(logo).toHaveCSS("height", "40px");
  await page.locator("#home").scrollIntoViewIfNeeded();
  await expect(page.locator(".creator-collaborations")).toHaveAttribute(
    "data-active",
    "false",
  );
  if (scene)
    expect(await scene.evaluate((element) => element.isConnected)).toBe(true);
  await page.locator(".creator-collaborations").scrollIntoViewIfNeeded();
  expect(brands.filter((url) => url.endsWith("/wispr-flow.svg"))).toHaveLength(
    1,
  );
});

for (const id of ["experience", "work", "mentorship", "content"]) {
  test(`fresh and reloaded #${id} opens its section without downloading the offscreen renderer`, async ({
    page,
    browserName,
  }) => {
    const ready = observeScene(page, browserName);
    const renderers: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("createSculptureScene"))
        renderers.push(request.url());
    });
    await page.goto(`./#${id}`);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(`#${id} h2`).first()).toBeInViewport();
    await expect(page.locator(".creator-collaborations")).toHaveAttribute(
      "data-active",
      id === "content" ? "true" : "false",
    );
    await expect(page.locator("canvas")).toHaveCount(0);
    expect(renderers).toEqual([]);
    await page.reload();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(`#${id} h2`).first()).toBeInViewport();
    await expect(page.locator("canvas")).toHaveCount(0);
    expect(renderers).toEqual([]);
    await page
      .locator(".site-footer")
      .getByRole("link", { name: "Back to top", exact: true })
      .click();
    await ready();
    expect(renderers).toHaveLength(1);
  });
}

test("warm reload reuses cacheable assets, preserves theme, and loads only the small app chunk plus vendor", async ({
  page,
}) => {
  await page.goto("./#content");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".creator-collaborations")).toHaveAttribute(
    "data-active",
    "true",
  );
  const entries = () =>
    page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .filter((entry) => entry.name.includes("/assets/"))
        .map((entry) => ({
          name: entry.name,
          bytes: (entry as PerformanceResourceTiming).transferSize,
        })),
    );
  const before = await entries();
  const app = before.find((entry) => /\/index-[^/]+\.js$/.test(entry.name));
  expect(app).toBeDefined();
  expect(before.some((entry) => /react-vendor-.*\.js$/.test(entry.name))).toBe(
    true,
  );
  const bundle = await page.request.get(app!.name);
  expect((await bundle.body()).length).toBeLessThan(65_000);
  const selectedTheme =
    (await page.locator("html").getAttribute("data-theme")) === "dark"
      ? "light"
      : "dark";
  await page
    .getByRole("button", { name: `Switch to ${selectedTheme} mode` })
    .click();
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("#creator-title")).toBeInViewport();
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    selectedTheme,
  );
  const after = await entries();
  expect(
    after.filter((entry) => entry.name.includes("createSculptureScene")),
  ).toEqual([]);
  expect(after.reduce((sum, entry) => sum + entry.bytes, 0)).toBeLessThan(
    before.reduce((sum, entry) => sum + entry.bytes, 0),
  );
});

test("carousel pauses outside its section and resumes without a second image load", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("./#content");
  const carousel = page.locator(".creator-collaborations");
  const track = carousel.locator(".brand-carousel-track");
  await carousel.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(carousel).toHaveAttribute("data-active", "true");
  await expect(track).toHaveCSS("animation-play-state", "running");
  await page.locator("#experience").scrollIntoViewIfNeeded();
  await expect(carousel).toHaveAttribute("data-active", "false");
  await expect(track).toHaveCSS("animation-play-state", "paused");
  await carousel.scrollIntoViewIfNeeded();
  await expect(track).toHaveCSS("animation-play-state", "running");
});

test("no idle callback API still loads the scene and initial invalid fragments do not break content", async ({
  page,
  browserName,
}) => {
  const ready = observeScene(page, browserName);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "requestIdleCallback", {
      value: undefined,
      configurable: true,
    });
  });
  await page.goto("./#%ZZ");
  await ready();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});

test("optimized portrait uses a small WebP and the follower update reaches both displays", async ({
  page,
}) => {
  await page.goto("./#mentorship");
  const portrait = page.locator(".mentor-portrait");
  await portrait.scrollIntoViewIfNeeded();
  await expect(portrait).toHaveAttribute("src", /aditya-topmate\.webp$/);
  await expect
    .poll(() =>
      portrait.evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBe(480);
  const image = await page.request.get((await portrait.getAttribute("src"))!);
  expect((await image.body()).length).toBeLessThan(65_000);
  const hundreds = Math.floor(linkedin.followers / 100);
  await expect(
    page.locator(".impact-strip > div").nth(1).locator("strong"),
  ).toHaveText(`${hundreds / 10}K+`);
  await expect(page.locator(".creator-followers .count-up-visual")).toHaveText(
    `${(hundreds * 100).toLocaleString("en-US")}+`,
  );
});

test("reload restores a scrolled page without a hash and keeps the hero renderer deferred", async ({
  page,
  browserName,
}) => {
  const ready = observeScene(page, browserName);
  await page.goto("./");
  await ready();
  await page.evaluate(() => document.fonts.ready);
  await page.locator("#content").scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => window.scrollY);
  expect(before).toBeGreaterThan(1000);
  const renderers: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("createSculptureScene"))
      renderers.push(request.url());
  });
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  // WebKit can shift by one native scrollbar as the deferred carousel settles.
  await expect
    .poll(() =>
      page.evaluate((position) => Math.abs(window.scrollY - position), before),
    )
    .toBeLessThanOrEqual(24);
  await expect(page.locator("#content")).toBeInViewport();
  await expect(page.locator("canvas")).toHaveCount(0);
  expect(renderers).toEqual([]);
});

test("blocked session storage does not break reloads and section navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", {
      get() {
        throw new DOMException("Storage blocked", "SecurityError");
      },
    });
  });
  await page.goto("./#content");
  await expect(page.locator("#creator-title")).toBeInViewport();
  await page.reload();
  await expect(page.locator("#creator-title")).toBeInViewport();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Experience", exact: true })
    .click();
  await expect(page.locator("#experience-title")).toBeInViewport();
  expect(errors).toEqual([]);
});

test("a slow renderer download never blocks content navigation or initializes an offscreen scene", async ({
  page,
  browserName,
}) => {
  const ready = observeScene(page, browserName);
  let requested = false;
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(/createSculptureScene.*\.js/, async (route) => {
    requested = true;
    await gate;
    await route.continue();
  });
  try {
    await page.goto("./");
    await expect.poll(() => requested).toBe(true);
    await expect(page.locator(".scene-fallback")).toBeVisible();
    await page.getByRole("link", { name: "Explore engineering work" }).click();
    await expect(page.locator("#experience-title")).toBeInViewport();
    await expect(page.locator(".systems-scene")).toHaveAttribute(
      "data-scene-state",
      "deferred",
    );
    const downloaded = page.waitForResponse(/createSculptureScene.*\.js/);
    release();
    await downloaded;
    await expect(page.locator("canvas")).toHaveCount(0);
    await page
      .locator(".site-footer")
      .getByRole("link", { name: "Back to top", exact: true })
      .click();
    await ready();
  } finally {
    release();
  }
});
