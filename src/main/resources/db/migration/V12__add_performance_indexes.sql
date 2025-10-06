-- Critical composite indexes for task queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_task_user_deleted_created
    ON task(user_id, is_deleted, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_task_user_deleted_completed
    ON task(user_id, is_deleted, is_completed);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_task_user_deleted
    ON task(user_id, is_deleted);

-- Attachment user index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attachment_user_id
    ON attachment(user_id);

-- Optional: Due date index for future features
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_task_due_date
    ON task(due_date) WHERE due_date IS NOT NULL;