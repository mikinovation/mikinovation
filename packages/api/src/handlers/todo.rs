use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use chrono::Utc;
use sqlx::PgPool;

use crate::error::ApiError;
use crate::models::{CreateTodo, Todo, UpdateTodo};

// Get all todos
pub async fn get_todos(State(pool): State<PgPool>) -> Result<Json<Vec<Todo>>, ApiError> {
    let todos = sqlx::query_as!(
        Todo,
        r#"
        SELECT id, title, completed, created_at, updated_at
        FROM todo
        ORDER BY created_at DESC
        "#
    )
    .fetch_all(&pool)
    .await
    .map_err(ApiError::DbError)?;

    Ok(Json(todos))
}

// Get a single todo by ID
pub async fn get_todo(
    State(pool): State<PgPool>,
    Path(id): Path<String>,
) -> Result<Json<Todo>, ApiError> {
    let todo = sqlx::query_as!(
        Todo,
        r#"
        SELECT id, title, completed, created_at, updated_at
        FROM todo
        WHERE id = $1
        "#,
        id
    )
    .fetch_optional(&pool)
    .await
    .map_err(ApiError::DbError)?
    .ok_or(ApiError::NotFound)?;

    Ok(Json(todo))
}

// Create a new todo
pub async fn create_todo(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateTodo>,
) -> Result<(StatusCode, Json<Todo>), ApiError> {
    if payload.title.trim().is_empty() {
        return Err(ApiError::BadRequest("Title cannot be empty".into()));
    }

    let todo = Todo::new(payload.title);

    sqlx::query!(
        r#"
        INSERT INTO todo (id, title, completed, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        "#,
        todo.id,
        todo.title,
        todo.completed,
        todo.created_at,
        todo.updated_at
    )
    .execute(&pool)
    .await
    .map_err(ApiError::DbError)?;

    Ok((StatusCode::CREATED, Json(todo)))
}

// Update an existing todo
pub async fn update_todo(
    State(pool): State<PgPool>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateTodo>,
) -> Result<Json<Todo>, ApiError> {
    // First check if the todo exists
    let existing = sqlx::query_as!(
        Todo,
        r#"
        SELECT id, title, completed, created_at, updated_at
        FROM todo
        WHERE id = $1
        "#,
        id
    )
    .fetch_optional(&pool)
    .await
    .map_err(ApiError::DbError)?
    .ok_or(ApiError::NotFound)?;

    // Apply updates
    let title = payload.title.unwrap_or(existing.title);
    let completed = payload.completed.unwrap_or(existing.completed);
    let updated_at = Utc::now();

    // Update the todo in the database
    let updated_todo = sqlx::query_as!(
        Todo,
        r#"
        UPDATE todo
        SET title = $1, completed = $2, updated_at = $3
        WHERE id = $4
        RETURNING id, title, completed, created_at, updated_at
        "#,
        title,
        completed,
        updated_at,
        id
    )
    .fetch_one(&pool)
    .await
    .map_err(ApiError::DbError)?;

    Ok(Json(updated_todo))
}

// Delete a todo
pub async fn delete_todo(
    State(pool): State<PgPool>,
    Path(id): Path<String>,
) -> Result<StatusCode, ApiError> {
    let result = sqlx::query!(
        r#"
        DELETE FROM todo
        WHERE id = $1
        "#,
        id
    )
    .execute(&pool)
    .await
    .map_err(ApiError::DbError)?;

    if result.rows_affected() == 0 {
        return Err(ApiError::NotFound);
    }

    Ok(StatusCode::NO_CONTENT)
}
