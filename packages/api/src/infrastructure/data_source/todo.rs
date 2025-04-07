use anyhow::Result;
use chrono::{DateTime, Utc};
use sqlx::{Pool, Sqlite};
use uuid::Uuid;
use super::DataAccessError;

use crate::domain::todo::{Completed, Todo, TodoId, validate_title};

pub struct TodoRow {
    pub id: String,
    pub title: String,
    pub completed: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

pub fn row_to_domain(row: TodoRow) -> Result<Todo, DataAccessError> {
    let id = Uuid::parse_str(&row.id)
        .map_err(|_| DataAccessError::InvalidData(format!("Invalid UUID: {}", row.id)))?;

    let title =
        validate_title(row.title).map_err(DataAccessError::InvalidData)?;

    Ok(Todo {
        id: TodoId(id),
        title,
        completed: Completed(row.completed),
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub async fn find_todo_by_id(
    pool: &Pool<Sqlite>,
    id: &TodoId,
) -> Result<Option<Todo>, DataAccessError> {
    let id_str = id.0.to_string();

    let row = sqlx::query_as!(
        TodoRow,
        r#"
        SELECT 
           id as "id!: String", 
           title as "title!: String", 
           completed, 
           created_at as "created_at: DateTime<Utc>", 
           updated_at as "updated_at: DateTime<Utc>"
        FROM todo
        WHERE id = ?
        "#,
        id_str
    )
    .fetch_optional(pool)
    .await
    .map_err(|e| DataAccessError::Database(e.to_string()))?;

    match row {
        Some(row) => row_to_domain(row).map(Some),
        None => Ok(None),
    }
}

pub async fn find_all_todos(pool: &Pool<Sqlite>) -> Result<Vec<Todo>, DataAccessError> {
    let rows = sqlx::query_as!(
        TodoRow,
        r#"
        SELECT 
           id as "id!: String", 
           title as "title!: String", 
           completed, 
           created_at as "created_at: DateTime<Utc>", 
           updated_at as "updated_at: DateTime<Utc>"
        FROM todo
        ORDER BY created_at DESC
        "#
    )
    .fetch_all(pool)
    .await
    .map_err(|e| DataAccessError::Database(e.to_string()))?;

    let mut todos = Vec::with_capacity(rows.len());
    for row in rows {
        let todo = row_to_domain(row)?;
        todos.push(todo);
    }

    Ok(todos)
}

pub async fn save_todo(pool: &Pool<Sqlite>, todo: &Todo) -> Result<(), DataAccessError> {
    let existing = find_todo_by_id(pool, &todo.id).await?;

    if existing.is_none() {
        sqlx::query(
            r#"
            INSERT INTO todo (id, title, completed, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            "#,
        )
        .bind(todo.id.0.to_string())
        .bind(&todo.title.0)
        .bind(todo.completed.0)
        .bind(todo.created_at)
        .bind(todo.updated_at)
        .execute(pool)
        .await
        .map_err(|e| DataAccessError::Database(e.to_string()))?;
    } else {
        sqlx::query(
            r#"
            UPDATE todo
            SET title = ?, completed = ?, updated_at = ?
            WHERE id = ?
            "#,
        )
        .bind(&todo.title.0)
        .bind(todo.completed.0)
        .bind(todo.updated_at)
        .bind(todo.id.0.to_string())
        .execute(pool)
        .await
        .map_err(|e| DataAccessError::Database(e.to_string()))?;
    }

    Ok(())
}

pub async fn delete_todo_by_id(pool: &Pool<Sqlite>, id: &TodoId) -> Result<(), DataAccessError> {
    let result = sqlx::query(
        r#"
        DELETE FROM todo
        WHERE id = ?
        "#,
    )
    .bind(id.0.to_string())
    .execute(pool)
    .await
    .map_err(|e| DataAccessError::Database(e.to_string()))?;

    if result.rows_affected() == 0 {
        return Err(DataAccessError::NotFound(id.0.to_string()));
    }

    Ok(())
}
