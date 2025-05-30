use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use chrono::Utc;
use sqlx::PgPool;
use uuid::Uuid;

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

    let now = Utc::now();
    let todo = Todo::new(Uuid::new_v4().to_string(), payload.title, false, now, now);

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

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::postgres::PgPoolOptions;
    use std::env;

    async fn setup_test_db() -> PgPool {
        let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
            "postgres://postgres:postgres@localhost:5432/mikinovation_test".to_string()
        });

        let pool = PgPoolOptions::new()
            .max_connections(1)
            .connect(&database_url)
            .await
            .expect("Failed to connect to test database");

        pool
    }

    async fn cleanup_todos(pool: &PgPool) {
        sqlx::query("DELETE FROM todo")
            .execute(pool)
            .await
            .expect("Failed to clean up todo table");
    }

    // Helper function to create a test todo
    async fn create_test_todo(pool: &PgPool, title: &str) -> Todo {
        let now = Utc::now();
        let todo = Todo::new(
            Uuid::new_v4().to_string(),
            title.to_string(),
            false,
            now,
            now,
        );

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
        .execute(pool)
        .await
        .expect("Failed to create test todo");

        todo
    }

    #[tokio::test]
    async fn test_get_todos_empty() {
        let pool = setup_test_db().await;
        cleanup_todos(&pool).await;

        let state = State(pool.clone());

        let result = get_todos(state).await;
        assert!(result.is_ok());

        let Json(todos) = result.unwrap();
        assert_eq!(todos.len(), 0);
    }

    #[tokio::test]
    async fn test_get_todos_with_data() {
        let pool = setup_test_db().await;
        cleanup_todos(&pool).await;

        // Insert test data
        let now = Utc::now();
        let later = now + chrono::Duration::seconds(1);
        let todo1 = Todo::new(
            Uuid::new_v4().to_string(),
            "First todo".to_string(),
            false,
            now,
            now,
        );
        let todo2 = Todo::new(
            Uuid::new_v4().to_string(),
            "Second todo".to_string(),
            false,
            later,
            later,
        );

        sqlx::query!(
            r#"
            INSERT INTO todo (id, title, completed, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5)
            "#,
            todo1.id,
            todo1.title,
            todo1.completed,
            todo1.created_at,
            todo1.updated_at
        )
        .execute(&pool)
        .await
        .expect("Failed to insert first todo");

        sqlx::query!(
            r#"
            INSERT INTO todo (id, title, completed, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5)
            "#,
            todo2.id,
            todo2.title,
            todo2.completed,
            todo2.created_at,
            todo2.updated_at
        )
        .execute(&pool)
        .await
        .expect("Failed to insert second todo");

        let state = State(pool.clone());
        let result = get_todos(state).await;
        assert!(result.is_ok());

        let Json(todos) = result.unwrap();
        assert_eq!(todos.len(), 2);

        // Should be ordered by created_at DESC
        assert_eq!(todos[0].title, "Second todo");
        assert_eq!(todos[1].title, "First todo");
    }

    #[tokio::test]
    async fn test_get_todos_order() {
        let pool = setup_test_db().await;
        cleanup_todos(&pool).await;

        // Insert todos with specific timestamps
        let older_time = chrono::DateTime::parse_from_rfc3339("2023-01-01T00:00:00Z")
            .unwrap()
            .with_timezone(&chrono::Utc);
        let newer_time = chrono::DateTime::parse_from_rfc3339("2023-12-31T00:00:00Z")
            .unwrap()
            .with_timezone(&chrono::Utc);

        let todo1 = Todo::new(
            Uuid::new_v4().to_string(),
            "Older todo".to_string(),
            false,
            older_time,
            older_time,
        );
        let todo2 = Todo::new(
            Uuid::new_v4().to_string(),
            "Newer todo".to_string(),
            false,
            newer_time,
            newer_time,
        );

        sqlx::query!(
            r#"
            INSERT INTO todo (id, title, completed, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5)
            "#,
            todo1.id,
            todo1.title,
            todo1.completed,
            todo1.created_at,
            todo1.updated_at
        )
        .execute(&pool)
        .await
        .expect("Failed to insert older todo");

        sqlx::query!(
            r#"
            INSERT INTO todo (id, title, completed, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5)
            "#,
            todo2.id,
            todo2.title,
            todo2.completed,
            todo2.created_at,
            todo2.updated_at
        )
        .execute(&pool)
        .await
        .expect("Failed to insert newer todo");

        let state = State(pool.clone());
        let result = get_todos(state).await;
        assert!(result.is_ok());

        let Json(todos) = result.unwrap();
        assert_eq!(todos.len(), 2);
        assert_eq!(todos[0].title, "Newer todo");
        assert_eq!(todos[1].title, "Older todo");
    }

    #[tokio::test]
    async fn test_get_todo_success() {
        let pool = setup_test_db().await;
        cleanup_todos(&pool).await;

        // Create a test todo
        let test_todo = create_test_todo(&pool, "Test Todo").await;

        // Get the todo
        let state = State(pool.clone());
        let path = Path(test_todo.id.clone());
        let result = get_todo(state, path).await;

        assert!(result.is_ok());
        let Json(todo) = result.unwrap();
        assert_eq!(todo.id, test_todo.id);
        assert_eq!(todo.title, "Test Todo");
        assert_eq!(todo.completed, false);
    }

    #[tokio::test]
    async fn test_get_todo_not_found() {
        let pool = setup_test_db().await;
        cleanup_todos(&pool).await;

        // Try to get a non-existent todo
        let state = State(pool.clone());
        let path = Path(Uuid::new_v4().to_string());
        let result = get_todo(state, path).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::NotFound => (),
            _ => panic!("Expected NotFound error"),
        }
    }

    #[tokio::test]
    async fn test_create_todo_success() {
        let pool = setup_test_db().await;
        cleanup_todos(&pool).await;

        let state = State(pool.clone());
        let payload = CreateTodo {
            title: "New Todo".to_string(),
        };
        let result = create_todo(state, Json(payload)).await;

        assert!(result.is_ok());
        let (status, Json(todo)) = result.unwrap();
        assert_eq!(status, StatusCode::CREATED);
        assert_eq!(todo.title, "New Todo");
        assert_eq!(todo.completed, false);
        assert!(!todo.id.is_empty());

        // Verify it was actually created in the database
        let saved_todo = sqlx::query_as!(
            Todo,
            r#"
            SELECT id, title, completed, created_at, updated_at
            FROM todo
            WHERE id = $1
            "#,
            todo.id
        )
        .fetch_one(&pool)
        .await
        .expect("Failed to fetch created todo");

        assert_eq!(saved_todo.title, "New Todo");
    }

    #[tokio::test]
    async fn test_create_todo_empty_title() {
        let pool = setup_test_db().await;
        cleanup_todos(&pool).await;

        let state = State(pool.clone());
        let payload = CreateTodo {
            title: "".to_string(),
        };
        let result = create_todo(state, Json(payload)).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::BadRequest(msg) => assert_eq!(msg, "Title cannot be empty"),
            _ => panic!("Expected BadRequest error"),
        }
    }

    #[tokio::test]
    async fn test_create_todo_whitespace_title() {
        let pool = setup_test_db().await;
        cleanup_todos(&pool).await;

        let state = State(pool.clone());
        let payload = CreateTodo {
            title: "   ".to_string(),
        };
        let result = create_todo(state, Json(payload)).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::BadRequest(msg) => assert_eq!(msg, "Title cannot be empty"),
            _ => panic!("Expected BadRequest error"),
        }
    }

    #[tokio::test]
    async fn test_update_todo_title_only() {
        let pool = setup_test_db().await;
        cleanup_todos(&pool).await;

        // Create a test todo
        let test_todo = create_test_todo(&pool, "Original Title").await;
        let original_updated_at = test_todo.updated_at;

        // Wait a bit to ensure updated_at will be different
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

        let state = State(pool.clone());
        let path = Path(test_todo.id.clone());
        let payload = UpdateTodo {
            title: Some("Updated Title".to_string()),
            completed: None,
        };
        let result = update_todo(state, path, Json(payload)).await;

        assert!(result.is_ok());
        let Json(updated_todo) = result.unwrap();
        assert_eq!(updated_todo.id, test_todo.id);
        assert_eq!(updated_todo.title, "Updated Title");
        assert_eq!(updated_todo.completed, false);
        assert!(updated_todo.updated_at > original_updated_at);
    }

    #[tokio::test]
    async fn test_update_todo_completed_only() {
        let pool = setup_test_db().await;
        cleanup_todos(&pool).await;

        // Create a test todo
        let test_todo = create_test_todo(&pool, "Test Todo").await;

        let state = State(pool.clone());
        let path = Path(test_todo.id.clone());
        let payload = UpdateTodo {
            title: None,
            completed: Some(true),
        };
        let result = update_todo(state, path, Json(payload)).await;

        assert!(result.is_ok());
        let Json(updated_todo) = result.unwrap();
        assert_eq!(updated_todo.id, test_todo.id);
        assert_eq!(updated_todo.title, "Test Todo");
        assert_eq!(updated_todo.completed, true);
    }

    #[tokio::test]
    async fn test_update_todo_both_fields() {
        let pool = setup_test_db().await;
        cleanup_todos(&pool).await;

        // Create a test todo
        let test_todo = create_test_todo(&pool, "Original Title").await;

        let state = State(pool.clone());
        let path = Path(test_todo.id.clone());
        let payload = UpdateTodo {
            title: Some("New Title".to_string()),
            completed: Some(true),
        };
        let result = update_todo(state, path, Json(payload)).await;

        assert!(result.is_ok());
        let Json(updated_todo) = result.unwrap();
        assert_eq!(updated_todo.id, test_todo.id);
        assert_eq!(updated_todo.title, "New Title");
        assert_eq!(updated_todo.completed, true);
    }

    #[tokio::test]
    async fn test_update_todo_not_found() {
        let pool = setup_test_db().await;
        cleanup_todos(&pool).await;

        let state = State(pool.clone());
        let path = Path(Uuid::new_v4().to_string());
        let payload = UpdateTodo {
            title: Some("Updated".to_string()),
            completed: None,
        };
        let result = update_todo(state, path, Json(payload)).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::NotFound => (),
            _ => panic!("Expected NotFound error"),
        }
    }

    #[tokio::test]
    async fn test_delete_todo_success() {
        let pool = setup_test_db().await;
        cleanup_todos(&pool).await;

        // Create a test todo
        let test_todo = create_test_todo(&pool, "To Be Deleted").await;

        let state = State(pool.clone());
        let path = Path(test_todo.id.clone());
        let result = delete_todo(state, path).await;

        assert!(result.is_ok());
        assert_eq!(result.unwrap(), StatusCode::NO_CONTENT);

        // Verify the todo was actually deleted
        let deleted_todo = sqlx::query_as!(
            Todo,
            r#"
            SELECT id, title, completed, created_at, updated_at
            FROM todo
            WHERE id = $1
            "#,
            test_todo.id
        )
        .fetch_optional(&pool)
        .await
        .expect("Failed to query deleted todo");

        assert!(deleted_todo.is_none());
    }

    #[tokio::test]
    async fn test_delete_todo_not_found() {
        let pool = setup_test_db().await;
        cleanup_todos(&pool).await;

        let state = State(pool.clone());
        let path = Path(Uuid::new_v4().to_string());
        let result = delete_todo(state, path).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::NotFound => (),
            _ => panic!("Expected NotFound error"),
        }
    }

    #[tokio::test]
    async fn test_delete_todo_idempotent() {
        let pool = setup_test_db().await;
        cleanup_todos(&pool).await;

        // Create and delete a todo
        let test_todo = create_test_todo(&pool, "To Be Deleted").await;
        let state = State(pool.clone());
        let path = Path(test_todo.id.clone());

        // First deletion should succeed
        let result = delete_todo(state, path).await;
        assert!(result.is_ok());

        // Second deletion should return NotFound
        let state2 = State(pool.clone());
        let path2 = Path(test_todo.id.clone());
        let result2 = delete_todo(state2, path2).await;
        assert!(result2.is_err());
        match result2.unwrap_err() {
            ApiError::NotFound => (),
            _ => panic!("Expected NotFound error"),
        }
    }
}
