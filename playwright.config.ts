import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright e2e config.
 *
 * Targets a running JobPrep dev/prod server (default http://localhost:3000).
 * In CI the server is started by the workflow with a dummy env so these stay
 * green without real Stripe/LiveKit/AI credentials. Override the target with
 * PLAYWRIGHT_BASE_URL.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // The workflow starts the server itself (so it can inject the build env), but
  // when running locally with no server we boot one here.
  webServer: process.env.PLAYWRIGHT_NO_SERVER
    ? undefined
    : {
        command: "bun run start",
        url: baseURL,
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
      },
});
