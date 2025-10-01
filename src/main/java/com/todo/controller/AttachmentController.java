package com.todo.controller;

import com.todo.api.dto.AttachmentInfo;
import com.todo.entity.User;
import com.todo.service.AttachmentService;
import com.todo.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "File Attachments", description = "APIs for managing file attachments to tasks")
@SecurityRequirement(name = "XUserIdHeader")
public class AttachmentController {
    private final AttachmentService attachmentService;
    private final UserService userService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
        summary = "Upload file",
        description = "Upload a file without linking it to a specific task"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "File uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid file or request"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<AttachmentInfo> upload(
            @Parameter(description = "File to upload") @RequestPart("file") MultipartFile file, 
            @RequestHeader("X-User-Id") UUID userId) throws IOException {
        // User user = userService.getUserById(userId);
        return ResponseEntity.ok(attachmentService.uploadUnlinked(file, userId));
    }

    @PostMapping(path = "/task/{taskId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
        summary = "Upload file for task",
        description = "Upload a file and attach it to a specific task"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "File uploaded and attached successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid file or request"),
        @ApiResponse(responseCode = "404", description = "Task not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<AttachmentInfo> uploadForTask(
            @Parameter(description = "Task ID") @PathVariable UUID taskId,
            @Parameter(description = "File to upload") @RequestPart("file") MultipartFile file,
            @RequestHeader("X-User-Id") UUID userId) throws IOException {
        return ResponseEntity.ok(attachmentService.uploadAndAttach(taskId, file, userId));
    }

    @GetMapping("/task/{taskId}")
    @Operation(
        summary = "List task attachments",
        description = "Get all attachments for a specific task"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Attachments retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Task not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<AttachmentInfo>> listForTask(
            @Parameter(description = "Task ID") @PathVariable UUID taskId,
            @RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(attachmentService.listByTask(taskId, userId));
    }


    @PostMapping("/{id}/attach/{taskId}")
    @Operation(
        summary = "Attach file to task",
        description = "Attach an existing unlinked file to a task"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "File attached successfully"),
        @ApiResponse(responseCode = "404", description = "File or task not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<AttachmentInfo> attach(
            @Parameter(description = "Attachment ID") @PathVariable UUID id, 
            @Parameter(description = "Task ID") @PathVariable UUID taskId,
            @RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(attachmentService.attach(id, taskId, userId));
    }

    @PostMapping("/{id}/detach")
    @Operation(
        summary = "Detach file from task",
        description = "Detach a file from its task (keeps file and metadata)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "File detached successfully"),
        @ApiResponse(responseCode = "404", description = "File not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<AttachmentInfo> detach(
            @Parameter(description = "Attachment ID") @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(attachmentService.detach(id, userId));
    }

    @GetMapping("/{id}/download")
    @Operation(
        summary = "Download file",
        description = "Download a file attachment"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "File downloaded successfully", 
                    content = @Content(mediaType = "application/octet-stream")),
        @ApiResponse(responseCode = "404", description = "File not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<byte[]> download(
            @Parameter(description = "Attachment ID") @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) throws IOException {
        AttachmentInfo info = attachmentService.getInfo(id, userId);
        byte[] bytes = attachmentService.loadBytes(id, userId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(info.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + info.getFileName() + "\"")
                .contentLength(bytes.length)
                .body(bytes);
    }

    @DeleteMapping("/{id}")
    @Operation(
        summary = "Delete attachment",
        description = "Delete attachment metadata and underlying file"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Attachment deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Attachment not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> delete(
            @Parameter(description = "Attachment ID") @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {
        attachmentService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }
}
