-- Create many-to-many relationship between tasks and attachments
-- Step 1: Create junction table for many-to-many relationship
CREATE TABLE task_attachment (
    task_id UUID NOT NULL,
    attachment_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (task_id, attachment_id),
    FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE CASCADE,
    FOREIGN KEY (attachment_id) REFERENCES attachment(id) ON DELETE CASCADE
);

-- Step 2: Migrate existing data from attachment.task_id to junction table
INSERT INTO task_attachment (task_id, attachment_id, created_at)
SELECT task_id, id, created_at
FROM attachment
WHERE task_id IS NOT NULL;

-- Step 3: Create indexes for performance
CREATE INDEX idx_task_attachment_task_id ON task_attachment(task_id);
CREATE INDEX idx_task_attachment_attachment_id ON task_attachment(attachment_id);

-- Step 4: Remove the old foreign key constraint and column
ALTER TABLE attachment DROP CONSTRAINT IF EXISTS fk_attachment_task_id;
ALTER TABLE attachment DROP COLUMN task_id;
