package com.todo.controller;

import com.todo.api.dto.AttachmentInfo;
import com.todo.service.AttachmentService;
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

    /** upload without linking to a task
     *
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AttachmentInfo> upload(@RequestPart("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(attachmentService.uploadUnlinked(file));
    }

    /** upload and attach to a task
     *
     */
    @PostMapping(path = "/task/{taskId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AttachmentInfo> uploadForTask(@PathVariable UUID taskId,
                                                        @RequestPart("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(attachmentService.uploadAndAttach(taskId, file));
    }

    /** list all attachments for a task
     *
     */
    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<AttachmentInfo>> listForTask(@PathVariable UUID taskId) {
        return ResponseEntity.ok(attachmentService.listByTask(taskId));
    }


    /** Attach an existing unlinked attachment to a task */
    @PostMapping("/{id}/attach/{taskId}")
    public ResponseEntity<AttachmentInfo> attach(@PathVariable UUID id, @PathVariable UUID taskId) {
        return ResponseEntity.ok(attachmentService.attach(id, taskId));
    }

    /** detach from its task (keeps file and metadata)
     *
     */
    @PostMapping("/{id}/detach")
    public ResponseEntity<AttachmentInfo> detach(@PathVariable UUID id) {
        return ResponseEntity.ok(attachmentService.detach(id));
    }

    /**
     * download bytes
     *
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable UUID id) throws IOException {
        AttachmentInfo info = attachmentService.getInfo(id);
        byte[] bytes = attachmentService.loadBytes(id);
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
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        attachmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
