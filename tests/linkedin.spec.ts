import { test, expect } from "@playwright/test";
import linkedin from "../src/data/linkedin.json" with { type: "json" };

test("LinkedIn audience stays consistent in both sections without browser polling or refresh copy", async ({
  page,
}) => {
  const linkedinRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).hostname.endsWith("linkedin.com")) {
      linkedinRequests.push(request.url());
    }
  });
  const thousands = Math.floor(linkedin.followers / 1000);
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("./");
    await expect(
      page.locator(".impact-strip > div").nth(1).locator("strong"),
    ).toHaveText(`${thousands}K+`);
    const audience = page.locator(".creator-followers");
    await expect(audience.locator("strong")).toHaveText(
      `${(thousands * 1000).toLocaleString("en-US")}+`,
    );
    await expect(page.locator("#content")).not.toContainText(
      /refresh|polling|15 days|last updated/i,
    );
    await expect(page.locator(".impact-strip")).not.toContainText(
      /refresh|polling|15 days|last updated/i,
    );
    await expect(
      page
        .locator(".creator-social-links")
        .getByRole("link", { name: "Connect on LinkedIn" }),
    ).toHaveAttribute("href", "https://www.linkedin.com/in/adityajamwal02/");
  }
  expect(linkedinRequests).toEqual([]);
});
