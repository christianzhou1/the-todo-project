package com.todo.repository;

import com.todo.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findAllByIsDeletedFalseOrderByCreatedAtDesc();
    Optional<Task> findByIdAndIsDeletedFalse(UUID id);
    Page<Task> findAllByIsDeletedFalse(org.springframework.data.domain.Pageable pageable);
}
