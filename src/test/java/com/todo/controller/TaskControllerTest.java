package com.todo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.todo.api.dto.TaskDetailInfo;
import com.todo.entity.Task;
import com.todo.entity.User;
import com.todo.service.TaskService;
import com.todo.service.UserService;
import com.todo.util.JwtUtil;
import com.todo.util.TestDataFactory;
import com.todo.web.dto.CreateTaskRequest;
import com.todo.web.dto.UpdateTaskRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = TaskController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TaskService taskService;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtUtil jwtUtil;

    private User testUser;
    private UUID userId;
    private UUID taskId;
    private Task testTask;

    @BeforeEach
    void setUp() {
        testUser = TestDataFactory.createTestUser();
        userId = UUID.randomUUID();
        testUser.setId(userId);
        taskId = UUID.randomUUID();
        testTask = TestDataFactory.createTestTask(testUser);
        testTask.setId(taskId);
    }

    @Test
    void shouldListTasks() throws Exception {
        // Given
        List<Task> tasks = List.of(testTask);
        when(userService.getUserById(userId)).thenReturn(testUser);
        when(taskService.listTasks(userId)).thenReturn(tasks);

        // When/Then
        mockMvc.perform(get("/tasks")
                        .header("X-User-Id", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(taskId.toString()));

        verify(taskService).listTasks(userId);
    }

    @Test
    void shouldGetTaskById() throws Exception {
        // Given
        when(userService.getUserById(userId)).thenReturn(testUser);
        when(taskService.getTaskById(taskId, userId)).thenReturn(testTask);

        // When/Then
        mockMvc.perform(get("/tasks/id/{id}", taskId)
                        .header("X-User-Id", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(taskId.toString()))
                .andExpect(jsonPath("$.title").value("Test Task"));

        verify(taskService).getTaskById(taskId, userId);
    }

    @Test
    void shouldReturn404WhenTaskNotFound() throws Exception {
        // Given
        when(userService.getUserById(userId)).thenReturn(testUser);
        when(taskService.getTaskById(taskId, userId))
                .thenThrow(new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND));

        // When/Then
        mockMvc.perform(get("/tasks/id/{id}", taskId)
                        .header("X-User-Id", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(taskService).getTaskById(taskId, userId);
    }

    @Test
    void shouldCreateTask() throws Exception {
        // Given
        CreateTaskRequest request = TestDataFactory.createCreateTaskRequest("New Task", "Description");
        when(userService.getUserById(userId)).thenReturn(testUser);
        when(taskService.createTask(eq("New Task"), eq("Description"), eq(userId), any()))
                .thenReturn(testTask);

        // When/Then
        mockMvc.perform(post("/tasks")
                        .header("X-User-Id", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(taskId.toString()))
                .andExpect(jsonPath("$.title").value("Test Task"));

        verify(taskService).createTask(eq("New Task"), eq("Description"), eq(userId), any());
    }

    @Test
    void shouldUpdateTask() throws Exception {
        // Given
        UpdateTaskRequest request = TestDataFactory.createUpdateTaskRequest("Updated Title", "Updated Description", true);
        Task updatedTask = TestDataFactory.createTestTask(testUser, "Updated Title", "Updated Description");
        updatedTask.setId(taskId);
        updatedTask.setCompleted(true);
        
        when(userService.getUserById(userId)).thenReturn(testUser);
        when(taskService.updateTask(taskId, "Updated Title", "Updated Description", true, userId))
                .thenReturn(updatedTask);

        // When/Then
        mockMvc.perform(put("/tasks/id/{id}", taskId)
                        .header("X-User-Id", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"));

        verify(taskService).updateTask(taskId, "Updated Title", "Updated Description", true, userId);
    }

    @Test
    void shouldSetTaskCompleted() throws Exception {
        // Given
        Task completedTask = TestDataFactory.createTestTask(testUser);
        completedTask.setId(taskId);
        completedTask.setCompleted(true);
        
        when(userService.getUserById(userId)).thenReturn(testUser);
        when(taskService.setCompleted(taskId, true, userId)).thenReturn(completedTask);

        // When/Then
        mockMvc.perform(patch("/tasks/id/{id}/complete", taskId)
                        .header("X-User-Id", userId.toString())
                        .param("value", "true")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(taskId.toString()));

        verify(taskService).setCompleted(taskId, true, userId);
    }

    @Test
    void shouldDeleteTask() throws Exception {
        // Given
        when(userService.getUserById(userId)).thenReturn(testUser);
        doNothing().when(taskService).deleteTask(taskId, userId);

        // When/Then
        mockMvc.perform(delete("/tasks/id/{id}", taskId)
                        .header("X-User-Id", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(taskService).deleteTask(taskId, userId);
    }

    @Test
    void shouldReturn401WhenUserIdHeaderMissing() throws Exception {
        // When/Then
        mockMvc.perform(get("/tasks")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        verify(taskService, never()).listTasks(any());
    }

    @Test
    void shouldGetTaskDetail() throws Exception {
        // Given
        TaskDetailInfo taskDetail = new TaskDetailInfo();
        taskDetail.setId(taskId);
        taskDetail.setTitle("Test Task");
        
        when(userService.getUserById(userId)).thenReturn(testUser);
        when(taskService.getTaskDetail(taskId, userId)).thenReturn(taskDetail);

        // When/Then
        mockMvc.perform(get("/tasks/id/{id}/detail", taskId)
                        .header("X-User-Id", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(taskId.toString()))
                .andExpect(jsonPath("$.title").value("Test Task"));

        verify(taskService).getTaskDetail(taskId, userId);
    }
}

