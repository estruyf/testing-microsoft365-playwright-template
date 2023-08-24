import { test as setup } from "@playwright/test";
import { AuthFile } from "../constants/AuthFile";

/**
 * Login to Microsoft 365
 * More info: https://playwright.dev/docs/auth
 */
setup("authenticate", async ({ page }) => {
  await page.goto(process.env.PAGE_URL || "");

  const emailInput = page.locator("input[type=email]");
  await emailInput.waitFor();
  await emailInput.click();
  await emailInput.fill(process.env.USERNAME || "");

  await page.getByRole("button", { name: "Next" }).click();

  const passwordInput = page.locator("input[type=password]");
  await passwordInput.waitFor();
  await passwordInput.click();
  await passwordInput.fill(process.env.PASSWORD || "");

  await page.locator("input[type=submit][value='Sign in']").click();
  await page.locator("input[type=submit][value='Yes']").click();
  await page.waitForURL(process.env.PAGE_URL || "");

  await page.context().storageState({ path: AuthFile });
});
