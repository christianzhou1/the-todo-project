ALTER TABLE task RENAME COLUMN task_name TO title;
ALTER TABLE task RENAME COLUMN task_desc TO description;
ALTER TABLE task RENAME COLUMN is_completed TO is_complete;
ALTER TABLE task ADD COLUMN due_date timestamptz;