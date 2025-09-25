package com.todo.service;

import com.todo.api.dto.AttachmentInfo;
import com.todo.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface AttachmentService {
    AttachmentInfo uploadUnlinked(MultipartFile file, UUID userId) throws IOException;
    AttachmentInfo uploadAndAttach(UUID taskId, MultipartFile file, UUID userId) throws IOException;

    List<AttachmentInfo> listByTask(UUID taskId, UUID userId);

    AttachmentInfo attach(UUID attachmentId, UUID taskId, UUID userId);
    AttachmentInfo detach(UUID attachmentId, UUID userId);

    void delete(UUID attachmentId, UUID userId);

    byte[] loadBytes(UUID attachmentId, UUID userId) throws IOException;

    AttachmentInfo getInfo(UUID attachmentId, UUID userId);
}
