import { defineConfig, devices } from "@playwright/test";
import { AuthFile } from "./constants/AuthFile";

if (process.env.NODE_ENV === "development") {
  require("dotenv").config({ path: ".env" });
}

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // Set a timeout for each test
  timeout: 3 * 60 * 1000,
  reporter: [
    ["html"],
    ["@estruyf/github-actions-reporter", { showError: true }],
  ],
  expect: {
    // Maximum timeout for each expect statement
    timeout: 30 * 1000,
  },
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /login\.setup.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: {
          width: 2560,
          height: 1440,
        },
        storageState: AuthFile,
      },
      dependencies: ["setup"],
    },
  ],
});
