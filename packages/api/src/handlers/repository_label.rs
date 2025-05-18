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
