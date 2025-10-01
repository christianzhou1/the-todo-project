# OpenAPI Integration Guide for Todo Backend Project

This guide explains how to use the OpenAPI specification generation and frontend integration that has been set up for your todo backend project.

## Backend Setup (Completed)

### 1. Dependencies Added

- SpringDoc OpenAPI 3 dependency added to `pom.xml`
- OpenAPI configuration added to `application.yaml`

### 2. OpenAPI Configuration

- Created `OpenApiConfig.java` with JWT and X-User-Id header security schemes
- Added comprehensive OpenAPI annotations to all controllers:
  - `TaskController` - Task management operations
  - `AuthController` - Authentication operations
  - `UserController` - User management operations
  - `AttachmentController` - File attachment operations

### 3. API Documentation Access

Once your Spring Boot application is running, you can access:

- **Swagger UI**: `http://localhost:8080/api/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/api/api-docs`
- **OpenAPI YAML**: `http://localhost:8080/api/api-docs.yaml`

## Frontend Setup (Completed)

### 1. Dependencies Added

- `@openapitools/openapi-generator-cli` for code generation
- `axios` for HTTP requests

### 2. Code Generation Scripts

Added to `package.json`:

- `generate:api` - Generate from running backend
- `generate:api:local` - Generate from local JSON file
- `fetch:api-spec` - Download API spec to local file

### 3. Generated API Structure

- `src/generated/api/` - Auto-generated TypeScript client
- `src/services/generatedApi.ts` - API client wrapper
- `src/services/taskService.ts` - Task service with error handling
- `src/services/authService.ts` - Authentication service
- `src/services/attachmentService.ts` - File attachment service

## Development Workflow

### 1. Start Backend

```bash
# In your Spring Boot project root
mvn spring-boot:run
```

### 2. Generate Frontend API Client

```bash
# In your frontend directory
cd frontend
npm install
npm run generate:api
```

### 3. Start Frontend Development

```bash
npm run dev
```

## Usage Examples

### 1. Using Task Service

```typescript
import { taskService } from "./services";

// Get all tasks
const response = await taskService.getAllTasks(userId);
if (response.code === 200) {
  console.log("Tasks:", response.data);
}

// Create new task
const createResponse = await taskService.createTask(
  "My Task",
  "Task description",
  userId
);
```

### 2. Using Authentication Service

```typescript
import { authService } from "./services";

// Login
const loginResponse = await authService.login("username", "password");
if (loginResponse.code === 200) {
  // User is now authenticated
  console.log("User:", loginResponse.data.user);
}

// Check authentication status
if (authService.isAuthenticated()) {
  const userId = authService.getUserId();
  // Use userId for API calls
}
```

### 3. Using File Upload

```typescript
import { attachmentService } from "./services";

// Upload file for task
const file = document.getElementById("fileInput").files[0];
const response = await attachmentService.uploadFileForTask(
  taskId,
  file,
  userId
);
```

## React Component Examples

### 1. Task List Component

```typescript
import React, { useState, useEffect } from "react";
import { taskService, authService } from "./services";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const userId = authService.getUserId();
      const response = await taskService.getAllTasks(userId);
      if (response.code === 200) {
        setTasks(response.data);
      }
    };
    fetchTasks();
  }, []);

  return (
    <div>
      {tasks.map((task) => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
        </div>
      ))}
    </div>
  );
};
```

## Environment Configuration

Create a `.env.local` file in your frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_NODE_ENV=development
```

## Production Deployment

### 1. Update Environment Variables

```env
VITE_API_BASE_URL=https://your-production-api.com/api
VITE_NODE_ENV=production
```

### 2. Build Process

```bash
npm run generate:api
npm run build
```

## Benefits of This Setup

1. **Type Safety**: Full TypeScript coverage for all API calls
2. **Auto-completion**: IDE support for all endpoints and parameters
3. **Documentation**: Always up-to-date with backend changes
4. **Consistency**: Same patterns across all API calls
5. **Error Handling**: Centralized error management
6. **Maintainability**: Easy to update when backend changes

## Troubleshooting

### 1. API Generation Fails

- Ensure backend is running on `http://localhost:8080`
- Check if OpenAPI endpoint is accessible: `http://localhost:8080/api/api-docs`

### 2. Authentication Issues

- Verify JWT token is stored in localStorage
- Check X-User-Id header is being sent
- Ensure user is properly authenticated

### 3. CORS Issues

- Add CORS configuration to your Spring Boot backend
- Ensure frontend and backend are on same domain or properly configured

## Next Steps

1. **Add More Components**: Create forms for task creation, user management, etc.
2. **Add State Management**: Consider using Redux or Zustand for complex state
3. **Add Error Boundaries**: Implement React error boundaries for better error handling
4. **Add Loading States**: Implement proper loading indicators
5. **Add Form Validation**: Use libraries like Formik or React Hook Form
6. **Add Testing**: Write unit and integration tests for your components and services
