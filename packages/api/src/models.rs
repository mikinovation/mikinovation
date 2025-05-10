use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// Todo model that represents the database record
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Todo {
    pub id: String,
    pub title: String,
    pub completed: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// DTO for creating a new Todo
#[derive(Debug, Deserialize)]
pub struct CreateTodo {
    pub title: String,
}

// DTO for updating a Todo
#[derive(Debug, Deserialize)]
pub struct UpdateTodo {
    pub title: Option<String>,
    pub completed: Option<bool>,
}

impl Todo {
    pub fn new(title: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            title,
            completed: false,
            created_at: now,
            updated_at: now,
        }
    }
}

// Repository model that represents the database record
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Repository {
    pub id: String,
    pub github_id: i64,
    pub name: String,
    pub full_name: String,
    pub description: Option<String>,
    pub language: Option<String>,
    pub html_url: String,
    pub stargazers_count: i64,
    pub connected_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// DTO for creating a new Repository
#[derive(Debug, Deserialize)]
pub struct CreateRepository {
    pub github_id: i64,
    pub name: String,
    pub full_name: String,
    pub description: Option<String>,
    pub language: Option<String>,
    pub html_url: String,
    pub stargazers_count: i64,
}

// DTO for updating a Repository
#[derive(Debug, Deserialize)]
pub struct UpdateRepository {
    pub name: Option<String>,
    pub full_name: Option<String>,
    pub description: Option<String>,
    pub language: Option<String>,
    pub html_url: Option<String>,
    pub stargazers_count: Option<i64>,
}

impl Repository {
    pub fn new(create_repo: CreateRepository) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            github_id: create_repo.github_id,
            name: create_repo.name,
            full_name: create_repo.full_name,
            description: create_repo.description,
            language: create_repo.language,
            html_url: create_repo.html_url,
            stargazers_count: create_repo.stargazers_count,
            connected_at: now,
            created_at: now,
            updated_at: now,
        }
    }
}