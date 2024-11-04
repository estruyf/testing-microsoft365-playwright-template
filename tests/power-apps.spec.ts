import { test, expect, Page } from "@playwright/test";
import { getAppFrame } from "playwright-m365-helpers";

test.describe("Power Apps", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(process.env.M365_PAGE_URL || "", {
      waitUntil: "domcontentloaded",
    });

    const splashScreen = page.locator("#playerSplashScreen");
    await splashScreen.waitFor({ state: "hidden" });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("Check if canvas is loaded", async () => {
    await getAppFrame(page);
  });
});
