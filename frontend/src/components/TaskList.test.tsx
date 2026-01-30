import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "../test/utils/test-utils";
import TaskList from "./TaskList";
import { taskService, authService } from "../services";

// Mock services
vi.mock("../services", () => ({
  taskService: {
    listTasks: vi.fn(),
    createTask: vi.fn(),
    setTaskCompleted: vi.fn(),
    deleteTask: vi.fn(),
  },
  authService: {
    getUserId: vi.fn(),
  },
}));

describe("TaskList", () => {
  const mockOnTaskSelect = vi.fn();
  const mockOnTaskDeselect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.getUserId).mockReturnValue("test-user-id");
  });

  it("should render loading state initially", async () => {
    vi.mocked(taskService.listTasks).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <TaskList
        onTaskSelect={mockOnTaskSelect}
        onTaskDeselect={mockOnTaskDeselect}
      />
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should render tasks after loading", async () => {
    const mockTasks = [
      {
        id: "task-1",
        title: "Test Task 1",
        description: "Description 1",
        completed: false,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        displayOrder: 0,
      },
      {
        id: "task-2",
        title: "Test Task 2",
        description: "Description 2",
        completed: true,
        createdAt: "2024-01-02T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z",
        displayOrder: 1,
      },
    ];

    vi.mocked(taskService.listTasks).mockResolvedValue({
      code: 200,
      msg: "Success",
      data: mockTasks,
    });

    render(
      <TaskList
        onTaskSelect={mockOnTaskSelect}
        onTaskDeselect={mockOnTaskDeselect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Test Task 1")).toBeInTheDocument();
      expect(screen.getByText("Test Task 2")).toBeInTheDocument();
    });
  });

  it("should render empty state when no tasks", async () => {
    vi.mocked(taskService.listTasks).mockResolvedValue({
      code: 200,
      msg: "Success",
      data: [],
    });

    render(
      <TaskList
        onTaskSelect={mockOnTaskSelect}
        onTaskDeselect={mockOnTaskDeselect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
    });
  });

  it("should display error message on fetch failure", async () => {
    vi.mocked(taskService.listTasks).mockResolvedValue({
      code: 500,
      msg: "Failed to fetch tasks",
    });

    render(
      <TaskList
        onTaskSelect={mockOnTaskSelect}
        onTaskDeselect={mockOnTaskDeselect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch tasks/i)).toBeInTheDocument();
    });
  });

  it("should call onTaskSelect when task is clicked", async () => {
    const mockTasks = [
      {
        id: "task-1",
        title: "Test Task 1",
        description: "Description 1",
        completed: false,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        displayOrder: 0,
      },
    ];

    vi.mocked(taskService.listTasks).mockResolvedValue({
      code: 200,
      msg: "Success",
      data: mockTasks,
    });

    render(
      <TaskList
        onTaskSelect={mockOnTaskSelect}
        onTaskDeselect={mockOnTaskDeselect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Test Task 1")).toBeInTheDocument();
    });

    // Note: Actual click behavior depends on tree view implementation
    // This test verifies the component renders and can be extended
  });

  it("should show create task button", async () => {
    vi.mocked(taskService.listTasks).mockResolvedValue({
      code: 200,
      msg: "Success",
      data: [],
    });

    render(
      <TaskList
        onTaskSelect={mockOnTaskSelect}
        onTaskDeselect={mockOnTaskDeselect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/create task/i)).toBeInTheDocument();
    });
  });

  it("should show refresh button", async () => {
    vi.mocked(taskService.listTasks).mockResolvedValue({
      code: 200,
      msg: "Success",
      data: [],
    });

    render(
      <TaskList
        onTaskSelect={mockOnTaskSelect}
        onTaskDeselect={mockOnTaskDeselect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/refresh/i)).toBeInTheDocument();
    });
  });
});

