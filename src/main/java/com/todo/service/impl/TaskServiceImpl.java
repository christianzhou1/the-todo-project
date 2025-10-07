package com.todo.service.impl;

import com.todo.api.dto.TaskDetailInfo;
import com.todo.api.dto.TaskSummary;
import com.todo.api.mapper.AttachmentMapper;
import com.todo.api.mapper.TaskMapper;
import com.todo.entity.Attachment;
import com.todo.entity.Task;
import com.todo.entity.TaskAttachment;
import com.todo.entity.User;
import com.todo.repository.AttachmentRepository;
import com.todo.repository.TaskAttachmentRepository;
import com.todo.repository.TaskRepository;
import com.todo.repository.UserRepository;
import com.todo.service.TaskService;
import com.todo.util.PaginationUtils;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.service.spi.ServiceException;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository repo;
    private final AttachmentRepository attachmentRepo;
    private final TaskAttachmentRepository taskAttachmentRepo;
    private final UserRepository userRepository;

    private TaskDetailInfo toTaskDetail(Task task) {

        // step 1: transform from Task to TaskDetailInfo with base attributes
        TaskDetailInfo taskDetailInfo = TaskMapper.toTaskDetailBase(task);

        // step 2: enrich with computed fields
        boolean overdue = task.getDueDate() != null
                && Instant.now().isAfter(task.getDueDate())
                && !task.isCompleted();

        Long daysUntilDue = task.getDueDate() != null
                ? ChronoUnit.DAYS.between(Instant.now(), task.getDueDate())
                : null;

        taskDetailInfo.setOverdue(overdue);
        taskDetailInfo.setDaysUntilDue(daysUntilDue);

        // Step 3 (optional): Enrich with related data from other sources
        // dto.setLabels(labelRepository.findNamesByTaskId(id));
        // dto.setComments(
        //     commentRepository.findByTaskId(id).stream()
        //         .map(c -> new TaskDetailInfo.CommentInfo(c.getId(), c.getBody(), c.getCreatedAt(), c.getAuthorName()))
        //         .toList()
        // );
        // If you don't have these yet:
        taskDetailInfo.setCategories(Collections.emptyList());
        taskDetailInfo.setComments(Collections.emptyList());

        var attInfos = taskAttachmentRepo.findByTaskId(task.getId())
                        .stream()
                        .map(ta -> AttachmentMapper.toInfo(ta.getAttachment()))
                        .toList();
        taskDetailInfo.setAttachments(attInfos);

        return taskDetailInfo;

    }

    @Override
    public TaskDetailInfo getTaskDetail(UUID id, UUID userId) {
        try {
            // get base task (entity -> DTO base)
            Task task = repo.findByIdAndUserIdAndIsDeletedFalse(id, userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
            // convert to task detail
            return toTaskDetail(task);
        } catch (Exception e) { // configure specific exceptions later
            log.error("Unexpected error retrieving task {}", id, e);
            throw new ServiceException("Unexpected error");
        }
    }

    @Override
    public List<Task> listTasks(UUID userId) {
        return repo.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId);
    }

    // paginated tasks
    @Override
    public Page<Task> listTasks(UUID userId, int page, int size, String sort) {
        return repo.findByUserIdAndIsDeletedFalse(userId, PaginationUtils.buildPageable(page, size, sort));
    }

    @Override
    public List<Task> listAllTasks(UUID userId) {
        return repo.findByUserId(userId);
    }

//    @Override
//    public Page<Task> listAllTasks(int page, int size, String sort) {
//        return repo.findAll(PaginationUtils.buildPageable(page, size, sort));
//    }


    @Override
    public List<TaskDetailInfo> listAllTaskDetails(UUID userId) {
        try{
            return repo.findByUserIdAndIsDeletedFalse(userId).stream()
                    .map(this::toTaskDetail)
                    .toList();
        } catch (Exception e) {
            log.error("Unexpected error retrieving task details", e);
            throw new ServiceException("Unexpected error");
        }
    }


    @Override
    public Task getTaskById(UUID id, UUID userId) {
        return repo.findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    }

    // if no parent provided, set parentTaskId to null
    @Override
    @Transactional
    public Task createTask(String title, String taskDesc, UUID userId) {
        return createTask(title, taskDesc, userId, null);
    }


    @Override
    @Transactional
    public Task createTask(String title, String taskDesc, UUID userId, UUID parentTaskId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Task t = Task.builder()
                .title(title)
                .description(taskDesc)
                .user(user)
                .createdAt(Instant.now())
                .isCompleted(false)
                .isDeleted(false)
                .build();
        return repo.save(t);
    }

    @Override
    @Transactional
    public Task updateTask(UUID id, String title, String taskDesc, Boolean completed, UUID userId) {
        Task t = getTaskById(id, userId);
        if (title != null) t.setTitle(title);
        if (taskDesc != null) t.setDescription(taskDesc);
        if (completed != null) t.setCompleted(completed);
        return repo.save(t);
    }

    @Override
    @Transactional
    public void deleteTask(UUID id, UUID userId) {
        Task t = repo.findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        if (!t.isDeleted()) {
            t.setDeleted(true);
            repo.save(t);
        }
    }


    @Override
    @Transactional
    public Task setCompleted(UUID id, Boolean completed, UUID userId) {
        Task t = getTaskById(id, userId);
        t.setCompleted(completed);
        return repo.save(t);
    }

    @Override
    @Transactional
    public Task insertMock(UUID userId) {
        return createTask("Mock Task", "Generated by /tasks/mock", userId);
    }


    // Subtask operations
    @Override
    public List<Task> getSubtasks(UUID parentTaskId, UUID userId) {
        return repo.findByParentTaskIdAndUserIdAndIsDeletedFalseOrderByCreatedAtDesc(parentTaskId, userId);
    }

    @Override
    public List<Task> getSubtasksRecursively(UUID parentTaskId, UUID userId, int maxDepth) {
        if (maxDepth <= 0) {
            return Collections.emptyList();
        }
        return repo.findSubtasksRecursively(parentTaskId, userId, maxDepth);
    }

    @Override
    public List<Task> getRootTasks(UUID userId) {
        return repo.findByParentTaskIsNullAndUserIdAndIsDeletedFalse(userId);
    }

    @Override
    public TaskSummary getTaskWithSubtasks(UUID taskId, UUID userId, int maxDepth) {
        Task task = getTaskById(taskId, userId);
        return TaskMapper.toTaskSummaryWithSubtasks(task, maxDepth);
    }

    @Override
    @Transactional
    public void linkAttachmentToTask(UUID taskId, UUID attachmentId, UUID userId) {
        // Verify task belongs to user
        Task task = getTaskById(taskId, userId);
        
        // Verify attachment belongs to user
        Attachment attachment = attachmentRepo.findById(attachmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found"));
        
        if (!attachment.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Attachment does not belong to user");
        }
        
        // Check if relationship already exists
        TaskAttachment existing = taskAttachmentRepo.findByTaskIdAndAttachmentId(taskId, attachmentId);
        if (existing != null) {
            return; // Already linked
        }
        
        // Create new relationship
        TaskAttachment taskAttachment = TaskAttachment.builder()
                .task(task)
                .attachment(attachment)
                .build();
        
        taskAttachmentRepo.save(taskAttachment);
    }

    @Override
    @Transactional
    public void unlinkAttachmentFromTask(UUID taskId, UUID attachmentId, UUID userId) {
        // Verify task belongs to user
        getTaskById(taskId, userId);
        
        // Verify attachment belongs to user
        Attachment attachment = attachmentRepo.findById(attachmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found"));
        
        if (!attachment.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Attachment does not belong to user");
        }
        
        // Remove relationship
        taskAttachmentRepo.deleteByTaskIdAndAttachmentId(taskId, attachmentId);
    }

    @Override
    @Transactional
    public void unlinkAllAttachmentsFromTask(UUID taskId, UUID userId) {
        // Verify task belongs to user
        getTaskById(taskId, userId);
        
        // Remove all relationships for this task
        taskAttachmentRepo.deleteByTaskId(taskId);
    }
}
