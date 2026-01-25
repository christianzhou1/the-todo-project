import { Page, expect } from "@playwright/test";
import { waitForNavigation, fillFieldByLabel, clickButtonByText } from "./test-utils";

/**
 * Authentication helper functions for E2E tests
 */
export class AuthHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to login page
   */
  async gotoLogin() {
    await this.page.goto("/");
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Fill login form
   */
  async fillLoginForm(usernameOrEmail: string, password: string) {
    await fillFieldByLabel(this.page, /username|email/i, usernameOrEmail);
    await fillFieldByLabel(this.page, /password/i, password);
  }

  /**
   * Submit login form
   */
  async submitLogin() {
    await clickButtonByText(this.page, /login/i);
    await waitForNavigation(this.page);
  }

  /**
   * Complete login flow
   */
  async login(usernameOrEmail: string, password: string) {
    await this.gotoLogin();
    await this.fillLoginForm(usernameOrEmail, password);
    await this.submitLogin();
  }

  /**
   * Check if logged in (by checking for dashboard or logout button)
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      // Check for logout button or dashboard content
      const logoutButton = this.page.getByRole("button", { name: /logout/i });
      const isVisible = await logoutButton.isVisible({ timeout: 2000 }).catch(() => false);
      return isVisible;
    } catch {
      return false;
    }
  }

  /**
   * Logout
   */
  async logout() {
    const logoutButton = this.page.getByRole("button", { name: /logout/i });
    await logoutButton.click();
    await waitForNavigation(this.page);
    
    // Verify we're logged out
    await expect(this.page.getByRole("heading", { name: /login|register/i })).toBeVisible();
  }

  /**
   * Navigate to registration page
   */
  async gotoRegistration() {
    await this.page.goto("/");
    await this.page.waitForLoadState("networkidle");
    // Click link to switch to registration
    const registerLink = this.page.getByRole("button", { name: /register|sign up/i });
    if (await registerLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await registerLink.click();
      await waitForNavigation(this.page);
    }
  }

  /**
   * Fill registration form
   */
  async fillRegistrationForm(data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName?: string;
    lastName?: string;
  }) {
    await fillFieldByLabel(this.page, /username/i, data.username);
    await fillFieldByLabel(this.page, /email/i, data.email);
    
    const passwordFields = this.page.getByLabel(/password/i);
    const passwordCount = await passwordFields.count();
    
    if (passwordCount > 0) {
      await passwordFields.first().fill(data.password);
    }
    
    await fillFieldByLabel(this.page, /confirm password/i, data.confirmPassword);
    
    if (data.firstName) {
      await fillFieldByLabel(this.page, /first name/i, data.firstName);
    }
    
    if (data.lastName) {
      await fillFieldByLabel(this.page, /last name/i, data.lastName);
    }
  }

  /**
   * Submit registration form
   */
  async submitRegistration() {
    await clickButtonByText(this.page, /register/i);
    await waitForNavigation(this.page);
  }

  /**
   * Complete registration flow
   */
  async register(data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName?: string;
    lastName?: string;
  }) {
    await this.gotoRegistration();
    await this.fillRegistrationForm(data);
    await this.submitRegistration();
  }

  /**
   * Wait for authentication check to complete
   */
  async waitForAuthCheck() {
    // Wait for loading spinner to disappear
    await this.page.waitForSelector('[role="progressbar"]', { state: "hidden" }).catch(() => {});
    await this.page.waitForTimeout(500);
  }
}

