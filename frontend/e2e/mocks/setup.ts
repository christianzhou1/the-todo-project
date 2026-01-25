import { test as base } from "@playwright/test";
import { setupMockedBackend } from "./e2e-server";

/**
 * Extended test fixture for mocked backend
 * Use this fixture in tests that need mocked API responses
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await setupMockedBackend(page);
    await use(page);
  },
});

export { expect } from "@playwright/test";

