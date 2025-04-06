CREATE TABLE IF NOT EXISTS repository (
    id TEXT PRIMARY KEY,
    github_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    description TEXT,
    language TEXT,
    html_url TEXT NOT NULL,
    stargazers_count INTEGER NOT NULL DEFAULT 0,
    connected_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
