use chrono::Utc;
use mikinovation_api::domain::todo::{Completed, Todo, TodoId, Title};
use mikinovation_api::infrastructure::data_source::{init_db_pool, DbPool};
use mikinovation_api::infrastructure::data_source::todo::{find_todo_by_id, save_todo, delete_todo_by_id, find_all_todos};
use std::env;
use std::sync::Arc;
use uuid::Uuid;

async fn setup_test_db() -> Arc<DbPool> {
    // Set a test database URL
    env::set_var(
        "DATABASE_URL",
        "postgres://postgres:postgres@localhost:5432/mikinovation_test",
    );

    // Get the database URL
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:postgres@localhost:5432/mikinovation_test".to_string());

    // Initialize the database pool
    let db_pool = init_db_pool(&database_url).await.expect("Failed to initialize database pool");
    
    // Ensure tables exist (run migrations)
    sqlx::query("
        CREATE TABLE IF NOT EXISTS todo (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            completed BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL
        )
    ")
    .execute(db_pool.as_ref())
    .await
    .expect("Failed to create todo table");
    
    Arc::new(db_pool)
}

async fn cleanup_test_db(db_pool: &Arc<DbPool>) {
    // Clean up the test database
    sqlx::query("DELETE FROM todo")
        .execute(db_pool.as_ref())
        .await
        .expect("Failed to clean up test database");
}

#[tokio::test]
async fn test_todo_crud_operations() {
    // Setup
    let db_pool = setup_test_db().await;
    cleanup_test_db(&db_pool).await;
    
    // Create a test todo
    let todo_id = TodoId(Uuid::new_v4());
    let now = Utc::now();
    let todo = Todo {
        id: todo_id.clone(),
        title: Title("Test Todo".to_string()),
        completed: Completed(false),
        created_at: now,
        updated_at: now,
    };
    
    // Test save_todo (Create)
    save_todo(&db_pool, &todo).await.expect("Failed to save todo");
    
    // Test find_todo_by_id (Read)
    let found_todo = find_todo_by_id(&db_pool, &todo_id).await.expect("Failed to find todo");
    assert!(found_todo.is_some(), "Todo was not found");
    let found_todo = found_todo.unwrap();
    assert_eq!(found_todo.id.0, todo.id.0, "Todo ID does not match");
    assert_eq!(found_todo.title.0, todo.title.0, "Todo title does not match");
    assert_eq!(found_todo.completed.0, todo.completed.0, "Todo completed status does not match");
    
    // Test find_all_todos (Read All)
    let all_todos = find_all_todos(&db_pool).await.expect("Failed to find all todos");
    assert!(!all_todos.is_empty(), "No todos found");
    
    // Test save_todo for update (Update)
    let mut updated_todo = found_todo.clone();
    updated_todo.title = Title("Updated Test Todo".to_string());
    updated_todo.completed = Completed(true);
    updated_todo.updated_at = Utc::now();
    save_todo(&db_pool, &updated_todo).await.expect("Failed to update todo");
    
    // Verify update
    let found_updated_todo = find_todo_by_id(&db_pool, &todo_id).await.expect("Failed to find updated todo");
    assert!(found_updated_todo.is_some(), "Updated todo was not found");
    let found_updated_todo = found_updated_todo.unwrap();
    assert_eq!(found_updated_todo.title.0, "Updated Test Todo", "Todo title was not updated");
    assert_eq!(found_updated_todo.completed.0, true, "Todo completed status was not updated");
    
    // Test delete_todo_by_id (Delete)
    delete_todo_by_id(&db_pool, &todo_id).await.expect("Failed to delete todo");
    
    // Verify deletion
    let found_deleted_todo = find_todo_by_id(&db_pool, &todo_id).await.expect("Failed to check deleted todo");
    assert!(found_deleted_todo.is_none(), "Todo was not deleted");
    
    // Cleanup
    cleanup_test_db(&db_pool).await;
}