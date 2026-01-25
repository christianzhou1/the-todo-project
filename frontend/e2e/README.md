# E2E Testing with Playwright

This directory contains end-to-end tests for the SkySync application using Playwright.

## Overview

The E2E tests validate critical user flows across the entire application, including:
- User authentication (registration, login, logout)
- Task management (CRUD operations)
- Task hierarchy (parent/child relationships)
- Form validation
- Protected route access

## Test Structure

```
e2e/
├── auth.spec.ts              # Authentication flow tests
├── tasks.spec.ts             # Task management tests
├── helpers/
│   ├── test-utils.ts         # Common test utilities
│   ├── api-helpers.ts        # API interaction helpers
│   └── auth-helpers.ts       # Auth-specific helpers
├── mocks/
│   ├── e2e-server.ts         # Mock backend setup
│   ├── route-handlers.ts     # Playwright route handlers
│   └── setup.ts              # Test fixtures
└── README.md                 # This file
```

## Running Tests

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

### Test Modes

The test suite supports two modes:

#### 1. Mocked Backend (Default)

Tests run against mocked API responses using Playwright's route interception. No backend or database required.

```bash
# Run all E2E tests with mocked backend
npm run test:e2e

# Or explicitly
npm run test:e2e:mocked
```

#### 2. Real Backend

Tests run against a real backend and database. Requires:
- Backend server running on `http://localhost:8080`
- Database running and accessible

```bash
# Run tests against real backend
npm run test:e2e:real
```

### Other Commands

```bash
# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test auth.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests for specific project
npx playwright test --project=mocked
```

## Test Configuration

Configuration is in `playwright.config.ts` at the project root. Key settings:

- **Base URL**: `http://localhost:5173` (Vite dev server)
- **Test Directory**: `./e2e`
- **Projects**: `mocked` and `real-backend`
- **Browsers**: Chromium (default), Firefox and WebKit available
- **Timeouts**: 30 seconds default
- **Screenshots**: On failure only
- **Videos**: On failure only

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from "@playwright/test";
import { setupMockedBackend } from "./mocks/e2e-server";
import { AuthHelpers } from "./helpers/auth-helpers";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    // Setup mocked backend
    await setupMockedBackend(page);
    
    // Login if needed
    const auth = new AuthHelpers(page);
    await auth.login("testuser", "password123");
  });

  test("should do something", async ({ page }) => {
    // Your test code here
    await expect(page.getByText("Expected Text")).toBeVisible();
  });
});
```

### Using Helpers

#### Authentication Helpers

```typescript
import { AuthHelpers } from "./helpers/auth-helpers";

const auth = new AuthHelpers(page);
await auth.login("username", "password");
await auth.logout();
await auth.register({ username, email, password, confirmPassword });
```

#### Test Utilities

```typescript
import { clearStorage, waitForAppReady } from "./helpers/test-utils";

await clearStorage(page);
await waitForAppReady(page);
```

#### API Helpers (for real backend tests)

```typescript
import { ApiHelpers } from "./helpers/api-helpers";

const api = new ApiHelpers(page);
await api.createTestUser({ username, email, password });
await api.cleanupTestData(userId, token);
```

### Best Practices

1. **Use descriptive test names**: Test names should clearly describe what is being tested
2. **Setup and teardown**: Use `beforeEach` to set up test state and clean up after
3. **Wait for elements**: Use Playwright's auto-waiting, but add explicit waits when needed
4. **Use page object pattern**: For complex pages, consider creating page objects
5. **Isolate tests**: Each test should be independent and not rely on other tests
6. **Clean up**: Clear storage and reset state between tests

## Mocked Backend

The mocked backend uses Playwright's route interception to simulate API responses. Handlers are defined in:
- `e2e/mocks/route-handlers.ts` - Route handlers for Playwright
- `src/test/mocks/handlers.ts` - Original MSW handlers (reference)

### Adding New Mock Handlers

1. Add the route handler in `e2e/mocks/route-handlers.ts`
2. Follow the pattern of existing handlers
3. Ensure it matches the API contract

## Troubleshooting

### Tests fail with "Target closed" or "Page closed"

- Ensure the dev server is running (`npm run dev`)
- Check that the base URL is correct in `playwright.config.ts`
- Increase timeout if needed

### Tests fail with authentication errors

- Clear browser storage: `await clearStorage(page)`
- Ensure login is completed before other actions
- Check that mocked backend is set up correctly

### Tests are flaky

- Add explicit waits for async operations
- Use `waitForLoadState("networkidle")` when needed
- Increase timeouts for slow operations
- Check for race conditions

### Mocked backend not working

- Verify route handlers are correctly set up
- Check that API URLs match between app and mocks
- Ensure `setupMockedBackend(page)` is called in `beforeEach`

## CI/CD Integration

To run E2E tests in CI:

```yaml
# Example GitHub Actions
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
```

## Debugging

### Debug Mode

```bash
npm run test:e2e:debug
```

This opens Playwright Inspector where you can:
- Step through tests
- Inspect page state
- View network requests
- See console logs

### UI Mode

```bash
npm run test:e2e:ui
```

Interactive UI to:
- Run specific tests
- Watch tests execute
- See test results
- Debug failures

### Screenshots and Videos

Screenshots and videos are automatically saved on test failure in:
- `test-results/` directory

### Console Logs

View browser console logs:
```typescript
page.on('console', msg => console.log(msg.text()));
```

## Adding New Tests

1. Create a new test file: `e2e/feature-name.spec.ts`
2. Import necessary helpers and utilities
3. Write tests following the existing patterns
4. Update this README if adding new test categories

## Test Coverage

Current test coverage:
- ✅ Authentication (login, registration, logout, validation)
- ✅ Task CRUD (create, read, update, delete)
- ✅ Task completion toggle
- ✅ Task selection and detail view
- ✅ Task hierarchy (parent/child tasks)
- ✅ Form validation
- ✅ Protected routes

Future enhancements:
- File attachment upload/download
- Mobile vs desktop layout tests
- Visual regression testing
- Performance testing

