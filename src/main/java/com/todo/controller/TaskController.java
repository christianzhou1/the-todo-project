package com.todo.controller;

import com.todo.entity.Task;
import com.todo.service.TaskService;
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

    // Paged LIST
    @GetMapping
    public ResponseEntity<List<Task>> listTasks(
            // default request parameters
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        // call the service to fetch Page<Task> according to parameters
        Page<Task> result = taskService.listTasks(page, size, sort);

        HttpHeaders headers = PaginationUtils.buildPaginatedHeaders(result, sort);
        return ResponseEntity.ok().headers(headers).body(result.getContent());
    }

    // GET by id (404 if deleted or not found)
    @GetMapping("/{id}")
    public Task getTaskById(@PathVariable UUID id) {
        return taskService.getTaskById(id);
    }

    // CREATE
    @PostMapping
    public ResponseEntity<Task> createTask(@Validated @RequestBody CreateTaskRequest req) {
        Task saved = taskService.createTask(req.getTitle(), req.getDescription());

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.getId())
                .toUri();

        return ResponseEntity.created(location).body(saved);
    }

    // UPDATE (idempotent PUT; only apply non-null fields)
    @PutMapping("/{id}")
    public Task updateTask(@PathVariable UUID id, @Validated @RequestBody UpdateTaskRequest req) {
        return taskService.updateTask(id, req.getTitle(), req.getDescription(), req.getIsCompleted());
    }

    // PATCH completion: /tasks/{id}/complete?value=true|false
    @PatchMapping("/{id}/complete")
    public Task setCompleted(@PathVariable UUID id, @RequestParam("value") boolean value) {
        return taskService.setCompleted(id, value);
    }


    // SOFT DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    // Insert a mock task
    @PostMapping({"/mock", "/mock/"})
    public Task insertMock() {
        return taskService.insertMock();
    }

    // Get all tasks (deleted and non deleted)
    @GetMapping({"/listalltasks"})
    public List<Task> listAllTasks() {
        return taskService.listAllTasks();
    }
}
