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
  timeout: 60000,
  reporter: [
    ["html"],
    ["@estruyf/github-actions-reporter", { showError: true }],
  ],
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
