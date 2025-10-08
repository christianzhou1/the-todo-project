import React from "react";
import {
  Box,
  Chip,
  Divider,
  IconButton,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  Delete,
  RadioButtonUnchecked,
  SubdirectoryArrowRight,
} from "@mui/icons-material";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  parentTaskId?: string;
  subtaskCount?: number;
}

interface TaskItemProps {
  task: Task;
  index: number;
  totalTasks: number;
  onToggleCompletion: (taskId: string, currentStatus: boolean) => void;
  onDelete: (taskId: string) => void;
  onCreateSubtask: (parentTaskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  index,
  totalTasks,
  onToggleCompletion,
  onDelete,
  onCreateSubtask,
}) => {
  return (
    <React.Fragment>
      <ListItem
        sx={{
          bgcolor: task.completed ? "action.hover" : "background.paper",
          opacity: task.completed ? 0.7 : 1,
          borderRadius: 1,
          mb: 1,
        }}
        secondaryAction={
          <Box display="flex" gap={1}>
            <IconButton
              onClick={() => onCreateSubtask(task.id)}
              color="primary"
              title="Add Subtask"
            >
              <SubdirectoryArrowRight />
            </IconButton>
            <IconButton
              onClick={() => onToggleCompletion(task.id, task.completed)}
              color={task.completed ? "warning" : "success"}
            >
              {task.completed ? <RadioButtonUnchecked /> : <CheckCircle />}
            </IconButton>
            <IconButton onClick={() => onDelete(task.id)} color="error">
              <Delete />
            </IconButton>
          </Box>
        }
      >
        <ListItemText
          primary={
            <Typography
              variant="h6"
              component="span"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              {task.title}
              {task.completed && (
                <Chip label="Completed" color="success" size="small" />
              )}
              {} subtask count: {task.subtaskCount}
              {task.subtaskCount != null && task.subtaskCount > 0 && (
                <Chip
                  label={`${task.subtaskCount} subtask${
                    task.subtaskCount > 1 ? "s" : ""
                  }`}
                  color="info"
                  size="small"
                  variant="outlined"
                />
              )}
            </Typography>
          }
          secondary={
            <>
              <Typography
                variant="body2"
                color="text.secondary"
                component="span"
                sx={{ mb: 1 }}
              >
                {task.description}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                component="span"
              >
                Created: {new Date(task.createdAt).toLocaleDateString()}{" "}
                {new Date(task.createdAt).toLocaleTimeString()}
                {" • "}
                Updated: {new Date(task.updatedAt).toLocaleDateString()}{" "}
                {new Date(task.updatedAt).toLocaleTimeString()}
              </Typography>
            </>
          }
        />
      </ListItem>
      {index < totalTasks - 1 && <Divider />}
    </React.Fragment>
  );
};

export default TaskItem;
