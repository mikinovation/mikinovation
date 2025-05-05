CREATE TABLE IF NOT EXISTS repository (
    id TEXT PRIMARY KEY,
    github_id BIGINT NOT NULL,
    name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    description TEXT,
    language TEXT,
    html_url TEXT NOT NULL,
    stargazers_count BIGINT NOT NULL DEFAULT 0,
    connected_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);