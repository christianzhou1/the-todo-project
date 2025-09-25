-- Add user_id column to attachment table and create foreign key relationship
ALTER TABLE attachment ADD COLUMN user_id UUID;
ALTER TABLE attachment ADD CONSTRAINT fk_attachment_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create index for attachment user_id
CREATE INDEX idx_attachment_user_id ON attachment(user_id);

-- Update existing attachments to reference the default user
UPDATE attachment SET user_id = (SELECT id FROM users WHERE username = 'default_user' LIMIT 1) WHERE user_id IS NULL;

-- Make user_id NOT NULL after setting default values
ALTER TABLE attachment ALTER COLUMN user_id SET NOT NULL;
