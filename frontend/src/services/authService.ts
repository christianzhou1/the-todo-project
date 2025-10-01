import { authApi, type AuthResponse, type LoginRequest } from "./generatedApi";

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data?: T;
}

class AuthService {
  /**
   * User login
   */
  async login(
    usernameOrEmail: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await authApi.login({ usernameOrEmail, password });

      console.log("Login response:", response);
      console.log("Response data:", response.data);

      // Store token and user info in localStorage
      if (response.data?.token) {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("userId", response.data.userId || "");
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            id: response.data.userId,
            username: response.data.username,
            email: response.data.email,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
          })
        );
      }

      return {
        code: 200,
        msg: "Login successful",
        data: response.data,
      };
    } catch (error: any) {
      console.error("Login error:", error);

      return {
        code: error.response?.status || 500,
        msg:
          error.response?.data?.msg ||
          "Login failed. Please check your credentials.",
      };
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await authApi.getCurrentUser();
      return {
        code: 200,
        msg: "Success",
        data: response.data,
      };
    } catch (error: any) {
      console.error("Get current user error:", error);

      return {
        code: error.response?.status || 500,
        msg: error.response?.data?.msg || "Failed to get current user.",
      };
    }
  }

  /**
   * User logout
   */
  async logout(): Promise<ApiResponse> {
    try {
      await authApi.logout();

      // Clear stored authentication data
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userInfo");

      return {
        code: 200,
        msg: "Logout successful",
      };
    } catch (error: any) {
      console.error("Logout error:", error);

      // Clear stored data even if API call fails
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userInfo");

      return {
        code: 200,
        msg: "Logout successful",
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    return !!(token && userId);
  }

  /**
   * Get stored user information
   */
  getStoredUserInfo(): any {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
  }

  /**
   * Get stored authentication token
   */
  getAuthToken(): string | null {
    return localStorage.getItem("authToken");
  }

  /**
   * Get stored user ID
   */
  getUserId(): string | null {
    return localStorage.getItem("userId");
  }
}

export const authService = new AuthService();
export default authService;
