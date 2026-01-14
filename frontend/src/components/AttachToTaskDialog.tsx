import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Search, AttachFile, CheckCircle, Close } from "@mui/icons-material";
import { attachmentService, authService } from "../services";
import type { AttachmentInfo } from "../generated/api";

interface AttachToTaskDialogProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
  onAttachmentAttached?: () => void;
}

const AttachToTaskDialog: React.FC<AttachToTaskDialogProps> = ({
  open,
  onClose,
  taskId,
  taskTitle,
  onAttachmentAttached,
}) => {
  const [attachments, setAttachments] = useState<AttachmentInfo[]>([]);
  const [filteredAttachments, setFilteredAttachments] = useState<
    AttachmentInfo[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [attaching, setAttaching] = useState<string | null>(null);

  const fetchAttachments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = authService.getUserId();
      if (!userId) {
        setError("User not authenticated");
        return;
      }

      const response = await attachmentService.getUserAttachments(userId);

      if (
        response.code === 200 &&
        response.data &&
        Array.isArray(response.data)
      ) {
        // Filter out attachments that are already linked to this task
        const unlinkedAttachments = (response.data as AttachmentInfo[]).filter(
          (attachment: AttachmentInfo) =>
            !attachment.taskId || attachment.taskId !== taskId
        );
        setAttachments(unlinkedAttachments);
        setFilteredAttachments(unlinkedAttachments);
      } else {
        setError(response.msg || "Failed to fetch attachments");
      }
    } catch {
      setError("Failed to fetch attachments");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const handleAttach = async (attachmentId: string) => {
    setAttaching(attachmentId);
    setError(null);

    try {
      const userId = authService.getUserId();
      if (!userId) {
        setError("User not authenticated");
        return;
      }

      const response = await attachmentService.attachFileToTask(
        attachmentId,
        taskId,
        userId
      );

      if (response.code === 200) {
        // Remove the attached file from the list
        setAttachments((prev) => prev.filter((att) => att.id !== attachmentId));
        setFilteredAttachments((prev) =>
          prev.filter((att) => att.id !== attachmentId)
        );

        // Notify parent component
        if (onAttachmentAttached) {
          onAttachmentAttached();
        }
      } else {
        setError(response.msg || "Failed to attach file");
      }
    } catch {
      setError("Failed to attach file");
    } finally {
      setAttaching(null);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = attachments.filter(
      (attachment) =>
        attachment.fileName?.toLowerCase().includes(term.toLowerCase()) ||
        attachment.contentType?.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredAttachments(filtered);
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

  const getFileTypeIcon = (contentType?: string, fileName?: string) => {
    const type = contentType?.toLowerCase() || "";
    const name = fileName?.toLowerCase() || "";

    if (
      type.includes("image/") ||
      /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/.test(name)
    ) {
      return "🖼️";
    }
    if (
      type.includes("video/") ||
      /\.(mp4|avi|mov|wmv|flv|webm|mkv)$/.test(name)
    ) {
      return "🎥";
    }
    if (type.includes("audio/") || /\.(mp3|wav|ogg|flac|aac)$/.test(name)) {
      return "🎵";
    }
    if (
      type.includes("text/") ||
      /\.(txt|md|json|xml|html|css|js|py|java|cpp|c|h)$/.test(name)
    ) {
      return "📄";
    }
    if (type.includes("application/pdf") || /\.pdf$/.test(name)) {
      return "📋";
    }
    return "📎";
  };

  useEffect(() => {
    if (open) {
      fetchAttachments();
    }
  }, [open, fetchAttachments]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        minHeight: "60vh",
        p: 0,
        m: -3,
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <AttachFile color="primary" />
            <Typography sx={{ wordBreak: "break-word" }} variant="h6">
              Attach Files to "{taskTitle}"
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 0 }}>
          <TextField
            fullWidth
            placeholder="Search attachments..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && filteredAttachments.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography
              sx={{ wordBreak: "break-word" }}
              variant="body1"
              color="text.secondary"
            >
              {searchTerm
                ? "No attachments found matching your search."
                : "No unlinked attachments available."}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, wordBreak: "break-word" }}
            >
              Upload new files to attach them to this task.
            </Typography>
          </Box>
        )}

        {!loading && filteredAttachments.length > 0 && (
          <List sx={{ p: 0, m: -2, mt: 0 }}>
            {filteredAttachments.map((attachment) => (
              <ListItem
                key={attachment.id}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 1,
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography
                        sx={{ wordBreak: "break-word" }}
                        variant="h6"
                        component="span"
                      >
                        {getFileTypeIcon(
                          attachment.contentType,
                          attachment.fileName
                        )}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 500, wordBreak: "break-word" }}
                      >
                        {attachment.fileName || "Unknown file"}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      {attachment.contentType && (
                        <Chip
                          label={attachment.contentType}
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{ mb: 0.5 }}
                        />
                      )}
                      <Typography variant="body2" color="text.secondary">
                        Size: {formatFileSize(attachment.sizeBytes)} • Created:{" "}
                        {formatDate(attachment.createdAt)}
                      </Typography>
                      {attachment.taskId && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5, fontSize: "0.75rem" }}
                        >
                          Currently linked to another task
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <Button
                  variant="contained"
                  startIcon={
                    attaching === attachment.id ? (
                      <CircularProgress size={16} />
                    ) : (
                      <CheckCircle />
                    )
                  }
                  onClick={() => handleAttach(attachment.id!)}
                  disabled={attaching === attachment.id}
                  color="primary"
                  size="small"
                  sx={{ color: "black", minWidth: 90 }}
                >
                  {attaching === attachment.id ? "Attaching..." : "Attach"}
                </Button>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttachToTaskDialog;
