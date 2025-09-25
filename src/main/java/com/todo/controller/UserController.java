package com.todo.controller;

import com.todo.api.dto.TaskSummary;
import com.todo.api.dto.UserInfo;
import com.todo.api.dto.UserSummary;
import com.todo.entity.User;
import com.todo.service.TaskService;
import com.todo.service.UserService;
import com.todo.web.dto.CreateUserRequest;
import com.todo.web.dto.UpdateUserRequest;
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
public class UserController {

    private final UserService userService;
    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<UserSummary>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserSummary> userSummaries = users.stream()
                .map(com.todo.api.mapper.UserMapper::toUserSummary)
                .toList();
        return ResponseEntity.ok(userSummaries);
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<UserInfo> getUserById(@PathVariable UUID id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(com.todo.api.mapper.UserMapper.toUserInfo(user));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserInfo> getUserByUsername(@PathVariable String username) {
        User user = userService.getUserByUsername(username);
        return ResponseEntity.ok(com.todo.api.mapper.UserMapper.toUserInfo(user));
    }

    @PostMapping
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
    public ResponseEntity<UserInfo> updateUser(@PathVariable UUID id, @Validated @RequestBody UpdateUserRequest request) {
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
    public ResponseEntity<Void> deactivateUser(@PathVariable UUID id) {
        userService.deactivateUser(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/id/{id}/activate")
    public ResponseEntity<Void> activateUser(@PathVariable UUID id) {
        userService.activateUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/id/{id}/tasks")
    public ResponseEntity<List<TaskSummary>> getUserTasks(@PathVariable UUID id) {
        userService.getUserById(id); // Validate user exists
        List<com.todo.entity.Task> tasks = taskService.listTasks(id);
        List<TaskSummary> taskSummaries = tasks.stream()
                .map(com.todo.api.mapper.TaskMapper::toTaskSummary)
                .toList();
        return ResponseEntity.ok(taskSummaries);
    }
}