import {
  authApi,
  userApi,
  type AuthResponse,
  type CreateUserRequest,
  type UserInfo,
} from "./generatedApi";

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
      // Enhanced debugging for mobile
      console.log("🔐 Login attempt:", {
        usernameOrEmail,
        hasPassword: !!password,
        userAgent: navigator.userAgent,
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "default",
        timestamp: new Date().toISOString(),
      });

      const response = await authApi.login({ usernameOrEmail, password });

      console.log("✅ Login response received:", {
        status: response.status,
        hasData: !!response.data,
        hasToken: !!response.data?.token,
        userId: response.data?.userId,
      });

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
        console.log("💾 Auth data stored in localStorage");
      }

      return {
        code: 200,
        msg: "Login successful",
        data: response.data,
      };
    } catch (error: any) {
      // Enhanced error logging for mobile debugging
      console.error("❌ Login error details:", {
        error: error,
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          baseURL: error.config?.baseURL,
        },
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });

      return {
        code: error.response?.status || 500,
        msg: error.response?.data?.msg || `Login failed: ${error.message}`,
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

  /**
   * User registration
   */
  async register(
    username: string,
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ): Promise<ApiResponse<UserInfo>> {
    try {
      // Enhanced debugging for mobile
      console.log("📝 Registration attempt:", {
        username,
        email,
        hasPassword: !!password,
        firstName,
        lastName,
        userAgent: navigator.userAgent,
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "default",
        timestamp: new Date().toISOString(),
      });

      const createUserRequest: CreateUserRequest = {
        username,
        email,
        password,
        firstName,
        lastName,
      };

      const response = await userApi.createUser(createUserRequest);

      console.log("✅ Registration response received:", {
        status: response.status,
        hasData: !!response.data,
        userId: response.data?.id,
      });

      return {
        code: 201,
        msg: "Registration successful",
        data: response.data,
      };
    } catch (error: any) {
      // Enhanced error logging for mobile debugging
      console.error("❌ Registration error details:", {
        error: error,
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          baseURL: error.config?.baseURL,
        },
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });

      return {
        code: error.response?.status || 500,
        msg:
          error.response?.data?.msg || `Registration failed: ${error.message}`,
      };
    }
  }
}

export const authService = new AuthService();
export default authService;
