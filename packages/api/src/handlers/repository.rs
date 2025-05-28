use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use chrono::Utc;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::ApiError;
use crate::models::{CreateRepository, Repository, UpdateRepository};

// Get all repositories
pub async fn get_repositories(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<Repository>>, ApiError> {
    let repositories = sqlx::query_as!(
        Repository,
        r#"
        SELECT id, github_id, name, full_name, description, language, html_url, 
               stargazers_count, connected_at, created_at, updated_at
        FROM repository
        ORDER BY created_at DESC
        "#
    )
    .fetch_all(&pool)
    .await
    .map_err(ApiError::DbError)?;

    Ok(Json(repositories))
}

// Get a single repository by ID
pub async fn get_repository(
    State(pool): State<PgPool>,
    Path(id): Path<String>,
) -> Result<Json<Repository>, ApiError> {
    let repository = sqlx::query_as!(
        Repository,
        r#"
        SELECT id, github_id, name, full_name, description, language, html_url, 
               stargazers_count, connected_at, created_at, updated_at
        FROM repository
        WHERE id = $1
        "#,
        id
    )
    .fetch_optional(&pool)
    .await
    .map_err(ApiError::DbError)?
    .ok_or(ApiError::NotFound)?;

    Ok(Json(repository))
}

// Create a new repository
pub async fn create_repository(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateRepository>,
) -> Result<(StatusCode, Json<Repository>), ApiError> {
    if payload.name.trim().is_empty()
        || payload.full_name.trim().is_empty()
        || payload.html_url.trim().is_empty()
    {
        return Err(ApiError::BadRequest(
            "Name, full_name, and html_url cannot be empty".into(),
        ));
    }

    // Check if repository with this github_id already exists
    let existing = sqlx::query!(
        r#"
        SELECT id FROM repository
        WHERE github_id = $1
        "#,
        payload.github_id
    )
    .fetch_optional(&pool)
    .await
    .map_err(ApiError::DbError)?;

    if existing.is_some() {
        return Err(ApiError::BadRequest(format!(
            "Repository with GitHub ID {} already exists",
            payload.github_id
        )));
    }

    let now = Utc::now();
    let repository = Repository::new(
        Uuid::new_v4().to_string(),
        payload.github_id,
        payload.name,
        payload.full_name,
        payload.description,
        payload.language,
        payload.html_url,
        payload.stargazers_count,
        now, // connected_at
        now, // created_at
        now, // updated_at
    );

    sqlx::query!(
        r#"
        INSERT INTO repository (
            id, github_id, name, full_name, description, language, 
            html_url, stargazers_count, connected_at, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        "#,
        repository.id,
        repository.github_id,
        repository.name,
        repository.full_name,
        repository.description,
        repository.language,
        repository.html_url,
        repository.stargazers_count,
        repository.connected_at,
        repository.created_at,
        repository.updated_at
    )
    .execute(&pool)
    .await
    .map_err(ApiError::DbError)?;

    Ok((StatusCode::CREATED, Json(repository)))
}

// Update an existing repository
pub async fn update_repository(
    State(pool): State<PgPool>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateRepository>,
) -> Result<Json<Repository>, ApiError> {
    // First check if the repository exists
    let existing = sqlx::query_as!(
        Repository,
        r#"
        SELECT id, github_id, name, full_name, description, language, html_url, 
               stargazers_count, connected_at, created_at, updated_at
        FROM repository
        WHERE id = $1
        "#,
        id
    )
    .fetch_optional(&pool)
    .await
    .map_err(ApiError::DbError)?
    .ok_or(ApiError::NotFound)?;

    // Apply updates
    let name = payload.name.unwrap_or(existing.name);
    let full_name = payload.full_name.unwrap_or(existing.full_name);
    let description = payload.description.or(existing.description);
    let language = payload.language.or(existing.language);
    let html_url = payload.html_url.unwrap_or(existing.html_url);
    let stargazers_count = payload
        .stargazers_count
        .unwrap_or(existing.stargazers_count);
    let updated_at = Utc::now();

    // Update the repository in the database
    let updated = sqlx::query_as!(
        Repository,
        r#"
        UPDATE repository
        SET name = $1, full_name = $2, description = $3, language = $4, 
            html_url = $5, stargazers_count = $6, updated_at = $7
        WHERE id = $8
        RETURNING id, github_id, name, full_name, description, language, html_url, 
                  stargazers_count, connected_at, created_at, updated_at
        "#,
        name,
        full_name,
        description,
        language,
        html_url,
        stargazers_count,
        updated_at,
        id
    )
    .fetch_one(&pool)
    .await
    .map_err(ApiError::DbError)?;

    Ok(Json(updated))
}

// Delete a repository
pub async fn delete_repository(
    State(pool): State<PgPool>,
    Path(id): Path<String>,
) -> Result<StatusCode, ApiError> {
    let result = sqlx::query!(
        r#"
        DELETE FROM repository
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
    use uuid::Uuid;

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

    async fn cleanup_repositories(pool: &PgPool) {
        sqlx::query("DELETE FROM repository")
            .execute(pool)
            .await
            .expect("Failed to clean up repository table");
    }

    // Helper function to create a test repository
    async fn create_test_repository(pool: &PgPool, name: &str, github_id: i64) -> Repository {
        let now = Utc::now();
        let repository = Repository::new(
            Uuid::new_v4().to_string(),
            github_id,
            name.to_string(),
            format!("test/{}", name),
            Some("Test repository description".to_string()),
            Some("Rust".to_string()),
            format!("https://github.com/test/{}", name),
            42,
            now,
            now,
            now,
        );

        sqlx::query!(
            r#"
            INSERT INTO repository (
                id, github_id, name, full_name, description, language, 
                html_url, stargazers_count, connected_at, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            "#,
            repository.id,
            repository.github_id,
            repository.name,
            repository.full_name,
            repository.description,
            repository.language,
            repository.html_url,
            repository.stargazers_count,
            repository.connected_at,
            repository.created_at,
            repository.updated_at
        )
        .execute(pool)
        .await
        .expect("Failed to create test repository");

        repository
    }

    #[tokio::test]
    async fn test_get_repositories_empty() {
        let pool = setup_test_db().await;
        cleanup_repositories(&pool).await;

        let state = State(pool.clone());
        let result = get_repositories(state).await;

        assert!(result.is_ok());
        let Json(repositories) = result.unwrap();
        assert_eq!(repositories.len(), 0);
    }

    #[tokio::test]
    async fn test_get_repositories_with_data() {
        let pool = setup_test_db().await;
        cleanup_repositories(&pool).await;

        // Create test repositories
        let _repo1 = create_test_repository(&pool, "repo1", 1001).await;
        let _repo2 = create_test_repository(&pool, "repo2", 1002).await;

        let state = State(pool.clone());
        let result = get_repositories(state).await;

        assert!(result.is_ok());
        let Json(repositories) = result.unwrap();
        assert_eq!(repositories.len(), 2);
    }

    #[tokio::test]
    async fn test_get_repositories_order() {
        let pool = setup_test_db().await;
        cleanup_repositories(&pool).await;

        // Create repositories with specific timestamps
        let older_time = chrono::DateTime::parse_from_rfc3339("2023-01-01T00:00:00Z")
            .unwrap()
            .with_timezone(&chrono::Utc);

        let repo1 = Repository::new(
            Uuid::new_v4().to_string(),
            2001,
            "older-repo".to_string(),
            "test/older-repo".to_string(),
            None,
            None,
            "https://github.com/test/older-repo".to_string(),
            10,
            older_time,
            older_time,
            older_time,
        );

        sqlx::query!(
            r#"
            INSERT INTO repository (
                id, github_id, name, full_name, description, language, 
                html_url, stargazers_count, connected_at, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            "#,
            repo1.id,
            repo1.github_id,
            repo1.name,
            repo1.full_name,
            repo1.description,
            repo1.language,
            repo1.html_url,
            repo1.stargazers_count,
            repo1.connected_at,
            repo1.created_at,
            repo1.updated_at
        )
        .execute(&pool)
        .await
        .expect("Failed to insert older repository");

        // Create newer repository
        let _repo2 = create_test_repository(&pool, "newer-repo", 2002).await;

        let state = State(pool.clone());
        let result = get_repositories(state).await;

        assert!(result.is_ok());
        let Json(repositories) = result.unwrap();
        assert_eq!(repositories.len(), 2);
        assert_eq!(repositories[0].name, "newer-repo"); // Should be first due to DESC order
        assert_eq!(repositories[1].name, "older-repo");
    }

    #[tokio::test]
    async fn test_get_repository_success() {
        let pool = setup_test_db().await;
        cleanup_repositories(&pool).await;

        // Create a test repository
        let test_repo = create_test_repository(&pool, "test-repo", 3001).await;

        let state = State(pool.clone());
        let path = Path(test_repo.id.clone());
        let result = get_repository(state, path).await;

        assert!(result.is_ok());
        let Json(repository) = result.unwrap();
        assert_eq!(repository.id, test_repo.id);
        assert_eq!(repository.name, "test-repo");
        assert_eq!(repository.github_id, 3001);
        assert_eq!(repository.stargazers_count, 42);
    }

    #[tokio::test]
    async fn test_get_repository_not_found() {
        let pool = setup_test_db().await;
        cleanup_repositories(&pool).await;

        let state = State(pool.clone());
        let path = Path(Uuid::new_v4().to_string());
        let result = get_repository(state, path).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::NotFound => (),
            _ => panic!("Expected NotFound error"),
        }
    }

    #[tokio::test]
    async fn test_create_repository_success() {
        let pool = setup_test_db().await;
        cleanup_repositories(&pool).await;

        let state = State(pool.clone());
        let payload = CreateRepository {
            github_id: 4001,
            name: "new-repo".to_string(),
            full_name: "test/new-repo".to_string(),
            description: Some("A new repository".to_string()),
            language: Some("Rust".to_string()),
            html_url: "https://github.com/test/new-repo".to_string(),
            stargazers_count: 100,
        };
        let result = create_repository(state, Json(payload)).await;

        assert!(result.is_ok());
        let (status, Json(repository)) = result.unwrap();
        assert_eq!(status, StatusCode::CREATED);
        assert_eq!(repository.name, "new-repo");
        assert_eq!(repository.github_id, 4001);
        assert!(!repository.id.is_empty());

        // Verify it was actually created in the database
        let saved_repo = sqlx::query_as!(
            Repository,
            r#"
            SELECT id, github_id, name, full_name, description, language, html_url, 
                   stargazers_count, connected_at, created_at, updated_at
            FROM repository
            WHERE id = $1
            "#,
            repository.id
        )
        .fetch_one(&pool)
        .await
        .expect("Failed to fetch created repository");

        assert_eq!(saved_repo.name, "new-repo");
        assert_eq!(saved_repo.github_id, 4001);
    }

    #[tokio::test]
    async fn test_create_repository_empty_name() {
        let pool = setup_test_db().await;
        cleanup_repositories(&pool).await;

        let state = State(pool.clone());
        let payload = CreateRepository {
            github_id: 4002,
            name: "".to_string(),
            full_name: "test/repo".to_string(),
            description: None,
            language: None,
            html_url: "https://github.com/test/repo".to_string(),
            stargazers_count: 0,
        };
        let result = create_repository(state, Json(payload)).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::BadRequest(msg) => {
                assert_eq!(msg, "Name, full_name, and html_url cannot be empty")
            }
            _ => panic!("Expected BadRequest error"),
        }
    }

    #[tokio::test]
    async fn test_create_repository_empty_full_name() {
        let pool = setup_test_db().await;
        cleanup_repositories(&pool).await;

        let state = State(pool.clone());
        let payload = CreateRepository {
            github_id: 4003,
            name: "repo".to_string(),
            full_name: "".to_string(),
            description: None,
            language: None,
            html_url: "https://github.com/test/repo".to_string(),
            stargazers_count: 0,
        };
        let result = create_repository(state, Json(payload)).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::BadRequest(msg) => {
                assert_eq!(msg, "Name, full_name, and html_url cannot be empty")
            }
            _ => panic!("Expected BadRequest error"),
        }
    }

    #[tokio::test]
    async fn test_create_repository_empty_html_url() {
        let pool = setup_test_db().await;
        cleanup_repositories(&pool).await;

        let state = State(pool.clone());
        let payload = CreateRepository {
            github_id: 4004,
            name: "repo".to_string(),
            full_name: "test/repo".to_string(),
            description: None,
            language: None,
            html_url: "".to_string(),
            stargazers_count: 0,
        };
        let result = create_repository(state, Json(payload)).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::BadRequest(msg) => {
                assert_eq!(msg, "Name, full_name, and html_url cannot be empty")
            }
            _ => panic!("Expected BadRequest error"),
        }
    }

    #[tokio::test]
    async fn test_create_repository_duplicate_github_id() {
        let pool = setup_test_db().await;
        cleanup_repositories(&pool).await;

        // Create first repository
        let _existing = create_test_repository(&pool, "existing-repo", 5001).await;

        // Try to create another repository with the same github_id
        let state = State(pool.clone());
        let payload = CreateRepository {
            github_id: 5001, // Same as existing
            name: "duplicate-repo".to_string(),
            full_name: "test/duplicate-repo".to_string(),
            description: None,
            language: None,
            html_url: "https://github.com/test/duplicate-repo".to_string(),
            stargazers_count: 0,
        };
        let result = create_repository(state, Json(payload)).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::BadRequest(msg) => {
                assert!(msg.contains("Repository with GitHub ID 5001 already exists"))
            }
            _ => panic!("Expected BadRequest error"),
        }
    }

    #[tokio::test]
    async fn test_update_repository_name() {
        let pool = setup_test_db().await;
        cleanup_repositories(&pool).await;

        let test_repo = create_test_repository(&pool, "original-name", 6001).await;
        let original_updated_at = test_repo.updated_at;

        // Wait a bit to ensure updated_at will be different
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

        let state = State(pool.clone());
        let path = Path(test_repo.id.clone());
        let payload = UpdateRepository {
            name: Some("updated-name".to_string()),
            full_name: None,
            description: None,
            language: None,
            html_url: None,
            stargazers_count: None,
        };
        let result = update_repository(state, path, Json(payload)).await;

        assert!(result.is_ok());
        let Json(updated) = result.unwrap();
        assert_eq!(updated.id, test_repo.id);
        assert_eq!(updated.name, "updated-name");
        assert_eq!(updated.github_id, 6001); // Should not change
        assert!(updated.updated_at > original_updated_at);
    }

    #[tokio::test]
    async fn test_update_repository_multiple_fields() {
        let pool = setup_test_db().await;
        cleanup_repositories(&pool).await;

        let test_repo = create_test_repository(&pool, "test-repo", 6002).await;

        let state = State(pool.clone());
        let path = Path(test_repo.id.clone());
        let payload = UpdateRepository {
            name: Some("new-name".to_string()),
            full_name: Some("test/new-name".to_string()),
            description: Some("Updated description".to_string()),
            language: Some("Python".to_string()),
            html_url: Some("https://github.com/test/new-name".to_string()),
            stargazers_count: Some(200),
        };
        let result = update_repository(state, path, Json(payload)).await;

        assert!(result.is_ok());
        let Json(updated) = result.unwrap();
        assert_eq!(updated.name, "new-name");
        assert_eq!(updated.full_name, "test/new-name");
        assert_eq!(updated.description, Some("Updated description".to_string()));
        assert_eq!(updated.language, Some("Python".to_string()));
        assert_eq!(updated.html_url, "https://github.com/test/new-name");
        assert_eq!(updated.stargazers_count, 200);
    }

    #[tokio::test]
    async fn test_update_repository_optional_fields() {
        let pool = setup_test_db().await;
        cleanup_repositories(&pool).await;

        // Create repository without optional fields
        let now = Utc::now();
        let repo = Repository::new(
            Uuid::new_v4().to_string(),
            6003,
            "test-repo".to_string(),
            "test/test-repo".to_string(),
            None,
            None,
            "https://github.com/test/test-repo".to_string(),
            0,
            now,
            now,
            now,
        );
        sqlx::query!(
            r#"
            INSERT INTO repository (
                id, github_id, name, full_name, description, language, 
                html_url, stargazers_count, connected_at, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            "#,
            repo.id,
            repo.github_id,
            repo.name,
            repo.full_name,
            repo.description,
            repo.language,
            repo.html_url,
            repo.stargazers_count,
            repo.connected_at,
            repo.created_at,
            repo.updated_at
        )
        .execute(&pool)
        .await
        .expect("Failed to create test repository");

        // Update with optional fields
        let state = State(pool.clone());
        let path = Path(repo.id.clone());
        let payload = UpdateRepository {
            name: None,
            full_name: None,
            description: Some("Now with description".to_string()),
            language: Some("Rust".to_string()),
            html_url: None,
            stargazers_count: None,
        };
        let result = update_repository(state, path, Json(payload)).await;

        assert!(result.is_ok());
        let Json(updated) = result.unwrap();
        assert_eq!(
            updated.description,
            Some("Now with description".to_string())
        );
        assert_eq!(updated.language, Some("Rust".to_string()));
    }

    #[tokio::test]
    async fn test_update_repository_not_found() {
        let pool = setup_test_db().await;
        cleanup_repositories(&pool).await;

        let state = State(pool.clone());
        let path = Path(Uuid::new_v4().to_string());
        let payload = UpdateRepository {
            name: Some("updated".to_string()),
            full_name: None,
            description: None,
            language: None,
            html_url: None,
            stargazers_count: None,
        };
        let result = update_repository(state, path, Json(payload)).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::NotFound => (),
            _ => panic!("Expected NotFound error"),
        }
    }

    #[tokio::test]
    async fn test_delete_repository_success() {
        let pool = setup_test_db().await;
        cleanup_repositories(&pool).await;

        // Create a repository to delete
        let test_repo = create_test_repository(&pool, "to-delete", 7001).await;

        let state = State(pool.clone());
        let path = Path(test_repo.id.clone());
        let result = delete_repository(state, path).await;

        assert!(result.is_ok());
        assert_eq!(result.unwrap(), StatusCode::NO_CONTENT);

        // Verify the repository was actually deleted
        let deleted_repo = sqlx::query!(
            r#"
            SELECT id FROM repository
            WHERE id = $1
            "#,
            test_repo.id
        )
        .fetch_optional(&pool)
        .await
        .expect("Failed to query deleted repository");

        assert!(deleted_repo.is_none());
    }

    #[tokio::test]
    async fn test_delete_repository_not_found() {
        let pool = setup_test_db().await;
        cleanup_repositories(&pool).await;

        let state = State(pool.clone());
        let path = Path(Uuid::new_v4().to_string());
        let result = delete_repository(state, path).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::NotFound => (),
            _ => panic!("Expected NotFound error"),
        }
    }

    #[tokio::test]
    async fn test_delete_repository_idempotent() {
        let pool = setup_test_db().await;
        cleanup_repositories(&pool).await;

        // Create and delete a repository
        let test_repo = create_test_repository(&pool, "to-delete", 7002).await;
        let state = State(pool.clone());
        let path = Path(test_repo.id.clone());

        // First deletion should succeed
        let result = delete_repository(state, path).await;
        assert!(result.is_ok());

        // Second deletion should return NotFound
        let state2 = State(pool.clone());
        let path2 = Path(test_repo.id.clone());
        let result2 = delete_repository(state2, path2).await;
        assert!(result2.is_err());
        match result2.unwrap_err() {
            ApiError::NotFound => (),
            _ => panic!("Expected NotFound error"),
        }
    }
}
