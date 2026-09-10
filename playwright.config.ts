import { defineConfig } from "@playwright/test";

const remoteURL = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: process.env.CI ? 90000 : 30000,
  expect: { timeout: process.env.CI ? 20000 : 5000 },
  reporter: "list",
  use: {
    baseURL: remoteURL ?? "http://127.0.0.1:4173",
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    launchOptions: {
      args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
    },
  },
  webServer: remoteURL
    ? undefined
    : {
        command: "npm run preview -- --host 127.0.0.1 --port 4173 --strictPort",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: !process.env.CI,
      },
});
