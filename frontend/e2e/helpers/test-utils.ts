import { Page, expect } from "@playwright/test";

/**
 * Wait for the application to be ready
 */
export async function waitForAppReady(page: Page) {
  // Wait for the main app content to load
  await page.waitForSelector("body", { state: "visible" });
  // Wait a bit for React to hydrate
  await page.waitForTimeout(500);
}

/**
 * Clear all browser storage (localStorage, sessionStorage)
 */
export async function clearStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Check if user is authenticated by checking localStorage
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    return !!(token && userId);
  });
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);
}

/**
 * Get text content from an element, handling null cases
 */
export async function getTextContent(
  page: Page,
  selector: string
): Promise<string> {
  const element = await page.locator(selector).first();
  return (await element.textContent()) || "";
}

/**
 * Check if element is visible and contains text
 */
export async function expectVisibleWithText(
  page: Page,
  selector: string,
  text: string | RegExp
) {
  const element = page.locator(selector).first();
  await expect(element).toBeVisible();
  await expect(element).toContainText(text);
}

/**
 * Fill form field with label
 */
export async function fillFieldByLabel(
  page: Page,
  label: string | RegExp,
  value: string
) {
  const field = page.getByLabel(label);
  await field.fill(value);
}

/**
 * Click button by text
 */
export async function clickButtonByText(
  page: Page,
  text: string | RegExp
) {
  const button = page.getByRole("button", { name: text });
  await button.click();
}

