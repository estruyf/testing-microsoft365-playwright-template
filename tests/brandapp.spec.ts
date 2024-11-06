import { test, expect, Page } from "@playwright/test";
import {
  getAppFrame,
  getControlByName,
  getLabel,
} from "playwright-m365-helpers";
import { fakeMicrosoftBrandData } from "../mocks/fakeMicrosoftBrandData";

test.describe("PowerApps", () => {
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

  test("Mock API", async ({ page }) => {
    await page.route("**/invoke", async (route) => {
      const method = route.request().method();
      if (method !== "POST") {
        return route.continue();
      }

      const headers = route.request().headers();
      const requestUrl = headers["x-ms-request-url"];
      // Check the ID of the connections/connector
      // https://make.powerapps.com/environments/6c1b733c-0682-e5ac-bbf8-89f51c98c340/connections/shared_prn-5fbrandfetch-2dconnector-5f72b7a26212f7a221/9f2cd76458ae42eeb9265e231cff8578/details
      if (
        !requestUrl ||
        !requestUrl.includes(
          `prn-5fbrandfetch-2dconnector-5f72b7a26212f7a221/9f2cd76458ae42eeb9265e231cff8578`
        )
      ) {
        return route.continue();
      }

      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(fakeMicrosoftBrandData),
      });
    });

    await page.goto(process.env.M365_PAGE_URL || "", {
      waitUntil: "domcontentloaded",
    });

    const canvas = await getAppFrame(page);
    const colorGallery = getControlByName(canvas, "gal_colors_1");
    await expect(colorGallery).toBeVisible();

    const colors = getLabel(colorGallery, "BrandColorHex");
    await expect(colors).toHaveCount(5);

    // Verify the colors
    const colorHexes = await colors.evaluateAll((elements) =>
      elements.map((el) => el.textContent?.trim())
    );
    expect(colorHexes).toEqual([
      "#131200",
      "#F2DC5D",
      "#E9806E",
      "#240B36",
      "#FFFFFF",
    ]);

    await page.screenshot({
      path: "screenshots/powerapps-mock-api.png",
    });
  });

  // test("Update brand", async () => {
  //   const canvas = await getAppFrame(page);
  //   const brandInput = getInput(canvas, "TextInput1_1");
  //   await brandInput.fill("spotify.com");

  //   const themeButton = getButton(canvas, "Button1_2");
  //   await themeButton.click();

  //   await page.waitForResponse((url) => url.url().includes("/invoke"));

  //   const brandText = getControlByName(canvas, "Label3_2");
  //   await expect(brandText).toHaveText(/Spotify/);
  // });

  // test("Check second screen", async () => {
  //   const canvas = await getAppFrame(page);
  //   const nextButton = canvas.locator(
  //     `div[data-control-name='Label3_2'] .appmagic-label`
  //   );
  //   await nextButton.click();

  //   const submitBtn = canvas.locator("div[data-control-name='Button2']");
  //   await expect(submitBtn).toHaveText(/Submit/);
  //   await submitBtn.click();

  //   const gallery = canvas.locator("div[data-control-name='Gallery1_1']");
  //   await expect(gallery).toBeVisible();

  //   const items = gallery.getByRole("listitem");
  //   await expect(items).toHaveCount(1);

  //   const item = items.first();
  //   await expect(item).toHaveText(/I can't even/);
  // });
});
