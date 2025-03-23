use axum::{
    routing::get,
    Router,
};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};
use sqlx::{Pool, Sqlite, sqlite::SqlitePoolOptions};
use sqlx::FromRow;
use anyhow::Result;
use std::sync::Arc;
use async_trait::async_trait;

// model.rs

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TodoId(pub Uuid);

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TodoTitle(pub String);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Completed(pub bool);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Todo {
    pub id: TodoId,
    pub title: TodoTitle,
    pub completed: Completed,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl TodoTitle {
    pub fn create(title: String) -> Result<Self, String> {
        if title.trim().is_empty() {
            return Err("Title cannot be empty".to_string());
        }
        if title.len() > 100 {
            return Err("Title is too long (max 100 characters)".to_string());
        }
        Ok(Self(title))
    }
}

#[derive(Debug, Clone)]
pub struct CreateTodoInput {
    pub title: TodoTitle,
}

#[derive(Debug, Clone)]
pub struct UpdateTodoInput {
    pub id: TodoId,
    pub title: Option<TodoTitle>,
    pub completed: Option<Completed>,
}

#[derive(Debug, Clone)]
pub enum TodoOutput {
    Created(Todo),
    Updated(Todo),
    Deleted(TodoId),
    Found(Todo),
    NotFound(TodoId),
    List(Vec<Todo>),
    Error(String),
}

pub type TodoWorkflow<I, O> = fn(I) -> O;

pub fn create_todo(input: CreateTodoInput) -> TodoOutput {
    let now = Utc::now();
    let todo = Todo {
        id: TodoId(Uuid::new_v4()),
        title: input.title,
        completed: Completed(false),
        created_at: now,
        updated_at: now,
    };
    
    TodoOutput::Created(todo)
}

pub fn update_todo(input: UpdateTodoInput, existing_todo: Option<Todo>) -> TodoOutput {
    match existing_todo {
        Some(todo) => {
            let updated_todo = Todo {
                id: todo.id,
                title: input.title.unwrap_or(todo.title),
                completed: input.completed.unwrap_or(todo.completed),
                created_at: todo.created_at,
                updated_at: Utc::now(),
            };
            
            TodoOutput::Updated(updated_todo)
        }
        None => TodoOutput::NotFound(input.id),
    }
}

pub fn delete_todo(id: TodoId, existing_todo: Option<Todo>) -> TodoOutput {
    match existing_todo {
        Some(_) => TodoOutput::Deleted(id),
        None => TodoOutput::NotFound(id),
    }
}

pub fn find_todo(id: TodoId, existing_todo: Option<Todo>) -> TodoOutput {
    match existing_todo {
        Some(todo) => TodoOutput::Found(todo),
        None => TodoOutput::NotFound(id),
    }
}

pub fn list_todos(todos: Vec<Todo>) -> TodoOutput {
    TodoOutput::List(todos)
}

// repository.rs

#[derive(Debug, FromRow)]
struct TodoRow {
    id: String,
    title: String,
    completed: bool,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Debug, thiserror::Error)]
pub enum RepositoryError {
    #[error("Database error: {0}")]
    Database(String),
    
    #[error("Todo with id {0} not found")]
    NotFound(String),
    
    #[error("Invalid data: {0}")]
    InvalidData(String),
}

#[async_trait]
pub trait TodoRepository: Send + Sync {
    async fn find_by_id(&self, id: &TodoId) -> Result<Option<Todo>, RepositoryError>;
    async fn find_all(&self) -> Result<Vec<Todo>, RepositoryError>;
    async fn save(&self, todo: &Todo) -> Result<Todo, RepositoryError>;
    async fn remove(&self, id: &TodoId) -> Result<(), RepositoryError>;
}

pub struct MikinovationRepository {
    pool: Pool<Sqlite>,
}

impl MikinovationRepository {
    pub async fn new(database_url: &str) -> Result<Arc<Self>, RepositoryError> {
        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect(database_url)
            .await
            .map_err(|e| RepositoryError::Database(e.to_string()))?;
        
        Self::init_db(&pool).await?;
        
        Ok(Arc::new(Self { pool }))
    }
    
    async fn init_db(pool: &Pool<Sqlite>) -> Result<(), RepositoryError> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS todos (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                completed BOOLEAN NOT NULL DEFAULT 0,
                created_at TIMESTAMP NOT NULL,
                updated_at TIMESTAMP NOT NULL
            )
            "#,
        )
        .execute(pool)
        .await
        .map_err(|e| RepositoryError::Database(e.to_string()))?;
        
        Ok(())
    }
    
    fn row_to_todo(row: TodoRow) -> Result<Todo, RepositoryError> {
        let id = Uuid::parse_str(&row.id)
            .map_err(|_| RepositoryError::InvalidData(format!("Invalid UUID: {}", row.id)))?;
        
        let title = TodoTitle::create(row.title)
            .map_err(|e| RepositoryError::InvalidData(e))?;
        
        Ok(Todo {
            id: TodoId(id),
            title,
            completed: Completed(row.completed),
            created_at: row.created_at,
            updated_at: row.updated_at,
        })
    }

    fn todo_to_params(todo: &Todo) -> (String, String, bool, DateTime<Utc>, DateTime<Utc>) {
        (
            todo.id.0.to_string(),
            todo.title.0.clone(),
            todo.completed.0,
            todo.created_at,
            todo.updated_at,
        )
    }
}

#[async_trait]
impl TodoRepository for MikinovationRepository {
    async fn find_by_id(&self, id: &TodoId) -> Result<Option<Todo>, RepositoryError> {
        let row = sqlx::query_as::<_, TodoRow>(
            r#"
            SELECT * FROM todos WHERE id = ?
            "#,
        )
        .bind(id.0.to_string())
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| RepositoryError::Database(e.to_string()))?;
        
        match row {
            Some(row) => Self::row_to_todo(row).map(Some),
            None => Ok(None),
        }
    }
    
    async fn find_all(&self) -> Result<Vec<Todo>, RepositoryError> {
        let rows = sqlx::query_as::<_, TodoRow>(
            r#"
            SELECT * FROM todos ORDER BY created_at DESC
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| RepositoryError::Database(e.to_string()))?;
        
        let mut todos = Vec::with_capacity(rows.len());
        for row in rows {
            let todo = Self::row_to_todo(row)?;
            todos.push(todo);
        }
        
        Ok(todos)
    }
    
    async fn save(&self, todo: &Todo) -> Result<Todo, RepositoryError> {
        let (id, title, completed, created_at, updated_at) = Self::todo_to_params(todo);

        let existing = self.find_by_id(&todo.id).await?;

        if existing.is_none() {
            sqlx::query(
                r#"
                INSERT INTO todos (id, title, completed, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
                "#,
            )
            .bind(&id)
            .bind(&title)
            .bind(completed)
            .bind(created_at)
            .bind(updated_at)
            .execute(&self.pool)
            .await
            .map_err(|e| RepositoryError::Database(e.to_string()))?;
        } else {
            // 更新
            sqlx::query(
                r#"
                UPDATE todos
                SET title = ?, completed = ?, updated_at = ?
                WHERE id = ?
                "#,
            )
            .bind(&title)
            .bind(completed)
            .bind(updated_at)
            .bind(&id)
            .execute(&self.pool)
            .await
            .map_err(|e| RepositoryError::Database(e.to_string()))?;
        }
        
        self.find_by_id(&todo.id).await?
            .ok_or_else(|| RepositoryError::NotFound(id))
    }
    
    async fn remove(&self, id: &TodoId) -> Result<(), RepositoryError> {
        let result = sqlx::query(
            r#"
            DELETE FROM todos
            WHERE id = ?
            "#,
        )
        .bind(id.0.to_string())
        .execute(&self.pool)
        .await
        .map_err(|e| RepositoryError::Database(e.to_string()))?;
        
        if result.rows_affected() == 0 {
            return Err(RepositoryError::NotFound(id.0.to_string()));
        }
        
        Ok(())
    }
}

#[tokio::main]
async fn main() {
    let app = Router::new().route("/", get(|| async { "Hello, World!" }));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
