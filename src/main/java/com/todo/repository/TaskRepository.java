package com.todo.repository;

import com.todo.entity.Task;
import com.todo.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    // Subtask-related queries
    List<Task> findByParentTaskIdAndUserIdAndIsDeletedFalse(UUID parentTaskId, UUID userId);
    List<Task> findByParentTaskIdAndUserIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID parentTaskId, UUID userId);
    List<Task> findByParentTaskIsNullAndUserIdAndIsDeletedFalse(UUID userId);
    List<Task> findByParentTaskIsNullAndUserIdAndIsDeletedFalse(UUID userId);

    // Recursive query to get all subtasks up to a certain depth
    @Query(value = """
        WITH RECURSIVE task_hierarchy AS (
            -- Base case: direct children
            SELECT t.*, 1 as depth
            FROM task t
            WHERE t.parent_task_id = :parentTaskId 
              AND t.user_id = :userId 
              AND t.is_deleted = false
            
            UNION ALL
            
            -- Recursive case: children of children
            SELECT t.*, th.depth + 1
            FROM task t
            INNER JOIN task_hierarchy th ON t.parent_task_id = th.id
            WHERE t.user_id = :userId 
              AND t.is_deleted = false
              AND th.depth < :maxDepth
        )
        SELECT * FROM task_hierarchy
        ORDER BY depth, created_at DESC
        """, nativeQuery = true)
    List<Task> findSubtasksRecursively(@Param("parentTaskId") UUID parentTaskId,
                                       @Param("userId") UUID userId,
                                       @Param("maxDepth") int maxDepth);
}
