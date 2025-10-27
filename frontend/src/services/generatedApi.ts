import {
  Configuration,
  AuthenticationApi,
  TaskManagementApi,
  UserManagementApi,
  FileAttachmentsApi,
  type AuthResponse,
  type LoginRequest,
  type CreateUserRequest,
  type UserInfo,
} from "../generated/api";
import { envConfig } from "../config/env";
import axios from "axios";

// Create configuration with authentication
const configuration = new Configuration({
  basePath: envConfig.apiBaseUrl,
  accessToken: () => {
    // Get JWT token from localStorage
    return localStorage.getItem("authToken") || "";
  },
});

// Add request interceptor to add Authorization and X-User-Id headers
axios.interceptors.request.use(
  (config) => {
    // Add Authorization header with Bearer token
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log(
        "Added Authorization header:",
        `Bearer ${token.substring(0, 20)}...`
      );
    } else {
      console.log("No auth token found in localStorage");
    }

    // Add X-User-Id header
    const userId = localStorage.getItem("userId");
    if (userId) {
      config.headers["X-User-Id"] = userId;
      console.log("Added X-User-Id header:", userId);
    } else {
      console.log("No userId found in localStorage");
    }

    console.log("Request headers:", config.headers);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Create API instances
export const authApi = new AuthenticationApi(configuration);
export const taskApi = new TaskManagementApi(configuration);
export const userApi = new UserManagementApi(configuration);
export const attachmentApi = new FileAttachmentsApi(configuration);

// Export the API instances and types
export {
  type AuthResponse,
  type LoginRequest,
  type CreateUserRequest,
  type UserInfo,
};
