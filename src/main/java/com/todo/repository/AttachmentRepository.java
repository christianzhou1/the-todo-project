package com.todo.repository;

import com.todo.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {
    // User-specific queries
    List<Attachment> findByUserId(UUID userId);
}
