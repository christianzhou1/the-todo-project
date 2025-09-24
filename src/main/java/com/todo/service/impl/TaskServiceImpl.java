package com.todo.service.impl;

import com.todo.api.dto.TaskDetailInfo;
import com.todo.api.mapper.AttachmentMapper;
import com.todo.api.mapper.TaskMapper;
import com.todo.entity.Task;
import com.todo.repository.AttachmentRepository;
import com.todo.repository.TaskRepository;
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

        var attInfos = attachmentRepo.findByTask_Id(task.getId())
                        .stream().map(AttachmentMapper::toInfo).toList();
        taskDetailInfo.setAttachments(attInfos);

        return taskDetailInfo;

    }

    @Override
    public TaskDetailInfo getTaskDetail(UUID id) {
        try {
            // get base task (entity -> DTO base)
            Task task = repo.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
            // convert to task detail
            return toTaskDetail(task);
        } catch (Exception e) { // configure specific exceptions later
            log.error("Unexpected error retrieving task {}", id, e);
            throw new ServiceException("Unexpected error");
        }
    }

    @Override
    public List<Task> listTasks() {
        return repo.findAllByIsDeletedFalseOrderByCreatedAtDesc();
    }

    // paginated tasks
    @Override
    public Page<Task> listTasks(int page, int size, String sort) {
        return repo.findAllByIsDeletedFalse(PaginationUtils.buildPageable(page, size, sort));
    }

    @Override
    public List<Task> listAllTasks() {
        return repo.findAll();
    }

//    @Override
//    public Page<Task> listAllTasks(int page, int size, String sort) {
//        return repo.findAll(PaginationUtils.buildPageable(page, size, sort));
//    }


    @Override
    public List<TaskDetailInfo> listAllTaskDetails() {
        try{
            return repo.findByIsDeletedFalse().stream()
                    .map(this::toTaskDetail)
                    .toList();
        } catch (Exception e) {
            log.error("Unexpected error retrieving task details", e);
            throw new ServiceException("Unexpected error");
        }
    }

    @Override
    public Task getTaskById(UUID id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    }

    @Override
    @Transactional
    public Task createTask(String title, String taskDesc) {
        Task t = Task.builder()
                .title(title)
                .description(taskDesc)
                .createdAt(Instant.now())
                .isCompleted(false)
                .isDeleted(false)
                .build();
        return repo.save(t);
    }

    @Override
    @Transactional
    public Task updateTask(UUID id, String title, String taskDesc, Boolean completed) {
        Task t = getTaskById(id);
        if (title != null) t.setTitle(title);
        if (taskDesc != null) t.setDescription(taskDesc);
        if (completed != null) t.setCompleted(completed);
        return repo.save(t);
    }

    @Override
    @Transactional
    public void deleteTask(UUID id) {
        Task t = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        if (!t.isDeleted()) {
            t.setDeleted(true);
            repo.save(t);
        }
    }

    @Override
    @Transactional
    public Task setCompleted(UUID id, Boolean completed) {
        Task t = getTaskById(id);
        t.setCompleted(completed);
        return repo.save(t);
    }

    @Override
    @Transactional
    public Task insertMock() {
        return createTask("Mock Task", "Generated by /tasks/mock");
    }
}
