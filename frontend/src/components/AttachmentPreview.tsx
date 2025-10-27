import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Toolbar,
  AppBar,
} from "@mui/material";
import {
  Close,
  Download,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  FullscreenExit,
} from "@mui/icons-material";
import { attachmentService, authService } from "../services";
import type { AttachmentInfo } from "../generated/api";

interface AttachmentPreviewProps {
  attachment: AttachmentInfo | null;
  open: boolean;
  onClose: () => void;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachment,
  open,
  onClose,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getFileType = (
    contentType: string | undefined,
    fileName: string | undefined
  ) => {
    if (!contentType && !fileName) return "unknown";

    const type = contentType?.toLowerCase() || "";
    const name = fileName?.toLowerCase() || "";

    if (
      type.includes("image/") ||
      /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/.test(name)
    ) {
      return "image";
    }
    if (
      type.includes("video/") ||
      /\.(mp4|avi|mov|wmv|flv|webm|mkv)$/.test(name)
    ) {
      return "video";
    }
    if (type.includes("audio/") || /\.(mp3|wav|ogg|flac|aac)$/.test(name)) {
      return "audio";
    }
    if (
      type.includes("text/") ||
      /\.(txt|md|json|xml|html|css|js|py|java|cpp|c|h)$/.test(name)
    ) {
      return "text";
    }
    if (type.includes("application/pdf") || /\.pdf$/.test(name)) {
      return "pdf";
    }
    return "unknown";
  };

  const loadPreview = useCallback(async () => {
    if (!attachment?.id) return;

    setLoading(true);
    setError(null);

    try {
      const userId = authService.getUserId();
      if (!userId) {
        setError("User not authenticated");
        return;
      }

      const fileType = getFileType(attachment.contentType, attachment.fileName);

      if (fileType === "text") {
        // For text files, get content as text
        const response = await attachmentService.getFileAsText(
          attachment.id,
          userId
        );
        if (response.code === 200 && response.data) {
          setTextContent(response.data);
        } else {
          setError(response.msg || "Failed to load text content");
        }
      } else {
        // For other files, get as blob
        const response = await attachmentService.downloadFile(
          attachment.id,
          userId
        );
        if (response.code === 200 && response.data) {
          const blob = response.data;
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        } else {
          setError(response.msg || "Failed to load preview");
        }
      }
    } catch {
      setError("Failed to load preview");
    } finally {
      setLoading(false);
    }
  }, [attachment]);

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setTextContent(null);
    setZoom(1);
    setIsFullscreen(false);
    setError(null);
    onClose();
  };

  const handleDownload = async () => {
    if (!attachment?.id || !attachment?.fileName) return;

    const userId = authService.getUserId();
    if (!userId) return;

    try {
      await attachmentService.downloadAndSaveFile(
        attachment.id,
        attachment.fileName,
        userId
      );
    } catch {
      setError("Failed to download file");
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleFullscreen = () => setIsFullscreen((prev) => !prev);

  React.useEffect(() => {
    if (open && attachment) {
      loadPreview();
    }
  }, [open, attachment, loadPreview]);

  const fileType = getFileType(attachment?.contentType, attachment?.fileName);
  const canPreview = ["image", "video", "audio", "text", "pdf"].includes(
    fileType
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={isFullscreen ? false : "md"}
      fullWidth={!isFullscreen}
      fullScreen={isFullscreen}
      PaperProps={{
        sx: {
          backgroundColor: "background.paper",
          minHeight: isFullscreen ? "100vh" : "60vh",
        },
      }}
    >
      <AppBar position="static" sx={{ backgroundColor: "background.paper" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {attachment?.fileName || "Preview"}
          </Typography>

          {canPreview && previewUrl && (
            <>
              <IconButton onClick={handleZoomOut} color="inherit">
                <ZoomOut />
              </IconButton>
              <Typography variant="body2" sx={{ mx: 1 }}>
                {Math.round(zoom * 100)}%
              </Typography>
              <IconButton onClick={handleZoomIn} color="inherit">
                <ZoomIn />
              </IconButton>
              <IconButton onClick={handleFullscreen} color="inherit">
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </>
          )}

          <IconButton onClick={handleDownload} color="inherit">
            <Download />
          </IconButton>
          <IconButton onClick={handleClose} color="inherit">
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>

      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "background.default",
          minHeight: isFullscreen ? "calc(100vh - 64px)" : "400px",
        }}
      >
        {loading && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
          >
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading preview...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ maxWidth: 400 }}>
            {error}
          </Alert>
        )}

        {(previewUrl || textContent) && !loading && !error && (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "auto",
            }}
          >
            {fileType === "image" && (
              <img
                src={previewUrl ?? ""}
                alt={attachment?.fileName ?? "Preview"}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  transform: `scale(${zoom})`,
                  transition: "transform 0.2s ease-in-out",
                }}
              />
            )}

            {fileType === "video" && (
              <video
                src={previewUrl ?? ""}
                controls
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  transform: `scale(${zoom})`,
                  transition: "transform 0.2s ease-in-out",
                }}
              />
            )}

            {fileType === "audio" && (
              <Box sx={{ width: "100%", maxWidth: 400 }}>
                <audio
                  src={previewUrl ?? ""}
                  controls
                  style={{ width: "100%" }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ mt: 2 }}
                >
                  {attachment?.fileName}
                </Typography>
              </Box>
            )}

            {fileType === "text" && textContent && (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  overflow: "auto",
                  p: 2,
                  backgroundColor: "background.paper",
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    fontSize: `${14 * zoom}px`,
                    lineHeight: 1.5,
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {textContent}
                </pre>
              </Box>
            )}

            {fileType === "pdf" && (
              <iframe
                src={previewUrl ?? ""}
                width="100%"
                height="100%"
                style={{
                  border: "none",
                  transform: `scale(${zoom})`,
                  transition: "transform 0.2s ease-in-out",
                }}
              />
            )}

            {fileType === "unknown" && (
              <Box textAlign="center" sx={{ p: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Preview Not Available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This file type cannot be previewed in the browser.
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  File: {attachment?.fileName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type: {attachment?.contentType || "Unknown"}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ backgroundColor: "background.paper" }}>
        <Button onClick={handleDownload} startIcon={<Download />}>
          Download
        </Button>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttachmentPreview;
