import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Chip,
  Divider,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  CheckCircle,
  RadioButtonUnchecked,
  AccessTime,
  CalendarToday,
  Description,
  AttachFile,
  SubdirectoryArrowRight,
  Link,
  Download,
  Delete,
  Visibility,
  Refresh,
} from "@mui/icons-material";
import type { Task } from "./TaskList";
import type { AttachmentInfo } from "../generated/api";
import AttachToTaskDialog from "./AttachToTaskDialog";
import { attachmentService, authService } from "../services";
import AttachmentPreview from "./AttachmentPreview";

interface TaskDetailProps {
  selectedTask: Task | null;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ selectedTask }) => {
  const [attachDialogOpen, setAttachDialogOpen] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentInfo[]>([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [attachmentsError, setAttachmentsError] = useState<string | null>(null);
  const [previewAttachment, setPreviewAttachment] =
    useState<AttachmentInfo | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const handleAttachDialogClose = () => {
    setAttachDialogOpen(false);
  };

  const handleAttachmentAttached = () => {
    // Refresh the attachment list when a new attachment is added
    if (selectedTask) {
      fetchTaskAttachments(selectedTask.id);
    }
    setAttachDialogOpen(false);
  };

  const fetchTaskAttachments = async (taskId: string) => {
    setAttachmentsLoading(true);
    setAttachmentsError(null);

    try {
      const userId = authService.getUserId();
      if (!userId) {
        setAttachmentsError("User not authenticated");
        return;
      }

      const response = await attachmentService.getTaskAttachments(
        taskId,
        userId
      );

      if (response.code === 200 && response.data && Array.isArray(response.data)) {
        setAttachments(response.data as AttachmentInfo[]);
      } else {
        setAttachmentsError(response.msg);
      }
    } catch {
      setAttachmentsError("Failed to fetch task attachments");
    } finally {
      setAttachmentsLoading(false);
    }
  };

  const handleDownload = async (attachment: AttachmentInfo) => {
    if (!attachment.id || !attachment.fileName) return;

    const userId = authService.getUserId();
    if (!userId) {
      setAttachmentsError("User not authenticated");
      return;
    }

    try {
      const success = await attachmentService.downloadAndSaveFile(
        attachment.id,
        attachment.fileName,
        userId
      );

      if (!success) {
        setAttachmentsError("Failed to download file");
      }
    } catch {
      setAttachmentsError("Failed to download file");
    }
  };

  const handleDelete = async (attachment: AttachmentInfo) => {
    if (!attachment.id) return;

    const userId = authService.getUserId();
    if (!userId) {
      setAttachmentsError("User not authenticated");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${attachment.fileName}"?`
    );

    if (!confirmed) return;

    try {
      const response = await attachmentService.deleteAttachment(
        attachment.id,
        userId
      );

      if (response.code === 200) {
        // Remove the attachment from the list
        setAttachments((prev) =>
          prev.filter((att) => att.id !== attachment.id)
        );
      } else {
        setAttachmentsError(response.msg);
      }
    } catch {
      setAttachmentsError("Failed to delete attachment");
    }
  };

  const handlePreview = (attachment: AttachmentInfo) => {
    setPreviewAttachment(attachment);
    setPreviewOpen(true);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatAttachmentDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString();
  };

  // Fetch attachments when a task is selected
  useEffect(() => {
    if (selectedTask) {
      fetchTaskAttachments(selectedTask.id);
    } else {
      setAttachments([]);
    }
  }, [selectedTask]);

  if (!selectedTask) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 3,
          height: "100%",
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom>
          Task Detail
        </Typography>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Select a task from the list to view its details here.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: isMobile ? 2 : 3,
        height: "100%",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Typography
          variant={isMobile ? "h6" : "h5"}
          component="h2"
          sx={{ flex: 1 }}
        >
          Task Detail
        </Typography>
        <Chip
          icon={
            selectedTask.completed ? <CheckCircle /> : <RadioButtonUnchecked />
          }
          label={selectedTask.completed ? "Completed" : "In Progress"}
          color={selectedTask.completed ? "success" : "default"}
          variant={selectedTask.completed ? "filled" : "outlined"}
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ flex: 1, overflow: "auto" }}>
        {/* Task Title */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant={isMobile ? "h6" : "h6"}
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            {selectedTask.title}
          </Typography>
        </Box>

        {/* Task Description */}
        {selectedTask.description && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Description color="action" />
              <Typography variant="subtitle2" color="text.secondary">
                Description
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ pl: 4 }}>
              {selectedTask.description}
            </Typography>
          </Box>
        )}

        {/* Task Statistics */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Task Information
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {selectedTask.subtaskCount !== undefined &&
              selectedTask.subtaskCount > 0 && (
                <Chip
                  icon={<SubdirectoryArrowRight />}
                  label={`${selectedTask.subtaskCount} subtask${
                    selectedTask.subtaskCount > 1 ? "s" : ""
                  }`}
                  color="info"
                  variant="outlined"
                  size="small"
                />
              )}
            {selectedTask.attachmentCount !== undefined &&
              selectedTask.attachmentCount > 0 && (
                <Chip
                  icon={<AttachFile />}
                  label={`${selectedTask.attachmentCount} attachment${
                    selectedTask.attachmentCount > 1 ? "s" : ""
                  }`}
                  color="info"
                  variant="outlined"
                  size="small"
                />
              )}
            {selectedTask.parentTaskId && (
              <Chip
                label="Subtask"
                color="secondary"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        </Box>

        {/* Attach Files Section */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Attachments
            </Typography>
            <IconButton
              onClick={() =>
                selectedTask && fetchTaskAttachments(selectedTask.id)
              }
              title="Refresh Attachments"
              size="small"
              disabled={attachmentsLoading}
            >
              <Refresh />
            </IconButton>
          </Box>

          {isMobile ? (
            <IconButton
              onClick={() => setAttachDialogOpen(true)}
              title="Attach Existing Files"
              sx={{
                mb: 1,
                minHeight: 44,
                minWidth: 44,
                border: 1,
                borderColor: "divider",
              }}
            >
              <Link />
            </IconButton>
          ) : (
            <Button
              variant="outlined"
              startIcon={<Link />}
              onClick={() => setAttachDialogOpen(true)}
              size="small"
              sx={{ mb: 1 }}
            >
              Attach Existing Files
            </Button>
          )}

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: isMobile ? "0.8rem" : "0.75rem", mb: 1 }}
          >
            Link existing files from your attachment library to this task.
          </Typography>

          {/* Attachments List */}
          {attachmentsError && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {attachmentsError}
            </Alert>
          )}

          {attachmentsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : attachments.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontStyle: "italic",
                textAlign: "center",
                py: 2,
                fontSize: isMobile ? "0.8rem" : "0.75rem",
              }}
            >
              No attachments linked to this task.
            </Typography>
          ) : (
            <List
              sx={{
                maxHeight: 200,
                overflow: "auto",
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              {attachments.map((attachment, index) => (
                <React.Fragment key={attachment.id || index}>
                  <ListItem
                    sx={{
                      px: 1,
                      py: 0.5,
                      flexDirection: isMobile ? "column" : "row",
                      alignItems: isMobile ? "stretch" : "center",
                      "&:hover": {
                        backgroundColor: "action.hover",
                        borderRadius: 0.5,
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <Typography
                            variant={isMobile ? "body2" : "body2"}
                            sx={{
                              fontWeight: 500,
                              flex: 1,
                              minWidth: 0,
                              wordBreak: "break-word",
                            }}
                          >
                            {attachment.fileName || "Unknown file"}
                          </Typography>
                          {attachment.contentType && (
                            <Chip
                              label={attachment.contentType}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: isMobile ? "0.7rem" : "0.7rem" }}
                        >
                          Size: {formatFileSize(attachment.sizeBytes)} •
                          Created: {formatAttachmentDate(attachment.createdAt)}
                        </Typography>
                      }
                    />
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: isMobile ? "center" : "end",
                        px: isMobile ? 0 : 1,
                        py: isMobile ? 0.5 : 0,
                        gap: isMobile ? 0.5 : 0.5,
                      }}
                    >
                      <IconButton
                        edge="end"
                        onClick={() => handlePreview(attachment)}
                        title="Preview file"
                        color="info"
                        size="small"
                        sx={{
                          minHeight: 28,
                          minWidth: 28,
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDownload(attachment)}
                        title="Download file"
                        color="primary"
                        size="small"
                        sx={{
                          minHeight: 28,
                          minWidth: 28,
                        }}
                      >
                        <Download fontSize="small" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDelete(attachment)}
                        title="Delete file"
                        color="error"
                        size="small"
                        sx={{
                          minHeight: 28,
                          minWidth: 28,
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < attachments.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Timestamps */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Timestamps
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <CalendarToday color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Created: {formatDate(selectedTask.createdAt)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTime color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Updated: {formatDate(selectedTask.updatedAt)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Task ID */}
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Task ID
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: "monospace", pl: 2 }}>
            {selectedTask.id}
          </Typography>
        </Box>
      </Box>

      <AttachToTaskDialog
        open={attachDialogOpen}
        onClose={handleAttachDialogClose}
        taskId={selectedTask.id}
        taskTitle={selectedTask.title}
        onAttachmentAttached={handleAttachmentAttached}
      />

      <AttachmentPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        attachment={previewAttachment}
      />
    </Paper>
  );
};

export default TaskDetail;
