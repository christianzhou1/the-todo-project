package com.todo.service.impl;

import com.todo.api.dto.AttachmentInfo;
import com.todo.api.mapper.AttachmentMapper;
import com.todo.entity.Attachment;
import com.todo.entity.Task;
import com.todo.entity.TaskAttachment;
import com.todo.entity.User;
import com.todo.repository.AttachmentRepository;
import com.todo.repository.TaskAttachmentRepository;
import com.todo.repository.TaskRepository;
import com.todo.repository.UserRepository;
import com.todo.service.AttachmentService;
import com.todo.storage.BlobStorage;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.service.spi.ServiceException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class AttachmentServiceImpl implements AttachmentService {

    private final AttachmentRepository attachmentRepo;
    private final TaskRepository taskRepo;
    private final TaskAttachmentRepository taskAttachmentRepo;
    private final UserRepository userRepository;
    private final BlobStorage blobStorage;

    @Override
    public AttachmentInfo uploadUnlinked(MultipartFile file, UUID userId) throws IOException {
        try {
            var stored = blobStorage.store(file.getInputStream(),
                    file.getOriginalFilename(), file.getContentType(), file.getSize());

            Attachment a = Attachment.builder()
                    .userId(userId)
                    .filename(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file")
                    .contentType(stored.getContentType())
                    .sizeBytes(stored.getSize())
                    .checksumSha256(stored.getChecksumSha256())
                    .storagePath(stored.getKey())
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();

            a = attachmentRepo.save(a);
            return AttachmentMapper.toInfo(a);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("uploadUnlinked failed", e);
            throw new ServiceException("Uncaught error");
        }
    }


    @Override
    public AttachmentInfo uploadAndAttach(UUID taskId, MultipartFile file, UUID userId) throws IOException {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            
            Task task = taskRepo.findByIdAndUserAndIsDeletedFalse(taskId, user)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

            var stored = blobStorage.store(file.getInputStream(),
                    file.getOriginalFilename(), file.getContentType(), file.getSize());

            Attachment a = Attachment.builder()
                    .userId(userId)
                    .filename(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file")
                    .contentType(stored.getContentType())
                    .sizeBytes(stored.getSize())
                    .checksumSha256(stored.getChecksumSha256())
                    .storagePath(stored.getKey())
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();
            a = attachmentRepo.save(a);
            
            // Create many-to-many relationship
            TaskAttachment taskAttachment = TaskAttachment.builder()
                    .task(task)
                    .attachment(a)
                    .build();
            taskAttachmentRepo.save(taskAttachment);
            
            return AttachmentMapper.toInfo(a);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("uploadAndAttach failed (taskId={})", taskId, e);
            throw new ServiceException("Unexpected error");
        }
    }


    @Override
    @Transactional(Transactional.TxType.SUPPORTS)
    public List<AttachmentInfo> listByTask(UUID taskId, UUID userId) {
        return taskAttachmentRepo.findByTaskId(taskId).stream()
                .map(TaskAttachment::getAttachment)
                .filter(attachment -> attachment.getUserId().equals(userId))
                .map(AttachmentMapper::toInfo)
                .toList();
    }


    @Override
    public AttachmentInfo attach(UUID attachmentId, UUID taskId, UUID userId) {
        try {
            Attachment a = attachmentRepo.findById(attachmentId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found"));

            // Verify attachment belongs to user
            if (!a.getUserId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Attachment does not belong to user");
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            
            Task t = taskRepo.findByIdAndUserAndIsDeletedFalse(taskId, user)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

            // Check if relationship already exists
            TaskAttachment existing = taskAttachmentRepo.findByTaskIdAndAttachmentId(taskId, attachmentId);
            if (existing != null) {
                return AttachmentMapper.toInfo(a); // Already linked
            }
            
            // Create many-to-many relationship
            TaskAttachment taskAttachment = TaskAttachment.builder()
                    .task(t)
                    .attachment(a)
                    .build();
            taskAttachmentRepo.save(taskAttachment);
            
            return AttachmentMapper.toInfo(a);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("attach failed (attachmentId={}, taskId={})", attachmentId, taskId, e);
            throw new ServiceException("Unexpected error");
        }
    }


    @Override
    public AttachmentInfo detach(UUID attachmentId, UUID userId) {
        try {
            Attachment a = attachmentRepo.findById(attachmentId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found"));

            // Verify attachment belongs to user
            if (!a.getUserId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Attachment does not belong to user");
            }
            
            // Remove all task relationships for this attachment
            taskAttachmentRepo.deleteByAttachmentId(attachmentId);
            
            return AttachmentMapper.toInfo(a);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("detach failed (attachmentId={})", attachmentId, e);
            throw new ServiceException("Unexpected error");
        }
    }


    @Override
    public void delete(UUID attachmentId, UUID userId) {
        try {
            Attachment a = attachmentRepo.findById(attachmentId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found"));

            // Verify attachment belongs to user
            if (!a.getUserId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Attachment does not belong to user");
            }

            // Remove all task relationships first
            taskAttachmentRepo.deleteByAttachmentId(attachmentId);
            
            try {
                blobStorage.delete(a.getStoragePath());
            } catch (IOException io) {
                log.warn("Failed to delete underlying blob for {}", attachmentId, io);
            }
            attachmentRepo.delete(a);
        } catch (ResponseStatusException e) {
            throw e;
        }  catch (Exception e) {
            log.error("delete failed (attachmentId={})", attachmentId, e);
            throw new ServiceException("Unexpected error");
        }
    }


    @Override
    @Transactional(Transactional.TxType.SUPPORTS)
    public byte[] loadBytes(UUID attachmentId, UUID userId) throws IOException {
        Attachment a = attachmentRepo.findById(attachmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found"));

        // Verify attachment belongs to user
        if (!a.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Attachment does not belong to user");
        }

        return blobStorage.load(a.getStoragePath());
    }

    @Override
    @Transactional(Transactional.TxType.SUPPORTS)
    public AttachmentInfo getInfo(UUID attachmentId, UUID userId) {
        Attachment a = attachmentRepo.findById(attachmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found"));

        // Verify attachment belongs to user
        if (!a.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Attachment does not belong to user");
        }

        return AttachmentMapper.toInfo(a);
    }
}
