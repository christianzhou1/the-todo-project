package com.todo.api.mapper;

import com.todo.api.dto.TaskDetailInfo;
import com.todo.api.dto.TaskSummary;
import com.todo.entity.Task;

import java.util.List;
import java.util.stream.Collectors;

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
                .parentTaskId(t.getParentTask() != null ? t.getParentTask().getId() : null)
                .subtaskCount(t.getSubtasks() != null ? t.getSubtasks().size() : 0)
                .build();
    }

    // converts a Task type to TaskSummary with subtasks recursively
    public static TaskSummary toTaskSummaryWithSubtasks(Task t, int maxDepth) {
        TaskSummary.TaskSummaryBuilder builder = TaskSummary.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .createdAt(t.getCreatedAt())
                .dueDate(t.getDueDate())
                .isCompleted(t.isCompleted())
                .isDeleted(t.isDeleted())
                .parentTaskId(t.getParentTask() != null ? t.getParentTask().getId() : null);

        if (t.getSubtasks() != null && !t.getSubtasks().isEmpty() && maxDepth > 0) {
            List<TaskSummary> subtaskSummaries = t.getSubtasks().stream()
                    .map(subtask -> toTaskSummaryWithSubtasks(subtask, maxDepth - 1))
                    .collect(Collectors.toList());
            builder.subtasks(subtaskSummaries);
            builder.subtaskCount(subtaskSummaries.size());
        } else {
            builder.subtaskCount(t.getSubtasks() != null ? t.getSubtasks().size() : 0);
        }

        return builder.build();
    }
}
