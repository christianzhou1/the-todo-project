-- Add parent task column for subtask functionality
ALTER TABLE task ADD COLUMN parent_task_id uuid;

-- Add foreign key constraint to parent task
ALTER TABLE task ADD CONSTRAINT fk_task_parent_task
    FOREIGN KEY (parent_task_id) REFERENCES task(id) ON DELETE CASCADE;

-- Add index for efficient parent task queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_task_parent_task_id
    ON task(parent_task_id) WHERE parent_task_id IS NOT NULL;

-- Add composite index for user + parent task queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_task_user_parent_deleted
    ON task(user_id, parent_task_id, is_deleted) WHERE parent_task_id IS NOT NULL;