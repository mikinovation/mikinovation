use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Todo {
    pub id: String,
    pub title: String,
    pub completed: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateTodo {
    pub title: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTodo {
    pub title: Option<String>,
    pub completed: Option<bool>,
}

impl Todo {
    pub fn new(
        id: String,
        title: String,
        completed: bool,
        created_at: DateTime<Utc>,
        updated_at: DateTime<Utc>,
    ) -> Self {
        Self {
            id,
            title,
            completed,
            created_at,
            updated_at,
        }
    }
}

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
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        id: String,
        github_id: i64,
        name: String,
        full_name: String,
        description: Option<String>,
        language: Option<String>,
        html_url: String,
        stargazers_count: i64,
        connected_at: DateTime<Utc>,
        created_at: DateTime<Utc>,
        updated_at: DateTime<Utc>,
    ) -> Self {
        Self {
            id,
            github_id,
            name,
            full_name,
            description,
            language,
            html_url,
            stargazers_count,
            connected_at,
            created_at,
            updated_at,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Label {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateLabel {
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateLabel {
    pub name: Option<String>,
    pub description: Option<String>,
    pub color: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct AddLabelToRepository {
    pub label_id: String,
}

impl Label {
    pub fn new(create_label: CreateLabel) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            name: create_label.name,
            description: create_label.description,
            color: create_label.color,
            created_at: now,
            updated_at: now,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct User {
    pub id: Uuid,
    pub github_id: i64,
    pub username: String,
    pub name: Option<String>,
    pub email: Option<String>,
    pub avatar_url: Option<String>,
    pub access_token: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct GitHubUser {
    pub id: i64,
    pub login: String,
    pub name: Option<String>,
    pub email: Option<String>,
    pub avatar_url: Option<String>,
}

impl User {
    pub fn from_github(github_user: GitHubUser, access_token: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            github_id: github_user.id,
            username: github_user.login,
            name: github_user.name,
            email: github_user.email,
            avatar_url: github_user.avatar_url,
            access_token,
            created_at: now,
            updated_at: now,
        }
    }
}
