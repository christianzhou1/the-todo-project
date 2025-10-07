package com.todo.service;

import com.todo.api.dto.TaskDetailInfo;
import com.todo.api.dto.TaskSummary;
import com.todo.entity.Task;
import com.todo.entity.User;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

public interface TaskService {

    TaskDetailInfo getTaskDetail(UUID id, UUID userId);

    // CRUD operations

    Task createTask(String title, String description, UUID userId);
    Task createTask(String title, String description, UUID userId, UUID parentTaskId);

    Task getTaskById(UUID id, UUID userId);

    List<Task> listTasks(UUID userId);
    // Page<Task> listTasks(UUID userId, int page, int size, String sort);

    void deleteTask(UUID id, UUID userId);

    Task updateTask(UUID id, String title, String description, Boolean isComplete, UUID userId);

    Task setCompleted(UUID id, Boolean isComplete, UUID userId);

    Task insertMock(UUID userId);

    List<Task> listAllTasks(UUID userId);
    // Page<Task> listAllTasks(int page, int size, String sort);

    List<TaskDetailInfo> listAllTaskDetails(UUID userId);
    // Page<TaskDetailInfo> listAllTaskDetails(int page, int size, String sort);

    // Subtask operations
    List<Task> getSubtasks(UUID parentTaskId, UUID userId);
    List<Task> getSubtasksRecursively(UUID parentTaskId, UUID userId, int maxDepth);
    List<Task> getRootTasks(UUID userId);
    TaskSummary getTaskWithSubtasks(UUID taskId, UUID userId, int maxDepth);

    // Many-to-many relationship methods
    void linkAttachmentToTask(UUID taskId, UUID attachmentId, UUID userId);
    void unlinkAttachmentFromTask(UUID taskId, UUID attachmentId, UUID userId);
    void unlinkAllAttachmentsFromTask(UUID taskId, UUID userId);
}
