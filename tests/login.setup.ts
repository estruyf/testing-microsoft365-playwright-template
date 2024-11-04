import { test as setup } from "@playwright/test";
import { AuthFile } from "../constants/AuthFile";
import { login } from "playwright-m365-helpers";

/**
 * Login to Microsoft 365
 * More info: https://playwright.dev/docs/auth
 */
setup("authenticate", async ({ page }) => {
  await login(
    page,
    process.env.M365_PAGE_URL,
    process.env.M365_USERNAME,
    process.env.M365_PASSWORD
  );

  await page.context().storageState({ path: AuthFile });
});
