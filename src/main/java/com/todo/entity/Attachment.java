package com.todo.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "attachment")
@Getter
@Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Attachment {

    @Id
    @GeneratedValue @UuidGenerator
    private UUID id;

    @JoinColumn(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 255)
    private String filename; // original client filename

    @Column(name = "content_type", nullable = false, length = 255)
    private String contentType;

    @Column(name = "size_bytes", nullable = false, length = 255)
    private long sizeBytes;

    @Column(name = "checksum_sha256", nullable = false, length=64)
    private String checksumSha256;

    @Column(name = "storage_path", nullable = false)
    private String storagePath; // provider key (local = absolute file path)

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    @OneToMany(mappedBy = "attachment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<TaskAttachment> taskAttachments = new ArrayList<>();
}
