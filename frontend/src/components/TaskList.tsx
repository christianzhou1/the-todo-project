import React, { useState, useEffect } from "react";
import { taskService, authService } from "../services";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import {
  AddTask,
  CheckCircle,
  Delete,
  RadioButtonUnchecked,
  Refresh,
  SubdirectoryArrowRight,
} from "@mui/icons-material";
import { Tree } from "react-arborist";

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

interface TreeNode {
  id: string;
  name: string; // task title
  children?: TreeNode[];
  task: Task; // references the original task
}

const buildTreeData = (flatTasks: Task[]): TreeNode[] => {
  const taskMap = new Map<string, TreeNode>(); // map each task's tree node to its id
  const rootNodes: TreeNode[] = [];

  // create a node for each task and map to the task id
  flatTasks.forEach((task) => {
    const node: TreeNode = {
      id: task.id,
      name: task.title,
      task: task,
      children: [], // leave children empty in first pass
    };

    // map this task tree node to its id
    taskMap.set(task.id, node);
  });

  // build hierarchy
  flatTasks.forEach((task) => {
    // get current task's tree node
    const node = taskMap.get(task.id);

    // if task has parent: push its node into its parent's children array
    if (task.parentTaskId) {
      const parent = taskMap.get(task.parentTaskId);
      if (parent && node) {
        parent.children!.push(node);
      }
    } else if (parent && node) {
      // if task doesn't have parent: push task into the root node
      rootNodes.push(node);
    }
  });

  console.log(rootNodes);

  return rootNodes;
};

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  // Tree data structure for React Arborist
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  // Selection state (optional - React Arborist can manage this)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // state variables for create task
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = authService.getUserId();
      if (!userId) {
        setError("User not authenticated");
        return;
      }

      const response = await taskService.listTasks(userId);

      if (response.code === 200 && response.data) {
        setTasks(response.data);
      } else {
        setError(response.msg);
      }
    } catch (err) {
      setError("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (
    taskId: string,
    currentStatus: boolean
  ) => {
    try {
      const userId = authService.getUserId();
      if (!userId) return;

      const response = await taskService.setTaskCompleted(
        taskId,
        !currentStatus,
        userId
      );

      if (response.code === 200) {
        // Update local state
        setTasks(
          tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !currentStatus } : task
          )
        );
      } else {
        setError(response.msg);
      }
    } catch (err) {
      setError("Failed to update task");
    }
  };

  const createTask = async () => {
    if (!newTaskTitle.trim()) {
      setError("Task title is required");
      return;
    }
    setIsCreating(true);
    setError(null);

    try {
      const userId = authService.getUserId();
      if (!userId) {
        setError("User not authenticated");
        return;
      }

      const response = await taskService.createTask(
        newTaskTitle.trim(),
        newTaskDescription.trim(),
        userId,
        parentTaskId || undefined
      );

      if (response.code === 200 && response.data) {
        //add new task to existing task array
        setTasks((prevTasks) => {
          const newTasks = [response.data, ...prevTasks];

          // If this is a subtask, increment parent's subtask count
          if (parentTaskId) {
            return newTasks.map((task) =>
              task.id === parentTaskId
                ? { ...task, subtaskCount: (task.subtaskCount || 0) + 1 }
                : task
            );
          }

          return newTasks;
        });

        //reset form
        setNewTaskTitle("");
        setNewTaskDescription("");
        setNewTaskDueDate("");
        setParentTaskId(null);
        setShowCreateForm(false);
      } else {
        setError(response.msg);
      }
    } catch (err) {
      setError("Failed to create task");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const userId = authService.getUserId();
      if (!userId) return;

      const response = await taskService.deleteTask(taskId, userId);

      if (response.code === 200) {
        // Remove from local state
        setTasks(tasks.filter((task) => task.id !== taskId));
      } else {
        setError(response.msg);
      }
    } catch (err) {
      setError("Failed to delete task");
    }
  };

  const openCreateSubtaskForm = (parentTaskId: string) => {
    setParentTaskId(parentTaskId);
    setShowCreateForm(true);
  };

  const openCreateTaskForm = () => {
    setParentTaskId(null);
    setShowCreateForm(true);
  };

  const closeCreateForm = () => {
    setShowCreateForm(false);
    setParentTaskId(null);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskDueDate("");
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const tree = buildTreeData(tasks);
    setTreeData(tree);
  }, [tasks]);

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
          <Button onClick={fetchTasks} color="inherit" size="small">
            Retry
          </Button>
        }
      >
        Error: {error}
      </Alert>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h2">
          My Tasks
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddTask />}
            onClick={openCreateTaskForm}
          >
            Create Task
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchTasks}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {tasks.length === 0 ? (
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          py={4}
        >
          No tasks found. Create your first task!
        </Typography>
      ) : (
        <>
          <Tree data={treeData}></Tree>
          <List>
            {tasks.map((task, index) => (
              <React.Fragment key={task.id}>
                <ListItem
                  sx={{
                    bgcolor: task.completed
                      ? "action.hover"
                      : "background.paper",
                    opacity: task.completed ? 0.7 : 1,
                    borderRadius: 1,
                    mb: 1,
                  }}
                  secondaryAction={
                    <Box display="flex" gap={1}>
                      <IconButton
                        onClick={() => openCreateSubtaskForm(task.id)}
                        color="primary"
                        title="Add Subtask"
                      >
                        <SubdirectoryArrowRight />
                      </IconButton>
                      <IconButton
                        onClick={() =>
                          toggleTaskCompletion(task.id, task.completed)
                        }
                        color={task.completed ? "warning" : "success"}
                      >
                        {task.completed ? (
                          <RadioButtonUnchecked />
                        ) : (
                          <CheckCircle />
                        )}
                      </IconButton>
                      <IconButton
                        onClick={() => deleteTask(task.id)}
                        color="error"
                      >
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
                          <Chip
                            label="Completed"
                            color="success"
                            size="small"
                          />
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
                          Created:{" "}
                          {new Date(task.createdAt).toLocaleDateString()}{" "}
                          {new Date(task.createdAt).toLocaleTimeString()}
                          {" • "}
                          Updated:{" "}
                          {new Date(task.updatedAt).toLocaleDateString()}{" "}
                          {new Date(task.updatedAt).toLocaleTimeString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < tasks.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </>
      )}

      {/* Create Task Dialog */}
      <Dialog
        open={showCreateForm}
        onClose={closeCreateForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {parentTaskId ? "Create New Subtask" : "Create New Task"}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Task Title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              fullWidth
              required
              variant="outlined"
            />
            <TextField
              label="Task Description (Optional)"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreateForm}>Cancel</Button>
          <Button
            onClick={createTask}
            variant="contained"
            disabled={isCreating || !newTaskTitle.trim()}
            startIcon={
              isCreating ? <CircularProgress size={20} /> : <AddTask />
            }
          >
            {isCreating
              ? "Creating..."
              : parentTaskId
              ? "Create Subtask"
              : "Create Task"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TaskList;
