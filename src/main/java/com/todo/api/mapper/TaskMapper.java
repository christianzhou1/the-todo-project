package com.todo.api.mapper;

import com.todo.api.dto.TaskDetailInfo;
import com.todo.api.dto.TaskSummary;
import com.todo.entity.Task;

public final class TaskMapper {
    private TaskMapper() {}

    // converts a Task type to TaskDetailInfo type, built with base attributes from the Task type
    public static TaskDetailInfo toTaskDetailBase(Task t) {
        return TaskDetailInfo.builder()
                .id(t.getId())
                .title(t.getTitle() != null ? t.getTitle() : "No Title")
                .description(t.getDescription() != null ? t.getDescription(): "No Description")
                .createdAt(t.getCreatedAt())
                .dueDate(t.getDueDate())
                .isCompleted(t.isCompleted())
                .isDeleted(t.isDeleted())
                .build();
    }

    // converts a Task type to TaskSummary type for lightweight task listings
    public static TaskSummary toTaskSummary(Task t) {
        return TaskSummary.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .createdAt(t.getCreatedAt())
                .dueDate(t.getDueDate())
                .isCompleted(t.isCompleted())
                .isDeleted(t.isDeleted())
                .build();
    }
}
