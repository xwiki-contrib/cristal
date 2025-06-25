import test, { expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/XWikiBlocknoteNoRealtime/#/Main.WebHome/edit");
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
  await expect(page.locator(".bn-container")).toBeVisible();
  await expect(page.locator(".bn-editor")).toBeVisible();
  await expect(page.locator(".bn-editor")).toContainClass("ProseMirror");
});

test("Content can be input", async ({ page }) => {
  const blocknote = page.locator(".bn-editor");

  await blocknote.fill("Hello world!");
  await expect(blocknote).toHaveText("Hello world!");
});

test("Content can be saved", async ({ page }) => {
  const blocknote = page.locator(".bn-editor");

  const str = `Randomized message ${Math.random()}`;

  await blocknote.clear();
  await blocknote.fill(str);
  await expect(blocknote).toHaveText(str);

  const saveBtn = page.locator(".pagemenu button:last-child");
  await expect(saveBtn).toBeVisible();
  await saveBtn.click();

  await page.waitForURL("/XWikiBlocknoteNoRealtime/#/Main.WebHome/view");
  await page.waitForLoadState("networkidle");

  const content = page.locator("#xwikicontent");
  await expect(content).toBeVisible();
  await expect(content).toHaveText(str);
});
