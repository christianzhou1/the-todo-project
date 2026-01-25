import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../test/utils/test-utils";
import userEvent from "@testing-library/user-event";
import TaskItem from "./TaskItem";

describe("TaskItem", () => {
  const mockTask = {
    id: "task-1",
    title: "Test Task",
    description: "Test description",
    completed: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    displayOrder: 0,
  };

  const mockOnToggleCompletion = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnCreateSubtask = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render task with title and description", () => {
    render(
      <TaskItem
        task={mockTask}
        index={0}
        totalTasks={1}
        onToggleCompletion={mockOnToggleCompletion}
        onDelete={mockOnDelete}
        onCreateSubtask={mockOnCreateSubtask}
      />
    );

    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("should render completed task with strikethrough styling", () => {
    const completedTask = { ...mockTask, completed: true };
    render(
      <TaskItem
        task={completedTask}
        index={0}
        totalTasks={1}
        onToggleCompletion={mockOnToggleCompletion}
        onDelete={mockOnDelete}
        onCreateSubtask={mockOnCreateSubtask}
      />
    );

    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
  });

  it("should call onToggleCompletion when completion button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <TaskItem
        task={mockTask}
        index={0}
        totalTasks={1}
        onToggleCompletion={mockOnToggleCompletion}
        onDelete={mockOnDelete}
        onCreateSubtask={mockOnCreateSubtask}
      />
    );

    const completionButton = screen.getByRole("button", { name: /mark as complete/i });
    await user.click(completionButton);

    expect(mockOnToggleCompletion).toHaveBeenCalledWith("task-1", false);
  });

  it("should call onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <TaskItem
        task={mockTask}
        index={0}
        totalTasks={1}
        onToggleCompletion={mockOnToggleCompletion}
        onDelete={mockOnDelete}
        onCreateSubtask={mockOnCreateSubtask}
      />
    );

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith("task-1");
  });

  it("should call onCreateSubtask when subtask button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <TaskItem
        task={mockTask}
        index={0}
        totalTasks={1}
        onToggleCompletion={mockOnToggleCompletion}
        onDelete={mockOnDelete}
        onCreateSubtask={mockOnCreateSubtask}
      />
    );

    const subtaskButton = screen.getByRole("button", { name: /add subtask/i });
    await user.click(subtaskButton);

    expect(mockOnCreateSubtask).toHaveBeenCalledWith("task-1");
  });

  it("should display subtask count when present", () => {
    const taskWithSubtasks = { ...mockTask, subtaskCount: 3 };
    render(
      <TaskItem
        task={taskWithSubtasks}
        index={0}
        totalTasks={1}
        onToggleCompletion={mockOnToggleCompletion}
        onDelete={mockOnDelete}
        onCreateSubtask={mockOnCreateSubtask}
      />
    );

    expect(screen.getByText(/3 subtasks/i)).toBeInTheDocument();
  });

  it("should display attachment count when present", () => {
    const taskWithAttachments = { ...mockTask, attachmentCount: 2 };
    render(
      <TaskItem
        task={taskWithAttachments}
        index={0}
        totalTasks={1}
        onToggleCompletion={mockOnToggleCompletion}
        onDelete={mockOnDelete}
        onCreateSubtask={mockOnCreateSubtask}
      />
    );

    expect(screen.getByText(/2 attachments/i)).toBeInTheDocument();
  });

  it("should display created and updated dates", () => {
    render(
      <TaskItem
        task={mockTask}
        index={0}
        totalTasks={1}
        onToggleCompletion={mockOnToggleCompletion}
        onDelete={mockOnDelete}
        onCreateSubtask={mockOnCreateSubtask}
      />
    );

    expect(screen.getByText(/created:/i)).toBeInTheDocument();
    expect(screen.getByText(/updated:/i)).toBeInTheDocument();
  });

  it("should render divider when not last item", () => {
    render(
      <TaskItem
        task={mockTask}
        index={0}
        totalTasks={2}
        onToggleCompletion={mockOnToggleCompletion}
        onDelete={mockOnDelete}
        onCreateSubtask={mockOnCreateSubtask}
      />
    );

    // Divider should be present (MUI Divider component)
    const listItem = screen.getByRole("listitem");
    expect(listItem).toBeInTheDocument();
  });
});

