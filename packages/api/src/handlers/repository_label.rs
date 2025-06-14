use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use chrono::Utc;
use sqlx::PgPool;

use crate::error::ApiError;
use crate::models::{AddLabelToRepository, Label};

// Get all labels for a repository
pub async fn get_repository_labels(
    State(pool): State<PgPool>,
    Path(repo_id): Path<String>,
) -> Result<Json<Vec<Label>>, ApiError> {
    // First check if repository exists
    let repo_exists = sqlx::query!(
        r#"
        SELECT id FROM repository
        WHERE id = $1
        "#,
        repo_id
    )
    .fetch_optional(&pool)
    .await
    .map_err(ApiError::DbError)?;

    if repo_exists.is_none() {
        return Err(ApiError::NotFound);
    }

    // Get all labels for the repository
    let labels = sqlx::query_as!(
        Label,
        r#"
        SELECT l.id, l.name, l.description, l.color, l.created_at, l.updated_at
        FROM label l
        JOIN repository_label rl ON l.id = rl.label_id
        WHERE rl.repository_id = $1
        ORDER BY l.name ASC
        "#,
        repo_id
    )
    .fetch_all(&pool)
    .await
    .map_err(ApiError::DbError)?;

    Ok(Json(labels))
}

// Add a label to a repository
pub async fn add_label_to_repository(
    State(pool): State<PgPool>,
    Path(repo_id): Path<String>,
    Json(payload): Json<AddLabelToRepository>,
) -> Result<StatusCode, ApiError> {
    // Check if repository exists
    let repo_exists = sqlx::query!(
        r#"
        SELECT id FROM repository
        WHERE id = $1
        "#,
        repo_id
    )
    .fetch_optional(&pool)
    .await
    .map_err(ApiError::DbError)?;

    if repo_exists.is_none() {
        return Err(ApiError::NotFound);
    }

    // Check if label exists
    let label_exists = sqlx::query!(
        r#"
        SELECT id FROM label
        WHERE id = $1
        "#,
        payload.label_id
    )
    .fetch_optional(&pool)
    .await
    .map_err(ApiError::DbError)?;

    if label_exists.is_none() {
        return Err(ApiError::BadRequest(format!(
            "Label with ID {} does not exist",
            payload.label_id
        )));
    }

    // Check if the repository already has this label
    let relation_exists = sqlx::query!(
        r#"
        SELECT repository_id FROM repository_label
        WHERE repository_id = $1 AND label_id = $2
        "#,
        repo_id,
        payload.label_id
    )
    .fetch_optional(&pool)
    .await
    .map_err(ApiError::DbError)?;

    if relation_exists.is_some() {
        return Err(ApiError::BadRequest(
            "This label is already applied to the repository".into(),
        ));
    }

    // Add the label to the repository
    let now = Utc::now();
    sqlx::query!(
        r#"
        INSERT INTO repository_label (repository_id, label_id, created_at)
        VALUES ($1, $2, $3)
        "#,
        repo_id,
        payload.label_id,
        now
    )
    .execute(&pool)
    .await
    .map_err(ApiError::DbError)?;

    Ok(StatusCode::CREATED)
}

// Remove a label from a repository
pub async fn remove_label_from_repository(
    State(pool): State<PgPool>,
    Path((repo_id, label_id)): Path<(String, String)>,
) -> Result<StatusCode, ApiError> {
    // Check if the association exists
    let result = sqlx::query!(
        r#"
        DELETE FROM repository_label
        WHERE repository_id = $1 AND label_id = $2
        "#,
        repo_id,
        label_id
    )
    .execute(&pool)
    .await
    .map_err(ApiError::DbError)?;

    if result.rows_affected() == 0 {
        return Err(ApiError::NotFound);
    }

    Ok(StatusCode::NO_CONTENT)
}

// Get all repositories with a specific label
pub async fn get_repositories_by_label(
    State(pool): State<PgPool>,
    Path(label_id): Path<String>,
) -> Result<Json<Vec<crate::models::Repository>>, ApiError> {
    // First check if label exists
    let label_exists = sqlx::query!(
        r#"
        SELECT id FROM label
        WHERE id = $1
        "#,
        label_id
    )
    .fetch_optional(&pool)
    .await
    .map_err(ApiError::DbError)?;

    if label_exists.is_none() {
        return Err(ApiError::NotFound);
    }

    // Get all repositories with the label
    let repositories = sqlx::query_as!(
        crate::models::Repository,
        r#"
        SELECT r.id, r.github_id, r.name, r.full_name, r.description, r.language, 
               r.html_url, r.stargazers_count, r.connected_at, r.created_at, r.updated_at
        FROM repository r
        JOIN repository_label rl ON r.id = rl.repository_id
        WHERE rl.label_id = $1
        ORDER BY r.name ASC
        "#,
        label_id
    )
    .fetch_all(&pool)
    .await
    .map_err(ApiError::DbError)?;

    Ok(Json(repositories))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{CreateLabel, CreateRepository, Label, Repository};
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

    async fn cleanup_repository_labels(pool: &PgPool) {
        sqlx::query("DELETE FROM repository_label")
            .execute(pool)
            .await
            .expect("Failed to clean up repository_label table");
    }

    async fn cleanup_repositories(pool: &PgPool) {
        sqlx::query("DELETE FROM repository")
            .execute(pool)
            .await
            .expect("Failed to clean up repository table");
    }

    async fn cleanup_labels(pool: &PgPool) {
        sqlx::query("DELETE FROM label")
            .execute(pool)
            .await
            .expect("Failed to clean up label table");
    }

    async fn cleanup_all(pool: &PgPool) {
        cleanup_repository_labels(pool).await;
        cleanup_repositories(pool).await;
        cleanup_labels(pool).await;
    }

    // Helper function to create a test repository
    async fn create_test_repository(pool: &PgPool, name: &str) -> Repository {
        let now = Utc::now();
        let repo = Repository::new(
            uuid::Uuid::new_v4().to_string(),
            12345,
            name.to_string(),
            format!("user/{}", name),
            Some("Test repository description".to_string()),
            Some("Rust".to_string()),
            format!("https://github.com/user/{}", name),
            42,
            now,
            now,
            now,
        );

        sqlx::query!(
            r#"
            INSERT INTO repository (id, github_id, name, full_name, description, language, 
                                  html_url, stargazers_count, connected_at, created_at, updated_at)
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
        .execute(pool)
        .await
        .expect("Failed to create test repository");

        repo
    }

    // Helper function to create a test label
    async fn create_test_label(pool: &PgPool, name: &str) -> Label {
        let label = Label::new(CreateLabel {
            name: name.to_string(),
            description: Some(format!("Description for {}", name)),
            color: Some("#FF0000".to_string()),
        });

        sqlx::query!(
            r#"
            INSERT INTO label (id, name, description, color, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            "#,
            label.id,
            label.name,
            label.description,
            label.color,
            label.created_at,
            label.updated_at
        )
        .execute(pool)
        .await
        .expect("Failed to create test label");

        label
    }

    // Helper function to add label to repository
    async fn add_test_label_to_repository(pool: &PgPool, repo_id: &str, label_id: &str) {
        let now = Utc::now();
        sqlx::query!(
            r#"
            INSERT INTO repository_label (repository_id, label_id, created_at)
            VALUES ($1, $2, $3)
            "#,
            repo_id,
            label_id,
            now
        )
        .execute(pool)
        .await
        .expect("Failed to add test label to repository");
    }

    #[tokio::test]
    async fn test_get_repository_labels_empty() {
        let pool = setup_test_db().await;
        cleanup_all(&pool).await;

        // Create a repository without any labels
        let repo = create_test_repository(&pool, "test-repo").await;

        let state = State(pool.clone());
        let path = Path(repo.id.clone());
        let result = get_repository_labels(state, path).await;

        assert!(result.is_ok());
        let Json(labels) = result.unwrap();
        assert_eq!(labels.len(), 0);
    }

    #[tokio::test]
    async fn test_get_repository_labels_with_data() {
        let pool = setup_test_db().await;
        cleanup_all(&pool).await;

        // Create a repository and labels
        let repo = create_test_repository(&pool, "test-repo").await;
        let label1 = create_test_label(&pool, "bug").await;
        let label2 = create_test_label(&pool, "feature").await;

        // Add labels to repository
        add_test_label_to_repository(&pool, &repo.id, &label1.id).await;
        add_test_label_to_repository(&pool, &repo.id, &label2.id).await;

        let state = State(pool.clone());
        let path = Path(repo.id.clone());
        let result = get_repository_labels(state, path).await;

        assert!(result.is_ok());
        let Json(labels) = result.unwrap();
        assert_eq!(labels.len(), 2);
        // Should be ordered by name ASC
        assert_eq!(labels[0].name, "bug");
        assert_eq!(labels[1].name, "feature");
    }

    #[tokio::test]
    async fn test_get_repository_labels_not_found() {
        let pool = setup_test_db().await;
        cleanup_all(&pool).await;

        let state = State(pool.clone());
        let path = Path(uuid::Uuid::new_v4().to_string());
        let result = get_repository_labels(state, path).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::NotFound => (),
            _ => panic!("Expected NotFound error"),
        }
    }

    #[tokio::test]
    async fn test_add_label_to_repository_success() {
        let pool = setup_test_db().await;
        cleanup_all(&pool).await;

        // Create repository and label
        let repo = create_test_repository(&pool, "test-repo").await;
        let label = create_test_label(&pool, "important").await;

        let state = State(pool.clone());
        let path = Path(repo.id.clone());
        let payload = AddLabelToRepository {
            label_id: label.id.clone(),
        };
        let result = add_label_to_repository(state, path, Json(payload)).await;

        assert!(result.is_ok());
        assert_eq!(result.unwrap(), StatusCode::CREATED);

        // Verify the label was added
        let relation = sqlx::query!(
            r#"
            SELECT repository_id, label_id
            FROM repository_label
            WHERE repository_id = $1 AND label_id = $2
            "#,
            repo.id,
            label.id
        )
        .fetch_optional(&pool)
        .await
        .expect("Failed to query repository_label");

        assert!(relation.is_some());
    }

    #[tokio::test]
    async fn test_add_label_to_repository_repo_not_found() {
        let pool = setup_test_db().await;
        cleanup_all(&pool).await;

        // Create only a label
        let label = create_test_label(&pool, "orphan").await;

        let state = State(pool.clone());
        let path = Path(uuid::Uuid::new_v4().to_string());
        let payload = AddLabelToRepository { label_id: label.id };
        let result = add_label_to_repository(state, path, Json(payload)).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::NotFound => (),
            _ => panic!("Expected NotFound error"),
        }
    }

    #[tokio::test]
    async fn test_add_label_to_repository_label_not_found() {
        let pool = setup_test_db().await;
        cleanup_all(&pool).await;

        // Create only a repository
        let repo = create_test_repository(&pool, "test-repo").await;

        let state = State(pool.clone());
        let path = Path(repo.id);
        let payload = AddLabelToRepository {
            label_id: uuid::Uuid::new_v4().to_string(),
        };
        let result = add_label_to_repository(state, path, Json(payload)).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::BadRequest(msg) => assert!(msg.contains("does not exist")),
            _ => panic!("Expected BadRequest error"),
        }
    }

    #[tokio::test]
    async fn test_add_label_to_repository_duplicate() {
        let pool = setup_test_db().await;
        cleanup_all(&pool).await;

        // Create repository and label
        let repo = create_test_repository(&pool, "test-repo").await;
        let label = create_test_label(&pool, "duplicate").await;

        // Add label first time
        add_test_label_to_repository(&pool, &repo.id, &label.id).await;

        // Try to add same label again
        let state = State(pool.clone());
        let path = Path(repo.id);
        let payload = AddLabelToRepository { label_id: label.id };
        let result = add_label_to_repository(state, path, Json(payload)).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::BadRequest(msg) => assert!(msg.contains("already applied")),
            _ => panic!("Expected BadRequest error"),
        }
    }

    #[tokio::test]
    async fn test_remove_label_from_repository_success() {
        let pool = setup_test_db().await;
        cleanup_all(&pool).await;

        // Create repository and label
        let repo = create_test_repository(&pool, "test-repo").await;
        let label = create_test_label(&pool, "removable").await;

        // Add label to repository
        add_test_label_to_repository(&pool, &repo.id, &label.id).await;

        let state = State(pool.clone());
        let path = Path((repo.id.clone(), label.id.clone()));
        let result = remove_label_from_repository(state, path).await;

        assert!(result.is_ok());
        assert_eq!(result.unwrap(), StatusCode::NO_CONTENT);

        // Verify the label was removed
        let relation = sqlx::query!(
            r#"
            SELECT repository_id
            FROM repository_label
            WHERE repository_id = $1 AND label_id = $2
            "#,
            repo.id,
            label.id
        )
        .fetch_optional(&pool)
        .await
        .expect("Failed to query repository_label");

        assert!(relation.is_none());
    }

    #[tokio::test]
    async fn test_remove_label_from_repository_not_found() {
        let pool = setup_test_db().await;
        cleanup_all(&pool).await;

        let state = State(pool.clone());
        let path = Path((
            uuid::Uuid::new_v4().to_string(),
            uuid::Uuid::new_v4().to_string(),
        ));
        let result = remove_label_from_repository(state, path).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::NotFound => (),
            _ => panic!("Expected NotFound error"),
        }
    }

    #[tokio::test]
    async fn test_get_repositories_by_label_empty() {
        let pool = setup_test_db().await;
        cleanup_all(&pool).await;

        // Create a label without any repositories
        let label = create_test_label(&pool, "unused").await;

        let state = State(pool.clone());
        let path = Path(label.id);
        let result = get_repositories_by_label(state, path).await;

        assert!(result.is_ok());
        let Json(repositories) = result.unwrap();
        assert_eq!(repositories.len(), 0);
    }

    #[tokio::test]
    async fn test_get_repositories_by_label_with_data() {
        let pool = setup_test_db().await;
        cleanup_all(&pool).await;

        // Create label and repositories
        let label = create_test_label(&pool, "rust").await;
        let repo1 = create_test_repository(&pool, "project-a").await;
        let repo2 = create_test_repository(&pool, "project-b").await;

        // Add label to both repositories
        add_test_label_to_repository(&pool, &repo1.id, &label.id).await;
        add_test_label_to_repository(&pool, &repo2.id, &label.id).await;

        let state = State(pool.clone());
        let path = Path(label.id);
        let result = get_repositories_by_label(state, path).await;

        assert!(result.is_ok());
        let Json(repositories) = result.unwrap();
        assert_eq!(repositories.len(), 2);
        // Should be ordered by name ASC
        assert_eq!(repositories[0].name, "project-a");
        assert_eq!(repositories[1].name, "project-b");
    }

    #[tokio::test]
    async fn test_get_repositories_by_label_not_found() {
        let pool = setup_test_db().await;
        cleanup_all(&pool).await;

        let state = State(pool.clone());
        let path = Path(uuid::Uuid::new_v4().to_string());
        let result = get_repositories_by_label(state, path).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::NotFound => (),
            _ => panic!("Expected NotFound error"),
        }
    }
}
