# Project structure and API function management
_Exported on 10/1/2025 at 11:19:26 EDT from Cursor (1.6.45)_

---

**User**

brief me on the structure of this project and where functions related to API are defined and managed

---

**Cursor**

I'll analyze the project structure and identify where API-related functions are defined and managed. Let me start by examining the key files and directories.


Now let me examine the other service files to understand the complete API structure:


Now let me check the mock configuration and types to understand the complete API structure:


Let me also check the main App component and context to understand how the API is integrated:


Now let me check the examples directory to see how the services are used:


Let me check the vite config to understand the build setup:


Based on my analysis of the project structure, here's a comprehensive briefing on the **TomatoHR Panel** project and its API management:

## Project Overview

**TomatoHR Panel** is a React-based HR management system built with TypeScript, Vite, and Ant Design. It's an online marketplace connecting businesses with employees, featuring a modern dashboard interface for managing various HR operations.

## Project Structure

### Core Technologies
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Ant Design (antd)
- **HTTP Client**: Axios with interceptors
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Mocking**: axios-mock-adapter for development

### Key Directories
- `src/services/` - API service layer
- `src/types/` - TypeScript type definitions
- `src/context/` - React context providers
- `src/pages/` - Page components
- `src/components/` - Reusable UI components
- `src/mocks/` - Mock data and API responses

## API Management Architecture

### 1. **Core API Configuration** (`src/services/api.ts`)
- **Axios Instance**: Centralized HTTP client with base configuration
- **Base URL**: Configurable via environment variables (`VITE_API_BASE_URL`)
- **Default**: `http://localhost:8080/api`
- **Timeout**: 10 seconds
- **Headers**: JSON content type

### 2. **Authentication & Authorization**
- **Request Interceptor**: Automatically adds Bearer token from localStorage
- **Response Interceptor**: Handles common HTTP errors (401, 403, 404, 5xx)
- **Auto-logout**: Clears tokens and redirects to login on 401 errors
- **Error Messages**: User-friendly error notifications via Ant Design

### 3. **Service Layer Structure**

#### **AuthService** (`src/services/authService.ts`)
```typescript
- login(email, password) → POST /user/login
- logout() → POST /user/logout
```

#### **BusinessService** (`src/services/businessService.ts`)
```typescript
- createEmployer() → POST /employer/create
- updateEmployer() → POST /employer/update
- deleteEmployer() → POST /employer/delete
- listEmployer() → POST /employer/list
- getEmployerById() → POST /employer/get_by_user_id
```

#### **EmployeeService** (`src/services/employeeService.ts`)
```typescript
- getEmployeePage() → POST /employee/page
- getEmployeeByUserId() → POST /employee/get_by_user_id
- createEmployee() → POST /employee/create
- updateEmployee() → PUT /employee/:userId
- deleteEmployee() → DELETE /employee/:employeeId
- searchEmployees() → POST /employee/search
- uploadEmployeePhoto() → POST /employee/upload-photo
```

### 4. **Type Safety** (`src/types/`)
- **Payload Types**: Request/response interfaces in `src/types/payload/`
- **Entity Types**: Business domain models (Employee, Employer, User, etc.)
- **Common Types**: `ApiResponse<T>` interface for consistent API responses
- **Pagination**: `Pager<T>` interface for paginated responses

### 5. **Mock System** (`src/mocks/` + `src/utils/mockConfig.ts`)
- **Environment-based**: Automatically enabled in development
- **Configurable**: Can be forced on/off via `VITE_MOCK_ENABLED`
- **Comprehensive**: Covers all API endpoints with realistic mock data
- **Development Tools**: Console logging shows available mock endpoints

### 6. **Environment Configuration** (`src/config/env.ts`)
- **Environment Variables**: Vite-based configuration
- **API Base URL**: `VITE_API_BASE_URL`
- **Mock Control**: `VITE_MOCK_ENABLED`
- **App Metadata**: `VITE_APP_NAME`, `VITE_APP_VERSION`

## API Response Format

All API responses follow a consistent structure:
```typescript
interface ApiResponse<T> {
  code: number;    // HTTP status code
  msg: string;     // Success/error message
  data?: T;        // Response payload
}
```

## Error Handling Strategy

1. **Service Level**: Each service method catches errors and returns consistent `ApiResponse` format
2. **Interceptor Level**: Global error handling for common HTTP status codes
3. **UI Level**: Ant Design message notifications for user feedback
4. **Authentication**: Automatic token refresh and logout on auth failures

## Development Workflow

1. **Mock Mode**: Automatically enabled in development for offline development
2. **Real API**: Switch to production API by setting environment variables
3. **Type Safety**: Full TypeScript coverage for all API interactions
4. **Hot Reload**: Vite provides fast development experience

## Key Features

- **Centralized API Management**: All HTTP calls go through the configured axios instance
- **Automatic Authentication**: Token management handled transparently
- **Comprehensive Mocking**: Full API simulation for development
- **Type Safety**: End-to-end TypeScript coverage
- **Error Handling**: Consistent error management across the application
- **Environment Flexibility**: Easy switching between development and production APIs

This architecture provides a robust, scalable foundation for API management with excellent developer experience and production readiness.

```typescript
- login(email, password) → POST /user/login
- logout() → POST /user/logout
```

```typescript
- createEmployer() → POST /employer/create
- updateEmployer() → POST /employer/update
- deleteEmployer() → POST /employer/delete
- listEmployer() → POST /employer/list
- getEmployerById() → POST /employer/get_by_user_id
```

```typescript
- getEmployeePage() → POST /employee/page
- getEmployeeByUserId() → POST /employee/get_by_user_id
- createEmployee() → POST /employee/create
- updateEmployee() → PUT /employee/:userId
- deleteEmployee() → DELETE /employee/:employeeId
- searchEmployees() → POST /employee/search
- uploadEmployeePhoto() → POST /employee/upload-photo
```

```typescript
interface ApiResponse<T> {
  code: number;    // HTTP status code
  msg: string;     // Success/error message
  data?: T;        // Response payload
}
```

---

**User**

break down the axios instance and token management

---

**Cursor**

I'll break down the axios instance and token management system in detail. Let me examine the current API configuration and related authentication components.


Now let me check the login page to see how the authentication flow works in practice:


Now let me check the ProtectedRoute component to understand how authentication is enforced:


Perfect! Now I have a complete picture of the axios instance and token management system. Let me break it down in detail:

# Axios Instance & Token Management Breakdown

## 1. **Axios Instance Configuration** (`src/services/api.ts`)

### Base Configuration
```typescript
const api: AxiosInstance = axios.create({
  baseURL: envConfig.apiBaseUrl,        // http://localhost:8080/api
  timeout: 10000,                       // 10 second timeout
  headers: {
    'Content-Type': 'application/json', // Default JSON content type
  },
});
```

**Key Features:**
- **Environment-based URL**: Uses `envConfig.apiBaseUrl` from environment variables
- **Global Timeout**: 10-second timeout for all requests
- **Default Headers**: JSON content type for all requests
- **Mock Integration**: Automatically sets up mock mode based on environment

## 2. **Request Interceptor - Token Management**

### Automatic Token Attachment
```typescript
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);
```

**How it Works:**
1. **Token Retrieval**: Automatically gets `authToken` from localStorage
2. **Header Injection**: Adds `Authorization: Bearer <token>` to all requests
3. **Conditional**: Only adds token if it exists (handles unauthenticated requests)
4. **Error Handling**: Logs and rejects request configuration errors

## 3. **Response Interceptor - Error Handling & Auto-Logout**

### Comprehensive Error Management
```typescript
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response; // Pass through successful responses
  },
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      // Auto-logout on unauthorized
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      message.error('Session expired. Please login again.');
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    // ... other error handling
  }
);
```

**Error Handling Strategy:**
- **401 Unauthorized**: Automatic logout, token cleanup, redirect to login
- **403 Forbidden**: User-friendly access denied message
- **404 Not Found**: Resource not found notification
- **5xx Server Errors**: Generic server error message
- **Timeout**: Connection timeout notification
- **Network Errors**: Network connectivity issues

## 4. **Token Lifecycle Management**

### Login Flow (Token Creation)
```typescript
// AuthContext.tsx - Login process
const login = async (email: string, password: string): Promise<boolean> => {
  const response = await authService.login(email, password);
  
  if (response.code === 200 && response.data) {
    const { user, token, roleList } = response.data;
    
    // Store token and user data
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    
    setUser(user);
    return true;
  }
};
```

### Logout Flow (Token Cleanup)
```typescript
// AuthService.tsx - Logout process
async logout(): Promise<void> => {
  try {
    await api.post('/user/logout'); // Server-side logout
  } catch (error) {
    // Continue with local cleanup even if API fails
  } finally {
    // Always clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }
};
```

### Session Restoration (App Initialization)
```typescript
// AuthContext.tsx - Check for existing session
useEffect(() => {
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');

  if (token && userData) {
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser); // Restore user session
    } catch (error) {
      // Clean up corrupted data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  }
}, []);
```

## 5. **Authentication State Management**

### AuthContext Integration
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;  // Derived from user existence
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}
```

**State Management:**
- **User State**: Stores complete user object with role metadata
- **Authentication Status**: Boolean derived from user existence
- **Loading States**: Manages loading during auth operations
- **Role Metadata**: Enhances user object with role information

## 6. **Route Protection**

### ProtectedRoute Component
```typescript
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Spin size="large" />; // Loading state
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // Redirect to login
  }

  return <>{children}</>; // Render protected content
};
```

## 7. **Token Storage Strategy**

### localStorage Usage
- **authToken**: JWT token for API authentication
- **userData**: Serialized user object for session restoration
- **Persistence**: Survives browser refresh and tab closure
- **Security**: Client-side storage (consider httpOnly cookies for production)

## 8. **Error Recovery & Resilience**

### Graceful Degradation
- **API Failures**: Local logout continues even if server logout fails
- **Corrupted Data**: Automatic cleanup of invalid localStorage data
- **Network Issues**: User-friendly error messages for connectivity problems
- **Session Expiry**: Automatic redirect without user intervention

## 9. **Security Considerations**

### Current Implementation
- **Bearer Token**: Standard JWT authentication
- **Automatic Cleanup**: Tokens removed on logout/expiry
- **Error Handling**: Prevents token leakage in error scenarios
- **Route Protection**: Prevents unauthorized access to protected routes

### Potential Improvements
- **Token Refresh**: No automatic token refresh mechanism
- **HttpOnly Cookies**: Consider for enhanced security
- **Token Expiry**: No client-side token validation
- **CSRF Protection**: No CSRF token implementation

## 10. **Development vs Production**

### Mock Mode Integration
- **Development**: Mock mode automatically enabled
- **Production**: Real API calls with full authentication
- **Environment Variables**: Easy switching between modes
- **Debugging**: Comprehensive logging for development

This token management system provides a robust, user-friendly authentication experience with automatic session management, comprehensive error handling, and seamless integration with the React application architecture.

```typescript
const api: AxiosInstance = axios.create({
  baseURL: envConfig.apiBaseUrl,        // http://localhost:8080/api
  timeout: 10000,                       // 10 second timeout
  headers: {
    'Content-Type': 'application/json', // Default JSON content type
  },
});
```

```typescript
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);
```

```typescript
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response; // Pass through successful responses
  },
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      // Auto-logout on unauthorized
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      message.error('Session expired. Please login again.');
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    // ... other error handling
  }
);
```

```typescript
// AuthContext.tsx - Login process
const login = async (email: string, password: string): Promise<boolean> => {
  const response = await authService.login(email, password);
  
  if (response.code === 200 && response.data) {
    const { user, token, roleList } = response.data;
    
    // Store token and user data
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    
    setUser(user);
    return true;
  }
};
```

```typescript
// AuthService.tsx - Logout process
async logout(): Promise<void> => {
  try {
    await api.post('/user/logout'); // Server-side logout
  } catch (error) {
    // Continue with local cleanup even if API fails
  } finally {
    // Always clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }
};
```

```typescript
// AuthContext.tsx - Check for existing session
useEffect(() => {
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');

  if (token && userData) {
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser); // Restore user session
    } catch (error) {
      // Clean up corrupted data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  }
}, []);
```

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;  // Derived from user existence
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}
```

```typescript
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Spin size="large" />; // Loading state
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // Redirect to login
  }

  return <>{children}</>; // Render protected content
};
```

---

**User**

explain what interceptor is and how to use it

---

**Cursor**

I'll explain what interceptors are and how they work, using the examples from your TomatoHR project to illustrate the concepts.

## What are Axios Interceptors?

**Interceptors** are middleware functions that allow you to run code before requests are sent or after responses are received. Think of them as "hooks" that can modify or monitor HTTP requests and responses at a global level.

### Types of Interceptors

1. **Request Interceptors** - Run before requests are sent
2. **Response Interceptors** - Run after responses are received

## How Interceptors Work

### Basic Syntax
```typescript
// Request interceptor
axios.interceptors.request.use(
  (config) => {
    // Code to run BEFORE request is sent
    return config; // Must return the config
  },
  (error) => {
    // Code to run if request setup fails
    return Promise.reject(error);
  }
);

// Response interceptor
axios.interceptors.response.use(
  (response) => {
    // Code to run AFTER successful response
    return response; // Must return the response
  },
  (error) => {
    // Code to run if response has error
    return Promise.reject(error);
  }
);
```

## Real Examples from Your Project

### 1. Request Interceptor - Token Management

```typescript
// From src/services/api.ts
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    // Add token to Authorization header if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config; // Return modified config
  },
  (error: AxiosError) => {
    // Handle request setup errors
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);
```

**What this does:**
- **Before every request**: Automatically adds the authentication token
- **Conditional logic**: Only adds token if it exists
- **Header modification**: Adds `Authorization: Bearer <token>` to all requests
- **Error handling**: Logs and rejects configuration errors

### 2. Response Interceptor - Error Handling

```typescript
// From src/services/api.ts
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // For successful responses, just pass them through
    return response;
  },
  (error: AxiosError) => {
    // Handle different types of errors
    const status = error.response?.status;

    if (status === 401) {
      // Unauthorized - clear token and redirect
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      message.error('Session expired. Please login again.');
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      message.error('Access denied. You do not have permission to perform this action.');
    } else if (status === 404) {
      message.error('Resource not found.');
    } else if (status && status >= 500) {
      message.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);
```

**What this does:**
- **Success responses**: Pass through unchanged
- **Error responses**: Handle different HTTP status codes
- **401 handling**: Automatic logout and redirect
- **User feedback**: Show appropriate error messages
- **Global error handling**: Centralized error management

## Common Use Cases for Interceptors

### 1. Authentication & Authorization
```typescript
// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. Request/Response Logging
```typescript
// Log all requests
api.interceptors.request.use((config) => {
  console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
  return config;
});

// Log all responses
api.interceptors.response.use((response) => {
  console.log(`Response from ${response.config.url}:`, response.status);
  return response;
});
```

### 3. Loading States
```typescript
// Show loading spinner
api.interceptors.request.use((config) => {
  showLoadingSpinner();
  return config;
});

// Hide loading spinner
api.interceptors.response.use(
  (response) => {
    hideLoadingSpinner();
    return response;
  },
  (error) => {
    hideLoadingSpinner();
    return Promise.reject(error);
  }
);
```

### 4. Request/Response Transformation
```typescript
// Transform request data
api.interceptors.request.use((config) => {
  if (config.data) {
    config.data = transformRequestData(config.data);
  }
  return config;
});

// Transform response data
api.interceptors.response.use((response) => {
  response.data = transformResponseData(response.data);
  return response;
});
```

### 5. Retry Logic
```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Retry on network errors
    if (!error.response && config.retryCount < 3) {
      config.retryCount = config.retryCount || 0;
      config.retryCount++;
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      return api(config);
    }
    
    return Promise.reject(error);
  }
);
```

## Advanced Interceptor Patterns

### 1. Conditional Interceptors
```typescript
api.interceptors.request.use((config) => {
  // Only add token for certain endpoints
  if (config.url?.includes('/api/protected/')) {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
```

### 2. Multiple Interceptors
```typescript
// You can add multiple interceptors
api.interceptors.request.use((config) => {
  config.headers['X-Request-ID'] = generateRequestId();
  return config;
});

api.interceptors.request.use((config) => {
  config.headers['X-Timestamp'] = Date.now();
  return config;
});
```

### 3. Removing Interceptors
```typescript
// Store interceptor ID
const requestInterceptor = api.interceptors.request.use((config) => {
  // Some logic
  return config;
});

// Remove specific interceptor
api.interceptors.request.eject(requestInterceptor);
```

## Best Practices

### 1. Always Return the Config/Response
```typescript
// ✅ Correct
api.interceptors.request.use((config) => {
  // Modify config
  return config; // Always return
});

// ❌ Wrong
api.interceptors.request.use((config) => {
  // Modify config
  // Missing return statement
});
```

### 2. Handle Errors Properly
```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Always handle errors
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error); // Re-throw error
  }
);
```

### 3. Avoid Side Effects in Request Interceptors
```typescript
// ✅ Good - just modify the request
api.interceptors.request.use((config) => {
  config.headers.Authorization = getToken();
  return config;
});

// ❌ Avoid - side effects like API calls
api.interceptors.request.use(async (config) => {
  const newToken = await refreshToken(); // Don't do this
  config.headers.Authorization = newToken;
  return config;
});
```

## Your Project's Interceptor Benefits

1. **Automatic Authentication**: No need to manually add tokens to each request
2. **Centralized Error Handling**: All API errors handled in one place
3. **User Experience**: Automatic logout and redirect on session expiry
4. **Consistency**: Same error messages and behavior across the app
5. **Maintainability**: Easy to modify authentication or error handling logic

Interceptors are powerful tools that help you implement cross-cutting concerns like authentication, logging, and error handling in a clean, maintainable way!

```typescript
// Request interceptor
axios.interceptors.request.use(
  (config) => {
    // Code to run BEFORE request is sent
    return config; // Must return the config
  },
  (error) => {
    // Code to run if request setup fails
    return Promise.reject(error);
  }
);

// Response interceptor
axios.interceptors.response.use(
  (response) => {
    // Code to run AFTER successful response
    return response; // Must return the response
  },
  (error) => {
    // Code to run if response has error
    return Promise.reject(error);
  }
);
```

```typescript
// From src/services/api.ts
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    // Add token to Authorization header if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config; // Return modified config
  },
  (error: AxiosError) => {
    // Handle request setup errors
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);
```

```typescript
// From src/services/api.ts
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // For successful responses, just pass them through
    return response;
  },
  (error: AxiosError) => {
    // Handle different types of errors
    const status = error.response?.status;

    if (status === 401) {
      // Unauthorized - clear token and redirect
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      message.error('Session expired. Please login again.');
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      message.error('Access denied. You do not have permission to perform this action.');
    } else if (status === 404) {
      message.error('Resource not found.');
    } else if (status && status >= 500) {
      message.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);
```

```typescript
// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

```typescript
// Log all requests
api.interceptors.request.use((config) => {
  console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
  return config;
});

// Log all responses
api.interceptors.response.use((response) => {
  console.log(`Response from ${response.config.url}:`, response.status);
  return response;
});
```

```typescript
// Show loading spinner
api.interceptors.request.use((config) => {
  showLoadingSpinner();
  return config;
});

// Hide loading spinner
api.interceptors.response.use(
  (response) => {
    hideLoadingSpinner();
    return response;
  },
  (error) => {
    hideLoadingSpinner();
    return Promise.reject(error);
  }
);
```

```typescript
// Transform request data
api.interceptors.request.use((config) => {
  if (config.data) {
    config.data = transformRequestData(config.data);
  }
  return config;
});

// Transform response data
api.interceptors.response.use((response) => {
  response.data = transformResponseData(response.data);
  return response;
});
```

```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Retry on network errors
    if (!error.response && config.retryCount < 3) {
      config.retryCount = config.retryCount || 0;
      config.retryCount++;
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      return api(config);
    }
    
    return Promise.reject(error);
  }
);
```

```typescript
api.interceptors.request.use((config) => {
  // Only add token for certain endpoints
  if (config.url?.includes('/api/protected/')) {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
```

```typescript
// You can add multiple interceptors
api.interceptors.request.use((config) => {
  config.headers['X-Request-ID'] = generateRequestId();
  return config;
});

api.interceptors.request.use((config) => {
  config.headers['X-Timestamp'] = Date.now();
  return config;
});
```

```typescript
// Store interceptor ID
const requestInterceptor = api.interceptors.request.use((config) => {
  // Some logic
  return config;
});

// Remove specific interceptor
api.interceptors.request.eject(requestInterceptor);
```

```typescript
// ✅ Correct
api.interceptors.request.use((config) => {
  // Modify config
  return config; // Always return
});

// ❌ Wrong
api.interceptors.request.use((config) => {
  // Modify config
  // Missing return statement
});
```

```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Always handle errors
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error); // Re-throw error
  }
);
```

```typescript
// ✅ Good - just modify the request
api.interceptors.request.use((config) => {
  config.headers.Authorization = getToken();
  return config;
});

// ❌ Avoid - side effects like API calls
api.interceptors.request.use(async (config) => {
  const newToken = await refreshToken(); // Don't do this
  config.headers.Authorization = newToken;
  return config;
});
```

---

**User**

how would i generate api endpoints from backend to use in this front end project?

---

**Cursor**

I'll show you several approaches to generate API endpoints from your backend for use in this frontend project. Let me first examine your current API structure to understand the patterns.


Now let me check what backend technologies might be generating these APIs:


Based on your current project structure and modern best practices, here are several approaches to generate API endpoints from your backend for this frontend project:

## 1. **OpenAPI/Swagger Code Generation (Recommended)**

### Step 1: Generate OpenAPI Specification from Backend

If your backend uses frameworks like:
- **Spring Boot** (Java) - with `springdoc-openapi`
- **Express.js** (Node.js) - with `swagger-jsdoc` or `@nestjs/swagger`
- **FastAPI** (Python) - built-in OpenAPI support
- **ASP.NET Core** (C#) - with `Swashbuckle`

### Step 2: Install Code Generation Tools

```bash
# Install OpenAPI Generator CLI
npm install -g @openapitools/openapi-generator-cli

# Or use npx (no global install needed)
npx @openapitools/openapi-generator-cli
```

### Step 3: Generate TypeScript Client

```bash
# Generate from OpenAPI spec
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:8080/api-docs \
  -g typescript-axios \
  -o src/generated/api \
  --additional-properties=typescriptThreePlus=true,supportsES6=true
```

### Step 4: Create Generated API Service

```typescript
// src/services/generatedApi.ts
import { Configuration, DefaultApi } from '../generated/api';

const configuration = new Configuration({
  basePath: envConfig.apiBaseUrl,
  accessToken: () => localStorage.getItem('authToken') || '',
});

export const generatedApi = new DefaultApi(configuration);
```

## 2. **Manual Service Generation Script**

Create a script to generate services based on your backend endpoints:

```typescript
// scripts/generateServices.ts
import fs from 'fs';
import path from 'path';

interface EndpointConfig {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  requestType?: string;
  responseType: string;
  description: string;
}

const endpoints: EndpointConfig[] = [
  {
    name: 'getEmployeePage',
    method: 'POST',
    path: '/employee/page',
    requestType: 'EmployeePageRequest',
    responseType: 'EmployeePageResponse',
    description: 'Get paginated list of employees'
  },
  {
    name: 'createEmployee',
    method: 'POST',
    path: '/employee/create',
    requestType: 'CreateEmployeeRequest',
    responseType: 'EmployeeResponse',
    description: 'Create new employee'
  },
  // ... more endpoints
];

function generateServiceClass(serviceName: string, endpoints: EndpointConfig[]): string {
  return `
import { ApiResponse } from '../types/payload';
import api from './api';

class ${serviceName} {
${endpoints.map(endpoint => `
  /**
   * ${endpoint.description}
   */
  async ${endpoint.name}(${endpoint.requestType ? `request: ${endpoint.requestType}` : ''}): Promise<ApiResponse<${endpoint.responseType}>> {
    try {
      const response = await api.${endpoint.method.toLowerCase()}<ApiResponse<${endpoint.responseType}>>('${endpoint.path}'${endpoint.requestType ? ', request' : ''});
      return response.data;
    } catch (error: any) {
      console.error('${endpoint.name} error:', error);
      
      return {
        code: error.response?.status || 500,
        msg: error.response?.data?.msg || '${endpoint.description} failed. Please try again.',
      };
    }
  }
`).join('')}
}

export const ${serviceName.toLowerCase()} = new ${serviceName}();
export default ${serviceName.toLowerCase()};
`;
}

// Generate services
endpoints.forEach(endpoint => {
  const serviceCode = generateServiceClass('EmployeeService', [endpoint]);
  fs.writeFileSync(`src/services/generated/${endpoint.name}Service.ts`, serviceCode);
});
```

## 3. **Backend-First Approach with TypeScript**

### Step 1: Define Shared Types Package

```typescript
// shared-types/src/api.ts
export interface ApiEndpoints {
  'GET /api/employees': {
    request: EmployeePageRequest;
    response: EmployeePageResponse;
  };
  'POST /api/employees': {
    request: CreateEmployeeRequest;
    response: EmployeeResponse;
  };
  // ... more endpoints
}

// Generate from backend schema
export type EndpointKey = keyof ApiEndpoints;
export type EndpointRequest<T extends EndpointKey> = ApiEndpoints[T]['request'];
export type EndpointResponse<T extends EndpointKey> = ApiEndpoints[T]['response'];
```

### Step 2: Create Type-Safe API Client

```typescript
// src/services/typedApi.ts
import { EndpointKey, EndpointRequest, EndpointResponse } from 'shared-types';
import api from './api';

class TypedApiClient {
  async request<T extends EndpointKey>(
    endpoint: T,
    data?: EndpointRequest<T>
  ): Promise<ApiResponse<EndpointResponse<T>>> {
    const [method, path] = endpoint.split(' ') as [string, string];
    
    try {
      const response = await api.request<ApiResponse<EndpointResponse<T>>>({
        method: method.toLowerCase() as any,
        url: path,
        data
      });
      return response.data;
    } catch (error: any) {
      return {
        code: error.response?.status || 500,
        msg: error.response?.data?.msg || 'Request failed',
      };
    }
  }
}

export const typedApi = new TypedApiClient();
```

## 4. **GraphQL Code Generation (If Using GraphQL)**

```bash
# Install GraphQL tools
npm install -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations

# Generate from GraphQL schema
npx graphql-codegen --config codegen.yml
```

```yaml
# codegen.yml
schema: http://localhost:8080/graphql
generates:
  src/generated/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
```

## 5. **Automated Service Generation with Backend Integration**

### Create a Build Script

```typescript
// scripts/generateFromBackend.ts
import axios from 'axios';

async function generateServicesFromBackend() {
  try {
    // Fetch API documentation from backend
    const apiDocs = await axios.get('http://localhost:8080/api-docs');
    
    // Parse and generate services
    const services = parseApiDocs(apiDocs.data);
    
    // Generate TypeScript files
    services.forEach(service => {
      generateServiceFile(service);
    });
    
    console.log('✅ Services generated successfully');
  } catch (error) {
    console.error('❌ Failed to generate services:', error);
  }
}

function parseApiDocs(docs: any) {
  // Parse OpenAPI/Swagger documentation
  // Extract endpoints, types, and generate service classes
}

function generateServiceFile(service: any) {
  // Generate TypeScript service file
  // Write to src/services/generated/
}
```

## 6. **Integration with Your Current Project**

### Update Your Service Index

```typescript
// src/services/index.ts
// Export all services
export { default as api } from './api';
export { default as authService } from './authService';
export { default as businessService } from './businessService';
export { default as employeeService } from './employeeService';

// Export generated services
export * from './generated';

// Export mock utilities
export {
  disableMockMode, enableMockMode, getMockConfiguration, 
  initializeMockMode, isMockModeEnabled, setupMockMode, toggleMockMode
} from '../utils/mockConfig';
```

### Update Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "npm run generate:api && tsc && vite build",
    "generate:api": "ts-node scripts/generateServices.ts",
    "generate:api:watch": "nodemon --watch ../backend --exec npm run generate:api"
  }
}
```

## 7. **Recommended Workflow**

1. **Backend Development**: Use OpenAPI/Swagger annotations in your backend
2. **Code Generation**: Run generation script during build process
3. **Type Safety**: Use generated types throughout your frontend
4. **Mock Integration**: Update mock data to match generated types
5. **CI/CD Integration**: Automate generation in your deployment pipeline

## 8. **Example Generated Service**

```typescript
// src/services/generated/employeeService.ts
import { ApiResponse, CreateEmployeeRequest, EmployeeResponse } from '../types/payload';
import api from '../api';

class EmployeeService {
  /**
   * Get paginated list of employees
   */
  async getEmployeePage(request: EmployeePageRequest): Promise<ApiResponse<EmployeePageResponse>> {
    try {
      const response = await api.post<ApiResponse<EmployeePageResponse>>('/employee/page', request);
      return response.data;
    } catch (error: any) {
      console.error('Get employee page error:', error);
      
      return {
        code: error.response?.status || 500,
        msg: error.response?.data?.msg || 'Failed to get employee list.',
      };
    }
  }
}

export const employeeService = new EmployeeService();
export default employeeService;
```

This approach ensures:
- **Type Safety**: Full TypeScript coverage
- **Consistency**: Same patterns across all services
- **Maintainability**: Easy to update when backend changes
- **Developer Experience**: Auto-completion and error checking
- **Integration**: Works seamlessly with your existing mock system

Choose the approach that best fits your backend technology stack and team workflow!

```shellscript
# Install OpenAPI Generator CLI
npm install -g @openapitools/openapi-generator-cli

# Or use npx (no global install needed)
npx @openapitools/openapi-generator-cli
```

```shellscript
# Generate from OpenAPI spec
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:8080/api-docs \
  -g typescript-axios \
  -o src/generated/api \
  --additional-properties=typescriptThreePlus=true,supportsES6=true
```

```typescript
// src/services/generatedApi.ts
import { Configuration, DefaultApi } from '../generated/api';

const configuration = new Configuration({
  basePath: envConfig.apiBaseUrl,
  accessToken: () => localStorage.getItem('authToken') || '',
});

export const generatedApi = new DefaultApi(configuration);
```

```typescript
// scripts/generateServices.ts
import fs from 'fs';
import path from 'path';

interface EndpointConfig {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  requestType?: string;
  responseType: string;
  description: string;
}

const endpoints: EndpointConfig[] = [
  {
    name: 'getEmployeePage',
    method: 'POST',
    path: '/employee/page',
    requestType: 'EmployeePageRequest',
    responseType: 'EmployeePageResponse',
    description: 'Get paginated list of employees'
  },
  {
    name: 'createEmployee',
    method: 'POST',
    path: '/employee/create',
    requestType: 'CreateEmployeeRequest',
    responseType: 'EmployeeResponse',
    description: 'Create new employee'
  },
  // ... more endpoints
];

function generateServiceClass(serviceName: string, endpoints: EndpointConfig[]): string {
  return `
import { ApiResponse } from '../types/payload';
import api from './api';

class ${serviceName} {
${endpoints.map(endpoint => `
  /**
   * ${endpoint.description}
   */
  async ${endpoint.name}(${endpoint.requestType ? `request: ${endpoint.requestType}` : ''}): Promise<ApiResponse<${endpoint.responseType}>> {
    try {
      const response = await api.${endpoint.method.toLowerCase()}<ApiResponse<${endpoint.responseType}>>('${endpoint.path}'${endpoint.requestType ? ', request' : ''});
      return response.data;
    } catch (error: any) {
      console.error('${endpoint.name} error:', error);
      
      return {
        code: error.response?.status || 500,
        msg: error.response?.data?.msg || '${endpoint.description} failed. Please try again.',
      };
    }
  }
`).join('')}
}

export const ${serviceName.toLowerCase()} = new ${serviceName}();
export default ${serviceName.toLowerCase()};
`;
}

// Generate services
endpoints.forEach(endpoint => {
  const serviceCode = generateServiceClass('EmployeeService', [endpoint]);
  fs.writeFileSync(`src/services/generated/${endpoint.name}Service.ts`, serviceCode);
});
```

```typescript
// shared-types/src/api.ts
export interface ApiEndpoints {
  'GET /api/employees': {
    request: EmployeePageRequest;
    response: EmployeePageResponse;
  };
  'POST /api/employees': {
    request: CreateEmployeeRequest;
    response: EmployeeResponse;
  };
  // ... more endpoints
}

// Generate from backend schema
export type EndpointKey = keyof ApiEndpoints;
export type EndpointRequest<T extends EndpointKey> = ApiEndpoints[T]['request'];
export type EndpointResponse<T extends EndpointKey> = ApiEndpoints[T]['response'];
```

```typescript
// src/services/typedApi.ts
import { EndpointKey, EndpointRequest, EndpointResponse } from 'shared-types';
import api from './api';

class TypedApiClient {
  async request<T extends EndpointKey>(
    endpoint: T,
    data?: EndpointRequest<T>
  ): Promise<ApiResponse<EndpointResponse<T>>> {
    const [method, path] = endpoint.split(' ') as [string, string];
    
    try {
      const response = await api.request<ApiResponse<EndpointResponse<T>>>({
        method: method.toLowerCase() as any,
        url: path,
        data
      });
      return response.data;
    } catch (error: any) {
      return {
        code: error.response?.status || 500,
        msg: error.response?.data?.msg || 'Request failed',
      };
    }
  }
}

export const typedApi = new TypedApiClient();
```

```shellscript
# Install GraphQL tools
npm install -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations

# Generate from GraphQL schema
npx graphql-codegen --config codegen.yml
```

```yaml
# codegen.yml
schema: http://localhost:8080/graphql
generates:
  src/generated/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
```

```typescript
// scripts/generateFromBackend.ts
import axios from 'axios';

async function generateServicesFromBackend() {
  try {
    // Fetch API documentation from backend
    const apiDocs = await axios.get('http://localhost:8080/api-docs');
    
    // Parse and generate services
    const services = parseApiDocs(apiDocs.data);
    
    // Generate TypeScript files
    services.forEach(service => {
      generateServiceFile(service);
    });
    
    console.log('✅ Services generated successfully');
  } catch (error) {
    console.error('❌ Failed to generate services:', error);
  }
}

function parseApiDocs(docs: any) {
  // Parse OpenAPI/Swagger documentation
  // Extract endpoints, types, and generate service classes
}

function generateServiceFile(service: any) {
  // Generate TypeScript service file
  // Write to src/services/generated/
}
```

```typescript
// src/services/index.ts
// Export all services
export { default as api } from './api';
export { default as authService } from './authService';
export { default as businessService } from './businessService';
export { default as employeeService } from './employeeService';

// Export generated services
export * from './generated';

// Export mock utilities
export {
  disableMockMode, enableMockMode, getMockConfiguration, 
  initializeMockMode, isMockModeEnabled, setupMockMode, toggleMockMode
} from '../utils/mockConfig';
```

```json
{
  "scripts": {
    "dev": "vite",
    "build": "npm run generate:api && tsc && vite build",
    "generate:api": "ts-node scripts/generateServices.ts",
    "generate:api:watch": "nodemon --watch ../backend --exec npm run generate:api"
  }
}
```

```typescript
// src/services/generated/employeeService.ts
import { ApiResponse, CreateEmployeeRequest, EmployeeResponse } from '../types/payload';
import api from '../api';

class EmployeeService {
  /**
   * Get paginated list of employees
   */
  async getEmployeePage(request: EmployeePageRequest): Promise<ApiResponse<EmployeePageResponse>> {
    try {
      const response = await api.post<ApiResponse<EmployeePageResponse>>('/employee/page', request);
      return response.data;
    } catch (error: any) {
      console.error('Get employee page error:', error);
      
      return {
        code: error.response?.status || 500,
        msg: error.response?.data?.msg || 'Failed to get employee list.',
      };
    }
  }
}

export const employeeService = new EmployeeService();
export default employeeService;
```

---

**User**

im using spring boot for backend. tell me step by step how to generate openapi specification from the spring boot backend and how to use it in the front end

---

**Cursor**

I'll walk you through the complete process of generating OpenAPI specification from your Spring Boot backend and integrating it with your React frontend project.

## Step 1: Set Up OpenAPI in Spring Boot Backend

### 1.1 Add Dependencies to `pom.xml`

```xml
<dependencies>
    <!-- Spring Boot Web Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- SpringDoc OpenAPI 3 -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.2.0</version>
    </dependency>
    
    <!-- Optional: For validation annotations -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
</dependencies>
```

### 1.2 Configure OpenAPI in `application.yml`

```yaml
# application.yml
springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
    operationsSorter: method
  show-actuator: true

# Your existing configuration
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  application:
    name: tomatohr-backend
```

### 1.3 Create OpenAPI Configuration Class

```java
// src/main/java/com/tomatohr/config/OpenApiConfig.java
package com.tomatohr.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("TomatoHR API")
                        .version("1.0.0")
                        .description("HR Management System API")
                        .contact(new Contact()
                                .name("TomatoHR Team")
                                .email("support@tomatohr.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080/api")
                                .description("Development server"),
                        new Server()
                                .url("https://api.tomatohr.com")
                                .description("Production server")
                ));
    }
}
```

## Step 2: Annotate Your Spring Boot Controllers

### 2.1 Example Employee Controller

```java
// src/main/java/com/tomatohr/controller/EmployeeController.java
package com.tomatohr.controller;

import com.tomatohr.dto.EmployeePageRequest;
import com.tomatohr.dto.EmployeePageResponse;
import com.tomatohr.dto.CreateEmployeeRequest;
import com.tomatohr.dto.EmployeeResponse;
import com.tomatohr.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/employee")
@Tag(name = "Employee Management", description = "APIs for managing employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @PostMapping("/page")
    @Operation(
        summary = "Get paginated list of employees",
        description = "Retrieve a paginated list of employees with optional filters"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved employee list"),
        @ApiResponse(responseCode = "400", description = "Invalid request parameters"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<EmployeePageResponse> getEmployeePage(
            @Valid @RequestBody EmployeePageRequest request) {
        EmployeePageResponse response = employeeService.getEmployeePage(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/create")
    @Operation(
        summary = "Create new employee",
        description = "Create a new employee record"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Employee created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid employee data"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<EmployeeResponse> createEmployee(
            @Valid @RequestBody CreateEmployeeRequest request) {
        EmployeeResponse response = employeeService.createEmployee(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Get employee by ID",
        description = "Retrieve employee details by ID"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Employee found"),
        @ApiResponse(responseCode = "404", description = "Employee not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<EmployeeResponse> getEmployeeById(
            @Parameter(description = "Employee ID") @PathVariable String id) {
        EmployeeResponse response = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(
        summary = "Update employee",
        description = "Update employee information"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Employee updated successfully"),
        @ApiResponse(responseCode = "404", description = "Employee not found"),
        @ApiResponse(responseCode = "400", description = "Invalid employee data"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<EmployeeResponse> updateEmployee(
            @Parameter(description = "Employee ID") @PathVariable String id,
            @Valid @RequestBody CreateEmployeeRequest request) {
        EmployeeResponse response = employeeService.updateEmployee(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(
        summary = "Delete employee",
        description = "Soft delete employee (set isActive to false)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Employee deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Employee not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, String>> deleteEmployee(
            @Parameter(description = "Employee ID") @PathVariable String id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(Map.of("message", "Employee deleted successfully"));
    }
}
```

### 2.2 Example DTOs with OpenAPI Annotations

```java
// src/main/java/com/tomatohr/dto/EmployeePageRequest.java
package com.tomatohr.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class EmployeePageRequest {
    
    @NotNull(message = "Page number is required")
    @Min(value = 1, message = "Page number must be at least 1")
    @Schema(description = "Page number (1-based)", example = "1")
    private Integer pageNum;
    
    @NotNull(message = "Page size is required")
    @Min(value = 1, message = "Page size must be at least 1")
    @Schema(description = "Number of items per page", example = "10")
    private Integer pageSize;
    
    @Schema(description = "Filter by employee name", example = "John")
    private String name;
    
    @Schema(description = "Filter by email", example = "john@example.com")
    private String email;
    
    @Schema(description = "Filter by active status", example = "true")
    private Boolean isActive;
    
    // Constructors, getters, and setters
    public EmployeePageRequest() {}
    
    public EmployeePageRequest(Integer pageNum, Integer pageSize) {
        this.pageNum = pageNum;
        this.pageSize = pageSize;
    }
    
    // Getters and setters
    public Integer getPageNum() { return pageNum; }
    public void setPageNum(Integer pageNum) { this.pageNum = pageNum; }
    
    public Integer getPageSize() { return pageSize; }
    public void setPageSize(Integer pageSize) { this.pageSize = pageSize; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
```

## Step 3: Start Your Spring Boot Application

```bash
# Navigate to your Spring Boot project
cd your-spring-boot-project

# Run the application
mvn spring-boot:run
# or
./mvnw spring-boot:run
```

## Step 4: Access OpenAPI Documentation

Once your Spring Boot application is running, you can access:

- **Swagger UI**: `http://localhost:8080/api/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/api/api-docs`
- **OpenAPI YAML**: `http://localhost:8080/api/api-docs.yaml`

## Step 5: Set Up Frontend Code Generation

### 5.1 Install OpenAPI Generator

```bash
# In your React project root
npm install -D @openapitools/openapi-generator-cli
```

### 5.2 Create Generation Script

```json
// package.json - Add these scripts
{
  "scripts": {
    "generate:api": "openapi-generator-cli generate -i http://localhost:8080/api/api-docs -g typescript-axios -o src/generated/api --additional-properties=typescriptThreePlus=true,supportsES6=true,withInterfaces=true",
    "generate:api:local": "openapi-generator-cli generate -i ./api-spec.json -g typescript-axios -o src/generated/api --additional-properties=typescriptThreePlus=true,supportsES6=true,withInterfaces=true",
    "dev": "npm run generate:api && vite",
    "build": "npm run generate:api && tsc && vite build"
  }
}
```

### 5.3 Create Generation Configuration

```yaml
# openapi-generator-config.yml
generatorName: typescript-axios
inputSpec: http://localhost:8080/api/api-docs
outputDir: src/generated/api
additionalProperties:
  typescriptThreePlus: true
  supportsES6: true
  withInterfaces: true
  npmName: @tomatohr/api-client
  npmVersion: 1.0.0
```

### 5.4 Run Code Generation

```bash
# Generate TypeScript client from running Spring Boot app
npm run generate:api

# Or generate from local JSON file
curl http://localhost:8080/api/api-docs > api-spec.json
npm run generate:api:local
```

## Step 6: Integrate Generated API with Your Frontend

### 6.1 Create API Client Wrapper

```typescript
// src/services/generatedApi.ts
import { Configuration, DefaultApi } from '../generated/api';
import { envConfig } from '../config/env';

// Create configuration
const configuration = new Configuration({
  basePath: envConfig.apiBaseUrl,
  accessToken: () => localStorage.getItem('authToken') || '',
});

// Create API instance
export const generatedApi = new DefaultApi(configuration);

// Export individual services for easier use
export const employeeApi = {
  getEmployeePage: (request: any) => generatedApi.getEmployeePage(request),
  createEmployee: (request: any) => generatedApi.createEmployee(request),
  getEmployeeById: (id: string) => generatedApi.getEmployeeById(id),
  updateEmployee: (id: string, request: any) => generatedApi.updateEmployee(id, request),
  deleteEmployee: (id: string) => generatedApi.deleteEmployee(id),
};

export const businessApi = {
  // Add business-related API calls
};

export const authApi = {
  // Add auth-related API calls
};
```

### 6.2 Update Your Service Layer

```typescript
// src/services/employeeService.ts
import { employeeApi } from './generatedApi';
import { ApiResponse } from '../types/payload';

class EmployeeService {
  /**
   * Get paginated list of employees
   */
  async getEmployeePage(request: any): Promise<ApiResponse<any>> {
    try {
      const response = await employeeApi.getEmployeePage(request);
      return {
        code: 200,
        msg: 'Success',
        data: response.data
      };
    } catch (error: any) {
      console.error('Get employee page error:', error);
      
      return {
        code: error.response?.status || 500,
        msg: error.response?.data?.msg || 'Failed to get employee list.',
      };
    }
  }

  /**
   * Create new employee
   */
  async createEmployee(request: any): Promise<ApiResponse<any>> {
    try {
      const response = await employeeApi.createEmployee(request);
      return {
        code: 200,
        msg: 'Success',
        data: response.data
      };
    } catch (error: any) {
      console.error('Create employee error:', error);
      
      return {
        code: error.response?.status || 500,
        msg: error.response?.data?.msg || 'Failed to create employee.',
      };
    }
  }
}

export const employeeService = new EmployeeService();
export default employeeService;
```

### 6.3 Update Service Index

```typescript
// src/services/index.ts
// Export all services
export { default as api } from './api';
export { default as authService } from './authService';
export { default as businessService } from './businessService';
export { default as employeeService } from './employeeService';

// Export generated API
export { generatedApi, employeeApi, businessApi, authApi } from './generatedApi';

// Export mock utilities
export {
  disableMockMode, enableMockMode, getMockConfiguration, 
  initializeMockMode, isMockModeEnabled, setupMockMode, toggleMockMode
} from '../utils/mockConfig';
```

## Step 7: Update Your Components to Use Generated API

```typescript
// src/pages/Employees/Employees.tsx
import React, { useState, useEffect } from 'react';
import { Table, Button, message } from 'antd';
import { employeeService } from '../../services';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeService.getEmployeePage({
        pageNum: 1,
        pageSize: 10
      });

      if (response.code === 200 && response.data) {
        setEmployees(response.data.list);
      } else {
        message.error(response.msg);
      }
    } catch (error) {
      message.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div>
      <h1>Employees</h1>
      <Table
        dataSource={employees}
        loading={loading}
        columns={[
          { title: 'Name', dataIndex: 'name', key: 'name' },
          { title: 'Email', dataIndex: 'email', key: 'email' },
          { title: 'Phone', dataIndex: 'phone', key: 'phone' },
          { title: 'Status', dataIndex: 'isActive', key: 'isActive' },
        ]}
      />
    </div>
  );
};

export default Employees;
```

## Step 8: Set Up Development Workflow

### 8.1 Create Development Scripts

```json
// package.json
{
  "scripts": {
    "dev": "npm run generate:api && vite",
    "dev:backend": "npm run generate:api:watch",
    "generate:api:watch": "nodemon --watch ../backend --exec 'npm run generate:api'",
    "build": "npm run generate:api && tsc && vite build"
  }
}
```

### 8.2 Create .gitignore Entries

```gitignore
# Generated API files
src/generated/
api-spec.json
```

## Step 9: Production Deployment

### 9.1 Update Environment Configuration

```typescript
// src/config/env.ts
export const getEnvConfig = (): EnvConfig => {
  return {
    // ... existing config
    apiBaseUrl: viteApiBaseUrl || 'http://localhost:8080/api',
    // For production, use your deployed backend URL
    // apiBaseUrl: 'https://api.tomatohr.com',
  };
};
```

### 9.2 CI/CD Integration

```yaml
# .github/workflows/build.yml
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Generate API client
        run: npm run generate:api
        
      - name: Build application
        run: npm run build
```

## Benefits of This Approach

1. **Type Safety**: Full TypeScript coverage for all API calls
2. **Auto-completion**: IDE support for all endpoints and parameters
3. **Documentation**: Always up-to-date with backend changes
4. **Consistency**: Same patterns across all API calls
5. **Error Handling**: Centralized error management
6. **Mock Integration**: Works with your existing mock system
7. **Maintainability**: Easy to update when backend changes

This setup ensures your frontend stays in sync with your Spring Boot backend while maintaining type safety and excellent developer experience!

```xml
<dependencies>
    <!-- Spring Boot Web Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- SpringDoc OpenAPI 3 -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.2.0</version>
    </dependency>
    
    <!-- Optional: For validation annotations -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
</dependencies>
```

```yaml
# application.yml
springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
    operationsSorter: method
  show-actuator: true

# Your existing configuration
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  application:
    name: tomatohr-backend
```

```java
// src/main/java/com/tomatohr/config/OpenApiConfig.java
package com.tomatohr.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("TomatoHR API")
                        .version("1.0.0")
                        .description("HR Management System API")
                        .contact(new Contact()
                                .name("TomatoHR Team")
                                .email("support@tomatohr.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080/api")
                                .description("Development server"),
                        new Server()
                                .url("https://api.tomatohr.com")
                                .description("Production server")
                ));
    }
}
```

```java
// src/main/java/com/tomatohr/controller/EmployeeController.java
package com.tomatohr.controller;

import com.tomatohr.dto.EmployeePageRequest;
import com.tomatohr.dto.EmployeePageResponse;
import com.tomatohr.dto.CreateEmployeeRequest;
import com.tomatohr.dto.EmployeeResponse;
import com.tomatohr.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/employee")
@Tag(name = "Employee Management", description = "APIs for managing employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @PostMapping("/page")
    @Operation(
        summary = "Get paginated list of employees",
        description = "Retrieve a paginated list of employees with optional filters"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved employee list"),
        @ApiResponse(responseCode = "400", description = "Invalid request parameters"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<EmployeePageResponse> getEmployeePage(
            @Valid @RequestBody EmployeePageRequest request) {
        EmployeePageResponse response = employeeService.getEmployeePage(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/create")
    @Operation(
        summary = "Create new employee",
        description = "Create a new employee record"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Employee created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid employee data"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<EmployeeResponse> createEmployee(
            @Valid @RequestBody CreateEmployeeRequest request) {
        EmployeeResponse response = employeeService.createEmployee(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Get employee by ID",
        description = "Retrieve employee details by ID"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Employee found"),
        @ApiResponse(responseCode = "404", description = "Employee not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<EmployeeResponse> getEmployeeById(
            @Parameter(description = "Employee ID") @PathVariable String id) {
        EmployeeResponse response = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(
        summary = "Update employee",
        description = "Update employee information"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Employee updated successfully"),
        @ApiResponse(responseCode = "404", description = "Employee not found"),
        @ApiResponse(responseCode = "400", description = "Invalid employee data"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<EmployeeResponse> updateEmployee(
            @Parameter(description = "Employee ID") @PathVariable String id,
            @Valid @RequestBody CreateEmployeeRequest request) {
        EmployeeResponse response = employeeService.updateEmployee(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(
        summary = "Delete employee",
        description = "Soft delete employee (set isActive to false)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Employee deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Employee not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, String>> deleteEmployee(
            @Parameter(description = "Employee ID") @PathVariable String id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(Map.of("message", "Employee deleted successfully"));
    }
}
```

```java
// src/main/java/com/tomatohr/dto/EmployeePageRequest.java
package com.tomatohr.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class EmployeePageRequest {
    
    @NotNull(message = "Page number is required")
    @Min(value = 1, message = "Page number must be at least 1")
    @Schema(description = "Page number (1-based)", example = "1")
    private Integer pageNum;
    
    @NotNull(message = "Page size is required")
    @Min(value = 1, message = "Page size must be at least 1")
    @Schema(description = "Number of items per page", example = "10")
    private Integer pageSize;
    
    @Schema(description = "Filter by employee name", example = "John")
    private String name;
    
    @Schema(description = "Filter by email", example = "john@example.com")
    private String email;
    
    @Schema(description = "Filter by active status", example = "true")
    private Boolean isActive;
    
    // Constructors, getters, and setters
    public EmployeePageRequest() {}
    
    public EmployeePageRequest(Integer pageNum, Integer pageSize) {
        this.pageNum = pageNum;
        this.pageSize = pageSize;
    }
    
    // Getters and setters
    public Integer getPageNum() { return pageNum; }
    public void setPageNum(Integer pageNum) { this.pageNum = pageNum; }
    
    public Integer getPageSize() { return pageSize; }
    public void setPageSize(Integer pageSize) { this.pageSize = pageSize; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
```

```shellscript
# Navigate to your Spring Boot project
cd your-spring-boot-project

# Run the application
mvn spring-boot:run
# or
./mvnw spring-boot:run
```

```shellscript
# In your React project root
npm install -D @openapitools/openapi-generator-cli
```

```json
// package.json - Add these scripts
{
  "scripts": {
    "generate:api": "openapi-generator-cli generate -i http://localhost:8080/api/api-docs -g typescript-axios -o src/generated/api --additional-properties=typescriptThreePlus=true,supportsES6=true,withInterfaces=true",
    "generate:api:local": "openapi-generator-cli generate -i ./api-spec.json -g typescript-axios -o src/generated/api --additional-properties=typescriptThreePlus=true,supportsES6=true,withInterfaces=true",
    "dev": "npm run generate:api && vite",
    "build": "npm run generate:api && tsc && vite build"
  }
}
```

```yaml
# openapi-generator-config.yml
generatorName: typescript-axios
inputSpec: http://localhost:8080/api/api-docs
outputDir: src/generated/api
additionalProperties:
  typescriptThreePlus: true
  supportsES6: true
  withInterfaces: true
  npmName: @tomatohr/api-client
  npmVersion: 1.0.0
```

```shellscript
# Generate TypeScript client from running Spring Boot app
npm run generate:api

# Or generate from local JSON file
curl http://localhost:8080/api/api-docs > api-spec.json
npm run generate:api:local
```

```typescript
// src/services/generatedApi.ts
import { Configuration, DefaultApi } from '../generated/api';
import { envConfig } from '../config/env';

// Create configuration
const configuration = new Configuration({
  basePath: envConfig.apiBaseUrl,
  accessToken: () => localStorage.getItem('authToken') || '',
});

// Create API instance
export const generatedApi = new DefaultApi(configuration);

// Export individual services for easier use
export const employeeApi = {
  getEmployeePage: (request: any) => generatedApi.getEmployeePage(request),
  createEmployee: (request: any) => generatedApi.createEmployee(request),
  getEmployeeById: (id: string) => generatedApi.getEmployeeById(id),
  updateEmployee: (id: string, request: any) => generatedApi.updateEmployee(id, request),
  deleteEmployee: (id: string) => generatedApi.deleteEmployee(id),
};

export const businessApi = {
  // Add business-related API calls
};

export const authApi = {
  // Add auth-related API calls
};
```

```typescript
// src/services/employeeService.ts
import { employeeApi } from './generatedApi';
import { ApiResponse } from '../types/payload';

class EmployeeService {
  /**
   * Get paginated list of employees
   */
  async getEmployeePage(request: any): Promise<ApiResponse<any>> {
    try {
      const response = await employeeApi.getEmployeePage(request);
      return {
        code: 200,
        msg: 'Success',
        data: response.data
      };
    } catch (error: any) {
      console.error('Get employee page error:', error);
      
      return {
        code: error.response?.status || 500,
        msg: error.response?.data?.msg || 'Failed to get employee list.',
      };
    }
  }

  /**
   * Create new employee
   */
  async createEmployee(request: any): Promise<ApiResponse<any>> {
    try {
      const response = await employeeApi.createEmployee(request);
      return {
        code: 200,
        msg: 'Success',
        data: response.data
      };
    } catch (error: any) {
      console.error('Create employee error:', error);
      
      return {
        code: error.response?.status || 500,
        msg: error.response?.data?.msg || 'Failed to create employee.',
      };
    }
  }
}

export const employeeService = new EmployeeService();
export default employeeService;
```

```typescript
// src/services/index.ts
// Export all services
export { default as api } from './api';
export { default as authService } from './authService';
export { default as businessService } from './businessService';
export { default as employeeService } from './employeeService';

// Export generated API
export { generatedApi, employeeApi, businessApi, authApi } from './generatedApi';

// Export mock utilities
export {
  disableMockMode, enableMockMode, getMockConfiguration, 
  initializeMockMode, isMockModeEnabled, setupMockMode, toggleMockMode
} from '../utils/mockConfig';
```

```typescript
// src/pages/Employees/Employees.tsx
import React, { useState, useEffect } from 'react';
import { Table, Button, message } from 'antd';
import { employeeService } from '../../services';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeService.getEmployeePage({
        pageNum: 1,
        pageSize: 10
      });

      if (response.code === 200 && response.data) {
        setEmployees(response.data.list);
      } else {
        message.error(response.msg);
      }
    } catch (error) {
      message.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div>
      <h1>Employees</h1>
      <Table
        dataSource={employees}
        loading={loading}
        columns={[
          { title: 'Name', dataIndex: 'name', key: 'name' },
          { title: 'Email', dataIndex: 'email', key: 'email' },
          { title: 'Phone', dataIndex: 'phone', key: 'phone' },
          { title: 'Status', dataIndex: 'isActive', key: 'isActive' },
        ]}
      />
    </div>
  );
};

export default Employees;
```

```json
// package.json
{
  "scripts": {
    "dev": "npm run generate:api && vite",
    "dev:backend": "npm run generate:api:watch",
    "generate:api:watch": "nodemon --watch ../backend --exec 'npm run generate:api'",
    "build": "npm run generate:api && tsc && vite build"
  }
}
```

```plaintext
# Generated API files
src/generated/
api-spec.json
```

```typescript
// src/config/env.ts
export const getEnvConfig = (): EnvConfig => {
  return {
    // ... existing config
    apiBaseUrl: viteApiBaseUrl || 'http://localhost:8080/api',
    // For production, use your deployed backend URL
    // apiBaseUrl: 'https://api.tomatohr.com',
  };
};
```

```yaml
# .github/workflows/build.yml
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Generate API client
        run: npm run generate:api
        
      - name: Build application
        run: npm run build
```

