import React, { useState } from "react";
import { Paper, Typography, Box, Chip, Divider, Button } from "@mui/material";
import {
  CheckCircle,
  RadioButtonUnchecked,
  AccessTime,
  CalendarToday,
  Description,
  AttachFile,
  SubdirectoryArrowRight,
  Link,
} from "@mui/icons-material";
import type { Task } from "./TaskList";
import AttachToTaskDialog from "./AttachToTaskDialog";

interface TaskDetailProps {
  selectedTask: Task | null;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ selectedTask }) => {
  const [attachDialogOpen, setAttachDialogOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const handleAttachDialogClose = () => {
    setAttachDialogOpen(false);
  };

  const handleAttachmentAttached = () => {
    // This could trigger a refresh of the task data or attachment list
    // For now, we'll just close the dialog
    setAttachDialogOpen(false);
  };

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
        p: 3,
        height: "100%",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Typography variant="h5" component="h2" sx={{ flex: 1 }}>
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
          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
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
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Attachments
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Link />}
            onClick={() => setAttachDialogOpen(true)}
            size="small"
            sx={{ mb: 1 }}
          >
            Attach Existing Files
          </Button>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "0.75rem" }}
          >
            Link existing files from your attachment library to this task.
          </Typography>
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
    </Paper>
  );
};

export default TaskDetail;
