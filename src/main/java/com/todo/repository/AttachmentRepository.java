package com.todo.repository;

import com.todo.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {
    List<Attachment> findByTaskId(UUID taskId);

    // User-specific queries
    List<Attachment> findByUserId(UUID userId);
    List<Attachment> findByUserIdAndTaskId(UUID userId, UUID taskId);
    List<Attachment> findByUserIdAndTask_Id(UUID userId, UUID taskId);
}
