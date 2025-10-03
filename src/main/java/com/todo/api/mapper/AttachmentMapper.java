package com.todo.api.mapper;

import com.todo.api.dto.AttachmentInfo;
import com.todo.entity.Attachment;

public final class AttachmentMapper {
    private AttachmentMapper() {}

    public static AttachmentInfo toInfo(Attachment a) {
        return AttachmentInfo.builder()
                .id(a.getId())
                .fileName(a.getFilename())
                .contentType(a.getContentType())
                .sizeBytes(a.getSizeBytes())
                .checksumSha256(a.getChecksumSha256())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}

