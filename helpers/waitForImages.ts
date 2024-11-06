import { Locator } from "@playwright/test";

export const waitForImages = async (locator: Locator): Promise<void> => {
  const imgLocator = locator.locator("img");
  // Set up listeners concurrently
  const promises: Promise<any>[] = [];
  const totalElms = await imgLocator.count();
  for (let i = 0; i < totalElms; i++) {
    promises.push(
      imgLocator
        .nth(i)
        .evaluate(
          (image: HTMLImageElement) =>
            image.complete || new Promise((f) => (image.onload = f))
        )
    );
  }
  // Wait for all once
  await Promise.all(promises);
};
