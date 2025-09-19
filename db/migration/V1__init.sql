CREATE TABLE task (
                      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                      title TEXT NOT NULL,
                      completed BOOLEAN NOT NULL DEFAULT FALSE,
                      created_at TIMESTAMPTZ
);
