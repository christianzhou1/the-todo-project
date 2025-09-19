package com.todo.service;

import com.todo.entity.Task;

import java.util.List;
import java.util.UUID;

public interface TaskService {

    // CRUD operations

    Task createTask(String taskName, String taskDesc);

    Task getTaskById(UUID id);

    List<Task> listTasks();

    void deleteTask(UUID id);

    Task updateTask(UUID id, String taskName, String taskDesc, Boolean completed);

    Task setCompleted(UUID id, Boolean completed);

    Task insertMock();
}
