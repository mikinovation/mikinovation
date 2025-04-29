use anyhow::Result;
use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite};

pub mod repository;
pub mod todo;

#[derive(Debug, thiserror::Error)]
pub enum DataAccessError {
    #[error("Database error: {0}")]
    Database(String),

    #[error("Todo with id {0} not found")]
    NotFound(String),

    #[error("Invalid data: {0}")]
    InvalidData(String),
}

pub async fn init_db_pool(database_url: &str) -> Result<Pool<Sqlite>, DataAccessError> {
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(database_url)
        .await
        .map_err(|e| DataAccessError::Database(e.to_string()))?;

    Ok(pool)
}
