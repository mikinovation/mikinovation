use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

pub type JsonString = String;

#[derive(Debug, Deserialize)]
pub struct CreateTodoDto {
    pub title: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTodoDto {
    pub title: Option<String>,
    pub completed: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct TodoDto {
    pub id: Uuid,
    pub title: String,
    pub completed: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct TodoListDto {
    pub todos: Vec<TodoDto>,
}

#[derive(Debug, Serialize)]
pub struct ErrorDto {
    pub error: String,
}

#[derive(Debug, Serialize)]
pub struct SuccessDto {
    pub message: String,
}

#[derive(Debug, thiserror::Error)]
pub enum SerializationError {
    #[error("Failed to deserialize: {0}")]
    Deserialize(String),
    
    #[error("Failed to serialize: {0}")]
    Serialize(String),
    
    #[error("Validation error: {0}")]
    Validation(String),
}
