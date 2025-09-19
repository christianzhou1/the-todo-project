package com.todo.controller;

import com.todo.entity.Task;
import com.todo.service.TaskService;
import com.todo.web.dto.CreateTaskRequest;
import com.todo.web.dto.UpdateTaskRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    public final TaskService taskService;

    // LIST (only non-deleted)
    @GetMapping
    public List<Task> listTasks() {
        return taskService.listTasks();
    }

    // GET by id (404 if deleted or not found)
    @GetMapping("/{id}")
    public Task getTaskById(@PathVariable UUID id) {
        return taskService.getTaskById(id);
    }

    // CREATE
    @PostMapping
    public ResponseEntity<Task> createTask(@Validated @RequestBody CreateTaskRequest req) {
        Task saved = taskService.createTask(req.getTaskName(), req.getTaskDesc());

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.getId())
                .toUri();

        return ResponseEntity.created(location).body(saved);
    }

    // UPDATE (idempotent PUT; only apply non-null fields)
    @PutMapping("/{id}")
    public Task updateTask(@PathVariable UUID id, @Validated @RequestBody UpdateTaskRequest req) {
        return taskService.updateTask(id, req.getTaskName(), req.getTaskDesc(), req.getCompleted());
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

//    // Get all tasks
//    @GetMapping({"", "/"})
//    public List<Task> all() {
//        List<Task> list = repo.findAll();
//        log.info("[TaskController] Read {} tasks", list.size());
//        return list;
//    }
}
