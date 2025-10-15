import React, { useState, useEffect } from "react";

import { attachmentService, authService } from "../services";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import { Download, Delete, AttachFile } from "@mui/icons-material";
import type { AttachmentInfo } from "../generated/api";

const AttachmentList: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentInfo[]>([]);

  const fetchAttachments = async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = authService.getUserId();
      if (!userId) {
        setError("User not authenticated");
        return;
      }

      const response = await attachmentService.getUserAttachments(userId);

      if (response.code === 200 && response.data) {
        setAttachments(response.data);
      } else {
        setError(response.msg);
      }
    } catch {
      setError("Failed to fetch attachments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, []);

  const handleDownload = async (attachment: AttachmentInfo) => {
    if (!attachment.id || !attachment.fileName) return;

    const userId = authService.getUserId();
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    try {
      const success = await attachmentService.downloadAndSaveFile(
        attachment.id,
        attachment.fileName,
        userId
      );

      if (!success) {
        setError("Failed to download file");
      }
    } catch (error) {
      setError("Failed to download file");
    }
  };

  const handleDelete = async (attachment: AttachmentInfo) => {
    if (!attachment.id) return;

    const userId = authService.getUserId();
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete "${attachment.fileName}"?`
      )
    ) {
      return;
    }

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
        setError(response.msg);
      }
    } catch (error) {
      setError("Failed to delete attachment");
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button onClick={fetchAttachments} color="inherit" size="small">
            Retry
          </Button>
        }
      >
        Error: {error}
      </Alert>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <AttachFile sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" component="h2">
          My Attachments ({attachments.length})
        </Typography>
      </Box>

      {attachments.length === 0 ? (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <AttachFile sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="body1" color="text.secondary" textAlign="center">
            No attachments yet
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ mt: 1 }}
          >
            Upload files to see them here
          </Typography>
        </Box>
      ) : (
        <List sx={{ flex: 1, overflow: "auto" }}>
          {attachments.map((attachment, index) => (
            <React.Fragment key={attachment.id || index}>
              <ListItem
                sx={{
                  px: 0,
                  py: 2,
                  "&:hover": {
                    backgroundColor: "action.hover",
                    borderRadius: 1,
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
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
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Size: {formatFileSize(attachment.sizeBytes)} • Created:{" "}
                        {formatDate(attachment.createdAt)}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      edge="end"
                      onClick={() => handleDownload(attachment)}
                      title="Download file"
                      color="primary"
                    >
                      <Download />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(attachment)}
                      title="Delete file"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
              {index < attachments.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default AttachmentList;
