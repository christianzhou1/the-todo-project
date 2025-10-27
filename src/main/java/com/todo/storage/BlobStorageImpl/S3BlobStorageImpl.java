package com.todo.storage.BlobStorageImpl;

import com.todo.storage.BlobStorage;
import io.awspring.cloud.s3.ObjectMetadata;
import io.awspring.cloud.s3.S3Template;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.storage.type", havingValue = "s3")
public class S3BlobStorageImpl implements BlobStorage {

    private final S3Template s3;

    @Value("${app.storage.s3.bucket}")
    private String bucket;

    @Value("${app.storage.s3.prefix}")
    private String prefix;


    private static String sha256(byte[] bytes) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(bytes));
        } catch (Exception e) {
            throw new RuntimeException("Unable to compute checksum", e);
        }
    }
    private String buildKey(String originalName) {
        // Extract extension, fallback "bin"
        String ext = (originalName != null && originalName.contains("."))
                ? originalName.substring(originalName.lastIndexOf(".") + 1)
                : "bin";

        String fname = UUID.randomUUID() + (ext.isEmpty() ? "" : ("." + ext));

        // Apply prefix if set
        return (prefix == null || prefix.isBlank()) ? fname : prefix + "/" + fname;
    }

    @Override
    public StoredObject store(InputStream in, String originalName, String contentType, long size) throws IOException {
        byte[] bytes = in.readAllBytes();

        String key = buildKey(originalName);

        String ct = (contentType != null ? contentType : MediaType.APPLICATION_OCTET_STREAM_VALUE);

        ObjectMetadata metadata = ObjectMetadata.builder()
                .contentType(ct)
                .contentLength((long)  bytes.length)
                .metadata("sha256", sha256(bytes))
                .build();

        s3.upload(bucket, key, new ByteArrayInputStream(bytes), metadata);

        return new StoredObject(key, ct, bytes.length, sha256(bytes));
    }

    @Override
    public byte[] load(String key) throws IOException {
        try (InputStream in = s3.download(bucket, key).getInputStream()) {
            return in.readAllBytes();
        }
    }

    @Override
    public void delete(String key) throws IOException {
        s3.deleteObject(bucket, key);
    }

}
