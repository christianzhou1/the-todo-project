package com.todo.web.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jdk.jfr.BooleanFlag;
import lombok.Data;

import java.time.Instant;

@Data
public class UpdateTaskRequest {
    @Size(max = 120, message = "title must be <= 120 characters")
    private String title;

    @Size(max = 2000, message = "description must be <= 2000 chars")
    private String description;

    @FutureOrPresent(message = "dueDate cannot be in the past")
    private Instant dueDate;

    @BooleanFlag
    private Boolean isCompleted;
}