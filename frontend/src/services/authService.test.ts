import { describe, it, expect, beforeEach, vi } from "vitest";
import { authService } from "./authService";

describe("AuthService", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      const response = await authService.login("testuser", "password123");

      expect(response.code).toBe(200);
      expect(response.msg).toBe("Login successful");
      expect(response.data).toBeDefined();
      expect(response.data?.token).toBe("mock-jwt-token");
      expect(response.data?.userId).toBe("test-user-id");
      expect(response.data?.username).toBe("testuser");

      // Verify token is stored in localStorage
      expect(localStorage.getItem("authToken")).toBe("mock-jwt-token");
      expect(localStorage.getItem("userId")).toBe("test-user-id");
    });

    it("should fail login with invalid credentials", async () => {
      const response = await authService.login("testuser", "wrongpassword");

      expect(response.code).toBe(401);
      expect(response.msg).toContain("Invalid credentials");
      expect(response.data).toBeUndefined();

      // Verify nothing is stored in localStorage
      expect(localStorage.getItem("authToken")).toBeNull();
      expect(localStorage.getItem("userId")).toBeNull();
    });

    it("should store user info in localStorage on successful login", async () => {
      await authService.login("testuser", "password123");

      const userInfo = localStorage.getItem("userInfo");
      expect(userInfo).not.toBeNull();
      
      const parsedUserInfo = JSON.parse(userInfo!);
      expect(parsedUserInfo.id).toBe("test-user-id");
      expect(parsedUserInfo.username).toBe("testuser");
      expect(parsedUserInfo.email).toBe("test@example.com");
    });
  });

  describe("logout", () => {
    it("should clear authentication data from localStorage", async () => {
      // Set up initial auth state
      localStorage.setItem("authToken", "test-token");
      localStorage.setItem("userId", "test-user-id");
      localStorage.setItem("userInfo", JSON.stringify({ id: "test-user-id" }));

      const response = await authService.logout();

      expect(response.code).toBe(200);
      expect(response.msg).toBe("Logout successful");
      expect(localStorage.getItem("authToken")).toBeNull();
      expect(localStorage.getItem("userId")).toBeNull();
      expect(localStorage.getItem("userInfo")).toBeNull();
    });

    it("should clear data even if API call fails", async () => {
      // Set up initial auth state
      localStorage.setItem("authToken", "test-token");
      localStorage.setItem("userId", "test-user-id");

      // Mock a scenario where API fails but we still clear local data
      const response = await authService.logout();

      // Should still clear local data
      expect(localStorage.getItem("authToken")).toBeNull();
      expect(localStorage.getItem("userId")).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("should return true when valid token and userId are present", () => {
      // Create a valid JWT token (not expired)
      const validToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJleHAiOjk5OTk5OTk5OTk5fQ.test";
      localStorage.setItem("authToken", validToken);
      localStorage.setItem("userId", "test-user-id");

      expect(authService.isAuthenticated()).toBe(true);
    });

    it("should return false and clear data when token is missing", () => {
      localStorage.setItem("userId", "test-user-id");

      expect(authService.isAuthenticated()).toBe(false);
      expect(localStorage.getItem("userId")).toBeNull();
    });

    it("should return false and clear data when userId is missing", () => {
      localStorage.setItem("authToken", "test-token");

      expect(authService.isAuthenticated()).toBe(false);
      expect(localStorage.getItem("authToken")).toBeNull();
    });

    it("should return false when both are missing", () => {
      expect(authService.isAuthenticated()).toBe(false);
    });

    it("should return false and clear data when token is empty string", () => {
      localStorage.setItem("authToken", "");
      localStorage.setItem("userId", "test-user-id");

      expect(authService.isAuthenticated()).toBe(false);
      expect(localStorage.getItem("authToken")).toBeNull();
      expect(localStorage.getItem("userId")).toBeNull();
    });

    it("should return false and clear data when token is expired", () => {
      // Create an expired JWT token (exp: 1000 = Jan 1, 1970)
      const expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJleHAiOjEwMDB9.test";
      localStorage.setItem("authToken", expiredToken);
      localStorage.setItem("userId", "test-user-id");

      expect(authService.isAuthenticated()).toBe(false);
      expect(localStorage.getItem("authToken")).toBeNull();
      expect(localStorage.getItem("userId")).toBeNull();
    });
  });

  describe("getAuthToken", () => {
    it("should return token from localStorage", () => {
      localStorage.setItem("authToken", "test-token");

      expect(authService.getAuthToken()).toBe("test-token");
    });

    it("should return null when token is not present", () => {
      expect(authService.getAuthToken()).toBeNull();
    });
  });

  describe("getUserId", () => {
    it("should return userId from localStorage", () => {
      localStorage.setItem("userId", "test-user-id");

      expect(authService.getUserId()).toBe("test-user-id");
    });

    it("should return null when userId is not present", () => {
      expect(authService.getUserId()).toBeNull();
    });
  });

  describe("getStoredUserInfo", () => {
    it("should return parsed user info from localStorage", () => {
      const userInfo = { id: "test-id", username: "testuser" };
      localStorage.setItem("userInfo", JSON.stringify(userInfo));

      expect(authService.getStoredUserInfo()).toEqual(userInfo);
    });

    it("should return null when userInfo is not present", () => {
      expect(authService.getStoredUserInfo()).toBeNull();
    });
  });

  describe("register", () => {
    it("should register successfully with valid data", async () => {
      const response = await authService.register(
        "newuser",
        "newuser@example.com",
        "password123",
        "New",
        "User"
      );

      expect(response.code).toBe(201);
      expect(response.msg).toBe("Registration successful");
      expect(response.data).toBeDefined();
      expect(response.data?.id).toBe("new-user-id");
      expect(response.data?.username).toBe("newuser");
    });

    it("should fail registration with existing username", async () => {
      const response = await authService.register(
        "existinguser",
        "existing@example.com",
        "password123"
      );

      expect(response.code).toBe(400);
      expect(response.msg).toContain("already exists");
    });
  });

  describe("getCurrentUser", () => {
    it("should get current user information", async () => {
      localStorage.setItem("authToken", "mock-jwt-token");

      const response = await authService.getCurrentUser();

      expect(response.code).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data?.username).toBe("testuser");
    });
  });
});

