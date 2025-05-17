CREATE TABLE IF NOT EXISTS repository_label (
    repository_id TEXT NOT NULL REFERENCES repository(id) ON DELETE CASCADE,
    label_id TEXT NOT NULL REFERENCES label(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (repository_id, label_id)
);