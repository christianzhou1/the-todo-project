package com.todo.api.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class TaskSummary {
    private UUID id;
    private String title;
    private String description;
    private Instant createdAt;
    private Instant dueDate;
    private boolean isCompleted;
    private boolean isDeleted;
}
