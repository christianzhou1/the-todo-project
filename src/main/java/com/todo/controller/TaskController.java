package com.todo.controller;

import com.todo.api.dto.TaskDetailInfo;
import com.todo.api.dto.TaskSummary;
import com.todo.entity.Task;
import com.todo.service.TaskService;
import com.todo.service.UserService;
import com.todo.util.PaginationUtils;
import com.todo.web.dto.CreateTaskRequest;
import com.todo.web.dto.UpdateTaskRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    public final TaskService taskService;
    private final UserService userService;

    @GetMapping("/id/{id}/detail")
    public ResponseEntity<TaskDetailInfo> getTaskDetail(@PathVariable UUID id, @RequestHeader("X-User-Id") UUID userId) {
        userService.getUserById(userId); // Validate user exists
        return ResponseEntity.ok(taskService.getTaskDetail(id, userId));
    }

    // Paged LIST
    @GetMapping
    public ResponseEntity<List<TaskSummary>> listTasks(
            @RequestHeader("X-User-Id") UUID userId,
            // default request parameters
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        userService.getUserById(userId); // Validate user exists
        // call the service to fetch Page<Task> according to parameters
        Page<Task> result = taskService.listTasks(userId, page, size, sort);

        List<TaskSummary> taskSummaries = result.getContent().stream()
                .map(com.todo.api.mapper.TaskMapper::toTaskSummary)
                .toList();

        HttpHeaders headers = PaginationUtils.buildPaginatedHeaders(result, sort);
        return ResponseEntity.ok().headers(headers).body(taskSummaries);
    }

    // GET by id (404 if deleted or not found)
    @GetMapping("/id/{id}")
    public TaskSummary getTaskById(@PathVariable UUID id, @RequestHeader("X-User-Id") UUID userId) {
        userService.getUserById(userId); // Validate user exists
        Task task = taskService.getTaskById(id, userId);
        return com.todo.api.mapper.TaskMapper.toTaskSummary(task);
    }

    // CREATE
    @PostMapping
    public ResponseEntity<TaskSummary> createTask(@Validated @RequestBody CreateTaskRequest req, @RequestHeader("X-User-Id") UUID userId) {
        userService.getUserById(userId); // Validate user exists
        Task saved = taskService.createTask(req.getTitle(), req.getDescription(), userId);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/id/{id}")
                .buildAndExpand(saved.getId())
                .toUri();

        TaskSummary taskSummary = com.todo.api.mapper.TaskMapper.toTaskSummary(saved);
        return ResponseEntity.created(location).body(taskSummary);
    }

    // UPDATE (idempotent PUT; only apply non-null fields)
    @PutMapping("/id/{id}")
    public TaskSummary updateTask(@PathVariable UUID id, @Validated @RequestBody UpdateTaskRequest req, @RequestHeader("X-User-Id") UUID userId) {
        userService.getUserById(userId); // Validate user exists
        Task updated = taskService.updateTask(id, req.getTitle(), req.getDescription(), req.getIsCompleted(), userId);
        return com.todo.api.mapper.TaskMapper.toTaskSummary(updated);
    }

    // PATCH completion: /tasks/{id}/complete?value=true|false
    @PatchMapping("/id/{id}/complete")
    public TaskSummary setCompleted(@PathVariable UUID id, @RequestParam("value") boolean value, @RequestHeader("X-User-Id") UUID userId) {
        userService.getUserById(userId); // Validate user exists
        Task updated = taskService.setCompleted(id, value, userId);
        return com.todo.api.mapper.TaskMapper.toTaskSummary(updated);
    }


    // SOFT DELETE
    @DeleteMapping("/id/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID id, @RequestHeader("X-User-Id") UUID userId) {
        userService.getUserById(userId); // Validate user exists
        taskService.deleteTask(id, userId);
        return ResponseEntity.noContent().build();
    }

    // Insert a mock task
    @PostMapping({"/mock", "/mock/"})
    public TaskSummary insertMock(@RequestHeader("X-User-Id") UUID userId) {
        userService.getUserById(userId); // Validate user exists
        Task mockTask = taskService.insertMock(userId);
        return com.todo.api.mapper.TaskMapper.toTaskSummary(mockTask);
    }

    // Get all tasks (deleted and non deleted)
    @GetMapping({"/listalltasks"})
    public List<TaskSummary> listAllTasks(@RequestHeader("X-User-Id") UUID userId) {
        userService.getUserById(userId); // Validate user exists
        List<Task> tasks = taskService.listAllTasks(userId);
        return tasks.stream()
                .map(com.todo.api.mapper.TaskMapper::toTaskSummary)
                .toList();
    }

    @GetMapping("/details")
    public ResponseEntity<List<TaskDetailInfo>> listAllTaskDetails(@RequestHeader("X-User-Id") UUID userId) {
        userService.getUserById(userId); // Validate user exists
        return ResponseEntity.ok(taskService.listAllTaskDetails(userId));
    }
}
