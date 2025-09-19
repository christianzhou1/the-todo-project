package com.todo.controller;

import com.todo.entity.Task;
import com.todo.repository.TaskRepository;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/tasks")
public class TaskController {
    private final TaskRepository repo;

    public TaskController(TaskRepository repo) {
        this.repo = repo;
    }

    @PostMapping({"/mock", "/mock/"})
    public Task insertMock() {
        Task t = new Task();
        t.setTitle("Mock Task");
        t.setCompleted(false);
        t.setCreatedAt(Instant.now());
        Task saved = repo.save(t);
        System.out.println("[TaskController] Inserted: " + saved);
        return saved;
    }

    @GetMapping({"", "/"})
    public List<Task> all() {
        List<Task> list = repo.findAll();
        System.out.println("[TaskController] Read " + list.size() + " tasks: " + list);
        return list;
    }
}
