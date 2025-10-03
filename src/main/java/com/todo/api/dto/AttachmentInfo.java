package com.todo.api.dto;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AttachmentInfo {
    private UUID id;
    private String fileName;
    private String contentType;
    private long sizeBytes;
    private String checksumSha256;
    private Instant createdAt;
    private Instant updatedAt;
}
