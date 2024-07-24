import { defineConfig, devices } from "@playwright/test";
import { AuthFile } from "./constants/AuthFile";

if (!process.env.CI) {
  require("dotenv").config({ path: ".env" });
}

const USE_MFA = process.env.M365_OTP_SECRET ? true : false;

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
      testMatch: USE_MFA ? /mfa.setup.ts/ : /login.setup.ts/,
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
