import { Page } from "@playwright/test";
import { envConfig } from "../../src/config/env";

const API_BASE_URL = process.env.PLAYWRIGHT_API_BASE_URL || envConfig.apiBaseUrl;

/**
 * Direct API calls for test data setup/teardown
 * These are used when testing against real backend
 */
export class ApiHelpers {
  constructor(private page: Page) {}

  /**
   * Create a test user via API
   */
  async createTestUser(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    const response = await this.page.request.post(`${API_BASE_URL}/users`, {
      data: userData,
    });
    return response;
  }

  /**
   * Login via API and return auth token
   */
  async loginViaApi(usernameOrEmail: string, password: string) {
    const response = await this.page.request.post(`${API_BASE_URL}/auth/login`, {
      data: { usernameOrEmail, password },
    });
    const data = await response.json();
    return {
      token: data.token,
      userId: data.userId,
      username: data.username,
    };
  }

  /**
   * Create a test task via API
   */
  async createTaskViaApi(
    userId: string,
    token: string,
    taskData: {
      title: string;
      description?: string;
      parentTaskId?: string;
    }
  ) {
    const response = await this.page.request.post(`${API_BASE_URL}/tasks`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-User-Id": userId,
      },
      data: taskData,
    });
    return response;
  }

  /**
   * Delete a task via API
   */
  async deleteTaskViaApi(taskId: string, userId: string, token: string) {
    const response = await this.page.request.delete(
      `${API_BASE_URL}/tasks/id/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-User-Id": userId,
        },
      }
    );
    return response;
  }

  /**
   * Get all tasks for a user via API
   */
  async getTasksViaApi(userId: string, token: string) {
    const response = await this.page.request.get(`${API_BASE_URL}/tasks`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-User-Id": userId,
      },
    });
    return response;
  }

  /**
   * Clean up test data (delete test user's tasks)
   */
  async cleanupTestData(userId: string, token: string) {
    const tasksResponse = await this.getTasksViaApi(userId, token);
    if (tasksResponse.ok()) {
      const tasks = await tasksResponse.json();
      if (Array.isArray(tasks)) {
        for (const task of tasks) {
          await this.deleteTaskViaApi(task.id, userId, token);
        }
      }
    }
  }
}

