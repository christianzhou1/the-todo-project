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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from "@mui/material";
import { Download, Delete, AttachFile, Upload } from "@mui/icons-material";
import type { AttachmentInfo } from "../generated/api";

const AttachmentList: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentInfo[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const handleUpload = () => {
    setUploadDialogOpen(true);
    setSelectedFile(null);
    setError(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const userId = authService.getUserId();
      if (!userId) {
        setError("User not authenticated");
        return;
      }

      const response = await attachmentService.uploadFile(selectedFile, userId);

      if (response.code === 200) {
        // Refresh the attachment list
        await fetchAttachments();
        setUploadDialogOpen(false);
        setSelectedFile(null);
      } else {
        setError(response.msg);
      }
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadCancel = () => {
    setUploadDialogOpen(false);
    setSelectedFile(null);
    setError(null);
  };

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
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, border: 0 }}>
        <AttachFile sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" component="h2">
          My Attachments ({attachments.length})
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "end",
            px: 3,
            border: 0,
          }}
        >
          <IconButton
            edge="end"
            onClick={handleUpload}
            title="Upload file"
            color="primary"
          >
            <Upload />
          </IconButton>
        </Box>
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
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Size: {formatFileSize(attachment.sizeBytes)} • Created:{" "}
                      {formatDate(attachment.createdAt)}
                    </Typography>
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

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={handleUploadCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload File</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              onChange={handleFileSelect}
              disabled={uploading}
              accept="*/*"
              style={{ width: "100%", padding: "8px", marginBottom: "16px" }}
            />

            {selectedFile && (
              <Box sx={{ mb: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Selected: {selectedFile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Size: {formatFileSize(selectedFile.size)}
                </Typography>
              </Box>
            )}

            {uploading && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Uploading...
                </Typography>
                <LinearProgress />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadCancel} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUploadSubmit}
            disabled={!selectedFile || uploading}
            variant="contained"
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AttachmentList;
