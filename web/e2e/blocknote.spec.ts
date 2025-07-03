import test, { expect } from "@playwright/test";
import { screenshotIfTestFailed } from "./screenshot-failures";

test.beforeEach(async ({ page }) => {
  await page.goto("/XWikiBlocknoteNoRealtime/#/Main.WebHome/edit");
  await page.waitForLoadState("networkidle");

  await expect(page).toHaveTitle("Cristal Wiki");

  await page.waitForSelector(".bn-container");
  expect(page.locator(".bn-container")).toBeVisible();

  await page.waitForSelector(".bn-editor");
  expect(page.locator(".bn-editor")).toBeVisible();
});

test.afterEach(async ({ page }, testInfo) => {
  await screenshotIfTestFailed(page, testInfo);
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

  // TODO: storage mocking to enable saving (https://jira.xwiki.org/browse/CRISTAL-579)

  // This code is left here as a reference as it should work perfectly once we have storage mocking

  // await saveBtn.click();

  // await page.waitForURL("/XWikiBlocknoteNoRealtime/#/Main.WebHome/view");
  // await page.waitForLoadState("networkidle");

  // const content = page.locator("#xwikicontent");
  // await expect(content).toBeVisible();
  // await expect(content).toHaveText(str);
});
