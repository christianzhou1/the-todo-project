import { Page } from "@playwright/test";
import { setupMockRoutes } from "./route-handlers";

/**
 * Setup route interception for mocked backend in E2E tests
 * This uses Playwright's route interception instead of MSW for better E2E compatibility
 */
export async function setupMockedBackend(page: Page) {
  await page.route("**/api/**", (route) => {
    setupMockRoutes(route);
  });
}

/**
 * Remove route interception (for real backend tests)
 */
export async function removeMockedBackend(page: Page) {
  await page.unroute("**/api/**");
}

