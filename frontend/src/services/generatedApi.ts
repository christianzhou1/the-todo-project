import {
  Configuration,
  AuthenticationApi,
  TaskManagementApi,
  UserManagementApi,
  FileAttachmentsApi,
} from "../generated/api";
import { envConfig } from "../config/env";

// Create configuration with authentication
const configuration = new Configuration({
  basePath: envConfig.apiBaseUrl,
  accessToken: () => {
    // Get JWT token from localStorage
    return localStorage.getItem("authToken") || "";
  },
  // Add custom headers for X-User-Id
  middleware: [
    {
      pre: (context) => {
        const userId = localStorage.getItem("userId");
        if (userId) {
          context.init.headers = {
            ...context.init.headers,
            "X-User-Id": userId,
          };
        }
        return Promise.resolve(context);
      },
    },
  ],
});

// Create API instances
export const authApi = new AuthenticationApi(configuration);
export const taskApi = new TaskManagementApi(configuration);
export const userApi = new UserManagementApi(configuration);
export const attachmentApi = new FileAttachmentsApi(configuration);

// Export the API instances directly - they already have the correct methods
