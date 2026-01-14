import { taskApi } from "./generatedApi";
import axios from "axios";
import { envConfig } from "../config/env";

export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data?: T;
}

class TaskService {
  /**
   * Get paginated list of tasks
   */
  async getTaskPage(
    userId: string,
    page: number = 0,
    size: number = 10,
    sort: string = "createdAt,desc"
  ): Promise<ApiResponse<unknown>> {
    try {
      const response = await taskApi.listTasks(userId, page, size, sort);
      return {
        code: 200,
        msg: "Success",
        data: response.data,
      };
    } catch (error: unknown) {
      console.error("Get task page error:", error);
      const axiosError = error && typeof error === 'object' && 'response' in error 
        ? error as { response?: { status?: number; data?: { msg?: string } } } 
        : null;

      return {
        code: axiosError?.response?.status || 500,
        msg: axiosError?.response?.data?.msg || "Failed to get task list.",
      };
    }
  }

  /**
   * Get task detail by ID
   */
  async getTaskDetail(id: string, userId: string): Promise<ApiResponse<unknown>> {
    try {
      const response = await taskApi.getTaskDetail(id, userId);
      return {
        code: 200,
        msg: "Success",
        data: response.data,
      };
    } catch (error: unknown) {
      console.error("Get task detail error:", error);
      const axiosError = error && typeof error === 'object' && 'response' in error 
        ? error as { response?: { status?: number; data?: { msg?: string } } } 
        : null;

      return {
        code: axiosError?.response?.status || 500,
        msg: axiosError?.response?.data?.msg || "Failed to get task detail.",
      };
    }
  }

  /**
   * List tasks (non deleted)
   */
  async listTasks(userId: string): Promise<ApiResponse<unknown>> {
    try {
      const response = await taskApi.listTasks(userId);
      return {
        code: 200,
        msg: "Success",
        data: response.data,
      };
    } catch (error: unknown) {
      console.error("List tasks error:", error);
      const axiosError = error && typeof error === 'object' && 'response' in error 
        ? error as { response?: { status?: number; data?: { msg?: string } } } 
        : null;

      return {
        code: axiosError?.response?.status || 500,
        msg: axiosError?.response?.data?.msg || "Failed to list tasks.",
      };
    }
  }

  /**
   * Create new task
   */
  async createTask(
    title: string,
    description: string,
    userId: string,
    parentTaskId?: string
  ): Promise<ApiResponse<unknown>> {
    try {
      const requestData: { title: string; description: string; parentTaskId?: string } = { title, description };
      if (parentTaskId) {
        requestData.parentTaskId = parentTaskId;
      }

      const response = await taskApi.createTask(userId, requestData);
      return {
        code: 200,
        msg: "Success",
        data: response.data,
      };
    } catch (error: unknown) {
      console.error("Create task error:", error);
      const axiosError = error && typeof error === 'object' && 'response' in error 
        ? error as { response?: { status?: number; data?: { msg?: string } } } 
        : null;

      return {
        code: axiosError?.response?.status || 500,
        msg: axiosError?.response?.data?.msg || "Failed to create task.",
      };
    }
  }

  /**
   * Update task
   */
  async updateTask(
    id: string,
    title?: string,
    description?: string,
    isCompleted?: boolean,
    userId?: string
  ): Promise<ApiResponse<unknown>> {
    try {
      const updateData: { title?: string; description?: string; isCompleted?: boolean } = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (isCompleted !== undefined) updateData.isCompleted = isCompleted;

      const response = await taskApi.updateTask(id, userId!, updateData);
      return {
        code: 200,
        msg: "Success",
        data: response.data,
      };
    } catch (error: unknown) {
      console.error("Update task error:", error);
      const axiosError = error && typeof error === 'object' && 'response' in error 
        ? error as { response?: { status?: number; data?: { msg?: string } } } 
        : null;

      return {
        code: axiosError?.response?.status || 500,
        msg: axiosError?.response?.data?.msg || "Failed to update task.",
      };
    }
  }

  /**
   * Set task completion status
   */
  async setTaskCompleted(
    id: string,
    completed: boolean,
    userId: string
  ): Promise<ApiResponse<unknown>> {
    try {
      const updateData = { isCompleted: completed };
      const response = await taskApi.updateTask(id, userId, updateData);
      return {
        code: 200,
        msg: "Success",
        data: response.data,
      };
    } catch (error: unknown) {
      console.error("Set task completed error:", error);
      const axiosError = error && typeof error === 'object' && 'response' in error 
        ? error as { response?: { status?: number; data?: { msg?: string } } } 
        : null;

      return {
        code: axiosError?.response?.status || 500,
        msg:
          axiosError?.response?.data?.msg ||
          "Failed to update task completion status.",
      };
    }
  }

  /**
   * Delete task
   */
  async deleteTask(id: string, userId: string): Promise<ApiResponse<unknown>> {
    try {
      await taskApi.deleteTask(id, userId);
      return {
        code: 200,
        msg: "Task deleted successfully",
      };
    } catch (error: unknown) {
      console.error("Delete task error:", error);
      const axiosError = error && typeof error === 'object' && 'response' in error 
        ? error as { response?: { status?: number; data?: { msg?: string } } } 
        : null;

      return {
        code: axiosError?.response?.status || 500,
        msg: axiosError?.response?.data?.msg || "Failed to delete task.",
      };
    }
  }

  /**
   * Get all tasks for user
   */
  async getAllTasks(userId: string): Promise<ApiResponse<unknown>> {
    try {
      const response = await taskApi.listAllTasks(userId);
      return {
        code: 200,
        msg: "Success",
        data: response.data,
      };
    } catch (error: unknown) {
      console.error("Get all tasks error:", error);
      const axiosError = error && typeof error === 'object' && 'response' in error 
        ? error as { response?: { status?: number; data?: { msg?: string } } } 
        : null;

      return {
        code: axiosError?.response?.status || 500,
        msg: axiosError?.response?.data?.msg || "Failed to get all tasks.",
      };
    }
  }

  /**
   * Get all task details for user
   */
  async getAllTaskDetails(userId: string): Promise<ApiResponse<unknown>> {
    try {
      const response = await taskApi.listAllTaskDetails(userId);
      return {
        code: 200,
        msg: "Success",
        data: response.data,
      };
    } catch (error: unknown) {
      console.error("Get all task details error:", error);
      const axiosError = error && typeof error === 'object' && 'response' in error 
        ? error as { response?: { status?: number; data?: { msg?: string } } } 
        : null;

      return {
        code: axiosError?.response?.status || 500,
        msg: axiosError?.response?.data?.msg || "Failed to get task details.",
      };
    }
  }

  /**
   * Create mock task
   */
  async createMockTask(userId: string): Promise<ApiResponse<unknown>> {
    try {
      const response = await taskApi.insertMock(userId);
      return {
        code: 200,
        msg: "Success",
        data: response.data,
      };
    } catch (error: unknown) {
      console.error("Create mock task error:", error);
      const axiosError = error && typeof error === 'object' && 'response' in error 
        ? error as { response?: { status?: number; data?: { msg?: string } } } 
        : null;

      return {
        code: axiosError?.response?.status || 500,
        msg: axiosError?.response?.data?.msg || "Failed to create mock task.",
      };
    }
  }

  /**
   * Get root tasks
   */
  async getRootTasks(userId: string): Promise<ApiResponse<unknown>> {
    try {
      const response = await taskApi.getRootTasks(userId);
      return {
        code: 200,
        msg: "Success",
        data: response.data,
      };
    } catch (error: unknown) {
      console.error("Get root tasks error:", error);
      const axiosError = error && typeof error === 'object' && 'response' in error 
        ? error as { response?: { status?: number; data?: { msg?: string } } } 
        : null;
      return {
        code: axiosError?.response?.status || 500,
        msg: axiosError?.response?.data?.msg || "Failed to get root tasks.",
      };
    }
  }

  async reorderTask(taskId: string, newDisplayOrder: number, userId: string) {
    try {
      const response = await axios.patch(
        `${envConfig.apiBaseUrl}/tasks/${taskId}/reorder`,
        null,
        {
          params: { newDisplayOrder },
          headers: {
            "X-User-Id": userId,
          },
        }
      );

      return {
        code: response.status,
        data: response.data,
      };
    } catch (error: unknown) {
      console.error("Reorder task error:", error);
      const axiosError = error && typeof error === 'object' && 'response' in error 
        ? error as { response?: { status?: number; data?: { msg?: string } } } 
        : null;
      return {
        code: axiosError?.response?.status || 500,
        msg: axiosError?.response?.data?.msg || "Failed to reorder task.",
      };
    }
  }
}

export const taskService = new TaskService();
export default taskService;
