import { test as setup } from "@playwright/test";
import { AuthFile } from "../constants/AuthFile";
import * as OTPAuth from "otpauth";

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

  // Check if there is an Microsft Authenticator app prompt
  const otherWayLink = page.locator("a#signInAnotherWay");
  await otherWayLink.waitFor({ timeout: 2000 });
  if (await otherWayLink.isVisible()) {
    await otherWayLink.click();

    const otpLink = page.locator(`div[data-value="PhoneAppOTP"]`);
    await otpLink.click();
  }

  // Fill in the OTP code
  const otpInput = await page.waitForSelector("input#idTxtBx_SAOTCC_OTC");
  let totp = new OTPAuth.TOTP({
    issuer: "Microsoft",
    label: process.env.M365_USERNAME,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: process.env.M365_OTP_SECRET,
  });
  const code = totp.generate();
  await otpInput.fill(code);

  await page.locator("input[type=submit]").click();
  await page.locator("input[type=submit][value='Yes']").click();
  await page.waitForURL(process.env.M365_PAGE_URL || "");

  await page.context().storageState({ path: AuthFile });
});
