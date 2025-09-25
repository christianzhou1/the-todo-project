package com.todo.controller;

import com.todo.api.dto.AttachmentInfo;
import com.todo.entity.User;
import com.todo.service.AttachmentService;
import com.todo.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/attachments")
@RequiredArgsConstructor
public class AttachmentController {
    private final AttachmentService attachmentService;
    private final UserService userService;

    /** upload without linking to a task
     *
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AttachmentInfo> upload(@RequestPart("file") MultipartFile file, @RequestHeader("X-User-Id") UUID userId) throws IOException {
        // User user = userService.getUserById(userId);
        return ResponseEntity.ok(attachmentService.uploadUnlinked(file, userId));
    }

    /** upload and attach to a task
     *
     */
    @PostMapping(path = "/task/{taskId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AttachmentInfo> uploadForTask(@PathVariable UUID taskId,
                                                        @RequestPart("file") MultipartFile file,
                                                        @RequestHeader("X-User-Id") UUID userId) throws IOException {
        return ResponseEntity.ok(attachmentService.uploadAndAttach(taskId, file, userId));
    }

    /** list all attachments for a task
     *
     */
    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<AttachmentInfo>> listForTask(@PathVariable UUID taskId,
                                                           @RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(attachmentService.listByTask(taskId, userId));
    }


    /** Attach an existing unlinked attachment to a task */
    @PostMapping("/{id}/attach/{taskId}")
    public ResponseEntity<AttachmentInfo> attach(@PathVariable UUID id, @PathVariable UUID taskId,
                                               @RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(attachmentService.attach(id, taskId, userId));
    }

    /** detach from its task (keeps file and metadata)
     *
     */
    @PostMapping("/{id}/detach")
    public ResponseEntity<AttachmentInfo> detach(@PathVariable UUID id,
                                               @RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(attachmentService.detach(id, userId));
    }

    /**
     * download bytes
     *
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable UUID id,
                                        @RequestHeader("X-User-Id") UUID userId) throws IOException {
        AttachmentInfo info = attachmentService.getInfo(id, userId);
        byte[] bytes = attachmentService.loadBytes(id, userId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(info.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + info.getFileName() + "\"")
                .contentLength(bytes.length)
                .body(bytes);
    }

    /** delete metadata + underlying file
     *
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id,
                                    @RequestHeader("X-User-Id") UUID userId) {
        attachmentService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }
}
