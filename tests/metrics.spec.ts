import { test, expect } from "@playwright/test";
import { creatorImpressions } from "../src/content";
import linkedin from "../src/data/linkedin.json" with { type: "json" };

const community = `${(Math.floor(linkedin.followers / 100) * 100).toLocaleString("en-US")}+`;
const impressions = "19.1M+";
const clockStart = new Date("2026-10-04T18:00:00.000Z");
const clockPause = new Date("2026-10-04T18:01:00.000Z");

for (const colorScheme of ["light", "dark"] as const) {
  test(`LeetCode practice fits desktop, tablet and phone in ${colorScheme} mode`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ colorScheme });
    await page.goto("./#expertise");
    const practice = page.locator("#expertise .leetcode-practice");
    await expect(
      practice.getByRole("heading", {
        name: "Problem Solving and Community Stats",
      }),
    ).toBeVisible();
    const groups = practice.locator("details");
    await expect(groups.locator("summary")).toHaveText([
      "Advanced8 topics",
      "Intermediate8 topics",
      "Fundamental8 topics",
    ]);
    await expect(practice.locator(".practice-topics dd")).toHaveCount(24);
    await expect(
      practice.getByRole("link", { name: "LeetCode profile" }),
    ).toHaveAttribute("href", "https://leetcode.com/u/darkaadityaa/");
    await expect(practice.locator(".practice-stats dd")).toHaveText([
      "1,718",
      "57K",
      "140",
      "8",
      "363",
    ]);
    await expect(page.getByText(/Top 2\.77%/)).toHaveCount(2);
    for (const [width, columns] of [
      [1440, 3],
      [1920, 3],
      [700, 2],
      [320, 1],
    ]) {
      await page.setViewportSize({ width, height: 900 });
      const stats = await practice.locator(".practice-stats").boundingBox();
      expect(stats!.y + stats!.height).toBeLessThan(
        (await groups.first().boundingBox())!.y,
      );
      for (const group of await groups.all()) {
        const toggle = group.locator("summary");
        await toggle.focus();
        await toggle.press("Enter");
        await expect(group.locator("dl")).toBeHidden();
        await toggle.press("Space");
        await expect(group.locator("dl")).toBeVisible();
      }
      if (width !== 1920)
        await practice.screenshot({
          path: testInfo.outputPath(`topics-${colorScheme}-${width}.png`),
        });
      const entries = practice
        .locator(".practice-topics")
        .first()
        .locator(":scope > div");
      const boxes = await entries.evaluateAll((nodes) =>
        nodes.map((node) => node.getBoundingClientRect().toJSON()),
      );
      expect(boxes.filter((box) => box.top === boxes[0].top)).toHaveLength(
        columns,
      );
      expect(boxes.every((box) => box.left >= 0 && box.right <= width)).toBe(
        true,
      );
    }
  });
}

test("impressions use the supplied manual total and show 19.1M+ without fetching", async ({
  page,
}) => {
  const dataRequests: string[] = [];
  page.on("request", (request) => {
    if (["fetch", "xhr"].includes(request.resourceType()))
      dataRequests.push(request.url());
  });
  expect(creatorImpressions).toBe(19_100_000);
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
    /refresh|fetch|monitor|14\.4M|14\.5M|16\.2M|17\.2M/i,
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
  expect(connections).toBeLessThan(Math.floor(linkedin.followers / 100) * 100);
  expect(Number.parseFloat(partial[1])).toBeGreaterThan(0);
  expect(Number.parseFloat(partial[1])).toBeLessThan(19.1);
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
  await expect
    .poll(() => warnings)
    .toContain("Count-up animation unavailable; showing the final metric.");
  await expect(
    page
      .locator(".creator-social-links")
      .getByRole("link", { name: "Connect on LinkedIn" }),
  ).toHaveAttribute("href", "https://www.linkedin.com/in/adityajamwal02/");
});
