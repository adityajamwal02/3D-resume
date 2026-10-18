import { test, expect } from "@playwright/test";
import { creatorImpressions } from "../src/content";
import linkedin from "../src/data/linkedin.json" with { type: "json" };

const community = `${(Math.floor(linkedin.followers / 1000) * 1000).toLocaleString("en-US")}+`;
const impressions = "16.2M+";
const clockStart = new Date("2026-10-04T18:00:00.000Z");
const clockPause = new Date("2026-10-04T18:01:00.000Z");

test("impressions use the supplied manual total and show 16.2M+ without fetching", async ({
  page,
}) => {
  const dataRequests: string[] = [];
  page.on("request", (request) => {
    if (["fetch", "xhr"].includes(request.resourceType()))
      dataRequests.push(request.url());
  });
  expect(creatorImpressions).toBe(16_200_000);
  await page.goto("./");
  const metrics = page.locator(".creator-metrics");
  await expect(metrics.locator(".count-up-visual")).toHaveText([
    community,
    impressions,
  ]);
  await expect(metrics.locator(".sr-only")).toHaveText([
    community,
    impressions,
  ]);
  await expect(metrics.locator("[aria-live]")).toHaveCount(0);
  await expect(page.locator(".creator-impressions")).not.toContainText(
    /refresh|fetch|monitor|14\.4M|14\.5M/i,
  );
  await expect(
    page.locator(".creator-community .creator-impressions"),
  ).toHaveCount(1);
  const bounds = await metrics.boundingBox();
  const collaborations = await page
    .locator(".creator-collaborations")
    .boundingBox();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(collaborations!.y);
  await metrics.scrollIntoViewIfNeeded();
  await page
    .getByRole("button", { name: "Switch to dark mode" })
    .or(page.getByRole("button", { name: "Switch to light mode" }))
    .click();
  await expect(metrics.locator(".count-up-visual")).toHaveText([
    community,
    impressions,
  ]);
  expect(dataRequests).toEqual([]);
  await page.emulateMedia({ media: "print" });
  await expect(metrics).toBeHidden();
});

test("both content metrics count up once on entry and retain stable accessible values", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.clock.install({ time: clockStart });
  await page.goto("./");
  await page.clock.pauseAt(clockPause);
  const metrics = page.locator(".creator-metrics");
  const numbers = metrics.locator(".count-up-visual");
  await expect(numbers).toHaveText([community, impressions]);
  await expect(metrics.locator(".sr-only")).toHaveText([
    community,
    impressions,
  ]);
  await metrics.scrollIntoViewIfNeeded();
  await expect(numbers).toHaveText(["0+", "0.0M+"]);
  await page.clock.runFor(500);
  const partial = await numbers.allTextContents();
  const connections = Number(partial[0].replace(/[,+]/g, ""));
  expect(connections).toBeGreaterThan(0);
  expect(connections).toBeLessThan(
    Math.floor(linkedin.followers / 1000) * 1000,
  );
  expect(Number.parseFloat(partial[1])).toBeGreaterThan(0);
  expect(Number.parseFloat(partial[1])).toBeLessThan(16.2);
  expect(partial[1]).toMatch(/M\+$/);
  await expect(metrics.locator(".sr-only")).toHaveText([
    community,
    impressions,
  ]);
  await page.clock.runFor(1000);
  await expect(numbers).toHaveText([community, impressions]);
  await page.locator("#home").scrollIntoViewIfNeeded();
  await page.clock.runFor(100);
  await metrics.scrollIntoViewIfNeeded();
  await page.clock.runFor(100);
  await expect(numbers).toHaveText([community, impressions]);
  await page
    .getByRole("button", { name: /Switch to (dark|light) mode/ })
    .click();
  await page.clock.runFor(100);
  await expect(numbers).toHaveText([community, impressions]);
});

test("enabling reduced motion mid-count completes both values without replay", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.clock.install({ time: clockStart });
  await page.goto("./");
  await page.clock.pauseAt(clockPause);
  const metrics = page.locator(".creator-metrics");
  await metrics.scrollIntoViewIfNeeded();
  await expect(metrics.locator(".count-up-visual")).toHaveText(["0+", "0.0M+"]);
  await page.clock.runFor(200);
  await expect(metrics.locator(".count-up-visual").last()).not.toHaveText(
    impressions,
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(metrics.locator(".count-up-visual")).toHaveText([
    community,
    impressions,
  ]);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.clock.runFor(2000);
  await expect(metrics.locator(".count-up-visual")).toHaveText([
    community,
    impressions,
  ]);
});

test("leaving mid-count settles metrics instead of animating offscreen", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.clock.install({ time: clockStart });
  await page.goto("./");
  await page.clock.pauseAt(clockPause);
  const metrics = page.locator(".creator-metrics");
  await metrics.scrollIntoViewIfNeeded();
  await expect(metrics.locator(".count-up-visual")).toHaveText(["0+", "0.0M+"]);
  await page.clock.runFor(200);
  await page.locator("#home").scrollIntoViewIfNeeded();
  await page.clock.runFor(100);
  await expect(metrics.locator(".count-up-visual")).toHaveText([
    community,
    impressions,
  ]);
  await metrics.scrollIntoViewIfNeeded();
  await page.clock.runFor(100);
  await expect(metrics.locator(".count-up-visual")).toHaveText([
    community,
    impressions,
  ]);
});

test("unavailable intersection observation keeps readable final metrics", async ({
  page,
}) => {
  const warnings: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning") warnings.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    Object.defineProperty(window, "IntersectionObserver", {
      value: undefined,
      configurable: true,
    });
  });
  await page.goto("./#content");
  await expect(page.locator(".creator-metrics .count-up-visual")).toHaveText([
    community,
    impressions,
  ]);
  expect(warnings).toContain(
    "Count-up animation unavailable; showing the final metric.",
  );
  await expect(
    page
      .locator(".creator-social-links")
      .getByRole("link", { name: "Connect on LinkedIn" }),
  ).toHaveAttribute("href", "https://www.linkedin.com/in/adityajamwal02/");
});
