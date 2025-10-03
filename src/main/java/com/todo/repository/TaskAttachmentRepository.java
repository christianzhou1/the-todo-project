package com.todo.repository;

import com.todo.entity.TaskAttachment;
import com.todo.entity.TaskAttachmentId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskAttachmentRepository extends JpaRepository<TaskAttachment, TaskAttachmentId> {

    @Query("SELECT ta FROM TaskAttachment ta WHERE ta.task.id = :taskId")
    List<TaskAttachment> findByTaskId(@Param("taskId") UUID taskId);

    @Query("SELECT ta FROM TaskAttachment ta WHERE ta.attachment.id = :attachmentId")
    List<TaskAttachment> findByAttachmentId(@Param("attachmentId") UUID attachmentId);

    @Query("SELECT ta FROM TaskAttachment ta WHERE ta.task.id = :taskId AND ta.attachment.id = :attachmentId")
    TaskAttachment findByTaskIdAndAttachmentId(@Param("taskId") UUID taskId, @Param("attachmentId") UUID attachmentId);

    @Query("DELETE FROM TaskAttachment ta WHERE ta.task.id = :taskId")
    void deleteByTaskId(@Param("taskId") UUID taskId);

    @Query("DELETE FROM TaskAttachment ta WHERE ta.attachment.id = :attachmentId")
    void deleteByAttachmentId(@Param("attachmentId") UUID attachmentId);

    @Query("DELETE FROM TaskAttachment ta WHERE ta.task.id = :taskId AND ta.attachment.id = :attachmentId")
    void deleteByTaskIdAndAttachmentId(@Param("taskId") UUID taskId, @Param("attachmentId") UUID attachmentId);
}
