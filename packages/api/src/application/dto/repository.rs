use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

pub type JsonString = String;

#[derive(Debug, Deserialize)]
pub struct CreateRepositoryDto {
    pub github_id: i64,
    pub name: String,
    pub full_name: String,
    pub description: Option<String>,
    pub language: Option<String>,
    pub html_url: String,
    pub stargazers_count: i32,
}

#[derive(Debug, Deserialize)]
pub struct UpdateRepositoryDto {
    pub name: Option<String>,
    pub description: Option<String>,
    pub language: Option<String>,
    pub html_url: Option<String>,
    pub stargazers_count: Option<i32>,
}

#[derive(Debug, Serialize)]
pub struct RepositoryDto {
    pub id: Uuid,
    pub github_id: i64,
    pub name: String,
    pub full_name: String,
    pub description: Option<String>,
    pub language: Option<String>,
    pub html_url: String,
    pub stargazers_count: i32,
    pub connected_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct RepositoryListDto {
    pub repositories: Vec<RepositoryDto>,
}
