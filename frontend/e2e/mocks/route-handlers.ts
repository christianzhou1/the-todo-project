import { Route } from "@playwright/test";

/**
 * Convert MSW handlers to Playwright route handlers
 * This allows us to reuse the same handler logic for E2E tests
 */
export async function setupMockRoutes(route: Route) {
  const requestUrl = route.request().url();
  const url = new URL(requestUrl);
  // Match on pathname only (e.g., "/api/auth/login")
  const pathname = url.pathname;
  const method = route.request().method();

  // Authentication endpoints
  if (pathname === "/api/auth/login" && method === "POST") {
    const body = await route.request().postData();
    const data = body ? JSON.parse(body) : {};
    if (data.usernameOrEmail === "testuser" && data.password === "password123") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          token: "mock-jwt-token",
          userId: "test-user-id",
          username: "testuser",
          email: "test@example.com",
          firstName: "Test",
          lastName: "User",
        }),
      });
    }
    return route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ msg: "Invalid credentials" }),
    });
  }

  if (pathname === "/api/auth/me" && method === "GET") {
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        token: "mock-jwt-token",
        userId: "test-user-id",
        username: "testuser",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
      }),
    });
  }

  if (pathname === "/api/auth/logout" && method === "POST") {
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({}),
    });
  }

  // User endpoints
  if (pathname === "/api/users" && method === "POST") {
    const body = await route.request().postData();
    const data = body ? JSON.parse(body) : {};
    if (data.username === "existinguser") {
      return route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ msg: "Username already exists" }),
      });
    }
    return route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        id: "new-user-id",
        username: data.username,
        email: data.email,
        firstName: "New",
        lastName: "User",
      }),
    });
  }

  // Task endpoints
  if (pathname === "/api/tasks" && method === "GET") {
    const userId = route.request().headers()["x-user-id"];
    const authHeader = route.request().headers()["authorization"];
    
    if (!userId || !authHeader) {
      return route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ msg: "Unauthorized" }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "task-1",
          title: "Test Task 1",
          description: "Test description",
          completed: false,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          displayOrder: 0,
        },
        {
          id: "task-2",
          title: "Test Task 2",
          description: "Another test",
          completed: true,
          createdAt: "2024-01-02T00:00:00Z",
          updatedAt: "2024-01-02T00:00:00Z",
          displayOrder: 1,
        },
      ]),
    });
  }

  if (pathname.startsWith("/api/tasks/id/") && method === "GET") {
    const userId = route.request().headers()["x-user-id"];
    const authHeader = route.request().headers()["authorization"];
    
    if (!userId || !authHeader) {
      return route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ msg: "Unauthorized" }),
      });
    }

    const taskId = pathname.split("/").pop();
    if (taskId === "not-found") {
      return route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ msg: "Task not found" }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: taskId,
        title: "Test Task",
        description: "Test description",
        completed: false,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        displayOrder: 0,
      }),
    });
  }

  if (pathname === "/api/tasks" && method === "POST") {
    const userId = route.request().headers()["x-user-id"];
    const authHeader = route.request().headers()["authorization"];
    
    if (!userId || !authHeader) {
      return route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ msg: "Unauthorized" }),
      });
    }

    const body = await route.request().postData();
    const data = body ? JSON.parse(body) : {};
    if (!data.title) {
      return route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ msg: "Title is required" }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "new-task-id",
        title: data.title,
        description: data.description || "",
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        displayOrder: 0,
      }),
    });
  }

  if (pathname.startsWith("/api/tasks/id/") && method === "PUT") {
    const userId = route.request().headers()["x-user-id"];
    const authHeader = route.request().headers()["authorization"];
    
    if (!userId || !authHeader) {
      return route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ msg: "Unauthorized" }),
      });
    }

    const taskId = pathname.split("/").pop();
    if (taskId === "not-found") {
      return route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ msg: "Task not found" }),
      });
    }

    const body = await route.request().postData();
    const data = body ? JSON.parse(body) : {};
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: taskId,
        title: data.title || "Updated Task",
        description: data.description || "",
        completed: data.isCompleted ?? false,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: new Date().toISOString(),
        displayOrder: 0,
      }),
    });
  }

  if (pathname.startsWith("/api/tasks/id/") && method === "DELETE") {
    const userId = route.request().headers()["x-user-id"];
    const authHeader = route.request().headers()["authorization"];
    
    if (!userId || !authHeader) {
      return route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ msg: "Unauthorized" }),
      });
    }

    const taskId = pathname.split("/").pop();
    if (taskId === "not-found") {
      return route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ msg: "Task not found" }),
      });
    }

    return route.fulfill({
      status: 204,
    });
  }

  if (pathname.startsWith("/api/tasks/id/") && pathname.endsWith("/detail") && method === "GET") {
    const userId = route.request().headers()["x-user-id"];
    const authHeader = route.request().headers()["authorization"];
    
    if (!userId || !authHeader) {
      return route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ msg: "Unauthorized" }),
      });
    }

    const taskId = pathname.split("/")[pathname.split("/").length - 2];
    if (taskId === "not-found") {
      return route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ msg: "Task not found" }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: taskId,
        title: "Test Task",
        description: "Test description",
        completed: false,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        attachments: [],
        categories: [],
        comments: [],
      }),
    });
  }

  // Continue with other routes (not handled by mocks)
  await route.continue();
}

