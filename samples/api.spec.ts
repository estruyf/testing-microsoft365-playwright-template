import { test, expect, Page } from "@playwright/test";

test.describe("API Testing", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto("https://*.sharepoint.com/SitePages/API-Testing.aspx", {
      waitUntil: "domcontentloaded",
    });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("API success - 200", async () => {
    const result = page.getByTestId("api-result");

    await expect(result).toHaveText("Result: 200");
  });

  test("API throttled - 429", async () => {
    await page.route("**/_api/web/lists", async (route) => {
      await route.fulfill({
        status: 429,
      });
    });

    const result = page.getByTestId("api-result");

    await expect(result).toHaveText(
      "Result: 429 - Too Many Requests, 429 - Too Many Requests, 429 - Too Many Requests"
    );
  });

  test("API throttled (success) - 429", async () => {
    let nrOfCalls = 0;

    await page.route("**/_api/web/lists", async (route) => {
      nrOfCalls++;

      if (nrOfCalls === 3) {
        route.continue();
      } else {
        await route.fulfill({
          status: 429,
        });
      }
    });

    const result = page.getByTestId("api-result");

    await expect(result).toHaveText(
      "Result: 429 - Too Many Requests, 429 - Too Many Requests, 200"
    );
  });

  // test("API throttled (50% chance) - 429", async () => {
  //   await page.route("**/_api/web/lists", async (route) => {
  //     const rand = Math.random();
  //     const fail = rand < 0.9;
  //     console.log(`fail`, rand);
  //     if (fail) {
  //       await route.fulfill({
  //         status: 429,
  //       });
  //     } else {
  //       route.continue();
  //     }
  //   });

  //   const result = page.getByTestId("api-result");

  //   expect((await result.textContent())?.endsWith(`200`)).toBeTruthy();
  // });

  test("API failed - 500", async () => {
    await page.route("**/_api/web/lists", async (route) => {
      await route.fulfill({
        status: 500,
      });
    });

    const result = page.getByTestId("api-result");

    await expect(result).toHaveText("Result: 500 - Internal Server Error");
  });

  // test("API result with wrong body", async () => {
  //   await page.route("**/_api/web/lists", async (route) => {
  //     await route.fulfill({
  //       json: {
  //         items: [
  //           // ...
  //         ],
  //       },
  //     });
  //   });

  //   const result = page.getByTestId("api-result");

  //   await expect(result).toHaveText("Result: 200 - Unexpected response body");
  // });
});
