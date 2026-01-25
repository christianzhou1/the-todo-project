import { test, expect } from "@playwright/test";
import { setupMockedBackend } from "./mocks/e2e-server";
import { AuthHelpers } from "./helpers/auth-helpers";
import { clearStorage, waitForAppReady } from "./helpers/test-utils";

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    // Setup mocked backend for all auth tests
    await setupMockedBackend(page);
    await clearStorage(page);
    await page.goto("/");
    await waitForAppReady(page);
  });

  test.describe("Login", () => {
    test("should display login form", async ({ page }) => {
      const auth = new AuthHelpers(page);
      await auth.gotoLogin();

      // Check for login form elements
      await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();
      await expect(page.getByLabel(/username|email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /login/i })).toBeVisible();
    });

    test("should login successfully with valid credentials", async ({ page }) => {
      const auth = new AuthHelpers(page);
      await auth.login("testuser", "password123");

      // Should be redirected to dashboard
      await expect(page.getByRole("button", { name: /logout/i })).toBeVisible();
      
      // Check that we're authenticated
      const isLoggedIn = await auth.isLoggedIn();
      expect(isLoggedIn).toBe(true);
    });

    test("should show error with invalid credentials", async ({ page }) => {
      const auth = new AuthHelpers(page);
      await auth.gotoLogin();
      await auth.fillLoginForm("testuser", "wrongpassword");
      await auth.submitLogin();

      // Should show error message
      await expect(page.getByText(/invalid credentials/i)).toBeVisible();
      
      // Should still be on login page
      await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();
    });

    test("should navigate to registration from login", async ({ page }) => {
      const auth = new AuthHelpers(page);
      await auth.gotoLogin();

      // Click link to registration
      const registerLink = page.getByRole("button", { name: /register|sign up/i });
      if (await registerLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await registerLink.click();
        await page.waitForLoadState("networkidle");
        
        // Should see registration form
        await expect(page.getByRole("heading", { name: /register/i })).toBeVisible();
      }
    });
  });

  test.describe("Registration", () => {
    test("should display registration form", async ({ page }) => {
      const auth = new AuthHelpers(page);
      await auth.gotoRegistration();

      // Check for registration form elements
      await expect(page.getByRole("heading", { name: /register/i })).toBeVisible();
      await expect(page.getByLabel(/username/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i).first()).toBeVisible();
      await expect(page.getByLabel(/confirm password/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /register/i })).toBeVisible();
    });

    test("should register successfully with valid data", async ({ page }) => {
      const auth = new AuthHelpers(page);
      await auth.register({
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
        confirmPassword: "password123",
        firstName: "New",
        lastName: "User",
      });

      // Should show success message
      await expect(page.getByText(/registration successful/i)).toBeVisible({ timeout: 5000 });
    });

    test("should validate password mismatch", async ({ page }) => {
      const auth = new AuthHelpers(page);
      await auth.gotoRegistration();
      await auth.fillRegistrationForm({
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
        confirmPassword: "differentpassword",
      });
      await auth.submitRegistration();

      // Should show validation error
      await expect(page.getByText(/passwords do not match/i)).toBeVisible();
    });

    test("should validate password length", async ({ page }) => {
      const auth = new AuthHelpers(page);
      await auth.gotoRegistration();
      await auth.fillRegistrationForm({
        username: "newuser",
        email: "newuser@example.com",
        password: "short",
        confirmPassword: "short",
      });
      await auth.submitRegistration();

      // Should show validation error
      await expect(page.getByText(/password must be at least 6 characters/i)).toBeVisible();
    });

    test("should validate username length", async ({ page }) => {
      const auth = new AuthHelpers(page);
      await auth.gotoRegistration();
      await auth.fillRegistrationForm({
        username: "ab",
        email: "user@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      await auth.submitRegistration();

      // Should show validation error
      await expect(page.getByText(/username must be at least 3 characters/i)).toBeVisible();
    });

    test("should validate email format", async ({ page }) => {
      const auth = new AuthHelpers(page);
      await auth.gotoRegistration();
      await auth.fillRegistrationForm({
        username: "newuser",
        email: "invalidemail",
        password: "password123",
        confirmPassword: "password123",
      });
      await auth.submitRegistration();

      // Should show validation error
      await expect(page.getByText(/please enter a valid email address/i)).toBeVisible({ timeout: 3000 });
    });

    test("should show error for existing username", async ({ page }) => {
      const auth = new AuthHelpers(page);
      await auth.gotoRegistration();
      await auth.fillRegistrationForm({
        username: "existinguser",
        email: "existing@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      await auth.submitRegistration();

      // Should show error message
      await expect(page.getByText(/username already exists/i)).toBeVisible({ timeout: 3000 });
    });

    test("should navigate to login from registration", async ({ page }) => {
      const auth = new AuthHelpers(page);
      await auth.gotoRegistration();

      // Click link to login
      const loginLink = page.getByRole("button", { name: /login here/i });
      if (await loginLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await loginLink.click();
        await page.waitForLoadState("networkidle");
        
        // Should see login form
        await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();
      }
    });
  });

  test.describe("Logout", () => {
    test("should logout successfully", async ({ page }) => {
      const auth = new AuthHelpers(page);
      
      // First login
      await auth.login("testuser", "password123");
      await expect(page.getByRole("button", { name: /logout/i })).toBeVisible();

      // Then logout
      await auth.logout();

      // Should be redirected to login page
      await expect(page.getByRole("heading", { name: /login|register/i })).toBeVisible();
      
      // Should not be authenticated
      const isLoggedIn = await auth.isLoggedIn();
      expect(isLoggedIn).toBe(false);
    });
  });

  test.describe("Protected Routes", () => {
    test("should redirect to login when accessing dashboard without authentication", async ({ page }) => {
      // Clear any existing auth
      await clearStorage(page);
      
      // Try to access dashboard directly
      await page.goto("/");
      await waitForAppReady(page);

      // Should see login form, not dashboard
      await expect(page.getByRole("heading", { name: /login|register/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /logout/i })).not.toBeVisible();
    });
  });
});

