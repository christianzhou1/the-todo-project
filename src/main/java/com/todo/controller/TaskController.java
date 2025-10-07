package com.todo.controller;

import com.todo.api.dto.TaskDetailInfo;
import com.todo.api.dto.TaskSummary;
import com.todo.api.mapper.TaskMapper;
import com.todo.entity.Task;
import com.todo.service.TaskService;
import com.todo.service.UserService;
import com.todo.util.PaginationUtils;
import com.todo.web.dto.CreateTaskRequest;
import com.todo.web.dto.UpdateTaskRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Task Management", description = "APIs for managing todo tasks")
@SecurityRequirement(name = "XUserIdHeader")
public class TaskController {

    public final TaskService taskService;
    private final UserService userService;

    @GetMapping("/id/{id}/detail")
    @Operation(
        summary = "Get task detail by ID",
        description = "Retrieve detailed information about a specific task including attachments"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Task detail retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Task not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<TaskDetailInfo> getTaskDetail(
            @Parameter(description = "Task ID") @PathVariable UUID id, 
            @RequestHeader("X-User-Id") UUID userId) {
        userService.getUserById(userId); // Validate user exists
        return ResponseEntity.ok(taskService.getTaskDetail(id, userId));
    }


    @GetMapping
    @Operation(
            summary = "Get list of tasks",
            description = "Retrieve a list of tasks with sorting options"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tasks retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<TaskSummary>> listTasks(
            @RequestHeader("X-User-Id") UUID userId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort criteria (e.g., 'createdAt,desc')") @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        userService.getUserById(userId); // Validate user exists
        // call the service to fetch List<Task>
        List<Task> result = taskService.listTasks(userId);

        List<TaskSummary> taskSummaries = result.stream()
                .map(com.todo.api.mapper.TaskMapper::toTaskSummary)
                .toList();

        return ResponseEntity.ok().body(taskSummaries);
    }

    @GetMapping("/id/{id}")
    @Operation(
        summary = "Get task by ID",
        description = "Retrieve basic task information by ID"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Task retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Task not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public TaskSummary getTaskById(
            @Parameter(description = "Task ID") @PathVariable UUID id, 
            @RequestHeader("X-User-Id") UUID userId) {
        userService.getUserById(userId); // Validate user exists
        Task task = taskService.getTaskById(id, userId);
        return com.todo.api.mapper.TaskMapper.toTaskSummary(task);
    }

    @PostMapping
    @Operation(
        summary = "Create new task",
        description = "Create a new todo task or subtask"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Task created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid task data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<TaskSummary> createTask(
            @Validated @RequestBody CreateTaskRequest req, 
            @RequestHeader("X-User-Id") UUID userId) {
        userService.getUserById(userId); // Validate user exists
        Task saved = taskService.createTask(req.getTitle(), req.getDescription(), userId, req.getParentTaskId());

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/id/{id}")
                .buildAndExpand(saved.getId())
                .toUri();

        TaskSummary taskSummary = com.todo.api.mapper.TaskMapper.toTaskSummary(saved);
        return ResponseEntity.created(location).body(taskSummary);
    }

    @PutMapping("/id/{id}")
    @Operation(
        summary = "Update task",
        description = "Update an existing task (only non-null fields will be updated)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Task updated successfully"),
        @ApiResponse(responseCode = "404", description = "Task not found"),
        @ApiResponse(responseCode = "400", description = "Invalid task data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public TaskSummary updateTask(
            @Parameter(description = "Task ID") @PathVariable UUID id, 
            @Validated @RequestBody UpdateTaskRequest req, 
            @RequestHeader("X-User-Id") UUID userId) {
        userService.getUserById(userId); // Validate user exists
        Task updated = taskService.updateTask(id, req.getTitle(), req.getDescription(), req.getIsCompleted(), userId);
        return com.todo.api.mapper.TaskMapper.toTaskSummary(updated);
    }

    @PatchMapping("/id/{id}/complete")
    @Operation(
        summary = "Set task completion status",
        description = "Mark a task as completed or incomplete"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Task completion status updated"),
        @ApiResponse(responseCode = "404", description = "Task not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public TaskSummary setCompleted(
            @Parameter(description = "Task ID") @PathVariable UUID id, 
            @Parameter(description = "Completion status") @RequestParam("value") boolean value, 
            @RequestHeader("X-User-Id") UUID userId) {
        userService.getUserById(userId); // Validate user exists
        Task updated = taskService.setCompleted(id, value, userId);
        return com.todo.api.mapper.TaskMapper.toTaskSummary(updated);
    }


    @DeleteMapping("/id/{id}")
    @Operation(
        summary = "Delete task",
        description = "Soft delete a task (marks as deleted but preserves data)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Task deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Task not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> deleteTask(
            @Parameter(description = "Task ID") @PathVariable UUID id, 
            @RequestHeader("X-User-Id") UUID userId) {
        userService.getUserById(userId); // Validate user exists
        taskService.deleteTask(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping({"/mock", "/mock/"})
    @Operation(
        summary = "Create mock task",
        description = "Create a sample task for testing purposes"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Mock task created successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public TaskSummary insertMock(@RequestHeader("X-User-Id") UUID userId) {
        userService.getUserById(userId); // Validate user exists
        Task mockTask = taskService.insertMock(userId);
        return com.todo.api.mapper.TaskMapper.toTaskSummary(mockTask);
    }

    @GetMapping({"/listalltasks"})
    @Operation(
        summary = "Get all tasks",
        description = "Retrieve all tasks including deleted ones"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "All tasks retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public List<TaskSummary> listAllTasks(@RequestHeader("X-User-Id") UUID userId) {
        userService.getUserById(userId); // Validate user exists
        List<Task> tasks = taskService.listAllTasks(userId);
        return tasks.stream()
                .map(com.todo.api.mapper.TaskMapper::toTaskSummary)
                .toList();
    }

    @GetMapping("/details")
    @Operation(
        summary = "Get all task details",
        description = "Retrieve detailed information for all tasks including attachments"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Task details retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<TaskDetailInfo>> listAllTaskDetails(@RequestHeader("X-User-Id") UUID userId) {
        userService.getUserById(userId); // Validate user exists
        return ResponseEntity.ok(taskService.listAllTaskDetails(userId));
    }



    // Subtask endpoints
    @GetMapping("/id/{id}/subtasks")
    @Operation(
            summary = "Get direct subtasks of a task",
            description = "Retrieve all direct subtasks of a specific task"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Subtasks retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Parent task not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public List<TaskSummary> getSubtasks(
            @Parameter(description = "Parent task ID") @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {
        userService.getUserById(userId);
        List<Task> subtasks = taskService.getSubtasks(id, userId);
        return subtasks.stream()
                .map(TaskMapper::toTaskSummary)
                .toList();
    }

    @GetMapping("/id/{id}/subtasks/recursive")
    @Operation(
            summary = "Get all subtasks recursively",
            description = "Retrieve all subtasks of a task up to a specified depth"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Subtasks retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Parent task not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public List<TaskSummary> getSubtasksRecursively(
            @Parameter(description = "Parent task ID") @PathVariable UUID id,
            @Parameter(description = "Maximum depth to traverse") @RequestParam(defaultValue = "3") int maxDepth,
            @RequestHeader("X-User-Id") UUID userId) {
        userService.getUserById(userId); // Validate user exists
        List<Task> subtasks = taskService.getSubtasksRecursively(id, userId, maxDepth);
        return subtasks.stream()
                .map(com.todo.api.mapper.TaskMapper::toTaskSummary)
                .toList();
    }

    @GetMapping("/id/{id}/with-subtasks")
    @Operation(
            summary = "Get task with subtasks",
            description = "Retrieve a task with its subtasks organized in a hierarchical structure"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Task with subtasks retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Task not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public TaskSummary getTaskWithSubtasks(
            @Parameter(description = "Task ID") @PathVariable UUID id,
            @Parameter(description = "Maximum depth to traverse") @RequestParam(defaultValue = "3") int maxDepth,
            @RequestHeader("X-User-Id") UUID userId) {
        userService.getUserById(userId); // Validate user exists
        return taskService.getTaskWithSubtasks(id, userId, maxDepth);
    }

    @GetMapping("/root")
    @Operation(
            summary = "Get root tasks",
            description = "Retrieve all root tasks (tasks without parent tasks)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Root tasks retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public List<TaskSummary> getRootTasks(@RequestHeader("X-User-Id") UUID userId) {
        userService.getUserById(userId); // Validate user exists
        List<Task> rootTasks = taskService.getRootTasks(userId);
        return rootTasks.stream()
                .map(com.todo.api.mapper.TaskMapper::toTaskSummary)
                .toList();
    }
}
