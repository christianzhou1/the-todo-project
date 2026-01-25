import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "../test/utils/test-utils";
import userEvent from "@testing-library/user-event";
import RegistrationForm from "./RegistrationForm";

// Mock authService
vi.mock("../services", () => ({
  authService: {
    register: vi.fn(),
  },
}));

import { authService } from "../services";

describe("RegistrationForm", () => {
  const mockOnSwitchToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render registration form with all fields", () => {
    render(<RegistrationForm onSwitchToLogin={mockOnSwitchToLogin} />);

    expect(screen.getByRole("heading", { name: "Register" })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    const passwordInputs = screen.getAllByLabelText(/password/i);
    expect(passwordInputs.length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  it("should update input fields when user types", async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSwitchToLogin={mockOnSwitchToLogin} />);

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);

    await user.type(usernameInput, "newuser");
    await user.type(emailInput, "newuser@example.com");

    expect(usernameInput).toHaveValue("newuser");
    expect(emailInput).toHaveValue("newuser@example.com");
  });

  it("should validate password mismatch", async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSwitchToLogin={mockOnSwitchToLogin} />);

    await user.type(screen.getByLabelText(/username/i), "newuser");
    await user.type(screen.getByLabelText(/email/i), "newuser@example.com");
    const passwordInputs = screen.getAllByLabelText(/password/i);
    await user.type(passwordInputs[0], "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "differentpassword");
    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    expect(authService.register).not.toHaveBeenCalled();
  });

  it("should validate password length", async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSwitchToLogin={mockOnSwitchToLogin} />);

    await user.type(screen.getByLabelText(/username/i), "newuser");
    await user.type(screen.getByLabelText(/email/i), "newuser@example.com");
    const passwordInputs = screen.getAllByLabelText(/password/i);
    await user.type(passwordInputs[0], "short");
    await user.type(screen.getByLabelText(/confirm password/i), "short");
    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });

    expect(authService.register).not.toHaveBeenCalled();
  });

  it("should validate username length", async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSwitchToLogin={mockOnSwitchToLogin} />);

    await user.type(screen.getByLabelText(/username/i), "ab");
    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    const passwordInputs = screen.getAllByLabelText(/password/i);
    await user.type(passwordInputs[0], "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
    });

    expect(authService.register).not.toHaveBeenCalled();
  });

  it("should validate email format", async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSwitchToLogin={mockOnSwitchToLogin} />);

    await user.type(screen.getByLabelText(/username/i), "newuser");
    await user.type(screen.getByLabelText(/email/i), "invalidemail");
    const passwordInputs = screen.getAllByLabelText(/password/i);
    await user.type(passwordInputs[0], "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      // The error message is displayed in an Alert component
      // The exact message is "Please enter a valid email address"
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(authService.register).not.toHaveBeenCalled();
  });

  it("should register successfully with valid data", async () => {
    const user = userEvent.setup();
    vi.mocked(authService.register).mockResolvedValue({
      code: 201,
      msg: "Registration successful",
      data: {
        id: "new-user-id",
        username: "newuser",
        email: "newuser@example.com",
      },
    });

    render(<RegistrationForm onSwitchToLogin={mockOnSwitchToLogin} />);

    await user.type(screen.getByLabelText(/username/i), "newuser");
    await user.type(screen.getByLabelText(/email/i), "newuser@example.com");
    const passwordInputs = screen.getAllByLabelText(/password/i);
    await user.type(passwordInputs[0], "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });

    expect(authService.register).toHaveBeenCalledWith(
      "newuser",
      "newuser@example.com",
      "password123",
      undefined,
      undefined
    );
  });

  it("should display error message on failed registration", async () => {
    const user = userEvent.setup();
    vi.mocked(authService.register).mockResolvedValue({
      code: 400,
      msg: "Username already exists",
    });

    render(<RegistrationForm onSwitchToLogin={mockOnSwitchToLogin} />);

    await user.type(screen.getByLabelText(/username/i), "existinguser");
    await user.type(screen.getByLabelText(/email/i), "existing@example.com");
    const passwordInputs = screen.getAllByLabelText(/password/i);
    await user.type(passwordInputs[0], "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText("Username already exists")).toBeInTheDocument();
    });
  });

  it("should call onSwitchToLogin when login link is clicked", async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSwitchToLogin={mockOnSwitchToLogin} />);

    const loginLink = screen.getByRole("button", { name: /login here/i });
    await user.click(loginLink);

    expect(mockOnSwitchToLogin).toHaveBeenCalledTimes(1);
  });

  it("should clear form and switch to login after successful registration", async () => {
    const user = userEvent.setup();
    vi.mocked(authService.register).mockResolvedValue({
      code: 201,
      msg: "Registration successful",
      data: {
        id: "new-user-id",
        username: "newuser",
        email: "newuser@example.com",
      },
    });

    render(<RegistrationForm onSwitchToLogin={mockOnSwitchToLogin} />);

    await user.type(screen.getByLabelText(/username/i), "newuser");
    await user.type(screen.getByLabelText(/email/i), "newuser@example.com");
    const passwordInputs = screen.getAllByLabelText(/password/i);
    await user.type(passwordInputs[0], "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Wait for auto-switch (component uses setTimeout with 2000ms delay)
    await waitFor(() => {
      expect(mockOnSwitchToLogin).toHaveBeenCalled();
    }, { timeout: 5000 });
  });
});

