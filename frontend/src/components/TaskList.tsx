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
import { Tree } from "react-arborist";
import TaskItem from "./TaskItem";

// Reordering utilities
interface ReorderPreferences {
  [parentTaskId: string]: string[]; // parentTaskId -> ordered task IDs
}

const REORDER_STORAGE_KEY = "taskReorderPreferences";

const getReorderPreferences = (): ReorderPreferences => {
  try {
    const stored = localStorage.getItem(REORDER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveReorderPreferences = (preferences: ReorderPreferences) => {
  try {
    localStorage.setItem(REORDER_STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error("Failed to save reorder preferences:", error);
  }
};

const clearReorderPreferences = () => {
  try {
    localStorage.removeItem(REORDER_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear reorder preferences:", error);
  }
};

const applyUserReordering = (tasks: Task[]): Task[] => {
  const preferences = getReorderPreferences();
  const reorderedTasks: Task[] = [];

  // Group tasks by parent
  const tasksByParent = new Map<string, Task[]>();
  tasks.forEach((task) => {
    const parentKey = task.parentTaskId || "root";
    if (!tasksByParent.has(parentKey)) {
      tasksByParent.set(parentKey, []);
    }
    tasksByParent.get(parentKey)!.push(task);
  });

  // Apply reordering for each parent group
  tasksByParent.forEach((parentTasks, parentKey) => {
    const userOrder = preferences[parentKey];

    if (userOrder && userOrder.length > 0) {
      // Apply user-defined order
      const orderedTasks: Task[] = [];
      const taskMap = new Map(parentTasks.map((task) => [task.id, task]));

      // Add tasks in user-defined order
      userOrder.forEach((taskId) => {
        const task = taskMap.get(taskId);
        if (task) {
          orderedTasks.push(task);
          taskMap.delete(taskId);
        }
      });

      // Add any remaining tasks (new tasks not in user preferences)
      taskMap.forEach((task) => orderedTasks.push(task));

      reorderedTasks.push(...orderedTasks);
    } else {
      // Use database order (display_order)
      reorderedTasks.push(
        ...parentTasks.sort(
          (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
        )
      );
    }
  });

  return reorderedTasks;
};

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
    } else if (node) {
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

  const handleTaskMove = ({ dragNodes, parentNode, index }: any) => {
    const draggedTask = dragNodes[0];

    if (!draggedTask) return;

    // Only allow reordering within the same parent (no hierarchy changes)
    const originalParentId = draggedTask.data.task.parentTaskId;
    const newParentId = parentNode?.data?.task?.id || null;

    // Check if targetParentId is actually a sibling (has the same parent as draggedTask)
    let actualNewParentId = newParentId;
    if (newParentId && newParentId !== originalParentId) {
      const targetTask = tasks.find((t) => t.id === newParentId);
      if (targetTask && targetTask.parentTaskId === originalParentId) {
        // This is a sibling, so the actual parent is the same as draggedTask's parent
        actualNewParentId = originalParentId;
      }
    }

    if (originalParentId !== actualNewParentId) {
      return;
    }

    try {
      // Get current reorder preferences
      const preferences = getReorderPreferences();
      const parentKey = originalParentId || "root";

      // Get all tasks in the same parent group
      const siblingTasks = tasks.filter((task) => {
        const taskParentId = task.parentTaskId || "root";
        return taskParentId === parentKey;
      });

      // Create new order by moving the dragged task to the new position
      const draggedTaskId = draggedTask.data.task.id;
      const newOrder = [...siblingTasks.map((t) => t.id)];

      // Remove dragged task from its current position
      const currentIndex = newOrder.indexOf(draggedTaskId);
      if (currentIndex !== -1) {
        newOrder.splice(currentIndex, 1);
      }

      // Insert at new position
      newOrder.splice(index, 0, draggedTaskId);

      // Save the new order
      preferences[parentKey] = newOrder;
      saveReorderPreferences(preferences);

      // Trigger re-render by updating tasks state
      setTasks([...tasks]);
    } catch (err) {
      console.error("Error reordering task:", err);
      setError("Failed to reorder task");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    // Apply user reordering before building tree
    const reorderedTasks = applyUserReordering(tasks);
    const tree = buildTreeData(reorderedTasks);
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
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              clearReorderPreferences();
              setTasks([...tasks]); // Trigger re-render
            }}
          >
            Reset Order
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
        <Tree
          data={treeData}
          openByDefault={true}
          width="100%"
          height={700}
          indent={48}
          rowHeight={90}
          onMove={handleTaskMove}
          disableDrop={({ parentNode, dragNodes }) => {
            // Only allow drops within the same parent (no hierarchy changes)
            const draggedTask = dragNodes[0];

            if (!draggedTask) {
              return true;
            }

            const originalParentId = draggedTask.data.task.parentTaskId;
            const targetParentId = parentNode?.data?.task?.id || null;

            // Check if targetParentId is actually a sibling (has the same parent as draggedTask)
            let actualTargetParentId = targetParentId;
            if (targetParentId && targetParentId !== originalParentId) {
              const targetTask = tasks.find((t) => t.id === targetParentId);
              if (targetTask && targetTask.parentTaskId === originalParentId) {
                // This is a sibling, so the actual parent is the same as draggedTask's parent
                actualTargetParentId = originalParentId;
              }
            }

            // Disable drop if trying to move to a different parent
            return originalParentId !== actualTargetParentId;
          }}
          dragPreviewRender={(props) => (
            <div
              style={{
                background: "rgba(0, 0, 0, 0.1)",
                border: "2px dashed #ccc",
                padding: "8px",
                borderRadius: "4px",
              }}
            >
              {props.dragNodes[0]?.data?.name}
            </div>
          )}
        >
          {({ node, style, dragHandle }) => (
            <div
              style={{
                ...style,
                cursor: "grab",
                userSelect: "none",
              }}
              ref={dragHandle}
            >
              <TaskItem
                task={node.data.task}
                index={0} // Tree handles positioning, so index is not critical
                totalTasks={tasks.length}
                onToggleCompletion={toggleTaskCompletion}
                onDelete={deleteTask}
                onCreateSubtask={openCreateSubtaskForm}
              />
            </div>
          )}
        </Tree>
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
