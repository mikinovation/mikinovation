use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use chrono::Utc;
use sqlx::PgPool;

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

    let repository = Repository::new(payload);

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
