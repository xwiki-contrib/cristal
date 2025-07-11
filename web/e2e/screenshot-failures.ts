import { Page, TestInfo } from "@playwright/test";

/**
 * Take a screenshot if the test failed
 *
 * @param page -
 * @param testInfo -
 */
export async function screenshotIfTestFailed(
  page: Page,
  testInfo: TestInfo,
): Promise<void> {
  if (testInfo.status !== testInfo.expectedStatus) {
    // Get a unique place for the screenshot.
    const screenshotPath = testInfo.outputPath("failure.png");
    // Add it to the report.
    testInfo.attachments.push({
      name: "screenshot",
      path: screenshotPath,
      contentType: "image/png",
    });
    // Take the screenshot itself.
    await page.screenshot({ path: screenshotPath, timeout: 5000 });
  }
}
