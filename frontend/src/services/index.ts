// Export all services
export { default as taskService } from "./taskService";
export { default as authService } from "./authService";
export { default as attachmentService } from "./attachmentService";

// Export generated API
export { taskApi, authApi, userApi, attachmentApi } from "./generatedApi";

// Export types
export type { ApiResponse } from "./taskService";
export type { LoginRequest, AuthResponse } from "./generatedApi";
