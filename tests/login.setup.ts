import { test as setup } from "@playwright/test";
import { AuthFile } from "../constants/AuthFile";

/**
 * Login to Microsoft 365
 * More info: https://playwright.dev/docs/auth
 */
setup("authenticate", async ({ page }) => {
  await page.goto(process.env.M365_PAGE_URL || "");

  const emailInput = page.locator("input[type=email]");
  await emailInput.click();
  await emailInput.fill(process.env.M365_USERNAME || "");

  await page.getByRole("button", { name: "Next" }).click();

  const passwordInput = page.locator("input[type=password]");
  await passwordInput.click();
  await passwordInput.fill(process.env.M365_PASSWORD || "");

  await page.locator("input[type=submit]").click();
  await page.locator("input[type=submit][value='Yes']").click();
  await page.waitForURL(process.env.M365_PAGE_URL || "");

  await page.context().storageState({ path: AuthFile });
});
