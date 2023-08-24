import { test, expect, Page } from "@playwright/test";

test.describe("Navigation", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(process.env.PAGE_URL || "", {
      waitUntil: "domcontentloaded",
    });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("Check global navigation", async () => {
    const header = page.locator("[data-automationid='SiteHeaderTitle'] a");
    await header.waitFor();

    expect(header).toHaveText("Communication site");
  });
});
