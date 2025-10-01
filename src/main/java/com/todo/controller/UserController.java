package com.todo.controller;

import com.todo.api.dto.TaskSummary;
import com.todo.api.dto.UserInfo;
import com.todo.api.dto.UserSummary;
import com.todo.entity.User;
import com.todo.service.TaskService;
import com.todo.service.UserService;
import com.todo.web.dto.CreateUserRequest;
import com.todo.web.dto.UpdateUserRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {

    private final UserService userService;
    private final TaskService taskService;

    @GetMapping("/get-all-users")
    @Operation(
        summary = "Get all users",
        description = "Retrieve a list of all users in the system"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Users retrieved successfully")
    })
    public ResponseEntity<List<UserSummary>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserSummary> userSummaries = users.stream()
                .map(com.todo.api.mapper.UserMapper::toUserSummary)
                .toList();
        return ResponseEntity.ok(userSummaries);
    }

    @GetMapping("/id/{id}")
    @Operation(
        summary = "Get user by ID",
        description = "Retrieve user information by user ID"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User found"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserInfo> getUserById(
            @Parameter(description = "User ID") @PathVariable UUID id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(com.todo.api.mapper.UserMapper.toUserInfo(user));
    }

    @GetMapping("/username/{username}")
    @Operation(
        summary = "Get user by username",
        description = "Retrieve user information by username"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User found"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserInfo> getUserByUsername(
            @Parameter(description = "Username") @PathVariable String username) {
        User user = userService.getUserByUsername(username);
        return ResponseEntity.ok(com.todo.api.mapper.UserMapper.toUserInfo(user));
    }

    @PostMapping
    @Operation(
        summary = "Create new user",
        description = "Create a new user account"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "User created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid user data"),
        @ApiResponse(responseCode = "409", description = "Username or email already exists")
    })
    public ResponseEntity<UserInfo> createUser(@Validated @RequestBody CreateUserRequest request) {
        User saved = userService.createUser(
                request.getUsername(),
                request.getEmail(),
                request.getPassword(),
                request.getFirstName(),
                request.getLastName()
        );

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/id/{id}")
                .buildAndExpand(saved.getId())
                .toUri();

        return ResponseEntity.created(location).body(com.todo.api.mapper.UserMapper.toUserInfo(saved));
    }

    @PutMapping("/id/{id}")
    @Operation(
        summary = "Update user",
        description = "Update user information"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User updated successfully"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "400", description = "Invalid user data")
    })
    public ResponseEntity<UserInfo> updateUser(
            @Parameter(description = "User ID") @PathVariable UUID id, 
            @Validated @RequestBody UpdateUserRequest request) {
        User updated = userService.updateUser(
                id,
                request.getUsername(),
                request.getEmail(),
                request.getFirstName(),
                request.getLastName()
        );
        return ResponseEntity.ok(com.todo.api.mapper.UserMapper.toUserInfo(updated));
    }

    @PatchMapping("/id/{id}/deactivate")
    @Operation(
        summary = "Deactivate user",
        description = "Deactivate a user account"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "User deactivated successfully"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<Void> deactivateUser(
            @Parameter(description = "User ID") @PathVariable UUID id) {
        userService.deactivateUser(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/id/{id}/activate")
    @Operation(
        summary = "Activate user",
        description = "Activate a user account"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "User activated successfully"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<Void> activateUser(
            @Parameter(description = "User ID") @PathVariable UUID id) {
        userService.activateUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/id/{id}/tasks")
    @Operation(
        summary = "Get user tasks",
        description = "Retrieve all tasks for a specific user"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User tasks retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<List<TaskSummary>> getUserTasks(
            @Parameter(description = "User ID") @PathVariable UUID id) {
        userService.getUserById(id); // Validate user exists
        List<com.todo.entity.Task> tasks = taskService.listTasks(id);
        List<TaskSummary> taskSummaries = tasks.stream()
                .map(com.todo.api.mapper.TaskMapper::toTaskSummary)
                .toList();
        return ResponseEntity.ok(taskSummaries);
    }
}