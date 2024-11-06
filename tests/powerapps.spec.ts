import { test, expect, Page } from "@playwright/test";
import {
  getAppFrame,
  getButton,
  getControlByName,
  getDropdown,
  getGalleryItems,
  getInput,
  getLabel,
  getRadio,
  getRadioOptions,
  getScreen,
  getToggle,
  mockConnector,
  selectDropdownOption,
  selectRadioOption,
  waitForConnectorResponse,
} from "playwright-m365-helpers";
import { inventoryItems } from "../mocks/inventoryItems";
import { waitForImages } from "../helpers/waitForImages";
import { fakeItem } from "../mocks/fakeItem";

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

  test("Check label", async () => {
    const frame = await getAppFrame(page);

    const label = getControlByName(frame, "Label1");
    await expect(label).toHaveText(/Text/);
  });

  test("Check input", async () => {
    const frame = await getAppFrame(page);

    const input = getInput(frame, "TextInput1");
    await expect(input).toBeVisible();
    await input.fill("Hello World");
  });

  test("Check button", async () => {
    const frame = await getAppFrame(page);

    const button = getButton(frame, "Button1");
    await button.click();
    await expect(button).toBeVisible();
  });

  test("Check dropdown", async () => {
    const frame = await getAppFrame(page);

    const dropdown = getDropdown(frame, "DropdownOptions");
    await expect(dropdown).toBeVisible();
    await selectDropdownOption(frame, dropdown, "2");

    // Check if the second option is selected
    await expect(dropdown).toHaveText(/2/);
  });

  test("Check toggle", async () => {
    const frame = await getAppFrame(page);

    const toggle = getToggle(frame, "Toggle1");
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  test("Check radio", async () => {
    const frame = await getAppFrame(page);

    const radio = getRadio(frame, "Radio2");
    await expect(radio).toBeVisible();

    await selectRadioOption(radio, "2");

    const selectedOption = await getRadioOptions(frame, radio, true);
    console.log(selectedOption);
    await expect(selectedOption).toHaveText(/2/);
  });

  test("Mock API with only one result", async ({ page }) => {
    const firstItem = inventoryItems.value[0];
    await mockConnector(
      page,
      "sharepointonline/4aee3a63496d4e3f998c3910ba712bf2",
      { value: [firstItem] },
      "GET",
      200,
      { logging: true }
    );

    await page.goto(process.env.M365_PAGE_URL || "", {
      waitUntil: "domcontentloaded",
    });

    const canvas = await getAppFrame(page);
    const nextButton = getButton(canvas, "NextBtn_1");
    await nextButton.click();

    const gallery = getControlByName(canvas, "Gallery1");
    await expect(gallery).toBeVisible();

    const galleryItems = getGalleryItems(gallery);
    await expect(galleryItems).toHaveCount(1);

    await page.screenshot({
      path: "screenshots/inventory-one-result.png",
    });
  });

  test("Mock API with two results", async ({ page }) => {
    const firstTwoItems = inventoryItems.value.slice(0, 2);
    await mockConnector(
      page,
      "sharepointonline/4aee3a63496d4e3f998c3910ba712bf2",
      { value: [...firstTwoItems] },
      "GET",
      200,
      { logging: true }
    );

    await page.goto(process.env.M365_PAGE_URL || "", {
      waitUntil: "domcontentloaded",
    });

    const canvas = await getAppFrame(page);
    const nextButton = getButton(canvas, "NextBtn_1");
    await nextButton.click();

    const gallery = getControlByName(canvas, "Gallery1");
    await expect(gallery).toBeVisible();

    const galleryItems = getGalleryItems(gallery);
    await expect(galleryItems).toHaveCount(firstTwoItems.length);

    await page.screenshot({
      path: "screenshots/inventory-two-results.png",
    });
  });

  test("All inventory items", async ({ page }) => {
    await page.goto(process.env.M365_PAGE_URL || "", {
      waitUntil: "domcontentloaded",
    });

    const canvas = await getAppFrame(page);
    const nextButton = getButton(canvas, "NextBtn_1");
    await nextButton.click();

    const response = await waitForConnectorResponse(
      page,
      "sharepointonline/4aee3a63496d4e3f998c3910ba712bf2",
      "GET",
      { logging: true }
    );

    const data = await response.json();
    const totalItem = data.value.length;

    const gallery = getControlByName(canvas, "Gallery1");
    await expect(gallery).toBeVisible();

    const galleryItems = getGalleryItems(gallery);
    await expect(galleryItems).toHaveCount(totalItem);

    await waitForImages(gallery);

    await page.screenshot({
      path: "screenshots/inventory-list-results.png",
    });
  });

  test("Check selection state", async ({ page }) => {
    await page.goto(process.env.M365_PAGE_URL || "", {
      waitUntil: "domcontentloaded",
    });

    const canvas = await getAppFrame(page);
    const nextButton = getButton(canvas, "NextBtn_1");
    await nextButton.click();

    const response = await waitForConnectorResponse(
      page,
      "sharepointonline/4aee3a63496d4e3f998c3910ba712bf2",
      "GET",
      { logging: false }
    );

    const data = await response.json();
    const totalItem = data.value.length;

    const gallery = getControlByName(canvas, "Gallery1");
    await expect(gallery).toBeVisible();

    const galleryItems = getGalleryItems(gallery);
    await expect(galleryItems).toHaveCount(totalItem);

    await waitForImages(gallery);

    const secondItem = galleryItems.nth(1);
    const descriptionLabel = getLabel(secondItem, "DescriptionLabel");
    await expect(descriptionLabel).not.toBeVisible();

    const infoBtn = getControlByName(secondItem, "InfoBtn");
    await infoBtn.click();

    await expect(descriptionLabel).toBeVisible();

    await page.screenshot({
      path: "screenshots/inventory-result-description.png",
    });
  });

  test("Check if a new sticker can be created", async ({ page }) => {
    await page.goto(process.env.M365_PAGE_URL || "", {
      waitUntil: "domcontentloaded",
    });

    await mockConnector(
      page,
      "sharepointonline/4aee3a63496d4e3f998c3910ba712bf2",
      {
        value: [],
      },
      "GET",
      200,
      { logging: true }
    );

    const canvas = await getAppFrame(page);
    const nextButton = getButton(canvas, "NextBtn_1");
    await nextButton.click();

    await waitForConnectorResponse(
      page,
      "sharepointonline/4aee3a63496d4e3f998c3910ba712bf2",
      "GET",
      { logging: false }
    );

    const createBtn = getButton(canvas, "NextBtn_2");
    await createBtn.click();

    const titleField = getInput(canvas, "TitleValue");
    const descriptionField = getInput(canvas, "DescriptionValue", true);
    const imageField = getInput(canvas, "ImageValue");
    const priceField = getInput(canvas, "PriceValue");
    const totalField = getInput(canvas, "TotalValue");

    const titleError = getLabel(canvas, "TitleError");
    const descriptionError = getLabel(canvas, "DescriptionError");
    const priceError = getLabel(canvas, "PriceError");

    await expect(titleError).toBeVisible();
    await expect(descriptionError).toBeVisible();
    await expect(priceError).toBeVisible();

    let submitBtn = getControlByName(canvas, "SubmitFormBtn");
    await expect(submitBtn).not.toBeVisible();

    const sticker = {
      title: "TypeScript Bear",
      description:
        "Serious coding business! 🐻💼 Meet the TypeScript Bear sticker, where this bear means TypeScript business. With a stern expression and TypeScript prowess, it's the perfect sticker for developers who take their TypeScript seriously.",
      image: "typescript-bear/typescript-bear.png",
      price: 3.5,
      total: 75,
    };

    await titleField.fill(sticker.title);
    await descriptionField.fill(sticker.description);
    await imageField.fill(sticker.image);
    await priceField.fill(sticker.price.toString());
    await totalField.fill(sticker.total.toString());

    await expect(titleError).not.toBeVisible();
    await expect(descriptionError).not.toBeVisible();
    await expect(priceError).not.toBeVisible();

    submitBtn = getControlByName(canvas, "SubmitFormBtn");
    await expect(submitBtn).toBeVisible();

    // Mock the POST request to create a new sticker
    await mockConnector(
      page,
      "sharepointonline/4aee3a63496d4e3f998c3910ba712bf2",
      fakeItem(
        999,
        sticker.title,
        sticker.description,
        sticker.image,
        sticker.price,
        sticker.total
      ),
      "POST",
      201,
      { logging: true }
    );

    await submitBtn.click();

    await waitForConnectorResponse(
      page,
      "sharepointonline/4aee3a63496d4e3f998c3910ba712bf2",
      "POST",
      { logging: true }
    );

    // Mock the response to include the new sticker
    await mockConnector(
      page,
      "sharepointonline/4aee3a63496d4e3f998c3910ba712bf2",
      {
        value: [
          fakeItem(
            999,
            sticker.title,
            sticker.description,
            sticker.image,
            sticker.price,
            sticker.total
          ),
        ],
      },
      "GET",
      200,
      { logging: true }
    );

    await waitForConnectorResponse(
      page,
      "sharepointonline/4aee3a63496d4e3f998c3910ba712bf2",
      "GET",
      { logging: false }
    );

    const screen2 = getScreen(canvas, "Screen2");
    await expect(screen2).toBeVisible();

    const gallery = getControlByName(canvas, "Gallery1");
    const galleryItems = getGalleryItems(gallery);

    const firstItem = galleryItems.first();
    const stickerTitle = getLabel(firstItem, "StickerTitle");
    console.log(await stickerTitle.innerText());
    await expect(stickerTitle).toHaveText(sticker.title);

    await waitForImages(gallery);

    await page.screenshot({
      path: "screenshots/inventory-new-item.png",
      animations: "disabled",
    });
  });
});
