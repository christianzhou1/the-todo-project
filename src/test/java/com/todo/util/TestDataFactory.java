package com.todo.util;

import com.todo.entity.Task;
import com.todo.entity.User;
import com.todo.web.dto.CreateTaskRequest;
import com.todo.web.dto.CreateUserRequest;
import com.todo.web.dto.LoginRequest;
import com.todo.web.dto.UpdateTaskRequest;

import java.time.Instant;
import java.util.UUID;

/**
 * Factory class for creating test data objects.
 * Provides convenient methods to create test entities and DTOs with sensible defaults.
 */
public class TestDataFactory {

    /**
     * Creates a test User entity with default values.
     * 
     * @return User with default test values
     */
    public static User createTestUser() {
        return User.builder()
                .username("testuser")
                .email("test@example.com")
                .passwordHash("$2a$10$hashedpassword")
                .firstName("Test")
                .lastName("User")
                .isActive(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    /**
     * Creates a test User entity with custom values.
     * 
     * @param username Custom username
     * @param email Custom email
     * @return User with custom values
     */
    public static User createTestUser(String username, String email) {
        return User.builder()
                .username(username)
                .email(email)
                .passwordHash("$2a$10$hashedpassword")
                .firstName("Test")
                .lastName("User")
                .isActive(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    /**
     * Creates a test User entity with all custom values.
     * 
     * @param username Custom username
     * @param email Custom email
     * @param passwordHash Custom password hash
     * @param firstName Custom first name
     * @param lastName Custom last name
     * @return User with all custom values
     */
    public static User createTestUser(String username, String email, String passwordHash, 
                                      String firstName, String lastName) {
        return User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordHash)
                .firstName(firstName)
                .lastName(lastName)
                .isActive(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    /**
     * Creates a test Task entity with default values.
     * 
     * @param user The user who owns the task
     * @return Task with default test values
     */
    public static Task createTestTask(User user) {
        return Task.builder()
                .user(user)
                .title("Test Task")
                .description("Test task description")
                .isCompleted(false)
                .isDeleted(false)
                .displayOrder(0)
                .createdAt(Instant.now())
                .build();
    }

    /**
     * Creates a test Task entity with custom values.
     * 
     * @param user The user who owns the task
     * @param title Custom title
     * @param description Custom description
     * @return Task with custom values
     */
    public static Task createTestTask(User user, String title, String description) {
        return Task.builder()
                .user(user)
                .title(title)
                .description(description)
                .isCompleted(false)
                .isDeleted(false)
                .displayOrder(0)
                .createdAt(Instant.now())
                .build();
    }

    /**
     * Creates a test Task entity with all custom values.
     * 
     * @param user The user who owns the task
     * @param title Custom title
     * @param description Custom description
     * @param isCompleted Completion status
     * @param parentTask Parent task (for subtasks)
     * @return Task with all custom values
     */
    public static Task createTestTask(User user, String title, String description, 
                                     boolean isCompleted, Task parentTask) {
        return Task.builder()
                .user(user)
                .title(title)
                .description(description)
                .isCompleted(isCompleted)
                .isDeleted(false)
                .displayOrder(0)
                .parentTask(parentTask)
                .createdAt(Instant.now())
                .build();
    }

    /**
     * Creates a CreateUserRequest DTO with default values.
     * 
     * @return CreateUserRequest with default test values
     */
    public static CreateUserRequest createCreateUserRequest() {
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername("testuser");
        request.setEmail("test@example.com");
        request.setPassword("password123");
        request.setFirstName("Test");
        request.setLastName("User");
        return request;
    }

    /**
     * Creates a CreateUserRequest DTO with custom values.
     * 
     * @param username Custom username
     * @param email Custom email
     * @param password Custom password
     * @return CreateUserRequest with custom values
     */
    public static CreateUserRequest createCreateUserRequest(String username, String email, String password) {
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername(username);
        request.setEmail(email);
        request.setPassword(password);
        request.setFirstName("Test");
        request.setLastName("User");
        return request;
    }

    /**
     * Creates a LoginRequest DTO with default values.
     * 
     * @return LoginRequest with default test values
     */
    public static LoginRequest createLoginRequest() {
        LoginRequest request = new LoginRequest();
        request.setUsernameOrEmail("testuser");
        request.setPassword("password123");
        return request;
    }

    /**
     * Creates a LoginRequest DTO with custom values.
     * 
     * @param usernameOrEmail Username or email
     * @param password Password
     * @return LoginRequest with custom values
     */
    public static LoginRequest createLoginRequest(String usernameOrEmail, String password) {
        LoginRequest request = new LoginRequest();
        request.setUsernameOrEmail(usernameOrEmail);
        request.setPassword(password);
        return request;
    }

    /**
     * Creates a CreateTaskRequest DTO with default values.
     * 
     * @return CreateTaskRequest with default test values
     */
    public static CreateTaskRequest createCreateTaskRequest() {
        CreateTaskRequest request = new CreateTaskRequest();
        request.setTitle("Test Task");
        request.setDescription("Test task description");
        return request;
    }

    /**
     * Creates a CreateTaskRequest DTO with custom values.
     * 
     * @param title Custom title
     * @param description Custom description
     * @return CreateTaskRequest with custom values
     */
    public static CreateTaskRequest createCreateTaskRequest(String title, String description) {
        CreateTaskRequest request = new CreateTaskRequest();
        request.setTitle(title);
        request.setDescription(description);
        return request;
    }

    /**
     * Creates a CreateTaskRequest DTO with parent task ID.
     * 
     * @param title Custom title
     * @param description Custom description
     * @param parentTaskId Parent task ID
     * @return CreateTaskRequest with parent task ID
     */
    public static CreateTaskRequest createCreateTaskRequest(String title, String description, UUID parentTaskId) {
        CreateTaskRequest request = new CreateTaskRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setParentTaskId(parentTaskId);
        return request;
    }

    /**
     * Creates an UpdateTaskRequest DTO with default values.
     * 
     * @return UpdateTaskRequest with default test values
     */
    public static UpdateTaskRequest createUpdateTaskRequest() {
        UpdateTaskRequest request = new UpdateTaskRequest();
        request.setTitle("Updated Task");
        request.setDescription("Updated description");
        request.setIsCompleted(false);
        return request;
    }

    /**
     * Creates an UpdateTaskRequest DTO with custom values.
     * 
     * @param title Custom title (can be null)
     * @param description Custom description (can be null)
     * @param isCompleted Completion status (can be null)
     * @return UpdateTaskRequest with custom values
     */
    public static UpdateTaskRequest createUpdateTaskRequest(String title, String description, Boolean isCompleted) {
        UpdateTaskRequest request = new UpdateTaskRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setIsCompleted(isCompleted);
        return request;
    }
}

