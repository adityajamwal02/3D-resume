import { test, expect } from "@playwright/test";

const canonical = "https://adityajamwal02.github.io/3D-resume/";
const title = "Aditya Jamwal | Overview";

test("overview metadata is present in delivered HTML with no branded favicon", async ({
  page,
}) => {
  const faviconRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith("/favicon.ico"))
      faviconRequests.push(request.url());
  });
  const response = await page.goto("./");
  expect(response?.status()).toBe(200);
  const html = await response!.text();
  expect(html).toContain(`<title>${title}</title>`);
  const schema = JSON.parse(
    html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1],
  );
  expect(schema["@type"]).toBe("ProfilePage");
  expect(schema.url).toBe(canonical);
  expect(schema.mainEntity).toMatchObject({
    "@type": "Person",
    name: "Aditya Jamwal",
    jobTitle: "Software Engineer",
    worksFor: { "@type": "Organization", name: "Microsoft" },
  });
  expect(schema.mainEntity.sameAs).toContain(
    "https://www.linkedin.com/in/adityajamwal02/",
  );
  await expect(page).toHaveTitle(title);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    "href",
    "data:,",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    canonical,
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    title,
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    canonical,
  );
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
    "content",
    title,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /index, follow/,
  );
  const imagePath = "aditya-topmate.jpg";
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    `${canonical}${imagePath}`,
  );
  expect((await page.request.get(`./${imagePath}`)).ok()).toBe(true);
  const sitemap = await page.request.get("./sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const sitemapText = await sitemap.text();
  const urls = await page.evaluate((xml) => {
    const parsed = new DOMParser().parseFromString(xml, "application/xml");
    if (parsed.querySelector("parsererror"))
      throw new Error("Invalid sitemap XML");
    return Array.from(
      parsed.querySelectorAll("loc"),
      (node) => node.textContent,
    );
  }, sitemapText);
  expect(urls).toEqual([canonical]);
  expect(faviconRequests).toEqual([]);
});

test("one variable Google Sans font supplies all four weights within the font-byte budget", async ({
  page,
}) => {
  await page.goto("./#content");
  await expect(page.locator("#creator-title")).toBeInViewport();
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".creator-collaborations").scrollIntoViewIfNeeded();
  for (const weight of [400, 500, 600, 700]) {
    expect(
      await page.evaluate(
        (value) => document.fonts.check(`${value} 16px "Google Sans"`),
        weight,
      ),
    ).toBe(true);
  }
  const fonts = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter(
        (entry) =>
          entry.name.includes("google-sans") && entry.name.includes("woff"),
      )
      .map((entry) => entry.name),
  );
  expect(fonts).toHaveLength(1);
  expect(fonts[0]).toMatch(/google-sans-latin-wght-normal-.*\.woff2$/);
  const font = await page.request.get(fonts[0]);
  expect((await font.body()).length).toBeLessThan(40_000);
  const definitions = await page.evaluate(() =>
    Array.from(document.fonts)
      .filter((face) => face.family.replaceAll('"', "") === "Google Sans")
      .map((face) => ({ weight: face.weight, status: face.status })),
  );
  expect(definitions).toEqual([{ weight: "400 700", status: "loaded" }]);
  await expect(page.locator('link[rel="preload"][as="font"]')).toHaveCount(0);
});

test("navigation avoids section layout reads during ordinary scrolling and refreshes after resize", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Element.prototype.getBoundingClientRect;
    const ids = new Set([
      "home",
      "experience",
      "work",
      "expertise",
      "mentorship",
      "content",
      "contact",
    ]);
    let reads = 0;
    Element.prototype.getBoundingClientRect = function () {
      if (ids.has(this.id)) reads++;
      return original.call(this);
    };
    Object.defineProperty(window, "__sectionReads", { get: () => reads });
  });
  await page.goto("./#work");
  await expect(page.locator('.navigation a[href="#work"]')).toHaveAttribute(
    "aria-current",
    "location",
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
  const baseline: number = await page.evaluate(() =>
    Reflect.get(window, "__sectionReads"),
  );
  await page.evaluate(async () => {
    for (let step = 0; step < 20; step++) {
      window.scrollBy({ top: 5, behavior: "instant" });
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
    }
  });
  const after: number = await page.evaluate(() =>
    Reflect.get(window, "__sectionReads"),
  );
  expect(after - baseline).toBeLessThanOrEqual(14);
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.evaluate(() => {
    document.querySelector<HTMLElement>("#experience")!.style.paddingBottom =
      "250px";
  });
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Content", exact: true })
    .click();
  await expect(page.locator("#creator-title")).toBeInViewport();
  await expect(page.locator('.navigation a[href="#content"]')).toHaveAttribute(
    "aria-current",
    "location",
  );
  const progress = await page
    .locator(".dynamic-island")
    .evaluate((element) =>
      Number(
        (element as HTMLElement).style.getPropertyValue("--reading-progress"),
      ),
    );
  expect(progress).toBeGreaterThan(0);
  expect(progress).toBeLessThanOrEqual(1);
  await page.goBack();
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator('.navigation a[href="#work"]')).toHaveAttribute(
    "aria-current",
    "location",
  );
});

test("navigation stays functional without ResizeObserver", async ({ page }) => {
  const warnings: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning") warnings.push(message.text());
  });
  await page.addInitScript(() => {
    Object.defineProperty(window, "ResizeObserver", {
      value: undefined,
      configurable: true,
    });
  });
  await page.goto("./#work");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Content", exact: true })
    .click();
  await expect(page.locator('.navigation a[href="#content"]')).toHaveAttribute(
    "aria-current",
    "location",
  );
  await expect
    .poll(() => warnings)
    .toContain(
      "Layout observation unavailable; refreshing navigation measurements on scroll.",
    );
  await expect(page.locator("#creator-title")).toBeInViewport();
});

test("without JavaScript the overview and direct professional links remain readable", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(
      process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4173/",
    );
    await expect(page).toHaveTitle(title);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Aditya Jamwal",
    );
    await expect(page.getByRole("main")).toContainText(
      "Software Engineer at Microsoft",
    );
    await expect(
      page.getByRole("link", { name: "Connect on LinkedIn" }),
    ).toHaveAttribute("href", "https://www.linkedin.com/in/adityajamwal02/");
    await expect(page.locator(".systems-scene")).toHaveCount(0);
  } finally {
    await context.close();
  }
});
