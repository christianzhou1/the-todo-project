package com.todo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.todo.entity.Task;
import com.todo.entity.User;
import com.todo.service.TaskService;
import com.todo.service.UserService;
import com.todo.util.JwtUtil;
import com.todo.util.TestDataFactory;
import com.todo.web.dto.CreateUserRequest;
import com.todo.web.dto.UpdateUserRequest;
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

@WebMvcTest(value = UserController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private TaskService taskService;

    @MockBean
    private JwtUtil jwtUtil;

    private User testUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        testUser = TestDataFactory.createTestUser();
        userId = UUID.randomUUID();
        testUser.setId(userId);
    }

    @Test
    void shouldGetAllUsers() throws Exception {
        // Given
        User user2 = TestDataFactory.createTestUser("user2", "user2@example.com");
        List<User> users = List.of(testUser, user2);
        when(userService.getAllUsers()).thenReturn(users);

        // When/Then
        mockMvc.perform(get("/users/get-all-users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].username").value("testuser"));

        verify(userService).getAllUsers();
    }

    @Test
    void shouldGetUserById() throws Exception {
        // Given
        when(userService.getUserById(userId)).thenReturn(testUser);

        // When/Then
        mockMvc.perform(get("/users/id/{id}", userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId.toString()))
                .andExpect(jsonPath("$.username").value("testuser"));

        verify(userService).getUserById(userId);
    }

    @Test
    void shouldReturn404WhenUserNotFound() throws Exception {
        // Given
        when(userService.getUserById(userId))
                .thenThrow(new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND));

        // When/Then
        mockMvc.perform(get("/users/id/{id}", userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(userService).getUserById(userId);
    }

    @Test
    void shouldGetUserByUsername() throws Exception {
        // Given
        when(userService.getUserByUsername("testuser")).thenReturn(testUser);

        // When/Then
        mockMvc.perform(get("/users/username/{username}", "testuser")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"));

        verify(userService).getUserByUsername("testuser");
    }

    @Test
    void shouldCreateUser() throws Exception {
        // Given
        CreateUserRequest request = TestDataFactory.createCreateUserRequest();
        when(userService.createUser(
                eq("testuser"),
                eq("test@example.com"),
                eq("password123"),
                eq("Test"),
                eq("User")))
                .thenReturn(testUser);

        // When/Then
        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(userId.toString()))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(header().exists("Location"));

        verify(userService).createUser(
                eq("testuser"),
                eq("test@example.com"),
                eq("password123"),
                eq("Test"),
                eq("User"));
    }

    @Test
    void shouldUpdateUser() throws Exception {
        // Given
        UpdateUserRequest request = new UpdateUserRequest();
        request.setUsername("updateduser");
        request.setEmail("updated@example.com");
        request.setFirstName("Updated");
        request.setLastName("User");
        
        User updatedUser = TestDataFactory.createTestUser("updateduser", "updated@example.com");
        updatedUser.setId(userId);
        updatedUser.setFirstName("Updated");
        updatedUser.setLastName("User");
        
        when(userService.updateUser(
                eq(userId),
                eq("updateduser"),
                eq("updated@example.com"),
                eq("Updated"),
                eq("User")))
                .thenReturn(updatedUser);

        // When/Then
        mockMvc.perform(put("/users/id/{id}", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("updateduser"));

        verify(userService).updateUser(
                eq(userId),
                eq("updateduser"),
                eq("updated@example.com"),
                eq("Updated"),
                eq("User"));
    }

    @Test
    void shouldDeactivateUser() throws Exception {
        // Given
        doNothing().when(userService).deactivateUser(userId);

        // When/Then
        mockMvc.perform(patch("/users/id/{id}/deactivate", userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(userService).deactivateUser(userId);
    }

    @Test
    void shouldActivateUser() throws Exception {
        // Given
        doNothing().when(userService).activateUser(userId);

        // When/Then
        mockMvc.perform(patch("/users/id/{id}/activate", userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(userService).activateUser(userId);
    }

    @Test
    void shouldGetUserTasks() throws Exception {
        // Given
        Task task = TestDataFactory.createTestTask(testUser);
        List<Task> tasks = List.of(task);
        when(userService.getUserById(userId)).thenReturn(testUser);
        when(taskService.listTasks(userId)).thenReturn(tasks);

        // When/Then
        mockMvc.perform(get("/users/id/{id}/tasks", userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        verify(userService).getUserById(userId);
        verify(taskService).listTasks(userId);
    }

    @Test
    void shouldValidateCreateUserRequest() throws Exception {
        // Given - invalid request with empty username
        CreateUserRequest invalidRequest = new CreateUserRequest();
        invalidRequest.setUsername("");
        invalidRequest.setEmail("test@example.com");
        invalidRequest.setPassword("password123");

        // When/Then
        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(userService, never()).createUser(any(), any(), any(), any(), any());
    }
}

