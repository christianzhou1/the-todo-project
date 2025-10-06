package com.todo.repository;

import com.todo.entity.Task;
import com.todo.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    // general queries
    List<Task> findAllByIsDeletedFalseOrderByCreatedAtDesc();
    Optional<Task> findByIdAndIsDeletedFalse(UUID id);
    Page<Task> findAllByIsDeletedFalse(org.springframework.data.domain.Pageable pageable);
    List<Task> findByIsDeletedFalse();

    // User-specific queries
    List<Task> findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID userId);
    Optional<Task> findByIdAndUserIdAndIsDeletedFalse(UUID id, UUID userId);
    Page<Task> findByUserIdAndIsDeletedFalse(UUID userId, org.springframework.data.domain.Pageable pageable);
    List<Task> findByUserIdAndIsDeletedFalse(UUID userId);
    List<Task> findByUserId(UUID userId);
    
    // User entity-based queries
    List<Task> findByUserAndIsDeletedFalseOrderByCreatedAtDesc(User user);
    Optional<Task> findByIdAndUserAndIsDeletedFalse(UUID id, User user);
    Page<Task> findByUserAndIsDeletedFalse(User user, org.springframework.data.domain.Pageable pageable);
    List<Task> findByUserAndIsDeletedFalse(User user);
    List<Task> findByUser(User user);


}
