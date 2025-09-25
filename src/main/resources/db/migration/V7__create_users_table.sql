-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create indexes for common queries
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Add user_id column to task table and create foreign key relationship
ALTER TABLE task ADD COLUMN user_id UUID;
ALTER TABLE task ADD CONSTRAINT fk_task_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create index for task user_id
CREATE INDEX idx_task_user_id ON task(user_id);

-- Update existing tasks to have a default user (optional - for existing data)
-- This creates a default user for existing tasks
INSERT INTO users (id, username, email, password_hash, first_name, last_name, is_active)
VALUES (gen_random_uuid(), 'default_user', 'default@example.com', '$2a$10$dummy.hash.for.default.user', 'Default', 'User', true);

-- Update existing tasks to reference the default user
UPDATE task SET user_id = (SELECT id FROM users WHERE username = 'default_user' LIMIT 1) WHERE user_id IS NULL;

-- Make user_id NOT NULL after setting default values
ALTER TABLE task ALTER COLUMN user_id SET NOT NULL;
