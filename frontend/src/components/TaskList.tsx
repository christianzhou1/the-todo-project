import React, { useState, useEffect } from "react";
import { taskService, authService } from "../services";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
  IconButton,
  Chip,
} from "@mui/material";
import {
  AddTask,
  Refresh,
  Delete,
  CheckCircle,
  RadioButtonUnchecked,
  SubdirectoryArrowRight,
} from "@mui/icons-material";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { useTreeItem } from "@mui/x-tree-view/useTreeItem";
import {
  TreeItemContent,
  TreeItemRoot,
  TreeItemGroupTransition,
  TreeItemIconContainer,
  TreeItemLabel,
} from "@mui/x-tree-view/TreeItem";
import type { TreeItemProps } from "@mui/x-tree-view/TreeItem";
import { TreeItemIcon } from "@mui/x-tree-view/TreeItemIcon";
import { TreeItemProvider } from "@mui/x-tree-view/TreeItemProvider";

// Simple tree data management like the Gmail demo

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  parentTaskId?: string;
  subtaskCount?: number;
  displayOrder?: number;
  attachmentCount?: number;
}

interface MUITreeItem {
  id: string;
  label: string;
  children?: MUITreeItem[];
  task: Task;
}

const buildMUITreeData = (flatTasks: Task[]): MUITreeItem[] => {
  const taskMap = new Map<string, MUITreeItem>();
  const rootNodes: MUITreeItem[] = [];

  // Sort tasks by displayOrder to maintain proper order
  const sortedTasks = [...flatTasks].sort(
    (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
  );

  // Create nodes for all tasks
  sortedTasks.forEach((task) => {
    const node: MUITreeItem = {
      id: task.id,
      label: task.title,
      task: task,
    };
    taskMap.set(task.id, node);
  });

  // Build hierarchy - process root tasks first, then children
  sortedTasks.forEach((task) => {
    const node = taskMap.get(task.id);
    if (!node) return;

    if (task.parentTaskId) {
      // This is a child task
      const parent = taskMap.get(task.parentTaskId);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(node);
      }
    } else {
      // This is a root task
      rootNodes.push(node);
    }
  });

  // Sort children within each parent by displayOrder
  const sortChildren = (nodes: MUITreeItem[]) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        node.children.sort(
          (a, b) => (a.task.displayOrder || 0) - (b.task.displayOrder || 0)
        );
        sortChildren(node.children);
      }
    });
  };

  sortChildren(rootNodes);

  console.log("Built MUI tree with hierarchy:", rootNodes);
  console.log(
    "Sample tree structure:",
    JSON.stringify(rootNodes.slice(0, 2), null, 2)
  );
  return rootNodes;
};

// Helper function to get all parent item IDs that have children
const getAllParentItemIds = (treeData: MUITreeItem[]): string[] => {
  const parentIds: string[] = [];

  const traverse = (nodes: MUITreeItem[]) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        parentIds.push(node.id);
        traverse(node.children);
      }
    });
  };

  traverse(treeData);
  return parentIds;
};

// Custom Tree Item Component with Task Controls using useTreeItem hook
const CustomTaskTreeItem = React.forwardRef<
  HTMLLIElement,
  TreeItemProps & {
    task: Task;
    onToggleCompletion: (taskId: string, currentStatus: boolean) => void;
    onDelete: (taskId: string) => void;
    onCreateSubtask: (parentTaskId: string) => void;
    onTaskSelect: (task: Task) => void;
    isSelected: boolean;
  }
>(
  (
    {
      id,
      itemId,
      label,
      disabled,
      children,
      task,
      onToggleCompletion,
      onDelete,
      onCreateSubtask,
      onTaskSelect,
      isSelected,
    },
    ref
  ) => {
    const {
      getContextProviderProps,
      getRootProps,
      getContentProps,
      getLabelProps,
      getGroupTransitionProps,
      getIconContainerProps,
      status,
    } = useTreeItem({ id, itemId, label, disabled, children, rootRef: ref });

    return (
      <TreeItemProvider {...getContextProviderProps()}>
        <TreeItemRoot {...getRootProps()}>
          <TreeItemContent {...getContentProps()}>
            <TreeItemIconContainer {...getIconContainerProps()}>
              <TreeItemIcon status={status} />
            </TreeItemIconContainer>

            <TreeItemLabel {...getLabelProps()}>
              <Box
                onClick={() => onTaskSelect(task)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  py: 0.5,
                  px: 1,
                  borderRadius: 1,
                  cursor: "pointer",
                  backgroundColor: isSelected
                    ? "primary.dark"
                    : task.completed
                    ? "action.hover"
                    : "transparent",
                  color: isSelected ? "primary.contrastText" : "inherit",
                  border: isSelected ? "2px solid" : "2px solid transparent",
                  borderColor: isSelected ? "primary.main" : "transparent",
                  "&:hover": {
                    backgroundColor: isSelected
                      ? "primary.darker"
                      : "action.hover",
                    // Show delete button on hover
                    "& .delete-button": {
                      opacity: 1,
                    },
                  },
                }}
              >
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCompletion(task.id, task.completed);
                  }}
                  color={task.completed ? "warning" : "success"}
                  size="small"
                >
                  {task.completed ? <RadioButtonUnchecked /> : <CheckCircle />}
                </IconButton>

                <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      textDecoration: task.completed ? "line-through" : "none",
                      color: task.completed ? "text.secondary" : "text.primary",
                    }}
                  >
                    {task.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "0.75rem",
                      color: "text.secondary",
                      mt: 0.25,
                    }}
                  >
                    ID: {task.id}
                  </Typography>
                </Box>

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

                {task.attachmentCount != null && task.attachmentCount > 0 && (
                  <Chip
                    label={`${task.attachmentCount} attachment${
                      task.attachmentCount > 1 ? "s" : ""
                    }`}
                    color="info"
                    size="small"
                    variant="outlined"
                  />
                )}

                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateSubtask(task.id);
                  }}
                  color="primary"
                  title="Add Subtask"
                  size="small"
                >
                  <SubdirectoryArrowRight />
                </IconButton>

                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                  color="error"
                  size="small"
                  className="delete-button"
                  sx={{
                    opacity: isSelected ? 1 : 0,
                    transition: "opacity 0.2s ease-in-out",
                    "&:hover": {
                      backgroundColor: "error.main",
                      color: "error.contrastText",
                    },
                  }}
                >
                  <Delete />
                </IconButton>
              </Box>
            </TreeItemLabel>
          </TreeItemContent>
          {children && (
            <TreeItemGroupTransition {...getGroupTransitionProps()} />
          )}
        </TreeItemRoot>
      </TreeItemProvider>
    );
  }
);

interface TaskListProps {
  onTaskSelect: (task: Task) => void;
  onTaskDeselect: () => void;
  selectedTaskId?: string;
}

const TaskList: React.FC<TaskListProps> = ({
  onTaskSelect,
  onTaskDeselect,
  selectedTaskId,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  // Tree data structure for MUI Tree View
  const [treeData, setTreeData] = useState<MUITreeItem[]>([]);
  // Controlled state for expanded items
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // state variables for create task
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  // const [newTaskDueDate, setNewTaskDueDate] = useState("");
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
    } catch {
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
    } catch {
      setError("Failed to update task");
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
    } catch {
      setError("Failed to delete task");
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
        // setNewTaskDueDate("");
        setParentTaskId(null);
        setShowCreateForm(false);
      } else {
        setError(response.msg);
      }
    } catch {
      setError("Failed to create task");
    } finally {
      setIsCreating(false);
    }
  };

  const openCreateTaskForm = () => {
    setParentTaskId(null);
    setShowCreateForm(true);
  };

  const openCreateSubtaskForm = (parentId: string) => {
    setParentTaskId(parentId);
    setShowCreateForm(true);
  };

  const handleExpandedItemsChange = (
    _event: React.SyntheticEvent | null,
    itemIds: string[]
  ) => {
    setExpandedItems(itemIds);
  };

  const handleItemExpansionToggle = (
    _event: React.SyntheticEvent | null,
    itemId: string,
    isExpanded: boolean
  ) => {
    console.log(`Item ${itemId} ${isExpanded ? "expanded" : "collapsed"}`);
  };

  const closeCreateForm = () => {
    setShowCreateForm(false);
    setParentTaskId(null);
    setNewTaskTitle("");
    setNewTaskDescription("");
    // setNewTaskDueDate("");
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    // Build MUI tree data from tasks using nested structure
    const treeData = buildMUITreeData(tasks);
    setTreeData(treeData);

    // Set all parent items as expanded by default
    const parentIds = getAllParentItemIds(treeData);
    setExpandedItems(parentIds);
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
      onClick={(e) => {
        // If clicking on the Paper itself (not on a task), deselect
        if (e.target === e.currentTarget) {
          onTaskDeselect();
        }
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          display="flex"
          px={0}
          justifyContent={"space-evenly"}
          gap={2}
          mb={2}
        >
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

        {tasks.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
            >
              No tasks found. Create your first task!
            </Typography>
          </Box>
        ) : (
          <>
            {selectedTaskId && (
              <Box
                sx={{
                  mb: 2,
                  p: 1,
                  backgroundColor: "primary.dark",
                  color: "primary.contrastText",
                  borderRadius: 1,
                  textAlign: "center",
                  border: "1px solid",
                  borderColor: "primary.main",
                }}
              >
                <Typography variant="body2">
                  Selected: {tasks.find((t) => t.id === selectedTaskId)?.title}
                </Typography>
                <Typography variant="caption">
                  Click the task again or click empty space to deselect
                </Typography>
              </Box>
            )}
            <RichTreeView
              items={treeData}
              expandedItems={expandedItems}
              onExpandedItemsChange={handleExpandedItemsChange}
              onItemExpansionToggle={handleItemExpansionToggle}
              expansionTrigger="iconContainer"
              slots={{
                item: (props) => {
                  const task = tasks.find((t) => t.id === props.itemId);
                  if (!task) return null;

                  return (
                    <CustomTaskTreeItem
                      {...props}
                      task={task}
                      onToggleCompletion={toggleTaskCompletion}
                      onDelete={deleteTask}
                      onCreateSubtask={openCreateSubtaskForm}
                      onTaskSelect={onTaskSelect}
                      isSelected={selectedTaskId === task.id}
                    />
                  );
                },
              }}
              sx={{
                flex: 1,
                overflowY: "auto",
              }}
            />
          </>
        )}
      </Box>

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
