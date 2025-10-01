import React, { useState, useEffect } from "react";
import { taskService, authService } from "../services";

interface Task {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = authService.getUserId();
      if (!userId) {
        setError("User not authenticated");
        return;
      }

      const response = await taskService.getAllTasks(userId);

      if (response.code === 200 && response.data) {
        setTasks(response.data);
      } else {
        setError(response.msg);
      }
    } catch (err) {
      setError("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (
    taskId: string,
    currentStatus: boolean
  ) => {
    try {
      const userId = authService.getUserId();
      if (!userId) return;

      const response = await taskService.setTaskCompleted(
        taskId,
        !currentStatus,
        userId
      );

      if (response.code === 200) {
        // Update local state
        setTasks(
          tasks.map((task) =>
            task.id === taskId ? { ...task, isCompleted: !currentStatus } : task
          )
        );
      } else {
        setError(response.msg);
      }
    } catch (err) {
      setError("Failed to update task");
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const userId = authService.getUserId();
      if (!userId) return;

      const response = await taskService.deleteTask(taskId, userId);

      if (response.code === 200) {
        // Remove from local state
        setTasks(tasks.filter((task) => task.id !== taskId));
      } else {
        setError(response.msg);
      }
    } catch (err) {
      setError("Failed to delete task");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={fetchTasks}>Retry</button>
      </div>
    );
  }

  return (
    <div className="task-list">
      <h2>My Tasks</h2>
      <button onClick={fetchTasks}>Refresh</button>

      {tasks.length === 0 ? (
        <p>No tasks found. Create your first task!</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`task-item ${task.isCompleted ? "completed" : ""}`}
            >
              <div className="task-content">
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <small>
                  Created: {new Date(task.createdAt).toLocaleDateString()}
                </small>
              </div>
              <div className="task-actions">
                <button
                  onClick={() =>
                    toggleTaskCompletion(task.id, task.isCompleted)
                  }
                  className={
                    task.isCompleted ? "uncomplete-btn" : "complete-btn"
                  }
                >
                  {task.isCompleted ? "Mark Incomplete" : "Mark Complete"}
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
