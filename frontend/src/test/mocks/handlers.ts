import { http, HttpResponse } from "msw";

const API_BASE_URL = "http://localhost:8080/api";

export const handlers = [
  // Authentication endpoints
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { usernameOrEmail?: string; password?: string };
    
    if (body.usernameOrEmail === "testuser" && body.password === "password123") {
      return HttpResponse.json({
        token: "mock-jwt-token",
        userId: "test-user-id",
        username: "testuser",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
      }, { status: 200 });
    }
    
    return HttpResponse.json(
      { msg: "Invalid credentials" },
      { status: 401 }
    );
  }),

  http.get(`${API_BASE_URL}/auth/me`, () => {
    return HttpResponse.json({
      token: "mock-jwt-token",
      userId: "test-user-id",
      username: "testuser",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    }, { status: 200 });
  }),

  http.post(`${API_BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({}, { status: 200 });
  }),

  // User endpoints
  http.post(`${API_BASE_URL}/users`, async ({ request }) => {
    const body = await request.json() as { username?: string; email?: string };
    
    if (body.username === "existinguser") {
      return HttpResponse.json(
        { msg: "Username already exists" },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({
      id: "new-user-id",
      username: body.username,
      email: body.email,
      firstName: "New",
      lastName: "User",
    }, { status: 201 });
  }),

  // Task endpoints
  http.get(`${API_BASE_URL}/tasks`, ({ request }) => {
    const userId = request.headers.get("X-User-Id");
    const authHeader = request.headers.get("Authorization");
    
    // Check for both X-User-Id header and Authorization token for stricter auth
    if (!userId || !authHeader) {
      return HttpResponse.json(
        { msg: "Unauthorized" },
        { status: 401 }
      );
    }

    return HttpResponse.json([
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
    ], { status: 200 });
  }),

  http.get(`${API_BASE_URL}/tasks/id/:id`, ({ params, request }) => {
    const userId = request.headers.get("X-User-Id");
    const authHeader = request.headers.get("Authorization");
    if (!userId || !authHeader) {
      return HttpResponse.json(
        { msg: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params as { id: string };
    if (id === "not-found") {
      return HttpResponse.json(
        { msg: "Task not found" },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      id,
      title: "Test Task",
      description: "Test description",
      completed: false,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      displayOrder: 0,
    }, { status: 200 });
  }),

  http.post(`${API_BASE_URL}/tasks`, async ({ request }) => {
    const userId = request.headers.get("X-User-Id");
    const authHeader = request.headers.get("Authorization");
    if (!userId || !authHeader) {
      return HttpResponse.json(
        { msg: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json() as { title?: string; description?: string };
    
    if (!body.title) {
      return HttpResponse.json(
        { msg: "Title is required" },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      id: "new-task-id",
      title: body.title,
      description: body.description || "",
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      displayOrder: 0,
    }, { status: 200 });
  }),

  http.put(`${API_BASE_URL}/tasks/id/:id`, async ({ params, request }) => {
    const userId = request.headers.get("X-User-Id");
    const authHeader = request.headers.get("Authorization");
    if (!userId || !authHeader) {
      return HttpResponse.json(
        { msg: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params as { id: string };
    const body = await request.json() as { title?: string; description?: string; isCompleted?: boolean };

    if (id === "not-found") {
      return HttpResponse.json(
        { msg: "Task not found" },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      id,
      title: body.title || "Updated Task",
      description: body.description || "",
      completed: body.isCompleted ?? false,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
      displayOrder: 0,
    }, { status: 200 });
  }),

  http.delete(`${API_BASE_URL}/tasks/id/:id`, ({ params, request }) => {
    const userId = request.headers.get("X-User-Id");
    const authHeader = request.headers.get("Authorization");
    if (!userId || !authHeader) {
      return HttpResponse.json(
        { msg: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params as { id: string };
    if (id === "not-found") {
      return HttpResponse.json(
        { msg: "Task not found" },
        { status: 404 }
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),

  // Additional task endpoints
  http.get(`${API_BASE_URL}/tasks/id/:id/detail`, ({ params, request }) => {
    const userId = request.headers.get("X-User-Id");
    const authHeader = request.headers.get("Authorization");
    if (!userId || !authHeader) {
      return HttpResponse.json(
        { msg: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params as { id: string };
    if (id === "not-found") {
      return HttpResponse.json(
        { msg: "Task not found" },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      id,
      title: "Test Task",
      description: "Test description",
      completed: false,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      attachments: [],
      categories: [],
      comments: [],
    }, { status: 200 });
  }),

  http.get(`${API_BASE_URL}/tasks/details`, ({ request }) => {
    const userId = request.headers.get("X-User-Id");
    const authHeader = request.headers.get("Authorization");
    if (!userId || !authHeader) {
      return HttpResponse.json(
        { msg: "Unauthorized" },
        { status: 401 }
      );
    }

    return HttpResponse.json([
      {
        id: "task-1",
        title: "Test Task 1",
        description: "Test description",
        completed: false,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        attachments: [],
        categories: [],
        comments: [],
      },
    ], { status: 200 });
  }),

  http.get(`${API_BASE_URL}/tasks/listalltasks`, ({ request }) => {
    const userId = request.headers.get("X-User-Id");
    const authHeader = request.headers.get("Authorization");
    if (!userId || !authHeader) {
      return HttpResponse.json(
        { msg: "Unauthorized" },
        { status: 401 }
      );
    }

    return HttpResponse.json([
      {
        id: "task-1",
        title: "Test Task 1",
        description: "Test description",
        completed: false,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        displayOrder: 0,
      },
    ], { status: 200 });
  }),

  http.get(`${API_BASE_URL}/tasks/root`, ({ request }) => {
    const userId = request.headers.get("X-User-Id");
    const authHeader = request.headers.get("Authorization");
    if (!userId || !authHeader) {
      return HttpResponse.json(
        { msg: "Unauthorized" },
        { status: 401 }
      );
    }

    return HttpResponse.json([
      {
        id: "task-1",
        title: "Root Task",
        description: "Root task description",
        completed: false,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        displayOrder: 0,
      },
    ], { status: 200 });
  }),

  http.post(`${API_BASE_URL}/tasks/mock`, ({ request }) => {
    const userId = request.headers.get("X-User-Id");
    const authHeader = request.headers.get("Authorization");
    if (!userId || !authHeader) {
      return HttpResponse.json(
        { msg: "Unauthorized" },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      id: "mock-task-id",
      title: "Mock Task",
      description: "Generated by /tasks/mock",
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      displayOrder: 0,
    }, { status: 200 });
  }),

  http.post(`${API_BASE_URL}/tasks/mock/`, ({ request }) => {
    const userId = request.headers.get("X-User-Id");
    const authHeader = request.headers.get("Authorization");
    if (!userId || !authHeader) {
      return HttpResponse.json(
        { msg: "Unauthorized" },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      id: "mock-task-id",
      title: "Mock Task",
      description: "Generated by /tasks/mock",
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      displayOrder: 0,
    }, { status: 200 });
  }),
];

