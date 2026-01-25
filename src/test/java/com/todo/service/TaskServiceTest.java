package com.todo.service;

import com.todo.entity.Task;
import com.todo.entity.User;
import com.todo.repository.AttachmentRepository;
import com.todo.repository.TaskAttachmentRepository;
import com.todo.repository.TaskRepository;
import com.todo.repository.UserRepository;
import com.todo.service.impl.TaskServiceImpl;
import com.todo.util.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AttachmentRepository attachmentRepository;

    @Mock
    private TaskAttachmentRepository taskAttachmentRepository;

    @InjectMocks
    private TaskServiceImpl taskService;

    private User testUser;
    private UUID userId;
    private UUID taskId;

    @BeforeEach
    void setUp() {
        testUser = TestDataFactory.createTestUser();
        userId = UUID.randomUUID();
        testUser.setId(userId);
        taskId = UUID.randomUUID();
    }

    @Test
    void shouldCreateTaskSuccessfully() {
        // Given
        String title = "New Task";
        String description = "Task description";
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(taskRepository.findByParentTaskIsNullAndUserIdAndDisplayOrderGreaterThanEqualAndIsDeletedFalseOrderByDisplayOrderAsc(
                eq(userId), eq(1))).thenReturn(List.of());
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task task = invocation.getArgument(0);
            task.setId(taskId);
            return task;
        });

        // When
        Task createdTask = taskService.createTask(title, description, userId);

        // Then
        assertThat(createdTask).isNotNull();
        assertThat(createdTask.getId()).isEqualTo(taskId);
        assertThat(createdTask.getTitle()).isEqualTo(title);
        assertThat(createdTask.getDescription()).isEqualTo(description);
        assertThat(createdTask.getUser()).isEqualTo(testUser);
        assertThat(createdTask.isCompleted()).isFalse();
        assertThat(createdTask.isDeleted()).isFalse();
        assertThat(createdTask.getDisplayOrder()).isEqualTo(1);
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void shouldCreateSubtaskWithParent() {
        // Given
        Task parentTask = TestDataFactory.createTestTask(testUser);
        UUID parentTaskId = UUID.randomUUID();
        parentTask.setId(parentTaskId);
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(taskRepository.findByIdAndUserIdAndIsDeletedFalse(parentTaskId, userId))
                .thenReturn(Optional.of(parentTask));
        when(taskRepository.findMaxDisplayOrderByParentTaskId(parentTaskId, userId)).thenReturn(0);
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task task = invocation.getArgument(0);
            task.setId(taskId);
            return task;
        });

        // When
        Task createdSubtask = taskService.createTask("Subtask", "Subtask description", userId, parentTaskId);

        // Then
        assertThat(createdSubtask).isNotNull();
        assertThat(createdSubtask.getParentTask()).isEqualTo(parentTask);
        assertThat(createdSubtask.getDisplayOrder()).isEqualTo(1);
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void shouldThrowExceptionWhenUserNotFound() {
        // Given
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> taskService.createTask("Title", "Description", userId))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("status")
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void shouldGetTaskById() {
        // Given
        Task task = TestDataFactory.createTestTask(testUser);
        task.setId(taskId);
        when(taskRepository.findByIdAndUserIdAndIsDeletedFalse(taskId, userId))
                .thenReturn(Optional.of(task));

        // When
        Task foundTask = taskService.getTaskById(taskId, userId);

        // Then
        assertThat(foundTask).isNotNull();
        assertThat(foundTask.getId()).isEqualTo(taskId);
        assertThat(foundTask.getTitle()).isEqualTo("Test Task");
    }

    @Test
    void shouldThrowExceptionWhenTaskNotFound() {
        // Given
        when(taskRepository.findByIdAndUserIdAndIsDeletedFalse(taskId, userId))
                .thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> taskService.getTaskById(taskId, userId))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("status")
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void shouldListTasksForUser() {
        // Given
        Task task1 = TestDataFactory.createTestTask(testUser);
        Task task2 = TestDataFactory.createTestTask(testUser, "Task 2", "Description 2");
        List<Task> tasks = List.of(task1, task2);
        when(taskRepository.findByUserIdAndIsDeletedFalseOrderByDisplayOrderAscWithSubtasks(userId))
                .thenReturn(tasks);

        // When
        List<Task> result = taskService.listTasks(userId);

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).containsExactlyInAnyOrder(task1, task2);
    }

    @Test
    void shouldUpdateTask() {
        // Given
        Task task = TestDataFactory.createTestTask(testUser);
        task.setId(taskId);
        when(taskRepository.findByIdAndUserIdAndIsDeletedFalse(taskId, userId))
                .thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenReturn(task);

        // When
        Task updatedTask = taskService.updateTask(taskId, "Updated Title", "Updated Description", true, userId);

        // Then
        assertThat(updatedTask.getTitle()).isEqualTo("Updated Title");
        assertThat(updatedTask.getDescription()).isEqualTo("Updated Description");
        assertThat(updatedTask.isCompleted()).isTrue();
        verify(taskRepository).save(task);
    }

    @Test
    void shouldUpdateTaskWithPartialFields() {
        // Given
        Task task = TestDataFactory.createTestTask(testUser);
        task.setId(taskId);
        when(taskRepository.findByIdAndUserIdAndIsDeletedFalse(taskId, userId))
                .thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenReturn(task);

        // When - only update title
        Task updatedTask = taskService.updateTask(taskId, "New Title", null, null, userId);

        // Then
        assertThat(updatedTask.getTitle()).isEqualTo("New Title");
        verify(taskRepository).save(task);
    }

    @Test
    void shouldDeleteTask() {
        // Given
        Task task = TestDataFactory.createTestTask(testUser);
        task.setId(taskId);
        task.setDeleted(false);
        when(taskRepository.findByIdAndUserIdAndIsDeletedFalse(taskId, userId))
                .thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenReturn(task);

        // When
        taskService.deleteTask(taskId, userId);

        // Then
        assertThat(task.isDeleted()).isTrue();
        verify(taskRepository).save(task);
    }

    @Test
    void shouldSetTaskCompleted() {
        // Given
        Task task = TestDataFactory.createTestTask(testUser);
        task.setId(taskId);
        task.setCompleted(false);
        when(taskRepository.findByIdAndUserIdAndIsDeletedFalse(taskId, userId))
                .thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenReturn(task);

        // When
        Task updatedTask = taskService.setCompleted(taskId, true, userId);

        // Then
        assertThat(updatedTask.isCompleted()).isTrue();
        verify(taskRepository).save(task);
    }

    @Test
    void shouldGetRootTasks() {
        // Given
        Task rootTask = TestDataFactory.createTestTask(testUser);
        List<Task> rootTasks = List.of(rootTask);
        when(taskRepository.findByParentTaskIsNullAndUserIdAndIsDeletedFalse(userId))
                .thenReturn(rootTasks);

        // When
        List<Task> result = taskService.getRootTasks(userId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result).contains(rootTask);
    }

    @Test
    void shouldGetSubtasks() {
        // Given
        UUID parentTaskId = UUID.randomUUID();
        Task subtask = TestDataFactory.createTestTask(testUser);
        List<Task> subtasks = List.of(subtask);
        when(taskRepository.findByParentTaskIdAndUserIdAndIsDeletedFalseOrderByCreatedAtDesc(parentTaskId, userId))
                .thenReturn(subtasks);

        // When
        List<Task> result = taskService.getSubtasks(parentTaskId, userId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result).contains(subtask);
    }
}

