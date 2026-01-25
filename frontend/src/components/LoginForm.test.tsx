import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "../test/utils/test-utils";
import userEvent from "@testing-library/user-event";
import LoginForm from "./LoginForm";

// Mock authService
vi.mock("../services", () => ({
  authService: {
    login: vi.fn(),
  },
}));

import { authService } from "../services";

describe("LoginForm", () => {
  const mockOnLoginSuccess = vi.fn();
  const mockOnSwitchToRegistration = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should render login form with all fields", () => {
    render(
      <LoginForm
        onLoginSuccess={mockOnLoginSuccess}
        onSwitchToRegistration={mockOnSwitchToRegistration}
      />
    );

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByLabelText(/usernameOrEmail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  it("should update input fields when user types", async () => {
    const user = userEvent.setup();
    render(
      <LoginForm
        onLoginSuccess={mockOnLoginSuccess}
        onSwitchToRegistration={mockOnSwitchToRegistration}
      />
    );

    const usernameInput = screen.getByLabelText(/usernameOrEmail/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "password123");

    expect(usernameInput).toHaveValue("testuser");
    expect(passwordInput).toHaveValue("password123");
  });

  it("should call onLoginSuccess on successful login", async () => {
    const user = userEvent.setup();
    vi.mocked(authService.login).mockResolvedValue({
      code: 200,
      msg: "Login successful",
      data: {
        token: "test-token",
        userId: "test-user-id",
        username: "testuser",
        email: "test@example.com",
      },
    });

    render(
      <LoginForm
        onLoginSuccess={mockOnLoginSuccess}
        onSwitchToRegistration={mockOnSwitchToRegistration}
      />
    );

    await user.type(screen.getByLabelText(/usernameOrEmail/i), "testuser");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("should display error message on failed login", async () => {
    const user = userEvent.setup();
    vi.mocked(authService.login).mockResolvedValue({
      code: 401,
      msg: "Invalid credentials",
    });

    render(
      <LoginForm
        onLoginSuccess={mockOnLoginSuccess}
        onSwitchToRegistration={mockOnSwitchToRegistration}
      />
    );

    await user.type(screen.getByLabelText(/usernameOrEmail/i), "testuser");
    await user.type(screen.getByLabelText(/password/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });

    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });

  it("should show loading state while submitting", async () => {
    const user = userEvent.setup();
    let resolveLogin: (value: unknown) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    vi.mocked(authService.login).mockReturnValue(loginPromise as never);

    render(
      <LoginForm
        onLoginSuccess={mockOnLoginSuccess}
        onSwitchToRegistration={mockOnSwitchToRegistration}
      />
    );

    await user.type(screen.getByLabelText(/usernameOrEmail/i), "testuser");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByText("Logging in...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logging in/i })).toBeDisabled();

    resolveLogin!({
      code: 200,
      msg: "Login successful",
      data: { token: "test-token", userId: "test-user-id" },
    });

    await waitFor(() => {
      expect(screen.queryByText("Logging in...")).not.toBeInTheDocument();
    });
  });

  it("should call onSwitchToRegistration when register link is clicked", async () => {
    const user = userEvent.setup();
    render(
      <LoginForm
        onLoginSuccess={mockOnLoginSuccess}
        onSwitchToRegistration={mockOnSwitchToRegistration}
      />
    );

    const registerLink = screen.getByRole("button", { name: /register here/i });
    await user.click(registerLink);

    expect(mockOnSwitchToRegistration).toHaveBeenCalledTimes(1);
  });

  it("should disable form fields while loading", async () => {
    const user = userEvent.setup();
    let resolveLogin: (value: unknown) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    vi.mocked(authService.login).mockReturnValue(loginPromise as never);

    render(
      <LoginForm
        onLoginSuccess={mockOnLoginSuccess}
        onSwitchToRegistration={mockOnSwitchToRegistration}
      />
    );

    const usernameInput = screen.getByLabelText(/usernameOrEmail/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    expect(usernameInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();

    resolveLogin!({
      code: 200,
      msg: "Login successful",
      data: { token: "test-token", userId: "test-user-id" },
    });

    await waitFor(() => {
      expect(usernameInput).not.toBeDisabled();
    });
  });
});

