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
} from "@mui/material";
import { AddTask, Refresh } from "@mui/icons-material";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";

// Simple tree data management like the Gmail demo

interface Task {
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

const TaskList: React.FC = () => {
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
        <Box sx={{ minHeight: 400, flexGrow: 1, maxWidth: 300 }}>
          <RichTreeView
            items={treeData}
            expandedItems={expandedItems}
            onExpandedItemsChange={handleExpandedItemsChange}
            onItemExpansionToggle={handleItemExpansionToggle}
            expansionTrigger="iconContainer"
            sx={{
              height: 400,
              flexGrow: 1,
              maxWidth: 400,
              overflowY: "auto",
            }}
          />
        </Box>
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
