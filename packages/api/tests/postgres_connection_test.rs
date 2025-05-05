use mikinovation_api::infrastructure::data_source::{init_db_pool, DbPool};
use std::env;
use std::sync::Arc;

#[tokio::test]
async fn test_postgres_connection() {
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
    let db_pool = Arc::new(db_pool);

    // Simple test to ensure the connection works
    let result = sqlx::query("SELECT 1 as test")
        .fetch_one(db_pool.as_ref())
        .await;

    assert!(result.is_ok(), "Database connection test failed");
}