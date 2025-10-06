import {
  Configuration,
  AuthenticationApi,
  TaskManagementApi,
  UserManagementApi,
  FileAttachmentsApi,
  type AuthResponse,
  type LoginRequest,
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

// Add request interceptor to conditionally add X-User-Id header
axios.interceptors.request.use(
  (config) => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      config.headers["X-User-Id"] = userId;
    }
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
export { type AuthResponse, type LoginRequest };