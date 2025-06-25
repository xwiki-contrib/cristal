import test, { expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/XWikiBlocknote/#/Main.WebHome/edit");
  await page.waitForLoadState("networkidle");

  await expect(page).toHaveTitle(/Cristal Wiki/);

  await page.waitForSelector(".bn-container");
  expect(page.locator(".bn-container")).toBeVisible();

  await page.waitForSelector(".bn-editor");
  expect(page.locator(".bn-editor")).toBeVisible();
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    // Get a unique place for the screenshot.
    const screenshotPath = testInfo.outputPath(`failure.png`);
    // Add it to the report.
    testInfo.attachments.push({
      name: "screenshot",
      path: screenshotPath,
      contentType: "image/png",
    });
    // Take the screenshot itself.
    await page.screenshot({ path: screenshotPath, timeout: 5000 });
  }
});

test("BlockNote shows up", async ({ page }) => {
  expect(page.locator(".bn-container")).toBeVisible();
  expect(page.locator(".bn-editor")).toBeVisible();
  expect(page.locator(".bn-editor")).toContainClass("ProseMirror");
});

test("Content can be input", async ({ page }) => {
  const blocknote = page.locator(".bn-editor");

  blocknote.fill("Hello world!");
  expect(blocknote).toContainText("Hello world!");
});
